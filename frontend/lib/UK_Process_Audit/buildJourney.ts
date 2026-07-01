import {
  ENTITY_BY_DOMAIN,
  JOURNEY_TITLE_BY_DOMAIN,
  SEGMENTS_BY_DOMAIN,
  TEAM_BY_DOMAIN,
} from "./journeyConfig";
import type {
  UkAuditControl,
  UkCaseOverall,
  UkCaseTrailItem,
  UkControlResult,
  UkDomainSop,
  UkJourneyCase,
  UkProcessAuditDomainId,
  UkSopStageDef,
  UkStageOwner,
  UkSubmitter,
  UkTrailStatus,
} from "./types";

// --- deterministic helpers -------------------------------------------------

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T>(rng: () => number, arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];
const randInt = (rng: () => number, min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min;

// --- name pools ------------------------------------------------------------

const FIRST_NAMES = [
  "James", "Olivia", "Mohammed", "Sophie", "Aisha", "Daniel", "Priya", "Thomas",
  "Grace", "Liam", "Charlotte", "Raj", "Emily", "Oliver", "Hannah", "George",
  "Fatima", "Jack", "Ella", "Nathan", "Amara", "Ruth", "Callum", "Zara",
];
const LAST_NAMES = [
  "Clarke", "Patel", "Robinson", "Wright", "Hughes", "Bennett", "Khan", "Thompson",
  "Walsh", "Fletcher", "Owusu", "Marsh", "Kaur", "Doyle", "Sinclair", "Adeyemi",
  "Booth", "Fraser", "Pearce", "Ellison", "Nkemdirim", "Baxter",
];
const COMPANIES = [
  "Northfield Joinery Ltd", "Brightwave Media Ltd", "Pennine Logistics Ltd",
  "Harbour & Co Trading Ltd", "Kestrel Renewables Ltd", "Aldgate Consulting LLP",
  "Meridian Foods Ltd", "Sundial Care Group Ltd", "Cotswold Textiles Ltd",
  "Riverside Plant Hire Ltd",
];
const PAYEES = [
  "Vantage Utilities Ltd", "H. Robinson", "Crestline Property Mgmt", "SwiftCart Retail",
  "Orion Insurance plc", "M. Patel", "Bluewater Estates", "Nexa Digital Ltd",
];

const MONTHS = ["Feb", "Mar", "Apr", "May", "Jun"];

function personName(rng: () => number): string {
  return `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`;
}

function submitterFor(seed: string): UkSubmitter {
  const rng = makeRng(hashString(seed));
  const name = personName(rng);
  const empId = `EMP-${randInt(rng, 10000, 99999)}`;
  return { name, empId };
}

function dateLabel(rng: () => number): string {
  return `${randInt(rng, 1, 28)} ${pick(rng, MONTHS)} 2026`;
}

// --- SOP construction ------------------------------------------------------

const SOP_PURPOSE: Record<UkProcessAuditDomainId, string> = {
  ONB: "End-to-end customer onboarding — intake, CDD, screening, risk-rating, approval, activation and lifecycle maintenance under MLR 2017 and Consumer Duty.",
  DEP: "Deposit and account servicing lifecycle — setup, opening, servicing, dormancy, depositor protection (SCV/FSCS) and closure under BCOBS and the PRA Rulebook.",
  PAY: "Payment lifecycle — initiation, SCA & screening, Confirmation of Payee, clearing, settlement, reconciliation and reporting under the PSRs and scheme rules.",
  LEN: "Lending origination — application, affordability, credit grading, collateral, sanction, documentation and drawdown under CONC / MCOB and PRA credit-risk rules.",
  COL: "Collections & recoveries — arrears identification, forbearance, litigation, write-off and IFRS 9 impairment under CONC 7 / MCOB 13.",
  FC: "Financial-crime framework — risk assessment, screening, transaction monitoring, sanctions, SAR escalation and governance under MLR 2017, SAMLA and POCA.",
  FRD: "Fraud & scams lifecycle — detection, intervention, APP reimbursement, mule controls and MI under the PSR reimbursement regime and Consumer Duty.",
  CMP: "Complaint handling — capture, investigation, redress, final response and FOS referral under DISP and Consumer Duty.",
};

function buildStageOwner(control: UkAuditControl, domainId: UkProcessAuditDomainId): UkStageOwner {
  return {
    role: control.controlOwnerRole,
    team: TEAM_BY_DOMAIN[domainId],
    submits: `${control.evidenceType} from ${control.evidenceSourceSystem}`,
  };
}

export function buildSop(
  domainId: UkProcessAuditDomainId,
  domainLabel: string,
  controls: UkAuditControl[],
): UkDomainSop {
  const stages: UkSopStageDef[] = controls.map((c) => ({
    id: `${domainId}-S${c.stepNo}`,
    no: c.stepNo,
    name: c.sopStep,
    description: c.riskStatement,
    header: String(c.stepNo),
    owner: buildStageOwner(c, domainId),
    controlIds: [c.controlId],
  }));

  return {
    name: `${domainLabel} — standard operating procedure`,
    purpose: SOP_PURPOSE[domainId],
    stages,
  };
}

// --- exception labels ------------------------------------------------------

export function buildControlExceptionLabel(control: UkAuditControl): string {
  const stripped = control.riskStatement.replace(/^Failure to\s+/i, "");
  const words = stripped.split(/\s+/).slice(0, 6).join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

// --- case (journey) construction ------------------------------------------

function subjectFor(
  domainId: UkProcessAuditDomainId,
  segment: string,
  rng: () => number,
): string {
  const isEntity = /SME|Commercial|Business|term-loan|Overdraft/.test(segment);
  if (domainId === "PAY") {
    return `£${(randInt(rng, 5, 480) * 100).toLocaleString("en-GB")} → ${pick(rng, PAYEES)}`;
  }
  if (isEntity && (domainId === "ONB" || domainId === "LEN" || domainId === "DEP" || domainId === "COL")) {
    return pick(rng, COMPANIES);
  }
  return personName(rng);
}

function evidenceItemsFor(control: UkAuditControl, rng: () => number) {
  const extMap: Record<string, string> = {
    "Screenshot/Configuration Extract": "PNG",
    "Exception Report": "XLSX",
    "System Log/Export": "CSV",
    "Sign-off/Attestation Memo": "PDF",
    "Reconciliation Statement": "XLSX",
    "Policy Document + Version History": "PDF",
    "Sample Testing Output": "XLSX",
    "Regulatory Filing Copy": "PDF",
    "Board/Committee Minute Extract": "PDF",
    "Third-Party Certificate/Attestation": "PDF",
  };
  const ext = extMap[control.evidenceType] ?? "PDF";
  const count = randInt(rng, 1, 2);
  return Array.from({ length: count }).map((_, i) => ({
    name: `${control.controlId}_${control.evidenceType.split("/")[0].replace(/\s+/g, "_")}_${i + 1}.${ext.toLowerCase()}`,
    type: ext,
  }));
}

function buildTrail(
  caseId: string,
  domainId: UkProcessAuditDomainId,
  stages: UkSopStageDef[],
  controlsById: Record<string, UkAuditControl>,
): { trail: UkCaseTrailItem[]; overall: UkCaseOverall; failControlId: string | null } {
  const rng = makeRng(hashString(`${caseId}:trail`));
  const roll = rng();

  // Prefer to break at a genuinely risky stage for realism.
  const riskyIdx = stages
    .map((s, i) => ({ i, c: controlsById[s.controlIds[0]] }))
    .filter((x) => x.c && (x.c.violations > 0 || x.c.residualRisk === "Critical" || x.c.residualRisk === "High"))
    .map((x) => x.i);

  let failIdx = -1;
  let pendingIdx = -1;
  if (roll < 0.2) {
    failIdx = riskyIdx.length ? pick(rng, riskyIdx) : randInt(rng, 1, stages.length - 1);
  } else if (roll < 0.45) {
    pendingIdx = riskyIdx.length ? pick(rng, riskyIdx) : randInt(rng, 1, stages.length - 1);
  }

  const trail: UkCaseTrailItem[] = stages.map((stage, i) => {
    let status: UkTrailStatus = "accepted";
    if (failIdx >= 0 && i > failIdx) status = "blocked";
    else if (i === failIdx) status = "rejected";
    else if (i === pendingIdx) status = "pending";

    const controlId = stage.controlIds[0];
    const resultMap: Record<UkTrailStatus, UkControlResult> = {
      accepted: "pass",
      rejected: "fail",
      pending: "pending",
      blocked: "not-started",
    };
    const controlResults: Record<string, UkControlResult> = { [controlId]: resultMap[status] };

    const submittedBy =
      status === "blocked" ? null : submitterFor(`${caseId}:${stage.id}`);
    const stageRng = makeRng(hashString(`${caseId}:${stage.id}:meta`));
    const submittedAt = status === "blocked" ? null : dateLabel(stageRng);
    const evidenceItems =
      status === "blocked" ? [] : evidenceItemsFor(controlsById[controlId], stageRng);

    return { stage, status, submittedBy, submittedAt, evidenceItems, controlResults };
  });

  const overall: UkCaseOverall = failIdx >= 0 ? "failure" : pendingIdx >= 0 ? "pending" : "compliant";
  const failControlId =
    failIdx >= 0 ? stages[failIdx].controlIds[0] : pendingIdx >= 0 ? stages[pendingIdx].controlIds[0] : null;

  return { trail, overall, failControlId };
}

export function buildCases(
  domainId: UkProcessAuditDomainId,
  stages: UkSopStageDef[],
  controls: UkAuditControl[],
): UkJourneyCase[] {
  const controlsById = Object.fromEntries(controls.map((c) => [c.controlId, c]));
  const segments = SEGMENTS_BY_DOMAIN[domainId];
  const count = 12;

  return Array.from({ length: count }).map((_, idx) => {
    const caseId = `${domainId}-${1000 + idx * 137 + (hashString(domainId) % 89)}`;
    const rng = makeRng(hashString(`${caseId}:head`));
    const segment = segments[idx % segments.length];
    const subject = subjectFor(domainId, segment, rng);
    const opened = dateLabel(rng);

    const { trail, overall, failControlId } = buildTrail(caseId, domainId, stages, controlsById);
    const failControl = failControlId ? controlsById[failControlId] : null;
    const journeyException =
      overall === "compliant" || !failControl
        ? null
        : overall === "pending"
          ? `Awaiting: ${buildControlExceptionLabel(failControl)}`
          : buildControlExceptionLabel(failControl);

    return { id: caseId, subject, segment, opened, overallStatus: overall, journeyException, failControlId, trail };
  });
}

export {
  ENTITY_BY_DOMAIN,
  JOURNEY_TITLE_BY_DOMAIN,
};
