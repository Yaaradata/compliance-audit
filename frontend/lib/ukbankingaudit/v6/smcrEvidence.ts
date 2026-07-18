/**
 * v6 SMCR — RSS component evidence layer (synthetic, deterministic).
 * Scores an SMF's evidence posture, never the SMF as a person.
 */
import type { RssComponentDef } from "@/components/UKBankingAudit/v3/config";

export type RssEvidenceState = "filled" | "hollow" | "hatched";

export type RssComponentEvidence = {
  componentKey: string;
  artefactId: string | null;
  cadenceSource: "register" | "policy-extracted" | "human-confirmed";
  expectedCadenceDays: number;
  /** Evidence ref surfaced on ClaimLine when the rail is hollow or hatched. */
  evidenceRef: string;
};

/**
 * Seeded per RSS component — mirrors DOMAIN_EVIDENCE semantics.
 * attestationFreshness (90) and issueAwareness (78) are BOTH hollow assertions.
 */
export const RSS_COMPONENT_EVIDENCE: RssComponentEvidence[] = [
  {
    componentKey: "oversightCadenceEvidence",
    artefactId: "EV-RS-Q1-CRO-001",
    cadenceSource: "human-confirmed",
    expectedCadenceDays: 90,
    evidenceRef: "EV-RS-Q1-CRO-001",
  },
  {
    componentKey: "escalationEvidence",
    artefactId: "EV-RS-Q1-CRO-003",
    cadenceSource: "human-confirmed",
    expectedCadenceDays: 90,
    evidenceRef: "EV-RS-Q1-CRO-003",
  },
  {
    componentKey: "attestationFreshness",
    artefactId: null,
    cadenceSource: "human-confirmed",
    expectedCadenceDays: 90,
    evidenceRef: "EVID-RSS-ATTEST-ASSERTION",
  },
  {
    componentKey: "issueAwareness",
    artefactId: null,
    cadenceSource: "human-confirmed",
    expectedCadenceDays: 30,
    evidenceRef: "EVID-RSS-ISSUE-ASSERTION",
  },
  {
    componentKey: "decisionLogCompleteness",
    artefactId: "EV-RS-Q1-CRO-002",
    cadenceSource: "human-confirmed",
    expectedCadenceDays: 90,
    evidenceRef: "EV-RS-Q1-CRO-002",
  },
  {
    componentKey: "mrmAlignment",
    artefactId: "EV-RS-Q1-CRO-003",
    cadenceSource: "human-confirmed",
    expectedCadenceDays: 180,
    evidenceRef: "EV-RS-Q1-CRO-003",
  },
  {
    componentKey: "sorAlignment",
    artefactId: "EV-RS-Q1-CRO-001",
    cadenceSource: "human-confirmed",
    expectedCadenceDays: 365,
    evidenceRef: "EV-RS-Q1-CRO-001",
  },
];

export function rssEvidenceForComponent(componentKey: string): RssComponentEvidence | undefined {
  return RSS_COMPONENT_EVIDENCE.find((e) => e.componentKey === componentKey);
}

export function rssEvidenceState(componentKey: string): RssEvidenceState {
  const evidence = rssEvidenceForComponent(componentKey);
  if (!evidence || evidence.cadenceSource !== "human-confirmed") return "hatched";
  if (evidence.artefactId === null) return "hollow";
  return "filled";
}

export function rssEvidenceStateForDef(def: RssComponentDef): RssEvidenceState {
  if (def.mergeKeys?.length) {
    const states = def.mergeKeys.map((k) => rssEvidenceState(k));
    if (states.every((s) => s === "filled")) return "filled";
    if (states.some((s) => s === "hollow")) return "hollow";
    return "hatched";
  }
  return rssEvidenceState(def.key);
}
