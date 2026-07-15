"use client";

import type { ReactNode } from "react";
import type { UkAuditClaim, UkEvidenceRef } from "@/lib/UK_Process_Audit/v3";
import { OriginBadge } from "./OriginBadge";

const PREDICATE_TONE: Record<
  UkAuditClaim["predicate"],
  { ring: string; text: string; label: string }
> = {
  SIGNAL_FIRED: { ring: "ring-amber-200 bg-amber-50", text: "text-amber-900", label: "SIGNAL_FIRED" },
  EVIDENCE_GAP_OBSERVED: {
    ring: "ring-orange-200 bg-orange-50",
    text: "text-orange-900",
    label: "EVIDENCE_GAP_OBSERVED",
  },
  PRECEDENT_MATCHED: {
    ring: "ring-indigo-200 bg-indigo-50",
    text: "text-indigo-900",
    label: "PRECEDENT_MATCHED",
  },
  HUMAN_REVIEW_REQUIRED: {
    ring: "ring-slate-200 bg-slate-50",
    text: "text-slate-800",
    label: "HUMAN_REVIEW_REQUIRED",
  },
};

/**
 * Evidence-bound claim card.
 * `evidence` is a required prop — omitting it fails TypeScript compilation.
 */
export function EvidenceBoundClaim({
  claim,
  evidence,
  onOpenEvidence,
  footer,
}: {
  claim: UkAuditClaim;
  evidence: UkEvidenceRef;
  onOpenEvidence?: (controlId: string) => void;
  footer?: ReactNode;
}) {
  const tone = PREDICATE_TONE[claim.predicate];

  return (
    <article className={`rounded-lg px-4 py-3 ring-1 ${tone.ring}`}>
      <div className="flex flex-wrap items-center gap-2">
        <OriginBadge origin={claim.origin} />
        <span className={`text-[10px] font-bold tracking-wide ${tone.text}`}>{tone.label}</span>
        {claim.domainId ? (
          <span className="rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
            {claim.domainId}
          </span>
        ) : null}
      </div>
      <h4 className="mt-2 text-[13px] font-semibold text-slate-900">{claim.headline}</h4>
      <p className="mt-1 text-[12px] leading-snug text-slate-600">{claim.detail}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
        <span className="font-medium text-slate-700">Evidence:</span>
        <span>{evidence.packHint}</span>
        <span className="text-slate-400">·</span>
        <span className="truncate">{evidence.sourceSystem}</span>
        {onOpenEvidence && claim.controlId ? (
          <button
            type="button"
            onClick={() => onOpenEvidence(claim.controlId!)}
            className="ml-auto rounded bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Open pack
          </button>
        ) : null}
      </div>
      {footer}
    </article>
  );
}
