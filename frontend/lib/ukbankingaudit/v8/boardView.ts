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
  controlStanding,
  periodLabel,
  previousPeriod,
  selectMaterialItems,
  V8_ENGINE_DATA,
  type DrivingCategory,
  type EngineData,
  type MaterialItem,
  type Trend,
} from "./engine";
import { DOMAIN_EVIDENCE } from "./riskDomainsV8";
import type { ControlResult, PathToGreenRecord, Period, RAM, RatingColour } from "./types";
import { buildStillnessRows } from "./whatChangedV8";

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
  /** The path with the latest target, which the chip opens. */
  targetType: PathToGreenRecord["targetType"];
  targetId: string;
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
    targetType: latest.targetType,
    targetId: latest.targetId,
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

// ─── Pass 5: summary strips, Red Spotlight, change lists ────────────────────

/** One date format throughout: 3 Nov 2026. */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

export type RiskAppetiteStrip = {
  green: number;
  amber: number;
  red: number;
  total: number;
  byCategory: { categoryId: string; label: string; green: number; amber: number; red: number }[];
  /** Category a click opens: the first driver of firm posture, else the first category. */
  focusCategoryId: string;
};

export function buildRiskAppetiteStrip(
  period: Period = V8_ENGINE_DATA.config.currentPeriod,
  data: EngineData = V8_ENGINE_DATA,
): RiskAppetiteStrip {
  const byCategory = data.config.riskTaxonomy.map((node) => {
    const statuses = data.rams
      .filter((ram) => ram.categoryId === node.id)
      .flatMap((ram) => {
        const value = data.ramValues.find((v) => v.ramId === ram.id && v.period === period)?.value;
        return value === undefined ? [] : [computeRamStatus(ram, value)];
      });
    return {
      categoryId: node.id,
      label: categoryLabel(node.id, data.config),
      green: statuses.filter((s) => s === "green").length,
      amber: statuses.filter((s) => s === "amber").length,
      red: statuses.filter((s) => s === "red").length,
    };
  });
  const green = byCategory.reduce((n, c) => n + c.green, 0);
  const amber = byCategory.reduce((n, c) => n + c.amber, 0);
  const red = byCategory.reduce((n, c) => n + c.red, 0);
  const firstDriver = computeFirmPosture(period, data).drivingCategories[0]?.categoryId;
  return {
    green,
    amber,
    red,
    total: green + amber + red,
    byCategory,
    focusCategoryId: firstDriver ?? data.config.riskTaxonomy[0]?.id ?? "",
  };
}

export type ControlStrip = {
  pct: number;
  prevPct: number | null;
  direction: "down" | "up" | "flat";
  worstCategoryId: string;
  worstLabel: string;
  worstPct: number;
  /** Green items with no evidence artefact this cycle. */
  evidenceWarnings: string[];
};

function firmEffectivePct(period: Period, data: EngineData): number | null {
  const critical = data.controls.filter((c) => c.tier === "critical");
  const standings = critical.map((c) => controlStanding(c.id, period, data));
  if (critical.length === 0 || standings.every((s) => s === null)) return null;
  return Math.round((standings.filter((s) => s?.result === "effective").length / critical.length) * 100);
}

export function buildControlStrip(
  period: Period = V8_ENGINE_DATA.config.currentPeriod,
  data: EngineData = V8_ENGINE_DATA,
): ControlStrip {
  const pct = firmEffectivePct(period, data) ?? 100;
  const prevPct = firmEffectivePct(previousPeriod(period, data.config), data);
  const worst = data.config.riskTaxonomy
    .map((node) => ({
      id: node.id,
      label: categoryLabel(node.id, data.config),
      pct: computeControlEffectiveness(node.id, period, data).pct,
    }))
    .reduce((a, b) => (b.pct < a.pct ? b : a));
  return {
    pct,
    prevPct,
    direction: prevPct === null || prevPct === pct ? "flat" : pct < prevPct ? "down" : "up",
    worstCategoryId: worst.id,
    worstLabel: worst.label,
    worstPct: worst.pct,
    evidenceWarnings: DOMAIN_EVIDENCE.filter(
      (e) =>
        e.cadenceSource === "human-confirmed" &&
        e.artefactId === null &&
        computeCategoryRating(e.domainId, period, data).colour === "green",
    ).map((e) => `${e.subCategory ?? categoryLabel(e.domainId, data.config)}: GREEN with 0 evidence artefacts this cycle`),
  };
}

export type IncidentStrip = {
  sevOne: number;
  sevTwo: number;
  cadenceWord: "month" | "quarter";
  topTitle: string | null;
  topId: string | null;
  topCategoryId: string | null;
};

export function buildIncidentStrip(
  period: Period = V8_ENGINE_DATA.config.currentPeriod,
  data: EngineData = V8_ENGINE_DATA,
): IncidentStrip {
  const incidents = boardIncidents(period, data);
  const top = [...incidents].sort((a, b) => a.level - b.level || b.date.localeCompare(a.date))[0];
  return {
    sevOne: incidents.filter((i) => i.level === 1).length,
    sevTwo: incidents.filter((i) => i.level === 2).length,
    cadenceWord: data.config.reportingCadence === "quarterly" ? "quarter" : "month",
    topTitle: top?.title ?? null,
    topId: top?.id ?? null,
    topCategoryId: top?.categoryId ?? null,
  };
}

