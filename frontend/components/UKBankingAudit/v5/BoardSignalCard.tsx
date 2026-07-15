"use client";

import { formatConsequence } from "@/lib/ukbankingaudit/v5/precedentCorpus";
import { canDisposition } from "@/lib/ukbankingaudit/v5/dispositions";
import { getAccountability } from "@/lib/ukbankingaudit/v5/riskDomainsV5";
import type { BoardSignal, FailureMechanism, Precedent } from "@/lib/ukbankingaudit/v5/types";
import { useBoardRole } from "./boardRoleContext";
import { useJurisdiction } from "./jurisdictionContext";
import { OwnerChip } from "./OwnerChip";

const MECHANISM_LABEL: Record<FailureMechanism, string> = {
  "assertion-unevidenced": "Unevidenced assertion",
  "periodic-review-absent": "Periodic review absent",
  "cdd-coverage-shortfall": "CDD coverage shortfall",
  "sanctions-screening-misconfigured": "Sanctions screening misconfigured",
  "tm-scope-gap": "Transaction monitoring scope gap",
  "alert-suppression": "Alert suppression",
  "remediation-unevidenced": "Remediation unevidenced",
  "closure-signed-unevidenced": "Closure signed, unevidenced",
  "risk-tolerated-past-expiry": "Risk tolerated past expiry",
  "kri-breach-no-plan": "KRI breach, no plan",
  "accountability-orphan": "Accountability orphan",
  "repeat-finding": "Repeat finding",
  "deadline-missed": "Deadline missed",
  "restriction-breach": "Restriction breach",
};

const SEVERITY_RAIL: Record<BoardSignal["severity"], string> = {
  S1: "bg-red-500",
  S2: "bg-amber-500",
  S3: "bg-slate-400",
};

// Three dispositions of state, VISUALLY DISTINCT and never merged: a detected signal
// to review is not an accepted exception (a decision already taken) is not a confirmed
// issue (a live problem).
const STATUS_PILL: Record<BoardSignal["status"], { label: string; className: string }> = {
  DETECTED_SIGNAL: { label: "DETECTED SIGNAL", className: "border-indigo-300 bg-indigo-50 text-indigo-700" },
  ACCEPTED_EXCEPTION: { label: "ACCEPTED EXCEPTION", className: "border-slate-300 bg-slate-100 text-slate-600" },
  CONFIRMED_ISSUE: { label: "CONFIRMED ISSUE", className: "border-red-300 bg-red-50 text-red-700" },
};

const POSTURE_PILL = "rounded border border-slate-300 bg-slate-100 px-1 py-px text-[9px] font-semibold uppercase text-slate-600";

type Props = {
  signal: BoardSignal;
  precedent?: Precedent;
  onInvestigate: (signal: BoardSignal) => void;
  onAccept: (signal: BoardSignal) => void;
};

/** Compact board-signal card. Eight fields on the face, no ninth. */
export function BoardSignalCard({ signal, precedent, onInvestigate, onAccept }: Props) {
  const role = useBoardRole();
  const jurisdiction = useJurisdiction();

  // If a precedent is attached it MUST carry a posture, or the card does not render.
  if (precedent && !precedent.admissionPosture) return null;

  const canAct = canDisposition(role);
  const status = STATUS_PILL[signal.status];
  const accountability = getAccountability(signal.domainId, jurisdiction);

  return (
    <div className="relative flex flex-col overflow-hidden rounded-[10px] border border-slate-200 bg-white pl-3">
      {/* 1 · severity rail */}
      <span className={`absolute inset-y-0 left-0 w-[3px] ${SEVERITY_RAIL[signal.severity]}`} aria-hidden />

      <div className="flex flex-col gap-1.5 p-3">
        {/* 2 · title */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-[13px] font-bold leading-tight text-slate-900">
            {MECHANISM_LABEL[signal.mechanism]}
          </span>
          {/* 8b · status pill */}
          <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${status.className}`}>
            {status.label}
          </span>
        </div>

        {/* 3 · signalObserved */}
        <p className="text-[11.5px] leading-snug text-slate-600">{signal.signalObserved}</p>

        {/* 4 · soWhat */}
        <p className="text-[12px] font-medium leading-snug text-slate-800">{signal.soWhat}</p>

        {/* 5 · primaryMetric */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-extrabold tracking-tight text-slate-900">{signal.primaryMetric.value}</span>
          <span className="text-[10px] uppercase tracking-wide text-slate-500">{signal.primaryMetric.label}</span>
        </div>

        {/* 6 · domain chip + 7 · precedent chip */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
            {signal.domainName}
          </span>
          {precedent ? (
            <span className="flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600">
              <span className="font-semibold text-slate-700">{precedent.respondent}</span>
              <span className="text-slate-300">·</span>
              <span>{precedent.noticeDate}</span>
              <span className="text-slate-300">·</span>
              <span>{formatConsequence(precedent)}</span>
              <span className={POSTURE_PILL}>{precedent.admissionPosture}</span>
            </span>
          ) : (
            <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] italic text-slate-400">
              no matched precedent
            </span>
          )}
        </div>

        {/* 8a · owner */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <OwnerChip accountability={accountability} />
        </div>

        {/* actions (not fields) */}
        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onInvestigate(signal)}
            className="rounded-lg border border-indigo-600 bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100"
          >
            Open investigation
          </button>
          <button
            type="button"
            disabled={!canAct}
            title={canAct ? undefined : "Internal Audit is read-only — dispositions are refused at the data layer."}
            onClick={() => onAccept(signal)}
            className={`rounded-lg border px-3 py-1 text-[11px] font-semibold ${
              canAct
                ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
            }`}
          >
            Accept with reason
          </button>
        </div>
      </div>
    </div>
  );
}
