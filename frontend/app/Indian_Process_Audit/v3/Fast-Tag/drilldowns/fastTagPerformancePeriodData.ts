import type { DrillPeriodGrain } from './fastTagDrillPeriod';
import { DRILL_PERIOD_OPTIONS } from './fastTagDrillPeriod';
import {
  buildHobSettlementSnapshot,
  type HobSettlementSnapshot,
} from './fastTagHobSettlementData';

/** @deprecated Use DrillPeriodGrain */
export type PerfPeriodGrain = DrillPeriodGrain;

export { DRILL_PERIOD_OPTIONS as PERF_PERIOD_OPTIONS };

export type CashRow = { k: string; v: number };

export type ContribRow = {
  k: string;
  sub?: string;
  v: number;
  mom?: string;
  basis?: string;
  color: string;
};

export type PnlStackItem = {
  label: string;
  display: string;
  delta: string;
  up: boolean;
  value: number;
  scale: number;
  color: string;
  isPct?: boolean;
};

export type HeadlineKpi = {
  label: string;
  v: string;
  d: string;
  tone: string;
  color: string;
};

export type PerfPeriodSnapshot = {
  grain: DrillPeriodGrain;
  caption: string;
  score: number;
  scoreDelta: number;
  scoreDeltaLabel: string;
  scoreUp: boolean;
  revTrend: number[];
  trendLabels: string[];
  trendChartTitle: string;
  trendHint: string;
  headline: HeadlineKpi[];
  pnlStack: PnlStackItem[];
  pnlUnit: {
    revPerTag: number;
    revPrior: number;
    costPerTag: number;
    costPrior: number;
    takeRate: string;
    takeDelta: string;
  };
  inflows: CashRow[];
  outflows: CashRow[];
  consumer: ContribRow[];
  partner: ContribRow[];
  netRevenueCr: number;
  hobSettlement: HobSettlementSnapshot;
  pnlInsight: string;
  cashInsight: string;
  contribInsight: string;
};

const MONTH_NET_REV = 52;
const MONTH_INFLOW = 53.4;
const MONTH_OUTFLOW = 37.2;
const MONTH_EBITDA = 11.4;
const BASE_INFLOWS: CashRow[] = [
  { k: 'Toll txn commission / interchange', v: 28.0 },
  { k: 'Float income (wallet + deposits)', v: 9.0 },
  { k: 'Annual Pass (upfront, net)', v: 7.0 },
  { k: 'Tag issuance + deposit fees', v: 4.0 },
  { k: 'Non-toll (parking / fuel)', v: 3.4 },
  { k: 'Co-brand / partner fees', v: 2.0 },
];

const BASE_OUTFLOWS: CashRow[] = [
  { k: 'Acquirer / partner share', v: 8.0 },
  { k: 'Marketing / CAC', v: 6.0 },
  { k: 'NPCI / NETC switch fees', v: 6.0 },
  { k: 'Customer support / BPO', v: 5.0 },
  { k: 'Tag procurement + logistics', v: 4.0 },
  { k: 'Refunds & chargebacks', v: 3.2 },
  { k: 'Tech / cloud / infra', v: 3.0 },
  { k: 'KYC vendor', v: 2.0 },
];

const BASE_CONSUMER: ContribRow[] = [
  { k: 'Toll plaza commission', sub: 'Retail toll debit · MDR on NETC settlement', v: 8.2, mom: '+6%', basis: '18.4L txn/mo', color: '#2563eb' },
  { k: 'Annual Pass & highway pass', sub: 'Subscription · unlimited corridor bundles', v: 7.0, mom: '+12%', basis: '6.2L active passes', color: '#0d9488' },
  { k: 'Wallet float income', sub: 'Avg float ₹420Cr · T+1 reinvestment yield', v: 5.5, mom: '+3%', basis: '₹420Cr avg float', color: '#16a34a' },
  { k: 'Tag issuance + security deposit', sub: 'New tag fee · refundable deposit float', v: 3.5, mom: '+4%', basis: '2.1L new tags/mo', color: '#7c3aed' },
  { k: 'Recharge convenience fee', sub: 'UPI / card reload · partner spread', v: 4.1, mom: '+8%', basis: '42L reloads/mo', color: '#2563eb' },
  { k: 'Parking & closed-loop toll', sub: 'City parking · plaza-adjacent lanes', v: 2.8, mom: '+9%', basis: '3.8L exits/mo', color: '#0d9488' },
  { k: 'Loyalty breakage & OTP recovery', sub: 'Dormant wallet · SMS / OTP pass-through', v: 2.2, mom: '-2%', basis: '1.1L dormant tags', color: '#f59e0b' },
];

