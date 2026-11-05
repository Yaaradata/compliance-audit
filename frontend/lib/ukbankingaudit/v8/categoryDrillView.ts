/**
 * Category drill-down figures in standard RCSA language: risk appetite, then control
 * environment, then residual risk. Everything is derived from v8 records.
 */
import { buildCategoryTile, formatDate, type CategoryTileView } from "./boardView";
import {
  boardIncidents,
  computeCategoryRating,
  computeControlEffectiveness,
  computeTrend,
  controlStanding,
  periodLabel,
  previousPeriod,
  V8_ENGINE_DATA,
  type EngineData,
} from "./engine";
import { buildRamRows, type RamRow } from "./riskAppetiteView";
import type {
  ControlResult,
  IncidentControlLink,
  PathToGreenRecord,
  Period,
  RatedControl,
  RatingColour,
} from "./types";

export type ControlSchedule = {
  lastTested: string | null;
  nextDue: string | null;
  overdue: boolean;
};

function addMonths(isoDate: string, months: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1 + months, day)).toISOString().slice(0, 10);
}

/** When a control was last tested and when its next test falls due. */
export function controlSchedule(control: RatedControl, data: EngineData = V8_ENGINE_DATA): ControlSchedule {
  const tests = data.controlTests
    .filter((t) => t.controlId === control.id && t.date <= data.config.asOf)
    .sort((a, b) => a.date.localeCompare(b.date));
  const lastTested = tests.at(-1)?.date ?? null;
  if (!lastTested) return { lastTested: null, nextDue: null, overdue: true };
  const nextDue = addMonths(lastTested, control.testFrequency === "quarterly" ? 3 : 1);
  return { lastTested, nextDue, overdue: nextDue < data.config.asOf };
}

export type WeakControl = {
  id: string;
  name: string;
  result: ControlResult;
  lastTested: string;
  reason: string;
};

export type EvidenceGap = { id: string; name: string; lastTested: string };

export type DrillIncident = {
  id: string;
  title: string;
  severity: string;
  status: string;
  date: string;
  links: { controlId: string; controlName: string; worked: IncidentControlLink["controlWorked"] }[];
};

export type EarlyWarning = {
  /** Rule output in plain words. It reports a trend, never a prediction. */
  text: string;
  flagged: boolean;
};

export type CategoryDrillView = {
  tile: CategoryTileView;
  rams: RamRow[];
  effectivePct: number;
  previousEffectivePct: number | null;
  previousLabel: string;
  weakControls: WeakControl[];
  tests: {
    criticalCount: number;
    dueNext30Days: number;
    overdue: { id: string; name: string; dueDate: string }[];
    latestEvidenceDate: string | null;
    withoutEvidence: EvidenceGap[];
  };
  history: { period: Period; label: string; colour: RatingColour }[];
  trendCause: string;
  earlyWarning: EarlyWarning;
  incidents: DrillIncident[];
  /** Nearest target in the category, used for the remediation summary. */
  nextPath: PathToGreenRecord | null;
};

const EARLY_WARNING_DAYS = 180;
const DAYS_PER_MONTH = 365 / 12;

/** Least-squares change per month across the metric's monthly values. */
function monthlySlope(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  const meanX = (n - 1) / 2;
  const meanY = values.reduce((sum, v) => sum + v, 0) / n;
  const top = values.reduce((sum, v, i) => sum + (i - meanX) * (v - meanY), 0);
  const bottom = values.reduce((sum, _v, i) => sum + (i - meanX) ** 2, 0);
  return top / bottom;
}

/** Days until a green metric reaches its limit at its current rate. Null if not heading there. */
function daysToLimit(row: RamRow, data: EngineData): number | null {
  const ram = data.rams.find((r) => r.id === row.id);
  if (!ram) return null;
  const slope = monthlySlope(row.series.map((s) => s.value));
  const gap = ram.limit - row.value;
  const heading = ram.direction === "higherIsWorse" ? slope > 0 && gap > 0 : slope < 0 && gap < 0;
  return heading ? Math.ceil((gap / slope) * DAYS_PER_MONTH) : null;
}

/** Rule-based, from the same metrics shown in the table. It reports a rate, not a prediction. */
function earlyWarningFrom(rows: RamRow[], data: EngineData): EarlyWarning {
  const beyond = rows.find((row) => row.status !== "green");
  if (beyond) {
    return { flagged: true, text: `Rule-based early warning: ${beyond.name} is already beyond its limit.` };
  }
  const nearest = rows
    .map((row) => ({ row, days: daysToLimit(row, data) }))
    .filter((item): item is { row: RamRow; days: number } => item.days !== null && item.days <= EARLY_WARNING_DAYS)
    .sort((a, b) => a.days - b.days)[0];
  if (nearest) {
    return {
      flagged: true,
      text: `Rule-based early warning: ${nearest.row.name} is inside appetite today. At its current rate it reaches its limit in ${nearest.days} days.`,
    };
  }
  return {
    flagged: false,
    text: `Rule-based early warning: none. No metric reaches its limit within ${EARLY_WARNING_DAYS} days at its current rate.`,
  };
}

