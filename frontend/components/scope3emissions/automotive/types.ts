import type {
  AutoComplianceAuditPage,
  AutoComplianceAuditSupplement,
} from "./compliance-audit-types";

export type {
  AutoAuditFinding,
  AutoAuditorQuery,
  AutoComplianceAuditPage,
  AutoComplianceAuditSupplement,
  ComplianceSupplierRow,
  ComplianceSupplierStatus,
} from "./compliance-audit-types";

export type AutoPersonaId =
  | "sustainability_head"
  | "cso"
  | "cfo"
  | "procurement_lead"
  | "plant_operations"
  | "automotive_head"
  | "executive"
  | "compliance_officer"
  | "external_auditor";

export type AutoNavViewId =
  | "overview"
  | "supply_chain"
  | "value_chain"
  | "product_components"
  | "geography"
  | "emissions_tracking"
  | "intensity_ratio"
  | "compliance_audit"
  | "insights"
  | "reports";

export type VehiclePowertrain = "ICE" | "EV" | "Hybrid";
export type SupplierTier = 1 | 2 | 3;
export type ComplianceStatus = "Compliant" | "At risk" | "Non-compliant";
export type RiskLevel = "Low" | "Medium" | "High";
export type DataQualityTag = "Actual" | "Estimated" | "Proxy";
export type TargetStatus = "On track" | "At risk" | "Missed";
export type LifecyclePhase = "Production" | "Use phase" | "End-of-life";
export type TransportMode = "Road" | "Sea" | "Air";
export type TargetUnit = "tCO2e" | "percent" | "intensity" | "coverage_pct";
export type ApprovalStage = "Draft" | "Under review" | "Approved" | "Rejected";
export type EvidenceDocType = "PCF" | "LCA" | "Invoice" | "Certification" | "Boundary memo" | "Assurance PBC";

export interface GlobalFilters {
  vehicleModel: string;
  supplier: string;
  geography: string;
  period: string;
  plant: string;
  powertrain: string;
  comparePeriod: string;
}

export interface ReportingContext {
  entity: string;
  boundary: string;
  methodology: string;
  baselineFY: string;
  inventoryClose: string;
  assuranceLevel: string;
  dataVintage: string;
}

export interface FinancialKpis {
  intensityPerRevenueCr: number;
  intensityPerVehicleSold: number;
  intensityPerVehicleProduced: number;
  shadowCarbonExposureINRCr: number;
  topCategoryCogsPct: number;
  yoyVariancePct: number;
}

export interface VarianceBridgePoint {
  label: string;
  value: number;
  type: "start" | "delta" | "end";
}

export interface InvestmentInitiative {
  id: string;
  title: string;
  owner: string;
  impactTCO2e: number;
  capexINRCr: number;
  status: "Planned" | "In progress" | "Delivered";
  paybackYears: number;
}

export interface MethodologyCategory {
  ghgCategory: number;
  label: string;
  owner: string;
  approach: string;
  dataQuality: DataQualityTag;
  coveragePct: number;
}

export interface RestatementLogRow {
  id: string;
  date: string;
  reason: string;
  impactTCO2e: number;
  categories: string;
}

export interface Cat11AssumptionSet {
  market: string;
  lifetimeKm: number;
  gridKgPerKwh: number;
  fuelType: string;
  realWorldFactor: number;
  evChargingMixPct: number;
  fleetSharePct: number;
}

export interface SupplierProgrammeRow {
  supplierId: string;
  name: string;
  emissionsSharePct: number;
  pcfStatus: "Verified" | "Received" | "Requested" | "Expired";
  sbtiCommitted: boolean;
  capStatus: "Open" | "In progress" | "Closed" | "None";
  spendINRCr: number;
  contractRenewal: string;
  wave: "Wave 1" | "Wave 2" | "Wave 3";
}

export interface CategoryOwner {
  ghgCategory: number;
  label: string;
  owner: string;
  completenessPct: number;
}

export interface PlantScope3Slice {
  plant: string;
  inboundTCO2e: number;
  outboundTCO2e: number;
  productionAllocatedTCO2e: number;
  intensityPerVehicle: number;
}

