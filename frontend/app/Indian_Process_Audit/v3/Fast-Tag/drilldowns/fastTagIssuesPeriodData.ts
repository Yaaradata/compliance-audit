import type { DrillPeriodGrain } from './fastTagDrillPeriod';
import { buildStateComplaintData, type StateComplaintDatum } from './fastTagIssuesStateComplaints';

export type IssuesHeadlineKpi = {
  label: string;
  v: string;
  d: string;
  tone: string;
  color: string;
};

/** Q1 — Is customer experience improving or getting worse? */
export type CxTrendPoint = {
  label: string;
  customer: number;
  partner: number;
};

export type CxDriver = {
  metric: string;
  now: string;
  prior: string;
  delta: string;
  worsening: boolean;
};

export type CxExperienceData = {
  verdict: string;
  direction: 'worse' | 'better' | 'flat';
  summary: string;
  target: number;
  cadence: 'monthly';
  trend: CxTrendPoint[];
  drivers: CxDriver[];
};

/** Q2 — Are complaints increasing in any region/channel? */
export type ComplaintRegionBar = {
  region: string;
  current: number;
  prior: number;
  deltaPct: number;
  topIssue: string;
};

export type ComplaintChannelBar = {
  channel: string;
  current: number;
  prior: number;
  deltaPct: number;
  sharePct: number;
};

export type IndiaOverallSummary = {
  complaints: number;
  prior: number;
  deltaPct: number;
  risingRegions: number;
  totalRegions: number;
  criticalStates: number;
  topIssue: string;
  topChannel: string;
  topRegion: string;
  topRegionDeltaPct: number;
  channelSpikePct: number;
  worstState: string;
  statesTracked: number;
  slaAtRisk: number;
};

export type ComplaintSpikeData = {
  verdict: string;
  summary: string;
  regions: ComplaintRegionBar[];
  channels: ComplaintChannelBar[];
  stateComplaints: StateComplaintDatum[];
  overall: IndiaOverallSummary;
};

/** Q3 — Where are we losing customers & partners? */
export type CustomerLossRow = {
  segment: string;
  atRisk: number;
  churned30d: number;
  spendAtRisk: string;
  driver: string;
  severity: 'Critical' | 'High' | 'Watch';
};

export type PartnerLossRow = {
  partner: string;
  role: string;
  health: number;
  cases: number;
  signal: string;
  severity: 'Critical' | 'High' | 'Watch';
};

export type AttritionData = {
  verdict: string;
  summary: string;
  customers: CustomerLossRow[];
  partners: PartnerLossRow[];
  totals: { atRiskAccounts: number; spendAtRisk: string; strainedPartners: number };
};

/** Q4 — Complaints vs resolving — case-level backlog */
export type ComplaintResolutionStatus = 'Open' | 'In progress' | 'Resolved' | 'Escalated';

export type ComplaintSlaStatus = 'Within SLA' | 'At risk' | 'Breached';

export type ComplaintCaseRow = {
  id: string;
  issue: string;
  customer: string;
  region: string;
  channel: string;
  status: ComplaintResolutionStatus;
  age: string;
  sla: ComplaintSlaStatus;
  owner: string;
  resolutionTime: string;
  severity: 'Critical' | 'High' | 'Watch';
};

export type ResolutionSummary = {
  total: number;
  open: number;
  resolved: number;
  breached: number;
  clearBacklogDays: number;
};

export type ResolutionThroughputData = {
  verdict: string;
  summary: string;
  summaryStats: ResolutionSummary;
  complaints: ComplaintCaseRow[];
};

/** Q4 — What % of users are giving low ratings (1–2 stars)? */
export type StarRatingSlice = {
  stars: 1 | 2 | 3 | 4 | 5;
  pct: number;
  color: string;
};

export type RatingBand = 'low' | 'med' | 'high';

export type LowRatingSegmentRow = {
  segment: string;
  lowPct: number;
  medPct: number;
  highPct: number;
  oneStarPct: number;
  responses: number;
  drivers: Record<RatingBand, string>;
};

export type LowRatingData = {
  verdict: string;
  summary: string;
  lowPct: number;
  oneStarPct: number;
  twoStarPct: number;
  priorLowPct: number;
  deltaPts: number;
  totalResponses: number;
  distribution: StarRatingSlice[];
  segments: LowRatingSegmentRow[];
};

