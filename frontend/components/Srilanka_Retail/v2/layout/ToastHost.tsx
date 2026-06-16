"use client";

import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { useApp } from "../context/AppContext";

const ICON = {
  success: CheckCircle2,
  info: Info,
  warn: TriangleAlert,
};
const COLOR = {
  success: "var(--status-healthy)",
  info: "var(--ai-accent)",
  warn: "var(--status-watch)",
};

export function ToastHost() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
      {toasts.map((t) => {
        const Icon = ICON[t.kind];
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex max-w-sm items-start gap-2.5 rounded-lg px-3.5 py-3 lion-toast-in"
            style={{ backgroundColor: "var(--surface-overlay)", border: `1px solid ${COLOR[t.kind]}`, boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }}
          >
            <Icon size={17} style={{ color: COLOR[t.kind] }} className="mt-0.5 shrink-0" />
            <div className="flex-1 text-[13px]" style={{ color: "var(--text-primary)" }}>
              {t.message}
            </div>
            <button type="button" onClick={() => dismissToast(t.id)}>
              <X size={14} style={{ color: "var(--text-secondary)" }} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
