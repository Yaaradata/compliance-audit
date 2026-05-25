import type {
  ProcurementPriorityLevel,
  Scope3RequiredLevel,
  Scope3SupplierEvaluation,
  SupplierRow,
} from "./types";

/** Segments treated as energy- / chemistry- / logistics-intensive for Category 1–4 / 9 triggers (deterministic rule). */
const HIGH_EMBISSION_SEGMENT: RegExp[] = [
  /api/i,
  /intermediate/i,
  /chemical/i,
  /logistics/i,
  /hazmat/i,
  /cold chain/i,
  /steam|utilities/i,
  /ocean freight/i,
  /waste/i,
  /sterile/i,
  /packaging/i,
  /export packaging/i,
  /contract research/i,
  /downstream logistics/i,
];

export function segmentIsHighEmissionIntensity(segment: string): boolean {
  return HIGH_EMBISSION_SEGMENT.some((re) => re.test(segment));
}

function criticalityScore(risk: SupplierRow["risk"]): number {
  if (risk === "High") return 3;
  if (risk === "Medium") return 2;
  return 1;
}

/**
 * Procurement Scope 3 trigger engine (illustrative): combines spend materiality, emission-intensity segment,
 * and supplier criticality. `risk` (Low / Medium / High) proxies operational / sourcing criticality for
 * GHG Protocol Category 1–8 tracking obligation — align with your enterprise supplier tiering when available.
 */
export function deriveScope3Required(s: Pick<SupplierRow, "annualSpendCr" | "segment" | "risk" | "scope3ContributionTCO2e">): Scope3RequiredLevel {
  const spend = s.annualSpendCr;
  const t = s.scope3ContributionTCO2e;
  const highSeg = segmentIsHighEmissionIntensity(s.segment);
  const crit = criticalityScore(s.risk);

  const fullProgram =
    (spend >= 100 && (highSeg || crit >= 2)) ||
    t >= 120_000 ||
    (spend >= 60 && highSeg && crit >= 2) ||
    (s.risk === "High" && spend >= 18 && (highSeg || t >= 25_000));

  if (fullProgram) return "Yes";

  const partial =
    (spend >= 15 && (highSeg || crit >= 2 || t >= 35_000)) ||
    (spend >= 8 && highSeg) ||
    (t >= 18_000 && crit >= 2);

  if (partial) return "Partial";

  return "No";
}

export function deriveProcurementPriority(
  s: Pick<SupplierRow, "annualSpendCr" | "risk" | "scope3ContributionTCO2e" | "segment">,
  scope3Required: Scope3RequiredLevel,
): ProcurementPriorityLevel {
  if (scope3Required === "No") return "Low";
  const highSeg = segmentIsHighEmissionIntensity(s.segment);
  const high =
    s.risk === "High" ||
    s.annualSpendCr >= 200 ||
    s.scope3ContributionTCO2e >= 150_000 ||
    (scope3Required === "Yes" && highSeg && s.annualSpendCr >= 80);
  if (high) return "High";
  if (scope3Required === "Yes" || s.annualSpendCr >= 40 || s.scope3ContributionTCO2e >= 50_000) return "Medium";
  return "Low";
}

function dataQualityProcessScore(q: SupplierRow["dataQuality"]): number {
  switch (q) {
    case "Primary":
      return 88;
    case "Secondary":
      return 72;
    case "Spend-Based":
      return 56;
    default:
      return 42;
  }
}

/** Deterministic Scope 3 supplier evaluation for assurance / sourcing governance (illustrative scores). */
export function deriveScope3SupplierEvaluation(s: Pick<SupplierRow, "id" | "esgScore" | "dataGaps" | "dataQuality" | "scope3ContributionTCO2e" | "risk" | "submissionStatus">): Scope3SupplierEvaluation {
  let h = 0;
  for (let i = 0; i < s.id.length; i++) {
    h = (h * 33 + s.id.charCodeAt(i)) >>> 0;
  }
  const jitter = (h % 7) - 3;
  const vendorScore = Math.max(0, Math.min(100, s.esgScore + jitter));

  const gapPenalty = Math.min(55, s.dataGaps.length * 14);
  const materialScore = Math.max(0, Math.min(100, 92 - gapPenalty + (h % 5)));

  const processScore = Math.max(0, Math.min(100, dataQualityProcessScore(s.dataQuality) - (s.submissionStatus === "Overdue" ? 18 : s.submissionStatus === "Pending" ? 10 : 0)));

  const impactRaw = Math.min(100, Math.round(s.scope3ContributionTCO2e / 2500));
  const impactScore = Math.max(18, Math.min(100, impactRaw + (s.risk === "High" ? 12 : 0)));

  const composite = (vendorScore + materialScore + processScore + (100 - impactScore * 0.35)) / 3.4;
  const compositeIndex = Math.max(0, Math.min(100, Math.round(composite)));
  let overallRisk: Scope3SupplierEvaluation["overallRisk"];
  if (composite >= 78) overallRisk = "Low";
  else if (composite >= 64) overallRisk = "Medium";
  else if (composite >= 50) overallRisk = "High";
  else overallRisk = "Critical";

  return { vendorScore, materialScore, processScore, impactScore, compositeIndex, overallRisk };
}

