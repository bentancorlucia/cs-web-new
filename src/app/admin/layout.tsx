"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { AdminSidebar } from "@/components/admin";
import { AdminProvider } from "@/contexts/AdminContext";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <div className="min-h-screen bg-slate-25 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          {/* Logo with pulse animation */}
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-2xl bg-bordo/10 animate-ping" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-bordo to-bordo-dark flex items-center justify-center shadow-soft-md">
              <Image
                src="/logo-cs.png"
                alt=""
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
          </div>
          <p className="text-gray-400 text-sm font-medium">Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !profile || !["admin", "directivo"].includes(profile.rol)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-25">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main
        className={cn(
          "ml-0 md:ml-[280px] min-h-screen",
          "transition-[margin] duration-300"
        )}
      >
        <AdminProvider openSidebar={() => setSidebarOpen(true)}>
          {children}
        </AdminProvider>
      </main>
    </div>
  );
}
