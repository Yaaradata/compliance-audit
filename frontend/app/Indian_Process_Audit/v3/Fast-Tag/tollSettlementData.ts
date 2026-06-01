/** Mock toll settlement & plaza recon data — FT-11 audit scope (Q1 2026). */

export type TollMetricDrillId = 'debits' | 'match-rate' | 'plaza-breaks' | 'chargebacks-tat';

export type TollBreakStatus = 'open' | 'investigating' | 'resolved' | 'escalated';
export type ChargebackStatus = 'open' | 'filed' | 'closed' | 'breached';
export type BreakMismatchType =
  | 'missing_file'
  | 'amount_mismatch'
  | 'timing_lag'
  | 'duplicate'
  | 'fee_component';
export type AuditPriority = 'critical' | 'high' | 'medium';

export interface PlazaBreakRecord {
  id: string;
  plazaId: string;
  plazaName: string;
  acquirer: string;
  vrn: string;
  tagId: string;
  breakAmountInr: number;
  walletDebitInr: number;
  plazaFileAmountInr: number;
  varianceInr: number;
  mismatchType: BreakMismatchType;
  settlementDate: string;
  npciCycle: string;
  ageDays: number;
  slaDays: number;
  status: TollBreakStatus;
  owner: string;
  priority: AuditPriority;
  npciDisputeRaised: boolean;
  linkedChargebackId?: string;
}

export interface ChargebackRecord {
  id: string;
  npciRef: string;
  vrn: string;
  tagId: string;
  plazaName: string;
  plazaId: string;
  tollDebitInr: number;
  disputeCategory: string;
  reason: string;
  raisedOn: string;
  resolutionDue: string;
  networkTatDays: number;
  ageDays: number;
  status: ChargebackStatus;
  owner: string;
  evidenceStatus: 'complete' | 'partial' | 'missing';
  relatedPlazaBreakId?: string;
}

export const TOLL_SETTLEMENT_SUMMARY = {
  periodLabel: '01 Jan – 31 Mar 2026',
  totalDebits: 4_218_400,
  matchedPct: 98.7,
  openPlazaBreaks: 18,
  openBreakAmountInr: 2_84_600,
  chargebacksOpen: 9,
  chargebacksBreachedTat: 5,
  npciCycle: 'T+1 / T+2',
  lastReconSignoff: '16 Apr 2026 · Treasury + NETC Ops',
};

export const MISMATCH_TYPE_LABEL: Record<BreakMismatchType, string> = {
  missing_file: 'Missing plaza line',
  amount_mismatch: 'Amount mismatch',
  timing_lag: 'Settlement timing',
  duplicate: 'Duplicate read',
  fee_component: 'Fee / MDR gap',
};

export const TOLL_METRIC_CARDS: {
  label: string;
  value: string | number;
  sub?: string;
  drillId: TollMetricDrillId;
  labelClass: string;
  valueClass: string;
  cardClass: string;
}[] = [
  {
    label: 'Toll debits (Q1)',
    value: '42.18L',
    drillId: 'debits',
    labelClass: 'text-slate-500',
    valueClass: 'text-slate-900',
    cardClass: 'bg-slate-50/80 ring-slate-200',
  },
  {
    label: 'Plaza match rate',
    value: '98.7%',
    drillId: 'match-rate',
    labelClass: 'text-emerald-800',
    valueClass: 'text-emerald-700',
    cardClass: 'bg-emerald-50/50 ring-emerald-200',
  },
  {
    label: 'Open plaza breaks',
    value: 18,
    sub: '₹2.85L unexplained',
    drillId: 'plaza-breaks',
    labelClass: 'text-amber-800',
    valueClass: 'text-amber-700',
    cardClass: 'bg-amber-50/50 ring-amber-200',
  },
  {
    label: 'Chargebacks past TAT',
    value: 5,
    sub: 'of 9 open',
    drillId: 'chargebacks-tat',
    labelClass: 'text-red-700',
    valueClass: 'text-red-700',
    cardClass: 'bg-red-50/80 ring-red-200',
  },
];

