// @ts-nocheck
'use client';

import { useMemo, useState } from 'react';
import { aiInsights } from '@/components/UKBankingAudit/ukTraceRuntime';
import { runBoardDetectors } from '@/lib/ukbankingaudit/v5/detectors';
import {
  buildExplorerInsights,
  confidenceBandLabel,
  type AIInsightV5,
} from '@/lib/ukbankingaudit/v5/aiContract';
import { ClaimLegend } from '@/components/UKBankingAudit/v5/ClaimLine';
import { StatusBadge } from './_shared';

function DerivationDot({ derivation }: { derivation: 'RULE' | 'LLM' }) {
  return derivation === 'RULE' ? (
    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-700" aria-hidden title="RULE" />
  ) : (
    <span
      className="h-1.5 w-1.5 shrink-0 rounded-full border border-slate-500 bg-transparent"
      aria-hidden
      title="LLM"
    />
  );
}

export function AIInsightExplorerV5({ openDrawer }) {
  const [filterType, setFilterType] = useState(null);

  const allInsights: AIInsightV5[] = useMemo(
    () => buildExplorerInsights(aiInsights || [], runBoardDetectors('UK')),
    [],
  );

  const filtered = filterType
    ? allInsights.filter((i) => i.type === filterType)
    : allInsights;

  const types = [...new Set(allInsights.map((i) => i.type))];

  const openInsight = (insight: AIInsightV5) => {
    const entityId = insight.boardSignalId ?? insight.id;
    openDrawer('aiInsight', entityId, 'aiInsights');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">AI Insight Explorer</h2>
        <p className="text-xs text-slate-500">
          {allInsights.length} insights · board signals share the same citation contract · explainable, cited
        </p>
      </div>

      <ClaimLegend />

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500">Type:</span>
        <button
          onClick={() => setFilterType(null)}
          className={`px-2.5 py-1 text-xs rounded ${!filterType ? 'bg-indigo-100 text-indigo-700 font-medium' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          All
        </button>
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-2.5 py-1 text-xs rounded ${filterType === t ? 'bg-indigo-100 text-indigo-700 font-medium' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {t.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((i) => (
          <button
            key={i.id}
            onClick={() => openInsight(i)}
            className="text-left p-5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-2 gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <DerivationDot derivation={i.derivation} />
                <span className="text-[10px] font-bold tracking-wider bg-violet-100 text-violet-800 px-2 py-0.5 rounded">
                  AI · {i.type.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
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
            <h4 className="text-sm font-bold text-slate-900 mb-1">{i.title}</h4>
            <p className="text-xs text-slate-600 line-clamp-3 mb-3">{i.summary}</p>
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>
                {i.modelId} v{i.modelVersion}
              </span>
              <span>{i.sourceRecordIds?.length || 0} sources</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
