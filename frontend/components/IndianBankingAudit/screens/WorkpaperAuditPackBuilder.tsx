'use client';

import React, { useMemo, useState } from 'react';
import {
  attestationEvents,
  auditPacks,
  decisionEvents,
  evidenceRecords,
  getAuditPack,
  getControl,
  getEvidence,
  getInspectionLens,
  getIssue,
  getTest,
  getWorkpaper,
  inspectionLenses,
  issues,
  workpapers,
} from '../dataModel';
import { bandFromScore } from '../theme';
import { Chip, EmptyState, KVRow, ScoreRing, SectionCard, Stat, StatusBadge } from '../primitives';
import type { OpenDrawer } from '../types';

type Mode = 'workpaper' | 'auditPack';

export function WorkpaperAuditPackBuilder({ openDrawer }: { openDrawer: OpenDrawer }) {
  const [mode, setMode] = useState<Mode>('workpaper');
  const [selectedWPId, setSelectedWPId] = useState<string | null>(workpapers[0]?.workpaper_id || null);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(auditPacks[0]?.audit_pack_id || null);
  const [activeLens, setActiveLens] = useState<string>(inspectionLenses[0]?.lens_id || '');

  const wp = selectedWPId ? getWorkpaper(selectedWPId) : null;
  const pack = selectedPackId ? getAuditPack(selectedPackId) : null;

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMode('workpaper')}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold ${mode === 'workpaper' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'}`}
        >
          Workpapers ({workpapers.length})
        </button>
        <button
          type="button"
          onClick={() => setMode('auditPack')}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold ${mode === 'auditPack' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'}`}
        >
          Readiness packs ({auditPacks.length})
        </button>
      </div>

      {mode === 'workpaper' ? (
        <WorkpaperMode
          wp={wp}
          selectedWPId={selectedWPId}
          setSelectedWPId={setSelectedWPId}
          openDrawer={openDrawer}
        />
      ) : (
        <AuditPackMode
          pack={pack}
          selectedPackId={selectedPackId}
          setSelectedPackId={setSelectedPackId}
          openDrawer={openDrawer}
          activeLens={activeLens}
          setActiveLens={setActiveLens}
        />
      )}
    </div>
  );
}

