# System Capabilities & Data Model — IndianBankingAudit Pass 3

*Pass 3 — System / Data Architecture for an AI-Driven Risk, Compliance & Audit Platform — Mid-Sized Indian Private Sector Bank*
*Authored by: RegTech Product Architect | Data Architect (Graph) | Indian Banking Audit Systems Architect | Cut-off: April 2026*

---

## 1. Opening Summary

This pass defines the **system capabilities and the normalised data model** for an AI-driven Risk, Compliance and Audit platform built specifically for a mid-sized Indian private sector bank. It does not design UI; it does not write code. It converts everything established in the IndianAudit research and the prior UI passes into a single, executable architecture.

**What this pass builds on.** It builds on the **IndianAudit Pass 1 research** — risk taxonomy (`R-CR / R-OP / R-CO / R-CD / R-TC / R-FC / R-TP / R-FR`), obligation universe (`OBL-RBI / OBL-PMLA / OBL-FIU`), and twenty-three failure archetypes drawn from real Indian supervisory history (Paytm PB Jan-2024, HDFC Dec-2020, Kotak Apr-2024, Bajaj Finance Nov-2023, HSBC India Feb-2025, IIFL Mar-2024, ICICI-Videocon, Yes Bank Jun-2024, Corporation Bank Jul-2019). It builds on the **IndianAudit Pass 2 process model** — process / step / activity decompositions for `PROC-KYC-001`, `PROC-LND-001`, `PROC-AML-001`, `PROC-UPI-001`, `PROC-COMP-001`, `PROC-VND-001`, `PROC-ITO-001`. It builds on **UI Pass 1 (Persona and Goals)** — three personas (`PERSONA-001` CRO / MD&CEO / BRMC Chair, `PERSONA-002` CCO / Head of ORM / MLRO–PO / Head of FC / Head of IT Risk, `PERSONA-003` Compliance Officer / IA Manager / Concurrent Auditor / Control Tester), ten outcomes (`OUT-001` Process Auditability through `OUT-010` AI Trust), and the question families (`Q-CRO` / `Q-CCO` / `Q-IA`). It builds on **UI Pass 2 (Data Correlation & Lineage Pack)** — six entities (SourceRecord → ProcessExecution → StepExecution → ControlInstance → EvidenceRecord → Issue), ten correlation principles, four-outcome ControlInstance taxonomy (Pass / Fail / Data Gap / Evidence Gap), the five correlation labels (Data Gap / Evidence Gap / Control Failure / Correlation Warning / Needs Review), the CES formula, and twelve types of correlation failure. It builds on the **RCM, field definitions, AI signal catalogue, and source-system mapping** (Pass 4 outputs) by treating the RCM not as the product but as the design-time substrate from which the run-time graph is derived.

**Why Indian banking needs more than a normal GRC platform.** Because the supervisory texture is different. RBI Risk-Based Supervision under Section 35 of the Banking Regulation Act and SPARC inspections descend, in practice, to specific UCIC / Loan-ID / Alert-ID / Change-ID questions; PMLA Rule 9 requires reconstructable transaction chains for five years; FIU-IND FINnet 2.0 STR submission, under PMLA s.12(1)(b), runs on a 7-working-day clock from suspicion conclusion; the CCO appointment, tenure and resignation are RBI-notifiable events under `RBI/2020-21/35 DoS.CO.PPG./SEC.02/11.01.005/2020-21` dated 11-Sep-2020; the *Master Direction on Fraud Risk Management* `RBI/DOS/2024-25/118` dated 15-Jul-2024 mandates EWS integrated with CBS, RFA reporting within 7 days, and FMR within 14 days; RBI Digital Lending Directions 2025 (`RBI/2025-26/36` dated 8-May-2025) require KFS issuance *before* borrower acceptance; the ITGRCA Directions (`RBI/2023-24/107` dated 7-Nov-2023, effective 1-Apr-2024) bring AI / ML governance into supervisory scope; CERT-In Direction No. 20(3)/2022 dated 28-Apr-2022 imposes a 6-hour cyber-incident reporting clock; the *RBI Master Direction on Outsourcing of IT Services* and the older Outsourcing of Financial Services framework drive vendor materiality, fourth-party disclosure and 6-hour TPSP re-notification (`OBL-RBI-019`); the DPDP Act 2023 imposes parallel breach-notification duties; the 28-Nov-2025 Master Direction consolidation reset every compliance inventory in the country. A generic GRC tool cannot model any of this natively.

**Why RBI-supervised banking requires evidence-first, population-level auditability.** Because UPI processes 18-20 billion transactions a month industry-wide; a mid-sized PB sees 200M-2B/month, against which sample-based concurrent audit is statistically meaningless; RBI inspectors expect **per-record evidence chains** not branch-aggregate counts; PMLA Rule 9 requires reconstructable five-year evidence retention; and the difference between **documented control** and **operating control** — Paytm PB / Kotak Apr-2024 / HDFC Dec-2020 / Bajaj Finance Nov-2023 / HSBC India Feb-2025 — is precisely where Sec 35A cease-and-desist powers get exercised. An evidence-first architecture is the only architecture that survives.

**Why PMLA / FIU-IND / UPI / digital-lending / CBS fragmentation change the system design.** Because the customer is `cust_no` in CBS, `applicant_id` in LOS, `subject_uid` in the AML engine, `ckycr_no` in CKYCR, and `mobile_hash` in DLAs; BPO floors handling KYC L1 / AML L1 / Complaint L1 introduce yet another correlation discontinuity; the FIU-IND FINnet 2.0 envelope, the CIMS DLA register, the CRILC ≥₹5 cr exposure cycle, the CERT-In incident envelope, and the UAPA s.51A daily cycle each have their own format, cadence and acknowledgement protocol. A platform that does not treat the Indian regulatory stack as the **primary** stack — not a localisation overlay — cannot evidence its own correctness.

**Why the RCM is only the design-time substrate, and why the platform must materialise the run-time graph.** Because the RCM (the spreadsheet inheritance from the legacy GRC era) describes only what *should* happen. RBI inspection asks what actually happened — on this UCIC, in this BPO floor, on this loan, in this vendor relationship, on this date. The platform must therefore **promote every RCM row to a structured Control entity** but **treat the answer to "did it actually happen" as a separately stored, append-only, bi-temporal run-time graph** of `ProcessExecution → StepExecution → ControlInstance → EvidenceRecord → Exception → Issue → ActionTask → Workpaper → AuditPack`. The RCM stays current because its rows version when regulations or controls change; the run-time graph stays defensible because every state change is recorded as an event, with valid_time and system_time, and every outcome links back through a correlation chain to the exact source record (CBS row, FINnet 2.0 ack, CKYCR ack, NPCI feed, ITSM ticket).

**Why SourceRecord → ProcessExecution → StepExecution → ControlInstance → EvidenceRecord → CES → Persona Workspace is the core operating model.** Because each transition is regulator-defensible: SourceRecord proves the raw fact existed in a system of record; ProcessExecution and StepExecution prove the journey occurred (and where it drifted); ControlInstance proves the control evaluation; EvidenceRecord proves the evaluation can be re-run for an inspector; CES proves the population posture in three explicit components (OperatingRate, CatchRate, EvidenceCompleteness); and Persona Workspace is the lens — `OUT-005` Senior-Management Accountability for PERSONA-001, `OUT-006` Inspection Readiness and `OUT-008 / OUT-009` for PERSONA-002, `OUT-007` Population Testing for PERSONA-003. The eight following sections specify exactly how this chain is realised as a normalised data model, a relationship graph, a metric system, an Indian RCM overlay, a source-system map, an AI capability backlog, persona alignment, time-travel and audit reconstruction, and a clean handoff to Pass 4 implementation.

---

## 2. System Capabilities

### 2.1 Capability Catalogue

| # | Capability | What it does | Primary persona | System goal supported | India / RCM grounding |
|---|---|---|---|---|---|
| **C-01** | **Process Execution Telemetry** | Derives actual `ProcessExecution` and `StepExecution` from CBS (Finacle / Flexcube / BaNCS) event streams, LOS event streams (Newgen / Lentra), AML engine alert + case logs (Oracle FCCM / Mantas / Actimize), CKYCR / CERSAI acks, NPCI UPI feeds, FIU-IND FINnet 2.0 outbound + inbound, ITSM (ServiceNow / Remedy), SIEM (Splunk / Sentinel), VMO / GRC, CMS / Complaints. Compares observed execution against the documented `Process` variant signature (`PROC-KYC-001` … `PROC-ITO-001`) and surfaces process variant drift (AI-002). | PERSONA-002, PERSONA-003 | OUT-001 (Process Auditability), OUT-007 (Population Testing) | All seven IndianAudit core processes; covers BPO-handoff steps for KYC L1 and AML L1; surfaces variant drift behind Paytm-style KYC drift and HSBC-India-style AML outsourcing |
| **C-02** | **Source-System Correlation & Lineage** | Correlates fragmented Indian banking records that do not share a primary key. Preserves anchor key, backup key, match method, match confidence, timestamp window, expected and actual cardinality, and orphan classification per Pass 2 §3 ten correlation rules; routes orphans to OrphanQueue with a daily concurrent-audit review hook. | PERSONA-002, PERSONA-003 | OUT-001, OUT-006 (Inspection Readiness) | UCIC ↔ AML-engine subject_uid ↔ CKYCR no. ↔ NPCI VA ↔ FIU-IND STR ref; PAN / Aadhaar-hash governance under Aadhaar Act s.29 + DPDP Act 2023 |
| **C-03** | **RBI Obligation Decomposition & Coverage Mapping** | Converts RBI Master Directions, PMLA + Rules, FIU-IND directives, NPCI procedural guidelines, CERT-In directions and ITGRCA into atomic `Obligation` records. Maps each obligation to risks, controls, processes, source systems, evidence expectations, reporting clocks and accountable senior owners via typed edges (e.g., `:COVERS`, `:OWNED_BY`). Tracks coverage strength (Strong / Adequate / Thin / Gap). | PERSONA-002 | OUT-002 (Control Observability), OUT-003 (Evidence Completeness) | 28-Nov-2025 MD consolidation (3,500 → 238 MDs); 2016 KYC MD superseded by sector-specific KYC MDs; KFS Para 8 of `RBI/2025-26/36` dated 8-May-2025; PMLA Rule 9 ; FIU-IND FINnet 2.0 |
| **C-04** | **ControlInstance Generation & Reconciliation** | For every `ProcessExecution` and `StepExecution`, evaluates whether a control was expected to fire (per `Control.expected_to_fire_population`), did fire, produced evidence, and produced an effectiveness signal. Distinguishes **Pass / Fail / Data Gap / Evidence Gap / Needs Review** (the four core outcomes plus the review status). Reconciles its own counts against source-system independent extracts. | PERSONA-002, PERSONA-003 | OUT-002, OUT-007 | All RCM controls `CTRL-KYC-001..005`, `CTRL-LND-001..005`, `CTRL-AML-001..005`, `CTRL-UPI-001..002`, `CTRL-COMP-001`, `CTRL-VND-001..002`, `CTRL-ITO-001..002` |
| **C-05** | **Evidence Ledger & Inspection Readiness** | Creates tamper-evident `EvidenceRecord` nodes with provenance (source-system + retrieval timestamp), payload hash, chain-of-custody status, retention class (PMLA Rule 9 = 5y from cessation / STR), and parallel readiness flags (`rbi_afi_ready`, `pmla_rule_9_ready`, `fiu_ready`, `statutory_audit_ready`, `concurrent_audit_ready`). Indexes by `Obligation`, `Control`, `Process`, `Subject` for inspection-pack assembly. | PERSONA-002, PERSONA-003 | OUT-003, OUT-006 | RBI AFI under BR Act Sec 35; PMLA Rule 9; CSITE thematic inspection; FIU-IND offsite review; statutory and concurrent audit |
| **C-06** | **Control Effectiveness Score (CES) Engine** | Computes CES per control on a rolling window using the IndianAudit formula `0.40 × OperatingRate + 0.40 × CatchRate + 0.20 × EvidenceCompleteness`, with explicit data-gap and evidence-gap accounting per Pass 2 §10. Renders Green / Amber / Red / Grey. Supports as-of-date queries for replay. | PERSONA-001, PERSONA-002 | OUT-002, OUT-003, OUT-006 | Pass 4 RCM CES values; CTRL-AML-002 and CTRL-LND-002 worked examples |
| **C-07** | **Risk Posture & Appetite Engine** | Aggregates CES, KRIs, appetite breaches, open Issues, evidence gaps, correlation warnings, and reporting-clock breaches into a residual risk picture by domain (`R-CR / R-OP / R-CO / R-CD / R-TC / R-FC / R-TP / R-FR / R-MR`). Supplies the CRO-level risk posture view with one-click drill to source records. | PERSONA-001 | OUT-005 (Senior-Management Accountability) | RBI Risk-Based Supervision SPARC IRISc inputs; Board / RMCB packs; ICAAP residual-risk inputs |
| **C-08** | **Issue Detection & Root-Cause Clustering** | Promotes control failures, evidence gaps, process drift, repeated exceptions, stale evidence and breached KRIs into candidate `Issue` nodes. Clusters by root cause: BPO batch failure, CBS schema drift, LOS timestamp reversal, AML backlog, vendor failure, policy-exception abuse, evidence-retention gap. Embedding-based clustering via AI-010. | PERSONA-002, PERSONA-003 | OUT-004 (Issue Remediation) | Issue families ISS-2026-009 (CTRL-AML-002), ISS-2026-061 (UPI mule), ISS-2026-085 (KFS post-acceptance DSA), ISS-2026-027 (vendor fourth-party) |
| **C-09** | **Population Reperformance & Workpaper Assembly** | Replays control logic against the full population (denominator from `Control.expected_to_fire_population`) and produces audit-ready `Workpaper` nodes with evidence lineage, sampling rationale (where applicable) and a re-runnable test query (`TestExecution.population_query_ref`). | PERSONA-003 | OUT-007 | Concurrent audit framework `RBI/2019-20/250` dated 18-Sep-2019; RBIA `RBI/2002-03 DBS.CO.PP.BC.10/11.01.005/2002-03` dated 27-Dec-2002; statutory audit per BR Act Sec 30 |
| **C-10** | **Regulatory Change Impact Analysis** | Ingests new / amended Master Directions, PMLA amendments, FIU-IND directives, NPCI procedural changes, CERT-In and DPDP-Board notices. Traces the change through `Regulation → Obligation → Control → Process → SeniorManager → EvidenceSpecification → ReportingClock → RemediationAction`. AI-003 proposes new edges or new obligations awaiting human approval. | PERSONA-002 | OUT-006 | 28-Nov-2025 MD consolidation; 12-Jun-2025 KYC amendment; 8-May-2025 DL Directions 2025; 15-Jul-2024 MD on FRM |
| **C-11** | **Senior-Management Accountability Ledger** | Maps `Control`, `Issue`, `DecisionEvent`, `AttestationEvent`, `RemediationAction` to MD&CEO / CRO / CCO / MLRO–Principal Officer / CISO / CIO / HIA / Business Head. Captures committee oversight (BRMC / ACB / RMCE), board-pack provenance, and reasonable-oversight evidence. Builds the defence file for any future RBI Sec 47A, Sec 36AA, PMLA s.13 or Fit & Proper review. | PERSONA-001 | OUT-005 | CCO circular `RBI/2020-21/35` 11-Sep-2020; Corporate Governance Directions 26-Apr-2021; *SBI v. Rajesh Agarwal* 2023 SC ruling on natural justice in fraud-tagging |
| **C-12** | **AI Signal & Explainability Layer** | Runs the AI signal catalogue (anomaly, drift, coverage gap, effectiveness decay, evidence quality, cluster / RCA, reporting risk, accountability gap, model risk). Persists every signal as an `AIInsight` node with `model_id` + `model_version`, source evidence, confidence, threshold used, recommendation, human-approval state and audit log. Subjects every model to the platform's own model-risk governance (`R-MR-001`). | All three personas | OUT-010 (AI Trust) | AI-001..019 from Pass 4 catalogue; ITGRCA model-risk expectations; MD on FRM 15-Jul-2024 EWS analytics; DPDP Act 2023 limits on automated decisions affecting customers |

### 2.2 Foundational Capability — Time-Travel, Lineage, and Drillability

Beneath the twelve capabilities sits a single foundational capability: **time-travel-with-lineage**. Every aggregate view in the platform — risk posture, CES tile, OCM heat-map, Issue burn-down, inspection-pack readiness, accountability-evidence cockpit — must support all of the following without exception:

- **Historical reconstruction.** Re-run the same query against the same period and get the same answer six months later.
- **As-of-date queries.** "What did the bank know on 2026-04-15 about UCIC-2024-00127?" must be a graph traversal, not a re-extraction. The underlying `valid_time` / `system_time` pair on every fact makes this deterministic.
- **Source-evidence drill-down.** Two-click maximum from any aggregate metric to a specific `EvidenceRecord` and onward to the originating `SourceRecord` with `source_system_id`, `source_table_or_api`, `source_primary_key`, `payload_hash` and `retrieval_timestamp`.
- **Versioned design-time records.** `Regulation`, `Obligation`, `Control`, `Process`, `ProcessStep`, `Activity`, `KRI`, `AppetiteMetric`, `ReportingClock`, `EvidenceSpecification`, `PopulationTestSpecification`, `SeniorManagementResponsibility`, `SourceSystemDefinition`, `SourceSchemaDefinition` are versioned with explicit `effective_from / effective_to`. ControlInstance evaluation always uses the version that was effective at the `valid_time` of the underlying ProcessExecution — not the current version.
- **Immutable event log.** Every state change produces an `Event` record with monotonically increasing sequence number, append-only. Current state is a *projection*; historical state is a replay.
- **Source-system round-trip.** From any platform fact, the bank must be able to round-trip back to the source system extract that produced it (with hash that re-verifies). This is the audit-defence property that turns "the platform says X" into "the source system says X and the platform faithfully represented it".
- **Two-click path from aggregate signal to root-cause evidence.** PERSONA-001 sees a Red domain tile; one click drills to the failing controls; second click drills to the failing ControlInstances with their EvidenceRecords. Anything more than two clicks is a UI failure that breaks Q-CRO-01 / Q-CRO-10.

This foundation is non-optional because it is the property that simultaneously satisfies **OUT-005** (the senior-manager defence file), **OUT-006** (inspection readiness), **OUT-007** (population testing reproducibility), **OUT-010** (AI trust under model-risk governance) and the PMLA Rule 9 reconstructability test.

---

## 3. Data Model Design Principles

