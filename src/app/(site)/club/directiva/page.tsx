"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  comisionDirectiva,
  suplentes,
  comisionFiscal,
  type Directivo,
} from "@/data/directivos";

function DirectivoCard({ directivo, index }: { directivo: Directivo; index: number }) {
  const ref = useScrollReveal<HTMLDivElement>({
    animation: "fade-up",
    delay: 50 + index * 30,
  });

  return (
    <div
      ref={ref}
      className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-stone-100 hover:border-amarillo/30"
    >
      {/* Icon */}
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-bordo to-bordo-dark flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
        <svg
          className="w-7 h-7 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </div>

      {/* Info */}
      <h3 className="text-lg font-semibold text-bordo-dark group-hover:text-bordo transition-colors">
        {directivo.nombre}
      </h3>
      <p className="text-stone-500 text-sm mt-1">{directivo.cargo}</p>

      {/* Decorative accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amarillo via-amarillo-light to-transparent rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}

function SeccionDirectivos({
  titulo,
  directivos,
  startIndex = 0,
}: {
  titulo: string;
  directivos: Directivo[];
  startIndex?: number;
}) {
  const titleRef = useScrollReveal<HTMLHeadingElement>({
    animation: "fade-up",
    delay: 100,
  });

  return (
    <section className="mb-16">
      <h2
        ref={titleRef}
        className="text-2xl md:text-3xl font-bold text-bordo mb-8 flex items-center gap-3"
      >
        <span className="w-10 h-1 bg-amarillo rounded-full" />
        {titulo}
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {directivos.map((directivo, index) => (
          <DirectivoCard
            key={directivo.nombre}
            directivo={directivo}
            index={startIndex + index}
          />
        ))}
      </div>
    </section>
  );
}

export default function DirectivaPage() {
  return (
    <>
      <PageHeader
        title="Comisión Directiva"
        backgroundImage="/foto-directiva.webp"
        breadcrumbs={[
          { label: "Club", href: "/club/directiva" },
          { label: "Comisión Directiva" },
        ]}
        overlay="medium"
      />

      <main className="py-16 lg:py-24 bg-gradient-to-b from-white via-stone-50/30 to-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <SeccionDirectivos
              titulo="Comisión Directiva"
              directivos={comisionDirectiva}
            />

            <SeccionDirectivos
              titulo="Suplentes"
              directivos={suplentes}
              startIndex={comisionDirectiva.length}
            />

            <SeccionDirectivos
              titulo="Comisión Fiscal"
              directivos={comisionFiscal}
              startIndex={comisionDirectiva.length + suplentes.length}
            />
          </div>
        </div>
      </main>
    </>
  );
}
