import { notFound } from "next/navigation";
import { deportes, getDeporteBySlug } from "@/data/deportes";
import DeportePageClient from "./DeportePageClient";

export function generateStaticParams() {
  return deportes.map((deporte) => ({
    slug: deporte.slug,
  }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const deporte = getDeporteBySlug(params.slug);
  if (!deporte) {
    return { title: "Deporte no encontrado" };
  }
  return {
    title: `${deporte.nombre} | Club Seminario`,
    description: deporte.descripcion || `Conocé la disciplina ${deporte.nombre} del Club Seminario`,
  };
}

export default async function DeportePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const deporte = getDeporteBySlug(slug);

  if (!deporte) {
    notFound();
  }

  return <DeportePageClient deporte={deporte} />;
}
