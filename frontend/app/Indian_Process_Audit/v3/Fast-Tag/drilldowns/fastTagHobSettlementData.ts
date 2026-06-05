import type { DrillPeriodGrain } from './fastTagDrillPeriod';

export type LedgerJournalLine = {
  side: 'Dr' | 'Cr';
  narrative: string;
  amountCr: number;
};

export type SettlementHop = {
  id: string;
  label: string;
  shortLabel: string;
  matchPct: number;
  pendingCr: number;
  postedCr: number;
  detail: string;
  entries: LedgerJournalLine[];
};

export type SettlementException = {
  id: string;
  label: string;
  sharePct: number;
  amountCr: number;
  rowCount: string;
  status: 'On track' | 'Watch' | 'Act now';
  color: string;
  drill: string[];
};

export type HobSettlementSnapshot = {
  insight: string;
  badge: string;
  matchPct: number;
  matchMom: string;
  avgSettleHrs: number;
  openMismatchCr: number;
  bookCr: number;
  rowVolume: string;
  hops: SettlementHop[];
  exceptions: SettlementException[];
};

const META: Record<DrillPeriodGrain, { insight: string; badge: string; m: number }> = {
  year: {
    insight: 'FY cash integrity — keep T+1 match above 90%',
    badge: 'Settlement · FY',
    m: 1.05,
  },
  quarter: {
    insight: 'Q1 recon — plaza variance and pending acquirer files',
    badge: 'T+1 chain · Q1',
    m: 1,
  },
  month: {
    insight: 'Cash integrity — toll book by ledger',
    badge: 'Settlement pulse',
    m: 1,
  },
  weeks: {
    insight: '6-week match stable; exception queue up on refunds',
    badge: '6 wk recon',
    m: 0.98,
  },
  last24: {
    insight: '24h settlement — NETC and issuer aligned',
    badge: '24h match',
    m: 0.92,
  },
};

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function buildHobSettlementSnapshot(grain: DrillPeriodGrain): HobSettlementSnapshot {
  const meta = META[grain];
  const m = meta.m;
  const matchPct = grain === 'last24' ? 93 : grain === 'weeks' ? 90 : 91;
  const bookCr = round1(48.2 * m);
  const openMismatchCr = round1(4.1 * m);

  const hops: SettlementHop[] = [
    {
      id: 'plaza',
      label: 'Plaza lane files',
      shortLabel: 'Plaza',
      matchPct: 96,
      pendingCr: round1(0.8 * m),
      postedCr: round1(bookCr * 0.96),
      detail: 'Lane vs plaza MIS before NETC handoff',
      entries: [
        { side: 'Dr', narrative: 'Toll lane postings', amountCr: bookCr },
        { side: 'Cr', narrative: 'NETC switch handoff', amountCr: round1(bookCr - 0.8 * m) },
        { side: 'Cr', narrative: 'Unposted plaza gap', amountCr: round1(0.8 * m) },
      ],
    },
    {
      id: 'netc',
      label: 'NPCI NETC switch',
      shortLabel: 'NETC',
      matchPct: 94,
      pendingCr: round1(1.2 * m),
      postedCr: round1(bookCr * 0.94),
      detail: 'Switch clearing vs issuer debit batch',
      entries: [
        { side: 'Dr', narrative: 'Switch clearing in', amountCr: round1(bookCr - 0.8 * m) },
        { side: 'Cr', narrative: 'Acquirer allocation', amountCr: round1(bookCr - 2.0 * m) },
        { side: 'Cr', narrative: 'NETC batch variance', amountCr: round1(1.2 * m) },
      ],
    },
    {
      id: 'acquirer',
      label: 'Acquirer MIS',
      shortLabel: 'Acquirer',
      matchPct: 89,
      pendingCr: round1(1.6 * m),
      postedCr: round1(bookCr * 0.89),
      detail: 'Partner file ingest and toll allocation',
      entries: [
        { side: 'Dr', narrative: 'Partner MIS ingest', amountCr: round1(bookCr - 2.0 * m) },
        { side: 'Cr', narrative: 'Issuer settlement credit', amountCr: round1(bookCr - 3.6 * m) },
        { side: 'Cr', narrative: 'Pending acquirer file', amountCr: round1(1.6 * m) },
      ],
    },
    {
      id: 'issuer',
      label: 'Issuer ledger',
      shortLabel: 'Issuer',
      matchPct: 92,
      pendingCr: round1(0.5 * m),
      postedCr: round1(bookCr * 0.92),
      detail: 'Wallet debit vs settlement credit',
      entries: [
        { side: 'Dr', narrative: 'Settlement credit in', amountCr: round1(bookCr - 3.6 * m) },
        { side: 'Cr', narrative: 'Wallet debit matched', amountCr: round1(bookCr - 4.1 * m) },
        { side: 'Cr', narrative: 'Issuer ledger gap', amountCr: round1(0.5 * m) },
      ],
    },
  ];

  const exceptions: SettlementException[] = [
    {
      id: 'auto',
      label: 'Auto-matched T+1',
      sharePct: 58,
      amountCr: round1(bookCr * 0.58),
      rowCount: grain === 'last24' ? '4.2K' : '1.1M',
      status: 'On track',
      color: '#059669',
      drill: [
        'Straight-through match on plaza ↔ NETC ↔ acquirer within SLA',
        'Lowest ops touch — protects margin vs manual closes',
      ],
    },
    {
      id: 'manual',
      label: 'Manual matched',
      sharePct: 22,
      amountCr: round1(bookCr * 0.22),
      rowCount: '186K',
      status: 'On track',
      color: '#0891b2',
      drill: [
        'Ops-closed after review — within 48h target',
        'Concentrated on low-value plaza variance',
      ],
    },
    {
      id: 'pending',
      label: 'Pending acquirer file',
      sharePct: 11,
      amountCr: round1(bookCr * 0.11),
      rowCount: '42K',
      status: 'Watch',
      color: '#d97706',
      drill: [
        'MIS ingest delay on two partner banks',
        'HoB action: escalate file SLA before month-end close',
      ],
    },
    {
      id: 'variance',
      label: 'Plaza vs NETC variance',
      sharePct: 6,
      amountCr: round1(bookCr * 0.06),
      rowCount: '28K',
      status: 'Watch',
      color: '#2563eb',
      drill: [
        'Lane timing vs switch posting on 14 corridors',
        'Correlate with refund spike on same plazas',
      ],
    },
    {
      id: 'open',
      label: 'Open exception queue',
      sharePct: 3,
      amountCr: openMismatchCr,
      rowCount: '9.4K',
      status: 'Act now',
      color: '#dc2626',
      drill: [
        'Double-deduction + chargeback cluster +124% WoW',
        'Expand AI deflection; daily HoB stand-up until queue < ₹2Cr',
      ],
    },
  ];

  return {
    insight: meta.insight,
    badge: meta.badge,
    matchPct,
    matchMom: grain === 'year' ? '+2 pts YoY' : '+1 pt MoM',
    avgSettleHrs: grain === 'last24' ? 11 : 14,
    openMismatchCr,
    bookCr,
    rowVolume: grain === 'last24' ? '6.1K rows' : grain === 'weeks' ? '280K / wk' : '1.84M / mo',
    hops,
    exceptions,
  };
}
