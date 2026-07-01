import {
  AlertOctagon,
  Banknote,
  CreditCard,
  HandCoins,
  LayoutDashboard,
  MessageSquareWarning,
  ShieldAlert,
  UserCheck,
  Wallet,
} from "lucide-react";
import { buildCases, buildControlExceptionLabel, buildSop } from "./buildJourney";
import { deriveControlMetrics } from "./deriveMetrics";
import { ENTITY_BY_DOMAIN, JOURNEY_TITLE_BY_DOMAIN } from "./journeyConfig";
import { parseUkControlRows } from "./parseControls";
import type {
  UkAuditControl,
  UkDomainAuditCard,
  UkDomainSop,
  UkJourneyCase,
  UkProcessAuditDomainDef,
  UkProcessAuditDomainId,
  UkProcessAuditOverview,
  UkProcessAuditSnapshot,
  UkResidualRisk,
} from "./types";

const DOMAIN_ORDER: UkProcessAuditDomainId[] = [
  "ONB",
  "DEP",
  "PAY",
  "LEN",
  "COL",
  "FC",
  "FRD",
  "CMP",
];

const DOMAIN_META: Record<UkProcessAuditDomainId, UkProcessAuditDomainDef> = {
  ONB: { id: "ONB", label: "Customer Onboarding & KYC", icon: UserCheck, color: "#3b82f6" },
  DEP: { id: "DEP", label: "Deposits & Account Servicing", icon: Wallet, color: "#14b8a6" },
  PAY: { id: "PAY", label: "Payments & Transaction Processing", icon: CreditCard, color: "#06b6d4" },
  LEN: { id: "LEN", label: "Lending Origination & Underwriting", icon: Banknote, color: "#8b5cf6" },
  COL: { id: "COL", label: "Collections & Recoveries", icon: HandCoins, color: "#f97316" },
  FC: { id: "FC", label: "Financial Crime (AML/CTF & Sanctions)", icon: AlertOctagon, color: "#ef4444" },
  FRD: { id: "FRD", label: "Fraud & Scams Management", icon: ShieldAlert, color: "#e11d48" },
  CMP: { id: "CMP", label: "Complaints & Redress", icon: MessageSquareWarning, color: "#eab308" },
};

const RESIDUAL_RANK: Record<UkResidualRisk, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

function worseRisk(a: UkResidualRisk, b: UkResidualRisk): UkResidualRisk {
  return RESIDUAL_RANK[a] >= RESIDUAL_RANK[b] ? a : b;
}

/** Short, readable action prompt per residual-risk tier. */
function actionFor(risk: UkResidualRisk, worst: UkAuditControl): string {
  const step = worst.sopStep;
  switch (risk) {
    case "Critical":
      return `Escalate ${worst.controlId} — expand sample on "${step}" and open a finding.`;
    case "High":
      return `Prioritise re-test of ${worst.controlId} at "${step}" this cycle.`;
    case "Medium":
      return `Monitor ${worst.controlId}; confirm remediation on "${step}".`;
    case "Low":
      return `Maintain BAU testing cadence across the domain.`;
    default: {
      const _exhaustive: never = risk;
      return _exhaustive;
    }
  }
}

function buildDomainCard(
  meta: UkProcessAuditDomainDef,
  controls: UkAuditControl[],
): UkDomainAuditCard {
  const controlsCount = controls.length;
  const tested = controls.filter((c) => c.status !== "not-tested").length;
  const exceptions = controls.reduce((s, c) => s + c.exceptions, 0);
  const violations = controls.reduce((s, c) => s + c.violations, 0);
  const overdueRemediation = controls.filter((c) => c.status === "deficient").length;
  const compliance = controlsCount
    ? Number((controls.reduce((s, c) => s + c.compliance, 0) / controlsCount).toFixed(1))
    : 100;

  const residualRisk = controls.reduce<UkResidualRisk>(
    (acc, c) => worseRisk(acc, c.residualRisk),
    "Low",
  );

  const worst = [...controls].sort(
    (a, b) =>
      RESIDUAL_RANK[b.residualRisk] - RESIDUAL_RANK[a.residualRisk] ||
      b.exceptions - a.exceptions,
  )[0];

  return {
    id: meta.id as UkProcessAuditDomainId,
    domain: meta.label,
    owner: worst?.controlOwnerRole ?? "Domain Control Owner",
    controls: controlsCount,
    tested,
    compliance,
    exceptions,
    violations,
    overdueRemediation,
    residualRisk,
    topIssue: worst
      ? `${worst.controlId} · ${worst.riskStatement}`
      : "No material exceptions this cycle.",
    action: worst ? actionFor(residualRisk, worst) : "Maintain BAU testing cadence.",
  };
}

