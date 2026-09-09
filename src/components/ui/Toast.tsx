"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type Toast = { id: number; message: string; variant: "success" | "error" | "info" };
type ToastContextValue = { push: (message: string, variant?: Toast["variant"]) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, variant: Toast["variant"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4 sm:left-auto">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-2 rounded-lg border bg-white p-3 shadow-popover sm:w-auto"
          >
            <ToastIcon variant={t.variant} />
            <p className="flex-1 text-sm text-gray-700">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-gray-300 hover:text-gray-500">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastIcon({ variant }: { variant: Toast["variant"] }) {
  if (variant === "success") return <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-500" size={18} />;
  if (variant === "error") return <XCircle className="mt-0.5 shrink-0 text-red-500" size={18} />;
  return <Info className="mt-0.5 shrink-0 text-brand-500" size={18} />;
}
