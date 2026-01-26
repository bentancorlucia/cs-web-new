import Link from "next/link";
import { CheckCircle, XCircle, Clock, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ResultadoPageProps {
  searchParams: Promise<{
    status?: string;
    order?: string;
  }>;
}

export default async function ResultadoPage({ searchParams }: ResultadoPageProps) {
  const params = await searchParams;
  const status = params.status || "pending";
  const orderNumber = params.order;

  const statusConfig = {
    success: {
      icon: CheckCircle,
      title: "Pago exitoso",
      description: "Tu pedido ha sido confirmado y lo estamos preparando.",
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    failure: {
      icon: XCircle,
      title: "Pago no procesado",
      description:
        "Hubo un problema con el pago. Por favor, intentá nuevamente.",
      color: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    pending: {
      icon: Clock,
      title: "Pago pendiente",
      description:
        "Tu pago está siendo procesado. Te notificaremos cuando se confirme.",
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <section className="pt-28 pb-12 md:pt-32 md:pb-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-lg mx-auto text-center">
          {/* Status icon */}
          <div
            className={`w-20 h-20 rounded-full ${config.bgColor} flex items-center justify-center mx-auto mb-6`}
          >
            <Icon className={`w-10 h-10 ${config.color}`} />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {config.title}
          </h1>

          {/* Description */}
          <p className="text-gray-600 text-lg mb-6">{config.description}</p>

          {/* Order number */}
          {orderNumber && (
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${config.borderColor} ${config.bgColor} mb-8`}
            >
              <ShoppingBag className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Pedido: <span className="text-gray-900">{orderNumber}</span>
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {status === "success" && (
              <>
                <Link href="/mi-cuenta/pedidos">
                  <Button variant="primary" size="lg" className="w-full">
                    Ver mis pedidos
                  </Button>
                </Link>
                <Link href="/tienda">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Seguir comprando
                  </Button>
                </Link>
              </>
            )}

            {status === "failure" && (
              <>
                <Link href="/tienda/checkout">
                  <Button variant="primary" size="lg" className="w-full">
                    Reintentar pago
                  </Button>
                </Link>
                <Link href="/tienda/carrito">
                  <Button variant="outline" size="lg" className="w-full">
                    Volver al carrito
                  </Button>
                </Link>
              </>
            )}

            {status === "pending" && (
              <>
                <Link href="/mi-cuenta/pedidos">
                  <Button variant="primary" size="lg" className="w-full">
                    Ver estado del pedido
                  </Button>
                </Link>
                <Link href="/tienda">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Seguir comprando
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Help text */}
          <p className="mt-8 text-sm text-gray-500">
            ¿Tenés alguna consulta?{" "}
            <Link href="/contacto" className="text-bordo hover:text-bordo-dark">
              Contactanos
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
