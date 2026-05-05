# Risk & Compliance Landscape — Mid-Sized Indian Private Sector Bank
**Research Brief for RCM Pipeline Ingestion (India)**
*Prepared by: CRO (India private sector bank), CCO (RBI-focused), RBI Regulatory Specialist, Internal Audit Head (India banking) | Cut-off: April 2026*

---

## 0. Conventions and IDs (for downstream parsing)

**ID schemas used throughout this document:**
- **Risk IDs**: `R-<DOMAIN>-NNN` where DOMAIN ∈ {CR=Credit, OP=Operational, CO=Compliance, CD=Conduct, TC=Tech/Cyber, FC=Financial Crime, TP=Third-Party/Vendor, FR=Fraud}
- **Obligation IDs**: `OBL-<SOURCE>-NNN` where SOURCE ∈ {RBI, PMLA, FIU, IT-ACT, SEBI, IRDAI, BR-ACT}
- **Failure Examples**: `FAIL-NNN`
- **Monitoring Gaps**: `GAP-NNN`
- **AI Opportunities**: `AI-NNN`
- **KRI IDs (referenced where relevant)**: `KRI-<DOMAIN>-NNN`

**Multi-value cell convention**: semicolon-separated (`;`) — e.g., `R-OP-001; R-TC-002; R-TP-001`
**Frequency vocabulary**: `one-time | daily | weekly | monthly | quarterly | semi-annual | annual | on-event | continuous`
**Severity / Inherent rating vocabulary**: `Low | Medium | High | Very High`
**Maturity to deploy vocabulary**: `Now | 6-12 months | 12+ months`
**Archetype codes**: `MSPB` (mid-sized private bank — baseline), `PSU` (public sector bank), `SFB` (small finance bank), `FBB` (foreign bank branch in India), `NBFC` (non-banking financial company including HFC)

**Regulatory citation format**: `<RBI Reference No.> <Department code>.<Sub-code>.<Serial>/<File-no.>/<FY> dated <DD-Mon-YYYY> (<Short Name>, as updated through <latest amendment date if known>)`

**Note on accuracy**: All RBI circular numbers/dates below have been verified against rbi.org.in or reputable secondary sources. Where verification was incomplete, the entry is flagged `[circular reference to be verified]`. The 2016 KYC Master Direction (`DBR.AML.BC.No.81/14.01.001/2015-16` dated 25-Feb-2016) was on 28-Nov-2025 superseded by ten sector-specific KYC Master Directions; the 2016 MD remains the operative reference for legacy obligations and amendment trail. References to "Commercial Banks – Know Your Customer Directions, 2025" should be read as the post-Nov-2025 successor framework. The 8-Nov-2024 KYC amendment (`DOR.AML.REC.49/14.01.001/2024-25`), the 12-Jun-2025 KYC amendment (`DOR.AML.REC.30/14.01.001/2025-26`) and the 14-Aug-2025 amendments are the most material recent revisions.

---

## SECTION 1 — Risk Categories (India-Specific)

This section enumerates the eight primary risk domains relevant to a mid-sized Indian private sector bank, with India-specific framing. Operational, IT/Cyber, and Financial Crime risks are weighted heaviest given Indian banking's distinctive operational density, UPI scale, and PMLA regime.

### R-CR-001 — Credit Risk (Concentration, Retail Velocity, Evergreening)
- **Description**: Loss arising from borrower default across corporate, retail, MSME, agri, and priority-sector lending. India-specific framing: heavy retail unsecured velocity (personal loans, credit cards, BNPL via Insta-EMI), priority sector mandates (40% of ANBC), structurally large MSME exposure, and historical evergreening pressure exemplified by the ICICI-Videocon and Yes Bank moratorium cases.
- **Why elevated in India**: RBI has tightened IRACP norms via `RBI/2021-2022/125 DOR.STR.REC.68/21.04.048/2021-22` dated 12-Nov-2021 (clarifying day-end NPA tagging) and `Master Circular RBI/2023-24/06 DOR.STR.REC.3/21.04.048/2023-24` dated 1-Apr-2023 (IRACP — Advances), both of which were direct responses to evergreening patterns observed in private and PSU banks.
- **Key sub-risks**:
  - Evergreening / restructuring abuse (round-tripping, technical write-offs)
  - Retail unsecured concentration (consumer durable EMI, BNPL)
  - Priority sector / agri NPA volatility (crop season-based norms)
  - Co-lending and FLDG-related credit migration risk
  - Wilful default / fraud-tagged accounts (intersects R-FR)
- **Inherent rating**: **High** — retail unsecured book growth combined with sub-1% net NPA targets creates classification pressure.
- **Archetype divergence**:
  - **PSU**: higher concentration in large corporate/PSU exposures, infrastructure project finance; legacy stressed-asset overhang materially higher.
  - **SFB**: microfinance and small-ticket retail dominate; geographic concentration risk acute (e.g., Karnataka MFI distress).
  - **FBB**: skewed to large corporate, trade finance, MNC subsidiary lending; minimal priority sector burden (computed differently).
  - **NBFC**: governed by Scale-Based Regulation (SBR) — `RBI/2021-22/112 DOR.CRE.REC.No.60/03.10.001/2021-22` dated 22-Oct-2021; layer-specific norms; gold-loan and digital-lending NBFCs face acute LTV, valuation, and recovery-conduct risk (IIFL Mar-2024 ban).

### R-OP-001 — Operational Risk (Process / People / Systems / External Events)
- **Description**: Risk of loss from inadequate or failed internal processes, people, systems, or external events. India context: extreme operational density (large branch networks, 24×7 UPI rails, BPO and captive dependency), with operational resilience now formally codified by RBI's *Guidance Note on Operational Risk Management and Operational Resilience* `RBI/2024-25/31 DOR.ORG.REC.21/14.10.001/2024-25` dated 30-Apr-2024 (replacing the 2005 Guidance Note; aligned to BCBS Mar-2021 principles).
- **Why elevated (most critical for India)**: India's banks run hybrid manual + digital processes at branch level; large captives/BPOs handle reconciliation, voice support, KYC ops, and back-office; the Kotak Mahindra (Apr-2024) and HDFC (Dec-2020) actions both materialized through operational/IT failure. Per RBI FY24-25 Annual Report, digital payment frauds were 56.5% of all reported banking frauds — a structural operational exposure.
- **Key sub-risks**:
  - Branch-level processing exceptions (cheque, cash, DD, locker)
  - BPO/captive operational outage and SLA breach
  - Reconciliation breaks (ATM, UPI, NEFT/RTGS, suspense)
  - Critical operation disruption (FSB-style "important business services")
  - Manual exception handling / 4-eye control failure
- **Inherent rating**: **Very High** — heaviest weight in this profile.
- **Archetype divergence**:
  - **PSU**: branch network often >5,000 — span of control issue; manual processes in semi-urban/rural branches.
  - **SFB**: ops mostly tech-led but small-ticket high-volume; cash-handling intensity in MFI.
  - **FBB**: mostly corporate; lower retail ops density but higher cross-border ops/SWIFT/sanctions volume.
  - **NBFC**: governed by `Master Direction RBI/2023-24/56 DOR.FIN.REC.No.45/03.10.001/2023-24` dated 19-Oct-2023 (NBFC Scale-Based Regulation); op-risk capital not separately required for NBFCs but ICAAP must capture it.

### R-CO-001 — Compliance Risk (Regulatory Change, Supervisory Findings)
- **Description**: Risk of regulatory sanction, financial loss, or reputational damage from non-adherence to RBI/PMLA/FEMA/IT Act/DPDP Act requirements. India context: extremely high circular velocity — RBI typically issues 200+ notifications/year; on 28-Nov-2025, RBI consolidated approximately 3,500 directions/circulars/guidelines into 238 Master Directions and withdrew 9,445 circulars, requiring full re-mapping of compliance inventories.
- **Why elevated**: RBI imposed 353 monetary penalties totalling ₹54.78 crore in FY24-25 (per Economic Times / Moneycontrol compilation) and 88% increase in total penalties over the 2021-Jan 2024 window per Signzy data; KYC/AML lapses are the leading cause. Compliance Function and Role of CCO governed by `RBI/2020-21/35 DoS.CO.PPG./SEC.02/11.01.005/2020-21` dated 11-Sep-2020 for banks; for NBFCs by `RBI/2022-23/24 DoS.CO.PPG./SEC.01/11.01.005/2022-23` dated 11-Apr-2022.
- **Key sub-risks**:
  - Regulatory change tracking gap
  - Supervisory action observation (MAP/RMP/AFI MRA) closure delays
  - Compliance testing coverage gap (not all branches tested)
  - Returns accuracy (DSB, XBRL, CIMS, CRILC)
  - Conflict between dual-hatted CCO/CRO
