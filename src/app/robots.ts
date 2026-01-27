import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_URL || "https://clubseminario.com.uy";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/mi-cuenta/",
          "/api/",
          "/tienda/checkout/",
          "/eventos/escaneo/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
