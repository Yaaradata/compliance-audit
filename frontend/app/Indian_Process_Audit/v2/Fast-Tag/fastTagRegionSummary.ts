import type { AutoKpiTone } from '@/components/scope3emissions/scope3-kpi';
import { FASTAG_INDIA_SCOPE_HEADING, FASTAG_REGION_LABEL } from './auditData';
import { isFastTagStageAuditFinding } from './fastTagJourneyHeatmap';
import type { FastTagSop } from './fastTagCaseBuilder';

export type FastTagCaseForSummary = {
  id: string;
  subject?: string;
  scenario: string;
  failStageId?: string;
  failControlId?: string;
  journeyException?: string;
  overallStatus?: string;
  trail: { stage: { id: string; name: string }; status: string }[];
};

export type FastTagSelectionMode = 'national' | 'state' | 'state-stage';

export type FastTagAuditPosture = 'low' | 'medium' | 'high' | 'critical';

export type FastTagStageBreakdownRow = {
  stageId: string;
  label: string;
  findingCount: number;
  sharePct: number;
};

export type FastTagControlExposure = {
  id: string;
  count: number;
  sharePct: number;
};

export type FastTagSummaryFinding = {
  id: string;
  tone: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  detail: string;
};

export type FastTagKpiTones = {
  compliance: AutoKpiTone;
  findings: AutoKpiTone;
  critical: AutoKpiTone;
  exception: AutoKpiTone;
};

/** Map audit metrics to Scope 3 hero KPI colour tones (value-driven). */
export function getFastTagKpiTones(summary: {
  complianceRatePct: number;
  findingRatePct: number;
  criticalCount: number;
  exceptionCount: number;
  totalCases: number;
}): FastTagKpiTones {
  const { complianceRatePct, findingRatePct, criticalCount, exceptionCount, totalCases } = summary;
  const criticalShare = totalCases > 0 ? criticalCount / totalCases : 0;
  const exceptionShare = totalCases > 0 ? exceptionCount / totalCases : 0;

  const compliance: AutoKpiTone =
    complianceRatePct >= 80
      ? 'emerald'
      : complianceRatePct >= 55
        ? 'teal'
        : complianceRatePct >= 35
          ? 'amber'
          : 'rose';

  const findings: AutoKpiTone =
    findingRatePct >= 60
      ? 'rose'
      : findingRatePct >= 40
        ? 'amber'
        : findingRatePct >= 20
          ? 'violet'
          : findingRatePct > 0
            ? 'blue'
            : 'emerald';

  const critical: AutoKpiTone =
    criticalShare >= 0.45
      ? 'rose'
      : criticalShare >= 0.25
        ? 'amber'
        : criticalCount > 0
          ? 'violet'
          : 'emerald';

  const exception: AutoKpiTone =
    exceptionShare >= 0.25
      ? 'amber'
      : exceptionCount > 0
        ? 'blue'
        : 'slate';

  return { compliance, findings, critical, exception };
}

export type FastTagSelectionSummary = {
  mode: FastTagSelectionMode;
  heading: string;
  rtoCode: string | null;
  posture: FastTagAuditPosture;
  postureLabel: string;
  primaryInsight: string;
  totalCases: number;
  withFindings: number;
  criticalCount: number;
  exceptionCount: number;
  compliantCount: number;
  findingRatePct: number;
  complianceRatePct: number;
  nationalFindingRatePct: number | null;
  rateVsNationalPp: number | null;
  stageFocus: { stageId: string; label: string; count: number; sharePct: number } | null;
  /** All lifecycle stages in SOP order — for journey chart. */
  stageChart: FastTagStageBreakdownRow[];
  stageBreakdown: FastTagStageBreakdownRow[];
  topControls: FastTagControlExposure[];
  findings: FastTagSummaryFinding[];
};

type BuildSummaryInput = {
  cases: FastTagCaseForSummary[];
  allCases: FastTagCaseForSummary[];
  sop: FastTagSop;
  regionCode: string;
  stageFilter: string | null;
  viewAllIndia: boolean;
  getStageHeader: (stage: { id: string; name: string }) => string;
};

function hasAnyFinding(kase: FastTagCaseForSummary): boolean {
  return kase.trail.some((t) => t.status === 'rejected' || t.status === 'pending');
}

function nationalFindingRate(allCases: FastTagCaseForSummary[]): number {
  if (allCases.length === 0) return 0;
  const withFindings = allCases.filter(hasAnyFinding).length;
  return Math.round((withFindings / allCases.length) * 1000) / 10;
}

