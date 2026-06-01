import { FASTAG_AUDITOR_FINDINGS, FASTAG_EXCEPTIONS_BY_CONTROL } from './fastTagAuditContent';
import type { AuditControl } from '@/lib/Indian_Process_Audit/types';
import type { FastTagSop } from './fastTagCaseBuilder';
import { FASTAG_STAGE_SHORT } from './auditData';

export type FastTagIssueExplanation = {
  title: string;
  description: string;
  rootCause: string;
  impact: string;
  resolution: string;
  controlId: string | null;
  stageLabel: string | null;
};

type FastTagCaseLike = {
  id: string;
  subject: string;
  segment?: string;
  scenario: string;
  failStageId?: string;
  failControlId?: string;
  journeyException?: string;
  trail: {
    stage: { id: string; name: string; controlIds?: string[] };
    status: string;
  }[];
};

function controlImpactLine(control: AuditControl | undefined): string {
  if (!control) {
    return 'Operational and compliance exposure until the control is remediated and evidence is re-tested.';
  }
  const parts = [
    `${control.violations} critical violation(s) in Q1 sample.`,
    `${control.exceptions} case exception(s) on control ${control.id}.`,
    `Population ${control.population.toLocaleString('en-IN')}; compliance ${control.compliance}%.`,
  ];
  if (control.regulatory) parts.push(`Regulatory hook: ${control.regulatory}.`);
  return parts.join(' ');
}

export function buildFastTagIssueExplanation(
  kase: FastTagCaseLike | null,
  sop: FastTagSop,
  controls: AuditControl[],
  focusStageId: string | null,
): FastTagIssueExplanation | null {
  if (!kase || kase.scenario === 'clean') return null;

  const stageId = focusStageId || kase.failStageId || null;
  const stage = sop.stages.find((s) => s.id === stageId);
  const trailItem = stageId ? kase.trail.find((t) => t.stage.id === stageId) : undefined;
  const controlId =
    kase.failControlId ||
    (trailItem?.stage.controlIds?.[0] ?? null) ||
    (stage?.controlIds?.[0] ?? null);
  const control = controlId ? controls.find((c) => c.id === controlId) : undefined;
  const stageLabel = stage
    ? FASTAG_STAGE_SHORT[stage.id] || stage.name
    : stageId
      ? FASTAG_STAGE_SHORT[stageId] || stageId
      : null;

  const exceptionRow = controlId ? FASTAG_EXCEPTIONS_BY_CONTROL[controlId]?.[0] : undefined;

  const description =
    kase.journeyException ||
    exceptionRow?.detail ||
    `${kase.subject} — audit exception at ${stageLabel ?? 'lifecycle'} stage (${kase.segment || 'issuance case'}).`;

  const rootCause =
    (controlId && FASTAG_AUDITOR_FINDINGS[controlId]) ||
    stage?.description ||
    exceptionRow?.detail ||
    'Root cause is under validation with process owner and NETC / NPCI evidence.';

  const impact = controlImpactLine(control);

  const resolution =
    exceptionRow?.action ||
    control?.objective ||
    'Escalate to control owner; attach NETC / wallet evidence; re-test before closing the case.';

  return {
    title: kase.subject,
    description,
    rootCause,
    impact,
    resolution,
    controlId,
    stageLabel,
  };
}
