import type { IntensityInvestmentRow } from "./intensity-ratio-data";
import { INTENSITY_INVEST } from "./intensity-ratio-data";
import type { IntensityInvestmentAiDossier } from "./intensity-ratio-types";

export type IntensityInvestmentAiInsightCard = {
  id: string;
  title: string;
  summary: string;
  severity: IntensityInvestmentAiDossier["severity"];
  category: string;
  confidencePct: number;
  linkedProgramme?: string;
};

const BATTERY_AI: IntensityInvestmentAiDossier = {
  insightId: "inv-ai-battery",
  linkedProgramme: "Battery supply chain",
  severity: "High",
  category: "Supplier & technology risk",
  confidencePct: 89,
  headline: "Cell route concentration threatens FY26 abatement cost curve",
  riskAnalysis: {
    overallRisk: "High",
    compositeIndex: 68,
    dimensions: [
      { label: "Supply concentration", score: 72, note: "KR cathode + CN refining >62% of pack Cat 1" },
      { label: "Commercial exposure", score: 65, note: "Air freight hedge only 58% retired" },
      { label: "Data & PCF quality", score: 58, note: "Verified PCF on 91% spend — Tier-2 gaps on anode" },
      { label: "Regulatory / CBAM", score: 74, note: "Export trims need embedded emissions worksheets by Q4" },
    ],
    flags: [
      "Single qualified cathode route for Nex EV until CN alternate fully ramped",
      "VoltCell commitment-only on SBTi — not validated target",
    ],
  },
  costCutIdeas: [
    {
      title: "Retire KR→Chennai air lane (sea buffer live)",
      annualSavingCr: 18,
      annualSavingT: 12_800,
      effort: "Low",
      detail: "Buffer stock at Chennai covers 6-week cell demand — logistics modal shift programme milestone Q3 FY26.",
    },
    {
      title: "Dual-source LFP pilot cells (15% blend)",
      annualSavingCr: 8,
      annualSavingT: 22_000,
      effort: "Medium",
      detail: "Lower intensity chemistry on entry trims — requires re-homologation and supplier PCF refresh.",
    },
    {
      title: "Negotiate volume-tier green premium clawback",
      annualSavingCr: 6,
      effort: "Low",
      detail: "Tie 3% of cell price to verified gCO₂e/kWh — release holdback if PCF slips quarter-on-quarter.",
    },
  ],
  purchasingStrategies: [
    "Split 40/40/20 award across KR, CN low-carbon, and domestic module integrator by FY27.",
    "Mandate ISO 14067 on all cathode PO renewals before FY26 price lists lock.",
    "Index green premium to shadow carbon price (₹920/t) in business case — not pass-through markup.",
  ],
  contractLevers: [
    "PCF hold clause — no shipment without cradle-to-gate declaration within 90 days of PO.",
    "Modal split SLA: air share <2% of inbound tCO₂e or freight surcharge to supplier.",
    "SBTi validation milestone payment — 2% release on approved near-term target.",
  ],
  recommendedActions: [
    "Close CN cathode qualification gate by 2025-09-30 (procurement owner).",
    "Escalate VoltCell to validated SBTi or alternate RFQ.",
    "Publish cell-specific supplier brief for board green-loan covenant pack.",
  ],
  modelTrace: [
    "Spend + invoice lines FY25 close; cell BOM mass allocation.",
    "Logistics ledger — modal split by lane (Cat 4).",
    "LLM synthesis capped at 400 tokens; Critical paths need human sign-off.",
  ],
};

