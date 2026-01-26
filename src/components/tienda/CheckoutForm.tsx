"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Loader2, CreditCard, MapPin, User, ChevronRight } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCartStore, type CartItem } from "@/stores/cartStore";
import { useAuth } from "@/hooks/useAuth";
import { useToastActions } from "@/components/ui/Toast";
import type { MetodoEnvio } from "@/types/tienda";

interface CheckoutFormProps {
  shippingMethods: MetodoEnvio[];
}

interface CheckoutData {
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  codigo_postal: string;
  notas: string;
}

export function CheckoutForm({ shippingMethods }: CheckoutFormProps) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { items, getTotal, clearCart } = useCartStore();
  const { error: showError } = useToastActions();

  const [step, setStep] = useState<"info" | "shipping" | "payment">("info");
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CheckoutData>({
    defaultValues: {
      email: user?.email || "",
      nombre: profile?.nombre || "",
      apellido: profile?.apellido || "",
      telefono: profile?.telefono || "",
      direccion: "",
      ciudad: "",
      departamento: "",
      codigo_postal: "",
      notas: "",
    },
  });

  const subtotal = getTotal();
  const shippingMethod = shippingMethods.find((m) => m.id === selectedShipping);
  const shippingCost = shippingMethod?.precio || 0;
  const total = subtotal + shippingCost;

  const handleInfoSubmit = () => {
    setStep("shipping");
  };

  const handleShippingSubmit = () => {
    if (!selectedShipping) {
      showError("Seleccioná un método de envío");
      return;
    }
    setStep("payment");
  };

  const handlePayment = async (data: CheckoutData) => {
    if (!selectedShipping) {
      showError("Seleccioná un método de envío");
      return;
    }

    setIsProcessing(true);

    try {
      // Create order and get MercadoPago preference
      const response = await fetch("/api/mercadopago/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            email: data.email,
            nombre_completo: `${data.nombre} ${data.apellido}`,
            telefono: data.telefono,
            direccion_envio: data.direccion,
            ciudad: data.ciudad,
            departamento: data.departamento,
            codigo_postal: data.codigo_postal,
            notas: data.notas,
          },
          shipping_method_id: selectedShipping,
          items: items.map((item) => ({
            producto_id: item.productId,
            variante_id: item.variantId !== item.productId ? item.variantId : null,
            cantidad: item.quantity,
            nombre: item.name,
            precio: item.price,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al crear el pedido");
      }

      const { init_point, order_id } = await response.json();

      // Clear cart and redirect to MercadoPago
      clearCart();
      window.location.href = init_point;
    } catch (err) {
      console.error("Checkout error:", err);
      showError(
        err instanceof Error
          ? err.message
          : "Error al procesar el pago. Intentá de nuevo."
      );
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    router.push("/tienda/carrito");
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form */}
      <div className="lg:col-span-2">
        {/* Progress steps */}
        <div className="flex items-center gap-4 mb-8">
          {["info", "shipping", "payment"].map((s, index) => (
            <div key={s} className="flex items-center">
              <button
                onClick={() => {
                  if (s === "info") setStep("info");
                  else if (s === "shipping" && step !== "info") setStep("shipping");
                }}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  step === s
                    ? "bg-bordo text-white"
                    : index < ["info", "shipping", "payment"].indexOf(step)
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-500"
                )}
              >
                {index + 1}
              </button>
              <span
                className={cn(
                  "ml-2 text-sm font-medium hidden sm:block",
                  step === s ? "text-gray-900" : "text-gray-500"
                )}
              >
                {s === "info" && "Datos"}
                {s === "shipping" && "Envío"}
                {s === "payment" && "Pago"}
              </span>
              {index < 2 && (
                <ChevronRight className="w-4 h-4 text-gray-300 mx-2 sm:mx-4" />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(handlePayment)}>
          {/* Step 1: Contact & Address */}
          {step === "info" && (
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <User className="w-5 h-5 text-bordo" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Datos de contacto y envío
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  {...register("email", {
                    required: "El email es requerido",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Email inválido",
                    },
                  })}
                  error={errors.email?.message}
                />

                <Input
                  label="Teléfono"
                  type="tel"
                  {...register("telefono", {
                    required: "El teléfono es requerido",
                  })}
                  error={errors.telefono?.message}
                />

                <Input
                  label="Nombre"
                  {...register("nombre", {
                    required: "El nombre es requerido",
                  })}
                  error={errors.nombre?.message}
                />

                <Input
                  label="Apellido"
                  {...register("apellido", {
                    required: "El apellido es requerido",
                  })}
                  error={errors.apellido?.message}
                />
              </div>

              <div className="flex items-center gap-3 pt-4 pb-2 border-b border-gray-100">
                <MapPin className="w-5 h-5 text-bordo" />
                <h3 className="font-medium text-gray-900">Dirección de envío</h3>
              </div>

              <div className="space-y-4">
                <Input
                  label="Dirección"
                  placeholder="Calle, número, apto"
                  {...register("direccion", {
                    required: "La dirección es requerida",
                  })}
                  error={errors.direccion?.message}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Ciudad"
                    {...register("ciudad", {
                      required: "La ciudad es requerida",
                    })}
                    error={errors.ciudad?.message}
                  />

                  <Input
                    label="Departamento"
                    {...register("departamento", {
                      required: "El departamento es requerido",
                    })}
                    error={errors.departamento?.message}
                  />

                  <Input
                    label="Código postal"
                    {...register("codigo_postal")}
                    error={errors.codigo_postal?.message}
                  />
                </div>

                <Input
                  label="Notas del pedido (opcional)"
                  placeholder="Instrucciones especiales para la entrega..."
                  {...register("notas")}
                />
              </div>

              <div className="pt-4">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleSubmit(handleInfoSubmit)}
                >
                  Continuar al envío
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Shipping method */}
          {step === "shipping" && (
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <MapPin className="w-5 h-5 text-bordo" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Método de envío
                </h2>
              </div>

              <div className="space-y-3">
                {shippingMethods.map((method) => (
                  <label
                    key={method.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                      selectedShipping === method.id
                        ? "border-bordo bg-bordo/5"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value={method.id}
                      checked={selectedShipping === method.id}
                      onChange={() => setSelectedShipping(method.id)}
                      className="w-5 h-5 text-bordo focus:ring-bordo"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{method.nombre}</p>
                      {method.descripcion && (
                        <p className="text-sm text-gray-500">
                          {method.descripcion}
                        </p>
                      )}
                      {method.tiempo_estimado && (
                        <p className="text-sm text-gray-500">
                          {method.tiempo_estimado}
                        </p>
                      )}
                    </div>
                    <span className="font-semibold text-gray-900">
                      {method.precio === 0 ? "Gratis" : formatPrice(method.precio)}
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("info")}
                >
                  Volver
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  onClick={handleShippingSubmit}
                  disabled={!selectedShipping}
                >
                  Continuar al pago
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === "payment" && (
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <CreditCard className="w-5 h-5 text-bordo" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Pago con MercadoPago
                </h2>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                  </svg>
                  <div>
                    <p className="font-medium text-blue-900">
                      Serás redirigido a MercadoPago
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Podrás pagar con tarjeta de crédito, débito o dinero en
                      cuenta. Tu información está protegida.
                    </p>
                  </div>
                </div>
              </div>

              {/* Order summary */}
              <div className="border border-gray-200 rounded-xl divide-y divide-gray-200">
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Resumen del pedido
                  </h3>
                  {items.map((item) => (
                    <div
                      key={item.variantId}
                      className="flex justify-between text-sm py-1"
                    >
                      <span className="text-gray-600">
                        {item.name} x {item.quantity}
                      </span>
                      <span className="text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Envío</span>
                    <span>
                      {shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-bordo">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("shipping")}
                  disabled={isProcessing}
                >
                  Volver
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  isLoading={isProcessing}
                  leftIcon={
                    !isProcessing && <CreditCard className="w-5 h-5" />
                  }
                >
                  {isProcessing ? "Procesando..." : "Pagar con MercadoPago"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Sidebar - Order summary (always visible) */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-28">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tu pedido
          </h2>

          <div className="space-y-3 pb-4 border-b border-gray-100">
            {items.map((item) => (
              <OrderItem key={item.variantId} item={item} />
            ))}
          </div>

          <div className="space-y-2 py-4 border-b border-gray-100">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Envío</span>
              <span>
                {shippingMethod
                  ? shippingMethod.precio === 0
                    ? "Gratis"
                    : formatPrice(shippingMethod.precio)
                  : "-"}
              </span>
            </div>
          </div>

          <div className="flex justify-between py-4 text-lg font-semibold">
            <span>Total</span>
            <span className="text-bordo">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderItem({ item }: { item: CartItem }) {
  return (
    <div className="flex gap-3">
      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <CreditCard className="w-6 h-6" />
          </div>
        )}
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-bordo text-white text-xs flex items-center justify-center">
          {item.quantity}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
        {item.variantName !== "Único" && (
          <p className="text-xs text-gray-500">{item.variantName}</p>
        )}
        <p className="text-sm font-medium text-gray-900 mt-1">
          {formatPrice(item.price * item.quantity)}
        </p>
      </div>
    </div>
  );
}
