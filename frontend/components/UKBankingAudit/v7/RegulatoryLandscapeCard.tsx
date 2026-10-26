"use client";

import { formatConsequence } from "@/lib/ukbankingaudit/v7/precedentCorpus";
import { canDisposition } from "@/lib/ukbankingaudit/v7/dispositions";
import { getAccountability } from "@/lib/ukbankingaudit/v7/riskDomainsV7";
import type { BoardSignal, Precedent } from "@/lib/ukbankingaudit/v7/types";
import { useBoardRole } from "./boardRoleContext";
import { useJurisdiction } from "./jurisdictionContext";
import { OwnerChip } from "./OwnerChip";

/** Severity rail — red only when this card is the firm-likely hit; otherwise slate. */
function severityRailClass(firmLikely: boolean): string {
  return firmLikely ? "bg-red-500" : "bg-slate-300";
}

// Three dispositions of state, VISUALLY DISTINCT and never merged: a detected signal
// to review is not an accepted exception (a decision already taken) is not a confirmed
// issue (a live problem). Red only on confirmed issue when firm-likely; otherwise slate.
function statusPill(
  status: BoardSignal["status"],
  firmLikely: boolean,
): { label: string; className: string } {
  switch (status) {
    case "DETECTED_SIGNAL":
      return {
        label: "DETECTED SIGNAL",
        className: "border-slate-300 bg-slate-100 text-slate-600",
      };
    case "ACCEPTED_EXCEPTION":
      return {
        label: "ACCEPTED EXCEPTION",
        className: "border-slate-300 bg-slate-100 text-slate-600",
      };
    case "CONFIRMED_ISSUE":
      return firmLikely
        ? {
            label: "CONFIRMED ISSUE",
            className: "border-red-300 bg-red-50 text-red-700",
          }
        : {
            label: "CONFIRMED ISSUE",
            className: "border-slate-300 bg-slate-100 text-slate-600",
          };
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

// Factual posture chips — deliberately NOT red. A posture is a fact, not a verdict.
const POSTURE_PILL =
  "rounded border border-slate-300 bg-slate-100 px-1 py-px text-[9px] font-semibold uppercase text-slate-600";

type Props = {
  signal: BoardSignal;
  /** True for at most one card in the strip — the firm-likely enforcement hit. */
  firmLikely: boolean;
  precedent?: Precedent;
  onInvestigate: (signal: BoardSignal) => void;
  onAccept: (signal: BoardSignal) => void;
};

/** Compact regulatory-landscape card. Precedent fields unchanged; Path to Green lives elsewhere. */
export function RegulatoryLandscapeCard({
  signal,
  firmLikely,
  precedent,
  onInvestigate,
  onAccept,
}: Props) {
  const role = useBoardRole();
  const jurisdiction = useJurisdiction();

  // If a precedent is attached it MUST carry a posture, or the card does not render.
  if (precedent && !precedent.admissionPosture) return null;

  const canAct = canDisposition(role);
  const status = statusPill(signal.status, firmLikely);
  const accountability = getAccountability(signal.domainId, jurisdiction);

  return (
    <div className="relative flex flex-col overflow-hidden rounded-[10px] border border-slate-200 bg-white pl-3">
      {/* 1 · severity rail */}
      <span
        className={`absolute inset-y-0 left-0 w-[3px] ${severityRailClass(firmLikely)}`}
        aria-hidden
      />

      <div className="flex flex-col gap-1.5 p-3">
        {/* 2 · title */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-[13px] font-bold leading-tight text-slate-900">
            {signal.title}
          </span>
          {/* 8b · status pill */}
          <span
            className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        {/* 3 · signalObserved */}
        <p className="text-[11.5px] leading-snug text-slate-600">{signal.signalObserved}</p>

        {/* 4 · soWhat */}
        <p className="text-[12px] font-medium leading-snug text-slate-800">{signal.soWhat}</p>

        {/* 5 · primaryMetric */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-extrabold tracking-tight text-slate-900">
            {signal.primaryMetric.value}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-slate-500">
            {signal.primaryMetric.label}
          </span>
        </div>

        {/* 6 · domain chip + 7 · precedent chip */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
            {signal.domainName}
          </span>
          {precedent ? (
            <span className="flex flex-wrap items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600">
              <span className="font-semibold text-slate-700">{precedent.respondent}</span>
              <span className="text-slate-300">·</span>
              <span>{precedent.noticeDate}</span>
              <span className="text-slate-300">·</span>
              <span>{formatConsequence(precedent)}</span>
              <span className={POSTURE_PILL}>{precedent.admissionPosture}</span>
              {precedent.sourceUrl ? (
                <a
                  href={precedent.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-indigo-600 underline decoration-dotted underline-offset-2 hover:text-indigo-800"
                >
                  source
                </a>
              ) : (
                <span className="italic text-slate-400">source pending</span>
              )}
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

        {/* Board read — headings only until grounded likelihood / steps exist */}
        <div className="mt-1 space-y-2 border-t border-slate-100 pt-2">
          <div>
            <h3 className="text-[11px] font-bold text-slate-800">
              Is this likely to happen to us?
            </h3>
            <p className="mt-0.5 text-[11.5px] leading-snug text-slate-500">Not yet assessed</p>
          </div>
          <div>
            <h3 className="text-[11px] font-bold text-slate-800">
              What reasonable steps are we taking?
            </h3>
            <p className="mt-0.5 text-[11.5px] leading-snug text-slate-500">Not yet assessed</p>
          </div>
        </div>

        {/* actions (not fields) */}
        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onInvestigate(signal)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
          >
            Open investigation
          </button>
          <button
            type="button"
            disabled={!canAct}
            title={
              canAct
                ? undefined
                : "Internal Audit is read-only — dispositions are refused at the data layer."
            }
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
