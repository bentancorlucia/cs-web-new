import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RequestBody {
  codigo: string;
  eventoId: string;
}

type ValidationResult = "valida" | "ya_usada" | "cancelada" | "no_encontrada" | "evento_incorrecto";

// Helper to extract tipo_entrada name from Supabase response
function getTipoEntradaNombre(tipoEntrada: unknown): string {
  if (!tipoEntrada) return "General";

  // Could be an object or array depending on Supabase query
  if (Array.isArray(tipoEntrada)) {
    const first = tipoEntrada[0] as { nombre?: string } | undefined;
    return first?.nombre || "General";
  }

  if (typeof tipoEntrada === "object") {
    return (tipoEntrada as { nombre?: string }).nombre || "General";
  }

  return "General";
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { codigo, eventoId } = body;

    if (!codigo || !eventoId) {
      return NextResponse.json(
        { success: false, result: "no_encontrada" as ValidationResult, message: "Datos incompletos" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check user permissions
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, result: "no_encontrada" as ValidationResult, message: "No autorizado" },
        { status: 401 }
      );
    }

    // Check if user can scan
    const { data: profile } = await supabase
      .from("profiles")
      .select("rol")
      .eq("id", user.id)
      .single();

    const isAdminOrDirectivo = ["admin", "directivo"].includes(profile?.rol || "");

    if (!isAdminOrDirectivo) {
      // Check funcionarios table
      const { data: funcionario } = await supabase
        .from("funcionarios")
        .select("puede_escanear")
        .eq("user_id", user.id)
        .single();

      if (!funcionario?.puede_escanear) {
        return NextResponse.json(
          { success: false, result: "no_encontrada" as ValidationResult, message: "Sin permisos para escanear" },
          { status: 403 }
        );
      }
    }

    // Find the entrada by codigo_qr
    const { data: entrada, error: entradaError } = await supabase
      .from("entradas")
      .select(`
        id,
        evento_id,
        estado,
        nombre_asistente,
        cedula_asistente,
        fecha_uso,
        tipo_entrada:tipos_entrada (
          nombre
        )
      `)
      .eq("codigo_qr", codigo)
      .single();

    if (entradaError || !entrada) {
      // Log failed scan attempt
      await supabase.from("escaneos_entrada").insert({
        entrada_id: null,
        escaneado_por: user.id,
        resultado: "no_encontrada",
        ubicacion_escaneo: eventoId,
      });

      return NextResponse.json({
        success: false,
        result: "no_encontrada" as ValidationResult,
        message: "Entrada no encontrada",
      });
    }

    // Check if entrada is for the correct event
    if (entrada.evento_id !== eventoId) {
      await supabase.from("escaneos_entrada").insert({
        entrada_id: entrada.id,
        escaneado_por: user.id,
        resultado: "evento_incorrecto",
        ubicacion_escaneo: eventoId,
      });

      return NextResponse.json({
        success: false,
        result: "evento_incorrecto" as ValidationResult,
        message: "Esta entrada es para otro evento",
      });
    }

    // Check entrada status
    if (entrada.estado === "cancelada") {
      await supabase.from("escaneos_entrada").insert({
        entrada_id: entrada.id,
        escaneado_por: user.id,
        resultado: "cancelada",
        ubicacion_escaneo: eventoId,
      });

      return NextResponse.json({
        success: false,
        result: "cancelada" as ValidationResult,
        message: "Entrada cancelada",
      });
    }

    if (entrada.estado === "usada") {
      await supabase.from("escaneos_entrada").insert({
        entrada_id: entrada.id,
        escaneado_por: user.id,
        resultado: "ya_usada",
        ubicacion_escaneo: eventoId,
      });

      return NextResponse.json({
        success: false,
        result: "ya_usada" as ValidationResult,
        message: "Entrada ya utilizada",
        fecha_uso: entrada.fecha_uso,
        entrada: {
          nombre_asistente: entrada.nombre_asistente,
          cedula_asistente: entrada.cedula_asistente,
          tipo_entrada: getTipoEntradaNombre(entrada.tipo_entrada),
        },
      });
    }

    if (entrada.estado === "transferida") {
      await supabase.from("escaneos_entrada").insert({
        entrada_id: entrada.id,
        escaneado_por: user.id,
        resultado: "cancelada",
        ubicacion_escaneo: eventoId,
      });

      return NextResponse.json({
        success: false,
        result: "cancelada" as ValidationResult,
        message: "Entrada transferida (no válida)",
      });
    }

    // Entrada is valid - mark as used
    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("entradas")
      .update({
        estado: "usada",
        fecha_uso: now,
      })
      .eq("id", entrada.id);

    if (updateError) {
      console.error("Error updating entrada:", updateError);
      return NextResponse.json(
        { success: false, result: "no_encontrada" as ValidationResult, message: "Error al actualizar entrada" },
        { status: 500 }
      );
    }

    // Log successful scan
    await supabase.from("escaneos_entrada").insert({
      entrada_id: entrada.id,
      escaneado_por: user.id,
      resultado: "valida",
      ubicacion_escaneo: eventoId,
    });

    return NextResponse.json({
      success: true,
      result: "valida" as ValidationResult,
      message: "Entrada válida",
      entrada: {
        nombre_asistente: entrada.nombre_asistente,
        cedula_asistente: entrada.cedula_asistente,
        tipo_entrada: getTipoEntradaNombre(entrada.tipo_entrada),
        fecha_compra: null,
      },
    });
  } catch (error) {
    console.error("Error validating entrada:", error);
    return NextResponse.json(
      { success: false, result: "no_encontrada" as ValidationResult, message: "Error del servidor" },
      { status: 500 }
    );
  }
}
