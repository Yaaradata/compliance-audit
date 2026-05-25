/** Value chain UI model — mirrors banking UpstreamDownstream structure for OEM Scope 3. */

export interface ValueChainHeroMock {
  companyTicker: string;
  upstreamEntities: { name: string; note?: string }[];
  downstreamEntities: { name: string; note?: string }[];
  upstreamPctScope3: number;
  downstreamPctScope3: number;
  upstreamTCO2e: number;
  downstreamTCO2e: number;
  tagline: string;
  flowLeftLabel: string;
  flowRightLabel: string;
}

export interface ValueChainDrillEvidenceLine {
  label: string;
  value: string;
  status?: "ok" | "warning" | "gap";
}

export interface ValueChainCategoryDrill {
  narrative: string;
  methodology: string[];
  sites: { name: string; tco2e: number; sharePct: number; note?: string }[];
  dataLayer: ValueChainDrillEvidenceLine[];
  controls: string[];
  openFindings: string[];
}

export interface ValueChainSupplierDrill {
  vendorId: string;
  contractId: string;
  spendFY: string;
  efSource: string;
  breakdown: { label: string; tco2e: number; pct: number }[];
  submissionStatus: string;
  reviewerNote: string;
}

export interface ValueChainSegmentDrill {
  bookShareNarrative: string;
  topConcentrations: { name: string; units: number; tco2e: number; note?: string }[];
  methodologyNotes: string[];
  limitsAndMitigants: string[];
}

export interface ValueChainSectorDrill {
  macroLink: string;
  policyHooks: string[];
  topModels: { name: string; units: number; intensity: number }[];
  watchSignals: string[];
}

export interface ValueChainModelDrill {
  attributionSteps: { label: string; detail: string; value?: string }[];
  evidencePack: { doc: string; dated: string; reliedUpon: string }[];
  dataGaps: string[];
  engagementStatus: string;
  nextReview: string;
}

export interface ValueChainCategoryRow {
  id: string;
  label: string;
  tco2e: number;
  flagLabel?: string;
  drill?: ValueChainCategoryDrill;
}

export interface ValueChainSupplierRow {
  supplier: string;
  supply: string;
  spendCr: number;
  tco2e: number;
  category: string;
  drill?: ValueChainSupplierDrill;
}

export interface ValueChainUpstreamPanel {
  headerTitle: string;
  sublabel: string;
  pctScope3: number;
  totalTCO2e: number;
  categories: ValueChainCategoryRow[];
  suppliers: ValueChainSupplierRow[];
  supplierNote: string;
  decarbSignals: { label: string; value: string }[];
  supplierTargetProgress: { label: string; pctAchieved: number };
}

export interface ValueChainSegmentRow {
  id: string;
  label: string;
  unitsProduced: number;
  tco2e: number;
  pctFleet: number;
  dataQualityScore: number;
  drill?: ValueChainSegmentDrill;
}

export interface ValueChainSectorPoint {
  sector: string;
  volumeUnits: number;
  intensityPerVehicle: number;
  models: number;
  quadrant: "TR" | "TL" | "BR" | "BL";
  fill: string;
  drill?: ValueChainSectorDrill;
}

export interface ValueChainModelAttribution {
  id: string;
  name: string;
  lifetimeKm: number;
  gridKgPerKwh: number;
  usePhaseTCO2e: number;
  unitsSoldFY: number;
  attributedTCO2e: number;
  dataQualityScore: number;
  dataQualityLabel: string;
  drill?: ValueChainModelDrill;
}

export interface ValueChainLifecycleSplit {
  title: string;
  tco2e: number;
  pctFleet: number;
  narrative: string[];
  intensityLabel: string;
  statusLabel: string;
  statusTone: "green" | "amber" | "red";
}

export interface ValueChainDownstreamPanel {
  headerTitle: string;
  sublabel: string;
  pctScope3: number;
  totalTCO2e: number;
  segments: ValueChainSegmentRow[];
  sectorPoints: ValueChainSectorPoint[];
  quadrantLabels: { key: ValueChainSectorPoint["quadrant"]; title: string; subtitle: string }[];
  models: ValueChainModelAttribution[];
  attributionBoxTitle: string;
  attributionIntro: string;
  iceDominant: ValueChainLifecycleSplit;
  evGrowing: ValueChainLifecycleSplit;
  hybridBridge: ValueChainLifecycleSplit;
  netPositionLine: string;
}

export interface ValueChainFunnelStage {
  id: string;
  title: string;
  subtitle: string;
  count: number;
  pctOfPrior: number;
}

export interface ValueChainEngagement {
  funnelTitle: string;
  stages: ValueChainFunnelStage[];
  insightLineA: string;
  insightLineB: string;
}

export interface ValueChainTrendPoint {
  fy: string;
  downstreamActual: number;
  downstreamTarget: number;
  upstreamActual: number;
  upstreamTarget: number;
}

export interface ValueChainTrend {
  points: ValueChainTrendPoint[];
  annotations: { fy: string; text: string; tone: "up" | "down" }[];
  gapLabel: string;
  gapTCO2e: number;
  footerLines: string[];
}

export interface ValueChainMockData {
  hero: ValueChainHeroMock;
  upstream: ValueChainUpstreamPanel;
  downstream: ValueChainDownstreamPanel;
  engagement: ValueChainEngagement;
  trend: ValueChainTrend;
}
