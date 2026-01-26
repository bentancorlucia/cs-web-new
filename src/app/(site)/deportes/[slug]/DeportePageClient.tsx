"use client";

import Image from "next/image";
import { PageHeader } from "@/components/layout/PageHeader";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { type Deporte, type Categoria } from "@/data/deportes";

function CategoriaCard({
  categoria,
  index,
  showImage,
}: {
  categoria: Categoria;
  index: number;
  showImage: boolean;
}) {
  const ref = useScrollReveal<HTMLDivElement>({
    animation: "fade-up",
    delay: 100 + index * 100,
  });

  return (
    <div
      ref={ref}
      className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className={`${showImage ? "lg:flex" : ""}`}>
        {/* Image */}
        {showImage && categoria.imagen && (
          <div className="lg:w-2/5 relative aspect-[4/3] lg:aspect-auto">
            <Image
              src={categoria.imagen}
              alt={categoria.nombre}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className={`p-6 lg:p-8 ${showImage ? "lg:w-3/5" : ""}`}>
          <h2 className="text-2xl font-bold text-bordo mb-4">
            {categoria.nombre}
          </h2>

          <p className="text-bordo-dark/70 leading-relaxed mb-6">
            {categoria.descripcion}
          </p>

          {/* Info grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Prácticas */}
            <div className="bg-stone-50 rounded-xl p-5">
              <h3 className="font-semibold text-bordo flex items-center gap-2 mb-3">
                <svg
                  className="w-5 h-5 text-amarillo"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
                </svg>
                Prácticas
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                  </svg>
                  <span className="text-bordo-dark/80">
                    {categoria.practicas.horario}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <svg
                    className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span className="text-bordo-dark/80">
                    {categoria.practicas.lugar}
                  </span>
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div className="bg-gradient-to-br from-bordo/5 to-amarillo/5 rounded-xl p-5 border border-bordo/10">
              <h3 className="font-semibold text-bordo flex items-center gap-2 mb-3">
                <svg
                  className="w-5 h-5 text-amarillo"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                Contacto
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-4 h-4 text-stone-400 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  <span className="text-bordo-dark font-medium">
                    {categoria.contacto.nombre}
                  </span>
                </div>

                <a
                  href={`tel:${categoria.contacto.telefono.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 text-bordo hover:text-amarillo-dark transition-colors group"
                >
                  <svg
                    className="w-4 h-4 text-stone-400 group-hover:text-amarillo transition-colors flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                  <span className="font-medium">
                    {categoria.contacto.telefono}
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DeportePageClient({ deporte }: { deporte: Deporte }) {
  const showImages = deporte.categorias.length > 1;

  return (
    <>
      <PageHeader
        title={deporte.nombre}
        subtitle="Disciplina"
        description={deporte.descripcion}
        backgroundImage={deporte.imagen}
        breadcrumbs={[
          { label: "Disciplinas", href: "/deportes" },
          { label: deporte.nombre },
        ]}
        overlay="dark"
      />

      <main className="py-16 lg:py-24 bg-gradient-to-b from-white via-stone-50/30 to-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-8">
              {deporte.categorias.map((categoria, index) => (
                <CategoriaCard
                  key={categoria.nombre}
                  categoria={categoria}
                  index={index}
                  showImage={showImages}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