export interface CompanyProfile {
  legalName: string;
  shortName: string;
  brsrTier: string;
  hq: string;
  plants: string[];
  vehicleModels: string[];
  reportingFY: string;
  lastInventoryClose: string;
  scope3TCO2e: number;
  vehiclesProducedFY: number;
  revenueINRCr: number;
}

export interface OverviewKpis {
  totalScope3TCO2e: number;
  emissionsPerVehicleTCO2e: number;
  usePhasePct: number;
  evSharePct: number;
  yoyChangePct: number;
  topSupplierContributionPct: number;
}

export interface PersonaInsight {
  id: string;
  persona: AutoPersonaId;
  headline: string;
  body: string;
  impactTCO2e?: number;
  impactINRCr?: number;
  drillView?: AutoNavViewId;
}

export interface CfoPnlCarbonLine {
  line: string;
  fy24: number | null;
  fy25: number | null;
  carbonIntensity: number | null;
  note: string;
}

export interface ModelCarbonEconomics {
  modelId: string;
  name: string;
  units: number;
  revenueINRCr: number;
  scope3Kt: number;
  intensityPerVehicle: number;
  cat1PerVehicle: number;
  cat11PerVehicle: number;
  marginAtRiskINRCr: number;
  decarbLever: string;
}

export interface ProcurementSupplierScorecard {
  supplierId: string;
  name: string;
  spendINRCr: number;
  emissionsKt: number;
  intensityPerSpendCr: number;
  pcfStatus: "Verified" | "Received" | "Requested" | "Expired";
  sbtiStatus: "Committed" | "Not committed" | "In validation";
  contractRenewal: string;
  dataTier: "Tier A" | "Tier B" | "Tier C";
  alternateQualified: boolean;
  engagementPriority: "P0" | "P1" | "P2";
}

export interface DataQualityGap {
  id: string;
  category: string;
  field: string;
  issue: string;
  owner: string;
  confidence: number;
  recordsAffected: number;
  remediation: string;
  dueDate: string;
}

export interface CsoAssuranceGap {
  id: string;
  area: string;
  brsrRef: string;
  status: "Mapped" | "Partial" | "Gap";
  materiality: "High" | "Medium" | "Low";
  finding: string;
  owner: string;
}

export interface SupplierDrillDetail {
  supplierId: string;
  spendINRCr: number;
  emissionsSharePct: number;
  pcfStatus: string;
  lastPcfDate: string;
  dataLineage: string;
  inboundModes: string[];
  capActions: string[];
  linkedRecords: string[];
  sbtiStatus: string;
}

export interface LifecycleSlice {
  phase: LifecyclePhase;
  iceTCO2e: number;
  evTCO2e: number;
}

export interface TrendPoint {
  period: string;
  tCO2e: number;
  model?: string;
}

export interface TopContributor {
  id: string;
  name: string;
  tCO2e: number;
  pct: number;
  kind: "supplier" | "component";
}

export interface QuickInsight {
  id: string;
  text: string;
  severity: "info" | "warning" | "critical";
}

export interface SupplierTrendPoint {
  period: string;
  tCO2e: number;
}

export interface SupplierNode {
  id: string;
  name: string;
  tier: SupplierTier;
  tCO2e: number;
  intensity: number;
  compliance: ComplianceStatus;
  riskScore: number;
  riskLevel: RiskLevel;
  geography: string;
  country: string;
  components: string[];
  certifications: string[];
  parentId?: string;
  plantDestination?: string;
  emissionsTrend: SupplierTrendPoint[];
  modelIds: string[];
  spendINRCr?: number;
  pcfStatus?: "Verified" | "Received" | "Requested" | "Expired";
  capStatus?: "Open" | "In progress" | "Closed" | "None";
  contractRenewal?: string;
  scope12Disclosed?: boolean;
  alternateSupplier?: string;
}

export interface SupplyChainEdge {
  from: string;
  to: string;
}

export interface ValueChainCategory {
  id: string;
  label: string;
  stream: "Upstream" | "Downstream";
  tCO2e: number;
  pct: number;
  ghgCategory: number;
}

export interface SankeyFlow {
  from: string;
  to: string;
  value: number;
}

