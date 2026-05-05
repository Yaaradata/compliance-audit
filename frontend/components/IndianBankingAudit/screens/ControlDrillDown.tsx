'use client';

import React, { useMemo, useState } from 'react';
import {
  aiInsightsForControl,
  controlInstancesForControl,
  controls,
  evidenceForControlInstance,
  getControl,
  getProcess,
  getSeniorManager,
  issuesForControl,
} from '../dataModel';
import {
  CESBreakdownCard,
  Chip,
  EmptyState,
  EvidenceStatusBadge,
  HITLBadge,
  KVRow,
  OutcomeBadge,
  SectionCard,
  SeverityBadge,
} from '../primitives';
import type { OpenDrawer, SetActiveScreen } from '../types';

const TABS = ['overview', 'population', 'evidence', 'issues', 'aiInsights'] as const;
type Tab = (typeof TABS)[number];

const fmtTs = (iso: string | null | undefined) => (iso ? iso.slice(0, 19).replace('T', ' ') + 'Z' : '—');

export function ControlDrillDown({
  selectedControlId,
  setSelectedControlId,
  openDrawer,
  setActiveScreen,
}: {
  selectedControlId: string;
  setSelectedControlId: (id: string) => void;
  openDrawer: OpenDrawer;
  setActiveScreen: SetActiveScreen;
}) {
  const [tab, setTab] = useState<Tab>('overview');
  const ctrl = getControl(selectedControlId);
  if (!ctrl) return <EmptyState message="Control not found" />;
  const process = getProcess(ctrl.process_id);
  const sm = getSeniorManager(ctrl.accountable_senior_manager_id);
  const instances = controlInstancesForControl(ctrl.control_id);
  const insights = aiInsightsForControl(ctrl.control_id);
  const linkedIssues = issuesForControl(ctrl.control_id);

  const split = useMemo(() => {
    const s = { Pass: 0, Fail: 0, EvidenceGap: 0, DataGap: 0, NeedsReview: 0, NA: 0 };
    instances.forEach((i) => {
      s[i.outcome as keyof typeof s] = (s[i.outcome as keyof typeof s] || 0) + 1;
    });
    return s;
  }, [instances]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <SectionCard
        title={ctrl.title}
        subtitle={`${ctrl.control_id} · ${ctrl.type} · ${ctrl.nature} · ${ctrl.frequency}`}
        actions={
          <div className="flex items-center gap-2">
            <Chip label={sm?.role || ctrl.accountable_senior_manager_id} tone="emerald" size="xs" />
            <select
              value={selectedControlId}
              onChange={(e) => setSelectedControlId(e.target.value)}
              className="rounded border border-slate-200 bg-white px-2 py-1 text-xs"
            >
              {controls.map((c) => (
                <option key={c.control_id} value={c.control_id}>
                  {c.control_id}
                </option>
              ))}
            </select>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="rounded bg-slate-50 p-2 font-mono text-[11px] text-slate-700">{ctrl.designed_condition}</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <KVRow k="Process" v={`${process?.name || ctrl.process_id}`} />
              <KVRow k="Position" v={ctrl.position_in_step} mono />
              <KVRow k="Owner role" v={ctrl.owner_role} />
              <KVRow k="Population testable" v={ctrl.population_testable_flag ? 'yes' : 'no'} />
              <KVRow k="Linked obligations" v={ctrl.linked_obligations.join(', ') || '—'} />
              <KVRow k="Linked risks" v={ctrl.linked_risks.join(', ') || '—'} />
            </div>
          </div>
          <div>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(split).map(([k, v]) =>
                v > 0 ? (
                  <div key={k} className="rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-center">
                    <div className="text-base font-bold text-slate-900">{v}</div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-500">{k}</div>
                  </div>
                ) : null
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-3 py-1.5 text-xs font-medium transition ${tab === t ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
          >
            {t === 'overview' ? 'Overview' : t === 'population' ? `Population (${instances.length})` : t === 'evidence' ? 'Evidence' : t === 'issues' ? `Issues (${linkedIssues.length})` : `AI Insights (${insights.length})`}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid gap-4 md:grid-cols-2">
          <CESBreakdownCard
            breakdown={{
              operating: { current: ctrl.ces_breakdown.operating_rate, band: cesCompBand(ctrl.ces_breakdown.operating_rate) },
              catch: { current: ctrl.ces_breakdown.catch_rate, band: cesCompBand(ctrl.ces_breakdown.catch_rate) },
              evidence: { current: ctrl.ces_breakdown.evidence_completeness, band: cesCompBand(ctrl.ces_breakdown.evidence_completeness) },
            }}
            ces={ctrl.ces}
            cesBand={ctrl.ces_band}
          />

          <div className="space-y-3">
            <SectionCard title="Linked obligations">
              {ctrl.linked_obligations.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {ctrl.linked_obligations.map((id) => (
                    <Chip key={id} label={id} tone="violet" onClick={() => openDrawer('obligation', id, 'controlDrillDown')} />
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400">None</span>
              )}
            </SectionCard>
            <SectionCard title="Linked risks">
              {ctrl.linked_risks.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {ctrl.linked_risks.map((id) => (
                    <Chip key={id} label={id} tone="rose" onClick={() => openDrawer('risk', id, 'controlDrillDown')} />
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400">None</span>
              )}
            </SectionCard>
            <button
              type="button"
              onClick={() => setActiveScreen('populationTesting')}
              className="w-full rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              Run population test for this control →
            </button>
          </div>
        </div>
      )}

      {tab === 'population' && (
        <SectionCard title={`Population grid (${instances.length} ControlInstances)`} subtitle="Click any row → D-01 source lineage drawer">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-2 py-1.5 text-left">CI</th>
                  <th className="px-2 py-1.5 text-left">Subject</th>
                  <th className="px-2 py-1.5 text-left">Outcome</th>
                  <th className="px-2 py-1.5 text-left">Fired</th>
                  <th className="px-2 py-1.5 text-right">Latency</th>
                  <th className="px-2 py-1.5 text-left">Reason</th>
                </tr>
              </thead>
              <tbody>
                {instances.map((ci) => (
                  <tr
                    key={ci.control_instance_id}
                    className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                    onClick={() => openDrawer('controlInstance', ci.control_instance_id, 'controlDrillDown')}
                  >
                    <td className="px-2 py-1.5 font-mono text-[10px] text-slate-600">{ci.control_instance_id}</td>
                    <td className="px-2 py-1.5 font-mono text-[10px] text-slate-700">{ci.subject_id}</td>
                    <td className="px-2 py-1.5"><OutcomeBadge outcome={ci.outcome} size="xs" /></td>
                    <td className="px-2 py-1.5 text-[10px] text-slate-500">{fmtTs(ci.fire_ts)}</td>
                    <td className="px-2 py-1.5 text-right text-[10px] text-slate-600">{ci.latency_ms != null ? `${(ci.latency_ms / 1000).toFixed(1)}s` : '—'}</td>
                    <td className="px-2 py-1.5 text-[10px] text-slate-600 line-clamp-1">{ci.fail_reason || ci.evidence_gap_reason || ci.data_gap_reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {tab === 'evidence' && (
        <SectionCard title="Evidence for this control" subtitle="Mini Evidence Workbench scoped to this control">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {instances.flatMap((ci) =>
              evidenceForControlInstance(ci).map((ev) => (
                <button
                  key={ev.evidence_id + ci.control_instance_id}
                  type="button"
                  onClick={() => openDrawer('evidence', ev.evidence_id, 'controlDrillDown')}
                  className="rounded-lg border border-slate-200 bg-white p-2.5 text-left hover:border-sky-300"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-700">{ev.evidence_id}</span>
                    <EvidenceStatusBadge status={ev.evidence_status} />
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {ev.evidence_type} · {ev.source_system_id} · subj {ci.subject_id}
                  </div>
                </button>
              ))
            )}
          </div>
        </SectionCard>
      )}

      {tab === 'issues' && (
        <SectionCard title={`Linked issues (${linkedIssues.length})`}>
          {linkedIssues.length ? (
            <div className="space-y-2">
              {linkedIssues.map((iss) => (
                <button
                  key={iss.issue_id}
                  type="button"
                  onClick={() => openDrawer('issue', iss.issue_id, 'controlDrillDown')}
                  className="block w-full rounded border border-slate-200 bg-white p-2.5 text-left hover:border-amber-300"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{iss.title}</div>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-slate-500">{iss.issue_id}</span>
                        <Chip label={`${iss.ageing_days}d`} tone="slate" size="xs" />
                        {iss.rbi_mra_flag && <Chip label="RBI MRA" tone="rose" size="xs" />}
                      </div>
                    </div>
                    <SeverityBadge severity={iss.severity} />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState message="No issues linked to this control" />
          )}
        </SectionCard>
      )}

      {tab === 'aiInsights' && (
        <div className="grid gap-3 md:grid-cols-2">
          {insights.map((ai) => (
            <button
              key={ai.ai_insight_id}
              type="button"
              onClick={() => openDrawer('aiInsight', ai.ai_insight_id, 'controlDrillDown')}
              className="block w-full rounded-lg border border-violet-200 bg-violet-50 p-3 text-left hover:border-violet-400"
            >
              <div className="mb-1 flex items-center justify-between">
                <Chip label={`${ai.signal_id} · ${ai.signal_class.replace('_', ' ')}`} tone="violet" size="xs" />
                <HITLBadge status={ai.human_approval_status} />
              </div>
              <div className="text-xs font-semibold text-slate-900">{ai.title}</div>
              <div className="mt-1 text-[10px] text-slate-600">Confidence {(ai.confidence * 100).toFixed(0)}% · Model {ai.model_version}</div>
            </button>
          ))}
          {!insights.length && <EmptyState message="No AI insights for this control" />}
        </div>
      )}
    </div>
  );
}

const cesCompBand = (v: number | null) => {
  if (v == null) return 'grey';
  if (v >= 80) return 'green';
  if (v >= 60) return 'amber';
  return 'red';
};
