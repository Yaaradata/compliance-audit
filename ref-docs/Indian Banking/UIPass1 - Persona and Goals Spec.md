# Persona and Goals Specification — AI-Driven Risk, Compliance & Audit Platform
## Mid-Sized Indian Private Sector Bank
**UI Pass 1 — Product Thesis, Personas, Outcomes & Design Principles**
*Prepared by: CRO (India private sector bank), CCO (RBI/PMLA-focused), Head of Internal Audit (India banking, RBS-aware), RegTech Product Strategist | Cut-off: April 2026*

---

## 0. Document Purpose & Scope

This document is the **persona-and-goals foundation** for the platform whose execution layers are detailed in:

- **Pass 1** — `Pass1 out Risk and Compliance Landscape Pvt Banks.md` (Risk and Regulatory Reality)
- **Pass 2** — `pass2 out Process-Execution-Reality.md` (Process / Step / Activity / Control / Evidence)
- **Pass 3** — `Pass 3 out - Product Ontology.md` (Knowledge graph)
- **Pass 4** — `Pass RCM,FieldDef,AISignals,MappingUI.MD` (RCM, fields, AI signals, source-system mapping)

It defines **who the product is for**, **what they care about**, **what they need to decide**, and **what outcomes the system must deliver**. It deliberately does not specify UI screens, interaction flows, or data models; those are downstream of this document.

**Conventions used (re-using Pass 1–3 IDs):**
- Risks: `R-<DOMAIN>-NNN`; Obligations: `OBL-<SOURCE>-NNN`; Failures: `FAIL-NNN`
- Processes: `PROC-<DOMAIN>-NNN`; Controls: `CTRL-<DOMAIN>-NNN`
- Persona IDs (new in this pass): `PERSONA-NNN`
- Outcome IDs (new): `OUT-NNN`
- Question IDs (new): `Q-<PERSONA>-NN`
- Archetypes: `MSPB` (mid-sized private bank — baseline), `PSU`, `SFB`, `FBB` (foreign bank branch), `NBFC`

**Reading order**: Section 1 (thesis) → Section 2 (personas) → Sections 3–6 (matrices and scope) → Sections 7–8 (principles and handoff).

---

## SECTION 1 — Product Thesis

> **One-line thesis**: An AI-driven, evidence-first observability platform that turns every banking process — KYC, lending, AML, UPI, complaints, vendor, IT — into a continuously-auditable graph of obligations, controls, and evidence so that a mid-sized Indian private bank can survive RBI Risk-Based Supervision, PMLA scrutiny, and digital-scale fraud without resorting to retrospective sample audits or manual workpaper reconstruction.

### 1.1 What this platform IS

1. **An evidence-first system, not a dashboard-first one.** Every metric, every chart, every risk score, every AI insight must drill — in one click — to the underlying ProcessExecution, ControlInstance, EvidenceRecord, and source-system log line that produced it. If a number cannot be traced to evidence on a specific UCIC, Loan-ID, Alert-ID, Change-ID, or Vendor-ID, it is not displayed. This is the only design stance that survives an RBI Annual Financial Inspection (AFI) under Section 35, Banking Regulation Act, 1949.

2. **A regulator-ready, population-scale audit substrate.** The platform tests 100 % of in-scope transactions, alerts, KYC records, complaints, and IT changes — not a 30/100/250 sample. Concurrent audit and Internal Audit (RBIA per `RBI/2002-03 DBS.CO.PP.BC.10/11.01.005/2002-03` dated 27-Dec-2002 and `DoS.CO.PPG./SEC.05/11.01.005/2020-21` dated 3-Feb-2021) are reframed from "sample-and-hope" to "population-test-and-investigate-exceptions".

3. **A Regulation → Obligation → Risk → Control → Process → Activity → Evidence → Exception → Issue → Remediation graph.** Every node is durable, versioned, bi-temporal, and queryable. Every edge is explainable. The graph is the product.

4. **An accountability ledger** that materialises **who did what, on what authority, with what evidence, when** — at the granularity required to defend a Fit-and-Proper review of the MD&CEO, WTD, or CCO under RBI's Corporate Governance Directions and the *Compliance Function in Banks* circular (`RBI/2020-21/35 DoS.CO.PPG./SEC.02/11.01.005/2020-21` dated 11-Sep-2020).

5. **An always-on inspection-readiness layer.** The packs RBI inspectors ask for during an AFI, an off-site CSITE inspection, an IT inspection, a thematic review, or a Risk Assessment Report (RAR) under SPARC are pre-assembled — not constructed in the 14-day "data call" window after the inspection notice arrives.

### 1.2 What this platform IS NOT

6. **It is not another GRC spreadsheet platform.** Static RCM workbooks, quarterly attestation campaigns, and PowerPoint-driven Audit Committee packs are explicitly the failure mode this product replaces. A static RCM goes stale within 30 days of an RBI circular; the platform's RCM is recomputed every time a regulation, control, or evidence record changes.

7. **It is not a "compliance chatbot" or a generic LLM assistant.** Every AI signal must cite source records, confidence, and the model version that produced it (per ITGRCA Directions, `RBI/2023-24/107 DoS.CO.CSITEG/SEC.7/31.01.015/2023-24` dated 7-Nov-2023). Black-box scoring or hallucinated regulatory text is unacceptable in an RBI-supervised environment.

8. **It is not a replacement for the regulated function.** The CCO, MLRO/Principal Officer, BSA Officer, CISO, HIA, and second-line risk officers remain accountable. The platform compresses their time-to-evidence, time-to-decision, and time-to-remediation; it does not replace them.

### 1.3 Why mid-sized Indian private banks need this NOW

9. **Supervisory intensity has structurally stepped up.** RBI imposed **353 monetary penalties totalling ~₹54.78 crore in FY24-25** (ET / Moneycontrol compilation), the highest ever; 88 % rise in penalty volume between 2021 and Jan 2024 (Signzy data). The Paytm Payments Bank shutdown (BR Act Sec 22(4), 11-Mar-2024 → final 31-Mar-2024), Kotak Mahindra Bank embargo (Apr-2024), Bajaj Finance "eCOM/Insta EMI" cease-and-desist (15-Nov-2023, lifted 2-May-2024), HSBC India AML penalty (Feb-2025), and IIFL Finance gold-loan ban (Mar-2024) are not random shocks — they are a regime, not exceptions. Banks discovered their evidence trail is fundamentally inadequate when RBI asks specific UCIC/Loan-ID/Change-ID-level questions in AFI.

10. **The 28-Nov-2025 Master Direction consolidation reset compliance inventories.** RBI consolidated ~3,500 directions/circulars into 238 Master Directions and withdrew 9,445 circulars; the 2016 KYC MD was superseded by ten sector-specific KYC MDs. Every mid-sized bank now needs to re-anchor every internal control to the new MD topology. A static RCM cannot survive this; only a graph that maps obligation versioning to control instances can.

11. **UPI, digital lending, and AA-scale data has broken sample-based audit forever.** UPI volumes have crossed 18-20 billion transactions/month industry-wide; a mid-sized PB processes 200 M – 2 B txns/month. Concurrent audit sampling 100/200 transactions per branch per month is statistically meaningless against a 200 M-txn denominator. RBI's *Master Direction on Fraud Risk Management* (`RBI/DOS/2024-25/118 DOS.CO.FMG.SEC.No.5/23.04.001/2024-25` dated 15-Jul-2024) explicitly mandates Early Warning Signals integrated with CBS, a Data Analytics & Market Intelligence Unit, and EWS-driven Red-Flagged Account tagging — none of which can be served by sampling.

12. **Senior management accountability has hardened in India.** The CCO appointment letter, tenure, premature transfer, and resignation now require prior intimation to the RBI Senior Supervisory Manager (SSM); CRO has equivalent expectations under the *Risk Management* framework; HIA term is ≥3 years under RBIA; and the MD&CEO is personally exposed under the *Corporate Governance in Commercial Banks* directions and the Fit & Proper criteria. These persons must be able to demonstrate **reasonable steps** taken — and that demonstration is impossible without an evidence ledger of decisions, attestations, exception approvals, and board-pack provenance.

13. **The "documentation–reality drift" problem is the single largest hidden risk.** RCM workbooks describe a control library; reality is what actually happens in CBS / LOS / DLA / AML engine / branch terminal logs. Paytm PB (KYC drift), HDFC Dec-2020 (IT outage despite documented DR), Kotak Apr-2024 (IT inventory and patch gaps despite governance committees), HSBC India Feb-2025 (AML alert outsourcing despite documented controls) — every one of these was a drift between documented control and operating control. Bridging that gap requires evidence-first observability, not better documents.

### 1.4 Why legacy GRC and manual concurrent audit are insufficient

14. **Legacy GRC tools are document-management systems with workflow.** They store RCM artefacts, schedule attestations, and generate PDFs; they do not observe processes. They have no native concept of `ProcessExecution`, `ControlInstance`, `EvidenceRecord`, or bi-temporal state. They cannot answer "show me every UCIC where Step-KYC-08 (CKYCR upload) failed in March without retry"; they can only answer "show me the latest signed RCM workbook for KYC".

15. **Concurrent audit was designed for a 1990s branch-banking model.** RBI's concurrent audit framework (`RBI/2019-20/250 Ref.No.DoS.CO.ARG/SEC.01/08.91.001/2019-20` dated 18-Sep-2019, *Concurrent Audit System in Commercial Banks*) covers ~50 % of a bank's business and runs branch-by-branch with 100 % daily transaction review *for high-risk activities only*. It is structurally incapable of covering UPI mule patterns, DLA/LSP digital flows, AA-based data flows, or retail unsecured velocity at digital scale. RBI inspectors increasingly ask for **population evidence**, not concurrent audit reports.

