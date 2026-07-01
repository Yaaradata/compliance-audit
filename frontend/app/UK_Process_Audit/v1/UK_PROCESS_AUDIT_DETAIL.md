# UK Banking Process Audit — Dashboard & Data Documentation

**Route:** `http://localhost:3000/UK_Process_Audit/v1`
**Module:** `UK_Process_Audit` · version `v1`
**Reference design:** `Indian_Process_Audit/v3` (identical screen system, UK data)

---

## 1. What this module is

The UK Banking Process Audit is an operational **process-and-control intelligence** dashboard for a UK retail/SME bank's internal audit function. It maps the bank's day-to-day operating procedures (SOPs) to the controls that mitigate their risks, tests those controls, and evidences the results down to individual customer/transaction cases.

It answers three auditor questions for every process domain:

1. **Process flow** — Is each step of the SOP operating, who owns it, and where are the misses?
2. **Journey matrix** — For real cases (customers, payments, claims…), did every control pass across the whole journey, and who submitted the evidence?
3. **Control register** — What is the full control library, its compliance, and its residual risk?

### Data provenance

- **Control library (real):** sourced verbatim from `uk_bank_operational_controls.csv` — **104 controls across 8 domains**, each with its SOP step, risk, control description, nature, source, automation level, primary obligation, issuing body, evidence type, evidence source system, testing frequency and control owner role.
- **Regulatory alignment (reference):** cross-checked against `canonical_domain_identification_union.md`, `Canonical_SOP_Mapping.md`, `chatgpt_consolidated.md` and `gemini-Regulatory & Obligation Landscape Mapping.md`.
- **Audit test metrics (synthetic):** population, sample, exceptions, violations, pass rate, residual risk, testers, dates, cases and evidence trails are **deterministically generated** (they are not in the CSV) to make the dashboard demonstrable. Generation is seeded per control/case so results are stable across reloads.

---

## 2. Domains at a glance

The audit universe is organised into **8 process domains** (plus a cross-domain Overview).

| # | Code | Domain | Controls | Lead regulators / obligations |
|---|------|--------|:--------:|-------------------------------|
| 1 | `ONB` | Customer Onboarding & KYC | 13 | MLR 2017, SAMLA 2018, FCA BCOBS (HM Treasury / FCA) |
| 2 | `DEP` | Deposits & Account Servicing | 16 | FCA BCOBS, PRA Depositor Protection, Dormant Assets Act 2022, CASS |
| 3 | `PAY` | Payments & Transaction Processing | 14 | PSRs 2017, Pay.UK schemes, BoE RTGS/CHAPS, E-Money Regs 2011 |
| 4 | `LEN` | Lending Origination & Underwriting | 12 | FCA CONC / MCOB, PRA credit risk, CCA 1974 |
| 5 | `COL` | Collections & Recoveries | 12 | FCA CONC 7 / MCOB 13, CCA 1974, IFRS 9 |
| 6 | `FC` | Financial Crime (AML/CTF & Sanctions) | 14 | MLR 2017, SAMLA 2018, POCA 2002, Bribery Act 2010 |
| 7 | `FRD` | Fraud & Scams Management | 12 | PSR APP reimbursement, PSRs 2017, Consumer Duty |
| 8 | `CMP` | Complaints & Redress | 11 | FCA DISP, Financial Ombudsman Service (FOS) |
| | | **Total** | **104** | |

### Control mix across all 104 controls

- **By nature:** Preventive **51** · Detective **45** · Corrective **8**
- **By automation:** Automated **25** · Semi-automated **71** · Manual **8**

---

## 3. Domain detail & control register

Each table lists every control in the domain: **Control ID · SOP step · nature · automation · primary obligation · issuing body · control owner**.

### 3.1 `ONB` — Customer Onboarding & KYC (13 controls)

*End-to-end onboarding — intake, CDD, screening, risk-rating, approval, activation and lifecycle maintenance under MLR 2017 and Consumer Duty.*

