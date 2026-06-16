/**
 * mockData.ts — Lion Brewery Ceylon PLC compliance fixture (V2).
 * Generated deterministically from seed 20260616 per Stage 6 Mock Data Structure.
 * Grounding constants applied exactly. No placeholder data.
 *
 * DO NOT freehand domain numbers in components — read from this fixture.
 */
import type {
  AiInsight,
  AuditEvent,
  Batch,
  ComplianceFinding,
  CustomerLicence,
  DispatchOrder,
  DomainHealthScore,
  EvidencePack,
  ExciseDeclaration,
  ExportDocumentBundle,
  ExportShipment,
  FoolProofStickerRecord,
  LabelVersion,
  MaterialLot,
  MockFixture,
  ObligationControl,
  QcTestResult,
  ReconciliationRow,
  RegulatoryActor,
  ResolutionEvent,
  TimelineSnapshot,
  TransportPermit,
  User,
} from "./types";

const BONDED_WH = "Biyagama Bonded Warehouse, No. 254, Colombo Road, Biyagama";
const DUTY_RATE_REF = "Rs 56.19/LPA beer<5%ABV (Excise Notification 2026-01)";

// ── Users ───────────────────────────────────────────────────────────────────
const users: User[] = [
  { userId: "user_dinesh", name: "Dinesh Weerasinghe", role: "CTO", language: "en", email: "dinesh.w@lionbrew.lk", avatarInitials: "DW" },
  { userId: "user_priyantha", name: "Priyantha Silva", role: "EXCISE_FINANCE", language: "en", email: "priyantha.s@lionbrew.lk", avatarInitials: "PS" },
  { userId: "user_nilanthi", name: "Nilanthi Perera", role: "QA", language: "en", email: "nilanthi.p@lionbrew.lk", avatarInitials: "NP" },
  { userId: "user_roshan", name: "Roshan Fernando", role: "DISTRIBUTION", language: "en", email: "roshan.f@lionbrew.lk", avatarInitials: "RF" },
  { userId: "user_amaya", name: "Amaya Jayasuriya", role: "REGULATORY", language: "en", email: "amaya.j@lionbrew.lk", avatarInitials: "AJ" },
  { userId: "user_system", name: "Lion Compliance Platform", role: "ADMIN", language: "en", email: "system@lionbrew.lk", avatarInitials: "SY", isSystem: true },
];

// ── Regulatory actors ───────────────────────────────────────────────────────
const regulatoryActors: RegulatoryActor[] = [
  { actorId: "RA-EXCISE-DEPT", name: "Excise Department", fullName: "Department of Excise, Ministry of Finance", jurisdiction: "Sri Lanka", residencyNote: "Resident Excise Unit physically stationed at Biyagama brewery", relevantCapabilities: ["C6", "C7", "C8", "C11", "C17"] },
  { actorId: "RA-SLSI", name: "SLSI", fullName: "Sri Lanka Standards Institution (SLSI)", jurisdiction: "Sri Lanka", relevantCapabilities: ["C3", "C12", "C13", "C24"] },
  { actorId: "RA-NATA", name: "NATA", fullName: "National Authority on Tobacco and Alcohol (NATA)", jurisdiction: "Sri Lanka", relevantCapabilities: ["C14"] },
  { actorId: "RA-CEA", name: "CEA", fullName: "Central Environmental Authority (CEA)", jurisdiction: "Sri Lanka", relevantCapabilities: ["C27"] },
  { actorId: "RA-CUSTOMS", name: "Sri Lanka Customs", fullName: "Sri Lanka Customs, Department of Customs", jurisdiction: "Sri Lanka", relevantCapabilities: ["C22", "C20"] },
  { actorId: "RA-FCAU", name: "FCAU", fullName: "FCAU / National Plant Quarantine Service — Export Health Certificate Authority", jurisdiction: "Sri Lanka", relevantCapabilities: ["C20", "C21", "C23"] },
];

// ── Batches ─────────────────────────────────────────────────────────────────
function mkBatch(b: Partial<Batch> & Pick<Batch, "batchId" | "sapProcessOrderNo" | "skuName" | "packType" | "packagedDate" | "unitsPackaged" | "measuredAbvPct" | "targetAbvPct" | "releaseStatus">): Batch {
  const packagedVolumeL = b.packagedVolumeL ?? Number((b.unitsPackaged * 0.625).toFixed(1));
  const lpa = b.lpa ?? Number((packagedVolumeL * (b.measuredAbvPct / 100)).toFixed(1));
  return {
    brewDate: b.brewDate ?? shiftDate(b.packagedDate, -4),
    dateCode: b.dateCode ?? `BBE2026-12-${b.packagedDate.slice(8)} ${b.lineNo ?? "L1"} ${b.batchId.slice(-3)}`,
    abvSignedByName: b.abvSignedByName ?? null,
    abvSignedAt: b.abvSignedAt ?? null,
    stickerSerialRange: b.stickerSerialRange ?? "FPS-2026-AA0000001..AA0000000",
    stickerGap: b.stickerGap ?? 0,
    abvVariancePct: b.abvVariancePct ?? Number(Math.abs(b.measuredAbvPct - b.targetAbvPct).toFixed(1)),
    lineNo: b.lineNo ?? "L1",
    ...b,
    packagedVolumeL,
    lpa,
  };
}

