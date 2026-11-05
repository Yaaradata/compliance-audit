/** Controls & Incidents tab figures, derived from v8 records and the rating engine. */
import { buildControlStrip, formatDate } from "./boardView";
import { controlSchedule } from "./categoryDrillView";
import { categoryLabel } from "./config";
import {
  computeControlEffectiveness,
  controlStanding,
  previousPeriod,
  V8_ENGINE_DATA,
  type EngineData,
} from "./engine";
import type { ControlResult, IncidentControlLink, Period, RatedControl } from "./types";

export type CategoryEffectiveness = {
  categoryId: string;
  label: string;
  pct: number;
  prevPct: number | null;
  direction: "down" | "up" | "flat";
};

export type ControlMove = { controlId: string; categoryId: string; text: string };

export type ControlRow = {
  id: string;
  name: string;
  categoryId: string;
  categoryLabel: string;
  tier: RatedControl["tier"];
  owner: string;
  testFrequency: RatedControl["testFrequency"];
  lastTested: string | null;
  result: ControlResult | null;
  /** True when a linked incident, not the latest test, sets the result. */
  reRated: boolean;
  nextDue: string | null;
  overdue: boolean;
  linkedIncidentIds: string[];
};

export type OverdueTest = { id: string; name: string; categoryLabel: string; dueDate: string };

export type IncidentRow = {
  id: string;
  date: string;
  title: string;
  severity: string;
  level: 1 | 2 | 3;
  categoryId: string;
  categoryLabel: string;
  impact: string;
  owner: string;
  status: string;
  links: { controlId: string; controlName: string; worked: IncidentControlLink["controlWorked"] }[];
};

export type IncidentCounts = {
  sevOne: number;
  sevTwo: number;
  prevSevOne: number;
  prevSevTwo: number;
  periodWord: "month" | "quarter";
};

const RESULT_WORDS: Record<ControlResult, string> = {
  effective: "effective",
  partially_effective: "partially effective",
  not_effective: "not effective",
};

/** Lowest effectiveness first, so the weakest control environment reads at the top. */
export function buildCategoryEffectiveness(
  period: Period = V8_ENGINE_DATA.config.currentPeriod,
  data: EngineData = V8_ENGINE_DATA,
): CategoryEffectiveness[] {
  return data.config.riskTaxonomy
    .map((node) => {
      const { pct, prevPct } = computeControlEffectiveness(node.id, period, data);
      return {
        categoryId: node.id,
        label: categoryLabel(node.id, data.config),
        pct,
        prevPct,
        direction: (prevPct === null || prevPct === pct ? "flat" : pct < prevPct ? "down" : "up") as CategoryEffectiveness["direction"],
      };
    })
    .sort((a, b) => a.pct - b.pct || a.label.localeCompare(b.label));
}

export function buildWhatMoved(
  period: Period = V8_ENGINE_DATA.config.currentPeriod,
  data: EngineData = V8_ENGINE_DATA,
): ControlMove[] {
  return data.config.riskTaxonomy.flatMap((node) =>
    computeControlEffectiveness(node.id, period, data).changed.map((change) => {
      const when = change.date ? ` ${formatDate(change.date)}` : "";
      const result = change.to ? RESULT_WORDS[change.to] : "no result";
      return {
        controlId: change.controlId,
        categoryId: node.id,
        text: `${change.controlId} ${change.incidentId ? "re-rated" : "retested"}${when}: ${result} — ${change.reason}`,
      };
    }),
  );
}

