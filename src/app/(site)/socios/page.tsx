"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function SociosPage() {
  const quoteRef = useScrollReveal<HTMLDivElement>({ animation: "fade-up", delay: 100 });
  const infoRef = useScrollReveal<HTMLDivElement>({ animation: "fade-up", delay: 150 });
  const colaboradorRef = useScrollReveal<HTMLDivElement>({ animation: "fade-up", delay: 200 });
  const deportivoRef = useScrollReveal<HTMLDivElement>({ animation: "fade-up", delay: 250 });

  return (
    <>
      <PageHeader
        title="Socios"
        backgroundImage="/foto-socios.webp"
        breadcrumbs={[{ label: "Socios" }]}
        overlay="medium"
      />

      <main className="py-16 lg:py-24 bg-gradient-to-b from-white via-stone-50/30 to-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Quote */}
            <div
              ref={quoteRef}
              className="relative bg-gradient-to-br from-amarillo/10 to-bordo/5 rounded-2xl p-8 mb-10"
            >
              <svg
                className="absolute top-6 left-6 w-8 h-8 text-amarillo/50"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-bordo-dark text-xl leading-relaxed pl-12 pr-4">
                Todos nuestros socios/as colaboran con el desarrollo y
                fortalecimiento de la institución. Gracias a ellos crecemos,
                avanzamos y nos convertimos en un Club cada vez más fuerte.
              </p>
            </div>

            {/* Info text */}
            <div ref={infoRef} className="mb-12">
              <p className="text-bordo-dark/80 text-lg leading-relaxed">
                Cada socio/a tiene una tarjeta de membresía del Club Seminario,
                con su nombre, apellido y cédula de identidad. La tarjeta es de
                uso personal e intransferible y el socio/a debe presentar la
                cédula de identidad para acceder a beneficios que van desde el 5
                al 50% en rubros tan útiles y variados como gastronomía,
                servicio automotriz, catering, tecnología, veterinaria,
                hotelería, indumentaria, bienestar, estética y deporte, entre
                muchos otros.{" "}
                <Link
                  href="/beneficios"
                  className="text-bordo font-semibold hover:text-amarillo-dark transition-colors"
                >
                  Conoce todos los beneficios
                </Link>
                .
              </p>
            </div>

            {/* Membership types */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Socio Colaborador */}
              <div
                ref={colaboradorRef}
                className="bg-white rounded-2xl p-8 shadow-lg border border-stone-100 hover:shadow-xl transition-shadow duration-300 relative overflow-hidden"
              >
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amarillo/10 to-transparent" />

                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-bordo to-bordo-dark flex items-center justify-center mb-6">
                    <svg
                      className="w-7 h-7 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>

                  <h2 className="text-2xl font-bold text-bordo mb-4">
                    Socio Colaborador
                  </h2>

                  <p className="text-bordo-dark/70 leading-relaxed mb-6">
                    Si querés unirte como socio/a colaborador del Club
                    Seminario, aportás mensualmente{" "}
                    <span className="font-semibold text-bordo">UYU $480</span>{" "}
                    (cuatrocientos ochenta pesos uruguayos). Por ser parte de
                    nuestra institución accedes a una tarjeta de membresía.
                  </p>

                  <a
                    href="https://forms.gle/S672snEbvEPWgfHm9"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="primary" size="lg" className="w-full">
                      Hacete socio
                    </Button>
                  </a>
                </div>
              </div>

              {/* Socio Deportivo */}
              <div
                ref={deportivoRef}
                className="bg-white rounded-2xl p-8 shadow-lg border border-stone-100 hover:shadow-xl transition-shadow duration-300 relative overflow-hidden"
              >
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-bordo/10 to-transparent" />

                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amarillo to-amarillo-dark flex items-center justify-center mb-6">
                    <svg
                      className="w-7 h-7 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>

                  <h2 className="text-2xl font-bold text-bordo mb-4">
                    Socio Deportivo
                  </h2>

                  <p className="text-bordo-dark/70 leading-relaxed mb-6">
                    Si querés unirte a las actividades deportivas que
                    desarrollamos en el Club, busca la disciplina de tu interés
                    y contáctate con el referente. Por otras consultas escribí a{" "}
                    <a
                      href="mailto:secretaria@clubseminario.com.uy"
                      className="text-bordo font-semibold hover:text-amarillo-dark transition-colors"
                    >
                      secretaria@clubseminario.com.uy
                    </a>
                  </p>

                  <Link href="/deportes">
                    <Button variant="outline" size="lg" className="w-full">
                      Ver disciplinas
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
