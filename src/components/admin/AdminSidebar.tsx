"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Productos",
    href: "/admin/productos",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    label: "Eventos",
    href: "/admin/eventos",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Escaneo QR",
    href: "/eventos/escaneo",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
  },
  {
    label: "Pedidos",
    href: "/admin/pedidos",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    label: "Reportes",
    href: "/admin/reportes",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const handleNavClick = () => {
    if (onClose && window.innerWidth < 768) {
      onClose();
    }
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-20 items-center px-5 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-3.5" onClick={handleNavClick}>
          <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-white/10 flex items-center justify-center shadow-soft-md ring-2 ring-amarillo/40">
            <Image
              src="/logo-cs.png"
              alt="Club Seminario"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-semibold text-sm tracking-wide">
              Club Seminario
            </span>
            <span className="text-amarillo text-xs font-medium">Panel Admin</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3.5 px-4 py-3 rounded-2xl",
                "transition-all duration-200 group relative",
                isActive
                  ? "bg-white/15 text-white border-l-[3px] border-amarillo -ml-[3px]"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <span
                className={cn(
                  "flex-shrink-0 transition-colors duration-200",
                  isActive ? "text-amarillo" : "text-white/60 group-hover:text-white"
                )}
              >
                {item.icon}
              </span>

              <span className="text-sm font-medium truncate">{item.label}</span>

              {item.badge && (
                <span className="ml-auto px-2.5 py-0.5 text-xs font-semibold bg-amarillo text-bordo-dark rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <Link
          href="/"
          onClick={handleNavClick}
          className={cn(
            "flex items-center gap-3.5 px-4 py-3 rounded-2xl",
            "text-white/70 hover:text-white hover:bg-white/10",
            "transition-all duration-200 group"
          )}
        >
          <svg className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="text-sm font-medium">Volver al sitio</span>
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile drawer */}
      <div className="md:hidden">
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />
        )}

        {/* Drawer */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col",
            "bg-gradient-to-b from-bordo to-bordo-dark",
            "shadow-soft-lg",
            "transform transition-transform duration-300 ease-out",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-4 p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Cerrar menú"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <SidebarContent />
        </aside>
      </div>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex md:flex-col",
          "fixed left-0 top-0 z-40 h-screen w-[280px]",
          "bg-gradient-to-b from-bordo to-bordo-dark"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
