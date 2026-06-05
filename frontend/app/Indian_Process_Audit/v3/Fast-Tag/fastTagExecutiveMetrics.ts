import type { AuditControl } from '@/lib/Indian_Process_Audit/types';
import {
  FASTAG_REGION_LABEL,
  FASTAG_SOP,
  getFastTagCaseRegion,
  getFastTagOverviewStrip,
} from './auditData';
import type { FastTagSop } from './fastTagCaseBuilder';
import type { ExecKpi, ExecKpiTone } from './fastTagExecutiveData';
import type { FastTagWorkspaceNavigate } from './fastTagExecutiveTypes';
import { getComplaintHeatmap } from './fastTagExecutiveData';
import {
  MISMATCH_TYPE_LABEL,
  PLAZA_BREAKS,
  TOLL_SETTLEMENT_SUMMARY,
} from './tollSettlementData';

export type FastTagCaseLike = {
  id: string;
  subject?: string;
  segment?: string;
  scenario: string;
  failStageId?: string;
  failControlId?: string;
  overallStatus?: string;
  trail: { stage: { id: string; name: string }; status: string }[];
};

const CX_STAGES = new Set(['identity', 'kyc', 'wallet', 'activate']);
const CX_CONTROLS = new Set(['FT-03', 'FT-04', 'FT-05', 'FT-06', 'FT-07', 'FT-11', 'FT-12']);

export function filterCases(cases: FastTagCaseLike[], regionCode: string | null): FastTagCaseLike[] {
  if (!regionCode) return cases;
  return cases.filter((k) => getFastTagCaseRegion(k) === regionCode);
}

function sparkFromTrend(values: number[]): number[] {
  if (values.length >= 8) return values.slice(-8);
  const out = [...values];
  while (out.length < 8) out.unshift(out[0] ?? 0);
  return out;
}

function fmtInrCompact(n: number): string {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1)}Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function segmentBucket(segment?: string): 'fleet' | 'retail' | 'logistics' | 'govt' {
  const s = (segment ?? '').toLowerCase();
  if (s.includes('fleet')) return 'fleet';
  if (s.includes('courier') || s.includes('field')) return 'logistics';
  if (s.includes('branch') || s.includes('neft')) return 'govt';
  return 'retail';
}

const SEGMENT_LABELS = {
  fleet: 'Corporate Fleet',
  retail: 'Retail Consumers',
  logistics: 'Logistics Partners',
  govt: 'Govt / NHAI',
} as const;

const SEGMENT_COLORS = {
  fleet: '#059669',
  retail: '#d97706',
  logistics: '#2563eb',
  govt: '#94a3b8',
} as const;

