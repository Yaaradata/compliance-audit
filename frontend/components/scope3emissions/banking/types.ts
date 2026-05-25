/** Bharatiya Axis Bank Ltd — Scope 3 / Category 15 (financed emissions) & climate risk prototype types. */

export type BankPersonaId =
  | "cro"
  | "esg_officer"
  | "corporate_rm"
  | "credit_risk_analyst"
  | "treasury_pm"
  | "compliance_officer"
  | "board_member"
  | "external_auditor"
  | "green_finance_pm"
  | "procurement_gm";

export type BankNavViewId =
  | "executive"
  | "carbon_lens"
  | "financed_emissions"
  | "green_finance"
  | "climate_risk"
  | "controls_audit"
  | "ai_insights"
  | "reports"
  | "upstream_downstream"
  | "sectors"
  | "ghg_tracking"
  | "submitted_data";

/** Tabs for Upstream/Downstream narrative view (ESG full mode). */
export type UpstreamDownstreamTabId = "overview" | "upstream" | "downstream" | "engagement" | "trend";

export interface UpstreamDownstreamHeroMock {
  bankTicker: string;
  upstreamSuppliers: { name: string; note?: string }[];
  downstreamBorrowers: { name: string; note?: string }[];
  upstreamPctScope3: number;
  downstreamPctScope3: number;
  insideTCO2e: number;
  outsideTCO2e: number;
  tagline: string;
  rupeeFlowLeftLabel: string;
  rupeeFlowRightLabel: string;
}

/** Evidence / assurance line for upstream & downstream drill panels. */
export interface UpstreamDownstreamDrillEvidenceLineMock {
  label: string;
  value: string;
  status?: "ok" | "warning" | "gap";
}

/** Deep drill for a Scope 3 category cluster (bank operations). */
export interface UpstreamDownstreamCategoryDrillMock {
  narrative: string;
  methodology: string[];
  sites: { name: string; tco2e: number; sharePct: number; note?: string }[];
  dataLayer: UpstreamDownstreamDrillEvidenceLineMock[];
  controls: string[];
  openFindings: string[];
}

/** Deep drill for an upstream supplier spend line. */
export interface UpstreamDownstreamSupplierDrillMock {
  vendorId: string;
  contractId: string;
  spendFY: string;
  efSource: string;
  scope2MarketBasedNote?: string;
  breakdown: { label: string; tco2e: number; pct: number }[];
  submissionStatus: string;
  reviewerNote: string;
}

/** Deep drill for a financed book segment (Category 15 sleeve). */
export interface UpstreamDownstreamMoneySegmentDrillMock {
  bookShareNarrative: string;
  topConcentrations: { name: string; exposureCr: number; tco2e: number; sector?: string }[];
  pcafRationale: string[];
  limitsAndMitigants: string[];
  stressCase?: string;
}

/** Deep drill for sector bubble (exposure × intensity lens). */
export interface UpstreamDownstreamSectorPointDrillMock {
  macroLink: string;
  policyHooks: string[];
  topBorrowers: { name: string; exposureCr: number; pcafScore: number }[];
  watchSignals: string[];
}

/** Deep drill for PCAF borrower attribution walk-through. */
export interface UpstreamDownstreamBorrowerDrillMock {
  attributionSteps: { label: string; detail: string; value?: string }[];
  evidencePack: { doc: string; dated: string; reliedUpon: string }[];
  dataGaps: string[];
  engagementStatus: string;
  nextReview: string;
}

export interface UpstreamDownstreamCategoryBarRow {
  id: string;
  label: string;
  tco2e: number;
  flagYoyPct?: number;
  flagLabel?: string;
  drill?: UpstreamDownstreamCategoryDrillMock;
}

export interface UpstreamDownstreamSupplierRow {
  supplier: string;
  supply: string;
  spendCr: number;
  tco2e: number;
  category: string;
  drill?: UpstreamDownstreamSupplierDrillMock;
}

export interface UpstreamDownstreamUpstreamPanelMock {
  headerTitle: string;
  sublabel: string;
  pctScope3: number;
  totalTCO2e: number;
  categories: UpstreamDownstreamCategoryBarRow[];
  suppliers: UpstreamDownstreamSupplierRow[];
  supplierHoverSuffix: string;
  greenProcurement: { label: string; value: string }[];
  upstreamNetZero: { label: string; pctAchieved: number };
}

export interface UpstreamDownstreamMoneyFlowSegmentMock {
  id: string;
  label: string;
  exposureCr: number;
  tco2e: number;
  pctBook: number;
  pcafScore: number;
  drill?: UpstreamDownstreamMoneySegmentDrillMock;
}