export type IssuesPeriodSnapshot = {
  grain: DrillPeriodGrain;
  caption: string;
  headline: IssuesHeadlineKpi[];
  q1: CxExperienceData;
  q2: ComplaintSpikeData;
  q3: AttritionData;
  q4: ResolutionThroughputData;
  q5: LowRatingData;
};

/** FY monthly CX trend — customer & partner scores tracked month-on-month. */
const CX_TREND_12M: CxTrendPoint[] = [
  { label: 'Apr', customer: 72, partner: 70 },
  { label: 'May', customer: 71, partner: 69 },
  { label: 'Jun', customer: 69, partner: 67 },
  { label: 'Jul', customer: 68, partner: 66 },
  { label: 'Aug', customer: 66, partner: 64 },
  { label: 'Sep', customer: 65, partner: 62 },
  { label: 'Oct', customer: 64, partner: 60 },
  { label: 'Nov', customer: 62, partner: 58 },
  { label: 'Dec', customer: 61, partner: 56 },
  { label: 'Jan', customer: 60, partner: 55 },
  { label: 'Feb', customer: 59, partner: 54 },
  { label: 'Mar', customer: 59, partner: 54 },
];

const COMPLAINT_CASES_LAST24: ComplaintCaseRow[] = [
  { id: 'CMP-28471', issue: 'Double deduction', customer: 'Fleet TSP · 48 tags', region: 'South', channel: 'B2B portal', status: 'Open', age: '6h', sla: 'At risk', owner: 'L2 — Recon', resolutionTime: '—', severity: 'Critical' },
  { id: 'CMP-28468', issue: 'Recharge failure loop', customer: 'Retail wallet · ₹1.1M GTV', region: 'West', channel: 'B2C app', status: 'In progress', age: '4h', sla: 'Within SLA', owner: 'L1 — Payments', resolutionTime: '—', severity: 'High' },
  { id: 'CMP-28462', issue: 'Tag not read at toll', customer: 'Annual pass · 2 tags', region: 'North', channel: 'Toll plaza', status: 'Escalated', age: '9h', sla: 'Breached', owner: 'L3 — NPCI', resolutionTime: '—', severity: 'Critical' },
  { id: 'CMP-28459', issue: 'Wrong class deduction', customer: 'B2B fleet · 12 tags', region: 'East', channel: 'B2B portal', status: 'Open', age: '3h', sla: 'Within SLA', owner: 'L2 — Recon', resolutionTime: '—', severity: 'High' },
  { id: 'CMP-28455', issue: 'KYC activation stall', customer: 'New user · <90d', region: 'South', channel: 'Dealer app', status: 'In progress', age: '5h', sla: 'Within SLA', owner: 'L1 — KYC', resolutionTime: '—', severity: 'Watch' },
  { id: 'CMP-28451', issue: 'Wallet refund delay', customer: 'Retail wallet', region: 'West', channel: 'B2C app', status: 'Resolved', age: '11h', sla: 'Within SLA', owner: 'L1 — Payments', resolutionTime: '3.2h', severity: 'Watch' },
  { id: 'CMP-28448', issue: 'Blacklist appeal', customer: 'Annual pass holder', region: 'Central', channel: 'Call centre', status: 'Open', age: '7h', sla: 'At risk', owner: 'L2 — Compliance', resolutionTime: '—', severity: 'High' },
  { id: 'CMP-28444', issue: 'Partner recon mismatch', customer: 'Acquirer Bank A', region: 'National', channel: 'Partner API', status: 'Escalated', age: '12h', sla: 'Breached', owner: 'L3 — Banking', resolutionTime: '—', severity: 'Critical' },
  { id: 'CMP-28440', issue: 'UPI timeout on recharge', customer: 'Retail wallet', region: 'North', channel: 'B2C app', status: 'Resolved', age: '8h', sla: 'Within SLA', owner: 'L1 — Payments', resolutionTime: '2.1h', severity: 'Watch' },
  { id: 'CMP-28436', issue: 'Low balance false alert', customer: 'B2B fleet · 6 tags', region: 'South', channel: 'SMS alert', status: 'Resolved', age: '6h', sla: 'Within SLA', owner: 'L1 — Ops', resolutionTime: '1.4h', severity: 'Watch' },
  { id: 'CMP-28432', issue: 'Tag replacement delay', customer: 'Retail · 1 tag', region: 'East', channel: 'Dealer app', status: 'In progress', age: '2h', sla: 'Within SLA', owner: 'L1 — Issuance', resolutionTime: '—', severity: 'Watch' },
  { id: 'CMP-28428', issue: 'Duplicate toll charge', customer: 'Fleet TSP · 22 tags', region: 'West', channel: 'Toll plaza', status: 'Open', age: '1h', sla: 'Within SLA', owner: 'L2 — Recon', resolutionTime: '—', severity: 'High' },
];

