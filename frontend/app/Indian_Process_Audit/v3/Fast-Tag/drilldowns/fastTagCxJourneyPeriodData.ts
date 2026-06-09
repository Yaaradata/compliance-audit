import type { DrillPeriodGrain } from './fastTagDrillPeriod';

export type CxJourneyHeadlineKpi = {
  label: string;
  v: string;
  d: string;
  tone: string;
  color: string;
};

export type JourneyStage = {
  id: string;
  st: string;
  short: string;
  /** NETC step description — what happens at this stage */
  desc: string;
  struggle: number;
  ces: number;
  sent: number;
  contacts: number;
  worst?: number;
  conv?: string;
  cohort?: string;
  growth?: string;
  color?: string;
  isBottleneck?: boolean;
  note?: string;
};

export type StruggleRow = {
  id: string;
  short: string;
  pt: string;
  quote: string;
  /** Journey process stage id — maps to {@link JourneyStage.id} */
  stageId: string;
  /** Short stage label (derived from stageId at build time) */
  stage: string;
  volume: number;
  affected: string;
  ces: number;
  trend: string;
  trendUp: boolean;
  sev: 'Critical' | 'High' | 'Watch';
  channel: string;
  source: string;
  cause: string;
  impact: string;
  owner: string;
  fix: string;
  contactShare: string;
  struggleIndex: number;
  sent: number;
  icon: 'kyc' | 'wallet' | 'blacklist' | 'tag' | 'refund';
  priorDelta: number;
};

export type ChannelRow = {
  ch: string;
  note: string;
  drop: number;
  color: string;
};

export type ImpactRow = {
  label: string;
  v: string;
  d: string;
  color: string;
};

export type ActionRow = {
  id: string;
  struggleId: string;
  title: string;
  fix: string;
  owner: string;
  gain: string;
  sev: 'Critical' | 'High' | 'Watch';
  priority: number;
};

export type ComplaintRatioPoint = {
  label: string;
  ratio: number;
  resolved: number;
};

export type StageComplaintRatio = {
  stageId: string;
  ratio: number;
  trend: string;
  trendUp: boolean;
};

export type ComplaintRatioTrack = {
  current: number;
  prior: number;
  target: number;
  delta: string;
  trendUp: boolean;
  trend: ComplaintRatioPoint[];
  byStage: StageComplaintRatio[];
};

export type CxJourneyPeriodSnapshot = {
  grain: DrillPeriodGrain;
  caption: string;
  headline: CxJourneyHeadlineKpi[];
  /** One-line verdict for the period — feeds AI default read-out */
  verdict: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  stages: JourneyStage[];
  struggles: StruggleRow[];
  channels: ChannelRow[];
  impact: ImpactRow[];
  actions: ActionRow[];
  complaintRatio: ComplaintRatioTrack;
};

/** FASTag NETC onboarding lifecycle — eligibility → activation (8 stages). */
const BASE_STAGES: JourneyStage[] = [
  {
    id: 'eligibility',
    st: 'Eligibility',
    short: 'Eligibility',
    desc: 'Vehicle type, issuer policy, and customer consent captured.',
    struggle: 18,
    ces: 2.0,
    sent: 0.2,
    contacts: 4,
    conv: '100%',
    cohort: '1.84L',
    growth: '+8% YoY',
    color: '#2563eb',
  },
  {
    id: 'otp',
    st: 'OTP',
    short: 'OTP',
    desc: 'Registered mobile verified; session bound to customer.',
    struggle: 24,
    ces: 2.2,
    sent: 0.1,
    contacts: 5,
    conv: '96%',
    cohort: '1.77L',
    growth: '−4 pts',
    color: '#0891b2',
  },
  {
    id: 'kyc',
    st: 'KYC',
    short: 'KYC',
    desc: 'PAN, CKYCR pull, address proof within RBI KYC norms.',
    struggle: 81,
    ces: 4.3,
    sent: -0.4,
    contacts: 34,
    worst: 1,
    conv: '89%',
    cohort: '1.64L',
    growth: '−7 pts',
    color: '#059669',
  },
  {
    id: 'mapper',
    st: 'Mapper',
    short: 'Mapper',
    desc: 'NPCI OV1T check; NETC mapper updated or conflict escalated.',
    struggle: 36,
    ces: 3.0,
    sent: -0.1,
    contacts: 8,
    conv: '84%',
    cohort: '1.55L',
    growth: '−5 pts',
    color: '#0891b2',
  },
  {
    id: 'wallet',
    st: 'Wallet',
    short: 'Wallet',
    desc: 'Minimum balance loaded via approved payment rail.',
    struggle: 67,
    ces: 3.9,
    sent: -0.3,
    contacts: 22,
    worst: 2,
    isBottleneck: true,
    note: 'Biggest drop after KYC',
    conv: '75%',
    cohort: '1.38L',
    growth: '−9 pts',
    color: '#d97706',
  },
  {
    id: 'issuance',
    st: 'Issuance',
    short: 'Issuance',
    desc: 'EPC generated; tag ID linked to wallet and VRN.',
    struggle: 32,
    ces: 2.8,
    sent: 0.0,
    contacts: 7,
    conv: '72%',
    cohort: '1.32L',
    growth: '−3 pts',
    color: '#2563eb',
  },
  {
    id: 'fitment',
    st: 'Fitment',
    short: 'Fitment',
    desc: 'Installer attestation; RFID read test recorded.',
    struggle: 48,
    ces: 3.4,
    sent: -0.1,
    contacts: 12,
    worst: 3,
    conv: '69%',
    cohort: '1.27L',
    growth: '−3 pts',
    color: '#059669',
  },
  {
    id: 'activation',
    st: 'Activation',
    short: 'Activation',
    desc: 'Tag activated on NETC; settlement profile live; disputes logged.',
    struggle: 39,
    ces: 3.2,
    sent: -0.2,
    contacts: 8,
    conv: '66%',
    cohort: '1.21L',
    growth: '↑4 pts E2E',
    note: 'Live on NETC',
    color: '#059669',
  },
];

