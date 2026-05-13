'use client';

import React from 'react';
import {
  attestationsForSeniorManager,
  auditTrailForEntity,
  controlInstancesForControl,
  correlationsForSourceRecord,
  decisionsForSeniorManager,
  evidenceForControlInstance,
  getAuditPack,
  getControl,
  getControlInstance,
  getCorrelation,
  getEvidence,
  getException,
  getInsight,
  getIncident,
  getIssue,
  getKRI,
  getModel,
  getObligation,
  getProcess,
  getProcessExecution,
  getRegulation,
  getRemediation,
  getReportingClock,
  getRisk,
  getRca,
  getPreventiveAction,
  getSeniorManager,
  getSourceRecord,
  getSourceSystem,
  getSourceSystemHealth,
  getStepExecution,
  getTest,
  getWorkpaper,
  issuesForControl,
  preventiveActions,
  issuesForSeniorManager,
  modelRiskRecords,
  observationsForKRI,
  obligations,
  pacNotes,
  remediationsForIssue,
  rcas,
  stepExecutionsForExecution,
} from '../dataModel';
import type { DrawerEntityType } from '../types';
import {
  CESBreakdownCard,
  Chip,
  EmptyState,
  EntityTypeBadge,
  EvidenceStatusBadge,
  HITLBadge,
  KVRow,
  OutcomeBadge,
  ScoreRing,
  SectionCard,
  SeverityBadge,
  StatusBadge,
} from '../primitives';
import type { DrillFromDrawer, SetActiveScreen } from '../types';
import { formatInrLossDisplay } from '../inrFormat';

const fmtTs = (iso: string | null | undefined) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().replace('T', ' ').slice(0, 19) + 'Z';
};

const fmtDate = (iso: string | null | undefined) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
};

// =====================================================================
// RISK
// =====================================================================
export function RiskDetailPanel({
  riskId,
  drillFromDrawer,
}: {
  riskId: string;
  drillFromDrawer: DrillFromDrawer;
}) {
  const risk = getRisk(riskId);
  if (!risk) return <EmptyState message="Risk not found." />;
  const sm = getSeniorManager(risk.accountable_senior_manager_id);
  const regulationIds = Array.from(
    new Set(
      risk.linked_obligation_ids
        .map((oid) => getObligation(oid))
        .filter((o): o is NonNullable<typeof o> => !!o)
        .map((o) => o.regulation_id)
    )
  );
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{risk.title}</h2>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Chip label={`Domain · ${risk.domain_id}`} tone="indigo" />
          <Chip label={`Inherent · ${risk.inherent_rating}`} tone="amber" />
          <Chip label={`Residual · ${risk.residual_rating}`} tone="rose" />
          <Chip label={`Trend · ${risk.residual_rating_trend}`} tone="slate" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ScoreRing score={risk.res_score} band={risk.res_score >= 80 ? 'green' : risk.res_score >= 60 ? 'amber' : 'red'} label="RES" size={88} />
        <div>
          <KVRow k="Risk ID" v={risk.risk_id} mono />
          <KVRow
            k="Accountable SM"
            v={
              sm ? (
                <button
                  type="button"
                  className="text-left text-xs font-semibold text-indigo-700 underline decoration-dotted hover:text-indigo-900"
                  onClick={() => drillFromDrawer('seniorManager', risk.accountable_senior_manager_id)}
                >
                  {sm.name}
                </button>
              ) : (
                risk.accountable_senior_manager_id
              )
            }
          />
          <KVRow k="KRIs" v={risk.kri_ids.join(', ') || '—'} />
          <KVRow k="Appetite metrics" v={risk.appetite_metric_ids.join(', ') || '—'} />
        </div>
      </div>

      <SectionCard title="Linked Obligations">
        {risk.linked_obligation_ids.length ? (
          <div className="flex flex-wrap gap-1.5">
            {risk.linked_obligation_ids.map((id) => (
              <Chip key={id} label={id} tone="violet" onClick={() => drillFromDrawer('obligation', id)} />
            ))}
          </div>
        ) : (
          <EmptyState message="No obligations linked." />
        )}
      </SectionCard>

      <SectionCard title="Regulations (via obligations)">
        {regulationIds.length ? (
          <div className="flex flex-wrap gap-1.5">
            {regulationIds.map((rid) => {
              const reg = getRegulation(rid);
              return (
                <Chip key={rid} label={reg?.title || rid} tone="slate" onClick={() => drillFromDrawer('regulation', rid)} />
              );
            })}
          </div>
        ) : (
          <EmptyState message="No regulations resolved from linked obligations." />
        )}
      </SectionCard>

      <SectionCard title="Linked Controls">
        {risk.linked_control_ids.length ? (
          <div className="flex flex-wrap gap-1.5">
            {risk.linked_control_ids.map((id) => (
              <Chip key={id} label={id} tone="indigo" onClick={() => drillFromDrawer('control', id)} />
            ))}
          </div>
        ) : (
          <EmptyState message="No controls linked." />
        )}
      </SectionCard>
    </div>
  );
}

