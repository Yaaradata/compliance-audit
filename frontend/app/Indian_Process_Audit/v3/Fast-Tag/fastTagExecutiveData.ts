/** Executive cockpit data — aligned with `fluid_fastag_v2.html` (CX + Business views). */

export type ExecKpiTone = 'good' | 'warn' | 'bad' | 'neutral';

export type ExecKpi = {
  label: string;
  value: string;
  badge: string;
  trend: string;
  sub?: string;
  tone: ExecKpiTone;
  spark: number[];
  sparkColor: string;
  accent: 'blue' | 'green' | 'red' | 'amber';
};

export const COH_KPIS: ExecKpi[] = [
  {
    label: 'CSAT Score',
    value: '71%',
    badge: '↓ 4 pts',
    trend: 'Degrading',
    sub: '· this week',
    tone: 'bad',
    spark: [76, 75, 75, 74, 73, 72, 71, 71],
    sparkColor: '#dc2626',
    accent: 'red',
  },
  {
    label: 'Open Complaints',
    value: '1,842',
    badge: '↑ 340',
    trend: '+340 today',
    sub: '· rising',
    tone: 'bad',
    spark: [900, 1100, 1300, 1420, 1580, 1700, 1842, 1842],
    sparkColor: '#d97706',
    accent: 'amber',
  },
  {
    label: 'Avg Resolution',
    value: '38m',
    badge: '+12m slower',
    trend: '↑ 46% vs baseline',
    sub: '· 26m',
    tone: 'bad',
    spark: [26, 27, 28, 30, 32, 35, 37, 38],
    sparkColor: '#dc2626',
    accent: 'red',
  },
  {
    label: 'First-Contact Fix',
    value: '58%',
    badge: '↑ 3 pts',
    trend: 'Improving',
    sub: '· target 65%',
    tone: 'good',
    spark: [52, 53, 54, 54, 55, 56, 57, 58],
    sparkColor: '#059669',
    accent: 'green',
  },
];

export const HOB_KPIS: ExecKpi[] = [
  {
    label: 'Monthly Revenue',
    value: '₹4.2Cr',
    badge: '↑ 8%',
    trend: 'On track',
    sub: '· ₹4.4Cr target',
    tone: 'good',
    spark: [2.8, 3.1, 3.0, 3.4, 3.6, 3.8, 3.9, 4.2],
    sparkColor: '#059669',
    accent: 'green',
  },
  {
    label: 'Active Tags',
    value: '2.1M',
    badge: '↑ 14K',
    trend: '+14K this week',
    sub: '· growing',
    tone: 'good',
    spark: [1.8, 1.85, 1.88, 1.92, 1.96, 2.0, 2.05, 2.1],
    sparkColor: '#2563eb',
    accent: 'blue',
  },
  {
    label: 'Recharge Conversion',
    value: '63%',
    badge: '↓ 5 pts',
    trend: 'Friction detected',
    sub: '· UPI timeout',
    tone: 'bad',
    spark: [68, 68, 67, 66, 65, 65, 64, 63],
    sparkColor: '#d97706',
    accent: 'amber',
  },
  {
    label: 'Transaction Failures',
    value: '4.7%',
    badge: '+1.2 pts',
    trend: 'Above NPCI 3% limit',
    sub: '· escalate',
    tone: 'bad',
    spark: [2.8, 3.1, 3.4, 3.8, 4.0, 4.2, 4.5, 4.7],
    sparkColor: '#dc2626',
    accent: 'red',
  },
];

export const COMPLAINT_WEEK = [
  { day: 'Mon', rechargeFail: 210, balMismatch: 80, refundDelay: 150 },
  { day: 'Tue', rechargeFail: 280, balMismatch: 110, refundDelay: 180 },
  { day: 'Wed', rechargeFail: 340, balMismatch: 160, refundDelay: 200 },
  { day: 'Thu', rechargeFail: 410, balMismatch: 240, refundDelay: 250 },
  { day: 'Fri', rechargeFail: 490, balMismatch: 330, refundDelay: 300 },
  { day: 'Sat', rechargeFail: 530, balMismatch: 380, refundDelay: 340 },
  { day: 'Today', rechargeFail: 614, balMismatch: 441, refundDelay: 388 },
];

export const CSAT_RESOLUTION_WEEK = [
  { day: 'Mon', resolutionMin: 26, csat: 78 },
  { day: 'Tue', resolutionMin: 27, csat: 77 },
  { day: 'Wed', resolutionMin: 28, csat: 76 },
  { day: 'Thu', resolutionMin: 31, csat: 75 },
  { day: 'Fri', resolutionMin: 34, csat: 74 },
  { day: 'Sat', resolutionMin: 36, csat: 72 },
  { day: 'Today', resolutionMin: 38, csat: 71 },
];

export const REVENUE_WEEK = [
  { week: 'W1', actual: 2.8, target: 3.0 },
  { week: 'W2', actual: 3.1, target: 3.1 },
  { week: 'W3', actual: 3.0, target: 3.2 },
  { week: 'W4', actual: 3.4, target: 3.3 },
  { week: 'W5', actual: 3.6, target: 3.5 },
  { week: 'W6', actual: 3.8, target: 3.7 },
  { week: 'W7', actual: 3.9, target: 3.9 },
  { week: 'W8', actual: 4.2, target: 4.0 },
];

export const FAILURE_RATE_24H = [
  { slot: '00h', rate: 3.2 },
  { slot: '04h', rate: 3.5 },
  { slot: '08h', rate: 3.9 },
  { slot: '12h', rate: 4.1 },
  { slot: '16h', rate: 4.4 },
  { slot: '20h', rate: 4.6 },
  { slot: 'Now', rate: 4.7 },
];

