import type {
  CarbonLensBlock,
  CarbonLensDrillEvidenceLine,
  CarbonLensFinancedSlice,
  CarbonLensGreenSlice,
  CarbonLensClimateSlice,
  CarbonLensLeafId,
  CarbonLensLineItem,
  CarbonLensLineItemDrill,
  CarbonLensOwnOperationSlice,
} from "./types";

type SliceKind = "financed" | "own" | "green" | "climate";

function pillarForLeaf(leaf: CarbonLensLeafId): SliceKind {
  if (leaf in { portfolio_overview: 1, corporate_loans: 1, project_finance: 1, retail_loans: 1, msme_loans: 1, trade_finance: 1, investment_portfolio: 1 })
    return "financed";
  if (leaf in { business_travel: 1, employee_commuting: 1, purchased_goods_services: 1, it_data_centers: 1, waste_capital_goods: 1 }) return "own";
  if (leaf in { carbon_green_loans: 1, carbon_green_bonds: 1, carbon_green_deposits: 1, carbon_sustainability_linked_loans: 1 }) return "green";
  return "climate";
}

function exposurePath(leaf: CarbonLensLeafId, sliceTitle: string, item: CarbonLensLineItem): string {
  const pillar = pillarForLeaf(leaf);
  const labels: Record<SliceKind, string> = {
    financed: "Financed emissions (Cat. 15)",
    own: "Own operations (Scope 3)",
    green: "Green finance taxonomy",
    climate: "Climate risk register",
  };
  return `${labels[pillar]} → ${sliceTitle} → ${item.label}`;
}

function parsePcafFromMetric3(metric3?: string): CarbonLensLineItemDrill["pcafDetail"] | undefined {
  if (!metric3) return undefined;
  const m = metric3.match(/PCAF\s*([\d.]+)/i) ?? metric3.match(/Score\s*([\d.]+)/i);
  if (!m) return undefined;
  const score = Number(m[1]);
  const option = score <= 2 ? "Option 1–2 (reported / verified)" : score <= 3 ? "Option 3 (physical activity)" : "Option 4–5 (proxy / EEIO)";
  return {
    scoreLabel: metric3,
    option,
    dataVintage: "FY2025 Q3 inventory lock",
    confidence: score <= 2.5 ? "High" : score <= 3.5 ? "Medium" : "Low",
  };
}

