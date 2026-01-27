import type { Metadata } from "next";
import { MemoriasContent } from "./MemoriasContent";

export const metadata: Metadata = {
  title: "Memorias",
  description:
    "Memorias anuales del Club Seminario. Historia, logros y balance de actividades deportivas y sociales de cada temporada.",
  openGraph: {
    title: "Memorias | Club Seminario",
    description:
      "Memorias anuales con la historia y logros del Club Seminario.",
    images: ["/foto-memorias.webp"],
  },
};

export default function MemoriasPage() {
  return <MemoriasContent />;
}