export interface UpstreamDownstreamScatterPointMock {
  sector: string;
  exposureCr: number;
  intensityPerCr: number;
  borrowers: number;
  quadrant: "TR" | "TL" | "BR" | "BL";
  fill: string;
  drill?: UpstreamDownstreamSectorPointDrillMock;
}

export interface UpstreamDownstreamPcafBorrowerMock {
  id: string;
  name: string;
  borrowerScope12TCO2e: number;
  loanOutstandingCr: number;
  totalDebtPlusMarketCapCr: number;
  attributionPct: number;
  attributedTCO2e: number;
  pcafScore: number;
  pcafLabel: string;
  drill?: UpstreamDownstreamBorrowerDrillMock;
}

export interface UpstreamDownstreamMoneySplitMock {
  title: string;
  exposureCr: number;
  pctBook: number;
  narrative: string[];
  tco2eLabel: string;
  tco2e: number;
  targetLabel: string;
  statusLabel: string;
  statusTone: "green" | "amber" | "red";
}

export interface UpstreamDownstreamDownstreamPanelMock {
  headerTitle: string;
  sublabel: string;
  pctScope3: number;
  totalTCO2e: number;
  moneyFlowSegments: UpstreamDownstreamMoneyFlowSegmentMock[];
  scatterPoints: UpstreamDownstreamScatterPointMock[];
  quadrantLabels: { key: UpstreamDownstreamScatterPointMock["quadrant"]; title: string; subtitle: string }[];
  pcafBorrowers: UpstreamDownstreamPcafBorrowerMock[];
  pcafBoxTitle: string;
  pcafFormulaIntro: string;
  greenMoney: UpstreamDownstreamMoneySplitMock;
  brownMoney: UpstreamDownstreamMoneySplitMock;
  neutralMoney: UpstreamDownstreamMoneySplitMock;
  netPositionLine: string;
}

export interface UpstreamDownstreamFunnelStageMock {
  id: string;
  title: string;
  subtitle: string;
  count: number;
  pctOfPrior: number;
}

export interface UpstreamDownstreamEngagementMock {
  funnelTitle: string;
  stages: UpstreamDownstreamFunnelStageMock[];
  insightLineA: string;
  insightLineB: string;
  ringLabel: string;
  ringCurrent: number;
  ringTotal: number;
  rmSectorBanner?: string;
}

export interface UpstreamDownstreamTrendPointMock {
  fy: string;
  outsideActual: number;
  outsideTarget: number;
  insideActual: number;
  insideTarget: number;
}

export interface UpstreamDownstreamTrendMock {
  points: UpstreamDownstreamTrendPointMock[];
  annotations: { fy: string; text: string; tone: "up" | "down" }[];
  gapLabel: string;
  gapTCO2e: number;
  footerLines: string[];
}

export interface UpstreamDownstreamMockData {
  hero: UpstreamDownstreamHeroMock;
  upstream: UpstreamDownstreamUpstreamPanelMock;
  downstream: UpstreamDownstreamDownstreamPanelMock;
  engagement: UpstreamDownstreamEngagementMock;
  trend: UpstreamDownstreamTrendMock;
}

export interface GhgTrackingKpiMock {
  id: string;
  label: string;
  value: string;
  hint?: string;
  trendPct?: number;
  tone?: "neutral" | "positive" | "negative";
}

export interface GhgTrackingSectorRowMock {
  sector: string;
  scope3FinancedTCO2e: number;
  exposureINRCr: number;
  pctOfTotalScope3: number;
  yoyPct: number;
  pathwayTag: string;
}

export interface GhgTrackingSectorSourceMock {
  label: string;
  pct: number;
  tCO2e: number;
}

export interface GhgTrackingSectorDetailMock {
  sector: string;
  narrative: string;
  totalFinancedTCO2e: number;
  topSources: GhgTrackingSectorSourceMock[];
  mrvStatus: string;
  nextActions: string[];
}

export interface GhgIntensityTrendPointMock {
  fy: string;
  scope3IntensityPerCr: number;
  allScopesIntensityPerCr: number;
  portfolioBenchmark: number;
}

export interface GhgEmissionFactorRegisterRowMock {
  id: string;
  sector: string;
  source: string;
  factorKgCO2ePerUnit: number;
  unit: string;
  vintage: string;
  pcafOption: string;
  lastReviewed: string;
}

/** GHG species codes for financed-emissions inventory (CO₂e basis). */
export type BankGhgGasCode = "CO2" | "CH4" | "N2O" | "HFCS" | "OTHER";

export type BankGhgGasByCode = Record<BankGhgGasCode, number>;

export interface GhgGasSpeciesRollupBank {
  code: BankGhgGasCode;
  label: string;
  formula: string;
  tCO2e: number;
  pctOfScope3: number;
  ar5Note: string;
}

export interface GhgGasSectorSliceBank {
  sector: string;
  tCO2eByGas: BankGhgGasByCode;
}