export const PLAZA_BREAKS: PlazaBreakRecord[] = [
  {
    id: 'PB-2026-0412-001',
    plazaId: '340221',
    plazaName: 'Mumbai Pune Exp — Khalapur',
    acquirer: 'ICICI Acquirer — West',
    vrn: 'MH12AB1234',
    tagId: 'TAG-8841201',
    breakAmountInr: 420,
    walletDebitInr: 420,
    plazaFileAmountInr: 0,
    varianceInr: 420,
    mismatchType: 'missing_file',
    settlementDate: '16 Apr 2026',
    npciCycle: 'T+1',
    ageDays: 5,
    slaDays: 7,
    status: 'open',
    owner: 'Reconciliation',
    priority: 'high',
    npciDisputeRaised: true,
    linkedChargebackId: 'CB-2026-0404',
  },
  {
    id: 'PB-2026-0414-002',
    plazaId: '118902',
    plazaName: 'Delhi Meerut Exp — Dasna',
    acquirer: 'HDFC Acquirer — North',
    vrn: 'DL01CD9999',
    tagId: 'TAG-8842099',
    breakAmountInr: 185,
    walletDebitInr: 0,
    plazaFileAmountInr: 185,
    varianceInr: 185,
    mismatchType: 'amount_mismatch',
    settlementDate: '14 Apr 2026',
    npciCycle: 'T+1',
    ageDays: 7,
    slaDays: 7,
    status: 'investigating',
    owner: 'NETC Operations',
    priority: 'critical',
    npciDisputeRaised: false,
  },
  {
    id: 'PB-2026-0415-003',
    plazaId: '220441',
    plazaName: 'Bangalore Chennai — Krishnagiri',
    acquirer: 'SBI Acquirer — South',
    vrn: 'KA05EF2200',
    tagId: 'TAG-8843310',
    breakAmountInr: 640,
    walletDebitInr: 640,
    plazaFileAmountInr: 320,
    varianceInr: 320,
    mismatchType: 'duplicate',
    settlementDate: '15 Apr 2026',
    npciCycle: 'T+2',
    ageDays: 6,
    slaDays: 7,
    status: 'escalated',
    owner: 'Reconciliation',
    priority: 'critical',
    npciDisputeRaised: true,
    linkedChargebackId: 'CB-2026-0403',
  },
  {
    id: 'PB-2026-0416-004',
    plazaId: '330118',
    plazaName: 'NH48 — Surat Plaza',
    acquirer: 'Axis Acquirer — West',
    vrn: 'TN09GH4500',
    tagId: 'TAG-8844402',
    breakAmountInr: 290,
    walletDebitInr: 290,
    plazaFileAmountInr: 290,
    varianceInr: 0,
    mismatchType: 'timing_lag',
    settlementDate: '16 Apr 2026',
    npciCycle: 'T+1',
    ageDays: 4,
    slaDays: 7,
    status: 'open',
    owner: 'Reconciliation',
    priority: 'medium',
    npciDisputeRaised: false,
  },
  {
    id: 'PB-2026-0417-005',
    plazaId: '441002',
    plazaName: 'Ahmedabad Vadodara — Anand',
    acquirer: 'Kotak Acquirer — West',
    vrn: 'GJ01JK7788',
    tagId: 'TAG-8845518',
    breakAmountInr: 510,
    walletDebitInr: 510,
    plazaFileAmountInr: 510,
    varianceInr: 0,
    mismatchType: 'fee_component',
    settlementDate: '17 Apr 2026',
    npciCycle: 'T+1',
    ageDays: 3,
    slaDays: 7,
    status: 'investigating',
    owner: 'Treasury Ops',
    priority: 'medium',
    npciDisputeRaised: false,
  },
  {
    id: 'PB-2026-0410-006',
    plazaId: '550221',
    plazaName: 'Kolkata Durgapur — Burdwan',
    acquirer: 'PNB Acquirer — East',
    vrn: 'WB22PQ1190',
    tagId: 'TAG-8846621',
    breakAmountInr: 175,
    walletDebitInr: 175,
    plazaFileAmountInr: 0,
    varianceInr: 175,
    mismatchType: 'missing_file',
    settlementDate: '10 Apr 2026',
    npciCycle: 'T+1',
    ageDays: 11,
    slaDays: 7,
    status: 'open',
    owner: 'Reconciliation',
    priority: 'critical',
    npciDisputeRaised: true,
  },
];