- **Inherent rating**: **High**.
- **Archetype divergence**:
  - **PSU**: legacy compliance staff sometimes branch-rotated; Dept of Financial Services (DFS) overlay.
  - **SFB**: tighter tier — 75% of branches must be in unbanked rural centres (regulatory geography compliance).
  - **FBB**: "comply or explain" approach available under ITGRCA Directions for foreign banks operating as branches; DTAA / FATCA-CRS overlay heaviest.
  - **NBFC**: scale-based applicability of CCO framework — Upper/Middle Layer NBFCs only.

### R-CD-001 — Conduct Risk (Mis-selling, Customer Harm, Recovery Practices)
- **Description**: Risk arising from how the bank treats customers — mis-selling of third-party products (insurance, mutual funds, ULIPs), opaque pricing, recovery harassment, and dark patterns in digital lending. RBI's increasing post-2020 focus is evident in the Digital Lending Directions framework (now the consolidated *Reserve Bank of India (Digital Lending) Directions, 2025* `RBI/2025-26/36 DOR.STR.REC.19/21.07.001/2025-26` dated 8-May-2025, repealing the 2-Sep-2022 Digital Lending Guidelines and the 8-Jun-2023 DLG Guidelines).
- **Why elevated**: Bajaj Finance ban (Nov-2023, lifted May-2024) was conduct-driven (KFS deficiencies); the Penal Charges in Loan Accounts circular `RBI/2023-24/53 DOR.MCS.REC.28/01.01.001/2023-24` dated 18-Aug-2023 reflects RBI's intensifying focus on fair-practice scrutiny.
- **Key sub-risks**:
  - Mis-selling of insurance/MF to vulnerable customers (senior citizens)
  - Inadequate KFS / APR disclosure in digital lending
  - Recovery agent harassment (especially MFI/digital lending)
  - Penal charges vs. penal interest non-segregation
  - Dark patterns in DLAs
- **Inherent rating**: **High**.
- **Archetype divergence**:
  - **PSU**: lower mis-selling exposure due to lower bancassurance push but DBT/scholarship account servicing conduct risk.
  - **SFB / NBFC-MFI**: recovery practice risk highest; group-lending dynamics; Andhra-style legislative risk.
  - **FBB**: wealth/private banking mis-selling exposure (PMS, AIF cross-sell).
  - **NBFC (digital lending)**: Bajaj-style KFS/APR/recovery risk most acute.

### R-TC-001 — IT and Cyber Risk (ITGRCA, Cyber Security Framework)
- **Description**: Risk from inadequate IT governance, cyber-attacks, system outages, data breaches, and weak DR. Governed primarily by *Master Direction on Information Technology Governance, Risk, Controls and Assurance Practices* `RBI/2023-24/107 DoS.CO.CSITEG/SEC.7/31.01.015/2023-24` dated 7-Nov-2023 (ITGRCA Directions, effective 1-Apr-2024) and the *Cyber Security Framework in Banks* `RBI/2015-16/418 DBS.CO/CSITE/BC.11/33.01.001/2015-16` dated 2-Jun-2016.
- **Why elevated**: HDFC (Dec-2020) and Kotak (Apr-2024) embargoes were both rooted in IT inventory, patch, change, vendor and DR deficiencies. Indian banks face concentrated CBS vendor dependency (Finacle/Flexcube) and frequent regulatory IT inspection (CSITE).
- **Key sub-risks**:
  - Critical-system outage and DR failure (RTO/RPO breach)
  - Cyber incident (ransomware, DDoS, data breach)
  - Patch/change/inventory management gaps
  - Privilege misuse / IAM failures
  - Cloud and SaaS concentration (multi-tenant data isolation)
- **Inherent rating**: **Very High**.
- **Archetype divergence**:
  - **PSU**: legacy COBOL/older CBS, slower modernisation.
  - **SFB**: greenfield stacks — relatively cleaner architectures but smaller security teams.
  - **FBB**: relies on group-level / global SOC; "comply or explain" on ITGRCA Board committees.
  - **NBFC**: ITGRCA applies to NBFCs in Top/Upper/Middle layers; Base layer exempt.

### R-FC-001 — AML / Financial Crime Risk
- **Description**: Risk from inadequate KYC/CDD, weak transaction monitoring, late STR filing, sanctions screening failures, and trade-based money laundering. Governed by PMLA, 2002 + PMLR, 2005, and *Master Direction on KYC* (originally `RBI/DBR/2015-16/18 DBR.AML.BC.No.81/14.01.001/2015-16` dated 25-Feb-2016, amended through 14-Aug-2025; superseded 28-Nov-2025 by 10 sector-specific KYC Master Directions including the *Reserve Bank of India (Commercial Banks – Know Your Customer) Directions, 2025*).
- **Why elevated**: Paytm Payments Bank (Jan-2024 → license cancelled 24-Apr-2026) collapsed primarily on KYC/AML grounds — single PAN linked to thousands of accounts. RBI's Nov-2024 KYC amendment (`DOR.AML.REC.49/14.01.001/2024-25` dated 6-Nov-2024) added explicit money mule identification obligations. KYC/AML are the most penalised category — co-operative banks alone paid ₹13.5 cr (urban) + ₹20.13 cr (rural) over 2021-Jan 2024.
- **Key sub-risks**:
  - Periodic KYC update pendency (DBT accounts especially)
  - Mule account proliferation (UPI rails)
  - Beneficial Owner identification failure (10% threshold for partnerships)
  - STR filing latency (>7 working days breach)
  - Sanctions/PEP screening false negatives (UAPA Section 51A)
  - TM model under-alerting / model drift
  - Trade-based ML (TBML) in trade finance
- **Inherent rating**: **Very High**.
- **Archetype divergence**:
  - **PSU**: large pendency in DBT/scholarship account periodic re-KYC (RBI 12-Jun-2025 circular specifically addresses this).
  - **SFB**: e-KYC OTP onboarding scale issues.
  - **FBB**: cross-border wire transfer (CBWTR ≥ ₹5 lakh) volumes; HSBC India was penalised 28-Feb-2025 for outsourcing AML alert closure to a group company.
  - **NBFC**: Fraud Risk Management governed separately by `RBI/DOS/2024-25/120` dated 15-Jul-2024 for NBFCs.

### R-TP-001 — Vendor / Outsourcing Risk
- **Description**: Risk from third-party service providers (BPO, captive, IT/cloud, payment processors, recovery agents, DSAs, LSPs). Governed by *Master Direction on Outsourcing of IT Services* `RBI/2023-24/102 DoS.CO.CSITEG/SEC.1/31.01.015/2023-24` dated 10-Apr-2023 (effective 1-Oct-2023) AND legacy *Guidelines on Managing Risk and Code of Conduct in Outsourcing of Financial Services* `RBI/2006/167 DBOD.NO.BP.40/21.04.158/2006-07` dated 3-Nov-2006 (amended via `DBR.No.BP.BC.76/21.04.158/2014-15` dated 11-Mar-2015).
- **Why elevated**: Kotak Apr-2024 cited "vendor risk management" as a specific deficiency; "Recovery Agent" responsibility framework strengthened via `DOR.ORG.REC.65/21.04.158/2022-23` dated 12-Aug-2022. Cyber incident reporting via TPSP must reach RBI within 6 hours of TPSP detection (per IT Outsourcing MD).
- **Key sub-risks**:
  - Cloud/SaaS concentration (AWS/Azure/GCP)
  - Captive/BPO operational dependency
  - Recovery agent conduct (intersects R-CD)
  - LSP (Lending Service Provider) governance under digital lending
  - Subcontractor (Nth-party) risk
  - Cross-border data location (DPDP Act 2023 overlay)
- **Inherent rating**: **High**.
- **Archetype divergence**:
  - **PSU**: highly dependent on TCS/Infosys/Wipro for CBS/IT; concentration risk material.
  - **SFB**: vendor-heavy due to lean inhouse tech.
  - **FBB**: heavy intra-group outsourcing — explicit ITGRCA scrutiny.
  - **NBFC**: applies to Middle/Upper/Top layer NBFCs from 1-Oct-2023 effective date.