export function buildCohKpis(cases: FastTagCaseLike[], controls: AuditControl[], region: string | null): ExecKpi[] {
  const scoped = filterCases(cases, region);
  const cxCases = scoped.filter(
    (k) =>
      k.overallStatus !== 'compliant' &&
      (CX_STAGES.has(k.failStageId ?? '') || CX_CONTROLS.has(k.failControlId ?? '')),
  );
  const openComplaints = cxCases.length;
  const strip = getFastTagOverviewStrip();
  const experienceIndex = strip.compliance;
  const prevIndex = Math.min(100, experienceIndex + 4);
  const deficient = controls.filter((c) => c.status === 'deficient').length;
  const pending = scoped.filter((k) => k.overallStatus === 'pending').length;
  const fcrBase = scoped.filter((k) => k.overallStatus === 'compliant').length;
  const fcrPct = scoped.length > 0 ? Math.round((fcrBase / scoped.length) * 100) : 0;
  const resolutionMin = 26 + Math.min(14, Math.round(openComplaints / Math.max(scoped.length, 1) * 40));

  return [
    {
      label: 'Customer Experience Score',
      value: `${experienceIndex}%`,
      badge:
        experienceIndex < prevIndex
          ? `↓ ${Math.round((prevIndex - experienceIndex) * 10) / 10} pts`
          : 'Stable',
      trend: experienceIndex < 80 ? 'Audit-derived · degrading' : 'Audit-derived · stable',
      sub: '· domain compliance',
      tone: experienceIndex < 80 ? 'bad' : experienceIndex < 90 ? 'warn' : 'good',
      spark: sparkFromTrend([prevIndex, prevIndex - 1, experienceIndex + 3, experienceIndex + 2, experienceIndex + 1, experienceIndex, experienceIndex, experienceIndex]),
      sparkColor: experienceIndex < 80 ? '#dc2626' : '#059669',
      accent: experienceIndex < 80 ? 'red' : 'green',
    },
    {
      label: 'Customer Issues',
      value: openComplaints.toLocaleString('en-IN'),
      badge: `+${Math.max(0, openComplaints - Math.round(openComplaints * 0.85))}`,
      trend: `${pending} pending review`,
      sub: region ? `· ${FASTAG_REGION_LABEL[region] ?? region}` : '· India',
      tone: openComplaints > scoped.length * 0.35 ? 'bad' : 'warn',
      spark: sparkFromTrend([openComplaints * 0.5, openComplaints * 0.65, openComplaints * 0.75, openComplaints * 0.85, openComplaints * 0.92, openComplaints, openComplaints, openComplaints]),
      sparkColor: '#d97706',
      accent: 'amber',
    },
    {
      label: 'Avg Fix Time',
      value: `${resolutionMin}m`,
      badge: resolutionMin > 30 ? '+12m slower' : 'On baseline',
      trend: resolutionMin > 30 ? '↑ vs 26m baseline' : 'Within baseline',
      sub: '· finding queue',
      tone: resolutionMin > 30 ? 'bad' : 'good',
      spark: sparkFromTrend([26, 27, 28, 30, 32, 35, resolutionMin - 1, resolutionMin]),
      sparkColor: '#dc2626',
      accent: 'red',
    },
    {
      label: 'Zero-Issue Rate',
      value: `${fcrPct}%`,
      badge: fcrPct >= 55 ? '↑ improving' : 'Below target',
      trend: fcrPct >= 55 ? 'Improving' : 'Below 65% target',
      sub: '· compliant cases',
      tone: fcrPct >= 65 ? 'good' : fcrPct >= 50 ? 'warn' : 'bad',
      spark: sparkFromTrend([fcrPct - 6, fcrPct - 5, fcrPct - 4, fcrPct - 3, fcrPct - 2, fcrPct - 1, fcrPct, fcrPct]),
      sparkColor: '#059669',
      accent: 'green',
    },
  ];
}

export function buildHobKpis(cases: FastTagCaseLike[], controls: AuditControl[], region: string | null): ExecKpi[] {
  const scoped = filterCases(cases, region);
  const strip = getFastTagOverviewStrip();
  const deficient = controls.filter((c) => c.status === 'deficient');
  const txnFailPct =
    scoped.length > 0
      ? Math.round((scoped.filter((k) => k.overallStatus === 'failure').length / scoped.length) * 1000) / 10
      : 0;
  const npciBreach = txnFailPct > 3;
  const activeTags = scoped.length;
  const convPct =
    scoped.length > 0
      ? Math.round((scoped.filter((k) => k.overallStatus === 'compliant').length / scoped.length) * 100)
      : 0;
  const revenueProxy = TOLL_SETTLEMENT_SUMMARY.totalDebits;

  return [
    {
      label: 'Toll debit volume',
      value: fmtInrCompact(revenueProxy),
      badge: 'Q1 sample',
      trend: 'Settlement scope',
      sub: '· FT-11 linked',
      tone: 'good',
      spark: sparkFromTrend([2.8, 3.1, 3.4, 3.6, 3.8, 4.0, 4.1, 4.2]),
      sparkColor: '#059669',
      accent: 'green',
    },
    {
      label: 'Issuance cases',
      value: activeTags.toLocaleString('en-IN'),
      badge: region ? FASTAG_REGION_LABEL[region] ?? region : 'India',
      trend: `${scoped.filter((k) => k.overallStatus === 'compliant').length} clean`,
      sub: '· audit sample',
      tone: 'good',
      spark: sparkFromTrend([activeTags * 0.7, activeTags * 0.8, activeTags * 0.85, activeTags * 0.9, activeTags * 0.95, activeTags, activeTags, activeTags]),
      sparkColor: '#2563eb',
      accent: 'blue',
    },
    {
      label: 'Clean conversion',
      value: `${convPct}%`,
      badge: convPct < 70 ? '↓ friction' : '↑ stable',
      trend: convPct < 70 ? 'Wallet / KYC friction' : 'On track',
      sub: '· compliant / total',
      tone: convPct < 65 ? 'bad' : 'warn',
      spark: sparkFromTrend([68, 67, 66, 65, 64, convPct + 2, convPct + 1, convPct]),
      sparkColor: '#d97706',
      accent: 'amber',
    },
    {
      label: 'Failure rate',
      value: `${txnFailPct}%`,
      badge: npciBreach ? '+above 3%' : 'Within NPCI',
      trend: npciBreach ? 'Above NPCI 3% limit' : 'Within program limit',
      sub: `· ${deficient.length} deficient controls`,
      tone: npciBreach ? 'bad' : 'good',
      spark: sparkFromTrend([2.8, 3.0, 3.2, 3.5, 3.8, 4.0, txnFailPct - 0.2, txnFailPct]),
      sparkColor: '#dc2626',
      accent: 'red',
    },
  ];
}

