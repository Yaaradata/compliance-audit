/**
 * What each SMF owns on the Reasonable Steps screen: risk appetite metrics, controls
 * and incidents. Only SMFs with data get a card; no owners are invented.
 */
import { formatDate } from "./boardView";
import { controlSchedule } from "./categoryDrillView";
import { controlStanding, periodLabel, previousPeriod, V8_ENGINE_DATA, type EngineData } from "./engine";
import { buildRamRows, type RamRow } from "./riskAppetiteView";
import type { ControlResult, IncidentControlLink, Period, RatedControl, SmfRef } from "./types";

/** Reasonable Steps Score at the previous review. Current scores live on the SMF record. */
const PREVIOUS_RSS: Record<string, number> = {
  SMF4: 83,
  SMF17: 71,
  SMF16: 78,
  SMF5: 84,
  SMF24: 74,
};

export type RssTrend = {
  direction: "worse" | "better" | "flat";
  arrow: "▼" | "▲" | "▬";
  text: string;
};

/** Higher RSS is better, so a falling score reads "▼ was 71 in Oct". */
export function buildRssTrend(
  smfFunction: string,
  score: number,
  period: Period = V8_ENGINE_DATA.config.currentPeriod,
  data: EngineData = V8_ENGINE_DATA,
): RssTrend | null {
  const previous = PREVIOUS_RSS[smfFunction];
  if (previous === undefined) return null;
  const label = periodLabel(previousPeriod(period, data.config));
  if (score < previous) return { direction: "worse", arrow: "▼", text: `▼ was ${previous} in ${label}` };
  if (score > previous) return { direction: "better", arrow: "▲", text: `▲ was ${previous} in ${label}` };
  return { direction: "flat", arrow: "▬", text: `▬ also ${previous} in ${label}` };
}

export type OwnedControlRow = {
  id: string;
  name: string;
  tier: RatedControl["tier"] | null;
  result: ControlResult | null;
  lastTested: string | null;
  nextDue: string | null;
  overdue: boolean;
};

export type OwnedIncidentRow = {
  id: string;
  title: string;
  severity: string;
  date: string;
  status: string;
  controls: { controlId: string; worked: IncidentControlLink["controlWorked"] }[];
};

export type SmfRiskView = {
  rams: RamRow[];
  controls: OwnedControlRow[];
  incidents: OwnedIncidentRow[];
};

export function buildSmfRiskView(
  smfFunction: string,
  accountableControlIds: string[],
  period: Period = V8_ENGINE_DATA.config.currentPeriod,
  data: EngineData = V8_ENGINE_DATA,
): SmfRiskView {
  const ownedRamIds = new Set(data.rams.filter((r) => r.smf === (smfFunction as SmfRef)).map((r) => r.id));
  const rams = buildRamRows(period, data).filter((row) => ownedRamIds.has(row.id));

  const controls = accountableControlIds
    .map((id): OwnedControlRow => {
      const control = data.controls.find((c) => c.id === id);
      const schedule = control ? controlSchedule(control, data) : null;
      return {
        id,
        name: control?.name ?? id,
        tier: control?.tier ?? null,
        result: controlStanding(id, period, data)?.result ?? null,
        lastTested: schedule?.lastTested ?? null,
        nextDue: schedule?.nextDue ?? null,
        overdue: schedule?.overdue ?? false,
      };
    })
    .sort((a, b) => Number(b.tier === "critical") - Number(a.tier === "critical") || a.id.localeCompare(b.id));

  const owned = new Set([
    ...accountableControlIds,
    ...data.controls.filter((c) => c.smf === (smfFunction as SmfRef)).map((c) => c.id),
  ]);
  const incidents = data.incidents
    .filter((i) => i.level <= 2)
    .sort((a, b) => a.level - b.level || b.date.localeCompare(a.date))
    .flatMap((incident): OwnedIncidentRow[] => {
      const links = data.links.filter((l) => l.incidentId === incident.id && owned.has(l.controlId));
      if (links.length === 0) return [];
      return [
        {
          id: incident.id,
          title: incident.title,
          severity: incident.severity,
          date: formatDate(incident.date),
          status: incident.status,
          controls: links.map((l) => ({ controlId: l.controlId, worked: l.controlWorked })),
        },
      ];
    });

  return { rams, controls, incidents };
}

/** Appetite breaches awaiting acknowledgement, mapped to the v8 metric they correspond to. */
const APPETITE_TO_RAM: Record<string, string> = {
  "APP-FC-002": "RAM-FC-03",
  "APP-CC-001": "RAM-CD-01",
};

export function ramForAppetiteBreach(appetiteId: string): string | null {
  return APPETITE_TO_RAM[appetiteId] ?? null;
}
