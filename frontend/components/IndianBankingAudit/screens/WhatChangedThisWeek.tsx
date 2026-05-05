'use client';

import React from 'react';
import {
  aggregateARS,
  aiInsights,
  appetiteObservations,
  controlInstances,
  getAppetite,
  getKRI,
  issues,
  kriObservations,
  reportingClocks,
} from '../dataModel';
import { Chip, EmptyState, SectionCard, SeverityBadge } from '../primitives';
import { bandText } from '../theme';
import type { OpenDrawer } from '../types';

const fmtDate = (iso: string | null | undefined) => (iso ? iso.slice(0, 10) : '—');

export function WhatChangedThisWeek({ openDrawer }: { openDrawer: OpenDrawer }) {
  const recentIssues = [...issues].sort((a, b) => (a.opened_at < b.opened_at ? 1 : -1)).slice(0, 4);

  const failingCIs = controlInstances.filter((ci) => ci.outcome === 'Fail').slice(0, 4);

  const recentInsights = [...aiInsights]
    .sort((a, b) => (a.fired_at < b.fired_at ? 1 : -1))
    .slice(0, 4);

  // KRI band changes — find pairs where current vs previous band differ
  const kriDeltas: { kriId: string; prev: string; current: string; value: number }[] = [];
  const byKri = new Map<string, typeof kriObservations>();
  kriObservations.forEach((o) => {
    if (!byKri.has(o.kri_id)) byKri.set(o.kri_id, []);
    byKri.get(o.kri_id)!.push(o);
  });
  byKri.forEach((obs, kriId) => {
    const sorted = [...obs].sort((a, b) => (a.as_of_ts > b.as_of_ts ? -1 : 1));
    if (sorted.length >= 2 && sorted[0].band !== sorted[1].band) {
      kriDeltas.push({ kriId, prev: sorted[1].band, current: sorted[0].band, value: sorted[0].value });
    }
  });

  // Appetite breaches
  const appetiteBreaches = appetiteObservations.filter((o) => o.band === 'red' || o.band === 'amber').slice(0, 4);

  const reportingBreaches = reportingClocks.filter((c) => c.current_status === 'at_risk' || c.current_status === 'breached');

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
        <DeltaColumn title={`New Issues (${recentIssues.length})`} tone="rose">
          {recentIssues.map((i) => (
            <button
              key={i.issue_id}
              type="button"
              onClick={() => openDrawer('issue', i.issue_id, 'whatChanged')}
              className="block w-full rounded border border-slate-200 bg-white p-2 text-left text-xs hover:border-amber-300"
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
              className="block w-full rounded border border-slate-200 bg-white p-2 text-left text-xs hover:border-rose-300"
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

        <DeltaColumn title={`AI Insights (${recentInsights.length})`} tone="violet">
          {recentInsights.map((a) => (
            <button
              key={a.ai_insight_id}
              type="button"
              onClick={() => openDrawer('aiInsight', a.ai_insight_id, 'whatChanged')}
              className="block w-full rounded border border-violet-200 bg-violet-50 p-2 text-left text-xs hover:border-violet-400"
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
              <div className="font-mono text-[10px] text-amber-700">{c.clock_id} · {c.current_status}</div>
            </div>
          ))}
          {appetiteBreaches.map((ob) => {
            const am = getAppetite(ob.appetite_metric_id);
            return (
              <div key={ob.observation_id} className={`rounded border p-2 text-xs ${ob.band === 'red' ? 'border-rose-300 bg-rose-50' : 'border-amber-300 bg-amber-50'}`}>
                <div className="font-semibold text-slate-900">{am?.name || ob.appetite_metric_id}</div>
                <div className="text-[10px] text-slate-600">value {ob.value} · threshold {am?.board_approved_threshold ?? '—'}</div>
              </div>
            );
          })}
          {!reportingBreaches.length && !appetiteBreaches.length && <EmptyState message="No breaches" />}
        </DeltaColumn>
      </div>

      <SectionCard title="Weekly narrative · auto-drafted" subtitle="AI-generated period summary; human-editable before BRMC">
        <p className="text-sm leading-relaxed text-slate-700">
          This week, the bank's residual posture moved on three fronts. <strong>R-FC-001 (AML / STR)</strong> deteriorated as
          KRI-FC-001 (L1 backlog) crossed into red at 287 alerts; this is concentrated at the VEND-2024-00203 BPO floor and is
          being triaged via ISS-2026-009. <strong>R-CD-001 (Digital Lending Conduct)</strong> shows 11,118 KFS-after-acceptance
          instances on DSA-Newgen — see ISS-2026-085 and AI-013, with CIO veto DE-003 halting new product launch on that channel.
          On the positive side, RTS held at on-time for CIMS Q1 (RS-CIMS-2025-Q1) and CERT-In dry runs continue to clear within
          6h. Inspection readiness aggregate ARS sits at <em>{aggregateARS()}</em>; PMLA / FIU lens needs the most attention.
        </p>
      </SectionCard>
    </div>
  );
}

function DeltaColumn({ title, tone, children }: { title: string; tone: string; children: React.ReactNode }) {
  return (
    <div>
      <div className={`mb-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
        ({
          rose: 'bg-rose-100 text-rose-800 border-rose-200',
          amber: 'bg-amber-100 text-amber-800 border-amber-200',
          violet: 'bg-violet-100 text-violet-800 border-violet-200',
          emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        } as Record<string, string>)[tone] || 'bg-slate-100 text-slate-700 border-slate-200'
      }`}>
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
