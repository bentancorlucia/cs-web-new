import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Habilitar solo en producción
  enabled: process.env.NODE_ENV === "production",

  // Filtrar errores que no queremos reportar
  ignoreErrors: [
    "NEXT_NOT_FOUND",
    "NEXT_REDIRECT",
  ],

  // Antes de enviar el evento
  beforeSend(event) {
    if (process.env.NODE_ENV !== "production") {
      return null;
    }
    return event;
  },
});
