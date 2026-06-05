import type { DrillPeriodGrain } from './fastTagDrillPeriod';

export type MediumSubMix = { label: string; pct: number };

export type ConsumerMedium = {
  id: string;
  label: string;
  shortLabel: string;
  joinDetail: string;
  revenueDetail: string;
  joinSharePct: number;
  revenueSharePct: number;
  newTagsLabel: string;
  revenueCr: number;
  mom: string;
  yoy: string;
  color: string;
  drill: {
    joinPoints: string[];
    revenuePoints: string[];
    subMix: MediumSubMix[];
  };
};

export type ConsumerMediumSnapshot = {
  insight: string;
  badge: string;
  totalNewTagsLabel: string;
  totalConsumerRevenueCr: number;
  mediums: ConsumerMedium[];
};

const BASE_MEDIUMS: Omit<ConsumerMedium, 'revenueCr' | 'newTagsLabel'>[] = [
  {
    id: 'branch',
    label: 'Bank branches',
    shortLabel: 'Branches',
    joinDetail: 'Walk-in issuance at partner bank counters and BC outlets.',
    revenueDetail: 'Issuance fees, assisted recharge, and branch-led wallet float.',
    joinSharePct: 42,
    revenueSharePct: 36,
    color: '#059669',
    mom: '+3%',
    yoy: '+8%',
    drill: {
      joinPoints: [
        'Largest join medium — assisted KYC and mapper at counter',
        'Strong in Tier-2/3 new vehicle and replacement tags',
        'BC / CSP outlets expanding in semi-urban corridors',
      ],
      revenuePoints: [
        'Highest absolute ₹Cr — issuance + float on branch-originated wallets',
        'Take-rate stable; recharge convenience fee adds margin',
        'Share easing as digital self-serve grows',
      ],
      subMix: [
        { label: 'PSU bank counters', pct: 48 },
        { label: 'Private bank lounges', pct: 34 },
        { label: 'BC / CSP outlets', pct: 18 },
      ],
    },
  },
  {
    id: 'app',
    label: 'App / digital',
    shortLabel: 'App',
    joinDetail: 'My FASTag app, UPI reload, and self-serve KYC on mobile.',
    revenueDetail: 'Toll commission, auto-recharge spread, and Annual Pass attach.',
    joinSharePct: 29,
    revenueSharePct: 28,
    color: '#0891b2',
    mom: '+12%',
    yoy: '+21%',
    drill: {
      joinPoints: [
        'Fastest-growing join medium (+5 pts share YoY)',
        'OTP → KYC → wallet load fully digital for retail',
        'Annual Pass attach 31% on app-issued personal tags',
      ],
      revenuePoints: [
        'Toll GTV and pass revenue skew to app-issued base',
        'Lower CAC vs branch — margin accretive on toll take',
        'Auto-recharge reduces dormancy vs manual reload',
      ],
      subMix: [
        { label: 'Android / iOS app', pct: 62 },
        { label: 'Issuer web + UPI', pct: 28 },
        { label: 'WhatsApp / deeplink', pct: 10 },
      ],
    },
  },
  {
    id: 'pos',
    label: 'PoS · plaza / fuel',
    shortLabel: 'PoS',
    joinDetail: 'Toll plaza, highway fuel, and parking POS issuance.',
    revenueDetail: 'On-spot tag sale, security deposit float, and corridor toll.',
    joinSharePct: 21,
    revenueSharePct: 22,
    color: '#2563eb',
    mom: '+4%',
    yoy: '+5%',
    drill: {
      joinPoints: [
        'Impulse issuance at plaza exit and fuel forecourts',
        'Fleet drivers and NH commuters — high same-day activation',
        'Fitment often completed at plaza installer bay',
      ],
      revenuePoints: [
        'Corridor toll GTV immediately after issuance',
        'Parking & closed-loop attach growing on POS tags',
        'Partner revenue share on plaza-led sales',
      ],
      subMix: [
        { label: 'Highway plazas', pct: 58 },
        { label: 'Fuel retail PoS', pct: 28 },
        { label: 'City parking', pct: 14 },
      ],
    },
  },
  {
    id: 'cobrand',
    label: 'Co-brand / partner',
    shortLabel: 'Co-brand',
    joinDetail: 'Bank referral, OEM, fleet, and aggregator API issuance.',
    revenueDetail: 'Referral fees, B2B fleet slabs, and white-label API tiers.',
    joinSharePct: 8,
    revenueSharePct: 14,
    color: '#7c3aed',
    mom: '+18%',
    yoy: '+34%',
    drill: {
      joinPoints: [
        'Highest YoY velocity — co-brand bank referral programs',
        'Fleet B2B and OEM bundling on new vehicle sale',
        'API/SDK embed for issuer partners',
      ],
      revenuePoints: [
        'Revenue share outpaces join share — fleet toll density',
        'Annual Pass and slab pricing on B2B accounts',
        'Partner fees + toll margin on referred base',
      ],
      subMix: [
        { label: 'Co-brand bank referral', pct: 44 },
        { label: 'Fleet / logistics B2B', pct: 36 },
        { label: 'OEM / dealer bundle', pct: 20 },
      ],
    },
  },
];

const MONTH_CONSUMER_REV_CR = 33.3;
const MONTH_NEW_TAGS = '1.84L';

const MEDIUM_INSIGHT: Record<DrillPeriodGrain, { insight: string; badge: string; tags: string }> = {
  year: {
    insight: 'FY slope view — each line links join % to revenue %; angle shows lift or drag.',
    badge: 'Slope · FY',
    tags: '22.1L FY tags',
  },
  quarter: {
    insight: 'Q1 dumbbell slopes — upward lines mean revenue share beats join share.',
    badge: 'Slope · Q1',
    tags: '5.5L Q1 tags',
  },
  month: {
    insight: 'Join % → revenue % by channel — click a slope to drill into sub-channels.',
    badge: 'Slope · interactive',
    tags: MONTH_NEW_TAGS,
  },
  weeks: {
    insight: '6-week medium shift — digital join share gaining vs branch counters.',
    badge: '4 mediums · 6 wk',
    tags: '42K / wk',
  },
  last24: {
    insight: 'Last-24h issuance window — app and plaza PoS dominate intraday joins.',
    badge: '4 mediums · 24h',
    tags: '6.1K tags',
  },
};

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function buildConsumerMediumSnapshot(
  grain: DrillPeriodGrain,
  moneyMult: number,
): ConsumerMediumSnapshot {
  const meta = MEDIUM_INSIGHT[grain];
  const m = moneyMult;

  const totalTagsL = grain === 'last24' ? 6.1 : grain === 'weeks' ? 42 : round1(1.84 * m);
  const tagsSuffix = grain === 'last24' || grain === 'weeks' ? 'K' : 'L';

  const mediums: ConsumerMedium[] = BASE_MEDIUMS.map((medium) => {
    const tagVol = round1((totalTagsL * medium.joinSharePct) / 100);
    return {
      ...medium,
      newTagsLabel: `${tagVol}${tagsSuffix}`,
      revenueCr: round1((MONTH_CONSUMER_REV_CR * medium.revenueSharePct) / 100 * m),
    };
  });

  const totalConsumerRevenueCr = round1(
    mediums.reduce((s, medium) => s + medium.revenueCr, 0),
  );

  return {
    insight: meta.insight,
    badge: meta.badge,
    totalNewTagsLabel: meta.tags,
    totalConsumerRevenueCr,
    mediums,
  };
}