/** Canonical FASTag NETC process flow (8 stages). */
export const CX_JOURNEY_PROCESS_STAGES: readonly JourneyStage[] = BASE_STAGES;

export function journeyStageById(id: string): JourneyStage | undefined {
  return BASE_STAGES.find((s) => s.id === id);
}

type StruggleRowBase = Omit<StruggleRow, 'stage'>;

const BASE_STRUGGLES: StruggleRowBase[] = [
  {
    id: 'kyc-loop',
    short: 'KYC reject loop',
    pt: 'KYC document upload rejected / looping',
    quote: 'KYC keeps rejecting my documents',
    stageId: 'kyc',
    volume: 1240,
    affected: '1,240/day',
    ces: 4.5,
    trend: '+134%',
    trendUp: true,
    sev: 'Critical',
    channel: 'App (My FASTag)',
    source: 'App reviews + tickets',
    cause: 'Strict OCR rules with no inline field-level error guidance',
    impact: '~28K lost activations / mo from KYC drop-off',
    owner: 'Product / Onboarding',
    fix: 'Real-time field validation + assisted-KYC nudge on first reject',
    contactShare: '31% of journey contacts',
    struggleIndex: 81,
    sent: -0.4,
    icon: 'kyc',
    priorDelta: 530,
  },
  {
    id: 'recharge-gap',
    short: 'Recharge not credited',
    pt: 'Recharge debited but balance not reflected',
    quote: 'Money deducted, balance not updated',
    stageId: 'wallet',
    volume: 980,
    affected: '980/day',
    ces: 4.2,
    trend: '+124%',
    trendUp: true,
    sev: 'Critical',
    channel: 'App · UPI',
    source: 'Voice + chat',
    cause: 'Payment gateway callback delay — no live status UI for customer',
    impact: '₹47L open refund exposure · #2 contact driver',
    owner: 'Payments',
    fix: 'Live recharge status UI + auto-reconcile retry on callback delay',
    contactShare: '25% of journey contacts',
    struggleIndex: 67,
    sent: -0.3,
    icon: 'wallet',
    priorDelta: 540,
  },
  {
    id: 'blacklist',
    short: 'Blacklist surprise',
    pt: 'Low-balance blacklist with no warning',
    quote: 'Got blacklisted with no alert',
    stageId: 'wallet',
    volume: 760,
    affected: '760/day',
    ces: 4.0,
    trend: '+162%',
    trendUp: true,
    sev: 'High',
    channel: 'IVR · Social',
    source: 'Social (#FASTagFail)',
    cause: 'No proactive low-balance alert before blacklist trigger',
    impact: 'Fastest-growing complaint theme · reputation risk on X',
    owner: 'Lifecycle / CRM',
    fix: 'Auto-recharge default + 2-stage low-balance SMS/push alerts',
    contactShare: '19% of journey contacts',
    struggleIndex: 39,
    sent: -0.3,
    icon: 'blacklist',
    priorDelta: 470,
  },
  {
    id: 'tag-read',
    short: 'Tag not reading',
    pt: 'Tag not reading after affixing',
    quote: 'Tag not working at the toll gate',
    stageId: 'fitment',
    volume: 540,
    affected: '540/day',
    ces: 3.6,
    trend: '-19%',
    trendUp: false,
    sev: 'High',
    channel: 'App · Branch',
    source: 'Voice + plaza tickets',
    cause: 'Affixing instructions unclear · no first-read confirmation step',
    impact: '540/day first-use failures · escalations at toll plaza',
    owner: 'CX Content',
    fix: 'Guided affixing video + first-use RFID read confirmation in app',
    contactShare: '14% of journey contacts',
    struggleIndex: 48,
    sent: -0.1,
    icon: 'tag',
    priorDelta: 130,
  },
  {
    id: 'refund-lag',
    short: 'Refund / double-charge',
    pt: 'Refund / double-charge not reflected',
    quote: 'Charged twice, refund still pending',
    stageId: 'activation',
    volume: 470,
    affected: '470/day',
    ces: 4.1,
    trend: '+138%',
    trendUp: true,
    sev: 'Critical',
    channel: 'Voice · Tickets',
    source: 'Voice + B2B portal',
    cause: 'Acquirer recon lag — refund status not synced to customer wallet',
    impact: '78h avg refund queue vs 48h promise · SLA breach risk',
    owner: 'L2 — Recon',
    fix: 'Auto-reverse duplicate charges + customer-visible refund tracker',
    contactShare: '12% of journey contacts',
    struggleIndex: 58,
    sent: -0.3,
    icon: 'refund',
    priorDelta: 272,
  },
];

