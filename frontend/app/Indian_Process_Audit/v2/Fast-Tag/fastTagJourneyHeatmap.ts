import { FASTAG_REGION_LABEL, getFastTagCaseRegion } from './auditData';
import type { FastTagSop } from './fastTagCaseBuilder';

export type FastTagHeatRisk = 'none' | 'low' | 'medium' | 'high' | 'critical';

export type FastTagStageHeatCell = {
  stageId: string;
  stageName: string;
  shortLabel: string;
  failureCount: number;
  totalInScope: number;
  failureRate: number;
  risk: FastTagHeatRisk;
};

const HEAT_STYLES: Record<
  FastTagHeatRisk,
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

export function getFastTagHeatCellStyles(risk: FastTagHeatRisk) {
  return HEAT_STYLES[risk];
}

/** Shared density tiers — stage heatmap (failure count) and region map (failure share %). */
export function getFastTagHeatRiskTier(count: number, maxCount: number): FastTagHeatRisk {
  if (count <= 0) return 'none';
  if (count >= 4 || (maxCount > 0 && count / maxCount >= 0.85)) return 'critical';
  if (count >= 3 || (maxCount > 0 && count / maxCount >= 0.55)) return 'high';
  if (count >= 2 || (maxCount > 0 && count / maxCount >= 0.28)) return 'medium';
  return 'low';
}

export type FastTagRegionPeerStat = { failed: number; total: number };

/**
 * Region map risk — quantile rank vs other states (None → Critical).
 * Spreads colors when many states share similar failure rates (e.g. 10-case samples).
 */
export function getFastTagRegionMapRisk(
  failedCount: number,
  caseCount: number,
  peers: FastTagRegionPeerStat[],
): FastTagHeatRisk {
  if (caseCount <= 0) return 'none';
  if (failedCount <= 0) return 'none';

  const ranked = peers
    .filter((p) => p.total > 0)
    .map((p) => ({ rate: p.failed / p.total, failed: p.failed }))
    .sort((a, b) => a.rate - b.rate || a.failed - b.failed);

  if (ranked.length === 0) return 'none';
  if (ranked.length === 1) return 'medium';

  const rate = failedCount / caseCount;
  let rank = 0;
  for (const p of ranked) {
    if (p.rate < rate - 1e-9) rank += 1;
    else if (Math.abs(p.rate - rate) < 1e-9 && p.failed < failedCount) rank += 1;
  }

  const quantile = rank / (ranked.length - 1);
  if (quantile <= 0.2) return 'low';
  if (quantile <= 0.45) return 'medium';
  if (quantile <= 0.75) return 'high';
  return 'critical';
}

/** SVG fill/stroke for map paths — matches stage heatmap legend colors. */
export const FAST_TAG_HEAT_MAP_FILLS: Record<
  FastTagHeatRisk,
  { fill: string; stroke: string }
> = {
  none: { fill: '#f1f5f9', stroke: '#e2e8f0' },
  low: { fill: '#d1fae5', stroke: '#6ee7b7' },
  medium: { fill: '#fef3c7', stroke: '#fcd34d' },
  high: { fill: '#fed7aa', stroke: '#fb923c' },
  critical: { fill: '#fca5a5', stroke: '#ef4444' },
};

type FastTagCaseLike = {
  subject?: string;
  trail: { stage: { id: string; name: string }; status: string }[];
};

/** Stage trail row for a lifecycle column (matches journey matrix columns). */
export function getFastTagStageTrailItem(kase: FastTagCaseLike, stageId: string) {
  return kase.trail.find((t) => t.stage.id === stageId);
}

/**
 * Stage-level audit finding for heatmap / drill-down — aligns with matrix cells:
 * red (rejected) and in-review (pending) both surface as Exception or Critical in Audit status.
 */
export function isFastTagStageAuditFinding(kase: FastTagCaseLike, stageId: string): boolean {
  const status = getFastTagStageTrailItem(kase, stageId)?.status;
  return status === 'rejected' || status === 'pending';
}

/** Case has any stage finding (for region map failed counts). */
export function isFastTagCaseAuditFinding(kase: FastTagCaseLike): boolean {
  return kase.trail.some((t) => t.status === 'rejected' || t.status === 'pending');
}

export function filterFastTagCasesByRegion<T extends FastTagCaseLike>(
  cases: T[],
  regionCode: string | null,
): T[] {
  if (!regionCode) return cases;
  return cases.filter((k) => getFastTagCaseRegion(k) === regionCode);
}

function countStageFindings(
  cases: FastTagCaseLike[],
  sop: FastTagSop,
): { stage: FastTagSop['stages'][number]; failures: number; total: number }[] {
  return sop.stages.map((stage) => {
    let failures = 0;
    for (const kase of cases) {
      if (isFastTagStageAuditFinding(kase, stage.id)) failures += 1;
    }
    return { stage, failures, total: cases.length };
  });
}

/** Risk tiers from all-India counts — kept when a region is selected so colors do not rescale. */
function buildNationalStageRiskById(
  cases: FastTagCaseLike[],
  sop: FastTagSop,
): Map<string, FastTagHeatRisk> {
  const national = countStageFindings(cases, sop);
  const maxFailures = Math.max(0, ...national.map((c) => c.failures));
  return new Map(
    national.map(({ stage, failures }) => [
      stage.id,
      failures > 0 ? getFastTagHeatRiskTier(failures, maxFailures) : 'none',
    ]),
  );
}

export function buildFastTagStageHeatmap(
  cases: FastTagCaseLike[],
  sop: FastTagSop,
  regionCode: string | null,
  getStageHeader: (stage: { id: string; name: string }) => string,
): FastTagStageHeatCell[] {
  const nationalRiskByStageId = buildNationalStageRiskById(cases, sop);
  const scoped = filterFastTagCasesByRegion(cases, regionCode);
  const counts = countStageFindings(scoped, sop);

  return counts.map(({ stage, failures, total }) => {
    const failureRate = total > 0 ? Math.round((failures / total) * 1000) / 10 : 0;
    const risk = nationalRiskByStageId.get(stage.id) ?? 'none';

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

export function getFastTagRegionOptions(cases: FastTagCaseLike[]) {
  const codes = new Set<string>();
  for (const kase of cases) {
    const code = getFastTagCaseRegion(kase);
    if (code) codes.add(code);
  }
  return [
    { id: '', label: 'All regions' },
    ...[...codes]
      .sort((a, b) => (FASTAG_REGION_LABEL[a] ?? a).localeCompare(FASTAG_REGION_LABEL[b] ?? b))
      .map((code) => ({
        id: code,
        label: FASTAG_REGION_LABEL[code] ? `${FASTAG_REGION_LABEL[code]} (${code})` : code,
      })),
  ];
}

/** 2×4 grid slots for eight lifecycle stages (4 columns × 2 rows). */
export function layoutFastTagHeatmapGrid(cells: FastTagStageHeatCell[]) {
  const rows: (FastTagStageHeatCell | null)[][] = [[], []];
  cells.forEach((cell, idx) => {
    const row = Math.floor(idx / 4);
    if (row < 2) rows[row].push(cell);
  });
  while (rows[0].length < 4) rows[0].push(null);
  while (rows[1].length < 4) rows[1].push(null);
  return rows;
}