export interface GhgGasBorrowerSliceBank {
  borrowerId: string;
  borrowerName: string;
  sector: string;
  tCO2eByGas: BankGhgGasByCode;
}

export interface GhgGasNarrativeInsightBank {
  id: string;
  headline: string;
  body: string;
  gasCodes: BankGhgGasCode[];
  relatedSectorNames: string[];
  relatedInsightIds: string[];
}

/** Bank analogue of pharma `GhgGasInventoryBlock` — sector & obligor slices vs Category 15 totals. */
export interface GhgGasInventoryBank {
  methodologyVersion: string;
  gwpStandardLabel: string;
  boundaryNote: string;
  /** Headline financed Scope 3 (tCO₂e) for reconciliation copy. */
  executiveFinancedScope3TCO2e: number;
  speciesRollup: GhgGasSpeciesRollupBank[];
  sectorSlices: GhgGasSectorSliceBank[];
  borrowerSlices: GhgGasBorrowerSliceBank[];
  narrativeInsights: GhgGasNarrativeInsightBank[];
}

export interface GhgTrackingMockData {
  kpis: GhgTrackingKpiMock[];
  sectorTracker: GhgTrackingSectorRowMock[];
  sectorDetails: GhgTrackingSectorDetailMock[];
  intensityTrend: GhgIntensityTrendPointMock[];
  emissionFactorRegister: GhgEmissionFactorRegisterRowMock[];
  gasInventory: GhgGasInventoryBank;
}

/** Carbon Lens — deep navigation leaves (sidebar). */
export type CarbonLensLeafId =
  | "portfolio_overview"
  | "corporate_loans"
  | "project_finance"
  | "retail_loans"
  | "msme_loans"
  | "trade_finance"
  | "investment_portfolio"
  | "business_travel"
  | "employee_commuting"
  | "purchased_goods_services"
  | "it_data_centers"
  | "waste_capital_goods"
  | "carbon_green_loans"
  | "carbon_green_bonds"
  | "carbon_green_deposits"
  | "carbon_sustainability_linked_loans"
  | "physical_risk"
  | "transition_risk"
  | "climate_stress_testing";

export interface CarbonLensKpi {
  label: string;
  value: string;
  hint?: string;
  trendPct?: number;
}

/** Evidence / assurance line for Carbon Lens drill panels. */
export interface CarbonLensDrillEvidenceLine {
  label: string;
  value: string;
  status?: "ok" | "warning" | "gap";
}

/** Deep drill payload for a Carbon Lens register row. */
export interface CarbonLensLineItemDrill {
  narrative: string;
  exposurePath: string;
  methodology: string[];
  breakdown: { label: string; value: string; sharePct?: number }[];
  dataLayer: CarbonLensDrillEvidenceLine[];
  controls: string[];
  openFindings: string[];
  pcafDetail?: { scoreLabel: string; option: string; dataVintage: string; confidence: string };
  engagement?: { status: string; owner: string; nextReview: string; covenant?: string };
  evidencePack: { doc: string; dated: string; reliedUpon: string }[];
  suggestedActions: string[];
}

export interface CarbonLensLineItem {
  id: string;
  label: string;
  sublabel?: string;
  metric1: string;
  metric2?: string;
  metric3?: string;
  risk?: "Low" | "Medium" | "High";
  detail?: string;
  drill?: CarbonLensLineItemDrill;
}

/** Drill for portfolio overview asset-class bar selection. */
export interface CarbonLensAssetClassDrill {
  assetClassId: string;
  name: string;
  outstandingINRCr: number;
  attributedTCO2e: number;
  pcafScore: number;
  narrative: string;
  methodology: string[];
  topCounterparties: { name: string; exposureCr: number; tco2e: number; pcafScore: number }[];
  dataLayer: CarbonLensDrillEvidenceLine[];
  controls: string[];
}

export interface CarbonLensOwnOperationSlice {
  leaf: CarbonLensLeafId;
  title: string;
  narrative: string;
  scope3CategoryLabel: string;
  tCO2e: number;
  pctOfScope12And3NonFinanced: number;
  methodology: string;
  dataQuality: string;
  yoyPct: number;
  spendOrActivityINRCr?: number;
  notes: string;
  kpis: CarbonLensKpi[];
  lineItems: CarbonLensLineItem[];
}

export interface CarbonLensFinancedSlice {
  leaf: CarbonLensLeafId;
  title: string;
  narrative: string;
  kpis: CarbonLensKpi[];
  assetClassIds: string[];
  lineItems: CarbonLensLineItem[];
  methodology: string;
  pcafBand: string;
}

export interface CarbonLensGreenSlice {
  leaf: CarbonLensLeafId;
  title: string;
  narrative: string;
  kpis: CarbonLensKpi[];
  lineItems: CarbonLensLineItem[];
  complianceNote: string;
}

