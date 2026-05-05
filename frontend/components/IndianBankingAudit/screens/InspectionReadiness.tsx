'use client';

import React, { useMemo, useState } from 'react';
import {
  attestationEvents,
  auditPacks,
  controlInstances,
  evidenceRecords,
  inspectionLenses,
  issues,
  remediationActions,
  reportingSubmissions,
  testExecutions,
} from '../dataModel';
import { Chip, EmptyState, ScoreRing, SectionCard, StatusBadge } from '../primitives';
import { bandFromScore } from '../theme';
import type { OpenDrawer, SetActiveScreen } from '../types';

export function InspectionReadiness({
  openDrawer,
  setActiveScreen,
}: {
  openDrawer: OpenDrawer;
  setActiveScreen: SetActiveScreen;
}) {
  const [activeLens, setActiveLens] = useState<string>(inspectionLenses[0]?.lens_id || '');

  const lens = inspectionLenses.find((l) => l.lens_id === activeLens) || inspectionLenses[0];
  const packsForLens = auditPacks.filter((p) => p.scope_id === activeLens);
  const lensARS = packsForLens.length ? Math.round(packsForLens.reduce((s, p) => s + p.ars, 0) / packsForLens.length) : 0;
  const band = bandFromScore(lensARS, { green: 85, amber: 70 });

  // Derive gap counts per Pass 4 §4.3 zone B (8 categories)
  const gaps = useMemo(() => computeGaps(), []);

  return (
    <div className="space-y-5">
      {/* Lens selector */}
      <div className="flex flex-wrap gap-2">
        {inspectionLenses.map((l) => {
          const packs = auditPacks.filter((p) => p.scope_id === l.lens_id);
          const ars = packs.length ? Math.round(packs.reduce((s, p) => s + p.ars, 0) / packs.length) : 0;
          const isActive = l.lens_id === activeLens;
          return (
            <button
              key={l.lens_id}
              type="button"
              onClick={() => setActiveLens(l.lens_id)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition ${
                isActive ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <ScoreRing score={ars} band={bandFromScore(ars, { green: 85, amber: 70 })} size={32} thickness={4} />
              <div className="text-left">
                <div className="font-semibold text-slate-900">{l.label}</div>
                <div className="text-[10px] text-slate-500">{packs.length} pack{packs.length === 1 ? '' : 's'}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Zone A — Selected lens overview */}
        <SectionCard title={lens?.label || 'Lens'} subtitle={lens?.scope_definition} actions={<StatusBadge tone={band} label={`ARS · ${band}`} />}>
          <div className="flex items-center gap-4">
            <ScoreRing score={lensARS} band={band} size={120} thickness={12} label="ARS" />
            <div className="flex-1 space-y-1.5">
              {lens?.readiness_score_inputs.map((m) => (
                <div key={m} className="flex items-center justify-between rounded border border-slate-200 px-2 py-1 text-xs">
                  <span className="text-slate-700">{m}</span>
                  <Chip label="weighted" tone="slate" size="xs" />
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Zone B — Gap List (8 categories from Pass 3 §7.3) */}
        <div className="lg:col-span-2">
          <SectionCard title="Gap list" subtitle="Click any gap to route to the screen that resolves it">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <GapTile
                label="Missing evidence"
                count={gaps.missingEvidence}
                onClick={() => setActiveScreen('evidenceWorkbench')}
              />
              <GapTile
                label="Stale / late evidence"
                count={gaps.staleEvidence}
                onClick={() => setActiveScreen('evidenceWorkbench')}
              />
              <GapTile
                label="Unlinked source records"
                count={gaps.orphanRecords}
                onClick={() => setActiveScreen('sourceLineage')}
              />
              <GapTile
                label="Open high-risk issues"
                count={gaps.highRiskIssues}
                onClick={() => setActiveScreen('issueBoard')}
              />
              <GapTile label="Unclosed remediation" count={gaps.unclosedRemediation} onClick={() => setActiveScreen('issueBoard')} />
              <GapTile
                label="Missing SM attestation"
                count={gaps.missingAttestation}
                onClick={() => setActiveScreen('accountability')}
              />
              <GapTile
                label="Missing reporting ack"
                count={gaps.missingAck}
                onClick={() => setActiveScreen('riskPosture')}
              />
              <GapTile
                label="Failed / not-run pop tests"
                count={gaps.failedTests}
                onClick={() => setActiveScreen('populationTesting')}
              />
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Zone C — Pack Composition Tree */}
      <SectionCard title={`AuditPacks in lens (${packsForLens.length})`} subtitle="OBL → CTRL → EVD nodes">
        {packsForLens.length ? (
          <div className="space-y-3">
            {packsForLens.map((p) => (
              <button
                key={p.audit_pack_id}
                type="button"
                onClick={() => openDrawer('auditPack', p.audit_pack_id, 'inspectionReadiness')}
                className="block w-full rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-indigo-300"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <div className="font-mono text-[11px] text-slate-700">{p.audit_pack_id}</div>
                    <div className="text-xs text-slate-500">audience · {p.target_audience}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ScoreRing score={p.ars} band={p.readiness_status === 'green' ? 'green' : p.readiness_status === 'amber' ? 'amber' : 'red'} size={42} thickness={5} />
                    <StatusBadge tone={p.readiness_status === 'green' ? 'green' : p.readiness_status === 'amber' ? 'amber' : 'red'} label={p.readiness_status} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <Chip label={`${p.included_workpaper_ids.length} workpapers`} tone="slate" />
                  <Chip label={`${p.included_evidence_ids.length} evidence`} tone="sky" />
                  <Chip label={`${p.included_issue_ids.length} issues`} tone="amber" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState message="No audit packs scoped to this lens" />
        )}
      </SectionCard>
    </div>
  );
}

function GapTile({ label, count, onClick }: { label: string; count: number; onClick: () => void }) {
  const tone = count === 0 ? 'emerald' : count > 5 ? 'rose' : 'amber';
  const tones: Record<string, string> = {
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    amber: 'border-amber-200 bg-amber-50 text-amber-800',
    rose: 'border-rose-200 bg-rose-50 text-rose-800',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition hover:shadow-sm ${tones[tone]}`}
    >
      <div className="text-xs font-semibold">{label}</div>
      <div className="text-2xl font-bold">{count}</div>
    </button>
  );
}

function computeGaps() {
  const missingEvidence = evidenceRecords.filter((e) => e.evidence_status === 'Missing').length;
  const staleEvidence = evidenceRecords.filter((e) => e.evidence_status === 'Late' || (e.freshness_days ?? 0) > 180).length;
  const orphanRecords = controlInstances.filter((ci) => ci.outcome === 'DataGap').length;
  const highRiskIssues = issues.filter((i) => i.severity === 'high' && !i.closed_at).length;
  const unclosedRemediation = remediationActions.filter((r) => !r.actual_close_date).length;
  // missing attestation: SMs whose last attestation is > 90 days
  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const missingAttestation = attestationEvents.filter((a) => new Date(a.signed_at).getTime() < cutoff).length;
  const missingAck = reportingSubmissions.filter((s) => s.status === 'pending').length;
  const failedTests = testExecutions.filter((t) => t.result === 'Failed' || t.result === 'pending').length;
  return { missingEvidence, staleEvidence, orphanRecords, highRiskIssues, unclosedRemediation, missingAttestation, missingAck, failedTests };
}
