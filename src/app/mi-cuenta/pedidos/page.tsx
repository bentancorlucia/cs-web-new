"use client";

import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDate, formatPrice, cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";

interface Pedido {
  id: string;
  numero_pedido: string;
  total: number;
  subtotal: number;
  descuento: number;
  estado: string;
  metodo_pago: string | null;
  direccion_envio: string | null;
  ciudad: string | null;
  notas: string | null;
  created_at: string;
  items_pedido: {
    id: string;
    nombre_producto: string;
    precio_unitario: number;
    cantidad: number;
    talla: string | null;
    color: string | null;
    subtotal: number;
  }[];
}

type FilterEstado = "todos" | "activos" | "completados";

export default function PedidosPage() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState<FilterEstado>("todos");

  useEffect(() => {
    const fetchPedidos = async () => {
      if (!user) return;

      const supabase = createClient();
      const { data, error } = await supabase
        .from("pedidos")
        .select(`
          *,
          items_pedido (
            id,
            nombre_producto,
            precio_unitario,
            cantidad,
            talla,
            color,
            subtotal
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching pedidos:", error);
      } else {
        setPedidos(data || []);
      }
      setIsLoading(false);
    };

    fetchPedidos();
  }, [user]);

  const filteredPedidos = pedidos.filter((pedido) => {
    if (filtro === "activos") {
      return ["pendiente", "pagado", "preparando", "enviado"].includes(pedido.estado);
    }
    if (filtro === "completados") {
      return ["entregado", "cancelado"].includes(pedido.estado);
    }
    return true;
  });

  const getEstadoConfig = (estado: string) => {
    const configs: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      pendiente: {
        color: "bg-gray-100 text-gray-800",
        label: "Pendiente de pago",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      pagado: {
        color: "bg-purple-100 text-purple-800",
        label: "Pagado",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      preparando: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Preparando",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        ),
      },
      enviado: {
        color: "bg-blue-100 text-blue-800",
        label: "Enviado",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        ),
      },
      entregado: {
        color: "bg-green-100 text-green-800",
        label: "Entregado",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
      },
      cancelado: {
        color: "bg-red-100 text-red-800",
        label: "Cancelado",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
      },
    };
    return configs[estado] || configs.pendiente;
  };

  const getEstadoTimeline = (estado: string) => {
    const estados = ["pendiente", "pagado", "preparando", "enviado", "entregado"];
    const currentIndex = estados.indexOf(estado);
    if (estado === "cancelado") return -1;
    return currentIndex;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 animate-pulse motion-reduce:animate-none">
            <div className="flex justify-between mb-4">
              <div className="h-6 bg-gray-200 rounded w-32" />
              <div className="h-6 bg-gray-200 rounded w-24" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-32" />
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
          <h1 className="text-2xl font-bold text-gray-900">Mis Pedidos</h1>
          <p className="text-gray-500 mt-1">
            {pedidos.length} {pedidos.length === 1 ? "pedido" : "pedidos"} en total
          </p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          {(["todos", "activos", "completados"] as FilterEstado[]).map((f) => (
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
              {f === "todos" && "Todos"}
              {f === "activos" && "Activos"}
              {f === "completados" && "Completados"}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Pedidos */}
      {filteredPedidos.length === 0 ? (
        <Card variant="default">
          <CardContent className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filtro === "todos" ? "No tenés pedidos todavía" : `No hay pedidos ${filtro}`}
            </h3>
            <p className="text-gray-500 mb-6">
              {filtro === "todos"
                ? "Cuando realices una compra, tus pedidos aparecerán aquí."
                : "Probá cambiando el filtro para ver otros pedidos."}
            </p>
            {filtro === "todos" && (
              <Link
                href="/tienda"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-xl bg-gradient-to-r from-bordo to-bordo-dark text-white shadow-lg shadow-bordo/25 hover:from-bordo-dark hover:to-bordo transition-all"
              >
                Ir a la Tienda
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPedidos.map((pedido) => {
            const estadoConfig = getEstadoConfig(pedido.estado);
            const timelineStep = getEstadoTimeline(pedido.estado);

            return (
              <Card key={pedido.id} variant="default" hover padding="none">
                <Link href={`/mi-cuenta/pedidos/${pedido.id}`} className="block">
                  <div className="p-6">
                    {/* Header del pedido */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">
                            {pedido.numero_pedido}
                          </h3>
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full",
                            estadoConfig.color
                          )}>
                            {estadoConfig.icon}
                            {estadoConfig.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(pedido.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          {formatPrice(pedido.total)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {pedido.items_pedido.length} {pedido.items_pedido.length === 1 ? "producto" : "productos"}
                        </p>
                      </div>
                    </div>

                    {/* Timeline de estado (solo para pedidos no cancelados) */}
                    {pedido.estado !== "cancelado" && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          {["Pagado", "Preparando", "Enviado", "Entregado"].map((step, index) => (
                            <div key={step} className="flex items-center">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                                index < timelineStep
                                  ? "bg-green-500 text-white"
                                  : index === timelineStep
                                  ? "bg-bordo text-white"
                                  : "bg-gray-200 text-gray-500"
                              )}>
                                {index < timelineStep ? (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  index + 1
                                )}
                              </div>
                              {index < 3 && (
                                <div className={cn(
                                  "w-full h-1 mx-1",
                                  index < timelineStep ? "bg-green-500" : "bg-gray-200"
                                )} style={{ width: "calc(100% - 2rem)" }} />
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between mt-1">
                          {["Pagado", "Preparando", "Enviado", "Entregado"].map((step) => (
                            <span key={step} className="text-xs text-gray-500 w-16 text-center">
                              {step}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Preview de productos */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                      <div className="flex -space-x-2">
                        {pedido.items_pedido.slice(0, 3).map((item, index) => (
                          <div
                            key={item.id}
                            className="w-10 h-10 rounded-lg bg-gradient-to-br from-bordo/10 to-amarillo/10 border-2 border-white flex items-center justify-center text-xs font-medium text-bordo"
                            style={{ zIndex: 3 - index }}
                          >
                            {item.nombre_producto[0]}
                          </div>
                        ))}
                        {pedido.items_pedido.length > 3 && (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-500">
                            +{pedido.items_pedido.length - 3}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-600 truncate">
                          {pedido.items_pedido.map((item) => item.nombre_producto).join(", ")}
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
