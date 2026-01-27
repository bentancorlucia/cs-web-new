"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminHeader, DataTable, StatusBadge, type Column } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, formatDate, formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { PedidoConItems, EstadoPedido } from "@/types/tienda";

const estadoOptions: { value: EstadoPedido; label: string }[] = [
  { value: "pendiente", label: "Pendiente" },
  { value: "pagado", label: "Pagado" },
  { value: "preparando", label: "Preparando" },
  { value: "enviado", label: "Enviado" },
  { value: "entregado", label: "Entregado" },
  { value: "cancelado", label: "Cancelado" },
];

export default function PedidosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const estadoFilter = searchParams.get("estado") as EstadoPedido | null;

  const [pedidos, setPedidos] = useState<PedidoConItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEstado, setSelectedEstado] = useState<EstadoPedido | "todos">(
    estadoFilter ?? "todos"
  );
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 15;

  // Detail modal
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    pedido: PedidoConItems | null;
  }>({ open: false, pedido: null });

  // Status change modal
  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    pedido: PedidoConItems | null;
    newStatus: EstadoPedido | null;
  }>({ open: false, pedido: null, newStatus: null });
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchPedidos = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);

    try {
      let query = supabase
        .from("pedidos")
        .select(
          `
          *,
          items:items_pedido(*),
          metodo_envio:metodos_envio(*)
        `,
          { count: "exact" }
        )
        .order("created_at", { ascending: false });

      if (selectedEstado !== "todos") {
        query = query.eq("estado", selectedEstado);
      }

      if (searchQuery) {
        query = query.or(
          `numero_pedido.ilike.%${searchQuery}%,nombre_completo.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`
        );
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;

      setPedidos(data ?? []);
      setTotal(count ?? 0);
    } catch (error) {
      console.error("Error fetching pedidos:", error);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, selectedEstado]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  const handleStatusChange = async () => {
    if (!statusModal.pedido || !statusModal.newStatus) return;

    setUpdatingStatus(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("pedidos")
        .update({
          estado: statusModal.newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", statusModal.pedido.id);

      if (error) throw error;

      setStatusModal({ open: false, pedido: null, newStatus: null });
      fetchPedidos();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const columns: Column<PedidoConItems>[] = [
    {
      key: "numero_pedido",
      label: "Pedido",
      render: (pedido) => (
        <span className="font-mono text-sm font-semibold text-gray-900">
          {pedido.numero_pedido}
        </span>
      ),
    },
    {
      key: "cliente",
      label: "Cliente",
      render: (pedido) => (
        <div>
          <p className="font-medium text-gray-900">{pedido.nombre_completo}</p>
          <p className="text-sm text-gray-500">{pedido.email}</p>
        </div>
      ),
    },
    {
      key: "items",
      label: "Items",
      render: (pedido) => (
        <span className="text-gray-600">{pedido.items?.length ?? 0} productos</span>
      ),
    },
    {
      key: "total",
      label: "Total",
      sortable: true,
      render: (pedido) => (
        <span className="font-semibold text-gray-900">
          {formatPrice(pedido.total)}
        </span>
      ),
    },
    {
      key: "estado",
      label: "Estado",
      render: (pedido) => <StatusBadge status={pedido.estado} type="pedido" />,
    },
    {
      key: "created_at",
      label: "Fecha",
      sortable: true,
      render: (pedido) => (
        <span className="text-sm text-gray-500">
          {formatDate(pedido.created_at)}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Pedidos"
        subtitle={`${total} pedidos en total`}
      />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setSelectedEstado("todos");
              setPage(1);
            }}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              selectedEstado === "todos"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            )}
          >
            Todos
          </button>
          {estadoOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setSelectedEstado(option.value);
                setPage(1);
              }}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                selectedEstado === option.value
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <DataTable
          data={pedidos}
          columns={columns}
          keyExtractor={(pedido) => pedido.id}
          loading={loading}
          emptyMessage="No hay pedidos"
          searchable
          searchPlaceholder="Buscar por número, nombre o email..."
          onSearch={(query) => {
            setSearchQuery(query);
            setPage(1);
          }}
          onRowClick={(pedido) => setDetailModal({ open: true, pedido })}
          pagination={{
            page,
            pageSize,
            total,
            onPageChange: setPage,
          }}
          actions={(pedido) => (
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDetailModal({ open: true, pedido })}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title="Ver detalles"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          )}
        />
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={detailModal.open}
        onClose={() => setDetailModal({ open: false, pedido: null })}
        title={`Pedido ${detailModal.pedido?.numero_pedido ?? ""}`}
        size="lg"
      >
        {detailModal.pedido && (
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm text-gray-500">Estado actual</p>
                <div className="mt-1">
                  <StatusBadge
                    status={detailModal.pedido.estado}
                    type="pedido"
                    size="md"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setStatusModal({
                    open: true,
                    pedido: detailModal.pedido,
                    newStatus: null,
                  })
                }
              >
                Cambiar estado
              </Button>
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Información del cliente
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Nombre</p>
                  <p className="font-medium text-gray-900">
                    {detailModal.pedido.nombre_completo}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">
                    {detailModal.pedido.email}
                  </p>
                </div>
                {detailModal.pedido.telefono && (
                  <div>
                    <p className="text-gray-500">Teléfono</p>
                    <p className="font-medium text-gray-900">
                      {detailModal.pedido.telefono}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Info */}
            {detailModal.pedido.direccion_envio && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Dirección de envío
                </h3>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {detailModal.pedido.direccion_envio}
                  </p>
                  <p className="text-gray-600">
                    {detailModal.pedido.ciudad}
                    {detailModal.pedido.departamento &&
                      `, ${detailModal.pedido.departamento}`}
                    {detailModal.pedido.codigo_postal &&
                      ` (${detailModal.pedido.codigo_postal})`}
                  </p>
                </div>
              </div>
            )}

            {/* Items */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Productos</h3>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">
                        Producto
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-gray-500">
                        Cant.
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">
                        Precio
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {detailModal.pedido.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">
                            {item.nombre_producto}
                          </p>
                          {(item.talla || item.color) && (
                            <p className="text-gray-500 text-xs mt-0.5">
                              {[item.talla, item.color].filter(Boolean).join(" / ")}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">
                          {item.cantidad}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {formatPrice(item.precio_unitario)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          {formatPrice(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">
                    {formatPrice(detailModal.pedido.subtotal)}
                  </span>
                </div>
                {detailModal.pedido.costo_envio > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Envío</span>
                    <span className="text-gray-900">
                      {formatPrice(detailModal.pedido.costo_envio)}
                    </span>
                  </div>
                )}
                {detailModal.pedido.descuento > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Descuento</span>
                    <span className="text-emerald-600">
                      -{formatPrice(detailModal.pedido.descuento)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900 text-lg">
                    {formatPrice(detailModal.pedido.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="text-xs text-gray-500 flex justify-between pt-2 border-t border-gray-100">
              <span>Creado: {formatDateTime(detailModal.pedido.created_at)}</span>
              <span>
                Actualizado: {formatDateTime(detailModal.pedido.updated_at)}
              </span>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setDetailModal({ open: false, pedido: null })}
          >
            Cerrar
          </Button>
        </ModalFooter>
      </Modal>

      {/* Status Change Modal */}
      <Modal
        isOpen={statusModal.open}
        onClose={() =>
          setStatusModal({ open: false, pedido: null, newStatus: null })
        }
        title="Cambiar Estado"
        description={`Selecciona el nuevo estado para el pedido ${statusModal.pedido?.numero_pedido}`}
        size="sm"
      >
        <div className="space-y-2">
          {estadoOptions.map((option) => (
            <button
              key={option.value}
              onClick={() =>
                setStatusModal({ ...statusModal, newStatus: option.value })
              }
              disabled={statusModal.pedido?.estado === option.value}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all",
                statusModal.newStatus === option.value
                  ? "border-bordo bg-bordo/5"
                  : statusModal.pedido?.estado === option.value
                  ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex items-center gap-3">
                <StatusBadge status={option.value} type="pedido" />
                {statusModal.pedido?.estado === option.value && (
                  <span className="text-xs text-gray-500">(actual)</span>
                )}
              </div>
              {statusModal.newStatus === option.value && (
                <svg
                  className="w-5 h-5 text-bordo"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() =>
              setStatusModal({ open: false, pedido: null, newStatus: null })
            }
          >
            Cancelar
          </Button>
          <Button
            onClick={handleStatusChange}
            isLoading={updatingStatus}
            disabled={!statusModal.newStatus}
          >
            Actualizar Estado
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
