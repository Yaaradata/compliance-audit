"use client";

import type { ClaimOrigin } from "@/lib/UK_Process_Audit/v3";

/** Visual distinction: RULE (deterministic) vs LLM (interpretive). */
export function OriginBadge({ origin }: { origin: ClaimOrigin | "RULE" | "LLM" }) {
  if (origin === "RULE") {
    return (
      <span className="inline-flex items-center rounded border border-sky-300 bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-sky-800">
        RULE
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded border border-violet-300 bg-violet-50 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-violet-800">
      LLM
    </span>
  );
}
