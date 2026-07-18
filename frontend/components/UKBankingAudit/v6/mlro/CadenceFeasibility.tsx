"use client";

import { useMemo } from "react";
import { ClaimLine } from "@/components/UKBankingAudit/v6/ClaimLine";
import { formatConsequence } from "@/lib/ukbankingaudit/v6/precedentCorpus";
import {
  cadenceFeasibilityResults,
  nationwideCadencePrecedent,
  workingDaysToCalendar,
  type CadenceFeasibilityCheck,
} from "@/lib/ukbankingaudit/v6/mlroSignals";

type Props = {
  checks?: CadenceFeasibilityCheck[];
  onOpenEvidence?: (ref: string) => void;
};

function InfeasibleCard({
  check,
  onOpenEvidence,
}: {
  check: CadenceFeasibilityCheck;
  onOpenEvidence?: (ref: string) => void;
}) {
  const investigationCalendar = workingDaysToCalendar(check.investigationSlaWorkingDays);
  const minimumCycle = check.substrateRefreshDays + investigationCalendar;
  const nationwide = nationwideCadencePrecedent();

  return (
    <div className="rounded-xl border-2 border-rose-300 bg-rose-50/40 p-4 shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
        Cadence feasibility · arithmetic impossibility
      </div>
      <h3 className="mt-0.5 text-sm font-bold text-slate-900">
        {check.controlId} / {check.racmRef}
      </h3>
      <p className="mt-1 text-[11px] text-slate-700">{check.label}</p>

      <ClaimLine derivation="RULE" evidenceRef={`CADENCE-${check.controlId}`} onOpenEvidence={onOpenEvidence}>
        Required detection window ({check.requiredDetectionWindowDays} calendar days) is shorter than
        substrate refresh ({check.substrateRefreshDays}d) plus investigation SLA (
        {check.investigationSlaWorkingDays} working days ≈ {investigationCalendar} calendar days) =
        {` `}
        {minimumCycle}d minimum cycle. Gap: {check.gapDays} days.
      </ClaimLine>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded border border-slate-200 bg-white p-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Detection window</div>
          <div className="text-xl font-bold text-slate-900">{check.requiredDetectionWindowDays}d</div>
        </div>
        <div className="rounded border border-slate-200 bg-white p-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Substrate refresh</div>
          <div className="text-xl font-bold text-slate-900">{check.substrateRefreshDays}d</div>
        </div>
        <div className="rounded border border-slate-200 bg-white p-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Investigation SLA</div>
          <div className="text-xl font-bold text-slate-900">{check.investigationSlaWorkingDays}wd</div>
        </div>
      </div>

      {nationwide ? (
        <div className="mt-3 rounded-lg border border-slate-300 bg-white/80 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Precedent</div>
          <ClaimLine derivation="RULE" evidenceRef="PREC-NATIONWIDE-2025" onOpenEvidence={onOpenEvidence}>
            {nationwide.respondent} — transaction-monitoring alerts generated at month start on the
            prior month&apos;s activity, then allowed 20 working days to investigate. £26.01m arrived in
            eight days; the alert fired the following month. HMRC found it first.{" "}
            {formatConsequence(nationwide)}.
          </ClaimLine>
        </div>
      ) : null}

      <p className="mt-2 text-[10px] italic text-slate-500">
        Computed once, re-checked on substrate or SLA change. Zero false positives.
      </p>
    </div>
  );
}

/**
 * Surfaces when a control's required detection window cannot be met by substrate refresh
 * plus investigation SLA — an arithmetic impossibility, not an anomaly.
 */
export function CadenceFeasibility({ checks, onOpenEvidence }: Props) {
  const results = useMemo(() => checks ?? cadenceFeasibilityResults(), [checks]);
  const infeasible = results.filter((c) => !c.feasible);

  if (!infeasible.length) {
    return (
      <p className="text-[11px] text-slate-500">
        All mapped controls satisfy substrate refresh + investigation SLA arithmetic.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {infeasible.map((check) => (
        <InfeasibleCard key={check.controlId} check={check} onOpenEvidence={onOpenEvidence} />
      ))}
    </div>
  );
}
