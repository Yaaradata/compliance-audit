/**
 * Lion Brewery Ceylon PLC — AI Compliance Platform (V2).
 * Frontend data model — ported from Stage 5 Frontend & Data Architecture Part 3
 * and Stage 6 Mock Data Structure. camelCase, strict types, no `any`.
 */

// ── Shared enums / primitives ───────────────────────────────────────────────
export type PersonaRole =
  | "CTO"
  | "EXCISE_FINANCE"
  | "QA"
  | "DISTRIBUTION"
  | "REGULATORY"
  | "EHS"
  | "ADMIN";

export type DomainId =
  | "EXCISE"
  | "QUALITY"
  | "DISTRIBUTION"
  | "EXPORT"
  | "ENVIRONMENT"
  | "GOVERNANCE"
  | "LABELLING";

export type ComplianceStatus = "healthy" | "watch" | "risk" | "critical" | "neutral";
export type Severity = "low" | "medium" | "high" | "critical";
export type FlCategory = "FL3" | "FL4" | "FL6" | "FL7" | "FL8" | "FL11" | "FL13A" | "FL22";
export type LicenceStatus = "active" | "suspended" | "expired";
export type Eligibility = "go" | "amber" | "hold" | "unverified";
export type RegulatorFormat =
  | "EXCISE"
  | "SLSI"
  | "FCAU"
  | "CUSTOMS"
  | "NATA"
  | "CEA"
  | "BOARD";
export type ReleaseStatus = "pending" | "released" | "held" | "rejected";
export type PackType = "bottle_625" | "bottle_330" | "can_500" | "can_330" | "keg";
export type SourceSystem =
  | "SAP"
  | "LIMS"
  | "EXCISE_PORTAL"
  | "STICKER_PORTAL"
  | "FL_REGISTER"
  | "ASYCUDA"
  | "DMS"
  | "MANUAL"
  | "IOT";
export type ScreenId =
  | "dashboard"
  | "excise"
  | "batches"
  | "pos-licences"
  | "evidence"
  | "registry";

export type CapaStatus = "open" | "in_progress" | "closed";
export type AiConfidence = "fact" | "hypothesis";

// ── Evidence link ───────────────────────────────────────────────────────────
export interface EvidenceLink {
  id: string;
  label: string;
  sourceSystem: SourceSystem;
  entityType: string;
  hash?: string;
}

// ── Batch ───────────────────────────────────────────────────────────────────
export interface Batch {
  batchId: string;
  sapProcessOrderNo: string;
  skuName: string;
  packType: PackType;
  brewDate: string;
  packagedDate: string;
  dateCode: string;
  unitsPackaged: number;
  packagedVolumeL: number;
  measuredAbvPct: number;
  targetAbvPct: number;
  releaseStatus: ReleaseStatus;
  abvSignedByName: string | null;
  abvSignedAt: string | null;
  stickerSerialRange: string;
  lpa: number;
  stickerGap: number | null;
  abvVariancePct: number;
  lineNo: string;
}

// ── QC test result ──────────────────────────────────────────────────────────
export type QcGate = "incoming" | "in_process" | "release" | "stability";
export type QcParameter =
  | "abv"
  | "gravity"
  | "ph"
  | "co2"
  | "turbidity"
  | "micro"
  | "fill_volume"
  | "sensory";

export interface QcTestResult {
  resultId: string;
  batchId: string;
  gate: QcGate;
  parameter: QcParameter;
  value: number | string;
  unit: string;
  specMin: number | null;
  specMax: number | null;
  pass: boolean | null;
  testedAt: string;
  source: "lims" | "instrument" | "excel" | "paper_ocr" | "manual";
  testedByName: string | null;
}

// ── Material lot ────────────────────────────────────────────────────────────
export interface MaterialLot {
  lotId: string;
  batchId: string;
  materialType: "malt" | "hops" | "yeast" | "co2" | "packaging" | "adjunct";
  supplierName: string;
  qtyKg: number | null;
  coaDocId: string | null;
  coaMatchStatus: "matched" | "exception" | "pending";
  receivedDate: string;
}

// ── Excise declaration ──────────────────────────────────────────────────────
export interface ExciseDeclaration {
  declarationId: string;
  period: string;
  totalUnitsRemoved: number;
  totalVolumeL: number;
  totalLpa: number;
  dutyRateApplied: string;
  dutyAmountLkr: number;
  stickerUnitsReconciled: number;
  stickerVariance: number;
  exciseRegisterMatch: string;
  status: "draft" | "filed" | "accepted";
  signedBy: string | null;
  excisePortalRef: string | null;
  totalVarianceLkr: number;
  removalRefsCount: number;
}

