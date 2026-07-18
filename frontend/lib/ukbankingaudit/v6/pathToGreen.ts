/**
 * v6 Path-to-Green — remediation ownership/status for RED and AMBER items,
 * seeded for the v6 fincrime and cyber domains (riskDomainsV4.ts KRIs).
 * SYNTHETIC, deterministic.
 *
 * lastUpdate.source rides a SEPARATE axis from severity — never fold it into
 * RAG: "system" = STATED (read from a system of record), "email" = INFERRED
 * (parsed from unstructured correspondence, lower assurance than "system").
 */

export type PathToGreen = {
  entityRef: string; // controlId / kri label / signal id
  owner: string; // "SMF17 · D. Fairweather"
  targetDate: string | null;
  escalation: "none" | "raised-to-committee" | "raised-to-board";
  lastUpdate: { text: string; at: string; source: "system" | "email" } | null;
};

const FINCRIME_OWNER = "SMF17 · D. Fairweather";
const CYBER_OWNER = "SMF24 · L. Marchetti";

const PATH_TO_GREEN: Record<string, PathToGreen> = {
  // fincrime — RED
  "KYC Periodic Review Backlog": {
    entityRef: "KYC Periodic Review Backlog",
    owner: FINCRIME_OWNER,
    targetDate: "2026-09-30",
    escalation: "raised-to-committee",
    lastUpdate: {
      text: "Recruited 6 L2 analysts; backlog down 220 w/w",
      at: "2026-07-12",
      source: "email",
    },
  },
  "High-Risk Reviews Overdue": {
    entityRef: "High-Risk Reviews Overdue",
    owner: FINCRIME_OWNER,
    targetDate: "2026-09-30",
    escalation: "raised-to-committee",
    lastUpdate: {
      text: "Overdue reviews tracked against the same KYC remediation programme; no independent target set.",
      at: "2026-07-01",
      source: "system",
    },
  },
  // fincrime — AMBER
  "TM Alerts Closed in SLA": {
    entityRef: "TM Alerts Closed in SLA",
    owner: FINCRIME_OWNER,
    targetDate: "2026-08-31",
    escalation: "none",
    lastUpdate: {
      text: "L1/L2 disposition capacity review scheduled; no additional headcount confirmed yet.",
      at: "2026-07-05",
      source: "system",
    },
  },
  "EDD Completed on Time": {
    entityRef: "EDD Completed on Time",
    owner: FINCRIME_OWNER,
    targetDate: "2026-08-31",
    escalation: "none",
    lastUpdate: {
      text: "Marginal improvement expected once the KYC backlog programme reduces upstream referral volume.",
      at: "2026-07-01",
      source: "system",
    },
  },
  // cyber — RED
  "Critical Vulnerabilities Open": {
    entityRef: "Critical Vulnerabilities Open",
    owner: CYBER_OWNER,
    targetDate: "2026-07-18",
    escalation: "raised-to-board",
    lastUpdate: {
      text: "Vendor patch in staging; production rollout phased across three windows.",
      at: "2026-07-08",
      source: "system",
    },
  },
  "Mean Time to Patch (Critical)": {
    entityRef: "Mean Time to Patch (Critical)",
    owner: CYBER_OWNER,
    targetDate: "2026-07-18",
    escalation: "raised-to-board",
    lastUpdate: {
      text: "CTO confirmed rollout plan holds the 18-Jul closure date on last sync.",
      at: "2026-07-10",
      source: "email",
    },
  },
  // fincrime — sub-category level (Customer Due Diligence / Transaction Monitoring)
  "Customer Due Diligence (KYC)": {
    entityRef: "Customer Due Diligence (KYC)",
    owner: FINCRIME_OWNER,
    targetDate: "2026-09-30",
    escalation: "raised-to-committee",
    lastUpdate: {
      text: "Recruited 6 L2 analysts; backlog down 220 w/w",
      at: "2026-07-12",
      source: "email",
    },
  },
  "Transaction Monitoring": {
    entityRef: "Transaction Monitoring",
    owner: FINCRIME_OWNER,
    targetDate: "2026-08-31",
    escalation: "none",
    lastUpdate: {
      text: "L1/L2 disposition capacity review scheduled; no additional headcount confirmed yet.",
      at: "2026-07-05",
      source: "system",
    },
  },
  // cyber — sub-category level
  "Vulnerability Management": {
    entityRef: "Vulnerability Management",
    owner: CYBER_OWNER,
    targetDate: "2026-07-18",
    escalation: "raised-to-board",
    lastUpdate: {
      text: "Vendor patch in staging; production rollout phased across three windows.",
      at: "2026-07-08",
      source: "system",
    },
  },
  "Cyber Threat Intelligence": {
    entityRef: "Cyber Threat Intelligence",
    owner: CYBER_OWNER,
    targetDate: "2026-07-31",
    escalation: "none",
    lastUpdate: {
      text: "SOC enhanced monitoring holding; no successful intrusion recorded since activation.",
      at: "2026-07-09",
      source: "system",
    },
  },
  // fincrime — exposure lens verdict (Block 1, when OVER appetite)
  "exposure:fincrime": {
    entityRef: "exposure:fincrime",
    owner: FINCRIME_OWNER,
    targetDate: "2026-10-31",
    escalation: "raised-to-committee",
    lastUpdate: {
      text: "De-risking plan drafted for the Trade-finance/MENA and Correspondent banking clusters; committee sign-off targeted next cycle.",
      at: "2026-07-09",
      source: "email",
    },
  },
};

export function getPathToGreen(entityRef: string): PathToGreen | null {
  return PATH_TO_GREEN[entityRef] ?? null;
}
