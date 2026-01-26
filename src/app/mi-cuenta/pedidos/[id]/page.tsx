"use client";

import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { formatDate, formatDateTime, formatPrice, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface ItemPedido {
  id: string;
  nombre_producto: string;
  precio_unitario: number;
  cantidad: number;
  talla: string | null;
  color: string | null;
  subtotal: number;
  producto: {
    imagen_principal: string | null;
    slug: string;
  } | null;
}

interface Pedido {
  id: string;
  numero_pedido: string;
  email: string;
  nombre_completo: string;
  telefono: string | null;
  direccion_envio: string | null;
  ciudad: string | null;
  notas: string | null;
  subtotal: number;
  descuento: number;
  total: number;
  estado: string;
  metodo_pago: string | null;
  mercadopago_payment_id: string | null;
  created_at: string;
  updated_at: string;
  items_pedido: ItemPedido[];
}

export default function PedidoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPedido = async () => {
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
            subtotal,
            producto:productos (
              imagen_principal,
              slug
            )
          )
        `)
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setPedido(data);
      }
      setIsLoading(false);
    };

    fetchPedido();
  }, [user, id]);

  const getEstadoConfig = (estado: string) => {
    const configs: Record<string, { color: string; bgColor: string; icon: React.ReactNode; label: string }> = {
      pendiente: {
        color: "text-gray-800",
        bgColor: "bg-gray-100",
        label: "Pendiente de pago",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      pagado: {
        color: "text-purple-800",
        bgColor: "bg-purple-100",
        label: "Pagado - Esperando preparación",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      preparando: {
        color: "text-yellow-800",
        bgColor: "bg-yellow-100",
        label: "En preparación",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        ),
      },
      enviado: {
        color: "text-blue-800",
        bgColor: "bg-blue-100",
        label: "Enviado",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        ),
      },
      entregado: {
        color: "text-green-800",
        bgColor: "bg-green-100",
        label: "Entregado",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
      },
      cancelado: {
        color: "text-red-800",
        bgColor: "bg-red-100",
        label: "Cancelado",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
      },
    };
    return configs[estado] || configs.pendiente;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-32 animate-pulse motion-reduce:animate-none" />
        <div className="bg-white rounded-2xl p-6 animate-pulse motion-reduce:animate-none">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>
      </div>
    );
  }

  if (notFound || !pedido) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Pedido no encontrado</h2>
        <p className="text-gray-500 mb-6">El pedido que buscás no existe o no tenés acceso.</p>
        <Link
          href="/mi-cuenta/pedidos"
          className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-xl bg-gradient-to-r from-bordo to-bordo-dark text-white shadow-lg shadow-bordo/25 hover:from-bordo-dark hover:to-bordo transition-all"
        >
          Volver a Mis Pedidos
        </Link>
      </div>
    );
  }

  const estadoConfig = getEstadoConfig(pedido.estado);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/mi-cuenta/pedidos"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-bordo transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver a Mis Pedidos
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pedido.numero_pedido}</h1>
          <p className="text-gray-500 mt-1">Realizado el {formatDateTime(pedido.created_at)}</p>
        </div>
        <div className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium",
          estadoConfig.bgColor,
          estadoConfig.color
        )}>
          {estadoConfig.icon}
          {estadoConfig.label}
        </div>
      </div>

      {/* Timeline */}
      {pedido.estado !== "cancelado" && (
        <Card variant="default">
          <CardContent>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                {["Pagado", "Preparando", "Enviado", "Entregado"].map((step, index) => {
                  const estados = ["pagado", "preparando", "enviado", "entregado"];
                  const currentIndex = estados.indexOf(pedido.estado);
                  const isCompleted = index < currentIndex;
                  const isCurrent = index === currentIndex;

                  return (
                    <div key={step} className="flex flex-col items-center flex-1">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mb-2 transition-colors",
                        isCompleted ? "bg-green-500 text-white" : "",
                        isCurrent ? "bg-bordo text-white ring-4 ring-bordo/20" : "",
                        !isCompleted && !isCurrent ? "bg-gray-200 text-gray-500" : ""
                      )}>
                        {isCompleted ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className={cn(
                        "text-xs font-medium",
                        isCurrent ? "text-bordo" : "text-gray-500"
                      )}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Progress line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" style={{ marginLeft: "5%", marginRight: "5%", width: "90%" }}>
                <div
                  className="h-full bg-green-500 transition-[width] duration-500"
                  style={{
                    width: `${Math.max(0, (["pagado", "preparando", "enviado", "entregado"].indexOf(pedido.estado)) * 33.33)}%`
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productos */}
        <div className="lg:col-span-2">
          <Card variant="default" padding="none">
            <CardHeader className="p-6 pb-0">
              <CardTitle>Productos</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              <div className="divide-y divide-gray-100">
                {pedido.items_pedido.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-bordo/10 to-amarillo/10 flex items-center justify-center flex-shrink-0">
                      {item.producto?.imagen_principal ? (
                        <img
                          src={item.producto.imagen_principal}
                          alt={item.nombre_producto}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <svg className="w-8 h-8 text-bordo/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">{item.nombre_producto}</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.talla && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            Talla: {item.talla}
                          </span>
                        )}
                        {item.color && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            Color: {item.color}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatPrice(item.precio_unitario)} x {item.cantidad}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatPrice(item.subtotal)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">{formatPrice(pedido.subtotal)}</span>
                </div>
                {pedido.descuento > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Descuento</span>
                    <span className="text-green-600">-{formatPrice(pedido.descuento)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100">
                  <span className="text-gray-900">Total</span>
                  <span className="text-bordo">{formatPrice(pedido.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información lateral */}
        <div className="space-y-6">
          {/* Datos de envío */}
          <Card variant="outlined">
            <CardHeader>
              <CardTitle className="text-base">Datos de envío</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Nombre</p>
                <p className="font-medium text-gray-900">{pedido.nombre_completo}</p>
              </div>
              {pedido.direccion_envio && (
                <div>
                  <p className="text-gray-500">Dirección</p>
                  <p className="font-medium text-gray-900">
                    {pedido.direccion_envio}
                    {pedido.ciudad && `, ${pedido.ciudad}`}
                  </p>
                </div>
              )}
              {pedido.telefono && (
                <div>
                  <p className="text-gray-500">Teléfono</p>
                  <p className="font-medium text-gray-900">{pedido.telefono}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{pedido.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Información de pago */}
          <Card variant="outlined">
            <CardHeader>
              <CardTitle className="text-base">Información de pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Método de pago</p>
                <p className="font-medium text-gray-900 capitalize">
                  {pedido.metodo_pago || "MercadoPago"}
                </p>
              </div>
              {pedido.mercadopago_payment_id && (
                <div>
                  <p className="text-gray-500">ID de pago</p>
                  <p className="font-mono text-xs text-gray-900">{pedido.mercadopago_payment_id}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notas */}
          {pedido.notas && (
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-base">Notas del pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{pedido.notas}</p>
              </CardContent>
            </Card>
          )}

          {/* Acciones */}
          <div className="space-y-3">
            {pedido.estado === "pendiente" && (
              <Button className="w-full" variant="primary">
                Completar Pago
              </Button>
            )}
            <a
              href={`mailto:secretaria@clubseminario.com.uy?subject=Consulta sobre pedido ${pedido.numero_pedido}`}
              className="w-full inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-xl border-2 border-bordo text-bordo bg-transparent hover:bg-bordo hover:text-white transition-all"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Contactar por este pedido
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
