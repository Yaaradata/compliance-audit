# Process → Step → Activity → Control → Evidence
## Process Execution Reality for a Mid-Sized Indian Private Sector Bank
**Pass 2 — Research Brief for RCM Pipeline Ingestion**
*Personas: CRO | Head of Operations | RegTech Product Architect | AI Systems Architect | Cut-off: April 2026*

---

## 0. Conventions and IDs (extending Pass 1)

This document extends Pass 1's ID schema. New ID families introduced here:

- **Process IDs**: `PROC-<DOMAIN>-NNN` (e.g., `PROC-KYC-001`)
- **Step IDs**: `STEP-<PROC-DOMAIN>-NN` (e.g., `STEP-KYC-03`)
- **Activity IDs**: `ACT-<PROC-DOMAIN>-NN-NN` (step number then activity number; e.g., `ACT-KYC-03-02`)
- **Control IDs (design-time)**: `CTRL-<DOMAIN>-NNN` (e.g., `CTRL-KYC-001`)
- **ControlInstance IDs (runtime)**: `CI-<CTRL_REF>-<TIMESTAMP>-<SHARD>` — generated at runtime, not pre-allocated
- **Evidence IDs**: `EVD-<TYPE>-NNN` where TYPE ∈ {LOG, DOC, ATTEST, SIGN, RECON, CALL, IMG, BIO}
- **Failure Mode IDs**: `FM-<CATEGORY>-NNN` where CATEGORY ∈ {DRIFT, GAP, CTRL}

**Pass 1 IDs referenced throughout** (no renumbering): `R-*` (risks), `OBL-*` (obligations), `FAIL-*` (failure examples), `GAP-*` (monitoring gaps), `AI-*` (AI opportunities).

**Multi-value cells**: semicolon-separated. **Frequency vocabulary**: `real-time | per-event | hourly | daily | weekly | monthly | quarterly | semi-annual | annual | cyclical | one-time`. **Actor types**: `customer | branch_staff | central_ops | bpo_l1 | bpo_l2 | underwriter | rm | system | dsa | lsp | tpsp_engineer | risk_officer | compliance_officer | cco | bsa_officer | board_committee`. **System types**: `CBS | LOS | CRM | DLA | AML_engine | screening_tool | case_mgmt | CKYCR | CERSAI | NPCI | UIDAI | bureau | AA | GST | GRC | ITSM | SIEM | BPO_platform`.

---

## 1. Process Models — Core Processes (India-Specific)

The seven processes covered here represent the highest-density risk surfaces for a mid-sized Indian private sector bank. Each is treated below as a *distributed system-of-systems execution chain*, not a flowchart — actual execution touches CBS, CRM, multiple regulatory portals, BPO platforms, vendor APIs, and frontline mobile/teller channels concurrently.

| Process ID | Name | Primary Owner | Regulatory Anchor (Pass 1 OBL refs) | Volume Signal (typical mid-sized PB) | Depth in this brief |
|---|---|---|---|---|---|
| `PROC-KYC-001` | Customer Onboarding & KYC | Head of Retail Banking + CCO | `OBL-RBI-001` to `OBL-RBI-005`, `OBL-PMLA-005`, `OBL-FIU-001` | 50K-200K new accounts/month; 8M-25M existing UCICs | **Deep dive (Section 2.1)** |
| `PROC-LND-001` | Retail Personal Loan Origination | Head of Retail Lending | `OBL-RBI-022` to `OBL-RBI-029`, `OBL-RBI-036` to `OBL-RBI-038`, `OBL-RBI-051` | 30K-100K applications/month; 60-70% via DSAs / digital | **Deep dive (Section 2.2)** |
| `PROC-AML-001` | AML Transaction Monitoring & Alert Disposition | BSA Officer (Principal Officer) | `OBL-PMLA-001` to `OBL-PMLA-005`, `OBL-FIU-001`, `OBL-RBI-050` | 50K-500K alerts/month; STR volumes 200-2,000/month | **Deep dive (Section 2.3)** |
| `PROC-UPI-001` | UPI Payment Processing & Dispute | Head of Digital Banking | `OBL-RBI-031` to `OBL-RBI-035`, NPCI Procedural Guidelines | 200M-2B transactions/month; dispute rate 0.05-0.15% | Standard (Section 2.4) |
| `PROC-COMP-001` | Customer Complaints Handling | Principal Nodal Officer / Internal Ombudsman | RBI Internal Ombudsman Scheme 2018 (as amended); RB-IOS 2021 | 5K-30K complaints/month; ~12% escalated to BO | Standard (Section 2.5) |
| `PROC-VND-001` | Vendor / TPSP Outsourcing Lifecycle | Head of VMO + CISO | `OBL-RBI-016` to `OBL-RBI-021` | 200-800 active TPSPs; 30-100 "material" | Standard (Section 2.6) |
| `PROC-ITO-001` | IT Operations (Change, Incident, Patch, Access) | CIO / CTO + CISO | `OBL-RBI-007` to `OBL-RBI-015`, `OBL-RBI-048` | 500-2,000 changes/month; 10K-50K incidents/month | Standard (Section 2.7) |

### Process Relationships (where processes hand off)

These processes are not isolated — they share customer records, risk ratings, and operational data. Critical handoffs the RCM must model:

- `PROC-KYC-001` → `PROC-LND-001`: KYC completion gates loan disbursement; risk rating from KYC drives loan pricing tier
- `PROC-KYC-001` ↔ `PROC-AML-001`: customer risk rating informs TM scenario selection; AML investigations trigger re-KYC
- `PROC-LND-001` → `PROC-AML-001`: high-value disbursements flow to TM; loan account opening replicates KYC obligations
- `PROC-UPI-001` → `PROC-AML-001`: UPI transactions are highest-volume input to TM; mule detection is bidirectional
- `PROC-VND-001` underpins all others — KYC ops, AML L1, UPI processing, IT all rely on TPSPs
- `PROC-COMP-001` is the post-failure detection layer for breaches in `PROC-LND-001`, `PROC-UPI-001`, and `PROC-KYC-001`

---

## 2. Step & Activity Definitions

### 2.1 PROC-KYC-001 — Customer Onboarding & KYC (Deep Dive)

**Process owner**: Head of Retail Onboarding (1LoD) + CCO oversight (2LoD)
**Regulatory anchors**: `OBL-RBI-001` to `OBL-RBI-005`, `OBL-PMLA-005`, `OBL-FIU-001`, `OBL-RBI-053`
**Linked Pass 1 risks**: `R-FC-001`, `R-CO-001`, `R-CD-001`, `R-FR-001`
**Linked Pass 1 failures**: `FAIL-001` (KYC documentation drift)
**Channel mix (typical mid-sized PB FY26)**: branch ~20%, internet/mobile + Aadhaar OTP ~35%, V-CIP (Video CIP) ~25%, partner-led DSA/fintech LSP ~15%, NRI online ~5%

#### Process Flow Summary

The KYC process is a *gated chain* — each step gates the next via system flags or human attestation. In reality, the chain leaks at multiple points: branch overrides, BPO data-entry errors, periodic re-KYC pendency, and CKYCR upload failures. The most fragile transitions are STEP-KYC-04 → STEP-KYC-05 (BO identification → risk rating) for legal entities, and STEP-KYC-09 → ongoing monitoring (initial onboarding → periodic re-KYC trigger).

#### Steps and Activities

| Step ID | Step Name | Primary Actor | Systems | Auto/Manual | BPO Involvement | Where Drift Occurs |
|---|---|---|---|---|---|---|
| `STEP-KYC-01` | Customer Lead Capture & Channel Determination | branch_staff / system / dsa | CRM, mobile_app, partner_portal | Hybrid | Low — DSA may capture initial data | Channel mis-tagging (V-CIP customer recorded as branch); duplicate UCIC creation |
| `STEP-KYC-02` | CIP — Identity Verification | system / branch_staff / bpo_l1 | UIDAI, UIDAI eKYC, NSDL PAN, DigiLocker, document_capture | Mostly automated for digital channels; manual for branch | Heavy — BPO L1 verifies docs, transcribes manually-filled forms | OTP-based eKYC used as substitute for full CDD; document image quality issues; data entry errors |
| `STEP-KYC-03` | CDD — Customer Due Diligence | bpo_l1 / branch_staff | CRM, KYC_workflow_tool | Manual heavy | Heavy — Tier-2/3 city BPO floors | Address proof and identity proof reconciliation; minimum-CDD accounts not converted to full-KYC within window |
| `STEP-KYC-04` | Beneficial Owner Identification (legal entities) | bpo_l2 / compliance_officer | CRM, MCA portal, CERSAI, CKYCR | Manual heavy | Medium | 10% partnership BO threshold (post 12-Jun-2025) not enforced; nested ownership chains; trust "protector" missed |
| `STEP-KYC-05` | Customer Risk Rating | system | risk_engine | Automated | None | Risk rating model not retrained; new product/channel risk not parameterized |
| `STEP-KYC-06` | Sanctions / PEP / Adverse Media Screening | system / compliance_officer | screening_tool (Refinitiv / LexisNexis / in-house), UAPA list, OFAC overlay | Automated trigger; manual disposition | Medium — false-positive triage outsourced | Fuzzy matching thresholds; transliteration variants (Devanagari to Latin); list update lag |
| `STEP-KYC-07` | EDD for High-Risk Customers | compliance_officer | EDD_tool, CRM, public_records_API | Manual heavy | Low | Source of wealth/funds documentation pro-forma; senior approval rubber-stamped |
| `STEP-KYC-08` | Senior Approval & CKYCR Upload | compliance_officer / system | CRM, CKYCR, workflow | Hybrid | Low | CKYCR upload failure not retried; UCIC linkage missed |
| `STEP-KYC-09` | Account Activation & Ongoing Monitoring Setup | system | CBS, AML_engine, risk_engine | Automated | None | AML scenario tagging not refreshed for product mix; periodic re-KYC reminder schedule not initiated |

