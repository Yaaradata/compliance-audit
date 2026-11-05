"use client";

import type { ReactNode } from "react";
import type { ControlStrip, IncidentStrip, RiskAppetiteStrip } from "@/lib/ukbankingaudit/v8/boardView";

type Props = {
  appetite: RiskAppetiteStrip;
  controls: ControlStrip;
  incidents: IncidentStrip;
  onOpenAppetite: () => void;
  onOpenControls: () => void;
  onOpenIncidents: () => void;
};

function StripCard({ title, onClick, children }: { title: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-full w-full flex-col rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
    >
      <span className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</span>
      {children}
    </button>
  );
}

/** Stacked status bar: 2px gaps between segments, with counts in text beside it. */
function CategoryBar({ row }: { row: RiskAppetiteStrip["byCategory"][number] }) {
  const parts = [
    { key: "green", count: row.green, className: "bg-emerald-500" },
    { key: "amber", count: row.amber, className: "bg-amber-500" },
    { key: "red", count: row.red, className: "bg-red-600" },
  ].filter((part) => part.count > 0);
  const summary = `${row.label}: ${row.green} green, ${row.amber} amber, ${row.red} red`;
  const flagged = [
    ...(row.red ? [`${row.red} red`] : []),
    ...(row.amber ? [`${row.amber} amber`] : []),
  ].join(" · ");
  return (
    <div title={summary} aria-label={summary} role="img" className="grid grid-cols-[minmax(0,1fr)_5.5rem_4.25rem] items-center gap-2">
      <span className="truncate text-[11px] text-slate-600">{row.label}</span>
      <span className="flex h-2 gap-0.5">
        {parts.map((part) => (
          <span key={part.key} className={`rounded-sm ${part.className}`} style={{ flexGrow: part.count }} />
        ))}
      </span>
      <span className="text-right text-[10px] font-medium text-slate-500">{flagged || "all green"}</span>
    </div>
  );
}

const CONTROL_MOVE = {
  down: { arrow: "▼", className: "text-red-700" },
  up: { arrow: "▲", className: "text-emerald-700" },
  flat: { arrow: "▬", className: "text-slate-500" },
};

/** Three headline strips: appetite, control effectiveness and incidents. */
export function RiskAtAGlance({
  appetite,
  controls,
  incidents,
  onOpenAppetite,
  onOpenControls,
  onOpenIncidents,
}: Props) {
  const move = CONTROL_MOVE[controls.direction];
  return (
    <section aria-label="Risk at a glance">
      <h2 className="mb-3 text-base font-bold text-slate-900">Risk at a Glance</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StripCard title="Risk appetite" onClick={onOpenAppetite}>
          <span className="text-sm font-bold text-slate-900">
            {appetite.green} green · {appetite.amber} amber · {appetite.red} red of {appetite.total} metrics
          </span>
          <span className="mt-3 flex flex-col gap-1">
            {appetite.byCategory.map((row) => (
              <CategoryBar key={row.categoryId} row={row} />
            ))}
          </span>
        </StripCard>

        <StripCard title="Control effectiveness" onClick={onOpenControls}>
          <span className="text-sm font-bold text-slate-900">
            Critical controls effective: {controls.pct}%{" "}
            {controls.prevPct !== null ? (
              <span className={`font-semibold ${move.className}`}>
                ({move.arrow} {controls.direction === "flat" ? "no change at" : "from"} {controls.prevPct}%)
              </span>
            ) : null}
          </span>
          <span className="mt-2 text-xs text-slate-600">
            Lowest: {controls.worstLabel} at {controls.worstPct}%
          </span>
          {controls.evidenceWarnings.map((warning) => (
            <span key={warning} className="mt-2 text-[11px] font-medium text-amber-800">
              ⚠ {warning}
            </span>
          ))}
        </StripCard>

        <StripCard title="Incidents" onClick={onOpenIncidents}>
          <span className="text-sm font-bold text-slate-900">
            Sev-1: {incidents.sevOne} · Sev-2: {incidents.sevTwo} open or raised this {incidents.cadenceWord}
          </span>
          {incidents.topTitle ? (
            <span className="mt-2 text-xs text-slate-600">Top: {incidents.topTitle}</span>
          ) : (
            <span className="mt-2 text-xs text-slate-600">No Sev-1 or Sev-2 incidents</span>
          )}
        </StripCard>
      </div>
    </section>
  );
}
