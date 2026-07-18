"use client";

import type { Accountability } from "@/lib/ukbankingaudit/v6/types";

/**
 * Owner attribution chip.
 *   UK owned:  "SMF4 · A. Whitfield"
 *   US owned:  "Owner · R. Delgado · MRA-2024-017"
 *   Unowned:   "UNOWNED"  — slate, never red. An orphan is an unknown, not a fault.
 */
export function OwnerChip({ accountability }: { accountability: Accountability }) {
  if ("unowned" in accountability) {
    return (
      <span className="inline-flex items-center rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        UNOWNED
      </span>
    );
  }

  if (accountability.regime === "UK") {
    return (
      <span className="inline-flex items-center rounded border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700">
        {accountability.smf} · {accountability.holder}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700">
      Owner · {accountability.owner}
      {accountability.mraRef ? ` · ${accountability.mraRef}` : ""}
    </span>
  );
}