const GREEN_STEEL_AI: IntensityInvestmentAiDossier = {
  insightId: "inv-ai-steel",
  linkedProgramme: "Green steel programme",
  severity: "Medium",
  category: "Cost–carbon trade-off",
  confidencePct: 84,
  headline: "Green steel premium recoverable via CBAM avoidance and intensity covenant",
  riskAnalysis: {
    overallRisk: "Medium",
    compositeIndex: 52,
    dimensions: [
      { label: "Price volatility", score: 55, note: "EU green steel premium +8–11% vs primary" },
      { label: "Volume commitment", score: 48, note: "62% of BIW mass on programme by FY26" },
      { label: "Certificate integrity", score: 42, note: "Mass-balance ISCC on 88% of contracted tons" },
      { label: "Intensity impact", score: 38, note: "−11% Cat 1 on affected steel vs India EEIO" },
    ],
    flags: ["LCV platform not yet in green steel scope — 18% of steel spend exposed"],
  },
  costCutIdeas: [
    {
      title: "Blend 24% recycled content on closure panels",
      annualSavingCr: 14,
      annualSavingT: 28_000,
      effort: "Medium",
      detail: "ForgeAlloys closed-loop — capex already sunk; marginal cost below primary.",
    },
    {
      title: "CBAM certificate pooling with EU JV trims",
      annualSavingCr: 22,
      effort: "Low",
      detail: "Avoid €65/t border charge on export body-in-white — finance already models ₹118 Cr/yr.",
    },
    {
      title: "Defer non-export platforms from premium tier",
      annualSavingCr: 9,
      effort: "Low",
      detail: "Keep domestic ICE on conventional steel until PCF gap closes — saves premium without export benefit.",
    },
  ],
  purchasingStrategies: [
    "Contract 3-year take-or-pay with Tata Steel Green at fixed premium band.",
    "Require site-specific EF disclosure — reject portfolio averages on renewals.",
    "Bundle LCV stampings into programme in FY26 wave 2.",
  ],
  contractLevers: [
    "Green steel mass-balance certificate per heat number.",
    "Price review only if verified EF worsens >5% YoY.",
  ],
  recommendedActions: [
    "Extend programme scope to Fleet LCV BIW by Q4 FY25.",
    "Refresh Urban ICE LCA with updated steel EF for BRSR footnote.",
  ],
  modelTrace: ["Steel spend cube × supplier EF", "Export mix model", "CBAM shadow price €65/t"],
};

const LOGISTICS_AI: IntensityInvestmentAiDossier = {
  insightId: "inv-ai-logistics",
  linkedProgramme: "Logistics modal shift",
  severity: "Medium",
  category: "ROI & mandate",
  confidencePct: 81,
  headline: "Modal shift ROI <1× in year 1 — strategic mandate; payback in year 3 via air avoidance",
  riskAnalysis: {
    overallRisk: "Medium",
    compositeIndex: 56,
    dimensions: [
      { label: "ROI timing", score: 62, note: "0.9× year-1 — inventory carrying cost" },
      { label: "Operational readiness", score: 44, note: "Chennai buffer operational — KR lane 42% air" },
      { label: "Service level", score: 50, note: "No stock-out on Nex line since go-live" },
      { label: "Emissions impact", score: 35, note: "92 kt avoided — largest Cat 4 lever" },
    ],
    flags: ["TW electronics expedited lane still 18% air — separate workstream"],
  },
  costCutIdeas: [
    {
      title: "Consolidate TW electronics into monthly sea block",
      annualSavingCr: 4,
      annualSavingT: 3_200,
      effort: "Medium",
      detail: "Align with procurement lead time policy — 2-week safety stock at Pune.",
    },
    {
      title: "Renegotiate 3PL fuel surcharge pass-through",
      annualSavingCr: 7,
      effort: "Low",
      detail: "Cap diesel indexation on inbound lanes tied to modal shift KPI.",
    },
  ],
  purchasingStrategies: [
    "Make modal split a weighted scorecard item (15%) for inbound 3PLs.",
    "No new air lanes without CSO + CFO joint waiver.",
  ],
  contractLevers: [
    "Air share penalty clause in 3PL master agreement.",
    "Gain-share on freight ₹ saved vs FY24 baseline.",
  ],
  recommendedActions: [
    "Close KR cell air retirement milestone by 2025-07-31.",
    "Add TW lane to Q2 logistics war-room.",
  ],
  modelTrace: ["TMS modal ledger", "Freight invoice match", "Cat 4 inventory model"],
};

