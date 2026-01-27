import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create admin client to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || "";

    let query = supabaseAdmin
      .from("productos")
      .select(`*, categoria:categorias_producto(*)`, { count: "exact" })
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`nombre.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error("Error fetching products:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, total: count });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      nombre,
      slug,
      descripcion,
      descripcion_corta,
      precio,
      precio_oferta,
      categoria_id,
      stock,
      sku,
      imagen_principal,
      imagenes,
      activo,
      destacado,
      deporte,
      tallas,
      colores,
    } = body;

    // Validation
    if (!nombre || !sku || !precio) {
      return NextResponse.json(
        { error: "Nombre, SKU y precio son requeridos" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("productos")
      .insert({
        nombre,
        slug,
        descripcion: descripcion || "",
        descripcion_corta: descripcion_corta || "",
        precio,
        precio_oferta: precio_oferta || null,
        categoria_id: categoria_id || null,
        stock: stock || 0,
        sku,
        imagen_principal: imagen_principal || "",
        imagenes: imagenes || [],
        activo: activo ?? true,
        destacado: destacado ?? false,
        deporte: deporte || null,
        tallas: tallas || [],
        colores: colores || [],
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating product:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