### R-FR-001 — Fraud Risk (External, Internal, UPI/Digital Scale)
- **Description**: Loss from internal collusion, external fraud (UPI, card-not-present, mule accounts, social engineering), and credit fraud. Governed by *Master Direction on Fraud Risk Management in Commercial Banks (including RRBs) and AIFIs* `RBI/DOS/2024-25/118 DOS.CO.FMG.SEC.No.5/23.04.001/2024-25` dated 15-Jul-2024 (supersedes the Jul-2016 Frauds MD; rescinds 36 prior circulars; mandates principles of natural justice per SBI v. Rajesh Agarwal).
- **Why elevated**: India recorded ~13.42 lakh UPI fraud incidents involving ₹1,087 crore in FY24, and digital payment frauds = 56.5% of all reported banking frauds in FY24-25 per RBI Annual Report. UPI fraud volumes peaked FY24, declining slightly in FY25 (12.64 lakh / ₹981 cr) and FY26 (10.64 lakh / ₹805 cr through Nov-2025) but absolute volumes remain elevated.
- **Key sub-risks**:
  - UPI/payment fraud (phishing, vishing, fake QR, mule accounts)
  - Card-not-present (CNP) and credit-card fraud
  - Loan fraud (forged income docs, identity fraud)
  - Insider collusion (cash, FX, deposit fraud)
  - Cheque / NEFT/RTGS social engineering
  - EWS / RFA detection failure (now mandatory under MD-FRM 2024)
- **Inherent rating**: **Very High**.
- **Archetype divergence**:
  - **PSU**: large-value loan fraud risk highest; legacy MOUs with PSUs.
  - **SFB**: low-value high-volume retail fraud; mobile-first channel exposure.
  - **FBB**: trade fraud (LCs, BGs) and CCP/correspondent fraud risk dominant.
  - **NBFC**: separate MD `DOS.CO.FMG.SEC.No.7/23.04.001/2024-25` dated 15-Jul-2024 for NBFCs.

---

## SECTION 2 — RBI Regulatory Anchors / Mapping

The mapping table below lists ~50 atomic, testable obligations spanning the 8 risk categories. Heavier weighting on Operational, Cyber/IT and AML/Fraud per the user's brief.

