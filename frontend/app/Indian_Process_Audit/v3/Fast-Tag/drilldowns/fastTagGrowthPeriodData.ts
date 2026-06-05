import type { DrillPeriodGrain } from './fastTagDrillPeriod';

export type GrowthDriver = {
  name: string;
  val: number;
  color: string;
  note: string;
  metricValue?: string;
  metricYoy?: string;
  mom?: string;
};

export type GrowthTxnMonth = {
  month: string;
  countL: number;
  valueCr: number;
  perUser: number;
  countLabel: string;
};

export type GrowthRetentionMonth = {
  month: string;
  activePct: number;
  inactivePct: number;
  repeatUsage: number;
  dormancy: number;
  growthRate: number;
};

export type GrowthHeadlineKpi = {
  label: string;
  v: string;
  d: string;
  tone: string;
  color: string;
};

export type GrowthPeriodSnapshot = {
  grain: DrillPeriodGrain;
  caption: string;
  score: number;
  scoreDelta: string;
  scoreUp: boolean;
  northstar: number[];
  trendLabels: string[];
  trendTitle: string;
  trendHint: string;
  headline: GrowthHeadlineKpi[];
  drivers: GrowthDriver[];
  driversInsight: string;
  driversTotalLabel: string;
  channelsInsight: string;
  funnelInsight: string;
  txnInsight: string;
  retentionInsight: string;
  transactionMonthly: GrowthTxnMonth[];
  retentionMonthly: GrowthRetentionMonth[];
  lifecycleScale: number;
};

const BASE_NORTHSTAR = [78, 80, 83, 82, 86, 88, 91, 90, 94, 97, 100, 104];
const BASE_DRIVERS: GrowthDriver[] = [
  {
    name: 'New tag acquisition',
    val: 7.2,
    color: '#059669',
    note: 'new-vehicle + post-Paytm re-issuance',
    metricValue: '1.84L',
    metricYoy: '+8% YoY',
    mom: '+3% MoM',
  },
  {
    name: 'Annual Pass uptake',
    val: 6.5,
    color: '#0891b2',
    note: 'launched Aug\'25, 31% attach on new personal tags',
    metricValue: '31% attach',
    metricYoy: '+19 pts',
    mom: '+6% MoM',
  },
  {
    name: 'Usage depth (txns / tag)',
    val: 3.0,
    color: '#2563eb',
    note: 'more trips per active tag',
    metricValue: '14.2',
    metricYoy: '+6% YoY',
    mom: '+2% MoM',
  },
  {
    name: 'Dormant-tag reactivation',
    val: 2.1,
    color: '#d97706',
    note: '16% of base dormant — recovery',
    metricValue: '16% idle',
    metricYoy: '+2.1% rec.',
    mom: 'flat',
  },
  {
    name: 'Non-toll cross-sell',
    val: 1.2,
    color: '#a78bfa',
    note: 'parking, fuel, mall plazas',
    metricValue: '₹3.4Cr',
    metricYoy: '+44% YoY',
    mom: '+9% MoM',
  },
];

const MONTH_TXN: GrowthTxnMonth[] = [
  { month: 'Jan', countL: 15.2, valueCr: 358, perUser: 12.6, countLabel: '15.2L' },
  { month: 'Feb', countL: 15.6, valueCr: 366, perUser: 12.8, countLabel: '15.6L' },
  { month: 'Mar', countL: 16.1, valueCr: 375, perUser: 13.0, countLabel: '16.1L' },
  { month: 'Apr', countL: 16.0, valueCr: 372, perUser: 12.9, countLabel: '16.0L' },
  { month: 'May', countL: 16.8, valueCr: 384, perUser: 13.2, countLabel: '16.8L' },
  { month: 'Jun', countL: 17.2, valueCr: 392, perUser: 13.4, countLabel: '17.2L' },
  { month: 'Jul', countL: 17.5, valueCr: 398, perUser: 13.6, countLabel: '17.5L' },
  { month: 'Aug', countL: 17.4, valueCr: 396, perUser: 13.5, countLabel: '17.4L' },
  { month: 'Sep', countL: 17.9, valueCr: 402, perUser: 13.8, countLabel: '17.9L' },
  { month: 'Oct', countL: 18.1, valueCr: 406, perUser: 13.9, countLabel: '18.1L' },
  { month: 'Nov', countL: 18.3, valueCr: 409, perUser: 14.0, countLabel: '18.3L' },
  { month: 'Dec', countL: 18.4, valueCr: 412, perUser: 14.2, countLabel: '18.4L' },
];

