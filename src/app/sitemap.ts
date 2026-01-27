import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { deportes } from "@/data/deportes";

const siteUrl = process.env.NEXT_PUBLIC_URL || "https://clubseminario.com.uy";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/socios`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/beneficios`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/deportes`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/club/directiva`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/club/instalaciones`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/club/estatuto`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/club/reglamento`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/club/memorias`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/tienda`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/eventos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/registro`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Deportes pages (static data)
  const deportesPages: MetadataRoute.Sitemap = deportes.map((deporte) => ({
    url: `${siteUrl}/deportes/${deporte.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Products pages (from database)
  const { data: productos } = await supabase
    .from("productos")
    .select("slug, updated_at")
    .eq("activo", true);

  const productosPages: MetadataRoute.Sitemap = (productos || []).map(
    (producto) => ({
      url: `${siteUrl}/tienda/productos/${producto.slug}`,
      lastModified: new Date(producto.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })
  );

  // Events pages (from database - only published and upcoming)
  const { data: eventos } = await supabase
    .from("eventos_sociales")
    .select("slug, updated_at, fecha_evento")
    .eq("publicado", true)
    .eq("activo", true)
    .gte("fecha_evento", new Date().toISOString());

  const eventosPages: MetadataRoute.Sitemap = (eventos || []).map((evento) => ({
    url: `${siteUrl}/eventos/${evento.slug}`,
    lastModified: new Date(evento.updated_at),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [
    ...staticPages,
    ...deportesPages,
    ...productosPages,
    ...eventosPages,
  ];
}
