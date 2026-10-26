# Saurabh feedback status — UK Banking Audit v7

**Commit:** `23427a9c3f300f8ba981a1835db81ec668c6dfcb` (`23427a9 build completed`)  
**Scope:** v7 only (read-only audit). Live entry: `app/UKBankingAudit/page.tsx` → `/UKBankingAudit/v7`.  
**Scored IDs:** A1–A12 and B1–B13 (**25** checklist IDs). The brief said “22”; every ID below is scored anyway. Batch C is flag-only (not in the BUILT counts).

---

## 1. Headline counts (A + B)

| Status | Count |
| --- | ---: |
| **BUILT** | **24** |
| **PARTIAL** | **0** |
| **NOT BUILT** | **1** (B6) |

---

## 2. Batch A — 24 July meeting

### A1 | Status: BUILT
**Ask:** Ownership deleted as a lens  
**Evidence:** `frontend/components/UKBankingAudit/v7/DomainDrillPanel.tsx:32` — `DrillLens = "assurance" | "exposure" | "momentum" | "defensibility"` (no `ownership`). Lens labels at `:48–53`. `OwnershipLens.tsx` — no match found (file absent). No `OwnershipLens` imports under `components/UKBankingAudit/v7/`.

### A2 | Status: BUILT
**Ask:** Ownership moved to domain drill header line  
**Evidence:** `DomainDrillPanel.tsx:63–107` (`DomainOwnershipHeaderLine` with Owner / unallocated / `OwnerChip`); rendered at `:194` for every open domain.

### A3 | Status: BUILT
**Ask:** Two-tier lens grouping Strategic / Operational / Both  
**Evidence:** `DomainDrillPanel.tsx:33–46` (`DrillTier`, `TIER_OPTIONS`, `LENSES_BY_TIER`); tier `LensToggle` at `:181–186` above lens toggle `:187–192`.

### A4 | Status: BUILT
**Ask:** Momentum in Operational tier  
**Evidence:** `DomainDrillPanel.tsx:44` — `operational: ["assurance", "momentum", "defensibility"]`. Momentum still a first-class lens (`:32`, `:51`, `MomentumLens` import `:22`).

### A5 | Status: BUILT
**Ask:** “Board challenge” → “Regulatory Landscape”  
**Evidence:** `BoardSignalsStrip.tsx` — **no match found** (file deleted/renamed). Both headings in `RegulatoryLandscapePanel.tsx:96` and `:109` read **“Regulatory Landscape”**. Grep for `"Board challenge"` under v7 components — no match found (only README history).

### A6 | Status: BUILT
**Ask:** Path to Green removed from that panel; still elsewhere  
**Evidence:** `BoardSignalCard.tsx` — **no match found**. Successor `RegulatoryLandscapeCard.tsx:64` comment: “Path to Green lives elsewhere”; no `PathToGreenStrip` in that file.  
**Remaining `<PathToGreenStrip` JSX call sites in v7 (11):**  
`DomainDrillPanel.tsx:234`, `ExposureLens.tsx:287`, `KriBar.tsx:36`, `SignalInvestigationDrawer.tsx:114`, `mlro/FraudLossPanel.tsx:312`, `_shared.tsx:164`, `:1045`, `:1132`, `:1260`, `:1609`, `:1873`. Not removed globally.

### A7 | Status: BUILT
**Ask:** Two headings on every card  
**Evidence:** `RegulatoryLandscapeCard.tsx:162` — “Is this likely to happen to us?”; `:168` — “What reasonable steps are we taking?” (file renamed from BoardSignalCard).

### A8 | Status: BUILT
**Ask:** Muted RAG — red only where genuinely likely  
**Evidence:** `RegulatoryLandscapeCard.tsx:11–14` (`severityRailClass`: red only if `firmLikely`); `:34–43` (CONFIRMED ISSUE red only when `firmLikely`). `RegulatoryLandscapePanel.tsx:64–65` — at most one card: highest S1 → `firmLikelyId`.  
**Note:** Tone is slate by default; red reserved for the single firm-likely hit — matches the ask.

### A9 | Status: BUILT
**Ask:** Regulatory Landscape filtered to selected domain  
**Evidence:** `CROBoardViewV7.tsx:24` `expandedId`; passed to `RegulatoryLandscapePanel` at `:69–72` (not BoardSignalsStrip). Filter at `RegulatoryLandscapePanel.tsx:57–60`.

### A10 | Status: BUILT
**Ask:** MLRO persona → “Head of Financial Crime”  
**Evidence:** `lib/ukbankingaudit/mockDataV7.ts:29` — `label: "Head of Financial Crime (SMF17)"` for `smf17`.  
**Note:** Router id remains `smf17` / screen `mlroWorkspace`.

### A11 | Status: BUILT
**Ask:** Exit candidates tagged by division + filter  
**Evidence:** `lib/ukbankingaudit/v7/exposureTypes.ts:29–34` (`division` on `ExitCandidateCluster`). All 24 exit clusters tagged (no missing `division`). Filter UI: `ExposureLens.tsx:295–336`.

