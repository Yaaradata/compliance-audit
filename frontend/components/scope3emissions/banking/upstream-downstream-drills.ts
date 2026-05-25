import type {
  UpstreamDownstreamBorrowerDrillMock,
  UpstreamDownstreamCategoryBarRow,
  UpstreamDownstreamCategoryDrillMock,
  UpstreamDownstreamDrillEvidenceLineMock,
  UpstreamDownstreamMockData,
  UpstreamDownstreamMoneyFlowSegmentMock,
  UpstreamDownstreamMoneySegmentDrillMock,
  UpstreamDownstreamPcafBorrowerMock,
  UpstreamDownstreamScatterPointMock,
  UpstreamDownstreamSupplierDrillMock,
  UpstreamDownstreamSectorPointDrillMock,
} from "./types";

function fmt(n: number): string {
  return n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function categoryDrill(c: UpstreamDownstreamCategoryBarRow): UpstreamDownstreamCategoryDrillMock {
  const total = Math.max(1, c.tco2e);
  const s1 = Math.round(total * 0.42);
  const s2 = Math.round(total * 0.31);
  const s3 = total - s1 - s2;
  const sites = [
    { name: "Mumbai HQ + branches (IN)", tco2e: s1, sharePct: Math.round((s1 / total) * 100), note: "Metered where available" },
    { name: "Gujarat / Dahej ops (IN)", tco2e: s2, sharePct: Math.round((s2 / total) * 100), note: "Grid CEA 2024 factors" },
    { name: "Other India sites", tco2e: s3, sharePct: Math.max(0, 100 - Math.round((s1 / total) * 100) - Math.round((s2 / total) * 100)) },
  ];
  const dataLayer: UpstreamDownstreamDrillEvidenceLineMock[] = [
    { label: "Activity data owner", value: "Facilities & procurement COE", status: "ok" },
    { label: "EF lock version", value: "BABL-EF-2025.09 (CEA grid + DEFRA travel)", status: "ok" },
    { label: "Allocation rule", value: "Headcount × floor-area hybrid for Cat 7 / 8 split", status: "warning" },
    { label: "Assurance", value: "Limited assurance on Cat 6 sample (FY25)", status: c.flagLabel ? "warning" : "ok" },
    { label: "Evidence store", value: `INV-UD-CAT-${c.id.toUpperCase()}`, status: "ok" },
  ];
  return {
    narrative: `Line-level inventory narrative for “${c.label}”. Figures roll into the bank’s operational Scope 3 boundary; financed (Category 15) emissions are excluded here.`,
    methodology: [
      "GHG Protocol Corporate Value Chain (Scope 3) Standard — operational control boundary.",
      "India-specific electricity emission factors per CEA 2024; market-based where PPAs are contracted.",
      "Travel: ICAO Carbon Calculator + class-of-service uplift for international legs.",
    ],
    sites,
    dataLayer,
    controls: [
      "S3-C-02: EF registry change control — version tagged before restatement.",
      "S3-C-06: Lineage from AP ledger → allocation engine → disclosure tables.",
      "Quarterly variance review when category moves >8% vs prior quarter.",
    ],
    openFindings: c.flagLabel
      ? [`${c.flagLabel} — root-cause ticket linked to travel policy reset (demo).`, "Retrofit hybrid commuting survey scheduled Q1 FY26."]
      : ["No material open findings on this category cluster in the demo pack."],
  };
}

function supplierDrill(s: {
  supplier: string;
  supply: string;
  spendCr: number;
  tco2e: number;
  category: string;
}): UpstreamDownstreamSupplierDrillMock {
  const t = Math.max(1, s.tco2e);
  const b1 = Math.round(t * 0.55);
  const b2 = Math.round(t * 0.25);
  const b3 = t - b1 - b2;
  return {
    vendorId: `VND-${Math.abs(s.supplier.split("").reduce((a, ch) => a + ch.charCodeAt(0), 0)) % 90000 + 10000}`,
    contractId: `PO-${s.category.replace(/\s+/g, "")}-${String(s.spendCr).slice(0, 4)}-FY25`,
    spendFY: "FY2025 (1 Apr 2024 – 31 Mar 2025)",
    efSource:
      s.category.includes("Scope 2") || s.supplier.includes("Power")
        ? "CEA 2024 grid residual mix + BEE PAT trajectory overlay for large branches"
        : "Hybrid: supplier PCF where available; else EEIO 2025 desk factors (INR spend)",
    scope2MarketBasedNote:
      s.category.includes("Scope 2") || s.supplier.includes("Power")
        ? "Market-based adjustment applied for Mumbai HQ PPA slice (~18% of kWh)."
        : undefined,
    breakdown: [
      { label: "Stationary combustion / grid", tco2e: b1, pct: Math.round((b1 / t) * 100) },
      { label: "Upstream fuel & T&D loss", tco2e: b2, pct: Math.round((b2 / t) * 100) },
      { label: "Other (miscellaneous)", tco2e: b3, pct: Math.max(0, 100 - Math.round((b1 / t) * 100) - Math.round((b2 / t) * 100)) },
    ],
    submissionStatus: s.tco2e > 1500 ? "Verified pack — FY25 Q3" : "Submitted — queries on allocation",
    reviewerNote: `Concentration check: ${s.supplier} represents a material share of ${s.category} mass; re-run if FY26 tariff band changes.`,
  };
}

function moneySegmentDrill(s: UpstreamDownstreamMoneyFlowSegmentMock): UpstreamDownstreamMoneySegmentDrillMock {
  const top = [
    { name: `${s.label} — top counterparty A`, exposureCr: Math.round(s.exposureCr * 0.14), tco2e: Math.round(s.tco2e * 0.22), sector: "Illustrative" },
    { name: `${s.label} — top counterparty B`, exposureCr: Math.round(s.exposureCr * 0.11), tco2e: Math.round(s.tco2e * 0.17), sector: "Illustrative" },
    { name: `${s.label} — diversified tail`, exposureCr: Math.round(s.exposureCr * 0.75), tco2e: Math.round(s.tco2e * 0.61), sector: "Blend" },
  ];
  return {
    bookShareNarrative: `${s.label} represents ${s.pctBook}% of financed book exposure in this mock. PCAF data-quality score ${s.pcafScore} drives confidence bands on attributed tCO₂e.`,
    topConcentrations: top,
    pcafRationale: [
      `Score ${s.pcafScore}: reflects primary vs modelled data mix for the sleeve (PCAF Option 1–5 analog).`,
      "Attribution uses loan-outstanding / enterprise value share per PCAF FI Standard (demo).",
      "Where audited Scope 1+2 is missing, sector intensity priors are blended with a 35% haircut for NZBA sensitivity.",
    ],
    limitsAndMitigants: [
      "Single-name concentration monitored vs RBI large-exposure norms (illustrative).",
      "Sector caps for coal / thermal power new origination post FY25 policy refresh.",
      "Covenant library: transition KPIs on select project-finance tickets.",
    ],
    stressCase: `Severe disorder scenario (+180 bp spreads): attributed ${s.label} tCO₂e +~${fmt(Math.round(s.tco2e * 0.06))} in desk stress (demo).`,
  };
}

function sectorDrill(p: UpstreamDownstreamScatterPointMock): UpstreamDownstreamSectorPointDrillMock {
  return {
    macroLink: `${p.sector}: exposure ₹ ${fmt(p.exposureCr)} Cr vs intensity ${fmt(p.intensityPerCr)} tCO₂e per ₹ Cr — quadrant ${p.quadrant} read from portfolio risk grid.`,
    policyHooks: [
      "RBI climate risk disclosure alignment — sectoral heatmap inputs.",
      "NZBA sector pathway benchmark (2025 vintage) for intensity bands.",
      "Internal credit memo field: “transition credibility” score (not shown).",
    ],
    topBorrowers: [
      { name: `${p.sector} — anchor borrower 1`, exposureCr: Math.round(p.exposureCr * 0.2), pcafScore: p.quadrant === "BR" ? 2 : 3 },
      { name: `${p.sector} — anchor borrower 2`, exposureCr: Math.round(p.exposureCr * 0.12), pcafScore: p.quadrant === "TR" ? 4 : 3 },
      { name: `${p.sector} — tail basket`, exposureCr: Math.round(p.exposureCr * 0.68), pcafScore: 3 },
    ],
    watchSignals:
      p.quadrant === "TR"
        ? ["High carbon + high exposure — quarterly RM review.", "Escalate if PCAF score drifts >0.5 YoY."]
        : p.quadrant === "TL"
          ? ["Watchlist: low rupee exposure but outsized intensity.", "Test divestment / hedge playbook."]
          : p.quadrant === "BR"
            ? ["Preferred growth sleeve subject to transition verification.", "Track greenwashing flags on labelled instruments."]
            : ["Monitor for data completeness; avoid false comfort on low intensity."],
  };
}

function borrowerDrill(b: UpstreamDownstreamPcafBorrowerMock): UpstreamDownstreamBorrowerDrillMock {
  const ev = Math.max(1, b.totalDebtPlusMarketCapCr);
  const loanShare = ((b.loanOutstandingCr / ev) * 100).toFixed(2);
  return {
    attributionSteps: [
      { label: "1. Borrower-reported Scope 1+2", detail: "Annual report / CDP / regulatory filing", value: `${fmt(b.borrowerScope12TCO2e)} tCO₂e` },
      { label: "2. Enterprise value (debt + mcap)", detail: "Closing FY25 — demo snapshot", value: `₹ ${fmt(b.totalDebtPlusMarketCapCr)} Cr` },
      { label: "3. Bank loan share of EV", detail: "Outstanding / EV", value: `${loanShare}%` },
      { label: "4. Attribution factor", detail: "PCAF attribution % applied", value: `${b.attributionPct}%` },
      { label: "5. Financed emissions (attributed)", detail: "Scope 1+2 × loan share × attribution", value: `${fmt(b.attributedTCO2e)} tCO₂e` },
    ],
    evidencePack: [
      { doc: "Borrower FY25 sustainability report.pdf", dated: "2025-08-12", reliedUpon: "Scope 1+2 totals" },
      { doc: "Facility letter + covenant schedule", dated: "2024-11-03", reliedUpon: "Loan balance / currency" },
      { doc: "Market data — EV bridge worksheet", dated: "2025-03-31", reliedUpon: "Debt + market cap" },
      { doc: `PCAF workpaper ${b.id.toUpperCase()}`, dated: "2025-09-20", reliedUpon: `Score ${b.pcafScore} — ${b.pcafLabel}` },
    ],
    dataGaps:
      b.pcafScore >= 4
        ? ["Sector proxy used for part of Scope 1 where meter gaps exist.", "Awaiting FY26 assurance letter for restatement."]
        : ["Minor timing mismatch: borrower FY ends Dec; bank FY Mar — aligned with 3-mo lag rule."],
    engagementStatus:
      b.attributedTCO2e > 200_000 ? "Tier-1 engagement — quarterly climate committee" : "Standard monitoring — annual questionnaire",
    nextReview: b.pcafScore >= 4 ? "Data uplift review: 2026-02-15" : "Desktop renewal: 2026-05-30",
  };
}

/** Attach illustrative deep-drill payloads for upstream categories/suppliers and downstream segments/sectors/borrowers. */
export function attachUpstreamDownstreamDrills(data: UpstreamDownstreamMockData): UpstreamDownstreamMockData {
  return {
    ...data,
    upstream: {
      ...data.upstream,
      categories: data.upstream.categories.map((c) => ({ ...c, drill: categoryDrill(c) })),
      suppliers: data.upstream.suppliers.map((s) => ({ ...s, drill: supplierDrill(s) })),
    },
    downstream: {
      ...data.downstream,
      moneyFlowSegments: data.downstream.moneyFlowSegments.map((s) => ({ ...s, drill: moneySegmentDrill(s) })),
      scatterPoints: data.downstream.scatterPoints.map((p) => ({ ...p, drill: sectorDrill(p) })),
      pcafBorrowers: data.downstream.pcafBorrowers.map((b) => ({ ...b, drill: borrowerDrill(b) })),
    },
    engagement: data.engagement,
    trend: data.trend,
  };
}
