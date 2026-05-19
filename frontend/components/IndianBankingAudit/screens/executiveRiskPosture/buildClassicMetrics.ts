import {
  aggregateARS,
  aggregateCES,
  aggregateKRIBreachRatePct,
  aggregateOpenIncidents30d,
  aggregateOverdueOpenPreventiveActions,
  aggregateRES,
} from '../../dataModel';
import type { ClassicPostureMetric, MetricStatus } from './types';

function metricStatusFromScore(score: number, opts?: { green?: number; amber?: number }): MetricStatus {
  const green = opts?.green ?? 80;
  const amber = opts?.amber ?? 60;
  if (score >= green) return 'good';
  if (score >= amber) return 'warning';
  return 'danger';
}

function metricStatusFromKriBreach(pct: number): MetricStatus {
  if (pct <= 15) return 'good';
  if (pct <= 35) return 'warning';
  return 'danger';
}

function metricStatusFromCount(count: number, goodMax: number, warnMax: number): MetricStatus {
  if (count <= goodMax) return 'good';
  if (count <= warnMax) return 'warning';
  return 'danger';
}

/** v1 — six-card executive KPI strip (RES, CES, KRI, incidents, overdue PA, ARS). */
export function buildClassicMetrics(): ClassicPostureMetric[] {
  const res = aggregateRES();
  const ces = aggregateCES();
  const kriBreachPct = aggregateKRIBreachRatePct();
  const openIncidents30d = aggregateOpenIncidents30d();
  const overdueOpenPa = aggregateOverdueOpenPreventiveActions();
  const ars = aggregateARS();

  return [
    {
      id: 'res',
      label: 'RES (residual)',
      value: String(res),
      sub: 'across 9 domains',
      status: metricStatusFromScore(res),
      trend: '→',
    },
    {
      id: 'ces',
      label: 'CES (controls)',
      value: ces != null ? String(ces) : '—',
      sub: 'weighted across active controls',
      status: ces != null ? metricStatusFromScore(ces) : 'neutral',
      trend: '↑',
    },
    {
      id: 'kri',
      label: 'KRI breach rate',
      value: `${kriBreachPct}%`,
      sub: 'Latest obs ≥ amber threshold',
      status: metricStatusFromKriBreach(kriBreachPct),
      trend: '↑',
    },
    {
      id: 'incidents',
      label: 'Open incidents (30d)',
      value: String(openIncidents30d),
      sub: 'Not closed · discovered in window',
      status: metricStatusFromCount(openIncidents30d, 2, 6),
      trend: '↓',
    },
    {
      id: 'overdue-pa',
      label: 'Overdue preventive actions',
      value: String(overdueOpenPa),
      sub: 'Status open · target in the past',
      status: metricStatusFromCount(overdueOpenPa, 0, 4),
      trend: '→',
    },
    {
      id: 'ars',
      label: 'Inspection readiness',
      value: String(ars),
      sub: 'ARS · weighted across packs',
      status: metricStatusFromScore(ars, { green: 85, amber: 70 }),
      trend: '→',
    },
  ];
}
