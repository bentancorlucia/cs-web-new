"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-bordo mb-4">
              Algo salió mal
            </h1>
            <p className="text-gray-600 mb-8">
              Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
            </p>
            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-bordo text-white rounded-lg hover:bg-bordo-dark transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
