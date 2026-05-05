FILE 1 — Final RCM (Sample, Mid-Sized Indian Private Bank)

Header \& conventions



All IDs follow Pass 1–3 schemas (R-\*, OBL-\*, CTRL-\*, PROC-\*, STEP-\*, ISS-\*, AI-\*, CI-\*, EV-\*).

Multi-value cells: ;-separated.

22 sample rows: KYC ×5, Lending ×5, AML ×5, UPI ×2, Complaints ×1, Vendor ×2, IT Ops ×2.

Two master tables share the Control ID join key (markdown width constraint). Detail blocks expand 4 representative rows. One worked drilldown at the end.



Master Table A — Process / Risk / Control Identity

Control IDProcessSub-ProcessStepRisk IDRisk DomainInh. ImpactControl TitleCTRL-KYC-001Customer OnboardingCDD activation gateSTEP-KYC-08R-FC-001Financial CrimeVery High4-eye CDD verification before account activationCTRL-KYC-002Customer OnboardingSanctions screeningSTEP-KYC-06R-FC-001Financial CrimeVery HighReal-time sanctions / PEP / adverse-media screening at onboardingCTRL-KYC-003Customer OnboardingPeriodic re-KYCSTEP-KYC-09R-FC-001Financial CrimeHighPeriodic KYC re-update workflow auto-trigger (HRC 2y / MRC 8y / LRC 10y)CTRL-KYC-004Customer OnboardingBeneficial ownerSTEP-KYC-04R-FC-001Financial CrimeHighBO threshold enforcement (10% partnership / 25% co. / trust protector)CTRL-KYC-005Customer OnboardingCKYCR uploadSTEP-KYC-08R-FC-001Financial CrimeMediumCKYCR upload completeness within prescribed windowCTRL-LND-001Retail Loan OriginationBureau pullSTEP-LND-03R-CR-001CreditHighMandatory bureau pull pre-credit-decisionCTRL-LND-002Retail Loan OriginationKFS issuanceSTEP-LND-06R-CD-001ConductHighKFS pre-acceptance with APR completeness on RE letterheadCTRL-LND-003Retail Loan OriginationPolicy exceptionSTEP-LND-05R-CR-001CreditHighPolicy exception 4-eye approval with coded rationaleCTRL-LND-004Retail Loan OriginationIRACP taggingSTEP-LND-09R-CR-001CreditVery HighSystem-driven IRACP day-end tagging without manual overrideCTRL-LND-005Retail Loan OriginationEWS / RFASTEP-LND-09R-FR-001FraudHighEWS / RFA flagging integrated with CBS in real-timeCTRL-AML-001AML MonitoringSanctions screeningSTEP-AML-02R-FC-001Financial CrimeVery HighReal-time payment sanctions screening (UAPA + UN + OFAC)CTRL-AML-002AML MonitoringAlert SLASTEP-AML-04R-FC-001Financial CrimeVery HighTM scenario coverage attestation + alert SLA enforcementCTRL-AML-003AML MonitoringSTR filingSTEP-AML-07R-FC-001Financial CrimeVery HighSTR filing within 7 working days of suspicion (FIU-IND FINnet 2.0)CTRL-AML-004AML MonitoringModel validationgovernanceR-MR-001ModelHighTM model annual independent validationCTRL-AML-005AML MonitoringMule detectionSTEP-AML-03R-FR-001FraudVery HighMule account graph / network pattern detectionCTRL-UPI-001UPI PaymentsFraud scoringSTEP-UPI-03R-FR-001FraudVery HighReal-time UPI fraud scoring \& velocity checkCTRL-UPI-002UPI PaymentsDispute handlingSTEP-UPI-05R-OP-001OperationalMediumUPI dispute / chargeback SLA tracking (NPCI URC)CTRL-COMP-001ComplaintsIO reviewSTEP-COMP-04R-CD-001ConductHighInternal Ombudsman review of all wholly-rejected complaintsCTRL-VND-001Vendor OutsourcingMaterial registerSTEP-VND-01R-TP-001VendorHighMaterial outsourcing register quarterly attestationCTRL-VND-002Vendor OutsourcingTPSP cyberSTEP-VND-06R-TC-001Tech / CyberVery HighTPSP cyber-incident 6-hr forwarding to RBI / CERT-InCTRL-ITO-001IT OperationsCyber reportingSTEP-ITO-06R-TC-001Tech / CyberVery HighCyber incident 6-hr reporting to CERT-In + RBI CSITECTRL-ITO-002IT OperationsPrivileged accessSTEP-ITO-08R-TC-001Tech / CyberHighPrivileged access quarterly review + orphan account remediation

