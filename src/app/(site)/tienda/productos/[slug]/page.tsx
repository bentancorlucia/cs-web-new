import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/lib/tienda";
import { ProductDetail } from "./ProductDetail";
import { ProductGrid } from "@/components/tienda";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Producto no encontrado | Club Seminario",
    };
  }

  return {
    title: `${product.nombre} | Tienda Club Seminario`,
    description:
      product.descripcion_corta ||
      product.descripcion ||
      `Comprá ${product.nombre} en la tienda oficial de Club Seminario`,
    openGraph: {
      title: product.nombre,
      description: product.descripcion_corta || undefined,
      images: product.imagen_principal ? [product.imagen_principal] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product, 4);

  return (
    <>
      {/* Main product section */}
      <section className="pt-28 pb-12 md:pt-32 md:pb-16 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <ProductDetail product={product} />
        </div>
      </section>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
              Productos relacionados
            </h2>
            <ProductGrid products={relatedProducts} />
          </div>
        </section>
      )}
    </>
  );
}
