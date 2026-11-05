/**
 * v8 per-client configuration. Every rule the rating engine applies is set here,
 * so a bank can change its taxonomy, firm rule, thresholds and labels in one place.
 */
import { RISK_DOMAINS_V4 } from "./riskDomainsV8";
import type { CommitteeName, Period } from "./types";

export type RiskTaxonomyNode = {
  id: string;
  label: string;
  children?: RiskTaxonomyNode[];
};

export type FirmAggregationRule = "anyRed" | "twoReds" | "threeAmbersOrOneRed";
export type ReportingCadence = "monthly" | "quarterly";

export type V8Config = {
  riskTaxonomy: RiskTaxonomyNode[];
  firmAggregationRule: FirmAggregationRule;
  firmAggregationDescriptions: Record<FirmAggregationRule, string>;
  categoryRatingRule: { amberThreshold: number; redThreshold: number; description: string };
  severityLabels: Record<string, 1 | 2 | 3>;
  reportingCadence: ReportingCadence;
  committees: CommitteeName[];
  periods: Period[];
  currentPeriod: Period;
  asOf: string;
};

/** Display labels that differ from the source domain names. */
const LEVEL_1_LABELS: Record<string, string> = {
  cyber: "Cyber & Information Security",
};

function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const V8_CONFIG: V8Config = {
  riskTaxonomy: RISK_DOMAINS_V4.map((domain) => ({
    id: domain.id,
    label: LEVEL_1_LABELS[domain.id] ?? domain.name,
    children: domain.subCategories.map((sub) => ({
      id: `${domain.id}.${slug(sub.name)}`,
      label: sub.name,
    })),
  })),
  firmAggregationRule: "anyRed",
  firmAggregationDescriptions: {
    anyRed: "Any Level-1 risk red makes the firm red",
    twoReds: "Two or more Level-1 risks red make the firm red",
    threeAmbersOrOneRed: "One Level-1 risk red or three amber make the firm red",
  },
  categoryRatingRule: {
    amberThreshold: 95,
    redThreshold: 85,
    description:
      "Red if any metric is red, critical-control effectiveness is below 85% or a Sev-1 incident is open. " +
      "Amber if any metric is amber, effectiveness is below 95% or a Sev-2 incident is open. Otherwise green.",
  },
  severityLabels: { Sev1: 1, Sev2: 2, Sev3: 3 },
  reportingCadence: "monthly",
  committees: ["Board Risk Committee", "Executive Risk Committee"],
  periods: ["2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"],
  currentPeriod: "2026-11",
  asOf: "2026-11-05",
};

/** Level-1 label for a category id. Falls back to the id if it is not in the taxonomy. */
export function categoryLabel(categoryId: string, config: V8Config = V8_CONFIG): string {
  return config.riskTaxonomy.find((node) => node.id === categoryId)?.label ?? categoryId;
}
