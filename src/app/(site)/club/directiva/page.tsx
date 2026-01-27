import type { Metadata } from "next";
import { DirectivaContent } from "./DirectivaContent";

export const metadata: Metadata = {
  title: "Comisión Directiva",
  description:
    "Conocé a la Comisión Directiva del Club Seminario. Miembros titulares, suplentes y comisión fiscal de nuestra institución deportiva.",
  openGraph: {
    title: "Comisión Directiva | Club Seminario",
    description:
      "Miembros de la Comisión Directiva del Club Seminario.",
    images: ["/foto-directiva.webp"],
  },
};

export default function DirectivaPage() {
  return <DirectivaContent />;
}