function stableBucket(id: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}

export function buildComplaintWeek(cases: FastTagCaseLike[], region: string | null) {
  const scoped = filterCases(
    cases.filter((k) => k.overallStatus !== 'compliant'),
    region,
  );
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
  return days.map((day, i) => {
    const slice = scoped.filter((k) => stableBucket(k.id, 7) === i);
    return {
      day,
      rechargeFail: slice.filter(
        (k) => k.failStageId === 'wallet' || k.failControlId === 'FT-06' || k.failControlId === 'FT-07',
      ).length,
      balMismatch: slice.filter((k) => k.failStageId === 'activate' || k.failControlId === 'FT-11').length,
      refundDelay: slice.filter((k) => k.failStageId === 'kyc' || k.failStageId === 'identity').length,
    };
  });
}

export function buildCsatResolutionWeek(cases: FastTagCaseLike[], region: string | null) {
  const scoped = filterCases(cases, region);
  const strip = getFastTagOverviewStrip();
  const baseIndex = strip.compliance;
  const failCount = scoped.filter((k) => k.overallStatus !== 'compliant').length;
  const failRate = scoped.length > 0 ? failCount / scoped.length : 0;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];

  return days.map((day, i) => {
    const dayFails = scoped.filter(
      (k) => k.overallStatus !== 'compliant' && stableBucket(k.id, 7) === i,
    ).length;
    const pressure = scoped.length > 0 ? dayFails / scoped.length : failRate;
    return {
      day,
      resolutionMin: Math.round(22 + pressure * 40 + i * 1.5),
      experienceIndex: Math.max(55, Math.round(baseIndex - i * 1.2 - pressure * 25)),
    };
  });
}

/** Finding density by day × hour from non-compliant cases. */
export function buildComplaintHeatmapFromCases(cases: FastTagCaseLike[], region: string | null) {
  const HM_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const scoped = filterCases(
    cases.filter((k) => k.overallStatus !== 'compliant'),
    region,
  );
  const grid: Record<string, number> = {};
  for (const k of scoped) {
    const day = HM_DAYS[stableBucket(k.id, 7)];
    const hour = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22][stableBucket(k.id + 'h', 12)];
    const key = `${day}-${hour}`;
    grid[key] = (grid[key] ?? 0) + 1;
  }
  const max = Math.max(...Object.values(grid), 1);
  const cells: { day: string; hour: number; intensity: number }[] = [];
  for (const day of HM_DAYS) {
    for (let h = 0; h < 12; h++) {
      const hour = h * 2;
      const count = grid[`${day}-${hour}`] ?? 0;
      cells.push({ day, hour, intensity: count / max });
    }
  }
  return cells;
}