function buildOverview(allControls: UkAuditControl[]): UkProcessAuditOverview {
  const total = allControls.length;
  const avgCompliance = Number(
    (allControls.reduce((s, c) => s + c.compliance, 0) / total).toFixed(1),
  );
  const openExceptions = allControls.reduce((s, c) => s + c.exceptions, 0);
  const criticalFindings = allControls.filter((c) => c.residualRisk === "Critical").length;
  const automated = allControls.filter((c) => c.automationLevel === "Automated").length;
  const preventive = allControls.filter((c) => c.controlNature === "Preventive").length;

  const posture: UkResidualRisk =
    criticalFindings > 6 || avgCompliance < 92
      ? "Critical"
      : criticalFindings > 2 || avgCompliance < 95
        ? "High"
        : avgCompliance < 97
          ? "Medium"
          : "Low";

  return {
    totalControls: total,
    totalDomains: DOMAIN_ORDER.length,
    avgCompliance,
    openExceptions,
    criticalFindings,
    automatedPct: Math.round((automated / total) * 100),
    preventivePct: Math.round((preventive / total) * 100),
    lastAuditCycle: "Q1 FY26 · Closing review",
    posture,
  };
}

let cached: UkProcessAuditSnapshot | null = null;

export function assembleUkProcessAuditSnapshot(): UkProcessAuditSnapshot {
  if (cached) return cached;

  const rows = parseUkControlRows();
  const controls = rows.map(deriveControlMetrics);

  const controlsByDomain = {} as Record<UkProcessAuditDomainId, UkAuditControl[]>;
  for (const id of DOMAIN_ORDER) {
    controlsByDomain[id] = [];
  }
  for (const control of controls) {
    (controlsByDomain[control.domainCode] ??= []).push(control);
  }

  const sopByDomain = {} as Record<UkProcessAuditDomainId, UkDomainSop>;
  const casesByDomain = {} as Record<UkProcessAuditDomainId, UkJourneyCase[]>;
  for (const id of DOMAIN_ORDER) {
    controlsByDomain[id].sort((a, b) => a.stepNo - b.stepNo);
    sopByDomain[id] = buildSop(id, DOMAIN_META[id].label, controlsByDomain[id]);
    casesByDomain[id] = buildCases(id, sopByDomain[id].stages, controlsByDomain[id]);
  }

  const controlExceptionLabelById: Record<string, string> = {};
  for (const control of controls) {
    controlExceptionLabelById[control.controlId] = buildControlExceptionLabel(control);
  }

  const domainCards = DOMAIN_ORDER.map((id) =>
    buildDomainCard(DOMAIN_META[id], controlsByDomain[id]),
  );

  const overviewDef: UkProcessAuditDomainDef = {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    color: "#0f172a",
  };

  cached = {
    overview: buildOverview(controls),
    domains: [overviewDef, ...DOMAIN_ORDER.map((id) => DOMAIN_META[id])],
    domainMeta: DOMAIN_META,
    controlsByDomain,
    sopByDomain,
    casesByDomain,
    entityByDomain: ENTITY_BY_DOMAIN,
    journeyTitleByDomain: JOURNEY_TITLE_BY_DOMAIN,
    controlExceptionLabelById,
    domainCards,
  };
  return cached;
}
