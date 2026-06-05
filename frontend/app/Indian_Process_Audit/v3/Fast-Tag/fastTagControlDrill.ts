import type { AuditControl } from '@/lib/Indian_Process_Audit/types';
import { getFastTagCaseDisplaySubject, getFastTagCaseRegion } from './auditData';
import {
  FASTAG_AUDITOR_FINDINGS,
  FASTAG_EXCEPTIONS_BY_CONTROL,
} from './fastTagAuditContent';
import { filterCases, type FastTagCaseLike } from './fastTagExecutiveMetrics';
import type { FastTagWorkspaceNavigate } from './fastTagExecutiveTypes';

export type ControlDrillRow = {
  id: string;
  primary: string;
  secondary: string;
  status: 'clean' | 'flagged' | 'failure';
};

export type ControlDrillContent = {
  controlId: string;
  title: string;
  statusLabel: string;
  statusTone: 'good' | 'warn' | 'bad';
  headline: string;
  metrics: { label: string; value: string }[];
  finding: string;
  exceptions: { detail: string; severity: string; sla: string; action: string }[];
  linkedCases: ControlDrillRow[];
  cxNote: string;
  actionHint: string;
  workspaceLink: FastTagWorkspaceNavigate;
  workspaceLinkLabel: string;
};

const STAGE_BY_CONTROL: Record<string, string> = {
  'FT-03': 'identity',
  'FT-04': 'kyc',
  'FT-06': 'wallet',
  'FT-07': 'wallet',
  'FT-11': 'activate',
  'FT-12': 'activate',
};

function statusTone(status: AuditControl['status']): 'good' | 'warn' | 'bad' {
  if (status === 'deficient') return 'bad';
  if (status === 'needs-attention') return 'warn';
  return 'good';
}

function caseRows(cases: FastTagCaseLike[], limit = 6): ControlDrillRow[] {
  return cases.slice(0, limit).map((k) => ({
    id: k.id,
    primary: getFastTagCaseDisplaySubject(k.subject),
    secondary: [getFastTagCaseRegion(k), k.failStageId].filter(Boolean).join(' · ') || '—',
    status:
      k.overallStatus === 'compliant'
        ? 'clean'
        : k.overallStatus === 'failure'
          ? 'failure'
          : 'flagged',
  }));
}

export function buildControlDrillContent(
  control: AuditControl,
  cases: FastTagCaseLike[],
  region: string | null,
): ControlDrillContent {
  const scoped = filterCases(cases, region);
  const linked = scoped.filter((k) => k.failControlId === control.id);
  const critical = linked.filter((k) => k.overallStatus === 'failure').length;
  const pending = linked.filter((k) => k.overallStatus === 'pending').length;
  const excRate =
    control.sample > 0 ? Math.round((control.exceptions / control.sample) * 1000) / 10 : 0;
  const stage = STAGE_BY_CONTROL[control.id];
  const templates = FASTAG_EXCEPTIONS_BY_CONTROL[control.id] ?? [];

  const workspaceLink: FastTagWorkspaceNavigate = stage
    ? { view: 'cases', caseRegion: region, caseStage: stage, controlId: control.id }
    : { view: 'register', registerFilter: 'deficient', controlId: control.id };

  return {
    controlId: control.id,
    title: control.name,
    statusLabel: control.status.replace(/-/g, ' '),
    statusTone: statusTone(control.status),
    headline: `${control.compliance}% compliant`,
    metrics: [
      { label: 'Compliance', value: `${control.compliance}%` },
      { label: 'Violations', value: String(control.violations) },
      { label: 'Exceptions', value: `${control.exceptions} (${excRate}% of sample)` },
      { label: 'Tested', value: `${control.sample} / ${control.population.toLocaleString('en-IN')}` },
      { label: 'Frequency', value: control.frequency },
      { label: 'Owner', value: control.owner },
    ],
    finding:
      FASTAG_AUDITOR_FINDINGS[control.id] ??
      control.objective,
    exceptions: templates.slice(0, 3).map((e) => ({
      detail: e.detail,
      severity: e.severity,
      sla: e.sla,
      action: e.action,
    })),
    linkedCases: caseRows(linked),
    cxNote: stage
      ? `${linked.length} audit cases in sample tied to this control · ${critical} critical · ${pending} pending · primary SOP stage: ${stage}`
      : `${linked.length} linked cases in current filter.`,
    actionHint:
      control.status === 'deficient'
        ? 'Retest and attach evidence before next CX sign-off.'
        : 'Monitor until compliance returns above 95%.',
    workspaceLink,
    workspaceLinkLabel: stage ? `View ${stage}-stage cases` : 'Open control register',
  };
}
