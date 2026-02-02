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

export interface SheetProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  showHandle?: boolean;
  children: ReactNode;
}

const Sheet = forwardRef<HTMLDivElement, SheetProps>(
  (
    {
      className,
      isOpen,
      onClose,
      title,
      description,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      showCloseButton = true,
      showHandle = true,
      children,
      ...props
    },
    ref
  ) => {
    const uniqueId = useId();
    const titleId = `sheet-title-${uniqueId}`;
    const descriptionId = `sheet-description-${uniqueId}`;

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

    if (!isOpen) return null;

    const sheetContent = (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center"
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

        {/* Sheet Panel */}
        <div
          ref={ref}
          className={cn(
            "relative w-full bg-white rounded-t-3xl shadow-2xl",
            "animate-in slide-in-from-bottom duration-300 ease-out motion-reduce:animate-none",
            "max-h-[90vh] overflow-hidden flex flex-col",
            className
          )}
          {...props}
        >
          {/* Handle */}
          {showHandle && (
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-gray-300" />
            </div>
          )}

          {/* Header */}
          {(title || description || showCloseButton) && (
            <div className="flex items-start justify-between px-5 pb-3">
              <div className="flex-1">
                {title && (
                  <h2
                    id={titleId}
                    className="text-lg font-bold text-gray-900"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    id={descriptionId}
                    className="mt-1 text-sm text-gray-500"
                  >
                    {description}
                  </p>
                )}
              </div>

              {/* Close button */}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className={cn(
                    "p-2 -mr-2 -mt-1 rounded-xl",
                    "text-gray-400 hover:text-gray-600",
                    "hover:bg-gray-100 transition-colors duration-200",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-bordo"
                  )}
                  aria-label="Cerrar"
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
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-5">
            {children}
          </div>
        </div>
      </div>
    );

    // Use portal to render at document body
    if (typeof window === "undefined") return null;
    return createPortal(sheetContent, document.body);
  }
);

Sheet.displayName = "Sheet";

// Sheet Footer component for fixed bottom actions
interface SheetFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const SheetFooter = forwardRef<HTMLDivElement, SheetFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "sticky bottom-0 left-0 right-0 px-5 py-4",
        "bg-white border-t border-gray-100",
        "safe-area-inset-bottom",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

SheetFooter.displayName = "SheetFooter";

export { Sheet, SheetFooter };
