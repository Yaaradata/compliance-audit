/**
 * v8 local risk state, shared across tabs for the session. Path to green saves and
 * incident links land here, so the engine re-rates every screen from the same records.
 * Local only: nothing is sent anywhere.
 */
import { V8_ENGINE_DATA, type EngineData } from "./engine";
import type { PathToGreenRecord, SmfRef } from "./types";

export type RiskTrailEvent = {
  timestamp: string;
  eventType: "decision" | "escalation" | "acknowledgement";
  label: string;
  evidenceId: string;
  /** The SMF whose Reasonable Steps Trail this belongs on. */
  smf: SmfRef;
};

export type RiskState = {
  data: EngineData;
  trail: RiskTrailEvent[];
};

const INITIAL: RiskState = { data: V8_ENGINE_DATA, trail: [] };

let state: RiskState = INITIAL;
const listeners = new Set<() => void>();

function setState(next: RiskState): void {
  state = next;
  for (const listener of listeners) listener();
}

export function getRiskState(): RiskState {
  return state;
}

export function getInitialRiskState(): RiskState {
  return INITIAL;
}

export function subscribeRisk(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetRiskStore(): void {
  setState(INITIAL);
}

function categoryIdOf(path: Pick<PathToGreenRecord, "targetType" | "targetId">, data: EngineData) {
  if (path.targetType === "ram") return data.rams.find((r) => r.id === path.targetId)?.categoryId;
  if (path.targetType === "control") return data.controls.find((c) => c.id === path.targetId)?.categoryId;
  return data.incidents.find((i) => i.id === path.targetId)?.categoryId;
}

/** Items in a category with no allocated SMF sit with the CRO, who oversees all of them. */
function accountableSmf(path: PathToGreenRecord, data: EngineData): SmfRef {
  const categoryId = categoryIdOf(path, data);
  return (
    data.rams.find((r) => r.categoryId === categoryId && r.smf)?.smf ??
    data.controls.find((c) => c.categoryId === categoryId && c.smf)?.smf ??
    "SMF4"
  );
}

/** What a save means for SM&CR evidence. Pure, so the mapping can be tested directly. */
export function trailEventsForSave(
  previous: PathToGreenRecord | undefined,
  next: PathToGreenRecord,
  smf: SmfRef,
  timestamp: string,
): RiskTrailEvent[] {
  const base = { timestamp, evidenceId: next.id, smf };
  const events: RiskTrailEvent[] = [];
  if (next.secondLineVerdict !== previous?.secondLineVerdict) {
    const who = next.secondLineReviewer ? ` by ${next.secondLineReviewer}` : "";
    if (next.secondLineVerdict === "challenged") {
      events.push({ ...base, eventType: "escalation", label: `Path to green for ${next.targetId} challenged${who}` });
    }
    if (next.secondLineVerdict === "accepted") {
      events.push({ ...base, eventType: "acknowledgement", label: `Path to green for ${next.targetId} accepted${who}` });
    }
  }
  if (next.committeeDecision !== previous?.committeeDecision && next.committeeDecision !== "pending") {
    const decision = next.committeeDecision.replace("_", " ");
    events.push({
      ...base,
      eventType: next.committeeDecision === "sent_back" ? "escalation" : "decision",
      label: `${next.committee} decision on ${next.targetId}: ${decision}`,
    });
  }
  if (events.length === 0) {
    events.push({ ...base, eventType: "decision", label: `Path to green for ${next.targetId} updated by ${next.owner}` });
  }
  return events;
}

/** Add or replace a path to green, and record the save on the trail. */
export function savePathToGreen(record: PathToGreenRecord, now: string = new Date().toISOString()): void {
  const { data, trail } = state;
  const previous = data.pathsToGreen.find((p) => p.id === record.id);
  const pathsToGreen = previous
    ? data.pathsToGreen.map((p) => (p.id === record.id ? record : p))
    : [...data.pathsToGreen, record];
  const events = trailEventsForSave(previous, record, accountableSmf(record, data), now);
  setState({ data: { ...data, pathsToGreen }, trail: [...events, ...trail] });
}
