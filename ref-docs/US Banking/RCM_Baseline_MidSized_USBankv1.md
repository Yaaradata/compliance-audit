# Risk & Control Matrix (RCM) — Canonical Baseline
## Mid-Sized US Bank | Six Anchor Processes

**Document version:** 1.0  
**Generated:** 2026-04-25  
**Companion artifact:** `RCM_Baseline_MidSized_USBank.xlsx` (identical content, structured for ingestion)

**Purpose.** This document is the canonical RCM baseline for a mid-sized US commercial bank (~$10B–$50B assets, OCC/Fed/FDIC-regulated). It is structured to be ingested by downstream design and engineering work — generating JSON Schemas, data-model DDL, persona-by-view UI wireframes, and platform specifications in subsequent chats. Every field in this document maps 1:1 to a column in the companion Excel artifact.

**Coverage.**

- **60 controls** across 6 anchor processes (10 per process)
- **60 risks** mapped to controls
- **51 regulatory obligations** with citations
- **64 Key Risk Indicators (KRIs)** with thresholds and current values
- **22 sample open issues** linked to controls and risks
- **15 risk-appetite metrics** with current status

**ID conventions.**

| Entity | Pattern | Example |
|---|---|---|
| Control | `<PROC>-C<NNN>` | `WP-C001` (Wire Payments), `CO-C001` (Customer Onboarding), `AML-C001`, `VO-C001`, `MV-C001`, `LO-C001` |
| Risk | `R-<DOMAIN>-<NNN>` | `R-OP-001` (Operational), `R-FC-001` (Financial Crime), `R-MR-001` (Model), `R-CR-001` (Credit), `R-CC-001` (Compliance & Conduct), `R-TP-001` (Third-Party) |
| Obligation | `OBL-<SOURCE>-<NNN>` | `OBL-BSA-001`, `OBL-OFAC-001`, `OBL-SR117-001` |
| KRI | `KRI-<DOMAIN>-<NNN>` | `KRI-OP-001` |
| Issue | `ISS-<YYYY>-<NNN>` | `ISS-2026-001` |
| Appetite metric | `RA-<DOMAIN>-<NNN>` | `RA-OP-001` |

**Cross-references.** Multi-value cells use `;` as the delimiter (e.g., `OBL-BSA-001;OBL-OFAC-001`).

**Controlled vocabularies (enums).**

| Field | Allowed values |
|---|---|
| Control Type | Preventive · Detective · Corrective |
| Control Nature | Manual · Automated · ITDM (IT-Dependent Manual) |
| Control Frequency | Per-event · Continuous · Daily · Weekly · Monthly · Quarterly · Annual · Risk-based |
| Inherent Risk · Residual Risk | High · Medium · Low |
| Last Test Result | Effective · Effective with Observations · Needs Improvement · Ineffective · Not Tested |
| Status (Control) | Active · Retired · Pending |
| Issue Status | Open · In Remediation · In Validation · Closed · Past Due |
| KRI Trend | Improving · Stable · Worsening |
| Risk Domain | Operational · Financial Crime · Model · Credit · Compliance & Conduct · Third-Party / Vendor · Technology, Cyber & Data |

---

## Table of Contents

