"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/stores/cartStore";
import type { Producto } from "@/types/tienda";

interface ProductCardProps {
  product: Producto;
  showQuickAdd?: boolean;
}

export function ProductCard({ product, showQuickAdd = true }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const hasDiscount = product.precio_oferta && product.precio_oferta < product.precio;
  const discountPercentage = hasDiscount
    ? Math.round(((product.precio - product.precio_oferta!) / product.precio) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;
  const hasVariants = product.tallas.length > 0 || product.colores.length > 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock || hasVariants) return;

    addItem({
      id: product.id,
      productId: product.id,
      variantId: product.id,
      name: product.nombre,
      variantName: "Único",
      price: hasDiscount ? product.precio_oferta! : product.precio,
      image: product.imagen_principal || product.imagenes[0],
      maxStock: product.stock,
    });
  };

  return (
    <Link
      href={`/tienda/productos/${product.slug}`}
      className="group block"
    >
      <article className="relative bg-white rounded-2xl overflow-hidden shadow-lg shadow-black/5 transition-all duration-300 hover:shadow-xl hover:shadow-bordo/10 hover:-translate-y-1">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {hasDiscount && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500 text-white">
              -{discountPercentage}%
            </span>
          )}
          {product.destacado && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amarillo text-bordo-dark">
              Destacado
            </span>
          )}
          {isOutOfStock && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-500 text-white">
              Agotado
            </span>
          )}
        </div>

        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={product.imagen_principal || product.imagenes[0] || "/placeholder-product.jpg"}
            alt={product.nombre}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={cn(
              "object-cover transition-transform duration-500 group-hover:scale-105",
              isOutOfStock && "opacity-60"
            )}
          />

          {/* Quick add button overlay */}
          {showQuickAdd && !isOutOfStock && !hasVariants && (
            <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={handleQuickAdd}
                leftIcon={<ShoppingCart className="w-4 h-4" />}
              >
                Agregar
              </Button>
            </div>
          )}

          {/* Overlay for variants message */}
          {showQuickAdd && !isOutOfStock && hasVariants && (
            <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg py-2 px-3 text-center text-sm font-medium text-gray-700">
                Ver opciones
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category/Sport */}
          {product.deporte && (
            <p className="text-xs font-medium text-bordo/70 uppercase tracking-wide mb-1">
              {product.deporte}
            </p>
          )}

          {/* Name */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-bordo transition-colors">
            {product.nombre}
          </h3>

          {/* Short description */}
          {product.descripcion_corta && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-1">
              {product.descripcion_corta}
            </p>
          )}

          {/* Price */}
          <div className="mt-3 flex items-center gap-2">
            <span className={cn(
              "font-bold text-lg",
              hasDiscount ? "text-red-600" : "text-gray-900"
            )}>
              {formatPrice(hasDiscount ? product.precio_oferta! : product.precio)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.precio)}
              </span>
            )}
          </div>

          {/* Variants preview */}
          {(product.colores.length > 0 || product.tallas.length > 0) && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              {product.colores.length > 0 && (
                <span>{product.colores.length} colores</span>
              )}
              {product.colores.length > 0 && product.tallas.length > 0 && (
                <span className="text-gray-300">|</span>
              )}
              {product.tallas.length > 0 && (
                <span>{product.tallas.length} tallas</span>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