const COMMITTEE_WORDS: Record<PathToGreenRecord["committeeDecision"], string> = {
  pending: "Decision pending at",
  accepted: "Accepted by",
  sent_back: "Sent back by",
  bring_forward: "Bring forward, decided by",
};

/** Committee position in words. An accepted plan past its date is an accepted delay. */
export function committeeText(path: PathToGreenRecord, overdue: boolean): string {
  const words =
    path.committeeDecision === "accepted" && overdue ? "Delay accepted by" : COMMITTEE_WORDS[path.committeeDecision];
  const date = path.decisionDate ? `, ${formatDate(path.decisionDate)}` : "";
  return `${words} ${path.committee}${date}`;
}

const SECOND_LINE_WORDS: Record<PathToGreenRecord["secondLineVerdict"], string> = {
  accepted: "2nd line accepted",
  challenged: "2nd line challenged",
  pending: "2nd line pending",
};

export type SpotlightRow = {
  id: string;
  kind: MaterialItem["kind"];
  name: string;
  categoryId: string;
  categoryLabel: string;
  /** Value vs tolerance, test result, or severity. */
  measure: string;
  cause: string | null;
  owner: string | null;
  targetDate: string | null;
  overdue: boolean;
  secondLine: string | null;
  committee: string | null;
  hasPath: boolean;
};

function spotlightMeasure(item: MaterialItem, period: Period, data: EngineData): string {
  if (item.kind === "control") {
    const standing = controlStanding(item.id, period, data);
    return standing ? `Test result: not effective, ${formatDate(standing.date)}` : "Test result: not effective";
  }
  if (item.kind === "incident") {
    const incident = data.incidents.find((i) => i.id === item.id);
    return incident ? `${incident.severity} · ${incident.status}` : item.detail;
  }
  return item.detail;
}

export function buildRedSpotlight(
  period: Period = V8_ENGINE_DATA.config.currentPeriod,
  limit = 5,
  data: EngineData = V8_ENGINE_DATA,
): SpotlightRow[] {
  return selectMaterialItems(period, limit, data).map((item) => {
    const path = item.pathToGreen;
    const overdue = !!path && path.targetDate < data.config.asOf;
    return {
      id: item.id,
      kind: item.kind,
      name: item.name,
      categoryId: item.categoryId,
      categoryLabel: categoryLabel(item.categoryId, data.config),
      measure: spotlightMeasure(item, period, data),
      cause: path?.cause ?? null,
      owner: path?.owner ?? item.owner,
      targetDate: path?.targetDate ?? null,
      overdue,
      secondLine: path ? SECOND_LINE_WORDS[path.secondLineVerdict] : null,
      committee: path ? committeeText(path, overdue) : null,
      hasPath: !!path,
    };
  });
}

export type ChangeRow = {
  id: string;
  text: string;
  categoryId: string;
  categoryLabel: string;
  colour: RatingColour;
  derivation: "RULE" | "LLM";
  basis: string;
  evidenceRef: string;
};

const RESULT_WORDS: Record<ControlResult, string> = {
  effective: "effective",
  partially_effective: "partially effective",
  not_effective: "not effective",
};

const MAX_CHANGE_ROWS = 6;

function ramMeasure(ram: RAM, value: number): string {
  const format = (n: number) =>
    ram.unit === "%" ? `${n.toLocaleString("en-GB")}%` : `${n.toLocaleString("en-GB")} ${ram.unit}`;
  return `${format(value)} vs limit ${format(ram.limit)}`;
}

/**
 * Only what moved: rating moves, metrics crossing a threshold, critical control
 * results that changed, and new Sev-1 or Sev-2 incidents. At most 6, most material first.
 */
