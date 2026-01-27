import type { Metadata } from "next";
import { BeneficiosContent } from "./BeneficiosContent";

export const metadata: Metadata = {
  title: "Beneficios",
  description:
    "Descubrí los beneficios exclusivos para socios del Club Seminario. Descuentos del 5% al 50% en gastronomía, tecnología, hotelería, indumentaria y más.",
  openGraph: {
    title: "Beneficios | Club Seminario",
    description:
      "Beneficios exclusivos para socios del Club Seminario. Descuentos en múltiples rubros.",
    images: ["/foto-beneficios.webp"],
  },
};

export default function BeneficiosPage() {
  return <BeneficiosContent />;
}
