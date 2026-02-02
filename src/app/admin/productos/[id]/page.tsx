"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { AdminHeader, ImageUpload } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { CategoriaProducto, ProductoCompleto } from "@/types/tienda";

interface ProductForm {
  nombre: string;
  descripcion: string;
  descripcion_corta: string;
  precio: number;
  precio_oferta: number | null;
  categoria_id: string;
  stock: number;
  sku: string;
  imagen_principal: string;
  imagenes: string[];
  activo: boolean;
  destacado: boolean;
  deporte: string;
  tallas: string[];
  colores: string[];
}

const availableTallas = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const availableDeportes = [
  "Básquetbol",
  "Fútbol",
  "Handball",
  "Hockey",
  "Rugby",
  "Volleyball",
  "Corredores",
  "General",
];

export default function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [form, setForm] = useState<ProductForm | null>(null);
  const [categories, setCategories] = useState<CategoriaProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductForm, string>>>({});
  const [coloresText, setColoresText] = useState("");

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      // Fetch product
      const { data: product } = await supabase
        .from("productos")
        .select("*")
        .eq("id", id)
        .single();

      if (product) {
        const colores = product.colores ?? [];
        setForm({
          nombre: product.nombre,
          descripcion: product.descripcion ?? "",
          descripcion_corta: product.descripcion_corta ?? "",
          precio: product.precio,
          precio_oferta: product.precio_oferta,
          categoria_id: product.categoria_id ?? "",
          stock: product.stock ?? 0,
          sku: product.sku,
          imagen_principal: product.imagen_principal ?? "",
          imagenes: product.imagenes ?? [],
          activo: product.activo,
          destacado: product.destacado,
          deporte: product.deporte ?? "",
          tallas: product.tallas ?? [],
          colores,
        });
        setColoresText(colores.join(", "));
      }

      // Fetch categories
      const { data: cats } = await supabase
        .from("categorias_producto")
        .select("*")
        .eq("activa", true)
        .order("orden");

      setCategories(cats ?? []);
      setLoading(false);
    }

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    // Validation
    const newErrors: typeof errors = {};
    if (!form.nombre) newErrors.nombre = "El nombre es requerido";
    if (!form.precio || form.precio <= 0) newErrors.precio = "El precio debe ser mayor a 0";
    if (!form.sku) newErrors.sku = "El SKU es requerido";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);

    try {
      const slug = form.nombre
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const response = await fetch(`/api/productos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          slug,
          categoria_id: form.categoria_id || null,
          precio_oferta: form.precio_oferta || null,
          deporte: form.deporte || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al actualizar producto");
      }

      router.push("/admin/productos");
    } catch (error) {
      console.error("Error updating product:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleTalla = (talla: string) => {
    if (!form) return;
    setForm({
      ...form,
      tallas: form.tallas.includes(talla)
        ? form.tallas.filter((t) => t !== talla)
        : [...form.tallas, talla],
    });
  };

  if (loading || !form) {
    return (
      <div className="min-h-screen">
        <AdminHeader title="Cargando..." />
        <div className="px-5 md:px-8 py-6 md:py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} padding="lg">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/4" />
                  <div className="h-10 bg-gray-200 rounded" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Editar Producto"
        subtitle={form.nombre}
      />

      <form onSubmit={handleSubmit} className="px-5 md:px-8 py-6 md:py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Basic Info */}
          <Card padding="lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Información Básica
            </h2>
            <div className="space-y-6">
              <Input
                label="Nombre del producto"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                error={errors.nombre}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="SKU"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  error={errors.sku}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={form.categoria_id}
                    onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
                    className={cn(
                      "w-full rounded-xl border-2 bg-white px-4 py-3",
                      "border-gray-200 hover:border-gray-300",
                      "focus:border-bordo focus:ring-4 focus:ring-bordo/10 focus:outline-none",
                      "transition-all duration-200"
                    )}
                  >
                    <option value="">Sin categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Textarea
                label="Descripción corta"
                value={form.descripcion_corta}
                onChange={(e) => setForm({ ...form, descripcion_corta: e.target.value })}
                size="sm"
              />

              <Textarea
                label="Descripción completa"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              />
            </div>
          </Card>

          {/* Pricing */}
          <Card padding="lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Precios y Stock
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Precio"
                type="number"
                min={0}
                step={1}
                value={form.precio || ""}
                onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })}
                error={errors.precio}
                leftIcon={<span className="text-gray-400">$</span>}
              />
              <Input
                label="Precio de oferta"
                type="number"
                min={0}
                step={1}
                value={form.precio_oferta ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    precio_oferta: e.target.value ? Number(e.target.value) : null,
                  })
                }
                leftIcon={<span className="text-gray-400">$</span>}
                hint="Dejar vacío si no hay oferta"
              />
              <Input
                label="Stock disponible"
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  setForm({ ...form, stock: isNaN(value) ? 0 : value });
                }}
              />
            </div>
          </Card>

          {/* Variants */}
          <Card padding="lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Variantes
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deporte
                </label>
                <select
                  value={form.deporte}
                  onChange={(e) => setForm({ ...form, deporte: e.target.value })}
                  className={cn(
                    "w-full rounded-xl border-2 bg-white px-4 py-3",
                    "border-gray-200 hover:border-gray-300",
                    "focus:border-bordo focus:ring-4 focus:ring-bordo/10 focus:outline-none",
                    "transition-all duration-200"
                  )}
                >
                  <option value="">Seleccionar deporte</option>
                  {availableDeportes.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tallas disponibles
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTallas.map((talla) => (
                    <button
                      key={talla}
                      type="button"
                      onClick={() => toggleTalla(talla)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium",
                        "border-2 transition-all duration-200",
                        form.tallas.includes(talla)
                          ? "border-bordo bg-bordo text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      )}
                    >
                      {talla}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Colores (separados por coma)
                </label>
                <Input
                  value={coloresText}
                  onChange={(e) => setColoresText(e.target.value)}
                  onBlur={(e) => {
                    const colores = e.target.value
                      .split(",")
                      .map((c) => c.trim())
                      .filter(Boolean);
                    setForm({ ...form, colores });
                    setColoresText(colores.join(", "));
                  }}
                  placeholder="Rojo, Azul, Negro"
                />
              </div>
            </div>
          </Card>

          {/* Images */}
          <Card padding="lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Imágenes
            </h2>
            <ImageUpload
              value={form.imagenes}
              onChange={(urls) =>
                setForm({
                  ...form,
                  imagenes: urls,
                  imagen_principal: urls[0] || "",
                })
              }
              maxImages={5}
            />
          </Card>

          {/* Options */}
          <Card padding="lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Opciones
            </h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-bordo focus:ring-bordo/20"
                />
                <div>
                  <span className="font-medium text-gray-900">Producto activo</span>
                  <p className="text-sm text-gray-500">
                    El producto estará visible en la tienda
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.destacado}
                  onChange={(e) => setForm({ ...form, destacado: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-bordo focus:ring-bordo/20"
                />
                <div>
                  <span className="font-medium text-gray-900">Producto destacado</span>
                  <p className="text-sm text-gray-500">
                    Aparecerá en la sección de destacados
                  </p>
                </div>
              </label>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={saving}>
              Guardar Cambios
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
