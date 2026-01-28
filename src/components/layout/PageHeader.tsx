"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  breadcrumbs?: Breadcrumb[];
  size?: "sm" | "md" | "lg";
  align?: "left" | "center";
  overlay?: "light" | "medium" | "dark";
  pattern?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  description,
  backgroundImage,
  breadcrumbs,
  size = "md",
  align = "center",
  overlay = "medium",
  pattern = true,
}: PageHeaderProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const sizes = {
    sm: "pt-28 pb-12 md:pt-32 md:pb-16",
    md: "pt-32 pb-16 md:pt-40 md:pb-24",
    lg: "pt-36 pb-20 md:pt-48 md:pb-32",
  };

  const overlays = {
    light: "from-bordo/70 via-bordo/60 to-bordo-dark/70",
    medium: "from-bordo/85 via-bordo/75 to-bordo-dark/85",
    dark: "from-bordo/95 via-bordo/90 to-bordo-dark/95",
  };

  return (
    <header className={cn("relative overflow-hidden bg-bordo -mb-px", sizes[size])}>
      {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0">
          <Image
            src={backgroundImage}
            alt=""
            fill
            priority
            className={cn(
              "object-cover transition-transform duration-1000",
              isLoaded ? "scale-100" : "scale-105"
            )}
            onLoad={() => setIsLoaded(true)}
          />
        </div>
      )}

      {/* Gradient Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br",
          overlays[overlay]
        )}
      />

      {/* Decorative Pattern */}
      {pattern && (
        <div className="absolute inset-0 opacity-[0.04]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
      )}

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amarillo/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-bordo-light/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      {/* Content */}
      <div className="relative container mx-auto px-4 lg:px-8">
        <div
          className={cn(
            "max-w-4xl",
            align === "center" ? "mx-auto text-center" : ""
          )}
        >
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav
              aria-label="Breadcrumb"
              className={cn(
                "mb-6 transition-all duration-700 delay-100",
                isLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              )}
            >
              <ol
                className={cn(
                  "flex flex-wrap items-center gap-2 text-sm",
                  align === "center" && "justify-center"
                )}
              >
                <li>
                  <Link
                    href="/"
                    className="text-white/60 hover:text-amarillo transition-colors inline-flex items-center gap-1"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    <span className="sr-only">Inicio</span>
                  </Link>
                </li>
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-white/40"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    {crumb.href ? (
                      <Link
                        href={crumb.href}
                        className="text-white/60 hover:text-amarillo transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-white/90 font-medium">
                        {crumb.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Subtitle / Tag */}
          {subtitle && (
            <div
              className={cn(
                "mb-4 transition-all duration-700 delay-150",
                isLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              )}
            >
              <span className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amarillo bg-amarillo/15 rounded-full border border-amarillo/25">
                {subtitle}
              </span>
            </div>
          )}

          {/* Title */}
          <h1
            className={cn(
              "text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight transition-all duration-700 delay-200",
              isLoaded
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            )}
          >
            {title}
          </h1>

          {/* Description */}
          {description && (
            <p
              className={cn(
                "mt-6 text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl transition-all duration-700 delay-300",
                align === "center" && "mx-auto",
                isLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              )}
            >
              {description}
            </p>
          )}

          {/* Decorative Line */}
          <div
            className={cn(
              "mt-8 transition-all duration-1000 delay-500",
              align === "center" && "flex justify-center",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="flex items-center gap-2">
              <div className="w-12 h-1 rounded-full bg-amarillo" />
              <div className="w-3 h-3 rounded-full bg-amarillo/50" />
              <div className="w-2 h-2 rounded-full bg-amarillo/30" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <svg
        className="absolute -bottom-px left-0 w-full h-12 md:h-16"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        fill="white"
      >
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
      </svg>
    </header>
  );
}