16. **Manual RCM goes stale within 30 days.** Indian banking sees 200+ RBI circulars/year plus ad-hoc supervisory letters (FMR/CSITE/CIMS/CRILC/CRMNFB/etc.). The Apr-2024 Op-Risk Guidance Note alone (`RBI/2024-25/31 DOR.ORG.REC.21/14.10.001/2024-25` dated 30-Apr-2024) introduced "critical operations", impact tolerances, and ICT-OpRisk integration — material RCM additions. Updating an Excel-based RCM in this cadence is the structural reason for AFI findings on "compliance testing coverage gaps" and "compliance function not abreast of regulatory changes" (CCO circular `OBL-RBI-043`).

### 1.5 Why evidence-first process observability matters for inspection readiness

17. **RBI inspections are Risk-Based, point-in-time-defensible, and field-level specific.** SPARC IRISc scoring, AFI MRA observations, MAP/RMP closure, and CSITE thematic inspections all eventually descend to "show me the underlying account / alert / change / customer record". Banks today reconstruct this manually from CBS exports, mailbox archives, BPO ticket dumps, and Excel logs over 7-14 days per data call. The platform converts that scramble into a graph traversal. **Inspection readiness is not a campaign; it is a steady state.**

### 1.6 Why senior management accountability changes the product requirement

18. **In India, accountability is increasingly personal.** RBI has invoked Sec 36AA BR Act (removal of management) and Sec 47A (monetary penalties on individuals and the bank); the SC ruling in *SBI v. Rajesh Agarwal* (2023) extended natural justice to fraud-tagging decisions; PMLA s.13 imposes officer liability. The platform must therefore record not only **what control fired** but **who attested with what authority, with what evidence, and what they should reasonably have known**. This is the single most India-specific product requirement.

### 1.7 Why AI must be explainable, model-risk-governed, and evidence-backed

19. **ITGRCA Directions and emerging RBI AI guidance treat models as governed artefacts.** Every AI signal must record: model ID and version, training-data lineage, input features, output, confidence, human-in-the-loop disposition, monitoring drift metrics, and challenger-model comparison. Anything less fails the Model Risk Management expectations RBI examiners have begun applying since the ICICI / Axis / HDFC IRB-model approvals and the 2024 MD on FRM's mandate for model-driven EWS.

### 1.8 Why the Indian regulatory stack creates unique integration requirements

20. **PMLA / FIU-IND / CKYCR / CERSAI / CIMS / CRILC / NPCI / UIDAI / Account Aggregator are not 'localisations' of Western regtech.** They are first-class data sources with mandatory connectivity, return-formats, and reporting cadences. CTR / STR / NTR / CCR / CBWTR are statutorily timed (CTR by 15th of next month; STR within 7 days of conclusion of "reason to suspect"). UAPA s.51A daily screening is non-negotiable. CERT-In 6-hour rule (`OBL-RBI-048`) and DPDP Act breach notification (`OBL-RBI-049`) run in parallel. CIMS for digital lending (`OBL-RBI-025`, effective 15-Jun-2025) has CCO certification. Any platform that treats India as a regional adaptation of an FCA/SMCR product will fail. The platform must **architect against the Indian stack as the primary stack**.

---

## SECTION 2 — Persona Model

The platform serves three primary personas. Each represents a distinct *cognitive model* over the same underlying fact base; they must see different lenses, ask different questions, and act on different signals — all from the same evidence graph.

### 2.1 PERSONA-001 — Apex Risk Owner (CRO / MD&CEO / Board Risk Committee Chair)

#### 1. Persona name and title
**Anand Subramanian, Chief Risk Officer** (representative; equivalent decision-rights also held by MD&CEO and Board Risk Committee Chair). Reports to the MD&CEO and dotted-line to the Board Risk Management Committee.

#### 2. Role in a mid-sized Indian private sector bank
- Own the bank's enterprise risk profile across credit, operational, market, liquidity, IT/cyber, financial crime, conduct, and reputational risk.
- Set and re-calibrate the **Risk Appetite Statement** (RAS) approved by the Board.
- Sign off the bank's **ICAAP** under `RBI/2014-15/535 DBR.No.BP.BC.85/21.06.201/2014-15` dated 1-Apr-2015 (Master Circular — Basel III), and engage with RBI's SPARC IRISc rating cycle.
- Chair the Risk Management Committee of Executives (RMCE), present to the Risk Management Committee of the Board (RMCB), and serve as the principal risk voice at the Audit Committee of the Board (ACB).
- Single human-in-the-loop on "stop the bank" decisions: cease-and-desist exposures, voluntary disclosure to RBI, RFA tagging escalation under `OBL-RBI-032`, and material-finding escalation to the Board.

#### 3. Regulatory / accountability context
- **CRO appointment, tenure, removal**: governed by RBI's *Risk Management System* expectations (analogous framing to CCO circular). CRO of `MSPB`/`PSU`/`SFB` reports to Board Risk Management Committee, with prior intimation to RBI SSM on premature transfer.
- **MD&CEO accountability**: Fit & Proper criteria under `RBI/2021-22/26 DOR.GOV.REC.8/29.67.001/2021-22` dated 26-Apr-2021 (Corporate Governance in Banks); BR Act Sec 10A/10B; Sec 36AA removal power; Sec 47A monetary penalties.
- **Board Risk Committee Chair**: under same Corporate Governance Directions; minimum number of independent members; minimum meeting cadence; minutes auditable by RBI.
- **Equivalent SMCR analogue**: SMF4 (CRO) / SMF1 (CEO) — but in India accountability is multi-source: RBI, PMLA, Companies Act, SEBI LODR (for listed banks), and DPDP Act 2023.

#### 4. Mental model — how they think today
- Thinks in terms of **risk position over time**, not control descriptions. "Where am I outside appetite this quarter, and is that drift accelerating or stabilising?"
- Maps the world along three axes: **inherent risk × control effectiveness × residual risk**, by domain (R-CR / R-OP / R-CO / R-CD / R-TC / R-FC / R-TP / R-FR).
- Keeps a private list of **"things that could become an RBI letter"**: re-KYC pendency, AML alert ageing, IT change failure rate, UPI fraud rate, recovery-agent complaints, IRACP overrides, vendor concentration.
- Spends materially more time on **AFI MAP/RMP closure, SPARC IRISc trajectory, and CSITE inspection observations** than on dashboards.
- Views the CCO, MLRO, CISO, and HIA as his/her sensors; deeply distrusts averages and aggregated scores without drill-down.

#### 5. Daily concerns
- Is there a developing material event today (fraud, IT outage, sanctions hit, large NPA slippage, customer-facing media event) that needs MD/Board notification before close of business?
- Is anything on the cusp of breaching the 6-hour CSITE / CERT-In window (`OBL-RBI-013`, `OBL-RBI-048`)?
- Is any UAPA s.51A daily screening miss or hit (`OBL-RBI-050`) unresolved?
- Are there fresh customer complaint clusters indicating mis-selling or recovery harassment?
- Is there a developing concentration in retail unsecured / co-lending / single counterparty exposures (`OBL-RBI-039` Large Exposures Framework)?

#### 6. Weekly / monthly / quarterly concerns
- **Weekly**: Risk dashboard for ELT; AML alert backlog (L1/L2/L3 ageing); STR queue ageing >7 working days; high-severity IT incidents; RFA candidates (`OBL-RBI-031`/`032`).
- **Monthly**: Risk Management Committee of Executives (RMCE) pack — KRI movements; FIU-IND CTR/STR submission status; CIMS digital-lending reporting status; TPSP material outage register.
- **Quarterly**: Board Risk Management Committee pack — ICAAP refresh; appetite breaches; DSB return submissions; CRILC; Pillar-3 disclosures; AFI MAP/RMP progress; SPARC IRISc internal mock.
- **Annual**: ICAAP, ILAAP, RAS recalibration; AFI engagement (typically Q4); Operational Resilience review under `OBL-RBI-040`/`OBL-RBI-041`.

#### 7. Biggest fears
- **Regulatory**: An AFI MRA / MRIA on KYC, AML, IT, or governance that escalates to a Section 35A cease-and-desist (HDFC Dec-2020, Kotak Apr-2024, Paytm PB Jan-2024 trajectory). Loss of premier rating in SPARC IRISc. PMLA s.13 referral. Fit & Proper review.
- **Operational**: A UPI mule / cyber incident / IT outage that becomes public before the bank has reconstructed the facts internally. A vendor (e.g., CBS, AML, BPO) failure cascading to customer-facing outage.
- **Career**: Personal Sec 47A penalty; removal under Sec 36AA; reputational scarring affecting next CRO/CEO role; appearing before SFIO / ED in case of fraud-linked supervisory action.
- **Boardroom**: Surprised by an issue the second-line "should have flagged" — i.e., a control failure that is visible in evidence but not visible to him/her.

#### 8. Decisions they need to make
- Whether to escalate a control failure to RBI as voluntary disclosure (`OBL-RBI-046` SPARC engagement context).
- Whether a RFA candidate becomes Red-Flagged (`OBL-RBI-032`).
- Whether to halt a product (digital lending tile, co-branded card, co-lending tranche) on emerging compliance risk.
- Whether to invoke a contingent capital add-on under ICAAP for an emerging risk.
- Whether to fire / replace a vendor on material outsourcing risk (`OBL-RBI-016`–`OBL-RBI-021`).
- Whether to extend / reduce risk appetite by domain at the next RMCB.
- Whether to attest to RBI / Board on KYC, AML, IT, Conduct, or Op-Resilience compliance for the period.

