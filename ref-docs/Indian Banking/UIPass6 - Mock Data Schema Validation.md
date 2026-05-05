# Mock Data Schema Validation — IndianBankingAudit Pass 6

*Pass 6 — Pre-Implementation Schema Validation for `mockIndianBankingAuditData.js`*
*Authored by: Senior Frontend Data Architect | Schema Validation Lead | Cut-off: April 2026*

> Validate Pass 5's 42-dataset schema against (a) the Pass 4 UX blueprint screens, (b) the four canonical demo storylines, (c) the universal `DetailDrawer` + `EvidenceChainDrawer` routing, and (d) the nine end-to-end FK paths. This pass produces a **gap list and a Go/No-Go decision**, not new design and not data values.

---

## 1. Schema Readiness Summary

| Dimension | Status | Notes |
|---|---|---|
| **Dataset coverage** | ✅ All 42 datasets present | every dataset listed in the user spec is in Pass 5 §4.1 |
| **End-to-end FK paths (9 paths)** | ⚠ 8 of 9 fully connected; 1 path has a missing field | `Process → ProcessExecution → StepExecution → ControlInstance` has no `step_execution_id` field on `ControlInstance` |
| **Demo storyline coverage (4 storylines)** | ⚠ All four supported in principle; 5 schema additions required | population/exception counts, late-arriving CR status, KFS timing fields, RBI AFI lens scoring fields all need explicit field-level confirmation |
| **DetailDrawer entity routing (23 types)** | ⚠ 21 of 23 covered in Pass 5 §2.4 | `ExceptionDetailContent` and `SourceSystemDetailContent` are missing from the routing map |
| **EvidenceChainDrawer lineage spine** | ✅ All 10 spine nodes addressable | `Reg → Obl → Risk → Ctrl → PE → SE → CI → EVD → SR → CR` all renderable |
| **Indian banking concept fidelity** | ✅ Preserved | RBI AFI/RBS/SPARC, PMLA Rule 9, FIU-IND, CKYCR, AML SLA/STR clock, KFS timing, CBS/LOS/AML/CKYCR lineage all wired |
| **Sample-ID alignment with Pass 2 / Pass 4** | ✅ Confirmed | UCIC-2024-00123/00126/00127, AML-ALRT-2024-00501/00502/00505, DL-APP-2024-00881/00882/00884/00885, VEND-2024-00202/00203/00205 all reused |
| **Final readiness** | ⚠ **Conditional Go** | proceed to mock data creation **after** the 11 schema fixes in §6 are applied |

---

## 2. Dataset Validation Table

Legend — Status: ✅ ready · ⚠ ready with field additions · ❌ blocking gap.