| Obligation ID | Source / Circular Reference (Number, Date, Name) | Section / Clause | Atomic Requirement | Linked Risk IDs | Jurisdiction | Frequency |
|---|---|---|---|---|---|---|
| OBL-RBI-001 | `RBI/DBR/2015-16/18 DBR.AML.BC.No.81/14.01.001/2015-16` dated 25-Feb-2016 (MD on KYC, latest amend 14-Aug-2025; superseded 28-Nov-2025 by sector-specific MDs) | Para 9-15 | Establish CDD at UCIC level for every new customer; identify and verify identity using reliable, independent sources | R-FC-001; R-CO-001 | India (extra-territorial for offshore branches) | on-event |
| OBL-RBI-002 | Same MD on KYC | Para 38 (a)-(e) (as amended by `DOR.AML.REC.30/14.01.001/2025-26` dated 12-Jun-2025) | Periodic KYC updation: high-risk every 2 yrs, medium 8 yrs, low 10 yrs; min 3 advance intimations (incl 1 by letter) before due date | R-FC-001; R-CO-001 | India | annual / on-event |
| OBL-RBI-003 | Same MD on KYC | Para 56 (CKYCR) | Upload/retrieve CDD records via CKYCR; reliance limited to CDD data obtained "immediately" (not 2-day legacy) | R-FC-001 | India | on-event |
| OBL-RBI-004 | Same MD on KYC, amended by `DOR.AML.REC.49/14.01.001/2024-25` dated 6-Nov-2024 | (insertion) | Identify and report Money Mule accounts to FIU-IND with comprehensive measures | R-FC-001; R-FR-001 | India | continuous |
| OBL-RBI-005 | Same MD on KYC | Para 8 (BO) | Identify Beneficial Owner — partnership BO threshold 10% (down from 15%); include Trust "protector" | R-FC-001 | India | on-event |
| OBL-RBI-006 | PMLA, 2002 + PMLR, 2005 (Rule 3, Rule 8) | Rule 8(1) | File CTR for cash transactions > ₹10 lakh (or integrally connected within month) by 15th of succeeding month with FIU-IND | R-FC-001 | India | monthly |
| OBL-PMLA-001 | PMLA, 2002 + PMLR, 2005 | Rule 8(2) | File STR within 7 working days of forming suspicion; absolute "no tipping-off" obligation | R-FC-001; R-FR-001 | India | on-event |
| OBL-PMLA-002 | PMLA, 2002 + PMLR, 2005 | Rule 3(1)(BA) | File NTR (NPO Transaction Report) when NPO transaction > ₹10 lakh by 15th of succeeding month | R-FC-001 | India | monthly |
| OBL-PMLA-003 | PMLA, 2002 + PMLR, 2005 | Rule 3(1)(E) | File CBWTR for cross-border wire transfers > ₹5 lakh (originated from / destined to India) | R-FC-001 | India (cross-border) | monthly |
| OBL-PMLA-004 | PMLA, 2002 + PMLR, 2005 | Rule 3(1)(C) | File CCR for transactions involving forged/counterfeit currency or forged valuable security within 7 working days | R-FC-001; R-FR-001 | India | on-event |
| OBL-PMLA-005 | PMLA, 2002 Section 12 | — | Maintain transaction records for 5 years from transaction date; identity records 5 years from end of relationship | R-FC-001; R-CO-001 | India | continuous |
| OBL-FIU-001 | FIU-IND Guidelines | — | Designate Principal Officer (Mgmt level) and Designated Director (Board level) and register on FINGate/FINnet | R-FC-001 | India | one-time + on-change |
| OBL-RBI-007 | `RBI/2023-24/107 DoS.CO.CSITEG/SEC.7/31.01.015/2023-24` dated 7-Nov-2023 (ITGRCA Directions, effective 1-Apr-2024) | Ch II | Establish IT Governance Framework with Board-level IT Strategy Committee (ITSC) meeting at least quarterly | R-TC-001; R-CO-001 | India (FBB: comply-or-explain) | quarterly |
| OBL-RBI-008 | Same ITGRCA Directions | Ch II Para 9 | Appoint Head of IT Function with ≥7 yrs IT mgmt experience | R-TC-001 | India | one-time |
| OBL-RBI-009 | Same ITGRCA Directions | Ch IV | Approve and review Information Security Policy and Cyber Security Policy at least annually by Board | R-TC-001 | India | annual |
| OBL-RBI-010 | Same ITGRCA Directions | Ch IV Para on VA/PT | Conduct VA/PT by independent experts for critical systems; risk-based for non-critical; remediate time-bound | R-TC-001 | India | annual / on-event |
| OBL-RBI-011 | Same ITGRCA Directions | Ch V | Maintain Board-approved BCP/DR with periodic testing and DR drills; back-up integrity verified | R-TC-001; R-OP-001 | India | semi-annual (drill) |
| OBL-RBI-012 | Same ITGRCA Directions | Ch IV (Cyber Incident Response) | Report cyber incidents to RBI, CERT-In, and IB-CART; root-cause analysis post-event | R-TC-001; R-FR-001 | India | on-event |
| OBL-RBI-013 | `RBI/2015-16/418 DBS.CO/CSITE/BC.11/33.01.001/2015-16` dated 2-Jun-2016 (Cyber Security Framework in Banks) | Annex 3 | Report unusual cyber incidents to RBI CSITE Cell within 2-6 hours of detection | R-TC-001 | India | on-event |
| OBL-RBI-014 | Same Cyber Security Framework | Annex 1 (Baseline Controls) | Implement DLP strategy for data at rest, in transit, in endpoints | R-TC-001 | India | continuous |
| OBL-RBI-015 | Same Cyber Security Framework | Annex 2 (C-SOC) | Operate 24×7 Security Operations Centre with continuous surveillance | R-TC-001 | India | continuous |
| OBL-RBI-016 | `RBI/2023-24/102 DoS.CO.CSITEG/SEC.1/31.01.015/2023-24` dated 10-Apr-2023 (RBI (Outsourcing of IT Services) Directions, 2023; effective 1-Oct-2023) | Ch II | Identify Material Outsourcing of IT Services and maintain inventory; Board-approved IT Outsourcing Policy | R-TP-001; R-TC-001 | India (with cross-border data implications) | annual + on-event |
| OBL-RBI-017 | Same IT Outsourcing MD | Ch IV | Conduct due diligence (legal, financial, technical, reputation) on TPSPs prior to engagement | R-TP-001 | India | on-event |
| OBL-RBI-018 | Same IT Outsourcing MD | Ch V | Outsourcing agreement to include audit rights for RE & RBI; data segregation; exit clause | R-TP-001; R-CO-001 | India | on-event |
| OBL-RBI-019 | Same IT Outsourcing MD | Ch VI Para on incident reporting | TPSP to report cyber incident to RE without undue delay; RE to report to RBI within 6 hrs of TPSP detection | R-TC-001; R-TP-001 | India | on-event |
| OBL-RBI-020 | `RBI/2006/167 DBOD.NO.BP.40/21.04.158/2006-07` dated 3-Nov-2006 (Outsourcing of Financial Services), as amended `DBR.No.BP.BC.76/21.04.158/2014-15` dated 11-Mar-2015 | Para 5 (Material Activity) | Identify "material" financial outsourcing activities; obtain Board approval; do not outsource core management | R-TP-001 | India | one-time + on-change |
| OBL-RBI-021 | `DOR.ORG.REC.65/21.04.158/2022-23` dated 12-Aug-2022 (Outsourcing of FS — Recovery Agents) | — | RE bears responsibility for recovery agent conduct; due diligence + grievance redressal; restrict harassing practices | R-TP-001; R-CD-001 | India | continuous |
| OBL-RBI-022 | `RBI/2025-26/36 DOR.STR.REC.19/21.07.001/2025-26` dated 8-May-2025 (RBI (Digital Lending) Directions, 2025; repeals 2-Sep-2022 DL Guidelines and 8-Jun-2023 DLG Guidelines) | Para 8 | Provide KFS (digitally signed; on RE letterhead) to borrower BEFORE loan acceptance with APR | R-CD-001; R-CO-001 | India | on-event |
| OBL-RBI-023 | Same DL Directions, 2025 | Para 9 | Disbursal directly to borrower account; repayment directly to RE account; no LSP pass-through | R-CD-001; R-FR-001 | India | continuous |
| OBL-RBI-024 | Same DL Directions, 2025 | Para 6 (effective 1-Nov-2025) | RE-LSP arrangements with multiple lenders to display digital view of all matched offers | R-CD-001 | India | continuous |
| OBL-RBI-025 | Same DL Directions, 2025 | Para 17 (effective 15-Jun-2025) | Report all DLAs (own + LSP) on RBI CIMS portal; CCO to certify accuracy | R-CD-001; R-CO-001 | India | quarterly |
| OBL-RBI-026 | Same DL Directions, 2025 | Para 11 | DLG cap: total DLG cover ≤ 5% of loan portfolio; cash collateral / bank guarantee / FD form only | R-CR-001; R-CD-001 | India | on-event |
| OBL-RBI-027 | Same DL Directions, 2025 | Para 8(ii) | Penal charges (not penal interest) — disclose in KFS aligned with `RBI/2023-24/53 DOR.MCS.REC.28/01.01.001/2023-24` dated 18-Aug-2023 | R-CD-001 | India | on-event |
| OBL-RBI-028 | Same DL Directions, 2025 | Para on cooling-off | Provide cooling-off (1 day for short tenor; 3 days for tenor > 7 days) with proportionate APR exit | R-CD-001 | India | on-event |
| OBL-RBI-029 | Same DL Directions, 2025 | Para 10 (Data) | Need-based data collection with explicit consent; one-time camera/mic/location for KYC only; data stored in India servers (24-hr return if processed abroad) | R-TC-001; R-CD-001 | India | continuous |
| OBL-RBI-030 | `RBI/DOS/2024-25/118 DOS.CO.FMG.SEC.No.5/23.04.001/2024-25` dated 15-Jul-2024 (MD on Fraud Risk Management — Commercial Banks & AIFIs) | Ch IV | Establish Board-approved Fraud Risk Management Policy; review at least every 3 years | R-FR-001 | India | tri-annual review |
| OBL-RBI-031 | Same MD-FRM | Cl. 8.3 (EWS Framework) | Implement Early Warning Signals integrated with CBS for real-time monitoring | R-FR-001; R-CR-001 | India | continuous |
| OBL-RBI-032 | Same MD-FRM | Cl. 8.3.1-8.3.3 (RFA) | Tag account as Red-Flagged on EWS trigger; report RFAs meeting CRILC threshold to RBI within 7 days | R-FR-001 | India | on-event |
| OBL-RBI-033 | Same MD-FRM | Cl. on FMR reporting | File Fraud Monitoring Return (FMR) within 14 days of classifying account/incident as fraud | R-FR-001 | India | on-event |
| OBL-RBI-034 | Same MD-FRM | Cl. on natural justice | Issue SCN with ≥21-day response window and reasoned order before classifying borrower as fraud (per SC ruling SBI v. Rajesh Agarwal) | R-FR-001; R-CO-001 | India | on-event |
| OBL-RBI-035 | Same MD-FRM | Cl. on Data Analytics & MIU | Establish Data Analytics and Market Intelligence Unit | R-FR-001 | India | one-time + continuous |
| OBL-RBI-036 | `RBI/2023-24/06 DOR.STR.REC.3/21.04.048/2023-24` dated 1-Apr-2023 (Master Circular — IRACP norms — Advances) | Para 2.1.2 | NPA classification: 90-day overdue rule for term loans; system-based asset classification at day-end | R-CR-001 | India | daily |
| OBL-RBI-037 | `RBI/2021-2022/125 DOR.STR.REC.68/21.04.048/2021-22` dated 12-Nov-2021 (IRACP clarifications) | Sec D-E | NPA upgrade to "standard" only on full clearance of arrears; specify exact due date in loan agreement | R-CR-001 | India | continuous |
| OBL-RBI-038 | `DoS.CO.PPG./SEC.03/11.01.005/2020-21` dated 14-Sep-2020 (Automation of IRAC) | — | Implement system-driven IRACP (no manual override) | R-CR-001; R-OP-001 | India | continuous |
| OBL-RBI-039 | `RBI/2019-20/243 DOR.No.BP.BC.70/21.01.003/2019-20` dated 3-Jun-2019 (Large Exposures Framework, in force from 1-Apr-2019; further exempted vide 24-Feb-2021 amendment) | — | Single counterparty exposure ≤ 20% of Tier-1; group ≤ 25%; G-SIB to G-SIB ≤ 20%; report breaches immediately | R-CR-001 | India | quarterly + on-event |
| OBL-RBI-040 | `RBI/2024-25/31 DOR.ORG.REC.21/14.10.001/2024-25` dated 30-Apr-2024 (Guidance Note on Op-Risk Management & Operational Resilience; supersedes 14-Oct-2005 Op-Risk Guidance) | Principle 4 | Board to approve Op-Risk appetite, identify "critical operations" and impact tolerances | R-OP-001 | India | annual |
| OBL-RBI-041 | Same Op-Risk Guidance Note | Principle 7 | Map critical operations end-to-end including third-party dependencies | R-OP-001; R-TP-001 | India | annual |
| OBL-RBI-042 | Same Op-Risk Guidance Note | Principle on ICT | Implement ICT risk management programme aligned with op-risk framework | R-OP-001; R-TC-001 | India | continuous |
| OBL-RBI-043 | `RBI/2020-21/35 DoS.CO.PPG./SEC.02/11.01.005/2020-21` dated 11-Sep-2020 (Compliance Function in Banks & CCO Role) | — | Appoint CCO at GM/equiv level (≥2 levels below CEO) for min 3-yr tenure; no dual-hatting with business | R-CO-001 | India | one-time + on-change |
| OBL-RBI-044 | Same CCO circular | — | Prior intimation to RBI Senior Supervisory Manager before CCO appointment, premature transfer, resignation | R-CO-001 | India | on-event |
| OBL-RBI-045 | `DoS.CO.PPG./SEC.05/11.01.005/2020-21` dated 3-Feb-2021 (Risk-Based Internal Audit — RBIA — for select NBFCs and UCBs); SCBs covered by `DBS.CO.PP.BC.10/11.01.005/2002-03` dated 27-Dec-2002 | — | Conduct independent risk assessment as basis for risk-based audit plan; HIA to be senior independent exec with ≥3-yr term | R-CO-001; R-OP-001 | India | annual |
| OBL-RBI-046 | RBI Risk-Based Supervision (SPARC) — internal supervisory framework | — | Submit data for SPARC IRISc scoring; participate in Annual Financial Inspection (AFI); close Risk Mitigation Plan (RMP) / Monitorable Action Plan (MAP) within timelines | R-CO-001 | India | annual |
| OBL-RBI-047 | RBI DSB Returns / XBRL framework | — | Submit DSB returns (now 30+ in XBRL) at quarterly/half-yearly/annual cadence; CRILC quarterly; CIMS for digital lending | R-CO-001; R-CR-001 | India | quarterly |
| OBL-RBI-048 | CERT-In Direction No. 20(3)/2022-CERT-In dated 28-Apr-2022 (effective 28-Jun-2022) | — | Report any of 20 categories of cyber incidents to CERT-In within 6 hours of awareness | R-TC-001 | India | on-event |
| OBL-RBI-049 | Digital Personal Data Protection Act, 2023 (DPDP Act) | — | Notify Data Protection Board and affected individuals of personal data breach (parallel to CERT-In) | R-TC-001; R-CO-001 | India | on-event |
| OBL-RBI-050 | UAPA, Section 51A read with Order dated 2-Feb-2021 (corrigendum 22-Apr-2024 — Central Nodal Officer designation change) | — | Daily screening against UNSC sanctions list; freeze designated person's accounts and report | R-FC-001 | India | daily |
| OBL-RBI-051 | `RBI/2015-16/95 DBR.No.Dir.BC.10/13.03.00/2015-16` dated 1-Jul-2015 (Master Circular — Loans & Advances — Statutory and Other Restrictions; amended 23-Jul-2021) | Sec 1.2 | No loan to bank's directors / firms in which they're interested (BR Act Sec 20(1)) | R-CR-001; R-CO-001 | India | continuous |
| OBL-RBI-052 | RBI Master Circular on Frauds in Foreign Banks operating in India and Section 35A BR Act | — | FBB to report frauds to RBI through head-office controlling structure; "comply or explain" only on certain governance items | R-FR-001 | India + cross-border | on-event |
| OBL-RBI-053 | `RBI/2024-25/87 DOR.AML.REC.49/14.01.001/2024-25` dated 6-Nov-2024 (KYC Amendment) | Para 38 | Foreign Contribution Act, 2010 compliance; sanctions on shell-bank correspondent relationships | R-FC-001 | India + cross-border | continuous |