Master Table B — Control Characteristics + Execution + Evidence + Regulatory + Product Fields

Control IDTypeNatureFrequencyCES%EvComp%RT VisSource SystemsEvidence TypesRBI ObligationsOpen IssuesAI SignalsCTRL-KYC-001PreventiveITDMper-customer7882PartialKYC\_workflow; CRM; CBSEVD-LOG; EVD-SIGNOBL-RBI-001;OBL-RBI-005ISS-2026-031AI-002;AI-005CTRL-KYC-002PreventiveAutomatedper-customer + on-list-update8891Yesscreening\_tool; CKYCREVD-LOGOBL-RBI-050ISS-2026-040AI-004;AI-013CTRL-KYC-003DetectiveAutomatedrisk-based (2y/8y/10y)6471Norisk\_engine; AML\_engine; CRMEVD-LOG; EVD-DOCOBL-RBI-002ISS-2026-061\*AI-006;AI-016CTRL-KYC-004PreventiveITDMper-legal-entity7065PartialCRM; MCA\_API; CKYCREVD-DOC; EVD-SIGNOBL-RBI-005ISS-2026-023AI-014CTRL-KYC-005DetectiveAutomatedper-customer8688YesCKYCR; workflowEVD-LOGOBL-RBI-003—AI-005CTRL-LND-001PreventiveAutomatedper-application9596YesLOS; CIBIL/CRIF/Experian/Equifax; AAEVD-LOGOBL-RBI-038—AI-004CTRL-LND-002PreventiveAutomatedper-loan7378PartialLOS; e-sign; DLA; CIMSEVD-DOC; EVD-SIGN; EVD-LOGOBL-RBI-022;OBL-RBI-027ISS-2026-085\*AI-013CTRL-LND-003PreventiveITDMper-exception7268PartialLOS; policy\_engineEVD-LOG; EVD-ATTESTOBL-RBI-051—AI-002;AI-004CTRL-LND-004DetectiveAutomateddaily9295YesCBS; loan\_servicingEVD-LOG; EVD-RECONOBL-RBI-036;OBL-RBI-038—AI-004;AI-017CTRL-LND-005DetectiveAutomatedcontinuous6870PartialEWS\_engine; CBS; CRILCEVD-LOGOBL-RBI-031;OBL-RBI-032—AI-004;AI-017CTRL-AML-001PreventiveAutomatedper-transaction9092Yesscreening\_tool; CBS; NEFT/RTGS gatewayEVD-LOGOBL-RBI-050ISS-2026-007AI-004CTRL-AML-002PreventiveManualannual + on-product-launch6560NoAML\_engine; case\_mgmtEVD-DOC; EVD-ATTESTOBL-PMLA-001ISS-2026-009;ISS-2026-052;ISS-2025-088AI-002;AI-018CTRL-AML-003CorrectiveManualper-case7680Partialcase\_mgmt; FIU-IND FINnet 2.0EVD-LOG; EVD-DOCOBL-PMLA-001—AI-011CTRL-AML-004DetectiveManualannual7072NoMRM\_repo; case\_mgmtEVD-DOC; EVD-ATTESTOBL-PMLA-001ISS-2026-029;ISS-2026-044;ISS-2026-051AI-018CTRL-AML-005DetectiveAutomatedcontinuous5862PartialAML\_engine; UPI\_feed; NPCI\_feedbackEVD-LOGOBL-RBI-004;OBL-RBI-031ISS-2026-061\*AI-001CTRL-UPI-001PreventiveAutomatedper-transaction8185Yesfraud\_engine; NPCI; UPI\_appEVD-LOGOBL-RBI-031;NPCI-PGISS-2026-061\*AI-001CTRL-UPI-002DetectiveITDMcontinuous7580Partialdispute\_portal; NPCI URC; CMSEVD-LOG; EVD-DOCDPSS circulars—AI-005CTRL-COMP-001DetectiveManualper-rejected-complaint7065NoIO\_workflow; CMSEVD-DOC; EVD-ATTESTRB-IOS 2021ISS-2026-079\*AI-007;AI-008CTRL-VND-001DetectiveManualquarterly7268NoVMO\_tool; contracts\_repoEVD-DOC; EVD-ATTESTOBL-RBI-016;OBL-RBI-020ISS-2026-027;ISS-2025-098AI-009CTRL-VND-002CorrectiveITDMper-event6570PartialVMO\_tool; ITSM; SIEMEVD-LOG; EVD-DOCOBL-RBI-019;OBL-RBI-048ISS-2026-035AI-009CTRL-ITO-001CorrectiveManualper-event6065PartialITSM; SIEM; CERT-In portalEVD-LOG; EVD-DOCOBL-RBI-013;OBL-RBI-048—AI-002;AI-019CTRL-ITO-002DetectiveITDMquarterly7875NoIAM; AD; PAM; HR\_systemEVD-LOG; EVD-ATTESTOBL-RBI-007;OBL-RBI-014ISS-2026-073\*AI-009;AI-019

