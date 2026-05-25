import type { BankNavViewId } from "./types";

/** Sidebar chrome for the banking Scope 3 dashboard (neutral labels). */
export const BRSR_BANK_SIDEBAR = {
  kicker: "BRSR · GHG Protocol",
  title: "Scope 3 · Banking",
  tag: "Financed emissions & climate intelligence",
} as const;

/** View headers: eyebrow + title + subtitle per route (no single-compliance-spine framing). */
export const BRSR_BANK_VIEW_COPY: Record<
  BankNavViewId,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
  }
> = {
  executive: {
    eyebrow: "Executive summary",
    title: "Emissions & climate posture",
    subtitle:
      "Financed Category 15 and operational Scope 3 signals, physical risk concentration, and regulatory readiness tiles.",
  },
  carbon_lens: {
    eyebrow: "Carbon lens",
    title: "Portfolio footprint & activity",
    subtitle: "Portfolio metrics, own-operations, and climate-risk tiles for financed and non-financed emissions.",
  },
  financed_emissions: {
    eyebrow: "Financed emissions",
    title: "Category 15 — corporate book",
    subtitle: "Attributed tCO₂e and PCAF data quality across borrowers and sectoral decarbonisation views.",
  },
  green_finance: {
    eyebrow: "Green & transition finance",
    title: "Mitigation instruments",
    subtitle: "Use-of-proceeds verification, green deposits, and transition finance lines linked to the portfolio.",
  },
  climate_risk: {
    eyebrow: "Climate risk",
    title: "Physical & transition",
    subtitle: "Collateral hazards, scenarios, and stress outcomes for disclosure and internal risk discussion.",
  },
  controls_audit: {
    eyebrow: "Compliance & audit",
    title: "Counterparty data, BRSR & controls",
    subtitle:
      "Counterparty disclosure register, BRSR Core mapping, internal control checklist, audit trail, and Scope 3 data confidence — FY 2024–25.",
  },
  ai_insights: {
    eyebrow: "Signals",
    title: "Prioritised insights",
    subtitle: "Modelled alerts on data quality, intensity versus benchmarks, and physical exposure for triage.",
  },
  reports: {
    eyebrow: "Reports",
    title: "Disclosure pack builder",
    subtitle: "Report definitions, completeness, and generation actions across schedules in the mock catalog.",
  },
  upstream_downstream: {
    eyebrow: "Scope 3 boundaries",
    title: "Operational vs financed",
    subtitle: "Categories 1–8 (bank as buyer) versus Category 15 (financed emissions) for boundary clarity.",
  },
  sectors: {
    eyebrow: "Sectors",
    title: "Financed intensity & pathways",
    subtitle: "Industry WACI, benchmark gaps, pathway labels, and borrower drill-down by sector.",
  },
  ghg_tracking: {
    eyebrow: "GHG register",
    title: "Emissions & factors",
    subtitle: "Sector trackers, emission-factor registry, and PCAF scores for inventory and assurance support.",
  },
  submitted_data: {
    eyebrow: "Evidence register",
    title: "Submitted Data",
    subtitle:
      "Upstream supplier and downstream borrower evidence packages — sector coverage, PCAF lineage, and assurance-ready artifacts for FY25.",
  },
};
