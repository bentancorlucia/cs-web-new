"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { AdminHeader, StatsCard, DataTable, type Column } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { EventoCompleto, LoteEntrada, TipoEntrada } from "@/types/eventos";

interface LoteForm {
  nombre: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  cantidad_maxima: number | null;
  activo: boolean;
}

interface TipoEntradaForm {
  nombre: string;
  descripcion: string;
  precio: number;
  precio_socio: number | null;
  cantidad_total: number;
  max_por_compra: number;
  activo: boolean;
}

export default function EditarEventoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [evento, setEvento] = useState<EventoCompleto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "lotes" | "entradas">("info");

  // Lote modal
  const [loteModal, setLoteModal] = useState<{
    open: boolean;
    lote: LoteEntrada | null;
  }>({ open: false, lote: null });
  const [loteForm, setLoteForm] = useState<LoteForm>({
    nombre: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: "",
    cantidad_maxima: null,
    activo: true,
  });
  const [savingLote, setSavingLote] = useState(false);

  // Tipo entrada modal
  const [tipoModal, setTipoModal] = useState<{
    open: boolean;
    loteId: string;
    tipo: TipoEntrada | null;
  }>({ open: false, loteId: "", tipo: null });
  const [tipoForm, setTipoForm] = useState<TipoEntradaForm>({
    nombre: "",
    descripcion: "",
    precio: 0,
    precio_socio: null,
    cantidad_total: 100,
    max_por_compra: 10,
    activo: true,
  });
  const [savingTipo, setSavingTipo] = useState(false);

  const fetchEvento = async () => {
    const supabase = createClient();

    const { data } = await supabase
      .from("eventos_sociales")
      .select(
        `
        *,
        lotes:lotes_entrada(
          *,
          tipos_entrada(*)
        )
      `
      )
      .eq("id", id)
      .single();

    if (data) {
      setEvento(data as EventoCompleto);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvento();
  }, [id]);

  const handleSaveEvento = async () => {
    if (!evento) return;
    setSaving(true);

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("eventos_sociales")
        .update({
          titulo: evento.titulo,
          descripcion: evento.descripcion,
          descripcion_corta: evento.descripcion_corta,
          fecha_evento: evento.fecha_evento,
          fecha_fin: evento.fecha_fin,
          hora_apertura: evento.hora_apertura,
          hora_cierre: evento.hora_cierre,
          ubicacion: evento.ubicacion,
          direccion: evento.direccion,
          imagen_url: evento.imagen_url,
          capacidad_total: evento.capacidad_total,
          edad_minima: evento.edad_minima,
          incluye: evento.incluye,
          solo_socios: evento.solo_socios,
          activo: evento.activo,
          publicado: evento.publicado,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error saving evento:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLote = async () => {
    // Validate required fields
    if (!loteForm.nombre.trim()) {
      alert("El nombre del lote es requerido");
      return;
    }
    if (!loteForm.fecha_inicio || !loteForm.fecha_fin) {
      alert("Las fechas de inicio y fin son requeridas");
      return;
    }

    setSavingLote(true);
    const supabase = createClient();

    try {
      // Convert date strings to ISO timestamps for TIMESTAMPTZ columns
      const loteData = {
        nombre: loteForm.nombre,
        descripcion: loteForm.descripcion || null,
        fecha_inicio: new Date(loteForm.fecha_inicio).toISOString(),
        fecha_fin: new Date(loteForm.fecha_fin + "T23:59:59").toISOString(),
        cantidad_maxima: loteForm.cantidad_maxima || null,
        activo: loteForm.activo,
      };

      if (loteModal.lote) {
        // Update
        const { error } = await supabase
          .from("lotes_entrada")
          .update(loteData)
          .eq("id", loteModal.lote.id);

        if (error) throw error;
      } else {
        // Create
        const orden = (evento?.lotes?.length ?? 0) + 1;
        const { error } = await supabase.from("lotes_entrada").insert({
          ...loteData,
          evento_id: id,
          orden,
        });

        if (error) throw error;
      }

      setLoteModal({ open: false, lote: null });
      fetchEvento();
    } catch (error) {
      console.error("Error saving lote:", error);
    } finally {
      setSavingLote(false);
    }
  };

  const handleSaveTipo = async () => {
    setSavingTipo(true);
    const supabase = createClient();

    try {
      if (tipoModal.tipo) {
        // Update
        const { error } = await supabase
          .from("tipos_entrada")
          .update({
            ...tipoForm,
            precio_socio: tipoForm.precio_socio || null,
          })
          .eq("id", tipoModal.tipo.id);

        if (error) throw error;
      } else {
        // Create
        const lote = evento?.lotes?.find((l) => l.id === tipoModal.loteId);
        const orden = (lote?.tipos_entrada?.length ?? 0) + 1;
        const { error } = await supabase.from("tipos_entrada").insert({
          ...tipoForm,
          lote_id: tipoModal.loteId,
          precio_socio: tipoForm.precio_socio || null,
          orden,
          cantidad_vendida: 0,
        });

        if (error) throw error;
      }

      setTipoModal({ open: false, loteId: "", tipo: null });
      fetchEvento();
    } catch (error) {
      console.error("Error saving tipo:", error);
    } finally {
      setSavingTipo(false);
    }
  };

  const openLoteModal = (lote: LoteEntrada | null = null) => {
    if (lote) {
      setLoteForm({
        nombre: lote.nombre,
        descripcion: lote.descripcion ?? "",
        fecha_inicio: lote.fecha_inicio.split("T")[0],
        fecha_fin: lote.fecha_fin.split("T")[0],
        cantidad_maxima: lote.cantidad_maxima ?? null,
        activo: lote.activo,
      });
    } else {
      setLoteForm({
        nombre: "",
        descripcion: "",
        fecha_inicio: "",
        fecha_fin: "",
        cantidad_maxima: null,
        activo: true,
      });
    }
    setLoteModal({ open: true, lote });
  };

  const openTipoModal = (loteId: string, tipo: TipoEntrada | null = null) => {
    if (tipo) {
      setTipoForm({
        nombre: tipo.nombre,
        descripcion: tipo.descripcion ?? "",
        precio: tipo.precio,
        precio_socio: tipo.precio_socio ?? null,
        cantidad_total: tipo.cantidad_total,
        max_por_compra: tipo.max_por_compra,
        activo: tipo.activo,
      });
    } else {
      setTipoForm({
        nombre: "",
        descripcion: "",
        precio: 0,
        precio_socio: null,
        cantidad_total: 100,
        max_por_compra: 10,
        activo: true,
      });
    }
    setTipoModal({ open: true, loteId, tipo });
  };

  if (loading || !evento) {
    return (
      <div className="min-h-screen">
        <AdminHeader title="Cargando..." />
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <Card padding="lg">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4" />
                <div className="h-10 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const totalVendidas = evento.lotes?.reduce(
    (sum, lote) =>
      sum +
      (lote.tipos_entrada?.reduce((s, t) => s + t.cantidad_vendida, 0) ?? 0),
    0
  ) ?? 0;

  const totalCapacidad = evento.lotes?.reduce(
    (sum, lote) =>
      sum +
      (lote.tipos_entrada?.reduce((s, t) => s + t.cantidad_total, 0) ?? 0),
    0
  ) ?? 0;

  return (
    <div className="min-h-screen">
      <AdminHeader
        title={evento.titulo}
        subtitle={`${formatDate(evento.fecha_evento)}${evento.ubicacion ? ` · ${evento.ubicacion}` : ""}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/eventos")}
            >
              Volver
            </Button>
            <Button onClick={handleSaveEvento} isLoading={saving}>
              Guardar Cambios
            </Button>
          </div>
        }
      />

      <div className="p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatsCard
              title="Entradas Vendidas"
              value={totalVendidas}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              }
              color="bordo"
            />
            <StatsCard
              title="Capacidad Total"
              value={totalCapacidad}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              color="blue"
            />
            <StatsCard
              title="Disponibles"
              value={totalCapacidad - totalVendidas}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="green"
            />
            <StatsCard
              title="Lotes Activos"
              value={evento.lotes?.filter((l) => l.activo).length ?? 0}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
              color="amarillo"
            />
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex gap-8">
              {(["info", "lotes", "entradas"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                    activeTab === tab
                      ? "border-bordo text-bordo"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  )}
                >
                  {tab === "info" && "Información"}
                  {tab === "lotes" && "Lotes y Precios"}
                  {tab === "entradas" && "Entradas Vendidas"}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "info" && (
            <div className="space-y-6">
              <Card padding="lg">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Información del Evento
                </h2>
                <div className="space-y-6">
                  <Input
                    label="Título"
                    value={evento.titulo}
                    onChange={(e) =>
                      setEvento({ ...evento, titulo: e.target.value })
                    }
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Fecha"
                      type="date"
                      value={evento.fecha_evento?.split("T")[0] ?? ""}
                      onChange={(e) =>
                        setEvento({ ...evento, fecha_evento: e.target.value })
                      }
                    />
                    <Input
                      label="Ubicación"
                      value={evento.ubicacion ?? ""}
                      onChange={(e) =>
                        setEvento({ ...evento, ubicacion: e.target.value })
                      }
                    />
                  </div>
                  <Textarea
                    label="Descripción"
                    value={evento.descripcion ?? ""}
                    onChange={(e) =>
                      setEvento({ ...evento, descripcion: e.target.value })
                    }
                  />
                </div>
              </Card>

              <Card padding="lg">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Opciones
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={evento.publicado}
                      onChange={(e) =>
                        setEvento({ ...evento, publicado: e.target.checked })
                      }
                      className="w-5 h-5 rounded border-gray-300 text-bordo focus:ring-bordo/20"
                    />
                    <span className="font-medium text-gray-900">Publicado</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={evento.solo_socios}
                      onChange={(e) =>
                        setEvento({ ...evento, solo_socios: e.target.checked })
                      }
                      className="w-5 h-5 rounded border-gray-300 text-bordo focus:ring-bordo/20"
                    />
                    <span className="font-medium text-gray-900">
                      Solo para socios
                    </span>
                  </label>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "lotes" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Lotes de Venta
                </h2>
                <Button
                  size="sm"
                  onClick={() => openLoteModal()}
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  }
                >
                  Nuevo Lote
                </Button>
              </div>

              {evento.lotes?.length === 0 ? (
                <Card padding="lg">
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No hay lotes configurados
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Crea lotes de venta con diferentes fechas y tipos de entrada.
                    </p>
                    <Button onClick={() => openLoteModal()}>Crear primer lote</Button>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  {evento.lotes?.map((lote) => (
                    <Card key={lote.id} padding="lg">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              {lote.nombre}
                            </h3>
                            {lote.activo ? (
                              <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                                Activo
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                Inactivo
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDate(lote.fecha_inicio)} -{" "}
                            {formatDate(lote.fecha_fin)}
                            {lote.cantidad_maxima && (
                              <span className="ml-2">
                                · Límite: {lote.tipos_entrada?.reduce((s, t) => s + t.cantidad_vendida, 0) ?? 0}/{lote.cantidad_maxima}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openLoteModal(lote)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openTipoModal(lote.id)}
                          >
                            + Tipo entrada
                          </Button>
                        </div>
                      </div>

                      {lote.tipos_entrada?.length === 0 ? (
                        <div className="py-4 text-center text-gray-500 text-sm border-t border-gray-100">
                          Sin tipos de entrada configurados
                        </div>
                      ) : (
                        <div className="border-t border-gray-100 pt-4">
                          <table className="w-full">
                            <thead>
                              <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                                <th className="pb-2">Tipo</th>
                                <th className="pb-2">Precio</th>
                                <th className="pb-2">Precio Socio</th>
                                <th className="pb-2">Vendidas</th>
                                <th className="pb-2">Disponibles</th>
                                <th className="pb-2"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {lote.tipos_entrada?.map((tipo) => (
                                <tr key={tipo.id}>
                                  <td className="py-3 font-medium text-gray-900">
                                    {tipo.nombre}
                                  </td>
                                  <td className="py-3">
                                    {formatPrice(tipo.precio)}
                                  </td>
                                  <td className="py-3">
                                    {tipo.precio_socio
                                      ? formatPrice(tipo.precio_socio)
                                      : "-"}
                                  </td>
                                  <td className="py-3">{tipo.cantidad_vendida}</td>
                                  <td className="py-3">
                                    {tipo.cantidad_total - tipo.cantidad_vendida}
                                  </td>
                                  <td className="py-3 text-right">
                                    <button
                                      onClick={() => openTipoModal(lote.id, tipo)}
                                      className="text-gray-400 hover:text-gray-600"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "entradas" && (
            <Card padding="lg">
              <p className="text-gray-500 text-center py-8">
                Listado de entradas vendidas próximamente...
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Lote Modal */}
      <Modal
        isOpen={loteModal.open}
        onClose={() => setLoteModal({ open: false, lote: null })}
        title={loteModal.lote ? "Editar Lote" : "Nuevo Lote"}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Nombre del lote"
            value={loteForm.nombre}
            onChange={(e) => setLoteForm({ ...loteForm, nombre: e.target.value })}
            placeholder="Ej: Preventa, Early Bird, General"
          />
          <Textarea
            label="Descripción (opcional)"
            value={loteForm.descripcion}
            onChange={(e) => setLoteForm({ ...loteForm, descripcion: e.target.value })}
            size="sm"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fecha inicio"
              type="date"
              value={loteForm.fecha_inicio}
              onChange={(e) => setLoteForm({ ...loteForm, fecha_inicio: e.target.value })}
            />
            <Input
              label="Fecha fin"
              type="date"
              value={loteForm.fecha_fin}
              onChange={(e) => setLoteForm({ ...loteForm, fecha_fin: e.target.value })}
            />
          </div>
          <Input
            label="Cantidad máxima de entradas (opcional)"
            type="number"
            min={1}
            value={loteForm.cantidad_maxima ?? ""}
            onChange={(e) =>
              setLoteForm({
                ...loteForm,
                cantidad_maxima: e.target.value ? Number(e.target.value) : null,
              })
            }
            placeholder="Dejar vacío para sin límite"
          />
          <p className="text-sm text-gray-500 -mt-2">
            El lote se cerrará cuando se alcance esta cantidad o la fecha fin, lo que ocurra primero.
          </p>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={loteForm.activo}
              onChange={(e) => setLoteForm({ ...loteForm, activo: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-bordo focus:ring-bordo/20"
            />
            <span className="font-medium text-gray-900">Lote activo</span>
          </label>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setLoteModal({ open: false, lote: null })}>
            Cancelar
          </Button>
          <Button onClick={handleSaveLote} isLoading={savingLote}>
            {loteModal.lote ? "Guardar" : "Crear Lote"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Tipo Entrada Modal */}
      <Modal
        isOpen={tipoModal.open}
        onClose={() => setTipoModal({ open: false, loteId: "", tipo: null })}
        title={tipoModal.tipo ? "Editar Tipo de Entrada" : "Nuevo Tipo de Entrada"}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Nombre"
            value={tipoForm.nombre}
            onChange={(e) => setTipoForm({ ...tipoForm, nombre: e.target.value })}
            placeholder="Ej: General, VIP, Mesa"
          />
          <Textarea
            label="Descripción (opcional)"
            value={tipoForm.descripcion}
            onChange={(e) => setTipoForm({ ...tipoForm, descripcion: e.target.value })}
            size="sm"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Precio"
              type="number"
              min={0}
              value={tipoForm.precio}
              onChange={(e) => setTipoForm({ ...tipoForm, precio: Number(e.target.value) })}
              leftIcon={<span className="text-gray-400">$</span>}
            />
            <Input
              label="Precio Socio (opcional)"
              type="number"
              min={0}
              value={tipoForm.precio_socio ?? ""}
              onChange={(e) =>
                setTipoForm({
                  ...tipoForm,
                  precio_socio: e.target.value ? Number(e.target.value) : null,
                })
              }
              leftIcon={<span className="text-gray-400">$</span>}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cantidad total"
              type="number"
              min={1}
              value={tipoForm.cantidad_total}
              onChange={(e) => setTipoForm({ ...tipoForm, cantidad_total: Number(e.target.value) })}
            />
            <Input
              label="Máximo por compra"
              type="number"
              min={1}
              value={tipoForm.max_por_compra}
              onChange={(e) => setTipoForm({ ...tipoForm, max_por_compra: Number(e.target.value) })}
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={tipoForm.activo}
              onChange={(e) => setTipoForm({ ...tipoForm, activo: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-bordo focus:ring-bordo/20"
            />
            <span className="font-medium text-gray-900">Tipo activo</span>
          </label>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setTipoModal({ open: false, loteId: "", tipo: null })}>
            Cancelar
          </Button>
          <Button onClick={handleSaveTipo} isLoading={savingTipo}>
            {tipoModal.tipo ? "Guardar" : "Crear Tipo"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
