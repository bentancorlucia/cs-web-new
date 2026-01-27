"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EventCard } from "@/components/eventos";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { EventoSocial } from "@/types/eventos";

interface EventosContentProps {
  initialEventos: Array<EventoSocial & { precio_desde?: number; entradas_vendidas?: number }>;
  initialFilters: {
    busqueda?: string;
    pasados?: boolean;
    soloSocios?: boolean;
  };
}

type FilterTab = "proximos" | "pasados" | "todos";

export function EventosContent({ initialEventos, initialFilters }: EventosContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [busqueda, setBusqueda] = useState(initialFilters.busqueda || "");
  const [activeTab, setActiveTab] = useState<FilterTab>(
    initialFilters.pasados ? "pasados" : "proximos"
  );
  const [soloSocios, setSoloSocios] = useState(initialFilters.soloSocios || false);

  const now = new Date();

  const filteredEventos = useMemo(() => {
    return initialEventos.filter((evento) => {
      const fechaEvento = new Date(evento.fecha_evento);
      const esPasado = fechaEvento < now;

      // Tab filter
      if (activeTab === "proximos" && esPasado) return false;
      if (activeTab === "pasados" && !esPasado) return false;

      // Socios filter
      if (soloSocios && !evento.solo_socios) return false;

      // Search filter
      if (busqueda) {
        const searchLower = busqueda.toLowerCase();
        const matchesTitulo = evento.titulo.toLowerCase().includes(searchLower);
        const matchesDescripcion = evento.descripcion?.toLowerCase().includes(searchLower);
        const matchesUbicacion = evento.ubicacion?.toLowerCase().includes(searchLower);
        if (!matchesTitulo && !matchesDescripcion && !matchesUbicacion) {
          return false;
        }
      }

      return true;
    });
  }, [initialEventos, activeTab, soloSocios, busqueda, now]);

  // Get featured event (first upcoming)
  const featuredEvento = useMemo(() => {
    if (activeTab !== "proximos") return null;
    return filteredEventos.find((e) => new Date(e.fecha_evento) >= now);
  }, [filteredEventos, activeTab, now]);

  // Rest of events (excluding featured)
  const restEventos = useMemo(() => {
    if (!featuredEvento) return filteredEventos;
    return filteredEventos.filter((e) => e.id !== featuredEvento.id);
  }, [filteredEventos, featuredEvento]);

  const updateUrl = (params: Record<string, string | undefined>) => {
    const current = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });

    const search = current.toString();
    router.push(search ? `?${search}` : "/eventos", { scroll: false });
  };

  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
    updateUrl({ pasados: tab === "pasados" ? "true" : undefined });
  };

  const handleSearch = (value: string) => {
    setBusqueda(value);
    // Debounce the URL update
    const timeoutId = setTimeout(() => {
      updateUrl({ busqueda: value || undefined });
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  const handleSoloSociosChange = (checked: boolean) => {
    setSoloSocios(checked);
    updateUrl({ soloSocios: checked ? "true" : undefined });
  };

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Tabs */}
        <div className="flex gap-2" role="tablist" aria-label="Filtrar eventos por fecha">
          {(["proximos", "pasados", "todos"] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => handleTabChange(tab)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordo focus-visible:ring-offset-2",
                activeTab === tab
                  ? "bg-bordo text-white shadow-lg shadow-bordo/25"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              )}
            >
              {tab === "proximos" && "Próximos"}
              {tab === "pasados" && "Pasados"}
              {tab === "todos" && "Todos"}
            </button>
          ))}
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Input
              type="search"
              placeholder="Buscar eventos..."
              value={busqueda}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full sm:w-64 pl-10"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <label className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-bordo/30 transition-colors">
            <input
              id="filter-solo-socios"
              type="checkbox"
              checked={soloSocios}
              onChange={(e) => handleSoloSociosChange(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-bordo focus:ring-bordo"
            />
            <span className="text-sm text-gray-700" id="filter-solo-socios-label">Solo socios</span>
          </label>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {filteredEventos.length === 0 ? (
            "No se encontraron eventos"
          ) : filteredEventos.length === 1 ? (
            "1 evento encontrado"
          ) : (
            `${filteredEventos.length} eventos encontrados`
          )}
        </p>
      </div>

      {/* Featured Event */}
      {featuredEvento && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Próximo evento
          </h2>
          <EventCard
            evento={{
              id: featuredEvento.id,
              slug: featuredEvento.slug,
              titulo: featuredEvento.titulo,
              descripcion_corta: featuredEvento.descripcion_corta,
              fecha_evento: featuredEvento.fecha_evento,
              hora_apertura: featuredEvento.hora_apertura,
              ubicacion: featuredEvento.ubicacion,
              imagen_url: featuredEvento.imagen_url,
              solo_socios: featuredEvento.solo_socios,
              capacidad_total: featuredEvento.capacidad_total,
              precio_desde: featuredEvento.precio_desde,
              entradas_vendidas: featuredEvento.entradas_vendidas,
            }}
            variant="featured"
          />
        </div>
      )}

      {/* Events Grid */}
      {restEventos.length > 0 ? (
        <div>
          {featuredEvento && (
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Más eventos
            </h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restEventos.map((evento) => (
              <EventCard
                key={evento.id}
                evento={{
                  id: evento.id,
                  slug: evento.slug,
                  titulo: evento.titulo,
                  descripcion_corta: evento.descripcion_corta,
                  fecha_evento: evento.fecha_evento,
                  hora_apertura: evento.hora_apertura,
                  ubicacion: evento.ubicacion,
                  imagen_url: evento.imagen_url,
                  solo_socios: evento.solo_socios,
                  capacidad_total: evento.capacidad_total,
                  precio_desde: evento.precio_desde,
                  entradas_vendidas: evento.entradas_vendidas,
                }}
              />
            ))}
          </div>
        </div>
      ) : filteredEventos.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay eventos
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {activeTab === "proximos"
              ? "No hay eventos programados próximamente. Volvé a consultar pronto."
              : activeTab === "pasados"
              ? "No se encontraron eventos pasados con esos criterios."
              : "No se encontraron eventos con esos criterios."}
          </p>
          {(busqueda || soloSocios) && (
            <button
              onClick={() => {
                setBusqueda("");
                setSoloSocios(false);
                updateUrl({ busqueda: undefined, soloSocios: undefined });
              }}
              className="mt-4 text-sm text-bordo font-medium hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
