/**
 * v6 Path-to-Green — remediation ownership/status for RED and AMBER items,
 * seeded for the v6 fincrime and cyber domains (riskDomainsV4.ts KRIs).
 * SYNTHETIC, deterministic.
 *
 * lastUpdate.source rides a SEPARATE axis from severity — never fold it into
 * RAG: "system" = STATED (read from a system of record), "email" = INFERRED
 * (parsed from unstructured correspondence, lower assurance than "system").
 *
 * progressPct is derived from steps: (done + 0.5 × in-progress) / total.
 * A "blocked" step contributes 0 — that is why a plan can sit at ~40% and stall.
 */

export type PathToGreenStep = {
  label: string;
  state: "done" | "in-progress" | "blocked" | "not-started";
  dueDate: string | null;
};

export type PathToGreen = {
  entityRef: string; // controlId / kri label / signal id
  owner: string; // "SMF17 · D. Fairweather"
  startDate: string; // when remediation opened
  targetDate: string | null;
  progressPct: number; // 0..100
  currentRag: "red" | "amber";
  targetRag: "green";
  escalation: "none" | "raised-to-committee" | "raised-to-board";
  steps: PathToGreenStep[];
  lastUpdate: { text: string; at: string; source: "system" | "email" } | null;
};

/** Honest progress from step states — blocked and not-started count as zero. */
function progressFromSteps(steps: PathToGreenStep[]): number {
  if (steps.length === 0) return 0;
  const score = steps.reduce((acc, step) => {
    switch (step.state) {
      case "done":
        return acc + 1;
      case "in-progress":
        return acc + 0.5;
      case "blocked":
      case "not-started":
        return acc;
      default: {
        const _exhaustive: never = step.state;
        return _exhaustive;
      }
    }
  }, 0);
  return Math.round((score / steps.length) * 100);
}

type PathSeed = Omit<PathToGreen, "progressPct" | "targetRag">;

function path(seed: PathSeed): PathToGreen {
  return {
    ...seed,
    targetRag: "green",
    progressPct: progressFromSteps(seed.steps),
  };
}

const FINCRIME_OWNER = "SMF17 · D. Fairweather";
const CYBER_OWNER = "SMF24 · L. Marchetti";
const CONDUCT_OWNER = "SMF16 · P. Nwachukwu";
const UNOWNED = "UNOWNED — no accountable individual mapped";

