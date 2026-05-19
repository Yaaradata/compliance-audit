'use client';

import { useMemo } from 'react';
import type { OpenDrawer, SetActiveScreen } from '../../../types';
import { buildAllReviewQueueSummarySignals, pendingAiQueueCount } from './aiSignals/buildCroAiSignals';
import {
  AI_PANEL_HEIGHT_PX,
  COCKPIT,
  COCKPIT_SURFACE,
  displaySignalBadge,
  signalBadgeStylesLight,
} from './cockpitTokens';
import { formatSignalsUpdatedLine } from './formatPostureDataAsOf';

/** Right column — AI Summary Wall (full review queue + recommendations). */
export function AiSignalsStrip({
  openDrawer,
  setActiveScreen,
}: {
  openDrawer: OpenDrawer;
  setActiveScreen: SetActiveScreen;
}) {
  const allSignals = useMemo(() => buildAllReviewQueueSummarySignals(), []);
  const queueCount = pendingAiQueueCount();
  const timePart = formatSignalsUpdatedLine().replace(/^Signals updated:\s*/i, '');

  return (
    <section
      aria-label="AI Summary Wall"
      style={{ height: AI_PANEL_HEIGHT_PX, backgroundColor: COCKPIT.cardBg, borderColor: COCKPIT.cardBorder }}
      className={`flex shrink-0 flex-col overflow-hidden ${COCKPIT_SURFACE.card} px-4 py-3`}
    >
      <div className="mb-2 flex shrink-0 items-start justify-between gap-2 border-b border-[#DDE1E8] pb-2">
        <div className="min-w-0">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-[#111827]">
            <span className="text-[#F59E0B]" aria-hidden>
              ✨
            </span>
            AI Summary Wall
          </h2>
          <p className="mt-0.5 text-[10px] text-[#6B7280]">
            {queueCount} in review queue · Updated {timePart}
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 text-[11px] font-medium text-indigo-600 hover:underline"
          onClick={() => setActiveScreen('aiInsights')}
        >
          Review queue ({queueCount}) →
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
        {allSignals.length === 0 ? (
          <p className="py-4 text-center text-xs text-[#9CA3AF]">No items in review queue.</p>
        ) : (
          allSignals.map((sig) => (
            <SummaryCard
              key={sig.insight.ai_insight_id}
              badgeLabel={displaySignalBadge(sig.badgeLabel)}
              signalText={sig.displayText}
              recommendation={sig.insight.recommendation}
              confidencePct={Math.round(sig.insight.confidence * 100)}
              detailTooltip={sig.detailTooltip}
              onOpenDetail={() => openDrawer('aiInsight', sig.insight.ai_insight_id, 'riskPosture')}
            />
          ))
        )}
      </div>
    </section>
  );
}

/** Kept for heatmap dismiss map compatibility (wall no longer dismisses). */
export function useAiSignalsDismissed() {
  return { dismissedIds: new Set<string>(), dismiss: () => {} };
}

function SummaryCard({
  badgeLabel,
  signalText,
  recommendation,
  confidencePct,
  detailTooltip,
  onOpenDetail,
}: {
  badgeLabel: string;
  signalText: string;
  recommendation: string;
  confidencePct: number;
  detailTooltip: string;
  onOpenDetail: () => void;
}) {
  const { badgeClass, borderClass } = signalBadgeStylesLight(badgeLabel);

  return (
    <button
      type="button"
      title={detailTooltip}
      onClick={onOpenDetail}
      className={`flex w-full flex-col gap-0.5 rounded-md border border-[#DDE1E8] border-l-[3px] bg-[#EFF1F4] px-2.5 py-1.5 text-left transition hover:bg-[#E8EAED] ${borderClass}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${badgeClass}`}>
          {badgeLabel}
        </span>
        <span className="shrink-0 text-[10px] font-semibold text-[#D97706]">{confidencePct}%</span>
      </div>
      <p className="text-[11px] font-medium leading-snug text-[#111827]">{signalText}</p>
      <p className="text-[10px] leading-snug text-[#4B5563]">
        <span className="font-semibold text-[#6B7280]">Recommendation: </span>
        {recommendation}
      </p>
    </button>
  );
}