#### Detailed Activity Table — `STEP-KYC-02` (CIP — Identity Verification)

| Activity ID | Activity | Actor | System | Input | Output | India-Specific Reality |
|---|---|---|---|---|---|---|
| `ACT-KYC-02-01` | Capture Aadhaar / VID / offline-XML / DigiLocker token | customer / branch_staff | mobile_app / branch_terminal | Aadhaar number + biometric or OTP | Aadhaar eKYC response with masked Aadhaar | Aadhaar eKYC permitted only for select use cases (Sec 11A PMLA); biometric eKYC requires Aadhaar Authentication User Agency (AUA) registration |
| `ACT-KYC-02-02` | PAN verification via NSDL / Income Tax API | system | NSDL_API | PAN number | PAN holder name + status | Mandatory for accounts ≥ ₹50K credit/debit/balance; Form 60 fallback if no PAN |
| `ACT-KYC-02-03` | Officially Valid Document (OVD) capture | customer / branch_staff | document_capture_tool | Voter ID / Passport / DL / NREGA / etc. | OVD image + metadata | DigiLocker integration preferred; physical OVD photocopying still common at branches |
| `ACT-KYC-02-04` | Live photo capture (V-CIP) or in-person verification | customer / rm | V-CIP_tool with geo-tagging | Selfie + liveness check + RM video session | Verified photo + RM attestation | V-CIP requires RBI-prescribed protocol: random number challenge, geo-tag, PII not visible to RM |
| `ACT-KYC-02-05` | Address proof capture | customer / branch_staff | document_capture | OVD address or supplementary doc | Address record + verification status | Local-language address strings; pin-code mismatches; lat-long capture not standard |
| `ACT-KYC-02-06` | Bio-metric capture (where required) | customer / branch_staff | biometric_device | Fingerprint / iris | UIDAI auth response | Required for offline e-KYC with Aadhaar; not all branches have working biometric devices |

#### Detailed Activity Table — `STEP-KYC-04` (Beneficial Owner Identification)

| Activity ID | Activity | Actor | System | Input | Output | India-Specific Reality |
|---|---|---|---|---|---|---|
| `ACT-KYC-04-01` | Capture entity documents (CoI, MoA/AoA, partnership deed, trust deed) | bpo_l1 | document_management | Entity legal documents | Document index + extracted metadata | Trust deeds often physical; partnership deeds frequently amended verbally |
| `ACT-KYC-04-02` | Identify natural-person controllers | compliance_officer | CRM, MCA portal | Entity ownership chain | List of BOs ≥ threshold | 10% threshold for partnerships (RBI 12-Jun-2025); 25% for cos; "Senior Managing Official" fallback if no BO ≥ threshold |
| `ACT-KYC-04-03` | Verify each BO via separate KYC chain (recursive) | bpo_l1 / compliance_officer | KYC_workflow | Each BO's identity | BO KYC records | Recursion is the failure point — nested ownership / foreign BO requires consular verification |
| `ACT-KYC-04-04` | Capture trust "protector" / "settlor" if applicable | compliance_officer | CRM, document_management | Trust deed roles | Protector / settlor records | Added explicitly in 12-Jun-2025 amendment; many banks still treating only trustee + beneficiary |
| `ACT-KYC-04-05` | UBO declaration (signed Form Annexure) | rm / compliance_officer | document_management | Customer-signed UBO form | Signed UBO declaration | Often pre-printed and signed without active disclosure of all BOs |
| `ACT-KYC-04-06` | Cross-check against MCA / CKYCR / CERSAI | system / compliance_officer | MCA_API, CKYCR, CERSAI | Entity PAN / CIN | Cross-reference results | API rate limits; lag in MCA data updates |

---

### 2.2 PROC-LND-001 — Retail Personal Loan Origination (Deep Dive)

**Process owner**: Head of Retail Lending (1LoD) + Chief Credit Officer (1.5 LoD oversight) + CCO (2LoD)
**Regulatory anchors**: `OBL-RBI-022` to `OBL-RBI-029` (Digital Lending), `OBL-RBI-036` to `OBL-RBI-038` (IRACP), `OBL-RBI-027` (Penal Charges), `OBL-RBI-051` (Statutory Restrictions)
**Linked Pass 1 risks**: `R-CR-001`, `R-CD-001`, `R-FR-001`, `R-CO-001`
**Linked Pass 1 failures**: `FAIL-004` (Digital lending compliance), `FAIL-005` (Co-lending governance), `FAIL-009` (IRACP drift)
**Channel mix (typical mid-sized PB FY26)**: DSA-led ~45%, digital direct (own DLA) ~25%, branch ~15%, LSP/fintech partnership ~10%, pre-approved cross-sell ~5%

#### Process Flow Summary

The retail personal loan flow is the highest-velocity origination process in Indian banking and one of the most regulator-watched (post-Bajaj Finance Nov-2023). The "drift surface" is largest at three points: (1) DSA-led sourcing where KYC is initiated by a third party; (2) the KFS generation step where APR computation, charge disclosure, and digital signing must be executed BEFORE acceptance per the 8-May-2025 DL Directions; (3) post-disbursement IRACP tagging where manual overrides have historically masked stress.

#### Steps and Activities

| Step ID | Step Name | Primary Actor | Systems | Auto/Manual | BPO/Vendor Involvement | Where Drift Occurs |
|---|---|---|---|---|---|---|
| `STEP-LND-01` | Lead Sourcing & Pre-Qualification | dsa / lsp / system | CRM, partner_portal, DLA | Hybrid | Heavy — DSAs source 45-60% of leads | DSA-side data quality; pre-qual based on stale bureau data; LSP arrangements outside `OBL-RBI-024` |
| `STEP-LND-02` | Application Capture & KYC Linkage | system / branch_staff / dsa | LOS, CRM, CKYCR | Automated for digital, manual for branch | Medium — DSA / BPO data entry | KYC re-verification skipped citing CKYCR availability |
| `STEP-LND-03` | Bureau Pull & Income Assessment | system | CIBIL, CRIF, Experian, Equifax, Perfios, Karza, Finbox, AA, GSTN | Automated | Low (vendors, not BPOs) | Bureau pull frequency throttled for cost; AA consent stale; bank-statement parsing errors |
| `STEP-LND-04` | Underwriting & Credit Scoring | system / underwriter | LOS, scoring_engine | Automated for low-ticket; underwriter for medium/high | Medium — outsourced underwriting common | Manual override of scorecard decision; documentation of rationale weak |
| `STEP-LND-05` | Policy Check & Pricing Decision | system / underwriter | LOS, policy_engine | Automated check; manual exception | Low | Policy exception abuse — soft caps treated as guidelines; pricing tier mis-assignment |
| `STEP-LND-06` | KFS Generation & Borrower Acceptance | system / customer | LOS, e-sign provider, DLA | Automated | Low | KFS not provided BEFORE acceptance; APR excludes some charges; digital signing not on RE letterhead |
| `STEP-LND-07` | Sanction & Documentation | system / underwriter / customer | LOS, e-sign, document_management | Hybrid | Low | Loan agreement clauses not aligned with KFS; co-lending split documentation gaps |
| `STEP-LND-08` | Disbursement | system | CBS, NEFT/RTGS/IMPS rails | Automated | Low | Disbursal to LSP-controlled account (banned); deductions at source not disclosed in KFS |
| `STEP-LND-09` | Post-Disbursement Monitoring & IRACP | system / loan_ops | CBS, EWS_engine, CRILC reporting | Automated; manual exception | Medium — collections / monitoring outsourced | Day-end IRACP override; restructuring-as-evergreening; SMA-1/SMA-2 reversal entries |

#### Detailed Activity Table — `STEP-LND-06` (KFS Generation & Borrower Acceptance)

This step is the highest-stakes regulatory-conduct gate post the May 2025 Digital Lending Directions. Each activity below is monitored by RBI through the CIMS portal (mandatory quarterly DLA reporting from 15-Jun-2025).

