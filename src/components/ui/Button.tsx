"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      "relative inline-flex items-center justify-center font-medium",
      "transition-[transform,box-shadow,background,border-color] duration-300 ease-out",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "overflow-hidden group",
      "motion-reduce:transition-none"
    );

    const variants = {
      primary: cn(
        "bg-gradient-to-r from-bordo to-bordo-dark text-white",
        "hover:from-bordo-dark hover:to-bordo",
        "focus-visible:ring-bordo",
        "shadow-lg shadow-bordo/25 hover:shadow-xl hover:shadow-bordo/30",
        "active:scale-[0.98]",
        // Shine effect on hover
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        "before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700"
      ),
      secondary: cn(
        "bg-gradient-to-r from-amarillo to-amarillo-dark text-bordo-dark",
        "hover:from-amarillo-dark hover:to-amarillo",
        "focus-visible:ring-amarillo",
        "shadow-lg shadow-amarillo/25 hover:shadow-xl hover:shadow-amarillo/30",
        "active:scale-[0.98]",
        "font-semibold"
      ),
      outline: cn(
        "border-2 border-bordo text-bordo bg-transparent",
        "hover:bg-bordo hover:text-white",
        "focus-visible:ring-bordo",
        "active:scale-[0.98]"
      ),
      ghost: cn(
        "text-bordo bg-transparent",
        "hover:bg-bordo/10",
        "focus-visible:ring-bordo/50",
        "active:bg-bordo/20"
      ),
      danger: cn(
        "bg-gradient-to-r from-red-600 to-red-700 text-white",
        "hover:from-red-700 hover:to-red-600",
        "focus-visible:ring-red-500",
        "shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30",
        "active:scale-[0.98]"
      ),
    };

    const sizes = {
      sm: "px-4 py-2 text-sm rounded-lg gap-1.5",
      md: "px-6 py-3 text-base rounded-xl gap-2",
      lg: "px-8 py-4 text-lg rounded-xl gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && (
          <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
            {leftIcon}
          </span>
        )}
        <span className="relative z-10">{children}</span>
        {!isLoading && rightIcon && (
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