| Control | SOP step | Nature | Automation | Primary obligation | Body | Owner |
|---------|----------|--------|------------|--------------------|------|-------|
| ONB-01 | Application & Data Capture / Intake | Preventive | Automated | MLR 2017 reg 27–28 | HM Treasury | Onboarding Operations Manager |
| ONB-02 | Initial Data Completeness & Eligibility Check | Preventive | Automated | MLR 2017 | HM Treasury | Onboarding Analyst Team Lead |
| ONB-03 | Identity Verification & CDD | Preventive | Automated | MLR 2017 reg 27–28 (CDD) | HM Treasury | KYC/CDD Team Manager |
| ONB-04 | UBO / Beneficial Ownership & Control Assessment | Preventive | Semi-automated | MLR 2017 reg 5 & 28 | HM Treasury | KYB / Entity Onboarding Manager |
| ONB-05 | Sanctions, PEP & Adverse-Media Screening | Preventive | Automated | SAMLA 2018 | HM Treasury | Financial Crime Screening Manager |
| ONB-06 | Customer Risk Assessment / Rating | Preventive | Automated | MLR 2017 reg 18–18A | HM Treasury | Financial Crime Risk Manager |
| ONB-07 | Enhanced Due Diligence (high-risk / PEP) | Preventive | Semi-automated | MLR 2017 reg 33–35 | HM Treasury | EDD Specialist / MLRO Delegate |
| ONB-08 | Onboarding Decision & Approval | Preventive | Semi-automated | MLR 2017 | HM Treasury | Onboarding Approvals Manager / MLRO |
| ONB-09 | Account Activation & Customer Record Creation | Preventive | Semi-automated | MLR 2017 (recordkeeping) | HM Treasury | Customer Master Data Manager |
| ONB-10 | Customer Communication & Terms Issuance | Preventive | Semi-automated | FCA BCOBS | FCA | Customer Communications Manager |
| ONB-11 | Ongoing / Trigger-Based Monitoring & Maintenance | Detective | Semi-automated | MLR 2017 reg 28(11) | HM Treasury | KYC Operations Manager |
| ONB-12 | Periodic / Trigger-Based Re-KYC / Refresh | Detective | Semi-automated | MLR 2017 reg 28(11) | HM Treasury | KYC Refresh / Lifecycle Manager |
| ONB-13 | Offboarding / Exit & Recordkeeping | Corrective | Semi-automated | MLR 2017 reg 40 (5-yr retention) | HM Treasury | Customer Exit / Records Manager |

### 3.2 `DEP` — Deposits & Account Servicing (16 controls)

*Deposit and account lifecycle — setup, opening, servicing, dormancy, depositor protection (SCV/FSCS) and closure under BCOBS and the PRA Rulebook.*

| Control | SOP step | Nature | Automation | Primary obligation | Body | Owner |
|---------|----------|--------|------------|--------------------|------|-------|
| DEP-01 | Product Setup & Account Parameter Configuration | Preventive | Semi-automated | FCA BCOBS | FCA | Product Operations Manager |
| DEP-02 | Account Opening / Activation | Preventive | Automated | MLR 2017 (CDD gate) | HM Treasury | Deposit Operations Manager |
| DEP-03 | Product Selection & Disclosure | Preventive | Semi-automated | Consumer Duty | FCA | Product Governance Lead |
| DEP-04 | Mandate & Signatory Setup | Preventive | Semi-automated | Firm mandate rules | Internal | Account Services Manager |
| DEP-05 | Interest & Fee Application / Capitalisation | Detective | Automated | FCA BCOBS | FCA | Deposit Operations Manager |
| DEP-06 | Overdraft Limit Management | Preventive | Semi-automated | FCA CONC 5A | FCA | Retail Credit / Overdraft Manager |
| DEP-07 | Transaction & Statement Processing | Detective | Automated | FCA BCOBS (statements) | FCA | Account Servicing Manager |
| DEP-08 | Standing Data Maintenance & Account Maintenance | Preventive | Semi-automated | UK GDPR (accuracy) | ICO | Account Servicing Team Lead |
| DEP-09 | Ongoing Servicing | Detective | Semi-automated | FCA BCOBS | FCA | Account Servicing Manager |
| DEP-10 | Dormancy & Unclaimed Balances | Preventive | Semi-automated | Dormant Assets Act 2022 | HM Treasury | Dormant Accounts Operations Manager |
| DEP-11 | Account Restriction / Freeze / Hold Processing | Preventive | Semi-automated | POCA 2002 | NCA | Account Controls Manager |
| DEP-12 | Single Customer View (SCV) / FSCS Depositor Protection | Detective | Automated | PRA Rulebook — Depositor Protection | PRA | Depositor Protection / SCV Reporting Manager |
| DEP-13 | Account Closure & Switching | Detective | Semi-automated | Pay.UK CASS rules | Pay.UK | Switching Operations Manager |
| DEP-14 | Access-to-Cash & Servicing Channels | Preventive | Semi-automated | FSMA 2023 access-to-cash | FCA | Branch & Channel Operations Manager |
| DEP-15 | Error Correction & Adjustment | Corrective | Semi-automated | FCA BCOBS | FCA | Deposit Operations Manager |
| DEP-16 | Complaints / Exceptions Handling | Detective | Semi-automated | FCA DISP (interface) | FCA | Customer Operations Team Lead |