export type SupplierRowSeed = Omit<SupplierRow, "scope3Required" | "procurementPriority" | "scope3Evaluation">;

export function attachProcurementScope3Fields(s: SupplierRowSeed): SupplierRow {
  const scope3Required = deriveScope3Required(s);
  const procurementPriority = deriveProcurementPriority(s, scope3Required);
  const scope3Evaluation = deriveScope3SupplierEvaluation(s);
  return { ...s, scope3Required, procurementPriority, scope3Evaluation };
}

/**
 * Deterministic purchasing playbooks for the supplier scorecard (AI-style): combines spend, Scope 3 obligation,
 * data posture, submission behaviour, risk, and segment intensity — not legal or commercial advice.
 */
export function derivePurchasingStrategies(s: SupplierRow): string[] {
  const highSeg = segmentIsHighEmissionIntensity(s.segment);
  const candidates: string[] = [];

  if (s.procurementPriority === "High") {
    candidates.push(
      "Run this account as tier-1: executive-sponsored QBRs, a joint Scope 3 / cost roadmap, and a single accountable counterpart on each side before any major volume or price reset.",
    );
  }

  if (s.scope3Required === "Yes") {
    candidates.push(
      "Embed GHG Protocol–aligned Scope 3 evidence (activity data, PCF or equivalent, and change log) as contract materiality with clear delivery gates tied to volume releases or price index steps.",
    );
  } else if (s.scope3Required === "Partial") {
    candidates.push(
      "Pilot a bounded SKU or lane with full Category 1–4 documentation first; expand only after one clean inventory close so spend-based proxies do not dominate assurance.",
    );
  }

  if (s.dataQuality === "Spend-Based" || s.dataQuality === "Not Assessed") {
    candidates.push(
      "Next competitive event: set a minimum data-quality tier (supplier-specific factors or better) in technical evaluation so commercial award does not lock in weak inventory positions.",
    );
  } else if (s.dataQuality === "Secondary") {
    candidates.push(
      "Negotiate a time-bound uplift to primary data (metered energy, mass balance, or verified PCF) with cost-neutral phasing across two contract cycles.",
    );
  }

  if (s.submissionStatus === "Overdue" || s.submissionStatus === "Pending") {
    candidates.push(
      "Gate incremental POs or call-offs on a complete ESG / Scope 3 submission pack; use staged releases and written remediation milestones instead of blanket suspension where continuity matters.",
    );
  }

  if (s.risk === "High") {
    candidates.push(
      "Prefer milestone billing, dual qualification of backup capacity, and explicit service / quality SLAs — keep commercial leverage until delivery and data performance stabilise.",
    );
  }

  if (s.annualSpendCr >= 90) {
    candidates.push(
      "Pursue a multi-year framework with indexed mechanics and volume corridors so you can consolidate spend, share assurance costs, and avoid annual re-tender noise on high materiality lines.",
    );
  } else if (s.annualSpendCr >= 25 && s.annualSpendCr < 90) {
    candidates.push(
      "Bundle adjacent categories or sites into one negotiation wave to improve unit economics and reduce duplicate Scope 3 questionnaires across the same supplier entity.",
    );
  }

  if (highSeg) {
    candidates.push(
      "For emission-intensive segments, add logistics / energy optimisation SLAs and joint improvement targets (e.g. load consolidation, modal shift) alongside price — improves both cost and inventory defensibility.",
    );
  }

  if (s.esgScore >= 80 && s.submissionStatus === "Verified") {
    candidates.push(
      "Lean into partnership: co-fund innovation pilots (packaging light-weighting, low-carbon routes) with shared KPIs so procurement captures value while deepening primary emissions data.",
    );
  } else if (s.esgScore < 62) {
    candidates.push(
      "Pair commercial awards with a corrective action plan: measurable ESG and data milestones, clear default remedies, and re-pricing or volume shift rights if targets are missed.",
    );
  }

  const seen = new Set<string>();
  const unique = candidates.filter((line) => {
    if (seen.has(line)) return false;
    seen.add(line);
    return true;
  });

  const fallbacks = [
    "Maintain structured benchmarking (RFQ + incumbent) on total cost of ownership including implied carbon and data cost, not unit price alone.",
    "Standardise payment and incoterms across regions to simplify logistics emissions modelling and reduce Category 4 reconciliation effort at year-end.",
    "Use shorter initial contract tails with renewal tied to verified performance — preserves flexibility without punishing suppliers who invest in better data.",
  ];

  let i = 0;
  while (unique.length < 3 && i < fallbacks.length) {
    const f = fallbacks[i++];
    if (!seen.has(f)) {
      seen.add(f);
      unique.push(f);
    }
  }

  return unique.slice(0, 3);
}