export const REVENUE_SEGMENTS = [
  { name: 'Corporate Fleet', amount: '₹1.3Cr', pct: 88, delta: '+19%', tone: 'good' as const },
  { name: 'Retail Consumers', amount: '₹1.8Cr', pct: 72, delta: '−3%', tone: 'bad' as const },
  { name: 'Logistics Partners', amount: '₹0.9Cr', pct: 93, delta: '+11%', tone: 'good' as const },
  { name: 'Govt / NHAI', amount: '₹0.2Cr', pct: 55, delta: 'Flat', tone: 'neutral' as const },
];

export const REVENUE_DONUT = [
  { name: 'Corporate Fleet', value: 1.3, color: '#059669' },
  { name: 'Retail', value: 1.8, color: '#d97706' },
  { name: 'Logistics', value: 0.9, color: '#2563eb' },
  { name: 'Govt / NHAI', value: 0.2, color: '#94a3b8' },
];

export const ACTIVATION_FUNNEL = [
  { step: 'Sign-up', count: 10000, pct: 100, drop: '', highlight: false },
  { step: 'KYC Init', count: 8200, pct: 82, drop: '−18%', highlight: false },
  { step: 'Doc Upload', count: 6100, pct: 61, drop: '−21%', highlight: false },
  { step: 'Selfie Step', count: 3800, pct: 38, drop: '−38%', highlight: true },
  { step: 'Activated', count: 3200, pct: 32, drop: '−16%', highlight: false },
];

export const COH_FAILING_PLAZAS = [
  { plaza: 'Pune East NH-65', volume: 312, barPct: 82, cause: 'Lane Reader', status: 'Critical' as const },
  { plaza: 'Delhi NH-8 Toll', volume: 278, barPct: 73, cause: 'Balance Sync', status: 'Critical' as const },
  { plaza: 'Hyd ORR Plaza 4', volume: 194, barPct: 51, cause: 'Recharge', status: 'Watch' as const },
  { plaza: 'Mumbai E-way 12', volume: 98, barPct: 26, cause: 'UPI Timeout', status: 'Stable' as const },
];

export const COH_DECISIONS = [
  {
    title: 'Approve UPI fix deploy',
    desc: '3s timeout → 34% recharge failures. Eng ready. +8 pts CSAT.',
    impact: '+8 pts',
    accent: 'red' as const,
    primary: true,
  },
  {
    title: 'Clear ₹1.2Cr refund backlog',
    desc: 'Avg 9-day wait. 400 resolvable today with override. +5 pts.',
    impact: '+5 pts',
    accent: 'amber' as const,
    primary: false,
  },
  {
    title: 'Enable low-balance SMS alerts',
    desc: 'Prevents ~600 surprise-at-toll/day. Toggle ready. +4 pts.',
    impact: '+4 pts',
    accent: 'green' as const,
    primary: false,
  },
];

export const HOB_RISKS = [
  {
    num: '01',
    title: 'Txn failure 4.7% — NPCI limit is 3%',
    desc: 'Bank gateway latency. Fix ETA 48h. CTO sign-off needed today.',
    value: '4.7%',
    tone: 'bad' as const,
    action: 'Escalate',
  },
  {
    num: '02',
    title: 'DHL, Mahindra, BlueDart renewals in 30d',
    desc: '₹92L annual. No renewal conversation logged yet.',
    value: '₹92L',
    tone: 'warn' as const,
    action: 'Brief',
  },
  {
    num: '03',
    title: 'Competitor 0% MDR offer — Maharashtra',
    desc: '3 fleet accounts comparing. Response window closing.',
    value: '3 accts',
    tone: 'info' as const,
    action: 'Counter',
  },
];

const HM_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/** Deterministic heatmap for stable UI. */
export function getComplaintHeatmap(): { day: string; hour: number; intensity: number }[] {
  const seed = [
    [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.7, 0.85, 0.9, 0.75],
    [0.22, 0.28, 0.32, 0.38, 0.42, 0.48, 0.52, 0.58, 0.72, 0.88, 0.92, 0.78],
    [0.18, 0.24, 0.3, 0.36, 0.4, 0.46, 0.5, 0.56, 0.68, 0.82, 0.88, 0.72],
    [0.2, 0.26, 0.32, 0.38, 0.44, 0.5, 0.54, 0.6, 0.74, 0.86, 0.9, 0.76],
    [0.24, 0.3, 0.36, 0.42, 0.48, 0.54, 0.58, 0.64, 0.78, 0.9, 0.95, 0.8],
    [0.3, 0.36, 0.42, 0.48, 0.54, 0.6, 0.65, 0.7, 0.82, 0.88, 0.85, 0.7],
    [0.28, 0.34, 0.4, 0.46, 0.52, 0.58, 0.62, 0.68, 0.8, 0.86, 0.82, 0.68],
  ];
  const cells: { day: string; hour: number; intensity: number }[] = [];
  seed.forEach((row, d) => {
    row.forEach((intensity, h) => {
      cells.push({ day: HM_DAYS[d], hour: h * 2, intensity });
    });
  });
  return cells;
}

export const LIVE_TICKER_ITEMS = [
  { label: 'CSAT', value: '71%', tone: 'bad' as const },
  { label: 'Open complaints', value: '1,842', tone: 'warn' as const },
  { label: 'Txn failure', value: '4.7%', tone: 'bad' as const },
  { label: 'NPCI gateway', value: '99.2%', tone: 'good' as const },
  { label: 'Refund backlog', value: '₹1.2Cr', tone: 'warn' as const },
  { label: 'Active tags', value: '2.1M', tone: 'good' as const },
];