1. [Schema — canonical field dictionary](#1-schema--canonical-field-dictionary)
2. [Control register by process](#2-control-register-by-process)
   - [2.1 Wire Payments](#21-wire-payments)
   - [2.2 Customer Onboarding](#22-customer-onboarding)
   - [2.3 AML Alert Disposition](#23-aml-alert-disposition)
   - [2.4 Vendor Onboarding](#24-vendor-onboarding)
   - [2.5 Model Validation](#25-model-validation)
   - [2.6 Loan Origination](#26-loan-origination)
3. [Risk register](#3-risk-register)
4. [Obligation register](#4-obligation-register)
5. [KRI register](#5-kri-register)
6. [Issue register](#6-issue-register)
7. [Risk appetite register](#7-risk-appetite-register)
8. [Ingestion notes for downstream chats](#8-ingestion-notes-for-downstream-chats)

---

## 1. Schema — canonical field dictionary

This is the contract for every downstream design artifact (JSON Schema, DDL, API, UI bindings). Field names and types here are normative.

### Entity: `Control`

| Field | Type | Required | Enum / Format | Description |
|---|---|---|---|---|
| Control ID | string | Yes | ^[A-Z]{2,4}-C\d{3}$ | Unique stable identifier |
| Process | string | Yes | Enum: Wire Payments \| Customer Onboarding \| AML Alert Disposition \| Vendor Onboarding \| Model Validation \| Loan Origination | Top-level process |
| Sub-Process | string | Yes | free text | Sub-process / activity within the process |
| Risk Domain | string | Yes | Enum: Operational Risk \| Financial Crime Risk \| Model Risk \| Credit Risk \| Compliance & Conduct Risk \| Third-Party / Vendor Risk \| Technology, Cyber & Data Risk | Enterprise risk domain |
| Control Title | string | Yes | <= 120 chars | Short human-readable name |
| Control Description | string | Yes | free text | What the control does, when, how |
| Control Type | string | Yes | Enum: Preventive \| Detective \| Corrective | Control type |
| Control Nature | string | Yes | Enum: Manual \| Automated \| ITDM | Manual / Automated / IT-Dependent Manual |
| Control Frequency | string | Yes | Enum: Per-event \| Per-transaction \| Per-account \| Per-customer \| Per-loan \| Per-vendor \| Per-model \| Per-case \| Daily \| Weekly \| Monthly \| Quarterly \| Bi-Annual \| Annual \| Continuous \| Cyclical | How often the control operates |
| Risk ID | string | Yes | FK → Risk.Risk ID | Primary risk mitigated |
| Risk Description | string | Yes | free text | Cached description for readability |
| Inherent Risk | string | Yes | Enum: High \| Medium \| Low | Pre-control rating |
| Residual Risk | string | Yes | Enum: High \| Medium \| Low | Post-control rating |
| Obligation IDs | string[] | No | semicolon-separated; FK → Obligation.Obligation ID | Linked obligations |
| Control Owner (1LoD) | string | Yes | free text | Accountable executive (1LoD) |
| Control Operator | string | Yes | free text | Team / system that runs the control |
| 2LoD Oversight | string | Yes | free text | 2LoD function providing oversight |
| 3LoD Audit Cycle | string | Yes | Enum: Annual \| Bi-Annual \| Tri-Annual \| Risk-Based | Internal audit cycle |
| Evidence Source | string | Yes | free text | Where evidence of operation lives |
| Testing Approach | string | Yes | free text | How effectiveness is tested |
| Last Tested | date | No | YYYY-MM-DD | Date of last test |
| Last Test Result | string | No | Enum: Effective \| Effective with Observations \| Needs Improvement \| Ineffective \| Not Tested | Result of last test |
| Linked KRI IDs | string[] | No | semicolon-separated; FK → KRI.KRI ID | Related KRIs |
| Open Issue IDs | string[] | No | semicolon-separated; FK → Issue.Issue ID | Open issues / actions |
| Status | string | Yes | Enum: Active \| Retired \| Pending | Lifecycle status |

### Entity: `Risk`

| Field | Type | Required | Enum / Format | Description |
|---|---|---|---|---|
| Risk ID | string | Yes | ^R-[A-Z]{2}-\d{3}$ | Unique stable identifier |
| Risk Domain | string | Yes | Enum (see Control) | Risk domain |
| Risk Title | string | Yes | <= 80 chars | Short title |
| Risk Description | string | Yes | free text | Description |
| Inherent Likelihood | string | Yes | Enum: High \| Medium \| Low | Pre-control likelihood |
| Inherent Impact | string | Yes | Enum: High \| Medium \| Low | Pre-control impact |
| Inherent Rating | string | Yes | Enum: High \| Medium \| Low | Pre-control rating |
| Residual Likelihood | string | Yes | Enum: High \| Medium \| Low | Post-control likelihood |
| Residual Impact | string | Yes | Enum: High \| Medium \| Low | Post-control impact |
| Residual Rating | string | Yes | Enum: High \| Medium \| Low | Post-control rating |
| Risk Owner | string | Yes | free text | Accountable executive |
| Linked Process | string | Yes | Enum (Process) | Primary linked process |
| Linked Control IDs | string[] | Yes | semicolon-separated; FK → Control.Control ID | Controls mitigating this risk |

### Entity: `Obligation`

| Field | Type | Required | Enum / Format | Description |
|---|---|---|---|---|
| Obligation ID | string | Yes | OBL-… | Unique identifier |
| Source / Regulation | string | Yes | free text | Originating regulation |
| Section / Citation | string | Yes | free text | Specific section |
| Atomic Requirement | string | Yes | free text | Testable, atomic statement |
| Jurisdiction | string | Yes | Enum: US \| UK \| India | Jurisdiction |
| Linked Control IDs | string[] | Yes | semicolon-separated; FK → Control.Control ID | Controls covering this obligation |

### Entity: `KRI`

| Field | Type | Required | Enum / Format | Description |
|---|---|---|---|---|
| KRI ID | string | Yes | KRI-… | Unique identifier |
| KRI Name | string | Yes | free text | Name |
| Description | string | Yes | free text | Description |
| Linked Risk IDs | string[] | Yes | semicolon-separated | Risks this KRI tracks |
| Source System | string | Yes | free text | System where the metric is computed |
| Frequency | string | Yes | Enum: Daily \| Weekly \| Monthly \| Quarterly \| Annual \| Per-event \| Per-update | Computation cadence |
| Green | string | Yes | free text | Green threshold |
| Amber | string | Yes | free text | Amber threshold |
| Red | string | Yes | free text | Red threshold |
| Current Value | string | No | free text | Latest observation |
| Trend | string | No | Enum: Improving \| Stable \| Worsening | Direction of travel |
| Linked Control IDs | string[] | Yes | semicolon-separated | Controls informed by this KRI |

### Entity: `Issue`

| Field | Type | Required | Enum / Format | Description |
|---|---|---|---|---|
| Issue ID | string | Yes | ISS-YYYY-NNN | Unique identifier |
| Title | string | Yes | <= 120 chars | Short title |
| Source | string | Yes | Enum: Internal Audit \| Regulatory \| Self-Identified \| 2LoD QA \| External Audit \| Other | Source |
| Severity | string | Yes | Enum: High \| Medium \| Low | Severity |
| Linked Control IDs | string[] | Yes | semicolon-separated | Affected controls |
| Linked Risk IDs | string[] | Yes | semicolon-separated | Affected risks |
| Root Cause | string | Yes | free text | Documented root cause |
| Owner | string | Yes | free text | Accountable owner |
| Date Raised | date | Yes | YYYY-MM-DD | Raised on |
| Due Date | date | Yes | YYYY-MM-DD | Target closure date |
| Status | string | Yes | Enum: Open \| In Remediation \| In Validation \| Closed \| Past Due | Lifecycle status |
| Days Open | integer | No | >= 0 | Days since raised |
| Description | string | Yes | free text | Description and remediation plan |

### Entity: `RiskAppetite`

| Field | Type | Required | Enum / Format | Description |
|---|---|---|---|---|
| Appetite ID | string | Yes | APP-… | Unique identifier |
| Risk Domain | string | Yes | Enum (see Control) | Domain |
| Metric | string | Yes | free text | Appetite metric |
| Linked Risk IDs | string[] | Yes | semicolon-separated | Linked risks |
| Green Threshold | string | Yes | free text | Green band |
| Amber Threshold | string | Yes | free text | Amber band |
| Red Threshold | string | Yes | free text | Red band |
| Current Status | string | Yes | Enum: Green \| Amber \| Red | Current status |
| Owner | string | Yes | free text | Owner |

---

## 2. Control register by process

60 controls in total, 10 per process. Each control row carries the full attribute set defined in the schema above. Long fields (description, evidence, testing approach) are rendered as nested bullets to keep the row table readable; the Excel artifact carries them as native cells.

### 2.1 Wire Payments

_Domestic and international wire transfers initiated through the bank's payment hub (Fedwire / SWIFT). Highest-velocity, highest-loss-severity payment channel; subject to UCC Article 4A, OFAC sanctions, and FFIEC Wholesale Payment Systems guidance._

**Summary table.**

| Control ID | Title | Type | Nature | Freq. | Inherent | Residual | Risk ID | Last Test |
|---|---|---|---|---|---|---|---|---|
| `WP-C001` | Maker-checker on wire release | Preventive | ITDM | Per-wire | High | Low | `R-OP-001` | Effective |
| `WP-C002` | Real-time sanctions screening on outgoing wires | Preventive | Automated | Per-wire | High | Low | `R-FC-002` | Effective |
| `WP-C003` | Beneficiary callback for new payees above threshold | Preventive | Manual | Per-wire | High | Medium | `R-FC-003` | Effective with Observations |
| `WP-C004` | Payment limit enforcement at user and account level | Preventive | Automated | Per-wire | Medium | Low | `R-OP-002` | Effective |
| `WP-C005` | Real-time fraud scoring on wire transactions | Preventive | Automated | Per-wire | High | Medium | `R-FC-004` | Effective |
| `WP-C006` | Daily nostro reconciliation | Detective | ITDM | Daily | High | Low | `R-OP-003` | Effective |
| `WP-C007` | Wire payment exception aging monitoring | Detective | Automated | Daily | Medium | Low | `R-OP-004` | Effective |
| `WP-C008` | OFAC blocked / rejected transaction reporting | Corrective | Manual | Per-event / Annual | Medium | Low | `R-FC-005` | Effective |
| `WP-C009` | Wire payment recall procedures | Corrective | Manual | Per-event | Medium | Medium | `R-OP-005` | Effective with Observations |
| `WP-C010` | SWIFT message validation pre-release | Preventive | Automated | Per-wire | Medium | Low | `R-OP-006` | Effective |

**Control detail.**

#### `WP-C001` — Maker-checker on wire release

- **Sub-Process:** Wire Release
- **Risk Domain:** Operational Risk
- **Description:** All outgoing wires require an independent second approver in the payment hub before SWIFT/Fedwire release. System enforces segregation between maker and checker.
- **Type / Nature / Frequency:** Preventive · ITDM · Per-wire
- **Risk mitigated:** `R-OP-001` — Erroneous or unauthorised wire released to an external counterparty
- **Inherent → Residual:** High → Low
- **Linked obligations:** OBL-UCC4A-001;OBL-FFIEC-WPS-001
- **Ownership:** 1LoD = Head of Payment Operations; Operator = Payment Operations Team; 2LoD = Operational Risk; 3LoD audit cycle = Annual
- **Evidence source:** Payment hub approval logs; SWIFT confirmation messages
- **Testing approach:** Population reperformance — monthly sample of 50 wires reviewed for dual approval
- **Last tested:** 2026-03-15 — _Effective_
- **Linked KRIs:** KRI-OP-001;KRI-OP-002
- **Status:** Active

#### `WP-C002` — Real-time sanctions screening on outgoing wires

- **Sub-Process:** Sanctions Screening
- **Risk Domain:** Financial Crime Risk
- **Description:** Every outgoing wire is screened against OFAC SDN, sectoral sanctions, and bank's internal watchlists pre-release. True hits route to Sanctions Investigations.
- **Type / Nature / Frequency:** Preventive · Automated · Per-wire
- **Risk mitigated:** `R-FC-002` — Payment processed to an OFAC-sanctioned party
- **Inherent → Residual:** High → Low
- **Linked obligations:** OBL-OFAC-001;OBL-OFAC-002
- **Ownership:** 1LoD = Head of Sanctions Compliance; Operator = Sanctions Screening Engine + L1 Investigations; 2LoD = Financial Crime Compliance; 3LoD audit cycle = Annual
- **Evidence source:** Screening tool match logs; investigator dispositions
- **Testing approach:** Daily false-negative testing using known-positive synthetic transactions
- **Last tested:** 2026-04-02 — _Effective_
- **Linked KRIs:** KRI-FC-001;KRI-FC-002
- **Open issues:** ISS-2026-007
- **Status:** Active

#### `WP-C003` — Beneficiary callback for new payees above threshold

- **Sub-Process:** Beneficiary Verification
- **Risk Domain:** Financial Crime Risk
- **Description:** Wires above $250K to a previously unused beneficiary require an out-of-band callback to the originating client using a number on file (not the request).
- **Type / Nature / Frequency:** Preventive · Manual · Per-wire
- **Risk mitigated:** `R-FC-003` — Business email compromise (BEC) fraud causing customer loss
- **Inherent → Residual:** High → Medium
- **Linked obligations:** OBL-FFIEC-AUTH-001
- **Ownership:** 1LoD = Head of Payment Operations; Operator = Payment Operations Team; 2LoD = Fraud Risk; 3LoD audit cycle = Annual
- **Evidence source:** Callback log; recorded line if applicable; case management note
- **Testing approach:** Quarterly QA sample of 30 callbacks; calibration session
- **Last tested:** 2026-02-20 — _Effective with Observations_
- **Linked KRIs:** KRI-FC-003
- **Open issues:** ISS-2026-012
- **Status:** Active

#### `WP-C004` — Payment limit enforcement at user and account level

- **Sub-Process:** Authority & Limits
- **Risk Domain:** Operational Risk
- **Description:** User entitlements and per-account daily limits are enforced at the payment hub. Attempts above limit are blocked and logged.
- **Type / Nature / Frequency:** Preventive · Automated · Per-wire
- **Risk mitigated:** `R-OP-002` — Wire executed beyond authorised limit
- **Inherent → Residual:** Medium → Low
- **Linked obligations:** OBL-INTERNAL-AUTH-001
- **Ownership:** 1LoD = Head of Payment Operations; Operator = Payment Hub (system); 2LoD = Operational Risk; 3LoD audit cycle = Annual
- **Evidence source:** Entitlement reports; blocked-transaction logs
- **Testing approach:** Quarterly entitlement review with HR feed reconciliation
- **Last tested:** 2026-03-31 — _Effective_
- **Linked KRIs:** KRI-OP-003
- **Status:** Active

#### `WP-C005` — Real-time fraud scoring on wire transactions

- **Sub-Process:** Fraud Screening
- **Risk Domain:** Financial Crime Risk
- **Description:** ML-based fraud model scores each wire on behavioural, device, and counterparty signals. Scores above threshold trigger step-up authentication or hold.
- **Type / Nature / Frequency:** Preventive · Automated · Per-wire
- **Risk mitigated:** `R-FC-004` — Authorised push payment fraud / account takeover wire fraud
- **Inherent → Residual:** High → Medium
- **Linked obligations:** OBL-FFIEC-AUTH-001
- **Ownership:** 1LoD = Head of Fraud Operations; Operator = Fraud Detection System + Fraud Analysts; 2LoD = Fraud Risk; Model Risk; 3LoD audit cycle = Annual
- **Evidence source:** Model scoring logs; case management dispositions
- **Testing approach:** Monthly model performance monitoring; quarterly champion-challenger review
- **Last tested:** 2026-04-10 — _Effective_
- **Linked KRIs:** KRI-FC-004;KRI-MR-001
- **Status:** Active

#### `WP-C006` — Daily nostro reconciliation

- **Sub-Process:** Reconciliation
- **Risk Domain:** Operational Risk
- **Description:** All nostro accounts reconciled daily between SWIFT MT940/MT950, payment hub, and GL. Breaks aged and escalated per policy.
- **Type / Nature / Frequency:** Detective · ITDM · Daily
- **Risk mitigated:** `R-OP-003` — Unidentified payment break leading to financial loss or misstatement
- **Inherent → Residual:** High → Low
- **Linked obligations:** OBL-OCC-CH-001
- **Ownership:** 1LoD = Head of Reconciliation Operations; Operator = Reconciliation Operations Team; 2LoD = Operational Risk; Finance Control; 3LoD audit cycle = Annual
- **Evidence source:** Recon tool break reports; aging dashboard
- **Testing approach:** Monthly review of recon performance; quarterly aged-item review
- **Last tested:** 2026-03-25 — _Effective_
- **Linked KRIs:** KRI-OP-004
- **Open issues:** ISS-2026-018
- **Status:** Active

#### `WP-C007` — Wire payment exception aging monitoring

- **Sub-Process:** Exception Management
- **Risk Domain:** Operational Risk
- **Description:** Wires held in exception queues (sanctions, fraud, format, repair) are tracked by age. Exceptions older than SLA escalate automatically to supervisor and Risk.
- **Type / Nature / Frequency:** Detective · Automated · Daily
- **Risk mitigated:** `R-OP-004` — Stale unresolved exceptions causing customer harm or regulatory delay
- **Inherent → Residual:** Medium → Low
- **Linked obligations:** OBL-INTERNAL-SLA-001
- **Ownership:** 1LoD = Head of Payment Operations; Operator = Payment Operations Team; 2LoD = Operational Risk; 3LoD audit cycle = Annual
- **Evidence source:** Exception dashboard; escalation emails; supervisor sign-off
- **Testing approach:** Monthly KRI review at Ops Risk Forum
- **Last tested:** 2026-04-05 — _Effective_
- **Linked KRIs:** KRI-OP-005
- **Status:** Active

#### `WP-C008` — OFAC blocked / rejected transaction reporting

- **Sub-Process:** Sanctions Reporting
- **Risk Domain:** Financial Crime Risk
- **Description:** Blocked or rejected transactions are reported to OFAC within 10 business days; annual blocked property report filed by 30 September.
- **Type / Nature / Frequency:** Corrective · Manual · Per-event / Annual
- **Risk mitigated:** `R-FC-005` — Late or unfiled OFAC blocked-transaction report
- **Inherent → Residual:** Medium → Low
- **Linked obligations:** OBL-OFAC-003
- **Ownership:** 1LoD = Head of Sanctions Compliance; Operator = Sanctions Compliance Team; 2LoD = Financial Crime Compliance; 3LoD audit cycle = Annual
- **Evidence source:** OFAC submission receipts; internal filing log
- **Testing approach:** Quarterly review of filing log against blocked events
- **Last tested:** 2026-01-30 — _Effective_
- **Linked KRIs:** KRI-FC-005
- **Status:** Active

#### `WP-C009` — Wire payment recall procedures

- **Sub-Process:** Recall & Recovery
- **Risk Domain:** Operational Risk
- **Description:** Documented recall playbook for erroneous/fraudulent wires. Recall request initiated within 24h; supervisor approval and counterparty notification logged.
- **Type / Nature / Frequency:** Corrective · Manual · Per-event
- **Risk mitigated:** `R-OP-005` — Failure to recover funds from erroneous wire due to delayed action
- **Inherent → Residual:** Medium → Medium
- **Linked obligations:** OBL-UCC4A-002
- **Ownership:** 1LoD = Head of Payment Operations; Operator = Payment Operations Team; 2LoD = Operational Risk; 3LoD audit cycle = Annual
- **Evidence source:** Recall request log; correspondent bank correspondence
- **Testing approach:** Annual desktop walkthrough; post-event review for each recall
- **Last tested:** 2025-12-10 — _Effective with Observations_
- **Linked KRIs:** KRI-OP-006
- **Open issues:** ISS-2025-094
- **Status:** Active

#### `WP-C010` — SWIFT message validation pre-release

- **Sub-Process:** Message Validation
- **Risk Domain:** Operational Risk
- **Description:** Outgoing SWIFT messages are validated for syntax, mandatory fields, BIC validity, and structured remittance data before transmission.
- **Type / Nature / Frequency:** Preventive · Automated · Per-wire
- **Risk mitigated:** `R-OP-006` — Malformed SWIFT message causing rejection, delay or compliance gap
- **Inherent → Residual:** Medium → Low
- **Linked obligations:** OBL-FFIEC-WPS-002
- **Ownership:** 1LoD = Head of Payment Operations; Operator = Payment Hub (system); 2LoD = Operational Risk; 3LoD audit cycle = Bi-Annual
- **Evidence source:** Validation engine logs; rejected message reports
- **Testing approach:** Monthly review of rejection rates; annual config review
- **Last tested:** 2026-02-28 — _Effective_
- **Linked KRIs:** KRI-OP-007
- **Status:** Active

---

### 2.2 Customer Onboarding

_End-to-end onboarding for retail and commercial customers: CIP / identity verification, beneficial-ownership collection (CDD Rule), customer risk rating, sanctions and PEP screening, and EDD for high-risk relationships. Anchored in BSA §326, 31 CFR 1020.220, and 31 CFR 1010.230._

**Summary table.**

| Control ID | Title | Type | Nature | Freq. | Inherent | Residual | Risk ID | Last Test |
|---|---|---|---|---|---|---|---|---|
| `CO-C001` | Automated ID&V at account opening | Preventive | Automated | Per-account | High | Low | `R-FC-006` | Effective |
| `CO-C002` | Beneficial ownership collection for legal entities | Preventive | ITDM | Per-entity | High | Low | `R-FC-007` | Effective with Observations |
| `CO-C003` | Customer risk rating at onboarding | Detective | ITDM | Per-customer | High | Medium | `R-FC-008` | Effective |
| `CO-C004` | EDD performed for high-risk customers | Preventive | Manual | Per-customer | High | Medium | `R-FC-009` | Effective |
| `CO-C005` | Sanctions screening at onboarding | Preventive | Automated | Per-customer | High | Low | `R-FC-010` | Effective |
| `CO-C006` | PEP screening and senior approval | Detective | Automated | Per-customer | High | Medium | `R-FC-011` | Effective with Observations |
| `CO-C007` | Customer Identification Program (CIP) data completeness | Preventive | ITDM | Per-account | High | Low | `R-FC-012` | Effective |
| `CO-C008` | Negative news / adverse media screening | Detective | Automated | Per-customer | Medium | Medium | `R-FC-013` | Needs Improvement |
| `CO-C009` | Tax certification (W-8/W-9) capture and validation | Preventive | ITDM | Per-account | Medium | Low | `R-CC-001` | Effective |
| `CO-C010` | CDD documentation review and approval | Preventive | Manual | Per-customer | High | Low | `R-FC-014` | Effective |

**Control detail.**

#### `CO-C001` — Automated ID&V at account opening

- **Sub-Process:** Identity Verification
- **Risk Domain:** Financial Crime Risk
- **Description:** Vendor identity verification service (document + biometric + bureau) is called pre-funding. A pass is required to proceed; manual review on indeterminate.
- **Type / Nature / Frequency:** Preventive · Automated · Per-account
- **Risk mitigated:** `R-FC-006` — Account opened for a fictitious or stolen identity
- **Inherent → Residual:** High → Low
- **Linked obligations:** OBL-BSA-CIP-001;OBL-CFR-1020-220
- **Ownership:** 1LoD = Head of Retail Onboarding; Operator = Onboarding Ops + ID&V Vendor; 2LoD = Financial Crime Compliance; 3LoD audit cycle = Annual
- **Evidence source:** Vendor pass/fail logs; document images; bureau scores
- **Testing approach:** Monthly false-pass testing using synthetic test cases
- **Last tested:** 2026-03-12 — _Effective_
- **Linked KRIs:** KRI-FC-006
- **Status:** Active

#### `CO-C002` — Beneficial ownership collection for legal entities

- **Sub-Process:** Beneficial Ownership
- **Risk Domain:** Financial Crime Risk
- **Description:** For legal entity customers, all beneficial owners ≥25% and one control person are identified, verified, and certified per CDD Rule.
- **Type / Nature / Frequency:** Preventive · ITDM · Per-entity
- **Risk mitigated:** `R-FC-007` — Ultimate Beneficial Owner unidentified; entity used to hide control
- **Inherent → Residual:** High → Low
- **Linked obligations:** OBL-CFR-1010-230
- **Ownership:** 1LoD = Head of Commercial Onboarding; Operator = Commercial Onboarding Team; 2LoD = Financial Crime Compliance; 3LoD audit cycle = Annual
- **Evidence source:** Certification form; UBO records in CRM; verification evidence
- **Testing approach:** Quarterly sample testing of 25 entity files for completeness and verification
- **Last tested:** 2026-03-20 — _Effective with Observations_
- **Linked KRIs:** KRI-FC-007
- **Open issues:** ISS-2026-023
- **Status:** Active

#### `CO-C003` — Customer risk rating at onboarding

- **Sub-Process:** Risk Rating
- **Risk Domain:** Financial Crime Risk
- **Description:** Each new customer is risk-rated using a documented model considering geography, product, channel, occupation/industry, and PEP status. High-risk routes to EDD.
- **Type / Nature / Frequency:** Detective · ITDM · Per-customer
- **Risk mitigated:** `R-FC-008` — High-risk customer not flagged for Enhanced Due Diligence
- **Inherent → Residual:** High → Medium
- **Linked obligations:** OBL-FFIEC-BSA-001
- **Ownership:** 1LoD = Head of Financial Crime Compliance; Operator = Onboarding Ops; Risk Rating Engine; 2LoD = Financial Crime Compliance; Model Risk; 3LoD audit cycle = Annual
- **Evidence source:** Risk rating engine outputs; CRM customer profile
- **Testing approach:** Annual risk rating model validation; quarterly rating distribution review
- **Last tested:** 2026-02-15 — _Effective_
- **Linked KRIs:** KRI-FC-008
- **Status:** Active

#### `CO-C004` — EDD performed for high-risk customers

- **Sub-Process:** Enhanced Due Diligence
- **Risk Domain:** Financial Crime Risk
- **Description:** Customers rated high-risk receive documented EDD including source of wealth/funds, expected activity, and senior compliance approval before activation.
- **Type / Nature / Frequency:** Preventive · Manual · Per-customer
- **Risk mitigated:** `R-FC-009` — Inadequate due diligence on high-risk customer leading to undetected illicit activity
- **Inherent → Residual:** High → Medium
- **Linked obligations:** OBL-FFIEC-BSA-002
- **Ownership:** 1LoD = Head of Financial Crime Compliance; Operator = EDD Analyst Team; 2LoD = Financial Crime Compliance; 3LoD audit cycle = Annual
- **Evidence source:** EDD case files; senior compliance approval; documented rationale
- **Testing approach:** Monthly QA on 10% of EDD files; annual thematic review
- **Last tested:** 2026-04-08 — _Effective_
- **Linked KRIs:** KRI-FC-009
- **Open issues:** ISS-2026-031
- **Status:** Active

#### `CO-C005` — Sanctions screening at onboarding

- **Sub-Process:** Sanctions Screening
- **Risk Domain:** Financial Crime Risk
- **Description:** Prospective customers, related parties, and beneficial owners are screened against OFAC SDN, sectoral, and internal lists at onboarding.
- **Type / Nature / Frequency:** Preventive · Automated · Per-customer
- **Risk mitigated:** `R-FC-010` — Sanctioned party onboarded as customer
- **Inherent → Residual:** High → Low
- **Linked obligations:** OBL-OFAC-001
- **Ownership:** 1LoD = Head of Sanctions Compliance; Operator = Screening Engine + Sanctions L1; 2LoD = Financial Crime Compliance; 3LoD audit cycle = Annual
- **Evidence source:** Screening match logs; investigator dispositions
- **Testing approach:** Quarterly synthetic-positive testing; annual list-coverage validation
- **Last tested:** 2026-04-02 — _Effective_
- **Linked KRIs:** KRI-FC-010
- **Status:** Active

#### `CO-C006` — PEP screening and senior approval

- **Sub-Process:** PEP Screening
- **Risk Domain:** Financial Crime Risk
- **Description:** All onboarding customers screened against PEP databases. Confirmed PEPs require senior compliance approval and EDD before activation.
- **Type / Nature / Frequency:** Detective · Automated · Per-customer
- **Risk mitigated:** `R-FC-011` — Undeclared PEP exposure leading to reputational and AML risk
- **Inherent → Residual:** High → Medium
- **Linked obligations:** OBL-FFIEC-BSA-003
- **Ownership:** 1LoD = Head of Financial Crime Compliance; Operator = Screening Engine + EDD Team; 2LoD = Financial Crime Compliance; 3LoD audit cycle = Annual
- **Evidence source:** PEP match logs; senior approval emails; EDD case file
- **Testing approach:** Quarterly review of PEP population vs. screening output
- **Last tested:** 2026-03-18 — _Effective with Observations_
- **Linked KRIs:** KRI-FC-011
- **Status:** Active

#### `CO-C007` — Customer Identification Program (CIP) data completeness

- **Sub-Process:** CIP Data Capture
- **Risk Domain:** Financial Crime Risk
- **Description:** All required CIP data points (name, DOB, address, ID number for individuals; equivalent for entities) are captured before account activation.
- **Type / Nature / Frequency:** Preventive · ITDM · Per-account
- **Risk mitigated:** `R-FC-012` — Account activated with incomplete CIP data; regulatory finding
- **Inherent → Residual:** High → Low
- **Linked obligations:** OBL-BSA-CIP-001;OBL-CFR-1020-220
- **Ownership:** 1LoD = Head of Retail Onboarding; Operator = Onboarding Platform (system); 2LoD = Financial Crime Compliance; 3LoD audit cycle = Annual
- **Evidence source:** CRM customer record; system-enforced field validations
- **Testing approach:** Monthly population check on new accounts for CIP completeness
- **Last tested:** 2026-04-01 — _Effective_
- **Linked KRIs:** KRI-FC-012
- **Status:** Active

#### `CO-C008` — Negative news / adverse media screening

- **Sub-Process:** Adverse Media
- **Risk Domain:** Financial Crime Risk
- **Description:** Customers and beneficial owners are screened against adverse media databases at onboarding; relevant hits are documented and assessed.
- **Type / Nature / Frequency:** Detective · Automated · Per-customer
- **Risk mitigated:** `R-FC-013` — Onboarding customer with material adverse media indicating financial crime
- **Inherent → Residual:** Medium → Medium
- **Linked obligations:** OBL-FFIEC-BSA-004
- **Ownership:** 1LoD = Head of Financial Crime Compliance; Operator = Screening Engine + EDD Analyst; 2LoD = Financial Crime Compliance; 3LoD audit cycle = Annual
- **Evidence source:** Adverse media match log; analyst disposition note
- **Testing approach:** Quarterly QA sample on adverse media dispositions
- **Last tested:** 2026-02-25 — _Needs Improvement_
- **Linked KRIs:** KRI-FC-013
- **Open issues:** ISS-2026-040
- **Status:** Active

#### `CO-C009` — Tax certification (W-8/W-9) capture and validation

- **Sub-Process:** Tax Certification
- **Risk Domain:** Compliance & Conduct Risk
- **Description:** Appropriate IRS tax form is captured and validated at onboarding; expiry tracked. Customers without valid certification subject to backup withholding.
- **Type / Nature / Frequency:** Preventive · ITDM · Per-account
- **Risk mitigated:** `R-CC-001` — Failure to obtain valid tax certification leading to IRS penalty
- **Inherent → Residual:** Medium → Low
- **Linked obligations:** OBL-IRS-W8W9-001
- **Ownership:** 1LoD = Head of Tax Operations; Operator = Onboarding Ops + Tax Ops; 2LoD = Tax Compliance; 3LoD audit cycle = Bi-Annual
- **Evidence source:** Tax form images; validation log; expiry tracker
- **Testing approach:** Monthly population check; annual reconciliation against 1099/1042 reporting
- **Last tested:** 2026-03-08 — _Effective_
- **Linked KRIs:** KRI-CC-001
- **Status:** Active

#### `CO-C010` — CDD documentation review and approval

- **Sub-Process:** CDD Approval
- **Risk Domain:** Financial Crime Risk
- **Description:** Onboarding files are reviewed by a Compliance Officer (or system-driven workflow with documented exceptions) before account activation. Exceptions logged.
- **Type / Nature / Frequency:** Preventive · Manual · Per-customer
- **Risk mitigated:** `R-FC-014` — Account activated without complete CDD review; regulatory and reputational risk
- **Inherent → Residual:** High → Low
- **Linked obligations:** OBL-FFIEC-BSA-005
- **Ownership:** 1LoD = Head of Financial Crime Compliance; Operator = Onboarding QC + Compliance Officers; 2LoD = Financial Crime Compliance; 3LoD audit cycle = Annual
- **Evidence source:** Approval workflow logs; QC checklists; exception register
- **Testing approach:** Monthly QC sample of 50 files; quarterly thematic review
- **Last tested:** 2026-03-30 — _Effective_
- **Linked KRIs:** KRI-FC-014
- **Status:** Active

---

### 2.3 AML Alert Disposition

_Investigation lifecycle for transaction-monitoring alerts: triage, escalation, narrative documentation, SAR decisioning, and feedback into model tuning. Anchored in 31 CFR 1020.320, FFIEC BSA/AML Manual, and SR 11-7 (for monitoring models)._

**Summary table.**

| Control ID | Title | Type | Nature | Freq. | Inherent | Residual | Risk ID | Last Test |
|---|---|---|---|---|---|---|---|---|
| `AML-C001` | Transaction monitoring scenario coverage review | Preventive | Manual | Annual | High | Medium | `R-FC-015` | Effective with Observations |
| `AML-C002` | Alert disposition within SLA | Detective | ITDM | Per-alert | High | Medium | `R-FC-016` | Needs Improvement |
| `AML-C003` | SAR filing within 30/60 day window | Corrective | Manual | Per-SAR | High | Low | `R-FC-017` | Effective |
| `AML-C004` | AML transaction monitoring model annual validation | Detective | Manual | Annual | High | Medium | `R-MR-001` | Effective with Observations |
| `AML-C005` | Alert disposition quality assurance sampling | Detective | Manual | Monthly | Medium | Medium | `R-FC-018` | Effective |
| `AML-C006` | Investigator case documentation standards | Preventive | ITDM | Per-case | Medium | Low | `R-FC-019` | Effective |
| `AML-C007` | Tier 2 / Tier 3 escalation governance | Preventive | Manual | Per-escalation | High | Medium | `R-FC-020` | Effective |
| `AML-C008` | Customer risk re-rating post-investigation | Corrective | ITDM | Per-event | Medium | Low | `R-FC-021` | Effective |
| `AML-C009` | AML scenario threshold tuning governance | Preventive | Manual | Per-change | High | Low | `R-FC-022` | Effective |
| `AML-C010` | Above-the-line / below-the-line testing | Detective | Manual | Annual | High | Medium | `R-FC-023` | Effective with Observations |

**Control detail.**

#### `AML-C001` — Transaction monitoring scenario coverage review

- **Sub-Process:** Scenario Coverage
- **Risk Domain:** Financial Crime Risk
- **Description:** Annual review of AML monitoring scenarios against bank's risk assessment, products, and emerging typologies. Gaps documented and remediated.
- **Type / Nature / Frequency:** Preventive · Manual · Annual
- **Risk mitigated:** `R-FC-015` — Typology gap leaving illicit activity undetected
- **Inherent → Residual:** High → Medium
- **Linked obligations:** OBL-FFIEC-BSA-006
- **Ownership:** 1LoD = Head of Financial Crime Compliance; Operator = FCC Strategy Team + Model Risk; 2LoD = Financial Crime Compliance; Internal Audit; 3LoD audit cycle = Annual
- **Evidence source:** Coverage matrix document; risk assessment cross-walk
- **Testing approach:** Independent review by Model Risk; IA review every 18 months
- **Last tested:** 2025-11-30 — _Effective with Observations_
- **Linked KRIs:** KRI-FC-015
- **Open issues:** ISS-2025-088
- **Status:** Active

#### `AML-C002` — Alert disposition within SLA

- **Sub-Process:** Alert Triage
- **Risk Domain:** Financial Crime Risk
- **Description:** All alerts dispositioned within defined SLAs (L1: 5 BD; L2: 15 BD; L3: 30 BD). Aged alerts auto-escalate. Backlog reported weekly to Head of FCC.
- **Type / Nature / Frequency:** Detective · ITDM · Per-alert
- **Risk mitigated:** `R-FC-016` — SAR-worthy activity missed due to alert backlog
- **Inherent → Residual:** High → Medium
- **Linked obligations:** OBL-CFR-1020-320
- **Ownership:** 1LoD = Head of AML Investigations; Operator = AML Investigations Team; 2LoD = Financial Crime Compliance; 3LoD audit cycle = Annual
- **Evidence source:** Case management aging reports; SLA dashboards
- **Testing approach:** Weekly KRI review at FCC governance forum
- **Last tested:** 2026-04-12 — _Needs Improvement_
- **Linked KRIs:** KRI-FC-016;KRI-FC-017
- **Open issues:** ISS-2026-009;ISS-2026-052
- **Status:** Active

#### `AML-C003` — SAR filing within 30/60 day window

- **Sub-Process:** SAR Filing
- **Risk Domain:** Financial Crime Risk
- **Description:** SARs filed within 30 days of detection (60 days where no suspect identified). Late filings root-caused and reported to BSA Officer.
- **Type / Nature / Frequency:** Corrective · Manual · Per-SAR
- **Risk mitigated:** `R-FC-017` — Late or unfiled Suspicious Activity Report
- **Inherent → Residual:** High → Low
- **Linked obligations:** OBL-CFR-1020-320
- **Ownership:** 1LoD = BSA Officer; Operator = AML Investigations + BSA Office; 2LoD = Financial Crime Compliance; 3LoD audit cycle = Annual
- **Evidence source:** FinCEN BSA E-Filing receipts; SAR filing register
- **Testing approach:** Monthly review of filing timeliness; quarterly QA on SAR narratives
- **Last tested:** 2026-03-31 — _Effective_
- **Linked KRIs:** KRI-FC-018
- **Status:** Active

#### `AML-C004` — AML transaction monitoring model annual validation

- **Sub-Process:** Model Validation
- **Risk Domain:** Model Risk
- **Description:** Annual independent validation of AML models per SR 11-7 covering conceptual soundness, ongoing performance, and outcomes analysis.
- **Type / Nature / Frequency:** Detective · Manual · Annual
- **Risk mitigated:** `R-MR-001` — AML model under-alerts, leading to undetected illicit activity
- **Inherent → Residual:** High → Medium
- **Linked obligations:** OBL-SR117-001;OBL-FFIEC-BSA-007
- **Ownership:** 1LoD = Head of Model Risk Management; Operator = Model Validation Team; 2LoD = Model Risk; Financial Crime Compliance; 3LoD audit cycle = Annual
- **Evidence source:** Validation report; findings tracker; senior management response
- **Testing approach:** Annual MRM validation; periodic IA review
- **Last tested:** 2025-10-15 — _Effective with Observations_
- **Linked KRIs:** KRI-MR-002
- **Open issues:** ISS-2025-072
- **Status:** Active

#### `AML-C005` — Alert disposition quality assurance sampling

- **Sub-Process:** Quality Assurance
- **Risk Domain:** Financial Crime Risk
- **Description:** QA team samples 5% of dispositioned alerts (closed and escalated) monthly. Errors are categorised, reported, and feed investigator coaching.
- **Type / Nature / Frequency:** Detective · Manual · Monthly
- **Risk mitigated:** `R-FC-018` — Investigator error leading to incorrect disposition (false-close)
- **Inherent → Residual:** Medium → Medium
- **Linked obligations:** OBL-FFIEC-BSA-008
- **Ownership:** 1LoD = Head of FCC Quality Assurance; Operator = FCC QA Team; 2LoD = Financial Crime Compliance; 3LoD audit cycle = Annual
- **Evidence source:** QA sample workpapers; error register; coaching log
- **Testing approach:** Monthly QA reporting; quarterly trend review
- **Last tested:** 2026-04-05 — _Effective_
- **Linked KRIs:** KRI-FC-019
- **Status:** Active

#### `AML-C006` — Investigator case documentation standards

- **Sub-Process:** Case Documentation
- **Risk Domain:** Financial Crime Risk
- **Description:** Each investigation must document: alert reason, customer profile review, transaction analysis, conclusion, and supporting evidence per minimum standards.
- **Type / Nature / Frequency:** Preventive · ITDM · Per-case
- **Risk mitigated:** `R-FC-019` — Inadequate case documentation undermining defensibility of decision
- **Inherent → Residual:** Medium → Low
- **Linked obligations:** OBL-FFIEC-BSA-008
- **Ownership:** 1LoD = Head of AML Investigations; Operator = AML Investigators; 2LoD = Financial Crime Compliance; 3LoD audit cycle = Annual
- **Evidence source:** Case management system records; required-field enforcement
- **Testing approach:** Embedded in QA control AML-C005; quarterly thematic review
- **Last tested:** 2026-04-05 — _Effective_
- **Linked KRIs:** KRI-FC-020
- **Status:** Active

#### `AML-C007` — Tier 2 / Tier 3 escalation governance

- **Sub-Process:** Escalation
- **Risk Domain:** Financial Crime Risk
- **Description:** Defined criteria for escalation from L1 to L2 and L2 to L3. Escalations logged with timestamp; senior review required on L3 cases before SAR decision.
- **Type / Nature / Frequency:** Preventive · Manual · Per-escalation
- **Risk mitigated:** `R-FC-020` — Inappropriate de-escalation suppressing SAR filing
- **Inherent → Residual:** High → Medium
- **Linked obligations:** OBL-FFIEC-BSA-008
- **Ownership:** 1LoD = Head of AML Investigations; Operator = Investigations Leadership; 2LoD = Financial Crime Compliance; 3LoD audit cycle = Annual
- **Evidence source:** Case management escalation logs; senior reviewer sign-off
- **Testing approach:** Quarterly review of escalation patterns; QA includes escalation accuracy
- **Last tested:** 2026-03-22 — _Effective_
- **Linked KRIs:** KRI-FC-021
- **Status:** Active

#### `AML-C008` — Customer risk re-rating post-investigation

- **Sub-Process:** Customer Re-rating
- **Risk Domain:** Financial Crime Risk
- **Description:** When investigations identify material new information, customer risk rating is re-assessed and updated within 10 BD; subsequent monitoring adjusted.
- **Type / Nature / Frequency:** Corrective · ITDM · Per-event
- **Risk mitigated:** `R-FC-021` — Stale customer risk rating despite material new information
- **Inherent → Residual:** Medium → Low
- **Linked obligations:** OBL-FFIEC-BSA-001
- **Ownership:** 1LoD = Head of Financial Crime Compliance; Operator = Investigators + Risk Rating Engine; 2LoD = Financial Crime Compliance; 3LoD audit cycle = Annual
- **Evidence source:** Risk rating change log; investigation linkage
- **Testing approach:** Quarterly sample of closed cases for re-rating action
- **Last tested:** 2026-02-10 — _Effective_
- **Linked KRIs:** KRI-FC-022
- **Status:** Active

#### `AML-C009` — AML scenario threshold tuning governance

- **Sub-Process:** Threshold Tuning
- **Risk Domain:** Financial Crime Risk
- **Description:** Threshold changes follow documented governance: business case, statistical analysis, MRM review, FCC sign-off, and post-implementation monitoring.
- **Type / Nature / Frequency:** Preventive · Manual · Per-change
- **Risk mitigated:** `R-FC-022` — Threshold change weakens detection without governance
- **Inherent → Residual:** High → Low
- **Linked obligations:** OBL-SR117-001;OBL-FFIEC-BSA-007
- **Ownership:** 1LoD = Head of Financial Crime Compliance; Operator = FCC Strategy + Model Risk; 2LoD = Model Risk; Financial Crime Compliance; 3LoD audit cycle = Annual
- **Evidence source:** Tuning request register; impact analysis; approval log
- **Testing approach:** Each tuning event reviewed by MRM; annual portfolio review
- **Last tested:** 2026-03-05 — _Effective_
- **Linked KRIs:** KRI-FC-023
- **Status:** Active

#### `AML-C010` — Above-the-line / below-the-line testing

- **Sub-Process:** ATL/BTL Testing
- **Risk Domain:** Financial Crime Risk
- **Description:** Periodic ATL/BTL testing samples alerts at and below current thresholds to assess whether thresholds remain appropriate. Findings inform tuning.
- **Type / Nature / Frequency:** Detective · Manual · Annual
- **Risk mitigated:** `R-FC-023` — Thresholds set such that productive alerts fall below the line
- **Inherent → Residual:** High → Medium
- **Linked obligations:** OBL-FFIEC-BSA-007
- **Ownership:** 1LoD = Head of Financial Crime Compliance; Operator = FCC Strategy + Model Risk; 2LoD = Model Risk; Financial Crime Compliance; 3LoD audit cycle = Annual
- **Evidence source:** ATL/BTL test report; sample workpapers; recommendations
- **Testing approach:** Annual testing; results reviewed by FCC governance and MRM
- **Last tested:** 2025-09-30 — _Effective with Observations_
- **Linked KRIs:** KRI-FC-024
- **Open issues:** ISS-2025-079
- **Status:** Active

---

### 2.4 Vendor Onboarding

_Pre-contract due diligence and risk-tiered assessment for new third-party providers, covering information security, financial viability, business continuity, privacy, and fourth-party concentration. Anchored in OCC Bulletin 2023-17 (Interagency TPRM Guidance)._

**Summary table.**

| Control ID | Title | Type | Nature | Freq. | Inherent | Residual | Risk ID | Last Test |
|---|---|---|---|---|---|---|---|---|
| `VO-C001` | Pre-contract due diligence (risk-tiered) | Preventive | Manual | Per-vendor | High | Low | `R-TP-001` | Effective |
| `VO-C002` | Vendor risk tiering classification | Preventive | ITDM | Per-vendor | High | Medium | `R-TP-002` | Effective with Observations |
| `VO-C003` | Information security assessment | Preventive | Manual | Per-vendor | High | Medium | `R-TP-003` | Effective |
| `VO-C004` | SOC 1 / SOC 2 review pre-contract | Preventive | Manual | Per-vendor | High | Medium | `R-TP-004` | Effective |
| `VO-C005` | Financial viability assessment | Preventive | Manual | Per-vendor | High | Medium | `R-TP-005` | Effective |
| `VO-C006` | Contract clause adequacy review | Preventive | Manual | Per-contract | Medium | Low | `R-TP-006` | Effective |
| `VO-C007` | Subcontractor (4th-party) inventory capture | Detective | Manual | Per-vendor | Medium | Medium | `R-TP-007` | Needs Improvement |
| `VO-C008` | Vendor BCP / DR validation | Detective | Manual | Per-vendor | High | Medium | `R-TP-008` | Effective with Observations |
| `VO-C009` | Privacy & data protection assessment | Preventive | Manual | Per-vendor | High | Medium | `R-TP-009` | Effective |
| `VO-C010` | Risk-tiered onboarding approval authority | Preventive | Manual | Per-vendor | Medium | Low | `R-TP-010` | Effective |

**Control detail.**

#### `VO-C001` — Pre-contract due diligence (risk-tiered)

- **Sub-Process:** Due Diligence
- **Risk Domain:** Third-Party / Vendor Risk
- **Description:** Risk-tiered due diligence completed before contract signature: financial, operational, information security, legal, compliance, and reputational checks.
- **Type / Nature / Frequency:** Preventive · Manual · Per-vendor
- **Risk mitigated:** `R-TP-001` — Engagement of an unsuitable or high-risk vendor
- **Inherent → Residual:** High → Low
- **Linked obligations:** OBL-OCC-2023-17-001
- **Ownership:** 1LoD = Head of Vendor Management; Operator = Vendor Management Office (VMO); 2LoD = Vendor Management; Operational Risk; 3LoD audit cycle = Annual
- **Evidence source:** DD package; risk assessment; approval log
- **Testing approach:** Monthly population check on new vendors; quarterly thematic review
- **Last tested:** 2026-03-18 — _Effective_
- **Linked KRIs:** KRI-TP-001
- **Status:** Active

#### `VO-C002` — Vendor risk tiering classification

- **Sub-Process:** Risk Tiering
- **Risk Domain:** Third-Party / Vendor Risk
- **Description:** Each new vendor is classified into tier (Critical / High / Medium / Low) based on data sensitivity, customer impact, regulatory exposure, and substitutability.
- **Type / Nature / Frequency:** Preventive · ITDM · Per-vendor
- **Risk mitigated:** `R-TP-002` — Mis-tiered vendor receives insufficient oversight
- **Inherent → Residual:** High → Medium
- **Linked obligations:** OBL-OCC-2023-17-002
- **Ownership:** 1LoD = Head of Vendor Management; Operator = VMO + Business Sponsor; 2LoD = Vendor Management; Operational Risk; 3LoD audit cycle = Annual
- **Evidence source:** Tiering questionnaire responses; tiering decision log
- **Testing approach:** Annual re-tiering review; sample testing of tier assignments
- **Last tested:** 2026-02-28 — _Effective with Observations_
- **Linked KRIs:** KRI-TP-002
- **Open issues:** ISS-2026-027
- **Status:** Active

#### `VO-C003` — Information security assessment

- **Sub-Process:** Information Security
- **Risk Domain:** Technology, Cyber & Data Risk
- **Description:** InfoSec assessment of vendor's security posture: encryption, access controls, vulnerability management, incident response, and data handling practices.
- **Type / Nature / Frequency:** Preventive · Manual · Per-vendor
- **Risk mitigated:** `R-TP-003` — Vendor causes customer-data breach due to weak security
- **Inherent → Residual:** High → Medium
- **Linked obligations:** OBL-GLBA-001;OBL-OCC-2023-17-003
- **Ownership:** 1LoD = CISO; Operator = Third-Party Cyber Risk Team; 2LoD = Information Security; Vendor Management; 3LoD audit cycle = Annual
- **Evidence source:** InfoSec questionnaire; SOC reports; pen-test results
- **Testing approach:** Annual reassessment for Critical/High; sample testing for others
- **Last tested:** 2026-03-25 — _Effective_
- **Linked KRIs:** KRI-TC-001
- **Status:** Active

#### `VO-C004` — SOC 1 / SOC 2 review pre-contract

- **Sub-Process:** SOC Reports
- **Risk Domain:** Third-Party / Vendor Risk
- **Description:** For in-scope vendors, current SOC 1/SOC 2 report is reviewed pre-contract for relevant controls, exceptions, and complementary user entity controls.
- **Type / Nature / Frequency:** Preventive · Manual · Per-vendor
- **Risk mitigated:** `R-TP-004` — Reliance placed on un-validated vendor controls
- **Inherent → Residual:** High → Medium
- **Linked obligations:** OBL-SOX-404-001;OBL-OCC-2023-17-003
- **Ownership:** 1LoD = Head of Vendor Management; Operator = VMO + SOX PMO; 2LoD = Vendor Management; Internal Audit; 3LoD audit cycle = Annual
- **Evidence source:** SOC report; review checklist; CUEC mapping
- **Testing approach:** Annual SOC report refresh; sample CUEC implementation test
- **Last tested:** 2026-03-15 — _Effective_
- **Linked KRIs:** KRI-TP-003
- **Open issues:** ISS-2026-035
- **Status:** Active

#### `VO-C005` — Financial viability assessment

- **Sub-Process:** Financial Viability
- **Risk Domain:** Third-Party / Vendor Risk
- **Description:** Financial review of vendor (audited financials, credit reports, market signals) for Critical and High tier vendors before contract.
- **Type / Nature / Frequency:** Preventive · Manual · Per-vendor
- **Risk mitigated:** `R-TP-005` — Critical vendor experiences financial distress disrupting service
- **Inherent → Residual:** High → Medium
- **Linked obligations:** OBL-OCC-2023-17-002
- **Ownership:** 1LoD = Head of Vendor Management; Operator = VMO + Treasury Credit; 2LoD = Vendor Management; 3LoD audit cycle = Bi-Annual
- **Evidence source:** Financial review memo; ratings reports; financial statements
- **Testing approach:** Annual refresh for Critical/High; trigger-based reassessment
- **Last tested:** 2026-01-22 — _Effective_
- **Linked KRIs:** KRI-TP-004
- **Status:** Active

#### `VO-C006` — Contract clause adequacy review

- **Sub-Process:** Contract Terms
- **Risk Domain:** Third-Party / Vendor Risk
- **Description:** Standard regulatory clauses (right to audit, data protection, subcontractor approval, exit, BCP, breach notification) verified before contract signature.
- **Type / Nature / Frequency:** Preventive · Manual · Per-contract
- **Risk mitigated:** `R-TP-006` — Missing contract clauses limiting bank's regulatory and operational rights
- **Inherent → Residual:** Medium → Low
- **Linked obligations:** OBL-OCC-2023-17-004
- **Ownership:** 1LoD = Head of Vendor Management; Operator = Legal + VMO; 2LoD = Legal; Vendor Management; 3LoD audit cycle = Annual
- **Evidence source:** Contract; clause checklist; legal sign-off
- **Testing approach:** Quarterly contract sample for clause completeness
- **Last tested:** 2026-04-01 — _Effective_
- **Linked KRIs:** KRI-TP-005
- **Status:** Active

#### `VO-C007` — Subcontractor (4th-party) inventory capture

- **Sub-Process:** 4th-Party Inventory
- **Risk Domain:** Third-Party / Vendor Risk
- **Description:** Material subcontractors of in-scope vendors are identified and recorded at onboarding; concentration and shared-dependency risk assessed.
- **Type / Nature / Frequency:** Detective · Manual · Per-vendor
- **Risk mitigated:** `R-TP-007` — Hidden 4th-party concentration creates systemic exposure
- **Inherent → Residual:** Medium → Medium
- **Linked obligations:** OBL-OCC-2023-17-005
- **Ownership:** 1LoD = Head of Vendor Management; Operator = VMO; 2LoD = Vendor Management; Operational Resilience; 3LoD audit cycle = Bi-Annual
- **Evidence source:** 4th-party inventory; concentration analytics
- **Testing approach:** Annual 4th-party refresh; bi-annual concentration review at ORC
- **Last tested:** 2025-12-15 — _Needs Improvement_
- **Linked KRIs:** KRI-TP-006
- **Open issues:** ISS-2025-098
- **Status:** Active

#### `VO-C008` — Vendor BCP / DR validation

- **Sub-Process:** Business Continuity
- **Risk Domain:** Operational Risk
- **Description:** For Critical vendors, BCP/DR plans reviewed and RTO/RPO commitments verified; alignment with bank's Important Business Service tolerances.
- **Type / Nature / Frequency:** Detective · Manual · Per-vendor
- **Risk mitigated:** `R-TP-008` — Vendor cannot meet recovery objectives during disruption
- **Inherent → Residual:** High → Medium
- **Linked obligations:** OBL-OCC-2023-17-006;OBL-FFIEC-BCM-001
- **Ownership:** 1LoD = Head of BCM; Operator = BCM Office + VMO; 2LoD = BCM; Vendor Management; 3LoD audit cycle = Annual
- **Evidence source:** BCP/DR documentation; test results; tolerance mapping
- **Testing approach:** Annual review for Critical; participation in joint exercise where relevant
- **Last tested:** 2026-02-12 — _Effective with Observations_
- **Linked KRIs:** KRI-TP-007
- **Status:** Active

#### `VO-C009` — Privacy & data protection assessment

- **Sub-Process:** Privacy & Data
- **Risk Domain:** Compliance & Conduct Risk
- **Description:** Privacy review of vendor processing of customer/employee data: lawful basis, retention, sub-processors, cross-border transfers, breach response.
- **Type / Nature / Frequency:** Preventive · Manual · Per-vendor
- **Risk mitigated:** `R-TP-009` — Privacy/data-protection violation via vendor
- **Inherent → Residual:** High → Medium
- **Linked obligations:** OBL-GLBA-001;OBL-STATE-PRIVACY-001
- **Ownership:** 1LoD = Chief Privacy Officer; Operator = Privacy Office + VMO; 2LoD = Privacy; Information Security; 3LoD audit cycle = Annual
- **Evidence source:** Privacy assessment; DPA / data processing terms
- **Testing approach:** Annual reassessment for vendors handling NPI
- **Last tested:** 2026-03-10 — _Effective_
- **Linked KRIs:** KRI-TP-008
- **Status:** Active

#### `VO-C010` — Risk-tiered onboarding approval authority

- **Sub-Process:** Approval Authority
- **Risk Domain:** Third-Party / Vendor Risk
- **Description:** Final onboarding approval is taken at the authority level matched to vendor tier (Critical: ORC; High: Head of Risk; Medium: Head of VMO; Low: Sponsor).
- **Type / Nature / Frequency:** Preventive · Manual · Per-vendor
- **Risk mitigated:** `R-TP-010` — Vendor approved at insufficient authority for its risk tier
- **Inherent → Residual:** Medium → Low
- **Linked obligations:** OBL-OCC-2023-17-001
- **Ownership:** 1LoD = Head of Vendor Management; Operator = Approval Authorities (per matrix); 2LoD = Vendor Management; 3LoD audit cycle = Annual
- **Evidence source:** Approval workflow records; authority matrix
- **Testing approach:** Quarterly check of approval authority vs. tier
- **Last tested:** 2026-03-30 — _Effective_
- **Linked KRIs:** KRI-TP-009
- **Status:** Active

---

### 2.5 Model Validation

_Independent validation of models prior to production use and on an ongoing risk-tiered cycle, including conceptual soundness review, outcomes analysis, and AI/ML fairness testing. Anchored in SR 11-7 / OCC 2011-12._

**Summary table.**

| Control ID | Title | Type | Nature | Freq. | Inherent | Residual | Risk ID | Last Test |
|---|---|---|---|---|---|---|---|---|
| `MV-C001` | Model inventory completeness attestation | Preventive | Manual | Quarterly | High | Low | `R-MR-002` | Effective |
| `MV-C002` | Independent model validation pre-deployment | Detective | Manual | Per-model | High | Medium | `R-MR-003` | Effective |
| `MV-C003` | Conceptual soundness review | Detective | Manual | Per-model | High | Medium | `R-MR-004` | Effective |
| `MV-C004` | Outcomes analysis / backtesting | Detective | Manual | Annual | High | Medium | `R-MR-005` | Effective with Observations |
| `MV-C005` | Model documentation standards adherence | Preventive | ITDM | Annual | Medium | Low | `R-MR-006` | Effective |
| `MV-C006` | Validator independence enforcement | Preventive | Manual | Per-validation | Medium | Low | `R-MR-007` | Effective |
| `MV-C007` | Validation findings tracking and remediation | Corrective | ITDM | Continuous | High | Medium | `R-MR-008` | Needs Improvement |
| `MV-C008` | Annual / tiered re-validation cycle adherence | Detective | ITDM | Cyclical | High | Medium | `R-MR-009` | Needs Improvement |
| `MV-C009` | AI/ML fairness & explainability assessment | Detective | Manual | Per-model + Annual | High | Medium | `R-MR-010` | Effective with Observations |
| `MV-C010` | Tiered validation depth adherence | Preventive | Manual | Per-validation | Medium | Low | `R-MR-011` | Effective |

**Control detail.**

#### `MV-C001` — Model inventory completeness attestation

- **Sub-Process:** Model Inventory
- **Risk Domain:** Model Risk
- **Description:** Quarterly attestation by model owners that all in-scope models are recorded in the central inventory with required metadata. Discoveries trigger backlog.
- **Type / Nature / Frequency:** Preventive · Manual · Quarterly
- **Risk mitigated:** `R-MR-002` — Unknown / unmanaged model in production
- **Inherent → Residual:** High → Low
- **Linked obligations:** OBL-SR117-001
- **Ownership:** 1LoD = Head of Model Risk Management; Operator = Model Owners + MRM Inventory Lead; 2LoD = Model Risk Management; 3LoD audit cycle = Annual
- **Evidence source:** Inventory system records; attestation log; discovery register
- **Testing approach:** Quarterly attestation; annual inventory completeness audit
- **Last tested:** 2026-03-31 — _Effective_
- **Linked KRIs:** KRI-MR-003
- **Status:** Active

#### `MV-C002` — Independent model validation pre-deployment

- **Sub-Process:** Pre-Deployment Validation
- **Risk Domain:** Model Risk
- **Description:** All in-scope new models are independently validated by MRM before production deployment. Validation report and findings issued; deployment blocked until cleared.
- **Type / Nature / Frequency:** Detective · Manual · Per-model
- **Risk mitigated:** `R-MR-003` — Conceptually unsound model deployed to production
- **Inherent → Residual:** High → Medium
- **Linked obligations:** OBL-SR117-002
- **Ownership:** 1LoD = Head of Model Risk Management; Operator = Model Validation Team; 2LoD = Model Risk Management; 3LoD audit cycle = Annual
- **Evidence source:** Validation report; findings register; deployment approval log
- **Testing approach:** Each validation is reviewed by MRM Head; periodic IA review
- **Last tested:** 2026-04-08 — _Effective_
- **Linked KRIs:** KRI-MR-004
- **Status:** Active

#### `MV-C003` — Conceptual soundness review

- **Sub-Process:** Conceptual Soundness
- **Risk Domain:** Model Risk
- **Description:** Validation includes assessment of design, theory, methodology, assumptions, data quality, and limitations against intended use.
- **Type / Nature / Frequency:** Detective · Manual · Per-model
- **Risk mitigated:** `R-MR-004` — Model used outside its valid range or for unintended purpose
- **Inherent → Residual:** High → Medium
- **Linked obligations:** OBL-SR117-002
- **Ownership:** 1LoD = Head of Model Risk Management; Operator = Model Validators; 2LoD = Model Risk Management; 3LoD audit cycle = Annual
- **Evidence source:** Validation report — conceptual soundness section; assumption register
- **Testing approach:** Embedded in MV-C002; thematic review of recurring conceptual findings
- **Last tested:** 2026-03-22 — _Effective_
- **Linked KRIs:** KRI-MR-005
- **Status:** Active

#### `MV-C004` — Outcomes analysis / backtesting

- **Sub-Process:** Outcomes Analysis
- **Risk Domain:** Model Risk
- **Description:** Validation includes outcomes analysis comparing predicted vs. realised over time. Stable performance is required for re-approval.
- **Type / Nature / Frequency:** Detective · Manual · Annual
- **Risk mitigated:** `R-MR-005` — Model performance degraded but not detected; decisions impaired
- **Inherent → Residual:** High → Medium
- **Linked obligations:** OBL-SR117-002
- **Ownership:** 1LoD = Head of Model Risk Management; Operator = Model Validators + Model Owners; 2LoD = Model Risk Management; 3LoD audit cycle = Annual
- **Evidence source:** Backtesting workpapers; performance dashboards
- **Testing approach:** Annual outcomes review; ongoing monitoring tied to MV-C008
- **Last tested:** 2026-02-15 — _Effective with Observations_
- **Linked KRIs:** KRI-MR-006
- **Open issues:** ISS-2026-019
- **Status:** Active

#### `MV-C005` — Model documentation standards adherence

- **Sub-Process:** Documentation
- **Risk Domain:** Model Risk
- **Description:** Each model has documentation meeting standard (purpose, data, methodology, assumptions, limitations, monitoring) reviewed at validation and refreshed annually.
- **Type / Nature / Frequency:** Preventive · ITDM · Annual
- **Risk mitigated:** `R-MR-006` — Inadequate documentation undermining defensibility and reusability
- **Inherent → Residual:** Medium → Low
- **Linked obligations:** OBL-SR117-001
- **Ownership:** 1LoD = Head of Model Risk Management; Operator = Model Owners + MRM; 2LoD = Model Risk Management; 3LoD audit cycle = Annual
- **Evidence source:** Model documentation repository; review checklist
- **Testing approach:** Sample testing during validation; annual repository sweep
- **Last tested:** 2026-03-15 — _Effective_
- **Linked KRIs:** KRI-MR-007
- **Status:** Active

#### `MV-C006` — Validator independence enforcement

- **Sub-Process:** Independence
- **Risk Domain:** Model Risk
- **Description:** Validators are organisationally independent of model developers and owners; conflicts of interest are declared and managed per policy.
- **Type / Nature / Frequency:** Preventive · Manual · Per-validation
- **Risk mitigated:** `R-MR-007` — Compromised validation due to lack of independence
- **Inherent → Residual:** Medium → Low
- **Linked obligations:** OBL-SR117-003
- **Ownership:** 1LoD = Head of Model Risk Management; Operator = MRM Head + HR; 2LoD = Model Risk Management; Internal Audit; 3LoD audit cycle = Annual
- **Evidence source:** Org chart; conflict declarations; validation assignment log
- **Testing approach:** Annual independence attestation; IA periodic review
- **Last tested:** 2026-01-31 — _Effective_
- **Linked KRIs:** KRI-MR-008
- **Status:** Active

#### `MV-C007` — Validation findings tracking and remediation

- **Sub-Process:** Findings Remediation
- **Risk Domain:** Model Risk
- **Description:** Findings tracked centrally with severity, owner, due date, evidence of closure. High-severity findings restrict model use until remediated.
- **Type / Nature / Frequency:** Corrective · ITDM · Continuous
- **Risk mitigated:** `R-MR-008` — Open validation findings unresolved; risk persists in production
- **Inherent → Residual:** High → Medium
- **Linked obligations:** OBL-SR117-002
- **Ownership:** 1LoD = Head of Model Risk Management; Operator = Model Owners + MRM; 2LoD = Model Risk Management; 3LoD audit cycle = Annual
- **Evidence source:** Findings tracker; closure evidence; sign-off log
- **Testing approach:** Monthly aging review; quarterly governance reporting
- **Last tested:** 2026-04-05 — _Needs Improvement_
- **Linked KRIs:** KRI-MR-009
- **Open issues:** ISS-2026-044
- **Status:** Active

#### `MV-C008` — Annual / tiered re-validation cycle adherence

- **Sub-Process:** Re-Validation Cycle
- **Risk Domain:** Model Risk
- **Description:** Models are re-validated on cycle (Tier 1: annual; Tier 2: bi-annual; Tier 3: tri-annual) or earlier on trigger events. Past-due models flagged.
- **Type / Nature / Frequency:** Detective · ITDM · Cyclical
- **Risk mitigated:** `R-MR-009` — Stale model in production beyond re-validation due date
- **Inherent → Residual:** High → Medium
- **Linked obligations:** OBL-SR117-002
- **Ownership:** 1LoD = Head of Model Risk Management; Operator = MRM + Model Owners; 2LoD = Model Risk Management; 3LoD audit cycle = Annual
- **Evidence source:** Inventory due-date tracking; aging reports
- **Testing approach:** Monthly past-due monitoring; quarterly governance escalation
- **Last tested:** 2026-03-31 — _Needs Improvement_
- **Linked KRIs:** KRI-MR-010
- **Open issues:** ISS-2026-051
- **Status:** Active

#### `MV-C009` — AI/ML fairness & explainability assessment

- **Sub-Process:** AI/ML Fairness
- **Risk Domain:** Model Risk
- **Description:** Validation of AI/ML models includes fairness testing across protected classes, explainability analysis, and disparate-impact review for in-scope use cases.
- **Type / Nature / Frequency:** Detective · Manual · Per-model + Annual
- **Risk mitigated:** `R-MR-010` — AI/ML model produces biased or inexplicable decisions affecting customers
- **Inherent → Residual:** High → Medium
- **Linked obligations:** OBL-SR117-002;OBL-ECOA-001;OBL-UDAAP-001
- **Ownership:** 1LoD = Head of Model Risk Management; Operator = Model Validators + Fair Lending Office; 2LoD = Model Risk Management; Fair Lending; Compliance; 3LoD audit cycle = Annual
- **Evidence source:** Fairness test workpapers; explainability artefacts; disparate-impact analysis
- **Testing approach:** Annual AI/ML thematic review; pre-deployment for new use cases
- **Last tested:** 2026-02-28 — _Effective with Observations_
- **Linked KRIs:** KRI-MR-011
- **Open issues:** ISS-2026-029
- **Status:** Active

#### `MV-C010` — Tiered validation depth adherence

- **Sub-Process:** Tiered Depth
- **Risk Domain:** Model Risk
- **Description:** Validation depth scales with model tier (materiality, complexity, regulatory sensitivity). MRM Head approves any deviations from standard validation scope.
- **Type / Nature / Frequency:** Preventive · Manual · Per-validation
- **Risk mitigated:** `R-MR-011` — Insufficient validation depth for high-tier model
- **Inherent → Residual:** Medium → Low
- **Linked obligations:** OBL-SR117-002
- **Ownership:** 1LoD = Head of Model Risk Management; Operator = MRM Head + Validators; 2LoD = Model Risk Management; 3LoD audit cycle = Annual
- **Evidence source:** Validation scope memo; deviation approvals
- **Testing approach:** Quarterly scope-vs-tier review; annual MRM self-assessment
- **Last tested:** 2026-03-08 — _Effective_
- **Linked KRIs:** KRI-MR-012
- **Status:** Active

---

### 2.6 Loan Origination

_Commercial and consumer loan origination from application through booking: credit policy adherence, independent approval, appraisal, fair lending review, HMDA capture, and TILA/RESPA disclosure delivery._

**Summary table.**

| Control ID | Title | Type | Nature | Freq. | Inherent | Residual | Risk ID | Last Test |
|---|---|---|---|---|---|---|---|---|
| `LO-C001` | Credit policy adherence check at underwriting | Preventive | ITDM | Per-loan | High | Low | `R-CR-001` | Effective |
| `LO-C002` | Independent credit approval at thresholds | Preventive | Manual | Per-loan | High | Low | `R-CR-002` | Effective |
| `LO-C003` | Loan covenant capture in core system | Preventive | ITDM | Per-loan | Medium | Low | `R-CR-003` | Effective with Observations |
| `LO-C004` | Concentration limit pre-check | Preventive | Automated | Per-loan | High | Medium | `R-CR-004` | Effective |
| `LO-C005` | Appraisal independence verification | Preventive | Manual | Per-loan | Medium | Low | `R-CR-005` | Effective |
| `LO-C006` | Income / employment verification | Preventive | Manual | Per-loan | High | Medium | `R-CR-006` | Effective |
| `LO-C007` | Adverse action notice issuance | Preventive | Automated | Per-decision | Medium | Low | `R-CC-002` | Effective |
| `LO-C008` | HMDA data capture and validation | Detective | ITDM | Quarterly | High | Medium | `R-CC-003` | Effective with Observations |
| `LO-C009` | Fair lending pricing exception review | Detective | Manual | Quarterly | High | Medium | `R-CC-004` | Effective with Observations |
| `LO-C010` | TILA / RESPA disclosure delivery | Preventive | ITDM | Per-loan | High | Low | `R-CC-005` | Effective |

**Control detail.**

#### `LO-C001` — Credit policy adherence check at underwriting

- **Sub-Process:** Underwriting
- **Risk Domain:** Credit Risk
- **Description:** Loan applications validated against the bank's credit policy (LTV, DTI, DSCR, score thresholds). Policy exceptions require documented rationale and senior approval.
- **Type / Nature / Frequency:** Preventive · ITDM · Per-loan
- **Risk mitigated:** `R-CR-001` — Loan booked outside credit policy without justified exception
- **Inherent → Residual:** High → Low
- **Linked obligations:** OBL-OCC-CR-001;OBL-12CFR30-001
- **Ownership:** 1LoD = Chief Credit Officer; Operator = Underwriting Team + LOS; 2LoD = Credit Risk; Internal Audit; 3LoD audit cycle = Annual
- **Evidence source:** Loan Origination System (LOS) records; exception register
- **Testing approach:** Monthly QA on 5% of approvals; quarterly exception trend review
- **Last tested:** 2026-04-02 — _Effective_
- **Linked KRIs:** KRI-CR-001
- **Status:** Active

#### `LO-C002` — Independent credit approval at thresholds

- **Sub-Process:** Credit Approval
- **Risk Domain:** Credit Risk
- **Description:** Credit decisions above defined thresholds require independent approval at the appropriate authority level (Credit Officer / Senior Credit Officer / Credit Committee).
- **Type / Nature / Frequency:** Preventive · Manual · Per-loan
- **Risk mitigated:** `R-CR-002` — Loan approved at insufficient authority for its size or risk
- **Inherent → Residual:** High → Low
- **Linked obligations:** OBL-12CFR30-001
- **Ownership:** 1LoD = Chief Credit Officer; Operator = Credit Officers + Credit Committee; 2LoD = Credit Risk; 3LoD audit cycle = Annual
- **Evidence source:** Approval workflow logs; committee minutes
- **Testing approach:** Monthly check of approvals against authority matrix
- **Last tested:** 2026-03-26 — _Effective_
- **Linked KRIs:** KRI-CR-002
- **Status:** Active

#### `LO-C003` — Loan covenant capture in core system

- **Sub-Process:** Covenant Capture
- **Risk Domain:** Credit Risk
- **Description:** Financial and reporting covenants captured in core/loan servicing system at booking; monitoring schedule generated automatically.
- **Type / Nature / Frequency:** Preventive · ITDM · Per-loan
- **Risk mitigated:** `R-CR-003` — Covenants not monitored due to incomplete capture at booking
- **Inherent → Residual:** Medium → Low
- **Linked obligations:** OBL-OCC-CR-002
- **Ownership:** 1LoD = Head of Loan Operations; Operator = Loan Operations Team; 2LoD = Credit Risk; 3LoD audit cycle = Annual
- **Evidence source:** Core/loan servicing covenant records; booking checklist
- **Testing approach:** Monthly post-booking sample check on covenant capture
- **Last tested:** 2026-04-01 — _Effective with Observations_
- **Linked KRIs:** KRI-CR-003
- **Open issues:** ISS-2026-038
- **Status:** Active

#### `LO-C004` — Concentration limit pre-check

- **Sub-Process:** Concentration Limits
- **Risk Domain:** Credit Risk
- **Description:** Pre-approval check that the proposed exposure does not breach single-name, sector, or geographic concentration limits. Breaches require ALCO/RC approval.
- **Type / Nature / Frequency:** Preventive · Automated · Per-loan
- **Risk mitigated:** `R-CR-004` — New loan causes breach of concentration limits
- **Inherent → Residual:** High → Medium
- **Linked obligations:** OBL-12CFR32-001;OBL-12CFR30-001
- **Ownership:** 1LoD = Head of Portfolio Management; Operator = Portfolio Management + LOS; 2LoD = Credit Risk; 3LoD audit cycle = Annual
- **Evidence source:** Concentration dashboard; pre-approval check log
- **Testing approach:** Daily limit monitoring; quarterly limit framework review
- **Last tested:** 2026-03-30 — _Effective_
- **Linked KRIs:** KRI-CR-004
- **Status:** Active

#### `LO-C005` — Appraisal independence verification

- **Sub-Process:** Collateral Valuation
- **Risk Domain:** Credit Risk
- **Description:** Appraisals are ordered through an independent appraisal management process; appraiser independence from loan production verified per FIRREA / 12 CFR 34.
- **Type / Nature / Frequency:** Preventive · Manual · Per-loan
- **Risk mitigated:** `R-CR-005` — Inflated collateral valuation due to appraiser influence
- **Inherent → Residual:** Medium → Low
- **Linked obligations:** OBL-12CFR34-001;OBL-FIRREA-001
- **Ownership:** 1LoD = Head of Real Estate Lending; Operator = Appraisal Management Function; 2LoD = Credit Risk; Compliance; 3LoD audit cycle = Annual
- **Evidence source:** Appraisal order records; independence attestation
- **Testing approach:** Quarterly sample of appraisals for independence; annual programme review
- **Last tested:** 2026-02-20 — _Effective_
- **Linked KRIs:** KRI-CR-005
- **Status:** Active

#### `LO-C006` — Income / employment verification

- **Sub-Process:** Income Verification
- **Risk Domain:** Credit Risk
- **Description:** Borrower income and employment verified per product type via paystubs, tax transcripts, or employer contact. Documentation retained and indexed.
- **Type / Nature / Frequency:** Preventive · Manual · Per-loan
- **Risk mitigated:** `R-CR-006` — Loan approved on unverified or misrepresented income
- **Inherent → Residual:** High → Medium
- **Linked obligations:** OBL-OCC-CR-001
- **Ownership:** 1LoD = Head of Consumer Lending; Operator = Underwriting Team; 2LoD = Credit Risk; Fraud Risk; 3LoD audit cycle = Annual
- **Evidence source:** Verified income documents in LOS; verification log
- **Testing approach:** Monthly QA sample of 50 loans; quarterly fraud-overlap review
- **Last tested:** 2026-03-15 — _Effective_
- **Linked KRIs:** KRI-CR-006
- **Status:** Active

#### `LO-C007` — Adverse action notice issuance

- **Sub-Process:** Adverse Action
- **Risk Domain:** Compliance & Conduct Risk
- **Description:** When an application is denied, withdrawn-incomplete, or counter-offered, an adverse action notice meeting ECOA/FCRA requirements is issued within 30 days.
- **Type / Nature / Frequency:** Preventive · Automated · Per-decision
- **Risk mitigated:** `R-CC-002` — ECOA / FCRA adverse action notice violation
- **Inherent → Residual:** Medium → Low
- **Linked obligations:** OBL-CFR-1002-009;OBL-FCRA-001
- **Ownership:** 1LoD = Head of Consumer Lending; Operator = LOS + Lending Operations; 2LoD = Compliance; 3LoD audit cycle = Annual
- **Evidence source:** AAN delivery records; LOS audit trail
- **Testing approach:** Monthly population check on AAN issuance and timing
- **Last tested:** 2026-04-01 — _Effective_
- **Linked KRIs:** KRI-CC-002
- **Status:** Active

#### `LO-C008` — HMDA data capture and validation

- **Sub-Process:** HMDA Capture
- **Risk Domain:** Compliance & Conduct Risk
- **Description:** HMDA data points are captured at application and decision; quarterly LAR validation against source systems before submission preparation.
- **Type / Nature / Frequency:** Detective · ITDM · Quarterly
- **Risk mitigated:** `R-CC-003` — Inaccurate HMDA submission leading to regulatory penalty
- **Inherent → Residual:** High → Medium
- **Linked obligations:** OBL-CFR-1003-001
- **Ownership:** 1LoD = Head of Mortgage Operations; Operator = Mortgage Operations + Mortgage Compliance; 2LoD = Compliance; Internal Audit; 3LoD audit cycle = Annual
- **Evidence source:** LAR; data quality reports; reconciliation workpapers
- **Testing approach:** Quarterly LAR validation; annual scrub before March submission
- **Last tested:** 2026-04-15 — _Effective with Observations_
- **Linked KRIs:** KRI-CC-003
- **Open issues:** ISS-2026-046
- **Status:** Active

#### `LO-C009` — Fair lending pricing exception review

- **Sub-Process:** Fair Lending
- **Risk Domain:** Compliance & Conduct Risk
- **Description:** Pricing exceptions (rate, fee waivers) are documented with rationale and reviewed quarterly for disparate impact across protected classes.
- **Type / Nature / Frequency:** Detective · Manual · Quarterly
- **Risk mitigated:** `R-CC-004` — Disparate impact in pricing exceptions across protected classes
- **Inherent → Residual:** High → Medium
- **Linked obligations:** OBL-ECOA-001;OBL-FHA-001
- **Ownership:** 1LoD = Head of Fair Lending; Operator = Fair Lending Office; 2LoD = Fair Lending; Compliance; 3LoD audit cycle = Annual
- **Evidence source:** Exception register; statistical analysis workpapers
- **Testing approach:** Quarterly statistical review; annual full fair-lending analysis
- **Last tested:** 2026-03-31 — _Effective with Observations_
- **Linked KRIs:** KRI-CC-004
- **Open issues:** ISS-2026-014
- **Status:** Active

#### `LO-C010` — TILA / RESPA disclosure delivery

- **Sub-Process:** Disclosure Delivery
- **Risk Domain:** Compliance & Conduct Risk
- **Description:** Loan Estimate delivered within 3 BD of application; Closing Disclosure delivered ≥3 BD before consummation; tolerances tracked.
- **Type / Nature / Frequency:** Preventive · ITDM · Per-loan
- **Risk mitigated:** `R-CC-005` — TILA / RESPA disclosure timing or accuracy violation
- **Inherent → Residual:** High → Low
- **Linked obligations:** OBL-CFR-1026-001;OBL-CFR-1024-001
- **Ownership:** 1LoD = Head of Mortgage Operations; Operator = Mortgage Operations + LOS; 2LoD = Compliance; 3LoD audit cycle = Annual
- **Evidence source:** Disclosure delivery records; tolerance reports
- **Testing approach:** Monthly population check; tolerance cure tracking
- **Last tested:** 2026-04-05 — _Effective_
- **Linked KRIs:** KRI-CC-005
- **Status:** Active

---

## 3. Risk register

60 risks. Each risk is owned by a 2LoD function, mapped to a process, and linked to one or more controls.

| Risk ID | Domain | Title | Inh. L | Inh. I | Inh. | Res. L | Res. I | Res. | Owner | Process | Linked Controls |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `R-OP-001` | Operational Risk | Erroneous / unauthorised wire | Medium | High | High | Low | High | Low | Head of Operations | Wire Payments | WP-C001 |
| `R-OP-002` | Operational Risk | Wire beyond authority | Low | Medium | Medium | Low | Low | Low | Head of Operations | Wire Payments | WP-C004 |
| `R-OP-003` | Operational Risk | Unidentified payment break | Medium | High | High | Low | Medium | Low | Head of Operations | Wire Payments | WP-C006 |
| `R-OP-004` | Operational Risk | Stale wire exceptions | Medium | Medium | Medium | Low | Low | Low | Head of Operations | Wire Payments | WP-C007 |
| `R-OP-005` | Operational Risk | Failure of wire recall | Medium | Medium | Medium | Medium | Medium | Medium | Head of Operations | Wire Payments | WP-C009 |
| `R-OP-006` | Operational Risk | Malformed SWIFT message | Low | Medium | Medium | Low | Low | Low | Head of Operations | Wire Payments | WP-C010 |
| `R-FC-002` | Financial Crime Risk | Sanctioned-party payment | Medium | High | High | Low | High | Low | Head of Sanctions Compliance | Wire Payments | WP-C002 |
| `R-FC-003` | Financial Crime Risk | BEC fraud | High | High | High | Medium | High | Medium | Head of Fraud Operations | Wire Payments | WP-C003 |
| `R-FC-004` | Financial Crime Risk | Wire fraud / ATO | High | High | High | Medium | High | Medium | Head of Fraud Operations | Wire Payments | WP-C005 |
| `R-FC-005` | Financial Crime Risk | Late OFAC report | Low | Medium | Medium | Low | Low | Low | Head of Sanctions Compliance | Wire Payments | WP-C008 |
| `R-FC-006` | Financial Crime Risk | Synthetic / stolen identity | High | High | High | Low | High | Low | Head of Financial Crime Compliance | Customer Onboarding | CO-C001 |
| `R-FC-007` | Financial Crime Risk | UBO unidentified | Medium | High | High | Low | High | Low | Head of Financial Crime Compliance | Customer Onboarding | CO-C002 |
| `R-FC-008` | Financial Crime Risk | Mis-rated customer | Medium | High | High | Medium | Medium | Medium | Head of Financial Crime Compliance | Customer Onboarding | CO-C003 |
| `R-FC-009` | Financial Crime Risk | Inadequate EDD | Medium | High | High | Medium | High | Medium | Head of Financial Crime Compliance | Customer Onboarding | CO-C004 |
| `R-FC-010` | Financial Crime Risk | Sanctioned customer | Low | High | High | Low | High | Low | Head of Sanctions Compliance | Customer Onboarding | CO-C005 |
| `R-FC-011` | Financial Crime Risk | Undeclared PEP | Medium | Medium | High | Medium | Medium | Medium | Head of Financial Crime Compliance | Customer Onboarding | CO-C006 |
| `R-FC-012` | Financial Crime Risk | Incomplete CIP | Medium | High | High | Low | High | Low | Head of Financial Crime Compliance | Customer Onboarding | CO-C007 |
| `R-FC-013` | Financial Crime Risk | Adverse-media miss | Medium | Medium | Medium | Medium | Medium | Medium | Head of Financial Crime Compliance | Customer Onboarding | CO-C008 |
| `R-FC-014` | Financial Crime Risk | Account active without CDD | Medium | High | High | Low | High | Low | Head of Financial Crime Compliance | Customer Onboarding | CO-C010 |
| `R-FC-015` | Financial Crime Risk | AML typology gap | Medium | High | High | Medium | High | Medium | Head of Financial Crime Compliance | AML Alert Disposition | AML-C001 |
| `R-FC-016` | Financial Crime Risk | Alert backlog | High | High | High | Medium | High | Medium | Head of AML Investigations | AML Alert Disposition | AML-C002 |
| `R-FC-017` | Financial Crime Risk | Late SAR | Medium | High | High | Low | High | Low | BSA Officer | AML Alert Disposition | AML-C003 |
| `R-FC-018` | Financial Crime Risk | Investigator error | Medium | Medium | Medium | Medium | Medium | Medium | Head of AML Investigations | AML Alert Disposition | AML-C005 |
| `R-FC-019` | Financial Crime Risk | Weak case file | Medium | Medium | Medium | Low | Medium | Low | Head of AML Investigations | AML Alert Disposition | AML-C006 |
| `R-FC-020` | Financial Crime Risk | Inappropriate de-escalation | Medium | High | High | Medium | Medium | Medium | Head of AML Investigations | AML Alert Disposition | AML-C007 |
| `R-FC-021` | Financial Crime Risk | Stale risk rating | Medium | Medium | Medium | Low | Medium | Low | Head of Financial Crime Compliance | AML Alert Disposition | AML-C008 |
| `R-FC-022` | Financial Crime Risk | Threshold change w/o governance | Low | High | High | Low | Medium | Low | Head of Financial Crime Compliance | AML Alert Disposition | AML-C009 |
| `R-FC-023` | Financial Crime Risk | Productive alerts BTL | Medium | High | High | Medium | High | Medium | Head of Financial Crime Compliance | AML Alert Disposition | AML-C010 |
| `R-TP-001` | Third-Party / Vendor Risk | Unsuitable vendor | Medium | High | High | Low | High | Low | Head of Vendor Management | Vendor Onboarding | VO-C001 |
| `R-TP-002` | Third-Party / Vendor Risk | Mis-tiered vendor | Medium | High | High | Medium | Medium | Medium | Head of Vendor Management | Vendor Onboarding | VO-C002 |
| `R-TP-003` | Third-Party / Vendor Risk | Vendor data breach | Medium | High | High | Medium | High | Medium | CISO | Vendor Onboarding | VO-C003 |
| `R-TP-004` | Third-Party / Vendor Risk | Un-validated vendor controls | Medium | High | High | Medium | Medium | Medium | Head of Vendor Management | Vendor Onboarding | VO-C004 |
| `R-TP-005` | Third-Party / Vendor Risk | Vendor financial distress | Medium | High | High | Medium | High | Medium | Head of Vendor Management | Vendor Onboarding | VO-C005 |
| `R-TP-006` | Third-Party / Vendor Risk | Weak contract clauses | Low | Medium | Medium | Low | Low | Low | Head of Vendor Management | Vendor Onboarding | VO-C006 |
| `R-TP-007` | Third-Party / Vendor Risk | 4th-party concentration | Medium | Medium | Medium | Medium | Medium | Medium | Head of Vendor Management | Vendor Onboarding | VO-C007 |
| `R-TP-008` | Third-Party / Vendor Risk | Vendor BCP failure | Medium | High | High | Medium | High | Medium | Head of BCM | Vendor Onboarding | VO-C008 |
| `R-TP-009` | Third-Party / Vendor Risk | Vendor privacy breach | Medium | High | High | Medium | High | Medium | Chief Privacy Officer | Vendor Onboarding | VO-C009 |
| `R-TP-010` | Third-Party / Vendor Risk | Insufficient approval authority | Low | Medium | Medium | Low | Low | Low | Head of Vendor Management | Vendor Onboarding | VO-C010 |
| `R-MR-001` | Model Risk | AML model under-alerts | Medium | High | High | Medium | High | Medium | Head of Model Risk Management | AML Alert Disposition | AML-C004 |
| `R-MR-002` | Model Risk | Unmanaged model | Medium | High | High | Low | High | Low | Head of Model Risk Management | Model Validation | MV-C001 |
| `R-MR-003` | Model Risk | Unsound model deployed | Medium | High | High | Medium | Medium | Medium | Head of Model Risk Management | Model Validation | MV-C002 |
| `R-MR-004` | Model Risk | Out-of-scope model use | Medium | High | High | Medium | Medium | Medium | Head of Model Risk Management | Model Validation | MV-C003 |
| `R-MR-005` | Model Risk | Model performance decay | Medium | High | High | Medium | Medium | Medium | Head of Model Risk Management | Model Validation | MV-C004 |
| `R-MR-006` | Model Risk | Weak model documentation | Medium | Medium | Medium | Low | Medium | Low | Head of Model Risk Management | Model Validation | MV-C005 |
| `R-MR-007` | Model Risk | Validator non-independence | Low | Medium | Medium | Low | Low | Low | Head of Model Risk Management | Model Validation | MV-C006 |
| `R-MR-008` | Model Risk | Open validation findings | High | High | High | Medium | High | Medium | Head of Model Risk Management | Model Validation | MV-C007 |
| `R-MR-009` | Model Risk | Past-due re-validation | High | High | High | Medium | High | Medium | Head of Model Risk Management | Model Validation | MV-C008 |
| `R-MR-010` | Model Risk | Biased AI/ML model | Medium | High | High | Medium | High | Medium | Head of Model Risk Management | Model Validation | MV-C009 |
| `R-MR-011` | Model Risk | Insufficient validation depth | Medium | Medium | Medium | Low | Medium | Low | Head of Model Risk Management | Model Validation | MV-C010 |
| `R-CR-001` | Credit Risk | Out-of-policy loan | Medium | High | High | Low | Medium | Low | Chief Credit Officer | Loan Origination | LO-C001 |
| `R-CR-002` | Credit Risk | Insufficient approval authority | Low | High | High | Low | Medium | Low | Chief Credit Officer | Loan Origination | LO-C002 |
| `R-CR-003` | Credit Risk | Covenant capture gap | Medium | Medium | Medium | Low | Medium | Low | Head of Loan Operations | Loan Origination | LO-C003 |
| `R-CR-004` | Credit Risk | Concentration breach | Medium | High | High | Medium | Medium | Medium | Head of Portfolio Management | Loan Origination | LO-C004 |
| `R-CR-005` | Credit Risk | Inflated appraisal | Low | Medium | Medium | Low | Medium | Low | Head of Real Estate Lending | Loan Origination | LO-C005 |
| `R-CR-006` | Credit Risk | Unverified income | Medium | High | High | Medium | Medium | Medium | Head of Consumer Lending | Loan Origination | LO-C006 |
| `R-CC-001` | Compliance & Conduct Risk | Tax certification miss | Low | Medium | Medium | Low | Low | Low | Head of Tax Operations | Customer Onboarding | CO-C009 |
| `R-CC-002` | Compliance & Conduct Risk | Adverse action violation | Medium | Medium | Medium | Low | Low | Low | Head of Consumer Lending | Loan Origination | LO-C007 |
| `R-CC-003` | Compliance & Conduct Risk | HMDA accuracy | Medium | High | High | Medium | Medium | Medium | Head of Mortgage Operations | Loan Origination | LO-C008 |
| `R-CC-004` | Compliance & Conduct Risk | Disparate pricing impact | Medium | High | High | Medium | Medium | Medium | Head of Fair Lending | Loan Origination | LO-C009 |
| `R-CC-005` | Compliance & Conduct Risk | TILA/RESPA violation | Medium | High | High | Low | Medium | Low | Head of Mortgage Operations | Loan Origination | LO-C010 |

**Risk descriptions.**

- `R-OP-001` — **Erroneous / unauthorised wire.** Erroneous or unauthorised wire released to an external counterparty
- `R-OP-002` — **Wire beyond authority.** Wire executed beyond authorised user/account limit
- `R-OP-003` — **Unidentified payment break.** Unidentified payment break leading to financial loss or misstatement
- `R-OP-004` — **Stale wire exceptions.** Stale unresolved exceptions causing customer harm or regulatory delay
- `R-OP-005` — **Failure of wire recall.** Failure to recover funds from erroneous wire due to delayed action
- `R-OP-006` — **Malformed SWIFT message.** Malformed SWIFT message causing rejection, delay or compliance gap
- `R-FC-002` — **Sanctioned-party payment.** Payment processed to an OFAC-sanctioned party
- `R-FC-003` — **BEC fraud.** Business email compromise (BEC) fraud causing customer loss
- `R-FC-004` — **Wire fraud / ATO.** Authorised push payment fraud / account takeover wire fraud
- `R-FC-005` — **Late OFAC report.** Late or unfiled OFAC blocked-transaction report
- `R-FC-006` — **Synthetic / stolen identity.** Account opened for a fictitious or stolen identity
- `R-FC-007` — **UBO unidentified.** Ultimate Beneficial Owner unidentified; entity used to hide control
- `R-FC-008` — **Mis-rated customer.** High-risk customer not flagged for Enhanced Due Diligence
- `R-FC-009` — **Inadequate EDD.** Inadequate due diligence on high-risk customer leading to undetected illicit activity
- `R-FC-010` — **Sanctioned customer.** Sanctioned party onboarded as customer
- `R-FC-011` — **Undeclared PEP.** Undeclared PEP exposure leading to reputational and AML risk
- `R-FC-012` — **Incomplete CIP.** Account activated with incomplete CIP data; regulatory finding
- `R-FC-013` — **Adverse-media miss.** Onboarding customer with material adverse media indicating financial crime
- `R-FC-014` — **Account active without CDD.** Account activated without complete CDD review; regulatory and reputational risk
- `R-FC-015` — **AML typology gap.** Typology gap leaving illicit activity undetected
- `R-FC-016` — **Alert backlog.** SAR-worthy activity missed due to alert backlog
- `R-FC-017` — **Late SAR.** Late or unfiled Suspicious Activity Report
- `R-FC-018` — **Investigator error.** Investigator error leading to incorrect alert disposition (false-close)
- `R-FC-019` — **Weak case file.** Inadequate case documentation undermining defensibility of decision
- `R-FC-020` — **Inappropriate de-escalation.** Inappropriate de-escalation suppressing SAR filing
- `R-FC-021` — **Stale risk rating.** Stale customer risk rating despite material new information
- `R-FC-022` — **Threshold change w/o governance.** Threshold change weakens detection without governance
- `R-FC-023` — **Productive alerts BTL.** Thresholds set such that productive alerts fall below the line
- `R-TP-001` — **Unsuitable vendor.** Engagement of an unsuitable or high-risk vendor
- `R-TP-002` — **Mis-tiered vendor.** Mis-tiered vendor receives insufficient oversight
- `R-TP-003` — **Vendor data breach.** Vendor causes customer-data breach due to weak security
- `R-TP-004` — **Un-validated vendor controls.** Reliance placed on un-validated vendor controls
- `R-TP-005` — **Vendor financial distress.** Critical vendor experiences financial distress disrupting service
- `R-TP-006` — **Weak contract clauses.** Missing contract clauses limiting bank's regulatory and operational rights
- `R-TP-007` — **4th-party concentration.** Hidden 4th-party concentration creates systemic exposure
- `R-TP-008` — **Vendor BCP failure.** Vendor cannot meet recovery objectives during disruption
- `R-TP-009` — **Vendor privacy breach.** Privacy / data-protection violation via vendor
- `R-TP-010` — **Insufficient approval authority.** Vendor approved at insufficient authority for its risk tier
- `R-MR-001` — **AML model under-alerts.** AML model under-alerts, leading to undetected illicit activity
- `R-MR-002` — **Unmanaged model.** Unknown / unmanaged model in production
- `R-MR-003` — **Unsound model deployed.** Conceptually unsound model deployed to production
- `R-MR-004` — **Out-of-scope model use.** Model used outside its valid range or for unintended purpose
- `R-MR-005` — **Model performance decay.** Model performance degraded but not detected; decisions impaired
- `R-MR-006` — **Weak model documentation.** Inadequate documentation undermining defensibility and reusability
- `R-MR-007` — **Validator non-independence.** Compromised validation due to lack of independence
- `R-MR-008` — **Open validation findings.** Open validation findings unresolved; risk persists in production
- `R-MR-009` — **Past-due re-validation.** Stale model in production beyond re-validation due date
- `R-MR-010` — **Biased AI/ML model.** AI/ML model produces biased or inexplicable decisions affecting customers
- `R-MR-011` — **Insufficient validation depth.** Insufficient validation depth for high-tier model
- `R-CR-001` — **Out-of-policy loan.** Loan booked outside credit policy without justified exception
- `R-CR-002` — **Insufficient approval authority.** Loan approved at insufficient authority for its size or risk
- `R-CR-003` — **Covenant capture gap.** Covenants not monitored due to incomplete capture at booking
- `R-CR-004` — **Concentration breach.** New loan causes breach of concentration limits
- `R-CR-005` — **Inflated appraisal.** Inflated collateral valuation due to appraiser influence
- `R-CR-006` — **Unverified income.** Loan approved on unverified or misrepresented income
- `R-CC-001` — **Tax certification miss.** Failure to obtain valid tax certification leading to IRS penalty
- `R-CC-002` — **Adverse action violation.** ECOA / FCRA adverse action notice violation
- `R-CC-003` — **HMDA accuracy.** Inaccurate HMDA submission leading to regulatory penalty
- `R-CC-004` — **Disparate pricing impact.** Disparate impact in pricing exceptions across protected classes
- `R-CC-005` — **TILA/RESPA violation.** TILA / RESPA disclosure timing or accuracy violation

---

## 4. Obligation register

51 atomic regulatory obligations. Each is keyed to a source, citation, and the controls that evidence it.

| Obligation ID | Source | Section / Citation | Jurisdiction | Linked Controls |
|---|---|---|---|---|
| `OBL-BSA-CIP-001` | Bank Secrecy Act | 31 USC §5318(l) / BSA §326 | US | CO-C001;CO-C007 |
| `OBL-CFR-1020-220` | 31 CFR §1020.220 | §1020.220 | US | CO-C001;CO-C007 |
| `OBL-CFR-1010-230` | 31 CFR §1010.230 | §1010.230 | US | CO-C002 |
| `OBL-CFR-1020-320` | 31 CFR §1020.320 | §1020.320 | US | AML-C002;AML-C003 |
| `OBL-FFIEC-BSA-001` | FFIEC BSA/AML Examination Manual | Customer Risk Profile | US | CO-C003;AML-C008 |
| `OBL-FFIEC-BSA-002` | FFIEC BSA/AML Examination Manual | EDD | US | CO-C004 |
| `OBL-FFIEC-BSA-003` | FFIEC BSA/AML Examination Manual | PEPs / Senior Foreign Political Figures | US | CO-C006 |
| `OBL-FFIEC-BSA-004` | FFIEC BSA/AML Examination Manual | Negative News | US | CO-C008 |
| `OBL-FFIEC-BSA-005` | FFIEC BSA/AML Examination Manual | BSA/AML Compliance Program | US | CO-C010 |
| `OBL-FFIEC-BSA-006` | FFIEC BSA/AML Examination Manual | Suspicious Activity Monitoring | US | AML-C001 |
| `OBL-FFIEC-BSA-007` | FFIEC BSA/AML Examination Manual | Model / System Validation | US | AML-C004;AML-C009;AML-C010 |
| `OBL-FFIEC-BSA-008` | FFIEC BSA/AML Examination Manual | Investigations & Documentation | US | AML-C005;AML-C006;AML-C007 |
| `OBL-OFAC-001` | OFAC Regulations | 31 CFR Chapter V | US | WP-C002;CO-C005 |
| `OBL-OFAC-002` | OFAC Sanctions Compliance Guidance | OFAC Framework (May 2019) | US | WP-C002 |
| `OBL-OFAC-003` | 31 CFR §501.603 / §501.604 | Reports of Blocked Property | US | WP-C008 |
| `OBL-UCC4A-001` | UCC Article 4A | §4A-201–4A-204 | US | WP-C001 |
| `OBL-UCC4A-002` | UCC Article 4A | §4A-211 | US | WP-C009 |
| `OBL-FFIEC-WPS-001` | FFIEC IT Examination Handbook — Wholesale Payment Systems | Operational Controls | US | WP-C001 |
| `OBL-FFIEC-WPS-002` | FFIEC IT Examination Handbook — Wholesale Payment Systems | Message Standards | US | WP-C010 |
| `OBL-FFIEC-AUTH-001` | FFIEC Authentication and Access to Financial Institution Services and Systems | 2021 Guidance | US | WP-C003;WP-C005 |
| `OBL-INTERNAL-AUTH-001` | Internal Authority Matrix | Bank Policy | US | WP-C004 |
| `OBL-INTERNAL-SLA-001` | Internal Operations Policy | Exception SLA | US | WP-C007 |
| `OBL-OCC-CH-001` | OCC Comptroller's Handbook — Internal Control | Reconciliation | US | WP-C006 |
| `OBL-IRS-W8W9-001` | IRS Forms W-8 / W-9 / FATCA | IRC Chapters 3 & 4 | US | CO-C009 |
| `OBL-SR117-001` | FRB SR 11-7 / OCC 2011-12 | Model Risk Management — General | US | MV-C001;MV-C005 |
| `OBL-SR117-002` | FRB SR 11-7 / OCC 2011-12 | Effective Validation | US | AML-C004;AML-C009;MV-C002;MV-C003;MV-C004;MV-C007;MV-C008;MV-C009;MV-C010 |
| `OBL-SR117-003` | FRB SR 11-7 / OCC 2011-12 | Independence | US | MV-C006 |
| `OBL-OCC-2023-17-001` | OCC Bulletin 2023-17 (Interagency TPRM) | Risk-Based Due Diligence | US | VO-C001;VO-C010 |
| `OBL-OCC-2023-17-002` | OCC Bulletin 2023-17 (Interagency TPRM) | Risk Tiering | US | VO-C002;VO-C005 |
| `OBL-OCC-2023-17-003` | OCC Bulletin 2023-17 (Interagency TPRM) | Information Security & SOC | US | VO-C003;VO-C004 |
| `OBL-OCC-2023-17-004` | OCC Bulletin 2023-17 (Interagency TPRM) | Contract Provisions | US | VO-C006 |
| `OBL-OCC-2023-17-005` | OCC Bulletin 2023-17 (Interagency TPRM) | Subcontractors | US | VO-C007 |
| `OBL-OCC-2023-17-006` | OCC Bulletin 2023-17 (Interagency TPRM) | Resilience | US | VO-C008 |
| `OBL-FFIEC-BCM-001` | FFIEC BCM Handbook | Third-Party Resilience | US | VO-C008 |
| `OBL-GLBA-001` | Gramm-Leach-Bliley Act / Safeguards | GLBA §501(b) | US | VO-C003;VO-C009 |
| `OBL-STATE-PRIVACY-001` | State privacy laws (e.g., CCPA/CPRA, applicable state laws) | Various | US | VO-C009 |
| `OBL-SOX-404-001` | Sarbanes-Oxley Act | §404 | US | VO-C004 |
| `OBL-OCC-CR-001` | OCC Comptroller's Handbook — Loan Portfolio Management | Underwriting Standards | US | LO-C001;LO-C006 |
| `OBL-OCC-CR-002` | OCC Comptroller's Handbook — Commercial Lending | Loan Administration | US | LO-C003 |
| `OBL-12CFR30-001` | 12 CFR 30 Appendix A / OCC Heightened Standards | Risk Governance | US | LO-C001;LO-C002;LO-C004 |
| `OBL-12CFR32-001` | 12 CFR 32 | Lending Limits | US | LO-C004 |
| `OBL-12CFR34-001` | 12 CFR 34 (Real Estate Lending) | Appraisals | US | LO-C005 |
| `OBL-FIRREA-001` | FIRREA Title XI | Appraiser Independence | US | LO-C005 |
| `OBL-CFR-1002-009` | Reg B / 12 CFR §1002.9 | Adverse Action Notification | US | LO-C007 |
| `OBL-FCRA-001` | Fair Credit Reporting Act | FCRA §615 | US | LO-C007 |
| `OBL-CFR-1003-001` | Reg C / 12 CFR 1003 | HMDA Reporting | US | LO-C008 |
| `OBL-ECOA-001` | Equal Credit Opportunity Act / Reg B | ECOA / 12 CFR 1002 | US | MV-C009;LO-C009 |
| `OBL-FHA-001` | Fair Housing Act | 42 USC §3601 et seq. | US | LO-C009 |
| `OBL-CFR-1026-001` | Reg Z / 12 CFR 1026 (TILA) | TRID Disclosures | US | LO-C010 |
| `OBL-CFR-1024-001` | Reg X / 12 CFR 1024 (RESPA) | TRID Disclosures | US | LO-C010 |
| `OBL-UDAAP-001` | Dodd-Frank §§1031, 1036 (UDAAP) | CFPB UDAAP | US | MV-C009 |

**Atomic requirements.**

- `OBL-BSA-CIP-001` (Bank Secrecy Act 31 USC §5318(l) / BSA §326) — Establish a Customer Identification Program; verify identity of each customer
- `OBL-CFR-1020-220` (31 CFR §1020.220 §1020.220) — Bank CIP rule — minimum identifying information and verification methods
- `OBL-CFR-1010-230` (31 CFR §1010.230 §1010.230) — Identify and verify beneficial owners of legal entity customers (CDD Rule)
- `OBL-CFR-1020-320` (31 CFR §1020.320 §1020.320) — File Suspicious Activity Reports within 30/60 days of detection
- `OBL-FFIEC-BSA-001` (FFIEC BSA/AML Examination Manual Customer Risk Profile) — Maintain a documented customer risk profile and ongoing CDD
- `OBL-FFIEC-BSA-002` (FFIEC BSA/AML Examination Manual EDD) — Apply Enhanced Due Diligence for higher-risk customers
- `OBL-FFIEC-BSA-003` (FFIEC BSA/AML Examination Manual PEPs / Senior Foreign Political Figures) — Identify and apply EDD to PEPs and related parties
- `OBL-FFIEC-BSA-004` (FFIEC BSA/AML Examination Manual Negative News) — Consider negative news as part of customer due diligence
- `OBL-FFIEC-BSA-005` (FFIEC BSA/AML Examination Manual BSA/AML Compliance Program) — Maintain a written BSA/AML compliance program approved by the Board
- `OBL-FFIEC-BSA-006` (FFIEC BSA/AML Examination Manual Suspicious Activity Monitoring) — Maintain risk-based suspicious activity monitoring covering products and customers
- `OBL-FFIEC-BSA-007` (FFIEC BSA/AML Examination Manual Model / System Validation) — Validate suspicious activity monitoring system periodically
- `OBL-FFIEC-BSA-008` (FFIEC BSA/AML Examination Manual Investigations & Documentation) — Document investigation, decision, and rationale for each alert
- `OBL-OFAC-001` (OFAC Regulations 31 CFR Chapter V) — Block or reject transactions with sanctioned parties; screen against SDN
- `OBL-OFAC-002` (OFAC Sanctions Compliance Guidance OFAC Framework (May 2019)) — Maintain risk-based sanctions compliance program with five components
- `OBL-OFAC-003` (31 CFR §501.603 / §501.604 Reports of Blocked Property) — Report blocked / rejected transactions to OFAC within 10 BD; annual filing
- `OBL-UCC4A-001` (UCC Article 4A §4A-201–4A-204) — Authentication of payment orders; security procedures for funds transfers
- `OBL-UCC4A-002` (UCC Article 4A §4A-211) — Cancellation and amendment of payment orders
- `OBL-FFIEC-WPS-001` (FFIEC IT Examination Handbook — Wholesale Payment Systems Operational Controls) — Implement segregation of duties and dual control over wire transfers
- `OBL-FFIEC-WPS-002` (FFIEC IT Examination Handbook — Wholesale Payment Systems Message Standards) — Validate payment messages for syntax, completeness, and counterparty data
- `OBL-FFIEC-AUTH-001` (FFIEC Authentication and Access to Financial Institution Services and Systems 2021 Guidance) — Layered security controls including out-of-band verification for high-risk transactions
- `OBL-INTERNAL-AUTH-001` (Internal Authority Matrix Bank Policy) — Enforce documented user/account/transaction limits per board-approved authority matrix
- `OBL-INTERNAL-SLA-001` (Internal Operations Policy Exception SLA) — Resolve payment exceptions within defined SLAs and escalate aged items
- `OBL-OCC-CH-001` (OCC Comptroller's Handbook — Internal Control Reconciliation) — Perform timely reconciliation of accounts with documented evidence
- `OBL-IRS-W8W9-001` (IRS Forms W-8 / W-9 / FATCA IRC Chapters 3 & 4) — Capture and validate tax certification at account opening; backup withholding where absent
- `OBL-SR117-001` (FRB SR 11-7 / OCC 2011-12 Model Risk Management — General) — Maintain a model inventory and documented model risk management framework
- `OBL-SR117-002` (FRB SR 11-7 / OCC 2011-12 Effective Validation) — Independently validate models pre-deployment and on cycle, including outcomes analysis
- `OBL-SR117-003` (FRB SR 11-7 / OCC 2011-12 Independence) — Validators must be independent of model developers and owners
- `OBL-OCC-2023-17-001` (OCC Bulletin 2023-17 (Interagency TPRM) Risk-Based Due Diligence) — Perform risk-based due diligence prior to engaging a third party
- `OBL-OCC-2023-17-002` (OCC Bulletin 2023-17 (Interagency TPRM) Risk Tiering) — Tier third parties based on criticality and risk profile
- `OBL-OCC-2023-17-003` (OCC Bulletin 2023-17 (Interagency TPRM) Information Security & SOC) — Assess information security and review independent assurance reports
- `OBL-OCC-2023-17-004` (OCC Bulletin 2023-17 (Interagency TPRM) Contract Provisions) — Include required contract provisions: audit, data, exit, BCP, breach notification
- `OBL-OCC-2023-17-005` (OCC Bulletin 2023-17 (Interagency TPRM) Subcontractors) — Identify and assess material subcontractor (4th-party) relationships
- `OBL-OCC-2023-17-006` (OCC Bulletin 2023-17 (Interagency TPRM) Resilience) — Validate vendor BCP / resilience and alignment to recovery objectives
- `OBL-FFIEC-BCM-001` (FFIEC BCM Handbook Third-Party Resilience) — Validate third-party resilience as part of bank BCM program
- `OBL-GLBA-001` (Gramm-Leach-Bliley Act / Safeguards GLBA §501(b)) — Protect customer non-public personal information including via service providers
- `OBL-STATE-PRIVACY-001` (State privacy laws (e.g., CCPA/CPRA, applicable state laws) Various) — Comply with state privacy laws when processing personal information
- `OBL-SOX-404-001` (Sarbanes-Oxley Act §404) — Maintain and assess internal control over financial reporting
- `OBL-OCC-CR-001` (OCC Comptroller's Handbook — Loan Portfolio Management Underwriting Standards) — Maintain prudent, written underwriting standards
- `OBL-OCC-CR-002` (OCC Comptroller's Handbook — Commercial Lending Loan Administration) — Document and monitor loan covenants throughout the life of the credit
- `OBL-12CFR30-001` (12 CFR 30 Appendix A / OCC Heightened Standards Risk Governance) — Maintain risk governance framework including credit limits and authority
- `OBL-12CFR32-001` (12 CFR 32 Lending Limits) — Comply with legal lending limits to a single borrower / related parties
- `OBL-12CFR34-001` (12 CFR 34 (Real Estate Lending) Appraisals) — Use independent appraisers; comply with appraisal standards
- `OBL-FIRREA-001` (FIRREA Title XI Appraiser Independence) — Maintain appraiser independence from loan production function
- `OBL-CFR-1002-009` (Reg B / 12 CFR §1002.9 Adverse Action Notification) — Provide adverse action notice within 30 days of credit decision
- `OBL-FCRA-001` (Fair Credit Reporting Act FCRA §615) — Provide adverse action notice when based in whole or part on consumer report
- `OBL-CFR-1003-001` (Reg C / 12 CFR 1003 HMDA Reporting) — Collect and report HMDA data points accurately and on time
- `OBL-ECOA-001` (Equal Credit Opportunity Act / Reg B ECOA / 12 CFR 1002) — Prohibit discrimination on prohibited bases in any aspect of a credit transaction
- `OBL-FHA-001` (Fair Housing Act 42 USC §3601 et seq.) — Prohibit discrimination in residential real estate-related transactions
- `OBL-CFR-1026-001` (Reg Z / 12 CFR 1026 (TILA) TRID Disclosures) — Deliver Loan Estimate and Closing Disclosure within prescribed timing/tolerance rules
- `OBL-CFR-1024-001` (Reg X / 12 CFR 1024 (RESPA) TRID Disclosures) — Deliver RESPA disclosures and comply with timing / tolerance rules
- `OBL-UDAAP-001` (Dodd-Frank §§1031, 1036 (UDAAP) CFPB UDAAP) — Prohibit unfair, deceptive, or abusive acts or practices

---

## 5. KRI register

64 Key Risk Indicators with green / amber / red thresholds, current value, and trend.

| KRI ID | Name | Linked Risks | Source | Freq. | Green | Amber | Red | Current | Trend | Linked Controls |
|---|---|---|---|---|---|---|---|---|---|---|
| `KRI-OP-001` | Wires released without dual approval | R-OP-001 | Payment Hub | Daily | 0% | >0–0.1% | >0.1% | 0.00% | Stable | WP-C001 |
| `KRI-OP-002` | Maker-checker SoD breaches | R-OP-001 | Payment Hub | Daily | 0 | 1–2 | >2 | 0 | Stable | WP-C001 |
| `KRI-OP-003` | Authority limit override rate | R-OP-002 | Payment Hub | Weekly | <0.5% | 0.5–1% | >1% | 0.32% | Improving | WP-C004 |
| `KRI-OP-004` | Aged nostro break items >30 days | R-OP-003 | Recon Tool | Weekly | <$50K | $50K–250K | >$250K | $140K | Worsening | WP-C006 |
| `KRI-OP-005` | Wire exception backlog | R-OP-004 | Payment Hub | Daily | <2% | 2–5% | >5% | 1.8% | Stable | WP-C007 |
| `KRI-OP-006` | Wire recall success rate | R-OP-005 | Recall Tracker | Monthly | >70% | 50–70% | <50% | 62% | Stable | WP-C009 |
| `KRI-OP-007` | SWIFT message rejection rate | R-OP-006 | SWIFT Gateway | Daily | <0.2% | 0.2–0.5% | >0.5% | 0.15% | Stable | WP-C010 |
| `KRI-FC-001` | Sanctions list update SLA | R-FC-002 | Screening Engine | Per-update | <2h | 2–8h | >8h | 1.2h | Stable | WP-C002 |
| `KRI-FC-002` | Sanctions hit aging | R-FC-002 | Screening Engine | Daily | 0 | 1–3 | >3 | 1 | Stable | WP-C002 |
| `KRI-FC-003` | Beneficiary callback completion | R-FC-003 | Payment Ops | Weekly | >99% | 97–99% | <97% | 98.4% | Worsening | WP-C003 |
| `KRI-FC-004` | Wire fraud loss | R-FC-004 | Fraud Ops | Quarterly | <$50K | $50K–250K | >$250K | $78K | Worsening | WP-C005 |
| `KRI-FC-005` | Late OFAC filings | R-FC-005 | Sanctions Ops | Per-event | 0 | 1 | >1 | 0 | Stable | WP-C008 |
| `KRI-FC-006` | ID&V failure rate | R-FC-006 | ID&V Vendor | Daily | <5% | 5–10% | >10% | 4.2% | Stable | CO-C001 |
| `KRI-FC-007` | UBO completeness rate | R-FC-007 | CRM | Weekly | >98% | 95–98% | <95% | 96.5% | Improving | CO-C002 |
| `KRI-FC-008` | High-risk customer ratio | R-FC-008 | Risk Engine | Monthly | 1–5% | 0.5–1% / 5–8% | <0.5% / >8% | 3.1% | Stable | CO-C003 |
| `KRI-FC-009` | EDD past-due cases | R-FC-009 | EDD Tool | Weekly | <5 | 5–15 | >15 | 11 | Worsening | CO-C004 |
| `KRI-FC-010` | Onboarding sanctions hits — open | R-FC-010 | Screening Engine | Daily | 0 | 1–2 | >2 | 0 | Stable | CO-C005 |
| `KRI-FC-011` | PEP escalation timeliness | R-FC-011 | EDD Tool | Weekly | >98% | 95–98% | <95% | 96.0% | Stable | CO-C006 |
| `KRI-FC-012` | CIP data completeness | R-FC-012 | CRM / Core | Daily | >99.5% | 98.5–99.5% | <98.5% | 99.7% | Stable | CO-C007 |
| `KRI-FC-013` | Adverse media disposition aging | R-FC-013 | Screening Engine | Weekly | <10 | 10–25 | >25 | 22 | Worsening | CO-C008 |
| `KRI-FC-014` | Activated accounts without CDD sign-off | R-FC-014 | Onboarding WF | Monthly | 0 | 1–2 | >2 | 0 | Stable | CO-C010 |
| `KRI-FC-015` | Scenarios with coverage gaps | R-FC-015 | FCC Strategy | Quarterly | 0 | 1–2 | >2 | 1 | Stable | AML-C001 |
| `KRI-FC-016` | AML alert backlog | R-FC-016 | Case Mgmt | Weekly | <2% | 2–5% | >5% | 6.1% | Worsening | AML-C002 |
| `KRI-FC-017` | L3 case aging | R-FC-016 | Case Mgmt | Weekly | <5 | 5–15 | >15 | 12 | Worsening | AML-C002 |
| `KRI-FC-018` | Late SAR filings | R-FC-017 | SAR Register | Monthly | 0% | >0–0.5% | >0.5% | 0.0% | Stable | AML-C003 |
| `KRI-FC-019` | QA error rate | R-FC-018 | QA System | Monthly | <3% | 3–6% | >6% | 4.7% | Stable | AML-C005 |
| `KRI-FC-020` | Cases below documentation standard | R-FC-019 | QA System | Monthly | <5% | 5–10% | >10% | 6.2% | Stable | AML-C006 |
| `KRI-FC-021` | Escalation reversal rate | R-FC-020 | Case Mgmt | Quarterly | <10% | 10–20% | >20% | 14% | Stable | AML-C007 |
| `KRI-FC-022` | Re-rating timeliness | R-FC-021 | Risk Engine | Monthly | >95% | 90–95% | <90% | 92% | Improving | AML-C008 |
| `KRI-FC-023` | Threshold changes outside governance | R-FC-022 | Tuning Register | Quarterly | 0 | 1 | >1 | 0 | Stable | AML-C009 |
| `KRI-FC-024` | BTL productive alert ratio | R-FC-023 | ATL/BTL Test | Annual | <2% | 2–5% | >5% | 3.8% | Worsening | AML-C010 |
| `KRI-TP-001` | DD package completeness | R-TP-001 | VMO Tool | Monthly | >98% | 95–98% | <95% | 97.0% | Stable | VO-C001 |
| `KRI-TP-002` | Tier-disagreement rate | R-TP-002 | VMO Tool | Quarterly | <5% | 5–10% | >10% | 7.5% | Stable | VO-C002 |
| `KRI-TP-003` | Stale SOC reports | R-TP-004 | VMO Tool | Monthly | 0 | 1–3 | >3 | 2 | Worsening | VO-C004 |
| `KRI-TP-004` | Vendor financial-distress signals | R-TP-005 | Vendor Mon. | Monthly | 0 | 1–2 | >2 | 1 | Stable | VO-C005 |
| `KRI-TP-005` | Contract clause completeness | R-TP-006 | Contract Mgmt | Quarterly | >95% | 90–95% | <90% | 94% | Improving | VO-C006 |
| `KRI-TP-006` | 4th-party inventory completeness | R-TP-007 | VMO Tool | Quarterly | >90% | 75–90% | <75% | 78% | Worsening | VO-C007 |
| `KRI-TP-007` | BCP test gaps | R-TP-008 | VMO Tool | Quarterly | 0 | 1–2 | >2 | 1 | Stable | VO-C008 |
| `KRI-TP-008` | Privacy assessment past-due | R-TP-009 | Privacy Tool | Monthly | 0 | 1–3 | >3 | 2 | Stable | VO-C009 |
| `KRI-TP-009` | Approvals below required authority | R-TP-010 | VMO Tool | Monthly | 0 | 1 | >1 | 0 | Stable | VO-C010 |
| `KRI-TC-001` | Vendor InfoSec assessment overdue | R-TP-003 | TPCR Tool | Monthly | 0 | 1–2 | >2 | 0 | Stable | VO-C003 |
| `KRI-MR-001` | Wire fraud model — false-negative rate | R-FC-004 | Model Mon. | Monthly | <5% | 5–10% | >10% | 6.5% | Stable | WP-C005 |
| `KRI-MR-002` | AML model — alert productivity | R-MR-001 | Model Mon. | Monthly | >5% | 3–5% | <3% | 4.1% | Worsening | AML-C004 |
| `KRI-MR-003` | Model inventory discoveries / quarter | R-MR-002 | MRM Inventory | Quarterly | 0 | 1–2 | >2 | 1 | Stable | MV-C001 |
| `KRI-MR-004` | Models deployed without validation | R-MR-003 | MRM Inventory | Monthly | 0 | 1 | >1 | 0 | Stable | MV-C002 |
| `KRI-MR-005` | Conceptual-soundness findings (open, high) | R-MR-004 | MRM Tracker | Monthly | 0 | 1–3 | >3 | 2 | Stable | MV-C003 |
| `KRI-MR-006` | Backtesting breaches | R-MR-005 | Model Mon. | Monthly | 0 | 1–2 | >2 | 2 | Worsening | MV-C004 |
| `KRI-MR-007` | Models without current documentation | R-MR-006 | MRM Inventory | Quarterly | 0 | 1–5 | >5 | 3 | Stable | MV-C005 |
| `KRI-MR-008` | Independence breaches | R-MR-007 | MRM Tracker | Annual | 0 | 1 | >1 | 0 | Stable | MV-C006 |
| `KRI-MR-009` | Open MRM findings (high severity) | R-MR-008 | MRM Tracker | Monthly | <5 | 5–15 | >15 | 17 | Worsening | MV-C007 |
| `KRI-MR-010` | Past-due re-validations | R-MR-009 | MRM Inventory | Monthly | 0 | 1–3 | >3 | 5 | Worsening | MV-C008 |
| `KRI-MR-011` | Fairness test exceptions | R-MR-010 | MRM Tracker | Quarterly | 0 | 1–2 | >2 | 2 | Stable | MV-C009 |
| `KRI-MR-012` | Validation scope deviations | R-MR-011 | MRM Tracker | Quarterly | <3 | 3–6 | >6 | 2 | Stable | MV-C010 |
| `KRI-CR-001` | Policy exceptions at underwriting | R-CR-001 | LOS | Monthly | <5% | 5–10% | >10% | 6.4% | Stable | LO-C001 |
| `KRI-CR-002` | Approvals below required authority | R-CR-002 | LOS | Monthly | 0% | >0–0.5% | >0.5% | 0.0% | Stable | LO-C002 |
| `KRI-CR-003` | Loans without complete covenants | R-CR-003 | Core | Monthly | <2% | 2–5% | >5% | 3.1% | Worsening | LO-C003 |
| `KRI-CR-004` | Concentration approaching limits | R-CR-004 | Portfolio Mgmt | Daily | <3 | 3–5 | >5 | 4 | Stable | LO-C004 |
| `KRI-CR-005` | Appraisal independence exceptions | R-CR-005 | LOS | Monthly | <2% | 2–5% | >5% | 1.4% | Stable | LO-C005 |
| `KRI-CR-006` | Income verification exceptions | R-CR-006 | LOS | Monthly | <3% | 3–7% | >7% | 2.8% | Stable | LO-C006 |
| `KRI-CC-001` | Tax certifications expired | R-CC-001 | Tax Ops Tool | Monthly | <1% | 1–3% | >3% | 0.7% | Stable | CO-C009 |
| `KRI-CC-002` | AAN past timing | R-CC-002 | LOS | Monthly | 0% | >0–0.5% | >0.5% | 0.1% | Stable | LO-C007 |
| `KRI-CC-003` | HMDA validation error rate | R-CC-003 | LOS / HMDA | Quarterly | <2% | 2–5% | >5% | 3.4% | Worsening | LO-C008 |
| `KRI-CC-004` | Pricing exception disparity | R-CC-004 | Fair Lending Tool | Quarterly | <1.2 | 1.2–1.5 | >1.5 | 1.35 | Stable | LO-C009 |
| `KRI-CC-005` | TRID timing breaches | R-CC-005 | LOS | Monthly | 0% | >0–0.2% | >0.2% | 0.05% | Stable | LO-C010 |

**KRI descriptions.**

- `KRI-OP-001` — **Wires released without dual approval.** % of wires bypassing maker-checker
- `KRI-OP-002` — **Maker-checker SoD breaches.** Cases where maker = checker (system override)
- `KRI-OP-003` — **Authority limit override rate.** % of wires routed to over-limit override
- `KRI-OP-004` — **Aged nostro break items >30 days.** $ of unresolved items aged >30 days
- `KRI-OP-005` — **Wire exception backlog.** Exceptions older than SLA
- `KRI-OP-006` — **Wire recall success rate.** % of recall requests resulting in fund return
- `KRI-OP-007` — **SWIFT message rejection rate.** % of outgoing SWIFT messages rejected
- `KRI-FC-001` — **Sanctions list update SLA.** Hours to load updated OFAC list
- `KRI-FC-002` — **Sanctions hit aging.** Open sanctions hits aged >2 BD
- `KRI-FC-003` — **Beneficiary callback completion.** % of required callbacks completed pre-release
- `KRI-FC-004` — **Wire fraud loss.** $ confirmed wire-fraud loss / quarter
- `KRI-FC-005` — **Late OFAC filings.** Blocked-tx reports filed >10 BD late
- `KRI-FC-006` — **ID&V failure rate.** % of onboarding ID&V failures
- `KRI-FC-007` — **UBO completeness rate.** % of legal entity files with full UBO
- `KRI-FC-008` — **High-risk customer ratio.** % of new customers rated high-risk
- `KRI-FC-009` — **EDD past-due cases.** EDD reviews past due >10 BD
- `KRI-FC-010` — **Onboarding sanctions hits — open.** Open sanctions hits at onboarding aged >2 BD
- `KRI-FC-011` — **PEP escalation timeliness.** % PEP cases escalated within 1 BD
- `KRI-FC-012` — **CIP data completeness.** % new accounts with complete CIP data
- `KRI-FC-013` — **Adverse media disposition aging.** Hits aged >5 BD without disposition
- `KRI-FC-014` — **Activated accounts without CDD sign-off.** Count per month
- `KRI-FC-015` — **Scenarios with coverage gaps.** Scenarios flagged in last review without remediation
- `KRI-FC-016` — **AML alert backlog.** % of alerts past SLA
- `KRI-FC-017` — **L3 case aging.** L3 cases open >30 BD
- `KRI-FC-018` — **Late SAR filings.** % SARs filed past statutory window
- `KRI-FC-019` — **QA error rate.** % QA-tested cases with material errors
- `KRI-FC-020` — **Cases below documentation standard.** % of QA-sampled cases failing doc standard
- `KRI-FC-021` — **Escalation reversal rate.** % of L1→L2 escalations later closed at L2 with no action
- `KRI-FC-022` — **Re-rating timeliness.** % post-investigation re-ratings within 10 BD
- `KRI-FC-023` — **Threshold changes outside governance.** Count per quarter
- `KRI-FC-024` — **BTL productive alert ratio.** % of BTL sample that would produce SAR
- `KRI-TP-001` — **DD package completeness.** % of new vendors with complete DD pre-contract
- `KRI-TP-002` — **Tier-disagreement rate.** % of tier reviews changing the assigned tier
- `KRI-TP-003` — **Stale SOC reports.** Critical/High vendors with SOC report >12mo old
- `KRI-TP-004` — **Vendor financial-distress signals.** Critical/High vendors with adverse financial signals
- `KRI-TP-005` — **Contract clause completeness.** % of contracts with all required clauses
- `KRI-TP-006` — **4th-party inventory completeness.** % of Critical vendors with disclosed 4th parties
- `KRI-TP-007` — **BCP test gaps.** Critical vendors without current BCP test evidence
- `KRI-TP-008` — **Privacy assessment past-due.** Vendors handling NPI past privacy reassessment
- `KRI-TP-009` — **Approvals below required authority.** Onboardings approved below tier requirement
- `KRI-TC-001` — **Vendor InfoSec assessment overdue.** Critical vendors with overdue InfoSec assessment
- `KRI-MR-001` — **Wire fraud model — false-negative rate.** Estimated FN rate from outcomes review
- `KRI-MR-002` — **AML model — alert productivity.** % alerts becoming SAR-eligible
- `KRI-MR-003` — **Model inventory discoveries / quarter.** Models found outside inventory each quarter
- `KRI-MR-004` — **Models deployed without validation.** Models in production without validation evidence
- `KRI-MR-005` — **Conceptual-soundness findings (open, high).** Count of open high-severity conceptual findings
- `KRI-MR-006` — **Backtesting breaches.** Models breaching backtesting thresholds
- `KRI-MR-007` — **Models without current documentation.** Count vs. inventory
- `KRI-MR-008` — **Independence breaches.** Validations failing independence check
- `KRI-MR-009` — **Open MRM findings (high severity).** Count of open high-severity findings
- `KRI-MR-010` — **Past-due re-validations.** Models past validation due date
- `KRI-MR-011` — **Fairness test exceptions.** AI/ML models with open fairness findings
- `KRI-MR-012` — **Validation scope deviations.** Validations with approved deviation from standard scope
- `KRI-CR-001` — **Policy exceptions at underwriting.** % of approvals with policy exception
- `KRI-CR-002` — **Approvals below required authority.** % of loans approved below required level
- `KRI-CR-003` — **Loans without complete covenants.** % post-booking with covenant gaps
- `KRI-CR-004` — **Concentration approaching limits.** Buckets within 10% of limit
- `KRI-CR-005` — **Appraisal independence exceptions.** Loans with documented independence exception
- `KRI-CR-006` — **Income verification exceptions.** % loans approved with documented verification exception
- `KRI-CC-001` — **Tax certifications expired.** % accounts with expired W-8/W-9
- `KRI-CC-002` — **AAN past timing.** % adverse action notices issued >30 days
- `KRI-CC-003` — **HMDA validation error rate.** % of LAR records with errors at quarterly validation
- `KRI-CC-004` — **Pricing exception disparity.** Disparity ratio in pricing exceptions across protected classes
- `KRI-CC-005` — **TRID timing breaches.** Loans with disclosure timing breach

---

## 6. Issue register

22 sample open issues spanning audit, regulatory, self-identified, and 2LoD sources. Each links to controls and risks.

| Issue ID | Title | Source | Severity | Status | Days Open | Owner | Due | Linked Controls | Linked Risks |
|---|---|---|---|---|---|---|---|---|---|
| `ISS-2026-007` | Sanctions screening — list-load delay during weekend window | Internal Audit | Medium | In Remediation | 95 | Head of Sanctions Compliance | 2026-06-30 | WP-C002 | R-FC-002 |
| `ISS-2026-009` | AML — alert backlog exceeds amber threshold | Self-Identified | High | In Remediation | 82 | Head of AML Investigations | 2026-07-31 | AML-C002 | R-FC-016 |
| `ISS-2026-012` | Wire callback — incomplete documentation pattern | 2LoD QA | Medium | In Remediation | 71 | Head of Payment Operations | 2026-05-31 | WP-C003 | R-FC-003 |
| `ISS-2026-014` | Fair lending — pricing-exception disparity drift in Q1 | Fair Lending Office | Medium | In Remediation | 47 | Head of Fair Lending | 2026-09-30 | LO-C009 | R-CC-004 |
| `ISS-2026-018` | Nostro recon — aged break population | Self-Identified | Medium | In Remediation | 39 | Head of Reconciliation Operations | 2026-08-31 | WP-C006 | R-OP-003 |
| `ISS-2026-019` | Model — backtesting breach on retail credit scoring model | Model Risk | Medium | In Remediation | 37 | Head of Model Risk Management | 2026-09-30 | MV-C004 | R-MR-005 |
| `ISS-2026-023` | Onboarding — UBO certification gaps in legal-entity files | Internal Audit | Medium | In Remediation | 35 | Head of Commercial Onboarding | 2026-08-31 | CO-C002 | R-FC-007 |
| `ISS-2026-027` | Vendor tiering — under-tiering pattern for analytics SaaS | Vendor Management | Medium | In Remediation | 32 | Head of Vendor Management | 2026-08-31 | VO-C002 | R-TP-002 |
| `ISS-2026-029` | AI/ML — fairness findings on small-dollar lending model | Model Risk | High | In Remediation | 29 | Head of Model Risk Management | 2026-09-30 | MV-C009 | R-MR-010 |
| `ISS-2026-031` | EDD — past-due cases trending into amber | FCC Self-Identified | Medium | In Remediation | 27 | Head of Financial Crime Compliance | 2026-07-31 | CO-C004 | R-FC-009 |
| `ISS-2026-035` | SOC — stale reports on two Critical vendors | Vendor Management | Medium | In Remediation | 24 | Head of Vendor Management | 2026-07-31 | VO-C004 | R-TP-004 |
| `ISS-2026-038` | Loan Origination — covenant-capture gap on commercial bookings | Internal Audit | Medium | In Remediation | 22 | Head of Loan Operations | 2026-08-31 | LO-C003 | R-CR-003 |
| `ISS-2026-040` | Adverse media — disposition aging into amber | FCC QA | Medium | In Remediation | 18 | Head of Financial Crime Compliance | 2026-08-31 | CO-C008 | R-FC-013 |
| `ISS-2026-044` | Model findings — open high-severity items above tolerance | Internal Audit | High | In Remediation | 16 | Head of Model Risk Management | 2026-10-31 | MV-C007 | R-MR-008 |
| `ISS-2026-046` | HMDA — Q1 validation error rate above tolerance | Mortgage Compliance | Medium | In Remediation | 14 | Head of Mortgage Operations | 2026-09-30 | LO-C008 | R-CC-003 |
| `ISS-2026-051` | Past-due model re-validations | Model Risk | High | In Remediation | 11 | Head of Model Risk Management | 2026-10-31 | MV-C008 | R-MR-009 |
| `ISS-2026-052` | AML — L3 case aging trending high | FCC Self-Identified | Medium | In Remediation | 11 | Head of AML Investigations | 2026-09-30 | AML-C002 | R-FC-016 |
| `ISS-2025-072` | AML model — outcomes drift in cross-border typology | Model Risk | Medium | In Validation | 185 | Head of Model Risk Management | 2026-04-30 | AML-C004 | R-MR-001 |
| `ISS-2025-079` | ATL/BTL test — productive alerts in BTL band | Model Risk + FCC | Medium | In Remediation | 202 | Head of Financial Crime Compliance | 2026-04-30 | AML-C010 | R-FC-023 |
| `ISS-2025-088` | AML — typology coverage gap in P2P digital flows | FCC Self-Identified | Medium | In Remediation | 138 | Head of Financial Crime Compliance | 2026-06-30 | AML-C001 | R-FC-015 |
| `ISS-2025-094` | Wire recall — playbook ambiguity on cross-border recalls | Internal Audit | Low | In Remediation | 136 | Head of Payment Operations | 2026-06-30 | WP-C009 | R-OP-005 |
| `ISS-2025-098` | Vendor 4th-party inventory — completeness below target | Vendor Management | Medium | In Remediation | 131 | Head of Vendor Management | 2026-06-30 | VO-C007 | R-TP-007 |

**Issue detail.**

- `ISS-2026-007` — **Sanctions screening — list-load delay during weekend window** (Internal Audit, Medium). _Root cause:_ Vendor SLA gap. _Description:_ Audit testing identified load times of up to 12h on weekends due to vendor batch schedule. Plan: contractually shorten SLA and add monitoring.
- `ISS-2026-009` — **AML — alert backlog exceeds amber threshold** (Self-Identified, High). _Root cause:_ Capacity / staffing. _Description:_ Alert backlog ratio rose from 2.1% to 6.1% over Q4–Q1 due to volume + attrition. Plan: temporary contractor support, scenario re-tuning, automation pilot.
- `ISS-2026-012` — **Wire callback — incomplete documentation pattern** (2LoD QA, Medium). _Root cause:_ Documentation standard not enforced. _Description:_ Q1 QA found 6/30 sampled callbacks lacked timestamp/recorded number. Plan: enforce required-field workflow update + targeted refresher.
- `ISS-2026-014` — **Fair lending — pricing-exception disparity drift in Q1** (Fair Lending Office, Medium). _Root cause:_ Branch-level discretion. _Description:_ Pricing exception disparity ratio drifted toward amber (1.35). Plan: tighten exception authority, add manager review, retraining.
- `ISS-2026-018` — **Nostro recon — aged break population** (Self-Identified, Medium). _Root cause:_ Upstream payment data quality. _Description:_ Aged items >30 days reached $140K in March. Root cause: malformed remittance from one correspondent. Plan: data-quality fix + stronger aging escalation.
- `ISS-2026-019` — **Model — backtesting breach on retail credit scoring model** (Model Risk, Medium). _Root cause:_ Population shift post-rate-change. _Description:_ Outcomes analysis showed performance drift exceeding amber. Plan: recalibration + interim conservative overlay.
- `ISS-2026-023` — **Onboarding — UBO certification gaps in legal-entity files** (Internal Audit, Medium). _Root cause:_ Process gap on entity refresh. _Description:_ IA sample identified 3/40 files with missing or outdated UBO certification. Plan: workflow gating + remediation pass on existing book.
- `ISS-2026-027` — **Vendor tiering — under-tiering pattern for analytics SaaS** (Vendor Management, Medium). _Root cause:_ Tiering questionnaire ambiguity. _Description:_ Tiering review re-classified 4 vendors from Medium to High. Plan: questionnaire update + retro re-tiering of analytics SaaS portfolio.
- `ISS-2026-029` — **AI/ML — fairness findings on small-dollar lending model** (Model Risk, High). _Root cause:_ Feature interaction with proxy variables. _Description:_ Validation flagged elevated disparate-impact metric on protected class. Plan: feature reassessment, model retraining, fair-lending sign-off before relaunch.
- `ISS-2026-031` — **EDD — past-due cases trending into amber** (FCC Self-Identified, Medium). _Root cause:_ Capacity. _Description:_ 11 EDD cases past due >10 BD. Plan: surge resourcing + workflow re-prioritisation.
- `ISS-2026-035` — **SOC — stale reports on two Critical vendors** (Vendor Management, Medium). _Root cause:_ Vendor delivery slip. _Description:_ Two Critical vendors have SOC 2 reports older than 12 months. Plan: contractual escalation + interim controls bridge.
- `ISS-2026-038` — **Loan Origination — covenant-capture gap on commercial bookings** (Internal Audit, Medium). _Root cause:_ LOS field optionality. _Description:_ IA identified 3.1% of commercial bookings missing one or more covenants in core. Plan: enforce mandatory fields, retro-capture exercise.
- `ISS-2026-040` — **Adverse media — disposition aging into amber** (FCC QA, Medium). _Root cause:_ Volume + analyst rotation. _Description:_ 22 adverse-media hits aged >5 BD. Plan: routing changes + dedicated triage pod.
- `ISS-2026-044` — **Model findings — open high-severity items above tolerance** (Internal Audit, High). _Root cause:_ Remediation slippage. _Description:_ Open high-severity MRM findings reached 17 vs. tolerance of 5. Plan: prioritisation review with model owners + monthly governance focus.
- `ISS-2026-046` — **HMDA — Q1 validation error rate above tolerance** (Mortgage Compliance, Medium). _Root cause:_ LOS data-mapping change. _Description:_ Q1 LAR validation showed 3.4% error rate (amber). Plan: rectify mapping, scrub data, retest.
- `ISS-2026-051` — **Past-due model re-validations** (Model Risk, High). _Root cause:_ Resource constraints in MRM. _Description:_ Five models past re-validation due date. Plan: prioritisation, contracted validation support, interim use-restriction memos.
- `ISS-2026-052` — **AML — L3 case aging trending high** (FCC Self-Identified, Medium). _Root cause:_ Complex cases / capacity. _Description:_ L3 cases open >30 BD reached 12. Plan: senior investigator allocation + complex-case playbook update.
- `ISS-2025-072` — **AML model — outcomes drift in cross-border typology** (Model Risk, Medium). _Root cause:_ Typology change. _Description:_ Annual validation found outcomes drift in cross-border scenario. Plan: scenario tuning + refreshed outcomes review.
- `ISS-2025-079` — **ATL/BTL test — productive alerts in BTL band** (Model Risk + FCC, Medium). _Root cause:_ Threshold calibration. _Description:_ BTL sample showed 3.8% productive — above 2% green. Plan: targeted threshold lowering for two scenarios after governance review.
- `ISS-2025-088` — **AML — typology coverage gap in P2P digital flows** (FCC Self-Identified, Medium). _Root cause:_ Product evolution. _Description:_ Coverage review identified gap on P2P typologies. Plan: build new scenario, validate, deploy.
- `ISS-2025-094` — **Wire recall — playbook ambiguity on cross-border recalls** (Internal Audit, Low). _Root cause:_ Playbook gap. _Description:_ IA noted ambiguity in cross-border recall steps. Plan: playbook update + tabletop exercise.
- `ISS-2025-098` — **Vendor 4th-party inventory — completeness below target** (Vendor Management, Medium). _Root cause:_ Disclosure gap with vendors. _Description:_ Critical-vendor 4th-party disclosure at 78% vs target 90%. Plan: contractual amendments + scheduled disclosure review.

---

## 7. Risk appetite register

15 appetite metrics, each with green/amber/red thresholds and current status.

| Appetite ID | Domain | Metric | Linked Risks | Green | Amber | Red | Current | Owner |
|---|---|---|---|---|---|---|---|---|
| `APP-OP-001` | Operational Risk | Wire payment loss / quarter | R-OP-001;R-OP-005 | <$50K | $50K–$250K | >$250K | Green | Head of Operations |
| `APP-OP-002` | Operational Risk | Aged reconciling items >30 days | R-OP-003 | <$50K | $50K–$250K | >$250K | Amber | Head of Operations |
| `APP-FC-001` | Financial Crime Risk | OFAC strict-liability events | R-FC-002;R-FC-010 | 0 | n/a | ≥1 | Green | Head of Sanctions Compliance |
| `APP-FC-002` | Financial Crime Risk | AML alert backlog % | R-FC-016 | <2% | 2–5% | >5% | Red | Head of Financial Crime Compliance |
| `APP-FC-003` | Financial Crime Risk | Late SAR filings % | R-FC-017 | 0% | >0–0.5% | >0.5% | Green | BSA Officer |
| `APP-FC-004` | Financial Crime Risk | Wire fraud loss / quarter | R-FC-003;R-FC-004 | <$50K | $50K–$250K | >$250K | Amber | Head of Fraud Operations |
| `APP-TP-001` | Third-Party / Vendor Risk | Critical vendors with stale assurance | R-TP-004 | 0 | 1–3 | >3 | Amber | Head of Vendor Management |
| `APP-TP-002` | Third-Party / Vendor Risk | Critical vendor incident count / year | R-TP-003;R-TP-008 | 0 | 1–2 | >2 | Green | Head of Vendor Management |
| `APP-MR-001` | Model Risk | Past-due model re-validations | R-MR-009 | 0 | 1–3 | >3 | Red | Head of Model Risk Management |
| `APP-MR-002` | Model Risk | Open high-severity MRM findings | R-MR-008 | <5 | 5–15 | >15 | Red | Head of Model Risk Management |
| `APP-CR-001` | Credit Risk | Concentration buckets in breach | R-CR-004 | 0 | 1 | >1 | Green | Chief Credit Officer |
| `APP-CR-002` | Credit Risk | Policy-exception rate % | R-CR-001 | <5% | 5–10% | >10% | Amber | Chief Credit Officer |
| `APP-CC-001` | Compliance & Conduct Risk | Pricing-exception disparity ratio | R-CC-004 | <1.2 | 1.2–1.5 | >1.5 | Amber | Head of Fair Lending |
| `APP-CC-002` | Compliance & Conduct Risk | TRID timing breaches | R-CC-005 | 0% | >0–0.2% | >0.2% | Green | Head of Mortgage Operations |
| `APP-CC-003` | Compliance & Conduct Risk | HMDA validation error rate % | R-CC-003 | <2% | 2–5% | >5% | Amber | Head of Mortgage Operations |

---

## 8. Ingestion notes for downstream chats

This RCM is structured to be the **canonical input** for downstream artifacts. Subsequent chats should treat the following as load-bearing:

**Stable identifiers.** Every entity has a stable ID following the conventions in the header. Downstream artifacts (JSON Schemas, DDL, API contracts, UI mocks) should reference these IDs verbatim — do not regenerate or renumber.

**Schema as contract.** Section 1 is the field dictionary. When generating JSON Schema or relational DDL, treat field names, types, required-flags, and enum vocabularies as normative. Add platform-specific fields (audit columns, soft-delete flags, tenant IDs) but do not rename or retype these.

**Relationships.** The implicit graph is:

```
Process ── (1..*) ── Control ── (1..1) ── Risk
                       │                    │
                       ├── (0..*) ── Obligation
                       ├── (0..*) ── KRI ── (0..*) ── Risk
                       └── (0..*) ── Issue ── (0..*) ── Risk
                                                          │
                                                Risk ── (0..*) ── AppetiteMetric
```

All relationships in this baseline are surfaced through the `Linked …` columns. When materializing the data model, expect to break each multi-value cell into a join table.

**Persona-by-view matrix.** When generating UI specs, the following five lenses should each be derivable from the same underlying data (no re-modelling required):

| Persona | Primary view | Anchor entity | Default filter |
|---|---|---|---|
| CRO / CAO | Heatmap by risk domain; top issues; appetite breaches | Risk → AppetiteMetric | residual rating + trend |
| Head of Compliance / Risk | Control universe with effectiveness; obligation coverage | Control × Obligation | last test result; coverage gaps |
| Compliance Officer / Auditor | Control row → test history → evidence → exceptions | Control → Test → Evidence | testing cycle; observation status |
| Process Owner | Process view with embedded controls + KRIs | Process → Control + KRI | KRI status; control failures |
| Frontline Operator | Single control instance — "did I do this step correctly?" | ControlInstance | open queue; assigned to me |

**Design-time vs. run-time separation.** This RCM defines design-time entities. Subsequent platform specs should introduce sibling run-time entities (`ControlInstance`, `ProcessExecution`, `EvidenceArtifact`, `TestExecution`) that reference these as their type definitions and carry their own temporal data.

**Anchor processes for MVP.** The six processes covered here (Wire Payments, Customer Onboarding, AML Alert Disposition, Vendor Onboarding, Model Validation, Loan Origination) are deliberately chosen to give cross-domain coverage (operational, financial crime, model, credit, third-party) and high regulatory visibility. They are the recommended scope for the platform MVP.

---

_End of document. Companion Excel artifact carries the same content in tabular, ingestion-friendly form._