| # | Dataset | Required by screens | Pass 5 schema present | FK reach | Status | Notes |
|---|---|---|---|---|---|---|
| 1 | `personas` | TopBar, MainNavigation | yes | — | ✅ | 4 records |
| 2 | `navigationItems` | MainNavigation | yes | → screens | ✅ | 15 records (9 active + 5 inactive + reporting clocks partial) |
| 3 | `screens` | ScreenContainer | yes | → personas, metrics | ✅ | 14 + 1 |
| 4 | `metrics` | every screen | yes | — | ✅ | 10 |
| 5 | `riskDomains` | S-01, S-05 | yes | ← risks | ✅ | 9 |
| 6 | `risks` | S-01, S-12, S-06, S-04 | yes | → SM, KRI, AppetiteMetric, OBL, CTRL | ✅ | 9 |
| 7 | `regulations` | S-04, S-03, D-01 | yes | ← obligations | ✅ | 8 |
| 8 | `obligations` | S-04, S-03, S-06 | yes | → regulations, reportingClocks, controls, SM | ✅ | 12 |
| 9 | `controls` | S-05, S-06, S-09, S-10 | yes | → processes, SM, OBL, Risk | ✅ | 12 |
| 10 | `processes` | S-07, S-04, S-06 | yes | → regulations | ⚠ | add `linked_obligation_ids[]` for S-04 reverse-traversal (currently only `regulatory_anchor_ids[]`) |
| 11 | `processSteps` | S-07, S-06 | yes | → processes | ✅ | ~50 |
| 12 | `activities` | S-07 (drill), D-01 | yes | → processSteps | ✅ | ~80 |
| 13 | `sourceSystems` | TopBar, S-08, N-09, D-01 | yes | ← sourceRecords | ✅ | 6 Wave-1 + 4 Wave-2 placeholders |
| 14 | `sourceRecords` | S-08, N-09, D-01 | yes | → sourceSystems, ↔ correlationRecords, ↔ controlInstances, ↔ evidenceRecords | ✅ | ~30 |
| 15 | `correlationRecords` | N-09, S-08, D-01, EvidenceChainDrawer | yes | → from/to entities | ✅ | ~40 |
| 16 | `processExecutions` | S-07, S-06 lineage, D-01 | yes | → processes, ← controlInstances | ✅ | 12 |
| 17 | `stepExecutions` | S-07, S-06 lineage, D-01 | yes | → processExecutions, → processSteps, → sourceRecords | ✅ | ~80 |
| 18 | `controlInstances` | S-06 (anchor), S-09, S-10, D-01 | yes | → controls, → processExecutions, → evidenceRecords, → exceptions | ⚠ | **add `step_execution_id` (nullable)** to close the `Process → SE → CI` path |
| 19 | `evidenceRecords` | S-08, S-06 Evidence, D-01, S-13 | yes | → sourceSystems, → sourceRecords, ← controlInstances | ⚠ | **add `evidence_status` enum** (Complete / Partial / Missing / Late / InvalidHash / Orphaned / NA / BPO-Pending) — currently only has numeric score |
| 20 | `exceptions` | S-09, S-10, D-01 | yes | → controlInstances, → rootCauseClusters, → issues | ⚠ | needs explicit `subject_id` (UCIC / alert_id / loan_app_id / vendor_id) for cluster rendering |
| 21 | `issues` | S-10, S-01, S-06, D-01 | yes | → SM, → CTRL, → OBL, → Risk, → RA, → AIInsight | ✅ | 6+ (must include ISS-2026-009, 027, 061, 085) |
| 22 | `remediationActions` | S-10, D-01 | yes | → issues, → testExecutions | ✅ | 8 |
| 23 | `seniorManagers` | S-12, S-01, S-06 | yes | → risks, → controls, → obligations, → processes | ✅ | 8–10 |
| 24 | `decisionEvents` | S-12, D-01 | yes | → SM, → evidenceRecords, → linked entity | ✅ | 15 |
| 25 | `attestationEvents` | S-12, S-03 | yes | → SM, → evidenceRecords | ✅ | 10 |
| 26 | `testExecutions` | S-09, S-13, D-01 | yes | → controls, → exceptions, → evidenceRecords, → workpapers | ⚠ | confirm `population_size`, `tested_count`, `exception_count` are integers (Story 1 needs `1247 / 1247 / 47`) |
| 27 | `workpapers` | S-13, S-09, S-03, D-01 | yes | → controls, → OBL, → testExecutions, → evidenceRecords, → SM | ⚠ | **add `signed_at` and `reviewer_signed_at`** timestamps for sign-off rendering |
| 28 | `auditPacks` | S-03, S-13, S-01, D-01 | yes | → workpapers, → evidenceRecords, → issues, → attestationEvents | ⚠ | **add `included_decision_event_ids[]`** for board/SPARC packs that cite decisions |
| 29 | `aiInsights` | S-11, S-06 AI, S-01, S-09, S-10 | yes | → models, → evidenceRecords, → sourceRecords, → controls, → OBL, → issues | ✅ | 12 |
| 30 | `models` | S-11 | yes | ← modelRiskRecords | ✅ | 6 |
| 31 | `modelRiskRecords` | S-11 (Model+MRR strip) | yes | → models, → SM | ✅ | 6 |
| 32 | `reportingClocks` | S-01, S-04, S-06, N-10 | yes | → obligations | ✅ | 8 |
| 33 | `reportingSubmissions` | S-01, N-10, S-13 | yes | → reportingClocks, → evidenceRecords (ack) | ✅ | 12 |
| 34 | `kris` | S-01, S-12 | yes | → risks | ✅ | 9 |
| 35 | `kriObservations` | S-01, S-12 | yes | → kris | ✅ | ~20 |
| 36 | `appetiteMetrics` | S-01 | yes | → risks | ✅ | 9 |
| 37 | `appetiteObservations` | S-01 | yes | → appetiteMetrics | ✅ | ~20 |
| 38 | `rootCauseClusters` | S-10 swimlanes | yes | → issues, → controls, → processes, → AIInsight | ⚠ | **add `recommended_remediation_action_ids[]`** so cluster→remediation is one-click |
| 39 | `auditTrailEvents` | D-01, AuditTrailPanel | yes | → any entity | ⚠ | **add `actor_role` and `before_value / after_value` (or payload_diff)** for tamper-evident reconstructibility (PMLA Rule 9) |
| 40 | `inspectionLenses` | S-03 | yes | → obligations, → controls | ✅ | 7 |
| 41 | `sourceSystemHealth` | TopBar, N-09 | yes | → sourceSystems | ✅ | 6 |
| 42 | `demoStorylines` | DemoGuidedTourOverlay | yes | → screens, → personas, → entity refs | ✅ | 5 |

