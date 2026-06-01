import type { AuditControl, EvidenceBundle } from '@/lib/Indian_Process_Audit/types';
import {
  buildFastTagExceptionLog,
  FASTAG_AUDITOR_FINDINGS,
  FASTAG_POPULATION_SCOPE,
  FASTAG_SOURCE_SYSTEMS_BY_CONTROL,
} from './fastTagAuditContent';
import { FASTAG_SOP, FASTAG_CASES } from './auditData';

function findStagesForControl(ctrlId: string) {
  return FASTAG_SOP.stages
    .filter((stage) => stage.controlIds.includes(ctrlId))
    .map((stage) => ({
      domainId: 'fasttag',
      sopName: FASTAG_SOP.name,
      stage,
    }));
}

function findCasesForControl(ctrlId: string) {
  const out: Array<{
    kase: (typeof FASTAG_CASES)[number];
    hit: (typeof FASTAG_CASES)[number]['trail'][number];
  }> = [];
  FASTAG_CASES.forEach((kase) => {
    const hit = kase.trail.find((t) => t.stage.controlIds.includes(ctrlId));
    if (hit) out.push({ kase, hit });
  });
  const order: Record<string, number> = { failure: 0, pending: 1, compliant: 2 };
  out.sort((a, b) => (order[a.kase.overallStatus] ?? 2) - (order[b.kase.overallStatus] ?? 2));
  return out.slice(0, 4);
}

function testingStepsFor(ctrl: AuditControl): string[] {
  const scope = FASTAG_POPULATION_SCOPE[ctrl.id] ?? 'In-scope FASTag population (Q1)';
  const stages = findStagesForControl(ctrl.id).map((s) => s.stage.name).join(', ');
  return [
    `Population: ${ctrl.population.toLocaleString('en-IN')} (${scope}). Sampled ${ctrl.sample} items for detailed testing; full population used for automated reconciliations.`,
    `Traced ${ctrl.id} at SOP stage(s): ${stages || 'see process flow'}. For each sample, obtained submitter evidence (workflow, NETC, wallet, or field ops).`,
    `Reconciled to source systems listed below. Flagged ${ctrl.exceptions} failing case(s) and ${ctrl.violations} critical breach(es) against ${ctrl.regulatory}.`,
    `Discussed root cause with ${ctrl.owner}; management response captured. Re-test planned on Q2 sample if status is deficient or needs attention.`,
  ];
}

function mgmtResponseFor(ctrl: AuditControl): string {
  if (ctrl.id === 'FT-11') {
    return 'Accepted. Daily joint NETC–Payments recon call; plaza break register owned by Reconciliation until MTTR < 2 days.';
  }
  if (ctrl.id === 'FT-01' || ctrl.id === 'FT-04') {
    return 'Accepted. Enhanced queue monitoring; no wallet load until OV1T/CKYCR green; target closure by quarter-end.';
  }
  if (ctrl.status === 'deficient') {
    return 'Accepted. Corrective action plan within 15 days; IA re-test on exit sample.';
  }
  if (ctrl.status === 'needs-attention') {
    return 'Accepted. Added to FASTag QRR pack with fortnightly status to Audit Committee.';
  }
  return 'Noted. Continue existing monitoring cadence.';
}

export function buildFastTagEvidence(ctrl: AuditControl, domainLabel: string): EvidenceBundle {
  const sourceSystems =
    FASTAG_SOURCE_SYSTEMS_BY_CONTROL[ctrl.id] ?? FASTAG_SOURCE_SYSTEMS_BY_CONTROL.default;

  return {
    control: ctrl,
    domainLabel,
    stageSubmitters: findStagesForControl(ctrl.id),
    sampleCaseTrails: findCasesForControl(ctrl.id),
    lastTested: '14 Apr 2026',
    tester: 'R. Banerjee (IA — Sr. Manager)',
    testingSteps: testingStepsFor(ctrl),
    exceptionLog: buildFastTagExceptionLog(ctrl),
    sourceSystems,
    documents: [
      { name: `${ctrl.id}_Control_Design_FASTag.pdf`, type: 'PDF', size: '328 KB' },
      { name: `${ctrl.id}_NETC_Workpaper.xlsx`, type: 'XLSX', size: '1.6 MB' },
      { name: `${ctrl.id}_Exception_Log.csv`, type: 'CSV', size: '92 KB' },
      { name: `${ctrl.id}_Mgmt_Response.pdf`, type: 'PDF', size: '240 KB' },
      ...(ctrl.id === 'FT-11'
        ? [{ name: `${ctrl.id}_Plaza_Settlement_MIS.xlsx`, type: 'XLSX', size: '2.1 MB' }]
        : []),
    ],
    auditorNote: FASTAG_AUDITOR_FINDINGS[ctrl.id] ?? `Control ${ctrl.id} assessed per FASTag audit program.`,
    mgmtResponse: mgmtResponseFor(ctrl),
  };
}