### 3.3 `PAY` — Payments & Transaction Processing (14 controls)

*Payment lifecycle — initiation, SCA & screening, Confirmation of Payee, clearing, settlement, reconciliation, safeguarding and reporting under the PSRs and scheme rules.*

| Control | SOP step | Nature | Automation | Primary obligation | Body | Owner |
|---------|----------|--------|------------|--------------------|------|-------|
| PAY-01 | Payment Channel / Product Configuration | Preventive | Semi-automated | PSRs 2017 | HM Treasury | Payments Product Operations Manager |
| PAY-02 | Payment Initiation, Capture & Validation | Preventive | Automated | PSRs 2017 (execution/information) | FCA | Payment Operations Manager |
| PAY-03 | Authentication & Fraud/Sanctions Screening (SCA) | Preventive | Automated | PSRs 2017 reg 100 (SCA) | FCA | Payment Fraud & Screening Manager |
| PAY-04 | Validation & Confirmation of Payee | Preventive | Automated | Pay.UK CoP rules | Pay.UK | Payments Product Operations Manager |
| PAY-05 | Payment Processing, Scheme Routing & Clearing | Detective | Automated | Pay.UK scheme rules (Bacs/FPS) | Pay.UK | Payment Operations Manager |
| PAY-06 | Clearing & Settlement | Detective | Semi-automated | BoE RTGS/CHAPS rules | Bank of England | Settlements Manager |
| PAY-07 | Exception, Repair & Returns Handling | Corrective | Semi-automated | Scheme rulebooks (returns/timescales) | Pay.UK | Payment Investigations Manager |
| PAY-08 | Reconciliation (nostro / suspense / scheme) | Detective | Automated | Firm reconciliation policy | Internal | Reconciliations Manager |
| PAY-09 | Customer Dispute / Recall / Chargeback | Corrective | Semi-automated | Card scheme chargeback rules | Card schemes | Disputes & Chargebacks Manager |
| PAY-10 | Card Issuing & Acquiring / Scheme Operations | Preventive | Semi-automated | Card scheme rules (Visa/Mastercard) | Card schemes | Card Operations Manager |
| PAY-11 | Cash & ATM / Branch Operations | Detective | Semi-automated | FCA BCOBS | FCA | Cash Operations Manager |
| PAY-12 | E-Money / Client Safeguarding & Segregation | Preventive | Semi-automated | Electronic Money Regs 2011 | FCA | Safeguarding / Client Money Manager |
| PAY-13 | REP027 Safeguarding Data Aggregation & Submission | Detective | Semi-automated | FCA safeguarding return REP027 (SUP 16) | FCA | Safeguarding Reporting Manager |
| PAY-14 | Payment MI & Regulatory/Scheme Reporting | Detective | Semi-automated | PSRs 2017 | FCA | Payments MI & Reporting Manager |

### 3.4 `LEN` — Lending Origination & Underwriting (12 controls)

*Origination — application, affordability, credit grading, collateral, sanction, documentation and drawdown under CONC / MCOB and PRA credit-risk rules.*