export function buildHeatmapPeakLabel(cells: { intensity: number; hour: number }[]): string {
  const top = [...cells].sort((a, b) => b.intensity - a.intensity)[0];
  if (!top || top.intensity <= 0) return 'No peak — widen to India scope';
  const h2 = top.hour + 1;
  return `Peak ${top.hour}:00–${h2}:00 · ${Math.round(top.intensity * 100)}% of max density`;
}

/** Q1 toll debit trend (₹ crore) from settlement total. */
export function buildTollDebitTrend(region: string | null) {
  const baseCr = TOLL_SETTLEMENT_SUMMARY.totalDebits / 1_00_00_000;
  const regionScale = region ? 0.12 + stableBucket(region, 10) * 0.04 : 1;
  const total = baseCr * regionScale;
  const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];
  return weeks.map((label, i) => {
    const growth = 0.72 + (i / 7) * 0.28;
    const actual = Number((total * growth).toFixed(2));
    const target = Number((actual * (0.96 + (i % 3) * 0.02)).toFixed(2));
    return { label, actual, target };
  });
}

export function buildActivationFunnel(cases: FastTagCaseLike[], sop: FastTagSop, region: string | null) {
  const scoped = filterCases(cases, region);
  const total = scoped.length || 1;
  const stages = sop.stages;
  const rows = stages.map((stage, idx) => {
    const reached = scoped.filter((k) => {
      const t = k.trail.find((tr) => tr.stage.id === stage.id);
      return t && t.status !== 'blocked';
    }).length;
    const pct = Math.round((reached / total) * 100);
    const prev = idx === 0 ? total : stages[idx - 1]
      ? scoped.filter((k) => {
          const t = k.trail.find((tr) => tr.stage.id === stages[idx - 1].id);
          return t && t.status !== 'blocked';
        }).length
      : total;
    const drop = idx === 0 ? '' : `−${Math.max(0, Math.round(((prev - reached) / Math.max(prev, 1)) * 100))}%`;
    return {
      step: stage.name,
      stageId: stage.id,
      count: reached,
      pct,
      drop,
      highlight: stage.id === 'kyc' || stage.id === 'identity',
    };
  });
  let maxDrop = 0;
  let maxIdx = 0;
  for (let i = 1; i < rows.length; i++) {
    const drop = rows[i - 1].pct - rows[i].pct;
    if (drop > maxDrop) {
      maxDrop = drop;
      maxIdx = i;
    }
  }
  return rows.map((r, i) => ({ ...r, highlight: i === maxIdx && maxDrop > 15 }));
}

export function buildRevenueSegments(cases: FastTagCaseLike[], region: string | null) {
  const scoped = filterCases(cases, region);
  const buckets = { fleet: 0, retail: 0, logistics: 0, govt: 0 };
  for (const k of scoped) {
    buckets[segmentBucket(k.segment)] += 1;
  }
  const total = Object.values(buckets).reduce((a, b) => a + b, 0) || 1;
  return (Object.keys(buckets) as (keyof typeof buckets)[]).map((key) => {
    const share = Math.round((buckets[key] / total) * 100);
    const amount = fmtInrCompact(Math.round((TOLL_SETTLEMENT_SUMMARY.totalDebits * buckets[key]) / total));
    const tone = share >= 30 ? 'good' : share < 15 ? 'neutral' : 'bad';
    return {
      key,
      name: SEGMENT_LABELS[key],
      amount,
      pct: share,
      sharePct: share,
      delta: share >= 25 ? `+${share}%` : share < 10 ? 'Flat' : `−${Math.max(1, 30 - share)}%`,
      tone: tone as 'good' | 'bad' | 'neutral',
      value: buckets[key],
      color: SEGMENT_COLORS[key],
    };
  });
}

