import { issues, reportingClocks, riskDomains, risks } from '../../dataModel';
import { bandFromScore } from '../../theme';
import type { DomainHeatmapCell } from './types';

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

export function buildDomainHeatmapCells(): DomainHeatmapCell[] {
  return riskDomains.map((d) => {
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
}

export function buildAtRiskClockCount(): number {
  return reportingClocks.filter((c) => c.current_status === 'at_risk').length;
}
