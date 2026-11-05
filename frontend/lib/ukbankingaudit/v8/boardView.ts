/**
 * Board View banner and tile figures. Everything comes from the rating engine and
 * the v8 records, so no colour, count or sentence is written into a component.
 */
import { categoryLabel } from "./config";
import {
  boardIncidents,
  computeCategoryRating,
  computeControlEffectiveness,
  computeFirmPosture,
  computeRamStatus,
  computeTrend,
  periodLabel,
  V8_ENGINE_DATA,
  type DrivingCategory,
  type EngineData,
  type Trend,
} from "./engine";
import type { PathToGreenRecord, Period, RatingColour } from "./types";

export type TrendView = Trend & {
  /** Tile tooltip, for example "Oct: GREEN → Nov: AMBER". */
  tooltip: string;
  /** Banner chip text, for example "was AMBER in Oct". */
  chipText: string;
};

export type FirmBannerView = {
  colour: RatingColour;
  trend: TrendView;
  ruleDescription: string;
  drivingCategories: DrivingCategory[];
  /** Green categories with a critical control test lacking evidence this cycle. */
  assuranceGapCategoryIds: string[];
  assuranceText: string;
};

export type TilePathView = {
  /** Latest target across the category's paths, for example "Jan 2027". */
  targetLabel: string;
  owner: string;
  secondLine: PathToGreenRecord["secondLineVerdict"];
};

export type CategoryTileView = {
  categoryId: string;
  label: string;
  colour: RatingColour;
  trend: TrendView;
  why: string;
  ramRed: number;
  ramAmber: number;
  criticalPct: number;
  sevOneTwo: number;
  /** Null on a green tile. On a non-green tile, null means no path has been recorded. */
  path: TilePathView | null;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthYear(isoDate: string): string {
  const [year, month] = isoDate.split("-").map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}

function currentColour(entity: string, period: Period, data: EngineData): RatingColour {
  return entity === "firm"
    ? computeFirmPosture(period, data).colour
    : computeCategoryRating(entity, period, data).colour;
}

function trendView(entity: string, period: Period, data: EngineData): TrendView {
  const trend = computeTrend(entity, period, data);
  const now = currentColour(entity, period, data).toUpperCase();
  if (!trend.prevColour) {
    return { ...trend, tooltip: "No earlier review to compare", chipText: "first review" };
  }
  const prev = trend.prevColour.toUpperCase();
  return {
    ...trend,
    tooltip: `${trend.prevPeriodLabel}: ${prev} → ${periodLabel(period)}: ${now}`,
    chipText: trend.direction === "flat" ? `also ${prev} in ${trend.prevPeriodLabel}` : `was ${prev} in ${trend.prevPeriodLabel}`,
  };
}

function categoryOfPath(path: PathToGreenRecord, data: EngineData): string | undefined {
  if (path.targetType === "ram") return data.rams.find((r) => r.id === path.targetId)?.categoryId;
  if (path.targetType === "control") return data.controls.find((c) => c.id === path.targetId)?.categoryId;
  return data.incidents.find((i) => i.id === path.targetId)?.categoryId;
}

const VERDICT_WEIGHT: Record<PathToGreenRecord["secondLineVerdict"], number> = {
  accepted: 0,
  pending: 1,
  challenged: 2,
};

/** A category is green only when its last path lands, so the latest date governs. */
function tilePath(categoryId: string, data: EngineData): TilePathView | null {
  const paths = data.pathsToGreen.filter((path) => categoryOfPath(path, data) === categoryId);
  if (paths.length === 0) return null;
  const latest = paths.reduce((a, b) => (b.targetDate > a.targetDate ? b : a));
  const weakest = paths.reduce((a, b) =>
    VERDICT_WEIGHT[b.secondLineVerdict] > VERDICT_WEIGHT[a.secondLineVerdict] ? b : a,
  );
  return {
    targetLabel: monthYear(latest.targetDate),
    owner: latest.owner,
    secondLine: weakest.secondLineVerdict,
  };
}

export function buildCategoryTile(
  categoryId: string,
  period: Period,
  data: EngineData = V8_ENGINE_DATA,
): CategoryTileView {
  const rating = computeCategoryRating(categoryId, period, data);
  const statuses = data.rams
    .filter((ram) => ram.categoryId === categoryId)
    .flatMap((ram) => {
      const value = data.ramValues.find((v) => v.ramId === ram.id && v.period === period)?.value;
      return value === undefined ? [] : [computeRamStatus(ram, value)];
    });
  return {
    categoryId,
    label: categoryLabel(categoryId, data.config),
    colour: rating.colour,
    trend: trendView(categoryId, period, data),
    why: rating.why,
    ramRed: statuses.filter((s) => s === "red").length,
    ramAmber: statuses.filter((s) => s === "amber").length,
    criticalPct: computeControlEffectiveness(categoryId, period, data).pct,
    sevOneTwo: boardIncidents(period, data).filter((i) => i.categoryId === categoryId).length,
    path: rating.colour === "green" ? null : tilePath(categoryId, data),
  };
}

export function buildCategoryTiles(
  period: Period = V8_ENGINE_DATA.config.currentPeriod,
  data: EngineData = V8_ENGINE_DATA,
): CategoryTileView[] {
  return data.config.riskTaxonomy.map((node) => buildCategoryTile(node.id, period, data));
}

function hasEvidenceGap(categoryId: string, period: Period, data: EngineData): boolean {
  return data.controls
    .filter((c) => c.categoryId === categoryId && c.tier === "critical")
    .some((control) =>
      data.controlTests.some(
        (test) => test.controlId === control.id && test.date.startsWith(period) && test.evidenceId === null,
      ),
    );
}

export function buildFirmBanner(
  period: Period = V8_ENGINE_DATA.config.currentPeriod,
  data: EngineData = V8_ENGINE_DATA,
): FirmBannerView {
  const posture = computeFirmPosture(period, data);
  const gaps = data.config.riskTaxonomy
    .map((node) => node.id)
    .filter((id) => computeCategoryRating(id, period, data).colour === "green")
    .filter((id) => hasEvidenceGap(id, period, data));
  return {
    colour: posture.colour,
    trend: trendView("firm", period, data),
    ruleDescription: posture.ruleDescription,
    drivingCategories: posture.drivingCategories,
    assuranceGapCategoryIds: gaps,
    assuranceText:
      gaps.length === 1
        ? "1 green domain has no test evidence this cycle"
        : `${gaps.length} green domains have no test evidence this cycle`,
  };
}

/** "Firm-level risk posture across your 9 Level-1 risks · monthly review". */
export function boardSubtitle(data: EngineData = V8_ENGINE_DATA): string {
  const { riskTaxonomy, reportingCadence } = data.config;
  return `Firm-level risk posture across your ${riskTaxonomy.length} Level-1 risks · ${reportingCadence} review`;
}
