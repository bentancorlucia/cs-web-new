"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminHeader, DataTable, StatusBadge, type Column } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, formatDate } from "@/lib/utils";
import type { EventoSocial, EstadisticasEvento } from "@/types/eventos";

interface EventoConEstadisticas extends EventoSocial {
  estadisticas?: EstadisticasEvento;
}

export default function EventosPage() {
  const router = useRouter();
  const [eventos, setEventos] = useState<EventoConEstadisticas[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    evento: EventoConEstadisticas | null;
  }>({
    open: false,
    evento: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const fetchEventos = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);

    try {
      let query = supabase
        .from("eventos_sociales")
        .select("*", { count: "exact" })
        .order("fecha_evento", { ascending: false });

      if (searchQuery) {
        query = query.ilike("titulo", `%${searchQuery}%`);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;

      // Fetch statistics for each event
      if (data) {
        const eventosConStats = await Promise.all(
          data.map(async (evento) => {
            const { data: stats } = await supabase
              .from("estadisticas_evento")
              .select("*")
              .eq("evento_id", evento.id)
              .single();

            return { ...evento, estadisticas: stats ?? undefined };
          })
        );
        setEventos(eventosConStats);
      }

      setTotal(count ?? 0);
    } catch (error) {
      console.error("Error fetching eventos:", error);
      setEventos([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  const handleDelete = async () => {
    if (!deleteModal.evento) return;

    setDeleting(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("eventos_sociales")
        .delete()
        .eq("id", deleteModal.evento.id);

      if (error) throw error;

      setDeleteModal({ open: false, evento: null });
      fetchEventos();
    } catch (error) {
      console.error("Error deleting evento:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublished = async (evento: EventoConEstadisticas) => {
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("eventos_sociales")
        .update({ publicado: !evento.publicado })
        .eq("id", evento.id);

      if (error) throw error;

      fetchEventos();
    } catch (error) {
      console.error("Error toggling evento:", error);
    }
  };

  const getEventStatus = (evento: EventoConEstadisticas) => {
    const now = new Date();
    const eventDate = new Date(evento.fecha_evento);

    if (!evento.publicado) return "borrador";
    if (eventDate < now) return "finalizado";
    return "publicado";
  };

  const columns: Column<EventoConEstadisticas>[] = [
    {
      key: "titulo",
      label: "Evento",
      sortable: true,
      render: (evento) => (
        <div className="flex items-center gap-4">
          <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
            {evento.imagen_url ? (
              <img
                src={evento.imagen_url}
                alt={evento.titulo}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-bordo/20 to-amarillo/20">
                <svg
                  className="w-6 h-6 text-bordo/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{evento.titulo}</p>
            <p className="text-sm text-gray-500">{evento.ubicacion}</p>
          </div>
        </div>
      ),
    },
    {
      key: "fecha_evento",
      label: "Fecha",
      sortable: true,
      render: (evento) => (
        <div>
          <p className="font-medium text-gray-900">
            {formatDate(evento.fecha_evento)}
          </p>
          {evento.hora_apertura && (
            <p className="text-sm text-gray-500">{evento.hora_apertura}</p>
          )}
        </div>
      ),
    },
    {
      key: "entradas",
      label: "Entradas",
      render: (evento) => (
        <div className="text-center">
          <p className="font-semibold text-gray-900">
            {evento.estadisticas?.total_vendidas ?? 0}
          </p>
          <p className="text-xs text-gray-500">
            / {evento.capacidad_total ?? "∞"}
          </p>
        </div>
      ),
    },
    {
      key: "ingresos",
      label: "Ingresos",
      render: (evento) => (
        <span className="font-semibold text-gray-900">
          {formatPrice(evento.estadisticas?.ingresos_totales ?? 0)}
        </span>
      ),
    },
    {
      key: "estado",
      label: "Estado",
      render: (evento) => (
        <StatusBadge status={getEventStatus(evento)} type="evento" />
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Eventos"
        subtitle={`${total} eventos en total`}
        actions={
          <Link href="/admin/eventos/nuevo">
            <Button
              leftIcon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              }
            >
              Nuevo Evento
            </Button>
          </Link>
        }
      />

      <div className="px-5 md:px-8 py-6 md:py-8">
        <DataTable
          data={eventos}
          columns={columns}
          keyExtractor={(evento) => evento.id}
          loading={loading}
          emptyMessage="No hay eventos. Crea el primero."
          searchable
          searchPlaceholder="Buscar por título..."
          onSearch={(query) => {
            setSearchQuery(query);
            setPage(1);
          }}
          onRowClick={(evento) => router.push(`/admin/eventos/${evento.id}`)}
          pagination={{
            page,
            pageSize,
            total,
            onPageChange: setPage,
          }}
          actions={(evento) => (
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => handleTogglePublished(evento)}
                className={`p-2 rounded-lg transition-colors ${
                  evento.publicado
                    ? "text-amber-600 hover:bg-amber-50"
                    : "text-emerald-600 hover:bg-emerald-50"
                }`}
                title={evento.publicado ? "Despublicar" : "Publicar"}
              >
                {evento.publicado ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.758 6.758M9.878 9.878a3.001 3.001 0 00-.002 4.24m4.244-4.244l3.12 3.12M3 3l3.757 3.757m0 0a9.969 9.969 0 015.372-2.638M21 21l-3.757-3.757m0 0a9.969 9.969 0 01-5.372 2.638"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
              <Link href={`/admin/eventos/${evento.id}`}>
                <button
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  title="Editar"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              </Link>
              <button
                onClick={() => setDeleteModal({ open: true, evento })}
                className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                title="Eliminar"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          )}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, evento: null })}
        title="Eliminar Evento"
        description="Esta acción no se puede deshacer. El evento y todas sus entradas serán eliminados permanentemente."
        size="sm"
      >
        {deleteModal.evento && (
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-bordo/20 to-amarillo/20 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-bordo"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {deleteModal.evento.titulo}
              </p>
              <p className="text-sm text-gray-500">
                {formatDate(deleteModal.evento.fecha_evento)}
              </p>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setDeleteModal({ open: false, evento: null })}
          >
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={deleting}>
            Eliminar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
