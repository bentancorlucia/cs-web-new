import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUpcomingEventos } from "@/lib/eventos";
import { EscaneoContent } from "./EscaneoContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Escaneo de Entradas | Club Seminario",
  description: "Sistema de escaneo de entradas para funcionarios de Club Seminario.",
};

export default async function EscaneoPage() {
  const supabase = await createClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/eventos/escaneo");
  }

  // Check if user has permission to scan
  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  // Check if user is admin, directivo, or funcionario with puede_escanear
  const canScan =
    profile?.rol === "admin" ||
    profile?.rol === "directivo";

  if (!canScan) {
    // Check funcionarios table
    const { data: funcionario } = await supabase
      .from("funcionarios")
      .select("puede_escanear")
      .eq("user_id", user.id)
      .single();

    if (!funcionario?.puede_escanear) {
      redirect("/");
    }
  }

  // Get upcoming events for selector
  const eventos = await getUpcomingEventos();

  return <EscaneoContent eventos={eventos} />;
}
