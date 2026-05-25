import type { NavViewId, PersonaId } from "./types";

const ALL_MAIN: NavViewId[] = [
  "executive",
  "suppliers",
  "categories",
  "ghg_gases",
  "controls_audit",
  "submitted_evidences",
  "ai_insights",
  "reports",
];

export const PERSONA_LABELS: Record<PersonaId, string> = {
  procurement_gm: "Procurement GM",
  esg_manager: "ESG Manager / Compliance Officer",
  supplier_contact: "Supplier ESG Contact",
  third_party_auditor: "Third-Party ESG Auditor",
  board_cxo: "Board / CXO Executive",
};

export function visibleNavViews(persona: PersonaId): NavViewId[] {
  switch (persona) {
    case "esg_manager":
      return ALL_MAIN;
    case "procurement_gm":
      return [
        "executive",
        "suppliers",
        "categories",
        "ghg_gases",
        "controls_audit",
        "submitted_evidences",
        "ai_insights",
      ];
    case "supplier_contact":
      return ["supplier_portal"];
    case "third_party_auditor":
      return ["controls_audit", "submitted_evidences", "ghg_gases", "reports"];
    case "board_cxo":
      return ["executive", "ghg_gases", "reports"];
    default:
      return ALL_MAIN;
  }
}

export function defaultViewForPersona(persona: PersonaId): NavViewId {
  const v = visibleNavViews(persona);
  return v[0] ?? "executive";
}

/** Supplier portal uses a synthetic nav id not in main list */
export function isSupplierPortalOnly(persona: PersonaId): boolean {
  return persona === "supplier_contact";
}

export function canEditInsights(persona: PersonaId): boolean {
  return persona === "esg_manager" || persona === "procurement_gm";
}

export function isReadOnlyAuditor(persona: PersonaId): boolean {
  return persona === "third_party_auditor";
}

export function isBoardHighLevel(persona: PersonaId): boolean {
  return persona === "board_cxo";
}

export function showExecutiveCharts(persona: PersonaId): boolean {
  return persona !== "supplier_contact";
}

export function personaScopeHint(persona: PersonaId): string {
  switch (persona) {
    case "esg_manager":
      return "Full inventory, suppliers, controls, evidence, and BRSR-oriented reporting.";
    case "procurement_gm":
      return "Supplier engagement, category mass, and procurement-linked abatement signals.";
    case "supplier_contact":
      return "Self-service tasks and submissions for your organisation.";
    case "third_party_auditor":
      return "Assurance, evidence index, and read-only disclosure packs.";
    case "board_cxo":
      return "Executive posture, trend, and high-level disclosure readiness.";
    default:
      return "Scope 3 control-tower workspace.";
  }
}