/** Ratings for the last three periods, recorded where available, otherwise calculated. */
function ratingHistory(categoryId: string, period: Period, data: EngineData) {
  const earlier = previousPeriod(period, data.config);
  const earliest = previousPeriod(earlier, data.config);
  return [earliest, earlier, period].map((p) => ({
    period: p,
    label: periodLabel(p),
    colour:
      p === period
        ? computeCategoryRating(categoryId, p, data).colour
        : (data.snapshots.find((s) => s.entity === categoryId && s.period === p)?.colour ??
          computeCategoryRating(categoryId, p, data).colour),
  }));
}

function causeOfTrend(categoryId: string, period: Period, data: EngineData): string {
  const trend = computeTrend(categoryId, period, data);
  const why = computeCategoryRating(categoryId, period, data).why;
  if (!trend.prevColour) return why;
  if (trend.direction === "flat") {
    return `No rating change from ${trend.prevPeriodLabel}. ${why}.`;
  }
  const move = trend.direction === "worse" ? "Worse" : "Better";
  return `${move} than ${trend.prevPeriodLabel} (${trend.prevColour.toUpperCase()}). ${why}.`;
}

export function buildCategoryDrill(
  categoryId: string,
  period: Period = V8_ENGINE_DATA.config.currentPeriod,
  data: EngineData = V8_ENGINE_DATA,
): CategoryDrillView {
  const critical = data.controls.filter((c) => c.categoryId === categoryId && c.tier === "critical");
  const effectiveness = computeControlEffectiveness(categoryId, period, data);
  const rams = buildRamRows(period, data).filter((row) => row.categoryId === categoryId);

  const weakControls = critical.flatMap((control): WeakControl[] => {
    const standing = controlStanding(control.id, period, data);
    if (!standing || standing.result === "effective") return [];
    return [
      {
        id: control.id,
        name: control.name,
        result: standing.result,
        lastTested: standing.date,
        reason: standing.reason,
      },
    ];
  });

  const schedules = critical.map((control) => ({ control, schedule: controlSchedule(control, data) }));
  const horizon = addMonths(data.config.asOf, 1);
  const latestTests = critical.flatMap((control) => {
    const tests = data.controlTests
      .filter((t) => t.controlId === control.id && t.date <= data.config.asOf)
      .sort((a, b) => a.date.localeCompare(b.date));
    const latest = tests.at(-1);
    return latest ? [{ control, latest }] : [];
  });

  const incidents = boardIncidents(period, data)
    .filter((i) => i.categoryId === categoryId)
    .sort((a, b) => a.level - b.level || b.date.localeCompare(a.date))
    .map((incident) => ({
      id: incident.id,
      title: incident.title,
      severity: incident.severity,
      status: incident.status,
      date: incident.date,
      links: data.links
        .filter((l) => l.incidentId === incident.id)
        .map((l) => ({
          controlId: l.controlId,
          controlName: data.controls.find((c) => c.id === l.controlId)?.name ?? l.controlId,
          worked: l.controlWorked,
        })),
    }));

  const categoryPaths = data.pathsToGreen
    .filter((path) => {
      if (path.targetType === "ram") return data.rams.find((r) => r.id === path.targetId)?.categoryId === categoryId;
      if (path.targetType === "control") return critical.some((c) => c.id === path.targetId);
      return data.incidents.find((i) => i.id === path.targetId)?.categoryId === categoryId;
    })
    .sort((a, b) => a.targetDate.localeCompare(b.targetDate));

  return {
    tile: buildCategoryTile(categoryId, period, data),
    rams,
    effectivePct: effectiveness.pct,
    previousEffectivePct: effectiveness.prevPct,
    previousLabel: periodLabel(previousPeriod(period, data.config)),
    weakControls,
    tests: {
      criticalCount: critical.length,
      dueNext30Days: schedules.filter(
        ({ schedule }) => schedule.nextDue && !schedule.overdue && schedule.nextDue <= horizon,
      ).length,
      overdue: schedules.flatMap(({ control, schedule }) =>
        schedule.overdue && schedule.nextDue
          ? [{ id: control.id, name: control.name, dueDate: schedule.nextDue }]
          : [],
      ),
      latestEvidenceDate:
        latestTests
          .filter(({ latest }) => latest.evidenceId !== null)
          .map(({ latest }) => latest.date)
          .sort()
          .at(-1) ?? null,
      withoutEvidence: latestTests
        .filter(({ latest }) => latest.evidenceId === null)
        .map(({ control, latest }) => ({ id: control.id, name: control.name, lastTested: latest.date })),
    },
    history: ratingHistory(categoryId, period, data),
    trendCause: causeOfTrend(categoryId, period, data),
    earlyWarning: earlyWarningFrom(rams, data),
    incidents,
    nextPath: categoryPaths[0] ?? null,
  };
}

/** One line under the cyber remediation: "cause · owner · target date · 2nd line". */
export function pathSummaryText(path: PathToGreenRecord): string {
  return [path.cause, path.owner, formatDate(path.targetDate), `2nd line ${path.secondLineVerdict}`].join(" · ");
}
