import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { AuthProvider } from "@/hooks/useAuth";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_URL || "https://clubseminario.com.uy";
const siteName = "Club Seminario";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  icons: {
    icon: "/logo-cs.png",
    shortcut: "/logo-cs.png",
    apple: "/apple-icon.png",
  },
  description:
    "Club Seminario - Institución deportiva, social y cultural que reúne a la comunidad jesuita en Uruguay desde 2010. Más de 1000 socios, 22 categorías deportivas, tienda oficial y eventos.",
  keywords: [
    "Club Seminario",
    "club deportivo Uruguay",
    "deportes Montevideo",
    "rugby Uruguay",
    "hockey Uruguay",
    "fútbol Uruguay",
    "handball Uruguay",
    "volleyball Uruguay",
    "básquetbol Uruguay",
    "comunidad jesuita",
    "Colegio Seminario",
    "eventos deportivos",
    "tienda deportiva",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_UY",
    url: siteUrl,
    siteName,
    title: siteName,
    description:
      "Institución deportiva, social y cultural que reúne a la comunidad jesuita en Uruguay desde 2010.",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description:
      "Institución deportiva, social y cultural que reúne a la comunidad jesuita en Uruguay desde 2010.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  themeColor: "#730d32",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${poppins.variable} font-sans antialiased`}>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
