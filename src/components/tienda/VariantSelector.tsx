"use client";

import { cn } from "@/lib/utils";
import type { VarianteProducto } from "@/types/tienda";

interface VariantSelectorProps {
  variants: VarianteProducto[];
  selectedVariant: VarianteProducto | null;
  onSelect: (variant: VarianteProducto) => void;
  availableTallas: string[];
  availableColores: string[];
  selectedTalla: string | null;
  selectedColor: string | null;
  onTallaChange: (talla: string) => void;
  onColorChange: (color: string) => void;
}

export function VariantSelector({
  variants,
  availableTallas,
  availableColores,
  selectedTalla,
  selectedColor,
  onTallaChange,
  onColorChange,
}: VariantSelectorProps) {
  // Check if a combination is available
  const isVariantAvailable = (talla: string | null, color: string | null) => {
    return variants.some(
      (v) =>
        (talla === null || v.talla === talla) &&
        (color === null || v.color === color) &&
        v.stock > 0
    );
  };

  // Check stock for specific talla
  const getTallaStock = (talla: string) => {
    if (!selectedColor) {
      return variants
        .filter((v) => v.talla === talla)
        .reduce((sum, v) => sum + v.stock, 0);
    }
    const variant = variants.find(
      (v) => v.talla === talla && v.color === selectedColor
    );
    return variant?.stock || 0;
  };

  // Check stock for specific color
  const getColorStock = (color: string) => {
    if (!selectedTalla) {
      return variants
        .filter((v) => v.color === color)
        .reduce((sum, v) => sum + v.stock, 0);
    }
    const variant = variants.find(
      (v) => v.color === color && v.talla === selectedTalla
    );
    return variant?.stock || 0;
  };

  // Common color mapping for visual display
  const colorMap: Record<string, string> = {
    negro: "#000000",
    blanco: "#FFFFFF",
    rojo: "#DC2626",
    azul: "#2563EB",
    verde: "#16A34A",
    amarillo: "#EAB308",
    naranja: "#EA580C",
    rosa: "#EC4899",
    morado: "#9333EA",
    gris: "#6B7280",
    bordo: "#730d32",
    dorado: "#f7b643",
  };

  const getColorValue = (colorName: string) => {
    return colorMap[colorName.toLowerCase()] || "#E5E7EB";
  };

  return (
    <div className="space-y-6">
      {/* Talla selector */}
      {availableTallas.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-900">
              Talla
              {selectedTalla && (
                <span className="ml-2 font-normal text-gray-500">
                  {selectedTalla}
                </span>
              )}
            </label>
            <button
              type="button"
              className="text-xs text-bordo hover:text-bordo-dark font-medium"
            >
              Guía de tallas
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableTallas.map((talla) => {
              const stock = getTallaStock(talla);
              const isAvailable = stock > 0;
              const isSelected = selectedTalla === talla;

              return (
                <button
                  key={talla}
                  type="button"
                  onClick={() => isAvailable && onTallaChange(talla)}
                  disabled={!isAvailable}
                  className={cn(
                    "min-w-[48px] h-12 px-4 rounded-xl text-sm font-medium transition-all",
                    isSelected
                      ? "bg-bordo text-white ring-2 ring-bordo ring-offset-2"
                      : isAvailable
                      ? "bg-gray-100 text-gray-900 hover:bg-gray-200 hover:ring-2 hover:ring-gray-300"
                      : "bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                  )}
                >
                  {talla}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Color selector */}
      {availableColores.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Color
            {selectedColor && (
              <span className="ml-2 font-normal text-gray-500 capitalize">
                {selectedColor}
              </span>
            )}
          </label>
          <div className="flex flex-wrap gap-3">
            {availableColores.map((color) => {
              const stock = getColorStock(color);
              const isAvailable = stock > 0;
              const isSelected = selectedColor === color;
              const colorValue = getColorValue(color);
              const isLight = ["blanco", "amarillo", "dorado"].includes(
                color.toLowerCase()
              );

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => isAvailable && onColorChange(color)}
                  disabled={!isAvailable}
                  title={color}
                  className={cn(
                    "relative w-10 h-10 rounded-full transition-all",
                    isSelected && "ring-2 ring-offset-2 ring-bordo",
                    !isAvailable && "opacity-40 cursor-not-allowed"
                  )}
                  style={{ backgroundColor: colorValue }}
                >
                  {/* Border for light colors */}
                  {isLight && (
                    <span className="absolute inset-0 rounded-full border border-gray-300" />
                  )}

                  {/* Check mark for selected */}
                  {isSelected && (
                    <span
                      className={cn(
                        "absolute inset-0 flex items-center justify-center",
                        isLight ? "text-gray-900" : "text-white"
                      )}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                  )}

                  {/* Strikethrough for unavailable */}
                  {!isAvailable && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-full h-0.5 bg-gray-400 rotate-45" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Simpler variant for quick selection without talla/color breakdown
interface SimpleVariantSelectorProps {
  variants: VarianteProducto[];
  selectedVariant: VarianteProducto | null;
  onSelect: (variant: VarianteProducto) => void;
}

export function SimpleVariantSelector({
  variants,
  selectedVariant,
  onSelect,
}: SimpleVariantSelectorProps) {
  const getVariantLabel = (variant: VarianteProducto) => {
    const parts = [];
    if (variant.talla) parts.push(variant.talla);
    if (variant.color) parts.push(variant.color);
    return parts.join(" - ") || "Estándar";
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900">
        Variante
      </label>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isAvailable = variant.stock > 0;
          const isSelected = selectedVariant?.id === variant.id;

          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => isAvailable && onSelect(variant)}
              disabled={!isAvailable}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                isSelected
                  ? "bg-bordo text-white ring-2 ring-bordo ring-offset-2"
                  : isAvailable
                  ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  : "bg-gray-50 text-gray-300 cursor-not-allowed line-through"
              )}
            >
              {getVariantLabel(variant)}
              {variant.precio_adicional > 0 && (
                <span className="ml-1 text-xs opacity-75">
                  (+${variant.precio_adicional})
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
