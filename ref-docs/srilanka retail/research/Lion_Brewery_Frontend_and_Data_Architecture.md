# Frontend & Data Architecture
## AI-Powered Audit & Compliance Platform — Lion Brewery (Ceylon) PLC — **MVP**

**Builds on:** Stage 2 (Data Model, entities + derived metrics) + Stage 4 (UX Blueprint, MVP cut).
**Audience:** the frontend engineer creating files on day one; the state engineer writing the store; the backend engineer validating API shapes; the QA engineer writing interaction tests.

**Stack assumptions (stated once):** React 18 + TypeScript, file-based routing, TanStack Query for server cache, a store library for client UI state (slices below are written store-agnostic — map 1:1 to Redux Toolkit `createSlice` or Zustand stores). All money in **LKR** (integer minor units = cents avoided; use `number` rupees + `formatLKR()`). Realtime via WebSocket channel `compliance.events`.

**MVP screens in scope (from Stage 4):** RiskPostureDashboard, ExciseReconciliationWorkbench, BatchComplianceTracker, PosLicenceMonitor, EvidencePackBuilder (global modal), ObligationControlRegistry; + two reusable overlays: DomainDrillSlideOver, FindingSlideOver. (Export Document Bundle + Audit Timeline screens are v2; their state slices are still defined per brief — exportBundle for v2, auditTimeline backs the global time-travel control.)

**Data-ownership convention (resolves the thinking-instruction question once):**
`SHELL`/`SCREEN`/data-owning `PANEL` → **subscribe to slices** (own data). `WIDGET`/`FORM`/`SHARED`/`OVERLAY` → **receive props + emit callbacks** (never fetch/join at render). Realtime fields flow in via the WS channel into slices; components stay prop-driven.

> All sample values are realistic Lion data (no lorem ipsum). `[VERIFY]` items (POS count ~2,800, current duty rate, ~Rs 64.8 bn liability, SAP/LIMS maturity) remain discovery inputs.

---

# PART 1 — COMPONENT TREE

```
SHELL AppShell — providers (QueryClient, Store, Theme, AuthGuard), router, WS subscription to compliance.events
  LAYOUT RootLayout — 12-col page frame; mounts global overlays
    LAYOUT SideNav — 2-col rail (icon+label), route links, user/role chip, language toggle EN/සිං/தமிழ்
    LAYOUT TopBar — command bar; owns filters slice writes
      SHARED GlobalSearch — batch/FL/CusDec search
      SHARED TimeSelector — "Now" + snapshot rewind (writes filters.timeRange + auditTimeline.asAt)
      SHARED GenerateEvidencePackButton — opens EvidencePackBuilderModal pre-scoped to active screen
      FORM InspectionModeToggle — sets uiState.inspectionMode
    SCREEN RiskPostureDashboard — owns riskPosture slice read
      PANEL DashboardStatusBand — owns nothing; props from riskPosture
        WIDGET PostureMeter — gauge, band + driver count
        WIDGET CounterCard ×3 — Open Criticals / Deadlines<7d / Duty Position
      PANEL DomainHealthGrid
        WIDGET DomainStatusCard — status, trend, top finding, owner
          SHARED StatusDot
          SHARED OwnerChip
      PANEL AiChangeFeed
        WIDGET AiInsightCard
          SHARED AiReasoningBlock
      OVERLAY DomainDrillSlideOver — opened by DomainStatusCard click
        WIDGET FindingListRow ×n
        SHARED GenerateEvidencePackButton (domain-scoped)
    SCREEN ExciseReconciliationWorkbench — owns exciseReconciliation slice
      PANEL ExciseStatusBand
        WIDGET DutyPositionGauge
        WIDGET VarianceCard
        WIDGET ReconStateCard
      PANEL FourWayDiffGrid
        WIDGET DiffRow
          WIDGET DiffCell ×4 (removals | stickers | duty | permits)
      PANEL BreakDetailPanel — context (right)
        SHARED AiReasoningBlock — variance hypothesis
        WIDGET VarianceWaterfall
        SHARED EvidenceLink ×n
      PANEL ExciseActionRail
        FORM ResolveBreakForm
        FORM AddNoteForm
        OVERLAY ReturnDraftModal — preview + e-sign (Sign&File)
    SCREEN BatchComplianceTracker — owns batchCompliance slice
      PANEL BatchStatusBand — batchId, SKU, SAP order, canonical ABV (signed), release status
      PANEL CheckpointTimeline
        WIDGET CheckpointNode ×8
      PANEL CheckpointContextPanel — context (right)
        WIDGET QcResultList
        SHARED AiReasoningBlock — release-block reason
        WIDGET AbvTripleCheckCard
        WIDGET StickerApplicationCard
        WIDGET LabelVerificationCard
      PANEL BatchActionRail
        FORM ReleaseDecisionForm — approve(disabled if red)/hold/order-retest/escalate/override
    SCREEN PosLicenceMonitor — owns posLicenceMonitor slice
      PANEL PosStatusBand
        WIDGET CounterCard ×4 — compliance rate / suspended / expiring<7d / ineligible-with-order-today
      PANEL OutletStatusTable
        WIDGET OutletRow
          SHARED EligibilityChip
          SHARED StatusDot
      PANEL OutletContextPanel — context (right)
        WIDGET LicenceDocViewer
        SHARED AiReasoningBlock — eligibility reasoning
      PANEL PosActionRail
        FORM DispatchDecisionForm — hold/clear(reason)/flag-renewal
    SCREEN ObligationControlRegistry — owns via registry query (admin); minimal client slice
      PANEL RegistryStatusBand — ruleset version, rulebook-health counters
      PANEL ObligationMatrix
        WIDGET ObligationRow — obligation→control→owner→evidence→capability→config
      PANEL ConfigVersionPanel — context (right)
        FORM DutyRateEditForm
        WIDGET ChangeImpactPreview
          SHARED AiReasoningBlock
        FORM PublishVersionForm
  OVERLAY EvidencePackBuilderModal — global; owns evidencePack slice; pre-scoped from caller
    FORM ScopeFormatSelector — scope (period/batch/shipment/domain) + regulator tabs
    WIDGET PackContentsChecklist
      SHARED ProvenanceBadge
    FORM GeneratePackForm — generate / add / exclude(reason) / export
  OVERLAY FindingSlideOver — global, reusable; owns findingDetail slice; stacks over any caller
    SHARED SeverityBadge
    SHARED OwnerChip
    SHARED AiReasoningBlock
    SHARED EvidenceLink ×n
    WIDGET ResolutionThread
    FORM FindingActionForm — resolve(attach evidence)/escalate/override(reason)/reassign
  OVERLAY ToastHost — transient success/error
  SHARED ErrorBoundary / OfflineBanner / EmptyState / ErrorState — global states
```

