import type { DrillPeriodGrain } from './fastTagDrillPeriod';

export type IssuesHeadlineKpi = {
  label: string;
  v: string;
  d: string;
  tone: string;
  color: string;
};

export type IssuesImpactRow = {
  issue: string;
  vol: string;
  volD: string;
  affected: string;
  risk: string;
  churn: 'High' | 'Med' | 'Low';
  sev: 'Critical' | 'High' | 'Watch';
};

export type ComplaintSlice = {
  cat: string;
  pct: number;
  d: string;
  color: string;
  volume: string;
};

export type HappinessMetric = {
  label: string;
  barPct: number;
  display: string;
  target: number;
  sub: string;
  color: string;
};

export type PartnerRow = {
  name: string;
  role: string;
  sla: number;
  err: string;
  cases: string;
  exp: string;
  sev: 'Critical' | 'High' | 'Watch';
};

export type ChurnMetric = {
  label: string;
  display: string;
  sub: string;
  color: string;
};

export type RootCauseSlice = {
  cause: string;
  share: number;
  color: string;
};

export type ActionRow = {
  act: string;
  owner: string;
  impact: string;
  sev: 'Critical' | 'High' | 'Watch';
};

export type SentimentPoint = {
  label: string;
  mentions: number;
};

export type IssuesPeriodSnapshot = {
  grain: DrillPeriodGrain;
  caption: string;
  trend: number[];
  trendHint: string;
  headline: IssuesHeadlineKpi[];
  impact: IssuesImpactRow[];
  impactInsight: string;
  complaints: ComplaintSlice[];
  complaintInsight: string;
  happiness: HappinessMetric[];
  happinessInsight: string;
  partners: PartnerRow[];
  partnerInsight: string;
  churn: ChurnMetric[];
  churnNote: string;
  churnInsight: string;
  sentiment: SentimentPoint[];
  sentimentInsight: string;
  sentimentTag: string;
  rootCauses: RootCauseSlice[];
  actions: ActionRow[];
  actionsInsight: string;
};

const BASE_TREND = [70, 68, 71, 66, 69, 64, 67, 63, 65, 60, 59];

const BASE_IMPACT: IssuesImpactRow[] = [
  { issue: 'Double deduction', vol: '1,420', volD: '+38%', affected: '8,900 tags', risk: '₹47L', churn: 'High', sev: 'Critical' },
  { issue: 'Blacklist on low balance', vol: '980', volD: '+62%', affected: '6,200 tags', risk: '₹31L', churn: 'High', sev: 'Critical' },
  { issue: 'Recharge / wallet failure', vol: '1,180', volD: '+24%', affected: '4,800 wallets', risk: '₹28L', churn: 'Med', sev: 'High' },
  { issue: 'KYC / activation stall', vol: '760', volD: '+17%', affected: '4,300 tags', risk: '₹18L', churn: 'Med', sev: 'High' },
  { issue: 'Tag mis-read at plaza', vol: '540', volD: '+9%', affected: '2,100 tags', risk: '₹9L', churn: 'Low', sev: 'Watch' },
];

const BASE_COMPLAINTS: ComplaintSlice[] = [
  { cat: 'Double deduction', pct: 27, d: '+38%', color: '#dc2626', volume: '1,420' },
  { cat: 'Recharge failure', pct: 22, d: '+24%', color: '#dc2626', volume: '1,180' },
  { cat: 'Blacklist / low balance', pct: 19, d: '+62%', color: '#d97706', volume: '980' },
  { cat: 'KYC / activation', pct: 14, d: '+17%', color: '#d97706', volume: '760' },
  { cat: 'Plaza mis-read', pct: 10, d: '+9%', color: '#2563eb', volume: '540' },
  { cat: 'Others', pct: 8, d: '-3%', color: '#64748b', volume: '420' },
];

const BASE_HAPPINESS: HappinessMetric[] = [
  { label: 'Customer happy', barPct: 62, display: '62%', target: 75, sub: 'positive experience', color: '#d97706' },
  { label: 'Partner happy', barPct: 54, display: '54%', target: 70, sub: 'meet joint SLA', color: '#dc2626' },
  { label: 'Unhappy customers', barPct: 72, display: '4.9K', target: 35, sub: 'open complaints', color: '#dc2626' },
  { label: 'Partners strained', barPct: 60, display: '18', target: 8, sub: 'below happiness bar', color: '#d97706' },
];

const BASE_PARTNERS: PartnerRow[] = [
  { name: 'Acquirer Bank A', role: 'Toll acquirer', sla: 62, err: '4.8%', cases: '640', exp: '₹22L', sev: 'Critical' },
  { name: 'Payment Gateway', role: 'Recharge / UPI', sla: 71, err: '3.1%', cases: '410', exp: '₹14L', sev: 'High' },
  { name: 'Issuing Bank B', role: 'Tag issuance', sla: 88, err: '1.2%', cases: '120', exp: '₹4L', sev: 'Watch' },
  { name: 'BPO Vendor Beta', role: 'KYC / support', sla: 58, err: '6.0%', cases: '310', exp: '₹11L', sev: 'Critical' },
];