| Activity ID | Activity | Actor | System | Input | Output | India-Specific Reality |
|---|---|---|---|---|---|---|
| `ACT-LND-06-01` | Compute APR including all charges, fees, insurance, processing | system | LOS / pricing_engine | Loan amount, tenor, rate, charges, insurance | APR % | Charges excluded historically: GST on processing, doc-charges, prepayment fee floor, embedded insurance premium; dispute risk under `OBL-RBI-027` |
| `ACT-LND-06-02` | Generate KFS in prescribed format on RE letterhead | system | LOS, document_template | APR + structured loan details | KFS PDF on RE letterhead | Branding compliance — KFS must clearly identify the RE, not the LSP |
| `ACT-LND-06-03` | Digitally sign KFS by authorized RE signatory | system | e-sign service | Generated KFS | Digitally signed KFS | E-sign provider chosen (Aadhaar e-sign vs DSC); time-stamp authority |
| `ACT-LND-06-04` | Display KFS to borrower BEFORE acceptance with cooling-off explanation | system / customer | DLA / web | Signed KFS | Borrower-acknowledged KFS | Cooling-off: 1 day for tenor ≤ 7 days; 3 days for tenor > 7 days; pro-rata APR exit |
| `ACT-LND-06-05` | Capture borrower acceptance (not assumed from app navigation) | customer | DLA / web | Borrower action | Borrower acceptance event | Click-wrap "I accept" not sufficient — explicit OTP / e-sign action required |
| `ACT-LND-06-06` | Issue post-acceptance summary in vernacular language | system / customer | DLA / SMS / email | Acceptance event | Vernacular summary delivered | Vernacular delivery is regulatory soft-norm becoming hard-norm in 2025 DL Directions |

#### Detailed Activity Table — `STEP-LND-09` (Post-Disbursement Monitoring & IRACP)

This step is where evergreening drift historically occurred. Per `OBL-RBI-038` (14-Sep-2020 IRAC automation circular), all asset classification must be system-driven without manual override.

| Activity ID | Activity | Actor | System | Input | Output | India-Specific Reality |
|---|---|---|---|---|---|---|
| `ACT-LND-09-01` | Day-end SMA-0/SMA-1/SMA-2/NPA tagging | system | CBS / loan_servicing | Days past due (DPD) | Asset classification | Day-end batch (typically T+1 morning); manual reversal traditionally possible — now system-locked |
| `ACT-LND-09-02` | EWS signal generation (declining bureau score, GST anomaly, bank-statement red flags) | system | EWS_engine | Customer external + internal data | EWS signal with severity | Per `OBL-RBI-031` (15-Jul-2024 MD-FRM), EWS must be CBS-integrated real-time |
| `ACT-LND-09-03` | RFA tagging on EWS trigger | system / risk_officer | EWS_engine, CBS | EWS signals | Red Flagged Account marker | RFA threshold typically ≥ ₹50 cr exposure; CRILC reporting within 7 days |
| `ACT-LND-09-04` | Restructuring decision (where applicable) | underwriter / credit_committee | LOS, restructuring_workflow | Borrower request + financials | Restructuring approval / rejection | Must follow `OBL-RBI-037` definitions; cannot be used to upgrade from NPA without full clearance |
| `ACT-LND-09-05` | Provisioning calculation | system | CBS / accounting | Asset classification + collateral | Provision amount | IRACP-driven; standard / sub-standard / doubtful / loss tiers |
| `ACT-LND-09-06` | CRILC / CIBIL reporting | system | CRILC submission, CIBIL upload | Account status | Reported records | CRILC for ≥ ₹5 cr exposure; quarterly + on-event; CIBIL monthly |
| `ACT-LND-09-07` | Recovery agent allocation (delinquent accounts) | loan_ops / system | collections_tool | Delinquent account | Allocation record + agent KYC | Per `OBL-RBI-021`, RE bears recovery agent conduct responsibility |

---

### 2.3 PROC-AML-001 — AML Transaction Monitoring & Alert Disposition (Deep Dive)

**Process owner**: Principal Officer / BSA Officer (1LoD execution) + CCO (2LoD oversight)
**Regulatory anchors**: `OBL-PMLA-001` to `OBL-PMLA-005`, `OBL-FIU-001`, `OBL-RBI-050` (UAPA), `OBL-RBI-053`
**Linked Pass 1 risks**: `R-FC-001`, `R-FR-001`, `R-CO-001`, `R-TP-001`
**Linked Pass 1 failures**: `FAIL-002` (UPI mule), `FAIL-006` (TM outsourcing — HSBC India archetype)
**Volume signal**: 50K-500K alerts/month for typical mid-sized PB; effective true-positive rate 3-8%; STR conversion 1-3% of alerts

#### Process Flow Summary

AML monitoring is the most enforcement-exposed process in Indian banking — KYC/AML is the leading penalty category. The flow runs continuously across three time-scales: (1) real-time sanctions screening (sub-100ms per transaction), (2) batch/intra-day TM scenario alert generation (typically 4-6 batch cycles per day), and (3) longer-cycle investigations and STR filing (1-7 working days). The two highest-drift surfaces are STEP-AML-04 (L1 triage — heavily outsourced and was the subject of the HSBC India action) and STEP-AML-07 (STR filing latency).

#### Steps and Activities

| Step ID | Step Name | Primary Actor | Systems | Auto/Manual | BPO/Vendor Involvement | Where Drift Occurs |
|---|---|---|---|---|---|---|
| `STEP-AML-01` | Data Ingestion & Reconciliation | system | CBS, AML_engine, data_lake | Automated | None | Source-system schema drift; missing transaction fields; reconciliation breaks not addressed |
| `STEP-AML-02` | Real-Time Sanctions Screening | system | screening_tool (Fircosoft, Bridger, in-house) | Automated | None | Transliteration variants; list-update lag; fuzzy matching threshold tuning |
| `STEP-AML-03` | Behavioural / Threshold Scenario Alert Generation | system | AML_engine (Oracle FCCM/Mantas, Actimize) | Automated | None | Scenarios not retuned for UPI/digital; threshold drift; false-positive volume overwhelms triage |
| `STEP-AML-04` | L1 Alert Triage | bpo_l1 | case_mgmt | Manual | **VERY HEAVY — L1 typically outsourced (with caveats — see HSBC India action)** | Alert closure outsourced to non-permitted entities; closure-without-investigation; checklist filling |
| `STEP-AML-05` | L2 Investigation | bpo_l2 / compliance_officer | case_mgmt, public_records, internal_records | Manual | Medium — only specific activities outsourceable | SoF documentation pro-forma; transaction analysis shallow |
| `STEP-AML-06` | L3 / SAR Committee Decision | bsa_officer / compliance_officer | case_mgmt, SAR_committee_workflow | Manual | None | Committee meeting cadence slips; rationale for STR / no-STR not detailed |
| `STEP-AML-07` | STR Filing | bsa_officer / system | FIU-IND FINnet 2.0 | Hybrid | None | 7-working-day filing window breached; STR narrative quality variable; no-tipping-off discipline |
| `STEP-AML-08` | Post-Filing Monitoring & Customer Re-Rating | system / risk_officer | risk_engine, AML_engine | Hybrid | Low | Customer re-rating not auto-triggered; subsequent monitoring scenario not refreshed |

#### Detailed Activity Table — `STEP-AML-04` (L1 Alert Triage)

This step is the largest single point of regulatory attention in Indian AML. The HSBC India action (Feb-2025) penalised outsourcing of alert closure to a group company. Activities below describe the *operational reality* of how triage runs in mid-sized private banks.

| Activity ID | Activity | Actor | System | Input | Output | India-Specific Reality |
|---|---|---|---|---|---|---|
| `ACT-AML-04-01` | Receive alert with scenario, customer, transactions, score | bpo_l1 | case_mgmt | Alert payload | Acknowledged alert | Volumes: a single L1 analyst handles 20-60 alerts/day depending on scenario complexity |
| `ACT-AML-04-02` | Pull customer KYC + risk rating + UCIC linkage | bpo_l1 | case_mgmt + CRM/KYC view | Customer ID | Customer 360 view | UCIC fragmentation across product silos creates partial views |
| `ACT-AML-04-03` | Pull transaction history (3-12 months) | bpo_l1 | case_mgmt + CBS data feed | Customer ID | Transaction records | Data lag: typically T-1; intraday gaps for UPI |
| `ACT-AML-04-04` | Review against scenario-specific decision tree / SOP | bpo_l1 | SOP document / workflow | Alert + customer view | Triage decision (close / escalate L2 / urgent) | SOPs often outdated; new typologies not embedded |
| `ACT-AML-04-05` | Document rationale in alert closure notes | bpo_l1 | case_mgmt | Triage decision | Closure narrative | Rationale often pro-forma — "transactions appear consistent with stated profile" |
| `ACT-AML-04-06` | Quality assurance sampling (4-eye) | bpo_l1_qa / compliance_officer | case_mgmt + QA_workflow | Closed alerts (5-10% sample) | QA findings | QA function often co-located with L1 — independence concern |

#### Detailed Activity Table — `STEP-AML-07` (STR Filing)