| # | Principle | Meaning | Why it matters | India-specific reason | Example |
|---|---|---|---|---|---|
| **P-01** | **Design-time vs run-time separation** | Two physically separate storage layers with different update patterns. Design layer is versioned, slow-moving, declarative. Run layer is append-only, high-volume, derived from real execution. | Confuses what *should* happen with what *did* happen; legacy GRC tools merge these and lose audit defensibility. | RBI inspectors test both: "show me your KYC policy" (design) and "show me UCIC-2024-00127 sequence" (run-time) — they are separate questions. | `Control` (design) vs `ControlInstance` (run-time) for `CTRL-KYC-008`. |
| **P-02** | **Event sourcing for run-time entities** | Every run-time state change (ControlInstance fire, Issue raise, evidence ingest, attestation submitted) produces an immutable Event with sequence number; current state is a projection. | Allows perfect historical reconstruction; no "edit-in-place" anywhere on the audit trail. | PMLA Rule 9 reconstructability of the five-year transaction chain is precisely this. | `EVT-CTRL-INSTANCE-FIRED-...` for every CTRL-AML-003 evaluation. |
| **P-03** | **Bi-temporality (`valid_time` + `system_time`)** | Every fact has both *when it was true in the world* and *when the platform first knew it*. | Late-arriving records (BPO batch lag, NPCI feedback T+1) must not corrupt past CES; "what did we know then" must be answerable. | RBI AFI: "what did the bank know about this UCIC on this date?" needs `system_time`. | A CKYCR ack arriving 4d late: `valid_time = 2026-04-03` (the CKYCR registry timestamp); `system_time = 2026-04-07` (when platform ingested). |
| **P-04** | **Stable RCM IDs as system identifiers** | `R-*`, `OBL-*`, `PROC-*`, `STEP-*`, `ACT-*`, `CTRL-*`, `CI-*`, `EV-*`, `ISS-*`, `AI-*` are platform primary keys, not labels. | Pass 4 RCM rows must round-trip into and out of the platform without ID drift. | The 28-Nov-2025 MD consolidation re-numbered RBI directions but Obligation IDs must remain stable; only `Obligation.regulation_id` and `Obligation.citation` change with versioning. | `OBL-RBI-001` retains identity even when its source `Regulation` evolves from REG-RBI-MD-KYC-2016 → REG-RBI-MD-KYC-2025. |
| **P-05** | **Multi-value RCM fields become typed join tables** | "Linked obligations" in the RCM is not a semicolon-separated string; it is a join table `ControlObligationLink {control_id, obligation_id, edge_type, effective_from, effective_to, coverage_strength}`. | Querying coverage gaps requires a graph, not free text. | RBI obligation-to-control coverage strength (Strong / Adequate / Thin / Gap) is auditable only as edge weights. | Pass 4 master tables `Open Issues` and `AI signals` lists become `IssueControlLink` and `AIInsightControlLink`. |
| **P-06** | **SourceRecord is the base of all audit evidence** | Every EvidenceRecord, ProcessExecution, StepExecution, ControlInstance traces back to one or more SourceRecord(s) with `payload_hash` and `retrieval_timestamp`. | Lineage is non-negotiable. Without it the platform is making claims it cannot defend. | Statutory auditor / RBI inspector / FIU-IND auditor will cross-check platform numbers against source-system extracts. | CTR count in platform must reconcile to `CBS.TXN_LOG.CASH_TRANSACTIONS` for the period. |
| **P-07** | **EvidenceRecord is a first-class audit object** | EvidenceRecord has its own lifecycle, status, hash, retention class, and regulator-readiness flags — not a blob attachment on a ControlInstance. | Inspection packs are graph queries against EvidenceRecord, not zip-file scrapes of attachments. | PMLA Rule 9 retention is per-evidence-record property; FIU-IND ack is itself an EvidenceRecord. | `EV-LOG-FIU-ACK-2024-11-09-...` for AML-ALRT-2024-00501 is a separate node with its own readiness flags. |
| **P-08** | **CorrelationRecord is first-class** | Every cross-system join produces a `CorrelationRecord` with anchor, backup, method, confidence, cardinality, status; not a hidden ETL artefact. | The bank must be able to defend "how did you know this evidence belongs to this customer / alert / loan / vendor?" | BPO ↔ CBS mis-keying (Rule 5 of Pass 2 §3) is the single largest source of HSBC-India-Feb-2025-class AML risk. | A CorrelationRecord for UCIC-2024-00127 ↔ BPO ticket BPO-KYC-2024-09-15-22118 with `match_method = anchor` and `confidence = 1.0`. |
| **P-09** | **Data Gap, Evidence Gap and Control Failure are distinct** | Four-outcome ControlInstance taxonomy enforced at write time: a missing source row is **Data Gap**; a present-but-unhashed log is **Evidence Gap**; a violated Pass logic is **Control Failure**. They cannot be auto-promoted between each other. | Misclassifying an Evidence Gap as a Control Failure inflates the issue register; misclassifying a Control Failure as an Evidence Gap conceals real risk. | RBI MRA risk depends entirely on this distinction. | UCIC-2024-00127 `re_kyc_due_date = NULL` is a **Data Gap** rolling into a Control Failure for the cohort; the platform must label it correctly (Pass 2 Trace 1). |
| **P-10** | **RBI obligation overlay, not spreadsheet duplication** | Obligation universe is the single canonical layer; `Control` references obligations via edges, never embeds them as text. | Allows obligation-coverage queries; AI-003 can detect new obligations and propose new edges. | The 28-Nov-2025 consolidation would be unmanageable as a spreadsheet refresh. | When `OBL-RBI-001` references its underlying Regulation node, an AI-003 amendment to REG-RBI-MD-KYC-2025 propagates without RCM rewrite. |
| **P-11** | **Senior-management accountability as a first-class relationship** | Every Control / Issue / DecisionEvent / AttestationEvent / RemediationAction has explicit `accountable_senior_manager_id` edges. SeniorManager is a graph node, not a free-text "owner" cell. | This is the precondition for any reasonable-oversight defence. | Sec 47A / Sec 36AA / PMLA s.13 / Fit & Proper exposure traces back to specific named officers. | DecisionEvent on EDD override for a high-risk UCIC links to the named CCO + branch-manager attestor; UCIC-2024-00126 senior approver was `USR-CCO-022`. |
| **P-12** | **Population testing by default** | Sample only when judgement is genuinely required (e.g., voice-call mis-selling review on EVD-CALL). All other controls run population tests with population denominator from `PopulationTestSpecification`. | UPI / digital-lending volumes have made sampling statistically meaningless. | MD on FRM 15-Jul-2024 explicitly requires Data Analytics & MIU; concurrent audit cannot sample 100/branch/month against UPI's volumes. | CTRL-LND-002 population test against 47,892 December disbursals (Pass 2 §10.4). |
| **P-13** | **Process drift must be observable** | Each `Process` has a `documented_variant_signature`; each `ProcessExecution` has its actual variant signature; AI-002 surfaces deviations. | The Paytm PB / Kotak / HDFC archetypes are exactly drift-vs-documented-control failures. | Indian operational density (branch + V-CIP + DLA + DSA + LSP + BPO) makes variant explosion the norm. | STEP-AML-05 bypass detected at 7% of alerts → AI-002 `drift` insight. |
| **P-14** | **UPI-scale / AML-scale event volume must be modelled** | The data model assumes 10⁶–10⁹ ProcessExecution / StepExecution / ControlInstance / SourceRecord events per month and partitions accordingly. | The platform cannot collapse under UPI volumes; the schema must be partitionable by `valid_time` and shardable by anchor key. | UPI 200M-2B txns/month per mid-sized PB. | `PE-PROC-UPI-001-...` with `valid_time` partitioning at day granularity. |
| **P-15** | **BPO / branch / outsourced execution must be explicit** | StepExecution carries `actual_actor_type ∈ {customer, branch_staff, central_ops, bpo_l1, bpo_l2, underwriter, rm, system, dsa, lsp, tpsp_engineer, risk_officer, compliance_officer, cco, bsa_officer, board_committee}` and `vendor_id` where applicable. | Audit-defence for outsourced operations under `OBL-RBI-016..021` requires per-step actor traceability. | HSBC India Feb-2025 (AML alert disposition outsourced to group entity) was exactly an actor-attribution failure. | STEP-AML-04 for AML-ALRT-2024-00501 carries `actual_actor_type = bpo_l1`, `vendor_id = VEND-ID-203`. |
| **P-16** | **Reporting clocks must be modelled** | `ReportingClock` is a design-time entity carrying clock spec (start trigger, deadline, statutory cite, target system). `ReportingSubmission` is the run-time match. | Misses on CTR / STR / FMR / RFA / CSITE / CERT-In / CIMS / CRILC are direct OBL breaches with hard penalties. | PMLA s.12(1)(b) STR ≤7 working days; `OBL-RBI-013` 2-6 hr CSITE; CERT-In 6-hr; FMR ≤14 days; RFA ≤7 days. | A `ReportingClock` for STR is triggered by `suspicion_concluded_at`; a `ReportingSubmission` to FIU-IND FINnet 2.0 closes it. |
| **P-17** | **AI outputs must be explainable and evidence-backed** | `AIInsight` carries `model_id`, `model_version`, `input_entity_ids`, `source_evidence_ids`, `confidence`, `threshold_used`, `rationale`, `recommendation`, `risk_if_wrong`. Models themselves are graph nodes with version control. | RBI examiners increasingly apply model-risk-management expectations. | ITGRCA Directions; the platform's own `R-MR-001`. | AI-013 insight on DL-APP-2024-00884 carries model_version + confidence 0.97 + input event timestamps. |
| **P-18** | **Human approval is mandatory for regulator-facing AI conclusions** | Auto-filing of STR / SCN / FMR / RFA / CTR is rejected. AI proposes; the regulated officer disposes. AIInsight has `human_approval_required = TRUE` for regulator-facing decisions. | Personal accountability under PMLA s.13 / RBI Sec 47A is non-delegable. | A *SBI v. Rajesh Agarwal* SCN must be issued by a reasoned officer, not the platform. | AI-011 proposes STR triage; the Principal Officer attests `suspicion_concluded_at` and clicks file. |
| **P-19** | **Unknown coverage gaps must be surfaced, not hidden** | If an obligation has no `:COVERS` edge to any control, that is itself a `Coverage Gap` AIInsight (AI-003). | Silent gaps become RBI MRA findings. | The 28-Nov-2025 MD consolidation surfaces hundreds of new and re-numbered obligations; gap detection must be active. | An OBL on the new sector-specific KYC MD with no linked control fires AI-003 to PERSONA-002. |
| **P-20** | **Every metric must drill to SourceRecord** | CES → ControlInstance → EvidenceRecord → SourceRecord traversal must be terminal at SourceRecord. No metric is reportable without that drill path. | If the path is broken, the metric is vanity. | Pass 1 design Principle 5 ("Every metric drills to evidence"); RBI's repeated supervisory expectation. | PERSONA-001 sees CTRL-LND-002 CES = 89.51; clicks → 11,118 failing ControlInstances; clicks → DL-APP-2024-00884 LOS event-stream rows. |

---

## 4. Data Model — Core Entities and Fields

This section defines twenty-five entities. For each: **type** (Design-time / Run-time / Governance / AI / Bridge), **purpose**, **key fields with type and required flag**, **example values keyed off the IndianAudit sample IDs**, **India-specific attributes**, **run-time partner**, and **persona relevance** (without designing UI).

### 4.1 `Regulation` — Design-time

**Purpose:** the canonical source instrument from which `Obligation` records are derived. The platform's regulatory layer.

| Field | Type | Required | Example |
|---|---|---|---|
| `regulation_id` | string | Yes | `REG-RBI-MD-KYC-2025` |
| `title` | string | Yes | "Master Direction — Know Your Customer (Commercial Banks), 2025" |
| `regulator_or_authority` | enum {RBI, FIU-IND, NPCI, CERT-In, UIDAI, CKYCR, CERSAI, SEBI, IRDAI, MCA, DPDP-Board} | Yes | `RBI` |
| `source_instrument` | enum {Master Direction, Master Circular, Direction, Circular, Notification, Act, Rule, FAQ, Order} | Yes | `Master Direction` |
| `citation` | string | Yes | `RBI/CO/DOR.AML.REC.../14.01.001/2025-26 dated 28-Nov-2025` |
| `jurisdiction` | enum {India, India + cross-border} | Yes | `India` |
| `issued_date` | date | Yes | `2025-11-28` |
| `effective_date` | date | Yes | `2025-11-28` |
| `supersedes` | list<regulation_id> | No | `[REG-RBI-MD-KYC-2016]` |
| `superseded_by` | regulation_id | No | null |
| `version` | int | Yes | `1` |
| `source_url` | string | Yes | rbi.org.in citation page URI |
| `raw_text_blob_uri` | URI | Yes | object-store URI for AI-003 re-ingestion |
| `obligation_count` | int | Yes (computed) | `42` |
| `owner_function` | enum {Compliance, Risk, IT-Risk, FinCrime, Conduct} | Yes | `Compliance` |
| `status` | enum {active, superseded, withdrawn, draft} | Yes | `active` |

**India-specific attributes:** `pre_28nov2025_circulars` (list) for traceability of the 9,445 withdrawn circulars; `parent_act` (BR Act 1949 / PMLA 2002 / IT Act 2000 / DPDP Act 2023 / Aadhaar Act 2016).
**Run-time partner:** `RegulatoryChangeEvent`.
**Persona relevance:** PERSONA-002 owns the regulatory layer; PERSONA-001 sees the change-impact summary.

### 4.2 `Obligation` — Design-time

**Purpose:** atomic regulatory requirement; the unit of compliance-coverage measurement.

| Field | Type | Required | Example |
|---|---|---|---|
| `obligation_id` | string | Yes | `OBL-RBI-001` |
| `regulation_id` | regulation_id | Yes | `REG-RBI-MD-KYC-2025` |
| `source_instrument` | string | Yes | "MD KYC, Para 21" |
| `citation` | string | Yes | section / clause text |
| `atomic_requirement` | string | Yes | "Customer Due Diligence completed before account activation" |
| `obligation_type` | enum {due_diligence, screening, reporting, retention, governance, conduct, resilience, accountability} | Yes | `due_diligence` |
| `reporting_clock_id` | reporting_clock_id | No (only if obligation_type=reporting) | `RC-PMLA-STR-7BD` for OBL-PMLA-003 |
| `evidence_expectation` | string | Yes | "EVD-LOG (UIDAI eKYC) + EVD-DOC (OVD) + EVD-LOG (CBS activation)" |
| `regulatory_body` | enum (same as Regulation.regulator_or_authority) | Yes | `RBI` |
| `jurisdiction` | enum | Yes | `India` |
| `applicability_archetype` | list {MSPB, PSU, SFB, FBB, NBFC} | Yes | `[MSPB, PSU, SFB]` |
| `effective_from` | date | Yes | `2025-11-28` |
| `effective_to` | date | No | null |
| `status` | enum {active, superseded, withdrawn} | Yes | `active` |
| `version` | int | Yes | `1` |
| `rbi_afi_relevance` | enum {high, medium, low} | Yes | `high` |
| `pmla_relevance` | boolean | Yes | true |
| `fiu_reporting_relevance` | boolean | Yes | false |
| `itgrca_relevance` | boolean | Yes | false |
| `senior_management_relevance` | boolean | Yes | true |
| `interpretation_status` | enum {ratified, provisional, disputed} | Yes | `ratified` |
| `ai_confidence` | float | No | null (manual obligation) |

**Indian examples (consistent with Pass 1 / Pass 4):**

| Obligation ID | Atomic requirement | Reporting clock |
|---|---|---|
| `OBL-RBI-KYC-001` | CDD before account activation | n/a |
| `OBL-RBI-KYC-002` | Sanctions / PEP / adverse-media screening | n/a |
| `OBL-RBI-KYC-003` | CKYCR upload within prescribed window | n/a |
| `OBL-PMLA-001` | Transaction record retention / reconstructability (PMLA Rule 9) | retention 5y |
| `OBL-FIU-STR-001` | STR filing after suspicion conclusion | 7 working days (PMLA s.12(1)(b)) |
| `OBL-RBI-DL-001` | KFS issuance before borrower acceptance | n/a (per-event) |
| `OBL-RBI-FRM-001` | EWS / fraud monitoring integration with CBS | continuous |
| `OBL-RBI-IT-001` | IT incident & cyber control assurance (ITGRCA) | continuous |
| `OBL-CERT-IN-001` | 6-hour cyber incident reporting | 6 hr |
| `OBL-RBI-OUT-001` | Material outsourcing governance | continuous + on-event |
| `OBL-RBI-COMP-001` | Complaint escalation / IO review | per complaint |
| `OBL-NPCI-UPI-001` | UPI dispute / fraud handling | NPCI URC clock |

**Run-time partner:** `ControlInstance` (via `Control :COVERS Obligation`) and `ReportingSubmission` for reporting obligations.
**Persona relevance:** PERSONA-002 (OCM owner); PERSONA-001 (residual coverage view); PERSONA-003 (workpaper anchor).

### 4.3 `Risk` — Design-time

**Purpose:** the risk taxonomy node. Inherent risk is stored; residual risk is computed at query time.

| Field | Type | Required | Example |
|---|---|---|---|
| `risk_id` | string | Yes | `R-FC-001` |
| `risk_domain` | enum {Credit, Operational, Compliance, Conduct, Tech/Cyber, Financial Crime, Vendor/Outsourcing, Fraud, Model Risk} | Yes | `Financial Crime` |
| `title` | string | Yes | "AML Alert Disposition & STR Filing Risk" |
| `description` | string | Yes | India context paragraph |
| `inherent_likelihood` | enum {Low, Medium, High, Very High} | Yes | `Very High` |
| `inherent_impact` | enum (same) | Yes | `Very High` |
| `inherent_rating` | enum (computed cache) | Yes | `Very High` |
| `residual_rating_formula_ref` | string | Yes | "fn(inherent, CES, KRI, Issues, as_of)" |
| `owner_role` | string | Yes | "Head of FCC" |
| `accountable_senior_manager_id` | senior_manager_id | Yes | `SM-CCO-001` |
| `linked_obligation_ids` | list<obligation_id> | Yes | `[OBL-PMLA-001, OBL-FIU-STR-001]` |
| `linked_control_ids` | list<control_id> | Yes | `[CTRL-AML-001..005]` |
| `linked_process_ids` | list<process_id> | Yes | `[PROC-AML-001]` |
| `linked_kri_ids` | list<kri_id> | Yes | `[KRI-FC-016, KRI-FC-017]` |
| `jurisdiction` | enum | Yes | `India` |
| `created_at`, `updated_at`, `version` | (lifecycle) | Yes | — |

