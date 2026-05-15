'use client';

import React, { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';

export type RegIntelToastType = 'success' | 'info' | 'warning' | 'error';

export interface RegIntelToastItem {
  id: string;
  type: RegIntelToastType;
  message: string;
}

interface RegIntelToastContextValue {
  pushToast: (t: { type: RegIntelToastType; message: string }) => void;
}

const RegIntelToastContext = createContext<RegIntelToastContextValue | null>(null);

const TOAST_STYLES: Record<RegIntelToastType, string> = {
  success: 'border-emerald-300 bg-emerald-50 text-emerald-950',
  info: 'border-sky-300 bg-sky-50 text-sky-950',
  warning: 'border-amber-300 bg-amber-50 text-amber-950',
  error: 'border-rose-300 bg-rose-50 text-rose-950',
};

export function RegIntelToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<RegIntelToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const remove = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t) clearTimeout(t);
    timers.current.delete(id);
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const pushToast = useCallback(
    ({ type, message }: { type: RegIntelToastType; message: string }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setToasts((prev) => {
        const next = [...prev, { id, type, message }];
        if (next.length <= 3) return next;
        const drop = next[0];
        const tid = timers.current.get(drop.id);
        if (tid) clearTimeout(tid);
        timers.current.delete(drop.id);
        return next.slice(1);
      });
      const tid = setTimeout(() => remove(id), 3000);
      timers.current.set(id, tid);
    },
    [remove]
  );

  useEffect(() => {
    return () => {
      timers.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <RegIntelToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {toasts.map((t) => (
          <ToastRow key={t.id} toast={t} onDismiss={() => remove(t.id)} />
        ))}
      </div>
    </RegIntelToastContext.Provider>
  );
}

function ToastRow({ toast, onDismiss }: { toast: RegIntelToastItem; onDismiss: () => void }) {
  const baseId = useId();
  return (
    <div
      role="status"
      id={`${baseId}-${toast.id}`}
      className={`pointer-events-auto ori-reg-intel-toast-enter rounded-lg border px-3 py-2.5 text-sm font-medium shadow-lg ${TOAST_STYLES[toast.type]}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="leading-snug">{toast.message}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 flex min-h-[44px] min-w-[44px] items-center justify-center rounded p-0.5 text-slate-500 hover:bg-black/5 hover:text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function useRegIntelToast(): RegIntelToastContextValue {
  const ctx = useContext(RegIntelToastContext);
  if (!ctx) {
    throw new Error('useRegIntelToast must be used within RegIntelToastProvider');
  }
  return ctx;
}
