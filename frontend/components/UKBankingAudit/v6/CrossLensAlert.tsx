"use client";

/**
 * Cross-lens alert — GREEN on the board pack, failing two or more of Ownership /
 * Momentum / Defensibility. Computed from lib; never hardcoded to a domain.
 */
import { getCrossLensFindings } from "@/lib/ukbankingaudit/v6/lensBoardSummary";

export function CrossLensAlert() {
  const findings = getCrossLensFindings();
  if (findings.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {findings.map((f) => (
        <div
          key={f.domainId}
          className="rounded-[10px] border border-rose-300 bg-rose-50/60 px-3.5 py-3"
          role="status"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
            Cross-lens · board GREEN · {f.failCount} of 3 lenses fail
          </div>
          <div className="mt-1.5 space-y-1">
            {f.lines.map((line, i) => (
              <p
                key={`${f.domainId}-${i}`}
                className={`text-[12.5px] leading-snug text-slate-800 ${
                  i === 0 ? "font-semibold" : ""
                }`}
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