---

## 3. Relationship Validation Table

The nine FK paths the platform must support end-to-end.

| # | FK path | All steps connectable? | Field-level evidence | Verdict |
|---|---|---|---|---|
| **R-1** | `Risk → Control → ControlInstance → EvidenceRecord → SourceRecord` | yes | `risks.linked_control_ids[]` → `controls.control_id` → `controlInstances.control_id` → `controlInstances.evidence_ids[]` → `evidenceRecords.source_record_id` → `sourceRecords.source_system_id` | ✅ |
| **R-2** | `Obligation → Control → EvidenceRecord` | yes | `obligations.linked_control_ids[]` → `controls.control_id` → (via CI evidence_ids[]) → `evidenceRecords` | ✅ |
| **R-3** | `Process → ProcessExecution → StepExecution → ControlInstance` | **partial** | `processes.process_id` → `processExecutions.process_id` → `stepExecutions.process_execution_id` → ❌ no `controlInstances.step_execution_id` field | ⚠ **fix in §6** |
| **R-4** | `Issue → RemediationAction → TestExecution → Workpaper` | yes | `issues.linked_remediation_ids[]` → `remediationActions.issue_id` + `retest_test_execution_id?` → `testExecutions.linked_workpaper_id?` → `workpapers.test_execution_id` | ✅ |
| **R-5** | `Workpaper → AuditPack` | yes | `auditPacks.included_workpaper_ids[]` ← `workpapers.workpaper_id` | ✅ |
| **R-6** | `AIInsight → EvidenceRecord → SourceRecord` | yes | `aiInsights.cited_evidence_ids[]` → `evidenceRecords.source_record_id` → `sourceRecords.source_system_id`; AIInsight also has `cited_source_record_ids[]` for direct SR citation | ✅ |
| **R-7** | `SeniorManager → Issue / DecisionEvent / AttestationEvent` | yes | `issues.accountable_senior_manager_id`; `decisionEvents.decision_maker_id`; `attestationEvents.attester_id`; `seniorManagers.accountable_*[]` for forward traversal | ✅ |
| **R-8** | `ReportingClock → ReportingSubmission → EvidenceRecord` | yes | `reportingSubmissions.clock_id` → `reportingClocks.clock_id`; `reportingSubmissions.evidence_id_for_ack?` → `evidenceRecords.evidence_id` | ✅ |
| **R-9** | `SourceRecord → CorrelationRecord → EvidenceRecord` | yes | `correlationRecords.from_entity_type/id` and `to_entity_type/id` reference both `sourceRecords` and downstream `controlInstances` / `evidenceRecords`; `evidenceRecords.source_record_id` closes the chain | ✅ |

> **Net: 8 of 9 paths fully field-level connectable; R-3 needs `step_execution_id` on `controlInstances`.**

---

## 4. Demo Story Coverage Check

### 4.1 Story 1 — AML alert SLA / STR risk

| Storyline element | Required dataset(s) | Required fields | Schema OK? | Action |
|---|---|---|---|---|
| R-FC-001 deteriorating | `risks`, `kriObservations`, `appetiteObservations` | `risk_id=R-FC-001`, residual_rating trending, KRI band amber→red | ✅ | — |
| CTRL-AML-002 weak EvidenceCompleteness | `controls`, `controlInstances`, `evidenceRecords` | `controls.ces_breakdown.evidence_completeness` low; CI rows with `outcome=EvidenceGap` | ⚠ | needs `evidence_status` enum on EvidenceRecord (§6 Gap 4) |
| AML-ALRT-2024-00502 SLA breach | `processExecutions`, `stepExecutions`, `controlInstances` | `PE-AML-AML-ALRT-2024-00502` with status `l1_overdue`; CI for CTRL-AML-002 with `outcome=Fail`, `fail_reason=L1_SLA_BREACH` | ✅ | — |
| ISS-2026-009 linked | `issues` | `issue_id=ISS-2026-009`, `linked_control_ids=[CTRL-AML-002]`, severity=High, ageing>5d | ✅ | — |
| Population = 1247 / Exceptions = 47 | `testExecutions` | `population_size=1247`, `tested_count=1247`, `exception_count=47`, `result=Failed` | ✅ | confirm integers (§2 row 26) |
| Workpaper generated | `workpapers` | `WP-{n}` with sections, signed_at, reviewer_signed_at | ⚠ | needs `signed_at`/`reviewer_signed_at` (§6 Gap 7) |
| Evidence in RBI AFI / PMLA / FIU AuditPack | `auditPacks` | `target_audience` ∈ {rbi_afi, pmla_fiu}; `included_workpaper_ids[]` contains the WP | ✅ | — |
| Root cause = BPO/capacity backlog | `rootCauseClusters` | cluster `BPO-AML-L1-SLA cluster` with `member_issue_ids=[ISS-2026-009]` | ⚠ | add `recommended_remediation_action_ids[]` (§6 Gap 6) |
| AI-018 effectiveness decay | `aiInsights`, `models`, `modelRiskRecords` | signal_id=AI-018, linked CTRL=CTRL-AML-002, cited evidence | ✅ | — |
| Reporting clock STR-7BD at risk | `reportingClocks`, `reportingSubmissions` | RC-STR-7BD with status=at_risk; latest RS pending | ✅ | — |

