import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPreference } from "@/lib/mercadopago";
import { sendTicketEmail, type TicketEmailData } from "@/lib/resend";
import crypto from "crypto";

const SITE_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

interface Asistente {
  nombre: string;
  cedula: string;
  email: string;
  telefono?: string;
}

interface TicketSelection {
  tipoEntradaId: string;
  cantidad: number;
  precio: number;
  asistentes: Asistente[];
}

interface RequestBody {
  eventoId: string;
  selections: TicketSelection[];
  total: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { eventoId, selections, total } = body;

    if (!eventoId || !selections?.length) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user (required for ticket purchases)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para comprar entradas" },
        { status: 401 }
      );
    }

    // Get event details
    const { data: evento, error: eventoError } = await supabase
      .from("eventos_sociales")
      .select("id, titulo, slug, solo_socios, fecha_evento")
      .eq("id", eventoId)
      .single();

    if (eventoError || !evento) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    // Check if event is in the past
    if (new Date(evento.fecha_evento) < new Date()) {
      return NextResponse.json(
        { error: "Este evento ya pasó" },
        { status: 400 }
      );
    }

    // If event is solo_socios, check user role
    if (evento.solo_socios) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("rol")
        .eq("id", user.id)
        .single();

      if (!["socio", "admin", "directivo"].includes(profile?.rol || "")) {
        return NextResponse.json(
          { error: "Este evento es exclusivo para socios" },
          { status: 403 }
        );
      }
    }

    // Validate all ticket types and check availability
    const ticketTypeIds = selections.map((s) => s.tipoEntradaId);
    const { data: tiposEntrada, error: tiposError } = await supabase
      .from("tipos_entrada")
      .select("*, lote:lotes_entrada(id, nombre, fecha_inicio, fecha_fin, cantidad_maxima, activo)")
      .in("id", ticketTypeIds);

    if (tiposError || !tiposEntrada) {
      return NextResponse.json(
        { error: "Error al validar tipos de entrada" },
        { status: 500 }
      );
    }

    // Group selections by lote to validate lote quantity limits
    const selectionsByLote: Record<string, { total: number; lote: typeof tiposEntrada[0]['lote'] }> = {};

    // Validate each selection
    for (const selection of selections) {
      const tipo = tiposEntrada.find((t) => t.id === selection.tipoEntradaId);

      if (!tipo) {
        return NextResponse.json(
          { error: `Tipo de entrada no encontrado` },
          { status: 400 }
        );
      }

      // Check lote date validity
      const now = new Date();
      const loteInicio = new Date(tipo.lote.fecha_inicio);
      const loteFin = new Date(tipo.lote.fecha_fin);

      if (!tipo.lote.activo || now < loteInicio || now > loteFin) {
        return NextResponse.json(
          { error: `El lote "${tipo.lote.nombre}" no está disponible actualmente` },
          { status: 400 }
        );
      }

      const disponibles = tipo.cantidad_total - tipo.cantidad_vendida;
      if (selection.cantidad > disponibles) {
        return NextResponse.json(
          { error: `No hay suficientes entradas disponibles para "${tipo.nombre}"` },
          { status: 400 }
        );
      }

      if (selection.cantidad > tipo.max_por_compra) {
        return NextResponse.json(
          { error: `Máximo ${tipo.max_por_compra} entradas por compra para "${tipo.nombre}"` },
          { status: 400 }
        );
      }

      // Validate attendee data
      if (selection.asistentes.length !== selection.cantidad) {
        return NextResponse.json(
          { error: "Faltan datos de asistentes" },
          { status: 400 }
        );
      }

      // Track totals by lote for cantidad_maxima validation
      if (!selectionsByLote[tipo.lote_id]) {
        selectionsByLote[tipo.lote_id] = { total: 0, lote: tipo.lote };
      }
      selectionsByLote[tipo.lote_id].total += selection.cantidad;
    }

    // Validate lote quantity limits
    for (const [loteId, { total, lote }] of Object.entries(selectionsByLote)) {
      if (lote.cantidad_maxima) {
        // Get current total sold for this lote
        const { data: loteStats } = await supabase
          .from("tipos_entrada")
          .select("cantidad_vendida")
          .eq("lote_id", loteId);

        const currentSold = loteStats?.reduce((sum, t) => sum + t.cantidad_vendida, 0) || 0;
        const disponiblesLote = lote.cantidad_maxima - currentSold;

        if (total > disponiblesLote) {
          return NextResponse.json(
            { error: `No hay suficientes entradas disponibles en el lote "${lote.nombre}"` },
            { status: 400 }
          );
        }
      }
    }

    // Create entries in database
    const entradas = [];

    for (const selection of selections) {
      const tipo = tiposEntrada.find((t) => t.id === selection.tipoEntradaId);

      for (const asistente of selection.asistentes) {
        const codigoQR = `CS-${evento.id.slice(0, 8)}-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
        const tokenValidacion = crypto.randomBytes(16).toString("hex");

        entradas.push({
          evento_id: eventoId,
          lote_id: tipo?.lote_id,
          tipo_entrada_id: selection.tipoEntradaId,
          user_id: user.id,
          codigo_qr: codigoQR,
          token_validacion: tokenValidacion,
          nombre_asistente: asistente.nombre,
          cedula_asistente: asistente.cedula,
          email_asistente: asistente.email,
          telefono_asistente: asistente.telefono || null,
          estado: total > 0 ? "pendiente" : "valida", // Mark as valid if free
          fecha_compra: new Date().toISOString(),
        });
      }
    }

    // Insert entries
    const { data: createdEntradas, error: entradasError } = await supabase
      .from("entradas")
      .insert(entradas)
      .select("id");

    if (entradasError) {
      console.error("Error creating entradas:", entradasError);
      console.error("Entradas data:", JSON.stringify(entradas, null, 2));
      return NextResponse.json(
        { error: `Error al crear las entradas: ${entradasError.message}` },
        { status: 500 }
      );
    }

    // Update stock for each ticket type
    for (const selection of selections) {
      await supabase.rpc("increment_vendidas", {
        tipo_id: selection.tipoEntradaId,
        cantidad: selection.cantidad,
      });
    }

    // If total is 0 (free event), send tickets immediately and return success
    if (total === 0) {
      // Send ticket emails for free events
      for (let i = 0; i < entradas.length; i++) {
        const entrada = entradas[i];
        const createdEntrada = createdEntradas?.[i];
        if (!entrada.email_asistente || !createdEntrada) continue;

        const tipo = tiposEntrada.find((t) => t.id === entrada.tipo_entrada_id);

        try {
          const emailData: TicketEmailData = {
            nombreAsistente: entrada.nombre_asistente,
            email: entrada.email_asistente,
            evento: {
              titulo: evento.titulo,
              fecha: evento.fecha_evento,
              slug: evento.slug,
            },
            entrada: {
              tipoNombre: tipo?.nombre || "Entrada",
              codigoQR: entrada.codigo_qr,
            },
          };

          await sendTicketEmail(emailData);
        } catch (emailError) {
          console.error(`Error sending free ticket email:`, emailError);
        }
      }

      return NextResponse.json({
        success: true,
        entradas: createdEntradas,
      });
    }

    // Create MercadoPago preference for paid events
    const mpItems = selections.flatMap((selection) => {
      const tipo = tiposEntrada.find((t) => t.id === selection.tipoEntradaId);
      return {
        id: selection.tipoEntradaId,
        title: `${evento.titulo} - ${tipo?.nombre || "Entrada"}`,
        quantity: selection.cantidad,
        currency_id: "UYU",
        unit_price: selection.precio,
      };
    });

    const externalReference = JSON.stringify({
      type: "entradas",
      entradas_ids: createdEntradas?.map((e) => e.id) || [],
      user_id: user.id,
    });

    const preference = await createPreference({
      items: mpItems,
      payer: {
        email: user.email || "",
      },
      external_reference: externalReference,
      back_urls: {
        success: `${SITE_URL}/eventos/${evento.slug}/checkout?status=success`,
        failure: `${SITE_URL}/eventos/${evento.slug}/checkout?status=failure`,
        pending: `${SITE_URL}/eventos/${evento.slug}/checkout?status=pending`,
      },
      notification_url: `${SITE_URL}/api/mercadopago/webhook`,
      statement_descriptor: "CLUB SEMINARIO",
    });

    return NextResponse.json({
      success: true,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
    });
  } catch (error) {
    console.error("Error creating ticket order:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al procesar el pedido",
      },
      { status: 500 }
    );
  }
}
