import type { UkAuditControl, UkProcessAuditDomainId } from "../types";
import type {
  UkAuditClaim,
  UkCadenceEvaluation,
  UkEnforcementPrecedent,
  UkEvidenceRef,
  UkPopulationCoverageCheck,
  SignalPredicate,
} from "./types";

function evidenceRef(control: UkAuditControl): UkEvidenceRef {
  return {
    controlId: control.controlId,
    evidenceType: control.evidenceType,
    sourceSystem: control.evidenceSourceSystem,
    packHint: `${control.controlId} · ${control.evidenceType}`,
  };
}

function ruleClaim(args: {
  id: string;
  predicate: SignalPredicate;
  headline: string;
  detail: string;
  control: UkAuditControl;
  precedentId?: string | null;
}): UkAuditClaim {
  return {
    id: args.id,
    origin: "RULE",
    predicate: args.predicate,
    headline: args.headline,
    detail: args.detail,
    evidence: evidenceRef(args.control),
    domainId: args.control.domainCode,
    controlId: args.control.controlId,
    precedentId: args.precedentId ?? null,
  };
}

function llmClaim(args: {
  id: string;
  predicate: SignalPredicate;
  headline: string;
  detail: string;
  control: UkAuditControl;
  precedentId?: string | null;
}): UkAuditClaim {
  return {
    id: args.id,
    origin: "LLM",
    predicate: args.predicate,
    headline: args.headline,
    detail: args.detail,
    evidence: evidenceRef(args.control),
    domainId: args.control.domainCode,
    controlId: args.control.controlId,
    precedentId: args.precedentId ?? null,
  };
}

/**
 * Build evidence-bound claims from cadence, population gaps, and real precedents.
 * RULE rows are deterministic evaluations; LLM rows are interpretive overlays —
 * both always carry an evidence reference.
 */
export function buildAuditClaims(args: {
  controls: UkAuditControl[];
  cadenceById: Record<string, UkCadenceEvaluation>;
  populationChecks: UkPopulationCoverageCheck[];
  precedents: UkEnforcementPrecedent[];
}): UkAuditClaim[] {
  const { controls, cadenceById, populationChecks, precedents } = args;
  const byId = new Map(controls.map((c) => [c.controlId, c]));
  const claims: UkAuditClaim[] = [];

  // RULE: overdue cadence (armed controls past window).
  for (const c of controls) {
    const cad = cadenceById[c.controlId];
    if (!cad) continue;
    if (cad.status === "OVERDUE" && cad.cadenceDays != null && cad.daysSinceTest != null) {
      claims.push(
        ruleClaim({
          id: `rule-overdue-${c.controlId}`,
          predicate: "SIGNAL_FIRED",
          headline: `${c.controlId} testing window exceeded`,
          detail: `Last tested ${cad.lastTestedAt} · ${cad.daysSinceTest}d ago · cadence ${cad.cadenceDays}d (${cad.frequencyRaw}).`,
          control: c,
        }),
      );
    }
    if (cad.status === "UNARMED") {
      claims.push(
        ruleClaim({
          id: `rule-unarmed-${c.controlId}`,
          predicate: "HUMAN_REVIEW_REQUIRED",
          headline: `${c.controlId} cadence unarmed`,
          detail: `Frequency "${cad.frequencyRaw}" has no confirmed calendar cadence — absence is not a fail; confirm arming before scoring.`,
          control: c,
        }),
      );
    }
  }

  // RULE: population evidence gaps.
  for (const check of populationChecks) {
    if (check.predicate !== "EVIDENCE_GAP_OBSERVED") continue;
    const control = byId.get(check.controlId);
    if (!control) continue;
    claims.push(
      ruleClaim({
        id: `rule-gap-${check.controlId}`,
        predicate: "EVIDENCE_GAP_OBSERVED",
        headline: `${check.controlId} coverage claim exceeds observed sample`,
        detail: `Claimed ${check.claimedCoveragePct.toFixed(1)}% vs observed ${check.observedCoveragePct.toFixed(1)}% on population ${check.population.toLocaleString("en-GB")} (gap ${check.gap.toLocaleString("en-GB")}).`,
        control,
      }),
    );
  }

  // RULE + LLM: precedent matches by domain theme.
  for (const precedent of precedents) {
    const domainSet = new Set(precedent.matchedDomainIds);
    const domainControls = controls.filter((c) => domainSet.has(c.domainCode));
    if (domainControls.length === 0) continue;

    // Prefer an overdue or gap control in the matched domain; else first control.
    const preferred =
      domainControls.find((c) => cadenceById[c.controlId]?.status === "OVERDUE") ??
      domainControls.find((c) =>
        populationChecks.some(
          (p) => p.controlId === c.controlId && p.predicate === "EVIDENCE_GAP_OBSERVED",
        ),
      ) ??
      domainControls[0];

    claims.push(
      ruleClaim({
        id: `rule-precedent-${precedent.id}-${preferred.controlId}`,
        predicate: "PRECEDENT_MATCHED",
        headline: `${precedent.firm} precedent maps to ${preferred.domainCode}`,
        detail: `${precedent.matchedThemes.join(" · ")} · ${precedent.regulator} ${precedent.date} · posture ${precedent.admissionPosture}.`,
        control: preferred,
        precedentId: precedent.id,
      }),
    );

    claims.push(
      llmClaim({
        id: `llm-precedent-${precedent.id}-${preferred.controlId}`,
        predicate: "HUMAN_REVIEW_REQUIRED",
        headline: `Review ${preferred.controlId} against ${precedent.firm} pattern`,
        detail: `Interpretive overlay: compare this control's population feed and rail coverage to the public facts in ${precedent.id}. Not a determination.`,
        control: preferred,
        precedentId: precedent.id,
      }),
    );
  }

  // Cap UNARMED noise — keep first 8 unarmed HUMAN_REVIEW claims, all other predicates.
  const unarmed = claims.filter((c) => c.id.startsWith("rule-unarmed-"));
  const rest = claims.filter((c) => !c.id.startsWith("rule-unarmed-"));
  return [...rest, ...unarmed.slice(0, 8)];
}

export function claimsForDomain(
  claims: UkAuditClaim[],
  domainId: UkProcessAuditDomainId,
): UkAuditClaim[] {
  return claims.filter((c) => c.domainId === domainId);
}
