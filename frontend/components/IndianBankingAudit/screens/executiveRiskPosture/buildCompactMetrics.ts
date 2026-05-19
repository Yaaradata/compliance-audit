import {
  aggregateCES,
  aggregateKRIBreachRatePct,
  aggregateOpenIncidents30d,
  aggregateRES,
} from '../../dataModel';
import type { CompactPostureMetric, MetricStatus } from './types';

function metricStatusFromScore(score: number): MetricStatus {
  if (score >= 80) return 'good';
  if (score >= 60) return 'warning';
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

/** v2 — four executive KPI cards (RES, CES, KRI breach rate, open incidents). */
export function buildCompactMetrics(): CompactPostureMetric[] {
  const res = aggregateRES();
  const ces = aggregateCES();
  const kriBreachPct = aggregateKRIBreachRatePct();
  const openIncidents30d = aggregateOpenIncidents30d();

  return [
    {
      id: 'res',
      label: 'Residual risk',
      value: String(res),
      valueSuffix: '/100',
      sub: 'Enterprise posture is amber; pressure is concentrated in AML, outsourcing and lending controls.',
      status: metricStatusFromScore(res),
      trendLabel: '+4 WoW',
      trendTone: 'up',
    },
    {
      id: 'ces',
      label: 'Control health',
      value: ces != null ? ces.toFixed(1) : '—',
      valueSuffix: ces != null ? 'CES' : undefined,
      sub: 'Control estate is broadly stable, but exceptions are clustered in three domains.',
      status: ces != null ? metricStatusFromScore(ces) : 'neutral',
      trendLabel: 'stable',
      trendTone: 'stable',
    },
    {
      id: 'kri',
      label: 'KRI breach rate',
      value: `${kriBreachPct}%`,
      sub: 'Above appetite; AML SLA and third-party KRIs require CRO action this week.',
      status: metricStatusFromKriBreach(kriBreachPct),
      trendLabel: '+9 WoW',
      trendTone: 'up',
    },
    {
      id: 'incidents',
      label: 'Open incidents (30d)',
      value: String(openIncidents30d),
      sub: 'Not closed · discovered in window; review severe and near-miss items this week.',
      status: metricStatusFromCount(openIncidents30d, 2, 6),
      trendLabel: '↓ WoW',
      trendTone: 'down',
    },
  ];
}
