import { notFound } from "next/navigation";
import { getEventoBySlug, getUpcomingEventos } from "@/lib/eventos";
import { EventoDetalleContent } from "./EventoDetalleContent";
import type { Metadata } from "next";

interface EventoPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const evento = await getEventoBySlug(slug);

  if (!evento) {
    return {
      title: "Evento no encontrado | Club Seminario",
    };
  }

  return {
    title: `${evento.titulo} | Eventos | Club Seminario`,
    description: evento.descripcion_corta || evento.descripcion || `Comprá tus entradas para ${evento.titulo} en Club Seminario.`,
    openGraph: {
      title: evento.titulo,
      description: evento.descripcion_corta || undefined,
      images: evento.imagen_url ? [evento.imagen_url] : undefined,
    },
  };
}

export default async function EventoPage({ params }: EventoPageProps) {
  const { slug } = await params;
  const evento = await getEventoBySlug(slug);

  if (!evento) {
    notFound();
  }

  // Get other upcoming events for related section
  const otrosEventos = await getUpcomingEventos(4);
  const eventosRelacionados = otrosEventos.filter((e) => e.id !== evento.id).slice(0, 3);

  return <EventoDetalleContent evento={evento} eventosRelacionados={eventosRelacionados} />;
}
