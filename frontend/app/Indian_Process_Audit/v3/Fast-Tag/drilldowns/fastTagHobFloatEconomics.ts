import type { DrillPeriodGrain } from './fastTagDrillPeriod';

export type FloatPoolSegment = {
  id: string;
  label: string;
  pct: number;
  cr: number;
  color: string;
};

export type HobPriorityAction = {
  id: string;
  priority: 'high' | 'medium';
  title: string;
  impactLabel: string;
  metric: string;
  detail: string;
  owner: string;
};

export type HobFloatEconomicsSnapshot = {
  insight: string;
  badge: string;
  walletFloatCr: number;
  floatYieldPct: number;
  floatYieldMom: string;
  revPerTag: number;
  costPerTag: number;
  marginPerTag: number;
  revPerTagMom: string;
  takeRateBps: number;
  takeRateNote: string;
  rechargeToTollPct: number;
  rechargeTargetPct: number;
  dormantPct: number;
  idleFloatCr: number;
  floatComposition: FloatPoolSegment[];
  actions: HobPriorityAction[];
};

const META: Record<
  DrillPeriodGrain,
  { insight: string; badge: string; floatMult: number; yield: number; recharge: number }
> = {
  year: {
    insight:
      'Wallet float and per-tag economics drive issuer margin — protect yield and cut idle float before scaling CAC.',
    badge: 'Float engine · FY',
    floatMult: 1.08,
    yield: 6.4,
    recharge: 73,
  },
  quarter: {
    insight:
      'Q1 float book ₹420Cr+ — recharge-to-toll and dormant tags are the fastest levers to lift net without new issuance.',
    badge: 'Unit econ · Q1',
    floatMult: 1,
    yield: 6.2,
    recharge: 71,
  },
  month: {
    insight:
      'HoB view: float income + thin take-rate on toll — idle ₹86Cr and 71% recharge-to-toll are this month’s focus.',
    badge: 'HoB levers',
    floatMult: 1,
    yield: 6.2,
    recharge: 71,
  },
  weeks: {
    insight: '6-week float yield stable; recharge ratio slipped 2 pts — auto-recharge on top corridors first.',
    badge: '6 wk pulse',
    floatMult: 0.98,
    yield: 6.1,
    recharge: 69,
  },
  last24: {
    insight: '24h wallet debits aligned with NPCI window — intraday float accrual tracking ahead of plan.',
    badge: '24h float',
    floatMult: 0.92,
    yield: 6.0,
    recharge: 74,
  },
};

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function buildHobFloatEconomicsSnapshot(
  grain: DrillPeriodGrain,
  score: number,
  pnlUnit: { revPerTag: number; costPerTag: number; takeRate: string },
): HobFloatEconomicsSnapshot {
  const meta = META[grain];
  const m = meta.floatMult;
  const walletFloatCr = round1(420 * m);
  const dormantPct = grain === 'last24' ? 14 : grain === 'weeks' ? 15 : 16;
  const transactingPct = 100 - dormantPct - 8;
  const securityPct = 8;
  const idleFloatCr = round1((walletFloatCr * dormantPct) / 100);
  const revPerTag = pnlUnit.revPerTag;
  const costPerTag = pnlUnit.costPerTag;
  const marginPerTag = revPerTag - costPerTag;

  const floatComposition: FloatPoolSegment[] = [
    {
      id: 'transact',
      label: 'Transacting float',
      pct: transactingPct,
      cr: round1((walletFloatCr * transactingPct) / 100),
      color: '#059669',
    },
    {
      id: 'idle',
      label: 'Idle / dormant',
      pct: dormantPct,
      cr: idleFloatCr,
      color: '#d97706',
    },
    {
      id: 'deposit',
      label: 'Security deposits',
      pct: securityPct,
      cr: round1((walletFloatCr * securityPct) / 100),
      color: '#7c3aed',
    },
  ];

  const actions: HobPriorityAction[] = [
    {
      id: 'dormant',
      priority: 'high',
      title: 'Reactivate dormant wallet float',
      impactLabel: `₹${idleFloatCr}Cr idle`,
      metric: `${dormantPct}% tags dormant`,
      detail:
        'Push auto-recharge + SMS on top 5 highway corridors; largest margin lift without new CAC.',
      owner: 'Growth · Wallet',
    },
    {
      id: 'recharge',
      priority: 'high',
      title: 'Lift recharge-to-toll ratio',
      impactLabel: meta.recharge < 72 ? '▼ 2 pts vs target' : 'On target',
      metric: `${meta.recharge}% vs ${72}% target`,
      detail:
        'Fleet B2B wallets and post-festival retail slips — KAM touch on 12 flagged fleet accounts.',
      owner: 'Ops · B2B',
    },
    {
      id: 'yield',
      priority: 'medium',
      title: 'Protect float yield & take-rate',
      impactLabel: `${pnlUnit.takeRate} take · ${meta.yield}% yield`,
      metric: `₹${revPerTag}/tag/mo margin`,
      detail:
        'T+1 reinvestment yield offsets acquirer share; renegotiate slabs before Q2 peak travel.',
      owner: 'Treasury · Pricing',
    },
  ];

  return {
    insight: meta.insight,
    badge: meta.badge,
    walletFloatCr,
    floatYieldPct: meta.yield,
    floatYieldMom: grain === 'year' ? '+0.3 pts YoY' : '+0.1 pt MoM',
    revPerTag,
    costPerTag,
    marginPerTag,
    revPerTagMom: score >= 72 ? '+4% MoM' : '−2% MoM',
    takeRateBps: 28,
    takeRateNote: pnlUnit.takeRate,
    rechargeToTollPct: meta.recharge,
    rechargeTargetPct: 72,
    dormantPct,
    idleFloatCr,
    floatComposition,
    actions,
  };
}
