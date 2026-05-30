import type { JourneyCaseLike } from './journeyCaseTypes';

export type JourneyHeatRisk = 'none' | 'low' | 'medium' | 'high' | 'critical';

export type JourneyStageHeatCell = {
  stageId: string;
  stageName: string;
  shortLabel: string;
  failureCount: number;
  totalInScope: number;
  failureRate: number;
  risk: JourneyHeatRisk;
};

type JourneySop = { stages: { id: string; name: string }[] };

const HEAT_STYLES: Record<
  JourneyHeatRisk,
  { cell: string; hover: string; active: string; text: string }
> = {
  none: {
    cell: 'bg-slate-100 ring-slate-200/80 text-slate-600',
    hover: 'hover:bg-slate-200/80',
    active: 'ring-2 ring-slate-400',
    text: 'text-slate-600',
  },
  low: {
    cell: 'bg-emerald-100 ring-emerald-200/90 text-emerald-900',
    hover: 'hover:bg-emerald-200/70',
    active: 'ring-2 ring-emerald-500',
    text: 'text-emerald-900',
  },
  medium: {
    cell: 'bg-amber-100 ring-amber-200/90 text-amber-950',
    hover: 'hover:bg-amber-200/80',
    active: 'ring-2 ring-amber-500',
    text: 'text-amber-950',
  },
  high: {
    cell: 'bg-orange-200 ring-orange-300/90 text-orange-950',
    hover: 'hover:bg-orange-300/80',
    active: 'ring-2 ring-orange-600',
    text: 'text-orange-950',
  },
  critical: {
    cell: 'bg-red-300 ring-red-400/90 text-red-950',
    hover: 'hover:bg-red-400/80',
    active: 'ring-2 ring-red-600',
    text: 'text-red-950',
  },
};

export function getJourneyHeatCellStyles(risk: JourneyHeatRisk) {
  return HEAT_STYLES[risk];
}

export function getJourneyHeatRiskTier(count: number, maxCount: number): JourneyHeatRisk {
  if (count <= 0) return 'none';
  if (count >= 4 || (maxCount > 0 && count / maxCount >= 0.85)) return 'critical';
  if (count >= 3 || (maxCount > 0 && count / maxCount >= 0.55)) return 'high';
  if (count >= 2 || (maxCount > 0 && count / maxCount >= 0.28)) return 'medium';
  return 'low';
}

export function getJourneyStageTrailItem(kase: JourneyCaseLike, stageId: string) {
  return kase.trail.find((t) => t.stage.id === stageId);
}

export function isJourneyStageAuditFinding(kase: JourneyCaseLike, stageId: string): boolean {
  const status = getJourneyStageTrailItem(kase, stageId)?.status;
  return status === 'rejected' || status === 'pending';
}

export function isJourneyCaseAuditFinding(kase: JourneyCaseLike): boolean {
  return kase.trail.some((t) => t.status === 'rejected' || t.status === 'pending');
}

export function filterCasesBySlice<T extends JourneyCaseLike>(
  cases: T[],
  sliceId: string | null,
  resolveSlice: (kase: T) => string | null,
): T[] {
  if (!sliceId) return cases;
  return cases.filter((k) => resolveSlice(k) === sliceId);
}

function countStageFindings(
  cases: JourneyCaseLike[],
  sop: JourneySop,
): { stage: JourneySop['stages'][number]; failures: number; total: number }[] {
  return sop.stages.map((stage) => {
    let failures = 0;
    for (const kase of cases) {
      if (isJourneyStageAuditFinding(kase, stage.id)) failures += 1;
    }
    return { stage, failures, total: cases.length };
  });
}

function buildPortfolioStageRiskById(
  cases: JourneyCaseLike[],
  sop: JourneySop,
): Map<string, JourneyHeatRisk> {
  const portfolio = countStageFindings(cases, sop);
  const maxFailures = Math.max(0, ...portfolio.map((c) => c.failures));
  return new Map(
    portfolio.map(({ stage, failures }) => [
      stage.id,
      failures > 0 ? getJourneyHeatRiskTier(failures, maxFailures) : 'none',
    ]),
  );
}

export function buildJourneyStageHeatmap(
  cases: JourneyCaseLike[],
  sop: JourneySop,
  sliceId: string | null,
  getStageHeader: (stage: { id: string; name: string }) => string,
  resolveSlice: (kase: JourneyCaseLike) => string | null,
): JourneyStageHeatCell[] {
  const portfolioRiskByStageId = buildPortfolioStageRiskById(cases, sop);
  const scoped = filterCasesBySlice(cases, sliceId, resolveSlice);
  const counts = countStageFindings(scoped, sop);

  return counts.map(({ stage, failures, total }) => {
    const failureRate = total > 0 ? Math.round((failures / total) * 1000) / 10 : 0;
    const risk = portfolioRiskByStageId.get(stage.id) ?? 'none';

    return {
      stageId: stage.id,
      stageName: stage.name,
      shortLabel: getStageHeader(stage),
      failureCount: failures,
      totalInScope: total,
      failureRate,
      risk,
    };
  });
}

/** Grid layout for stage heatmap cells (e.g. 3 cols × 3 rows for nine stages). */
export function layoutJourneyHeatmapGrid(
  cells: JourneyStageHeatCell[],
  columns = 4,
): (JourneyStageHeatCell | null)[][] {
  const rowCount = Math.max(1, Math.ceil(cells.length / columns));
  const rows: (JourneyStageHeatCell | null)[][] = Array.from({ length: rowCount }, () => []);
  cells.forEach((cell, idx) => {
    const row = Math.floor(idx / columns);
    rows[row].push(cell);
  });
  for (const row of rows) {
    while (row.length < columns) row.push(null);
  }
  return rows;
}
