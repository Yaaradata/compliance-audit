"use client";

import { formatDate, type SpotlightRow } from "@/lib/ukbankingaudit/v8/boardView";

const KIND_LABEL: Record<SpotlightRow["kind"], string> = {
  ram: "Risk appetite",
  control: "Critical control",
  incident: "Incident",
  ratingMove: "Rating move",
};

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="text-xs text-slate-700">{children}</dd>
    </div>
  );
}

/** The few items that matter most this period, ranked by the rating engine. */
export function RedSpotlight({ rows, onOpenPath }: { rows: SpotlightRow[]; onOpenPath: (row: SpotlightRow) => void }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-bold text-slate-900">Red Spotlight</h2>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">Nothing is outside appetite this period.</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {rows.map((row) => (
            <li key={row.id} className="rounded-r-lg border-l-[3px] border-l-red-500 bg-stone-50/80 py-3 pl-3.5 pr-3">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3 className="text-[13px] font-bold text-slate-900">{row.name}</h3>
                <span className="rounded bg-slate-200 px-1.5 py-px text-[10px] font-semibold text-slate-600">
                  {KIND_LABEL[row.kind]}
                </span>
                <span className="text-[11px] text-slate-500">{row.categoryLabel}</span>
                {!row.hasPath ? (
                  <span className="rounded bg-red-600 px-1.5 py-px text-[10px] font-bold text-white">
                    No path to green
                  </span>
                ) : null}
                {row.overdue ? (
                  <span className="rounded bg-red-100 px-1.5 py-px text-[10px] font-bold text-red-700">Overdue</span>
                ) : null}
              </div>
              <p className="mt-1 text-[13px] font-semibold text-slate-800">{row.measure}</p>
              <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2 xl:grid-cols-5">
                {row.cause ? <Fact label="Cause">{row.cause}</Fact> : null}
                {row.owner ? <Fact label="Owner">{row.owner}</Fact> : null}
                {row.targetDate ? <Fact label="Path to green">{formatDate(row.targetDate)}</Fact> : null}
                {row.secondLine ? <Fact label="2nd line">{row.secondLine}</Fact> : null}
                {row.committee ? <Fact label="Committee">{row.committee}</Fact> : null}
              </dl>
              {row.kind !== "ratingMove" ? (
                <button
                  type="button"
                  onClick={() => onOpenPath(row)}
                  className="mt-2 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {row.hasPath ? "Open path to green" : "Add path to green"}
                </button>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
