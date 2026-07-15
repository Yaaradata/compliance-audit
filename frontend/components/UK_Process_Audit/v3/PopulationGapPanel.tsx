"use client";

import type { UkPopulationCoverageCheck } from "@/lib/UK_Process_Audit/v3";

export function PopulationGapPanel({ checks }: { checks: UkPopulationCoverageCheck[] }) {
  return (
    <section className="overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Population behind the claim</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Compares synthesised management coverage statements to observed sample/population math
          </p>
        </div>
        <span className="rounded-md bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-800 ring-1 ring-amber-200">
          Synthetic claims · labelled
        </span>
      </div>
      <div className="divide-y divide-slate-100">
        {checks.slice(0, 10).map((c) => (
          <article key={c.controlId} className="px-5 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-semibold text-slate-900">{c.controlId}</span>
              <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold text-orange-900 ring-1 ring-orange-200">
                EVIDENCE_GAP_OBSERVED
              </span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                {c.domainId}
              </span>
            </div>
            <p className="mt-1 text-[12px] leading-snug text-slate-600">{c.claimText}</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
              <Metric label="Claimed" value={`${c.claimedCoveragePct.toFixed(1)}%`} />
              <Metric label="Observed" value={`${c.observedCoveragePct.toFixed(1)}%`} />
              <Metric label="Population" value={c.population.toLocaleString("en-GB")} />
              <Metric label="Gap (uncovered)" value={c.gap.toLocaleString("en-GB")} />
            </div>
          </article>
        ))}
        {checks.length === 0 ? (
          <div className="px-5 py-6 text-[12px] text-slate-500">
            No population evidence gaps observed this cycle.
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-slate-50 px-2 py-1.5 ring-1 ring-slate-100">
      <div className="text-[10px] text-slate-500">{label}</div>
      <div className="font-semibold tabular-nums text-slate-900">{value}</div>
    </div>
  );
}