#### 9. Questions they ask when opening the product
- "Where am I outside risk appetite today?"
- "What changed since I last looked?"
- "What does the RBI inspector see if they walk in tomorrow?"
- "Which control failures are trending toward a Section 35A or 47A risk?"
- "Which of my senior accountabilities have evidence gaps?"

#### 10. Evidence they need to trust the system
- **Source-of-truth lineage on every number**: transaction ID, UCIC, alert ID, change ID, vendor ID, with timestamp.
- **Independent reconciliation**: the platform's CTR count must reconcile to FIU-IND submission; AML alert closure must reconcile to AML engine logs; IT change count must reconcile to ITSM exports.
- **Bi-temporal queryability**: "what did we know at what time" (system_time) vs. "what was true at what time" (valid_time) — material for fraud/forensic and AFI defence.
- **Model risk transparency**: every AI signal cites model version, features, confidence, and HITL disposition.
- **Continuous control assurance from independent test runs**, not from self-attestation.

#### 11. What they will not tolerate in the product
- Vanity dashboards with no drill-down to evidence.
- "Heat maps" without underlying transaction-level facts.
- AI scores that cannot cite the data they used.
- Latency >24 h on material-event detection.
- Any number that cannot be defended in front of an RBI inspector.
- A product that requires the CRO to chase the CCO/CISO/HIA for the "real story".

#### 12. AI support they would accept
- **Pattern detection on evidence**: "the bank's KYC re-completion rate has degraded 4 % WoW concentrated in two BPO floors".
- **Forward-looking risk scoring** with explicit confidence and feature attribution.
- **Inspection-prep generation**: pre-assembled evidence packs for AFI / SPARC questions, with the underlying records cited.
- **Anomaly explanation in plain English** with citation to obligation, control, and process.
- **Board-pack drafting** that cites every number, with the CRO retaining final edit authority.

#### 13. AI support they would reject or distrust
- A "compliance score" that does not name its inputs.
- A natural-language summary that paraphrases regulation without citation.
- An auto-generated regulatory response without human attestation pathway.
- Predictive "risk likelihood %" without challenger-model and back-test track record.
- Any AI output that bypasses CCO / MLRO / CISO accountability.

#### 14. Main system goals
- **Single, defensible enterprise risk picture** across `R-CR` / `R-OP` / `R-CO` / `R-CD` / `R-TC` / `R-FC` / `R-TP` / `R-FR`, drillable to evidence.
- **Always-on inspection readiness** — AFI / SPARC / CSITE / FIU-IND data calls answered from the graph in hours, not days.
- **Senior management accountability ledger** evidencing reasonable steps for every regulatory obligation.
- **Forward-leaning early warning** — degrading controls flagged before they become AFI findings.

#### 15. Success metrics
- Reduction in **AFI MRA observations YoY**.
- **SPARC IRISc score** (internal mock) trajectory.
- **% of obligations with fresh, evidence-backed control coverage** (target ≥95 %).
- **Mean time to detect (MTTD) material control failure** — target < 24 h.
- **Mean time to assemble inspection pack** — target < 4 h from ad hoc query.
- **% of risk decisions taken at the Board / RMCB with evidence-cited inputs** — target 100 %.
- **Personal Sec 47A / Sec 36AA exposure events** — target zero.

---

### 2.2 PERSONA-002 — Functional Risk & Compliance Leadership (CCO / Head of ORM / MLRO–Principal Officer / Head of Financial Crime / Head of IT Risk)

#### 1. Persona name and title
**Priya Krishnamurthy, Chief Compliance Officer** (representative). The persona archetype includes the CCO, Head of Operational Risk (Head of ORM), the MLRO/Principal Officer (under PMLA), the Head of Financial Crime (often combined with MLRO), and the Head of IT Risk / CISO function (or its compliance interface). All share a functional accountability lens.

#### 2. Role in a mid-sized Indian private sector bank
- The CCO is the second-line accountable owner for compliance with RBI, PMLA, FEMA, IT Act, DPDP Act, SEBI/IRDAI overlays. RBI-notified appointment per `OBL-RBI-043`.
- The Principal Officer (often the BSA Officer) is accountable for FIU-IND CTR/STR/NTR/CCR/CBWTR submissions under PMLA s.13 and PML(MoR) Rules.
- The Head of ORM owns the operational-risk taxonomy, KRI library, and operational resilience framework (`OBL-RBI-040`/`041`/`042`).
- The Head of IT Risk / CISO interfaces own the ITGRCA (`OBL-RBI-007`–`OBL-RBI-015`) implementation, CSITE inspections, CERT-In incident reporting, DPDP breach reporting.
- Together they translate **regulation → obligation → control library → testing programme → assurance report** to the CRO, MD&CEO, and Audit Committee.

#### 3. Regulatory / accountability context
- **CCO**: minimum 3-yr tenure; GM/equivalent rank ≥ 2 levels below CEO; no business dual-hatting; prior intimation to RBI SSM on appointment / premature transfer / resignation (`OBL-RBI-043`/`OBL-RBI-044`).
- **Principal Officer / MLRO**: registered with FIU-IND; STR/CTR/NTR submission accountability (PMLA s.12, s.13); reasoned-officer requirement for fraud SCN under SC ruling *SBI v. Rajesh Agarwal* (2023).
- **Head of IT Risk / CISO**: ITGRCA effective 1-Apr-2024; Cyber Security Framework `RBI/2015-16/418 DBS.CO/CSITE/BC.11/33.01.001/2015-16` dated 2-Jun-2016; CERT-In 6-hr rule (`OBL-RBI-048`); DPDP Act breach reporting (`OBL-RBI-049`).
- **Head of ORM**: Op-Risk Guidance Note 30-Apr-2024 (`OBL-RBI-040` seq.); ICAAP op-risk capital input.
- **Conjoint accountability**: dual-hatted CCO/CRO is an explicit RBI concern in mid-sized banks.

#### 4. Mental model
- Thinks in **Obligation Coverage Matrix (OCM)**: every RBI / PMLA / IT-Act / DPDP / SEBI obligation must map to one or more **Control(s)**, each **tested**, each **evidenced**, each **owned**.
- Tracks **closure of supervisory observations** like a project plan — AFI MRA / RMP / MAP / CSITE / SPARC / Off-site Surveillance findings, each with target date, owner, evidence, and dependency on IT/Ops.
- Lives on **"reporting timeliness and accuracy"** — CTR by 15th, STR ≤7 days from suspicion conclusion, FMR ≤14 days from fraud classification, RFA ≤7 days from EWS trigger to RBI, CERT-In ≤6 hrs, CSITE ≤2-6 hrs, CIMS quarterly.
- Lives on **"sample-to-population" gap** — knows that compliance testing of 30 KYC records / branch / month is a token gesture against 50 K-200 K new accounts.
- Distinguishes **control design vs control operation** as a first-class concept.

#### 5. Daily concerns
- Has any reportable AML pattern surfaced in the last 24 h that needs an STR draft?
- Is the L1 alert disposition queue ageing above SLA at the BPO?
- Are there UAPA hits (`OBL-RBI-050`) pending freeze?
- Is a CSITE-reportable cyber incident in the pipeline (T-2-6 hr countdown)?
- Has a vendor (TPSP) reported a material incident triggering 6-hr re-notification (`OBL-RBI-019`)?
- Is the day-end IRACP run clean (`OBL-RBI-038`)?

#### 6. Weekly / monthly / quarterly concerns
- **Weekly**: Compliance testing programme progress; control failure register; AML alert disposition dashboard; KYC re-KYC pendency; sanctions screening false-positive backlog.
- **Monthly**: CTR submission to FIU-IND by 15th; KRI pack to RMCE; complaints register to Internal Ombudsman; vendor risk register; DSB returns scheduling.
- **Quarterly**: Board Compliance / Audit Committee pack; CRILC; CIMS digital lending; CIMS DLA register; CSITE inspection prep; thematic review prep; concurrent audit supervision; outsourcing review.
- **Annual**: Compliance Risk Assessment; Op-Risk RCSA / Critical Operations mapping; ICAAP op-risk capital input; AML risk assessment under PMLA Rule 9(14).

#### 7. Biggest fears
- **PMLA s.13 enforcement** for STR delay or quality (HSBC India Feb-2025 archetype).
- **AFI MRIA** on KYC / AML / IT (Paytm PB / HDFC / Kotak / Bajaj Finance / IIFL trajectories).
- **Sec 47A penalty on the bank or on the CCO/PO personally**.
- **Show-cause notice that the CCO did not have visibility on the underlying control**.
- **Not knowing about an issue until a customer complaint / media event / RBI letter arrives**.
- **The CRO/MD asking a UCIC / Loan-ID / Alert-ID question and the CCO needing 3 days to reconstruct the answer**.

#### 8. Decisions they need to make
- Whether a suspicion warrants STR filing (and on what timeline).
- Whether to escalate a control failure to the CRO / Audit Committee.
- Whether a regulatory change has been adequately operationalised across products and branches.
- Whether to accept / reject a product launch (KYC adequacy, KFS adequacy under DL Directions 2025, AML scenario adequacy, IT readiness).
- Whether a vendor outage / breach is materially reportable.
- Whether a fraud detection should classify the borrower (post-`OBL-RBI-034` natural-justice SCN) as Red-Flagged → Fraud.
- Whether to recommend a Pillar-2 op-risk capital add-on.

