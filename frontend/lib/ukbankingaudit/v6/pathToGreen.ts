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
const CONDUCT_OWNER = "SMF16 · P. Nwachukwu";
const UNOWNED = "UNOWNED — no accountable individual mapped";

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
  // fincrime — sub-category level (Fraud & Scams, CRO drill)
  "Fraud & Scams": {
    entityRef: "Fraud & Scams",
    owner: FINCRIME_OWNER,
    targetDate: "2026-10-31",
    escalation: "raised-to-committee",
    lastUpdate: {
      text: "Scam-controls remediation plan drafted — confirmation-of-payee coverage extension and outbound payment friction for high-risk corridors; committee sign-off targeted next cycle.",
      at: "2026-07-11",
      source: "email",
    },
  },

  // fincrime — fraud lens, APP reimbursement exposure
  "fraud:app": {
    entityRef: "fraud:app",
    owner: FINCRIME_OWNER,
    targetDate: "2026-10-31",
    escalation: "raised-to-committee",
    lastUpdate: {
      text: "Scam-controls remediation plan drafted — confirmation-of-payee coverage extension and outbound payment friction for high-risk corridors; committee sign-off targeted next cycle.",
      at: "2026-07-11",
      source: "email",
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

  // ─── Board signals (CRO Board View, runBoardDetectors) ────────────────────
  // Keyed by signal.crsaRef where the signal carries one (Precedent Match
  // cards), otherwise by signal.id — mirrors how BoardSignalCard and
  // SignalInvestigationDrawer derive entityRef (signal.crsaRef ?? signal.id).
  // Owner on every entry matches accountabilityFor(signal.domainId), i.e. the
  // card's own SMF chip — never defaulted to fincrime.

  // Precedent Match — fincrime CRSA refs
  "AML.01.05.02": {
    entityRef: "AML.01.05.02",
    owner: FINCRIME_OWNER,
    targetDate: "2026-09-30",
    escalation: "raised-to-board",
    lastUpdate: {
      text: "MLRO Reporting control rebuild scoped; interim manual review in place pending L2 capacity",
      at: "2026-07-14",
      source: "email",
    },
  },
  "AML.01.06.01": {
    entityRef: "AML.01.06.01",
    owner: FINCRIME_OWNER,
    targetDate: "2026-09-30",
    escalation: "raised-to-committee",
    lastUpdate: {
      text: "AML/CTF risk assessment ratification review in progress; run alongside the KYC backlog remediation programme.",
      at: "2026-07-07",
      source: "system",
    },
  },
  "AML.01.08.01": {
    entityRef: "AML.01.08.01",
    owner: FINCRIME_OWNER,
    targetDate: "2026-09-30",
    escalation: "raised-to-committee",
    lastUpdate: {
      text: "High-risk relationship identification review folded into the KYC backlog remediation programme.",
      at: "2026-07-07",
      source: "system",
    },
  },
  "SCTN.01.01.01": {
    entityRef: "SCTN.01.01.01",
    owner: FINCRIME_OWNER,
    targetDate: "2026-08-31",
    escalation: "raised-to-committee",
    lastUpdate: {
      text: "Sanctions screening control mechanism reviewed against the matched precedent; enhanced monitoring rule change in testing.",
      at: "2026-07-12",
      source: "email",
    },
  },
  "ABC.01.01.01": {
    entityRef: "ABC.01.01.01",
    owner: FINCRIME_OWNER,
    targetDate: "2026-09-30",
    escalation: "raised-to-committee",
    lastUpdate: {
      text: "Bribery risk assessment refresh scheduled alongside the wider financial-crime risk-assessment cycle.",
      at: "2026-07-07",
      source: "system",
    },
  },

  // Green Without Evidence — the issue is "no evidence produced", so the
  // path-to-green is an evidence-pack request, not a control rebuild.
  "green-without-evidence-fincrime-sanctions-pep-screening": {
    entityRef: "green-without-evidence-fincrime-sanctions-pep-screening",
    owner: FINCRIME_OWNER,
    targetDate: "2026-08-15",
    escalation: "raised-to-committee",
    lastUpdate: {
      text: "Evidence pack for sanctions screening cadence requested from 1st line; due 15 Aug",
      at: "2026-07-10",
      source: "email",
    },
  },
  "green-without-evidence-conduct-consumer-duty": {
    entityRef: "green-without-evidence-conduct-consumer-duty",
    owner: CONDUCT_OWNER,
    targetDate: "2026-08-15",
    escalation: "raised-to-committee",
    lastUpdate: {
      text: "Evidence pack for the Consumer Duty fair-value assessment requested from 1st line; due 15 Aug",
      at: "2026-07-10",
      source: "email",
    },
  },

  // Other board signal types
  "kri-breach-no-plan-fincrime": {
    entityRef: "kri-breach-no-plan-fincrime",
    owner: FINCRIME_OWNER,
    targetDate: "2026-09-30",
    escalation: "raised-to-committee",
    lastUpdate: {
      text: "Remediation plan for the medium/low-risk backlog tranche is being scoped following high-risk cohort completion.",
      at: "2026-07-11",
      source: "system",
    },
  },
  "signed-not-evidenced-cyber": {
    entityRef: "signed-not-evidenced-cyber",
    owner: CYBER_OWNER,
    targetDate: "2026-07-18",
    escalation: "raised-to-board",
    lastUpdate: {
      text: "Closure pack signature confirmed; supporting artefact upload pending from InfoSec.",
      at: "2026-07-09",
      source: "system",
    },
  },
  "signed-not-evidenced-fincrime": {
    entityRef: "signed-not-evidenced-fincrime",
    owner: FINCRIME_OWNER,
    targetDate: "2026-08-31",
    escalation: "raised-to-committee",
    lastUpdate: {
      text: "Signed attestation confirmed; supporting evidence pack requested from the attesting 1st-line owner.",
      at: "2026-07-10",
      source: "system",
    },
  },
  "standing-status-cyber": {
    entityRef: "standing-status-cyber",
    owner: CYBER_OWNER,
    targetDate: "2026-07-18",
    escalation: "raised-to-board",
    lastUpdate: {
      text: "Tracked jointly with the critical-vulnerability closure programme; same target date.",
      at: "2026-07-10",
      source: "system",
    },
  },
  "tolerance-expiry-RA-FINCRIME-2025-004": {
    entityRef: "tolerance-expiry-RA-FINCRIME-2025-004",
    owner: FINCRIME_OWNER,
    targetDate: "2026-09-30",
    escalation: "raised-to-committee",
    lastUpdate: {
      text: "Re-approval paper for the Banking Proposition Board drafted; submission targeted for the September cycle.",
      at: "2026-07-08",
      source: "email",
    },
  },

  // Accountability Orphan — the finding IS the absence of an owner. Seeding a
  // fabricated owner here would contradict the signal; instead the entry
  // states the gap honestly rather than falling through to the generic
  // "no path to green recorded" empty state.
  "accountability-orphan-climate": {
    entityRef: "accountability-orphan-climate",
    owner: UNOWNED,
    targetDate: null,
    escalation: "none",
    lastUpdate: {
      text: "Awaiting first-line remediation plan; ownership not yet assigned.",
      at: "2026-07-10",
      source: "system",
    },
  },
  "accountability-orphan-market": {
    entityRef: "accountability-orphan-market",
    owner: UNOWNED,
    targetDate: null,
    escalation: "none",
    lastUpdate: {
      text: "Awaiting first-line remediation plan; ownership not yet assigned.",
      at: "2026-07-10",
      source: "system",
    },
  },
  "accountability-orphan-opsres": {
    entityRef: "accountability-orphan-opsres",
    owner: UNOWNED,
    targetDate: null,
    escalation: "none",
    lastUpdate: {
      text: "Awaiting first-line remediation plan; ownership not yet assigned.",
      at: "2026-07-10",
      source: "system",
    },
  },
};

export function getPathToGreen(entityRef: string): PathToGreen | null {
  return PATH_TO_GREEN[entityRef] ?? null;
}
