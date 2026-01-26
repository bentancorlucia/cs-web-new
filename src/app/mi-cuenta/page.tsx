"use client";

import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface DashboardStats {
  totalPedidos: number;
  totalEntradas: number;
  entradasProximas: number;
  pedidosPendientes: number;
}

interface PedidoReciente {
  id: string;
  numero_pedido: string;
  total: number;
  estado: string;
  created_at: string;
}

interface EntradaProxima {
  id: string;
  evento_titulo: string;
  evento_fecha: string;
  tipo_entrada: string;
  estado: string;
}

export default function MiCuentaPage() {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPedidos: 0,
    totalEntradas: 0,
    entradasProximas: 0,
    pedidosPendientes: 0,
  });
  const [pedidosRecientes, setPedidosRecientes] = useState<PedidoReciente[]>([]);
  const [entradasProximas, setEntradasProximas] = useState<EntradaProxima[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      const supabase = createClient();

      try {
        // Fetch pedidos count
        const { count: pedidosCount } = await supabase
          .from("pedidos")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        // Fetch pedidos pendientes
        const { count: pedidosPendientes } = await supabase
          .from("pedidos")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .in("estado", ["pendiente", "pagado", "preparando", "enviado"]);

        // Fetch entradas count
        const { count: entradasCount } = await supabase
          .from("entradas")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        // Fetch entradas próximas (eventos futuros)
        const { data: entradasProximasData, count: entradasProximasCount } = await supabase
          .from("entradas")
          .select(`
            id,
            estado,
            eventos_sociales!inner (
              titulo,
              fecha_evento
            ),
            tipos_entrada (
              nombre
            )
          `, { count: "exact" })
          .eq("user_id", user.id)
          .eq("estado", "valida")
          .gte("eventos_sociales.fecha_evento", new Date().toISOString())
          .order("eventos_sociales(fecha_evento)", { ascending: true })
          .limit(3);

        // Fetch pedidos recientes
        const { data: pedidosData } = await supabase
          .from("pedidos")
          .select("id, numero_pedido, total, estado, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3);

        setStats({
          totalPedidos: pedidosCount || 0,
          totalEntradas: entradasCount || 0,
          entradasProximas: entradasProximasCount || 0,
          pedidosPendientes: pedidosPendientes || 0,
        });

        setPedidosRecientes(pedidosData || []);

        // Transform entradas data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformedEntradas = (entradasProximasData || []).map((entrada: any) => ({
          id: entrada.id,
          evento_titulo: entrada.eventos_sociales?.titulo || "Evento",
          evento_fecha: entrada.eventos_sociales?.fecha_evento || "",
          tipo_entrada: entrada.tipos_entrada?.nombre || "General",
          estado: entrada.estado,
        }));
        setEntradasProximas(transformedEntradas);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "entregado":
        return "bg-green-100 text-green-800";
      case "enviado":
        return "bg-blue-100 text-blue-800";
      case "preparando":
        return "bg-yellow-100 text-yellow-800";
      case "pagado":
        return "bg-purple-100 text-purple-800";
      case "pendiente":
        return "bg-gray-100 text-gray-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEstadoLabel = (estado: string) => {
    const labels: Record<string, string> = {
      pendiente: "Pendiente",
      pagado: "Pagado",
      preparando: "Preparando",
      enviado: "Enviado",
      entregado: "Entregado",
      cancelado: "Cancelado",
    };
    return labels[estado] || estado;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton loading */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse motion-reduce:animate-none">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse motion-reduce:animate-none">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-6" />
              <div className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-16 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-amarillo/10 to-amarillo/5 rounded-2xl p-6 border border-amarillo/20">
        <h2 className="text-xl font-bold text-gray-900">
          Bienvenido, {profile?.nombre}
        </h2>
        <p className="text-gray-600 mt-1">
          Aquí podés ver un resumen de tu actividad en Club Seminario.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="elevated">
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-bordo/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-bordo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Pedidos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPedidos}</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amarillo/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-amarillo-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pedidos Activos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pedidosPendientes}</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Entradas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEntradas}</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Eventos Próximos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.entradasProximas}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pedidos Recientes */}
        <Card variant="default" padding="none">
          <CardHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <CardTitle>Pedidos Recientes</CardTitle>
              <Link
                href="/mi-cuenta/pedidos"
                className="text-sm text-bordo hover:text-bordo-dark font-medium"
              >
                Ver todos
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-4">
            {pedidosRecientes.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-gray-500">No tenés pedidos todavía</p>
                <Link href="/tienda" className="text-bordo hover:text-bordo-dark text-sm font-medium mt-2 inline-block">
                  Ir a la tienda
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {pedidosRecientes.map((pedido) => (
                  <Link
                    key={pedido.id}
                    href={`/mi-cuenta/pedidos/${pedido.id}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 group-hover:text-bordo transition-colors">
                        {pedido.numero_pedido}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(pedido.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getEstadoColor(pedido.estado)}`}>
                        {getEstadoLabel(pedido.estado)}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(pedido.total)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Entradas Próximas */}
        <Card variant="default" padding="none">
          <CardHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <CardTitle>Próximos Eventos</CardTitle>
              <Link
                href="/mi-cuenta/entradas"
                className="text-sm text-bordo hover:text-bordo-dark font-medium"
              >
                Ver todas
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-4">
            {entradasProximas.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <p className="text-gray-500">No tenés entradas para próximos eventos</p>
                <Link href="/eventos" className="text-bordo hover:text-bordo-dark text-sm font-medium mt-2 inline-block">
                  Ver eventos
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {entradasProximas.map((entrada) => (
                  <Link
                    key={entrada.id}
                    href={`/mi-cuenta/entradas/${entrada.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bordo to-bordo-dark flex items-center justify-center text-white flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 group-hover:text-bordo transition-colors truncate">
                        {entrada.evento_titulo}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(entrada.evento_fecha)} - {entrada.tipo_entrada}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-bordo transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card variant="glass">
        <CardContent>
          <h3 className="font-semibold text-gray-900 mb-4">Acciones rápidas</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              href="/tienda"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white hover:bg-gray-50 transition-colors text-center group"
            >
              <div className="w-10 h-10 rounded-lg bg-bordo/10 flex items-center justify-center group-hover:bg-bordo group-hover:text-white transition-colors">
                <svg className="w-5 h-5 text-bordo group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Ir a la Tienda</span>
            </Link>

            <Link
              href="/eventos"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white hover:bg-gray-50 transition-colors text-center group"
            >
              <div className="w-10 h-10 rounded-lg bg-amarillo/10 flex items-center justify-center group-hover:bg-amarillo transition-colors">
                <svg className="w-5 h-5 text-amarillo-dark group-hover:text-bordo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Ver Eventos</span>
            </Link>

            <Link
              href="/mi-cuenta/perfil"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white hover:bg-gray-50 transition-colors text-center group"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                <svg className="w-5 h-5 text-purple-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Editar Perfil</span>
            </Link>

            <Link
              href="/beneficios"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white hover:bg-gray-50 transition-colors text-center group"
            >
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-600 transition-colors">
                <svg className="w-5 h-5 text-green-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Beneficios</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
