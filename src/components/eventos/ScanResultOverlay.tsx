"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ScanResultOverlayProps {
  status: "success" | "warning" | "error";
  message: string;
  details?: string;
  extraInfo?: {
    nombre?: string;
    cedula?: string;
    tipoEntrada?: string;
  };
  onClose: () => void;
  autoCloseDelay?: number;
}

export function ScanResultOverlay({
  status,
  message,
  details,
  extraInfo,
  onClose,
  autoCloseDelay = 4000,
}: ScanResultOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Auto close
    const timer = setTimeout(() => {
      handleClose();
    }, autoCloseDelay);

    return () => clearTimeout(timer);
  }, [autoCloseDelay]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300",
        isVisible && !isClosing ? "opacity-100" : "opacity-0"
      )}
      onClick={handleClose}
    >
      {/* Background */}
      <div
        className={cn(
          "absolute inset-0 transition-all duration-500",
          status === "success" && "bg-green-500",
          status === "warning" && "bg-amarillo",
          status === "error" && "bg-red-500"
        )}
      />

      {/* Content */}
      <div
        className={cn(
          "relative z-10 flex flex-col items-center justify-center p-8 text-center transition-all duration-500",
          isVisible && !isClosing
            ? "scale-100 translate-y-0"
            : "scale-90 translate-y-8"
        )}
      >
        {/* Animated icon */}
        <div
          className={cn(
            "relative mb-8 transition-all duration-700 delay-100",
            isVisible && !isClosing ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}
        >
          {/* Pulse rings */}
          <div
            className={cn(
              "absolute inset-0 rounded-full animate-ping",
              status === "success" && "bg-white/30",
              status === "warning" && "bg-bordo/20",
              status === "error" && "bg-white/30"
            )}
            style={{ animationDuration: "1.5s" }}
          />
          <div
            className={cn(
              "absolute inset-0 rounded-full animate-pulse",
              status === "success" && "bg-white/20",
              status === "warning" && "bg-bordo/10",
              status === "error" && "bg-white/20"
            )}
          />

          {/* Icon container */}
          <div
            className={cn(
              "relative w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center",
              status === "success" && "bg-white/20",
              status === "warning" && "bg-bordo/20",
              status === "error" && "bg-white/20"
            )}
          >
            {status === "success" && (
              <svg
                className="w-20 h-20 md:w-24 md:h-24 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                  className="animate-draw-check"
                />
              </svg>
            )}
            {status === "warning" && (
              <svg
                className="w-20 h-20 md:w-24 md:h-24 text-bordo-dark animate-bounce-slow"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            )}
            {status === "error" && (
              <svg
                className="w-20 h-20 md:w-24 md:h-24 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M6 18L18 6M6 6l12 12"
                  className="animate-draw-x"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Message */}
        <h1
          className={cn(
            "text-4xl md:text-6xl font-bold mb-4 transition-all duration-500 delay-200",
            status === "warning" ? "text-bordo-dark" : "text-white",
            isVisible && !isClosing
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          )}
        >
          {message}
        </h1>

        {/* Details */}
        {details && (
          <p
            className={cn(
              "text-xl md:text-2xl mb-6 transition-all duration-500 delay-300",
              status === "warning" ? "text-bordo-dark/80" : "text-white/90",
              isVisible && !isClosing
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            )}
          >
            {details}
          </p>
        )}

        {/* Extra info for successful scans */}
        {extraInfo && status === "success" && (
          <div
            className={cn(
              "mt-4 p-6 rounded-2xl bg-white/20 backdrop-blur-sm transition-all duration-500 delay-400",
              isVisible && !isClosing
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            )}
          >
            {extraInfo.cedula && (
              <p className="text-white/90 text-lg">
                <span className="font-medium">CI:</span> {extraInfo.cedula}
              </p>
            )}
            {extraInfo.tipoEntrada && (
              <p className="text-white/90 text-lg">
                <span className="font-medium">Tipo:</span> {extraInfo.tipoEntrada}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Tap to close hint - positioned at bottom of screen */}
      <p
        className={cn(
          "absolute bottom-8 left-0 right-0 text-center text-sm transition-all duration-500 delay-500 z-20 pb-safe",
          status === "warning" ? "text-bordo-dark/60" : "text-white/60",
          isVisible && !isClosing ? "opacity-100" : "opacity-0"
        )}
      >
        Toca para cerrar
      </p>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {status === "success" && (
          <>
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float" />
            <div className="absolute top-1/4 right-16 w-12 h-12 bg-white/10 rounded-full animate-float-delayed" />
            <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-float" />
            <div className="absolute bottom-32 right-1/3 w-8 h-8 bg-white/10 rounded-full animate-float-delayed" />
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes draw-check {
          0% {
            stroke-dasharray: 0 100;
          }
          100% {
            stroke-dasharray: 100 0;
          }
        }
        @keyframes draw-x {
          0% {
            stroke-dasharray: 0 100;
          }
          100% {
            stroke-dasharray: 100 0;
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.1);
          }
        }
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-15px) scale(1.05);
          }
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-draw-check {
          animation: draw-check 0.6s ease-out forwards;
          stroke-dasharray: 0 100;
        }
        .animate-draw-x {
          animation: draw-x 0.4s ease-out forwards;
          stroke-dasharray: 0 100;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        .animate-bounce-slow {
          animation: bounce-slow 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
