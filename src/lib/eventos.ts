import { createClient } from "@/lib/supabase/server";
import type {
  EventoSocial,
  EventoCompleto,
  LoteConTipos,
  EventoFilters,
  EstadisticasEvento,
} from "@/types/eventos";

// Get all published events with optional filters
export async function getEventos(filters?: EventoFilters): Promise<EventoSocial[]> {
  const supabase = await createClient();

  let query = supabase
    .from("eventos_sociales")
    .select("*")
    .eq("publicado", true)
    .eq("activo", true)
    .order("fecha_evento", { ascending: true });

  // Filter by socios only
  if (filters?.soloSocios !== undefined) {
    query = query.eq("solo_socios", filters.soloSocios);
  }

  // Filter past/future events
  const now = new Date().toISOString();
  if (filters?.pasados === true) {
    query = query.lt("fecha_evento", now);
  } else if (filters?.pasados === false) {
    query = query.gte("fecha_evento", now);
  }

  // Search
  if (filters?.busqueda) {
    query = query.or(
      `titulo.ilike.%${filters.busqueda}%,descripcion.ilike.%${filters.busqueda}%,descripcion_corta.ilike.%${filters.busqueda}%,ubicacion.ilike.%${filters.busqueda}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching eventos:", error);
    return [];
  }

  return data || [];
}

// Get upcoming events (future only)
export async function getUpcomingEventos(limit?: number): Promise<EventoSocial[]> {
  const supabase = await createClient();

  let query = supabase
    .from("eventos_sociales")
    .select("*")
    .eq("publicado", true)
    .eq("activo", true)
    .gte("fecha_evento", new Date().toISOString())
    .order("fecha_evento", { ascending: true });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching upcoming eventos:", error);
    return [];
  }

  return data || [];
}

// Get a single event by slug with all related data (lotes and tipos)
export async function getEventoBySlug(slug: string): Promise<EventoCompleto | null> {
  const supabase = await createClient();

  // Get the event
  const { data: evento, error: eventoError } = await supabase
    .from("eventos_sociales")
    .select("*")
    .eq("slug", slug)
    .eq("publicado", true)
    .single();

  if (eventoError || !evento) {
    console.error("Error fetching evento:", eventoError);
    return null;
  }

  // Get lotes with tipos for this event
  const { data: lotes, error: lotesError } = await supabase
    .from("lotes_entrada")
    .select(`
      *,
      tipos_entrada (*)
    `)
    .eq("evento_id", evento.id)
    .order("orden", { ascending: true });

  if (lotesError) {
    console.error("Error fetching lotes:", lotesError);
  }

  // Get total tickets sold
  const { count: entradasVendidas } = await supabase
    .from("entradas")
    .select("*", { count: "exact", head: true })
    .eq("evento_id", evento.id)
    .neq("estado", "cancelada");

  // Calculate minimum price from active lotes and tipos
  let precioDesde: number | undefined;
  const now = new Date();

  const lotesConTipos: LoteConTipos[] = (lotes || []).map((lote) => {
    const tiposOrdenados = (lote.tipos_entrada || []).sort(
      (a: { orden: number }, b: { orden: number }) => a.orden - b.orden
    );

    // Check if lote is currently active (by date)
    const loteInicio = new Date(lote.fecha_inicio);
    const loteFin = new Date(lote.fecha_fin);
    const isLoteDateActive = lote.activo && now >= loteInicio && now <= loteFin;

    // Check if lote has remaining quantity (if cantidad_maxima is set)
    const totalVendidasLote = tiposOrdenados.reduce(
      (sum: number, t: { cantidad_vendida: number }) => sum + t.cantidad_vendida,
      0
    );
    const isLoteQuantityActive = !lote.cantidad_maxima || totalVendidasLote < lote.cantidad_maxima;

    const isLoteActive = isLoteDateActive && isLoteQuantityActive;

    if (isLoteActive) {
      tiposOrdenados.forEach((tipo: { activo: boolean; precio: number; cantidad_total: number; cantidad_vendida: number }) => {
        if (tipo.activo && tipo.cantidad_vendida < tipo.cantidad_total) {
          if (precioDesde === undefined || tipo.precio < precioDesde) {
            precioDesde = tipo.precio;
          }
        }
      });
    }

    return {
      ...lote,
      tipos_entrada: tiposOrdenados,
    };
  });

  return {
    ...evento,
    lotes: lotesConTipos,
    entradas_vendidas: entradasVendidas || 0,
    precio_desde: precioDesde,
  };
}

// Get event by ID
export async function getEventoById(id: string): Promise<EventoSocial | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("eventos_sociales")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching evento by id:", error);
    return null;
  }

  return data;
}

// Get eventos with stats for admin
export async function getEventosConEstadisticas(): Promise<EstadisticasEvento[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("estadisticas_evento")
    .select("*")
    .order("fecha_evento", { ascending: false });

  if (error) {
    console.error("Error fetching estadisticas:", error);
    return [];
  }

  return data || [];
}

// Get featured event (next upcoming)
export async function getFeaturedEvento(): Promise<EventoSocial | null> {
  const eventos = await getUpcomingEventos(1);
  return eventos[0] || null;
}

// Get eventos for cards (with price info)
export async function getEventosWithPrices(filters?: EventoFilters): Promise<Array<EventoSocial & { precio_desde?: number; entradas_vendidas?: number }>> {
  const supabase = await createClient();

  let query = supabase
    .from("eventos_sociales")
    .select(`
      *,
      lotes_entrada (
        id,
        fecha_inicio,
        fecha_fin,
        cantidad_maxima,
        activo,
        tipos_entrada (
          precio,
          activo,
          cantidad_total,
          cantidad_vendida
        )
      )
    `)
    .eq("publicado", true)
    .eq("activo", true)
    .order("fecha_evento", { ascending: true });

  // Filter past/future events
  const now = new Date().toISOString();
  if (filters?.pasados === true) {
    query = query.lt("fecha_evento", now);
  } else if (filters?.pasados === false) {
    query = query.gte("fecha_evento", now);
  }

  if (filters?.soloSocios !== undefined) {
    query = query.eq("solo_socios", filters.soloSocios);
  }

  if (filters?.busqueda) {
    query = query.or(
      `titulo.ilike.%${filters.busqueda}%,descripcion.ilike.%${filters.busqueda}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching eventos with prices:", error);
    return [];
  }

  // Calculate prices
  const nowDate = new Date();

  return (data || []).map((evento) => {
    let precioDesde: number | undefined;
    let totalVendidas = 0;

    (evento.lotes_entrada || []).forEach((lote: {
      fecha_inicio: string;
      fecha_fin: string;
      cantidad_maxima?: number;
      activo: boolean;
      tipos_entrada: Array<{
        precio: number;
        activo: boolean;
        cantidad_total: number;
        cantidad_vendida: number;
      }>;
    }) => {
      const loteInicio = new Date(lote.fecha_inicio);
      const loteFin = new Date(lote.fecha_fin);
      const isLoteDateActive = lote.activo && nowDate >= loteInicio && nowDate <= loteFin;

      // Calculate total sold for this lote
      const loteVendidas = (lote.tipos_entrada || []).reduce((sum, t) => sum + (t.cantidad_vendida || 0), 0);
      const isLoteQuantityActive = !lote.cantidad_maxima || loteVendidas < lote.cantidad_maxima;

      const isLoteActive = isLoteDateActive && isLoteQuantityActive;

      (lote.tipos_entrada || []).forEach((tipo) => {
        totalVendidas += tipo.cantidad_vendida || 0;

        if (isLoteActive && tipo.activo && tipo.cantidad_vendida < tipo.cantidad_total) {
          if (precioDesde === undefined || tipo.precio < precioDesde) {
            precioDesde = tipo.precio;
          }
        }
      });
    });

    // Remove nested data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { lotes_entrada, ...eventoSinLotes } = evento;

    return {
      ...eventoSinLotes,
      precio_desde: precioDesde,
      entradas_vendidas: totalVendidas,
    };
  });
}