const BASE_SENTIMENT: SentimentPoint[] = [
  { label: 'W1', mentions: 40 },
  { label: 'W2', mentions: 44 },
  { label: 'W3', mentions: 42 },
  { label: 'W4', mentions: 50 },
  { label: 'W5', mentions: 48 },
  { label: 'W6', mentions: 58 },
  { label: 'W7', mentions: 62 },
  { label: 'W8', mentions: 70 },
  { label: 'W9', mentions: 66 },
  { label: 'W10', mentions: 78 },
  { label: 'W11', mentions: 84 },
];

const BASE_ROOT: RootCauseSlice[] = [
  { cause: 'Plaza reader / acquirer reconciliation', share: 34, color: '#dc2626' },
  { cause: 'Payment gateway timeouts', share: 26, color: '#d97706' },
  { cause: 'Vendor KYC backlog', share: 22, color: '#d97706' },
  { cause: 'Process / first-response gap', share: 18, color: '#2563eb' },
];

const BASE_ACTIONS: ActionRow[] = [
  { act: 'Auto-reverse duplicate charges + acquirer reconciliation SLA', owner: 'Ops + Acquirer A', impact: '₹47L recovered, churn -high', sev: 'Critical' },
  { act: 'Fail-over gateway + proactive recharge-fail notifications', owner: 'Payments', impact: '₹28L protected', sev: 'Critical' },
  { act: 'KAM retention outreach to 12 at-risk fleet accounts', owner: 'Sales / KAM', impact: '₹4.2M spend retained', sev: 'Critical' },
  { act: 'Publish auto-recharge FAQ + influencer comms on blacklist', owner: 'Marketing / CX', impact: 'Reputation + new-acq drag', sev: 'High' },
  { act: 'Reroute high-value KYC off Vendor Beta to in-house pod', owner: 'CX Ops', impact: '₹18L activation unblocked', sev: 'High' },
];

const GRAIN: Record<
  DrillPeriodGrain,
  Pick<IssuesPeriodSnapshot, 'caption' | 'trendHint' | 'impactInsight' | 'complaintInsight' | 'happinessInsight' | 'partnerInsight' | 'churnInsight' | 'sentimentInsight' | 'actionsInsight' | 'churnNote' | 'sentimentTag'>
> = {
  year: {
    caption: 'FY view',
    trendHint: 'Happiness index down 9 pts YoY — acquirer outage and recharge failures drove the dip.',
    impactInsight: 'Double deduction and blacklist disputes dominate annual complaint exposure',
    complaintInsight: 'Wallet and duplicate-charge themes explain over half of complaint volume',
    happinessInsight: 'Customer and partner happiness sit well below annual targets',
    partnerInsight: 'Acquirer and BPO partners are the weakest links in ecosystem happiness',
    churnInsight: '12 fleet accounts signal closure intent after unresolved disputes',
    churnNote: 'Closure-intent signals rose from 7 → 18 cases YoY, concentrated in double-deduction and recharge-failure tickets.',
    sentimentInsight: 'Negative social mentions accelerated after week-8 acquirer outage',
    sentimentTag: '#FASTagFail ↑ 287% (48h)',
    actionsInsight: 'Prioritized actions to restore customer and partner happiness',
  },
  quarter: {
    caption: 'Q1 view',
    trendHint: 'Happiness dipped after acquirer outage in week 8 of the quarter.',
    impactInsight: 'These issues hurt customer and partner happiness the most',
    complaintInsight: 'Top drivers of unhappy customers — wallet and duplicate-charge themes',
    happinessInsight: 'Customer and partner happiness sit well below target',
    partnerInsight: 'Which partners are hurting ecosystem happiness',
    churnInsight: '12 key customers signal they may leave after poor experience',
    churnNote: 'Closure-intent signals rose from 7 → 18 cases. Retention window: act within 48h.',
    sentimentInsight: 'Public sentiment is turning negative — customers are not happy',
    sentimentTag: '#FASTagFail ↑ 287% (48h)',
    actionsInsight: 'Actions to restore customer and partner happiness',
  },
  month: {
    caption: 'Month view',
    trendHint: 'Customer and partner satisfaction dipped after acquirer outage in week 8.',
    impactInsight: 'These issues hurt customer and partner happiness the most',
    complaintInsight: 'Top drivers of unhappy customers — wallet and duplicate-charge themes',
    happinessInsight: 'Customer and partner happiness sit well below target',
    partnerInsight: 'Which partners are hurting ecosystem happiness',
    churnInsight: '12 key customers signal they may leave after poor experience',
    churnNote: 'Closure-intent signals rose from 7 → 18 cases. Retention window: act within 48h.',
    sentimentInsight: 'Public sentiment is turning negative — customers are not happy',
    sentimentTag: '#FASTagFail ↑ 287% (48h)',
    actionsInsight: 'Actions to restore customer and partner happiness',
  },
  weeks: {
    caption: '11-week view',
    trendHint: 'Customer and partner satisfaction dipped after acquirer outage in week 8.',
    impactInsight: 'These issues hurt customer and partner happiness the most',
    complaintInsight: 'Top drivers of unhappy customers — wallet and duplicate-charge themes',
    happinessInsight: 'Customer and partner happiness sit well below target',
    partnerInsight: 'Which partners are hurting ecosystem happiness',
    churnInsight: '12 key customers signal they may leave after poor experience',
    churnNote: 'Closure-intent signals rose from 7 → 18 cases. Retention window: act within 48h.',
    sentimentInsight: 'Public sentiment is turning negative — customers are not happy',
    sentimentTag: '#FASTagFail ↑ 287% (48h)',
    actionsInsight: 'Actions to restore customer and partner happiness',
  },
  last24: {
    caption: 'Last 24h',
    trendHint: 'Happiness pressure concentrated in recharge failures and duplicate-charge tickets overnight.',
    impactInsight: 'Last-24h issues with highest happiness drag',
    complaintInsight: 'Complaint mix in the last 24 hours',
    happinessInsight: 'Real-time happiness gauges vs target',
    partnerInsight: 'Partner strain in the last 24 hours',
    churnInsight: 'At-risk accounts flagged in the last 24h',
    churnNote: '3 new closure-intent signals in the last 24h tied to recharge failures.',
    sentimentInsight: 'Social mentions spiking in the last 48h',
    sentimentTag: '#FASTagFail ↑ 42% (24h)',
    actionsInsight: 'Immediate actions for customer and partner happiness',
  },
};

