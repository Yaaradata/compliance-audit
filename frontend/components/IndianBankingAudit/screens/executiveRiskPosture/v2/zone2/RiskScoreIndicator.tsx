'use client';

import { RISK_SCORE_TOOLTIP, riskScoreDotColor, riskScoreTone } from './computeIssueRiskScore';

const DOT_TITLE: Record<ReturnType<typeof riskScoreTone>, string> = {
  rose: 'High risk',
  amber: 'Elevated risk',
  emerald: 'Lower risk',
};

/** Compact risk score — number plus red / amber / green status dot. */
export function RiskScoreIndicator({ score, className = '' }: { score: number; className?: string }) {
  const tone = riskScoreTone(score);
  const dotColor = riskScoreDotColor(score);

  return (
    <span
      className={`inline-flex items-center justify-end gap-1.5 font-mono text-sm font-bold tabular-nums text-[#111827] ${className}`}
      title={`${RISK_SCORE_TOOLTIP} · ${DOT_TITLE[tone]}`}
    >
      {score}
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: dotColor }}
        aria-hidden
      />
    </span>
  );
}
