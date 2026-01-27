import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@heroicons/react", "lucide-react"],
  },
};

export default withSentryConfig(nextConfig, {
  // Configuración de Sentry
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Sourcemaps
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Tunnel para evitar ad-blockers
  tunnelRoute: "/monitoring",

  // Desactivar telemetría
  telemetry: false,
});