const PORTFOLIO_AI: IntensityInvestmentAiDossier[] = [
  {
    insightId: "inv-ai-portfolio-1",
    severity: "High",
    category: "Portfolio prioritisation",
    confidencePct: 86,
    headline: "Reallocate ₹24 Cr from sub-1× ROI enablers to battery + green steel",
    riskAnalysis: {
      overallRisk: "High",
      compositeIndex: 71,
      dimensions: [
        { label: "Capital efficiency", score: 75, note: "Blended abatement ₹412/t vs ₹290/t best-in-class bundle" },
        { label: "Covenant alignment", score: 68, note: "Green loan trigger 820 t/Cr — on track if battery milestones hold" },
        { label: "Disclosure risk", score: 62, note: "LCA infra spend has zero t savings — needs narrative in BRSR" },
      ],
      flags: ["Two programmes below 1× ROI in year 1 — board-approved strategic list"],
    },
    costCutIdeas: [
      {
        title: "Pause renewable PPA supplier rollout until Tier-1 SBTi hits 55%",
        annualSavingCr: 12,
        effort: "Low",
        detail: "PPA enabler has 5.4× ROI but low absolute t — defer to H2 FY26.",
      },
      {
        title: "Bundle LCA infra with assurance vendor — avoid duplicate SaaS",
        annualSavingCr: 3,
        effort: "Low",
        detail: "Single data lake for PCF + factor governance.",
      },
      {
        title: "Shift ₹18 Cr from LCV non-export steel to green steel export trims",
        annualSavingCr: 18,
        annualSavingT: 45_000,
        effort: "Medium",
        detail: "Maximises CBAM avoidance per ₹ spent.",
      },
    ],
    purchasingStrategies: [
      "Stage-gate capex on intensity ₹/t abatement, not project count.",
      "Tie procurement GM variable comp to Cat 1 intensity −4% YoY.",
    ],
    contractLevers: [
      "Portfolio steering committee monthly — kill or scale decisions.",
    ],
    recommendedActions: [
      "Present reallocation memo to CFO + CSO before Q2 capex lock.",
      "Tag green-loan KPI owners on each programme milestone.",
    ],
    modelTrace: ["Investment pipeline × ROI model", "Shadow carbon ₹920/t", "Green loan covenant sheet"],
  },
  {
    insightId: "inv-ai-portfolio-2",
    severity: "Critical",
    category: "Financing & compliance",
    confidencePct: 91,
    headline: "Shadow carbon cost growth outpaces intensity gain — finance narrative gap",
    riskAnalysis: {
      overallRisk: "Critical",
      compositeIndex: 78,
      dimensions: [
        { label: "Shadow price uplift", score: 80, note: "+3.5% YoY internal carbon price" },
        { label: "Absolute Scope 3", score: 55, note: "−2.3% YoY — positive but slower than price" },
        { label: "Investor disclosure", score: 72, note: "BRSR + green loan need reconciled bridge" },
      ],
      flags: ["₹443 Cr shadow liability FY25 — board asks for avoided cost proof"],
    },
    costCutIdeas: [
      {
        title: "Publish avoided shadow cost bridge in investor pack",
        annualSavingCr: 0,
        effort: "Low",
        detail: "Quantify ₹280 Cr cumulative avoidance from programmes — reduces perceived liability.",
      },
      {
        title: "Accelerate SBTi supplier coverage to cut EEIO uncertainty band",
        annualSavingT: 68_000,
        effort: "High",
        detail: "Each +5 pp SBTi spend reduces confidence interval width ~8%.",
      },
    ],
    purchasingStrategies: [
      "Use shadow price only for capex ranking — not supplier payment terms.",
      "Align green spend tagging with programme IDs in ERP.",
    ],
    contractLevers: [
      "Sustainability-linked loan — document KPI methodology in facility amendment.",
    ],
    recommendedActions: [
      "CFO office to sign off intensity bridge before AGM materials.",
      "Link investment tab metrics to green loan reporting calendar.",
    ],
    modelTrace: ["INTENSITY_OUTCOME.carbonCost series", "Programme saved t rollup", "BRSR Principle 6 draft"],
  },
];