\* ISS-2026-061 (UPI mule spike), ISS-2026-073 (privileged orphan accounts post-attrition), ISS-2026-079 (complaint mis-categorisation), ISS-2026-085 (KFS post-acceptance pattern in DSA channel) are introduced in this brief as India-specific extensions to the Pass 2 issue register.



Per-Control Detail Blocks (4 representative rows)

These expanded blocks show every Pass 3 entity link for one control. The MVP UI should render any control row this way on click-through.

CTRL-AML-002 — TM scenario coverage attestation + alert SLA enforcement

Process layer

&#x20; Process            : PROC-AML-001 (AML Transaction Monitoring \& Alert Disposition)

&#x20; Sub-Process        : Alert SLA enforcement

&#x20; Step               : STEP-AML-04 (L1 Alert Triage)

&#x20; Step type          : manual

&#x20; Expected actor     : bpo\_l1 / FCC analyst (reality: heavily outsourced)



Risk layer

&#x20; Risk ID            : R-FC-001

&#x20; Risk title         : AML Alert Disposition \& SAR Filing Risk

&#x20; Risk domain        : Financial Crime

&#x20; Inherent rating    : Very High

&#x20; Residual rating    : High (computed; worsening)

&#x20; Linked appetite    : APP-FC-002 (alert backlog %) — currently RED 6.1%

&#x20; Linked KRIs        : KRI-FC-016 (backlog %); KRI-FC-017 (L3 case aging)



Control layer

&#x20; Control type       : Preventive (coverage) + Detective (SLA)

&#x20; Control nature     : Manual (coverage attestation); ITDM (SLA dashboards)

&#x20; Frequency          : annual coverage attestation; per-case SLA enforcement

&#x20; Owner              : Head of FCC (1LoD); CCO (2LoD oversight)

&#x20; Operator           : FCC L1/L2 investigators (often BPO)

&#x20; Designed condition : "L1 alerts dispositioned within 5 BD; L2 within 15 BD; L3 within 30 BD; coverage matrix valid for current product/channel set"



Execution layer (ControlInstance signals — last 30 days)

&#x20; Total instances    : 3,71,228 alerts triaged

&#x20; Pass               : 2,68,492

&#x20; Fail (SLA breach)  :   78,011  (21%)

&#x20; Override           :    2,144

&#x20; Pending            :   22,581

&#x20; Avg latency        :   62 hours (target ≤ 40)

&#x20; CES (rolling 13w)  : 65% — declining slope -8 pts in 13 weeks



Evidence layer

&#x20; Evidence types     : EVD-LOG (case\_mgmt audit trail); EVD-DOC (closure narratives); EVD-ATTEST (annual coverage matrix)

&#x20; Completeness       : 60% — declining (template narratives)

&#x20; Hash-verified      : Yes for EVD-LOG; No for EVD-DOC

&#x20; Source             : case\_mgmt (Oracle FCCM); coverage matrix (SharePoint → migrate)

&#x20; Real-time vis.     : No (matrix annual); Partial (SLA dashboards weekly)



Regulatory layer

&#x20; Linked obligations : OBL-PMLA-001 (STR within 7 working days)

&#x20;                      OBL-FIU-001 (PO/DD designation)

&#x20;                      OBL-RBI-053 (KYC AML aggregate)



Product fields