| Activity ID | Activity | Actor | System | Input | Output | India-Specific Reality |
|---|---|---|---|---|---|---|
| `ACT-AML-07-01` | SAR Committee approves STR filing | bsa_officer + senior_compliance | committee_workflow | L3 case file | Committee approval record | Committee typically meets weekly — creates filing-window pressure |
| `ACT-AML-07-02` | Draft STR narrative aligned to FIU-IND format | compliance_officer | STR_drafting_tool | Approved case | Draft STR | Narrative quality varies; FIU-IND has issued repeat guidance on completeness |
| `ACT-AML-07-03` | Senior review and sign-off | bsa_officer | STR_drafting_tool | Draft STR | Reviewed STR | "No-tipping-off" — narrative cannot reference customer outreach |
| `ACT-AML-07-04` | File via FIU-IND FINnet 2.0 portal | bsa_officer | FIU-IND FINnet 2.0 | Reviewed STR | Filed STR with acknowledgment number | 7 working days from forming suspicion (interpretation: from L3 SAR Committee decision); breach risk under `OBL-PMLA-001` |
| `ACT-AML-07-05` | Archive STR + supporting evidence under PMLA Sec 12 | bsa_officer / system | document_management | Filed STR + supporting docs | Archived record (5-year retention) | Retention 5 years from transaction; access to supervisor-only |
| `ACT-AML-07-06` | Update customer risk rating and trigger enhanced monitoring | system / risk_officer | risk_engine, AML_engine | STR filing event | Updated risk rating + new monitoring rules | Often deferred / forgotten — `R-FC-021` (stale rating) materialises here |

---

### 2.4 PROC-UPI-001 — UPI Payment Processing & Dispute Handling (Standard Depth)

**Process owner**: Head of Digital Banking + Head of Payment Operations
**Regulatory anchors**: NPCI Procedural Guidelines + RBI Master Direction on Issuance and Operation of PPIs (last amended 12-Feb-2024); DPSS circulars; `OBL-RBI-031` (EWS) extends to UPI fraud
**Linked Pass 1 risks**: `R-FR-001`, `R-FC-001`, `R-OP-001`, `R-TC-001`
**Linked Pass 1 failures**: `FAIL-002` (UPI mule scale)

#### Steps Summary

| Step ID | Step Name | Primary Actor | Systems | Auto/Manual | Drift Points |
|---|---|---|---|---|---|
| `STEP-UPI-01` | Customer PSP / TPAP onboarding (linking UPI handle to bank account) | system / customer | UPI_app, PSP_handler, NPCI | Automated | Mule account proliferation at this step — handle linking with weak device-binding |
| `STEP-UPI-02` | Transaction initiation, authentication, authorization | system / customer | UPI_app, NPCI, CBS | Automated (sub-second) | UPI PIN harvesting via social engineering; collect-request abuse |
| `STEP-UPI-03` | Real-time fraud scoring & velocity check | system | fraud_engine, NPCI feedback | Automated | Score thresholds tuned for FP minimization rather than FN; novel patterns missed |
| `STEP-UPI-04` | Settlement and reconciliation | system | NPCI, CBS, recon_tool | Automated batch | Recon breaks — settlement vs CBS mismatch; chargeback flow lag |
| `STEP-UPI-05` | Customer dispute / chargeback handling | customer / branch_staff / bpo_l1 | dispute_portal, NPCI URC, CMS | Manual heavy | Reg E equivalent (DPSS) timelines; manual evidence collection from customer |

**Key controls** (referenced in Section 3): `CTRL-UPI-001` (real-time fraud scoring), `CTRL-UPI-002` (mule pattern detection), `CTRL-UPI-003` (dispute timeline SLA tracking).

---

### 2.5 PROC-COMP-001 — Customer Complaints Handling (Standard Depth)

**Process owner**: Principal Nodal Officer + Internal Ombudsman (IO) per RBI Internal Ombudsman Scheme 2018 / RB-IOS 2021 (Reserve Bank — Integrated Ombudsman Scheme, 12-Nov-2021)
**Linked Pass 1 risks**: `R-CD-001`, `R-CO-001`, `R-OP-001`
**Linked Pass 1 gaps**: `GAP-011` (conduct surveillance limited)

#### Steps Summary

| Step ID | Step Name | Primary Actor | Systems | Auto/Manual | Drift Points |
|---|---|---|---|---|---|
| `STEP-COMP-01` | Complaint capture (multi-channel: branch, call, email, web, RBI CMS) | customer / branch_staff / bpo_l1 / system | CMS, CRM, RBI_CMS_API | Hybrid | Complaints captured as "queries" or "service requests" to avoid escalation |
| `STEP-COMP-02` | Categorisation and routing | bpo_l1 / system | CMS | Hybrid | Mis-categorisation (mis-selling tagged as "service"); root-cause coding inconsistent |
| `STEP-COMP-03` | Investigation and resolution | branch_staff / business_owner / compliance_officer | CMS + relevant business systems | Manual heavy | Manual evidence collection; resolution-by-credit (closing complaint with refund without RCA) |
| `STEP-COMP-04` | Internal Ombudsman (IO) review for partial / wholly-rejected | io | IO_workflow, CMS | Manual | IO independence; bandwidth — IO must review every wholly-rejected complaint |
| `STEP-COMP-05` | RBI Banking Ombudsman / RB-IOS escalation | rbi_office / customer | RBI CMS portal | External | Bank's response window 30 days; non-response defaults adverse |
| `STEP-COMP-06` | RCA, thematic clustering, feedback loop to product / process | compliance_officer / business_owner | CMS, GRC | Manual | RCA done quarterly at best; clustering rare; feedback loop weak |

**Key controls**: `CTRL-COMP-001` (categorisation accuracy 4-eye sample), `CTRL-COMP-002` (IO review of all wholly-rejected complaints), `CTRL-COMP-003` (resolution SLA tracking with auto-escalation).

---

### 2.6 PROC-VND-001 — Vendor / TPSP Outsourcing Lifecycle (Standard Depth)

**Process owner**: Head of VMO + CISO + Procurement
**Regulatory anchors**: `OBL-RBI-016` to `OBL-RBI-021`
**Linked Pass 1 risks**: `R-TP-001`, `R-TC-001`, `R-OP-001`, `R-CD-001`
**Linked Pass 1 gaps**: `GAP-010` (vendor performance beyond contract)

#### Steps Summary

| Step ID | Step Name | Primary Actor | Systems | Auto/Manual | Drift Points |
|---|---|---|---|---|---|
| `STEP-VND-01` | Identification of "material" outsourcing | business_owner / vmo | VMO_tool, contracts_repo | Manual | Materiality classification understated; partner arrangements treated as "non-outsourcing" |
| `STEP-VND-02` | Due diligence (legal, financial, technical, security, reputation) | vmo + ciso + legal | VMO_tool, security_assessment | Manual | DD checklist-driven; not risk-tiered; sub-contractor (Nth-party) DD shallow |
| `STEP-VND-03` | Contract negotiation including audit rights, exit, data, BCP, breach notification | legal + vmo | contracts_repo, e-sign | Manual | Standard clauses; audit rights not exercised; data-location clauses generic |
| `STEP-VND-04` | Onboarding, integration, go-live | vmo + business_owner + tpsp_engineer | VMO_tool, ITSM | Hybrid | Production access granted with privileged credentials; segregation weak |
| `STEP-VND-05` | Ongoing monitoring (SLAs, security posture, financial health, sub-contractor changes) | vmo + ciso | VMO_tool, SIEM, vendor_portal | Hybrid | Monitoring quarterly at best; no real-time security/financial signals |
| `STEP-VND-06` | Incident response (TPSP cyber incident, SLA breach, financial distress) | vmo + ciso + business_owner | ITSM, incident_workflow | Manual | TPSP incident reporting to RE delayed; RE's 6-hr RBI reporting window squeezed |
| `STEP-VND-07` | Periodic review and re-affirmation | vmo + business_owner | VMO_tool | Manual | Annual review default; not triggered by signal events |
| `STEP-VND-08` | Exit / termination | vmo + business_owner + legal | VMO_tool, contracts_repo | Manual | Exit plan documented but not tested; data return / destruction certificates inconsistent |

**Key controls**: `CTRL-VND-001` (material outsourcing register completeness), `CTRL-VND-002` (DD package per RBI MD checklist), `CTRL-VND-003` (TPSP cyber incident 6-hr forwarding to RBI).

---

### 2.7 PROC-ITO-001 — IT Operations: Change, Incident, Patch, Access (Standard Depth)

**Process owner**: CIO / CTO (1LoD) + CISO (1.5 LoD) + Head of IT Audit (3LoD)
**Regulatory anchors**: `OBL-RBI-007` to `OBL-RBI-015` (ITGRCA), `OBL-RBI-048` (CERT-In 6-hr)
**Linked Pass 1 risks**: `R-TC-001`, `R-OP-001`
**Linked Pass 1 failures**: `FAIL-003` (HDFC/Kotak archetype), `FAIL-007` (delayed cyber reporting)

#### Steps Summary

