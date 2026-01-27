"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/stores/cartStore";

export function CartDrawer() {
  const [hasMounted, setHasMounted] = useState(false);
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getTotal,
    getItemCount,
  } = useCartStore();

  // Ensure hydration safety - only render cart content after mount
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeCart();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeCart]);

  const itemCount = hasMounted ? getItemCount() : 0;
  const total = hasMounted ? getTotal() : 0;
  const cartItems = hasMounted ? items : [];

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50",
          "transform transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 text-bordo" />
              <h2 className="text-lg font-semibold text-gray-900">
                Tu carrito
              </h2>
              {itemCount > 0 && (
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-bordo text-white text-xs font-medium">
                  {itemCount}
                </span>
              )}
            </div>
            <button
              onClick={closeCart}
              className="p-2 -mr-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-500 text-center mb-6">
                Tu carrito está vacío
              </p>
              <Button variant="outline" onClick={closeCart}>
                Seguir comprando
              </Button>
            </div>
          ) : (
            <>
              {/* Items list */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <ul className="space-y-4">
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.variantId}
                      item={item}
                      onRemove={() => removeItem(item.variantId)}
                      onUpdateQuantity={(qty) =>
                        updateQuantity(item.variantId, qty)
                      }
                    />
                  ))}
                </ul>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 px-6 py-4 space-y-4 bg-gray-50">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatPrice(total)}
                  </span>
                </div>

                {/* Info */}
                <p className="text-xs text-gray-500">
                  Envío calculado en el checkout
                </p>

                {/* Actions */}
                <div className="space-y-2">
                  <Link href="/tienda/checkout" onClick={closeCart}>
                    <Button variant="primary" className="w-full">
                      Finalizar compra
                    </Button>
                  </Link>
                  <Link href="/tienda/carrito" onClick={closeCart}>
                    <Button variant="outline" className="w-full">
                      Ver carrito
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

interface CartItemProps {
  item: {
    id: string;
    productId: string;
    variantId: string;
    name: string;
    variantName: string;
    price: number;
    quantity: number;
    image?: string;
    maxStock: number;
  };
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}

function CartItem({ item, onRemove, onUpdateQuantity }: CartItemProps) {
  const canDecrease = item.quantity > 1;
  const canIncrease = item.quantity < item.maxStock;

  return (
    <li className="flex gap-4 bg-white rounded-xl p-3 shadow-sm">
      {/* Image */}
      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-gray-300" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
        {item.variantName !== "Único" && (
          <p className="text-sm text-gray-500">{item.variantName}</p>
        )}
        <p className="mt-1 font-semibold text-bordo">
          {formatPrice(item.price)}
        </p>

        {/* Quantity controls */}
        <div className="mt-2 flex items-center gap-2">
          <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => canDecrease && onUpdateQuantity(item.quantity - 1)}
              disabled={!canDecrease}
              className={cn(
                "w-8 h-8 flex items-center justify-center transition-colors",
                canDecrease
                  ? "text-gray-700 hover:bg-gray-100"
                  : "text-gray-300 cursor-not-allowed"
              )}
              aria-label="Disminuir cantidad"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => canIncrease && onUpdateQuantity(item.quantity + 1)}
              disabled={!canIncrease}
              className={cn(
                "w-8 h-8 flex items-center justify-center transition-colors",
                canIncrease
                  ? "text-gray-700 hover:bg-gray-100"
                  : "text-gray-300 cursor-not-allowed"
              )}
              aria-label="Aumentar cantidad"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={onRemove}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Eliminar producto"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Line total */}
      <div className="text-right">
        <p className="font-semibold text-gray-900">
          {formatPrice(item.price * item.quantity)}
        </p>
      </div>
    </li>
  );
}

// Cart icon button for header
export function CartButton({ className }: { className?: string }) {
  const [hasMounted, setHasMounted] = useState(false);
  const { openCart, getItemCount } = useCartStore();
  const itemCount = hasMounted ? getItemCount() : 0;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <button
      onClick={openCart}
      className={cn(
        "relative p-2 rounded-lg transition-colors hover:bg-white/10",
        className
      )}
      aria-label={`Carrito de compras, ${itemCount} productos`}
    >
      <ShoppingBag className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amarillo text-bordo-dark text-xs font-medium">
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
    </button>
  );
}
