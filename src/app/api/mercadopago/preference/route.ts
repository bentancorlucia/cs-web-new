import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPreference } from "@/lib/mercadopago";

const SITE_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

interface OrderItem {
  producto_id: string;
  variante_id: string | null;
  cantidad: number;
  nombre: string;
  precio: number;
}

interface CustomerData {
  email: string;
  nombre_completo: string;
  telefono?: string;
  direccion_envio?: string;
  ciudad?: string;
  departamento?: string;
  codigo_postal?: string;
  notas?: string;
}

interface RequestBody {
  customer: CustomerData;
  shipping_method_id: string;
  items: OrderItem[];
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { customer, shipping_method_id, items } = body;

    if (!customer?.email || !items?.length || !shipping_method_id) {
      return NextResponse.json(
        { message: "Datos incompletos" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user (optional - guest checkout allowed)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get shipping method
    const { data: shippingMethod, error: shippingError } = await supabase
      .from("metodos_envio")
      .select("*")
      .eq("id", shipping_method_id)
      .single();

    if (shippingError || !shippingMethod) {
      return NextResponse.json(
        { message: "Método de envío no encontrado" },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum, item) => sum + item.precio * item.cantidad,
      0
    );
    const shippingCost = shippingMethod.precio || 0;
    const total = subtotal + shippingCost;

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from("pedidos")
      .insert({
        user_id: user?.id || null,
        email: customer.email,
        nombre_completo: customer.nombre_completo,
        telefono: customer.telefono,
        direccion_envio: customer.direccion_envio,
        ciudad: customer.ciudad,
        departamento: customer.departamento,
        codigo_postal: customer.codigo_postal,
        notas: customer.notas,
        subtotal,
        costo_envio: shippingCost,
        descuento: 0,
        total,
        estado: "pendiente",
        metodo_envio_id: shipping_method_id,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Error creating order:", orderError);
      return NextResponse.json(
        { message: "Error al crear el pedido" },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = items.map((item) => ({
      pedido_id: order.id,
      producto_id: item.producto_id,
      variante_id: item.variante_id,
      nombre_producto: item.nombre,
      precio_unitario: item.precio,
      cantidad: item.cantidad,
      subtotal: item.precio * item.cantidad,
    }));

    const { error: itemsError } = await supabase
      .from("items_pedido")
      .insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      // Delete the order if items failed
      await supabase.from("pedidos").delete().eq("id", order.id);
      return NextResponse.json(
        { message: "Error al crear los items del pedido" },
        { status: 500 }
      );
    }

    // Create MercadoPago preference
    const preference = await createPreference({
      items: [
        ...items.map((item) => ({
          id: item.producto_id,
          title: item.nombre,
          quantity: item.cantidad,
          currency_id: "UYU",
          unit_price: item.precio,
        })),
        // Add shipping as a line item if cost > 0
        ...(shippingCost > 0
          ? [
              {
                id: "shipping",
                title: `Envío - ${shippingMethod.nombre}`,
                quantity: 1,
                currency_id: "UYU",
                unit_price: shippingCost,
              },
            ]
          : []),
      ],
      payer: {
        email: customer.email,
        name: customer.nombre_completo.split(" ")[0],
        surname: customer.nombre_completo.split(" ").slice(1).join(" "),
        phone: customer.telefono
          ? {
              number: customer.telefono,
            }
          : undefined,
        address: customer.direccion_envio
          ? {
              street_name: customer.direccion_envio,
              zip_code: customer.codigo_postal,
            }
          : undefined,
      },
      external_reference: order.id,
      back_urls: {
        success: `${SITE_URL}/tienda/checkout/resultado?status=success&order=${order.numero_pedido}`,
        failure: `${SITE_URL}/tienda/checkout/resultado?status=failure&order=${order.numero_pedido}`,
        pending: `${SITE_URL}/tienda/checkout/resultado?status=pending&order=${order.numero_pedido}`,
      },
      notification_url: `${SITE_URL}/api/mercadopago/webhook`,
      statement_descriptor: "CLUB SEMINARIO",
    });

    // Update order with MercadoPago preference ID
    await supabase
      .from("pedidos")
      .update({ mercadopago_preference_id: preference.id })
      .eq("id", order.id);

    return NextResponse.json({
      order_id: order.id,
      order_number: order.numero_pedido,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
    });
  } catch (error) {
    console.error("Preference creation error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Error al procesar el pedido",
      },
      { status: 500 }
    );
  }
}
