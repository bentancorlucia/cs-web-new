"use client";

import { useState, useRef, useEffect, Fragment } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/contexts/AdminContext";
import { cn } from "@/lib/utils";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
}

export function AdminHeader({ title, subtitle, actions, breadcrumbs }: AdminHeaderProps) {
  const { openSidebar } = useAdmin();
  const { user, profile, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = profile
    ? `${profile.nombre.charAt(0)}${profile.apellido.charAt(0)}`
    : "??";

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-bordo/10">
      {/* Accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-bordo via-bordo-light to-amarillo" />
      <div className="flex h-20 items-center justify-between px-5 md:px-8 pt-1">
        {/* Left side - Menu button (mobile) + Title */}
        <div className="flex items-center gap-4">
          {/* Hamburger menu - mobile only */}
          <button
            onClick={openSidebar}
            className="md:hidden p-2.5 -ml-2 rounded-xl text-bordo hover:text-bordo-dark hover:bg-bordo/5 transition-all"
            aria-label="Abrir menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex flex-col">
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex items-center gap-1.5 text-sm text-bordo/50 mb-0.5">
                <Link href="/admin" className="hover:text-bordo transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </Link>
                {breadcrumbs.map((item, i) => (
                  <Fragment key={i}>
                    <svg className="w-4 h-4 text-bordo/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                    {item.href ? (
                      <Link href={item.href} className="hover:text-bordo transition-colors">
                        {item.label}
                      </Link>
                    ) : (
                      <span className="text-bordo/70">{item.label}</span>
                    )}
                  </Fragment>
                ))}
              </nav>
            )}

            {title && (
              <h1 className="text-lg md:text-xl font-semibold text-bordo tracking-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs md:text-sm text-gray-400 hidden sm:block">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right side - Actions & User */}
        <div className="flex items-center gap-3">
          {/* Custom actions */}
          {actions}

          {/* Notifications */}
          <button
            className={cn(
              "relative p-2.5 rounded-xl",
              "text-bordo/60 hover:text-bordo hover:bg-bordo/5",
              "transition-all duration-200"
            )}
            aria-label="Notificaciones"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {/* Notification badge */}
            <span className="absolute top-2 right-2 w-2 h-2 bg-amarillo rounded-full ring-2 ring-white" />
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-bordo/10" />

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={cn(
                "flex items-center gap-3 p-1.5 md:pr-3 rounded-xl",
                "hover:bg-slate-75 transition-all duration-200",
                showUserMenu && "bg-slate-75"
              )}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-bordo to-bordo-dark flex items-center justify-center shadow-soft-sm ring-2 ring-amarillo/40">
                <span className="text-white text-sm font-semibold">{initials}</span>
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-gray-900">
                  {profile?.nombre} {profile?.apellido}
                </span>
                <span className="text-xs text-gray-400 capitalize">{profile?.rol}</span>
              </div>
              <svg
                className={cn(
                  "hidden md:block w-4 h-4 text-gray-400 transition-transform duration-200",
                  showUserMenu && "rotate-180"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-soft-lg border border-bordo/10 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2.5 border-b border-bordo/10">
                  <p className="text-sm text-gray-400 truncate">{user?.email}</p>
                </div>
                <Link
                  href="/mi-cuenta/perfil"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-bordo hover:bg-bordo/5 transition-all"
                  onClick={() => setShowUserMenu(false)}
                >
                  <svg className="w-4 h-4 text-bordo/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Mi perfil
                </Link>
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-bordo hover:bg-bordo/5 transition-all"
                  onClick={() => setShowUserMenu(false)}
                >
                  <svg className="w-4 h-4 text-bordo/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configuración
                </Link>
                <div className="my-1.5 border-t border-bordo/10" />
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    signOut();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-bordo hover:bg-bordo/5 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
