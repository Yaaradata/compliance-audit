# UX Blueprint — IndianBankingAudit Pass 4

*Pass 4 — Prototype-ready UX Blueprint for an AI-Driven Risk, Compliance & Audit Platform — Mid-Sized Indian Private Sector Bank*
*Authored by: Senior Product Designer | Enterprise BFSI UX Architect | Indian Banking Audit Product Strategist | Cut-off: April 2026*

> This document converts the personas (UI Pass 1), the data correlation and lineage logic (UI Pass 2), and the system capabilities + data model (UI Pass 3) into a UX blueprint that a frontend team can prototype against. **No JSX. No frontend code. No mock data.** Just the screens, the navigation, the persona hierarchy, the layouts, the components, the drill-downs, the AI behaviour, and the entity bindings — usable as the spec for the next pass.

---

## 1. MVP Screen List

### 1.1 Screens in scope for Wave 1 MVP

| # | Screen | Primary persona | Persona question answered | Anchor entity | Why it is needed in MVP | Include / Defer |
|---|---|---|---|---|---|---|
| **S-01** | **Executive Risk Posture Cockpit** | PERSONA-001 | Q-CRO-01 *Where am I outside risk appetite today?*; Q-CRO-05 *What is the current residual risk position?* | `Risk` (aggregate by domain) | The CRO/MD&CEO landing screen. Without it the demo cannot start. | **MVP P0** |
| **S-02** | **What Changed This Week** *(Cockpit secondary view; promotable to its own screen)* | PERSONA-001 | Q-CRO-02 *Which control failures are trending toward an RBI finding?*; Q-CRO-04 *Which processes are operating outside designed parameters?* | `Issue`, `ControlInstance`, `AIInsight` (delta over rolling window) | Allows the CRO to skip everything that is unchanged and focus on movement. | **MVP P0** |
| **S-03** | **Inspection Readiness / RBI Pack View** | PERSONA-001, PERSONA-002 | Q-CRO-10 *If RBI walked in tomorrow, what would they see?*; Q-CCO-09 *Which AFI MRA / RMP / MAP items are at risk of slippage?* | `AuditPack` per inspection lens (RBI AFI / RBS-SPARC / FIU / CSITE / Statutory / Concurrent / IA / Board) | This is the single screen most demoable to an Indian bank stakeholder. | **MVP P0** |
| **S-04** | **Obligation Coverage Map** | PERSONA-002 | Q-CCO-01 *Which RBI obligations are weakly covered?*; Q-CCO-04 *Which regulatory areas lack fresh, verifiable evidence?* | `Obligation` × `Control` `:COVERS` matrix | The CCO's primary working surface. | **MVP P0** |
| **S-05** | **Control Universe** | PERSONA-002, PERSONA-003 | Q-CCO-03 *Which controls are degraded, failing, or evidence-thin?*; Q-IA-01 *Which controls can be population-tested?* | `Control` (RCM-derived) | The structured RCM browser; replaces the spreadsheet. | **MVP P0** |
| **S-06** | **Control Drill-Down** | PERSONA-002, PERSONA-003 | Q-CCO-03 (deep); Q-IA-02 *Where are the exceptions in this cycle?*; Q-CRO-02 (deep) | `Control` + its `ControlInstance` population, `EvidenceRecord` set, linked `Issue`s | The single most-used screen in the product. Hosts CES breakdown + outcome split. | **MVP P0** |
| **S-07** | **Process Health / Process Execution View** | PERSONA-002, **Operations / Process Owner** | Q-CCO-03 (process root cause); Operations: *Which queues are breaching SLA?* | `Process`, `ProcessExecution`, `StepExecution` | Shows process variant drift and BPO / branch handoff issues. | **MVP P1** |
| **S-08** | **Evidence Workbench** | PERSONA-003 | Q-IA-03 *Which evidence records are missing, stale, or unverifiable?* | `EvidenceRecord`, `SourceRecord`, `CorrelationRecord` | The auditor's daily workspace. | **MVP P0** |
| **S-09** | **Population Testing / Reperformance Console** | PERSONA-003 | Q-IA-01 *Which controls can be population-tested rather than sampled?*; Q-IA-04 *Can this be packaged as an RBI-ready workpaper?* | `Control`, `PopulationTestSpecification`, `TestExecution`, `Exception` | The single feature that differentiates this product from legacy GRC. | **MVP P0** |
| **S-10** | **Issue & Remediation Board** | All three personas | Q-CRO-02; Q-CCO-09; Q-IA-05 *Which issues from prior cycles are still open and ageing?* | `Issue`, `RemediationAction`, `RootCauseCluster` | Shared workspace; populated by control failures and AI signals. | **MVP P0** |
| **S-11** | **AI Insights Review Queue** | PERSONA-002 (primary); PERSONA-003 (review) | Q-CCO across all (signal-driven discovery) | `AIInsight`, `Model`, `ModelRiskRecord` | Where AI proposes; humans dispose. The HITL gate for OUT-010. | **MVP P0** |
| **S-12** | **Senior Accountability Ledger** | PERSONA-001 | Q-CRO-03 *Which senior management accountability areas have evidence gaps?* | `SeniorManager`, `DecisionEvent`, `AttestationEvent`, `CommitteeRecord` | Reasonable-steps file; satisfies OUT-005. Looks like an accountability cockpit, not an org chart. | **MVP P1** |
| **S-13** | **Workpaper / AuditPack Builder** | PERSONA-003 | Q-IA-04 *Can this test result be packaged as an RBI inspection-ready workpaper?* | `TestExecution`, `Workpaper`, `AuditPack` | The output of the auditor's flow; closes Section 9 of UI Pass 3. | **MVP P0** |
| **D-01** | **Source Lineage / Evidence Chain Drawer** *(drawer / overlay; not a standalone page)* | All three personas | Final-step drilldown — *show me the source row* | `SourceRecord`, `CorrelationRecord`, `EvidenceRecord` | Universal drawer attached to every metric. | **MVP P0** |

### 1.2 Inactive / Roadmap items shown in navigation (Wave 2 / Wave 3)

| # | Screen | Wave | Why deferred | Visible as |
|---|---|---|---|---|
| W-01 | UPI Fraud View | Wave 2 | Requires NPCI feed integration | Inactive nav item with "Wave 2 — NPCI / UPI integration" tooltip |
| W-02 | ITGRCA / Cyber View | Wave 2 | Requires ITSM + SIEM + CERT-In integration | Inactive nav item |
| W-03 | Reporting Clock View *(STR / FMR / RFA / CSITE / CIMS / CRILC)* | Wave 2 | Requires FIU-IND outbound + CIMS + CRILC integration | Partial in Cockpit (P1); full screen Wave 2 |
| W-04 | Vendor / TPSP View | Wave 3 | Requires VMO / GRC integration | Inactive nav item |
| W-05 | Complaints / Internal Ombudsman View | Wave 3 | Requires CMS + IO workflow | Inactive nav item |
| W-06 | Telephony / Mis-selling Conduct View | Wave 3 | Requires Telephony / ASR | Inactive nav item |
| W-07 | Regulatory Change Inbox | Wave 3 | Built on AI-003 + Regulation node maturity | Inactive nav item |

### 1.3 Counts

- **Real screens P0:** 10 (S-01 through S-06, S-08, S-09, S-10, S-11, S-13).
- **Real screens P1:** 2 (S-07, S-12).
- **Drawers / overlays:** 1 (D-01) — universal Evidence Chain Drawer attached to every screen.
- **Inactive roadmap items in navigation:** 7.

---

## 2. Navigation Model

### 2.1 Primary Navigation (left rail, persistent)

| # | Nav item | Purpose | Default persona | Screens inside | Entity anchor | MVP priority |
|---|---|---|---|---|---|---|
| N-01 | **Risk Posture** | Enterprise residual risk + week-over-week change | PERSONA-001 | S-01 Executive Risk Posture Cockpit; S-02 What Changed This Week | `Risk`, `Issue`, `ControlInstance` | **MVP P0** |
| N-02 | **Inspection Packs** | Live readiness for RBI AFI / RBS-SPARC / FIU / CSITE / Concurrent / Statutory / Board | PERSONA-001, PERSONA-002 | S-03 Inspection Readiness / RBI Pack View | `AuditPack` | **MVP P0** |
| N-03 | **Obligations & Controls** | Coverage Map + Control Universe + Control Drill-Down | PERSONA-002 | S-04 Obligation Coverage Map; S-05 Control Universe; S-06 Control Drill-Down | `Obligation`, `Control` | **MVP P0** |
| N-04 | **Processes** | Process health + drift + step execution | PERSONA-002, Operations | S-07 Process Health View | `Process`, `ProcessExecution` | **MVP P1** |
| N-05 | **Testing & Evidence** | Population testing + evidence workbench + workpapers + audit packs | PERSONA-003 | S-08 Evidence Workbench; S-09 Population Testing Console; S-13 Workpaper / AuditPack Builder | `TestExecution`, `EvidenceRecord`, `Workpaper`, `AuditPack` | **MVP P0** |
| N-06 | **Issues & Remediation** | All open issues, root-cause clusters, retest status | All personas | S-10 Issue & Remediation Board | `Issue`, `RemediationAction` | **MVP P0** |
| N-07 | **AI Insights** | HITL queue, model registry visibility, accept / reject / escalate | PERSONA-002 | S-11 AI Insights Review Queue | `AIInsight`, `Model` | **MVP P0** |
| N-08 | **Accountability** | Senior-manager ledger, decisions, attestations, committee records | PERSONA-001 | S-12 Senior Accountability Ledger | `SeniorManager`, `DecisionEvent`, `AttestationEvent` | **MVP P1** |
| N-09 | **Source Lineage** | Source-system health, ingestion status, orphan queue, schema versions, correlation quality | PERSONA-002 | (Page-level extension of D-01 drawer) | `SourceSystem`, `SourceRecord`, `CorrelationRecord`, `OrphanQueueItem` | **MVP P0** |
| N-10 | **Reporting Clocks** | STR / CTR / FMR / RFA / CSITE / CERT-In / CIMS / CRILC submission status (Wave 2 full) | PERSONA-002 | (partial in S-01 Cockpit; Wave 2 full screen) | `ReportingClock`, `ReportingSubmission` | **MVP P1 partial; Wave 2 full** |
| N-11 *(inactive)* | **UPI Fraud** | Wave 2 placeholder | — | W-01 | — | Wave 2 |
| N-12 *(inactive)* | **IT Risk / Cyber** | Wave 2 placeholder | — | W-02 | — | Wave 2 |
| N-13 *(inactive)* | **Vendor / TPSP** | Wave 3 placeholder | — | W-04 | — | Wave 3 |
| N-14 *(inactive)* | **Complaints** | Wave 3 placeholder | — | W-05 | — | Wave 3 |
| N-15 *(inactive)* | **Regulatory Change Inbox** | Wave 3 placeholder | — | W-07 | — | Wave 3 |

### 2.2 Global Top Bar

| Element | Behaviour | Notes |
|---|---|---|
| **Bank context** *(top-left)* | Static label "Mid-sized Private Bank — India" with archetype tag (`MSPB`) | Future: multi-entity / archetype switcher |
| **Persona switcher** *(top-left, next to bank context)* | Switch between PERSONA-001 / PERSONA-002 / PERSONA-003 / Operations | Demo-grade switcher; in production this is RBAC-driven, not user-selectable |
| **Time-period selector** *(top-centre)* | "As of": Today / Last 7 days / This month / Last quarter / Custom | Drives every metric on every screen via `valid_time` / `system_time` (Pass 3 §12); selecting a past date enables time-travel mode |
| **Process filter** *(top-centre)* | Multi-select: KYC / Lending / AML / UPI / Complaints / Vendor / IT Ops | Default: all on |
| **Risk domain filter** *(top-centre)* | Multi-select: `R-CR / R-OP / R-CO / R-CD / R-TC / R-FC / R-TP / R-FR / R-MR` | Default: all on |
| **Source-system health indicator** *(top-right)* | Aggregate badge over Wave-1 source systems (CBS, LOS, AML engine, Sanctions, Case Mgmt, CKYCR); colour-coded; click → Source Lineage page (N-09) | Drives the *self-honesty* of every metric per Pass 3 P-08 |
| **Inspection readiness indicator** *(top-right)* | Aggregate ARS rendered as badge; click → S-03 Inspection Readiness View | Single-glance answer to Q-CRO-10 |
| **Evidence freshness indicator** *(top-right)* | Aggregate EIFS as badge; click → S-08 Evidence Workbench filtered to stale evidence | Single-glance answer to Q-CCO-04 |
| **AI review queue indicator** *(top-right)* | Count of `AIInsight` rows with `human_approval_status = pending`; click → S-11 AI Insights Review Queue | Avoids missed signals |
| **User identity / sign-out** *(top-right)* | Standard | — |

