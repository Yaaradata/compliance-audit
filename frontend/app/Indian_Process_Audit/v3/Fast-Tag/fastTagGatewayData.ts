/** Gateway front-page content — aligned with clariverse-ui FastagIntelligenceDashboard. */

/** Red · Amber · Green palette for gateway gauges and viz callouts. */
export const FT_RAG = {
  red: '#EF4444',
  amber: '#F59E0B',
  green: '#22C55E',
} as const;

/** Maps a 0–100 gauge value to red / amber / green. */
export function ftRagPct(value: number, higherIsBetter = true): string {
  if (higherIsBetter) {
    if (value >= 70) return FT_RAG.green;
    if (value >= 55) return FT_RAG.amber;
    return FT_RAG.red;
  }
  if (value <= 12) return FT_RAG.green;
  if (value <= 25) return FT_RAG.amber;
  return FT_RAG.red;
}

export type FastTagGatewayTileId =
  | 'sales_issuance'
  | 'ecosystem_partner'
  | 'operations_escalations';

/** Gateway tile: "How is the overall FASTag business performing?" */
export const FAST_TAG_PERFORMANCE_GATEWAY_TILE_ID = 'sales_issuance' as const;

const FAST_TAG_HOB_GATEWAY_TILE_IDS: readonly FastTagGatewayTileId[] = [
  'sales_issuance',
  'ecosystem_partner',
  'operations_escalations',
];

/** Any HoB gateway tile drill — hides workspace chrome (immersive). */
export function isFastTagHoBGatewayDrill(
  drillId: FastTagGatewayTileId | null | undefined,
): boolean {
  return drillId != null && FAST_TAG_HOB_GATEWAY_TILE_IDS.includes(drillId);
}

const COH_GATEWAY_DRILL_TILE_IDS: readonly FastTagGatewayTileId[] = ['sales_issuance'];

/** COH gateway tile with a full-page drill — hides workspace chrome (immersive). */
export function isFastTagCohGatewayDrill(
  drillId: FastTagGatewayTileId | null | undefined,
): boolean {
  return drillId != null && COH_GATEWAY_DRILL_TILE_IDS.includes(drillId);
}

/** HoB or COH immersive gateway drill open. */
export function isFastTagGatewayDrillImmersive(
  hobDrillId: FastTagGatewayTileId | null | undefined,
  cohDrillId: FastTagGatewayTileId | null | undefined,
): boolean {
  return isFastTagHoBGatewayDrill(hobDrillId) || isFastTagCohGatewayDrill(cohDrillId);
}

/** @deprecated Use {@link isFastTagHoBGatewayDrill} */
export function isFastTagPerformanceGatewayDrill(
  drillId: FastTagGatewayTileId | null | undefined,
): boolean {
  return drillId === FAST_TAG_PERFORMANCE_GATEWAY_TILE_ID;
}

export type FastTagGatewayHighlightTone = 'good' | 'warn' | 'bad';

export type FastTagGatewayHighlight = {
  label: string;
  value: string;
  sub?: string;
  /** Optional metric share (0–100); reserved for future viz, not shown on the card. */
  pct?: number;
  tone?: FastTagGatewayHighlightTone;
};

export type FastTagGatewayTile = {
  id: FastTagGatewayTileId;
  title: string;
  subtitle: string;
  score: number;
  delta: number;
  deltaLabel: string;
  visualTone: string;
  spark: readonly [number, number, number, number, number, number];
  aiInsight: string;
  highlights: FastTagGatewayHighlight[];
};

export type FastTagGatewayTileMetric = {
  label: string;
  value: string;
  valueColor?: string;
  sub?: string;
};

export type FastTagGatewayGauge = {
  label: string;
  value: number;
  /** Default true. Set false for metrics where a lower % is healthier (e.g. dormant, reopen). */
  higherIsBetter?: boolean;
};

export type FastTagGatewayTileMeta = {
  micro: string;
  leftGauge: FastTagGatewayGauge;
  rightGauge: FastTagGatewayGauge;
  bottomLeft: FastTagGatewayTileMetric;
  bottomRight: FastTagGatewayTileMetric;
};

function tollVolumeHighlight(timeRange: string): FastTagGatewayHighlight {
  switch (timeRange) {
    case '7d':
      return { label: 'Toll volume (7d)', value: '78.4M', sub: 'Flat vs prior 7d' };
    case '30d':
      return { label: 'Toll volume (30d)', value: '336M', sub: '+2% vs prior 30d' };
    case '1y':
      return { label: 'Annual toll volume', value: '4.1B', sub: 'FY to date vs plan' };
    default:
      return { label: 'Quarter toll volume', value: '1.01B', sub: 'Flat vs prior quarter' };
  }
}