export interface ComponentEmission {
  id: string;
  name: string;
  tCO2e: number;
  pct: number;
  materials: { material: string; pct: number }[];
  topSuppliers: { name: string; pct: number }[];
  lowCarbonAlternative?: string;
  modelIds: string[];
}

export interface VehicleModelEmission {
  id: string;
  name: string;
  powertrain: VehiclePowertrain;
  productionTCO2e: number;
  usePhaseTCO2e: number;
  eolTCO2e: number;
  lifecycleTCO2e: number;
  unitsProduced: number;
  shareOfScope3Pct: number;
}

export interface GeographyEmission {
  country: string;
  iso: string;
  tCO2e: number;
  intensity: number;
  supplierCount: number;
  regulatoryRisk: RiskLevel;
  gridIntensityKgPerKwh: number;
}

export interface LogisticsRoute {
  id: string;
  from: string;
  to: string;
  plant: string;
  mode: TransportMode;
  tCO2e: number;
  distanceKm: number;
  supplierId?: string;
}

export interface TransportEmission {
  mode: TransportMode;
  tCO2e: number;
  pct: number;
}

export interface CategoryTracking {
  ghgCategory: number;
  label: string;
  tCO2e: number;
  pct: number;
  dataQuality: DataQualityTag;
  confidence: number;
  trend: { period: string; tCO2e: number }[];
  monthlyTrend?: { period: string; tCO2e: number }[];
}

export interface EmissionRecord {
  id: string;
  category: string;
  ghgCategory: number;
  source: string;
  period: string;
  tCO2e: number;
  quality: DataQualityTag;
  confidence: number;
  vehicleModel?: string;
  supplierId?: string;
  geography?: string;
}

export interface DecarbTarget {
  id: string;
  name: string;
  unit: TargetUnit;
  targetValue: number;
  actualValue: number;
  status: TargetStatus;
  dueFY: string;
  unitLabel: string;
}

export interface ReductionOpportunity {
  id: string;
  title: string;
  category: string;
  impactTCO2e: number;
  effort: "Low" | "Medium" | "High";
  impact: "Low" | "Medium" | "High";
  capexINRCr?: number;
  opexINRCr?: number;
  owner?: string;
}

export interface BrsrMappingRow {
  id: string;
  disclosure: string;
  dataPoint: string;
  status: "Mapped" | "Partial" | "Gap";
  evidenceIds?: string[];
}

export interface AuditTrailRow {
  id: string;
  dataSource: string;
  methodology: string;
  timestamp: string;
  modifiedBy: string;
  relatedEvidenceId?: string;
}

export interface EvidenceDocument {
  id: string;
  name: string;
  type: EvidenceDocType;
  supplierId?: string;
  category: string;
  uploadedAt: string;
  version: string;
  sizeMb: number;
  approvalStage: ApprovalStage;
}

export interface ApprovalWorkflowItem {
  id: string;
  subject: string;
  stage: ApprovalStage;
  reviewer: string;
  updatedAt: string;
  comment?: string;
}

export interface AiRecommendation {
  id: string;
  category: "Supplier switch" | "Material substitution" | "Logistics optimisation";
  title: string;
  trigger: string;
  action: string;
  impactTCO2e: number;
}

export type AutoInsightSeverity = "Critical" | "High" | "Medium" | "Low";

export type AutoInsightCategory =
  | "Supplier Risk"
  | "Data Quality"
  | "Compliance Gap"
  | "Reduction Opportunity"
  | "Anomaly Detection"
  | "Use phase & portfolio";

export type AutoInsightWorkflow = "Open" | "Acknowledged" | "Assigned" | "Dismissed";

export interface AiInsightFeedItem {
  id: string;
  severity: AutoInsightSeverity;
  category: AutoInsightCategory;
  headline: string;
  body: string;
  confidencePct: number;
  recommendedAction: string;
  expectedImpactTCO2e: number;
  linkedSupplier?: string;
  linkedCategoryId?: number;
  workflow: AutoInsightWorkflow;
  assignee?: string;
  dismissReason?: string;
  generatedAt: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  format: ("PDF" | "Excel")[];
  status: "Ready" | "Draft";
}

