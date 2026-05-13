'use client';

import React, { useMemo, useState } from 'react';
import { auditTrailForEntity, getControl, getSeniorManager, issues, remediationsForIssue, rootCauseClusters } from '../dataModel';
import { Chip, EmptyState, KVRow, SectionCard, SeverityBadge } from '../primitives';
import type { OpenDrawer } from '../types';

const fmtTs = (iso: string | null) => (iso ? iso.slice(0, 19).replace('T', ' ') + 'Z' : '—');
const fmtDate = (iso: string | null) => (iso ? iso.slice(0, 10) : '—');

const SEVERITIES = ['all', 'high', 'medium', 'low'];
const STATUSES = ['all', 'open', 'in_remediation', 'awaiting_retest', 'closed'];

export function IssueRemediationBoard({ openDrawer }: { openDrawer: OpenDrawer }) {
  const [activeSeverity, setActiveSeverity] = useState<string>('all');
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [rbiOnly, setRbiOnly] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(issues[0]?.issue_id || null);

  const filtered = useMemo(
    () =>
      issues.filter((i) => {
        if (activeSeverity !== 'all' && i.severity !== activeSeverity) return false;
        if (activeStatus !== 'all' && i.status !== activeStatus) return false;
        if (rbiOnly && !i.rbi_mra_flag) return false;
        return true;
      }),
    [activeSeverity, activeStatus, rbiOnly]
  );

  const selected = issues.find((i) => i.issue_id === selectedId) || null;
  const remediations = selected ? remediationsForIssue(selected.issue_id) : [];

  return (
    <div className="space-y-5">
      {/* Cluster swimlanes */}
      <SectionCard title="Root-cause clusters" subtitle="AI-010 driven · expand to see member issues">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {rootCauseClusters.map((c) => (
            <div key={c.cluster_id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="mb-1 flex items-center justify-between">
                <Chip label={c.cluster_id} tone="violet" size="xs" />
                <SeverityBadge severity={c.cluster_severity} />
              </div>
              <div className="text-xs font-semibold text-slate-900">{c.label}</div>
              <div className="mt-1 text-[10px] text-slate-500">
                {c.member_issue_ids.length} issues · {c.member_control_ids.length} controls
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {c.member_issue_ids.map((id) => (
                  <Chip key={id} label={id} tone="amber" size="xs" onClick={() => setSelectedId(id)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500">Severity:</span>
        {SEVERITIES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setActiveSeverity(s)}
            className={`rounded px-2 py-0.5 text-[10px] font-medium ${activeSeverity === s ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {s}
          </button>
        ))}
        <span className="ml-3 text-xs font-semibold text-slate-500">Status:</span>
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setActiveStatus(s)}
            className={`rounded px-2 py-0.5 text-[10px] font-medium ${activeStatus === s ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {s}
          </button>
        ))}
        <label className="ml-3 flex items-center gap-2 rounded border border-slate-200 bg-white px-2 py-1 text-xs">
          <input type="checkbox" checked={rbiOnly} onChange={(e) => setRbiOnly(e.target.checked)} />
          RBI MRA only
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Issue table */}
        <div className="lg:col-span-2">
          <SectionCard title={`Issues (${filtered.length})`} subtitle="Click a row to inspect timeline · linked entities · remediation">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-2 py-1.5 text-left">Issue</th>
                    <th className="px-2 py-1.5 text-left">Linked CTRL</th>
                    <th className="px-2 py-1.5 text-left">Owner SM</th>
                    <th className="px-2 py-1.5 text-left">Status</th>
                    <th className="px-2 py-1.5 text-right">Age</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((iss) => {
                    const sm = getSeniorManager(iss.accountable_senior_manager_id);
                    const ctrl = iss.linked_control_ids[0] ? getControl(iss.linked_control_ids[0]) : null;
                    const isActive = iss.issue_id === selectedId;
                    return (
                      <tr
                        key={iss.issue_id}
                        className={`cursor-pointer border-t border-slate-100 ${isActive ? 'bg-amber-50' : 'hover:bg-slate-50'}`}
                        onClick={() => setSelectedId(iss.issue_id)}
                      >
                        <td className="px-2 py-2">
                          <div className="font-medium text-slate-900">{iss.title}</div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                            <span className="font-mono text-[10px] text-slate-500">{iss.issue_id}</span>
                            <SeverityBadge severity={iss.severity} />
                            {iss.rbi_mra_flag && <Chip label="RBI MRA" tone="rose" size="xs" />}
                            {iss.section_47a_exposure_flag && <Chip label="s.47A" tone="rose" size="xs" />}
                            {iss.pmla_exposure_flag && <Chip label="PMLA" tone="rose" size="xs" />}
                          </div>
                        </td>
                        <td className="px-2 py-2 font-mono text-[10px] text-slate-600">{ctrl?.control_id || '—'}</td>
                        <td className="px-2 py-2 text-[11px] text-slate-700">{sm?.role || iss.accountable_senior_manager_id}</td>
                        <td className="px-2 py-2"><Chip label={iss.status} tone={iss.status === 'open' ? 'rose' : iss.status === 'in_remediation' ? 'amber' : 'emerald'} size="xs" /></td>
                        <td className="px-2 py-2 text-right text-[11px] text-slate-600">{iss.ageing_days}d</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        {/* Issue detail panel */}
        <div className="space-y-4">
          {selected ? (
            <>
              <SectionCard title="Selected issue">
                <div className="text-xs font-semibold text-slate-900">{selected.title}</div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Chip label={selected.issue_id} tone="amber" size="xs" />
                  <SeverityBadge severity={selected.severity} />
                  <Chip label={selected.status} tone="slate" size="xs" />
                </div>
                <div className="mt-2 text-[10px] uppercase tracking-wider text-slate-500">Root cause</div>
                <p className="text-xs text-slate-700">{selected.root_cause}</p>
              </SectionCard>

              <SectionCard title="Timeline">
                <div className="space-y-2">
                  {auditTrailForEntity('issue', selected.issue_id).map((e) => (
                    <div key={e.audit_trail_event_id} className="rounded border border-slate-200 bg-slate-50 p-2 text-[10px]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">{e.event_type}</span>
                        <span className="text-slate-500">{fmtTs(e.system_time)}</span>
                      </div>
                      <div className="text-slate-600">{e.payload_summary}</div>
                    </div>
                  ))}
                  <div className="rounded border border-slate-200 bg-slate-50 p-2 text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">opened</span>
                      <span className="text-slate-500">{fmtDate(selected.opened_at)}</span>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title={`Remediation (${remediations.length})`}>
                {remediations.length ? (
                  <div className="space-y-2">
                    {remediations.map((r) => (
                      <div key={r.action_id} className="rounded border border-slate-200 bg-slate-50 p-2 text-[10px]">
                        <div className="mb-1 flex items-center justify-between">
                          <Chip label={r.action_id} tone="amber" size="xs" />
                          <Chip label={r.status} tone={r.status === 'in_progress' ? 'amber' : 'emerald'} size="xs" />
                        </div>
                        <div className="text-slate-700">{r.description}</div>
                        <div className="mt-1 text-slate-500">Owner: {r.owner_id} · Due: {fmtDate(r.due_date)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No remediation actions" />
                )}
              </SectionCard>

              <SectionCard title="Linked entities">
                <KVRow
                  k="Controls"
                  v={
                    <div className="flex flex-wrap gap-1">
                      {selected.linked_control_ids.map((id) => (
                        <Chip key={id} label={id} tone="indigo" size="xs" onClick={() => openDrawer('control', id, 'issueBoard')} />
                      ))}
                    </div>
                  }
                />
                <KVRow
                  k="Obligations"
                  v={
                    <div className="flex flex-wrap gap-1">
                      {selected.linked_obligation_ids.map((id) => (
                        <Chip key={id} label={id} tone="violet" size="xs" onClick={() => openDrawer('obligation', id, 'issueBoard')} />
                      ))}
                    </div>
                  }
                />
                <KVRow
                  k="AI / predictive signals"
                  v={
                    <div className="flex flex-wrap gap-1">
                      {selected.linked_ai_insight_ids.map((id) => (
                        <Chip key={id} label={id} tone="violet" size="xs" onClick={() => openDrawer('aiInsight', id, 'issueBoard')} />
                      ))}
                    </div>
                  }
                />
              </SectionCard>
            </>
          ) : (
            <EmptyState message="Select an issue" />
          )}
        </div>
      </div>
    </div>
  );
}
