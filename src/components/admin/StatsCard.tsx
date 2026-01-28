"use client";

import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
  };
  icon: React.ReactNode;
  color?: "bordo" | "amarillo" | "green" | "blue" | "purple";
  loading?: boolean;
}

export function StatsCard({
  title,
  value,
  change,
  icon,
  color = "bordo",
  loading = false,
}: StatsCardProps) {
  const colors = {
    bordo: {
      bg: "bg-bordo/10",
      icon: "text-bordo",
    },
    amarillo: {
      bg: "bg-amarillo/15",
      icon: "text-amarillo-dark",
    },
    green: {
      bg: "bg-emerald-50",
      icon: "text-emerald-600",
    },
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
    },
    purple: {
      bg: "bg-violet-50",
      icon: "text-violet-600",
    },
  };

  const changeColors = {
    increase: "text-emerald-600 bg-emerald-50",
    decrease: "text-red-600 bg-red-50",
    neutral: "text-gray-500 bg-gray-100",
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-7 shadow-soft-sm animate-pulse">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-4 bg-slate-75 rounded-full w-24" />
            <div className="h-10 bg-slate-75 rounded-xl w-32" />
          </div>
          <div className="w-12 h-12 bg-slate-75 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative bg-white rounded-3xl p-7",
        "shadow-soft-sm hover:shadow-soft-md",
        "transition-all duration-300",
        "group overflow-hidden",
        "border-l-4",
        color === "bordo" && "border-l-bordo",
        color === "amarillo" && "border-l-amarillo",
        color === "green" && "border-l-emerald-500",
        color === "blue" && "border-l-blue-500",
        color === "purple" && "border-l-violet-500"
      )}
    >
      {/* Decorative gradient - more subtle */}
      <div
        className={cn(
          "absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20",
          "transition-opacity duration-500 group-hover:opacity-30",
          color === "bordo" && "bg-bordo",
          color === "amarillo" && "bg-amarillo",
          color === "green" && "bg-emerald-400",
          color === "blue" && "bg-blue-400",
          color === "purple" && "bg-violet-400"
        )}
        style={{ transform: "translate(30%, -30%)" }}
      />

      {/* Icon - positioned top right */}
      <div
        className={cn(
          "absolute top-6 right-6 p-3.5 rounded-2xl",
          colors[color].bg,
          colors[color].icon
        )}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="relative pr-16">
        <p className="text-sm font-medium text-gray-400 tracking-wide uppercase">
          {title}
        </p>
        <p className="mt-2 text-4xl font-bold text-gray-900 tracking-tight">
          {value}
        </p>
        {change && (
          <div className="mt-3 flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
                changeColors[change.type]
              )}
            >
              {change.type === "increase" && (
                <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {change.type === "decrease" && (
                <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {Math.abs(change.value)}%
            </span>
            <span className="text-xs text-gray-400">vs mes anterior</span>
          </div>
        )}
      </div>
    </div>
  );
}
