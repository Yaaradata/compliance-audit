# IndianBankingAudit — Data Correlation & Lineage Pack

*Pass 2 — Data Correlation, Lineage, ControlInstance Generation, and CES Construction for a Mid-Sized Indian Private Sector Bank*
*Authored by: Indian Banking Data Lineage Architect | RBI-Audit Data Specialist | Control Testing Expert | Process Mining SME | Live RCM Data Model Architect | Cut-off: April 2026*

---

## 1. Executive Summary

In a mid-sized Indian private sector bank, the **single hardest engineering problem after source-system clarity is correlation**. CBS (Finacle / Flexcube / BaNCS) holds the customer master and account events; LOS (Newgen / Lentra / in-house) holds the loan application; the AML engine (Oracle FCCM / Mantas / Actimize) holds alerts; CKYCR / CERSAI hold the KYC registry acks; FIU-IND FINnet 2.0 holds STR submission acks; NPCI holds UPI transactions and fraud feedback; ITSM and SIEM hold the IT/cyber operational truth. None of these systems share a primary key. The customer is `cust_no` in CBS, `applicant_id` in LOS, `subject_uid` in the AML engine, `ckycr_no` in CKYCR, and `mobile_hash` in DLAs. BPO floors handling KYC L1 / AML L1 / complaint L1 introduce a further correlation discontinuity — their work is captured in BPO ticketing platforms, not in the bank's CBS. Without a deterministic correlation layer that ties these together, the bank has *records* but not *evidence*.

Raw CBS / LOS / AML logs alone are not auditable under PMLA Rule 9 (5-year record retention with reconstructable transaction chain), under the *Master Direction on KYC* `RBI/2015-16/42 DBR.AML.BC.No.81/14.01.001/2015-16` dated 25-Feb-2016 (as amended on 6-Nov-2024 and 12-Jun-2025; superseded 28-Nov-2025 by the sector-specific KYC MDs), under RBI's Annual Financial Inspection (BR Act Sec 35), or under the *Concurrent Audit System* circular `RBI/2019-20/250 Ref.No.DoS.CO.ARG/SEC.01/08.91.001/2019-20` dated 18-Sep-2019. Auditors and inspectors require **per-UCIC, per-Alert-ID, per-Loan-ID, per-Vendor-ID** chains — not branch-aggregate counts. This pack documents how the platform constructs that chain.

The platform transforms raw records as follows: **SourceRecord** → **ProcessExecution** (one UCIC onboarding, one alert triage, one loan, one vendor) → **StepExecution** (every stage in the journey, including BPO-executed ones) → **ControlInstance** (one evaluation of one CTRL-KYC / CTRL-AML / CTRL-LND / CTRL-VND control) → **EvidenceRecord** (provenance-stamped proof) → **CES** (Operating Rate × 40% + Catch Rate × 40% + Evidence Completeness × 20%) → **Persona Workspace** (PERSONA-001 enterprise risk view, PERSONA-002 OCM view, PERSONA-003 testing workspace, all from Pass 1).

Correlation failures are not academic. A missing `ucic ↔ alert_id` join produces an orphan AML alert, which produces a control-not-fired event mistaken for control-pass — silently weakening the bank's STR completeness defence under PMLA s.12. A schema-mismatch between CBS upgrades produces a phantom data gap, which is read as control-fail and creates false RBI MRA exposure. A duplicate alert from a CBS failover replay produces double-counted CES denominators and a false Green colour. These are precisely the failure modes that turn an AFI exit-meeting into an MRIA, a PMLA s.13 referral, or a Sec 47A penalty (HSBC India Feb-2025 archetype on AML alert outsourcing; Paytm PB Jan-2024 archetype on KYC drift; Bajaj Finance Nov-2023 on KFS).

This pack is written for the **PERSONA-002 CCO / MLRO / Head of ORM / Head of IT Risk** who owns the correlation programme, for the **PERSONA-003** concurrent auditors and IA managers who execute against it, and for the **PERSONA-001 CRO / MD&CEO** who must trust its output in a Board / RBI conversation. It builds directly on Pass 1 (personas, obligations, design principles), is consumed by Pass 3 (the bi-temporal product ontology) and Pass 4 (RCM rows, field definitions, AI signals, UI mapping). Every join rule, every ControlInstance specification, every CES arithmetic example, and every audit trace below is referenced by the IDs already established in Pass 1 and Pass 4 — there is no parallel taxonomy.

---

## 2. Common Correlation Model

This section defines the six entities used across all four processes (KYC, AML, Digital Lending, Vendor Onboarding). They are the smallest set sufficient to deliver `OUT-001` (Process Auditability), `OUT-003` (Evidence Completeness), and `OUT-006` (Inspection Readiness) from Pass 1.

**SourceRecord.** A raw row, event, API response, or document-metadata stub captured from a source system — for example a Finacle CIF row, a Mantas alert row, a Newgen LOS bureau-pull row, a CKYCR upload acknowledgement payload, a DigiLocker OVD token, a UIDAI Aadhaar OTP authentication response, an ITSM Remedy ticket, a FIU-IND FINnet 2.0 STR submission ack. SourceRecord is **append-only** and stored with provenance metadata (source-system ID, hash, retrieval timestamp). It is the basement of the lineage graph; everything above is derived.

**ProcessExecution.** One complete journey of one subject through one process. For PROC-KYC-001 a ProcessExecution is keyed by a single UCIC (e.g., UCIC-2024-00123). For PROC-AML-001 it is keyed by one alert_id (e.g., AML-ALRT-2024-00502). For PROC-LND-001 it is keyed by one loan_application_id (e.g., DL-APP-2024-00884). For PROC-VND-001 it is keyed by one vendor_request_id (e.g., VEND-2024-00205). ProcessExecution is the **anchor for cross-system correlation** — its primary key is the only key that survives across CBS, LOS, AML engine, CKYCR, FIU-IND, and ITSM.

**StepExecution.** One completed (or attempted) stage inside a ProcessExecution — including BPO-executed steps such as KYC CDD by a tier-2/3 city BPO, or AML L1 disposition by a captive. StepExecution captures the *who, when, where, on which system* of every action, and is the layer at which **process drift** (an `STEP-AML-05` bypass; an `STEP-LND-08` policy-exception override) becomes visible. It is what the **AI-002 process-mining signal** consumes.

**ControlInstance.** One evaluated firing of one control (CTRL-KYC-001 through CTRL-VND-002) for one ProcessExecution. ControlInstance has exactly four possible outcomes: **Pass**, **Fail**, **Data Gap**, **Evidence Gap** — these four are not interchangeable (see §9.3). ControlInstance is the only entity whose statuses contribute directly to **Operating Rate** and **Catch Rate** in the CES formula (§10).

**EvidenceRecord.** A proof item attached to a ControlInstance. Eight types from Pass 4: `EVD-LOG` (event-stream log entry), `EVD-DOC` (document with hash), `EVD-ATTEST` (signed attestation), `EVD-SIGN` (e-sign), `EVD-RECON` (reconciliation count), `EVD-CALL` (voice recording with metadata), `EVD-IMG` (image / CCTV), `EVD-BIO` (biometric / OTP authentication response). EvidenceRecord is **tamper-evident** (hashed) and **provenance-stamped** (source-system + retrieval-timestamp). It contributes directly to **Evidence Completeness** in the CES formula.

**Issue / Exception.** A failed ControlInstance, or a repeated pattern of ControlInstance failures across UCICs / alerts / loans / vendors, that requires an ActionTask. Each Issue links to one or more `OBL-RBI / OBL-PMLA / OBL-FIU` obligations and (where applicable) to an AFI MRA, RMP, or MAP item. Issue lifecycle is governed by the rules in `OUT-004` (Issue Remediation) — open → in-remediation → re-test → closed-with-positive-evidence.

**Master Entity Table:**

| Entity | Meaning | India-Specific Example | Created From | Key IDs | Why It Matters |
|---|---|---|---|---|---|
| **SourceRecord** | Raw row, event, API payload, or document with provenance | Finacle `CUST_MAST` row; Mantas `ALERT` row; CKYCR `ACK_PAYLOAD`; FIU-IND FINnet 2.0 STR ack; ITSM Remedy ticket; UIDAI eKYC response | CBS / LOS / AML engine / CKYCR / FIU-IND / NPCI / ITSM connector ingestion; CDC streams; batch ETL | source_id, source_system, retrieval_at, hash, raw_payload | Basement of lineage; PMLA Rule 9 retention; CES arithmetic ultimately drills here |
| **ProcessExecution** | One subject's full journey through one process | UCIC-2024-00123 (KYC); AML-ALRT-2024-00502 (AML); DL-APP-2024-00884 (Lending); VEND-2024-00205 (Vendor) | Anchor source event (account-open request, alert-generated, loan-application-submitted, vendor-request-submitted) + downstream joins | process_execution_id, anchor_key, process_id (PROC-KYC-001 etc.), valid_time, system_time | Single cross-system anchor; the unit of population testing (denominator for CES) |
| **StepExecution** | One stage inside a ProcessExecution | STEP-KYC-08 (CKYCR upload) for UCIC-2024-00123; STEP-AML-04 (L1 triage) for AML-ALRT-2024-00501 | Source events tagged to a step; BPO ticket events; system actor events | step_execution_id, step_id, parent_pe_id, actor (system / branch_staff / bpo_l1 / etc.), timestamp | Where process drift becomes visible; consumed by AI-002 |
| **ControlInstance** | One evaluation of one control on one ProcessExecution | CTRL-KYC-008 for UCIC-2024-00127 (Fail); CTRL-AML-003 for AML-ALRT-2024-00501 (Pass); CTRL-LND-002 for DL-APP-2024-00884 (Fail) | ControlInstance generator runs trigger-condition query against ProcessExecution + StepExecution streams | ci_id, ctrl_id, pe_id, outcome ∈ {Pass, Fail, DataGap, EvidenceGap}, fired_at | The atomic unit of CES Operating Rate and Catch Rate |
| **EvidenceRecord** | Proof attached to a ControlInstance | KFS PDF (EVD-DOC) for DL-APP-2024-00881; FIU-IND ack (EVD-LOG) for AML-ALRT-2024-00501; UIDAI OTP response (EVD-BIO) for UCIC-2024-00126 | Source documents and logs linked to ControlInstance via primary join keys | ev_id, ev_type ∈ {EVD-LOG..EVD-BIO}, hash, source_record_id, ci_id | Drives CES Evidence Completeness; PMLA Rule 9 retention; AFI defence |
| **Issue / Exception** | A failed ControlInstance or recurring pattern requiring an ActionTask | ISS-2026-085* (KFS post-acceptance pattern in DSA channel; CTRL-LND-002); ISS-2026-061* (UPI mule spike; CTRL-AML-005) | ControlInstance with outcome=Fail, or AI-clustering across ControlInstances | iss_id, linked_ci_ids, owner, target_close_date, linked_obl_id, status | Drives `OUT-004` (Issue Remediation) and the AFI MRA / RMP / MAP closure tracker |

---

## 3. Correlation Principles

These ten platform-wide correlation rules are non-negotiable. They are derived from RBI's expectation of **per-record traceability**, the BPO-fragmented operational reality of mid-sized Indian banks, and the PMLA Rule 9 standard for evidence reconstruction.

| Rule # | Rule | Meaning | India Banking Example | Why It Matters | Failure If Ignored |
|---|---|---|---|---|---|
| **1** | Prefer stable system-generated IDs over names, PAN, or descriptions | Use UCIC, alert_id, loan_application_id, vendor_request_id — never `customer_name = "Rajesh Kumar"`, never `PAN_text = "ABCPK1234D"` | Branch CSR types "Rajesh Kumar S/o Suresh" while DigiLocker brings "Rajesh Kumar Suresh" — name-based join produces 4 phantom UCICs for the same person | India has high name-collision density; PAN can be partially masked; transliteration variants (Devanagari → Latin) destroy fuzzy-name accuracy | Phantom duplicates inflate KYC denominator; sanctions screening false negatives; Paytm PB-style "31 cr inoperative wallets" archetype |
| **2** | Use process anchor IDs as the root join key | UCIC for PROC-KYC-001; alert_id for PROC-AML-001; loan_application_id for PROC-LND-001; vendor_request_id for PROC-VND-001 | UCIC-2024-00127 anchors every CKYCR / CBS / AML scoring / re-KYC scheduler join — a single key crossing seven systems | Anchor IDs are the only keys guaranteed to survive across CBS / LOS / AML / CKYCR / FIU-IND / NPCI / ITSM | Without anchors, every cross-system question requires N-way fuzzy joins; concurrent audit cannot reproduce results week-to-week |
| **3** | Use secondary IDs (account_id, PAN, Aadhaar-hash, mobile) only when the anchor is missing; never use raw Aadhaar | If UCIC is unavailable, fall back to (account_id ∩ PAN-hash); fall back to mobile-hash only as a last resort. Aadhaar is **never** stored or joined as raw 12-digit number — only as a non-reversible salted hash, per Aadhaar Act 2016 s.29 and DPDP Act 2023 | UCIC-2024-00127 (DBT/scholarship account) — no PAN on file (minor account); join by Aadhaar-hash + mobile-hash + DOB-bucket only | Aadhaar Act / DPDP Act exposure on raw-Aadhaar storage; one Sec 47A precedent (Paytm PB) and one DPDPB referral risk per breach | Personal-data breach notification under DPDP Act and CERT-In 6-hr rule; criminal liability under Aadhaar Act s.37/38 |
| **4** | Use timestamp windows as a last-resort fallback — never as primary join logic; document the window | If anchor and secondary IDs are both missing, allow `±5 min` window join between CBS event and AML feed only as documented exception, with audit log | DL-APP-2024-00882 — bureau pull arrives T+2d due to API timeout; LOS-bureau join must use bureau_request_id, never `pull_at ≈ application_at` | Time-only joins are unreproducible (clock drift Rule 9), produce false matches across customers in the same minute | Re-running the test next week produces a different answer; workpaper rejected by AFI as non-reproducible |
| **5** | Never treat name-only or PAN-only matching as confirmed correlation across BPO and CBS | BPO platforms (KYC L1, AML L1, Complaints L1) typically have free-text name and partial PAN; do not promote BPO-CBS joins on these alone | BPO L1 dispositions AML-ALRT-2024-00501 with subject "Rajesh Kumar"; CBS shows three UCICs matching — BPO outcome must be re-keyed to alert_id, never to "Rajesh Kumar" | BPO floors are tier-2/3 city operators with high typo rate; mis-attribution to the wrong UCIC distorts customer risk rating | Wrong UCIC carries the alert disposition; HSBC India Feb-2025 archetype (AML alert outsourcing without integrity) — Sec 47A territory |
| **6** | Preserve and store matching confidence on every correlation record | Every cross-system join row stores `match_confidence ∈ [0,1]`, `match_method ∈ {anchor, secondary, fuzzy_name, timestamp_window}`, `matched_by ∈ {system, manual_reviewer}` | UCIC-2024-00127 ↔ Aadhaar-hash join: confidence 0.97, method "secondary+aadhaar_hash+mobile_hash", matched_by "system" | PMLA Rule 9 defensibility — "how did you know this evidence belongs to this customer?" | An AFI inspector can challenge the join; without confidence + method, the bank cannot defend the correlation |
| **7** | Preserve original source IDs alongside derived platform IDs — never overwrite | Store `cbs_cust_no`, `los_applicant_id`, `aml_subject_uid`, `ckycr_no`, `npci_va`, `itsm_ticket_id` next to the platform-internal `pe_id` | DL-APP-2024-00884 carries `los_app_id = "NWG-DLP-2024-128841"` AND platform `pe_id = "PE-PROC-LND-001-2026-04-15T..."` | Source-system audits compare back to source IDs; loss of source ID breaks the round-trip | Statutory auditor cannot reconcile platform numbers to LOS export; concurrent audit workpapers fail AFI |
| **8** | Never silently drop unmatched records — route to **Orphan Queue**; orphan queue reviewed in concurrent audit daily cycle | Every ingestion run produces an orphan-queue table: `orphan_id, source_record_id, source_system, attempted_join_keys, classification, queued_at` | A CKYCR ack arrives with `ckycr_no` that has no matching UCIC in CBS; row goes to orphan queue, classified `orphan` | Silent drops break PMLA Rule 9 (record completeness); concurrent auditor must review orphans daily per RBI 18-Sep-2019 framework | Genuine STR-able subject lost from view; FIU-IND submission completeness compromised |
| **9** | Classify every unmatched record explicitly | Categories: `orphan` (no anchor found anywhere); `source-data-issue` (anchor field is blank / malformed); `BPO-timing-gap` (BPO batch not yet arrived); `schema-mismatch` (source-system upgrade changed field name); `batch-delay` (known cyclical delay) | An AML L1 disposition row arrives without `alert_id` (CBS failover replayed an old batch with truncated columns) — classified `schema-mismatch`, escalated to ETL team | Classification drives the right remediation team and the right RBI defence narrative | Generic "unmatched" hides root cause; the same break happens monthly with no fix |
| **10** | Every aggregate metric must be traceable to individual source records | A CES of 73% on CTRL-LND-002 must drill to the 11,118 specific DL-APP-IDs that failed and the specific LOS source row for each | DL-APP-2024-00884's CTRL-LND-002 fail must surface in the CES denominator with a one-click drill to LOS event-stream row | Pass 1 Principle 5 ("Every metric drills to evidence") and OUT-007 (population-level testing) | Vanity dashboards; AFI-rejected; CRO cannot defend the number to the SSM |

---

## 4. KYC / Customer Onboarding — Correlation Model

### 4.1 Master Process Entity — KYCOnboardingExecution (PROC-KYC-001)

| Field | Source System / Table | Role | Required? | Notes |
|---|---|---|---|---|
| `ucic` | CBS `CUST_MAST.UCIC` (Finacle / Flexcube / BaNCS) | Process anchor key | **Yes** | Primary join across all systems; 16-digit; never null after STEP-KYC-09 |
| `account_id` | CBS `ACCT_MAST.ACCT_NO` | Linked entity | Yes (post-activation) | One UCIC may have many accounts; SB / CA / DBT / NRO / NRE differentiated |
| `pan_hash` | CBS `CUST_MAST.PAN` (SHA-256 salted) | Secondary join key | Conditional | Required for adult Indian residents; minor / DBT exempt |
| `aadhaar_uid_hash` | CBS `CUST_MAST.AADHAAR_REF` (hashed; raw not stored) | Secondary join key | Conditional | Hashed only; Aadhaar Act s.29 + DPDP Act |
| `mobile` | CBS `CUST_MAST.MOBILE` (hashed) | Tertiary join key | Yes | Used for OTP, SMS notifications, fallback join |
| `customer_name` | CBS `CUST_MAST.NAME` | Display + fallback | Yes | Free text; never used as join key (Rule 5) |
| `application_received_at` | CRM / branch portal / DLA event | Process start timestamp | Yes | Anchor `valid_time` start |
| `account_activated_at` | CBS event-stream `ACCT_OPN_EVT` | Process closure timestamp | Yes | Must follow all gating steps |
| `kyc_mode` | CBS `CUST_MAST.KYC_MODE` ∈ {branch, BPO, V-CIP, DigiLocker, Aadhaar-OTP, Partner-LSP} | Channel attribute | Yes | Drives EDD / re-KYC cadence |
| `ckycr_upload_status` | CKYCR registry response | Compliance status | Yes | One of {pending, uploaded, ack_received, retry, failed} |
| `ckycr_acknowledgement_id` | CKYCR `ACK_PAYLOAD.CKYCR_NO` | Evidence anchor | Yes (after STEP-KYC-08) | 14-digit; key for CKYCR ↔ UCIC join |
| `ckycr_upload_timestamp` | CKYCR `ACK_PAYLOAD.RECVD_AT` | Compliance timestamp | Yes | ≤T+3d from `account_activated_at` for OBL-RBI-001 |
| `sanctions_screening_run_id` | Screening tool (Fircosoft / Bridger) `SCR_RUN.RUN_ID` | Evidence anchor | Yes | Per-event |
| `uapa_screening_run_id` | UAPA daily-run log `UAPA_RUN.RUN_ID` | Evidence anchor | Yes | Daily; OBL-RBI-050 |
| `screening_result` | Screening tool `SCR_RUN.RESULT` ∈ {hit, no_hit, pending} | Compliance outcome | Yes | Hits drive freeze + EDD |
| `risk_category` | Risk engine `RISK_RATING.CATEGORY` ∈ {low, medium, high, very_high} | Process attribute | Yes | Drives re-KYC cycle (10y / 8y / 2y) |
| `edd_required_flag` | Risk engine `RISK_RATING.EDD_REQ` (boolean) | Process attribute | Yes | Triggered for high / very-high risk |
| `edd_completed_flag` | EDD case workflow `EDD_CASE.STATUS = closed_completed` | Process attribute | Conditional | Required if `edd_required_flag = TRUE` |
| `edd_approver_id` | EDD workflow `EDD_CASE.APPROVER_USER_ID` | Accountability anchor | Conditional | Senior approver per `OBL-RBI-005` |
| `re_kyc_due_date` | Risk engine `RISK_RATING.NEXT_REKYC_DT` | Compliance schedule | Yes | Computed from `risk_category` + `account_activated_at` |
| `re_kyc_completed_flag` | Risk engine update event | Compliance status | Conditional | Required as date passes |
| `process_status` | Platform-derived | State | Yes | Enumeration below |
| `closure_event_timestamp` | Platform-derived | State | Yes | Set at `process_status` terminal |

**`process_status` enumeration:** `submitted` | `identity_verification` | `sanctions_screening` | `risk_rating` | `edd_pending` | `ckycr_upload_pending` | `activated` | `rejected` | `failed_control` | `data_gap`.

### 4.2 Cross-System Join Map — PROC-KYC-001