const COMPLAINT_CASES_PERIOD: ComplaintCaseRow[] = [
  ...COMPLAINT_CASES_LAST24,
  { id: 'CMP-28390', issue: 'Double deduction', customer: 'Fleet TSP · 120 tags', region: 'South', channel: 'B2B portal', status: 'Resolved', age: '2.1d', sla: 'Within SLA', owner: 'L2 — Recon', resolutionTime: '1.8d', severity: 'Critical' },
  { id: 'CMP-28382', issue: 'Recharge failure loop', customer: 'Retail wallet · ₹0.6M GTV', region: 'North', channel: 'B2C app', status: 'Resolved', age: '3.4d', sla: 'Within SLA', owner: 'L1 — Payments', resolutionTime: '2.2d', severity: 'High' },
  { id: 'CMP-28374', issue: 'BPO queue overflow', customer: 'Multi-channel', region: 'National', channel: 'Call centre', status: 'Open', age: '4.2d', sla: 'Breached', owner: 'L3 — Vendor Beta', resolutionTime: '—', severity: 'Critical' },
  { id: 'CMP-28366', issue: 'NPCI settlement lag', customer: 'Issuing Bank B', region: 'National', channel: 'Partner API', status: 'In progress', age: '3.8d', sla: 'At risk', owner: 'L3 — NPCI', resolutionTime: '—', severity: 'High' },
  { id: 'CMP-28358', issue: 'Tag not read at toll', customer: 'B2B fleet · 34 tags', region: 'East', channel: 'Toll plaza', status: 'Resolved', age: '5.1d', sla: 'Within SLA', owner: 'L2 — Ops', resolutionTime: '2.9d', severity: 'High' },
  { id: 'CMP-28350', issue: 'Wrong class deduction', customer: 'Annual pass · 4 tags', region: 'Central', channel: 'Toll plaza', status: 'Open', age: '2.6d', sla: 'At risk', owner: 'L2 — Recon', resolutionTime: '—', severity: 'High' },
  { id: 'CMP-28342', issue: 'KYC document reject', customer: 'New user · <90d', region: 'West', channel: 'Dealer app', status: 'Resolved', age: '6.2d', sla: 'Within SLA', owner: 'L1 — KYC', resolutionTime: '4.1d', severity: 'Watch' },
  { id: 'CMP-28334', issue: 'Wallet refund delay', customer: 'Retail wallet', region: 'South', channel: 'B2C app', status: 'Escalated', age: '5.8d', sla: 'Breached', owner: 'L2 — Payments', resolutionTime: '—', severity: 'High' },
  { id: 'CMP-28326', issue: 'Blacklist appeal', customer: 'B2B fleet · 8 tags', region: 'North', channel: 'Call centre', status: 'In progress', age: '1.9d', sla: 'Within SLA', owner: 'L2 — Compliance', resolutionTime: '—', severity: 'Watch' },
  { id: 'CMP-28318', issue: 'Partner recon mismatch', customer: 'Payment Gateway', region: 'National', channel: 'Partner API', status: 'Open', age: '3.1d', sla: 'At risk', owner: 'L3 — Banking', resolutionTime: '—', severity: 'Critical' },
  { id: 'CMP-28310', issue: 'UPI timeout on recharge', customer: 'Retail wallet', region: 'East', channel: 'B2C app', status: 'Resolved', age: '4.5d', sla: 'Within SLA', owner: 'L1 — Payments', resolutionTime: '1.6d', severity: 'Watch' },
  { id: 'CMP-28302', issue: 'Low balance false alert', customer: 'Fleet TSP · 18 tags', region: 'West', channel: 'SMS alert', status: 'Resolved', age: '7.1d', sla: 'Within SLA', owner: 'L1 — Ops', resolutionTime: '3.0d', severity: 'Watch' },
];

function sliceComplaintCases(grain: DrillPeriodGrain): ComplaintCaseRow[] {
  if (grain === 'last24') return COMPLAINT_CASES_LAST24;
  return COMPLAINT_CASES_PERIOD;
}

function sliceCxTrend(grain: DrillPeriodGrain): CxTrendPoint[] {
  if (grain === 'last24') return CX_TREND_12M.slice(-2);
  if (grain === 'quarter') return CX_TREND_12M.slice(-3);
  if (grain === 'month') return CX_TREND_12M.slice(-6);
  if (grain === 'weeks') return CX_TREND_12M.slice(-4);
  if (grain === 'year') return CX_TREND_12M;
  return CX_TREND_12M.slice(-6);
}

