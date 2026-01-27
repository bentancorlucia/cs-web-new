import type { Metadata } from "next";
import { InstalacionesContent } from "./InstalacionesContent";

export const metadata: Metadata = {
  title: "Instalaciones",
  description:
    "Instalaciones del Club Seminario. Parque CUPRA con canchas de rugby, fútbol y más. Ubicación: Cochabamba 2882, Montevideo.",
  openGraph: {
    title: "Instalaciones | Club Seminario",
    description:
      "Parque CUPRA - Campo de deportes del Club Seminario con canchas de rugby y fútbol.",
    images: ["/foto-cupra.webp"],
  },
};

export default function InstalacionesPage() {
  return <InstalacionesContent />;
}
