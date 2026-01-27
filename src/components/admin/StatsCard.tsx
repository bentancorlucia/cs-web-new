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
      ring: "ring-bordo/20",
    },
    amarillo: {
      bg: "bg-amarillo/10",
      icon: "text-amber-600",
      ring: "ring-amarillo/20",
    },
    green: {
      bg: "bg-emerald-50",
      icon: "text-emerald-600",
      ring: "ring-emerald-500/20",
    },
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      ring: "ring-blue-500/20",
    },
    purple: {
      bg: "bg-purple-50",
      icon: "text-purple-600",
      ring: "ring-purple-500/20",
    },
  };

  const changeColors = {
    increase: "text-emerald-600 bg-emerald-50",
    decrease: "text-red-600 bg-red-50",
    neutral: "text-gray-600 bg-gray-100",
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-8 bg-gray-200 rounded w-32" />
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative bg-white rounded-2xl p-6",
        "shadow-sm border border-gray-100",
        "transition-all duration-300",
        "hover:shadow-md hover:border-gray-200",
        "group overflow-hidden"
      )}
    >
      {/* Decorative gradient */}
      <div
        className={cn(
          "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30",
          "transition-opacity duration-500 group-hover:opacity-50",
          color === "bordo" && "bg-bordo",
          color === "amarillo" && "bg-amarillo",
          color === "green" && "bg-emerald-400",
          color === "blue" && "bg-blue-400",
          color === "purple" && "bg-purple-400"
        )}
        style={{ transform: "translate(30%, -30%)" }}
      />

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
          {change && (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                  changeColors[change.type]
                )}
              >
                {change.type === "increase" && (
                  <svg className="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {change.type === "decrease" && (
                  <svg className="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {Math.abs(change.value)}%
              </span>
              <span className="text-xs text-gray-500">vs mes anterior</span>
            </div>
          )}
        </div>

        <div
          className={cn(
            "p-3 rounded-xl ring-1",
            colors[color].bg,
            colors[color].icon,
            colors[color].ring
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