## SHARED COMPONENT CATALOG

**AiReasoningBlock** — the violet ✦ block that renders any AI conclusion *with* its reasoning string `[P1 explainability]`.
- Used on: Dashboard, Excise Workbench, Batch Tracker, POS Monitor, Registry, FindingSlideOver.
- Props: `conclusion: string` · `reasoning: string` · `confidence: 'fact' | 'hypothesis'` · `evidenceLinks?: EvidenceLink[]` · `metric?: { label: string; value: string }`.
- Variants: `fact` (solid accent), `hypothesis` (dashed border + "hypothesis" tag), `compact` (one-line in feed), `expanded`.
- Emits: `onEvidenceClick(linkId)`.

**OwnerChip** — named accountable owner; never optional.
- Used on: Dashboard tiles, DomainDrill, FindingSlideOver, ObligationMatrix.
- Props: `ownerId: string | null` · `name: string | null` · `role: PersonaRole`.
- Variants: `assigned`, `unassigned` (red "UNASSIGNED").
- Emits: `onReassignClick()`.

**StatusDot / StatusBadge** — compliance status token.
- Used on: all screens.
- Props: `status: ComplianceStatus` (`healthy|watch|risk|critical|neutral`) · `label?: string` · `size`.
- Variants: dot, badge, pill.
- Emits: none.

**SeverityBadge** — finding severity.
- Used on: FindingSlideOver, DomainDrill, AiChangeFeed.
- Props: `severity: Severity` (`low|medium|high|critical`) · `withReasoning?: boolean`.
- Variants: 4 severities.
- Emits: none.

**CounterCard** — labelled metric with status colour + drill.
- Used on: Dashboard, POS Monitor.
- Props: `label: string` · `value: string` · `status: ComplianceStatus` · `caption?: string` · `onClick?`.
- Variants: `default`, `clickable`, `loading`, `empty`.
- Emits: `onClick()`.

**EvidenceLink** — one-click-to-proof row `[P2]`.
- Used on: Excise Workbench, FindingSlideOver, Batch Tracker, EvidencePackBuilder.
- Props: `id: string` · `label: string` · `sourceSystem: SourceSystem` · `entityType: string` · `hash?: string`.
- Variants: `default`, `withProvenance`, `broken` (error).
- Emits: `onOpen(entityType, id)`.

**EligibilityChip** — dispatch eligibility (C16).
- Used on: POS Monitor (also referenced by dispatch logic).
- Props: `eligibility: 'go'|'amber'|'hold'|'unverified'` · `reasoning: string`.
- Variants: 4 states; `unverified` when FL register sync stale.
- Emits: `onReasonHover()`.

**TimeSelector** — global time-travel control `[P5]`.
- Used on: TopBar (all screens).
- Props: `value: ISODateTime | 'now'` · `snapshots: Snapshot[]`.
- Variants: `now`, `historical` (watermark mode).
- Emits: `onChange(asAt)`.

**GenerateEvidencePackButton** — opens builder pre-scoped `[P7]`.
- Used on: TopBar, DomainDrill, all screens' command areas.
- Props: `scope: PackScope` · `defaultFormat: RegulatorFormat`.
- Variants: `primary`, `inline`.
- Emits: `onOpen(scope, format)`.

**DataTable** — virtualized table for outlet/diff lists.
- Used on: POS Monitor, (Excise diff uses a specialized grid).
- Props: `columns`, `rows`, `sort`, `onRowClick`, `rowStatusAccessor`.
- Variants: `default`, `loading` (skeleton), `empty`, `error`.
- Emits: `onRowClick(id)`, `onSortChange`.

**EmptyState / ErrorState / OfflineBanner** — standardized non-happy paths.
- Used on: every data panel.
- Props: `variant`, `message`, `lastSyncedAt?`, `retry?`.
- Emits: `onRetry()`.

---

# PART 2 — STATE MODEL

*Convention: server data lives in TanStack Query cache; these slices hold **client/UI state + realtime-merged figures** that components read synchronously. Each slice = the minimum shape that lets its readers render without extra fetches.*

## STEP 2A — STATE SLICES

