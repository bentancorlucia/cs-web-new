"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { beneficios, categorias } from "@/data/beneficios";

export function BeneficiosContent() {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
  const introRef = useScrollReveal<HTMLDivElement>({ animation: "fade-up", delay: 100 });
  const contentRef = useScrollReveal<HTMLDivElement>({ animation: "fade-up", delay: 200 });
  const ctaRef = useScrollReveal<HTMLDivElement>({ animation: "fade-up", delay: 300 });

  const beneficiosFiltrados = categoriaSeleccionada === "Todas"
    ? beneficios
    : beneficios.filter((b) => b.categoria === categoriaSeleccionada);

  const categoriasConBeneficios = categorias.filter(
    (cat) => cat.nombre === "Todas" || beneficios.some((b) => b.categoria === cat.nombre)
  );

  return (
    <>
      <PageHeader
        title="Beneficios"
        backgroundImage="/foto-beneficios.webp"
        breadcrumbs={[{ label: "Beneficios" }]}
        overlay="medium"
      />

      <main className="py-16 lg:py-24 bg-gradient-to-b from-white via-stone-50/30 to-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Intro */}
            <div ref={introRef} className="mb-12">
              <p className="text-bordo-dark/80 text-lg leading-relaxed mb-4">
                Cada socio/a tiene una tarjeta de membresía del Club Seminario,
                con su nombre, apellido y cédula de identidad. La tarjeta es de
                uso personal e intransferible y el socio/a debe presentar la
                cédula de identidad para acceder a los beneficios.
              </p>
              <p className="text-bordo-dark/80 text-lg leading-relaxed">
                Se está trabajando activamente en la actualización y obtención
                de beneficios.
              </p>
            </div>

            {/* Filtro de categorías */}
            <div ref={contentRef} className="mb-8">
              <label htmlFor="categoria" className="block text-sm font-medium text-bordo-dark/70 mb-2">
                Filtrar por categoría:
              </label>
              <select
                id="categoria"
                value={categoriaSeleccionada}
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 border border-stone-200 rounded-lg bg-white text-bordo-dark focus:outline-none focus:ring-2 focus:ring-bordo/20 focus:border-bordo"
              >
                {categoriasConBeneficios.map((cat) => (
                  <option key={cat.id} value={cat.nombre}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Lista de beneficios */}
            <div className="grid gap-4 mb-12">
              {beneficiosFiltrados.length > 0 ? (
                beneficiosFiltrados.map((beneficio) => (
                  <div
                    key={beneficio.id}
                    className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 flex items-center gap-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex-shrink-0 w-20 h-20 bg-bordo/80 rounded-lg flex items-center justify-center overflow-hidden">
                      {beneficio.logo ? (
                        <Image
                          src={beneficio.logo}
                          alt={beneficio.empresa}
                          width={64}
                          height={64}
                          className="object-contain"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-white/70">
                          {beneficio.empresa.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-bordo text-lg">
                        {beneficio.empresa}
                      </h3>
                      <p className="text-bordo-dark/80 font-medium">
                        {beneficio.descuento}
                      </p>
                      {beneficio.descripcion && (
                        <p className="text-sm text-bordo-dark/60 mt-1">
                          {beneficio.descripcion}
                        </p>
                      )}
                      <span className="inline-block mt-2 px-2 py-0.5 bg-stone-100 text-bordo-dark/60 text-xs rounded-full">
                        {beneficio.categoria}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-bordo-dark/60">
                  No se encontraron beneficios en esta categoría.
                </div>
              )}
            </div>

            {/* Nota */}
            <div className="bg-gradient-to-br from-bordo/5 to-amarillo/5 rounded-xl p-6 border border-bordo/10 mb-12">
              <p className="text-bordo-dark/80 text-sm text-center">
                Para conocer todos los beneficios vigentes y cómo acceder a
                ellos, contactate con la secretaría del club.
              </p>
            </div>

            {/* CTA */}
            <div ref={ctaRef} className="text-center">
              <p className="text-bordo-dark/70 mb-6">
                ¿Todavía no sos socio? Unite a nuestra familia y accedé a todos
                estos beneficios.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://forms.gle/S672snEbvEPWgfHm9"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="primary" size="lg">
                    Hacete socio
                  </Button>
                </a>
                <Link href="/socios">
                  <Button variant="outline" size="lg">
                    Más información
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