| Step ID | Step Name | Primary Actor | Systems | Auto/Manual | Drift Points |
|---|---|---|---|---|---|
| `STEP-ITO-01` | Change request and impact assessment | tpsp_engineer / dev / sre | ITSM (ServiceNow / Remedy / Jira) | Hybrid | Standard / pre-approved changes broadened; emergency-change abuse |
| `STEP-ITO-02` | Change Advisory Board (CAB) review and approval | cab_committee | ITSM | Manual | CAB rubber-stamping; impact assessment shallow |
| `STEP-ITO-03` | Implementation in production | tpsp_engineer / dev / sre | CI/CD, deployment_tool | Hybrid | Out-of-window changes; rollback not tested |
| `STEP-ITO-04` | Incident detection (monitoring, alerts) | siem / sre | SIEM, monitoring_tools | Automated | Alert fatigue; novel patterns missed; vendor-side incident detection lag |
| `STEP-ITO-05` | Incident triage and escalation | l1_ops / sre / security_ops | ITSM, SIEM | Hybrid | Severity miscategorisation; escalation thresholds outdated |
| `STEP-ITO-06` | Cyber incident reporting to CERT-In (6 hr) and RBI CSITE (2-6 hr) | ciso + compliance_officer | CERT-In portal, RBI reporting template | Manual | Reporting clock starts at "awareness" — definition contested; 6-hr breached if weekend / holiday |
| `STEP-ITO-07` | Patch / vulnerability management | sre / security_ops | patch_management, vuln_scanner | Hybrid | Patch SLA breached for "stability"; legacy CBS patches deferred |
| `STEP-ITO-08` | Identity and access management (IAM) | iam_team / hr | IAM, AD, PAM | Hybrid | Privilege creep; orphan accounts; shared service accounts; IAM not integrated with HR exit |
| `STEP-ITO-09` | DR drill and BCP exercise | bcm / it_ops | DR_environment | Manual | Drills nominal; failback not tested; data integrity post-DR not verified |

**Key controls**: `CTRL-ITO-001` (CAB approval before production change), `CTRL-ITO-002` (cyber incident 6-hr reporting), `CTRL-ITO-003` (privileged access quarterly review), `CTRL-ITO-004` (patch SLA enforcement).

---

## 3. Control vs ControlInstance — Design-Time vs Runtime

### 3.1 Conceptual Distinction

The foundational mental model from Pass 0 distinguishes:

- **`Control`** = the *design-time* entity. It is the policy / standard / procedure that defines what should happen, when, by whom, with what evidence. A Control has: a unique ID, a title, a description, a designed condition (when it should fire), an operating signal (what shows it fired), and an effectiveness signal (what shows it worked). Controls are versioned — a change in a regulator circular triggers a new Control version.
- **`ControlInstance`** = the *runtime* entity. It is the actual execution of a Control at a specific moment, for a specific subject (customer / loan / alert / change ticket / vendor). Each instance produces telemetry: timestamp, actor, system, input data, output decision, evidence reference. Instances accumulate by the millions per year.

The RCM platform must hold both. The Control schema is comparable to the US-bank Pass 0 schema (Control ID, Title, Type, Nature, Frequency, Owner, etc.). The ControlInstance schema must additionally capture: `instance_id`, `control_ref`, `control_version`, `subject_id` (UCIC / loan_id / alert_id), `start_ts`, `end_ts`, `actor`, `actor_type`, `system`, `outcome` (fired_correctly / should_have_fired_didnt / fired_inadequately), `evidence_refs[]`, `exception_flag`, `exception_reason`.

### 3.2 Control Catalogue (Selected — full list 30+ controls)

The catalogue below provides 18 representative controls across the seven processes (3-5 per deep-dive process, 1-3 per standard process).

#### Customer Onboarding & KYC Controls (PROC-KYC-001)

| Control ID | Control Title | Process Step | Type | Nature | Frequency | When It Should Fire | How It Fires | How Effectiveness Is Measured | Linked Risks / OBLs |
|---|---|---|---|---|---|---|---|---|---|
| `CTRL-KYC-001` | 4-eye CDD verification before account activation | `STEP-KYC-08` | Preventive | ITDM | per-customer | Before any account is moved to "active" status in CBS | KYC workflow tool routes file to senior compliance officer post BPO L1 entry; senior reviews + e-signs approval; CBS receives "activated" flag only after dual sign-off | (a) % new accounts with both maker and checker stamps, (b) sample re-performance of 5% files monthly, (c) AFI sample observation rate | `R-FC-001`, `R-FC-014` / `OBL-RBI-001`, `OBL-RBI-005` |
| `CTRL-KYC-002` | Real-time sanctions / PEP / adverse media screening at onboarding | `STEP-KYC-06` | Preventive | Automated | per-customer + on-list-update | Synchronous call before customer record is committed; rerun on every UN/UAPA list update | screening_tool API call from onboarding workflow; hits route to L1 disposition queue; non-disposition blocks activation | (a) zero true-positive sanctions matches activated, (b) list-load SLA <2 hrs from publication, (c) false-negative testing via known-positive synthetic identities | `R-FC-001`, `R-FC-010` / `OBL-RBI-050`, `OBL-OFAC-001` (where applicable) |
| `CTRL-KYC-003` | Periodic KYC re-update workflow auto-trigger | `STEP-KYC-09` (ongoing) | Detective | Automated | risk-based (HRC every 2 yr / MRC 8 yr / LRC 10 yr) | At periodic update due date; at trigger-event (transaction pattern shift, sanctions list update, document expiry) | risk_engine + AML_engine signal → KYC workflow case → 3 advance notifications + 1 letter → if no response, restrict account | (a) % overdue periodic KYC < 5%, (b) reminder issuance completeness, (c) account restriction enforcement | `R-FC-001` / `OBL-RBI-002` |
| `CTRL-KYC-004` | Beneficial Owner threshold enforcement (10% partnership / 25% co.) | `STEP-KYC-04` | Preventive | ITDM | per-legal-entity | At entity onboarding and on any ownership change disclosed | Workflow rule applies thresholds; system blocks activation if BO chain incomplete; trust "protector" / "settlor" mandatory fields | (a) % entity files with BO documented down to natural person, (b) sample MCA cross-check accuracy, (c) compliance testing observation rate | `R-FC-001` / `OBL-RBI-005` |
| `CTRL-KYC-005` | CKYCR upload completeness within prescribed window | `STEP-KYC-08` | Detective | Automated | per-customer | Within prescribed window post account activation | system batch + retry on failure; failure escalation to compliance | (a) % files uploaded successfully, (b) retry success rate, (c) backlog age | `R-FC-001`, `R-CO-001` / `OBL-RBI-003` |

#### Retail Lending Controls (PROC-LND-001)

| Control ID | Control Title | Process Step | Type | Nature | Frequency | When It Should Fire | How It Fires | How Effectiveness Is Measured | Linked Risks / OBLs |
|---|---|---|---|---|---|---|---|---|---|
| `CTRL-LND-001` | Mandatory bureau pull pre-credit-decision | `STEP-LND-03` | Preventive | Automated | per-application | Before underwriting decision committed | LOS workflow rule: bureau API call must succeed and bureau report retrieved before any "approve" / "reject" status change | (a) zero approvals without bureau, (b) bureau pull SLA, (c) 4-bureau coverage rate | `R-CR-001` / `OBL-RBI-038` |
| `CTRL-LND-002` | KFS issuance BEFORE borrower acceptance with APR completeness | `STEP-LND-06` | Preventive | Automated | per-loan | Before borrower acceptance event captured | LOS generates KFS with APR including all charges; e-signs on RE letterhead; displays to borrower; borrower acceptance can only follow KFS view | (a) 100% loans with KFS pre-acceptance event, (b) APR-completeness audit (sampling charges), (c) CIMS portal reconciliation | `R-CD-001`, `R-CO-001` / `OBL-RBI-022`, `OBL-RBI-027` |
| `CTRL-LND-003` | Policy exception 4-eye approval with rationale | `STEP-LND-05` | Preventive | ITDM | per-exception | Whenever LOS scorecard / policy engine returns "exception" | Automatic routing to senior credit authority; rationale field mandatory; exception reason coded into bounded vocabulary | (a) % exceptions with documented rationale, (b) exception approver authority alignment, (c) exception-to-NPA rate vs policy-compliant cohort | `R-CR-001`, `R-CO-001` / `OBL-RBI-051` |
| `CTRL-LND-004` | System-driven IRACP day-end tagging without manual override | `STEP-LND-09` | Detective | Automated | daily | Day-end batch on every loan account | CBS batch computes DPD and applies SMA-0/1/2/NPA tags; no user role can override classification | (a) zero manual classification overrides logged, (b) classification accuracy on AFI sample, (c) divergence vs reported NPA | `R-CR-001`, `R-FR-001` / `OBL-RBI-036`, `OBL-RBI-038` |
| `CTRL-LND-005` | EWS / RFA flagging integrated with CBS for real-time monitoring | `STEP-LND-09` | Detective | Automated | continuous | On any EWS signal trigger (bureau drop, GST anomaly, statement red flag) | EWS_engine ingests signals → CBS account is flagged → CRILC reporting workflow opens within 7 days for ≥ ₹50 cr exposure | (a) % EWS triggers tagged within SLA, (b) RFA-to-fraud confirmation rate, (c) MD-FRM 2024 compliance audit | `R-FR-001`, `R-CR-001` / `OBL-RBI-031`, `OBL-RBI-032` |