function derivePosture(
  findingRatePct: number,
  criticalCount: number,
  totalCases: number,
): { posture: FastTagAuditPosture; label: string } {
  if (totalCases === 0) return { posture: 'low', label: 'No sample' };
  const criticalShare = criticalCount / totalCases;
  if (findingRatePct >= 70 || criticalShare >= 0.5) {
    return { posture: 'critical', label: 'Critical exposure' };
  }
  if (findingRatePct >= 45 || criticalShare >= 0.3) {
    return { posture: 'high', label: 'Elevated risk' };
  }
  if (findingRatePct >= 20 || criticalCount > 0) {
    return { posture: 'medium', label: 'Moderate attention' };
  }
  return { posture: 'low', label: 'Within tolerance' };
}

function buildPrimaryInsight(input: {
  mode: FastTagSelectionMode;
  heading: string;
  totalCases: number;
  withFindings: number;
  findingRatePct: number;
  complianceRatePct: number;
  stageFocus: FastTagSelectionSummary['stageFocus'];
  topStage: { label: string; count: number } | null;
  rateVsNationalPp: number | null;
  postureLabel: string;
}): string {
  const {
    mode,
    heading,
    totalCases,
    withFindings,
    findingRatePct,
    complianceRatePct,
    stageFocus,
    topStage,
    rateVsNationalPp,
  } = input;

  if (totalCases === 0) {
    return 'No issuance cases match the current map and heatmap selection.';
  }

  if (withFindings === 0) {
    return mode === 'national'
      ? 'National Q1 sample shows no stage-level exceptions or in-review items in this selection.'
      : `${heading} has a clean issuance sample — all ${totalCases} case${totalCases === 1 ? '' : 's'} passed every lifecycle stage.`;
  }

  if (stageFocus) {
    return `${stageFocus.count} of ${totalCases} case${totalCases === 1 ? '' : 's'} (${stageFocus.sharePct}%) have a finding at ${stageFocus.label} — prioritize evidence replay at this stage.`;
  }

  const nationalBit =
    rateVsNationalPp != null && mode !== 'national'
      ? rateVsNationalPp > 0
        ? ` Finding rate is ${Math.abs(rateVsNationalPp)} pp above the national sample.`
        : rateVsNationalPp < 0
          ? ` Finding rate is ${Math.abs(rateVsNationalPp)} pp below the national sample.`
          : ' Finding rate matches the national sample.'
      : '';

  if (topStage) {
    return `${withFindings} of ${totalCases} cases (${findingRatePct}%) carry stage findings; ${topStage.label} is the busiest stage (${topStage.count} case${topStage.count === 1 ? '' : 's'}).${nationalBit}`;
  }

  return `${complianceRatePct}% compliant (${totalCases - withFindings} of ${totalCases}); ${withFindings} case${withFindings === 1 ? '' : 's'} need audit follow-up.${nationalBit}`;
}

function buildFindings(input: {
  mode: FastTagSelectionMode;
  totalCases: number;
  criticalCount: number;
  exceptionCount: number;
  compliantCount: number;
  stageFocus: FastTagSelectionSummary['stageFocus'];
  topStage: { label: string; count: number } | null;
  topControls: FastTagControlExposure[];
  rateVsNationalPp: number | null;
}): FastTagSummaryFinding[] {
  const items: FastTagSummaryFinding[] = [];

  if (input.criticalCount > 0) {
    items.push({
      id: 'critical',
      tone: 'critical',
      title: `${input.criticalCount} critical case${input.criticalCount === 1 ? '' : 's'}`,
      detail: 'Control failure recorded — remediation required before closure.',
    });
  }

  if (input.exceptionCount > 0) {
    items.push({
      id: 'exception',
      tone: 'warning',
      title: `${input.exceptionCount} in-review exception${input.exceptionCount === 1 ? '' : 's'}`,
      detail: 'Evidence or approval pending from the accountable process owner.',
    });
  }

  if (input.stageFocus) {
    items.push({
      id: 'stage-focus',
      tone: 'warning',
      title: `Heatmap focus: ${input.stageFocus.label}`,
      detail: `${input.stageFocus.count} finding${input.stageFocus.count === 1 ? '' : 's'} at this stage in the current filter.`,
    });
  } else if (input.topStage) {
    items.push({
      id: 'hotspot',
      tone: 'warning',
      title: `Lifecycle hotspot: ${input.topStage.label}`,
      detail: `Highest concentration of stage findings (${input.topStage.count} case${input.topStage.count === 1 ? '' : 's'}).`,
    });
  }

  if (input.topControls.length > 0) {
    items.push({
      id: 'controls',
      tone: 'info',
      title: 'Control concentration',
      detail: input.topControls
        .map((c) => `${c.id} · ${c.count} case${c.count === 1 ? '' : 's'} (${c.sharePct}%)`)
        .join(' · '),
    });
  }

  if (input.rateVsNationalPp != null && input.mode !== 'national') {
    items.push({
      id: 'vs-national',
      tone: input.rateVsNationalPp > 5 ? 'warning' : input.rateVsNationalPp < -5 ? 'success' : 'info',
      title: 'Vs national sample',
      detail:
        input.rateVsNationalPp === 0
          ? 'Finding rate aligns with the all-India benchmark.'
          : input.rateVsNationalPp > 0
            ? `${input.rateVsNationalPp} percentage points above the national finding rate.`
            : `${Math.abs(input.rateVsNationalPp)} percentage points below the national finding rate.`,
    });
  }

  if (input.compliantCount > 0) {
    items.push({
      id: 'compliant',
      tone: 'success',
      title: `${input.compliantCount} fully compliant`,
      detail: 'All lifecycle stages passed in the Q1 issuance sample.',
    });
  }

  return items;
}

