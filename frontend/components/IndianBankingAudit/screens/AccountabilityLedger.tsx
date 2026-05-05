'use client';

import React, { useState } from 'react';
import {
  attestationsForSeniorManager,
  decisionsForSeniorManager,
  issuesForSeniorManager,
  seniorManagers,
} from '../dataModel';
import { Chip, EmptyState, KVRow, ScoreRing, SectionCard, SeverityBadge, StatusBadge } from '../primitives';
import type { OpenDrawer } from '../types';

const fmtDate = (iso: string | null) => (iso ? iso.slice(0, 10) : '—');

export function AccountabilityLedger({ openDrawer }: { openDrawer: OpenDrawer }) {
  const [selectedSMId, setSelectedSMId] = useState<string | null>(seniorManagers[0]?.senior_manager_id || null);
  const sm = seniorManagers.find((m) => m.senior_manager_id === selectedSMId) || null;
  const issues = sm ? issuesForSeniorManager(sm.senior_manager_id) : [];
  const decisions = sm ? decisionsForSeniorManager(sm.senior_manager_id) : [];
  const attestations = sm ? attestationsForSeniorManager(sm.senior_manager_id) : [];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Zone A — SM Grid */}
      <div className="lg:col-span-1">
        <SectionCard title="Senior Managers" subtitle={`${seniorManagers.length} accountable scope holders`}>
          <div className="space-y-2">
            {seniorManagers.map((m) => {
              const isActive = m.senior_manager_id === selectedSMId;
              const openIssueCount = issuesForSeniorManager(m.senior_manager_id).length;
              return (
                <button
                  key={m.senior_manager_id}
                  type="button"
                  onClick={() => setSelectedSMId(m.senior_manager_id)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition ${
                    isActive ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <ScoreRing
                    score={m.saes}
                    band={m.saes >= 85 ? 'green' : m.saes >= 70 ? 'amber' : 'red'}
                    size={42}
                    thickness={5}
                    label="SAES"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-slate-900">{m.role}</div>
                    <div className="truncate text-[10px] text-slate-500">{m.name}</div>
                    <div className="mt-0.5 flex items-center gap-1">
                      <Chip label={`${openIssueCount} open`} tone={openIssueCount ? 'amber' : 'emerald'} size="xs" />
                      <Chip label={m.function} tone="slate" size="xs" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* Zone B — SM Detail Panel */}
      <div className="lg:col-span-2 space-y-4">
        {sm ? (
          <>
            <SectionCard
              title={`${sm.name} · ${sm.role}`}
              subtitle={`${sm.function} · last attestation ${fmtDate(sm.last_attestation_date)}`}
              actions={
                <button
                  type="button"
                  onClick={() => openDrawer('seniorManager', sm.senior_manager_id, 'accountability')}
                  className="text-xs font-semibold text-emerald-700"
                >
                  Open accountability drawer →
                </button>
              }
            >
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <ScoreRing score={sm.saes} band={sm.saes >= 85 ? 'green' : sm.saes >= 70 ? 'amber' : 'red'} size={88} thickness={10} label="SAES" />
                <KVRow k="Processes" v={sm.accountable_processes.length} />
                <KVRow k="Controls" v={sm.accountable_controls.length} />
                <KVRow k="Risks" v={sm.accountable_risks.length} />
              </div>
            </SectionCard>

            <SectionCard title={`Open issues (${issues.length})`}>
              {issues.length ? (
                <div className="space-y-2">
                  {issues.map((iss) => (
                    <button
                      key={iss.issue_id}
                      type="button"
                      onClick={() => openDrawer('issue', iss.issue_id, 'accountability')}
                      className="block w-full rounded border border-slate-200 bg-white p-2.5 text-left hover:border-amber-300"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-semibold text-slate-900">{iss.title}</div>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <span className="font-mono text-[10px] text-slate-500">{iss.issue_id}</span>
                            <Chip label={`${iss.ageing_days}d`} tone="slate" size="xs" />
                            {iss.rbi_mra_flag && <Chip label="RBI MRA" tone="rose" size="xs" />}
                            {iss.section_47a_exposure_flag && <Chip label="s.47A" tone="rose" size="xs" />}
                          </div>
                        </div>
                        <SeverityBadge severity={iss.severity} />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState message="No open issues" hint="Strong accountability posture" />
              )}
            </SectionCard>

            <div className="grid gap-4 md:grid-cols-2">
              <SectionCard title={`Decisions (${decisions.length})`} subtitle="Approval / escalation / veto / override">
                {decisions.length ? (
                  <div className="space-y-2">
                    {decisions.map((d) => (
                      <div key={d.decision_id} className="rounded border border-slate-200 bg-slate-50 p-2 text-xs">
                        <div className="mb-1 flex items-center justify-between">
                          <Chip label={d.decision_type} tone="emerald" size="xs" />
                          <span className="text-[10px] text-slate-500">{fmtDate(d.decision_timestamp)}</span>
                        </div>
                        <div className="text-slate-700">{d.approval_basis}</div>
                        <div className="mt-1 font-mono text-[10px] text-slate-500">
                          {d.linked_entity_ref.type} · {d.linked_entity_ref.id}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No decisions logged" />
                )}
              </SectionCard>

              <SectionCard title={`Attestations (${attestations.length})`} subtitle="Period / control / CIMS / ICR sign-offs">
                {attestations.length ? (
                  <div className="space-y-2">
                    {attestations.map((a) => (
                      <div key={a.attestation_id} className="rounded border border-slate-200 bg-slate-50 p-2 text-xs">
                        <div className="mb-1 flex items-center justify-between">
                          <Chip label={a.attestation_type} tone="emerald" size="xs" />
                          <span className="text-[10px] text-slate-500">{fmtDate(a.signed_at)}</span>
                        </div>
                        <div className="text-slate-700">{a.scope}</div>
                        <div className="mt-1 text-[10px] text-slate-500">period: {a.period} · evidence: {a.evidence_ids.length}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No attestations" />
                )}
              </SectionCard>
            </div>
          </>
        ) : (
          <EmptyState message="Select a senior manager from the left" />
        )}
      </div>
    </div>
  );
}
