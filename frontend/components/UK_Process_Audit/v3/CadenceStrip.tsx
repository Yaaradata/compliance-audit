"use client";

import type { CadenceStatus, UkCadenceRollup } from "@/lib/UK_Process_Audit/v3";

const STATUS_STYLE: Record<CadenceStatus, string> = {
  UNARMED: "bg-[repeating-linear-gradient(135deg,#e2e8f0_0_6px,#f8fafc_6px_12px)] text-slate-700 ring-slate-300",
  OVERDUE: "bg-amber-50 text-amber-900 ring-amber-200",
  DUE_SOON: "bg-sky-50 text-sky-900 ring-sky-200",
  CURRENT: "bg-emerald-50 text-emerald-900 ring-emerald-200",
  ARMED: "bg-slate-50 text-slate-800 ring-slate-200",
};

export function CadenceStatusPill({ status }: { status: CadenceStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide ring-1 ${STATUS_STYLE[status]}`}
    >
      {status}
    </span>
  );
}

export function CadenceStrip({
  rollup,
  asOf,
}: {
  rollup: UkCadenceRollup;
  asOf: string;
}) {
  return (
    <section className="overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Testing cadence arming</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Evaluates <code className="text-[11px]">testingFrequency</code> against a real last-tested
            date (as of {asOf}). UNARMED = no confirmed cadence — not a fail.
          </p>
        </div>
        <span className="rounded-md bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-800 ring-1 ring-amber-200">
          Synthetic demo dates · labelled
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 xl:grid-cols-6">
        <Stat label="In scope" value={rollup.total} />
        <Stat label="Armed" value={rollup.armed} hint="Has evaluable cadence" />
        <Stat
          label="Unarmed"
          value={rollup.unarmed}
          hint="Hatched — unknown ≠ failed"
          hatched
        />
        <Stat label="Overdue" value={rollup.overdue} tone="amber" />
        <Stat label="Due soon" value={rollup.dueSoon} tone="sky" />
        <Stat label="Current" value={rollup.current} tone="emerald" />
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
  hatched,
}: {
  label: string;
  value: number;
  hint?: string;
  tone?: "amber" | "sky" | "emerald";
  hatched?: boolean;
}) {
  const toneClass =
    tone === "amber"
      ? "text-amber-700"
      : tone === "sky"
        ? "text-sky-700"
        : tone === "emerald"
          ? "text-emerald-700"
          : "text-slate-900";
  return (
    <div
      className={`rounded-lg px-3 py-2.5 ring-1 ring-slate-200 ${
        hatched
          ? "bg-[repeating-linear-gradient(135deg,#e2e8f0_0_6px,#f8fafc_6px_12px)]"
          : "bg-slate-50"
      }`}
    >
      <div className="text-[11px] font-medium text-slate-500">{label}</div>
      <div className={`mt-0.5 text-xl font-semibold tabular-nums ${toneClass}`}>{value}</div>
      {hint ? <div className="mt-0.5 text-[10px] text-slate-400">{hint}</div> : null}
    </div>
  );
}
