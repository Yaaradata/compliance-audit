'use client';

import React, { useState } from 'react';
import { aiInsights } from '../dataModel';
import { StatusBadge } from '../primitives';

type OpenDrawer = (entityType: string, entityId: string, sourceScreen: string) => void;

export function AiInsightExplorer({ openDrawer }: { openDrawer: OpenDrawer }) {
  const [filterType, setFilterType] = useState<string | null>(null);
  const filtered = filterType ? aiInsights.filter((i) => i.type === filterType) : aiInsights;
  const types = [...new Set(aiInsights.map((i) => i.type))];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">AI Insight Explorer</h2>
        <p className="text-xs text-slate-500">{aiInsights.length} insights · explainable, cited, counter-factual where applicable</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500">Type:</span>
        <button
          type="button"
          onClick={() => setFilterType(null)}
          className={`rounded px-2.5 py-1 text-xs ${!filterType ? 'bg-indigo-100 font-medium text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          All
        </button>
        {types.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilterType(t)}
            className={`rounded px-2.5 py-1 text-xs ${filterType === t ? 'bg-indigo-100 font-medium text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((i) => (
          <button
            key={i.id}
            type="button"
            onClick={() => openDrawer('aiInsight', i.id, 'aiInsights')}
            className="rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-indigo-300 hover:shadow-md"
          >
            <div className="mb-2 flex items-start justify-between">
              <span className="rounded bg-violet-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-violet-800">
                AI · {i.type.replace('_', ' ')}
              </span>
              <div className="flex items-center gap-2">
                <StatusBadge
                  tone={i.severity === 'high' ? 'red' : i.severity === 'medium' ? 'amber' : 'green'}
                  label={i.severity.toUpperCase()}
                  size="xs"
                />
                <span className="text-[10px] text-slate-500">conf {Math.round(i.confidence * 100)}%</span>
              </div>
            </div>
            <h4 className="mb-1 text-sm font-bold text-slate-900">{i.title}</h4>
            <p className="mb-3 line-clamp-3 text-xs text-slate-600">{i.summary}</p>
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