#### 9. Questions they ask when opening the product
- "Which RBI obligations are weakly covered by existing operating controls?"
- "Which AML / STR obligations are at risk of a reporting breach this week?"
- "Which controls are degraded, failing, or evidence-thin?"
- "Where in the product / process / channel is the control library out of date?"
- "Which AFI / RMP / MAP items are at risk of slippage?"

#### 10. Evidence they need to trust the system
- **Obligation-to-Control mapping coverage**, with version dates.
- **Population-level test results** by control, by branch / channel / product.
- **Independent evidence** (CBS log, AML engine log, ITSM ticket) — not self-attestation.
- **Aged exception register** with owner, target date, and Board-Audit-Committee visibility.
- **Time-stamped reporting submissions** to FIU-IND, CIMS, CRILC, CERT-In with acknowledgements.

#### 11. What they will not tolerate
- Generic GRC modules that treat every control as a "Yes/No" attestation.
- Aggregated KPIs that hide branch / product / vendor concentration.
- "Compliance score" without obligation-level breakdown.
- AI signals that cannot cite the regulatory clause they are interpreting.
- Manual re-keying of compliance testing results (the platform must consume CBS/LOS/AML logs natively).

#### 12. AI support they would accept
- **Auto-detection of obligation-to-control coverage gaps** when a regulation is amended (e.g., 12-Jun-2025 KYC amendment introducing 10 % partnership BO threshold).
- **AML scenario coverage analysis** — which behavioural patterns are not addressed by existing TM rules.
- **Predictive STR triage** — prioritising L1 alerts by risk weight, with explainability.
- **Auto-drafted Workpapers / SCN** that the human signs off.
- **Regulatory change ingestion** — parsing new RBI Master Directions and proposing control changes for human approval.

#### 13. AI support they would reject
- AI that closes alerts / files reports without human sign-off.
- AI that auto-classifies a customer as PEP / sanctions hit without human review.
- AI that generates regulatory interpretation as fact rather than as suggestion.
- Black-box scoring that the CCO cannot defend in writing to the SSM.

#### 14. Main system goals
- **Live Obligation Coverage Matrix** with control-to-evidence linkage.
- **Compliance testing at population scale** — not 30 records / branch / month.
- **Real-time supervisory observation closure tracker** (AFI / RMP / MAP / CSITE / SPARC).
- **Pre-staged regulator data calls** — PMLA Rule 9 record retention, FIU-IND audit, CSITE follow-up, DPDP breach record.
- **Integrated view across compliance / op-risk / IT-risk / financial crime** — one fact base, four lenses.

#### 15. Success metrics
- **% of obligations with fresh, population-tested control evidence** (target ≥95 %).
- **MTTR (mean time to remediate) on identified control failures** — target trending downward.
- **Reporting timeliness — CTR, STR, FMR, RFA, CSITE, CERT-In, CIMS** — target 100 % within statutory window.
- **AFI MRA / RMP / MAP closure rate** — target ≥90 % within agreed timelines.
- **Compliance testing coverage** — target 100 % of in-scope branches / channels / products.
- **Number of Sec 47A penalties / show-cause notices** — target zero.

---

### 2.3 PERSONA-003 — Day-to-Day Tester (Compliance Officer / Internal Audit Manager / Concurrent Auditor / Control Testing Doer)

