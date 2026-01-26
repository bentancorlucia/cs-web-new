import { createClient } from "@/lib/supabase/server";
import type {
  Producto,
  ProductoCompleto,
  CategoriaProducto,
  MetodoEnvio,
  ProductFilters,
} from "@/types/tienda";

// Get all active products with optional filters
export async function getProducts(filters?: ProductFilters): Promise<Producto[]> {
  const supabase = await createClient();

  let query = supabase
    .from("productos")
    .select("*")
    .eq("activo", true)
    .order("destacado", { ascending: false })
    .order("created_at", { ascending: false });

  // Apply filters
  if (filters?.categoria) {
    const { data: categoria } = await supabase
      .from("categorias_producto")
      .select("id")
      .eq("slug", filters.categoria)
      .single();

    if (categoria) {
      query = query.eq("categoria_id", categoria.id);
    }
  }

  if (filters?.deporte) {
    query = query.eq("deporte", filters.deporte);
  }

  if (filters?.enOferta) {
    query = query.not("precio_oferta", "is", null);
  }

  if (filters?.destacado) {
    query = query.eq("destacado", true);
  }

  if (filters?.busqueda) {
    query = query.or(
      `nombre.ilike.%${filters.busqueda}%,descripcion.ilike.%${filters.busqueda}%,descripcion_corta.ilike.%${filters.busqueda}%`
    );
  }

  // Apply sorting
  if (filters?.ordenar) {
    switch (filters.ordenar) {
      case "precio_asc":
        query = query.order("precio", { ascending: true });
        break;
      case "precio_desc":
        query = query.order("precio", { ascending: false });
        break;
      case "nombre":
        query = query.order("nombre", { ascending: true });
        break;
      case "recientes":
        query = query.order("created_at", { ascending: false });
        break;
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data || [];
}

// Get a single product by slug with all related data
export async function getProductBySlug(
  slug: string
): Promise<ProductoCompleto | null> {
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("productos")
    .select(
      `
      *,
      categoria:categorias_producto(*),
      variantes:variantes_producto(*)
    `
    )
    .eq("slug", slug)
    .eq("activo", true)
    .single();

  if (error || !product) {
    console.error("Error fetching product:", error);
    return null;
  }

  return product as ProductoCompleto;
}

// Get featured products
export async function getFeaturedProducts(limit = 8): Promise<Producto[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("activo", true)
    .eq("destacado", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }

  return data || [];
}

// Get all active categories
export async function getCategories(): Promise<CategoriaProducto[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categorias_producto")
    .select("*")
    .eq("activa", true)
    .order("orden", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data || [];
}

// Get unique sports from products
export async function getDeportes(): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("productos")
    .select("deporte")
    .eq("activo", true)
    .not("deporte", "is", null);

  if (error) {
    console.error("Error fetching deportes:", error);
    return [];
  }

  const deportes = [...new Set(data?.map((p) => p.deporte).filter(Boolean))];
  return deportes as string[];
}

// Get all active shipping methods
export async function getShippingMethods(): Promise<MetodoEnvio[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("metodos_envio")
    .select("*")
    .eq("activo", true)
    .order("orden", { ascending: true });

  if (error) {
    console.error("Error fetching shipping methods:", error);
    return [];
  }

  return data || [];
}

// Get related products (same category or sport)
export async function getRelatedProducts(
  product: Producto,
  limit = 4
): Promise<Producto[]> {
  const supabase = await createClient();

  let query = supabase
    .from("productos")
    .select("*")
    .eq("activo", true)
    .neq("id", product.id)
    .limit(limit);

  if (product.categoria_id) {
    query = query.eq("categoria_id", product.categoria_id);
  } else if (product.deporte) {
    query = query.eq("deporte", product.deporte);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching related products:", error);
    return [];
  }

  // If not enough related products, fetch random ones
  if ((data?.length || 0) < limit) {
    const existingIds = [product.id, ...(data?.map((p) => p.id) || [])];
    const { data: moreProducts } = await supabase
      .from("productos")
      .select("*")
      .eq("activo", true)
      .not("id", "in", `(${existingIds.join(",")})`)
      .limit(limit - (data?.length || 0));

    return [...(data || []), ...(moreProducts || [])];
  }

  return data || [];
}