// ── Fool Proof sticker record ───────────────────────────────────────────────
export interface FoolProofStickerRecord {
  stickerBatchId: string;
  serialRangeStart: string;
  serialRangeEnd: string;
  qtyOrdered: number;
  qtyApplied: number;
  qtyVoided: number;
  appliedToBatchId: string;
  status: "reconciled" | "variance_flagged" | "ordered";
  stickerCostPerUnit: number;
  lineApplied: string;
}

// ── Transport permit ────────────────────────────────────────────────────────
export interface TransportPermit {
  permitId: string;
  permitNo: string;
  dispatchOrderId: string | null;
  origin: string;
  destination: string;
  validFrom: string;
  validTo: string;
  status: "used" | "expired" | "missing";
  vehicleRegNo: string;
  driverName: string;
}

// ── Reconciliation row (four-way diff) ──────────────────────────────────────
export interface ReconciliationRow {
  removalId: string;
  unitsRemoved: number;
  volumeL: number;
  stickersApplied: number;
  dutyDeclaredLkr: number;
  permitId: string | null;
  batchId: string;
  stickerOrderRef: string;
  status: ComplianceStatus;
  stickerDelta: number;
  dutyAtRiskLkr: number;
  hasPermit: boolean;
  abvDeclared?: number;
  abvActual?: number;
  note?: string;
}

// ── Label version ───────────────────────────────────────────────────────────
export interface LabelVersion {
  labelId: string;
  skuId: string;
  market: string;
  version: string;
  artworkDocId: string;
  effectiveFrom: string;
  status: "approved" | "draft" | "retired";
  approvedByName: string;
}

// ── Customer licence ────────────────────────────────────────────────────────
export interface CustomerLicence {
  flNo: string;
  customerId: string;
  flCategory: FlCategory;
  holderName: string;
  address: string;
  district: string;
  province: string;
  validFrom: string;
  validTo: string;
  status: LicenceStatus;
  hasOrderToday: boolean;
  orderCasesToday: number;
  licenceDocUri: string;
  daysToExpiry: number;
  eligibility: Eligibility;
  eligibilityReason: string;
  dispatchDecision?: "go" | "amber" | "hold";
}

// ── Dispatch order ──────────────────────────────────────────────────────────
export interface DispatchOrder {
  dispatchId: string;
  flNo: string;
  batchId: string;
  skuName: string;
  unitsCases: number;
  unitsBottles: number;
  dispatchDate: string;
  permitId: string | null;
  validityDecision: "go" | "amber" | "hold";
  settlementMode: "cash" | "credit" | "transfer";
}

// ── Export ──────────────────────────────────────────────────────────────────
export interface ExportShipment {
  shipmentId: string;
  destination: string;
  incoterm: string;
  asycudaCusDecNo: string;
  blNo: string;
  fxExpectedAmount: number;
  fxReceivedAmount: number | null;
  fxDueDate: string;
  status: "closed" | "docs_pending" | "planned";
  completenessScore: number;
  gap: string | null;
}

export interface ExportDoc {
  docType: string;
  required: boolean;
  present: boolean;
  valid: boolean;
  docId: string | null;
}

export interface ExportDocumentBundle {
  bundleId: string;
  shipmentId: string;
  requiredDocs: ExportDoc[];
  completenessScore: number;
  gaps: string[];
  clearanceDecision: "clear" | "hold";
}

// ── Compliance finding ──────────────────────────────────────────────────────
export interface ComplianceFinding {
  findingId: string;
  title: string;
  domain: DomainId;
  severity: Severity;
  capaStatus: CapaStatus;
  dueDate: string;
  ownerId: string | null;
  ownerName: string | null;
  ownerRole: PersonaRole | null;
  whatFailed: string;
  requiredAction: string;
  aiReasoning: string;
  aiConfidence: AiConfidence;
  metricBreach: { label: string; value: string };
  evidence: EvidenceLink[];
  ageHours: number;
  openedAt: string;
  closedAt?: string | null;
}

// ── Resolution thread (per finding) ─────────────────────────────────────────
export interface ResolutionEvent {
  ts: string;
  actor: string;
  text: string;
  isAi?: boolean;
}

// ── Evidence pack ───────────────────────────────────────────────────────────
export interface PackContentItem {
  itemId: string;
  label: string;
  recordCount: number;
  status: "present" | "missing" | "stale";
  included: boolean;
}

export interface EvidencePack {
  packId: string;
  domain: string;
  format: RegulatorFormat;
  scopeRef: { type: "period" | "batch" | "shipment" | "domain"; ref: string };
  generatedTs: string | null;
  generatedBy: string | null;
  completenessScore: number | null;
  gaps: string[];
  hash: string | null;
  status: "idle" | "assembling" | "generating" | "ready" | "stale";
  docCount?: number;
  sizeMb?: number;
}

