import { notFound, redirect } from "next/navigation";
import { getEventoBySlug } from "@/lib/eventos";
import { createClient } from "@/lib/supabase/server";
import { CheckoutContent } from "./CheckoutContent";
import type { Metadata } from "next";

interface CheckoutPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CheckoutPageProps): Promise<Metadata> {
  const { slug } = await params;
  const evento = await getEventoBySlug(slug);

  return {
    title: evento
      ? `Checkout - ${evento.titulo} | Club Seminario`
      : "Checkout | Club Seminario",
  };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { slug } = await params;

  // Get event
  const evento = await getEventoBySlug(slug);

  if (!evento) {
    notFound();
  }

  // Check if event is past or sold out
  const now = new Date();
  const fechaEvento = new Date(evento.fecha_evento);

  if (fechaEvento < now) {
    redirect(`/eventos/${slug}`);
  }

  if (evento.capacidad_total && evento.entradas_vendidas >= evento.capacidad_total) {
    redirect(`/eventos/${slug}`);
  }

  // Get user session
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get profile if user is logged in
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <CheckoutContent
      evento={evento}
      user={user}
      profile={profile}
    />
  );
}
