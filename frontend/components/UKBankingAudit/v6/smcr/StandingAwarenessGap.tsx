"use client";

import { useMemo } from "react";
import { standingAwarenessGaps } from "@/lib/ukbankingaudit/v6/smcrStanding";
import type { SmcrTrailEvent } from "@/lib/ukbankingaudit/v6/smcrPrecedentAwareness";
import { ClaimLine } from "@/components/UKBankingAudit/v6/ClaimLine";

type SmfShape = {
  id: string;
  smfFunction: string;
  lastAttestationDate: string;
  nextAttestationDue: string;
};

type Props = {
  smf: SmfShape;
  trail: SmcrTrailEvent[];
  issues: Array<{
    id: string;
    title?: string;
    accountableSMFId?: string;
    daysOpen?: number;
    raisedDate?: string;
    status?: string;
  }>;
  findings: Array<{
    id: string;
    title?: string;
    racmRef?: string;
    discoveredDate?: string;
    firstLineRemediationStatus?: string;
  }>;
  onOpenEvidence?: (ref: string) => void;
};

export function StandingAwarenessGap({
  smf,
  trail,
  issues,
  findings,
  onOpenEvidence,
}: Props) {
  const gaps = useMemo(
    () =>
      standingAwarenessGaps({
        smfId: smf.id,
        smfFunction: smf.smfFunction,
        lastAttestationDate: smf.lastAttestationDate,
        nextAttestationDue: smf.nextAttestationDue,
        trail,
        issues,
        findings,
      }),
    [smf, trail, issues, findings],
  );

  if (gaps.length === 0) return null;

  return (
    <section className="rounded-xl border border-amber-300 bg-amber-50/40 p-5 shadow-sm">
      <div className="mb-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
          Standing awareness gap
        </div>
        <h3 className="mt-0.5 text-sm font-semibold text-slate-900">
          Open items with no reasonable-steps trail entry
        </h3>
        <p className="mt-1 text-[11px] text-slate-600">
          Sorted by duration — the card names the gap, not an individual.
        </p>
      </div>

      <ul className="space-y-3">
        {gaps.map((gap) => (
          <li
            key={gap.id}
            className="rounded-lg border border-amber-200 bg-white px-4 py-3"
          >
            <ClaimLine derivation="RULE" evidenceRef={gap.evidenceRef} onOpenEvidence={onOpenEvidence}>
              {gap.id} has been open for {gap.daysOpen} days across {gap.attestationCyclesSpanned}{" "}
              attestation cycle{gap.attestationCyclesSpanned === 1 ? "" : "s"}. Your trail contains no
              entry referencing it.
            </ClaimLine>
            {gap.precedentNote ? (
              <p className="mt-2 border-t border-amber-100 pt-2 text-[11px] leading-relaxed text-amber-900">
                <span className="font-semibold">Precedent pattern: </span>
                {gap.precedentNote}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