const BY_PROGRAMME: Record<string, IntensityInvestmentAiDossier> = {
  "Battery supply chain": BATTERY_AI,
  "Green steel programme": GREEN_STEEL_AI,
  "Logistics modal shift": LOGISTICS_AI,
  "Recycled aluminium": {
    insightId: "inv-ai-alu",
    linkedProgramme: "Recycled aluminium",
    severity: "Low",
    category: "Circular economy",
    confidencePct: 77,
    headline: "Closed-loop scrap yields cost parity with 8% Cat 1 reduction",
    riskAnalysis: {
      overallRisk: "Low",
      compositeIndex: 38,
      dimensions: [
        { label: "Scrap quality", score: 40, note: "ForgeAlloys alloy separation 94%" },
        { label: "Volume scale", score: 35, note: "38% recycled blend on BIW" },
      ],
      flags: [],
    },
    costCutIdeas: [
      {
        title: "Expand closed-loop to Urban ICE closures",
        annualSavingCr: 11,
        annualSavingT: 18_000,
        effort: "Medium",
        detail: "Same supplier — low incremental capex.",
      },
    ],
    purchasingStrategies: ["Mass-balance certificates per batch", "Price cap vs LME + recycling premium"],
    contractLevers: ["Scrap return obligation in stamping contracts"],
    recommendedActions: ["Pilot 42% blend on Nex BIW in FY26"],
    modelTrace: ["BIW mass model", "Scrap market index"],
  },
  "Supplier SBTi platform": {
    insightId: "inv-ai-sbti",
    linkedProgramme: "Supplier SBTi platform",
    severity: "Medium",
    category: "Engagement ROI",
    confidencePct: 80,
    headline: "Platform spend drives data quality — indirect intensity −1.4 pp",
    riskAnalysis: {
      overallRisk: "Medium",
      compositeIndex: 49,
      dimensions: [
        { label: "Coverage velocity", score: 52, note: "+6 pp SBTi spend YoY" },
        { label: "Tool adoption", score: 46, note: "74% Tier-1 active on portal" },
      ],
      flags: ["LuxTrim not committed — at-risk renewal"],
    },
    costCutIdeas: [
      {
        title: "Bundle SBTi onboarding with PCF refresh — single supplier visit",
        annualSavingCr: 2,
        effort: "Low",
        detail: "Reduces consultant days per supplier.",
      },
    ],
    purchasingStrategies: ["No new Tier-1 without commitment or validated target by FY27"],
    contractLevers: ["SBTi milestone in MSAs — 1% holdback"],
    recommendedActions: ["Escalate LuxTrim by 2025-10-01"],
    modelTrace: ["Supplier engagement CRM", "Spend-weighted coverage"],
  },
  "Renewable energy PPAs": {
    insightId: "inv-ai-ppa",
    linkedProgramme: "Renewable energy PPAs",
    severity: "Low",
    category: "Supplier decarbonisation",
    confidencePct: 74,
    headline: "Highest ROI (5.4×) but small absolute t — sequence after Cat 1 levers",
    riskAnalysis: {
      overallRisk: "Low",
      compositeIndex: 41,
      dimensions: [
        { label: "ROI", score: 30, note: "5.4× — best in portfolio" },
        { label: "Timing", score: 55, note: "Planned status — H2 FY26" },
      ],
      flags: [],
    },
    costCutIdeas: [
      {
        title: "Aggregate top 12 Tier-1 sites into single PPA tender",
        annualSavingCr: 5,
        effort: "Medium",
        detail: "Volume discount on renewable tariff vs site-by-site.",
      },
    ],
    purchasingStrategies: ["Supplier-linked PPA — not plant-only Scope 2"],
    contractLevers: ["RE100 reporting rights for BMM disclosure"],
    recommendedActions: ["Defer go-live until SBTi coverage >55%"],
    modelTrace: ["Site energy baselines", "PPA market curves"],
  },
  "LCA data infra": {
    insightId: "inv-ai-lca",
    linkedProgramme: "LCA data infra",
    severity: "Medium",
    category: "Assurance enabler",
    confidencePct: 82,
    headline: "Zero t savings — required for FY26 limited assurance; avoid duplicate tooling",
    riskAnalysis: {
      overallRisk: "Medium",
      compositeIndex: 54,
      dimensions: [
        { label: "Assurance readiness", score: 60, note: "Factor governance + lineage" },
        { label: "Duplicate spend risk", score: 58, note: "Overlap with assurance vendor SaaS" },
      ],
      flags: ["Board may challenge ROI — position as compliance enabler"],
    },
    costCutIdeas: [
      {
        title: "Consolidate with assurance vendor data room",
        annualSavingCr: 3,
        effort: "Low",
        detail: "Single PCF repository.",
      },
    ],
    purchasingStrategies: ["One factor governance owner — sustainability + IT"],
    contractLevers: ["SLA on factor update latency <30 days"],
    recommendedActions: ["Map to BRSR methodology register IDs"],
    modelTrace: ["Assurance gap list", "Methodology register"],
  },
};

