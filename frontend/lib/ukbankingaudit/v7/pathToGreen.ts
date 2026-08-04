/**
 * v7 Path-to-Green — remediation plans with concurrent actions, or an explicit
 * risk-accept disposition. Seeded for fincrime / cyber / board-signal refs.
 * SYNTHETIC, deterministic.
 *
 * lastUpdate.source rides a SEPARATE axis from severity — never fold it into
 * RAG: "system" = STATED, "email" = INFERRED.
 *
 * progressPct (remediate only) is derived from actions:
 * (done + 0.5 × in-progress) / total. Blocked contributes 0.
 */

export type PathToGreenActionStatus =
  | "done"
  | "in-progress"
  | "blocked"
  | "not-started";

export type PathToGreenAction = {
  id: string;
  description: string;
  owner: string;
  targetDate: string | null;
  expectedEffect: string;
  status: PathToGreenActionStatus;
};

export type PathToGreenDisposition = "remediate" | "risk-accept";

/** Present when disposition is risk-accept. acceptedBy null = unresolved gap. */
export type PathToGreenRiskAccept = {
  acceptedBy: string | null;
  acceptedDate: string | null;
  rationale: string | null;
  reviewDate: string | null;
};

export type PathToGreen = {
  entityRef: string;
  /** Plan-level accountable owner (SMF where mapped). */
  owner: string;
  startDate: string;
  targetDate: string | null;
  progressPct: number;
  currentRag: "red" | "amber";
  targetRag: "green";
  escalation: "none" | "raised-to-committee" | "raised-to-board";
  disposition: PathToGreenDisposition;
  /** Combined expected effect of all actions against appetite — not per-action. */
  combinedExpectedEffect: string;
  /** Appetite / target line the combined effect is measured against. */
  appetiteLine: string;
  actions: PathToGreenAction[];
  riskAccept: PathToGreenRiskAccept | null;
  lastUpdate: { text: string; at: string; source: "system" | "email" } | null;
};

/** Honest progress from action statuses — blocked and not-started count as zero. */
function progressFromActions(actions: PathToGreenAction[]): number {
  if (actions.length === 0) return 0;
  const score = actions.reduce((acc, action) => {
    switch (action.status) {
      case "done":
        return acc + 1;
      case "in-progress":
        return acc + 0.5;
      case "blocked":
      case "not-started":
        return acc;
      default: {
        const _exhaustive: never = action.status;
        return _exhaustive;
      }
    }
  }, 0);
  return Math.round((score / actions.length) * 100);
}

type RemediateSeed = Omit<
  PathToGreen,
  "progressPct" | "targetRag" | "disposition" | "riskAccept"
> & { actions: PathToGreenAction[] };

function remediate(seed: RemediateSeed): PathToGreen {
  return {
    ...seed,
    targetRag: "green",
    disposition: "remediate",
    riskAccept: null,
    progressPct: progressFromActions(seed.actions),
  };
}

type RiskAcceptSeed = Omit<PathToGreen, "progressPct" | "targetRag" | "disposition"> & {
  riskAccept: PathToGreenRiskAccept;
};

function riskAccept(seed: RiskAcceptSeed): PathToGreen {
  return {
    ...seed,
    targetRag: "green",
    disposition: "risk-accept",
    progressPct: 0,
  };
}

const FINCRIME_OWNER = "SMF17 · D. Fairweather";
const CYBER_OWNER = "SMF24 · L. Marchetti";
const CONDUCT_OWNER = "SMF16 · P. Nwachukwu";
const UNOWNED = "UNOWNED — no accountable individual mapped";

