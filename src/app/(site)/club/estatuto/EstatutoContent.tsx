"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function EstatutoContent() {
  const docRef = useScrollReveal<HTMLDivElement>({
    animation: "fade-up",
    delay: 100,
  });

  return (
    <>
      <PageHeader
        title="Estatuto"
        backgroundImage="/foto-estatuto.webp"
        breadcrumbs={[
          { label: "Club", href: "/club/directiva" },
          { label: "Estatuto" },
        ]}
        overlay="medium"
      />

      <main className="py-16 lg:py-24 bg-gradient-to-b from-white via-stone-50/30 to-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div
              ref={docRef}
              className="bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-bordo to-bordo-dark p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Estatuto del Club Seminario
                    </h2>
                    <p className="text-white/70 text-sm mt-1">
                      Documento oficial de la institución
                    </p>
                  </div>
                </div>
              </div>

              {/* Document viewer */}
              <div className="aspect-[3/4] md:aspect-[4/5]">
                <iframe
                  src="https://drive.google.com/file/d/11o9p6_Qh26rWfMlSus2A2RbJJQoRQihC/preview"
                  width="100%"
                  height="100%"
                  allow="autoplay"
                  className="border-0"
                  title="Estatuto del Club Seminario"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