function WorkpaperMode({
  wp,
  selectedWPId,
  setSelectedWPId,
  openDrawer,
}: {
  wp: ReturnType<typeof getWorkpaper>;
  selectedWPId: string | null;
  setSelectedWPId: (id: string | null) => void;
  openDrawer: OpenDrawer;
}) {
  const ctrl = wp ? getControl(wp.control_id) : null;
  const test = wp ? getTest(wp.test_execution_id) : null;
  const wpEvidence = wp ? wp.evidence_ids.map(getEvidence).filter(Boolean) : [];

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      {/* Workpaper list */}
      <div className="lg:col-span-3">
        <SectionCard title={`Workpapers (${workpapers.length})`} subtitle="Click to load builder">
          <div className="space-y-1.5">
            {workpapers.map((w) => {
              const active = selectedWPId === w.workpaper_id;
              const ready = Object.values(w.readiness_flags).filter(Boolean).length;
              return (
                <button
                  key={w.workpaper_id}
                  type="button"
                  onClick={() => setSelectedWPId(w.workpaper_id)}
                  className={`w-full rounded-md border px-2.5 py-2 text-left ${active ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[10px] text-slate-700">{w.workpaper_id}</span>
                    <Chip label={w.status} tone={w.status === 'signed_off' ? 'emerald' : w.status === 'in_review' ? 'amber' : 'slate'} size="xs" />
                  </div>
                  <div className="mt-0.5 text-[10px] text-slate-500">{w.control_id || '—'} · {w.exception_count} exceptions</div>
                  <div className="mt-1 flex gap-0.5">
                    {Object.entries(w.readiness_flags).map(([k, v]) => (
                      <span key={k} className={`flex-1 h-0.5 rounded-full ${v ? 'bg-emerald-500' : 'bg-slate-200'}`} title={`${k}: ${v ? 'ready' : 'gap'}`} />
                    ))}
                  </div>
                  <div className="mt-0.5 text-[9px] text-slate-400">readiness {ready}/4</div>
                </button>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* Builder */}
      <div className="lg:col-span-9 space-y-4">
        {wp ? (
          <>
            <SectionCard
              title={`Workpaper · ${wp.workpaper_id}`}
              subtitle={ctrl ? `${ctrl.control_id} · ${ctrl.title}` : '—'}
              actions={
                <div className="flex items-center gap-2">
                  <Chip label={wp.status} tone={wp.status === 'signed_off' ? 'emerald' : 'amber'} />
                  {wp.retest_required && <Chip label="retest required" tone="rose" size="xs" />}
                </div>
              }
            >
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat k="Population" v={wp.population_size ?? '—'} />
                <Stat k="Tested" v={wp.tested_count ?? '—'} />
                <Stat k="Exceptions" v={wp.exception_count} tone={wp.exception_count > 0 ? 'rose' : 'emerald'} />
                <Stat k="Evidence linked" v={wpEvidence.length} tone="indigo" />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-md border border-slate-200 bg-slate-50/40 p-3">
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Tester / Reviewer</div>
                  <KVRow k="Tester" v={wp.tester_id} mono />
                  <KVRow k="Reviewer" v={wp.reviewer_id} mono />
                  <KVRow k="Signed at" v={wp.signed_at || '—'} mono />
                  <KVRow k="Reviewer signed" v={wp.reviewer_signed_at || '—'} mono />
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50/40 p-3">
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">RBI / PMLA / Statutory readiness</div>
                  <div className="space-y-1.5">
                    {Object.entries(wp.readiness_flags).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">{k.toUpperCase()}</span>
                        <StatusBadge tone={v ? 'green' : 'red'} label={v ? 'ready' : 'gap'} size="xs" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Sections (Pass 4 §6 §S-07) */}
            <SectionCard title={`Workpaper sections (${wp.sections.length})`} subtitle="Standard inspection workpaper structure">
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {wp.sections.map((s, idx) => (
                  <div key={idx} className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px]">
                    <span className="mr-1 font-mono text-slate-400">{idx + 1}.</span>
                    <span className="font-medium text-slate-700">{s}</span>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Linked evidence */}
            <SectionCard title={`Linked evidence (${wpEvidence.length})`} subtitle="Click to open evidence drill-down">
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                {wpEvidence.map((e) =>
                  e ? (
                    <button
                      key={e.evidence_id}
                      type="button"
                      onClick={() => openDrawer('evidence', e.evidence_id, 'workpaperAuditPackBuilder')}
                      className="rounded-md border border-slate-200 bg-white p-2 text-left hover:bg-slate-50"
                    >
                      <div className="font-mono text-[10px] text-slate-700">{e.evidence_id}</div>
                      <div className="mt-0.5 text-[10px] text-slate-500">{e.evidence_type}</div>
                      <div className="mt-1 text-[10px] font-bold text-slate-700">{e.evidence_completeness_score}%</div>
                    </button>
                  ) : null
                )}
                {!wpEvidence.length && <EmptyState message="No linked evidence" />}
              </div>
            </SectionCard>

            {/* Test execution */}
            {test && (
              <SectionCard title="Test execution backing this workpaper" subtitle={`${test.test_id} · ${test.test_type} · ${test.result}`} actions={
                <button
                  type="button"
                  onClick={() => openDrawer('testExecution', test.test_id, 'workpaperAuditPackBuilder')}
                  className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                >
                  open detail →
                </button>
              }>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  <Stat k="Population" v={test.population_size ?? '—'} />
                  <Stat k="Tested" v={test.tested_count ?? '—'} />
                  <Stat k="Exceptions" v={test.exception_count ?? '—'} tone="rose" />
                  <Stat k="Data gaps" v={test.data_gap_count ?? '—'} tone="amber" />
                  <Stat k="Evidence gaps" v={test.evidence_gap_count ?? '—'} tone="violet" />
                </div>
              </SectionCard>
            )}
          </>
        ) : (
          <EmptyState message="Select a workpaper" />
        )}
      </div>
    </div>
  );
}

function AuditPackMode({
  pack,
  selectedPackId,
  setSelectedPackId,
  openDrawer,
  activeLens,
  setActiveLens,
}: {
  pack: ReturnType<typeof getAuditPack>;
  selectedPackId: string | null;
  setSelectedPackId: (id: string | null) => void;
  openDrawer: OpenDrawer;
  activeLens: string;
  setActiveLens: (id: string) => void;
}) {
  const lens = getInspectionLens(activeLens);
  const filteredPacks = useMemo(
    () => auditPacks.filter((p) => (lens ? p.scope_id === lens.lens_id || p.scope_type === 'inspection_lens' : true)),
    [lens]
  );
  const packsToShow = filteredPacks.length ? filteredPacks : auditPacks;

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      {/* Lens + pack list */}
      <div className="lg:col-span-3 space-y-3">
        <SectionCard title="Inspection lens">
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs"
            value={activeLens}
            onChange={(e) => setActiveLens(e.target.value)}
          >
            {inspectionLenses.map((l) => (
              <option key={l.lens_id} value={l.lens_id}>{l.label}</option>
            ))}
          </select>
        </SectionCard>

        <SectionCard title={`Packs (${packsToShow.length})`} subtitle="OBL → CTRL → EVD bundle">
          <div className="space-y-1.5">
            {packsToShow.map((p) => {
              const active = selectedPackId === p.audit_pack_id;
              return (
                <button
                  key={p.audit_pack_id}
                  type="button"
                  onClick={() => setSelectedPackId(p.audit_pack_id)}
                  className={`w-full rounded-md border px-2.5 py-2 text-left ${active ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[10px] text-slate-700">{p.audit_pack_id}</span>
                    <Chip label={p.readiness_status} tone={p.readiness_status === 'inspection_ready' ? 'emerald' : 'amber'} size="xs" />
                  </div>
                  <div className="mt-0.5 text-[10px] text-slate-500">{p.target_audience}</div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-600">
                    <span className="font-bold">ARS</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-bold">{p.ars}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* Pack detail */}
      <div className="lg:col-span-9 space-y-4">
        {pack ? (
          <>
            <SectionCard
              title={`Readiness pack · ${pack.audit_pack_id}`}
              subtitle={`Scope: ${pack.scope_type} · ${pack.scope_id} · for ${pack.target_audience}`}
              actions={<Chip label={pack.readiness_status} tone={pack.readiness_status === 'inspection_ready' ? 'emerald' : 'amber'} />}
            >
              <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
                <ScoreRing
                  score={pack.ars}
                  band={bandFromScore(pack.ars)}
                  size={88}
                  thickness={10}
                  label="ARS"
                  sublabel="supervisory readiness"
                />
                <Stat k="Linked workpapers" v={pack.included_workpaper_ids.length} tone="indigo" />
                <Stat k="Evidence" v={pack.included_evidence_ids.length} tone="indigo" />
                <Stat k="Issues" v={pack.included_issue_ids.length} tone="rose" />
                <Stat k="Attestations" v={pack.included_attestation_ids.length} tone="emerald" />
                <Stat k="Decisions" v={pack.included_decision_event_ids.length} tone="emerald" />
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-md border border-slate-200 bg-slate-50/40 p-3">
                  <KVRow k="Exported at" v={pack.exported_at || '—'} mono />
                  <KVRow k="Content hash" v={pack.content_hash || '—'} mono />
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50/40 p-3 text-[11px] text-slate-600">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Lens scope</div>
                  <div className="mt-1">{lens?.scope_definition || 'Unscoped'}</div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title={`Included workpapers (${pack.included_workpaper_ids.length})`}>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                {pack.included_workpaper_ids.map((wid) => {
                  const w = getWorkpaper(wid);
                  if (!w) return null;
                  return (
                    <button
                      key={wid}
                      type="button"
                      onClick={() => openDrawer('workpaper', wid, 'workpaperAuditPackBuilder')}
                      className="rounded-md border border-slate-200 bg-white p-2.5 text-left hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-slate-700">{w.workpaper_id}</span>
                        <Chip label={w.status} tone={w.status === 'signed_off' ? 'emerald' : 'amber'} size="xs" />
                      </div>
                      <div className="mt-1 text-[11px] text-slate-700">{w.control_id || '—'}</div>
                      <div className="mt-1 text-[10px] text-slate-500">{w.exception_count} exceptions · {w.evidence_ids.length} evidence</div>
                    </button>
                  );
                })}
                {!pack.included_workpaper_ids.length && <EmptyState message="No workpapers in pack" />}
              </div>
            </SectionCard>

            <div className="grid gap-4 md:grid-cols-2">
              <SectionCard title={`Included issues (${pack.included_issue_ids.length})`}>
                <div className="space-y-1.5">
                  {pack.included_issue_ids.map((iid) => {
                    const iss = getIssue(iid);
                    if (!iss) return null;
                    return (
                      <button
                        key={iid}
                        type="button"
                        onClick={() => openDrawer('issue', iid, 'workpaperAuditPackBuilder')}
                        className="flex w-full items-center justify-between gap-2 rounded border border-slate-200 bg-white px-2.5 py-1.5 text-left hover:bg-slate-50"
                      >
                        <div>
                          <div className="font-mono text-[10px] text-slate-700">{iss.issue_id}</div>
                          <div className="text-[11px] text-slate-700">{iss.title}</div>
                        </div>
                        <Chip label={iss.severity} tone={iss.severity === 'high' ? 'rose' : iss.severity === 'medium' ? 'amber' : 'slate'} size="xs" />
                      </button>
                    );
                  })}
                  {!pack.included_issue_ids.length && <EmptyState message="No issues bundled" />}
                  {!pack.included_issue_ids.length && (
                    <div className="text-[10px] text-slate-400">Universe contains {issues.length} issues — none scoped to this pack.</div>
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Decisions & attestations included">
                <div className="space-y-1.5">
                  {pack.included_decision_event_ids.map((id) => (
                    <div key={id} className="rounded border border-slate-200 bg-white px-2.5 py-1 font-mono text-[10px] text-slate-700">{id}</div>
                  ))}
                  {pack.included_attestation_ids.map((id) => (
                    <div key={id} className="rounded border border-slate-200 bg-white px-2.5 py-1 font-mono text-[10px] text-slate-700">{id}</div>
                  ))}
                  {!pack.included_decision_event_ids.length && !pack.included_attestation_ids.length && (
                    <EmptyState message="No decisions/attestations bundled" hint={`Universe contains ${decisionEvents.length} decisions · ${attestationEvents.length} attestations`} />
                  )}
                </div>
              </SectionCard>
            </div>

            <SectionCard title={`Evidence in pack (${pack.included_evidence_ids.length})`}>
              <div className="grid grid-cols-3 gap-1.5 md:grid-cols-6">
                {pack.included_evidence_ids.map((eid) => {
                  const e = getEvidence(eid);
                  if (!e) return null;
                  return (
                    <button
                      key={eid}
                      type="button"
                      onClick={() => openDrawer('evidence', eid, 'workpaperAuditPackBuilder')}
                      className="rounded border border-slate-200 bg-white px-2 py-1 text-left hover:bg-slate-50"
                    >
                      <div className="font-mono text-[10px] text-slate-700">{e.evidence_id}</div>
                      <div className="mt-0.5 text-[10px] text-slate-500">{e.evidence_type}</div>
                    </button>
                  );
                })}
                {!pack.included_evidence_ids.length && (
                  <EmptyState message="No evidence bundled" hint={`Universe contains ${evidenceRecords.length} evidence records`} />
                )}
              </div>
            </SectionCard>
          </>
        ) : (
          <EmptyState message="Select an audit pack" />
        )}
      </div>
    </div>
  );
}
