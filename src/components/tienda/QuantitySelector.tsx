"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  disabled = false,
}: QuantitySelectorProps) {
  const canDecrease = value > min && !disabled;
  const canIncrease = value < max && !disabled;

  const handleDecrease = () => {
    if (canDecrease) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (canIncrease) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue)) {
      onChange(Math.max(min, Math.min(max, newValue)));
    }
  };

  const sizes = {
    sm: {
      container: "h-8",
      button: "w-8 h-8",
      input: "w-10 text-sm",
      icon: "w-3 h-3",
    },
    md: {
      container: "h-10",
      button: "w-10 h-10",
      input: "w-12 text-base",
      icon: "w-4 h-4",
    },
    lg: {
      container: "h-12",
      button: "w-12 h-12",
      input: "w-14 text-lg",
      icon: "w-5 h-5",
    },
  };

  const s = sizes[size];

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl border border-gray-200 bg-white overflow-hidden",
        disabled && "opacity-50"
      )}
    >
      <button
        type="button"
        onClick={handleDecrease}
        disabled={!canDecrease}
        className={cn(
          s.button,
          "flex items-center justify-center transition-colors",
          canDecrease
            ? "text-gray-700 hover:bg-gray-100 hover:text-bordo"
            : "text-gray-300 cursor-not-allowed"
        )}
        aria-label="Disminuir cantidad"
      >
        <Minus className={s.icon} />
      </button>

      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        disabled={disabled}
        className={cn(
          s.input,
          "text-center font-medium text-gray-900 border-x border-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-bordo/50",
          "appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        )}
        aria-label="Cantidad"
      />

      <button
        type="button"
        onClick={handleIncrease}
        disabled={!canIncrease}
        className={cn(
          s.button,
          "flex items-center justify-center transition-colors",
          canIncrease
            ? "text-gray-700 hover:bg-gray-100 hover:text-bordo"
            : "text-gray-300 cursor-not-allowed"
        )}
        aria-label="Aumentar cantidad"
      >
        <Plus className={s.icon} />
      </button>
    </div>
  );
}
