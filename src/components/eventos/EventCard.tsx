"use client";

import { forwardRef, type HTMLAttributes } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface EventCardProps extends HTMLAttributes<HTMLDivElement> {
  evento: {
    id: string;
    slug: string;
    titulo: string;
    descripcion_corta?: string;
    fecha_evento: string;
    hora_apertura?: string;
    ubicacion?: string;
    imagen_url?: string;
    solo_socios?: boolean;
    capacidad_total?: number;
    precio_desde?: number;
    entradas_vendidas?: number;
  };
  variant?: "default" | "featured" | "compact";
}

const EventCard = forwardRef<HTMLDivElement, EventCardProps>(
  ({ className, evento, variant = "default", ...props }, ref) => {
    const {
      slug,
      titulo,
      descripcion_corta,
      fecha_evento,
      hora_apertura,
      ubicacion,
      imagen_url,
      solo_socios,
      capacidad_total,
      precio_desde,
      entradas_vendidas = 0,
    } = evento;

    const fechaEvento = new Date(fecha_evento);
    const ahora = new Date();
    const esPasado = fechaEvento < ahora;
    const esProximo = !esPasado && fechaEvento.getTime() - ahora.getTime() < 7 * 24 * 60 * 60 * 1000;
    const estaAgotado = capacidad_total ? entradas_vendidas >= capacidad_total : false;

    const dia = fechaEvento.toLocaleDateString("es-UY", { day: "2-digit" });
    const mes = fechaEvento.toLocaleDateString("es-UY", { month: "short" }).toUpperCase();
    const hora = hora_apertura || fechaEvento.toLocaleTimeString("es-UY", { hour: "2-digit", minute: "2-digit" });

    const getEstadoBadge = () => {
      if (esPasado) return { text: "Finalizado", className: "bg-gray-500" };
      if (estaAgotado) return { text: "Agotado", className: "bg-red-600" };
      if (esProximo) return { text: "Pronto", className: "bg-amarillo text-bordo-dark" };
      return null;
    };

    const estadoBadge = getEstadoBadge();

    if (variant === "compact") {
      return (
        <Link href={`/eventos/${slug}`} className="block group">
          <div
            ref={ref}
            className={cn(
              "relative flex items-center gap-4 p-3 rounded-xl",
              "bg-white border border-gray-100",
              "transition-all duration-300",
              "hover:border-bordo/20 hover:shadow-lg hover:shadow-bordo/5",
              className
            )}
            {...props}
          >
            {/* Mini imagen */}
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              {imagen_url ? (
                <Image
                  src={imagen_url}
                  alt={titulo}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-bordo to-bordo-dark" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate group-hover:text-bordo transition-colors">
                {titulo}
              </h4>
              <p className="text-sm text-gray-500">
                {dia} {mes} · {hora}
              </p>
            </div>

            {/* Precio */}
            {precio_desde !== undefined && !esPasado && (
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-500">Desde</p>
                <p className="font-bold text-bordo">${precio_desde}</p>
              </div>
            )}
          </div>
        </Link>
      );
    }

    if (variant === "featured") {
      return (
        <Link href={`/eventos/${slug}`} className="block group">
          <div
            ref={ref}
            className={cn(
              "relative overflow-hidden rounded-3xl",
              "bg-gradient-to-br from-bordo via-bordo-dark to-bordo",
              "min-h-[400px] md:min-h-[500px]",
              "transition-all duration-500",
              "hover:shadow-2xl hover:shadow-bordo/30",
              className
            )}
            {...props}
          >
            {/* Imagen de fondo */}
            {imagen_url && (
              <div className="absolute inset-0">
                <Image
                  src={imagen_url}
                  alt={titulo}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bordo-dark via-bordo-dark/80 to-transparent" />
              </div>
            )}

            {/* Patrón decorativo diagonal */}
            <div className="absolute top-0 right-0 w-1/2 h-full overflow-hidden pointer-events-none">
              <div
                className="absolute -right-20 -top-20 w-80 h-80 opacity-10"
                style={{
                  background: "repeating-linear-gradient(45deg, #f7b643 0px, #f7b643 2px, transparent 2px, transparent 20px)"
                }}
              />
            </div>

            {/* Badges superiores */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10">
              <div className="flex gap-2 flex-wrap">
                {solo_socios && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amarillo text-bordo-dark shadow-lg">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                    </svg>
                    Solo Socios
                  </span>
                )}
                {estadoBadge && (
                  <span className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg",
                    estadoBadge.className
                  )}>
                    {estadoBadge.text}
                  </span>
                )}
              </div>
            </div>

            {/* Contenido principal */}
            <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
              {/* Fecha destacada */}
              <div className="inline-flex items-center gap-4 mb-4">
                <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-amarillo text-bordo-dark shadow-xl">
                  <span className="text-3xl font-black leading-none">{dia}</span>
                  <span className="text-sm font-bold uppercase tracking-wider">{mes}</span>
                </div>
                <div className="text-white/80">
                  <p className="text-lg font-medium">{hora} hs</p>
                  {ubicacion && (
                    <p className="flex items-center gap-1.5 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {ubicacion}
                    </p>
                  )}
                </div>
              </div>

              {/* Título y descripción */}
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
                {titulo}
              </h2>
              {descripcion_corta && (
                <p className="text-white/70 text-lg mb-6 line-clamp-2">
                  {descripcion_corta}
                </p>
              )}

              {/* Footer con precio y CTA */}
              <div className="flex items-center justify-between">
                {precio_desde !== undefined && !esPasado && (
                  <div>
                    <p className="text-white/60 text-sm">Desde</p>
                    <p className="text-3xl font-black text-amarillo">${precio_desde}</p>
                  </div>
                )}
                <span className={cn(
                  "inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg",
                  "bg-white text-bordo",
                  "transform transition-all duration-300",
                  "group-hover:bg-amarillo group-hover:scale-105 group-hover:shadow-xl",
                  esPasado && "opacity-60"
                )}>
                  {esPasado ? "Ver evento" : "Comprar entradas"}
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </Link>
      );
    }

    // Variante default
    return (
      <Link href={`/eventos/${slug}`} className="block group">
        <div
          ref={ref}
          className={cn(
            "relative overflow-hidden rounded-2xl",
            "bg-white",
            "shadow-lg shadow-black/5",
            "transition-all duration-300",
            "hover:shadow-xl hover:shadow-bordo/10 hover:-translate-y-1",
            className
          )}
          {...props}
        >
          {/* Imagen con overlay diagonal */}
          <div className="relative aspect-[4/3] overflow-hidden">
            {imagen_url ? (
              <Image
                src={imagen_url}
                alt={titulo}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-bordo to-bordo-dark" />
            )}

            {/* Overlay con corte diagonal */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Elemento diagonal decorativo */}
            <div
              className="absolute -bottom-1 -right-1 w-32 h-32 bg-amarillo"
              style={{ clipPath: "polygon(100% 0, 0% 100%, 100% 100%)" }}
            />

            {/* Badge de fecha */}
            <div className="absolute bottom-4 right-4 flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-bordo text-white shadow-lg z-10">
              <span className="text-2xl font-black leading-none">{dia}</span>
              <span className="text-xs font-bold uppercase tracking-wider">{mes}</span>
            </div>

            {/* Badges superiores */}
            <div className="absolute top-4 left-4 flex gap-2 flex-wrap z-10">
              {solo_socios && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amarillo text-bordo-dark">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                  Socios
                </span>
              )}
              {estadoBadge && (
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-bold text-white",
                  estadoBadge.className
                )}>
                  {estadoBadge.text}
                </span>
              )}
            </div>
          </div>

          {/* Contenido */}
          <div className="p-5">
            {/* Título */}
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-bordo transition-colors">
              {titulo}
            </h3>

            {/* Detalles */}
            <div className="space-y-1.5 mb-4">
              <p className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-bordo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {hora} hs
              </p>
              {ubicacion && (
                <p className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-bordo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">{ubicacion}</span>
                </p>
              )}
            </div>

            {/* Footer con precio */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              {precio_desde !== undefined && !esPasado ? (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Desde</p>
                  <p className="text-xl font-black text-bordo">${precio_desde}</p>
                </div>
              ) : (
                <div />
              )}

              <span className={cn(
                "inline-flex items-center gap-1.5 text-sm font-semibold",
                "text-bordo transition-all duration-300",
                "group-hover:gap-2.5"
              )}>
                {esPasado ? "Ver detalles" : "Ver evento"}
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }
);

EventCard.displayName = "EventCard";

export { EventCard };
