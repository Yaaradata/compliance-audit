// @ts-nocheck
'use client';

import { useMemo } from 'react';
import { aiInsights } from '@/components/UKBankingAudit/ukTraceRuntime';
import { runBoardDetectors } from '@/lib/ukbankingaudit/v6/detectors';
import {
  buildExplorerInsights,
  confidenceBandLabel,
  type AIInsightV6,
} from '@/lib/ukbankingaudit/v6/aiContract';
import {
  personaLabel,
  selectInsightsForView,
  type UkbaPersonaId,
} from '@/lib/ukbankingaudit/v6/insightViews';
import { ClaimLegend } from '@/components/UKBankingAudit/v6/ClaimLine';
import { StatusBadge } from './_shared';

function DerivationDot({ derivation }: { derivation: 'RULE' | 'LLM' }) {
  return derivation === 'RULE' ? (
    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-700" aria-hidden title="RULE" />
  ) : (
    <span
      className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full border border-slate-500 bg-transparent"
      aria-hidden
      title="LLM"
    />
  );
}

type Props = {
  openDrawer: (entityType: string, entityId: string, sourceScreen: string) => void;
  activePersona?: UkbaPersonaId | string;
};

/**
 * v6 AI Insight Explorer — persona-scoped, screen-owned, deduplicated.
 * Board detector signals owned by CRO stay on Board View and do not reappear here.
 */
export function AIInsightExplorerV6({ openDrawer, activePersona = 'cro' }: Props) {
  const catalogue: AIInsightV6[] = useMemo(
    () => buildExplorerInsights(aiInsights || [], runBoardDetectors('UK')),
    [],
  );

  const personaInsights = useMemo(
    () =>
      selectInsightsForView(catalogue, {
        persona: activePersona,
        screen: 'aiInsights',
      }),
    [catalogue, activePersona],
  );

  const openInsight = (insight: AIInsightV6) => {
    const entityId = insight.boardSignalId ?? insight.id;
    openDrawer('aiInsight', entityId, 'aiInsights');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-violet-700">
              AI Insights · {personaLabel(activePersona)}
            </div>
            <h2 className="mt-0.5 text-lg font-bold text-slate-900">AI Insight Explorer</h2>
            <p className="mt-1 max-w-2xl text-xs text-slate-500">
              Unique insights owned by this screen for the active persona. Board signals already
              shown on Board View are not repeated here.
            </p>
          </div>
          <div className="rounded-lg border border-violet-100 bg-violet-50 px-3 py-2 text-right">
            <div className="text-2xl font-bold text-violet-800">{personaInsights.length}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-violet-600">
              unique for persona
            </div>
          </div>
        </div>

        <div className="mt-4">
          <ClaimLegend />
        </div>
      </div>

      {personaInsights.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-700">No unique insights for this persona on AI Insights.</p>
          <p className="mt-1 text-xs text-slate-500">
            CRO board signals live on Board View. Switch persona to view another owned set.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {personaInsights.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => openInsight(i)}
              className="flex min-h-52 flex-col rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-indigo-300 hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                  <DerivationDot derivation={i.derivation} />
                  <span>{i.derivation}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge
                    tone={i.severity === 'high' ? 'red' : i.severity === 'medium' ? 'amber' : 'green'}
                    label={i.severity.toUpperCase()}
                    size="xs"
                  />
                  <span className="text-[10px] font-semibold text-slate-600">
                    {confidenceBandLabel(i.confidenceBand)}
                  </span>
                </div>
              </div>

              <h3 className="text-sm font-bold leading-snug text-slate-900">{i.title}</h3>
              <p className="mt-2 line-clamp-4 flex-1 text-xs leading-relaxed text-slate-600">
                {i.summary}
              </p>

              <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-3 text-[10px] text-slate-500">
                <div>
                  <div className="font-medium text-slate-700">{i.modelId}</div>
                  <div>v{i.modelVersion}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-700">{i.sourceRecordIds?.length || 0}</div>
                  <div>sources</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