| Control | SOP step | Nature | Automation | Primary obligation | Body | Owner |
|---------|----------|--------|------------|--------------------|------|-------|
| LEN-01 | Application & Data Capture | Preventive | Automated | FCA CONC 2/4 | FCA | Origination Operations Manager |
| LEN-02 | Eligibility & Completeness Check | Preventive | Automated | FCA CONC / MCOB | FCA | Underwriting Operations Lead |
| LEN-03 | Credit Bureau Interrogation / Credit File Pull | Preventive | Automated | FCA CONC 5 | FCA | Credit Risk Operations Manager |
| LEN-04 | Creditworthiness & Affordability Assessment | Preventive | Semi-automated | FCA CONC 5.2A / MCOB 11 | FCA | Underwriting Manager |
| LEN-05 | Credit Risk Grading / Scoring / PD Assessment | Preventive | Semi-automated | PRA Rulebook credit risk / onshored CRR | PRA | Credit Risk Modelling Manager |
| LEN-06 | Collateral & Valuation | Preventive | Semi-automated | FCA MCOB (mortgages) | FCA | Collateral & Valuations Manager |
| LEN-07 | Manual Underwriting & Exception Handling | Detective | Manual | FCA CONC / MCOB | FCA | Underwriting Manager |
| LEN-08 | Credit Decision, Sanction & Approval | Preventive | Semi-automated | Internal credit-approval authority | PRA | Head of Credit / Credit Committee Chair |
| LEN-09 | Offer, Documentation & Terms / Disclosure | Preventive | Semi-automated | Consumer Credit Act 1974 | UK Parliament | Lending Documentation Manager |
| LEN-10 | Conditions & Pre-Drawdown Checks | Preventive | Semi-automated | Internal credit policy | FCA | Loan Operations Manager |
| LEN-11 | Booking, Drawdown & Disbursement | Detective | Semi-automated | Internal controls over financial reporting | FCA | Loan Operations Manager |
| LEN-12 | Post-Completion QA & File Review | Detective | Manual | FCA CONC / MCOB | FCA | Lending Quality Assurance Manager |

### 3.5 `COL` — Collections & Recoveries (12 controls)

*Arrears identification, forbearance, litigation, write-off and IFRS 9 impairment under CONC 7 / MCOB 13.*

| Control | SOP step | Nature | Automation | Primary obligation | Body | Owner |
|---------|----------|--------|------------|--------------------|------|-------|
| COL-01 | Arrears Identification & Early Warning | Detective | Automated | FCA CONC 7 | FCA | Collections Operations Manager |
| COL-02 | Customer Contact & Early Intervention | Detective | Semi-automated | FCA CONC 7 / MCOB 13 | FCA | Collections Team Leader |
| COL-03 | Vulnerability & Financial Difficulty Assessment | Preventive | Semi-automated | FCA CONC 7 / MCOB 13 | FCA | Financial Difficulty / Vulnerability Lead |
| COL-04 | Forbearance Option Selection / Decision | Preventive | Semi-automated | FCA CONC 7 / MCOB 13 (forbearance) | FCA | Collections Underwriting Manager |
| COL-05 | Arrangement Setup, Monitoring & Review | Detective | Semi-automated | FCA CONC 7 / MCOB 13 | FCA | Collections Operations Manager |
| COL-06 | Default, Termination, Litigation & Repossession | Preventive | Manual | CCA 1974 (default notices) | UK Parliament | Recoveries & Litigation Manager |
| COL-07 | Write-Off, Charge-Off & Debt Sale | Detective | Semi-automated | Internal financial controls | FCA | Credit Risk / Finance Controller |
| COL-08 | Debt Sale / External Agency Placement | Detective | Semi-automated | FCA CONC 7 (agency oversight) | FCA | Debt Sale / Agency Oversight Manager |
| COL-09 | Impairment / Provisioning Interface (IFRS 9) | Detective | Semi-automated | IFRS 9 (ECL) | UKEB / IASB | Impairment / Credit Risk Manager |
| COL-10 | Post-Write-Off Recoveries & Recovery Accounting | Detective | Semi-automated | Internal financial controls | Firm | Recoveries Accounting Manager |
| COL-11 | Post-Forbearance Monitoring | Detective | Semi-automated | FCA CONC 7 / MCOB 13 | FCA | Collections Operations Manager |
| COL-12 | Complaint Linkage & Arrears Conduct MI / Governance | Detective | Semi-automated | FCA DISP (interface) | FCA | Collections Conduct / MI Manager |