const BASE_COMPLAINT_TREND_MONTH: ComplaintRatioPoint[] = [
  { label: 'W1', ratio: 1.9, resolved: 68 },
  { label: 'W2', ratio: 2.0, resolved: 66 },
  { label: 'W3', ratio: 2.1, resolved: 64 },
  { label: 'W4', ratio: 2.3, resolved: 61 },
];

const BASE_COMPLAINT_TREND_WEEKS: ComplaintRatioPoint[] = [
  { label: '−3w', ratio: 1.8, resolved: 69 },
  { label: '−2w', ratio: 1.9, resolved: 67 },
  { label: '−1w', ratio: 2.0, resolved: 65 },
  { label: 'Now', ratio: 2.1, resolved: 63 },
];

const BASE_COMPLAINT_TREND_LAST24: ComplaintRatioPoint[] = [
  { label: '00h', ratio: 2.0, resolved: 64 },
  { label: '06h', ratio: 2.2, resolved: 62 },
  { label: '12h', ratio: 2.4, resolved: 60 },
  { label: '18h', ratio: 2.3, resolved: 61 },
  { label: '24h', ratio: 2.4, resolved: 59 },
];

const BASE_STAGE_COMPLAINT_RATIO: StageComplaintRatio[] = [
  { stageId: 'eligibility', ratio: 0.4, trend: '+0.1', trendUp: true },
  { stageId: 'otp', ratio: 0.6, trend: '−0.1', trendUp: false },
  { stageId: 'kyc', ratio: 3.2, trend: '+0.4', trendUp: true },
  { stageId: 'mapper', ratio: 1.1, trend: '+0.2', trendUp: true },
  { stageId: 'wallet', ratio: 2.8, trend: '+0.3', trendUp: true },
  { stageId: 'issuance', ratio: 0.9, trend: '−0.1', trendUp: false },
  { stageId: 'fitment', ratio: 1.7, trend: '+0.2', trendUp: true },
  { stageId: 'activation', ratio: 1.2, trend: '+0.1', trendUp: true },
];

const BASE_CHANNELS: ChannelRow[] = [
  { ch: 'IVR / Voice', note: 'Recharge flow breaks at peak', drop: 41, color: '#dc2626' },
  { ch: 'App (My FASTag)', note: 'KYC upload step abandonment', drop: 34, color: '#dc2626' },
  { ch: 'Web portal', note: 'Long forms · no save-state', drop: 22, color: '#d97706' },
  { ch: 'Branch (assisted)', note: 'Turnaround lag', drop: 14, color: '#059669' },
];

const BASE_IMPACT: ImpactRow[] = [
  { label: 'Lost activations / mo', v: '~28K', d: 'KYC drop-off alone', color: '#dc2626' },
  { label: 'Idle float (dormant)', v: '₹86Cr', d: 'Non-transacting wallets', color: '#d97706' },
  { label: 'Effort-driven contacts', v: '61%', d: 'Of total support volume', color: '#d97706' },
  { label: 'Churn risk multiplier', v: '2.4×', d: 'High-effort vs low-effort', color: '#dc2626' },
];

