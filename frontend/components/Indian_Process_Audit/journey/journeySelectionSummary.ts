import type { AutoKpiTone } from '@/components/scope3emissions/scope3-kpi';
import { isJourneyStageAuditFinding } from './journeyHeatmap';

export type JourneyCaseForSummary = {
  id: string;
  subject?: string;
  scenario: string;
  failStageId?: string;
  failControlId?: string;
  journeyException?: string;
  overallStatus?: string;
  trail: { stage: { id: string; name: string }; status: string }[];
};

export type JourneySelectionMode = 'portfolio' | 'slice' | 'slice-stage';

export type JourneyAuditPosture = 'low' | 'medium' | 'high' | 'critical';

export type JourneyStageBreakdownRow = {
  stageId: string;
  label: string;
  findingCount: number;
  sharePct: number;
};

export type JourneyControlExposure = {
  id: string;
  count: number;
  sharePct: number;
};

export type JourneySummaryFinding = {
  id: string;
  tone: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  detail: string;
};

export type JourneyKpiTones = {
  compliance: AutoKpiTone;
  findings: AutoKpiTone;
  critical: AutoKpiTone;
  exception: AutoKpiTone;
};

export type JourneySelectionSummary = {
  mode: JourneySelectionMode;
  heading: string;
  sliceMeta: string | null;
  posture: JourneyAuditPosture;
  postureLabel: string;
  primaryInsight: string;
  totalCases: number;
  withFindings: number;
  criticalCount: number;
  exceptionCount: number;
  compliantCount: number;
  findingRatePct: number;
  complianceRatePct: number;
  portfolioFindingRatePct: number | null;
  rateVsPortfolioPp: number | null;
  stageFocus: { stageId: string; label: string; count: number; sharePct: number } | null;
  stageChart: JourneyStageBreakdownRow[];
  stageBreakdown: JourneyStageBreakdownRow[];
  topControls: JourneyControlExposure[];
  findings: JourneySummaryFinding[];
};

export type JourneySummaryCopy = {
  portfolioHeading: string;
  emptySelectionInsight: string;
  cleanPortfolioInsight: string;
  cleanSliceInsight: (heading: string, totalCases: number) => string;
  vsBenchmarkTitle: string;
  compliantDetail: string;
};

type JourneySop = { stages: { id: string; name: string }[] };

type BuildSummaryInput = {
  cases: JourneyCaseForSummary[];
  allCases: JourneyCaseForSummary[];
  sop: JourneySop;
  sliceId: string;
  sliceLabel: string | null;
  sliceMeta: string | null;
  stageFilter: string | null;
  viewAllPortfolio: boolean;
  getStageHeader: (stage: { id: string; name: string }) => string;
  copy: JourneySummaryCopy;
};

function hasAnyFinding(kase: JourneyCaseForSummary): boolean {
  return kase.trail.some((t) => t.status === 'rejected' || t.status === 'pending');
}

function portfolioFindingRate(allCases: JourneyCaseForSummary[]): number {
  if (allCases.length === 0) return 0;
  const withFindings = allCases.filter(hasAnyFinding).length;
  return Math.round((withFindings / allCases.length) * 1000) / 10;
}