function lineItemDrill(
  leaf: CarbonLensLeafId,
  sliceTitle: string,
  item: CarbonLensLineItem,
  sliceMeta: { methodology?: string; pcafBand?: string; scope3Category?: string; complianceNote?: string; regulatoryRef?: string },
): CarbonLensLineItemDrill {
  const pillar = pillarForLeaf(leaf);
  const risk = item.risk ?? "Medium";
  const baseNarrative =
    item.detail ??
    (pillar === "financed"
      ? `Attributed financed emissions line for “${item.label}”. Figures reconcile to the bank’s PCAF inventory and sector explorer; engagement priority follows materiality × data-quality score.`
      : pillar === "own"
        ? `Operational Scope 3 line for “${item.label}” mapped to ${sliceMeta.scope3Category ?? "GHG Protocol category cluster"}.`
        : pillar === "green"
          ? `Green finance use-of-proceeds / taxonomy line for “${item.label}” with third-party verification status tracked for BRSR / RBI disclosures.`
          : `Climate risk register entry for “${item.label}” with horizon and magnitude aligned to ICAAP climate supplement.`);

  const m1 = item.metric1;
  const m2 = item.metric2 ?? "—";
  const m3 = item.metric3 ?? "—";

  const breakdown: CarbonLensLineItemDrill["breakdown"] = [
    { label: "Primary metric", value: m1, sharePct: 55 },
    { label: "Secondary metric", value: m2, sharePct: 30 },
    { label: "Quality / intensity", value: m3, sharePct: 15 },
  ];

  const dataLayer: CarbonLensDrillEvidenceLine[] = [
    { label: "Inventory owner", value: pillar === "financed" ? "Climate Risk & ESG COE" : pillar === "own" ? "Facilities & procurement" : "Green finance PMO", status: "ok" },
    { label: "EF / factor lock", value: "BABL-EF-2025.09", status: "ok" },
    {
      label: "Assurance",
      value: pillar === "financed" ? "Limited assurance sample FY25 (Cat. 15)" : "Management review — operational Cat 1–8",
      status: risk === "High" ? "warning" : "ok",
    },
    { label: "Evidence store", value: `INV-CL-${item.id.toUpperCase()}`, status: "ok" },
    ...(sliceMeta.complianceNote
      ? [{ label: "Disclosure tie-in", value: sliceMeta.complianceNote.slice(0, 120) + (sliceMeta.complianceNote.length > 120 ? "…" : ""), status: "warning" as const }]
      : []),
  ];

  const methodology: string[] = [
    sliceMeta.methodology ?? "GHG Protocol / PCAF FI Standard (illustrative).",
    pillar === "financed"
      ? "Attribution: loan outstanding ÷ enterprise value × borrower Scope 1+2 where reported."
      : pillar === "own"
        ? "Activity data or spend-based allocation per category methodology note."
        : pillar === "green"
          ? "Use-of-proceeds tracking with independent verification where required."
          : "Scenario-weighted risk register linked to collateral and sector pathways.",
    ...(sliceMeta.pcafBand ? [`PCAF band for slice: ${sliceMeta.pcafBand}.`] : []),
    ...(sliceMeta.regulatoryRef ? [sliceMeta.regulatoryRef] : []),
  ];

  const openFindings =
    risk === "High"
      ? [
          "Primary data gap on tail names — sector proxy applied with 35% uncertainty haircut.",
          "Engagement letter for FY26 disclosure not yet signed for top-3 relationships in this sleeve.",
        ]
      : risk === "Medium"
        ? ["Secondary verification pending on one counterparty submission (demo)."]
        : ["No material open findings on this line in the demo assurance pack."];

  const engagement =
    pillar === "financed" || pillar === "climate"
      ? {
          status: risk === "High" ? "Active — RM + ESG joint" : risk === "Medium" ? "Scheduled Q1 FY26" : "Closed — annual review",
          owner: pillar === "financed" ? "Corporate RM + Climate Risk" : "CRO office",
          nextReview: "2026-03-31",
          covenant: risk === "High" ? "Climate KPI covenant monitoring enabled" : undefined,
        }
      : undefined;

  return {
    narrative: baseNarrative,
    exposurePath: exposurePath(leaf, sliceTitle, item),
    methodology,
    breakdown,
    dataLayer,
    controls: [
      "CL-C-01: PCAF score change control before restatement.",
      "CL-C-04: Credit file climate fields mandatory for high-risk sectors.",
      "CL-C-09: Evidence pack hash logged to controls audit trail.",
    ],
    openFindings,
    pcafDetail: pillar === "financed" ? parsePcafFromMetric3(item.metric3) : undefined,
    engagement,
    evidencePack: [
      { doc: `PCAF working paper — ${item.id}`, dated: "2025-09-15", reliedUpon: "Attribution recalculation" },
      { doc: "Credit memo climate annex (redacted)", dated: "2025-08-02", reliedUpon: "Exposure validation" },
      { doc: "Supplier / borrower questionnaire FY25", dated: "2025-07-20", reliedUpon: "Primary activity data" },
    ],
    suggestedActions: [
      risk === "High"
        ? "Escalate to Top-50 emitter engagement queue; align with NZBA sector pathway review."
        : "Maintain in watchlist; refresh at next quarterly inventory lock.",
      "Link to AI insights queue for narrative consistency across board pack.",
    ],
  };
}

function attachLineItems<T extends { leaf: CarbonLensLeafId; title: string; lineItems: CarbonLensLineItem[] }>(
  slice: T,
  meta: { methodology?: string; pcafBand?: string; scope3Category?: string; complianceNote?: string; regulatoryRef?: string },
): T {
  return {
    ...slice,
    lineItems: slice.lineItems.map((item) => ({
      ...item,
      drill: lineItemDrill(slice.leaf, slice.title, item, meta),
    })),
  };
}

