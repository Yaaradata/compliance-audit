/**
 * UK Board v1 — widget registry (Stage 8 §1.7, V-11).
 * widget → screen → data source → viewer. CardShell reads `integrationDependent` from here.
 */
import type { Viewer } from "./types";

export type WidgetSource = "d1_register" | "bank_feed" | "derived";

export interface WidgetRegistryEntry {
  widgetId: string;
  component: string;
  screen: "S1" | "S2" | "S3" | "S4" | "drill";
  zone: string;
  /** T2-n; never rendered on a face. */
  cardIds: string[];
  source: WidgetSource;
  integrationDependent?: { feed: string; caveat: string };
  viewers: Viewer[];
}

const ALL: Viewer[] = ["cro", "brc_chair_preview"];
const caveat = (feed: string) => ({ feed, caveat: `Needs the society's ${feed} access` });

export const WIDGET_REGISTRY: WidgetRegistryEntry[] = [
  { widgetId: "s1.z3.band", component: "AiExecutiveBand", screen: "S1", zone: "Z3", cardIds: [], source: "derived", viewers: ALL },
  { widgetId: "s3.z0.band", component: "AiExecutiveBand", screen: "S3", zone: "Z0", cardIds: [], source: "derived", viewers: ALL },
  { widgetId: "s4.z0.band", component: "AiExecutiveBand", screen: "S4", zone: "Z0", cardIds: [], source: "derived", viewers: ALL },
  { widgetId: "s1.z1.headline", component: "HeadlineBlock", screen: "S1", zone: "Z1", cardIds: ["T2-1"], source: "d1_register", viewers: ALL },
  { widgetId: "s1.z1.strip", component: "StrategyStrip", screen: "S1", zone: "Z1", cardIds: ["T2-2", "T2-3", "T2-6", "T2-8"], source: "d1_register", viewers: ALL },
  { widgetId: "s1.z2.capacity", component: "CapacityCard", screen: "S1", zone: "Z2", cardIds: ["T2-5"], source: "bank_feed", integrationDependent: caveat("HR capacity and alert queue"), viewers: ALL },
  { widgetId: "s1.z5.defensibility", component: "DefensibilityCard", screen: "S1", zone: "Z5", cardIds: ["T2-14", "T2-17"], source: "bank_feed", integrationDependent: caveat("transaction monitoring reconciliation"), viewers: ALL },
  { widgetId: "s1.z4.scorecard", component: "RasScorecard", screen: "S1", zone: "Z4", cardIds: ["T2-12", "T2-4", "T2-15", "T2-16", "T2-18"], source: "d1_register", viewers: ALL },
  { widgetId: "s1.z6.horizon", component: "HorizonLine", screen: "S1", zone: "Z6", cardIds: ["T2-13", "T2-26", "T2-31"], source: "d1_register", viewers: ALL },
  { widgetId: "s2.drill", component: "PrincipalRiskDrillScreen", screen: "S2", zone: "a–i", cardIds: ["T2-15", "T2-23", "T2-32", "T2-33"], source: "derived", viewers: ALL },
  { widgetId: "s3.z1.population", component: "PopulationTestCard", screen: "S3", zone: "Z1", cardIds: ["T2-27"], source: "bank_feed", integrationDependent: caveat("account-opening population"), viewers: ALL },
  { widgetId: "s3.z2.clauses", component: "ClauseEvidenceList", screen: "S3", zone: "Z2", cardIds: ["T2-28"], source: "d1_register", viewers: ALL },
  { widgetId: "s3.z3.ledger", component: "ReportabilityLedger", screen: "S3", zone: "Z3", cardIds: ["T2-29"], source: "d1_register", viewers: ALL },
  { widgetId: "s3.z3.awareness", component: "AwarenessGapBlock", screen: "drill", zone: "route", cardIds: ["T2-30"], source: "d1_register", viewers: ["cro"] },
  { widgetId: "s4.z1.headline", component: "EscalationHeadline", screen: "S4", zone: "Z1", cardIds: ["T2-34", "T2-35"], source: "d1_register", viewers: ALL },
  { widgetId: "s4.z2.feed", component: "ExceptionFeed", screen: "S4", zone: "Z2", cardIds: ["T2-35"], source: "d1_register", viewers: ALL },
  { widgetId: "s4.z3.kri", component: "GovernanceKriTile", screen: "S4", zone: "Z3", cardIds: ["T2-36", "T2-37", "T2-38"], source: "d1_register", viewers: ALL },
];

/** Bank-fed scorecard rows (V-11): star + access caveat. */
export const BANK_FED_UNITS: Record<string, string> = {
  "u-tm": "transaction monitoring reconciliation",
  "u-sanctions": "sanctions screening reconciliation",
  "u-capacity": "HR capacity and alert queue",
  "u-restriction": "account-opening population",
};

export function registryEntry(widgetId: string): WidgetRegistryEntry | undefined {
  return WIDGET_REGISTRY.find((w) => w.widgetId === widgetId);
}
