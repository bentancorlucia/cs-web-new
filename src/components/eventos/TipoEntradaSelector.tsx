"use client";

import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";

export interface TipoEntrada {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  precio_socio?: number;
  cantidad_total: number;
  cantidad_vendida: number;
  max_por_compra: number;
  incluye?: string[];
  activo: boolean;
  // Allow additional optional fields from database
  lote_id?: string;
  orden?: number;
  created_at?: string;
}

export interface TipoEntradaBasico {
  id: string;
  nombre: string;
  precio: number;
  precio_socio?: number;
}

interface TipoEntradaSelectorProps {
  tipos: TipoEntrada[];
  selections: Record<string, number>;
  onUpdateQuantity: (tipoId: string, cantidad: number, tipo: TipoEntradaBasico) => void;
  esSocio?: boolean;
}

export function TipoEntradaSelector({
  tipos,
  selections,
  onUpdateQuantity,
  esSocio = false,
}: TipoEntradaSelectorProps) {
  const tiposActivos = tipos.filter((t) => t.activo);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Tipos de entrada
      </h3>

      <div className="space-y-3">
        {tiposActivos.map((tipo) => {
          const disponibles = tipo.cantidad_total - tipo.cantidad_vendida;
          const agotado = disponibles <= 0;
          const cantidad = selections[tipo.id] || 0;
          const precioMostrar = esSocio && tipo.precio_socio ? tipo.precio_socio : tipo.precio;
          const tieneDescuento = esSocio && tipo.precio_socio && tipo.precio_socio < tipo.precio;

          return (
            <div
              key={tipo.id}
              className={cn(
                "relative p-5 rounded-xl border-2 transition-all duration-300",
                agotado
                  ? "border-gray-200 bg-gray-50 opacity-60"
                  : cantidad > 0
                  ? "border-bordo bg-bordo/5 shadow-md shadow-bordo/10"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Info del tipo */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{tipo.nombre}</h4>
                      {tipo.descripcion && (
                        <p className="text-sm text-gray-600 mt-0.5">{tipo.descripcion}</p>
                      )}
                    </div>

                    {/* Precio */}
                    <div className="text-right flex-shrink-0">
                      {tieneDescuento && (
                        <p className="text-sm text-gray-400 line-through">
                          {formatPrice(tipo.precio)}
                        </p>
                      )}
                      <p className={cn(
                        "text-xl font-bold",
                        tieneDescuento ? "text-green-600" : "text-bordo"
                      )}>
                        {formatPrice(precioMostrar)}
                      </p>
                      {tieneDescuento && (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Precio socio
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Incluye */}
                  {tipo.incluye && tipo.incluye.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tipo.incluye.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700"
                        >
                          <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {item}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Disponibilidad */}
                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                    {agotado ? (
                      <span className="flex items-center gap-1 text-red-600 font-medium">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Agotado
                      </span>
                    ) : disponibles <= 20 ? (
                      <span className="flex items-center gap-1 text-amarillo-dark font-medium">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Quedan {disponibles}
                      </span>
                    ) : (
                      <span>{disponibles} disponibles</span>
                    )}

                    <span className="text-gray-400">·</span>
                    <span>Máx. {tipo.max_por_compra} por compra</span>
                  </div>
                </div>

                {/* Selector de cantidad */}
                {!agotado && (
                  <div className="flex items-center gap-1 sm:self-center">
                    <button
                      onClick={() => onUpdateQuantity(tipo.id, cantidad - 1, { id: tipo.id, nombre: tipo.nombre, precio: tipo.precio, precio_socio: tipo.precio_socio })}
                      disabled={cantidad <= 0}
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-bordo focus-visible:ring-offset-2",
                        cantidad > 0
                          ? "bg-bordo text-white hover:bg-bordo-dark active:scale-95"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      )}
                      aria-label="Reducir cantidad"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>

                    <div className="w-14 h-10 flex items-center justify-center">
                      <span className={cn(
                        "text-lg font-bold tabular-nums",
                        cantidad > 0 ? "text-bordo" : "text-gray-400"
                      )}>
                        {cantidad}
                      </span>
                    </div>

                    <button
                      onClick={() => onUpdateQuantity(tipo.id, cantidad + 1, { id: tipo.id, nombre: tipo.nombre, precio: tipo.precio, precio_socio: tipo.precio_socio })}
                      disabled={cantidad >= tipo.max_por_compra || cantidad >= disponibles}
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-bordo focus-visible:ring-offset-2",
                        cantidad < tipo.max_por_compra && cantidad < disponibles
                          ? "bg-bordo text-white hover:bg-bordo-dark active:scale-95"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      )}
                      aria-label="Aumentar cantidad"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Subtotal si hay cantidad */}
              {cantidad > 0 && (
                <div className="mt-4 pt-3 border-t border-bordo/20 flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {cantidad} {cantidad === 1 ? "entrada" : "entradas"}
                  </span>
                  <span className="font-bold text-bordo">
                    {formatPrice(precioMostrar * cantidad)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {tiposActivos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <p>No hay tipos de entrada disponibles en este lote</p>
        </div>
      )}
    </div>
  );
}
