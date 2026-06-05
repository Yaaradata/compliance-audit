import { filterCases, type FastTagCaseLike } from './fastTagExecutiveMetrics';
import { TOLL_SETTLEMENT_SUMMARY } from './tollSettlementData';
import type { FastTagWorkspaceNavigate, IssuanceSegmentKey } from './fastTagExecutiveTypes';

export const ISSUANCE_SEGMENT_LABELS: Record<IssuanceSegmentKey, string> = {
  fleet: 'Corporate Fleet',
  retail: 'Retail Consumers',
  logistics: 'Logistics Partners',
  govt: 'Govt / NHAI',
};

export const ISSUANCE_SEGMENT_COLORS: Record<IssuanceSegmentKey, string> = {
  fleet: '#059669',
  retail: '#d97706',
  logistics: '#2563eb',
  govt: '#94a3b8',
};

function segmentBucket(segment?: string): IssuanceSegmentKey {
  const s = (segment ?? '').toLowerCase();
  if (s.includes('fleet')) return 'fleet';
  if (s.includes('courier') || s.includes('field')) return 'logistics';
  if (s.includes('branch') || s.includes('neft')) return 'govt';
  return 'retail';
}

function fmtInrCompact(n: number): string {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)}Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function stableBucket(id: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}

export type SegmentDrillContent = {
  key: IssuanceSegmentKey;
  label: string;
  sharePct: number;
  caseCount: number;
  moneyGenerated: string;
  moneyGeneratedSub: string;
  tollUsage: string;
  tollUsageSub: string;
  liveSales: string;
  liveSalesSub: string;
  insight: string;
  workspaceLink: FastTagWorkspaceNavigate;
};

export function buildSegmentDrill(
  segmentKey: IssuanceSegmentKey,
  cases: FastTagCaseLike[],
  region: string | null,
): SegmentDrillContent {
  const scoped = filterCases(cases, region);
  const segmentCases = scoped.filter((k) => segmentBucket(k.segment) === segmentKey);
  const total = scoped.length || 1;
  const sharePct = Math.round((segmentCases.length / total) * 100);

  const moneyInr = Math.round((TOLL_SETTLEMENT_SUMMARY.totalDebits * segmentCases.length) / total);
  const tollTxns = Math.round(
    (TOLL_SETTLEMENT_SUMMARY.totalDebits / 420) * (segmentCases.length / Math.max(total, 1)) *
      (1.1 + stableBucket(segmentKey, 8) * 0.05),
  );

  const activated = segmentCases.filter((k) => {
    const t = k.trail.find((tr) => tr.stage.id === 'activate');
    return t && t.status !== 'blocked';
  }).length;
  const liveSales = Math.round(activated * (0.88 + stableBucket(segmentKey + 'live', 5) * 0.04));
  const momLive =
    segmentKey === 'retail' ? '+6%' : segmentKey === 'fleet' ? '+4%' : segmentKey === 'govt' ? '+2%' : '+3%';

  const insights: Record<IssuanceSegmentKey, string> = {
    fleet:
      'Fleet corridor debits dominate long-haul plazas; watch FT-11 plaza breaks on high-variance VRNs.',
    retail:
      'Retail channel drives wallet loads and UPI recharge; friction in KYC / wallet stages affects conversion.',
    logistics:
      'Field and courier channels batch-fitment; toll usage tracks depot exit plazas on national highways.',
    govt:
      'Branch / NEFT-led issuance for institutional tags; lower live sales velocity but higher average debit value.',
  };

  return {
    key: segmentKey,
    label: ISSUANCE_SEGMENT_LABELS[segmentKey],
    sharePct,
    caseCount: segmentCases.length,
    moneyGenerated: fmtInrCompact(moneyInr),
    moneyGeneratedSub: `${sharePct}% of Q1 settlement pool · ${TOLL_SETTLEMENT_SUMMARY.periodLabel}`,
    tollUsage: fmtInrCompact(tollTxns),
    tollUsageSub: `~${Math.round(tollTxns / Math.max(liveSales, 1)).toLocaleString('en-IN')} avg debit / active tag`,
    liveSales: liveSales.toLocaleString('en-IN'),
    liveSalesSub: `${activated} activations in sample · ${momLive} vs prior month`,
    insight: insights[segmentKey],
    workspaceLink: { view: 'cases', caseRegion: region },
  };
}

export { segmentBucket };
