"use client";

import type { ReactNode } from "react";

export type WidgetShellDensity = "primary" | "compact";

export type WidgetShellProps = {
  eyebrow: string;
  title: string;
  /** Right-hand status badge (pre-rendered node — e.g. StatusBadge). */
  badge?: ReactNode;
  /** Optional named source on the card foot (above `footer`). */
  sourceLabel?: string;
  /**
   * Optional footer row inside the card border (e.g. PathToGreenStrip).
   * Separated by border-t; no outer gap — sits flush as the card's last row.
   * Inherits the card band tint via a transparent child override.
   */
  footer?: ReactNode;
  density?: WidgetShellDensity;
  children: ReactNode;
  className?: string;
};

/**
 * Renders a Path-to-Green (or similar) strip as an attached card footer:
 * top border only, no outer margin/gap, child strip loses its detached
 * pill chrome so the card band tint shows through.
 */
export function WidgetCardFooter({ children }: { children: ReactNode }) {
  if (children == null) return null;
  return (
    <div className="border-t border-slate-200/80 [&>div]:mt-0 [&>div]:rounded-none [&>div]:border-0 [&>div]:bg-transparent [&>div]:shadow-none">
      {children}
    </div>
  );
}

/**
 * One consistent card frame: eyebrow, title, right-hand status badge,
 * optional source line, optional footer (Path to Green), children.
 * "primary" = today's padding; "compact" = tighter for Zones B-rail / C.
 */
export function WidgetShell({
  eyebrow,
  title,
  badge,
  sourceLabel,
  footer,
  density = "primary",
  children,
  className = "",
}: WidgetShellProps) {
  const isCompact = density === "compact";
  const pad = isCompact ? "p-3" : "p-4 sm:p-5";
  return (
    <div
      className={`w-full overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-sm ${className}`}
    >
      <div className={pad}>
        <div className={`flex items-start justify-between gap-3 ${isCompact ? "mb-2" : "mb-3"}`}>
          <div className="min-w-0">
            <div
              className={`uppercase tracking-wider font-bold opacity-80 text-slate-600 ${
                isCompact ? "text-[9px]" : "text-[10px]"
              }`}
            >
              {eyebrow}
            </div>
            <h3
              className={`font-bold text-slate-900 mt-0.5 ${
                isCompact ? "text-sm" : "text-base sm:text-lg"
              }`}
            >
              {title}
            </h3>
          </div>
          {badge ? <div className="shrink-0">{badge}</div> : null}
        </div>
        {children}
        {sourceLabel ? (
          <div className={`border-t border-slate-200/80 ${isCompact ? "mt-2 pt-1.5" : "mt-3 pt-1.5"}`}>
            <span className="block text-[10px] leading-snug text-slate-500">{sourceLabel}</span>
          </div>
        ) : null}
      </div>
      <WidgetCardFooter>{footer}</WidgetCardFooter>
    </div>
  );
}