export interface CarbonLensClimateSlice {
  leaf: CarbonLensLeafId;
  title: string;
  narrative: string;
  kpis: CarbonLensKpi[];
  lineItems: CarbonLensLineItem[];
  regulatoryRef: string;
}

export interface CarbonLensBlock {
  portfolioIntro: string;
  financed: Record<
    | "portfolio_overview"
    | "corporate_loans"
    | "project_finance"
    | "retail_loans"
    | "msme_loans"
    | "trade_finance"
    | "investment_portfolio",
    CarbonLensFinancedSlice
  >;
  ownOperations: Record<
    | "business_travel"
    | "employee_commuting"
    | "purchased_goods_services"
    | "it_data_centers"
    | "waste_capital_goods",
    CarbonLensOwnOperationSlice
  >;
  green: Record<
    "carbon_green_loans" | "carbon_green_bonds" | "carbon_green_deposits" | "carbon_sustainability_linked_loans",
    CarbonLensGreenSlice
  >;
  climate: Record<"physical_risk" | "transition_risk" | "climate_stress_testing", CarbonLensClimateSlice>;
}

export type ComplianceStatus = "Compliant" | "In Progress" | "Gap Identified" | "Overdue";

export type ControlStatus = "Effective" | "Partially Effective" | "Deficient" | "Not Assessed";

export type ControlType = "Preventive" | "Detective" | "Corrective";

export type InsightSeverity = "Critical" | "High" | "Medium" | "Low";

export type BankInsightCategory =
  | "Financed Emissions Risk"
  | "Data Quality"
  | "Green Finance Opportunity"
  | "Regulatory Gap"
  | "Climate Physical Risk"
  | "Borrower Engagement"
  | "Portfolio Decarbonization";

export type InsightWorkflowState = "Open" | "Acknowledged" | "Assigned" | "Dismissed";

export type ReportPackStatus = "Ready" | "Incomplete" | "Not Started";

export interface BankCompanyProfile {
  legalName: string;
  shortName: string;
  brsrTier: string;
  rbiLicenseCategory: string;
  nzbaSignatoryDate: string;
  sbtiFiStatus: string;
  loanBookINRCr: number;
  investmentBookINRCr: number;
  corporateBorrowers: number;
  retailLoanAccounts: number;
  branches: number;
  foreignOffices: string[];
  scope1TCO2e: number;
  scope2TCO2e: number;
  scope3TCO2e: number;
  category15PctOfScope3: number;
  pcafCoveragePct: number;
  weightedPcafScore: number;
  lastInventoryClose: string;
}

export interface ExecutiveKpis {
  totalFinancedEmissionsTCO2e: number;
  financedYoyPct: number;
  waciTCO2ePerCr: number;
  waciYoyPct: number;
  pcafCoveragePct: number;
  coverageYoyPct: number;
  weightedPcafScore: number;
  pcafScoreYoyDelta: number;
  climateRiskExposureINRCr: number;
  climateRiskYoyPct: number;
  greenFinanceINRCr: number;
  greenFinanceYoyPct: number;
  brsrReadinessPct: number;
  brsrCoreAssuranceFlag: boolean;
  activeRegulatoryGaps: number;
  nzbaGapTCO2e2030: number;
  annualReductionNeededPct: number;
  /** CRE + infra collateral in high physical-hazard districts (₹ cr) — sums `physicalDistricts` for disclosure copy. */
  physicalCollateralHighHazardINRCr: number;
}

export interface FinancedAssetClassRow {
  id: string;
  name: string;
  outstandingINRCr: number;
  attributionMethod: string;
  attributedTCO2e: number;
  pctOfScope3: number;
  pcafScore: number;
  coveragePct: number;
  yoyPct: number;
  riskFlag: string;
}

export interface SectorEmissionRow {
  sector: string;
  exposureINRCr: number;
  borrowers: number;
  waciTCO2ePerCr: number;
  attributedTCO2e: number;
  pathwayStatus: "On Track" | "Off Track" | "No Data";
  physicalRisk1to10: number;
  transitionRisk1to10: number;
  brsrReported: boolean;
  transitionPlansCount: number;
  ieaBenchmarkWaci: number;
  sparkTrend: number[];
}

export type EsgRatingBand = "AAA" | "AA" | "A" | "BBB" | "BB" | "B" | "CCC";