function customerOnboardingHighlight(timeRange: string): FastTagGatewayHighlight {
  switch (timeRange) {
    case '7d':
      return { label: 'Customer onboarding (7d)', value: '3.2K', sub: 'Flat vs prior 7d', tone: 'good' };
    case '30d':
      return { label: 'Customer onboarding (30d)', value: '14K', sub: '+8% vs prior 30d', tone: 'good' };
    case '1y':
      return { label: 'Annual customer onboarding', value: '482K', sub: 'FY to date vs plan', tone: 'good' };
    default:
      return {
        label: 'Customer onboarding',
        value: '128K',
        sub: '+12% vs prior quarter · digital 24%',
        tone: 'good',
      };
  }
}

function performanceTileAiInsight(timeRange: string): string {
  const toll = tollVolumeHighlight(timeRange);
  const onboarding = customerOnboardingHighlight(timeRange);
  return `${toll.label} at ${toll.value}; ${onboarding.label.toLowerCase()} at ${onboarding.value} with commercial share at 38%.\nWallet-recharge friction flags 12 fleet accounts as the top detractor.`;
}

const HOB_GATEWAY_TILES_BASE: FastTagGatewayTile[] = [
  {
    id: 'sales_issuance',
    title: 'How is the overall FASTag business performing?',
    subtitle: 'Toll Volume · Active Tags · Collection',
    score: 72,
    delta: -3,
    deltaLabel: '▼ 3 pts',
    visualTone: '#7B2FF0',
    spark: [52, 44, 60, 50, 66, 72],
    aiInsight:
      'Quarter toll volume at 1.01B; customer onboarding at 128K with commercial share at 38%.\nWallet-recharge friction flags 12 fleet accounts as the top detractor.',
    highlights: [
      { label: 'Quarter toll volume', value: '1.01B', sub: 'Flat vs prior quarter' },
      {
        label: 'Customer onboarding',
        value: '128K',
        sub: '+12% vs prior quarter · digital 24%',
        tone: 'good',
      },
      { label: 'Commercial share', value: '38%', sub: 'Of toll volume · B2B fleet', pct: 38, tone: 'good' },
      { label: 'Settlement match', value: '94%', sub: 'Plaza recon · T+1', pct: 94, tone: 'good' },
    ],
  },
  {
    id: 'ecosystem_partner',
    title: 'What is driving FASTag growth?',
    subtitle: 'Acquisition · Recharge · Highway Mix',
    score: 66,
    delta: 4,
    deltaLabel: '+4 pts',
    visualTone: '#FF7043',
    spark: [38, 34, 46, 52, 58, 66],
    aiInsight:
      'Vehicle sales and the ₹3K Annual Pass drive issuance (18% of activations).\nAuto-recharge is +31% WoW; commercial fleets lead forward volume.',
    highlights: [
      { label: 'Issuance growth', value: '+18%', sub: 'WoW — vehicle sales led', tone: 'good' },
      { label: 'Auto-recharge uptake', value: '+31%', sub: 'WoW enrolment', tone: 'good' },
      { label: 'Digital channel', value: '24%', sub: 'Of new activations', pct: 24, tone: 'good' },
      { label: 'Highway debit mix', value: '62%', sub: 'Of toll volume', pct: 62, tone: 'good' },
    ],
  },
  {
    id: 'operations_escalations',
    title: 'Is Customer and Partners are happy?',
    subtitle: 'Customers · Partners · Satisfaction',
    score: 59,
    delta: -9,
    deltaLabel: '▼ 9 pts',
    visualTone: '#F59E0B',
    spark: [68, 64, 62, 58, 55, 59],
    aiInsight:
      'Customer positivity 62% and partner SLA 54% — both under target.\nDouble-deduction & plaza recon strain partners; recharge failures dominate.',
    highlights: [
      { label: 'First contact resolve', value: '48%', sub: 'Target 65%', pct: 48, tone: 'warn' },
      { label: 'Avg resolution', value: '78h', sub: 'vs 48h promise', tone: 'bad' },
      { label: 'Double-deduction', value: '1.4K', sub: 'Open complaints', tone: 'bad' },
      { label: 'Social sentiment', value: '↑287%', sub: '#FASTagFail mentions', tone: 'bad' },
    ],
  },
];

