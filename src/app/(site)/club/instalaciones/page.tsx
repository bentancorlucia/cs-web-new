"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function InstalacionesPage() {
  const contentRef = useScrollReveal<HTMLDivElement>({
    animation: "fade-up",
    delay: 100,
  });
  const mapRef = useScrollReveal<HTMLDivElement>({
    animation: "fade-up",
    delay: 200,
  });

  return (
    <>
      <PageHeader
        title="Instalaciones"
        backgroundImage="/foto-cupra.webp"
        breadcrumbs={[
          { label: "Club", href: "/club/directiva" },
          { label: "Instalaciones" },
        ]}
        overlay="medium"
      />

      <main className="py-16 lg:py-24 bg-gradient-to-b from-white via-stone-50/30 to-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-bordo mb-8 flex items-center gap-3">
              <span className="w-10 h-1 bg-amarillo rounded-full" />
              Campo de deportes Parque CUPRA
            </h2>

            <div className="grid lg:grid-cols-2 gap-10 items-start">
              {/* Map */}
              <div
                ref={mapRef}
                className="relative rounded-2xl overflow-hidden shadow-lg border border-stone-200 aspect-[4/3]"
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3274.2920489340268!2d-56.11251812329772!3d-34.848888370489014!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f8752433d0ceb%3A0x37ba308e39c3e707!2sCUPRA%20-%20Club%20Seminario!5e0!3m2!1ses!2suy!4v1753653132702!5m2!1ses!2suy"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                  title="Ubicación del Parque CUPRA - Club Seminario"
                />
              </div>

              {/* Info */}
              <div ref={contentRef} className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bordo to-bordo-dark flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-bordo-dark text-lg">
                        Dirección
                      </h3>
                      <p className="text-stone-600 mt-1">Cochabamba 2882</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amarillo to-amarillo-dark flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-bordo-dark text-lg">
                        Infraestructura
                      </h3>
                      <p className="text-stone-600 mt-1 leading-relaxed">
                        Actualmente, el Parque CUPRA cuenta con 2 canchas de
                        rugby (1 iluminada), 5 de fútbol 11 (3 iluminadas) y una
                        cancha de fútbol 8.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-bordo/5 to-amarillo/5 rounded-2xl p-6 border border-bordo/10">
                  <p className="text-bordo-dark/80 leading-relaxed">
                    Estamos mejorando en forma constante el CUPRA para hacerlo
                    un lugar cada vez más cómodo, amigable y completo para
                    nuestros deportistas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
