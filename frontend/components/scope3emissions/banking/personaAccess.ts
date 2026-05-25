import type { AiInsight, BankNavViewId, BankPersonaId, BorrowerRow, CarbonLensLeafId } from "./types";
import { ALL_CARBON_LENS_LEAVES } from "./carbonLensNav";

const FINANCED_LEAVES: CarbonLensLeafId[] = [
  "portfolio_overview",
  "corporate_loans",
  "project_finance",
  "retail_loans",
  "msme_loans",
  "trade_finance",
  "investment_portfolio",
];

const GREEN_LEAVES: CarbonLensLeafId[] = [
  "carbon_green_loans",
  "carbon_green_bonds",
  "carbon_green_deposits",
  "carbon_sustainability_linked_loans",
];

const CLIMATE_LEAVES: CarbonLensLeafId[] = ["physical_risk", "transition_risk", "climate_stress_testing"];

const OWN_OPS_LEAVES: CarbonLensLeafId[] = [
  "business_travel",
  "employee_commuting",
  "purchased_goods_services",
  "it_data_centers",
  "waste_capital_goods",
];

const ALL_VIEWS: BankNavViewId[] = [
  "executive",
  "carbon_lens",
  "financed_emissions",
  "green_finance",
  "climate_risk",
  "controls_audit",
  "ai_insights",
  "reports",
  "upstream_downstream",
  "sectors",
  "ghg_tracking",
  "submitted_data",
];

/** Demo RM book: single sector slice for corporate RM persona. */
export const DEMO_RM_FOCUS_SECTOR = "Steel & Metals";

export const PERSONA_LABELS: Record<BankPersonaId, string> = {
  cro: "Chief Risk Officer (Climate & ESG)",
  esg_officer: "Head of Sustainability / ESG Officer",
  corporate_rm: "Corporate Banking RM",
  credit_risk_analyst: "Credit Risk Analyst (ESG screening)",
  treasury_pm: "Treasury & Investment Portfolio Manager",
  compliance_officer: "Compliance Officer (RBI/SEBI)",
  board_member: "Board Risk Committee Member",
  external_auditor: "External Green Finance Auditor",
  green_finance_pm: "Green Finance Product Manager",
  procurement_gm: "Procurement GM (Group Procurement)",
};

/** Carbon Lens leaves visible per persona (subset or all). */
export function carbonLensLeavesForPersona(persona: BankPersonaId): CarbonLensLeafId[] {
  switch (persona) {
    case "esg_officer":
      return [...ALL_CARBON_LENS_LEAVES];
    case "board_member":
      return ["portfolio_overview", "physical_risk", "climate_stress_testing"];
    case "corporate_rm":
      return [...FINANCED_LEAVES];
    case "green_finance_pm":
      return ["portfolio_overview", ...GREEN_LEAVES];
    case "credit_risk_analyst":
      return [...FINANCED_LEAVES, ...CLIMATE_LEAVES];
    case "treasury_pm":
      return [...FINANCED_LEAVES, ...GREEN_LEAVES];
    case "compliance_officer":
      return ["portfolio_overview", ...CLIMATE_LEAVES, ...GREEN_LEAVES];
    case "external_auditor":
      return ["portfolio_overview", ...FINANCED_LEAVES, ...GREEN_LEAVES];
    case "cro":
      return [...ALL_CARBON_LENS_LEAVES];
    case "procurement_gm":
      return ["portfolio_overview", "trade_finance", ...OWN_OPS_LEAVES, ...GREEN_LEAVES, ...CLIMATE_LEAVES];
    default:
      return [...ALL_CARBON_LENS_LEAVES];
  }
}

export function visibleNavViews(persona: BankPersonaId): BankNavViewId[] {
  switch (persona) {
    case "esg_officer":
      return ALL_VIEWS;
    case "cro":
      return ["executive", "carbon_lens", "financed_emissions", "climate_risk", "ai_insights", "reports", "upstream_downstream", "sectors", "ghg_tracking", "submitted_data"];
    case "corporate_rm":
      return ["carbon_lens", "financed_emissions", "ai_insights", "upstream_downstream", "sectors", "ghg_tracking", "submitted_data"];
    case "credit_risk_analyst":
      return ["carbon_lens", "financed_emissions", "climate_risk", "upstream_downstream", "sectors", "ghg_tracking", "submitted_data"];
    case "treasury_pm":
      return ["executive", "carbon_lens", "financed_emissions", "green_finance", "upstream_downstream", "sectors", "ghg_tracking", "submitted_data"];
    case "compliance_officer":
      return ["carbon_lens", "controls_audit", "submitted_data", "reports", "ai_insights", "upstream_downstream", "sectors", "ghg_tracking"];
    case "board_member":
      return ["executive", "carbon_lens", "upstream_downstream", "sectors", "ghg_tracking", "submitted_data"];
    case "external_auditor":
      return ["controls_audit", "submitted_data", "carbon_lens", "financed_emissions", "upstream_downstream", "sectors", "ghg_tracking"];
    case "green_finance_pm":
      return ["green_finance", "carbon_lens", "ai_insights", "upstream_downstream", "sectors", "ghg_tracking", "submitted_data"];
    case "procurement_gm":
      return [
        "upstream_downstream",
        "executive",
        "carbon_lens",
        "ghg_tracking",
        "controls_audit",
        "submitted_data",
        "ai_insights",
        "reports",
        "sectors",
      ];
    default:
      return ALL_VIEWS;
  }
}

