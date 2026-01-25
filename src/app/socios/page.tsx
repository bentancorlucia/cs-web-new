"use client";

import { PageHeader } from "@/components/layout";
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const membershipPlans = [
  {
    name: "Individual",
    price: "1.500",
    period: "/mes",
    description: "Ideal para quienes quieren disfrutar del club por su cuenta.",
    features: [
      "Acceso a todas las instalaciones",
      "Uso de gimnasio y piscina",
      "Participación en actividades deportivas",
      "10% descuento en tienda oficial",
    ],
    featured: false,
  },
  {
    name: "Familiar",
    price: "3.200",
    period: "/mes",
    description: "Para toda la familia. Incluye hasta 4 integrantes.",
    features: [
      "Todo lo del plan Individual",
      "Hasta 4 miembros del grupo familiar",
      "Acceso a actividades infantiles",
      "15% descuento en tienda oficial",
      "Prioridad en eventos sociales",
    ],
    featured: true,
  },
  {
    name: "Jubilado",
    price: "900",
    period: "/mes",
    description: "Tarifa especial para mayores de 65 años.",
    features: [
      "Acceso a todas las instalaciones",
      "Actividades recreativas especiales",
      "10% descuento en tienda oficial",
    ],
    featured: false,
  },
];

export default function SociosPage() {
  const introRef = useScrollReveal<HTMLDivElement>({ animation: "fade-up" });
  const plansRef = useScrollReveal<HTMLDivElement>({ animation: "fade-up", delay: 200 });

  return (
    <>
      <PageHeader
        title="Hacete Socio"
        subtitle="Membresías"
        description="Descubrí los beneficios de ser parte de la familia seminariense. Elegí el plan que mejor se adapte a vos."
        breadcrumbs={[{ label: "Socios" }]}
        size="lg"
      />

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div ref={introRef} className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Elegí tu plan ideal
            </h2>
            <p className="text-lg text-gray-600">
              Todos nuestros planes incluyen acceso completo a las instalaciones del club.
              Sin matrícula de ingreso durante este mes.
            </p>
          </div>

          <div ref={plansRef} className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {membershipPlans.map((plan) => (
              <Card
                key={plan.name}
                variant={plan.featured ? "elevated" : "outlined"}
                hover
                className={plan.featured ? "ring-2 ring-bordo relative" : ""}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-bordo to-bordo-dark text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                      Más popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold text-bordo">${plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-6">
                  <Button
                    variant={plan.featured ? "primary" : "outline"}
                    className="w-full"
                  >
                    Elegir plan
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Tenés dudas?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Nuestro equipo está disponible para ayudarte a elegir el mejor plan
              y resolver todas tus consultas.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="primary" size="lg">
                Contactanos
              </Button>
              <Button variant="ghost" size="lg">
                Ver preguntas frecuentes
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
