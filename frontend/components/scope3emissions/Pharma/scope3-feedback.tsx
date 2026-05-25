"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type Scope3ToastVariant = "success" | "info" | "warning";

type ToastItem = { id: string; message: string; variant: Scope3ToastVariant };

type ToastContextValue = {
  pushToast: (message: string, variant?: Scope3ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useScope3Toast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useScope3Toast must be used within Scope3ToastProvider");
  }
  return ctx;
}

export function Scope3ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((message: string, variant: Scope3ToastVariant = "info") => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);
  const lastAnnounced = toasts[toasts.length - 1]?.message ?? "";

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {lastAnnounced}
      </div>
      <ol
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex max-w-[min(100vw-2rem,22rem)] flex-col gap-2 p-0"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <li
            key={t.id}
            className={`pointer-events-auto rounded-xl border px-3 py-2.5 text-sm shadow-lg ring-1 ring-slate-900/[0.06] backdrop-blur-[2px] dark:ring-white/[0.08] ${
              t.variant === "success"
                ? "border-[var(--success)] bg-[var(--success-bg)] text-[var(--success)]"
                : t.variant === "warning"
                  ? "border-[var(--warning)] bg-[var(--warning-bg)] text-[var(--warning)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]"
            }`}
          >
            {t.message}
          </li>
        ))}
      </ol>
    </ToastContext.Provider>
  );
}
