/**
 * kriBreachNoPlan — derivation "RULE".
 *
 * Fires when a domain has a KRI outside appetite AND its remediation plan has
 * stalled — a "Delayed" step, or "Not Started" steps with no "In Progress" work.
 * KriBar and RemediationTimeline render side by side in v4 but are never joined;
 * this detector joins them.
 *
 * The v4 mock data contains this: fincrime KYC refresh backlog 4,210 vs appetite
 * <1,000, alert closure 86% vs target >=95%, and the step "Remediate medium /
 * low-risk backlog" is Delayed at 0% progress.
 */
import { RISK_DOMAINS_V4 } from "../riskDomainsV5";
import { getPrecedentById } from "../precedentCorpus";
import type { BoardSignal, DomainKri } from "../types";
import { EVALUATED_AT, accountabilityFor, precedentFields } from "./_shared";

export const KRI_BREACH_NO_PLAN_TITLE = "Breach Without a Plan" as const;

const ALTERNATIVE_EXPLANATION =
  "A stalled step may be intentionally sequenced behind higher-priority work rather than " +
  "abandoned. Confirm the programme's critical path before treating the KRI as unmanaged.";

const PRECEDENT_ID = "uk-monzo-2025";

function kriLabel(kri: DomainKri): string {
  const value = kri.unit === "%" ? `${kri.value}%` : kri.value.toLocaleString();
  const target = kri.unit === "%" ? `target ${kri.target}%` : `appetite ${kri.target.toLocaleString()}`;
  return `${kri.label} at ${value} (${target})`;
}

export function detectKriBreachNoPlan(): BoardSignal[] {
  const signals: BoardSignal[] = [];

  for (const domain of RISK_DOMAINS_V4) {
    const breached = domain.kris.filter((k) => k.status !== "GREEN");
    if (breached.length === 0) continue;
    if (!domain.remediation) continue;

    const steps = domain.remediation.steps;
    const hasDelayed = steps.some((s) => s.status === "Delayed");
    const hasInProgress = steps.some((s) => s.status === "In Progress");
    const hasStalledNotStarted = steps.some((s) => s.status === "Not Started") && !hasInProgress;
    if (!hasDelayed && !hasStalledNotStarted) continue;

    const worst = breached.find((k) => k.status === "RED") ?? breached[0];
    const stalledSteps = steps.filter((s) => s.status === "Delayed" || s.status === "Not Started");

    const { precedents, primaryPrecedent: primary } = precedentFields(
      [getPrecedentById(PRECEDENT_ID)].filter((p): p is NonNullable<typeof p> => p != null),
    );

    signals.push({
      id: `kri-breach-no-plan-${domain.id}`,
      title: KRI_BREACH_NO_PLAN_TITLE,
      mechanism: "kri-breach-no-plan",
      severity: "S1",
      status: "CONFIRMED_ISSUE",
      domainId: domain.id,
      domainName: domain.name,
      signalObserved: `${breached.length} KRI(s) outside appetite with a stalled remediation step`,
      soWhat: `${domain.name} has ${breached.length} KRI(s) outside appetite (worst: ${kriLabel(worst)}) while remediation step "${stalledSteps[0].title}" is ${stalledSteps[0].status}.`,
      primaryMetric: {
        value: worst.unit === "%" ? `${worst.value}%` : worst.value,
        label: worst.label,
      },
      expected: `${worst.label} within appetite (${worst.target}${worst.unit === "%" ? "%" : ""})`,
      observed: `${kriLabel(worst)}; step "${stalledSteps[0].title}" is ${stalledSteps[0].status} at ${stalledSteps[0].progress ?? 0}% progress`,
      evidenceRefs: [],
      missingEvidence: [`an active (in-progress) remediation step for ${worst.label}`],
      precedents,
      primaryPrecedent: primary,
      derivation: "RULE",
      confidence: {
        level: "high",
        basis: "KRI outside appetite with a Delayed / stalled remediation step",
      },
      detectionVersion: "kri-breach-no-plan@1.0.0",
      evaluatedAt: EVALUATED_AT,
      accountability: accountabilityFor(domain.id),
      alternativeExplanation: ALTERNATIVE_EXPLANATION,
      trigger: "kri.value beyond kri.target && remediation step Delayed / Not Started",
    });
  }

  return signals;
}