const BASE_PARTNER: ContribRow[] = [
  { k: 'Acquirer commission', sub: 'Top acquirer 38% of partner toll volume', v: 6.5, mom: '+5%', basis: '38% vol share', color: '#f59e0b' },
  { k: 'Co-brand / bank referral fees', sub: 'Issuance referral · co-branded wallet', v: 2.0, mom: '+2%', basis: '4 bank partners', color: '#2563eb' },
  { k: 'Parking / fuel merchant share', sub: 'Off-highway merchants · revenue share', v: 2.8, mom: '+7%', basis: '890 plazas', color: '#0d9488' },
  { k: 'Merchant / aggregator MDR', sub: 'Fleet reload · toll-aggregator spread', v: 3.0, mom: '+4%', basis: '12 aggregators', color: '#7c3aed' },
  { k: 'Fleet B2B platform fee', sub: '12 flagged fleet accounts · slab pricing', v: 1.8, mom: '+14%', basis: '12 fleet accounts', color: '#f59e0b' },
  { k: 'NHAI plaza revenue share', sub: 'National pool · corridor incentive', v: 1.2, mom: '+1%', basis: 'National pool', color: '#16a34a' },
  { k: 'White-label API / SDK licensing', sub: 'Issuer embed · per-API call tier', v: 1.4, mom: '+18%', basis: '6 issuer SDKs', color: '#2563eb' },
];

const MONTH_REV_TREND = [34, 50, 39, 52, 43, 38, 31, 37, 49, 41, 55];

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round0(n: number): number {
  return Math.round(n);
}

function scaleRows<T extends { v: number }>(rows: T[], targetTotal: number, sourceTotal: number): T[] {
  const f = targetTotal / sourceTotal;
  const scaled = rows.map((r) => ({ ...r, v: round1(r.v * f) }));
  const drift = round1(targetTotal - scaled.reduce((s, x) => s + x.v, 0));
  if (scaled.length > 0 && Math.abs(drift) >= 0.05) {
    scaled[0] = { ...scaled[0], v: round1(scaled[0].v + drift) };
  }
  return scaled;
}

function formatCr(v: number): string {
  return `₹${v.toFixed(1)}Cr`;
}

function formatLakh(v: number): string {
  if (v >= 100) return `${(v / 100).toFixed(1)}Cr`;
  return `${v.toFixed(1)}L`;
}

type GrainMeta = {
  caption: string;
  moneyMult: number;
  score: number;
  scoreDelta: number;
  scoreUp: boolean;
  scoreDeltaLabel: string;
  revTrend: number[];
  trendLabels: string[];
  trendChartTitle: string;
  trendHint: string;
  gtvCr: number;
  gtvDelta: string;
  activeTags: string;
  tagsDelta: string;
  dailyTxn: string;
  txnDelta: string;
  revLabel: string;
  revDelta: string;
  marginPct: string;
  marginDelta: string;
  netCashLabel: string;
  netCashDelta: string;
  pnlInsight: string;
  cashInsight: string;
  contribInsight: string;
  basisSuffix: string;
};

