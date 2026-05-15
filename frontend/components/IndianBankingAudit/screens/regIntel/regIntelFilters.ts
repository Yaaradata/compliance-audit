import type { KPISummary, RegAlertRecord } from '@/lib/IndianBankingAudit/regIntelMockData';

export type RegIntelSubTab = 'alerts' | 'consultations' | 'peer';

/** Extra criteria from KPI tile clicks — drill-down spans all inbox lanes. */
export type RegIntelKpiLinkFilter =
  | null
  | 'in_flight'
  | 'pending_cco_ack'
  | 'effective_within_30'
  | 'uncovered';

export function alertInFlight(alert: RegAlertRecord): boolean {
  return alert.stage !== 'closed';
}

export function alertPendingCcoAck(alert: RegAlertRecord): boolean {
  return alert.stage === 'acknowledge';
}

export function alertEffectiveWithin30(alert: RegAlertRecord): boolean {
  return (
    alert.days_to_effective !== null &&
    alert.days_to_effective >= 0 &&
    alert.days_to_effective <= 30
  );
}

export function alertHasUncoveredObligations(alert: RegAlertRecord): boolean {
  return alert.uncovered_count > 0;
}

/** Recompute headline KPI counts from live `alerts[]` (drawer metrics keep `baseline`). */
export function computeKpiSummary(alerts: RegAlertRecord[], baseline: KPISummary): KPISummary {
  return {
    ...baseline,
    total_in_flight: alerts.filter(alertInFlight).length,
    pending_cco_ack: alerts.filter(alertPendingCcoAck).length,
    effective_within_30_days: alerts.filter(alertEffectiveWithin30).length,
    uncovered_obligations: alerts.filter(alertHasUncoveredObligations).length,
    pending_hitl: alerts.reduce((n, a) => n + a.obligations_pending_hitl, 0),
  };
}

/** Pass 6 — publication_date window (preset or inclusive custom ISO dates). */
export type RegIntelDateRangePreset = 'all' | '7d' | '30d' | '90d' | '12m' | 'custom';
export type RegIntelDateRangeFilter =
  | 'all'
  | '7d'
  | '30d'
  | '90d'
  | '12m'
  | { from: string; to: string };

function startOfUtcDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function parseLocalDate(isoDate: string): number {
  const [y, m, d] = isoDate.split('-').map((x) => parseInt(x, 10));
  if (!y || !m || !d) return NaN;
  return new Date(y, m - 1, d).getTime();
}

/** True if alert.publication_date falls in range relative to `now` (local calendar dates). */
export function publicationInDateRange(alert: RegAlertRecord, range: RegIntelDateRangeFilter, now: Date = new Date()): boolean {
  if (range === 'all') return true;
  const pubTime = parseLocalDate(alert.publication_date);
  if (Number.isNaN(pubTime)) return true;
  if (typeof range === 'object' && range.from && range.to) {
    const fromT = parseLocalDate(range.from);
    const toT = parseLocalDate(range.to);
    if (Number.isNaN(fromT) || Number.isNaN(toT)) return true;
    return pubTime >= fromT && pubTime <= toT;
  }
  const preset = range as Exclude<RegIntelDateRangeFilter, { from: string; to: string }>;
  const dayMs = 86400000;
  const todayStart = startOfUtcDay(now);
  let days = 0;
  if (preset === '7d') days = 7;
  else if (preset === '30d') days = 30;
  else if (preset === '90d') days = 90;
  else if (preset === '12m') days = 365;
  else return true;
  const cutoff = todayStart - days * dayMs;
  return pubTime >= cutoff;
}

export function alertMatchesSearchTerm(alert: RegAlertRecord, raw: string): boolean {
  const q = raw.trim().toLowerCase();
  if (!q) return true;
  if (alert.instrument_name.toLowerCase().includes(q)) return true;
  if (alert.instrument_ref.toLowerCase().includes(q)) return true;
  if (alert.domain.toLowerCase().includes(q)) return true;
  for (const o of alert.obligations) {
    if (o.text.toLowerCase().includes(q)) return true;
    if (o.cited_paragraph_text.toLowerCase().includes(q)) return true;
  }
  return false;
}

export function filterAlertsBySearchTerm(alerts: RegAlertRecord[], raw: string): RegAlertRecord[] {
  return alerts.filter((a) => alertMatchesSearchTerm(a, raw));
}

export function countAlertsBySubTab(alerts: RegAlertRecord[]) {
  return {
    alerts: alerts.filter((a) => !a.is_peer_signal && a.instrument_type !== 'DRAFT DIRECTION').length,
    consultations: alerts.filter((a) => a.instrument_type === 'DRAFT DIRECTION').length,
    peer: alerts.filter((a) => a.is_peer_signal).length,
  };
}

/** Pill label → `RegAlertRecord.source` (must match mock). */
export const SOURCE_FILTER_TO_SOURCE: Record<string, RegAlertRecord['source']> = {
  RBI: 'RBI',
  'FIU-IND': 'FIU-IND',
  'CERT-In': 'CERT-IN',
  'MoF / Gazette': 'MOF',
  SEBI: 'SEBI',
  NPCI: 'NPCI',
};

