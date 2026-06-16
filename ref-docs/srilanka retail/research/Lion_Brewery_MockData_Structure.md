# Mock Data Structure Document
## AI-Powered Audit & Compliance Platform — Lion Brewery (Ceylon) PLC
### Stage 6 — Fixture Definition for Cursor Seed Generation

**Role:** Senior Data Architect — Compliance & Audit Systems  
**Builds on:** Stage 2 (Data Model), Stage 3 (UI Spec), Stage 4 (UX Blueprint + Demo Narrative), Stage 5 (Frontend & Data Architecture)  
**Output:** Four-part structure document. A developer must be able to take this document into Cursor and generate a complete, realistic, narrative-coherent `mockData.ts` fixture file without making a single design decision themselves.

> **Grounding constants used throughout this document:**  
> Site: **Biyagama (BIYAGAMA-01)** · Company: **Lion Brewery Ceylon PLC** · Fiscal year: **2026 (Apr 2025 – Mar 2027)**  
> Demo period: **June 2026** · Annual excise liability context: **Rs 64,800,000,000** · Live June duty position: **Rs 5,410,000,000**  
> Hero batch: **LL625-BIY-20260612-014** · Hero finding: **FND-EXC-20260614-0312** · Hero outlet: **FL4/WP/COL/2026/0473**  
> Duty rate (config-driven, never hard-coded): **Rs 56.19 per LPA for beer <5% ABV** (illustrative; pull from C36)  
> SAP system ID prefix: **4500XXXXXX** · Sticker vendor: **Madras Security Printers** · Sticker cost: **Rs 1.21/unit**

---

## PART 1 — FIXTURE FILE STRUCTURE

### Root shape of `mockData.ts`

```typescript
// mockData.ts — root structure
// Generated deterministically from seed 20260616
// DO NOT EDIT BY HAND — regenerate from this structure document

import type {
  Batch, ExciseDeclaration, FoolProofStickerRecord, TransportPermit,
  LabelVersion, CustomerLicence, ExportShipment, ExportDocumentBundle,
  ComplianceFinding, EvidencePack, AuditEvent, RegulatoryActor,
  DomainHealthScore, User, ReconciliationRow, ObligationControl,
  TimelineSnapshot, QcTestResult, MaterialLot, DispatchOrder
} from './types'

interface MockFixture {
  meta: FixtureMeta
  entities: {
    // Core production
    batches:                    Batch[]
    qcTestResults:              QcTestResult[]
    materialLots:               MaterialLot[]

    // Excise & sticker
    exciseDeclarations:         ExciseDeclaration[]
    foolProofStickerInventory:  FoolProofStickerRecord[]
    transportPermits:           TransportPermit[]

    // Reconciliation (frontend-composed rows)
    reconciliationRows:         ReconciliationRow[]

    // Label & marking
    labelVersions:              LabelVersion[]

    // Distribution & POS
    customerLicences:           CustomerLicence[]
    dispatchOrders:             DispatchOrder[]

    // Export
    exportShipments:            ExportShipment[]
    exportDocumentBundles:      ExportDocumentBundle[]

    // Compliance
    complianceFindings:         ComplianceFinding[]
    evidencePacks:              EvidencePack[]
    auditEvents:                AuditEvent[]

    // Reference / config
    regulatoryActors:           RegulatoryActor[]
    obligationControls:         ObligationControl[]
    domainHealthScores:         DomainHealthScore[]
    users:                      User[]
  }
  indexMaps: {
    // O(1) lookups — built once at fixture load time
    batchById:                  Record<string, Batch>
    qcResultsByBatchId:         Record<string, QcTestResult[]>
    materialLotsByBatchId:      Record<string, MaterialLot[]>
    exciseDeclarationByPeriod:  Record<string, ExciseDeclaration>
    stickerRecordByBatchId:     Record<string, FoolProofStickerRecord>
    transportPermitById:        Record<string, TransportPermit>
    reconciliationRowById:      Record<string, ReconciliationRow>
    labelVersionBySkuMarket:    Record<string, LabelVersion>       // key = `${skuId}::${market}`
    licenceByFlNo:              Record<string, CustomerLicence>
    licenceByCustomerId:        Record<string, CustomerLicence>
    dispatchOrdersByFlNo:       Record<string, DispatchOrder[]>
    exportShipmentById:         Record<string, ExportShipment>
    exportBundleByShipmentId:   Record<string, ExportDocumentBundle>
    findingById:                Record<string, ComplianceFinding>
    findingIdsByDomain:         Record<DomainId, string[]>
    findingsByEntityRef:        Record<string, ComplianceFinding[]>
    evidencePackById:           Record<string, EvidencePack>
    auditEventsByEntityRef:     Record<string, AuditEvent[]>
    regulatoryActorByName:      Record<string, RegulatoryActor>
    obligationsByDomain:        Record<DomainId, ObligationControl[]>
    domainHealthById:           Record<DomainId, DomainHealthScore>
    userById:                   Record<string, User>
    outletFlNosByDistrict:      Record<string, string[]>
    snapshotByTimestamp:        Record<string, TimelineSnapshot>
  }
  timelineSnapshots: TimelineSnapshot[]
  derivedAggregates: {
    // Pre-computed for dashboard widgets — never recalculate at render
    overallPostureBand:         ComplianceStatus      // 'risk' (driven by 1 critical)
    openCriticalCount:          number                // 1
    deadlinesWithin7dCount:     number                // 3
    dutyPositionJune2026Lkr:    number                // 5_410_000_000
    annualLiabilityContextLkr:  number                // 64_800_000_000
    posLicenceComplianceRate:   number                // 0.997
    totalVarianceLkr:           number                // 2_340_000
    reconciliationBreakCount:   number                // 4
    reconciliationCriticalCount:number                // 1
  }
}

interface FixtureMeta {
  seed:         number       // 20260616  (YYYYMMDD of demo date)
  generatedAt:  string       // '2026-06-16T08:00:00+05:30'
  scenario:     string       // 'LION-MVP-DEMO-V1'
  siteId:       string       // 'BIYAGAMA-01'
  companyName:  string       // 'Lion Brewery Ceylon PLC'
  fiscalYear:   string       // '2025-2026'
  demoPeriod:   string       // '2026-06'
  dataVersion:  string       // '1.0.0'
}
```

### Supporting type additions (not in Stage 5 — define in `types.ts`)

```typescript
// These extend/supplement the Stage-5 frontend types

interface QcTestResult {
  resultId:     string          // 'QCR-{batchId}-{parameter}-{seq}'
  batchId:      string
  gate:         'incoming'|'in_process'|'release'|'stability'
  parameter:    'abv'|'gravity'|'ph'|'co2'|'turbidity'|'micro'|'fill_volume'|'sensory'
  value:        number | string // number for measurables; 'pass'|'fail'|'pending' for micro/sensory
  unit:         string          // '%', 'vol', 'NTU', 'EBC', etc.
  specMin:      number | null
  specMax:      number | null
  pass:         boolean | null  // null = pending
  testedAt:     string          // ISO datetime
  source:       'lims'|'instrument'|'excel'|'paper_ocr'|'manual'
  testedByName: string | null
}

interface MaterialLot {
  lotId:        string          // 'MAT-{type}-{YYYYMM}-{seq}'
  batchId:      string          // batch this lot was consumed in
  materialType: 'malt'|'hops'|'yeast'|'co2'|'packaging'|'adjunct'
  supplierName: string
  qtyKg:        number | null
  coaDocId:     string | null   // references a Document in the evidence pack
  coaMatchStatus: 'matched'|'exception'|'pending'
  receivedDate: string
}

interface DispatchOrder {
  dispatchId:   string          // 'DO-{YYYYMMDD}-{seq:4}'
  flNo:         string          // FK to CustomerLicence
  batchId:      string          // FK to Batch
  skuName:      string
  unitsCases:   number          // in cases (24 × 625ml)
  unitsBottles: number          // cases × 24
  dispatchDate: string          // ISO date
  permitId:     string | null   // FK to TransportPermit
  validityDecision: 'go'|'amber'|'hold'
  settlementMode: 'cash'|'credit'|'transfer'
}

interface DomainHealthScore {
  domainId:         DomainId
  label:            string
  status:           ComplianceStatus
  trend:            'up'|'down'|'flat'
  score:            number           // 0–100
  openFindingsCount: number
  openCriticalCount: number
  topFindingText:   string | null
  topFindingId:     string | null
  ownerName:        string | null
  ownerRole:        PersonaRole | null
  lastAuditResult:  'PASSED'|'FAILED'|'PENDING'|'N_A'
  lastAuditDate:    string | null
}

interface TimelineSnapshot {
  snapshotId:   string
  timestamp:    string          // ISO datetime — key moment in demo
  label:        string          // human label for TimeSelector dropdown
  eventType:    'batch_release'|'declaration_filed'|'dispatch'|'finding_opened'|'finding_closed'|'licence_sync'
  entityRef:    string          // e.g. batchId or findingId
  postureAtTs:  ComplianceStatus
}
```

---

## PART 2 — ENTITY COUNT & STATE DISTRIBUTION