### session
Purpose: who is using the app and in what role — drives nav, RBAC, e-sign identity, language.
```typescript
interface SessionSlice {
  userId: string                 // static
  name: string                   // e.g. "Priyantha Silva"
  role: PersonaRole              // 'CTO'|'EXCISE_FINANCE'|'QA'|'DISTRIBUTION'|'REGULATORY'|'EHS'|'ADMIN'
  permissions: string[]          // capability/action grants
  language: 'en'|'si'|'ta'       // UI language
  siteId: string                 // 'BIYAGAMA' (sole site)
}
```
Initial: hydrated from auth token on AppShell mount.
Persists across: all screens (whole session).
Clears on: logout / token expiry.
Actions: `setSession(payload)` · `setLanguage(lang)` · `clearSession()`.

### filters
Purpose: cross-screen query parameters (single source so screens stay in sync).
```typescript
interface FiltersSlice {
  timeRange: { asAt: ISODateTime | 'now'; from?: ISODateTime; to?: ISODateTime } // rt-affecting
  domain: DomainId | 'all'       // 'EXCISE'|'QUALITY'|'DISTRIBUTION'|'EXPORT'|'ENVIRONMENT'|'GOVERNANCE'
  period: string                 // '2026-06'
  flCategory: FlCategory | 'all' // POS filter
  district: string | 'all'       // POS filter
  searchQuery: string
}
```
Initial: `{ timeRange:{asAt:'now'}, domain:'all', period: currentPeriod(), flCategory:'all', district:'all', searchQuery:'' }`.
Persists across: all screens.
Clears on: explicit "reset filters"; `asAt` reverts to 'now' on logout.
Actions: `setTimeRange` · `setDomain` · `setPeriod` · `setFlCategory` · `setDistrict` · `setSearch` · `resetFilters`.

### riskPosture
Purpose: dashboard aggregate — domain health, counters, AI change feed.
```typescript
interface RiskPostureSlice {
  overallBand: ComplianceStatus          // rt
  openCriticals: number                  // rt
  deadlinesWithin7d: number              // rt
  dutyPositionLkr: number                // rt — e.g. 5_410_000_000
  domains: DomainHealth[]                // rt
  changeFeed: AiInsight[]                // rt — what-changed items
  lastRefreshed: ISODateTime
  weighting?: PostureWeighting           // fetched on PostureMeter click
}
```
Initial: empty arrays, band `neutral`, until A1 resolves.
Persists across: dashboard ↔ drill ↔ back (kept warm while in app).
Clears on: logout.
Actions: `setRiskPosture(payload)` · `mergeRealtimeEvent(event)` · `setWeighting(w)`.

### batchCompliance
Purpose: the active batch's full checkpoint state for the Batch Tracker.
```typescript
interface BatchComplianceSlice {
  activeBatchId: string | null            // 'LL625-BIY-20260612-014'
  batch: Batch | null                     // denormalized (see Part 3)
  checkpoints: Checkpoint[]               // ordered brewhouse→dispatch
  selectedCheckpointId: string | null
  releaseDecisionPending: boolean
}
```
Initial: all null/empty.
Persists across: stays while on Batch Tracker; cleared when opening a different batch.
Clears on: route away from Batch Tracker OR `loadBatch(newId)`.
Actions: `loadBatch(batchId)` · `selectCheckpoint(id)` · `applyReleaseDecision(decision)` · `clearBatch()`.

### exciseReconciliation
Purpose: the four-way tie-out figures, rows, breaks, selected break.
```typescript
interface ExciseReconciliationSlice {
  period: string                          // '2026-06'
  dutyPositionLkr: number                 // rt — 5_410_000_000
  totalVarianceLkr: number                // rt — 2_340_000
  reconState: { breaks: number; criticals: number }  // rt
  rows: ReconciliationRow[]               // four-way aligned rows
  selectedRowId: string | null            // e.g. 'GP-20260614-0312'
  varianceWaterfall: VarianceAttribution[]
  returnDraft?: ExciseDeclarationDraft
  canFile: boolean                        // derived: false while any critical break open
}
```
Initial: empty until A (load) resolves; `canFile:false`.
Persists across: workbench ↔ batch drill ↔ back.
Clears on: period change re-loads; logout.
Actions: `setReconciliation(payload)` · `selectRow(id)` · `resolveBreak(rowId, note)` · `acknowledgeVariance(rowId)` · `draftReturn()` · `signAndFile(signature)`.

### posLicenceMonitor
Purpose: outlet licence list, eligibility, dispatch blocks.
```typescript
interface PosLicenceSlice {
  complianceRate: number                  // rt — 0.997
  totals: { active:number; suspended:number; expiringWithin7d:number; ineligibleWithOrderToday:number }
  outlets: CustomerLicence[]              // sorted: ineligible-with-order first
  selectedFlNo: string | null             // 'FL4/WP/COL/2026/0473'
  lastFlRegisterSync: ISODateTime
  syncStale: boolean                      // derived
}
```
Initial: empty until load.
Persists across: POS monitor session.
Clears on: logout; refresh on FL-register sync.
Actions: `setOutlets(payload)` · `selectOutlet(flNo)` · `holdDispatch(flNo, reason)` · `clearDispatch(flNo, reason)` · `flagRenewal(flNo)`.

