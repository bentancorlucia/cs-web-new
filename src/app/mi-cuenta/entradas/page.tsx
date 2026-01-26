"use client";

import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDate, formatDateTime, cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";

interface Entrada {
  id: string;
  codigo_qr: string;
  nombre_asistente: string;
  cedula_asistente: string | null;
  estado: "valida" | "usada" | "cancelada" | "transferida";
  fecha_compra: string;
  fecha_uso: string | null;
  evento: {
    id: string;
    titulo: string;
    slug: string;
    fecha_evento: string;
    ubicacion: string | null;
    imagen_url: string | null;
  };
  tipo_entrada: {
    nombre: string;
    precio: number;
  } | null;
}

type FilterEstado = "todas" | "proximas" | "pasadas";

export default function EntradasPage() {
  const { user } = useAuth();
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState<FilterEstado>("todas");

  useEffect(() => {
    const fetchEntradas = async () => {
      if (!user) return;

      const supabase = createClient();
      const { data, error } = await supabase
        .from("entradas")
        .select(`
          id,
          codigo_qr,
          nombre_asistente,
          cedula_asistente,
          estado,
          fecha_compra,
          fecha_uso,
          evento:eventos_sociales (
            id,
            titulo,
            slug,
            fecha_evento,
            ubicacion,
            imagen_url
          ),
          tipo_entrada:tipos_entrada (
            nombre,
            precio
          )
        `)
        .eq("user_id", user.id)
        .order("fecha_compra", { ascending: false });

      if (error) {
        console.error("Error fetching entradas:", error);
      } else {
        // Transform data to match our interface
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformedData = (data || []).map((item: any) => ({
          id: item.id,
          codigo_qr: item.codigo_qr,
          nombre_asistente: item.nombre_asistente,
          cedula_asistente: item.cedula_asistente,
          estado: item.estado,
          fecha_compra: item.fecha_compra,
          fecha_uso: item.fecha_uso,
          evento: item.evento,
          tipo_entrada: item.tipo_entrada,
        }));
        setEntradas(transformedData as Entrada[]);
      }
      setIsLoading(false);
    };

    fetchEntradas();
  }, [user]);

  const now = new Date();

  const filteredEntradas = entradas.filter((entrada) => {
    const fechaEvento = new Date(entrada.evento.fecha_evento);

    if (filtro === "proximas") {
      return fechaEvento >= now && entrada.estado === "valida";
    }
    if (filtro === "pasadas") {
      return fechaEvento < now || entrada.estado !== "valida";
    }
    return true;
  });

  const getEstadoConfig = (estado: string, fechaEvento: string) => {
    const isPast = new Date(fechaEvento) < now;

    if (estado === "valida" && isPast) {
      return {
        color: "bg-gray-100 text-gray-600",
        label: "Expirada",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      };
    }

    const configs: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      valida: {
        color: "bg-green-100 text-green-800",
        label: "Válida",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      usada: {
        color: "bg-blue-100 text-blue-800",
        label: "Usada",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
      },
      cancelada: {
        color: "bg-red-100 text-red-800",
        label: "Cancelada",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
      },
      transferida: {
        color: "bg-purple-100 text-purple-800",
        label: "Transferida",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        ),
      },
    };
    return configs[estado] || configs.valida;
  };

  const isEventSoon = (fechaEvento: string) => {
    const eventDate = new Date(fechaEvento);
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 animate-pulse motion-reduce:animate-none">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded-xl" />
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Entradas</h1>
          <p className="text-gray-500 mt-1">
            {entradas.length} {entradas.length === 1 ? "entrada" : "entradas"} en total
          </p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          {(["todas", "proximas", "pasadas"] as FilterEstado[]).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordo focus-visible:ring-offset-2",
                filtro === f
                  ? "bg-bordo text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {f === "todas" && "Todas"}
              {f === "proximas" && "Próximas"}
              {f === "pasadas" && "Pasadas"}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Entradas */}
      {filteredEntradas.length === 0 ? (
        <Card variant="default">
          <CardContent className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filtro === "todas" ? "No tenés entradas todavía" : `No hay entradas ${filtro}`}
            </h3>
            <p className="text-gray-500 mb-6">
              {filtro === "todas"
                ? "Cuando compres entradas para eventos, aparecerán aquí."
                : "Probá cambiando el filtro para ver otras entradas."}
            </p>
            {filtro === "todas" && (
              <Link
                href="/eventos"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-xl bg-gradient-to-r from-bordo to-bordo-dark text-white shadow-lg shadow-bordo/25 hover:from-bordo-dark hover:to-bordo transition-all"
              >
                Ver Eventos
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEntradas.map((entrada) => {
            const estadoConfig = getEstadoConfig(entrada.estado, entrada.evento.fecha_evento);
            const isSoon = isEventSoon(entrada.evento.fecha_evento);
            const isPast = new Date(entrada.evento.fecha_evento) < now;

            return (
              <Card
                key={entrada.id}
                variant="default"
                hover
                padding="none"
                className={cn(
                  isSoon && entrada.estado === "valida" && "ring-2 ring-amarillo/50"
                )}
              >
                <Link href={`/mi-cuenta/entradas/${entrada.id}`} className="block">
                  <div className="p-6">
                    {isSoon && entrada.estado === "valida" && (
                      <div className="mb-4 -mt-2 -mx-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-gradient-to-r from-amarillo to-amarillo-dark text-bordo-dark rounded-full">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Evento próximo
                        </span>
                      </div>
                    )}

                    <div className="flex gap-4">
                      {/* Imagen del evento */}
                      <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-bordo to-bordo-dark flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {entrada.evento.imagen_url ? (
                          <img
                            src={entrada.evento.imagen_url}
                            alt={entrada.evento.titulo}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg className="w-10 h-10 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                          </svg>
                        )}
                      </div>

                      {/* Info del evento y entrada */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-bordo transition-colors">
                              {entrada.evento.titulo}
                            </h3>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {entrada.tipo_entrada?.nombre || "Entrada General"}
                            </p>
                          </div>
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full flex-shrink-0",
                            estadoConfig.color
                          )}>
                            {estadoConfig.icon}
                            {estadoConfig.label}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(entrada.evento.fecha_evento)}
                          </span>
                          {entrada.evento.ubicacion && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {entrada.evento.ubicacion}
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-sm">
                            <span className="text-gray-500">Asistente:</span>{" "}
                            <span className="font-medium text-gray-900">{entrada.nombre_asistente}</span>
                          </p>
                          {!isPast && entrada.estado === "valida" && (
                            <span className="text-xs text-bordo font-medium">
                              Ver QR →
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info adicional */}
      {entradas.length > 0 && (
        <Card variant="glass">
          <CardContent className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-amarillo/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amarillo-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Información importante</h4>
              <p className="text-sm text-gray-600 mt-1">
                Presentá el código QR de tu entrada en la puerta del evento. Podés mostrarlo desde tu celular o impreso. Cada entrada solo puede ser usada una vez.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