**Story 1 coverage: ⚠ supported with 4 schema additions.**

### 4.2 Story 2 — KYC / CKYCR evidence gap

| Storyline element | Required dataset(s) | Required fields | Schema OK? | Action |
|---|---|---|---|---|
| CTRL-KYC-003 CKYCR delay | `controls`, `controlInstances` | CTRL-KYC-003; CI with `outcome=EvidenceGap` (NOT `Fail`) | ⚠ | requires `evidence_status` enum + clear distinction in `controlInstances.outcome` |
| UCIC-2024-00127 affected | `processExecutions` | `PE-KYC-UCIC-2024-00127` with `anchor_key_value=UCIC-2024-00127` | ✅ | — |
| Evidence Gap ≠ Control Failure (visual distinction) | `controlInstances`, `evidenceRecords` | both `outcome` and `evidence_status` must distinguish; OutcomeBadge must render purple/amber separately | ⚠ | §6 Gap 4 |
| Late or missing CKYCR SourceRecord | `sourceRecords`, `correlationRecords` | SR-CKYCR-* with `validation_status=late_arriving` OR missing entirely; CR with `correlation_status=late_arriving` | ✅ | — |
| Auditor raises evidence-gap issue | `issues` | new `issue_id=ISS-2026-AI016-001`, `root_cause=cohort_evidence_gap` | ✅ | — |
| Workpaper added to RBI AFI KYC pack | `workpapers`, `auditPacks` | WP signed; AP-RBI-AFI-2026-Q1 with KYC theme; `included_workpaper_ids[]` updated | ✅ | — |
| AI-016 cohort signal | `aiInsights` | signal_id=AI-016 (CKYCR cohort delay), cited UCIC list incl. UCIC-2024-00127 | ✅ | — |

**Story 2 coverage: ⚠ supported with 1 critical schema addition (evidence_status enum).**

### 4.3 Story 3 — Digital Lending KFS timing violation

| Storyline element | Required dataset(s) | Required fields | Schema OK? | Action |
|---|---|---|---|---|
| CTRL-LND-002 detects KFS-after-acceptance | `controls`, `controlInstances` | CTRL-LND-002; CI for DL-APP-2024-00884 with `outcome=Fail`, `fail_reason=KFS_AFTER_ACCEPTANCE` | ✅ | — |
| DL-APP-2024-00884 affected | `processExecutions` | `PE-LND-DL-APP-2024-00884` | ✅ | — |
| LOS event stream shows kfs_issued_at > borrower_acceptance_at | `sourceRecords` | two SR rows: `EV-LOG-KFS-EVT` and `EV-LOG-BACC-EVT` with `event_timestamp` showing reversal; `key_fields_preview` exposing both timestamps | ✅ | confirm `key_fields_preview` field is present |
| AIInsight detects timing violation | `aiInsights` | AI-013 with `linked_control_ids=[CTRL-LND-002]`, cited EVD/SR | ✅ | — |
| ISS-2026-085 linked | `issues` | linked to CTRL-LND-002 + AI-013; cluster `DSA-LOS-clock cluster` | ✅ | — |
| Remediation action assigned | `remediationActions` | RA with `issue_id=ISS-2026-085`, owner=CIO accountable SM, `retest_required=true` | ✅ | — |
| Retest workpaper generated | `testExecutions`, `workpapers` | TestExecution with `test_type=retest`, linked WP | ⚠ | needs `signed_at`/`reviewer_signed_at` (§6 Gap 7) |

**Story 3 coverage: ⚠ supported with sign-off timestamps addition.**

### 4.4 Story 4 — Inspection Readiness