### exportBundle *(v2 screen; slice defined per brief)*
Purpose: per-shipment document checklist + completeness gate.
```typescript
interface ExportBundleSlice {
  shipmentId: string | null               // 'EXP-MV-20260615-007'
  destination: CountryCode | null         // 'MV'
  asycudaCusDecNo: string | null
  requiredDocs: ExportDoc[]               // {docType,required,present,valid,docId}
  completenessScore: number               // derived — 0.875
  gaps: string[]
  clearanceDecision: 'clear'|'hold'|null  // derived: hold if <1.0
}
```
Initial: null/empty.
Persists across: while viewing a shipment.
Clears on: shipment change / route away.
Actions: `loadShipment(id)` · `markObtained(docType)` · `clearShipment()` (blocked <100%).

### findingDetail
Purpose: the active finding in the FindingSlideOver.
```typescript
interface FindingDetailSlice {
  activeFindingId: string | null          // 'FND-EXC-20260614-0312'
  finding: Finding | null                 // denormalized
  resolutionThread: ResolutionEvent[]
  actionPending: 'resolve'|'escalate'|'override'|'reassign'|null
}
```
Initial: null.
Persists across: while slide-over open (stacks over any screen).
Clears on: slide-over close.
Actions: `openFinding(id)` · `resolveFinding(evidenceIds)` · `escalateFinding()` · `overrideFinding(reason)` · `reassignOwner(ownerId, reason)` · `closeFinding()`.

### evidencePack
Purpose: pack builder state — scope, format, contents, generation status.
```typescript
interface EvidencePackSlice {
  scope: PackScope                        // {type:'period'|'batch'|'shipment'|'domain', ref:string}
  format: RegulatorFormat                 // 'EXCISE'|'SLSI'|'FCAU'|'CUSTOMS'|'NATA'|'CEA'|'BOARD'
  contents: PackItem[]                    // {label,included,status,docId,provenanceHash}
  completeness: number                    // derived — 0.998
  gaps: string[]
  generationStatus: 'idle'|'assembling'|'generating'|'ready'|'error'
  generatedPackId: string | null
  outputUri: string | null
}
```
Initial: scope pre-filled from caller; `generationStatus:'idle'`.
Persists across: modal lifetime only.
Clears on: modal close.
Actions: `setScope` · `setFormat` · `assembleContents()` · `toggleItem(id)` · `excludeItem(id, reason)` · `generatePack()` · `reset()`.

### auditTimeline *(backs global time-travel; full screen v2)*
Purpose: selected point-in-time + the snapshot data driving "as at" rendering.
```typescript
interface AuditTimelineSlice {
  asAt: ISODateTime | 'now'               // mirrors filters.timeRange.asAt
  snapshots: Snapshot[]                   // key events: releases, declarations, dispatches
  isHistorical: boolean                   // derived: asAt !== 'now'
  snapshotData?: PostureSnapshot          // posture as at asAt (fetched)
}
```
Initial: `{ asAt:'now', snapshots:[], isHistorical:false }`.
Persists across: all screens (rewind is global).
Clears on: "return to Now" / logout.
Actions: `setAsAt(ts)` · `setSnapshots(list)` · `returnToNow()`.

### uiState
Purpose: pure UI — active screen, open overlays, loading/error per domain, inspection mode.
```typescript
interface UiStateSlice {
  activeScreen: ScreenId
  openOverlay: 'domainDrill'|'finding'|'evidencePack'|'returnDraft'|null
  overlayStack: string[]                  // supports finding stacked over domainDrill
  loading: Record<string, boolean>        // keyed by domain/action
  errors: Record<string, string | null>
  inspectionMode: boolean                 // banner + one-tap pack emphasis
  offline: boolean
}
```
Initial: `{ activeScreen:'dashboard', openOverlay:null, overlayStack:[], loading:{}, errors:{}, inspectionMode:false, offline:false }`.
Persists across: all screens.
Clears on: n/a (lives with app); overlays clear on close.
Actions: `setActiveScreen` · `openOverlay(name, ref?)` · `closeOverlay()` · `setLoading(key,bool)` · `setError(key,msg)` · `setInspectionMode(bool)` · `setOffline(bool)`.

## STEP 2B — STATE TRANSITION MAP (all 6 Stage-4 drill flows)

| User action | Slice affected | Field changed | New value |
|---|---|---|---|
| **F1.1** Click red Excise tile | uiState; filters | `openOverlay`, `overlayStack`; `domain` | `'domainDrill'`, `['domainDrill']`; `'EXCISE'` |
| **F1.2** Click sticker-variance finding | uiState; findingDetail | `overlayStack`; `activeFindingId`, `finding` | `['domainDrill','finding']`; `'FND-EXC-20260614-0312'`, {…} |
| **F1.3** Click gate-pass evidence | uiState | `openOverlay` (evidence viewer) | opens source artifact |
| **F1.4** Reassign/confirm owner | findingDetail | `finding.ownerId`, `resolutionThread` | `'user_priyantha'`, +event |
| **F2.1** Click duty position card | uiState; (route) | `activeScreen` | `'exciseWorkbench'` |
| **F2.2** Click Row A (red ②) | exciseReconciliation | `selectedRowId` | `'GP-20260614-0312'` |
| **F2.3** Click "View batch" | batchCompliance; uiState | `activeBatchId`, `batch`; `activeScreen` | `'LL625-BIY-20260612-014'`, {…}; `'batchTracker'` |
| **F2.4** Generate Evidence Pack (Excise) | uiState; evidencePack | `openOverlay`; `scope`,`format` | `'evidencePack'`; `{type:'period',ref:'2026-06'}`,`'EXCISE'` |
| **F3.1** Click batch-hold alert | batchCompliance; uiState | `activeBatchId`,`batch`; `activeScreen` | batch id; `'batchTracker'` |
| **F3.2** Click red checkpoint | batchCompliance | `selectedCheckpointId` | `'cp-bright-release'` |
| **F3.3** Click micro result | uiState | `openOverlay` (lab viewer) | lab result detail |
| **F3.4** Hold / order retest | batchCompliance | `checkpoints[].decision`, `releaseDecisionPending` | `'held'`, `false` |
| **F4.1** Open POS Monitor | posLicenceMonitor; uiState | `outlets`; `activeScreen` | list; `'posMonitor'` |
| **F4.2** Click outlet row | posLicenceMonitor | `selectedFlNo` | `'FL4/WP/COL/2026/0473'` |
| **F4.3** Hold dispatch (+reason) | posLicenceMonitor | `outlets[].dispatchDecision`, audit event | `'hold'` + logged |
| **F5.1** Click Generate Evidence Pack | uiState; evidencePack | `openOverlay`; `scope` | `'evidencePack'`; pre-scoped period |
| **F5.2** Select SLSI + period | evidencePack | `format`, `contents`, `completeness` | `'SLSI'`, assembled, `0.998` |
| **F5.3** Generate → export | evidencePack | `generationStatus`, `generatedPackId`, `outputUri` | `'ready'`, id, uri |
| **F6.1–6.5** Dashboard→tile→finding→pack→generate | (composite of F1+F2 above) | as per rows | full-story path |