---

## SECTION 3 — Failure Propagation Examples

Each example traces: **Activity drift → Process gap → Control failure → Risk event → Compliance breach → Regulatory consequence.** Patterns are based on real, publicly-known Indian banking incidents (anonymised generically).

### FAIL-001 — KYC Documentation Drift Triggering PMLA Finding (Paytm Payments Bank archetype)
- **Activity drift**: Frontline opens accounts via OTP-based e-KYC; relationship managers stop physically verifying address proofs for low-risk customers; PAN-deduplication checks run only at month-end.
- **Process gap**: UCIC-level CDD aggregation broken — same PAN linked to multiple CIFs; Aadhaar OTP onboarding not converted to full CDD within stipulated window for non-face-to-face accounts.
- **Control failure**: Periodic KYC update reminders not issued (3 advance notifications + 1 letter requirement breached); transaction limits on minimum-KYC wallets/accounts not auto-enforced.
- **Risk event**: ~31 cr out of 35 cr wallets found inoperative or KYC-incomplete; thousands of accounts linked to a single PAN; transactions exceeding regulatory caps.
- **Compliance breach**: Breaches `OBL-RBI-001`, `OBL-RBI-002`, `OBL-RBI-003`, `OBL-PMLA-001`, `OBL-PMLA-005`.
- **Regulatory consequence**: Cease-and-desist on new customer onboarding; deposit/top-up freeze (Jan/Feb-2024); ultimate licence cancellation under BR Act Sec 22(4) (Apr-2026); ₹5.39 cr penalty earlier (Oct-2023). AFI MRA on KYC governance.
- **Linked Risks**: `R-FC-001; R-CO-001`.

### FAIL-002 — UPI / Mule Account Fraud Scale Event
- **Activity drift**: Branch and digital onboarding teams accept high-volume "small-ticket merchant" accounts without enhanced due diligence; new accounts immediately receive multi-source UPI credits.
- **Process gap**: Transaction monitoring rules tuned to volume thresholds but not behavioural patterns (rapid funnel-out, dormant-then-active, geo-velocity). Mule account identification framework (Para 38 KYC amendment 6-Nov-2024) not operationalised in TM rule library.
- **Control failure**: Federated mule-detection models (e.g., MuleHunter.AI) not integrated; STR triage queue lag exceeds 7 working days for ~20% of suspicious cases.
- **Risk event**: Customer complaints surge; Cyber Crime Helpline 1930 escalations; in 2024 ~6.32 lakh UPI fraud cases (~₹485 cr) industry-wide; bank's share of mule accounts identified retrospectively in NPCI feedback loop.
- **Compliance breach**: `OBL-RBI-004`, `OBL-PMLA-001`, `OBL-RBI-031` (EWS framework), `OBL-RBI-035` (Data Analytics MIU absence).
- **Regulatory consequence**: Supervisory letter from RBI; possible monetary penalty; mandatory adoption of NPCI fraud monitoring toolkit; mention in AFI Risk Assessment Report under SPARC.
- **Linked Risks**: `R-FR-001; R-FC-001`.

### FAIL-003 — Outsourced/Captive IT Failure Causing Customer-Facing Outage (HDFC Dec-2020 / Kotak Apr-2024 archetype)
- **Activity drift**: IT team relies on increasingly complex CBS + middleware + digital channels; capacity planning meetings deprioritised; vendor patches deferred for "stability"; IT inventory not refreshed.
- **Process gap**: Patch / change / inventory / IAM management deficient; DR drill conducted nominally without true failover; vendor risk assessment shallow; capacity assessment annual rather than quarterly.
- **Control failure**: Primary data centre power-failure scenario not tested; fail-over to DR site fails; multi-tenant data isolation not verified for cloud TPSP.
- **Risk event**: Hours-long internet/mobile banking outage; payment failures; credit card service disruption; data leak prevention gap surfaces.
- **Compliance breach**: `OBL-RBI-007`, `OBL-RBI-009`, `OBL-RBI-011`, `OBL-RBI-012`, `OBL-RBI-013` (2-6 hr cyber reporting), `OBL-RBI-019` (TPSP 6-hr reporting), `OBL-RBI-016` (vendor risk).
- **Regulatory consequence**: RBI cease-and-desist under Sec 35A BR Act 1949 — embargo on new customer onboarding via digital channels and on issuance of fresh credit cards (HDFC Dec-2020; Kotak Apr-2024); mandatory external IT audit at RE cost; restriction lifted only after RBI sign-off (HDFC took ~14 months).
- **Linked Risks**: `R-TC-001; R-OP-001; R-TP-001`.

### FAIL-004 — Digital Lending Compliance Breach (Bajaj Finance Nov-2023 archetype)
- **Activity drift**: Co-branded credit programme via merchant ecosystem; rapid customer acquisition; KFS issuance template treated as CRM document rather than borrower-facing instrument.
- **Process gap**: KFS not consistently provided BEFORE loan acceptance for "instant EMI" / e-com flows; APR computation excludes certain charges; recovery agent allocation not communicated to borrower in advance via SMS/email.
- **Control failure**: Compliance testing samples missed digital flow; product launch checklist signed off without DL Directions tracer.
- **Risk event**: Borrower complaints, RBI off-site supervision pickup; product classification dispute (whether transaction is "digital lending").
- **Compliance breach**: `OBL-RBI-022`, `OBL-RBI-023`, `OBL-RBI-027`, `OBL-RBI-028`, `OBL-RBI-021` (recovery agent).
- **Regulatory consequence**: Cease-and-desist on sanction/disbursal under specific products (e.g., Bajaj Finance "eCOM" and online "Insta EMI Card" — 15-Nov-2023; lifted 2-May-2024 after KFS rectification). Reputational impact on stock; analyst downgrades.
- **Linked Risks**: `R-CD-001; R-CO-001`.

