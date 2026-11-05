"use client";

import { formatDate } from "@/lib/ukbankingaudit/v8/boardView";
import type { MajorGapRow } from "@/lib/ukbankingaudit/v8/rcsaCoverageView";

type Props = {
  rows: MajorGapRow[];
  onOpenObligation?: (obligationId: string) => void;
};

/** Thinly covered and uncovered obligations, with who closes each gap and by when. */
export function MajorGapsCard({ rows, onOpenObligation }: Props) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-base font-bold text-slate-900">Major gaps ({rows.length})</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-[12.5px]">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <th scope="col" className="py-2 pr-3">Obligation</th>
              <th scope="col" className="pr-3">Coverage</th>
              <th scope="col" className="pr-3">Owner</th>
              <th scope="col" className="pr-3">Remediation action</th>
              <th scope="col" className="pr-3">Target close</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 align-top">
            {rows.map((row) => (
              <tr key={row.obligationId}>
                <td className="py-2 pr-3">
                  <button
                    type="button"
                    onClick={() => onOpenObligation?.(row.obligationId)}
                    className="font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-2"
                  >
                    {row.citation}
                  </button>
                  <div className="text-[11px] text-slate-500">{row.regulator}</div>
                </td>
                <td className={`pr-3 ${row.controlCount === 0 ? "font-bold text-red-700" : "font-medium text-amber-700"}`}>
                  {row.coverage}
                  <div className="text-[11px] font-normal text-slate-500">
                    {row.controlCount} {row.controlCount === 1 ? "control" : "controls"}
                  </div>
                </td>
                <td className="pr-3 text-slate-700">{row.owner}</td>
                <td className="pr-3 text-slate-700">{row.action ?? "No action recorded"}</td>
                <td className="pr-3 whitespace-nowrap text-slate-700">
                  {row.targetDate ? formatDate(row.targetDate) : "Not set"}
                </td>
                <td className="whitespace-nowrap text-slate-700">{row.status ?? "Not recorded"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