| Storyline element | Required dataset(s) | Required fields | Schema OK? | Action |
|---|---|---|---|---|
| RBI AFI readiness amber | `auditPacks`, `inspectionLenses` | AP-RBI-AFI-2026-Q1 with `readiness_status=amber`, `ars` numeric | ✅ | — |
| Missing evidence visible | `evidenceRecords`, `auditPacks` | EVD with `evidence_status=Missing`; pack composition shows missing rows | ⚠ | §6 Gap 4 (evidence_status enum) |
| Stale evidence visible | `evidenceRecords` | `freshness_days > SLA` per evidence_type | ✅ | — |
| Open issues visible | `issues`, `auditPacks` | `included_issue_ids[]` populated | ✅ | — |
| Evidence chain opens | `correlationRecords`, `sourceRecords`, `auditTrailEvents` | EvidenceChainDrawer renders full spine | ⚠ | §6 Gap 5 (audit_trail before/after) |
| Workpaper added to AuditPack | `auditPacks` | `included_workpaper_ids[]` mutable in demo state | ✅ | — |
| Readiness improves | `auditPacks`, helpers | `ars` recomputes after additions | ✅ | helper-driven; no schema change |

**Story 4 coverage: ⚠ supported with 2 schema additions.**

---

## 5. Drawer Compatibility Check

### 5.1 `DetailDrawer` — entity-type routing coverage

| # | `entityType` value | DetailContent component (Pass 5 §2.4) | Schema sufficient to render? | Status |
|---|---|---|---|---|
| 1 | `risk` | `RiskDetailContent` | yes | ✅ |
| 2 | `obligation` | `ObligationDetailContent` | yes | ✅ |
| 3 | `control` | `ControlDetailContent` | yes | ✅ |
| 4 | `process` | `ProcessDetailContent` | yes (with §6 Gap 1: `linked_obligation_ids[]`) | ⚠ |
| 5 | `processExecution` | `ProcessExecutionDetailContent` | yes | ✅ |
| 6 | `stepExecution` | `StepExecutionDetailContent` | yes | ✅ |
| 7 | `controlInstance` | `ControlInstanceDetailContent` | yes (with §6 Gap 2: `step_execution_id`) | ⚠ |
| 8 | `evidenceRecord` | `EvidenceDetailContent` | yes (with §6 Gap 4: `evidence_status` enum) | ⚠ |
| 9 | `sourceRecord` | `SourceRecordDetailContent` | yes | ✅ |
| 10 | `correlationRecord` | `CorrelationRecordDetailContent` | yes | ✅ |
| 11 | `exception` | ❌ **missing — no `ExceptionDetailContent`** | n/a | ❌ |
| 12 | `issue` | `IssueDetailContent` | yes | ✅ |
| 13 | `remediationAction` | `RemediationActionDetailContent` | yes | ✅ |
| 14 | `seniorManager` | `SeniorManagerDetailContent` | yes | ✅ |
| 15 | `decisionEvent` | `DecisionEventDetailContent` | yes | ✅ |
| 16 | `attestationEvent` | `AttestationEventDetailContent` | yes | ✅ |
| 17 | `testExecution` | `TestExecutionDetailContent` | yes | ✅ |
| 18 | `workpaper` | `WorkpaperDetailContent` | yes (with §6 Gap 7: sign-off timestamps) | ⚠ |
| 19 | `auditPack` | `AuditPackDetailContent` | yes (with §6 Gap 8: decision_event includes) | ⚠ |
| 20 | `aiInsight` | `AIInsightDetailContent` | yes | ✅ |
| 21 | `reportingClock` | `ReportingClockDetailContent` | yes | ✅ |
| 22 | `reportingSubmission` | `ReportingSubmissionDetailContent` | yes | ✅ |
| 23 | `sourceSystem` | ❌ **missing — no `SourceSystemDetailContent`** | n/a | ❌ |

> **2 of 23 entity types have no DetailContent routing in Pass 5 §2.4.** See §6 Gap 9 and Gap 10.

### 5.2 `EvidenceChainDrawer` — lineage spine coverage

The lineage spine is `Regulation → Obligation → Risk → Control → ProcessExecution → StepExecution → ControlInstance → EvidenceRecord → SourceRecord → CorrelationRecord`. The drawer must render each node with: entity ID, type, status badge, timestamp, source system (where relevant), payload hash, match confidence, correlation status, chain-of-custody, readiness flags, audit-trail summary.

