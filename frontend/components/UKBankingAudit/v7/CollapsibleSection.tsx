"use client";

import { useId, useState, type ReactNode } from "react";

export type CollapsibleSectionTone = "red" | "amber" | "green" | "neutral" | "slate";

export type CollapsibleSectionProps = {
  title: string;
  /** Short right-aligned string shown while collapsed (e.g. "gap +400/wk"). */
  summary: string;
  defaultOpen?: boolean;
  /**
   * When true, content is always shown and the header is not a toggle
   * (no close). Use for rail cards that must stay expanded.
   */
  alwaysOpen?: boolean;
  children: ReactNode;
  /** Optional band for the left edge. */
  tone?: CollapsibleSectionTone;
  className?: string;
  /** Extra classes applied only while expanded (e.g. `md:col-span-2` in a 2-col grid). */
  openClassName?: string;
};

const TONE_EDGE: Record<CollapsibleSectionTone, string> = {
  red: "border-l-rose-500",
  amber: "border-l-amber-500",
  green: "border-l-emerald-500",
  neutral: "border-l-slate-300",
  slate: "border-l-slate-300",
};

/**
 * Titled section that collapses to a single row and expands on click.
 * Collapsed row always shows `summary` so the headline number stays visible.
 * Title + summary wrap (no ellipsis) — short summaries belong in the caller.
 * Pass `alwaysOpen` to pin the section open with no close control.
 */
export function CollapsibleSection({
  title,
  summary,
  defaultOpen = false,
  alwaysOpen = false,
  children,
  tone = "slate",
  className = "",
  openClassName = "",
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen || alwaysOpen);
  const panelId = useId();
  const isOpen = alwaysOpen || open;

  return (
    <div
      className={`min-w-0 overflow-hidden rounded-lg border border-slate-200 border-l-4 bg-white ${TONE_EDGE[tone]} ${
        isOpen && openClassName ? openClassName : ""
      } ${className}`}
    >
      {alwaysOpen ? (
        <div className="flex w-full min-w-0 items-start gap-2 px-2.5 py-1.5 text-left">
          <div className="min-w-0 flex-1 text-[11px] font-semibold leading-snug text-slate-600">
            {title}
          </div>
          <span className="min-w-0 max-w-[50%] shrink-0 text-right text-sm font-bold leading-snug tabular-nums text-slate-900">
            {summary}
          </span>
        </div>
      ) : (
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full min-w-0 items-start gap-2 px-2.5 py-1.5 text-left hover:bg-slate-50/80"
        >
          <div className="min-w-0 flex-1 text-[11px] font-semibold leading-snug text-slate-600">
            {title}
          </div>
          <div className="flex min-w-0 max-w-[50%] shrink-0 items-start gap-1">
            <span className="min-w-0 text-right text-sm font-bold leading-snug tabular-nums text-slate-900">
              {summary}
            </span>
            <span
              className={`mt-0.5 shrink-0 text-[10px] text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
              aria-hidden
            >
              ▾
            </span>
          </div>
        </button>
      )}
      {isOpen ? (
        <div id={panelId} className="min-w-0 border-t border-slate-100 px-2.5 py-2.5">
          {children}
        </div>
      ) : null}
    </div>
  );
}
