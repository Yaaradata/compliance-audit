'use client';

import { WCW_WEEK_DELTA_BADGE_STYLE, type WcwWeekDeltaSpec } from './buildWcwColumnWeekDeltas';

/** WoW delta pill for column headers (Pass 6). */
export function WcwWeekDeltaBadge({ delta }: { delta: WcwWeekDeltaSpec }) {
  const style = WCW_WEEK_DELTA_BADGE_STYLE[delta.variant];
  return (
    <span
      className="shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold leading-none"
      style={{ backgroundColor: style.backgroundColor, color: style.color }}
    >
      {delta.text}
    </span>
  );
}
