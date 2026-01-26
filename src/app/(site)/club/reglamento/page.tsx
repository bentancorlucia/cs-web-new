"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function ReglamentoPage() {
  const docRef = useScrollReveal<HTMLDivElement>({
    animation: "fade-up",
    delay: 100,
  });

  return (
    <>
      <PageHeader
        title="Reglamento"
        backgroundImage="/foto-reglamento.webp"
        breadcrumbs={[
          { label: "Club", href: "/club/directiva" },
          { label: "Reglamento" },
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
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Reglamento del Club Seminario
                    </h2>
                    <p className="text-white/70 text-sm mt-1">
                      Normas y disposiciones internas
                    </p>
                  </div>
                </div>
              </div>

              {/* Document viewer */}
              <div className="aspect-[3/4] md:aspect-[4/5]">
                <iframe
                  src="https://drive.google.com/file/d/1XYVh9UXBevu2XZ_t0PUGdKSoz1W5iRfV/preview"
                  width="100%"
                  height="100%"
                  allow="autoplay"
                  className="border-0"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