export const INTENSITY_INVESTMENT_AI_INSIGHTS: IntensityInvestmentAiInsightCard[] = [
  {
    id: PORTFOLIO_AI[0]!.insightId,
    title: PORTFOLIO_AI[0]!.headline,
    summary: "Shift capex toward battery and green steel; pause low-impact enablers until H2 FY26.",
    severity: PORTFOLIO_AI[0]!.severity,
    category: PORTFOLIO_AI[0]!.category,
    confidencePct: PORTFOLIO_AI[0]!.confidencePct,
  },
  {
    id: PORTFOLIO_AI[1]!.insightId,
    title: PORTFOLIO_AI[1]!.headline,
    summary: "Shadow carbon liability ₹443 Cr — bridge avoided cost for investors and green loan.",
    severity: PORTFOLIO_AI[1]!.severity,
    category: PORTFOLIO_AI[1]!.category,
    confidencePct: PORTFOLIO_AI[1]!.confidencePct,
  },
  {
    id: BATTERY_AI.insightId,
    title: "Battery route concentration — air freight + cathode risk",
    summary: "Dual-source and sea buffer unlock ₹18 Cr logistics savings and 12.8 kt Cat 4.",
    severity: BATTERY_AI.severity,
    category: BATTERY_AI.category,
    confidencePct: BATTERY_AI.confidencePct,
    linkedProgramme: BATTERY_AI.linkedProgramme,
  },
  {
    id: GREEN_STEEL_AI.insightId,
    title: "Green steel premium vs CBAM avoidance",
    summary: "Export trims recover premium via certificates; extend scope to LCV.",
    severity: GREEN_STEEL_AI.severity,
    category: GREEN_STEEL_AI.category,
    confidencePct: GREEN_STEEL_AI.confidencePct,
    linkedProgramme: GREEN_STEEL_AI.linkedProgramme,
  },
  {
    id: LOGISTICS_AI.insightId,
    title: "Modal shift — sub-1× ROI year 1, strategic mandate",
    summary: "Complete KR air retirement; TW electronics lane next.",
    severity: LOGISTICS_AI.severity,
    category: LOGISTICS_AI.category,
    confidencePct: LOGISTICS_AI.confidencePct,
    linkedProgramme: LOGISTICS_AI.linkedProgramme,
  },
];