const MONTH_RET: GrowthRetentionMonth[] = [
  { month: 'Jan', activePct: 46, inactivePct: 54, repeatUsage: 61, dormancy: 18, growthRate: 14 },
  { month: 'Feb', activePct: 47, inactivePct: 53, repeatUsage: 62, dormancy: 18, growthRate: 14.5 },
  { month: 'Mar', activePct: 47, inactivePct: 53, repeatUsage: 63, dormancy: 17, growthRate: 15 },
  { month: 'Apr', activePct: 48, inactivePct: 52, repeatUsage: 63, dormancy: 17, growthRate: 15.5 },
  { month: 'May', activePct: 48, inactivePct: 52, repeatUsage: 64, dormancy: 17, growthRate: 16 },
  { month: 'Jun', activePct: 49, inactivePct: 51, repeatUsage: 65, dormancy: 17, growthRate: 16.5 },
  { month: 'Jul', activePct: 49, inactivePct: 51, repeatUsage: 65, dormancy: 16, growthRate: 17 },
  { month: 'Aug', activePct: 49, inactivePct: 51, repeatUsage: 66, dormancy: 16, growthRate: 17.5 },
  { month: 'Sep', activePct: 50, inactivePct: 50, repeatUsage: 66, dormancy: 16, growthRate: 18 },
  { month: 'Oct', activePct: 50, inactivePct: 50, repeatUsage: 67, dormancy: 16, growthRate: 18.5 },
  { month: 'Nov', activePct: 50, inactivePct: 50, repeatUsage: 67, dormancy: 16, growthRate: 19 },
  { month: 'Dec', activePct: 50, inactivePct: 50, repeatUsage: 68, dormancy: 16, growthRate: 20 },
];

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function scaleDrivers(mult: number): GrowthDriver[] {
  const scaled = BASE_DRIVERS.map((d) => ({ ...d, val: round1(d.val * mult) }));
  const total = scaled.reduce((s, d) => s + d.val, 0);
  const target = round1(BASE_DRIVERS.reduce((s, d) => s + d.val, 0) * mult);
  const drift = round1(target - total);
  if (scaled.length && Math.abs(drift) >= 0.05) scaled[0] = { ...scaled[0], val: round1(scaled[0].val + drift) };
  return scaled;
}

function weekTxnRows(): GrowthTxnMonth[] {
  const dec = MONTH_TXN[11];
  return ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'].map((month, i) => {
    const f = 0.92 + i * 0.015;
    return {
      month,
      countL: round1(dec.countL * f * 0.24),
      valueCr: round1(dec.valueCr * f * 0.24),
      perUser: round1(dec.perUser * (0.98 + i * 0.004)),
      countLabel: `${round1(dec.countL * f * 0.24)}L`,
    };
  });
}

function weekRetRows(): GrowthRetentionMonth[] {
  const dec = MONTH_RET[11];
  return ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'].map((month, i) => ({
    month,
    activePct: dec.activePct - (5 - i),
    inactivePct: dec.inactivePct + (5 - i),
    repeatUsage: dec.repeatUsage - (5 - i),
    dormancy: dec.dormancy + (i > 3 ? 0 : 1),
    growthRate: round1(dec.growthRate - (5 - i) * 0.8),
  }));
}

const GRAIN: Record<
  DrillPeriodGrain,
  Omit<
    GrowthPeriodSnapshot,
    | 'drivers'
    | 'transactionMonthly'
    | 'retentionMonthly'
    | 'headline'
  > & { driverMult: number; lifecycleScale: number }
