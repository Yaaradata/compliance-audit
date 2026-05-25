import type { CarbonLensLeafId } from "./types";

export type CarbonLensGroupId = "financed" | "own_ops" | "green" | "climate";

export interface CarbonLensNavLeaf {
  id: CarbonLensLeafId;
  label: string;
}

export interface CarbonLensNavGroup {
  id: CarbonLensGroupId;
  label: string;
  children: CarbonLensNavLeaf[];
}

export const CARBON_LENS_NAV: CarbonLensNavGroup[] = [
  {
    id: "financed",
    label: "Financed emissions",
    children: [
      { id: "portfolio_overview", label: "Portfolio overview" },
      { id: "corporate_loans", label: "Corporate loans" },
      { id: "project_finance", label: "Project finance" },
      { id: "retail_loans", label: "Retail loans" },
      { id: "msme_loans", label: "MSME loans" },
      { id: "trade_finance", label: "Trade finance" },
      { id: "investment_portfolio", label: "Investment portfolio" },
    ],
  },
  {
    id: "own_ops",
    label: "Own operations",
    children: [
      { id: "business_travel", label: "Business travel" },
      { id: "employee_commuting", label: "Employee commuting" },
      { id: "purchased_goods_services", label: "Purchased goods & services" },
      { id: "it_data_centers", label: "IT & data centers" },
      { id: "waste_capital_goods", label: "Waste & capital goods" },
    ],
  },
  {
    id: "green",
    label: "Green finance",
    children: [
      { id: "carbon_green_loans", label: "Green loans" },
      { id: "carbon_green_bonds", label: "Green bonds" },
      { id: "carbon_green_deposits", label: "Green deposits" },
      { id: "carbon_sustainability_linked_loans", label: "Sustainability-linked loans" },
    ],
  },
  {
    id: "climate",
    label: "Climate risk",
    children: [
      { id: "physical_risk", label: "Physical risk" },
      { id: "transition_risk", label: "Transition risk" },
      { id: "climate_stress_testing", label: "Climate stress testing" },
    ],
  },
];

export const ALL_CARBON_LENS_LEAVES: CarbonLensLeafId[] = CARBON_LENS_NAV.flatMap((g) => g.children.map((c) => c.id));

export function groupForCarbonLensLeaf(leaf: CarbonLensLeafId): CarbonLensGroupId {
  for (const g of CARBON_LENS_NAV) {
    if (g.children.some((c) => c.id === leaf)) return g.id;
  }
  return "financed";
}
