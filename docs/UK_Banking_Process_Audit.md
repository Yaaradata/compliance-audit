# UK Banking Process Audit — Detailed Product Document

**Route:** `http://localhost:3000/UK_Process_Audit/v2`
**Scope:** Internal audit of a UK retail/SME bank's operational processes — controls, SOP stages, journey cases, and evidence — across **8 process domains** and **95 controls**.
**Cycle:** Q1 FY26 · Closing review · period 01 Apr – 30 Jun 2026.

This document explains **(1)** every domain and why it exists, **(2)** every page and component inch-by-inch with the bank data each needs, and **(3)** the evidence collected per domain and where it comes from.

---

## 1. What this audit is

A UK-jurisdiction internal-audit cockpit. For each domain it tests whether the bank's **controls** are designed and operating effectively, traces a **sample of real cases** through the end-to-end process (SOP), and produces an **evidence trail** an auditor or the FCA/PRA can inspect.

Everything is UK-specific: regulators are the **FCA, PRA, OFSI, HM Treasury, Pay.UK, NCA, PSR, ICO, Bank of England, FOS**; amounts are **GBP (£)**; locale is **en-GB**.

---

## 2. The 8 domains (one-liner + why it exists)

| Code | Domain | Audited entity | One-liner — why the domain exists |
|---|---|---|---|
| **ONB** | Customer Onboarding & KYC | Customer | Verify who the customer is and screen them **before** activation, so the bank never onboards illicit or unverified identities (CDD/KYC duty). |
| **DEP** | Deposits & Account Servicing | Account | Run the account lifecycle fairly and safely — pricing, mandates, interest, dormancy, depositor protection — so customers are charged correctly and their money is protected. |
| **PAY** | Payments & Transaction Processing | Payment | Move money accurately, securely and on time across schemes (FPS/Bacs/CHAPS/cards), with SCA, sanctions screening and reconciliation. |
| **LEN** | Lending Origination & Underwriting | Loan Application | Lend only what is affordable and within policy — capture, credit-check, underwrite, sanction and draw down loans correctly. |
| **COL** | Collections & Recoveries | Arrears Case | Treat customers in financial difficulty fairly — early warning, forbearance, vulnerability handling, and correct impairment. |
| **FC** | Financial Crime (AML/CTF & Sanctions) | Alert | Detect, investigate and report financial crime — monitoring, sanctions, PEPs, SARs — to meet AML law and avoid strict-liability breaches. |
| **FRD** | Fraud & Scams Management | Fraud Claim | Prevent, detect and fairly reimburse fraud/APP scams under the PSR reimbursement regime. |
| **CMP** | Complaints & Redress | Complaint | Handle complaints within DISP timelines, pay fair redress, and fix root causes before harm scales. |

---

## 3. Per-domain deep dive — controls, evidence, and sources

For each domain: what it tests, the **evidence collected**, the **source systems** that evidence comes from, and the **key UK obligations**.

### ONB — Customer Onboarding & KYC (13 controls)
- **Tests:** intake data capture, eligibility, identity/CDD, UBO, sanctions/PEP screening, risk rating, EDD, approval, golden-record creation, terms/FSCS disclosure, ongoing & re-KYC, offboarding/retention.
- **Evidence collected:** config/screenshots of validation rules, exception reports, eIDV/CDD system logs, UBO verification records, screening dispositions, EDD sign-off memos, golden-record reconciliation, terms/version history.
- **Source systems:** Digital onboarding portal, CRM, KYC/CDD platform & eIDV engine, Companies House PSC feed, name-screening/watchlist tool, risk-rating engine, EDD/case workflow, core banking, customer comms platform, records archive.
- **Key obligations:** MLR 2017 (reg 27-28 CDD, reg 5/28 UBO, reg 33-35 EDD/PEP, reg 40 retention), SAMLA 2018, FCA BCOBS. **Regulators:** HM Treasury, FCA.

### DEP — Deposits & Account Servicing (16 controls)
- **Tests:** product setup, account opening gate, disclosure, mandate/signatory, interest & fee application, overdraft affordability, statements, standing-data changes, servicing SLAs, dormancy, freezes/holds, SCV/FSCS, closure/switching, access-to-cash, error correction, complaints interface.
- **Evidence collected:** product-approval reconciliations, exception reports, disclosure sample tests, mandate dual-approval records, interest/fee recalculation reconciliations, standing-data change logs, SCV file reconciliation, CASS switch exceptions, OFSI freeze filings.
- **Source systems:** core banking, product master & pricing engine, decisioning engine, statement/output system, service-request platform, dormancy module/register, SCV production tool & reg-reporting data mart, CASS switching platform, branch/ATM systems, adjustments ledger, complaints platform.
- **Key obligations:** FCA BCOBS, CONC 5A (overdrafts), UK GDPR (ICO), Dormant Assets Act 2022, PRA Depositor Protection Part (SCV/FSCS £120k), Pay.UK CASS 7-day guarantee, FSMA 2023 access-to-cash, POCA 2002, DISP. **Regulators:** FCA, PRA, HM Treasury, ICO, NCA, Pay.UK.

