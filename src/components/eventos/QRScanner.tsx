"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface QRScannerProps {
  onScan: (code: string) => void;
  onError?: (error: string) => void;
  isActive?: boolean;
}

type ScanResult = {
  status: "success" | "error" | "warning";
  message: string;
  details?: string;
};

interface CameraInfo {
  id: string;
  label: string;
}

export function QRScanner({ onScan, onError, isActive = true }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scannerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [cameras, setCameras] = useState<CameraInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");

  const stopScanner = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (scannerRef.current) {
      scannerRef.current.stop?.();
      scannerRef.current = null;
    }
  }, []);

  const startScanner = useCallback(async (deviceId?: string) => {
    if (!isActive) return;

    try {
      setIsLoading(true);
      stopScanner();

      // Importar dinámicamente html5-qrcode
      const { Html5Qrcode } = await import("html5-qrcode");

      // Obtener cámaras disponibles
      const devices = await Html5Qrcode.getCameras();
      setCameras(devices.map((d) => ({ id: d.id, label: d.label || "" })));

      if (devices.length === 0) {
        setHasPermission(false);
        onError?.("No se encontraron cámaras");
        return;
      }

      const cameraId = deviceId || devices[0].id;
      setSelectedCamera(cameraId);

      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          // Evitar escaneos duplicados rápidos
          onScan(decodedText);
        },
        () => {
          // Error de escaneo silencioso (normal cuando no hay QR)
        }
      );

      setHasPermission(true);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Error iniciando scanner:", err);
      setHasPermission(false);
      setIsLoading(false);
      onError?.(err.message || "Error al acceder a la cámara");
    }
  }, [isActive, onScan, onError, stopScanner]);

  useEffect(() => {
    if (isActive) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isActive, startScanner, stopScanner]);

  const handleCameraChange = (newCameraId: string) => {
    setSelectedCamera(newCameraId);
    startScanner(newCameraId);
  };

  const showResult = (result: ScanResult) => {
    setLastResult(result);
    setTimeout(() => setLastResult(null), 3000);
  };

  if (!isActive) {
    return (
      <div className="relative aspect-square max-w-md mx-auto rounded-2xl overflow-hidden bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white/60">
          <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <p>Escáner pausado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selector de cámara */}
      {cameras.length > 1 && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Cámara:</label>
          <select
            value={selectedCamera}
            onChange={(e) => handleCameraChange(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-bordo focus:border-transparent"
          >
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label || `Cámara ${camera.id.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Área del scanner */}
      <div className="relative aspect-square max-w-md mx-auto rounded-2xl overflow-hidden bg-gray-900">
        {/* Contenedor del video */}
        <div id="qr-reader" className="w-full h-full" />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-bordo/30 border-t-bordo rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/80">Iniciando cámara...</p>
            </div>
          </div>
        )}

        {/* Sin permiso */}
        {hasPermission === false && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 p-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <p className="text-white font-medium mb-2">Sin acceso a la cámara</p>
              <p className="text-white/60 text-sm mb-4">
                Permite el acceso a la cámara para escanear códigos QR
              </p>
              <button
                onClick={() => startScanner()}
                className="px-4 py-2 rounded-lg bg-bordo text-white font-medium hover:bg-bordo-dark transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Marco de escaneo decorativo */}
        {!isLoading && hasPermission && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Esquinas del marco */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64">
              {/* Esquina superior izquierda */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-amarillo rounded-tl-lg" />
              {/* Esquina superior derecha */}
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-amarillo rounded-tr-lg" />
              {/* Esquina inferior izquierda */}
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-amarillo rounded-bl-lg" />
              {/* Esquina inferior derecha */}
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-amarillo rounded-br-lg" />

              {/* Línea de escaneo animada */}
              <div className="absolute inset-x-4 top-4 h-0.5 bg-gradient-to-r from-transparent via-amarillo to-transparent animate-pulse" />
            </div>
          </div>
        )}

        {/* Resultado del escaneo */}
        {lastResult && (
          <div className={cn(
            "absolute bottom-4 left-4 right-4 p-4 rounded-xl",
            "animate-in slide-in-from-bottom-4 fade-in duration-300",
            lastResult.status === "success" && "bg-green-500",
            lastResult.status === "error" && "bg-red-500",
            lastResult.status === "warning" && "bg-amarillo"
          )}>
            <div className="flex items-center gap-3">
              {lastResult.status === "success" && (
                <svg className="w-6 h-6 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {lastResult.status === "error" && (
                <svg className="w-6 h-6 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {lastResult.status === "warning" && (
                <svg className="w-6 h-6 text-bordo-dark flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <div>
                <p className={cn(
                  "font-semibold",
                  lastResult.status === "warning" ? "text-bordo-dark" : "text-white"
                )}>
                  {lastResult.message}
                </p>
                {lastResult.details && (
                  <p className={cn(
                    "text-sm mt-0.5",
                    lastResult.status === "warning" ? "text-bordo-dark/80" : "text-white/80"
                  )}>
                    {lastResult.details}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instrucciones */}
      <div className="text-center text-sm text-gray-500">
        <p>Apunta la cámara hacia el código QR de la entrada</p>
      </div>
    </div>
  );
}

export { type ScanResult };