### 2.3 Navigation Behaviour Rules

- **Persistent left rail** with 9 active nav items + 5 inactive (Wave 2 / Wave 3) shown greyed with "Wave N" tag and tooltip explaining missing source-system integration.
- **No breadcrumb at the top** — the breadcrumb is contextual inside the **Drill-Down Breadcrumb component** (see §5) at the top of each detail screen.
- **No consumer-style top tabs.** This is enterprise audit; left-rail navigation is the standard.
- **Top-bar filters apply globally** to every screen until cleared; screens may extend the filter set with screen-specific filters.

---

## 3. Persona Screen Hierarchy

### 3.1 Persona Hierarchy Table

| Persona | Landing screen | Secondary screens | Frequent actions | Primary metrics | Main drill-down path |
|---|---|---|---|---|---|
| **PERSONA-001** CRO / MD&CEO / BRMC Chair | **S-01 Executive Risk Posture Cockpit** | S-02 What Changed This Week; S-03 Inspection Readiness; S-12 Senior Accountability Ledger; S-10 Issue & Remediation Board | Drill from Red domain tile to failing controls; review week-over-week change; open Inspection Pack readiness; sign / review attestations; escalate aged issues to Board | RES (by domain); ARS (overall); CES (aggregate); SAES; RTS (top-line clocks) | RES domain → Failing Controls → Failed ControlInstances → Evidence Chain → SourceRecord → linked Issue / Remediation |
| **PERSONA-002** CCO / Head of ORM / MLRO–PO / Head of FC / Head of IT Risk | **S-04 Obligation Coverage Map** | S-05 Control Universe; S-06 Control Drill-Down; S-11 AI Insights Review Queue; S-08 Evidence Workbench; N-10 Reporting Clocks (partial); N-09 Source Lineage; S-03 Inspection Readiness | Triage AI insight queue; drill from weak obligation to controls and evidence; track reporting clocks; certify CIMS / period attestations; raise / escalate issues | OCS; CES (per control); EIFS; RTS; DCQS; AITES | Obligation → Coverage Strength → Linked Controls → Control Effectiveness → Evidence Freshness → Action |
| **PERSONA-003** Compliance Officer / IA Manager / Concurrent Auditor / Control Tester | **S-09 Population Testing / Reperformance Console** | S-08 Evidence Workbench; S-06 Control Drill-Down; S-13 Workpaper / AuditPack Builder; S-10 Issue & Remediation Board | Run population test; review exception set; fetch / verify evidence; draft workpaper; assemble audit pack; raise / re-test issues | CES (per control under test); EIFS; DCQS; PVDS; OCS | Control → Population Query → Tested Population → Exception Set → Evidence Records → Workpaper → AuditPack |
| **Supporting** Operations / Process Owner | **S-07 Process Health View** | S-10 Issue & Remediation Board; S-08 Evidence Workbench; D-01 Source Lineage Drawer | Review SLA breaches; investigate process drift; track BPO / branch / system handoff failures; close in-flight exceptions | PVDS; CES (controls they own); in-flight exception ageing; queue SLA gauges | Process → ProcessExecution → StepExecution → ControlInstance → Exception |

### 3.2 Persona-screen access matrix

| Screen / Drawer | PERSONA-001 | PERSONA-002 | PERSONA-003 | Operations |
|---|---|---|---|---|
| S-01 Cockpit | **Landing** | View | View | View |
| S-02 What Changed This Week | View | View | View | — |
| S-03 Inspection Readiness | View + sign | View + assemble | View + assemble | — |
| S-04 Obligation Coverage Map | View | **Landing** | View | — |
| S-05 Control Universe | View | View | View | View (own controls) |
| S-06 Control Drill-Down | View | View | View | View (own controls) |
| S-07 Process Health | View | View | View | **Landing** |
| S-08 Evidence Workbench | View | View | **Heavy use** | View |
| S-09 Population Testing Console | View | View | **Landing** | — |
| S-10 Issue & Remediation Board | View + escalate | View + own | View + raise | View + remediate |
| S-11 AI Insights Review Queue | View | **Heavy use; HITL gate** | View | — |
| S-12 Senior Accountability Ledger | **Heavy use; sign** | View | View | — |
| S-13 Workpaper / AuditPack Builder | View | View + sign | **Heavy use** | — |
| D-01 Source Lineage Drawer | Used everywhere | Used everywhere | Used everywhere | Used everywhere |

---

## 4. Screen-by-Screen Layout Blueprint

The layouts below describe *zones*, *cards*, *panels*, and *tables* — never visual / colour / pixel detail. Components used are listed in §5.

### 4.1 S-01 Executive Risk Posture Cockpit

| Attribute | Specification |
|---|---|
| Primary persona | PERSONA-001 |
| Persona question answered | Q-CRO-01, Q-CRO-05, Q-CRO-04, Q-CRO-09 |
| Anchor entity | `Risk` aggregated by domain (`R-CR / R-OP / R-CO / R-CD / R-TC / R-FC / R-TP / R-FR / R-MR`) |
| Default filters | Today; all 9 risk domains; all 7 processes |
| Primary KPIs | RES per domain (9 tiles); ARS (overall); CES (aggregate, weighted); top-3 clocks RTS; SAES; AITES — only the 5 that PERSONA-001 *acts* on |
| Main layout zones | Header → Risk Domain Heatmap → "What Changed This Week" strip → Top-5 Issues Watchlist → Inspection Readiness Snapshot → Senior Accountability Snapshot |
| Required cards / tables / panels | Risk Domain Heatmap (9 domains × inherent / residual / trend); Issue Watchlist Table (top-5 by `severity × ageing × rbi_mra_flag`); Reporting Clock Strip (CTR / STR / CSITE / FMR / CIMS at-risk only); Inspection Readiness Snapshot (ARS by lens); Accountability Snapshot (SeniorManager × open Issue count) |
| Drill-down actions | Click any domain tile → opens **S-06 Control Drill-Down** filtered to that domain's failing controls; click any Issue → opens that Issue card in **S-10**; click ARS → opens **S-03 Inspection Readiness**; click any SeniorManager → opens **S-12** for that manager |
| Empty states | If no data in window → "Source-system catch-up in progress" + show last successful as-of date; never blank |
| Alert states | Red domain tile pulses if RES newly crossed appetite threshold; CSITE / CERT-In / STR clock at-risk badge highlights with countdown |
| AI involvement | AI-018 *Effectiveness Decay* signals shown as small AI icons on degrading domain tiles; click → drawer with rationale + cited evidence |
| Evidence requirement | Every tile / card must drill to evidence in 2 clicks (P-20) |
| Source-system dependency | CBS, LOS, AML engine, Sanctions, Case Mgmt, CKYCR — all Wave 1 |

#### Layout Structure

- **Header:** Persona context ("CRO View"), time-period selector, process filter, risk-domain filter; right-side global indicators per §2.2.
- **Zone A — Risk Domain Heatmap (top half, full width):** 9 tiles in a 3×3 grid; each tile shows domain code (`R-FC` etc.), inherent rating chip, residual rating chip, RES score, week-over-week trend arrow, and tiny issue-count badge.
- **Zone B — What Changed This Week (horizontal strip below heatmap):** 4–6 cards each describing one material change ("CTRL-AML-002 CES dropped from 78 → 65"; "ISS-2026-085 raised on CTRL-LND-002 with 11,118 instances"; "AI-016 fired on DBT cohort"). Click → S-02.
- **Zone C — Issue Watchlist (left bottom):** ranked table; columns: Issue ID, title, linked CTRL, linked OBL, severity, ageing days, RBI MRA flag, owner (SM), action.
- **Zone D — Inspection Readiness Snapshot (right top of bottom row):** small cards per inspection lens (RBI AFI, RBS-SPARC, FIU, CSITE, Statutory, Concurrent, IA, Board) with ARS as ring; click any → S-03 with that lens pre-selected.
- **Zone E — Senior Accountability Snapshot (right bottom of bottom row):** SeniorManager × open Issue × overdue Attestation; click any → S-12 for that SM.
- **Action bar (bottom):** "Open Inspection Pack" / "Review Attestation Queue" / "Open Issue Watchlist".
- **AI insight panel:** small floating panel at bottom-right showing high-confidence AIInsights touching this week; max 3 cards.

### 4.2 S-02 What Changed This Week

| Attribute | Specification |
|---|---|
| Primary persona | PERSONA-001; secondary PERSONA-002 |
| Persona question answered | Q-CRO-02 (proximity to RBI risk); Q-CRO-04 (process variant drift) |
| Anchor entity | Delta of `Issue`, `ControlInstance`, `AIInsight`, `KRIObservation`, `AppetiteObservation` over rolling window |
| Default filters | Last 7 days; all domains; all processes |
| Primary KPIs | New Issues; CES movements (top-10 deltas); Newly-fired Critical AIInsights; KRI band changes; Reporting clock breaches |
| Main layout zones | Header → Five-column delta board (New Issues / CES Movements / AI Insights / KRI Band Changes / Reporting Breaches) → Bottom narrative panel |
| Required cards / tables / panels | Delta cards (one per change); Trend sparklines; Linked entities chips |
| Drill-down actions | Click any change → relevant detail screen (S-06 / S-10 / S-11) |
| Empty states | "No material change this week — last AFI MRA closure: …" |
| Alert states | New PMLA / FIU / CSITE / CERT-In risk shown as red banners |
| AI involvement | Each change can have an AI-018 / AI-002 / AI-013 explanation; show as expandable note |
| Evidence requirement | Each change must cite ≥1 EvidenceRecord |
| Source-system dependency | Wave 1 |

#### Layout Structure

- **Header:** time selector locked to "Last 7 days" by default but adjustable.
- **Zone A — Five-column delta board:** each column is a category; cards stack vertically.
- **Zone B — Narrative panel:** auto-drafted weekly summary in plain English, citing each delta.
- **AI insight panel:** integrated as note overlay on each delta card.

### 4.3 S-03 Inspection Readiness / RBI Pack View

| Attribute | Specification |
|---|---|
| Primary persona | PERSONA-001, PERSONA-002 |
| Persona question answered | Q-CRO-10, Q-CCO-09 |
| Anchor entity | `AuditPack` per inspection lens |
| Default filters | All inspection lenses; current period |
| Primary KPIs | ARS per lens; ARS aggregate; Missing-evidence count; Stale-evidence count; Open MRA / RMP / MAP count; Unclosed remediation; Missing attestation; Failed / not-run population tests |
| Main layout zones | Header → Lens selector tabs (RBI AFI / RBS-SPARC / FIU / CSITE / Statutory / Concurrent / IA / Board) → Readiness ring per lens → Gap list → Action bar |
| Required cards / tables / panels | Readiness Ring per lens; Gap Table (gap type × count × owner × ETA); Pack Composition Tree (Obligations → Controls → Evidence); Export Status Card |
| Drill-down actions | Click any gap → take user to the screen that resolves it (Evidence Workbench, Population Testing Console, Attestation page) |
| Empty states | If a lens has no gaps → green "Ready for inspection — last refresh: …" |
| Alert states | If ARS < 70 → red banner "Inspection at risk for this lens" |
| AI involvement | AI gap-finder (Tier 3 capability) suggests fix actions; PERSONA-002 reviews |
| Evidence requirement | Pack composition lists every EvidenceRecord by hash + retention class + readiness flag |
| Source-system dependency | Wave 1 |

#### Layout Structure

- **Header:** lens selector tabs with current ARS per lens.
- **Zone A — Selected lens overview:** large Readiness Ring (ARS) + breakdown of inputs (Evidence Coverage / Source Completeness / Correlation Quality / Population Testability / Workpaper Exportability).
- **Zone B — Gap list (centre):** structured table with the eight gap categories from Pass 3 §7.3 (missing evidence, stale evidence, unlinked source records, open high-risk issues, unclosed remediation, missing senior-manager attestation, missing reporting acknowledgement, failed / not-run population tests).
- **Zone C — Pack Composition Tree (right):** tree view of OBL → CTRL → EVD nodes within the selected lens scope.
- **Zone D — Action bar (bottom):** "Refresh readiness", "Export pack" (only enabled at green), "Assign gaps".
- **AI insight panel:** Tier 3 gap-finder inline.

### 4.4 S-04 Obligation Coverage Map