const PATH_TO_GREEN: Record<string, PathToGreen> = {

  "KYC Periodic Review Backlog": remediate({
    entityRef: "KYC Periodic Review Backlog",
    owner: FINCRIME_OWNER,
    startDate: "2026-04-15",
    targetDate: "2026-09-30",
    currentRag: "red",
    escalation: "raised-to-committee",
    combinedExpectedEffect: "Four concurrent actions together clear the high-risk KYC backlog and restore periodic-review cadence within appetite.",
    appetiteLine: "KYC periodic reviews within SLA / GREEN — high-risk cohort first, then medium/low tranche",
    actions: [
      {
        id: "a1",
        description: "Scope high-risk cohort remediation",
        owner: FINCRIME_OWNER,
        targetDate: "2026-05-01",
        expectedEffect: "Contributes to plan: Scope high-risk cohort remediation",
        status: "done",
      },
      {
        id: "a2",
        description: "Recruit L2 analysts",
        owner: FINCRIME_OWNER,
        targetDate: "2026-06-30",
        expectedEffect: "Contributes to plan: Recruit L2 analysts",
        status: "done",
      },
      {
        id: "a3",
        description: "Work down high-risk backlog",
        owner: FINCRIME_OWNER,
        targetDate: "2026-08-31",
        expectedEffect: "Contributes to plan: Work down high-risk backlog",
        status: "in-progress",
      },
      {
        id: "a4",
        description: "Medium/low-risk tranche clearance",
        owner: FINCRIME_OWNER,
        targetDate: "2026-09-30",
        expectedEffect: "Contributes to plan: Medium/low-risk tranche clearance",
        status: "not-started",
      },
    ],
    lastUpdate: {
      text: "Recruited 6 L2 analysts; backlog down 220 w/w",
      at: "2026-07-12",
      source: "email",
    },
  }),

  "High-Risk Reviews Overdue": remediate({
    entityRef: "High-Risk Reviews Overdue",
    owner: FINCRIME_OWNER,
    startDate: "2026-04-15",
    targetDate: "2026-09-30",
    currentRag: "red",
    escalation: "raised-to-committee",
    combinedExpectedEffect: "Aligned programme actions together clear overdue high-risk reviews and confirm an independent target.",
    appetiteLine: "Zero overdue high-risk reviews / GREEN",
    actions: [
      {
        id: "a1",
        description: "Align overdue cohort to KYC programme",
        owner: FINCRIME_OWNER,
        targetDate: "2026-05-15",
        expectedEffect: "Contributes to plan: Align overdue cohort to KYC programme",
        status: "done",
      },
      {
        id: "a2",
        description: "Clear overdue high-risk reviews",
        owner: FINCRIME_OWNER,
        targetDate: "2026-08-31",
        expectedEffect: "Contributes to plan: Clear overdue high-risk reviews",
        status: "in-progress",
      },
      {
        id: "a3",
        description: "Independent overdue target confirmation",
        owner: FINCRIME_OWNER,
        targetDate: "2026-09-30",
        expectedEffect: "Contributes to plan: Independent overdue target confirmation",
        status: "not-started",
      },
    ],
    lastUpdate: {
      text: "Overdue reviews tracked against the same KYC remediation programme; no independent target set.",
      at: "2026-07-01",
      source: "system",
    },
  }),

  "TM Alerts Closed in SLA": remediate({
    entityRef: "TM Alerts Closed in SLA",
    owner: FINCRIME_OWNER,
    startDate: "2026-06-01",
    targetDate: "2026-08-31",
    currentRag: "amber",
    escalation: "none",
    combinedExpectedEffect: "Capacity review plus headcount together restore TM alert disposition SLA to ≥95%.",
    appetiteLine: "TM alerts closed in SLA ≥95% / GREEN",
    actions: [
      {
        id: "a1",
        description: "L1/L2 disposition capacity review",
        owner: FINCRIME_OWNER,
        targetDate: "2026-07-31",
        expectedEffect: "Contributes to plan: L1/L2 disposition capacity review",
        status: "in-progress",
      },
      {
        id: "a2",
        description: "Confirm additional headcount",
        owner: FINCRIME_OWNER,
        targetDate: "2026-08-15",
        expectedEffect: "Contributes to plan: Confirm additional headcount",
        status: "not-started",
      },
      {
        id: "a3",
        description: "SLA restored to ≥95%",
        owner: FINCRIME_OWNER,
        targetDate: "2026-08-31",
        expectedEffect: "Contributes to plan: SLA restored to ≥95%",
        status: "not-started",
      },
    ],
    lastUpdate: {
      text: "L1/L2 disposition capacity review scheduled; no additional headcount confirmed yet.",
      at: "2026-07-05",
      source: "system",
    },
  }),

  "EDD Completed on Time": riskAccept({
    entityRef: "EDD Completed on Time",
    owner: FINCRIME_OWNER,
    startDate: "2026-06-01",
    targetDate: "2026-08-31",
    currentRag: "amber",
    escalation: "none",
    combinedExpectedEffect: "Accepted residual EDD lag within board tolerance until upstream KYC volume falls — not a parallel remediation.",
    appetiteLine: "EDD completion ≥98% — accepted shortfall until review date",
    actions: [],
    riskAccept: {
      acceptedBy: "D. Fairweather (SMF17)",
      acceptedDate: "2026-07-08",
      rationale: "Upstream KYC referral volume is the driver; accepting short-cycle EDD lag avoids parallel remediation that would dilute L2 capacity.",
      reviewDate: "2026-08-31",
    },
    lastUpdate: {
      text: "Marginal improvement expected once the KYC backlog programme reduces upstream referral volume.",
      at: "2026-07-01",
      source: "system",
    },
  }),

  "Critical Vulnerabilities Open": remediate({
    entityRef: "Critical Vulnerabilities Open",
    owner: CYBER_OWNER,
    startDate: "2026-06-20",
    targetDate: "2026-07-18",
    currentRag: "red",
    escalation: "raised-to-board",
    combinedExpectedEffect: "Staging patch, phased rollout, and verification together close critical vulnerabilities within appetite.",
    appetiteLine: "Zero critical vulnerabilities open / GREEN",
    actions: [
      {
        id: "a1",
        description: "Vendor patch into staging",
        owner: CYBER_OWNER,
        targetDate: "2026-07-02",
        expectedEffect: "Contributes to plan: Vendor patch into staging",
        status: "done",
      },
      {
        id: "a2",
        description: "Phased production rollout",
        owner: CYBER_OWNER,
        targetDate: "2026-07-18",
        expectedEffect: "Contributes to plan: Phased production rollout",
        status: "in-progress",
      },
      {
        id: "a3",
        description: "Post-rollout verification",
        owner: CYBER_OWNER,
        targetDate: "2026-07-25",
        expectedEffect: "Contributes to plan: Post-rollout verification",
        status: "not-started",
      },
    ],
    lastUpdate: {
      text: "Vendor patch in staging; production rollout phased across three windows.",
      at: "2026-07-08",
      source: "system",
    },
  }),

  "Mean Time to Patch (Critical)": remediate({
    entityRef: "Mean Time to Patch (Critical)",
    owner: CYBER_OWNER,
    startDate: "2026-06-20",
    targetDate: "2026-07-18",
    currentRag: "red",
    escalation: "raised-to-board",
    combinedExpectedEffect: "Rollout plan and closure window together bring critical MTTP back within appetite.",
    appetiteLine: "Critical mean-time-to-patch within appetite / GREEN",
    actions: [
      {
        id: "a1",
        description: "CTO rollout plan confirmed",
        owner: CYBER_OWNER,
        targetDate: "2026-07-05",
        expectedEffect: "Contributes to plan: CTO rollout plan confirmed",
        status: "done",
      },
      {
        id: "a2",
        description: "Hold 18-Jul closure window",
        owner: CYBER_OWNER,
        targetDate: "2026-07-18",
        expectedEffect: "Contributes to plan: Hold 18-Jul closure window",
        status: "in-progress",
      },
      {
        id: "a3",
        description: "MTTP back within appetite",
        owner: CYBER_OWNER,
        targetDate: "2026-07-31",
        expectedEffect: "Contributes to plan: MTTP back within appetite",
        status: "not-started",
      },
    ],
    lastUpdate: {
      text: "CTO confirmed rollout plan holds the 18-Jul closure date on last sync.",
      at: "2026-07-10",
      source: "email",
    },
  }),

  "Customer Due Diligence (KYC)": remediate({
    entityRef: "Customer Due Diligence (KYC)",
    owner: FINCRIME_OWNER,
    startDate: "2026-04-15",
    targetDate: "2026-09-30",
    currentRag: "red",
    escalation: "raised-to-committee",
    combinedExpectedEffect: "Four concurrent actions together close the CDD/KYC gap against appetite.",
    appetiteLine: "CDD/KYC periodic review within appetite / GREEN",
    actions: [
      {
        id: "a1",
        description: "Scope high-risk cohort remediation",
        owner: FINCRIME_OWNER,
        targetDate: "2026-05-01",
        expectedEffect: "Contributes to plan: Scope high-risk cohort remediation",
        status: "done",
      },
      {
        id: "a2",
        description: "Recruit L2 analysts",
        owner: FINCRIME_OWNER,
        targetDate: "2026-06-30",
        expectedEffect: "Contributes to plan: Recruit L2 analysts",
        status: "done",
      },
      {
        id: "a3",
        description: "Work down high-risk backlog",
        owner: FINCRIME_OWNER,
        targetDate: "2026-08-31",
        expectedEffect: "Contributes to plan: Work down high-risk backlog",
        status: "in-progress",
      },
      {
        id: "a4",
        description: "Medium/low-risk tranche clearance",
        owner: FINCRIME_OWNER,
        targetDate: "2026-09-30",
        expectedEffect: "Contributes to plan: Medium/low-risk tranche clearance",
        status: "not-started",
      },
    ],
    lastUpdate: {
      text: "Recruited 6 L2 analysts; backlog down 220 w/w",
      at: "2026-07-12",
      source: "email",
    },
  }),

  "Transaction Monitoring": remediate({
    entityRef: "Transaction Monitoring",
    owner: FINCRIME_OWNER,
    startDate: "2026-06-01",
    targetDate: "2026-08-31",
    currentRag: "amber",
    escalation: "none",
    combinedExpectedEffect: "Capacity and headcount actions together restore TM SLA within appetite.",
    appetiteLine: "TM disposition SLA ≥95% / GREEN",
    actions: [
      {
        id: "a1",
        description: "L1/L2 disposition capacity review",
        owner: FINCRIME_OWNER,
        targetDate: "2026-07-31",
        expectedEffect: "Contributes to plan: L1/L2 disposition capacity review",
        status: "in-progress",
      },
      {
        id: "a2",
        description: "Confirm additional headcount",
        owner: FINCRIME_OWNER,
        targetDate: "2026-08-15",
        expectedEffect: "Contributes to plan: Confirm additional headcount",
        status: "not-started",
      },
      {
        id: "a3",
        description: "SLA restored to ≥95%",
        owner: FINCRIME_OWNER,
        targetDate: "2026-08-31",
        expectedEffect: "Contributes to plan: SLA restored to ≥95%",
        status: "not-started",
      },
    ],
    lastUpdate: {
      text: "L1/L2 disposition capacity review scheduled; no additional headcount confirmed yet.",
      at: "2026-07-05",
      source: "system",
    },
  }),

  "Vulnerability Management": remediate({
    entityRef: "Vulnerability Management",
    owner: CYBER_OWNER,
    startDate: "2026-06-20",
    targetDate: "2026-07-18",
    currentRag: "red",
    escalation: "raised-to-board",
    combinedExpectedEffect: "Patch rollout actions together clear the vulnerability-management RED.",
    appetiteLine: "Critical vulns closed / GREEN",
    actions: [
      {
        id: "a1",
        description: "Vendor patch into staging",
        owner: CYBER_OWNER,
        targetDate: "2026-07-02",
        expectedEffect: "Contributes to plan: Vendor patch into staging",
        status: "done",
      },
      {
        id: "a2",
        description: "Phased production rollout",
        owner: CYBER_OWNER,
        targetDate: "2026-07-18",
        expectedEffect: "Contributes to plan: Phased production rollout",
        status: "in-progress",
      },
      {
        id: "a3",
        description: "Post-rollout verification",
        owner: CYBER_OWNER,
        targetDate: "2026-07-25",
        expectedEffect: "Contributes to plan: Post-rollout verification",
        status: "not-started",
      },
    ],
    lastUpdate: {
      text: "Vendor patch in staging; production rollout phased across three windows.",
      at: "2026-07-08",
      source: "system",
    },
  }),

  "Cyber Threat Intelligence": remediate({
    entityRef: "Cyber Threat Intelligence",
    owner: CYBER_OWNER,
    startDate: "2026-06-25",
    targetDate: "2026-07-31",
    currentRag: "amber",
    escalation: "none",
    combinedExpectedEffect: "Enhanced monitoring held through July returns CTI posture to BAU within appetite.",
    appetiteLine: "CTI monitoring within appetite / GREEN",
    actions: [
      {
        id: "a1",
        description: "SOC enhanced monitoring activated",
        owner: CYBER_OWNER,
        targetDate: "2026-07-01",
        expectedEffect: "Contributes to plan: SOC enhanced monitoring activated",
        status: "done",
      },
      {
        id: "a2",
        description: "Hold monitoring through July",
        owner: CYBER_OWNER,
        targetDate: "2026-07-31",
        expectedEffect: "Contributes to plan: Hold monitoring through July",
        status: "in-progress",
      },
      {
        id: "a3",
        description: "Return to BAU monitoring posture",
        owner: CYBER_OWNER,
        targetDate: "2026-08-15",
        expectedEffect: "Contributes to plan: Return to BAU monitoring posture",
        status: "not-started",
      },
    ],
    lastUpdate: {
      text: "SOC enhanced monitoring holding; no successful intrusion recorded since activation.",
      at: "2026-07-09",
      source: "system",
    },
  }),

  "Fraud & Scams": remediate({
    entityRef: "Fraud & Scams",
    owner: FINCRIME_OWNER,
    startDate: "2026-06-01",
    targetDate: "2026-10-31",
    currentRag: "amber",
    escalation: "raised-to-committee",
    combinedExpectedEffect: "Scam-controls plan, CoP extension, and payment friction together bring fraud loss within appetite.",
    appetiteLine: "Fraud & scams exposure within appetite / GREEN",
    actions: [
      {
        id: "a1",
        description: "Draft scam-controls remediation plan",
        owner: FINCRIME_OWNER,
        targetDate: "2026-07-11",
        expectedEffect: "Contributes to plan: Draft scam-controls remediation plan",
        status: "done",
      },
      {
        id: "a2",
        description: "Committee sign-off",
        owner: FINCRIME_OWNER,
        targetDate: "2026-08-31",
        expectedEffect: "Contributes to plan: Committee sign-off",
        status: "in-progress",
      },
      {
        id: "a3",
        description: "Confirmation-of-payee coverage extension",
        owner: FINCRIME_OWNER,
        targetDate: "2026-09-30",
        expectedEffect: "Contributes to plan: Confirmation-of-payee coverage extension",
        status: "not-started",
      },
      {
        id: "a4",
        description: "Outbound payment friction live",
        owner: FINCRIME_OWNER,
        targetDate: "2026-10-31",
        expectedEffect: "Contributes to plan: Outbound payment friction live",
        status: "not-started",
      },
    ],
    lastUpdate: {
      text: "Scam-controls remediation plan drafted — confirmation-of-payee coverage extension and outbound payment friction for high-risk corridors; committee sign-off targeted next cycle.",
      at: "2026-07-11",
      source: "email",
    },
  }),

  "fraud:app": remediate({
    entityRef: "fraud:app",
    owner: FINCRIME_OWNER,
    startDate: "2026-06-01",
    targetDate: "2026-10-31",
    currentRag: "amber",
    escalation: "raised-to-committee",
    combinedExpectedEffect: "Scam-controls plan, CoP extension, and payment friction together reduce APP reimbursement exposure within appetite.",
    appetiteLine: "APP reimbursement exposure within appetite / GREEN",
    actions: [
      {
        id: "a1",
        description: "Draft scam-controls remediation plan",
        owner: FINCRIME_OWNER,
        targetDate: "2026-07-11",
        expectedEffect: "Contributes to plan: Draft scam-controls remediation plan",
        status: "done",
      },
      {
        id: "a2",
        description: "Committee sign-off",
        owner: FINCRIME_OWNER,
        targetDate: "2026-08-31",
        expectedEffect: "Contributes to plan: Committee sign-off",
        status: "in-progress",
      },
      {
        id: "a3",
        description: "Confirmation-of-payee coverage extension",
        owner: FINCRIME_OWNER,
        targetDate: "2026-09-30",
        expectedEffect: "Contributes to plan: Confirmation-of-payee coverage extension",
        status: "not-started",
      },
      {
        id: "a4",
        description: "Outbound payment friction live",
        owner: FINCRIME_OWNER,
        targetDate: "2026-10-31",
        expectedEffect: "Contributes to plan: Outbound payment friction live",
        status: "not-started",
      },
    ],
    lastUpdate: {
      text: "Scam-controls remediation plan drafted — confirmation-of-payee coverage extension and outbound payment friction for high-risk corridors; committee sign-off targeted next cycle.",
      at: "2026-07-11",
      source: "email",
    },
  }),

  "sar-timeliness": remediate({
    entityRef: "sar-timeliness",
    owner: FINCRIME_OWNER,
    startDate: "2026-06-01",
    targetDate: "2026-09-15",
    currentRag: "red",
    escalation: "raised-to-committee",
    combinedExpectedEffect:
      "Capacity restoration and FIU triage discipline together return SAR filings within the POCA s.330 thirty-day window.",
    appetiteLine: "SARs filed within statutory window ≥95% / GREEN",
    actions: [
      {
        id: "a1",
        description: "Map overdue SAR cohort to L2 capacity",
        owner: FINCRIME_OWNER,
        targetDate: "2026-07-15",
        expectedEffect: "Contributes to plan: Map overdue SAR cohort to L2 capacity",
        status: "done",
      },
      {
        id: "a2",
        description: "Clear aged SARs outside 30-day window",
        owner: FINCRIME_OWNER,
        targetDate: "2026-08-31",
        expectedEffect: "Contributes to plan: Clear aged SARs outside 30-day window",
        status: "in-progress",
      },
      {
        id: "a3",
        description: "Restore on-time filing to ≥95%",
        owner: FINCRIME_OWNER,
        targetDate: "2026-09-15",
        expectedEffect: "Contributes to plan: Restore on-time filing to ≥95%",
        status: "not-started",
      },
    ],
    lastUpdate: {
      text: "On-time filing at 63.3% and falling; L2 capacity plan in flight against the POCA s.330 window.",
      at: "2026-07-12",
      source: "system",
    },
  }),

  "exposure:fincrime": remediate({
    entityRef: "exposure:fincrime",
    owner: FINCRIME_OWNER,
    startDate: "2026-06-15",
    targetDate: "2026-10-31",
    currentRag: "amber",
    escalation: "raised-to-committee",
    combinedExpectedEffect: "De-risking exits and committee sign-off together bring fincrime high-risk weight within appetite.",
    appetiteLine: "Fincrime exposure weight within appetite / GREEN",
    actions: [
      {
        id: "a1",
        description: "Draft de-risking plan for MENA / correspondent",
        owner: FINCRIME_OWNER,
        targetDate: "2026-07-09",
        expectedEffect: "Contributes to plan: Draft de-risking plan for MENA / correspondent",
        status: "done",
      },
      {
        id: "a2",
        description: "Committee sign-off",
        owner: FINCRIME_OWNER,
        targetDate: "2026-08-31",
        expectedEffect: "Contributes to plan: Committee sign-off",
        status: "in-progress",
      },
      {
        id: "a3",
        description: "Execute Trade-finance / MENA exits",
        owner: FINCRIME_OWNER,
        targetDate: "2026-09-30",
        expectedEffect: "Contributes to plan: Execute Trade-finance / MENA exits",
        status: "not-started",
      },
      {
        id: "a4",
        description: "High-risk weight back within appetite",
        owner: FINCRIME_OWNER,
        targetDate: "2026-10-31",
        expectedEffect: "Contributes to plan: High-risk weight back within appetite",
        status: "not-started",
      },
    ],
    lastUpdate: {
      text: "De-risking plan drafted for the Trade-finance/MENA and Correspondent banking clusters; committee sign-off targeted next cycle.",
      at: "2026-07-09",
      source: "email",
    },
  }),

  "AML.01.05.02": remediate({
    entityRef: "AML.01.05.02",
    owner: FINCRIME_OWNER,
    startDate: "2026-05-01",
    targetDate: "2026-09-30",
    currentRag: "red",
    escalation: "raised-to-board",
    combinedExpectedEffect: "Control rebuild plus L2 capacity together close the MLRO reporting gap — currently stalled on blocked recruitment.",
    appetiteLine: "MLRO reporting control effective / GREEN",
    actions: [
      {
        id: "a1",
        description: "Scope control rebuild",
        owner: FINCRIME_OWNER,
        targetDate: "2026-05-20",
        expectedEffect: "Contributes to plan: Scope control rebuild",
        status: "done",
      },
      {
        id: "a2",
        description: "Interim manual review",
        owner: FINCRIME_OWNER,
        targetDate: "2026-07-31",
        expectedEffect: "Contributes to plan: Interim manual review",
        status: "in-progress",
      },
      {
        id: "a3",
        description: "Recruit L2 disposition team",
        owner: FINCRIME_OWNER,
        targetDate: "2026-08-15",
        expectedEffect: "Contributes to plan: Recruit L2 disposition team",
        status: "blocked",
      },
      {
        id: "a4",
        description: "Automated control live",
        owner: FINCRIME_OWNER,
        targetDate: "2026-09-30",
        expectedEffect: "Contributes to plan: Automated control live",
        status: "not-started",
      },
    ],
    lastUpdate: {
      text: "MLRO Reporting control rebuild scoped; interim manual review in place pending L2 capacity",
      at: "2026-07-14",
      source: "email",
    },
  }),

  "AML.01.06.01": remediate({
    entityRef: "AML.01.06.01",
    owner: FINCRIME_OWNER,
    startDate: "2026-05-15",
    targetDate: "2026-09-30",
    currentRag: "amber",
    escalation: "raised-to-committee",
    combinedExpectedEffect: "Ratification review run with KYC programme together restore board-ready AML/CTF risk assessment.",
    appetiteLine: "AML/CTF risk assessment ratified / GREEN",
    actions: [
      {
        id: "a1",
        description: "Open ratification review",
        owner: FINCRIME_OWNER,
        targetDate: "2026-06-01",
        expectedEffect: "Contributes to plan: Open ratification review",
        status: "done",
      },
      {
        id: "a2",
        description: "Run alongside KYC backlog programme",
        owner: FINCRIME_OWNER,
        targetDate: "2026-08-31",
        expectedEffect: "Contributes to plan: Run alongside KYC backlog programme",
        status: "in-progress",
      },
      {
        id: "a3",
        description: "Board ratification of updated risk assessment",
        owner: FINCRIME_OWNER,
        targetDate: "2026-09-30",
        expectedEffect: "Contributes to plan: Board ratification of updated risk assessment",
        status: "not-started",
      },
    ],
    lastUpdate: {
      text: "AML/CTF risk assessment ratification review in progress; run alongside the KYC backlog remediation programme.",
      at: "2026-07-07",
      source: "system",
    },
  }),

  "AML.01.08.01": remediate({
    entityRef: "AML.01.08.01",
    owner: FINCRIME_OWNER,
    startDate: "2026-05-15",
    targetDate: "2026-09-30",
    currentRag: "amber",
    escalation: "raised-to-committee",
    combinedExpectedEffect: "High-risk relationship re-identification folded into KYC programme restores register currency.",
    appetiteLine: "High-risk relationship register current / GREEN",
    actions: [
      {
        id: "a1",
        description: "Fold into KYC backlog programme",
        owner: FINCRIME_OWNER,
        targetDate: "2026-06-01",
        expectedEffect: "Contributes to plan: Fold into KYC backlog programme",
        status: "done",
      },
      {
        id: "a2",
        description: "Re-identify high-risk relationships",
        owner: FINCRIME_OWNER,
        targetDate: "2026-08-31",
        expectedEffect: "Contributes to plan: Re-identify high-risk relationships",
        status: "in-progress",
      },
      {
        id: "a3",
        description: "Register refresh complete",
        owner: FINCRIME_OWNER,
        targetDate: "2026-09-30",
        expectedEffect: "Contributes to plan: Register refresh complete",
        status: "not-started",
      },
    ],
    lastUpdate: {
      text: "High-risk relationship identification review folded into the KYC backlog remediation programme.",
      at: "2026-07-07",
      source: "system",
    },
  }),

  "SCTN.01.01.01": remediate({
    entityRef: "SCTN.01.01.01",
    owner: FINCRIME_OWNER,
    startDate: "2026-06-01",
    targetDate: "2026-08-31",
    currentRag: "amber",
    escalation: "raised-to-committee",
    combinedExpectedEffect: "Enhanced monitoring rule change together closes the sanctions-screening precedent gap.",
    appetiteLine: "Sanctions screening control effective / GREEN",
    actions: [
      {
        id: "a1",
        description: "Review screening mechanism vs precedent",
        owner: FINCRIME_OWNER,
        targetDate: "2026-06-20",
        expectedEffect: "Contributes to plan: Review screening mechanism vs precedent",
        status: "done",
      },
      {
        id: "a2",
        description: "Enhanced monitoring rule change in testing",
        owner: FINCRIME_OWNER,
        targetDate: "2026-08-15",
        expectedEffect: "Contributes to plan: Enhanced monitoring rule change in testing",
        status: "in-progress",
      },
      {
        id: "a3",
        description: "Rule change live in production",
        owner: FINCRIME_OWNER,
        targetDate: "2026-08-31",
        expectedEffect: "Contributes to plan: Rule change live in production",
        status: "not-started",
      },
    ],
    lastUpdate: {
      text: "Sanctions screening control mechanism reviewed against the matched precedent; enhanced monitoring rule change in testing.",
      at: "2026-07-12",
      source: "email",
    },
  }),

  "ABC.01.01.01": remediate({
    entityRef: "ABC.01.01.01",
    owner: FINCRIME_OWNER,
    startDate: "2026-06-01",
    targetDate: "2026-09-30",
    currentRag: "amber",
    escalation: "raised-to-committee",
    combinedExpectedEffect: "Bribery risk assessment refresh alongside FC cycle restores ABC assessment currency.",
    appetiteLine: "ABC risk assessment current / GREEN",
    actions: [
      {
        id: "a1",
        description: "Schedule bribery risk assessment refresh",
        owner: FINCRIME_OWNER,
        targetDate: "2026-06-15",
        expectedEffect: "Contributes to plan: Schedule bribery risk assessment refresh",
        status: "done",
      },
      {
        id: "a2",
        description: "Refresh alongside FC risk-assessment cycle",
        owner: FINCRIME_OWNER,
        targetDate: "2026-08-31",
        expectedEffect: "Contributes to plan: Refresh alongside FC risk-assessment cycle",
        status: "in-progress",
      },
      {
        id: "a3",
        description: "Committee acceptance of refreshed assessment",
        owner: FINCRIME_OWNER,
        targetDate: "2026-09-30",
        expectedEffect: "Contributes to plan: Committee acceptance of refreshed assessment",
        status: "not-started",
      },
    ],
    lastUpdate: {
      text: "Bribery risk assessment refresh scheduled alongside the wider financial-crime risk-assessment cycle.",
      at: "2026-07-07",
      source: "system",
    },
  }),

  "green-without-evidence-fincrime-sanctions-pep-screening": remediate({
    entityRef: "green-without-evidence-fincrime-sanctions-pep-screening",
    owner: FINCRIME_OWNER,
    startDate: "2026-06-15",
    targetDate: "2026-08-15",
    currentRag: "amber",
    escalation: "raised-to-committee",
    combinedExpectedEffect: "Evidence pack request and attachment together remove the green-without-evidence finding.",
    appetiteLine: "Sanctions screening evidenced / GREEN",
    actions: [
      {
        id: "a1",
        description: "Request evidence pack from 1st line",
        owner: FINCRIME_OWNER,
        targetDate: "2026-08-15",
        expectedEffect: "Contributes to plan: Request evidence pack from 1st line",
        status: "in-progress",
      },
      {
        id: "a2",
        description: "Validate screening cadence",
        owner: FINCRIME_OWNER,
        targetDate: "2026-08-31",
        expectedEffect: "Contributes to plan: Validate screening cadence",
        status: "not-started",
      },
      {
        id: "a3",
        description: "Attach evidence to control",
        owner: FINCRIME_OWNER,
        targetDate: "2026-09-15",
        expectedEffect: "Contributes to plan: Attach evidence to control",
        status: "not-started",
      },
    ],
    lastUpdate: {
      text: "Evidence pack for sanctions screening cadence requested from 1st line; due 15 Aug",
      at: "2026-07-10",
      source: "email",
    },
  }),

  "green-without-evidence-conduct-consumer-duty": remediate({
    entityRef: "green-without-evidence-conduct-consumer-duty",
    owner: CONDUCT_OWNER,
    startDate: "2026-06-15",
    targetDate: "2026-08-15",
    currentRag: "amber",
    escalation: "raised-to-committee",
    combinedExpectedEffect: "Fair-value evidence pack and attachment together remove the green-without-evidence finding.",
    appetiteLine: "Consumer Duty fair-value evidenced / GREEN",
    actions: [
      {
        id: "a1",
        description: "Request fair-value evidence pack from 1st line",
        owner: CONDUCT_OWNER,
        targetDate: "2026-08-15",
        expectedEffect: "Contributes to plan: Request fair-value evidence pack from 1st line",
        status: "in-progress",
      },
      {
        id: "a2",
        description: "Validate Consumer Duty cadence",
        owner: CONDUCT_OWNER,
        targetDate: "2026-08-31",
        expectedEffect: "Contributes to plan: Validate Consumer Duty cadence",
        status: "not-started",
      },
      {
        id: "a3",
        description: "Attach evidence to control",
        owner: CONDUCT_OWNER,
        targetDate: "2026-09-15",
        expectedEffect: "Contributes to plan: Attach evidence to control",
        status: "not-started",
      },
    ],
    lastUpdate: {
      text: "Evidence pack for the Consumer Duty fair-value assessment requested from 1st line; due 15 Aug",
      at: "2026-07-10",
      source: "email",
    },
  }),

  "kri-breach-no-plan-fincrime": remediate({
    entityRef: "kri-breach-no-plan-fincrime",
    owner: FINCRIME_OWNER,
    startDate: "2026-06-20",
    targetDate: "2026-09-30",
    currentRag: "amber",
    escalation: "raised-to-committee",
    combinedExpectedEffect: "Medium/low-risk tranche plan and committee acceptance together close the KRI-breach-without-plan gap.",
    appetiteLine: "KYC backlog remediation plan complete / GREEN",
    actions: [
      {
        id: "a1",
        description: "Complete high-risk cohort",
        owner: FINCRIME_OWNER,
        targetDate: "2026-07-01",
        expectedEffect: "Contributes to plan: Complete high-risk cohort",
        status: "done",
      },
      {
        id: "a2",
        description: "Scope medium/low-risk tranche plan",
        owner: FINCRIME_OWNER,
        targetDate: "2026-08-15",
        expectedEffect: "Contributes to plan: Scope medium/low-risk tranche plan",
        status: "in-progress",
      },
      {
        id: "a3",
        description: "Committee accept remediation plan",
        owner: FINCRIME_OWNER,
        targetDate: "2026-09-30",
        expectedEffect: "Contributes to plan: Committee accept remediation plan",
        status: "not-started",
      },
    ],
    lastUpdate: {
      text: "Remediation plan for the medium/low-risk backlog tranche is being scoped following high-risk cohort completion.",
      at: "2026-07-11",
      source: "system",
    },
  }),

  "signed-not-evidenced-cyber": remediate({
    entityRef: "signed-not-evidenced-cyber",
    owner: CYBER_OWNER,
    startDate: "2026-07-01",
    targetDate: "2026-07-18",
    currentRag: "red",
    escalation: "raised-to-board",
    combinedExpectedEffect: "Artefact upload bound to signed closure removes the signed-not-evidenced gap.",
    appetiteLine: "Cyber closure pack evidenced / GREEN",
    actions: [
      {
        id: "a1",
        description: "Closure pack signature confirmed",
        owner: CYBER_OWNER,
        targetDate: "2026-07-05",
        expectedEffect: "Contributes to plan: Closure pack signature confirmed",
        status: "done",
      },
      {
        id: "a2",
        description: "Supporting artefact upload from InfoSec",
        owner: CYBER_OWNER,
        targetDate: "2026-07-18",
        expectedEffect: "Contributes to plan: Supporting artefact upload from InfoSec",
        status: "in-progress",
      },
      {
        id: "a3",
        description: "Evidence bound to signed closure",
        owner: CYBER_OWNER,
        targetDate: "2026-07-25",
        expectedEffect: "Contributes to plan: Evidence bound to signed closure",
        status: "not-started",
      },
    ],
    lastUpdate: {
      text: "Closure pack signature confirmed; supporting artefact upload pending from InfoSec.",
      at: "2026-07-09",
      source: "system",
    },
  }),

  "signed-not-evidenced-fincrime": remediate({
    entityRef: "signed-not-evidenced-fincrime",
    owner: FINCRIME_OWNER,
    startDate: "2026-06-20",
    targetDate: "2026-08-31",
    currentRag: "amber",
    escalation: "raised-to-committee",
    combinedExpectedEffect: "Evidence pack bound to attestation removes the signed-not-evidenced gap.",
    appetiteLine: "Fincrime attestation evidenced / GREEN",
    actions: [
      {
        id: "a1",
        description: "Signed attestation confirmed",
        owner: FINCRIME_OWNER,
        targetDate: "2026-07-01",
        expectedEffect: "Contributes to plan: Signed attestation confirmed",
        status: "done",
      },
      {
        id: "a2",
        description: "Request supporting evidence pack",
        owner: FINCRIME_OWNER,
        targetDate: "2026-08-15",
        expectedEffect: "Contributes to plan: Request supporting evidence pack",
        status: "in-progress",
      },
      {
        id: "a3",
        description: "Evidence bound to attestation",
        owner: FINCRIME_OWNER,
        targetDate: "2026-08-31",
        expectedEffect: "Contributes to plan: Evidence bound to attestation",
        status: "not-started",
      },
    ],
    lastUpdate: {
      text: "Signed attestation confirmed; supporting evidence pack requested from the attesting 1st-line owner.",
      at: "2026-07-10",
      source: "system",
    },
  }),

  "standing-status-cyber": remediate({
    entityRef: "standing-status-cyber",
    owner: CYBER_OWNER,
    startDate: "2026-06-20",
    targetDate: "2026-07-18",
    currentRag: "red",
    escalation: "raised-to-board",
    combinedExpectedEffect: "Shared critical-vulnerability programme together clears the standing RED.",
    appetiteLine: "Standing cyber RED cleared / GREEN",
    actions: [
      {
        id: "a1",
        description: "Join critical-vulnerability closure programme",
        owner: CYBER_OWNER,
        targetDate: "2026-07-01",
        expectedEffect: "Contributes to plan: Join critical-vulnerability closure programme",
        status: "done",
      },
      {
        id: "a2",
        description: "Hold shared 18-Jul target",
        owner: CYBER_OWNER,
        targetDate: "2026-07-18",
        expectedEffect: "Contributes to plan: Hold shared 18-Jul target",
        status: "in-progress",
      },
      {
        id: "a3",
        description: "Standing RED cleared on closure",
        owner: CYBER_OWNER,
        targetDate: "2026-07-25",
        expectedEffect: "Contributes to plan: Standing RED cleared on closure",
        status: "not-started",
      },
    ],
    lastUpdate: {
      text: "Tracked jointly with the critical-vulnerability closure programme; same target date.",
      at: "2026-07-10",
      source: "system",
    },
  }),

  "tolerance-expiry-RA-FINCRIME-2025-004": remediate({
    entityRef: "tolerance-expiry-RA-FINCRIME-2025-004",
    owner: FINCRIME_OWNER,
    startDate: "2026-05-01",
    targetDate: "2026-09-30",
    currentRag: "amber",
    escalation: "raised-to-committee",
    combinedExpectedEffect: "Board re-approval paper and September cycle together renew or close the risk acceptance.",
    appetiteLine: "Risk acceptance current or closed / GREEN",
    actions: [
      {
        id: "a1",
        description: "Draft Banking Proposition Board re-approval paper",
        owner: FINCRIME_OWNER,
        targetDate: "2026-07-08",
        expectedEffect: "Contributes to plan: Draft Banking Proposition Board re-approval paper",
        status: "done",
      },
      {
        id: "a2",
        description: "Submit for September cycle",
        owner: FINCRIME_OWNER,
        targetDate: "2026-09-15",
        expectedEffect: "Contributes to plan: Submit for September cycle",
        status: "in-progress",
      },
      {
        id: "a3",
        description: "Re-approval or close the acceptance",
        owner: FINCRIME_OWNER,
        targetDate: "2026-09-30",
        expectedEffect: "Contributes to plan: Re-approval or close the acceptance",
        status: "not-started",
      },
    ],
    lastUpdate: {
      text: "Re-approval paper for the Banking Proposition Board drafted; submission targeted for the September cycle.",
      at: "2026-07-08",
      source: "email",
    },
  }),

  "accountability-orphan-climate": riskAccept({
    entityRef: "accountability-orphan-climate",
    owner: UNOWNED,
    startDate: "2026-07-01",
    targetDate: null,
    currentRag: "amber",
    escalation: "none",
    combinedExpectedEffect: "Risk-accept recorded without a named accepter — defect, not an acceptance.",
    appetiteLine: "Prescribed responsibility must be allocated before acceptance is valid",
    actions: [],
    riskAccept: {
      acceptedBy: null,
      acceptedDate: "2026-07-10",
      rationale: "Interim acceptance pending ownership map",
      reviewDate: "2026-09-30",
    },
    lastUpdate: {
      text: "Awaiting first-line remediation plan; ownership not yet assigned.",
      at: "2026-07-10",
      source: "system",
    },
  }),

  "accountability-orphan-market": riskAccept({
    entityRef: "accountability-orphan-market",
    owner: UNOWNED,
    startDate: "2026-07-01",
    targetDate: null,
    currentRag: "amber",
    escalation: "none",
    combinedExpectedEffect: "Risk-accept recorded without a named accepter — defect, not an acceptance.",
    appetiteLine: "Prescribed responsibility must be allocated before acceptance is valid",
    actions: [],
    riskAccept: {
      acceptedBy: null,
      acceptedDate: "2026-07-10",
      rationale: "Interim acceptance pending ownership map",
      reviewDate: "2026-09-30",
    },
    lastUpdate: {
      text: "Awaiting first-line remediation plan; ownership not yet assigned.",
      at: "2026-07-10",
      source: "system",
    },
  }),

  "accountability-orphan-opsres": riskAccept({
    entityRef: "accountability-orphan-opsres",
    owner: UNOWNED,
    startDate: "2026-07-01",
    targetDate: null,
    currentRag: "amber",
    escalation: "none",
    combinedExpectedEffect: "Risk-accept recorded without a named accepter — defect, not an acceptance.",
    appetiteLine: "Prescribed responsibility must be allocated before acceptance is valid",
    actions: [],
    riskAccept: {
      acceptedBy: null,
      acceptedDate: "2026-07-10",
      rationale: "Interim acceptance pending ownership map",
      reviewDate: "2026-09-30",
    },
    lastUpdate: {
      text: "Awaiting first-line remediation plan; ownership not yet assigned.",
      at: "2026-07-10",
      source: "system",
    },
  }),

  /** Unbackfilled TM outage — coverage gap with a date; no named acceptance = gap. */
  "tm-system-health": riskAccept({
    entityRef: "tm-system-health",
    owner: FINCRIME_OWNER,
    startDate: "2026-06-22",
    targetDate: null,
    currentRag: "red",
    escalation: "raised-to-committee",
    combinedExpectedEffect: "Unbackfilled TM outage has no remediation plan and no named risk acceptance — unresolved coverage gap.",
    appetiteLine: "Zero unbackfilled TM outages / GREEN",
    actions: [],
    riskAccept: {
      acceptedBy: null,
      acceptedDate: null,
      rationale: "375-minute TM outage on 2026-06-22 left ~1,840 alerts unscored; backfill not completed and no acceptance recorded.",
      reviewDate: null,
    },
    lastUpdate: {
      text: "ESC-TM-2026-0611 open; backfill job not scheduled.",
      at: "2026-07-05",
      source: "system",
    },
  }),

  "txn-screening-system-health": remediate({
    entityRef: "txn-screening-system-health",
    owner: FINCRIME_OWNER,
    startDate: "2026-06-28",
    targetDate: "2026-08-15",
    currentRag: "amber",
    escalation: "none",
    combinedExpectedEffect: "BIC/IBAN normalisation patch restores SEPA instant secondary-field match coverage.",
    appetiteLine: "Transaction screening DQ issues closed / GREEN",
    actions: [
      {
        id: "a1",
        description: "Patch BIC/IBAN normalisation on SEPA instant rails",
        owner: FINCRIME_OWNER,
        targetDate: "2026-07-31",
        expectedEffect: "Contributes to plan: Patch BIC/IBAN normalisation on SEPA instant rails",
        status: "in-progress",
      },
      {
        id: "a2",
        description: "Re-screen catch-up cohort from outage windows",
        owner: FINCRIME_OWNER,
        targetDate: "2026-08-15",
        expectedEffect: "Contributes to plan: Re-screen catch-up cohort from outage windows",
        status: "not-started",
      },
    ],
    lastUpdate: {
      text: "Outages backfilled; TXN-DQ-2026-007 still open pending patch.",
      at: "2026-07-08",
      source: "system",
    },
  }),

  /** Name screening unbackfilled outage — gap until backfill or named acceptance. */
  "name-screening-system-health": riskAccept({
    entityRef: "name-screening-system-health",
    owner: FINCRIME_OWNER,
    startDate: "2026-07-02",
    targetDate: null,
    currentRag: "red",
    escalation: "raised-to-committee",
    combinedExpectedEffect: "Unbackfilled name-screening outage with open adverse-media DQ — no named acceptance recorded.",
    appetiteLine: "Zero unbackfilled name-screening outages / GREEN",
    actions: [],
    riskAccept: {
      acceptedBy: null,
      acceptedDate: null,
      rationale: "90-minute name-screening outage on 2026-07-02; 312 onboarding screens missed and not backfilled.",
      reviewDate: null,
    },
    lastUpdate: {
      text: "ESC-NSC-2026-0092 open; NAME-DQ-2026-011 still open.",
      at: "2026-07-06",
      source: "email",
    },
  }),

  /** AML training — overdue above firm appetite; firm-wide % stays the pack figure (98.4%). */
  "AML.01.12.01": remediate({
    entityRef: "AML.01.12.01",
    owner: FINCRIME_OWNER,
    startDate: "2026-06-01",
    targetDate: "2026-09-30",
    currentRag: "amber",
    escalation: "none",
    combinedExpectedEffect: "Chase overdue cohort with high-risk roles first, then clear residual firm-wide overdue within appetite.",
    appetiteLine: "FC training overdue ≤1.0% of population (configurable) / GREEN",
    actions: [
      {
        id: "a1",
        description: "Prioritise high-risk-role overdue (ABC.01.03.01 cohort)",
        owner: FINCRIME_OWNER,
        targetDate: "2026-07-31",
        expectedEffect: "Contributes to plan: Prioritise high-risk-role overdue (ABC.01.03.01 cohort)",
        status: "in-progress",
      },
      {
        id: "a2",
        description: "LMS escalation notices to line managers",
        owner: FINCRIME_OWNER,
        targetDate: "2026-08-15",
        expectedEffect: "Contributes to plan: LMS escalation notices to line managers",
        status: "not-started",
      },
      {
        id: "a3",
        description: "Clear residual overdue to ≤1.0% appetite",
        owner: FINCRIME_OWNER,
        targetDate: "2026-09-30",
        expectedEffect: "Contributes to plan: Clear residual overdue to ≤1.0% appetite",
        status: "not-started",
      },
    ],
    lastUpdate: {
      text: "Firm-wide attestation 98.4% (AP-MLRO-2025 §5.1); overdue concentrated in high-risk roles.",
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

/** True when a risk-accept is missing a named accepter — treat as unresolved gap. */
export function isRiskAcceptGap(path: PathToGreen): boolean {
  return path.disposition === "risk-accept" && !(path.riskAccept?.acceptedBy);
}
