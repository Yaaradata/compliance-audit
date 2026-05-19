'use client';

import { kriCategoryBadgeStyles } from './kriAiSummaryTokens';
import type { KriAiSummaryPoint } from './buildKriAiSummary';

/** Single problem + recommendation point (cockpit AI Summary Wall card). */
export function KriAiSummaryPointCard({
  point,
  onOpen,
}: {
  point: KriAiSummaryPoint;
  onOpen: () => void;
}) {
  const { badgeClass, borderClass } = kriCategoryBadgeStyles(point.category);
  const confidenceColor =
    point.band === 'red' ? 'text-[#DC2626]' : point.band === 'amber' ? 'text-[#D97706]' : 'text-[#6B7280]';

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex w-full flex-col gap-0.5 rounded-md border border-[#DDE1E8] border-l-[3px] bg-[#EFF1F4] px-2.5 py-1.5 text-left transition hover:bg-[#E8EAED] ${borderClass}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${badgeClass}`}
        >
          {point.category}
        </span>
        <span className={`shrink-0 text-[10px] font-semibold ${confidenceColor}`}>{point.confidencePct}%</span>
      </div>
      <p className="text-[11px] font-medium leading-snug text-[#111827]">{point.problem}</p>
      <p className="text-[10px] leading-snug text-[#4B5563]">
        <span className="font-semibold text-[#6B7280]">Recommendation: </span>
        {point.recommendation}
      </p>
    </button>
  );
}
