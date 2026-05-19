'use client';

import { useMemo } from 'react';
import {
  buildWcwAiSummary,
  CHIP_STYLES,
  RISK_DIRECTION_STYLES,
  type RiskDirection,
  type WcwAiSummaryViewModel,
} from './buildWcwAiSummary';
import { useWhatChangedWeekData } from './useWhatChangedWeekData';

function RiskDirectionWord({ direction }: { direction: RiskDirection }) {
  const styles = RISK_DIRECTION_STYLES[direction];
  return (
    <strong
      className={`inline rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${styles.badge}`}
    >
      {direction}
    </strong>
  );
}

function DirectionSentence({ vm }: { vm: WcwAiSummaryViewModel }) {
  const clocks = vm.metrics.reportingClocksAtRisk;
  const failures = vm.metrics.controlFailures;
  const clocksVerb = clocks === 1 ? 'is' : 'are';

  return (
    <p className="m-0">
      Risk posture this week is <RiskDirectionWord direction={vm.riskDirection} /> — {vm.openedPhrase},{' '}
      {failures} control{failures === 1 ? '' : 's'} failed, and {clocks} regulatory reporting clock
      {clocks === 1 ? '' : 's'} {clocksVerb} at risk.
    </p>
  );
}

/** Zone 1 — AI weekly summary intelligence header (Pass 2). */
export function WhatChangedAiSummaryPanel() {
  const { kriDeltas } = useWhatChangedWeekData();
  const vm = useMemo(() => buildWcwAiSummary(kriDeltas), [kriDeltas]);

  return (
    <section className="wcw-ai-summary-panel-v2" aria-label="AI weekly summary">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="text-base text-[#F59E0B]" aria-hidden>
            ⚡
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#92400E]">
            AI Weekly Summary
          </span>
          <span className="rounded-full border border-[#FDE68A] bg-[#FEF9C3] px-2.5 py-0.5 text-[10px] font-semibold text-[#92400E]">
            Strategic tier · Auto-generated
          </span>
        </div>
        <span className="text-[11px] text-[#6B7280]">Generated: {vm.generatedAtIst} IST</span>
      </div>

      <div className="mt-4 space-y-2.5 text-sm leading-[1.7] text-[#374151]">
        <DirectionSentence vm={vm} />
        <p className="m-0">{vm.sentences.topIssue}</p>
        <p className="m-0">{vm.sentences.aiSignal}</p>
        <p className="m-0">{vm.sentences.kriBands}</p>
      </div>

      {vm.actionChips.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {vm.actionChips.map((chip) => (
            <a
              key={chip.id}
              href={chip.href ?? '#wcw-detail-zone'}
              className={`inline-flex h-7 items-center rounded-full border px-3.5 text-xs font-medium transition-colors ${CHIP_STYLES[chip.tone]}`}
            >
              {chip.label}
            </a>
          ))}
        </div>
      ) : null}

      <div
        className={`mt-3 border-t border-[#FDE68A] pt-2.5 text-xs text-[#6B7280] ${vm.kriFooterStable ? '' : 'space-y-1'}`}
      >
        {vm.kriFooterLines.map((line) => (
          <p key={line} className="m-0">
            {line}
          </p>
        ))}
      </div>
    </section>
  );
}
