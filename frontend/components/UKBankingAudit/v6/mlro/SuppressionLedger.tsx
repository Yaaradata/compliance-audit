"use client";

import { useMemo } from "react";
import { ClaimLine } from "@/components/UKBankingAudit/v6/ClaimLine";
import { formatConsequence } from "@/lib/ukbankingaudit/v6/precedentCorpus";
import {
  suppressionSignals,
  natWestSuppressionPrecedent,
  nationwideMirrorPrecedent,
  type UkRuleConfigChange,
} from "@/lib/ukbankingaudit/v6/mlroSignals";

type AlertWeek = {
  weekLabel: string;
  openBacklog?: number;
};

type Props = {
  alertSeries?: AlertWeek[];
  onOpenEvidence?: (ref: string) => void;
};

function BacklogSparklineWithPin({
  series,
  pinIndex,
  width = 480,
  height = 56,
}: {
  series: number[];
  pinIndex: number;
  width?: number;
  height?: number;
}) {
  if (!series.length) return <div className="h-14" />;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const points = series
    .map((v, i) => {
      const x = (i / Math.max(series.length - 1, 1)) * width;
      const y = height - ((v - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");
  const fillPath = `0,${height} ${points} ${width},${height}`;
  const pinX = (pinIndex / Math.max(series.length - 1, 1)) * width;
  const pinY = height - ((series[pinIndex] - min) / range) * (height - 8) - 4;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polygon points={fillPath} fill="#fee2e2" />
      <polyline points={points} fill="none" stroke="#e11d48" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx={pinX} cy={pinY} r={5} fill="#fff" stroke="#7c3aed" strokeWidth="2" />
      <line x1={pinX} y1={pinY - 8} x2={pinX} y2={4} stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="3 2" />
    </svg>
  );
}

function SuppressionHero({ change, onOpenEvidence }: { change: UkRuleConfigChange; onOpenEvidence?: (ref: string) => void }) {
  const natWest = natWestSuppressionPrecedent();
  const nationwide = nationwideMirrorPrecedent();
  const backlogSeries = useMemo(() => {
    const at = change.alertBacklogAtChange.atChange;
    const prior = change.alertBacklogAtChange.thirtyDaysPrior;
    const mid = Math.round((at + prior) / 2);
    return [prior - 180, prior - 90, prior, mid, at, at + 120, at + 280];
  }, [change]);

  return (
    <div className="rounded-xl border-2 border-violet-300 bg-violet-50/40 p-5 shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-wider text-violet-800">
        Rule suppression conjunction
      </div>
      <h3 className="mt-0.5 text-sm font-bold text-slate-900">
        {change.ruleId} made less sensitive while backlog was rising
      </h3>

      {/*
        DEMO NOTE — lead with the Nationwide instance, not NatWest.
        Nationwide explored lowering its alert thresholds and DECLINED, citing an increase
        in false positives. Same mechanism, no villain. Every compliance officer in the
        room has made that decision. It turns the card from an accusation into a mirror.
      */}
      <div className="mt-3 rounded-lg border border-slate-200 bg-white/80 p-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mirror · same mechanism</div>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-700">
          {nationwide?.respondent ?? "Nationwide"} explored lowering alert thresholds and{" "}
          <span className="font-semibold">declined</span>, citing an increase in false positives.
          Same trade-off every MLRO faces — not a villain story.
        </p>
      </div>

      <div className="mt-4 rounded-md border border-slate-200 bg-white p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Open backlog · change pinned
          </span>
          <span className="text-[10px] text-slate-600">
            {new Date(change.ts).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
          </span>
        </div>
        <BacklogSparklineWithPin series={backlogSeries} pinIndex={4} />
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-700">
          <span>
            <span className="font-semibold">{change.ruleId}</span> · {change.diff}
          </span>
          <span className="text-slate-300">·</span>
          <span>
            backlog {change.alertBacklogAtChange.thirtyDaysPrior.toLocaleString("en-GB")} →{" "}
            {change.alertBacklogAtChange.atChange.toLocaleString("en-GB")}
          </span>
          <span className="text-slate-300">·</span>
          <span>approver {change.approver}</span>
        </div>
        {change.rationale ? (
          <p className="mt-1 text-[10px] text-slate-500">Rationale: {change.rationale}</p>
        ) : (
          <p className="mt-1 text-[10px] italic text-amber-700">Rationale field empty.</p>
        )}
      </div>

      {natWest ? (
        <div className="mt-3 rounded-lg border border-slate-300 bg-slate-50 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Precedent</div>
          <ClaimLine derivation="RULE" evidenceRef="PREC-NATWEST-2021" onOpenEvidence={onOpenEvidence}>
            {natWest.regulator} · {natWest.noticeDate} · {formatConsequence(natWest)} ·{" "}
            {natWest.admissionPosture.toUpperCase()} — {natWest.mechanism}
          </ClaimLine>
        </div>
      ) : null}

      <p className="mt-3 text-[10px] italic text-slate-500">
        This product observes configuration. It never changes a rule.
      </p>
    </div>
  );
}

/**
 * Fires on the conjunction: less-sensitive change + rising backlog in the prior 30 days.
 */
export function SuppressionLedger({ alertSeries: _alertSeries, onOpenEvidence }: Props) {
  const signals = useMemo(() => suppressionSignals(), []);

  if (!signals.length) {
    return (
      <p className="text-[11px] text-slate-500">
        No rule suppression conjunction detected in the last 30 days.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {signals.map((change) => (
        <SuppressionHero key={change.ruleId} change={change} onOpenEvidence={onOpenEvidence} />
      ))}
    </div>
  );
}