**India-specific attributes:** `archetype_divergence` (per-archetype rating overrides), `recent_indian_event_refs` (e.g., HSBC India Feb-2025).
**Run-time partner:** `KRIObservation`, `RiskAssessment`, `Issue`, `AIInsight`.
**Persona relevance:** PERSONA-001 risk posture; PERSONA-002 functional view.

### 4.4 `Control` — Design-time

**Purpose:** what *should* happen. The RCM row promoted to a structured node.

| Field | Type | Required | Example |
|---|---|---|---|
| `control_id` | string | Yes | `CTRL-LND-002` |
| `title` | string | Yes | "KFS pre-acceptance with APR completeness on RE letterhead" |
| `description` | string | Yes | objective text |
| `control_type` | enum {Preventive, Detective, Corrective, Reconciliatory, Reporting, Accountability/Governance} | Yes | `Preventive` |
| `control_nature` | enum {Manual, Automated, ITDM, Hybrid, BPO-operated, Third-party-operated} | Yes | `Automated` |
| `frequency` | enum (per-event, per-transaction, per-customer, per-loan, per-case, per-vendor, per-model, daily, weekly, monthly, quarterly, semi-annual, annual, continuous, risk-based) | Yes | `per-loan` |
| `designed_condition` | predicate text | Yes | "kfs_issued_at < borrower_acceptance_at AND apr_completeness=TRUE" |
| `operating_signal_spec` | json | Yes | trigger query spec |
| `effectiveness_signal_spec` | json | Yes | catch-rate spec |
| `expected_evidence_spec_ids` | list<evidence_spec_id> | Yes | EVD-DOC, EVD-SIGN, EVD-LOG |
| `expected_source_systems` | list<source_system_id> | Yes | LOS, e-sign, CIMS |
| `position_in_step` | step_id | Yes | `STEP-LND-06` |
| `owner_role` | string (1LoD) | Yes | "Head of Retail Lending" |
| `operator_role` | string | Yes | "system" |
| `accountable_senior_manager_id` | senior_manager_id | Yes | `SM-HOR-LEND-001` |
| `rbi_obligation_ids` | list<obligation_id> | Yes | `[OBL-RBI-DL-001 (i.e. OBL-RBI-022 in Pass 1)]` |
| `pmla_obligation_ids` | list<obligation_id> | No | — |
| `fiu_obligation_ids` | list<obligation_id> | No | — |
| `population_testable_flag` | boolean | Yes | true |
| `judgement_dependent_flag` | boolean | Yes | false |
| `population_test_specification_id` | population_test_specification_id | Yes | `PTS-CTRL-LND-002-001` |
| `status` | enum {active, retired, pending} | Yes | `active` |
| `version` | int | Yes | `3` |
| `effective_from`, `effective_to` | dates | Yes | — |

**Run-time partner:** `ControlInstance`.
**Persona relevance:** PERSONA-002 owner view; PERSONA-003 testing view.

### 4.5 `Process` — Design-time

**Purpose:** the canonical process spine. One per IndianAudit core process.

| Field | Type | Required | Example |
|---|---|---|---|
| `process_id` | string | Yes | `PROC-LND-001` |
| `name` | string | Yes | "Retail Loan Origination" |
| `description` | string | Yes | "From application to booking and CIMS reporting" |
| `process_owner_role` | string | Yes | "Head of Retail Lending" |
| `accountable_senior_manager_id` | senior_manager_id | Yes | `SM-HOR-LEND-001` |
| `business_domain` | enum | Yes | `Retail Banking` |
| `regulatory_anchor_ids` | list<obligation_id> | Yes | `[OBL-RBI-DL-001..005]` |
| `source_systems` | list<source_system_id> | Yes | `[LOS, BUREAUS, AA, CBS, CIMS]` |
| `documented_variant_signature` | hash | Yes | sha256 of canonical step order |
| `bpo_involvement_level` | enum {none, low, medium, heavy} | Yes | `medium` (DSA channel) |
| `third_party_dependency_flag` | boolean | Yes | true |
| `population_unit` | enum {customer, loan_application, alert, transaction, vendor_request, complaint, change_request, incident} | Yes | `loan_application` |
| `status` | enum | Yes | `active` |
| `jurisdiction` | enum | Yes | `India` |

**Anchor processes (consistent with the IndianAudit set):**

1. `PROC-KYC-001` Customer Onboarding & KYC
2. `PROC-LND-001` Retail Loan Origination / Digital Lending
3. `PROC-AML-001` AML Transaction Monitoring & Alert Disposition
4. `PROC-UPI-001` UPI Payment Processing & Dispute / Fraud Handling
5. `PROC-COMP-001` Customer Complaints & Internal Ombudsman Review
6. `PROC-VND-001` Vendor / TPSP Outsourcing Lifecycle
7. `PROC-ITO-001` IT Operations — Change, Incident, Patch, Access
8. `PROC-CRD-001` Credit Monitoring — IRACP / EWS / RFA
9. `PROC-RPT-001` Regulatory Reporting — FIU / CIMS / CRILC / CERT-In
10. `PROC-RES-001` Operational Resilience / Critical Operations

**Run-time partners:** `ProcessExecution`, `StepExecution`.

### 4.6 `ProcessStep` — Design-time

| Field | Type | Required | Example |
|---|---|---|---|
| `step_id` | string | Yes | `STEP-LND-06` |
| `process_id` | process_id | Yes | `PROC-LND-001` |
| `step_order` | int | Yes | `9` |
| `name` | string | Yes | "KFS Generation & Borrower Acceptance" |
| `step_type` | enum {system, manual, judgemental, hybrid} | Yes | `hybrid` |
| `expected_actor_role` | string | Yes | "system + borrower" |
| `expected_system` | system_type | Yes | `LOS` |
| `expected_control_ids` | list<control_id> | Yes | `[CTRL-LND-002, CTRL-LND-003]` |
| `expected_inputs` | list<schema_id> | Yes | bureau pull, AA stmt |
| `expected_outputs` | list<schema_id> | Yes | KFS PDF, e-sign payload |
| `evidence_expected` | list<evidence_type> | Yes | `[EVD-DOC, EVD-SIGN, EVD-LOG]` |
| `manual_judgement_required` | boolean | Yes | false |
| `bpo_or_vendor_involved` | boolean | Yes | true (DSA) |
| `expected_duration` | duration | Yes | "<1 day typical" |
| `sla_clock` | duration | No | n/a |
| `reporting_clock_trigger` | reporting_clock_id | No | n/a |

### 4.7 `Activity` — Design-time

| Field | Type | Required | Example |
|---|---|---|---|
| `activity_id` | string | Yes | `ACT-LND-06-02` |
| `step_id` | step_id | Yes | `STEP-LND-06` |
| `activity_order` | int | Yes | `2` |
| `name` | string | Yes | "Generate KFS PDF on RE letterhead" |
| `expected_actor_role` | string | Yes | "system" |
| `expected_system` | system_type | Yes | `LOS` |
| `expected_event_type` | string | Yes | `KFS_ISSUED_EVT` |
| `expected_evidence_type` | evidence_type | Yes | `EVD-DOC` |
| `expected_control_ids` | list<control_id> | Yes | `[CTRL-LND-002]` |
| `automation_level` | enum {full, hybrid, manual} | Yes | `full` |
| `failure_modes` | list<string> | Yes | "clock drift; APR table truncation; e-sign timeout" |

### 4.8 `SourceSystem` — Design-time

**Purpose:** the design-time directory of every system the platform ingests from.

| Field | Type | Required | Example |
|---|---|---|---|
| `source_system_id` | string | Yes | `SS-CBS-FNCL-01` |
| `name` | string | Yes | "Finacle Core Banking" |
| `system_type` | enum (CBS, LOS, CRM, DLA, AML_engine, screening_tool, case_mgmt, CKYCR, CERSAI, NPCI, UIDAI, bureau, AA, GSTN, ITSM, SIEM, BPO_platform, FIU_FINnet, CIMS, CRILC, VMO, CMS, HRMS, doc_mgmt, telephony) | Yes | `CBS` |
| `vendor_or_platform` | string | Yes | "Infosys Finacle 10.x" |
| `owner_role` | string | Yes | "CIO / Head of Banking Tech" |
| `authoritative_for` | list<entity_type or attribute> | Yes | `[CUST_MAST, ACCT_MAST, TXN_LOG, IRACP_TAG]` |
| `integration_mode` | enum {CDC, batch, API, file-drop, event-stream, manual} | Yes | `CDC + event-stream` |
| `expected_latency` | duration | Yes | "real-time (≤30s) for CDC; T+1 for batch" |
| `key_fields_delivered` | list<field_name> | Yes | `[ucic, account_id, txn_id, txn_at]` |
| `data_quality_risks` | list<string> | Yes | "schema drift on upgrade; clock drift; truncated batch" |
| `system_of_record_flag` | boolean | Yes | true |
| `retention_policy` | string | Yes | "7y per RBI; 5y per PMLA Rule 9" |
| `pii_sensitivity` | enum {none, low, medium, high, critical} | Yes | `critical` |
| `audit_extract_method` | string | Yes | "DSB extract + CDC replay" |

### 4.9 `SourceRecord` — Run-time, event-sourced

**Purpose:** the basement of audit lineage. Every claim the platform makes ultimately traces here.

| Field | Type | Required | Example |
|---|---|---|---|
| `source_record_id` | string | Yes | `SR-CBS-2026-04-03-T11-22Z-44521` |
| `source_system_id` | source_system_id | Yes | `SS-CBS-FNCL-01` |
| `source_table_or_api` | string | Yes | `ACCT_OPN_EVT` |
| `source_primary_key` | string | Yes | `ACCT-OPN-2026-04-03-44521` |
| `raw_payload_uri` | URI | Yes | object-store URI |
| `raw_payload_hash` | string (sha-256) | Yes | `0x9f2e...` |
| `event_timestamp` | datetime (the source-system event time) | Yes | `2026-04-03T11:22Z` |
| `ingestion_timestamp` | datetime | Yes | `2026-04-03T11:22:14Z` |
| `schema_version` | string | Yes | `FNCL-v10.1.4` |
| `extraction_method` | enum {CDC, batch, API, file-drop} | Yes | `CDC` |
| `retrieval_actor` | actor_id | Yes | `ACTOR-INGEST-CDC-CBS` |
| `pii_classification` | enum {none, low, medium, high, critical} | Yes | `critical` |
| `retention_class` | enum {1y, 5y, 7y, 10y, indefinite, PMLA-Rule-9, RBI-AFI} | Yes | `PMLA-Rule-9` |
| `validation_status` | enum {valid, invalid_schema, invalid_hash, missing_required_field} | Yes | `valid` |
| `orphan_flag` | boolean | Yes | false |
| `correlation_status` | enum (matched, matched_with_warning, orphan, ambiguous_many_to_one, ambiguous_one_to_many, late_arriving, schema_mismatch, timestamp_reversal, needs_review) | Yes | `matched` |
| `linked_process_execution_ids` | list | Yes | `[PE-PROC-KYC-001-...-UCIC-2024-00123]` |
| `linked_evidence_record_ids` | list | Yes | `[EV-LOG-...]` |
| `valid_time` | datetime | Yes | `2026-04-03T11:22Z` |
| `system_time` | datetime | Yes | `2026-04-03T11:22:14Z` |

**Why SourceRecord is the basement of audit lineage:** because RBI inspectors, statutory auditors, FIU-IND auditors and PMLA Rule 9 reconstructions all eventually descend to "show me the actual source row". If the platform cannot present `source_system_id + source_table_or_api + source_primary_key + payload_hash + retrieval_timestamp`, the platform is making an unsourced claim. Every other entity in this data model derives, ultimately, from SourceRecord. This is also the mechanism by which **bi-temporality** is anchored: `valid_time` is the source-system event time; `system_time` is the platform ingestion time.

### 4.10 `CorrelationRecord` — Bridge / Run-time

**Purpose:** make every cross-system join an inspectable, defensible artefact.

| Field | Type | Required | Example |
|---|---|---|---|
| `correlation_id` | string | Yes | `CR-2026-04-03-...-001` |
| `from_entity_type` | enum (any platform entity) | Yes | `SourceRecord` |
| `from_entity_id` | string | Yes | `SR-CBS-...` |
| `to_entity_type` | enum | Yes | `ProcessExecution` |
| `to_entity_id` | string | Yes | `PE-PROC-KYC-001-...-UCIC-2024-00123` |
| `primary_key_used` | string | Yes | `ucic = UCIC-2024-00123` |
| `backup_key_used` | string | No | `pan_hash` |
| `match_method` | enum {anchor, secondary, fuzzy_name, timestamp_window, manual_override} | Yes | `anchor` |
| `match_confidence` | float ∈ [0,1] | Yes | `1.00` |
| `timestamp_window` | duration | No | n/a |
| `expected_cardinality` | enum {one-to-one, one-to-many, many-to-one, many-to-many} | Yes | `one-to-one` |
| `actual_cardinality` | enum (same) | Yes | `one-to-one` |
| `correlation_status` | enum (per Pass 2 §3) | Yes | `matched` |
| `orphan_queue_id` | id | No | n/a |
| `reviewer_id` | actor_id | No | n/a |
| `reviewer_decision` | enum {accept, reject, needs_more_info} | No | n/a |
| `audit_impact` | enum {none, low, medium, high} | Yes | `low` |
| `valid_time`, `system_time` | datetime | Yes | — |

### 4.11 `ProcessExecution` — Run-time, event-sourced

| Field | Type | Required | Example |
|---|---|---|---|
| `process_execution_id` | string | Yes | `PE-PROC-LND-001-2024-12-15T11-30Z-DL-APP-2024-00884` |
| `process_id` | process_id | Yes | `PROC-LND-001` |
| `process_version` | int | Yes | `5` |
| `anchor_key_type` | enum {ucic, alert_id, loan_application_id, vendor_request_id, complaint_id, change_id, incident_id, txn_id} | Yes | `loan_application_id` |
| `anchor_key_value` | string | Yes | `DL-APP-2024-00884` |
| `subject_id` | subject_id | Yes | `SUB-LOAN-DL-APP-2024-00884` |
| `subject_type` | enum {Customer, Loan, Alert, Vendor, Change, Incident, Complaint, Transaction} | Yes | `Loan` |
| `start_ts` | datetime | Yes | `2024-12-13T...` |
| `end_ts` | datetime | No | `2024-12-15T11:30Z` |
| `status` | enum (`process_status` per process; e.g. for LND: submitted, bureau_pulled, policy_evaluated, underwriting, approved, declined, booked, adverse_action_sent, cims_reported, failed_control, data_gap) | Yes | `failed_control` |
| `variant_signature` | hash | Yes | sha256 of actual step order |
| `source_systems` | list<source_system_id> | Yes | LOS, bureaus, e-sign, CBS |
| `correlation_quality_score` | float | Yes | `0.98` |
| `accountable_senior_manager_id` | senior_manager_id | Yes | `SM-HOR-LEND-001` |
| `evidence_completeness` | float | Yes | `0.94` |
| `auditability_score` | float | Yes | `0.92` |
| `control_instance_count` | int | Yes | `5` |
| `failed_control_instance_count` | int | Yes | `1` |
| `data_gap_count` | int | Yes | `0` |
| `evidence_gap_count` | int | Yes | `0` |
| `as_of_ts` | datetime | Yes | now() projection |
| `valid_time`, `system_time` | datetime | Yes | — |

### 4.12 `StepExecution` — Run-time, event-sourced

| Field | Type | Required | Example |
|---|---|---|---|
| `step_execution_id` | string | Yes | `SE-STEP-LND-06-2024-12-15T11-08Z-PE-PROC-LND-001-...-DL-APP-2024-00884` |
| `process_execution_id` | pe_id | Yes | parent |
| `step_id` | step_id | Yes | `STEP-LND-06` |
| `step_version` | int | Yes | `2` |
| `actual_actor_id` | actor_id | Yes | system actor |
| `actual_actor_type` | enum (per P-15 list) | Yes | `system` |
| `actual_system` | source_system_id | Yes | LOS |
| `start_ts` | datetime | Yes | `2024-12-15T11:07:55Z` |
| `end_ts` | datetime | Yes | `2024-12-15T11:08Z` |
| `source_record_ids` | list<sr_id> | Yes | LOS event-stream rows |
| `payload_uri` | URI | No | event payload |
| `variant_signature` | hash | Yes | sha256 |
| `skipped_step_flag` | boolean | Yes | false |
| `manual_override_flag` | boolean | Yes | false |
| `bpo_or_vendor_flag` | boolean | Yes | true (DSA) |
| `geography` | string | No | "PAN-India / Mumbai DSA" |
| `evidence_ids` | list<evidence_id> | Yes | `[EV-DOC-KFS-..., EV-LOG-KFS-EVT-...]` |
| `control_instance_ids` | list<ci_id> | Yes | `[CI-CTRL-LND-002-...]` |
| `as_of_ts`, `valid_time`, `system_time` | datetime | Yes | — |

### 4.13 `ControlInstance` — Run-time, event-sourced

**This is the empirical answer to:** *"Did this control operate on this UCIC / loan / alert / vendor / complaint / IT change at this time?"*

| Field | Type | Required | Example (CI on DL-APP-2024-00884 / CTRL-LND-002) |
|---|---|---|---|
| `control_instance_id` | string | Yes | `CI-CTRL-LND-002-2024-12-15T11-30Z-DL-APP-2024-00884` |
| `control_id` | control_id | Yes | `CTRL-LND-002` |
| `control_version` | int | Yes | `3` |
| `process_execution_id` | pe_id | Yes | parent |
| `step_execution_id` | se_id | Yes | parent step |
| `subject_id`, `subject_type` | per PE | Yes | Loan / DL-APP-2024-00884 |
| `expected_to_fire` | boolean | Yes | true |
| `fired` | boolean | Yes | true |
| `fire_ts` | datetime | Yes | `2024-12-15T11:30Z` |
| `outcome` | enum {Pass, Fail, Data Gap, Evidence Gap, Needs Review} | Yes | `Fail` |
| `outcome_reason` | string | Yes | "kfs_issued_at (11:08Z) ≥ borrower_acceptance_at (10:55Z)" |
| `caught_what_designed` | boolean (for catch-rate) | Yes | true (correctly caught violation) |
| `exception_flag` | boolean | Yes | true |
| `exception_disposition` | enum {open, accepted, escalated, remediated, suppressed_with_reason} | Yes | `escalated` |
| `data_gap_flag` | boolean | Yes | false |
| `evidence_gap_flag` | boolean | Yes | false |
| `correlation_warning_flag` | boolean | Yes | false |
| `operator_id` | actor_id | Yes | system |
| `operator_type` | enum (per P-15) | Yes | `system` |
| `evidence_ids` | list<evidence_id> | Yes | `[EV-DOC-KFS-..., EV-LOG-KFS-EVT-..., EV-LOG-BACC-EVT-..., EV-LOG-AI013-INSIGHT-...]` |
| `accountable_senior_manager_id` | senior_manager_id | Yes | `SM-HOR-LEND-001` |
| `latency_ms` | int | Yes | `12 ms` (rule eval time) |
| `override_reason` | string | No | n/a |
| `override_approved_by` | senior_manager_id | No | n/a |
| `source_system` | source_system_id | Yes | LOS |
| `source_record_ids` | list<sr_id> | Yes | LOS event rows |
| `event_hash` | string | Yes | sha-256 of CI fact |
| `valid_time` | datetime | Yes | `2024-12-15T11:30Z` |
| `system_time` | datetime | Yes | `2024-12-15T11:30:08Z` |