function attachFinancedSlice(s: CarbonLensFinancedSlice): CarbonLensFinancedSlice {
  return attachLineItems(s, { methodology: s.methodology, pcafBand: s.pcafBand });
}

function attachOwnSlice(s: CarbonLensOwnOperationSlice): CarbonLensOwnOperationSlice {
  return attachLineItems(s, { methodology: s.methodology, scope3Category: s.scope3CategoryLabel });
}

function attachGreenSlice(s: CarbonLensGreenSlice): CarbonLensGreenSlice {
  return attachLineItems(s, { complianceNote: s.complianceNote });
}

function attachClimateSlice(s: CarbonLensClimateSlice): CarbonLensClimateSlice {
  return attachLineItems(s, { regulatoryRef: s.regulatoryRef });
}

export function buildAssetClassDrill(
  asset: { id: string; name: string; outstandingINRCr: number; attributedTCO2e: number; pcafScore: number },
): import("./types").CarbonLensAssetClassDrill {
  const mt = asset.attributedTCO2e / 1_000_000;
  return {
    assetClassId: asset.id,
    name: asset.name,
    outstandingINRCr: asset.outstandingINRCr,
    attributedTCO2e: asset.attributedTCO2e,
    pcafScore: asset.pcafScore,
    narrative: `${asset.name} contributes ${mt.toFixed(2)} Mt of attributed financed emissions in the FY25 inventory. PCAF score ${asset.pcafScore} reflects the primary vs proxy data mix for this sleeve.`,
    methodology: [
      "PCAF asset-class attribution per Financial Institutions Standard.",
      "Borrower Scope 1+2 where reported; sector EEIO proxies for non-disclosing names.",
      "Reconciliation to executive Category 15 roll-up and Sectors explorer.",
    ],
    topCounterparties: [
      { name: `${asset.name} — concentration A`, exposureCr: Math.round(asset.outstandingINRCr * 0.14), tco2e: Math.round(asset.attributedTCO2e * 0.22), pcafScore: Math.max(1, asset.pcafScore - 1) },
      { name: `${asset.name} — concentration B`, exposureCr: Math.round(asset.outstandingINRCr * 0.11), tco2e: Math.round(asset.attributedTCO2e * 0.17), pcafScore: asset.pcafScore },
      { name: "Diversified tail", exposureCr: Math.round(asset.outstandingINRCr * 0.75), tco2e: Math.round(asset.attributedTCO2e * 0.61), pcafScore: Math.min(5, asset.pcafScore + 1) },
    ],
    dataLayer: [
      { label: "Outstanding (₹ Cr)", value: asset.outstandingINRCr.toLocaleString("en-IN"), status: "ok" },
      { label: "Attributed tCO₂e", value: asset.attributedTCO2e.toLocaleString("en-IN"), status: "ok" },
      { label: "PCAF score", value: String(asset.pcafScore), status: asset.pcafScore <= 3 ? "ok" : "warning" },
      { label: "Inventory lock", value: "FY2025 Q3", status: "ok" },
    ],
    controls: [
      "FE-AC-02: Asset-class mapping to general ledger codes.",
      "FE-AC-05: PCAF restatement approval workflow.",
    ],
  };
}

export function attachCarbonLensDrills(data: CarbonLensBlock): CarbonLensBlock {
  const financed = Object.fromEntries(
    Object.entries(data.financed).map(([k, v]) => [k, attachFinancedSlice(v)]),
  ) as CarbonLensBlock["financed"];

  const ownOperations = Object.fromEntries(
    Object.entries(data.ownOperations).map(([k, v]) => [k, attachOwnSlice(v)]),
  ) as CarbonLensBlock["ownOperations"];

  const green = Object.fromEntries(
    Object.entries(data.green).map(([k, v]) => [k, attachGreenSlice(v)]),
  ) as CarbonLensBlock["green"];

  const climate = Object.fromEntries(
    Object.entries(data.climate).map(([k, v]) => [k, attachClimateSlice(v)]),
  ) as CarbonLensBlock["climate"];

  return { ...data, financed, ownOperations, green, climate };
}
