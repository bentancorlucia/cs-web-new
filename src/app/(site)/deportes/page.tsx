import type { Metadata } from "next";
import { DeportesContent } from "./DeportesContent";

export const metadata: Metadata = {
  title: "Disciplinas Deportivas",
  description:
    "Conocé las 22 disciplinas deportivas del Club Seminario: rugby, hockey, fútbol, handball, básquetbol, volleyball y corredores. Más de 1000 socios compitiendo en Uruguay.",
  openGraph: {
    title: "Disciplinas Deportivas | Club Seminario",
    description:
      "Rugby, hockey, fútbol, handball, básquetbol, volleyball y más. Conocé todas las disciplinas del Club Seminario.",
    images: ["/Rugby.jpg"],
  },
};

export default function DeportesPage() {
  return <DeportesContent />;
}
