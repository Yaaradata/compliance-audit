/**
 * v8 rating engine. Every colour is calculated bottom-up from risk appetite metrics,
 * control effectiveness and incidents, using the rules in config.ts.
 *
 * Pure and rule-based. Each function takes its records as an optional last argument,
 * so a screen can pass locally edited records and get an immediate re-rate.
 */
import { categoryLabel, V8_CONFIG, type V8Config } from "./config";
import { CONTROLS, CONTROL_TESTS } from "./data/controls";
import { INCIDENTS, INCIDENT_CONTROL_LINKS } from "./data/incidents";
import { PATHS_TO_GREEN } from "./data/pathsToGreen";
import { RAMS, RAM_VALUES } from "./data/rams";
import { RATING_SNAPSHOTS } from "./data/snapshots";
import type {
  ControlResult,
  ControlTest,
  Incident,
  IncidentControlLink,
  PathToGreenRecord,
  Period,
  RAM,
  RAMValue,
  RatedControl,
  RatingColour,
  RatingDriver,
  RatingSnapshot,
} from "./types";

export type EngineData = {
  config: V8Config;
  rams: RAM[];
  ramValues: RAMValue[];
  controls: RatedControl[];
  controlTests: ControlTest[];
  incidents: Incident[];
  links: IncidentControlLink[];
  snapshots: RatingSnapshot[];
  pathsToGreen: PathToGreenRecord[];
};

export const V8_ENGINE_DATA: EngineData = {
  config: V8_CONFIG,
  rams: RAMS,
  ramValues: RAM_VALUES,
  controls: CONTROLS,
  controlTests: CONTROL_TESTS,
  incidents: INCIDENTS,
  links: INCIDENT_CONTROL_LINKS,
  snapshots: RATING_SNAPSHOTS,
  pathsToGreen: PATHS_TO_GREEN,
};

const COLOUR_RANK: Record<RatingColour, number> = { green: 0, amber: 1, red: 2 };
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ─── Period helpers ──────────────────────────────────────────────────────────

function periodEnd(period: Period): string {
  const [year, month] = period.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
}

function monthsBefore(period: Period, months: number): Period {
  const [year, month] = period.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1 - months, 1)).toISOString().slice(0, 7);
}

/** Previous reporting period at the configured cadence. */
export function previousPeriod(period: Period, config: V8Config = V8_CONFIG): Period {
  return monthsBefore(period, config.reportingCadence === "quarterly" ? 3 : 1);
}

/** Short month label, for example "Oct". */
export function periodLabel(period: Period): string {
  return MONTHS[Number(period.split("-")[1]) - 1];
}