| From System / Table | To System / Table | Primary Join Key | Backup Join Key | Timestamp Rule | Expected Cardinality | Common Breakage | Audit Impact |
|---|---|---|---|---|---|---|---|
| CBS `CUST_MAST` | UIDAI Aadhaar-auth response (eKYC API) / NSDL PAN-verify / DigiLocker OVD token | `ucic` ↔ `cust_no` (CBS internal) | `aadhaar_uid_hash` ∩ `mobile_hash` | `aadhaar_auth_at < account_activated_at` | one-to-one | UIDAI response payload not archived (only HTTP-200 logged) → EVD-BIO missing | EVD-BIO gap; CTRL-KYC-002 evidence-gap; PMLA Rule 9 reconstruction fails |
| CBS `CUST_MAST` | Sanctions screening (Fircosoft / Bridger / in-house) `SCR_RUN` | `ucic` | `pan_hash` ∩ `dob_bucket` | `screening_run_at < account_activated_at`; `list_version_at - run_at ≤ 24h` | one-to-many (rerun on list update) | List version not stamped on run record → cannot prove which list version was screened | CTRL-KYC-006 fail; OBL-RBI-050 exposure |
| CBS `CUST_MAST` | UAPA daily-run log | `ucic` | n/a (must be anchor) | One run per `ucic` per calendar day | one-to-one daily | Daily-run truncated (BPO upload) → entire day missing for some UCIC cohort | OBL-RBI-050 daily-screening breach; AFI MRIA |
| Sanctions / UAPA `SCR_RUN` | Risk engine `RISK_RATING` | `ucic` + `screening_run_id` | `aadhaar_uid_hash` | `screening_result_at < risk_rating_at` | one-to-one per cycle | Screening result not propagated to risk engine (event bus drop) | Risk category stale; CTRL-KYC-005 mis-evaluated |
| Risk engine `RISK_RATING` | EDD workflow `EDD_CASE` | `ucic` | n/a | `risk_rating_at < edd_initiated_at`; `edd_completed_at < account_activated_at` for high risk | one-to-one (high / very-high only) | EDD workflow opened but never closed; senior approval rubber-stamped without evidence | CTRL-KYC-005 fail; OBL-RBI-005 exposure |
| EDD workflow / Risk engine | CKYCR upload event | `ucic` ↔ `ckycr_no` (after first upload) | `pan_hash` ∩ `dob` | `ckycr_upload_at ≤ account_activated_at + 3 days` (OBL-RBI-001 / OBL-RBI-003) | one-to-one | CKYCR upload retried but new `ckycr_no` issued; legacy mapping not updated | CTRL-KYC-005 / CTRL-KYC-008 fail; OBL-RBI-003 exposure |
| CKYCR registry | CBS `ACCT_MAST` activation event | `ucic` | `ckycr_no` | CKYCR ack must arrive **before** activation event (or within 3d post-activation per `OBL-RBI-001`) | one-to-one | CKYCR ack lost in batch (CKYCR endpoint downtime) — bank activates account on assumption | OBL-RBI-001 breach; CTRL-KYC-008 fail |
| CBS activation event | Document evidence store (SharePoint / OpenText / in-house) | `ucic` + `evidence_type` | `account_id` + `kyc_mode` | `evidence_store_at ≤ activation_at + 24h` | one-to-many | Branch retains paper docs without digitisation; BPO scans but mis-tags `ucic` | CTRL-KYC-001 evidence-gap; PMLA Rule 9 5-yr retention |
| Document evidence store | KYC audit log | `ucic` + `step_id` | `evidence_id` | `audit_log_at = step_completion_at` | one-to-many | Audit log written to wrong index (BPO platform partitioning) | CTRL-KYC-001..008 evidence-gap on retrieval |

### 4.3 Stage-Level Correlation — Fourteen KYC Stages

| Stage # | Stage Name | Source Record | StepExecution Name | Primary Join Key | Timestamp Field | Must Occur Before | Evidence Generated | Controls Affected | Correlation Risk |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Application / Account Opening Request Received | CRM / branch portal / DLA event | STEP-KYC-01 | `application_id` ↔ `ucic` (provisional) | `application_received_at` | All others | EVD-LOG (CRM) | CTRL-KYC-001 | Channel mis-tagging (V-CIP recorded as branch); duplicate `application_id` |
| 2 | OVD Collection (physical / DigiLocker / V-CIP) | DigiLocker token / V-CIP recording / scanned doc | STEP-KYC-02a | `application_id` + `ovd_token_id` | `ovd_received_at` | Stage 3 | EVD-DOC (DigiLocker), EVD-IMG (scan), EVD-CALL (V-CIP) | CTRL-KYC-001, CTRL-KYC-007 | Doc image illegible; DigiLocker token expired silently |
| 3 | Identity Verification (Aadhaar OTP / PAN / Video-KYC) | UIDAI eKYC response; NSDL PAN-verify; V-CIP audit trail | STEP-KYC-02 | `ucic_provisional` ↔ `aadhaar_uid_hash` ∩ `pan_hash` | `aadhaar_auth_at`, `pan_verify_at` | Stage 4 | EVD-BIO (UIDAI), EVD-LOG (NSDL), EVD-CALL (V-CIP) | CTRL-KYC-002, CTRL-KYC-007 | UIDAI payload not archived (HTTP-200 only); V-CIP recording corrupted |
| 4 | KYC CIP Completeness Check | KYC workflow tool | STEP-KYC-03 | `application_id` | `cip_check_at` | Stage 5 | EVD-LOG | CTRL-KYC-001 | Min-CDD account not converted to full-KYC within window; OBL-RBI-001 |
| 5 | Sanctions Screening (Fircosoft / Bridger) | Screening tool `SCR_RUN` | STEP-KYC-06a | `application_id` ↔ `screening_run_id` | `screening_run_at` | Stage 6, 12 | EVD-LOG (run record + result) | CTRL-KYC-002, CTRL-KYC-006 | List version not stamped; transliteration variants missed |
| 6 | UAPA s.51A Daily Screening | UAPA daily-run log | STEP-KYC-06b | `ucic` ↔ `uapa_run_id` | `uapa_run_at` (daily) | Continuous post-activation | EVD-LOG | CTRL-KYC-001 (composite), `OBL-RBI-050` | Daily run truncated; not run during long weekends |
| 7 | PEP / Adverse-Media Screening | Screening tool `PEP_RUN` | STEP-KYC-06c | `application_id` ↔ `pep_run_id` | `pep_run_at` | Stage 8 | EVD-LOG | CTRL-KYC-002 | Adverse-media feed stale; PEP variants missed |
| 8 | Customer Risk Rating | Risk engine `RISK_RATING` | STEP-KYC-05 | `ucic` (or `application_id` if pre-UCIC) | `risk_rating_at` | Stage 9 | EVD-LOG | CTRL-KYC-005, CTRL-KYC-003 (cycle calc) | Risk engine model not retrained for new product mix |
| 9 | EDD Required Assessment | Risk engine + workflow | STEP-KYC-07a | `ucic` | `edd_assessed_at` | Stage 10 | EVD-LOG, EVD-ATTEST | CTRL-KYC-005 | EDD threshold rule misconfigured; high-risk wrongly classed medium |
| 10 | EDD Execution and Senior Approval | EDD workflow `EDD_CASE` | STEP-KYC-07 | `ucic` | `edd_completed_at`, `edd_approver_id` | Stage 12 | EVD-DOC, EVD-ATTEST | CTRL-KYC-005 | Pro-forma source-of-funds; senior approval rubber-stamp |
| 11 | CKYCR Upload and Acknowledgement | CKYCR registry response | STEP-KYC-08 | `ucic` ↔ `ckycr_no` | `ckycr_upload_at`, `ckycr_ack_at` | ≤T+3d from Stage 12 | EVD-LOG (ack), EVD-RECON | CTRL-KYC-008, CTRL-KYC-005 | CKYCR endpoint downtime; ack lost in batch |
| 12 | Account Activation (CBS event) | CBS event-stream `ACCT_OPN_EVT` | STEP-KYC-09 | `ucic` ↔ `account_id` | `account_activated_at` | Closure | EVD-LOG | CTRL-KYC-001 (composite gate) | Branch override of activation gate without override-event log |
| 13 | Periodic Re-KYC Scheduling (`re_kyc_due_date` set) | Risk engine `RISK_RATING.NEXT_REKYC_DT` | STEP-KYC-10 | `ucic` | `re_kyc_due_date` | Continuous post-activation | EVD-LOG | CTRL-KYC-003 | DBT / scholarship cohort not flagged; AI-016 segmentation |
| 14 | Evidence Stored and Audit Log Sealed | Document store + audit log | STEP-KYC-11 | `ucic` + `step_id` | `audit_log_sealed_at` | Closure | EVD-RECON, hash-stamp | All KYC controls | Audit log hash not reproducible week-to-week |

### 4.4 ControlInstance Generation Logic — CTRL-KYC-001 to CTRL-KYC-008

| Control ID | Trigger Condition | Expected-to-Fire Population | Required Source Records | Evidence Required | Pass Logic | Fail Logic | Data Gap Logic | Evidence Gap Logic |
|---|---|---|---|---|---|---|---|---|
| **CTRL-KYC-001** Sanctions + UAPA screening before account activation (composite gate) | CBS `ACCT_OPN_EVT` fired for any UCIC | All ProcessExecutions in `process_status ∈ {activated, rejected}` for the window | `ACCT_OPN_EVT`, `SCR_RUN`, `UAPA_RUN`, `RISK_RATING` | EVD-LOG (sanctions run); EVD-LOG (UAPA run); EVD-LOG (CBS activation) | `screening_result = no_hit OR cleared` AND `uapa_screening_run_at ≥ activation_at − 24h` AND `screening_run_at < activation_at` | `screening_result = hit AND not cleared` OR `screening_run_at ≥ activation_at` OR no UAPA run in window | Either `SCR_RUN` or `UAPA_RUN` row not joinable to UCIC (orphan) | Pass logic met but no `EVD-LOG` archived (HTTP-200 logged but no payload retained) |
| **CTRL-KYC-002** PAN / Aadhaar verification completeness before activation | CBS `ACCT_OPN_EVT` for any non-minor UCIC | All adult-resident UCICs in window with `pan_hash IS NOT NULL` expectation | `ACCT_OPN_EVT`, NSDL `PAN_VERIFY`, UIDAI `EKYC_RESPONSE` | EVD-LOG (PAN), EVD-BIO (Aadhaar OTP) | `pan_verify_status = success` AND `aadhaar_auth_status ∈ {success, otp_success}` AND both before `activation_at` | One or both verifications fail or absent | UIDAI / NSDL response payload not joinable to UCIC | HTTP-200 but no payload archived (EVD-BIO missing) |
| **CTRL-KYC-003** Periodic re-KYC completion within scheduled window (10y / 8y / 2y) | Daily scan of `re_kyc_due_date ≤ current_date` | All UCICs whose `re_kyc_due_date` falls in window | `RISK_RATING`, re-KYC workflow events, `EDD_CASE` (high-risk), CKYCR re-upload event | EVD-LOG (workflow), EVD-DOC (refreshed OVD) | `re_kyc_completed_at ≤ re_kyc_due_date + grace_period` AND fresh CKYCR upload | `re_kyc_completed_at IS NULL` past `re_kyc_due_date + grace_period` OR completed but no fresh OVD | `re_kyc_due_date` field null in `RISK_RATING` (mostly DBT / scholarship cohort — AI-016 segment) | Workflow closed but EVD-DOC (refreshed OVD) missing |
| **CTRL-KYC-004** Beneficial-owner threshold check for legal entities (≥10% partnership / 25% co. / trust protector) | New legal-entity UCIC creation OR amendment to ownership chain | All legal-entity UCICs (partnership / co. / trust) opened or amended in window | `CUST_MAST` (entity_type), MCA portal extract, `BO_CHAIN` table | EVD-DOC (MCA extract), EVD-SIGN (BO declaration), EVD-ATTEST (compliance officer) | All BOs ≥ threshold identified; chain depth ≤ documented; trust protector identified | BO threshold breached or chain unresolved; AI-014 fires | MCA portal API down; chain partial | Pass logic met but EVD-DOC (MCA extract) hash not stored |
| **CTRL-KYC-005** EDD completion before activation for high / very-high risk | `RISK_RATING` produces `risk_category ∈ {high, very_high}` | All high / very-high risk UCICs in window | `RISK_RATING`, `EDD_CASE`, senior-approval workflow | EVD-DOC (source of funds / wealth), EVD-ATTEST (senior approver), EVD-LOG (workflow) | `edd_completed_flag = TRUE` AND `edd_approver_id IS NOT NULL` AND `edd_completed_at < activation_at` | EDD not started, not closed, or approver missing | EDD case not joinable to UCIC (orphan workflow) | Closed but pro-forma narrative; EVD-DOC missing source-of-funds doc |
| **CTRL-KYC-006** Sanctions list version currency — `list_version` ≤ 24h at run time | Each sanctions screening run | Every `SCR_RUN` row in window | `SCR_RUN`, sanctions list metadata | EVD-LOG with `list_version_at` stamp | `screening_run_at − list_version_published_at ≤ 24h` | List > 24h stale at run time | `list_version_at` not stamped on `SCR_RUN` row | Pass logic met but list version source artefact not archived |
| **CTRL-KYC-007** Video KYC audit trail completeness — recording, liveness, consent | Each V-CIP session | All V-CIP `kyc_mode` UCICs in window | V-CIP platform `SESSION` record | EVD-CALL (recording), EVD-IMG (liveness frame), EVD-SIGN (consent) | All three artefacts present, hash-verified, retrieval ≤ retention SLA | One or more artefacts absent or corrupted | V-CIP session record orphan (V-CIP platform partitioned) | Recording exists but consent audio segment missing or unintelligible |
| **CTRL-KYC-008** CKYCR upload within prescribed timeline post-activation | CBS `ACCT_OPN_EVT` activates UCIC | All newly activated UCICs in window | `ACCT_OPN_EVT`, CKYCR `UPLOAD_RECORD`, CKYCR `ACK_PAYLOAD` | EVD-LOG (upload), EVD-LOG (ack with `ckycr_no`) | `ckycr_upload_at ≤ activation_at + 3 days` AND `ckycr_ack_id IS NOT NULL` | Upload missing OR ack missing OR > 3 days late | CKYCR registry endpoint timeout / batch lag | Pass logic met but ack payload not retained |

### 4.5 Correlation Example Using Sample Data — UCIC-2024-00123, UCIC-2024-00126, UCIC-2024-00127

#### UCIC-2024-00123 — New retail, normal risk, BPO-onboarded

**Part A — Source Records Joined**

| Source Table | Record ID | Key Fields Used | Join Status |
|---|---|---|---|
| CBS `CUST_MAST` | `CIF-FNCL-987654` | `ucic = UCIC-2024-00123`, `pan_hash`, `mobile_hash` | Joined |
| UIDAI eKYC response | `UIDAI-RES-2026-04-02-9912` | `aadhaar_uid_hash`, `txn_ts` | Joined |
| NSDL PAN-verify | `NSDL-PAN-2026-04-02-7821` | `pan_hash` | Joined |
| Sanctions `SCR_RUN` | `FIR-RUN-2026-04-02-15431` | `application_id` ↔ `ucic`, `list_version` | Joined |
| UAPA daily-run | `UAPA-RUN-2026-04-02` | `ucic` | Joined |
| Risk engine `RISK_RATING` | `RR-2026-04-02-UCIC-2024-00123` | `ucic`, `risk_category=low` | Joined |
| CKYCR `ACK_PAYLOAD` | `CKYCR-NO-99887766554433` | `ucic` ↔ `ckycr_no` | Joined |
| CBS `ACCT_OPN_EVT` | `ACCT-OPN-2026-04-03-44521` | `ucic`, `account_id` | Joined |
| BPO platform `KYC_TICKET` | `BPO-KYC-2026-04-02-77198` | `bpo_ref` ↔ `application_id` | Joined |
| Document store | `DOC-UCIC-2024-00123-OVD-PDF` | `ucic` + `evidence_type` | Joined |

**Part B — ProcessExecution Created**

| Field | Value |
|---|---|
| `pe_id` | PE-PROC-KYC-001-2026-04-03T11-22Z-UCIC-2024-00123 |
| `ucic` | UCIC-2024-00123 |
| `account_id` | SB-FNCL-1100022211 |
| `pan_hash` | `7f3c9...` |
| `aadhaar_uid_hash` | `c12fe...` |
| `mobile` (hash) | `b88e1...` |
| `customer_name` | (display only) |
| `application_received_at` | 2026-04-02T09:14Z |
| `account_activated_at` | 2026-04-03T11:22Z |
| `kyc_mode` | BPO |
| `ckycr_upload_status` | ack_received |
| `ckycr_acknowledgement_id` | 99887766554433 |
| `ckycr_upload_timestamp` | 2026-04-03T18:55Z |
| `sanctions_screening_run_id` | FIR-RUN-2026-04-02-15431 |
| `uapa_screening_run_id` | UAPA-RUN-2026-04-02 |
| `screening_result` | no_hit |
| `risk_category` | low |
| `edd_required_flag` | FALSE |
| `edd_completed_flag` | N/A |
| `edd_approver_id` | NULL |
| `re_kyc_due_date` | 2036-04-03 (10y; LRC) |
| `re_kyc_completed_flag` | N/A (not yet due) |
| `process_status` | activated |
| `closure_event_timestamp` | 2026-04-03T18:55Z |

**Part C — StepExecutions Created**

| Step # | StepExecution Name | Status | Timestamp | BPO/Branch/System | Notes |
|---|---|---|---|---|---|
| 1 | STEP-KYC-01 | completed | 2026-04-02T09:14Z | BPO | App captured at BPO digital portal |
| 2 | STEP-KYC-02a | completed | 2026-04-02T09:35Z | BPO | DigiLocker OVD pulled |
| 3 | STEP-KYC-02 | completed | 2026-04-02T09:42Z | system (UIDAI) | Aadhaar OTP success |
| 4 | STEP-KYC-03 | completed | 2026-04-02T10:01Z | BPO | CIP complete |
| 5 | STEP-KYC-06a | completed | 2026-04-02T10:08Z | system (Fircosoft) | no_hit |
| 6 | STEP-KYC-06b | completed | 2026-04-02T03:00Z (daily run) | system (UAPA) | no_hit |
| 7 | STEP-KYC-06c | completed | 2026-04-02T10:09Z | system | no_hit |
| 8 | STEP-KYC-05 | completed | 2026-04-02T10:15Z | system | risk_category=low |
| 9 | STEP-KYC-07a | completed | 2026-04-02T10:16Z | system | edd_required=FALSE |
| 10 | STEP-KYC-07 | n/a | — | — | Not required (low risk) |
| 11 | STEP-KYC-08 | completed | 2026-04-03T18:55Z | system (CKYCR) | ack received |
| 12 | STEP-KYC-09 | completed | 2026-04-03T11:22Z | system (CBS) | account activated |
| 13 | STEP-KYC-10 | completed | 2026-04-03T11:23Z | system | re-KYC scheduled 2036-04-03 |
| 14 | STEP-KYC-11 | completed | 2026-04-03T19:00Z | system | audit log sealed |

**Part D — ControlInstances Created**

| Control ID | Outcome | Reason | Evidence Linked? | OBL-ID Affected |
|---|---|---|---|---|
| CTRL-KYC-001 | Pass | Sanctions + UAPA + activation gate intact | Y | OBL-RBI-001, OBL-RBI-050 |
| CTRL-KYC-002 | Pass | PAN + Aadhaar success; payloads archived | Y | OBL-RBI-001 |
| CTRL-KYC-003 | n/a (not yet in window) | re-KYC due 2036-04-03 | n/a | OBL-RBI-002 |
| CTRL-KYC-004 | n/a | Individual customer | n/a | OBL-RBI-005 |
| CTRL-KYC-005 | n/a | Low risk, no EDD | n/a | OBL-RBI-005 |
| CTRL-KYC-006 | Pass | List version 12h fresh at run | Y | OBL-RBI-050 |
| CTRL-KYC-007 | n/a | BPO mode, not V-CIP | n/a | — |
| CTRL-KYC-008 | Pass | CKYCR upload at T+7h, ack received | Y | OBL-RBI-001 / OBL-RBI-003 |

**Part E — Final Conclusion.** Clean activation, low risk, BPO-onboarded; all in-scope ControlInstances Pass with EVD-LOG / EVD-BIO archived. A Concurrent Auditor (PERSONA-003) would mark this as a clean workpaper sample; nothing to flag.

#### UCIC-2024-00126 — NRI account, EDD required, branch-onboarded

**Part A — Source Records Joined**

| Source Table | Record ID | Key Fields Used | Join Status |
|---|---|---|---|
| CBS `CUST_MAST` | `CIF-FNCL-987655` | `ucic = UCIC-2024-00126`, `nri_flag=TRUE` | Joined |
| Branch portal | `BR-APP-2026-04-04-321` | `application_id` | Joined |
| NSDL PAN-verify | `NSDL-PAN-2026-04-04-7822` | `pan_hash` | Joined |
| FATCA / CRS declaration | `FATCA-2026-04-04-99` | `ucic` | Joined |
| Sanctions `SCR_RUN` | `FIR-RUN-2026-04-04-15998` | `ucic` | Joined |
| UAPA daily-run | `UAPA-RUN-2026-04-04` | `ucic` | Joined |
| Risk engine `RISK_RATING` | `RR-2026-04-04-UCIC-2024-00126` | `ucic`, `risk_category=high` | Joined |
| EDD workflow `EDD_CASE` | `EDD-2026-04-05-1187` | `ucic`, `approver_id=USR-CCO-022` | Joined |
| CKYCR `ACK_PAYLOAD` | `CKYCR-NO-99887766554434` | `ucic` ↔ `ckycr_no` | Joined |
| CBS `ACCT_OPN_EVT` | `ACCT-OPN-2026-04-08-44999` | `ucic`, `account_id=NRO-FNCL-220...` | Joined |
| Document store | `DOC-UCIC-2024-00126-SOF-PDF` | source-of-funds doc | Joined |

**Part B — ProcessExecution Created**

| Field | Value |
|---|---|
| `pe_id` | PE-PROC-KYC-001-2026-04-08T14-12Z-UCIC-2024-00126 |
| `ucic` | UCIC-2024-00126 |
| `account_id` | NRO-FNCL-2200033312 |
| `kyc_mode` | branch |
| `application_received_at` | 2026-04-04T11:00Z |
| `account_activated_at` | 2026-04-08T14:12Z |
| `risk_category` | high |
| `edd_required_flag` | TRUE |
| `edd_completed_flag` | TRUE |
| `edd_approver_id` | USR-CCO-022 |
| `screening_result` | no_hit |
| `ckycr_upload_status` | ack_received |
| `ckycr_acknowledgement_id` | 99887766554434 |
| `ckycr_upload_timestamp` | 2026-04-08T18:00Z |
| `re_kyc_due_date` | 2034-04-08 (8y; MRC) — re-evaluated to 2028-04-08 (2y; HRC) on classification |
| `process_status` | activated |
| `closure_event_timestamp` | 2026-04-08T18:00Z |

**Part C — StepExecutions Created**

| Step # | StepExecution Name | Status | Timestamp | BPO/Branch/System | Notes |
|---|---|---|---|---|---|
| 1 | STEP-KYC-01 | completed | 2026-04-04T11:00Z | branch | NRI walk-in |
| 2 | STEP-KYC-02a | completed | 2026-04-04T11:30Z | branch | Passport + visa scanned |
| 3 | STEP-KYC-02 | completed | 2026-04-04T11:45Z | system | PAN-verify success |
| 4 | STEP-KYC-03 | completed | 2026-04-04T12:00Z | branch | CIP complete + FATCA / CRS |
| 5 | STEP-KYC-06a | completed | 2026-04-04T12:05Z | system | no_hit |
| 6 | STEP-KYC-06b | completed | 2026-04-04T03:00Z | system (UAPA) | no_hit |
| 7 | STEP-KYC-06c | completed | 2026-04-04T12:06Z | system | no_hit |
| 8 | STEP-KYC-05 | completed | 2026-04-04T12:30Z | system | risk_category=high (NRI uplift) |
| 9 | STEP-KYC-07a | completed | 2026-04-04T12:31Z | system | edd_required=TRUE |
| 10 | STEP-KYC-07 | completed | 2026-04-07T16:00Z | compliance officer | EDD case closed; senior approver USR-CCO-022 |
| 11 | STEP-KYC-08 | completed | 2026-04-08T18:00Z | system (CKYCR) | ack received |
| 12 | STEP-KYC-09 | completed | 2026-04-08T14:12Z | system (CBS) | account activated |
| 13 | STEP-KYC-10 | completed | 2026-04-08T14:13Z | system | re-KYC due 2028-04-08 |
| 14 | STEP-KYC-11 | completed | 2026-04-08T18:30Z | system | audit log sealed |

**Part D — ControlInstances Created**