| Entity | Count | State Distribution | Narrative Purpose |
|---|---|---|---|
| **Batch** | 18 | 14 released (78%) / 2 in-progress/pending (11%) / 1 held (6%) / 1 rejected (6%) | One held batch with micro-retest pending → F3 drill. One released batch is the hero (LL625-…-014) with the sticker gap → F2 drill. Cadence ≈ 3–4 batches/week over 5 weeks. |
| **QcTestResult** | ~126 | 118 pass / 5 fail/pending / 3 flagged | Each batch gets 7 QC results (ABV, CO₂, micro, turbidity, fill_volume, sensory, pH). Hero held batch has micro=pending and a secondary gravity=pass. Hero released batch has all pass. One batch has ABV=5.1% (outsidespec→excise drift) |
| **MaterialLot** | 36 | 33 matched / 2 exception / 1 pending | 2 lots per batch (malt + hops). One malt lot ML-2026-0337 has coaMatchStatus=pending → referenced as missing COA in F5 SLSI pack. |
| **ExciseDeclaration** | 2 | 1 filed (May 2026) / 1 draft (June 2026) | June declaration is draft with variance flag. May is accepted baseline for comparison. |
| **FoolProofStickerRecord** | 18 | 16 reconciled / 1 variance_flagged (hero) / 1 ordered-not-yet-applied | Hero sticker record FPS-2026-AB has qty_applied=27600 vs batch units=28800 → 1200 gap → F1/F2. One sticker order in pipeline (not yet applied) for the in-progress batch. |
| **TransportPermit** | 22 | 20 used-valid / 1 missing (the gap in hero removal) / 1 expired | The hero removal GP-20260614-0312 has a permit but the sticker gap is separate. One June removal from a non-hero batch is flagged missing-permit → feeds reconciliation row D. |
| **ReconciliationRow** | 8 | 1 critical (sticker gap) / 2 watch (ABV drift + timing) / 1 missing-permit / 4 matched-green | The 4-way diff grid. Row A = hero critical. Rows B/C/D = amber/watch. Rows E-H = green matched. Total variance attribution: Rs 0.9M sticker + Rs 1.1M ABV drift + Rs 0.34M timing = Rs 2.34M. |
| **LabelVersion** | 8 | 6 approved / 1 draft / 1 retired | Covers Lion Lager 625ml (LK + MV markets), Lion Strong 625ml (LK), Three Coins Lager 330ml (LK), Can 500ml (LK), Craft White Wheat (MV+EU), one retired version. |
| **CustomerLicence** | 12 | 9 active-go (75%) / 2 active-amber (expiring <7d) / 1 suspended (8%) | Hero outlet FL4/WP/COL/2026/0473 is amber, expires 2026-06-19 (3 days). One FL4/SP/GAL outlet is suspended. One Gampaha FL3 wholesaler has order today. Rest are healthy. |
| **DispatchOrder** | 15 | 12 dispatched-go / 2 amber (today, to hero outlet) / 1 hold | Hero outlet has 1 order today (480 cases = 11,520 bottles) → amber → F4. Suspended outlet has 0 orders (correctly blocked). One additional order flagged hold for permit review. |
| **ExportShipment** | 3 | 1 cleared (May MV shipment) / 1 docs_pending (hero MV June) / 1 planned (GCC July) | Hero shipment EXP-MV-20260615-007 has completeness 87.5% (missing free_sale_health_cert) → holds demo of export flow. |
| **ExportDocumentBundle** | 3 | 1 complete (100%) / 1 gap (87.5%) / 1 blank-template | Hero bundle EDB-MV-20260615-007 = 7 of 8 required docs present. |
| **ComplianceFinding** | 7 | 1 critical-open / 3 high-open / 2 medium-in_progress / 1 low-closed | 1 critical = hero sticker variance (Excise domain). 2 high = ABV drift (Excise+Quality shared) + expiring outlet (Distribution). 1 high = missing export doc. 2 medium = scheduling/labelling minor. 1 low = resolved COA delay. |
| **EvidencePack** | 3 | 1 ready (May excise pack) / 1 stale (SLSI batch pack from last quarter) / 1 to-be-generated (demo generates this) | Two pre-existing packs give the time-travel story. The demo generates the June Excise pack live. |
| **AuditEvent** | 45 | All append-only — mix of compute/flag/sign/generate/override | Cover the last 90 days. Key events: batch release (Nilanthi sign), June declaration draft, sticker flag raised (system), finding opened (system), finding assigned (Priyantha), dispatch hold (Roshan). |
| **RegulatoryActor** | 6 | N/A (reference data) | Excise Dept, SLSI, NATA, CEA, Sri Lanka Customs, FCAU. Each has obligations array. |
| **ObligationControl** | 12 | 10 controls passing / 2 failing (the critical + the ABV drift) | Maps to the Registry screen. Covers all MVP capabilities C2/C6/C7/C8/C11/C16. |
| **DomainHealthScore** | 7 | 1 critical / 2 watch / 4 healthy | Excise=risk(score 52), Quality=watch(score 71), Distribution=watch(score 74), Labelling=healthy(89), Export=healthy(85), Environment=healthy(93), Governance=healthy(90) |
| **User** | 6 | 5 active / 1 system | Dinesh(CTO), Priyantha(EXCISE_FINANCE), Nilanthi(QA), Roshan(DISTRIBUTION), Amaya(REGULATORY), system(ADMIN) |

---

## PART 3 — NARRATIVE RULES PER ENTITY

---

### Batch

**ID format:** `{SKU_CODE}-BIY-{YYYYMMDD}-{SEQ:3}`  
Where SKU codes are: `LL625` (Lion Lager 625ml), `LS625` (Lion Strong 625ml), `LL330` (Lion Lager 330ml), `TC330` (Three Coins 330ml), `LC500` (Lion Can 500ml), `CW330` (Craft White Wheat 330ml)  
Examples: `LL625-BIY-20260612-014`, `LS625-BIY-20260609-011`

**Realistic field value rules:**
- `batchId`: follows the pattern above; SEQ is padded to 3 digits; starts at 010 for the demo window (implies earlier batches exist)
- `sapProcessOrderNo`: format `450008{4-digit-seq}` — e.g. `4500087321`. Hero batch = `4500087321`.
- `skuName`: full names — `'Lion Lager 625 ml'`, `'Lion Strong 625 ml'`, `'Lion Lager 330 ml'`, `'Three Coins Lager 330 ml'`, `'Lion Can 500 ml'`, `'Craft White Wheat 330 ml'`
- `packType`: enum per SKU — `bottle_625`, `bottle_330`, `can_500`, `can_330` (no kegs in demo batches; kegs exist in dispatch orders)
- `brewDate`: 3–4 days before `packagedDate`
- `packagedDate`: distributed across 2026-05-12 to 2026-06-14. Exactly 3–4 batches per week Mon-Thu. No batches on weekends.
- `dateCode`: format `BBE{YYYY}-{MM}-{DD} L{line_no} {seq:3}` — e.g. `BBE2026-12-08 L2 014` (BBE = Best Before End, 6 months from packaged date)
- `unitsPackaged`: for 625ml: between 57,600 and 86,400 (96 cases × 600 to 900 bottles per run, in multiples of 2,400). Hero batch = 76,800.
- `packagedVolumeL`: `unitsPackaged × 0.625` — always exact
- `measuredAbvPct`: for Lion Lager: float between 4.7 and 4.9 (spec = 4.8 ± 0.2). Hero batch = 4.8. **One batch (LS625-BIY-20260610-012) must have measuredAbvPct = 5.8** to trigger the excise ABV drift finding (Lion Strong target = 7.5%; the test result on this batch shows a suspicious 5.8% vs 7.5% target). **One batch (LL625-BIY-20260608-010) must have measuredAbvPct = 5.1%** to trigger Row B in the reconciliation diff (declared 4.8%, actual 5.1% → drift alert).
- `lpa`: always computed as `packagedVolumeL × (measuredAbvPct / 100)`, rounded to 1 decimal
- `releaseStatus`: 14 = `released`, 2 = `pending` (in-progress), 1 = `held`, 1 = `rejected`
- **The held batch:** `LL625-BIY-20260614-016` — Lion Lager 625ml, packaged 2026-06-14, micro QC result = pending, release blocked. This is the F3 demo batch.
- **The hero batch (sticker gap):** `LL625-BIY-20260612-014` — Lion Lager 625ml, packaged 2026-06-12, all QC pass, released, 76,800 units, but sticker record shows only 75,600 applied (gap = 1,200 units from lot FPS-2026-AB not yet scanned)
- `abvSignedByName`: `null` for pending/held. For released: `'Nilanthi Perera'` for Lion Lager batches; `'Chamara Bandara'` (deputy QA) for other SKUs.
- `abvSignedAt`: datetime of release, set to 09:42:00+05:30 for hero batch (see demo narrative)
- `stickerSerialRange`: format `FPS-{YYYY}-{LOT_CODE}{seq:7}..{LOT_CODE}{end:7}` where LOT_CODE = AA, AB, AC etc. Hero batch: `'FPS-2026-AA0480001..AA0556800'` (covers 76,800 units). The gap batch references lot FPS-2026-AB.
- `stickerGap`: `unitsPackaged - stickerRecord.qty_applied`. Hero batch = 1,200. All others = 0 except in-progress batch = null.
- `abvVariancePct`: `Math.abs(measuredAbvPct - targetAbvPct)`. Hero batch = 0.0. Drift batch = 0.3.

**Cross-entity consistency rules:**
- Every `Batch` with `releaseStatus = 'held'` must have at least one `ComplianceFinding` with `domain = 'QUALITY'` and `severity = 'high'`
- Every `Batch` with `releaseStatus = 'released'` must have a `QcTestResult` for parameter `micro` with `pass = true` at gate `release`
- The held batch `LL625-BIY-20260614-016` must have `micro = pending` and no `abvSignedAt`
- Hero batch `LL625-BIY-20260612-014` must have a `FoolProofStickerRecord` where `qtyApplied = 75600` (not 76800) and `stickerOrderRef = 'FPS-2026-AB'` in the lot
- The drift batch `LL625-BIY-20260608-010` with ABV 5.1% must appear in reconciliation Row B with an AI note on ABV variance

**Time-series rules:**
- Distribute 18 batches across 2026-05-12 to 2026-06-14 (about 5 weeks = 35 days)
- Cadence: Mon=1 batch, Tue=1 batch, Wed=1 batch, Thu=1 batch, Fri=0, Sat=0, Sun=0
- Resulting density: ≈ 3–4 batches per week, with some weeks having 3 and others 4
- Within a single day, multiple batches can exist on different lines (L1, L2, L3)
- SAP process order numbers increment monotonically with batch sequence

**Demo-critical records:**
```
CRITICAL — HERO BATCH (F2, F3 trace):
  batchId:          'LL625-BIY-20260612-014'
  sapProcessOrderNo:'4500087321'
  skuName:          'Lion Lager 625 ml'
  packType:         'bottle_625'
  brewDate:         '2026-06-08'
  packagedDate:     '2026-06-12'
  dateCode:         'BBE2026-12-08 L2 014'
  unitsPackaged:    76800
  packagedVolumeL:  48000
  measuredAbvPct:   4.8
  lpa:              2304.0
  releaseStatus:    'released'
  abvSignedByName:  'Nilanthi Perera'
  abvSignedAt:      '2026-06-12T09:42:00+05:30'
  stickerSerialRange:'FPS-2026-AA0480001..AA0556800'
  stickerGap:       1200  (75600 applied / 76800 packaged)
  abvVariancePct:   0.0

CRITICAL — HELD BATCH (F3 drill):
  batchId:          'LL625-BIY-20260614-016'
  sapProcessOrderNo:'4500087398'
  skuName:          'Lion Lager 625 ml'
  brewDate:         '2026-06-10'
  packagedDate:     '2026-06-14'
  unitsPackaged:    72000
  packagedVolumeL:  45000
  measuredAbvPct:   4.8  (ABV is fine; micro is the blocker)
  releaseStatus:    'held'
  abvSignedByName:  null   (not yet signed — held)
  stickerGap:       null   (packaging not completed yet)

CRITICAL — ABV DRIFT BATCH (Row B in reconciliation):
  batchId:          'LL625-BIY-20260608-010'
  sapProcessOrderNo:'4500087244'
  skuName:          'Lion Lager 625 ml'
  measuredAbvPct:   5.1   (declared on label as 4.8 → 0.3% drift → duty recalculation required)
  releaseStatus:    'released'
  packagedVolumeL:  43200
  lpa:              2203.2   (vs declared 2073.6 at 4.8% → surplus LPA = 129.6 → duty gap)
```