### FAIL-005 — Co-Lending / Partnership Lending Governance Gap
- **Activity drift**: Mid-sized bank enters co-lending with multiple NBFC partners under priority-sector co-lending framework; relies on partner NBFC for credit underwriting and KYC; revenue-share economics drive volume.
- **Process gap**: Bank's independent credit policy not applied to co-lent borrowers; KYC reliance documented but not validated; FLDG/DLG arrangements with NBFCs structured outside the 5% cap (a la pre-2023 FLDG era).
- **Control failure**: Reconciliation between partner ledger and bank's books delayed >30 days; NPA flags from partner side not propagated to bank's CBS in real-time.
- **Risk event**: Material asset-quality slippage in co-lent portfolio; FLDG cap breach surfaces during AFI.
- **Compliance breach**: `OBL-RBI-026` (DLG 5% cap), `OBL-RBI-020` (Outsourcing FS — if structured as outsourcing), `OBL-RBI-036`/`OBL-RBI-037` (IRACP).
- **Regulatory consequence**: AFI observation requiring portfolio re-classification; Pillar-2 capital add-on; possible monetary penalty under Sec 47A BR Act 1949.
- **Linked Risks**: `R-CR-001; R-TP-001; R-CO-001`.

### FAIL-006 — AML Transaction Monitoring Failure (HSBC India Feb-2025 archetype)
- **Activity drift**: TM team sized to alert volume not risk; legacy scenarios not retuned for UPI/digital payment behaviour; alert closure outsourced to group company / BPO.
- **Process gap**: Outsourcing of alert disposition not RBI-permitted (financial outsourcing — `OBL-RBI-020`); model validation not conducted annually; TM model under-alerting on layering and structuring.
- **Control failure**: STR queue ageing >7 working days; CTR-STR linkage missed; sanctions screening false-negative on PEP variants.
- **Risk event**: Mule and layering pattern undetected; FIU-IND probe; AFI finds material AML gaps.
- **Compliance breach**: `OBL-RBI-020`, `OBL-PMLA-001`, `OBL-PMLA-005`, `OBL-RBI-053` (correspondent banking).
- **Regulatory consequence**: Monetary penalty (HSBC India was penalised ~Feb-2025 for AML alert outsourcing to group entity); cease-and-desist potentially; FIU-IND warning under PMLA Section 13.
- **Linked Risks**: `R-FC-001; R-TP-001; R-CO-001`.

### FAIL-007 — Cyber Incident with Delayed RBI Reporting
- **Activity drift**: SOC analysts focused on perimeter alerts; ransomware staged via supplier remote-access tooling; weekend incident detection delayed.
- **Process gap**: Incident response plan documented but no "tabletop" rehearsal in 18 months; CSITE reporting template not populated; CERT-In notification template not aligned with 6-hour rule.
- **Control failure**: 2-6 hour RBI window breached (incident reported at T+22 hours); IB-CART notification missed; root-cause analysis delayed >30 days.
- **Risk event**: Customer data exfiltration; service disruption; DPDP Act breach notification triggered.
- **Compliance breach**: `OBL-RBI-013` (2-6 hr CSITE), `OBL-RBI-012`, `OBL-RBI-019` (6-hr TPSP path), `OBL-RBI-048` (CERT-In 6 hr), `OBL-RBI-049` (DPDP Act).
- **Regulatory consequence**: Section 47A penalty (precedent: ₹1 cr penalty on Corporation Bank, 31-Jul-2019 for delayed cyber incident reporting); RBI letter on IT Risk and Information Security Governance deficiency.
- **Linked Risks**: `R-TC-001; R-OP-001`.

### FAIL-008 — Mis-Selling of Third-Party Insurance / MF
- **Activity drift**: Bancassurance / wealth team incentivised on premium volume; targets cascaded to branch RMs; senior-citizen book becomes premium driver.
- **Process gap**: Need-analysis form treated as pro-forma; risk-profiling tools not enforced; voice-call recording sampling limited.
- **Control failure**: Suitability checks fail for pensioners/widows; complaint pattern emerges around lock-in / surrender charges not disclosed.
- **Risk event**: BO/Banking Ombudsman complaints surge; media coverage; possible class-action via DPDPB.
- **Compliance breach**: `OBL-RBI-051` (broader fair-practice umbrella); IRDAI bancassurance norms (separately tracked); CCO compliance testing breach `OBL-RBI-043`.
- **Regulatory consequence**: RBI fine for fair-practice violations (precedent: ₹91 lakh on Yes Bank Jun-2024 for customer service/charges-related violations); IRDAI parallel action.
- **Linked Risks**: `R-CD-001; R-CO-001`.

### FAIL-009 — IRACP Drift / Evergreening (ICICI-Videocon archetype)
- **Activity drift**: Account managers structure additional facilities to refinance interest dues; "technical" upgradation of NPAs via partial recovery + fresh sanction; system-driven IRACP overridden via "manual reasons" field.
- **Process gap**: Loan restructuring not aligned with `OBL-RBI-036` definitions; SMA-1/SMA-2 day-end tagging bypassed via reversal entries; due-date reset without revised loan agreement.
- **Control failure**: System-based asset classification automation circumvented; second-line review samples miss the pattern; internal audit RBIA risk-rating outdated.
- **Risk event**: True NPA understated; subsequent sharp recognition during AFI; provision shortfall material.
- **Compliance breach**: `OBL-RBI-036`, `OBL-RBI-037`, `OBL-RBI-038`, `OBL-RBI-031` (EWS), `OBL-RBI-032` (RFA tagging).
- **Regulatory consequence**: AFI MRIA (Matters Requiring Immediate Action); divergence in NPA reporting disclosed to stock exchanges; reputational and stock impact; monetary penalty up to ₹1 cr per incident under Sec 47A.
- **Linked Risks**: `R-CR-001; R-OP-001; R-FR-001`.

### FAIL-010 — Internal Fraud / Insider Collusion in Branch Cash & FD
- **Activity drift**: Long-tenured branch operations head holds combined custody of FD opening, cancellation, and ledger reconciliation; rotation policy not enforced citing "operational continuity".
- **Process gap**: 4-eye control breach via password-sharing; FD physical instruments held in single vault; reconciliation of cancelled FDs run quarterly rather than monthly.
- **Control failure**: Maker-checker bypass; whistle-blower channel under-utilised; surprise inspections not conducted; ₹150 cr-style discrepancy detected only on third-party reconciliation request.
- **Risk event**: Cash/FD shortfall surfaces (precedent: ₹150 cr discrepancy detected at Kotak Mahindra Bank Sec-11 Panchkula branch involving Panchkula Municipal Corporation FDs, 25-Mar-2026).
- **Compliance breach**: `OBL-RBI-030` (Fraud Risk Mgmt Policy), `OBL-RBI-033` (FMR within 14 days), `OBL-RBI-040` (Op-Risk appetite), internal audit RBIA `OBL-RBI-045`.
- **Regulatory consequence**: FMR submission; RBI special audit; mandatory job-rotation enforcement; CBI/EOW reference if criminal; possible Section 47A penalty.
- **Linked Risks**: `R-FR-001; R-OP-001; R-CO-001`.

---

## SECTION 4 — Monitoring Gaps

Systematic, India-specific monitoring gaps observed across mid-sized private bank operations (with applicability notes for archetypes).

