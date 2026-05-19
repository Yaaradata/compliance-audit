'use client';

import { getInsight, pendingAIInsights } from '../../dataModel';
import { Chip, SectionCard } from '../../primitives';
import type { OpenDrawer, SetActiveScreen } from '../../types';

type AiPredictiveSignalsPanelProps = {
  openDrawer: OpenDrawer;
  setActiveScreen: SetActiveScreen;
  className?: string;
};

/** Executive cockpit — pending AI insights (HITL queue preview). */
export function AiPredictiveSignalsPanel({
  openDrawer,
  setActiveScreen,
  className = '',
}: AiPredictiveSignalsPanelProps) {
  const queue = pendingAIInsights();

  return (
    <div className={`h-full min-h-0 ${className}`.trim()}>
      <SectionCard
        title="AI / predictive signals · this week"
        subtitle="High-confidence signals touching your risk surface"
        actions={
          <button
            type="button"
            className="text-xs font-semibold text-indigo-600"
            onClick={() => setActiveScreen('aiInsights')}
          >
            Review queue ({queue.length}) →
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {queue.slice(0, 4).map((ai) => {
            const ins = getInsight(ai.ai_insight_id);
            if (!ins) return null;
            return (
              <button
                key={ai.ai_insight_id}
                type="button"
                onClick={() => openDrawer('aiInsight', ai.ai_insight_id, 'riskPosture')}
                className="rounded-lg border border-violet-200 bg-violet-50 p-2.5 text-left hover:border-violet-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <Chip label={`${ins.signal_id} · ${ins.signal_class.replace('_', ' ')}`} tone="violet" size="xs" />
                  <span className="shrink-0 text-[10px] font-semibold text-violet-700">
                    {(ins.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-[11px] font-semibold leading-snug text-slate-900">{ins.title}</p>
              </button>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
