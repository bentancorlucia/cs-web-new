"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Trash2, ArrowLeft, ShoppingCart } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { QuantitySelector } from "@/components/tienda";
import { useCartStore } from "@/stores/cartStore";

export function CartContent() {
  const { items, removeItem, updateQuantity, clearCart, getTotal } =
    useCartStore();

  const total = getTotal();
  const isEmpty = items.length === 0;

  if (isEmpty) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-12 h-12 text-gray-300" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Tu carrito está vacío
        </h1>
        <p className="text-gray-500 mb-8">
          Explorá nuestra tienda y encontrá productos increíbles del club
        </p>
        <Link href="/tienda">
          <Button variant="primary" leftIcon={<ArrowLeft className="w-5 h-5" />}>
            Ir a la tienda
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tu carrito</h1>
          <p className="text-gray-500 mt-1">
            {items.length} {items.length === 1 ? "producto" : "productos"}
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="bg-white rounded-2xl p-4 md:p-6 shadow-sm flex gap-4 md:gap-6"
            >
              {/* Image */}
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="w-10 h-10 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {item.name}
                    </h3>
                    {item.variantName !== "Único" && (
                      <p className="text-gray-500 mt-0.5">{item.variantName}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    aria-label="Eliminar producto"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(qty) => updateQuantity(item.variantId, qty)}
                      max={item.maxStock}
                      size="sm"
                    />
                    {item.maxStock <= 5 && (
                      <span className="text-xs text-amber-600">
                        Quedan {item.maxStock}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.price)} c/u
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Continue shopping */}
          <div className="pt-4">
            <Link
              href="/tienda"
              className="inline-flex items-center gap-2 text-bordo hover:text-bordo-dark font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Seguir comprando
            </Link>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-28">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Resumen del pedido
            </h2>

            <div className="space-y-3 pb-4 border-b border-gray-100">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span className="text-sm">Calculado en checkout</span>
              </div>
            </div>

            <div className="flex justify-between py-4 text-lg font-semibold">
              <span>Total</span>
              <span className="text-bordo">{formatPrice(total)}</span>
            </div>

            <Link href="/tienda/checkout">
              <Button variant="primary" size="lg" className="w-full">
                Finalizar compra
              </Button>
            </Link>

            {/* Trust badges */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span>Compra segura con MercadoPago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
