import type { JourneySelectionSummary } from './journeySelectionSummary';

export type JourneyAiInsightTone = 'critical' | 'warning' | 'info' | 'success';

export type JourneyAiInsightBlock = {
  id: string;
  label: string;
  tone: JourneyAiInsightTone;
  text: string;
  bullets?: string[];
};

export type JourneyAiInsightsMemo = {
  audience: string;
  headline: string;
  confidencePct: number;
  blocks: JourneyAiInsightBlock[];
};

export type JourneyAiInsightsCopy = {
  audience: string;
  portfolioHeadline: string;
  sliceHeadline: (heading: string) => string;
  sliceStageHeadline: (heading: string, stageLabel: string) => string;
  emptySelectionAction: string;
  cleanPortfolioAction: string;
  stageFocusAction: (stageLabel: string, controlHint: string) => string;
  criticalAction: (count: number) => string;
  exceptionAction: (count: number) => string;
  hotspotAction: (stageLabel: string, count: number) => string;
  defaultAction: string;
  portfolioScopeNoun: string;
  sliceScopeSuffix?: (heading: string, sliceMeta: string | null) => string;
  benchmarkBulletLabel: string;
};

function lifecycleNarrative(summary: JourneySelectionSummary): string {
  const active = summary.stageChart.filter((r) => r.findingCount > 0);
  if (active.length === 0) {
    return 'No material stage-level exceptions or in-review items in this selection — lifecycle controls are operating within the Q1 tolerance band.';
  }

  const sorted = [...active].sort((a, b) => b.findingCount - a.findingCount);
  const top = sorted.slice(0, 3);
  const quiet = summary.stageChart.filter((r) => r.findingCount === 0);

  const topPhrase = top
    .map((r) => `${r.label} (${r.findingCount} finding${r.findingCount === 1 ? '' : 's'}, ${r.sharePct}% of stage total)`)
    .join('; ');

  const quietPhrase =
    quiet.length > 0
      ? ` ${quiet.map((r) => r.label).join(', ')} ${quiet.length === 1 ? 'shows' : 'show'} no findings in scope.`
      : '';

  if (summary.stageFocus) {
    return `Heatmap focus on ${summary.stageFocus.label}: ${summary.stageFocus.count} of ${summary.totalCases} case${summary.totalCases === 1 ? '' : 's'} (${summary.stageFocus.sharePct}%) have an exception or in-review item at this stage. Broader lifecycle context — busiest stages in this slice: ${topPhrase}.${quietPhrase}`;
  }

  return `Exception concentration is highest at ${topPhrase}.${quietPhrase}`;
}

function recommendedAction(summary: JourneySelectionSummary, copy: JourneyAiInsightsCopy): string {
  const { posture, stageFocus, topControls, criticalCount, exceptionCount } = summary;

  if (summary.totalCases === 0) return copy.emptySelectionAction;

  if (summary.withFindings === 0) return copy.cleanPortfolioAction;

  if (stageFocus) {
    const ctrl = topControls[0];
    const ctrlBit = ctrl ? ` Start with control ${ctrl.id} (${ctrl.count} case${ctrl.count === 1 ? '' : 's'}).` : '';
    return copy.stageFocusAction(stageFocus.label, ctrlBit);
  }

  if (posture === 'critical' || criticalCount > 0) {
    return copy.criticalAction(criticalCount);
  }

  if (exceptionCount > 0 && posture !== 'low') {
    return copy.exceptionAction(exceptionCount);
  }

  const hotspot = summary.stageBreakdown[0];
  if (hotspot) {
    return copy.hotspotAction(hotspot.label, hotspot.findingCount);
  }

  return copy.defaultAction;
}

function metricBullets(summary: JourneySelectionSummary, copy: JourneyAiInsightsCopy): string[] {
  const bullets: string[] = [
    `${summary.totalCases} case${summary.totalCases === 1 ? '' : 's'} in scope · ${summary.postureLabel}`,
    `${summary.complianceRatePct}% compliant (${summary.compliantCount} of ${summary.totalCases})`,
    `${summary.withFindings} with stage findings (${summary.findingRatePct}% of selection)`,
  ];

  if (summary.criticalCount > 0) {
    bullets.push(`${summary.criticalCount} critical (rejected control)`);
  }
  if (summary.exceptionCount > 0) {
    bullets.push(`${summary.exceptionCount} in-review exception${summary.exceptionCount === 1 ? '' : 's'}`);
  }
  if (summary.rateVsPortfolioPp != null && summary.mode !== 'portfolio') {
    const dir = summary.rateVsPortfolioPp > 0 ? 'above' : summary.rateVsPortfolioPp < 0 ? 'below' : 'aligned with';
    bullets.push(
      summary.rateVsPortfolioPp === 0
        ? copy.benchmarkBulletLabel
        : `${Math.abs(summary.rateVsPortfolioPp)} pp ${dir} portfolio finding rate (${summary.portfolioFindingRatePct}%)`,
    );
  }
  if (summary.topControls.length > 0) {
    bullets.push(
      `Control concentration: ${summary.topControls
        .slice(0, 2)
        .map((c) => `${c.id} (${c.count})`)
        .join(' · ')}`,
    );
  }

  return bullets;
}

function executiveBrief(summary: JourneySelectionSummary, copy: JourneyAiInsightsCopy): string {
  const scope =
    summary.mode === 'portfolio'
      ? copy.portfolioScopeNoun
      : summary.mode === 'slice-stage'
        ? `${summary.heading} with heatmap focus on ${summary.stageFocus?.label ?? 'selected stage'}${copy.sliceScopeSuffix?.(summary.heading, summary.sliceMeta) ?? ''}`
        : `${summary.heading}${copy.sliceScopeSuffix?.(summary.heading, summary.sliceMeta) ?? ''}`;

  if (summary.totalCases === 0) {
    return `No cases match the current filter — unable to issue a management read-out for ${scope}.`;
  }

  if (summary.withFindings === 0) {
    return `For ${scope}: ${summary.primaryInsight} Posture is ${summary.postureLabel.toLowerCase()} — suitable for routine reporting.`;
  }

  return `For ${scope}: ${summary.primaryInsight} Overall posture is ${summary.postureLabel} — prepared for ${copy.audience} ahead of the journey-matrix walkthrough.`;
}

function confidenceFromPosture(summary: JourneySelectionSummary): number {
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

export function buildJourneyAiInsightsMemo(
  summary: JourneySelectionSummary,
  copy: JourneyAiInsightsCopy,
): JourneyAiInsightsMemo {
  const blocks: JourneyAiInsightBlock[] = [
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
      text: executiveBrief(summary, copy),
      bullets: metricBullets(summary, copy),
    },
    {
      id: 'lifecycle',
      label: 'Lifecycle signal',
      tone:
        summary.stageFocus || (summary.stageBreakdown[0]?.findingCount ?? 0) >= 3
          ? 'warning'
          : summary.withFindings > 0
            ? 'info'
            : 'success',
      text: lifecycleNarrative(summary),
    },
    {
      id: 'action',
      label: 'Recommended action',
      tone: summary.posture === 'critical' ? 'critical' : summary.posture === 'high' ? 'warning' : 'info',
      text: recommendedAction(summary, copy),
    },
  ];

  const headline =
    summary.mode === 'portfolio'
      ? copy.portfolioHeadline
      : summary.stageFocus
        ? copy.sliceStageHeadline(summary.heading, summary.stageFocus.label)
        : copy.sliceHeadline(summary.heading);

  return {
    audience: copy.audience,
    headline,
    confidencePct: confidenceFromPosture(summary),
    blocks,
  };
}