---

# PART 3 — FRONTEND DATA MODEL

*camelCase; render fields denormalized onto the object; lookup fields index-mapped; `rt` = realtime (WS-merged), `session` = fetched once per session, `static` = reference data.*

### Batch (frontend shape)
```typescript
interface Batch {
  // Identity
  batchId: string                 // 'LL625-BIY-20260612-014' — source: SAP — session
  sapProcessOrderNo: string       // '4500087321' — SAP — static

  // Core
  skuName: string                 // 'Lion Lager 625 ml' — SAP — static
  packType: PackType              // 'bottle_625' — SAP — static
  brewDate: ISODate               // SAP — static
  packagedDate: ISODate           // SAP — static
  dateCode: string                // 'BBE2026-12-08 L2 014' — line — static
  unitsPackaged: number           // 76800 — SAP/line — static
  packagedVolumeL: number         // 48000 — SAP — static
  measuredAbvPct: number          // 4.8 — LIMS/manual — session
  releaseStatus: ReleaseStatus    // 'pending'|'released'|'held'|'rejected' — rt

  // Denormalized for display
  abvSignedByName: string | null  // 'Nilanthi Perera' — denormalized from User — used by BatchStatusBand [P3]
  abvSignedAt: ISODateTime | null // denormalized — BatchStatusBand
  stickerSerialRange: string      // 'FPS-2026-AA0480001..AA0556800' — denormalized from StickerLot — StickerApplicationCard

  // Derived (computed on API response, stored)
  lpa: number                     // 2304.0 = packagedVolumeL × abv/100 — used by DiffRow/ExciseWorkbench
  stickerGap: number              // unitsPackaged − stickersApplied — StickerApplicationCard
  abvVariancePct: number          // |lab − label| — AbvTripleCheckCard
}
```

### ReconciliationRow (frontend shape) — the four-way row
```typescript
interface ReconciliationRow {
  // Identity
  removalId: string               // 'GP-20260614-0312' — Excise/SAP — rt

  // Core (four columns)
  unitsRemoved: number            // 28800 — SAP — rt
  volumeL: number                 // 18000 — SAP — rt
  stickersApplied: number         // 27600 — Sticker portal — rt
  dutyDeclaredLkr: number         // Excise declaration — rt
  permitId: string | null         // 'TP-20260614-0312' — Excise portal — rt

  // Denormalized
  batchId: string                 // denormalized — links DiffRow → Batch drill
  stickerOrderRef: string         // 'FPS-2026-AB' — StickerLot — BreakDetailPanel

  // Derived
  status: ComplianceStatus        // 'critical' if stickersApplied<unitsRemoved — DiffRow colour
  stickerDelta: number            // -1200 — DiffCell ②
  dutyAtRiskLkr: number           // 900000 — AiReasoningBlock
  hasPermit: boolean              // permitId != null — DiffCell ④
}
```

### CustomerLicence (frontend shape)
```typescript
interface CustomerLicence {
  // Identity
  flNo: string                    // 'FL4/WP/COL/2026/0473' — FL register — session
  customerId: string              // SAP — static

  // Core
  flCategory: FlCategory          // 'FL4' — FL register — static
  holderName: string              // 'ABC Wine Stores (Pvt) Ltd' — FL register — static
  district: string                // 'Colombo' — static
  province: string                // 'Western' — static
  validFrom: ISODate              // static
  validTo: ISODate                // '2026-06-19' — FL register — session
  status: LicenceStatus           // 'active'|'suspended'|'expired' — rt (register sync)

  // Denormalized
  hasOrderToday: boolean          // denormalized from DispatchOrder — OutletRow sort key
  orderCasesToday: number         // 480 — OutletRow
  licenceDocUri: string           // DMS — LicenceDocViewer

  // Derived
  daysToExpiry: number            // 3 — EligibilityChip
  eligibility: Eligibility        // 'go'|'amber'|'hold'|'unverified' — EligibilityChip
  eligibilityReason: string       // ✦ AI string — AiReasoningBlock
}
```