const PATH_TO_GREEN: Record<string, PathToGreen> = {
  // fincrime — RED
  "KYC Periodic Review Backlog": path({
    entityRef: "KYC Periodic Review Backlog",
    owner: FINCRIME_OWNER,
    startDate: "2026-04-15",
    targetDate: "2026-09-30",
    currentRag: "red",
    escalation: "raised-to-committee",
    steps: [
      { label: "Scope high-risk cohort remediation", state: "done", dueDate: "2026-05-01" },
      { label: "Recruit L2 analysts", state: "done", dueDate: "2026-06-30" },
      { label: "Work down high-risk backlog", state: "in-progress", dueDate: "2026-08-31" },
      { label: "Medium/low-risk tranche clearance", state: "not-started", dueDate: "2026-09-30" },
    ],
    lastUpdate: {
      text: "Recruited 6 L2 analysts; backlog down 220 w/w",
      at: "2026-07-12",
      source: "email",
    },
  }),
  "High-Risk Reviews Overdue": path({
    entityRef: "High-Risk Reviews Overdue",
    owner: FINCRIME_OWNER,
    startDate: "2026-04-15",
    targetDate: "2026-09-30",
    currentRag: "red",
    escalation: "raised-to-committee",
    steps: [
      { label: "Align overdue cohort to KYC programme", state: "done", dueDate: "2026-05-15" },
      { label: "Clear overdue high-risk reviews", state: "in-progress", dueDate: "2026-08-31" },
      { label: "Independent overdue target confirmation", state: "not-started", dueDate: "2026-09-30" },
    ],
    lastUpdate: {
      text: "Overdue reviews tracked against the same KYC remediation programme; no independent target set.",
      at: "2026-07-01",
      source: "system",
    },
  }),
  // fincrime — AMBER
  "TM Alerts Closed in SLA": path({
    entityRef: "TM Alerts Closed in SLA",
    owner: FINCRIME_OWNER,
    startDate: "2026-06-01",
    targetDate: "2026-08-31",
    currentRag: "amber",
    escalation: "none",
    steps: [
      { label: "L1/L2 disposition capacity review", state: "in-progress", dueDate: "2026-07-31" },
      { label: "Confirm additional headcount", state: "not-started", dueDate: "2026-08-15" },
      { label: "SLA restored to ≥95%", state: "not-started", dueDate: "2026-08-31" },
    ],
    lastUpdate: {
      text: "L1/L2 disposition capacity review scheduled; no additional headcount confirmed yet.",
      at: "2026-07-05",
      source: "system",
    },
  }),
  "EDD Completed on Time": path({
    entityRef: "EDD Completed on Time",
    owner: FINCRIME_OWNER,
    startDate: "2026-06-01",
    targetDate: "2026-08-31",
    currentRag: "amber",
    escalation: "none",
    steps: [
      { label: "Reduce upstream KYC referral volume", state: "in-progress", dueDate: "2026-08-15" },
      { label: "EDD completion rate back to 98%", state: "not-started", dueDate: "2026-08-31" },
    ],
    lastUpdate: {
      text: "Marginal improvement expected once the KYC backlog programme reduces upstream referral volume.",
      at: "2026-07-01",
      source: "system",
    },
  }),
  // cyber — RED
  "Critical Vulnerabilities Open": path({
    entityRef: "Critical Vulnerabilities Open",
    owner: CYBER_OWNER,
    startDate: "2026-06-20",
    targetDate: "2026-07-18",
    currentRag: "red",
    escalation: "raised-to-board",
    steps: [
      { label: "Vendor patch into staging", state: "done", dueDate: "2026-07-02" },
      { label: "Phased production rollout", state: "in-progress", dueDate: "2026-07-18" },
      { label: "Post-rollout verification", state: "not-started", dueDate: "2026-07-25" },
    ],
    lastUpdate: {
      text: "Vendor patch in staging; production rollout phased across three windows.",
      at: "2026-07-08",
      source: "system",
    },
  }),
  "Mean Time to Patch (Critical)": path({
    entityRef: "Mean Time to Patch (Critical)",
    owner: CYBER_OWNER,
    startDate: "2026-06-20",
    targetDate: "2026-07-18",
    currentRag: "red",
    escalation: "raised-to-board",
    steps: [
      { label: "CTO rollout plan confirmed", state: "done", dueDate: "2026-07-05" },
      { label: "Hold 18-Jul closure window", state: "in-progress", dueDate: "2026-07-18" },
      { label: "MTTP back within appetite", state: "not-started", dueDate: "2026-07-31" },
    ],
    lastUpdate: {
      text: "CTO confirmed rollout plan holds the 18-Jul closure date on last sync.",
      at: "2026-07-10",
      source: "email",
    },
  }),
  // fincrime — sub-category level (Customer Due Diligence / Transaction Monitoring)
  "Customer Due Diligence (KYC)": path({
    entityRef: "Customer Due Diligence (KYC)",
    owner: FINCRIME_OWNER,
    startDate: "2026-04-15",
    targetDate: "2026-09-30",
    currentRag: "red",
    escalation: "raised-to-committee",
    steps: [
      { label: "Scope high-risk cohort remediation", state: "done", dueDate: "2026-05-01" },
      { label: "Recruit L2 analysts", state: "done", dueDate: "2026-06-30" },
      { label: "Work down high-risk backlog", state: "in-progress", dueDate: "2026-08-31" },
      { label: "Medium/low-risk tranche clearance", state: "not-started", dueDate: "2026-09-30" },
    ],
    lastUpdate: {
      text: "Recruited 6 L2 analysts; backlog down 220 w/w",
      at: "2026-07-12",
      source: "email",
    },
  }),
  "Transaction Monitoring": path({
    entityRef: "Transaction Monitoring",
    owner: FINCRIME_OWNER,
    startDate: "2026-06-01",
    targetDate: "2026-08-31",
    currentRag: "amber",
    escalation: "none",
    steps: [
      { label: "L1/L2 disposition capacity review", state: "in-progress", dueDate: "2026-07-31" },
      { label: "Confirm additional headcount", state: "not-started", dueDate: "2026-08-15" },
      { label: "SLA restored to ≥95%", state: "not-started", dueDate: "2026-08-31" },
    ],
    lastUpdate: {
      text: "L1/L2 disposition capacity review scheduled; no additional headcount confirmed yet.",
      at: "2026-07-05",
      source: "system",
    },
  }),
  // cyber — sub-category level
  "Vulnerability Management": path({
    entityRef: "Vulnerability Management",
    owner: CYBER_OWNER,
    startDate: "2026-06-20",
    targetDate: "2026-07-18",
    currentRag: "red",
    escalation: "raised-to-board",
    steps: [
      { label: "Vendor patch into staging", state: "done", dueDate: "2026-07-02" },
      { label: "Phased production rollout", state: "in-progress", dueDate: "2026-07-18" },
      { label: "Post-rollout verification", state: "not-started", dueDate: "2026-07-25" },
    ],
    lastUpdate: {
      text: "Vendor patch in staging; production rollout phased across three windows.",
      at: "2026-07-08",
      source: "system",
    },
  }),
  "Cyber Threat Intelligence": path({
    entityRef: "Cyber Threat Intelligence",
    owner: CYBER_OWNER,
    startDate: "2026-06-25",
    targetDate: "2026-07-31",
    currentRag: "amber",
    escalation: "none",
    steps: [
      { label: "SOC enhanced monitoring activated", state: "done", dueDate: "2026-07-01" },
      { label: "Hold monitoring through July", state: "in-progress", dueDate: "2026-07-31" },
      { label: "Return to BAU monitoring posture", state: "not-started", dueDate: "2026-08-15" },
    ],
    lastUpdate: {
      text: "SOC enhanced monitoring holding; no successful intrusion recorded since activation.",
      at: "2026-07-09",
      source: "system",
    },
  }),
  // fincrime — sub-category level (Fraud & Scams, CRO drill)
  "Fraud & Scams": path({
    entityRef: "Fraud & Scams",
    owner: FINCRIME_OWNER,
    startDate: "2026-06-01",
    targetDate: "2026-10-31",
    currentRag: "amber",
    escalation: "raised-to-committee",
    steps: [
      { label: "Draft scam-controls remediation plan", state: "done", dueDate: "2026-07-11" },
      { label: "Committee sign-off", state: "in-progress", dueDate: "2026-08-31" },
      { label: "Confirmation-of-payee coverage extension", state: "not-started", dueDate: "2026-09-30" },
      { label: "Outbound payment friction live", state: "not-started", dueDate: "2026-10-31" },
    ],
    lastUpdate: {
      text: "Scam-controls remediation plan drafted — confirmation-of-payee coverage extension and outbound payment friction for high-risk corridors; committee sign-off targeted next cycle.",
      at: "2026-07-11",
      source: "email",
    },
  }),

  // fincrime — fraud lens, APP reimbursement exposure
  "fraud:app": path({
    entityRef: "fraud:app",
    owner: FINCRIME_OWNER,
    startDate: "2026-06-01",
    targetDate: "2026-10-31",
    currentRag: "amber",
    escalation: "raised-to-committee",
    steps: [
      { label: "Draft scam-controls remediation plan", state: "done", dueDate: "2026-07-11" },
      { label: "Committee sign-off", state: "in-progress", dueDate: "2026-08-31" },
      { label: "Confirmation-of-payee coverage extension", state: "not-started", dueDate: "2026-09-30" },
      { label: "Outbound payment friction live", state: "not-started", dueDate: "2026-10-31" },
    ],
    lastUpdate: {
      text: "Scam-controls remediation plan drafted — confirmation-of-payee coverage extension and outbound payment friction for high-risk corridors; committee sign-off targeted next cycle.",
      at: "2026-07-11",
      source: "email",
    },
  }),

  // fincrime — exposure lens verdict (Block 1, when OVER appetite)
  "exposure:fincrime": path({
    entityRef: "exposure:fincrime",
    owner: FINCRIME_OWNER,
    startDate: "2026-06-15",
    targetDate: "2026-10-31",
    currentRag: "amber",
    escalation: "raised-to-committee",
    steps: [
      { label: "Draft de-risking plan for MENA / correspondent", state: "done", dueDate: "2026-07-09" },
      { label: "Committee sign-off", state: "in-progress", dueDate: "2026-08-31" },
      { label: "Execute Trade-finance / MENA exits", state: "not-started", dueDate: "2026-09-30" },
      { label: "High-risk weight back within appetite", state: "not-started", dueDate: "2026-10-31" },
    ],
    lastUpdate: {
      text: "De-risking plan drafted for the Trade-finance/MENA and Correspondent banking clusters; committee sign-off targeted next cycle.",
      at: "2026-07-09",
      source: "email",
    },
  }),

  // ─── Board signals (CRO Board View, runBoardDetectors) ────────────────────
  // Keyed by signal.crsaRef where the signal carries one (Precedent Match
  // cards), otherwise by signal.id — mirrors how BoardSignalCard and
  // SignalInvestigationDrawer derive entityRef (signal.crsaRef ?? signal.id).

  // Precedent Match — fincrime CRSA refs
  // Stalled at ~40%: scope done, interim in flight, L2 recruitment BLOCKED.
  "AML.01.05.02": path({
    entityRef: "AML.01.05.02",
    owner: FINCRIME_OWNER,
    startDate: "2026-05-01",
    targetDate: "2026-09-30",
    currentRag: "red",
    escalation: "raised-to-board",
    steps: [
      { label: "Scope control rebuild", state: "done", dueDate: "2026-05-20" },
      { label: "Interim manual review", state: "in-progress", dueDate: "2026-07-31" },
      { label: "Recruit L2 disposition team", state: "blocked", dueDate: "2026-08-15" },
      { label: "Automated control live", state: "not-started", dueDate: "2026-09-30" },
    ],
    lastUpdate: {
      text: "MLRO Reporting control rebuild scoped; interim manual review in place pending L2 capacity",
      at: "2026-07-14",
      source: "email",
    },
  }),
  "AML.01.06.01": path({
    entityRef: "AML.01.06.01",
    owner: FINCRIME_OWNER,
    startDate: "2026-05-15",
    targetDate: "2026-09-30",
    currentRag: "amber",
    escalation: "raised-to-committee",
    steps: [
      { label: "Open ratification review", state: "done", dueDate: "2026-06-01" },
      { label: "Run alongside KYC backlog programme", state: "in-progress", dueDate: "2026-08-31" },
      { label: "Board ratification of updated risk assessment", state: "not-started", dueDate: "2026-09-30" },
    ],
    lastUpdate: {
      text: "AML/CTF risk assessment ratification review in progress; run alongside the KYC backlog remediation programme.",
      at: "2026-07-07",
      source: "system",
    },
  }),
  "AML.01.08.01": path({
    entityRef: "AML.01.08.01",
    owner: FINCRIME_OWNER,
    startDate: "2026-05-15",
    targetDate: "2026-09-30",
    currentRag: "amber",
    escalation: "raised-to-committee",
    steps: [
      { label: "Fold into KYC backlog programme", state: "done", dueDate: "2026-06-01" },
      { label: "Re-identify high-risk relationships", state: "in-progress", dueDate: "2026-08-31" },
      { label: "Register refresh complete", state: "not-started", dueDate: "2026-09-30" },
    ],
    lastUpdate: {
      text: "High-risk relationship identification review folded into the KYC backlog remediation programme.",
      at: "2026-07-07",
      source: "system",
    },
  }),
  "SCTN.01.01.01": path({
    entityRef: "SCTN.01.01.01",
    owner: FINCRIME_OWNER,
    startDate: "2026-06-01",
    targetDate: "2026-08-31",
    currentRag: "amber",
    escalation: "raised-to-committee",
    steps: [
      { label: "Review screening mechanism vs precedent", state: "done", dueDate: "2026-06-20" },
      { label: "Enhanced monitoring rule change in testing", state: "in-progress", dueDate: "2026-08-15" },
      { label: "Rule change live in production", state: "not-started", dueDate: "2026-08-31" },
    ],
    lastUpdate: {
      text: "Sanctions screening control mechanism reviewed against the matched precedent; enhanced monitoring rule change in testing.",
      at: "2026-07-12",
      source: "email",
    },
  }),
  "ABC.01.01.01": path({
    entityRef: "ABC.01.01.01",
    owner: FINCRIME_OWNER,
    startDate: "2026-06-01",
    targetDate: "2026-09-30",
    currentRag: "amber",
    escalation: "raised-to-committee",
    steps: [
      { label: "Schedule bribery risk assessment refresh", state: "done", dueDate: "2026-06-15" },
      { label: "Refresh alongside FC risk-assessment cycle", state: "in-progress", dueDate: "2026-08-31" },
      { label: "Committee acceptance of refreshed assessment", state: "not-started", dueDate: "2026-09-30" },
    ],
    lastUpdate: {
      text: "Bribery risk assessment refresh scheduled alongside the wider financial-crime risk-assessment cycle.",
      at: "2026-07-07",
      source: "system",
    },
  }),

  // Green Without Evidence — evidence-pack request, not a control rebuild.
  "green-without-evidence-fincrime-sanctions-pep-screening": path({
    entityRef: "green-without-evidence-fincrime-sanctions-pep-screening",
    owner: FINCRIME_OWNER,
    startDate: "2026-06-15",
    targetDate: "2026-08-15",
    currentRag: "amber",
    escalation: "raised-to-committee",
    steps: [
      { label: "Request evidence pack from 1st line", state: "in-progress", dueDate: "2026-08-15" },
      { label: "Validate screening cadence", state: "not-started", dueDate: "2026-08-31" },
      { label: "Attach evidence to control", state: "not-started", dueDate: "2026-09-15" },
    ],
    lastUpdate: {
      text: "Evidence pack for sanctions screening cadence requested from 1st line; due 15 Aug",
      at: "2026-07-10",
      source: "email",
    },
  }),
  "green-without-evidence-conduct-consumer-duty": path({
    entityRef: "green-without-evidence-conduct-consumer-duty",
    owner: CONDUCT_OWNER,
    startDate: "2026-06-15",
    targetDate: "2026-08-15",
    currentRag: "amber",
    escalation: "raised-to-committee",
    steps: [
      { label: "Request fair-value evidence pack from 1st line", state: "in-progress", dueDate: "2026-08-15" },
      { label: "Validate Consumer Duty cadence", state: "not-started", dueDate: "2026-08-31" },
      { label: "Attach evidence to control", state: "not-started", dueDate: "2026-09-15" },
    ],
    lastUpdate: {
      text: "Evidence pack for the Consumer Duty fair-value assessment requested from 1st line; due 15 Aug",
      at: "2026-07-10",
      source: "email",
    },
  }),

  // Other board signal types
  "kri-breach-no-plan-fincrime": path({
    entityRef: "kri-breach-no-plan-fincrime",
    owner: FINCRIME_OWNER,
    startDate: "2026-06-20",
    targetDate: "2026-09-30",
    currentRag: "amber",
    escalation: "raised-to-committee",
    steps: [
      { label: "Complete high-risk cohort", state: "done", dueDate: "2026-07-01" },
      { label: "Scope medium/low-risk tranche plan", state: "in-progress", dueDate: "2026-08-15" },
      { label: "Committee accept remediation plan", state: "not-started", dueDate: "2026-09-30" },
    ],
    lastUpdate: {
      text: "Remediation plan for the medium/low-risk backlog tranche is being scoped following high-risk cohort completion.",
      at: "2026-07-11",
      source: "system",
    },
  }),
  "signed-not-evidenced-cyber": path({
    entityRef: "signed-not-evidenced-cyber",
    owner: CYBER_OWNER,
    startDate: "2026-07-01",
    targetDate: "2026-07-18",
    currentRag: "red",
    escalation: "raised-to-board",
    steps: [
      { label: "Closure pack signature confirmed", state: "done", dueDate: "2026-07-05" },
      { label: "Supporting artefact upload from InfoSec", state: "in-progress", dueDate: "2026-07-18" },
      { label: "Evidence bound to signed closure", state: "not-started", dueDate: "2026-07-25" },
    ],
    lastUpdate: {
      text: "Closure pack signature confirmed; supporting artefact upload pending from InfoSec.",
      at: "2026-07-09",
      source: "system",
    },
  }),
  "signed-not-evidenced-fincrime": path({
    entityRef: "signed-not-evidenced-fincrime",
    owner: FINCRIME_OWNER,
    startDate: "2026-06-20",
    targetDate: "2026-08-31",
    currentRag: "amber",
    escalation: "raised-to-committee",
    steps: [
      { label: "Signed attestation confirmed", state: "done", dueDate: "2026-07-01" },
      { label: "Request supporting evidence pack", state: "in-progress", dueDate: "2026-08-15" },
      { label: "Evidence bound to attestation", state: "not-started", dueDate: "2026-08-31" },
    ],
    lastUpdate: {
      text: "Signed attestation confirmed; supporting evidence pack requested from the attesting 1st-line owner.",
      at: "2026-07-10",
      source: "system",
    },
  }),
  "standing-status-cyber": path({
    entityRef: "standing-status-cyber",
    owner: CYBER_OWNER,
    startDate: "2026-06-20",
    targetDate: "2026-07-18",
    currentRag: "red",
    escalation: "raised-to-board",
    steps: [
      { label: "Join critical-vulnerability closure programme", state: "done", dueDate: "2026-07-01" },
      { label: "Hold shared 18-Jul target", state: "in-progress", dueDate: "2026-07-18" },
      { label: "Standing RED cleared on closure", state: "not-started", dueDate: "2026-07-25" },
    ],
    lastUpdate: {
      text: "Tracked jointly with the critical-vulnerability closure programme; same target date.",
      at: "2026-07-10",
      source: "system",
    },
  }),
  "tolerance-expiry-RA-FINCRIME-2025-004": path({
    entityRef: "tolerance-expiry-RA-FINCRIME-2025-004",
    owner: FINCRIME_OWNER,
    startDate: "2026-05-01",
    targetDate: "2026-09-30",
    currentRag: "amber",
    escalation: "raised-to-committee",
    steps: [
      { label: "Draft Banking Proposition Board re-approval paper", state: "done", dueDate: "2026-07-08" },
      { label: "Submit for September cycle", state: "in-progress", dueDate: "2026-09-15" },
      { label: "Re-approval or close the acceptance", state: "not-started", dueDate: "2026-09-30" },
    ],
    lastUpdate: {
      text: "Re-approval paper for the Banking Proposition Board drafted; submission targeted for the September cycle.",
      at: "2026-07-08",
      source: "email",
    },
  }),

  // Accountability Orphan — the finding IS the absence of an owner. Seeding a
  // fabricated owner would contradict the signal; the entry states the gap.
  "accountability-orphan-climate": path({
    entityRef: "accountability-orphan-climate",
    owner: UNOWNED,
    startDate: "2026-07-01",
    targetDate: null,
    currentRag: "amber",
    escalation: "none",
    steps: [
      { label: "Assign accountable owner", state: "blocked", dueDate: null },
      { label: "First-line remediation plan", state: "not-started", dueDate: null },
      { label: "Committee accept ownership map", state: "not-started", dueDate: null },
    ],
    lastUpdate: {
      text: "Awaiting first-line remediation plan; ownership not yet assigned.",
      at: "2026-07-10",
      source: "system",
    },
  }),
  "accountability-orphan-market": path({
    entityRef: "accountability-orphan-market",
    owner: UNOWNED,
    startDate: "2026-07-01",
    targetDate: null,
    currentRag: "amber",
    escalation: "none",
    steps: [
      { label: "Assign accountable owner", state: "blocked", dueDate: null },
      { label: "First-line remediation plan", state: "not-started", dueDate: null },
      { label: "Committee accept ownership map", state: "not-started", dueDate: null },
    ],
    lastUpdate: {
      text: "Awaiting first-line remediation plan; ownership not yet assigned.",
      at: "2026-07-10",
      source: "system",
    },
  }),
  "accountability-orphan-opsres": path({
    entityRef: "accountability-orphan-opsres",
    owner: UNOWNED,
    startDate: "2026-07-01",
    targetDate: null,
    currentRag: "amber",
    escalation: "none",
    steps: [
      { label: "Assign accountable owner", state: "blocked", dueDate: null },
      { label: "First-line remediation plan", state: "not-started", dueDate: null },
      { label: "Committee accept ownership map", state: "not-started", dueDate: null },
    ],
    lastUpdate: {
      text: "Awaiting first-line remediation plan; ownership not yet assigned.",
      at: "2026-07-10",
      source: "system",
    },
  }),
};

export function getPathToGreen(entityRef: string): PathToGreen | null {
  return PATH_TO_GREEN[entityRef] ?? null;
}

/** Test / inspector helper — every seeded path, ordered by entityRef. */
export function listPathToGreenEntries(): PathToGreen[] {
  return Object.values(PATH_TO_GREEN).sort((a, b) => a.entityRef.localeCompare(b.entityRef));
}