#### AML Monitoring Controls (PROC-AML-001)

| Control ID | Control Title | Process Step | Type | Nature | Frequency | When It Should Fire | How It Fires | How Effectiveness Is Measured | Linked Risks / OBLs |
|---|---|---|---|---|---|---|---|---|---|
| `CTRL-AML-001` | Real-time payment sanctions screening | `STEP-AML-02` | Preventive | Automated | per-transaction | Synchronous on outgoing payment / wire / NEFT-RTGS / cross-border | screening_tool synchronous call before payment release; UAPA + UN + OFAC overlay; positive hit blocks | (a) zero true sanctions hits released, (b) false-negative testing, (c) list-load SLA, (d) per-channel coverage | `R-FC-001`, `R-FC-002` / `OBL-RBI-050` |
| `CTRL-AML-002` | TM scenario coverage attestation | `STEP-AML-03` | Preventive | Manual | annual + on-product-launch | Scenario library reviewed against products / customer segments / channels / geographies | Compliance + Model Risk produce coverage matrix; gaps documented and remediated | (a) coverage matrix completeness, (b) MRM validation of scenarios, (c) IA review observation rate | `R-FC-001`, `R-MR-001` / `OBL-PMLA-001`, `OBL-FFIEC-BSA-006` (if applicable) |
| `CTRL-AML-003` | STR filing within 7 working days of suspicion | `STEP-AML-07` | Corrective | Manual | per-case | From SAR Committee decision | Compliance officer drafts → senior review → filing on FIU-IND FINnet 2.0 | (a) % STRs filed within SLA, (b) FIU-IND feedback / requests for info, (c) STR narrative quality QA score | `R-FC-001`, `R-FC-017` / `OBL-PMLA-001` |
| `CTRL-AML-004` | TM model annual independent validation | (governance) | Detective | Manual | annual | Annual or on material model change | MRM independent validation per SR 11-7 equivalent practice; report to Board Risk Committee | (a) validation cycle adherence, (b) findings closure SLA, (c) outcomes analysis stability | `R-MR-001` / `OBL-PMLA-001`, `OBL-FFIEC-BSA-007` (if applicable) |
| `CTRL-AML-005` | Mule account pattern detection (network / graph) | `STEP-AML-03` (post-deployment) | Detective | Automated | continuous | On every account-funding inflow + outflow pair | Graph-ML model scores customer-network features (rapid funnel-out, dormant-then-active, geo-velocity, device fingerprint clustering); high-score → priority L1 alert | (a) mule-account confirmation rate, (b) days-to-mule-flag, (c) NPCI feedback alignment | `R-FR-001`, `R-FC-001` / `OBL-RBI-004`, `OBL-RBI-031` |

#### Standard-Depth Process Controls (1-3 per process)

| Control ID | Control Title | Process / Step | Type | Nature | Frequency | When It Fires | Effectiveness Measure |
|---|---|---|---|---|---|---|---|
| `CTRL-UPI-001` | Real-time fraud scoring on UPI | `PROC-UPI-001 / STEP-UPI-03` | Preventive | Automated | per-transaction | Synchronous before transaction posting | (a) fraud loss/quarter, (b) FN rate via NPCI feedback |
| `CTRL-UPI-002` | UPI dispute SLA tracking and chargeback | `PROC-UPI-001 / STEP-UPI-05` | Detective | ITDM | continuous | On any customer-raised dispute | (a) dispute closure SLA adherence, (b) NPCI URC compliance |
| `CTRL-COMP-001` | Internal Ombudsman review of all wholly-rejected complaints | `PROC-COMP-001 / STEP-COMP-04` | Detective | Manual | per-rejected-complaint | Whenever bank's resolution = wholly rejected | (a) IO review coverage, (b) IO override rate, (c) RB-IOS escalation rate |
| `CTRL-VND-001` | Material outsourcing register quarterly attestation | `PROC-VND-001 / STEP-VND-01` | Detective | Manual | quarterly | At quarter-end | (a) register completeness audit, (b) materiality classification accuracy |
| `CTRL-VND-002` | TPSP cyber-incident 6-hr forwarding to RBI / CERT-In | `PROC-VND-001 / STEP-VND-06` | Corrective | ITDM | per-event | On TPSP incident notification | (a) reporting SLA adherence, (b) tabletop exercise outcome |
| `CTRL-ITO-001` | Cyber incident 6-hr reporting to CERT-In + RBI CSITE | `PROC-ITO-001 / STEP-ITO-06` | Corrective | Manual | per-event | On confirmed cyber incident | (a) SLA adherence, (b) report completeness, (c) IB-CART notification timing |
| `CTRL-ITO-002` | Privileged access quarterly review | `PROC-ITO-001 / STEP-ITO-08` | Detective | ITDM | quarterly | At quarter-end | (a) review completeness, (b) orphan / shared account remediation rate |

### 3.3 ControlInstance — Runtime Capture

**ControlInstance schema** (extends the design-time `Control` schema):

```
ControlInstance {
  instance_id: string                    // CI-CTRL-KYC-001-2026-04-15T10-32-04Z-shard12
  control_ref: string                    // CTRL-KYC-001
  control_version: string                // v3.2 (matches versioned Control)
  subject_type: enum                     // customer | loan | alert | change | vendor | transaction | complaint
  subject_id: string                     // UCIC123456789 / LN0098765 / ALERT0556 / CHG2026-1102 / VND-0098
  start_ts: timestamp
  end_ts: timestamp
  actor_id: string                       // employee_id or system_account
  actor_type: enum                       // (see actor types in Section 0)
  system: enum                           // CBS | LOS | AML_engine | etc.
  input_payload_ref: string              // pointer to input snapshot (hash or storage URI)
  output_decision: enum                  // pass | fail | exception | override | pending
  outcome: enum                          // fired_correctly | should_have_fired_didnt | fired_inadequately | not_applicable
  evidence_refs: list<string>            // [EVD-LOG-..., EVD-DOC-..., EVD-SIGN-...]
  exception_flag: boolean
  exception_reason: enum                 // bounded vocabulary tied to control
  override_actor_id: string?             // if outcome=override, who approved
  upstream_instance_refs: list<string>?  // for chained controls
  metadata: map                          // control-specific (e.g., for CTRL-KYC-002: hit_count, list_version)
}
```

**How ControlInstances are captured** depends on the control's `nature` (Manual / Automated / ITDM):

- **Automated controls** (e.g., `CTRL-AML-001` real-time sanctions, `CTRL-LND-001` bureau pull, `CTRL-UPI-001` fraud scoring): the executing system writes a `ControlInstance` record per execution. In Indian banks today, this is mostly available *if* the system has been instrumented — but historical CBS / older AML engines do not emit structured CI records. RCM platform must consume from system event streams (Kafka / equivalent) or, where unavailable, from logs via parsing.
- **ITDM controls** (e.g., `CTRL-LND-003` policy exception 4-eye, `CTRL-KYC-001` CDD activation): a system component executes (the workflow tool routing the case) and a human acts (the approver clicking sign-off). The CI is emitted by the workflow tool and includes both the system execution and the human attestation event.
- **Manual controls** (e.g., `CTRL-AML-002` scenario coverage attestation, `CTRL-AML-003` STR filing, `CTRL-COMP-001` IO review): captured only via attestation workflows, document submissions, and committee minutes. Today these are heavily Excel/email/SharePoint; the RCM platform must provide structured capture interfaces.

**Data produced per ControlInstance**:
1. *Existence proof*: that the control fired at all
2. *Operating signal*: when, who, with what input, with what output
3. *Effectiveness signal*: did the control achieve its designed purpose (assessed via outcome analysis aggregate, not per-instance)
4. *Evidence chain*: pointers to raw evidence supporting the instance

**Volume implications** for a mid-sized PB:
- `CTRL-AML-001` (real-time sanctions): ~200M-2B instances/month (one per transaction)
- `CTRL-UPI-001` (UPI fraud scoring): ~200M-2B instances/month
- `CTRL-LND-001` (bureau pull): ~30K-100K instances/month
- `CTRL-AML-003` (STR filing): ~200-2,000 instances/month
- `CTRL-AML-002` (TM scenario coverage attestation): ~1-4 instances/year

The platform must handle this volume gradient — from billions of automated event instances to single annual attestations — within a unified data model.

---

## 4. Evidence Model

### 4.1 Evidence Taxonomy

Every `ControlInstance` references one or more evidence records. The Evidence model classifies these into eight types:

