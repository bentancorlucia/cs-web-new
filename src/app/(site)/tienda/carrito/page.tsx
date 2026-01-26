import { Metadata } from "next";
import { CartContent } from "./CartContent";

export const metadata: Metadata = {
  title: "Carrito | Club Seminario",
  description: "Tu carrito de compras en la tienda oficial de Club Seminario",
};

export default function CarritoPage() {
  return (
    <section className="pt-28 pb-12 md:pt-32 md:pb-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8">
        <CartContent />
      </div>
    </section>
  );
}
