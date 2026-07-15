"use client";

import { useRouter } from "next/navigation";
import type { AdmissionPosture, UkPrecedent, UkSignal, UkSignalStatus } from "@/lib/UK_Process_Audit/signals";
import { formatPenalty } from "@/lib/UK_Process_Audit/signals";
import type { FailureMechanism } from "@/lib/UK_Process_Audit/signals";
import { ClaimLine, ClaimLineLegend } from "./ClaimLine";

const SEVERITY_BORDER: Record<UkSignal["severity"], string> = {
  S1: "#b42318",
  S2: "#b54708",
  S3: "#475467",
};

const MECHANISM_TITLE: Record<FailureMechanism, string> = {
  "periodic-review-absent": "Periodic review absent",
  "tm-scope-gap": "Transaction-monitoring scope gap",
  "tm-ingestion-gap": "Transaction-monitoring ingestion gap",
  "alert-suppression": "Alert suppression",
  "cdd-coverage-shortfall": "CDD coverage shortfall",
  "assertion-unevidenced": "Assertion unevidenced",
  "restriction-breach": "Restriction breach",
  "procedure-defeats-duty": "Procedure defeats duty",
  "remediation-unevidenced": "Remediation unevidenced",
  "redress-population-incomplete": "Redress population incomplete",
  "sanctions-screening-misconfigured": "Sanctions screening misconfigured",
  "risk-tolerated-past-expiry": "Risk tolerated past expiry",
  "post-lift-drift": "Post-lift drift",
  "disposition-quality": "Disposition quality",
};

const STATUS_LABEL: Record<UkSignalStatus, string> = {
  DETECTED_SIGNAL: "DETECTED SIGNAL",
  ACCEPTED_EXCEPTION: "ACCEPTED EXCEPTION",
  CONFIRMED_ISSUE: "CONFIRMED ISSUE",
};

const STATUS_TONE: Record<UkSignalStatus, string> = {
  DETECTED_SIGNAL: "bg-amber-50 text-amber-900 ring-amber-200",
  ACCEPTED_EXCEPTION: "bg-slate-100 text-slate-600 ring-slate-200",
  CONFIRMED_ISSUE: "bg-red-50 text-red-800 ring-red-200",
};

const POSTURE_LABEL: Record<AdmissionPosture, string> = {
  admitted: "ADMITTED",
  "settled-no-admission": "SETTLED · NO ADMISSION",
  alleged: "ALLEGED",
  "criminal-conviction": "CRIMINAL CONVICTION",
  "guilty-plea": "GUILTY PLEA",
  "undertaking-only": "UNDERTAKING ONLY",
  "tribunal-varied": "TRIBUNAL VARIED",
  "open-investigation": "OPEN INVESTIGATION",
};

/** Precedent contract for the card face — admissionPosture must be present. */
export type UkSignalCardPrecedent = UkPrecedent & {
  admissionPosture: AdmissionPosture;
};

export type UkSignalCardProps = {
  signal: UkSignal;
  /** When set, must carry a non-null admissionPosture or the card will not render. */
  precedent: UkSignalCardPrecedent | null;
  onOpenControl: (controlId: string) => void;
  onOpenEvidence: (ref: string) => void;
  onOpenInvestigation: (signalId: string) => void;
  onAcceptWithReason: (signalId: string) => void;
  /** When false, disposition controls are omitted (Internal Audit / non-detected bands). */
  showDispositionActions?: boolean;
  /** Shown on ACCEPTED EXCEPTION cards. */
  acceptedExpiry?: string | null;
  acceptedReason?: string | null;
};

function hasAdmissionPosture(
  precedent: UkPrecedent | null | undefined,
): precedent is UkSignalCardPrecedent {
  return precedent != null && precedent.admissionPosture != null;
}

/**
 * Compact signal face — exactly eight fields. No ninth.
 * Reuses the UkIntelCard visual idiom without importing it.
 */