export interface BorrowerRow {
  id: string;
  name: string;
  sector: string;
  loanOutstandingINRCr: number;
  esgRating: EsgRatingBand;
  scope12TCO2e: number;
  attributedTCO2e: number;
  emissionIntensity: number;
  pcafScore: number;
  sbtiCommitted: boolean;
  brsrDisclosed: boolean;
  engagement: "Active Dialogue" | "First Contact" | "Unengaged" | "Committed to Transition Plan";
  redFlags: "none" | "high carbon lock-in" | "no transition plan" | "litigation risk" | "stranded asset exposure";
  facilityType: string;
  maturity: string;
  attributionFactorPct: number;
  ratingAgency: string;
  scope3TCO2e?: number;
  treasuryRelevant: boolean;
  rmFocusSector: string;
}

export interface ClimateRiskRegisterRow {
  id: string;
  riskType: string;
  sectors: string[];
  exposureINRCr: number;
  magnitude: "High" | "Medium" | "Low";
  horizon: "Short-term <3yr" | "Medium 3–10yr" | "Long-term >10yr";
  rbiTcfdDisclosure: boolean;
  mitigation: string;
  disclosedInAnnualReport: boolean;
}

export interface GreenLoanRow {
  id: string;
  borrower: string;
  sector: string;
  greenType: string;
  amountINRCr: number;
  verification: "Verified" | "In review" | "Self-declared";
  uopAlignmentPct: number;
  co2eAvoidedPerYr: number;
  maturity: string;
  brsrReportable: boolean;
}

export interface GreenBondSeries {
  isin: string;
  amountINRCr: number;
  couponPct: number;
  maturity: string;
  useOfProceeds: string[];
  allocationPct: number;
  opinionProvider: string;
  cbiCertified: boolean;
}

export interface GreenFinanceBlock {
  greenLoansOutstandingINRCr: number;
  greenLoanAccounts: number;
  verifiedGreenPct: number;
  greenBondsOutstandingINRCr: number;
  greenDepositsINRCr: number;
  sllCount: number;
  sllAvgKpiPerformancePct: number;
  sllStepTriggersActive: number;
  greenLoanRows: GreenLoanRow[];
  bondSeries: GreenBondSeries[];
  rbiGreenDepositChecklist: { item: string; status: ComplianceStatus }[];
  sebiGreenBondChecklist: { item: string; ok: boolean }[];
  impact: {
    mwhRenewable: number;
    tco2eAvoided: number;
    greenSqKm: number;
  };
}

export interface RegulatoryComplianceRow {
  framework: string;
  section: string;
  deadline: string;
  status: ComplianceStatus;
  completenessPct: number;
  nextAction: string;
  ownerPersona: BankPersonaId;
}

/** Banking control register row — aligned with pharma `ControlRegisterRow` for Controls & Audit view. */
export interface BankControlRegisterRow {
  controlId: string;
  description: string;
  /** Scope 3 / PCAF coverage narrative for audit scoping. */
  scope3Coverage?: string;
  /** Financed-emissions obligors in scope for this control. */
  linkedBorrowerIds?: string[];
  /** PCAF asset-class sleeves tied to the control test. */
  linkedAssetClassIds?: string[];
  type: ControlType;
  frameworks: string[];
  owner: string;
  frequency: string;
  lastTested: string;
  status: ControlStatus;
  evidenceLink: string;
}

/** @deprecated Use BankControlRegisterRow — kept as alias for dashboard badge counts. */
export type ControlRow = BankControlRegisterRow;

export interface BankInventoryMeta {
  reportingYearLabel: string;
  methodologyVersion: string;
  organizationalBoundary: string;
  dataFreshnessNote?: string;
}

export interface BankAuditDimension {
  key: string;
  label: string;
  score: number;
  status: "Strong" | "Adequate" | "Weak";
  missing: string;
  recommendedAction: string;
}

export interface BankAuditReadiness {
  overallPct: number;
  dimensions: BankAuditDimension[];
  quarterlyTrend: { quarter: string; score: number }[];
  dataTraceabilityPct: number;
  methodologyDocCompletenessPct: number;
}

export interface BankAuditFinding {
  id: string;
  source: "Control test" | "Regulatory" | "Assurance" | "Evidence";
  severity: InsightSeverity;
  title: string;
  detail: string;
  owner: string;
  targetDate: string;
  status: "Open" | "In progress" | "Closed";
  linkedControlId?: string;
}

export interface BankAuditorQuery {
  id: string;
  subject: string;
  askedBy: string;
  assignee: string;
  status: "Open" | "Answered" | "Pending evidence";
  lastUpdated: string;
  relatedControlId?: string;
}

export interface BankPcafCoverageBand {
  band: string;
  pct: number;
}

/** Supplemental compliance & audit artefacts (findings, PBC ladder, auditor log). */
export interface BankComplianceAuditSupplement {
  pcafCoverageLadder: BankPcafCoverageBand[];
  openFindings: BankAuditFinding[];
  auditorQueries: BankAuditorQuery[];
}

export type ComplianceCounterpartyStatus = "Verified" | "Partial Data" | "Non-Disclosed" | "Inconsistent";
export type ComplianceDataQualityTier = "High" | "Med" | "Low" | "None";