export function buildCohPlazas(region: string | null) {
  let rows = [...PLAZA_BREAKS]
    .filter((p) => p.status === 'open' || p.status === 'escalated' || p.priority === 'critical')
    .sort((a, b) => b.varianceInr - a.varianceInr);
  if (region) {
    rows = rows.filter((p) => getFastTagCaseRegion({ subject: `VRN ${p.vrn}` }) === region);
  }
  const maxVar = rows[0]?.varianceInr ?? 1;
  return rows.slice(0, 5).map((p) => ({
    breakId: p.id,
    plazaId: p.plazaId,
    plaza: p.plazaName,
    volume: Math.round(p.varianceInr + p.ageDays * 12),
    barPct: Math.round((p.varianceInr / maxVar) * 100),
    cause: MISMATCH_TYPE_LABEL[p.mismatchType],
    status: (p.priority === 'critical' || p.status === 'escalated'
      ? 'Critical'
      : p.status === 'open'
        ? 'Watch'
        : 'Stable') as 'Critical' | 'Watch' | 'Stable',
    controlId: 'FT-11' as const,
    vrn: p.vrn,
  }));
}

export function buildCohDecisions(controls: AuditControl[]) {
  const ft06 = controls.find((c) => c.id === 'FT-06');
  const ft11 = controls.find((c) => c.id === 'FT-11');
  const ft07 = controls.find((c) => c.id === 'FT-07');
  const ft04 = controls.find((c) => c.id === 'FT-04');
  const ft12 = controls.find((c) => c.id === 'FT-12');
  return [
    {
      id: 'upi-fix',
      title: 'Approve UPI / wallet load fix',
      desc: `${ft06?.name ?? 'FT-06'} deficient · ${ft06?.violations ?? 0} violations in Q1 sample.`,
      impact: '+8 pts',
      accent: 'red' as const,
      primary: true,
      controlId: 'FT-06',
      navigate: { view: 'register' as const, registerFilter: 'deficient' as const, controlId: 'FT-06' },
    },
    {
      id: 'refund-backlog',
      title: 'Clear plaza settlement backlog',
      desc: `${TOLL_SETTLEMENT_SUMMARY.openPlazaBreaks} open breaks · ${fmtInrCompact(TOLL_SETTLEMENT_SUMMARY.openBreakAmountInr)} unexplained.`,
      impact: '+5 pts',
      accent: 'amber' as const,
      primary: false,
      controlId: 'FT-11',
      navigate: { view: 'toll' as const, controlId: 'FT-11' },
    },
    {
      id: 'sms-alerts',
      title: 'Retest low-balance controls',
      desc: `${ft07?.name ?? 'FT-07'} · ${ft07?.status === 'deficient' ? 'deficient' : 'needs attention'}.`,
      impact: '+4 pts',
      accent: 'green' as const,
      primary: false,
      controlId: 'FT-07',
      navigate: { view: 'cases' as const, caseStage: 'wallet' },
    },
    {
      id: 'kyc-remediation',
      title: 'Clear CKYCR pending backlog',
      desc: `${ft04?.name ?? 'FT-04'} · ${ft04?.status === 'deficient' ? 'deficient' : 'needs attention'} · KYC stage blocked in sample.`,
      impact: '+6 pts',
      accent: 'amber' as const,
      primary: false,
      controlId: 'FT-04',
      navigate: { view: 'cases' as const, caseStage: 'kyc', controlId: 'FT-04' },
    },
    {
      id: 'dispute-closure',
      title: 'Close double-debit dispute queue',
      desc: `${ft12?.name ?? 'FT-12'} · ${ft12?.violations ?? 0} violations · refund / adjustment SLA at risk.`,
      impact: '+3 pts',
      accent: 'amber' as const,
      primary: false,
      controlId: 'FT-12',
      navigate: { view: 'register' as const, registerFilter: 'deficient' as const, controlId: 'FT-12' },
    },
  ];
}

export type HobEscalationRisk = ReturnType<typeof buildHobRisks>[number];

