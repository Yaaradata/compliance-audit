'use client';

import type { AtRiskClockChip } from '../zone2/buildAtRiskClockChips';
import './ReportingClockTicker.css';

function TickerItem({
  chip,
  onSelect,
}: {
  chip: AtRiskClockChip;
  onSelect?: (clockId: string) => void;
}) {
  const body = (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-3.5 py-1 text-[11px] font-semibold whitespace-nowrap ${chip.chipClass}`}
    >
      {chip.label}
    </span>
  );

  if (!onSelect) return body;

  return (
    <button
      type="button"
      title={chip.clock.clock_label}
      onClick={() => onSelect(chip.clock.clock_id)}
      className="shrink-0 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
    >
      {body}
    </button>
  );
}

function TickerSequence({
  chips,
  sequenceKey,
  duplicate = false,
  onSelect,
}: {
  chips: AtRiskClockChip[];
  sequenceKey: string;
  duplicate?: boolean;
  onSelect?: (clockId: string) => void;
}) {
  return (
    <div
      className={`flex shrink-0 items-center gap-6 pr-6 ${duplicate ? 'ori-reporting-clock-ticker__sequence--dup' : ''}`}
      aria-hidden={duplicate}
    >
      {chips.map((chip) => (
        <TickerItem key={`${sequenceKey}-${chip.clock.clock_id}`} chip={chip} onSelect={onSelect} />
      ))}
    </div>
  );
}

/** Stock-style marquee for at-risk reporting clocks — fixed label, scrolling chips. */
export function ReportingClockTicker({
  chips,
  onClockSelect,
}: {
  chips: AtRiskClockChip[];
  /** e.g. navigate to inspection readiness when a clock chip is clicked */
  onClockSelect?: (clockId: string) => void;
}) {
  if (!chips.length) return null;

  return (
    <div
      className="ori-reporting-clock-ticker flex w-full items-stretch overflow-hidden border-b border-[#DDE1E8] bg-[#1E293B] text-white"
      role="region"
      aria-label="Reporting clocks at risk"
    >
      <div className="flex shrink-0 items-center gap-2 bg-[#0F172A] px-4 py-2">
        <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F59E0B] opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#F59E0B]" />
        </span>
        <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.08em] text-[#F8FAFC]">
          Reporting clocks · at-risk
        </span>
      </div>

      <div className="ori-reporting-clock-ticker__viewport relative min-w-0 flex-1 overflow-hidden py-2">
        <div className="ori-reporting-clock-ticker__track">
          <TickerSequence chips={chips} sequenceKey="a" onSelect={onClockSelect} />
          <TickerSequence chips={chips} sequenceKey="b" duplicate onSelect={onClockSelect} />
        </div>
      </div>
    </div>
  );
}