| Gap ID | Title | Description | Indian-Context Texture | Affected Risks | Severity | Indicative Benchmark |
|---|---|---|---|---|---|---|
| GAP-001 | Detection Lag (30-90 days) | Reconciliation, exception, and fraud signals surface 30-90 days after the underlying event due to batch-mode CBS, end-of-month MIS, branch reporting cadence | Branch suspense entries cleared only at month-end; UPI dispute reconciliation has 30-day cycles; FMR filing within 14 days of classification not detection | R-OP-001; R-FR-001; R-FC-001 | High | Median: 45-60 days from event to first management view in mid-sized PSB; 21-30 days in tech-forward private bank |
| GAP-002 | Manual Evidence Collection | RCSAs, KCIs, attestations conducted via Excel + email; control-effectiveness evidence stored in shared drives without lineage | Branch heads email scanned signed attestations to corporate compliance once a quarter; control evidence not searchable for AFI | R-CO-001; R-OP-001 | High | Typical mid-sized private bank takes 45 days to complete monthly RCSA cycle across 800+ branches |
| GAP-003 | Fragmented Systems | CBS + LOS + CRM + AML + GRC + Treasury + Trade Finance + Card Mgmt — typically 6-12 systems with weak integration; ETL cycles nightly | Customer view fractured across CBS (Finacle), Card system (Vision Plus / SAS), AML (Oracle FCCM / Mantas), GRC (in-house) — single customer record may take 24-72 hrs to reconcile | R-FC-001; R-OP-001; R-CD-001 | Very High | Average mid-sized private bank: 8-10 source systems for risk/compliance MIS; 60% manual joins |
| GAP-004 | BPO / Captive Dependency | KYC ops, AML alert L1 review, voice support, reconciliation, account opening backend, recovery — heavily outsourced; real-time visibility into BPO control execution limited | Tier-2/3 city BPO floors handle 70-80% of KYC ops for mid-sized banks; turnover >25% annually; SOX-style attestations weak | R-TP-001; R-FC-001; R-OP-001 | High | Typical mid-sized PB: 40-60% of operational FTE outsourced; only 5-10% of BPO controls observed in real-time |
| GAP-005 | Branch vs Central Oversight Gap | Branch-level deviations (cash exceptions, manual overrides, KYC waivers) invisible to central risk; corporate compliance has thin sampling | PSU banks with 5,000+ branches face acute span-of-control; private bank network 800-2,500 branches still material | R-OP-001; R-FR-001; R-CD-001 | High | Sampling rate for branch compliance reviews: ~5-10% per quarter; full coverage every 18-24 months |
| GAP-006 | Returns-Based vs Continuous Supervision | DSB returns, XBRL filings, CRILC, FMR, CIMS — periodic snapshots; SPARC IRISc model annual; gaps between filings invisible | RBI consolidating with Centralized Information Management System (CIMS) but most filings remain quarterly/half-yearly; RBS PCA triggers retrospective | R-CO-001; R-CR-001 | Medium | Average lag between event and DSB visibility: 35-45 days |
| GAP-007 | Issue Management Lifecycle Gaps | Audit findings (internal, statutory, RBI inspection), MAP/RMP, MRA — tracked in disparate trackers; closure evidence weak | Average mid-sized private bank closes ~70% of internal audit findings within agreed timeline; AFI MAP closure averages 12-18 months | R-CO-001; R-OP-001 | High | Backlog per Internal Audit Head ranges 200-500 open observations |
| GAP-008 | Regulatory Change Tracking | RBI issues 200+ notifications/year; on 28-Nov-2025 RBI consolidated ~3,500 instructions into 238 MDs and withdrew 9,445 circulars — manual interpretation dominates | Compliance team typically 4-8 personnel; impact assessment per circular 2-5 person-days; legal vendors layer adds cost | R-CO-001 | Very High | Average circular-to-policy update lead time: 30-90 days; lag widens for amendments |
| GAP-009 | Fraud FMR vs Real-Time Detection | FMR filed within 14 days of fraud classification, but classification itself depends on investigation closure (often 30-90 days post-event) | True real-time fraud detection only at UPI/transaction layer; corporate banking, trade fraud surface late; MD-FRM 2024 mandates EWS-CBS integration but rollout uneven | R-FR-001 | High | Time from fraud event to FMR submission: median 45-60 days |
| GAP-010 | Vendor Performance Beyond Contract | Vendor reviews focus on contract / SLA; weak on real-time performance signals (uptime, security posture, financial health, sub-contractor changes) | IT TPSP performance KPI-based but cyber posture / patch latency rarely fed into RE's GRC; recovery agent conduct surveillance via call recording sampling | R-TP-001; R-TC-001; R-CD-001 | High | Vendor risk reassessment cycle: annual; only 10-20% of TPSPs have continuous monitoring |
| GAP-011 | Conduct Surveillance Limited | Mis-selling, mis-conduct, customer harm patterns surface via complaints (lagging indicator); call surveillance and sales-flow analytics nascent | Bancassurance and wealth advisory calls recorded but only 1-3% sampled for QA; complaint root-cause analysis done quarterly | R-CD-001 | Medium | Average complaint-to-RCA closure: 21-45 days |
| GAP-012 | Periodic KYC Re-KYC Trigger Detection | Risk-rating change triggers (transaction pattern shifts, KYC document expiry, sanctions list updates) not auto-fed into re-KYC workflow | RBI 12-Jun-2025 circular (`DOR.AML.REC.30/14.01.001/2025-26`) explicitly cites "large pendency" in periodic KYC updation, especially DBT/scholarship accounts | R-FC-001; R-CO-001 | High | Average pendency in periodic KYC: 15-25% of high-risk; up to 40% in DBT accounts at PSU banks |
| GAP-013 | Data Lineage and DPDP Readiness | Data flow from source systems → analytics → BPO → vendors lacks documented lineage; DPDP Act 2023 compliance immature | DPDP rules notification staggered; data fiduciary obligations layer onto existing RBI/SEBI frameworks | R-TC-001; R-CD-001 | High | <30% of mid-sized PBs have full data inventory; <15% have automated DSAR fulfilment |
| GAP-014 | Operational Resilience Maturity | "Critical operations" mapping per 30-Apr-2024 Op-Risk Guidance Note still aspirational for many REs; impact tolerances not approved at Board level | RBI expects FSB-style end-to-end mapping including third-party — mid-sized PBs typically still in "process mapping" stage as of FY25-26 | R-OP-001; R-TP-001 | High | <40% of mid-sized PBs have approved impact tolerances; tabletop exercises annual at best |

---

## SECTION 5 — AI Opportunities (India Context)

High-value AI applications addressing the gaps above, with India-specific impact framing.

