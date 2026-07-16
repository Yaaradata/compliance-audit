"use client";

import type { ChangeRowV5 } from "@/lib/ukbankingaudit/v5/whatChangedV5";
import { ClaimLine } from "./ClaimLine";
import { RAG_STYLES } from "./ragTokens";

type Props = {
  items: ChangeRowV5[];
  onOpenEvidence?: (ref: string) => void;
};

/** v5 What Changed — each row's derivation is an evidence-bound claim, never a bare confidence %. */
export function WhatChangedFromLastReview({ items, onOpenEvidence }: Props) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4">
        <h2 className="text-base font-bold text-slate-900">What Changed from Last Review</h2>
      </header>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">
          No material changes since the last review.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => {
            const band =
              item.status === "RED" ? "red" : item.status === "AMBER" ? "amber" : "green";
            const rag = RAG_STYLES[band];
            return (
              <li
                key={item.id}
                className={`rounded-r-lg border-l-[3px] bg-stone-50/80 py-2.5 pl-3.5 pr-3 ${rag.rail}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="flex-1 text-[13px] leading-relaxed text-slate-700">{item.text}</p>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold ${rag.bg} ${rag.text}`}
                  >
                    {item.domainName}
                  </span>
                </div>
                <div className="mt-1.5">
                  <ClaimLine
                    derivation={item.derivation}
                    evidenceRef={item.evidenceRef}
                    onOpenEvidence={onOpenEvidence}
                  >
                    {item.derivation === "RULE" ? "Rule" : "LLM"} · {item.text} · evidence{" "}
                    {item.evidenceRef} · {item.detectionVersion}
                  </ClaimLine>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
