"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function BeneficiosPage() {
  const introRef = useScrollReveal<HTMLDivElement>({ animation: "fade-up", delay: 100 });
  const contentRef = useScrollReveal<HTMLDivElement>({ animation: "fade-up", delay: 200 });
  const ctaRef = useScrollReveal<HTMLDivElement>({ animation: "fade-up", delay: 300 });

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

            {/* Content placeholder */}
            <div
              ref={contentRef}
              className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-stone-100 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amarillo/20 to-bordo/10 flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-bordo"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-bordo mb-4">
                Beneficios exclusivos para socios
              </h2>

              <p className="text-bordo-dark/70 max-w-lg mx-auto mb-8">
                Como socio del Club Seminario accedés a descuentos que van desde
                el 5% al 50% en rubros tan variados como gastronomía, servicio
                automotriz, catering, tecnología, veterinaria, hotelería,
                indumentaria, bienestar, estética y deporte.
              </p>

              {/* Categories preview */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {[
                  "Gastronomía",
                  "Servicio Automotriz",
                  "Tecnología",
                  "Veterinaria",
                  "Hotelería",
                  "Indumentaria",
                  "Bienestar",
                  "Deporte",
                ].map((cat) => (
                  <span
                    key={cat}
                    className="px-3 py-1.5 bg-stone-100 text-bordo-dark/70 text-sm rounded-full"
                  >
                    {cat}
                  </span>
                ))}
              </div>

              <div className="bg-gradient-to-br from-bordo/5 to-amarillo/5 rounded-xl p-6 border border-bordo/10">
                <p className="text-bordo-dark/80 text-sm">
                  Para conocer todos los beneficios vigentes y cómo acceder a
                  ellos, contactate con la secretaría del club.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div ref={ctaRef} className="mt-12 text-center">
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
