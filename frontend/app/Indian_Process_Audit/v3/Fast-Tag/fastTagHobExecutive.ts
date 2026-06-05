import type { AuditControl } from '@/lib/Indian_Process_Audit/types';
import { FASTAG_REGION_LABEL } from './auditData';
import type { FastTagSop } from './fastTagCaseBuilder';
import type { FastTagCaseLike } from './fastTagExecutiveMetrics';
import { buildRevenueSegments, filterCases } from './fastTagExecutiveMetrics';
import { TOLL_SETTLEMENT_SUMMARY } from './tollSettlementData';
import type { FastTagWorkspaceNavigate } from './fastTagExecutiveTypes';

export type HobKpiStatus = 'healthy' | 'warning' | 'critical';

export type HobExecutiveKpi = {
  id: string;
  title: string;
  primaryValue: string;
  primarySub?: string;
  trendPct: number;
  trendLabel: string;
  context: string;
  actionHint: string;
  aiInsight: string;
  spark: number[];
  status: HobKpiStatus;
  critical?: boolean;
  breakdown?: { label: string; value: string }[];
  funnelHint?: string;
  frictionSource?: string;
  rootCause?: string;
  ctaLabel?: string;
  onNavigate?: FastTagWorkspaceNavigate;
};

function fmtInrCompact(n: number): string {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1)}Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function sparkFrom(values: number[]): number[] {
  if (values.length >= 8) return values.slice(-8);
  const out = [...values];
  while (out.length < 8) out.unshift(out[0] ?? 0);
  return out;
}

function isRetailSegment(segment?: string): boolean {
  const s = (segment ?? '').toLowerCase();
  if (s.includes('fleet') || s.includes('courier') || s.includes('field') || s.includes('branch') || s.includes('neft')) {
    return false;
  }
  return true;
}

function fmtCustomerCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString('en-IN');
}