| Evidence Type | Code | Description | Auto / Manual | Typical Source |
|---|---|---|---|---|
| System log | `EVD-LOG` | Structured machine-readable log entry from a transactional system | Auto | CBS, LOS, AML_engine, NPCI, screening_tool |
| Document | `EVD-DOC` | Unstructured or semi-structured document (PDF, image, Word) | Mixed | KYC docs, KFS, contracts, SOC reports, audit reports |
| Attestation | `EVD-ATTEST` | Signed statement by a named actor about state of a control / fact | Manual today; can be machine-readable | Branch attestations, BO declarations, RCSA results |
| Digital signature | `EVD-SIGN` | Cryptographically signed acceptance / approval | Auto | E-sign on KFS, Aadhaar e-sign, DSC on agreements |
| Reconciliation | `EVD-RECON` | Match / mismatch record across two or more source systems | Auto | Nostro recon, NPCI vs CBS, GL vs subsidiary |
| Voice / call recording | `EVD-CALL` | Call audio + transcription | Auto-capture; manual review | Bancassurance calls, recovery calls, customer service |
| Image / video | `EVD-IMG` | Live photo, V-CIP video session, branch CCTV | Mixed | V-CIP, V-KYC, branch surveillance |
| Biometric | `EVD-BIO` | Biometric verification record | Auto | UIDAI auth response, fingerprint capture |

### 4.2 Activity-to-Evidence Mapping (Selected)

This shows what evidence each activity *should* generate, and the auto/manual status today.

| Activity | Generated Evidence (auto today) | Generated Evidence (manual today) | What Should Be Machine-Readable |
|---|---|---|---|
| `ACT-KYC-02-01` (Aadhaar / VID capture) | UIDAI auth response (`EVD-BIO`, `EVD-LOG`) | — | Already auto; ensure full audit trail captured |
| `ACT-KYC-02-04` (V-CIP live session) | Video session (`EVD-IMG`), geo-tag (`EVD-LOG`), random-number-challenge log (`EVD-LOG`) | RM observation notes (`EVD-DOC`) | RM observation should be structured fields, not free text |
| `ACT-KYC-04-05` (UBO declaration) | E-sign event (`EVD-SIGN`) — when used | Signed paper form (`EVD-DOC`) | UBO chain should be structured graph, not signed flat list |
| `ACT-LND-06-02` (KFS generation) | KFS PDF on RE letterhead (`EVD-DOC`), digitally signed (`EVD-SIGN`), CIMS reporting record (`EVD-LOG`) | — | KFS body must be parseable structured XML/JSON, not just PDF |
| `ACT-LND-06-05` (Borrower acceptance) | E-sign event (`EVD-SIGN`), system log (`EVD-LOG`) | — | Already auto; ensure tamper-evident |
| `ACT-LND-09-01` (Day-end IRACP tagging) | CBS classification log (`EVD-LOG`), DPD computation snapshot (`EVD-RECON`) | — | Auto today in modern CBS |
| `ACT-AML-04-04` (L1 alert SOP review) | Case management log (`EVD-LOG`), checklist responses (`EVD-LOG`) | Closure narrative (`EVD-DOC`) | Closure narrative should be structured rationale tags + free text, not free text only |
| `ACT-AML-07-04` (STR filing) | FINnet 2.0 acknowledgment (`EVD-LOG`) | STR narrative document (`EVD-DOC`) | STR narrative parts should be structured (typology codes, predicate offence tags) |
| `STEP-COMP-04` (IO review) | IO_workflow log (`EVD-LOG`) | IO review note (`EVD-DOC`) | Decision and rationale should be structured fields |
| `STEP-VND-02` (TPSP DD) | DD checklist responses (`EVD-LOG`) | DD report (`EVD-DOC`), SOC report (`EVD-DOC`) | DD findings should be structured per RBI MD checklist |
| `STEP-ITO-06` (Cyber incident 6-hr reporting) | RBI CSITE template submission (`EVD-LOG`) | Incident report (`EVD-DOC`) | Incident report should be structured per CERT-In schema |
| `STEP-ITO-09` (DR drill) | DR test logs (`EVD-LOG`), recovery KPIs (`EVD-LOG`) | Drill report (`EVD-DOC`), sign-off attestations (`EVD-ATTEST`) | RTO/RPO measurements should be auto-captured per system |

### 4.3 Evidence Quality Dimensions

The platform must score evidence on four dimensions:

1. **Completeness** — does the evidence record capture all required fields per the control's design?
2. **Timeliness** — was evidence captured at the moment of activity or post-hoc?
3. **Tamper-evidence** — is the evidence cryptographically signed, hashed, or write-once?
4. **Linkage** — is evidence linked to its `ControlInstance` and through it to the underlying subject (customer / loan / etc.)?

Most Indian-bank evidence today is moderate on completeness, low on timeliness (post-hoc paperwork common), low on tamper-evidence (PDF + email are dominant), and moderate on linkage (cases linked but evidence chains broken across systems).

### 4.4 Machine-Readable Targets (post AI augmentation)

Per Pass 1 `AI-005` (Evidence auto-assembly), the target state is:

- All `EVD-DOC` items have parsed structured representations (LLM extraction)
- All `EVD-ATTEST` items use structured workflow instead of email
- All `EVD-CALL` items have transcription + speaker diarization + structured tagging
- All `EVD-LOG` items emit to a unified event stream consumable by the GRC platform
- `ControlInstance` → `Evidence` linkage is enforced by platform validation, not policy

---

## 5. Failure Modes

The foundational mental model identifies three failure categories: *activity drift*, *process gaps*, and *control failures*. They sit on a continuum: drift accumulates into gaps, which surface as control failures.

### 5.1 Activity Drift Patterns (`FM-DRIFT-*`)

Activity drift = frontline / operational actors *gradually* doing the activity differently than designed, without process or control changes catching up.

| ID | Drift Pattern | Where Observed | Why It Happens (India context) | Detection Difficulty | Pass 1 Failures |
|---|---|---|---|---|---|
| `FM-DRIFT-001` | OTP-based eKYC normalised as substitute for full CDD | `STEP-KYC-02`, `STEP-KYC-03` | Volume pressure; OTP fastest path; periodic-update conversion not enforced | High (looks compliant on form; gap visible only on UCIC fragmentation analysis) | `FAIL-001` |
| `FM-DRIFT-002` | DSA / LSP "pre-fills" KYC and credit data; bank's role becomes rubber-stamp | `STEP-LND-01`, `STEP-LND-02` | Volume targets; DSA economics; partner pressure | High (records look complete) | `FAIL-004`, `FAIL-005` |
| `FM-DRIFT-003` | Policy exception treated as routine path; documented rationale becomes pro-forma | `STEP-LND-05` | Tight pricing competition; sales pressure on credit policy | Medium (exception % rises gradually) | `FAIL-009` |
| `FM-DRIFT-004` | L1 AML alert closure narratives become templated ("transactions appear consistent…") | `STEP-AML-04` | BPO volume targets; SOPs under-revised; training thin | High (narratives look compliant; QA sample misses pattern) | `FAIL-006` |
| `FM-DRIFT-005` | Manual NPA reversal entries to mask SMA-2 / NPA tagging | `STEP-LND-09` | RM compensation; quarterly reporting pressure | Medium-high (subtle; surfaces only on year-end AFI sample) | `FAIL-009` |
| `FM-DRIFT-006` | KFS treated as post-acceptance disclosure rather than pre-acceptance gate | `STEP-LND-06` | Customer-experience pressure; "instant EMI" UX shortcuts | Medium (timestamp evidence exists if captured) | `FAIL-004` |
| `FM-DRIFT-007` | Sanctions screening fuzzy-match thresholds tuned too high; transliteration variants missed | `STEP-AML-02`, `STEP-KYC-06` | False-positive volume overwhelms triage capacity | High (only known-positive synthetic testing detects) | `FAIL-006` |
| `FM-DRIFT-008` | Recovery agent boundaries — calls outside permitted hours, harassment | `STEP-LND-09` (collections) | Collections vendor commission structure; FE / BPO floor pressure | High (depends on customer complaint surfacing) | `FAIL-008` |
| `FM-DRIFT-009` | Patch / change "stability" deferrals on legacy CBS systems | `STEP-ITO-07` | Customer-impact-aversion; ageing infrastructure | Medium-high (vulnerability scan signals exist but deprioritized) | `FAIL-003`, `FAIL-007` |
| `FM-DRIFT-010` | Mis-categorisation of complaints as "service requests" or "queries" | `STEP-COMP-02` | Reduces escalation pressure; performance metrics gaming | Medium (clusters surface in trend analysis) | (general conduct) |

### 5.2 Process Gap Patterns (`FM-GAP-*`)

Process gap = the documented process design has missed a regulatory, technical, or operational requirement; the gap exists even with full compliance to the documented process.

