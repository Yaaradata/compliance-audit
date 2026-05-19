import type { Issue } from '../../../../dataModel';

const SEVERITY_SCORE: Record<string, number> = {
  critical: 100,
  high: 85,
  medium: 55,
  low: 25,
};

const MAX_AGE_DAYS = 60;

export const RISK_SCORE_TOOLTIP = 'Ranked by: Severity (40%) · Age (35%) · MRA flag (25%)';

export function computeIssueRiskScore(issue: Issue): number {
  const severity = SEVERITY_SCORE[issue.severity] ?? 40;
  const ageNorm = Math.min(100, Math.round((issue.ageing_days / MAX_AGE_DAYS) * 100));
  const mra = issue.rbi_mra_flag ? 100 : 0;
  return Math.round(severity * 0.4 + ageNorm * 0.35 + mra * 0.25);
}

export type RiskScoreTone = 'rose' | 'amber' | 'emerald';

/** Traffic-light band for issue watchlist risk score. */
export function riskScoreTone(score: number): RiskScoreTone {
  if (score > 80) return 'rose';
  if (score >= 60) return 'amber';
  return 'emerald';
}

/** @deprecated Use riskScoreTone */
export const riskScoreBarTone = riskScoreTone;

const DOT_COLOR: Record<RiskScoreTone, string> = {
  rose: '#EF4444',
  amber: '#F59E0B',
  emerald: '#22C55E',
};

export function riskScoreDotColor(score: number): string {
  return DOT_COLOR[riskScoreTone(score)];
}
