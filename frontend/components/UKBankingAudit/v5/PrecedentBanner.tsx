"use client";

import { formatConsequence } from "@/lib/ukbankingaudit/v5/precedentCorpus";
import type { Precedent } from "@/lib/ukbankingaudit/v5/types";

// Factual posture chips — deliberately NOT red. A posture is a fact, not a verdict.
const POSTURE_STYLE: Record<Precedent["admissionPosture"], string> = {
  admitted: "border-slate-300 bg-slate-100 text-slate-700",
  "settled-no-admission": "border-slate-300 bg-slate-100 text-slate-600",
  alleged: "border-amber-300 bg-amber-50 text-amber-700",
  "criminal-conviction": "border-slate-400 bg-slate-200 text-slate-800",
  "guilty-plea": "border-slate-400 bg-slate-200 text-slate-800",
  "consent-order": "border-slate-300 bg-slate-100 text-slate-700",
  "undertaking-only": "border-slate-300 bg-slate-100 text-slate-600",
  "open-investigation": "border-amber-300 bg-amber-50 text-amber-700",
  "tribunal-varied": "border-slate-300 bg-slate-100 text-slate-600",
};

/**
 * Precedent banner shown above the CRSA table for a control whose mechanism
 * matches a real enforcement precedent.
 *
 * The banner MUST NOT render without an admissionPosture — the `Precedent` type
 * makes admissionPosture a required, non-optional field, so this is enforced at
 * the type level; the runtime guard below is defence in depth.
 */
export function PrecedentBanner({ precedent, crsaRef }: { precedent: Precedent; crsaRef?: string }) {
  if (!precedent.admissionPosture) return null;

  const unverified = precedent.confidence === "unverified";

  return (
    <div className="uk-v4-slide-down-fast mb-2 rounded-[10px] border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-slate-600">
        <span className="font-semibold text-slate-800">{precedent.respondent}</span>
        <span className="text-slate-300">·</span>
        <span>{precedent.noticeDate}</span>
        <span className="text-slate-300">·</span>
        <span className="font-medium text-slate-700">{formatConsequence(precedent)}</span>
        <span
          className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${POSTURE_STYLE[precedent.admissionPosture]}`}
        >
          {precedent.admissionPosture}
        </span>
        {precedent.sourceUrl ? (
          <a
            href={precedent.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium text-indigo-600 underline decoration-dotted underline-offset-2 hover:text-indigo-800"
          >
            source
          </a>
        ) : (
          <span className="text-[10px] italic text-slate-400">source pending</span>
        )}
        {crsaRef ? (
          <span className="ml-auto font-mono text-[10px] text-slate-400">matches {crsaRef}</span>
        ) : null}
      </div>
      {unverified ? (
        <div className="mt-2 rounded border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
          Penalty and date unresolved. Do not use in client material.
        </div>
      ) : null}
    </div>
  );
}