function buildGenericInvestmentAi(row: IntensityInvestmentRow): IntensityInvestmentAiDossier {
  const climate = row.climateLinked;
  const severity =
    row.status === "On hold" ? "High" : row.roi != null && row.roi < 1 ? "Medium" : row.spend >= 100 ? "Medium" : "Low";
  return {
    insightId: `inv-ai-${row.id}`,
    linkedProgramme: row.name,
    severity,
    category: row.category,
    confidencePct: climate ? 78 : 71,
    headline: climate
      ? `${row.name} — climate programme; validate abatement claims against PCF and supplier data.`
      : `${row.name} — ₹${row.spend} Cr ${row.investType}; ${row.businessUnit} delivery and capital efficiency review.`,
    riskAnalysis: {
      overallRisk: severity,
      compositeIndex: climate ? 48 : row.spend >= 150 ? 55 : 42,
      dimensions: [
        {
          label: "Capital efficiency",
          score: row.roi != null ? Math.min(90, Math.round(row.roi * 22)) : 50,
          note: row.roi != null ? `Target ROI ${row.roi}× vs hurdle 1.2×` : "Qualitative ROI — compliance or strategic",
        },
        {
          label: "Execution",
          score: row.status === "Active" ? 45 : row.status === "Complete" ? 30 : 58,
          note: `${row.status} — ${row.investType} in ${row.category}`,
        },
        ...(climate
          ? [{ label: "Scope 3 assurance", score: 52, note: "Link spend to Cat 1/4 evidence and factor governance" }]
          : [{ label: "Portfolio fit", score: 40, note: "Not in climate abatement register — P&L and capacity driven" }]),
      ],
      flags:
        row.status === "On hold"
          ? ["Funding gate — escalate to investment committee"]
          : row.roi != null && row.roi < 1
            ? ["Sub-1× ROI year 1 — document strategic rationale"]
            : [],
    },
    costCutIdeas: climate
      ? [
          {
            title: "Bundle supplier negotiations with linked programmes",
            annualSavingCr: Math.max(2, Math.round(row.spend * 0.08)),
            annualSavingT: row.saved > 0 ? Math.round(row.saved * 0.05) : undefined,
            effort: "Medium",
            detail: "Cross-programme volume for steel, cells, or logistics lanes.",
          },
        ]
      : [
          {
            title: "Phase rollout — defer non-critical scope to H2",
            annualSavingCr: Math.max(3, Math.round(row.spend * 0.06)),
            effort: "Low",
            detail: "Preserve strategic scope; smooth cash outflow.",
          },
          {
            title: "Vendor consolidation on shared systems integrator",
            annualSavingCr: Math.max(1, Math.round(row.spend * 0.03)),
            effort: "Medium",
            detail: "Reduce duplicate SI and license spend across plants.",
          },
        ],
    purchasingStrategies: climate
      ? ["Require supplier-specific PCF or SBTi for incremental spend", "Tie milestones to intensity KPIs in MSAs"]
      : [
          `${row.investType} governed under capex committee threshold (>₹25 Cr board)`,
          "Benchmark unit economics vs. prior plant tranches",
        ],
    contractLevers: climate
      ? ["Holdback until verified emission reduction", "Index-linked material clauses where applicable"]
      : ["Fixed-price EPC where possible", "Milestone-based payments tied to capacity or homologation gates"],
    recommendedActions: [
      `Confirm ${row.businessUnit} owner and FY25 gate date`,
      climate ? "Map spend to scope 3 category ledger for BRSR" : "Track IRR separately from climate portfolio",
    ],
    modelTrace: [row.id, row.category, row.investType, "FY24 investment register"],
  };
}

export function getInvestmentAiDossier(programmeName: string): IntensityInvestmentAiDossier | undefined {
  if (BY_PROGRAMME[programmeName]) return BY_PROGRAMME[programmeName];
  const row = INTENSITY_INVEST.find((r) => r.name === programmeName);
  return row ? buildGenericInvestmentAi(row) : undefined;
}

export function getInvestmentAiDossierById(insightId: string): IntensityInvestmentAiDossier | undefined {
  const fromProgramme = Object.values(BY_PROGRAMME).find((d) => d.insightId === insightId);
  if (fromProgramme) return fromProgramme;
  return PORTFOLIO_AI.find((d) => d.insightId === insightId);
}