function shiftDate(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const batches: Batch[] = [
  mkBatch({
    batchId: "LL625-BIY-20260612-014",
    sapProcessOrderNo: "4500087321",
    skuName: "Lion Lager 625 ml",
    packType: "bottle_625",
    brewDate: "2026-06-08",
    packagedDate: "2026-06-12",
    dateCode: "BBE2026-12-08 L2 014",
    unitsPackaged: 76800,
    packagedVolumeL: 48000,
    measuredAbvPct: 4.8,
    targetAbvPct: 4.8,
    lpa: 2304.0,
    releaseStatus: "released",
    abvSignedByName: "Nilanthi Perera",
    abvSignedAt: "2026-06-12T09:42:00+05:30",
    stickerSerialRange: "FPS-2026-AA0480001..AA0556800",
    stickerGap: 1200,
    abvVariancePct: 0.0,
    lineNo: "L2",
  }),
  mkBatch({
    batchId: "LL625-BIY-20260614-016",
    sapProcessOrderNo: "4500087398",
    skuName: "Lion Lager 625 ml",
    packType: "bottle_625",
    brewDate: "2026-06-10",
    packagedDate: "2026-06-14",
    unitsPackaged: 72000,
    packagedVolumeL: 45000,
    measuredAbvPct: 4.8,
    targetAbvPct: 4.8,
    releaseStatus: "held",
    abvSignedByName: null,
    stickerGap: null,
    lineNo: "L2",
  }),
  mkBatch({
    batchId: "LL625-BIY-20260608-010",
    sapProcessOrderNo: "4500087244",
    skuName: "Lion Lager 625 ml",
    packType: "bottle_625",
    brewDate: "2026-06-04",
    packagedDate: "2026-06-08",
    unitsPackaged: 69120,
    packagedVolumeL: 43200,
    measuredAbvPct: 5.1,
    targetAbvPct: 4.8,
    lpa: 2203.2,
    releaseStatus: "released",
    abvSignedByName: "Nilanthi Perera",
    abvSignedAt: "2026-06-08T11:20:00+05:30",
    abvVariancePct: 0.3,
    lineNo: "L1",
  }),
  // Filler released batches — Mon–Thu cadence across May 12 → Jun 11.
  mkBatch({ batchId: "LS625-BIY-20260610-012", sapProcessOrderNo: "4500087266", skuName: "Lion Strong 625 ml", packType: "bottle_625", packagedDate: "2026-06-10", unitsPackaged: 60000, measuredAbvPct: 5.8, targetAbvPct: 7.5, releaseStatus: "released", abvSignedByName: "Chamara Bandara", abvSignedAt: "2026-06-10T10:05:00+05:30", abvVariancePct: 1.7, lineNo: "L3" }),
  mkBatch({ batchId: "TC330-BIY-20260611-013", sapProcessOrderNo: "4500087290", skuName: "Three Coins Lager 330 ml", packType: "bottle_330", packagedDate: "2026-06-11", unitsPackaged: 96000, measuredAbvPct: 4.8, targetAbvPct: 4.8, releaseStatus: "released", abvSignedByName: "Chamara Bandara", abvSignedAt: "2026-06-11T09:10:00+05:30", lineNo: "L1" }),
  mkBatch({ batchId: "LC500-BIY-20260609-011", sapProcessOrderNo: "4500087255", skuName: "Lion Can 500 ml", packType: "can_500", packagedDate: "2026-06-09", unitsPackaged: 72000, measuredAbvPct: 4.8, targetAbvPct: 4.8, releaseStatus: "released", abvSignedByName: "Chamara Bandara", abvSignedAt: "2026-06-09T08:50:00+05:30", lineNo: "L2" }),
  mkBatch({ batchId: "LL625-BIY-20260604-008", sapProcessOrderNo: "4500087201", skuName: "Lion Lager 625 ml", packType: "bottle_625", packagedDate: "2026-06-04", unitsPackaged: 76800, measuredAbvPct: 4.7, targetAbvPct: 4.8, releaseStatus: "released", abvSignedByName: "Nilanthi Perera", abvSignedAt: "2026-06-04T09:30:00+05:30", lineNo: "L2" }),
  mkBatch({ batchId: "LL330-BIY-20260603-007", sapProcessOrderNo: "4500087188", skuName: "Lion Lager 330 ml", packType: "bottle_330", packagedDate: "2026-06-03", unitsPackaged: 100800, measuredAbvPct: 4.8, targetAbvPct: 4.8, releaseStatus: "released", abvSignedByName: "Chamara Bandara", abvSignedAt: "2026-06-03T09:00:00+05:30", lineNo: "L1" }),
  mkBatch({ batchId: "LS625-BIY-20260602-006", sapProcessOrderNo: "4500087172", skuName: "Lion Strong 625 ml", packType: "bottle_625", packagedDate: "2026-06-02", unitsPackaged: 57600, measuredAbvPct: 7.5, targetAbvPct: 7.5, releaseStatus: "released", abvSignedByName: "Chamara Bandara", abvSignedAt: "2026-06-02T10:20:00+05:30", lineNo: "L3" }),
  mkBatch({ batchId: "TC330-BIY-20260529-005", sapProcessOrderNo: "4500087145", skuName: "Three Coins Lager 330 ml", packType: "bottle_330", packagedDate: "2026-05-29", unitsPackaged: 96000, measuredAbvPct: 4.8, targetAbvPct: 4.8, releaseStatus: "released", abvSignedByName: "Chamara Bandara", abvSignedAt: "2026-05-29T09:15:00+05:30", lineNo: "L1" }),
  mkBatch({ batchId: "LL625-BIY-20260528-004", sapProcessOrderNo: "4500087130", skuName: "Lion Lager 625 ml", packType: "bottle_625", packagedDate: "2026-05-28", unitsPackaged: 81600, measuredAbvPct: 4.8, targetAbvPct: 4.8, releaseStatus: "released", abvSignedByName: "Nilanthi Perera", abvSignedAt: "2026-05-28T09:25:00+05:30", lineNo: "L2" }),
  mkBatch({ batchId: "LC500-BIY-20260527-003", sapProcessOrderNo: "4500087118", skuName: "Lion Can 500 ml", packType: "can_500", packagedDate: "2026-05-27", unitsPackaged: 72000, measuredAbvPct: 4.8, targetAbvPct: 4.8, releaseStatus: "released", abvSignedByName: "Chamara Bandara", abvSignedAt: "2026-05-27T08:40:00+05:30", lineNo: "L2" }),
  mkBatch({ batchId: "CW330-BIY-20260521-002", sapProcessOrderNo: "4500087090", skuName: "Craft White Wheat 330 ml", packType: "bottle_330", packagedDate: "2026-05-21", unitsPackaged: 38400, measuredAbvPct: 5.0, targetAbvPct: 5.0, releaseStatus: "released", abvSignedByName: "Chamara Bandara", abvSignedAt: "2026-05-21T10:00:00+05:30", lineNo: "L3" }),
  mkBatch({ batchId: "LL625-BIY-20260520-001", sapProcessOrderNo: "4500087066", skuName: "Lion Lager 625 ml", packType: "bottle_625", packagedDate: "2026-05-20", unitsPackaged: 76800, measuredAbvPct: 4.8, targetAbvPct: 4.8, releaseStatus: "released", abvSignedByName: "Nilanthi Perera", abvSignedAt: "2026-05-20T09:35:00+05:30", lineNo: "L2" }),
  mkBatch({ batchId: "TC330-BIY-20260515-018", sapProcessOrderNo: "4500087040", skuName: "Three Coins Lager 330 ml", packType: "bottle_330", packagedDate: "2026-05-15", unitsPackaged: 96000, measuredAbvPct: 4.8, targetAbvPct: 4.8, releaseStatus: "released", abvSignedByName: "Chamara Bandara", abvSignedAt: "2026-05-15T09:05:00+05:30", lineNo: "L1" }),
  mkBatch({ batchId: "LL625-BIY-20260513-017", sapProcessOrderNo: "4500087025", skuName: "Lion Lager 625 ml", packType: "bottle_625", packagedDate: "2026-05-13", unitsPackaged: 76800, measuredAbvPct: 4.8, targetAbvPct: 4.8, releaseStatus: "released", abvSignedByName: "Nilanthi Perera", abvSignedAt: "2026-05-13T09:20:00+05:30", lineNo: "L2" }),
  // In-progress (pending) batch
  mkBatch({ batchId: "LL330-BIY-20260615-019", sapProcessOrderNo: "4500087412", skuName: "Lion Lager 330 ml", packType: "bottle_330", packagedDate: "2026-06-15", unitsPackaged: 100800, measuredAbvPct: 4.8, targetAbvPct: 4.8, releaseStatus: "pending", abvSignedByName: null, stickerGap: null, lineNo: "L1" }),
  // Rejected batch
  mkBatch({ batchId: "CW330-BIY-20260605-009", sapProcessOrderNo: "4500087215", skuName: "Craft White Wheat 330 ml", packType: "bottle_330", packagedDate: "2026-06-05", unitsPackaged: 38400, measuredAbvPct: 4.4, targetAbvPct: 5.0, releaseStatus: "rejected", abvSignedByName: null, abvVariancePct: 0.6, lineNo: "L3" }),
];

// ── QC test results ─────────────────────────────────────────────────────────
const QC_SPECS: Record<string, { unit: string; min: number | null; max: number | null }> = {
  abv: { unit: "%", min: 4.6, max: 5.0 },
  ph: { unit: "", min: 3.9, max: 4.5 },
  co2: { unit: "vol", min: 2.4, max: 2.8 },
  turbidity: { unit: "NTU", min: 0, max: 0.5 },
  micro: { unit: "CFU/ml", min: null, max: 50 },
  fill_volume: { unit: "ml", min: 620, max: 630 },
  sensory: { unit: "", min: null, max: null },
};

function buildQcForBatch(b: Batch): QcTestResult[] {
  const testedBy = b.batchId.startsWith("LL625") ? "Nilanthi Perera" : "Chamara Bandara";
  const dt = `${b.packagedDate}T08:30:00+05:30`;
  const rows: QcTestResult[] = [
    { resultId: `QCR-${b.batchId}-ABV-001`, batchId: b.batchId, gate: "release", parameter: "abv", value: b.measuredAbvPct, unit: "%", specMin: 4.6, specMax: 5.0, pass: b.measuredAbvPct <= 5.0, testedAt: dt, source: "lims", testedByName: testedBy },
    { resultId: `QCR-${b.batchId}-PH-001`, batchId: b.batchId, gate: "release", parameter: "ph", value: 4.2, unit: "", specMin: 3.9, specMax: 4.5, pass: true, testedAt: dt, source: "lims", testedByName: testedBy },
    { resultId: `QCR-${b.batchId}-CO2-001`, batchId: b.batchId, gate: "release", parameter: "co2", value: 2.62, unit: "vol", specMin: 2.4, specMax: 2.8, pass: true, testedAt: dt, source: "lims", testedByName: testedBy },
    { resultId: `QCR-${b.batchId}-TURB-001`, batchId: b.batchId, gate: "release", parameter: "turbidity", value: 0.28, unit: "NTU", specMin: 0, specMax: 0.5, pass: true, testedAt: dt, source: "lims", testedByName: testedBy },
    { resultId: `QCR-${b.batchId}-MICRO-001`, batchId: b.batchId, gate: "release", parameter: "micro", value: b.releaseStatus === "held" ? "pending" : 48, unit: "CFU/ml", specMin: null, specMax: 50, pass: b.releaseStatus === "held" ? null : true, testedAt: `${b.packagedDate}T08:15:00+05:30`, source: "instrument", testedByName: null },
    { resultId: `QCR-${b.batchId}-FILL-001`, batchId: b.batchId, gate: "release", parameter: "fill_volume", value: 625.1, unit: "ml", specMin: 620, specMax: 630, pass: true, testedAt: dt, source: "lims", testedByName: testedBy },
    { resultId: `QCR-${b.batchId}-SENS-001`, batchId: b.batchId, gate: "release", parameter: "sensory", value: "pass", unit: "", specMin: null, specMax: null, pass: true, testedAt: dt, source: "manual", testedByName: testedBy },
  ];
  return rows;
}

const qcTestResults: QcTestResult[] = batches.flatMap(buildQcForBatch);
// Drift batch ABV flagged false (released under override)
{
  const drift = qcTestResults.find((q) => q.resultId === "QCR-LL625-BIY-20260608-010-ABV-001");
  if (drift) {
    drift.value = 5.1;
    drift.pass = false;
  }
}
void QC_SPECS;

// ── Material lots ───────────────────────────────────────────────────────────
const materialLots: MaterialLot[] = [
  { lotId: "MAT-MALT-202606-003", batchId: "LL625-BIY-20260614-016", materialType: "malt", supplierName: "Soufflet Malt Lanka (Pvt) Ltd", qtyKg: 14500, coaDocId: null, coaMatchStatus: "pending", receivedDate: "2026-06-01" },
  { lotId: "MAT-MALT-202606-001", batchId: "LL625-BIY-20260612-014", materialType: "malt", supplierName: "Soufflet Malt Lanka (Pvt) Ltd", qtyKg: 15400, coaDocId: "DOC-COA-MALT-014", coaMatchStatus: "matched", receivedDate: "2026-06-05" },
  { lotId: "MAT-HOPS-202606-001", batchId: "LL625-BIY-20260612-014", materialType: "hops", supplierName: "Barth-Haas Group", qtyKg: 220, coaDocId: "DOC-COA-HOPS-014", coaMatchStatus: "matched", receivedDate: "2026-06-05" },
  { lotId: "MAT-MALT-202606-002", batchId: "LL625-BIY-20260608-010", materialType: "malt", supplierName: "Soufflet Malt Lanka (Pvt) Ltd", qtyKg: 13800, coaDocId: "DOC-COA-MALT-010", coaMatchStatus: "matched", receivedDate: "2026-06-01" },
  { lotId: "MAT-HOPS-202605-004", batchId: "LS625-BIY-20260610-012", materialType: "hops", supplierName: "Barth-Haas Group", qtyKg: 180, coaDocId: "DOC-COA-HOPS-012", coaMatchStatus: "exception", receivedDate: "2026-05-30" },
];

// ── Excise declarations ─────────────────────────────────────────────────────
const exciseDeclarations: ExciseDeclaration[] = [
  { declarationId: "EXD-2026-05", period: "2026-05", totalUnitsRemoved: 2_980_000, totalVolumeL: 1_862_500, totalLpa: 89_400.0, dutyRateApplied: DUTY_RATE_REF, dutyAmountLkr: 5_023_000_000, stickerUnitsReconciled: 2_980_000, stickerVariance: 0, exciseRegisterMatch: "matched", status: "accepted", signedBy: "user_priyantha", excisePortalRef: "EXCISE-DEC-2026-05-0089", totalVarianceLkr: 0, removalRefsCount: 1243 },
  { declarationId: "EXD-2026-06", period: "2026-06", totalUnitsRemoved: 3_120_000, totalVolumeL: 1_950_000, totalLpa: 93_600.0, dutyRateApplied: DUTY_RATE_REF, dutyAmountLkr: 5_410_000_000, stickerUnitsReconciled: 3_118_800, stickerVariance: -1200, exciseRegisterMatch: "BREAKS_4", status: "draft", signedBy: null, excisePortalRef: null, totalVarianceLkr: 2_340_000, removalRefsCount: 1287 },
];

// ── Fool Proof sticker inventory ────────────────────────────────────────────
const foolProofStickerInventory: FoolProofStickerRecord[] = [
  { stickerBatchId: "FPS-2026-AB", serialRangeStart: "FPS-2026-AB0000001", serialRangeEnd: "FPS-2026-AB0100000", qtyOrdered: 100000, qtyApplied: 75600, qtyVoided: 0, appliedToBatchId: "LL625-BIY-20260612-014", status: "variance_flagged", stickerCostPerUnit: 1.21, lineApplied: "L2" },
  { stickerBatchId: "FPS-2026-AC", serialRangeStart: "FPS-2026-AC0000001", serialRangeEnd: "FPS-2026-AC0100000", qtyOrdered: 100000, qtyApplied: 0, qtyVoided: 0, appliedToBatchId: "LL625-BIY-20260614-016", status: "ordered", stickerCostPerUnit: 1.21, lineApplied: "L2" },
  { stickerBatchId: "FPS-2026-AA", serialRangeStart: "FPS-2026-AA0000001", serialRangeEnd: "FPS-2026-AA0100000", qtyOrdered: 100000, qtyApplied: 76800, qtyVoided: 12, appliedToBatchId: "LL625-BIY-20260604-008", status: "reconciled", stickerCostPerUnit: 1.21, lineApplied: "L2" },
  { stickerBatchId: "FPS-2026-AD", serialRangeStart: "FPS-2026-AD0000001", serialRangeEnd: "FPS-2026-AD0100000", qtyOrdered: 100000, qtyApplied: 69120, qtyVoided: 8, appliedToBatchId: "LL625-BIY-20260608-010", status: "reconciled", stickerCostPerUnit: 1.21, lineApplied: "L1" },
];

// ── Transport permits ───────────────────────────────────────────────────────
const transportPermits: TransportPermit[] = [
  { permitId: "TP-20260614-0312", permitNo: "TP-20260614-0312", dispatchOrderId: "DO-20260614-0007", origin: BONDED_WH, destination: "No. 128, Galle Rd, Colombo 04", validFrom: "2026-06-14T00:00:00+05:30", validTo: "2026-06-14T23:59:59+05:30", status: "used", vehicleRegNo: "WP-CAX-1234", driverName: "Saman Perera" },
  { permitId: "TP-20260613-0301", permitNo: "TP-20260613-0301", dispatchOrderId: "DO-20260613-0006", origin: BONDED_WH, destination: "No. 45, Duplication Rd, Colombo 03", validFrom: "2026-06-13T00:00:00+05:30", validTo: "2026-06-13T23:59:59+05:30", status: "used", vehicleRegNo: "WP-CAT-5678", driverName: "Kamal de Silva" },
  { permitId: "TP-20260610-0288", permitNo: "TP-20260610-0288", dispatchOrderId: "DO-20260610-0004", origin: BONDED_WH, destination: "Negombo Rd, Gampaha", validFrom: "2026-06-10T00:00:00+05:30", validTo: "2026-06-10T23:59:59+05:30", status: "used", vehicleRegNo: "WP-CAB-9012", driverName: "Nuwan Jayawardena" },
];

// ── Reconciliation rows (the four-way diff grid) ────────────────────────────
const dutyDeclared = (volumeL: number, abv: number) => Math.round(volumeL * (abv / 100) * 56.19);
const reconciliationRows: ReconciliationRow[] = [
  { removalId: "GP-20260614-0312", unitsRemoved: 28800, volumeL: 18000, stickersApplied: 27600, dutyDeclaredLkr: dutyDeclared(18000, 4.8), permitId: "TP-20260614-0312", batchId: "LL625-BIY-20260612-014", stickerOrderRef: "FPS-2026-AB", status: "critical", stickerDelta: -1200, dutyAtRiskLkr: 900000, hasPermit: true, abvDeclared: 4.8, abvActual: 4.8 },
  { removalId: "GP-20260613-0301", unitsRemoved: 24000, volumeL: 15000, stickersApplied: 24000, dutyDeclaredLkr: dutyDeclared(15000, 4.8), permitId: "TP-20260613-0301", batchId: "LL625-BIY-20260608-010", stickerOrderRef: "FPS-2026-AD", status: "watch", stickerDelta: 0, dutyAtRiskLkr: 1_100_000, hasPermit: true, abvDeclared: 4.8, abvActual: 5.1, note: "ABV drift — declared 4.8% vs lab 5.1%" },
  { removalId: "GP-20260610-0288", unitsRemoved: 21600, volumeL: 13500, stickersApplied: 21600, dutyDeclaredLkr: dutyDeclared(13500, 4.8), permitId: "TP-20260610-0288", batchId: "LL625-BIY-20260604-008", stickerOrderRef: "FPS-2026-AA", status: "watch", stickerDelta: 0, dutyAtRiskLkr: 340_000, hasPermit: true, note: "Timing — Excise register sync lag" },
  { removalId: "GP-20260611-0295", unitsRemoved: 14400, volumeL: 9000, stickersApplied: 14400, dutyDeclaredLkr: dutyDeclared(9000, 4.8), permitId: null, batchId: "TC330-BIY-20260611-013", stickerOrderRef: "FPS-2026-AE", status: "watch", stickerDelta: 0, dutyAtRiskLkr: 0, hasPermit: false, note: "Missing transport permit" },
  { removalId: "GP-20260602-0210", unitsRemoved: 19200, volumeL: 12000, stickersApplied: 19200, dutyDeclaredLkr: dutyDeclared(12000, 4.8), permitId: "TP-20260602-0210", batchId: "LL625-BIY-20260528-004", stickerOrderRef: "FPS-2026-Z9", status: "healthy", stickerDelta: 0, dutyAtRiskLkr: 0, hasPermit: true },
  { removalId: "GP-20260605-0231", unitsRemoved: 16800, volumeL: 10500, stickersApplied: 16800, dutyDeclaredLkr: dutyDeclared(10500, 4.8), permitId: "TP-20260605-0231", batchId: "LC500-BIY-20260527-003", stickerOrderRef: "FPS-2026-Z8", status: "healthy", stickerDelta: 0, dutyAtRiskLkr: 0, hasPermit: true },
  { removalId: "GP-20260607-0247", unitsRemoved: 24000, volumeL: 15000, stickersApplied: 24000, dutyDeclaredLkr: dutyDeclared(15000, 4.8), permitId: "TP-20260607-0247", batchId: "LL330-BIY-20260603-007", stickerOrderRef: "FPS-2026-Z7", status: "healthy", stickerDelta: 0, dutyAtRiskLkr: 0, hasPermit: true },
  { removalId: "GP-20260609-0263", unitsRemoved: 21600, volumeL: 13500, stickersApplied: 21600, dutyDeclaredLkr: dutyDeclared(13500, 4.8), permitId: "TP-20260609-0263", batchId: "LC500-BIY-20260609-011", stickerOrderRef: "FPS-2026-Z6", status: "healthy", stickerDelta: 0, dutyAtRiskLkr: 0, hasPermit: true },
];

// ── Label versions ──────────────────────────────────────────────────────────
const labelVersions: LabelVersion[] = [
  { labelId: "LV-LL625-LK-v3.2", skuId: "LL625", market: "LK", version: "3.2.0", artworkDocId: "DOC-LBL-LL625-LK-32", effectiveFrom: "2025-03-01", status: "approved", approvedByName: "Regulatory Team" },
  { labelId: "LV-LL625-MV-v2.1", skuId: "LL625", market: "MV", version: "2.1.0", artworkDocId: "DOC-LBL-LL625-MV-21", effectiveFrom: "2025-01-15", status: "approved", approvedByName: "Amaya Jayasuriya" },
  { labelId: "LV-LS625-LK-v2.0", skuId: "LS625", market: "LK", version: "2.0.0", artworkDocId: "DOC-LBL-LS625-LK-20", effectiveFrom: "2024-09-01", status: "approved", approvedByName: "Regulatory Team" },
  { labelId: "LV-TC330-LK-v1.4", skuId: "TC330", market: "LK", version: "1.4.0", artworkDocId: "DOC-LBL-TC330-LK-14", effectiveFrom: "2025-06-01", status: "approved", approvedByName: "Regulatory Team" },
  { labelId: "LV-LC500-LK-v2.3", skuId: "LC500", market: "LK", version: "2.3.0", artworkDocId: "DOC-LBL-LC500-LK-23", effectiveFrom: "2025-02-01", status: "approved", approvedByName: "Regulatory Team" },
  { labelId: "LV-CW330-MV-v1.0", skuId: "CW330", market: "MV", version: "1.0.0", artworkDocId: "DOC-LBL-CW330-MV-10", effectiveFrom: "2026-01-01", status: "approved", approvedByName: "Amaya Jayasuriya" },
  { labelId: "LV-CW330-EU-v1.0", skuId: "CW330", market: "EU", version: "1.0.0", artworkDocId: "DOC-LBL-CW330-EU-10", effectiveFrom: "2026-05-01", status: "draft", approvedByName: "Amaya Jayasuriya" },
  { labelId: "LV-LL625-LK-v3.1", skuId: "LL625", market: "LK", version: "3.1.0", artworkDocId: "DOC-LBL-LL625-LK-31", effectiveFrom: "2024-01-01", status: "retired", approvedByName: "Regulatory Team" },
];

// ── Customer licences ───────────────────────────────────────────────────────
const customerLicences: CustomerLicence[] = [
  { flNo: "FL4/WP/COL/2026/0473", customerId: "CL-A1B2C3D", flCategory: "FL4", holderName: "ABC Wine Stores (Pvt) Ltd", address: "No. 128, Galle Rd, Colombo 04", district: "Colombo", province: "Western", validFrom: "2025-06-20", validTo: "2026-06-19", status: "active", hasOrderToday: true, orderCasesToday: 480, licenceDocUri: "dms://licences/FL4-WP-COL-2026-0473.pdf", daysToExpiry: 3, eligibility: "amber", eligibilityReason: "✦ Licence valid but expires in 3 days. 480-case dispatch will deliver before expiry — eligible. No renewal on file. AMBER." },
  { flNo: "FL4/WP/COL/2026/0812", customerId: "CL-E4F5G6H", flCategory: "FL4", holderName: "Perera Wines & Spirits (Pvt) Ltd", address: "No. 45, Duplication Rd, Colombo 03", district: "Colombo", province: "Western", validFrom: "2026-01-01", validTo: "2026-12-31", status: "active", hasOrderToday: true, orderCasesToday: 240, licenceDocUri: "dms://licences/FL4-WP-COL-2026-0812.pdf", daysToExpiry: 198, eligibility: "go", eligibilityReason: "✦ Licence valid to 2026-12-31. Dispatch eligible." },
  { flNo: "FL4/WP/GMP/2026/0154", customerId: "CL-I7J8K9L", flCategory: "FL4", holderName: "Jayawardena Bottle Store", address: "No. 12, Negombo Rd, Gampaha", district: "Gampaha", province: "Western", validFrom: "2026-01-01", validTo: "2026-12-31", status: "active", hasOrderToday: true, orderCasesToday: 120, licenceDocUri: "dms://licences/FL4-WP-GMP-2026-0154.pdf", daysToExpiry: 198, eligibility: "go", eligibilityReason: "✦ Licence valid to 2026-12-31. Dispatch eligible." },
  { flNo: "FL3/WP/GMP/2026/0091", customerId: "CL-M1N2O3P", flCategory: "FL3", holderName: "Sampath Distributors (Pvt) Ltd", address: "Gampaha (wholesaler)", district: "Gampaha", province: "Western", validFrom: "2026-01-01", validTo: "2026-12-31", status: "active", hasOrderToday: true, orderCasesToday: 1200, licenceDocUri: "dms://licences/FL3-WP-GMP-2026-0091.pdf", daysToExpiry: 198, eligibility: "go", eligibilityReason: "✦ Wholesale licence valid to 2026-12-31. Dispatch eligible." },
  { flNo: "FL4/SP/GAL/2025/0210", customerId: "CL-Q4R5S6T", flCategory: "FL4", holderName: "Southern Spirits Co.", address: "No. 78, Matara Rd, Galle", district: "Galle", province: "Southern", validFrom: "2025-01-01", validTo: "2026-05-31", status: "suspended", hasOrderToday: false, orderCasesToday: 0, licenceDocUri: "dms://licences/FL4-SP-GAL-2025-0210.pdf", daysToExpiry: -16, eligibility: "hold", eligibilityReason: "✦ Licence expired 2026-05-31 and suspended. Dispatch blocked by system." },
  { flNo: "FL7/WP/COL/2026/0034", customerId: "CL-U7V8W9X", flCategory: "FL7", holderName: "Cinnamon Grand Hotel", address: "Colombo 03 (hotel bar)", district: "Colombo", province: "Western", validFrom: "2026-01-01", validTo: "2026-12-31", status: "active", hasOrderToday: true, orderCasesToday: 80, licenceDocUri: "dms://licences/FL7-WP-COL-2026-0034.pdf", daysToExpiry: 198, eligibility: "go", eligibilityReason: "✦ Hotel licence valid to 2026-12-31. Dispatch eligible." },
  { flNo: "FL7/WP/COL/2026/0051", customerId: "CL-Y1Z2A3B", flCategory: "FL7", holderName: "Hilton Colombo", address: "Colombo 02 (hotel bar)", district: "Colombo", province: "Western", validFrom: "2026-01-01", validTo: "2026-12-31", status: "active", hasOrderToday: false, orderCasesToday: 0, licenceDocUri: "dms://licences/FL7-WP-COL-2026-0051.pdf", daysToExpiry: 198, eligibility: "go", eligibilityReason: "✦ Hotel licence valid to 2026-12-31. Dispatch eligible." },
  { flNo: "FL11/WP/COL/2026/0128", customerId: "CL-C4D5E6F", flCategory: "FL11", holderName: "Ministry of Crab", address: "Old Dutch Hospital, Colombo 01", district: "Colombo", province: "Western", validFrom: "2026-01-01", validTo: "2026-12-31", status: "active", hasOrderToday: false, orderCasesToday: 0, licenceDocUri: "dms://licences/FL11-WP-COL-2026-0128.pdf", daysToExpiry: 198, eligibility: "go", eligibilityReason: "✦ Restaurant licence valid to 2026-12-31. Dispatch eligible." },
  { flNo: "FL4/WP/COL/2026/0601", customerId: "CL-G7H8I9J", flCategory: "FL4", holderName: "Lanka Beverages", address: "No. 22, High St, Wellawatte", district: "Colombo", province: "Western", validFrom: "2025-06-20", validTo: "2026-06-19", status: "active", hasOrderToday: false, orderCasesToday: 0, licenceDocUri: "dms://licences/FL4-WP-COL-2026-0601.pdf", daysToExpiry: 3, eligibility: "amber", eligibilityReason: "✦ Licence expires in 3 days (2026-06-19). No order today — watch, lower priority." },
  { flNo: "FL4/NWP/KLT/2026/0088", customerId: "CL-K1L2M3N", flCategory: "FL4", holderName: "Kalutara Wine Store", address: "Kalutara Town", district: "Kalutara", province: "Western", validFrom: "2026-01-01", validTo: "2026-12-31", status: "active", hasOrderToday: false, orderCasesToday: 0, licenceDocUri: "dms://licences/FL4-NWP-KLT-2026-0088.pdf", daysToExpiry: 198, eligibility: "go", eligibilityReason: "✦ Licence valid to 2026-12-31. Dispatch eligible." },
  { flNo: "FL3/CP/KAN/2026/0022", customerId: "CL-O4P5Q6R", flCategory: "FL3", holderName: "Upcountry Distributors Ltd", address: "Kandy", district: "Kandy", province: "Central", validFrom: "2026-01-01", validTo: "2026-12-31", status: "active", hasOrderToday: false, orderCasesToday: 0, licenceDocUri: "dms://licences/FL3-CP-KAN-2026-0022.pdf", daysToExpiry: 198, eligibility: "go", eligibilityReason: "✦ Wholesale licence valid to 2026-12-31. Dispatch eligible." },
  { flNo: "FL4/SP/MAT/2026/0067", customerId: "CL-S7T8U9V", flCategory: "FL4", holderName: "Matara City Wines", address: "Matara", district: "Matara", province: "Southern", validFrom: "2026-01-01", validTo: "2026-12-31", status: "active", hasOrderToday: false, orderCasesToday: 0, licenceDocUri: "dms://licences/FL4-SP-MAT-2026-0067.pdf", daysToExpiry: 198, eligibility: "go", eligibilityReason: "✦ Licence valid to 2026-12-31. Dispatch eligible." },
];

// ── Dispatch orders ─────────────────────────────────────────────────────────
const dispatchOrders: DispatchOrder[] = [
  { dispatchId: "DO-20260614-0007", flNo: "FL4/WP/COL/2026/0473", batchId: "LL625-BIY-20260612-014", skuName: "Lion Lager 625 ml", unitsCases: 480, unitsBottles: 11520, dispatchDate: "2026-06-16", permitId: "TP-20260614-0312", validityDecision: "amber", settlementMode: "credit" },
  { dispatchId: "DO-20260613-0006", flNo: "FL4/WP/COL/2026/0812", batchId: "LL625-BIY-20260608-010", skuName: "Lion Lager 625 ml", unitsCases: 240, unitsBottles: 5760, dispatchDate: "2026-06-16", permitId: "TP-20260613-0301", validityDecision: "go", settlementMode: "credit" },
  { dispatchId: "DO-20260616-0010", flNo: "FL3/WP/GMP/2026/0091", batchId: "TC330-BIY-20260611-013", skuName: "Three Coins Lager 330 ml", unitsCases: 1200, unitsBottles: 28800, dispatchDate: "2026-06-16", permitId: "TP-20260616-0310", validityDecision: "go", settlementMode: "transfer" },
  { dispatchId: "DO-20260616-0011", flNo: "FL4/WP/GMP/2026/0154", batchId: "LC500-BIY-20260609-011", skuName: "Lion Can 500 ml", unitsCases: 120, unitsBottles: 2880, dispatchDate: "2026-06-16", permitId: "TP-20260616-0311", validityDecision: "go", settlementMode: "cash" },
  { dispatchId: "DO-20260616-0012", flNo: "FL7/WP/COL/2026/0034", batchId: "LL625-BIY-20260604-008", skuName: "Lion Lager 625 ml", unitsCases: 80, unitsBottles: 1920, dispatchDate: "2026-06-16", permitId: "TP-20260616-0313", validityDecision: "go", settlementMode: "credit" },
  { dispatchId: "DO-20260615-0009", flNo: "FL4/WP/COL/2026/0601", batchId: "LL625-BIY-20260604-008", skuName: "Lion Lager 625 ml", unitsCases: 100, unitsBottles: 2400, dispatchDate: "2026-06-15", permitId: null, validityDecision: "hold", settlementMode: "credit" },
];

// ── Export shipments + bundles ──────────────────────────────────────────────
const exportShipments: ExportShipment[] = [
  { shipmentId: "EXP-MV-20260520-005", destination: "MV", incoterm: "CIF", asycudaCusDecNo: "SL2605007823", blNo: "CMDU1234567890", fxExpectedAmount: 20000, fxReceivedAmount: 20000, fxDueDate: "2026-08-18", status: "closed", completenessScore: 1.0, gap: null },
  { shipmentId: "EXP-MV-20260615-007", destination: "MV", incoterm: "CIF", asycudaCusDecNo: "SL2606009041", blNo: "CMDU1234599001", fxExpectedAmount: 21500, fxReceivedAmount: null, fxDueDate: "2026-09-13", status: "docs_pending", completenessScore: 0.875, gap: "free_sale_health_cert" },
  { shipmentId: "EXP-AE-20260710-009", destination: "AE", incoterm: "FOB", asycudaCusDecNo: "SL2607011200", blNo: "HLCU9988776655", fxExpectedAmount: 35000, fxReceivedAmount: null, fxDueDate: "2026-10-08", status: "planned", completenessScore: 0.0, gap: null },
];

const mvDocs = (gap: boolean) => [
  { docType: "commercial_invoice", required: true, present: true, valid: true, docId: "DOC-CI-007" },
  { docType: "packing_list", required: true, present: true, valid: true, docId: "DOC-PL-007" },
  { docType: "certificate_of_origin", required: true, present: true, valid: true, docId: "DOC-CO-007" },
  { docType: "free_sale_health_cert", required: true, present: !gap, valid: !gap, docId: gap ? null : "DOC-FSHC-007" },
  { docType: "asycuda_cusdec", required: true, present: true, valid: true, docId: "DOC-CUSDEC-007" },
  { docType: "bill_of_lading", required: true, present: true, valid: true, docId: "DOC-BL-007" },
  { docType: "destination_import_permit", required: true, present: true, valid: true, docId: "DOC-DIP-007" },
  { docType: "label_conformity_MV", required: true, present: true, valid: true, docId: "DOC-LC-007" },
];

const exportDocumentBundles: ExportDocumentBundle[] = [
  { bundleId: "EDB-MV-20260520-005", shipmentId: "EXP-MV-20260520-005", requiredDocs: mvDocs(false), completenessScore: 1.0, gaps: [], clearanceDecision: "clear" },
  { bundleId: "EDB-MV-20260615-007", shipmentId: "EXP-MV-20260615-007", requiredDocs: mvDocs(true), completenessScore: 0.875, gaps: ["free_sale_health_cert"], clearanceDecision: "hold" },
  { bundleId: "EDB-AE-20260710-009", shipmentId: "EXP-AE-20260710-009", requiredDocs: [], completenessScore: 0.0, gaps: [], clearanceDecision: "hold" },
];

// ── Compliance findings ─────────────────────────────────────────────────────
const complianceFindings: ComplianceFinding[] = [
  {
    findingId: "FND-EXC-20260614-0312",
    title: "Sticker variance — GP-20260614-0312",
    domain: "EXCISE",
    severity: "critical",
    capaStatus: "open",
    dueDate: "2026-06-18",
    ownerId: "user_priyantha",
    ownerName: "Priyantha Silva",
    ownerRole: "EXCISE_FINANCE",
    whatFailed: "Control '4-way reconciliation' failed — 28,800 units dispatched (GP-20260614-0312) but only 27,600 Fool Proof Stickers applied (FPS-2026-AB). Gap = 1,200 units.",
    requiredAction: "Reconcile sticker lot FPS-2026-AB scan log at Line 2 or raise a void request; update June declaration.",
    aiReasoning: "✦ 1,200 units (≈ Rs 0.9 M duty at risk) unaccounted. Sticker order FPS-2026-AB was received 2026-06-10 and assigned to Line 2 on 2026-06-12. Application scan log shows 75,600 serial confirmations vs 76,800 units filled. Most likely cause: 1,200 stickers not scanned at Line 2 applicator — operator may have bypassed the scanner for a short run. Hypothesis — not confirmed.",
    aiConfidence: "hypothesis",
    metricBreach: { label: "Units gap", value: "-1,200" },
    evidence: [
      { id: "EV-001", label: "Gate pass GP-20260614-0312", sourceSystem: "SAP", entityType: "RemovalEvent" },
      { id: "EV-002", label: "Sticker lot FPS-2026-AB application log", sourceSystem: "STICKER_PORTAL", entityType: "FoolProofStickerRecord" },
      { id: "EV-003", label: "Batch LL625-BIY-20260612-014 genealogy", sourceSystem: "SAP", entityType: "Batch" },
      { id: "EV-004", label: "Excise register line 14-Jun", sourceSystem: "EXCISE_PORTAL", entityType: "ExciseDeclaration" },
    ],
    ageHours: 48,
    openedAt: "2026-06-14T06:12:00+05:30",
  },
  {
    findingId: "FND-QA-20260614-0315",
    title: "Batch LL625-BIY-20260614-016 held — microbiological result pending",
    domain: "QUALITY",
    severity: "high",
    capaStatus: "open",
    dueDate: "2026-06-17",
    ownerId: "user_nilanthi",
    ownerName: "Nilanthi Perera",
    ownerRole: "QA",
    whatFailed: "Bright-beer release gate blocked: microbiological result for batch LL625-BIY-20260614-016 is pending instrument read. First-pass plate flagged for re-read at 2026-06-14T08:15.",
    requiredAction: "Await LIMS instrument re-read result (expected by 18:00 2026-06-14). If pass: release. If fail: initiate CIP re-run and batch hold.",
    aiReasoning: "✦ Micro result outstanding as of 08:15. Instrument re-read usually completes within 6–8 hours. No comparable failure in last 30 batches (micro pass rate 100%). Release block is precautionary. Fact — not a hypothesis.",
    aiConfidence: "fact",
    metricBreach: { label: "Micro status", value: "PENDING" },
    evidence: [
      { id: "EV-010", label: "QC result QCR-LL625-BIY-20260614-016-MICRO-001", sourceSystem: "LIMS", entityType: "QcTestResult" },
      { id: "EV-011", label: "Batch LL625-BIY-20260614-016 checkpoint record", sourceSystem: "SAP", entityType: "Batch" },
    ],
    ageHours: 30,
    openedAt: "2026-06-14T08:00:00+05:30",
  },
  {
    findingId: "FND-EXC-20260613-0288",
    title: "ABV drift — LL625-BIY-20260608-010 declared 4.8% vs lab 5.1%",
    domain: "EXCISE",
    severity: "high",
    capaStatus: "in_progress",
    dueDate: "2026-06-20",
    ownerId: "user_priyantha",
    ownerName: "Priyantha Silva",
    ownerRole: "EXCISE_FINANCE",
    whatFailed: "Declared ABV 4.8% vs lab-measured 5.1% on batch LL625-BIY-20260608-010 (43,200 L). Duty basis under-declared.",
    requiredAction: "Recalculate duty on 129.6 excess LPA and amend June declaration.",
    aiReasoning: "✦ Lab ABV 5.1% vs declared 4.8% on 43,200 L batch = 129.6 excess LPA. At current duty rate, estimated duty underdeclaration ≈ Rs 1.1 M for the removal events linked to this batch. Fact — the measurement is the fact; the duty gap is computed.",
    aiConfidence: "fact",
    metricBreach: { label: "ABV variance", value: "+0.3%" },
    evidence: [
      { id: "EV-020", label: "QC result QCR-LL625-BIY-20260608-010-ABV-001", sourceSystem: "LIMS", entityType: "QcTestResult" },
      { id: "EV-021", label: "Reconciliation row GP-20260613-0301", sourceSystem: "EXCISE_PORTAL", entityType: "ReconciliationRow" },
    ],
    ageHours: 72,
    openedAt: "2026-06-13T07:30:00+05:30",
  },
  {
    findingId: "FND-DIST-20260616-0001",
    title: "FL licence expiring in 3 days — FL4/WP/COL/2026/0473 (ABC Wine Stores)",
    domain: "DISTRIBUTION",
    severity: "high",
    capaStatus: "open",
    dueDate: "2026-06-19",
    ownerId: "user_roshan",
    ownerName: "Roshan Fernando",
    ownerRole: "DISTRIBUTION",
    whatFailed: "Licence FL4/WP/COL/2026/0473 valid to 2026-06-19 (3 days). 480-case order scheduled today. No renewal application on file.",
    requiredAction: "Confirm renewal before next order cycle. Today's dispatch is AMBER — eligible but flag renewal.",
    aiReasoning: "✦ FL4/WP/COL/2026/0473 (ABC Wine Stores, Colombo 04) valid to 2026-06-19 — 3 days from today. A 480-case dispatch order is scheduled today and will deliver before expiry (eligible). However, no renewal application is on file. Recommend: confirm renewal before next order cycle. Dispatch today is AMBER — eligible but flag renewal.",
    aiConfidence: "fact",
    metricBreach: { label: "Days to expiry", value: "3" },
    evidence: [
      { id: "EV-030", label: "Licence FL4/WP/COL/2026/0473", sourceSystem: "FL_REGISTER", entityType: "CustomerLicence" },
      { id: "EV-031", label: "Dispatch order DO-20260614-0007", sourceSystem: "SAP", entityType: "DispatchOrder" },
    ],
    ageHours: 6,
    openedAt: "2026-06-16T06:00:00+05:30",
  },
  {
    findingId: "FND-EXP-20260615-0007",
    title: "Free-sale health certificate missing — EXP-MV-20260615-007",
    domain: "EXPORT",
    severity: "high",
    capaStatus: "open",
    dueDate: "2026-06-18",
    ownerId: "user_amaya",
    ownerName: "Amaya Jayasuriya",
    ownerRole: "REGULATORY",
    whatFailed: "Shipment EXP-MV-20260615-007 to Maldives is missing the FCAU free-sale/health certificate. 7 of 8 required documents present.",
    requiredAction: "Obtain FCAU free-sale/health certificate before clearance.",
    aiReasoning: "✦ Shipment EXP-MV-20260615-007 to Maldives is missing the FCAU free-sale/health certificate. 7 of 8 required documents present. Certificate was last obtained 2025-09-12 (expired). Completeness score: 87.5%. Shipment clearance is BLOCKED until certificate is obtained.",
    aiConfidence: "fact",
    metricBreach: { label: "Completeness", value: "87.5%" },
    evidence: [
      { id: "EV-040", label: "Export bundle EDB-MV-20260615-007", sourceSystem: "ASYCUDA", entityType: "ExportDocumentBundle" },
    ],
    ageHours: 24,
    openedAt: "2026-06-15T10:00:00+05:30",
  },
  {
    findingId: "FND-QA-20260601-0199",
    title: "Supplier COA pending — malt lot ML-2026-0337",
    domain: "QUALITY",
    severity: "medium",
    capaStatus: "in_progress",
    dueDate: "2026-06-30",
    ownerId: "user_nilanthi",
    ownerName: "Nilanthi Perera",
    ownerRole: "QA",
    whatFailed: "COA for malt lot ML-2026-0337 not received from supplier as of 2026-06-16.",
    requiredAction: "Chase supplier; stamp lot as pending in SLSI evidence pack.",
    aiReasoning: "✦ COA for malt lot ML-2026-0337 not received from supplier as of 2026-06-16. Standard delivery is 3–5 days post-goods-receipt. Lot received 2026-06-01 — 15 days overdue. Chased supplier on 2026-06-08 with no response. Fact.",
    aiConfidence: "fact",
    metricBreach: { label: "Days overdue", value: "15" },
    evidence: [
      { id: "EV-050", label: "Material lot MAT-MALT-202606-003", sourceSystem: "DMS", entityType: "MaterialLot" },
    ],
    ageHours: 360,
    openedAt: "2026-06-01T09:00:00+05:30",
  },
  {
    findingId: "FND-GOV-20260501-0088",
    title: "Audit action item — effluent test documentation filing delay (Apr 2026)",
    domain: "GOVERNANCE",
    severity: "low",
    capaStatus: "closed",
    dueDate: "2026-05-15",
    ownerId: null,
    ownerName: null,
    ownerRole: null,
    whatFailed: "Effluent test documentation filed late for April 2026 monitoring cycle.",
    requiredAction: "No action — resolved before assignment.",
    aiReasoning: "✦ Effluent documentation filed 2026-05-12, within grace window. System-closed. Fact.",
    aiConfidence: "fact",
    metricBreach: { label: "Status", value: "CLOSED" },
    evidence: [],
    ageHours: 0,
    openedAt: "2026-05-01T09:00:00+05:30",
    closedAt: "2026-05-12T15:00:00+05:30",
  },
];

// ── Resolution threads ──────────────────────────────────────────────────────
const resolutionThreads: Record<string, ResolutionEvent[]> = {
  "FND-EXC-20260614-0312": [
    { ts: "2026-06-14T06:12:00+05:30", actor: "Lion Compliance Platform", text: "Flagged by system — sticker variance detected, gap = 1,200 units.", isAi: true },
    { ts: "2026-06-14T06:30:00+05:30", actor: "Lion Compliance Platform", text: "Auto-assigned to EXCISE_FINANCE owner: Priyantha Silva.", isAi: true },
  ],
  "FND-QA-20260614-0315": [
    { ts: "2026-06-14T08:00:00+05:30", actor: "Lion Compliance Platform", text: "Bright-beer release gate blocked — micro result pending.", isAi: true },
    { ts: "2026-06-14T08:20:00+05:30", actor: "Nilanthi Perera", text: "Awaiting LIMS instrument re-read. Hold confirmed.", isAi: false },
  ],
  "FND-DIST-20260616-0001": [
    { ts: "2026-06-16T06:00:00+05:30", actor: "Lion Compliance Platform", text: "Licence expiry risk detected — 3 days to expiry with order today.", isAi: true },
  ],
};

// ── Evidence packs ──────────────────────────────────────────────────────────
const evidencePacks: EvidencePack[] = [
  { packId: "EP-EXCISE-202605-001", domain: "excise", format: "EXCISE", scopeRef: { type: "period", ref: "2026-05" }, generatedTs: "2026-05-31T16:42:00+05:30", generatedBy: "user_priyantha", completenessScore: 1.0, gaps: [], hash: "sha256:a3f8c2d9e4b7f1a6c8d2e9f4a3b7c1d6e8f2a9c4d7b3e6f1a8c2d5e9f4b7a1c3", status: "ready", docCount: 52, sizeMb: 14.1 },
  { packId: "EP-SLSI-202605-001", domain: "qc", format: "SLSI", scopeRef: { type: "period", ref: "2026-05" }, generatedTs: "2026-05-28T11:15:00+05:30", generatedBy: "user_nilanthi", completenessScore: 0.998, gaps: ["COA for malt lot ML-2026-0337 — stamped as missing, not fabricated"], hash: "sha256:b7d4e1f8a2c5d9b3e6f2a8c4d1e7f3a9b5c8d2e4f6a1c7d3e9f5b2a6c1d8e4f7", status: "stale", docCount: 47, sizeMb: 12.3 },
  { packId: "EP-EXCISE-202606-001", domain: "excise", format: "EXCISE", scopeRef: { type: "period", ref: "2026-06" }, generatedTs: null, generatedBy: null, completenessScore: null, gaps: [], hash: null, status: "idle" },
];

// ── Audit events ────────────────────────────────────────────────────────────
const auditEvents: AuditEvent[] = [
  { eventId: "AE-20260616-000001", eventType: "compute", actor: "user_system", entityRef: "DomainHealthScore:EXCISE", ts: "2026-06-16T06:00:00+05:30", description: "Excise domain health recomputed: score 52/100, status=risk. Driven by 1 critical finding FND-EXC-20260614-0312 and 1 high ABV drift finding." },
  { eventId: "AE-20260614-000312", eventType: "flag", actor: "user_system", entityRef: "Finding:FND-EXC-20260614-0312", ts: "2026-06-14T06:12:00+05:30", description: "Sticker variance detected: 28,800 units removed, 27,600 stickers applied, gap=1,200, Rs 0.9M at risk." },
  { eventId: "AE-20260614-000330", eventType: "assign", actor: "user_system", entityRef: "Finding:FND-EXC-20260614-0312", ts: "2026-06-14T06:30:00+05:30", description: "Finding auto-assigned to EXCISE_FINANCE owner: Priyantha Silva." },
  { eventId: "AE-20260612-087321", eventType: "sign", actor: "user_nilanthi", entityRef: "Batch:LL625-BIY-20260612-014", ts: "2026-06-12T09:42:00+05:30", description: "QA release authorised — all 7 gate-3 parameters pass. ABV 4.8% confirmed." },
  { eventId: "AE-20260608-087244", eventType: "override", actor: "user_nilanthi", entityRef: "Batch:LL625-BIY-20260608-010", ts: "2026-06-08T11:20:00+05:30", description: "QA override: ABV 5.1% marginally above 5.0% spec ceiling. Organoleptic panel pass. Release authorised with override note." },
  { eventId: "AE-20260531-089001", eventType: "sign", actor: "user_priyantha", entityRef: "ExciseDeclaration:EXD-2026-05", ts: "2026-05-31T16:42:00+05:30", description: "May 2026 excise declaration signed and filed. 1,243 removals, 89,400 LPA, Rs 5.02bn duty." },
];

// ── Obligation controls ─────────────────────────────────────────────────────
const obligationControls: ObligationControl[] = [
  { obligationId: "OC-EXC-001", obligationText: "Pay excise duty on LPA removed", regulator: "Excise Department", control: "4-way reconciliation: SAP removals ↔ stickers ↔ duty declared ↔ permits", ownerRole: "EXCISE_FINANCE", evidenceType: "FPS portal export + gate pass", frequency: "monthly", capabilityIds: ["C6", "C7", "C8"], configValue: "Rs 56.19/LPA", controlStatus: "failing", domain: "EXCISE", industry: "Brewing" },
  { obligationId: "OC-EXC-002", obligationText: "Affix Fool Proof Sticker on every bottle", regulator: "Excise Department", control: "Serial-level sticker reconciliation per batch", ownerRole: "EXCISE_FINANCE", evidenceType: "Sticker portal scan log", frequency: "batch", capabilityIds: ["C11"], configValue: null, controlStatus: "failing", domain: "EXCISE", industry: "Brewing" },
  { obligationId: "OC-QA-001", obligationText: "ABV declaration on label", regulator: "SLSI", control: "Lab result vs label vs duty basis", ownerRole: "QA", evidenceType: "Lab result + label artwork", frequency: "batch", capabilityIds: ["C12"], configValue: "Tolerance: ±0.3%", controlStatus: "passing", domain: "QUALITY", industry: "Brewing" },
  { obligationId: "OC-QA-002", obligationText: "Release beer to market only when all QC gates pass", regulator: "SLSI", control: "Batch release workflow with QA e-sign", ownerRole: "QA", evidenceType: "QC release record", frequency: "batch", capabilityIds: ["C2", "C3", "C4"], configValue: "SLS 675:2019 Beer specification", controlStatus: "passing", domain: "QUALITY", industry: "Brewing" },
  { obligationId: "OC-DIST-001", obligationText: "FL licence validity at dispatch", regulator: "Excise Department", control: "Pre-dispatch outlet-validity check (FL register sync)", ownerRole: "DISTRIBUTION", evidenceType: "Licence register query", frequency: "daily", capabilityIds: ["C15", "C16"], configValue: "Block if: expired or suspended", controlStatus: "passing", domain: "DISTRIBUTION", industry: "Brewing" },
  { obligationId: "OC-DIST-002", obligationText: "Ensure transport permit accompanies every load", regulator: "Excise Department", control: "Transport permit generation/check per dispatch order", ownerRole: "DISTRIBUTION", evidenceType: "Transport permit", frequency: "event", capabilityIds: ["C17"], configValue: null, controlStatus: "passing", domain: "DISTRIBUTION", industry: "Brewing" },
  { obligationId: "OC-LABEL-001", obligationText: "Label beer per SLS and Food Act requirements", regulator: "SLSI", control: "On-pack label verification (vision + rules)", ownerRole: "REGULATORY", evidenceType: "Label artwork + verification", frequency: "batch", capabilityIds: ["C12", "C13", "C14"], configValue: "Mandatory: ABV, net volume, price, allergens, batch code, sticker zone, Sinhala text", controlStatus: "passing", domain: "LABELLING", industry: "Brewing" },
  { obligationId: "OC-EXP-001", obligationText: "Clear every export shipment with complete documentation", regulator: "Sri Lanka Customs", control: "Per-destination dossier completeness check", ownerRole: "REGULATORY", evidenceType: "Export document bundle", frequency: "event", capabilityIds: ["C20", "C21"], configValue: "Destination ruleset v2026.1 — MV/AE/EU/AU", controlStatus: "passing", domain: "EXPORT", industry: "Brewing" },
  { obligationId: "OC-EXP-002", obligationText: "Repatriate export proceeds within CBSL deadline", regulator: "FCAU", control: "FX-repatriation deadline tracking per shipment", ownerRole: "EXCISE_FINANCE", evidenceType: "Bank credit advice", frequency: "event", capabilityIds: ["C23"], configValue: "90-day repatriation window", controlStatus: "passing", domain: "EXPORT", industry: "Brewing" },
  { obligationId: "OC-ENV-001", obligationText: "Discharge effluent within EPL limits", regulator: "CEA", control: "Effluent sampling cadence and limit monitoring", ownerRole: "EHS", evidenceType: "Effluent test report", frequency: "monthly", capabilityIds: ["C27"], configValue: "EPL No. WP/CEA/EPL/2023/B/0441 — valid to 2027-03-31", controlStatus: "passing", domain: "ENVIRONMENT", industry: "Brewing" },
  { obligationId: "OC-GOV-001", obligationText: "Maintain audit log of all compliance actions", regulator: "Excise Department", control: "Immutable audit event log with lineage", ownerRole: "ADMIN", evidenceType: "Audit event log", frequency: "event", capabilityIds: ["C30"], configValue: null, controlStatus: "passing", domain: "GOVERNANCE", industry: "Brewing" },
  { obligationId: "OC-GOV-002", obligationText: "Maintain and version regulatory obligation registry", regulator: "Excise Department", control: "Config-driven obligation and duty-rate management", ownerRole: "ADMIN", evidenceType: "Ruleset version record", frequency: "event", capabilityIds: ["C36"], configValue: "Ruleset v2026.3 — effective 2026-06-01", controlStatus: "passing", domain: "GOVERNANCE", industry: "Brewing" },
  // Distilling (adaptability proof — reduced set)
  { obligationId: "OC-DST-001", obligationText: "Pay excise duty on proof litres distilled", regulator: "Excise Department", control: "Spirit reconciliation: still output ↔ duty declared", ownerRole: "EXCISE_FINANCE", evidenceType: "Distillation log + duty declaration", frequency: "monthly", capabilityIds: ["C6", "C9"], configValue: "Arrack duty rate v2026.2", controlStatus: "passing", domain: "EXCISE", industry: "Distilling" },
  { obligationId: "OC-DST-002", obligationText: "Bonded warehouse stock reconciliation", regulator: "Excise Department", control: "Daily bonded stock count vs system", ownerRole: "EXCISE_FINANCE", evidenceType: "Bond register", frequency: "daily", capabilityIds: ["C10"], configValue: null, controlStatus: "passing", domain: "EXCISE", industry: "Distilling" },
  { obligationId: "OC-DST-003", obligationText: "Maturation cask register", regulator: "Excise Department", control: "Cask age and angel's-share tracking", ownerRole: "QA", evidenceType: "Cask register", frequency: "monthly", capabilityIds: ["C25"], configValue: "Min maturation: 24 months", controlStatus: "passing", domain: "QUALITY", industry: "Distilling" },
  { obligationId: "OC-DST-004", obligationText: "Methanol content within safe limit", regulator: "SLSI", control: "Per-batch methanol assay", ownerRole: "QA", evidenceType: "Lab assay report", frequency: "batch", capabilityIds: ["C24"], configValue: "Max methanol: 2.0 g/L", controlStatus: "passing", domain: "QUALITY", industry: "Distilling" },
  { obligationId: "OC-DST-005", obligationText: "FL licence validity at dispatch", regulator: "Excise Department", control: "Pre-dispatch outlet-validity check", ownerRole: "DISTRIBUTION", evidenceType: "Licence register query", frequency: "daily", capabilityIds: ["C15", "C16"], configValue: "Block if: expired or suspended", controlStatus: "passing", domain: "DISTRIBUTION", industry: "Distilling" },
];

// ── Domain health scores ────────────────────────────────────────────────────
const domainHealthScores: DomainHealthScore[] = [
  { domainId: "EXCISE", label: "Excise & Duty", status: "risk", trend: "down", score: 52, openFindingsCount: 2, openCriticalCount: 1, topFindingText: "Sticker variance 1,200 units ≈ Rs 0.9 M — GP-20260614-0312", topFindingId: "FND-EXC-20260614-0312", ownerName: "Priyantha Silva", ownerRole: "EXCISE_FINANCE", lastAuditResult: "FAILED", lastAuditDate: "2026-06-14" },
  { domainId: "QUALITY", label: "Quality & Lab", status: "watch", trend: "flat", score: 71, openFindingsCount: 2, openCriticalCount: 0, topFindingText: "Batch LL625-BIY-20260614-016 held — micro retest pending", topFindingId: "FND-QA-20260614-0315", ownerName: "Nilanthi Perera", ownerRole: "QA", lastAuditResult: "PENDING", lastAuditDate: "2026-06-14" },
  { domainId: "DISTRIBUTION", label: "Distribution / POS", status: "watch", trend: "down", score: 74, openFindingsCount: 1, openCriticalCount: 0, topFindingText: "3 outlets expiring < 7 days — FL4/WP/COL/2026/0473 has order today", topFindingId: "FND-DIST-20260616-0001", ownerName: "Roshan Fernando", ownerRole: "DISTRIBUTION", lastAuditResult: "N_A", lastAuditDate: null },
  { domainId: "LABELLING", label: "Labelling & Marking", status: "healthy", trend: "flat", score: 89, openFindingsCount: 0, openCriticalCount: 0, topFindingText: "All artworks current — 8 SKU/market combinations verified", topFindingId: null, ownerName: "Amaya Jayasuriya", ownerRole: "REGULATORY", lastAuditResult: "PASSED", lastAuditDate: "2026-06-01" },
  { domainId: "EXPORT", label: "Export", status: "healthy", trend: "flat", score: 85, openFindingsCount: 1, openCriticalCount: 0, topFindingText: "Free-sale cert missing — EXP-MV-20260615-007 (hold, not sailed yet)", topFindingId: "FND-EXP-20260615-0007", ownerName: "Amaya Jayasuriya", ownerRole: "REGULATORY", lastAuditResult: "N_A", lastAuditDate: null },
  { domainId: "ENVIRONMENT", label: "Environmental / EHS", status: "healthy", trend: "up", score: 93, openFindingsCount: 0, openCriticalCount: 0, topFindingText: "EPL WP/CEA/EPL/2023/B/0441 valid to 2027-03-31", topFindingId: null, ownerName: "EHS Lead", ownerRole: "EHS", lastAuditResult: "PASSED", lastAuditDate: "2026-05-15" },
  { domainId: "GOVERNANCE", label: "Governance", status: "healthy", trend: "up", score: 90, openFindingsCount: 0, openCriticalCount: 0, topFindingText: "Ruleset v2026.3 active — all obligations have owners and evidence rules", topFindingId: null, ownerName: "Internal Audit", ownerRole: "ADMIN", lastAuditResult: "PASSED", lastAuditDate: "2026-06-01" },
];

// ── AI change feed ──────────────────────────────────────────────────────────
const aiInsights: AiInsight[] = [
  { insightId: "AI-001", domain: "EXCISE", text: "Excise → AT-RISK", reasoning: "12 removals on 14-Jun show 28,800 units vs 27,600 stickers — 1,200 gap ≈ Rs 0.9 M", timeAgo: "6h ago", severity: "critical", findingId: "FND-EXC-20260614-0312" },
  { insightId: "AI-002", domain: "DISTRIBUTION", text: "Distribution → WATCH", reasoning: "FL4/WP/COL/2026/0473 expires in 3 days", timeAgo: "1h ago", severity: "high", findingId: "FND-DIST-20260616-0001" },
  { insightId: "AI-003", domain: "QUALITY", text: "Batch LL625-…-014 held", reasoning: "Micro retest pending — bright-beer checkpoint blocked", timeAgo: "4h ago", severity: "high", findingId: "FND-QA-20260614-0315" },
];

// ── Timeline snapshots ──────────────────────────────────────────────────────
const timelineSnapshots: TimelineSnapshot[] = [
  { snapshotId: "SNAP-005", timestamp: "2026-06-16T06:00:00+05:30", label: "Now — FL register sync (today 06:00)", eventType: "licence_sync", entityRef: "FL_REGISTER", postureAtTs: "risk" },
  { snapshotId: "SNAP-001", timestamp: "2026-06-14T06:12:00+05:30", label: "Sticker variance flagged (Jun 14)", eventType: "finding_opened", entityRef: "FND-EXC-20260614-0312", postureAtTs: "watch" },
  { snapshotId: "SNAP-003", timestamp: "2026-06-14T08:00:00+05:30", label: "Held batch — micro pending (Jun 14)", eventType: "finding_opened", entityRef: "FND-QA-20260614-0315", postureAtTs: "watch" },
  { snapshotId: "SNAP-002", timestamp: "2026-06-12T09:42:00+05:30", label: "Hero batch released (Jun 12)", eventType: "batch_release", entityRef: "LL625-BIY-20260612-014", postureAtTs: "watch" },
  { snapshotId: "SNAP-004", timestamp: "2026-05-31T16:42:00+05:30", label: "May declaration filed (clean)", eventType: "declaration_filed", entityRef: "EXD-2026-05", postureAtTs: "healthy" },
];

// ── Fixture root ────────────────────────────────────────────────────────────
export const mockData: MockFixture = {
  meta: {
    seed: 20260616,
    generatedAt: "2026-06-16T08:00:00+05:30",
    scenario: "LION-MVP-DEMO-V2",
    siteId: "BIYAGAMA-01",
    companyName: "Lion Brewery Ceylon PLC",
    fiscalYear: "2025-2026",
    demoPeriod: "2026-06",
    dataVersion: "2.0.0",
  },
  entities: {
    batches,
    qcTestResults,
    materialLots,
    exciseDeclarations,
    foolProofStickerInventory,
    transportPermits,
    reconciliationRows,
    labelVersions,
    customerLicences,
    dispatchOrders,
    exportShipments,
    exportDocumentBundles,
    complianceFindings,
    evidencePacks,
    auditEvents,
    regulatoryActors,
    obligationControls,
    domainHealthScores,
    users,
    aiInsights,
    resolutionThreads,
  },
  timelineSnapshots,
  derivedAggregates: {
    overallPostureBand: "risk",
    openCriticalCount: 1,
    deadlinesWithin7dCount: 3,
    dutyPositionJune2026Lkr: 5_410_000_000,
    annualLiabilityContextLkr: 64_800_000_000,
    posLicenceComplianceRate: 0.997,
    totalVarianceLkr: 2_340_000,
    reconciliationBreakCount: 4,
    reconciliationCriticalCount: 1,
    posTotals: { active: 11, suspended: 1, expiringWithin7d: 2, ineligibleWithOrderToday: 1 },
  },
};

// ── Index maps (O(1) lookups, built once) ───────────────────────────────────
function indexBy<T, K extends string>(items: T[], key: (item: T) => K): Record<K, T> {
  return items.reduce(
    (acc, item) => {
      acc[key(item)] = item;
      return acc;
    },
    {} as Record<K, T>,
  );
}

function groupBy<T, K extends string>(items: T[], key: (item: T) => K): Record<K, T[]> {
  return items.reduce(
    (acc, item) => {
      const k = key(item);
      (acc[k] ??= []).push(item);
      return acc;
    },
    {} as Record<K, T[]>,
  );
}

export const batchById = indexBy(batches, (b) => b.batchId);
export const qcResultsByBatchId = groupBy(qcTestResults, (q) => q.batchId);
export const reconciliationRowById = indexBy(reconciliationRows, (r) => r.removalId);
export const licenceByFlNo = indexBy(customerLicences, (l) => l.flNo);
export const licenceByCustomerId = indexBy(customerLicences, (l) => l.customerId);
export const findingById = indexBy(complianceFindings, (f) => f.findingId);
export const findingIdsByDomain = groupBy(complianceFindings, (f) => f.domain) as Record<
  string,
  ComplianceFinding[]
>;
export const domainHealthById = indexBy(domainHealthScores, (d) => d.domainId);
export const evidencePackById = indexBy(evidencePacks, (p) => p.packId);
export const userById = indexBy(users, (u) => u.userId);
export const dispatchOrdersByFlNo = groupBy(dispatchOrders, (d) => d.flNo);
export const obligationsByDomain = groupBy(obligationControls, (o) => o.domain);
export const exportBundleByShipmentId = indexBy(exportDocumentBundles, (b) => b.shipmentId);
export const stickerByBatchId = indexBy(foolProofStickerInventory, (s) => s.appliedToBatchId);

export function findingsForDomain(domain: string): ComplianceFinding[] {
  return complianceFindings.filter((f) => f.domain === domain);
}
