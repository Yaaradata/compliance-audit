'use client';

import { useMemo, useState } from 'react';
import {
  aiInsightsForControl,
  controlInstancesForControl,
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
  SectionCard,
  SeverityBadge,
} from '../primitives';
import type { OpenDrawer } from '../types';
import { ControlDetailHeader } from './controlDetail/ControlDetailHeader';
import { ControlDetailTabs, type ControlDetailTab } from './controlDetail/ControlDetailTabs';
import { ControlPopulationGrid } from './controlDetail/ControlPopulationGrid';

export function ControlDetailPanel({
  selectedControlId,
  openDrawer,
  sourceScreen = 'controlUniverse',
  onClose,
}: {
  selectedControlId: string;
  openDrawer: OpenDrawer;
  sourceScreen?: string;
  onClose?: () => void;
}) {
  const [tab, setTab] = useState<ControlDetailTab>('overview');
  const ctrl = getControl(selectedControlId);
  if (!ctrl) return <EmptyState message="Control not found" />;

  const process = getProcess(ctrl.process_id);
  const sm = getSeniorManager(ctrl.accountable_senior_manager_id);
  const instances = controlInstancesForControl(ctrl.control_id);
  const insights = aiInsightsForControl(ctrl.control_id);
  const linkedIssues = issuesForControl(ctrl.control_id);

  const outcomeCounts = useMemo(() => {
    const s: Record<string, number> = {
      Pass: 0,
      Fail: 0,
      EvidenceGap: 0,
      DataGap: 0,
      NeedsReview: 0,
      NA: 0,
    };
    instances.forEach((i) => {
      s[i.outcome] = (s[i.outcome] ?? 0) + 1;
    });
    return s;
  }, [instances]);

  return (
    <div className="min-w-0 space-y-4">
      <ControlDetailHeader
        ctrl={ctrl}
        processName={process?.name || ctrl.process_id}
        ownerLabel={sm?.role || ctrl.accountable_senior_manager_id}
        outcomeCounts={outcomeCounts}
        onClose={onClose}
        onOpenObligation={(id) => openDrawer('obligation', id, sourceScreen)}
        onOpenRisk={(id) => openDrawer('risk', id, sourceScreen)}
      />

      <ControlDetailTabs
        tab={tab}
        onTabChange={setTab}
        populationCount={instances.length}
        issuesCount={linkedIssues.length}
        insightsCount={insights.length}
      />

      {tab === 'overview' && (
        <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_17.5rem]">
          <CESBreakdownCard
            breakdown={{
              operating: {
                current: ctrl.ces_breakdown.operating_rate,
                band: cesCompBand(ctrl.ces_breakdown.operating_rate),
              },
              catch: { current: ctrl.ces_breakdown.catch_rate, band: cesCompBand(ctrl.ces_breakdown.catch_rate) },
              evidence: {
                current: ctrl.ces_breakdown.evidence_completeness,
                band: cesCompBand(ctrl.ces_breakdown.evidence_completeness),
              },
            }}
            ces={ctrl.ces}
            cesBand={ctrl.ces_band}
          />

          <div className="min-w-0 space-y-3">
            <SectionCard title="Linked obligations">
              {ctrl.linked_obligations.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {ctrl.linked_obligations.map((id) => (
                    <Chip key={id} label={id} tone="violet" onClick={() => openDrawer('obligation', id, sourceScreen)} />
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
                    <Chip key={id} label={id} tone="rose" onClick={() => openDrawer('risk', id, sourceScreen)} />
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400">None</span>
              )}
            </SectionCard>
          </div>
        </div>
      )}

      {tab === 'population' && (
        <ControlPopulationGrid
          instances={instances}
          onOpenInstance={(id) => openDrawer('controlInstance', id, sourceScreen)}
        />
      )}

      {tab === 'evidence' && (
        <SectionCard title="Evidence for this control" subtitle="Mini Evidence Workbench scoped to this control">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {instances.flatMap((ci) =>
              evidenceForControlInstance(ci).map((ev) => (
                <button
                  key={ev.evidence_id + ci.control_instance_id}
                  type="button"
                  onClick={() => openDrawer('evidence', ev.evidence_id, sourceScreen)}
                  className="rounded-lg border border-slate-200 bg-white p-2.5 text-left hover:border-sky-300"
                >
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                    <span className="break-all font-mono text-[10px] text-slate-700">{ev.evidence_id}</span>
                    <EvidenceStatusBadge status={ev.evidence_status} />
                  </div>
                  <p className="break-words text-[10px] leading-relaxed text-slate-600">
                    {ev.evidence_type} · {ev.source_system_id} · subj {ci.subject_id}
                  </p>
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
                  onClick={() => openDrawer('issue', iss.issue_id, sourceScreen)}
                  className="block w-full rounded border border-slate-200 bg-white p-2.5 text-left hover:border-amber-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-xs font-semibold leading-snug text-slate-900">{iss.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
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
              onClick={() => openDrawer('aiInsight', ai.ai_insight_id, sourceScreen)}
              className="block w-full rounded-lg border border-violet-200 bg-violet-50 p-3 text-left hover:border-violet-400"
            >
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <Chip label={`${ai.signal_id} · ${ai.signal_class.replace('_', ' ')}`} tone="violet" size="xs" />
                <HITLBadge status={ai.human_approval_status} />
              </div>
              <p className="break-words text-xs font-semibold leading-snug text-slate-900">{ai.title}</p>
              <p className="mt-1 break-words text-[10px] leading-relaxed text-slate-600">
                Confidence {(ai.confidence * 100).toFixed(0)}% · Model {ai.model_version}
              </p>
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

/** Legacy route — renders the same panel as Control Universe detail pane. */
export function ControlDrillDown({
  selectedControlId,
  openDrawer,
}: {
  selectedControlId: string;
  openDrawer: OpenDrawer;
}) {
  return <ControlDetailPanel selectedControlId={selectedControlId} openDrawer={openDrawer} sourceScreen="controlDrillDown" />;
}