export function UkSignalCard({
  signal,
  precedent,
  onOpenControl,
  onOpenEvidence,
  onOpenInvestigation,
  onAcceptWithReason,
  showDispositionActions = true,
  acceptedExpiry = null,
  acceptedReason = null,
}: UkSignalCardProps) {
  const router = useRouter();

  // Gate: a supplied precedent without admissionPosture must not render.
  if (precedent != null && precedent.admissionPosture == null) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(
        `UkSignalCard: precedent ${(precedent as UkPrecedent).id} missing admissionPosture — card must not render`,
      );
    }
    return null;
  }

  if (signal.precedentId != null && precedent == null) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(
        `UkSignalCard: signal ${signal.id} references precedent ${signal.precedentId} but none was supplied`,
      );
    }
    return null;
  }

  const border = SEVERITY_BORDER[signal.severity];
  const title = MECHANISM_TITLE[signal.mechanism];
  const claimArtefactRef =
    signal.evidenceRefs[0] ?? signal.missingEvidence[0] ?? `${signal.controlId}:missing-evidence`;

  return (
    <article
      className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      style={{ borderLeftWidth: 3, borderLeftColor: border }}
    >
      <header className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-bold uppercase tracking-wide text-slate-700">{title}</h3>
        <span className="text-[10px] font-bold tabular-nums text-slate-400">{signal.severity}</span>
      </header>

      {/* 3 — signalObserved */}
      <p className="text-[13px] font-semibold leading-snug text-slate-900">{signal.signalObserved}</p>

      {/* 4 — soWhat */}
      <p className="mt-1 text-[12px] leading-snug text-slate-600">{signal.soWhat}</p>

      {/* 5 — primaryMetric */}
      <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {signal.primaryMetric.label}
        </div>
        <div className="mt-0.5 text-lg font-semibold tabular-nums text-slate-900">
          {signal.primaryMetric.value}
        </div>
      </div>

      {/* Claim lines — RULE/LLM with required artefactRef */}
      <div className="mt-3 space-y-2">
        <ClaimLineLegend />
        {(signal.claimLines ?? [{ derivation: signal.derivation, text: signal.signalObserved }]).map(
          (line, i) => (
            <ClaimLine
              key={`${signal.id}-claim-${i}`}
              derivation={line.derivation}
              artefactRef={claimArtefactRef}
              onOpenEvidence={onOpenEvidence}
            >
              {line.text}
            </ClaimLine>
          ),
        )}
      </div>

      {/* 6 — controlId chip */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onOpenControl(signal.controlId)}
          className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-200"
        >
          {signal.controlId}
        </button>

        {/* 7 — precedent chip + admissionPosture tag */}
        {precedent && hasAdmissionPosture(precedent) ? (
          <span className="inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-900 ring-1 ring-indigo-100">
            <span className="truncate font-medium">
              {precedent.respondent} · {precedent.noticeDate} · {formatPenalty(precedent)}
            </span>
            <span className="rounded bg-white/80 px-1 py-px text-[9px] font-bold uppercase tracking-wide text-indigo-700 ring-1 ring-indigo-200">
              {POSTURE_LABEL[precedent.admissionPosture]}
            </span>
          </span>
        ) : null}
      </div>

      {/* 8 — owner + status pill */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <span className="truncate text-[11px] text-slate-500">{signal.owner}</span>
        <span
          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${STATUS_TONE[signal.status]}`}
        >
          {STATUS_LABEL[signal.status]}
        </span>
      </div>

      {signal.status === "ACCEPTED_EXCEPTION" && (acceptedExpiry || acceptedReason) ? (
        <div className="mt-2 rounded-md bg-slate-100 px-2.5 py-2 text-[11px] text-slate-600">
          {acceptedExpiry ? (
            <div>
              Expiry: <span className="font-semibold tabular-nums text-slate-800">{acceptedExpiry}</span>
            </div>
          ) : null}
          {acceptedReason ? <div className="mt-0.5 line-clamp-2">{acceptedReason}</div> : null}
        </div>
      ) : null}

      {/* Face actions only */}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            onOpenInvestigation(signal.id);
            router.push(`/UK_Process_Audit/v3/signal/${encodeURIComponent(signal.id)}`);
          }}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-slate-800"
        >
          Open investigation
        </button>
        {showDispositionActions ? (
          <button
            type="button"
            onClick={() => onAcceptWithReason(signal.id)}
            className="rounded-md bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Accept with reason
          </button>
        ) : null}
      </div>
    </article>
  );
}