function sliceTrend(trend: number[], grain: DrillPeriodGrain): number[] {
  if (grain === 'last24') return trend.slice(-2);
  if (grain === 'quarter') return trend.slice(0, 6);
  if (grain === 'year') return [62, 64, 61, 58, 59];
  return trend;
}

function sliceSentiment(points: SentimentPoint[], grain: DrillPeriodGrain): SentimentPoint[] {
  if (grain === 'last24') return points.slice(-2).map((p, i) => ({ label: i === 0 ? 'Prior' : 'Now', mentions: p.mentions }));
  if (grain === 'quarter') return points.slice(0, 6);
  if (grain === 'year') return [
    { label: 'Q1', mentions: 48 },
    { label: 'Q2', mentions: 55 },
    { label: 'Q3', mentions: 62 },
    { label: 'Q4', mentions: 84 },
  ];
  return points;
}

export function buildIssuesPeriodSnapshot(grain: DrillPeriodGrain): IssuesPeriodSnapshot {
  const g = GRAIN[grain];
  const trend = sliceTrend(BASE_TREND, grain);

  const headline: IssuesHeadlineKpi[] = [
    { label: 'Customer happy', v: '62%', d: 'vs 75% tgt', tone: 'amber', color: '#d97706' },
    { label: 'Partner happy', v: '54%', d: 'vs 70% tgt', tone: 'red', color: '#dc2626' },
    { label: 'Open complaints', v: grain === 'last24' ? '186' : '4.9K', d: '+38%', tone: 'red', color: '#dc2626' },
    { label: 'Would recommend', v: '41%', d: 'NPS proxy', tone: 'violet', color: '#7c3aed' },
  ];

  const churn: ChurnMetric[] = [
    { label: 'At-risk accounts', display: grain === 'last24' ? '3 fleets' : '12 fleets', sub: 'closure intent signals', color: '#dc2626' },
    { label: 'Spend at risk', display: '₹4.2M', sub: '↑ 56% vs last week', color: '#d97706' },
    { label: 'Unresolved disputes', display: grain === 'last24' ? '6 cases' : '18 cases', sub: 'closure intent ↑ from 7', color: '#dc2626' },
  ];

  return {
    grain,
    caption: g.caption,
    trend,
    trendHint: g.trendHint,
    headline,
    impact: BASE_IMPACT,
    impactInsight: g.impactInsight,
    complaints: BASE_COMPLAINTS,
    complaintInsight: g.complaintInsight,
    happiness: BASE_HAPPINESS,
    happinessInsight: g.happinessInsight,
    partners: BASE_PARTNERS,
    partnerInsight: g.partnerInsight,
    churn,
    churnNote: g.churnNote,
    churnInsight: g.churnInsight,
    sentiment: sliceSentiment(BASE_SENTIMENT, grain),
    sentimentInsight: g.sentimentInsight,
    sentimentTag: g.sentimentTag,
    rootCauses: BASE_ROOT,
    actions: BASE_ACTIONS,
    actionsInsight: g.actionsInsight,
  };
}