function pluralise(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function formatValue(value: number, unit: string): string {
  const text = value.toLocaleString("en-GB");
  return unit === "%" ? `${text}%` : `${text} ${unit}`;
}

// ─── 1. Risk appetite metric status ──────────────────────────────────────────

export function computeRamStatus(ram: RAM, value: number): RatingColour {
  if (ram.zeroTolerance) return value === 0 ? "green" : "red";
  if (ram.direction === "higherIsWorse") {
    if (value > ram.tolerance) return "red";
    return value > ram.limit ? "amber" : "green";
  }
  if (value < ram.tolerance) return "red";
  return value < ram.limit ? "amber" : "green";
}

function ramValueAt(ramId: string, period: Period, data: EngineData): number | null {
  return data.ramValues.find((v) => v.ramId === ramId && v.period === period)?.value ?? null;
}

type RamReading = { ram: RAM; value: number; status: RatingColour };

function ramReadings(categoryId: string, period: Period, data: EngineData): RamReading[] {
  return data.rams
    .filter((ram) => ram.categoryId === categoryId)
    .flatMap((ram) => {
      const value = ramValueAt(ram.id, period, data);
      return value === null ? [] : [{ ram, value, status: computeRamStatus(ram, value) }];
    });
}

// ─── 2 and 3. Control effectiveness, with incident re-rating ─────────────────

export type ControlStanding = {
  result: ControlResult;
  reason: string;
  /** Date of the test, or of the incident that re-rated the control. */
  date: string;
  incidentId: string | null;
};

/**
 * A control's standing at the end of a period: its latest test, unless a linked
 * incident marked it "failed", which holds it not effective from the incident date
 * until the next passing test. Null if it has never been tested or re-rated.
 */
export function controlStanding(
  controlId: string,
  period: Period,
  data: EngineData = V8_ENGINE_DATA,
): ControlStanding | null {
  const end = periodEnd(period);
  const tests = data.controlTests
    .filter((test) => test.controlId === controlId && test.date <= end)
    .sort((a, b) => a.date.localeCompare(b.date));
  const latest = tests.at(-1);

  // Already not effective on test: the tester's reason stands, an incident adds nothing.
  if (latest?.result === "not_effective") {
    return { result: latest.result, reason: latest.reason, date: latest.date, incidentId: null };
  }

  const failures = data.links
    .filter((link) => link.controlId === controlId && link.controlWorked === "failed")
    .flatMap((link) => {
      const incident = data.incidents.find((i) => i.id === link.incidentId);
      return incident && incident.date <= end ? [incident] : [];
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  for (const incident of failures) {
    const recovered = tests.some((test) => test.date > incident.date && test.result === "effective");
    if (!recovered) {
      return {
        result: "not_effective",
        reason: `Failed in incident ${incident.id}: ${incident.title}`,
        date: incident.date,
        incidentId: incident.id,
      };
    }
  }

  return latest
    ? { result: latest.result, reason: latest.reason, date: latest.date, incidentId: null }
    : null;
}

export type ControlChange = {
  controlId: string;
  label: string;
  from: ControlResult | null;
  to: ControlResult | null;
  date: string | null;
  reason: string;
};

export type ControlEffectiveness = {
  pct: number;
  /** Null when the previous period has no results to compare with. */
  prevPct: number | null;
  changed: ControlChange[];
};

function criticalControls(categoryId: string, data: EngineData): RatedControl[] {
  return data.controls.filter((c) => c.categoryId === categoryId && c.tier === "critical");
}

function effectivePct(categoryId: string, period: Period, data: EngineData): number | null {
  const critical = criticalControls(categoryId, data);
  const standings = critical.map((control) => controlStanding(control.id, period, data));
  if (critical.length === 0 || standings.every((s) => s === null)) return null;
  const effective = standings.filter((s) => s?.result === "effective").length;
  return Math.round((effective / critical.length) * 100);
}

export function computeControlEffectiveness(
  categoryId: string,
  period: Period,
  data: EngineData = V8_ENGINE_DATA,
): ControlEffectiveness {
  const previous = previousPeriod(period, data.config);
  const changed = criticalControls(categoryId, data).flatMap((control): ControlChange[] => {
    const now = controlStanding(control.id, period, data);
    const before = controlStanding(control.id, previous, data);
    if ((now?.result ?? null) === (before?.result ?? null)) return [];
    return [
      {
        controlId: control.id,
        label: control.name,
        from: before?.result ?? null,
        to: now?.result ?? null,
        date: now?.date ?? null,
        reason: now?.reason ?? "No test result on record.",
      },
    ];
  });
  return {
    pct: effectivePct(categoryId, period, data) ?? 100,
    prevPct: effectivePct(categoryId, previous, data),
    changed,
  };
}

// ─── 4. Category rating ──────────────────────────────────────────────────────

export type CategoryRating = {
  colour: RatingColour;
  drivers: RatingDriver[];
  why: string;
};

function openIncidents(categoryId: string, level: 1 | 2, period: Period, data: EngineData): Incident[] {
  const end = periodEnd(period);
  return data.incidents.filter(
    (i) => i.categoryId === categoryId && i.level === level && i.status === "open" && i.date <= end,
  );
}

function controlsWithResult(
  categoryId: string,
  period: Period,
  data: EngineData,
  match: (result: ControlResult | undefined) => boolean,
): RatedControl[] {
  return criticalControls(categoryId, data).filter((control) =>
    match(controlStanding(control.id, period, data)?.result),
  );
}

const ramDriver = ({ ram }: RamReading): RatingDriver => ({ type: "ram", id: ram.id, label: ram.name });
const controlDriver = (c: RatedControl): RatingDriver => ({ type: "control", id: c.id, label: c.name });
const incidentDriver = (i: Incident): RatingDriver => ({ type: "incident", id: i.id, label: i.title });

export function computeCategoryRating(
  categoryId: string,
  period: Period,
  data: EngineData = V8_ENGINE_DATA,
): CategoryRating {
  const { amberThreshold, redThreshold } = data.config.categoryRatingRule;
  const readings = ramReadings(categoryId, period, data);
  const pct = computeControlEffectiveness(categoryId, period, data).pct;

  const redRams = readings.filter((r) => r.status === "red");
  const sev1 = openIncidents(categoryId, 1, period, data);
  if (redRams.length > 0 || pct < redThreshold || sev1.length > 0) {
    const failed = controlsWithResult(categoryId, period, data, (r) => r === "not_effective");
    const parts = [
      ...(redRams.length ? [`${pluralise(redRams.length, "RAM")} out of tolerance`] : []),
      ...(failed.length ? [`${pluralise(failed.length, "critical control")} failed`] : []),
      ...(pct < redThreshold ? [`critical controls ${pct}% effective`] : []),
      ...(sev1.length ? [pluralise(sev1.length, "Sev-1 incident")] : []),
    ];
    return {
      colour: "red",
      drivers: [...redRams.map(ramDriver), ...failed.map(controlDriver), ...sev1.map(incidentDriver)],
      why: `Red because ${parts.join(" · ")}`,
    };
  }

  const amberRams = readings.filter((r) => r.status === "amber");
  const sev2 = openIncidents(categoryId, 2, period, data);
  if (amberRams.length > 0 || pct < amberThreshold || sev2.length > 0) {
    const weak = pct < amberThreshold
      ? controlsWithResult(categoryId, period, data, (r) => r !== "effective")
      : [];
    const parts = [
      ...(amberRams.length ? [`${pluralise(amberRams.length, "RAM")} above limit`] : []),
      ...(pct < amberThreshold ? [`critical controls ${pct}% effective`] : []),
      ...(sev2.length ? [pluralise(sev2.length, "Sev-2 incident")] : []),
    ];
    const single = amberRams.length === 1 && parts.length === 1 ? amberRams[0] : null;
    return {
      colour: "amber",
      drivers: [...amberRams.map(ramDriver), ...weak.map(controlDriver), ...sev2.map(incidentDriver)],
      why: single
        ? `Amber: ${single.ram.name} ${formatValue(single.value, single.ram.unit)} vs limit ${formatValue(single.ram.limit, single.ram.unit)}`
        : `Amber because ${parts.join(" · ")}`,
    };
  }

  return {
    colour: "green",
    drivers: [],
    why: `Within appetite · critical controls ${pct}% effective`,
  };
}

// ─── 5. Firm posture ─────────────────────────────────────────────────────────

export type DrivingCategory = { categoryId: string; label: string; colour: RatingColour };

export type FirmPosture = {
  colour: RatingColour;
  ruleDescription: string;
  drivingCategories: DrivingCategory[];
};

export function computeFirmPosture(period: Period, data: EngineData = V8_ENGINE_DATA): FirmPosture {
  const { config } = data;
  const rated = config.riskTaxonomy.map((node) => ({
    categoryId: node.id,
    label: categoryLabel(node.id, config),
    colour: computeCategoryRating(node.id, period, data).colour,
  }));
  const reds = rated.filter((c) => c.colour === "red");
  const ambers = rated.filter((c) => c.colour === "amber");

  const isRed =
    config.firmAggregationRule === "anyRed"
      ? reds.length >= 1
      : config.firmAggregationRule === "twoReds"
        ? reds.length >= 2
        : reds.length >= 1 || ambers.length >= 3;

  const colour: RatingColour = isRed ? "red" : reds.length + ambers.length > 0 ? "amber" : "green";

  let drivingCategories: DrivingCategory[] = [];
  if (colour === "red") drivingCategories = reds.length > 0 ? reds : ambers;
  if (colour === "amber") drivingCategories = [...reds, ...ambers];

  return {
    colour,
    ruleDescription: config.firmAggregationDescriptions[config.firmAggregationRule],
    drivingCategories,
  };
}

// ─── 6. Trend ────────────────────────────────────────────────────────────────

export type Trend = {
  direction: "worse" | "better" | "flat";
  /** Null when there is no earlier period to compare with. */
  prevColour: RatingColour | null;
  prevPeriodLabel: string;
};

function colourAt(entity: string, period: Period, data: EngineData): RatingColour | null {
  if (entity === "firm") return computeFirmPosture(period, data).colour;
  return computeCategoryRating(entity, period, data).colour;
}

function hasReadings(period: Period, data: EngineData): boolean {
  return data.ramValues.some((v) => v.period === period);
}

/** Compares with the recorded rating for the previous period, else recalculates it. */
export function computeTrend(
  entity: string,
  period: Period,
  data: EngineData = V8_ENGINE_DATA,
): Trend {
  const previous = previousPeriod(period, data.config);
  const recorded = data.snapshots.find((s) => s.entity === entity && s.period === previous)?.colour;
  const prevColour = recorded ?? (hasReadings(previous, data) ? colourAt(entity, previous, data) : null);
  const prevPeriodLabel = periodLabel(previous);
  if (!prevColour) return { direction: "flat", prevColour: null, prevPeriodLabel };

  const move = COLOUR_RANK[colourAt(entity, period, data) ?? prevColour] - COLOUR_RANK[prevColour];
  return { direction: move > 0 ? "worse" : move < 0 ? "better" : "flat", prevColour, prevPeriodLabel };
}

// ─── 7. Material items ───────────────────────────────────────────────────────

export type MaterialItem = {
  kind: "ram" | "control" | "incident" | "ratingMove";
  id: string;
  name: string;
  categoryId: string;
  /** Value against tolerance, test result, severity or rating move, in plain words. */
  detail: string;
  owner: string | null;
  pathToGreen: PathToGreenRecord | null;
};

function pathFor(
  targetType: PathToGreenRecord["targetType"],
  targetId: string,
  data: EngineData,
): PathToGreenRecord | null {
  return data.pathsToGreen.find((p) => p.targetType === targetType && p.targetId === targetId) ?? null;
}

/** How far a red metric sits beyond tolerance, relative to the tolerance itself. */
function beyondTolerance({ ram, value }: RamReading): number {
  return Math.abs(value - ram.tolerance) / Math.max(Math.abs(ram.tolerance), 1);
}

/** Sev-1 and Sev-2 incidents the board sees: still open, or raised in this period. */
export function boardIncidents(period: Period, data: EngineData = V8_ENGINE_DATA): Incident[] {
  return data.incidents
    .filter((i) => i.level <= 2 && i.date <= periodEnd(period))
    .filter((i) => i.status === "open" || i.date.startsWith(period));
}

/**
 * Ranked: red metrics by distance beyond tolerance, failed critical controls, open
 * or in-period Sev-1 then Sev-2 incidents, then the biggest category rating moves.
 */
export function selectMaterialItems(
  period: Period,
  limit = 5,
  data: EngineData = V8_ENGINE_DATA,
): MaterialItem[] {
  const categories = data.config.riskTaxonomy.map((node) => node.id);

  const redRams: MaterialItem[] = categories
    .flatMap((id) => ramReadings(id, period, data))
    .filter((r) => r.status === "red")
    .sort((a, b) => beyondTolerance(b) - beyondTolerance(a))
    .map((reading) => ({
      kind: "ram",
      id: reading.ram.id,
      name: reading.ram.name,
      categoryId: reading.ram.categoryId,
      detail: `${formatValue(reading.value, reading.ram.unit)} vs tolerance ${formatValue(reading.ram.tolerance, reading.ram.unit)}`,
      owner: reading.ram.owner,
      pathToGreen: pathFor("ram", reading.ram.id, data),
    }));

  const failedControls: MaterialItem[] = categories
    .flatMap((id) => controlsWithResult(id, period, data, (r) => r === "not_effective"))
    .map((control) => ({
      kind: "control",
      id: control.id,
      name: control.name,
      categoryId: control.categoryId,
      detail: `Not effective: ${controlStanding(control.id, period, data)?.reason ?? ""}`.trim(),
      owner: control.owner,
      pathToGreen: pathFor("control", control.id, data),
    }));

  const incidents: MaterialItem[] = boardIncidents(period, data)
    .sort((a, b) => a.level - b.level || b.date.localeCompare(a.date))
    .map((incident) => ({
      kind: "incident",
      id: incident.id,
      name: incident.title,
      categoryId: incident.categoryId,
      detail: `${incident.severity}, ${incident.status}: ${incident.impact}`,
      owner: incident.owner,
      pathToGreen: pathFor("incident", incident.id, data),
    }));

  const moves: MaterialItem[] = categories
    .flatMap((id) => {
      const trend = computeTrend(id, period, data);
      const now = colourAt(id, period, data);
      if (!trend.prevColour || !now || trend.direction === "flat") return [];
      return [{ id, now, prev: trend.prevColour, label: trend.prevPeriodLabel }];
    })
    .sort(
      (a, b) =>
        Math.abs(COLOUR_RANK[b.now] - COLOUR_RANK[b.prev]) - Math.abs(COLOUR_RANK[a.now] - COLOUR_RANK[a.prev]),
    )
    .map((move) => ({
      kind: "ratingMove",
      id: `MOVE-${move.id}`,
      name: categoryLabel(move.id, data.config),
      categoryId: move.id,
      detail: `${move.label}: ${move.prev.toUpperCase()} → ${periodLabel(period)}: ${move.now.toUpperCase()}`,
      owner: null,
      pathToGreen: null,
    }));

  return [...redRams, ...failedControls, ...incidents, ...moves].slice(0, limit);
}