export function buildHobRisks(controls: AuditControl[], cases: FastTagCaseLike[], region: string | null) {
  const scoped = filterCases(cases, region);
  const failPct =
    scoped.length > 0
      ? Math.round((scoped.filter((k) => k.overallStatus === 'failure').length / scoped.length) * 1000) / 10
      : 0;
  const deficient = controls.filter((c) => c.status === 'deficient');
  const fleetPending = scoped.filter((k) => k.segment?.includes('Fleet') && k.overallStatus === 'pending').length;

  return [
    {
      num: '01',
      title: `Activation gap — issuance failures at ${failPct}%`,
      desc: `Retail go-live at risk · ${deficient.length} controls impacting throughput.`,
      value: `${failPct}%`,
      tone: failPct > 3 ? ('bad' as const) : ('warn' as const),
      action: 'Brief ops',
      id: 'txn-failure',
      controlId: deficient[0]?.id ?? 'FT-11',
      navigate: { view: 'cases' as const, caseStage: 'wallet', caseRegion: region },
    },
    {
      num: '02',
      title: 'Fleet / logistics renewals at risk',
      desc: `${fleetPending} pending fleet-channel cases in sample.`,
      value: fmtInrCompact(92_00_000),
      tone: 'warn' as const,
      action: 'Brief',
      id: 'renewals',
      navigate: { view: 'cases' as const, caseStage: 'ovt' },
    },
    {
      num: '03',
      title: region ? `Regional exposure — ${FASTAG_REGION_LABEL[region] ?? region}` : 'Settlement variance — India',
      desc: `${TOLL_SETTLEMENT_SUMMARY.chargebacksBreachedTat} chargebacks past TAT.`,
      value: `${TOLL_SETTLEMENT_SUMMARY.chargebacksOpen} open`,
      tone: 'info' as const,
      action: 'Counter',
      id: 'chargebacks',
      navigate: { view: 'toll' as const },
    },
  ];
}

export function buildLinkedControls(controls: AuditControl[], persona: 'coh' | 'hob', deficientOnly: boolean) {
  const ids =
    persona === 'coh'
      ? ['FT-03', 'FT-04', 'FT-06', 'FT-07', 'FT-11', 'FT-12']
      : ['FT-01', 'FT-02', 'FT-08', 'FT-09', 'FT-10', 'FT-11'];
  let list = controls.filter((c) => ids.includes(c.id));
  if (deficientOnly) list = list.filter((c) => c.status === 'deficient' || c.status === 'needs-attention');
  return list;
}

export type CohAttentionItem = import('./fastTagExecutiveTypes').ExecAttentionItem;

export function buildCohPosture(
  cases: FastTagCaseLike[],
  controls: AuditControl[],
  region: string | null,
) {
  const scoped = filterCases(cases, region);
  const openCx = scoped.filter(
    (k) =>
      k.overallStatus !== 'compliant' &&
      (CX_STAGES.has(k.failStageId ?? '') || CX_CONTROLS.has(k.failControlId ?? '')),
  ).length;
  const critical = scoped.filter((k) => k.overallStatus === 'failure').length;
  const plazaBreaks = buildCohPlazas(region).length;
  const deficient = controls.filter(
    (c) => CX_CONTROLS.has(c.id) && (c.status === 'deficient' || c.status === 'needs-attention'),
  ).length;
  return { openCx, critical, plazaBreaks, deficient };
}