export const SOURCE_PILL_ORDER = [
  'All Sources',
  'RBI',
  'FIU-IND',
  'CERT-In',
  'MoF / Gazette',
  'SEBI',
  'NPCI',
] as const;

export type SourcePillId = (typeof SOURCE_PILL_ORDER)[number];

export const STAGE_PILL_ORDER = [
  'All Stages',
  'Acknowledge',
  'Assess',
  'Assign',
  'Implement',
  'Certify',
  'Closed',
] as const;

export type StagePillId = (typeof STAGE_PILL_ORDER)[number];

function stagePillToField(pill: string): RegAlertRecord['stage'] | null {
  if (pill === 'All Stages') return null;
  return pill.toLowerCase() as RegAlertRecord['stage'];
}

export type RegIntelComputeFilterOpts = {
  activeSubTab: RegIntelSubTab;
  activeSourceFilter: SourcePillId | string;
  activeStatusFilter: StagePillId | string;
  kpiLinkFilter: RegIntelKpiLinkFilter;
  /** Pass 6 — case-insensitive multi-field match (applied after core filters). */
  searchTerm?: string;
  /** Pass 6 — `publication_date` window. */
  dateRangeFilter?: RegIntelDateRangeFilter;
  /** Pass 6 — penalty exposure + peer signals only. */
  penaltyOnlyFilter?: boolean;
  /** Reference "today" for date presets (tests / storybook). */
  now?: Date;
};

/**
 * Sub-tab, source, stage, KPI link, publication date, penalty-only — **no** search text.
 */
export function computeFilteredAlertsCore(alerts: RegAlertRecord[], opts: RegIntelComputeFilterOpts): RegAlertRecord[] {
  let list = [...alerts];

  if (opts.kpiLinkFilter) {
    switch (opts.kpiLinkFilter) {
      case 'in_flight':
        list = list.filter(alertInFlight);
        break;
      case 'pending_cco_ack':
        list = list.filter(alertPendingCcoAck);
        break;
      case 'effective_within_30':
        list = list.filter(alertEffectiveWithin30);
        break;
      case 'uncovered':
        list = list.filter(alertHasUncoveredObligations);
        break;
      default:
        break;
    }
  } else if (opts.activeSubTab === 'alerts') {
    list = list.filter((a) => !a.is_peer_signal && a.instrument_type !== 'DRAFT DIRECTION');
  } else if (opts.activeSubTab === 'consultations') {
    list = list.filter((a) => a.instrument_type === 'DRAFT DIRECTION');
  } else {
    list = list.filter((a) => a.is_peer_signal);
  }

  if (opts.activeSourceFilter !== 'All Sources') {
    const src = SOURCE_FILTER_TO_SOURCE[opts.activeSourceFilter];
    if (src) list = list.filter((a) => a.source === src);
  }

  const stageKey = stagePillToField(opts.activeStatusFilter);
  if (stageKey && !opts.kpiLinkFilter) {
    list = list.filter((a) => a.stage === stageKey);
  }

  const dateRange = opts.dateRangeFilter ?? 'all';
  const now = opts.now ?? new Date();
  list = list.filter((a) => publicationInDateRange(a, dateRange, now));

  if (opts.penaltyOnlyFilter) {
    list = list.filter((a) => a.penalty_exposure.length > 0 || a.is_peer_signal);
  }

  return list;
}

/**
 * Applies sub-tab, source, status, KPI-link, date, penalty, then search (Pass 6).
 */
export function computeFilteredAlerts(alerts: RegAlertRecord[], opts: RegIntelComputeFilterOpts): RegAlertRecord[] {
  const core = computeFilteredAlertsCore(alerts, opts);
  return filterAlertsBySearchTerm(core, opts.searchTerm ?? '');
}

/** Inbox sort: emergency → expedited → peer (by materiality) → standard/advisory → draft last (REG_INTEL_SPEC Pass 4). */
export function sortInboxAlerts(alerts: RegAlertRecord[]): RegAlertRecord[] {
  const tier = (a: RegAlertRecord): number => {
    if (a.instrument_type === 'DRAFT DIRECTION') return 4;
    if (a.is_peer_signal) return 2;
    if (a.governance_track === 'emergency') return 0;
    if (a.governance_track === 'expedited') return 1;
    return 3;
  };

  const daysKey = (a: RegAlertRecord) =>
    a.days_to_effective == null || a.days_to_effective < 0 ? 99999 : a.days_to_effective;

  return [...alerts].sort((a, b) => {
    const ta = tier(a);
    const tb = tier(b);
    if (ta !== tb) return ta - tb;
    if (ta === 2) return b.materiality_score - a.materiality_score;
    if (ta === 4) return b.publication_date.localeCompare(a.publication_date);
    const da = daysKey(a);
    const db = daysKey(b);
    if (da !== db) return da - db;
    if (b.materiality_score !== a.materiality_score) return b.materiality_score - a.materiality_score;
    return b.publication_date.localeCompare(a.publication_date);
  });
}