### PAY — Payments & Transaction Processing (14 controls)
- **Tests:** channel/product config, initiation & validation, SCA + sanctions screening, Confirmation of Payee, routing/clearing, clearing & settlement, repair/returns, reconciliation (nostro/suspense/scheme), disputes/chargebacks, card issuing/acquiring (PCI), cash/ATM, e-money safeguarding, REP027, payment MI.
- **Evidence collected:** scheme config extracts, validation exception reports, SCA/screening system logs, CoP match logs, scheme-acknowledgement reconciliations, RTGS/nostro reconciliations, returns exceptions, PCI AoC, safeguarding daily reconciliation, REP027 filing copies.
- **Source systems:** payment hub/gateway, channel platform, scheme gateways, SCA & screening filter, fraud engine, CoP, SWIFT gateway, settlement/nostro/RTGS, reconciliation tool & GL, dispute management system & scheme portal, card management system, cash/ATM switch, safeguarding reconciliation ledger, FCA RegData.
- **Key obligations:** PSRs 2017 (incl. reg 100 SCA), Pay.UK CoP & scheme rules (Bacs/FPS), BoE RTGS/CHAPS, Card scheme rules + PCI-DSS, Electronic Money Regs 2011, FCA REP027 (SUP 16). **Regulators:** FCA, HM Treasury, Pay.UK, Bank of England, Card schemes.

### LEN — Lending Origination & Underwriting (12 controls)
- **Tests:** application capture, eligibility, bureau pull, affordability/creditworthiness, credit grading/PD, collateral & valuation, manual underwriting/exceptions, credit decision & sanction, offer/disclosure, pre-drawdown conditions, booking/drawdown, post-completion QA.
- **Evidence collected:** LOS config extracts, eligibility exception reports, bureau-search logs, affordability sample tests, rating-model sample tests, valuation certificates, exception sign-off memos, credit-committee approvals, agreement version history, drawdown reconciliations, QA sample outputs.
- **Source systems:** loan origination system (LOS), CRM, policy/decision engine, CRA interface, credit-risk/rating system, valuation/collateral system, credit-committee records, document generation, core banking, payment system, QA workflow.
- **Key obligations:** FCA CONC 2/4/5 & MCOB 11 (affordability), PRA CRR / credit-risk rules, Consumer Credit Act 1974, internal credit-approval authority. **Regulators:** FCA, PRA.

### COL — Collections & Recoveries (12 controls)
- **Tests:** arrears identification/early warning, fair contact, vulnerability & financial-difficulty assessment, forbearance selection, arrangement monitoring, default/litigation/repossession, write-off/charge-off/debt sale, DCA oversight, IFRS 9 impairment interface, post-write-off recoveries, post-forbearance monitoring, complaints/conduct MI.
- **Evidence collected:** arrears exception reports, contact QA sample tests, vulnerability assessments, forbearance sign-off memos, arrangement exception reports, default-notice sign-offs, write-off ledger reconciliations, DCA third-party attestations, ECL reconciliation, conduct MI minutes.
- **Source systems:** collections/recoveries system, core banking, telephony/QA, CRM vulnerability flags, legal case system, general ledger, ECL/impairment engine, vendor management, complaints system.
- **Key obligations:** FCA CONC 7 / MCOB 13 (arrears & forbearance), CCA 1974 (default notices), IFRS 9 (ECL), DISP. **Regulators:** FCA, UK Parliament (CCA), UKEB/IASB.

### FC — Financial Crime (AML/CTF & Sanctions) (14 controls)
- **Tests:** business-wide risk assessment, policy/framework & MLRO, customer risk profiling, screening list management, transaction monitoring, alert triage, sanctions interdiction/freeze, PEP/adverse-media, SAR assessment & submission, post-SAR restriction, anti-bribery/G&H, EDD & exit decisions, financial-crime MI/REP-CRIM, training.
- **Evidence collected:** BWRA & policy version history, risk-model config, screening list-load logs, TM rule config, alert QA sample tests, OFSI freeze filings, PEP sample tests, SAR/DAML system logs (NCA portal), G&H attestations, REP-CRIM filing copies, LMS training logs.
- **Source systems:** GRC/risk & policy repository, AML platform & risk-rating engine, screening/list-management system, transaction-monitoring system, case management, SAR workflow & NCA SAR portal, EDD workflow, G&H register, RegData, learning management system (LMS).
- **Key obligations:** MLR 2017 (reg 18/18A/19-21/24/28/33-35), SAMLA 2018, POCA 2002 (SAR duty & tipping-off), Bribery Act 2010 (s7), FCA SUP 16 REP-CRIM. **Regulators:** HM Treasury, FCA, NCA, UK Parliament, SFO.