| Attribute | Specification |
|---|---|
| Primary persona | PERSONA-002 |
| Persona question answered | Q-CCO-01, Q-CCO-04, Q-CCO-05 |
| Anchor entity | `Obligation` × `Control :COVERS Obligation` matrix |
| Default filters | All regulators (RBI / PMLA / FIU / NPCI / CERT-In / ITGRCA); all processes; current period |
| Primary KPIs | OCS aggregate; OCS per regulator; Coverage strength split (Strong / Adequate / Thin / Gap); Stale-evidence obligation count; Recent regulatory changes count |
| Main layout zones | Header → Regulator group filter → Obligation list with coverage bars → Coverage drill-in panel (right) → Recent regulatory changes panel (bottom) |
| Required cards / tables / panels | Obligation Coverage Bars (one row per OBL); Coverage Drill-in Panel (linked controls + their CES + evidence freshness); Regulatory Change Timeline; Coverage-gap AI insight chips (AI-003) |
| Drill-down actions | Click any Obligation → drill panel populates; click any linked Control → opens S-06 with that Control |
| Empty states | If a regulator group is filtered with no OBL → "no obligations active in window" |
| Alert states | OBL with coverage = Gap glows; OBL with stale evidence (> SLA) shows EIFS warning |
| AI involvement | AI-003 (regulatory mapping coverage gap) shown inline; AI-005 (evidence quality) on linked EVDs |
| Evidence requirement | Each linked Control must show its EvidenceCompleteness ring |
| Source-system dependency | Wave 1 |

#### Layout Structure

- **Header:** Regulator group filter (RBI / PMLA / FIU / NPCI / CERT-In / ITGRCA), MD-version toggle (pre/post-28-Nov-2025 consolidation).
- **Zone A — Obligation list (centre, scrollable):** rows of `OBL-ID`, atomic_requirement, regulator, citation, coverage strength bar (Strong / Adequate / Thin / Gap), CES of linked controls (mean), EIFS chip, AI-003 chip if applicable.
- **Zone B — Drill-in Panel (right):** when an OBL is selected, shows linked Controls (CES + outcome split + evidence completeness ring), reporting clock if applicable, accountable senior manager, related Issues.
- **Zone C — Recent Regulatory Changes (bottom strip):** timeline of `RegulatoryChangeEvent`s; click any → impacted obligations highlighted in centre.
- **Action bar:** "Open Inspection Readiness for selection", "Raise issue on coverage gap".

### 4.5 S-05 Control Universe

| Attribute | Specification |
|---|---|
| Primary persona | PERSONA-002, PERSONA-003 |
| Persona question answered | Q-CCO-03, Q-IA-01 |
| Anchor entity | `Control` (entire RCM) |
| Default filters | All 7 processes; all control types; all natures; status=active |
| Primary KPIs | Total active controls; CES distribution (Green / Amber / Red / Grey); Population-testable %; Evidence-complete %; AI-signal-bearing controls |
| Main layout zones | Header → Multi-facet filter rail → Control list (table) → Bulk-action bar (bottom) |
| Required cards / tables / panels | Control table (control_id, title, process, CES, OperatingRate, CatchRate, EvidenceCompleteness, outcome split, owner SM, AI signals, open issues); CES distribution chart (top right) |
| Drill-down actions | Click any row → S-06 Control Drill-Down for that Control |
| Empty states | "No controls under filters — relax filters" |
| Alert states | Red CES rows highlighted; Grey CES rows show "Insufficient data" reason |
| AI involvement | AI-018 chip shown on CES-decay rows |
| Evidence requirement | Evidence Completeness ring is a column |
| Source-system dependency | Wave 1 |

#### Layout Structure

- **Header:** facet filter rail collapsible (process / control type / nature / frequency / risk domain / regulator / population_testable_flag / status).
- **Zone A — Distribution snapshot:** small CES distribution chart, OCS aggregate.
- **Zone B — Control table (full width):** sortable, with bulk-select; columns above; row badges for outcome split per Pass 2 four-outcome taxonomy.
- **Zone C — Bulk-action bar:** "Run population test on selection", "Add to Workpaper", "Export RCM snapshot (regulator-format)".

### 4.6 S-06 Control Drill-Down

> The single most-used screen in the product. Hosts CES breakdown + outcome split + evidence + linked issues + AI insight + lineage.

