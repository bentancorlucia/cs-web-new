"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductGrid, ProductFilters } from "@/components/tienda";
import type { Producto, CategoriaProducto, ProductFilters as Filters } from "@/types/tienda";

interface TiendaContentProps {
  initialProducts: Producto[];
  categorias: CategoriaProducto[];
  deportes: string[];
  initialFilters: Filters;
}

export function TiendaContent({
  initialProducts,
  categorias,
  deportes,
  initialFilters,
}: TiendaContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [products] = useState<Producto[]>(initialProducts);

  const handleFiltersChange = useCallback(
    (newFilters: Filters) => {
      setFilters(newFilters);

      // Build URL search params
      const params = new URLSearchParams();

      if (newFilters.categoria) {
        params.set("categoria", newFilters.categoria);
      }
      if (newFilters.deporte) {
        params.set("deporte", newFilters.deporte);
      }
      if (newFilters.busqueda) {
        params.set("busqueda", newFilters.busqueda);
      }
      if (newFilters.ordenar) {
        params.set("ordenar", newFilters.ordenar);
      }
      if (newFilters.enOferta) {
        params.set("oferta", "true");
      }

      // Update URL (this will trigger a server refetch)
      startTransition(() => {
        const newUrl = params.toString()
          ? `/tienda?${params.toString()}`
          : "/tienda";
        router.push(newUrl, { scroll: false });
      });
    },
    [router]
  );

  return (
    <div className="space-y-8">
      {/* Filters */}
      <ProductFilters
        categorias={categorias}
        deportes={deportes}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        totalProducts={products.length}
      />

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Buscando...
            </span>
          ) : (
            <>
              <span className="font-medium text-gray-900">{products.length}</span>{" "}
              {products.length === 1 ? "producto encontrado" : "productos encontrados"}
            </>
          )}
        </p>
      </div>

      {/* Products grid */}
      <ProductGrid
        products={products}
        loading={isPending}
        emptyMessage={
          filters.busqueda
            ? `No se encontraron productos para "${filters.busqueda}"`
            : "No hay productos disponibles en esta categoría"
        }
      />
    </div>
  );
}
