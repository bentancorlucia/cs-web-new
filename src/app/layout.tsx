import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { AuthProvider } from "@/hooks/useAuth";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: {
    default: "Club Seminario",
    template: "%s | Club Seminario",
  },
  description:
    "Club Seminario - Tu club deportivo y social en Uruguay. Eventos, deportes, tienda oficial y más.",
  keywords: ["club", "seminario", "deportes", "uruguay", "eventos", "tienda"],
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