### 3.6 `FC` — Financial Crime (AML/CTF & Sanctions) (14 controls)

*Firm-wide financial-crime framework — risk assessment, screening, transaction monitoring, sanctions, SAR escalation and governance under MLR 2017, SAMLA and POCA.*

| Control | SOP step | Nature | Automation | Primary obligation | Body | Owner |
|---------|----------|--------|------------|--------------------|------|-------|
| FC-01 | Business-Wide Risk Assessment (BWRA) | Preventive | Manual | MLR 2017 reg 18 | HM Treasury | MLRO / Financial Crime Risk Head |
| FC-02 | Policy & Control Framework Maintenance | Preventive | Manual | MLR 2017 reg 19–21 | HM Treasury | MLRO |
| FC-03 | Customer Risk Profiling | Preventive | Automated | MLR 2017 reg 18A | HM Treasury | Financial Crime Risk Manager |
| FC-04 | Screening Setup / List Management | Preventive | Automated | SAMLA 2018 | HM Treasury | Sanctions Systems Manager |
| FC-05 | Transaction Monitoring & Alert Generation | Detective | Automated | MLR 2017 reg 28(11) | HM Treasury | Transaction Monitoring Manager |
| FC-06 | Alert Triage & Investigation | Detective | Semi-automated | MLR 2017 | HM Treasury | Financial Crime Investigations Manager |
| FC-07 | Sanctions Screening, Interdiction & Asset Freeze | Preventive | Automated | SAMLA 2018 | HM Treasury | Sanctions Operations Manager |
| FC-08 | PEP & Adverse Media Management | Preventive | Semi-automated | MLR 2017 reg 35 (PEPs) | HM Treasury | Financial Crime Advisory Manager |
| FC-09 | SAR Assessment, MLRO Review & Submission | Detective | Semi-automated | POCA 2002 (SAR duty) | UK Parliament | Nominated Officer / MLRO |
| FC-10 | Post-SAR Account Restriction | Corrective | Semi-automated | POCA 2002 (tipping-off) | UK Parliament | Financial Crime Operations Manager |
| FC-11 | Anti-Bribery & Corruption / Gifts & Hospitality | Preventive | Semi-automated | Bribery Act 2010 (s7) | UK Parliament / SFO / MoJ | Anti-Bribery & Corruption Officer |
| FC-12 | High-Risk / EDD & Exit / Restriction Decisions | Preventive | Semi-automated | MLR 2017 reg 33–35 | HM Treasury | Financial Crime EDD Manager |
| FC-13 | Financial Crime Governance, MI & Reporting | Detective | Semi-automated | FCA SUP 16 REP-CRIM | FCA | Financial Crime MI / Reporting Manager |
| FC-14 | Training & Awareness | Preventive | Automated | MLR 2017 reg 24 (training) | HM Treasury | Financial Crime Training Lead |

### 3.7 `FRD` — Fraud & Scams Management (12 controls)

*Detection, intervention, APP reimbursement, mule controls and MI under the PSR reimbursement regime and Consumer Duty.*