| Control ID | Outcome | Reason | Evidence Linked? | OBL-ID Affected |
|---|---|---|---|---|
| CTRL-KYC-001 | Pass | All gates intact | Y | OBL-RBI-001 |
| CTRL-KYC-002 | Pass | PAN verified; no Aadhaar (NRI exempt) | Y | OBL-RBI-001 |
| CTRL-KYC-003 | n/a | Re-KYC scheduled 2028-04-08 | n/a | OBL-RBI-002 |
| CTRL-KYC-005 | Pass | EDD completed pre-activation; senior approver linked | Y (EDD-2026-04-05-1187, EVD-DOC SOF) | OBL-RBI-005 |
| CTRL-KYC-006 | Pass | List 6h fresh | Y | OBL-RBI-050 |
| CTRL-KYC-008 | Pass | CKYCR upload T+0d, ack received | Y | OBL-RBI-001 / OBL-RBI-003 |

**Part E — Final Conclusion.** Clean NRI activation with EDD evidenced and senior approval chain intact. PERSONA-003 would mark this as a positive workpaper sample for `OBL-RBI-005` BO / EDD coverage. PERSONA-002 would note that re-KYC is now in 2-year cycle (HRC) rather than 8-year — a positive control outcome (correct uplift).

#### UCIC-2024-00127 — DBT / scholarship account, periodic re-KYC pending, BPO-onboarded

**Part A — Source Records Joined**

| Source Table | Record ID | Key Fields Used | Join Status |
|---|---|---|---|
| CBS `CUST_MAST` | `CIF-FNCL-987656` | `ucic = UCIC-2024-00127`, `dbt_flag=TRUE` | Joined |
| BPO platform `KYC_TICKET` | `BPO-KYC-2024-09-15-22118` | `bpo_ref` ↔ `application_id` | Joined |
| UIDAI eKYC response | `UIDAI-RES-2024-09-15-3349` | `aadhaar_uid_hash` | Joined |
| Sanctions `SCR_RUN` | `FIR-RUN-2024-09-15-...` | `ucic` | Joined |
| Risk engine `RISK_RATING` | `RR-2024-09-15-UCIC-2024-00127` | `ucic`, `risk_category=low` | Joined |
| CBS `ACCT_OPN_EVT` | `ACCT-OPN-2024-09-16-...` | `ucic`, `account_id=DBT-FNCL-...` | Joined |
| Risk engine re-KYC scheduler | `(no `re_kyc_due_date` populated)` | `ucic` | **Missing** — DataGap (AI-016 segment) |
| Document store | `DOC-UCIC-2024-00127-OVD-PDF` | `ucic` | Joined |

**Part B — ProcessExecution Created**

| Field | Value |
|---|---|
| `pe_id` | PE-PROC-KYC-001-2024-09-16T10-30Z-UCIC-2024-00127 |
| `ucic` | UCIC-2024-00127 |
| `account_id` | DBT-FNCL-3300011198 |
| `pan_hash` | NULL (minor / no PAN) |
| `aadhaar_uid_hash` | `4ad99...` |
| `kyc_mode` | BPO |
| `application_received_at` | 2024-09-15T08:00Z |
| `account_activated_at` | 2024-09-16T10:30Z |
| `screening_result` | no_hit |
| `risk_category` | low |
| `edd_required_flag` | FALSE |
| `re_kyc_due_date` | **NULL** (not populated by risk engine for DBT cohort — AI-016) |
| `re_kyc_completed_flag` | NULL |
| `ckycr_upload_status` | ack_received |
| `ckycr_acknowledgement_id` | 99887766554435 |
| `process_status` | activated → **flagged data_gap** on `re_kyc_due_date` |
| `closure_event_timestamp` | 2024-09-16T11:00Z (initial); current state: pending_re_kyc_attention |

**Part C — StepExecutions Created** (initial onboarding 2024-09; periodic re-KYC scheduling step did not fire correctly).

| Step # | StepExecution Name | Status | Timestamp | BPO/Branch/System | Notes |
|---|---|---|---|---|---|
| 1–9 | (per stage definitions) | completed | 2024-09-15 / 16 | BPO / system | Clean initial onboarding |
| 10 | STEP-KYC-07 | n/a | — | — | Low risk |
| 11 | STEP-KYC-08 | completed | 2024-09-16T15:30Z | system (CKYCR) | ack received |
| 12 | STEP-KYC-09 | completed | 2024-09-16T10:30Z | system (CBS) | activated |
| 13 | **STEP-KYC-10** | **failed_to_set_due_date** | (expected 2024-09-16) | system (risk engine) | DBT cohort default branch — `re_kyc_due_date` not populated; AI-016 detection signal |
| 14 | STEP-KYC-11 | completed | 2024-09-16T16:00Z | system | audit log sealed (but with re-KYC schedule gap) |

**Part D — ControlInstances Created**

| Control ID | Outcome | Reason | Evidence Linked? | OBL-ID Affected |
|---|---|---|---|---|
| CTRL-KYC-001 | Pass | Onboarding gates intact at activation time | Y | OBL-RBI-001 |
| CTRL-KYC-002 | Pass (Aadhaar-OTP for minor; PAN exempt) | Aadhaar OTP success | Y (EVD-BIO) | OBL-RBI-001 |
| **CTRL-KYC-003** | **Fail** (current period evaluation, 2026-04-15) | `re_kyc_due_date` was never set; periodic re-KYC not triggered for DBT cohort; AI-016 fires | Partial — `RISK_RATING` row exists but field NULL | **OBL-RBI-002** |
| CTRL-KYC-006 | Pass | List currency at run time | Y | OBL-RBI-050 |
| CTRL-KYC-008 | Pass | CKYCR upload + ack at T+0 | Y | OBL-RBI-001 |

**Part E — Final Conclusion.** UCIC-2024-00127 is the AI-016 DBT / scholarship sub-segment archetype. Initial onboarding clean, but periodic re-KYC scheduler failed to populate `re_kyc_due_date` for this customer cohort — a **systematic correlation breakage** classified as `source-data-issue` (not `Data Gap` because the row exists; the field is null). PERSONA-003 (Concurrent Auditor) would flag this as a **Control Failure** on CTRL-KYC-003 with population scope = DBT cohort (estimated thousands of UCICs). PERSONA-002 (CCO) would escalate to ISS-2026-061* / new issue family for OBL-RBI-002 exposure with potential AFI MRA implications. PERSONA-001 (CRO) would see the cluster on the residual-risk dashboard with one-click drill to UCIC-2024-00127 as the representative case.

---

## 5. AML Monitoring — Correlation Model

### 5.1 Master Process Entity — AMLMonitoringExecution (PROC-AML-001)

| Field | Source System / Table | Role | Required? | Notes |
|---|---|---|---|---|
| `alert_id` | AML engine (Oracle FCCM / Mantas / Actimize) `ALERT_HDR.ALERT_ID` | Process anchor key | **Yes** | Single anchor across triage / case / STR |
| `ucic` | AML engine `ALERT_HDR.SUBJECT_UCIC` (via subject map) | Linked subject | Yes | Joined back to CBS for risk_category, etc. |
| `account_id` | AML engine `ALERT_HDR.ACCT_NO` | Linked entity | Yes | One alert may reference many accounts |
| `alert_generated_at` | AML engine `ALERT_HDR.GEN_TS` | Timestamp anchor | Yes | Drives SLA clocks |
| `scenario_id` | AML engine `SCENARIO.SCEN_ID` | Process attribute | Yes | E.g., S-RAPID-FUNNEL, S-STRUCTURING, S-MULE-NETWORK |
| `scenario_version` | AML engine `SCENARIO.VERSION` | Process attribute | Yes | Validates against TM coverage matrix (CTRL-AML-004) |
| `triage_level` | Case mgmt `CASE.TRIAGE_LEVEL` ∈ {L1, L2, L3} | Process state | Yes | Drives BPO routing |
| `l1_disposition` | Case mgmt `L1_ACTION` ∈ {cleared, escalated, pending} | Process outcome | Yes | Set at L1 close |
| `l1_disposed_at` | Case mgmt `L1_ACTION.DISP_TS` | Timestamp | Conditional | Required for closure |
| `l1_sla_breach_flag` | Platform-derived | Compliance flag | Yes | TRUE if `l1_disposed_at − alert_generated_at > 5 BD` (BPO SLA) |
| `l2_review_status` | Case mgmt `L2_ACTION.STATUS` | Process state | Conditional | Required if `l1_disposition = escalated` |
| `l2_reviewed_at` | Case mgmt `L2_ACTION.REVIEW_TS` | Timestamp | Conditional | Drives STR-suspicion-conclusion clock |
| `str_required_flag` | Platform-derived from L2/L3 outcome | Compliance flag | Yes | Derived after suspicion conclusion |
| `str_drafted_at` | Case mgmt `STR_DRAFT.DRAFT_TS` | Timestamp | Conditional | First draft timestamp |
| `str_filed_at` | FIU-IND FINnet 2.0 `STR_SUBMIT.SUBMIT_TS` | Timestamp | Conditional | Statutory anchor |
| `str_ack_id` | FIU-IND FINnet 2.0 `STR_ACK.ACK_ID` | Evidence anchor | Conditional | EVD-LOG anchor |
| `str_filed_within_sla_flag` | Platform-derived | Compliance flag | Yes | TRUE if `str_filed_at ≤ suspicion_concluded_at + 7 working days` (PMLA s.12(1)(b); OBL-PMLA-003) |
| `case_id` | Case mgmt `CASE.CASE_ID` | Linked entity | Yes | One-to-one with `alert_id` (post escalation) |
| `case_closed_at` | Case mgmt `CASE.CLOSE_TS` | Timestamp | Conditional | Closure |
| `sanctions_hit_flag` | Sanctions tool feedback | Compliance flag | Yes | Drives UAPA freeze workflow |
| `uapa_freeze_flag` | UAPA freeze workflow `FREEZE_LOG` | Compliance flag | Conditional | Required if `sanctions_hit_flag=TRUE` |
| `uapa_freeze_actioned_at` | UAPA freeze workflow `FREEZE_LOG.TS` | Timestamp | Conditional | Same-day for OBL-RBI-050 |
| `ai_signal_id` | AI insight node | Linked AI insight | Conditional | E.g., AI-001 (UPI mule), AI-011 (STR triage) |
| `confidence_score` | AI insight | Process attribute | Conditional | If AI-driven |
| `process_status` | Platform-derived | State | Yes | Enumeration below |
| `closure_event_timestamp` | Platform-derived | State | Yes | Set at terminal status |

**`process_status` enumeration:** `generated` | `l1_in_progress` | `l1_overdue` | `l2_review` | `str_pending` | `str_filed` | `case_closed` | `cleared` | `failed_control` | `data_gap`.

### 5.2 Cross-System Join Map — PROC-AML-001

| From System / Table | To System / Table | Primary Join Key | Backup Join Key | Timestamp Rule | Expected Cardinality | Common Breakage | Audit Impact |
|---|---|---|---|---|---|---|---|
| AML engine `ALERT_HDR` | CBS `TXN_LOG` (transactions feeding the alert) | `ucic` ∩ `account_id` | `pan_hash` | All `txn_at` ≤ `alert_generated_at`; replay window matches scenario lookback | one-to-many | CBS Kafka feed lag; replayed batch generates duplicate `alert_id` | Correlation Warning; double-count CES denominator |
| AML engine `ALERT_HDR` | Sanctions `SCR_RUN` | `ucic` ∩ `counterparty_id` | `pan_hash` | `screening_run_at ≥ txn_at` (forward screening) | one-to-many | Counterparty entity not joinable (transliteration variants) | CTRL-AML-001 evidence-gap |
| AML engine `ALERT_HDR` | UAPA daily-run `UAPA_RUN` | `ucic` | `aadhaar_uid_hash` | UAPA run for the day must precede alert disposition for any UAPA-listed entity | one-to-one daily | UAPA list version not stamped; daily run truncated | OBL-RBI-050 breach |
| Case mgmt `CASE` | AML engine `ALERT_HDR` | `alert_id` | `case_id ↔ alert_id` map | `case_opened_at ≥ alert_generated_at` | one-to-one | BPO opens case but `alert_id` typed manually (Rule 5) → wrong alert linked | Wrong alert disposition; HSBC India Feb-2025 archetype |
| Case mgmt `STR_DRAFT` | FIU-IND FINnet 2.0 outbound | `case_id` ∩ `ucic` ↔ FIU `STR_REF` | `pan_hash` ∩ `dob_bucket` | **`str_filed_at ≤ suspicion_concluded_at + 7 working days` (PMLA s.12(1)(b); OBL-PMLA-003)** | one-to-one | Suspicion-conclusion timestamp not captured by Principal Officer; SLA un-measurable | **PMLA s.13 enforcement risk; CTRL-AML-003 fail** |
| FIU-IND FINnet 2.0 outbound | FIU-IND `STR_ACK` | `str_ref` | n/a | `ack_received_at ≤ submit_at + ack_window` | one-to-one | FINnet 2.0 endpoint timeout; ack lost in batch | EVD-LOG missing; CTRL-AML-003 evidence-gap |
| Subject entity graph (UCIC ↔ counterparty network) | NPCI UPI feedback feed | `ucic` ↔ `va` (UPI virtual address) | `mobile_hash` | NPCI feedback `feedback_at` arrives T+1d typical | many-to-many | VA not joinable to UCIC (multiple VAs per customer; partner PSP) | CTRL-AML-005 mule detection breaks |
| AI signal record (AI-001 / AI-011) | AML engine `ALERT_HDR` / Case mgmt `CASE` | `ai_insight_id` ↔ `alert_id` ∩ `case_id` | `ucic` | `ai_inferred_at` ≤ `case_decision_at` | one-to-many | AI insight created but not linked to alert (event bus drop) | CTRL-AML-005 effectiveness-decay |
| AML audit log | Document store | `case_id` + `evidence_type` | `alert_id` | `evidence_store_at = case_close_at` | one-to-many | Disposition narrative attached to case but not to alert | Workpaper retrieval ambiguity |

### 5.3 Stage-Level Correlation — Twelve AML Monitoring Stages

| Stage # | Stage Name | Source Record | StepExecution Name | Primary Join Key | Timestamp Field | Must Occur Before | Evidence Generated | Controls Affected | Correlation Risk |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Transaction / Behaviour Event Captured | CBS `TXN_LOG` / NPCI feed | STEP-AML-01 | `ucic` ∩ `account_id` ∩ `txn_id` | `txn_at` | Stage 2 | EVD-LOG | (input only) | CDC stream lag; replayed batch |
| 2 | AML Scenario Evaluation | AML engine `SCEN_RUN` | STEP-AML-02 | `txn_id` + `scenario_id` | `scenario_run_at` | Stage 3 | EVD-LOG | CTRL-AML-004 | Scenario coverage gap (CTRL-AML-004) |
| 3 | Alert Generated | AML engine `ALERT_HDR` | STEP-AML-03 | `alert_id` | `alert_generated_at` | Stage 4 | EVD-LOG | CTRL-AML-005 (mule subset) | Duplicate `alert_id` on failover replay |
| 4 | L1 Triage (BPO / captive) | Case mgmt `L1_ACTION` | STEP-AML-04 | `alert_id` ↔ `case_id` | `l1_started_at` | Stage 5 | EVD-LOG | CTRL-AML-002 | BPO ticket mis-key (Rule 5) |
| 5 | L1 Disposition Recorded | Case mgmt `L1_ACTION` | STEP-AML-04b | `alert_id` | `l1_disposed_at` | Stage 6 | EVD-LOG, EVD-DOC (narrative) | CTRL-AML-002 | Narrative template-only; closure event missing |
| 6 | L1 SLA Check | Platform-derived | STEP-AML-04c | `alert_id` | derived | Stage 7 (if escalated) | EVD-LOG | CTRL-AML-002 | Clock drift between AML engine and case mgmt |
| 7 | L2 Escalation | Case mgmt `L2_ACTION` | STEP-AML-05 | `alert_id` ↔ `case_id` | `l2_assigned_at` | Stage 8 | EVD-LOG | CTRL-AML-003 (gating) | L2 routing rules wrong; alerts pile in queue |
| 8 | L2 / L3 Investigation | Case mgmt | STEP-AML-06 | `case_id` | `investigation_at` | Stage 9 | EVD-DOC, EVD-CALL (interviews) | CTRL-AML-003 | Investigation evidence stored outside case mgmt |
| 9 | Sanctions / UAPA Hit Review | Sanctions / UAPA logs | STEP-AML-06b | `case_id` ∩ `screening_run_id` | `hit_review_at` | Stage 10 / freeze | EVD-LOG | CTRL-AML-001 | Hit cleared but no reviewer attestation |
| 10 | STR Determination (suspicion conclusion) | Case mgmt `STR_DRAFT` | STEP-AML-07 | `case_id` | `suspicion_concluded_at` | Stage 11 | EVD-ATTEST (Principal Officer) | CTRL-AML-003 | Suspicion timestamp not captured (BPO L1 vs PO conflict) |
| 11 | STR Filing to FIU-IND | FIU-IND FINnet 2.0 | STEP-AML-07b | `case_id` ↔ `str_ref` | `str_filed_at` | Stage 12 | EVD-LOG (submission), EVD-DOC (STR XML) | **CTRL-AML-003** | FINnet 2.0 endpoint downtime; envelope rejected |
| 12 | FIU-IND Acknowledgement Received and Evidence Stored | FIU-IND `STR_ACK` | STEP-AML-08 | `str_ref` | `ack_received_at` | Closure | EVD-LOG (ack) | CTRL-AML-003 | Ack lost in batch; CTR-STR linkage missed |

### 5.4 ControlInstance Generation Logic — CTRL-AML-001 to CTRL-AML-005

| Control ID | Trigger Condition | Expected-to-Fire Population | Required Source Records | Evidence Required | Pass Logic | Fail Logic | Data Gap Logic | Evidence Gap Logic |
|---|---|---|---|---|---|---|---|---|
| **CTRL-AML-001** Sanctions / UAPA daily screening | Each transaction event AND each daily UAPA cycle for all accounts/counterparties | All accounts × all counterparties × all calendar days; all transactions for forward-screening | `TXN_LOG`, `SCR_RUN`, `UAPA_RUN`, sanctions list metadata | EVD-LOG (run + result + list_version) | `screening_run_at ≥ txn_at` AND `list_version ≤ 24h old at run` AND `result ∈ {no_hit, hit_cleared}` | Hit not cleared; OR run missed; OR list > 24h | UAPA run row missing for the day | Pass logic met but `list_version_at` not stamped on row |
| **CTRL-AML-002** AML L1 alert triage within SLA (BPO SLA; 5 BD) | Each alert generated | All alerts in window | `ALERT_HDR`, `L1_ACTION` | EVD-LOG (case mgmt) | `l1_disposed_at − alert_generated_at ≤ 5 BD` AND disposition narrative present | `l1_disposed_at − alert_generated_at > 5 BD` OR narrative absent | `L1_ACTION` row not joinable to alert (BPO ticket mis-key) | Disposed in time but `EVD-DOC` (narrative) missing |
| **CTRL-AML-003** STR filing within 7 working days of suspicion conclusion (PMLA s.12(1)(b); OBL-PMLA-003) | `suspicion_concluded_at` set on any case | All cases reaching suspicion conclusion in window | `STR_DRAFT`, `STR_SUBMIT` (FINnet 2.0), `STR_ACK` | EVD-DOC (STR XML), EVD-LOG (submission), EVD-LOG (ack) | `str_filed_at ≤ suspicion_concluded_at + 7 working days` AND `str_ack_id IS NOT NULL` | Filed late OR not filed OR ack absent | `suspicion_concluded_at` not captured (Principal Officer event missing) | Filed in time but FIU-IND ack not retrieved |
| **CTRL-AML-004** AML scenario library coverage — all mandatory scenarios per FIU-IND guidance and RBI FRM MD 15-Jul-2024 (`OBL-PMLA-004`, `OBL-RBI-031`) | Annual + on product launch | Bank-wide (one denominator per cycle) | `SCENARIO`, coverage matrix attestation | EVD-DOC (matrix), EVD-ATTEST (CCO + Head of FCC) | All mandatory scenarios active; matrix valid for current product / channel set | Coverage gap exists; matrix stale | Matrix not joined to active product list (HRMS / product master integration gap) | Matrix exists but no signature / hash |
| **CTRL-AML-005** UPI mule / rapid-funnel-out pattern detection — AI-001 signal linkage | Continuous (UPI ControlInstance stream); AI-001 inference event | All UPI-active UCICs in window | NPCI UPI feed, `ALERT_HDR`, AI-001 insight nodes, `SUBJECT_GRAPH` | EVD-LOG (NPCI), EVD-LOG (AI-001 insight with provenance) | AI-001 insight produced AND linked to a generated alert AND alert routed to case mgmt | AI-001 insight produced but not linked to alert (event bus drop) | NPCI UPI feedback feed lag; VA-to-UCIC join missing | Insight linked but model_version / training_data_id not recorded |

### 5.5 Correlation Example Using Sample Data — AML-ALRT-2024-00501, 00502, 00505

#### AML-ALRT-2024-00501 — L1 disposed, STR drafted, case management linked

**Part A — Source Records Joined**

| Source Table | Record ID | Key Fields Used | Join Status |
|---|---|---|---|
| AML engine `ALERT_HDR` | AML-ALRT-2024-00501 | `alert_id` | Joined |
| AML engine `SCEN_RUN` | SCEN-S-RAPID-FUNNEL-2024-11-04 | `scenario_id=S-RAPID-FUNNEL`, `version=v3.2` | Joined |
| CBS `TXN_LOG` (5 transactions feeding alert) | TXN-2024-11-03-{...} | `ucic` ∩ `account_id` | Joined |
| Case mgmt `CASE` | CASE-2024-11-04-3318 | `alert_id` | Joined |
| Case mgmt `L1_ACTION` | L1-2024-11-05-... | `alert_id`, `disposition=escalated` | Joined |
| Case mgmt `L2_ACTION` | L2-2024-11-06-... | `case_id` | Joined |
| Case mgmt `STR_DRAFT` | STR-DRAFT-2024-11-08-... | `case_id` | Joined |
| FIU-IND FINnet 2.0 outbound | STR-REF-FIU-2024-11-09-... | `str_ref` | Joined |
| FIU-IND `STR_ACK` | STR-ACK-FIU-2024-11-09-... | `str_ref` | Joined |
| Sanctions `SCR_RUN` (counterparty screening) | FIR-RUN-2024-11-04-... | `ucic` ∩ counterparties | Joined |

**Part B — ProcessExecution Created**

| Field | Value |
|---|---|
| `pe_id` | PE-PROC-AML-001-2024-11-04T07-15Z-AML-ALRT-2024-00501 |
| `alert_id` | AML-ALRT-2024-00501 |
| `ucic` | (sample subject) UCIC-2023-09921 |
| `account_id` | SB-FNCL-1100099821 |
| `alert_generated_at` | 2024-11-04T07:15Z |
| `scenario_id` / version | S-RAPID-FUNNEL / v3.2 |
| `triage_level` | L2 (after escalation) |
| `l1_disposition` | escalated |
| `l1_disposed_at` | 2024-11-05T13:42Z (T+1.3 BD; within 5 BD SLA) |
| `l1_sla_breach_flag` | FALSE |
| `l2_review_status` | concluded_str_required |
| `l2_reviewed_at` | 2024-11-06T11:00Z |
| `str_required_flag` | TRUE |
| `suspicion_concluded_at` | 2024-11-07T15:30Z (Principal Officer attestation) |
| `str_drafted_at` | 2024-11-08T10:00Z |
| `str_filed_at` | 2024-11-09T16:42Z (T+1.05 working days from conclusion; well within 7 BD) |
| `str_ack_id` | STR-ACK-FIU-2024-11-09-7762 |
| `str_filed_within_sla_flag` | TRUE |
| `case_id` | CASE-2024-11-04-3318 |
| `case_closed_at` | 2024-11-10T18:00Z |
| `process_status` | str_filed → case_closed |

