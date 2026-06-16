"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

export function SlideOver({
  title,
  subtitle,
  width = 480,
  onClose,
  zIndex = 50,
  children,
  footer,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  width?: number;
  onClose: () => void;
  zIndex?: number;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="fixed inset-0" style={{ zIndex }}>
      <div className="absolute inset-0 lion-fade-in" style={{ backgroundColor: "rgba(1,4,9,0.55)" }} onClick={onClose} />
      <aside
        className="absolute right-0 top-0 flex h-full flex-col lion-slide-in"
        style={{ width, maxWidth: "94vw", backgroundColor: "var(--surface-overlay)", borderLeft: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <div>
            <div className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
              {title}
            </div>
            {subtitle ? (
              <div className="mt-0.5 text-[12px]" style={{ color: "var(--text-secondary)" }}>
                {subtitle}
              </div>
            ) : null}
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 transition-colors hover:brightness-150">
            <X size={18} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>
        <div className="lion-scroll flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <div className="px-5 py-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            {footer}
          </div>
        ) : null}
      </aside>
    </div>
  );
}

export function Modal({
  title,
  subtitle,
  onClose,
  width = 720,
  children,
  footer,
  zIndex = 60,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  onClose: () => void;
  width?: number;
  children: ReactNode;
  footer?: ReactNode;
  zIndex?: number;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-6" style={{ zIndex }}>
      <div className="absolute inset-0 lion-fade-in" style={{ backgroundColor: "rgba(1,4,9,0.6)" }} onClick={onClose} />
      <div
        className="relative flex max-h-[88vh] flex-col overflow-hidden rounded-xl lion-modal-in"
        style={{ width, maxWidth: "95vw", backgroundColor: "var(--surface-overlay)", border: "1px solid var(--border-subtle)", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}
      >
        <div className="flex items-start justify-between gap-3 px-6 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <div>
            <div className="text-[16px] font-semibold" style={{ color: "var(--text-primary)" }}>
              {title}
            </div>
            {subtitle ? (
              <div className="mt-0.5 text-[12px]" style={{ color: "var(--text-secondary)" }}>
                {subtitle}
              </div>
            ) : null}
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 transition-colors hover:brightness-150">
            <X size={18} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>
        <div className="lion-scroll flex-1 overflow-y-auto">{children}</div>
        {footer ? (
          <div className="px-6 py-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
