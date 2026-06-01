import { FASTAG_INDIA_SCOPE_HEADING } from './auditData';
import type { FastTagSelectionSummary } from './fastTagRegionSummary';

export type FastTagAiInsightTone = 'critical' | 'warning' | 'info' | 'success';

export type FastTagAiInsightBlock = {
  id: string;
  label: string;
  tone: FastTagAiInsightTone;
  text: string;
  bullets?: string[];
};

export type FastTagAiInsightsMemo = {
  audience: string;
  headline: string;
  confidencePct: number;
  blocks: FastTagAiInsightBlock[];
};

function lifecycleNarrative(summary: FastTagSelectionSummary): string {
  const top = summary.stageBreakdown[0];
  if (!top) {
    return 'No stage-level findings in this selection.';
  }
  const next = summary.stageBreakdown[1];
  if (summary.stageFocus) {
    return `Focus: ${summary.stageFocus.label}. Busiest stage: ${top.label} (${top.findingCount} findings).`;
  }
  if (next) {
    return `Busiest stages: ${top.label}, then ${next.label}.`;
  }
  return `Busiest stage: ${top.label} (${top.findingCount} findings).`;
}

function recommendedAction(summary: FastTagSelectionSummary): string {
  if (summary.totalCases === 0) {
    return 'Pick Overall or a state to see actions.';
  }
  if (summary.withFindings === 0) {
    return 'No action — continue routine Q1 monitoring.';
  }
  if (summary.criticalCount > 0) {
    return `Escalate ${summary.criticalCount} critical case${summary.criticalCount === 1 ? '' : 's'} to CRO within 5 days.`;
  }
  if (summary.exceptionCount > 0) {
    return `Clear ${summary.exceptionCount} in-review case${summary.exceptionCount === 1 ? '' : 's'} with the issuance lead.`;
  }
  const hotspot = summary.stageBreakdown[0];
  return hotspot
    ? `Review ${hotspot.label} with process owner before sign-off.`
    : 'Maintain weekly heatmap review with RTO owners.';
}

function metricBullets(summary: FastTagSelectionSummary): string[] {
  const bullets = [
    `${summary.totalCases} cases · ${summary.postureLabel}`,
    `${summary.complianceRatePct}% compliant · ${summary.findingRatePct}% with findings`,
  ];
  if (summary.criticalCount > 0) {
    bullets.push(`${summary.criticalCount} critical`);
  }
  if (summary.exceptionCount > 0) {
    bullets.push(`${summary.exceptionCount} in review`);
  }
  return bullets.slice(0, 4);
}

function lifecycleBullets(summary: FastTagSelectionSummary): string[] {
  return summary.stageBreakdown
    .slice(0, 2)
    .map((r) => `${r.label}: ${r.findingCount} findings`);
}

function actionBullets(summary: FastTagSelectionSummary): string[] {
  const bullets: string[] = [];
  const ctrl = summary.topControls[0];
  if (ctrl) bullets.push(`Retest ${ctrl.id}`);
  if (summary.posture === 'critical' || summary.posture === 'high') {
    bullets.push('Brief CRO on closure timeline');
  }
  return bullets.slice(0, 2);
}

function executiveBrief(summary: FastTagSelectionSummary): string {
  if (summary.totalCases === 0) {
    return 'No cases in this selection.';
  }
  return summary.primaryInsight;
}

function confidenceFromPosture(summary: FastTagSelectionSummary): number {
  const base =
    summary.posture === 'critical'
      ? 92
      : summary.posture === 'high'
        ? 88
        : summary.posture === 'medium'
          ? 84
          : 78;
  return summary.totalCases >= 20 ? base : Math.max(72, base - 6);
}

/** Short CRO / FastTag memo for the current selection. */
export function buildFastTagAiInsightsMemo(summary: FastTagSelectionSummary): FastTagAiInsightsMemo {
  const blocks: FastTagAiInsightBlock[] = [
    {
      id: 'executive',
      label: 'Executive brief',
      tone:
        summary.posture === 'critical'
          ? 'critical'
          : summary.posture === 'high'
            ? 'warning'
            : summary.withFindings === 0
              ? 'success'
              : 'info',
      text: executiveBrief(summary),
      bullets: metricBullets(summary),
    },
    {
      id: 'lifecycle',
      label: 'Lifecycle signal',
      tone:
        summary.stageFocus || (summary.stageBreakdown[0]?.findingCount ?? 0) >= 20
          ? 'warning'
          : summary.withFindings > 0
            ? 'info'
            : 'success',
      text: lifecycleNarrative(summary),
      bullets: lifecycleBullets(summary),
    },
    {
      id: 'action',
      label: 'Recommended action',
      tone: summary.posture === 'critical' ? 'critical' : summary.posture === 'high' ? 'warning' : 'info',
      text: recommendedAction(summary),
      bullets: actionBullets(summary),
    },
  ];

  const headline =
    summary.mode === 'national'
      ? `${FASTAG_INDIA_SCOPE_HEADING} — FastTag read-out`
      : summary.stageFocus
        ? `${summary.heading} · ${summary.stageFocus.label}`
        : `${summary.heading} read-out`;

  return {
    audience: 'CRO · Operations · FastTag lead',
    headline,
    confidencePct: confidenceFromPosture(summary),
    blocks,
  };
};
