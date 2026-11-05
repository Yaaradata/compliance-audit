"use client";

import { formatDate, type StandingRow } from "@/lib/ukbankingaudit/v8/boardView";
import { CappedList } from "./CappedList";
import { RAG_STYLES } from "./ragTokens";

/**
 * The mirror of "What Changed": what has stood still. Sorted by duration, longest
 * first, because the concern is how long a known position has been left untouched.
 */
export function WhatHasNotChanged({ rows }: { rows: StandingRow[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-bold text-slate-900">What Has Not Changed</h2>
      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">
          No domain has held a non-green status for more than two cycles.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          <CappedList inList>
          {rows.map((row) => {
            const rag = RAG_STYLES[row.colour];
            return (
              <li
                key={row.id}
                className={`rounded-r-lg border-l-[3px] bg-stone-50/80 py-2.5 pl-3.5 pr-3 ${rag.rail}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="flex-1 text-[13px] leading-relaxed text-slate-700">{row.text}</p>
                  <span className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold ${rag.bg} ${rag.text}`}>
                    {row.categoryLabel}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
                  <span className="font-medium uppercase tracking-wide text-slate-400">
                    Standing {row.durationDays} days
                  </span>
                  {row.targetDate ? (
                    <span>Next path to green target: {formatDate(row.targetDate)}</span>
                  ) : (
                    <span className="rounded bg-red-600 px-1.5 py-px text-[10px] font-bold text-white">
                      No path to green
                    </span>
                  )}
                  {row.overdue ? (
                    <span className="rounded bg-red-100 px-1.5 py-px text-[10px] font-bold text-red-700">Overdue</span>
                  ) : null}
                  {row.committee ? <span>{row.committee}</span> : null}
                </div>
              </li>
            );
          })}
          </CappedList>
        </ul>
      )}
    </section>
  );
}