### A12 | Status: BUILT
**Ask:** Drop legacy-pre-2022-kyc in v7; keep in v6  
**Evidence:** v7 — no `id: "legacy-pre-2022-kyc"` (comment only at `exposureData.ts:116`). v6 — present at `lib/ukbankingaudit/v6/exposureData.ts:148`.

---

## 3. Batch B — Risk_CX_feedback spreadsheet

### B1 | Status: BUILT
**Ask:** “Operational Assurance” → “Operational Dashboard”  
**Evidence:** `lib/ukbankingaudit/v7/mlroOperationalData.ts:218` — `{ id: "assurance", label: "Operational Dashboard" }`. Wired in `MLROWorkspaceV7.tsx:82`.

### B2 | Status: BUILT
**Ask:** “Inherent Exposure” → “Client Risk View”  
**Evidence:** `mlroOperationalData.ts:219` — `{ id: "exposure", label: "Client Risk View" }`.

### B3 | Status: BUILT
**Ask:** Fraud not a third tab; nested into remaining tabs  
**Evidence:** `MLRO_DASHBOARD_LENSES` length **2** (`:217–219`). Exact labels: **Operational Dashboard**, **Client Risk View**. Fraud is a widget on Operational Dashboard (`MLROWorkspaceV7.tsx:126–128`), not a tab.  
**Note:** Fraud renders on Operational Dashboard only; Client Risk View hosts `ExposureLens`, not FraudLossPanel.

### B4 | Status: BUILT
**Ask:** Widget 1 — KYC/EDD past due vs appetite  
**Evidence:** `EDDPipelineStatus` at `_shared.tsx:1141+`. Appetite: `EDD_PAST_DUE_APPETITE` (`mlroOperationalData.ts:26–28`, appetite **5**, redThreshold **15**). Band logic `eddPastDueBand` `:37–39` — green / amber / **red** (not the v6 dual-amber trap). Source on card: `_shared.tsx:1239` via `appetiteCfg.sourceLabel` (“KYC System · EDD case register”). Path to Green: `_shared.tsx:1258–1261` when amber/red.

### B5 | Status: BUILT
**Ask:** Widget 2a — L1/L2/L3 backlogs vs appetite  
**Evidence:** `ALERT_TIER_APPETITES` `mlroOperationalData.ts:62–87` — appetites **120 / 280 / 40**. This-week programme backlog **2565**; tier split **385 / 1796 / 384** (sum = 2565) via `buildAmlAlertTiersByWeek`. Rendered in `AlertBacklogVsAppetite` (`_shared.tsx` + `MLROWorkspaceV7.tsx:109`).

### B6 | Status: NOT BUILT
**Ask:** Widget 2b — TM tuning / false-positive metric  
**Evidence:** No Operational Dashboard widget for tuning/calibration/FP rate. Grep hits are dormant (`SuppressionLedger.tsx`, `DispositionDispersion` reasonCodes in `mlroSignals.ts`) — not mounted on `MLROWorkspaceV7`.  
**Note:** Matches expected “research / not built” outcome in README open item (a).

### B7 | Status: BUILT
**Ask:** Widget 2c — TM outages, last month and last 3 months  
**Evidence:** `SYSTEM_HEALTH_WINDOWS` `mlroOperationalData.ts:265–278` (`last_month`, `last_3_months`). `TM_SYSTEM_HEALTH` `:317–359` — **2** outages. Nested under Alert widget as “TM system health” (`_shared.tsx:1033–1040`).

### B8 | Status: BUILT
**Ask:** Widget 2d — TM alerts → SAR count and %  
**Evidence:** **Defined** `lib/ukbankingaudit/v7/exposureData.ts:101–112` (`TM_INVESTIGATIONS_SAR_CONVERSION`, pct **3.2**, status **`INFO`**). **Renders** inside `AlertBacklogVsAppetite` (`_shared.tsx:806`, `:1002`). No appetite — informational only.

### B9 | Status: BUILT
**Ask:** Widget 3 — SAR within statutory window + Path to Green  
**Evidence:** `SARTimelinessBand` `_shared.tsx:1054+`. This-week `pctOnTime` **59.4%** (`mockDataV2` `sarFilingsByWeek` weekIndex 0). Path to Green: `_shared.tsx:1130–1133` when last band amber/red.

### B10 | Status: BUILT
**Ask:** Widget 4 — six sanctions sub-metrics  

| Sub | Status | Evidence |
| --- | --- | --- |
| (i) OFSI freeze BREACH count | BUILT | `OFSI_FREEZE_REPORTS_V7` `mlroOperationalData.ts:530–551`, `breachCount: 1`; UI `_shared.tsx:1277+` |
| (ii) OFSI BLOCK (not OFAC as UK) | BUILT | `OFSI_BLOCK_REPORTS_V7` `:554–569`; separate `OFAC_US_BLOCKING_REPORTS_V7` `:572–580` labelled US · OFAC |
| (iii) List update lag | BUILT | `SANCTIONS_LIST_UPDATES_V7` `:583+` (`lagHours` vs `appetiteHours`) |
| (iv) Payments hold + appetite | BUILT | `buildSanctionsHoldTime` `:626–636` (appetiteHours **2**, red **8**) |
| (v) Txn screening DQ/outages | BUILT | `TXN_SCREENING_SYSTEM_HEALTH` `:362–397`; UI `_shared.tsx:1442` |
| (vi) Name screening separate | BUILT | `NAME_SCREENING_SYSTEM_HEALTH` `:400+`; UI `_shared.tsx:1443` — separate `SystemHealthBlock` |