| Control | SOP step | Nature | Automation | Primary obligation | Body | Owner |
|---------|----------|--------|------------|--------------------|------|-------|
| FRD-01 | Fraud Risk / Typology Assessment & Rules Design | Preventive | Semi-automated | FCA Consumer Duty | FCA | Fraud Strategy Manager |
| FRD-02 | Real-Time Fraud Detection & Profiling | Preventive | Automated | PSRs 2017 (unauthorised transactions) | HM Treasury | Fraud Detection Manager |
| FRD-03 | Fraud Signal Intake & Triage | Detective | Semi-automated | FCA Consumer Duty | FCA | Fraud Operations Manager |
| FRD-04 | Alert Management, Intervention & Customer Warnings | Detective | Semi-automated | FCA Consumer Duty | FCA | Fraud Interventions Manager |
| FRD-05 | Payment Delay / Intervention (up to D+4) | Preventive | Semi-automated | Payment Services (Amendment) Regs 2024 | HM Treasury | Fraud Operations Manager |
| FRD-06 | Fraud Case Investigation | Detective | Manual | PSRs 2017 | HM Treasury | Fraud Investigations Manager |
| FRD-07 | APP Scam Claim Intake & Assessment | Detective | Semi-automated | PSR APP scam reimbursement | Payment Systems Regulator | APP Reimbursement Manager |
| FRD-08 | Reimbursement Decision & Liability Apportionment | Detective | Semi-automated | PSR APP reimbursement (50:50) | PSR | APP Reimbursement Manager |
| FRD-09 | Mule / Receiving-Account Controls & Investigation | Detective | Semi-automated | MLR 2017 | HM Treasury | Mule Investigations Manager |
| FRD-10 | Recovery, Clawback & Interbank Liaison | Corrective | Semi-automated | Pay.UK reimbursement / recovery rules | Pay.UK | Fraud Recovery Manager |
| FRD-11 | Fraud MI, Loss Recording, Reporting & Tuning | Detective | Semi-automated | FCA Consumer Duty | FCA | Fraud MI Manager |
| FRD-12 | Law-Enforcement / Industry Data Sharing | Detective | Semi-automated | POCA 2002 | NCA | Fraud Intelligence Manager |

### 3.8 `CMP` — Complaints & Redress (11 controls)

*Complaint capture, investigation, redress, final response and FOS referral under DISP and Consumer Duty.*

| Control | SOP step | Nature | Automation | Primary obligation | Body | Owner |
|---------|----------|--------|------------|--------------------|------|-------|
| CMP-01 | Complaint Capture & Logging | Preventive | Semi-automated | FCA DISP 1 | FCA | Complaints Intake Manager |
| CMP-02 | Acknowledgement, Triage & Classification | Detective | Automated | FCA DISP 1.4–1.6 | FCA | Complaints Team Leader |
| CMP-03 | Investigation & Root Cause | Detective | Manual | FCA DISP 1.4 | FCA | Complaints Quality Manager |
| CMP-04 | Root Cause Assessment (case-level) | Detective | Semi-automated | FCA DISP 1.3 | FCA | Complaints Root-Cause Analyst Lead |
| CMP-05 | Outcome Decision | Detective | Manual | FCA DISP | FCA | Complaints Manager |
| CMP-06 | Redress / Remediation Calculation & Payment | Detective | Semi-automated | FCA DISP App | FCA | Redress Operations Manager |
| CMP-07 | Final Response & FOS Rights | Preventive | Semi-automated | FCA DISP 1.6 | FCA | Complaints Team Leader |
| CMP-08 | FOS Referral / Escalation Handling | Detective | Semi-automated | FOS scheme rules (FSMA 2000 Pt XVI) | FOS | FOS Liaison Manager |
| CMP-09 | Root-Cause / Thematic Analysis & Feedback | Corrective | Semi-automated | FCA DISP 1.3 | FCA | Conduct / Complaints Insight Lead |
| CMP-10 | Mass Remediation / Past-Business Review | Corrective | Semi-automated | FCA DISP | FCA | Remediation Programme Director |
| CMP-11 | Complaints MI, Governance & Regulatory Reporting | Detective | Semi-automated | FCA DISP 1.10 | FCA | Complaints MI / Regulatory Reporting Manager |

---

## 4. The dashboard screens

### 4.1 Overview (cross-domain)

- Residual-risk **posture banner**, KPI strip (total controls, avg compliance, open exceptions, critical findings, % automated, % preventive), an **AI audit-intelligence** panel highlighting the most at-risk domains, and a grid of **domain audit cards** (coverage bar, pass rate, critical issues, overdue remediation, top issue and recommended action).

### 4.2 Per-domain workspace (three tabs — identical to Indian Process Audit v3)

