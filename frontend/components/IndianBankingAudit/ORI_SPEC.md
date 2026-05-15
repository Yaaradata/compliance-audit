# ORI_SPEC — Operational Risk Intelligence (Indian banks)

**Role:** Single source of truth for multi-pass reframe of `IndianBankingAudit` → **ORI** (Operational Risk Intelligence). Re-read this file at the start of every subsequent build stage.

**Canonical mock (code):** `frontend/lib/IndianBankingAudit/mockIndianBankingAuditData.js`  
**Optional blueprint export (not imported by the app):** `frontend/lib/IndianBankingAudit/IndianBankingAuditPrototype.data.js` — parallel `mockData` snapshot for research / diff; keep in sync manually if you use it.

---

## 0. Governance — input document status

**Expected reframe specification:** `ORI_Reframe_Prompt_Pass6.md` (referenced throughout this file as *Pass6*).

**Repository status:** `ORI_Reframe_Prompt_Pass6.md` was **not found** under the workspace root or `ref-docs/` at the time this ORI_SPEC was authored. All **§-numbered** requirements below are **structural placeholders** aligned to the stage brief you supplied; any literal wording, exact screen codes, or field names that belong only in Pass6 must be **merged or replaced** when Pass6 is checked into the repo or pasted into an appendix here.

**Non-conflicting reference used for inventory:** `ref-docs/Indian Banking/UIPass6 - Mock Data Schema Validation.md` (Pass 5 / 42-dataset validation — *not* the ORI reframe doc).

---

## 1. Product identity (Pass6 §2.1 — ORI framing)

| Field | Value (ORI — **confirm against Pass6 §2.1**) |
|--------|-----------------------------------------------|
| **Product name** | **ORI** — *Operational Risk Intelligence* |
| **Full platform title** | ORI for Indian Private-Sector Banks *(working title; RBI / domestic ORM context)* |
| **Tagline** | *From control evidence to operational risk foresight — inspection-ready, board-clear, regulator-aligned.* |
| **Monogram** | **ORI** (tri‑letter mark; visual treatment: stable geometry, no playful glyphs; optional sub-mark **IN** for India-only deployment — **finalize in Pass6**). |
| **Footer / strapline text** | *(Removed from prototype sidebar — previously a wave‑1 / demo disclaimer line.)* |
| **Jurisdiction anchor** | India — RBI (incl. ORM / operational resilience guidance), PMLA 2002, FIU‑IND, sector master directions as already reflected in Pass 5 mock. |

---

## 2. Persona table (Pass6 §2.2)

Personas remain **three** primary operator modes; codes stay stable for routing unless Pass6 mandates a breaking rename of `code` fields (if so, migrate mock + `ScreenCode` together).

| `code` (stable key) | Label / title (ORI display — **confirm Pass6 §2.2**) | Default screen (`default_screen`) | Notes |
|---------------------|------------------------------------------------------|-----------------------------------|--------|
| `cro` | CRO / MD&CEO / BRMC Chair *(ORI: enterprise posture & resilience narrative)* | `riskPosture` | Board / macro posture; unchanged code. |
| `compliance` | CCO / Head of ORM / MLRO–PO / Head of FC / Head of IT Risk *(ORI: coverage, obligations, 2LoD)* | `obligationCoverage` | ORM is explicit in title today — keep. |
| `audit` | **VP‑ORM / Control Tester** *(ORI rename — was “IA Manager / Concurrent Auditor / Control Tester”)* | `populationTesting` | **Mandatory rename (this stage brief):** persona **`audit`** persists as internal `code`; UI copy and spec prose adopt **“VP‑ORM / Control Tester”**. If Pass6 introduces a new `code` (e.g. `orm`), plan a one-shot migration: mock `personas`, `navigationItems.persona_default_for`, `dataModel` types, `AppShell`, tests. |

---

## 3. Nav grouping — four ORI sections (Pass6 §2.4)

**Instruction:** Re-group **enabled** Wave‑1 navigation into **four** top-level sections, **in this order**, each listing **screen `code`s** as implemented in the shell (subset may be hidden per persona).

| # | ORI section (working name — **finalize labels in Pass6 §2.4**) | Screen codes (order within section) | Rationale |
|---|--------------------------------------------------------------|----------------------------------------|-----------|
| **1** | **Posture & horizon** | `riskPosture`, `whatChanged` | Enterprise risk posture + weekly delta; CRO-first. |
| **2** | **Coverage, lineage & obligations** | `obligationCoverage`, `controlUniverse`, `controlDrillDown`, `sourceLineage`, `processHealth` | Regulatory / control fabric + process reality + data lineage. |
| **3** | **Assurance, testing & evidence** | `populationTesting`, `evidenceWorkbench`, `workpaperAuditPackBuilder`, `inspectionReadiness`, `aiInsights` | 2LoD / 3LoD testing, evidence quality, packs, AI HITL. |
| **4** | **Issues, accountability & remediation** | `issueBoard`, `accountability` | Issues / MRAs / remediation + senior manager accountability ledger. |

