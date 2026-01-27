import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getPayment, isPaymentApproved } from "@/lib/mercadopago";
import {
  sendOrderConfirmationEmail,
  sendTicketEmail,
  type OrderEmailData,
  type TicketEmailData,
} from "@/lib/resend";

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

    // The external_reference can be either:
    // 1. A simple order ID (for shop orders)
    // 2. A JSON string with type "entradas" (for event tickets)
    const externalRef = payment.external_reference;

    if (!externalRef) {
      console.error("Payment missing external_reference:", payment);
      return NextResponse.json(
        { message: "Missing order reference" },
        { status: 400 }
      );
    }

    // Try to parse as JSON (for tickets)
    let parsedRef: { type?: string; entradas_ids?: string[]; user_id?: string } | null = null;
    try {
      parsedRef = JSON.parse(externalRef);
    } catch {
      // Not JSON, treat as order ID
    }

    // Handle ticket payments
    if (parsedRef?.type === "entradas" && parsedRef.entradas_ids) {
      if (isPaymentApproved(payment)) {
        return handleTicketPayment(parsedRef.entradas_ids, paymentId.toString());
      } else if (payment.status === "rejected" || payment.status === "cancelled") {
        // Cancel the tickets
        await supabaseAdmin
          .from("entradas")
          .update({ estado: "cancelada" })
          .in("id", parsedRef.entradas_ids);
      }
      return NextResponse.json({ received: true, type: "entradas" });
    }

    // Handle shop order payments
    const orderId = externalRef;

    // Get the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("pedidos")
      .select("*, items:items_pedido(*), metodo_envio:metodos_envio(nombre)")
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

      // Send confirmation email
      try {
        const emailData: OrderEmailData = {
          numeroPedido: order.numero_pedido,
          nombreCliente: order.nombre_completo,
          email: order.email,
          items: order.items.map((item: {
            nombre_producto: string;
            cantidad: number;
            precio_unitario: number;
            talla?: string | null;
            color?: string | null;
          }) => ({
            nombre: item.nombre_producto,
            cantidad: item.cantidad,
            precio: item.precio_unitario,
            talla: item.talla,
            color: item.color,
          })),
          subtotal: order.subtotal,
          costoEnvio: order.costo_envio,
          descuento: order.descuento || undefined,
          total: order.total,
          metodoEnvio: order.metodo_envio?.nombre,
          direccion: order.direccion_envio || undefined,
          ciudad: order.ciudad || undefined,
          departamento: order.departamento || undefined,
        };
        await sendOrderConfirmationEmail(emailData);
        console.log(`Confirmation email sent for order ${order.numero_pedido}`);
      } catch (emailError) {
        console.error("Error sending order confirmation email:", emailError);
        // Don't fail the webhook for email errors
      }
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

// Handle ticket payment approval
async function handleTicketPayment(entradasIds: string[], paymentId: string) {
  try {
    // Get ticket details with event info
    const { data: entradas, error } = await supabaseAdmin
      .from("entradas")
      .select(`
        id,
        codigo_qr,
        nombre_asistente,
        email_asistente,
        estado,
        evento:eventos_sociales(id, titulo, slug, fecha_evento, hora_apertura, ubicacion, direccion),
        tipo_entrada:tipos_entrada(nombre)
      `)
      .in("id", entradasIds);

    if (error || !entradas) {
      console.error("Error fetching tickets:", error);
      return NextResponse.json({ error: "Error fetching tickets" }, { status: 500 });
    }

    // Skip if already processed
    if (entradas.every((e) => e.estado === "valida")) {
      return NextResponse.json({ received: true, status: "already_processed" });
    }

    // Update ticket status to valid
    const { error: updateError } = await supabaseAdmin
      .from("entradas")
      .update({ estado: "valida" })
      .in("id", entradasIds)
      .eq("estado", "pendiente");

    if (updateError) {
      console.error("Error updating tickets:", updateError);
      return NextResponse.json({ error: "Error updating tickets" }, { status: 500 });
    }

    // Send email for each ticket
    for (const entrada of entradas) {
      if (!entrada.email_asistente || !entrada.evento) continue;

      try {
        const evento = entrada.evento as unknown as {
          titulo: string;
          slug: string;
          fecha_evento: string;
          hora_apertura?: string;
          ubicacion?: string;
          direccion?: string;
        };

        const emailData: TicketEmailData = {
          nombreAsistente: entrada.nombre_asistente,
          email: entrada.email_asistente,
          evento: {
            titulo: evento.titulo,
            fecha: evento.fecha_evento,
            hora: evento.hora_apertura || undefined,
            ubicacion: evento.ubicacion || undefined,
            direccion: evento.direccion || undefined,
            slug: evento.slug,
          },
          entrada: {
            tipoNombre: (entrada.tipo_entrada as unknown as { nombre: string })?.nombre || "Entrada",
            codigoQR: entrada.codigo_qr,
          },
        };

        await sendTicketEmail(emailData);
        console.log(`Ticket email sent to ${entrada.email_asistente}`);
      } catch (emailError) {
        console.error(`Error sending ticket email to ${entrada.email_asistente}:`, emailError);
        // Don't fail the webhook for email errors
      }
    }

    return NextResponse.json({
      received: true,
      type: "entradas",
      processed: entradasIds.length,
    });
  } catch (error) {
    console.error("Error handling ticket payment:", error);
    return NextResponse.json({ error: "Error processing tickets" }, { status: 500 });
  }
}

// MercadoPago also sends GET requests to verify the endpoint
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
