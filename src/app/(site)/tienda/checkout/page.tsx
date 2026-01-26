import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getShippingMethods } from "@/lib/tienda";
import { CheckoutForm } from "@/components/tienda";

export const metadata: Metadata = {
  title: "Checkout | Club Seminario",
  description: "Finalizá tu compra en la tienda oficial de Club Seminario",
};

export default async function CheckoutPage() {
  const shippingMethods = await getShippingMethods();

  return (
    <section className="pt-28 pb-12 md:pt-32 md:pb-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
          <CheckoutForm shippingMethods={shippingMethods} />
        </div>
      </div>
    </section>
  );
}
