"use client";

import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { deportes } from "@/data/deportes";

function DeporteCard({
  deporte,
  index,
}: {
  deporte: (typeof deportes)[0];
  index: number;
}) {
  const ref = useScrollReveal<HTMLAnchorElement>({
    animation: "fade-up",
    delay: 100 + index * 50,
  });

  return (
    <Link
      ref={ref}
      href={`/deportes/${deporte.slug}`}
      className="group relative block rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 aspect-[4/3]"
    >
      {/* Image */}
      <Image
        src={deporte.imagen}
        alt={deporte.nombre}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-bordo-dark/90 via-bordo/40 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg group-hover:text-amarillo transition-colors duration-300">
          {deporte.nombre}
        </h3>

        {deporte.categorias.length > 1 && (
          <p className="text-white/70 text-sm mt-2">
            {deporte.categorias.length} categorías
          </p>
        )}

        {/* Arrow indicator */}
        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 translate-x-2">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </div>
      </div>

      {/* Decorative corner accent */}
      <div className="absolute top-0 left-0 w-20 h-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amarillo/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </Link>
  );
}

export default function DeportesPage() {
  const introRef = useScrollReveal<HTMLDivElement>({
    animation: "fade-up",
    delay: 100,
  });

  return (
    <>
      <PageHeader
        title="Disciplinas"
        description="Conocé las diferentes disciplinas deportivas en las que competimos y participamos."
        backgroundImage="/Rugby.jpg"
        overlay="dark"
      />

      <main className="py-16 lg:py-24 bg-gradient-to-b from-white via-stone-50/30 to-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Intro */}
            <div ref={introRef} className="text-center mb-12">
              <p className="text-lg text-bordo-dark/70 max-w-3xl mx-auto leading-relaxed">
                El Club Seminario cuenta con más de{" "}
                <span className="font-semibold text-bordo">
                  22 categorías deportivas
                </span>{" "}
                en las que participan más de 1000 socios, compitiendo en
                diversas ligas y torneos a nivel nacional.
              </p>
            </div>

            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {deportes.map((deporte, index) => (
                <DeporteCard key={deporte.slug} deporte={deporte} index={index} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