export function buildFastTagSelectionSummary({
  cases,
  allCases,
  sop,
  regionCode,
  stageFilter,
  viewAllIndia,
  getStageHeader,
}: BuildSummaryInput): FastTagSelectionSummary {
  const totalCases = cases.length;
  const withFindings = cases.filter(hasAnyFinding).length;
  const criticalCount = cases.filter((k) => k.overallStatus === 'failure').length;
  const exceptionCount = cases.filter((k) => k.overallStatus === 'pending').length;
  const compliantCount = cases.filter((k) => k.overallStatus === 'compliant').length;
  const findingRatePct =
    totalCases > 0 ? Math.round((withFindings / totalCases) * 1000) / 10 : 0;
  const complianceRatePct =
    totalCases > 0 ? Math.round((compliantCount / totalCases) * 1000) / 10 : 0;

  const nationalRate = nationalFindingRate(allCases);
  const rateVsNationalPp =
    !viewAllIndia && regionCode && totalCases > 0
      ? Math.round((findingRatePct - nationalRate) * 10) / 10
      : null;

  const mode: FastTagSelectionMode = viewAllIndia
    ? 'national'
    : stageFilter
      ? 'state-stage'
      : 'state';

  const stateName = regionCode ? (FASTAG_REGION_LABEL[regionCode] ?? regionCode) : null;
  const heading = viewAllIndia ? FASTAG_INDIA_SCOPE_HEADING : (stateName ?? 'Selection');
  const rtoCode = viewAllIndia ? null : regionCode || null;

  const stageChart: FastTagStageBreakdownRow[] = sop.stages.map((stage) => {
    const label = getStageHeader(stage);
    let findingCount = 0;
    for (const kase of cases) {
      if (isFastTagStageAuditFinding(kase, stage.id)) findingCount += 1;
    }
    return {
      stageId: stage.id,
      label,
      findingCount,
      sharePct:
        withFindings > 0 ? Math.round((findingCount / withFindings) * 1000) / 10 : 0,
    };
  });

  const stageBreakdown = stageChart
    .filter((row) => row.findingCount > 0)
    .sort((a, b) => b.findingCount - a.findingCount);

  let topStage: { label: string; count: number } | null = null;
  for (const row of stageBreakdown) {
    if (!topStage || row.findingCount > topStage.count) {
      topStage = { label: row.label, count: row.findingCount };
    }
  }

  const stageFocus = stageFilter
    ? (() => {
        const st = sop.stages.find((s) => s.id === stageFilter);
        const label = st ? getStageHeader(st) : stageFilter;
        const count = cases.filter((k) => isFastTagStageAuditFinding(k, stageFilter)).length;
        return {
          stageId: stageFilter,
          label,
          count,
          sharePct: totalCases > 0 ? Math.round((count / totalCases) * 1000) / 10 : 0,
        };
      })()
    : null;

  const controlCounts = new Map<string, number>();
  for (const kase of cases) {
    if (!kase.failControlId || !hasAnyFinding(kase)) continue;
    controlCounts.set(kase.failControlId, (controlCounts.get(kase.failControlId) ?? 0) + 1);
  }
  const topControls: FastTagControlExposure[] = [...controlCounts.entries()]
    .map(([id, count]) => ({
      id,
      count,
      sharePct:
        withFindings > 0 ? Math.round((count / withFindings) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const { posture, label: postureLabel } = derivePosture(
    findingRatePct,
    criticalCount,
    totalCases,
  );

  const primaryInsight = buildPrimaryInsight({
    mode,
    heading,
    totalCases,
    withFindings,
    findingRatePct,
    complianceRatePct,
    stageFocus,
    topStage,
    rateVsNationalPp,
    postureLabel,
  });

  const findings = buildFindings({
    mode,
    totalCases,
    criticalCount,
    exceptionCount,
    compliantCount,
    stageFocus,
    topStage,
    topControls,
    rateVsNationalPp,
  });

  return {
    mode,
    heading,
    rtoCode,
    posture,
    postureLabel,
    primaryInsight,
    totalCases,
    withFindings,
    criticalCount,
    exceptionCount,
    compliantCount,
    findingRatePct,
    complianceRatePct,
    nationalFindingRatePct: nationalRate,
    rateVsNationalPp,
    stageFocus,
    stageChart,
    stageBreakdown,
    topControls,
    findings,
  };
}