#### 1. Persona name and title
**Karthik Iyer, Senior Manager — Internal Audit (RBIA team)** (representative). Persona archetype includes:
- Compliance Officer at Zonal / Regional / Branch level (under CCO).
- Internal Audit Manager (third line, RBIA team).
- Concurrent Auditor (typically empanelled CA firm, per RBI's Concurrent Audit framework).
- Control Testing analyst (often outsourced to BPO / captive but supervised by an in-house manager).

#### 2. Role
- Execute the audit / compliance testing plan: select samples, request evidence, perform testing, document findings, raise issues, follow up on remediation.
- Prepare workpapers that survive RBI inspection — the workpapers themselves are inspected.
- Document evidence trails for the 3-year RBIA record retention and PMLA 5-year Rule 9(11) requirement.
- Liaise with Branch Manager, Operations Head, BPO L1/L2, Vendor SPOC, IT teams to obtain evidence.
- Author Issues, track Action Tasks, escalate to second/third-line leads on slippage.

#### 3. Regulatory / accountability context
- **RBIA**: governed by `RBI/2002-03 DBS.CO.PP.BC.10/11.01.005/2002-03` dated 27-Dec-2002 for SCBs and `DoS.CO.PPG./SEC.05/11.01.005/2020-21` dated 3-Feb-2021 for select NBFCs/UCBs. HIA term ≥3 years.
- **Concurrent Audit**: governed by `RBI/2019-20/250 Ref.No.DoS.CO.ARG/SEC.01/08.91.001/2019-20` dated 18-Sep-2019 (*Concurrent Audit System in Commercial Banks*). 100 % daily transaction review for high-risk activities; Branch ICR (Internal Control Review) at minimum quarterly cadence.
- **Statutory / External Audit**: Companies Act, BR Act Sec 30, RBI guidelines on appointment of statutory auditors (`RBI/2021-22/25 Ref.No.DoS.CO.ARG/SEC.01/08.91.001/2021-22` dated 27-Apr-2021).
- **PMLA Rule 9 record retention**: 5 years from cessation of business relationship; 5 years from STR.
- **Workpapers themselves are inspected** under AFI; they must be reproducible and tamper-evident.

#### 4. Mental model
- Thinks in **test-of-design (ToD) → test-of-operation (ToO) → exception → issue → remediation**.
- Lives on **sample size, sampling rationale, evidence sufficiency, and workpaper completeness** — these are what the AFI / Statutory Auditor inspects.
- Distinguishes **branch-level evidence** from **enterprise-level evidence** — knows that a "100 % control" at HQ is meaningless if 30 % of branches override it.
- Treats **"could I defend this finding in writing?"** as the daily test.
- Distrusts auto-closed exceptions.

#### 5. Daily concerns
- What samples must I pull today? Which UCICs / Loan-IDs / Alert-IDs are in scope?
- What evidence is missing / stale / unverifiable that I need to chase?
- Which exceptions raised yesterday are at risk of not being closed within agreed timelines?
- Did the branch / BPO / vendor respond to my evidence requests?
- Is the workpaper for yesterday's testing complete enough to defend?

#### 6. Weekly / monthly / quarterly concerns
- **Weekly**: Concurrent audit branch coverage; daily-cycle exception report; high-risk transactions reviewed.
- **Monthly**: Concurrent audit monthly report to BO/PO; thematic test results; aged exception register.
- **Quarterly**: ICR per branch; RBIA quarterly audit committee submission; workpaper consolidation.
- **Annual**: RBIA risk assessment; audit plan refresh; statutory auditor handoff package.

#### 7. Biggest fears
- A statutory / RBI / Concurrent auditor finding an exception **the internal team missed** in the same period.
- **Workpaper inadequacy** challenged in AFI ("the test rationale is not documented"; "the sample is not defensible"; "the evidence is not preserved").
- **Sample bias** — the 30 records reviewed happened to miss the failures; in reality 10 % of population was non-compliant.
- **An issue raised then quietly reversed** — and then re-emerges in AFI.
- **Personal credibility loss** — being marked as "team that missed it" within IA / CA function.

#### 8. Decisions they need to make
- What sample / population is appropriate for this control?
- Is the evidence sufficient? (regulator-grade vs. illustrative)
- Is this an exception or a finding? Severity rating?
- Is this a one-off or a pattern across branches / products / channels?
- Should this issue be escalated to second/third-line leads?
- Has the remediation actually fixed the root cause, or only the symptom?

#### 9. Questions they ask when opening the product
- "Which controls can I population-test rather than sample?"
- "Where are the exceptions in this cycle?"
- "Which evidence records are missing, stale, or unverifiable?"
- "Can this test result be structured as an RBI inspection-ready workpaper?"
- "Which issues from prior cycles are still open and ageing?"

#### 10. Evidence they need to trust
- **Tamper-evident timestamps** on every evidence record.
- **Source-system fingerprint** (CBS log line ID, AML engine alert ID, ITSM ticket ID, vendor invoice number).
- **Independent reconciliation** — counts in the platform reconcile to source-system exports.
- **Versioned control library** — tester knows which control version applied at the time of the transaction.
- **Reproducibility** — running the same test next week against the same period yields the same result.

#### 11. What they will not tolerate
- A platform that requires manual re-keying of evidence already in CBS / LOS / AML / ITSM.
- "AI-suggested findings" with no underlying record.
- Workpapers that auto-update and lose audit trail.
- Inability to export workpapers to a regulator-ready format (PDF + structured CSV).
- Loss of evidence on customer / vendor / employee re-creation events.

#### 12. AI support they would accept
- **Population-level anomaly detection** that flags candidate exceptions for human review, with explainability.
- **Sample expansion** — when a sample exception is found, AI auto-expands to the rest of the population to assess prevalence.
- **Workpaper drafting** — pre-populated test rationale, test steps, and finding write-up that the auditor edits.
- **Issue de-duplication** — recognising that a finding is the same as one raised 6 months ago.
- **Auto-fetch evidence** from CBS / LOS / AML / ITSM with provenance preserved.

#### 13. AI support they would reject
- AI auto-closing exceptions or auto-disposing alerts without auditor sign-off.
- AI changing severity ratings post-hoc.
- AI generating a finding without source-record citation.
- AI summarising regulatory text in workpapers (the auditor must cite the actual obligation text, not a paraphrase).

#### 14. Main system goals
- **Population-level testing** for any control where data is available — sample only when population is impossible.
- **Workpaper-grade evidence trail** — every test, every sample, every finding traceable.
- **Issue lifecycle management** — open → in-remediation → re-test → closed → with re-test evidence.
- **Continuous concurrent audit** — daily-cycle for high-risk activities, with auditor reviewing exceptions, not transactions.
- **Inspection-ready packs** — when AFI arrives, the testing artefacts are ready to hand over.

#### 15. Success metrics
- **% of in-scope controls population-tested** (vs. sample-only) — target progressively rising.
- **MTTR on raised issues** — target downward.
- **Re-test pass rate** — target ≥95 % on first re-test.
- **Workpaper inspection acceptance rate** — target 100 % accepted in AFI.
- **Number of statutory / RBI findings missed by IA in the same period** — target zero.
- **Coverage of branches / products / channels by audit / concurrent audit** — target 100 % over annual cycle.

---

## SECTION 3 — Persona Goal Matrix

| Persona | Primary Goal | Secondary Goals | Visibility Needed | Action Needed | Evidence Needed | What "Good" Looks Like | What "Failure" Looks Like | MVP Priority |
|---|---|---|---|---|---|---|---|---|
| **PERSONA-001** Apex Risk Owner (CRO / MD&CEO / BRMC Chair) | Single, defensible enterprise risk position that survives RBI AFI / SPARC scrutiny, with evidence on demand. | (a) Forward-leaning early warning across `R-CR`/`R-OP`/`R-CO`/`R-CD`/`R-TC`/`R-FC`/`R-TP`/`R-FR`. (b) Reasonable-steps accountability ledger for self, MD&CEO, Board. (c) Always-on inspection readiness. (d) Concentration / appetite-breach detection. | Enterprise risk dashboard with one-click drill from any KRI / appetite metric to underlying ProcessExecution / ControlInstance / EvidenceRecord. Cross-domain heat map with bi-temporal slicing. AFI / RMP / MAP / SPARC pipeline. | Approve / reject control-change proposals; escalate to RBI; halt products; invoke ICAAP overlays; sign Board attestations. | Source-of-truth lineage; bi-temporal queryability; model-risk-governed AI provenance; independent reconciliation to FIU-IND / CIMS / CRILC submissions; CSITE / CERT-In submission acks. | RBI inspectors leave with no MRIA; SPARC IRISc trajectory positive; Board never surprised. AFI data calls answered ≤4 h. | An MRIA on a domain the CRO had a "green" dashboard for; Sec 35A embargo (Paytm/HDFC/Kotak/Bajaj/IIFL trajectory); personal Sec 47A. | **MVP P0** — must work end-to-end, cross-domain, day one. |
| **PERSONA-002** Functional Risk & Compliance Leadership (CCO / Head of ORM / MLRO–PO / Head of FC / Head of IT Risk) | Live Obligation Coverage Matrix with population-tested control evidence, real-time supervisory observation closure, and zero reporting breaches (CTR/STR/FMR/RFA/CSITE/CERT-In/CIMS). | (a) Auto-ingestion of regulatory change (e.g., 28-Nov-2025 MD consolidation; 12-Jun-2025 KYC amendment). (b) AML scenario coverage analysis. (c) Vendor / TPSP risk register with 6-hr reporting trigger. (d) IT change / incident / patch posture. (e) Compliance testing automation. | Obligation-to-Control matrix with version dates and freshness; AML alert ageing; reporting timeliness clock; supervisory observation tracker; vendor materiality matrix; CSITE / CERT-In incident pipeline. | File / withhold STR; escalate control failure to CRO; reject product launch; classify RFA → fraud; recommend Pillar-2 add-on. | Population-test results; CBS / LOS / AML / ITSM logs; FIU-IND / CIMS / CRILC submission acks; vendor incident reports; tamper-evident attestation history. | 100 % CTR/STR/FMR/RFA/CSITE/CERT-In within statutory window; ≥95 % obligations evidence-fresh; AFI MRA closure ≥90 % on time. | PMLA s.13 referral (HSBC India Feb-2025); AFI MRIA on KYC/AML/IT (Paytm/HDFC/Kotak); Bajaj-style KFS finding; CCO premature transfer notice to RBI. | **MVP P0** — must work end-to-end, day one. |
| **PERSONA-003** Day-to-Day Tester (Compliance Officer / IA Manager / Concurrent Auditor / Control Tester) | Population-level testing of any control where data is available, with workpaper-grade evidence trail and continuous concurrent audit replacing branch-by-branch sampling. | (a) Issue lifecycle (open → re-test → closed). (b) AI-assisted sample expansion on detected exception. (c) Evidence auto-fetch from CBS / LOS / AML / ITSM. (d) Workpaper drafting with citation. (e) Re-test pass-rate tracking. | Test plan vs. coverage; exception register by branch / product / channel; aged issue register; workpaper status; missing-evidence queue. | Raise issue; escalate to second/third-line; expand sample on exception; re-test; close with evidence; dispute auto-classification. | Tamper-evident timestamps; source-system fingerprints; reproducible test queries; versioned control library; signed-off workpapers. | 100 % workpapers AFI-accepted; ≥95 % re-test pass rate; zero IA-missed-then-statutory-found issues. | An RBI / Statutory / Concurrent finding the IA team missed; workpaper "test rationale not documented" challenge; sample-bias finding. | **MVP P1** — Wave 1 must give meaningful population testing on KYC + AML + Lending; expand in Wave 2/3. |

---

## SECTION 4 — Cross-Persona Outcome Model

The platform must deliver ten outcomes. Each outcome is a *unified slice* of the same evidence graph, but each persona consumes it differently.

### OUT-001 — Process Auditability Outcome

- **Description**: Every banking process — KYC, lending, AML, UPI, complaints, vendor, IT — is fully traceable. Every `ProcessExecution` (PE) has every `StepExecution` (SE) and every `ControlInstance` (CI) recorded with bi-temporal timestamps.
- **Why it matters in Indian banking**: AFI and Statutory Audit move below process to **specific UCIC / Loan-ID / Alert-ID / Change-ID**. The Paytm PB and HSBC India archetypes both turned on inability to defend specific records, not generic policy text.
- **Persona most affected**: PERSONA-003 (the tester sees the trail); PERSONA-002 (the CCO defends the trail to RBI); PERSONA-001 (the CRO trusts decisions on the trail).
- **Required evidence**: PE → SE → CI → EvidenceRecord chain; CBS log lines; AML engine alert IDs; ITSM ticket IDs; CKYCR submission acks; UAPA screening run logs.
- **Example metric**: % of in-scope process executions with complete PE→SE→CI→Evidence chain — target ≥99.5 %.
- **Example user action**: PERSONA-003 selects a control, runs a population query for the period, downloads tamper-evident workpaper.

### OUT-002 — Control Observability Outcome

- **Description**: Continuous, near-real-time visibility into whether each control is operating as designed, degrading, or failing. Goes beyond "control documented" to "control operating".
- **Why it matters in Indian banking**: HDFC Dec-2020 / Kotak Apr-2024 / Bajaj Finance Nov-2023 all had documented controls; the failure was in operation, not design. Op-Risk Guidance Note 30-Apr-2024 (`OBL-RBI-040` seq.) explicitly distinguishes design vs. operation.
- **Persona most affected**: PERSONA-002 (CCO / Head of ORM / IT Risk react to degradation); PERSONA-003 (IA tests operation).
- **Required evidence**: ControlInstance time-series; failure-mode tagging; pre-image and post-image where the control modifies state.
- **Example metric**: Control-effectiveness score per CTRL-ID, with degradation alerts at predefined thresholds.
- **Example user action**: PERSONA-002 sees `CTRL-KYC-006` (sanctions screening) degraded over 5 days, drills to false-negative rate by transliteration variant, escalates to vendor.

### OUT-003 — Evidence Completeness Outcome

- **Description**: Every Obligation has fresh, verifiable, tamper-evident evidence; missing or stale evidence is flagged.
- **Why it matters in Indian banking**: PMLA Rule 9 retention (5 yr); RBI's preference for "show me the actual record"; Statutory Auditor's evidence-sufficiency standard; the 14-day data-call window.
- **Persona most affected**: PERSONA-002 (defends to RBI); PERSONA-003 (gathers and signs off).
- **Required evidence**: Provenance metadata on every EvidenceRecord (source-system, hash, timestamp, retrieval URL); freshness clock per Obligation; chain-of-custody on rendered workpapers.
- **Example metric**: % of obligations with evidence fresher than its statutory / policy SLA — target ≥95 %.
- **Example user action**: PERSONA-003 sees `OBL-RBI-002` (periodic re-KYC) has 18 % UCICs without fresh evidence, raises issue, allocates to branch / BPO.

### OUT-004 — Issue Remediation Outcome

- **Description**: Every Issue has an owner, target date, root-cause, evidence of remediation, re-test status. Issues never silently disappear; closure requires positive re-test evidence.
- **Why it matters in Indian banking**: AFI MRA / RMP / MAP closure is the single most-reviewed compliance KPI by RBI. AFI re-inspection finds repeat issues — instant escalation.
- **Persona most affected**: All three.
- **Required evidence**: Issue lifecycle event log; ActionTask completion proof; re-test ControlInstance results.
- **Example metric**: % of issues closed with positive re-test evidence within agreed SLA — target ≥90 %.
- **Example user action**: PERSONA-001 reviews aged-issue register at RMCB, drills to root cause, escalates to MD&CEO.

### OUT-005 — Senior Management Accountability Outcome (RBI Governance / Fit & Proper)

- **Description**: The platform records — for the MD&CEO, WTDs, CRO, CCO, CISO, MLRO/PO, HIA — the decisions made, the evidence available at the time, the reasonable steps taken. This is the **defence file** for any future Sec 47A, Sec 36AA, PMLA s.13, or Fit & Proper review.
- **Why it matters in Indian banking**: The single most India-specific outcome. SC ruling *SBI v. Rajesh Agarwal* (2023) on natural justice; RBI's Apr-2021 Corporate Governance Directions; CCO circular `OBL-RBI-043`/`044`; RBI's growing use of personal accountability.
- **Persona most affected**: PERSONA-001 (primarily); PERSONA-002 (functional accountability).
- **Required evidence**: Decision logs with attached evidence at decision time (system_time); attestation events; board-pack provenance; alternative information available but not surfaced (gap analysis).
- **Example metric**: % of regulatory-significant decisions with cited-evidence record — target 100 %.
- **Example user action**: PERSONA-001 attests Q2 compliance to the RBC; the attestation pack is auto-assembled from underlying evidence; signature and pack are immutable.

### OUT-006 — Regulatory Inspection Readiness Outcome

- **Description**: AFI / SPARC / CSITE / FIU-IND / Concurrent / Statutory Auditor data calls are answered from the graph in hours, not days. Pre-staged "inspection lenses" for typical RBI thematic reviews (KYC, AML, IT, Digital Lending, Fraud, Conduct, Outsourcing).
- **Why it matters in Indian banking**: AFI cycle is annual; thematic reviews ad-hoc; data calls have 7-14 day SLAs that mid-sized banks struggle to meet. The reconstruction effort itself is a control failure indicator.
- **Persona most affected**: PERSONA-001 (signs off); PERSONA-002 (executes); PERSONA-003 (prepares evidence).
- **Required evidence**: Pre-built inspection-pack templates mapped to RBI's typical questions; underlying graph queries; immutable export hashes.
- **Example metric**: Mean time to assemble inspection pack for typical AFI question — target ≤4 h.
- **Example user action**: AFI requests "all KYC re-completions with sample evidence for 50 randomly chosen UCICs in March"; PERSONA-002 runs the lens, exports pack, hashes for chain of custody.

### OUT-007 — Audit Testing Outcome (Population-Level)

- **Description**: Where the data is available, controls are population-tested, not sampled. Concurrent audit and IA become exception-investigation rather than transaction-review.
- **Why it matters in Indian banking**: UPI / digital lending / AML scale has broken sampling. The MD on FRM 15-Jul-2024 (`OBL-RBI-030` seq.) explicitly mandates Data Analytics & MIU. Sampling concurrent audit is statistically meaningless against UPI's 200 M-2 B txns/month.
- **Persona most affected**: PERSONA-003 (operationally); PERSONA-002 (programme owner); PERSONA-001 (assurance recipient).
- **Required evidence**: Population query specification; reproducibility hash; exception list with severity rating; AI-driven anomaly explainability.
- **Example metric**: % of in-scope controls migrated from sample to population testing — target progressively rising over Wave 1/2/3.
- **Example user action**: PERSONA-003 runs population test for `CTRL-KYC-008` (CKYCR upload retry) for the quarter, identifies 412 UCICs with failed-and-not-retried CKYCR; AI auto-expands to identify the failing branch / BPO root cause.

### OUT-008 — Customer Fairness Outcome (Fair Practices Code / Charter of Customer Rights)

- **Description**: The platform measures whether customers are treated fairly: KFS adequacy, APR disclosure, recovery practice, complaint resolution, mis-selling indicators, vulnerable-customer protection.
- **Why it matters in Indian banking**: Bajaj Finance Nov-2023 (KFS); IIFL Mar-2024 (gold-loan recovery and valuation); Yes Bank Jun-2024 (charges); persistent senior-citizen mis-selling. RBI's Charter of Customer Rights and Fair Practices Code are AFI-tested.
- **Persona most affected**: PERSONA-002 (Conduct + Compliance); PERSONA-003 (Concurrent / Internal Audit on conduct sample); PERSONA-001 (reputational risk).
- **Required evidence**: KFS digital signature record; APR computation with components; recovery agent allocation SMS/email; complaint disposition; suitability check log.
- **Example metric**: % of digital lending accounts with KFS issued before disbursal — target 100 %.
- **Example user action**: PERSONA-002 sees a 1.4 % gap in KFS issuance for the "Insta EMI" product, halts disbursal, opens issue.

### OUT-009 — Operational Resilience Outcome (Critical Operations / IT Outsourcing / Cyber)

- **Description**: Critical operations (FSB-style "important business services") mapped end-to-end with third-party dependencies; impact tolerances; tested DR / failover; vendor materiality and 6-hr reporting trigger; cyber incident reporting (2-6 hr CSITE; 6-hr CERT-In; DPDP Act).
- **Why it matters in Indian banking**: Op-Risk Guidance Note 30-Apr-2024 (`OBL-RBI-040`/`041`/`042`); HDFC Dec-2020, Kotak Apr-2024 archetypes; CBS vendor concentration; rising cyber incidents.
- **Persona most affected**: PERSONA-002 (CISO / Head of ORM / Head of IT Risk lens); PERSONA-001 (Board view); PERSONA-003 (concurrent / IT audit).
- **Required evidence**: Critical-operation map with vendor dependencies; DR drill logs; vendor incident logs; CSITE / CERT-In / DPDP submission record; tested impact tolerance breaches.
- **Example metric**: % of critical operations with end-to-end mapping incl. third parties; mean time to detect / report cyber incident — target ≤2 h detect, ≤6 h report.
- **Example user action**: PERSONA-002 sees a vendor-side outage at TPSP for AML L1 disposition, activates 6-hr re-notification clock, documents impact.

### OUT-010 — AI Trust and Explainability Outcome (ITGRCA / Model Risk Governance)

- **Description**: Every AI signal is governed: model ID, version, training data lineage, features, output, confidence, HITL disposition, drift monitoring, challenger comparison, audit trail.
- **Why it matters in Indian banking**: ITGRCA Directions (`OBL-RBI-007` seq.) explicitly bring AI / ML in scope; MD on FRM 15-Jul-2024 mandates EWS that is increasingly AI-driven; RBI's growing model-risk expectation.
- **Persona most affected**: All three; the CRO and CCO would otherwise reject the AI; the IA tester needs to test the model.
- **Required evidence**: Model card per AIInsight; provenance graph from training data → feature → output; HITL log; drift metrics.
- **Example metric**: % of AI signals with full provenance / explainability metadata — target 100 %; % of AI insights overridden by HITL with documented rationale — monitored, not minimised.
- **Example user action**: PERSONA-002 reviews a flagged STR candidate, sees the AI's feature attributions, the HITL override option, and the model's quarterly back-test record.

---

## SECTION 5 — Top Product Questions Per Persona

These are the questions the product must answer **on day one** for each persona. Each question is grounded in Indian regulatory and operational reality and refers back to Pass 1 obligation IDs.

### 5.1 For PERSONA-001 — CRO / MD&CEO / Board Risk Committee Chair

- **Q-CRO-01**: Where am I outside risk appetite **today**, by domain, with drill-down to the underlying ProcessExecution / Subject?
- **Q-CRO-02**: Which control failures are trending toward an RBI finding or a Section 35A / 47A risk, ranked by likelihood and proximity?
- **Q-CRO-03**: Which senior management accountability areas (mine, MD&CEO, CCO, CISO, MLRO, HIA) have **evidence gaps** that would weaken a Fit & Proper or 47A defence?
- **Q-CRO-04**: Which processes are operating **outside designed parameters** — `documentation–reality drift` indicators by `PROC-KYC-001`, `PROC-LND-001`, `PROC-AML-001`, `PROC-UPI-001`, `PROC-COMP-001`, `PROC-VND-001`, `PROC-ITO-001`?
- **Q-CRO-05**: What is the current **residual risk position** across `R-CR`, `R-OP`, `R-CO`, `R-CD`, `R-TC`, `R-FC`, `R-TP`, `R-FR`, with the lineage from inherent → control → residual?
- **Q-CRO-06**: What is the bank's exposure to single-counterparty / group / sector / vendor concentration vs. `OBL-RBI-039` Large Exposures Framework today, intra-day if material?
- **Q-CRO-07**: Where are the AFI MRA / RMP / MAP / SPARC observations at risk of slippage, and what is the cost of slippage in the next AFI cycle?
- **Q-CRO-08**: What is the AML / financial-crime "near miss" picture — STR backlog, sanctions hits unresolved, mule-account remediation status, FIU-IND submission timeliness — that I would need to discuss with the SSM?
- **Q-CRO-09**: What is the operational resilience picture for **critical operations** — UPI rails, CBS, AML engine, sanctions tool, BPO L1 — including vendor 6-hr reporting and DR drill currency?
- **Q-CRO-10**: If RBI walked in tomorrow for an AFI or thematic review on KYC / AML / IT / Digital Lending / Fraud / Conduct / Outsourcing, what would the inspector see, and where would I be uncomfortable?

### 5.2 For PERSONA-002 — CCO / Head of ORM / MLRO–Principal Officer / Head of FC / Head of IT Risk

- **Q-CCO-01**: Which RBI / PMLA / IT-Act / DPDP / SEBI / IRDAI obligations are weakly covered by existing operating controls — coverage gaps with severity?
- **Q-CCO-02**: Which AML / STR obligations are at risk of a reporting breach this week — STR queue ageing > 7 working days, CTR not submitted by 15th, FMR > 14 days from fraud classification?
- **Q-CCO-03**: Which controls are degraded, failing, or evidence-thin — by `CTRL-ID`, by branch / product / channel / vendor?
- **Q-CCO-04**: Which regulatory areas lack **fresh, verifiable evidence** — e.g., 12-Jun-2025 KYC amendment 10 % BO threshold operationalised across legal-entity book?
- **Q-CCO-05**: Which RBI circulars / Master Directions issued in the last 90 days have **no corresponding control change / testing programme update**?
- **Q-CCO-06**: Which TPSPs / vendors are material under `OBL-RBI-016`–`OBL-RBI-021`, and which had reportable incidents in the last 90 days requiring 6-hr notification (`OBL-RBI-019`)?
- **Q-CCO-07**: What is the IT change / patch / incident posture under ITGRCA — backlog of P1/P2 incidents, change failure rate, patch coverage, DR drill currency?
- **Q-CCO-08**: What is the digital-lending compliance picture — KFS issuance rate, APR completeness, cooling-off operationalisation, DLG cap (`OBL-RBI-026`), CIMS reporting (`OBL-RBI-025`)?
- **Q-CCO-09**: Where are the supervisory observation-closure items — AFI MRA / RMP / MAP / CSITE / SPARC — at risk of slippage or repeat-finding?
- **Q-CCO-10**: What is the customer fairness / conduct picture — complaint patterns by product/channel; recovery practice complaints; mis-selling indicators (vulnerable-customer concentration)?

### 5.3 For PERSONA-003 — Compliance Officer / IA Manager / Concurrent Auditor / Control Tester

- **Q-IA-01**: Which controls in scope for this audit cycle can be **population-tested** (CBS / LOS / AML / ITSM data available) rather than sampled?
- **Q-IA-02**: Where are the exceptions in this cycle by control / branch / product / channel — ranked by severity, ageing, root-cause cluster?
- **Q-IA-03**: Which evidence records are **missing, stale, or unverifiable** — fetch from CBS / LOS / AML / ITSM with provenance, raise pending evidence requests?
- **Q-IA-04**: Can this test result be packaged as an **RBI inspection-ready workpaper** — test rationale, sample basis (or population basis), evidence appendix, finding write-up, signature?
- **Q-IA-05**: Which issues from prior cycles are still open and ageing, and which have been closed without positive re-test evidence (silent closure)?
- **Q-IA-06**: For each branch in my concurrent audit scope, which daily-cycle high-risk transactions warrant 100 % review today (cash > ₹10L threshold, large clearing, sensitive accounts)?
- **Q-IA-07**: For the AML / financial-crime sub-cycle, which alerts are aged > 7 working days, which STRs are pending review, and which UAPA hits are unresolved?
- **Q-IA-08**: For the digital-lending sub-cycle, which DLAs are missing CIMS registration, which loans had KFS gaps, which had cooling-off violations?
- **Q-IA-09**: For the IT / cyber sub-cycle, which changes in the last 90 days were P1/P2, which lacked back-out plans, which had failed and were not formally closed?
- **Q-IA-10**: Has this exception pattern been seen before — same UCIC / Loan / Vendor / Branch — and is it a repeat finding under AFI rules?

---

## SECTION 6 — MVP Persona Scope

Anchored to the **Wave 1 / Wave 2 / Wave 3 integration sequencing** noted in Pass 4 mapping:

- **Wave 1 (MVP)**: CBS + LOS + AML engine + Sanctions + Case Management + CKYCR.
- **Wave 2**: NPCI / UPI + ITSM + SIEM + FIU-IND outbound + CIMS + CRILC.
- **Wave 3**: VMO + CMS (Complaint Management System) + HRMS + Document Management + Telephony / ASR.

### 6.1 PERSONA-001 — Apex Risk Owner

#### Must-have (MVP / Wave 1)
- Cross-domain residual-risk picture across `R-CR` / `R-CO` / `R-FC` / `R-TC` / `R-OP` (others in stub).
- Drill-down from any KRI / appetite metric to underlying ProcessExecution / Subject (UCIC / Loan / Alert / Change).
- AFI MRA / RMP / MAP / SPARC tracker with evidence.
- Senior-management accountability ledger for KYC / AML / IT / Digital Lending decisions.
- Bi-temporal queryability for any historical state.
- Inspection-pack auto-assembly for KYC, AML, Digital Lending (Wave 1 sources).

#### Should-have (next release / Wave 2)
- UPI risk picture (mule / fraud) — needs NPCI integration.
- IT change / incident / patch posture from ITSM / SIEM.
- CIMS / CRILC submission and supervisory letter integration.
- FIU-IND outbound submission acks integrated.

#### Later-stage (Wave 3)
- Vendor / TPSP risk register fully integrated (VMO).
- Customer complaint pattern (CMS) — conduct lens for the CRO.
- HRMS-linked accountability (who, role, attestation).
- Document Management chain-of-custody for all attestations.
- Telephony / ASR for recovery-agent / mis-selling conduct lens.

#### Not needed in MVP
- Bespoke ICAAP / ILAAP modelling engine (continue with existing).
- Trading-book market-risk engine (out of scope; mid-sized PB already has Murex / Calypso).
- Treasury / ALM modelling.

### 6.2 PERSONA-002 — Functional Risk & Compliance Leadership

#### Must-have (MVP / Wave 1)
- Live Obligation Coverage Matrix for `OBL-RBI-001`–`OBL-RBI-029` and `OBL-PMLA-001`–`OBL-PMLA-005`, `OBL-FIU-001`.
- Population-level testing for KYC, AML, Lending controls.
- AML alert ageing and STR queue.
- Sanctions / UAPA hit register.
- Reporting timeliness clock for CTR, STR (offline submission via FIU-IND outbound stub in Wave 1).
- Evidence freshness clock for each obligation.

#### Should-have (next release / Wave 2)
- ITGRCA control surface — change management, incident management, patch posture.
- CSITE / CERT-In incident reporting workflow with 6-hr clock.
- CIMS digital lending DLA register; CRILC.
- UPI / NPCI mule-pattern detection integration.
- FIU-IND outbound submission auto-routing.

#### Later-stage (Wave 3)
- Vendor / TPSP register with materiality scoring; 6-hr re-notification trigger.
- Customer complaints lens — CMS integration; conduct-risk auto-tagging.
- Telephony / ASR for recovery agent / mis-selling control testing.
- HRMS-linked control-owner allocation.

#### Not needed in MVP
- Auto-filing of regulatory submissions (HITL retained until trust is established).
- AI-driven regulatory interpretation (suggestion-only allowed; binding interpretation rejected).
- Auto-classification of customer as PEP / sanctioned (HITL retained).

### 6.3 PERSONA-003 — Day-to-Day Tester

#### Must-have (MVP / Wave 1)
- Population query for KYC / AML / Lending controls against CBS + LOS + AML engine + CKYCR.
- Sample-on-demand for any control (auditor specifies sampling rationale).
- Workpaper generator with citation, evidence appendix, signature line.
- Issue lifecycle tracker.
- Auto-fetch evidence from CBS / LOS / AML / CKYCR / Sanctions / Case Mgmt with provenance.
- Pre-built tests for top-50 controls (Wave-1 RCM coverage).

#### Should-have (next release / Wave 2)
- Population query against UPI / NPCI flows.
- IT change / incident / patch tests against ITSM / SIEM.
- CIMS-related tests for digital lending population.
- Concurrent audit daily-cycle workspace (high-risk transaction review at 100 %).

#### Later-stage (Wave 3)
- Vendor / TPSP control testing (incidents, SLA, exit drill).
- CMS / complaints conduct testing.
- Telephony / ASR for recovery-agent / mis-selling sample testing.
- HRMS-integrated 4-eye / segregation-of-duties testing.

#### Not needed in MVP
- AI auto-closure of exceptions (HITL retained).
- AI-generated regulatory interpretation in workpapers (regulatory text quoted, not paraphrased).
- Bespoke statistical sampling engine for non-population tests (use library defaults).

---

## SECTION 7 — Design Principles

These principles are non-negotiable for the platform. Every screen, every signal, every API must satisfy them.

1. **Evidence-first, not dashboard-first.** Every metric must drill to the underlying record (UCIC / Loan / Alert / Change / Vendor) in one click. No metric without evidence path.

2. **Control operation over control documentation.** Show whether a control is **operating** in production, not whether the RCM document exists. ControlInstance > Control.

3. **Population testing over sample-only concurrent audit.** Default to population testing where data is available; sample only when impossible. Even when sampling, sampling rationale is captured in the workpaper.

4. **Explainable AI only — every signal cites its source data.** Model card per AIInsight: model ID, version, features, confidence, HITL disposition, drift metrics, challenger comparison. Black-box scoring is never displayed.

5. **Every metric must drill to evidence.** Numbers without lineage are not displayed. If the data is unavailable, show "data gap" — never approximate.

6. **Every issue must link to an obligation, a control, and an accountable owner.** Issues are not free-form; they are nodes in the graph with edges to OBL, CTRL, Process, Owner, Evidence.

7. **Every screen must answer a real persona question.** Each screen must satisfy at least one Q-CRO / Q-CCO / Q-IA. Screens without a question owner are removed.

8. **No vanity charts.** No "compliance score" without component-level breakdown; no "risk heat-map" without underlying transaction lineage; no aggregate metric that hides branch / product / vendor concentration.

9. **No generic GRC spreadsheet experience.** No row-by-row attestation campaigns, no PDF certificates as primary output. The platform is process-observability first; documents are by-products.

10. **No static RCM that becomes stale within 30 days.** RCM is a graph projection, recomputed on every regulation / control / evidence change. Versioned, bi-temporal, replayable.

11. **RBI inspection-ready output at all times — not retrospectively assembled.** Inspection packs are one-click, hashed, immutable. No 14-day data-call scramble.

12. **Indian regulatory stack as first-class citizen.** PMLA / FIU-IND / CKYCR / CERSAI / CIMS / CRILC / NPCI / UIDAI / DigiLocker / AA / CERT-In / DPDP are first-class connectors. Cadences and formats encoded natively.

13. **Bi-temporality is a first-class feature.** Every fact has both `valid_time` (when true in the world) and `system_time` (when the platform knew it). Audit defence and forensic reconstruction depend on this.

14. **Senior management accountability is a first-class feature.** Decision logs, attestation events, evidence available at decision-time, are graph nodes. Reasonable-steps defence is built-in, not retrofitted.

15. **Append-only, tamper-evident evidence.** No silent overwrite. Re-classification, override, and reversal are events; previous state is preserved.

16. **Human-in-the-loop is the default for regulator-facing decisions.** AI proposes; the regulated officer disposes. Auto-filing of STR / SCN / FMR / RFA / CTR is rejected as MVP scope.

17. **Reproducibility of every test.** Re-running a test against the same period yields the same result. Workpapers are reproducible.

18. **No hidden vendor lock-in on regulated data.** Submissions to FIU-IND / CIMS / CRILC / CSITE / CERT-In are exportable in regulator-mandated formats. Bank retains ownership of evidence.

---

## SECTION 8 — Final Handoff

This section is the clean, condensed handoff to **Pass 2 (Process Reality)**, **Pass 3 (Product Ontology)**, and **Pass 4 (RCM + Field Definitions + AI Signals + UI Mapping)**.

### 8.1 Final selected personas

- **PERSONA-001** — Apex Risk Owner (CRO / MD&CEO / BRMC Chair) — primary CRO archetype with shared decision-rights.
- **PERSONA-002** — Functional Risk & Compliance Leadership (CCO / Head of ORM / MLRO–Principal Officer / Head of Financial Crime / Head of IT Risk) — second-line conjoint accountability.
- **PERSONA-003** — Day-to-Day Tester (Compliance Officer / IA Manager / Concurrent Auditor / Control Tester) — third-line and concurrent execution.

### 8.2 Persona goals — concise

- **PERSONA-001**: Defensible enterprise risk position, always inspection-ready, with reasonable-steps accountability for self and senior team.
- **PERSONA-002**: Live Obligation Coverage Matrix, population-tested controls, zero reporting breaches, auto-ingested regulatory change, real-time supervisory observation closure.
- **PERSONA-003**: Population-level testing, workpaper-grade evidence trail, continuous concurrent audit, issue lifecycle with positive re-test closure.

### 8.3 Top 3 questions per persona

- **PERSONA-001**: Q-CRO-01 (where am I outside appetite today?); Q-CRO-02 (which control failures trend to RBI risk?); Q-CRO-10 (if RBI walked in tomorrow, what would they see?).
- **PERSONA-002**: Q-CCO-01 (which obligations are weakly covered?); Q-CCO-02 (which AML / STR reporting is at risk of breach?); Q-CCO-09 (which AFI MRA / RMP / MAP items are at risk of slippage?).
- **PERSONA-003**: Q-IA-01 (which controls can be population-tested?); Q-IA-02 (where are the exceptions?); Q-IA-04 (can this be packaged as an RBI inspection-ready workpaper?).

### 8.4 Unified outcome model — summary

| Outcome | Description (1-line) | Primary Persona |
|---|---|---|
| OUT-001 | Process auditability (PE→SE→CI→Evidence chain). | PERSONA-003 |
| OUT-002 | Control observability (operation, not documentation). | PERSONA-002 |
| OUT-003 | Evidence completeness (fresh, verifiable, tamper-evident). | PERSONA-002 |
| OUT-004 | Issue remediation (lifecycle with positive re-test). | All |
| OUT-005 | Senior-management accountability (RBI governance / Fit & Proper). | PERSONA-001 |
| OUT-006 | Inspection readiness (AFI / SPARC / CSITE / FIU-IND). | PERSONA-001 |
| OUT-007 | Population-level testing (no sampling where data exists). | PERSONA-003 |
| OUT-008 | Customer fairness (FPC / CCR; KFS / APR / recovery / mis-selling). | PERSONA-002 |
| OUT-009 | Operational resilience (critical operations / ITGRCA / cyber). | PERSONA-002 |
| OUT-010 | AI trust and explainability (ITGRCA / model-risk governance). | All |

### 8.5 MVP persona priorities

- **MVP P0 (Wave 1)**: PERSONA-001 + PERSONA-002 must be fully served end-to-end across KYC / AML / Lending domains using CBS + LOS + AML engine + Sanctions + Case Management + CKYCR.
- **MVP P1 (Wave 1)**: PERSONA-003 must have population-testing for the same domains; full population testing for UPI / IT in Wave 2.
- **Wave 2**: NPCI / UPI + ITSM + SIEM + FIU-IND outbound + CIMS + CRILC enable PERSONA-002 IT/digital-lending coverage and PERSONA-001 UPI risk view.
- **Wave 3**: VMO + CMS + HRMS + DM + Telephony enable Conduct + Outsourcing lenses for all three personas.

### 8.6 Design principles — list

1. Evidence-first, not dashboard-first.
2. Control operation over control documentation.
3. Population testing over sample-only concurrent audit.
4. Explainable AI only — every signal cites source data.
5. Every metric drills to evidence.
6. Every issue links to obligation + control + accountable owner.
7. Every screen answers a real persona question.
8. No vanity charts.
9. No generic GRC spreadsheet experience.
10. No static RCM that goes stale.
11. RBI inspection-ready output at all times.
12. Indian regulatory stack as first-class citizen.
13. Bi-temporality first-class.
14. Senior-management accountability first-class.
15. Append-only, tamper-evident evidence.
16. Human-in-the-loop default for regulator-facing decisions.
17. Reproducibility of every test.
18. No hidden vendor lock-in on regulated data.

### 8.7 Product direction for downstream passes

#### → Pass 2 (Process Reality Model)
The persona model demands process-execution detail at the **PE → SE → CI → EvidenceRecord** level for `PROC-KYC-001`, `PROC-LND-001`, `PROC-AML-001`, `PROC-UPI-001`, `PROC-COMP-001`, `PROC-VND-001`, `PROC-ITO-001`. Pass 2 must (already does) document:
- Where drift occurs at each step (BPO, branch, system).
- Auto vs. manual execution at activity level.
- Failure-mode tagging compatible with anomaly-detection AI.
- Cross-process handoffs (KYC → Lending; KYC ↔ AML; UPI → AML).
- Evidence-record types per step suitable for OUT-001 / OUT-003 / OUT-007.

#### → Pass 3 (Product Ontology / Knowledge Graph)
The persona model demands the ontology to support:
- Bi-temporality (every fact has `valid_time` + `system_time`) — for OUT-005 (accountability) and OUT-006 (inspection readiness).
- Append-only event log — for tamper-evident evidence and Principle 15.
- AI insights as first-class graph nodes with provenance — for OUT-010 and Principle 4.
- Versioned design-time entities (Regulation, Obligation, Risk, Process, Step, Control, AppetiteMetric, KRI) — for Principle 10 (no static RCM).
- Subject-typed entities (Customer / Loan / Alert / Vendor / Change) — for drill-down per Principle 5.
- Decision / Attestation / SeniorManager event types — for OUT-005.
- Issue / ActionTask state machines with re-test edges — for OUT-004 and Principle 6.

#### → Pass 4 (RCM + Field Definitions + AI Signals + UI Mapping)
The persona model demands the RCM and AI signal layer to support:
- Population-test specifications per CTRL — for OUT-007.
- Evidence-freshness clocks per OBL — for OUT-003.
- Reporting-timeliness clocks per submission type (CTR / STR / FMR / RFA / CSITE / CERT-In / CIMS / CRILC) — for OUT-006 / Q-CCO-02.
- Persona-specific UI screens mapped to persona questions (Q-CRO / Q-CCO / Q-IA) — for Principle 7.
- Wave 1 / 2 / 3 source-system mapping for the MVP scope in Section 6.
- AI signal taxonomy: anomaly, coverage gap, freshness gap, reporting risk, accountability gap, model-risk-governed in all cases — for OUT-010.
- Workpaper-template definitions — for OUT-007 / OUT-001 / OUT-003 / Q-IA-04.
- Inspection-lens definitions for AFI / SPARC / CSITE / FIU-IND / Statutory / Concurrent — for OUT-006 / Q-CRO-10.

---

**End of UI Pass 1 — Persona and Goals Specification.**

*Next pass: this document is the input to the persona-screen mapping and the workspace inventory in the upcoming UI Pass 2 (Persona Workspaces and Screen Inventory).*