| Spine node | Datasets needed | Required fields exist? | Status |
|---|---|---|---|
| Regulation | `regulations` | `regulation_id, title, regulator, citation, version, effective_from` | ✅ |
| Obligation | `obligations` | `obligation_id, atomic_requirement, regulator, citation, applicability, reporting_clock_id?` | ✅ |
| Risk | `risks` | `risk_id, domain_id, inherent_rating, residual_rating, accountable_SM` | ✅ |
| Control | `controls` | `control_id, title, ces_breakdown, owner_role, accountable_SM, designed_condition` | ✅ |
| ProcessExecution | `processExecutions` | `process_execution_id, anchor_key_value, status, started_at, closed_at` | ✅ |
| StepExecution | `stepExecutions` | `step_execution_id, actual_actor_type, actual_system, start_ts, end_ts, skipped_step_flag` | ✅ |
| ControlInstance | `controlInstances` | `control_instance_id, outcome, fire_ts, evidence_ids[], exception_id?, fail_reason?, evidence_gap_reason?` | ⚠ missing `step_execution_id` |
| EvidenceRecord | `evidenceRecords` | `evidence_id, evidence_type, source_system_id, source_record_id, payload_hash, evidence_completeness_score, freshness_days, retention_class, regulator_ready_flags{}` | ⚠ missing `evidence_status` enum |
| SourceRecord | `sourceRecords` | `source_record_id, source_system_id, source_table_or_api, source_primary_key, payload_hash, event_timestamp, ingestion_timestamp, validation_status, correlation_status, key_fields_preview{}` | ✅ |
| CorrelationRecord | `correlationRecords` | `correlation_id, from/to entity, primary_key_used, backup_key_used, match_method, match_confidence, expected_cardinality, actual_cardinality, correlation_status` | ✅ |
| Audit Trail (cross-cutting) | `auditTrailEvents` | `system_time, valid_time, actor_id, payload_summary, content_hash` | ⚠ missing `actor_role`, `before_value/after_value` (or payload_diff) |

---

## 6. Missing Fields / Schema Gaps

| Gap # | Gap | Why it matters | Impacted screen / drawer | Fix (field-level addition) |
|---|---|---|---|---|
| **Gap 1** | `processes` lacks `linked_obligation_ids[]` | S-04 → S-07 reverse traversal (which obligations does this process serve?) needs explicit array; `regulatory_anchor_ids[]` is a different concept | S-04, S-07, ProcessDetailContent | Add `linked_obligation_ids[]` to `processes` |
| **Gap 2** | `controlInstances` lacks `step_execution_id` | Closes FK path R-3 (`Process → PE → SE → CI`) at field level; allows S-07 step funnel to drill into control evaluations | S-07, S-06 lineage tab, D-01 EvidenceChainDrawer | Add nullable `step_execution_id` to `controlInstances` |
| **Gap 3** | `controlInstances.outcome` enum needs strict 6-value scheme | Pass 4 mandates 5 outcomes + NA; the schema lists "Pass / Fail / DataGap / EvidenceGap / NeedsReview / NA" but it's prose, not declared as a closed enum | S-06 population grid, S-09 results, OutcomeBadge | Declare enum `outcome ∈ {Pass, Fail, DataGap, EvidenceGap, NeedsReview, NotApplicable}` and require `fail_reason` / `data_gap_reason` / `evidence_gap_reason` to be set when outcome is the matching value (mutually exclusive) |
| **Gap 4** | `evidenceRecords` lacks `evidence_status` enum | UI must distinguish Complete / Partial / Missing / Late / InvalidHash / Orphaned / NA / BPO-Pending visually; `evidence_completeness_score` (numeric 0–100) is insufficient for the badge logic | S-08 strip, S-06 Evidence tab, EvidenceProvenancePanel, AuditPack composition | Add `evidence_status ∈ {Complete, Partial, Missing, Late, InvalidHash, Orphaned, NotApplicable, BPOPending}` |
| **Gap 5** | `auditTrailEvents` lacks `actor_role` and `before_value / after_value` | PMLA Rule 9 reconstructibility ("who changed what, when") requires field-level diffs and actor role; `payload_summary` is too coarse | D-01, AuditTrailPanel, Story 4 (inspection-readiness drill) | Add `actor_role` + `payload_diff{before, after, fields[]}` |
| **Gap 6** | `rootCauseClusters` lacks `recommended_remediation_action_ids[]` | S-10 swimlanes need to suggest remediation directly from cluster (Pass 4 §11 storyline α/β/γ all rely on this); without it, the cluster-to-remediation hop requires a manual lookup | S-10, IssueDetailRightPanel | Add `recommended_remediation_action_ids[]` |
| **Gap 7** | `workpapers` lacks `signed_at` and `reviewer_signed_at` | S-13 must render sign-off state; `status='signed'` alone is insufficient for the chain-of-custody and reviewer-overdue logic | S-13, WorkpaperStatusCard, AuditPack composition | Add `signed_at`, `reviewer_signed_at`, `signed_by_id`, `reviewed_by_id` (the `reviewer_id` and `tester_id` already exist; only timestamps missing) |
| **Gap 8** | `auditPacks` lacks `included_decision_event_ids[]` and `included_attestation_ids[]` is single-purpose | Board / SPARC packs cite specific DecisionEvents; the inspection-pack composition tree can't reach DecisionEvents without this | S-03 PackCompositionTree, S-13 AuditPack mode | Add `included_decision_event_ids[]`; confirm `included_attestation_ids[]` exists (it does) |
| **Gap 9** | No `ExceptionDetailContent` mapped in drawer routing | Click on a row in S-09 or S-10 of `exception` type would crash the drawer; routing map is missing this entity | S-09, S-10, DetailDrawer | Add `ExceptionDetailContent` to Pass 5 §2.4 routing map (sections: outcome + reason, linked CI, linked Issue, linked Cluster, evidence) |
| **Gap 10** | No `SourceSystemDetailContent` mapped in drawer routing | Click on a `SourceSystemHealthBadge` (TopBar) or a row in N-09 of `sourceSystem` type has no drawer renderer | TopBar, N-09 SourceLineagePage, DetailDrawer | Add `SourceSystemDetailContent` (sections: system status, ingestion lag, schema version, orphan count, recent SR sample, downstream consumers) |
| **Gap 11** | `correlationRecords.correlation_status` enum needs strict 7-value scheme matching Pass 2 §12 | UI must render Correlation Warning sub-types (timestamp_reversal, schema_mismatch, late_arriving, orphan, ambiguous_n_to_1, ambiguous_1_to_n) with distinct visuals | EvidenceChainDrawer, N-09 CorrelationWarningTable, S-08 strip | Declare enum `correlation_status ∈ {matched, timestamp_reversal, schema_mismatch, late_arriving, orphan, ambiguous_n_to_1, ambiguous_1_to_n}` (Pass 5 §4.1 row 15 lists these in prose; lock as an enum) |

