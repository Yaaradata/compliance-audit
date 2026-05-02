'use client';

import React, { useMemo } from 'react';
import { aiInsights, controls, coverageGaps, obligations, riskDomains } from '../dataModel';
import { DimCell, StatusBadge } from '../primitives';
import { Sparkline } from '../primitives';
import { bandBg, bandDot, bandText, trendArrow, trendTone } from '../theme';

type OpenDrawer = (entityType: string, entityId: string, sourceScreen: string) => void;

export function LeadershipControlUniverse({
  activeViewMode,
  setActiveViewMode,
  openDrawer,
  filterDomain,
  setFilterDomain,
}: {
  activeViewMode: string;
  setActiveViewMode: (m: string) => void;
  openDrawer: OpenDrawer;
  filterDomain: string | null;
  setFilterDomain: (id: string | null) => void;
}) {
  const filtered = useMemo(() => {
    if (!filterDomain) return controls;
    const dom = riskDomains.find((d) => d.id === filterDomain);
    if (!dom) return controls;
    return controls.filter((c) => (c as { linkedRiskIds?: string[] }).linkedRiskIds?.[0] === dom.primaryDriverRiskId);
  }, [filterDomain]);

  const obligationsCoverage = useMemo(() => {
    const buckets: { fully_covered: typeof obligations; thinly_covered: typeof obligations; uncovered: typeof obligations } = {
      fully_covered: [],
      thinly_covered: [],
      uncovered: [],
    };
    obligations.forEach((o) => {
      const k = o.ocs.coverageStatus as keyof typeof buckets;
      if (buckets[k]) buckets[k].push(o);
    });
    return buckets;
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Control Universe & Obligation Coverage</h2>
          <p className="text-xs text-slate-500">
            SMF16/17 leadership view · {controls.length} controls · {obligations.length} obligations
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-0.5">
          {(['controls', 'obligations'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setActiveViewMode(m)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${activeViewMode === m ? 'bg-white shadow-sm' : 'text-slate-600'}`}
            >
              {m === 'controls' ? 'Controls' : 'Obligation Coverage'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500">Domain:</span>
        <button
          type="button"
          onClick={() => setFilterDomain(null)}
          className={`rounded px-2.5 py-1 text-xs ${!filterDomain ? 'bg-indigo-100 font-medium text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          All
        </button>
        {riskDomains.slice(0, 5).map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setFilterDomain(d.id)}
            className={`rounded px-2.5 py-1 text-xs ${filterDomain === d.id ? 'bg-indigo-100 font-medium text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-9">
          {activeViewMode === 'controls' ? (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="grid grid-cols-12 gap-3 border-b border-slate-100 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <div className="col-span-4">Control</div>
                <div className="col-span-2 text-center">Operating</div>
                <div className="col-span-2 text-center">Catch</div>
                <div className="col-span-2 text-center">Evidence</div>
                <div className="col-span-1 text-center">CES</div>
                <div className="col-span-1 text-right">Trend</div>
              </div>
              <div className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => openDrawer('control', c.id, 'controlUniverse')}
                    className="grid w-full grid-cols-12 items-center gap-3 px-5 py-3 text-left transition hover:bg-slate-50"
                  >
                    <div className="col-span-4">
                      <div className="text-sm font-semibold text-slate-900">{c.id}</div>
                      <div className="truncate text-xs text-slate-600">{c.title}</div>
                    </div>
                    <DimCell dim={c.threeDim.operating} />
                    <DimCell dim={c.threeDim.catch} />
                    <DimCell dim={c.threeDim.evidence} />
                    <div className="col-span-1 text-center">
                      <div className={`inline-block rounded px-2 py-0.5 text-sm font-bold ${bandBg(c.ces.band)}`}>{c.ces.current}</div>
                    </div>
                    <div className={`col-span-1 text-right text-xs font-medium ${trendTone(c.ces.trend)}`}>
                      {trendArrow(c.ces.trend)} {c.ces.delta13w >= 0 ? '+' : ''}
                      {c.ces.delta13w}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-3">
                <h3 className="text-sm font-semibold">Obligation Coverage by Status</h3>
              </div>
              <div className="grid grid-cols-3 divide-x divide-slate-100">
                {(
                  [
                    { key: 'fully_covered' as const, label: 'Fully Covered', tone: 'green' },
                    { key: 'thinly_covered' as const, label: 'Thinly Covered', tone: 'amber' },
                    { key: 'uncovered' as const, label: 'Uncovered', tone: 'red' },
                  ] as const
                ).map((b) => (
                  <div key={b.key} className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <div className={`text-2xl font-bold ${bandText(b.tone)}`}>{(obligationsCoverage[b.key] || []).length}</div>
                        <div className="text-xs text-slate-500">{b.label}</div>
                      </div>
                      <span className={`h-3 w-3 rounded-full ${bandDot(b.tone)}`} />
                    </div>
                    <div className="space-y-1">
                      {(obligationsCoverage[b.key] || []).map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => openDrawer('obligation', o.id, 'controlUniverse')}
                          className="w-full rounded px-2 py-1.5 text-left text-xs hover:bg-slate-50"
                        >
                          <div className="truncate font-medium text-slate-900">{o.citationShort}</div>
                          <div className="truncate text-[10px] text-slate-500">
                            {o.regulator} · OCS {o.ocs.score}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="col-span-12 space-y-4 lg:col-span-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Coverage Gaps</h3>
            <div className="space-y-2">
              {coverageGaps.map((g) => (
                <div
                  key={g.id}
                  className={`rounded border p-2 ${bandBg(g.severity === 'high' || g.severity === 'critical' ? 'red' : g.severity === 'medium' ? 'amber' : 'neutral')}`}
                >
                  <div className="mb-1 flex items-start justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider">{g.gapType.replace(/_/g, ' ')}</span>
                    <span className="text-[10px]">{g.ageDays}d</span>
                  </div>
                  <div className="text-xs font-medium">{g.entityId}</div>
                  <div className="mt-1 line-clamp-2 text-[10px]">{g.recommendedRemediation}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Domain AI Insights</h3>
            <div className="space-y-2">
              {aiInsights
                .filter((i) => i.screenRelevance.includes('controlUniverse'))
                .slice(0, 3)
                .map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => openDrawer('aiInsight', i.id, 'controlUniverse')}
                    className="w-full rounded border border-slate-200 p-2 text-left hover:border-indigo-300 hover:bg-indigo-50/30"
                  >
                    <div className="line-clamp-1 text-xs font-medium text-slate-900">{i.title}</div>
                    <div className="mt-0.5 text-[10px] text-slate-500">
                      conf {Math.round(i.confidence * 100)}% · {i.type.replace('_', ' ')}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