| ID | Process Gap Pattern | Where Observed | Cause | Detection Method | Pass 1 References |
|---|---|---|---|---|---|
| `FM-GAP-001` | UCIC-level CDD aggregation broken — same PAN linked to multiple CIFs | `PROC-KYC-001` | Product-silo CBS architecture; legacy migrations | UCIC reconciliation reports; PAN-deduplication exception count | `FAIL-001`, `R-FC-001` |
| `FM-GAP-002` | Co-lending / partnership loans not run through bank's independent credit policy | `PROC-LND-001` | Partnership economics; "outsourced underwriting" treated as outside scope | Co-lending portfolio asset-quality vs. bank's organic portfolio | `FAIL-005` |
| `FM-GAP-003` | TM scenarios not refreshed for new products / channels (e.g., UPI mule typology) | `PROC-AML-001` | Annual scenario review cadence; product launch faster than scenario design | Coverage matrix review; scenario-product-channel cross-tab | `FAIL-002`, `FAIL-006` |
| `FM-GAP-004` | Critical operations end-to-end mapping missing (Op-Resilience GN April 2024) | All processes | Regulatory novelty; cross-LoB ownership unclear | Mapping completeness audit | `R-OP-001`, `GAP-014` |
| `FM-GAP-005` | TPSP sub-contractor (Nth-party) DD not done | `PROC-VND-001` | DD scope ends at direct TPSP; sub-contractor disclosure not contractual | DD package review | `FAIL-006`, `R-TP-001` |
| `FM-GAP-006` | DPDP Act 2023 data-fiduciary obligations not yet integrated into KYC / lending data flows | `PROC-KYC-001`, `PROC-LND-001` | Recent regulation; staggered rule notification | DPIA review; consent management audit | `R-CD-001`, `R-TC-001` |
| `FM-GAP-007` | Cyber incident reporting clocks (RBI 2-6 hr / CERT-In 6 hr / IT Outsourcing 6 hr / DPDP) not unified | `PROC-ITO-001`, `PROC-VND-001` | Multiple regulations; unclear "awareness" definition | Incident timeline reconstruction post-event | `FAIL-007` |
| `FM-GAP-008` | Beneficial Owner threshold for partnerships (10% post 12-Jun-2025) not back-applied to existing portfolio | `PROC-KYC-001` | Amendment effective forward; back-book remediation gap | Partnership BO portfolio review | `R-FC-001` |
| `FM-GAP-009` | Internal Ombudsman bandwidth — reviewing every wholly-rejected complaint not feasible at scale | `PROC-COMP-001` | Volume mismatch; IO independence vs. throughput tension | IO review backlog age | `R-CD-001`, `R-CO-001` |
| `FM-GAP-010` | EWS feeds not integrated to CBS in real-time (MD-FRM 2024 expectation) | `PROC-LND-001` | Architecture limitations; data engineering effort | EWS-to-CBS lag analysis | `R-FR-001`, `OBL-RBI-031` |

### 5.3 Control Failure Patterns (`FM-CTRL-*`)

Control failure = the control either doesn't fire when it should, fires inadequately, or fires too late.

| ID | Control Failure Pattern | Failure Mode | Common Cause | Detection Approach | Pass 1 References |
|---|---|---|---|---|---|
| `FM-CTRL-001` | Real-time sanctions screening returns false negative due to transliteration / fuzzy threshold | "Fired but inadequate" | Threshold tuning; list freshness | Synthetic positive testing; periodic FN analysis | `CTRL-AML-001`, `CTRL-KYC-002` |
| `FM-CTRL-002` | 4-eye CDD becomes 1-eye — checker without genuine review | "Fired but inadequate" | BPO volume; checker-as-rubber-stamp | Re-performance sample; checker action time analysis | `CTRL-KYC-001`, `CTRL-LND-003` |
| `FM-CTRL-003` | KFS generated post-acceptance instead of pre-acceptance (timestamp pattern) | "Fired but inadequately timed" | UX flow design; system rules not enforcing order | Timestamp ordering audit; CIMS reconciliation | `CTRL-LND-002`, `FAIL-004` |
| `FM-CTRL-004` | IRACP day-end tag manually overridden (where override is technically possible) | "Should have fired but didn't" / "Override" | Legacy CBS; manual override role still present | Override log analysis; classification reversal pattern | `CTRL-LND-004`, `FAIL-009` |
| `FM-CTRL-005` | STR filed > 7 working days after suspicion formed | "Fired late" | Committee meeting cadence; drafting bottleneck | Filing-clock audit | `CTRL-AML-003`, `OBL-PMLA-001` |
| `FM-CTRL-006` | TM model annual validation skipped or postponed | "Should have fired but didn't" | MRM capacity; validator independence shortage | Validation register vs. model inventory | `CTRL-AML-004`, `FAIL-006` |
| `FM-CTRL-007` | Privileged-access quarterly review not completed; orphan accounts persist | "Should have fired but didn't" | IAM / HR integration gap | IAM-HR reconciliation | `CTRL-ITO-002` |
| `FM-CTRL-008` | Cyber incident reported > 6 hr after detection; "awareness" definition stretched | "Fired late" | Weekend / holiday detection; severity mis-tag | Timeline forensics post-event | `CTRL-ITO-001`, `FAIL-007` |
| `FM-CTRL-009` | Material outsourcing register understates scope (partnerships excluded) | "Should have fired but didn't" | Materiality threshold interpretation | Inventory completeness audit | `CTRL-VND-001`, `FAIL-005` |
| `FM-CTRL-010` | EWS signal generated but not propagated to CBS / not actioned | "Fired but ineffective" | System integration gap; case workflow not live | Signal-to-action chain audit | `CTRL-LND-005`, `OBL-RBI-031` |
| `FM-CTRL-011` | Periodic re-KYC reminders issued but customer non-response not enforced via account restriction | "Fired inadequately" | Customer-experience aversion; restriction policy ambiguity | Re-KYC pendency vs restriction action audit | `CTRL-KYC-003`, `R-FC-001` |
| `FM-CTRL-012` | UPI fraud score above threshold but transaction allowed due to FP-minimization tuning | "Fired but ineffective" | Threshold optimisation against complaints | FN analysis via NPCI feedback | `CTRL-UPI-001` |

### 5.4 Drift → Gap → Failure Continuum (Worked Example)

One of the value propositions of the RCM platform is showing how individual drifts accumulate into systemic failures. Worked example:

**`FM-DRIFT-001` (OTP eKYC normalised) + `FM-GAP-001` (UCIC fragmentation) + `FM-CTRL-011` (re-KYC enforcement weak)** = `FAIL-001` (Paytm Payments Bank archetype). Each piece individually is small; together they produce a license-cancellation-grade failure.

**`FM-DRIFT-002` (DSA pre-fills) + `FM-DRIFT-006` (KFS post-acceptance) + `FM-CTRL-003` (KFS timestamp)** = `FAIL-004` (Bajaj Finance archetype Nov-2023).

**`FM-DRIFT-009` (patch deferrals) + `FM-GAP-007` (incident clock unification) + `FM-CTRL-008` (cyber 6-hr reporting late)** = `FAIL-003` / `FAIL-007` (HDFC Dec-2020, Kotak Apr-2024 archetypes).

Detection of the *combinations* — not just individual items — is what AI-driven process and evidence analysis enables (Pass 1 `AI-002` process mining, `AI-004` anomaly detection, `AI-010` issue clustering).

---

## Caveats

1. **Volume estimates** for processes (e.g., 50K-200K new accounts/month, 200M-2B UPI transactions/month) are *typical mid-sized private bank* ranges drawn from public RBI Annual Reports, NPCI bulletins, and industry analyst aggregations. They are not entity-specific and downstream RCM users should re-calibrate against the actual bank's volumes.

2. **Steps within deep-dive processes** are written at the granularity needed for an MVP RCM. Each step in production may decompose into 3-10 sub-steps in a true process model — this brief consciously trades sub-step granularity for cross-process consistency.

3. **Process designs differ across banks**. A bank may run KYC ops fully insourced; another may outsource L1 fully. The "BPO involvement" column above reflects the *typical* pattern, not the universal one.

4. **Control coverage is illustrative**. Five controls per deep-dive process and 1-3 per standard process is intentionally compressed — a real bank's RCM at full granularity per process typically holds 30-80 controls.

5. **Time-stamps and clock semantics** matter intensely in Indian banking. "From suspicion" in `OBL-PMLA-001`, "from awareness" in CERT-In, "from detection" in RBI cyber framework, "before acceptance" in DL Directions — each clock anchor is contestable in audit and must be operationally defined and instrumented in the RCM. This brief flags the clocks but downstream specifications must define the start-event precisely.

6. **DPDP Act 2023 implementation** is staggered through 2025-2026. Where DPDP intersects KYC / Lending data flows (e.g., consent for processing, data minimisation, purpose limitation), this brief notes the gap (`FM-GAP-006`) but does not fully expand the obligations — that requires a separate brief once final rules are notified.

7. **Process names are working labels**. Banks may call `PROC-COMP-001` "Customer Service & Grievance Redressal" or similar; the IDs are stable across naming.

8. **The drift → gap → failure mapping in Section 5.4** is illustrative not exhaustive. Real-world incidents (Paytm, Bajaj, HDFC, Kotak, HSBC) involved additional factors not captured here (e.g., governance / Board oversight failures, regulator-bank engagement breakdowns); this brief focuses on operational-control level chains relevant to RCM design.

9. **NPCI-specific obligations** are acknowledged in `PROC-UPI-001` but are governed by NPCI Procedural Guidelines (membership-based) rather than RBI Master Directions. Downstream RCM should treat NPCI Procedural Guidelines as a parallel obligation source (e.g., `OBL-NPCI-NNN`).

10. **RBI consolidation of 28-Nov-2025** affects Master Direction references throughout. The Pass 1 obligation IDs use the legacy / pre-consolidation circular references because they remain valid for legal purposes; the new sector-specific Master Directions should be separately mapped in a successor brief.

— *End of Pass 2 brief.*
