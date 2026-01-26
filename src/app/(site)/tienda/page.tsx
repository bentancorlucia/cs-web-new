import { Suspense } from "react";
import { PageHeader } from "@/components/layout";
import { getProducts, getCategories, getDeportes } from "@/lib/tienda";
import { TiendaContent } from "./TiendaContent";

export const metadata = {
  title: "Tienda | Club Seminario",
  description:
    "Tienda oficial de Club Seminario. Encontrá indumentaria, accesorios y productos del club.",
};

interface TiendaPageProps {
  searchParams: Promise<{
    categoria?: string;
    deporte?: string;
    busqueda?: string;
    ordenar?: string;
    oferta?: string;
  }>;
}

export default async function TiendaPage({ searchParams }: TiendaPageProps) {
  const params = await searchParams;

  // Fetch initial data server-side
  const [products, categorias, deportes] = await Promise.all([
    getProducts({
      categoria: params.categoria,
      deporte: params.deporte,
      busqueda: params.busqueda,
      enOferta: params.oferta === "true",
      ordenar: params.ordenar as "precio_asc" | "precio_desc" | "nombre" | "recientes" | undefined,
    }),
    getCategories(),
    getDeportes(),
  ]);

  return (
    <>
      <PageHeader
        title="Tienda"
        subtitle="Club Seminario"
        description="Encontrá toda la indumentaria oficial, accesorios y productos exclusivos del club"
        backgroundImage="/foto-tienda.webp"
        size="sm"
        breadcrumbs={[{ label: "Tienda" }]}
      />

      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <Suspense
            fallback={
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-bordo/10 mb-4">
                  <svg
                    className="w-6 h-6 text-bordo animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
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
                <p className="text-gray-500">Cargando productos...</p>
              </div>
            }
          >
            <TiendaContent
              initialProducts={products}
              categorias={categorias}
              deportes={deportes}
              initialFilters={{
                categoria: params.categoria,
                deporte: params.deporte,
                busqueda: params.busqueda,
                enOferta: params.oferta === "true",
                ordenar: params.ordenar as "precio_asc" | "precio_desc" | "nombre" | "recientes" | undefined,
              }}
            />
          </Suspense>
        </div>
      </section>
    </>
  );
}