### Finding (frontend shape)
```typescript
interface Finding {
  // Identity
  findingId: string               // 'FND-EXC-20260614-0312' — system — rt

  // Core
  title: string                   // 'Sticker variance — GP-20260614-0312'
  domain: DomainId                // 'EXCISE'
  severity: Severity              // 'critical' — classification — rt
  capaStatus: 'open'|'in_progress'|'closed' // rt
  dueDate: ISODate                // '2026-06-18'
  ageHours: number                // derived

  // Denormalized
  ownerId: string | null          // 'user_priyantha'
  ownerName: string | null        // 'Priyantha Silva' — OwnerChip [P3]
  whatFailed: string              // control + breach text
  requiredAction: string

  // AI
  aiReasoning: string             // ✦ — AiReasoningBlock [P1]
  aiConfidence: 'fact'|'hypothesis'
  metricBreach: { label: string; value: string } // {'units gap','-1200'}

  // Linked evidence (denormalized list)
  evidence: EvidenceLink[]        // gate pass, sticker order, batch, register line [P2]
}
```

### DomainHealth (frontend shape)
```typescript
interface DomainHealth {
  domainId: DomainId              // 'EXCISE' — static
  label: string                   // 'Excise & Duty'
  status: ComplianceStatus        // rt
  trend: 'up'|'down'|'flat'       // rt
  topFindingText: string          // 'Sticker variance 1,200 units ≈ Rs 0.9 M' — rt
  topFindingId: string | null     // drill target
  ownerName: string | null        // 'Priyantha Silva' — OwnerChip
  openFindingsCount: number       // rt
}
```

### EvidencePackItem & ExportDoc & ObligationControl (frontend shapes)
```typescript
interface PackItem {
  itemId: string
  label: string                   // 'Batch genealogy records (Jun) — 412 batches'
  included: boolean
  status: 'present'|'missing'|'stale'
  docId: string | null
  provenanceHash: string | null   // ProvenanceBadge [P2]
}
interface ExportDoc {
  docType: string                 // 'free_sale_health_cert'
  required: boolean
  present: boolean
  valid: boolean
  docId: string | null
}
interface ObligationControl {
  obligationId: string
  obligationText: string          // 'Pay duty on LPA removed (Excise Dept)'
  regulator: RegulatorFormat
  control: string                 // '4-way reconciliation'
  ownerRole: PersonaRole
  evidenceType: string
  frequency: 'daily'|'batch'|'monthly'|'event'|'annual'
  capabilityIds: string[]         // ['C6','C7','C8']
  configValue: string | null      // 'Duty rate v2026.3'
}
```

### Shared enums / primitives
```typescript
type PersonaRole = 'CTO'|'EXCISE_FINANCE'|'QA'|'DISTRIBUTION'|'REGULATORY'|'EHS'|'ADMIN'
type DomainId = 'EXCISE'|'QUALITY'|'DISTRIBUTION'|'EXPORT'|'ENVIRONMENT'|'GOVERNANCE'
type ComplianceStatus = 'healthy'|'watch'|'risk'|'critical'|'neutral'
type Severity = 'low'|'medium'|'high'|'critical'
type FlCategory = 'FL3'|'FL4'|'FL6'|'FL7'|'FL8'|'FL11'|'FL13A'|'FL22'
type LicenceStatus = 'active'|'suspended'|'expired'
type Eligibility = 'go'|'amber'|'hold'|'unverified'
type RegulatorFormat = 'EXCISE'|'SLSI'|'FCAU'|'CUSTOMS'|'NATA'|'CEA'|'BOARD'
type ReleaseStatus = 'pending'|'released'|'held'|'rejected'
type PackType = 'bottle_625'|'bottle_330'|'can_500'|'can_330'|'keg'
type SourceSystem = 'SAP'|'LIMS'|'EXCISE_PORTAL'|'STICKER_PORTAL'|'FL_REGISTER'|'ASYCUDA'|'DMS'|'MANUAL'|'IOT'
type ScreenId = 'dashboard'|'exciseWorkbench'|'batchTracker'|'posMonitor'|'registry'
```

## INDEX MAPS
```typescript
// O(1) lookups for filters and drill-downs — built once on API response
batchById:            Record<string, Batch>
reconciliationRowById:Record<string, ReconciliationRow>      // key 'GP-...'
licenceByFlNo:        Record<string, CustomerLicence>
findingById:          Record<string, Finding>
findingIdsByDomain:   Record<DomainId, string[]>             // DomainDrill list
domainHealthById:     Record<DomainId, DomainHealth>
evidenceLinkById:     Record<string, EvidenceLink>
outletFlNosByDistrict:Record<string, string[]>               // POS district filter
obligationsByDomain:  Record<DomainId, ObligationControl[]>  // Registry
snapshotByTimestamp:  Record<string, Snapshot>               // time-travel
```

---

# PART 4 — INTERACTION MODEL

## STEP 4A — PRIMITIVE ACTIONS

