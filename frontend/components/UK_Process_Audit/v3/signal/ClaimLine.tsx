"use client";

import type { ReactNode } from "react";

export type ClaimLineProps = {
  children: ReactNode;
  derivation: "RULE" | "LLM";
  /** REQUIRED. A claim without evidence fails to compile. No default. Not optional. */
  artefactRef: string;
  onOpenEvidence: (ref: string) => void;
};

/**
 * RULE → solid 6px dot. LLM → hollow 6px ring.
 * Legend always visible beside the line — never a tooltip.
 */
export function ClaimLine({ children, derivation, artefactRef, onOpenEvidence }: ClaimLineProps) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-1.5 flex shrink-0 items-center gap-1.5" aria-hidden>
        {derivation === "RULE" ? (
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-600" />
        ) : (
          <span className="inline-block h-1.5 w-1.5 rounded-full border-[1.5px] border-violet-600 bg-transparent" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-[10px] font-bold uppercase tracking-wide ${
              derivation === "RULE" ? "text-sky-700" : "text-violet-700"
            }`}
          >
            {derivation}
          </span>
          <span className="text-[10px] text-slate-400">·</span>
          <button
            type="button"
            onClick={() => onOpenEvidence(artefactRef)}
            className="truncate font-mono text-[10px] font-semibold text-slate-600 underline-offset-2 hover:underline"
          >
            {artefactRef}
          </button>
        </div>
        <div className="mt-0.5 text-[12px] leading-snug text-slate-700">{children}</div>
      </div>
    </div>
  );
}

/** Always-visible legend for RULE vs LLM markers. */
export function ClaimLineLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[10px] font-medium text-slate-500">
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-600" />
        RULE — deterministic
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-1.5 w-1.5 rounded-full border-[1.5px] border-violet-600 bg-transparent" />
        LLM — interpretive
      </span>
    </div>
  );
}
