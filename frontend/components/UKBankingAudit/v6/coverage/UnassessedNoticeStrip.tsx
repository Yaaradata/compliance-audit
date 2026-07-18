"use client";

import { ClaimLine } from "@/components/UKBankingAudit/v6/ClaimLine";
import {
  unassessedNoticeSummary,
  type EnforcementNoticeItem,
} from "@/lib/ukbankingaudit/v6/enforcementCoverage";

type Props = {
  notices: EnforcementNoticeItem[];
  onOpenEvidence?: (ref: string) => void;
};

/**
 * Always-visible queue above lens tabs — enforcement notices not yet assessed
 * for applicability (Barclays-shaped awareness card).
 */
export function UnassessedNoticeStrip({ notices, onOpenEvidence }: Props) {
  const summary = unassessedNoticeSummary(notices);
  if (summary.totalReaching === 0) return null;

  const copy = `${summary.totalReaching} enforcement notice${summary.totalReaching === 1 ? "" : "s"} published in the last 12 months reach controls you own. ${summary.unassessedCount} have never been assessed for applicability. Oldest: ${summary.oldestDays} days.`;

  return (
    <section className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
        Enforcement applicability queue
      </div>
      <ClaimLine derivation="RULE" evidenceRef="ENF-NOTICE-QUEUE" onOpenEvidence={onOpenEvidence}>
        {copy}
      </ClaimLine>
      <ul className="mt-3 divide-y divide-rose-100 rounded-lg border border-rose-100 bg-white">
        {summary.items
          .filter((n) => n.applicabilityStatus === "not_assessed")
          .sort((a, b) => b.ageDays - a.ageDays)
          .map((n) => (
            <li key={n.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-[11px]">
              <span className="font-semibold text-slate-800">
                {n.regulatorBody} · {n.publishedDate} · {n.precedent.respondent}
              </span>
              <span className="text-slate-500">
                {n.ageDays}d · {n.controlCount} control{n.controlCount === 1 ? "" : "s"} reached · not assessed
              </span>
            </li>
          ))}
      </ul>
    </section>
  );
}
