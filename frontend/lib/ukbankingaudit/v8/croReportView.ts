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
  buildWhatChanged,
  buildWhatHasNotChanged,
  committeeText,
  formatDate,
  type ChangeRow,
  type SpotlightRow,
  type StandingRow,
} from "./boardView";
import { categoryLabel } from "./config";
import {
  buildCategoryEffectiveness,
  buildEvidenceWarnings,
  buildIncidentRows,
  buildOverdueTests,
  buildWhatMoved,
  type OverdueTest,
} from "./controlsIncidentsView";
import { runBoardDetectors } from "./detectors";
import {
  externalBoardSignals,
  openEnforcementNotices,
  readAcrossPrecedents,
} from "./horizonSignals";
import { buildMajorGaps, rcsaCycleNote, type MajorGapRow } from "./rcsaCoverageView";
import { getRiskState, type RiskState } from "./riskStore";
import { HORIZON_ITEMS } from "./data/horizon";
import {
  boardIncidents,
  periodLabel,
  selectMaterialItems,
  V8_ENGINE_DATA,
  type EngineData,
} from "./engine";
import { buildRamRows, type RamRow } from "./riskAppetiteView";
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

export type ReportHorizonRow = {
  id: string;
  kind: string;
  title: string;
  source: string;
  sourceUrl: string;
  date: string;
  summary: string;
  /** "Relevant to us?" answer, where the dashboard asks for one. */
  relevance: string | null;
  /** Latest decision recorded on the dashboard. */
  decision: string | null;
};

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
    /** First planned action on the path to green. */
    response: string | null;
    path: string;
    secondLine: string;
    committee: string;
  }[];
  appetiteTotals: { green: number; amber: number; red: number; total: number };
  /** Same rows as the Board View Red Spotlight. */
  spotlight: SpotlightRow[];
  whatChanged: ChangeRow[];
  standing: StandingRow[];
  overdueTests: OverdueTest[];
  evidenceWarnings: string[];
  /** Appendix A: every metric on the Risk Appetite tab. */
  metricRegister: RamRow[];
  /** Appendix B: the RCSA Coverage major gaps tracker. */
  majorGaps: MajorGapRow[];
  rcsaNote: string;
  preparedBy: string;
  nextReview: string;
  controlsPct: number;
  controlsPrevPct: number | null;
  controlCategories: { id: string; label: string; pct: number; prevPct: number | null }[];
  moves: string[];
  incidents: { id: string; date: string; severity: string; title: string; category: string; status: string; controls: string }[];
  horizon: { regulatory: ReportHorizonRow[]; industry: ReportHorizonRow[]; emerging: ReportHorizonRow[] };
};

const SECOND_LINE = { accepted: "Accepted", challenged: "Challenged", pending: "Pending" };

const FULL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function periodLongLabel(period: Period): string {
  return `${FULL_MONTHS[Number(period.split("-")[1]) - 1]} ${period.slice(0, 4)}`;
}

function nextPeriod(period: Period, months: number): Period {
  const [year, month] = period.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1 + months, 1)).toISOString().slice(0, 7);
}

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

type MockGraph = {
  groupSetRequirements: Parameters<typeof openEnforcementNotices>[0];
  smfHolders: Parameters<typeof readAcrossPrecedents>[0] & Parameters<typeof buildMajorGaps>[1];
  obligations: Parameters<typeof buildMajorGaps>[0];
};
const GRAPH = mockDataV8 as unknown as MockGraph;

const DECISION_WORDS: Record<string, string> = {
  accept: "Accepted",
  reject: "Rejected",
  escalate: "Escalated",
  override: "Overridden",
};

function latestDecision(signalId: string, dispositions: RiskState["dispositions"]): string | null {
  const entry = dispositions[signalId]?.at(-1);
  return entry ? (DECISION_WORDS[entry.kind] ?? entry.kind) : null;
}

const MAX_BOARD_SIGNALS = 4;

/** Exactly what the Regulatory tab of Horizon Scanning lists, in the same order. */
function regulatoryRows(dispositions: RiskState["dispositions"], asOf: string): ReportHorizonRow[] {
  const signals = externalBoardSignals(runBoardDetectors("UK")).slice(0, MAX_BOARD_SIGNALS);
  const notices = openEnforcementNotices(GRAPH.groupSetRequirements);
  const readAcross = readAcrossPrecedents(GRAPH.smfHolders, new Set(notices.map((n) => n.id)));
  return [
    ...signals.map((signal) => ({
      id: signal.id,
      kind: "Board signal",
      title: signal.title,
      source: "Rule-based detection",
      sourceUrl: "",
      date: formatDate(asOf),
      summary: signal.soWhat,
      relevance: null,
      decision: latestDecision(signal.id, dispositions),
    })),
    ...notices.map((n) => ({
      id: n.id,
      kind: "Enforcement queue",
      title: n.precedent.respondent,
      source: n.regulatorBody,
      sourceUrl: n.precedent.sourceUrl,
      date: formatDate(n.publishedDate),
      summary: `${n.ageDays} days ${n.applicabilityStatus === "in_progress" ? "with assessment in progress" : "not assessed"}. ${n.precedent.hook}`,
      relevance: null,
      decision: latestDecision(`queue-${n.id}`, dispositions),
    })),
    ...readAcross.map((p) => ({
      id: p.id,
      kind: "Enforcement read-across",
      title: p.respondent,
      source: p.regulator,
      sourceUrl: p.sourceUrl,
      date: formatDate(p.noticeDate),
      summary: p.hook,
      relevance: null,
      decision: latestDecision(`read-across-${p.id}`, dispositions),
    })),
  ];
}

const RELEVANCE_WORDS = { not_assessed: "Not assessed", yes: "Yes", no: "No" };

export function buildCroReport(
  period: Period = V8_ENGINE_DATA.config.currentPeriod,
  data: EngineData = V8_ENGINE_DATA,
  session: Pick<RiskState, "relevance" | "dispositions"> = getRiskState(),
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
      relevance: type === "industry" ? RELEVANCE_WORDS[session.relevance[h.id] ?? h.relevance] : null,
      decision: latestDecision(h.id, session.dispositions),
    }));

  return {
    periodText: periodText(period),
    periodLong: periodLongLabel(period),
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
          response: row.path?.actions[0] ?? null,
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
    spotlight: buildRedSpotlight(period, 5, data),
    whatChanged: buildWhatChanged(period, data),
    standing: buildWhatHasNotChanged(period, data),
    overdueTests: buildOverdueTests(data),
    evidenceWarnings: buildEvidenceWarnings(period, data),
    metricRegister: rows,
    majorGaps: buildMajorGaps(GRAPH.obligations, GRAPH.smfHolders),
    rcsaNote: rcsaCycleNote(data.config),
    preparedBy: "Chief Risk Officer (SMF4)",
    nextReview: periodLongLabel(nextPeriod(period, data.config.reportingCadence === "quarterly" ? 3 : 1)),
    horizon: {
      regulatory: regulatoryRows(session.dispositions, data.config.asOf),
      industry: horizonRow("industry"),
      emerging: horizonRow("emerging"),
    },
  };
}
