'use client';

import { useCallback, useMemo, useState } from 'react';
import type { OpenDrawer, SetActiveScreen } from '../../types';
import {
  buildWcwAiSignalsColumnMeta,
  buildWcwCroColumnSignals,
  type WcwCroSignalView,
} from './buildWcwAiSignalsColumn';
import { WCW_COLUMN_WEEK_DELTAS } from './buildWcwColumnWeekDeltas';
import { WcwColumnEmpty } from './WcwColumnEmpty';
import { WcwWeekDeltaBadge } from './WcwWeekDeltaBadge';
import { SIGNAL_BADGE_STYLES } from './wcwAiSignalTokens';

function truncateWords(text: string, maxWords = 12): string {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return `${words.slice(0, maxWords).join(' ')}…`;
}

function WcwSignalCard({
  signal,
  onEscalate,
  onDismiss,
}: {
  signal: WcwCroSignalView;
  onEscalate: () => void;
  onDismiss: () => void;
}) {
  const styles = SIGNAL_BADGE_STYLES[signal.badgeType];

  return (
    <article
      className="rounded-[10px] border border-[#E5E7EB] px-4 py-3.5"
      style={{
        borderLeftWidth: 4,
        borderLeftColor: styles.border,
        backgroundColor: styles.tint,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          style={{ backgroundColor: styles.badgeBg, color: styles.badgeText }}
        >
          {signal.badgeType}
        </span>
        <span className="shrink-0 text-xs text-[#6B7280]">{signal.confidencePct}%</span>
      </div>

      <p className="mt-2 text-[13px] font-medium leading-snug text-[#111827]" title={signal.detailTooltip}>
        {truncateWords(signal.displayText)}
      </p>

      <div className="mt-2.5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onEscalate}
          className="rounded-md border px-3 py-1 text-[11px] font-semibold transition-opacity hover:opacity-90"
          style={{
            backgroundColor: styles.escalateBg,
            color: styles.escalateText,
            borderColor: styles.escalateBorder,
          }}
        >
          Escalate →
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="border-0 bg-transparent px-1 py-1 text-[11px] font-normal text-[#9CA3AF] hover:text-[#6B7280]"
        >
          Dismiss
        </button>
      </div>

      <p className="mt-2 text-[11px] italic leading-snug text-[#6B7280]">→ {signal.implication}</p>
    </article>
  );
}

/** Pass 5 — AI Summary column (strategic tier only). */
export function AiSignalsColumn({
  openDrawer,
  setActiveScreen,
}: {
  openDrawer: OpenDrawer;
  setActiveScreen: SetActiveScreen;
}) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set());
  const meta = useMemo(() => buildWcwAiSignalsColumnMeta(), []);
  const signals = useMemo(() => buildWcwCroColumnSignals(dismissedIds), [dismissedIds]);

  const dismiss = useCallback((id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
  }, []);

  return (
    <article
      className="wcw-column-card"
      style={{
        borderLeftWidth: 4,
        borderLeftStyle: 'solid',
        borderLeftColor: '#0EA5E9',
      }}
    >
      <div className="wcw-column-header-strip">
        <div className="flex w-full min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="wcw-column-header-label">AI Summary</span>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span
                className="wcw-column-header-badge"
                style={{ backgroundColor: '#E0F2FE', color: '#075985', borderColor: '#BAE6FD' }}
              >
                {meta.countBadge}
              </span>
              <WcwWeekDeltaBadge delta={WCW_COLUMN_WEEK_DELTAS.aiSignals} />
            </div>
            <p className="mt-1 text-[11px] text-[#9CA3AF]">{meta.signalsUpdatedLine} · Strategic tier only</p>
          </div>
          <button
            type="button"
            className="wcw-link shrink-0 hover:underline"
            onClick={() => setActiveScreen('aiInsights')}
          >
            Review queue ({meta.totalQueue}) →
          </button>
        </div>
      </div>

      <div className="wcw-column-body">
        {signals.length ? (
          signals.map((sig) => (
            <WcwSignalCard
              key={sig.insight.ai_insight_id}
              signal={sig}
              onEscalate={() => openDrawer('aiInsight', sig.insight.ai_insight_id, 'whatChanged')}
              onDismiss={() => dismiss(sig.insight.ai_insight_id)}
            />
          ))
        ) : (
          <WcwColumnEmpty message="No strategic signals this week — predictive queue clear at Tier 1" />
        )}
      </div>
    </article>
  );
}
