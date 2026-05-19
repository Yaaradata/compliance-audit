'use client';

import { Chip, EmptyState, SeverityBadge } from '../../primitives';
import { bandText } from '../../theme';
import type { OpenDrawer } from '../../types';
import { DeltaColumn } from './DeltaColumn';
import { useWhatChangedWeekData } from './useWhatChangedWeekData';

export function WhatChangedDeltaLanes({ openDrawer }: { openDrawer: OpenDrawer }) {
  const {
    fmtDate,
    recentIssues,
    failingCIs,
    recentInsights,
    kriDeltas,
    appetiteBreaches,
    reportingBreaches,
    getKRI,
    getAppetite,
  } = useWhatChangedWeekData();

  return (
    <div className="grid min-w-0 grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-5 lg:items-stretch lg:gap-3">
      <DeltaColumn title={`New Issues (${recentIssues.length})`} tone="rose">
        {recentIssues.map((i) => (
          <button
            key={i.issue_id}
            type="button"
            onClick={() => openDrawer('issue', i.issue_id, 'whatChanged')}
            className="block w-full min-w-0 rounded border border-slate-200 bg-white p-2 text-left text-xs hover:border-amber-300"
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <SeverityBadge severity={i.severity} />
              <span className="text-[10px] text-slate-500">{fmtDate(i.opened_at)}</span>
            </div>
            <div className="font-semibold text-slate-900">{i.title}</div>
            <div className="mt-1 font-mono text-[10px] text-slate-500">{i.issue_id}</div>
          </button>
        ))}
        {!recentIssues.length && <EmptyState message="No new issues this week" />}
      </DeltaColumn>

      <DeltaColumn title={`CES movements (${failingCIs.length})`} tone="amber">
        {failingCIs.map((ci) => (
          <button
            key={ci.control_instance_id}
            type="button"
            onClick={() => openDrawer('controlInstance', ci.control_instance_id, 'whatChanged')}
            className="block w-full min-w-0 rounded border border-slate-200 bg-white p-2 text-left text-xs hover:border-rose-300"
          >
            <div className="mb-1 flex items-center justify-between">
              <Chip label={ci.control_id} tone="indigo" size="xs" />
              <span className="text-[10px] text-rose-700">FAIL</span>
            </div>
            <div className="font-mono text-[10px] text-slate-700">{ci.subject_id}</div>
            <div className="mt-1 line-clamp-2 text-[10px] text-slate-600">{ci.fail_reason}</div>
          </button>
        ))}
      </DeltaColumn>

      <DeltaColumn title={`AI / predictive signals (${recentInsights.length})`} tone="violet">
        {recentInsights.map((a) => (
          <button
            key={a.ai_insight_id}
            type="button"
            onClick={() => openDrawer('aiInsight', a.ai_insight_id, 'whatChanged')}
            className="block w-full min-w-0 rounded border border-violet-200 bg-violet-50 p-2 text-left text-xs hover:border-violet-400"
          >
            <div className="mb-1 flex items-center justify-between">
              <Chip label={a.signal_id} tone="violet" size="xs" />
              <span className="text-[10px] text-violet-700">{(a.confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="font-semibold text-slate-900">{a.title}</div>
          </button>
        ))}
      </DeltaColumn>

      <DeltaColumn title={`KRI band changes (${kriDeltas.length})`} tone="amber">
        {kriDeltas.map((delta) => {
          const kri = getKRI(delta.kriId);
          return (
            <div key={delta.kriId} className="rounded border border-slate-200 bg-white p-2 text-xs">
              <div className="mb-1 flex items-center justify-between">
                <Chip label={delta.kriId} tone="slate" size="xs" />
                <span className={`text-[10px] font-semibold ${bandText(delta.current)}`}>
                  {delta.prev} → {delta.current}
                </span>
              </div>
              <div className="text-[11px] font-medium text-slate-700">{kri?.name || delta.kriId}</div>
              <div className="mt-0.5 text-[10px] text-slate-500">value: {delta.value}</div>
            </div>
          );
        })}
        {!kriDeltas.length && <EmptyState message="No band changes" />}
      </DeltaColumn>

      <DeltaColumn title={`Reporting breaches (${reportingBreaches.length})`} tone="rose">
        {reportingBreaches.map((c) => (
          <div key={c.clock_id} className="rounded border border-amber-300 bg-amber-50 p-2 text-xs">
            <div className="font-semibold text-amber-900">{c.clock_label}</div>
            <div className="font-mono text-[10px] text-amber-700">
              {c.clock_id} · {c.current_status}
            </div>
          </div>
        ))}
        {appetiteBreaches.map((ob) => {
          const am = getAppetite(ob.appetite_metric_id);
          return (
            <div
              key={ob.observation_id}
              className={`rounded border p-2 text-xs ${ob.band === 'red' ? 'border-rose-300 bg-rose-50' : 'border-amber-300 bg-amber-50'}`}
            >
              <div className="font-semibold text-slate-900">{am?.name || ob.appetite_metric_id}</div>
              <div className="text-[10px] text-slate-600">
                value {ob.value} · threshold {am?.board_approved_threshold ?? '—'}
              </div>
            </div>
          );
        })}
        {!reportingBreaches.length && !appetiteBreaches.length && <EmptyState message="No breaches" />}
      </DeltaColumn>
    </div>
  );
}