### 4.14 `EvidenceRecord` — Run-time, event-sourced

| Field | Type | Required | Example |
|---|---|---|---|
| `evidence_id` | string | Yes | `EV-DOC-KFS-DL-APP-2024-00884` |
| `evidence_type` | enum {EVD-LOG, EVD-DOC, EVD-ATTEST, EVD-SIGN, EVD-RECON, EVD-CALL, EVD-IMG, EVD-BIO, EVD-API, EVD-REPORT, EVD-WORKPAPER, EVD-BOARD} | Yes | `EVD-DOC` |
| `created_ts` | datetime | Yes | `2024-12-15T11:08Z` |
| `ingested_ts` | datetime | Yes | `2024-12-15T11:08:33Z` |
| `source_system` | source_system_id | Yes | LOS |
| `source_record_id` | sr_id | Yes | LOS KFS_DOC row |
| `payload_uri` | URI | Yes | object-store URI |
| `payload_hash` | string | Yes | `0xb7ce...` |
| `collection_method` | enum {auto, manual_upload, workflow_attestation} | Yes | `auto` |
| `linked_process_execution_id` | pe_id | Yes | parent PE |
| `linked_step_execution_id` | se_id | Yes | parent SE |
| `linked_control_instance_ids` | list<ci_id> | Yes | `[CI-CTRL-LND-002-...]` |
| `retention_class` | enum (PMLA-Rule-9 = 5y, RBI-AFI = 7y, RBI-7y, NPCI-3y, contract-based) | Yes | `PMLA-Rule-9` |
| `chain_of_custody_status` | enum {intact, broken, restored, unknown} | Yes | `intact` |
| `evidence_standard` | enum {regulator-grade, audit-grade, illustrative, internal-only} | Yes | `regulator-grade` |
| `evidence_completeness_score` | float ∈ [0,1] | Yes | `1.00` |
| `evidence_freshness_days` | int | Yes | `0` (just generated) |
| `pmla_rule_9_ready` | boolean | Yes | true |
| `rbi_afi_ready` | boolean | Yes | true |
| `fiu_ready` | boolean | Yes | n/a |
| `statutory_audit_ready` | boolean | Yes | true |
| `concurrent_audit_ready` | boolean | Yes | true |
| `regulator_ready` | boolean | Yes | true |

**Evidence types extension over Pass 4:** `EVD-API` (raw API response payload), `EVD-REPORT` (regulatory submission with ack), `EVD-WORKPAPER` (tester-produced workpaper), `EVD-BOARD` (board / committee pack). All twelve types must be supported as first-class.

### 4.15 `Exception` — Run-time

| Field | Type | Required | Example |
|---|---|---|---|
| `exception_id` | string | Yes | `EXC-2024-12-15-001` |
| `control_instance_id` | ci_id | Yes | failed CI |
| `process_execution_id` | pe_id | Yes | parent |
| `exception_type` | enum {control_failure, data_gap, evidence_gap, correlation_warning, reporting_clock_breach, sla_breach, manual_override, process_drift, suspicious_pattern, vendor_failure} | Yes | `control_failure` |
| `severity` | enum {low, medium, high, very_high} | Yes | `high` |
| `detected_ts` | datetime | Yes | `2024-12-15T11:30Z` |
| `disposition` | enum {open, in_review, escalated, remediated, suppressed_with_reason, false_positive} | Yes | `escalated` |
| `disposition_owner` | actor_id | Yes | Head of Retail Lending |
| `disposition_ts` | datetime | No | — |
| `linked_issue_id` | issue_id | No | `ISS-2026-085` |
| `evidence_ids` | list<evidence_id> | Yes | per CI |
| `accountable_senior_manager_id` | senior_manager_id | Yes | `SM-HOR-LEND-001` |

### 4.16 `Issue` — Run-time

| Field | Type | Required | Example |
|---|---|---|---|
| `issue_id` | string | Yes | `ISS-2026-085` |
| `title` | string | Yes | "KFS post-acceptance pattern in DSA channel" |
| `description` | string | Yes | India narrative |
| `source` | enum {control_failure_cluster, evidence_gap_cluster, AI_signal, audit_finding, regulator_letter, customer_complaint_cluster} | Yes | `AI_signal` (AI-013) |
| `severity` | enum {low, medium, high, very_high} | Yes | `high` |
| `status` | enum {open, in_remediation, awaiting_retest, retest_in_progress, closed, deferred} | Yes | `in_remediation` |
| `raised_date` | date | Yes | `2024-12-16` |
| `target_close_date` | date | Yes | `2025-03-31` |
| `actual_close_date` | date | No | — |
| `owner_id` | actor_id | Yes | Head of Retail Lending |
| `accountable_senior_manager_id` | senior_manager_id | Yes | `SM-HOR-LEND-001` |
| `root_cause` | string | Yes | "DSA channel race condition in LOS event capture" |
| `root_cause_cluster_id` | cluster_id | Yes | `RCC-2026-DSA-LOS-CLOCK-001` |
| `linked_control_ids` | list | Yes | `[CTRL-LND-002]` |
| `linked_control_instance_ids` | list | Yes | `[CI-CTRL-LND-002-...-DL-APP-2024-00884, ...]` |
| `linked_risk_ids` | list | Yes | `[R-CD-001]` |
| `linked_obligation_ids` | list | Yes | `[OBL-RBI-DL-001]` |
| `linked_process_execution_ids` | list | Yes | `[PE-PROC-LND-001-...-DL-APP-2024-00884, ...]` |
| `evidence_ids` | list | Yes | per CIs |
| `regulatory_reportable_flag` | boolean | Yes | false (yet) |
| `rbi_mra_flag` | boolean | Yes | candidate |
| `pmla_exposure_flag` | boolean | Yes | false |
| `fiu_exposure_flag` | boolean | Yes | false |
| `section_47a_exposure_flag` | boolean | Yes | low |

### 4.17 `RemediationAction` / `ActionTask` — Run-time

| Field | Type | Required | Example |
|---|---|---|---|
| `action_id` | string | Yes | `AT-ISS-2026-085-01` |
| `issue_id` | issue_id | Yes | `ISS-2026-085` |
| `description` | string | Yes | "NTP-correct LOS event capture; gate acceptance event before KFS issuance event" |
| `owner_id` | actor_id | Yes | LOS engineering lead |
| `accountable_senior_manager_id` | senior_manager_id | Yes | CIO |
| `due_date` | date | Yes | `2025-02-15` |
| `status` | enum {open, in_progress, blocked, completed, retired} | Yes | `in_progress` |
| `closure_evidence_ids` | list<evidence_id> | Yes (on closure) | LOS NTP attestation, regression test |
| `validation_owner` | actor_id | Yes | HIA / IA Manager |
| `validation_status` | enum {pending, validated, rejected} | Yes | `pending` |
| `retest_required` | boolean | Yes | true |
| `retest_execution_id` | test_id | No | (set when retest run) |

### 4.18 `SeniorManager` / `AccountabilityRecord` — Governance

| Field | Type | Required | Example |
|---|---|---|---|
| `senior_manager_id` | string | Yes | `SM-CCO-001` |
| `name` | string | Yes | (display only) |
| `role` | enum {MD&CEO, CRO, CCO, MLRO/Principal Officer, CISO, CIO/CTO, HIA, Head of FCC, Head of ORM, Head of Retail Lending, Head of VMO, Business Head, Operations Head} | Yes | `CCO` |
| `function` | string | Yes | "Compliance" |
| `accountable_process_ids` | list<process_id> | Yes | `[PROC-KYC-001, PROC-AML-001, PROC-COMP-001]` |
| `accountable_control_ids` | list<control_id> | Yes | `[CTRL-KYC-001..008, CTRL-AML-001..005]` |
| `accountable_risk_ids` | list<risk_id> | Yes | `[R-CO-001, R-FC-001, R-CD-001]` |
| `accountable_issue_ids` | list<issue_id> | Yes | open issues |
| `committee_memberships` | list<committee_id> | Yes | `[BRMC, ACB, RMCE]` |
| `decision_event_ids` | list<decision_id> | Yes | DecisionEvent log |
| `attestation_event_ids` | list<attestation_id> | Yes | AttestationEvent log |
| `reasonable_oversight_evidence_ids` | list<evidence_id> | Yes | EVD-BOARD, EVD-ATTEST |
| `last_attestation_date` | date | Yes | `2026-03-31` |
| `next_attestation_due` | date | Yes | `2026-06-30` |
| `accountability_gap_flag` | boolean | Yes | false |
| `rbi_notification_status` | enum {notified, change_pending, n/a} | Yes (for CCO) | `notified` (per `OBL-RBI-043`) |

### 4.19 `DecisionEvent` — Run-time / Governance

| Field | Type | Required | Example |
|---|---|---|---|
| `decision_id` | string | Yes | `DEC-2024-11-07-...-AML-00501` |
| `decision_type` | enum {EDD_override, policy_exception, STR_decision, fraud_classification, vendor_materiality, cyber_incident_escalation, issue_closure, RBI_voluntary_disclosure, product_halt, capital_overlay} | Yes | `STR_decision` |
| `decision_maker_id` | senior_manager_id | Yes | Principal Officer |
| `decision_timestamp` | datetime | Yes | `2024-11-07T15:30Z` |
| `linked_issue_id` | issue_id | No | n/a |
| `linked_control_instance_id` | ci_id | No | CI-CTRL-AML-003-... |
| `linked_process_execution_id` | pe_id | Yes | PE-PROC-AML-001-...-AML-ALRT-2024-00501 |
| `linked_evidence_ids` | list<evidence_id> | Yes | EVD-DOC (case narrative) |
| `approval_basis` | string | Yes | "structuring pattern across 5 txns; counterparty network match" |
| `dissent_or_exception` | string | No | n/a |
| `committee_record_id` | committee_id | No | n/a |
| `valid_time`, `system_time` | datetime | Yes | — |

### 4.20 `AttestationEvent` — Run-time / Governance

| Field | Type | Required | Example |
|---|---|---|---|
| `attestation_id` | string | Yes | `ATT-2026-Q1-CCO-OCM` |
| `attester_id` | senior_manager_id | Yes | CCO |
| `attestation_type` | enum {control_owner, CCO_compliance, vendor_register, model_validation, board_pack, CIMS_certification, MAP_RMP_closure} | Yes | `CCO_compliance` |
| `scope_type` | enum {control, risk, process, obligation, period} | Yes | `period` |
| `scope_id` | string | Yes | `2026-Q1` |
| `attestation_text` | string | Yes | period attestation |
| `attestation_period_start`, `period_end` | date | Yes | — |
| `evidence_ids` | list<evidence_id> | Yes | aggregated EVDs |
| `exception_disclosed` | string | Yes | "ISS-2026-085 in remediation" |
| `submitted_at` | datetime | Yes | — |
| `valid_time`, `system_time` | datetime | Yes | — |

### 4.21 `TestExecution` — Run-time

| Field | Type | Required | Example |
|---|---|---|---|
| `test_id` | string | Yes | `TE-CTRL-LND-002-2024-Q4` |
| `control_id` | control_id | Yes | `CTRL-LND-002` |
| `test_type` | enum {ToD, ToO, population_reperformance, sample, walkthrough, retest} | Yes | `population_reperformance` |
| `method` | string | Yes | "deterministic timestamp comparison + AI-013 cross-check" |
| `population_size` | int | Yes | `47892` |
| `tested_count` | int | Yes | `47892` |
| `exception_count` | int | Yes | `11118` |
| `data_gap_count` | int | Yes | `0` |
| `evidence_gap_count` | int | Yes | `918` |
| `result` | enum {pass, fail, partial} | Yes | `fail` |
| `evidence_ids` | list<evidence_id> | Yes | population evidence |
| `workpaper_id` | workpaper_id | Yes | `WP-CTRL-LND-002-2024-Q4` |
| `tester_id` | actor_id | Yes | IA Manager |
| `test_window_start`, `_end` | date | Yes | `2024-12-01..2024-12-31` |
| `as_of_date` | date | Yes | `2025-01-15` |
| `sampling_rationale` | string | No | n/a (population) |
| `population_query_ref` | URI | Yes | reproducible query |
| `rerunnable_flag` | boolean | Yes | true |

### 4.22 `Workpaper` — Run-time

| Field | Type | Required | Example |
|---|---|---|---|
| `workpaper_id` | string | Yes | `WP-CTRL-LND-002-2024-Q4` |
| `test_id` | test_id | Yes | parent test |
| `control_id` | control_id | Yes | `CTRL-LND-002` |
| `obligation_ids` | list | Yes | `[OBL-RBI-DL-001]` |
| `evidence_ids` | list | Yes | tester-curated set |
| `generated_summary` | string | Yes | LLM-drafted; tester-edited |
| `reviewer_id` | actor_id | Yes | HIA |
| `status` | enum {draft, in_review, signed, archived} | Yes | `signed` |
| `export_format` | enum {PDF, structured_CSV, JSON, all} | Yes | `all` |
| `rbi_afi_ready` | boolean | Yes | true |
| `pmla_ready` | boolean | Yes | true |
| `statutory_audit_ready` | boolean | Yes | true |
| `concurrent_audit_ready` | boolean | Yes | true |

### 4.23 `AuditPack` — Run-time

| Field | Type | Required | Example |
|---|---|---|---|
| `audit_pack_id` | string | Yes | `AP-RBI-AFI-2026-KYC-001` |
| `scope_type` | enum {process, control, obligation, period, theme} | Yes | `theme` |
| `scope_id` | string | Yes | `KYC-2026-Q1` |
| `title` | string | Yes | "RBI AFI KYC Pack — Q1 2026" |
| `included_controls` | list | Yes | `[CTRL-KYC-001..008]` |
| `included_obligations` | list | Yes | `[OBL-RBI-001..005, OBL-RBI-050]` |
| `included_process_executions` | list | Yes | sample PEs incl. UCIC-2024-00123/00126/00127 |
| `included_control_instances` | list | Yes | per population query |
| `included_evidence` | list | Yes | per CIs |
| `included_issues` | list | Yes | open + closed in window |
| `generated_narrative` | string | Yes | LLM-drafted RBI-style |
| `target_audience` | enum {RBI_AFI, RBI_RBS_SPARC, FIU_IND, CERT_IN_CSITE, Statutory_Auditor, Concurrent_Auditor, Internal_Audit, Board_AC_BRMC} | Yes | `RBI_AFI` |
| `readiness_status` | enum {ready, partial, blocked} | Yes | `ready` |
| `exported_at` | datetime | Yes | export timestamp + hash |

### 4.24 `AIInsight` — AI / Run-time

| Field | Type | Required | Example (AI-013 on DL-APP-2024-00884) |
|---|---|---|---|
| `ai_insight_id` | string | Yes | `AI-INS-2024-12-15-AI013-1102` |
| `signal_id` | string | Yes | `AI-013` |
| `signal_class` | enum {Anomaly, Drift, Coverage Gap, Effectiveness Decay, Evidence Quality, Cluster/RCA, Reporting Risk, Accountability Gap, Model Risk} | Yes | `Anomaly` |
| `title` | string | Yes | "KFS issued after borrower acceptance" |
| `description` | string | Yes | timestamp comparison narrative |
| `model_id` | model_id | Yes | `M-AI013-v1` |
| `model_version` | string | Yes | `v1.4.2` |
| `input_entity_ids` | list | Yes | `[PE-..., SE-..., LOS event rows]` |
| `source_evidence_ids` | list | Yes | `[EV-LOG-KFS-EVT-..., EV-LOG-BACC-EVT-...]` |
| `confidence` | float | Yes | `0.97` |
| `threshold_used` | json {τ_alert, τ_review, τ_action} | Yes | `{0.55, 0.80, 0.95}` |
| `output` | json | Yes | `{violation: true, lag_seconds: -780}` |
| `recommendation` | string | Yes | "Auto-create Issue ISS-... and link to CI" |
| `human_approval_required` | boolean | Yes | false (deterministic) |
| `human_approval_status` | enum {not_required, pending, accepted, rejected, overridden} | Yes | `not_required` |
| `approved_by` | actor_id | No | n/a |
| `risk_if_wrong` | string | Yes | "False positive due to LOS clock drift; CSITE/audit defence weakened if mass-applied without NTP attestation" |
| `linked_issue_id` | issue_id | Yes | `ISS-2026-085` |
| `linked_control_instance_ids` | list | Yes | `[CI-CTRL-LND-002-...]` |
| `linked_risk_ids` | list | Yes | `[R-CD-001]` |
| `linked_obligation_ids` | list | Yes | `[OBL-RBI-DL-001]` |
| `generated_at`, `valid_time`, `system_time` | datetime | Yes | — |

### 4.25 Supporting Entities

