'use client';

import React, { useState } from 'react';
import {
  aggregateARS,
  aiInsights,
  appetiteObservations,
  controlInstances,
  getAppetite,
  getKRI,
  incidents,
  issues,
  kriObservations,
  pacNotes,
  preventiveActions,
  reportingClocks,
} from '../dataModel';
import { Chip, EmptyState, SectionCard, SeverityBadge } from '../primitives';
import { bandText } from '../theme';
import type { OpenDrawer } from '../types';

const fmtDate = (iso: string | null | undefined) => (iso ? iso.slice(0, 10) : '—');

function weekCutInclusive6Local() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - 6);
  return d.getTime();
}

function parseDisc(iso: string) {
  return new Date(iso.includes('T') ? iso : `${iso}T12:00:00`).getTime();
}

function parseTsWeek(iso?: string | null) {
  if (!iso) return NaN;
  return new Date(iso).getTime();
}

function pacNoteLabel(pn: (typeof pacNotes)[number]) {
  if (pn.title?.trim()) return pn.title;
  const dt = (pn.document_type || 'PAC').replace(/_/g, ' ');
  return `${dt} · ${pn.business_unit || 'ORM'}`;
}

export function WhatChangedThisWeek({
  openDrawer,
}: {
  openDrawer: OpenDrawer;
}) {
  const w0 = weekCutInclusive6Local();
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

  const newIncidentsWeek = incidents
    .filter((i) => {
      const t = parseDisc(i.discovered_date);
      return !Number.isNaN(t) && t >= w0;
    })
    .sort((a, b) => parseDisc(b.discovered_date) - parseDisc(a.discovered_date));
  const last3IncidentTitles = newIncidentsWeek.slice(0, 3).map((i) => i.title);

  const pasClosedWeek = preventiveActions.filter((p) => {
    if (p.status !== 'closed') return false;
    const t = p.closed_at ? parseTsWeek(p.closed_at) : NaN;
    return !Number.isNaN(t) && t >= w0;
  });

  const pacProcessedWeek = pacNotes.filter((pn) => {
    const t = parseTsWeek(pn.approved_at);
    return !Number.isNaN(t) && t >= w0;
  });
  const pacApproved = pacProcessedWeek.filter((p) => p.status === 'approved').length;
  const pacConditional = pacProcessedWeek.filter((p) => p.status === 'conditional_approval').length;
  const pacRejected = pacProcessedWeek.filter((p) => p.status === 'rejected').length;

  const [summaryDetail, setSummaryDetail] = useState<'incidents' | 'pas' | 'pac' | null>(null);

  return (
    <div className="min-w-0 space-y-5">
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

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 lg:items-stretch [&>*]:min-h-0">
        <DeltaColumn
          title={`New incidents (${newIncidentsWeek.length})`}
          tone="indigo"
          variant="summary"
          selected={summaryDetail === 'incidents'}
          onCardPress={() => setSummaryDetail((s) => (s === 'incidents' ? null : 'incidents'))}
        >
          <div className="flex flex-1 flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 text-left text-slate-800 sm:p-3.5">
            <div className="text-sm font-bold text-slate-900">Last {Math.min(3, last3IncidentTitles.length)} titles</div>
            <ul className="list-outside list-disc space-y-2 pl-4 text-sm leading-snug text-slate-700">
              {last3IncidentTitles.map((t) => (
                <li key={t} className="line-clamp-3">
                  {t}
                </li>
              ))}
              {!last3IncidentTitles.length && <li className="list-none pl-0 text-sm text-slate-400">None in window</li>}
            </ul>
          </div>
        </DeltaColumn>

        <DeltaColumn
          title={`Preventive actions closed (${pasClosedWeek.length})`}
          tone="emerald"
          variant="summary"
          selected={summaryDetail === 'pas'}
          onCardPress={() => setSummaryDetail((s) => (s === 'pas' ? null : 'pas'))}
        >
          <div className="flex flex-1 flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 text-left sm:p-3.5">
            {pasClosedWeek.length ? (
              <>
                <div className="text-4xl font-bold tabular-nums leading-none tracking-tight text-slate-900 sm:text-5xl">{pasClosedWeek.length}</div>
                <div className="text-sm font-semibold text-slate-900">Closed in the last 7 days</div>
                <p className="text-sm leading-snug text-slate-600">Linked RCAs and evidence in workspace</p>
              </>
            ) : (
              <span className="text-sm text-slate-400">None closed this week</span>
            )}
          </div>
        </DeltaColumn>

        <DeltaColumn
          title={`PAC notes processed (${pacProcessedWeek.length})`}
          tone="violet"
          variant="summary"
          selected={summaryDetail === 'pac'}
          onCardPress={() => setSummaryDetail((s) => (s === 'pac' ? null : 'pac'))}
        >
          <div className="flex flex-1 flex-col gap-2.5 rounded-lg border border-slate-200 bg-white p-3 text-left text-sm text-slate-800 sm:p-3.5">
            <div className="flex items-baseline justify-between gap-2 border-b border-slate-100 pb-2">
              <span className="font-medium text-slate-600">Approved</span>
              <span className="text-lg font-bold tabular-nums text-emerald-800">{pacApproved}</span>
            </div>
            <div className="flex items-baseline justify-between gap-2 border-b border-slate-100 pb-2">
              <span className="font-medium text-slate-600">Conditional</span>
              <span className="text-lg font-bold tabular-nums text-violet-800">{pacConditional}</span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-medium text-slate-600">Rejected</span>
              <span className="text-lg font-bold tabular-nums text-rose-800">{pacRejected}</span>
            </div>
          </div>
        </DeltaColumn>
      </div>
      <p className="text-center text-sm text-slate-500">Click a summary card to show the full 7-day list below.</p>

      {summaryDetail ? (
        <SectionCard
          title={
            summaryDetail === 'incidents'
              ? `New incidents · last 7 days (${newIncidentsWeek.length})`
              : summaryDetail === 'pas'
                ? `Preventive actions closed · last 7 days (${pasClosedWeek.length})`
                : `PAC notes processed · last 7 days (${pacProcessedWeek.length})`
          }
          subtitle={
            summaryDetail === 'pac'
              ? 'Each row shows outcome and decision date in the last 7 days.'
              : 'Click a title to open that record in the drawer.'
          }
          actions={
            <button
              type="button"
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => setSummaryDetail(null)}
            >
              Close
            </button>
          }
        >
          {summaryDetail === 'incidents' ? (
            newIncidentsWeek.length ? (
              <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
                {newIncidentsWeek.map((inc) => (
                  <li key={inc.incident_id} className="flex flex-wrap items-start gap-2 px-3 py-2.5">
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left text-sm font-medium text-indigo-800 hover:underline"
                      onClick={() => openDrawer('incident', inc.incident_id, 'whatChanged')}
                    >
                      {inc.title}
                    </button>
                    <div className="flex shrink-0 flex-col items-end gap-0.5 text-[10px] text-slate-500">
                      <span>{fmtDate(inc.discovered_date)}</span>
                      <span className="font-mono text-slate-400">{inc.incident_id}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState message="No incidents discovered in the last 7 days." />
            )
          ) : null}

          {summaryDetail === 'pas' ? (
            pasClosedWeek.length ? (
              <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
                {pasClosedWeek.map((pa) => (
                  <li key={pa.preventive_action_id} className="flex flex-wrap items-start gap-2 px-3 py-2.5">
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left text-sm font-medium text-emerald-900 hover:underline"
                      onClick={() => openDrawer('preventiveAction', pa.preventive_action_id, 'whatChanged')}
                    >
                      {pa.title || pa.preventive_action_id}
                    </button>
                    <div className="flex shrink-0 flex-col items-end gap-0.5 text-[10px] text-slate-500">
                      <span>Closed {fmtDate(pa.closed_at)}</span>
                      <span className="font-mono text-slate-400">{pa.rca_id}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState message="No preventive actions were closed in the last 7 days." />
            )
          ) : null}

          {summaryDetail === 'pac' ? (
            pacProcessedWeek.length ? (
              <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
                {pacProcessedWeek.map((pn) => (
                  <li key={pn.pac_note_id} className="flex flex-wrap items-start gap-2 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-900">{pacNoteLabel(pn)}</div>
                      <div className="mt-0.5 font-mono text-[10px] text-slate-500">{pn.pac_note_id}</div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1 text-[10px]">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 font-semibold capitalize text-slate-700">
                        {(pn.status || '—').replace(/_/g, ' ')}
                      </span>
                      <span className="text-slate-500">Decision {fmtDate(pn.approved_at)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState message="No PAC notes were processed in the last 7 days." />
            )
          ) : null}
        </SectionCard>
      ) : null}

      <SectionCard title="Weekly narrative · auto-drafted" subtitle="AI-generated period summary; human-editable before BRMC">
        <p className="text-sm leading-relaxed text-slate-700">
          This week, the bank's residual posture moved on three fronts. <strong>R-FC-001 (AML / STR)</strong> deteriorated as
          KRI-FC-001 (L1 backlog) crossed into red at 287 alerts; this is concentrated at the VEND-2024-00203 BPO floor and is
          being triaged via ISS-2026-009. <strong>R-CD-001 (Digital Lending Conduct)</strong> shows 11,118 KFS-after-acceptance
          instances on DSA-Newgen — see ISS-2026-085 and AI-013, with CIO veto DE-003 halting new product launch on that channel.
          On the positive side, RTS held at on-time for CIMS Q1 (RS-CIMS-2025-Q1) and CERT-In dry runs continue to clear within
          6h. Supervisory readiness aggregate ARS sits at <em>{aggregateARS()}</em>; PMLA / FIU lens needs the most attention.
        </p>
      </SectionCard>
    </div>
  );
}

function DeltaColumn({
  title,
  tone,
  children,
  footer,
  variant = 'lane',
  onCardPress,
  selected,
}: {
  title: string;
  tone: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** `lane`: column stretched to grid row height (top deltas). `summary`: compact KPI card. */
  variant?: 'lane' | 'summary';
  /** When set, summary card is a button (toggle detail below). */
  onCardPress?: () => void;
  selected?: boolean;
}) {
  const badgeClass =
    ({
      rose: 'bg-rose-100 text-rose-800 border-rose-200',
      amber: 'bg-amber-100 text-amber-800 border-amber-200',
      violet: 'bg-violet-100 text-violet-800 border-violet-200',
      emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    } as Record<string, string>)[tone] || 'bg-slate-100 text-slate-700 border-slate-200';

  const badge = (
    <div
      className={`inline-flex max-w-full shrink-0 items-center gap-1 rounded-full border font-semibold uppercase tracking-wider ${badgeClass} ${
        variant === 'summary' ? 'px-2.5 py-1 text-[11px]' : 'px-2 py-0.5 text-[10px]'
      }`}
    >
      <span className="truncate">{title}</span>
    </div>
  );

  if (variant === 'summary') {
    const shell =
      'flex min-w-0 flex-col rounded-xl border p-3 shadow-sm sm:p-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2';
    const border = selected ? 'border-indigo-400 bg-white ring-2 ring-indigo-200/90' : 'border-slate-200/90 bg-slate-50/50';
    const hover = onCardPress ? 'hover:border-indigo-300 hover:bg-white' : '';
    const body = (
      <>
        <div className="shrink-0">{badge}</div>
        <div className="mt-2 flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
      </>
    );
    if (onCardPress) {
      return (
        <button
          type="button"
          className={`${shell} ${border} ${hover} h-full min-h-0 w-full cursor-pointer text-left font-sans`}
          onClick={onCardPress}
        >
          {body}
        </button>
      );
    }
    return (
      <div className={`${shell} ${border} flex h-full min-h-0 w-full flex-col`}>
        {body}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 shadow-sm">
      <div className="shrink-0">{badge}</div>
      <div className="mt-2 flex min-h-0 min-w-0 flex-1 flex-col gap-2">
        <div className="min-h-0 min-w-0 flex-1 space-y-2">{children}</div>
        {footer ? <div className="shrink-0 border-t border-slate-200/70 pt-3">{footer}</div> : null}
      </div>
    </div>
  );
}
