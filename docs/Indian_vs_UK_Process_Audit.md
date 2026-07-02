# Indian Process Audit vs UK Process Audit

A side-by-side comparison of the two process-audit dashboards in this repo.

- **Indian Process Audit** → `http://localhost:3000/Indian_Process_Audit/v3`
- **UK Process Audit** → `http://localhost:3000/UK_Process_Audit/v2`

Both share the **same UI and layout** (journey command centre: KPI ribbon → funnel + AI Summary Wall → intel panels → regulatory/action-queue row → case drawer). They differ in **jurisdiction, business domains, regulators, and the underlying data**.

---

## 1. At a glance

| Aspect | Indian Process Audit (v3) | UK Process Audit (v2) |
|---|---|---|
| Route | `/Indian_Process_Audit/v3` | `/UK_Process_Audit/v2` |
| Jurisdiction | India | United Kingdom |
| Regulators | RBI, FIU-IND, SEBI | FCA, PRA, OFSI, HM Treasury, Pay.UK, NCA |
| Currency / locale | INR (₹), `en-IN`, IST | GBP (£), `en-GB`, BST |
| Number of domains | **9** | **8** |
| Reporting period | Q1 FY26 · Closing review | Q1 FY26 · Closing review |
| Data source | Curated mock data (`auditData.ts`) | Generated from UK control library + SOP stages |
| Layout / components | Owns the shared v3 components | **Reuses** the Indian v3 components with UK data |

---

## 2. Business domains

The two audits cover **different banking processes**, appropriate to each market.

### Indian Process Audit (9 domains)

| # | Domain | Focus |
|---|---|---|
| 1 | Customer / KYC | Onboarding, KYC/CIP, re-KYC |
| 2 | Credit & Loans | Underwriting, sanction, NPA/IRAC |
| 3 | Transactions & Payments | NEFT/RTGS/UPI, LRS, cash |
| 4 | AML, Risk & Fraud | Monitoring, sanctions, STR/CTR |
| 5 | IT Change Mgmt | Change/release controls |
| 6 | Infrastructure & Cyber | Cyber, resilience |
| 7 | Data Governance | Data quality & governance |
| 8 | Financial Reporting | Regulatory reporting |
| 9 | Operations & 3rd Party | Ops & vendor risk |

### UK Process Audit (8 domains)

| # | Code | Domain |
|---|---|---|
| 1 | ONB | Customer Onboarding & KYC |
| 2 | DEP | Deposits & Account Servicing |
| 3 | PAY | Payments & Transaction Processing |
| 4 | LEN | Lending Origination & Underwriting |
| 5 | COL | Collections & Recoveries |
| 6 | FC | Financial Crime (AML/CTF & Sanctions) |
| 7 | FRD | Fraud & Scams Management |
| 8 | CMP | Complaints & Redress |

> The UK set is organised around the **customer/product lifecycle** (onboarding → servicing → payments → lending → collections) plus **conduct & financial-crime** processes (financial crime, fraud & scams, complaints & redress), reflecting FCA Consumer Duty and APP-scam/Confirmation-of-Payee expectations.

---

## 3. Regulatory language & terminology

| Concept | Indian | UK |
|---|---|---|
| Suspicious activity report | **STR / CTR** to **FIU-IND** | **SAR** to the **NCA** (via nominated officer / MLRO) |
| AML rulebook | PMLA, RBI Master Directions | **MLR 2017**, **POCA**, **SAMLA** |
| Conduct regime | RBI fair-practice | **FCA Consumer Duty**, **DISP** (complaints) |
| Sanctions | RBI / MHA lists | **OFSI / HM Treasury** consolidated list |
| Payments integrity | — | **Confirmation of Payee (CoP)**, **Pay.UK**, **PSR** APP reimbursement |
| Deposit protection | DICGC | **FSCS**, dormant-account / SCV rules |
| Identifiers / amounts | PAN, INR (₹), account refs | Sort code / account, GBP (£), account refs |

---

## 4. Data model (identical shape, different content)

Both dashboards feed the same `RccDomain` contract, so the funnel, KPI ribbon, and drawers behave identically.

Each domain publishes headline counts where:

```
total = completed + critical + exception + review
```

Each actionable case falls into one of three buckets:

| Bucket | Case status | Funnel effect | Meaning |
|---|---|---|---|
| Critical | `Critical` | narrows via `failed` | control failure — remediate |
| Review | `Exception` | narrows via `review` | in-flight, awaiting evidence |
| Exception | `Exception` | passes through | documented / waived |

### Per-domain counts (mirrored 1:1)

UK v2 **reuses the exact count profile** of a corresponding Indian domain so the KPI ribbon and funnel read identically.

| UK domain | Mirrors Indian | total | clean | critical | exception | review |
|---|---|---|---|---|---|---|
| ONB | Customer / KYC | 120 | 115 | 2 | 2 | 1 |
| DEP | Financial Reporting | 48 | 45 | 2 | 0 | 1 |
| PAY | Transactions & Payments | 142 | 139 | 2 | 0 | 1 |
| LEN | Credit & Loans | 86 | 82 | 2 | 1 | 1 |
| COL | Operations & 3rd Party | 39 | 36 | 2 | 0 | 1 |
| FC | AML, Risk & Fraud | 64 | 60 | 2 | 1 | 1 |
| FRD | Infrastructure & Cyber | 73 | 69 | 3 | 0 | 1 |
| CMP | Data Governance | 91 | 87 | 3 | 0 | 1 |

---

## 5. How the data is produced

| | Indian Process Audit | UK Process Audit |
|---|---|---|
| Origin | Hand-authored mock cases (names, narratives, evidence) in `auditData.ts` | **Generated deterministically** from the UK control library + SOP stages |
| Case titles | e.g. `Rapid mvmt — A/c ****2088` | e.g. `TM alert — A/c ****3329`, `SME onboarding — Northgate Logistics Ltd` |
| Subjects | Indian names / entities | UK names, UK company names, UK payees, UK sites |
| Determinism | Static | Seeded (stable across renders); no duplicate titles within or across domains |
| Reg-exposure / SLA | Derived from case observations | Derived the same way, from UK observations |

---

## 6. Example — same case, two jurisdictions

**AML / Financial-crime critical case**

- **Indian (AML):** `Unusual foreign inward — A/c ****7721` — *"STR filed 11 days after detection vs 7-day statutory limit. Control AM-05 failed — reg-reportable."*
- **UK (FC):** `TM alert — A/c ****3329` — *"Alert open beyond SLA without escalation. Control FC-02 failed — reg-reportable."*

Same layout, same funnel behaviour, same KPI counts — different regulator, terminology, and data.

---

## 7. Key implementation note

- All UK-specific behaviour lives under `*/UK_Process_Audit/v2/` (app route, components, lib).
- UK v2 **imports and reuses** the Indian v3 presentation components; only the **data layer** and jurisdiction-specific labels differ.
- Changes to UK v2 do **not** affect the Indian Process Audit, and vice versa.

---

## 8. File map

| Layer | Indian Process Audit | UK Process Audit |
|---|---|---|
| Route | `frontend/app/Indian_Process_Audit/v3` | `frontend/app/UK_Process_Audit/v2` |
| Dashboard | `components/Indian_Process_Audit/…/v3` | `components/UK_Process_Audit/v2` |
| Journey components | `components/Indian_Process_Audit/journey/v3` | reused from Indian v3 |
| Data | `lib/Indian_Process_Audit/riskCommandCenter` | `lib/UK_Process_Audit/v2` |