**Part C — StepExecutions Created**

| Step # | StepExecution Name | Status | Timestamp | BPO/Branch/System | Notes |
|---|---|---|---|---|---|
| 1 | STEP-AML-01 | completed | 2024-11-03 (txn window) | system (CBS) | 5 transactions captured |
| 2 | STEP-AML-02 | completed | 2024-11-04T07:14Z | system (AML engine) | scenario fired |
| 3 | STEP-AML-03 | completed | 2024-11-04T07:15Z | system | alert generated |
| 4 | STEP-AML-04 | completed | 2024-11-05T08:20Z | bpo_l1 | triage started |
| 5 | STEP-AML-04b | completed | 2024-11-05T13:42Z | bpo_l1 | escalated |
| 6 | STEP-AML-04c | completed (PASS) | 2024-11-05T13:43Z | system | SLA pass |
| 7 | STEP-AML-05 | completed | 2024-11-05T14:00Z | central_ops | L2 assigned |
| 8 | STEP-AML-06 | completed | 2024-11-06T11:00Z | central_ops | investigation |
| 9 | STEP-AML-06b | completed | 2024-11-06T15:00Z | system + analyst | sanctions hit_cleared |
| 10 | STEP-AML-07 | completed | 2024-11-07T15:30Z | bsa_officer | suspicion concluded |
| 11 | STEP-AML-07b | completed | 2024-11-09T16:42Z | system (FINnet 2.0) | STR filed |
| 12 | STEP-AML-08 | completed | 2024-11-09T17:10Z | system | ack received |

**Part D — ControlInstances Created**

| Control ID | Outcome | Reason | Evidence Linked? | OBL-ID Affected | Reporting-Clock Status |
|---|---|---|---|---|---|
| CTRL-AML-001 | Pass | Sanctions hits reviewed and cleared; UAPA daily run intact | Y | OBL-RBI-050 | n/a |
| CTRL-AML-002 | Pass | L1 disposed at T+1.3 BD (within 5 BD SLA) | Y (EVD-LOG) | OBL-PMLA-001 | within SLA |
| CTRL-AML-003 | Pass | STR filed at T+1.05 working days from suspicion conclusion (well within 7 BD) | Y (EVD-DOC STR XML, EVD-LOG submission, EVD-LOG ack) | OBL-PMLA-003 | within statutory window |
| CTRL-AML-004 | Pass | Scenario S-RAPID-FUNNEL active in current matrix | Y (matrix attestation) | OBL-PMLA-004 | n/a |

**Part E — Final Conclusion.** Clean STR cycle. PERSONA-002 (MLRO / Principal Officer) sees: alert → escalation → suspicion conclusion → STR filed within statutory window → FIU-IND ack received and archived. Concurrent auditor (PERSONA-003) marks AML-ALRT-2024-00501 as a positive workpaper sample for `OBL-PMLA-003` evidence.

#### AML-ALRT-2024-00502 — L1 overdue > 7 working days, SLA breach

**Part A — Source Records Joined**

| Source Table | Record ID | Key Fields Used | Join Status |
|---|---|---|---|
| AML engine `ALERT_HDR` | AML-ALRT-2024-00502 | `alert_id` | Joined |
| AML engine `SCEN_RUN` | SCEN-S-STRUCTURING-2024-11-08 | `scenario_id=S-STRUCTURING` | Joined |
| CBS `TXN_LOG` | TXN-2024-11-{05..07}-{...} | `ucic` ∩ `account_id` | Joined |
| Case mgmt `CASE` | CASE-2024-11-08-3411 | `alert_id` | Joined |
| Case mgmt `L1_ACTION` | (no row in window) | — | **Missing** — L1 not yet disposed; aged 9 BD |
| BPO platform `KYC_TICKET` (proxy for AML_TICKET) | BPO-AML-2024-11-08-2891 | open, no closure event | Joined (open) |
| Case mgmt `L2_ACTION` | (none) | — | not applicable yet |
| FIU-IND outbound | (none) | — | not applicable yet |

**Part B — ProcessExecution Created**

| Field | Value |
|---|---|
| `pe_id` | PE-PROC-AML-001-2024-11-08T11-30Z-AML-ALRT-2024-00502 |
| `alert_id` | AML-ALRT-2024-00502 |
| `alert_generated_at` | 2024-11-08T11:30Z |
| `scenario_id` | S-STRUCTURING |
| `triage_level` | L1 (stuck) |
| `l1_disposition` | pending |
| `l1_disposed_at` | NULL |
| `l1_sla_breach_flag` | **TRUE** (current age T+9 BD; > 5 BD SLA; > 7 BD AML alert escalation threshold) |
| `process_status` | l1_overdue |
| `closure_event_timestamp` | NULL (open) |

**Part C — StepExecutions Created**

| Step # | StepExecution Name | Status | Timestamp | BPO/Branch/System | Notes |
|---|---|---|---|---|---|
| 1 | STEP-AML-01 | completed | 2024-11-{05..07} | system | 11 structuring-pattern txns |
| 2 | STEP-AML-02 | completed | 2024-11-08T11:29Z | system | scenario fired |
| 3 | STEP-AML-03 | completed | 2024-11-08T11:30Z | system | alert generated |
| 4 | STEP-AML-04 | started_not_completed | 2024-11-09T09:30Z | bpo_l1 | BPO L1 picked up but no disposition recorded for 9 BD |
| 5 | STEP-AML-04b | NOT_FIRED | — | — | — |
| 6 | STEP-AML-04c | **FAILED (SLA breach)** | derived 2024-11-15 | system | T+5 BD passed without disposition |
| 7–12 | (downstream) | NOT_FIRED | — | — | Process stuck at L1 |

**Part D — ControlInstances Created**

| Control ID | Outcome | Reason | Evidence Linked? | OBL-ID Affected | Reporting-Clock Status |
|---|---|---|---|---|---|
| CTRL-AML-001 | Pass | Sanctions screening on transactions clean | Y | OBL-RBI-050 | n/a |
| **CTRL-AML-002** | **Fail** | L1 disposition aged 9 BD; SLA breach (5 BD); BPO ticket open with no closure event | Partial — BPO ticket exists but no `L1_ACTION` record | OBL-PMLA-001 | **Within SLA window? No.** Alert is at risk of becoming an STR with the suspicion-conclusion clock not yet started — meaning if structuring is confirmed, the eventual STR may already have a defective Operating-Rate. |
| CTRL-AML-003 | n/a (not yet triggered) | `suspicion_concluded_at` not set | n/a | OBL-PMLA-003 | **At-risk** — if alert escalates and PO concludes suspicion at, e.g., T+12 BD from generation, the STR window remains 7 working days from suspicion conclusion (not from alert generation), so SLA *technically* still satisfiable. But the upstream L1 SLA fail is itself an `OBL-PMLA-001` exposure. |

**Part E — Final Conclusion.** AML-ALRT-2024-00502 is the SLA-breach archetype. PERSONA-002 (MLRO and Head of FC) sees the L1 SLA breach surface immediately on the AML alert ageing dashboard; the BPO floor (VEND-2024-00203) is the responsible operator. PERSONA-001 (CRO) sees the cluster (if multiple alerts age similarly) on the residual-risk dashboard with HSBC India Feb-2025-style PMLA s.13 risk indicator. PERSONA-003 (concurrent auditor) flags this as ISS-2026-009-equivalent (CTRL-AML-002 issue cluster) with population-test scope = all open L1 alerts > 5 BD.

#### AML-ALRT-2024-00505 — UPI mule pattern, AI-001 signal, network cluster flagged

**Part A — Source Records Joined**

| Source Table | Record ID | Key Fields Used | Join Status |
|---|---|---|---|
| AML engine `ALERT_HDR` | AML-ALRT-2024-00505 | `alert_id` | Joined |
| AML engine `SCEN_RUN` | SCEN-S-MULE-NETWORK-2024-12-02 | `scenario_id=S-MULE-NETWORK`, `version=v2.1` | Joined |
| NPCI UPI feed | NPCI-UPI-FEED-2024-12-{01..02} | `va` ↔ `ucic` (subject map) | Joined |
| NPCI UPI fraud feedback | NPCI-FRAUD-FB-2024-12-04-... | `va` ∩ `mobile_hash` | Joined |
| Subject graph (UCIC ↔ counterparty network) | SUBGRAPH-2024-12-02-... | `ucic` × counterparty | Joined |
| AI-001 insight node | AI-INS-2024-12-02-AI001-9921 | `ai_insight_id` ↔ `alert_id` | Joined |
| Case mgmt `CASE` | CASE-2024-12-02-3501 | `alert_id` | Joined |
| Case mgmt `L1_ACTION` / `L2_ACTION` | (in progress; L1 done, L2 underway) | `case_id` | Joined |

**Part B — ProcessExecution Created**

| Field | Value |
|---|---|
| `pe_id` | PE-PROC-AML-001-2024-12-02T05-12Z-AML-ALRT-2024-00505 |
| `alert_id` | AML-ALRT-2024-00505 |
| `scenario_id` / version | S-MULE-NETWORK / v2.1 |
| `triage_level` | L2 (escalated) |
| `l1_disposition` | escalated |
| `l1_disposed_at` | 2024-12-02T19:42Z (T+0.6 BD; well within SLA) |
| `l2_review_status` | in_progress |
| `ai_signal_id` | AI-INS-2024-12-02-AI001-9921 (AI-001) |
| `confidence_score` | 0.93 (above τ_action 0.92 for AI-001) |
| `process_status` | l2_review |

**Part C — StepExecutions Created**

| Step # | StepExecution Name | Status | Timestamp | BPO/Branch/System | Notes |
|---|---|---|---|---|---|
| 1 | STEP-AML-01 | completed | 2024-12-{01..02} | system (NPCI feed) | UPI funnel-out pattern |
| 2 | STEP-AML-02 | completed | 2024-12-02T05:11Z | system | scenario + AI-001 |
| 3 | STEP-AML-03 | completed | 2024-12-02T05:12Z | system | alert generated |
| 4 | STEP-AML-04 | completed | 2024-12-02T19:42Z | bpo_l1 | escalated within SLA |
| 5 | STEP-AML-05 | completed | 2024-12-03T09:00Z | central_ops | L2 assigned |
| 6 | STEP-AML-06 | in_progress | (ongoing) | central_ops | network expansion underway |

**Part D — ControlInstances Created**

| Control ID | Outcome | Reason | Evidence Linked? | OBL-ID Affected | Reporting-Clock Status |
|---|---|---|---|---|---|
| CTRL-AML-001 | Pass | Sanctions clean | Y | OBL-RBI-050 | n/a |
| CTRL-AML-002 | Pass | L1 SLA passed | Y | OBL-PMLA-001 | within SLA |
| **CTRL-AML-005** | **Pass (with action)** | AI-001 mule-network insight produced (confidence 0.93) and **linked** to `alert_id` and `case_id` | Y (EVD-LOG NPCI, EVD-LOG AI-001 insight with model_version v2.1, training_data_snapshot_id pinned) | OBL-RBI-031 (EWS), OBL-PMLA-001 | n/a; AI-001 ↔ Issue ISS-2026-061* cluster |

**Part E — Final Conclusion.** AML-ALRT-2024-00505 is the AI-001-driven detection archetype. PERSONA-002 (MLRO / Head of FC) sees the AI-001 insight surface on the AML workspace with full provenance (model version, training-data snapshot, feature attributions). The mule network is being expanded by L2; STR clock has not yet started. This is the positive case where the platform's AI signal correlates correctly to the alert and case, contributing positively to CTRL-AML-005 Catch Rate.

---

## 6. Digital Lending / Loan Origination — Correlation Model

### 6.1 Master Process Entity — DigitalLendingExecution (PROC-LND-001)

| Field | Source System / Table | Role | Required? | Notes |
|---|---|---|---|---|
| `loan_application_id` | LOS (Newgen / Lentra) `APP_HDR.APP_ID` | Process anchor key | **Yes** | Single anchor across LOS / bureaus / CBS / CIMS |
| `ucic` | LOS `APP_HDR.UCIC` (looked up from CBS) | Linked subject | Yes | Required for KYC linkage |
| `account_id` | CBS `LOAN_MAST.ACCT_NO` | Linked entity | Conditional | Set post-booking |
| `product_type` | LOS `APP_HDR.PRODUCT` ∈ {personal, MSME, co-lending, DLA-originated} | Process attribute | Yes | Drives policy + CIMS |
| `lsa_name` | LOS `APP_HDR.LSP_NAME` | Process attribute | Conditional | Required for DLA-originated |
| `bureau_pull_id` | Bureau API response `BUREAU_PULL.PULL_ID` | Evidence anchor | Yes | One per bureau |
| `bureau_pull_at` | Bureau response `BUREAU_PULL.TS` | Timestamp | Yes | ≤90d before sanction |
| `credit_score` | Bureau aggregate | Process attribute | Yes | All four bureau scores |
| `income_verification_method` | LOS `INC_VERIFY.METHOD` ∈ {AA, GST, ITR, self-declared} | Process attribute | Yes | AA preferred per OBL-RBI-029 |
| `aa_consent_id` | AA platform `CONSENT_ID` | Evidence anchor | Conditional | Required if AA |
| `aa_consent_freshness_flag` | Platform-derived | Compliance flag | Conditional | TRUE if consent within validity window |
| `policy_decision` | Policy engine `POLICY_DECISION` ∈ {approve, decline, refer} | Process state | Yes | Drives next stage |
| `exception_required_flag` | Policy engine | Process flag | Conditional | If policy_decision=refer |
| `underwriter_id` | LOS `UW_REVIEW.UW_ID` | Accountability anchor | Conditional | If manual review |
| `approver_id` | LOS `APPROVAL.APPROVER_ID` | Accountability anchor | Yes | Senior approver per delegation matrix |
| `kfs_hash` | LOS `KFS_DOC.HASH` | Evidence anchor | Yes | SHA-256 of digitally-signed KFS PDF |
| `kfs_issued_at` | LOS event-stream `KFS_ISSUED_EVT.TS` | Timestamp | Yes | **Must be < `borrower_acceptance_at`** (OBL-RBI-022) |
| `borrower_acceptance_at` | LOS event-stream `BORR_ACCEPT_EVT.TS` | Timestamp | Yes | E-sign / DigiLocker |
| `kfs_timing_valid_flag` | Platform-derived | Compliance flag | Yes | TRUE if `kfs_issued_at < borrower_acceptance_at`; AI-013 fires on FALSE |
| `apr_computed_flag` | LOS `APR_DETAIL.COMPUTED` | Compliance flag | Yes | All components (rate, fees, charges, insurance) included |
| `apr_completeness_flag` | LOS `APR_DETAIL.COMPLETE` | Compliance flag | Yes | Bajaj Finance Nov-2023 archetype |
| `cooling_off_period_flag` | LOS `COOLING_OFF.APPLICABLE` | Compliance flag | Conditional | DL Directions 2025 Para — 1d / 3d |
| `cooling_off_actioned_flag` | LOS `COOLING_OFF.ACTIONED` | Compliance flag | Conditional | If borrower opts out |
| `dlg_cap_flag` | Co-lending engine `DLG.CAP_USED_PCT` | Compliance flag | Conditional | ≤5% per OBL-RBI-026 |
| `cims_reportable_flag` | Platform-derived (per OBL-RBI-025) | Compliance flag | Yes | TRUE for all DLA loans + adverse-action cases |
| `cims_submitted_flag` | CIMS portal `CIMS_SUBMIT` | Compliance flag | Conditional | Quarterly cycle |
| `cims_submission_at` | CIMS `CIMS_SUBMIT.TS` | Timestamp | Conditional | Within quarterly window |
| `adverse_action_sent_flag` | LOS `ADV_ACTION_SENT` | Compliance flag | Conditional | For declines |
| `adverse_action_sent_at` | LOS `ADV_ACTION_SENT.TS` | Timestamp | Conditional | — |
| `loan_id` | CBS `LOAN_MAST.LOAN_ID` | Linked entity | Conditional | Post-booking |
| `booking_status` | CBS `LOAN_MAST.STATUS` | Process state | Yes | active / declined / closed |
| `process_status` | Platform-derived | State | Yes | Enumeration below |
| `closure_event_timestamp` | Platform-derived | State | Yes | Set at terminal status |

**`process_status` enumeration:** `submitted` | `bureau_pulled` | `policy_evaluated` | `underwriting` | `approved` | `declined` | `booked` | `adverse_action_sent` | `cims_reported` | `failed_control` | `data_gap`.

### 6.2 Cross-System Join Map — PROC-LND-001

