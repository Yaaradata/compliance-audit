'use client';

import type { OpenDrawer } from '../../types';
import { WCW_COLUMN_WEEK_DELTAS } from './buildWcwColumnWeekDeltas';
import { formatControlFailureCard } from './formatWcwControlFailures';
import { useWhatChangedWeekData } from './useWhatChangedWeekData';
import { WcwColumnEmpty } from './WcwColumnEmpty';
import { WhatChangedColumn } from './WhatChangedColumn';

/** CRO column — plain-English summaries; full CES detail in Scroll Zone 2. */
export function ControlFailuresColumn({ openDrawer }: { openDrawer: OpenDrawer }) {
  const { controlFailuresColumn } = useWhatChangedWeekData();
  const { failures, thisWeek } = controlFailuresColumn;

  return (
    <WhatChangedColumn
      label="Control Failures"
      countBadge={`${thisWeek} this week`}
      weekDelta={WCW_COLUMN_WEEK_DELTAS.controlFailures}
      accent="controls"
      footer={
        failures.length ? (
          <a href="#wcw-detail-zone" className="wcw-link hover:underline">
            View control testing detail →
          </a>
        ) : null
      }
    >
      {failures.length ? (
        failures.map((ci) => {
          const copy = formatControlFailureCard(ci);
          return (
            <button
              key={ci.control_instance_id}
              type="button"
              onClick={() => openDrawer('controlInstance', ci.control_instance_id, 'whatChanged')}
              className="flex min-h-[72px] w-full min-w-0 flex-col justify-center rounded-lg border border-[#E5E7EB] bg-[#FAF5FF] px-3.5 py-3 text-left transition-colors hover:border-violet-300"
              style={{ borderLeftWidth: 3, borderLeftColor: '#7C3AED' }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#7C3AED]">Control failure</span>
                <span className="rounded border border-[#FECACA] bg-[#FEE2E2] px-2 py-0.5 text-[10px] font-bold text-[#DC2626]">
                  FAIL
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-[13px] font-medium leading-snug text-[#111827]">{copy.plainText}</p>
            </button>
          );
        })
      ) : (
        <WcwColumnEmpty message="No control failures this week — all active controls passed" />
      )}
    </WhatChangedColumn>
  );
}
