import { buildControlExceptionLabel } from "./buildJourney";
import type {
  UkAuditControl,
  UkDomainSop,
  UkEvidenceDocument,
  UkEvidenceExceptionRow,
  UkEvidencePack,
  UkEvidenceSourceSystem,
  UkJourneyCase,
  UkResidualRisk,
} from "./types";

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
const randInt = (rng: () => number, min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min;

function buildTestingSteps(c: UkAuditControl): string[] {
  return [
    `Obtained the control population of ${c.population.toLocaleString("en-GB")} items for "${c.sopStep}" and reconciled it to ${c.evidenceSourceSystem}.`,
    `Selected a risk-based sample of ${c.sample} items and requested the ${c.evidenceType.toLowerCase()} for each.`,
    `Re-performed the control: confirmed ${c.controlNature.toLowerCase()} operation of "${c.controlDescription.split(";")[0].trim()}".`,
    `Assessed each item against ${c.primaryObligation} (${c.issuingBody}) and recorded pass/exception with rationale.`,
    `Logged exceptions, agreed root cause with ${c.controlOwnerRole} and confirmed remediation ownership.`,
  ];
}

const EXCEPTION_DETAILS = [
  "Evidence not retained within the control window",
  "Approval recorded outside delegated authority",
  "Reconciliation break not cleared within SLA",
  "Screening disposition lacked documented rationale",
  "Sampled item missing supporting workpaper",
  "Control override applied without secondary sign-off",
];
const EXCEPTION_ACTIONS = [
  "Remediated; workpaper re-filed",
  "Escalated to control owner",
  "Root-cause action raised",
  "Re-performed control on wider sample",
  "Management action plan agreed",
];

function severityFromResidual(risk: UkResidualRisk, rng: () => number): UkResidualRisk {
  if (risk === "Critical") return rng() < 0.6 ? "Critical" : "High";
  if (risk === "High") return rng() < 0.6 ? "High" : "Medium";
  return rng() < 0.5 ? "Medium" : "Low";
}

function buildExceptionLog(c: UkAuditControl): UkEvidenceExceptionRow[] {
  const rng = makeRng(hashString(`${c.controlId}:exc`));
  const rows = Math.min(c.exceptions, 5);
  return Array.from({ length: rows }).map((_, i) => {
    const severity = severityFromResidual(c.residualRisk, rng);
    const breached = i < c.violations;
    return {
      ref: `${c.controlId}-E${String(i + 1).padStart(2, "0")}`,
      detail: EXCEPTION_DETAILS[randInt(rng, 0, EXCEPTION_DETAILS.length - 1)],
      severity,
      sla: breached ? "Breached" : "Within SLA",
      action: EXCEPTION_ACTIONS[randInt(rng, 0, EXCEPTION_ACTIONS.length - 1)],
    };
  });
}

function buildSourceSystems(c: UkAuditControl): UkEvidenceSourceSystem[] {
  return c.evidenceSourceSystem
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((name) => ({ name, record: `${c.evidenceType} for ${c.controlId}` }));
}

function buildDocuments(c: UkAuditControl): UkEvidenceDocument[] {
  const rng = makeRng(hashString(`${c.controlId}:docs`));
  const base: UkEvidenceDocument[] = [
    { name: `${c.controlId}_test_workpaper.xlsx`, type: "XLSX", size: `${randInt(rng, 40, 320)} KB` },
    { name: `${c.controlId}_${c.evidenceType.split("/")[0].replace(/\s+/g, "_")}.pdf`, type: "PDF", size: `${randInt(rng, 120, 900)} KB` },
  ];
  if (c.exceptions > 0) {
    base.push({ name: `${c.controlId}_exception_log.csv`, type: "CSV", size: `${randInt(rng, 8, 60)} KB` });
  }
  return base;
}

export function buildUkEvidence(
  control: UkAuditControl,
  ctx: { domainLabel: string; sop: UkDomainSop; cases: UkJourneyCase[] },
): UkEvidencePack {
  const stageSubmitters = ctx.sop.stages
    .filter((s) => s.controlIds.includes(control.controlId))
    .map((stage) => ({ sopName: ctx.sop.name, stage }));

  const sampleCaseTrails: UkEvidencePack["sampleCaseTrails"] = [];
  for (const kase of ctx.cases) {
    const hit = kase.trail.find((t) => t.stage.controlIds.includes(control.controlId));
    if (hit) sampleCaseTrails.push({ kase, hit });
    if (sampleCaseTrails.length >= 3) break;
  }

  const statusWord =
    control.status === "deficient"
      ? "deficient"
      : control.status === "needs-attention"
        ? "operating with exceptions"
        : "operating effectively";

  return {
    control,
    domainLabel: ctx.domainLabel,
    lastTested: control.lastTested,
    tester: control.tester,
    stageSubmitters,
    sampleCaseTrails,
    testingSteps: buildTestingSteps(control),
    exceptionLog: buildExceptionLog(control),
    sourceSystems: buildSourceSystems(control),
    documents: buildDocuments(control),
    auditorNote: `Control ${control.controlId} was tested ${statusWord} at ${control.compliance.toFixed(1)}% pass rate against ${control.primaryObligation}. ${
      control.violations > 0
        ? `${control.violations} critical breach(es) require a management action plan.`
        : control.exceptions > 0
          ? `${control.exceptions} exception(s) noted with remediation in progress.`
          : "No exceptions noted; evidence complete."
    }`,
    mgmtResponse:
      control.violations > 0
        ? `${control.controlOwnerRole} accepts the finding; remediation and re-performance scheduled next cycle, with interim monitoring in place.`
        : control.exceptions > 0
          ? `${control.controlOwnerRole} acknowledges the exceptions; corrective actions logged and tracked to closure.`
          : `${control.controlOwnerRole} confirms the control is embedded and operating as designed.`,
  };
}

export { buildControlExceptionLabel };