&#x20; Effectiveness      : 65% (decay trend; AI-018 alert active)

&#x20; Audit trail        : Full event-sourced (Pass 3 §3.2); replay supported

&#x20; Issue linkage      : ISS-2026-009; ISS-2026-052; ISS-2025-088

&#x20; AI signals         : AI-002 (process drift — STEP-AML-05 bypass detected, 7%)

&#x20;                      AI-018 (effectiveness decay — CES decline)

&#x20; Drillability       : Risk → Control → 78,011 failing CIs → per-CI evidence

CTRL-LND-002 — KFS pre-acceptance with APR completeness

Process layer

&#x20; Process            : PROC-LND-001 (Retail Loan Origination)

&#x20; Sub-Process        : KFS issuance

&#x20; Step               : STEP-LND-06 (KFS Generation \& Borrower Acceptance)



Risk layer

&#x20; Risk ID            : R-CD-001

&#x20; Risk domain        : Conduct

&#x20; Inherent impact    : High

&#x20; Residual rating    : Medium (worsening in DSA channel)



Control layer

&#x20; Type               : Preventive

&#x20; Nature             : Automated

&#x20; Frequency          : per-loan

&#x20; Designed condition : "KFS digitally signed on RE letterhead; APR-complete; displayed BEFORE borrower acceptance event"



Execution layer (ControlInstance signals — last 30 days)

&#x20; Total instances    : 47,892 loans

&#x20; Pass               : 35,061  (73%)

&#x20; Timestamp violation: 11,118  (KFS\_issued\_at > borrower\_acceptance\_at — DSA channel concentrated)

&#x20; Override           :     713

&#x20; CES (rolling 13w)  : 73% — flat last 4w



Evidence layer

&#x20; Types              : EVD-DOC (KFS PDF); EVD-SIGN (e-sign); EVD-LOG (CIMS submission)

&#x20; Completeness       : 78% — gap on APR breakdown for embedded insurance premium

&#x20; Source             : LOS (Newgen); e-sign (NSDL); DLA mobile; CIMS portal



Regulatory layer

&#x20; OBL-RBI-022 (KFS pre-acceptance)

&#x20; OBL-RBI-027 (Penal charges separation)

&#x20; OBL-RBI-025 (CIMS reporting)



Product fields

&#x20; Audit trail        : Event-sourced; KFS hash chain in escrow (regulator-defensible)

&#x20; Issue linkage      : ISS-2026-085 (KFS post-acceptance pattern in DSA channel — new India-specific)

&#x20; AI signals         : AI-013 (KFS timestamp ordering anomaly detector)

&#x20; Drillability       : Risk → Control → 11,118 timestamp-violating CIs → KFS document hashes → DSA agent attribution

CTRL-UPI-001 — Real-time UPI fraud scoring \& velocity check

Process layer

&#x20; Process            : PROC-UPI-001

&#x20; Step               : STEP-UPI-03



Risk layer

&#x20; Risk ID            : R-FR-001

&#x20; Domain             : Fraud

&#x20; Inherent impact    : Very High

&#x20; Linked appetite    : APP-FR-001 (UPI fraud loss / quarter)



Control layer

&#x20; Type               : Preventive

&#x20; Nature             : Automated (synchronous, sub-200ms)

&#x20; Frequency          : per-transaction

&#x20; Designed condition : "Score every initiated UPI transaction; threshold ≥ τ blocks or step-ups; sub-second latency"



Execution layer (ControlInstance signals — last 30 days)

&#x20; Total instances    : 1.48 billion transactions scored

&#x20; Score-blocked      : 2.1M  (0.14%)

&#x20; Score-stepup       : 6.4M  (0.43%)

&#x20; Pass               : 1.47B

&#x20; Fraud confirmed (NPCI feedback): 18,392 (FN rate \~ 0.27% of fraud cohort)

&#x20; CES (rolling 13w)  : 81%



Evidence layer

&#x20; Types              : EVD-LOG (score per transaction; immutable)

&#x20; Completeness       : 85%

&#x20; Source             : fraud\_engine (in-house); NPCI feedback API

&#x20; RT visibility      : Yes — full real-time dashboard



Regulatory layer

&#x20; OBL-RBI-031 (EWS)

&#x20; OBL-RBI-035 (Data Analytics MIU)

&#x20; NPCI Procedural Guidelines (parallel obligation source)