/** HoB gateway tiles with period-aware toll volume on the performance card. */
export function buildHobGatewayTiles(timeRange = 'q1'): FastTagGatewayTile[] {
  const toll = tollVolumeHighlight(timeRange);
  const onboarding = customerOnboardingHighlight(timeRange);
  return HOB_GATEWAY_TILES_BASE.map((tile) => {
    if (tile.id !== 'sales_issuance') return tile;
    const highlights = [...tile.highlights];
    highlights[0] = toll;
    highlights[1] = onboarding;
    return { ...tile, highlights, aiInsight: performanceTileAiInsight(timeRange) };
  });
}

export const HOB_GATEWAY_TILES = buildHobGatewayTiles('q1');

export const COH_GATEWAY_TILES: FastTagGatewayTile[] = [
  {
    id: 'sales_issuance',
    title: 'Where are customers struggling in the journey?',
    subtitle: 'Onboarding · Recharge · Disputes',
    score: 64,
    delta: -5,
    deltaLabel: '▼ 5 pts',
    visualTone: '#7B2FF0',
    spark: [64, 68, 58, 52, 44, 46],
    aiInsight:
      '412 customers stuck at KYC and tag-affixing — the steepest drop-off.\nWallet-recharge failure is #2; high-effort contacts rose to 43% from 36% WoW.',
    highlights: [
      { label: 'Stuck in onboarding', value: '412', sub: 'KYC + tag-affixing', tone: 'bad' },
      { label: 'Wallet recharge fails', value: '#2', sub: 'Top friction after onboarding', tone: 'warn' },
      { label: 'IVR avg wait', value: '4.2m', sub: 'Peak 09–11h', tone: 'warn' },
      { label: 'Contact rate', value: '2.1%', sub: 'Of active tags', tone: 'bad' },
    ],
  },
  {
    id: 'ecosystem_partner',
    title: 'Are we resolving issues within SLA?',
    subtitle: 'Resolution · FCR · Queue Age',
    score: 58,
    delta: -7,
    deltaLabel: '▼ 7 pts',
    visualTone: '#FF7043',
    spark: [66, 70, 60, 54, 46, 48],
    aiInsight:
      'Within-SLA 61%; first-contact 48%. Refund queues average 78h vs 48h promise.\nAgeing double-deduction backlog drives most SLA breaches this week.',
    highlights: [
      { label: 'Refund exposure', value: '₹47L', sub: 'Open disputes', tone: 'bad' },
      { label: 'Chargeback queue', value: '34', sub: 'Past TAT', tone: 'bad' },
      { label: 'Agent utilisation', value: '78%', sub: 'Peak hours', pct: 78, tone: 'warn' },
      { label: 'Callback breaches', value: '22', sub: 'This week', tone: 'warn' },
    ],
  },
  {
    id: 'operations_escalations',
    title: 'Which issues recur after support responds?',
    subtitle: 'Reopens · Repeat Contact · Root Cause',
    score: 55,
    delta: -10,
    deltaLabel: '▼ 10 pts',
    visualTone: '#F59E0B',
    spark: [48, 44, 56, 62, 68, 55],
    aiInsight:
      'Reopen rate 29%; double-deduction and low-balance blacklist drive repeats.\n312 tickets reopened in 7d — root cause not fixed at first response.',
    highlights: [
      { label: 'KAM outreach', value: '8/12', sub: 'At-risk fleets', tone: 'warn' },
      { label: 'Root-cause fix', value: '71%', sub: 'First-response closure', pct: 71, tone: 'warn' },
      { label: 'Escalation backlog', value: '89', sub: 'Awaiting owner', tone: 'bad' },
      { label: 'Partner recon lag', value: '3.2d', sub: 'Plaza file delay', tone: 'warn' },
    ],
  },
];