export function buildCohAttention(
  controls: AuditControl[],
  cases: FastTagCaseLike[],
  region: string | null,
): CohAttentionItem[] {
  const scoped = filterCases(cases, region);
  const posture = buildCohPosture(cases, controls, region);
  const pending = scoped.filter((k) => k.overallStatus === 'pending').length;
  const walletFails = scoped.filter(
    (k) =>
      k.overallStatus !== 'compliant' &&
      (k.failStageId === 'wallet' || k.failControlId === 'FT-06' || k.failControlId === 'FT-07'),
  ).length;
  const ft11 = controls.find((c) => c.id === 'FT-11');

  const items: CohAttentionItem[] = [
    {
      num: '01',
      title: `${posture.openCx} open CX findings in sample`,
      desc: `${posture.critical} critical · ${pending} pending review · wallet-stage priority.`,
      value: String(posture.openCx),
      tone: posture.openCx > scoped.length * 0.3 ? 'bad' : 'warn',
      action: 'View cases',
      id: 'cx-open',
      navigate: { view: 'cases', caseRegion: region, caseStage: 'wallet' } satisfies FastTagWorkspaceNavigate,
    },
    {
      num: '02',
      title: `${posture.plazaBreaks} plaza breaks · settlement CX`,
      desc: `${TOLL_SETTLEMENT_SUMMARY.openPlazaBreaks} register open · ${fmtInrCompact(TOLL_SETTLEMENT_SUMMARY.openBreakAmountInr)} unexplained.`,
      value: `${posture.plazaBreaks} active`,
      tone: posture.plazaBreaks > 1 ? 'bad' : 'warn',
      action: 'Open toll',
      id: 'plaza-cx',
      navigate: { view: 'toll', controlId: 'FT-11' } satisfies FastTagWorkspaceNavigate,
    },
    {
      num: '03',
      title: `Wallet / recharge friction — ${walletFails} cases`,
      desc: `FT-06 / FT-07 · ${controls.find((c) => c.id === 'FT-06')?.status ?? '—'} / ${controls.find((c) => c.id === 'FT-07')?.status ?? '—'}.`,
      value: String(walletFails),
      tone: walletFails > 8 ? 'bad' : 'warn',
      action: 'Drill FT-06',
      id: 'wallet-friction',
      navigate: { view: 'register', registerFilter: 'deficient', controlId: 'FT-06' } satisfies FastTagWorkspaceNavigate,
    },
    {
      num: '04',
      title: `${ft11?.name ?? 'FT-11'} · ${ft11?.status ?? 'control'}`,
      desc: `${posture.deficient} CX-linked controls deficient or need attention.`,
      value: `${ft11?.compliance ?? 0}%`,
      tone: ft11?.status === 'deficient' ? 'bad' : 'info',
      action: 'Register',
      id: 'ft11-cx',
      navigate: { view: 'register', registerFilter: 'deficient', controlId: 'FT-11' } satisfies FastTagWorkspaceNavigate,
    },
  ];
  return items;
}

export function buildLiveTicker(cases: FastTagCaseLike[], controls: AuditControl[]) {
  const strip = getFastTagOverviewStrip();
  const failPct =
    cases.length > 0
      ? Math.round((cases.filter((k) => k.overallStatus === 'failure').length / cases.length) * 1000) / 10
      : 0;
  const openCx = cases.filter((k) => k.overallStatus !== 'compliant').length;
  return [
    { label: 'Experience index', value: `${strip.compliance}%`, tone: strip.compliance < 85 ? ('bad' as const) : ('good' as const) },
    { label: 'Open findings', value: openCx.toLocaleString('en-IN'), tone: 'warn' as const },
    { label: 'Failure rate', value: `${failPct}%`, tone: failPct > 3 ? ('bad' as const) : ('good' as const) },
    { label: 'Plaza match', value: `${TOLL_SETTLEMENT_SUMMARY.matchedPct}%`, tone: 'good' as const },
    { label: 'Open breaks', value: String(TOLL_SETTLEMENT_SUMMARY.openPlazaBreaks), tone: 'warn' as const },
    { label: 'Deficient controls', value: String(controls.filter((c) => c.status === 'deficient').length), tone: 'bad' as const },
  ];
}

export function buildFailureRateSeries(txnFailPct: number) {
  const labels = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Now'];
  const start = Math.max(1.5, txnFailPct - 1.2);
  return labels.map((label, i) => ({
    label,
    rate: Math.round((start + ((txnFailPct - start) * i) / 6) * 10) / 10,
  }));
}

export function buildSettlementStrip() {
  return {
    matchPct: TOLL_SETTLEMENT_SUMMARY.matchedPct,
    openBreaks: TOLL_SETTLEMENT_SUMMARY.openPlazaBreaks,
    openAmount: fmtInrCompact(TOLL_SETTLEMENT_SUMMARY.openBreakAmountInr),
    breachedTat: TOLL_SETTLEMENT_SUMMARY.chargebacksBreachedTat,
    posture: getFastTagOverviewStrip().posture,
  };
}

export function getRegionOptions() {
  return Object.entries(FASTAG_REGION_LABEL)
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([code, label]) => ({ code, label }));
}

export { getComplaintHeatmap, FASTAG_SOP };
