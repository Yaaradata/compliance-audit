"use client";

import { useMemo } from "react";
import { ClaimLine } from "@/components/UKBankingAudit/v6/ClaimLine";
import {
  detectDispositionDispersion,
  type DispositionReasonWeek,
} from "@/lib/ukbankingaudit/v6/mlroSignals";

const REASON_LABELS: Record<string, string> = {
  "false-positive": "False positive",
  "escalate-l2": "Escalate L2",
  "sar-refer": "SAR refer",
  "no-action": "No action",
};

type Props = {
  weeks?: DispositionReasonWeek[];
  onOpenEvidence?: (ref: string) => void;
};

/**
 * Disposition reason-code dispersion collapsing while closure rate rises.
 * Metadata only — counts and reason codes, never customer content.
 * Asks for people, not a rule.
 */
export function DispositionDispersion({ weeks, onOpenEvidence }: Props) {
  const signal = useMemo(() => detectDispositionDispersion(weeks), [weeks]);

  if (!signal.fires) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Disposition dispersion
        </div>
        <p className="mt-2 text-[11px] text-slate-600">
          Reason-code spread stable — no capacity signal from disposition metadata.
        </p>
      </div>
    );
  }

  const last = signal.weeks[signal.weeks.length - 1];

  return (
    <section className="rounded-xl border-2 border-amber-300 bg-amber-50/50 p-4 shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
        Disposition dispersion · capacity signal
      </div>
      <h3 className="mt-0.5 text-sm font-bold text-slate-900">
        Reason codes collapsing while closures hold
      </h3>

      <ClaimLine derivation="RULE" evidenceRef="DISP-REASON-META" onOpenEvidence={onOpenEvidence}>
        Disposition reason-code entropy fell from {signal.earlyEntropy.toFixed(2)} to{" "}
        {signal.recentEntropy.toFixed(2)} while weekly closures rose by {signal.closureDelta}.
        {` `}
        {Math.round(signal.dominantRecentShare * 100)}% of closures this week coded{" "}
        {REASON_LABELS[signal.dominantRecentCode] ?? signal.dominantRecentCode}.
      </ClaimLine>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Object.entries(last.reasonCodes).map(([code, count]) => (
          <div key={code} className="rounded border border-slate-200 bg-white px-2 py-1.5">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">
              {REASON_LABELS[code] ?? code}
            </div>
            <div className="text-lg font-bold text-slate-900">{count.toLocaleString("en-GB")}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-amber-200 bg-white px-3 py-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Action</div>
        <p className="mt-1 text-[12px] font-semibold text-slate-900">MLRO reviews resourcing.</p>
        <p className="mt-1 text-[10px] leading-relaxed text-slate-600">
          Where triage capacity is the binding constraint, a detection product fails in front of
          the buyer. A pack that cannot say so is not credible.
        </p>
      </div>
    </section>
  );
}
