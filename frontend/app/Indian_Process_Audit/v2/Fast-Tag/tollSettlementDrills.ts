/** Drill-down payloads for Toll settlement tab (FT-11). */

import {
  CHARGEBACKS,
  PLAZA_BREAKS,
  TOLL_SETTLEMENT_SUMMARY,
  type ChargebackRecord,
  type PlazaBreakRecord,
  MISMATCH_TYPE_LABEL,
  type TollMetricDrillId,
} from './tollSettlementData';

export type { TollMetricDrillId };

export type TollDrillState =
  | { kind: 'metric'; id: TollMetricDrillId }
  | { kind: 'plaza-break'; id: string }
  | { kind: 'chargeback'; id: string }
  | null;

export interface TollTimelineEvent {
  at: string;
  actor: string;
  event: string;
}

export interface PlazaBreakDrillDetail extends PlazaBreakRecord {
  mismatchReason: string;
  timeline: TollTimelineEvent[];
  auditInsights: string[];
  sourceSystems: { name: string; record: string }[];
}

export interface ChargebackDrillDetail extends ChargebackRecord {
  timeline: TollTimelineEvent[];
  auditInsights: string[];
  documents: { name: string; status: 'available' | 'missing' }[];
}

export interface MetricDrillDetail {
  id: TollMetricDrillId;
  title: string;
  subtitle: string;
  kpis: { label: string; value: string; hint?: string }[];
  insights: string[];
  rows?: { label: string; value: string; tone?: 'ok' | 'warn' | 'bad' }[];
}

const PLAZA_DRILL_EXTRAS: Record<
  string,
  Omit<PlazaBreakDrillDetail, keyof PlazaBreakRecord>
