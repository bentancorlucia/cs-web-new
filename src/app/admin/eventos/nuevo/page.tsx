"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface EventoForm {
  titulo: string;
  descripcion: string;
  descripcion_corta: string;
  fecha_evento: string;
  fecha_fin: string;
  hora_apertura: string;
  hora_cierre: string;
  ubicacion: string;
  direccion: string;
  imagen_url: string;
  capacidad_total: number | null;
  edad_minima: number | null;
  incluye: string[];
  solo_socios: boolean;
  activo: boolean;
  publicado: boolean;
}

const defaultForm: EventoForm = {
  titulo: "",
  descripcion: "",
  descripcion_corta: "",
  fecha_evento: "",
  fecha_fin: "",
  hora_apertura: "",
  hora_cierre: "",
  ubicacion: "",
  direccion: "",
  imagen_url: "",
  capacidad_total: null,
  edad_minima: null,
  incluye: [],
  solo_socios: false,
  activo: true,
  publicado: false,
};

export default function NuevoEventoPage() {
  const router = useRouter();
  const [form, setForm] = useState<EventoForm>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof EventoForm, string>>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: typeof errors = {};
    if (!form.titulo) newErrors.titulo = "El título es requerido";
    if (!form.fecha_evento) newErrors.fecha_evento = "La fecha es requerida";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const slug = form.titulo
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const { data: evento, error } = await supabase
        .from("eventos_sociales")
        .insert({
          ...form,
          slug,
          fecha_fin: form.fecha_fin || null,
          hora_apertura: form.hora_apertura || null,
          hora_cierre: form.hora_cierre || null,
          capacidad_total: form.capacidad_total || null,
          edad_minima: form.edad_minima || null,
          imagen_url: form.imagen_url || null,
        })
        .select()
        .single();

      if (error) throw error;

      router.push(`/admin/eventos/${evento.id}`);
    } catch (error) {
      console.error("Error creating evento:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Nuevo Evento"
        subtitle="Crear un nuevo evento social"
      />

      <form onSubmit={handleSubmit} className="px-5 md:px-8 py-6 md:py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Basic Info */}
          <Card padding="lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Información del Evento
            </h2>
            <div className="space-y-6">
              <Input
                label="Título del evento"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                error={errors.titulo}
                placeholder="Ej: Fiesta de Fin de Año 2024"
              />

              <Textarea
                label="Descripción corta"
                value={form.descripcion_corta}
                onChange={(e) =>
                  setForm({ ...form, descripcion_corta: e.target.value })
                }
                placeholder="Breve descripción para listados"
                size="sm"
              />

              <Textarea
                label="Descripción completa"
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
                placeholder="Descripción detallada del evento"
              />

              <Input
                label="URL de imagen"
                value={form.imagen_url}
                onChange={(e) =>
                  setForm({ ...form, imagen_url: e.target.value })
                }
                placeholder="https://..."
              />

              {form.imagen_url && (
                <div className="w-48 h-32 rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={form.imagen_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Date & Time */}
          <Card padding="lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Fecha y Hora
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Fecha del evento"
                type="date"
                value={form.fecha_evento}
                onChange={(e) =>
                  setForm({ ...form, fecha_evento: e.target.value })
                }
                error={errors.fecha_evento}
              />
              <Input
                label="Fecha de fin (opcional)"
                type="date"
                value={form.fecha_fin}
                onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
                hint="Solo si el evento dura más de un día"
              />
              <Input
                label="Hora de apertura"
                type="time"
                value={form.hora_apertura}
                onChange={(e) =>
                  setForm({ ...form, hora_apertura: e.target.value })
                }
              />
              <Input
                label="Hora de cierre"
                type="time"
                value={form.hora_cierre}
                onChange={(e) =>
                  setForm({ ...form, hora_cierre: e.target.value })
                }
              />
            </div>
          </Card>

          {/* Location */}
          <Card padding="lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Ubicación
            </h2>
            <div className="space-y-6">
              <Input
                label="Nombre del lugar"
                value={form.ubicacion}
                onChange={(e) =>
                  setForm({ ...form, ubicacion: e.target.value })
                }
                placeholder="Ej: Club Seminario - Salón Principal"
              />
              <Input
                label="Dirección"
                value={form.direccion}
                onChange={(e) =>
                  setForm({ ...form, direccion: e.target.value })
                }
                placeholder="Ej: Soriano 1472, Montevideo"
              />
            </div>
          </Card>

          {/* Capacity & Restrictions */}
          <Card padding="lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Capacidad y Restricciones
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Capacidad total"
                type="number"
                min={0}
                value={form.capacidad_total ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    capacidad_total: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                hint="Dejar vacío para capacidad ilimitada"
              />
              <Input
                label="Edad mínima"
                type="number"
                min={0}
                value={form.edad_minima ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    edad_minima: e.target.value ? Number(e.target.value) : null,
                  })
                }
                hint="Dejar vacío si no hay restricción"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Qué incluye? (separado por coma)
              </label>
              <Input
                value={form.incluye.join(", ")}
                onChange={(e) =>
                  setForm({
                    ...form,
                    incluye: e.target.value
                      .split(",")
                      .map((i) => i.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="Ej: Cena, Show en vivo, DJ"
              />
            </div>
          </Card>

          {/* Options */}
          <Card padding="lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Opciones
            </h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.solo_socios}
                  onChange={(e) =>
                    setForm({ ...form, solo_socios: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-gray-300 text-bordo focus:ring-bordo/20"
                />
                <div>
                  <span className="font-medium text-gray-900">
                    Solo para socios
                  </span>
                  <p className="text-sm text-gray-500">
                    Solo los socios podrán comprar entradas
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(e) =>
                    setForm({ ...form, activo: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-gray-300 text-bordo focus:ring-bordo/20"
                />
                <div>
                  <span className="font-medium text-gray-900">Evento activo</span>
                  <p className="text-sm text-gray-500">
                    El evento está habilitado para venta de entradas
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.publicado}
                  onChange={(e) =>
                    setForm({ ...form, publicado: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-gray-300 text-bordo focus:ring-bordo/20"
                />
                <div>
                  <span className="font-medium text-gray-900">
                    Publicar inmediatamente
                  </span>
                  <p className="text-sm text-gray-500">
                    El evento será visible públicamente
                  </p>
                </div>
              </label>
            </div>
          </Card>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm text-blue-700">
                <p className="font-medium">Próximo paso: Configurar lotes y tipos de entrada</p>
                <p className="mt-1 text-blue-600">
                  Después de crear el evento, podrás agregar lotes de venta con
                  diferentes tipos de entrada y precios.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={loading}>
              Crear Evento
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