| Entity | Purpose | Key fields | India-specific relevance | Linked core entities |
|---|---|---|---|---|
| `KRI` | Key risk indicator design | `kri_id`, `risk_id`, `formula`, `green_band`, `amber_band`, `red_band`, `cadence` | `KRI-FC-016` (alert backlog %), `KRI-FC-017` (L3 case ageing) | Risk, Control |
| `KRIObservation` | Run-time KRI value | `observation_id`, `kri_id`, `value`, `band`, `as_of_ts` | per-cycle MIS | Risk |
| `AppetiteMetric` | Risk appetite design | `appetite_id`, `risk_id`, `metric`, `green_threshold`, `amber_threshold`, `red_threshold`, `board_approval_id` | `APP-FC-002` (alert backlog %) | Risk |
| `AppetiteObservation` | Appetite run-time | per AppetiteMetric | Board RMCB cadence | Risk |
| `Subject` | Customer / Loan / Alert / Vendor / Change cross-process anchor | `subject_id`, `subject_type`, `anchor_keys[]` | UCIC, alert_id, loan_app_id, vendor_request_id | ProcessExecution |
| `Actor` | Human or system actor | `actor_id`, `actor_type`, `role`, `vendor_id`, `branch_id` | BPO actors carry `vendor_id = VEND-ID-203` | StepExecution |
| `RootCauseCluster` | Issue clustering output | `cluster_id`, `cluster_method`, `member_issue_ids`, `signature` | DSA-LOS-clock cluster, BPO-batch-truncation cluster | Issue |
| `ReportingClock` | Design-time clock spec | `clock_id`, `obligation_id`, `start_trigger`, `deadline_spec`, `target_system` | STR 7BD, FMR 14d, RFA 7d, CSITE 2-6h, CERT-In 6h, CIMS quarterly | Obligation, ReportingSubmission |
| `ReportingSubmission` | Run-time submission | `submission_id`, `clock_id`, `submitted_at`, `ack_id`, `ack_at`, `status` | FIU-IND ack, CIMS submission, CERT-In submission | EvidenceRecord |
| `OrphanQueueItem` | Unmatched record holding | `orphan_id`, `source_record_id`, `attempted_keys`, `classification`, `queued_at`, `resolved_at` | concurrent audit daily review per Pass 2 Rule 8 | SourceRecord, CorrelationRecord |
| `SourceSchemaVersion` | Source-system schema versioning | `schema_id`, `source_system_id`, `version`, `effective_from`, `field_renames[]` | Finacle 10.x → 11.x rename of `IRACP_TAG` | SourceSystem |
| `DataQualityRule` | DQ rules per source | `rule_id`, `field`, `rule_type`, `tolerance` | `pan_hash` non-null for adult Indian residents; Aadhaar raw never stored | SourceRecord |
| `ControlPopulation` | Population query reference | `population_id`, `query_uri`, `denominator_count`, `as_of_ts` | per Pass 2 §4.4 / §5.4 / §6.4 / §7.4 | Control, TestExecution |
| `EvidenceSpecification` | Required evidence design | `spec_id`, `obligation_id`, `evidence_type`, `min_completeness` | KFS digital sign + APR table; FIU-IND ack | Obligation, EvidenceRecord |
| `PopulationTestSpecification` | Population test design | `pts_id`, `control_id`, `population_query`, `pass_predicate`, `evidence_predicate` | per CTRL | Control |
| `CommitteeRecord` | Board / committee minutes | `committee_id`, `committee_type`, `meeting_date`, `attendees[]`, `decisions[]`, `evidence_ids[]` | BRMC, ACB, RMCE; board pack provenance | DecisionEvent, AttestationEvent |
| `RegulatoryChangeEvent` | Regulation amendment / new MD | `change_id`, `regulation_id`, `change_type`, `effective_from`, `impacted_obligations[]` | 28-Nov-2025 consolidation; 12-Jun-2025 KYC amendment | Regulation, Obligation |
| `Model` | AI model registry | `model_id`, `capability`, `version`, `trained_at`, `training_data_id`, `approved_by`, `effective_from`, `effective_to` | `M-AI001-v2.1` for mule detection; subject to `R-MR-001` | AIInsight, ModelRiskRecord |
| `ModelRiskRecord` | Model validation / drift / override | `mrr_id`, `model_id`, `validation_at`, `drift_metrics`, `override_count`, `validator_id` | ITGRCA model-risk expectations | Model |
| `VendorDependency` | Vendor → Process / Control map | `dep_id`, `vendor_id`, `process_id`, `control_id`, `materiality`, `criticality` | VEND-2024-00203 → AML L1 dispositioning | Process, Control |
| `ThirdPartyDependency` | Generic third-party (incl. fourth-party chains) | `tpd_id`, `parent_vendor_id`, `child_vendor_id`, `disclosed_flag` | VEND-2024-00205 fourth-party of VEND-2024-00203 | VendorDependency |
| `OperationalResilienceService` | Critical-operation node | `cos_id`, `name`, `dependencies[]`, `impact_tolerance`, `dr_drill_record_id` | UPI rails, CBS, AML engine, sanctions tool, BPO L1 | Process, Vendor |
| `SeniorManagementResponsibility` | Pre-mapped accountability spec | `responsibility_id`, `role`, `process_id`, `control_id`, `obligation_id` | CCO / MLRO / CISO / HIA accountability matrix | SeniorManager |

---

## 5. Relationships

### 5.1 Relationship Catalogue

| # | From | To | Cardinality | Join entity / attributes | Why it matters |
|---|---|---|---|---|---|
| 1 | `Regulation` | `Obligation` | 1-to-many | direct edge `:DERIVES_TO` | RBI MD → atomic obligations |
| 2 | `Regulation` | `RegulatoryChangeEvent` | 1-to-many | direct edge `:AMENDED_BY` | track 28-Nov-2025 consolidation |
| 3 | `Obligation` ↔ `Control` | `Control :COVERS Obligation` | many-to-many | `ControlObligationLink {coverage_strength, effective_from, effective_to}` | OCM heat map; AI-003 coverage gap detection |
| 4 | `Obligation` ↔ `EvidenceSpecification` | direct edge | 1-to-many | — | what evidence proves the obligation |
| 5 | `Risk` ↔ `Control` | `Control :MITIGATES Risk` | many-to-many | `RiskControlLink {strength}` | residual risk computation |
| 6 | `Risk` ↔ `KRI` | direct edge | 1-to-many | — | KRI-driven appetite |
| 7 | `Risk` ↔ `AppetiteMetric` | direct edge | 1-to-1 typical | — | board appetite tracking |
| 8 | `Control` ↔ `ProcessStep` | direct edge `:OPERATES_ON` | many-to-many | `position_in_step` | where in the process the control fires |
| 9 | `Control` ↔ `EvidenceSpecification` | direct edge | 1-to-many | — | required evidence per control |
| 10 | `Process` → `ProcessStep` | direct edge | 1-to-many | `step_order` | process spine |
| 11 | `ProcessStep` → `Activity` | direct edge | 1-to-many | `activity_order` | step decomposition |
| 12 | `Process` → `ProcessExecution` | direct edge `:INSTANCE_OF` | 1-to-many | — | run-time materialisation |
| 13 | `ProcessExecution` → `StepExecution` | direct edge | 1-to-many | — | journey decomposition |
| 14 | `StepExecution` → `Activity` | direct edge `:EXECUTED` | many-to-many | — | activity-level traceability |
| 15 | `SourceRecord` → `ProcessExecution` | direct edge `:FEEDS` | many-to-1 typical | — | the basement |
| 16 | `SourceRecord` → `StepExecution` | direct edge | many-to-many | — | step-level provenance |
| 17 | `SourceRecord` → `EvidenceRecord` | direct edge | 1-to-many | — | evidence provenance |
| 18 | `CorrelationRecord` ↔ `SourceRecord` | direct edge | many-to-many | per Pass 2 §3 | join defensibility |
| 19 | `CorrelationRecord` ↔ `ProcessExecution / StepExecution / EvidenceRecord` | direct edge | many-to-many | — | join defensibility per platform entity |
| 20 | `StepExecution` → `ControlInstance` | direct edge `:EVALUATES` | 1-to-many | — | control eval per step |
| 21 | `ControlInstance` ↔ `EvidenceRecord` | direct edge `:PROVED_BY` | many-to-many | — | evidence linkage for CES |
| 22 | `ControlInstance` → `Exception` | direct edge | 1-to-1 (when exception_flag=true) | — | exception raise |
| 23 | `Exception` → `Issue` | direct edge `:PROMOTED_TO` | many-to-1 | — | exception clustering |
| 24 | `Issue` → `RemediationAction / ActionTask` | direct edge | 1-to-many | — | issue closure |
| 25 | `Issue` ↔ `Risk` | direct edge `:AFFECTS` | many-to-many | — | risk posture roll-up |
| 26 | `Issue` ↔ `Obligation` | direct edge `:EXPOSES` | many-to-many | — | obligation breach traceability |
| 27 | `Issue` ↔ `Control` | direct edge | many-to-many | — | control degrade tracking |
| 28 | `Issue` ↔ `ProcessExecution` | direct edge | many-to-many | — | per-PE issue map |
| 29 | `SeniorManager` ↔ `Risk` | edge `:ACCOUNTABLE_FOR` | many-to-many | — | accountability |
| 30 | `SeniorManager` ↔ `Control` | edge `:ACCOUNTABLE_FOR` | many-to-many | — | accountability |
| 31 | `SeniorManager` ↔ `Process` | edge `:ACCOUNTABLE_FOR` | many-to-many | — | accountability |
| 32 | `SeniorManager` ↔ `Issue` | edge `:OWNS` | many-to-many | — | accountability |
| 33 | `DecisionEvent` ↔ `ControlInstance / Issue / EvidenceRecord` | direct edge | many-to-many | — | reasonable-steps file |
| 34 | `AttestationEvent` ↔ `Control / Risk / Issue / EvidenceRecord` | direct edge | many-to-many | — | period attestation |
| 35 | `EvidenceRecord` → `Workpaper` | direct edge | many-to-many | — | workpaper assembly |
| 36 | `TestExecution` → `Workpaper` | direct edge | 1-to-1 | — | test → workpaper |
| 37 | `Workpaper` → `AuditPack` | direct edge | many-to-many | — | audit pack composition |
| 38 | `ReportingClock` → `ReportingSubmission` | direct edge | 1-to-many | — | clock instance |
| 39 | `ReportingSubmission` → `EvidenceRecord` | direct edge | 1-to-many | — | ack as evidence |
| 40 | `VendorDependency` ↔ `Process` | direct edge | many-to-many | — | TPSP impact map |
| 41 | `VendorDependency` ↔ `Control` | direct edge | many-to-many | — | TPSP-operated control |
| 42 | `AIInsight` → source evidence / source entities | direct edge | many-to-many | — | explainability |
| 43 | `AIInsight` → `Issue` | direct edge `:RESULTED_IN` | many-to-1 | — | signal-to-issue |
| 44 | `AIInsight` → `Model` | direct edge | many-to-1 | — | model provenance |
| 45 | `Model` → `ModelRiskRecord` | direct edge | 1-to-many | — | MRM lifecycle |

### 5.2 Conceptual Graph (text form)

The graph spine — the chain that every persona drill-down traverses — is:

```
Regulation
  └─:DERIVES_TO─► Obligation
                     ├─:COVERED_BY─► Control
                     │                  ├─:OPERATES_ON─► ProcessStep ◄─:CONTAINS─ Process
                     │                  │                                   └─:INSTANCE_OF─► ProcessExecution
                     │                  │                                                       └─► StepExecution
                     │                  │                                                                 └─:EVALUATES─► ControlInstance
                     │                  │                                                                                    ├─:PROVED_BY─► EvidenceRecord
                     │                  │                                                                                    └─:RAISES─► Exception
                     │                  │                                                                                                    └─:PROMOTED_TO─► Issue
                     │                  │                                                                                                                       └─► RemediationAction
                     │                  │                                                                                                                       └─► Workpaper ─► AuditPack
                     ├─:HAS_CLOCK─► ReportingClock ─► ReportingSubmission ─► EvidenceRecord
                     └─:EVIDENCED_BY_SPEC─► EvidenceSpecification
```

**Lateral connections (the parts that make the graph defensible, not just hierarchical):**

- **`SourceRecord` is the basement.** SourceRecord `:FEEDS` ProcessExecution, StepExecution, EvidenceRecord and ControlInstance. Every entity above has a traversable path back to one or more SourceRecords with `payload_hash` and `retrieval_timestamp`. PMLA Rule 9 reconstructability is precisely this path.
- **`CorrelationRecord` connects fragmented source records to platform entities.** Where a join is non-anchor (Pass 2 Rules 1-10), a CorrelationRecord is created with `match_method`, `match_confidence`, `expected_cardinality`, `actual_cardinality` and `correlation_status`. This is the entity that holds the join defensibility.
- **`SeniorManager` is connected to Risk, Control, Process, Issue, DecisionEvent, AttestationEvent.** Five edges; together they make the reasonable-steps file traversable. PERSONA-001's accountability drill-down is exactly this subgraph.
- **`ReportingClock` is connected to Obligation (design), Control (design), ReportingSubmission (run-time) and EvidenceRecord (ack).** The clock is what turns a "we did it" claim into a "we did it within statutory window" claim. PMLA s.12(1)(b) STR 7-BD, CERT-In 6-hr, FMR 14-d, RFA 7-d, CSITE 2-6 hr, CIMS quarterly — all live on this entity.
- **`AIInsight` is connected to source evidence (`:EVIDENCED_BY`), Model (`:PRODUCED_BY`), Evidence (`:CITES`), Issue (`:RESULTED_IN`), Control / ControlInstance (`:ABOUT`), Risk (`:ELEVATES`).** Every insight is graph-resident; no opaque AI side-effects. ITGRCA model-risk and OUT-010 (AI Trust) are satisfied by this exact subgraph.
- **`VendorDependency` and `ThirdPartyDependency` connect Process and Control to vendors and fourth parties.** This is what allows fourth-party undisclosed exposures (VEND-2024-00205 archetype) to surface without being entered manually.

---

## 6. RCM Normalisation Rules

The Pass 4 RCM is the *substrate*, not the *product*. The platform reads the RCM, normalises every column, every multi-value cell, and every implicit relationship into the entities defined in Section 4. After ingestion, the spreadsheet is no longer the source of truth; the graph is. The following 18 rules govern that normalisation.

| # | RCM artefact | Normalised target | Rule |
|---|---|---|---|
| 1 | RCM row (one row per control) | `Control` design-time record | Each row promoted to a `Control` node with stable `control_id` (CTRL-*); RCM column values populate `Control.*` fields per Pass 4 field-definition mapping. |
| 2 | "Risk description" column | `Risk` entity | Free-text descriptions normalised against the Pass 1 risk taxonomy; `risk_id` stable; new descriptions never create duplicate Risk nodes — they update versioned descriptions. |
| 3 | "RBI / PMLA / FIU references" column | `Obligation` entities | Each citation parsed (or AI-003-extracted) into one or more `Obligation` records; the cell becomes a many-to-many `:COVERS` edge with `coverage_strength`. |
| 4 | "Process / Sub-process" columns | `Process` and `ProcessStep` entities | Process column → `Process.name`; sub-process cells either group `ProcessStep`s or become a sub-process attribute on the Process. |
| 5 | "Step" column | `ProcessStep` (or `Activity` if granular) | If the step is a major journey stage, it is a `ProcessStep`; if it is an activity inside a step, it is an `Activity`. The promoter rule is: if a control fires *at* it, it is at least a `ProcessStep`. |
| 6 | "Evidence types" column | `EvidenceSpecification` records (design) and `EvidenceRecord` (run-time) | Pass 4 evidence types (EVD-LOG / DOC / ATTEST / etc.) become `EvidenceSpecification` per control. Run-time evidence becomes `EvidenceRecord`. |
| 7 | "Source systems" column | `SourceSystem` records | Each named source system normalised to `SourceSystem` registry; CDC / batch / API mode populated; `key_fields_delivered` validated against join logic in Pass 2. |
| 8 | "Owner / Operator / Accountable Person" cells | `Actor` and `SeniorManager` links | Owner role → `Control.owner_role`; named accountable executive → `SeniorManager` node + `:ACCOUNTABLE_FOR` edge. Free-text titles must resolve to a `SeniorManager.role` enum. |
| 9 | "Test result" cells (CES, pass count, etc.) | `TestExecution` records | Static cells become *outdated* the moment a new run is completed; `TestExecution` node is the live answer; the RCM cell becomes a projection from the latest TestExecution. |
| 10 | "Open issues" column | `Issue` and `RemediationAction` records | Issue IDs in the cell become edges to `Issue` nodes; the cell becomes a projection from the live issue register. |
| 11 | "AI signals" column | `AIInsight` specifications | AI signal IDs (AI-001..019) become edges to `AIInsight` nodes; `Model` node holds version. |
| 12 | Multi-value (semicolon-separated) cells | typed join tables | E.g., "ISS-2026-009;ISS-2026-052" becomes two `IssueControlLink` rows. No semicolon-string ever survives in the platform schema. |
| 13 | Static RCM values (control_type, frequency, status, etc.) | design-time fields on `Control` | Versioned. Changes produce new `Control` versions, not in-place edits. |
| 14 | "Actual control operation" implied cells (e.g., effectiveness signals) | `ControlInstance` records | Run-time-only. Append-only. |
| 15 | "Actual evidence" implied cells | `EvidenceRecord` records | Run-time. Provenance-stamped. |
| 16 | Historical changes (version log) | versioned records + append-only `Event` log | Every RCM change becomes an Event with `valid_time` (effective date) and `system_time` (recorded date). |
| 17 | "Reporting deadline" cells (CTR 15th, STR 7BD, FMR 14d, etc.) | `ReportingClock` records | Each clock becomes a design-time entity; the run-time submission is a `ReportingSubmission`. |
| 18 | "Orphan / missing / ambiguous" debug cells | `CorrelationRecord` and `OrphanQueueItem` records | Never preserved as text. Always promoted to the bridge entities defined in §4.10 / §4.25. |

The spreadsheet **is not** preserved as the product model. The spreadsheet is **only used to extract structure** at ingestion and at every regulatory-change event; from that moment on, the graph evolves and the spreadsheet drifts away. Any view of "the RCM" presented to PERSONA-002 / PERSONA-003 is a graph projection, not a sheet read.

---

## 7. Derived Metrics

Ten metrics. Each is a graph computation, not a stored number; every metric drills to source records (Principle P-20).

### 7.1 Control Effectiveness Score — CES

| Aspect | Detail |
|---|---|
| What it measures | Whether a control was expected to fire, did fire, produced evidence, caught what it was designed to catch, avoided data gaps and evidence gaps, and was correctly dispositioned on exception |
| Formula | `CES = 0.40 × OperatingRate + 0.40 × CatchRate + 0.20 × EvidenceCompleteness` |
| **OperatingRate** | denominator = expected-to-fire `ControlInstance`s (from `Control.population_test_specification_id`); numerator = fired `ControlInstance`s with `outcome ∈ {Pass, Fail, Needs Review}` *excluding* `Data Gap` |
| **CatchRate** | denominator = fired `ControlInstance`s where a risk condition existed or evaluation was meaningful (validated against AI-signal post-validation, BPO exception logs, audit findings, complaints, NPCI feedback); numerator = `ControlInstance`s with `caught_what_designed = TRUE` |
| **EvidenceCompleteness** | denominator = required `EvidenceRecord`s (per `EvidenceSpecification`); numerator = `EvidenceRecord`s with `evidence_completeness_score = 1.0`, `payload_hash` valid, `source_system` linked |
| Output range | 0–100 |
| Bands | Green ≥80; Amber 60–79; Red <60; Grey when `data_gap_rate > 20%`, `population < 30`, or source connectivity > 4 h interrupted |
| Persona served | PERSONA-001 (residual risk), PERSONA-002 (OCM), PERSONA-003 (testing) |
| Drilldown path | CES → ControlInstance population → individual ControlInstance → EvidenceRecord → SourceRecord → SourceSystem |
| India-specific interpretation | OperatingRate is **the regulator's number** (whether the bank is doing the control on the population it should); CatchRate is the **platform's grade for itself**. PERSONA-001 reads OperatingRate; PERSONA-002 reads all three. The Pass 2 §10.4 worked example (CTRL-LND-002 CES 89.51 with OperatingRate 74.77%) is exactly this distinction in action. |