> = {
  'PB-2026-0412-001': {
    mismatchReason: 'Wallet debited; plaza settlement file for 16-Apr has no matching line',
    timeline: [
      { at: '16 Apr 09:14', actor: 'NETC', event: 'Toll debit ₹420 posted to wallet' },
      { at: '17 Apr 06:00', actor: 'NPCI MIS', event: '16-Apr plaza file ingested — line missing' },
      { at: '17 Apr 11:20', actor: 'Reconciliation', event: 'Break logged PB-2026-0412-001' },
      { at: '18 Apr 09:00', actor: 'Treasury', event: 'Awaiting plaza acquirer response' },
    ],
    auditInsights: [
      'Break exceeds ₹50 threshold — requires NPCI dispute within network TAT.',
      'Same VRN has open chargeback CB-2026-0404 (Lonavala) — consolidate investigation.',
      'No low-balance alert fired before debit (FT-11 sub-check).',
    ],
    sourceSystems: [
      { name: 'NPCI Settlement MIS', record: 'Plaza 340221 — 16-Apr file (gap)' },
      { name: 'Wallet Ledger', record: 'Debit txn WAL-8841201-1604' },
      { name: 'Chargeback Tracker', record: 'CB-2026-0404 linked' },
    ],
  },
  'PB-2026-0414-002': {
    mismatchReason: 'Plaza file shows debit; wallet shows ₹0 — possible failed post or reversal gap',
    timeline: [
      { at: '14 Apr 14:02', actor: 'Plaza', event: 'Toll event captured at Dasna' },
      { at: '15 Apr 06:00', actor: 'NPCI MIS', event: 'Settlement includes ₹185' },
      { at: '15 Apr 08:10', actor: 'Reconciliation', event: 'Wallet extract shows no debit — break opened' },
      { at: '16 Apr 10:30', actor: 'NETC Ops', event: 'Investigating mapper vs wallet sync' },
    ],
    auditInsights: [
      'Mapper conflict VRN DL01CD9999 — issuance audit case FT-20260417-8802 related.',
      'Risk of duplicate settlement if wallet debit posts late.',
    ],
    sourceSystems: [
      { name: 'NPCI Settlement MIS', record: 'Plaza 118902 line present' },
      { name: 'Wallet Ledger', record: 'No matching debit in Q1 extract' },
      { name: 'NETC Mapper', record: 'Active tag conflict flag' },
    ],
  },
  'PB-2026-0415-003': {
    mismatchReason: 'Partial match — plaza ₹320 vs wallet ₹640 (possible duplicate plaza read)',
    timeline: [
      { at: '15 Apr 11:44', actor: 'NETC', event: 'Wallet debit ₹640 (2× class tariff)' },
      { at: '16 Apr 06:00', actor: 'NPCI MIS', event: 'Settlement shows single ₹320 line' },
      { at: '16 Apr 14:00', actor: 'Reconciliation', event: 'Escalated to scheme ops' },
      { at: '17 Apr 09:15', actor: 'Audit', event: 'Sampled for FT-11 walkthrough' },
    ],
    auditInsights: [
      'Escalated > 5 days — management review required per FT-11.',
      'Class 4 vs plaza Class 3 tariff mismatch suspected.',
    ],
    sourceSystems: [
      { name: 'NPCI Settlement MIS', record: 'Single line ₹320' },
      { name: 'Wallet Ledger', record: 'Debit ₹640' },
      { name: 'Plaza CCTV / lane log', record: 'Requested — pending' },
    ],
  },
  'PB-2026-0416-004': {
    mismatchReason: 'Amounts match but timing lag — settlement date ≠ wallet post date',
    timeline: [
      { at: '16 Apr 08:22', actor: 'NETC', event: 'Wallet debit ₹290' },
      { at: '17 Apr 06:00', actor: 'NPCI MIS', event: 'File received on T+1' },
      { at: '17 Apr 10:00', actor: 'Reconciliation', event: 'Open — date mismatch only' },
    ],
    auditInsights: ['Timing break only — monitor for T+2 rollover into material gap.'],
    sourceSystems: [
      { name: 'NPCI Settlement MIS', record: 'Amount matched' },
      { name: 'Wallet Ledger', record: 'Amount matched' },
    ],
  },
  'PB-2026-0417-005': {
    mismatchReason: 'Under investigation — acquirer fee component not in wallet extract',
    timeline: [
      { at: '17 Apr 07:10', actor: 'NETC', event: 'Debit ₹510' },
      { at: '17 Apr 18:00', actor: 'Treasury Ops', event: 'Fee component query raised to acquirer' },
    ],
    auditInsights: ['Treasury reviewing MDR pass-through vs customer debit.'],
    sourceSystems: [
      { name: 'NPCI Settlement MIS', record: 'Gross ₹510' },
      { name: 'Wallet Ledger', record: 'Net debit ₹510' },
      { name: 'Treasury Fee Schedule', record: 'Anand plaza MDR table' },
    ],
  },
  'PB-2026-0410-006': {
    mismatchReason: 'Wallet debited 10-Apr; plaza file still absent after 11 days',
    timeline: [
      { at: '10 Apr 16:55', actor: 'NETC', event: 'Debit ₹175' },
      { at: '11 Apr 06:00', actor: 'NPCI MIS', event: 'No line in 10-Apr file' },
      { at: '21 Apr 09:00', actor: 'Reconciliation', event: 'Still open — aged 11d' },
    ],
    auditInsights: [
      'Aged > 7 days — counts toward FT-11 deficient population.',
      'Recommend NPCI dispute and customer communication if debit valid.',
    ],
    sourceSystems: [
      { name: 'NPCI Settlement MIS', record: 'Missing across 7 cycles' },
      { name: 'Wallet Ledger', record: 'Debit confirmed' },
    ],
  },
};

const CHARGEBACK_DRILL_EXTRAS: Record<
  string,
  Omit<ChargebackDrillDetail, keyof ChargebackRecord>
