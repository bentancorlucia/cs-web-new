"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AdminSidebar } from "@/components/admin";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=/admin");
    }

    if (
      !isLoading &&
      isAuthenticated &&
      profile &&
      !["admin", "directivo"].includes(profile.rol)
    ) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, profile, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-bordo/20 border-t-bordo rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !profile || !["admin", "directivo"].includes(profile.rol)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <main
        className={cn(
          "ml-64 min-h-screen",
          "transition-[margin] duration-300"
        )}
      >
        {children}
      </main>
    </div>
  );
}
