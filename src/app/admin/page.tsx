"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminHeader, StatsCard, DataTable, StatusBadge, type Column } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Pedido, Producto } from "@/types/tienda";
import type { EventoSocial } from "@/types/eventos";

interface DashboardStats {
  ventasHoy: number;
  ventasMes: number;
  pedidosPendientes: number;
  productosStockBajo: number;
  entradasVendidas: number;
  proximoEvento: EventoSocial | null;
}

interface RecentOrder extends Pedido {
  items_count: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    ventasHoy: 0,
    ventasMes: 0,
    pedidosPendientes: 0,
    productosStockBajo: 0,
    entradasVendidas: 0,
    proximoEvento: null,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      const supabase = createClient();

      try {
        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);

        // Get month's date range
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        // Fetch sales today
        const { data: salesToday } = await supabase
          .from("pedidos")
          .select("total")
          .gte("created_at", today.toISOString())
          .lte("created_at", todayEnd.toISOString())
          .in("estado", ["pagado", "preparando", "enviado", "entregado"]);

        // Fetch sales this month
        const { data: salesMonth } = await supabase
          .from("pedidos")
          .select("total")
          .gte("created_at", monthStart.toISOString())
          .in("estado", ["pagado", "preparando", "enviado", "entregado"]);

        // Fetch pending orders count
        const { count: pendingCount } = await supabase
          .from("pedidos")
          .select("*", { count: "exact", head: true })
          .eq("estado", "pendiente");

        // Fetch low stock products (stock < 10)
        const { data: lowStock, count: lowStockCount } = await supabase
          .from("productos")
          .select("*", { count: "exact" })
          .lt("stock", 10)
          .eq("activo", true)
          .order("stock", { ascending: true })
          .limit(5);

        // Fetch tickets sold this month
        const { count: ticketsCount } = await supabase
          .from("entradas")
          .select("*", { count: "exact", head: true })
          .gte("fecha_compra", monthStart.toISOString())
          .eq("estado", "valida");

        // Fetch next event
        const { data: nextEvent } = await supabase
          .from("eventos_sociales")
          .select("*")
          .eq("publicado", true)
          .gte("fecha_evento", new Date().toISOString())
          .order("fecha_evento", { ascending: true })
          .limit(1)
          .single();

        // Fetch recent orders
        const { data: orders } = await supabase
          .from("pedidos")
          .select(`
            *,
            items_pedido(count)
          `)
          .order("created_at", { ascending: false })
          .limit(5);

        const ventasHoy = salesToday?.reduce((sum, p) => sum + p.total, 0) ?? 0;
        const ventasMes = salesMonth?.reduce((sum, p) => sum + p.total, 0) ?? 0;

        setStats({
          ventasHoy,
          ventasMes,
          pedidosPendientes: pendingCount ?? 0,
          productosStockBajo: lowStockCount ?? 0,
          entradasVendidas: ticketsCount ?? 0,
          proximoEvento: nextEvent ?? null,
        });

        setRecentOrders(
          orders?.map((o) => ({
            ...o,
            items_count: o.items_pedido?.[0]?.count ?? 0,
          })) ?? []
        );

