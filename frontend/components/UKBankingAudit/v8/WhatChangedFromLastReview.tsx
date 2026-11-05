"use client";

import type { ChangeRow } from "@/lib/ukbankingaudit/v8/boardView";
import { RAG_STYLES } from "./ragTokens";

type Props = {
  items: ChangeRow[];
  onOpenEvidence?: (ref: string) => void;
};

/** How a line was produced: solid dot for a rule, hollow dot for a model. */
function ProvenanceIcon({ derivation, basis }: { derivation: ChangeRow["derivation"]; basis: string }) {
  const tip = `${derivation === "RULE" ? "Rule" : "LLM"}: ${basis}`;
  return (
    <span title={tip} aria-label={tip} role="img" className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
      <span
        className={
          derivation === "RULE"
            ? "h-1.5 w-1.5 rounded-full bg-slate-700"
            : "h-1.5 w-1.5 rounded-full border border-slate-500 bg-transparent"
        }
      />
    </span>
  );
}

/** Only what moved since the last review: at most 6 lines, most material first. */
export function WhatChangedFromLastReview({ items, onOpenEvidence }: Props) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-bold text-slate-900">What Changed from Last Review</h2>
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">No material changes since the last review.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => {
            const rag = RAG_STYLES[item.colour];
            return (
              <li
                key={item.id}
                className={`flex flex-wrap items-center gap-x-3 gap-y-1 rounded-r-lg border-l-[3px] bg-stone-50/80 py-2 pl-3 pr-3 ${rag.rail}`}
              >
                <ProvenanceIcon derivation={item.derivation} basis={item.basis} />
                <p className="min-w-0 flex-1 basis-64 text-[13px] leading-snug text-slate-700">{item.text}</p>
                <button
                  type="button"
                  onClick={() => onOpenEvidence?.(item.evidenceRef)}
                  className="font-mono text-[10px] text-indigo-700 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-900"
                >
                  {item.evidenceRef}
                </button>
                <span className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold ${rag.bg} ${rag.text}`}>
                  {item.categoryLabel}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
