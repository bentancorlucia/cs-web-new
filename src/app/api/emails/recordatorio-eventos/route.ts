import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEventReminderEmail, type EventReminderData } from "@/lib/resend";

// This endpoint should be called by a cron job (e.g., Vercel Cron)
// It sends reminders for events happening in the next 24 hours

// Use service role for querying all entries
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Secret key to protect the endpoint
const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get events happening in the next 24-48 hours
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const { data: eventos, error: eventosError } = await supabaseAdmin
      .from("eventos_sociales")
      .select("id, titulo, slug, fecha_evento, hora_apertura, ubicacion, direccion")
      .gte("fecha_evento", tomorrow.toISOString().split("T")[0])
      .lt("fecha_evento", dayAfter.toISOString().split("T")[0])
      .eq("activo", true);

    if (eventosError) {
      console.error("Error fetching events:", eventosError);
      return NextResponse.json(
        { error: "Error fetching events" },
        { status: 500 }
      );
    }

    if (!eventos || eventos.length === 0) {
      return NextResponse.json({
        message: "No events tomorrow",
        sent: 0,
      });
    }

    let totalSent = 0;
    const errors: string[] = [];

    // For each event, get all valid entries and send reminders
    for (const evento of eventos) {
      // Get all valid entries for this event, grouped by user
      const { data: entradas, error: entradasError } = await supabaseAdmin
        .from("entradas")
        .select(`
          id,
          codigo_qr,
          nombre_asistente,
          email_asistente,
          user_id,
          tipo_entrada:tipos_entrada(nombre)
        `)
        .eq("evento_id", evento.id)
        .eq("estado", "valida");

      if (entradasError) {
        console.error(`Error fetching entries for event ${evento.id}:`, entradasError);
        errors.push(`Event ${evento.id}: ${entradasError.message}`);
        continue;
      }

      if (!entradas || entradas.length === 0) {
        continue;
      }

      // Group entries by email
      const entriesByEmail: Record<string, typeof entradas> = {};
      for (const entrada of entradas) {
        const email = entrada.email_asistente;
        if (email) {
          if (!entriesByEmail[email]) {
            entriesByEmail[email] = [];
          }
          entriesByEmail[email].push(entrada);
        }
      }

      // Send reminder to each unique email
      for (const [email, userEntradas] of Object.entries(entriesByEmail)) {
        const reminderData: EventReminderData = {
          nombreAsistente: userEntradas[0].nombre_asistente,
          email,
          evento: {
            titulo: evento.titulo,
            fecha: evento.fecha_evento,
            hora: evento.hora_apertura || undefined,
            ubicacion: evento.ubicacion || undefined,
            direccion: evento.direccion || undefined,
            slug: evento.slug,
          },
          entradas: userEntradas.map((e) => ({
            tipoNombre: (e.tipo_entrada as unknown as { nombre: string })?.nombre || "Entrada",
            codigoQR: e.codigo_qr,
          })),
        };

        try {
          await sendEventReminderEmail(reminderData);
          totalSent++;
        } catch (emailError) {
          console.error(`Error sending reminder to ${email}:`, emailError);
          errors.push(`Email to ${email}: ${emailError}`);
        }
      }
    }

    return NextResponse.json({
      message: "Reminders processed",
      events: eventos.length,
      sent: totalSent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Reminder cron error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Allow GET for testing (without actually sending)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get events happening tomorrow
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const { data: eventos, error } = await supabaseAdmin
    .from("eventos_sociales")
    .select("id, titulo, fecha_evento")
    .gte("fecha_evento", tomorrow.toISOString().split("T")[0])
    .lt("fecha_evento", dayAfter.toISOString().split("T")[0])
    .eq("activo", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Count entries per event
  const eventCounts = await Promise.all(
    (eventos || []).map(async (evento) => {
      const { count } = await supabaseAdmin
        .from("entradas")
        .select("*", { count: "exact", head: true })
        .eq("evento_id", evento.id)
        .eq("estado", "valida");

      return {
        ...evento,
        entradas_count: count || 0,
      };
    })
  );

  return NextResponse.json({
    message: "Preview of events with reminders due",
    events: eventCounts,
  });
}