/**
 * Contract negotiation angles for the supplier scorecard (AI-style): clauses and levers aligned to Scope 3
 * assurance and procurement risk — illustrative only; legal review required for binding terms.
 */
export function deriveContractNegotiationPoints(s: SupplierRow): string[] {
  const highSeg = segmentIsHighEmissionIntensity(s.segment);
  const candidates: string[] = [];

  if (s.scope3Required !== "No") {
    candidates.push(
      "Require supplier representations on accuracy of activity data, emission factors used, and alignment to your published GHG inventory boundary; tie repeatability to a defined methodology version and change log.",
    );
  }

  if (s.dataQuality !== "Primary") {
    candidates.push(
      "Negotiate a cooperation covenant: reasonable access to facilities / systems, timely responses to data assurance questionnaires, and remedy periods if BRSR or CDP submissions are blocked by missing supplier evidence.",
    );
  }

  if (s.procurementPriority === "High" || s.annualSpendCr >= 120) {
    candidates.push(
      "Carve out uncapped or higher-cap liability for wilful misstatement of emissions data or certifications where such statements feed regulated disclosures — balance against commercial caps on operational defaults.",
    );
  }

  if (s.risk === "High" || s.submissionStatus === "Overdue") {
    candidates.push(
      "Include step-in rights or accelerated termination for persistent failure to meet documented Scope 3 submission milestones, with clear cure periods and volume ramp-down schedules.",
    );
  }

  if (highSeg) {
    candidates.push(
      "Add contract schedules for logistics and energy intensity (e.g. GLEC-aligned reporting where applicable) with annual improvement floors and neutral third-party measurement where disputes arise on methodology.",
    );
  }

  if (s.brsrMapped === false) {
    candidates.push(
      "Make BRSR value-chain mapping and timely provision of India disclosure schedules a contractual deliverable with named owners and dates, not an informal side letter.",
    );
  }

  if (s.esgScore >= 75) {
    candidates.push(
      "Offer balanced mutual commitments: longer tenure or volume commitments in exchange for locked PCF refresh cadence and first refusal on next-generation lower-carbon SKUs.",
    );
  } else {
    candidates.push(
      "Front-load pricing review triggers: if verified intensity or data tier fails agreed thresholds for two consecutive reporting periods, automatic price adjustment or re-benchmarking rights apply without full termination.",
    );
  }

  const seen = new Set<string>();
  const unique = candidates.filter((line) => {
    if (seen.has(line)) return false;
    seen.add(line);
    return true;
  });

  const fallbacks = [
    "Specify governing law and dispute resolution with optional technical expert determination for disagreements on calculation methodology or allocation — keeps carbon disputes out of general commercial litigation where possible.",
    "Index raw material or energy pass-throughs transparently while holding supplier accountable for verified emissions intensity bands, so commercial and climate signals stay decoupled but aligned.",
    "Include confidentiality and data-use terms that permit aggregation for Scope 3 inventory while protecting competitively sensitive process data.",
  ];

  let i = 0;
  while (unique.length < 3 && i < fallbacks.length) {
    const f = fallbacks[i++];
    if (!seen.has(f)) {
      seen.add(f);
      unique.push(f);
    }
  }

  return unique.slice(0, 3);
}