function derivePosture(
  findingRatePct: number,
  criticalCount: number,
  totalCases: number,
): { posture: JourneyAuditPosture; label: string } {
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

export function getJourneyKpiTones(summary: {
  complianceRatePct: number;
  findingRatePct: number;
  criticalCount: number;
  exceptionCount: number;
  totalCases: number;
}): JourneyKpiTones {
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
    exceptionShare >= 0.25 ? 'amber' : exceptionCount > 0 ? 'blue' : 'slate';

  return { compliance, findings, critical, exception };
}

function buildPrimaryInsight(
  input: {
    mode: JourneySelectionMode;
    heading: string;
    totalCases: number;
    withFindings: number;
    findingRatePct: number;
    complianceRatePct: number;
    stageFocus: JourneySelectionSummary['stageFocus'];
    topStage: { label: string; count: number } | null;
    rateVsPortfolioPp: number | null;
  },
  copy: JourneySummaryCopy,
): string {
  const {
    mode,
    heading,
    totalCases,
    withFindings,
    findingRatePct,
    complianceRatePct,
    stageFocus,
    topStage,
    rateVsPortfolioPp,
  } = input;

  if (totalCases === 0) return copy.emptySelectionInsight;

  if (withFindings === 0) {
    return mode === 'portfolio'
      ? copy.cleanPortfolioInsight
      : copy.cleanSliceInsight(heading, totalCases);
  }

  if (stageFocus) {
    return `${stageFocus.count} of ${totalCases} case${totalCases === 1 ? '' : 's'} (${stageFocus.sharePct}%) have a finding at ${stageFocus.label} — prioritize evidence replay at this stage.`;
  }

  const benchmarkBit =
    rateVsPortfolioPp != null && mode !== 'portfolio'
      ? rateVsPortfolioPp > 0
        ? ` Finding rate is ${Math.abs(rateVsPortfolioPp)} pp above the portfolio sample.`
        : rateVsPortfolioPp < 0
          ? ` Finding rate is ${Math.abs(rateVsPortfolioPp)} pp below the portfolio sample.`
          : ' Finding rate matches the portfolio sample.'
      : '';

  if (topStage) {
    return `${withFindings} of ${totalCases} cases (${findingRatePct}%) carry stage findings; ${topStage.label} is the busiest stage (${topStage.count} case${topStage.count === 1 ? '' : 's'}).${benchmarkBit}`;
  }

  return `${complianceRatePct}% compliant (${totalCases - withFindings} of ${totalCases}); ${withFindings} case${withFindings === 1 ? '' : 's'} need audit follow-up.${benchmarkBit}`;
}

function buildFindings(
  input: {
    mode: JourneySelectionMode;
    totalCases: number;
    criticalCount: number;
    exceptionCount: number;
    compliantCount: number;
    stageFocus: JourneySelectionSummary['stageFocus'];
    topStage: { label: string; count: number } | null;
    topControls: JourneyControlExposure[];
    rateVsPortfolioPp: number | null;
  },
  copy: JourneySummaryCopy,
): JourneySummaryFinding[] {
  const items: JourneySummaryFinding[] = [];

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

  if (input.rateVsPortfolioPp != null && input.mode !== 'portfolio') {
    items.push({
      id: 'vs-portfolio',
      tone: input.rateVsPortfolioPp > 5 ? 'warning' : input.rateVsPortfolioPp < -5 ? 'success' : 'info',
      title: copy.vsBenchmarkTitle,
      detail:
        input.rateVsPortfolioPp === 0
          ? 'Finding rate aligns with the portfolio benchmark.'
          : input.rateVsPortfolioPp > 0
            ? `${input.rateVsPortfolioPp} percentage points above the portfolio finding rate.`
            : `${Math.abs(input.rateVsPortfolioPp)} percentage points below the portfolio finding rate.`,
    });
  }

  if (input.compliantCount > 0) {
    items.push({
      id: 'compliant',
      tone: 'success',
      title: `${input.compliantCount} fully compliant`,
      detail: copy.compliantDetail,
    });
  }

  return items;
}

export function buildJourneySelectionSummary({
  cases,
  allCases,
  sop,
  sliceId,
  sliceLabel,
  sliceMeta,
  stageFilter,
  viewAllPortfolio,
  getStageHeader,
  copy,
}: BuildSummaryInput): JourneySelectionSummary {
  const totalCases = cases.length;
  const withFindings = cases.filter(hasAnyFinding).length;
  const criticalCount = cases.filter((k) => k.overallStatus === 'failure').length;
  const exceptionCount = cases.filter((k) => k.overallStatus === 'pending').length;
  const compliantCount = cases.filter((k) => k.overallStatus === 'compliant').length;
  const findingRatePct =
    totalCases > 0 ? Math.round((withFindings / totalCases) * 1000) / 10 : 0;
  const complianceRatePct =
    totalCases > 0 ? Math.round((compliantCount / totalCases) * 1000) / 10 : 0;

  const portfolioRate = portfolioFindingRate(allCases);
  const rateVsPortfolioPp =
    !viewAllPortfolio && sliceId && totalCases > 0
      ? Math.round((findingRatePct - portfolioRate) * 10) / 10
      : null;

  const mode: JourneySelectionMode = viewAllPortfolio
    ? 'portfolio'
    : stageFilter
      ? 'slice-stage'
      : 'slice';

  const heading = viewAllPortfolio ? copy.portfolioHeading : (sliceLabel ?? 'Selection');

  const stageChart: JourneyStageBreakdownRow[] = sop.stages.map((stage) => {
    const label = getStageHeader(stage);
    let findingCount = 0;
    for (const kase of cases) {
      if (isJourneyStageAuditFinding(kase, stage.id)) findingCount += 1;
    }
    return {
      stageId: stage.id,
      label,
      findingCount,
      sharePct: withFindings > 0 ? Math.round((findingCount / withFindings) * 1000) / 10 : 0,
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
        const count = cases.filter((k) => isJourneyStageAuditFinding(k, stageFilter)).length;
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
  const topControls: JourneyControlExposure[] = [...controlCounts.entries()]
    .map(([id, count]) => ({
      id,
      count,
      sharePct: withFindings > 0 ? Math.round((count / withFindings) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const { posture, label: postureLabel } = derivePosture(
    findingRatePct,
    criticalCount,
    totalCases,
  );

  const primaryInsight = buildPrimaryInsight(
    {
      mode,
      heading,
      totalCases,
      withFindings,
      findingRatePct,
      complianceRatePct,
      stageFocus,
      topStage,
      rateVsPortfolioPp,
    },
    copy,
  );

  const findings = buildFindings(
    {
      mode,
      totalCases,
      criticalCount,
      exceptionCount,
      compliantCount,
      stageFocus,
      topStage,
      topControls,
      rateVsPortfolioPp,
    },
    copy,
  );

  return {
    mode,
    heading,
    sliceMeta: viewAllPortfolio ? null : sliceMeta,
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
    portfolioFindingRatePct: portfolioRate,
    rateVsPortfolioPp,
    stageFocus,
    stageChart,
    stageBreakdown,
    topControls,
    findings,
  };
}