> = {
  year: {
    grain: 'year',
    caption: 'FY 2025–26 · full year',
    score: 68,
    scoreDelta: '+6 pts vs prior FY',
    scoreUp: true,
    northstar: [85, 92, 98, 104],
    trendLabels: ['Q2', 'Q3', 'Q4', 'Q1'],
    trendTitle: 'Toll volume index · by quarter',
    trendHint: 'FY exit at index 104 — +20% YoY with Annual Pass and acquisition mix.',
    driversInsight: 'Annual Pass and new tags drove most of FY volume lift.',
    driversTotalLabel: '+20% vs prior FY',
    channelsInsight: 'Digital and co-brand channels gained share through the year.',
    funnelInsight: 'Full-year onboarding: wallet load remains the main post-KYC leak.',
    txnInsight: 'FY toll usage up across transactions, ₹ value, and trips per active user.',
    retentionInsight: 'FY sustainability rate reached +20% — active share and repeat usage improved.',
    driverMult: 1,
    lifecycleScale: 1,
  },
  quarter: {
    grain: 'quarter',
    caption: 'Q1 2026 · Jan–Mar',
    score: 67,
    scoreDelta: '+5 pts vs prior quarter',
    scoreUp: true,
    northstar: [97, 100, 104],
    trendLabels: ['Jan', 'Feb', 'Mar'],
    trendTitle: 'Toll volume index · Q1 months',
    trendHint: 'Q1 closed strong — March index 104 on Annual Pass attach.',
    driversInsight: 'Q1 lift led by Annual Pass and new tag acquisition.',
    driversTotalLabel: '+19% vs prior quarter',
    channelsInsight: 'Co-brand and app channels fastest in Q1.',
    funnelInsight: 'Q1 cohort: wallet step still the steepest drop after KYC.',
    txnInsight: 'Q1 transactions and ₹ toll value ahead of prior quarter.',
    retentionInsight: 'Q1 sustainability growth rate trending to +20%.',
    driverMult: 0.92,
    lifecycleScale: 0.92,
  },
  month: {
    grain: 'month',
    caption: 'Mar 2026 · current month',
    score: 66,
    scoreDelta: '+4 pts vs last week',
    scoreUp: true,
    northstar: BASE_NORTHSTAR,
    trendLabels: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12'],
    trendTitle: 'Monthly toll volume · indexed',
    trendHint: 'Peak in December; steady climb since Annual Pass launch — +20% YoY toll volume.',
    driversInsight: 'Annual Pass and new tags contribute most of this year\'s volume lift.',
    driversTotalLabel: '+20% vs last year',
    channelsInsight: 'Digital and co-brand channels are growing fastest.',
    funnelInsight: 'Fewer users load wallet after KYC — biggest onboarding drop.',
    txnInsight: 'Actual toll usage is up — more transactions, higher ₹ value, and deeper trips per active user.',
    retentionInsight: 'Sustainability growth rate hit +20% — active share and repeat usage up, dormancy still at 16%.',
    driverMult: 1,
    lifecycleScale: 1,
  },
  weeks: {
    grain: 'weeks',
    caption: 'Last 6 weeks · rolling',
    score: 64,
    scoreDelta: '+3 pts vs prior week',
    scoreUp: true,
    northstar: [58, 60, 62, 63, 65, 66],
    trendLabels: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'],
    trendTitle: 'Growth index · weekly',
    trendHint: 'Six-week run improving — recharge and Annual Pass attach lifting the index.',
    driversInsight: 'Weekly volume lift still led by Annual Pass and digital issuance.',
    driversTotalLabel: '+18% vs prior 6 weeks',
    channelsInsight: 'App channel share gained +2 pts over the last six weeks.',
    funnelInsight: 'Recent cohorts: wallet conversion recovering W5–W6.',
    txnInsight: 'Weekly toll debits and ₹ value tracking above the prior 6-week average.',
    retentionInsight: 'Repeat usage ticked up WoW; dormancy flat at 16%.',
    driverMult: 0.28,
    lifecycleScale: 0.42,
  },
  last24: {
    grain: 'last24',
    caption: 'Last 24 hours · live window',
    score: 65,
    scoreDelta: '+2 pts vs prior 24h',
    scoreUp: true,
    northstar: Array.from({ length: 24 }, (_, i) => round1(62 + Math.sin(i * 0.5) * 2 + i * 0.08)),
    trendLabels: Array.from({ length: 24 }, (_, i) => (i % 4 === 0 ? `${i}h` : '')),
    trendTitle: 'Toll volume index · last 24h',
    trendHint: 'Daytime peaks align with highway debit curve; overnight trough as expected.',
    driversInsight: '24h growth driven by toll debits and auto-recharge on active corridors.',
    driversTotalLabel: '+5% vs prior 24h',
    channelsInsight: 'Digital reloads dominated the last 24h issuance window.',
    funnelInsight: 'Intraday onboarding: OTP→KYC stable; wallet loads lagging midday cohort.',
    txnInsight: '24h transactions and ₹ value above the prior-day same window.',
    retentionInsight: '24h repeat-usage rate holding; dormancy unchanged.',
    driverMult: 0.04,
    lifecycleScale: 0.08,
  },
};

