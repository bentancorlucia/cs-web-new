import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getPayment, isPaymentApproved } from "@/lib/mercadopago";

// Use service role for webhook processing
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // MercadoPago sends different notification types
    // We only care about payment notifications
    if (body.type !== "payment") {
      return NextResponse.json({ received: true });
    }

    const paymentId = body.data?.id;

    if (!paymentId) {
      console.error("Webhook missing payment ID:", body);
      return NextResponse.json(
        { message: "Missing payment ID" },
        { status: 400 }
      );
    }

    // Get payment details from MercadoPago
    const payment = await getPayment(paymentId.toString());

    // The external_reference is our order ID
    const orderId = payment.external_reference;

    if (!orderId) {
      console.error("Payment missing external_reference:", payment);
      return NextResponse.json(
        { message: "Missing order reference" },
        { status: 400 }
      );
    }

    // Get the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("pedidos")
      .select("*, items:items_pedido(*)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Order not found:", orderId, orderError);
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    // Skip if already processed
    if (order.estado === "pagado" || order.mercadopago_payment_id === paymentId.toString()) {
      return NextResponse.json({ received: true, status: "already_processed" });
    }

    // Update order based on payment status
    if (isPaymentApproved(payment)) {
      // Update order status to paid
      const { error: updateError } = await supabaseAdmin
        .from("pedidos")
        .update({
          estado: "pagado",
          metodo_pago: "mercadopago",
          mercadopago_payment_id: paymentId.toString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (updateError) {
        console.error("Error updating order:", updateError);
        return NextResponse.json(
          { message: "Error updating order" },
          { status: 500 }
        );
      }

      // Update stock for each item
      for (const item of order.items) {
        if (item.variante_id) {
          // Update variant stock
          await supabaseAdmin.rpc("decrement_variant_stock", {
            p_variant_id: item.variante_id,
            p_quantity: item.cantidad,
          });
        } else {
          // Update product stock directly
          await supabaseAdmin.rpc("decrement_product_stock", {
            p_product_id: item.producto_id,
            p_quantity: item.cantidad,
          });
        }
      }

      console.log(`Order ${order.numero_pedido} paid successfully`);
    } else if (payment.status === "rejected" || payment.status === "cancelled") {
      // Update order status to cancelled
      await supabaseAdmin
        .from("pedidos")
        .update({
          estado: "cancelado",
          mercadopago_payment_id: paymentId.toString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      console.log(`Order ${order.numero_pedido} cancelled/rejected`);
    }

    return NextResponse.json({
      received: true,
      order_id: orderId,
      payment_status: payment.status,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Error processing webhook",
      },
      { status: 500 }
    );
  }
}

// MercadoPago also sends GET requests to verify the endpoint
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