**Why Data Gap, Evidence Gap and Fail affect CES differently:** Fail subtracts from the OperatingRate numerator (expected and fired but failed); Data Gap pulls the affected ControlInstances *out of the denominator* (cannot be evaluated) **and triggers Grey CES if the rate exceeds 20%**; Evidence Gap leaves OperatingRate untouched but subtracts from EvidenceCompleteness sharply. Conflating these — say, treating a Data Gap as a Fail — produces a panic-level Red CES on a control that may actually be operating correctly, and prompts misallocated remediation.

### 7.2 Risk Exposure Score — RES

| Aspect | Detail |
|---|---|
| What it measures | Current residual risk by domain; the CRO posture cockpit number |
| Inputs | inherent risk (`Risk.inherent_rating`), linked CES values (weighted by `RiskControlLink.strength`), KRI bands (`KRIObservation`), appetite breaches (`AppetiteObservation`), open issue load (count + severity weighting), failed `ControlInstance` count, `EvidenceCompleteness` aggregate, `data_gap_count`, `correlation_warning_count`, overdue `RemediationAction` count, `accountability_gap_flag` count |
| Formula sketch | `RES = inherent_rating + Σ(control_failure_pressure) + Σ(KRI_breach_pressure) + Σ(issue_load_pressure) − Σ(control_strength_credit)` mapped onto Low / Medium / High / Very High; computed as-of-date |
| Output range | enum {Low, Medium, High, Very High} with continuous score behind |
| Bands | Green = Low; Amber = Medium; Red = High; Crimson = Very High |
| Persona served | PERSONA-001 (cockpit); PERSONA-002 (functional roll-up) |
| Drilldown path | RES domain → driving Risks → Controls → ControlInstances → Evidence → SourceRecord |
| India-specific interpretation | Drives the CRO / MD&CEO / BRMC residual-risk view; SPARC IRISc internal mock; ICAAP residual-risk inputs. Crimson on `R-FC-001` plus an open ISS-2026-009 family triggers immediate PERSONA-001 escalation. |

### 7.3 Audit Readiness Score — ARS

| Aspect | Detail |
|---|---|
| What it measures | Whether the bank can answer an RBI / FIU / Statutory / Concurrent / Internal Audit data call **tomorrow** |
| Inputs | `evidence_coverage` (% of obligations with fresh evidence), `source_record_completeness` (% of expected source rows ingested), `correlation_quality_score` (DCQS), `population_testability` (% of controls testable on population vs sample-only), `walkthrough_freshness` (days since last process walkthrough), `issue_drag` (open MRA / RMP / MAP items), `workpaper_exportability` (% of TestExecutions producing AFI-ready workpapers), `rbi_afi_ready_evidence_pct`, `pmla_rule_9_ready_evidence_pct`, `evidence_integrity_score` (EIFS) |
| Formula sketch | weighted aggregate; weights publishable in `Config` |
| Output range | 0–100 |
| Bands | Green ≥85; Amber 70–84; Red <70 |
| Persona served | PERSONA-001 (board-ready answer to "if RBI walks in tomorrow"); PERSONA-002 (function-by-function); PERSONA-003 (workpaper readiness) |
| Drilldown path | ARS → driver components → impacted Controls / Obligations → Evidence → SourceRecord |
| India-specific interpretation | The single most-asked CRO question (Q-CRO-10). Drives the inspection-pack pre-staging across RBI AFI, RBS / SPARC, FIU-IND, CSITE / CERT-In, statutory, concurrent, IA. |

### 7.4 Obligation Coverage Score — OCS

| Aspect | Detail |
|---|---|
| What it measures | How strongly each obligation is covered by controls |
| Inputs | `linked_control_count`, mean `coverage_strength` of linked controls, mean CES of linked controls, `evidence_specification_match_score`, `source_system_availability`, `unmapped_obligation_penalty` (full deduction for any obligation with zero `:COVERS` edge), `stale_evidence_penalty`, `control_design_gap_penalty` |
| Output | 0–100 per obligation |
| Bands | Strong ≥85; Adequate 70–84; Thin 50–69; Gap <50 |
| Persona served | PERSONA-002 (OCM); PERSONA-003 (workpaper anchor) |
| Drilldown path | OCS → linked Controls → ControlInstance population → Evidence |
| India-specific interpretation | Direct answer to Q-CCO-01 ("Which obligations are weakly covered?"); drives the AI-003 coverage-gap insight queue. |

### 7.5 Evidence Integrity & Freshness Score — EIFS

| Aspect | Detail |
|---|---|
| What it measures | Whether evidence is complete, fresh, tamper-resistant and regulator-ready |
| Inputs | `evidence_completeness` (per `EvidenceRecord`), `payload_hash_present` (boolean → ratio), `source_system_metadata_complete` (ratio), `chain_of_custody_status = intact` (ratio), `freshness_days` (vs SLA per `EvidenceSpecification`), `retention_class` correctness, `source_record_linkage` (ratio), `pmla_rule_9_ready` (ratio), `rbi_afi_ready` (ratio), `fiu_ready` (ratio) |
| Output | 0–100 |
| Bands | Green ≥90; Amber 75–89; Red <75 |
| Persona served | PERSONA-002, PERSONA-003 |
| Drilldown path | EIFS → EvidenceRecord population → SourceRecord |
| India-specific interpretation | PMLA Rule 9 5-year reconstructability; RBI AFI evidence completeness MRA risk; FIU-IND audit-trail expectation. |

### 7.6 Data Correlation Quality Score — DCQS

| Aspect | Detail |
|---|---|
| What it measures | Whether source records are correctly joined into audit-grade platform entities |
| Inputs | mean `match_confidence`, `primary_key_match_rate`, `backup_key_match_rate`, `orphan_rate`, `ambiguous_join_rate`, `timestamp_reversal_count`, `schema_mismatch_count`, `late_arriving_record_rate` |
| Output | 0–100 |
| Bands | Green ≥95; Amber 85–94; Red <85 |
| Persona served | PERSONA-002 (data-lineage owner); PERSONA-003 (workpaper reproducibility) |
| Drilldown path | DCQS → CorrelationRecord population → orphan queue → SourceRecord |
| India-specific interpretation | Prevents false-Green CES caused by undetected correlation breakage — for example a CTRL-AML-002 at 92% CES that is actually 65% Catch-Rate due to BPO-CBS mis-keying (HSBC India Feb-2025 archetype). DCQS is the platform's self-honesty number. |

### 7.7 Process Variant Drift Score — PVDS

| Aspect | Detail |
|---|---|
| What it measures | The gap between documented process and actual execution |
| Inputs | hash distance between `Process.documented_variant_signature` and `ProcessExecution.variant_signature`; `skipped_step_flag` rate; `manual_override_flag` rate; off-system activity inferred from missing StepExecutions; unusual `actor_type` mix; unusual `geography`; BPO handoff anomalies; vendor-executed steps |
| Output | 0–100 (higher = more drift) |
| Bands | Green ≤10; Amber 11–25; Red >25 |
| Persona served | PERSONA-002 (process owner / CCO); PERSONA-003 (concurrent audit) |
| Drilldown path | PVDS → Process → outlier ProcessExecutions → StepExecution variants |
| India-specific interpretation | The Paytm PB / Kotak / HDFC / Bajaj Finance archetypes are exactly drift events; AI-002 surfaces them. |

### 7.8 Reporting Timeliness Score — RTS

| Aspect | Detail |
|---|---|
| What it measures | Whether regulatory reporting clocks are met |
| Inputs | per-clock `ReportingSubmission` window-met ratio: STR 7BD; CTR 15th-of-next-month; NTR / CCR / CBWTR per FIU-IND rules; FMR 14d; RFA 7d; CERT-In 6h; CSITE 2-6h; CIMS quarterly; CRILC quarterly; submission ack receipt rate; rejection rate; resubmission delay |
| Output | 0–100 per clock; aggregate 0–100 |
| Bands | Green = 100%; Amber ≥98%; Red <98% (any miss is material for STR / CERT-In) |
| Persona served | PERSONA-002 (MLRO / CCO / CISO) |
| Drilldown path | RTS → ReportingClock → ReportingSubmission → EvidenceRecord (ack) → SourceRecord |
| India-specific interpretation | A single STR miss is a PMLA s.13 referral risk; a single CERT-In miss is a CSITE penalty risk. RTS must be 100%, not "high". |

### 7.9 Senior Accountability Evidence Score — SAES

| Aspect | Detail |
|---|---|
| What it measures | Whether accountable senior managers have defensible evidence of oversight |
| Inputs | `decision_log_completeness` per SeniorManager, `committee_record_attendance`, `attestation_freshness` (per `AttestationEvent.next_due`), `issue_awareness` (% of own issues acknowledged within SLA), `escalation_timeliness`, `remediation_follow_up`, `board_committee_evidence_ratio`, `accountable_owner_mapping_completeness` |
| Output | 0–100 per SeniorManager; aggregate 0–100 |
| Bands | Green ≥95; Amber 85–94; Red <85 |
| Persona served | PERSONA-001 (the personal one) |
| Drilldown path | SAES → SeniorManager → DecisionEvent / AttestationEvent / CommitteeRecord → Evidence |
| India-specific interpretation | The defence file for any future Sec 47A / Sec 36AA / PMLA s.13 / Fit & Proper review. CCO-specific uplift: `OBL-RBI-043` notification status. |

### 7.10 AI Trust & Explainability Score — AITES

| Aspect | Detail |
|---|---|
| What it measures | Whether AI outputs are usable in a regulated banking environment |
| Inputs | per `AIInsight`: `linked_source_evidence_count > 0`, `model_version` set, `threshold_used` set, `human_approval_status ∈ {accepted, not_required}`, FP review rate, `ModelRiskRecord.completeness`, drift-monitoring presence, audit trail completeness |
| Output | 0–100 |
| Bands | Green ≥95; Amber 85–94; Red <85 |
| Persona served | All three personas (the trust gate) |
| Drilldown path | AITES → AIInsight → Model → ModelRiskRecord → source evidence |
| India-specific interpretation | ITGRCA model-risk expectations; the platform's own `R-MR-001`. Reading <Green halts AI auto-creation of Issues until remediated. |

---

## 8. Indian RCM Grounding

| # | Indian banking domain | Example obligation | Example risk | Example control | Evidence expected | Source systems | Metric impacted |
|---|---|---|---|---|---|---|---|
| 1 | KYC / CDD / EDD / CKYCR | `OBL-RBI-001` (CDD before activation); `OBL-RBI-003` (CKYCR upload) | `R-FC-001` Financial Crime; `R-CO-001` Compliance | `CTRL-KYC-001` (4-eye CDD before activation); `CTRL-KYC-008` (CKYCR upload window) | EVD-LOG (UIDAI eKYC), EVD-DOC (OVD), EVD-LOG (CKYCR ack), EVD-BIO (Aadhaar OTP) | CBS, UIDAI, NSDL PAN, DigiLocker, CKYCR | CES, OCS, EIFS |
| 2 | PMLA / AML / transaction monitoring | `OBL-PMLA-001` (record retention reconstructable per Rule 9); `OBL-PMLA-004` (scenario coverage) | `R-FC-001` | `CTRL-AML-002` (alert SLA); `CTRL-AML-004` (scenario coverage) | EVD-LOG (case mgmt), EVD-DOC (closure narratives), EVD-ATTEST (annual coverage matrix) | AML engine (Mantas / FCCM / Actimize), case mgmt (Pega / Appian), CBS | CES, OCS, RES, RTS |
| 3 | STR / FIU-IND FINnet 2.0 | `OBL-FIU-STR-001` (STR ≤7 BD per PMLA s.12(1)(b)) | `R-FC-001` | `CTRL-AML-003` | EVD-LOG (FINnet submission), EVD-DOC (STR XML), EVD-LOG (FIU ack) | Case mgmt → FIU-IND FINnet 2.0 | RTS, CES, EIFS |
| 4 | Sanctions / PEP / UAPA screening | `OBL-RBI-050` (UAPA daily); KYC MD sanctions clauses | `R-FC-001` | `CTRL-KYC-002`; `CTRL-AML-001` | EVD-LOG (screening run with `list_version_at`) | Fircosoft / Bridger / in-house, UAPA list | CES, RTS (daily), EIFS |
| 5 | UPI fraud / mule account detection | `OBL-RBI-031` (EWS framework, MD on FRM 15-Jul-2024); NPCI-PG | `R-FR-001` Fraud; `R-FC-001` | `CTRL-UPI-001` (real-time fraud scoring); `CTRL-AML-005` (mule graph) | EVD-LOG (NPCI feed), EVD-LOG (AI-001 insight) | NPCI, AML engine, UPI app, fraud engine | CES, RES, AITES |
| 6 | Digital lending / KFS / DLA / LSP | `OBL-RBI-DL-001` (KFS pre-acceptance per Para 8 of `RBI/2025-26/36`) | `R-CD-001` Conduct | `CTRL-LND-002` | EVD-DOC (KFS PDF), EVD-SIGN (e-sign), EVD-LOG (LOS event) | LOS, e-sign / DigiLocker, DLA, CIMS | CES, OCS, RTS (CIMS) |
| 7 | Credit underwriting / bureau / AA / GST | `OBL-RBI-038` (system-driven IRACP); `OBL-RBI-029` (AA consent) | `R-CR-001` Credit | `CTRL-LND-001` (4-bureau pull); `CTRL-LND-003` (policy exception) | EVD-LOG (4 bureaus), EVD-DOC (AA stmt), EVD-DOC (GST / ITR) | Bureaus (CIBIL / CRIF / Experian / Equifax), AA, GSTN, IT portal | CES, OCS |
| 8 | IRACP / NPA tagging / EWS / RFA | `OBL-RBI-036` / `OBL-RBI-037` / `OBL-RBI-038`; `OBL-RBI-031` / `OBL-RBI-032` | `R-CR-001`; `R-FR-001` | `CTRL-LND-004` (IRACP day-end); `CTRL-LND-005` (EWS / RFA) | EVD-LOG (CBS IRACP tag), EVD-LOG (EWS event), EVD-LOG (RFA / FMR) | CBS, EWS engine, CRILC | CES, RTS (RFA 7d, FMR 14d) |
| 9 | Complaints / Internal Ombudsman | RB-IOS 2021; Internal Ombudsman Scheme 2018 (as amended) | `R-CD-001` | `CTRL-COMP-001` (IO review of wholly rejected complaints) | EVD-DOC (IO sign-off), EVD-ATTEST | CMS, IO workflow | CES, OCS |
| 10 | Vendor / TPSP outsourcing | `OBL-RBI-016` (material outsourcing); `OBL-RBI-017` (sub-contractor); `OBL-RBI-018` (contract); `OBL-RBI-019` (TPSP 6h) | `R-TP-001` Vendor; `R-TC-001` IT/Cyber | `CTRL-VND-001`; `CTRL-VND-002` | EVD-DOC (DDQ, SOC, contract), EVD-ATTEST (quarterly), EVD-LOG (incident) | VMO / GRC, contracts repo, MCA portal, CVE feeds | CES, OCS, RTS (6h), AITES (AI-009) |
| 11 | IT operations / cyber / incident / change | `OBL-RBI-007..015` (ITGRCA); `OBL-RBI-013` (2-6 h CSITE) | `R-TC-001` | `CTRL-ITO-001` (cyber 6h); `CTRL-ITO-002` (privileged access) | EVD-LOG (ITSM), EVD-LOG (SIEM), EVD-DOC (RBI submission), EVD-ATTEST | ITSM, SIEM, IAM, AD, PAM, CERT-In portal | CES, RTS (CSITE), EIFS |
| 12 | CERT-In / CSITE / RBI cyber reporting | `OBL-RBI-048` (CERT-In 6h); `OBL-RBI-013` | `R-TC-001`; `R-OP-001` | `CTRL-ITO-001` | EVD-LOG (CERT-In submission), EVD-DOC (envelope), EVD-LOG (ack) | CERT-In portal, ITSM, SIEM | RTS, AITES (AI-019) |
| 13 | Data privacy / Aadhaar / DPDP | `OBL-RBI-049` (DPDP breach notify); Aadhaar Act s.29 (data minimisation) | `R-CO-001`; `R-TC-001` | DPDP-overlay on `CTRL-VND-001`; data-handling DQ rules on SourceRecord | EVD-DOC (DPDP impact assessment), EVD-LOG (breach notification) | All PII source systems; Data Protection Board interface | CES, EIFS |
| 14 | Regulatory reporting / CIMS / CRILC | `OBL-RBI-025` (CIMS DLA quarterly); `OBL-RBI-047` (DSB / XBRL); CRILC | `R-CO-001`; `R-CR-001` | `CTRL-LND-005` (CIMS); IRACP / CRILC controls | EVD-LOG (submission), EVD-ATTEST (CCO certification) | CIMS, CRILC, RBI XBRL, LOS, CBS | RTS, OCS |
| 15 | Operational resilience / critical operations | `OBL-RBI-040` / `OBL-RBI-041` (Op-Risk Guidance Note 30-Apr-2024) | `R-OP-001`; `R-TP-001` | Op-Resilience controls; `OperationalResilienceService` mapping | EVD-DOC (impact tolerance), EVD-LOG (DR drill), EVD-ATTEST (board approval) | All material source systems + VMO + ITSM | RES, ARS |

---

## 9. Source-System to Entity Mapping

### 9.1 Mapping Table