        setLowStockProducts(lowStock ?? []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const ordersColumns: Column<RecentOrder>[] = [
    {
      key: "numero_pedido",
      label: "Pedido",
      render: (order) => (
        <span className="font-mono text-sm font-medium text-gray-900">
          {order.numero_pedido}
        </span>
      ),
    },
    {
      key: "nombre_completo",
      label: "Cliente",
      render: (order) => (
        <div>
          <p className="font-medium text-gray-900">{order.nombre_completo}</p>
          <p className="text-sm text-gray-500">{order.email}</p>
        </div>
      ),
    },
    {
      key: "total",
      label: "Total",
      render: (order) => (
        <span className="font-semibold text-gray-900">
          {formatPrice(order.total)}
        </span>
      ),
    },
    {
      key: "estado",
      label: "Estado",
      render: (order) => <StatusBadge status={order.estado} type="pedido" />,
    },
    {
      key: "created_at",
      label: "Fecha",
      render: (order) => (
        <span className="text-sm text-gray-500">
          {formatDate(order.created_at)}
        </span>
      ),
    },
  ];

  const stockColumns: Column<Producto>[] = [
    {
      key: "nombre",
      label: "Producto",
      render: (product) => (
        <div className="flex items-center gap-3">
          {product.imagen_principal && (
            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
              <img
                src={product.imagen_principal}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <span className="font-medium text-gray-900">{product.nombre}</span>
        </div>
      ),
    },
    {
      key: "sku",
      label: "SKU",
      render: (product) => (
        <span className="font-mono text-sm text-gray-500">{product.sku}</span>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      render: (product) => (
        <span
          className={`font-semibold ${
            product.stock === 0
              ? "text-red-600"
              : product.stock < 5
              ? "text-amber-600"
              : "text-gray-900"
          }`}
        >
          {product.stock} uds
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Dashboard"
        subtitle={`Bienvenido al panel de administración`}
      />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Ventas Hoy"
            value={formatPrice(stats.ventasHoy)}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="green"
            loading={loading}
          />
          <StatsCard
            title="Ventas del Mes"
            value={formatPrice(stats.ventasMes)}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            color="blue"
            loading={loading}
          />
          <StatsCard
            title="Pedidos Pendientes"
            value={stats.pedidosPendientes}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="amarillo"
            loading={loading}
          />
          <StatsCard
            title="Entradas Vendidas"
            value={stats.entradasVendidas}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            }
            color="purple"
            loading={loading}
          />
        </div>

        {/* Next Event Banner */}
        {stats.proximoEvento && (
          <div className="bg-gradient-to-r from-bordo to-bordo-dark rounded-2xl p-6 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="relative flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-white/70 text-sm font-medium">Próximo Evento</p>
                <h3 className="text-2xl font-bold">{stats.proximoEvento.titulo}</h3>
                <p className="text-white/80">
                  {formatDate(stats.proximoEvento.fecha_evento)}
                  {stats.proximoEvento.ubicacion && ` · ${stats.proximoEvento.ubicacion}`}
                </p>
              </div>
              <Link href={`/admin/eventos/${stats.proximoEvento.id}`}>
                <Button variant="secondary" size="sm">
                  Ver detalles
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Pedidos Recientes</h2>
              <Link href="/admin/pedidos">
                <Button variant="ghost" size="sm">
                  Ver todos
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </Link>
            </div>
            <DataTable
              data={recentOrders}
              columns={ordersColumns}
              keyExtractor={(order) => order.id}
              loading={loading}
              emptyMessage="No hay pedidos recientes"
            />
          </div>

          {/* Low Stock Alert */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Stock Bajo</h2>
              {stats.productosStockBajo > 0 && (
                <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                  {stats.productosStockBajo} productos
                </span>
              )}
            </div>
            <DataTable
              data={lowStockProducts}
              columns={stockColumns}
              keyExtractor={(product) => product.id}
              loading={loading}
              emptyMessage="Todo el stock está OK"
              actions={(product) => (
                <Link href={`/admin/productos/${product.id}`}>
                  <Button variant="ghost" size="sm">
                    Editar
                  </Button>
                </Link>
              )}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/admin/productos/nuevo"
              className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-bordo/30 hover:bg-bordo/5 transition-all duration-200 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-bordo/10 flex items-center justify-center transition-colors">
                <svg className="w-6 h-6 text-gray-400 group-hover:text-bordo transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Nuevo Producto</span>
            </Link>
            <Link
              href="/admin/eventos/nuevo"
              className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-bordo/30 hover:bg-bordo/5 transition-all duration-200 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-bordo/10 flex items-center justify-center transition-colors">
                <svg className="w-6 h-6 text-gray-400 group-hover:text-bordo transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Nuevo Evento</span>
            </Link>
            <Link
              href="/admin/pedidos?estado=pendiente"
              className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-bordo/30 hover:bg-bordo/5 transition-all duration-200 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-bordo/10 flex items-center justify-center transition-colors">
                <svg className="w-6 h-6 text-gray-400 group-hover:text-bordo transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Pedidos Pendientes</span>
            </Link>
            <Link
              href="/admin/reportes"
              className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-bordo/30 hover:bg-bordo/5 transition-all duration-200 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-bordo/10 flex items-center justify-center transition-colors">
                <svg className="w-6 h-6 text-gray-400 group-hover:text-bordo transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Ver Reportes</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
