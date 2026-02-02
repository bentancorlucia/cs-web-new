"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { useTicketStore, type Asistente } from "@/stores/ticketStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Sheet } from "@/components/ui/Sheet";
import type { EventoCompleto } from "@/types/eventos";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  nombre: string | null;
  apellido: string | null;
  email: string | null;
  telefono: string | null;
  cedula: string | null;
  rol: string;
}

interface CheckoutContentProps {
  evento: EventoCompleto;
  user: User | null;
  profile: Profile | null;
}

type CheckoutStep = "asistentes" | "pago" | "confirmacion";

export function CheckoutContent({ evento, user, profile }: CheckoutContentProps) {
  const router = useRouter();
  const {
    eventoId,
    eventoSlug,
    selections,
    step,
    setStep,
    setAsistentes,
    getTotal,
    getTotalEntradas,
    clearAll,
  } = useTicketStore();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("asistentes");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  // Redirect if no selections or wrong event
  useEffect(() => {
    if (selections.length === 0 || eventoId !== evento.id) {
      router.push(`/eventos/${evento.slug}`);
    }
  }, [selections, eventoId, evento.id, evento.slug, router]);

  const esSocio = profile?.rol === "socio" || profile?.rol === "admin" || profile?.rol === "directivo";
  const total = getTotal(esSocio);
  const totalEntradas = getTotalEntradas();

  // Initialize attendees forms
  const [asistentesData, setAsistentesData] = useState<Record<string, Asistente[]>>(() => {
    const initial: Record<string, Asistente[]> = {};
    selections.forEach((selection) => {
      initial[selection.tipoEntradaId] = Array.from({ length: selection.cantidad }, (_, i) => {
        // Pre-fill first attendee with user data if logged in
        if (i === 0 && profile) {
          return {
            nombre: `${profile.nombre || ""} ${profile.apellido || ""}`.trim(),
            cedula: profile.cedula || "",
            email: profile.email || user?.email || "",
            telefono: profile.telefono || "",
          };
        }
        return {
          nombre: "",
          cedula: "",
          email: "",
          telefono: "",
        };
      });
    });
    return initial;
  });

  const handleAsistenteChange = (
    tipoEntradaId: string,
    index: number,
    field: keyof Asistente,
    value: string
  ) => {
    setAsistentesData((prev) => {
      const updated = { ...prev };
      updated[tipoEntradaId] = [...(prev[tipoEntradaId] || [])];
      updated[tipoEntradaId][index] = {
        ...updated[tipoEntradaId][index],
        [field]: value,
      };
      return updated;
    });
  };

  const validateAsistentes = () => {
    for (const selection of selections) {
      const asistentes = asistentesData[selection.tipoEntradaId] || [];
      for (let i = 0; i < selection.cantidad; i++) {
        const asistente = asistentes[i];
        if (!asistente?.nombre?.trim()) {
          setError(`Por favor ingresá el nombre del asistente ${i + 1} para "${selection.tipoEntradaNombre}"`);
          return false;
        }
        if (!asistente?.cedula?.trim()) {
          setError(`Por favor ingresá la cédula del asistente ${i + 1} para "${selection.tipoEntradaNombre}"`);
          return false;
        }
        if (!asistente?.email?.trim()) {
          setError(`Por favor ingresá el email del asistente ${i + 1} para "${selection.tipoEntradaNombre}"`);
          return false;
        }
      }
    }
    setError(null);
    return true;
  };

  const handleContinueToPayment = () => {
    if (!validateAsistentes()) return;

    // Save attendees to store
    selections.forEach((selection) => {
      setAsistentes(selection.tipoEntradaId, asistentesData[selection.tipoEntradaId] || []);
    });

    setCurrentStep("pago");
    setStep("pago");
  };

  const handlePayment = async () => {
    if (!user) {
      // Redirect to login with return URL
      router.push(`/login?redirect=/eventos/${evento.slug}/checkout`);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create the order in the database
      const response = await fetch("/api/eventos/crear-pedido", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventoId: evento.id,
          selections: selections.map((s) => ({
            tipoEntradaId: s.tipoEntradaId,
            cantidad: s.cantidad,
            precio: esSocio && s.precioSocio ? s.precioSocio : s.precio,
            asistentes: asistentesData[s.tipoEntradaId] || [],
          })),
          total,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear el pedido");
      }

      // If payment is required, redirect to MercadoPago
      if (data.sandbox_init_point) {
        window.location.href = data.sandbox_init_point;
        return;
      }

      // If no payment needed (free event), show confirmation
      setCurrentStep("confirmacion");
      setStep("confirmacion");
      clearAll();
    } catch (err: unknown) {
      console.error("Error processing payment:", err);
      setError(err instanceof Error ? err.message : "Error al procesar el pago. Por favor intentá de nuevo.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (selections.length === 0) {
    return null;
  }

  const steps = [
    { key: "asistentes", label: "Datos" },
    { key: "pago", label: "Pago" },
    { key: "confirmacion", label: "Confirmación" },
  ];

  return (
    <>
      {/* Header */}
      <section className="bg-bordo pt-24 pb-8">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link href="/eventos" className="text-white/60 hover:text-amarillo transition-colors">
                  Eventos
                </Link>
              </li>
              <li className="text-white/40">/</li>
              <li>
                <Link href={`/eventos/${evento.slug}`} className="text-white/60 hover:text-amarillo transition-colors">
                  {evento.titulo}
                </Link>
              </li>
              <li className="text-white/40">/</li>
              <li className="text-white/90 font-medium">Checkout</li>
            </ol>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-white">Comprar entradas</h1>
          <p className="text-white/70 mt-2">{evento.titulo}</p>

          {/* Steps indicator */}
          <div className="mt-8 flex items-center gap-2">
            {steps.map((s, index) => (
              <div key={s.key} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
                    currentStep === s.key
                      ? "bg-amarillo text-bordo-dark"
                      : steps.findIndex((st) => st.key === currentStep) > index
                      ? "bg-white text-bordo"
                      : "bg-white/20 text-white/60"
                  )}
                >
                  {steps.findIndex((st) => st.key === currentStep) > index ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "ml-2 text-sm hidden sm:inline",
                    currentStep === s.key ? "text-white font-medium" : "text-white/60"
                  )}
                >
                  {s.label}
                </span>
                {index < steps.length - 1 && (
                  <div className="w-8 md:w-16 h-0.5 mx-2 bg-white/20" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-6 lg:py-12 bg-gray-50 pb-28 lg:pb-12">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Mobile summary banner */}
          <button
            onClick={() => setShowMobileSummary(true)}
            className="lg:hidden w-full mb-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-bordo to-bordo-dark flex-shrink-0 overflow-hidden">
                {evento.imagen_url ? (
                  <Image
                    src={evento.imagen_url}
                    alt={evento.titulo}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900 text-sm line-clamp-1">{evento.titulo}</p>
                <p className="text-xs text-gray-500">
                  {totalEntradas} {totalEntradas === 1 ? "entrada" : "entradas"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-bordo">{formatPrice(total)}</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              {currentStep === "asistentes" && (
                <div className="space-y-4 lg:space-y-6">
                  <Card variant="default">
                    <CardHeader className="px-4 lg:px-6 py-4 lg:py-5">
                      <CardTitle className="text-lg lg:text-xl">Datos de los asistentes</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Completá los datos de cada persona que asistirá al evento
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6 lg:space-y-8 px-4 lg:px-6">
                      {selections.map((selection) => (
                        <div key={selection.tipoEntradaId}>
                          <h3 className="font-semibold text-gray-900 mb-3 lg:mb-4 flex items-center gap-2 text-sm lg:text-base">
                            <span className="px-2 py-0.5 rounded bg-bordo/10 text-bordo text-xs lg:text-sm">
                              {selection.cantidad}x
                            </span>
                            {selection.tipoEntradaNombre}
                          </h3>

                          <div className="space-y-4 lg:space-y-6">
                            {Array.from({ length: selection.cantidad }).map((_, index) => (
                              <div
                                key={index}
                                className={cn(
                                  "p-3 lg:p-4 rounded-xl border border-gray-200",
                                  index === 0 && "bg-bordo/5 border-bordo/20"
                                )}
                              >
                                <p className="text-sm font-medium text-gray-700 mb-3 lg:mb-4">
                                  Asistente {index + 1}
                                  {index === 0 && profile && (
                                    <span className="ml-2 text-xs text-bordo font-normal block sm:inline mt-0.5 sm:mt-0">
                                      (datos pre-cargados de tu cuenta)
                                    </span>
                                  )}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                                  <Input
                                    label="Nombre completo *"
                                    autoComplete="name"
                                    value={asistentesData[selection.tipoEntradaId]?.[index]?.nombre || ""}
                                    onChange={(e) =>
                                      handleAsistenteChange(selection.tipoEntradaId, index, "nombre", e.target.value)
                                    }
                                    placeholder="Juan Pérez"
                                  />
                                  <Input
                                    label="Cédula de identidad *"
                                    inputMode="numeric"
                                    value={asistentesData[selection.tipoEntradaId]?.[index]?.cedula || ""}
                                    onChange={(e) =>
                                      handleAsistenteChange(selection.tipoEntradaId, index, "cedula", e.target.value)
                                    }
                                    placeholder="1.234.567-8"
                                  />
                                  <Input
                                    type="email"
                                    label="Email *"
                                    autoComplete="email"
                                    value={asistentesData[selection.tipoEntradaId]?.[index]?.email || ""}
                                    onChange={(e) =>
                                      handleAsistenteChange(selection.tipoEntradaId, index, "email", e.target.value)
                                    }
                                    placeholder="email@ejemplo.com"
                                  />
                                  <Input
                                    type="tel"
                                    label="Teléfono (opcional)"
                                    autoComplete="tel"
                                    inputMode="tel"
                                    value={asistentesData[selection.tipoEntradaId]?.[index]?.telefono || ""}
                                    onChange={(e) =>
                                      handleAsistenteChange(selection.tipoEntradaId, index, "telefono", e.target.value)
                                    }
                                    placeholder="099 123 456"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {error && (
                        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                          {error}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <Link
                          href={`/eventos/${evento.slug}`}
                          className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                        >
                          ← Volver al evento
                        </Link>
                        <Button onClick={handleContinueToPayment} className="hidden lg:inline-flex">
                          Continuar al pago
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {currentStep === "pago" && (
                <div className="space-y-6">
                  <Card variant="default">
                    <CardHeader>
                      <CardTitle>Método de pago</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!user ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 rounded-full bg-bordo/10 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-bordo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Iniciá sesión para continuar
                          </h3>
                          <p className="text-gray-500 mb-6">
                            Necesitás iniciar sesión para completar la compra de tus entradas.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                              href={`/login?redirect=/eventos/${evento.slug}/checkout`}
                              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-bordo text-white font-medium hover:bg-bordo-dark transition-colors"
                            >
                              Iniciar sesión
                            </Link>
                            <Link
                              href={`/registro?redirect=/eventos/${evento.slug}/checkout`}
                              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-bordo font-medium border-2 border-bordo hover:bg-bordo/5 transition-colors"
                            >
                              Crear cuenta
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Payment method selection */}
                          <div className="p-4 rounded-xl border-2 border-bordo bg-bordo/5">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center">
                                <Image
                                  src="/mercadopago-logo.svg"
                                  alt="MercadoPago"
                                  width={32}
                                  height={32}
                                  className="w-8 h-8 object-contain"
                                />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">MercadoPago</p>
                                <p className="text-sm text-gray-500">
                                  Tarjetas de crédito, débito y más
                                </p>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-gray-500">
                            Al continuar serás redirigido a MercadoPago para completar el pago de forma segura.
                          </p>

                          {error && (
                            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                              {error}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <button
                              onClick={() => {
                                setCurrentStep("asistentes");
                                setStep("asistentes");
                              }}
                              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                            >
                              ← Volver
                            </button>
                            <Button onClick={handlePayment} isLoading={isProcessing} className="hidden lg:inline-flex">
                              {isProcessing ? "Procesando..." : `Pagar ${formatPrice(total)}`}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {currentStep === "confirmacion" && (
                <Card variant="default">
                  <CardContent className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Compra exitosa!</h2>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                      Tus entradas han sido generadas. Las recibirás en tu email y podés verlas en tu cuenta.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link
                        href="/mi-cuenta/entradas"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-bordo text-white font-medium hover:bg-bordo-dark transition-colors"
                      >
                        Ver mis entradas
                      </Link>
                      <Link
                        href="/eventos"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-gray-700 font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        Ver más eventos
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Order summary (hidden on mobile, shown in sheet) */}
            <div className="hidden lg:block lg:col-span-1">
              <Card variant="elevated" className="sticky top-24">
                <CardHeader>
                  <CardTitle>Resumen del pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Event info */}
                  <div className="flex gap-4 pb-4 border-b border-gray-100">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-bordo to-bordo-dark flex-shrink-0 overflow-hidden">
                      {evento.imagen_url ? (
                        <Image
                          src={evento.imagen_url}
                          alt={evento.titulo}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{evento.titulo}</h3>
                      <p className="text-sm text-gray-500">{formatDate(evento.fecha_evento)}</p>
                      {evento.ubicacion && (
                        <p className="text-sm text-gray-500">{evento.ubicacion}</p>
                      )}
                    </div>
                  </div>

                  {/* Tickets */}
                  <div className="space-y-3">
                    {selections.map((selection) => (
                      <div key={selection.tipoEntradaId} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {selection.cantidad}x {selection.tipoEntradaNombre}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatPrice(esSocio && selection.precioSocio ? selection.precioSocio : selection.precio)} c/u
                          </p>
                        </div>
                        <p className="font-medium text-gray-900">
                          {formatPrice(
                            (esSocio && selection.precioSocio ? selection.precioSocio : selection.precio) *
                              selection.cantidad
                          )}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-bordo">{formatPrice(total)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {totalEntradas} {totalEntradas === 1 ? "entrada" : "entradas"}
                    </p>
                  </div>

                  {/* Socio discount badge */}
                  {esSocio && (
                    <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-green-800">
                          Precio de socio aplicado
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile summary sheet */}
      <Sheet
        isOpen={showMobileSummary}
        onClose={() => setShowMobileSummary(false)}
        title="Resumen del pedido"
      >
        <div className="space-y-4">
          {/* Event info */}
          <div className="flex gap-4 pb-4 border-b border-gray-100">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-bordo to-bordo-dark flex-shrink-0 overflow-hidden">
              {evento.imagen_url ? (
                <Image
                  src={evento.imagen_url}
                  alt={evento.titulo}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{evento.titulo}</h3>
              <p className="text-sm text-gray-500">{formatDate(evento.fecha_evento)}</p>
              {evento.ubicacion && (
                <p className="text-sm text-gray-500">{evento.ubicacion}</p>
              )}
            </div>
          </div>

          {/* Tickets */}
          <div className="space-y-3">
            {selections.map((selection) => (
              <div key={selection.tipoEntradaId} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selection.cantidad}x {selection.tipoEntradaNombre}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatPrice(esSocio && selection.precioSocio ? selection.precioSocio : selection.precio)} c/u
                  </p>
                </div>
                <p className="font-medium text-gray-900">
                  {formatPrice(
                    (esSocio && selection.precioSocio ? selection.precioSocio : selection.precio) *
                      selection.cantidad
                  )}
                </p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-bordo">{formatPrice(total)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {totalEntradas} {totalEntradas === 1 ? "entrada" : "entradas"}
            </p>
          </div>

          {/* Socio discount badge */}
          {esSocio && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-green-800">
                  Precio de socio aplicado
                </span>
              </div>
            </div>
          )}
        </div>
      </Sheet>

      {/* Mobile fixed bottom bar */}
      {currentStep !== "confirmacion" && (
        <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] safe-area-inset-bottom">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            {/* Price info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500">Total a pagar</p>
              <p className="text-xl font-bold text-bordo truncate">
                {formatPrice(total)}
              </p>
            </div>

            {/* CTA Button */}
            {currentStep === "asistentes" && (
              <Button
                onClick={handleContinueToPayment}
                size="sm"
                className="flex-shrink-0"
              >
                Continuar
              </Button>
            )}

            {currentStep === "pago" && user && (
              <Button
                onClick={handlePayment}
                isLoading={isProcessing}
                size="sm"
                className="flex-shrink-0"
              >
                {isProcessing ? "Procesando..." : "Pagar"}
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
