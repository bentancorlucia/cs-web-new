"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { CategoriaProducto, ProductFilters as Filters } from "@/types/tienda";

interface ProductFiltersProps {
  categorias: CategoriaProducto[];
  deportes: string[];
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  totalProducts?: number;
}

export function ProductFilters({
  categorias,
  deportes,
  filters,
  onFiltersChange,
  totalProducts,
}: ProductFiltersProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.busqueda || "");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, busqueda: searchValue || undefined });
  };

  const handleClearSearch = () => {
    setSearchValue("");
    onFiltersChange({ ...filters, busqueda: undefined });
  };

  const handleCategoryChange = (slug: string | undefined) => {
    onFiltersChange({ ...filters, categoria: slug });
  };

  const handleDeporteChange = (deporte: string | undefined) => {
    onFiltersChange({ ...filters, deporte });
  };

  const handleSortChange = (ordenar: Filters["ordenar"]) => {
    onFiltersChange({ ...filters, ordenar });
  };

  const handleOfertaToggle = () => {
    onFiltersChange({ ...filters, enOferta: !filters.enOferta });
  };

  const clearAllFilters = () => {
    setSearchValue("");
    onFiltersChange({});
  };

  const hasActiveFilters =
    filters.categoria ||
    filters.deporte ||
    filters.busqueda ||
    filters.enOferta ||
    filters.ordenar;

  const sortOptions: { value: Filters["ordenar"]; label: string }[] = [
    { value: undefined, label: "Más relevantes" },
    { value: "recientes", label: "Más recientes" },
    { value: "precio_asc", label: "Menor precio" },
    { value: "precio_desc", label: "Mayor precio" },
    { value: "nombre", label: "Nombre A-Z" },
  ];

  return (
    <div className="space-y-4">
      {/* Search and mobile filter toggle */}
      <div className="flex gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Input
            type="search"
            placeholder="Buscar productos..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
            rightIcon={
              searchValue ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : undefined
            }
            className="pr-10"
          />
        </form>
        <Button
          variant="outline"
          className="lg:hidden"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          leftIcon={<SlidersHorizontal className="w-5 h-5" />}
        >
          Filtros
        </Button>
      </div>

      {/* Desktop filters */}
      <div className="hidden lg:flex flex-wrap items-center gap-3">
        {/* Categories */}
        <FilterDropdown
          label="Categoría"
          value={filters.categoria}
          options={[
            { value: undefined, label: "Todas" },
            ...categorias.map((c) => ({ value: c.slug, label: c.nombre })),
          ]}
          onChange={handleCategoryChange}
        />

        {/* Sports */}
        {deportes.length > 0 && (
          <FilterDropdown
            label="Deporte"
            value={filters.deporte}
            options={[
              { value: undefined, label: "Todos" },
              ...deportes.map((d) => ({ value: d, label: d })),
            ]}
            onChange={handleDeporteChange}
          />
        )}

        {/* Ofertas toggle */}
        <button
          onClick={handleOfertaToggle}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
            filters.enOferta
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          En oferta
        </button>

        {/* Sort */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-500">Ordenar:</span>
          <FilterDropdown
            value={filters.ordenar}
            options={sortOptions}
            onChange={handleSortChange}
          />
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-bordo hover:text-bordo-dark font-medium"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Mobile filters panel */}
      {mobileFiltersOpen && (
        <div className="lg:hidden bg-white rounded-2xl border border-gray-200 p-4 space-y-4">
          {/* Categories */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Categoría</h4>
            <div className="flex flex-wrap gap-2">
              <FilterChip
                active={!filters.categoria}
                onClick={() => handleCategoryChange(undefined)}
              >
                Todas
              </FilterChip>
              {categorias.map((cat) => (
                <FilterChip
                  key={cat.id}
                  active={filters.categoria === cat.slug}
                  onClick={() => handleCategoryChange(cat.slug)}
                >
                  {cat.nombre}
                </FilterChip>
              ))}
            </div>
          </div>

          {/* Sports */}
          {deportes.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Deporte</h4>
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  active={!filters.deporte}
                  onClick={() => handleDeporteChange(undefined)}
                >
                  Todos
                </FilterChip>
                {deportes.map((dep) => (
                  <FilterChip
                    key={dep}
                    active={filters.deporte === dep}
                    onClick={() => handleDeporteChange(dep)}
                  >
                    {dep}
                  </FilterChip>
                ))}
              </div>
            </div>
          )}

          {/* Ofertas */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Ofertas</h4>
            <FilterChip active={!!filters.enOferta} onClick={handleOfertaToggle}>
              Solo productos en oferta
            </FilterChip>
          </div>

          {/* Sort */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Ordenar por</h4>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((opt) => (
                <FilterChip
                  key={opt.value || "default"}
                  active={filters.ordenar === opt.value}
                  onClick={() => handleSortChange(opt.value)}
                >
                  {opt.label}
                </FilterChip>
              ))}
            </div>
          </div>

          {/* Clear and close */}
          <div className="flex gap-3 pt-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Limpiar filtros
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              className="ml-auto"
              onClick={() => setMobileFiltersOpen(false)}
            >
              Ver {totalProducts} productos
            </Button>
          </div>
        </div>
      )}

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Filtros activos:</span>
          {filters.categoria && (
            <ActiveFilterTag
              label={categorias.find((c) => c.slug === filters.categoria)?.nombre || filters.categoria}
              onRemove={() => handleCategoryChange(undefined)}
            />
          )}
          {filters.deporte && (
            <ActiveFilterTag
              label={filters.deporte}
              onRemove={() => handleDeporteChange(undefined)}
            />
          )}
          {filters.busqueda && (
            <ActiveFilterTag
              label={`"${filters.busqueda}"`}
              onRemove={handleClearSearch}
            />
          )}
          {filters.enOferta && (
            <ActiveFilterTag label="En oferta" onRemove={handleOfertaToggle} />
          )}
        </div>
      )}
    </div>
  );
}

interface FilterDropdownProps<T> {
  label?: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

function FilterDropdown<T extends string | undefined>({
  label,
  value,
  options,
  onChange,
}: FilterDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
          value ? "bg-bordo/10 text-bordo" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        )}
      >
        {label && <span className="text-gray-500">{label}:</span>}
        <span>{selectedOption?.label}</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-2 z-20 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[180px]">
            {options.map((option) => (
              <button
                key={String(option.value) || "default"}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "w-full px-4 py-2 text-left text-sm transition-colors",
                  option.value === value
                    ? "bg-bordo/10 text-bordo font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function FilterChip({ active, onClick, children }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-bordo text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      )}
    >
      {children}
    </button>
  );
}

interface ActiveFilterTagProps {
  label: string;
  onRemove: () => void;
}

function ActiveFilterTag({ label, onRemove }: ActiveFilterTagProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm bg-bordo/10 text-bordo">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-bordo/20 rounded-full p-0.5"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
