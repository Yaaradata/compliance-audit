import type { AuditControl } from '@/lib/Indian_Process_Audit/types';
import { getFastTagCaseDisplaySubject, getFastTagCaseRegion, getFastTagOverviewStrip } from './auditData';
import {
  buildCohKpis,
  buildCohPlazas,
  filterCases,
  type FastTagCaseLike,
} from './fastTagExecutiveMetrics';
import type { CohKpiDrillId, FastTagWorkspaceNavigate } from './fastTagExecutiveTypes';
import type { HobKpiDrillContent, HobKpiDrillRow } from './fastTagHobKpiDrill';
import { TOLL_SETTLEMENT_SUMMARY } from './tollSettlementData';

const KPI_LABEL: Record<CohKpiDrillId, string> = {
  'experience-index': 'Customer Experience Score',
  'open-findings': 'Customer Issues',
  resolution: 'Avg Fix Time',
  'clean-completion': 'Zero-Issue Rate',
};

function caseRows(cases: FastTagCaseLike[], limit = 8): HobKpiDrillRow[] {
  return cases.slice(0, limit).map((k) => ({
    id: k.id,
    primary: getFastTagCaseDisplaySubject(k.subject),
    secondary: [getFastTagCaseRegion(k), k.failControlId, k.failStageId].filter(Boolean).join(' · ') || '—',
    status:
      k.overallStatus === 'compliant'
        ? 'clean'
        : k.overallStatus === 'failure'
          ? 'failure'
          : 'flagged',
  }));
}

export function buildCohKpiDrill(
  kpiId: CohKpiDrillId,
  cases: FastTagCaseLike[],
  controls: AuditControl[],
  region: string | null,
): HobKpiDrillContent | null {
  const label = KPI_LABEL[kpiId];
  const kpi = buildCohKpis(cases, controls, region).find((k) => k.label === label);
  if (!kpi) return null;

  const scoped = filterCases(cases, region);
  const cxCases = scoped.filter(
    (k) =>
      k.overallStatus !== 'compliant' &&
      (['identity', 'kyc', 'wallet', 'activate'].includes(k.failStageId ?? '') ||
        ['FT-03', 'FT-04', 'FT-06', 'FT-07', 'FT-11', 'FT-12'].includes(k.failControlId ?? '')),
  );
  const strip = getFastTagOverviewStrip();
  const fcrPct =
    scoped.length > 0
      ? Math.round((scoped.filter((k) => k.overallStatus === 'compliant').length / scoped.length) * 100)
      : 0;

  const base = {
    title: kpi.label,
    headline: kpi.value,
    aiInsight: `Audit-derived · ${kpi.trend}. Target alignment shown for CX recovery planning.`,
    actionHint: kpi.sub?.replace(/^·\s*/, '') ?? 'Filter cases in workspace',
    rows: [] as HobKpiDrillRow[],
    workspaceLink: undefined as FastTagWorkspaceNavigate | undefined,
    workspaceLinkLabel: 'Open in workspace',
  };

  switch (kpiId) {
    case 'experience-index':
      return {
        ...base,
        metrics: [
          { label: 'Index', value: kpi.value },
          { label: 'Target', value: '≥90%' },
          { label: 'Badge', value: kpi.badge },
          { label: 'Domain compliance', value: `${strip.compliance}%` },
        ],
        rows: caseRows(cxCases),
        workspaceLink: { view: 'cases', caseRegion: region },
        workspaceLinkLabel: 'View CX cases',
      };
    case 'open-findings':
      return {
        ...base,
        metrics: [
          { label: 'Open findings', value: kpi.value },
          { label: 'Pending review', value: kpi.trend.replace(/\s*·.*/, '') },
          { label: 'Critical', value: String(scoped.filter((k) => k.overallStatus === 'failure').length) },
          { label: 'Plaza breaks', value: String(buildCohPlazas(region).length) },
        ],
        rows: caseRows(cxCases),
        workspaceLink: { view: 'cases', caseRegion: region, caseStage: 'wallet' },
        workspaceLinkLabel: 'Wallet-stage cases',
      };
    case 'resolution':
      return {
        ...base,
        metrics: [
          { label: 'Avg proxy', value: kpi.value },
          { label: 'Baseline', value: '26m' },
          { label: 'Status', value: kpi.badge },
          { label: 'Open queue', value: cxCases.length.toLocaleString('en-IN') },
        ],
        rows: caseRows(cxCases.filter((k) => k.overallStatus === 'pending')),
        workspaceLink: { view: 'register', registerFilter: 'needs-attention' },
        workspaceLinkLabel: 'Needs-attention register',
      };
    case 'clean-completion':
      return {
        ...base,
        metrics: [
          { label: 'FCR', value: kpi.value },
          { label: 'Target', value: '65%' },
          { label: 'Compliant', value: String(scoped.filter((k) => k.overallStatus === 'compliant').length) },
          { label: 'Sample', value: scoped.length.toLocaleString('en-IN') },
        ],
        rows: caseRows(scoped.filter((k) => k.overallStatus === 'compliant')),
        workspaceLink: { view: 'cases', caseRegion: region },
        workspaceLinkLabel: `View sample · ${fcrPct}% clean`,
      };
    default:
      return null;
  }
}
