"use client";

/**
 * A single evidence-bound claim.
 *
 * `evidenceRef` is REQUIRED, non-optional, non-nullable, with no default. A claim
 * with no evidence must FAIL TO COMPILE — that is the point of this component and
 * the reason there is no "for now" fallback.
 *
 *   RULE → solid 6px dot   (matched deterministically)
 *   LLM  → hollow 6px ring  (extracted by a model, weaker)
 */
export type ClaimLineProps = {
  children: React.ReactNode;
  derivation: "RULE" | "LLM";
  evidenceRef: string;
  onOpenEvidence?: (ref: string) => void;
};

function Marker({ derivation }: { derivation: "RULE" | "LLM" }) {
  return derivation === "RULE" ? (
    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-700" aria-hidden />
  ) : (
    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full border border-slate-500 bg-transparent" aria-hidden />
  );
}

export function ClaimLine({ children, derivation, evidenceRef, onOpenEvidence }: ClaimLineProps) {
  return (
    <div className="flex items-start gap-2 py-1 text-[12px] leading-snug text-slate-700">
      <Marker derivation={derivation} />
      <span className="flex-1">{children}</span>
      {onOpenEvidence ? (
        <button
          type="button"
          onClick={() => onOpenEvidence(evidenceRef)}
          className="shrink-0 font-mono text-[10px] text-indigo-600 underline decoration-dotted underline-offset-2 hover:text-indigo-800"
        >
          {evidenceRef}
        </button>
      ) : (
        <span className="shrink-0 font-mono text-[10px] text-slate-400">{evidenceRef}</span>
      )}
    </div>
  );
}

/** Always-visible legend. Never place this inside a tooltip — the encoding must be readable at rest. */
export function ClaimLegend() {
  return (
    <div className="flex items-center gap-4 text-[10px] text-slate-500">
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
        RULE · matched deterministically
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full border border-slate-500 bg-transparent" />
        LLM · extracted from a notice
      </span>
    </div>
  );
}
