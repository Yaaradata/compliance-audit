/**
 * Obligation Coverage — derived view over `regIntelMockData.alerts[].obligations[]`.
 *
 * Each row is an atomic obligation with its parent regulatory alert metadata
 * attached so the screen can render a regulator-lens list without re-walking
 * the alerts tree on every render.
 */

import { alerts as regIntelAlerts } from './regIntelMockData';
import type {
  CoverageStatus,
  HitlStatus,
  ObligationRecord,
  RegAlertRecord,
  RegSource,
} from './regIntelMockData';

export type ObligationCoverageRow = ObligationRecord & {
  parent: {
    alert_id: string;
    source: RegAlertRecord['source'];
    source_label: string;
    instrument_type: RegAlertRecord['instrument_type'];
    instrument_name: string;
    instrument_ref: string;
    publication_date: string;
    materiality_score: number;
    accountable_sm: string;
    accountable_sm_role: string;
    domain: string;
    stage: RegAlertRecord['stage'];
    penalty_exposure: string[];
    source_url: string;
  };
};

export const obligationCoverageRows: ObligationCoverageRow[] = regIntelAlerts.flatMap((alert) =>
  alert.obligations.map((o) => ({
    ...o,
    parent: {
      alert_id: alert.id,
      source: alert.source,
      source_label: alert.source_label,
      instrument_type: alert.instrument_type,
      instrument_name: alert.instrument_name,
      instrument_ref: alert.instrument_ref,
      publication_date: alert.publication_date,
      materiality_score: alert.materiality_score,
      accountable_sm: alert.accountable_sm,
      accountable_sm_role: alert.accountable_sm_role,
      domain: alert.domain,
      stage: alert.stage,
      penalty_exposure: alert.penalty_exposure,
      source_url: alert.source_url,
    },
  }))
);

export interface ObligationCoverageKpi {
  total: number;
  uncovered: number;
  partial: number;
  covered: number;
  pending_hitl: number;
  approved: number;
  avg_confidence: number;
  /** average CES of linked controls across linked obligations (skips obligations with no controls). */
  avg_linked_ces: number;
  instruments_count: number;
  sources: RegSource[];
}

export function computeObligationCoverageKpi(rows: ObligationCoverageRow[]): ObligationCoverageKpi {
  const total = rows.length;
  const uncovered = rows.filter((r) => r.coverage_status === 'uncovered').length;
  const partial = rows.filter((r) => r.coverage_status === 'partial').length;
  const covered = rows.filter((r) => r.coverage_status === 'covered').length;
  const pending = rows.filter((r) => r.hitl_status === 'pending').length;
  const approved = rows.filter((r) => r.hitl_status === 'approved').length;
  const avgConf =
    rows.length > 0 ? Math.round(rows.reduce((s, r) => s + r.confidence, 0) / rows.length) : 0;
  const cesRows = rows.filter((r) => typeof r.linked_control_ces === 'number');
  const avgCes =
    cesRows.length > 0
      ? Math.round(cesRows.reduce((s, r) => s + (r.linked_control_ces as number), 0) / cesRows.length)
      : 0;
  const instruments = new Set(rows.map((r) => r.parent.instrument_ref));
  const sources = Array.from(
    new Set(rows.map((r) => r.parent.source).filter((s): s is RegSource => s !== 'IBA'))
  );
  return {
    total,
    uncovered,
    partial,
    covered,
    pending_hitl: pending,
    approved,
    avg_confidence: avgConf,
    avg_linked_ces: avgCes,
    instruments_count: instruments.size,
    sources,
  };
}

export const OBLIGATION_COVERAGE_PILL_ORDER: Array<'all' | CoverageStatus> = [
  'all',
  'uncovered',
  'partial',
  'covered',
];

export const OBLIGATION_HITL_PILL_ORDER: Array<'all' | HitlStatus> = ['all', 'pending', 'approved', 'rejected'];

export function obligationDomainSet(rows: ObligationCoverageRow[]): string[] {
  return Array.from(new Set(rows.map((r) => r.domain))).sort();
}