// =====================================================================
// CONTROL
// =====================================================================
export function ControlDetailPanel({
  controlId,
  drillFromDrawer,
}: {
  controlId: string;
  drillFromDrawer: DrillFromDrawer;
}) {
  const ctrl = getControl(controlId);
  if (!ctrl) return <EmptyState message="Control not found." />;
  const instances = controlInstancesForControl(ctrl.control_id);
  const passCount = instances.filter((i) => i.outcome === 'Pass').length;
  const failCount = instances.filter((i) => i.outcome === 'Fail').length;
  const evidenceGap = instances.filter((i) => i.outcome === 'EvidenceGap').length;
  const dataGap = instances.filter((i) => i.outcome === 'DataGap').length;
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{ctrl.title}</h2>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Chip label={ctrl.type} tone="indigo" />
          <Chip label={ctrl.nature} tone="slate" />
          <Chip label={ctrl.frequency} tone="slate" />
          <Chip label={`Process · ${ctrl.process_id}`} tone="sky" onClick={() => drillFromDrawer('process', ctrl.process_id)} />
        </div>
      </div>

      <CESBreakdownCard
        breakdown={{
          operating: { current: ctrl.ces_breakdown.operating_rate, band: bandFor(ctrl.ces_breakdown.operating_rate) },
          catch: { current: ctrl.ces_breakdown.catch_rate, band: bandFor(ctrl.ces_breakdown.catch_rate) },
          evidence: { current: ctrl.ces_breakdown.evidence_completeness, band: bandFor(ctrl.ces_breakdown.evidence_completeness) },
        }}
        ces={ctrl.ces}
        cesBand={ctrl.ces_band}
      />

      <SectionCard title="Outcome split (current window)">
        <div className="grid grid-cols-4 gap-2">
          <OutcomeStat label="Pass" count={passCount} tone="emerald" />
          <OutcomeStat label="Fail" count={failCount} tone="rose" />
          <OutcomeStat label="Evidence Gap" count={evidenceGap} tone="violet" />
          <OutcomeStat label="Data Gap" count={dataGap} tone="slate" />
        </div>
      </SectionCard>

      <SectionCard title={`Population (${instances.length} instances)`} subtitle="Click any row for source lineage (D-01)">
        <div className="overflow-hidden rounded border border-slate-200">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-2 py-1.5 text-left">CI</th>
                <th className="px-2 py-1.5 text-left">Subject</th>
                <th className="px-2 py-1.5 text-left">Outcome</th>
                <th className="px-2 py-1.5 text-left">Fired</th>
              </tr>
            </thead>
            <tbody>
              {instances.map((ci) => (
                <tr
                  key={ci.control_instance_id}
                  className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                  onClick={() => drillFromDrawer('controlInstance', ci.control_instance_id)}
                >
                  <td className="px-2 py-1.5 font-mono text-[10px] text-slate-600">{ci.control_instance_id}</td>
                  <td className="px-2 py-1.5 font-mono text-[10px] text-slate-700">{ci.subject_id}</td>
                  <td className="px-2 py-1.5">
                    <OutcomeBadge outcome={ci.outcome} size="xs" />
                  </td>
                  <td className="px-2 py-1.5 text-[10px] text-slate-500">{fmtTs(ci.fire_ts)}</td>
                </tr>
              ))}
              {!instances.length && (
                <tr>
                  <td colSpan={4} className="px-2 py-3 text-center text-xs text-slate-500">
                    No instances in current window.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Linked Obligations">
        <div className="flex flex-wrap gap-1.5">
          {ctrl.linked_obligations.length ? (
            ctrl.linked_obligations.map((id) => <Chip key={id} label={id} tone="violet" onClick={() => drillFromDrawer('obligation', id)} />)
          ) : (
            <span className="text-xs text-slate-400">None</span>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Open Issues">
        {issuesForControl(ctrl.control_id).map((iss) => (
          <button
            key={iss.issue_id}
            type="button"
            onClick={() => drillFromDrawer('issue', iss.issue_id)}
            className="mb-2 block w-full rounded-lg border border-slate-200 bg-white p-2.5 text-left hover:border-amber-300"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-900">{iss.title}</div>
                <div className="font-mono text-[10px] text-slate-500">{iss.issue_id} · {iss.ageing_days}d open</div>
              </div>
              <SeverityBadge severity={iss.severity} />
            </div>
          </button>
        ))}
        {!issuesForControl(ctrl.control_id).length && <span className="text-xs text-slate-400">No open issues</span>}
      </SectionCard>
    </div>
  );
}

const bandFor = (val: number | null) => {
  if (val == null) return 'grey';
  if (val >= 80) return 'green';
  if (val >= 60) return 'amber';
  return 'red';
};

function OutcomeStat({ label, count, tone }: { label: string; count: number; tone: string }) {
  const tones: Record<string, string> = {
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    rose: 'text-rose-700 bg-rose-50 border-rose-200',
    violet: 'text-violet-700 bg-violet-50 border-violet-200',
    slate: 'text-slate-700 bg-slate-100 border-slate-200',
  };
  return (
    <div className={`rounded border px-2 py-1.5 ${tones[tone] || tones.slate}`}>
      <div className="text-lg font-bold">{count}</div>
      <div className="text-[10px] uppercase tracking-wider">{label}</div>
    </div>
  );
}

// =====================================================================
// CONTROL INSTANCE — full lineage spine (D-01)
// =====================================================================
export function ControlInstanceDetailPanel({
  ciId,
  drillFromDrawer,
}: {
  ciId: string;
  drillFromDrawer: DrillFromDrawer;
}) {
  const ci = getControlInstance(ciId);
  if (!ci) return <EmptyState message="Control instance not found." />;
  const ctrl = getControl(ci.control_id);
  const pe = getProcessExecution(ci.process_execution_id);
  const se = ci.step_execution_id ? getStepExecution(ci.step_execution_id) : null;
  const obl = ctrl?.linked_obligations[0] ? getObligation(ctrl.linked_obligations[0]) : null;
  const reg = obl ? getRegulation(obl.regulation_id) : null;
  const evidence = evidenceForControlInstance(ci);
  const exception = ci.exception_id ? getException(ci.exception_id) : null;

  const spine: { type: string; id: string | null; label: string; clickType?: DrawerEntityType }[] = [
    { type: 'Regulation', id: reg?.regulation_id || null, label: reg?.title || 'No regulation', clickType: reg?.regulation_id ? 'regulation' : undefined },
    { type: 'Obligation', id: obl?.obligation_id || null, label: obl?.atomic_requirement || 'No obligation', clickType: 'obligation' },
    { type: 'Control', id: ctrl?.control_id || null, label: ctrl?.title || 'No control', clickType: 'control' },
    { type: 'ProcessExecution', id: pe?.process_execution_id || null, label: `${pe?.process_id} · ${pe?.anchor_key_value}`, clickType: 'processExecution' },
    { type: 'ControlInstance', id: ci.control_instance_id, label: `${ci.subject_id} · ${ci.outcome}` },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Control Instance — {ci.subject_id}</h2>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <OutcomeBadge outcome={ci.outcome} />
          <Chip label={`Latency ${ci.latency_ms != null ? `${(ci.latency_ms / 1000).toFixed(2)}s` : '—'}`} tone="slate" />
          <Chip label={`Fired ${fmtTs(ci.fire_ts)}`} tone="slate" />
        </div>
        {(ci.fail_reason || ci.evidence_gap_reason || ci.data_gap_reason) && (
          <div className="mt-2 rounded border border-rose-200 bg-rose-50 p-2 text-xs text-rose-800">
            {ci.fail_reason || ci.evidence_gap_reason || ci.data_gap_reason}
          </div>
        )}
      </div>

      <SectionCard title="Lineage spine — Regulation → Obligation → Control → CI" subtitle="The 2-click drill from Pass 4 §6">
        <ol className="space-y-2">
          {spine.map((s, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{s.type}</div>
                <div className="text-xs font-medium text-slate-900">{s.label}</div>
                <div className="font-mono text-[10px] text-slate-500">
                  {s.id || '—'}{' '}
                  {s.clickType && s.id && (
                    <button
                      type="button"
                      className="ml-1 text-indigo-600 underline"
                      onClick={() => drillFromDrawer(s.clickType as DrawerEntityType, s.id as string)}
                    >
                      open
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </SectionCard>

      {se && (
        <SectionCard title="Step Execution">
          <KVRow k="Step ID" v={se.step_id} mono />
          <KVRow k="Actor type" v={se.actual_actor_type} />
          <KVRow k="Actual system" v={se.actual_system} mono />
          <KVRow k="Start" v={fmtTs(se.start_ts)} mono />
          <KVRow k="End" v={fmtTs(se.end_ts)} mono />
          {se.deviation_note && (
            <div className="mt-2 rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">{se.deviation_note}</div>
          )}
        </SectionCard>
      )}

      <SectionCard title={`Evidence (${evidence.length})`} subtitle="Source-record-backed evidence with hash + retention">
        <div className="space-y-2">
          {evidence.map((ev) => (
            <button
              key={ev.evidence_id}
              type="button"
              onClick={() => drillFromDrawer('evidence', ev.evidence_id)}
              className="block w-full rounded border border-slate-200 bg-white p-2.5 text-left hover:border-sky-300"
            >
              <div className="mb-1 flex items-start justify-between">
                <div className="font-mono text-[10px] text-slate-700">{ev.evidence_id}</div>
                <EvidenceStatusBadge status={ev.evidence_status} />
              </div>
              <div className="text-[10px] text-slate-500">
                {ev.evidence_type} · {ev.source_system_id}
              </div>
              <div className="mt-1 font-mono text-[10px] text-slate-400">hash: {ev.payload_hash || '—'}</div>
            </button>
          ))}
          {!evidence.length && <EmptyState message="No evidence for this instance" hint="Likely orphaned source record" />}
        </div>
      </SectionCard>

      {exception && (
        <SectionCard title="Linked Exception">
          <KVRow k="Exception ID" v={exception.exception_id} mono />
          <KVRow k="Type" v={exception.exception_type} />
          <KVRow k="Severity" v={<SeverityBadge severity={exception.severity} />} />
          <KVRow k="Status" v={exception.status} />
          <div className="mt-2 text-xs text-slate-700">{exception.disposition}</div>
          {exception.linked_issue_id && (
            <div className="mt-2">
              <Chip label={exception.linked_issue_id} tone="amber" onClick={() => drillFromDrawer('issue', exception.linked_issue_id as string)} />
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}

// =====================================================================
// EVIDENCE — Source Record + Correlation panels
// =====================================================================
export function EvidenceDetailPanel({
  evidenceId,
  drillFromDrawer,
}: {
  evidenceId: string;
  drillFromDrawer: DrillFromDrawer;
}) {
  const ev = getEvidence(evidenceId);
  if (!ev) return <EmptyState message="Evidence not found." />;
  const sr = ev.source_record_id ? getSourceRecord(ev.source_record_id) : null;
  const sys = getSourceSystem(ev.source_system_id);
  const correlations = sr ? correlationsForSourceRecord(sr.source_record_id) : [];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{ev.evidence_id}</h2>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Chip label={ev.evidence_type} tone="sky" />
          <EvidenceStatusBadge status={ev.evidence_status} />
          <Chip label={`Retention · ${ev.retention_class}`} tone="slate" />
          <Chip label={`Freshness · ${ev.freshness_days ?? '—'}d`} tone="slate" />
        </div>
      </div>

      <SectionCard title="Regulator-readiness flags" subtitle="From Pass 3 readiness flag set">
        <div className="grid grid-cols-3 gap-2 text-xs">
          {Object.entries(ev.regulator_ready_flags).map(([k, v]) => (
            <div key={k} className={`rounded border px-2 py-1 ${v ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
              <span className="font-semibold">{v ? '✓' : '✗'}</span> {k.toUpperCase()}
            </div>
          ))}
        </div>
      </SectionCard>

      {sys && (
        <SectionCard title="Source System">
          <KVRow k="System" v={`${sys.system_type} · ${sys.vendor}`} />
          <KVRow k="System ID" v={sys.source_system_id} mono />
          <KVRow k="Integration" v={sys.integration_mode} />
          <KVRow k="Status" v={<StatusBadge tone={sys.status === 'healthy' ? 'green' : sys.status === 'degraded' ? 'amber' : 'red'} label={sys.status} size="xs" />} />
        </SectionCard>
      )}

      {sr && (
        <SectionCard title="Source Record" subtitle="Hash-verified payload with primary key">
          <KVRow k="SR ID" v={sr.source_record_id} mono />
          <KVRow k="Source table / API" v={sr.source_table_or_api} mono />
          <KVRow k="Primary key" v={sr.source_primary_key} mono />
          <KVRow k="Payload hash" v={sr.payload_hash || '—'} mono />
          <KVRow k="Event ts" v={fmtTs(sr.event_timestamp)} mono />
          <KVRow k="Ingested ts" v={fmtTs(sr.ingestion_timestamp)} mono />
          <KVRow k="Validation" v={sr.validation_status} />
          <KVRow k="Correlation" v={sr.correlation_status} />
          <details className="mt-2 rounded border border-slate-200 bg-slate-50 p-2 text-xs">
            <summary className="cursor-pointer font-semibold text-slate-700">Key fields preview</summary>
            <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-words font-mono text-[10px] text-slate-700">
              {JSON.stringify(sr.key_fields_preview, null, 2)}
            </pre>
          </details>
        </SectionCard>
      )}

      {correlations.length > 0 && (
        <SectionCard title={`Correlation records (${correlations.length})`}>
          <div className="space-y-2">
            {correlations.map((cr) => (
              <div key={cr.correlation_id} className="rounded border border-slate-200 bg-slate-50 p-2 text-xs">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-600">{cr.correlation_id}</span>
                  <Chip label={cr.correlation_status} tone={cr.correlation_status === 'matched' ? 'emerald' : cr.correlation_status.includes('orphan') ? 'violet' : 'amber'} size="xs" />
                </div>
                <div className="text-slate-700">{cr.explanation}</div>
                <div className="mt-1 text-[10px] text-slate-500">
                  Key: <span className="font-mono">{cr.primary_key_used}</span> · Confidence: {(cr.match_confidence * 100).toFixed(0)}% · Cardinality {cr.expected_cardinality} → {cr.actual_cardinality}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// =====================================================================
// OBLIGATION
// =====================================================================
export function ObligationDetailPanel({
  obligationId,
  drillFromDrawer,
}: {
  obligationId: string;
  drillFromDrawer: DrillFromDrawer;
}) {
  const obl = getObligation(obligationId);
  if (!obl) return <EmptyState message="Obligation not found." />;
  const reg = getRegulation(obl.regulation_id);
  const sm = getSeniorManager(obl.accountable_senior_manager_id);
  const clock = obl.reporting_clock_id ? getReportingClock(obl.reporting_clock_id) : null;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{reg?.regulator}</div>
        <h2 className="text-base font-bold text-slate-900">{obl.atomic_requirement}</h2>
        {reg && <div className="mt-1 text-xs text-slate-500">{reg.title} · {reg.citation}</div>}
      </div>

      <SectionCard title="Identification">
        <KVRow k="Obligation ID" v={obl.obligation_id} mono />
        <KVRow k="Regulation" v={reg?.regulation_id || '—'} mono />
        <KVRow k="Accountable SM" v={sm?.name || obl.accountable_senior_manager_id} />
        <KVRow k="Applicability" v={obl.applicability_archetype.join(', ')} />
        <KVRow k="Applicable processes" v={obl.applicable_processes.join(', ')} />
        {clock && <KVRow k="Reporting clock" v={`${clock.clock_label} · ${clock.current_status}`} />}
      </SectionCard>

      {reg && (
        <SectionCard title="Regulation instrument">
          <Chip label={`${reg.regulation_id} · ${reg.title}`} tone="slate" onClick={() => drillFromDrawer('regulation', reg.regulation_id)} />
          <div className="mt-2 text-[11px] text-slate-600">{reg.citation}</div>
        </SectionCard>
      )}

      <SectionCard title="Linked Controls">
        {obl.linked_control_ids.length ? (
          <div className="flex flex-wrap gap-1.5">
            {obl.linked_control_ids.map((id) => (
              <Chip key={id} label={id} tone="indigo" onClick={() => drillFromDrawer('control', id)} />
            ))}
          </div>
        ) : (
          <EmptyState message="No controls linked" hint="Coverage gap" />
        )}
      </SectionCard>
    </div>
  );
}

// =====================================================================
// ISSUE
// =====================================================================
export function IssueDetailPanel({ issueId, drillFromDrawer }: { issueId: string; drillFromDrawer: DrillFromDrawer }) {
  const iss = getIssue(issueId);
  if (!iss) return <EmptyState message="Issue not found." />;
  const sm = getSeniorManager(iss.accountable_senior_manager_id);
  const remediations = remediationsForIssue(iss.issue_id);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-900">{iss.title}</h2>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <SeverityBadge severity={iss.severity} />
          <Chip label={iss.status} tone="slate" />
          <Chip label={`${iss.ageing_days}d open`} tone="amber" />
          {iss.rbi_mra_flag && <Chip label="RBI MRA" tone="rose" />}
          {iss.section_47a_exposure_flag && <Chip label="Section 47A exposure" tone="rose" />}
          {iss.pmla_exposure_flag && <Chip label="PMLA exposure" tone="rose" />}
        </div>
      </div>

      <SectionCard title="Root cause">
        <p className="text-xs text-slate-700">{iss.root_cause}</p>
      </SectionCard>

      <SectionCard title="Accountability">
        <KVRow k="Issue ID" v={iss.issue_id} mono />
        <KVRow
          k="Accountable SM"
          v={
            sm ? (
              <button
                type="button"
                className="text-left text-xs font-semibold text-indigo-700 underline decoration-dotted hover:text-indigo-900"
                onClick={() => drillFromDrawer('seniorManager', iss.accountable_senior_manager_id)}
              >
                {sm.name}
              </button>
            ) : (
              iss.accountable_senior_manager_id
            )
          }
        />
        <KVRow k="Opened" v={fmtDate(iss.opened_at)} />
        <KVRow k="Closed" v={fmtDate(iss.closed_at)} />
      </SectionCard>

      <SectionCard title="Linked entities">
        <div className="space-y-2">
          {iss.linked_control_ids.length > 0 && (
            <div>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Controls</div>
              <div className="flex flex-wrap gap-1.5">
                {iss.linked_control_ids.map((id) => (
                  <Chip key={id} label={id} tone="indigo" onClick={() => drillFromDrawer('control', id)} />
                ))}
              </div>
            </div>
          )}
          {iss.linked_obligation_ids.length > 0 && (
            <div>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Obligations</div>
              <div className="flex flex-wrap gap-1.5">
                {iss.linked_obligation_ids.map((id) => (
                  <Chip key={id} label={id} tone="violet" onClick={() => drillFromDrawer('obligation', id)} />
                ))}
              </div>
            </div>
          )}
          {iss.linked_ai_insight_ids.length > 0 && (
            <div>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">AI / predictive signals</div>
              <div className="flex flex-wrap gap-1.5">
                {iss.linked_ai_insight_ids.map((id) => (
                  <Chip key={id} label={id} tone="violet" onClick={() => drillFromDrawer('aiInsight', id)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title={`Remediation (${remediations.length})`}>
        <div className="space-y-2">
          {remediations.map((r) => (
            <div key={r.action_id} className="rounded border border-slate-200 bg-slate-50 p-2 text-xs">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-mono text-[10px] text-slate-600">{r.action_id}</span>
                <Chip label={r.status} tone={r.status === 'in_progress' ? 'amber' : r.status === 'closed' ? 'emerald' : 'slate'} size="xs" />
              </div>
              <div className="text-slate-700">{r.description}</div>
              <div className="mt-1 text-[10px] text-slate-500">
                Owner: {r.owner_id} · Due: {fmtDate(r.due_date)} {r.retest_required && r.retest_test_execution_id && (
                  <>
                    · Retest:{' '}
                    <button type="button" className="text-indigo-600 underline" onClick={() => drillFromDrawer('testExecution', r.retest_test_execution_id as string)}>
                      {r.retest_test_execution_id}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {!remediations.length && <EmptyState message="No remediation actions" />}
        </div>
      </SectionCard>
    </div>
  );
}

// =====================================================================
// AI INSIGHT
// =====================================================================
export function AIInsightDetailPanel({ insightId, drillFromDrawer }: { insightId: string; drillFromDrawer: DrillFromDrawer }) {
  const ins = getInsight(insightId);
  if (!ins) return <EmptyState message="Insight not found." />;
  const model = getModel(ins.model_id);
  const mrr = model ? modelRiskRecords.find((r) => r.model_id === model.model_id) || null : null;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-violet-700">{ins.signal_id} · {ins.signal_class.replace('_', ' ')}</div>
        <h2 className="text-base font-bold text-slate-900">{ins.title}</h2>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <HITLBadge status={ins.human_approval_status} />
          <Chip label={`Confidence ${(ins.confidence * 100).toFixed(0)}%`} tone="violet" />
          <Chip label={`Model ${ins.model_version}`} tone="slate" />
        </div>
      </div>

      <SectionCard title="Recommendation">
        <p className="text-xs text-slate-700">{ins.recommendation}</p>
      </SectionCard>

      <SectionCard title="Risk if wrong (counter-factual)">
        <p className="text-xs text-slate-600">{ins.risk_if_wrong}</p>
      </SectionCard>

      <SectionCard title="Cited evidence">
        <div className="flex flex-wrap gap-1.5">
          {ins.cited_evidence_ids.map((id) => (
            <Chip key={id} label={id} tone="sky" onClick={() => drillFromDrawer('evidence', id)} />
          ))}
          {!ins.cited_evidence_ids.length && <span className="text-xs text-slate-400">None</span>}
        </div>
      </SectionCard>

      <SectionCard title="Cited source records">
        <div className="flex flex-wrap gap-1.5">
          {ins.cited_source_record_ids.map((id) => (
            <Chip key={id} label={id} tone="slate" />
          ))}
          {!ins.cited_source_record_ids.length && <span className="text-xs text-slate-400">None</span>}
        </div>
      </SectionCard>

      {model && (
        <SectionCard title="Model & MRM">
          <KVRow k="Model" v={model.model_name} />
          <KVRow k="Type" v={model.model_type} />
          <KVRow k="Version" v={model.model_version} mono />
          <KVRow k="Last validation" v={fmtDate(model.last_validation_date)} />
          {mrr && <KVRow k="MRR outcome" v={`${mrr.validation_outcome} · drift ${mrr.drift_status}`} />}
          {mrr && <KVRow k="AITES" v={mrr.aites} />}
        </SectionCard>
      )}

      {ins.linked_issue_ids.length > 0 && (
        <SectionCard title="Linked issues">
          <div className="flex flex-wrap gap-1.5">
            {ins.linked_issue_ids.map((id) => (
              <Chip key={id} label={id} tone="amber" onClick={() => drillFromDrawer('issue', id)} />
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// =====================================================================
// KRI
// =====================================================================
export function KriDetailPanel({ kriId, drillFromDrawer }: { kriId: string; drillFromDrawer: DrillFromDrawer }) {
  const k = getKRI(kriId);
  if (!k) return <EmptyState message="KRI not found." />;
  const risk = getRisk(k.linked_risk_id);
  const sm = risk ? getSeniorManager(risk.accountable_senior_manager_id) : null;
  const obs = observationsForKRI(kriId);
  const latest = obs.length ? obs[obs.length - 1] : null;
  const band = latest?.band || 'grey';
  const breachHistory = obs.filter((o) => o.band === 'amber' || o.band === 'red');
  const tableObs = obs.slice(-24);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-[10px] font-bold text-slate-500">{k.kri_id}</div>
          <h2 className="text-base font-bold leading-snug text-slate-900">{k.name}</h2>
        </div>
        <StatusBadge tone={band === 'red' ? 'red' : band === 'amber' ? 'amber' : band === 'green' ? 'green' : 'neutral'} label={`Band · ${band}`} />
      </div>

      {risk && (
        <SectionCard title="Linked risk">
          <button type="button" className="w-full rounded-lg border border-indigo-100 bg-indigo-50/80 p-3 text-left hover:bg-indigo-50" onClick={() => drillFromDrawer('risk', risk.risk_id)}>
            <div className="font-mono text-[10px] text-indigo-700">{risk.risk_id}</div>
            <div className="text-sm font-semibold text-slate-900">{risk.title}</div>
          </button>
        </SectionCard>
      )}

      {risk && risk.linked_control_ids.length > 0 && (
        <SectionCard title="Controls (via linked risk)" subtitle="ORM graph: KRI → risk → controls">
          <div className="flex flex-wrap gap-1.5">
            {risk.linked_control_ids.map((cid) => (
              <Chip key={cid} label={cid} tone="indigo" onClick={() => drillFromDrawer('control', cid)} />
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard title="Threshold specification">
        <KVRow k="Amber" v={String(k.threshold_amber)} />
        <KVRow k="Red" v={String(k.threshold_red)} />
        <KVRow k="Unit" v={k.unit.replace(/_/g, ' ')} />
        <KVRow k="Formula reference" v={k.formula_ref} />
      </SectionCard>

      <SectionCard title={`Observation history (last ${tableObs.length})`} subtitle="Newest at bottom">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-1.5 pr-2">As of</th>
                <th className="py-1.5 pr-2">Value</th>
                <th className="py-1.5">Band</th>
              </tr>
            </thead>
            <tbody>
              {tableObs.map((o) => (
                <tr key={o.observation_id} className="border-b border-slate-100">
                  <td className="py-1.5 pr-2 font-mono text-[10px] text-slate-600">{fmtTs(o.as_of_ts)}</td>
                  <td className="py-1.5 pr-2 font-medium text-slate-900">{o.value}</td>
                  <td className="py-1.5">
                    <StatusBadge tone={o.band === 'red' ? 'red' : o.band === 'amber' ? 'amber' : 'green'} label={o.band} size="xs" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Breach history" subtitle="Observations in amber or red band">
        {breachHistory.length === 0 ? (
          <span className="text-xs text-slate-500">No breach-band observations in window.</span>
        ) : (
          <ul className="space-y-2 text-xs text-slate-800">
            {breachHistory.map((o) => (
              <li key={o.observation_id} className="flex flex-wrap items-center gap-2 border-b border-slate-50 pb-2 last:border-0">
                <span className="font-mono text-[10px] text-slate-500">{fmtTs(o.as_of_ts)}</span>
                <span className="font-semibold">{o.value}</span>
                <StatusBadge tone={o.band === 'red' ? 'red' : 'amber'} label={o.band} size="xs" />
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {sm && (
        <SectionCard title="Accountable senior manager">
          <button type="button" className="text-sm font-semibold text-indigo-700 underline" onClick={() => drillFromDrawer('seniorManager', sm.senior_manager_id)}>
            {sm.name}
          </button>
          <div className="mt-1 text-[10px] text-slate-500">{sm.role}</div>
        </SectionCard>
      )}
    </div>
  );
}

// =====================================================================
// SENIOR MANAGER
// =====================================================================
export function SeniorManagerDetailPanel({
  smId,
  drillFromDrawer,
}: {
  smId: string;
  drillFromDrawer: DrillFromDrawer;
}) {
  const sm = getSeniorManager(smId);
  if (!sm) return <EmptyState message="Senior manager not found." />;
  const issues = issuesForSeniorManager(sm.senior_manager_id);
  const decisions = decisionsForSeniorManager(sm.senior_manager_id);
  const attestations = attestationsForSeniorManager(sm.senior_manager_id);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <ScoreRing score={sm.saes} band={sm.saes >= 85 ? 'green' : sm.saes >= 70 ? 'amber' : 'red'} label="SAES" size={92} />
        <div>
          <h2 className="text-lg font-bold text-slate-900">{sm.name}</h2>
          <div className="text-xs text-slate-500">{sm.role} · {sm.function}</div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Chip label={`${issues.length} open issues`} tone={issues.length > 0 ? 'amber' : 'emerald'} />
            <Chip label={`${decisions.length} decisions`} tone="slate" />
            <Chip label={`${attestations.length} attestations`} tone="emerald" />
          </div>
        </div>
      </div>

      <SectionCard title="Accountable scope">
        <KVRow k="Processes" v={sm.accountable_processes.join(', ') || '—'} />
        <KVRow k="Controls" v={sm.accountable_controls.join(', ') || '—'} />
        <KVRow k="Risks" v={sm.accountable_risks.join(', ') || '—'} />
        <KVRow k="Obligations" v={sm.accountable_obligations.join(', ') || '—'} />
        <KVRow k="Last attestation" v={fmtDate(sm.last_attestation_date)} />
      </SectionCard>

      <SectionCard title="Open issues">
        {issues.length ? (
          <div className="space-y-2">
            {issues.map((iss) => (
              <button
                key={iss.issue_id}
                type="button"
                onClick={() => drillFromDrawer('issue', iss.issue_id)}
                className="block w-full rounded border border-slate-200 bg-white p-2 text-left hover:border-amber-300"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900">{iss.title}</div>
                    <div className="font-mono text-[10px] text-slate-500">{iss.issue_id} · {iss.ageing_days}d</div>
                  </div>
                  <SeverityBadge severity={iss.severity} />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <span className="text-xs text-slate-400">No open issues</span>
        )}
      </SectionCard>

      <SectionCard title="Recent decisions">
        {decisions.length ? (
          <div className="space-y-2">
            {decisions.map((d) => (
              <div key={d.decision_id} className="rounded border border-slate-200 bg-slate-50 p-2 text-xs">
                <div className="mb-1 flex items-center justify-between">
                  <Chip label={d.decision_type} tone="emerald" size="xs" />
                  <span className="text-[10px] text-slate-500">{fmtDate(d.decision_timestamp)}</span>
                </div>
                <div className="text-slate-700">{d.approval_basis}</div>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-xs text-slate-400">No decisions logged</span>
        )}
      </SectionCard>
    </div>
  );
}

// =====================================================================
// AUDIT PACK
// =====================================================================
export function AuditPackDetailPanel({
  packId,
  drillFromDrawer,
  setActiveScreen,
  setSelectedPackId,
  closeDrawer,
}: {
  packId: string;
  drillFromDrawer: DrillFromDrawer;
  setActiveScreen: SetActiveScreen;
  setSelectedPackId: (id: string) => void;
  closeDrawer: () => void;
}) {
  const ap = getAuditPack(packId);
  if (!ap) return <EmptyState message="Readiness pack not found." />;
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <ScoreRing score={ap.ars} band={ap.readiness_status === 'green' ? 'green' : ap.readiness_status === 'amber' ? 'amber' : 'red'} label="ARS" size={92} />
        <div>
          <h2 className="text-lg font-bold text-slate-900">{ap.audit_pack_id}</h2>
          <div className="text-xs text-slate-500">Lens · {ap.scope_id} · Audience: {ap.target_audience}</div>
          <div className="mt-1">
            <StatusBadge tone={ap.readiness_status === 'green' ? 'green' : ap.readiness_status === 'amber' ? 'amber' : 'red'} label={`Readiness · ${ap.readiness_status}`} />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          setSelectedPackId(ap.audit_pack_id);
          setActiveScreen('workpaperAuditPackBuilder');
          closeDrawer();
        }}
        className="w-full rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
      >
        Open in Inspection pack builder →
      </button>

      <SectionCard title={`Pack workpapers (${ap.included_workpaper_ids.length})`}>
        <div className="flex flex-wrap gap-1.5">
          {ap.included_workpaper_ids.map((id) => (
            <Chip key={id} label={id} tone="slate" onClick={() => drillFromDrawer('workpaper', id)} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title={`Evidence (${ap.included_evidence_ids.length})`}>
        <div className="flex flex-wrap gap-1.5">
          {ap.included_evidence_ids.map((id) => (
            <Chip key={id} label={id} tone="sky" onClick={() => drillFromDrawer('evidence', id)} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title={`Issues (${ap.included_issue_ids.length})`}>
        <div className="flex flex-wrap gap-1.5">
          {ap.included_issue_ids.map((id) => (
            <Chip key={id} label={id} tone="amber" onClick={() => drillFromDrawer('issue', id)} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// =====================================================================
// PROCESS / PROCESS EXECUTION
// =====================================================================
export function ProcessDetailPanel({ processId, drillFromDrawer }: { processId: string; drillFromDrawer: DrillFromDrawer }) {
  const p = getProcess(processId);
  if (!p) return <EmptyState message="Process not found." />;
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{p.name}</h2>
        <div className="text-xs text-slate-500">{p.owner_role}</div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Chip label={`PVDS · ${p.pvds ?? '—'}`} tone="indigo" />
          <Chip label={p.status} tone="slate" />
        </div>
      </div>
      <SectionCard title="Identification">
        <KVRow k="Process ID" v={p.process_id} mono />
        <KVRow k="Variant signature" v={p.documented_variant_signature} />
        <KVRow k="Regulations" v={p.regulatory_anchor_ids.join(', ') || '—'} />
        <KVRow k="Obligations" v={p.linked_obligation_ids.length} />
      </SectionCard>
      <SectionCard title="Linked obligations">
        <div className="flex flex-wrap gap-1.5">
          {p.linked_obligation_ids.map((id) => (
            <Chip key={id} label={id} tone="violet" onClick={() => drillFromDrawer('obligation', id)} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export function ProcessExecutionDetailPanel({ peId, drillFromDrawer }: { peId: string; drillFromDrawer: DrillFromDrawer }) {
  const pe = getProcessExecution(peId);
  if (!pe) return <EmptyState message="Process execution not found." />;
  const steps = stepExecutionsForExecution(pe.process_execution_id);
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-900">{pe.process_id} · {pe.anchor_key_value}</h2>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Chip label={pe.status} tone={pe.status === 'failed_control' ? 'rose' : pe.status === 'activated_with_data_gap' ? 'amber' : 'emerald'} />
          <Chip label={pe.variant_signature} tone="slate" />
          <Chip label={`Evidence ${pe.evidence_completeness}%`} tone={pe.evidence_completeness >= 90 ? 'emerald' : pe.evidence_completeness >= 70 ? 'amber' : 'rose'} />
        </div>
      </div>
      <SectionCard title="Step executions">
        <ol className="space-y-1">
          {steps.map((se) => (
            <li key={se.step_execution_id} className="rounded border border-slate-200 bg-slate-50 p-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-slate-600">{se.step_id}</span>
                <span className="text-[10px] text-slate-500">{se.actual_actor_type} · {se.actual_system}</span>
              </div>
              <div className="mt-0.5 text-[10px] text-slate-500">
                {fmtTs(se.start_ts)} → {fmtTs(se.end_ts)}
                {se.bpo_or_vendor_flag && <Chip label="BPO" tone="amber" size="xs" />}
                {se.skipped_step_flag && <Chip label="Skipped" tone="rose" size="xs" />}
              </div>
              {se.deviation_note && <div className="mt-1 text-[10px] text-amber-700">{se.deviation_note}</div>}
            </li>
          ))}
        </ol>
      </SectionCard>
    </div>
  );
}

// =====================================================================
// TEST EXECUTION
// =====================================================================
export function TestExecutionDetailPanel({ testId, drillFromDrawer }: { testId: string; drillFromDrawer: DrillFromDrawer }) {
  const t = getTest(testId);
  if (!t) return <EmptyState message="Test execution not found." />;
  const ctrl = getControl(t.control_id);
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-900">{t.test_id}</h2>
        <div className="text-xs text-slate-500">{ctrl?.title || t.control_id}</div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Chip label={t.test_type} tone="emerald" />
          <Chip label={t.result} tone={t.result === 'Failed' ? 'rose' : t.result === 'pending' ? 'amber' : 'emerald'} />
          {t.rerunnable_flag && <Chip label="Rerunnable" tone="slate" />}
        </div>
      </div>
      <SectionCard title="Population summary">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <KVRow k="Population" v={t.population_size ?? '—'} />
          <KVRow k="Tested" v={t.tested_count ?? '—'} />
          <KVRow k="Exceptions" v={t.exception_count ?? '—'} tone={t.exception_count ? 'red' : 'green'} />
          <KVRow k="Data gaps" v={t.data_gap_count ?? '—'} />
          <KVRow k="Evidence gaps" v={t.evidence_gap_count ?? '—'} />
          <KVRow k="As-of" v={fmtDate(t.as_of_date)} />
        </div>
      </SectionCard>
      <SectionCard title="Population query">
        <pre className="overflow-x-auto rounded bg-slate-50 p-2 font-mono text-[10px] text-slate-700">{t.population_query_ref}</pre>
      </SectionCard>
      {t.linked_workpaper_id && (
        <button
          type="button"
          onClick={() => drillFromDrawer('workpaper', t.linked_workpaper_id as string)}
          className="w-full rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
        >
          Open linked workpaper · {t.linked_workpaper_id} →
        </button>
      )}
    </div>
  );
}

// =====================================================================
// WORKPAPER
// =====================================================================
export function WorkpaperDetailPanel({ workpaperId, drillFromDrawer }: { workpaperId: string; drillFromDrawer: DrillFromDrawer }) {
  const wp = getWorkpaper(workpaperId);
  if (!wp) return <EmptyState message="Workpaper not found." />;
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-900">{wp.workpaper_id}</h2>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Chip label={wp.status} tone={wp.status === 'signed' ? 'emerald' : wp.status === 'in_review' ? 'amber' : 'slate'} />
          {wp.retest_required && <Chip label="Retest required" tone="amber" />}
        </div>
      </div>
      <SectionCard title="Sections">
        <ol className="ml-4 list-decimal text-xs text-slate-700">
          {wp.sections.map((s) => (
            <li key={s} className="py-0.5">{s}</li>
          ))}
        </ol>
      </SectionCard>
      <SectionCard title="Readiness flags">
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(wp.readiness_flags).map(([k, v]) => (
            <div key={k} className={`rounded border px-2 py-1 ${v ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
              {v ? '✓' : '✗'} {k.toUpperCase()}
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Sign-off">
        <KVRow k="Tester" v={wp.tester_id} />
        <KVRow k="Signed at" v={fmtTs(wp.signed_at)} />
        <KVRow k="Reviewer" v={wp.reviewer_id} />
        <KVRow k="Reviewer signed" v={fmtTs(wp.reviewer_signed_at)} />
      </SectionCard>
      <SectionCard title="Audit-trail">
        {auditTrailForEntity('workpaper', wp.workpaper_id).map((e) => (
          <div key={e.audit_trail_event_id} className="border-b border-slate-100 py-1.5 text-[10px] last:border-0">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">{e.event_type}</span>
              <span className="text-slate-500">{fmtTs(e.system_time)}</span>
            </div>
            <div className="text-slate-600">{e.payload_summary}</div>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}

// =====================================================================
// SOURCE SYSTEM
// =====================================================================
export function SourceSystemDetailPanel({ systemId }: { systemId: string }) {
  const s = getSourceSystem(systemId);
  if (!s) return <EmptyState message="Source system not found." />;
  const h = getSourceSystemHealth(systemId);
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-900">{s.system_type} · {s.vendor}</h2>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <StatusBadge tone={s.status === 'healthy' ? 'green' : s.status === 'degraded' ? 'amber' : 'red'} label={s.status} />
          <Chip label={`Wave ${s.wave}`} tone="slate" />
          {s.system_of_record_flag && <Chip label="System of record" tone="indigo" />}
        </div>
      </div>
      <SectionCard title="Integration">
        <KVRow k="System ID" v={s.source_system_id} mono />
        <KVRow k="Mode" v={s.integration_mode} />
        <KVRow k="Expected latency" v={`${s.expected_latency_ms} ms`} />
      </SectionCard>
      {h && (
        <SectionCard title="Health observation">
          <KVRow k="Status" v={h.status} />
          <KVRow k="Lag" v={`${h.ingestion_lag_ms} ms`} />
          <KVRow k="Schema" v={h.schema_version_current} mono />
          <KVRow k="Error rate" v={`${(h.error_rate * 100).toFixed(2)}%`} />
          <KVRow k="Orphans" v={h.orphan_count} tone={h.orphan_count > 0 ? 'amber' : 'green'} />
          <KVRow k="Last ingest" v={fmtTs(h.last_successful_ingest_ts)} mono />
        </SectionCard>
      )}
    </div>
  );
}

// =====================================================================
// EXCEPTION
// =====================================================================
export function ExceptionDetailPanel({ exceptionId, drillFromDrawer }: { exceptionId: string; drillFromDrawer: DrillFromDrawer }) {
  const ex = getException(exceptionId);
  if (!ex) return <EmptyState message="Exception not found." />;
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-900">{ex.exception_id}</h2>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <SeverityBadge severity={ex.severity} />
          <Chip label={ex.exception_type} tone="rose" />
          <Chip label={ex.status} tone="slate" />
        </div>
      </div>
      <SectionCard title="Disposition">
        <p className="text-xs text-slate-700">{ex.disposition}</p>
      </SectionCard>
      <SectionCard title="Linked entities">
        <KVRow
          k="Control instance"
          v={
            <button type="button" className="font-mono text-[10px] text-indigo-600 underline" onClick={() => drillFromDrawer('controlInstance', ex.control_instance_id)}>
              {ex.control_instance_id}
            </button>
          }
        />
        {ex.linked_issue_id && (
          <KVRow
            k="Issue"
            v={
              <button type="button" className="text-[10px] text-indigo-600 underline" onClick={() => drillFromDrawer('issue', ex.linked_issue_id as string)}>
                {ex.linked_issue_id}
              </button>
            }
          />
        )}
      </SectionCard>
    </div>
  );
}

// =====================================================================
// REMEDIATION
// =====================================================================
export function RemediationDetailPanel({ actionId, drillFromDrawer }: { actionId: string; drillFromDrawer: DrillFromDrawer }) {
  const r = getRemediation(actionId);
  if (!r) return <EmptyState message="Remediation action not found." />;
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-900">{r.action_id}</h2>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Chip label={r.status} tone={r.status === 'in_progress' ? 'amber' : 'emerald'} />
          {r.retest_required && <Chip label="Retest required" tone="amber" />}
        </div>
      </div>
      <SectionCard title="Description">
        <p className="text-xs text-slate-700">{r.description}</p>
      </SectionCard>
      <SectionCard title="Tracking">
        <KVRow k="Owner" v={r.owner_id} />
        <KVRow k="Due" v={fmtDate(r.due_date)} />
        <KVRow k="Closed" v={fmtDate(r.actual_close_date)} />
        <KVRow k="Issue" v={<button type="button" className="text-[10px] text-indigo-600 underline" onClick={() => drillFromDrawer('issue', r.issue_id)}>{r.issue_id}</button>} />
      </SectionCard>
    </div>
  );
}

// =====================================================================
// CORRELATION RECORD
// =====================================================================
export function CorrelationDetailPanel({ correlationId }: { correlationId: string }) {
  const cr = getCorrelation(correlationId);
  if (!cr) return <EmptyState message="Correlation record not found." />;
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-900">{cr.correlation_id}</h2>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Chip label={cr.correlation_status} tone={cr.correlation_status === 'matched' ? 'emerald' : cr.correlation_status.includes('orphan') ? 'violet' : 'amber'} />
          <Chip label={`Confidence ${(cr.match_confidence * 100).toFixed(0)}%`} tone="slate" />
        </div>
      </div>
      <SectionCard title="Match metadata">
        <KVRow k="Method" v={cr.match_method} />
        <KVRow k="Primary key" v={cr.primary_key_used} mono />
        <KVRow k="Backup key" v={cr.backup_key_used || '—'} mono />
        <KVRow k="Cardinality" v={`${cr.expected_cardinality} → ${cr.actual_cardinality}`} />
      </SectionCard>
      <SectionCard title="Explanation">
        <p className="text-xs text-slate-700">{cr.explanation}</p>
      </SectionCard>
      <SectionCard title="Linked records">
        <KVRow k="From" v={`${cr.from_entity_type} · ${cr.from_entity_id}`} mono />
        <KVRow k="To" v={cr.to_entity_id ? `${cr.to_entity_type} · ${cr.to_entity_id}` : 'orphan'} mono />
      </SectionCard>
    </div>
  );
}

// =====================================================================
// REGULATION
// =====================================================================
export function RegulationDetailPanel({
  regulationId,
  drillFromDrawer,
}: {
  regulationId: string;
  drillFromDrawer: DrillFromDrawer;
}) {
  const reg = getRegulation(regulationId);
  if (!reg) return <EmptyState message="Regulation not found." />;
  const linkedObl = obligations.filter((o) => o.regulation_id === regulationId);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{reg.regulator}</div>
        <h2 className="text-base font-bold text-slate-900">{reg.title}</h2>
        <div className="mt-1 font-mono text-[10px] text-slate-500">{reg.regulation_id}</div>
      </div>
      <SectionCard title="Citation">
        <p className="text-xs text-slate-700">{reg.citation}</p>
      </SectionCard>
      <SectionCard title="Atomic obligations">
        {linkedObl.length ? (
          <div className="flex flex-wrap gap-1.5">
            {linkedObl.map((o) => (
              <Chip key={o.obligation_id} label={o.obligation_id} tone="violet" onClick={() => drillFromDrawer('obligation', o.obligation_id)} />
            ))}
          </div>
        ) : (
          <EmptyState message="No obligations in this prototype slice." />
        )}
      </SectionCard>
    </div>
  );
}

// =====================================================================
// RCA
// =====================================================================
export function RcaDetailPanel({ rcaId, drillFromDrawer }: { rcaId: string; drillFromDrawer: DrillFromDrawer }) {
  const rca = getRca(rcaId);
  if (!rca) return <EmptyState message="RCA not found." />;
  const inc = getIncident(rca.incident_id);
  const owner = rca.owner_senior_manager_id ? getSeniorManager(rca.owner_senior_manager_id) : null;
  const pas = preventiveActions.filter((p) => p.rca_id === rca.rca_id);
  const ctrlIds = new Set<string>();
  if (inc?.linked_control_ids) inc.linked_control_ids.forEach((c) => ctrlIds.add(c));

  return (
    <div className="space-y-4">
      <div>
        <div className="font-mono text-[10px] text-slate-500">{rca.rca_id}</div>
        <h2 className="text-base font-bold text-slate-900">RCA record</h2>
        <div className="mt-1 flex flex-wrap gap-2">
          <Chip label={(rca.status || '—').replace(/_/g, ' ')} tone="indigo" />
          <Chip label={rca.methodology || 'five_whys'} tone="slate" size="xs" />
        </div>
      </div>

      {inc && (
        <SectionCard title="Source incident">
          <button
            type="button"
            className="w-full rounded-lg border border-rose-100 bg-rose-50/80 p-3 text-left hover:bg-rose-50"
            onClick={() => drillFromDrawer('incident', inc.incident_id)}
          >
            <div className="font-mono text-[10px] text-rose-800">{inc.incident_id}</div>
            <div className="text-sm font-semibold text-slate-900">{inc.title}</div>
          </button>
        </SectionCard>
      )}

      <SectionCard title="Linked controls (from incident)">
        {[...ctrlIds].length ? (
          <div className="flex flex-wrap gap-1.5">
            {[...ctrlIds].map((cid) => (
              <Chip key={cid} label={cid} tone="indigo" onClick={() => drillFromDrawer('control', cid)} />
            ))}
          </div>
        ) : (
          <EmptyState message="No controls linked on the incident." />
        )}
      </SectionCard>

      <SectionCard title="Preventive actions">
        {pas.length ? (
          <div className="space-y-2">
            {pas.map((pa) => (
              <button
                key={pa.preventive_action_id}
                type="button"
                onClick={() => drillFromDrawer('preventiveAction', pa.preventive_action_id)}
                className="block w-full rounded border border-slate-200 bg-white p-2 text-left text-xs hover:border-orange-300"
              >
                <div className="font-mono text-[10px] text-slate-500">{pa.preventive_action_id}</div>
                <div className="font-medium text-slate-900">{pa.title || '—'}</div>
                <div className="mt-1 text-[10px] capitalize text-slate-600">{pa.status.replace(/_/g, ' ')}</div>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState message="No preventive actions on this RCA." />
        )}
      </SectionCard>

      <SectionCard title="Ownership">
        <KVRow k="RCA owner" v={owner?.name || rca.owner_senior_manager_id || '—'} />
        <KVRow k="Opened" v={fmtDate(rca.opened_at)} />
        <KVRow k="Completed" v={fmtDate(rca.rca_completed_at)} />
      </SectionCard>
    </div>
  );
}

// =====================================================================
// PREVENTIVE ACTION
// =====================================================================
export function PreventiveActionDetailPanel({
  paId,
  drillFromDrawer,
}: {
  paId: string;
  drillFromDrawer: DrillFromDrawer;
}) {
  const pa = getPreventiveAction(paId);
  if (!pa) return <EmptyState message="Preventive action not found." />;
  const rca = getRca(pa.rca_id);
  const inc = rca ? getIncident(rca.incident_id) : null;
  const sm = pa.owner_senior_manager_id ? getSeniorManager(pa.owner_senior_manager_id) : null;
  const blockingNotes = pacNotes.filter((pn) => (pn.blocking_preventive_action_ids || []).includes(pa.preventive_action_id));

  return (
    <div className="space-y-4">
      <div>
        <div className="font-mono text-[10px] text-slate-500">{pa.preventive_action_id}</div>
        <h2 className="text-base font-bold text-slate-900">{pa.title || 'Preventive action'}</h2>
        <div className="mt-1 flex flex-wrap gap-2">
          <Chip label={pa.status.replace(/_/g, ' ')} tone={pa.status === 'closed' ? 'emerald' : 'amber'} />
          {pa.linked_pac_note_block_flag && <Chip label="Blocks PAC" tone="rose" size="xs" />}
        </div>
      </div>

      <SectionCard title="RCA · incident chain">
        {rca ? (
          <div className="space-y-2">
            <button
              type="button"
              className="block w-full rounded-lg border border-indigo-100 bg-indigo-50/80 p-3 text-left hover:bg-indigo-50"
              onClick={() => drillFromDrawer('rca', rca.rca_id)}
            >
              <div className="font-mono text-[10px] text-indigo-700">{rca.rca_id}</div>
              <div className="text-xs font-semibold text-slate-800">{(rca.status || '').replace(/_/g, ' ')}</div>
            </button>
            {inc ? (
              <button
                type="button"
                className="block w-full rounded-lg border border-rose-100 bg-rose-50/80 p-3 text-left hover:bg-rose-50"
                onClick={() => drillFromDrawer('incident', inc.incident_id)}
              >
                <div className="font-mono text-[10px] text-rose-800">{inc.incident_id}</div>
                <div className="text-xs font-semibold text-slate-800">{inc.title}</div>
              </button>
            ) : null}
          </div>
        ) : (
          <EmptyState message="RCA not found for this PA." />
        )}
      </SectionCard>

      <SectionCard title="PAC notes blocking on this PA">
        {blockingNotes.length ? (
          <ul className="space-y-2 text-xs text-slate-700">
            {blockingNotes.map((pn) => (
              <li key={pn.pac_note_id} className="rounded border border-slate-200 bg-white p-2">
                <div className="font-mono text-[10px]">{pn.pac_note_id}</div>
                <div className="font-medium">{pn.title || 'PAC note'}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {(pn.referenced_rca_ids || []).map((rid) => (
                    <Chip key={rid} label={rid} tone="indigo" size="xs" onClick={() => drillFromDrawer('rca', rid)} />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-xs text-slate-500">No PAC notes list this PA in blocking_preventive_action_ids.</span>
        )}
      </SectionCard>

      <SectionCard title="Accountability">
        <KVRow k="Target date" v={fmtDate(pa.target_date)} />
        <KVRow
          k="Owner SM"
          v={
            sm && pa.owner_senior_manager_id ? (
              <button
                type="button"
                className="text-xs font-semibold text-indigo-700 underline"
                onClick={() => drillFromDrawer('seniorManager', pa.owner_senior_manager_id as string)}
              >
                {sm.name}
              </button>
            ) : (
              pa.owner_senior_manager_id || '—'
            )
          }
        />
      </SectionCard>
    </div>
  );
}

// =====================================================================
// INCIDENT (ORI)
// =====================================================================
function rcaForIncidentId(incidentId: string, linkedRcaId?: string | null) {
  if (linkedRcaId) return rcas.find((r) => r.rca_id === linkedRcaId) || null;
  return rcas.find((r) => r.incident_id === incidentId) || null;
}

function incidentTypeChipTone(t: string): 'slate' | 'rose' | 'violet' | 'sky' | 'amber' | 'indigo' {
  if (t === 'operational_loss') return 'slate';
  if (t === 'near_miss') return 'sky';
  if (t === 'fraud') return 'rose';
  if (t === 'cyber') return 'violet';
  if (t === 'conduct') return 'amber';
  if (t === 'regulatory_breach') return 'indigo';
  return 'slate';
}

function severityChipTone(s: string): 'rose' | 'amber' | 'slate' {
  if (s === 'high' || s === 'critical') return 'rose';
  if (s === 'medium') return 'amber';
  return 'slate';
}

function daysBetweenYmd(occ?: string | null, disc?: string | null): string {
  if (!occ || !disc) return '—';
  const o = new Date(occ.includes('T') ? occ : `${occ}T00:00:00`).getTime();
  const d = new Date(disc.includes('T') ? disc : `${disc}T00:00:00`).getTime();
  if (Number.isNaN(o) || Number.isNaN(d)) return '—';
  const days = Math.round((d - o) / 86400000);
  return `${days}`;
}

function rcaStatusHeadline(st?: string) {
  if (!st) return 'RCA';
  if (st === 'approved') return 'RCA approved';
  if (st === 'in_progress') return 'RCA in progress';
  if (st === 'draft') return 'RCA draft';
  return st.replace(/_/g, ' ');
}

export function IncidentDetailPanel({
  incidentId,
  drillFromDrawer,
  onOpenRcaWorkspace,
  closeDrawer,
}: {
  incidentId: string;
  drillFromDrawer: DrillFromDrawer;
  onOpenRcaWorkspace: (rcaId: string) => void;
  closeDrawer: () => void;
}) {
  const inc = getIncident(incidentId);
  if (!inc) return <EmptyState message="Incident not found." />;
  const rca = rcaForIncidentId(inc.incident_id, inc.linked_rca_id);
  const sm = getSeniorManager(inc.accountable_senior_manager_id);
  const whys = rca?.five_whys_steps?.length ?? 0;
  const paCount = rca ? preventiveActions.filter((pa) => pa.rca_id === rca.rca_id).length : 0;
  const rcaOwner = rca?.owner_senior_manager_id ? getSeniorManager(rca.owner_senior_manager_id) : null;
  const incidentAudit = auditTrailForEntity('incident', inc.incident_id);

  const gross = inc.gross_loss_inr ?? null;
  const rec = inc.recovery_inr ?? null;
  const net =
    gross != null || rec != null ? (gross ?? 0) - (rec ?? 0) : null;
  const showLoss = inc.incident_type === 'operational_loss' || inc.incident_type === 'fraud';

  const rcaCardBorder =
    rca?.status === 'approved'
      ? 'border-emerald-200 bg-emerald-50/80'
      : rca?.status === 'in_progress'
        ? 'border-indigo-200 bg-indigo-50/80'
        : 'border-slate-200 bg-slate-50';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-sm font-semibold text-slate-900">{inc.incident_id}</span>
        <Chip label={inc.incident_type.replace(/_/g, ' ')} size="xs" tone={incidentTypeChipTone(inc.incident_type)} />
        <Chip label={inc.severity} size="xs" tone={severityChipTone(inc.severity)} />
        <Chip label={inc.status.replace(/_/g, ' ')} size="xs" tone="slate" />
        {inc.rbi_reportable === true && (
          <span className="rounded border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-800">
            RBI-reportable
          </span>
        )}
      </div>

      <h2 className="text-lg font-bold leading-snug text-slate-900">{inc.title}</h2>

      <SectionCard title="Key dates">
        <KVRow k="Occurred" v={fmtDate(inc.occurred_date)} mono />
        <KVRow k="Discovered" v={fmtDate(inc.discovered_date)} mono />
        <KVRow k="Reported" v={fmtDate(inc.reported_date)} mono />
        <KVRow k="Days to detection" v={daysBetweenYmd(inc.occurred_date, inc.discovered_date)} />
      </SectionCard>

      <SectionCard title="Description">
        {inc.description ? (
          <p className="text-xs leading-relaxed text-slate-700">{inc.description}</p>
        ) : (
          <EmptyState message="No description on file." />
        )}
      </SectionCard>

      {showLoss && (gross != null || rec != null || inc.basel_event_type) ? (
        <SectionCard title="Loss & Basel classification">
          {gross != null ? <KVRow k="Gross loss" v={formatInrLossDisplay(gross)} /> : null}
          {rec != null ? <KVRow k="Recovery" v={formatInrLossDisplay(rec)} /> : null}
          {net != null ? <KVRow k="Net loss" v={formatInrLossDisplay(net)} /> : null}
          <KVRow k="Basel event type" v={(inc.basel_event_type || '—').replace(/_/g, ' ')} />
          <KVRow k="Basel subtype" v={inc.basel_event_subtype ? inc.basel_event_subtype.replace(/_/g, ' ') : '—'} />
        </SectionCard>
      ) : null}

      <SectionCard title="Organisation">
        <KVRow k="Detection source" v={inc.detection_source ? inc.detection_source.replace(/_/g, ' ') : '—'} />
        <KVRow k="Business unit" v={inc.business_unit || '—'} />
        <KVRow
          k="Accountable SM"
          v={
            sm ? (
              <button
                type="button"
                className="text-left text-xs font-medium text-indigo-700 underline decoration-dotted hover:text-indigo-900"
                onClick={() => drillFromDrawer('seniorManager', sm.senior_manager_id)}
              >
                {sm.name}
              </button>
            ) : (
              inc.accountable_senior_manager_id || '—'
            )
          }
        />
      </SectionCard>

      <SectionCard title="Linked risks">
        {inc.linked_risk_ids?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {inc.linked_risk_ids.map((rid) => {
              const r = getRisk(rid);
              return (
                <Chip
                  key={rid}
                  label={r?.title ? `${rid} · ${r.title}` : rid}
                  tone="rose"
                  size="xs"
                  onClick={() => drillFromDrawer('risk', rid)}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState message="No risks linked." />
        )}
      </SectionCard>

      <SectionCard title="Linked controls">
        {inc.linked_control_ids?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {inc.linked_control_ids.map((cid) => {
              const c = getControl(cid);
              return (
                <Chip
                  key={cid}
                  label={c?.title ? `${cid} · ${c.title}` : cid}
                  tone="indigo"
                  size="xs"
                  onClick={() => drillFromDrawer('control', cid)}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState message="No controls linked." />
        )}
      </SectionCard>

      <SectionCard title="Linked processes" subtitle="Derived from linked controls">
        {(() => {
          const pids = new Set<string>();
          (inc.linked_control_ids || []).forEach((cid) => {
            const c = getControl(cid);
            if (c?.process_id) pids.add(c.process_id);
          });
          const list = [...pids];
          if (!list.length) return <EmptyState message="No processes resolved from linked controls." />;
          return (
            <div className="flex flex-wrap gap-1.5">
              {list.map((pid) => {
                const p = getProcess(pid);
                return (
                  <Chip key={pid} label={p?.name || pid} tone="sky" size="xs" onClick={() => drillFromDrawer('process', pid)} />
                );
              })}
            </div>
          );
        })()}
      </SectionCard>

      <SectionCard title="Evidence trail (sample)" subtitle="Control instances → verifiable evidence">
        {(() => {
          const samples: { eid: string; label: string }[] = [];
          for (const cid of inc.linked_control_ids || []) {
            const insts = controlInstancesForControl(cid).slice(0, 1);
            for (const ci of insts) {
              for (const ev of evidenceForControlInstance(ci).slice(0, 2)) {
                samples.push({ eid: ev.evidence_id, label: `${ev.evidence_id} · ${cid}` });
              }
            }
          }
          if (!samples.length) return <EmptyState message="No evidence samples in current window." />;
          return (
            <div className="flex flex-wrap gap-1.5">
              {samples.map((s) => (
                <Chip key={s.eid + s.label} label={s.label} tone="sky" size="xs" onClick={() => drillFromDrawer('evidence', s.eid)} />
              ))}
            </div>
          );
        })()}
      </SectionCard>

      {rca ? (
        <div className={`rounded-lg border p-4 ${rcaCardBorder}`}>
          <div className="mb-2 text-xs font-bold text-slate-900">{rcaStatusHeadline(rca.status)}</div>
          <div className="grid gap-1 text-[11px] text-slate-700">
            <div>
              <span className="font-semibold text-slate-500">Owner: </span>
              {rcaOwner?.name ?? rca.owner_senior_manager_id ?? '—'}
            </div>
            <div>
              <span className="font-semibold text-slate-500">5-Whys: </span>
              {whys}
            </div>
            <div>
              <span className="font-semibold text-slate-500">Preventive actions: </span>
              {paCount}
            </div>
          </div>
          <button
            type="button"
            className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            onClick={() => drillFromDrawer('rca', rca.rca_id)}
          >
            View RCA record in drawer →
          </button>
          <button
            type="button"
            className="mt-2 w-full rounded-md border border-indigo-300 bg-white px-3 py-2 text-xs font-semibold text-indigo-800 hover:bg-indigo-50"
            onClick={() => {
              onOpenRcaWorkspace(rca.rca_id);
              closeDrawer();
            }}
          >
            Open in RCA Workspace →
          </button>
        </div>
      ) : (
        <SectionCard title="RCA">
          <EmptyState message="No RCA linked to this incident." />
        </SectionCard>
      )}

      <SectionCard title="Regulatory reporting">
        <KVRow k="RBI-reportable" v={inc.rbi_reportable === true ? '✓' : inc.rbi_reportable === false ? '✗' : '—'} />
        <KVRow
          k="FMR filed"
          v={
            inc.fmr_filed === true
              ? `✓${inc.fmr_filed_date ? ` (${fmtDate(inc.fmr_filed_date)})` : ''}`
              : inc.fmr_filed === false
                ? '✗'
                : '—'
          }
        />
        {inc.incident_type === 'cyber' ? (
          <>
            <KVRow k="CERT-In filed" v={inc.cert_in_filed_at ? fmtTs(inc.cert_in_filed_at) : '—'} mono />
            <KVRow k="CSITE filed" v={inc.csite_filed_at ? fmtTs(inc.csite_filed_at) : '—'} mono />
          </>
        ) : null}
      </SectionCard>

      <SectionCard title="Audit trail">
        {incidentAudit.length ? (
          incidentAudit.map((e) => (
            <div key={e.audit_trail_event_id} className="border-b border-slate-100 py-1.5 text-[10px] last:border-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">{e.event_type}</span>
                <span className="text-slate-500">{fmtTs(e.system_time)}</span>
              </div>
              <div className="text-slate-600">{e.payload_summary}</div>
            </div>
          ))
        ) : (
          <EmptyState message="No audit events for this incident." />
        )}
      </SectionCard>
    </div>
  );
}

// =====================================================================
// SOURCE RECORD
// =====================================================================
export function SourceRecordDetailPanel({ srId, drillFromDrawer }: { srId: string; drillFromDrawer: DrillFromDrawer }) {
  const sr = getSourceRecord(srId);
  if (!sr) return <EmptyState message="Source record not found." />;
  const sys = getSourceSystem(sr.source_system_id);
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-900">{sr.source_record_id}</h2>
        <div className="text-xs text-slate-500">{sys?.system_type} · {sys?.vendor}</div>
      </div>
      <SectionCard title="Identification">
        <KVRow k="Source table / API" v={sr.source_table_or_api} mono />
        <KVRow k="Primary key" v={sr.source_primary_key} mono />
        <KVRow k="Payload hash" v={sr.payload_hash || '—'} mono />
        <KVRow k="Event ts" v={fmtTs(sr.event_timestamp)} mono />
        <KVRow k="Ingested ts" v={fmtTs(sr.ingestion_timestamp)} mono />
        <KVRow k="Validation" v={sr.validation_status} />
        <KVRow k="Correlation" v={sr.correlation_status} />
      </SectionCard>
      <SectionCard title="Key fields preview">
        <pre className="overflow-x-auto rounded bg-slate-50 p-2 font-mono text-[10px] text-slate-700">
          {JSON.stringify(sr.key_fields_preview, null, 2)}
        </pre>
      </SectionCard>
      {sys && (
        <button
          type="button"
          onClick={() => drillFromDrawer('sourceSystem', sys.source_system_id)}
          className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          Source system details · {sys.source_system_id} →
        </button>
      )}
    </div>
  );
}
