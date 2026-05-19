'use client';

import React, { useMemo, useState } from 'react';
import { aiInsights, getModel, modelRiskRecords } from '../dataModel';
import { allReviewQueueInsights, getReviewQueueInsight } from '../ori/saesDataIntegrity';
import { Chip, EmptyState, HITLBadge, KVRow, SectionCard } from '../primitives';
import type { OpenDrawer } from '../types';

const fmtTs = (iso: string) => iso.slice(0, 19).replace('T', ' ') + 'Z';

const SIGNAL_CLASSES = [
  'all',
  'anomaly',
  'drift',
  'coverage_gap',
  'effectiveness_decay',
  'evidence_quality',
  'cluster_rca',
  'reporting_risk',
  'accountability_gap',
  'model_risk',
];

export function AiInsightsReviewQueue({ openDrawer }: { openDrawer: OpenDrawer }) {
  const [activeClass, setActiveClass] = useState<string>('all');
  const [activeStatus, setActiveStatus] = useState<string>('pending');
  const [selectedId, setSelectedId] = useState<string | null>(aiInsights[0]?.ai_insight_id || null);

  const filtered = useMemo(() => {
    const pool = activeStatus === 'pending' ? allReviewQueueInsights() : aiInsights;
    return pool.filter((a) => {
      if (activeClass !== 'all' && a.signal_class !== activeClass) return false;
      if (activeStatus !== 'all' && a.human_approval_status !== activeStatus) return false;
      return true;
    });
  }, [activeClass, activeStatus]);

  const selected = selectedId ? getReviewQueueInsight(selectedId) ?? null : null;
  const model = selected ? getModel(selected.model_id) : null;
  const mrr = model ? modelRiskRecords.find((r) => r.model_id === model.model_id) : null;

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    aiInsights.forEach((a) => {
      c[a.signal_class] = (c[a.signal_class] || 0) + 1;
    });
    return c;
  }, []);

  return (
    <div className="space-y-5">
      {/* Signal class strip */}
      <div className="flex flex-wrap gap-2">
        {SIGNAL_CLASSES.map((sc) => (
          <button
            key={sc}
            type="button"
            onClick={() => setActiveClass(sc)}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
              activeClass === sc ? 'border-violet-300 bg-violet-100 text-violet-800' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {sc.replace('_', ' ')}
            {sc !== 'all' && <span className="rounded bg-white/60 px-1 text-[10px]">{counts[sc] || 0}</span>}
          </button>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500">Status:</span>
        {['pending', 'accepted', 'rejected', 'escalated', 'all'].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setActiveStatus(st)}
            className={`rounded px-2 py-0.5 text-[10px] font-medium ${activeStatus === st ? 'bg-violet-100 text-violet-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {st}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Insights list */}
        <div className="lg:col-span-2">
          <SectionCard title={`Insights queue (${filtered.length})`} subtitle="Each row links to evidence + source records + cited recommendation">
            <div className="space-y-2">
              {filtered.map((ai) => {
                const isActive = ai.ai_insight_id === selectedId;
                return (
                  <button
                    key={ai.ai_insight_id}
                    type="button"
                    onClick={() => setSelectedId(ai.ai_insight_id)}
                    className={`block w-full rounded-lg border p-3 text-left transition ${isActive ? 'border-violet-400 bg-violet-50' : 'border-slate-200 bg-white hover:border-violet-300'}`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <Chip label={`${ai.signal_id} · ${ai.signal_class.replace('_', ' ')}`} tone="violet" size="xs" />
                      <HITLBadge status={ai.human_approval_status} />
                    </div>
                    <div className="text-xs font-semibold text-slate-900">{ai.title}</div>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Model {ai.model_version} · fired {fmtTs(ai.fired_at)}</span>
                      <ConfidenceMeter confidence={ai.confidence} thresholds={ai.threshold} />
                    </div>
                  </button>
                );
              })}
              {!filtered.length && <EmptyState message="No insights match these filters" />}
            </div>
          </SectionCard>
        </div>

        {/* Insight Detail Panel */}
        <div className="space-y-4">
          {selected ? (
            <>
              <SectionCard title="Insight detail" actions={<HITLBadge status={selected.human_approval_status} />}>
                <div className="text-xs font-semibold text-slate-900">{selected.title}</div>
                <div className="mt-2 text-[10px] uppercase tracking-wider text-violet-700">Recommendation</div>
                <p className="text-xs text-slate-700">{selected.recommendation}</p>
                <div className="mt-2 text-[10px] uppercase tracking-wider text-rose-700">Risk if wrong</div>
                <p className="text-xs text-slate-700">{selected.risk_if_wrong}</p>
              </SectionCard>

              <SectionCard title="Cited evidence">
                <div className="flex flex-wrap gap-1.5">
                  {selected.cited_evidence_ids.length ? (
                    selected.cited_evidence_ids.map((id) => (
                      <Chip key={id} label={id} tone="sky" onClick={() => openDrawer('evidence', id, 'aiInsights')} />
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">None</span>
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Cited source records">
                <div className="flex flex-wrap gap-1.5">
                  {selected.cited_source_record_ids.length ? (
                    selected.cited_source_record_ids.map((id) => (
                      <Chip key={id} label={id} tone="slate" onClick={() => openDrawer('sourceRecord', id, 'aiInsights')} />
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">None</span>
                  )}
                </div>
              </SectionCard>

              {model && (
                <SectionCard title="Model · MRM snapshot">
                  <KVRow k="Model" v={model.model_name} />
                  <KVRow k="Type" v={model.model_type} />
                  <KVRow k="Version" v={model.model_version} mono />
                  <KVRow k="Last validation" v={model.last_validation_date.slice(0, 10)} />
                  {mrr && <KVRow k="MRR" v={`${mrr.validation_outcome} · drift ${mrr.drift_status}`} />}
                  {mrr && <KVRow k="AITES" v={mrr.aites} />}
                </SectionCard>
              )}

              <div className="grid grid-cols-3 gap-2">
                <button type="button" className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700">Accept</button>
                <button type="button" className="rounded-md bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700">Reject</button>
                <button type="button" className="rounded-md bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700">Escalate</button>
              </div>
            </>
          ) : (
            <EmptyState message="Select an insight" />
          )}
        </div>
      </div>
    </div>
  );
}

function ConfidenceMeter({ confidence, thresholds }: { confidence: number; thresholds: { alert: number; review: number; action: number } }) {
  const pct = confidence * 100;
  const tone = confidence >= thresholds.action ? 'green' : confidence >= thresholds.review ? 'amber' : confidence >= thresholds.alert ? 'amber' : 'red';
  const colors: Record<string, string> = {
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-rose-500',
  };
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full ${colors[tone]}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-bold text-slate-700">{pct.toFixed(0)}%</span>
    </div>
  );
}