---

### QcTestResult

**ID format:** `QCR-{batchId}-{PARAMETER}-{seq:3}`  
Example: `QCR-LL625-BIY-20260612-014-MICRO-001`

**Realistic field value rules:**
- Each batch gets exactly 7 QC results at gate `release`: `abv`, `ph`, `co2`, `turbidity`, `micro`, `fill_volume`, `sensory`
- `abv` value: matches `batch.measuredAbvPct` exactly — single source of truth
- `ph` value: float between 4.1 and 4.4 (spec 3.9–4.5). All pass.
- `co2` value: float between 2.55 and 2.75 (spec 2.4–2.8 vols). All pass.
- `turbidity` value: float between 0.1 and 0.4 NTU (spec < 0.5). All pass.
- `micro` value: `'pass'` for released batches, `'pending'` for held batch `LL625-BIY-20260614-016`
- `fill_volume` value: float between 624.5 and 625.5 ml (spec 620–630ml). All pass.
- `sensory` value: `'pass'` or `'pass_with_note'` — never fail (sensory panel would halt before QC result is recorded)
- `source`: `'lims'` for abv/ph/co2/turbidity/fill_volume. `'instrument'` for micro. `'manual'` for sensory.
- `testedAt`: same day as `batch.packagedDate`, between 07:00 and 11:30 IST
- `testedByName`: `'Nilanthi Perera'` for hero batch; `'Chamara Bandara'` for others; `null` for `source='instrument'`
- `specMin`/`specMax`: populate from config — ABV spec for Lager = [4.6, 5.0]; pH = [3.9, 4.5]; CO₂ = [2.4, 2.8]; turbidity = [0, 0.5]; fill = [620, 630]

**Demo-critical records:**
```
CRITICAL — HELD BATCH MICRO (F3 drill, Click 2):
  resultId:     'QCR-LL625-BIY-20260614-016-MICRO-001'
  batchId:      'LL625-BIY-20260614-016'
  gate:         'release'
  parameter:    'micro'
  value:        'pending'
  pass:         null    (pending — this is what blocks release)
  testedAt:     '2026-06-14T08:15:00+05:30'
  source:       'instrument'
  testedByName: null

CRITICAL — DRIFT BATCH ABV (feeds Row B):
  resultId:     'QCR-LL625-BIY-20260608-010-ABV-001'
  batchId:      'LL625-BIY-20260608-010'
  parameter:    'abv'
  value:        5.1
  specMin:      4.6
  specMax:      5.0
  pass:         false  (5.1 > 5.0 spec max → FLAGGED, released under QA override)
  — NOTE: There must be an AuditEvent of type 'override' for this batch with reason:
    'ABV 5.1% marginally above 5.0% spec ceiling; organoleptic panel pass, QA sign-off granted for release'

NARRATIVE ANCHOR — MISSING COA (F5 SLSI pack):
  materialLotId: 'MAT-MALT-202606-003'
  batchId:       'LL625-BIY-20260614-016'  (or any recent batch)
  coaDocId:      null
  coaMatchStatus:'pending'
  — This is the '1 COA gap stamped, not fabricated' in the F5 evidence pack
```

---

### ExciseDeclaration

**ID format:** `EXD-{YYYY}-{MM}`  
Examples: `EXD-2026-05`, `EXD-2026-06`

**Realistic field value rules:**
- Two records: May 2026 (filed+accepted) and June 2026 (draft)
- `period`: `'2026-05'` and `'2026-06'`
- `totalUnitsRemoved`: June = 3,120,000 (computed from reconciliation rows); May = 2,980,000 (healthy baseline, accepted)
- `totalVolumeL`: June = 1,950,000 L; May = 1,862,500 L
- `totalLpa`: June = 93,600.0 LPA (at 4.8% avg ABV); May = 89,400.0 LPA
- `dutyRateApplied`: `'CONFIG_C36_RATE_V2026_3'` — always a string reference, never a raw number. Illustrative rate string: `'Rs 56.19/LPA beer<5%ABV (Excise Notification 2026-01)'`
- `dutyAmountLkr`: June = 5,410,000,000 (Rs 5.41 bn). May = 5,023,000,000 (Rs 5.02 bn).
- `stickerUnitsReconciled`: June = 3,118,800 (short by 1,200 from hero batch gap)
- `stickerVariance`: June = -1,200 (critical flag). May = 0 (clean).
- `exciseRegisterMatch`: June = `'BREAKS_4'`; May = `'matched'`
- `status`: June = `'draft'`; May = `'accepted'`
- `signedBy`: May = `'user_priyantha'`; June = `null`
- `excisePortalRef`: May = `'EXCISE-DEC-2026-05-0089'`; June = `null`
- `declaredVolume` (frontend field for variance display): June = 18,200 L for the hero removal event specifically (vs `expectedVolume` = 19,150 L → drives Rs 0.9M variance in the finding)
- `removalRefsCount`: June = 1,287 removals; May = 1,243 removals

**Cross-entity consistency rules:**
- June declaration's `stickerVariance = -1200` must match `foolProofStickerInventory` hero record's `qtyApplied - unitsRemoved`
- `totalLpa` must equal the sum of all `Batch.lpa` values for batches with removal events in that period
- May declaration must pre-exist and be `accepted` — gives the "things were fine before June" baseline
- `dutyAmountLkr` for June = `totalLpa × dutyRate` — even though rate is config-driven, the fixture should store the computed result (56.19 × 93,600 = ~5,259,384 — adjust to match the demo figure of 5,410,000,000 by using the correct beer class rate; this is the illustrative value; use `5_410_000_000` in fixture and annotate that the rate is illustrative/config-driven)

**Demo-critical records:**
```
CRITICAL — JUNE DRAFT (F2 demo, variance Rs 2.34M):
  declarationId:      'EXD-2026-06'
  period:             '2026-06'
  status:             'draft'
  dutyAmountLkr:      5_410_000_000
  stickerVariance:    -1200
  exciseRegisterMatch:'BREAKS_4'
  totalVarianceLkr:   2_340_000   (expected - declared = Rs 2.34M)
  signedBy:           null        (not yet filed — Sign&File is blocked)
```

---

### FoolProofStickerRecord

**ID format:** `FPS-{YYYY}-{LOT_CODE}` where LOT_CODE is two uppercase letters (AA, AB, AC…) per sticker procurement lot  
Example: `FPS-2026-AA`