export function buildWhatChanged(
  period: Period = V8_ENGINE_DATA.config.currentPeriod,
  data: EngineData = V8_ENGINE_DATA,
): ChangeRow[] {
  const previous = previousPeriod(period, data.config);
  const label = (id: string) => categoryLabel(id, data.config);
  const colourOf = (id: string) => computeCategoryRating(id, period, data).colour;
  const ranked: { rank: number; row: ChangeRow }[] = [];

  const row = (rank: number, fields: Omit<ChangeRow, "categoryLabel" | "colour" | "derivation">) =>
    ranked.push({
      rank,
      row: { ...fields, categoryLabel: label(fields.categoryId), colour: colourOf(fields.categoryId), derivation: "RULE" },
    });

  const valueAt = (ramId: string, at: Period) => data.ramValues.find((v) => v.ramId === ramId && v.period === at)?.value;

  for (const incident of data.incidents.filter((i) => i.level <= 2 && i.date.startsWith(period))) {
    row(incident.level === 1 ? 0 : 4, {
      id: `incident-${incident.id}`,
      text: `New ${incident.severity}: ${incident.title}`,
      categoryId: incident.categoryId,
      basis: "New incident at Sev-1 or Sev-2 in this period",
      evidenceRef: incident.id,
    });
  }

  const closure = DOMAIN_EVIDENCE.find((e) => e.domainId === "cyber" && e.artefactId);
  const openVulnerabilities = valueAt("RAM-CY-01", period) ?? 0;
  if (closure?.artefactId && colourOf("cyber") === "red" && openVulnerabilities > 0) {
    row(1, {
      id: "cyber-closure",
      text: `Closure pack signed; ${openVulnerabilities} critical ${openVulnerabilities === 1 ? "vulnerability" : "vulnerabilities"} still open`,
      categoryId: "cyber",
      basis: "Signed closure artefact compared with the open vulnerability metric",
      evidenceRef: closure.artefactId,
    });
  }

  const movedCategories = new Set<string>();
  for (const node of data.config.riskTaxonomy) {
    const trend = computeTrend(node.id, period, data);
    if (trend.direction === "flat" || !trend.prevColour) continue;
    movedCategories.add(node.id);
    const crossing = data.rams
      .filter((ram) => ram.categoryId === node.id)
      .flatMap((ram) => {
        const now = valueAt(ram.id, period);
        const before = valueAt(ram.id, previous);
        if (now === undefined || before === undefined) return [];
        return computeRamStatus(ram, now) !== computeRamStatus(ram, before) ? [{ ram, now }] : [];
      })[0];
    const because = crossing ? `: ${crossing.ram.name} ${ramMeasure(crossing.ram, crossing.now)}` : "";
    row(trend.direction === "worse" ? 2 : 5, {
      id: `move-${node.id}`,
      text: `${label(node.id)} ${trend.prevColour.toUpperCase()} → ${colourOf(node.id).toUpperCase()}${because}`,
      categoryId: node.id,
      basis: "Category rating recalculated against the previous period",
      evidenceRef: crossing?.ram.id ?? `RATING-${node.id}`,
    });
  }

  for (const ram of data.rams) {
    if (movedCategories.has(ram.categoryId)) continue;
    const now = valueAt(ram.id, period);
    const before = valueAt(ram.id, previous);
    if (now === undefined || before === undefined) continue;
    const statusNow = computeRamStatus(ram, now);
    const statusBefore = computeRamStatus(ram, before);
    if (statusNow === statusBefore) continue;
    row(statusNow === "red" ? 2 : 5, {
      id: `ram-${ram.id}`,
      text: `${ram.name} ${statusBefore.toUpperCase()} → ${statusNow.toUpperCase()}: ${ramMeasure(ram, now)}`,
      categoryId: ram.categoryId,
      basis: "Metric value compared with its limit and tolerance",
      evidenceRef: ram.id,
    });
  }

  for (const node of data.config.riskTaxonomy) {
    for (const change of computeControlEffectiveness(node.id, period, data).changed) {
      const when = change.date ? ` ${formatDate(change.date)}` : "";
      const result = change.to ? RESULT_WORDS[change.to] : "no result";
      const test = data.controlTests.find((t) => t.controlId === change.controlId && t.date === change.date);
      row(change.to === "effective" ? 5 : 3, {
        id: `control-${change.controlId}`,
        text: `${change.controlId} retested${when}: ${result}. ${change.reason}`,
        categoryId: node.id,
        basis: "Latest control test compared with the previous period",
        evidenceRef: test?.evidenceId ?? change.controlId,
      });
    }
  }

  return ranked
    .sort((a, b) => a.rank - b.rank)
    .slice(0, MAX_CHANGE_ROWS)
    .map(({ row: changeRow }) => changeRow);
}

export type StandingRow = {
  id: string;
  text: string;
  categoryId: string;
  categoryLabel: string;
  colour: RatingColour;
  durationDays: number;
  /** Earliest target in the category: the next date it must hit. */
  targetDate: string | null;
  overdue: boolean;
  committee: string | null;
};

export function buildWhatHasNotChanged(
  period: Period = V8_ENGINE_DATA.config.currentPeriod,
  data: EngineData = V8_ENGINE_DATA,
): StandingRow[] {
  return buildStillnessRows(`${data.config.asOf}T00:00:00.000Z`).map((row) => {
    const paths = data.pathsToGreen
      .filter((path) => categoryOfPath(path, data) === row.domainId)
      .sort((a, b) => a.targetDate.localeCompare(b.targetDate));
    const path = paths[0] ?? null;
    const colour = computeCategoryRating(row.domainId, period, data).colour;
    const overdue = !!path && colour !== "green" && path.targetDate < data.config.asOf;
    const label = categoryLabel(row.domainId, data.config);
    return {
      id: row.id,
      text: row.text.replace(row.domainName, label),
      categoryId: row.domainId,
      categoryLabel: label,
      colour,
      durationDays: row.durationDays,
      targetDate: path?.targetDate ?? null,
      overdue,
      committee: path ? committeeText(path, overdue) : null,
    };
  });
}