export function buildGrowthPeriodSnapshot(grain: DrillPeriodGrain): GrowthPeriodSnapshot {
  const g = GRAIN[grain];
  const drivers = scaleDrivers(g.driverMult);

  let transactionMonthly: GrowthTxnMonth[];
  let retentionMonthly: GrowthRetentionMonth[];

  if (grain === 'year') {
    transactionMonthly = [
      { month: 'Q2', countL: 16.8, valueCr: 1180, perUser: 13.1, countLabel: '16.8L avg' },
      { month: 'Q3', countL: 17.6, valueCr: 1210, perUser: 13.5, countLabel: '17.6L avg' },
      { month: 'Q4', countL: 18.1, valueCr: 1235, perUser: 13.8, countLabel: '18.1L avg' },
      { month: 'Q1', countL: 18.4, valueCr: 1245, perUser: 14.2, countLabel: '18.4L avg' },
    ];
    retentionMonthly = [
      { month: 'Q2', activePct: 47, inactivePct: 53, repeatUsage: 63, dormancy: 18, growthRate: 15 },
      { month: 'Q3', activePct: 48, inactivePct: 52, repeatUsage: 65, dormancy: 17, growthRate: 17 },
      { month: 'Q4', activePct: 49, inactivePct: 51, repeatUsage: 66, dormancy: 16, growthRate: 19 },
      { month: 'Q1', activePct: 50, inactivePct: 50, repeatUsage: 68, dormancy: 16, growthRate: 20 },
    ];
  } else if (grain === 'quarter') {
    transactionMonthly = MONTH_TXN.slice(0, 3);
    retentionMonthly = MONTH_RET.slice(0, 3);
  } else if (grain === 'weeks') {
    transactionMonthly = weekTxnRows();
    retentionMonthly = weekRetRows();
  } else if (grain === 'last24') {
    const d = MONTH_TXN[11];
    transactionMonthly = [
      {
        month: '24h',
        countL: round1(d.countL / 30),
        valueCr: round1(d.valueCr / 30),
        perUser: d.perUser,
        countLabel: `${round1(d.countL / 30)}L`,
      },
    ];
    retentionMonthly = [
      {
        month: '24h',
        activePct: 50,
        inactivePct: 50,
        repeatUsage: 68,
        dormancy: 16,
        growthRate: 20,
      },
    ];
  } else {
    transactionMonthly = MONTH_TXN;
    retentionMonthly = MONTH_RET;
  }

  const lastTxn = transactionMonthly[transactionMonthly.length - 1];

  const headline: GrowthHeadlineKpi[] = [
    {
      label: 'Toll volume (index)',
      v: String(g.northstar[g.northstar.length - 1]),
      d: grain === 'year' ? '+20% YoY' : grain === 'last24' ? '+5% vs prior 24h' : '+20% YoY',
      tone: 'green',
      color: '#059669',
    },
    {
      label: grain === 'last24' ? 'New tags (24h)' : 'New tags / mo',
      v: grain === 'last24' ? '6.1K' : grain === 'weeks' ? '42K' : '1.84L',
      d: '+8%',
      tone: 'blue',
      color: '#2563eb',
    },
    {
      label: 'Annual Pass attach',
      v: '31%',
      d: '+19 pts',
      tone: 'teal',
      color: '#0891b2',
    },
    {
      label: 'Txns / active tag',
      v: String(lastTxn.perUser),
      d: '+6%',
      tone: 'indigo',
      color: '#2563eb',
    },
  ];

  return {
    ...g,
    drivers,
    headline,
    transactionMonthly,
    retentionMonthly,
    lifecycleScale: g.lifecycleScale,
    driversInsight: g.driversInsight,
  };
}