### FRD — Fraud & Scams Management (12 controls)
- **Tests:** typology/rules design, real-time detection, signal intake/triage, intervention & warnings, payment delay (D+4), case investigation, APP claim intake, reimbursement & 50:50 liability, mule/receiving-account controls, recovery/clawback, fraud MI/loss, law-enforcement/industry data sharing.
- **Evidence collected:** rules version history, detection-engine config, triage exception reports, intervention logs, payment-delay exceptions, investigation sample tests, APP claim exceptions, reimbursement reconciliations, mule exception reports, recovery reconciliations, PSR performance returns, CIFAS/NCA sharing logs.
- **Source systems:** fraud strategy/rules repository, fraud detection engine, fraud case management, telephony, payment engine, APP claims/reimbursement claims system (RCMS), nostro reconciliation, fraud MI/loss database, CIFAS interface.
- **Key obligations:** PSRs 2017 & PS(A)R 2024 (delay power), PSR APP reimbursement requirement (Faster Payments, 50:50), FCA Consumer Duty, MLR 2017, POCA 2002. **Regulators:** PSR, FCA, HM Treasury, NCA.

### CMP — Complaints & Redress (11 controls)
- **Tests:** complaint capture/logging (DISP clock), acknowledgement/triage, investigation & root cause, case-level root-cause classification, outcome decision, redress calculation/payment, final response & FOS rights, FOS referral handling, thematic analysis/feedback, mass remediation/past-business review, complaints MI/reporting.
- **Evidence collected:** capture system logs, SLA exception reports, investigation sample tests, root-cause sample tests, outcome sign-off memos, redress reconciliations, final-response sample tests, FOS tracker exceptions, remediation population reconciliations, complaints-return filing copies.
- **Source systems:** complaints management system, CRM/telephony, SLA tracker, case management, payment system, document generation, FOS case tracker, issue tracker, remediation case system & data warehouse, reg reporting.
- **Key obligations:** FCA DISP 1 (handling, timelines, root cause, final response, App redress, DISP 1.10 reporting), Consumer Duty, FOS scheme rules (FSMA 2000 Part XVI). **Regulators:** FCA, FOS.

### Evidence-type glossary (used across all domains)
`Screenshot/Configuration Extract` · `Exception Report` · `System Log/Export` · `Sign-off/Attestation Memo` · `Reconciliation Statement` · `Policy Document + Version History` · `Sample Testing Output` · `Regulatory Filing Copy` · `Third-Party Certificate/Attestation` · `Board/Committee Minute Extract`.

---

## 4. Navigation shell (persistent chrome)

Every page renders inside this frame:

- **Top bar** — bank branding "UK process audit · V2", audit-lead identity, cycle label. *Data:* audit metadata (cycle, period, lead).
- **Left domain rail** — collapsible list: **Overview** + the 8 domains, each with its control count. *Data:* `controlsByDomain` counts. Clicking sets the active tab.
- **Main scroll region** — the only vertical scroll area; header + rail stay fixed. Holds the page header (title, description, Filter / Export / Auditor-view actions) and the active page.
- **Evidence drawer** — right slide-out opened from any control/case; described in §6.

---

## 5. The Overview page — inch by inch

Rendered by `OverviewTab`. Purpose: cross-domain posture in one screen.

| # | Component | What it shows | Data required from the bank |
|---|---|---|---|
| 1 | **Residual-risk banner** | Bank-wide posture (Critical/High/Medium/Low) headline. | Aggregate residual risk across all domains (worst-of + avg compliance). |
| 2 | **KPI strip / Internal-audit summary grid** | Total controls, tested, met/review/not-met, critical findings, evidence gaps, overdue, exceptions. | Per-control test status, exceptions, violations, sample vs population. |
| 3 | **AI audit intelligence card** | Ranked findings per domain: crisp problem + concrete action (Indian-v3 style), severity-tagged. | Worst control per domain, its exception/violation counts, residual risk. |
| 4 | **Domain process-mapping section** | Table: per-domain process count, controls, process compliance %, domain compliance %. | SOP stage counts + per-stage mapped-control compliance. |
| 5 | **Audit-domain cards grid** | One risk tile per domain: PASS RATE, CRITICAL, OVERDUE, residual-risk shade, **AI FOCUS** (issue + action). Click → domain page. | Domain compliance, violations, overdue remediation, worst-control finding. |
| 6 | **Coverage composed chart** | Stacked bars (met/review/not-met/not-tested) + deficiency % line per domain. Hover tooltip (opaque). | Per-domain control outcome split + deficiency %. |
| 7 | **Findings summary chart** | Bar of total issues + critical findings per domain. | Per-domain exceptions + violations. |