const GRAIN_META: Record<DrillPeriodGrain, GrainMeta> = {
  year: {
    caption: 'FY 2025–26 · full year',
    moneyMult: 12,
    score: 74,
    scoreDelta: 2,
    scoreUp: true,
    scoreDeltaLabel: '+2 pts vs prior FY',
    revTrend: [598, 612, 628, 624],
    trendLabels: ['Q2', 'Q3', 'Q4', 'Q1'],
    trendChartTitle: 'Net revenue · ₹Cr / quarter',
    trendHint: 'FY run-rate improving; Q1 FY26 tracking above prior-year exit.',
    gtvCr: 22200,
    gtvDelta: '+19% YoY',
    activeTags: '84L',
    tagsDelta: '+6% YoY',
    dailyTxn: '18.4L avg',
    txnDelta: '+8% YoY',
    revLabel: 'Net Revenue (FY)',
    revDelta: '+11% YoY',
    marginPct: '22%',
    marginDelta: '+2 pts YoY',
    netCashLabel: 'Net Op. Cash (FY)',
    netCashDelta: '+14% YoY',
    pnlInsight: 'Full-year revenue and EBITDA ahead of plan; unit economics improving across the book.',
    cashInsight: 'Annual operating cash positive — toll take and float yield cover acquirer and marketing outflows.',
    contribInsight: 'Consumer toll, Annual Pass, and float still anchor FY net — partner share stable as a % of revenue.',
    basisSuffix: '/ FY',
  },
  quarter: {
    caption: 'Q1 2026 · Jan–Mar',
    moneyMult: 3,
    score: 73,
    scoreDelta: -2,
    scoreUp: false,
    scoreDeltaLabel: '▼ 2 pts vs prior quarter',
    revTrend: [48, 49, 55],
    trendLabels: ['Jan', 'Feb', 'Mar'],
    trendChartTitle: 'Net revenue · ₹Cr / month',
    trendHint: 'March rebound after festival trough; Q1 net revenue on plan.',
    gtvCr: 5550,
    gtvDelta: '+17% QoQ',
    activeTags: '84L',
    tagsDelta: '+2% QoQ',
    dailyTxn: '18.1L avg',
    txnDelta: '+6% QoQ',
    revLabel: 'Net Revenue (Q1)',
    revDelta: '+10% QoQ',
    marginPct: '22%',
    marginDelta: '+1 pt QoQ',
    netCashLabel: 'Net Op. Cash (Q1)',
    netCashDelta: '+12% QoQ',
    pnlInsight: 'Q1 revenue and margin up; cost per tag improved vs Dec exit.',
    cashInsight: 'Quarterly cash surplus intact — inflows exceed acquirer and marketing outflows.',
    contribInsight: 'Consumer lines are 65% of Q1 net; partner MDR and fleet fees gaining share.',
    basisSuffix: '/ Q1',
  },
  month: {
    caption: 'Mar 2026 · current month',
    moneyMult: 1,
    score: 72,
    scoreDelta: -3,
    scoreUp: false,
    scoreDeltaLabel: '▼ 3 pts vs last week',
    revTrend: MONTH_REV_TREND,
    trendLabels: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11'],
    trendChartTitle: 'Net revenue · ₹Cr / month',
    trendHint: 'Soft after festival week; March run-rate recovering toward plan.',
    gtvCr: 1850,
    gtvDelta: '+19% YoY',
    activeTags: '84L',
    tagsDelta: '+6% QoQ',
    dailyTxn: '18.4L',
    txnDelta: '+8%',
    revLabel: 'Net Revenue (mo)',
    revDelta: '+11% YoY',
    marginPct: '22%',
    marginDelta: '+2 pts',
    netCashLabel: 'Net Op. Cash (mo)',
    netCashDelta: '+14%',
    pnlInsight: '',
    cashInsight: 'Operating cash stays positive — toll take and float yield fund the book.',
    contribInsight: 'Consumer toll and pass revenue still carry most of net revenue.',
    basisSuffix: '/ mo',
  },
  weeks: {
    caption: 'Last 6 weeks · rolling',
    moneyMult: 12 / 52,
    score: 70,
    scoreDelta: -3,
    scoreUp: false,
    scoreDeltaLabel: '▼ 3 pts vs prior week',
    revTrend: [62, 64, 63, 67, 69, 72],
    trendLabels: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'],
    trendChartTitle: 'Business-health index · weekly',
    trendHint: 'Score recovering from festival dip; recharge ratio improving W5–W6.',
    gtvCr: 428,
    gtvDelta: '+14% WoW',
    activeTags: '84L',
    tagsDelta: '+0.4% WoW',
    dailyTxn: '17.9L',
    txnDelta: '+5% WoW',
    revLabel: 'Net Revenue (wk)',
    revDelta: '+9% WoW',
    marginPct: '21%',
    marginDelta: '+1 pt WoW',
    netCashLabel: 'Net Op. Cash (wk)',
    netCashDelta: '+11% WoW',
    pnlInsight: 'Weekly revenue steady; margin ticked up as support cost normalized.',
    cashInsight: 'Week closed with positive net cash — float yield offset higher marketing spend.',
    contribInsight: 'Consumer toll and pass still dominate the weekly revenue mix.',
    basisSuffix: '/ wk',
  },
  last24: {
    caption: 'Last 24 hours · live window',
    moneyMult: 1 / 30,
    score: 71,
    scoreDelta: 1,
    scoreUp: true,
    scoreDeltaLabel: '+1 pt vs prior 24h',
    revTrend: Array.from({ length: 24 }, (_, i) => {
      const base = 1.65;
      const wave = 0.88 + Math.sin(i * 0.55) * 0.1 + (i / 24) * 0.06;
      return round1(base * wave);
    }),
    trendLabels: Array.from({ length: 24 }, (_, i) => (i % 4 === 0 ? `${i}h` : '')),
    trendChartTitle: 'Net revenue · ₹Cr / hour (indexed)',
    trendHint: 'Peak hours 09–18h; overnight trough in line with typical toll debit curve.',
    gtvCr: 62,
    gtvDelta: '+6% vs prior 24h',
    activeTags: '84L',
    tagsDelta: 'stable',
    dailyTxn: formatLakh(18.4 * 0.08),
    txnDelta: '+4% vs prior 24h',
    revLabel: 'Net Revenue (24h)',
    revDelta: '+5% vs prior 24h',
    marginPct: '22%',
    marginDelta: 'stable',
    netCashLabel: 'Net Op. Cash (24h)',
    netCashDelta: '+8% vs prior 24h',
    pnlInsight: 'Intraday revenue on track; hourly toll debits aligned with NPCI settlement window.',
    cashInsight: '24h cash net positive — toll commission and float accrual ahead of outflows.',
    contribInsight: 'Toll commission and float income lead the rolling 24h revenue split.',
    basisSuffix: '/ 24h',
  },
};