| Attribute | Specification |
|---|---|
| Primary persona | PERSONA-002, PERSONA-003; PERSONA-001 reads aggregated tiles |
| Persona question answered | Q-CCO-03 (deep), Q-IA-02, Q-CRO-02 (drill from cockpit) |
| Anchor entity | one `Control` + its full `ControlInstance` population in window + `EvidenceRecord` set + linked `Issue`s + linked `AIInsight`s + linked `Obligation`s + linked `Risk`s |
| Default filters | Last 30 days; all branches / channels / vendors |
| Primary KPIs | CES (with formula breakdown); OperatingRate; CatchRate; EvidenceCompleteness; Outcome split (Pass / Fail / Data Gap / Evidence Gap / Needs Review); Latency p95 |
| Main layout zones | Header (control identity + accountable SM) → CES Breakdown Card → Outcome Split → Population grid (paginated) → Linked Obligation / Risk strip → Issue list → AI Insight panel → Lineage drawer (D-01) |
| Required cards / tables / panels | CES Breakdown Card; ControlInstance Outcome Badges; Population Grid (rows = CIs with subject_id, outcome, evidence link, latency, override); Linked OBL/Risk strip; Issue mini-board; AI Insight cards |
| Drill-down actions | Click any CI row → opens D-01 Source Lineage Drawer with PE / SE / EVD / SR chain; click any Issue → S-10; click AI insight → S-11 |
| Empty states | If denominator < 30 → "Population too small for CES — see TestExecution recommendations"; if data gap > 20% → Grey CES with reason |
| Alert states | Red banner if CES < 60 with declining slope; Amber for 60–79 |
| AI involvement | AI-018 (effectiveness decay), AI-002 (process drift on this control's step), AI-005 (evidence quality), AI-013 / AI-016 / AI-001 etc. as relevant |
| Evidence requirement | Every CI in the grid links to its EvidenceRecord set with hash + status |
| Source-system dependency | Wave 1 |

#### Layout Structure

- **Header:** control_id + title + version + accountable SeniorManager chip; tabs: Overview | Population | Evidence | Issues | AI Insights | Lineage.
- **Overview tab:** CES Breakdown Card (formula-decomposed); Outcome Split donut; trend sparkline (rolling 13 weeks); Linked OBL strip; Linked Risk chips; Reporting Clock strip if relevant.
- **Population tab:** Population Grid with all ControlInstances in window; columns: ci_id, subject_id, outcome badge, fired_ts, latency_ms, evidence link icon, override flag; row click → Lineage Drawer.
- **Evidence tab:** Evidence Workbench mini view (cf. S-08) for this control only.
- **Issues tab:** linked Issues with status, severity, owner.
- **AI Insights tab:** AI cards for this control; HITL inline.
- **Lineage tab:** opens D-01 Drawer.
- **Action bar:** "Run population test", "Raise Issue", "Add to Workpaper", "Open in Inspection Pack scope".

### 4.7 S-07 Process Health / Process Execution View

| Attribute | Specification |
|---|---|
| Primary persona | Operations / Process Owner; PERSONA-002 secondary |
| Persona question answered | Operations: SLA breach, queue health; PERSONA-002: process drift root cause |
| Anchor entity | `Process` and its `ProcessExecution`s in window |
| Default filters | Wave 1 processes (KYC / Lending / AML); current week |
| Primary KPIs | PVDS per process; ProcessExecution volume; Avg / p95 duration per step; SLA breach count; In-flight ProcessExecutions count; BPO / branch / system handoff failure count |
| Main layout zones | Header → Process selector → Variant Conformance Map → Step Latency Funnel → Drift Cluster Cards → Linked failing controls |
| Required cards / tables / panels | Variant Conformance Map (heatmap of step variants vs documented signature); Step Latency Funnel; PE list with status colours; Drift Cluster Cards (grouped by handoff failure type) |
| Drill-down actions | Click any PE → list of its StepExecutions → individual SE opens Lineage Drawer; click failing CTRL chip → S-06 |
| Empty states | "No drift detected this period" |
| Alert states | Red highlight on steps with skip rate > threshold or override rate > threshold |
| AI involvement | AI-002 process mining shown as drift cluster cards |
| Evidence requirement | Every drift cluster cites a sample of PEs |
| Source-system dependency | Wave 1 |

#### Layout Structure

- **Header:** process selector (single-select with overall view).
- **Zone A — Variant Conformance Map:** heatmap; rows = StepExecution variants; columns = volume / drift score; AI-002 chip on novel variants.
- **Zone B — Step Latency Funnel:** funnel showing average / p95 latency per step + drop-off / skip rates.
- **Zone C — Drift Cluster Cards (right):** AI-002 clusters with sample PE IDs.
- **Zone D — Linked failing controls strip (bottom):** controls whose CES is being pulled down by this process drift.

### 4.8 S-08 Evidence Workbench

| Attribute | Specification |
|---|---|
| Primary persona | PERSONA-003 |
| Persona question answered | Q-IA-03 |
| Anchor entity | `EvidenceRecord` + `SourceRecord` + `CorrelationRecord` |
| Default filters | All evidence types; current period |
| Primary KPIs | EIFS aggregate; Evidence freshness distribution; Hash-verified %; PMLA Rule 9 ready %; RBI AFI ready %; FIU ready % |
| Main layout zones | Header → Evidence Status Strip → Evidence Table (centre) → Lineage Drawer (right; D-01) → Action bar |
| Required cards / tables / panels | Evidence Status Strip (Complete / Partial / Missing / Late / Invalid Hash / Orphaned / BPO-Pending); Evidence Table (rows = EvidenceRecord, columns = ev_id, type, source_system, completeness, hash, retention class, freshness days, regulator-readiness flags, linked CI); Stale-evidence alert table; Orphan queue mini-card |
| Drill-down actions | Click any EvidenceRecord → opens D-01 with full SR + CR chain; double-click SourceRecord → source-system audit-extract method shown |
| Empty states | "No evidence in window — verify ingestion" |
| Alert states | Red row for Invalid Hash; Amber for Stale; Purple for Orphan; Blue for Needs Review |
| AI involvement | AI-005 (evidence auto-assembly + completeness scoring) inline on each row |
| Evidence requirement | This *is* the evidence screen |
| Source-system dependency | Wave 1; reads from CBS / LOS / AML engine / Sanctions / Case Mgmt / CKYCR |

#### Layout Structure

- **Header:** evidence type filter + source-system filter + freshness filter + readiness-flag filter.
- **Zone A — Evidence Status Strip:** counts by status per Pass 2 §9.2.
- **Zone B — Evidence Table (centre, scrollable):** primary working surface.
- **Zone C — Lineage Drawer (right):** D-01 component preview — see §5.
- **Zone D — Action bar:** "Mark for re-fetch", "Add to Workpaper", "Raise Evidence-Gap Issue".

### 4.9 S-09 Population Testing / Reperformance Console

| Attribute | Specification |
|---|---|
| Primary persona | PERSONA-003 |
| Persona question answered | Q-IA-01, Q-IA-04 |
| Anchor entity | `Control`, `PopulationTestSpecification`, `TestExecution` |
| Default filters | Wave 1 controls; period = current month |
| Primary KPIs | Population testability %; Tested control count; Exception rate per control; CES projection from latest test; rerunnable_flag % |
| Main layout zones | Header → Test runner panel (left) → Results panel (centre) → Exception drilldown (right) → Workpaper export (bottom) |
| Required cards / tables / panels | Test runner; Population summary card; Exception cluster table; Sample-vs-population toggle (with rationale capture); TestExecution history; Population Test Summary Card |
| Drill-down actions | Click any exception → opens D-01 Lineage Drawer with that subject's full chain; click "Open Workpaper" → S-13 with TestExecution attached |
| Empty states | "No test specifications for this control — define population query" |
| Alert states | Red if exception_rate > threshold; Grey if data_gap_rate > 20% |
| AI involvement | AI Tier 3 *Population reperformance automation* drafts test queries; AI-005 inline on evidence; AI-013 / AI-016 etc. surface specific patterns |
| Evidence requirement | Every test run produces an EVD-WORKPAPER + retains population_query_ref for reproducibility |
| Source-system dependency | Wave 1 |

#### Layout Structure

- **Header:** control selector + test type (ToD / ToO / Population reperformance / Sample / Walkthrough / Retest).
- **Zone A — Test runner (left):** population definition (denominator), pass predicate, evidence predicate, sampling rationale (if not population), as-of-date.
- **Zone B — Results panel (centre):** Population summary card (population size, tested, exceptions, data gaps, evidence gaps, result), Outcome split badges.
- **Zone C — Exception cluster table (right):** clustered by root cause; expandable to subject-level.
- **Zone D — Workpaper assembly bar (bottom):** "Open in Workpaper Builder" → S-13 with state pre-loaded.
- **AI panel:** "Suggest population predicate" card (Tier 3) with cited training cases + human-approval gate.

### 4.10 S-10 Issue & Remediation Board

| Attribute | Specification |
|---|---|
| Primary persona | All three personas |
| Persona question answered | Q-CRO-02, Q-CCO-09, Q-IA-05 |
| Anchor entity | `Issue`, `RemediationAction`, `RootCauseCluster` |
| Default filters | Open + In Remediation + Awaiting Retest; all severities |
| Primary KPIs | Open issue count; Issue ageing distribution; RBI MRA flag count; Section 47A exposure flag count; PMLA exposure count; Avg MTTR; Re-test pass rate |
| Main layout zones | Header → Cluster swimlanes (root-cause clusters) → Issue list → Issue detail panel (right) → Action bar |
| Required cards / tables / panels | Cluster swimlane cards (e.g., "DSA-LOS-clock cluster"); Issue table (issue_id, title, severity, ageing, owner, accountable SM, linked CTRL, linked OBL, RBI MRA flag, status); Issue Detail Panel (full Issue view with timeline, linked entities, AI signals, decisions, remediation tasks, retest workpaper) |
| Drill-down actions | Click Issue → Issue Detail Panel; click linked CTRL → S-06; click linked OBL → S-04; click RemediationAction → retest in S-09 |
| Empty states | "No open issues" — rare; show closed-this-week list |
| Alert states | RBI MRA flag rows highlighted; Section 47A flag rows show personal-exposure chip |
| AI involvement | AI-010 (issue clustering / RCA) drives the swimlanes; AI-018 marks effectiveness-decay-driven issues |
| Evidence requirement | Every issue must link to evidence (failing CIs, source records) |
| Source-system dependency | Wave 1 |

#### Layout Structure

- **Header:** filter chips (severity / status / RBI flag / SM owner / process / control / cluster).
- **Zone A — Cluster swimlanes (top):** root-cause clusters with member-count, average ageing, cluster severity.
- **Zone B — Issue table (centre):** sortable, with bulk-select.
- **Zone C — Issue Detail Panel (right, opens on row click):** four sub-tabs — Timeline / Linked Entities / Remediation / Retest.
- **Zone D — Action bar:** "Bulk escalate", "Bulk reassign", "Bulk attach to AuditPack".

### 4.11 S-11 AI Insights Review Queue

| Attribute | Specification |
|---|---|
| Primary persona | PERSONA-002 |
| Persona question answered | Discovery-driven; powers Q-CCO across all questions |
| Anchor entity | `AIInsight`, `Model`, `ModelRiskRecord` |
| Default filters | `human_approval_status = pending`; all signal classes |
| Primary KPIs | Pending count; Auto-action rate; Accept rate; Reject rate; FP rate per model; AITES |
| Main layout zones | Header → Signal class strip → Insights list → Insight Detail Panel (right) → Model & MRM strip (bottom) |
| Required cards / tables / panels | Signal Class Strip (counts per class: Anomaly / Drift / Coverage Gap / Effectiveness Decay / Evidence Quality / Cluster-RCA / Reporting Risk / Accountability Gap / Model Risk); AIInsight list (id, signal_id, title, confidence, threshold, model_version, linked CTRL / OBL / SM); Insight Detail Panel (full insight with cited source evidence, recommendation, risk_if_wrong, accept / reject / escalate); Model strip (model name, version, MRR record link) |
| Drill-down actions | Click insight → Detail Panel; "Cited Evidence" → D-01 Drawer; "Linked Issue" → S-10; "Model" → MRR snapshot (read-only mini-screen) |
| Empty states | "No insights awaiting review — last drift on …" |
| Alert states | Red on `Model_Risk` class; Orange on Reporting Risk |
| AI involvement | This screen *is* the AI gate |
| Evidence requirement | Every insight must cite ≥1 EvidenceRecord and ≥1 SourceRecord |
| Source-system dependency | Wave 1 |

#### Layout Structure

- **Header:** signal class filter + model filter + confidence-threshold filter.
- **Zone A — Signal Class Strip:** count chips with click-to-filter.
- **Zone B — Insights list (centre):** rows include `Pending` status badge and confidence vs threshold visual.
- **Zone C — Insight Detail Panel (right, opens on row click):** five sub-blocks — Source Evidence / Output / Rationale / Recommendation / Decision (Accept / Reject / Escalate / Override-with-reason).
- **Zone D — Model strip (bottom):** Model node + MRR snapshot for the model that produced the insight (version, training_data_id, last validation, drift metrics).
- **Action bar:** "Bulk accept high-confidence", "Bulk reject", "Escalate to PERSONA-001".

### 4.12 S-12 Senior Accountability Ledger

> Looks like an accountability cockpit, *not* an org-chart screen.

| Attribute | Specification |
|---|---|
| Primary persona | PERSONA-001 |
| Persona question answered | Q-CRO-03 |
| Anchor entity | `SeniorManager` (CRO / CCO / MLRO–PO / CISO / CIO / HIA / MD&CEO / Business Heads / Operations Head) |
| Default filters | Active senior managers; current quarter |
| Primary KPIs | SAES per SM; Open issues by SM; Overdue attestations by SM; Section 47A exposure; PMLA s.13 exposure; Last decision activity |
| Main layout zones | Header → SM grid → SM Detail Panel (right) → Decision / Attestation timeline (bottom) |
| Required cards / tables / panels | Senior Accountability Cards (one per SM with SAES ring, role, accountable scope counts); SM Detail Panel (accountable processes / controls / risks / issues / decisions / attestations / committee memberships / reasonable-oversight evidence); Decision / Attestation Timeline (last 90 days) |
| Drill-down actions | Click any SM card → Detail Panel; click any DecisionEvent / AttestationEvent → opens D-01 with linked evidence |
| Empty states | n/a — every SM exists and has scope |
| Alert states | Red on Section-47A exposure chip; Amber on accountability_gap_flag |
| AI involvement | "Senior accountability evidence warning" (Tier 2) shown as inline note when SAES < 85 |
| Evidence requirement | Every decision / attestation must cite Evidence (committee minutes, board pack, signed attestation) |
| Source-system dependency | Wave 1 |

#### Layout Structure

- **Header:** SM-role filter, period selector.
- **Zone A — SM grid (centre):** Senior Accountability Cards in tile layout.
- **Zone B — SM Detail Panel (right):** five sub-blocks — Scope / Open Issues / Decisions / Attestations / Reasonable-Oversight Evidence.
- **Zone C — Timeline (bottom):** chronological decision / attestation feed; click any → linked evidence.
- **Action bar:** "Open Attestation" (if user is the SM); "Escalate gap to MD&CEO".

### 4.13 S-13 Workpaper / AuditPack Builder

| Attribute | Specification |
|---|---|
| Primary persona | PERSONA-003 |
| Persona question answered | Q-IA-04 |
| Anchor entity | `TestExecution`, `Workpaper`, `AuditPack` |
| Default filters | Drafts owned by current user; current period |
| Primary KPIs | Workpaper readiness %; AuditPack readiness %; Reviewer sign-off pending; Export readiness flags |
| Main layout zones | Two-mode toggle: Workpaper mode / AuditPack mode → Header → Document outline (left) → Editing area (centre) → Linked entities panel (right) → Export bar (bottom) |
| Required cards / tables / panels | Workpaper outline with required sections; Linked entities chips; Evidence appendix list; Reviewer sign-off card; Export readiness flags (RBI AFI / PMLA / Statutory / Concurrent); AuditPack composition tree |
| Drill-down actions | Click any linked entity → relevant detail; "Add evidence from S-08"; "Add population from S-09"; "Add issue from S-10" |
| Empty states | Empty outline with section guidance |
| Alert states | Red sign-off flag if reviewer overdue; Amber if export readiness incomplete |
| AI involvement | Tier 3 Workpaper drafting + AuditPack gap finder; tester edits and signs |
| Evidence requirement | Every section of the workpaper / pack lists EvidenceRecords with hash + retention class |
| Source-system dependency | Wave 1 |

#### Layout Structure

- **Mode toggle (top):** Workpaper / AuditPack.
- **Header:** scope (control / obligation / theme / period), tester / reviewer chips.
- **Zone A — Document outline (left, fixed):** the workpaper or pack structure (per §9 below).
- **Zone B — Editing area (centre):** section-by-section content with AI-drafted text + tester edits + cited evidence inline.
- **Zone C — Linked entities panel (right):** linked Controls, Obligations, Issues, EvidenceRecords; drag-add or remove.
- **Zone D — Export bar (bottom):** "Validate readiness" → readiness flags → "Export PDF / structured CSV / JSON"; export creates immutable hashed artefact.

### 4.14 D-01 Source Lineage / Evidence Chain Drawer (universal overlay)

> Not a standalone page — a slide-in drawer attached to *every* screen via the right edge.

| Attribute | Specification |
|---|---|
| Primary persona | All three personas |
| Persona question answered | Final-step "show me the source row" |
| Anchor entity | the selected `EvidenceRecord` / `ControlInstance` / `Issue` / `AIInsight` / `ProcessExecution` (whatever was clicked) |
| Default filters | n/a (drawer follows context) |
| Primary KPIs | Source-system health; Match confidence; Cardinality; Hash status |
| Main layout zones | Drawer Header → Lineage Spine → Source Record Detail → Correlation Detail → Action bar |
| Required cards / tables / panels | Source Lineage Timeline component (see §5 #6); Source Record card (source_system_id, source_table_or_api, source_primary_key, hash, retrieval_timestamp); Correlation Record card (primary_key_used, backup_key_used, match_method, match_confidence, cardinality, status); Source-System Health Badge |
| Drill-down actions | "Open in Source Lineage page" (N-09); "Re-fetch from source"; "Raise CorrelationRecord review" |
| Empty states | If clicked entity has no SR linkage → "Lineage incomplete — orphan flag set" with orphan classification |
| Alert states | Red if hash invalid or correlation_status ∈ {schema_mismatch, timestamp_reversal, ambiguous_*}; Amber if late_arriving |
| AI involvement | If the lineage chain triggered an AI signal (e.g., AI-013 from KFS timestamp comparison), AI insight chip appears with confidence + model_version |
| Evidence requirement | This drawer is the universal landing for evidence |
| Source-system dependency | Wave 1 |

#### Layout Structure

- **Drawer width:** ~40% of viewport; overlay on right side; click-outside or ESC closes.
- **Drawer Header:** anchor entity ID + type + status badges.
- **Zone A — Lineage Spine:** Regulation → Obligation → Control → ControlInstance → EvidenceRecord → SourceRecord chain with the relevant nodes highlighted.
- **Zone B — Source Record Detail:** payload preview (hash-verified), source-table / API / primary-key, retrieval timestamp.
- **Zone C — Correlation Detail:** the bridging CorrelationRecord with all match metadata.
- **Zone D — Action bar:** quick actions (raise issue, mark for re-fetch, open in S-08 Evidence Workbench).

---

## 5. Shared Component Inventory

| # | Component | Purpose | Used on screens | Entity / metric binding | Interaction behavior |
|---|---|---|---|---|---|
| 1 | **Risk Domain Heatmap** | Visualize 9 risk domains with inherent / residual / trend | S-01, S-02 | `Risk` aggregated by domain; RES; CES weighted aggregate | Click tile → S-06 filtered by domain; hover → mini-card with top failing controls |
| 2 | **Control Health Tile** | Compact card showing one control's health | S-05, S-06, S-09, S-10 | `Control`; CES; outcome split | Click → S-06 |
| 3 | **CES Breakdown Card** | Decompose CES into OperatingRate / CatchRate / EvidenceCompleteness | S-06, S-09 | `Control`; CES formula | Hover any segment → its denominator / numerator counts |
| 4 | **Obligation Coverage Bar** | Coverage strength per OBL | S-04 | `Obligation` `:COVERS` `Control`; OCS | Click → drill-in panel right side |
| 5 | **Evidence Completeness Ring** | Ring rendering of EvidenceCompleteness | S-06, S-08, S-09 | `EvidenceRecord` set per CI / control; EIFS | Hover → counts of Complete / Partial / Missing / Late / Invalid Hash / Orphaned |
| 6 | **Source Lineage Timeline** | Horizontal lineage Reg → Obl → Ctrl → CI → Evd → SR | D-01, S-08 | full lineage chain | Click any node → that entity detail; right-click → "Add to Workpaper" |
| 7 | **ControlInstance Outcome Badge** | Visual badge for one of {Pass, Fail, Data Gap, Evidence Gap, Needs Review} | S-05, S-06, S-09 | `ControlInstance.outcome` | Tooltip with reason; click → D-01 |
| 8 | **Data Gap / Evidence Gap / Control Failure Badge** | Five-label badge with strict colour distinction (see §5.2) | Everywhere outcomes / statuses appear | per Pass 2 §9.3 | Static unless actionable |
| 9 | **Process Step Timeline** | Visual step-by-step ProcessExecution with actor / system / latency / variant deviations | S-07, S-06 (in lineage tab) | `ProcessExecution`, `StepExecution`, `Activity` | Click step → SE detail; deviation badges expand to AI-002 reasoning |
| 10 | **Population Test Summary Card** | Population / tested / exception / data-gap / evidence-gap counts | S-09, S-13 | `TestExecution` | Click → drill into exception list |
| 11 | **Exception Cluster Table** | Exceptions grouped by root cause | S-09, S-10 | `Exception` clustered via `RootCauseCluster` | Expand cluster → subject list; row click → D-01 |
| 12 | **Workpaper Status Card** | Workpaper readiness with section completion | S-13, S-09 | `Workpaper` | Click → S-13 with that workpaper |
| 13 | **AuditPack Readiness Card** | AuditPack readiness with gap list | S-03, S-13 | `AuditPack`; ARS | Click any gap → screen that resolves it |
| 14 | **AI Insight Card** | Insight with model version, confidence, cited evidence, recommendation, accept / reject / escalate | S-11, S-06 (AI tab), S-01 (panel), S-09 | `AIInsight`, `Model` | HITL accept / reject / escalate; "Cite" → D-01 with cited evidence |
| 15 | **Human Review Queue Item** | Compact AI insight row in queue | S-11 | `AIInsight` (pending) | Click → Insight Detail Panel |
| 16 | **Senior Accountability Card** | SM card with SAES + scope counts + last attestation | S-01 (snapshot zone), S-12 | `SeniorManager`; SAES | Click → S-12 SM Detail Panel |
| 17 | **Reporting Clock Badge** | Clock with countdown / status (within / at-risk / breached) | S-01 strip, S-04 panel, S-06 reporting strip, S-10 | `ReportingClock`, `ReportingSubmission`; RTS | Click → ReportingSubmission detail with ack evidence |
| 18 | **Source-System Health Badge** | Badge for one source system | Top bar (aggregate), D-01, N-09 | `SourceSystem.status`, ingestion delta | Click → N-09 page filtered to that system |
| 19 | **Drill-Down Breadcrumb** | Contextual breadcrumb of drill chain | Every detail screen | path of clicked entities | Click any node → revisit |
| 20 | **Evidence Chain Drawer (D-01)** | Universal lineage drawer | Every screen | `SourceRecord`, `CorrelationRecord`, `EvidenceRecord` | See §4.14 |

### 5.1 Conceptual Badge Colour Convention

> Colours are conceptual; final tokens belong to the next pass. Distinction must be unambiguous at-a-glance.

| Status / Label | Conceptual colour | Notes |
|---|---|---|
| **Pass** | green | clear positive |
| **Fail / Control Failure** | red | direct breach |
| **Data Gap** | purple (or grey) | source-data missing; *not* a fail |
| **Evidence Gap** | amber | evidence absent / hash invalid / orphaned |
| **Correlation Warning** | orange | join defensibility issue |
| **Needs Review** | blue | HITL queue item |
| **Not Applicable** | neutral | excluded from denominator |
| **BPO-Pending** | striped amber | partial / pending; converts to Missing on SLA expiry |
| **AI signal: high-confidence action** | cyan-edged red | auto-action threshold |
| **AI signal: review** | cyan-edged blue | review threshold |

---

## 6. Drill-Down Flow Map

### 6.1 Flow Map Table

| # | Flow | Starting point | Intermediate view | Final evidence view | User decision supported |
|---|---|---|---|---|---|
| F-01 | **Risk Posture → Risk Domain → Control List → ControlInstance Grid → Evidence Chain** | S-01 Risk Domain Heatmap tile | S-05 Control Universe (filtered); S-06 Population grid | D-01 Lineage Drawer | PERSONA-001: where to escalate, halt, or attest |
| F-02 | **Obligation Coverage → Obligation → Linked Controls → Evidence Gaps → Source Records** | S-04 Obligation row | S-04 right panel; S-06 Control Drill-Down | S-08 Evidence Workbench → D-01 | PERSONA-002: which gap to remediate first |
| F-03 | **Control Universe → Control → CES Breakdown → Failed Instances → Evidence** | S-05 row | S-06 CES card; S-06 population grid | D-01 | PERSONA-002 / PERSONA-003: which control needs intervention |
| F-04 | **Process Health → ProcessExecution → StepExecution → ControlInstance → Exception** | S-07 drift cluster | S-07 step funnel; S-07 PE list | S-06 / D-01 | Operations: where the drift is and which control fails |
| F-05 | **Issue Board → Issue → Root Cause Cluster → Remediation → Retest Workpaper** | S-10 row | S-10 detail panel; S-09 retest | S-13 Workpaper | PERSONA-003: close issue with positive retest |
| F-06 | **Population Testing → TestExecution → Exception Population → Workpaper → AuditPack** | S-09 result panel | S-09 exception cluster | S-13 Workpaper → AuditPack | PERSONA-003: build inspection-ready evidence |
| F-07 | **AI Insight → Source Evidence → Human Approval → Issue / ActionTask** | S-11 row | S-11 Detail Panel; D-01 | S-10 | PERSONA-002: accept / reject / escalate AI signal |
| F-08 | **Senior Accountability → SeniorManager → Accountable Issues → Decisions / Attestations → Evidence** | S-12 SM card | S-12 Detail Panel; S-10 | D-01 | PERSONA-001: validate reasonable-steps file |
| F-09 | **Inspection Pack → Scope → Evidence Completeness → Missing Items → Source-System Owner** | S-03 lens tab | S-03 gap table; S-08 stale list | N-09 Source Lineage page; D-01 | PERSONA-002: route gap to owner |
| F-10 | **Reporting Clock → Due / Breached Submission → Acknowledgement Evidence → Issue** | S-01 reporting strip / N-10 | ReportingSubmission detail | D-01 with ack EvidenceRecord | PERSONA-002: prevent / fix submission breach |

### 6.2 Text-diagram drill-downs

#### Flow A — CRO risk-to-evidence drill-down

```
S-01  Risk Domain Heatmap
      │  (click Red R-FC tile)
      ▼
S-06  Control Drill-Down (filtered to Financial-Crime failing controls)
      │  e.g. CTRL-AML-002 — CES 65 (Amber, declining)
      │  (click row in population grid)
      ▼
S-06  Population grid → fail row (e.g. AML-ALRT-2024-00502, L1 SLA breach)
      │  (click ci_id)
      ▼
D-01  Source Lineage Drawer
      │  Reg → Obl(OBL-PMLA-001) → Ctrl(CTRL-AML-002)
      │  → CI(CI-CTRL-AML-002-...-AML-ALRT-2024-00502)
      │  → EVD(EV-LOG-CASE-... / missing EV-LOG-L1-DISPO)
      │  → SR(case_mgmt CASE-2024-11-08-3411)
      ▼
S-10  Linked Issue (ISS-2026-009-extension)
      │  Owner: Head of FCC; SM: CCO
      │  Remediation: BPO L1 SLA fix
      ▼
PERSONA-001 decides:  escalate to BRMC / Board, voluntary disclosure to RBI SSM,
                      or hold pending remediation evidence
```

#### Flow B — Compliance obligation-to-control drill-down

```
S-04  Obligation Coverage Map
      │  Filter: regulator = RBI; pre/post-28-Nov-2025 toggle = post
      │  (click OBL-RBI-DL-001 — KFS pre-acceptance)
      ▼
S-04  Right drill-in panel
      │  Coverage Strength: Adequate (was Strong before AI-013 cluster)
      │  Linked Controls: CTRL-LND-002 (CES 89.51 headline; OperatingRate 74.77)
      │  (click CTRL-LND-002)
      ▼
S-06  Control Drill-Down — CTRL-LND-002
      │  CES Breakdown reveals OperatingRate problem
      │  Population grid shows 11,118 KFS-after-acceptance instances
      │  Outcome split: Fail-heavy on DSA channel
      │  (click DL-APP-2024-00884 row)
      ▼
D-01  Source Lineage Drawer
      │  EV-LOG-KFS-EVT (kfs_issued_at = 2024-12-15T11:08Z)
      │  EV-LOG-BACC-EVT (borrower_acceptance_at = 2024-12-15T10:55Z)
      │  → SR (LOS event-stream rows)
      │  AI-013 chip (confidence 0.97)
      ▼
PERSONA-002 decides:  raise / cluster ISS-2026-085;
                      reject DSA channel product launch until LOS NTP fix
```

#### Flow C — Auditor population test drill-down

```
S-05  Control Universe
      │  Filter: process = KYC; population_testable_flag = TRUE
      │  Select CTRL-KYC-008 (CKYCR upload window)
      ▼
S-09  Population Testing Console
      │  Population query: all UCICs activated in March
      │  Tested: 18,400; Exceptions: 1,910 overdue + 660 DBT cohort (AI-016)
      ▼
S-09  Exception cluster table
      │  Cluster: "DBT/scholarship cohort — re_kyc_due_date NULL"
      │  (drill into UCIC-2024-00127)
      ▼
S-08  Evidence Workbench (filtered to UCIC)
      │  EV-LOG-CKYCR-ACK exists (Pass at original onboarding)
      │  No re-KYC schedule evidence (Data Gap)
      ▼
S-13  Workpaper Builder
      │  AI-drafted: "AI-016 detected null re_kyc_due_date for DBT cohort"
      │  Tester edits + signs; Reviewer signs
      ▼
S-13  AuditPack Builder (RBI AFI lens; KYC theme)
      │  Includes Workpaper above + linked OBL-RBI-002 + CTRL-KYC-003 evidence set
      │  Export readiness: Green for RBI AFI / PMLA Rule 9 / Concurrent
      │  Hash-stamped; immutable
```

---

## 7. AI UX Behavior

### 7.1 AI Capability × UX Surface Table

| # | AI capability | Where it appears | Input entities | Output shown | Required evidence | Human action | Risk if wrong |
|---|---|---|---|---|---|---|---|
| 1 | **Process variant drift detection (AI-002)** | S-07 drift cluster cards; S-06 (drift on control's step) | `StepExecution`, `ProcessExecution` | Drift cluster with novel variant signature, sample PE IDs, severity | Cited PE / SE rows; SR for each | Acknowledge / Drill / Raise Issue | Mis-flag valid new product flow |
| 2 | **Control effectiveness explanation (AI-018)** | S-06 Overview; S-01 cockpit insight panel | `ControlInstance` time series; `Issue` history | "CES dropped 12 points because OperatingRate declined in DSA channel" with attribution | Cited CIs and Issues | Acknowledge / Open Issue / Escalate | Misleading the board narrative |
| 3 | **Evidence gap detection (AI-005 deterministic part)** | S-08 Evidence Workbench rows | `EvidenceRecord`, `EvidenceSpecification` | Gap chip per row with which spec / field missing | The spec + the affected EvidenceRecord | Acknowledge / Re-fetch / Raise Issue | False alarms degrade trust |
| 4 | **Data correlation warning detection** | D-01 drawer; N-09 page; S-08 strip | `CorrelationRecord` | Per Pass 2 §12 categories (timestamp reversal, schema mismatch, etc.) | The CorrelationRecord + SourceRecord | Acknowledge / Re-correlate / Raise Issue | Mis-classification escalates wrongly |
| 5 | **UPI mule-network detection (AI-001)** *(Wave 2)* | S-11 + (Wave 2) UPI Fraud View | UPI feed, subject graph, NPCI feedback | Mule-cluster insight with graph | Cited NPCI rows + AML alert + subject graph | HITL approve before STR; never auto-file | False-positive freeze breaches Charter of Customer Rights |
| 6 | **AML backlog / STR-risk detection** | S-11; S-06 for CTRL-AML-002 / 003 | `ControlInstance` (AML) + `ReportingClock` | Per-alert / per-case STR-risk score with countdown | Cited case mgmt + clock | HITL escalate to MLRO | Missing the STR window |
| 7 | **KFS timing violation (AI-013)** | S-06 for CTRL-LND-002; S-09; S-11 | LOS event-stream | Per-loan violation with timestamp delta | LOS events; NTP attestation | None for high-confidence (deterministic); review on clock-drift caveat | False-positive on clock drift |
| 8 | **CKYCR upload delay (AI-016)** | S-06 for CTRL-KYC-003; S-09; S-11 | CKYCR ack stream + KYC schedule | Cohort-segmented delay (DBT / scholarship etc.) | Cited UCIC list + schedule rows | Review for cohort actions | Cohort mis-segmentation |
| 9 | **Regulatory change impact (AI-003 ext.)** | S-04 Recent Regulatory Changes strip; (Wave 3) Regulatory Change Inbox | `Regulation` + amendments + control corpus | Impact map across `:COVERS` edges; proposed new obligation; proposed control change | Cited regulation clauses; proposed edges | **Mandatory ratification** by PERSONA-002 before edges go live | Wrongly-marked obligation update |
| 10 | **Root-cause clustering (AI-010)** | S-10 swimlanes; S-11 (cluster class) | `Issue` corpus | RootCauseCluster proposals with embedding diagnostics | Cited member Issues + Controls | Review before cluster lives | Wrong cluster mis-prioritises remediation |
| 11 | **Senior accountability evidence warning** | S-12 SM cards inline note | `SeniorManager` + `DecisionEvent` + `AttestationEvent` | Which evidence missing; SAES delta | Cited DecisionEvent / AttestationEvent gaps | Review before SM is flagged | Reputational impact |
| 12 | **Workpaper draft assistant (Tier 3)** | S-13 Workpaper mode | `TestExecution` + `EvidenceRecord` set | Drafted sections (rationale / steps / finding write-up / appendix) | Citation per finding; reproducible population query | **Mandatory tester edit + sign** | Unsubstantiated finding language |
| 13 | **AuditPack gap finder (Tier 3)** | S-03 gap list; S-13 AuditPack mode | `AuditPack` scope vs current evidence graph | Specific gaps + suggested resolutions | Per-gap evidence pointer | **Mandatory CCO review** before pack exports | Mis-presentation to RBI |

### 7.2 AI UX Rules (non-negotiable)

1. **AI must always show source evidence.** Every AI Insight Card has a "Cited Evidence" link that opens D-01 with the specific records.
2. **AI must show model version / confidence / threshold.** Visible on every AI Insight Card and Detail Panel.
3. **AI must never auto-file STR / FMR / RFA / CERT-In / regulator-facing submissions.** Such actions require explicit HITL with a documented rationale.
4. **AI suggests; humans dispose.** Three terminal actions on every insight: **Accept**, **Reject**, **Escalate**, plus **Override-with-reason**.
5. **AI Insights are first-class graph nodes.** They are reviewable, dismissible, escalatable, and linkable to Issues / ActionTasks (§5 #14, #15 components).
6. **Model risk visibility.** Every Insight Detail Panel has a "Model" link → MRR snapshot showing version, last validation, drift metrics. If AITES < 85, AI auto-creation of Issues is disabled until remediated.
7. **Confidence / threshold rendering.** Three-band visual (alert τ_alert / review τ_review / action τ_action) per Pass 4 AI signal catalogue.
8. **No black-box chat.** A "CRO conversational risk analyst" (Tier 3) is allowed, but every answer must hyperlink to source records — never paraphrase regulation as fact.

---

## 8. Inspection Readiness UX

> Inspection readiness is a **live operating state**, not a "Generate Report" button. It updates as the underlying graph changes and is queryable as-of any historical date.

### 8.1 Inspection Lens Table

| Inspection lens | Scope | Required evidence | Readiness score inputs | Gaps shown | Primary user action |
|---|---|---|---|---|---|
| **RBI AFI Readiness** (BR Act Sec 35) | Bank-wide; all in-scope obligations under current RBI MDs | EVD-LOG (CBS / AML / CKYCR / Sanctions), EVD-DOC (KFS / SOC / DDQ), EVD-ATTEST (CCO / SM), EVD-REPORT (FIU / CIMS / CSITE acks), EVD-WORKPAPER | OCS, CES (weighted), EIFS, RTS, SAES, DCQS | Missing evidence; stale evidence; unlinked source records; open MRA / RMP / MAP; unclosed remediation; missing SM attestation; missing reporting acks; failed / not-run population tests | "Refresh", "Assign gaps", "Export pack (immutable hash)" |
| **RBS / SPARC Readiness** | SPARC IRISc internal-mock scope | Same set + KRI / appetite observations | OCS + KRI band stability + AppetiteObservation history + Issue MRA closure rate | Same + IRISc factor gaps | "Run internal mock"; "Schedule SSM walk-through" |
| **PMLA / FIU Evidence Readiness** | AML + customer-due-diligence chain (UCIC × accounts × counterparties) | EVD-LOG (alerts / UAPA / case mgmt), EVD-DOC (STR XML), EVD-LOG (FINnet 2.0 ack), EVD-ATTEST (Principal Officer suspicion conclusion) | RTS (STR / CTR / CCR clocks); EIFS; SAES (MLRO / PO); DCQS | Late STR; missed CTR; missing FINnet ack; broken CDD chain (PMLA Rule 9 reconstructability) | "Open clock", "Open STR re-file workflow" (HITL only) |
| **ITGRCA / CSITE / CERT-In Readiness** *(Wave 2 full)* | IT / cyber + TPSP + change / incident / patch / access | EVD-LOG (ITSM / SIEM / IAM), EVD-DOC (DR drill report), EVD-LOG (CERT-In / CSITE submission ack) | RTS (6h / 2-6h clocks); EIFS; SAES (CISO / CIO) | Late submission; missed DR drill; privileged-access orphans (CTRL-ITO-002); vendor 6h re-notification | "Open incident response", "Run DR drill attestation" |
| **Concurrent Audit Readiness** *(per `RBI/2019-20/250` 18-Sep-2019)* | High-risk activities × branch coverage | EVD-LOG (daily-cycle), EVD-RECON (daily recons), EVD-WORKPAPER (ICR sign-offs), EVD-ATTEST (concurrent auditor) | OCS (in scope); CES; daily exception coverage | Branch coverage gaps; missing daily-cycle exceptions; outdated ICR sign-offs | "Schedule branch ICR", "Open daily exception queue" |
| **Statutory Audit Readiness** (BR Act Sec 30) | Books, NPA, IRACP, capital, large exposures | EVD-LOG (CBS), EVD-RECON, EVD-DOC (board minutes), EVD-ATTEST | EIFS; CES on credit / NPA controls; SAES (CFO); DCQS | Reconciliation breaks; IRACP overrides; large-exposure reporting gaps | "Open IRACP override list", "Schedule statutory walk-through" |
| **Board / Audit Committee Pack Readiness** | Period MI for BRMC / ACB | EVD-BOARD (committee packs), EVD-ATTEST (CRO / CCO / HIA), AI-drafted narrative | RES; CES aggregate; OCS; SAES; ARS | Open material issues; pending attestations; missing AI explanations on degrading controls | "Generate board narrative", "Open attestation queue" |

### 8.2 Live State, Not Static Report

- **Always-on refresh:** ARS recomputes whenever underlying graph changes (event-driven).
- **As-of-date queries:** time-period selector lets PERSONA-001 ask "what would RBI have seen on 2026-03-31?"; deterministic via Pass 3 §12 bi-temporality.
- **Hash-stamped exports:** when PERSONA-001 / PERSONA-002 hits "Export pack", the export is a one-click immutable artefact with content hash + as-of timestamp; chain of custody preserved (Pass 3 P-15 append-only, tamper-evident).
- **Pre-staged inspection lenses:** S-03 ships with ready-made lens templates per the table above; they are not constructed during a 14-day data-call window.
- **Gap-routing actions:** every gap on S-03 has a *route-to-fix* action that lands the user in the screen that resolves it (S-08 for evidence; S-09 for population test; S-12 for attestation; N-09 for source-system gap).

---

## 9. Workpaper and AuditPack UX

### 9.1 Artefact Specification Table

| Artifact | Primary persona | Source entities | Required sections | Evidence attachment behavior | Approval / review flow |
|---|---|---|---|---|---|
| **Workpaper** | PERSONA-003 | `TestExecution`, `EvidenceRecord`, `Control`, `Obligation`, `Population` query | (a) Control tested; (b) Obligation linked; (c) Population definition; (d) Test query reference; (e) Population size; (f) Tested count; (g) Exception count; (h) Evidence list (per finding); (i) Tester conclusion; (j) Reviewer sign-off; (k) Retest requirement; (l) Export readiness flags | Inline cited evidence per finding; drag-add from S-08; hash stored on attach; tamper-evident | Tester drafts (AI-assisted) → Tester signs → Reviewer signs → Status = `signed` → exportable |
| **AuditPack** | PERSONA-002 (assemble) + PERSONA-001 / 003 (review) | `Workpaper`, `Issue`, `RemediationAction`, `EvidenceRecord`, `Obligation`, `Control`, `AIInsight`, `AttestationEvent`, `ReportingSubmission` | (a) Scope (lens + period); (b) Obligations covered; (c) Controls covered; (d) Evidence; (e) Issues (open + closed in window); (f) Remediation status; (g) AI insights used (with provenance); (h) Senior-manager attestations; (i) Readiness score breakdown; (j) Export status (RBI AFI / PMLA / Statutory / Concurrent / Board) | Composition tree; drag from S-13 Linked-entities panel; auto-generated TOC; AI-drafted narrative editable | PERSONA-003 assembles → PERSONA-002 / CCO reviews + signs → status = `ready` → export creates immutable hashed artefact |
| **Evidence Pack Export** | PERSONA-002 | `EvidenceRecord` set + their `SourceRecord` chain | Manifest with EvidenceRecord IDs, hashes, source-system metadata, retention class, regulator-readiness flags | Bulk export from S-08 with manifest | n/a — read-only export of existing artefacts |
| **Retest Closure Pack** | PERSONA-003 | `Issue`, `RemediationAction`, `TestExecution` (retest) | (a) Original Issue + linked Controls; (b) Root-cause + RemediationAction; (c) Retest TestExecution result + evidence; (d) Validation owner sign-off; (e) Closure narrative | Retest results bundled with original failing-CI evidence to show before / after | Tester runs retest → Validation owner signs → Issue auto-closes → pack archived in AuditPack candidates |

### 9.2 Workpaper Required Sections (template enforced in S-13)

1. **Cover page** — Workpaper ID; Control ID; Obligation IDs; Period; Tester; Reviewer; Status.
2. **Test rationale** — why this control, this period, this population, this method.
3. **Population definition** — query reference (rerunnable); denominator; as-of-date.
4. **Sampling rationale** *(if not population)* — why a sample; sample size; selection method.
5. **Pass / Fail logic** — exact predicate from `Control.designed_condition`.
6. **Findings** — per-finding sections with subject IDs, evidence citations, severity, root cause.
7. **Evidence appendix** — every cited EvidenceRecord with hash + retention class + readiness flags.
8. **Conclusion & recommendation** — tester's view; linked Issue (if any).
9. **Reviewer sign-off** — name, role, timestamp, hash-stamped.
10. **Retest requirement** — yes / no; conditions for closure.
11. **Readiness flags** — RBI AFI / PMLA Rule 9 / Statutory / Concurrent.

### 9.3 AuditPack Required Sections (template enforced in S-13)

1. **Cover page** — Pack ID; Scope (lens + period); Audience; Assembler; Reviewer; Status; Hash.
2. **Executive narrative** — AI-drafted, CCO-edited, hyperlink-rich; cited everywhere.
3. **Obligations covered** — table of OBL-IDs with coverage strength + evidence freshness.
4. **Controls covered** — table of CTRL-IDs with CES + outcome split + linked workpapers.
5. **Evidence index** — every EvidenceRecord ID + hash + retention class.
6. **Issues** — open (in window) + closed-with-positive-retest (in window).
7. **Remediation status** — open / completed RemediationActions with target / actual close.
8. **AI insights used** — every AIInsight relied upon with provenance + HITL state.
9. **Senior-manager attestations** — relevant AttestationEvents with linked evidence.
10. **Reporting submissions** — relevant ReportingSubmissions with acks for the period.
11. **Readiness score breakdown** — ARS by component (per §8 inputs).
12. **Export manifest** — file list, content hashes, as-of timestamp, immutable.

---

## 10. Entity-to-Screen Binding

| Entity | Where displayed | Primary fields shown | Drill-down target | Persona |
|---|---|---|---|---|
| `Regulation` | S-04 (Recent Regulatory Changes strip), S-03, D-01 (lineage spine) | regulation_id, title, regulator, citation, version, effective_from, supersedes | impacted Obligations | PERSONA-002 |
| `Obligation` | **S-04 (anchor)**, S-03 (pack composition), S-06 (linked OBL strip), D-01 | obligation_id, atomic_requirement, regulator, citation, applicability_archetype, reporting_clock_id | linked Controls; linked Risks | PERSONA-002 (primary) |
| `Risk` | **S-01 (Risk Domain Heatmap)**, S-06 (linked Risk chips), S-12 (SM scope), S-10 (Issue × Risk) | risk_id, domain, inherent_rating, residual_rating (computed), accountable_senior_manager_id | linked Controls + Issues | PERSONA-001 |
| `Control` | **S-05 (anchor)**, S-04 right panel, S-06 (anchor), S-09 (anchor), S-13 (linked entity) | control_id, title, type, nature, frequency, CES, owner_role, accountable_senior_manager_id, linked obligations | ControlInstance population | PERSONA-002, PERSONA-003 |
| `Process` | **S-07 (anchor)**, S-04 (filter), S-06 (drill from CTRL.position_in_step) | process_id, name, owner_role, regulatory_anchor_ids, documented_variant_signature | ProcessExecutions | Operations, PERSONA-002 |
| `ProcessStep` | S-07 (Step Latency Funnel), S-06 (lineage) | step_id, process_id, step_order, expected_actor_role, expected_systems | StepExecutions | Operations, PERSONA-002 |
| `Activity` | S-07 (drill within step), D-01 (lineage) | activity_id, step_id, expected_event_type, expected_evidence_type | source events | Operations |
| `SourceSystem` | **N-09 (anchor)**, top bar (aggregate badge), D-01 (Source Record card) | source_system_id, system_type, integration_mode, expected_latency, system_of_record_flag | SourceRecord stream health | PERSONA-002 |
| `SourceRecord` | **D-01 (anchor)**, S-08 (evidence row drill), N-09 (orphan list) | source_record_id, source_system_id, source_table_or_api, source_primary_key, payload_hash, event_timestamp, ingestion_timestamp, validation_status, correlation_status | linked PE / SE / EVD | PERSONA-003, PERSONA-002 |
| `CorrelationRecord` | **D-01 (Correlation Record card)**, N-09, S-08 (correlation warning chip) | correlation_id, primary_key_used, backup_key_used, match_method, match_confidence, expected_cardinality, actual_cardinality, correlation_status | from / to entities | PERSONA-002, PERSONA-003 |
| `ProcessExecution` | **S-07 (anchor PE list)**, S-06 lineage tab, D-01 spine | pe_id, process_id, anchor_key_value, status, variant_signature, control_instance_count, evidence_completeness | StepExecutions | Operations, PERSONA-002 |
| `StepExecution` | S-07 (Step funnel + drift cards), S-06 lineage tab, D-01 | step_execution_id, step_id, actual_actor_type, actual_system, start_ts, end_ts, skipped_step_flag, manual_override_flag, bpo_or_vendor_flag | source_record_ids; control_instance_ids | Operations |
| `ControlInstance` | **S-06 (anchor — Population grid)**, S-09 (results), S-05 (rolled into outcome split badges), S-10 (linked CIs on Issue) | control_instance_id, outcome, fire_ts, latency_ms, evidence_ids, exception_flag, override_reason | EvidenceRecord set; SourceRecord | PERSONA-002, PERSONA-003 |
| `EvidenceRecord` | **S-08 (anchor)**, S-06 (Evidence tab), D-01, S-13 (Evidence appendix) | evidence_id, evidence_type, source_system, payload_hash, evidence_completeness_score, freshness_days, retention_class, regulator-ready flags | SourceRecord; linked ControlInstance | PERSONA-003 |
| `Exception` | S-09 (Exception cluster), S-10 (Issue exceptions), S-06 (failed CI's exception) | exception_id, exception_type, severity, disposition, linked_issue_id | linked CI; linked Issue | PERSONA-003 |
| `Issue` | **S-10 (anchor)**, S-01 (watchlist), S-06 (Issues tab), S-04 (linked Issues on OBL), S-12 (SM accountable issues) | issue_id, title, severity, status, ageing days, accountable_senior_manager_id, root_cause, rbi_mra_flag, section_47a_exposure_flag | RemediationActions; linked CTRL / OBL / Risk; AI-010 cluster | All personas |
| `RemediationAction` | S-10 (Issue Detail Panel — Remediation tab), S-13 (Retest Closure Pack) | action_id, description, owner_id, due_date, status, retest_required, validation_status | retest TestExecution | PERSONA-003 |
| `SeniorManager` | **S-12 (anchor)**, S-01 (snapshot), S-10 (owner), S-06 (Control accountable SM) | senior_manager_id, name, role, function, accountable scope counts, SAES, last_attestation_date | DecisionEvents; AttestationEvents | PERSONA-001 |
| `DecisionEvent` | S-12 (timeline), D-01 (when CI / Issue cited a decision) | decision_id, decision_type, decision_maker_id, decision_timestamp, approval_basis | linked CI / Issue / Evidence | PERSONA-001 |
| `AttestationEvent` | S-12 (timeline), S-03 (pack composition) | attestation_id, attestation_type, attester_id, scope, period, evidence_ids | linked evidence | PERSONA-001 |
| `TestExecution` | **S-09 (anchor)**, S-13 (Workpaper assembly) | test_id, test_type, population_size, exception_count, result, rerunnable_flag, population_query_ref | exception list; Workpaper | PERSONA-003 |
| `Workpaper` | **S-13 (anchor)**, S-09 (export bar) | workpaper_id, status, sections, evidence_ids, reviewer_id, export readiness flags | linked TestExecution | PERSONA-003 |
| `AuditPack` | **S-03 (anchor)**, S-13 (anchor), S-01 (Inspection Snapshot) | audit_pack_id, scope_type, scope_id, target_audience, readiness_status, exported_at | included Workpapers + EvidenceRecords | PERSONA-001, PERSONA-002 |
| `AIInsight` | **S-11 (anchor)**, S-01 panel, S-04 chip, S-06 AI tab, S-09 (suggest), S-10 (cluster) | ai_insight_id, signal_id, signal_class, model_version, confidence, threshold, recommendation, human_approval_status, risk_if_wrong | source evidence; linked Issue | PERSONA-002 |
| `ReportingClock` | S-01 (top clocks strip), S-04 (on OBL with reporting_clock_id), S-06 (reporting strip), N-10 | clock_id, obligation_id, deadline_spec, target_system | ReportingSubmissions | PERSONA-002 |
| `ReportingSubmission` | S-01 strip, N-10 (Wave 2 full), S-13 (AuditPack) | submission_id, clock_id, submitted_at, ack_id, ack_at, status | EvidenceRecord (ack) | PERSONA-002 |
| `KRIObservation` | S-01 (KRI strip if persona-relevant), S-12 (SM dashboards) | observation_id, kri_id, value, band, as_of_ts | trend; linked Risk | PERSONA-001 |
| `AppetiteObservation` | S-01 | observation_id, metric, value, band, board_approval_ref | trend; linked Risk | PERSONA-001 |

---

## 11. Demo Storyline

Three storylines, each ~10–12 steps. Each opens with PERSONA-001, then crosses into PERSONA-002, ends in PERSONA-003. Sample IDs reused exactly from Pass 2 / Pass 3 — no detailed mock data here, only entity IDs and placeholders.

### 11.1 Storyline α — KYC / CKYCR Control Gap (UCIC-2024-00127, AI-016)

| # | Persona | Screen | Action | Outcome |
|---|---|---|---|---|
| 1 | PERSONA-001 (CRO) | S-01 Cockpit | Lands on Cockpit; sees R-FC tile newly Amber, week-over-week ▼ | Identifies emerging pressure on Financial Crime |
| 2 | PERSONA-001 | S-02 What Changed This Week | Reads delta card "CTRL-KYC-003 CES 89 → 83; AI-016 fired on 660 DBT/scholarship UCICs" | Recognises a cohort-level signal |
| 3 | PERSONA-001 | S-03 Inspection Readiness | Switches to "RBI AFI" lens; ARS dropped 2 points; gap "OBL-RBI-002 evidence-thin on DBT cohort" highlighted | Confirms inspection exposure |
| 4 | PERSONA-001 → PERSONA-002 | persona switcher | Hands off to CCO | — |
| 5 | PERSONA-002 (CCO) | S-04 Obligation Coverage Map | Filters regulator=RBI; selects OBL-RBI-002 (periodic re-KYC) | Coverage strength = "Adequate" but EIFS warning |
| 6 | PERSONA-002 | S-04 right panel | Sees CTRL-KYC-003 with CES 83 (Green); but linked AI-016 chip shows DBT cohort | CES is misleading without AI-016 — this is the Catch-Rate story |
| 7 | PERSONA-002 | S-11 AI Insights Review Queue | Opens AI-016 insight; reviews cited cohort UCIC list (660); accepts insight; auto-creates ISS-2026-AI016-001 | HITL gate satisfied |
| 8 | PERSONA-002 | S-10 Issue & Remediation Board | Routes ISS-2026-AI016-001 to Head of Retail Onboarding (1LoD); accountable SM = CCO | Remediation owner identified |
| 9 | PERSONA-002 → PERSONA-003 | persona switcher | Hands off to IA Manager for population test | — |
| 10 | PERSONA-003 (IA) | S-09 Population Testing Console | Selects CTRL-KYC-003; runs population test for March; exception cluster "DBT-cohort" surfaces with UCIC-2024-00127 as representative | Population test confirms 660 cohort UCICs |
| 11 | PERSONA-003 | S-08 Evidence Workbench (drilled from S-09) | Verifies UCIC-2024-00127 has EVD-LOG CKYCR ack at original onboarding but **no re-KYC schedule evidence** (Data Gap) | Distinguishes Data Gap from Control Failure correctly |
| 12 | PERSONA-003 | S-13 Workpaper Builder | AI-drafts workpaper citing AI-016, the 660 cohort, and UCIC-2024-00127 evidence; tester signs; reviewer signs; AuditPack mode adds it to RBI AFI / KYC theme | RBI-ready workpaper produced; ARS recovers |

### 11.2 Storyline β — AML Alert SLA / STR Risk (AML-ALRT-2024-00502, CTRL-AML-002 → CTRL-AML-003)

| # | Persona | Screen | Action | Outcome |
|---|---|---|---|---|
| 1 | PERSONA-001 (CRO) | S-01 Cockpit | R-FC tile pulses Red after a week; Reporting Clock strip shows STR clock at-risk | Material AML risk surfaced |
| 2 | PERSONA-001 | S-01 (drill from R-FC tile) | Opens domain detail; CTRL-AML-002 CES dropped 78 → 65 | Identifies degrading control |
| 3 | PERSONA-001 | S-06 Control Drill-Down — CTRL-AML-002 | Sees Operating Rate 79%, with 9 BD ageing on AML-ALRT-2024-00502 | Specific case visible |
| 4 | PERSONA-001 → PERSONA-002 | switcher | Hands off to MLRO / CCO | — |
| 5 | PERSONA-002 (MLRO) | S-06 Population grid | Drills into AML-ALRT-2024-00502; row shows L1 SLA breach; CTRL-AML-003 not yet evaluable | STR window at risk |
| 6 | PERSONA-002 | D-01 Source Lineage Drawer (from row click) | Sees BPO ticket BPO-AML-2024-11-08-2891 open at vendor VEND-2024-00203; CorrelationRecord shows correctly anchored but no L1_ACTION row | Root cause: BPO L1 capacity at VEND-00203 |
| 7 | PERSONA-002 | S-11 AI Insights Review Queue | Reviews AI-002 (process drift on STEP-AML-04) and AML-backlog insight; escalates to Head of FCC | Issue escalated |
| 8 | PERSONA-002 | S-10 Issue Board | Issue ISS-2026-009-extension created; severity High; section_47a_exposure_flag = "candidate" | RBI / PMLA s.13 risk surfaced |
| 9 | PERSONA-002 → PERSONA-003 | switcher | Hands off to concurrent auditor | — |
| 10 | PERSONA-003 | S-09 Population Testing Console | Runs population test on CTRL-AML-002 against all open L1 alerts > 5 BD; exception cluster shows VEND-00203 floor as concentration | Pattern documented |
| 11 | PERSONA-003 | S-13 Workpaper Builder | Generates workpaper; AuditPack mode adds to "PMLA / FIU Evidence Readiness" lens with OBL-PMLA-001 / OBL-PMLA-003 exposure | Inspection-ready evidence |
| 12 | PERSONA-001 (back) | S-01 + S-03 | After remediation (BPO SLA push API live), retest passes; CES recovers; ARS restored | Remediation cycle closes |

### 11.3 Storyline γ — Digital Lending KFS Timing Violation (DL-APP-2024-00884, AI-013, CTRL-LND-002)

| # | Persona | Screen | Action | Outcome |
|---|---|---|---|---|
| 1 | PERSONA-001 (CRO) | S-01 Cockpit | R-CD (Conduct) tile Amber; "What Changed" strip reads "ISS-2026-085 raised; 11,118 CTRL-LND-002 instances flagged" | Mass DSA-channel violation surfaced |
| 2 | PERSONA-001 | S-01 (drill R-CD) | Sees CTRL-LND-002 CES 89.51 *headline*; Operating Rate 74.77% (the meaningful number) | Recognises CES headline is misleading |
| 3 | PERSONA-001 → PERSONA-002 | switcher | Hands off to CCO | — |
| 4 | PERSONA-002 (CCO) | S-04 Obligation Coverage Map | Selects OBL-RBI-DL-001 (KFS pre-acceptance per Para 8 of `RBI/2025-26/36`); drill panel shows CTRL-LND-002 with the OperatingRate concern | OBL exposure confirmed |
| 5 | PERSONA-002 | S-06 Control Drill-Down — CTRL-LND-002 | CES Breakdown card decomposes: OperatingRate 74.77, CatchRate 100, EvidenceCompleteness 98 | Distinguishes "AI is catching it" from "operations is producing it" |
| 6 | PERSONA-002 | S-06 Population grid | Sorts by Fail outcome; clicks DL-APP-2024-00884 row | Drills to specific case |
| 7 | PERSONA-002 | D-01 Source Lineage Drawer | Sees `kfs_issued_at = 2024-12-15T11:08Z` AND `borrower_acceptance_at = 2024-12-15T10:55Z` (acceptance 13 min before KFS) — sequence violation; AI-013 chip confidence 0.97 | Bajaj Finance Nov-2023 archetype recognised |
| 8 | PERSONA-002 | S-11 AI Insights Review Queue | Opens AI-013 insight; reviews caveat about LOS clock drift; cross-checks NTP attestation absent; accepts insight | HITL gate satisfied |
| 9 | PERSONA-002 | S-10 Issue Board | ISS-2026-085 cluster swimlane shows "DSA-LOS-clock cluster"; routes RemediationAction to LOS engineering lead (CIO accountable SM) | Remediation kicked off |
| 10 | PERSONA-002 → PERSONA-003 | switcher | Hands off to IA Manager | — |
| 11 | PERSONA-003 | S-09 Population Testing Console | Runs CTRL-LND-002 population test for December; exception cluster confirms 11,118 cases concentrated in DSA channel | Population evidence built |
| 12 | PERSONA-003 | S-13 Workpaper / AuditPack Builder | Generates workpaper; adds to "RBI AFI" + "Statutory Audit" lenses with OBL-RBI-DL-001 + OBL-RBI-027 exposures; CIMS quarterly cluster reporting flagged | Inspection-ready pack assembled; product halt for DSA channel becomes evidenced decision |

---

## 12. MVP vs Future Scope

### 12.1 Prioritization Table

| Feature / screen | MVP P0 | MVP P1 | Wave 2 | Wave 3 | Reason |
|---|---|---|---|---|---|
| **S-01 Executive Risk Posture Cockpit** | ✓ | | | | The PERSONA-001 landing page; demo-critical |
| **S-02 What Changed This Week** | ✓ | | | | Required to make Cockpit decision-oriented |
| **S-03 Inspection Readiness / RBI Pack View** | ✓ | | | | Single most demoable screen for Indian bank stakeholders |
| **S-04 Obligation Coverage Map** | ✓ | | | | PERSONA-002 landing page |
| **S-05 Control Universe** | ✓ | | | | Replaces RCM spreadsheet |
| **S-06 Control Drill-Down** | ✓ | | | | Single most-used screen overall |
| **S-07 Process Health View** | | ✓ | | | Useful but not demo-critical for Wave 1 |
| **S-08 Evidence Workbench** | ✓ | | | | PERSONA-003's daily workspace |
| **S-09 Population Testing / Reperformance Console** | ✓ | | | | The differentiator vs legacy GRC |
| **S-10 Issue & Remediation Board** | ✓ | | | | Shared workspace; populated by all flows |
| **S-11 AI Insights Review Queue** | ✓ | | | | OUT-010 HITL gate; non-negotiable |
| **S-12 Senior Accountability Ledger** | | ✓ | | | OUT-005; demo-friendly but not landing-critical |
| **S-13 Workpaper / AuditPack Builder** | ✓ | | | | Closes the auditor flow |
| **D-01 Source Lineage Drawer** | ✓ | | | | Universal — every screen needs it |
| **N-09 Source Lineage page** *(extension of D-01)* | | ✓ | | | Page-level surface for orphan queue and source-system ops |
| **N-10 Reporting Clock Workspace** | | ✓ partial in S-01 | ✓ full | | Needs FIU-IND outbound + CIMS + CRILC integration |
| **W-01 UPI Fraud View** | | | ✓ | | Requires NPCI feed + AI-001 productionisation |
| **W-02 ITGRCA / Cyber View** | | | ✓ | | Requires ITSM + SIEM + CERT-In + DPDP integration |
| **W-04 Vendor / TPSP View** | | | | ✓ | Requires VMO / GRC integration |
| **W-05 Complaints / Internal Ombudsman View** | | | | ✓ | Requires CMS + IO workflow |
| **W-06 Telephony / Mis-selling Conduct View** | | | | ✓ | Requires Telephony / ASR |
| **W-07 Regulatory Change Inbox** | | | | ✓ | Built on AI-003 maturity + Regulation node corpus |

### 12.2 What MVP P0 deliberately omits

- **No Wave 2 / Wave 3 dashboards.** The roadmap is visible (greyed nav items), but no half-built screens.
- **No vanity charts.** No KPI walls; no "Top 10 risk score by branch" without drill-down.
- **No static RCM spreadsheet view.** S-05 is structured and graph-backed; export to spreadsheet is a *projection*, not the source.
- **No AI auto-action on regulator-facing decisions.** STR / FMR / RFA / CSITE / CERT-In are HITL-only.
- **No org-chart accountability.** S-12 is a decision-and-attestation workspace; not an HR view.
- **No multi-tenant / multi-archetype switcher.** Single bank context for the demo (MSPB).

### 12.3 Counts

- **MVP P0:** 10 real screens + 1 universal drawer + persona-anchor + 9 active nav items.
- **MVP P1:** 2 real screens (S-07, S-12) + N-09 page + N-10 partial.
- **Wave 2 (visible as inactive):** 2 (W-01 UPI, W-02 ITGRCA) + N-10 full + FIU-IND outbound integration.
- **Wave 3 (visible as inactive):** 4 (W-04 Vendor, W-05 Complaints, W-06 Telephony, W-07 Regulatory Change Inbox).

---

## 13. Final UX Handoff

### 13.1 What this UX blueprint enables next

| # | Next-pass artefact | Direct consumer of | Notes |
|---|---|---|---|
| 1 | **Mock data generation** | §10 Entity-to-Screen Binding + Pass 2 sample IDs (UCIC-2024-00123/00126/00127, AML-ALRT-2024-00501/00502/00505, DL-APP-2024-00881/00882/00884/00885) | Deterministic generator producing every entity's required fields and statuses to render the three demo storylines end-to-end |
| 2 | **Component-level UI specification** | §5 Shared Component Inventory | Per-component tokens, states, accessibility, motion specs (the design-system pass) |
| 3 | **Final JSX / React prototype** | §1 MVP Screen List + §4 Layout Blueprints + §10 Entity bindings | Built against mock data; embodies the §1.16 two-click drill rule and §7.2 AI UX rules |
| 4 | **Persona-specific dashboards** | §3 Persona Hierarchy + §4 layouts of S-01 / S-04 / S-09 | Three landing pages, each tested against the persona-question table |
| 5 | **Drill-down drawer design** | §4.14 D-01 spec + §5 #6 Source Lineage Timeline | Universal overlay attached to every screen via right edge |
| 6 | **Evidence chain visual design** | §5 #6 + Pass 3 §4.14 EvidenceRecord fields | Hash-stamped visualisation; readiness-flag chips; immutable export styling |
| 7 | **Workpaper / AuditPack artefact design** | §9 Required Sections | Document templates + export formats (PDF + structured CSV + JSON) |
| 8 | **AI insight interaction design** | §7 + §5 #14, #15 | Insight Card states (pending / accepted / rejected / escalated / overridden); Model & MRR snapshot; HITL micro-interactions |
| 9 | **Source-system lineage visualization** | §4.14 D-01 + §1.2 N-09 + §5 #18 | Source-System Health Badge, Orphan Queue surface, schema-version timeline |
| 10 | **Design QA checklist** | All 13 sections | Two-click drill check; evidence-citation check on every metric; AI-citation check; outcome-badge distinctness check; OUT-005 / OUT-006 / OUT-007 / OUT-010 satisfaction check; India-only language check |

### 13.2 Final Summary

**MVP screens (10 P0 + 2 P1):**
S-01 Executive Risk Posture Cockpit | S-02 What Changed This Week | S-03 Inspection Readiness / RBI Pack View | S-04 Obligation Coverage Map | S-05 Control Universe | S-06 Control Drill-Down | S-07 Process Health View *(P1)* | S-08 Evidence Workbench | S-09 Population Testing / Reperformance Console | S-10 Issue & Remediation Board | S-11 AI Insights Review Queue | S-12 Senior Accountability Ledger *(P1)* | S-13 Workpaper / AuditPack Builder | + D-01 Source Lineage Drawer (universal).

**Main navigation (9 active):** Risk Posture | Inspection Packs | Obligations & Controls | Processes | Testing & Evidence | Issues & Remediation | AI Insights | Accountability | Source Lineage. Plus 5 inactive (Wave 2 / Wave 3) for roadmap visibility.

**Persona hierarchy:** PERSONA-001 lands on S-01 Cockpit; PERSONA-002 lands on S-04 OCM; PERSONA-003 lands on S-09 Population Testing Console; Operations lands on S-07. Each persona has 4–5 secondary screens and a defined main drill-down path (§3.1).

**Core drill-down flows (10 mandatory, all 2-click to evidence):** F-01 Risk Posture → Evidence; F-02 Obligation Coverage → Source Records; F-03 Control Universe → Evidence; F-04 Process Health → Exception; F-05 Issue Board → Retest Workpaper; F-06 Population Testing → AuditPack; F-07 AI Insight → Issue; F-08 Senior Accountability → Evidence; F-09 Inspection Pack → Source-System Owner; F-10 Reporting Clock → Issue.

**Evidence-first UX decisions:** every metric has a one-click descent to ControlInstance / EvidenceRecord and a two-click descent to SourceRecord; D-01 Lineage Drawer is universal; Pass / Fail / Data Gap / Evidence Gap / Correlation Warning / Needs Review badges are five visually-distinct labels; Control Universe replaces the RCM spreadsheet; Inspection Readiness is live-state, never an export button.

**AI UX rules:** (i) every Insight cites source evidence; (ii) every Insight shows model_version + confidence + threshold; (iii) AI never auto-files regulator-facing submissions; (iv) HITL is the default for STR / FMR / RFA / CERT-In / CSITE / CIMS-CCO certification; (v) AI Insights are graph nodes — accept / reject / escalate / override; (vi) when AITES < 85, AI auto-creation of Issues is disabled until remediated; (vii) Model & MRR snapshot is always one click from any Insight.

**Inspection readiness UX:** seven inspection lenses (RBI AFI / RBS-SPARC / PMLA-FIU / ITGRCA-CSITE-CERT-In / Concurrent / Statutory / Board) shipped as pre-staged AuditPack templates; ARS recomputes live; gap-routing actions land users in the screen that resolves the gap; exports are hash-stamped immutable artefacts.

**Recommended next pass:** **UI Pass 5 — Mock Data + Frontend Prototype**. Deterministic mock data for every entity in §10 keyed off Pass 2 sample IDs; component-level UI specification tokens for the 20 shared components in §5; the three demo storylines (α, β, γ in §11) fully renderable; JSX prototype implementing the 10 P0 screens + D-01 drawer with full two-click drill-down to mock SourceRecord nodes — built strictly against this blueprint, not against a fresh interpretation. Once Pass 5 lands, Wave 1 production build begins against CBS / LOS / AML engine / Sanctions / Case Mgmt / CKYCR connectors per Pass 3 §13 handoff.