**Realistic field value rules:**
- Total records: 18 (one per batch, plus one pipeline lot for in-progress batch)
- Each record represents one sticker procurement lot applied to one batch
- `stickerBatchId`: matches the ID format above
- `serialRangeStart`: format `FPS-{YYYY}-{LOT_CODE}{seq:7}` e.g. `FPS-2026-AA0000001`
- `serialRangeEnd`: start + qtyOrdered - 1
- `qtyOrdered`: always >= unitsPackaged; ordered in batches of 100,000 (so a 76,800-unit batch might draw from a 100k lot and leave remainder for next batch)
- `qtyApplied`: equals unitsPackaged for all batches EXCEPT hero batch where qtyApplied = 75,600 (1,200 short)
- `qtyVoided`: between 0 and 50 per batch (normal wastage); hero batch voided = 0 (the gap is NOT voided — it's unaccounted)
- `appliedToBatchId`: FK to Batch
- `status`: 16 = `'reconciled'`, 1 = `'variance_flagged'` (hero), 1 = `'ordered'` (pipeline)
- `stickerCostPerUnit`: 1.21 (Rs 1.21 per sticker, Madras Security Printers contract)
- `lineApplied`: `'L2'` for hero batch; `'L1'`, `'L2'`, or `'L3'` for others

**Cross-entity consistency rules:**
- Hero batch `LL625-BIY-20260612-014` must have sticker record with `qtyApplied = 75600`, `qtyVoided = 0`, `status = 'variance_flagged'`
- The unscanned lot `FPS-2026-AB` must be referenced in the `aiReasoning` of finding `FND-EXC-20260614-0312`
- `serialRangeStart` and `serialRangeEnd` across all lots must not overlap (sequential allocation)
- `status = 'ordered'` record belongs to held batch `LL625-BIY-20260614-016` (stickers ordered but batch not yet packaged)

**Demo-critical records:**
```
CRITICAL — HERO STICKER GAP (F1, F2):
  stickerBatchId:     'FPS-2026-AB'  ← the unscanned lot (the gap)
  qtyOrdered:         100000
  qtyApplied:         75600   (applied to hero batch, 1200 short of 76800)
  qtyVoided:          0       (NOT voided — unscanned, whereabouts unknown)
  appliedToBatchId:   'LL625-BIY-20260612-014'
  status:             'variance_flagged'
  serialRangeStart:   'FPS-2026-AB0000001'
  serialRangeEnd:     'FPS-2026-AB0100000'
  — Note: the AI hypothesis is that 1200 stickers from FPS-2026-AB were
    not scanned at Line 2. The 24400 remaining in the lot are the "missing" ones.
```

---

### TransportPermit

**ID format:** `TP-{YYYYMMDD}-{seq:4}`  
Example: `TP-20260614-0312`

**Realistic field value rules:**
- 22 total records
- `permitNo`: same as ID (the Excise portal's own reference)
- `dispatchOrderId`: FK to DispatchOrder
- `origin`: always `'Biyagama Bonded Warehouse, No. 254, Colombo Road, Biyagama'`
- `destination`: the licensee's address from CustomerLicence
- `validFrom`: the dispatch date at 00:00:00
- `validTo`: `validFrom + 24 hours` (permits are single-day, single-journey)
- `status`: 20 = `'used'`, 1 = `'expired'` (issued but journey delayed), 1 = missing (see below)
- **One removal event must have `transportPermitId = null`** — this is reconciliation Row D (missing permit, watch severity). NOT the hero batch. Pick a mid-June removal from a Three Coins batch.
- `vehicleRegNo`: Sri Lanka plate format `{province_code}-{class}{seq:4}` e.g. `WP-CAX-1234`, `WP-CAT-5678`
- `driverName`: realistic Sri Lankan names — Saman Perera, Kamal de Silva, Nuwan Jayawardena etc.

**Demo-critical records:**
```
CRITICAL — HERO REMOVAL PERMIT (exists, permit is fine — sticker is the gap):
  permitId:     'TP-20260614-0312'
  permitNo:     'TP-20260614-0312'
  origin:       'Biyagama Bonded Warehouse'
  validFrom:    '2026-06-14T00:00:00+05:30'
  validTo:      '2026-06-14T23:59:59+05:30'
  status:       'used'

WATCH — MISSING PERMIT (Row D in reconciliation):
  — A removal event 'GP-20260611-0301' (Three Coins Lager, ~15000 units)
    must have transportPermitId = null in the ReconciliationRow
  — This drives: ReconciliationRow.status = 'watch', ReconciliationRow.hasPermit = false
```

---

### ReconciliationRow

**ID format:** `GP-{YYYYMMDD}-{seq:4}` (mirrors gate-pass / removal event ID)  
Example: `GP-20260614-0312`

**Realistic field value rules:**
- 8 total rows, covering major removal events in June 2026
- Each row represents one gate-pass event (a load removal from bond)
- `removalId`: the gate-pass ID
- `unitsRemoved`: between 14,400 and 28,800 (multiples of 2,400 = 100 cases)
- `volumeL`: `unitsRemoved × 0.625` for 625ml batches
- `stickersApplied`: equals `unitsRemoved` for clean rows; = `unitsRemoved - 1200` for hero row
- `dutyDeclaredLkr`: `volumeL × (abvPct/100) × dutyRate` — computed correctly for all rows except Row B where declared = 4.8% but actual = 5.1%
- `permitId`: FK to TransportPermit (null for Row D)
- `batchId`: FK to Batch
- `stickerOrderRef`: the FPS lot code contributing to this removal
- `status`: `'critical'` for Row A, `'watch'` for Rows B/C/D, `'healthy'` for Rows E-H
- `stickerDelta`: `stickersApplied - unitsRemoved` — negative = shortage. Row A = -1200. Others = 0.
- `dutyAtRiskLkr`: `Math.abs(stickerDelta) × (volumeL/unitsRemoved) × (abvPct/100) × dutyRate`. Row A = 900,000.
- `hasPermit`: `permitId !== null`. Row D = false.

**The 8 rows with specific values:**
```
Row A — CRITICAL (hero sticker gap, F1/F2 demo):
  removalId:        'GP-20260614-0312'
  batchId:          'LL625-BIY-20260612-014'
  unitsRemoved:     28800
  volumeL:          18000
  stickersApplied:  27600
  stickerDelta:     -1200
  dutyDeclaredLkr:  (28800 units at declared rate — computed)
  dutyAtRiskLkr:    900000   (Rs 0.9M)
  hasPermit:        true     (permit exists; sticker is the issue)
  status:           'critical'
  stickerOrderRef:  'FPS-2026-AB'

Row B — WATCH (ABV drift):
  removalId:        'GP-20260613-0301'
  batchId:          'LL625-BIY-20260608-010'
  unitsRemoved:     24000
  volumeL:          15000
  stickersApplied:  24000   (stickers match — no sticker issue)
  stickerDelta:     0
  abvDeclared:      4.8     (but lab shows 5.1% → duty underdeclared by 0.3%)
  dutyAtRiskLkr:    1_100_000   (Rs 1.1M from ABV drift over full removal volume)
  hasPermit:        true
  status:           'watch'

Row C — WATCH (timing — duty paid but register sync lag):
  removalId:        'GP-20260610-0288'
  unitsRemoved:     21600
  volumeL:          13500
  stickersApplied:  21600
  stickerDelta:     0
  dutyAtRiskLkr:    340_000   (Rs 0.34M timing — Excise register not updated yet)
  status:           'watch'
  exciseRegisterRef: null     (missing from Excise officer's register — sync lag)

Row D — WATCH (missing permit):
  removalId:        'GP-20260611-0295'
  batchId:          (Three Coins Lager batch)
  unitsRemoved:     14400
  stickersApplied:  14400
  stickerDelta:     0
  hasPermit:        false
  status:           'watch'

Rows E-H — HEALTHY (green, matched):
  4 rows, each: stickerDelta=0, hasPermit=true, dutyAtRiskLkr=0, status='healthy'
  unitsRemoved: 19200, 16800, 24000, 21600 respectively
  Dates: June 2, 5, 7, 9 — spread across the month
```

---

### LabelVersion

**ID format:** `LV-{SKU_CODE}-{MARKET}-{version_major}{version_minor}`  
Example: `LV-LL625-LK-v3.2`, `LV-CW330-MV-v1.0`

**Realistic field value rules:**
- 8 records
- `skuId`: reference to Product SKU
- `market`: ISO 3166-1 alpha-2 — `'LK'`, `'MV'`, `'EU'`, `'AU'`, `'AE'`
- `version`: semver string e.g. `'3.2.0'`
- `artworkDocId`: format `DOC-LBL-{skuCode}-{market}-{seq}`
- `mandatoryElements`: JSON object per market rules:
  - LK labels: `{abv: true, volume: true, price: true, warnings: true, sticker_zone: true, sinhala_text: true}`
  - MV labels: `{abv: true, volume: true, warnings: true, no_alcohol_advertising: true, import_permit_ref: true}`
  - EU labels: `{abv: true, volume: true, allergens: true, ingredients: true, country_of_origin: true}`
- `effectiveFrom`: for current labels, between 2024-01-01 and 2026-01-01
- `status`: 6 = `'approved'`, 1 = `'draft'` (new GCC variant for Craft range), 1 = `'retired'` (old LL625 LK label before 2024 redesign)
- `approvedByName`: `'Amaya Jayasuriya'` for export labels; `'Regulatory Team'` for domestic

**8 specific records:**
```
LV-LL625-LK-v3.2  — Lion Lager 625ml, Sri Lanka, status: approved, mandatory includes sticker_zone
LV-LL625-MV-v2.1  — Lion Lager 625ml, Maldives, status: approved
LV-LS625-LK-v2.0  — Lion Strong 625ml, Sri Lanka, status: approved
LV-TC330-LK-v1.4  — Three Coins 330ml, Sri Lanka, status: approved
LV-LC500-LK-v2.3  — Lion Can 500ml, Sri Lanka, status: approved
LV-CW330-MV-v1.0  — Craft White Wheat 330ml, Maldives, status: approved
LV-CW330-EU-v1.0  — Craft White Wheat 330ml, EU, status: draft  (pending approval)
LV-LL625-LK-v3.1  — Lion Lager 625ml, Sri Lanka OLD, status: retired (retired 2024-01-01)
```

---

### CustomerLicence

**ID format (internal):** `CL-{7-char-hash}`  
**FL No format (from register):** `FL{category}/{province_code}/{district_code}/{year}/{seq:4}`  
Province codes: `WP` (Western), `SP` (Southern), `CP` (Central), `NP` (North), `EP` (Eastern), `NWP` (North Western), `NC` (North Central), `SG` (Sabaragamuwa), `UV` (Uva)  
District codes: `COL` (Colombo), `GMP` (Gampaha), `KLT` (Kalutara), `KAN` (Kandy), `GAL` (Galle), `MAT` (Matara)

**Realistic field value rules:**
- 12 total records
- `flCategory`: mix of FL4 (7), FL3 (2), FL7 (2), FL11 (1)
- `holderName`: Sri Lankan business names — use `'(Pvt) Ltd'` suffixes, realistic Colombo/suburban addresses
- `district`: weighted toward Colombo and Gampaha (Western Province = largest volume)
- `validFrom`: always `'{currentYear}-01-01'`
- `validTo`: 9 records = `'2026-12-31'` (healthy full-year); 2 records = `'2026-06-19'` (amber, 3 days); 1 record = `'2026-05-31'` (expired, suspended)
- `status`: 9 = `'active'`, 1 = `'suspended'` (the expired one), 2 = `'active'` (but daysToExpiry <= 7 → amber)
- `daysToExpiry`: computed from `validTo - '2026-06-16'` (demo date). Hero outlet = 3 days. Healthy = 198 days. Suspended = -16 days.
- `eligibility`: derived — `'go'` if active + daysToExpiry > 7; `'amber'` if active + daysToExpiry <= 7; `'hold'` if suspended/expired; `'unverified'` if last FL register sync > 24h ago
- `hasOrderToday`: true for hero outlet and 4 others; false for the rest
- `orderCasesToday`: hero outlet = 480 cases; others with orders = 80–240 cases
- `lastFlRegisterSync`: all = `'2026-06-16T06:00:00+05:30'` (same-morning sync, fresh)
- `licenceDocUri`: format `'dms://licences/{flNo}.pdf'`

**12 specific FL records:**
```
1. FL4/WP/COL/2026/0473 — ABC Wine Stores (Pvt) Ltd, No. 128, Galle Rd, Colombo 04
   validTo: '2026-06-19', status: 'active', eligibility: 'amber', hasOrderToday: true, orderCasesToday: 480
   ← HERO OUTLET (F4 demo)

2. FL4/WP/COL/2026/0812 — Perera Wines & Spirits (Pvt) Ltd, No. 45, Duplication Rd, Colombo 03
   validTo: '2026-12-31', status: 'active', eligibility: 'go', hasOrderToday: true, orderCasesToday: 240

3. FL4/WP/GMP/2026/0154 — Jayawardena Bottle Store, No. 12, Negombo Rd, Gampaha
   validTo: '2026-12-31', status: 'active', eligibility: 'go', hasOrderToday: true, orderCasesToday: 120

4. FL3/WP/GMP/2026/0091 — Sampath Distributors (Pvt) Ltd, Gampaha (wholesaler)
   validTo: '2026-12-31', status: 'active', eligibility: 'go', hasOrderToday: true, orderCasesToday: 1200

5. FL4/SP/GAL/2025/0210 — Southern Spirits Co., No. 78, Matara Rd, Galle
   validTo: '2026-05-31', status: 'suspended', eligibility: 'hold', hasOrderToday: false
   ← SUSPENDED OUTLET (shows system correctly flags)

6. FL7/WP/COL/2026/0034 — Cinnamon Grand Hotel, Colombo 03 (hotel bar)
   validTo: '2026-12-31', status: 'active', eligibility: 'go', hasOrderToday: true, orderCasesToday: 80

7. FL7/WP/COL/2026/0051 — Hilton Colombo (hotel bar)
   validTo: '2026-12-31', status: 'active', eligibility: 'go', hasOrderToday: false

8. FL11/WP/COL/2026/0128 — Ministry of Crab (restaurant)
   validTo: '2026-12-31', status: 'active', eligibility: 'go', hasOrderToday: false

9. FL4/WP/COL/2026/0601 — Lanka Beverages, No. 22, High St, Wellawatte
   validTo: '2026-06-19', status: 'active', eligibility: 'amber', hasOrderToday: false
   ← SECOND EXPIRING OUTLET (daysToExpiry=3, no order today → watch but lower priority)

10. FL4/NWP/KLT/2026/0088 — Kalutara Wine Store, Kalutara Town
    validTo: '2026-12-31', status: 'active', eligibility: 'go', hasOrderToday: false

11. FL3/CP/KAN/2026/0022 — Upcountry Distributors Ltd, Kandy
    validTo: '2026-12-31', status: 'active', eligibility: 'go', hasOrderToday: false

12. FL4/SP/MAT/2026/0067 — Matara City Wines, Matara
    validTo: '2026-12-31', status: 'active', eligibility: 'go', hasOrderToday: false
```

**Cross-entity consistency rules:**
- Hero outlet `FL4/WP/COL/2026/0473` must appear in the top of the `OutletStatusTable` because `hasOrderToday=true AND eligibility='amber'`
- Suspended outlet must have 0 `DispatchOrder` records dated today (system prevents dispatch)
- `lastFlRegisterSync` for all = `'2026-06-16T06:00:00+05:30'` — sync is fresh, so no outlet is `'unverified'`

---

### ExportShipment

**ID format:** `EXP-{COUNTRY_CODE}-{YYYYMMDD}-{seq:3}`  
Example: `EXP-MV-20260615-007`

**Realistic field value rules:**
- 3 total records
- `destination`: `'MV'` (Maldives, 2 shipments), `'AE'` (UAE, 1 shipment planned)
- `incoterm`: `'CIF'` for Maldives, `'FOB'` for UAE
- `asycudaCusDecNo`: format `SL{YYMM}{seq:6}` e.g. `SL2605007823` for May shipment
- `blNo`: Bill of Lading `CMDU{10-digit-seq}` (real shipping line Hapag-Lloyd or CMA CGM prefixes)
- `fxExpectedAmount`: in USD — Maldives shipments ~USD 18,000–22,000; UAE ~USD 35,000
- `fxReceivedAmount`: May shipment = full amount received; June = null (proceeds pending); UAE = null (planned)
- `fxDueDate`: 90 days from bill of lading date (CBSL requirement)
- `status`: May MV = `'closed'`, June MV = `'docs_pending'`, UAE = `'planned'`

**Demo-critical records:**
```
CRITICAL — HERO EXPORT (F5 completeness demo):
  shipmentId:       'EXP-MV-20260615-007'
  destination:      'MV'
  status:           'docs_pending'
  asycudaCusDecNo:  'SL2606009041'
  completenessScore: 0.875   (7 of 8 required docs)
  gap:              'free_sale_health_cert'  ← single gap item
  fxDueDate:        '2026-09-13'   (90 days from BL date)
```

---

### ExportDocumentBundle

**ID format:** `EDB-{COUNTRY_CODE}-{YYYYMMDD}-{seq:3}`  
Example: `EDB-MV-20260615-007`

**Realistic field value rules:**
- 3 records (one per shipment)
- `requiredDocs`: array of objects. For Maldives:
  ```
  commercial_invoice:       required=true, present=true,  valid=true
  packing_list:             required=true, present=true,  valid=true
  certificate_of_origin:   required=true, present=true,  valid=true
  free_sale_health_cert:   required=true, present=false, valid=false  ← THE GAP
  asycuda_cusdec:          required=true, present=true,  valid=true
  bill_of_lading:          required=true, present=true,  valid=true
  destination_import_permit:required=true, present=true, valid=true
  label_conformity_MV:     required=true, present=true,  valid=true
  halal_certificate:       required=false,present=false, valid=false  (not required for MV)
  ```
- `completenessScore`: 7/8 = 0.875
- `gaps`: `['free_sale_health_cert']`
- `clearanceDecision`: `'hold'`

---

### ComplianceFinding

**ID format:** `FND-{DOMAIN_CODE}-{YYYYMMDD}-{seq:4}`  
Domain codes: `EXC` (Excise), `QA` (Quality), `DIST` (Distribution), `EXP` (Export), `ENV` (Environment), `GOV` (Governance)  
Example: `FND-EXC-20260614-0312`

**Realistic field value rules:**
- 7 total findings
- `findingId`: per format above
- `title`: concise, operational — no jargon. Max 80 chars.
- `domain`: `DomainId` enum
- `severity`: `'critical'` (1), `'high'` (3), `'medium'` (2), `'low'` (1)
- `capaStatus`: `'open'` (4), `'in_progress'` (2), `'closed'` (1)
- `dueDate`: criticals within 4 days of finding date; highs within 7–14 days; mediums within 30 days
- `ownerId` / `ownerName`: assigned to named personas (Priyantha, Nilanthi, Roshan, Amaya)
- `aiReasoning`: violet ✦ text — concrete, specific, numbers-driven; labelled hypothesis where applicable
- `aiConfidence`: `'fact'` for sticker count mismatch (observable); `'hypothesis'` for root-cause attribution
- `evidence`: array of EvidenceLink objects pointing to the real artifacts

**7 specific findings:**
```
FND-EXC-20260614-0312 — CRITICAL — open
  title:        'Sticker variance — GP-20260614-0312'
  domain:       'EXCISE'
  severity:     'critical'
  capaStatus:   'open'
  dueDate:      '2026-06-18'
  ownerId:      'user_priyantha'
  ownerName:    'Priyantha Silva'
  whatFailed:   "Control '4-way reconciliation' failed — 28,800 units dispatched (GP-20260614-0312) but only 27,600 Fool Proof Stickers applied (FPS-2026-AB). Gap = 1,200 units."
  requiredAction:'Reconcile sticker lot FPS-2026-AB scan log at Line 2 or raise a void request; update June declaration.'
  aiReasoning:  '✦ 1,200 units (≈ Rs 0.9 M duty at risk) unaccounted. Sticker order FPS-2026-AB was received 2026-06-10 and assigned to Line 2 on 2026-06-12. Application scan log shows 75,600 serial confirmations vs 76,800 units filled. Most likely cause: 1,200 stickers not scanned at Line 2 applicator — operator may have bypassed the scanner for a short run. Hypothesis — not confirmed.'
  aiConfidence: 'hypothesis'
  metricBreach: { label: 'Units gap', value: '-1,200' }
  evidence: [
    { id: 'EV-001', label: 'Gate pass GP-20260614-0312', sourceSystem: 'SAP', entityType: 'RemovalEvent' },
    { id: 'EV-002', label: 'Sticker lot FPS-2026-AB application log', sourceSystem: 'STICKER_PORTAL', entityType: 'FoolProofStickerRecord' },
    { id: 'EV-003', label: 'Batch LL625-BIY-20260612-014 genealogy', sourceSystem: 'SAP', entityType: 'Batch' },
    { id: 'EV-004', label: 'Excise register line 14-Jun', sourceSystem: 'EXCISE_PORTAL', entityType: 'ExciseDeclaration' }
  ]
  ageHours:     48  (opened 2026-06-14 06:12)

FND-QA-20260614-0315 — HIGH — open (F3 demo — held batch)
  title:        'Batch LL625-BIY-20260614-016 held — microbiological result pending'
  domain:       'QUALITY'
  severity:     'high'
  capaStatus:   'open'
  dueDate:      '2026-06-17'
  ownerId:      'user_nilanthi'
  ownerName:    'Nilanthi Perera'
  whatFailed:   'Bright-beer release gate blocked: microbiological result for batch LL625-BIY-20260614-016 is pending instrument read. First-pass plate flagged for re-read at 2026-06-14T08:15.'
  requiredAction:'Await LIMS instrument re-read result (expected by 18:00 2026-06-14). If pass: release. If fail: initiate CIP re-run and batch hold.'
  aiReasoning:  '✦ Micro result outstanding as of 08:15. Instrument re-read usually completes within 6–8 hours. No comparable failure in last 30 batches (micro pass rate 100%). Release block is precautionary. Fact — not a hypothesis.'
  aiConfidence: 'fact'
  metricBreach: { label: 'Micro status', value: 'PENDING' }
  evidence: [
    { id: 'EV-010', label: 'QC result QCR-LL625-BIY-20260614-016-MICRO-001', sourceSystem: 'LIMS', entityType: 'QcTestResult' },
    { id: 'EV-011', label: 'Batch LL625-BIY-20260614-016 checkpoint record', sourceSystem: 'SAP', entityType: 'Batch' }
  ]

FND-EXC-20260613-0288 — HIGH — in_progress (ABV drift, Row B)
  title:        'ABV drift — LL625-BIY-20260608-010 declared 4.8% vs lab 5.1%'
  domain:       'EXCISE'
  severity:     'high'
  capaStatus:   'in_progress'
  dueDate:      '2026-06-20'
  ownerId:      'user_priyantha'
  ownerName:    'Priyantha Silva'
  aiReasoning:  '✦ Lab ABV 5.1% vs declared 4.8% on 43,200 L batch = 129.6 excess LPA. At current duty rate, estimated duty underdeclaration ≈ Rs 1.1 M for the removal events linked to this batch. Fact — the measurement is the fact; the duty gap is computed.'
  aiConfidence: 'fact'
  metricBreach: { label: 'ABV variance', value: '+0.3%' }

FND-DIST-20260616-0001 — HIGH — open (F4 demo — expiring licence)
  title:        'FL licence expiring in 3 days — FL4/WP/COL/2026/0473 (ABC Wine Stores)'
  domain:       'DISTRIBUTION'
  severity:     'high'
  capaStatus:   'open'
  dueDate:      '2026-06-19'
  ownerId:      'user_roshan'
  ownerName:    'Roshan Fernando'
  aiReasoning:  '✦ FL4/WP/COL/2026/0473 (ABC Wine Stores, Colombo 04) valid to 2026-06-19 — 3 days from today. A 480-case dispatch order is scheduled today and will deliver before expiry (eligible). However, no renewal application is on file. Recommend: confirm renewal before next order cycle. Dispatch today is AMBER — eligible but flag renewal.'
  aiConfidence: 'fact'
  metricBreach: { label: 'Days to expiry', value: '3' }

FND-EXP-20260615-0007 — HIGH — open (export doc gap)
  title:        'Free-sale health certificate missing — EXP-MV-20260615-007'
  domain:       'EXPORT'
  severity:     'high'
  capaStatus:   'open'
  dueDate:      '2026-06-18'
  ownerId:      'user_amaya'
  ownerName:    'Amaya Jayasuriya'
  aiReasoning:  '✦ Shipment EXP-MV-20260615-007 to Maldives is missing the FCAU free-sale/health certificate. 7 of 8 required documents present. Certificate was last obtained 2025-09-12 (expired). Completeness score: 87.5%. Shipment clearance is BLOCKED until certificate is obtained.'
  aiConfidence: 'fact'
  metricBreach: { label: 'Completeness', value: '87.5%' }

FND-QA-20260601-0199 — MEDIUM — in_progress (COA delay)
  title:        'Supplier COA pending — malt lot ML-2026-0337'
  domain:       'QUALITY'
  severity:     'medium'
  capaStatus:   'in_progress'
  dueDate:      '2026-06-30'
  ownerId:      'user_nilanthi'
  ownerName:    'Nilanthi Perera'
  aiReasoning:  '✦ COA for malt lot ML-2026-0337 not received from supplier as of 2026-06-16. Standard delivery is 3–5 days post-goods-receipt. Lot received 2026-06-01 — 15 days overdue. Chased supplier on 2026-06-08 with no response. Fact.'

FND-GOV-20260501-0088 — LOW — closed (archived, for time-travel demo)
  title:        'Audit action item — effluent test documentation filing delay (Apr 2026)'
  domain:       'GOVERNANCE'
  severity:     'low'
  capaStatus:   'closed'
  dueDate:      '2026-05-15'
  closedAt:     '2026-05-12'
  ownerId:      null   (resolved before assignment, system-closed)
```

---

### EvidencePack

**ID format:** `EP-{DOMAIN}-{YYYYMM}-{seq:3}`  
Example: `EP-EXCISE-202605-001`

**Realistic field value rules:**
- 3 records
- `domain`: `'excise'`, `'qc'`, `'excise'` (the third is the one generated live in demo)
- `generatedBy`: `'user_priyantha'` for excise packs; `'user_nilanthi'` for QC packs
- `format`: `RegulatorFormat` — `'EXCISE'`, `'SLSI'`
- `hash`: SHA-256 format string `'sha256:{64-char-hex}'` — use realistic-looking but deterministic hex
- `completenessScore`: 1.0 for May pack; 0.998 for SLSI pack (1 COA gap); null for the "to-be-generated" June pack

**3 records:**
```
EP-EXCISE-202605-001 — May Excise Pack (already generated, filed)
  packId:         'EP-EXCISE-202605-001'
  domain:         'excise'
  format:         'EXCISE'
  scopeRef:       { type: 'period', ref: '2026-05' }
  generatedTs:    '2026-05-31T16:42:00+05:30'
  generatedBy:    'user_priyantha'
  completenessScore: 1.0
  hash:           'sha256:a3f8c2d9e4b7f1a6c8d2e9f4a3b7c1d6e8f2a9c4d7b3e6f1a8c2d5e9f4b7a1c3'
  status:         'ready'

EP-SLSI-202605-001 — SLSI Batch Pack (last quarter, slightly stale)
  packId:         'EP-SLSI-202605-001'
  domain:         'qc'
  format:         'SLSI'
  scopeRef:       { type: 'period', ref: '2026-05' }
  generatedTs:    '2026-05-28T11:15:00+05:30'
  generatedBy:    'user_nilanthi'
  completenessScore: 0.998
  gaps:           ['COA for malt lot ML-2026-0337 — stamped as missing, not fabricated']
  hash:           'sha256:b7d4e1f8a2c5d9b3e6f2a8c4d1e7f3a9b5c8d2e4f6a1c7d3e9f5b2a6c1d8e4f7'
  status:         'ready'

EP-EXCISE-202606-001 — June Excise Pack (to-be-generated in demo)
  packId:         'EP-EXCISE-202606-001'
  domain:         'excise'
  format:         'EXCISE'
  scopeRef:       { type: 'period', ref: '2026-06' }
  generatedTs:    null   (generated live during demo)
  completenessScore: null
  hash:           null
  status:         'idle'   (transitions to 'assembling' → 'generating' → 'ready' during F2/F6)
```

---

### AuditEvent

**ID format:** `AE-{YYYYMMDD}-{seq:6}`  
Example: `AE-20260614-000312`

**Realistic field value rules:**
- 45 total records covering May 15 – June 16, 2026
- `eventType`: enum `compute|flag|view|edit|sign|generate|override|assign|resolve|escalate`
- `actor`: `'system'` for compute/flag; specific user IDs for human actions
- `entityRef`: `'{entityType}:{entityId}'` e.g. `'Batch:LL625-BIY-20260612-014'`
- `ts`: ISO datetime in Sri Lanka time `+05:30`
- `sourceLineage`: JSON object showing which upstream data triggered the event

**Key events to include (others can be realistic but less specific):**
```
AE-20260614-000312  — type:'flag',  actor:'system',  entity:'Finding:FND-EXC-20260614-0312'
  ts: '2026-06-14T06:12:00+05:30'
  description: 'Sticker variance detected: 28800 units removed, 27600 stickers applied, gap=1200'
  sourceLineage: { removalId: 'GP-20260614-0312', stickerRecordId: 'FPS-2026-AB', delta: -1200 }

AE-20260614-000330  — type:'assign', actor:'system', entity:'Finding:FND-EXC-20260614-0312'
  ts: '2026-06-14T06:30:00+05:30'
  description: 'Finding auto-assigned to EXCISE_FINANCE owner: Priyantha Silva'

AE-20260612-087321  — type:'sign',   actor:'user_nilanthi', entity:'Batch:LL625-BIY-20260612-014'
  ts: '2026-06-12T09:42:00+05:30'
  description: 'QA release authorised — all 7 gate-3 parameters pass. ABV 4.8% confirmed.'
  before: { releaseStatus: 'pending' }, after: { releaseStatus: 'released' }

AE-20260608-087244  — type:'override', actor:'user_nilanthi', entity:'Batch:LL625-BIY-20260608-010'
  ts: '2026-06-08T11:20:00+05:30'
  description: 'QA override: ABV 5.1% marginally above 5.0% spec ceiling. Organoleptic panel pass. Release authorised with override note.'
  overrideReason: 'ABV 5.1% is 0.1% above upper spec. Sensory panel unanimous pass. No safety concern. Flagging for batch review and excise reconciliation adjustment.'

AE-20260531-089001  — type:'sign',   actor:'user_priyantha', entity:'ExciseDeclaration:EXD-2026-05'
  ts: '2026-05-31T16:42:00+05:30'
  description: 'May 2026 excise declaration signed and filed. 1243 removals, 89400 LPA, Rs 5.02bn duty.'

AE-20260616-000001  — type:'compute', actor:'system', entity:'DomainHealthScore:EXCISE'
  ts: '2026-06-16T06:00:00+05:30'
  description: 'Excise domain health recomputed: score 52/100, status=risk. Driven by 1 critical finding FND-EXC-20260614-0312 and 1 high ABV drift finding.'
```

---

### RegulatoryActor

**ID format:** `RA-{NAME_CODE}`  
Example: `RA-EXCISE-DEPT`, `RA-SLSI`

**Realistic field value rules:**
- 6 records
- `name`: exact official names
- `jurisdiction`: `'Sri Lanka'` for domestic; `'Maldives'` / `'GCC'` for destination actors in export context
- `contactOffice`: realistic — Excise Dept has resident unit at Biyagama

**6 records:**
```
RA-EXCISE-DEPT  — Excise Department of Sri Lanka
  fullName: 'Department of Excise, Ministry of Finance'
  jurisdiction: 'Sri Lanka'
  residencyNote: 'Resident Excise Unit physically stationed at Biyagama brewery'
  relevantCapabilities: ['C6','C7','C8','C11','C17']

RA-SLSI        — Sri Lanka Standards Institution
  fullName: 'Sri Lanka Standards Institution (SLSI)'
  jurisdiction: 'Sri Lanka'
  relevantCapabilities: ['C3','C12','C13','C24']

RA-NATA        — National Authority on Tobacco and Alcohol
  fullName: 'National Authority on Tobacco and Alcohol (NATA)'
  jurisdiction: 'Sri Lanka'
  relevantCapabilities: ['C14']

RA-CEA         — Central Environmental Authority
  fullName: 'Central Environmental Authority (CEA)'
  jurisdiction: 'Sri Lanka'
  relevantCapabilities: ['C27']

RA-CUSTOMS     — Sri Lanka Customs
  fullName: 'Sri Lanka Customs, Department of Customs'
  jurisdiction: 'Sri Lanka'
  relevantCapabilities: ['C22','C20']

RA-FCAU        — Foreign Currency Administration Unit / Export Health
  fullName: 'FCAU / National Plant Quarantine Service — Export Health Certificate Authority'
  jurisdiction: 'Sri Lanka'
  relevantCapabilities: ['C20','C21','C23']
```

---

### ObligationControl

**ID format:** `OC-{DOMAIN_CODE}-{seq:3}`  
Example: `OC-EXC-001`

**Realistic field value rules:**
- 12 records covering all MVP capabilities
- `obligationText`: verbatim operational language, not legal citation
- `regulator`: FK to `RegulatoryActor`
- `control`: what the system/person does to meet the obligation
- `ownerRole`: `PersonaRole` enum
- `frequency`: `'batch'|'daily'|'monthly'|'event'|'annual'`
- `capabilityIds`: array of C-IDs from Stage 2
- `configValue`: the config-driven parameter (null if no config dependency)
- `controlStatus`: `'passing'` (10) or `'failing'` (2)

**12 specific records:**
```
OC-EXC-001 — Pay excise duty on LPA removed (Excise Dept)
  control: '4-way reconciliation: SAP removals ↔ stickers ↔ duty declared ↔ permits'
  ownerRole: 'EXCISE_FINANCE'
  frequency: 'monthly'
  capabilityIds: ['C6','C7','C8']
  configValue: 'Duty rate v2026.3 — Rs/LPA beer<5%ABV (Excise Notification 2026-01)'
  controlStatus: 'failing'  ← drives the Excise domain being AT-RISK

OC-EXC-002 — Affix Fool Proof Sticker on every bottle (Excise Dept)
  control: 'Serial-level sticker reconciliation per batch'
  ownerRole: 'EXCISE_FINANCE'
  frequency: 'batch'
  capabilityIds: ['C11']
  configValue: null
  controlStatus: 'failing'  ← driven by hero sticker gap

OC-QA-001 — Release beer to market only when all QC gates pass (SLSI, Food Act)
  control: 'Batch release workflow with QA e-sign'
  ownerRole: 'QA'
  frequency: 'batch'
  capabilityIds: ['C2','C3','C4']
  configValue: 'SLS 675:2019 Beer specification'
  controlStatus: 'passing'

OC-QA-002 — Conform to SLS beer specification (SLSI)
  control: 'In-process and release QC gate testing'
  ownerRole: 'QA'
  frequency: 'batch'
  capabilityIds: ['C3','C24']
  configValue: 'ABV spec: 4.6–5.0% for Lager'
  controlStatus: 'passing'

OC-DIST-001 — Supply only to holders of valid Excise licences (Excise Dept)
  control: 'Pre-dispatch outlet-validity check (FL register sync)'
  ownerRole: 'DISTRIBUTION'
  frequency: 'daily'
  capabilityIds: ['C15','C16']
  configValue: null
  controlStatus: 'passing'

OC-DIST-002 — Ensure transport permit accompanies every load (Excise Dept)
  control: 'Transport permit generation/check per dispatch order'
  ownerRole: 'DISTRIBUTION'
  frequency: 'event'
  capabilityIds: ['C17']
  configValue: null
  controlStatus: 'passing'

OC-LABEL-001 — Label beer per SLS and Food Act requirements (SLSI, MoH)
  control: 'On-pack label verification (vision + rules)'
  ownerRole: 'REGULATORY'
  frequency: 'batch'
  capabilityIds: ['C12','C13','C14']
  configValue: 'Mandatory elements: ABV, net volume, price, allergens, batch code, sticker zone, Sinhala text'
  controlStatus: 'passing'

OC-EXP-001 — Clear every export shipment with complete documentation (Customs/FCAU)
  control: 'Per-destination dossier completeness check'
  ownerRole: 'REGULATORY'
  frequency: 'event'
  capabilityIds: ['C20','C21']
  configValue: 'Destination ruleset v2026.1 — MV/AE/EU/AU'
  controlStatus: 'passing'

OC-EXP-002 — Repatriate export proceeds within CBSL deadline (CBSL)
  control: 'FX-repatriation deadline tracking per shipment'
  ownerRole: 'EXCISE_FINANCE'
  frequency: 'event'
  capabilityIds: ['C23']
  configValue: '90-day repatriation window (CBSL Exchange Control Direction)'
  controlStatus: 'passing'

OC-ENV-001 — Discharge effluent within EPL limits (CEA)
  control: 'Effluent sampling cadence and limit monitoring'
  ownerRole: 'EHS'
  frequency: 'monthly'
  capabilityIds: ['C27']
  configValue: 'EPL No. WP/CEA/EPL/2023/B/0441 — valid to 2027-03-31'
  controlStatus: 'passing'

OC-GOV-001 — Maintain audit log of all compliance actions (Internal Audit)
  control: 'Immutable audit event log with lineage'
  ownerRole: 'ADMIN'
  frequency: 'event'
  capabilityIds: ['C30']
  configValue: null
  controlStatus: 'passing'

OC-GOV-002 — Maintain and version regulatory obligation registry (Compliance Admin)
  control: 'Config-driven obligation and duty-rate management'
  ownerRole: 'ADMIN'
  frequency: 'event'
  capabilityIds: ['C36']
  configValue: 'Ruleset v2026.3 — effective 2026-06-01'
  controlStatus: 'passing'
```

---

### DomainHealthScore

**ID format:** `DOMAIN-{DOMAIN_CODE}`  
Example: `DOMAIN-EXCISE`, `DOMAIN-QUALITY`

**7 records — full specification:**
```
DOMAIN-EXCISE
  domainId:         'EXCISE'
  label:            'Excise & Duty'
  status:           'risk'         ← drives overall posture to AT-RISK (not critical — only 1 critical finding)
  score:            52             ← < 60 → red tile in demo
  trend:            'down'         ← was 78 last month (May clean), now 52 (June variance)
  openFindingsCount: 2
  openCriticalCount: 1
  topFindingText:   'Sticker variance 1,200 units ≈ Rs 0.9 M — GP-20260614-0312'
  topFindingId:     'FND-EXC-20260614-0312'
  ownerName:        'Priyantha Silva'
  ownerRole:        'EXCISE_FINANCE'
  lastAuditResult:  'FAILED'
  lastAuditDate:    '2026-06-14'

DOMAIN-QUALITY
  domainId:         'QUALITY'
  label:            'Quality & Lab'
  status:           'watch'
  score:            71
  trend:            'flat'
  openFindingsCount: 2
  openCriticalCount: 0
  topFindingText:   'Batch LL625-BIY-20260614-016 held — micro retest pending'
  topFindingId:     'FND-QA-20260614-0315'
  ownerName:        'Nilanthi Perera'
  ownerRole:        'QA'
  lastAuditResult:  'PENDING'
  lastAuditDate:    '2026-06-14'

DOMAIN-DISTRIBUTION
  domainId:         'DISTRIBUTION'
  label:            'Distribution / POS'
  status:           'watch'
  score:            74
  trend:            'down'         ← was 92 before expiring licences
  openFindingsCount: 1
  openCriticalCount: 0
  topFindingText:   '3 outlets expiring < 7 days — FL4/WP/COL/2026/0473 has order today'
  topFindingId:     'FND-DIST-20260616-0001'
  ownerName:        'Roshan Fernando'
  ownerRole:        'DISTRIBUTION'
  lastAuditResult:  'N_A'
  lastAuditDate:    null

DOMAIN-LABELLING
  domainId:         'LABELLING' (maps to 'Labeling & Marking' pillar)
  label:            'Labelling & Marking'
  status:           'healthy'
  score:            89
  trend:            'flat'
  openFindingsCount: 0
  openCriticalCount: 0
  topFindingText:   'All artworks current — 8 SKU/market combinations verified'
  topFindingId:     null
  ownerName:        'Amaya Jayasuriya'
  ownerRole:        'REGULATORY'
  lastAuditResult:  'PASSED'
  lastAuditDate:    '2026-06-01'

DOMAIN-EXPORT
  domainId:         'EXPORT'
  label:            'Export'
  status:           'healthy'     ← despite 1 high finding, no criticals and trend is resolved
  score:            85
  trend:            'flat'
  openFindingsCount: 1
  openCriticalCount: 0
  topFindingText:   'Free-sale cert missing — EXP-MV-20260615-007 (hold, not sailed yet)'
  topFindingId:     'FND-EXP-20260615-0007'
  ownerName:        'Amaya Jayasuriya'
  ownerRole:        'REGULATORY'
  lastAuditResult:  'N_A'
  lastAuditDate:    null

DOMAIN-ENVIRONMENT
  domainId:         'ENVIRONMENT'
  label:            'Environmental / EHS'
  status:           'healthy'
  score:            93
  trend:            'up'
  openFindingsCount: 0
  openCriticalCount: 0
  topFindingText:   'EPL WP/CEA/EPL/2023/B/0441 valid to 2027-03-31'
  topFindingId:     null
  ownerName:        'EHS Lead'
  ownerRole:        'EHS'
  lastAuditResult:  'PASSED'
  lastAuditDate:    '2026-05-15'

DOMAIN-GOVERNANCE
  domainId:         'GOVERNANCE'
  label:            'Governance'
  status:           'healthy'
  score:            90
  trend:            'up'
  openFindingsCount: 0
  openCriticalCount: 0
  topFindingText:   'Ruleset v2026.3 active — all obligations have owners and evidence rules'
  topFindingId:     null
  ownerName:        'Internal Audit'
  ownerRole:        'ADMIN'
  lastAuditResult:  'PASSED'
  lastAuditDate:    '2026-06-01'
```

---

### User

**ID format:** `user_{first_name_lowercase}`  
Example: `user_priyantha`, `user_nilanthi`

**6 records:**
```
user_dinesh
  name:     'Dinesh Weerasinghe'
  role:     'CTO'
  language: 'en'
  email:    'dinesh.w@lionbrew.lk'
  avatarInitials: 'DW'

user_priyantha
  name:     'Priyantha Silva'
  role:     'EXCISE_FINANCE'
  language: 'en'
  email:    'priyantha.s@lionbrew.lk'
  avatarInitials: 'PS'

user_nilanthi
  name:     'Nilanthi Perera'
  role:     'QA'
  language: 'en'
  email:    'nilanthi.p@lionbrew.lk'
  avatarInitials: 'NP'

user_roshan
  name:     'Roshan Fernando'
  role:     'DISTRIBUTION'
  language: 'en'
  email:    'roshan.f@lionbrew.lk'
  avatarInitials: 'RF'

user_amaya
  name:     'Amaya Jayasuriya'
  role:     'REGULATORY'
  language: 'en'
  email:    'amaya.j@lionbrew.lk'
  avatarInitials: 'AJ'

user_system
  name:     'Lion Compliance Platform'
  role:     'ADMIN'
  language: 'en'
  email:    'system@lionbrew.lk'
  avatarInitials: 'SY'
  isSystem: true
```

---

### TimelineSnapshot

**5 records — the TimeSelector dropdown "rewind to key event" options:**
```
SNAP-001  ts: '2026-06-14T06:12:00+05:30'  label: 'Sticker variance flagged (Jun 14)'
  eventType: 'finding_opened', entityRef: 'FND-EXC-20260614-0312', postureAtTs: 'watch'

SNAP-002  ts: '2026-06-12T09:42:00+05:30'  label: 'Hero batch released (Jun 12)'
  eventType: 'batch_release', entityRef: 'LL625-BIY-20260612-014', postureAtTs: 'watch'

SNAP-003  ts: '2026-06-14T08:00:00+05:30'  label: 'Held batch — micro pending (Jun 14)'
  eventType: 'finding_opened', entityRef: 'FND-QA-20260614-0315', postureAtTs: 'watch'

SNAP-004  ts: '2026-05-31T16:42:00+05:30'  label: 'May declaration filed (clean)'
  eventType: 'declaration_filed', entityRef: 'EXD-2026-05', postureAtTs: 'healthy'

SNAP-005  ts: '2026-06-16T06:00:00+05:30'  label: 'FL register sync — today 06:00'
  eventType: 'licence_sync', entityRef: 'FL_REGISTER', postureAtTs: 'risk'
```

---

## PART 4 — DEMO SCENARIO MAP

*Every demo scene and drill flow from Stage 4 mapped to exact fixture records required.*

| Demo Scene / Drill Flow | Entity | Record ID | Required State | Required Field Values |
|---|---|---|---|---|
| **Scene 1 — Risk Posture** (Dashboard opens) | DomainHealthScore | DOMAIN-EXCISE | status='risk', score<60 | score:52, openCriticalCount:1, topFindingText:'Sticker variance 1,200 units ≈ Rs 0.9 M' |
| **Scene 1** | derivedAggregates | (root) | posture=AT-RISK | overallPostureBand:'risk', openCriticalCount:1, deadlinesWithin7dCount:3, dutyPositionJune2026Lkr:5_410_000_000 |
| **Scene 1** | DomainHealthScore | DOMAIN-QUALITY | status='watch' | topFindingText:'Batch LL625-BIY-20260614-016 held: micro retest pending' |
| **Scene 1** | DomainHealthScore | DOMAIN-DISTRIBUTION | status='watch' | topFindingText:'3 outlets expiring < 7 days' |
| **Scene 1** | DomainHealthScore | DOMAIN-LABELLING | status='healthy' | topFindingText:'All artworks current' |
| **Scene 1 — AI feed** | AuditEvent | AE-20260614-000312 | type='flag' | description:'Sticker variance: 28800 units removed, 27600 stickers applied, gap=1200, Rs 0.9M at risk' |
| **Scene 1 — AI feed** | AuditEvent | AE-20260616-000001 | type='compute' | description:'Distribution → WATCH because FL4/WP/COL/2026/0473 expires in 3 days' |
| **F1 — Click 1: Excise tile** | DomainHealthScore | DOMAIN-EXCISE | status='risk' | score:52, trend:'down' (was 78 in May) |
| **F1 — Click 2: Sticker finding** | ComplianceFinding | FND-EXC-20260614-0312 | severity='critical', capaStatus='open' | whatFailed:'28,800 units dispatched vs 27,600 stickers', aiReasoning includes 'FPS-2026-AB' and 'Rs 0.9 M', aiConfidence:'hypothesis' |
| **F1 — Click 3: Gate-pass evidence** | AuditEvent / EvidenceLink | EV-001 | sourceSystem='SAP' | label:'Gate pass GP-20260614-0312', entityType:'RemovalEvent' |
| **F1 — Click 4: Assign/confirm owner** | ComplianceFinding | FND-EXC-20260614-0312 | ownerId='user_priyantha' | ownerName:'Priyantha Silva', role:'EXCISE_FINANCE' |
| **F2 — Click 1: Duty position card** | ExciseDeclaration | EXD-2026-06 | status='draft' | dutyAmountLkr:5_410_000_000, totalVarianceLkr:2_340_000 |
| **F2 — Click 2: Row A (red sticker cell)** | ReconciliationRow | GP-20260614-0312 | status='critical' | unitsRemoved:28800, stickersApplied:27600, stickerDelta:-1200, dutyAtRiskLkr:900_000, batchId:'LL625-BIY-20260612-014' |
| **F2 — Variance waterfall** | ReconciliationRow | GP-20260614-0312, GP-20260613-0301, GP-20260610-0288 | three flagged rows | Rs 0.9M sticker + Rs 1.1M ABV drift + Rs 0.34M timing = Rs 2.34M total |
| **F2 — Click 3: View batch** | Batch | LL625-BIY-20260612-014 | releaseStatus='released' | unitsPackaged:76800, stickerGap:1200, measuredAbvPct:4.8, stickerSerialRange:'FPS-2026-AA0480001..AA0556800' |
| **F2 — Click 4: Generate Evidence Pack** | EvidencePack | EP-EXCISE-202606-001 | status='idle'→'ready' | format:'EXCISE', scopeRef:{type:'period',ref:'2026-06'}, gaps:[] (generates complete) |
| **F3 — Click 1: Batch-hold alert** | ComplianceFinding | FND-QA-20260614-0315 | severity='high', capaStatus='open' | title:'Batch LL625-BIY-20260614-016 held — microbiological result pending' |
| **F3 — Click 1: Load batch** | Batch | LL625-BIY-20260614-016 | releaseStatus='held' | measuredAbvPct:4.8, abvSignedByName:null, unitsPackaged:72000 |
| **F3 — Click 2: Red checkpoint (micro)** | QcTestResult | QCR-LL625-BIY-20260614-016-MICRO-001 | pass=null | value:'pending', gate:'release', parameter:'micro', source:'instrument', testedAt:'2026-06-14T08:15:00+05:30' |
| **F3 — Click 2: AI note** | ComplianceFinding | FND-QA-20260614-0315 | aiConfidence='fact' | aiReasoning:'✦ Micro result outstanding as of 08:15. Instrument re-read usually completes within 6–8 hours. No comparable failure in last 30 batches.' |
| **F3 — Click 3: Lab result** | QcTestResult | QCR-LL625-BIY-20260614-016-MICRO-001 | — | value:'pending', specMin:null (micro is pass/fail), source:'instrument' |
| **F3 — Click 4: Hold decision** | Batch | LL625-BIY-20260614-016 | releaseStatus stays 'held' | Approve button must be disabled (releaseStatus='held' and micro=pending blocks it) |
| **F4 — Click 1: POS Monitor** | derivedAggregates | (root) | — | posLicenceComplianceRate:0.997, totals:{active:11, suspended:1, expiringWithin7d:2, ineligibleWithOrderToday:1} |
| **F4 — Click 1: Outlet table** | CustomerLicence | FL4/WP/COL/2026/0473 | status='active', eligibility='amber' | daysToExpiry:3, validTo:'2026-06-19', hasOrderToday:true, orderCasesToday:480 — SORTED TO TOP |
| **F4 — Click 2: Outlet row** | CustomerLicence | FL4/WP/COL/2026/0473 | — | licenceDocUri:'dms://licences/FL4-WP-COL-2026-0473.pdf' |
| **F4 — Click 2: AI eligibility reasoning** | ComplianceFinding | FND-DIST-20260616-0001 | — | aiReasoning:'✦ Licence valid but expires in 3 days. 480-case dispatch will deliver before expiry — eligible. No renewal on file. AMBER.' |
| **F4 — Click 3: Hold dispatch** | DispatchOrder | (DO for FL4/WP/COL/2026/0473 today) | validityDecision='amber'→'hold' | Audit event logged: 'Dispatch blocked by Roshan Fernando: licence expiring in 3 days, renewal not on file' |
| **F5 — Click 1: Open Evidence Pack Builder** | EvidencePack | EP-SLSI-202606-001 (new) | status='idle', pre-scoped | scopeRef:{type:'period', ref:'2026-06'}, format pre-set to match calling screen |
| **F5 — Click 2: Select SLSI + current period** | EvidencePack | EP-SLSI-202606-001 | assembling | contents includes: 18 batch records, HACCP logs, release sign-offs. Gap: 'COA for malt lot ML-2026-0337 — stamped as missing' |
| **F5 — Click 2: Completeness** | EvidencePack | EP-SLSI-202606-001 | completenessScore=0.998 | gaps:['COA for malt lot ML-2026-0337 — stamped, not fabricated'], format:'SLSI' |
| **F5 — Click 3: Generate** | EvidencePack | EP-SLSI-202606-001 | status='ready' | hash:'sha256:{deterministic-hex}', generatedTs:'2026-06-16T{demo-time}+05:30' |
| **F6 — Click 1: Dashboard** | derivedAggregates | (root) | posture='risk' | overallPostureBand:'risk', dutyPositionJune2026Lkr:5_410_000_000 |
| **F6 — Click 2: Excise tile** | DomainHealthScore | DOMAIN-EXCISE | status='risk', score=52 | topFindingText:'Sticker variance 1,200 units ≈ Rs 0.9 M', trend:'down' |
| **F6 — Click 3: Finding** | ComplianceFinding | FND-EXC-20260614-0312 | severity='critical' | aiReasoning with Rs 0.9M + hypothesis label, 4 evidence links |
| **F6 — Click 4: Generate Evidence Pack** | EvidencePack | EP-EXCISE-202606-001 | status='idle' | Pre-scoped: {type:'period',ref:'2026-06'}, format:'EXCISE' |
| **F6 — Click 5: Generate** | EvidencePack | EP-EXCISE-202606-001 | status='ready' | completenessScore:1.0, generationDurationMs:<8000, hash set |
| **Scene 5 — Registry close** | ObligationControl | OC-EXC-001 | controlStatus='failing' | configValue:'Duty rate v2026.3', capabilityIds:['C6','C7','C8'] |
| **Scene 5 — Registry close** | ObligationControl | OC-EXC-002 | controlStatus='failing' | Affix sticker — failing because hero gap |
| **Scene 5 — Industry filter adaptability** | ObligationControl | (all 12) | all bound to industry='Brewing' | Switching to 'Distilling' would swap obligations without changing screens — demonstrate with filter |

---

### Cross-entity consistency checklist for the developer

*The developer generating the fixture in Cursor must verify these before committing the file:*

1. `Batch.lpa` = `packagedVolumeL × (measuredAbvPct / 100)` for every batch — compute and store, never freehand
2. `ReconciliationRow.dutyAtRiskLkr` = `|stickerDelta| × (volumeL/unitsRemoved) × (abvPct/100) × dutyRate` — Row A must = 900,000
3. `FoolProofStickerRecord.qtyApplied` for hero = 75,600 ≠ `Batch.unitsPackaged` = 76,800 → delta = 1,200 in all places
4. `ExciseDeclaration.stickerVariance` = -1,200 (June) must match the finding `metricBreach.value` = '-1,200'
5. `DomainHealthScore.openCriticalCount` for EXCISE = 1 must match `ComplianceFinding` count where domain='EXCISE' AND severity='critical' AND capaStatus='open'
6. `derivedAggregates.openCriticalCount` = 1 (only FND-EXC-20260614-0312)
7. `derivedAggregates.deadlinesWithin7dCount` = 3 (FND-EXC-20260614-0312 due Jun 18, FND-DIST-20260616-0001 due Jun 19, FND-QA-20260614-0315 due Jun 17)
8. `CustomerLicence.daysToExpiry` for hero = 3 when computed from `validTo='2026-06-19'` and demo date `'2026-06-16'`
9. `ExportDocumentBundle.completenessScore` = 7/8 = 0.875 for hero bundle
10. All `AuditEvent` timestamps must be chronologically consistent — no event references an entity that was created later
11. `AuditEvent` for override (drift batch ABV) must pre-date the `QcTestResult` for that batch
12. `stickerSerialRange` values must not overlap across `FoolProofStickerRecord` entries
13. `UserIds` referenced in findings as `ownerId` must exist in the `users` array
14. All `evidence[]` links in `ComplianceFinding` must reference entities that exist in the fixture
15. `overallPostureBand = 'risk'` (not 'critical') because the single critical finding is in Excise, but the overall band is risk not critical — developer must confirm the posture-band logic rule: 1 critical → AT-RISK band

---

*End of Mock Data Structure Document.*  
*A developer taking this document into Cursor can generate `mockData.ts` without making a single design decision. Every entity count, ID format, field value, cross-entity link, and demo-critical value is defined here. The only remaining developer action is executing the generation with seed=20260616.*