1. **Process flow** — SOP header + KPI cards, then a **stage-by-stage compliance map**. Each stage row expands to show the accountable owner (role · team · what they submit) and the mapped control(s) with sample/passed/failed/critical counts and an **Evidence** button.
2. **`<Entity>` — Journey matrix** — a **cases × SOP-stage grid** (green = passed, red = failed, `R` = in review, grey = blocked). Click a case for the full evidence trail, or a green/red cell for that single stage — showing the submitter, submitted files and per-control results. Each domain uses UK-apt entities: Customers (ONB), Accounts (DEP), Payments (PAY), Loan Applications (LEN), Arrears Cases (COL), Alerts (FC), Fraud Claims (FRD), Complaints (CMP).
3. **Control register** — control-level compliance bar chart, violations/exceptions stacked chart, search, status filter chips, and the full control library table.

### 4.3 Evidence drawer (opens from any tab)

Pass-rate/sample/passed/failed stats, control metadata, accountable evidence submitters, sample case trails, testing procedure performed, exception log, source systems, workpapers, auditor conclusion and management response.

---

## 5. Code structure

```
frontend/
├─ app/UK_Process_Audit/
│  ├─ page.tsx                       # module landing → latest version
│  └─ v1/
│     ├─ layout.tsx                  # wraps dashboard in UkpaVersionProvider
│     ├─ page.tsx                    # renders UKProcessAuditDashboard
│     └─ UK_PROCESS_AUDIT_DETAIL.md  # this document
│
├─ lib/UK_Process_Audit/            # DATA LAYER
│  ├─ rawData.ts                     # verbatim CSV (single source of truth)
│  ├─ parseControls.ts               # CSV → typed rows
│  ├─ deriveMetrics.ts               # synthetic audit metrics (seeded)
│  ├─ journeyConfig.ts               # entity naming, teams, journey titles, segments
│  ├─ buildJourney.ts                # SOP stages, cases & trails
│  ├─ buildEvidence.ts               # evidence pack builder (drawer)
│  ├─ assembleSnapshot.ts            # composes the full snapshot (cached)
│  ├─ types.ts                       # all UK Process Audit types
│  └─ index.ts                       # getUkProcessAuditData(), buildUkEvidence()
│
└─ components/UK_Process_Audit/     # UI LAYER
   ├─ UKProcessAuditDashboard.tsx    # shell: top bar + sidebar + main + drawer
   ├─ DomainSidebar.tsx              # collapsible domain rail
   ├─ shared/pills.tsx               # residual / status / nature / automation pills
   ├─ shared/journeyUi.tsx           # compliance cell, badges, avatars, matrix cell
   ├─ overview/OverviewTab.tsx       # cross-domain overview
   ├─ overview/DomainAuditCard.tsx   # per-domain summary card
   └─ domain/
      ├─ DomainWorkspace.tsx         # 3-tab shell
      ├─ ProcessFlowView.tsx         # tab 1
      ├─ JourneyMatrix.tsx           # tab 2
      ├─ ControlRegister.tsx         # tab 3
      ├─ ControlTable.tsx            # control library table
      └─ EvidenceDrawer.tsx          # evidence pack drawer
```

---

## 6. Summary

- **8 process domains**, **104 real controls** taken directly from the UK operational-controls dataset and aligned to the canonical UK regulatory landscape.
- Every control carries its **UK regulatory obligation and issuing body** (HM Treasury, FCA, PRA, Bank of England, Pay.UK, PSR, NCA, ICO, FOS, card schemes).
- Control framework skews **preventive (51) and semi-automated (71)** — consistent with a controls-by-design posture across onboarding, payments and financial crime.
- Each domain is presented through the **same three-screen workspace as Indian Process Audit v3** (Process flow · Journey matrix · Control register) plus a rich evidence drawer, with all customer data, evidence and journeys generated to fit the UK domain.
- **Metrics disclaimer:** control definitions, obligations, owners and evidence types are **real** (from the CSV); test outcomes (pass rates, exceptions, residual risk, cases, submitters) are **deterministically generated demo data** and do not represent an actual audit result.
