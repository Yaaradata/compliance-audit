import {
  aggregateARS,
  aggregateCES,
  aggregateKRIBreachRatePct,
  aggregateOpenIncidents30d,
  aggregateOverdueOpenPreventiveActions,
  aggregateRES,
  issues,
  reportingClocks,
  riskDomains,
  risks,
} from '../../dataModel';
import { bandFromScore } from '../../theme';
import type { DomainHeatmapCell, ExecutiveRiskPostureViewModel, MetricStatus, PostureMetric } from './types';

function metricStatusFromScore(score: number, opts?: { invert?: boolean; green?: number; amber?: number }): MetricStatus {
  const green = opts?.green ?? 80;
  const amber = opts?.amber ?? 60;
  const s = opts?.invert ? 100 - score : score;
  if (s >= green) return 'good';
  if (s >= amber) return 'warning';
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

function domainTrend(domainRisks: typeof risks): DomainHeatmapCell['trend'] {
  if (domainRisks.some((r) => r.residual_rating_trend === 'deteriorating' || r.residual_rating_trend === 'rapidly_deteriorating')) {
    return 'deteriorating';
  }
  if (domainRisks.every((r) => r.residual_rating_trend === 'stable')) return 'stable';
  return 'improving';
}

function openIssuesForRisk(riskId: string): number {
  return issues.filter((i) => !i.closed_at && i.linked_risk_ids.includes(riskId)).length;
}

export function buildExecutiveRiskPostureViewModel(): ExecutiveRiskPostureViewModel {
  const res = aggregateRES();
  const ces = aggregateCES();
  const kriBreachPct = aggregateKRIBreachRatePct();
  const openIncidents30d = aggregateOpenIncidents30d();
  const overdueOpenPa = aggregateOverdueOpenPreventiveActions();
  const ars = aggregateARS();

  const metrics: PostureMetric[] = [
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

  const domains: DomainHeatmapCell[] = riskDomains.map((d) => {
    const domainRisks = risks.filter((r) => r.domain_id === d.domain_id);
    const resScore = domainRisks.length
      ? Math.round(domainRisks.reduce((sum, r) => sum + r.res_score, 0) / domainRisks.length)
      : 0;
    const openIssueCount = domainRisks.reduce((sum, r) => sum + openIssuesForRisk(r.risk_id), 0);

    return {
      domainId: d.domain_id,
      code: d.domain_id,
      title: d.title,
      regulatoryAnchor: d.regulatory_anchor,
      resScore,
      band: bandFromScore(resScore),
      trend: domainTrend(domainRisks),
      riskCount: domainRisks.length,
      openIssueCount,
      primaryRiskId: domainRisks[0]?.risk_id ?? null,
    };
  });

  const atRiskClockCount = reportingClocks.filter((c) => c.current_status === 'at_risk').length;

  return { metrics, domains, atRiskClockCount };
}