export interface ComplianceCounterpartyRow {
  id: string;
  name: string;
  sector: string;
  sectorTone: "energy" | "metals" | "agri" | "infra" | "cement" | "chemicals" | "default";
  loanExpCr: number;
  financedEmissionsLabel: string;
  financedEmissionsTone: "default" | "warn" | "danger";
  attributionPct: number | null;
  dataQualityTier: ComplianceDataQualityTier;
  dataQualityScore: number;
  source: string;
  sourceTone: "default" | "danger";
  status: ComplianceCounterpartyStatus;
  flagged: boolean;
}

export interface ComplianceCounterpartySummary {
  verified: number;
  partialEstimated: number;
  nonDisclosed: number;
  total: number;
}

export interface BrsrDisclosureCategoryRow {
  id: string;
  label: string;
  pct: number;
  status: "met" | "partial" | "not_met";
  brsrPrinciple?: string;
  dataOwner?: string;
}

export interface BrsrPriorityActionRow {
  id: string;
  severity: "Critical" | "High" | "Medium";
  title: string;
  detail: string;
  owner?: string;
  targetDate?: string;
}

export interface Scope3ControlChecklistRow {
  id: string;
  categoryLabel: string;
  title: string;
  description: string;
  status: "Effective" | "Needs Review" | "Ineffective";
  owner?: string;
  lastTested?: string;
  linkedControlId?: string;
}

export interface ComplianceAuditLogRow {
  id: string;
  timestamp: string;
  author: string;
  role: string;
  detail: string;
  tag: string;
  tagTone: "blue" | "orange" | "green" | "red";
}

export interface ComplianceExceptionRow {
  id: string;
  issue: string;
  owner: string;
  due: string;
  status: "Critical" | "High" | "In Progress";
  linkedControlId?: string;
  linkedFindingId?: string;
}

export interface DataConfidenceCategoryRow {
  id: string;
  shortLabel: string;
  confidencePct: number;
  barTone: "blue" | "orange" | "red" | "green";
  pcafWeightedScore?: number;
  categoryCode?: string;
}

export interface CompliancePageKpi {
  id: string;
  label: string;
  value: string;
  hint: string;
  tone: "positive" | "negative" | "neutral" | "warn";
}

export interface ComplianceLineageStep {
  step: string;
  source: string;
  owner: string;
  updated: string;
  status: "Verified" | "Estimated" | "Missing" | "Flagged";
}

export interface ComplianceEvidenceArtifact {
  name: string;
  status: "Available" | "In Preparation" | "Missing";
  docType: string;
}

export interface ComplianceCounterpartyDrill {
  borrowerId: string;
  facilityType: string;
  maturity: string;
  esgRating: string;
  pcafScore: number;
  pcafOption: string;
  brsrDisclosed: boolean;
  sbtiCommitted: boolean;
  engagement: string;
  redFlags: string;
  attributedTCO2e: number;
  scope12TCO2e: number;
  priorYearAttributed?: number;
  variancePct?: number;
  ratingAgency: string;
  dataLineage: ComplianceLineageStep[];
  evidenceArtifacts: ComplianceEvidenceArtifact[];
  auditNotes: string[];
  remediationSteps: string[];
  linkedControlIds: string[];
  assuranceStatus: string;
}

export interface BrsrCategoryDrill {
  brsrPrinciple: string;
  regulatoryRef: string;
  dataOwner: string;
  completenessPct: number;
  gaps: string[];
  evidenceRequired: string[];
  actions: string[];
  linkedReports: string[];
  assuranceNote: string;
}

export interface ControlChecklistDrill {
  controlObjective: string;
  testProcedure: string;
  lastTested: string;
  tester: string;
  owner: string;
  frameworks: string[];
  findings: string[];
  evidenceLinks: string[];
  remediationPlan: string;
  nextReview: string;
}

export interface AuditLogDrill {
  eventType: string;
  systemRef: string;
  beforeValue?: string;
  afterValue?: string;
  impactedEntities: string[];
  approver?: string;
  relatedControlIds: string[];
  followUpActions: string[];
}

export interface ExceptionDrill {
  rootCause: string;
  impact: string;
  remediationSteps: { step: string; owner: string; due: string; done: boolean }[];
  linkedBorrowerIds: string[];
  linkedControlIds: string[];
  escalationPath: string;
  boardVisibility: boolean;
}

export interface DataConfidenceDrill {
  categoryCode: string;
  methodology: string;
  pcafScoreDistribution: { score: number; pct: number }[];
  primaryDataPct: number;
  estimatedPct: number;
  missingPct: number;
  sourceSystems: string[];
  lastRefresh: string;
  versionHistory: { version: string; date: string; change: string }[];
  anomalies: string[];
}

