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
    return `Heatmap focus on ${summary.stageFocus.label}: ${summary.stageFocus.count} of ${summary.totalCases} case${summary.totalCases === 1 ? '' : 's'} (${summary.stageFocus.sharePct}%) have an exception or in-review item at this stage. Broader lifecycle context — busiest stages nationally in this slice: ${topPhrase}.${quietPhrase}`;
  }

  return `Exception concentration is highest at ${topPhrase}.${quietPhrase}`;
}

function recommendedAction(summary: FastTagSelectionSummary): string {
  const { posture, stageFocus, topControls, criticalCount, exceptionCount } = summary;

  if (summary.totalCases === 0) {
    return 'Widen the map or heatmap selection to include issuance cases before issuing a management response.';
  }

  if (summary.withFindings === 0) {
    return 'No immediate remediation — continue Q1 sampling at Issuance and Activation and retain regional benchmarks on the monthly FastTag pack.';
  }

  if (stageFocus) {
    const ctrl = topControls[0];
    const ctrlBit = ctrl ? ` Start with control ${ctrl.id} (${ctrl.count} case${ctrl.count === 1 ? '' : 's'}).` : '';
    return `Direct the FastTag issuance lead to replay evidence and sign-off at ${stageFocus.label} within five business days; brief the CRO if closure slips.${ctrlBit}`;
  }

  if (posture === 'critical' || criticalCount > 0) {
    return `Escalate to CRO / Head of Operations: ${criticalCount} critical rejection${criticalCount === 1 ? '' : 's'} require root-cause closure before the audit pack is signed off.`;
  }

  if (exceptionCount > 0 && posture !== 'low') {
    return `FastTag product officer to clear ${exceptionCount} in-review exception${exceptionCount === 1 ? '' : 's'} and confirm NPCI / issuer evidence on the top lifecycle hotspot before the next committee read-out.`;
  }

  const hotspot = summary.stageBreakdown[0];
  if (hotspot) {
    return `Prioritize walkthrough at ${hotspot.label} with process owner and 2LoD — ${hotspot.findingCount} case${hotspot.findingCount === 1 ? '' : 's'} drive most of the finding rate in this selection.`;
  }

  return 'Maintain weekly heatmap review with regional RTO owners until finding rate trends below the national benchmark.';
}

function metricBullets(summary: FastTagSelectionSummary): string[] {
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
  if (summary.rateVsNationalPp != null && summary.mode !== 'national') {
    const dir = summary.rateVsNationalPp > 0 ? 'above' : summary.rateVsNationalPp < 0 ? 'below' : 'aligned with';
    bullets.push(
      summary.rateVsNationalPp === 0
        ? 'Finding rate matches all-India benchmark'
        : `${Math.abs(summary.rateVsNationalPp)} pp ${dir} national finding rate (${summary.nationalFindingRatePct}%)`,
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

function executiveBrief(summary: FastTagSelectionSummary): string {
  const scope =
    summary.mode === 'national'
      ? 'the all-India Q1 FastTag issuance sample'
      : summary.mode === 'state-stage'
        ? `${summary.heading} with heatmap focus on ${summary.stageFocus?.label ?? 'selected stage'}`
        : `${summary.heading} (RTO ${summary.rtoCode ?? '—'})`;

  if (summary.totalCases === 0) {
    return `No cases match the current map and heatmap filter — unable to issue a management read-out for ${scope}.`;
  }

  if (summary.withFindings === 0) {
    return `For ${scope}: ${summary.primaryInsight} Posture is ${summary.postureLabel.toLowerCase()} — suitable for routine reporting to the CRO and FastTag governance forum.`;
  }

  return `For ${scope}: ${summary.primaryInsight} Overall posture is ${summary.postureLabel} — this brief is prepared for the CRO, Head of Operations, and FastTag issuance officer ahead of the journey-matrix walkthrough.`;
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

/** CRO / FastTag-officer memo derived from the current regional summary selection. */
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
    },
    {
      id: 'action',
      label: 'Recommended action',
      tone: summary.posture === 'critical' ? 'critical' : summary.posture === 'high' ? 'warning' : 'info',
      text: recommendedAction(summary),
    },
  ];

  const headline =
    summary.mode === 'national'
      ? `${FASTAG_INDIA_SCOPE_HEADING} FastTag issuance — management read-out`
      : summary.stageFocus
        ? `${summary.heading} · ${summary.stageFocus.label} focus`
        : `${summary.heading} — regional issuance read-out`;

  return {
    audience: 'CRO · Head of Operations · FastTag Issuance Officer',
    headline,
    confidencePct: confidenceFromPosture(summary),
    blocks,
  };
}
