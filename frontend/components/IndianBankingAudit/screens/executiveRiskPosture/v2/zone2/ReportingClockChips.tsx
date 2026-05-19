'use client';

import type { AtRiskClockChip } from './buildAtRiskClockChips';

export function ReportingClockChips({ chips }: { chips: AtRiskClockChip[] }) {
  if (!chips.length) return null;

  return (
    <div className="mt-0">
      <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.05em] text-[#6B7280]">Reporting clocks · at-risk</h3>
      <div className="flex flex-wrap gap-2">
        {chips.map(({ clock, label, chipClass }) => (
          <span
            key={clock.clock_id}
            title={clock.clock_label}
            className={`inline-flex h-8 items-center rounded-full border px-3.5 text-[11px] font-semibold ${chipClass}`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