export interface BrsrActionDrill {
  severity: string;
  owner: string;
  targetDate: string;
  regulatoryDriver: string;
  dependencies: string[];
  milestones: { label: string; date: string; status: "Done" | "Pending" | "Overdue" }[];
  linkedExceptions: string[];
}

export interface ComplianceAuditDrills {
  counterparties: Record<string, ComplianceCounterpartyDrill>;
  brsrCategories: Record<string, BrsrCategoryDrill>;
  controlChecklist: Record<string, ControlChecklistDrill>;
  auditLog: Record<string, AuditLogDrill>;
  exceptions: Record<string, ExceptionDrill>;
  dataConfidence: Record<string, DataConfidenceDrill>;
  brsrActions: Record<string, BrsrActionDrill>;
  pageKpis: Record<string, { summary: string; bullets: string[] }>;
}

/** Compliance & Audit page — counterparty register, BRSR mapping, controls layer, data governance. */
export interface BankComplianceAuditPage {
  pageKpis: CompliancePageKpi[];
  counterparties: ComplianceCounterpartyRow[];
  counterpartySummary: ComplianceCounterpartySummary;
  brsrCategories: BrsrDisclosureCategoryRow[];
  brsrOverallScore: number;
  brsrStatusLabel: string;
  brsrSummary: string;
  brsrCounts: { fullyMet: number; partial: number; notMet: number };
  brsrPriorityActions: BrsrPriorityActionRow[];
  controlChecklist: Scope3ControlChecklistRow[];
  controlChecklistSummary: { effective: number; needsReview: number; ineffective: number };
  auditLog: ComplianceAuditLogRow[];
  exceptions: ComplianceExceptionRow[];
  dataConfidence: DataConfidenceCategoryRow[];
  drills: ComplianceAuditDrills;
  openFindingsCount: number;
  openAuditorQueriesCount: number;
  pcafCoverageLadder: BankPcafCoverageBand[];
}

export interface AiInsight {
  id: string;
  severity: InsightSeverity;
  category: BankInsightCategory;
  title: string;
  detail: string;
  confidencePct: number;
  recommendedAction: string;
  linkedEntity: string;
  workflow: InsightWorkflowState;
}

export interface NzbaTrendPoint {
  fyLabel: string;
  actualTCO2e: number;
  nzbaTargetTCO2e: number;
  ieaNetZeroTCO2e: number;
  isCurrent?: boolean;
}

export interface TcfdPillar {
  pillar: "Governance" | "Strategy" | "Risk Management" | "Metrics & Targets";
  completenessPct: number;
}

export interface ScenarioStressRow {
  scenario: string;
  loanAtRiskINRCr: number;
  npaDeltaPct: number;
  cet1ImpactBps: number;
  horizon: string;
}

export interface StressTestSummary {
  scenarios: string[];
  npaRatioChangePct: number;
  capitalAdequacyBps: string;
  boardSignOff: string;
  signOffDate: string;
}

export interface PhysicalRiskDistrict {
  district: string;
  state: string;
  hazard: string;
  collateralINRCr: number;
}

export interface AuditDocumentRow {
  docType: string;
  status: "Available" | "In Preparation" | "Missing";
}

export interface BrsrReadinessDimension {
  name: string;
  scorePct: number;
  status: "Strong" | "Adequate" | "Gap";
  gap: string;
  action: string;
}

export interface ReportDefinition {
  id: string;
  name: string;
  regulatoryBasis: string;
  deadline: string;
  status: ReportPackStatus;
  completenessPct: number;
  missingFields: string[];
  lastGenerated: string | null;
}

/** Upstream (bank-as-buyer) vs downstream (financed / Category 15) evidence stream. */
export type BankSubmittedDataStream = "upstream" | "downstream" | "internal";

export type BankSubmittedCounterpartyKind = "borrower" | "supplier" | "internal";

export type BankEvidenceIntakeChannel =
  | "Borrower ESG portal"
  | "Supplier sustainability portal"
  | "Secure SFTP — PCAF inbox"
  | "Email + checksum registry"
  | "Internal — ESG / Credit"
  | "Assurance PBC bundle"
  | "CIBIL / bureau climate overlay";

export type BankEvidenceReviewState =
  | "Indexed — accepted"
  | "Under review"
  | "Clarification requested"
  | "Superseded by resubmission";

export type BankEvidenceDataQualityTier = "Primary" | "Secondary" | "Proxy" | "EEIO";

export interface BankSubmittedDataArtifact {
  fileName: string;
  format: "PDF" | "XLSX" | "CSV" | "XML" | "PNG" | "ZIP";
  sizeLabel: string;
  sha256Prefix: string;
  contentSummary?: string;
  virusScan?: "Clean" | "Pending" | "N/A";
}