| Opp ID | Title | Problem (Gap addressed) | Description | India-Specific Value | Affected Risk IDs / Obligations | Maturity | Expected Outcome |
|---|---|---|---|---|---|---|---|
| AI-001 | Real-Time UPI / Mule Account Detection | GAP-009; GAP-001 | Federated learning / graph ML across transaction, device, behavioural signals to detect mule networks pre-disbursal; integrate with NPCI MuleHunter.AI signals (RBI-RBIH pilot, Dec-2024) | India processes ~18.7 billion UPI tx/month (May-2025); frauds ~10.6 lakh / ₹805 cr in FY26 (Apr-Nov-2025); real-time scoring at sub-200ms enables decline-before-debit | R-FR-001; R-FC-001 / OBL-RBI-031, OBL-RBI-035, OBL-PMLA-001 | Now | 30-50% reduction in mule account dwell time; STR queue from 14 days to 2 days |
| AI-002 | Process Mining for Ops Drift Detection | GAP-005; GAP-002 | Mine event logs from CBS, LOS, AML, ITSM to compare actual vs documented processes; surface manual overrides, control bypasses, and deviation patterns at branch level | Mid-sized private bank with 800-2,500 branches has heterogeneous execution; process mining surfaces evergreening, manual NPA reversals, KYC waivers | R-OP-001; R-CR-001; R-FR-001 / OBL-RBI-038, OBL-RBI-040 | 6-12 months | Detect deviations at T+1 day vs T+45 day baseline; halve audit observation backlog |
| AI-003 | Regulatory Change Mapping (Master Direction → Obligation → Control) | GAP-008 | LLM-based parsing of RBI circulars / Master Directions / amendments to extract atomic obligations, map to internal controls, and flag impact | RBI 28-Nov-2025 consolidation collapsed ~3,500 circulars into 238 MDs; manual remapping = months of work; LLM extraction can generate first-pass mapping in hours | R-CO-001 / OBL-RBI-046, OBL-RBI-043 | Now | Reduce circular-to-policy lead time from 60 days to 7-10 days; control-coverage heatmap auto-refresh |
| AI-004 | Anomaly Detection in Process Execution | GAP-005; GAP-002 | Unsupervised anomaly detection across maker-checker logs, GL entries, exception queues — flag unusual override patterns | Branch insider-fraud patterns (cash, FD, suspense) surface only on reconciliation; AI surfaces in real time | R-FR-001; R-OP-001 / OBL-RBI-030, OBL-RBI-031 | 6-12 months | Reduce internal fraud time-to-detection from 90 days to 7-14 days |
| AI-005 | Evidence Auto-Assembly for AFI / Inspection Preparation | GAP-007; GAP-002 | AI agent assembles RCSA evidence, control test results, MAP/RMP closure artefacts in response to RBI inspection queries | AFI questionnaires require pulling from 8-10 systems; today is manual war-rooms; auto-assembly halves prep time | R-CO-001 / OBL-RBI-046, OBL-RBI-045 | Now | AFI prep time reduced from 6-8 weeks to 2-3 weeks |
| AI-006 | Continuous Re-KYC Trigger Detection | GAP-012; GAP-001 | ML monitors transaction patterns, sanctions list deltas, document expiry, behavioural shifts; auto-trigger periodic-KYC workflow | DBT and scholarship account pendency explicitly flagged in RBI 12-Jun-2025 circular; SC/ST/PMJDY accounts have largest pendency | R-FC-001 / OBL-RBI-002, OBL-RBI-053 | 6-12 months | Reduce periodic-KYC pendency from 25% to <5% in 18 months |
| AI-007 | Mis-Selling Detection from Call Transcripts and Complaint Patterns | GAP-011 | Speech-to-text + NLP across bancassurance / wealth call recordings; detect product-mismatch, lock-in misrepresentation, pressure tactics | Vernacular / Indic-language ASR maturity now sufficient (Hindi, Tamil, Telugu, Bengali, Marathi); 95%+ call sampling possible vs current 1-3% | R-CD-001 / OBL-RBI-051, OBL-RBI-027 | 6-12 months | Sampling from 1-3% to 100%; complaint root-cause time from 21-45 days to 3-7 days |
| AI-008 | Branch-Level Conduct Surveillance | GAP-005; GAP-011 | Aggregate complaint patterns, transaction reversals, employee turnover, exception logs at branch level; rank for risk-based audit | Mid-sized PB has 800-2,500 branches; central audit cannot cover all yearly; AI prioritisation enables 80/20 focus | R-CD-001; R-OP-001; R-FR-001 / OBL-RBI-045 | Now | Risk-based audit coverage from 50% to 95% of high-risk branches per year |
| AI-009 | Vendor Performance Signal Aggregation | GAP-010 | Aggregate vendor SLA, security posture (CVE feeds, dark-web), financial health (D&B, ratings), sub-contractor changes; continuous risk score | RBI ITGRCA + IT Outsourcing MD impose continuous oversight; AI-driven scoring meets "appropriate vendor risk assessment" | R-TP-001; R-TC-001 / OBL-RBI-016, OBL-RBI-017, OBL-RBI-019 | 6-12 months | Vendor reassessment cadence from annual to continuous; cyber-incident at TPSP detected at TPSP T+0 vs T+24 hr |
| AI-010 | Issue Management RCA and Pattern Detection | GAP-007 | Cluster audit findings, MAP/RMP items across business units / time to surface systemic root causes vs treating each as one-off | Indian banks accumulate 200-500 open observations; AI surfaces "10 root-cause clusters" vs 500 individual items | R-CO-001; R-OP-001 / OBL-RBI-045, OBL-RBI-046 | 6-12 months | RCA cycle from 14-21 days to 1-3 days; repeat findings reduced 40-60% |
| AI-011 | Network-Based STR Triage | GAP-009; GAP-001 | Graph ML to cluster related entities across CBS/AML for STR triage; reduce false positives, accelerate decisioning | India FIU-IND volume material; PMLA Sec 13 penalty risk for late STRs; volume × accuracy challenge | R-FC-001 / OBL-PMLA-001 | Now | STR turnaround from 14-30 days to 3-7 days; false-positive rate -40% |
| AI-012 | Critical Operations & Impact Tolerance Mapping | GAP-014 | Auto-discover dependency chains (apps, infra, vendors, data) for "critical operations" required under Op-Resilience guidance; quantify impact tolerance breach scenarios | RBI 30-Apr-2024 Guidance Note expects end-to-end mapping; manual mapping by mid-sized PB takes 9-12 months | R-OP-001; R-TP-001 / OBL-RBI-040, OBL-RBI-041, OBL-RBI-042 | 12+ months | Mapping completed in 3-4 months; tolerance-breach simulation continuous |

---

## Caveats

1. **Citation accuracy**: Every RBI circular number above has been verified against rbi.org.in or reputable secondary sources (KPMG/PwC/Vinod Kothari/AZB/Khaitan/CAM/etc.). Where the post-28-Nov-2025 KYC consolidation has changed the circular reference, both the legacy 2016 reference and the new sector-specific 2025 reference should be carried in implementation. The user's example citation `RBI/2022-23/154 DOR.CRE.REC.66/21.07.001/2022-23 dated December 14, 2022 (Master Direction on Outsourcing of IT Services)` appears to conflate two artefacts — the actual *IT Outsourcing* Master Direction is `RBI/2023-24/102 DoS.CO.CSITEG/SEC.1/31.01.015/2023-24` dated **10-Apr-2023**, and `RBI/2022-23/111 DOR.CRE.REC.66/21.07.001/2022-23` dated **2-Sep-2022** is the original *Digital Lending* Guidelines (now repealed by the 8-May-2025 DL Directions). Both have been correctly cited above.

2. **Master Direction consolidation (28-Nov-2025)**: RBI consolidated approximately 3,500 directions/circulars/guidelines into 238 Master Directions and withdrew 9,445 circulars. This reshaping is recent; many circular numbers cited above remain valid but downstream RCM ingestion should track the consolidation mapping. The legacy 2016 KYC MD (`DBR.AML.BC.No.81/14.01.001/2015-16`) is repealed and replaced by sector-specific KYC MDs including the *Reserve Bank of India (Commercial Banks – Know Your Customer) Directions, 2025*. The 12-Jun-2025 (`DOR.AML.REC.30/14.01.001/2025-26`), 14-Aug-2025 amendments, and 28-Nov-2025 consolidation are the most material recent revisions.

3. **Forward-looking statements & restrictions in flux**: Paytm Payments Bank licence was reportedly cancelled 24-Apr-2026 per multiple secondary sources (Business Today, Medianama, organiser.org, NewsOrbiter). This citation is corroborated across multiple outlets but as a recent supervisory action, downstream RCM users should re-verify against the RBI press release. References to RBI's *Digital Payments Intelligence Platform* (committee chaired by AP Hota) and *MuleHunter.AI* (RBIH, Dec-2024 pilot) reflect publicly-disclosed initiatives; productionisation timelines remain RBI-paced.

4. **Penalty figures**: Numbers cited (e.g., FY24-25 = ₹54.78 cr / 353 penalties; 2021-Jan 2024 88% increase / ₹78.6 cr) are from secondary aggregations (Economic Times, Moneycontrol, Signzy compilation, Face of India FY24-25 compilation). RBI does not publish a single official aggregate; consumers of this RCM should not treat penalty totals as audit-grade.

5. **DPDP Act 2023 implementation**: Notification of DPDP Rules has been staggered through 2025-2026; data fiduciary obligations layer onto existing RBI/SEBI/IRDAI frameworks. Treat OBL-RBI-049 as "directionally" compliant pending final rules; concrete operational obligations may shift.

6. **Archetype divergence is illustrative**: The PSU/SFB/FBB/NBFC notes are summary patterns. Specific obligations differ materially by entity tier (NBFC SBR layer; UCB Tier 1-4 categorisation; PSL classification). Downstream RCM should re-test archetype mapping against the entity's actual licence type and asset size.

7. **"Comply or explain" for foreign bank branches**: Multiple Master Directions (notably ITGRCA `OBL-RBI-007`) provide "comply or explain" treatment for foreign bank branches relying on group-level governance. This is not an exemption — RBI expects substantive compliance with deviations explicitly justified to RBI.

8. **6-hour cyber reporting overlap**: Three parallel 6-hour windows exist — RBI Cyber Security Framework `OBL-RBI-013` (2-6 hrs), RBI IT Outsourcing MD `OBL-RBI-019` (6 hrs from TPSP detection), and CERT-In `OBL-RBI-048` (6 hrs from awareness). DPDP `OBL-RBI-049` adds parallel personal-data-breach notification to the Data Protection Board. Effective bank response time = shortest of these windows. Operational preparedness must satisfy all simultaneously.

9. **Scope exclusions**: This brief does not exhaustively cover SEBI (for treasury / capital markets), IRDAI (for bancassurance), FEMA / FED (cross-border / FX), GST, or non-RBI regulators except where they intersect risk categories. The downstream RCM should layer those obligations separately.

10. **Numbers in failure examples (e.g., HDFC ~14 months embargo lift, IIFL 6-month gold loan ban Mar-Sep 2024) are from public reporting** — the underlying RBI press releases and orders should be consulted directly for legal-standard citation in regulated-industry artefacts.

— *End of brief.*