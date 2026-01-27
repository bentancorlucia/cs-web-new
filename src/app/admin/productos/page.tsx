"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminHeader, DataTable, StatusBadge, type Column } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { formatPrice } from "@/lib/utils";
import type { ProductoConCategoria } from "@/types/tienda";

export default function ProductosPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductoConCategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; product: ProductoConCategoria | null }>({
    open: false,
    product: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const fetchProducts = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (searchQuery) {
        params.set("search", searchQuery);
      }

      const response = await fetch(`/api/productos?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      setProducts(result.data ?? []);
      setTotal(result.total ?? 0);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async () => {
    if (!deleteModal.product) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/productos/${deleteModal.product.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error);
      }

      setDeleteModal({ open: false, product: null });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (product: ProductoConCategoria) => {
    try {
      const response = await fetch(`/api/productos/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !product.activo }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error);
      }

      fetchProducts();
    } catch (error) {
      console.error("Error toggling product:", error);
    }
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p.id));
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const columns: Column<ProductoConCategoria>[] = [
    {
      key: "nombre",
      label: "Producto",
      sortable: true,
      render: (product) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
            {product.imagen_principal ? (
              <img
                src={product.imagen_principal}
                alt={product.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{product.nombre}</p>
            <p className="text-sm text-gray-500">
              {product.categoria?.nombre ?? "Sin categoría"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "sku",
      label: "SKU",
      sortable: true,
      render: (product) => (
        <span className="font-mono text-sm text-gray-600">{product.sku}</span>
      ),
    },
    {
      key: "precio",
      label: "Precio",
      sortable: true,
      render: (product) => (
        <div>
          <span className="font-semibold text-gray-900">
            {formatPrice(product.precio_oferta ?? product.precio)}
          </span>
          {product.precio_oferta && (
            <span className="ml-2 text-sm text-gray-400 line-through">
              {formatPrice(product.precio)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      sortable: true,
      render: (product) => (
        <div className="flex items-center gap-2">
          <span
            className={`font-semibold ${
              product.stock === 0
                ? "text-red-600"
                : product.stock < 10
                ? "text-amber-600"
                : "text-gray-900"
            }`}
          >
            {product.stock}
          </span>
          {product.stock < 10 && product.stock > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">
              Bajo
            </span>
          )}
          {product.stock === 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded">
              Agotado
            </span>
          )}
        </div>
      ),
    },
    {
      key: "activo",
      label: "Estado",
      render: (product) => (
        <StatusBadge
          status={product.activo ? "activo" : "inactivo"}
          type="producto"
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Productos"
        subtitle={`${total} productos en total`}
        actions={
          <Link href="/admin/productos/nuevo">
            <Button
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
            >
              Nuevo Producto
            </Button>
          </Link>
        }
      />

      <div className="p-6">
        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="mb-4 p-4 bg-bordo/5 border border-bordo/20 rounded-xl flex items-center justify-between">
            <span className="text-sm text-gray-700">
              <strong>{selectedProducts.length}</strong> productos seleccionados
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedProducts([])}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  // Bulk delete logic
                }}
              >
                Eliminar seleccionados
              </Button>
            </div>
          </div>
        )}

        <DataTable
          data={products}
          columns={columns}
          keyExtractor={(product) => product.id}
          loading={loading}
          emptyMessage="No hay productos. Crea el primero."
          searchable
          searchPlaceholder="Buscar por nombre o SKU..."
          onSearch={(query) => {
            setSearchQuery(query);
            setPage(1);
          }}
          selectedRows={selectedProducts}
          onSelectRow={handleSelectRow}
          onSelectAll={handleSelectAll}
          onRowClick={(product) => router.push(`/admin/productos/${product.id}`)}
          pagination={{
            page,
            pageSize,
            total,
            onPageChange: setPage,
          }}
          actions={(product) => (
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => handleToggleActive(product)}
                className={`p-2 rounded-lg transition-colors ${
                  product.activo
                    ? "text-amber-600 hover:bg-amber-50"
                    : "text-emerald-600 hover:bg-emerald-50"
                }`}
                title={product.activo ? "Desactivar" : "Activar"}
              >
                {product.activo ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.758 6.758M9.878 9.878a3.001 3.001 0 00-.002 4.24m4.244-4.244l3.12 3.12M3 3l3.757 3.757m0 0a9.969 9.969 0 015.372-2.638M21 21l-3.757-3.757m0 0a9.969 9.969 0 01-5.372 2.638" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
              <Link href={`/admin/productos/${product.id}`}>
                <button
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  title="Editar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </Link>
              <button
                onClick={() => setDeleteModal({ open: true, product })}
                className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                title="Eliminar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, product: null })}
        title="Eliminar Producto"
        description="Esta acción no se puede deshacer. El producto será eliminado permanentemente."
        size="sm"
      >
        {deleteModal.product && (
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-4">
            <div className="w-12 h-12 rounded-lg bg-white overflow-hidden flex-shrink-0">
              {deleteModal.product.imagen_principal ? (
                <img
                  src={deleteModal.product.imagen_principal}
                  alt={deleteModal.product.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">{deleteModal.product.nombre}</p>
              <p className="text-sm text-gray-500">SKU: {deleteModal.product.sku}</p>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setDeleteModal({ open: false, product: null })}
          >
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={deleting}>
            Eliminar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
