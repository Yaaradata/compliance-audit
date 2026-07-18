/**
 * v6 ERM — joins KRI breach with stalled remediation (v4 renders them separately).
 */
import { RISK_DOMAINS_V4 } from "./riskDomainsV6";
import type { DomainKri, RemediationPlan, RiskDomainV4 } from "../riskDomainTypes";

export type AppetiteBreachNoPlanSignal = {
  domainId: string;
  domainName: string;
  breachedKris: DomainKri[];
  worstKri: DomainKri;
  stalledStepTitle: string;
  stalledStepStatus: string;
  stalledStepProgress: number;
  fires: boolean;
};

function kriBeyondTarget(kri: DomainKri): boolean {
  return kri.status !== "GREEN";
}

function remediationStalled(plan: RemediationPlan): boolean {
  const steps = plan.steps;
  const hasDelayed = steps.some((s) => s.status === "Delayed");
  const hasInProgress = steps.some((s) => s.status === "In Progress");
  const hasStalledNotStarted = steps.some((s) => s.status === "Not Started") && !hasInProgress;
  return hasDelayed || hasStalledNotStarted;
}

export function evaluateAppetiteBreachNoPlan(domain: RiskDomainV4): AppetiteBreachNoPlanSignal | null {
  const breached = domain.kris.filter(kriBeyondTarget);
  if (breached.length === 0) return null;
  if (!domain.remediation) return null;
  if (!remediationStalled(domain.remediation)) return null;

  const stalled =
    domain.remediation.steps.find((s) => s.status === "Delayed") ??
    domain.remediation.steps.find((s) => s.status === "Not Started");

  const worst = breached.find((k) => k.status === "RED") ?? breached[0];

  return {
    domainId: domain.id,
    domainName: domain.name,
    breachedKris: breached,
    worstKri: worst,
    stalledStepTitle: stalled?.title ?? "—",
    stalledStepStatus: stalled?.status ?? "—",
    stalledStepProgress: stalled?.progress ?? 0,
    fires: true,
  };
}

export function fincrimeAppetiteBreachNoPlan(): AppetiteBreachNoPlanSignal | null {
  const fincrime = RISK_DOMAINS_V4.find((d) => d.id === "fincrime");
  return fincrime ? evaluateAppetiteBreachNoPlan(fincrime) : null;
}

export function domainsWithAppetiteBreachNoPlan(): AppetiteBreachNoPlanSignal[] {
  return RISK_DOMAINS_V4.map(evaluateAppetiteBreachNoPlan).filter(
    (s): s is AppetiteBreachNoPlanSignal => s != null && s.fires,
  );
}