### B11 | Status: BUILT
**Ask:** Fraud expandable; not its own tab  
**Evidence:** `FraudLossPanel.tsx:76+` — `useState` expand (`open`), collapse control `:96–108`. Renders inside Operational Dashboard (`MLROWorkspaceV7.tsx:126–128`), not a third tab.

### B12 | Status: BUILT
**Ask:** Training % trained and % overdue (+ high-risk)  
**Evidence:** `FC_TRAINING_POSTURE` `mlroOperationalData.ts:739–760` — trainedPct **98.4**, overduePct **1.6**, `highRisk` / `otherRoles` split. Widget `FinancialCrimeTrainingPosture` `_shared.tsx:1622+`.

### B13 | Status: BUILT
**Ask:** Path to Green if Amber or Red on all six widgets  

| Widget | PathToGreenStrip wired? | Evidence |
| --- | --- | --- |
| 1 EDD | Yes (amber/red) | `_shared.tsx:1258–1261` |
| 2 Alert backlog (incl. nested TM health PTG inside SystemHealthBlock) | Yes (amber/red) | `_shared.tsx:1043–1046`; nested `:164` |
| 3 SAR | Yes (amber/red) | `_shared.tsx:1130–1133` |
| 4 Sanctions | Yes (amber/red) | `_shared.tsx:1607–1610` |
| 5 Fraud | Yes when AMBER | `FraudLossPanel.tsx:82`, `:310–312` (fraud status model is AMBER\|GREEN only) |
| 6 Training | Yes (amber/red) | `_shared.tsx:1871–1874` |

---

## 4. Batch C — flags (not scored as feedback)

### C1 | EDD number consistency
| Surface | Value | Source |
| --- | ---: | --- |
| KRI strip `KRI-FC-017` | **11** | Shared `mockDataV2` kris (`current: 11`) |
| EDD widget past due | **5** | Count of `eddPipelineItems` with `status === "past_due"` |

**They differ.** Two sources for one metric on one screen (documented as open item in `lib/ukbankingaudit/v7/README.md`).

### C2 | Dormant `v7/mlro/` components

| Component | File exists | Exported from `mlro/index.ts` | Imported by any screen |
| --- | --- | --- | --- |
| SuppressionLedger | Yes | Yes (`index.ts:1`) | **No** |
| DispositionDispersion | Yes | Yes (`:2`) | **No** |
| ScreeningDenominator | Yes | Yes (`:3`) | **No** |
| CadenceFeasibility | Yes | Yes (`:4`) | **No** |
| OperationalAssuranceVerdict | Yes | **No** (not in `index.ts`) | **No** |

All five are built but render nowhere on the live workspace.

### C3 | noOutbound test SCAN_DIRS
**Evidence:** `lib/ukbankingaudit/v7/noOutbound.test.ts:19–21` points at:
- `components/UKBankingAudit/v7`
- `lib/ukbankingaudit/v7`  

**Not** v6. Guardrail is testing v7.

### C4 | Live version
- `frontend/app/UKBankingAudit/page.tsx` → `redirect("/UKBankingAudit/v7")`
- Version folders under `frontend/components/UKBankingAudit/`: **v3, v4, v5, v6, v7** (plus shared `UKBankingControlTrace.tsx`, `ukTraceRuntime.ts`, `dataModel.ts`, `index.ts`)
- App routes under `frontend/app/UKBankingAudit/`: **v1–v7**

---

## 5. Contradictions / surprises vs the brief’s expected paths

1. **`BoardSignalsStrip.tsx` / `BoardSignalCard.tsx` are gone** — renamed to `RegulatoryLandscapePanel` / `RegulatoryLandscapeCard`. Checks that named the old files still pass on the successors; do not look for the old filenames.
2. **B6 is the only clear NOT BUILT** among the scored asks — TM tuning/FP as a live widget remains research/dormant (`SuppressionLedger` etc.).
3. **EDD 11 vs 5 (C1)** is still live on one dashboard — not fixed; correctly left as an open item.
4. **`OperationalAssuranceVerdict` is not even re-exported from `mlro/index.ts`**, unlike the other four dormant components (README slightly overstates “exported from index”).
5. **Climate Momentum “77-day”** was not part of this checklist; current `daysToBreach` for climate is AS_OF-relative (previously measured **61**, still `PROJECTED_BREACH_RED`) — flag only if the advisor still cites 77 as a fixed demo number.
6. **Fraud Path to Green** uses an AMBER-only status model (no RED band on that card) — still wires PTG when amber; not a global PTG removal.
7. **OFAC-as-UK defect is fixed in v7** — UK block is `OFSI_BLOCK_REPORTS_V7`; OFAC is a separate US line.