export const CHARGEBACKS: ChargebackRecord[] = [
  {
    id: 'CB-2026-0401',
    npciRef: 'NPCI-CB-20260417001',
    vrn: 'KL07WX9933',
    tagId: 'TAG-8847701',
    plazaName: 'Kochi Aluva Plaza',
    plazaId: '770112',
    tollDebitInr: 420,
    disputeCategory: 'Settlement file gap',
    reason: 'Plaza file missing from 16-Apr settlement',
    raisedOn: '17 Apr 2026',
    resolutionDue: '22 Apr 2026',
    networkTatDays: 5,
    ageDays: 7,
    status: 'breached',
    owner: 'Scheme Ops',
    evidenceStatus: 'partial',
  },
  {
    id: 'CB-2026-0402',
    npciRef: 'NPCI-CB-20260415002',
    vrn: 'AP39YZ1144',
    tagId: 'TAG-8842099',
    plazaName: 'Vijayawada Outer Ring',
    plazaId: '882201',
    tollDebitInr: 185,
    disputeCategory: 'Duplicate debit',
    reason: 'Duplicate debit same timestamp',
    raisedOn: '15 Apr 2026',
    resolutionDue: '20 Apr 2026',
    networkTatDays: 5,
    ageDays: 6,
    status: 'open',
    owner: 'Customer Care',
    evidenceStatus: 'missing',
    relatedPlazaBreakId: 'PB-2026-0414-002',
  },
  {
    id: 'CB-2026-0403',
    npciRef: 'NPCI-CB-20260412003',
    vrn: 'HR26LM3344',
    tagId: 'TAG-8843310',
    plazaName: 'Gurgaon Delhi Exp — Kundli',
    plazaId: '110442',
    tollDebitInr: 320,
    disputeCategory: 'Wrong vehicle class',
    reason: 'Wrong vehicle class tariff',
    raisedOn: '12 Apr 2026',
    resolutionDue: '17 Apr 2026',
    networkTatDays: 5,
    ageDays: 9,
    status: 'filed',
    owner: 'Scheme Ops',
    evidenceStatus: 'complete',
    relatedPlazaBreakId: 'PB-2026-0415-003',
  },
  {
    id: 'CB-2026-0404',
    npciRef: 'NPCI-CB-20260414004',
    vrn: 'MH12AB1234',
    tagId: 'TAG-8841201',
    plazaName: 'Mumbai Pune Exp — Lonavala',
    plazaId: '340118',
    tollDebitInr: 95,
    disputeCategory: 'Wallet vs plaza',
    reason: 'Wallet debited, plaza shows no entry',
    raisedOn: '14 Apr 2026',
    resolutionDue: '19 Apr 2026',
    networkTatDays: 5,
    ageDays: 7,
    status: 'breached',
    owner: 'Reconciliation',
    evidenceStatus: 'partial',
    relatedPlazaBreakId: 'PB-2026-0412-001',
  },
  {
    id: 'CB-2026-0405',
    npciRef: 'NPCI-CB-20260408005',
    vrn: 'BR06YZ2255',
    tagId: 'TAG-8846621',
    plazaName: 'Patna Gaya Highway',
    plazaId: '660901',
    tollDebitInr: 240,
    disputeCategory: 'Closure without ref',
    reason: 'Chargeback closed without plaza reference',
    raisedOn: '08 Apr 2026',
    resolutionDue: '13 Apr 2026',
    networkTatDays: 5,
    ageDays: 13,
    status: 'breached',
    owner: 'Scheme Ops',
    evidenceStatus: 'missing',
  },
];
