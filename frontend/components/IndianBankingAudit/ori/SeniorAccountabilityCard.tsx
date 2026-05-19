'use client';

import { ScoreRing } from '../primitives';
import type { SeniorManager } from '../dataModel';
import { hasSaesDataGap, openAccountableIssueCount } from './saesDataIntegrity';
import { SaesDataGapBadge } from './SaesDataGapBadge';

export function SeniorAccountabilityCard({
  sm,
  openIssues,
  onClick,
}: {
  sm: SeniorManager;
  openIssues?: number;
  onClick: () => void;
}) {
  const openCount = openIssues ?? openAccountableIssueCount(sm.senior_manager_id);
  const dataGap = hasSaesDataGap(sm.saes, openCount);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-16 items-center gap-2.5 rounded-lg border border-[#F3F4F6] bg-white px-3.5 py-2.5 text-left hover:border-[#D1D5DB]"
    >
      <ScoreRing score={sm.saes} band={sm.saes >= 85 ? 'green' : sm.saes >= 70 ? 'amber' : 'red'} size={36} thickness={3} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1">
          <span className="block truncate text-xs font-bold text-[#111827]">{sm.role}</span>
          {dataGap ? <SaesDataGapBadge /> : null}
        </span>
        <span className="text-[11px] text-[#6B7280]">{openCount} open issues</span>
      </span>
    </button>
  );
}