**Deferred / partial nav (keep as-is until ORI pass maps them):** `reportingClocks` (nav item references `riskPosture` with empty `screens_inside`); Wave 2/3 disabled items remain **out of ORI section count** until enabled.

---

## 4. Seven new ORI screen codes & entity anchors (Pass6 §3.9)

**Until Pass6 is available:** use the table below as **implementation targets**; replace `code` strings if Pass6 defines different slugs. Each row: **`code`** · **working title** · **`anchor_entity`** (DetailDrawer / drill contract).

| # | `code` (proposed) | Working title | `anchor_entity` (primary) |
|---|-------------------|---------------|-----------------------------|
| ORI‑S‑01 | `oriLossLandscape` | ORI Loss & Near‑Miss Landscape | `LossEvent` |
| ORI‑S‑02 | `oriScenarioLibrary` | ORI Scenario & Stress Library | `ScenarioRun` |
| ORI‑S‑03 | `oriResiliencePosture` | ORI Operational Resilience Posture | `OperationalResilienceService` |
| ORI‑S‑04 | `oriVendorRiskHeat` | ORI Vendor / TPSP ORM Heatmap | `VendorORMProfile` |
| ORI‑S‑05 | `oriRegulatoryVelocity` | ORI Regulatory Change Velocity | `RegulatoryChangeItem` |
| ORI‑S‑06 | `oriCommitteeActions` | ORI BRC / ORMC Action Tracker | `ORMCommitteeAction` |
| ORI‑S‑07 | `oriExecutiveBrief` | ORI Executive Brief (board‑ready ORM) | `ORIBriefSnapshot` *(aggregate read model; may be virtual)* |

**Drawer / routing:** Extend `DrawerEntityType` and `DetailDrawer` routing map once entities exist; preserve existing 23‑type behaviour for legacy entities (per UIPass6 gap notes: e.g. complete `ExceptionDetailContent`, `SourceSystemDetailContent` when touching drawer).

---

## 5. Six new data entities — reference table (Pass6 §3.1–§3.7)

**Not full schemas.** PK + critical fields + link hints only. **Snake_case** in mock to match Pass 5 conventions.

| Entity (collection name) | Primary key | Critical fields (3–5) | Link relationships |
|--------------------------|-------------|-------------------------|----------------------|
| `loss_events` | `loss_event_id` | `event_date`, `gross_loss_inr`, `recovery_inr`, `business_line`, `basel_event_type` | → `risks` (optional `risk_id`), → `controls` / `processes` (attribution), → `senior_managers` (accountability) |
| `near_miss_events` | `near_miss_id` | `discovery_ts`, `severity_band`, `potential_loss_estimate_inr`, `status` | → `process_executions` / `processes`; optional → `loss_events` if promoted |
| `scenario_runs` | `scenario_run_id` | `run_date`, `scenario_family`, `severity_outcome`, `capital_or_earnings_impact_inr` | → many `risks`; → `controls`; optional → `audit_trail_events` |
| `operational_resilience_services` | `ors_id` | `service_name`, `criticality_tier`, `rto_hours`, `rpo_hours`, `last_drill_date` | → `processes`; → `controls`; optional → `obligations` (ICRA / resilience MDs) |
| `regulatory_change_items` | `reg_change_id` | `instrument_title`, `effective_date`, `impact_rating`, `status` | → `obligations`, → `controls`, → `risks` (impact graph) |
| `orm_committee_actions` | `orm_action_id` | `committee`, `decision_due_date`, `owner_senior_manager_id`, `status` | → `senior_managers`; → `issues`; → `decision_events` / `evidence_records` |

**Note:** If Pass6 collapses near‑miss into `loss_events` with a `type` discriminator, merge rows 1–2 and add a seventh entity only if §3.7 demands it.

---

## 6. Four new ORI metrics (Pass6 §4.x — acronyms fixed by this brief)

Add to `metrics[]` with `metric_id` keys below; wire `color_thresholds`, `used_by_screens`, and `formula` text per Pass6 when available.