| ID | Name | Trigger | State change | API call | Optimistic update |
|---|---|---|---|---|---|
| **A1** | Load dashboard risk posture | Dashboard mount / WS tick | `riskPosture.*`, `uiState.loading.dashboard` | `GET /risk-posture?asAt={asAt}` | No (initial load shows skeleton) |
| **A2** | Drill into domain | Click DomainStatusCard | `filters.domain`, `uiState.openOverlay='domainDrill'` | `GET /domains/{id}/findings` | Yes (open overlay immediately, stream findings) |
| **A3** | Open finding detail | Click FindingListRow | `findingDetail.activeFindingId/finding`, push overlay | `GET /findings/{id}` | Yes (render denormalized snapshot, hydrate thread) |
| **A4** | Approve finding resolution | FindingActionForm submit (resolve) | `findingDetail.finding.capaStatus='closed'`, thread+ | `POST /findings/{id}/resolve {evidenceIds}` | Yes (mark closed; rollback on error) |
| **A5** | Override AI flag with reason | FindingActionForm (override) | `finding.capaStatus`, thread+ "overridden by…" | `POST /findings/{id}/override {reason}` | Yes (annotate, never delete) `[P6]` |
| **A6** | Generate evidence pack | GeneratePackForm submit | `evidencePack.generationStatus`, `generatedPackId`, `outputUri` | `POST /evidence-packs {scope,format,asAt}` | No (show 'generating'; ~8s; then 'ready') |
| **A7** | Apply time-travel snapshot | TimeSelector change | `filters.timeRange.asAt`, `auditTimeline.asAt/isHistorical` | `GET /snapshots?asAt={ts}` then refetch active screen | Yes (watermark immediately, swap data on resolve) |
| **A8** | Block dispatch (licence risk) | DispatchDecisionForm (hold) | `posLicenceMonitor.outlets[].dispatchDecision='hold'` | `POST /dispatches/{id}/block {reason}` | Yes (mark hold; audit event appended) |
| **A9** | Acknowledge excise variance | ResolveBreakForm / Ack | `exciseReconciliation.rows[].status`, `totalVarianceLkr`, `canFile` | `POST /excise/variances/{rowId}/ack {note}` | Yes (recompute variance client-side, confirm on response) |
| **A10** | Download export document bundle | "Export" on bundle (v2) | `exportBundle.*` read | `GET /export-bundles/{id}/download` | No (file stream) |

## STEP 4B — WORKED EXAMPLES (all 6 flows)

### FLOW F1 — CTO: red domain → finding → evidence → assign owner
```
Step 1: User clicks Excise DomainStatusCard (red)
  → Action: A2
  → State: filters.domain 'all'→'EXCISE'; uiState.openOverlay null→'domainDrill'; overlayStack ['domainDrill']
  → API: GET /domains/EXCISE/findings
  → Component: DomainDrillSlideOver mounts with findingIdsByDomain['EXCISE']
  → UI: slide-over lists "Sticker variance 1,200 units ≈ Rs 0.9 M", owner Priyantha

Step 2: User clicks the sticker-variance FindingListRow
  → Action: A3
  → State: findingDetail.activeFindingId='FND-EXC-20260614-0312', finding={…}; overlayStack ['domainDrill','finding']
  → API: GET /findings/FND-EXC-20260614-0312
  → Component: FindingSlideOver stacks; AiReasoningBlock renders reasoning + metricBreach
  → UI: what failed + evidence list + ✦ "1,200 units ≈ Rs 0.9 M; likely unscanned FPS-2026-AB (hypothesis)"

Step 3: User clicks "Gate pass GP-…-0312" EvidenceLink
  → Action: (evidence open)
  → State: uiState.openOverlay='evidence'
  → API: GET /evidence/{id}
  → Component: EvidenceViewer
  → UI: the actual SAP gate pass (proof) — evidence reached at click 3 ✓

Step 4: User clicks Reassign/confirm owner
  → Action: reassignOwner
  → State: finding.ownerId='user_priyantha'; resolutionThread += event
  → API: POST /findings/{id}/reassign {ownerId, reason}
  → Component: OwnerChip re-renders
  → UI: owner confirmed; toast "Assigned to Priyantha Silva"
Resolution: owner assigned. Max clicks: 4 (evidence at 3 ✓).
```

### FLOW F2 — Excise Officer: workbench → variance → batch → evidence pack
```
Step 1: Click duty-position CounterCard (Dashboard)
  → Action: route → A(load workbench)
  → State: uiState.activeScreen 'dashboard'→'exciseWorkbench'; exciseReconciliation.* loaded
  → API: GET /excise/reconciliation?period=2026-06
  → Component: FourWayDiffGrid renders rows; ExciseStatusBand shows variance Rs 2.34 M
  → UI: diff grid, breaks: 4 (1 critical)

Step 2: Click Row A (red ② cell)
  → Action: selectRow
  → State: exciseReconciliation.selectedRowId='GP-20260614-0312'
  → API: none (row in cache) — GET /excise/rows/{id}/detail if not hydrated
  → Component: BreakDetailPanel + AiReasoningBlock + VarianceWaterfall
  → UI: ✦ reasoning + "View batch" — evidence at click 2 ✓

Step 3: Click "View batch"
  → Action: loadBatch
  → State: batchCompliance.activeBatchId='LL625-BIY-20260612-014', batch={…}; activeScreen='batchTracker'
  → API: GET /batches/LL625-BIY-20260612-014
  → Component: BatchComplianceTracker; StickerApplicationCard shows stickerGap -1200
  → UI: batch checkpoint timeline + sticker gap visible

Step 4: Click "Generate Evidence Pack — Excise"
  → Action: A6 (open + generate)
  → State: uiState.openOverlay='evidencePack'; evidencePack.scope={period,'2026-06'}, format='EXCISE'; status 'assembling'→'generating'→'ready'
  → API: POST /evidence-packs {scope,format:'EXCISE',asAt}
  → Component: EvidencePackBuilderModal → PackContentsChecklist
  → UI: pack ready in ~8s; export
Resolution: export Excise pack. Max clicks: 4 (evidence at 2 ✓).
```