function buildQ1(grain: DrillPeriodGrain): CxExperienceData {
  const trend = sliceCxTrend(grain);
  const first = trend[0];
  const last = trend[trend.length - 1];
  const delta = last.customer - first.customer;

  return {
    verdict: delta < -3 ? `Getting worse · ${delta} pts` : delta > 3 ? `Improving · +${delta} pts` : `Flat · ${delta >= 0 ? '+' : ''}${delta} pts`,
    direction: delta < -3 ? 'worse' : delta > 3 ? 'better' : 'flat',
    summary:
      grain === 'last24'
        ? 'Feb→Mar monthly read shows recharge failures pulling customer CX down 1 pt.'
        : 'Customer experience deteriorated month-on-month from Oct — partner score fell in parallel.',
    target: 75,
    cadence: 'monthly',
    trend,
    drivers: [
      { metric: 'CSAT (resolved cases)', now: '62%', prior: '71%', delta: '−9 pts', worsening: true },
      { metric: 'NPS proxy', now: '41%', prior: '48%', delta: '−7 pts', worsening: true },
      { metric: 'First-contact resolution', now: '54%', prior: '61%', delta: '−7 pts', worsening: true },
    ],
  };
}

function buildQ2(grain: DrillPeriodGrain): ComplaintSpikeData {
  const scale = grain === 'last24' ? 0.04 : 1;
  const regions: ComplaintRegionBar[] = [
    { region: 'West', current: Math.round(1420 * scale), prior: Math.round(1000 * scale), deltaPct: 42, topIssue: 'Double deduction' },
    { region: 'South', current: Math.round(980 * scale), prior: Math.round(765 * scale), deltaPct: 28, topIssue: 'Recharge failure' },
    { region: 'North', current: Math.round(760 * scale), prior: Math.round(639 * scale), deltaPct: 19, topIssue: 'KYC stall' },
    { region: 'East', current: Math.round(540 * scale), prior: Math.round(482 * scale), deltaPct: 12, topIssue: 'Plaza mis-read' },
    { region: 'Central', current: Math.round(410 * scale), prior: Math.round(380 * scale), deltaPct: 8, topIssue: 'Blacklist dispute' },
  ];
  const channels: ComplaintChannelBar[] = [
    { channel: 'B2C app / wallet', current: Math.round(1680 * scale), prior: Math.round(1244 * scale), deltaPct: 35, sharePct: 34 },
    { channel: 'Call centre / IVR', current: Math.round(1120 * scale), prior: Math.round(918 * scale), deltaPct: 22, sharePct: 23 },
    { channel: 'Partner / issuer', current: Math.round(890 * scale), prior: Math.round(601 * scale), deltaPct: 48, sharePct: 18 },
    { channel: 'Social / email', current: Math.round(640 * scale), prior: Math.round(398 * scale), deltaPct: 61, sharePct: 13 },
    { channel: 'B2B fleet portal', current: Math.round(420 * scale), prior: Math.round(368 * scale), deltaPct: 14, sharePct: 9 },
  ];

  const stateComplaints = buildStateComplaintData(grain);
  const complaints = stateComplaints.reduce((sum, s) => sum + s.complaints, 0);
  const prior = stateComplaints.reduce((sum, s) => sum + s.prior, 0);
  const deltaPct = prior > 0 ? Math.round(((complaints - prior) / prior) * 100) : 0;
  const topChannel = [...channels].sort((a, b) => b.deltaPct - a.deltaPct)[0];
  const topRegion = [...regions].sort((a, b) => b.deltaPct - a.deltaPct)[0];
  const worstState = [...stateComplaints].sort((a, b) => b.complaints - a.complaints)[0];

  return {
    verdict: 'Rising in 4/5 regions · 4/5 channels',
    summary: 'West and partner-issuer channels are the fastest accelerators — both crossed +30% threshold.',
    regions,
    channels,
    stateComplaints,
    overall: {
      complaints,
      prior,
      deltaPct,
      risingRegions: regions.filter((r) => r.deltaPct > 0).length,
      totalRegions: regions.length,
      criticalStates: stateComplaints.filter((s) => s.risk === 'critical' || s.risk === 'high').length,
      topIssue: topRegion?.topIssue ?? 'Double deduction',
      topChannel: topChannel?.channel ?? 'B2C app / wallet',
      topRegion: topRegion?.region ?? 'West',
      topRegionDeltaPct: topRegion?.deltaPct ?? 42,
      channelSpikePct: topChannel?.deltaPct ?? 61,
      worstState: worstState?.stateName ?? 'Maharashtra',
      statesTracked: stateComplaints.length,
      slaAtRisk: grain === 'last24' ? 18 : 142,
    },
  };
}