| Source system | Key records captured | Entities populated | Integration mode | Latency expectation | Key join fields | India-specific risks |
|---|---|---|---|---|---|---|
| **CBS** (Finacle / Flexcube / BaNCS) | `CUST_MAST`, `ACCT_MAST`, `TXN_LOG`, `ACCT_OPN_EVT`, `IRACP_TAG_EVT`, `LOAN_MAST`, `BO_CHAIN` | `SourceRecord`, `ProcessExecution` (KYC, Lending, AML, IRACP), `StepExecution`, `ControlInstance` (CTRL-KYC-*, CTRL-LND-001/004, CTRL-AML-001) | CDC + event-stream (Kafka) | real-time (≤30s); batch fallback T+1 | `ucic`, `account_id`, `pan_hash`, `txn_id`, `loan_id` | Schema drift on upgrade (Failure type 10); clock drift; replayed batch dup |
| **LOS** (Newgen / Lentra / in-house) | `APP_HDR`, `KFS_DOC`, `KFS_ISSUED_EVT`, `BORR_ACCEPT_EVT`, `UW_REVIEW`, `EXCEPTION`, `APPROVAL`, `ADV_ACTION_SENT` | `ProcessExecution` (Lending), `StepExecution`, `ControlInstance` (CTRL-LND-002/003), `EvidenceRecord` (EVD-DOC KFS, EVD-SIGN) | event-stream + API | real-time | `loan_application_id`, `kfs_hash`, `e_sign_ref` | LOS clock drift (DSA channel timestamp reversal — DL-APP-2024-00884 archetype) |
| **AML engine** (Oracle FCCM / Mantas / Actimize) | `ALERT_HDR`, `SCEN_RUN`, `SCENARIO`, `SUBJECT_GRAPH` | `ProcessExecution` (AML), `StepExecution`, `ControlInstance` (CTRL-AML-001..005), `AIInsight` (AI-001 / AI-011) | CDC + batch (alerts) | T+1 typical | `alert_id`, `subject_uid` (→ `ucic`) | Duplicate alert_id on failover replay; subject_uid mis-link |
| **Sanctions screening tool** (Fircosoft / Bridger / in-house) | `SCR_RUN`, sanctions list metadata | `ControlInstance` (CTRL-KYC-002, CTRL-AML-001, CTRL-KYC-006), `EvidenceRecord` (EVD-LOG with `list_version_at`) | API + event | real-time | `screening_run_id` ↔ `ucic` | List version not stamped on row (Failure type 10 partial) |
| **Case management** (Pega / Appian / in-house) | `CASE`, `L1_ACTION`, `L2_ACTION`, `STR_DRAFT` | `ProcessExecution` (AML L2/L3), `StepExecution` (STEP-AML-04..07), `ControlInstance`, `EvidenceRecord` | API + event | real-time | `case_id` ↔ `alert_id` | BPO ticket mis-key (Rule 5 violation) |
| **CKYCR / CERSAI** | `UPLOAD_RECORD`, `ACK_PAYLOAD` | `EvidenceRecord` (EVD-LOG ack), `ControlInstance` (CTRL-KYC-005/008) | API + batch retry | hours; batch retries on failure | `ckycr_no` ↔ `ucic` | Endpoint downtime; ack lost in batch |
| **UIDAI** | eKYC API response | `EvidenceRecord` (EVD-BIO), `ControlInstance` (CTRL-KYC-002) | API | real-time | `aadhaar_uid_hash` (raw never stored) | HTTP-200 logged but payload not retained (very common Evidence Gap) |
| **DigiLocker** | OVD token, e-sign | `EvidenceRecord` (EVD-DOC, EVD-SIGN), `ControlInstance` (CTRL-LND-002 e-sign step) | API | real-time | `ovd_token_id`, `e_sign_ref` | Token expired silently; ack lost |
| **NPCI / UPI** | UPI transactions, fraud feedback feed | `ProcessExecution` (UPI), `StepExecution`, `SourceRecord`, `AIInsight` (AI-001 mule) | event-stream + T+1 fraud feedback | real-time txn; T+1 fraud | `va` (UPI virtual address) ↔ `ucic` (subject map), `mobile_hash` | Multiple VAs per customer; partner-PSP VAs |
| **FIU-IND FINnet 2.0** | Outbound STR submission, inbound ACK | `ReportingSubmission`, `EvidenceRecord` (EVD-LOG ack), `ControlInstance` (CTRL-AML-003) | secure outbound + inbound poll | submission real-time; ack hours | `str_ref` ↔ `case_id` | FINnet 2.0 endpoint timeout; ack lost in batch |
| **CIMS** (RBI Centralised Information Management System) | DLA register quarterly submission, CCO certification | `ReportingSubmission`, `EvidenceRecord` (EVD-LOG submission, EVD-ATTEST CCO) | quarterly portal submit | quarterly | `loan_application_id ∩ quarter` | Quarterly cycle missed; partial batch |
| **CRILC** | Borrower-level credit information return | `ReportingSubmission`, `EvidenceRecord` | quarterly portal | quarterly | `borrower_id`, `exposure ≥ ₹5cr` | Late submission; threshold mis-config |
| **Bureau APIs** (CIBIL / CRIF / Experian / Equifax) | Bureau pulls | `EvidenceRecord` (EVD-LOG bureau pull), `ControlInstance` (CTRL-LND-001) | API | real-time + retries | `bureau_request_id` ↔ `loan_application_id` | Timeout; retry with new `request_id` not joined to original `app_id` |
| **Account Aggregator** | Consent + statements | `EvidenceRecord` (EVD-DOC stmt), `ControlInstance` (`OBL-RBI-029` consent freshness) | API + consent flow | real-time | `aa_consent_id` ↔ `loan_application_id` | Consent expired silently; refetch without re-consent |
| **GSTN / Income Tax** | GST returns; ITR data | `EvidenceRecord` (EVD-DOC) | API | minutes-hours | `gstin_hash`, `pan_hash` | Endpoint downtime; portal scrape fails |
| **ITSM** (ServiceNow / Remedy / Jira) | Change tickets, incident tickets, problem tickets | `ProcessExecution` (IT Ops), `StepExecution`, `ControlInstance` (CTRL-ITO-001/002), `EvidenceRecord` | API + event-stream | real-time | `change_id`, `incident_id`, `vendor_id` | Tag mis-config on vendor link |
| **SIEM** (Splunk / Sentinel) | Security events, cyber-incident detection | `SourceRecord`, `ControlInstance` (CTRL-ITO-001), `AIInsight` (AI-019) | event-stream | real-time | `incident_id`, `host_id` | Volume; rule-tuning gaps |
| **CERT-In portal** | Cyber incident submissions | `ReportingSubmission`, `EvidenceRecord` (EVD-LOG submission) | portal API | manual + 6h clock | `incident_id` ↔ ITSM | 6h breach risk |
| **VMO / GRC** | Vendor master, DDQ, InfoSec, SOC, fourth-party, contract, ongoing monitoring | `ProcessExecution` (Vendor), `ControlInstance` (CTRL-VND-001/002), `Issue` | API + workflow | real-time / batch | `vendor_request_id`, `vendor_id` | Fourth-party non-disclosure (VEND-2024-00205 archetype) |
| **CMS / Complaints** | Customer complaints, IO reviews | `ProcessExecution` (Complaints), `ControlInstance` (CTRL-COMP-001) | API + workflow | real-time | `complaint_id`, `ucic` | Complaint mis-categorisation (ISS-2026-079* archetype) |
| **HRMS** | Employee master, role mapping, attestation history | `Actor`, `SeniorManager`, `AttestationEvent` | API + batch | T+1 | `employee_id` ↔ `actor_id` | Role drift on attrition (CTRL-ITO-002 privileged-orphan archetype) |
| **Document management** (SharePoint / OpenText / in-house) | Scanned documents, attestations, board packs | `EvidenceRecord` (EVD-DOC, EVD-BOARD) | API + ingestion | minutes | `doc_id`, hash | Mis-tagging; index drift |
| **Email / approval systems** | Approval chains, escalation evidence | `EvidenceRecord` (EVD-DOC, EVD-ATTEST), `DecisionEvent`, `AttestationEvent` | API + ingestion | minutes-hours | `email_id`, signer | Off-system approvals not captured |

### 9.2 How each source system contributes

Each source system contributes facts to multiple platform entities. The contribution shape is consistent: every record goes to **`SourceRecord`** first (with `source_system_id`, `source_table_or_api`, `source_primary_key`, `payload_hash`); then derives **`ProcessExecution`** rows where the record is anchor-bearing (e.g., a CBS `ACCT_OPN_EVT` produces a `PE-PROC-KYC-001-...`); then derives **`StepExecution`** rows where the record proves a step (e.g., a CKYCR `ACK_PAYLOAD` proves STEP-KYC-08); then drives **`ControlInstance`** evaluations whose Pass / Fail / Data Gap / Evidence Gap outcomes consume the event; then becomes one or more **`EvidenceRecord`** nodes with regulator-readiness flags; then, on Fail, propagates to **`Exception`** and onward to **`Issue`**, **`RemediationAction`**, **`Workpaper`** (via `TestExecution`) and finally **`AuditPack`**. The `CorrelationRecord` bridge sits across every cross-system join. The `AIInsight` layer sits on top of all of this with model provenance. This is the same chain end-to-end for every source system; only the join keys and the cardinality differ.

---

## 10. AI Capability Backlog

### 10.1 Tier 1 — Foundational

| AI capability | Persona served | Input entities | Output | Explainability requirement | Human approval requirement | Risk if wrong | Required source evidence | Model-risk consideration |
|---|---|---|---|---|---|---|---|---|
| **Process mining from event logs** (AI-002 backbone) | PERSONA-002, PERSONA-003 | `StepExecution`, `ProcessExecution` | drift insights, novel variants | step-level rationale + variant signature delta | manual review of new variants before they auto-mark drift | mis-marking valid new product flow as drift | event streams from CBS / LOS / AML / NPCI / ITSM | classical process-mining; low MRM burden |
| **ControlInstance reconciliation** | PERSONA-002, PERSONA-003 | `ControlInstance`, source extracts | reconciliation deltas; flagged CIs | delta on each metric, source row IDs | per-anomaly review | wrong CI count → wrong CES | source-system independent extracts | reconciliation rules versioned |
| **Obligation-to-control mapping (AI-003)** | PERSONA-002 | `Regulation` raw text, `Control` corpus | proposed `:COVERS` edges + new `Obligation`s | clause-level citation + similarity score | mandatory before edge becomes live | unmapped obligation = MRA | regulation raw text blobs | LLM-extracted; `interpretation_status = provisional` until human ratifies |
| **Evidence gap detection (AI-005)** | PERSONA-002, PERSONA-003 | `EvidenceRecord`, `EvidenceSpecification` | per-CI gap insights | which spec, which field missing | none if deterministic | false alarms degrade trust | EVD-* corpus | rule-based; no MRM |
| **Data gap detection** | PERSONA-002, PERSONA-003 | `SourceRecord`, expected populations | per-population gap insights | which source-table / partition / window | none | data-gap rate skews CES | source-system definitions | rule-based |
| **Correlation warning detection** | PERSONA-002, PERSONA-003 | `CorrelationRecord` | warning insights with category (timestamp reversal, schema mismatch, etc.) | per Pass 2 §12 | none | mis-classification escalates wrongly | CR + SR | rule-based |
| **Population testability classification** | PERSONA-003 | `Control`, `SourceRecord` availability | per-control population-test feasibility | source-system coverage matrix | none | wrongly-marked population control breaks audit | per `PopulationTestSpecification` | classifier; periodic re-eval |
| **Source-record anomaly detection (AI-004)** | PERSONA-002 | `SourceRecord` stream | anomaly insights | feature contribution | review > τ_review | false-positive noise | SR streams | anomaly model; MRM record per-version |

### 10.2 Tier 2 — Differentiating

| AI capability | Persona served | Input entities | Output | Explainability requirement | Human approval requirement | Risk if wrong | Required source evidence | Model-risk consideration |
|---|---|---|---|---|---|---|---|---|
| **Control effectiveness explanation (AI-018)** | PERSONA-001, PERSONA-002 | `ControlInstance` history, `Issue` | "why CES fell" narrative + driver attribution | per-component contribution | review for board narratives | misleading the board | full CI history | LLM + classical attribution; MRM medium |
| **Root-cause clustering (AI-010)** | PERSONA-002, PERSONA-003 | `Issue` corpus | `RootCauseCluster` proposals | embedding + cluster diagnostics | review before cluster becomes live | wrong cluster mis-prioritises remediation | Issues + Controls graph | embedding model; MRM medium |
| **UPI mule-network detection (AI-001)** | PERSONA-002 (MLRO) | UPI feed, subject graph, NPCI feedback | mule-cluster `AIInsight`, alert triage | feature attribution + network diagram | approve before STR action | false-positive mule freeze breaches Charter of Customer Rights | NPCI + AML + subject graph | graph ML; MRM high (auto-action threshold τ=0.92) |
| **AML backlog and STR-risk detection** | PERSONA-002 | `ControlInstance` (CTRL-AML-002/003), `ReportingClock` | per-alert / per-case STR-risk score | clock countdown + SLA breach causes | review before escalation | missing STR-window risk | case mgmt + FIU-IND | classifier; MRM high |
| **KFS timing violation detection (AI-013)** | PERSONA-002, PERSONA-003 | LOS event-stream | per-loan violation insight | timestamp comparison + clock-drift caveat | none (deterministic) | false-positive on clock drift | LOS events + NTP attestation | deterministic + clock-drift rule; MRM low |
| **CKYCR upload delay detection (AI-016)** | PERSONA-002, PERSONA-003 | CKYCR ack stream + KYC schedule | per-cohort delay (DBT, scholarship) | schedule vs ack delta + cohort segmentation | review for cohort actions | mis-segmenting cohort | CKYCR + risk engine | classifier; MRM medium |
| **Vendor fourth-party exposure detection (AI-009)** | PERSONA-002 (CISO) | VMO + CVE + external feeds | per-vendor exposure insight | sub-contractor + CVE traceability | review before issue | false-positive on shared infra | VMO + CVE feed | external-feed correlation; MRM medium |
| **Senior accountability evidence warning** | PERSONA-001 | `SeniorManager`, `DecisionEvent`, `AttestationEvent` | accountability-gap insights | which evidence missing | review before SM is flagged | reputational impact | SM + decision logs | rule-based; MRM low |
| **Regulatory change impact analysis (AI-003 ext.)** | PERSONA-002 | `Regulation` + amendments, control corpus | impact map across `:COVERS` edges | clause-by-clause traceability | mandatory ratification | wrongly-marked obligation update | regulation blobs | LLM; MRM high |
| **Process variant anomaly detection (AI-002 ext.)** | PERSONA-002, PERSONA-003 | `StepExecution` patterns | rare-variant insight | variant rarity score | review for new flagged variants | mis-flag new product flow | event streams | unsupervised + rule overlay; MRM medium |

### 10.3 Tier 3 — Transformative

| AI capability | Persona served | Input entities | Output | Explainability requirement | Human approval requirement | Risk if wrong | Required source evidence | Model-risk consideration |
|---|---|---|---|---|---|---|---|---|
| **Population reperformance automation** | PERSONA-003 | `Control`, `PopulationTestSpecification` | re-runnable population test + workpaper draft | population query + provenance | tester reviews & signs | wrong denominator / wrong predicate | source-system access | execution engine + model; MRM medium |
| **Workpaper drafting** | PERSONA-003 | `TestExecution`, `EvidenceRecord` set | draft `Workpaper` | citation per finding | mandatory tester edit + sign | unsubstantiated finding language | EVD set | LLM; MRM high |
| **RBI AFI evidence pack generation** | PERSONA-002, PERSONA-003 | `Obligation`, `Control`, `ControlInstance`, `Evidence` | `AuditPack` for `target_audience = RBI_AFI` | every claim cited | mandatory CCO review | mis-presentation to RBI | full graph | LLM; MRM very high |
| **FIU / PMLA evidence pack generation** | PERSONA-002 (MLRO) | AML graph, FINnet 2.0 acks | FIU `AuditPack` | every STR + CTR cited | MLRO mandatory review | regulator action risk | full FIU subgraph | LLM; MRM very high |
| **CRO conversational risk analyst** | PERSONA-001 | full graph as-of date | NL answers with cited sources | every claim hyperlinks to source | optional review for board narratives | board mis-direction | full graph | LLM with retrieval; MRM very high |
| **Predictive control decay alerts (AI-018 ext.)** | PERSONA-001, PERSONA-002 | `ControlInstance` time series | forecast CES decline | feature contribution + trend | review before issue auto-create | false alarm fatigue | CI history | time-series ML; MRM high |
| **Board-ready risk narrative generation** | PERSONA-001 | risk posture + issue + accountability | draft RMCB / ACB narrative | every metric cited | mandatory CRO edit + sign | board narrative defect | graph + EVD-BOARD | LLM; MRM very high |
| **Audit planning recommendation engine** | PERSONA-003 (HIA) | risk profile, residual, drift, vendor risk | risk-based audit plan | per-area justification | HIA mandatory review | mis-allocated audit hours | full graph | recommender; MRM high |
| **Automated inspection-response assistant** | PERSONA-002 | inspector question, `AuditPack` | NL response with cited evidence | every fact cited | CCO mandatory sign | regulator-facing error | EVD + AuditPack | LLM with retrieval; MRM very high |

---

## 11. Persona-Model Alignment

The same graph supports each persona's decision lens. No UI design here — only the data-and-decision shape.

| Persona | Primary decisions | Data entities needed | Metrics needed | Drilldown path | Evidence needed |
|---|---|---|---|---|---|
| **PERSONA-001 — CRO / MD&CEO / BRMC Chair** | Where am I outside appetite today? Which control failures trend to RBI risk? Which senior accountabilities have evidence gaps? Halt product / escalate / attest? | `Risk`, `Control`, `ControlInstance` (aggregate), `Issue`, `KRI`, `AppetiteMetric`, `SeniorManager`, `DecisionEvent`, `AttestationEvent`, `ReportingSubmission`, `AIInsight` | RES, CES (aggregate), ARS, OCS, RTS, SAES, AITES | RES domain → driving Risks → failing Controls → ControlInstances → EvidenceRecord → SourceRecord (two-click, end-to-end) | EVD-BOARD (committee packs), EVD-ATTEST (own attestations), EVD-LOG / EVD-DOC / EVD-SIGN (issue closure), EVD-REPORT (FIU / CIMS / CSITE submissions) |
| **PERSONA-002 — CCO / Head of ORM / MLRO–PO / Head of FC / Head of IT Risk** | Which obligations are weakly covered? Which AML / STR reporting is at risk? Which controls are degraded? Reject product launch? File / withhold STR? Recommend Pillar-2 add-on? | `Obligation`, `Control`, `ControlInstance` (population), `EvidenceRecord`, `EvidenceSpecification`, `ReportingClock`, `ReportingSubmission`, `Issue`, `RemediationAction`, `RegulatoryChangeEvent`, `VendorDependency`, `AIInsight`, `Model` | OCS, CES (per control), EIFS, RTS, DCQS, PVDS, AITES | OCS heat-map → weakly-covered Obligation → linked Controls → ControlInstances → Evidence → SourceRecord; or RTS clock → ReportingClock → ReportingSubmission → ack EvidenceRecord | EVD-LOG (CBS / AML / CKYCR / NPCI / ITSM), EVD-DOC (KFS / SOC / DDQ / contracts), EVD-ATTEST (CCO certifications), EVD-REPORT (FIU / CIMS / CRILC / CSITE / CERT-In acks) |
| **PERSONA-003 — Compliance Officer / IA Manager / Concurrent Auditor / Control Tester** | Which controls can be population-tested? Where are the exceptions? Which evidence missing / stale / unverifiable? Can this be packaged as RBI workpaper? Which issues unclosed and ageing? | `Control`, `PopulationTestSpecification`, `ControlInstance` (full population), `EvidenceRecord`, `Exception`, `Issue`, `RemediationAction`, `TestExecution`, `Workpaper`, `AuditPack`, `OrphanQueueItem` | CES (per control), EIFS, DCQS, PVDS, OCS | TestExecution → ControlInstance population → Exception → Evidence → SourceRecord; or Workpaper → linked Evidence → SourceRecord | All EVD types incl. EVD-WORKPAPER and EVD-RECON; orphan-queue evidence; rerunnable population query |
| **Operations / Process Owner (supporting)** | Process health; in-flight exceptions; SLA breaches; remediation execution | `Process`, `ProcessExecution`, `StepExecution`, `Exception`, `RemediationAction`, `KRIObservation` | PVDS, CES (per control they own), in-flight exception ageing | ProcessExecution → StepExecution → ControlInstance → EvidenceRecord | EVD-LOG (operational), EVD-RECON (daily recons) |