export interface BankSubmittedDataActivityRef {
  activityClass: string;
  inventoryJobId: string;
  coveredTCO2eApprox?: number;
  gwpSet: string;
  emissionFactorRegistryVersion: string;
}

export interface BankSubmittedDataDrilldown {
  evidencePackageVersion: string;
  inventoryObjectLockId: string;
  calculationEngineJobPath: string;
  gwpStandard: string;
  emissionFactorRegistryVersion: string;
  boundaryAndPeriodNote: string;
  dataQualityRationale: string;
  pcafOption?: string;
  pcafScoreAtSubmission?: number;
  attributionFactorPct?: number;
  facilityRefs?: string[];
  activityLineRefs: BankSubmittedDataActivityRef[];
  regulatoryCrosswalk: { instrument: string; clauseOrSection: string; relevance: string }[];
  versionHistory: { at: string; actor: string; event: string }[];
  legalRetention: { minRetentionYears: number; storageTier: string; jurisdictionNote: string };
  attestations?: { signerName: string; signerTitle: string; signedAt: string; scopeStatement: string }[];
  clarificationsRaised?: string[];
  technicalContact?: { name: string; email: string; phone?: string };
  supersededByEvidenceId?: string;
  supersedesEvidenceId?: string;
}

/** Governed evidence package supporting upstream/downstream Scope 3 inventory lines. */
export interface BankSubmittedDataRecord {
  id: string;
  title: string;
  stream: BankSubmittedDataStream;
  counterpartyKind: BankSubmittedCounterpartyKind;
  counterpartyId: string;
  counterpartyName: string;
  sector: string;
  submittedAt: string;
  indexedAt: string;
  channel: BankEvidenceIntakeChannel;
  submitterOrg: string;
  submitterRole?: string;
  scope3CategoryIds: number[];
  linkedControlIds: string[];
  disclosureUse: string[];
  intendedDataQualityTier: BankEvidenceDataQualityTier;
  reviewState: BankEvidenceReviewState;
  reviewer?: string;
  reportingPeriodLabel: string;
  assertionSummary: string;
  verificationFocus: string;
  artifacts: BankSubmittedDataArtifact[];
  lineageStep?: number;
  linkedEngagementId?: string;
  drilldown: BankSubmittedDataDrilldown;
}

export interface BankSubmittedDataSectorRollup {
  sector: string;
  upstreamPackages: number;
  downstreamPackages: number;
  acceptedPackages: number;
  openReviewPackages: number;
  companiesWithSubmission: number;
  companiesInSector: number;
  attributedTCO2eCovered: number;
}

export interface BankSubmittedDataLineageStep {
  step: number;
  label: string;
  detail: string;
}

export interface BankSubmittedDataPage {
  records: BankSubmittedDataRecord[];
  sectorRollups: BankSubmittedDataSectorRollup[];
  lineage: BankSubmittedDataLineageStep[];
}

export interface BankScope3MockData {
  company: BankCompanyProfile;
  executive: ExecutiveKpis;
  financedAssetClasses: FinancedAssetClassRow[];
  sectors: SectorEmissionRow[];
  borrowers: BorrowerRow[];
  climateRisks: ClimateRiskRegisterRow[];
  greenFinance: GreenFinanceBlock;
  regulatory: RegulatoryComplianceRow[];
  inventoryMeta: BankInventoryMeta;
  controls: BankControlRegisterRow[];
  auditReadiness: BankAuditReadiness;
  complianceAudit: BankComplianceAuditSupplement;
  complianceAuditPage: BankComplianceAuditPage;
  aiInsights: AiInsight[];
  nzbaTrend: NzbaTrendPoint[];
  tcfdPillars: TcfdPillar[];
  scenarioRows: ScenarioStressRow[];
  sectorScenarioMatrix: { sector: string; netZero: number; steps: number; rbiAdverse: number }[];
  physicalDistricts: PhysicalRiskDistrict[];
  stressTest: StressTestSummary;
  auditDocuments: AuditDocumentRow[];
  brsrReadinessDimensions: BrsrReadinessDimension[];
  brsrReadinessTrend: { quarter: string; score: number }[];
  reports: ReportDefinition[];
  /** Carbon Lens deep-drill dataset (non-financed Scope 3 + financed splits). */
  carbonLens: CarbonLensBlock;
  /** Upstream vs downstream Scope 3 narrative (bank-as-buyer vs Category 15). */
  upstreamDownstream: UpstreamDownstreamMockData;
  /** GHG / Scope 3 financed emissions tracking, factors, and PCAF quality (illustrative). */
  ghgTracking: GhgTrackingMockData;
  /** Upstream & downstream evidence register — counterparty submissions indexed for PCAF / BRSR. */
  submittedData: BankSubmittedDataPage;
}
