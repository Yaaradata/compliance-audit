import {
  FASTAG_REGION_LABEL,
  getFastTagRegionCaseCounts,
  getFastTagRegionFailedCounts,
} from './auditData';
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
  /** Signed change vs prior period (stable demo delta from region volume). */
  deltaVsPrior: number;
  trend7d: number[];
  risk: FastTagHeatRisk;
  riskLabel: 'Low' | 'Medium' | 'High';
};

type CaseLike = { id?: string; subject?: string; trail?: { status: string }[] };

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

/** Ranked state rows for the current case selection (map RTO / VRN region). */
export function buildFastTagStateClusterRows(cases: CaseLike[]): FastTagStateClusterRow[] {
  const caseCounts = getFastTagRegionCaseCounts(cases);
  const failedCounts = getFastTagRegionFailedCounts(cases);
  const codes = Object.keys(caseCounts).sort(
    (a, b) => caseCounts[b]! - caseCounts[a]! || a.localeCompare(b),
  );

  if (codes.length === 0) return [];

  const peers: FastTagRegionPeerStat[] = codes.map((code) => ({
    total: caseCounts[code] ?? 0,
    failed: failedCounts[code] ?? 0,
  }));

  return codes.map((regionCode) => {
    const caseCount = caseCounts[regionCode] ?? 0;
    const failedCount = failedCounts[regionCode] ?? 0;
    const risk = getFastTagRegionMapRisk(failedCount, caseCount, peers);
    return {
      regionCode,
      label: FASTAG_REGION_LABEL[regionCode] ?? regionCode,
      caseCount,
      failedCount,
      deltaVsPrior: deltaVsPriorPeriod(regionCode, caseCount, failedCount),
      trend7d: buildTrend7d(regionCode, caseCount),
      risk,
      riskLabel: riskToLabel(risk),
    };
  });
}