| From System / Table | To System / Table | Primary Join Key | Backup Join Key | Timestamp Rule | Expected Cardinality | Common Breakage | Audit Impact |
|---|---|---|---|---|---|---|---|
| LOS `APP_HDR` | CBS `CUST_MAST` | `ucic` | `pan_hash` ∩ `mobile_hash` | `kyc_active = TRUE` at `app_received_at` | many-to-one | UCIC look-up returns multiple matches (Rule 1 violation) | KYC-Lending linkage broken; AI-014 risk |
| LOS `APP_HDR` | Bureau API `BUREAU_PULL` | `loan_application_id` ↔ `bureau_request_id` | `pan_hash` | **`bureau_pull_at ≤ loan_sanctioned_at`** AND **`bureau_pull_at ≥ loan_sanctioned_at − 90d`** | one-to-many (one per bureau) | Bureau API timeout; pull retried with new `request_id` not joined to original `app_id` | CTRL-LND-001 fail / data-gap |
| LOS `APP_HDR` | Account Aggregator (AA) consent + statement | `loan_application_id` ↔ `aa_consent_id` | `mobile_hash` | `aa_consent_at ≤ statement_fetch_at`; `consent_validity_window` honoured | one-to-one | Consent expired; refetch without re-consent | OBL-RBI-029 breach; data-gap |
| LOS `APP_HDR` | GSTN / IT income verification | `loan_application_id` ∩ `gstin_hash` | `pan_hash` | `verification_at ≤ policy_decision_at` | one-to-one | GSTN endpoint downtime; ITR portal scrape fails | CTRL-LND-003 evidence-gap |
| LOS `POLICY_DECISION` | LOS `UW_REVIEW` | `loan_application_id` | n/a | `policy_decision_at ≤ uw_review_at` | one-to-one (manual cases) | UW review without policy decision input (manual override) | CTRL-LND-003 fail |
| LOS event-stream `KFS_ISSUED_EVT` | LOS event-stream `BORR_ACCEPT_EVT` (e-sign / DigiLocker) | `loan_application_id` + `kfs_hash` | n/a | **`kfs_issued_at < borrower_acceptance_at` (OBL-RBI-022; AI-013 on violation)** | one-to-one | LOS system clock drift (Failure type #5); DSA channel races KFS after acceptance | **CTRL-LND-002 fail; AI-013 fires** |
| LOS `BORR_ACCEPT_EVT` | DigiLocker / NSDL e-sign | `loan_application_id` ↔ `e_sign_ref` | n/a | `e_sign_at = borrower_acceptance_at` (within seconds) | one-to-one | E-sign service timeout; ack lost | EVD-SIGN missing |
| CIMS DLA register | LOS `APP_HDR` | `loan_application_id` | `lsa_name` ∩ `quarter` | **`cims_submission_at` within quarterly CIMS window (per OBL-RBI-025; eff. 15-Jun-2025)** with CCO certification | many-to-one (batch) | Quarterly cycle missed; partial submission | OBL-RBI-025 breach |
| LOS `APP_HDR` | CBS `LOAN_MAST` (booking event) | `loan_application_id` ↔ `loan_id` | `ucic` | `booking_at > approval_at` | one-to-one | Booking fails silently; LOS shows approved but CBS has no loan | Process-status ambiguity; data-gap |
| LOS adverse-action queue | Adverse-action notice channel (SMS / email) | `loan_application_id` | `mobile_hash` | `adverse_action_sent_at ≤ policy_decision_at + 30d` | one-to-one | SMS bounce; email un-deliverable | OBL-RBI-024 breach (DL-APP-2024-00885 case) |

### 6.3 Stage-Level Correlation — Fifteen Digital Lending Stages

| Stage # | Stage Name | Source Record | StepExecution Name | Primary Join Key | Timestamp Field | Must Occur Before | Evidence Generated | Controls Affected | Correlation Risk |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Loan Application Received | LOS `APP_HDR` | STEP-LND-01 | `loan_application_id` | `app_received_at` | Stage 2 | EVD-LOG | (input) | Channel mis-tagging (DLA vs branch) |
| 2 | Borrower Profile Created / KYC Verified | LOS ↔ CBS join | STEP-LND-02 | `loan_application_id` ↔ `ucic` | `kyc_check_at` | Stage 3 | EVD-LOG | CTRL-LND-001 (gating) | UCIC look-up multi-match |
| 3 | AA Consent Obtained and Statement Fetched | AA platform | STEP-LND-02b | `loan_application_id` ↔ `aa_consent_id` | `aa_consent_at` | Stage 5 | EVD-LOG, EVD-DOC (statement) | OBL-RBI-029 | Consent expired silently |
| 4 | Bureau Pull (4-bureau) | Bureau APIs | STEP-LND-03 | `loan_application_id` ↔ `bureau_request_id` | `bureau_pull_at` | Stage 6 | EVD-LOG | CTRL-LND-001 | Less than 4 bureaus pulled (cost-cutting) |
| 5 | Income / Financial Verification | AA / GSTN / ITR | STEP-LND-04 | `loan_application_id` | `verification_at` | Stage 6 | EVD-DOC | CTRL-LND-001, CTRL-LND-003 | GSTN endpoint downtime |
| 6 | Policy Engine Evaluation | LOS / policy engine | STEP-LND-05 | `loan_application_id` | `policy_decision_at` | Stage 7 / 12 | EVD-LOG | CTRL-LND-003 | Policy version mismatch |
| 7 | Underwriter Review | LOS `UW_REVIEW` | STEP-LND-05b | `loan_application_id` | `uw_review_at` | Stage 8 / 12 | EVD-LOG, EVD-ATTEST | CTRL-LND-003 | Manual override without coded rationale |
| 8 | Policy Exception Identified | LOS `EXCEPTION` | STEP-LND-05c | `loan_application_id` | `exception_at` | Stage 12 | EVD-LOG, EVD-ATTEST (4-eye) | CTRL-LND-003 | 4-eye not enforced; rubber-stamp |
| 9 | KFS Generated and Issued (pre-acceptance) | LOS `KFS_ISSUED_EVT` | STEP-LND-06 | `loan_application_id` ↔ `kfs_hash` | `kfs_issued_at` | **Stage 10 (must precede)** | EVD-DOC (KFS PDF), EVD-LOG | **CTRL-LND-002** | LOS clock drift; DSA channel races (AI-013) |
| 10 | Borrower Acceptance Captured | LOS `BORR_ACCEPT_EVT` (e-sign / DigiLocker) | STEP-LND-06b | `loan_application_id` ↔ `e_sign_ref` | `borrower_acceptance_at` | Stage 11 | EVD-SIGN, EVD-LOG | CTRL-LND-002 | E-sign ack lost |
| 11 | Cooling-Off Period and Opt-Out | LOS `COOLING_OFF` | STEP-LND-06c | `loan_application_id` | `cooling_off_window_at` | Stage 12 | EVD-LOG | CTRL-LND-002 (extended) | Opt-out not actioned |
| 12 | Approval Authority Check and Sanction | LOS `APPROVAL` | STEP-LND-07 | `loan_application_id` ↔ `approver_id` | `approval_at` | Stage 13 | EVD-ATTEST | CTRL-LND-003 | Delegation matrix exception |
| 13 | Disbursement (CBS booking) | CBS `LOAN_MAST` event | STEP-LND-08 | `loan_application_id` ↔ `loan_id` | `booking_at` | Stage 14 | EVD-LOG | CTRL-LND-004 | Booking fails silently |
| 14 | CIMS DLA Registration / Quarterly Reporting | CIMS portal | STEP-LND-09 | `loan_application_id` ∩ `quarter` | `cims_submission_at` | Closure | EVD-LOG, EVD-ATTEST (CCO) | **CTRL-LND-005** | Quarterly cycle missed |
| 15 | Adverse Action Notice Sent (declines) | SMS / email | STEP-LND-10 | `loan_application_id` ↔ `mobile_hash` | `adverse_action_sent_at` | Closure (declined) | EVD-LOG | CTRL-LND-005 | SMS bounce; OBL-RBI-024 breach |

### 6.4 ControlInstance Generation Logic — CTRL-LND-001 to CTRL-LND-005

| Control ID | Trigger Condition | Expected-to-Fire Population | Required Source Records | Evidence Required | Pass Logic | Fail Logic | Data Gap Logic | Evidence Gap Logic |
|---|---|---|---|---|---|---|---|---|
| **CTRL-LND-001** Bureau pull freshness and four-bureau coverage (`OBL-RBI-038`) | Each loan application reaching policy decision | All loan applications above bureau threshold in window | `APP_HDR`, `BUREAU_PULL` (4 rows expected) | EVD-LOG (4 bureau pulls with response payload) | All 4 bureau pulls present AND all `pull_at ≤ sanction_at` AND all `pull_at ≥ sanction_at − 90d` | Less than 4 bureaus OR any pull > 90d stale OR pull after sanction | Bureau API response not joinable to `app_id` (request_id mismatch) | All 4 pulls present but response payload truncated |
| **CTRL-LND-002** KFS issued before borrower acceptance (`OBL-RBI-022`; AI-013) | Each `BORR_ACCEPT_EVT` for any loan | All loans where KFS is mandatory (DLA + non-DLA digital + branch digital) | `KFS_ISSUED_EVT`, `BORR_ACCEPT_EVT`, `KFS_DOC` | EVD-DOC (KFS PDF + hash), EVD-SIGN (e-sign), EVD-LOG (issuance event) | `kfs_issued_at < borrower_acceptance_at` AND `kfs_hash` verifiable AND `apr_completeness_flag=TRUE` | `kfs_issued_at ≥ borrower_acceptance_at` (AI-013 fires) OR KFS not issued OR APR incomplete | LOS event-stream missing one or both events (Kafka drop) | Pass logic met but `kfs_hash` not stored in evidence repo |
| **CTRL-LND-003** APR disclosure completeness (`OBL-RBI-022 / OBL-RBI-027`; Bajaj Finance archetype) | Each KFS issuance event | All KFS issuances in window | `KFS_DOC`, `APR_DETAIL` | EVD-DOC (KFS PDF parsed APR table) | All APR components (interest rate, processing fee, insurance premium, penal charges, GST, embedded) present and itemised | Any component missing or aggregated as "other charges" | KFS PDF unparseable (image-only) | KFS exists but APR breakdown stored only in legacy CRM, not parseable |
| **CTRL-LND-004** EWS-to-CBS IRACP propagation within SLA (`OBL-RBI-038`) | EWS signal generated on any loan account | All EWS signals in window | EWS engine output, CBS `IRACP_TAG` event | EVD-LOG (EWS event), EVD-LOG (CBS IRACP event) | `cbs_iracp_tag_at − ews_signal_at ≤ 2 days` AND tag matches signal severity | `cbs_iracp_tag_at − ews_signal_at > 2 days` OR no tag (manual override pattern; AI-017) | EWS signal not joinable to CBS account (account_id drift) | Pass logic met but EWS event payload not archived |
| **CTRL-LND-005** CIMS DLA registration and quarterly submission (`OBL-RBI-025`) | Quarter-end `cims_reportable_flag=TRUE` for any loan | All `cims_reportable_flag=TRUE` loans for the quarter | `APP_HDR` with flag, CIMS `CIMS_SUBMIT` row | EVD-LOG (CIMS submit), EVD-ATTEST (CCO certification) | All flagged loans appear in CIMS submission for the quarter AND CCO certification archived | Loans missing from CIMS submission OR CCO certification absent | CIMS portal endpoint timeout; partial batch | Submission complete but CCO certification missing from evidence repo |

### 6.5 Correlation Example Using Sample Data — DL-APP-2024-00881 / 00882 / 00884 / 00885

#### DL-APP-2024-00881 — Personal loan via DLA, KFS issued, disbursed

**Part A — Source Records Joined**

| Source Table | Record ID | Key Fields Used | Join Status |
|---|---|---|---|
| LOS `APP_HDR` | DL-APP-2024-00881 | `loan_application_id` | Joined |
| CBS `CUST_MAST` | UCIC-2023-44521 | `ucic` ↔ `loan_application_id` | Joined |
| Bureau APIs (CIBIL / CRIF / Experian / Equifax) | BUR-{CIB,CRF,EXP,EQF}-2024-12-10-... | 4 `bureau_request_id` rows | Joined (all 4) |
| AA platform | AA-CONS-2024-12-10-7821 | `aa_consent_id` | Joined |
| LOS `KFS_DOC` | KFS-DOC-DL-2024-00881 | `kfs_hash=0xa3f9...` | Joined |
| LOS `KFS_ISSUED_EVT` | KFS-EVT-2024-12-11T09:30Z | `kfs_issued_at` | Joined |
| LOS `BORR_ACCEPT_EVT` | BACC-EVT-2024-12-11T09:42Z | `e_sign_ref` | Joined |
| CBS `LOAN_MAST` | LOAN-FNCL-DL-202200881 | `loan_id` | Joined |
| CIMS portal | CIMS-Q4-2024-... | `loan_application_id ∩ Q4-2024` | Joined |

**Part B — ProcessExecution Created**

| Field | Value |
|---|---|
| `pe_id` | PE-PROC-LND-001-2024-12-11T10-00Z-DL-APP-2024-00881 |
| `loan_application_id` | DL-APP-2024-00881 |
| `ucic` | UCIC-2023-44521 |
| `product_type` | personal |
| `lsa_name` | (DLA — bank-owned) |
| `bureau_pull_id` | BUR-{CIB,CRF,EXP,EQF}-...-... (4 rows) |
| `bureau_pull_at` | 2024-12-10T11:14Z |
| `credit_score` | 738 (CIBIL); 4-bureau aggregate computed |
| `income_verification_method` | AA |
| `aa_consent_id` | AA-CONS-2024-12-10-7821 |
| `aa_consent_freshness_flag` | TRUE |
| `policy_decision` | approve |
| `kfs_hash` | 0xa3f9... |
| `kfs_issued_at` | **2024-12-11T09:30Z** |
| `borrower_acceptance_at` | **2024-12-11T09:42Z** (12 min after KFS issuance) |
| `kfs_timing_valid_flag` | **TRUE** |
| `apr_completeness_flag` | TRUE |
| `cooling_off_period_flag` | TRUE (1d for short-tenor loan) |
| `cooling_off_actioned_flag` | FALSE (borrower did not opt out) |
| `cims_reportable_flag` | TRUE |
| `cims_submitted_flag` | TRUE |
| `cims_submission_at` | 2025-01-15 (Q4-2024 cycle) |
| `loan_id` | LOAN-FNCL-DL-202200881 |
| `booking_status` | active |
| `process_status` | booked → cims_reported |

**Part C — StepExecutions Created** (clean execution; all 15 stages completed in sequence; STEP-LND-10 not applicable — approved loan).

| Step # | StepExecution Name | Status | Timestamp | Notes |
|---|---|---|---|---|
| 1–13 | (per stage) | completed | 2024-12-10 to 2024-12-11 | KFS-acceptance gap = 12 min; well within OBL-RBI-022 |
| 14 | STEP-LND-09 | completed | 2025-01-15 | CIMS quarterly submission |
| 15 | STEP-LND-10 | n/a | — | Loan approved |

**Part D — ControlInstances Created**

| Control ID | Outcome | Reason | Evidence Linked? | OBL-ID Affected |
|---|---|---|---|---|
| CTRL-LND-001 | Pass | All 4 bureaus pulled, ≤90d stale, AA consent fresh | Y | OBL-RBI-038 |
| **CTRL-LND-002** | **Pass** | KFS issued 12 min before acceptance; hash verifiable; APR complete | Y (EVD-DOC, EVD-SIGN, EVD-LOG) | OBL-RBI-022, OBL-RBI-027 |
| CTRL-LND-003 | Pass | APR breakdown complete | Y | OBL-RBI-022 |
| CTRL-LND-004 | n/a | New loan; no EWS signal yet | n/a | OBL-RBI-038 |
| CTRL-LND-005 | Pass | CIMS Q4-2024 submission includes this loan; CCO certification archived | Y | OBL-RBI-025 |

**Part E — Final Conclusion.** Clean DLA disbursal; KFS-acceptance sequence intact; CIMS quarterly reporting attestable. PERSONA-003 (IA Manager) marks this as positive sample for `OBL-RBI-022 / OBL-RBI-025` workpaper.

#### DL-APP-2024-00882 — MSME, co-lending tranche, bureau pull done

**Part A — Source Records Joined**

| Source Table | Record ID | Key Fields Used | Join Status |
|---|---|---|---|
| LOS `APP_HDR` | DL-APP-2024-00882 | `loan_application_id`, `product_type=co-lending` | Joined |
| Co-lending engine | CL-2024-12-12-... | `loan_application_id`, `partner_nbfc_id` | Joined |
| Bureau APIs | BUR-...-2024-12-12 | 4 bureaus | Joined |
| GSTN | GSTN-2024-12-12-... | `gstin_hash` | Joined |
| LOS `KFS_DOC` / events | KFS-DOC-DL-2024-00882 | `kfs_hash`, sequence valid | Joined |
| CBS `LOAN_MAST` | LOAN-FNCL-DL-202200882 | `loan_id` (after booking) | Joined |
| DLG ledger | DLG-2024-Q4-... | `dlg_cap_used_pct=3.4%` | Joined |

**Part B — ProcessExecution Created**

| Field | Value |
|---|---|
| `pe_id` | PE-PROC-LND-001-2024-12-13T15-22Z-DL-APP-2024-00882 |
| `loan_application_id` | DL-APP-2024-00882 |
| `product_type` | co-lending (MSME) |
| `lsa_name` | (Partner NBFC; co-lending arrangement) |
| `kfs_issued_at` | 2024-12-13T11:00Z |
| `borrower_acceptance_at` | 2024-12-13T14:30Z |
| `kfs_timing_valid_flag` | TRUE |
| `dlg_cap_flag` | TRUE (3.4% used; ≤5% per OBL-RBI-026) |
| `cims_reportable_flag` | TRUE (co-lending DLA path) |
| `process_status` | booked |

**Part C — StepExecutions Created.** All 14 stages 1–14 completed in sequence; co-lending-specific approval chain (Stage 12) involves both bank's underwriter and partner-NBFC reviewer.

**Part D — ControlInstances Created**

| Control ID | Outcome | Reason | Evidence Linked? | OBL-ID Affected |
|---|---|---|---|---|
| CTRL-LND-001 | Pass | 4 bureaus + GSTN | Y | OBL-RBI-038 |
| CTRL-LND-002 | Pass | KFS sequence intact | Y | OBL-RBI-022 |
| CTRL-LND-003 | Pass | APR complete | Y | OBL-RBI-022 |
| CTRL-LND-004 | n/a | New loan | n/a | OBL-RBI-038 |
| CTRL-LND-005 | Pass | CIMS Q4-2024 includes the loan | Y | OBL-RBI-025 |

**Part E — Final Conclusion.** Clean co-lending tranche; DLG cap intact at 3.4 %. PERSONA-003 marks this as positive sample for `OBL-RBI-026` (DLG cap).

#### DL-APP-2024-00884 — Personal loan, KFS issued AFTER borrower acceptance — AI-013 hit

**Part A — Source Records Joined**

| Source Table | Record ID | Key Fields Used | Join Status |
|---|---|---|---|
| LOS `APP_HDR` | DL-APP-2024-00884 | `loan_application_id`, `product_type=personal`, channel=DSA | Joined |
| Bureau APIs | BUR-...-2024-12-15 | 4 bureaus | Joined |
| LOS `KFS_DOC` | KFS-DOC-DL-2024-00884 | `kfs_hash=0xb7ce...` | Joined |
| LOS `KFS_ISSUED_EVT` | KFS-EVT-2024-12-15T11:08Z | `kfs_issued_at` | Joined |
| LOS `BORR_ACCEPT_EVT` | BACC-EVT-**2024-12-15T10:55Z** | `e_sign_ref` | Joined |
| AI-013 insight | AI-INS-2024-12-15-AI013-1102 | `ai_insight_id` ↔ `loan_application_id` | Joined |
| CBS `LOAN_MAST` | LOAN-FNCL-DL-202200884 | `loan_id` | Joined (booked) |

**Part B — ProcessExecution Created**

| Field | Value |
|---|---|
| `pe_id` | PE-PROC-LND-001-2024-12-15T11-30Z-DL-APP-2024-00884 |
| `loan_application_id` | DL-APP-2024-00884 |
| `product_type` | personal |
| `lsa_name` | (DSA channel; LSP partner) |
| `kfs_issued_at` | **2024-12-15T11:08Z** |
| `borrower_acceptance_at` | **2024-12-15T10:55Z** (13 min BEFORE KFS) |
| `kfs_timing_valid_flag` | **FALSE** |
| `apr_completeness_flag` | TRUE (the KFS itself has APR; the violation is sequence) |
| `process_status` | failed_control |
| `closure_event_timestamp` | 2024-12-15T11:30Z |

**Part C — StepExecutions Created**

| Step # | StepExecution Name | Status | Timestamp | Notes |
|---|---|---|---|---|
| 1–8 | (per stage) | completed | 2024-12-13 to 2024-12-15 | Standard sequence |
| 9 | STEP-LND-06 | **completed_late** | 2024-12-15T11:08Z | KFS issued AFTER acceptance |
| 10 | STEP-LND-06b | completed_early | 2024-12-15T10:55Z | Acceptance recorded BEFORE KFS — DSA channel race |
| 11 | STEP-LND-06c | n/a | — | Cooling off n/a (loan booked anyway) |
| 12 | STEP-LND-07 | completed | 2024-12-15T11:25Z | Approved despite sequence violation (AI-013 not yet integrated as hard gate) |
| 13 | STEP-LND-08 | completed | 2024-12-15T11:30Z | Booked |
| 14 | STEP-LND-09 | pending | — | Q4-2024 CIMS cycle |

**Part D — ControlInstances Created**

| Control ID | Outcome | Reason | Evidence Linked? | OBL-ID Affected |
|---|---|---|---|---|
| CTRL-LND-001 | Pass | 4 bureaus pulled | Y | OBL-RBI-038 |
| **CTRL-LND-002** | **Fail (AI-013 fires; confidence 0.97 ≥ τ_action 0.95)** | `kfs_issued_at (11:08Z) ≥ borrower_acceptance_at (10:55Z)` — sequence violation | Y (EVD-LOG events show timestamp); EVD-DOC KFS PDF exists; AI-013 insight node created | **OBL-RBI-022** |
| CTRL-LND-003 | Pass (APR complete on the KFS itself) | APR table parsed | Y | OBL-RBI-022 |
| CTRL-LND-005 | n/a yet | Quarter not closed | n/a | OBL-RBI-025 |

**Part E — Final Conclusion.** DL-APP-2024-00884 is the AI-013 archetype — DSA channel timing race causing KFS issuance *after* borrower acceptance event in LOS event stream. PERSONA-003 (IA Manager) flags this as **Control Failure** on CTRL-LND-002, contributing to ISS-2026-085* cluster (KFS post-acceptance pattern in DSA channel). PERSONA-002 (CCO) sees the AI-013 insight on the OCM dashboard with `OBL-RBI-022` exposure — reproducing the Bajaj Finance Nov-2023 archetype profile. PERSONA-001 (CRO) sees the CES decline on CTRL-LND-002 in residual-risk view.

#### DL-APP-2024-00885 — Rejected, adverse action, CIMS reportable

**Part A — Source Records Joined**

| Source Table | Record ID | Key Fields Used | Join Status |
|---|---|---|---|
| LOS `APP_HDR` | DL-APP-2024-00885 | `loan_application_id`, `product_type=personal` | Joined |
| Bureau APIs | BUR-...-2024-12-16 | 4 bureaus, score 612 (below threshold) | Joined |
| Policy engine | POL-DEC-2024-12-16-... | `decision=decline` | Joined |
| LOS `ADV_ACTION_SENT` | (no row in window) | — | **Missing** — adverse action not sent |
| Adverse-action SMS / email log | (none) | — | Missing |
| CIMS portal (Q4-2024 cycle) | CIMS-Q4-2024 (filed) | `loan_application_id ∩ Q4-2024` | **Missing from CIMS** — orphan in CIMS register |

**Part B — ProcessExecution Created**

| Field | Value |
|---|---|
| `pe_id` | PE-PROC-LND-001-2024-12-16T10-12Z-DL-APP-2024-00885 |
| `loan_application_id` | DL-APP-2024-00885 |
| `product_type` | personal |
| `policy_decision` | decline |
| `bureau_pull_at` | 2024-12-16T09:50Z |
| `credit_score` | 612 |
| `kfs_issued_at` | (n/a; not approved) |
| `adverse_action_sent_flag` | **FALSE** |
| `adverse_action_sent_at` | NULL |
| `cims_reportable_flag` | TRUE |
| `cims_submitted_flag` | **FALSE** (orphan from quarterly submission) |
| `process_status` | declined → **failed_control** (adverse-action absent + CIMS gap) |

**Part C — StepExecutions Created**

| Step # | StepExecution Name | Status | Timestamp | Notes |
|---|---|---|---|---|
| 1–6 | (per stage) | completed | 2024-12-16 | Standard till policy decline |
| 7 | STEP-LND-05b | n/a | — | No UW review (auto-decline) |
| 12 | STEP-LND-07 | n/a | — | Not approved |
| 14 | STEP-LND-09 | **NOT_FIRED** | — | DL-APP-2024-00885 absent from CIMS Q4 submission |
| 15 | STEP-LND-10 | **NOT_FIRED** | — | Adverse action notice not sent |

**Part D — ControlInstances Created**

| Control ID | Outcome | Reason | Evidence Linked? | OBL-ID Affected |
|---|---|---|---|---|
| CTRL-LND-001 | Pass | 4 bureaus pulled | Y | OBL-RBI-038 |
| CTRL-LND-002 | n/a | Loan declined | n/a | OBL-RBI-022 |
| **CTRL-LND-005** | **Fail** | `cims_reportable_flag=TRUE` but loan absent from CIMS Q4 submission | Partial — CIMS row missing | **OBL-RBI-025** |
| (Conduct overlay) | **Fail** | Adverse-action notice not sent | Missing | **OBL-RBI-024** (DL Directions 2025) |

**Part E — Final Conclusion.** DL-APP-2024-00885 is the adverse-action + CIMS-omission archetype. PERSONA-003 (IA Manager) discovers the omission via population test against CIMS submission vs. LOS declined-loan list. PERSONA-002 (CCO) sees both `OBL-RBI-024` and `OBL-RBI-025` exposures on the OCM dashboard. The AFI MRA risk is direct because CIMS has CCO certification — the certification was filed without this loan in the population.

---

## 7. Vendor Onboarding — Correlation Model

### 7.1 Master Process Entity — VendorOnboardingExecution (PROC-VND-001)

| Field | Source System / Table | Role | Required? | Notes |
|---|---|---|---|---|
| `vendor_request_id` | VMO platform `VND_REQ.REQ_ID` | Process anchor key | **Yes** | Single anchor across DDQ / InfoSec / contract / approval |
| `vendor_id` | VMO `VND_MAST.VND_ID` | Linked entity | Yes (post-approval) | Permanent vendor record |
| `contract_id` | Contracts repo `CONTRACT.CONTRACT_ID` | Linked entity | Conditional | Required at approval |
| `vendor_name` | VMO `VND_MAST.NAME` | Display + canonical | Yes | Avoid name-based joins (Rule 5) |
| `service_type` | VMO `VND_MAST.SERVICE` ∈ {CBS, AML-engine, BPO, SaaS, ASP, fourth-party} | Process attribute | Yes | Drives materiality |
| `materiality_flag` | VMO `VND_MAST.MATERIAL` (per OBL-RBI-016) | Compliance flag | Yes | Drives RBI intimation |
| `data_access_level` | VMO `VND_MAST.DATA_ACCESS` ∈ {customer-PII, financial, no-data} | Process attribute | Yes | Drives DPDP applicability |
| `risk_tier` | VMO `VND_MAST.RISK_TIER` ∈ {tier-1..tier-4} | Process attribute | Yes | — |
| `criticality_score` | VMO `CRIT_ASSESS.SCORE` | Process attribute | Yes | Op-Resilience input |
| `ddq_status` | VMO `DDQ.STATUS` | Process state | Yes | submitted / reviewed / accepted |
| `infosec_review_status` | VMO `INFOSEC_REV.STATUS` | Process state | Yes | per OBL-RBI-007 (ITGRCA) |
| `soc_report_id` | VMO `SOC_REV.REPORT_ID` | Evidence anchor | Conditional | Required for material |
| `soc_report_version` | VMO `SOC_REV.VERSION` | Evidence anchor | Conditional | SOC-2 Type II preferred |
| `soc_review_timestamp` | VMO `SOC_REV.REVIEW_TS` | Timestamp | Conditional | — |
| `fourth_party_disclosed_flag` | VMO `FOURTH_PTY.DISCLOSED` | Compliance flag | Yes | Per OBL-RBI-017 |
| `fourth_party_vendor_id` | VMO `FOURTH_PTY.VND_ID` | Linked entity | Conditional | If disclosed |
| `contract_approved_flag` | Contracts repo `CONTRACT.APPROVED` | Process state | Yes | — |
| `exit_plan_flag` | VMO `EXIT_PLAN.AVAILABLE` | Compliance flag | Yes | Per OBL-RBI-018 |
| `exit_plan_tested_flag` | VMO `EXIT_PLAN.TESTED` | Compliance flag | Conditional | For material |
| `csite_reportable_flag` | Platform-derived | Compliance flag | Yes | Per OBL-RBI-019 |
| `final_approval_status` | VMO `FINAL_APPROVAL.STATUS` | Process state | Yes | approved / blocked / pending |
| `process_status` | Platform-derived | State | Yes | Enumeration below |
| `closure_event_timestamp` | Platform-derived | State | Yes | Set at terminal |

**`process_status` enumeration:** `requested` | `risk_tiered` | `due_diligence` | `infosec_review` | `contract_review` | `approved` | `blocked` | `failed_control` | `data_gap`.

### 7.2 Cross-System Join Map — PROC-VND-001

| From System / Table | To System / Table | Primary Join Key | Backup Join Key | Timestamp Rule | Expected Cardinality | Common Breakage | Audit Impact |
|---|---|---|---|---|---|---|---|
| VMO `VND_REQ` | VMO `VND_RISK_ASSESS` | `vendor_request_id` | `vendor_name_hash` (fallback) | `risk_assess_at ≥ request_at` | one-to-one | Risk assessment opened on legacy `vendor_id` from prior engagement (mis-key) | Materiality mis-classified |
| VMO `VND_RISK_ASSESS` | VMO `DDQ` | `vendor_request_id` | n/a | `ddq_completed_at ≥ risk_assess_at` | one-to-one | DDQ pre-filled by vendor; not validated | CTRL-VND-001 evidence-gap |
| VMO `DDQ` | VMO `INFOSEC_REV` | `vendor_request_id` | n/a | `infosec_review_at ≥ ddq_completed_at` | one-to-one | InfoSec deferred for "go-live pressure"; review marked complete in workflow but no actual review | CTRL-VND-001 fail |
| VMO `INFOSEC_REV` | VMO `SOC_REV` | `vendor_request_id` ↔ `soc_report_id` | `vendor_id` | `soc_review_at ≥ infosec_review_at`; `soc_report_period` covers current quarter | one-to-one | SOC-2 Type I accepted where Type II required | CTRL-VND-001 fail (substance) |
| VMO `VND_MAST` | MCA portal (ownership / BO chain; OBL-RBI-017) | `vendor_id` ↔ `cin` | `vendor_name_hash` ∩ `pan_hash` | `mca_check_at ≥ ddq_completed_at` | one-to-one | MCA check skipped for "global" vendors (FBB archetype) | OBL-RBI-017 BO-chain gap |
| VMO `VND_MAST` | VMO `FOURTH_PTY` | `vendor_id` (parent) | n/a | `fourth_party_disclosed_at ≥ ddq_completed_at` | one-to-many | **Fourth party not disclosed at all (VEND-2024-00205 archetype)** | CTRL-VND-001 fail; AI-009 fires; OBL-RBI-017 |
| VMO `VND_MAST` | Contracts repo `CONTRACT` | `vendor_id` ↔ `contract_id` | `vendor_name_hash` | `contract_approved_at ≥ infosec_review_at` AND `contract_clauses` include audit rights, SLA, exit, sub-contractor | one-to-one (per engagement) | Contract clause review checkbox-only; no clause-text audit | CTRL-VND-001 evidence-gap; OBL-RBI-018 |
| VMO `VND_MAST` | TPSP material-incident log | `vendor_id` | `vendor_name_hash` | **`bank_notified_at − incident_reported_at ≤ 6h`; `rbi_notified_at − incident_reported_at ≤ 6h` (OBL-RBI-019)** | one-to-many | Vendor reports to bank-side service desk, not VMO; clock starts late | **CTRL-VND-002 fail; OBL-RBI-019 breach** |
| VMO `VND_MAST` | RBI intimation log (for material outsourcing) | `vendor_id` ∩ `material_flag=TRUE` | n/a | `rbi_intimation_at ≥ contract_approved_at - X` (per OBL-RBI-016) | one-to-one | RBI intimation done on policy basis but specific vendor not listed | OBL-RBI-016 breach |
| VMO `VND_MAST` | VMO ongoing-monitoring `MON_LOG` | `vendor_id` | n/a | Cyclic per criticality | one-to-many | Monitoring quarterly attestation slipped (CTRL-VND-001 quarterly cycle) | CTRL-VND-001 evidence-gap |

### 7.3 Stage-Level Correlation — Twelve Vendor Onboarding Stages

| Stage # | Stage Name | Source Record | StepExecution Name | Primary Join Key | Timestamp Field | Must Occur Before | Evidence Generated | Controls Affected | Correlation Risk |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Vendor Request Submitted | VMO `VND_REQ` | STEP-VND-01 | `vendor_request_id` | `request_at` | Stage 2 | EVD-LOG | (input) | Mis-attribution to legacy vendor_id |
| 2 | Vendor Profile and Materiality Classification | VMO `VND_MAST` | STEP-VND-02 | `vendor_request_id` ↔ `vendor_id` | `material_classified_at` | Stage 3 | EVD-LOG, EVD-ATTEST | CTRL-VND-001 | Materiality marked NO to bypass DDQ depth |
| 3 | Criticality Assessment and Risk Tiering | VMO `CRIT_ASSESS` | STEP-VND-03 | `vendor_request_id` | `criticality_at` | Stage 4 | EVD-LOG, EVD-ATTEST | CTRL-VND-001 | Score not aligned to data-access level |
| 4 | Due Diligence Questionnaire | VMO `DDQ` | STEP-VND-04 | `vendor_request_id` | `ddq_completed_at` | Stage 5 | EVD-DOC (responses), EVD-SIGN | CTRL-VND-001 | Vendor pre-fills; not validated |
| 5 | Financial Health Review | VMO `FIN_REV` | STEP-VND-05 | `vendor_request_id` ↔ `cin` | `fin_review_at` | Stage 6 | EVD-DOC (financials) | CTRL-VND-001 | Financials not refreshed |
| 6 | InfoSec / ITGRCA Cyber Review | VMO `INFOSEC_REV` (per OBL-RBI-007 seq.) | STEP-VND-06 | `vendor_request_id` | `infosec_review_at` | Stage 7 | EVD-DOC, EVD-ATTEST | CTRL-VND-001, CTRL-VND-002 | Workflow status without substance |
| 7 | SOC Report Review | VMO `SOC_REV` | STEP-VND-07 | `vendor_request_id` ↔ `soc_report_id` | `soc_review_at` | Stage 8 | EVD-DOC (SOC PDF) | CTRL-VND-001 | Type I accepted instead of Type II; report period stale |
| 8 | Data Privacy / DPDP Act Assessment | VMO `DPDP_ASSESS` (per OBL-RBI-049) | STEP-VND-08 | `vendor_request_id` | `dpdp_assess_at` | Stage 10 | EVD-DOC, EVD-ATTEST | CTRL-VND-001 | DPDP Act 2023 framework not yet ingrained; cross-border transfer un-assessed |
| 9 | Fourth-Party Identification and Disclosure | VMO `FOURTH_PTY` (per OBL-RBI-017) | STEP-VND-09 | `vendor_request_id` ↔ `fourth_party_vendor_id` | `fourth_party_disclosed_at` | Stage 10 | EVD-DOC (sub-contractor list), EVD-ATTEST | **CTRL-VND-001** | **Fourth party not disclosed (VEND-2024-00205); AI-009 fires** |
| 10 | Contract Review | Contracts repo `CONTRACT` | STEP-VND-10 | `vendor_request_id` ↔ `contract_id` | `contract_approved_at` | Stage 12 | EVD-DOC (contract), EVD-SIGN, EVD-ATTEST | CTRL-VND-001 | Audit-rights clause missing; exit clause weak |
| 11 | RBI Intimation (material) | RBI intimation log | STEP-VND-11 | `vendor_id ∩ material_flag` | `rbi_intimation_at` | Stage 12 | EVD-DOC, EVD-ATTEST | (regulatory-layer) | Specific vendor not listed in intimation |
| 12 | Vendor Approved and Ongoing Monitoring Initiated | VMO `FINAL_APPROVAL`, `MON_LOG` | STEP-VND-12 | `vendor_id` | `final_approval_at` | Closure | EVD-LOG, EVD-ATTEST (quarterly) | CTRL-VND-001 (quarterly cycle) | Monitoring attestation slipped quarterly |

### 7.4 ControlInstance Generation Logic — CTRL-VND-001 and CTRL-VND-002

| Control ID | Trigger Condition | Expected-to-Fire Population | Required Source Records | Evidence Required | Pass Logic | Fail Logic | Data Gap Logic | Evidence Gap Logic |
|---|---|---|---|---|---|---|---|---|
| **CTRL-VND-001** Vendor due-diligence package completeness before approval (DDQ + financial + InfoSec + SOC + DPDP + fourth-party + contract; OBL-RBI-016 / 017 / 018 / 049) | `final_approval_at` event for any vendor request | All vendor requests in window with `final_approval_status=approved` | `DDQ`, `FIN_REV`, `INFOSEC_REV`, `SOC_REV`, `DPDP_ASSESS`, `FOURTH_PTY`, `CONTRACT` | EVD-DOC for each artefact; EVD-ATTEST (compliance officer); EVD-LOG (workflow) | All seven artefacts present, hash-verified, dated within freshness windows; fourth-party disclosure complete; contract clauses verified | One or more artefacts absent, stale, or substance-deficient; fourth-party not disclosed (AI-009 fires) | Source artefact (e.g., MCA portal extract) not joinable to `vendor_request_id` | All artefacts present but `EVD-ATTEST` (compliance officer sign-off) missing |
| **CTRL-VND-002** TPSP material incident reporting — 6-hour rule (`OBL-RBI-019`) | `incident_reported_at` for any TPSP material incident | All TPSP material incidents in window | `INCIDENT_LOG`, `BANK_NOTIF_LOG`, `RBI_NOTIF_LOG`, `CERT_IN_NOTIF_LOG` | EVD-LOG (incident, bank notif, RBI / CERT-In notif), EVD-DOC (RBI submission letter) | `bank_notified_at − incident_reported_at ≤ 6h` AND `rbi_notified_at − incident_reported_at ≤ 6h` AND `cert_in_notified_at ≤ 6h` (OBL-RBI-048 parallel) | Either clock breached OR notif missing; AI-009 / AI-019 fires | Vendor reports to bank service desk but no link to VMO; clock cannot be measured | Notifications sent but submission letter not archived |

### 7.5 Correlation Example Using Sample Data — VEND-2024-00202, 00203, 00205

#### VEND-2024-00202 — CBS cloud vendor, material TPSP, SOC-2 reviewed

**Part A — Source Records Joined**

| Source Table | Record ID | Key Fields Used | Join Status |
|---|---|---|---|
| VMO `VND_REQ` | VEND-2024-00202 | `vendor_request_id` | Joined |
| VMO `VND_MAST` | VEND-ID-202 | `service_type=CBS-cloud`, `materiality=TRUE` | Joined |
| VMO `DDQ` | DDQ-2024-202 | `vendor_request_id` | Joined |
| VMO `FIN_REV` | FIN-2024-202 | `cin` | Joined |
| VMO `INFOSEC_REV` | IS-2024-202 | `vendor_request_id` | Joined |
| VMO `SOC_REV` | SOC-2024-202 (SOC-2 Type II, FY24-25) | `soc_report_id` | Joined |
| VMO `DPDP_ASSESS` | DPDP-2024-202 | `vendor_request_id` | Joined |
| VMO `FOURTH_PTY` | FP-202-{a,b,c} (3 disclosed sub-processors) | `vendor_id` | Joined |
| Contracts repo `CONTRACT` | CONTR-2024-202 | `contract_id`, audit rights, SLA, exit clauses present | Joined |
| RBI intimation log | RBI-INT-2024-Q3 (CBS cloud listed) | `vendor_id ∩ material_flag` | Joined |

**Part B — ProcessExecution Created**

| Field | Value |
|---|---|
| `pe_id` | PE-PROC-VND-001-2024-09-30T10-00Z-VEND-2024-00202 |
| `vendor_request_id` | VEND-2024-00202 |
| `vendor_id` | VEND-ID-202 |
| `service_type` | CBS-cloud |
| `materiality_flag` | TRUE |
| `data_access_level` | customer-PII |
| `risk_tier` | tier-1 |
| `criticality_score` | 9.2/10 |
| `ddq_status` | accepted |
| `infosec_review_status` | passed |
| `soc_report_id` | SOC-2024-202 |
| `soc_report_version` | SOC-2 Type II FY24-25 |
| `soc_review_timestamp` | 2024-09-25T11:00Z |
| `fourth_party_disclosed_flag` | TRUE |
| `fourth_party_vendor_id` | FP-202-a, FP-202-b, FP-202-c (3 disclosed) |
| `contract_approved_flag` | TRUE |
| `exit_plan_flag` | TRUE |
| `exit_plan_tested_flag` | TRUE (table-top exit drill executed) |
| `final_approval_status` | approved |
| `process_status` | approved |

**Part C — StepExecutions Created.** All 12 stages completed in sequence; quarterly monitoring active.

**Part D — ControlInstances Created**

| Control ID | Outcome | Reason | Evidence Linked? | OBL-ID Affected |
|---|---|---|---|---|
| **CTRL-VND-001** | **Pass** | All 7 artefacts present, hash-verified, fourth-party disclosed, contract clauses verified, exit drill executed | Y (full set) | OBL-RBI-016, OBL-RBI-017, OBL-RBI-018 |
| CTRL-VND-002 | n/a (no incident in window) | — | n/a | OBL-RBI-019 |

**Part E — Final Conclusion.** Clean material-TPSP onboarding. PERSONA-002 (CISO + CCO) sees this as positive workpaper sample for `OBL-RBI-016` material outsourcing. PERSONA-003 records the SOC-2 Type II currency for next-quarter re-attestation.

#### VEND-2024-00203 — BPO for AML L1, outsourcing MD applicable

**Part A — Source Records Joined**

| Source Table | Record ID | Key Fields Used | Join Status |
|---|---|---|---|
| VMO `VND_REQ` | VEND-2024-00203 | `vendor_request_id` | Joined |
| VMO `VND_MAST` | VEND-ID-203 | `service_type=BPO`, `materiality=TRUE` (AML L1 = financial outsourcing per OBL-RBI-020) | Joined |
| VMO `DDQ`, `FIN_REV`, `INFOSEC_REV` | (all closed) | `vendor_request_id` | Joined |
| VMO `SOC_REV` | SOC-2024-203 (ISAE-3402 Type II) | `soc_report_id` | Joined |
| VMO `FOURTH_PTY` | (no rows recorded at onboarding) | `vendor_id` | **Joined but EMPTY at onboarding time** — see VEND-2024-00205 |
| Contracts repo `CONTRACT` | CONTR-2024-203 | clauses present including 6-hr re-notification | Joined |
| RBI intimation log | RBI-INT-2024-Q3 (financial outsourcing listed) | `vendor_id ∩ material` | Joined |

**Part B — ProcessExecution Created**

| Field | Value |
|---|---|
| `pe_id` | PE-PROC-VND-001-2024-09-15T15-30Z-VEND-2024-00203 |
| `vendor_id` | VEND-ID-203 |
| `service_type` | BPO (AML L1; financial outsourcing) |
| `materiality_flag` | TRUE |
| `data_access_level` | customer-PII (alert content) |
| `fourth_party_disclosed_flag` | TRUE (at onboarding — list was empty; vendor declared "no sub-processors") |
| `final_approval_status` | approved |
| `process_status` | approved |

**Part C — StepExecutions Created.** All 12 stages completed; vendor declared no fourth-party at the time.

**Part D — ControlInstances Created**

| Control ID | Outcome | Reason | Evidence Linked? | OBL-ID Affected |
|---|---|---|---|---|
| CTRL-VND-001 | **Pass at onboarding time**; **revisit triggered** by VEND-2024-00205 discovery (downstream) | DDQ declared no fourth-party; subsequently a fourth-party SaaS surfaced | Y (DDQ) | OBL-RBI-016, OBL-RBI-017, OBL-RBI-020 |
| CTRL-VND-002 | n/a | No incident yet | n/a | OBL-RBI-019 |

**Part E — Final Conclusion.** Clean onboarding outcome at the time, but the vendor is the parent of VEND-2024-00205 — the fourth-party SaaS subsequently discovered and not disclosed. Treats as **Correlation Warning** retrospectively; PERSONA-002 (CISO) re-opens CTRL-VND-001 for VEND-2024-00203 once the undisclosed fourth-party is found.

#### VEND-2024-00205 — Fourth-party SaaS provider via VEND-00203, NOT disclosed

**Part A — Source Records Joined**

| Source Table | Record ID | Key Fields Used | Join Status |
|---|---|---|---|
| VMO `VND_REQ` | VEND-2024-00205 | `vendor_request_id` (created retrospectively after discovery) | Joined |
| VMO `VND_MAST` | VEND-ID-205 | `service_type=fourth-party SaaS` | Joined |
| VMO `FOURTH_PTY` (cross-link to VEND-2024-00203) | FP-203-x | `parent_vendor_id=VEND-ID-203`, **disclosed_flag=FALSE** | Joined (after discovery) |
| AI-009 insight | AI-INS-2026-04-10-AI009-7811 | `ai_insight_id` ↔ `vendor_request_id` (parent VEND-00203) | Joined |
| External CVE feed (intel-ingestion) | CVE-2026-... | `vendor_id=VEND-ID-205` | Joined |
| VMO `DDQ` | (no DDQ at vendor-205 level; only at parent VEND-00203) | — | **Missing — fourth-party never went through DDQ** |
| Contracts repo | (no direct bank contract; sub-contracted via VEND-00203) | — | Missing direct-contract; but covered in VEND-00203 master clause |

**Part B — ProcessExecution Created**

| Field | Value |
|---|---|
| `pe_id` | PE-PROC-VND-001-2026-04-10T11-00Z-VEND-2024-00205 |
| `vendor_request_id` | VEND-2024-00205 |
| `parent_vendor_id` | VEND-ID-203 |
| `service_type` | fourth-party SaaS (used for AML L1 case-mgmt UI overlay) |
| `materiality_flag` | TRUE (handles customer-PII via parent BPO) |
| `data_access_level` | customer-PII |
| `fourth_party_disclosed_flag` | **FALSE at parent onboarding; TRUE after retrospective discovery 2026-04-10** |
| `ddq_status` | not_initiated |
| `infosec_review_status` | not_initiated |
| `soc_report_id` | NULL |
| `process_status` | failed_control |

**Part C — StepExecutions Created**

| Step # | StepExecution Name | Status | Timestamp | Notes |
|---|---|---|---|---|
| 1 | STEP-VND-01 | n/a (retrospective) | — | Discovered post-fact via AI-009 + CVE feed |
| 9 | **STEP-VND-09** | **failed_to_disclose** at parent's onboarding (2024-09); flagged 2026-04-10 | — | AI-009 fired |
| (others) | n/a | — | — | Cannot be reconstructed without retrospective workflow |

**Part D — ControlInstances Created**

| Control ID | Outcome | Reason | Evidence Linked? | OBL-ID Affected |
|---|---|---|---|---|
| **CTRL-VND-001** | **Fail** | Fourth-party SaaS (VEND-2024-00205) used by parent VEND-2024-00203 never disclosed at onboarding; no DDQ / InfoSec / SOC review at the fourth-party level; AI-009 signal links the discovery | Partial — AI-009 EVD-LOG present; underlying fourth-party DDQ / SOC EVD-DOC absent | **OBL-RBI-017** (sub-contractor disclosure), OBL-RBI-016, OBL-RBI-020 |
| CTRL-VND-002 | n/a (no incident) | — | n/a | OBL-RBI-019 |

**Part E — Final Conclusion.** VEND-2024-00205 is the AI-009 fourth-party-non-disclosure archetype. PERSONA-002 (CISO + CCO) escalates as ISS-2026-027-class issue (extending Pass 4's vendor-related issue family). PERSONA-001 (CRO) sees this on the residual-risk dashboard with `OBL-RBI-017` exposure. PERSONA-003 (IA) population-tests every other material vendor for similar undisclosed fourth-parties using the AI-009 signal.

---

## 8. Cross-Process Correlation

### 8.1 Cross-Process Linkage Table

| Source Process | Target Process | Shared Entity | Shared Key | Data Reused | Risk / Control Impact | Concrete India Example |
|---|---|---|---|---|---|---|
| **KYC Onboarding (PROC-KYC-001)** | **AML Monitoring (PROC-AML-001)** | Customer (UCIC) | `ucic` | `risk_category`, `nri_flag`, `dbt_flag`, `pep_flag`, BO graph | Stale `risk_category` drives wrong AML scenario thresholds, wrong alert volume, wrong STR exposure | UCIC-2024-00126 (NRI, high) drives elevated TM thresholds in AML; if `risk_category` not propagated post-EDD, alerts under-fire and `OBL-PMLA-003` STR risk surfaces |
| **KYC Onboarding (PROC-KYC-001)** | **Digital Lending (PROC-LND-001)** | Customer (UCIC) + BO graph | `ucic`, BO chain | `kyc_active`, `risk_category`, `bo_threshold_status` | Incomplete BO verification (10% partnership threshold post 12-Jun-2025; `OBL-RBI-005`) → AI-014 → loan disbursed to non-KYC-ed entity | DL-APP-2024-00882 (MSME co-lending) — if partner KYC stale, the 10% partnership BO check fails downstream |
| **AML Monitoring (PROC-AML-001)** | **UPI Payments (PROC-UPI-001)** | Subject + counterparty network | `ucic` ↔ `va` (UPI virtual address) | `mule_flag`, AI-001 mule-network insight | Mule flag must propagate to UPI fraud engine to block transactions; AI-001 must propagate to NPCI fraud-feedback channel | AML-ALRT-2024-00505 — AI-001 mule-network insight; CTRL-UPI-001 must consume the flag in real-time, else UPI continues funnelling |
| **Digital Lending (PROC-LND-001)** | **CIMS / CRILC Reporting (downstream of PROC-LND-001)** | Loan + CIMS register + CRILC threshold | `loan_application_id` ∩ `quarter`; `loan_id` ∩ `crilc_threshold` | DLA flag, `cims_reportable_flag`, exposure ≥ ₹5 cr (CRILC) | Booking event delay → loan absent from CIMS quarterly cycle → `OBL-RBI-025` breach; CRILC ≥₹5 cr exposures missing → `OBL-RBI-037` breach | DL-APP-2024-00885 (declined; CIMS reportable) — adverse-action absence and CIMS omission are joint exposures |
| **Vendor Onboarding (PROC-VND-001)** | **IT Operations / ITGRCA (PROC-ITO-001)** | Vendor + IT change / incident | `vendor_id` ↔ `change_id` ∩ `incident_id` | `material_flag`, `criticality_score`, fourth-party chain | Material TPSP (VEND-2024-00202) drives CTRL-ITO-002 privileged access governance; vendor incident → 6-hr clock → CTRL-VND-002 + CTRL-ITO-001 + CERT-In | VEND-2024-00205 (fourth-party undisclosed) — AI-009 signal cross-feeds into CTRL-ITO-002 privileged-account audit |
| **KYC Onboarding (PROC-KYC-001)** | **Conduct / Complaints (PROC-COMP-001)** | Customer + product suitability | `ucic` | `risk_category`, `vulnerable_customer_flag` (senior citizen / DBT / minor) | Vulnerable-customer flag drives suitability check obligation for CTRL-COMP-001 mis-selling detection (Yes Bank Jun-2024 archetype) | UCIC-2024-00127 (DBT / scholarship; vulnerable customer profile) — if a bancassurance product is sold to this customer cluster, CTRL-COMP-001 must fire suitability check; without the KYC-flag propagation it does not |

### 8.2 Cross-Process Key Preservation Rules

| Key Field | Origin Process | Origin Table | Consuming Process | Consuming Table | What Breaks If Key Is Lost |
|---|---|---|---|---|---|
| `ucic` | PROC-KYC-001 | CBS `CUST_MAST` | PROC-AML-001, PROC-LND-001, PROC-COMP-001 | AML `ALERT_HDR.SUBJECT_UCIC`, LOS `APP_HDR.UCIC`, CMS complaint | All cross-process scenarios collapse; alerts orphan; loans cannot KYC-link |
| `risk_category` | PROC-KYC-001 | CBS `CUST_MAST` / Risk engine | PROC-AML-001 | AML scenario thresholds | Wrong alert volume; OBL-PMLA-003 STR exposure |
| `bo_chain` (entities) | PROC-KYC-001 | CBS `BO_CHAIN`, MCA portal | PROC-LND-001 | LOS underwriting | OBL-RBI-005 BO threshold breach (AI-014); lending to unverified entity |
| `mule_flag` | PROC-AML-001 | AML engine, AI-001 insight | PROC-UPI-001 | UPI fraud engine `BLOCK_LIST` | UPI continues funnelling; CTRL-UPI-001 fails; ISS-2026-061* cluster grows |
| `loan_application_id` | PROC-LND-001 | LOS `APP_HDR` | CIMS register, CRILC | CIMS `CIMS_SUBMIT`, CRILC quarterly | OBL-RBI-025 / OBL-RBI-037 reporting gaps |
| `vendor_id` (parent + fourth-party) | PROC-VND-001 | VMO `VND_MAST`, `FOURTH_PTY` | PROC-ITO-001 | ITSM change / incident, IAM privileged-access | OBL-RBI-017 / OBL-RBI-019 / OBL-RBI-007 exposures; AI-009 signal lost |
| `vulnerable_customer_flag` | PROC-KYC-001 | CBS `CUST_MAST` | PROC-COMP-001 (mis-selling overlay) | Suitability check workflow, EVD-CALL | CTRL-COMP-001 cannot fire suitability; conduct exposure |
| `account_id` | PROC-KYC-001 | CBS `ACCT_MAST` | All others | All others | Process-execution ambiguity; orphan transactions |

### 8.3 Stale Upstream Data Risk

**Linkage 1 — KYC → AML (stale `risk_category`).** When a KYC re-rating event (e.g., NRI uplift on UCIC-2024-00126, or a sanctions-hit-cleared event) does not propagate to the AML engine in real time, AML scenarios continue running on the stale `risk_category`. The result is **CTRL-AML-002 / CTRL-AML-005 Catch-Rate degradation** (alerts under-fire on a customer who should now be high-risk) — not a Fail per se, but a hidden Catch-Rate gap that surfaces only on independent CES analysis. `OBL-PMLA-003` (STR completeness) is the obligation exposed because suspicion-conclusion-worthy patterns are missed. The platform must classify this as a **Correlation Warning** with cross-process notification to PERSONA-002.

**Linkage 2 — KYC → Digital Lending (stale BO graph).** When a partnership KYC's BO chain is not refreshed after the 12-Jun-2025 amendment (10% threshold) and a co-lending tranche is approved against the partnership (DL-APP-2024-00882 archetype), **CTRL-LND-001 receives a Data Gap** (BO chain not joinable) which a brittle implementation might mis-classify as Pass. The correct classification is `Data Gap` requiring AI-014 trigger + workflow to refresh BO chain before disbursal; the obligation exposed is `OBL-RBI-005`.

**Linkage 3 — AML → UPI (mule_flag propagation lag).** When AI-001 produces a mule-network insight on AML-ALRT-2024-00505 but the mule_flag does not propagate to the UPI fraud engine in real time, UPI continues processing transactions for the flagged subject. **CTRL-UPI-001 fires but with stale block-list**, producing false-pass instances that look like control-pass but are evidentially weak. The platform must classify these as **Evidence Gap** (not Pass) until mule_flag-propagation reconciliation is shown — `OBL-RBI-031` / `OBL-RBI-035` (EWS Data Analytics MIU) is exposed.

**Linkage 4 — Digital Lending → CIMS / CRILC (stale loan booking).** When CBS booking event for DL-APP-2024-00885 (or any declined loan) is delayed or never fires, the CIMS `cims_reportable_flag` lookup returns NULL or FALSE incorrectly. **CTRL-LND-005 receives a Data Gap that masquerades as a Pass** because the population query only counts `cims_reportable_flag=TRUE`. The remediation is to expand the CIMS denominator to include all declined-with-adverse-action and all DLA-channel applications regardless of booking status; `OBL-RBI-025` exposure becomes visible.

**Linkage 5 — Vendor → IT Ops (fourth-party undisclosed; VEND-2024-00205 archetype).** When a fourth-party SaaS provider serves an outsourced AML L1 BPO (VEND-2024-00203) but is never disclosed (VEND-2024-00205), the IT-Ops privileged-access review (CTRL-ITO-002) cannot identify the fourth-party's accounts. **CTRL-VND-001 fails (correctly)** and **CTRL-ITO-002 receives a Data Gap** because the privileged-access roster has no entry for VEND-2024-00205. AI-009 signal must propagate into IT-Ops privileged-account audit. Obligations exposed: `OBL-RBI-017` and `OBL-RBI-007`.

**Linkage 6 — KYC → Conduct (vulnerable_customer_flag).** When the DBT / scholarship cohort flag (UCIC-2024-00127 family) is not joined to the bancassurance / wealth-management product offering, CTRL-COMP-001 (suitability) does not fire. **It is a Data Gap on CTRL-COMP-001 specifically for the vulnerable cohort** — a silent under-firing that surfaces only when complaints accumulate. Obligation exposed: `OBL-RBI-051` (broader fair-practice umbrella) and IRDAI bancassurance norms.

---

## 9. Evidence Lineage Model

### 9.1 Evidence Type Inventory

| Evidence Type | Source System | Structured / Semi / Unstructured | Linked To | Required Fields | Evidence Health Rules | Common Failure Mode |
|---|---|---|---|---|---|---|
| **EVD-LOG** | CBS event-stream; AML engine; ITSM; NPCI UPI feed; FIU-IND submission ack | Structured | ControlInstance for any event-driven control | `event_id`, `source_system`, `event_at`, `payload_hash`, `parent_pe_id` | Hash matches source export; no gaps in event sequence; retention ≥5 yrs (PMLA Rule 9) | Event bus drop (Kafka); replay dedup not done; sequence gap |
| **EVD-DOC** | LOS KFS PDF; SOC-2 / ISAE-3402 PDF; MCA portal extract; DDQ signed response | Semi-structured | KFS / SOC / DDQ controls | `doc_id`, `doc_hash`, `mime`, `parsed_payload_json`, `source_uri` | Hash verifies; if parsed, parsed payload reconstructable | OCR fail on image-only PDF; hash mismatch on re-upload |
| **EVD-ATTEST** | CIMS CCO certification; concurrent audit ICR sign-off; CTRL attestation by branch manager | Structured | Quarterly / annual controls | `attest_id`, `attestor_user_id`, `attestor_role`, `attest_at`, `attest_hash`, `linked_ci_ids` | Attestor authority chain valid; no post-attestation edit | Rubber-stamp; attestor lacks delegation authority |
| **EVD-SIGN** | Borrower e-sign on KFS (DigiLocker / Aadhaar e-sign); vendor contract e-sign | Structured | KFS / contract controls | `sign_id`, `signer_aadhaar_uid_hash`, `sign_at`, `sign_method ∈ {aadhaar, digilocker, dsc}`, `payload_hash` | Sign hash matches signed payload; UIDAI audit trail retrievable | E-sign endpoint timeout; ack lost; signed hash not stored |
| **EVD-RECON** | CKYCR upload reconciliation count; FIU-IND CTR count vs CBS cash-txn log | Structured | Periodic reconciliation controls | `recon_id`, `source_count`, `target_count`, `delta`, `recon_at`, `reconciler_user_id` | Delta within tolerance; investigation log on breach | Recon run fails silently; tolerance threshold mis-set |
| **EVD-CALL** | Recovery agent call recording (Genesys / Avaya); mis-selling sample | Unstructured (audio) | Conduct controls (CTRL-COMP-001) | `call_id`, `call_at`, `duration_s`, `audio_hash`, `transcript_id`, `agent_id`, `customer_ucic` | Audio retrievable; transcript hash matches | Recording corrupt; transcript not generated |
| **EVD-IMG** | Branch CCTV; biometric-capture image for in-person KYC | Unstructured (image) | KYC V-CIP controls (CTRL-KYC-007) | `img_id`, `img_hash`, `captured_at`, `liveness_score`, `subject_ucic` | Hash valid; liveness score within bounds | CCTV partition lost; liveness frame missing |
| **EVD-BIO** | UIDAI Aadhaar biometric / OTP authentication response | Structured | KYC verification (CTRL-KYC-002) | `auth_id`, `auth_at`, `auth_method ∈ {otp, biometric}`, `uidai_response_hash`, `subject_aadhaar_uid_hash` | Response payload archived; HTTP-200 alone insufficient | HTTP-200 logged but payload not retained (very common) |

### 9.2 Evidence Status Definitions

| Status | Meaning | India Banking Example | CES Impact |
|---|---|---|---|
| **Complete** | All required fields present; hash verifies; retrievable | UCIC-2024-00123 EVD-BIO + EVD-LOG full set | Counts toward Evidence Completeness numerator |
| **Partial** | Some required fields present; substantive content missing | UCIC-2024-00126 EDD EVD-DOC present but source-of-funds page missing | Half-weight (0.5) toward numerator depending on policy |
| **Missing** | Expected but absent | DL-APP-2024-00885 adverse-action SMS log absent | Excluded from Evidence Completeness numerator (drops % directly) |
| **Late** | Present but past statutory / policy SLA | CTR submitted 17th instead of 15th | Counted as Missing for CES-Evidence; counted as Fail for reporting-timeliness obligation |
| **Invalid Hash** | Present but hash mismatch (potential tampering) | KFS PDF for DL-APP-2024-00884 with mismatched hash | Treated as Missing; opens forensic Issue node |
| **Orphaned** | Present but cannot be joined to ControlInstance / ProcessExecution | CKYCR ack with `ckycr_no` not joinable to UCIC | Excluded from numerator; logged in orphan queue (Rule 8) |
| **Not Applicable** | Control did not require this evidence type | UCIC-2024-00123 (low risk) — EDD EVD-DOC n/a | Excluded from denominator |
| **BPO-Pending** | BPO batch not yet arrived; expected to arrive | AML-ALRT-2024-00502 BPO L1 disposition row pending | Treated as Data Gap until SLA expires; converts to Missing on SLA expiry |

### 9.3 Evidence vs. Control vs. Data Gap — Distinction Rules

| Scenario | Correct Classification | Label to Apply | CES Impact | Auditor Action |
|---|---|---|---|---|
| CKYCR upload ran; ack ID not stored | Pass logic met but evidence not retained | **Evidence Gap** | Operating Rate: pass; Evidence Completeness: deduct | PERSONA-003 raises evidence-retention issue; ETL fix |
| AML L1 disposed correctly; disposition narrative not linked to `alert_id` | Control fired; evidence orphaned | **Evidence Gap (Orphaned)** | Operating Rate: pass; Evidence Completeness: deduct | Re-link in BPO platform; close after re-link |
| KFS generated and sent; `borrower_acceptance_at` not captured in LOS | Control may have passed but cannot prove sequence | **Data Gap** | CES not computed for this CI; population denominator excludes it | Investigate LOS event-stream gap (likely Kafka drop) |
| Aadhaar OTP API returned 200; response payload not archived | Control fired (HTTP-200) but evidence absent | **Evidence Gap** | Operating Rate: pass; Evidence Completeness: deduct sharply | Implement payload-archive at API gateway |
| Vendor SOC report reviewed; review timestamp not recorded | Control fired but cannot prove timeliness | **Evidence Gap** | Operating Rate: pass; Evidence Completeness: deduct | Add `review_at` capture at SOC review step |
| UAPA screening ran; `list_version_at` not stored on row | Control fired but cannot prove `OBL-RBI-050` (24h list freshness) | **Evidence Gap** | Operating Rate: pass; Evidence Completeness: deduct | Modify screening tool to stamp list version |
| STR filed within SLA; FIU-IND ack not fetched and stored | Control fired but evidence chain incomplete | **Evidence Gap** | Operating Rate: pass; Evidence Completeness: deduct | Implement FINnet 2.0 ack-poller |
| Bureau pull done; `pull_id` not joined to `loan_application_id` in LOS | Cannot prove bureau pull belongs to this loan | **Correlation Warning** (escalates to Data Gap on next CES run) | CES not computed until correlation fixed | Fix LOS bureau-binding logic |
| Vendor incident reported to bank service desk; not linked to VMO | 6-hr clock cannot be measured | **Data Gap** | CTRL-VND-002 not evaluable | Route incidents through VMO tagging |
| KFS issued AFTER acceptance (DL-APP-2024-00884) | Pass logic violated | **Control Failure** (CTRL-LND-002) | Operating Rate: fail; Evidence Completeness: pass (KFS exists) | Issue created; AI-013 cluster |
| Re-KYC `due_date` field NULL for DBT cohort (UCIC-2024-00127) | Trigger not fired due to upstream null | **Data Gap** (rolls into **Control Failure** when threshold breached) | CES not computed initially; converts to Fail when overdue | AI-016 segment treatment |
| Fourth-party SaaS not disclosed (VEND-2024-00205) | Required artefact never produced | **Control Failure** (CTRL-VND-001) | Operating Rate: fail | Issue created; AI-009 propagation |

These four labels — **Control Failure**, **Evidence Gap**, **Data Gap**, **Correlation Warning** — are non-interchangeable. Misclassifying an Evidence Gap as a Control Failure inflates the Issue register and creates false RBI MRA exposure; misclassifying a Control Failure as an Evidence Gap conceals the real risk.

---

## 10. CES Calculation from Correlated Indian Banking Data

### 10.1 CES Formula Definition

> **CES = (Operating Rate × 40%) + (Catch Rate × 40%) + (Evidence Completeness × 20%)**

**Operating Rate** = (count of ControlInstances with outcome = Pass) ÷ (Expected-to-Fire Population for the control over the rolling window). The denominator is exactly the population defined in column 3 of each ControlInstance specification table in §4.4 / §5.4 / §6.4 / §7.4. Data Gap and Evidence Gap rows are excluded from the numerator but **counted in the denominator** when the platform can establish the population from secondary evidence — otherwise they are excluded from both and a flag is raised.

**Catch Rate** = (count of confirmed risk events that the control detected) ÷ (count of confirmed risk events in the population). Confirmed risk events come from: AI-signal post-validation (e.g., AI-001 mule confirmations from NPCI feedback), concurrent audit findings, BPO exception logs, customer complaints retrospectively classed as control-relevant, and statutory / RBI inspection findings. Catch Rate measures **whether the control is finding what is actually there**, not just **whether it is firing on schedule**.

**Evidence Completeness** = (count of fired ControlInstances with all required EvidenceRecords in status = Complete) ÷ (count of fired ControlInstances). Partial / Missing / Late / Invalid Hash / Orphaned counts subtract from the numerator per §9.2.

**CES is NOT computed when any of these apply:**
- **Data Gap rate > 20%** of the Expected-to-Fire Population for the rolling window (the picture is too unclear to be defensible).
- **Population size < 30** ControlInstances in the rolling window (statistical instability; concurrent audit treatment instead).
- **Source system connectivity interrupted > 4h** (batch / BPO downtime; CDC stream backlog).

When CES is not computed, the dashboard renders **Grey** with a Data-Gap flag and a notification to PERSONA-002.

**CES colour thresholds:**
- **Green (≥80)**: control operating effectively; evidence sufficient.
- **Amber (60–79)**: degraded; PERSONA-002 review triggered; AI-018 effectiveness-decay candidate.
- **Red (<60)**: failing; PERSONA-001 escalation; Issue auto-created.
- **Grey (insufficient data)**: CES not computed; Data Gap flag raised; PERSONA-002 notified.

### 10.2 KYC Onboarding — CTRL-KYC-003 Worked Example

**CTRL-KYC-003: Periodic Re-KYC Completion Within Scheduled Window (`OBL-RBI-002`)**

Rolling window: April 2026 (Q4 of FY25-26 — first month of new FY).

| Metric | Value |
|---|---|
| Total UCICs with `re_kyc_due_date` in window | 18,400 |
| High-risk (2-yr cycle; HRC) | 1,250 |
| Medium-risk (8-yr cycle; MRC) | 8,650 |
| Low-risk (10-yr cycle; LRC) due in window | 8,500 |
| Total expected re-KYC population | 18,400 |
| Re-KYC completed on time | 13,650 |
| Re-KYC completed late (within 90-day grace) | 2,180 |
| Re-KYC not completed (overdue past grace) | 1,910 |
| **DBT / scholarship accounts overdue (AI-016 sub-segment; UCIC-2024-00127 family)** | **660** of the 1,910 |
| Evidence complete (EVD-DOC + EVD-LOG present, hash-verified) | 13,200 of 13,650 on-time |
| Evidence partial (workflow EVD-LOG present; refreshed OVD EVD-DOC missing) | 380 of 13,650 |
| Evidence missing | 70 of 13,650 |

**Operating Rate** = 13,650 ÷ 18,400 = **0.7418 = 74.18%**

(Note: late-completed (2,180) are not Pass for `OBL-RBI-002` periodic-cycle adherence; they are counted as Fail for Operating Rate. Overdue (1,910) are clearly Fail.)

**Catch Rate** = (instances surfaced by the platform as overdue / scheduled / late) ÷ (confirmed overdue + scheduled + late from CBS `re_kyc_due_date` independent reconciliation) = (2,180 late + 1,910 overdue surfaced = 4,090) ÷ (4,090 confirmed) = **1.0000 = 100.0%** for what the platform identifies. **However**, an additional 660 DBT-cohort UCICs have `re_kyc_due_date = NULL` and were therefore *not* in the scheduled population; they are **AI-016 candidates** and the Catch Rate against the *expanded* (true) population is (4,090) ÷ (4,090 + 660) = 0.8611 = **86.11%**. The platform reports **86.11%** as the defensible Catch Rate.

**Evidence Completeness** = 13,200 ÷ (13,200 + 380 + 70) = 13,200 ÷ 13,650 = **0.9670 = 96.70%**

**CES** = (0.7418 × 0.40) + (0.8611 × 0.40) + (0.9670 × 0.20) = 0.2967 + 0.3444 + 0.1934 = **0.8345 → CES = 83.45**

**Colour: Green (just over the 80 threshold).**

**Auditor interpretation (one sentence):** CTRL-KYC-003 is currently Green at 83.45 but **structurally exposed by the AI-016 DBT / scholarship sub-segment of 660 UCICs whose `re_kyc_due_date` is NULL** — a `Data-Gap-rolling-into-Control-Failure` pattern for a vulnerable cohort that is the precise archetype of OBL-RBI-002 / Charter of Customer Rights MRA risk; PERSONA-002 should escalate the AI-016 issue family before the next AFI rather than treat the headline CES as comfortable.

### 10.3 AML Monitoring — CTRL-AML-003 Worked Example

**CTRL-AML-003: STR Filing Within 7 Working Days of Suspicion Conclusion (PMLA s.12; `OBL-PMLA-003`)**

Rolling window: March 2026.

| Metric | Value |
|---|---|
| Total alerts reaching L2 / L3 in window | 412 |
| Alerts where Principal Officer concluded suspicion (`suspicion_concluded_at` set) | 168 |
| STRs filed within 7 working days | 152 |
| STRs filed late (> 7 working days) | 9 |
| STRs pending (not yet filed; clock still running) | 7 |
| FIU-IND ack received (EVD-LOG complete) | 148 of 152 + 6 of 9 = 154 |
| FIU-IND ack pending (EVD-LOG partial / missing) | 4 of 152 + 3 of 9 = 7 |
| Evidence missing entirely (no FINnet 2.0 submission record + no STR XML in repo) | 0 |
| **AML-ALRT-2024-00502 L1 SLA breach status** (alert from earlier window aged into March) | L1 not yet disposed; suspicion conclusion not yet set; **Catch-Rate-at-risk** |

**Operating Rate** = 152 ÷ (152 + 9 + 7) = 152 ÷ 168 = **0.9048 = 90.48%**

**Catch Rate** = (number of confirmed STR-eligible cases the platform got to FIU-IND filing) ÷ (number of confirmed STR-eligible cases). Independent reconciliation against AML engine + concurrent audit reveals 174 STR-eligible cases (6 cases missed because their L1 was open beyond the alerting threshold — like AML-ALRT-2024-00502, where the suspicion conclusion has not yet been timed correctly). Catch Rate = 152 ÷ 174 = **0.8736 = 87.36%**. (PERSONA-002 sees the residual 6 as the AML-ALRT-2024-00502-class L1-SLA-breach feeder into CTRL-AML-003.)

**Evidence Completeness** = 154 ÷ (154 + 7) = 154 ÷ 161 = **0.9565 = 95.65%**

**CES** = (0.9048 × 0.40) + (0.8736 × 0.40) + (0.9565 × 0.20) = 0.3619 + 0.3494 + 0.1913 = **0.9026 → CES = 90.26**

**Colour: Green (well above 80).**

**Auditor interpretation (one sentence):** CTRL-AML-003 reads Green at 90.26 but the Catch Rate of 87.36% is the meaningful number — 6 cases including AML-ALRT-2024-00502 sat in L1 SLA breach long enough that suspicion-conclusion timing is at risk; PERSONA-002 (MLRO) must address the upstream CTRL-AML-002 BPO SLA degradation feeding into this control before it converts to a `OBL-PMLA-003` reportable pattern HSBC-India-Feb-2025-style.

### 10.4 Digital Lending — CTRL-LND-002 Worked Example

**CTRL-LND-002: KFS Issued Before Borrower Acceptance (`OBL-RBI-022`; AI-013)**

Rolling window: December 2024.

| Metric | Value |
|---|---|
| Total digital loans disbursed in window | 47,892 |
| KFS issuance required (all DLA-originated + non-DLA digital + branch digital) | 47,892 |
| KFS issued before `borrower_acceptance_at` (PASS) | 35,061 |
| KFS issued **after** `borrower_acceptance_at` (FAIL; AI-013 hit) — DSA channel concentrated | 11,118 |
| **DL-APP-2024-00884 — included in this 11,118 (AI-013 fired with confidence 0.97)** | (1 of the 11,118) |
| KFS not issued at all (Fail) | 0 (regulatory; KFS is mandatory) |
| Override (manual exception with coded rationale) | 713 |
| KFS hash verifiable in LOS (EVD-SIGN complete) | 35,061 PASS + 10,200 of 11,118 FAIL = 45,261 |
| KFS hash missing or mismatch (EVD-SIGN partial / invalid) | 918 of 11,118 |
| Evidence missing entirely (KFS PDF absent) | 0 (regulatory) |

**Operating Rate** = 35,061 ÷ (35,061 + 11,118 + 713) = 35,061 ÷ 46,892 = **0.7477 = 74.77%**

(Override population is treated as Fail for Operating Rate per CTRL-LND-002 design; the override is permitted but not normal-pass).

**Catch Rate** = (AI-013 hits identified by the platform) ÷ (true KFS-sequence violations confirmed by independent reconciliation against LOS event-stream + DSA channel reconstruction) = (11,118 platform-flagged) ÷ (11,118 confirmed) = **1.0000 = 100.0%** — AI-013's deterministic timestamp comparison has no false negatives. (False positives — about 110 cases due to LOS clock drift, see §12 Failure type #5 — are excluded from Catch Rate denominator.)

**Evidence Completeness** = 45,261 ÷ (45,261 + 918) = 45,261 ÷ 46,179 = **0.9801 = 98.01%**

(Note: the 713 overrides are excluded from the Evidence-Completeness denominator because their evidence requirement is the override-rationale EVD-ATTEST, not a KFS hash; that subset is tracked separately.)

**CES** = (0.7477 × 0.40) + (1.0000 × 0.40) + (0.9801 × 0.20) = 0.2991 + 0.4000 + 0.1960 = **0.8951 → CES = 89.51**

**Colour: Green** at 89.51 *headline*, **but with a meaningful caveat below**.

**Auditor interpretation (one sentence):** CTRL-LND-002 reads Green at 89.51 *because* the AI-013 detection layer has perfect Catch Rate, but the **Operating Rate of 74.77% is structurally weak — 11,118 KFS-after-acceptance instances including DL-APP-2024-00884 in the DSA channel** are a clear `OBL-RBI-022` exposure mirroring the Bajaj Finance Nov-2023 archetype, and PERSONA-002 / PERSONA-001 must read the Operating Rate, not the headline CES, for the AFI defence narrative — **Operating Rate is the regulator's number; Catch Rate is the platform's grade for itself.**

---

## 11. Audit Traceability Examples

### Trace 1 — CTRL-KYC-008 / UCIC-2024-00127 (CKYCR upload overdue; AI-016 DBT sub-segment)

| Trace Level | Detail |
|---|---|
| Aggregate CES Score | CTRL-KYC-008 CES = 86 (Green at portfolio level) on PERSONA-002 OCM dashboard for `OBL-RBI-001 / OBL-RBI-003` coverage tile |
| Control | CTRL-KYC-008 — *CKYCR upload within prescribed timeline post-activation*; objective: every newly activated UCIC has CKYCR ack within 3 days; OBL-RBI-001 / OBL-RBI-003 |
| ControlInstance | CI-CTRL-KYC-008-2024-09-16T11-30Z-UCIC-2024-00127; outcome **Pass** at original onboarding (CKYCR ack received 2024-09-16T15:30Z), **but** companion CTRL-KYC-003 instance shows Fail in current period |
| ProcessExecution | UCIC-2024-00127; `process_status = activated` at original onboarding; `re_kyc_due_date = NULL`; **flagged data_gap for periodic** |
| StepExecution | STEP-KYC-08 completed; **STEP-KYC-10 (re-KYC scheduling) NOT FIRED for DBT cohort** — risk engine default branch missing for `dbt_flag=TRUE` |
| Source Record | Risk engine `RISK_RATING` row id `RR-2024-09-15-UCIC-2024-00127`; field `NEXT_REKYC_DT = NULL`; CBS `CUST_MAST.dbt_flag = TRUE` |
| EvidenceRecord | EV-LOG-CKYCR-ACK-2024-09-16-UCIC-2024-00127 (EVD-LOG, status=Complete) for original CKYCR upload — **evidence is complete for upload but absent for periodic re-KYC scheduling** |
| Classification | **Data Gap** rolling into **Control Failure** for CTRL-KYC-003 (companion control); **not** a CTRL-KYC-008 failure |
| AI Signal | AI-016 (Periodic-KYC pendency detection — DBT / scholarship segmentation; confidence 0.84; τ_review 0.80; routed to human review queue for PERSONA-002) |
| Issue / Action | New issue ISS-2026-AI016-001 (proposed) — root cause: risk engine schema missing default for `dbt_flag=TRUE` cohort; owner: Head of Retail Onboarding (1LoD) + CCO (2LoD); OBL-ID exposed: **OBL-RBI-002**; RBI reporting risk: AFI MRA on KYC governance (Paytm PB Jan-2024 archetype) if cohort grows into thousands |

### Trace 2 — CTRL-AML-003 / AML-ALRT-2024-00502 (L1 SLA breach; STR window at risk)

| Trace Level | Detail |
|---|---|
| Aggregate CES Score | CTRL-AML-003 CES = 90.26 (Green) on PERSONA-002 OCM dashboard for `OBL-PMLA-003` tile; CTRL-AML-002 CES = 65 (Amber) feeding into CTRL-AML-003 risk |
| Control | CTRL-AML-003 — *STR Filing Within 7 Working Days of Suspicion Conclusion*; PMLA s.12(1)(b); OBL-PMLA-003. Companion: CTRL-AML-002 — *AML L1 alert triage within SLA*; OBL-PMLA-001 |
| ControlInstance | CI-CTRL-AML-002-2024-11-15-AML-ALRT-2024-00502 outcome **Fail** (L1 SLA breach at T+9 BD); CI-CTRL-AML-003 not yet evaluable (suspicion conclusion not set) |
| ProcessExecution | AML-ALRT-2024-00502; `process_status = l1_overdue`; `l1_disposed_at = NULL`; aged 9 BD |
| StepExecution | STEP-AML-04 started_not_completed (BPO L1 picked up 2024-11-09); STEP-AML-04c FAILED at 2024-11-15 (SLA window passed); STEP-AML-07 NOT_FIRED (suspicion not concluded) |
| Source Record | Case mgmt `CASE` id CASE-2024-11-08-3411; AML engine `ALERT_HDR.ALERT_ID = AML-ALRT-2024-00502`; BPO platform `KYC_TICKET / AML_TICKET` BPO-AML-2024-11-08-2891 (open, no closure event) |
| EvidenceRecord | EV-LOG-CASE-OPEN-CASE-2024-11-08-3411 (EVD-LOG, Complete); **EV-LOG-L1-DISPO MISSING** (Status: BPO-Pending → Late) |
| Classification | **Control Failure** on CTRL-AML-002 (immediate); **Correlation Warning** on CTRL-AML-003 (downstream risk; not yet a Fail) |
| AI Signal | AI-002 (process drift — STEP-AML-05 bypass / L1 ageing pattern); confidence 0.78; routed to PERSONA-002 review |
| Issue / Action | Issue ISS-2026-009-extension — root cause: BPO L1 capacity / SLA management at VEND-2024-00203; owner: Head of FCC + VMO contract owner; OBL-ID exposed: **OBL-PMLA-001 (immediate)**, **OBL-PMLA-003 (downstream if PO concludes suspicion late)**; RBI reporting risk: HSBC-India-Feb-2025 archetype on AML alert outsourcing — **PMLA s.13 referral risk if pattern persists** |

### Trace 3 — CTRL-LND-002 / DL-APP-2024-00884 (KFS issued after acceptance; AI-013; `OBL-RBI-022` breach)

| Trace Level | Detail |
|---|---|
| Aggregate CES Score | CTRL-LND-002 CES = 89.51 (Green headline; Operating Rate 74.77% is the meaningful number) on PERSONA-002 Conduct / Digital Lending tile |
| Control | CTRL-LND-002 — *KFS Issued Before Borrower Acceptance*; OBL-RBI-022 (RBI Digital Lending Directions 2025 Para 8); AI-013 |
| ControlInstance | CI-CTRL-LND-002-2024-12-15T11-30Z-DL-APP-2024-00884; outcome **Fail**; AI-013 confidence 0.97 (≥ τ_action 0.95) |
| ProcessExecution | DL-APP-2024-00884; `process_status = failed_control`; `kfs_timing_valid_flag = FALSE`; channel = DSA |
| StepExecution | STEP-LND-06 completed_late at 2024-12-15T11:08Z; STEP-LND-06b completed_early at 2024-12-15T10:55Z (acceptance recorded BEFORE KFS by 13 min) |
| Source Record | LOS event-stream rows: `KFS-EVT-2024-12-15T11:08Z` (KFS_ISSUED_EVT) and `BACC-EVT-2024-12-15T10:55Z` (BORR_ACCEPT_EVT); LOS `APP_HDR.APP_ID = DL-APP-2024-00884`; `KFS_DOC.HASH = 0xb7ce...` |
| EvidenceRecord | EV-DOC-KFS-DL-APP-2024-00884 (EVD-DOC, Complete; hash verified); EV-SIGN-DL-APP-2024-00884 (EVD-SIGN, Complete); EV-LOG of both events (Complete) — *evidence is complete; the **sequence** is the violation* |
| Classification | **Control Failure** (CTRL-LND-002); not Evidence Gap (evidence exists and proves the failure) |
| AI Signal | AI-013 (KFS timestamp / pre-acceptance verification; confidence 0.97; τ_action 0.95; auto-creates Issue) |
| Issue / Action | Issue ISS-2026-085* — root cause: DSA channel race condition in LOS event capture; owner: Head of Retail Lending + Head of DSA; OBL-ID exposed: **OBL-RBI-022, OBL-RBI-027**; RBI reporting risk: Bajaj Finance Nov-2023 archetype (cease-and-desist on specific products); CIMS quarterly submission flagged for cluster reporting |

### Trace 4 — CTRL-VND-001 / VEND-2024-00205 (Fourth-party non-disclosure; AI-009; `OBL-RBI-017` breach)

| Trace Level | Detail |
|---|---|
| Aggregate CES Score | CTRL-VND-001 CES = 72 (Amber) on PERSONA-002 Vendor / Outsourcing tile |
| Control | CTRL-VND-001 — *Vendor due-diligence package completeness before approval*; OBL-RBI-016 / 017 / 018 / 020 / 049 |
| ControlInstance | CI-CTRL-VND-001-2026-04-10T11-00Z-VEND-2024-00205; outcome **Fail** (retrospective); parent CI for VEND-2024-00203 also re-opened |
| ProcessExecution | VEND-2024-00205 (created retrospectively); `process_status = failed_control`; `parent_vendor_id = VEND-ID-203` |
| StepExecution | STEP-VND-09 (Fourth-party Identification and Disclosure) **failed_to_disclose** at parent's onboarding 2024-09; flagged 2026-04-10 by AI-009 |
| Source Record | VMO `FOURTH_PTY` row FP-203-x with `disclosed_flag = FALSE` (newly inserted post-discovery); external CVE feed CVE-2026-... linking VEND-ID-205; AI-009 insight node AI-INS-2026-04-10-AI009-7811 |
| EvidenceRecord | EV-LOG-AI009-INSIGHT-2026-04-10 (EVD-LOG, Complete); **EV-DOC-DDQ for VEND-ID-205 MISSING**; **EV-DOC-SOC for VEND-ID-205 MISSING**; **EV-DOC-INFOSEC-REVIEW for VEND-ID-205 MISSING** |
| Classification | **Control Failure** (CTRL-VND-001) — failure is the absence of required artefacts at the fourth-party level |
| AI Signal | AI-009 (Vendor performance signal aggregation + sub-contractor changes; confidence 0.81; τ_review 0.65; routed to PERSONA-002 review) |
| Issue / Action | Issue ISS-2026-027-extension — root cause: VEND-2024-00203 DDQ declared no fourth-party (false / stale); owner: Head of VMO + CISO; OBL-ID exposed: **OBL-RBI-017, OBL-RBI-016, OBL-RBI-020**; RBI reporting risk: ITGRCA review pickup (CSITE) and Op-Resilience critical-operations re-mapping (`OBL-RBI-040` / `OBL-RBI-041`); CTRL-ITO-002 must re-evaluate privileged access for VEND-2024-00205 |

---

## 12. Correlation Failure Types

### 12.1 Failure Taxonomy Table

| # | Failure Type | Meaning | Concrete Indian Banking Example | Impact on ControlInstance | Correct Platform Label |
|---|---|---|---|---|---|
| 1 | **Missing primary key** | Anchor key absent on a record that should carry it | CBS activation event received with no UCIC due to BPO migration artefact (legacy IDs not back-filled) | ControlInstance cannot be evaluated for the affected ProcessExecution | **Data Gap** |
| 2 | **Duplicate process execution** | Same anchor produces two PE records | AML engine generates duplicate `alert_id` on CBS failover batch replay; Mantas mis-deduplication after CDC catch-up | Double-counted CES denominator; false-Pass on dup | **Correlation Warning** (escalates to Data Gap if the two diverge) |
| 3 | **Orphan record** | Source record exists but cannot be joined to any anchor | CKYCR ack with `ckycr_no` has no matching UCIC in CBS — branch raised account in a parallel system not yet migrated | Excluded from CES denominator and numerator; routed to orphan queue (Rule 8) | **Correlation Warning** (`orphan` classification per Rule 9) |
| 4 | **Late-arriving record** | Record arrives after dependent decision is taken | Bureau pull response arrives T+2 d due to API timeout; LOS already shows `policy_decision = approve` taken on partial bureau set | CTRL-LND-001: from Pass to Fail when reconciled; can corrupt earlier CES if not retro-corrected | **Control Failure** (substantive) plus **Evidence Gap** (timing) |
| 5 | **Timestamp reversal** | Time-ordering rule violated by clock drift | `kfs_issued_at` recorded AFTER `borrower_acceptance_at` due to LOS app-server clock drift +3 min vs e-sign — AI-013 fires as **false positive** | False Fail; ~110 such cases per quarter at typical mid-sized PB | **Correlation Warning** (true control evaluation requires NTP-corrected timestamps) |
| 6 | **Name / ID mismatch across systems** | Same entity with different name / ID variants | Vendor name is "Infosys BPO" in VMO, "Infosys Limited" in contract repo, "Infosys Ltd." in MCA portal — fourth-party match breaks (Rule 5 violation) | Fourth-party discovery breaks; VEND-2024-00205-class issues hidden | **Correlation Warning** |
| 7 | **Partial extract from BPO batch** | Batch upload truncated | L1 disposition batch from BPO truncated at 10,000 rows — remaining alerts appear as Data Gap; SLA clocks tick on uncovered alerts | CTRL-AML-002 mass Data Gap; CES grey | **Data Gap** |
| 8 | **Manual override without evidence** | Override flag set but supporting record absent | Branch Manager overrides EDD requirement on UCIC (e.g., a high-risk political-figure UCIC) with no `approver_id` recorded in CBS; ControlInstance status = override but no EvidenceRecord | CTRL-KYC-005: Pass-with-override but no defence | **Evidence Gap** (escalates to **Control Failure** under AFI scrutiny) |
| 9 | **Source system clock drift** | System clocks not NTP-synchronised | CBS application server clock drifts +47 min vs AML engine; all `txn_at` ↔ `alert_generated_at` timestamp-ordering rules for the affected window are unreliable | Bulk Correlation Warning across CTRL-AML-001 / CTRL-AML-005 | **Correlation Warning** |
| 10 | **Schema version mismatch** | Source-system upgrade silently changes field names / types | Finacle CBS upgrade renames `IRACP_TAG` to `IRAC_TAG`; platform join breaks silently for new records | CTRL-LND-004 mass Data Gap until fixed | **Data Gap** (with high-priority schema-mismatch alert) |
| 11 | **Many-to-one join ambiguity** | Multiple source rows match one target | Multiple AML alerts for same UCIC in same window — STR filing must link to the correct `alert_id`, not any alert | CTRL-AML-003 STR-to-alert linkage ambiguity | **Correlation Warning** (escalate to **Needs Review**) |
| 12 | **One-to-many join ambiguity** | One source row matches multiple targets | One bureau `pull_id` maps to two `loan_application_id`s in LOS (mis-config in LOS bureau-binding) — which loan owns the bureau evidence? | CTRL-LND-001 evidence ambiguity | **Correlation Warning** (escalate to **Needs Review**) |

### 12.2 Escalation Decision Rules

| Label | Escalates To | Escalation Trigger | PERSONA Notified | RBI / PMLA Reporting Risk |
|---|---|---|---|---|
| **Data Gap** | Issue (auto-created if rate >5% of population for control) | Population test shows ≥5% of expected ControlInstances cannot be evaluated due to missing source rows | PERSONA-002 (CCO / IT Risk owner of source system); PERSONA-003 (auditor for workpaper) | If on KYC / AML / Lending core controls: **AFI MRA risk on data integrity**; on IT controls: **CSITE / ITGRCA risk** |
| **Evidence Gap** | Issue (auto-created if rate >2% of fired ControlInstances for the control) | Pass logic met but EvidenceRecord absent / partial / orphaned at >2% rate | PERSONA-002 (CCO + relevant function); PERSONA-003 (workpaper) | **PMLA Rule 9 retention risk** (5-yr reconstructable chain); FIU-IND audit risk; AFI evidence-completeness MRA |
| **Control Failure** | Issue (auto-created always) | Pass logic violated for any ControlInstance | All three personas (PERSONA-001 escalation if material; PERSONA-002 owner; PERSONA-003 workpaper) | Direct **OBL-RBI / OBL-PMLA breach**; AFI MRA / MRIA; potential Sec 47A; PMLA s.13 referral if AML; reputational if Conduct |
| **Correlation Warning** | Needs Review queue | Any of failure types 2 / 3 / 5 / 6 / 9 / 11 / 12 detected | PERSONA-002 (data lineage owner); PERSONA-003 (concurrent audit daily orphan-queue review) | Lower direct risk but **AFI workpaper-reproducibility risk** (the test cannot be re-run defensibly) |
| **Needs Review** | PERSONA-003 daily review (concurrent audit) | Correlation Warning aged > 24 h or escalated by classifier | PERSONA-003 + PERSONA-002 if material | Cumulative — ungoverned Needs Review backlog signals data-control immaturity (AFI red flag) |

---

## 13. Final Summary

### 13.1 Per-Process Summary Table

| Process | Primary Anchor Key | Closure Event | Hardest Join | Most Fragile Correlation | Control Most Affected | RBI / PMLA Reporting Risk | Recommended Next Data Action |
|---|---|---|---|---|---|---|---|
| **KYC / Customer Onboarding (PROC-KYC-001)** | `ucic` | CBS `ACCT_OPN_EVT` activation + CKYCR ack | UCIC ↔ CKYCR `ckycr_no` (post-amendment / re-upload chain) | `re_kyc_due_date` schedule for DBT / scholarship cohort (UCIC-2024-00127 archetype; AI-016) | **CTRL-KYC-003** (periodic re-KYC) | OBL-RBI-002 → AFI MRA on KYC governance (Paytm PB Jan-2024 archetype) | Fix risk engine `RISK_RATING.NEXT_REKYC_DT` default for `dbt_flag=TRUE`; back-fill the 660 cohort UCICs in Trace 1 |
| **AML Monitoring (PROC-AML-001)** | `alert_id` | FIU-IND `STR_ACK` (or `case_closed` for cleared) | Suspicion-conclusion timestamp ↔ STR file timestamp under PMLA s.12(1)(b) | BPO L1 SLA → suspicion-conclusion clock (AML-ALRT-2024-00502 archetype) | **CTRL-AML-002 → CTRL-AML-003** | OBL-PMLA-001 / OBL-PMLA-003 → PMLA s.13 referral (HSBC-India-Feb-2025 archetype) | Stand up BPO SLA clock monitor + L1-disposition push API; auto-fetch FINnet 2.0 ack |
| **Digital Lending / Loan Origination (PROC-LND-001)** | `loan_application_id` | CBS `LOAN_MAST` booking event (or adverse-action + CIMS for declines) | KFS-issuance ↔ borrower-acceptance timestamp ordering (AI-013) | DSA channel KFS-after-acceptance pattern (DL-APP-2024-00884 archetype) | **CTRL-LND-002** (and downstream **CTRL-LND-005** CIMS) | OBL-RBI-022 / OBL-RBI-025 / OBL-RBI-024 → cease-and-desist on specific DLA products (Bajaj Finance Nov-2023 archetype) | NTP-correct LOS event capture; gate LOS to refuse acceptance event before KFS-issuance event; CIMS reconciliation for declines |
| **Vendor Onboarding (PROC-VND-001)** | `vendor_request_id` | VMO `FINAL_APPROVAL` + RBI intimation (material) | Parent-vendor ↔ fourth-party SaaS chain (VEND-2024-00205 archetype) | Fourth-party discovery vs DDQ self-declaration (AI-009) | **CTRL-VND-001 / CTRL-VND-002 → CTRL-ITO-002** | OBL-RBI-016 / 017 / 018 / 019 / 049 → ITGRCA / CSITE thematic review pickup | Annual fourth-party rediscovery via AI-009 + CVE feed; tighten DDQ → contract clause → ongoing monitoring chain |

### 13.2 Closing Narrative

**Pass 1 — Persona and Goals — established the regulatory and persona scaffolding** that every byte of correlation work in Pass 2 sits on. Three personas (PERSONA-001 CRO / MD&CEO / BRMC Chair, PERSONA-002 CCO / Head of ORM / MLRO–PO / Head of FC / Head of IT Risk, PERSONA-003 Compliance Officer / IA Manager / Concurrent Auditor); fourteen design principles led by *evidence-first*, *control operation over documentation*, *population testing*, and *bi-temporality*; ten platform outcomes (`OUT-001` Process Auditability through `OUT-010` AI Trust); top product questions (`Q-CRO`, `Q-CCO`, `Q-IA`); and obligation IDs (`OBL-RBI-001` onward) anchored to real RBI Master Directions, PMLA sections, and FIU-IND rules. Everything correlation-related in Pass 2 was specified to satisfy a question or an obligation declared in Pass 1.

**Pass 2 — this document — established how raw CBS / LOS / AML engine / CKYCR / FIU-IND / NPCI records become correlated, audit-grade, PMLA-Rule-9-defensible, AFI-ready truth.** Six entities (SourceRecord, ProcessExecution, StepExecution, ControlInstance, EvidenceRecord, Issue); ten correlation principles led by anchor-key primacy and Aadhaar-hash-only joins; per-process master-entity tables, cross-system join maps, and stage-level correlation tables for KYC / AML / Digital Lending / Vendor Onboarding; ControlInstance generation logic for `CTRL-KYC-001` to `CTRL-VND-002` with the four non-interchangeable outcomes (Pass, Fail, Data Gap, Evidence Gap); EvidenceRecord typology across `EVD-LOG / EVD-DOC / EVD-ATTEST / EVD-SIGN / EVD-RECON / EVD-CALL / EVD-IMG / EVD-BIO`; CES arithmetic worked through CTRL-KYC-003 / CTRL-AML-003 / CTRL-LND-002 with explicit numbers; audit traceability traces from aggregate CES to source records for UCIC-2024-00127 / AML-ALRT-2024-00502 / DL-APP-2024-00884 / VEND-2024-00205; and a twelve-type correlation-failure taxonomy with clean escalation rules. The pack is reproducible: any ControlInstance in this document can be re-run next quarter against the same anchors and yield the same answer, which is the only standard that survives RBI AFI workpaper scrutiny.

**Pass 3 — Product Ontology — should focus on making this correlation logic executable as a bi-temporal, append-only knowledge graph.** Specifically, Pass 3 must formalise: (i) the `valid_time` / `system_time` bi-temporal entities so that "what we knew at what moment" is queryable for senior-management accountability (`OUT-005`) and AFI defence; (ii) the `Decision`, `Attestation`, and `SeniorManager` event-node types so that the reasonable-steps file for the MD&CEO / CRO / CCO / MLRO / CISO / HIA is graph-resident, not retrofitted; (iii) `AIInsight` as a first-class node with `Model { id, version, training_data_id }` provenance and an :EVIDENCED_BY edge to source records, satisfying `OUT-010` (AI Trust) and ITGRCA model-risk expectations; and (iv) the append-only, hash-chained evidence ledger that turns Pass 2's correlation logic into production-grade inspection readiness — every `ControlInstance.outcome`, every `EvidenceRecord.status`, every Issue lifecycle transition becomes an immutable graph event with full lineage back to a SourceRecord.

**Pass 3 is the bridge from Pass 2's data-correlation clarity to a regulator-ready, bi-temporal graph that survives an RBI AFI under Section 35 of the Banking Regulation Act, a PMLA Rule 9 record-reconstruction audit, and a Section 47A senior-management accountability review — the three tests this platform exists to pass.**