> All gaps are **field-level additions** to existing datasets or **routing-map additions** in Pass 5 §2.4. **No new datasets are required.**

---

## 7. Final Mock Data Contract

After applying the 11 fixes in §6, the contract for `mockIndianBankingAuditData.js` is:

### 7.1 File-level contract

| Item | Value |
|---|---|
| Filename | `mockIndianBankingAuditData.js` |
| Export | `export const mockData = { …42 datasets… };` |
| Imports | none (pure data) |
| Determinism | every run yields identical object identity by ID; no `Math.random()`, no `Date.now()` |
| ID stability | every record keyed by a unique stable string ID listed in Pass 5 §4.1 sample-ID columns |
| Cross-references | by ID only — no nested entity copies |
| Storyline coverage | five storylines (`kycCkycrGap`, `amlAlertSlaStrRisk`, `digitalLendingKfsViolation`, `inspectionReadinessPack`, `populationTestingToWorkpaper`) must each have **at least one complete data path** without orphan references |
| Sample IDs | exactly the canonical IDs from Pass 2 / Pass 4: UCIC-2024-00123/00126/00127, AML-ALRT-2024-00501/00502/00505, DL-APP-2024-00881/00882/00884/00885, VEND-2024-00202/00203/00205 |
| Issues | must include ISS-2026-009, ISS-2026-027, ISS-2026-061, ISS-2026-085 |
| Risks | must include R-FC-001, R-CD-001, R-OP-001, R-TC-001 |
| Controls | CTRL-KYC-001..008, CTRL-LND-002, CTRL-AML-002, CTRL-AML-003, CTRL-UPI-001, CTRL-VND-001, CTRL-ITO-001 (others optional but recommended) |
| AI Signals | must include AI-001, AI-002, AI-003, AI-005, AI-010, AI-013, AI-016, AI-018 |

### 7.2 Required field-level invariants

| Invariant | Rationale |
|---|---|
| Every `controlInstances.outcome` value is in the closed enum from Gap 3 | OutcomeBadge rendering |
| Every `controlInstances` with `outcome != Pass` has the matching reason field set | distinguishes Fail vs DataGap vs EvidenceGap |
| Every `evidenceRecords.evidence_status` value is in the closed enum from Gap 4 | EvidenceCompletenessRing rendering |
| Every `correlationRecords.correlation_status` value is in the closed enum from Gap 11 | EvidenceChainDrawer warning chips |
| Every `controlInstances` row carries `step_execution_id` when the control is step-anchored (else null) | R-3 path |
| Every `controlInstances.evidence_ids[]` reference resolves in `evidenceRecords` | drawer non-orphan |
| Every `evidenceRecords.source_record_id` resolves in `sourceRecords` | drawer lineage spine |
| Every `correlationRecords.from_entity_*` / `to_entity_*` resolve in their target dataset | drawer lineage spine |
| Every `aiInsights.cited_evidence_ids[]` and `cited_source_record_ids[]` resolve | AI HITL flow |
| Every `auditPacks.included_*[]` reference resolves | pack composition tree |
| Every `seniorManagers.accountable_*[]` reference resolves both directions | S-12 + S-06 control header |
| Every `reportingSubmissions.evidence_id_for_ack?` (when present) resolves | RBI AFI / FIU lens readiness |
| `auditTrailEvents` exist for every CI, Workpaper, AuditPack, AIInsight HITL action, DecisionEvent, AttestationEvent | PMLA Rule 9 / RBI AFI reconstructibility |
| Every dataset is a non-empty array except disabled Wave 2/3 source systems | helper functions assume `array.filter` returns array |

