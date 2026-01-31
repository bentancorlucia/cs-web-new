"use client";

import { useState, useCallback } from "react";
import { cn, formatDateTime } from "@/lib/utils";
import { QRScanner, ScanResultOverlay, type ScanResult } from "@/components/eventos";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { EventoSocial } from "@/types/eventos";

interface EscaneoContentProps {
  eventos: EventoSocial[];
}

interface ScanResponse {
  success: boolean;
  result: "valida" | "ya_usada" | "cancelada" | "no_encontrada" | "evento_incorrecto";
  message: string;
  entrada?: {
    nombre_asistente: string;
    cedula_asistente: string | null;
    tipo_entrada: string;
    fecha_compra: string;
  };
}

interface ScanHistoryItem {
  id: string;
  codigo: string;
  result: ScanResult;
  timestamp: Date;
  entrada?: ScanResponse["entrada"];
}

export function EscaneoContent({ eventos }: EscaneoContentProps) {
  const [selectedEventoId, setSelectedEventoId] = useState<string | null>(
    eventos.length === 1 ? eventos[0].id : null
  );
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);
  const [lastEntrada, setLastEntrada] = useState<ScanResponse["entrada"] | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [stats, setStats] = useState({ validas: 0, yaUsadas: 0, invalidas: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedEvento = eventos.find((e) => e.id === selectedEventoId);

  const handleScan = useCallback(
    async (code: string) => {
      if (isProcessing || !selectedEventoId) return;

      // Prevent duplicate scans of same code within 3 seconds
      const recentScan = scanHistory.find(
        (h) => h.codigo === code && Date.now() - h.timestamp.getTime() < 3000
      );
      if (recentScan) return;

      setIsProcessing(true);

      try {
        const response = await fetch("/api/eventos/validar-entrada", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            codigo: code,
            eventoId: selectedEventoId,
          }),
        });

        const data: ScanResponse = await response.json();

        let scanResult: ScanResult;

        switch (data.result) {
          case "valida":
            scanResult = {
              status: "success",
              message: "Entrada válida",
              details: data.entrada?.nombre_asistente,
            };
            setStats((prev) => ({ ...prev, validas: prev.validas + 1 }));
            break;
          case "ya_usada":
            scanResult = {
              status: "warning",
              message: "Entrada ya usada",
              details: data.message || "Esta entrada ya fue utilizada",
            };
            setStats((prev) => ({ ...prev, yaUsadas: prev.yaUsadas + 1 }));
            break;
          case "cancelada":
            scanResult = {
              status: "error",
              message: "Entrada cancelada",
              details: "Esta entrada fue cancelada",
            };
            setStats((prev) => ({ ...prev, invalidas: prev.invalidas + 1 }));
            break;
          case "evento_incorrecto":
            scanResult = {
              status: "error",
              message: "Evento incorrecto",
              details: "Esta entrada es para otro evento",
            };
            setStats((prev) => ({ ...prev, invalidas: prev.invalidas + 1 }));
            break;
          default:
            scanResult = {
              status: "error",
              message: "Entrada no encontrada",
              details: "El código QR no corresponde a una entrada válida",
            };
            setStats((prev) => ({ ...prev, invalidas: prev.invalidas + 1 }));
        }

        setLastScanResult(scanResult);
        setLastEntrada(data.entrada || null);
        setShowOverlay(true);

        // Add to history
        setScanHistory((prev) => [
          {
            id: crypto.randomUUID(),
            codigo: code,
            result: scanResult,
            timestamp: new Date(),
            entrada: data.entrada,
          },
          ...prev.slice(0, 49), // Keep last 50 scans
        ]);
      } catch (error) {
        console.error("Error validating entrada:", error);
        const errorResult: ScanResult = {
          status: "error",
          message: "Error de conexión",
          details: "No se pudo validar la entrada. Intentá de nuevo.",
        };
        setLastScanResult(errorResult);
        setShowOverlay(true);
      } finally {
        setIsProcessing(false);
      }
    },
    [selectedEventoId, scanHistory, isProcessing]
  );

  const handleError = useCallback((error: string) => {
    console.error("Scanner error:", error);
  }, []);

  const resetStats = () => {
    setStats({ validas: 0, yaUsadas: 0, invalidas: 0 });
    setScanHistory([]);
  };

  return (
    <>
      {/* Header */}
      <section className="bg-bordo pt-24 pb-8">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Escaneo de Entradas
          </h1>
          <p className="text-white/70 mt-2">
            Sistema de validación de entradas para eventos
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 md:py-12 bg-gray-50 min-h-[calc(100vh-200px)]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scanner */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event selector */}
              <Card variant="default">
                <CardContent>
                  <label htmlFor="evento-selector" className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar evento
                  </label>
                  <select
                    id="evento-selector"
                    value={selectedEventoId || ""}
                    onChange={(e) => {
                      setSelectedEventoId(e.target.value || null);
                      resetStats();
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-bordo focus:border-transparent"
                  >
                    <option value="">-- Seleccioná un evento --</option>
                    {eventos.map((evento) => (
                      <option key={evento.id} value={evento.id}>
                        {evento.titulo} - {formatDateTime(evento.fecha_evento)}
                      </option>
                    ))}
                  </select>
                </CardContent>
              </Card>

              {/* Scanner */}
              {selectedEventoId ? (
                <Card variant="default" padding="none">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {selectedEvento?.titulo}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedEvento && formatDateTime(selectedEvento.fecha_evento)}
                        </p>
                      </div>
                      <Button
                        variant={isScanning ? "outline" : "primary"}
                        onClick={() => setIsScanning(!isScanning)}
                      >
                        {isScanning ? "Pausar" : "Iniciar"} escáner
                      </Button>
                    </div>
                  </div>

                  <div className="p-6">
                    <QRScanner
                      onScan={handleScan}
                      onError={handleError}
                      isActive={isScanning}
                    />

                  </div>
                </Card>
              ) : (
                <Card variant="default">
                  <CardContent className="text-center py-16">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Seleccioná un evento
                    </h3>
                    <p className="text-gray-500">
                      Elegí el evento para el cual vas a escanear entradas.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Stats and history */}
            <div className="space-y-6">
              {/* Stats */}
              <Card variant="default">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Estadísticas</CardTitle>
                  {(stats.validas > 0 || stats.yaUsadas > 0 || stats.invalidas > 0) && (
                    <button
                      onClick={resetStats}
                      className="text-xs text-gray-500 hover:text-bordo transition-colors"
                    >
                      Reiniciar
                    </button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-2">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{stats.validas}</p>
                      <p className="text-xs text-gray-500">Válidas</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-xl bg-amarillo/20 flex items-center justify-center mx-auto mb-2">
                        <svg className="w-6 h-6 text-amarillo-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{stats.yaUsadas}</p>
                      <p className="text-xs text-gray-500">Ya usadas</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mx-auto mb-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{stats.invalidas}</p>
                      <p className="text-xs text-gray-500">Inválidas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* History */}
              <Card variant="default">
                <CardHeader>
                  <CardTitle className="text-lg">Historial reciente</CardTitle>
                </CardHeader>
                <CardContent>
                  {scanHistory.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Los escaneos aparecerán aquí
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {scanHistory.map((item) => (
                        <div
                          key={item.id}
                          className={cn(
                            "p-3 rounded-lg border",
                            item.result.status === "success" && "bg-green-50 border-green-200",
                            item.result.status === "warning" && "bg-amarillo/10 border-amarillo/30",
                            item.result.status === "error" && "bg-red-50 border-red-200"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                item.result.status === "success" && "bg-green-200",
                                item.result.status === "warning" && "bg-amarillo/30",
                                item.result.status === "error" && "bg-red-200"
                              )}
                            >
                              {item.result.status === "success" && (
                                <svg className="w-4 h-4 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                              {item.result.status === "warning" && (
                                <svg className="w-4 h-4 text-amarillo-dark" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              )}
                              {item.result.status === "error" && (
                                <svg className="w-4 h-4 text-red-700" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">
                                {item.entrada?.nombre_asistente || item.result.message}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.timestamp.toLocaleTimeString("es-UY", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Help */}
              <Card variant="glass">
                <CardContent className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-bordo/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-bordo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Cómo usar</p>
                    <ul className="text-gray-600 mt-1 space-y-1">
                      <li>1. Seleccioná el evento</li>
                      <li>2. Iniciá el escáner</li>
                      <li>3. Apuntá al código QR</li>
                      <li>4. Verificá el resultado</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Full screen overlay for scan results */}
      {showOverlay && lastScanResult && (
        <ScanResultOverlay
          status={lastScanResult.status}
          message={lastScanResult.message}
          details={lastScanResult.details}
          extraInfo={
            lastEntrada && lastScanResult.status === "success"
              ? {
                  nombre: lastEntrada.nombre_asistente,
                  cedula: lastEntrada.cedula_asistente || undefined,
                  tipoEntrada: lastEntrada.tipo_entrada,
                }
              : undefined
          }
          onClose={() => {
            setShowOverlay(false);
            setLastScanResult(null);
            setLastEntrada(null);
          }}
          autoCloseDelay={4000}
        />
      )}
    </>
  );
}
