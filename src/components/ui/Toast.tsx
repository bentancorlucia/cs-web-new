"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Convenience methods
export function useToastActions() {
  const { addToast } = useToast();

  return {
    success: (title: string, description?: string) =>
      addToast({ type: "success", title, description }),
    error: (title: string, description?: string) =>
      addToast({ type: "error", title, description }),
    warning: (title: string, description?: string) =>
      addToast({ type: "warning", title, description }),
    info: (title: string, description?: string) =>
      addToast({ type: "info", title, description }),
  };
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  if (typeof window === "undefined") return null;
  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-label="Notificaciones"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>,
    document.body
  );
}

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  const styles = {
    success: {
      container: "bg-emerald-50 border-emerald-200",
      icon: "bg-emerald-100 text-emerald-600",
      title: "text-emerald-900",
      description: "text-emerald-700",
    },
    error: {
      container: "bg-red-50 border-red-200",
      icon: "bg-red-100 text-red-600",
      title: "text-red-900",
      description: "text-red-700",
    },
    warning: {
      container: "bg-amber-50 border-amber-200",
      icon: "bg-amber-100 text-amber-600",
      title: "text-amber-900",
      description: "text-amber-700",
    },
    info: {
      container: "bg-blue-50 border-blue-200",
      icon: "bg-blue-100 text-blue-600",
      title: "text-blue-900",
      description: "text-blue-700",
    },
  };

  const style = styles[toast.type];

  return (
    <div
      className={cn(
        "pointer-events-auto w-full rounded-xl border-2 p-4 shadow-lg",
        "animate-in slide-in-from-right-full fade-in duration-300 motion-reduce:animate-none",
        style.container
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
            style.icon
          )}
        >
          {icons[toast.type]}
        </div>

        {/* Content */}
        <div className="flex-1 pt-0.5">
          <p className={cn("font-medium text-sm", style.title)}>{toast.title}</p>
          {toast.description && (
            <p className={cn("mt-1 text-sm", style.description)}>
              {toast.description}
            </p>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className={cn(
            "flex-shrink-0 p-1 rounded-lg transition-colors",
            "hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            style.title
          )}
          aria-label="Cerrar notificación"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export { ToastContainer, ToastItem };
