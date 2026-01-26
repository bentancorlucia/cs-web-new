"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Check,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { VariantSelector, QuantitySelector } from "@/components/tienda";
import { useCartStore } from "@/stores/cartStore";
import { useToastActions } from "@/components/ui/Toast";
import type { ProductoCompleto, VarianteProducto } from "@/types/tienda";

interface ProductDetailProps {
  product: ProductoCompleto;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { success } = useToastActions();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedTalla, setSelectedTalla] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Get unique tallas and colores from variants
  const availableTallas = useMemo(() => {
    if (product.variantes.length === 0) return product.tallas;
    return [...new Set(product.variantes.map((v) => v.talla).filter(Boolean))] as string[];
  }, [product.variantes, product.tallas]);

  const availableColores = useMemo(() => {
    if (product.variantes.length === 0) return product.colores;
    return [...new Set(product.variantes.map((v) => v.color).filter(Boolean))] as string[];
  }, [product.variantes, product.colores]);

  // Find the selected variant
  const selectedVariant = useMemo<VarianteProducto | null>(() => {
    if (product.variantes.length === 0) return null;

    return (
      product.variantes.find(
        (v) =>
          (selectedTalla === null || v.talla === selectedTalla) &&
          (selectedColor === null || v.color === selectedColor)
      ) || null
    );
  }, [product.variantes, selectedTalla, selectedColor]);

  // Calculate price
  const hasDiscount = product.precio_oferta && product.precio_oferta < product.precio;
  const basePrice = hasDiscount ? product.precio_oferta! : product.precio;
  const additionalPrice = selectedVariant?.precio_adicional || 0;
  const finalPrice = basePrice + additionalPrice;

  // Check stock
  const stock = selectedVariant?.stock ?? product.stock;
  const isOutOfStock = stock <= 0;

  // Check if selection is complete
  const needsTalla = availableTallas.length > 0;
  const needsColor = availableColores.length > 0;
  const selectionComplete =
    (!needsTalla || selectedTalla !== null) &&
    (!needsColor || selectedColor !== null);

  // All images
  const images = [
    product.imagen_principal,
    ...product.imagenes.filter((img) => img !== product.imagen_principal),
  ].filter(Boolean) as string[];

  const handleAddToCart = () => {
    if (isOutOfStock || !selectionComplete) return;

    const variantName =
      [selectedTalla, selectedColor].filter(Boolean).join(" - ") || "Único";

    addItem({
      id: `${product.id}-${selectedVariant?.id || "default"}`,
      productId: product.id,
      variantId: selectedVariant?.id || product.id,
      name: product.nombre,
      variantName,
      price: finalPrice,
      image: images[0],
      maxStock: stock,
    });

    success(`${product.nombre} agregado al carrito`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.nombre,
        text: product.descripcion_corta || "",
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      success("Link copiado al portapapeles");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Image gallery */}
      <div className="space-y-4">
        {/* Main image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
          {images[selectedImageIndex] ? (
            <Image
              src={images[selectedImageIndex]}
              alt={product.nombre}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="w-20 h-20 text-gray-300" />
            </div>
          )}

          {/* Discount badge */}
          {hasDiscount && (
            <span className="absolute top-4 left-4 inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-red-500 text-white">
              -
              {Math.round(
                ((product.precio - product.precio_oferta!) / product.precio) *
                  100
              )}
              %
            </span>
          )}

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setSelectedImageIndex((i) =>
                    i === 0 ? images.length - 1 : i - 1
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  setSelectedImageIndex((i) =>
                    i === images.length - 1 ? 0 : i + 1
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={cn(
                  "relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 transition-all",
                  selectedImageIndex === index
                    ? "ring-2 ring-bordo ring-offset-2"
                    : "opacity-70 hover:opacity-100"
                )}
              >
                <Image
                  src={image}
                  alt={`${product.nombre} - Imagen ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/tienda" className="text-gray-500 hover:text-bordo">
            Tienda
          </Link>
          <span className="text-gray-300">/</span>
          {product.categoria && (
            <>
              <Link
                href={`/tienda?categoria=${product.categoria.slug}`}
                className="text-gray-500 hover:text-bordo"
              >
                {product.categoria.nombre}
              </Link>
              <span className="text-gray-300">/</span>
            </>
          )}
          <span className="text-gray-900 font-medium truncate">
            {product.nombre}
          </span>
        </nav>

        {/* Sport tag */}
        {product.deporte && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-bordo/10 text-bordo">
            {product.deporte}
          </span>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          {product.nombre}
        </h1>

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className={cn(
            "text-3xl font-bold",
            hasDiscount ? "text-red-600" : "text-gray-900"
          )}>
            {formatPrice(finalPrice)}
          </span>
          {hasDiscount && (
            <span className="text-xl text-gray-400 line-through">
              {formatPrice(product.precio + additionalPrice)}
            </span>
          )}
        </div>

        {/* Short description */}
        {product.descripcion_corta && (
          <p className="text-gray-600 text-lg">{product.descripcion_corta}</p>
        )}

        {/* Variant selector */}
        {(availableTallas.length > 0 || availableColores.length > 0) && (
          <VariantSelector
            variants={product.variantes}
            selectedVariant={selectedVariant}
            onSelect={() => {}}
            availableTallas={availableTallas}
            availableColores={availableColores}
            selectedTalla={selectedTalla}
            selectedColor={selectedColor}
            onTallaChange={setSelectedTalla}
            onColorChange={setSelectedColor}
          />
        )}

        {/* Quantity and add to cart */}
        <div className="space-y-4">
          {/* Stock status */}
          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <span className="text-red-600 font-medium">Sin stock</span>
            ) : stock <= 5 ? (
              <span className="text-amber-600 font-medium">
                Solo quedan {stock} unidades
              </span>
            ) : (
              <span className="text-green-600 font-medium flex items-center gap-1">
                <Check className="w-4 h-4" />
                En stock
              </span>
            )}
          </div>

          {/* Quantity selector */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Cantidad:</span>
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                max={stock}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={isOutOfStock || !selectionComplete}
              leftIcon={<ShoppingCart className="w-5 h-5" />}
            >
              {isOutOfStock
                ? "Agotado"
                : !selectionComplete
                ? "Selecciona opciones"
                : "Agregar al carrito"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleShare}
              aria-label="Compartir producto"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Truck className="w-5 h-5 text-bordo" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Envío a todo el país</p>
              <p>Calculá en el checkout</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-bordo" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Compra segura</p>
              <p>Pago con MercadoPago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-bordo" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Cambios</p>
              <p>En 30 días</p>
            </div>
          </div>
        </div>

        {/* Full description */}
        {product.descripcion && (
          <div className="pt-6 border-t border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Descripción
            </h2>
            <div
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: product.descripcion }}
            />
          </div>
        )}

        {/* SKU */}
        {product.sku && (
          <p className="text-sm text-gray-400">SKU: {product.sku}</p>
        )}
      </div>
    </div>
  );
}