Product fields

&#x20; Audit trail        : Append-only event store; per-transaction score retained 7 years

&#x20; Issue linkage      : ISS-2026-061 (UPI mule account spike, India-specific)

&#x20; AI signals         : AI-001 (mule network detection — graph ML); AI-004 (anomaly on novel patterns)

&#x20; Drillability       : Risk → Control → flagged transactions → mule cluster → linked Subjects (multiple UCICs) → KYC chain

CTRL-VND-002 — TPSP cyber-incident 6-hr forwarding

Process layer

&#x20; Process            : PROC-VND-001

&#x20; Step               : STEP-VND-06



Risk layer

&#x20; Risk ID            : R-TC-001 + R-TP-001

&#x20; Inherent impact    : Very High



Control layer

&#x20; Type               : Corrective

&#x20; Nature             : ITDM

&#x20; Frequency          : per-event

&#x20; Designed condition : "On TPSP cyber incident notification, forward to RBI CSITE + CERT-In within 6 hours"



Execution layer (ControlInstance signals — last 12 months)

&#x20; Total instances    : 14 (TPSP-side incidents)

&#x20; Within 6hr         : 9

&#x20; Beyond 6hr         : 5  (typically weekend / off-hours awareness)

&#x20; CES                : 65%



Evidence layer

&#x20; Types              : EVD-LOG (ITSM ticket); EVD-DOC (CERT-In submission template); EVD-DOC (RBI CSITE template)

&#x20; Completeness       : 70%

&#x20; Source             : ITSM (ServiceNow); CERT-In portal; RBI reporting template (manual today)

&#x20; RT visibility      : Partial



Regulatory layer

&#x20; OBL-RBI-019 (TPSP 6-hr to RE → RBI)

&#x20; OBL-RBI-048 (CERT-In 6-hr)

&#x20; OBL-RBI-013 (RBI CSITE 2-6 hr)



Product fields

&#x20; Audit trail        : Event-sourced; clock-anchor reconstruction (start = "awareness")

&#x20; Issue linkage      : ISS-2026-035

&#x20; AI signals         : AI-009 (vendor signal aggregation); AI-019 (incident clock unification \& reporting-window predictor)

&#x20; Drillability       : Risk → Control → late-reported instances → TPSP → contract clauses → regulator submissions



Drillability — Worked Example

The graph traversal that the UI must support, end-to-end, demonstrated for R-FC-001:

R-FC-001 (AML Alert Disposition \& SAR Filing Risk)

&#x20; │  residual: High; trend: worsening; appetite APP-FC-002 in RED

&#x20; │

&#x20; ├── :MITIGATES ── CTRL-AML-002 (TM coverage + SLA)               CES 65% ▼

&#x20; │                  │

&#x20; │                  ├── 3,71,228 ControlInstances (last 30d)

&#x20; │                  │     ├── 2,68,492 PASS

&#x20; │                  │     └── 78,011 FAIL  (SLA breach)

&#x20; │                  │           │

&#x20; │                  │           └── for any FAIL CI, click through to:

&#x20; │                  │                  - StepExecution (which alert, which subject)

&#x20; │                  │                  - EvidenceRecord (case\_mgmt log + closure narrative)

&#x20; │                  │                  - Actor (which BPO L1; which queue)

&#x20; │                  │                  - Subject (which Customer/UCIC) → cross-process view

&#x20; │                  │

&#x20; │                  └── :BREACHES (via Issues) ─→ OBL-PMLA-001

&#x20; │                  └── :FOUND\_IN ─→ ISS-2026-009 / ISS-2026-052 (Capacity)

&#x20; │                  └── :DETECTED\_BY ─→ AIINS-2026-04-aml-decay (AI-018)

&#x20; │

&#x20; ├── :MITIGATES ── CTRL-AML-003 (STR filing 7BD)                  CES 76%

&#x20; ├── :MITIGATES ── CTRL-AML-004 (TM model annual validation)      CES 70% ▼

&#x20; └── :MITIGATES ── CTRL-AML-005 (Mule pattern detection)          CES 58% — newest

&#x20;                    └── shares Subjects with CTRL-UPI-001 (graph join)

The MVP UI must render this drilldown in ≤ 4 clicks: Risk pane → Control pane → ControlInstance grid → per-CI detail with embedded evidence viewer.