function buildQ3(grain: DrillPeriodGrain): AttritionData {
  const fleetAtRisk = grain === 'last24' ? 3 : 12;
  const fleetChurned = grain === 'last24' ? 0 : 4;

  return {
    verdict: `${fleetAtRisk} fleets at risk · 3 partners critical`,
    summary: 'Loss concentrated in B2B fleets and toll acquirer / BPO partners — dispute backlog is the common thread.',
    totals: {
      atRiskAccounts: fleetAtRisk,
      spendAtRisk: grain === 'last24' ? '₹0.8M' : '₹4.2M',
      strainedPartners: 3,
    },
    customers: [
      { segment: 'B2B fleet (TSP)', atRisk: fleetAtRisk, churned30d: fleetChurned, spendAtRisk: grain === 'last24' ? '₹0.8M' : '₹4.2M', driver: 'Unresolved double deduction', severity: 'Critical' },
      { segment: 'Retail wallet (high GTV)', atRisk: grain === 'last24' ? 8 : 34, churned30d: grain === 'last24' ? 1 : 9, spendAtRisk: '₹1.1M', driver: 'Recharge failure loop', severity: 'High' },
      { segment: 'Annual Pass holders', atRisk: grain === 'last24' ? 4 : 18, churned30d: grain === 'last24' ? 0 : 3, spendAtRisk: '₹0.4M', driver: 'Blacklist / low balance', severity: 'High' },
      { segment: 'New acquisition (<90d)', atRisk: grain === 'last24' ? 6 : 22, churned30d: grain === 'last24' ? 2 : 7, spendAtRisk: '₹0.2M', driver: 'KYC / activation stall', severity: 'Watch' },
    ],
    partners: [
      { partner: 'Acquirer Bank A', role: 'Toll acquirer', health: 62, cases: grain === 'last24' ? 28 : 640, signal: 'Recon SLA breach · issuer trust eroding', severity: 'Critical' },
      { partner: 'BPO Vendor Beta', role: 'KYC / support', health: 58, cases: grain === 'last24' ? 14 : 310, signal: 'Queue overflow · 6% error rate', severity: 'Critical' },
      { partner: 'Payment Gateway', role: 'Recharge / UPI', health: 71, cases: grain === 'last24' ? 18 : 410, signal: 'Timeout spike on peak hours', severity: 'High' },
      { partner: 'Issuing Bank B', role: 'Tag issuance', health: 88, cases: grain === 'last24' ? 4 : 120, signal: 'Stable — lowest strain', severity: 'Watch' },
    ],
  };
}

