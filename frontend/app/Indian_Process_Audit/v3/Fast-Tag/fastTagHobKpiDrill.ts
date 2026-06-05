import type { AuditControl } from '@/lib/Indian_Process_Audit/types';
import { getFastTagCaseDisplaySubject, getFastTagCaseRegion } from './auditData';
import type { FastTagSop } from './fastTagCaseBuilder';
import { buildRevenueSegments, filterCases, type FastTagCaseLike } from './fastTagExecutiveMetrics';
import { buildHoBExecutiveKpis } from './fastTagHobExecutive';
import type { HobKpiDrillId } from './fastTagExecutiveTypes';
import { TOLL_SETTLEMENT_SUMMARY } from './tollSettlementData';
import type { FastTagWorkspaceNavigate } from './fastTagExecutiveTypes';

export type HobKpiDrillRow = {
  id: string;
  primary: string;
  secondary: string;
  status: 'clean' | 'flagged' | 'failure';
};

export type HobKpiDrillContent = {
  title: string;
  headline: string;
  metrics: { label: string; value: string }[];
  funnel?: { step: string; count: number; pct: number }[];
  aiInsight: string;
  actionHint: string;
  rows: HobKpiDrillRow[];
  workspaceLink?: FastTagWorkspaceNavigate;
  workspaceLinkLabel?: string;
};

function fmtInrCompact(n: number): string {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)}Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function isRetailSegment(segment?: string): boolean {
  const s = (segment ?? '').toLowerCase();
  if (s.includes('fleet') || s.includes('courier') || s.includes('field') || s.includes('branch') || s.includes('neft')) {
    return false;
  }
  return true;
}

function caseRows(cases: FastTagCaseLike[], limit = 8): HobKpiDrillRow[] {
  return cases.slice(0, limit).map((k) => ({
    id: k.id,
    primary: getFastTagCaseDisplaySubject(k.subject),
    secondary: [getFastTagCaseRegion(k), k.segment?.split('·')[0]?.trim()].filter(Boolean).join(' · ') || '—',
    status:
      k.overallStatus === 'compliant'
        ? 'clean'
        : k.overallStatus === 'failure'
          ? 'failure'
          : 'flagged',
  }));
}

export function buildHoBKpiDrill(
  kpiId: HobKpiDrillId,
  cases: FastTagCaseLike[],
  controls: AuditControl[],
  sop: FastTagSop,
  region: string | null,
): HobKpiDrillContent | null {
  const kpi = buildHoBExecutiveKpis(cases, controls, sop, region).find((k) => k.id === kpiId);
  if (!kpi) return null;

  const scoped = filterCases(cases, region);
  const retail = scoped.filter((k) => isRetailSegment(k.segment));
  const notActivated = retail.filter((k) => k.overallStatus !== 'compliant');
  const segments = buildRevenueSegments(scoped, region);

  const base = {
    title: kpi.title,
    headline: kpi.primaryValue,
    aiInsight: kpi.aiInsight,
    actionHint: kpi.actionHint,
    rows: [] as HobKpiDrillRow[],
    workspaceLink: kpi.onNavigate,
    workspaceLinkLabel: kpi.ctaLabel ?? 'Open in workspace',
  };

  switch (kpiId) {
    case 'toll-volume':
      return {
        ...base,
        metrics: [
          { label: 'Q1 toll debits', value: fmtInrCompact(TOLL_SETTLEMENT_SUMMARY.totalDebits) },
          { label: 'Settlement match', value: `${TOLL_SETTLEMENT_SUMMARY.matchedPct}%` },
          { label: 'Open plaza breaks', value: String(TOLL_SETTLEMENT_SUMMARY.openPlazaBreaks) },
          { label: 'Unexplained variance', value: fmtInrCompact(TOLL_SETTLEMENT_SUMMARY.openBreakAmountInr) },
          { label: 'MoM trend', value: `+${kpi.trendPct}%` },
          { label: 'Recon sign-off', value: TOLL_SETTLEMENT_SUMMARY.lastReconSignoff },
        ],
        rows: [],
        workspaceLinkLabel: 'Open toll settlement',
      };

    case 'new-customers': {
      const digital = kpi.breakdown?.find((b) => b.label === 'Digital')?.value ?? '—';
      const branch = kpi.breakdown?.find((b) => b.label === 'Branch')?.value ?? '—';
      return {
        ...base,
        metrics: [
          { label: 'New retail (Q1)', value: kpi.primaryValue },
          { label: 'MoM growth', value: `${kpi.trendPct >= 0 ? '+' : ''}${kpi.trendPct}%` },
          { label: 'Digital channel', value: digital },
          { label: 'Branch channel', value: branch },
          { label: 'Sample retail cases', value: retail.length.toLocaleString('en-IN') },
        ],
        rows: caseRows(retail),
        workspaceLinkLabel: 'View retail journeys',
      };
    }

    case 'activation-rate': {
      const kyc = notActivated.filter((k) => k.failStageId === 'kyc' || k.failControlId === 'FT-04').length;
      const wallet = notActivated.filter(
        (k) => k.failStageId === 'wallet' || k.failControlId === 'FT-06' || k.failControlId === 'FT-07',
      ).length;
      return {
        ...base,
        metrics: [
          { label: 'Activation rate', value: kpi.primaryValue },
          { label: 'Business target', value: '90%' },
          { label: 'Drop-off · KYC', value: String(kyc) },
          { label: 'Drop-off · Wallet', value: String(wallet) },
          { label: 'Top friction', value: kpi.frictionSource ?? '—' },
          { label: 'Funnel', value: kpi.funnelHint ?? '—' },
        ],
        rows: caseRows(notActivated),
        workspaceLinkLabel: 'Open wallet-stage pipeline',
      };
    }

    case 'retail-mix':
      return {
        ...base,
        metrics: [
          { label: 'Retail share', value: kpi.primaryValue },
          { label: 'Balance target', value: '~50% retail / B2B' },
          { label: 'Fleet', value: `${segments.find((s) => s.key === 'fleet')?.sharePct ?? 0}%` },
          { label: 'Retail', value: `${segments.find((s) => s.key === 'retail')?.sharePct ?? 0}%` },
          { label: 'Logistics', value: `${segments.find((s) => s.key === 'logistics')?.sharePct ?? 0}%` },
          { label: 'Govt / NHAI', value: `${segments.find((s) => s.key === 'govt')?.sharePct ?? 0}%` },
        ],
        rows: caseRows(scoped),
        workspaceLinkLabel: 'View issuance portfolio',
      };

    default:
      return null;
  }
}
