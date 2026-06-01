import {
  FASTAG_REGION_LABEL,
  getFastTagCaseRegion,
  getFastTagRegionCaseCounts,
  getFastTagRegionFailedCounts,
} from './auditData';
import { getFastTagAllRtoCodes } from './fastTagCasePool';
import {
  getFastTagRegionMapRisk,
  type FastTagHeatRisk,
  type FastTagRegionPeerStat,
} from './fastTagJourneyHeatmap';

export type FastTagStateClusterRow = {
  regionCode: string;
  label: string;
  caseCount: number;
  failedCount: number;
  /** Share of cases with any stage finding (rejected or in review). */
  failRatePct: number;
  compliantCount: number;
  criticalCount: number;
  exceptionCount: number;
  /** Signed change vs prior period (stable demo delta from region volume). */
  deltaVsPrior: number;
  trend7d: number[];
  risk: FastTagHeatRisk;
  riskLabel: 'Low' | 'Medium' | 'High';
};

type CaseLike = {
  id?: string;
  subject?: string;
  overallStatus?: string;
  trail?: { status: string }[];
};

function buildOutcomeCountsByRegion(
  cases: CaseLike[],
): Record<string, { compliant: number; critical: number; exception: number }> {
  const counts: Record<string, { compliant: number; critical: number; exception: number }> = {};
  for (const kase of cases) {
    const code = getFastTagCaseRegion(kase);
    if (!code) continue;
    if (!counts[code]) counts[code] = { compliant: 0, critical: 0, exception: 0 };
    if (kase.overallStatus === 'failure') counts[code].critical += 1;
    else if (kase.overallStatus === 'pending') counts[code].exception += 1;
    else if (kase.overallStatus === 'compliant') counts[code].compliant += 1;
  }
  return counts;
}

function stableHash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function deltaVsPriorPeriod(regionCode: string, caseCount: number, failedCount: number): number {
  const h = stableHash(`${regionCode}:${caseCount}:${failedCount}`);
  return (h % 5) - 2;
}

/** Seven-day volume spark — deterministic shape per state for UI trend column. */
function buildTrend7d(regionCode: string, caseCount: number): number[] {
  const base = Math.max(1, Math.round(caseCount / 7));
  const bars: number[] = [];
  for (let day = 0; day < 7; day += 1) {
    const h = stableHash(`${regionCode}:d${day}`);
    const jitter = (h % 5) - 2;
    bars.push(Math.max(1, base + jitter));
  }
  return bars;
}

function riskToLabel(risk: FastTagHeatRisk): 'Low' | 'Medium' | 'High' {
  if (risk === 'critical' || risk === 'high') return 'High';
  if (risk === 'medium') return 'Medium';
  return 'Low';
}

type BuildStateClusterOptions = {
  /** List every Indian RTO on the map (36), including zero-case rows in this selection. */
  allIndianStates?: boolean;
};

/** Ranked state rows for the current case selection (map RTO / VRN region). */
export function buildFastTagStateClusterRows(
  cases: CaseLike[],
  options?: BuildStateClusterOptions,
): FastTagStateClusterRow[] {
  const caseCounts = getFastTagRegionCaseCounts(cases);
  const failedCounts = getFastTagRegionFailedCounts(cases);
  const outcomeByRegion = buildOutcomeCountsByRegion(cases);
  const codes = options?.allIndianStates
    ? getFastTagAllRtoCodes()
    : Object.keys(caseCounts);

  if (codes.length === 0) return [];

  const sortedCodes = [...codes].sort(
    (a, b) =>
      (caseCounts[b] ?? 0) - (caseCounts[a] ?? 0) ||
      (FASTAG_REGION_LABEL[a] ?? a).localeCompare(FASTAG_REGION_LABEL[b] ?? b),
  );

  const peers: FastTagRegionPeerStat[] = sortedCodes.map((code) => ({
    total: caseCounts[code] ?? 0,
    failed: failedCounts[code] ?? 0,
  }));

  return sortedCodes.map((regionCode) => {
    const caseCount = caseCounts[regionCode] ?? 0;
    const failedCount = failedCounts[regionCode] ?? 0;
    const outcomes = outcomeByRegion[regionCode] ?? {
      compliant: 0,
      critical: 0,
      exception: 0,
    };
    const failRatePct =
      caseCount > 0 ? Math.round((failedCount / caseCount) * 1000) / 10 : 0;
    const risk = getFastTagRegionMapRisk(failedCount, caseCount, peers);
    return {
      regionCode,
      label: FASTAG_REGION_LABEL[regionCode] ?? regionCode,
      caseCount,
      failedCount,
      failRatePct,
      compliantCount: outcomes.compliant,
      criticalCount: outcomes.critical,
      exceptionCount: outcomes.exception,
      deltaVsPrior: deltaVsPriorPeriod(regionCode, caseCount, failedCount),
      trend7d: buildTrend7d(regionCode, caseCount),
      risk,
      riskLabel: riskToLabel(risk),
    };
  });
}