export function buildControlRows(
  period: Period = V8_ENGINE_DATA.config.currentPeriod,
  data: EngineData = V8_ENGINE_DATA,
): ControlRow[] {
  return data.controls
    .map((control) => {
      const standing = controlStanding(control.id, period, data);
      const schedule = controlSchedule(control, data);
      return {
        id: control.id,
        name: control.name,
        categoryId: control.categoryId,
        categoryLabel: categoryLabel(control.categoryId, data.config),
        tier: control.tier,
        owner: control.owner,
        testFrequency: control.testFrequency,
        lastTested: schedule.lastTested,
        result: standing?.result ?? null,
        reRated: !!standing?.incidentId,
        nextDue: schedule.nextDue,
        overdue: schedule.overdue,
        linkedIncidentIds: data.links.filter((l) => l.controlId === control.id).map((l) => l.incidentId),
      };
    })
    .sort(
      (a, b) =>
        (a.tier === b.tier ? 0 : a.tier === "critical" ? -1 : 1) ||
        a.categoryLabel.localeCompare(b.categoryLabel) ||
        a.id.localeCompare(b.id),
    );
}

export function buildOverdueTests(data: EngineData = V8_ENGINE_DATA): OverdueTest[] {
  return data.controls.flatMap((control) => {
    const schedule = controlSchedule(control, data);
    return schedule.overdue && schedule.nextDue
      ? [
          {
            id: control.id,
            name: control.name,
            categoryLabel: categoryLabel(control.categoryId, data.config),
            dueDate: schedule.nextDue,
          },
        ]
      : [];
  });
}

/** Final home of the green-without-evidence warnings. */
export function buildEvidenceWarnings(
  period: Period = V8_ENGINE_DATA.config.currentPeriod,
  data: EngineData = V8_ENGINE_DATA,
): string[] {
  return buildControlStrip(period, data).evidenceWarnings;
}

export function buildIncidentCounts(
  period: Period = V8_ENGINE_DATA.config.currentPeriod,
  data: EngineData = V8_ENGINE_DATA,
): IncidentCounts {
  const previous = previousPeriod(period, data.config);
  const count = (level: number, at: Period) =>
    data.incidents.filter((i) => i.level === level && i.date.startsWith(at)).length;
  return {
    sevOne: count(1, period),
    sevTwo: count(2, period),
    prevSevOne: count(1, previous),
    prevSevTwo: count(2, previous),
    periodWord: data.config.reportingCadence === "quarterly" ? "quarter" : "month",
  };
}

/** Newest first within severity. Pass showSevThree to include Sev-3. */
export function buildIncidentRows(data: EngineData = V8_ENGINE_DATA, showSevThree = false): IncidentRow[] {
  return data.incidents
    .filter((i) => showSevThree || i.level <= 2)
    .sort((a, b) => a.level - b.level || b.date.localeCompare(a.date))
    .map((incident) => ({
      id: incident.id,
      date: incident.date,
      title: incident.title,
      severity: incident.severity,
      level: incident.level,
      categoryId: incident.categoryId,
      categoryLabel: categoryLabel(incident.categoryId, data.config),
      impact: incident.impact,
      owner: incident.owner,
      status: incident.status,
      links: data.links
        .filter((l) => l.incidentId === incident.id)
        .map((l) => ({
          controlId: l.controlId,
          controlName: data.controls.find((c) => c.id === l.controlId)?.name ?? l.controlId,
          worked: l.controlWorked,
        })),
    }));
}

/**
 * After a "failed" link, whether the current period actually moves. A passing test
 * after the incident clears the re-rating, and the screen must say so.
 */
export function linkEffectNote(
  incidentId: string,
  controlId: string,
  period: Period = V8_ENGINE_DATA.config.currentPeriod,
  data: EngineData = V8_ENGINE_DATA,
): string | null {
  const incident = data.incidents.find((i) => i.id === incidentId);
  if (!incident) return null;
  const clearing = data.controlTests
    .filter((t) => t.controlId === controlId && t.date > incident.date && t.result === "effective")
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const standing = controlStanding(controlId, period, data);
  if (clearing && standing?.incidentId !== incidentId) {
    return `${controlId} passed a test on ${formatDate(clearing.date)}, after this incident, so its current rating does not change.`;
  }
  return null;
}
