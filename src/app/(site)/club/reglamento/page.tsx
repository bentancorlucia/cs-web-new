import type { Metadata } from "next";
import { ReglamentoContent } from "./ReglamentoContent";

export const metadata: Metadata = {
  title: "Reglamento",
  description:
    "Reglamento interno del Club Seminario. Normas y disposiciones que regulan las actividades deportivas y sociales del club.",
  openGraph: {
    title: "Reglamento | Club Seminario",
    description:
      "Reglamento interno y normas del Club Seminario.",
    images: ["/foto-reglamento.webp"],
  },
};

export default function ReglamentoPage() {
  return <ReglamentoContent />;
}