export function defaultViewForPersona(persona: BankPersonaId): BankNavViewId {
  const v = visibleNavViews(persona);
  return v[0] ?? "executive";
}

/** One-line explanation for the persona strip (RBAC preview — not enforced server-side). */
export function personaScopeHint(persona: BankPersonaId): string {
  const pre = "Persona scope — ";
  switch (persona) {
    case "esg_officer":
      return pre + "Full navigation, Carbon Lens tiles, and unfiltered portfolio data.";
    case "cro":
      return pre + "Risk-led slice: no green-finance PMO screen; reports summary mode; insights Critical / High only.";
    case "corporate_rm":
      return pre + "Steel & Metals book for borrowers and AI signals; financed Carbon Lens tiles; RM upstream/downstream panels.";
    case "credit_risk_analyst":
      return pre + "Financed + climate risk lenses; upstream/downstream omits some engagement panels.";
    case "treasury_pm":
      return pre + "Treasury-tagged borrowers, financed + green finance lenses, executive summary included.";
    case "compliance_officer":
      return pre + "Controls, reports, regulatory-gap insights; financed emissions hidden from sidebar (use Carbon Lens if needed).";
    case "board_member":
      return pre + "Board pack: executive, Carbon Lens (portfolio + climate stress), upstream/downstream, sectors, GHG — no AI or reports deep links.";
    case "external_auditor":
      return pre + "Assurance-first: controls default tab, read-only financed view, no AI or reports pack.";
    case "green_finance_pm":
      return pre + "Green finance home, Carbon Lens green tiles, opportunity-tagged insights — no climate risk top-level tab.";
    case "procurement_gm":
      return pre + "Upstream/downstream first; full Carbon Lens pillar access; supplier & data-quality insights.";
    default:
      return pre + "Navigation and Carbon Lens are filtered for this persona.";
  }
}

export function isBoardPersona(persona: BankPersonaId): boolean {
  return persona === "board_member";
}

export function isExternalAuditor(persona: BankPersonaId): boolean {
  return persona === "external_auditor";
}

export function filterBorrowersForPersona(persona: BankPersonaId, rows: BorrowerRow[]): BorrowerRow[] {
  if (persona === "corporate_rm") {
    return rows.filter((r) => r.sector === DEMO_RM_FOCUS_SECTOR);
  }
  if (persona === "treasury_pm") {
    return rows.filter((r) => r.treasuryRelevant);
  }
  return rows;
}

export function filterAiInsightsForPersona(
  persona: BankPersonaId,
  insights: AiInsight[],
  borrowers: BorrowerRow[],
): AiInsight[] {
  if (persona === "cro") {
    return insights.filter((i) => i.severity === "Critical" || i.severity === "High");
  }
  if (persona === "compliance_officer") {
    return insights.filter((i) => i.category === "Regulatory Gap");
  }
  if (persona === "green_finance_pm") {
    return insights.filter((i) => i.category === "Green Finance Opportunity");
  }
  if (persona === "corporate_rm") {
    const bookNames = new Set(
      borrowers.filter((x) => x.sector === DEMO_RM_FOCUS_SECTOR).map((x) => x.name),
    );
    return insights.filter((i) => bookNames.has(i.linkedEntity) || i.linkedEntity === DEMO_RM_FOCUS_SECTOR);
  }
  if (persona === "procurement_gm") {
    return insights.filter(
      (i) =>
        i.category === "Data Quality" ||
        i.category === "Borrower Engagement" ||
        i.linkedEntity === "Trade finance",
    );
  }
  return insights;
}

export function reportsSummaryOnly(persona: BankPersonaId): boolean {
  return persona === "cro";
}
