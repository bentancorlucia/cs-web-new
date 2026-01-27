import type { Metadata } from "next";
import { EstatutoContent } from "./EstatutoContent";

export const metadata: Metadata = {
  title: "Estatuto",
  description:
    "Estatuto oficial del Club Seminario. Documento institucional que rige el funcionamiento de nuestra organización deportiva.",
  openGraph: {
    title: "Estatuto | Club Seminario",
    description:
      "Documento oficial del estatuto del Club Seminario.",
    images: ["/foto-estatuto.webp"],
  },
};

export default function EstatutoPage() {
  return <EstatutoContent />;
}