export const HOB_TILE_COMPACT_META: Record<FastTagGatewayTileId, FastTagGatewayTileMeta> = {
  sales_issuance: {
    micro: 'Volume · Activation · Revenue',
    leftGauge: { label: 'Active tags', value: 84, higherIsBetter: true },
    rightGauge: { label: 'EBITDA margin', value: 91, higherIsBetter: true },
    bottomLeft: { label: 'Top volume driver', value: 'Highway Toll' },
    bottomRight: { label: 'Fleets at-risk', value: '12 accounts', valueColor: FT_RAG.red },
  },
  ecosystem_partner: {
    micro: 'Acquisition · Recharge · Segment',
    leftGauge: { label: 'New tags', value: 58, higherIsBetter: true },
    rightGauge: { label: 'Repeat recharge', value: 71, higherIsBetter: true },
    bottomLeft: { label: 'Growth driver', value: 'Annual Pass', valueColor: FT_RAG.green },
    bottomRight: { label: 'Top segment', value: 'Commercial' },
  },
  operations_escalations: {
    micro: 'Customers · Partners · Satisfaction',
    leftGauge: { label: 'Customer happy', value: 62, higherIsBetter: true },
    rightGauge: { label: 'Partner happy', value: 54, higherIsBetter: true },
    bottomLeft: { label: 'Open complaints', value: '4.9K', valueColor: FT_RAG.red },
    bottomRight: { label: 'Partners strained', value: '18', valueColor: FT_RAG.amber },
  },
};

export const COH_TILE_COMPACT_META: Record<FastTagGatewayTileId, FastTagGatewayTileMeta> = {
  sales_issuance: {
    micro: 'Onboarding · Recharge · Disputes',
    leftGauge: { label: 'High effort', value: 43, higherIsBetter: false },
    rightGauge: { label: 'Self-served', value: 57, higherIsBetter: true },
    bottomLeft: { label: 'Top friction point', value: 'KYC Stall' },
    bottomRight: { label: 'Worst stage', value: 'Activation', valueColor: FT_RAG.red },
  },
  ecosystem_partner: {
    micro: 'Resolution · FCR · Queue age',
    leftGauge: { label: 'Within SLA', value: 61, higherIsBetter: true },
    rightGauge: { label: 'First contact', value: 48, higherIsBetter: true },
    bottomLeft: { label: 'Beyond SLA', value: '56 cases', valueColor: FT_RAG.amber },
    bottomRight: { label: 'Slowest queue', value: 'Refunds', valueColor: FT_RAG.red },
  },
  operations_escalations: {
    micro: 'Reopens · Repeat contact · Root cause',
    leftGauge: { label: 'Reopen rate', value: 29, higherIsBetter: false },
    rightGauge: { label: 'Repeat contact', value: 44, higherIsBetter: false },
    bottomLeft: { label: 'Top repeat issue', value: 'Double Deduct', valueColor: FT_RAG.red, sub: 'Root cause' },
    bottomRight: { label: 'Reopened (7d)', value: '312 tickets', valueColor: FT_RAG.red, sub: 'Repeat contact' },
  },
};

export type ExecutivePulseItem = { q: string; main: string };

export function hobPulseLines(timeRange: string): ExecutivePulseItem[] {
  const periodLabel =
    timeRange === '7d' ? 'trailing 7d' : timeRange === '30d' ? 'trailing 30d' : 'Q1 2026';
  if (timeRange === '7d' || timeRange === '30d') {
    return [
      {
        q: "🔴 What's critical",
        main: `${periodLabel}: Recharge-failure and refund clusters are elevated — wallet friction is the primary churn risk.`,
      },
      {
        q: "🎯 Where's your focus",
        main: 'Double-deduction disputes are above target; acquirer reconciliation and FT-11 plaza breaks need same-day review.',
      },
      {
        q: "🟢 What's stable / on-track",
        main: 'Digital issuance mix is stable; monitor social sentiment while gateway fail-over completes.',
      },
    ];
  }
  return [
    {
      q: "🔴 What's critical",
      main: 'Q1 2026: Recharge-failure and refund clusters are elevated — wallet friction is the primary churn risk.',
    },
    {
      q: "🎯 Where's your focus",
      main: 'Double-deduction disputes are tracking above the Q1 target; acquirer reconciliation is the focus area.',
    },
    {
      q: "🟢 What's stable / on-track",
      main: 'Digital issuance mix is stable; monitor social sentiment while gateway fail-over completes.',
    },
  ];
}

export const COH_PULSE_LINES: ExecutivePulseItem[] = [
  {
    q: "🔴 What's critical",
    main: '1 in 3 new users stall at KYC/tag-affixing; onboarding friction is the #1 journey detractor and frustration sentiment is climbing.',
  },
  {
    q: "🎯 Where's your focus",
    main: 'Refund-dispute resolution is breaching SLA at 34%, up from 26% WoW, with 56 double-deduction cases ageing past the promise window.',
  },
  {
    q: "🟢 What's stable / on-track",
    main: 'App-channel CSAT is steady at 4.1/5 vs IVR 3.4; self-serve deflection is holding while #FASTagFail movement is monitored.',
  },
];

