"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useSyncExternalStore } from "react";

// Hook to track hydration state without setState in effect
function useIsHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles = {
  success: "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200",
  error: "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
  warning: "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200",
  info: "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
};

export function Toaster() {
  const toasts = useUIStore((state) => state.toasts);
  const removeToast = useUIStore((state) => state.removeToast);
  const mounted = useIsHydrated();

  // Don't render during SSR to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = toastIcons[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-4 shadow-lg animate-in slide-in-from-right",
              toastStyles[toast.type]
            )}
          >
            <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{toast.title}</p>
              {toast.description && <p className="mt-1 text-sm opacity-80">{toast.description}</p>}
            </div>
            <button onClick={() => removeToast(toast.id)} className="opacity-70 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// Hook for showing toasts
export function useToast() {
  const addToast = useUIStore((state) => state.addToast);

  return {
    toast: (props: { title: string; description?: string; type?: "success" | "error" | "warning" | "info" }) => {
      addToast({ ...props, type: props.type || "info" });
    },
    success: (title: string, description?: string) => addToast({ title, description, type: "success" }),
    error: (title: string, description?: string) => addToast({ title, description, type: "error" }),
    warning: (title: string, description?: string) => addToast({ title, description, type: "warning" }),
    info: (title: string, description?: string) => addToast({ title, description, type: "info" }),
  };
}