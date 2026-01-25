"use client";

import { forwardRef, type InputHTMLAttributes, useState, useId } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      size = "md",
      disabled,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const generatedId = useId();
    const inputId = props.id || generatedId;

    const sizes = {
      sm: "py-2 text-sm",
      md: "py-3 text-base",
      lg: "py-4 text-lg",
    };

    const iconSizes = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium mb-2 transition-colors duration-200",
              isFocused ? "text-bordo" : "text-gray-700",
              error && "text-red-600",
              disabled && "text-gray-400"
            )}
          >
            {label}
          </label>
        )}

        <div className="relative group">
          {leftIcon && (
            <div
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200",
                iconSizes[size],
                isFocused ? "text-bordo" : "text-gray-400",
                error && "text-red-500"
              )}
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={cn(
              "w-full rounded-xl border-2 bg-white px-4",
              "transition-all duration-200 ease-out",
              "placeholder:text-gray-400",
              "focus:outline-none",
              sizes[size],
              leftIcon && "pl-12",
              rightIcon && "pr-12",
              // Default state
              !error && [
                "border-gray-200",
                "hover:border-gray-300",
                "focus:border-bordo focus:ring-4 focus:ring-bordo/10",
              ],
              // Error state
              error && [
                "border-red-300",
                "focus:border-red-500 focus:ring-4 focus:ring-red-500/10",
                "text-red-900 placeholder:text-red-300",
              ],
              // Disabled state
              disabled && [
                "bg-gray-50 text-gray-500 cursor-not-allowed",
                "border-gray-200",
              ],
              className
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />

          {rightIcon && (
            <div
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200",
                iconSizes[size],
                isFocused ? "text-bordo" : "text-gray-400",
                error && "text-red-500"
              )}
            >
              {rightIcon}
            </div>
          )}

          {/* Focus ring decoration */}
          <div
            className={cn(
              "absolute -inset-px rounded-xl transition-opacity duration-200 pointer-events-none",
              "bg-gradient-to-r from-bordo/20 via-amarillo/20 to-bordo/20 opacity-0",
              isFocused && !error && "opacity-100"
            )}
            style={{ zIndex: -1 }}
          />
        </div>

        {/* Error message */}
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-2 text-sm text-red-600 flex items-center gap-1.5"
            role="alert"
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {/* Hint message */}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-2 text-sm text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// Textarea variant
export interface TextareaProps
  extends Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "size"
  > {
  label?: string;
  error?: string;
  hint?: string;
  size?: "sm" | "md" | "lg";
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, label, error, hint, size = "md", disabled, ...props },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const generatedId = useId();
    const inputId = props.id || generatedId;

    const sizes = {
      sm: "py-2 text-sm min-h-[80px]",
      md: "py-3 text-base min-h-[120px]",
      lg: "py-4 text-lg min-h-[160px]",
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium mb-2 transition-colors duration-200",
              isFocused ? "text-bordo" : "text-gray-700",
              error && "text-red-600",
              disabled && "text-gray-400"
            )}
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          disabled={disabled}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={cn(
            "w-full rounded-xl border-2 bg-white px-4 resize-y",
            "transition-all duration-200 ease-out",
            "placeholder:text-gray-400",
            "focus:outline-none",
            sizes[size],
            !error && [
              "border-gray-200",
              "hover:border-gray-300",
              "focus:border-bordo focus:ring-4 focus:ring-bordo/10",
            ],
            error && [
              "border-red-300",
              "focus:border-red-500 focus:ring-4 focus:ring-red-500/10",
              "text-red-900 placeholder:text-red-300",
            ],
            disabled && [
              "bg-gray-50 text-gray-500 cursor-not-allowed",
              "border-gray-200",
            ],
            className
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...props}
        />

        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-2 text-sm text-red-600 flex items-center gap-1.5"
            role="alert"
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-2 text-sm text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Input, Textarea };