const BASE_ACTIONS: ActionRow[] = [
  {
    id: 'act-kyc',
    struggleId: 'kyc-loop',
    title: 'KYC rejection loop',
    fix: 'Real-time field validation + assisted-KYC nudge on first reject',
    owner: 'Product / Onboarding',
    gain: '−16 pts activation drop-off',
    sev: 'Critical',
    priority: 1,
  },
  {
    id: 'act-recharge',
    struggleId: 'recharge-gap',
    title: 'Recharge not reflected',
    fix: 'Live recharge status UI + auto-reconcile retry on callback delay',
    owner: 'Payments',
    gain: '−24% wallet contacts',
    sev: 'Critical',
    priority: 2,
  },
  {
    id: 'act-blacklist',
    struggleId: 'blacklist',
    title: 'Blacklist surprise',
    fix: 'Auto-recharge default + 2-stage low-balance SMS/push alerts',
    owner: 'Lifecycle / CRM',
    gain: '−62% blacklist complaints',
    sev: 'High',
    priority: 3,
  },
];

function scaleHeadline(grain: DrillPeriodGrain): CxJourneyHeadlineKpi[] {
  const stuck = grain === 'last24' ? 18 : grain === 'weeks' ? 96 : 412;
  const effort = grain === 'last24' ? 41 : grain === 'year' ? 38 : 43;
  const self = grain === 'last24' ? 59 : grain === 'year' ? 62 : 57;
  const contact = grain === 'last24' ? '2.4%' : '2.1%';

  return [
    { label: 'High effort contacts', v: `${effort}%`, d: '+7 pts WoW', tone: 'down', color: '#dc2626' },
    { label: 'Self-served', v: `${self}%`, d: '+3 pts WoW', tone: 'up', color: '#059669' },
    { label: 'Stuck in onboarding', v: String(stuck), d: '+34% vs prior', tone: 'down', color: '#dc2626' },
    { label: 'Contact rate', v: contact, d: '+0.4 pts', tone: 'down', color: '#d97706' },
  ];
}

function scaleStages(grain: DrillPeriodGrain): JourneyStage[] {
  const bump = grain === 'last24' ? -4 : grain === 'year' ? -6 : 0;
  return BASE_STAGES.map((s) => ({
    ...s,
    struggle: Math.max(0, Math.min(100, s.struggle + bump)),
    ces: Math.round((s.ces + bump * 0.02) * 10) / 10,
  }));
}

function scaleStruggles(grain: DrillPeriodGrain): StruggleRow[] {
  const scale = grain === 'last24' ? 0.08 : grain === 'weeks' ? 0.35 : 1;
  const stageById = Object.fromEntries(BASE_STAGES.map((s) => [s.id, s]));
  return BASE_STRUGGLES.map((r) => {
    const volume = Math.max(1, Math.round(r.volume * scale));
    const priorDelta = Math.max(1, Math.round(r.priorDelta * scale));
    const linked = stageById[r.stageId];
    return {
      ...r,
      stage: linked?.short ?? r.stageId,
      volume,
      priorDelta,
      affected: grain === 'last24' ? `${volume.toLocaleString()}/day` : r.affected,
    };
  });
}

function buildComplaintRatio(grain: DrillPeriodGrain): ComplaintRatioTrack {
  const trend =
    grain === 'last24'
      ? BASE_COMPLAINT_TREND_LAST24
      : grain === 'weeks'
        ? BASE_COMPLAINT_TREND_WEEKS
        : BASE_COMPLAINT_TREND_MONTH;
  const current = trend[trend.length - 1]?.ratio ?? 2.1;
  const prior = trend[trend.length - 2]?.ratio ?? 1.9;
  const deltaPts = Math.round((current - prior) * 10) / 10;
  return {
    current,
    prior,
    target: 1.8,
    delta: `${deltaPts >= 0 ? '+' : ''}${deltaPts} pts`,
    trendUp: deltaPts > 0,
    trend,
    byStage: BASE_STAGE_COMPLAINT_RATIO,
  };
}

export function buildCxJourneyPeriodSnapshot(grain: DrillPeriodGrain): CxJourneyPeriodSnapshot {
  const caption =
    grain === 'last24'
      ? 'last 24 hours'
      : grain === 'weeks'
        ? 'trailing 4 weeks'
        : grain === 'month'
          ? 'this month'
          : grain === 'quarter'
            ? 'this quarter'
            : 'FY to date';

  const stuck = grain === 'last24' ? 18 : grain === 'weeks' ? 96 : 412;

  return {
    grain,
    caption,
    headline: scaleHeadline(grain),
    verdict: `KYC and Wallet account for 56% of journey contacts — ${stuck} customers stuck in onboarding this period.`,
    q1: 'Top 5 customer struggles — ranked by daily volume',
    q2: 'Which stages drive the most friction and support contacts?',
    q3: 'Where do channels leak customers before journey completion?',
    q4: 'What is the business cost — and who owns the P0 fix?',
    stages: scaleStages(grain),
    struggles: scaleStruggles(grain),
    channels: BASE_CHANNELS,
    impact: BASE_IMPACT,
    actions: BASE_ACTIONS,
    complaintRatio: buildComplaintRatio(grain),
  };
}
