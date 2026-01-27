"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { memorias } from "@/data/memorias";

function MemoriaCard({ anio, url, index }: { anio: number; url: string; index: number }) {
  const ref = useScrollReveal<HTMLAnchorElement>({
    animation: "fade-up",
    delay: 100 + index * 50,
  });

  const isLatest = index === 0;

  return (
    <a
      ref={ref}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative block rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] ${
        isLatest
          ? "bg-gradient-to-br from-bordo to-bordo-dark text-white shadow-lg hover:shadow-xl"
          : "bg-white border border-stone-200 hover:border-amarillo/50 hover:shadow-lg"
      }`}
    >
      {/* Badge for latest */}
      {isLatest && (
        <div className="absolute -top-3 -right-3 bg-amarillo text-bordo-dark text-xs font-bold px-3 py-1 rounded-full shadow-md">
          Actual
        </div>
      )}

      {/* Icon */}
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${
          isLatest ? "bg-white/15" : "bg-gradient-to-br from-bordo/10 to-amarillo/10"
        }`}
      >
        <svg
          className={`w-7 h-7 ${isLatest ? "text-white" : "text-bordo"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </div>

      {/* Title */}
      <h3
        className={`text-2xl font-bold ${
          isLatest ? "text-white" : "text-bordo-dark"
        }`}
      >
        Memoria {anio}
      </h3>

      {/* Action */}
      <div
        className={`mt-4 inline-flex items-center gap-2 text-sm font-medium ${
          isLatest ? "text-amarillo" : "text-bordo"
        }`}
      >
        Ver memoria
        <svg
          className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </div>

      {/* Decorative line */}
      {!isLatest && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amarillo via-amarillo-light to-transparent rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </a>
  );
}

export function MemoriasContent() {
  const introRef = useScrollReveal<HTMLDivElement>({
    animation: "fade-up",
    delay: 100,
  });

  return (
    <>
      <PageHeader
        title="Memorias"
        backgroundImage="/foto-memorias.webp"
        breadcrumbs={[
          { label: "Club", href: "/club/directiva" },
          { label: "Memorias" },
        ]}
        overlay="medium"
      />

      <main className="py-16 lg:py-24 bg-gradient-to-b from-white via-stone-50/30 to-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Intro */}
            <div ref={introRef} className="text-center mb-12">
              <p className="text-lg text-bordo-dark/70 max-w-2xl mx-auto">
                Conocé la historia y los logros de nuestro Club a través de las
                memorias anuales, donde documentamos el trabajo y los avances de
                cada temporada.
              </p>
            </div>

            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {memorias.map((memoria, index) => (
                <MemoriaCard
                  key={memoria.anio}
                  anio={memoria.anio}
                  url={memoria.url}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