> = {
  'CB-2026-0401': {
    timeline: [
      { at: '17 Apr 10:00', actor: 'Customer', event: 'Dispute raised — missing settlement' },
      { at: '18 Apr 14:00', actor: 'Scheme Ops', event: 'Filed with NPCI' },
      { at: '21 Apr 09:00', actor: 'Audit', event: 'TAT breached (7d)' },
    ],
    auditInsights: [
      'Plaza file missing from 16-Apr batch — aligns with FT-11 exception template.',
      'No refund voucher issued while dispute open (FT-12 overlap).',
    ],
    documents: [
      { name: 'Customer dispute form', status: 'available' },
      { name: 'NPCI dispute ACK', status: 'available' },
      { name: 'Plaza acquirer response', status: 'missing' },
    ],
  },
  'CB-2026-0402': {
    timeline: [
      { at: '15 Apr 16:20', actor: 'NETC', event: 'Duplicate timestamp detected' },
      { at: '16 Apr 09:00', actor: 'Reconciliation', event: 'Chargeback opened' },
    ],
    auditInsights: ['Duplicate debit — verify refund before closing (FT-12).'],
    documents: [
      { name: 'SIEM correlated events', status: 'available' },
      { name: 'Refund voucher', status: 'missing' },
    ],
  },
  'CB-2026-0403': {
    timeline: [
      { at: '12 Apr 11:00', actor: 'Customer', event: 'Wrong class tariff dispute' },
      { at: '14 Apr 08:00', actor: 'Scheme Ops', event: 'Filed with NPCI' },
    ],
    auditInsights: ['Filed within TAT — monitor closure proof.'],
    documents: [
      { name: 'VAHAN class proof', status: 'available' },
      { name: 'NPCI dispute ACK', status: 'available' },
    ],
  },
  'CB-2026-0404': {
    timeline: [
      { at: '14 Apr 12:00', actor: 'Customer', event: 'Wallet debited, no plaza entry' },
      { at: '16 Apr 09:00', actor: 'Reconciliation', event: 'Linked to PB-2026-0412-001' },
      { at: '21 Apr 09:00', actor: 'Audit', event: 'TAT breached' },
    ],
    auditInsights: ['Consolidate with Khalapur plaza break investigation.'],
    documents: [
      { name: 'Wallet debit proof', status: 'available' },
      { name: 'Plaza lane log', status: 'missing' },
    ],
  },
  'CB-2026-0405': {
    timeline: [
      { at: '08 Apr 09:00', actor: 'Customer', event: 'Closed without plaza reference' },
      { at: '13 Apr 15:00', actor: 'Audit', event: 'Re-opened for testing' },
    ],
    auditInsights: [
      'Closed in CRM without NPCI ref — FT-12 critical pattern.',
      '13 days age — regulatory complaint risk.',
    ],
    documents: [
      { name: 'CRM closure note', status: 'available' },
      { name: 'NPCI closure ref', status: 'missing' },
    ],
  },
};

function defaultPlazaExtras(row: PlazaBreakRecord): Omit<PlazaBreakDrillDetail, keyof PlazaBreakRecord> {
  return {
    mismatchReason: `${MISMATCH_TYPE_LABEL[row.mismatchType]} — see settlement vs wallet extracts`,
    timeline: [
      { at: row.settlementDate, actor: 'Reconciliation', event: `Break ${row.id} logged` },
    ],
    auditInsights: [`Owner: ${row.owner} · Age ${row.ageDays}d · Priority ${row.priority}`],
    sourceSystems: [
      { name: 'NPCI Settlement MIS', record: `Plaza ${row.plazaId}` },
      { name: 'Wallet Ledger', record: row.tagId },
    ],
  };
}

function defaultChargebackExtras(row: ChargebackRecord): Omit<ChargebackDrillDetail, keyof ChargebackRecord> {
  return {
    timeline: [{ at: row.raisedOn, actor: 'Customer', event: row.reason }],
    auditInsights: [`Status: ${row.status} · Age ${row.ageDays}d / TAT ${row.networkTatDays}d`],
    documents: [{ name: 'Dispute pack', status: row.evidenceStatus === 'complete' ? 'available' : 'missing' }],
  };
}

export function getPlazaBreakDrill(id: string): PlazaBreakDrillDetail | null {
  const row = PLAZA_BREAKS.find((r) => r.id === id);
  if (!row) return null;
  const extra = PLAZA_DRILL_EXTRAS[id] ?? defaultPlazaExtras(row);
  return { ...row, ...extra };
}

export function getChargebackDrill(id: string): ChargebackDrillDetail | null {
  const row = CHARGEBACKS.find((r) => r.id === id);
  if (!row) return null;
  const extra = CHARGEBACK_DRILL_EXTRAS[id] ?? defaultChargebackExtras(row);
  return { ...row, ...extra };
}

