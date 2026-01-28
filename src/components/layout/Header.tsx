"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { CartButton } from "@/components/tienda/CartDrawer";

interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    label: "Club",
    href: "/club",
    children: [
      { label: "Directiva", href: "/club/directiva" },
      { label: "Instalaciones", href: "/club/instalaciones" },
      { label: "Estatuto", href: "/club/estatuto" },
      { label: "Reglamento", href: "/club/reglamento" },
      { label: "Memorias", href: "/club/memorias" },
    ],
  },
  { label: "Disciplinas", href: "/deportes" },
  { label: "Socios", href: "/socios" },
  { label: "Beneficios", href: "/beneficios" },
  { label: "Eventos", href: "/eventos" },
  { label: "Tienda", href: "/tienda" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAuthenticated, isLoading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    router.push("/");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
          isScrolled
            ? "bg-bordo/95 backdrop-blur-xl shadow-2xl shadow-black/20"
            : "bg-transparent"
        )}
      >
        {/* Decorative top accent */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amarillo via-amarillo-light to-amarillo transition-opacity duration-500",
            isScrolled ? "opacity-100" : "opacity-0"
          )}
        />

        <div className="container mx-auto px-4 lg:px-8">
          <nav className="flex items-center justify-between h-20 lg:h-24">
            {/* Logo */}
            <Link
              href="/"
              className="relative z-10 flex items-center gap-3 group"
            >
              <div
                className={cn(
                  "relative w-12 h-12 lg:w-14 lg:h-14 transition-all duration-500",
                  "group-hover:scale-105"
                )}
              >
                <Image
                  src="/logo-cs.png"
                  alt="Escudo Club Seminario"
                  fill
                  className="object-contain drop-shadow-lg"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <span
                  className={cn(
                    "block text-lg lg:text-xl font-bold tracking-tight transition-colors duration-300",
                    isScrolled ? "text-white" : "text-white drop-shadow-lg"
                  )}
                >
                  Club Seminario
                </span>
                <span
                  className={cn(
                    "block text-xs font-medium tracking-widest uppercase transition-colors duration-300",
                    isScrolled
                      ? "text-amarillo"
                      : "text-amarillo drop-shadow-md"
                  )}
                >
                  Desde 2010
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() =>
                    item.children && setActiveDropdown(item.href)
                  }
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {item.children ? (
                    <span
                      className={cn(
                        "relative px-4 py-2 text-base font-medium rounded-lg transition-all duration-300 cursor-default",
                        "hover:bg-white/10",
                        isActive(item.href)
                          ? isScrolled
                            ? "text-amarillo"
                            : "text-amarillo drop-shadow-md"
                          : isScrolled
                            ? "text-white/90 hover:text-white"
                            : "text-white/90 hover:text-white drop-shadow-sm",
                        "flex items-center gap-1"
                      )}
                    >
                      {item.label}
                      <svg
                        className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          activeDropdown === item.href && "rotate-180"
                        )}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      {isActive(item.href) && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-amarillo rounded-full" />
                      )}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "relative px-4 py-2 text-base font-medium rounded-lg transition-all duration-300",
                        "hover:bg-white/10",
                        isActive(item.href)
                          ? isScrolled
                            ? "text-amarillo"
                            : "text-amarillo drop-shadow-md"
                          : isScrolled
                            ? "text-white/90 hover:text-white"
                            : "text-white/90 hover:text-white drop-shadow-sm",
                        "flex items-center gap-1"
                      )}
                    >
                      {item.label}
                      {isActive(item.href) && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-amarillo rounded-full" />
                      )}
                    </Link>
                  )}

                  {/* Dropdown */}
                  {item.children && (
                    <div
                      className={cn(
                        "absolute top-full left-0 pt-2 transition-all duration-300",
                        activeDropdown === item.href
                          ? "opacity-100 visible translate-y-0"
                          : "opacity-0 invisible -translate-y-2"
                      )}
                    >
                      <div className="bg-white rounded-xl shadow-2xl shadow-black/20 border border-gray-100 py-2 min-w-[200px] overflow-hidden">
                        {/* Decorative accent */}
                        <div className="absolute top-0 left-4 right-4 h-0.5 bg-gradient-to-r from-bordo via-bordo-light to-bordo" />
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "block px-4 py-2.5 text-base transition-all duration-200",
                              "hover:bg-bordo/5 hover:pl-6",
                              isActive(child.href)
                                ? "text-bordo font-medium bg-bordo/5"
                                : "text-gray-700 hover:text-bordo"
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Cart Button - Solo visible en la tienda */}
              {pathname.startsWith("/tienda") && (
                <CartButton className="text-white" />
              )}

              {isLoading ? (
                <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
              ) : isAuthenticated ? (
                <div
                  className="relative"
                  onMouseEnter={() => setUserMenuOpen(true)}
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300",
                      "hover:bg-white/10",
                      isScrolled ? "text-white" : "text-white"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-amarillo flex items-center justify-center text-bordo-dark font-semibold text-sm">
                      {profile?.nombre?.[0]?.toUpperCase() ||
                        user?.email?.[0]?.toUpperCase() ||
                        "U"}
                    </div>
                    <span className="font-medium">
                      {profile?.nombre || "Mi cuenta"}
                    </span>
                    <svg
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        userMenuOpen && "rotate-180"
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* User Dropdown */}
                  <div
                    className={cn(
                      "absolute top-full right-0 pt-2 transition-all duration-300",
                      userMenuOpen
                        ? "opacity-100 visible translate-y-0"
                        : "opacity-0 invisible -translate-y-2"
                    )}
                  >
                    <div className="bg-white rounded-xl shadow-2xl shadow-black/20 border border-gray-100 py-2 min-w-[200px] overflow-hidden">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {profile?.nombre} {profile?.apellido}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <Link
                        href="/mi-cuenta"
                        className="block px-4 py-2.5 text-base text-gray-700 hover:bg-bordo/5 hover:text-bordo transition-colors"
                      >
                        Mi cuenta
                      </Link>
                      <Link
                        href="/mi-cuenta/pedidos"
                        className="block px-4 py-2.5 text-base text-gray-700 hover:bg-bordo/5 hover:text-bordo transition-colors"
                      >
                        Mis pedidos
                      </Link>
                      <Link
                        href="/mi-cuenta/entradas"
                        className="block px-4 py-2.5 text-base text-gray-700 hover:bg-bordo/5 hover:text-bordo transition-colors"
                      >
                        Mis entradas
                      </Link>
                      {(profile?.rol === "admin" ||
                        profile?.rol === "directivo") && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2.5 text-base text-gray-700 hover:bg-bordo/5 hover:text-bordo transition-colors border-t border-gray-100"
                        >
                          Panel admin
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2.5 text-base text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "transition-colors duration-300",
                        isScrolled
                          ? "text-white/90 hover:text-white hover:bg-white/10"
                          : "text-white/90 hover:text-white hover:bg-white/10"
                      )}
                    >
                      Iniciar sesión
                    </Button>
                  </Link>
                  <Link href="/registro">
                    <Button variant="secondary" size="sm">
                      Registrarse
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "relative z-10 lg:hidden p-2 rounded-lg transition-colors duration-300",
                "hover:bg-white/10",
                isScrolled || isMobileMenuOpen ? "text-white" : "text-white"
              )}
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMobileMenuOpen}
            >
              <div className="w-6 h-5 flex flex-col justify-center items-center">
                <span
                  className={cn(
                    "block h-0.5 w-6 bg-current rounded-full transition-all duration-300",
                    isMobileMenuOpen
                      ? "rotate-45 translate-y-0.5"
                      : "-translate-y-1.5"
                  )}
                />
                <span
                  className={cn(
                    "block h-0.5 w-6 bg-current rounded-full transition-all duration-300",
                    isMobileMenuOpen ? "opacity-0 scale-0" : "opacity-100"
                  )}
                />
                <span
                  className={cn(
                    "block h-0.5 w-6 bg-current rounded-full transition-all duration-300",
                    isMobileMenuOpen
                      ? "-rotate-45 -translate-y-0.5"
                      : "translate-y-1.5"
                  )}
                />
              </div>
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-all duration-500",
          isMobileMenuOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={cn(
            "absolute top-0 right-0 h-full w-full max-w-sm bg-bordo-dark transition-transform duration-500 ease-out",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          <div className="relative h-full flex flex-col pt-24 pb-8 px-6 overflow-y-auto">
            {/* Navigation Links */}
            <nav className="flex-1 space-y-1">
              {navItems.map((item, index) => (
                <div
                  key={item.href}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className={cn(
                    isMobileMenuOpen &&
                      "animate-[slideIn_0.3s_ease-out_forwards]"
                  )}
                >
                  {item.children ? (
                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown === item.href ? null : item.href
                          )
                        }
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 text-lg font-medium rounded-xl transition-all duration-200",
                          isActive(item.href)
                            ? "text-amarillo bg-white/10"
                            : "text-white/90 hover:text-white hover:bg-white/5"
                        )}
                      >
                        {item.label}
                        <svg
                          className={cn(
                            "w-5 h-5 transition-transform duration-200",
                            activeDropdown === item.href && "rotate-180"
                          )}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      <div
                        className={cn(
                          "overflow-hidden transition-all duration-300",
                          activeDropdown === item.href
                            ? "max-h-96 opacity-100"
                            : "max-h-0 opacity-0"
                        )}
                      >
                        <div className="pl-4 py-2 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={cn(
                                "block px-4 py-2.5 text-base rounded-lg transition-all duration-200",
                                isActive(child.href)
                                  ? "text-amarillo bg-white/10"
                                  : "text-white/70 hover:text-white hover:bg-white/5"
                              )}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "block px-4 py-3 text-lg font-medium rounded-xl transition-all duration-200",
                        isActive(item.href)
                          ? "text-amarillo bg-white/10"
                          : "text-white/90 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Mobile Actions */}
            <div className="mt-8 pt-8 border-t border-white/10 space-y-3">
              {isLoading ? (
                <div className="h-12 rounded-xl bg-white/10 animate-pulse" />
              ) : isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 mb-4">
                    <div className="w-10 h-10 rounded-full bg-amarillo flex items-center justify-center text-bordo-dark font-semibold">
                      {profile?.nombre?.[0]?.toUpperCase() ||
                        user?.email?.[0]?.toUpperCase() ||
                        "U"}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {profile?.nombre} {profile?.apellido}
                      </p>
                      <p className="text-sm text-white/60 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <Link href="/mi-cuenta" className="block">
                    <Button
                      variant="outline"
                      className="w-full border-white/30 text-white hover:bg-white hover:text-bordo"
                    >
                      Mi cuenta
                    </Button>
                  </Link>
                  {(profile?.rol === "admin" ||
                    profile?.rol === "directivo") && (
                    <Link href="/admin" className="block">
                      <Button variant="secondary" className="w-full">
                        Panel admin
                      </Button>
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full px-6 py-3 text-base font-medium rounded-xl border-2 border-red-400/50 text-red-300 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block">
                    <Button
                      variant="outline"
                      className="w-full border-white/30 text-white hover:bg-white hover:text-bordo"
                    >
                      Iniciar sesión
                    </Button>
                  </Link>
                  <Link href="/registro" className="block">
                    <Button variant="secondary" className="w-full">
                      Registrarse
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
