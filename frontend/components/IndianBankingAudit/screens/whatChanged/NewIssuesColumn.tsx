'use client';

import type { OpenDrawer } from '../../types';
import { WCW_COLUMN_WEEK_DELTAS } from './buildWcwColumnWeekDeltas';
import { formatRelativeAgeFromDays } from './formatWcwRelativeTime';
import { issueTitleForCard, severityBadgeStyle } from './formatWcwIssues';
import { useWhatChangedWeekData } from './useWhatChangedWeekData';
import { WcwColumnEmpty } from './WcwColumnEmpty';
import { WhatChangedColumn } from './WhatChangedColumn';

export function NewIssuesColumn({ openDrawer }: { openDrawer: OpenDrawer }) {
  const { newIssuesColumn } = useWhatChangedWeekData();
  const { visibleIssues, displayIssues, thisWeekCount, totalForViewAll } = newIssuesColumn;

  return (
    <WhatChangedColumn
      label="New Issues"
      countBadge={`${thisWeekCount} this week`}
      weekDelta={WCW_COLUMN_WEEK_DELTAS.newIssues}
      accent="issues"
      footer={
        totalForViewAll > 3 ? (
          <a href="#wcw-detail-zone" className="wcw-link hover:underline">
            View all {totalForViewAll} issues →
          </a>
        ) : null
      }
    >
      {visibleIssues.length ? (
        visibleIssues.map((issue) => {
          const sev = severityBadgeStyle(issue.severity);
          return (
            <button
              key={issue.issue_id}
              type="button"
              onClick={() => openDrawer('issue', issue.issue_id, 'whatChanged')}
              className="flex h-[72px] w-full min-w-0 flex-col overflow-hidden rounded-lg border border-[#E5E7EB] px-3.5 py-3 text-left transition-colors hover:border-[#DC2626]/40"
              style={{
                borderLeftWidth: 3,
                borderLeftColor: sev.accent,
                backgroundColor: sev.tint,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="rounded border px-2 py-0.5 text-[10px] font-bold uppercase"
                  style={{ backgroundColor: sev.bg, color: sev.text, borderColor: sev.border }}
                >
                  {sev.label}
                </span>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="text-[11px] text-[#9CA3AF]">{formatRelativeAgeFromDays(issue.ageing_days)}</span>
                  {issue.rbi_mra_flag ? (
                    <span className="rounded border border-[#FECACA] bg-[#FEE2E2] px-1.5 py-0.5 text-[10px] font-bold text-[#DC2626]">
                      RBI MRA
                    </span>
                  ) : null}
                </div>
              </div>
              <p className="mt-1 line-clamp-1 text-[13px] font-semibold leading-snug text-[#111827]">
                {issueTitleForCard(issue)}
              </p>
              <p className="mt-0.5 truncate font-mono text-[11px] text-[#9CA3AF]">{issue.issue_id}</p>
            </button>
          );
        })
      ) : (
        <WcwColumnEmpty message="No new issues this week — issue intake volume within normal range" />
      )}
    </WhatChangedColumn>
  );
}
