import type { Metadata } from "next";
import { SociosContent } from "./SociosContent";

export const metadata: Metadata = {
  title: "Socios",
  description:
    "Hacete socio del Club Seminario. Accedé a beneficios exclusivos, descuentos del 5% al 50% y formá parte de nuestra comunidad deportiva.",
  openGraph: {
    title: "Socios | Club Seminario",
    description:
      "Hacete socio del Club Seminario. Accedé a beneficios exclusivos y formá parte de nuestra comunidad deportiva.",
    images: ["/foto-socios.webp"],
  },
};

export default function SociosPage() {
  return <SociosContent />;
}