// ── Audit event ─────────────────────────────────────────────────────────────
export interface AuditEvent {
  eventId: string;
  eventType:
    | "compute"
    | "flag"
    | "view"
    | "edit"
    | "sign"
    | "generate"
    | "override"
    | "assign"
    | "resolve"
    | "escalate";
  actor: string;
  entityRef: string;
  ts: string;
  description: string;
}

// ── Regulatory actor ────────────────────────────────────────────────────────
export interface RegulatoryActor {
  actorId: string;
  name: string;
  fullName: string;
  jurisdiction: string;
  relevantCapabilities: string[];
  residencyNote?: string;
}

// ── Obligation control ──────────────────────────────────────────────────────
export interface ObligationControl {
  obligationId: string;
  obligationText: string;
  regulator: string;
  control: string;
  ownerRole: PersonaRole;
  evidenceType: string;
  frequency: "daily" | "batch" | "monthly" | "event" | "annual";
  capabilityIds: string[];
  configValue: string | null;
  controlStatus: "passing" | "failing";
  domain: DomainId;
  industry: "Brewing" | "Distilling";
}

// ── Domain health score ─────────────────────────────────────────────────────
export interface DomainHealthScore {
  domainId: DomainId;
  label: string;
  status: ComplianceStatus;
  trend: "up" | "down" | "flat";
  score: number;
  openFindingsCount: number;
  openCriticalCount: number;
  topFindingText: string | null;
  topFindingId: string | null;
  ownerName: string | null;
  ownerRole: PersonaRole | null;
  lastAuditResult: "PASSED" | "FAILED" | "PENDING" | "N_A";
  lastAuditDate: string | null;
}

// ── User ────────────────────────────────────────────────────────────────────
export interface User {
  userId: string;
  name: string;
  role: PersonaRole;
  language: string;
  email: string;
  avatarInitials: string;
  isSystem?: boolean;
}

// ── Timeline snapshot ───────────────────────────────────────────────────────
export interface TimelineSnapshot {
  snapshotId: string;
  timestamp: string;
  label: string;
  eventType:
    | "batch_release"
    | "declaration_filed"
    | "dispatch"
    | "finding_opened"
    | "finding_closed"
    | "licence_sync";
  entityRef: string;
  postureAtTs: ComplianceStatus;
}

// ── AI change feed item ─────────────────────────────────────────────────────
export interface AiInsight {
  insightId: string;
  domain: DomainId;
  text: string;
  reasoning: string;
  timeAgo: string;
  severity: Severity;
  findingId?: string;
}

// ── Fixture root ────────────────────────────────────────────────────────────
export interface FixtureMeta {
  seed: number;
  generatedAt: string;
  scenario: string;
  siteId: string;
  companyName: string;
  fiscalYear: string;
  demoPeriod: string;
  dataVersion: string;
}

export interface DerivedAggregates {
  overallPostureBand: ComplianceStatus;
  openCriticalCount: number;
  deadlinesWithin7dCount: number;
  dutyPositionJune2026Lkr: number;
  annualLiabilityContextLkr: number;
  posLicenceComplianceRate: number;
  totalVarianceLkr: number;
  reconciliationBreakCount: number;
  reconciliationCriticalCount: number;
  posTotals: {
    active: number;
    suspended: number;
    expiringWithin7d: number;
    ineligibleWithOrderToday: number;
  };
}

export interface MockFixture {
  meta: FixtureMeta;
  entities: {
    batches: Batch[];
    qcTestResults: QcTestResult[];
    materialLots: MaterialLot[];
    exciseDeclarations: ExciseDeclaration[];
    foolProofStickerInventory: FoolProofStickerRecord[];
    transportPermits: TransportPermit[];
    reconciliationRows: ReconciliationRow[];
    labelVersions: LabelVersion[];
    customerLicences: CustomerLicence[];
    dispatchOrders: DispatchOrder[];
    exportShipments: ExportShipment[];
    exportDocumentBundles: ExportDocumentBundle[];
    complianceFindings: ComplianceFinding[];
    evidencePacks: EvidencePack[];
    auditEvents: AuditEvent[];
    regulatoryActors: RegulatoryActor[];
    obligationControls: ObligationControl[];
    domainHealthScores: DomainHealthScore[];
    users: User[];
    aiInsights: AiInsight[];
    resolutionThreads: Record<string, ResolutionEvent[]>;
  };
  timelineSnapshots: TimelineSnapshot[];
  derivedAggregates: DerivedAggregates;
}