### FLOW F3 — QA: batch-hold alert → batch → failed test → lab → decide
```
Step 1: Click batch-hold AlertCard (Quality tile / change feed)
  → Action: loadBatch
  → State: batchCompliance.activeBatchId=batch, activeScreen='batchTracker'
  → API: GET /batches/{id}
  → Component: CheckpointTimeline → red 'Bright-beer release' node
  → UI: timeline with halted node

Step 2: Click red CheckpointNode
  → Action: selectCheckpoint
  → State: batchCompliance.selectedCheckpointId='cp-bright-release'
  → API: GET /batches/{id}/checkpoints/cp-bright-release
  → Component: CheckpointContextPanel + QcResultList + AiReasoningBlock
  → UI: "Micro: retest pending"; ✦ "release blocked until micro=pass" — evidence at click 2 ✓

Step 3: Click "Micro" QcResult
  → Action: (open lab result)
  → State: uiState.openOverlay='labResult'
  → API: GET /qc-results/{id}
  → Component: LabResultViewer
  → UI: value vs spec, source LIMS/instrument/OCR

Step 4: ReleaseDecisionForm → Hold / Order retest
  → Action: applyReleaseDecision('hold') (Approve disabled while red)
  → State: batchCompliance.checkpoints[].decision='held'
  → API: POST /batches/{id}/release-decision {decision:'hold', reason}
  → Component: BatchStatusBand
  → UI: status stays HELD; toast logged
Resolution: hold + retest. Max clicks: 4 (evidence at 2 ✓). AI never auto-releases [P6].
```

### FLOW F4 — Distribution: POS check → expiring licence → block + log
```
Step 1: Open POS Monitor (Distribution tile)
  → Action: setOutlets (load)
  → State: posLicenceMonitor.outlets[], activeScreen='posMonitor'
  → API: GET /pos/licences?asAt=now
  → Component: OutletStatusTable (ineligible-with-order sorted top)
  → UI: FL4/WP/COL/2026/0473 amber "expires in 3 days"

Step 2: Click outlet OutletRow
  → Action: selectOutlet
  → State: posLicenceMonitor.selectedFlNo='FL4/WP/COL/2026/0473'
  → API: GET /pos/licences/{flNo}
  → Component: OutletContextPanel + LicenceDocViewer + AiReasoningBlock
  → UI: valid-to 2026-06-19; ✦ eligibility reasoning — evidence at click 2 ✓

Step 3: DispatchDecisionForm → Hold (+reason)
  → Action: A8
  → State: outlets[].dispatchDecision='hold'; audit event appended
  → API: POST /dispatches/{dispatchId}/block {reason:'licence expiring 3 days'}
  → Component: EligibilityChip → 'hold'
  → UI: dispatch blocked; toast "Blocked + logged"
Resolution: dispatch held + logged. Max clicks: 3 ✓. Human confirms (P6).
```

### FLOW F5 — SLSI inspector → SLSI pack < 60s
```
Step 1: Click TopBar GenerateEvidencePackButton
  → Action: openOverlay('evidencePack') pre-scoped
  → State: uiState.openOverlay='evidencePack'; evidencePack.scope={period,current}
  → API: none yet
  → Component: EvidencePackBuilderModal
  → UI: builder opens pre-scoped to current period

Step 2: Select format tab "SLSI"
  → Action: setFormat + assembleContents
  → State: evidencePack.format='SLSI', contents[], completeness=0.998, gaps=['COA ML-2026-0337']
  → API: POST /evidence-packs/preview {scope,format:'SLSI'}
  → Component: PackContentsChecklist
  → UI: genealogy + HACCP + releases; 1 COA gap stamped

Step 3: Click Generate → Export
  → Action: A6
  → State: generationStatus 'generating'→'ready'; generatedPackId, outputUri
  → API: POST /evidence-packs {scope,format:'SLSI',asAt}
  → Component: pack ready
  → UI: hashed SLSI pack, downloadable — < 60s ✓
Resolution: hand/print SLSI pack. Max clicks: 3 ✓.
```

### FLOW F6 — CTO board demo: full value story in 5 clicks
```
Step 1: App opens on Dashboard (A1) → posture AT-RISK, duty Rs 5.41 bn
Step 2: Click Excise tile (A2) → DomainDrill → sticker-variance finding (✦ reasoning)
Step 3: Click finding (A3) → FindingSlideOver → evidence + required action (evidence at click 3 ✓)
Step 4: Click "Generate Evidence Pack — Excise" → EvidencePackBuilderModal pre-scoped
Step 5: Click Generate (A6) → hashed Excise pack in ~8s
Resolution: "red flag → regulator-ready proof in 5 clicks." Max clicks: 5 (full-story route).
AI touchpoints: PostureMeter weighting, finding AiReasoningBlock, pack completeness — all via AiReasoningBlock (violet ✦).
```

---

*End of Frontend & Data Architecture. Part 1 = full component tree (shell→leaf) + SHARED catalog with props/variants/emits. Part 2 = 11 store-agnostic state slices + transition map for all 6 flows. Part 3 = camelCase frontend entities (denormalized render fields, derived fields computed once, rt/session/static flags) + index maps. Part 4 = 10 primitive actions + worked interaction examples for all 6 flows with state/API/component/UI per step. `[VERIFY]` items (POS ~2,800, current duty rate, ~Rs 64.8 bn, SAP/LIMS maturity) remain discovery inputs before API contract lock.*
