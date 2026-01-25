"use client";

import {
  forwardRef,
  useEffect,
  useCallback,
  useId,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  children: ReactNode;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      className,
      isOpen,
      onClose,
      title,
      description,
      size = "md",
      closeOnOverlayClick = true,
      closeOnEscape = true,
      showCloseButton = true,
      children,
      ...props
    },
    ref
  ) => {
    const uniqueId = useId();
    const titleId = `modal-title-${uniqueId}`;
    const descriptionId = `modal-description-${uniqueId}`;

    const handleEscape = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === "Escape" && closeOnEscape) {
          onClose();
        }
      },
      [closeOnEscape, onClose]
    );

    useEffect(() => {
      if (isOpen) {
        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";
      }

      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "";
      };
    }, [isOpen, handleEscape]);

    const sizes = {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      full: "max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]",
    };

    if (!isOpen) return null;

    const modalContent = (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
      >
        {/* Overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-black/60 backdrop-blur-sm",
            "animate-in fade-in duration-200 motion-reduce:animate-none"
          )}
          onClick={closeOnOverlayClick ? onClose : undefined}
          aria-hidden="true"
        />

        {/* Modal Panel */}
        <div
          ref={ref}
          className={cn(
            "relative w-full bg-white rounded-2xl shadow-2xl",
            "animate-in zoom-in-95 fade-in duration-200 motion-reduce:animate-none",
            sizes[size],
            className
          )}
          {...props}
        >
          {/* Decorative top border */}
          <div className="absolute top-0 left-4 right-4 h-1 bg-gradient-to-r from-bordo via-amarillo to-bordo rounded-full" />

          {/* Close button */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className={cn(
                "absolute top-4 right-4 p-2 rounded-xl",
                "text-gray-400 hover:text-gray-600",
                "hover:bg-gray-100 transition-colors duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-bordo"
              )}
              aria-label="Cerrar modal"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          {/* Header */}
          {(title || description) && (
            <div className="px-6 pt-8 pb-4">
              {title && (
                <h2
                  id={titleId}
                  className="text-xl font-semibold text-gray-900 pr-8"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id={descriptionId}
                  className="mt-2 text-sm text-gray-600"
                >
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Content */}
          <div
            className={cn(
              "px-6 pb-6",
              !title && !description && "pt-8"
            )}
          >
            {children}
          </div>
        </div>
      </div>
    );

    // Use portal to render at document body
    if (typeof window === "undefined") return null;
    return createPortal(modalContent, document.body);
  }
);

Modal.displayName = "Modal";

// Modal Footer component for actions
interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-end gap-3 pt-4 mt-4",
        "border-t border-gray-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

ModalFooter.displayName = "ModalFooter";

export { Modal, ModalFooter };
