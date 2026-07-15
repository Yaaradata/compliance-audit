"use client";

import type { Precedent } from "@/lib/ukbankingaudit/v5/types";
import { formatConsequence } from "@/lib/ukbankingaudit/v5/precedentCorpus";

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

type Props = {
  firmSeverity: string;
  precedent: Precedent;
};

/**
 * Shows the firm's severity rating alongside a matched enforcement precedent.
 * Never silently overrides — both numbers stay visible for human judgement.
 */
export function PrecedentGapBadge({ firmSeverity, precedent }: Props) {
  const consequence = formatConsequence(precedent);
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
      <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-semibold text-slate-700">
        severity: {firmSeverity}
      </span>
      <span className="text-slate-300">·</span>
      <span className="rounded border border-rose-200 bg-rose-50 px-2 py-0.5 font-semibold text-rose-800">
        precedent: {consequence}
      </span>
      <span
        className={`rounded border px-1.5 py-0.5 font-semibold uppercase ${POSTURE_STYLE[precedent.admissionPosture]}`}
      >
        {precedent.admissionPosture}
      </span>
      <span className="text-slate-500">{precedent.noticeDate}</span>
    </div>
  );
}
