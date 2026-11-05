"use client";

import { formatDate, type SpotlightRow } from "@/lib/ukbankingaudit/v8/boardView";

const KIND_LABEL: Record<SpotlightRow["kind"], string> = {
  ram: "Risk appetite",
  control: "Critical control",
  incident: "Incident",
  ratingMove: "Rating move",
};

const LIMIT = 5;

/** The few items that matter most this period, ranked by the rating engine. One row each. */
export function RedSpotlight({
  rows,
  onOpenPath,
  onShowAll,
}: {
  rows: SpotlightRow[];
  onOpenPath: (row: SpotlightRow) => void;
  onShowAll: () => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-base font-bold text-slate-900">Red Spotlight</h2>
        {rows.length > LIMIT ? (
          <button
            type="button"
            onClick={onShowAll}
            className="text-[11.5px] font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-900"
          >
            Show all ({rows.length})
          </button>
        ) : null}
      </div>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">Nothing is outside appetite this period.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-[11.5px] leading-snug">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                <th scope="col" className="w-[25%] py-1.5 pl-3 pr-3 font-semibold">Item</th>
                <th scope="col" className="w-[15%] py-1.5 pr-3 font-semibold">Position</th>
                <th scope="col" className="w-[24%] py-1.5 pr-3 font-semibold">Cause</th>
                <th scope="col" className="w-[11%] py-1.5 pr-3 font-semibold">Owner</th>
                <th scope="col" className="w-[8%] py-1.5 pr-3 font-semibold">Target</th>
                <th scope="col" className="w-[17%] py-1.5 pr-3 font-semibold">2nd line and committee</th>
                <th scope="col" className="py-1.5 font-semibold"><span className="sr-only">Path to green</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, LIMIT).map((row) => (
                <tr key={row.id} className="border-b border-slate-100 align-top last:border-b-0">
                  <td className="border-l-[3px] border-l-red-500 py-2 pl-3 pr-3">
                    <div className="font-bold text-slate-900">{row.name}</div>
                    <div className="text-[10px] text-slate-500">
                      {KIND_LABEL[row.kind]} · {row.categoryLabel}
                    </div>
                  </td>
                  <td className="py-2 pr-3 font-semibold text-slate-800">{row.measure.replace(/\bSev(\d)\b/, "Sev-$1")}</td>
                  <td className="py-2 pr-3 text-slate-700">{row.cause ?? "None recorded"}</td>
                  <td className="py-2 pr-3 text-slate-700">{row.owner ?? "None"}</td>
                  <td className="whitespace-nowrap py-2 pr-3 text-slate-700">
                    {row.targetDate ? (
                      formatDate(row.targetDate)
                    ) : (
                      <span className="rounded bg-red-600 px-1.5 py-px text-[10px] font-bold text-white">No path</span>
                    )}
                    {row.overdue ? (
                      <div className="mt-0.5 text-[10px] font-bold text-red-700">Overdue</div>
                    ) : null}
                  </td>
                  <td className="py-2 pr-3 text-slate-700">
                    <div className="font-semibold">{row.secondLine ?? "None"}</div>
                    {row.committee ? <div className="text-[10px] text-slate-500">{row.committee}</div> : null}
                  </td>
                  <td className="py-2 text-right">
                    {row.kind !== "ratingMove" ? (
                      <button
                        type="button"
                        onClick={() => onOpenPath(row)}
                        className="whitespace-nowrap rounded-md border border-slate-300 bg-white px-2 py-1 text-[10.5px] font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        {row.hasPath ? "Open" : "Add path"}
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
