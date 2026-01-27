"use client";

import { cn } from "@/lib/utils";

export interface Lote {
  id: string;
  nombre: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  orden?: number;
}

interface LoteSelectorProps {
  lotes: Lote[];
  selectedLoteId: string | null;
  onSelectLote: (lote: Lote) => void;
}

export function LoteSelector({ lotes, selectedLoteId, onSelectLote }: LoteSelectorProps) {
  const ahora = new Date();

  const getLoteStatus = (lote: Lote) => {
    const inicio = new Date(lote.fecha_inicio);
    const fin = new Date(lote.fecha_fin);

    if (!lote.activo) return "inactivo";
    if (ahora < inicio) return "proximo";
    if (ahora > fin) return "finalizado";
    return "activo";
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-UY", {
      day: "2-digit",
      month: "short",
    });
  };

  const lotesSorted = [...lotes].sort((a, b) => a.orden ?? 0 - (b.orden ?? 0));

  return (
    <div className="space-y-3">
      <h3 id="lote-selector-label" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Seleccionar lote de entradas
      </h3>

      <div className="grid gap-3" role="radiogroup" aria-labelledby="lote-selector-label">
        {lotesSorted.map((lote) => {
          const status = getLoteStatus(lote);
          const isSelected = selectedLoteId === lote.id;
          const isDisabled = status !== "activo";

          return (
            <button
              key={lote.id}
              role="radio"
              aria-checked={isSelected}
              onClick={() => !isDisabled && onSelectLote(lote)}
              disabled={isDisabled}
              className={cn(
                "relative w-full text-left p-4 rounded-xl border-2 transition-all duration-300",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-bordo focus-visible:ring-offset-2",
                isSelected && status === "activo" && [
                  "border-bordo bg-bordo/5",
                  "shadow-lg shadow-bordo/10",
                ],
                !isSelected && status === "activo" && [
                  "border-gray-200 bg-white",
                  "hover:border-bordo/40 hover:bg-bordo/[0.02]",
                ],
                status === "proximo" && [
                  "border-amarillo/50 bg-amarillo/5",
                  "cursor-not-allowed opacity-70",
                ],
                status === "finalizado" && [
                  "border-gray-200 bg-gray-50",
                  "cursor-not-allowed opacity-50",
                ],
                status === "inactivo" && [
                  "border-gray-200 bg-gray-50",
                  "cursor-not-allowed opacity-50",
                ]
              )}
            >
              {/* Indicador de selección */}
              <div className={cn(
                "absolute top-4 right-4 w-5 h-5 rounded-full border-2 transition-all duration-300",
                "flex items-center justify-center",
                isSelected && status === "activo"
                  ? "border-bordo bg-bordo"
                  : "border-gray-300 bg-white"
              )}>
                {isSelected && status === "activo" && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>

              {/* Contenido */}
              <div className="pr-8">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={cn(
                    "font-semibold",
                    isSelected && status === "activo" ? "text-bordo" : "text-gray-900"
                  )}>
                    {lote.nombre}
                  </h4>

                  {/* Badge de estado */}
                  {status === "activo" && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Disponible
                    </span>
                  )}
                  {status === "proximo" && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amarillo/20 text-amarillo-dark">
                      Próximamente
                    </span>
                  )}
                  {status === "finalizado" && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                      Finalizado
                    </span>
                  )}
                </div>

                {lote.descripcion && (
                  <p className="text-sm text-gray-600 mb-2">
                    {lote.descripcion}
                  </p>
                )}

                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatFecha(lote.fecha_inicio)} - {formatFecha(lote.fecha_fin)}
                </p>
              </div>

              {/* Barra de progreso visual para lotes activos */}
              {status === "activo" && (
                <div className="mt-3 h-1 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-bordo to-bordo-light rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        ((ahora.getTime() - new Date(lote.fecha_inicio).getTime()) /
                          (new Date(lote.fecha_fin).getTime() - new Date(lote.fecha_inicio).getTime())) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {lotes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>No hay lotes de entradas disponibles</p>
        </div>
      )}
    </div>
  );
}