---

## 6. The Domain page — inch by inch

Rendered by `DomainTab`. Page header shows the domain title + "All controls in scope · regulatory references · evidence on demand". Three sub-tabs:

### Tab A — Process flow (`SopProcessView`)
The **Stage-by-stage compliance map**: every SOP stage as a table row.

| Column | Meaning | Data required |
|---|---|---|
| # | Stage order | SOP step number |
| **Stage** | Stage name + crisp activity description | `sopStep` name + activity line (derived from risk statement) |
| **Accountable owner** | Role, team, what they submit | Control owner role, 2LoD/ops team, evidence type + source |
| **Pass rate** | Stage compliance % | Mapped-control compliance |
| **Failed cases** | Exceptions at the stage | Control exceptions |
| **Critical** | Violations at the stage | Control violations |
| **Missed controls** | Control IDs that failed here | Control id + name where exceptions/violations > 0 |
| **Status** | Stage health (OK/Attention/Miss) | Derived from outcomes |

Clicking a row expands inline: accountable submitter, each mapped control (id, name, status, regulatory reference, "why this is a miss" auditor note, sampled/passed/failed/critical counts) and an **Evidence** button.
*Bank data:* SOP definition, control library (id, description, obligation, owner), population/sample, exceptions/violations per control.

### Tab B — {Entity} — Journey matrix (`UkJourneyCommandCenterView`)
The interactive command centre (mirrors Indian v3). Components:

| Component | Shows | Data required |
|---|---|---|
| **KPI ribbon** | Compliance ring (clean/total), Critical, Exceptions, In review, Reg exposure. | Domain counts: total, completed, critical, exception, review; reg-exposure cases. |
| **Stage funnel** | Population narrowing stage-by-stage (passed/review/failed). | Per-stage reached/passed/failed/review; total population. |
| **Stage-hotspot strip** | Riskiest stages by failures. | Stage failed/review counts. |
| **AI Summary Wall** | One-line recommendation per critical case, ranked by confidence. | Critical cases + observations + failed control. |
| **Failing controls** | Controls failing most, with bars. | Control fail counts across cases. |
| **Owner accountability** | Accountable roles with open/critical counts. | Case owners (role, site) + status. |
| **Evidence readiness** | Inspection-ready %, with-evidence vs gap. | Cases with evidence attached vs actionable total. |
| **Regulatory & SLA exposure** | Reg-reportable + SLA-at-risk cases (title + observation). | Case observations flagged reg-reportable / SLA. |
| **Action queue** | Actionable cases: status, title, exception, stage, owner, evidence count. | Sample cases (critical/review/exception). |
| **Case drawer** | Click any case/stage → full journey, controls, evidence, owner. | Case trail: per-stage status, submitter, evidence items, control results. |

### Tab C — Control register
Full control library table for the domain: control id, name/SOP step, regulatory obligation, owner, frequency, population, sample, exceptions, violations, compliance %, status. Row → evidence drawer.
*Bank data:* the complete control library row set.

### Evidence drawer (all tabs)
Opened from any control/case. Contains: control summary; **testing steps** (population identified, stage traced, evidence reconciled to source, failures categorised); **exception log** (ref, detail, severity, SLA, action); **source systems** reconciled (Core Banking, LOS/CRM, IAM/AD, SIEM, payment rails); **documents** (control design, sample workpaper, exception log, management sign-off); **auditor note** + **management response**; **stage submitters** and **sample case trails**.
*Bank data:* per-control evidence records, source-system extracts, sampled case references, management responses.

---

## 7. Data the bank must supply (summary)

1. **Control library** — the 95 controls (id, SOP step, risk statement, description, nature, automation, primary obligation, issuing body, evidence type, evidence source system, testing frequency, owner role).
2. **SOP definitions** — ordered stages per domain with the control(s) mitigating each.
3. **Test results** — per control: population, sample, exceptions, violations, compliance %, status, last-tested, tester.
4. **Case sample & trails** — sampled entities per domain with per-stage status, submitter, evidence items and control results.
5. **Evidence artefacts** — the documents/logs/reconciliations/filings named per control, extracted from the listed source systems.

---

*This document describes the UK Process Audit v2 dashboard only. For how it compares to the Indian Process Audit, see `Indian_vs_UK_Process_Audit.md`.*