export interface ReportSchedule {
  id: string;
  templateId: string;
  cadence: "Monthly" | "Quarterly";
  nextRun: string;
  recipients: string[];
  delivery: "Email" | "Dashboard";
}

export interface CustomReportField {
  id: string;
  label: string;
  group: "KPI" | "Category" | "Supplier" | "Model";
  selected: boolean;
}

export interface SupplierRiskHeatmapCell {
  supplierId: string;
  name: string;
  emissionsRank: number;
  compliance: ComplianceStatus;
  quadrant: "Monitor" | "Engage" | "Critical" | "Leader";
}

/** Full inventory — use `filterScope3Data()` for filtered views. */
export interface AutomotiveScope3MockData {
  company: CompanyProfile;
  overview: OverviewKpis;
  lifecycle: LifecycleSlice[];
  emissionsTrend: TrendPoint[];
  emissionsTrendByModel: Record<string, TrendPoint[]>;
  topSuppliers: TopContributor[];
  topComponents: TopContributor[];
  quickInsights: QuickInsight[];
  suppliers: SupplierNode[];
  supplyEdges: SupplyChainEdge[];
  tierBreakdown: { tier: SupplierTier; tCO2e: number }[];
  valueChainCategories: ValueChainCategory[];
  sankeyFlows: SankeyFlow[];
  upstreamTotal: number;
  downstreamTotal: number;
  components: ComponentEmission[];
  vehicleModels: VehicleModelEmission[];
  geography: GeographyEmission[];
  logisticsRoutes: LogisticsRoute[];
  transportModes: TransportEmission[];
  categoryTracking: CategoryTracking[];
  emissionRecords: EmissionRecord[];
  intensityPerVehicle: number;
  intensityPerRevenueCr: number;
  targets: DecarbTarget[];
  pathwayTrend: { fy: string; actual: number; required: number; sbti?: number }[];
  opportunities: ReductionOpportunity[];
  alerts: { id: string; message: string; severity: "warning" | "critical" }[];
  brsrMapping: BrsrMappingRow[];
  auditTrail: AuditTrailRow[];
  evidenceDocuments: EvidenceDocument[];
  approvalWorkflow: ApprovalWorkflowItem[];
  supplierRiskHeatmap: SupplierRiskHeatmapCell[];
  dataCompletenessPct: number;
  accuracyByCategory: { category: string; score: number }[];
  recommendations: AiRecommendation[];
  insightFeed: AiInsightFeedItem[];
  emissionDrivers: { name: string; pct: number }[];
  reportTemplates: ReportTemplate[];
  reportSchedules: ReportSchedule[];
  customReportFields: CustomReportField[];
  globalFilterOptions: {
    vehicleModels: string[];
    suppliers: string[];
    geographies: string[];
    periods: string[];
    plants: string[];
    powertrains: string[];
    comparePeriods: string[];
  };
  reportingContext: ReportingContext;
  financialKpis: FinancialKpis;
  varianceBridge: VarianceBridgePoint[];
  investmentPipeline: InvestmentInitiative[];
  methodologyRegister: MethodologyCategory[];
  restatementLog: RestatementLogRow[];
  cat11Assumptions: Cat11AssumptionSet[];
  supplierProgramme: SupplierProgrammeRow[];
  categoryOwners: CategoryOwner[];
  plantSlices: PlantScope3Slice[];
  sbtiStatus: {
    nearTermStatus: string;
    supplierEngagementTargetPct: number;
    suppliersWithTargetsPct: number;
    flagApplicable: boolean;
  };
  accountingNote: string;
  complianceAudit: AutoComplianceAuditSupplement;
  complianceAuditPage: AutoComplianceAuditPage;
  personaInsights: PersonaInsight[];
  cfoPnlCarbon: CfoPnlCarbonLine[];
  modelCarbonEconomics: ModelCarbonEconomics[];
  procurementScorecards: ProcurementSupplierScorecard[];
  dataQualityGaps: DataQualityGap[];
  csoAssuranceGaps: CsoAssuranceGap[];
  supplierDrillById: Record<string, SupplierDrillDetail>;
}

/** Filtered slice passed to views — totals reconciled to selected filters. */
export type FilteredScope3Data = AutomotiveScope3MockData;