export function buildPerformancePeriodSnapshot(grain: DrillPeriodGrain): PerfPeriodSnapshot {
  const meta = GRAIN_META[grain];
  const m = meta.moneyMult;

  const netRev = round1(MONTH_NET_REV * m);
  const inflowTotal = round1(MONTH_INFLOW * m);
  const outflowTotal = round1(MONTH_OUTFLOW * m);
  const netCash = round1(inflowTotal - outflowTotal);
  const ebitda = round1(MONTH_EBITDA * m);
  const inflows = scaleRows(BASE_INFLOWS, inflowTotal, MONTH_INFLOW);
  const outflows = scaleRows(BASE_OUTFLOWS, outflowTotal, MONTH_OUTFLOW);

  const consumerBase = BASE_CONSUMER.reduce((s, x) => s + x.v, 0);
  const partnerBase = BASE_PARTNER.reduce((s, x) => s + x.v, 0);
  const contribTotal = consumerBase + partnerBase;
  const consumer = scaleRows(
    BASE_CONSUMER.map((r) => ({
      ...r,
      basis: r.basis?.replace(/\/ mo/g, meta.basisSuffix) ?? r.basis,
    })),
    netRev * (consumerBase / contribTotal),
    consumerBase,
  );
  const partner = scaleRows(
    BASE_PARTNER.map((r) => ({ ...r, basis: r.basis })),
    netRev * (partnerBase / contribTotal),
    partnerBase,
  );

  const grossMargin = 61;
  const pnlStack: PnlStackItem[] = [
    {
      label: 'Net revenue',
      display: formatCr(netRev),
      delta: meta.revDelta,
      up: true,
      value: netRev,
      scale: netRev * 1.06,
      color: '#2563eb',
    },
    {
      label: 'EBITDA',
      display: formatCr(ebitda),
      delta: grain === 'year' ? '+18% YoY' : '+18% vs prior period',
      up: true,
      value: ebitda,
      scale: netRev * 1.06,
      color: '#16a34a',
    },
    {
      label: 'Gross margin',
      display: `${grossMargin}%`,
      delta: grain === 'quarter' ? '+1 pt vs last quarter' : '+1 pt vs prior period',
      up: true,
      value: grossMargin,
      scale: 100,
      color: '#0d9488',
      isPct: true,
    },
  ];

  const headline: HeadlineKpi[] = [
    {
      label: 'Toll Throughput (GTV)',
      v: formatCr(meta.gtvCr),
      d: meta.gtvDelta,
      tone: 'blue',
      color: '#2563eb',
    },
    {
      label: meta.revLabel,
      v: formatCr(netRev),
      d: meta.revDelta,
      tone: 'green',
      color: '#16a34a',
    },
    {
      label: 'Active Tags',
      v: meta.activeTags,
      d: meta.tagsDelta,
      tone: 'violet',
      color: '#7c3aed',
    },
    {
      label: grain === 'last24' ? 'Transactions (24h)' : 'Daily Transactions',
      v: meta.dailyTxn,
      d: meta.txnDelta,
      tone: 'indigo',
      color: '#2563eb',
    },
  ];

  const pnlUnit = {
    revPerTag: round0(62 * (1 + (meta.score - 72) * 0.008)),
    revPrior: round0(62 * (1 + (meta.score - 72) * 0.008) * 0.96),
    costPerTag: round0(44 * (1 - (meta.score - 72) * 0.006)),
    costPrior: round0(44 * (1 - (meta.score - 72) * 0.006) * 1.06),
    takeRate: '0.28%',
    takeDelta: 'stable',
  };
  const hobSettlement = buildHobSettlementSnapshot(grain);

  return {
    grain,
    caption: meta.caption,
    score: meta.score,
    scoreDelta: meta.scoreDelta,
    scoreDeltaLabel: meta.scoreDeltaLabel,
    scoreUp: meta.scoreUp,
    revTrend: meta.revTrend,
    trendLabels: meta.trendLabels,
    trendChartTitle: meta.trendChartTitle,
    trendHint: meta.trendHint,
    headline,
    pnlStack,
    pnlUnit,
    inflows,
    outflows,
    consumer,
    partner,
    netRevenueCr: netRev,
    hobSettlement,
    pnlInsight: meta.pnlInsight,
    cashInsight: meta.cashInsight,
    contribInsight: meta.contribInsight,
  };
}
