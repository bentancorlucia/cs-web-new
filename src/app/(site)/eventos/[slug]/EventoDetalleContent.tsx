"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useTicketStore } from "@/stores/ticketStore";
import { LoteSelector, TipoEntradaSelector, EventCard } from "@/components/eventos";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Sheet, SheetFooter } from "@/components/ui/Sheet";
import type { EventoCompleto, EventoSocial, LoteConTipos } from "@/types/eventos";
import type { TipoEntradaBasico } from "@/components/eventos/TipoEntradaSelector";

interface EventoDetalleContentProps {
  evento: EventoCompleto;
  eventosRelacionados: EventoSocial[];
}

export function EventoDetalleContent({ evento, eventosRelacionados }: EventoDetalleContentProps) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const {
    setEvento,
    setLote,
    addSelection,
    updateSelectionQuantity,
    removeSelection,
    selections,
    loteId,
    getTotal,
    getTotalEntradas,
    setStep,
  } = useTicketStore();

  const [selectedLote, setSelectedLote] = useState<LoteConTipos | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const esSocio = profile?.rol === "socio" || profile?.rol === "admin" || profile?.rol === "directivo";
  const now = new Date();
  const fechaEvento = new Date(evento.fecha_evento);
  const esPasado = fechaEvento < now;
  const estaAgotado = evento.capacidad_total
    ? evento.entradas_vendidas >= evento.capacidad_total
    : false;

  // Find active lote
  const loteActivo = useMemo(() => {
    return evento.lotes.find((lote) => {
      const inicio = new Date(lote.fecha_inicio);
      const fin = new Date(lote.fecha_fin);
      return lote.activo && now >= inicio && now <= fin;
    });
  }, [evento.lotes, now]);

  // Initialize selections when component mounts
  useState(() => {
    setEvento(evento.id, evento.slug, evento.titulo);
    if (loteActivo) {
      setSelectedLote(loteActivo);
      setLote(loteActivo.id, loteActivo.nombre);
    }
  });

  const handleLoteSelect = (lote: { id: string; nombre: string }) => {
    const fullLote = evento.lotes.find((l) => l.id === lote.id);
    if (fullLote) {
      setSelectedLote(fullLote);
      setLote(fullLote.id, fullLote.nombre);
    }
  };

  const handleUpdateQuantity = (tipoId: string, cantidad: number, tipo: TipoEntradaBasico) => {
    if (cantidad <= 0) {
      removeSelection(tipoId);
    } else {
      const currentSelection = selections.find((s) => s.tipoEntradaId === tipoId);
      if (currentSelection) {
        updateSelectionQuantity(tipoId, cantidad);
      } else {
        addSelection({
          tipoEntradaId: tipoId,
          tipoEntradaNombre: tipo.nombre,
          precio: tipo.precio,
          precioSocio: tipo.precio_socio,
          cantidad: cantidad,
        });
      }
    }
  };

  const selectionsMap = useMemo(() => {
    const map: Record<string, number> = {};
    selections.forEach((s) => {
      map[s.tipoEntradaId] = s.cantidad;
    });
    return map;
  }, [selections]);

  const total = getTotal(esSocio);
  const totalEntradas = getTotalEntradas();

  const handleContinue = () => {
    if (totalEntradas === 0) return;
    setIsSheetOpen(false);
    setStep("asistentes");
    router.push(`/eventos/${evento.slug}/checkout`);
  };

  const handleMobileButtonClick = () => {
    if (totalEntradas === 0) {
      // Open sheet to select tickets
      setIsSheetOpen(true);
    } else {
      // Go to checkout
      handleContinue();
    }
  };

  const scrollToSidebar = () => {
    sidebarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const dia = fechaEvento.toLocaleDateString("es-UY", { day: "2-digit" });
  const mes = fechaEvento.toLocaleDateString("es-UY", { month: "short" }).toUpperCase();
  const anio = fechaEvento.getFullYear();
  const hora = evento.hora_apertura || fechaEvento.toLocaleTimeString("es-UY", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-bordo min-h-[400px] md:min-h-[500px]">
        {/* Background image */}
        {evento.imagen_url && (
          <div className="absolute inset-0">
            <Image
              src={evento.imagen_url}
              alt={evento.titulo}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bordo-dark via-bordo-dark/80 to-bordo-dark/40" />
          </div>
        )}

        {/* Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative container mx-auto px-4 lg:px-8 pt-32 pb-16">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link href="/" className="text-white/60 hover:text-amarillo transition-colors">
                  Inicio
                </Link>
              </li>
              <li className="text-white/40">/</li>
              <li>
                <Link href="/eventos" className="text-white/60 hover:text-amarillo transition-colors">
                  Eventos
                </Link>
              </li>
              <li className="text-white/40">/</li>
              <li className="text-white/90 font-medium truncate max-w-[200px]">
                {evento.titulo}
              </li>
            </ol>
          </nav>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Info principal */}
            <div className="flex-1">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {evento.solo_socios && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amarillo text-bordo-dark">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                    </svg>
                    Exclusivo Socios
                  </span>
                )}
                {esPasado && (
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-500 text-white">
                    Evento finalizado
                  </span>
                )}
                {estaAgotado && !esPasado && (
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-600 text-white">
                    Agotado
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                {evento.titulo}
              </h1>

              {/* Short description */}
              {evento.descripcion_corta && (
                <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl">
                  {evento.descripcion_corta}
                </p>
              )}

              {/* Quick info */}
              <div className="flex flex-wrap items-center gap-6 text-white/80">
                {evento.ubicacion && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-amarillo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{evento.ubicacion}</span>
                  </div>
                )}
                {evento.edad_minima && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-amarillo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>+{evento.edad_minima} años</span>
                  </div>
                )}
                {evento.capacidad_total && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-amarillo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{evento.capacidad_total - evento.entradas_vendidas} lugares disponibles</span>
                  </div>
                )}
              </div>
            </div>

            {/* Date card */}
            <div className="lg:w-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-6 text-center min-w-[200px]">
                <div className="text-6xl font-black text-bordo leading-none">{dia}</div>
                <div className="text-xl font-bold text-bordo-dark uppercase tracking-wider mt-1">{mes}</div>
                <div className="text-gray-500 mt-1">{anio}</div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-gray-500 text-sm">Hora de apertura</p>
                  <p className="text-2xl font-bold text-gray-900">{hora}</p>
                </div>
                {evento.precio_desde !== undefined && !esPasado && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-gray-500 text-sm">Desde</p>
                    <p className="text-3xl font-black text-amarillo-dark">{formatPrice(evento.precio_desde)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none rotate-180">
          <svg className="relative block w-full h-8 md:h-12" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-gray-50" />
          </svg>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              {evento.descripcion && (
                <Card variant="default">
                  <CardContent>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Sobre el evento</h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="whitespace-pre-wrap text-gray-600">{evento.descripcion}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Includes */}
              {evento.incluye && evento.incluye.length > 0 && (
                <Card variant="default">
                  <CardContent>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">¿Qué incluye?</h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {evento.incluye.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Location */}
              {(evento.ubicacion || evento.direccion) && (
                <Card variant="default">
                  <CardContent>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Ubicación</h2>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-bordo/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-bordo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        {evento.ubicacion && (
                          <p className="font-semibold text-gray-900">{evento.ubicacion}</p>
                        )}
                        {evento.direccion && (
                          <p className="text-gray-600 mt-1">{evento.direccion}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Gallery */}
              {evento.imagenes_galeria && evento.imagenes_galeria.length > 0 && (
                <Card variant="default">
                  <CardContent>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Galería</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {evento.imagenes_galeria.map((img, idx) => (
                        <div key={idx} className="relative aspect-video rounded-xl overflow-hidden">
                          <Image src={img} alt={`Imagen ${idx + 1}`} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Ticket selector (hidden on mobile, shown in sheet instead) */}
            <div className="lg:col-span-1 hidden lg:block" ref={sidebarRef}>
              <div className="sticky top-24 space-y-6">
                {!esPasado && !estaAgotado ? (
                  <Card variant="elevated" padding="none">
                    <div className="p-6 border-b border-gray-100">
                      <h2 className="text-xl font-bold text-gray-900">Comprar entradas</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Seleccioná el tipo y cantidad de entradas
                      </p>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Lote selector */}
                      {evento.lotes.length > 1 && (
                        <LoteSelector
                          lotes={evento.lotes.map((l) => ({
                            id: l.id,
                            nombre: l.nombre,
                            descripcion: l.descripcion,
                            fecha_inicio: l.fecha_inicio,
                            fecha_fin: l.fecha_fin,
                            activo: l.activo,
                          }))}
                          selectedLoteId={loteId}
                          onSelectLote={handleLoteSelect}
                        />
                      )}

                      {/* Tipo selector */}
                      {selectedLote && (
                        <TipoEntradaSelector
                          tipos={selectedLote.tipos_entrada}
                          selections={selectionsMap}
                          onUpdateQuantity={handleUpdateQuantity}
                          esSocio={esSocio}
                        />
                      )}

                      {!selectedLote && !loteActivo && (
                        <div className="text-center py-8 text-gray-500">
                          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="font-medium">Venta no disponible</p>
                          <p className="text-sm mt-1">
                            La venta de entradas aún no ha comenzado o ya finalizó.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer with total and CTA */}
                    {totalEntradas > 0 && (
                      <div className="p-6 bg-gray-50 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-gray-600">
                            {totalEntradas} {totalEntradas === 1 ? "entrada" : "entradas"}
                          </span>
                          <span className="text-2xl font-bold text-bordo">
                            {formatPrice(total)}
                          </span>
                        </div>
                        <Button
                          onClick={handleContinue}
                          className="w-full"
                          size="lg"
                        >
                          Continuar
                          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </Button>
                        {!user && (
                          <p className="text-xs text-gray-500 text-center mt-3">
                            Vas a necesitar iniciar sesión para completar la compra
                          </p>
                        )}
                      </div>
                    )}
                  </Card>
                ) : (
                  <Card variant="default">
                    <CardContent className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {esPasado ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          )}
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {esPasado ? "Evento finalizado" : "Entradas agotadas"}
                      </h3>
                      <p className="text-gray-500">
                        {esPasado
                          ? "Este evento ya pasó. Mirá otros eventos próximos."
                          : "Las entradas para este evento se han agotado."}
                      </p>
                      <Link
                        href="/eventos"
                        className="inline-flex items-center justify-center mt-4 text-bordo font-medium hover:underline"
                      >
                        Ver otros eventos
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </CardContent>
                  </Card>
                )}

                {/* Important info */}
                <Card variant="glass">
                  <CardContent className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amarillo/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-amarillo-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">Información importante</p>
                      <p className="text-gray-600 mt-1">
                        Recibirás las entradas con código QR en tu email y podrás verlas en tu cuenta.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Related events */}
          {eventosRelacionados.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Otros eventos</h2>
                <Link
                  href="/eventos"
                  className="text-sm font-medium text-bordo hover:underline flex items-center gap-1"
                >
                  Ver todos
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventosRelacionados.map((ev) => (
                  <EventCard
                    key={ev.id}
                    evento={{
                      id: ev.id,
                      slug: ev.slug,
                      titulo: ev.titulo,
                      descripcion_corta: ev.descripcion_corta,
                      fecha_evento: ev.fecha_evento,
                      hora_apertura: ev.hora_apertura,
                      ubicacion: ev.ubicacion,
                      imagen_url: ev.imagen_url,
                      solo_socios: ev.solo_socios,
                      capacidad_total: ev.capacidad_total,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mobile Bottom Sheet for ticket selection */}
      <Sheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="Comprar entradas"
        description="Seleccioná el tipo y cantidad de entradas"
      >
        <div className="space-y-6">
          {/* Lote selector */}
          {evento.lotes.length > 1 && (
            <LoteSelector
              lotes={evento.lotes.map((l) => ({
                id: l.id,
                nombre: l.nombre,
                descripcion: l.descripcion,
                fecha_inicio: l.fecha_inicio,
                fecha_fin: l.fecha_fin,
                activo: l.activo,
              }))}
              selectedLoteId={loteId}
              onSelectLote={handleLoteSelect}
            />
          )}

          {/* Tipo selector */}
          {selectedLote && (
            <TipoEntradaSelector
              tipos={selectedLote.tipos_entrada}
              selections={selectionsMap}
              onUpdateQuantity={handleUpdateQuantity}
              esSocio={esSocio}
            />
          )}

          {!selectedLote && !loteActivo && (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium">Venta no disponible</p>
              <p className="text-sm mt-1">
                La venta de entradas aún no ha comenzado o ya finalizó.
              </p>
            </div>
          )}
        </div>

        {/* Sheet footer with total and CTA */}
        {totalEntradas > 0 && (
          <SheetFooter className="-mx-5 -mb-5 mt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600">
                {totalEntradas} {totalEntradas === 1 ? "entrada" : "entradas"}
              </span>
              <span className="text-2xl font-bold text-bordo">
                {formatPrice(total)}
              </span>
            </div>
            <Button onClick={handleContinue} className="w-full">
              Continuar al checkout
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </SheetFooter>
        )}
      </Sheet>

      {/* Mobile fixed bottom bar */}
      {!esPasado && !estaAgotado && (
        <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] safe-area-inset-bottom">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            {/* Price info */}
            <div className="flex-1 min-w-0">
              {totalEntradas > 0 ? (
                <>
                  <p className="text-sm text-gray-500">
                    {totalEntradas} {totalEntradas === 1 ? "entrada" : "entradas"}
                  </p>
                  <p className="text-xl font-bold text-bordo truncate">
                    {formatPrice(total)}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-500">Desde</p>
                  <p className="text-xl font-bold text-bordo truncate">
                    {evento.precio_desde !== undefined ? formatPrice(evento.precio_desde) : "Gratis"}
                  </p>
                </>
              )}
            </div>

            {/* CTA Button */}
            <Button
              onClick={handleMobileButtonClick}
              className="flex-shrink-0"
              size="sm"
            >
              {totalEntradas > 0 ? "Continuar" : "Comprar entradas"}
            </Button>
          </div>
        </div>
      )}

      {/* Spacer for mobile fixed bottom bar */}
      {!esPasado && !estaAgotado && (
        <div className="h-20 lg:hidden" aria-hidden="true" />
      )}
    </>
  );
}