function topRetailFriction(cases: FastTagCaseLike[]): string {
  const retail = cases.filter((k) => isRetailSegment(k.segment) && k.overallStatus !== 'compliant');
  const counts = { kyc: 0, wallet: 0, digital: 0 };
  for (const k of retail) {
    if (k.failStageId === 'kyc' || k.failControlId === 'FT-04') counts.kyc++;
    else if (k.failStageId === 'wallet' || k.failControlId === 'FT-06') counts.wallet++;
    else counts.digital++;
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (!top || top[1] === 0) return 'No major drop-off';
  const labels = { kyc: 'Branch KYC', wallet: 'Wallet load', digital: 'Digital onboarding' };
  return labels[top[0] as keyof typeof labels];
}

export function buildHoBExecutiveKpis(
  cases: FastTagCaseLike[],
  _controls: AuditControl[],
  _sop: FastTagSop,
  region: string | null,
): HobExecutiveKpi[] {
  const scoped = filterCases(cases, region);
  const total = scoped.length || 1;
  const retail = scoped.filter((k) => isRetailSegment(k.segment));
  const retailTotal = retail.length || 1;
  const retailActivated = retail.filter((k) => k.overallStatus === 'compliant').length;
  const scale = Math.max(1, Math.round(1400 / Math.max(scoped.length, 1)));
  const newCustCount = Math.max(1, Math.round(retail.length * scale * 0.92));
  const prevNewCust = Math.round(newCustCount * 0.94);
  const newCustMom = prevNewCust > 0 ? Math.round(((newCustCount - prevNewCust) / prevNewCust) * 1000) / 10 : 0;

  const activationPct = Math.round((retailActivated / retailTotal) * 100);
  const activationTarget = 90;
  const segments = buildRevenueSegments(scoped, region);
  const retailSeg = segments.find((s) => s.key === 'retail');
  const retailMixPct = retailSeg?.sharePct ?? Math.round((retail.length / total) * 100);
  const topSeg = [...segments].sort((a, b) => b.sharePct - a.sharePct)[0];

  const revenue = TOLL_SETTLEMENT_SUMMARY.totalDebits;
  const tollMomPct = 8;
  const digitalSharePct = 62 + (retail.length % 12);

  const intake = retail.filter((k) => k.trail.some((t) => t.stage.id === 'intake' && t.status !== 'blocked')).length;
  const activatedTrail = retail.filter((k) => k.trail.some((t) => t.stage.id === 'activate' && t.status === 'accepted')).length;
  const funnelPct = Math.round((activatedTrail / retailTotal) * 100);

  return [
    {
      id: 'toll-volume',
      title: 'Toll debit volume',
      primaryValue: fmtInrCompact(revenue),
      primarySub: `+${tollMomPct}% MoM`,
      trendPct: tollMomPct,
      trendLabel: 'vs last month',
      context: 'Q1 toll throughput · settlement scope',
      actionHint: 'Review plaza contributors and corridor mix',
      aiInsight: 'Western corridor and fleet recharge cycles lifting debit volume in Q1.',
      spark: sparkFrom([3.2, 3.4, 3.6, 3.8, 4.0, 4.05, 4.1, 4.2]),
      status: 'healthy',
      onNavigate: { view: 'toll' },
    },
    {
      id: 'new-customers',
      title: 'New customers',
      primaryValue: fmtCustomerCount(newCustCount),
      primarySub: 'Retail issuances · Q1',
      trendPct: newCustMom,
      trendLabel: 'vs prior month',
      context: 'Consumer segment acquisitions',
      actionHint: 'Align digital campaigns with activation capacity',
      aiInsight:
        newCustMom >= 5
          ? `Retail acquisition up ${newCustMom}% — ${digitalSharePct}% via digital; watch wallet-stage capacity.`
          : 'Acquisition pace steady; prioritise activation over top-of-funnel spend.',
      spark: sparkFrom([
        newCustCount * 0.78,
        newCustCount * 0.82,
        newCustCount * 0.86,
        newCustCount * 0.9,
        newCustCount * 0.94,
        newCustCount * 0.97,
        prevNewCust,
        newCustCount,
      ]),
      status: newCustMom >= 3 ? 'healthy' : newCustMom >= 0 ? 'warning' : 'critical',
      breakdown: [
        { label: 'Digital', value: `${digitalSharePct}%` },
        { label: 'Branch', value: `${100 - digitalSharePct}%` },
      ],
      onNavigate: { view: 'cases', caseRegion: region },
    },
    {
      id: 'activation-rate',
      title: 'Activation rate',
      primaryValue: `${activationPct}%`,
      primarySub: activationPct >= activationTarget ? 'Above 90% target' : 'Below 90% target',
      trendPct: activationPct - activationTarget,
      trendLabel: 'vs 90% target',
      context: 'Retail go-live ÷ new issuances',
      actionHint: 'Clear wallet and KYC bottlenecks on high-volume days',
      aiInsight:
        activationPct >= activationTarget
          ? 'Activation holding above plan; maintain mapper checks on weekend peaks.'
          : `Drop-offs concentrated in ${topRetailFriction(scoped)} — redeploy ops before campaign spikes.`,
      spark: sparkFrom([
        activationPct - 8,
        activationPct - 6,
        activationPct - 5,
        activationPct - 4,
        activationPct - 3,
        activationPct - 2,
        activationPct - 1,
        activationPct,
      ]),
      status:
        activationPct >= activationTarget ? 'healthy' : activationPct >= 85 ? 'warning' : 'critical',
      frictionSource: topRetailFriction(scoped),
      funnelHint: `Applied ${intake.toLocaleString('en-IN')} → Live ${activatedTrail.toLocaleString('en-IN')} (${funnelPct}%)`,
      onNavigate: { view: 'cases', caseStage: 'wallet', caseRegion: region },
    },
    {
      id: 'retail-mix',
      title: 'Retail mix',
      primaryValue: `${retailMixPct}%`,
      primarySub: topSeg ? `Leader: ${topSeg.name}` : 'Issuance portfolio',
      trendPct: retailMixPct - 50,
      trendLabel: 'vs 50% balance target',
      context: 'Retail share of issuance volume',
      actionHint: 'Balance B2B fleet growth with consumer acquisition',
      aiInsight:
        retailMixPct >= 45
          ? `Retail at ${retailMixPct}% of mix — consumer lane is primary growth engine in ${region ? FASTAG_REGION_LABEL[region] : 'India'}.`
          : `Retail at ${retailMixPct}% — fleet/B2B dominates; review channel incentives.`,
      spark: sparkFrom([
        retailMixPct - 6,
        retailMixPct - 5,
        retailMixPct - 4,
        retailMixPct - 3,
        retailMixPct - 2,
        retailMixPct - 1,
        retailMixPct,
        retailMixPct,
      ]),
      status: retailMixPct >= 40 && retailMixPct <= 60 ? 'healthy' : 'warning',
      breakdown: segments.slice(0, 3).map((s) => ({ label: s.name, value: `${s.sharePct}%` })),
      ctaLabel: 'View channel mix',
      onNavigate: { view: 'cases', caseRegion: region },
    },
  ];
}

export function getRegionLabel(region: string | null): string {
  return region ? (FASTAG_REGION_LABEL[region] ?? region) : 'India';
}
