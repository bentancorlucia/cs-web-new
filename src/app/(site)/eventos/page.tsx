import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout";
import { getEventosWithPrices } from "@/lib/eventos";
import { EventosContent } from "./EventosContent";

export const metadata: Metadata = {
  title: "Eventos",
  description:
    "Eventos sociales y actividades de Club Seminario. Comprá tus entradas online para fiestas, torneos y encuentros del club.",
  openGraph: {
    title: "Eventos | Club Seminario",
    description:
      "Fiestas, torneos y encuentros del Club Seminario. Comprá tus entradas online.",
    images: ["/foto-eventos.webp"],
  },
};

interface EventosPageProps {
  searchParams: Promise<{
    busqueda?: string;
    pasados?: string;
    soloSocios?: string;
  }>;
}

export default async function EventosPage({ searchParams }: EventosPageProps) {
  const params = await searchParams;

  const eventos = await getEventosWithPrices({
    busqueda: params.busqueda,
    pasados: params.pasados === "true",
    soloSocios: params.soloSocios === "true" ? true : undefined,
  });

  return (
    <>
      <PageHeader
        title="Eventos"
        subtitle="Club Seminario"
        description="Encontrá todos los eventos, fiestas y actividades del club. Comprá tus entradas de forma segura."
        backgroundImage="/foto-eventos.webp"
        size="sm"
        breadcrumbs={[{ label: "Eventos" }]}
      />

      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <Suspense
            fallback={
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-bordo/10 mb-4">
                  <svg
                    className="w-6 h-6 text-bordo motion-safe:animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500">Cargando eventos...</p>
              </div>
            }
          >
            <EventosContent
              initialEventos={eventos}
              initialFilters={{
                busqueda: params.busqueda,
                pasados: params.pasados === "true",
                soloSocios: params.soloSocios === "true",
              }}
            />
          </Suspense>
        </div>
      </section>
    </>
  );
}