function buildQ5(grain: DrillPeriodGrain): LowRatingData {
  const oneStarPct = grain === 'last24' ? 11 : 14;
  const twoStarPct = grain === 'last24' ? 7 : 8;
  const lowPct = oneStarPct + twoStarPct;
  const priorLowPct = grain === 'last24' ? 15 : 19;

  const deltaPts = lowPct - priorLowPct;
  const totalResponses = grain === 'last24' ? 300 : 1600;

  return {
    verdict: `${lowPct}% rated 1–2 stars · ${deltaPts > 0 ? '+' : ''}${deltaPts} pts vs prior`,
    summary:
      'Low ratings cluster on B2B fleet and retail wallet journeys — double-deduction and recharge failure drive most 1-star scores.',
    lowPct,
    oneStarPct,
    twoStarPct,
    priorLowPct,
    deltaPts,
    totalResponses,
    distribution: [
      { stars: 1, pct: oneStarPct, color: '#dc2626' },
      { stars: 2, pct: twoStarPct, color: '#f97316' },
      { stars: 3, pct: grain === 'last24' ? 18 : 20, color: '#fbbf24' },
      { stars: 4, pct: grain === 'last24' ? 28 : 26, color: '#86efac' },
      { stars: 5, pct: grain === 'last24' ? 36 : 32, color: '#22c55e' },
    ],
    segments: [
      {
        segment: 'B2B fleet (TSP)',
        lowPct: grain === 'last24' ? 24 : 26,
        medPct: grain === 'last24' ? 20 : 22,
        highPct: grain === 'last24' ? 56 : 52,
        oneStarPct: 16,
        responses: grain === 'last24' ? 86 : 420,
        drivers: {
          low: 'Double deduction at toll · recon delay on fleet portal',
          med: 'Portal UX friction · delayed refund visibility',
          high: 'Bulk recharge reliability · dedicated fleet support lane',
        },
      },
      {
        segment: 'Retail wallet (high GTV)',
        lowPct: grain === 'last24' ? 19 : 21,
        medPct: grain === 'last24' ? 21 : 23,
        highPct: grain === 'last24' ? 60 : 56,
        oneStarPct: 12,
        responses: grain === 'last24' ? 124 : 680,
        drivers: {
          low: 'Recharge failure loop · UPI timeout on peak hours',
          med: 'Low-balance alerts · wallet sync lag after top-up',
          high: 'Fast UPI recharge · toll pass-through on first attempt',
        },
      },
      {
        segment: 'Annual Pass holders',
        lowPct: grain === 'last24' ? 14 : 16,
        medPct: grain === 'last24' ? 24 : 26,
        highPct: grain === 'last24' ? 62 : 58,
        oneStarPct: 8,
        responses: grain === 'last24' ? 52 : 290,
        drivers: {
          low: 'Blacklist dispute · tag read failures at plaza',
          med: 'Pass renewal reminders · plaza lane mismatch confusion',
          high: 'Seamless plaza reads · annual pass savings clarity',
        },
      },
      {
        segment: 'New acquisition (<90d)',
        lowPct: grain === 'last24' ? 17 : 18,
        medPct: grain === 'last24' ? 26 : 28,
        highPct: grain === 'last24' ? 57 : 54,
        oneStarPct: 10,
        responses: grain === 'last24' ? 38 : 210,
        drivers: {
          low: 'KYC activation stall · first-recharge friction',
          med: 'Onboarding steps unclear · dealer handoff gaps',
          high: 'Quick tag activation · guided first toll experience',
        },
      },
    ],
  };
}

function buildQ4(grain: DrillPeriodGrain): ResolutionThroughputData {
  const complaints = sliceComplaintCases(grain);
  const open = complaints.filter((row) => row.status !== 'Resolved').length;
  const resolved = complaints.filter((row) => row.status === 'Resolved').length;
  const breached = complaints.filter((row) => row.sla === 'Breached').length;
  const clearBacklogDays = grain === 'last24' ? 5 : 18;
  const keepingUp = resolved >= open;

  return {
    verdict: keepingUp ? 'Keeping up on resolutions' : `${open} open · ${breached} SLA breached`,
    summary: keepingUp
      ? `${resolved} of ${complaints.length} complaints closed — resolution pace matching intake.`
      : `${open} complaints still open with ${breached} past SLA — recon and payment queues need surge capacity.`,
    summaryStats: {
      total: complaints.length,
      open,
      resolved,
      breached,
      clearBacklogDays,
    },
    complaints,
  };
}

export function buildIssuesPeriodSnapshot(grain: DrillPeriodGrain): IssuesPeriodSnapshot {
  const q1 = buildQ1(grain);
  const q4 = buildQ4(grain);

  const headline: IssuesHeadlineKpi[] = [
    { label: 'CX score', v: `${q1.trend[q1.trend.length - 1].customer}%`, d: q1.verdict.split('·')[0].trim(), tone: q1.direction === 'worse' ? 'red' : 'green', color: q1.direction === 'worse' ? '#dc2626' : '#059669' },
    { label: 'Complaint inflow', v: grain === 'last24' ? '48' : '610/wk', d: '+38% vs prior', tone: 'red', color: '#dc2626' },
    { label: 'At-risk accounts', v: String(buildQ3(grain).totals.atRiskAccounts), d: buildQ3(grain).totals.spendAtRisk, tone: 'red', color: '#dc2626' },
    { label: 'Open complaints', v: String(q4.summaryStats.open), d: `${q4.summaryStats.breached} SLA breached`, tone: 'amber', color: '#d97706' },
  ];

  const captions: Record<DrillPeriodGrain, string> = {
    year: 'FY view',
    quarter: 'Q1 view',
    month: 'Month view',
    weeks: '11-week view',
    last24: 'Last 24h',
  };

  return {
    grain,
    caption: captions[grain],
    headline,
    q1,
    q2: buildQ2(grain),
    q3: buildQ3(grain),
    q4,
    q5: buildQ5(grain),
  };
}
