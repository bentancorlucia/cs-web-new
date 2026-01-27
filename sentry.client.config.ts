import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Porcentaje de transacciones para performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Captura de errores
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Habilitar solo en producción
  enabled: process.env.NODE_ENV === "production",

  // Filtrar errores comunes que no son útiles
  ignoreErrors: [
    // Errores de red comunes
    "Network request failed",
    "Failed to fetch",
    "Load failed",
    // Errores de navegación cancelada
    "AbortError",
    "ResizeObserver loop limit exceeded",
    // Errores de extensiones de navegador
    /^chrome-extension:\/\//,
    /^moz-extension:\/\//,
  ],

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Antes de enviar el evento, podemos modificarlo
  beforeSend(event) {
    // No enviar eventos en desarrollo
    if (process.env.NODE_ENV !== "production") {
      return null;
    }
    return event;
  },
});