The same **`AIInsight` + `Model` + `ModelRiskRecord` overlay** sits on every persona view. The same **`SeniorManager` accountability ledger** is filterable by every persona's scope. The same **`ReportingClock` + `ReportingSubmission` + EVD-REPORT chain** powers the regulatory-timeliness view for PERSONA-002 and feeds the inspection-readiness view for PERSONA-001.

---

## 12. Time Model and Audit Reconstruction

**`valid_time` vs `system_time`.** `valid_time` is when the fact was true in the world; `system_time` is when the platform first knew it. Every run-time entity (SourceRecord, ProcessExecution, StepExecution, ControlInstance, EvidenceRecord, Issue, RemediationAction, DecisionEvent, AttestationEvent, AIInsight, ReportingSubmission, KRIObservation, AppetiteObservation) carries both. Every design-time entity (Regulation, Obligation, Risk, Control, Process, ProcessStep, Activity, KRI, AppetiteMetric, ReportingClock, EvidenceSpecification, PopulationTestSpecification, SeniorManagementResponsibility, SourceSystemDefinition, SourceSchemaDefinition) is versioned with `effective_from` / `effective_to` (the design-time analogue of `valid_time`).

**Why Indian banking audit needs both.** Because:

- A **CKYCR ack** can arrive 4 days late on a re-upload; `valid_time` = 2026-04-03 (registry timestamp) and `system_time` = 2026-04-07 (platform ingestion). Without bi-temporality, the platform either back-dates and corrupts the system-time CES, or refuses the late record and weakens evidence. Bi-temporality lets both numbers be queried.
- An **NPCI fraud feedback** typically arrives T+1 against UPI flows; bi-temporality lets the AI-001 mule insight be attached to the alert at the correct `valid_time` while the platform's ingestion-time is recorded separately.
- A **schema upgrade** (Finacle 10.x → 11.x) changes `IRACP_TAG` field; the platform must replay historical decisions on the *old* schema while ingesting new records on the *new* schema; only versioned design entities and bi-temporal facts make this possible.
- The **RBI AFI question** "what did the bank know about UCIC-2024-00127 on 2026-03-31?" is a `system_time ≤ 2026-03-31` query; the answer must be deterministic six months later.
- The **PMLA Rule 9 question** "can you reconstruct the chain of transactions for this STR-eligible subject for the past five years?" needs `valid_time` reconstruction (the actual transactional reality) plus `system_time` (when the bank knew suspicion existed).
- **Event sourcing** preserves every change. There is no in-place edit on any audit-relevant record; corrections produce a new event with `valid_time` of the original fact and `system_time` of the correction. Current state is a *projection*; historical state is a *replay*.

### 12.1 Event Catalogue

| Aggregate | Event types | Why it matters |
|---|---|---|
| `Regulation` | `REG-CREATED`, `REG-AMENDED`, `REG-SUPERSEDED`, `REG-WITHDRAWN`, `REG-EFFECTIVE-CHANGED` | 28-Nov-2025 consolidation; replay of obligation universe at any historical date |
| `Obligation` | `OBL-CREATED`, `OBL-AMENDED`, `OBL-COVERAGE-EDGE-ADDED`, `OBL-COVERAGE-EDGE-REMOVED`, `OBL-DEPRECATED` | tracks coverage evolution; AI-003 ratification flow |
| `Control` | `CTRL-CREATED`, `CTRL-VERSIONED`, `CTRL-RETIRED`, `CTRL-OWNER-CHANGED`, `CTRL-OBLIGATION-LINKED`, `CTRL-EVIDENCE-SPEC-CHANGED` | RCM normalisation; CES replay |
| `Process` | `PROC-CREATED`, `PROC-VERSIONED`, `PROC-VARIANT-SIGNATURE-CHANGED`, `PROC-OWNER-CHANGED` | drift baseline change |
| `ProcessExecution` | `PE-STARTED`, `PE-STEP-EXECUTED`, `PE-STATUS-CHANGED`, `PE-CLOSED`, `PE-DATA-GAP-FLAGGED`, `PE-CORRELATION-WARNING-RAISED` | journey reconstruction |
| `StepExecution` | `SE-STARTED`, `SE-COMPLETED`, `SE-SKIPPED`, `SE-OVERRIDDEN`, `SE-EVIDENCE-LINKED`, `SE-VARIANT-DEVIATED` | step-level audit |
| `ControlInstance` | `CI-FIRED`, `CI-OUTCOME-RECORDED`, `CI-EVIDENCE-LINKED`, `CI-DATA-GAP-DECLARED`, `CI-EVIDENCE-GAP-DECLARED`, `CI-NEEDS-REVIEW`, `CI-OVERRIDE-APPLIED` | core CES events |
| `EvidenceRecord` | `EV-INGESTED`, `EV-HASH-VERIFIED`, `EV-LINKED`, `EV-COMPLETENESS-COMPUTED`, `EV-CHAIN-OF-CUSTODY-CHANGED`, `EV-RETENTION-CHANGED`, `EV-REGULATOR-READY-RECOMPUTED` | evidence lifecycle |
| `CorrelationRecord` | `CR-CREATED`, `CR-MATCH-CONFIDENCE-RECOMPUTED`, `CR-ORPHAN-CLASSIFIED`, `CR-RESOLVED`, `CR-OVERRIDE-APPLIED` | join defensibility |
| `Issue` | `ISS-CREATED`, `ISS-CLUSTERED`, `ISS-OWNER-CHANGED`, `ISS-STATUS-CHANGED`, `ISS-RETEST-INITIATED`, `ISS-CLOSED`, `ISS-RBI-MRA-FLAGGED` | issue lifecycle |
| `ActionTask` | `AT-CREATED`, `AT-OWNER-CHANGED`, `AT-DUE-DATE-CHANGED`, `AT-COMPLETED`, `AT-VALIDATED`, `AT-REJECTED` | remediation lifecycle |
| `DecisionEvent` | `DEC-RECORDED`, `DEC-COMMITTEE-RATIFIED`, `DEC-REVERSED` | reasonable-steps file |
| `AttestationEvent` | `ATT-SUBMITTED`, `ATT-ACCEPTED`, `ATT-REJECTED`, `ATT-EXPIRED` | period attestations |
| `ReportingSubmission` | `RS-DRAFTED`, `RS-SUBMITTED`, `RS-ACK-RECEIVED`, `RS-REJECTED`, `RS-RESUBMITTED`, `RS-CLOCK-BREACHED` | reporting timeliness chain |
| `AIInsight` | `AI-CREATED`, `AI-CONFIDENCE-UPDATED`, `AI-HUMAN-REVIEW-DISPOSITION`, `AI-LINKED-TO-ISSUE`, `AI-MODEL-VERSION-PINNED`, `AI-DROPPED-AS-FP` | AI lifecycle |
| `ModelRiskRecord` | `MRR-VALIDATED`, `MRR-DRIFT-DETECTED`, `MRR-OVERRIDE-RECORDED`, `MRR-RETIRED` | MRM lifecycle |

Together, this event catalogue is the **append-only ledger** that enables:
- as-of-date queries against any aggregate, any persona view, any metric;
- replay of CES at any past `system_time`;
- reconstruction of "what we knew when" for any specific UCIC / alert / loan / vendor / change;
- forensic investigation in case of supervisory or law-enforcement review under PMLA / SFIO / ED.

---

## 13. Final Output / Handoff

This pass enables, in order, every downstream artefact required to take the IndianBankingAudit platform from architecture to production. Each artefact below is a direct consumer of the entities, relationships and metrics defined above — and should be developed against this specification, not against a fresh or competing one.

| # | Artefact | Direct consumer of | Notes / scope |
|---|---|---|---|
| 1 | **JSON schemas / DDL** for all 25 entities | §4 (entity field tables) | Use enum tables for `outcome`, `correlation_status`, `evidence_type`, `signal_class`, `decision_type`, `attestation_type`, etc. Bi-temporal columns (`valid_time` / `system_time`) on all run-time entities. |
| 2 | **Graph schema** (Neo4j / TigerGraph / RDF) | §5 (relationship catalogue) | All 45 numbered edge types as labelled relationships; `:COVERS`, `:MITIGATES`, `:OPERATES_ON`, `:INSTANCE_OF`, `:EVALUATES`, `:PROVED_BY`, `:RAISES`, `:PROMOTED_TO`, `:ACCOUNTABLE_FOR`, `:OWNS`, `:RESULTED_IN`, `:PRODUCED_BY`, etc. |
| 3 | **API contracts** | §4 + §5 | REST + GraphQL for read; event-stream API for ingestion; persona-scoped views as graph projections. |
| 4 | **Mock data generation** | §4 + Pass 2 sample IDs | Deterministic generator producing UCIC-2024-00123/00126/00127, AML-ALRT-2024-00501/00502/00505, DL-APP-2024-00881/00882/00884/00885, VEND-2024-00202/00203/00205 across all entities, with the exact statuses and outcomes enumerated in Pass 2 §4.5 / §5.5 / §6.5 / §7.5 — for reproducible end-to-end demo. |
| 5 | **ControlInstance generator logic** | §4.13 + Pass 2 §4.4 / §5.4 / §6.4 / §7.4 | Predicate-driven generator that runs a `Control.operating_signal_spec` query against `StepExecution` + `SourceRecord` and writes `ControlInstance` events with the four-outcome taxonomy. |
| 6 | **Source-system connector specifications** | §4.8 + §9 | One per source system in §9.1 (CBS / LOS / AML engine / CKYCR / etc.); spec covers integration mode, latency, key fields, schema versioning, retry behaviour, retention class. |
| 7 | **Correlation engine rules** | §4.10 + Pass 2 §3 | Ten correlation principles + twelve failure types codified into engine rules; outputs `CorrelationRecord` events with confidence and method. |
| 8 | **CES computation service** | §4.13 + §7.1 | Stateless service that takes a control + window + as-of-date and produces `OperatingRate / CatchRate / EvidenceCompleteness / CES / colour`. |
| 9 | **Persona-by-view UI specification** | §11 | Three persona workspaces (PERSONA-001 / 002 / 003) + Operations supporting; each is a graph projection — UI design is downstream and out of scope here. |
| 10 | **Final frontend prototype** | §11 | Built against API + persona views; embodies Pass 1 design principles (evidence-first, two-click drill, no vanity charts). |
| 11 | **Evidence pack builder** | §4.14 + §4.23 | Takes a `target_audience` (RBI_AFI / RBS_SPARC / FIU_IND / CSITE / Statutory / Concurrent / IA / Board) and assembles an `AuditPack` from graph queries with hash-stamped immutable export. |
| 12 | **AI insight model** | §4.24 + §10 | Model registry, versioning, MRM record, threshold management, HITL queue, drift monitoring — all per ITGRCA + DPDP Act. |
| 13 | **Population testing workbench** | §4.21 + §7.7 | Tester workspace for `TestExecution` lifecycle: pick control → fetch population → predicate-evaluate → exception list → workpaper. |
| 14 | **Workpaper generator** | §4.22 | LLM-drafted, tester-edited, hash-stamped, regulator-format-exportable. |
| 15 | **RBI inspection pack builder** | §4.23 | Pre-staged AuditPacks for typical RBI thematic reviews (KYC, AML, IT, Digital Lending, Fraud, Conduct, Outsourcing) — the single most-used PERSONA-001 capability. |

### 13.1 Final Summary

**Core capabilities (12)** — Process Execution Telemetry, Source-System Correlation & Lineage, RBI Obligation Decomposition & Coverage Mapping, ControlInstance Generation & Reconciliation, Evidence Ledger & Inspection Readiness, CES Engine, Risk Posture & Appetite Engine, Issue Detection & Root-Cause Clustering, Population Reperformance & Workpaper Assembly, Regulatory Change Impact Analysis, Senior-Management Accountability Ledger, AI Signal & Explainability Layer.

**Core entities (25)** — Regulation, Obligation, Risk, Control, Process, ProcessStep, Activity, SourceSystem, SourceRecord, CorrelationRecord, ProcessExecution, StepExecution, ControlInstance, EvidenceRecord, Exception, Issue, RemediationAction, SeniorManager, DecisionEvent, AttestationEvent, TestExecution, Workpaper, AuditPack, AIInsight — plus a supporting cluster (KRI / KRIObservation / AppetiteMetric / AppetiteObservation / Subject / Actor / RootCauseCluster / ReportingClock / ReportingSubmission / OrphanQueueItem / SourceSchemaVersion / DataQualityRule / ControlPopulation / EvidenceSpecification / PopulationTestSpecification / CommitteeRecord / RegulatoryChangeEvent / Model / ModelRiskRecord / VendorDependency / ThirdPartyDependency / OperationalResilienceService / SeniorManagementResponsibility).

**Critical relationships (45)** — anchored on the Regulation → Obligation → (Risk ⇄ Control) → ProcessStep → Activity → ProcessExecution → StepExecution → ControlInstance → EvidenceRecord → Exception → Issue → RemediationAction → Workpaper → AuditPack spine, with SourceRecord at the basement, CorrelationRecord across every cross-system join, SeniorManager threaded through Risk / Control / Process / Issue / Decision / Attestation, ReportingClock owning every statutory deadline, AIInsight and Model overlaid with full provenance, and VendorDependency / ThirdPartyDependency / OperationalResilienceService modelling the outsourcing surface end-to-end.

**Derived metrics (10)** — CES, RES, ARS, OCS, EIFS, DCQS, PVDS, RTS, SAES, AITES — each with explicit formula, banding, persona served, drilldown path and India-specific interpretation.

**Indian regulatory overlays** — RBI Master Directions (KYC, FRM 15-Jul-2024, ITGRCA 7-Nov-2023, Op-Risk Guidance 30-Apr-2024, DL Directions 8-May-2025, Outsourcing of IT Services), PMLA + Rule 9 + s.12(1)(b), FIU-IND FINnet 2.0, NPCI Procedural Guidelines, CERT-In Direction 28-Apr-2022, ITGRCA, Aadhaar Act s.29, DPDP Act 2023, the 28-Nov-2025 MD consolidation; RB-IOS 2021; Internal Ombudsman Scheme; RBI Risk-Based Supervision (SPARC); Concurrent Audit framework 18-Sep-2019; RBIA framework; CCO circular 11-Sep-2020; Corporate Governance in Banks 26-Apr-2021; Fit & Proper criteria; *SBI v. Rajesh Agarwal* 2023.

**Source-system lineage model** — every fact rooted in `SourceRecord` from CBS / LOS / AML engine / Sanctions / Case mgmt / CKYCR / CERSAI / UIDAI / DigiLocker / NPCI / FIU-IND FINnet 2.0 / CIMS / CRILC / Bureaus / AA / GSTN / IT portal / ITSM / SIEM / CERT-In / VMO / CMS / HRMS / Document mgmt / Email-approval — with `CorrelationRecord` bridging every cross-system join and `OrphanQueueItem` catching every unmatched record for daily concurrent-audit review.

**AI capabilities** — Tier 1 (8 foundational), Tier 2 (10 differentiating), Tier 3 (9 transformative); every insight is a graph node with `model_id`, `model_version`, source evidence, confidence, threshold, recommendation, risk-if-wrong, human-approval state, and audit log; every model is itself subject to `R-MR-001` model-risk governance under ITGRCA expectations.

**Recommended product surfaces to build next** (in order):

1. **Mock-data generator** producing the deterministic Pass 2 sample IDs across all 25 entities — unblocks every downstream prototype.
2. **ControlInstance generator + CES service + EvidenceRecord ledger** — the core engine; everything else is a view on this.
3. **CorrelationRecord engine + OrphanQueue daily-cycle** — the data-honesty foundation; without it CES cannot be defended.
4. **PERSONA-002 OCM + ReportingClock workspace** (graph + metrics, no UI design here) — answers Q-CCO-01 / Q-CCO-02 / Q-CCO-09 immediately.
5. **PERSONA-003 Population Testing Workbench + Workpaper Generator** — answers Q-IA-01 / Q-IA-02 / Q-IA-04; converts concurrent audit from sample-based to population-based.
6. **PERSONA-001 Risk Posture Cockpit + Inspection-Readiness Pack** — answers Q-CRO-01 / Q-CRO-02 / Q-CRO-10; the board-and-RBI-facing view.
7. **AIInsight layer with full provenance** — Tier 1 first, Tier 2 second, Tier 3 last; every signal HITL-gated for regulator-facing decisions.
8. **RBI AFI / FIU / CSITE AuditPack builder** — turns the inspection-readiness promise into a one-click reality.

This is the system / data architecture. Pass 4 takes it into RCM, fields, AI signals and source-system mapping for build; Wave 1 (CBS + LOS + AML engine + Sanctions + Case mgmt + CKYCR) implements the spine; Wave 2 (NPCI / UPI + ITSM + SIEM + FIU-IND outbound + CIMS + CRILC) extends it; Wave 3 (VMO + CMS + HRMS + DM + Telephony / ASR) completes the surface. Every artefact, every connector, every metric, every persona view, every AI signal, and every regulator pack traces back to entities and relationships defined here — and to the obligations, risks and controls established in IndianAudit Pass 1, Pass 2 and Pass 4 RCM. The platform's defensibility is precisely this round-trip.
