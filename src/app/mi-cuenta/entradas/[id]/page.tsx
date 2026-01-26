"use client";

import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { formatDate, formatDateTime, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import QRCode from "qrcode";

interface Entrada {
  id: string;
  codigo_qr: string;
  token_validacion: string;
  nombre_asistente: string;
  cedula_asistente: string | null;
  email_asistente: string | null;
  telefono_asistente: string | null;
  estado: "valida" | "usada" | "cancelada" | "transferida";
  fecha_compra: string;
  fecha_uso: string | null;
  notas: string | null;
  evento: {
    id: string;
    titulo: string;
    slug: string;
    descripcion_corta: string | null;
    fecha_evento: string;
    fecha_fin: string | null;
    hora_apertura: string | null;
    ubicacion: string | null;
    direccion: string | null;
    imagen_url: string | null;
    incluye: string[] | null;
  };
  tipo_entrada: {
    nombre: string;
    precio: number;
    descripcion: string | null;
    incluye: string[] | null;
  } | null;
  lote: {
    nombre: string;
  } | null;
}

export default function EntradaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const [entrada, setEntrada] = useState<Entrada | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchEntrada = async () => {
      if (!user) return;

      const supabase = createClient();
      const { data, error } = await supabase
        .from("entradas")
        .select(`
          id,
          codigo_qr,
          token_validacion,
          nombre_asistente,
          cedula_asistente,
          email_asistente,
          telefono_asistente,
          estado,
          fecha_compra,
          fecha_uso,
          notas,
          evento:eventos_sociales (
            id,
            titulo,
            slug,
            descripcion_corta,
            fecha_evento,
            fecha_fin,
            hora_apertura,
            ubicacion,
            direccion,
            imagen_url,
            incluye
          ),
          tipo_entrada:tipos_entrada (
            nombre,
            precio,
            descripcion,
            incluye
          ),
          lote:lotes_entrada (
            nombre
          )
        `)
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setEntrada(data as unknown as Entrada);

        // Generate QR code
        if (data.codigo_qr) {
          try {
            const qrUrl = await QRCode.toDataURL(data.codigo_qr, {
              width: 300,
              margin: 2,
              color: {
                dark: "#730d32",
                light: "#ffffff",
              },
            });
            setQrDataUrl(qrUrl);
          } catch (err) {
            console.error("Error generating QR code:", err);
          }
        }
      }
      setIsLoading(false);
    };

    fetchEntrada();
  }, [user, id]);

  const getEstadoConfig = (estado: string, fechaEvento: string) => {
    const isPast = new Date(fechaEvento) < new Date();

    if (estado === "valida" && isPast) {
      return {
        color: "bg-gray-100 text-gray-600",
        label: "Evento finalizado",
        description: "El evento ya pasó",
      };
    }

    const configs: Record<string, { color: string; label: string; description: string }> = {
      valida: {
        color: "bg-green-100 text-green-800",
        label: "Entrada válida",
        description: "Presentá el QR en la entrada del evento",
      },
      usada: {
        color: "bg-blue-100 text-blue-800",
        label: "Entrada usada",
        description: "Esta entrada ya fue utilizada para ingresar",
      },
      cancelada: {
        color: "bg-red-100 text-red-800",
        label: "Entrada cancelada",
        description: "Esta entrada fue cancelada y no es válida",
      },
      transferida: {
        color: "bg-purple-100 text-purple-800",
        label: "Entrada transferida",
        description: "Esta entrada fue transferida a otra persona",
      },
    };
    return configs[estado] || configs.valida;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl || !entrada) return;

    const link = document.createElement("a");
    link.download = `entrada-${entrada.codigo_qr}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-32 animate-pulse motion-reduce:animate-none" />
        <div className="bg-white rounded-2xl p-6 animate-pulse motion-reduce:animate-none">
          <div className="h-64 bg-gray-200 rounded mb-4" />
          <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>
      </div>
    );
  }

  if (notFound || !entrada) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Entrada no encontrada</h2>
        <p className="text-gray-500 mb-6">La entrada que buscás no existe o no tenés acceso.</p>
        <Link
          href="/mi-cuenta/entradas"
          className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-xl bg-gradient-to-r from-bordo to-bordo-dark text-white shadow-lg shadow-bordo/25 hover:from-bordo-dark hover:to-bordo transition-all"
        >
          Volver a Mis Entradas
        </Link>
      </div>
    );
  }

  const estadoConfig = getEstadoConfig(entrada.estado, entrada.evento.fecha_evento);
  const isPast = new Date(entrada.evento.fecha_evento) < new Date();
  const canShowQR = entrada.estado === "valida" && !isPast;

  return (
    <div className="space-y-6">
      {/* Back button - hide on print */}
      <Link
        href="/mi-cuenta/entradas"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-bordo transition-colors print:hidden"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver a Mis Entradas
      </Link>

      {/* Ticket Card */}
      <Card variant="elevated" padding="none" className="overflow-hidden print:shadow-none">
        {/* Header con imagen o gradiente */}
        <div className="relative h-32 bg-gradient-to-r from-bordo to-bordo-dark">
          {entrada.evento.imagen_url && (
            <img
              src={entrada.evento.imagen_url}
              alt={entrada.evento.titulo}
              width={800}
              height={128}
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <p className="text-sm font-medium opacity-80">Club Seminario</p>
              <h1 className="text-2xl font-bold mt-1">{entrada.evento.titulo}</h1>
            </div>
          </div>
          {/* Decorative notches */}
          <div className="absolute -bottom-4 left-6 w-8 h-8 bg-gray-50 rounded-full print:bg-white" />
          <div className="absolute -bottom-4 right-6 w-8 h-8 bg-gray-50 rounded-full print:bg-white" />
        </div>

        {/* Dashed separator */}
        <div className="relative px-6">
          <div className="border-t-2 border-dashed border-gray-200 mt-4" />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Estado */}
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium mb-6",
            estadoConfig.color
          )}>
            {entrada.estado === "valida" && !isPast && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {(entrada.estado === "usada" || isPast) && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span>{estadoConfig.label}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* QR Code */}
            <div className="flex flex-col items-center">
              {canShowQR && qrDataUrl ? (
                <>
                  <div className="p-4 bg-white rounded-2xl shadow-lg border-2 border-gray-100">
                    <img
                      src={qrDataUrl}
                      alt="Código QR de entrada"
                      width={256}
                      height={256}
                      className="w-64 h-64"
                    />
                  </div>
                  <p className="mt-4 text-sm text-gray-500 text-center">
                    Código: <span className="font-mono font-medium">{entrada.codigo_qr}</span>
                  </p>
                </>
              ) : (
                <div className="w-64 h-64 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <p className="text-sm text-gray-500">{estadoConfig.description}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Detalles */}
            <div className="space-y-4">
              {/* Info del evento */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Fecha y hora</p>
                    <p className="font-medium text-gray-900">
                      {formatDateTime(entrada.evento.fecha_evento)}
                    </p>
                    {entrada.evento.hora_apertura && (
                      <p className="text-sm text-gray-500">
                        Apertura: {entrada.evento.hora_apertura}
                      </p>
                    )}
                  </div>
                </div>

                {entrada.evento.ubicacion && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Ubicación</p>
                      <p className="font-medium text-gray-900">{entrada.evento.ubicacion}</p>
                      {entrada.evento.direccion && (
                        <p className="text-sm text-gray-500">{entrada.evento.direccion}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Tipo de entrada</p>
                    <p className="font-medium text-gray-900">
                      {entrada.tipo_entrada?.nombre || "Entrada General"}
                    </p>
                    {entrada.lote && (
                      <p className="text-sm text-gray-500">Lote: {entrada.lote.nombre}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Separador */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500 mb-2">Asistente</p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="font-semibold text-gray-900">{entrada.nombre_asistente}</p>
                  {entrada.cedula_asistente && (
                    <p className="text-sm text-gray-600">CI: {entrada.cedula_asistente}</p>
                  )}
                  {entrada.email_asistente && (
                    <p className="text-sm text-gray-600">{entrada.email_asistente}</p>
                  )}
                </div>
              </div>

              {/* Incluye */}
              {(entrada.tipo_entrada?.incluye || entrada.evento.incluye) && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-500 mb-2">Esta entrada incluye</p>
                  <ul className="space-y-1">
                    {(entrada.tipo_entrada?.incluye || entrada.evento.incluye || []).map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Fecha de uso */}
          {entrada.fecha_uso && (
            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>Entrada utilizada:</strong> {formatDateTime(entrada.fecha_uso)}
              </p>
            </div>
          )}
        </div>

        {/* Footer con acciones - hide on print */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-3 print:hidden">
          {canShowQR && (
            <>
              <Button onClick={handleDownloadQR} variant="outline" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar QR
              </Button>
              <Button onClick={handlePrint} variant="outline" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir
              </Button>
            </>
          )}
          <Link
            href={`/eventos/${entrada.evento.slug}`}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-bordo bg-transparent hover:bg-bordo/10 transition-colors"
          >
            Ver evento
          </Link>
        </div>
      </Card>

      {/* Información importante - hide on print */}
      <Card variant="glass" className="print:hidden">
        <CardContent className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amarillo/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-amarillo-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Información importante</h4>
            <ul className="text-sm text-gray-600 mt-2 space-y-1">
              <li>• Presentá el código QR en la puerta del evento</li>
              <li>• Podés mostrarlo desde tu celular o impreso</li>
              <li>• Cada entrada solo puede ser usada una vez</li>
              <li>• Llegá con tiempo para evitar filas</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
