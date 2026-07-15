"use client";

import { buildStillnessRows } from "@/lib/ukbankingaudit/v5/whatChangedV5";
import { RAG_STYLES } from "./ragTokens";

/**
 * The mirror of "What Changed": what has stood still. Sorted by DURATION descending
 * — the oldest stillness at the top, not the worst RAG — because the risk lives in
 * how long a known position has been left untouched, not in its colour today.
 */
export function WhatHasNotChanged() {
  const rows = buildStillnessRows();

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4">
        <h2 className="text-base font-bold text-slate-900">What Has Not Changed</h2>
      </header>

      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">
          No domain has held a non-green status for more than two cycles.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((row) => {
            const band = row.status === "RED" ? "red" : row.status === "AMBER" ? "amber" : "green";
            const rag = RAG_STYLES[band];
            return (
              <li
                key={row.id}
                className={`rounded-r-lg border-l-[3px] bg-stone-50/80 py-2.5 pl-3.5 pr-3 ${rag.rail}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="flex-1 text-[13px] leading-relaxed text-slate-700">{row.text}</p>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold ${rag.bg} ${rag.text}`}
                  >
                    {row.domainName}
                  </span>
                </div>
                <p className="mt-1.5 text-[10.5px] font-medium uppercase tracking-wide text-slate-400">
                  Standing {row.durationDays} days
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
