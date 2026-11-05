"use client";

import { formatDate } from "@/lib/ukbankingaudit/v8/boardView";
import type { OwnedControlRow, OwnedIncidentRow } from "@/lib/ukbankingaudit/v8/reasonableStepsView";
import type { RamRow } from "@/lib/ukbankingaudit/v8/riskAppetiteView";
import type { ControlResult, IncidentControlLink } from "@/lib/ukbankingaudit/v8/types";
import { RAG_STYLES } from "../ragTokens";

const CARD = "rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden";
const HEADER = "px-5 py-3 border-b border-slate-100";

const TREND = {
  worse: { arrow: "▲", className: "text-red-700", label: "Worse than last period" },
  better: { arrow: "▼", className: "text-emerald-700", label: "Better than last period" },
  flat: { arrow: "▬", className: "text-slate-500", label: "No change from last period" },
};

const RESULT: Record<ControlResult, { label: string; className: string }> = {
  effective: { label: "Effective", className: "text-emerald-700" },
  partially_effective: { label: "Partially effective", className: "text-amber-700" },
  not_effective: { label: "Not effective", className: "font-bold text-red-700" },
};

const WORKED: Record<IncidentControlLink["controlWorked"], { label: string; className: string }> = {
  worked: { label: "Worked", className: "text-emerald-700" },
  partial: { label: "Partially", className: "text-amber-700" },
  failed: { label: "Failed", className: "font-bold text-red-700" },
};

/** Metrics this SMF owns. Red and amber rows open the Path to Green drawer. */
export function MyRiskAppetiteCard({ rows, onOpenPath }: { rows: RamRow[]; onOpenPath: (row: RamRow) => void }) {
  return (
    <section className={CARD}>
      <div className={HEADER}>
        <h3 className="text-sm font-semibold">My risk appetite metrics ({rows.length})</h3>
      </div>
      <ul className="divide-y divide-slate-100">
        {rows.map((row) => {
          const chip = RAG_STYLES[row.status];
          const trend = TREND[row.trend];
          return (
            <li key={row.id} className="flex items-center gap-2 px-5 py-2 text-xs">
              <div className="min-w-0 flex-1">
                {row.status === "green" ? (
                  <span className="font-medium text-slate-900">{row.name}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpenPath(row)}
                    className="text-left font-medium text-indigo-700 underline decoration-indigo-300 underline-offset-2"
                  >
                    {row.name}
                  </button>
                )}
                <div className="text-[11px] text-slate-500">
                  {row.valueText} vs tolerance {row.toleranceText}
                </div>
              </div>
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${chip.badge} ${chip.badgeText}`}>
                {row.status}
              </span>
              <span title={trend.label} aria-label={trend.label} className={`font-bold ${trend.className}`}>
                {trend.arrow}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Sev-1 and Sev-2 incidents linked to controls this SMF owns. */
export function MyIncidentsCard({ rows }: { rows: OwnedIncidentRow[] }) {
  return (
    <section className={CARD}>
      <div className={HEADER}>
        <h3 className="text-sm font-semibold">Incidents on my controls ({rows.length})</h3>
      </div>
      <ul className="divide-y divide-slate-100">
        {rows.map((row) => (
          <li key={row.id} className="px-5 py-2.5 text-xs text-slate-700">
            <div className="flex flex-wrap items-center gap-x-2">
              <span className="font-bold text-slate-900">{row.severity}</span>
              <span className="font-medium text-slate-900">{row.title}</span>
            </div>
            <div className="mt-0.5 text-[11px] text-slate-500">
              {row.date} · <span className="capitalize">{row.status}</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3">
              {row.controls.map((control) => (
                <span key={control.controlId}>
                  <span className="font-mono text-[11px] text-slate-600">{control.controlId}</span> Control worked?{" "}
                  <span className={WORKED[control.worked].className}>{WORKED[control.worked].label}</span>
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Owned controls under the Accountability Boundary, critical first. */
export function OwnedControlsList({ rows }: { rows: OwnedControlRow[] }) {
  return (
    <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
      {rows.map((row) => {
        const result = row.result ? RESULT[row.result] : null;
        return (
          <li key={row.id} className="px-2.5 py-2 text-[11px] text-slate-600">
            <div className="flex flex-wrap items-center gap-x-1.5">
              <span className="font-mono text-slate-500">{row.id}</span>
              <span className="font-medium text-slate-900">{row.name}</span>
              {row.tier === "critical" ? (
                <span className="rounded bg-slate-200 px-1 text-[10px] font-semibold text-slate-700">Critical</span>
              ) : null}
            </div>
            <div className="mt-0.5">
              <span className={result?.className ?? "text-slate-500"}>{result?.label ?? "No result"}</span>
              {row.lastTested ? ` · last tested ${formatDate(row.lastTested)}` : ""}
              {row.nextDue ? (
                <span className={row.overdue ? "font-semibold text-red-700" : undefined}>
                  {` · next due ${formatDate(row.nextDue)}`}
                  {row.overdue ? " (overdue)" : ""}
                </span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
