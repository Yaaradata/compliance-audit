/**
 * Top-line summary and CRO Report content. Every figure comes from the same builders
 * the Board View uses, so the report cannot drift from the screen. Sentences come from
 * a deterministic template: v8 makes no outbound calls.
 */
import mockDataV8 from "../mockDataV8";
import {
  buildCategoryTiles,
  buildControlStrip,
  buildFirmBanner,
  buildIncidentStrip,
  buildRedSpotlight,
  committeeText,
  formatDate,
} from "./boardView";
import { categoryLabel } from "./config";
import { buildCategoryEffectiveness, buildIncidentRows, buildWhatMoved } from "./controlsIncidentsView";
import { HORIZON_ITEMS } from "./data/horizon";
import {
  boardIncidents,
  periodLabel,
  selectMaterialItems,
  V8_ENGINE_DATA,
  type EngineData,
} from "./engine";
import { buildEnforcementNotices } from "./enforcementCoverage";
import { buildRamRows } from "./riskAppetiteView";
import type { PathToGreenRecord, Period, RatingColour } from "./types";

export type SummarySentence = { text: string; cites: string[] };

function pluralise(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

/** Five or six plain sentences. Each carries the record ids it rests on. */
export function buildTopLineSummary(
  period: Period = V8_ENGINE_DATA.config.currentPeriod,
  data: EngineData = V8_ENGINE_DATA,
): SummarySentence[] {
  const banner = buildFirmBanner(period, data);
  const material = selectMaterialItems(period, 100, data);
  const sentences: SummarySentence[] = [];

  const colour = banner.colour.toUpperCase();
  const prev = banner.trend.prevColour?.toUpperCase();
  const move = !prev
    ? "with no earlier review to compare"
    : banner.trend.direction === "flat"
      ? `unchanged from ${banner.trend.prevPeriodLabel}`
      : `${banner.trend.direction === "worse" ? "worse" : "better"} than ${prev} in ${banner.trend.prevPeriodLabel}`;
  const drivers = banner.drivingCategories.map((c) => c.label).join(" and ");
  const reds = material.filter((m) => m.kind === "ram");
  sentences.push({
    text: `Firm risk posture is ${colour}, ${move}${drivers ? `, driven by ${drivers}` : ""}.`,
    cites: reds.slice(0, 1).map((m) => m.id),
  });

  sentences.push(
    reds.length > 0
      ? {
          text: `${pluralise(reds.length, "risk appetite metric")} ${reds.length === 1 ? "is" : "are"} out of tolerance: ${reds
            .slice(0, 2)
            .map((m) => `${m.name} (${m.detail})`)
            .join("; ")}.`,
          cites: reds.slice(0, 2).map((m) => m.id),
        }
      : { text: "No risk appetite metric is out of tolerance.", cites: [] },
  );

  const controls = buildControlStrip(period, data);
  const direction =
    controls.prevPct === null || controls.direction === "flat"
      ? "unchanged"
      : `${controls.direction} from ${controls.prevPct}%`;
  const moves = buildWhatMoved(period, data);
  sentences.push({
    text: `Critical controls are ${controls.pct}% effective, ${direction}; the lowest is ${controls.worstLabel} at ${controls.worstPct}%.`,
    cites: moves.slice(0, 2).map((m) => m.controlId),
  });

  if (moves[0]) {
    sentences.push({ text: `${moves[0].text.replace(" — ", ". ")}`, cites: [moves[0].controlId] });
  }

  const incidents = buildIncidentStrip(period, data);
  const incidentIds = boardIncidents(period, data)
    .sort((a, b) => a.level - b.level || b.date.localeCompare(a.date))
    .map((i) => i.id);
  sentences.push(
    incidentIds.length > 0
      ? {
          text: `${pluralise(incidents.sevOne, "Sev-1 incident")} and ${pluralise(incidents.sevTwo, "Sev-2 incident")} are open or new this ${incidents.cadenceWord}, led by: ${incidents.topTitle}.`,
          cites: incidentIds.slice(0, 2),
        }
      : { text: `No Sev-1 or Sev-2 incidents are open or new this ${incidents.cadenceWord}.`, cites: [] },
  );

  const event = HORIZON_ITEMS.filter((h) => h.type === "industry").sort((a, b) => b.date.localeCompare(a.date))[0];
  if (event) {
    sentences.push({ text: `On the horizon: ${event.title} (${event.source}).`, cites: [event.id] });
  }
  return sentences;
}

export type TopLineTarget =
  | { kind: "category"; categoryId: string }
  | { kind: "screen"; screen: "riskAppetite" | "controlsIncidents" }
  | { kind: "evidence"; ref: string };

export type TopLineTile = {
  id: "firm" | "appetite" | "controls" | "incidents" | "horizon";
  label: string;
  /** The one figure to read first. */
  value: string;
  /** One short line of context. */
  note: string;
  tone: RatingColour | "neutral";
  /** Where a click on the tile goes. Each tile has exactly one destination. */
  target: TopLineTarget;
  /** The record behind the figure, shown as a reference. */
  reference: string | null;
  /** The full sentence, kept as a tooltip and screen reader text. */
  detail: string;
};

/** The top line as five tiles, each answering one question with one figure. */
export function buildTopLineTiles(
  period: Period = V8_ENGINE_DATA.config.currentPeriod,
  data: EngineData = V8_ENGINE_DATA,
): TopLineTile[] {
  const banner = buildFirmBanner(period, data);
  const material = selectMaterialItems(period, 100, data);
  const reds = material.filter((m) => m.kind === "ram");
  const controls = buildControlStrip(period, data);
  const moves = buildWhatMoved(period, data);
  const incidents = buildIncidentStrip(period, data);
  const event = HORIZON_ITEMS.filter((h) => h.type === "industry").sort((a, b) => b.date.localeCompare(a.date))[0];
  const eventCount = HORIZON_ITEMS.filter((h) => h.type === "industry").length;
  const sentences = buildTopLineSummary(period, data);
  const sentence = (prefix: string) => sentences.find((s) => s.text.startsWith(prefix))?.text ?? "";
  const { amberThreshold, redThreshold } = data.config.categoryRatingRule;

  const prev = banner.trend.prevColour?.toUpperCase();
  const firmMove = !prev
    ? "First review"
    : banner.trend.direction === "flat"
      ? `Same as ${banner.trend.prevPeriodLabel}`
      : `${banner.trend.direction === "worse" ? "Worse" : "Better"} than ${banner.trend.prevPeriodLabel}`;
  const drivers = banner.drivingCategories;
  const driverNote = drivers.length === 1 ? drivers[0].label : drivers.length > 1 ? `${drivers.length} categories` : "";

  const controlMove =
    controls.prevPct === null || controls.direction === "flat"
      ? "No change"
      : `${controls.direction === "down" ? "Down" : "Up"} from ${controls.prevPct}%`;

  return [
    {
      id: "firm",
      label: "Firm posture",
      value: banner.colour.toUpperCase(),
      note: driverNote ? `${firmMove} · ${driverNote}` : firmMove,
      tone: banner.colour,
      target: drivers[0]
        ? { kind: "category", categoryId: drivers[0].categoryId }
        : { kind: "screen", screen: "riskAppetite" },
      reference: reds[0]?.id ?? null,
      detail: sentence("Firm risk posture"),
    },
    {
      id: "appetite",
      label: "Out of tolerance",
      value: pluralise(reds.length, "metric"),
      note: reds[0] ? `Worst: ${reds[0].name}` : "All within tolerance",
      tone: reds.length > 0 ? "red" : "green",
      target: { kind: "screen", screen: "riskAppetite" },
      reference: reds[0]?.id ?? null,
      detail: sentences[1]?.text ?? "",
    },
    {
      id: "controls",
      label: "Critical controls",
      value: `${controls.pct}%`,
      note: controlMove,
      tone: controls.pct < redThreshold ? "red" : controls.pct < amberThreshold ? "amber" : "green",
      target: { kind: "screen", screen: "controlsIncidents" },
      reference: moves[0]?.controlId ?? null,
      detail: [sentence("Critical controls"), moves[0]?.text.replace(" — ", ". ") ?? ""].filter(Boolean).join(" "),
    },
    {
      id: "incidents",
      label: "Incidents",
      value: `${incidents.sevOne} Sev-1 · ${incidents.sevTwo} Sev-2`,
      note: incidents.topTitle ?? "None open or new",
      tone: incidents.sevOne > 0 ? "red" : incidents.sevTwo > 0 ? "amber" : "green",
      target: { kind: "screen", screen: "controlsIncidents" },
      reference: incidents.topId,
      detail: sentences.find((s) => /Sev-1/.test(s.text))?.text ?? "",
    },
    {
      id: "horizon",
      label: "On the horizon",
      value: pluralise(eventCount, "industry event"),
      note: event?.title ?? "Nothing new",
      tone: "neutral",
      target: event ? { kind: "evidence", ref: event.id } : { kind: "screen", screen: "riskAppetite" },
      reference: event?.id ?? null,
      detail: sentence("On the horizon"),
    },
  ];
}

export type ReportHorizonRow = { id: string; kind: string; title: string; source: string; sourceUrl: string; date: string; summary: string };

export type CroReportView = {
  periodText: string;
  /** "November 2026". */
  periodLong: string;
  asOfText: string;
  headlineTiles: TopLineTile[];
  /** What the committee is asked to decide or note. */
  matters: string[];
  ratingRule: string;
  summary: SummarySentence[];
  firmColour: string;
  firmTrend: string;
  firmRule: string;
  drivers: string[];
  assurance: string;
  ratings: {
    id: string;
    label: string;
    colour: string;
    trend: string;
    /** Plain words: "Unchanged", "Improved", "Worsened". */
    trendWord: string;
    why: string;
    path: string | null;
    ramRed: number;
    ramAmber: number;
    criticalPct: number;
    sevOneTwo: number;
  }[];
  appetite: {
    id: string;
    name: string;
    categoryLabel: string;
    colour: string;
    measure: string;
    value: string;
    limit: string;
    tolerance: string;
    owner: string;
    cause: string;
    path: string;
    secondLine: string;
    committee: string;
  }[];
  appetiteTotals: { green: number; amber: number; red: number; total: number };
  controlsPct: number;
  controlsPrevPct: number | null;
  controlCategories: { id: string; label: string; pct: number; prevPct: number | null }[];
  moves: string[];
  incidents: { id: string; date: string; severity: string; title: string; category: string; status: string; controls: string }[];
  spotlightCount: number;
  horizon: { regulatory: ReportHorizonRow[]; industry: ReportHorizonRow[]; emerging: ReportHorizonRow[] };
};

const SECOND_LINE = { accepted: "Accepted", challenged: "Challenged", pending: "Pending" };

const FULL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const TREND_WORD = { worse: "Worsened", better: "Improved", flat: "Unchanged" };
const COLOUR_ORDER: Record<string, number> = { red: 0, amber: 1, green: 2 };
const MAX_MATTERS = 5;

function targetName(path: PathToGreenRecord, data: EngineData): string {
  if (path.targetType === "ram") return data.rams.find((r) => r.id === path.targetId)?.name ?? path.targetId;
  if (path.targetType === "control") return data.controls.find((c) => c.id === path.targetId)?.name ?? path.targetId;
  return data.incidents.find((i) => i.id === path.targetId)?.title ?? path.targetId;
}

/** Overdue paths first, then plans sent back, then decisions pending at the Board Risk Committee. */
function buildMatters(data: EngineData): string[] {
  const overdue = data.pathsToGreen
    .filter((p) => p.targetDate < data.config.asOf)
    .map((p) => `Note: ${targetName(p, data)} is past its ${formatDate(p.targetDate)} target. ${committeeText(p, true)}.`);
  const sentBack = data.pathsToGreen
    .filter((p) => p.committeeDecision === "sent_back")
    .map((p) => `Review: the plan for ${targetName(p, data)} was sent back${p.decisionDate ? ` on ${formatDate(p.decisionDate)}` : ""}.`);
  const pending = data.pathsToGreen
    .filter((p) => p.committeeDecision === "pending" && p.committee === "Board Risk Committee")
    .sort((a, b) => a.targetDate.localeCompare(b.targetDate))
    .map((p) => `Decide: the path to green for ${targetName(p, data)}, target ${formatDate(p.targetDate)}.`);
  return [...overdue, ...sentBack, ...pending].slice(0, MAX_MATTERS);
}

function periodText(period: Period): string {
  return `${periodLabel(period)} ${period.slice(0, 4)}`;
}

/** Enforcement queue from the v8 mock graph, so the report needs no screen runtime. */
function regulatoryRows(): ReportHorizonRow[] {
  const { groupSetRequirements } = mockDataV8 as unknown as {
    groupSetRequirements: Parameters<typeof buildEnforcementNotices>[0]["groupSetRequirements"];
  };
  return buildEnforcementNotices({ groupSetRequirements })
    .filter((n) => n.applicabilityStatus === "not_assessed")
    .sort((a, b) => b.ageDays - a.ageDays)
    .map((n) => ({
      id: n.id,
      kind: "Enforcement",
      title: n.precedent.respondent,
      source: n.regulatorBody,
      sourceUrl: n.precedent.sourceUrl,
      date: formatDate(n.publishedDate),
      summary: `${n.ageDays} days not assessed. ${n.precedent.hook}`,
    }));
}

export function buildCroReport(
  period: Period = V8_ENGINE_DATA.config.currentPeriod,
  data: EngineData = V8_ENGINE_DATA,
): CroReportView {
  const banner = buildFirmBanner(period, data);
  const controls = buildControlStrip(period, data);
  const rows = buildRamRows(period, data);
  const horizonRow = (type: "industry" | "emerging"): ReportHorizonRow[] =>
    HORIZON_ITEMS.filter((h) => h.type === type).map((h) => ({
      id: h.id,
      kind: type === "industry" ? "Industry event" : "Emerging risk",
      title: h.title,
      source: h.source,
      sourceUrl: h.sourceUrl,
      date: formatDate(h.date),
      summary: h.summary,
    }));

  return {
    periodText: periodText(period),
    periodLong: `${FULL_MONTHS[Number(period.split("-")[1]) - 1]} ${period.slice(0, 4)}`,
    asOfText: formatDate(data.config.asOf),
    headlineTiles: buildTopLineTiles(period, data),
    matters: buildMatters(data),
    ratingRule: data.config.categoryRatingRule.description,
    summary: buildTopLineSummary(period, data),
    firmColour: banner.colour,
    firmTrend: banner.trend.chipText,
    firmRule: banner.ruleDescription,
    drivers: banner.drivingCategories.map((c) => c.label),
    assurance: banner.assuranceText,
    ratings: buildCategoryTiles(period, data)
      .map((tile) => ({
        id: tile.categoryId,
        label: tile.label,
        colour: tile.colour,
        trend: tile.trend.tooltip,
        trendWord: TREND_WORD[tile.trend.direction],
        why: tile.why,
        path: tile.path ? `${tile.path.targetLabel} · ${tile.path.owner}` : null,
        ramRed: tile.ramRed,
        ramAmber: tile.ramAmber,
        criticalPct: tile.criticalPct,
        sevOneTwo: tile.sevOneTwo,
      }))
      .sort((a, b) => COLOUR_ORDER[a.colour] - COLOUR_ORDER[b.colour] || a.label.localeCompare(b.label)),
    appetite: rows
      .filter((row) => row.status !== "green")
      .map((row) => {
        const overdue = !!row.path && row.path.targetDate < data.config.asOf;
        return {
          id: row.id,
          name: row.name,
          categoryLabel: categoryLabel(row.categoryId, data.config),
          colour: row.status,
          measure: `${row.valueText} vs limit ${row.limitText}, tolerance ${row.toleranceText}`,
          value: row.valueText,
          limit: row.limitText,
          tolerance: row.toleranceText,
          owner: row.path?.owner ?? row.owner,
          cause: row.path?.cause ?? "No path to green",
          path: row.path ? `${formatDate(row.path.targetDate)}${overdue ? " (overdue)" : ""}` : "None",
          secondLine: row.path ? SECOND_LINE[row.path.secondLineVerdict] : "None",
          committee: row.path ? committeeText(row.path, overdue) : "None",
        };
      }),
    appetiteTotals: {
      green: rows.filter((r) => r.status === "green").length,
      amber: rows.filter((r) => r.status === "amber").length,
      red: rows.filter((r) => r.status === "red").length,
      total: rows.length,
    },
    controlsPct: controls.pct,
    controlsPrevPct: controls.prevPct,
    controlCategories: buildCategoryEffectiveness(period, data).map((c) => ({
      id: c.categoryId,
      label: c.label,
      pct: c.pct,
      prevPct: c.prevPct,
    })),
    moves: buildWhatMoved(period, data).map((m) => m.text),
    incidents: buildIncidentRows(data)
      .filter((i) => boardIncidents(period, data).some((b) => b.id === i.id))
      .map((i) => ({
        id: i.id,
        date: formatDate(i.date),
        severity: i.severity,
        title: i.title,
        category: i.categoryLabel,
        status: i.status,
        controls: i.links.map((l) => `${l.controlId}: ${l.worked}`).join(", "),
      })),
    spotlightCount: buildRedSpotlight(period, 100, data).length,
    horizon: { regulatory: regulatoryRows(), industry: horizonRow("industry"), emerging: horizonRow("emerging") },
  };
}
