"use client";

/**
 * UK Board v2 — presentation rules for the Board member view (R4–R6).
 * White cards with a 1px neutral border; status colour only on pills, a 3px left border and
 * chart zones; numbers in dark ink, right-aligned, tabular; comparators muted in a fixed column.
 * The figure registry warns (development only) when one figure id renders twice on a tab.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { deltaText, STATUS_WORD, type Delta, type MeasureStatus } from "@/lib/ukboard/v2/boardStore";
import { focus, Pill, type Tone } from "./ui";

export const STATUS_TONE: Record<MeasureStatus, Tone> = { red: "red", amber: "amber", projected: "amber", within: "green", unconfirmed: "grey" };
const RAIL: Record<Tone, string> = { red: "border-l-red-500", amber: "border-l-amber-500", green: "border-l-slate-200", grey: "border-l-slate-300" };

/* ── Figure registry ─────────────────────────────────────────────────── */

const Registry = createContext<Map<string, number> | null>(null);

export function FigureRegistry({ tab, children }: { tab: string; children: ReactNode }) {
  // The tab body remounts per persona and tab (keyed main), so one map per mount is per tab.
  const [map] = useState(() => new Map<string, number>());
  return (
    <Registry.Provider value={map} key={tab}>
      {children}
    </Registry.Provider>
  );
}

/** Register the figures a section renders; warns in development if a figure repeats on the tab. */
export function useFigures(ids: string[]) {
  const map = useContext(Registry);
  const key = ids.join("|");
  useEffect(() => {
    if (!map || process.env.NODE_ENV !== "development") return;
    const list = key.split("|").filter(Boolean);
    for (const id of list) {
      const n = (map.get(id) ?? 0) + 1;
      map.set(id, n);
      if (n > 1) console.warn(`[UK Board] figure "${id}" rendered ${n} times on this tab`);
    }
    if (typeof window !== "undefined") (window as unknown as { __ukbFigures?: Map<string, number> }).__ukbFigures = map;
    return () => {
      for (const id of list) map.set(id, (map.get(id) ?? 1) - 1);
    };
  }, [map, key]);
}

/* ── Cards ───────────────────────────────────────────────────────────── */

/** White card; optional status rail (red or amber only). */
export function BoardCard({ title, right, rail, children, className = "", id }: { title?: string; right?: ReactNode; rail?: Tone; children: ReactNode; className?: string; id?: string }) {
  const railCls = rail === "red" || rail === "amber" ? `border-l-[3px] ${RAIL[rail]}` : "";
  return (
    <section id={id} className={`rounded-xl border border-slate-200 bg-white px-4 pb-3 ${railCls} ${className}`}>
      {title ? <CardHeader title={title} right={right} /> : <div className="h-3" />}
      {children}
    </section>
  );
}

export function CardHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="flex h-10 items-center justify-between gap-3">
      <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      {right}
    </div>
  );
}

export function LinkMore({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className={`rounded text-xs font-semibold text-indigo-700 hover:underline ${focus}`}>
      {label} ›
    </button>
  );
}

/* ── Numbers ─────────────────────────────────────────────────────────── */

export function DeltaMark({ d }: { d?: Delta }) {
  if (!d || d.value === 0) return <span className="text-xs text-slate-400">—</span>;
  return <span className={`whitespace-nowrap text-xs font-semibold tabular-nums ${d.worse ? "text-red-600" : "text-emerald-700"}`}>{deltaText(d)}</span>;
}

export function StatusPill({ status, label }: { status: MeasureStatus; label?: string }) {
  return <Pill tone={STATUS_TONE[status]} outline={status === "projected"} label={label ?? STATUS_WORD[status]} />;
}

/** Label left · value right (dark, tabular) · comparator muted in a fixed column. */
export function StatRow({ label, value, comparator, rail, right, onClick }: { label: string; value: string; comparator?: string; rail?: Tone; right?: ReactNode; onClick?: (el: HTMLElement) => void }) {
  const railCls = rail === "red" || rail === "amber" ? `border-l-[3px] pl-2.5 ${RAIL[rail]}` : "pl-0";
  const body = (
    <span className={`grid min-h-10 grid-cols-[minmax(0,1fr)_auto_minmax(72px,0.9fr)] items-center gap-3 border-t border-slate-100 py-1 text-[13px] leading-snug ${railCls}`}>
      <span className="text-slate-700">{label}</span>
      <b className="text-right font-semibold tabular-nums text-slate-900">{value}</b>
      <span className="flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-0.5 text-xs text-slate-500">
        <span>{comparator}</span>
        {right}
      </span>
    </span>
  );
  return onClick ? (
    <button type="button" onClick={(e) => onClick(e.currentTarget)} className={`block w-full text-left hover:bg-slate-50 ${focus}`}>
      {body}
    </button>
  ) : (
    body
  );
}

/** One-line item with an optional left rail and a right slot (no figures implied). */
export function LineItem({ text, detail, rail, right, onClick }: { text: string; detail?: string; rail?: Tone; right?: ReactNode; onClick?: (el: HTMLElement) => void }) {
  const railCls = rail === "red" || rail === "amber" ? `border-l-[3px] pl-2.5 ${RAIL[rail]}` : "";
  const body = (
    <span className={`flex min-h-10 items-center justify-between gap-3 border-t border-slate-100 py-1 text-[13px] leading-snug ${railCls}`}>
      <span className="min-w-0 text-slate-800">
        {text}
        {detail ? <span className="text-slate-500"> · {detail}</span> : null}
      </span>
      {right}
    </span>
  );
  return onClick ? (
    <button type="button" onClick={(e) => onClick(e.currentTarget)} className={`block w-full text-left hover:bg-slate-50 ${focus}`}>
      {body}
    </button>
  ) : (
    body
  );
}