export function getMetricDrill(id: TollMetricDrillId): MetricDrillDetail {
  const s = TOLL_SETTLEMENT_SUMMARY;
  switch (id) {
    case 'debits':
      return {
        id,
        title: 'Toll debits — Q1 population',
        subtitle: s.periodLabel,
        kpis: [
          { label: 'Total debits', value: '42.18L', hint: '4,218,400 transactions' },
          { label: 'Avg daily', value: '46.9K', hint: '91 calendar days' },
          { label: 'NPCI cycle', value: s.npciCycle },
          { label: 'Issuer share', value: '12.4%', hint: 'of NETC issuer volume (mock)' },
        ],
        insights: [
          'Population for FT-11 is toll debits, not issuance cases — 4.2M events in Q1.',
          'Peak volume 16-Apr (53.8K debits) coincides with highest break count.',
          'Sample 380 debits stratified by plaza tier and dispute history for walkthrough.',
        ],
        rows: [
          { label: 'Highway / expressway', value: '68%', tone: 'ok' },
          { label: 'State highway plazas', value: '24%', tone: 'ok' },
          { label: 'City / parking', value: '8%', tone: 'warn' },
          { label: 'Debits with prior break', value: '1.2%', tone: 'bad' },
        ],
      };
    case 'match-rate':
      return {
        id,
        title: 'Plaza match rate — variance drivers',
        subtitle: `Portfolio ${s.matchedPct}% · Target ≥ 99.0%`,
        kpis: [
          { label: 'Portfolio match', value: `${s.matchedPct}%` },
          { label: 'Worst day (14 Apr)', value: '98.5%' },
          { label: 'Best day (11 Apr)', value: '98.9%' },
          { label: 'Gap to target', value: '0.3 pp', hint: 'vs 99.0% KPI' },
        ],
        insights: [
          'Three plazas drive 62% of break value: Khalapur, Krishnagiri, Dasna.',
          'T+1 file lag explains 28% of timing-only breaks; not yet material.',
          'Recommend daily auto-match job alert when day match < 98.5%.',
        ],
        rows: PLAZA_BREAKS.slice(0, 4).map((p) => ({
          label: p.plazaName,
          value: `₹${p.breakAmountInr.toLocaleString('en-IN')} · ${p.ageDays}d`,
          tone: p.status === 'escalated' || p.ageDays > 7 ? 'bad' : 'warn',
        })),
      };
    case 'plaza-breaks':
      return {
        id,
        title: 'Open plaza breaks — register slice',
        subtitle: `${s.openPlazaBreaks} open · ₹${(s.openBreakAmountInr / 100_000).toFixed(2)}L unexplained`,
        kpis: [
          { label: 'Open count', value: String(s.openPlazaBreaks) },
          { label: 'Escalated', value: String(PLAZA_BREAKS.filter((p) => p.status === 'escalated').length) },
          { label: 'Avg age', value: '6.2d' },
          { label: '> ₹50 rule hits', value: '14', hint: 'cumulative per tag/day' },
        ],
        insights: [
          '18 open breaks vs 14 issuances with toll exceptions — populations differ by design.',
          '6 breaks aged > 7 days — breach internal recon SLA.',
          'Click any row in the register below for case-level timeline and sources.',
        ],
        rows: PLAZA_BREAKS.map((p) => ({
          label: `${p.id} · ${p.vrn}`,
          value: `${p.status} · ₹${p.breakAmountInr}`,
          tone: p.status === 'open' && p.ageDays > 7 ? 'bad' : p.status === 'escalated' ? 'bad' : 'warn',
        })),
      };
    case 'chargebacks-tat':
      return {
        id,
        title: 'Chargebacks past network TAT',
        subtitle: `${s.chargebacksBreachedTat} breached of ${s.chargebacksOpen} open`,
        kpis: [
          { label: 'Breached TAT', value: String(s.chargebacksBreachedTat) },
          { label: 'Network TAT', value: 'T+5 days' },
          { label: 'Open total', value: String(s.chargebacksOpen) },
          { label: 'Closed Q1', value: '124', hint: 'mock' },
        ],
        insights: [
          'Five chargebacks exceed NPCI T+5 — counted as FT-11 critical exceptions.',
          'Two closed without NPCI reference (FT-12) — reopen for audit sample.',
          'Scheme ops backlog cited in management response dated 16 Apr.',
        ],
        rows: CHARGEBACKS.filter((c) => c.ageDays > c.networkTatDays).map((c) => ({
          label: c.id,
          value: `${c.ageDays}d · ${c.status}`,
          tone: 'bad' as const,
        })),
      };
    default:
      return getMetricDrill('debits');
  }
}

export function drillTitle(state: TollDrillState): string {
  if (!state) return '';
  switch (state.kind) {
    case 'metric':
      return getMetricDrill(state.id).title;
    case 'plaza-break': {
      const d = getPlazaBreakDrill(state.id);
      return d ? `${d.id} · ${d.plazaName}` : 'Plaza break';
    }
    case 'chargeback': {
      const d = getChargebackDrill(state.id);
      return d ? `${d.id} · ${d.vrn}` : 'Chargeback';
    }
    default:
      return '';
  }
}

export function drillSubtitle(state: TollDrillState): string | undefined {
  if (!state) return undefined;
  switch (state.kind) {
    case 'metric':
      return getMetricDrill(state.id).subtitle;
    case 'plaza-break': {
      const d = getPlazaBreakDrill(state.id);
      return d ? `${d.vrn} · ${d.tagId} · FT-11` : undefined;
    }
    case 'chargeback': {
      const d = getChargebackDrill(state.id);
      return d ? `${d.plazaName} · ${d.npciRef}` : undefined;
    }
    default:
      return undefined;
  }
}