export type FastTagRiskSpike = {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  channelMix: string[];
  topIntent: string;
  time: string;
  metrics: { label: string; value: string; delta?: string }[];
  aiAction: string;
};

export const FASTAG_RISK_SPIKES: FastTagRiskSpike[] = [
  {
    id: 'wallet-recharge-failure-surge',
    severity: 'CRITICAL',
    title: 'Wallet Recharge Failure Surge',
    channelMix: ['App', 'UPI'],
    topIntent: 'Recharge Failed',
    time: 'Last 6h',
    metrics: [
      { label: 'Failed recharges', value: '1.2K → 4.8K', delta: '↑ 289%' },
      { label: 'Affected wallets', value: '980 → 3.4K', delta: '↑ 247%' },
      { label: 'Success ratio', value: '94% → 78%', delta: '−16 pts' },
    ],
    aiAction:
      'Recharge failures concentrated on one UPI handle. Fail over to the backup payment gateway and proactively notify affected wallets today.',
  },
  {
    id: 'double-deduction-nh48',
    severity: 'CRITICAL',
    title: 'Double-Deduction Cluster — NH-48',
    channelMix: ['Voice', 'Tickets'],
    topIntent: 'Duplicate Toll Charge',
    time: 'Last 4h',
    metrics: [
      { label: 'Dispute intake', value: '34 → 89', delta: '↑ 162%' },
      { label: 'Refund exposure', value: '₹21K → ₹47K', delta: '↑ 124%' },
      { label: 'Plaza clusters', value: '3 plazas', delta: 'NH-48' },
    ],
    aiAction:
      'Reader mis-read pattern at NH-48 plazas (single pass, double charge). Reconcile with the acquirer and auto-refund duplicate charges immediately.',
  },
  {
    id: 'blacklist-complaint-trend',
    severity: 'HIGH',
    title: 'Blacklist Complaint Trending',
    channelMix: ['Social', 'App'],
    topIntent: 'Tag Blacklisted',
    time: 'Last 12h',
    metrics: [
      { label: 'Mentions (48h)', value: '1,240 → 4,820', delta: '↑ 289%' },
      { label: 'Top hashtag', value: '#FASTagFail', delta: '↑ 287%' },
      { label: 'Estimated reach', value: '0.9M → 1.8M', delta: '↑ 100%' },
    ],
    aiAction:
      'Blacklist-on-low-balance narrative is going mainstream on X + Reddit. Publish an auto-recharge FAQ and align influencer comms within 24h.',
  },
  {
    id: 'fleet-churn-signals',
    severity: 'CRITICAL',
    title: 'Fleet Account Churn Signals',
    channelMix: ['Voice', 'Email'],
    topIntent: 'Account Closure Inquiry',
    time: 'Last 72h',
    metrics: [
      { label: 'Retention risk', value: '61% → 86%', delta: '↑ 25 pts' },
      { label: 'Closure intents', value: '7 → 18', delta: '↑ 157%' },
      { label: 'Spend at risk', value: '₹2.7M → ₹4.2M', delta: '↑ 56%' },
    ],
    aiAction:
      'Fleets cite competitor zero-fee recharge and reward erosion. Trigger KAM outreach within 2 hours with pre-approved fee-waiver offers.',
  },
  {
    id: 'kyc-backlog',
    severity: 'CRITICAL',
    title: 'KYC / Re-KYC Verification Backlog',
    channelMix: ['App', 'Email'],
    topIntent: 'KYC Verification Stall',
    time: 'Next 3 days',
    metrics: [
      { label: 'At-risk tags', value: '2.7K → 4.3K', delta: '↑ 59%' },
      { label: 'Vendor cases', value: '19 → 31', delta: '↑ 63%' },
      { label: 'Exposure (est.)', value: '₹1.1L → ₹1.8L', delta: '↑ 61%' },
    ],
    aiAction:
      'Stalled KYC work is concentrated at BPO Vendor Beta. Surge in-house review on the oldest cases and reroute high-value activations off the vendor queue.',
  },
];

export const HOB_AI_INSIGHTS = [
  { text: '↑ Spike in AVC mismatch complaints — up 42% vs last week', tone: 'urgency' as const },
  { text: 'Zone 4 partner issuance failure detected — 18 partners affected', tone: 'amber' as const },
  { text: 'Repeat callers up 31% for excess toll refund requests', tone: 'accent' as const },
];