| `metric_id` | Working title | Intent (dense — **replace formulas with Pass6**) |
|-------------|---------------|-----------------------------------------------------|
| **ORLR** | **Operational Risk Loss Readiness** | Completeness & timeliness of loss / near‑miss capture vs RBI ORM expectations; bridges **loss_events** + **near_miss_events** into posture views. |
| **INCV** | **Incident Coverage Velocity** | Speed and breadth of incident‑to‑control and incident‑to‑obligation linking (through **exceptions** / **issues** and new ORI entities). |
| **PACV** | **Predictive / AI Coverage of Material Processes** | Share of high‑materiality processes / controls with fresh AI insight + human adjudication (extends **AITES** / `ai_insights` universe). |
| **POAOR** | **Policy & Operating Procedure Alignment to ORM** | Degree to which documented procedures and board / ORMC minutes evidence align to RBI ORM / resilience **policy** expectations (may lean on `attestation_events`, `decision_events`, `audit_packs`). |

---

## 7. Do‑not‑change list (Pass6 §8 — plus prototype integrity)

**Unless Pass6 explicitly authorizes a breaking change:**

1. **Do not** rename or delete existing **mock primary keys** that UIPass6 calls out as storyline anchors (e.g. UCIC‑2024‑00123 / 00126 / 00127; AML‑ALRT‑2024‑00501 / 00502 / 00505; DL‑APP‑2024‑00881 / 00884 / 00885; VEND‑2024‑00205; issues ISS‑2026‑009 / 027 / 061 / 085; controls CTRL‑KYC‑001 … CTRL‑ITO‑001).
2. **Do not** break the nine FK paths validated in UIPass6 (notably: close `controlInstances.step_execution_id` gap rather than removing the path).
3. **Do not** remove **DetailDrawer** entity routing for existing types; only **extend** for new ORI anchors.
4. **Do not** change **`export const mockData`** outer shape without updating `dataModel.ts`, prototype data copy, and standalone bundle regeneration.
5. **Do not** strip **Indian regulatory flavour** strings (RBI AFI, PMLA Rule 9, FIU‑IND, CKYCR, etc.) from demo copy without Pass6 replacement text.
6. **Do not** collapse Wave‑1 vs Wave‑2/3 **disabled** nav items without an explicit ORI migration note (they anchor future scope).

---

## 8. Vocabulary purge table (Pass6 §5)

**Usage:** UI labels, nav labels, screen titles, tooltips, and spec prose. Internal `code` / API / JSON keys change **only** when a migration row says so.

| Legacy / prototype term | ORI‑preferred term | Scope | Migration note |
|-------------------------|-------------------|--------|------------------|
| IndianBankingAudit (product string) | **ORI** — Operational Risk Intelligence | App shell title, browser title, exports | Marketing string only; repo folder may stay for continuity. |
| Audit (persona display) | **VP‑ORM / Control Tester** | Persona switcher, docs | Keep internal `code`: `audit` until Pass6 mandates rename. |
| Compliance (persona) | **ORM & Compliance** *(optional)* | Display only | Only if Pass6 §5 requests disambiguation from statutory “compliance”. |
| Inspection Readiness / RBI Pack | **Supervisory readiness pack** *(optional)* | Nav / screen title | Keep RBI AFI specificity in subtitle. |
| Audit Pack | **Readiness pack** / **Supervisory pack** | Nav, drawer | Do not delete `audit_packs` collection name. |
| Audit Readiness Score (`ARS`) | **Supervisory readiness score** (keep `ARS` id) | Metrics strip | Formula unchanged unless Pass6 revises. |
| Internal Audit (where it implied 3LoD only) | **Independent assurance** | Copy | Clarifies ORM + assurance; does not remove IA use‑cases. |
| Testing & Evidence (nav) | **Assurance & evidence** | Nav label | Screen codes unchanged. |
| Risk Posture Cockpit | **Enterprise ORM posture** *(subtitle)* | Screen chrome | Keep `riskPosture` code. |
| AI Insights | **AI / predictive signals** | Nav | Keep `aiInsights` code and HITL model. |

Add rows from Pass6 §5 verbatim when the file is available.

---

## Appendix A — Current prototype inventory (baseline for deltas)

| Dimension | Count | Source |
|-----------|------:|--------|
| `navigationItems` | **15** | `mockIndianBankingAuditData.js` |
| `screens` | **14** | Same (`S-01`…`S-13`, `N-09`) |
| Top‑level mock datasets | **42** | UIPass6 validation doc |

**New to add (this ORI pass):** **7** screens (§4), **6** entity collections (§5), **4** metrics (§6), plus persona display rename and nav regrouping (§3).

---

*End ORI_SPEC — maintain version notes in git commit messages when Pass6 text is merged.*