### 7.3 Forbidden patterns

- ❌ No nested entity payloads (only IDs).
- ❌ No optional fields silently omitted — set to `null` explicitly when absent.
- ❌ No string-encoded enums (use the literal enum strings exactly as declared in Gaps 3, 4, 11).
- ❌ No timezone variability — all timestamps in ISO-8601 with `Z` suffix.
- ❌ No mixed-language values — Indian banking terminology only (e.g., `KFS`, `CKYCR`, `UCIC`, `STR`, `FMR`, `RFA`, `CSITE`, `CIMS`, `CRILC`, `CERT-In`); never UK terminology.
- ❌ No `Math.random()`, no `Date.now()` — deterministic data only.

---

## 8. Go / No-Go Recommendation

| Aspect | Status |
|---|---|
| Pass 5 dataset coverage | ✅ all 42 datasets present |
| Pass 5 FK paths | ⚠ 8 / 9 fully connectable; 1 needs `step_execution_id` (Gap 2) |
| Demo storyline coverage | ⚠ all 4 supported after 5 schema additions (Gaps 2, 3, 4, 6, 7) |
| Drawer routing coverage | ❌ 2 / 23 entity types unmapped (Gaps 9, 10) — **blocking** for runtime |
| Pass 4 / Pass 5 sample-ID alignment | ✅ confirmed |
| Indian banking concept fidelity | ✅ confirmed |
| New datasets required | none |
| New design required | none |

### 8.1 Recommendation

**Conditional Go.**

Proceed to mock data creation **only after** the following 11 schema fixes are applied to Pass 5 (no new datasets, only field/enum/routing-map additions):

| Priority | Fixes |
|---|---|
| **P0 (blocking — apply before any data is written)** | Gap 2 (`step_execution_id` on `controlInstances`); Gap 3 (closed `outcome` enum); Gap 4 (`evidence_status` enum); Gap 9 (`ExceptionDetailContent`); Gap 10 (`SourceSystemDetailContent`); Gap 11 (closed `correlation_status` enum) |
| **P1 (apply during data creation)** | Gap 1 (`linked_obligation_ids[]` on `processes`); Gap 5 (audit-trail `actor_role` + `payload_diff`); Gap 6 (`recommended_remediation_action_ids[]` on `rootCauseClusters`); Gap 7 (sign-off timestamps on `workpapers`); Gap 8 (`included_decision_event_ids[]` on `auditPacks`) |

### 8.2 Acceptance test for Pass 7 (Mock Data Creation)

The `mockIndianBankingAuditData.js` produced in the next pass must pass these eight automated checks before any JSX is written:

1. **Reference closure:** every ID referenced anywhere resolves to a record in the corresponding dataset (no dangling FKs).
2. **Enum closure:** every `outcome`, `evidence_status`, `correlation_status`, `signal_class`, `correlation_status` value is in the declared enum.
3. **Storyline closure:** for each of the five storylines, every entity referenced by `demoStorylines.steps[].highlight_record_ref` resolves; the full lineage spine is renderable.
4. **Drawer closure:** every entity type in §3.4 of Pass 5 is mapped to a DetailContent component; drawer-mode `evidenceChain` renders the full spine for every anchor type.
5. **Two-click drill:** every aggregate metric on every screen drills to a SourceRecord in ≤ 2 clicks (per Pass 4 §1.16).
6. **Sample-ID alignment:** the 14 canonical IDs from §7.1 are present.
7. **Determinism:** `JSON.stringify(mockData)` is identical across runs (no time-of-load values).
8. **Indian-only language:** lint check passes — zero occurrences of `SMCR`, `FCA`, `PRA`, `Consumer Duty`, `s.166`, `DISP`, `MiFIR`, `EMIR`, or any other UK-specific token.

**Once these eight checks pass, Pass 8 (the single `IndianBankingAuditApp.jsx` per Pass 5 §8) can begin.**
