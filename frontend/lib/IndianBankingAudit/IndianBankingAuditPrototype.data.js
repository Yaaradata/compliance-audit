export const mockData = {

  personas: [
    { persona_id: "PERSONA-001", code: "cro", title: "CRO / MD&CEO / BRMC Chair", default_screen: "riskPosture", persona_questions: ["Q-CRO-01 Where are we outside risk appetite today?", "Q-CRO-02 Which control failures could become RBI findings?", "Q-CRO-03 Which senior accountability areas have evidence gaps?", "Q-CRO-10 If RBI walked in tomorrow what would they see?"] },
    { persona_id: "PERSONA-002", code: "compliance", title: "CCO / Head of ORM / MLRO–PO / Head of FC / Head of IT Risk", default_screen: "obligationCoverage", persona_questions: ["Q-CCO-01 Which RBI obligations are weakly covered?", "Q-CCO-03 Which controls are degraded, failing, or evidence-thin?", "Q-CCO-04 Which regulatory areas lack fresh, verifiable evidence?", "Q-CCO-09 Which AFI MRA/RMP/MAP items are at risk of slippage?"] },
    { persona_id: "PERSONA-003", code: "audit", title: "IA Manager / Concurrent Auditor / Control Tester", default_screen: "populationTesting", persona_questions: ["Q-IA-01 Which controls can be population-tested?", "Q-IA-02 Where are the exceptions in this cycle?", "Q-IA-03 Which evidence records are missing, stale, or unverifiable?", "Q-IA-04 Can this be packaged as an RBI inspection-ready workpaper?"] }
  ],

  navigationItems: [
    { nav_id: "NAV-N-01", label: "Risk Posture", icon_name: "shield-alert", default_screen: "riskPosture", persona_default_for: ["cro"], wave: 1, enabled_flag: true, screens_inside: ["riskPosture", "whatChanged"], entity_anchor: "Risk" },
    { nav_id: "NAV-N-02", label: "Inspection Packs", icon_name: "clipboard-check", default_screen: "inspectionReadiness", persona_default_for: ["cro", "compliance"], wave: 1, enabled_flag: true, screens_inside: ["inspectionReadiness"], entity_anchor: "AuditPack" },
    { nav_id: "NAV-N-03", label: "Obligations & Controls", icon_name: "gavel", default_screen: "obligationCoverage", persona_default_for: ["compliance"], wave: 1, enabled_flag: true, screens_inside: ["obligationCoverage", "controlUniverse", "controlDrillDown"], entity_anchor: "Obligation" },
    { nav_id: "NAV-N-04", label: "Processes", icon_name: "workflow", default_screen: "processHealth", persona_default_for: ["compliance"], wave: 1, enabled_flag: true, screens_inside: ["processHealth"], entity_anchor: "Process" },
    { nav_id: "NAV-N-05", label: "Testing & Evidence", icon_name: "flask-conical", default_screen: "populationTesting", persona_default_for: ["audit"], wave: 1, enabled_flag: true, screens_inside: ["populationTesting", "evidenceWorkbench", "workpaperAuditPackBuilder"], entity_anchor: "TestExecution" },
    { nav_id: "NAV-N-06", label: "Issues & Remediation", icon_name: "alert-triangle", default_screen: "issueBoard", persona_default_for: [], wave: 1, enabled_flag: true, screens_inside: ["issueBoard"], entity_anchor: "Issue" },
    { nav_id: "NAV-N-07", label: "AI Insights", icon_name: "sparkles", default_screen: "aiInsights", persona_default_for: ["compliance"], wave: 1, enabled_flag: true, screens_inside: ["aiInsights"], entity_anchor: "AIInsight" },
    { nav_id: "NAV-N-08", label: "Accountability", icon_name: "user-check", default_screen: "accountability", persona_default_for: ["cro"], wave: 1, enabled_flag: true, screens_inside: ["accountability"], entity_anchor: "SeniorManager" },
    { nav_id: "NAV-N-09", label: "Source Lineage", icon_name: "git-branch", default_screen: "sourceLineage", persona_default_for: ["compliance"], wave: 1, enabled_flag: true, screens_inside: ["sourceLineage"], entity_anchor: "SourceSystem" },
    { nav_id: "NAV-N-10", label: "Reporting Clocks", icon_name: "clock", default_screen: "riskPosture", persona_default_for: ["compliance"], wave: 2, enabled_flag: true, screens_inside: [], entity_anchor: "ReportingClock" },
    { nav_id: "NAV-N-11", label: "UPI Fraud", icon_name: "credit-card", default_screen: null, persona_default_for: [], wave: 2, enabled_flag: false, screens_inside: [], entity_anchor: null },
    { nav_id: "NAV-N-12", label: "IT Risk / Cyber", icon_name: "shield", default_screen: null, persona_default_for: [], wave: 2, enabled_flag: false, screens_inside: [], entity_anchor: null },
    { nav_id: "NAV-N-13", label: "Vendor / TPSP", icon_name: "building", default_screen: null, persona_default_for: [], wave: 3, enabled_flag: false, screens_inside: [], entity_anchor: null },
    { nav_id: "NAV-N-14", label: "Complaints / IO", icon_name: "message-square", default_screen: null, persona_default_for: [], wave: 3, enabled_flag: false, screens_inside: [], entity_anchor: null },
    { nav_id: "NAV-N-15", label: "Regulatory Change Inbox", icon_name: "inbox", default_screen: null, persona_default_for: [], wave: 3, enabled_flag: false, screens_inside: [], entity_anchor: null }
  ],

  screens: [
    { screen_id: "S-01", code: "riskPosture", title: "Executive Risk Posture Cockpit", primary_persona: "PERSONA-001", persona_question_answered: "Q-CRO-01", anchor_entity: "Risk", default_filters: { dateRange: "last_7_days" }, primary_kpis: ["RES", "ARS", "CES", "SAES", "RTS"] },
    { screen_id: "S-02", code: "whatChanged", title: "What Changed This Week", primary_persona: "PERSONA-001", persona_question_answered: "Q-CRO-02", anchor_entity: "Issue", default_filters: { dateRange: "last_7_days" }, primary_kpis: ["new_issues", "ces_movements", "ai_insights_new", "kri_band_changes", "reporting_breaches"] },
    { screen_id: "S-03", code: "inspectionReadiness", title: "Inspection Readiness / RBI Pack View", primary_persona: "PERSONA-001", persona_question_answered: "Q-CRO-10", anchor_entity: "AuditPack", default_filters: { inspectionLens: "rbi_afi" }, primary_kpis: ["ARS", "missing_evidence", "stale_evidence", "open_high_risk_issues"] },
    { screen_id: "S-04", code: "obligationCoverage", title: "Obligation Coverage Map", primary_persona: "PERSONA-002", persona_question_answered: "Q-CCO-01", anchor_entity: "Obligation", default_filters: {}, primary_kpis: ["OCS", "EIFS", "RTS"] },
    { screen_id: "S-05", code: "controlUniverse", title: "Control Universe", primary_persona: "PERSONA-002", persona_question_answered: "Q-CCO-03", anchor_entity: "Control", default_filters: { status: ["active"] }, primary_kpis: ["CES_distribution", "OCS"] },
    { screen_id: "S-06", code: "controlDrillDown", title: "Control Drill-Down", primary_persona: "PERSONA-002", persona_question_answered: "Q-CCO-03", anchor_entity: "Control", default_filters: { dateRange: "last_30_days" }, primary_kpis: ["CES", "OperatingRate", "CatchRate", "EvidenceCompleteness"] },
    { screen_id: "S-07", code: "processHealth", title: "Process Health View", primary_persona: "PERSONA-002", persona_question_answered: "Q-CCO-04", anchor_entity: "Process", default_filters: {}, primary_kpis: ["PVDS", "sla_breach_count"] },
    { screen_id: "S-08", code: "evidenceWorkbench", title: "Evidence Workbench", primary_persona: "PERSONA-003", persona_question_answered: "Q-IA-03", anchor_entity: "EvidenceRecord", default_filters: {}, primary_kpis: ["EIFS", "evidence_status_distribution"] },
    { screen_id: "S-09", code: "populationTesting", title: "Population Testing / Reperformance Console", primary_persona: "PERSONA-003", persona_question_answered: "Q-IA-01", anchor_entity: "TestExecution", default_filters: {}, primary_kpis: ["population_testability_pct", "exception_rate"] },
    { screen_id: "S-10", code: "issueBoard", title: "Issue & Remediation Board", primary_persona: "PERSONA-002", persona_question_answered: "Q-CCO-09", anchor_entity: "Issue", default_filters: { status: ["open", "in_remediation"] }, primary_kpis: ["open_issue_count", "rbi_mra_count", "avg_mttr"] },
    { screen_id: "S-11", code: "aiInsights", title: "AI Insights Review Queue", primary_persona: "PERSONA-002", persona_question_answered: "ai_signal_review", anchor_entity: "AIInsight", default_filters: { human_approval_status: ["pending"] }, primary_kpis: ["pending_count", "AITES"] },
    { screen_id: "S-12", code: "accountability", title: "Senior Accountability Ledger", primary_persona: "PERSONA-001", persona_question_answered: "Q-CRO-03", anchor_entity: "SeniorManager", default_filters: {}, primary_kpis: ["SAES", "open_issues_by_sm", "overdue_attestations"] },
    { screen_id: "S-13", code: "workpaperAuditPackBuilder", title: "Workpaper / AuditPack Builder", primary_persona: "PERSONA-003", persona_question_answered: "Q-IA-04", anchor_entity: "Workpaper", default_filters: {}, primary_kpis: ["workpaper_readiness", "audit_pack_readiness"] },
    { screen_id: "N-09", code: "sourceLineage", title: "Source Lineage Page", primary_persona: "PERSONA-002", persona_question_answered: "Q-CCO-04", anchor_entity: "SourceSystem", default_filters: {}, primary_kpis: ["DCQS", "orphan_count"] },
    { screen_id: "S-14", code: "rcsaWorkspace", title: "RCSA Workspace", primary_persona: "PERSONA-002", persona_question_answered: "Q-CCO-ORM-RCSA", anchor_entity: "RcsaCycle", default_filters: {}, primary_kpis: ["rcsa_cycles_active", "rcsa_high_residual", "rcsa_overdue_attest"] },
    { screen_id: "S-15", code: "riskRegister", title: "Risk Register", primary_persona: "PERSONA-002", persona_question_answered: "Q-CCO-ORM-RISK", anchor_entity: "Risk", default_filters: {}, primary_kpis: ["RES", "risk_count", "high_residual_risks"] },
    { screen_id: "S-16", code: "incidentRegister", title: "Incidents & Near-Miss", primary_persona: "PERSONA-002", persona_question_answered: "Q-CCO-ORM-INC", anchor_entity: "Incident", default_filters: {}, primary_kpis: ["open_incidents", "near_miss_30d", "rca_cycle_time"] },
    { screen_id: "S-17", code: "rcaWorkspace", title: "RCA & Preventive Actions", primary_persona: "PERSONA-002", persona_question_answered: "Q-CCO-ORM-RCA", anchor_entity: "RcaRecord", default_filters: {}, primary_kpis: ["rca_in_flight", "pa_overdue", "pac_blocked"] },
    { screen_id: "S-18", code: "pacNoteApprovals", title: "PAC Note Approvals", primary_persona: "PERSONA-002", persona_question_answered: "Q-CCO-ORM-PAC", anchor_entity: "PacNote", default_filters: {}, primary_kpis: ["pac_pending", "pac_blocked_pa", "pac_cycle_time"] },
    { screen_id: "S-19", code: "lossData", title: "Loss Data Register", primary_persona: "PERSONA-001", persona_question_answered: "Q-CRO-ORM-LOSS", anchor_entity: "LossEvent", default_filters: { fiscalYear: "FY26" }, primary_kpis: ["gross_loss_ytd", "net_loss_ytd", "recovery_ytd", "loss_event_count"] },
    { screen_id: "S-20", code: "kriMonitoring", title: "KRI Monitoring", primary_persona: "PERSONA-002", persona_question_answered: "Q-CCO-ORM-KRI", anchor_entity: "KRI", default_filters: { window_weeks: 12 }, primary_kpis: ["kri_red", "kri_amber", "kri_breach_4w", "kri_deteriorating"] }
  ],

  metrics: [
    { metric_id: "RES", title: "Risk Exposure Score", formula: "weighted aggregate of inherent × residual × control degradation × KRI breach", weights: { inherent: 0.3, residual: 0.4, control_degradation: 0.2, kri_breach: 0.1 }, color_thresholds: { green: 80, amber: 60, red: 0 }, denominator_rules: "domain population", used_by_screens: ["S-01", "S-02"] },
    { metric_id: "CES", title: "Control Effectiveness Score", formula: "0.40 × OperatingRate + 0.40 × CatchRate + 0.20 × EvidenceCompleteness", weights: { operating_rate: 0.4, catch_rate: 0.4, evidence_completeness: 0.2 }, color_thresholds: { green: 80, amber: 60, red: 0 }, denominator_rules: "expected-to-fire population; not computed if data_gap_rate>20% or population<30", used_by_screens: ["S-05", "S-06", "S-09"] },
    { metric_id: "ARS", title: "Audit Readiness Score", formula: "weighted: evidence_coverage × source_completeness × correlation_quality × population_testability × workpaper_exportability", weights: { evidence: 0.3, source: 0.2, correlation: 0.2, population: 0.15, workpaper: 0.15 }, color_thresholds: { green: 85, amber: 70, red: 0 }, denominator_rules: "lens scope", used_by_screens: ["S-01", "S-03", "S-13"] },
    { metric_id: "OCS", title: "Obligation Coverage Score", formula: "linked-control coverage strength × evidence freshness", weights: { coverage: 0.6, freshness: 0.4 }, color_thresholds: { green: 80, amber: 60, red: 0 }, denominator_rules: "obligation universe in scope", used_by_screens: ["S-04", "S-05"] },
    { metric_id: "EIFS", title: "Evidence Integrity & Freshness Score", formula: "(complete - invalid_hash - stale - orphaned) / total", weights: {}, color_thresholds: { green: 85, amber: 70, red: 0 }, denominator_rules: "evidence universe in scope", used_by_screens: ["S-08", "S-04", "S-06"] },
    { metric_id: "DCQS", title: "Data Correlation Quality Score", formula: "matched / (matched + warnings + orphans)", weights: {}, color_thresholds: { green: 90, amber: 75, red: 0 }, denominator_rules: "correlation record universe", used_by_screens: ["N-09", "S-08"] },
    { metric_id: "PVDS", title: "Process Variant Drift Score", formula: "1 - (novel_variants / total_variants)", weights: {}, color_thresholds: { green: 80, amber: 65, red: 0 }, denominator_rules: "process execution universe", used_by_screens: ["S-07"] },
    { metric_id: "RTS", title: "Reporting Timeliness Score", formula: "on_time_submissions / required_submissions", weights: {}, color_thresholds: { green: 95, amber: 85, red: 0 }, denominator_rules: "due submissions in period", used_by_screens: ["S-01", "S-04", "N-10"] },
    { metric_id: "SAES", title: "Senior Accountability Evidence Score", formula: "(decisions_with_evidence + attestations_signed) / required", weights: {}, color_thresholds: { green: 85, amber: 70, red: 0 }, denominator_rules: "SM scope universe", used_by_screens: ["S-12", "S-01"] },
    { metric_id: "AITES", title: "AI Trust & Explainability Score", formula: "(accepted_with_evidence + true_positives) / total_ai_actions", weights: {}, color_thresholds: { green: 85, amber: 70, red: 0 }, denominator_rules: "AI insight universe", used_by_screens: ["S-11"] },
    { metric_id: "ORLR", title: "Operational Loss Ratio", formula: "net_loss_inr / gross_loss_inr for FY26 loss register rows in scope", weights: {}, color_thresholds: { green: 90, amber: 70, red: 0 }, denominator_rules: "Basel LDC rows · FY26 window", used_by_screens: ["S-19", "S-01"] },
    { metric_id: "INCV", title: "Incident-to-Closure Velocity", formula: "mean calendar days from incident discovery to RCA completion (completed RCAs only)", weights: {}, color_thresholds: { green: 30, amber: 60, red: 999 }, denominator_rules: "RCAs with rca_completed_at", used_by_screens: ["S-17", "S-01"] },
    { metric_id: "PACV", title: "PAC Approval Velocity", formula: "mean calendar days from PAC submission to approval timestamp", weights: {}, color_thresholds: { green: 7, amber: 14, red: 999 }, denominator_rules: "PAC notes with submitted_at and approved_at", used_by_screens: ["S-18", "S-01"] },
    { metric_id: "POAOR", title: "Preventive Action Overdue Ratio", formula: "open or in-progress PAs past target_date / all open or in-progress PAs", weights: {}, color_thresholds: { green: 10, amber: 25, red: 100 }, denominator_rules: "PA universe", used_by_screens: ["S-17", "S-01"] }
  ],

  riskDomains: [
    { domain_id: "R-CR", title: "Credit Risk", regulatory_anchor: "RBI MD on IRACP" },
    { domain_id: "R-OP", title: "Operational Risk", regulatory_anchor: "RBI MD on Operational Risk Management" },
    { domain_id: "R-CO", title: "Compliance Risk", regulatory_anchor: "RBI Master Direction on KYC; PMLA 2002" },
    { domain_id: "R-CD", title: "Conduct Risk", regulatory_anchor: "RBI Charter of Customer Rights; Fair Practices Code" },
    { domain_id: "R-TC", title: "Technology / Cyber Risk", regulatory_anchor: "RBI Cyber Security Framework; ITGRCA 2023; CERT-In" },
    { domain_id: "R-FC", title: "Financial Crime / AML", regulatory_anchor: "PMLA 2002; FIU-IND FINnet 2.0" },
    { domain_id: "R-TP", title: "Third Party / Outsourcing", regulatory_anchor: "RBI MD on Outsourcing of IT Services 2023" },
    { domain_id: "R-FR", title: "Fraud Risk", regulatory_anchor: "RBI MD on Fraud Risk Management 2024" },
    { domain_id: "R-MR", title: "Model Risk / AI Governance", regulatory_anchor: "RBI ITGRCA AI Governance" }
  ],

  risks: [
    { risk_id: "R-FC-001", domain_id: "R-FC", title: "AML Transaction Monitoring & STR Reporting Risk", inherent_rating: "high", residual_rating: "high", residual_rating_trend: "deteriorating", res_score: 58, accountable_senior_manager_id: "SM-MLRO-001", kri_ids: ["KRI-FC-001"], appetite_metric_ids: ["APM-FC-001"], linked_obligation_ids: ["OBL-PMLA-001", "OBL-FIU-STR-001"], linked_control_ids: ["CTRL-AML-002", "CTRL-AML-003"] },
    { risk_id: "R-CD-001", domain_id: "R-CD", title: "Digital Lending Conduct Risk — KFS / APR / Fair Practices", inherent_rating: "high", residual_rating: "medium", residual_rating_trend: "deteriorating", res_score: 67, accountable_senior_manager_id: "SM-CCO-001", kri_ids: ["KRI-CD-001"], appetite_metric_ids: ["APM-CD-001"], linked_obligation_ids: ["OBL-RBI-DL-001"], linked_control_ids: ["CTRL-LND-002"] },
    { risk_id: "R-CO-001", domain_id: "R-CO", title: "KYC / CDD / Periodic Re-KYC Compliance", inherent_rating: "high", residual_rating: "medium", residual_rating_trend: "stable", res_score: 74, accountable_senior_manager_id: "SM-CCO-001", kri_ids: ["KRI-CO-001"], appetite_metric_ids: ["APM-CO-001"], linked_obligation_ids: ["OBL-RBI-KYC-001", "OBL-RBI-KYC-003"], linked_control_ids: ["CTRL-KYC-001", "CTRL-KYC-002", "CTRL-KYC-003"] },
    { risk_id: "R-OP-001", domain_id: "R-OP", title: "BPO-Driven Operational Backlog & SLA Breach", inherent_rating: "medium", residual_rating: "medium", residual_rating_trend: "deteriorating", res_score: 70, accountable_senior_manager_id: "SM-OPS-001", kri_ids: ["KRI-OP-001"], appetite_metric_ids: ["APM-OP-001"], linked_obligation_ids: [], linked_control_ids: ["CTRL-AML-002"] },
    { risk_id: "R-TC-001", domain_id: "R-TC", title: "Cyber Incident Response & CERT-In 6-hour Reporting", inherent_rating: "high", residual_rating: "medium", residual_rating_trend: "stable", res_score: 78, accountable_senior_manager_id: "SM-CISO-001", kri_ids: ["KRI-TC-001"], appetite_metric_ids: ["APM-TC-001"], linked_obligation_ids: ["OBL-CERT-IN-001"], linked_control_ids: ["CTRL-ITO-001"] },
    { risk_id: "R-CR-001", domain_id: "R-CR", title: "Retail Credit Origination & Bureau Pull Quality", inherent_rating: "medium", residual_rating: "medium", residual_rating_trend: "stable", res_score: 81, accountable_senior_manager_id: "SM-BH-RETAIL-001", kri_ids: ["KRI-CR-001"], appetite_metric_ids: ["APM-CR-001"], linked_obligation_ids: [], linked_control_ids: [] },
    { risk_id: "R-TP-001", domain_id: "R-TP", title: "TPSP / Outsourcing — Material Vendor Concentration", inherent_rating: "high", residual_rating: "medium", residual_rating_trend: "stable", res_score: 76, accountable_senior_manager_id: "SM-CIO-001", kri_ids: ["KRI-TP-001"], appetite_metric_ids: ["APM-TP-001"], linked_obligation_ids: [], linked_control_ids: ["CTRL-VND-001"] },
    { risk_id: "R-FR-001", domain_id: "R-FR", title: "UPI Mule / Fraud Detection (Wave 2)", inherent_rating: "high", residual_rating: "high", residual_rating_trend: "stable", res_score: 64, accountable_senior_manager_id: "SM-FCC-001", kri_ids: ["KRI-FR-001"], appetite_metric_ids: ["APM-FR-001"], linked_obligation_ids: [], linked_control_ids: ["CTRL-UPI-001"] },
    { risk_id: "R-MR-001", domain_id: "R-MR", title: "AI Model Risk — RBI ITGRCA Governance", inherent_rating: "medium", residual_rating: "medium", residual_rating_trend: "stable", res_score: 79, accountable_senior_manager_id: "SM-CISO-001", kri_ids: ["KRI-MR-001"], appetite_metric_ids: ["APM-MR-001"], linked_obligation_ids: [], linked_control_ids: [] }
  ],

  regulations: [
    { regulation_id: "REG-RBI-MD-KYC-2016", title: "RBI Master Direction — Know Your Customer (KYC)", regulator: "RBI", citation: "RBI/DBR/2015-16/18 Master Direction DBR.AML.BC.No.81/14.01.001/2015-16, as amended", version: "2025-04 (post 12-Jun-2025 BO threshold amendment)", effective_from: "2016-02-25", supersedes: null },
    { regulation_id: "REG-RBI-MD-DL-2025", title: "RBI Master Direction — Digital Lending", regulator: "RBI", citation: "RBI/2025-26/36 DOR.STR.REC.19/21.07.001/2025-26", version: "2025-08", effective_from: "2025-08-01", supersedes: "RBI/2022-23/180" },
    { regulation_id: "REG-PMLA-2002", title: "Prevention of Money Laundering Act", regulator: "PMLA", citation: "Act No. 15 of 2003; PMLA (Maintenance of Records) Rules", version: "2024", effective_from: "2005-07-01", supersedes: null },
    { regulation_id: "REG-FIU-FINNET-2.0", title: "FIU-IND FINnet 2.0 Reporting Guidelines", regulator: "FIU-IND", citation: "FIU-IND FINnet 2.0 — STR/CTR/NTR/CCR/CBWTR Filing Guide", version: "2.4", effective_from: "2023-04-01", supersedes: "FINnet 1.0" },
    { regulation_id: "REG-RBI-ITGRCA-2023", title: "RBI Master Direction — IT Governance, Risk, Controls & Assurance", regulator: "RBI", citation: "RBI/2023-24/107 DoS.CO.CSITEG.SEC.7/31.01.015/2023-24", version: "2023-11", effective_from: "2024-04-01", supersedes: null },
    { regulation_id: "REG-CERT-IN-2022", title: "CERT-In Cyber Incident Reporting Directions", regulator: "CERT-In", citation: "CERT-In Direction 20(3)/2022-CERT-In dated 28-Apr-2022", version: "2022", effective_from: "2022-06-28", supersedes: null },
    { regulation_id: "REG-RBI-OUTSRC-IT-2023", title: "RBI Master Direction on Outsourcing of IT Services", regulator: "RBI", citation: "RBI/2023-24/102 DoS.CO.CSITEG.SEC.1/31.01.015/2023-24", version: "2023-04", effective_from: "2023-10-01", supersedes: null },
    { regulation_id: "REG-RBI-FRM-2024", title: "RBI Master Direction on Fraud Risk Management", regulator: "RBI", citation: "RBI/DOS/2024-25/120 DOS.CO.FMG.SEC.10/23.04.001/2024-25", version: "2024-07", effective_from: "2024-07-15", supersedes: null }
  ],

  obligations: [
    { obligation_id: "OBL-RBI-KYC-001", atomic_requirement: "Establish customer identity using OVD before account opening; complete CDD and risk categorisation", regulation_id: "REG-RBI-MD-KYC-2016", applicability_archetype: ["MSPB", "PSU", "SFB", "Foreign-Bank-Branch"], reporting_clock_id: null, accountable_senior_manager_id: "SM-CCO-001", applicable_processes: ["PROC-KYC-001"], linked_control_ids: ["CTRL-KYC-001", "CTRL-KYC-002"] },
    { obligation_id: "OBL-RBI-KYC-003", atomic_requirement: "Periodic re-KYC within risk-based cycle (10y / 8y / 2y for low/medium/high risk); DBT/scholarship accounts have specific cadence", regulation_id: "REG-RBI-MD-KYC-2016", applicability_archetype: ["MSPB", "PSU", "SFB"], reporting_clock_id: null, accountable_senior_manager_id: "SM-CCO-001", applicable_processes: ["PROC-KYC-001"], linked_control_ids: ["CTRL-KYC-003"] },
    { obligation_id: "OBL-RBI-KYC-008", atomic_requirement: "Upload to CKYCR within prescribed timeline post-activation and store ack ID", regulation_id: "REG-RBI-MD-KYC-2016", applicability_archetype: ["MSPB", "PSU", "SFB"], reporting_clock_id: null, accountable_senior_manager_id: "SM-CCO-001", applicable_processes: ["PROC-KYC-001"], linked_control_ids: ["CTRL-KYC-003"] },
    { obligation_id: "OBL-PMLA-001", atomic_requirement: "Maintain KYC and transaction records for 5 years post account closure (PMLA Rule 9 retention)", regulation_id: "REG-PMLA-2002", applicability_archetype: ["MSPB", "PSU", "SFB", "Foreign-Bank-Branch", "NBFC"], reporting_clock_id: null, accountable_senior_manager_id: "SM-MLRO-001", applicable_processes: ["PROC-KYC-001", "PROC-AML-001"], linked_control_ids: ["CTRL-AML-002"] },
    { obligation_id: "OBL-PMLA-003", atomic_requirement: "File STR with FIU-IND within 7 working days of suspicion conclusion (PMLA s.12(1)(b))", regulation_id: "REG-PMLA-2002", applicability_archetype: ["MSPB", "PSU", "SFB", "Foreign-Bank-Branch"], reporting_clock_id: "RC-STR-7BD", accountable_senior_manager_id: "SM-MLRO-001", applicable_processes: ["PROC-AML-001"], linked_control_ids: ["CTRL-AML-003"] },
    { obligation_id: "OBL-FIU-STR-001", atomic_requirement: "Submit STR XML to FIU-IND FINnet 2.0 with valid acknowledgement; preserve ack as evidence", regulation_id: "REG-FIU-FINNET-2.0", applicability_archetype: ["MSPB", "PSU", "SFB"], reporting_clock_id: "RC-STR-7BD", accountable_senior_manager_id: "SM-MLRO-001", applicable_processes: ["PROC-AML-001"], linked_control_ids: ["CTRL-AML-003"] },
    { obligation_id: "OBL-FIU-CTR-001", atomic_requirement: "Submit CTR for cash transactions ≥INR 10L by 15th of the following month", regulation_id: "REG-FIU-FINNET-2.0", applicability_archetype: ["MSPB", "PSU", "SFB"], reporting_clock_id: "RC-CTR", accountable_senior_manager_id: "SM-MLRO-001", applicable_processes: ["PROC-AML-001"], linked_control_ids: [] },
    { obligation_id: "OBL-RBI-DL-001", atomic_requirement: "Issue Key Fact Statement (KFS) before borrower acceptance; all APR components disclosed; cooling-off period honoured (RBI MD on Digital Lending Para 8)", regulation_id: "REG-RBI-MD-DL-2025", applicability_archetype: ["MSPB", "PSU", "SFB", "NBFC"], reporting_clock_id: null, accountable_senior_manager_id: "SM-CCO-001", applicable_processes: ["PROC-LND-001"], linked_control_ids: ["CTRL-LND-002"] },
    { obligation_id: "OBL-RBI-DL-CIMS", atomic_requirement: "Submit DLA register and quarterly CIMS report with CCO certification", regulation_id: "REG-RBI-MD-DL-2025", applicability_archetype: ["MSPB", "PSU", "SFB", "NBFC"], reporting_clock_id: "RC-CIMS-Q", accountable_senior_manager_id: "SM-CCO-001", applicable_processes: ["PROC-LND-001"], linked_control_ids: [] },
    { obligation_id: "OBL-CERT-IN-001", atomic_requirement: "Notify CERT-In of cyber incidents within 6 hours of detection", regulation_id: "REG-CERT-IN-2022", applicability_archetype: ["MSPB", "PSU", "SFB", "Foreign-Bank-Branch"], reporting_clock_id: "RC-CERT-IN", accountable_senior_manager_id: "SM-CISO-001", applicable_processes: ["PROC-ITO-001"], linked_control_ids: ["CTRL-ITO-001"] },
    { obligation_id: "OBL-RBI-CSITE-001", atomic_requirement: "Submit material cyber incident to RBI CSITE within 2-6 hours per severity", regulation_id: "REG-RBI-ITGRCA-2023", applicability_archetype: ["MSPB", "PSU", "SFB"], reporting_clock_id: "RC-CSITE", accountable_senior_manager_id: "SM-CISO-001", applicable_processes: ["PROC-ITO-001"], linked_control_ids: ["CTRL-ITO-001"] },
    { obligation_id: "OBL-RBI-OUTSRC-001", atomic_requirement: "Material TPSP due-diligence package complete before approval; fourth-party disclosure mandatory", regulation_id: "REG-RBI-OUTSRC-IT-2023", applicability_archetype: ["MSPB", "PSU", "SFB"], reporting_clock_id: null, accountable_senior_manager_id: "SM-CIO-001", applicable_processes: ["PROC-VND-001"], linked_control_ids: ["CTRL-VND-001"] }
  ],

  controls: [
    { control_id: "CTRL-KYC-001", title: "Sanctions + UAPA screening before account activation", type: "preventive", nature: "automated", frequency: "per_event", process_id: "PROC-KYC-001", position_in_step: "STEP-KYC-05", owner_role: "KYC Operations", accountable_senior_manager_id: "SM-CCO-001", designed_condition: "screening_result IN ('no_hit') AND list_version_age_hours <= 24 AND screening_run_at < activation_at", evidence_specs: ["EVD-LOG-SCREEN", "EVD-LOG-UAPA"], population_testable_flag: true, ces_breakdown: { operating_rate: 96, catch_rate: 92, evidence_completeness: 98 }, ces: 95.6, ces_band: "green", linked_obligations: ["OBL-RBI-KYC-001"], linked_risks: ["R-CO-001"] },
    { control_id: "CTRL-KYC-002", title: "PAN / Aadhaar verification completeness before activation", type: "preventive", nature: "automated", frequency: "per_event", process_id: "PROC-KYC-001", position_in_step: "STEP-KYC-03", owner_role: "KYC Operations", accountable_senior_manager_id: "SM-CCO-001", designed_condition: "pan_verified=true AND aadhaar_otp_verified=true AND verified_at < activation_at", evidence_specs: ["EVD-LOG-PAN", "EVD-BIO-AADHAAR"], population_testable_flag: true, ces_breakdown: { operating_rate: 99, catch_rate: 95, evidence_completeness: 97 }, ces: 97.0, ces_band: "green", linked_obligations: ["OBL-RBI-KYC-001"], linked_risks: ["R-CO-001"] },
    { control_id: "CTRL-KYC-003", title: "CKYCR upload within prescribed window + ack stored; periodic re-KYC scheduled per cohort", type: "detective", nature: "automated", frequency: "per_event", process_id: "PROC-KYC-001", position_in_step: "STEP-KYC-11", owner_role: "KYC Operations", accountable_senior_manager_id: "SM-CCO-001", designed_condition: "ckycr_upload_at <= activation_at + 3d AND ckycr_ack_id IS NOT NULL AND re_kyc_due_date IS NOT NULL", evidence_specs: ["EVD-LOG-CKYCR-ACK", "EVD-DOC-RE-KYC-SCHED"], population_testable_flag: true, ces_breakdown: { operating_rate: 91, catch_rate: 78, evidence_completeness: 73 }, ces: 82.2, ces_band: "amber", linked_obligations: ["OBL-RBI-KYC-003", "OBL-RBI-KYC-008"], linked_risks: ["R-CO-001"] },
    { control_id: "CTRL-LND-002", title: "KFS issued before borrower acceptance", type: "preventive", nature: "automated", frequency: "per_event", process_id: "PROC-LND-001", position_in_step: "STEP-LND-09", owner_role: "Digital Lending Ops", accountable_senior_manager_id: "SM-CCO-001", designed_condition: "kfs_issued_at < borrower_acceptance_at AND kfs_hash IS NOT NULL", evidence_specs: ["EVD-SIGN-KFS", "EVD-LOG-LOS-EVT"], population_testable_flag: true, ces_breakdown: { operating_rate: 74.77, catch_rate: 100, evidence_completeness: 98 }, ces: 89.51, ces_band: "amber", linked_obligations: ["OBL-RBI-DL-001"], linked_risks: ["R-CD-001"] },
    { control_id: "CTRL-AML-002", title: "AML L1 alert triage within SLA; BPO breach = failed control", type: "detective", nature: "hybrid", frequency: "per_event", process_id: "PROC-AML-001", position_in_step: "STEP-AML-04", owner_role: "Financial Crime Compliance — L1 BPO", accountable_senior_manager_id: "SM-FCC-001", designed_condition: "l1_disposed_at - alert_generated_at <= 5 BD", evidence_specs: ["EVD-LOG-CASE", "EVD-LOG-L1-DISPO"], population_testable_flag: true, ces_breakdown: { operating_rate: 79, catch_rate: 65, evidence_completeness: 60 }, ces: 69.6, ces_band: "amber", linked_obligations: ["OBL-PMLA-001"], linked_risks: ["R-FC-001", "R-OP-001"] },
    { control_id: "CTRL-AML-003", title: "STR filing within 7 working days of suspicion conclusion (PMLA s.12)", type: "detective", nature: "hybrid", frequency: "per_event", process_id: "PROC-AML-001", position_in_step: "STEP-AML-11", owner_role: "MLRO–Principal Officer", accountable_senior_manager_id: "SM-MLRO-001", designed_condition: "str_filed_at - suspicion_conclusion_at <= 7 working days AND fiu_ack_id IS NOT NULL", evidence_specs: ["EVD-DOC-STR-XML", "EVD-LOG-FIU-ACK"], population_testable_flag: true, ces_breakdown: { operating_rate: 88, catch_rate: 92, evidence_completeness: 81 }, ces: 88.2, ces_band: "green", linked_obligations: ["OBL-PMLA-003", "OBL-FIU-STR-001"], linked_risks: ["R-FC-001"] },
    { control_id: "CTRL-UPI-001", title: "UPI mule / rapid funnel-out detection (Wave 2)", type: "detective", nature: "automated", frequency: "continuous", process_id: "PROC-UPI-001", position_in_step: "STEP-UPI-03", owner_role: "Fraud Risk Management", accountable_senior_manager_id: "SM-FCC-001", designed_condition: "ai_001_signal_score >= threshold AND linked_alert_id IS NOT NULL", evidence_specs: ["EVD-LOG-NPCI-FB"], population_testable_flag: false, ces_breakdown: { operating_rate: null, catch_rate: null, evidence_completeness: null }, ces: null, ces_band: "grey", linked_obligations: [], linked_risks: ["R-FR-001"] },
    { control_id: "CTRL-VND-001", title: "Material TPSP due-diligence package complete + fourth-party disclosure before approval", type: "preventive", nature: "manual", frequency: "per_event", process_id: "PROC-VND-001", position_in_step: "STEP-VND-09", owner_role: "Vendor Management Office", accountable_senior_manager_id: "SM-CIO-001", designed_condition: "ddq_complete=true AND infosec_review_complete=true AND soc_review_complete=true AND fourth_party_disclosed_flag=true", evidence_specs: ["EVD-DOC-DDQ", "EVD-DOC-SOC", "EVD-DOC-CONTRACT"], population_testable_flag: true, ces_breakdown: { operating_rate: 71, catch_rate: 80, evidence_completeness: 66 }, ces: 73.4, ces_band: "amber", linked_obligations: ["OBL-RBI-OUTSRC-001"], linked_risks: ["R-TP-001"] },
    { control_id: "CTRL-ITO-001", title: "Cyber incident detection-to-CERT-In notification within 6 hours", type: "detective", nature: "hybrid", frequency: "per_event", process_id: "PROC-ITO-001", position_in_step: "STEP-ITO-03", owner_role: "CISO Office — SOC", accountable_senior_manager_id: "SM-CISO-001", designed_condition: "cert_in_notified_at - incident_detected_at <= 6h AND ack_id IS NOT NULL", evidence_specs: ["EVD-LOG-SIEM", "EVD-LOG-CERT-IN-ACK"], population_testable_flag: true, ces_breakdown: { operating_rate: 92, catch_rate: 88, evidence_completeness: 84 }, ces: 88.8, ces_band: "green", linked_obligations: ["OBL-CERT-IN-001", "OBL-RBI-CSITE-001"], linked_risks: ["R-TC-001"] },
    { control_id: "CTRL-KYC-005", title: "EDD completion before activation for high / very-high risk UCICs", type: "preventive", nature: "manual", frequency: "per_event", process_id: "PROC-KYC-001", position_in_step: "STEP-KYC-10", owner_role: "Branch / KYC Sr Approver", accountable_senior_manager_id: "SM-CCO-001", designed_condition: "edd_completed=true AND edd_approver_id IS NOT NULL AND edd_completed_at < activation_at", evidence_specs: ["EVD-DOC-EDD", "EVD-ATTEST-EDD"], population_testable_flag: true, ces_breakdown: { operating_rate: 88, catch_rate: 85, evidence_completeness: 82 }, ces: 85.6, ces_band: "green", linked_obligations: ["OBL-RBI-KYC-001"], linked_risks: ["R-CO-001", "R-FC-001"] },
    { control_id: "CTRL-LND-001", title: "Bureau pull freshness + four-bureau coverage", type: "preventive", nature: "automated", frequency: "per_event", process_id: "PROC-LND-001", position_in_step: "STEP-LND-04", owner_role: "Credit Underwriting", accountable_senior_manager_id: "SM-BH-RETAIL-001", designed_condition: "bureau_pull_at >= sanction_at - 90d AND bureau_count = 4", evidence_specs: ["EVD-LOG-BUREAU"], population_testable_flag: true, ces_breakdown: { operating_rate: 95, catch_rate: 90, evidence_completeness: 92 }, ces: 92.4, ces_band: "green", linked_obligations: [], linked_risks: ["R-CR-001"] },
    { control_id: "CTRL-VND-002", title: "TPSP material incident reporting — 6-hour rule", type: "detective", nature: "hybrid", frequency: "per_event", process_id: "PROC-VND-001", position_in_step: "STEP-VND-12", owner_role: "Vendor Management Office", accountable_senior_manager_id: "SM-CIO-001", designed_condition: "vendor_to_bank_reported_at - incident_at <= 6h AND bank_to_rbi_reported_at - vendor_to_bank_reported_at <= 6h", evidence_specs: ["EVD-LOG-VENDOR-INC"], population_testable_flag: true, ces_breakdown: { operating_rate: 68, catch_rate: 75, evidence_completeness: 70 }, ces: 71.2, ces_band: "amber", linked_obligations: ["OBL-RBI-OUTSRC-001"], linked_risks: ["R-TP-001"] }
  ],

  processes: [
    { process_id: "PROC-KYC-001", name: "Customer Onboarding & KYC", owner_role: "Head of Retail Onboarding", regulatory_anchor_ids: ["REG-RBI-MD-KYC-2016", "REG-PMLA-2002"], linked_obligation_ids: ["OBL-RBI-KYC-001", "OBL-RBI-KYC-003", "OBL-RBI-KYC-008", "OBL-PMLA-001"], documented_variant_signature: "branch | BPO | video-KYC | DigiLocker", pvds: 84, status: "active" },
    { process_id: "PROC-LND-001", name: "Retail Loan Origination / Digital Lending", owner_role: "Head of Digital Lending", regulatory_anchor_ids: ["REG-RBI-MD-DL-2025"], linked_obligation_ids: ["OBL-RBI-DL-001", "OBL-RBI-DL-CIMS"], documented_variant_signature: "DLA | LSP | branch", pvds: 68, status: "active" },
    { process_id: "PROC-AML-001", name: "AML Transaction Monitoring & Alert Disposition", owner_role: "Head of Financial Crime", regulatory_anchor_ids: ["REG-PMLA-2002", "REG-FIU-FINNET-2.0"], linked_obligation_ids: ["OBL-PMLA-001", "OBL-PMLA-003", "OBL-FIU-STR-001", "OBL-FIU-CTR-001"], documented_variant_signature: "L1-BPO | L2-Investigation | L3-MLRO", pvds: 71, status: "active" },
    { process_id: "PROC-UPI-001", name: "UPI Payments Monitoring (Wave 2)", owner_role: "Head of Payments", regulatory_anchor_ids: [], linked_obligation_ids: [], documented_variant_signature: "real-time", pvds: null, status: "wave_2" },
    { process_id: "PROC-COMP-001", name: "Complaints / IO (Wave 3)", owner_role: "Head of Customer Experience", regulatory_anchor_ids: [], linked_obligation_ids: [], documented_variant_signature: "branch | digital", pvds: null, status: "wave_3" },
    { process_id: "PROC-VND-001", name: "Vendor Onboarding & TPSP Risk", owner_role: "Head of Vendor Management", regulatory_anchor_ids: ["REG-RBI-OUTSRC-IT-2023"], linked_obligation_ids: ["OBL-RBI-OUTSRC-001"], documented_variant_signature: "material | non-material", pvds: 79, status: "active" },
    { process_id: "PROC-ITO-001", name: "IT Operations / Cyber Incident Response", owner_role: "CISO Office", regulatory_anchor_ids: ["REG-RBI-ITGRCA-2023", "REG-CERT-IN-2022"], linked_obligation_ids: ["OBL-CERT-IN-001", "OBL-RBI-CSITE-001"], documented_variant_signature: "P1 | P2 | P3", pvds: 88, status: "active" }
  ],

  processSteps: [
    { step_id: "STEP-KYC-01", process_id: "PROC-KYC-001", step_order: 1, name: "Application / Account Opening Request Received", expected_actor_role: "Branch / DSA / DLA", expected_systems: ["CBS"], slas: { latency_hours: 2 } },
    { step_id: "STEP-KYC-02", process_id: "PROC-KYC-001", step_order: 2, name: "OVD Collection (physical / DigiLocker / V-CIP)", expected_actor_role: "Branch / BPO", expected_systems: ["DigiLocker", "DM"], slas: { latency_hours: 24 } },
    { step_id: "STEP-KYC-03", process_id: "PROC-KYC-001", step_order: 3, name: "Identity Verification (Aadhaar OTP / PAN / Video-KYC)", expected_actor_role: "System", expected_systems: ["UIDAI", "NSDL"], slas: { latency_hours: 1 } },
    { step_id: "STEP-KYC-05", process_id: "PROC-KYC-001", step_order: 5, name: "Sanctions Screening", expected_actor_role: "System", expected_systems: ["Sanctions"], slas: { latency_hours: 1 } },
    { step_id: "STEP-KYC-06", process_id: "PROC-KYC-001", step_order: 6, name: "UAPA s.51A Daily Screening", expected_actor_role: "System", expected_systems: ["Sanctions"], slas: { latency_hours: 24 } },
    { step_id: "STEP-KYC-08", process_id: "PROC-KYC-001", step_order: 8, name: "Customer Risk Rating", expected_actor_role: "System / Branch", expected_systems: ["CBS"], slas: { latency_hours: 4 } },
    { step_id: "STEP-KYC-10", process_id: "PROC-KYC-001", step_order: 10, name: "EDD Execution & Senior Approval", expected_actor_role: "Branch Manager / KYC Sr Approver", expected_systems: ["CBS", "DM"], slas: { latency_hours: 72 } },
    { step_id: "STEP-KYC-11", process_id: "PROC-KYC-001", step_order: 11, name: "CKYCR Upload and Acknowledgement", expected_actor_role: "System / BPO", expected_systems: ["CKYCR", "CBS"], slas: { latency_hours: 72 } },
    { step_id: "STEP-KYC-12", process_id: "PROC-KYC-001", step_order: 12, name: "Account Activation (CBS event)", expected_actor_role: "System", expected_systems: ["CBS"], slas: { latency_hours: 1 } },
    { step_id: "STEP-KYC-13", process_id: "PROC-KYC-001", step_order: 13, name: "Periodic Re-KYC Scheduling", expected_actor_role: "System", expected_systems: ["CBS"], slas: { latency_hours: 24 } },
    { step_id: "STEP-LND-04", process_id: "PROC-LND-001", step_order: 4, name: "Bureau Pull (CIBIL / CRIF / Experian / Equifax)", expected_actor_role: "System", expected_systems: ["LOS", "Bureau"], slas: { latency_hours: 1 } },
    { step_id: "STEP-LND-08", process_id: "PROC-LND-001", step_order: 8, name: "Underwriter Review", expected_actor_role: "Underwriter", expected_systems: ["LOS"], slas: { latency_hours: 24 } },
    { step_id: "STEP-LND-09", process_id: "PROC-LND-001", step_order: 9, name: "KFS Generated and Issued (pre-acceptance)", expected_actor_role: "System", expected_systems: ["LOS", "DM"], slas: { latency_hours: 1 } },
    { step_id: "STEP-LND-10", process_id: "PROC-LND-001", step_order: 10, name: "Borrower Acceptance Captured", expected_actor_role: "Borrower", expected_systems: ["LOS", "DigiLocker"], slas: { latency_hours: 24 } },
    { step_id: "STEP-LND-13", process_id: "PROC-LND-001", step_order: 13, name: "Disbursement (CBS booking event)", expected_actor_role: "System", expected_systems: ["CBS"], slas: { latency_hours: 4 } },
    { step_id: "STEP-LND-14", process_id: "PROC-LND-001", step_order: 14, name: "CIMS DLA Registration / Quarterly Reporting", expected_actor_role: "System / CCO", expected_systems: ["CIMS"], slas: { latency_hours: 720 } },
    { step_id: "STEP-AML-01", process_id: "PROC-AML-001", step_order: 1, name: "Transaction / Behaviour Event Captured", expected_actor_role: "System", expected_systems: ["CBS", "AML-engine"], slas: { latency_hours: 1 } },
    { step_id: "STEP-AML-03", process_id: "PROC-AML-001", step_order: 3, name: "Alert Generated (AML engine)", expected_actor_role: "System", expected_systems: ["AML-engine"], slas: { latency_hours: 1 } },
    { step_id: "STEP-AML-04", process_id: "PROC-AML-001", step_order: 4, name: "L1 Triage (BPO / captive)", expected_actor_role: "BPO L1", expected_systems: ["Case-Mgmt"], slas: { latency_hours: 120 } },
    { step_id: "STEP-AML-05", process_id: "PROC-AML-001", step_order: 5, name: "L1 Disposition Recorded", expected_actor_role: "BPO L1", expected_systems: ["Case-Mgmt"], slas: { latency_hours: 8 } },
    { step_id: "STEP-AML-08", process_id: "PROC-AML-001", step_order: 8, name: "L2/L3 Investigation", expected_actor_role: "Internal Investigator", expected_systems: ["Case-Mgmt"], slas: { latency_hours: 240 } },
    { step_id: "STEP-AML-10", process_id: "PROC-AML-001", step_order: 10, name: "STR Determination (suspicion conclusion)", expected_actor_role: "MLRO–Principal Officer", expected_systems: ["Case-Mgmt"], slas: { latency_hours: 24 } },
    { step_id: "STEP-AML-11", process_id: "PROC-AML-001", step_order: 11, name: "STR Filing to FIU-IND (FINnet 2.0)", expected_actor_role: "MLRO Office", expected_systems: ["FIU-IND-Out"], slas: { latency_hours: 168 } },
    { step_id: "STEP-VND-09", process_id: "PROC-VND-001", step_order: 9, name: "Fourth-Party Identification & Disclosure", expected_actor_role: "VMO", expected_systems: ["VMO"], slas: { latency_hours: 168 } },
    { step_id: "STEP-VND-12", process_id: "PROC-VND-001", step_order: 12, name: "Vendor Approved & Ongoing Monitoring", expected_actor_role: "VMO", expected_systems: ["VMO"], slas: { latency_hours: 168 } },
    { step_id: "STEP-ITO-03", process_id: "PROC-ITO-001", step_order: 3, name: "CERT-In + RBI CSITE Notification", expected_actor_role: "CISO Office", expected_systems: ["ITSM", "SIEM"], slas: { latency_hours: 6 } }
  ],

  activities: [
    { activity_id: "ACT-STEP-KYC-11-01", step_id: "STEP-KYC-11", expected_event_type: "ckycr_upload_request", expected_evidence_type: "EVD-LOG", mandatory_flag: true },
    { activity_id: "ACT-STEP-KYC-11-02", step_id: "STEP-KYC-11", expected_event_type: "ckycr_ack_received", expected_evidence_type: "EVD-LOG", mandatory_flag: true },
    { activity_id: "ACT-STEP-LND-09-01", step_id: "STEP-LND-09", expected_event_type: "kfs_generated", expected_evidence_type: "EVD-DOC", mandatory_flag: true },
    { activity_id: "ACT-STEP-LND-09-02", step_id: "STEP-LND-09", expected_event_type: "kfs_dispatched", expected_evidence_type: "EVD-LOG", mandatory_flag: true },
    { activity_id: "ACT-STEP-LND-10-01", step_id: "STEP-LND-10", expected_event_type: "borrower_acceptance_signed", expected_evidence_type: "EVD-SIGN", mandatory_flag: true },
    { activity_id: "ACT-STEP-AML-05-01", step_id: "STEP-AML-05", expected_event_type: "l1_disposition_recorded", expected_evidence_type: "EVD-LOG", mandatory_flag: true },
    { activity_id: "ACT-STEP-AML-11-01", step_id: "STEP-AML-11", expected_event_type: "str_xml_submitted", expected_evidence_type: "EVD-DOC", mandatory_flag: true },
    { activity_id: "ACT-STEP-AML-11-02", step_id: "STEP-AML-11", expected_event_type: "fiu_ack_received", expected_evidence_type: "EVD-LOG", mandatory_flag: true }
  ],

  sourceSystems: [
    { source_system_id: "SS-CBS-FINACLE", system_type: "CBS", vendor: "Infosys Finacle", integration_mode: "Kafka+CDC", expected_latency_ms: 2000, system_of_record_flag: true, status: "healthy", wave: 1 },
    { source_system_id: "SS-LOS-NEWGEN", system_type: "LOS", vendor: "Newgen", integration_mode: "Kafka+API", expected_latency_ms: 5000, system_of_record_flag: true, status: "healthy", wave: 1 },
    { source_system_id: "SS-AML-FCCM", system_type: "AML-engine", vendor: "Oracle FCCM", integration_mode: "API+Batch", expected_latency_ms: 60000, system_of_record_flag: true, status: "degraded", wave: 1 },
    { source_system_id: "SS-SANC-FIRCO", system_type: "Sanctions", vendor: "Fircosoft", integration_mode: "API", expected_latency_ms: 1000, system_of_record_flag: false, status: "healthy", wave: 1 },
    { source_system_id: "SS-CKYCR", system_type: "CKYCR", vendor: "CERSAI/CKYCR", integration_mode: "SFTP+API", expected_latency_ms: 86400000, system_of_record_flag: false, status: "degraded", wave: 1 },
    { source_system_id: "SS-CASE-PEGA", system_type: "Case-Mgmt", vendor: "Pega", integration_mode: "API", expected_latency_ms: 5000, system_of_record_flag: true, status: "healthy", wave: 1 },
    { source_system_id: "SS-NPCI-UPI", system_type: "NPCI-UPI", vendor: "NPCI", integration_mode: "API", expected_latency_ms: 500, system_of_record_flag: true, status: "not_integrated", wave: 2 },
    { source_system_id: "SS-ITSM-SNOW", system_type: "ITSM", vendor: "ServiceNow", integration_mode: "API", expected_latency_ms: 5000, system_of_record_flag: true, status: "not_integrated", wave: 2 },
    { source_system_id: "SS-SIEM-SPLUNK", system_type: "SIEM", vendor: "Splunk", integration_mode: "Syslog", expected_latency_ms: 10000, system_of_record_flag: true, status: "not_integrated", wave: 2 },
    { source_system_id: "SS-FIU-OUT", system_type: "FIU-Outbound", vendor: "FIU-IND FINnet 2.0", integration_mode: "SFTP", expected_latency_ms: 86400000, system_of_record_flag: false, status: "not_integrated", wave: 2 }
  ],

  sourceRecords: [
    { source_record_id: "SR-CBS-UCIC-127-ACT", source_system_id: "SS-CBS-FINACLE", source_table_or_api: "cbs.customer_master + cbs.account_event", source_primary_key: "UCIC-2024-00127", payload_hash: "sha256:a7f3...127act", event_timestamp: "2024-08-12T11:42:00Z", ingestion_timestamp: "2024-08-12T11:42:31Z", validation_status: "valid", correlation_status: "matched", key_fields_preview: { ucic: "UCIC-2024-00127", account_id: "ACC-MSPB-9921-127", activation_at: "2024-08-12T11:42:00Z", risk_category: "low", account_type: "DBT_scholarship" } },
    { source_record_id: "SR-CKYCR-127-ACK", source_system_id: "SS-CKYCR", source_table_or_api: "ckycr.upload_ack_batch", source_primary_key: "CKYCR-ACK-2024-08-15-MSPB-127", payload_hash: "sha256:b3e2...127ack", event_timestamp: "2024-08-15T18:09:00Z", ingestion_timestamp: "2024-08-19T03:11:00Z", validation_status: "valid", correlation_status: "late_arriving", key_fields_preview: { ucic: "UCIC-2024-00127", ckycr_ack_id: "CKYCR-ACK-2024-08-15-MSPB-127", upload_at: "2024-08-15T18:09:00Z" } },
    { source_record_id: "SR-CBS-UCIC-127-REKYC-NULL", source_system_id: "SS-CBS-FINACLE", source_table_or_api: "cbs.kyc_schedule", source_primary_key: "UCIC-2024-00127:RE_KYC", payload_hash: "sha256:c1d4...rekyc", event_timestamp: "2024-08-12T11:43:00Z", ingestion_timestamp: "2024-08-12T11:44:00Z", validation_status: "field_missing", correlation_status: "needs_review", key_fields_preview: { ucic: "UCIC-2024-00127", re_kyc_due_date: null, dbt_cohort_flag: true } },
    { source_record_id: "SR-CBS-UCIC-123-ACT", source_system_id: "SS-CBS-FINACLE", source_table_or_api: "cbs.customer_master", source_primary_key: "UCIC-2024-00123", payload_hash: "sha256:55a1...123", event_timestamp: "2024-06-01T09:15:00Z", ingestion_timestamp: "2024-06-01T09:15:21Z", validation_status: "valid", correlation_status: "matched", key_fields_preview: { ucic: "UCIC-2024-00123", account_id: "ACC-MSPB-9921-123", risk_category: "low", account_type: "retail" } },
    { source_record_id: "SR-CBS-UCIC-126-ACT", source_system_id: "SS-CBS-FINACLE", source_table_or_api: "cbs.customer_master", source_primary_key: "UCIC-2024-00126", payload_hash: "sha256:66b2...126", event_timestamp: "2024-07-22T13:00:00Z", ingestion_timestamp: "2024-07-22T13:00:18Z", validation_status: "valid", correlation_status: "matched", key_fields_preview: { ucic: "UCIC-2024-00126", account_id: "ACC-MSPB-9921-126", risk_category: "high", account_type: "NRI", edd_required: true } },
    { source_record_id: "SR-CKYCR-123-ACK", source_system_id: "SS-CKYCR", source_table_or_api: "ckycr.upload_ack_batch", source_primary_key: "CKYCR-ACK-2024-06-03-MSPB-123", payload_hash: "sha256:77c3...123ack", event_timestamp: "2024-06-03T11:22:00Z", ingestion_timestamp: "2024-06-03T12:01:00Z", validation_status: "valid", correlation_status: "matched", key_fields_preview: { ucic: "UCIC-2024-00123", ckycr_ack_id: "CKYCR-ACK-2024-06-03-MSPB-123" } },
    { source_record_id: "SR-AML-ALRT-502-GEN", source_system_id: "SS-AML-FCCM", source_table_or_api: "fccm.alert", source_primary_key: "AML-ALRT-2024-00502", payload_hash: "sha256:11d5...502gen", event_timestamp: "2024-11-08T07:14:22Z", ingestion_timestamp: "2024-11-08T07:14:55Z", validation_status: "valid", correlation_status: "matched", key_fields_preview: { alert_id: "AML-ALRT-2024-00502", scenario_id: "RAPID-FUNNEL-OUT", subject_ucic: "UCIC-2024-00118", account_id: "ACC-MSPB-9921-118", scenario_version: "v3.4" } },
    { source_record_id: "SR-CASE-AML-502-OPEN", source_system_id: "SS-CASE-PEGA", source_table_or_api: "case_mgmt.case", source_primary_key: "CASE-2024-11-08-3411", payload_hash: "sha256:22e6...502case", event_timestamp: "2024-11-08T07:18:00Z", ingestion_timestamp: "2024-11-08T07:19:11Z", validation_status: "valid", correlation_status: "matched", key_fields_preview: { case_id: "CASE-2024-11-08-3411", linked_alert_id: "AML-ALRT-2024-00502", l1_owner: "BPO-VEND-2024-00203", queue: "FCC-L1-MUMBAI", opened_at: "2024-11-08T07:18:00Z" } },
    { source_record_id: "SR-CASE-AML-502-DISPO-MISSING", source_system_id: "SS-CASE-PEGA", source_table_or_api: "case_mgmt.disposition", source_primary_key: "CASE-2024-11-08-3411:L1_ACTION", payload_hash: null, event_timestamp: null, ingestion_timestamp: null, validation_status: "not_received", correlation_status: "orphan", key_fields_preview: { case_id: "CASE-2024-11-08-3411", l1_disposed_at: null, expected_by: "2024-11-15T07:18:00Z" } },
    { source_record_id: "SR-AML-ALRT-501-DISPO", source_system_id: "SS-CASE-PEGA", source_table_or_api: "case_mgmt.disposition", source_primary_key: "CASE-2024-11-02-2891:L1_ACTION", payload_hash: "sha256:33f7...501dispo", event_timestamp: "2024-11-04T16:30:00Z", ingestion_timestamp: "2024-11-04T16:30:55Z", validation_status: "valid", correlation_status: "matched", key_fields_preview: { case_id: "CASE-2024-11-02-2891", linked_alert_id: "AML-ALRT-2024-00501", l1_disposition: "escalated", l1_disposed_at: "2024-11-04T16:30:00Z" } },
    { source_record_id: "SR-FIU-501-ACK", source_system_id: "SS-FIU-OUT", source_table_or_api: "fiu.finnet2.ack_log", source_primary_key: "FIU-ACK-2024-11-06-MSPB-00781", payload_hash: "sha256:44a8...501fiuack", event_timestamp: "2024-11-06T10:11:00Z", ingestion_timestamp: "2024-11-06T10:11:42Z", validation_status: "valid", correlation_status: "matched", key_fields_preview: { fiu_ack_id: "FIU-ACK-2024-11-06-MSPB-00781", linked_alert_id: "AML-ALRT-2024-00501", str_filed_at: "2024-11-06T09:45:00Z" } },
    { source_record_id: "SR-LOS-DL-884-KFS-EVT", source_system_id: "SS-LOS-NEWGEN", source_table_or_api: "los.event_stream", source_primary_key: "LOS-EVT-DL-APP-2024-00884:KFS_ISSUED", payload_hash: "sha256:55b9...884kfs", event_timestamp: "2024-12-15T11:08:14Z", ingestion_timestamp: "2024-12-15T11:08:32Z", validation_status: "valid", correlation_status: "timestamp_reversal", key_fields_preview: { loan_application_id: "DL-APP-2024-00884", channel: "DSA-Newgen", event: "KFS_ISSUED", kfs_issued_at: "2024-12-15T11:08:14Z", kfs_hash: "sha256:abc...kfs884" } },
    { source_record_id: "SR-LOS-DL-884-BACC-EVT", source_system_id: "SS-LOS-NEWGEN", source_table_or_api: "los.event_stream", source_primary_key: "LOS-EVT-DL-APP-2024-00884:BORROWER_ACCEPT", payload_hash: "sha256:66ca...884bacc", event_timestamp: "2024-12-15T10:55:02Z", ingestion_timestamp: "2024-12-15T10:55:20Z", validation_status: "valid", correlation_status: "timestamp_reversal", key_fields_preview: { loan_application_id: "DL-APP-2024-00884", channel: "DSA-Newgen", event: "BORROWER_ACCEPT", borrower_acceptance_at: "2024-12-15T10:55:02Z" } },
    { source_record_id: "SR-LOS-DL-881-KFS-EVT", source_system_id: "SS-LOS-NEWGEN", source_table_or_api: "los.event_stream", source_primary_key: "LOS-EVT-DL-APP-2024-00881:KFS_ISSUED", payload_hash: "sha256:77db...881kfs", event_timestamp: "2024-11-04T09:01:00Z", ingestion_timestamp: "2024-11-04T09:01:18Z", validation_status: "valid", correlation_status: "matched", key_fields_preview: { loan_application_id: "DL-APP-2024-00881", channel: "DLA", event: "KFS_ISSUED", kfs_issued_at: "2024-11-04T09:01:00Z" } },
    { source_record_id: "SR-LOS-DL-881-BACC-EVT", source_system_id: "SS-LOS-NEWGEN", source_table_or_api: "los.event_stream", source_primary_key: "LOS-EVT-DL-APP-2024-00881:BORROWER_ACCEPT", payload_hash: "sha256:88ec...881bacc", event_timestamp: "2024-11-04T11:30:00Z", ingestion_timestamp: "2024-11-04T11:30:14Z", validation_status: "valid", correlation_status: "matched", key_fields_preview: { loan_application_id: "DL-APP-2024-00881", channel: "DLA", event: "BORROWER_ACCEPT", borrower_acceptance_at: "2024-11-04T11:30:00Z" } },
    { source_record_id: "SR-VMO-VND-205-FOURTH-NULL", source_system_id: "SS-CBS-FINACLE", source_table_or_api: "vmo.vendor_disclosure", source_primary_key: "VEND-2024-00205:FOURTH_PARTY", payload_hash: null, event_timestamp: null, ingestion_timestamp: "2024-09-30T14:00:00Z", validation_status: "field_missing", correlation_status: "orphan", key_fields_preview: { vendor_id: "VEND-2024-00205", parent_vendor_id: "VEND-2024-00203", fourth_party_disclosed_flag: false } },
    { source_record_id: "SR-AML-ALRT-505-MULE", source_system_id: "SS-AML-FCCM", source_table_or_api: "fccm.alert", source_primary_key: "AML-ALRT-2024-00505", payload_hash: "sha256:99fd...505", event_timestamp: "2024-11-21T19:42:00Z", ingestion_timestamp: "2024-11-21T19:42:14Z", validation_status: "valid", correlation_status: "matched_with_warning", key_fields_preview: { alert_id: "AML-ALRT-2024-00505", scenario_id: "UPI-MULE-NETWORK", subject_ucic: "UCIC-2024-00204", linked_npci_feedback: "pending" } }
  ],

  correlationRecords: [
    { correlation_id: "CR-001", from_entity_type: "sourceRecord", from_entity_id: "SR-CBS-UCIC-127-ACT", to_entity_type: "sourceRecord", to_entity_id: "SR-CKYCR-127-ACK", primary_key_used: "ucic", backup_key_used: "account_id", match_method: "exact", match_confidence: 1.0, expected_cardinality: "1:1", actual_cardinality: "1:1", correlation_status: "late_arriving", explanation: "CKYCR ack received T+3d (SLA 72h breached by ~22h)" },
    { correlation_id: "CR-002", from_entity_type: "sourceRecord", from_entity_id: "SR-CBS-UCIC-127-ACT", to_entity_type: "sourceRecord", to_entity_id: "SR-CBS-UCIC-127-REKYC-NULL", primary_key_used: "ucic", backup_key_used: null, match_method: "exact", match_confidence: 1.0, expected_cardinality: "1:1", actual_cardinality: "1:1", correlation_status: "needs_review", explanation: "re_kyc_due_date NULL on DBT cohort — AI-016 cluster member" },
    { correlation_id: "CR-003", from_entity_type: "sourceRecord", from_entity_id: "SR-AML-ALRT-502-GEN", to_entity_type: "sourceRecord", to_entity_id: "SR-CASE-AML-502-OPEN", primary_key_used: "alert_id", backup_key_used: null, match_method: "exact", match_confidence: 1.0, expected_cardinality: "1:1", actual_cardinality: "1:1", correlation_status: "matched", explanation: "case opened on alert generation" },
    { correlation_id: "CR-004", from_entity_type: "sourceRecord", from_entity_id: "SR-CASE-AML-502-OPEN", to_entity_type: "sourceRecord", to_entity_id: "SR-CASE-AML-502-DISPO-MISSING", primary_key_used: "case_id", backup_key_used: null, match_method: "exact", match_confidence: 1.0, expected_cardinality: "1:1", actual_cardinality: "1:0", correlation_status: "orphan", explanation: "L1_ACTION row never produced; BPO L1 SLA breach >7BD" },
    { correlation_id: "CR-005", from_entity_type: "sourceRecord", from_entity_id: "SR-LOS-DL-884-KFS-EVT", to_entity_type: "sourceRecord", to_entity_id: "SR-LOS-DL-884-BACC-EVT", primary_key_used: "loan_application_id", backup_key_used: null, match_method: "exact", match_confidence: 1.0, expected_cardinality: "1:1", actual_cardinality: "1:1", correlation_status: "timestamp_reversal", explanation: "borrower_acceptance_at (10:55:02Z) precedes kfs_issued_at (11:08:14Z) — OBL-RBI-DL-001 violation; AI-013 fired" },
    { correlation_id: "CR-006", from_entity_type: "sourceRecord", from_entity_id: "SR-LOS-DL-881-KFS-EVT", to_entity_type: "sourceRecord", to_entity_id: "SR-LOS-DL-881-BACC-EVT", primary_key_used: "loan_application_id", backup_key_used: null, match_method: "exact", match_confidence: 1.0, expected_cardinality: "1:1", actual_cardinality: "1:1", correlation_status: "matched", explanation: "kfs_issued_at < borrower_acceptance_at — Pass" },
    { correlation_id: "CR-007", from_entity_type: "sourceRecord", from_entity_id: "SR-AML-ALRT-501-DISPO", to_entity_type: "sourceRecord", to_entity_id: "SR-FIU-501-ACK", primary_key_used: "linked_alert_id", backup_key_used: null, match_method: "exact", match_confidence: 1.0, expected_cardinality: "1:1", actual_cardinality: "1:1", correlation_status: "matched", explanation: "STR filed within SLA; FIU ack stored" },
    { correlation_id: "CR-008", from_entity_type: "sourceRecord", from_entity_id: "SR-VMO-VND-205-FOURTH-NULL", to_entity_type: null, to_entity_id: null, primary_key_used: "vendor_id", backup_key_used: null, match_method: "exact", match_confidence: 1.0, expected_cardinality: "1:1", actual_cardinality: "1:0", correlation_status: "orphan", explanation: "fourth-party disclosure missing — AI-009 candidate" },
    { correlation_id: "CR-009", from_entity_type: "sourceRecord", from_entity_id: "SR-AML-ALRT-505-MULE", to_entity_type: null, to_entity_id: null, primary_key_used: "alert_id", backup_key_used: null, match_method: "exact", match_confidence: 0.85, expected_cardinality: "1:N", actual_cardinality: "1:0", correlation_status: "matched_with_warning", explanation: "NPCI feedback feed not yet integrated (Wave 2)" },
    { correlation_id: "CR-010", from_entity_type: "sourceRecord", from_entity_id: "SR-CBS-UCIC-123-ACT", to_entity_type: "sourceRecord", to_entity_id: "SR-CKYCR-123-ACK", primary_key_used: "ucic", backup_key_used: null, match_method: "exact", match_confidence: 1.0, expected_cardinality: "1:1", actual_cardinality: "1:1", correlation_status: "matched", explanation: "CKYCR ack on time" }
  ],

  processExecutions: [
    { process_execution_id: "PE-KYC-UCIC-2024-00123", process_id: "PROC-KYC-001", anchor_key_value: "UCIC-2024-00123", status: "activated", variant_signature: "BPO-onboarded", control_instance_count: 8, evidence_completeness: 96, started_at: "2024-06-01T09:00:00Z", closed_at: "2024-06-03T12:01:00Z" },
    { process_execution_id: "PE-KYC-UCIC-2024-00126", process_id: "PROC-KYC-001", anchor_key_value: "UCIC-2024-00126", status: "activated", variant_signature: "branch-onboarded-EDD", control_instance_count: 9, evidence_completeness: 92, started_at: "2024-07-22T12:30:00Z", closed_at: "2024-07-25T18:14:00Z" },
    { process_execution_id: "PE-KYC-UCIC-2024-00127", process_id: "PROC-KYC-001", anchor_key_value: "UCIC-2024-00127", status: "activated_with_data_gap", variant_signature: "BPO-onboarded-DBT", control_instance_count: 8, evidence_completeness: 71, started_at: "2024-08-12T11:00:00Z", closed_at: "2024-08-19T03:11:00Z" },
    { process_execution_id: "PE-AML-AML-ALRT-2024-00501", process_id: "PROC-AML-001", anchor_key_value: "AML-ALRT-2024-00501", status: "str_filed", variant_signature: "L1-escalated-STR-filed", control_instance_count: 5, evidence_completeness: 95, started_at: "2024-11-02T14:22:00Z", closed_at: "2024-11-06T10:11:00Z" },
    { process_execution_id: "PE-AML-AML-ALRT-2024-00502", process_id: "PROC-AML-001", anchor_key_value: "AML-ALRT-2024-00502", status: "l1_overdue", variant_signature: "L1-overdue-7BD", control_instance_count: 4, evidence_completeness: 38, started_at: "2024-11-08T07:14:22Z", closed_at: null },
    { process_execution_id: "PE-AML-AML-ALRT-2024-00505", process_id: "PROC-AML-001", anchor_key_value: "AML-ALRT-2024-00505", status: "l2_review", variant_signature: "UPI-mule-AI-001-Wave2", control_instance_count: 3, evidence_completeness: 62, started_at: "2024-11-21T19:42:00Z", closed_at: null },
    { process_execution_id: "PE-LND-DL-APP-2024-00881", process_id: "PROC-LND-001", anchor_key_value: "DL-APP-2024-00881", status: "booked", variant_signature: "DLA-clean", control_instance_count: 7, evidence_completeness: 98, started_at: "2024-11-04T08:30:00Z", closed_at: "2024-11-05T15:22:00Z" },
    { process_execution_id: "PE-LND-DL-APP-2024-00882", process_id: "PROC-LND-001", anchor_key_value: "DL-APP-2024-00882", status: "booked", variant_signature: "MSME-co-lending", control_instance_count: 8, evidence_completeness: 94, started_at: "2024-12-01T10:00:00Z", closed_at: "2024-12-04T17:00:00Z" },
    { process_execution_id: "PE-LND-DL-APP-2024-00884", process_id: "PROC-LND-001", anchor_key_value: "DL-APP-2024-00884", status: "failed_control", variant_signature: "DSA-Newgen-clock-drift", control_instance_count: 7, evidence_completeness: 88, started_at: "2024-12-15T09:30:00Z", closed_at: "2024-12-15T13:20:00Z" },
    { process_execution_id: "PE-LND-DL-APP-2024-00885", process_id: "PROC-LND-001", anchor_key_value: "DL-APP-2024-00885", status: "rejected", variant_signature: "DLA-adverse-action", control_instance_count: 5, evidence_completeness: 90, started_at: "2024-12-20T11:00:00Z", closed_at: "2024-12-21T09:18:00Z" },
    { process_execution_id: "PE-VND-VEND-2024-00203", process_id: "PROC-VND-001", anchor_key_value: "VEND-2024-00203", status: "approved", variant_signature: "material-BPO", control_instance_count: 6, evidence_completeness: 92, started_at: "2024-04-12T10:00:00Z", closed_at: "2024-05-22T17:00:00Z" },
    { process_execution_id: "PE-VND-VEND-2024-00205", process_id: "PROC-VND-001", anchor_key_value: "VEND-2024-00205", status: "failed_control", variant_signature: "fourth-party-undisclosed", control_instance_count: 4, evidence_completeness: 56, started_at: "2024-09-15T10:00:00Z", closed_at: "2024-09-30T14:00:00Z" }
  ],

  stepExecutions: [
    { step_execution_id: "SE-KYC-127-11", process_execution_id: "PE-KYC-UCIC-2024-00127", step_id: "STEP-KYC-11", actual_actor_type: "BPO", actual_system: "SS-CKYCR", start_ts: "2024-08-15T17:55:00Z", end_ts: "2024-08-19T03:11:00Z", skipped_step_flag: false, manual_override_flag: false, bpo_or_vendor_flag: true, source_record_ids: ["SR-CKYCR-127-ACK"], deviation_note: "ack ingestion delayed beyond 72h SLA" },
    { step_execution_id: "SE-KYC-127-12", process_execution_id: "PE-KYC-UCIC-2024-00127", step_id: "STEP-KYC-12", actual_actor_type: "system", actual_system: "SS-CBS-FINACLE", start_ts: "2024-08-12T11:42:00Z", end_ts: "2024-08-12T11:42:00Z", skipped_step_flag: false, manual_override_flag: false, bpo_or_vendor_flag: false, source_record_ids: ["SR-CBS-UCIC-127-ACT"], deviation_note: null },
    { step_execution_id: "SE-KYC-127-13", process_execution_id: "PE-KYC-UCIC-2024-00127", step_id: "STEP-KYC-13", actual_actor_type: "system", actual_system: "SS-CBS-FINACLE", start_ts: "2024-08-12T11:43:00Z", end_ts: "2024-08-12T11:43:00Z", skipped_step_flag: false, manual_override_flag: false, bpo_or_vendor_flag: false, source_record_ids: ["SR-CBS-UCIC-127-REKYC-NULL"], deviation_note: "re_kyc_due_date null for DBT cohort" },
    { step_execution_id: "SE-AML-502-04", process_execution_id: "PE-AML-AML-ALRT-2024-00502", step_id: "STEP-AML-04", actual_actor_type: "BPO", actual_system: "SS-CASE-PEGA", start_ts: "2024-11-08T07:18:00Z", end_ts: null, skipped_step_flag: false, manual_override_flag: false, bpo_or_vendor_flag: true, source_record_ids: ["SR-CASE-AML-502-OPEN"], deviation_note: "VEND-2024-00203 BPO floor capacity backlog; >7BD SLA breach" },
    { step_execution_id: "SE-AML-502-05", process_execution_id: "PE-AML-AML-ALRT-2024-00502", step_id: "STEP-AML-05", actual_actor_type: "BPO", actual_system: "SS-CASE-PEGA", start_ts: null, end_ts: null, skipped_step_flag: false, manual_override_flag: false, bpo_or_vendor_flag: true, source_record_ids: ["SR-CASE-AML-502-DISPO-MISSING"], deviation_note: "L1 disposition not produced — orphan correlation CR-004" },
    { step_execution_id: "SE-AML-501-05", process_execution_id: "PE-AML-AML-ALRT-2024-00501", step_id: "STEP-AML-05", actual_actor_type: "BPO", actual_system: "SS-CASE-PEGA", start_ts: "2024-11-04T15:00:00Z", end_ts: "2024-11-04T16:30:00Z", skipped_step_flag: false, manual_override_flag: false, bpo_or_vendor_flag: true, source_record_ids: ["SR-AML-ALRT-501-DISPO"], deviation_note: null },
    { step_execution_id: "SE-AML-501-11", process_execution_id: "PE-AML-AML-ALRT-2024-00501", step_id: "STEP-AML-11", actual_actor_type: "internal", actual_system: "SS-FIU-OUT", start_ts: "2024-11-06T09:30:00Z", end_ts: "2024-11-06T10:11:00Z", skipped_step_flag: false, manual_override_flag: false, bpo_or_vendor_flag: false, source_record_ids: ["SR-FIU-501-ACK"], deviation_note: null },
    { step_execution_id: "SE-LND-884-09", process_execution_id: "PE-LND-DL-APP-2024-00884", step_id: "STEP-LND-09", actual_actor_type: "system", actual_system: "SS-LOS-NEWGEN", start_ts: "2024-12-15T11:08:14Z", end_ts: "2024-12-15T11:08:14Z", skipped_step_flag: false, manual_override_flag: false, bpo_or_vendor_flag: false, source_record_ids: ["SR-LOS-DL-884-KFS-EVT"], deviation_note: "kfs_issued_at AFTER borrower_acceptance_at — sequence violation" },
    { step_execution_id: "SE-LND-884-10", process_execution_id: "PE-LND-DL-APP-2024-00884", step_id: "STEP-LND-10", actual_actor_type: "system", actual_system: "SS-LOS-NEWGEN", start_ts: "2024-12-15T10:55:02Z", end_ts: "2024-12-15T10:55:02Z", skipped_step_flag: false, manual_override_flag: false, bpo_or_vendor_flag: false, source_record_ids: ["SR-LOS-DL-884-BACC-EVT"], deviation_note: "captured before KFS due to LOS event-stream NTP drift on DSA channel" },
    { step_execution_id: "SE-LND-881-09", process_execution_id: "PE-LND-DL-APP-2024-00881", step_id: "STEP-LND-09", actual_actor_type: "system", actual_system: "SS-LOS-NEWGEN", start_ts: "2024-11-04T09:01:00Z", end_ts: "2024-11-04T09:01:00Z", skipped_step_flag: false, manual_override_flag: false, bpo_or_vendor_flag: false, source_record_ids: ["SR-LOS-DL-881-KFS-EVT"], deviation_note: null },
    { step_execution_id: "SE-LND-881-10", process_execution_id: "PE-LND-DL-APP-2024-00881", step_id: "STEP-LND-10", actual_actor_type: "system", actual_system: "SS-LOS-NEWGEN", start_ts: "2024-11-04T11:30:00Z", end_ts: "2024-11-04T11:30:00Z", skipped_step_flag: false, manual_override_flag: false, bpo_or_vendor_flag: false, source_record_ids: ["SR-LOS-DL-881-BACC-EVT"], deviation_note: null },
    { step_execution_id: "SE-VND-205-09", process_execution_id: "PE-VND-VEND-2024-00205", step_id: "STEP-VND-09", actual_actor_type: "internal", actual_system: "SS-CBS-FINACLE", start_ts: "2024-09-15T10:00:00Z", end_ts: "2024-09-30T14:00:00Z", skipped_step_flag: true, manual_override_flag: false, bpo_or_vendor_flag: false, source_record_ids: ["SR-VMO-VND-205-FOURTH-NULL"], deviation_note: "fourth-party identification skipped — disclosure missing" }
  ],

  controlInstances: [
    { control_instance_id: "CI-CTRL-KYC-003-UCIC127", control_id: "CTRL-KYC-003", process_execution_id: "PE-KYC-UCIC-2024-00127", step_execution_id: "SE-KYC-127-11", subject_id: "UCIC-2024-00127", outcome: "EvidenceGap", fire_ts: "2024-08-15T17:55:00Z", latency_ms: 290000, evidence_ids: ["EV-LOG-CKYCR-127", "EV-DOC-RE-KYC-127"], exception_id: "EX-KYC-127-RE-KYC-NULL", override_reason: null, fail_reason: null, data_gap_reason: null, evidence_gap_reason: "ckycr_ack_id received late (T+3d, beyond 72h SLA); re_kyc_due_date null on DBT cohort SourceRecord SR-CBS-UCIC-127-REKYC-NULL" },
    { control_instance_id: "CI-CTRL-KYC-003-UCIC123", control_id: "CTRL-KYC-003", process_execution_id: "PE-KYC-UCIC-2024-00123", step_execution_id: null, subject_id: "UCIC-2024-00123", outcome: "Pass", fire_ts: "2024-06-03T12:01:00Z", latency_ms: 120000, evidence_ids: ["EV-LOG-CKYCR-123"], exception_id: null, override_reason: null, fail_reason: null, data_gap_reason: null, evidence_gap_reason: null },
    { control_instance_id: "CI-CTRL-KYC-001-UCIC127", control_id: "CTRL-KYC-001", process_execution_id: "PE-KYC-UCIC-2024-00127", step_execution_id: null, subject_id: "UCIC-2024-00127", outcome: "Pass", fire_ts: "2024-08-12T11:30:00Z", latency_ms: 1200, evidence_ids: ["EV-LOG-SCREEN-127"], exception_id: null, override_reason: null, fail_reason: null, data_gap_reason: null, evidence_gap_reason: null },
    { control_instance_id: "CI-CTRL-KYC-002-UCIC127", control_id: "CTRL-KYC-002", process_execution_id: "PE-KYC-UCIC-2024-00127", step_execution_id: null, subject_id: "UCIC-2024-00127", outcome: "Pass", fire_ts: "2024-08-12T11:35:00Z", latency_ms: 980, evidence_ids: ["EV-BIO-AADHAAR-127"], exception_id: null, override_reason: null, fail_reason: null, data_gap_reason: null, evidence_gap_reason: null },
    { control_instance_id: "CI-CTRL-KYC-005-UCIC126", control_id: "CTRL-KYC-005", process_execution_id: "PE-KYC-UCIC-2024-00126", step_execution_id: null, subject_id: "UCIC-2024-00126", outcome: "Pass", fire_ts: "2024-07-25T18:00:00Z", latency_ms: 7200000, evidence_ids: ["EV-DOC-EDD-126"], exception_id: null, override_reason: null, fail_reason: null, data_gap_reason: null, evidence_gap_reason: null },
    { control_instance_id: "CI-CTRL-AML-002-AML502", control_id: "CTRL-AML-002", process_execution_id: "PE-AML-AML-ALRT-2024-00502", step_execution_id: "SE-AML-502-05", subject_id: "AML-ALRT-2024-00502", outcome: "Fail", fire_ts: "2024-11-15T07:18:00Z", latency_ms: null, evidence_ids: ["EV-LOG-CASE-502"], exception_id: "EX-AML-502-L1-SLA", override_reason: null, fail_reason: "L1_SLA_BREACH — disposition not produced within 5 BD; orphan correlation CR-004", data_gap_reason: null, evidence_gap_reason: null },
    { control_instance_id: "CI-CTRL-AML-002-AML501", control_id: "CTRL-AML-002", process_execution_id: "PE-AML-AML-ALRT-2024-00501", step_execution_id: "SE-AML-501-05", subject_id: "AML-ALRT-2024-00501", outcome: "Pass", fire_ts: "2024-11-04T16:30:00Z", latency_ms: 60000, evidence_ids: ["EV-LOG-L1-DISPO-501", "EV-LOG-CASE-501"], exception_id: null, override_reason: null, fail_reason: null, data_gap_reason: null, evidence_gap_reason: null },
    { control_instance_id: "CI-CTRL-AML-003-AML501", control_id: "CTRL-AML-003", process_execution_id: "PE-AML-AML-ALRT-2024-00501", step_execution_id: "SE-AML-501-11", subject_id: "AML-ALRT-2024-00501", outcome: "Pass", fire_ts: "2024-11-06T10:11:00Z", latency_ms: 2400000, evidence_ids: ["EV-DOC-STR-501", "EV-LOG-FIU-ACK-501"], exception_id: null, override_reason: null, fail_reason: null, data_gap_reason: null, evidence_gap_reason: null },
    { control_instance_id: "CI-CTRL-AML-003-AML502", control_id: "CTRL-AML-003", process_execution_id: "PE-AML-AML-ALRT-2024-00502", step_execution_id: null, subject_id: "AML-ALRT-2024-00502", outcome: "DataGap", fire_ts: null, latency_ms: null, evidence_ids: [], exception_id: "EX-AML-502-STR-DG", override_reason: null, fail_reason: null, data_gap_reason: "L1 disposition missing (CR-004 orphan); STR clock cannot start; CTRL-AML-003 cannot evaluate", evidence_gap_reason: null },
    { control_instance_id: "CI-CTRL-LND-002-DL884", control_id: "CTRL-LND-002", process_execution_id: "PE-LND-DL-APP-2024-00884", step_execution_id: "SE-LND-884-09", subject_id: "DL-APP-2024-00884", outcome: "Fail", fire_ts: "2024-12-15T11:08:14Z", latency_ms: 230, evidence_ids: ["EV-SIGN-KFS-884", "EV-LOG-LOS-EVT-884-KFS", "EV-LOG-LOS-EVT-884-BACC"], exception_id: "EX-LND-884-KFS-AFTER", override_reason: null, fail_reason: "KFS_AFTER_ACCEPTANCE — kfs_issued_at 2024-12-15T11:08:14Z, borrower_acceptance_at 2024-12-15T10:55:02Z (Δ −13m12s); CR-005 timestamp_reversal", data_gap_reason: null, evidence_gap_reason: null },
    { control_instance_id: "CI-CTRL-LND-002-DL881", control_id: "CTRL-LND-002", process_execution_id: "PE-LND-DL-APP-2024-00881", step_execution_id: "SE-LND-881-09", subject_id: "DL-APP-2024-00881", outcome: "Pass", fire_ts: "2024-11-04T09:01:00Z", latency_ms: 220, evidence_ids: ["EV-SIGN-KFS-881"], exception_id: null, override_reason: null, fail_reason: null, data_gap_reason: null, evidence_gap_reason: null },
    { control_instance_id: "CI-CTRL-LND-002-DL882", control_id: "CTRL-LND-002", process_execution_id: "PE-LND-DL-APP-2024-00882", step_execution_id: null, subject_id: "DL-APP-2024-00882", outcome: "Pass", fire_ts: "2024-12-04T16:00:00Z", latency_ms: 180, evidence_ids: ["EV-SIGN-KFS-882"], exception_id: null, override_reason: null, fail_reason: null, data_gap_reason: null, evidence_gap_reason: null },
    { control_instance_id: "CI-CTRL-LND-001-DL881", control_id: "CTRL-LND-001", process_execution_id: "PE-LND-DL-APP-2024-00881", step_execution_id: null, subject_id: "DL-APP-2024-00881", outcome: "Pass", fire_ts: "2024-11-04T08:55:00Z", latency_ms: 4200, evidence_ids: ["EV-LOG-BUREAU-881"], exception_id: null, override_reason: null, fail_reason: null, data_gap_reason: null, evidence_gap_reason: null },
    { control_instance_id: "CI-CTRL-VND-001-VND205", control_id: "CTRL-VND-001", process_execution_id: "PE-VND-VEND-2024-00205", step_execution_id: "SE-VND-205-09", subject_id: "VEND-2024-00205", outcome: "Fail", fire_ts: "2024-09-30T14:00:00Z", latency_ms: null, evidence_ids: ["EV-DOC-DDQ-205"], exception_id: "EX-VND-205-FOURTH", override_reason: null, fail_reason: "FOURTH_PARTY_NOT_DISCLOSED — fourth_party_disclosed_flag=false; SR-VMO-VND-205-FOURTH-NULL", data_gap_reason: null, evidence_gap_reason: null },
    { control_instance_id: "CI-CTRL-VND-001-VND203", control_id: "CTRL-VND-001", process_execution_id: "PE-VND-VEND-2024-00203", step_execution_id: null, subject_id: "VEND-2024-00203", outcome: "Pass", fire_ts: "2024-05-22T17:00:00Z", latency_ms: 1200000, evidence_ids: ["EV-DOC-DDQ-203", "EV-DOC-SOC-203", "EV-DOC-CONTRACT-203"], exception_id: null, override_reason: null, fail_reason: null, data_gap_reason: null, evidence_gap_reason: null }
  ],

  evidenceRecords: [
    { evidence_id: "EV-LOG-CKYCR-127", evidence_type: "EVD-LOG", source_system_id: "SS-CKYCR", source_record_id: "SR-CKYCR-127-ACK", payload_hash: "sha256:b3e2...127ack", evidence_completeness_score: 65, evidence_status: "Late", freshness_days: 264, retention_class: "PMLA-10y", regulator_ready_flags: { rbi_afi: false, pmla_rule9: true, fiu_finnet: false, statutory: false, concurrent: false } },
    { evidence_id: "EV-DOC-RE-KYC-127", evidence_type: "EVD-DOC", source_system_id: "SS-CBS-FINACLE", source_record_id: "SR-CBS-UCIC-127-REKYC-NULL", payload_hash: null, evidence_completeness_score: 0, evidence_status: "Missing", freshness_days: null, retention_class: "RBI-MD", regulator_ready_flags: { rbi_afi: false, pmla_rule9: false, fiu_finnet: false, statutory: false, concurrent: false } },
    { evidence_id: "EV-LOG-CKYCR-123", evidence_type: "EVD-LOG", source_system_id: "SS-CKYCR", source_record_id: "SR-CKYCR-123-ACK", payload_hash: "sha256:77c3...123ack", evidence_completeness_score: 100, evidence_status: "Complete", freshness_days: 336, retention_class: "PMLA-10y", regulator_ready_flags: { rbi_afi: true, pmla_rule9: true, fiu_finnet: false, statutory: true, concurrent: true } },
    { evidence_id: "EV-LOG-SCREEN-127", evidence_type: "EVD-LOG", source_system_id: "SS-SANC-FIRCO", source_record_id: "SR-CBS-UCIC-127-ACT", payload_hash: "sha256:scrn...127", evidence_completeness_score: 100, evidence_status: "Complete", freshness_days: 264, retention_class: "PMLA-10y", regulator_ready_flags: { rbi_afi: true, pmla_rule9: true, fiu_finnet: true, statutory: true, concurrent: true } },
    { evidence_id: "EV-BIO-AADHAAR-127", evidence_type: "EVD-BIO", source_system_id: "SS-CBS-FINACLE", source_record_id: "SR-CBS-UCIC-127-ACT", payload_hash: "sha256:bio...127", evidence_completeness_score: 100, evidence_status: "Complete", freshness_days: 264, retention_class: "PMLA-10y", regulator_ready_flags: { rbi_afi: true, pmla_rule9: true, fiu_finnet: false, statutory: false, concurrent: false } },
    { evidence_id: "EV-DOC-EDD-126", evidence_type: "EVD-DOC", source_system_id: "SS-CBS-FINACLE", source_record_id: "SR-CBS-UCIC-126-ACT", payload_hash: "sha256:edd...126", evidence_completeness_score: 100, evidence_status: "Complete", freshness_days: 286, retention_class: "PMLA-10y", regulator_ready_flags: { rbi_afi: true, pmla_rule9: true, fiu_finnet: false, statutory: true, concurrent: true } },
    { evidence_id: "EV-LOG-CASE-502", evidence_type: "EVD-LOG", source_system_id: "SS-CASE-PEGA", source_record_id: "SR-CASE-AML-502-OPEN", payload_hash: "sha256:22e6...502case", evidence_completeness_score: 50, evidence_status: "Partial", freshness_days: 178, retention_class: "PMLA-10y", regulator_ready_flags: { rbi_afi: false, pmla_rule9: true, fiu_finnet: false, statutory: false, concurrent: false } },
    { evidence_id: "EV-LOG-L1-DISPO-501", evidence_type: "EVD-LOG", source_system_id: "SS-CASE-PEGA", source_record_id: "SR-AML-ALRT-501-DISPO", payload_hash: "sha256:33f7...501dispo", evidence_completeness_score: 100, evidence_status: "Complete", freshness_days: 184, retention_class: "PMLA-10y", regulator_ready_flags: { rbi_afi: true, pmla_rule9: true, fiu_finnet: true, statutory: true, concurrent: true } },
    { evidence_id: "EV-LOG-CASE-501", evidence_type: "EVD-LOG", source_system_id: "SS-CASE-PEGA", source_record_id: "SR-AML-ALRT-501-DISPO", payload_hash: "sha256:case...501", evidence_completeness_score: 100, evidence_status: "Complete", freshness_days: 184, retention_class: "PMLA-10y", regulator_ready_flags: { rbi_afi: true, pmla_rule9: true, fiu_finnet: true, statutory: true, concurrent: true } },
    { evidence_id: "EV-DOC-STR-501", evidence_type: "EVD-DOC", source_system_id: "SS-FIU-OUT", source_record_id: "SR-FIU-501-ACK", payload_hash: "sha256:str...501", evidence_completeness_score: 100, evidence_status: "Complete", freshness_days: 182, retention_class: "PMLA-10y", regulator_ready_flags: { rbi_afi: true, pmla_rule9: true, fiu_finnet: true, statutory: false, concurrent: false } },
    { evidence_id: "EV-LOG-FIU-ACK-501", evidence_type: "EVD-LOG", source_system_id: "SS-FIU-OUT", source_record_id: "SR-FIU-501-ACK", payload_hash: "sha256:44a8...501fiuack", evidence_completeness_score: 100, evidence_status: "Complete", freshness_days: 182, retention_class: "PMLA-10y", regulator_ready_flags: { rbi_afi: true, pmla_rule9: true, fiu_finnet: true, statutory: false, concurrent: false } },
    { evidence_id: "EV-SIGN-KFS-884", evidence_type: "EVD-SIGN", source_system_id: "SS-LOS-NEWGEN", source_record_id: "SR-LOS-DL-884-KFS-EVT", payload_hash: "sha256:abc...kfs884", evidence_completeness_score: 100, evidence_status: "Complete", freshness_days: 140, retention_class: "RBI-MD", regulator_ready_flags: { rbi_afi: true, pmla_rule9: true, fiu_finnet: false, statutory: true, concurrent: true } },
    { evidence_id: "EV-LOG-LOS-EVT-884-KFS", evidence_type: "EVD-LOG", source_system_id: "SS-LOS-NEWGEN", source_record_id: "SR-LOS-DL-884-KFS-EVT", payload_hash: "sha256:55b9...884kfs", evidence_completeness_score: 100, evidence_status: "Complete", freshness_days: 140, retention_class: "RBI-MD", regulator_ready_flags: { rbi_afi: true, pmla_rule9: false, fiu_finnet: false, statutory: true, concurrent: true } },
    { evidence_id: "EV-LOG-LOS-EVT-884-BACC", evidence_type: "EVD-LOG", source_system_id: "SS-LOS-NEWGEN", source_record_id: "SR-LOS-DL-884-BACC-EVT", payload_hash: "sha256:66ca...884bacc", evidence_completeness_score: 100, evidence_status: "Complete", freshness_days: 140, retention_class: "RBI-MD", regulator_ready_flags: { rbi_afi: true, pmla_rule9: false, fiu_finnet: false, statutory: true, concurrent: true } },
    { evidence_id: "EV-SIGN-KFS-881", evidence_type: "EVD-SIGN", source_system_id: "SS-LOS-NEWGEN", source_record_id: "SR-LOS-DL-881-KFS-EVT", payload_hash: "sha256:881kfs", evidence_completeness_score: 100, evidence_status: "Complete", freshness_days: 181, retention_class: "RBI-MD", regulator_ready_flags: { rbi_afi: true, pmla_rule9: true, fiu_finnet: false, statutory: true, concurrent: true } },
    { evidence_id: "EV-SIGN-KFS-882", evidence_type: "EVD-SIGN", source_system_id: "SS-LOS-NEWGEN", source_record_id: "SR-LOS-DL-881-KFS-EVT", payload_hash: "sha256:882kfs", evidence_completeness_score: 100, evidence_status: "Complete", freshness_days: 151, retention_class: "RBI-MD", regulator_ready_flags: { rbi_afi: true, pmla_rule9: true, fiu_finnet: false, statutory: true, concurrent: true } },
    { evidence_id: "EV-LOG-BUREAU-881", evidence_type: "EVD-LOG", source_system_id: "SS-LOS-NEWGEN", source_record_id: "SR-LOS-DL-881-KFS-EVT", payload_hash: "sha256:bur...881", evidence_completeness_score: 100, evidence_status: "Complete", freshness_days: 181, retention_class: "RBI-MD", regulator_ready_flags: { rbi_afi: true, pmla_rule9: true, fiu_finnet: false, statutory: true, concurrent: true } },
    { evidence_id: "EV-DOC-DDQ-205", evidence_type: "EVD-DOC", source_system_id: "SS-CBS-FINACLE", source_record_id: "SR-VMO-VND-205-FOURTH-NULL", payload_hash: "sha256:ddq...205", evidence_completeness_score: 60, evidence_status: "Partial", freshness_days: 217, retention_class: "RBI-MD", regulator_ready_flags: { rbi_afi: false, pmla_rule9: false, fiu_finnet: false, statutory: false, concurrent: false } },
    { evidence_id: "EV-DOC-DDQ-203", evidence_type: "EVD-DOC", source_system_id: "SS-CBS-FINACLE", source_record_id: null, payload_hash: "sha256:ddq...203", evidence_completeness_score: 100, evidence_status: "Complete", freshness_days: 348, retention_class: "RBI-MD", regulator_ready_flags: { rbi_afi: true, pmla_rule9: true, fiu_finnet: false, statutory: true, concurrent: true } },
    { evidence_id: "EV-DOC-SOC-203", evidence_type: "EVD-DOC", source_system_id: "SS-CBS-FINACLE", source_record_id: null, payload_hash: "sha256:soc...203", evidence_completeness_score: 100, evidence_status: "Complete", freshness_days: 348, retention_class: "RBI-MD", regulator_ready_flags: { rbi_afi: true, pmla_rule9: false, fiu_finnet: false, statutory: true, concurrent: true } },
    { evidence_id: "EV-DOC-CONTRACT-203", evidence_type: "EVD-DOC", source_system_id: "SS-CBS-FINACLE", source_record_id: null, payload_hash: "sha256:ctr...203", evidence_completeness_score: 100, evidence_status: "Complete", freshness_days: 348, retention_class: "RBI-MD", regulator_ready_flags: { rbi_afi: true, pmla_rule9: true, fiu_finnet: false, statutory: true, concurrent: true } },
    { evidence_id: "EV-WORKPAPER-AML-002", evidence_type: "EVD-WORKPAPER", source_system_id: "SS-CASE-PEGA", source_record_id: null, payload_hash: "sha256:wp...amltest", evidence_completeness_score: 100, evidence_status: "Complete", freshness_days: 5, retention_class: "Concurrent", regulator_ready_flags: { rbi_afi: true, pmla_rule9: true, fiu_finnet: true, statutory: true, concurrent: true } },
    { evidence_id: "EV-REPORT-FIU-CTR-2025-03", evidence_type: "EVD-REPORT", source_system_id: "SS-FIU-OUT", source_record_id: null, payload_hash: "sha256:ctr...0325", evidence_completeness_score: 100, evidence_status: "Complete", freshness_days: 35, retention_class: "PMLA-10y", regulator_ready_flags: { rbi_afi: true, pmla_rule9: true, fiu_finnet: true, statutory: false, concurrent: false } },
    { evidence_id: "EV-REPORT-CIMS-2025-Q1", evidence_type: "EVD-REPORT", source_system_id: "SS-CBS-FINACLE", source_record_id: null, payload_hash: "sha256:cims...q1", evidence_completeness_score: 100, evidence_status: "Complete", freshness_days: 28, retention_class: "RBI-MD", regulator_ready_flags: { rbi_afi: true, pmla_rule9: false, fiu_finnet: false, statutory: false, concurrent: true } },
    { evidence_id: "EV-ATTEST-CCO-CIMS-Q1", evidence_type: "EVD-ATTEST", source_system_id: "SS-CBS-FINACLE", source_record_id: null, payload_hash: "sha256:att...cco", evidence_completeness_score: 100, evidence_status: "Complete", freshness_days: 28, retention_class: "RBI-MD", regulator_ready_flags: { rbi_afi: true, pmla_rule9: false, fiu_finnet: false, statutory: false, concurrent: true } }
  ],

  exceptions: [
    { exception_id: "EX-AML-502-L1-SLA", exception_type: "control_failure", severity: "high", control_instance_id: "CI-CTRL-AML-002-AML502", root_cause_cluster_id: "RCC-BPO-AML-L1-SLA", linked_issue_id: "ISS-2026-009", status: "open", disposition: "BPO L1 floor (VEND-2024-00203) capacity backlog; auto-route to L2" },
    { exception_id: "EX-AML-502-STR-DG", exception_type: "data_gap", severity: "high", control_instance_id: "CI-CTRL-AML-003-AML502", root_cause_cluster_id: "RCC-BPO-AML-L1-SLA", linked_issue_id: "ISS-2026-009", status: "open", disposition: "Awaiting upstream L1 disposition before STR clock can start" },
    { exception_id: "EX-KYC-127-RE-KYC-NULL", exception_type: "evidence_gap", severity: "medium", control_instance_id: "CI-CTRL-KYC-003-UCIC127", root_cause_cluster_id: "RCC-DBT-CKYCR-COHORT", linked_issue_id: "ISS-2026-061", status: "in_remediation", disposition: "Re-KYC schedule script for DBT cohort under deployment" },
    { exception_id: "EX-LND-884-KFS-AFTER", exception_type: "control_failure", severity: "high", control_instance_id: "CI-CTRL-LND-002-DL884", root_cause_cluster_id: "RCC-DSA-LOS-CLOCK", linked_issue_id: "ISS-2026-085", status: "in_remediation", disposition: "LOS NTP attestation + DSA channel sequence check fix in progress" },
    { exception_id: "EX-VND-205-FOURTH", exception_type: "control_failure", severity: "high", control_instance_id: "CI-CTRL-VND-001-VND205", root_cause_cluster_id: null, linked_issue_id: "ISS-2026-027", status: "open", disposition: "Vendor approval blocked pending fourth-party disclosure" }
  ],

  issues: [
    { issue_id: "ISS-2026-009", title: "AML L1 SLA breaches at VEND-2024-00203 BPO floor — STR window at risk on AML-ALRT-2024-00502", severity: "high", status: "open", ageing_days: 22, accountable_senior_manager_id: "SM-MLRO-001", root_cause: "BPO L1 capacity backlog at VEND-2024-00203 Mumbai floor; >7BD SLA breach", rbi_mra_flag: true, section_47a_exposure_flag: "candidate", pmla_exposure_flag: true, linked_control_ids: ["CTRL-AML-002", "CTRL-AML-003"], linked_obligation_ids: ["OBL-PMLA-003", "OBL-FIU-STR-001"], linked_risk_ids: ["R-FC-001", "R-OP-001"], linked_remediation_ids: ["RA-ISS-009-01"], linked_ai_insight_ids: ["AII-AI-018-AML002", "AII-AI-002-AML-STEP04"], opened_at: "2026-04-08T09:00:00Z", closed_at: null },
    { issue_id: "ISS-2026-027", title: "VEND-2024-00205 fourth-party non-disclosure — OBL-RBI-OUTSRC-001 breach", severity: "high", status: "open", ageing_days: 38, accountable_senior_manager_id: "SM-CIO-001", root_cause: "Fourth-party SaaS not disclosed in onboarding; SR-VMO-VND-205-FOURTH-NULL orphan", rbi_mra_flag: true, section_47a_exposure_flag: null, pmla_exposure_flag: false, linked_control_ids: ["CTRL-VND-001"], linked_obligation_ids: ["OBL-RBI-OUTSRC-001"], linked_risk_ids: ["R-TP-001"], linked_remediation_ids: ["RA-ISS-027-01"], linked_ai_insight_ids: [], opened_at: "2026-03-23T14:00:00Z", closed_at: null },
    { issue_id: "ISS-2026-061", title: "CTRL-KYC-003 evidence gap — DBT/scholarship cohort re-KYC schedule null + late CKYCR ack", severity: "medium", status: "in_remediation", ageing_days: 14, accountable_senior_manager_id: "SM-CCO-001", root_cause: "DBT/scholarship cohort onboarding flow lacks re_kyc_due_date population step; CKYCR ack ingestion lag from CERSAI batch", rbi_mra_flag: false, section_47a_exposure_flag: null, pmla_exposure_flag: false, linked_control_ids: ["CTRL-KYC-003"], linked_obligation_ids: ["OBL-RBI-KYC-003", "OBL-RBI-KYC-008"], linked_risk_ids: ["R-CO-001"], linked_remediation_ids: ["RA-ISS-061-01"], linked_ai_insight_ids: ["AII-AI-016-DBT", "AII-AI-005-CKYCR"], opened_at: "2026-04-15T11:30:00Z", closed_at: null },
    { issue_id: "ISS-2026-085", title: "CTRL-LND-002 KFS issued after borrower acceptance — 11,118 instances on DSA-Newgen channel", severity: "high", status: "in_remediation", ageing_days: 9, accountable_senior_manager_id: "SM-CIO-001", root_cause: "LOS event-stream NTP drift on DSA channel causing kfs_issued_at > borrower_acceptance_at sequence reversal", rbi_mra_flag: true, section_47a_exposure_flag: "candidate", pmla_exposure_flag: false, linked_control_ids: ["CTRL-LND-002"], linked_obligation_ids: ["OBL-RBI-DL-001"], linked_risk_ids: ["R-CD-001"], linked_remediation_ids: ["RA-ISS-085-01"], linked_ai_insight_ids: ["AII-AI-013-DL884"], opened_at: "2026-04-20T10:00:00Z", closed_at: null },
    { issue_id: "ISS-2026-103", title: "FIU-IND CTR submission ack ingestion delay — RC-CTR clock at-risk for March 2025 cycle", severity: "medium", status: "open", ageing_days: 6, accountable_senior_manager_id: "SM-MLRO-001", root_cause: "FIU-IND outbound channel still SFTP-based; ack archival not automated", rbi_mra_flag: false, section_47a_exposure_flag: null, pmla_exposure_flag: true, linked_control_ids: [], linked_obligation_ids: ["OBL-FIU-CTR-001"], linked_risk_ids: ["R-FC-001"], linked_remediation_ids: [], linked_ai_insight_ids: ["AII-AI-003-CTR"], opened_at: "2026-04-23T08:00:00Z", closed_at: null },
    { issue_id: "ISS-2026-110", title: "Concurrent audit ICR sign-off pending for 4 Mumbai branches — Q1 cycle", severity: "low", status: "open", ageing_days: 4, accountable_senior_manager_id: "SM-HIA-001", root_cause: "Concurrent auditor onboarding delay at Mumbai West region", rbi_mra_flag: false, section_47a_exposure_flag: null, pmla_exposure_flag: false, linked_control_ids: [], linked_obligation_ids: [], linked_risk_ids: ["R-CO-001"], linked_remediation_ids: [], linked_ai_insight_ids: [], opened_at: "2026-04-25T15:00:00Z", closed_at: null }
  ],

  remediationActions: [
    { action_id: "RA-ISS-009-01", issue_id: "ISS-2026-009", description: "Push API integration: BPO Pega case-mgmt → primary case-mgmt for L1 disposition; capacity uplift at VEND-2024-00203 Mumbai floor (+12 FTE); auto-escalate to L2 on SLA breach >5BD", owner_id: "SM-FCC-001", due_date: "2026-05-15T00:00:00Z", actual_close_date: null, status: "in_progress", retest_required: true, retest_test_execution_id: "TX-AML-002-RETEST", validation_status: "pending" },
    { action_id: "RA-ISS-027-01", issue_id: "ISS-2026-027", description: "Block VEND-2024-00205 in CBS routing until fourth_party_disclosed_flag=true; re-trigger DDQ; raise to RBI under OBL-RBI-OUTSRC-001 voluntary disclosure", owner_id: "SM-CIO-001", due_date: "2026-05-08T00:00:00Z", actual_close_date: null, status: "in_progress", retest_required: true, retest_test_execution_id: null, validation_status: "pending" },
    { action_id: "RA-ISS-061-01", issue_id: "ISS-2026-061", description: "Deploy re_kyc_due_date population script for DBT/scholarship cohort in CBS Finacle; backfill 660 cohort UCICs; engage CERSAI for ack-batch latency improvement", owner_id: "SM-CCO-001", due_date: "2026-05-01T00:00:00Z", actual_close_date: null, status: "in_progress", retest_required: true, retest_test_execution_id: "TX-KYC-003-RETEST", validation_status: "pending" },
    { action_id: "RA-ISS-085-01", issue_id: "ISS-2026-085", description: "Fix LOS event-stream NTP sync on DSA-Newgen channel; add sequence-check guard at STEP-LND-09; halt DSA new product launch until retest passes", owner_id: "SM-CIO-001", due_date: "2026-05-04T00:00:00Z", actual_close_date: null, status: "in_progress", retest_required: true, retest_test_execution_id: "TX-LND-002-RETEST", validation_status: "pending" }
  ],

  seniorManagers: [
    { senior_manager_id: "SM-CEO-001", name: "MD & CEO", role: "MD&CEO", function: "Executive", accountable_processes: ["PROC-KYC-001", "PROC-LND-001", "PROC-AML-001", "PROC-VND-001", "PROC-ITO-001"], accountable_controls: [], accountable_risks: ["R-CO-001", "R-FC-001", "R-CD-001", "R-OP-001"], accountable_obligations: [], saes: 88, last_attestation_date: "2026-04-15T00:00:00Z" },
    { senior_manager_id: "SM-CRO-001", name: "Chief Risk Officer", role: "CRO", function: "Risk", accountable_processes: [], accountable_controls: [], accountable_risks: ["R-FC-001", "R-CR-001", "R-OP-001", "R-TC-001", "R-CD-001"], accountable_obligations: [], saes: 84, last_attestation_date: "2026-04-12T00:00:00Z" },
    { senior_manager_id: "SM-CCO-001", name: "Chief Compliance Officer", role: "CCO", function: "Compliance", accountable_processes: ["PROC-KYC-001", "PROC-LND-001"], accountable_controls: ["CTRL-KYC-001", "CTRL-KYC-002", "CTRL-KYC-003", "CTRL-KYC-005", "CTRL-LND-002"], accountable_risks: ["R-CO-001", "R-CD-001"], accountable_obligations: ["OBL-RBI-KYC-001", "OBL-RBI-KYC-003", "OBL-RBI-KYC-008", "OBL-RBI-DL-001", "OBL-RBI-DL-CIMS"], saes: 78, last_attestation_date: "2026-04-10T00:00:00Z" },
    { senior_manager_id: "SM-MLRO-001", name: "MLRO — Principal Officer", role: "MLRO-PO", function: "Financial Crime", accountable_processes: ["PROC-AML-001"], accountable_controls: ["CTRL-AML-003"], accountable_risks: ["R-FC-001"], accountable_obligations: ["OBL-PMLA-001", "OBL-PMLA-003", "OBL-FIU-STR-001", "OBL-FIU-CTR-001"], saes: 65, last_attestation_date: "2026-03-30T00:00:00Z" },
    { senior_manager_id: "SM-FCC-001", name: "Head of Financial Crime Compliance", role: "Head-of-FCC", function: "Financial Crime", accountable_processes: ["PROC-AML-001", "PROC-UPI-001"], accountable_controls: ["CTRL-AML-002", "CTRL-UPI-001"], accountable_risks: ["R-FC-001", "R-FR-001"], accountable_obligations: [], saes: 62, last_attestation_date: "2026-04-02T00:00:00Z" },
    { senior_manager_id: "SM-CISO-001", name: "Chief Information Security Officer", role: "CISO", function: "IT Risk / Cyber", accountable_processes: ["PROC-ITO-001"], accountable_controls: ["CTRL-ITO-001"], accountable_risks: ["R-TC-001", "R-MR-001"], accountable_obligations: ["OBL-CERT-IN-001", "OBL-RBI-CSITE-001"], saes: 87, last_attestation_date: "2026-04-18T00:00:00Z" },
    { senior_manager_id: "SM-CIO-001", name: "Chief Information Officer", role: "CIO", function: "Technology / Vendor", accountable_processes: ["PROC-VND-001"], accountable_controls: ["CTRL-VND-001", "CTRL-VND-002"], accountable_risks: ["R-TP-001"], accountable_obligations: ["OBL-RBI-OUTSRC-001"], saes: 71, last_attestation_date: "2026-04-05T00:00:00Z" },
    { senior_manager_id: "SM-HIA-001", name: "Head of Internal Audit", role: "HIA", function: "Internal Audit", accountable_processes: [], accountable_controls: [], accountable_risks: [], accountable_obligations: [], saes: 90, last_attestation_date: "2026-04-20T00:00:00Z" },
    { senior_manager_id: "SM-BH-RETAIL-001", name: "Business Head — Retail", role: "Business-Head", function: "Retail Banking", accountable_processes: ["PROC-LND-001"], accountable_controls: ["CTRL-LND-001"], accountable_risks: ["R-CR-001", "R-CD-001"], accountable_obligations: [], saes: 80, last_attestation_date: "2026-04-08T00:00:00Z" },
    { senior_manager_id: "SM-OPS-001", name: "Head of Operations", role: "Operations-Head", function: "Operations", accountable_processes: ["PROC-KYC-001", "PROC-AML-001", "PROC-LND-001"], accountable_controls: [], accountable_risks: ["R-OP-001"], accountable_obligations: [], saes: 75, last_attestation_date: "2026-04-11T00:00:00Z" }
  ],

  decisionEvents: [
    { decision_id: "DE-001", decision_type: "approval", decision_maker_id: "SM-CCO-001", decision_timestamp: "2024-08-12T11:40:00Z", approval_basis: "OVD complete; PAN+Aadhaar verified; risk_category=low (DBT cohort)", linked_entity_ref: { type: "processExecution", id: "PE-KYC-UCIC-2024-00127" }, evidence_ids: ["EV-LOG-SCREEN-127", "EV-BIO-AADHAAR-127"] },
    { decision_id: "DE-002", decision_type: "escalation", decision_maker_id: "SM-FCC-001", decision_timestamp: "2024-11-15T08:00:00Z", approval_basis: "L1 SLA breached >7BD on AML-ALRT-2024-00502; auto-escalate to L2 per RA-ISS-009-01 design", linked_entity_ref: { type: "issue", id: "ISS-2026-009" }, evidence_ids: ["EV-LOG-CASE-502"] },
    { decision_id: "DE-003", decision_type: "veto", decision_maker_id: "SM-CIO-001", decision_timestamp: "2026-04-21T14:00:00Z", approval_basis: "Halt DSA-Newgen new product launch until CTRL-LND-002 retest passes", linked_entity_ref: { type: "issue", id: "ISS-2026-085" }, evidence_ids: ["EV-LOG-LOS-EVT-884-KFS", "EV-LOG-LOS-EVT-884-BACC"] },
    { decision_id: "DE-004", decision_type: "approval", decision_maker_id: "SM-MLRO-001", decision_timestamp: "2024-11-06T09:30:00Z", approval_basis: "Suspicion conclusion confirmed for AML-ALRT-2024-00501; STR drafted", linked_entity_ref: { type: "processExecution", id: "PE-AML-AML-ALRT-2024-00501" }, evidence_ids: ["EV-DOC-STR-501"] },
    { decision_id: "DE-005", decision_type: "approval", decision_maker_id: "SM-CCO-001", decision_timestamp: "2026-04-12T10:00:00Z", approval_basis: "CIMS Q1 2025 quarterly submission attestation per OBL-RBI-DL-CIMS", linked_entity_ref: { type: "reportingSubmission", id: "RS-CIMS-2025-Q1" }, evidence_ids: ["EV-REPORT-CIMS-2025-Q1", "EV-ATTEST-CCO-CIMS-Q1"] },
    { decision_id: "DE-006", decision_type: "override", decision_maker_id: "SM-CCO-001", decision_timestamp: "2024-07-25T17:50:00Z", approval_basis: "EDD completed for high-risk NRI account UCIC-2024-00126; senior approver override per CTRL-KYC-005", linked_entity_ref: { type: "controlInstance", id: "CI-CTRL-KYC-005-UCIC126" }, evidence_ids: ["EV-DOC-EDD-126"] },
    { decision_id: "DE-007", decision_type: "escalation", decision_maker_id: "SM-CRO-001", decision_timestamp: "2026-04-22T11:00:00Z", approval_basis: "ISS-2026-085 + ISS-2026-009 to BRMC for Section 47A exposure review", linked_entity_ref: { type: "issue", id: "ISS-2026-085" }, evidence_ids: [] }
  ],

  attestationEvents: [
    { attestation_id: "AE-001", attestation_type: "cims_certification", attester_id: "SM-CCO-001", scope: "DLA Register Q1 2025", period: "2025-Q1", evidence_ids: ["EV-REPORT-CIMS-2025-Q1", "EV-ATTEST-CCO-CIMS-Q1"], signed_at: "2026-04-12T10:00:00Z" },
    { attestation_id: "AE-002", attestation_type: "period_attestation", attester_id: "SM-CRO-001", scope: "BRMC quarterly risk review", period: "2025-Q1", evidence_ids: [], signed_at: "2026-04-12T11:00:00Z" },
    { attestation_id: "AE-003", attestation_type: "period_attestation", attester_id: "SM-CCO-001", scope: "RBI compliance certificate", period: "2025-Q1", evidence_ids: ["EV-REPORT-CIMS-2025-Q1"], signed_at: "2026-04-10T16:00:00Z" },
    { attestation_id: "AE-004", attestation_type: "ctrl_attestation", attester_id: "SM-MLRO-001", scope: "AML alert population review for CTRL-AML-002", period: "2026-Mar", evidence_ids: ["EV-WORKPAPER-AML-002"], signed_at: "2026-03-30T09:00:00Z" },
    { attestation_id: "AE-005", attestation_type: "icr_signoff", attester_id: "SM-HIA-001", scope: "Concurrent audit Internal Control Review — Mumbai East region", period: "2026-Q1", evidence_ids: [], signed_at: "2026-04-20T17:00:00Z" },
    { attestation_id: "AE-006", attestation_type: "period_attestation", attester_id: "SM-CISO-001", scope: "ITGRCA quarterly cyber posture", period: "2025-Q1", evidence_ids: [], signed_at: "2026-04-18T15:00:00Z" }
  ],

  testExecutions: [
    { test_id: "TX-AML-002-MAR2026", control_id: "CTRL-AML-002", test_type: "population_reperformance", population_size: 1247, tested_count: 1247, exception_count: 47, data_gap_count: 12, evidence_gap_count: 6, result: "Failed", rerunnable_flag: true, population_query_ref: "case_mgmt.case WHERE alert_generated_at BETWEEN '2026-03-01' AND '2026-03-31' AND status IN ('open','escalated')", as_of_date: "2026-04-01T00:00:00Z", evidence_ids: ["EV-WORKPAPER-AML-002"], linked_workpaper_id: "WP-AML-002-Q1" },
    { test_id: "TX-KYC-003-MAR2026", control_id: "CTRL-KYC-003", test_type: "population_reperformance", population_size: 18400, tested_count: 18400, exception_count: 1910, data_gap_count: 660, evidence_gap_count: 530, result: "Failed", rerunnable_flag: true, population_query_ref: "cbs.customer_master WHERE activation_at BETWEEN '2026-03-01' AND '2026-03-31'", as_of_date: "2026-04-01T00:00:00Z", evidence_ids: [], linked_workpaper_id: "WP-KYC-003-Q1" },
    { test_id: "TX-LND-002-DEC2025", control_id: "CTRL-LND-002", test_type: "population_reperformance", population_size: 44120, tested_count: 44120, exception_count: 11118, data_gap_count: 0, evidence_gap_count: 380, result: "Failed", rerunnable_flag: true, population_query_ref: "los.event_stream WHERE event IN ('KFS_ISSUED','BORROWER_ACCEPT') AND ts BETWEEN '2025-12-01' AND '2025-12-31'", as_of_date: "2026-01-05T00:00:00Z", evidence_ids: [], linked_workpaper_id: "WP-LND-002-Q4" },
    { test_id: "TX-AML-002-RETEST", control_id: "CTRL-AML-002", test_type: "retest", population_size: null, tested_count: null, exception_count: null, data_gap_count: null, evidence_gap_count: null, result: "pending", rerunnable_flag: true, population_query_ref: "case_mgmt.case WHERE alert_generated_at >= '2026-05-15' AND linked_remediation_id='RA-ISS-009-01'", as_of_date: null, evidence_ids: [], linked_workpaper_id: null },
    { test_id: "TX-KYC-003-RETEST", control_id: "CTRL-KYC-003", test_type: "retest", population_size: null, tested_count: null, exception_count: null, data_gap_count: null, evidence_gap_count: null, result: "pending", rerunnable_flag: true, population_query_ref: "cbs.customer_master WHERE dbt_cohort_flag=true AND re_kyc_due_date IS NOT NULL", as_of_date: null, evidence_ids: [], linked_workpaper_id: null },
    { test_id: "TX-LND-002-RETEST", control_id: "CTRL-LND-002", test_type: "retest", population_size: null, tested_count: null, exception_count: null, data_gap_count: null, evidence_gap_count: null, result: "pending", rerunnable_flag: true, population_query_ref: "los.event_stream WHERE channel='DSA-Newgen' AND ts >= '2026-05-04'", as_of_date: null, evidence_ids: [], linked_workpaper_id: null }
  ],

  workpapers: [
    { workpaper_id: "WP-AML-002-Q1", control_id: "CTRL-AML-002", obligation_ids: ["OBL-PMLA-001", "OBL-PMLA-003", "OBL-FIU-STR-001"], test_execution_id: "TX-AML-002-MAR2026", sections: ["Cover", "Test Rationale", "Population Definition", "Pass/Fail Logic", "Findings", "Evidence Appendix", "Conclusion", "Reviewer Sign-off", "Retest Requirement"], population_size: 1247, tested_count: 1247, exception_count: 47, evidence_ids: ["EV-WORKPAPER-AML-002", "EV-LOG-CASE-502", "EV-LOG-L1-DISPO-501", "EV-LOG-FIU-ACK-501"], tester_id: "SM-HIA-001", reviewer_id: "SM-MLRO-001", status: "signed", retest_required: true, readiness_flags: { rbi_afi: true, pmla_rule9: true, statutory: true, concurrent: true }, signed_at: "2026-04-25T16:00:00Z", reviewer_signed_at: "2026-04-26T11:00:00Z", signed_by_id: "SM-HIA-001", reviewed_by_id: "SM-MLRO-001" },
    { workpaper_id: "WP-KYC-003-Q1", control_id: "CTRL-KYC-003", obligation_ids: ["OBL-RBI-KYC-003", "OBL-RBI-KYC-008"], test_execution_id: "TX-KYC-003-MAR2026", sections: ["Cover", "Test Rationale", "Population Definition", "Findings", "Evidence Appendix", "Conclusion", "Reviewer Sign-off"], population_size: 18400, tested_count: 18400, exception_count: 1910, evidence_ids: ["EV-LOG-CKYCR-127", "EV-DOC-RE-KYC-127"], tester_id: "SM-HIA-001", reviewer_id: "SM-CCO-001", status: "in_review", retest_required: true, readiness_flags: { rbi_afi: false, pmla_rule9: true, statutory: false, concurrent: true }, signed_at: "2026-04-27T15:00:00Z", reviewer_signed_at: null, signed_by_id: "SM-HIA-001", reviewed_by_id: null },
    { workpaper_id: "WP-LND-002-Q4", control_id: "CTRL-LND-002", obligation_ids: ["OBL-RBI-DL-001"], test_execution_id: "TX-LND-002-DEC2025", sections: ["Cover", "Test Rationale", "Population Definition", "Findings", "Evidence Appendix", "Conclusion", "Reviewer Sign-off", "Retest Requirement"], population_size: 44120, tested_count: 44120, exception_count: 11118, evidence_ids: ["EV-SIGN-KFS-884", "EV-LOG-LOS-EVT-884-KFS", "EV-LOG-LOS-EVT-884-BACC"], tester_id: "SM-HIA-001", reviewer_id: "SM-CCO-001", status: "signed", retest_required: true, readiness_flags: { rbi_afi: true, pmla_rule9: false, statutory: true, concurrent: true }, signed_at: "2026-04-22T17:00:00Z", reviewer_signed_at: "2026-04-23T10:30:00Z", signed_by_id: "SM-HIA-001", reviewed_by_id: "SM-CCO-001" },
    { workpaper_id: "WP-VND-001-Q1", control_id: "CTRL-VND-001", obligation_ids: ["OBL-RBI-OUTSRC-001"], test_execution_id: null, sections: ["Cover", "Test Rationale", "Findings", "Evidence Appendix", "Conclusion"], population_size: null, tested_count: null, exception_count: 1, evidence_ids: ["EV-DOC-DDQ-205", "EV-DOC-DDQ-203"], tester_id: "SM-HIA-001", reviewer_id: "SM-CIO-001", status: "draft", retest_required: false, readiness_flags: { rbi_afi: false, pmla_rule9: false, statutory: false, concurrent: false }, signed_at: null, reviewer_signed_at: null, signed_by_id: null, reviewed_by_id: null },
    { workpaper_id: "WP-CIMS-2025-Q1", control_id: null, obligation_ids: ["OBL-RBI-DL-CIMS"], test_execution_id: null, sections: ["Cover", "Submission Manifest", "Reconciliation", "CCO Attestation", "Reviewer Sign-off"], population_size: null, tested_count: null, exception_count: 0, evidence_ids: ["EV-REPORT-CIMS-2025-Q1", "EV-ATTEST-CCO-CIMS-Q1"], tester_id: "SM-CCO-001", reviewer_id: "SM-HIA-001", status: "signed", retest_required: false, readiness_flags: { rbi_afi: true, pmla_rule9: false, statutory: false, concurrent: true }, signed_at: "2026-04-12T10:30:00Z", reviewer_signed_at: "2026-04-13T09:15:00Z", signed_by_id: "SM-CCO-001", reviewed_by_id: "SM-HIA-001" }
  ],

  auditPacks: [
    { audit_pack_id: "AP-RBI-AFI-2026-Q1", scope_type: "inspection_lens", scope_id: "IL-rbi_afi", target_audience: "rbi_afi", readiness_status: "amber", ars: 73, included_workpaper_ids: ["WP-AML-002-Q1", "WP-KYC-003-Q1", "WP-LND-002-Q4", "WP-CIMS-2025-Q1"], included_evidence_ids: ["EV-LOG-CKYCR-123", "EV-DOC-EDD-126", "EV-LOG-L1-DISPO-501", "EV-DOC-STR-501", "EV-LOG-FIU-ACK-501", "EV-SIGN-KFS-881", "EV-WORKPAPER-AML-002", "EV-REPORT-CIMS-2025-Q1", "EV-ATTEST-CCO-CIMS-Q1"], included_issue_ids: ["ISS-2026-009", "ISS-2026-061", "ISS-2026-085"], included_attestation_ids: ["AE-001", "AE-002", "AE-003"], included_decision_event_ids: ["DE-001", "DE-002", "DE-003", "DE-005", "DE-007"], exported_at: null, content_hash: null },
    { audit_pack_id: "AP-PMLA-FIU-2026-Q1", scope_type: "inspection_lens", scope_id: "IL-pmla_fiu", target_audience: "pmla_fiu", readiness_status: "amber", ars: 68, included_workpaper_ids: ["WP-AML-002-Q1"], included_evidence_ids: ["EV-LOG-CASE-501", "EV-LOG-L1-DISPO-501", "EV-DOC-STR-501", "EV-LOG-FIU-ACK-501", "EV-WORKPAPER-AML-002", "EV-REPORT-FIU-CTR-2025-03"], included_issue_ids: ["ISS-2026-009", "ISS-2026-103"], included_attestation_ids: ["AE-004"], included_decision_event_ids: ["DE-002", "DE-004"], exported_at: null, content_hash: null },
    { audit_pack_id: "AP-CONCURRENT-2026-MAR", scope_type: "inspection_lens", scope_id: "IL-concurrent", target_audience: "concurrent", readiness_status: "green", ars: 86, included_workpaper_ids: ["WP-AML-002-Q1", "WP-LND-002-Q4", "WP-KYC-003-Q1"], included_evidence_ids: ["EV-LOG-L1-DISPO-501", "EV-LOG-CKYCR-123", "EV-SIGN-KFS-881"], included_issue_ids: ["ISS-2026-061", "ISS-2026-110"], included_attestation_ids: ["AE-005"], included_decision_event_ids: [], exported_at: null, content_hash: null },
    { audit_pack_id: "AP-STATUTORY-2025-FY", scope_type: "inspection_lens", scope_id: "IL-statutory", target_audience: "statutory", readiness_status: "amber", ars: 76, included_workpaper_ids: ["WP-LND-002-Q4", "WP-AML-002-Q1"], included_evidence_ids: ["EV-DOC-EDD-126", "EV-SIGN-KFS-881", "EV-DOC-CONTRACT-203"], included_issue_ids: ["ISS-2026-085"], included_attestation_ids: ["AE-002"], included_decision_event_ids: ["DE-003"], exported_at: null, content_hash: null },
    { audit_pack_id: "AP-BOARD-2026-Q1", scope_type: "inspection_lens", scope_id: "IL-board", target_audience: "board", readiness_status: "amber", ars: 78, included_workpaper_ids: ["WP-AML-002-Q1", "WP-LND-002-Q4"], included_evidence_ids: ["EV-WORKPAPER-AML-002"], included_issue_ids: ["ISS-2026-009", "ISS-2026-085", "ISS-2026-027"], included_attestation_ids: ["AE-002", "AE-003", "AE-006"], included_decision_event_ids: ["DE-007"], exported_at: null, content_hash: null }
  ],

  aiInsights: [
    { ai_insight_id: "AII-AI-018-AML002", signal_id: "AI-018", signal_class: "effectiveness_decay", title: "CTRL-AML-002 CES dropped 78 → 65 over 4 weeks; OperatingRate decline concentrated at VEND-2024-00203 BPO floor", model_id: "MDL-CES-DECAY-V2", model_version: "2.4.1", confidence: 0.92, threshold: { alert: 0.6, review: 0.75, action: 0.9 }, recommendation: "Escalate to MLRO; raise capacity-driven Issue; prepare voluntary disclosure draft for SSM", risk_if_wrong: "Wrong decay attribution may mask non-BPO root cause (e.g., scenario tuning)", cited_evidence_ids: ["EV-LOG-CASE-502", "EV-LOG-L1-DISPO-501"], cited_source_record_ids: ["SR-AML-ALRT-502-GEN", "SR-CASE-AML-502-OPEN", "SR-CASE-AML-502-DISPO-MISSING"], linked_control_ids: ["CTRL-AML-002"], linked_obligation_ids: ["OBL-PMLA-001", "OBL-PMLA-003"], linked_issue_ids: ["ISS-2026-009"], human_approval_status: "accepted", human_approval_reason: "Rationale verified against 4-week trend; ISS-2026-009 created", fired_at: "2026-04-08T08:30:00Z" },
    { ai_insight_id: "AII-AI-002-AML-STEP04", signal_id: "AI-002", signal_class: "drift", title: "Process variant drift on STEP-AML-04: 12% of L1 dispositions exceed 7BD threshold; novel variant 'L1-overdue-7BD' emerging", model_id: "MDL-PROC-MINING-V1", model_version: "1.6.0", confidence: 0.88, threshold: { alert: 0.5, review: 0.7, action: 0.85 }, recommendation: "Open process root-cause review; tie to RA-ISS-009-01 capacity uplift", risk_if_wrong: "May confuse seasonal volume spike with structural drift", cited_evidence_ids: ["EV-LOG-CASE-502"], cited_source_record_ids: ["SR-CASE-AML-502-OPEN", "SR-CASE-AML-502-DISPO-MISSING"], linked_control_ids: ["CTRL-AML-002"], linked_obligation_ids: [], linked_issue_ids: ["ISS-2026-009"], human_approval_status: "accepted", human_approval_reason: null, fired_at: "2026-04-09T11:00:00Z" },
    { ai_insight_id: "AII-AI-016-DBT", signal_id: "AI-016", signal_class: "coverage_gap", title: "CKYCR cohort delay: 660 DBT/scholarship UCICs activated in March without re_kyc_due_date set", model_id: "MDL-COHORT-CKYCR-V1", model_version: "1.2.0", confidence: 0.97, threshold: { alert: 0.7, review: 0.85, action: 0.95 }, recommendation: "Backfill re_kyc_due_date for cohort; deploy CBS Finacle script; notify DBT/PMJDY product team", risk_if_wrong: "Cohort segmentation may mis-classify non-DBT accounts", cited_evidence_ids: ["EV-DOC-RE-KYC-127", "EV-LOG-CKYCR-127"], cited_source_record_ids: ["SR-CBS-UCIC-127-REKYC-NULL", "SR-CKYCR-127-ACK"], linked_control_ids: ["CTRL-KYC-003"], linked_obligation_ids: ["OBL-RBI-KYC-003"], linked_issue_ids: ["ISS-2026-061"], human_approval_status: "accepted", human_approval_reason: "Cohort definition validated against PMJDY reference list", fired_at: "2026-04-15T10:30:00Z" },
    { ai_insight_id: "AII-AI-005-CKYCR", signal_id: "AI-005", signal_class: "evidence_quality", title: "CKYCR ack stream T+3d ingestion lag — EV-LOG-CKYCR-127 marked Late", model_id: "MDL-EVD-QUAL-V2", model_version: "2.1.3", confidence: 0.94, threshold: { alert: 0.6, review: 0.8, action: 0.9 }, recommendation: "Engage CERSAI for ack-batch latency improvement; mark CKYCR as degraded source-system", risk_if_wrong: "May escalate vendor latency that's outside bank control", cited_evidence_ids: ["EV-LOG-CKYCR-127"], cited_source_record_ids: ["SR-CKYCR-127-ACK"], linked_control_ids: ["CTRL-KYC-003"], linked_obligation_ids: ["OBL-RBI-KYC-008"], linked_issue_ids: ["ISS-2026-061"], human_approval_status: "pending", human_approval_reason: null, fired_at: "2026-04-26T14:15:00Z" },
    { ai_insight_id: "AII-AI-013-DL884", signal_id: "AI-013", signal_class: "anomaly", title: "KFS timing violation on DL-APP-2024-00884: borrower_acceptance_at precedes kfs_issued_at by 13m12s; 11,118 instances cluster on DSA-Newgen channel", model_id: "MDL-KFS-TIMING-V1", model_version: "1.4.2", confidence: 0.97, threshold: { alert: 0.7, review: 0.85, action: 0.95 }, recommendation: "Auto-create Issue (cluster); halt DSA-Newgen new-product launch; require LOS NTP attestation before retest", risk_if_wrong: "Clock drift may produce false positives; verify NTP attestation", cited_evidence_ids: ["EV-LOG-LOS-EVT-884-KFS", "EV-LOG-LOS-EVT-884-BACC", "EV-SIGN-KFS-884"], cited_source_record_ids: ["SR-LOS-DL-884-KFS-EVT", "SR-LOS-DL-884-BACC-EVT"], linked_control_ids: ["CTRL-LND-002"], linked_obligation_ids: ["OBL-RBI-DL-001"], linked_issue_ids: ["ISS-2026-085"], human_approval_status: "accepted", human_approval_reason: "Clock drift caveat reviewed; NTP attestation requested as part of remediation", fired_at: "2026-04-20T09:30:00Z" },
    { ai_insight_id: "AII-AI-010-DSA", signal_id: "AI-010", signal_class: "cluster_rca", title: "Root-cause cluster: DSA-LOS-clock — 11,118 KFS-after-acceptance instances cluster on DSA-Newgen channel; AI-013 + AI-002 supporting", model_id: "MDL-RCA-CLUSTER-V1", model_version: "1.0.4", confidence: 0.91, threshold: { alert: 0.6, review: 0.8, action: 0.9 }, recommendation: "Form cluster RCC-DSA-LOS-CLOCK; recommend RA-ISS-085-01 NTP fix as cluster remediation", risk_if_wrong: "Cluster may overgeneralise across distinct DSA partners", cited_evidence_ids: ["EV-LOG-LOS-EVT-884-KFS", "EV-LOG-LOS-EVT-884-BACC"], cited_source_record_ids: ["SR-LOS-DL-884-KFS-EVT", "SR-LOS-DL-884-BACC-EVT"], linked_control_ids: ["CTRL-LND-002"], linked_obligation_ids: ["OBL-RBI-DL-001"], linked_issue_ids: ["ISS-2026-085"], human_approval_status: "accepted", human_approval_reason: null, fired_at: "2026-04-20T10:15:00Z" },
    { ai_insight_id: "AII-AI-001-AML505", signal_id: "AI-001", signal_class: "anomaly", title: "UPI mule-network signal on AML-ALRT-2024-00505 — 7-node ring detected (Wave 2)", model_id: "MDL-UPI-MULE-V0", model_version: "0.9.0-preview", confidence: 0.81, threshold: { alert: 0.7, review: 0.85, action: 0.95 }, recommendation: "Wave 2 — review pending NPCI feedback integration; do NOT auto-block UPI rails", risk_if_wrong: "False mule cluster could breach Charter of Customer Rights", cited_evidence_ids: [], cited_source_record_ids: ["SR-AML-ALRT-505-MULE"], linked_control_ids: ["CTRL-UPI-001"], linked_obligation_ids: [], linked_issue_ids: [], human_approval_status: "pending", human_approval_reason: null, fired_at: "2024-11-21T19:50:00Z" },
    { ai_insight_id: "AII-AI-003-CTR", signal_id: "AI-003", signal_class: "coverage_gap", title: "RC-CTR clock at-risk: FIU-IND ack ingestion delay for March 2025 cycle", model_id: "MDL-REG-COV-V1", model_version: "1.1.0", confidence: 0.86, threshold: { alert: 0.7, review: 0.85, action: 0.95 }, recommendation: "Open Issue against ack-archival automation; tie to OBL-FIU-CTR-001", risk_if_wrong: "May misattribute upstream FIU latency", cited_evidence_ids: ["EV-REPORT-FIU-CTR-2025-03"], cited_source_record_ids: [], linked_control_ids: [], linked_obligation_ids: ["OBL-FIU-CTR-001"], linked_issue_ids: ["ISS-2026-103"], human_approval_status: "pending", human_approval_reason: null, fired_at: "2026-04-23T07:30:00Z" },
    { ai_insight_id: "AII-AI-009-VND205", signal_id: "AI-009", signal_class: "accountability_gap", title: "Fourth-party non-disclosure detected on VEND-2024-00205 — OBL-RBI-OUTSRC-001 candidate breach", model_id: "MDL-VND-DISC-V1", model_version: "1.0.2", confidence: 0.95, threshold: { alert: 0.8, review: 0.9, action: 0.95 }, recommendation: "Block routing in CBS until disclosure complete; notify CIO accountable SM", risk_if_wrong: "Vendor name aliasing may produce false positives", cited_evidence_ids: ["EV-DOC-DDQ-205"], cited_source_record_ids: ["SR-VMO-VND-205-FOURTH-NULL"], linked_control_ids: ["CTRL-VND-001"], linked_obligation_ids: ["OBL-RBI-OUTSRC-001"], linked_issue_ids: ["ISS-2026-027"], human_approval_status: "accepted", human_approval_reason: "Confirmed via MCA portal cross-check", fired_at: "2024-09-30T14:20:00Z" },
    { ai_insight_id: "AII-AI-018-LND002", signal_id: "AI-018", signal_class: "effectiveness_decay", title: "CTRL-LND-002 OperatingRate 74.77 — masked by headline CES of 89.51 due to high CatchRate", model_id: "MDL-CES-DECAY-V2", model_version: "2.4.1", confidence: 0.93, threshold: { alert: 0.6, review: 0.75, action: 0.9 }, recommendation: "Render CES with mandatory breakdown; flag headline-vs-component divergence for board", risk_if_wrong: "May over-alert when natural CatchRate compensates for OperatingRate", cited_evidence_ids: ["EV-LOG-LOS-EVT-884-KFS"], cited_source_record_ids: ["SR-LOS-DL-884-KFS-EVT"], linked_control_ids: ["CTRL-LND-002"], linked_obligation_ids: ["OBL-RBI-DL-001"], linked_issue_ids: ["ISS-2026-085"], human_approval_status: "accepted", human_approval_reason: null, fired_at: "2026-04-21T08:00:00Z" },
    { ai_insight_id: "AII-AI-019-MLRO", signal_id: "AI-019", signal_class: "accountability_gap", title: "MLRO SAES dropped to 65 — overdue STR-clock attestation for AML-ALRT-2024-00502", model_id: "MDL-SAES-V1", model_version: "1.3.1", confidence: 0.89, threshold: { alert: 0.7, review: 0.85, action: 0.95 }, recommendation: "Trigger MLRO attestation; attach reasonable-oversight note before BRMC", risk_if_wrong: "May appear punitive without context of upstream BPO failure", cited_evidence_ids: ["EV-LOG-CASE-502"], cited_source_record_ids: ["SR-CASE-AML-502-DISPO-MISSING"], linked_control_ids: ["CTRL-AML-003"], linked_obligation_ids: ["OBL-PMLA-003"], linked_issue_ids: ["ISS-2026-009"], human_approval_status: "escalated", human_approval_reason: "Routed to CRO for review", fired_at: "2026-04-22T09:00:00Z" },
    { ai_insight_id: "AII-AI-005-CASE502", signal_id: "AI-005", signal_class: "evidence_quality", title: "EV-LOG-CASE-502 marked Partial — disposition narrative not linked to alert_id", model_id: "MDL-EVD-QUAL-V2", model_version: "2.1.3", confidence: 0.9, threshold: { alert: 0.6, review: 0.8, action: 0.9 }, recommendation: "Re-fetch from Pega case_mgmt; link narrative to alert_id", risk_if_wrong: "Re-fetch may overwrite valid mid-state evidence", cited_evidence_ids: ["EV-LOG-CASE-502"], cited_source_record_ids: ["SR-CASE-AML-502-OPEN"], linked_control_ids: ["CTRL-AML-002"], linked_obligation_ids: [], linked_issue_ids: ["ISS-2026-009"], human_approval_status: "pending", human_approval_reason: null, fired_at: "2026-04-26T15:00:00Z" }
  ],

  models: [
    { model_id: "MDL-CES-DECAY-V2", model_name: "Control Effectiveness Decay Detector", model_version: "2.4.1", model_type: "ml", training_data_id: "TD-CES-2024H2", last_validation_date: "2026-03-15T00:00:00Z", drift_metrics: { population_stability_index: 0.18, prediction_drift: 0.04 } },
    { model_id: "MDL-PROC-MINING-V1", model_name: "Process Mining Drift Detector", model_version: "1.6.0", model_type: "hybrid", training_data_id: "TD-PROC-2024H2", last_validation_date: "2026-02-20T00:00:00Z", drift_metrics: { variant_novelty_rate: 0.07 } },
    { model_id: "MDL-COHORT-CKYCR-V1", model_name: "CKYCR Cohort Delay Detector", model_version: "1.2.0", model_type: "rule", training_data_id: "TD-CKYCR-2024", last_validation_date: "2026-04-01T00:00:00Z", drift_metrics: {} },
    { model_id: "MDL-EVD-QUAL-V2", model_name: "Evidence Quality Scorer", model_version: "2.1.3", model_type: "rule", training_data_id: "TD-EVD-2024", last_validation_date: "2026-03-10T00:00:00Z", drift_metrics: {} },
    { model_id: "MDL-KFS-TIMING-V1", model_name: "KFS Timing Violation Detector", model_version: "1.4.2", model_type: "rule", training_data_id: "TD-LOS-2024", last_validation_date: "2026-04-05T00:00:00Z", drift_metrics: {} },
    { model_id: "MDL-RCA-CLUSTER-V1", model_name: "Root-Cause Clustering Engine", model_version: "1.0.4", model_type: "ml", training_data_id: "TD-RCA-2025H1", last_validation_date: "2026-02-28T00:00:00Z", drift_metrics: { silhouette: 0.62 } },
    { model_id: "MDL-UPI-MULE-V0", model_name: "UPI Mule Network Detector (Preview)", model_version: "0.9.0-preview", model_type: "ml", training_data_id: "TD-UPI-2024-PREVIEW", last_validation_date: "2026-01-10T00:00:00Z", drift_metrics: { false_positive_rate: 0.21 } },
    { model_id: "MDL-VND-DISC-V1", model_name: "Vendor Disclosure Gap Detector", model_version: "1.0.2", model_type: "rule", training_data_id: "TD-VND-2024", last_validation_date: "2026-03-05T00:00:00Z", drift_metrics: {} },
    { model_id: "MDL-SAES-V1", model_name: "Senior Accountability Evidence Scorer", model_version: "1.3.1", model_type: "rule", training_data_id: "TD-SAES-2024", last_validation_date: "2026-03-25T00:00:00Z", drift_metrics: {} },
    { model_id: "MDL-REG-COV-V1", model_name: "Regulatory Coverage Gap Detector", model_version: "1.1.0", model_type: "hybrid", training_data_id: "TD-REG-2024", last_validation_date: "2026-04-02T00:00:00Z", drift_metrics: {} }
  ],

  modelRiskRecords: [
    { mrr_id: "MRR-CES-DECAY-2026Q1", model_id: "MDL-CES-DECAY-V2", validation_date: "2026-03-15T00:00:00Z", validator_id: "SM-CISO-001", validation_outcome: "approved_with_conditions", drift_status: "amber", aites: 82, governance_committee_ref: "MRG-2026-Q1" },
    { mrr_id: "MRR-PROC-MINING-2026Q1", model_id: "MDL-PROC-MINING-V1", validation_date: "2026-02-20T00:00:00Z", validator_id: "SM-CISO-001", validation_outcome: "approved", drift_status: "green", aites: 88, governance_committee_ref: "MRG-2026-Q1" },
    { mrr_id: "MRR-CKYCR-COHORT-2026Q2", model_id: "MDL-COHORT-CKYCR-V1", validation_date: "2026-04-01T00:00:00Z", validator_id: "SM-CISO-001", validation_outcome: "approved", drift_status: "green", aites: 91, governance_committee_ref: "MRG-2026-Q2" },
    { mrr_id: "MRR-KFS-TIMING-2026Q2", model_id: "MDL-KFS-TIMING-V1", validation_date: "2026-04-05T00:00:00Z", validator_id: "SM-CISO-001", validation_outcome: "approved", drift_status: "green", aites: 93, governance_committee_ref: "MRG-2026-Q2" },
    { mrr_id: "MRR-UPI-MULE-2026Q1", model_id: "MDL-UPI-MULE-V0", validation_date: "2026-01-10T00:00:00Z", validator_id: "SM-CISO-001", validation_outcome: "blocked_for_production", drift_status: "red", aites: 58, governance_committee_ref: "MRG-2026-Q1" },
    { mrr_id: "MRR-RCA-CLUSTER-2026Q1", model_id: "MDL-RCA-CLUSTER-V1", validation_date: "2026-02-28T00:00:00Z", validator_id: "SM-CISO-001", validation_outcome: "approved", drift_status: "green", aites: 84, governance_committee_ref: "MRG-2026-Q1" }
  ],

  reportingClocks: [
    { clock_id: "RC-CTR", obligation_id: "OBL-FIU-CTR-001", clock_label: "CTR by 15th of next month", deadline_spec: "monthly_15th", target_system: "SS-FIU-OUT", current_status: "at_risk" },
    { clock_id: "RC-STR-7BD", obligation_id: "OBL-PMLA-003", clock_label: "STR ≤ 7 working days from suspicion conclusion", deadline_spec: "rolling_7BD", target_system: "SS-FIU-OUT", current_status: "at_risk" },
    { clock_id: "RC-CSITE", obligation_id: "OBL-RBI-CSITE-001", clock_label: "RBI CSITE 2-6h material cyber incident", deadline_spec: "rolling_6h", target_system: "SS-ITSM-SNOW", current_status: "within" },
    { clock_id: "RC-CERT-IN", obligation_id: "OBL-CERT-IN-001", clock_label: "CERT-In 6-hour cyber incident", deadline_spec: "rolling_6h", target_system: "SS-ITSM-SNOW", current_status: "within" },
    { clock_id: "RC-UAPA-DAILY", obligation_id: "OBL-RBI-KYC-001", clock_label: "UAPA s.51A daily screening", deadline_spec: "daily", target_system: "SS-SANC-FIRCO", current_status: "within" },
    { clock_id: "RC-CIMS-Q", obligation_id: "OBL-RBI-DL-CIMS", clock_label: "CIMS DLA quarterly", deadline_spec: "quarterly", target_system: "SS-CBS-FINACLE", current_status: "within" },
    { clock_id: "RC-CRILC-M", obligation_id: null, clock_label: "CRILC monthly large exposure", deadline_spec: "monthly", target_system: "SS-CBS-FINACLE", current_status: "within" },
    { clock_id: "RC-FMR-14D", obligation_id: null, clock_label: "FMR ≤14 days from fraud detection", deadline_spec: "rolling_14d", target_system: "SS-CBS-FINACLE", current_status: "within" }
  ],

  reportingSubmissions: [
    { submission_id: "RS-CTR-2025-03", clock_id: "RC-CTR", submitted_at: "2025-04-14T22:00:00Z", ack_id: "FIU-CTR-ACK-2025-04-14-MSPB-00128", ack_at: null, status: "pending", evidence_id_for_ack: null },
    { submission_id: "RS-STR-501", clock_id: "RC-STR-7BD", submitted_at: "2024-11-06T09:45:00Z", ack_id: "FIU-ACK-2024-11-06-MSPB-00781", ack_at: "2024-11-06T10:11:00Z", status: "on_time", evidence_id_for_ack: "EV-LOG-FIU-ACK-501" },
    { submission_id: "RS-STR-502-PENDING", clock_id: "RC-STR-7BD", submitted_at: null, ack_id: null, ack_at: null, status: "pending", evidence_id_for_ack: null },
    { submission_id: "RS-CIMS-2025-Q1", clock_id: "RC-CIMS-Q", submitted_at: "2026-04-12T10:30:00Z", ack_id: "RBI-CIMS-ACK-2026-04-12-MSPB-2025Q1", ack_at: "2026-04-13T09:15:00Z", status: "on_time", evidence_id_for_ack: "EV-REPORT-CIMS-2025-Q1" },
    { submission_id: "RS-UAPA-2026-04-30", clock_id: "RC-UAPA-DAILY", submitted_at: "2026-04-30T23:30:00Z", ack_id: null, ack_at: null, status: "on_time", evidence_id_for_ack: null },
    { submission_id: "RS-CRILC-2026-03", clock_id: "RC-CRILC-M", submitted_at: "2026-04-10T18:00:00Z", ack_id: "RBI-CRILC-ACK-2026-04-10-MSPB-202603", ack_at: "2026-04-11T07:00:00Z", status: "on_time", evidence_id_for_ack: null },
    { submission_id: "RS-FMR-2026-04-15", clock_id: "RC-FMR-14D", submitted_at: "2026-04-15T14:00:00Z", ack_id: "RBI-FMR-ACK-2026-04-15-MSPB-00012", ack_at: "2026-04-15T15:30:00Z", status: "on_time", evidence_id_for_ack: null },
    { submission_id: "RS-CSITE-DRY-2026-Q1", clock_id: "RC-CSITE", submitted_at: "2026-03-21T10:00:00Z", ack_id: "RBI-CSITE-ACK-2026-03-21-MSPB-DRY", ack_at: "2026-03-21T10:30:00Z", status: "on_time", evidence_id_for_ack: null },
    { submission_id: "RS-CTR-2024-12", clock_id: "RC-CTR", submitted_at: "2025-01-14T20:00:00Z", ack_id: "FIU-CTR-ACK-2025-01-14-MSPB-00115", ack_at: "2025-01-15T07:00:00Z", status: "on_time", evidence_id_for_ack: "EV-REPORT-FIU-CTR-2025-03" },
    { submission_id: "RS-CTR-2025-02", clock_id: "RC-CTR", submitted_at: "2025-03-13T19:00:00Z", ack_id: "FIU-CTR-ACK-2025-03-13-MSPB-00121", ack_at: "2025-03-14T08:00:00Z", status: "on_time", evidence_id_for_ack: null },
    { submission_id: "RS-STR-LATE-OLD", clock_id: "RC-STR-7BD", submitted_at: "2024-09-05T10:00:00Z", ack_id: "FIU-ACK-2024-09-05-MSPB-00702", ack_at: "2024-09-05T11:00:00Z", status: "late", evidence_id_for_ack: null },
    { submission_id: "RS-CERT-IN-DRY-2026-Q1", clock_id: "RC-CERT-IN", submitted_at: "2026-02-14T09:00:00Z", ack_id: "CERTIN-ACK-2026-02-14-MSPB-DRY", ack_at: "2026-02-14T09:30:00Z", status: "on_time", evidence_id_for_ack: null }
  ],

  kris: [
    { kri_id: "KRI-FC-001", name: "AML L1 alert backlog (count > SLA)", linked_risk_id: "R-FC-001", threshold_amber: 100, threshold_red: 250, unit: "alerts", formula_ref: "count(case_mgmt.case WHERE status='open' AND opened_at < now()-5BD)", breach_summary: null },
    { kri_id: "KRI-CD-001", name: "KFS-after-acceptance instances per 1000 disbursals", linked_risk_id: "R-CD-001", threshold_amber: 5, threshold_red: 25, unit: "per_1000", formula_ref: "count(CTRL-LND-002 outcome='Fail') / count(disbursals) * 1000", breach_summary: null },
    { kri_id: "KRI-CO-001", name: "Re-KYC overdue UCICs", linked_risk_id: "R-CO-001", threshold_amber: 500, threshold_red: 2000, unit: "UCICs", formula_ref: "count(re_kyc_due_date < today() AND status='active')", breach_summary: null },
    { kri_id: "KRI-OP-001", name: "BPO L1 SLA breach rate", linked_risk_id: "R-OP-001", threshold_amber: 0.05, threshold_red: 0.15, unit: "ratio", formula_ref: "count(case_mgmt SLA breach) / count(total cases)", breach_summary: null },
    { kri_id: "KRI-TC-001", name: "Cyber incidents detection-to-CERT-In notification latency p95 (hours)", linked_risk_id: "R-TC-001", threshold_amber: 4, threshold_red: 6, unit: "hours_p95", formula_ref: "p95(cert_in_notified_at - incident_detected_at)", breach_summary: null },
    { kri_id: "KRI-CR-001", name: "Bureau pull > 90 days at sanction count", linked_risk_id: "R-CR-001", threshold_amber: 50, threshold_red: 200, unit: "count", formula_ref: "count(loans WHERE bureau_pull_at < sanction_at-90d)", breach_summary: null },
    { kri_id: "KRI-TP-001", name: "Material vendors with overdue DDQ count", linked_risk_id: "R-TP-001", threshold_amber: 5, threshold_red: 15, unit: "vendors", formula_ref: "count(material_vendors WHERE ddq_overdue=true)", breach_summary: null },
    { kri_id: "KRI-FR-001", name: "UPI mule cluster signal volume (Wave 2)", linked_risk_id: "R-FR-001", threshold_amber: 10, threshold_red: 50, unit: "clusters", formula_ref: "count(AI-001 fired)", breach_summary: null },
    { kri_id: "KRI-MR-001", name: "Models in MRR drift_status amber/red", linked_risk_id: "R-MR-001", threshold_amber: 2, threshold_red: 5, unit: "models", formula_ref: "count(MRR drift_status IN ('amber','red'))", breach_summary: null }
  ],

  kriObservations: [
    {
      "observation_id": "KOBS-FC-001-W01",
      "kri_id": "KRI-FC-001",
      "value": 68,
      "band": "green",
      "as_of_ts": "2026-02-13T23:59:59Z"
    },
    {
      "observation_id": "KOBS-FC-001-W02",
      "kri_id": "KRI-FC-001",
      "value": 92,
      "band": "green",
      "as_of_ts": "2026-02-20T23:59:59Z"
    },
    {
      "observation_id": "KOBS-FC-001-W03",
      "kri_id": "KRI-FC-001",
      "value": 114,
      "band": "amber",
      "as_of_ts": "2026-02-27T23:59:59Z"
    },
    {
      "observation_id": "KOBS-FC-001-W04",
      "kri_id": "KRI-FC-001",
      "value": 134,
      "band": "amber",
      "as_of_ts": "2026-03-06T23:59:59Z"
    },
    {
      "observation_id": "KOBS-FC-001-W05",
      "kri_id": "KRI-FC-001",
      "value": 154,
      "band": "amber",
      "as_of_ts": "2026-03-13T23:59:59Z"
    },
    {
      "observation_id": "KOBS-FC-001-W06",
      "kri_id": "KRI-FC-001",
      "value": 174,
      "band": "amber",
      "as_of_ts": "2026-03-20T23:59:59Z"
    },
    {
      "observation_id": "KOBS-FC-001-W07",
      "kri_id": "KRI-FC-001",
      "value": 193,
      "band": "amber",
      "as_of_ts": "2026-03-27T23:59:59Z"
    },
    {
      "observation_id": "KOBS-FC-001-W08",
      "kri_id": "KRI-FC-001",
      "value": 212,
      "band": "amber",
      "as_of_ts": "2026-04-03T23:59:59Z"
    },
    {
      "observation_id": "KOBS-FC-001-W09",
      "kri_id": "KRI-FC-001",
      "value": 231,
      "band": "amber",
      "as_of_ts": "2026-04-10T23:59:59Z"
    },
    {
      "observation_id": "KOBS-FC-001-W10",
      "kri_id": "KRI-FC-001",
      "value": 250,
      "band": "red",
      "as_of_ts": "2026-04-17T23:59:59Z"
    },
    {
      "observation_id": "KOBS-FC-001-W11",
      "kri_id": "KRI-FC-001",
      "value": 269,
      "band": "red",
      "as_of_ts": "2026-04-24T23:59:59Z"
    },
    {
      "observation_id": "KOBS-FC-001-W12",
      "kri_id": "KRI-FC-001",
      "value": 287,
      "band": "red",
      "as_of_ts": "2026-05-01T23:59:59Z",
      "breach_reason": "BPO queue backlog post-FIU FINnet uplift; L1 capacity below plan."
    },
    {
      "observation_id": "KOBS-CD-001-W01",
      "kri_id": "KRI-CD-001",
      "value": 2.2,
      "band": "green",
      "as_of_ts": "2026-02-13T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CD-001-W02",
      "kri_id": "KRI-CD-001",
      "value": 5.041,
      "band": "amber",
      "as_of_ts": "2026-02-20T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CD-001-W03",
      "kri_id": "KRI-CD-001",
      "value": 7.576,
      "band": "amber",
      "as_of_ts": "2026-02-27T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CD-001-W04",
      "kri_id": "KRI-CD-001",
      "value": 10.007,
      "band": "amber",
      "as_of_ts": "2026-03-06T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CD-001-W05",
      "kri_id": "KRI-CD-001",
      "value": 12.373,
      "band": "amber",
      "as_of_ts": "2026-03-13T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CD-001-W06",
      "kri_id": "KRI-CD-001",
      "value": 14.691,
      "band": "amber",
      "as_of_ts": "2026-03-20T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CD-001-W07",
      "kri_id": "KRI-CD-001",
      "value": 16.972,
      "band": "amber",
      "as_of_ts": "2026-03-27T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CD-001-W08",
      "kri_id": "KRI-CD-001",
      "value": 19.223,
      "band": "amber",
      "as_of_ts": "2026-04-03T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CD-001-W09",
      "kri_id": "KRI-CD-001",
      "value": 21.448,
      "band": "amber",
      "as_of_ts": "2026-04-10T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CD-001-W10",
      "kri_id": "KRI-CD-001",
      "value": 23.651,
      "band": "amber",
      "as_of_ts": "2026-04-17T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CD-001-W11",
      "kri_id": "KRI-CD-001",
      "value": 25.834,
      "band": "red",
      "as_of_ts": "2026-04-24T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CD-001-W12",
      "kri_id": "KRI-CD-001",
      "value": 28,
      "band": "red",
      "as_of_ts": "2026-05-01T23:59:59Z",
      "breach_reason": "DSA channel KFS-after-acceptance cluster from LOS clock drift."
    },
    {
      "observation_id": "KOBS-CO-001-W01",
      "kri_id": "KRI-CO-001",
      "value": 410,
      "band": "green",
      "as_of_ts": "2026-02-13T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CO-001-W02",
      "kri_id": "KRI-CO-001",
      "value": 422,
      "band": "green",
      "as_of_ts": "2026-02-20T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CO-001-W03",
      "kri_id": "KRI-CO-001",
      "value": 433,
      "band": "green",
      "as_of_ts": "2026-02-27T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CO-001-W04",
      "kri_id": "KRI-CO-001",
      "value": 443,
      "band": "green",
      "as_of_ts": "2026-03-06T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CO-001-W05",
      "kri_id": "KRI-CO-001",
      "value": 453,
      "band": "green",
      "as_of_ts": "2026-03-13T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CO-001-W06",
      "kri_id": "KRI-CO-001",
      "value": 463,
      "band": "green",
      "as_of_ts": "2026-03-20T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CO-001-W07",
      "kri_id": "KRI-CO-001",
      "value": 473,
      "band": "green",
      "as_of_ts": "2026-03-27T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CO-001-W08",
      "kri_id": "KRI-CO-001",
      "value": 483,
      "band": "green",
      "as_of_ts": "2026-04-03T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CO-001-W09",
      "kri_id": "KRI-CO-001",
      "value": 492,
      "band": "green",
      "as_of_ts": "2026-04-10T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CO-001-W10",
      "kri_id": "KRI-CO-001",
      "value": 501,
      "band": "amber",
      "as_of_ts": "2026-04-17T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CO-001-W11",
      "kri_id": "KRI-CO-001",
      "value": 511,
      "band": "amber",
      "as_of_ts": "2026-04-24T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CO-001-W12",
      "kri_id": "KRI-CO-001",
      "value": 520,
      "band": "amber",
      "as_of_ts": "2026-05-01T23:59:59Z",
      "breach_reason": "Threshold excursion on latest reading."
    },
    {
      "observation_id": "KOBS-OP-001-W01",
      "kri_id": "KRI-OP-001",
      "value": 0.022,
      "band": "green",
      "as_of_ts": "2026-02-13T23:59:59Z"
    },
    {
      "observation_id": "KOBS-OP-001-W02",
      "kri_id": "KRI-OP-001",
      "value": 0.03,
      "band": "green",
      "as_of_ts": "2026-02-20T23:59:59Z"
    },
    {
      "observation_id": "KOBS-OP-001-W03",
      "kri_id": "KRI-OP-001",
      "value": 0.037,
      "band": "green",
      "as_of_ts": "2026-02-27T23:59:59Z"
    },
    {
      "observation_id": "KOBS-OP-001-W04",
      "kri_id": "KRI-OP-001",
      "value": 0.043,
      "band": "green",
      "as_of_ts": "2026-03-06T23:59:59Z"
    },
    {
      "observation_id": "KOBS-OP-001-W05",
      "kri_id": "KRI-OP-001",
      "value": 0.05,
      "band": "amber",
      "as_of_ts": "2026-03-13T23:59:59Z"
    },
    {
      "observation_id": "KOBS-OP-001-W06",
      "kri_id": "KRI-OP-001",
      "value": 0.056,
      "band": "amber",
      "as_of_ts": "2026-03-20T23:59:59Z"
    },
    {
      "observation_id": "KOBS-OP-001-W07",
      "kri_id": "KRI-OP-001",
      "value": 0.062,
      "band": "amber",
      "as_of_ts": "2026-03-27T23:59:59Z"
    },
    {
      "observation_id": "KOBS-OP-001-W08",
      "kri_id": "KRI-OP-001",
      "value": 0.068,
      "band": "amber",
      "as_of_ts": "2026-04-03T23:59:59Z"
    },
    {
      "observation_id": "KOBS-OP-001-W09",
      "kri_id": "KRI-OP-001",
      "value": 0.074,
      "band": "amber",
      "as_of_ts": "2026-04-10T23:59:59Z"
    },
    {
      "observation_id": "KOBS-OP-001-W10",
      "kri_id": "KRI-OP-001",
      "value": 0.08,
      "band": "amber",
      "as_of_ts": "2026-04-17T23:59:59Z"
    },
    {
      "observation_id": "KOBS-OP-001-W11",
      "kri_id": "KRI-OP-001",
      "value": 0.086,
      "band": "amber",
      "as_of_ts": "2026-04-24T23:59:59Z"
    },
    {
      "observation_id": "KOBS-OP-001-W12",
      "kri_id": "KRI-OP-001",
      "value": 0.092,
      "band": "amber",
      "as_of_ts": "2026-05-01T23:59:59Z",
      "breach_reason": "VEND-2024-00203 staffing gap; dual-key waiver not in MOM."
    },
    {
      "observation_id": "KOBS-TC-001-W01",
      "kri_id": "KRI-TC-001",
      "value": 2.4,
      "band": "green",
      "as_of_ts": "2026-02-13T23:59:59Z"
    },
    {
      "observation_id": "KOBS-TC-001-W02",
      "kri_id": "KRI-TC-001",
      "value": 2.488,
      "band": "green",
      "as_of_ts": "2026-02-20T23:59:59Z"
    },
    {
      "observation_id": "KOBS-TC-001-W03",
      "kri_id": "KRI-TC-001",
      "value": 2.567,
      "band": "green",
      "as_of_ts": "2026-02-27T23:59:59Z"
    },
    {
      "observation_id": "KOBS-TC-001-W04",
      "kri_id": "KRI-TC-001",
      "value": 2.642,
      "band": "green",
      "as_of_ts": "2026-03-06T23:59:59Z"
    },
    {
      "observation_id": "KOBS-TC-001-W05",
      "kri_id": "KRI-TC-001",
      "value": 2.715,
      "band": "green",
      "as_of_ts": "2026-03-13T23:59:59Z"
    },
    {
      "observation_id": "KOBS-TC-001-W06",
      "kri_id": "KRI-TC-001",
      "value": 2.787,
      "band": "green",
      "as_of_ts": "2026-03-20T23:59:59Z"
    },
    {
      "observation_id": "KOBS-TC-001-W07",
      "kri_id": "KRI-TC-001",
      "value": 2.858,
      "band": "green",
      "as_of_ts": "2026-03-27T23:59:59Z"
    },
    {
      "observation_id": "KOBS-TC-001-W08",
      "kri_id": "KRI-TC-001",
      "value": 2.928,
      "band": "green",
      "as_of_ts": "2026-04-03T23:59:59Z"
    },
    {
      "observation_id": "KOBS-TC-001-W09",
      "kri_id": "KRI-TC-001",
      "value": 2.997,
      "band": "green",
      "as_of_ts": "2026-04-10T23:59:59Z"
    },
    {
      "observation_id": "KOBS-TC-001-W10",
      "kri_id": "KRI-TC-001",
      "value": 3.065,
      "band": "green",
      "as_of_ts": "2026-04-17T23:59:59Z"
    },
    {
      "observation_id": "KOBS-TC-001-W11",
      "kri_id": "KRI-TC-001",
      "value": 3.133,
      "band": "green",
      "as_of_ts": "2026-04-24T23:59:59Z"
    },
    {
      "observation_id": "KOBS-TC-001-W12",
      "kri_id": "KRI-TC-001",
      "value": 3.2,
      "band": "green",
      "as_of_ts": "2026-05-01T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CR-001-W01",
      "kri_id": "KRI-CR-001",
      "value": 8,
      "band": "green",
      "as_of_ts": "2026-02-13T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CR-001-W02",
      "kri_id": "KRI-CR-001",
      "value": 17,
      "band": "green",
      "as_of_ts": "2026-02-20T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CR-001-W03",
      "kri_id": "KRI-CR-001",
      "value": 25,
      "band": "green",
      "as_of_ts": "2026-02-27T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CR-001-W04",
      "kri_id": "KRI-CR-001",
      "value": 32,
      "band": "green",
      "as_of_ts": "2026-03-06T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CR-001-W05",
      "kri_id": "KRI-CR-001",
      "value": 40,
      "band": "green",
      "as_of_ts": "2026-03-13T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CR-001-W06",
      "kri_id": "KRI-CR-001",
      "value": 47,
      "band": "green",
      "as_of_ts": "2026-03-20T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CR-001-W07",
      "kri_id": "KRI-CR-001",
      "value": 54,
      "band": "amber",
      "as_of_ts": "2026-03-27T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CR-001-W08",
      "kri_id": "KRI-CR-001",
      "value": 61,
      "band": "amber",
      "as_of_ts": "2026-04-03T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CR-001-W09",
      "kri_id": "KRI-CR-001",
      "value": 68,
      "band": "amber",
      "as_of_ts": "2026-04-10T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CR-001-W10",
      "kri_id": "KRI-CR-001",
      "value": 75,
      "band": "amber",
      "as_of_ts": "2026-04-17T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CR-001-W11",
      "kri_id": "KRI-CR-001",
      "value": 81,
      "band": "amber",
      "as_of_ts": "2026-04-24T23:59:59Z"
    },
    {
      "observation_id": "KOBS-CR-001-W12",
      "kri_id": "KRI-CR-001",
      "value": 88,
      "band": "amber",
      "as_of_ts": "2026-05-01T23:59:59Z",
      "breach_reason": "Bureau pull freshness degraded on fast-track sanctions."
    },
    {
      "observation_id": "KOBS-TP-001-W01",
      "kri_id": "KRI-TP-001",
      "value": 0,
      "band": "green",
      "as_of_ts": "2026-02-13T23:59:59Z"
    },
    {
      "observation_id": "KOBS-TP-001-W02",
      "kri_id": "KRI-TP-001",
      "value": 0,
      "band": "green",
      "as_of_ts": "2026-02-20T23:59:59Z"
    },
    {
      "observation_id": "KOBS-TP-001-W03",
      "kri_id": "KRI-TP-001",
      "value": 1,
      "band": "green",
      "as_of_ts": "2026-02-27T23:59:59Z"
    },
    {
      "observation_id": "KOBS-TP-001-W04",
      "kri_id": "KRI-TP-001",
      "value": 1,
      "band": "green",
      "as_of_ts": "2026-03-06T23:59:59Z"
    },
    {
      "observation_id": "KOBS-TP-001-W05",
      "kri_id": "KRI-TP-001",
      "value": 1,
      "band": "green",
      "as_of_ts": "2026-03-13T23:59:59Z"
    },
    {
      "observation_id": "KOBS-TP-001-W06",
      "kri_id": "KRI-TP-001",
      "value": 1,
      "band": "green",
      "as_of_ts": "2026-03-20T23:59:59Z"
    },
    {
      "observation_id": "KOBS-TP-001-W07",
      "kri_id": "KRI-TP-001",
      "value": 2,
      "band": "green",
      "as_of_ts": "2026-03-27T23:59:59Z"
    },
    {
      "observation_id": "KOBS-TP-001-W08",
      "kri_id": "KRI-TP-001",
      "value": 2,
      "band": "green",
      "as_of_ts": "2026-04-03T23:59:59Z"
    },
    {
      "observation_id": "KOBS-TP-001-W09",
      "kri_id": "KRI-TP-001",
      "value": 2,
      "band": "green",
      "as_of_ts": "2026-04-10T23:59:59Z"
    },
    {
      "observation_id": "KOBS-TP-001-W10",
      "kri_id": "KRI-TP-001",
      "value": 2,
      "band": "green",
      "as_of_ts": "2026-04-17T23:59:59Z"
    },
    {
      "observation_id": "KOBS-TP-001-W11",
      "kri_id": "KRI-TP-001",
      "value": 3,
      "band": "green",
      "as_of_ts": "2026-04-24T23:59:59Z"
    },
    {
      "observation_id": "KOBS-TP-001-W12",
      "kri_id": "KRI-TP-001",
      "value": 3,
      "band": "green",
      "as_of_ts": "2026-05-01T23:59:59Z"
    },
    {
      "observation_id": "KOBS-FR-001-W01",
      "kri_id": "KRI-FR-001",
      "value": 2,
      "band": "green",
      "as_of_ts": "2026-02-13T23:59:59Z"
    },
    {
      "observation_id": "KOBS-FR-001-W02",
      "kri_id": "KRI-FR-001",
      "value": 4,
      "band": "green",
      "as_of_ts": "2026-02-20T23:59:59Z"
    },
    {
      "observation_id": "KOBS-FR-001-W03",
      "kri_id": "KRI-FR-001",
      "value": 6,
      "band": "green",
      "as_of_ts": "2026-02-27T23:59:59Z"
    },
    {
      "observation_id": "KOBS-FR-001-W04",
      "kri_id": "KRI-FR-001",
      "value": 8,
      "band": "green",
      "as_of_ts": "2026-03-06T23:59:59Z"
    },
    {
      "observation_id": "KOBS-FR-001-W05",
      "kri_id": "KRI-FR-001",
      "value": 10,
      "band": "amber",
      "as_of_ts": "2026-03-13T23:59:59Z"
    },
    {
      "observation_id": "KOBS-FR-001-W06",
      "kri_id": "KRI-FR-001",
      "value": 12,
      "band": "amber",
      "as_of_ts": "2026-03-20T23:59:59Z"
    },
    {
      "observation_id": "KOBS-FR-001-W07",
      "kri_id": "KRI-FR-001",
      "value": 13,
      "band": "amber",
      "as_of_ts": "2026-03-27T23:59:59Z"
    },
    {
      "observation_id": "KOBS-FR-001-W08",
      "kri_id": "KRI-FR-001",
      "value": 15,
      "band": "amber",
      "as_of_ts": "2026-04-03T23:59:59Z"
    },
    {
      "observation_id": "KOBS-FR-001-W09",
      "kri_id": "KRI-FR-001",
      "value": 17,
      "band": "amber",
      "as_of_ts": "2026-04-10T23:59:59Z"
    },
    {
      "observation_id": "KOBS-FR-001-W10",
      "kri_id": "KRI-FR-001",
      "value": 19,
      "band": "amber",
      "as_of_ts": "2026-04-17T23:59:59Z"
    },
    {
      "observation_id": "KOBS-FR-001-W11",
      "kri_id": "KRI-FR-001",
      "value": 20,
      "band": "amber",
      "as_of_ts": "2026-04-24T23:59:59Z"
    },
    {
      "observation_id": "KOBS-FR-001-W12",
      "kri_id": "KRI-FR-001",
      "value": 22,
      "band": "amber",
      "as_of_ts": "2026-05-01T23:59:59Z",
      "breach_reason": "NPCI feedback + mule typology rules pending FCC sign-off."
    },
    {
      "observation_id": "KOBS-MR-001-W01",
      "kri_id": "KRI-MR-001",
      "value": 0,
      "band": "green",
      "as_of_ts": "2026-02-13T23:59:59Z"
    },
    {
      "observation_id": "KOBS-MR-001-W02",
      "kri_id": "KRI-MR-001",
      "value": 0,
      "band": "green",
      "as_of_ts": "2026-02-20T23:59:59Z"
    },
    {
      "observation_id": "KOBS-MR-001-W03",
      "kri_id": "KRI-MR-001",
      "value": 0,
      "band": "green",
      "as_of_ts": "2026-02-27T23:59:59Z"
    },
    {
      "observation_id": "KOBS-MR-001-W04",
      "kri_id": "KRI-MR-001",
      "value": 1,
      "band": "green",
      "as_of_ts": "2026-03-06T23:59:59Z"
    },
    {
      "observation_id": "KOBS-MR-001-W05",
      "kri_id": "KRI-MR-001",
      "value": 1,
      "band": "green",
      "as_of_ts": "2026-03-13T23:59:59Z"
    },
    {
      "observation_id": "KOBS-MR-001-W06",
      "kri_id": "KRI-MR-001",
      "value": 1,
      "band": "green",
      "as_of_ts": "2026-03-20T23:59:59Z"
    },
    {
      "observation_id": "KOBS-MR-001-W07",
      "kri_id": "KRI-MR-001",
      "value": 1,
      "band": "green",
      "as_of_ts": "2026-03-27T23:59:59Z"
    },
    {
      "observation_id": "KOBS-MR-001-W08",
      "kri_id": "KRI-MR-001",
      "value": 1,
      "band": "green",
      "as_of_ts": "2026-04-03T23:59:59Z"
    },
    {
      "observation_id": "KOBS-MR-001-W09",
      "kri_id": "KRI-MR-001",
      "value": 1,
      "band": "green",
      "as_of_ts": "2026-04-10T23:59:59Z"
    },
    {
      "observation_id": "KOBS-MR-001-W10",
      "kri_id": "KRI-MR-001",
      "value": 2,
      "band": "amber",
      "as_of_ts": "2026-04-17T23:59:59Z"
    },
    {
      "observation_id": "KOBS-MR-001-W11",
      "kri_id": "KRI-MR-001",
      "value": 2,
      "band": "amber",
      "as_of_ts": "2026-04-24T23:59:59Z"
    },
    {
      "observation_id": "KOBS-MR-001-W12",
      "kri_id": "KRI-MR-001",
      "value": 2,
      "band": "amber",
      "as_of_ts": "2026-05-01T23:59:59Z",
      "breach_reason": "Threshold excursion on latest reading."
    }
  ],

  appetiteMetrics: [
    { appetite_metric_id: "APM-FC-001", name: "STR filing on-time ratio", linked_risk_id: "R-FC-001", board_approved_threshold: 0.95, unit: "ratio", formula_ref: "STR-on-time / STR-required" },
    { appetite_metric_id: "APM-CD-001", name: "KFS pre-acceptance ratio", linked_risk_id: "R-CD-001", board_approved_threshold: 0.99, unit: "ratio", formula_ref: "Pass / total CTRL-LND-002 instances" },
    { appetite_metric_id: "APM-CO-001", name: "Re-KYC on-time ratio", linked_risk_id: "R-CO-001", board_approved_threshold: 0.95, unit: "ratio", formula_ref: "completed_on_time / due_in_window" },
    { appetite_metric_id: "APM-OP-001", name: "BPO L1 SLA compliance", linked_risk_id: "R-OP-001", board_approved_threshold: 0.95, unit: "ratio", formula_ref: "within_SLA / total" },
    { appetite_metric_id: "APM-TC-001", name: "CERT-In 6h compliance ratio", linked_risk_id: "R-TC-001", board_approved_threshold: 1.0, unit: "ratio", formula_ref: "within_6h / total_incidents" },
    { appetite_metric_id: "APM-CR-001", name: "Bureau pull freshness ratio", linked_risk_id: "R-CR-001", board_approved_threshold: 0.99, unit: "ratio", formula_ref: "within_90d / total_sanctions" },
    { appetite_metric_id: "APM-TP-001", name: "Material vendor DDQ on-time ratio", linked_risk_id: "R-TP-001", board_approved_threshold: 0.95, unit: "ratio", formula_ref: "ddq_on_time / total_material_vendors" },
    { appetite_metric_id: "APM-FR-001", name: "UPI mule auto-block precision (Wave 2)", linked_risk_id: "R-FR-001", board_approved_threshold: 0.9, unit: "ratio", formula_ref: "true_mule / auto_blocked" },
    { appetite_metric_id: "APM-MR-001", name: "Models passing MRR validation", linked_risk_id: "R-MR-001", board_approved_threshold: 0.9, unit: "ratio", formula_ref: "approved_models / total_in_use" }
  ],

  appetiteObservations: [
    { observation_id: "APOBS-FC-001-W17", appetite_metric_id: "APM-FC-001", value: 0.88, band: "amber", board_approval_ref: "BRMC-2025-Q4-08", as_of_ts: "2026-04-29T23:59:59Z" },
    { observation_id: "APOBS-FC-001-W16", appetite_metric_id: "APM-FC-001", value: 0.91, band: "amber", board_approval_ref: "BRMC-2025-Q4-08", as_of_ts: "2026-04-22T23:59:59Z" },
    { observation_id: "APOBS-CD-001-W17", appetite_metric_id: "APM-CD-001", value: 0.748, band: "red", board_approval_ref: "BRMC-2025-Q4-09", as_of_ts: "2026-04-29T23:59:59Z" },
    { observation_id: "APOBS-CD-001-W16", appetite_metric_id: "APM-CD-001", value: 0.762, band: "red", board_approval_ref: "BRMC-2025-Q4-09", as_of_ts: "2026-04-22T23:59:59Z" },
    { observation_id: "APOBS-CO-001-W17", appetite_metric_id: "APM-CO-001", value: 0.896, band: "amber", board_approval_ref: "BRMC-2025-Q4-10", as_of_ts: "2026-04-29T23:59:59Z" },
    { observation_id: "APOBS-OP-001-W17", appetite_metric_id: "APM-OP-001", value: 0.922, band: "amber", board_approval_ref: "BRMC-2025-Q4-11", as_of_ts: "2026-04-29T23:59:59Z" },
    { observation_id: "APOBS-TC-001-W17", appetite_metric_id: "APM-TC-001", value: 1.0, band: "green", board_approval_ref: "BRMC-2025-Q4-12", as_of_ts: "2026-04-29T23:59:59Z" },
    { observation_id: "APOBS-CR-001-W17", appetite_metric_id: "APM-CR-001", value: 0.992, band: "green", board_approval_ref: "BRMC-2025-Q4-13", as_of_ts: "2026-04-29T23:59:59Z" },
    { observation_id: "APOBS-TP-001-W17", appetite_metric_id: "APM-TP-001", value: 0.958, band: "green", board_approval_ref: "BRMC-2025-Q4-14", as_of_ts: "2026-04-29T23:59:59Z" },
    { observation_id: "APOBS-MR-001-W17", appetite_metric_id: "APM-MR-001", value: 0.83, band: "amber", board_approval_ref: "BRMC-2025-Q4-15", as_of_ts: "2026-04-29T23:59:59Z" }
  ],

  rootCauseClusters: [
    { cluster_id: "RCC-DSA-LOS-CLOCK", label: "DSA-LOS-clock cluster — KFS timing reversal on DSA-Newgen channel", member_issue_ids: ["ISS-2026-085"], member_control_ids: ["CTRL-LND-002"], member_process_ids: ["PROC-LND-001"], cluster_severity: "high", ai_signal_id: "AII-AI-010-DSA", recommended_remediation_action_ids: ["RA-ISS-085-01"] },
    { cluster_id: "RCC-BPO-AML-L1-SLA", label: "BPO AML L1 SLA cluster — VEND-2024-00203 capacity backlog", member_issue_ids: ["ISS-2026-009"], member_control_ids: ["CTRL-AML-002", "CTRL-AML-003"], member_process_ids: ["PROC-AML-001"], cluster_severity: "high", ai_signal_id: "AII-AI-002-AML-STEP04", recommended_remediation_action_ids: ["RA-ISS-009-01"] },
    { cluster_id: "RCC-DBT-CKYCR-COHORT", label: "DBT/scholarship cohort cluster — re_kyc_due_date null + late CKYCR ack", member_issue_ids: ["ISS-2026-061"], member_control_ids: ["CTRL-KYC-003"], member_process_ids: ["PROC-KYC-001"], cluster_severity: "medium", ai_signal_id: "AII-AI-016-DBT", recommended_remediation_action_ids: ["RA-ISS-061-01"] },
    { cluster_id: "RCC-CKYCR-LATE-ARRIVAL", label: "CKYCR late-arrival cluster — CERSAI ack-batch ingestion lag", member_issue_ids: ["ISS-2026-061"], member_control_ids: ["CTRL-KYC-003"], member_process_ids: ["PROC-KYC-001"], cluster_severity: "medium", ai_signal_id: "AII-AI-005-CKYCR", recommended_remediation_action_ids: [] }
  ],

  auditTrailEvents: [
    { audit_trail_event_id: "ATE-001", entity_ref: { type: "controlInstance", id: "CI-CTRL-AML-002-AML502" }, event_type: "outcome_set", system_time: "2024-11-15T07:18:00Z", valid_time: "2024-11-15T07:18:00Z", actor_id: "system", actor_role: "AML-engine", payload_summary: "outcome=Fail; fail_reason=L1_SLA_BREACH", payload_diff: { before: { outcome: null }, after: { outcome: "Fail" }, fields: ["outcome"] }, content_hash: "sha256:ate001..." },
    { audit_trail_event_id: "ATE-002", entity_ref: { type: "issue", id: "ISS-2026-009" }, event_type: "issue_opened", system_time: "2026-04-08T09:00:00Z", valid_time: "2026-04-08T09:00:00Z", actor_id: "SM-MLRO-001", actor_role: "MLRO", payload_summary: "Issue raised on CTRL-AML-002", payload_diff: { before: null, after: { status: "open" }, fields: ["status"] }, content_hash: "sha256:ate002..." },
    { audit_trail_event_id: "ATE-003", entity_ref: { type: "aiInsight", id: "AII-AI-013-DL884" }, event_type: "human_approval_set", system_time: "2026-04-20T10:00:00Z", valid_time: "2026-04-20T10:00:00Z", actor_id: "SM-CCO-001", actor_role: "CCO", payload_summary: "human_approval_status=accepted; reason=Clock drift caveat reviewed", payload_diff: { before: { human_approval_status: "pending" }, after: { human_approval_status: "accepted" }, fields: ["human_approval_status", "human_approval_reason"] }, content_hash: "sha256:ate003..." },
    { audit_trail_event_id: "ATE-004", entity_ref: { type: "workpaper", id: "WP-AML-002-Q1" }, event_type: "workpaper_signed", system_time: "2026-04-25T16:00:00Z", valid_time: "2026-04-25T16:00:00Z", actor_id: "SM-HIA-001", actor_role: "HIA", payload_summary: "Workpaper signed by tester", payload_diff: { before: { status: "in_review" }, after: { status: "signed" }, fields: ["status", "signed_at"] }, content_hash: "sha256:ate004..." },
    { audit_trail_event_id: "ATE-005", entity_ref: { type: "workpaper", id: "WP-AML-002-Q1" }, event_type: "reviewer_signoff", system_time: "2026-04-26T11:00:00Z", valid_time: "2026-04-26T11:00:00Z", actor_id: "SM-MLRO-001", actor_role: "MLRO", payload_summary: "Workpaper reviewer sign-off", payload_diff: { before: { reviewer_signed_at: null }, after: { reviewer_signed_at: "2026-04-26T11:00:00Z" }, fields: ["reviewer_signed_at"] }, content_hash: "sha256:ate005..." },
    { audit_trail_event_id: "ATE-006", entity_ref: { type: "auditPack", id: "AP-RBI-AFI-2026-Q1" }, event_type: "pack_assembled", system_time: "2026-04-27T14:00:00Z", valid_time: "2026-04-27T14:00:00Z", actor_id: "SM-CCO-001", actor_role: "CCO", payload_summary: "AuditPack assembled with 4 workpapers + 9 evidence items", payload_diff: { before: { ars: 65 }, after: { ars: 73 }, fields: ["ars", "included_workpaper_ids", "included_evidence_ids"] }, content_hash: "sha256:ate006..." },
    { audit_trail_event_id: "ATE-007", entity_ref: { type: "decisionEvent", id: "DE-003" }, event_type: "decision_recorded", system_time: "2026-04-21T14:00:00Z", valid_time: "2026-04-21T14:00:00Z", actor_id: "SM-CIO-001", actor_role: "CIO", payload_summary: "Veto: halt DSA-Newgen new product launch", payload_diff: null, content_hash: "sha256:ate007..." },
    { audit_trail_event_id: "ATE-008", entity_ref: { type: "remediationAction", id: "RA-ISS-085-01" }, event_type: "remediation_assigned", system_time: "2026-04-21T15:00:00Z", valid_time: "2026-04-21T15:00:00Z", actor_id: "SM-CIO-001", actor_role: "CIO", payload_summary: "Remediation assigned to LOS engineering lead", payload_diff: { before: { status: "pending" }, after: { status: "in_progress" }, fields: ["status", "owner_id"] }, content_hash: "sha256:ate008..." },
    { audit_trail_event_id: "ATE-009", entity_ref: { type: "evidenceRecord", id: "EV-LOG-CKYCR-127" }, event_type: "evidence_status_set", system_time: "2024-08-19T03:11:00Z", valid_time: "2024-08-19T03:11:00Z", actor_id: "system", actor_role: "ingestion", payload_summary: "evidence_status=Late (T+3d > 72h SLA)", payload_diff: { before: { evidence_status: "BpoPending" }, after: { evidence_status: "Late" }, fields: ["evidence_status"] }, content_hash: "sha256:ate009..." },
    { audit_trail_event_id: "ATE-010", entity_ref: { type: "attestationEvent", id: "AE-001" }, event_type: "attestation_signed", system_time: "2026-04-12T10:00:00Z", valid_time: "2026-04-12T10:00:00Z", actor_id: "SM-CCO-001", actor_role: "CCO", payload_summary: "CIMS Q1 2025 attestation signed", payload_diff: null, content_hash: "sha256:ate010..." },
    { audit_trail_event_id: "ATE-011", entity_ref: { type: "controlInstance", id: "CI-CTRL-LND-002-DL884" }, event_type: "outcome_set", system_time: "2024-12-15T11:08:14Z", valid_time: "2024-12-15T11:08:14Z", actor_id: "system", actor_role: "LOS", payload_summary: "outcome=Fail; fail_reason=KFS_AFTER_ACCEPTANCE", payload_diff: { before: { outcome: null }, after: { outcome: "Fail" }, fields: ["outcome", "fail_reason"] }, content_hash: "sha256:ate011..." },
    { audit_trail_event_id: "ATE-012", entity_ref: { type: "controlInstance", id: "CI-CTRL-KYC-003-UCIC127" }, event_type: "outcome_set", system_time: "2024-08-19T03:11:00Z", valid_time: "2024-08-19T03:11:00Z", actor_id: "system", actor_role: "KYC", payload_summary: "outcome=EvidenceGap; reason=late ack + null re_kyc_due_date", payload_diff: { before: { outcome: null }, after: { outcome: "EvidenceGap" }, fields: ["outcome", "evidence_gap_reason"] }, content_hash: "sha256:ate012..." },
    { audit_trail_event_id: "ATE-INC-001-A", entity_ref: { type: "incident", id: "INC-2026-ORI-001" }, event_type: "incident_opened", system_time: "2026-04-29T06:00:00Z", valid_time: "2026-04-29T06:00:00Z", actor_id: "SM-OPS-001", actor_role: "Operations", payload_summary: "Incident logged from EOD recon queue", payload_diff: null, content_hash: "sha256:ate-inc001a" },
    { audit_trail_event_id: "ATE-INC-001-B", entity_ref: { type: "incident", id: "INC-2026-ORI-001" }, event_type: "incident_status_set", system_time: "2026-04-29T14:00:00Z", valid_time: "2026-04-29T14:00:00Z", actor_id: "SM-CCO-001", actor_role: "ORM", payload_summary: "status=rca_in_progress; RCA-2026-ORI-01 opened", payload_diff: { before: { status: "reported" }, after: { status: "rca_in_progress" }, fields: ["status"] }, content_hash: "sha256:ate-inc001b" },
    { audit_trail_event_id: "ATE-INC-001-C", entity_ref: { type: "incident", id: "INC-2026-ORI-001" }, event_type: "regulatory_fmr_filed", system_time: "2026-05-01T11:00:00Z", valid_time: "2026-05-01T11:00:00Z", actor_id: "SM-CCO-001", actor_role: "ORM", payload_summary: "Fraud monitoring return filed to RBI", payload_diff: null, content_hash: "sha256:ate-inc001c" },
    { audit_trail_event_id: "ATE-INC-011-A", entity_ref: { type: "incident", id: "INC-2026-ORI-011" }, event_type: "incident_escalated", system_time: "2026-04-09T09:00:00Z", valid_time: "2026-04-09T09:00:00Z", actor_id: "SM-FCC-001", actor_role: "FCC", payload_summary: "Escalated to LE coordination desk", payload_diff: null, content_hash: "sha256:ate-inc011a" }
  ],

  inspectionLenses: [
    { lens_id: "IL-rbi_afi", label: "RBI AFI Readiness", scope_definition: "Bank-wide; in-scope obligations under current RBI MDs", required_evidence_specs: ["EVD-LOG", "EVD-DOC", "EVD-ATTEST", "EVD-REPORT", "EVD-WORKPAPER"], readiness_score_inputs: ["OCS", "CES", "EIFS", "RTS", "SAES", "DCQS"], gap_categories: ["missing_evidence", "stale_evidence", "unlinked_source_records", "open_high_risk_issues", "unclosed_remediation", "missing_sm_attestation", "missing_reporting_ack", "failed_or_not_run_population_tests"] },
    { lens_id: "IL-rbs_sparc", label: "RBS / SPARC Readiness", scope_definition: "SPARC IRISc internal-mock scope", required_evidence_specs: ["EVD-LOG", "EVD-DOC", "EVD-ATTEST", "EVD-REPORT"], readiness_score_inputs: ["OCS", "kri_band_stability", "appetite_history", "issue_mra_closure"], gap_categories: ["irisc_factor_gaps", "missing_evidence", "open_mra"] },
    { lens_id: "IL-pmla_fiu", label: "PMLA / FIU Evidence Readiness", scope_definition: "AML + CDD chain (UCIC × accounts × counterparties)", required_evidence_specs: ["EVD-LOG", "EVD-DOC", "EVD-ATTEST", "EVD-REPORT"], readiness_score_inputs: ["RTS", "EIFS", "SAES", "DCQS"], gap_categories: ["late_str", "missed_ctr", "missing_finnet_ack", "broken_cdd_chain"] },
    { lens_id: "IL-itgrca_csite", label: "ITGRCA / CSITE / CERT-In Readiness", scope_definition: "IT/cyber + TPSP + change/incident/patch/access", required_evidence_specs: ["EVD-LOG", "EVD-DOC", "EVD-REPORT"], readiness_score_inputs: ["RTS", "EIFS", "SAES"], gap_categories: ["late_submission", "missed_dr_drill", "privileged_access_orphans", "vendor_6h_re_notification"] },
    { lens_id: "IL-concurrent", label: "Concurrent Audit Readiness", scope_definition: "High-risk activities × branch coverage", required_evidence_specs: ["EVD-LOG", "EVD-RECON", "EVD-WORKPAPER", "EVD-ATTEST"], readiness_score_inputs: ["OCS", "CES", "daily_exception_coverage"], gap_categories: ["branch_coverage_gaps", "missing_daily_cycle_exceptions", "outdated_icr_signoffs"] },
    { lens_id: "IL-statutory", label: "Statutory Audit Readiness", scope_definition: "Books, NPA, IRACP, capital, large exposures", required_evidence_specs: ["EVD-LOG", "EVD-RECON", "EVD-DOC", "EVD-ATTEST"], readiness_score_inputs: ["EIFS", "CES_credit", "SAES_CFO", "DCQS"], gap_categories: ["reconciliation_breaks", "iracp_overrides", "large_exposure_reporting_gaps"] },
    { lens_id: "IL-board", label: "Board / Audit Committee Pack Readiness", scope_definition: "Period MI for BRMC / ACB", required_evidence_specs: ["EVD-BOARD", "EVD-ATTEST", "AI-narrative"], readiness_score_inputs: ["RES", "CES_aggregate", "OCS", "SAES", "ARS"], gap_categories: ["open_material_issues", "pending_attestations", "missing_ai_explanations"] }
  ],

  sourceSystemHealth: [
    { health_id: "SSH-001", source_system_id: "SS-CBS-FINACLE", ingestion_lag_ms: 1800, last_successful_ingest_ts: "2026-04-30T18:30:00Z", error_rate: 0.001, schema_version_current: "FINACLE-11.7", status: "healthy", orphan_count: 0 },
    { health_id: "SSH-002", source_system_id: "SS-LOS-NEWGEN", ingestion_lag_ms: 4200, last_successful_ingest_ts: "2026-04-30T18:28:00Z", error_rate: 0.008, schema_version_current: "NEWGEN-LOS-9.2", status: "healthy", orphan_count: 12 },
    { health_id: "SSH-003", source_system_id: "SS-AML-FCCM", ingestion_lag_ms: 90000, last_successful_ingest_ts: "2026-04-30T17:45:00Z", error_rate: 0.022, schema_version_current: "FCCM-8.0.3", status: "degraded", orphan_count: 47 },
    { health_id: "SSH-004", source_system_id: "SS-SANC-FIRCO", ingestion_lag_ms: 950, last_successful_ingest_ts: "2026-04-30T18:30:00Z", error_rate: 0.0, schema_version_current: "FIRCO-CONTINUITY-5.4", status: "healthy", orphan_count: 0 },
    { health_id: "SSH-005", source_system_id: "SS-CKYCR", ingestion_lag_ms: 280000, last_successful_ingest_ts: "2026-04-29T22:00:00Z", error_rate: 0.04, schema_version_current: "CKYCR-2.1", status: "degraded", orphan_count: 23 },
    { health_id: "SSH-006", source_system_id: "SS-CASE-PEGA", ingestion_lag_ms: 4800, last_successful_ingest_ts: "2026-04-30T18:29:00Z", error_rate: 0.003, schema_version_current: "PEGA-8.7", status: "healthy", orphan_count: 8 }
  ],

  demoStorylines: [
    { storyline_id: "STORY-amlAlertSlaStrRisk", title: "Story 1 — AML Alert SLA / STR Risk", persona_starts_with: "PERSONA-001", steps: [
      { step_id: 1, persona: "cro", screen: "riskPosture", action_label: "CRO sees R-FC-001 tile turn red on Risk Domain Heatmap", highlight_record_ref: { type: "risk", id: "R-FC-001" }, narrative: "Financial Crime KRI band moved to red; STR clock at-risk on cockpit strip" },
      { step_id: 2, persona: "cro", screen: "whatChanged", action_label: "Reads delta card 'CTRL-AML-002 CES 78 → 65; AI-018 fired'", highlight_record_ref: { type: "control", id: "CTRL-AML-002" }, narrative: "Movement is concentrated this week; recognises emerging pressure" },
      { step_id: 3, persona: "cro", screen: "controlDrillDown", action_label: "Drills into CTRL-AML-002; CES Breakdown shows OperatingRate=79", highlight_record_ref: { type: "control", id: "CTRL-AML-002" }, narrative: "Population grid surfaces AML-ALRT-2024-00502 with L1 SLA breach" },
      { step_id: 4, persona: "compliance", screen: "controlDrillDown", action_label: "MLRO opens D-01 lineage drawer on CI-CTRL-AML-002-AML502", highlight_record_ref: { type: "controlInstance", id: "CI-CTRL-AML-002-AML502" }, narrative: "Lineage shows orphan SR-CASE-AML-502-DISPO-MISSING; CR-004 orphan correlation" },
      { step_id: 5, persona: "compliance", screen: "aiInsights", action_label: "Reviews AII-AI-018-AML002 + AII-AI-002-AML-STEP04; accepts both", highlight_record_ref: { type: "aiInsight", id: "AII-AI-018-AML002" }, narrative: "VEND-2024-00203 BPO floor capacity backlog confirmed" },
      { step_id: 6, persona: "compliance", screen: "issueBoard", action_label: "Opens ISS-2026-009; Section 47A exposure flag = candidate", highlight_record_ref: { type: "issue", id: "ISS-2026-009" }, narrative: "Routes RA-ISS-009-01 to SM-FCC-001 for capacity uplift + push-API integration" },
      { step_id: 7, persona: "audit", screen: "populationTesting", action_label: "Runs CTRL-AML-002 pop test for March 2026", highlight_record_ref: { type: "testExecution", id: "TX-AML-002-MAR2026" }, narrative: "Population 1,247; tested 1,247; exceptions 47 — concentrated on VEND-00203 floor" },
      { step_id: 8, persona: "audit", screen: "evidenceWorkbench", action_label: "Verifies EV-LOG-CASE-502 status=Partial; raises evidence-gap for AI-005", highlight_record_ref: { type: "evidenceRecord", id: "EV-LOG-CASE-502" }, narrative: "Distinguishes evidence gap from control failure" },
      { step_id: 9, persona: "audit", screen: "workpaperAuditPackBuilder", action_label: "Generates WP-AML-002-Q1; signs as tester; routes to MLRO reviewer", highlight_record_ref: { type: "workpaper", id: "WP-AML-002-Q1" }, narrative: "Reviewer sign-off captured; readiness flags green for RBI AFI + PMLA + Concurrent" },
      { step_id: 10, persona: "compliance", screen: "workpaperAuditPackBuilder", action_label: "Adds WP-AML-002-Q1 to AP-RBI-AFI-2026-Q1 + AP-PMLA-FIU-2026-Q1", highlight_record_ref: { type: "auditPack", id: "AP-PMLA-FIU-2026-Q1" }, narrative: "PMLA-FIU pack ARS rises from 60 to 68 amber" },
      { step_id: 11, persona: "cro", screen: "inspectionReadiness", action_label: "RBI AFI lens shows ARS recovered to 73 amber; remediation tracking visible", highlight_record_ref: { type: "auditPack", id: "AP-RBI-AFI-2026-Q1" }, narrative: "Demonstrates live-state inspection readiness, not export-driven" }
    ] },
    { storyline_id: "STORY-kycCkycrGap", title: "Story 2 — KYC / CKYCR Evidence Gap", persona_starts_with: "PERSONA-002", steps: [
      { step_id: 1, persona: "compliance", screen: "obligationCoverage", action_label: "CCO selects OBL-RBI-KYC-003; coverage Adequate but EIFS warning", highlight_record_ref: { type: "obligation", id: "OBL-RBI-KYC-003" }, narrative: "AI-016 cohort chip visible alongside coverage bar" },
      { step_id: 2, persona: "compliance", screen: "controlDrillDown", action_label: "Opens CTRL-KYC-003; CES headline=82.2 amber; CatchRate=78", highlight_record_ref: { type: "control", id: "CTRL-KYC-003" }, narrative: "EvidenceCompleteness component (73) is the weak point" },
      { step_id: 3, persona: "compliance", screen: "aiInsights", action_label: "Accepts AII-AI-016-DBT (660 cohort UCICs); routes to ISS-2026-061", highlight_record_ref: { type: "aiInsight", id: "AII-AI-016-DBT" }, narrative: "PMJDY reference list cross-checked; cohort segmentation valid" },
      { step_id: 4, persona: "audit", screen: "populationTesting", action_label: "Runs TX-KYC-003-MAR2026; population 18,400; exceptions 1,910", highlight_record_ref: { type: "testExecution", id: "TX-KYC-003-MAR2026" }, narrative: "Cluster 'DBT/scholarship cohort — re_kyc_due_date null' surfaces UCIC-2024-00127" },
      { step_id: 5, persona: "audit", screen: "evidenceWorkbench", action_label: "Drills UCIC-2024-00127; sees EV-LOG-CKYCR-127 Late + EV-DOC-RE-KYC-127 Missing", highlight_record_ref: { type: "evidenceRecord", id: "EV-DOC-RE-KYC-127" }, narrative: "Distinguishes Evidence Gap from Control Failure — purple+amber badges, not red" },
      { step_id: 6, persona: "audit", screen: "evidenceWorkbench", action_label: "Opens D-01 EvidenceChainDrawer for EV-LOG-CKYCR-127", highlight_record_ref: { type: "correlationRecord", id: "CR-001" }, narrative: "CR-001 correlation_status=late_arriving (CKYCR ack T+3d)" },
      { step_id: 7, persona: "audit", screen: "workpaperAuditPackBuilder", action_label: "Generates WP-KYC-003-Q1; AI-drafts findings citing AI-016 cohort", highlight_record_ref: { type: "workpaper", id: "WP-KYC-003-Q1" }, narrative: "Tester signs; reviewer (CCO) sign-off pending" },
      { step_id: 8, persona: "compliance", screen: "workpaperAuditPackBuilder", action_label: "Adds WP-KYC-003-Q1 to AP-RBI-AFI-2026-Q1", highlight_record_ref: { type: "auditPack", id: "AP-RBI-AFI-2026-Q1" }, narrative: "AFI pack composition tree reflects KYC theme update" }
    ] },
    { storyline_id: "STORY-digitalLendingKfsViolation", title: "Story 3 — Digital Lending KFS Timing Violation", persona_starts_with: "PERSONA-001", steps: [
      { step_id: 1, persona: "cro", screen: "riskPosture", action_label: "R-CD-001 tile amber; What-Changed strip: 'ISS-2026-085; 11,118 instances'", highlight_record_ref: { type: "risk", id: "R-CD-001" }, narrative: "Mass DSA-channel violation surfaces" },
      { step_id: 2, persona: "compliance", screen: "obligationCoverage", action_label: "Selects OBL-RBI-DL-001 (KFS pre-acceptance Para 8); CTRL-LND-002 chip", highlight_record_ref: { type: "obligation", id: "OBL-RBI-DL-001" }, narrative: "Coverage Adequate but CES headline 89.51 with OperatingRate 74.77 below appetite" },
      { step_id: 3, persona: "compliance", screen: "controlDrillDown", action_label: "Opens CTRL-LND-002; CES Breakdown reveals Operating Rate as the issue", highlight_record_ref: { type: "control", id: "CTRL-LND-002" }, narrative: "AI-018 inline note: 'OR masked by high CR'" },
      { step_id: 4, persona: "compliance", screen: "controlDrillDown", action_label: "Sorts Population grid by Fail; clicks DL-APP-2024-00884", highlight_record_ref: { type: "controlInstance", id: "CI-CTRL-LND-002-DL884" }, narrative: "kfs_issued_at 11:08:14Z, borrower_acceptance_at 10:55:02Z (Δ −13m12s)" },
      { step_id: 5, persona: "compliance", screen: "controlDrillDown", action_label: "Opens D-01 EvidenceChainDrawer", highlight_record_ref: { type: "correlationRecord", id: "CR-005" }, narrative: "CR-005 correlation_status=timestamp_reversal; AI-013 confidence 0.97" },
      { step_id: 6, persona: "compliance", screen: "aiInsights", action_label: "Accepts AII-AI-013-DL884 with NTP attestation caveat", highlight_record_ref: { type: "aiInsight", id: "AII-AI-013-DL884" }, narrative: "Bajaj Finance Nov-2023 archetype recognised" },
      { step_id: 7, persona: "compliance", screen: "issueBoard", action_label: "ISS-2026-085 cluster RCC-DSA-LOS-CLOCK; routes RA to CIO accountable SM", highlight_record_ref: { type: "issue", id: "ISS-2026-085" }, narrative: "DE-003 veto: halt DSA-Newgen new-product launch" },
      { step_id: 8, persona: "audit", screen: "populationTesting", action_label: "Runs TX-LND-002-DEC2025; 11,118 exceptions concentrated DSA channel", highlight_record_ref: { type: "testExecution", id: "TX-LND-002-DEC2025" }, narrative: "Pattern documented; CIMS quarterly reporting flagged" },
      { step_id: 9, persona: "audit", screen: "workpaperAuditPackBuilder", action_label: "Generates WP-LND-002-Q4; adds to RBI AFI + Statutory packs", highlight_record_ref: { type: "workpaper", id: "WP-LND-002-Q4" }, narrative: "Inspection-ready pack; product halt becomes evidenced decision" }
    ] },
    { storyline_id: "STORY-inspectionReadinessPack", title: "Story 4 — Inspection Readiness", persona_starts_with: "PERSONA-001", steps: [
      { step_id: 1, persona: "cro", screen: "inspectionReadiness", action_label: "Opens RBI AFI lens; ARS=73 amber", highlight_record_ref: { type: "auditPack", id: "AP-RBI-AFI-2026-Q1" }, narrative: "Gap list shows 6 categories with counts" },
      { step_id: 2, persona: "cro", screen: "inspectionReadiness", action_label: "Clicks 'missing evidence' gap → routes to S-08 filtered to Missing/Late", highlight_record_ref: { type: "evidenceRecord", id: "EV-DOC-RE-KYC-127" }, narrative: "Route-to-fix design demonstrated" },
      { step_id: 3, persona: "audit", screen: "evidenceWorkbench", action_label: "Opens D-01 EvidenceChainDrawer; sees CR-002 needs_review (re_kyc null)", highlight_record_ref: { type: "correlationRecord", id: "CR-002" }, narrative: "Source-system owner = CBS Finacle (SSH-001 healthy but field missing in source)" },
      { step_id: 4, persona: "audit", screen: "workpaperAuditPackBuilder", action_label: "After RA-ISS-061-01 deploys, retest TX-KYC-003-RETEST passes", highlight_record_ref: { type: "remediationAction", id: "RA-ISS-061-01" }, narrative: "Retest workpaper bundled with original failing-CI evidence" },
      { step_id: 5, persona: "cro", screen: "inspectionReadiness", action_label: "ARS rises 73 → 81 green-leaning amber after pack additions", highlight_record_ref: { type: "auditPack", id: "AP-RBI-AFI-2026-Q1" }, narrative: "Live-state readiness, not retrospectively assembled" }
    ] },
    { storyline_id: "STORY-populationTestingToWorkpaper", title: "Story 5 — Population Testing to Workpaper", persona_starts_with: "PERSONA-003", steps: [
      { step_id: 1, persona: "audit", screen: "controlUniverse", action_label: "Filters by population_testable_flag=true; selects CTRL-KYC-003", highlight_record_ref: { type: "control", id: "CTRL-KYC-003" }, narrative: "Demonstrates default population-testing assurance method" },
      { step_id: 2, persona: "audit", screen: "populationTesting", action_label: "Configures TestRunnerPanel; runs population_reperformance test", highlight_record_ref: { type: "testExecution", id: "TX-KYC-003-MAR2026" }, narrative: "Population query rerunnable; as-of date locked" },
      { step_id: 3, persona: "audit", screen: "populationTesting", action_label: "Drills exception cluster → individual ControlInstance → D-01 lineage", highlight_record_ref: { type: "controlInstance", id: "CI-CTRL-KYC-003-UCIC127" }, narrative: "Two-click to SourceRecord achieved" },
      { step_id: 4, persona: "audit", screen: "workpaperAuditPackBuilder", action_label: "Generates WP-KYC-003-Q1; signs; AuditPack mode adds to AP-RBI-AFI-2026-Q1", highlight_record_ref: { type: "workpaper", id: "WP-KYC-003-Q1" }, narrative: "RBI AFI / Concurrent readiness flags set" }
    ] }
  ],

  rcsaCycles: [
    {
      "rcsa_cycle_id": "RC-FY26-H1-RL",
      "cycle_name": "Retail Liabilities — Finacle / CKYCR / DBT proxy touchpoints",
      "fiscal_period_label": "FY26-H1",
      "period_start": "2026-04-01",
      "period_end": "2026-09-30",
      "status": "not_started",
      "linked_process_id": "PROC-KYC-001",
      "owner_senior_manager_id": "SM-CCO-001",
      "business_unit": "Retail Banking",
      "refresh_cadence": "half_yearly",
      "target_signoff_at": "2026-03-20"
    },
    {
      "rcsa_cycle_id": "RC-FY26-H1-DL",
      "cycle_name": "Digital Lending — LOS v9 KFS vs RBI MD MIS pack",
      "fiscal_period_label": "FY26-H1",
      "period_start": "2026-04-01",
      "period_end": "2026-09-30",
      "status": "in_progress",
      "linked_process_id": "PROC-LND-001",
      "owner_senior_manager_id": "SM-CCO-001",
      "business_unit": "Digital Lending",
      "refresh_cadence": "quarterly",
      "target_signoff_at": "2026-04-28"
    },
    {
      "rcsa_cycle_id": "RC-FY26-H1-TR",
      "cycle_name": "Treasury — T+1 settlement / CCIL / liquidity MIS",
      "fiscal_period_label": "FY26-H1",
      "period_start": "2026-04-01",
      "period_end": "2026-09-30",
      "status": "in_progress",
      "linked_process_id": "PROC-VND-001",
      "owner_senior_manager_id": "SM-CCO-001",
      "business_unit": "Treasury",
      "refresh_cadence": "annual",
      "target_signoff_at": "2026-08-15"
    },
    {
      "rcsa_cycle_id": "RC-FY26-H1-TF",
      "cycle_name": "Trade Finance",
      "fiscal_period_label": "FY26-H1",
      "period_start": "2026-04-01",
      "period_end": "2026-09-30",
      "status": "in_progress",
      "linked_process_id": "PROC-VND-001",
      "owner_senior_manager_id": "SM-CCO-001",
      "business_unit": "Trade Finance",
      "refresh_cadence": "half_yearly",
      "target_signoff_at": "2026-08-20"
    },
    {
      "rcsa_cycle_id": "RC-FY26-H1-CP",
      "cycle_name": "Cards & Payments",
      "fiscal_period_label": "FY26-H1",
      "period_start": "2026-04-01",
      "period_end": "2026-09-30",
      "status": "in_progress",
      "linked_process_id": "PROC-UPI-001",
      "owner_senior_manager_id": "SM-CCO-001",
      "business_unit": "Cards & Payments",
      "refresh_cadence": "quarterly",
      "target_signoff_at": "2026-07-10"
    },
    {
      "rcsa_cycle_id": "RC-FY26-H1-IT",
      "cycle_name": "IT Operations",
      "fiscal_period_label": "FY26-H1",
      "period_start": "2026-04-01",
      "period_end": "2026-09-30",
      "status": "spoc_review",
      "linked_process_id": "PROC-ITO-001",
      "owner_senior_manager_id": "SM-CCO-001",
      "business_unit": "IT Operations",
      "refresh_cadence": "monthly",
      "target_signoff_at": "2026-04-15"
    },
    {
      "rcsa_cycle_id": "RC-FY26-H1-BB",
      "cycle_name": "Branch Banking",
      "fiscal_period_label": "FY26-H1",
      "period_start": "2026-04-01",
      "period_end": "2026-09-30",
      "status": "spoc_review",
      "linked_process_id": "PROC-KYC-001",
      "owner_senior_manager_id": "SM-CCO-001",
      "business_unit": "Branch Banking",
      "refresh_cadence": "quarterly",
      "target_signoff_at": "2026-06-01"
    },
    {
      "rcsa_cycle_id": "RC-FY26-H1-FC",
      "cycle_name": "Financial Crime Operations",
      "fiscal_period_label": "FY26-H1",
      "period_start": "2026-04-01",
      "period_end": "2026-09-30",
      "status": "hod_approval",
      "linked_process_id": "PROC-AML-001",
      "owner_senior_manager_id": "SM-CCO-001",
      "business_unit": "Financial Crime",
      "refresh_cadence": "annual",
      "target_signoff_at": "2026-05-28"
    },
    {
      "rcsa_cycle_id": "RC-FY26-H1-WM",
      "cycle_name": "Wealth Management",
      "fiscal_period_label": "FY26-H1",
      "period_start": "2026-04-01",
      "period_end": "2026-09-30",
      "status": "signed_off",
      "linked_process_id": "PROC-KYC-001",
      "owner_senior_manager_id": "SM-CCO-001",
      "business_unit": "Wealth Management",
      "refresh_cadence": "half_yearly",
      "target_signoff_at": "2026-04-30"
    },
    {
      "rcsa_cycle_id": "RC-FY26-H1-CB",
      "cycle_name": "Corporate Banking",
      "fiscal_period_label": "FY26-H1",
      "period_start": "2026-04-01",
      "period_end": "2026-09-30",
      "status": "locked",
      "linked_process_id": "PROC-LND-001",
      "owner_senior_manager_id": "SM-CCO-001",
      "business_unit": "Corporate Banking",
      "refresh_cadence": "annual",
      "target_signoff_at": "2026-09-15"
    }
  ],

  rcsaCells: [
    {
      "rcsa_cell_id": "RCELL-FY26-001",
      "rcsa_cycle_id": "RC-FY26-H1-RL",
      "risk_id": "R-CD-001",
      "process_id": "PROC-KYC-001",
      "control_ids": [
        "CTRL-KYC-002",
        "CTRL-KYC-003"
      ],
      "inherent_likelihood": 3,
      "inherent_impact": 5,
      "inherent_rating": "high",
      "control_effectiveness_score": 89,
      "residual_rating": "low",
      "residual_trend": "stable",
      "spoc_attested_at": "2026-05-08T14:30:00Z",
      "last_refreshed": "2026-04-27"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-002",
      "rcsa_cycle_id": "RC-FY26-H1-RL",
      "risk_id": "R-OP-001",
      "process_id": "PROC-KYC-001",
      "control_ids": [
        "CTRL-KYC-003",
        "CTRL-KYC-001",
        "CTRL-KYC-002"
      ],
      "inherent_likelihood": 4,
      "inherent_impact": 4,
      "inherent_rating": "high",
      "control_effectiveness_score": 92,
      "residual_rating": "low",
      "residual_trend": "stable",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-25"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-003",
      "rcsa_cycle_id": "RC-FY26-H1-DL",
      "risk_id": "R-OP-001",
      "process_id": "PROC-LND-001",
      "control_ids": [
        "CTRL-LND-002"
      ],
      "inherent_likelihood": 5,
      "inherent_impact": 3,
      "inherent_rating": "high",
      "control_effectiveness_score": 91,
      "residual_rating": "low",
      "residual_trend": "stable",
      "spoc_attested_at": "2026-05-08T14:30:00Z",
      "last_refreshed": "2026-04-25"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-004",
      "rcsa_cycle_id": "RC-FY26-H1-DL",
      "risk_id": "R-CR-001",
      "process_id": "PROC-LND-001",
      "control_ids": [
        "CTRL-LND-001",
        "CTRL-LND-002"
      ],
      "inherent_likelihood": 2,
      "inherent_impact": 2,
      "inherent_rating": "low",
      "control_effectiveness_score": 93,
      "residual_rating": "low",
      "residual_trend": "stable",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-23"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-005",
      "rcsa_cycle_id": "RC-FY26-H1-DL",
      "risk_id": "R-FR-001",
      "process_id": "PROC-LND-001",
      "control_ids": [
        "CTRL-LND-002",
        "CTRL-LND-001",
        "CTRL-LND-002"
      ],
      "inherent_likelihood": 3,
      "inherent_impact": 5,
      "inherent_rating": "high",
      "control_effectiveness_score": 88,
      "residual_rating": "medium",
      "residual_trend": "stable",
      "spoc_attested_at": "2026-05-08T14:30:00Z",
      "last_refreshed": "2026-04-21"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-006",
      "rcsa_cycle_id": "RC-FY26-H1-DL",
      "risk_id": "R-FC-001",
      "process_id": "PROC-LND-001",
      "control_ids": [
        "CTRL-LND-001"
      ],
      "inherent_likelihood": 4,
      "inherent_impact": 4,
      "inherent_rating": "high",
      "control_effectiveness_score": 91,
      "residual_rating": "low",
      "residual_trend": "stable",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-19"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-007",
      "rcsa_cycle_id": "RC-FY26-H1-TR",
      "risk_id": "R-FR-001",
      "process_id": "PROC-VND-001",
      "control_ids": [
        "CTRL-VND-002",
        "CTRL-VND-001"
      ],
      "inherent_likelihood": 5,
      "inherent_impact": 3,
      "inherent_rating": "high",
      "control_effectiveness_score": 72,
      "residual_rating": "high",
      "residual_trend": "stable",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-21"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-008",
      "rcsa_cycle_id": "RC-FY26-H1-TR",
      "risk_id": "R-FC-001",
      "process_id": "PROC-VND-001",
      "control_ids": [
        "CTRL-VND-001",
        "CTRL-VND-002",
        "CTRL-VND-001"
      ],
      "inherent_likelihood": 2,
      "inherent_impact": 2,
      "inherent_rating": "low",
      "control_effectiveness_score": 74,
      "residual_rating": "low",
      "residual_trend": "stable",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-19"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-009",
      "rcsa_cycle_id": "RC-FY26-H1-TR",
      "risk_id": "R-CO-001",
      "process_id": "PROC-VND-001",
      "control_ids": [
        "CTRL-VND-002"
      ],
      "inherent_likelihood": 3,
      "inherent_impact": 5,
      "inherent_rating": "high",
      "control_effectiveness_score": 73,
      "residual_rating": "high",
      "residual_trend": "stable",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-17"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-010",
      "rcsa_cycle_id": "RC-FY26-H1-TR",
      "risk_id": "R-TC-001",
      "process_id": "PROC-VND-001",
      "control_ids": [
        "CTRL-VND-001",
        "CTRL-VND-002"
      ],
      "inherent_likelihood": 4,
      "inherent_impact": 4,
      "inherent_rating": "high",
      "control_effectiveness_score": 70,
      "residual_rating": "high",
      "residual_trend": "stable",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-15"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-011",
      "rcsa_cycle_id": "RC-FY26-H1-TF",
      "risk_id": "R-CO-001",
      "process_id": "PROC-VND-001",
      "control_ids": [
        "CTRL-VND-002",
        "CTRL-VND-001",
        "CTRL-VND-002"
      ],
      "inherent_likelihood": 5,
      "inherent_impact": 3,
      "inherent_rating": "high",
      "control_effectiveness_score": 71,
      "residual_rating": "high",
      "residual_trend": "stable",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-17"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-012",
      "rcsa_cycle_id": "RC-FY26-H1-TF",
      "risk_id": "R-TC-001",
      "process_id": "PROC-VND-001",
      "control_ids": [
        "CTRL-VND-001"
      ],
      "inherent_likelihood": 2,
      "inherent_impact": 2,
      "inherent_rating": "low",
      "control_effectiveness_score": 73,
      "residual_rating": "low",
      "residual_trend": "stable",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-15"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-013",
      "rcsa_cycle_id": "RC-FY26-H1-TF",
      "risk_id": "R-TP-001",
      "process_id": "PROC-VND-001",
      "control_ids": [
        "CTRL-VND-002",
        "CTRL-VND-001"
      ],
      "inherent_likelihood": 3,
      "inherent_impact": 5,
      "inherent_rating": "high",
      "control_effectiveness_score": 73,
      "residual_rating": "high",
      "residual_trend": "stable",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-13"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-014",
      "rcsa_cycle_id": "RC-FY26-H1-TF",
      "risk_id": "R-MR-001",
      "process_id": "PROC-VND-001",
      "control_ids": [
        "CTRL-VND-001",
        "CTRL-VND-002",
        "CTRL-VND-001"
      ],
      "inherent_likelihood": 4,
      "inherent_impact": 4,
      "inherent_rating": "high",
      "control_effectiveness_score": 75,
      "residual_rating": "high",
      "residual_trend": "stable",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-11"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-015",
      "rcsa_cycle_id": "RC-FY26-H1-CP",
      "risk_id": "R-TP-001",
      "process_id": "PROC-UPI-001",
      "control_ids": [
        "CTRL-UPI-001"
      ],
      "inherent_likelihood": 5,
      "inherent_impact": 3,
      "inherent_rating": "high",
      "control_effectiveness_score": 68,
      "residual_rating": "high",
      "residual_trend": "stable",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-13"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-016",
      "rcsa_cycle_id": "RC-FY26-H1-CP",
      "risk_id": "R-MR-001",
      "process_id": "PROC-UPI-001",
      "control_ids": [
        "CTRL-UPI-001",
        "CTRL-UPI-001"
      ],
      "inherent_likelihood": 2,
      "inherent_impact": 2,
      "inherent_rating": "low",
      "control_effectiveness_score": 69,
      "residual_rating": "low",
      "residual_trend": "stable",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-11"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-017",
      "rcsa_cycle_id": "RC-FY26-H1-CP",
      "risk_id": "R-CD-001",
      "process_id": "PROC-UPI-001",
      "control_ids": [
        "CTRL-UPI-001",
        "CTRL-UPI-001",
        "CTRL-UPI-001"
      ],
      "inherent_likelihood": 3,
      "inherent_impact": 5,
      "inherent_rating": "high",
      "control_effectiveness_score": 70,
      "residual_rating": "high",
      "residual_trend": "stable",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-09"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-018",
      "rcsa_cycle_id": "RC-FY26-H1-CP",
      "risk_id": "R-OP-001",
      "process_id": "PROC-UPI-001",
      "control_ids": [
        "CTRL-UPI-001"
      ],
      "inherent_likelihood": 4,
      "inherent_impact": 4,
      "inherent_rating": "high",
      "control_effectiveness_score": 71,
      "residual_rating": "high",
      "residual_trend": "stable",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-27"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-019",
      "rcsa_cycle_id": "RC-FY26-H1-IT",
      "risk_id": "R-CD-001",
      "process_id": "PROC-ITO-001",
      "control_ids": [
        "CTRL-ITO-001",
        "CTRL-ITO-001"
      ],
      "inherent_likelihood": 5,
      "inherent_impact": 3,
      "inherent_rating": "high",
      "control_effectiveness_score": 91,
      "residual_rating": "low",
      "residual_trend": "stable",
      "spoc_attested_at": "2026-05-08T14:30:00Z",
      "last_refreshed": "2026-04-09"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-020",
      "rcsa_cycle_id": "RC-FY26-H1-IT",
      "risk_id": "R-OP-001",
      "process_id": "PROC-ITO-001",
      "control_ids": [
        "CTRL-ITO-001",
        "CTRL-ITO-001",
        "CTRL-ITO-001"
      ],
      "inherent_likelihood": 2,
      "inherent_impact": 2,
      "inherent_rating": "low",
      "control_effectiveness_score": 87,
      "residual_rating": "low",
      "residual_trend": "stable",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-27"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-021",
      "rcsa_cycle_id": "RC-FY26-H1-IT",
      "risk_id": "R-CR-001",
      "process_id": "PROC-ITO-001",
      "control_ids": [
        "CTRL-ITO-001"
      ],
      "inherent_likelihood": 3,
      "inherent_impact": 5,
      "inherent_rating": "high",
      "control_effectiveness_score": 88,
      "residual_rating": "medium",
      "residual_trend": "stable",
      "spoc_attested_at": "2026-05-08T14:30:00Z",
      "last_refreshed": "2026-04-25"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-022",
      "rcsa_cycle_id": "RC-FY26-H1-IT",
      "risk_id": "R-FR-001",
      "process_id": "PROC-ITO-001",
      "control_ids": [
        "CTRL-ITO-001",
        "CTRL-ITO-001"
      ],
      "inherent_likelihood": 4,
      "inherent_impact": 4,
      "inherent_rating": "high",
      "control_effectiveness_score": 89,
      "residual_rating": "low",
      "residual_trend": "stable",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-23"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-023",
      "rcsa_cycle_id": "RC-FY26-H1-BB",
      "risk_id": "R-CR-001",
      "process_id": "PROC-KYC-001",
      "control_ids": [
        "CTRL-KYC-003",
        "CTRL-KYC-001",
        "CTRL-KYC-002"
      ],
      "inherent_likelihood": 5,
      "inherent_impact": 3,
      "inherent_rating": "high",
      "control_effectiveness_score": 93,
      "residual_rating": "low",
      "residual_trend": "stable",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-25"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-024",
      "rcsa_cycle_id": "RC-FY26-H1-BB",
      "risk_id": "R-FR-001",
      "process_id": "PROC-KYC-001",
      "control_ids": [
        "CTRL-KYC-001"
      ],
      "inherent_likelihood": 2,
      "inherent_impact": 2,
      "inherent_rating": "low",
      "control_effectiveness_score": 95,
      "residual_rating": "low",
      "residual_trend": "stable",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-23"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-025",
      "rcsa_cycle_id": "RC-FY26-H1-BB",
      "risk_id": "R-FC-001",
      "process_id": "PROC-KYC-001",
      "control_ids": [
        "CTRL-KYC-002",
        "CTRL-KYC-003"
      ],
      "inherent_likelihood": 3,
      "inherent_impact": 5,
      "inherent_rating": "high",
      "control_effectiveness_score": 88,
      "residual_rating": "medium",
      "residual_trend": "deteriorating",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-21"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-026",
      "rcsa_cycle_id": "RC-FY26-H1-BB",
      "risk_id": "R-CO-001",
      "process_id": "PROC-KYC-001",
      "control_ids": [
        "CTRL-KYC-003",
        "CTRL-KYC-001",
        "CTRL-KYC-002"
      ],
      "inherent_likelihood": 4,
      "inherent_impact": 4,
      "inherent_rating": "high",
      "control_effectiveness_score": 91,
      "residual_rating": "low",
      "residual_trend": "deteriorating",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-19"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-027",
      "rcsa_cycle_id": "RC-FY26-H1-FC",
      "risk_id": "R-FC-001",
      "process_id": "PROC-AML-001",
      "control_ids": [
        "CTRL-AML-003"
      ],
      "inherent_likelihood": 5,
      "inherent_impact": 3,
      "inherent_rating": "high",
      "control_effectiveness_score": 88,
      "residual_rating": "medium",
      "residual_trend": "deteriorating",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-21"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-028",
      "rcsa_cycle_id": "RC-FY26-H1-FC",
      "risk_id": "R-CO-001",
      "process_id": "PROC-AML-001",
      "control_ids": [
        "CTRL-AML-002",
        "CTRL-AML-003"
      ],
      "inherent_likelihood": 2,
      "inherent_impact": 2,
      "inherent_rating": "low",
      "control_effectiveness_score": 80,
      "residual_rating": "low",
      "residual_trend": "deteriorating",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-19"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-029",
      "rcsa_cycle_id": "RC-FY26-H1-FC",
      "risk_id": "R-TC-001",
      "process_id": "PROC-AML-001",
      "control_ids": [
        "CTRL-AML-003",
        "CTRL-AML-002",
        "CTRL-AML-003"
      ],
      "inherent_likelihood": 3,
      "inherent_impact": 5,
      "inherent_rating": "high",
      "control_effectiveness_score": 84,
      "residual_rating": "medium",
      "residual_trend": "deteriorating",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-17"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-030",
      "rcsa_cycle_id": "RC-FY26-H1-FC",
      "risk_id": "R-TP-001",
      "process_id": "PROC-AML-001",
      "control_ids": [
        "CTRL-AML-002"
      ],
      "inherent_likelihood": 4,
      "inherent_impact": 4,
      "inherent_rating": "high",
      "control_effectiveness_score": 68,
      "residual_rating": "high",
      "residual_trend": "deteriorating",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-15"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-031",
      "rcsa_cycle_id": "RC-FY26-H1-WM",
      "risk_id": "R-TC-001",
      "process_id": "PROC-KYC-001",
      "control_ids": [
        "CTRL-KYC-002",
        "CTRL-KYC-003"
      ],
      "inherent_likelihood": 5,
      "inherent_impact": 3,
      "inherent_rating": "high",
      "control_effectiveness_score": 89,
      "residual_rating": "low",
      "residual_trend": "deteriorating",
      "spoc_attested_at": "2026-05-08T14:30:00Z",
      "last_refreshed": "2026-04-17"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-032",
      "rcsa_cycle_id": "RC-FY26-H1-WM",
      "risk_id": "R-TP-001",
      "process_id": "PROC-KYC-001",
      "control_ids": [
        "CTRL-KYC-003",
        "CTRL-KYC-001",
        "CTRL-KYC-002"
      ],
      "inherent_likelihood": 2,
      "inherent_impact": 2,
      "inherent_rating": "low",
      "control_effectiveness_score": 92,
      "residual_rating": "low",
      "residual_trend": "deteriorating",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-15"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-033",
      "rcsa_cycle_id": "RC-FY26-H1-WM",
      "risk_id": "R-MR-001",
      "process_id": "PROC-KYC-001",
      "control_ids": [
        "CTRL-KYC-001"
      ],
      "inherent_likelihood": 3,
      "inherent_impact": 5,
      "inherent_rating": "high",
      "control_effectiveness_score": 95,
      "residual_rating": "low",
      "residual_trend": "deteriorating",
      "spoc_attested_at": "2026-05-08T14:30:00Z",
      "last_refreshed": "2026-04-13"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-034",
      "rcsa_cycle_id": "RC-FY26-H1-WM",
      "risk_id": "R-CD-001",
      "process_id": "PROC-KYC-001",
      "control_ids": [
        "CTRL-KYC-002",
        "CTRL-KYC-003"
      ],
      "inherent_likelihood": 4,
      "inherent_impact": 4,
      "inherent_rating": "high",
      "control_effectiveness_score": 92,
      "residual_rating": "low",
      "residual_trend": "deteriorating",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-11"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-035",
      "rcsa_cycle_id": "RC-FY26-H1-CB",
      "risk_id": "R-MR-001",
      "process_id": "PROC-LND-001",
      "control_ids": [
        "CTRL-LND-002",
        "CTRL-LND-001",
        "CTRL-LND-002"
      ],
      "inherent_likelihood": 5,
      "inherent_impact": 3,
      "inherent_rating": "high",
      "control_effectiveness_score": 88,
      "residual_rating": "medium",
      "residual_trend": "improving",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-13"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-036",
      "rcsa_cycle_id": "RC-FY26-H1-CB",
      "risk_id": "R-CD-001",
      "process_id": "PROC-LND-001",
      "control_ids": [
        "CTRL-LND-001"
      ],
      "inherent_likelihood": 2,
      "inherent_impact": 2,
      "inherent_rating": "low",
      "control_effectiveness_score": 91,
      "residual_rating": "low",
      "residual_trend": "improving",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-11"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-037",
      "rcsa_cycle_id": "RC-FY26-H1-CB",
      "risk_id": "R-OP-001",
      "process_id": "PROC-LND-001",
      "control_ids": [
        "CTRL-LND-002",
        "CTRL-LND-001"
      ],
      "inherent_likelihood": 3,
      "inherent_impact": 5,
      "inherent_rating": "high",
      "control_effectiveness_score": 91,
      "residual_rating": "low",
      "residual_trend": "improving",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-09"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-038",
      "rcsa_cycle_id": "RC-FY26-H1-CB",
      "risk_id": "R-CR-001",
      "process_id": "PROC-LND-001",
      "control_ids": [
        "CTRL-LND-001",
        "CTRL-LND-002",
        "CTRL-LND-001"
      ],
      "inherent_likelihood": 4,
      "inherent_impact": 4,
      "inherent_rating": "high",
      "control_effectiveness_score": 92,
      "residual_rating": "low",
      "residual_trend": "improving",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-27"
    },
    {
      "rcsa_cell_id": "RCELL-FY26-039",
      "rcsa_cycle_id": "RC-FY26-H1-CB",
      "risk_id": "R-FR-001",
      "process_id": "PROC-LND-001",
      "control_ids": [
        "CTRL-LND-002"
      ],
      "inherent_likelihood": 5,
      "inherent_impact": 3,
      "inherent_rating": "high",
      "control_effectiveness_score": 92,
      "residual_rating": "low",
      "residual_trend": "improving",
      "spoc_attested_at": null,
      "last_refreshed": "2026-04-25"
    }
  ],

  incidents: [
    {
      "incident_id": "INC-2026-ORI-001",
      "incident_type": "operational_loss",
      "severity": "high",
      "discovered_date": "2026-04-29",
      "gross_loss_inr": 13500000,
      "recovery_inr": 2000000,
      "status": "rca_in_progress",
      "linked_risk_ids": [
        "R-OP-001"
      ],
      "linked_control_ids": [
        "CTRL-AML-002"
      ],
      "accountable_senior_manager_id": "SM-OPS-001",
      "title": "BPO EOD batch posting error — duplicate NEFT credits",
      "business_unit": "Operations / CPC",
      "basel_event_type": "execution_delivery_process_management",
      "basel_event_subtype": "Payment / settlement processing error",
      "description": "Duplicate NEFT batch posting at CPC Mumbai after BPO EOD handoff; CBS reconciliation window missed before ORMC pack. Duplicate credits identified on T+1 recon; customer debits frozen pending reversal.",
      "occurred_date": "2026-04-28",
      "reported_date": "2026-04-29",
      "detection_source": "Core banking EOD reconciliation",
      "rbi_reportable": true,
      "fmr_filed": true,
      "fmr_filed_date": "2026-05-01",
      "cert_in_filed_at": null,
      "csite_filed_at": null,
      "linked_rca_id": "RCA-2026-ORI-01"
    },
    {
      "incident_id": "INC-2026-ORI-002",
      "incident_type": "operational_loss",
      "severity": "high",
      "discovered_date": "2026-04-16",
      "gross_loss_inr": 4200000,
      "recovery_inr": 800000,
      "status": "rca_in_progress",
      "linked_risk_ids": [
        "R-FC-001"
      ],
      "linked_control_ids": [
        "CTRL-AML-002",
        "CTRL-AML-003"
      ],
      "accountable_senior_manager_id": "SM-FCC-001",
      "title": "STR clock stress — 124 AML L1 alerts past 5-BD SLA after mid-cycle BPO seat cut (VEND-2024-00203)",
      "business_unit": "Financial Crime",
      "basel_event_type": "clients_products_business_practices",
      "basel_event_subtype": "Regulatory reporting timeliness",
      "description": "124 alerts breached L1 triage SLA following mid-cycle vendor seat reduction on Mumbai BPO floor; FINnet 2.0 / PMLA workflow backlog near seven working days; accountable SM-FCC-001; no booked net loss in this ORI row — regulatory timeliness exposure.",
      "occurred_date": "2026-04-10",
      "reported_date": "2026-04-16",
      "detection_source": "AML case ageing dashboard",
      "rbi_reportable": true,
      "fmr_filed": false,
      "fmr_filed_date": null,
      "cert_in_filed_at": null,
      "csite_filed_at": null,
      "linked_rca_id": "RCA-2026-ORI-02"
    },
    {
      "incident_id": "INC-2026-ORI-003",
      "incident_type": "operational_loss",
      "severity": "high",
      "discovered_date": "2026-04-01",
      "gross_loss_inr": 2800000,
      "recovery_inr": 0,
      "status": "under_investigation",
      "linked_risk_ids": [
        "R-CD-001"
      ],
      "linked_control_ids": [
        "CTRL-LND-002"
      ],
      "accountable_senior_manager_id": "SM-BH-RETAIL-001",
      "title": "DSA channel cooling-off bypass cluster — remediation in flight",
      "business_unit": "Enterprise",
      "basel_event_type": "execution_delivery_process_management",
      "basel_event_subtype": null,
      "description": "DSA channel cooling-off bypass cluster — remediation in flight. Logged under ORM incident taxonomy for FY26-H1; accountable SM notified per internal escalation matrix.",
      "occurred_date": "2026-04-01",
      "reported_date": "2026-04-01",
      "detection_source": "Control / monitoring",
      "rbi_reportable": true,
      "fmr_filed": false,
      "fmr_filed_date": null,
      "cert_in_filed_at": null,
      "csite_filed_at": null,
      "linked_rca_id": "RCA-2026-ORI-03"
    },
    {
      "incident_id": "INC-2026-ORI-004",
      "incident_type": "operational_loss",
      "severity": "medium",
      "discovered_date": "2026-04-26",
      "gross_loss_inr": 350000,
      "recovery_inr": 50000,
      "status": "reported",
      "linked_risk_ids": [
        "R-CO-001"
      ],
      "linked_control_ids": [
        "CTRL-KYC-003"
      ],
      "accountable_senior_manager_id": "SM-CCO-001",
      "title": "Re-KYC backlog at month-end — CKYCR upload misses for DBT cohort (Finacle UCIC vs batch window)",
      "business_unit": "Enterprise",
      "basel_event_type": "execution_delivery_process_management",
      "basel_event_subtype": null,
      "description": "Re-KYC backlog at month-end driving CKYCR upload misses for DBT proxy cohort; Finacle UCIC updates ahead of regulatory upload batch. Logged under ORM incident taxonomy for FY26-H1; accountable SM notified per internal escalation matrix.",
      "occurred_date": "2026-04-26",
      "reported_date": "2026-04-26",
      "detection_source": "Control / monitoring",
      "rbi_reportable": false,
      "fmr_filed": false,
      "fmr_filed_date": null,
      "cert_in_filed_at": null,
      "csite_filed_at": null
    },
    {
      "incident_id": "INC-2026-ORI-005",
      "incident_type": "operational_loss",
      "severity": "medium",
      "discovered_date": "2026-04-19",
      "gross_loss_inr": 400000,
      "recovery_inr": 50000,
      "status": "rca_in_progress",
      "linked_risk_ids": [
        "R-CO-001"
      ],
      "linked_control_ids": [
        "CTRL-KYC-003"
      ],
      "accountable_senior_manager_id": "SM-CCO-001",
      "title": "CKYCR vs Finacle mismatch — branch suspense ageing beyond ORM threshold (cohort-2)",
      "business_unit": "Enterprise",
      "basel_event_type": "execution_delivery_process_management",
      "basel_event_subtype": null,
      "description": "CKYCR vs Finacle mismatch in branch suspense; ServiceNow INC queue shows ageing beyond internal ORM threshold before RCSA cell sign-off. Logged under ORM incident taxonomy for FY26-H1; accountable SM notified per internal escalation matrix.",
      "occurred_date": "2026-04-19",
      "reported_date": "2026-04-19",
      "detection_source": "Control / monitoring",
      "rbi_reportable": false,
      "fmr_filed": false,
      "fmr_filed_date": null,
      "cert_in_filed_at": null,
      "csite_filed_at": null,
      "linked_rca_id": "RCA-2026-ORI-04"
    },
    {
      "incident_id": "INC-2026-ORI-006",
      "incident_type": "operational_loss",
      "severity": "medium",
      "discovered_date": "2026-04-12",
      "gross_loss_inr": 450000,
      "recovery_inr": 50000,
      "status": "contained",
      "linked_risk_ids": [
        "R-CO-001"
      ],
      "linked_control_ids": [
        "CTRL-KYC-003"
      ],
      "accountable_senior_manager_id": "SM-CCO-001",
      "title": "LOS v9 KFS evidence gap — cohort-3 tied to SFDC–Finacle handoff audit sample",
      "business_unit": "Enterprise",
      "basel_event_type": "execution_delivery_process_management",
      "basel_event_subtype": null,
      "description": "LOS v9 KFS evidence gap on cohort-3; digital lending MIS pack variance picked in concurrent audit sample before ORMC. Logged under ORM incident taxonomy for FY26-H1; accountable SM notified per internal escalation matrix.",
      "occurred_date": "2026-04-12",
      "reported_date": "2026-04-12",
      "detection_source": "Control / monitoring",
      "rbi_reportable": false,
      "fmr_filed": false,
      "fmr_filed_date": null,
      "cert_in_filed_at": null,
      "csite_filed_at": null,
      "linked_rca_id": "RCA-2026-ORI-05"
    },
    {
      "incident_id": "INC-2026-ORI-007",
      "incident_type": "near_miss",
      "severity": "medium",
      "discovered_date": "2026-05-06",
      "gross_loss_inr": null,
      "recovery_inr": null,
      "status": "closed_no_loss",
      "linked_risk_ids": [
        "R-TC-001"
      ],
      "linked_control_ids": [
        "CTRL-ITO-001"
      ],
      "accountable_senior_manager_id": "SM-CISO-001",
      "title": "Near miss — IAM change ticket bypassed ServiceNow CAB window (SOC-1)",
      "business_unit": "IT Operations",
      "basel_event_type": "business_disruption_system_failures",
      "basel_event_subtype": null,
      "description": "SOC correlation on privileged IAM change; ServiceNow CR not linked to CERT-In six-hour rehearsal pack — contained before production promotion.",
      "occurred_date": "2026-05-06",
      "reported_date": "2026-05-06",
      "detection_source": "Control / monitoring",
      "rbi_reportable": false,
      "fmr_filed": false,
      "fmr_filed_date": null,
      "cert_in_filed_at": null,
      "csite_filed_at": null
    },
    {
      "incident_id": "INC-2026-ORI-008",
      "incident_type": "near_miss",
      "severity": "medium",
      "discovered_date": "2026-05-03",
      "gross_loss_inr": null,
      "recovery_inr": null,
      "status": "closed_no_loss",
      "linked_risk_ids": [
        "R-TC-001"
      ],
      "linked_control_ids": [
        "CTRL-ITO-001"
      ],
      "accountable_senior_manager_id": "SM-CISO-001",
      "title": "Near miss — FINnet 2.0 log source promotion without SIEM parser soak (SOC-2)",
      "business_unit": "IT Operations",
      "basel_event_type": "business_disruption_system_failures",
      "basel_event_subtype": null,
      "description": "Parser version pinned after CERT-In rehearsal gap; Finacle DR image not in blast-radius map for new log feed — rolled back in maintenance window.",
      "occurred_date": "2026-05-03",
      "reported_date": "2026-05-03",
      "detection_source": "Control / monitoring",
      "rbi_reportable": false,
      "fmr_filed": false,
      "fmr_filed_date": null,
      "cert_in_filed_at": null,
      "csite_filed_at": null
    },
    {
      "incident_id": "INC-2026-ORI-009",
      "incident_type": "near_miss",
      "severity": "medium",
      "discovered_date": "2026-04-30",
      "gross_loss_inr": null,
      "recovery_inr": null,
      "status": "closed_no_loss",
      "linked_risk_ids": [
        "R-TC-001"
      ],
      "linked_control_ids": [
        "CTRL-ITO-001"
      ],
      "accountable_senior_manager_id": "SM-CISO-001",
      "title": "Near miss — TPSP VPN split-tunnel drift vs RBI outsourcing MD test evidence (SOC-3)",
      "business_unit": "IT Operations",
      "basel_event_type": "business_disruption_system_failures",
      "basel_event_subtype": null,
      "description": "VMO fourth-party attestation pack incomplete; ORMC action referenced before BCM/DR walkthrough — contained via emergency CAB in ServiceNow.",
      "occurred_date": "2026-04-30",
      "reported_date": "2026-04-30",
      "detection_source": "Control / monitoring",
      "rbi_reportable": false,
      "fmr_filed": false,
      "fmr_filed_date": null,
      "cert_in_filed_at": null,
      "csite_filed_at": null
    },
    {
      "incident_id": "INC-2026-ORI-010",
      "incident_type": "fraud",
      "fraud_origin": "internal",
      "severity": "high",
      "discovered_date": "2026-03-12",
      "gross_loss_inr": 1850000,
      "recovery_inr": 400000,
      "status": "rca_in_progress",
      "linked_risk_ids": [
        "R-FR-001"
      ],
      "linked_control_ids": [
        "CTRL-UPI-001"
      ],
      "accountable_senior_manager_id": "SM-FCC-001",
      "title": "Internal collusion — branch Teller override limits on prepaid instruments",
      "business_unit": "Enterprise",
      "basel_event_type": "internal_fraud",
      "basel_event_subtype": null,
      "description": "Internal collusion — branch Teller override limits on prepaid instruments. Logged under ORM incident taxonomy for FY26-H1; accountable SM notified per internal escalation matrix.",
      "occurred_date": "2026-03-12",
      "reported_date": "2026-03-12",
      "detection_source": "Control / monitoring",
      "rbi_reportable": true,
      "fmr_filed": false,
      "fmr_filed_date": null,
      "cert_in_filed_at": null,
      "csite_filed_at": null,
      "linked_rca_id": "RCA-2026-ORI-06"
    },
    {
      "incident_id": "INC-2026-ORI-011",
      "incident_type": "fraud",
      "fraud_origin": "external",
      "severity": "high",
      "discovered_date": "2026-04-08",
      "gross_loss_inr": 9500000,
      "recovery_inr": 1200000,
      "status": "law_enforcement_notified",
      "linked_risk_ids": [
        "R-FR-001",
        "R-FC-001"
      ],
      "linked_control_ids": [
        "CTRL-AML-002"
      ],
      "accountable_senior_manager_id": "SM-FCC-001",
      "title": "External mule network — UPI rapid funnel-out linked to AML typology",
      "business_unit": "Payments / FCC",
      "basel_event_type": "external_fraud",
      "basel_event_subtype": "Third-party mule typology",
      "description": "Rapid funnel-out via UPI mule accounts linked to external typology; coordinated with LE and FIU-IND channels.",
      "occurred_date": "2026-04-05",
      "reported_date": "2026-04-08",
      "detection_source": "AML typology + UPI velocity rules",
      "rbi_reportable": true,
      "fmr_filed": true,
      "fmr_filed_date": "2026-04-12",
      "cert_in_filed_at": null,
      "csite_filed_at": null,
      "linked_rca_id": "RCA-2026-ORI-07"
    },
    {
      "incident_id": "INC-2026-ORI-012",
      "incident_type": "conduct",
      "conduct_subtype": "mis_selling",
      "severity": "medium",
      "discovered_date": "2026-04-21",
      "gross_loss_inr": 120000,
      "recovery_inr": 0,
      "status": "customer_redress_in_progress",
      "linked_risk_ids": [
        "R-CD-001"
      ],
      "linked_control_ids": [
        "CTRL-LND-002",
        "CTRL-LND-001"
      ],
      "accountable_senior_manager_id": "SM-BH-RETAIL-001",
      "title": "Wealth RM mis-selling — APR disclosure gap vs RBI MD on Digital Lending KFS discipline",
      "business_unit": "Enterprise",
      "basel_event_type": "clients_products_business_practices",
      "basel_event_subtype": null,
      "description": "Wealth RM mis-selling — APR disclosure gap vs RBI MD on Digital Lending KFS discipline. Logged under ORM incident taxonomy for FY26-H1; accountable SM notified per internal escalation matrix.",
      "occurred_date": "2026-04-21",
      "reported_date": "2026-04-21",
      "detection_source": "Control / monitoring",
      "rbi_reportable": false,
      "fmr_filed": false,
      "fmr_filed_date": null,
      "cert_in_filed_at": null,
      "csite_filed_at": null,
      "linked_rca_id": "RCA-2026-ORI-08"
    },
    {
      "incident_id": "INC-2026-ORI-013",
      "incident_type": "cyber",
      "severity": "high",
      "discovered_date": "2026-05-03",
      "gross_loss_inr": 450000,
      "recovery_inr": 0,
      "status": "rca_in_progress",
      "linked_risk_ids": [
        "R-TC-001"
      ],
      "linked_control_ids": [
        "CTRL-ITO-001"
      ],
      "accountable_senior_manager_id": "SM-CISO-001",
      "title": "Ransomware attempt on DR site - CERT-In six-hour notification met; RBI CSITE materiality assessment ongoing per ITGRCA",
      "business_unit": "IT Operations / Cyber",
      "basel_event_type": "business_disruption_system_failures",
      "basel_event_subtype": "Cyber incident — DR drill boundary",
      "description": "Ransomware attempt contained at DR site; CERT-In six-hour notification met; CSITE materiality assessment per RBI ITGRCA.",
      "occurred_date": "2026-05-02",
      "reported_date": "2026-05-03",
      "detection_source": "SOC SIEM + DR monitoring",
      "rbi_reportable": true,
      "fmr_filed": true,
      "fmr_filed_date": "2026-05-03",
      "cert_in_filed_at": "2026-05-03T05:12:00Z",
      "csite_filed_at": "2026-05-04T10:00:00Z",
      "linked_rca_id": "RCA-2026-ORI-09"
    },
    {
      "incident_id": "INC-2026-ORI-014",
      "incident_type": "cyber",
      "severity": "medium",
      "discovered_date": "2026-04-23",
      "gross_loss_inr": 80000,
      "recovery_inr": 0,
      "status": "contained",
      "linked_risk_ids": [
        "R-TC-001",
        "R-MR-001"
      ],
      "linked_control_ids": [
        "CTRL-ITO-001"
      ],
      "accountable_senior_manager_id": "SM-CISO-001",
      "title": "API key leakage in non-prod - exposure window bridged to production-like data class",
      "business_unit": "IT Operations",
      "basel_event_type": "business_disruption_system_failures",
      "basel_event_subtype": null,
      "description": "API key leakage in non-prod - exposure window bridged to production-like data class. Logged under ORM incident taxonomy for FY26-H1; accountable SM notified per internal escalation matrix.",
      "occurred_date": "2026-04-23",
      "reported_date": "2026-04-23",
      "detection_source": "Control / monitoring",
      "rbi_reportable": false,
      "fmr_filed": false,
      "fmr_filed_date": null,
      "cert_in_filed_at": null,
      "csite_filed_at": null,
      "linked_rca_id": "RCA-2026-ORI-10"
    },
    {
      "incident_id": "INC-2026-ORI-015",
      "incident_type": "regulatory_breach",
      "severity": "high",
      "discovered_date": "2026-03-28",
      "gross_loss_inr": 500000,
      "recovery_inr": 0,
      "status": "reported",
      "linked_risk_ids": [
        "R-FC-001"
      ],
      "linked_control_ids": [
        "CTRL-AML-003"
      ],
      "accountable_senior_manager_id": "SM-MLRO-001",
      "title": "CTR filing delay vs FIU-IND monthly cut-off — regulatory reporting breach logged",
      "business_unit": "Enterprise",
      "basel_event_type": "clients_products_business_practices",
      "basel_event_subtype": null,
      "description": "CTR filing delay vs FIU-IND monthly cut-off — regulatory reporting breach logged. Logged under ORM incident taxonomy for FY26-H1; accountable SM notified per internal escalation matrix.",
      "occurred_date": "2026-03-28",
      "reported_date": "2026-03-28",
      "detection_source": "Control / monitoring",
      "rbi_reportable": true,
      "fmr_filed": false,
      "fmr_filed_date": null,
      "cert_in_filed_at": null,
      "csite_filed_at": null
    }
  ],

  rcas: [
    {
      "rca_id": "RCA-2026-ORI-01",
      "incident_id": "INC-2026-ORI-001",
      "status": "approved",
      "five_whys_steps": [
        {
          "step_order": 1,
          "statement": "Why was loss material? — EOD NEFT batch at CPC Mumbai ran twice after BPM handoff; CBS T+1 reconciliation not completed before MD&CEO dashboard ORMC pack."
        },
        {
          "step_order": 2,
          "statement": "Why did reconciliation miss? — SPOC on leave; HOD approval for temporary dual-key not recorded in MOM; RBI operational resilience guidance on critical role backup not fully operationalised."
        },
        {
          "step_order": 3,
          "statement": "Why dual-key gap tolerated? — Vendor release window overlapped KYC annual freeze; IT change calendar conflict with PMLA reporting week."
        },
        {
          "step_order": 4,
          "statement": "Why calendar conflict unmanaged? — ORMC risk agenda did not include cross-functional change freeze map for financial crime operations."
        }
      ],
      "opened_at": "2026-04-29T09:00:00Z",
      "rca_started_at": "2026-04-29T08:30:00Z",
      "rca_completed_at": "2026-05-03T08:30:00.000Z",
      "owner_senior_manager_id": "SM-OPS-001",
      "methodology": "five_whys",
      "root_cause_categories": ["process", "people", "technology", "vendor"],
      "root_cause_summary": "Material loss arose from a brittle EOD handoff between BPO and CPC dual-control, compounded by absent resilience playbooks for critical-role backup and unmanaged cross-functional change freezes.",
      "lessons_learnt": "ORM now requires dual-key waiver MOM linkage in ITSM before any vendor release in PMLA reporting windows; branch sampling is mandatory before marking retail-liabilities controls green in RCSA."
    },
    {
      "rca_id": "RCA-2026-ORI-02",
      "incident_id": "INC-2026-ORI-002",
      "status": "approved",
      "five_whys_steps": [
        {
          "step_order": 1,
          "statement": "Why did STR queue breach seven-working-day discipline? — FINnet 2.0 uplift batch held STR XML in staging while ServiceNow CR-OMM-8848 awaited CAB under PMLA reporting week freeze."
        },
        {
          "step_order": 2,
          "statement": "Why was CAB starved? — RBI Section 47A remediation workstream pulled two senior FCC analysts; capacity not reflected in MIS pack tabled at ORMC on 12 Apr."
        },
        {
          "step_order": 3,
          "statement": "Why was MIS pack silent on FCC capacity? — BPM workflow step for “capacity attestation” was optional in Q1 RCSA refresh for Financial Crime Operations."
        },
        {
          "step_order": 4,
          "statement": "Why optional? — AFI MRA closure evidence focused on system logs, not analyst FTE; IS Audit observation ACQ-IS-2025-14 still open on staffing attestations."
        },
        {
          "step_order": 5,
          "statement": "Root systemic cause — ORMC pack treated FINnet cutover as IT-only; no joint sign-off with MLRO-PO before T+1 settlement window on STR batch."
        }
      ],
      "opened_at": "2026-04-16T09:00:00Z",
      "rca_started_at": "2026-04-16T08:30:00Z",
      "rca_completed_at": "2026-04-21T08:30:00.000Z",
      "owner_senior_manager_id": "SM-MLRO-001",
      "methodology": "five_whys",
      "root_cause_categories": ["process", "people", "technology", "external", "vendor"],
      "root_cause_summary": "STR clock stress traced to capacity starvation during FIU schema uplift, weak prioritisation between commercial onboarding and retail mule typology work, and unsigned RCSA linkage between retail-liabilities cycle and change management.",
      "lessons_learnt": "Financial Crime ORM introduced a weekly capacity ledger vs PMLA clock; MLRO-PO sign-off is required before BPO backlog reprioritisation during regulatory schema changes."
    },
    {
      "rca_id": "RCA-2026-ORI-03",
      "incident_id": "INC-2026-ORI-003",
      "status": "approved",
      "five_whys_steps": [
        {
          "step_order": 1,
          "statement": "Why did DSA cooling-off bypass surface? — SFDC partner lead journey skipped BPM wait-state before LOS v9 handoff; CKYCR re-pull not triggered on same-day disbursal."
        },
        {
          "step_order": 2,
          "statement": "Why was BPM wait skipped? — Month-end DBT proxy onboarding surge; Finacle batch window conflicted with digital lending MIS pack freeze for ORMC."
        },
        {
          "step_order": 3,
          "statement": "Why no surge playbook? — Half-yearly RCSA cell for Digital Lending rated LOS controls green without NPCI feedback file sampling on co-lending pilots."
        }
      ],
      "opened_at": "2026-04-01T09:00:00Z",
      "rca_started_at": "2026-04-01T08:30:00Z",
      "rca_completed_at": "2026-04-07T08:30:00.000Z",
      "owner_senior_manager_id": "SM-BH-RETAIL-001"
    },
    {
      "rca_id": "RCA-2026-ORI-04",
      "incident_id": "INC-2026-ORI-005",
      "status": "approved",
      "five_whys_steps": [
        {
          "step_order": 1,
          "statement": "Why did KYC evidence lag hit ORM threshold? — Finacle UCIC updates outpaced CKYCR upload batch; branch scanning queue not cleared before half-yearly RCSA attestation."
        },
        {
          "step_order": 2,
          "statement": "Why batch lag? — Re-KYC backlog at month-end drove prioritisation away from DBT cohort; NPCI proxy ID checks queued behind wealth onboarding in ServiceNow."
        },
        {
          "step_order": 3,
          "statement": "Why wrong prioritisation? — ORMC pack showed green CES from prior RCSA refresh without IS Audit retest evidence on CTRL-KYC-003."
        },
        {
          "step_order": 4,
          "statement": "Why green CES? — BPM workflow allowed SPOC sign-off on aggregate MIS, not per-branch CKYCR exception ageing."
        }
      ],
      "opened_at": "2026-04-19T09:00:00Z",
      "rca_started_at": "2026-04-19T08:30:00Z",
      "rca_completed_at": "2026-04-26T08:30:00.000Z",
      "owner_senior_manager_id": "SM-CCO-001"
    },
    {
      "rca_id": "RCA-2026-ORI-05",
      "incident_id": "INC-2026-ORI-006",
      "status": "approved",
      "five_whys_steps": [
        {
          "step_order": 1,
          "statement": "Why did cohort-3 variance repeat? — Finacle branch suspense not reconciled to CKYCR status; evidence screenshots stored outside EIFS hash chain."
        },
        {
          "step_order": 2,
          "statement": "Why outside EIFS? — Legacy MIS pack export from LOS bypassed new evidence router trialled only in pilot branches."
        },
        {
          "step_order": 3,
          "statement": "Why pilot-only? — BCM/DR test scope for LOS DR site did not include KYC evidence path; AFI MRA action item still in amber on closure tracker."
        },
        {
          "step_order": 4,
          "statement": "Why amber tolerated? — HOD approval in ORMC assumed retail-liabilities RCSA cell covered CKYCR without explicit control-instance sampling."
        },
        {
          "step_order": 5,
          "statement": "Root systemic cause — T+1 settlement window discipline applied to payments recon, not to regulatory KYC evidence uploads tied to DBT proxy volumes."
        }
      ],
      "opened_at": "2026-04-12T09:00:00Z",
      "rca_started_at": "2026-04-12T08:30:00Z",
      "rca_completed_at": "2026-04-20T08:30:00.000Z",
      "owner_senior_manager_id": "SM-CCO-001"
    },
    {
      "rca_id": "RCA-2026-ORI-06",
      "incident_id": "INC-2026-ORI-010",
      "status": "approved",
      "five_whys_steps": [
        {
          "step_order": 1,
          "statement": "Why fraud succeeded? — KYC refresh queue backlog; BPO queue prioritised commercial onboarding over retail mule typology alerts per MLRO-PO directive."
        },
        {
          "step_order": 2,
          "statement": "Why backlog? — PMLA Rule 9 retention pulls consumed analyst capacity during FIU-IND FINnet 2.0 schema upgrade weekend."
        },
        {
          "step_order": 3,
          "statement": "Why typology desk starved? — RBI Section 47A staffing cap not reflected in weekly MIS pack; ORMC did not challenge BPO seat reduction mid-cycle."
        }
      ],
      "opened_at": "2026-03-12T09:00:00Z",
      "rca_started_at": "2026-03-12T08:30:00Z",
      "rca_completed_at": "2026-03-15T08:30:00.000Z",
      "owner_senior_manager_id": "SM-FCC-001"
    },
    {
      "rca_id": "RCA-2026-ORI-07",
      "incident_id": "INC-2026-ORI-011",
      "status": "under_review",
      "five_whys_steps": [
        {
          "step_order": 1,
          "statement": "Why fraud succeeded? — KYC refresh queue backlog; BPO queue prioritised commercial onboarding over retail mule typology alerts per MLRO-PO directive."
        },
        {
          "step_order": 2,
          "statement": "Why backlog? — PMLA Rule 9 retention pulls consumed analyst capacity during FIU-IND FINnet 2.0 schema upgrade weekend."
        },
        {
          "step_order": 3,
          "statement": "Why mule velocity undetected? — NPCI feedback file reconciliation to Finacle GL deferred during UPI limit pilot; L1 AML triage SLA tracked only in ServiceNow, not in MIS pack."
        },
        {
          "step_order": 4,
          "statement": "Why MIS gap? — RCSA refresh for Cards & Payments assumed CTRL-AML-002 green without CERT-In FINnet drill evidence from prior quarter."
        }
      ],
      "opened_at": "2026-04-08T09:00:00Z",
      "rca_started_at": "2026-04-08T08:30:00Z",
      "rca_completed_at": null,
      "owner_senior_manager_id": "SM-FCC-001",
      "methodology": "five_whys",
      "root_cause_categories": ["process", "people", "external"],
      "root_cause_summary": "Fraud typology coverage lagged because analyst capacity was consumed by PMLA retention pulls during FIU FINnet uplift, with backlog governance weaker than STR clock discipline requires.",
      "lessons_learnt": "Pending ORMC approval: freeze non-STR FCC project intake when FIU schema risk is amber; war-room roster to be pre-authorised in resilience register."
    },
    {
      "rca_id": "RCA-2026-ORI-08",
      "incident_id": "INC-2026-ORI-012",
      "status": "under_review",
      "five_whys_steps": [
        {
          "step_order": 1,
          "statement": "Why did APR / KFS mis-sell surface? — Wealth RM used SFDC opportunity stage to bypass LOS v9 mandatory KFS acknowledgement before fee debit in Finacle."
        },
        {
          "step_order": 2,
          "statement": "Why bypass tolerated? — RBI MD on Digital Lending control design sat in “ORM review” queue; BPM workflow lacked hard stop at CKYCR consent mismatch."
        },
        {
          "step_order": 3,
          "statement": "Why queue stalled? — AFI MRA closure pack for retail conduct consumed compliance bandwidth; weekly MIS pack did not flag KFS exception ageing."
        },
        {
          "step_order": 4,
          "statement": "Why no MIS flag? — Half-yearly RCSA Wealth Management cell rated conduct controls green using prior-year sampling, not current SFDC–LOS integration defects."
        },
        {
          "step_order": 5,
          "statement": "Root systemic cause — ORMC presentation deck treated digital lending as IT delivery metric, not RBI Section 47A customer-communication evidence chain."
        }
      ],
      "opened_at": "2026-04-21T09:00:00Z",
      "rca_started_at": "2026-04-21T08:30:00Z",
      "rca_completed_at": null,
      "owner_senior_manager_id": "SM-BH-RETAIL-001",
      "methodology": "five_whys",
      "root_cause_categories": ["process", "technology", "vendor"],
      "root_cause_summary": "Retail-liabilities control effectiveness was overstated where RCSA cells were not refreshed after change-management dependency shifts; vendor and IT calendar conflicts were not surfaced to ORMC.",
      "lessons_learnt": "Draft for BRC: RCSA residual sign-off cannot proceed without explicit branch sampling evidence after any material payments or CBS batching change."
    },
    {
      "rca_id": "RCA-2026-ORI-09",
      "incident_id": "INC-2026-ORI-013",
      "status": "under_review",
      "five_whys_steps": [
        {
          "step_order": 1,
          "statement": "Why CERT-In timeline at risk? — SIEM parser lag on new log source; ITGRCA control CTRL-ITO-001 evidence hash mismatch until CISO war-room invoked."
        },
        {
          "step_order": 2,
          "statement": "Why parser lag? — TPSP patch deployed without VMO fourth-party test evidence; RBI outsourcing master direction materiality criteria referenced in ORMC action."
        },
        {
          "step_order": 3,
          "statement": "Why parser not in BCM scope? — DR test script covered Finacle failover only; CERT-In FINnet log source promotion missing from ITGRCA control test evidence."
        }
      ],
      "opened_at": "2026-05-03T09:00:00Z",
      "rca_started_at": "2026-05-03T08:30:00Z",
      "rca_completed_at": null,
      "owner_senior_manager_id": "SM-CISO-001",
      "methodology": "fishbone",
      "root_cause_categories": ["technology", "vendor", "process"],
      "root_cause_summary": "CERT-In timeline exposure driven by SIEM parser lag on a new log source and TPSP patch evidence gaps under RBI outsourcing materiality expectations.",
      "lessons_learnt": "ITGRCA evidence hash discipline extended to parser version pins; VMO fourth-party test pack mandatory before SIEM source promotion."
    },
    {
      "rca_id": "RCA-2026-ORI-10",
      "incident_id": "INC-2026-ORI-014",
      "status": "draft",
      "five_whys_steps": [
        {
          "step_order": 1,
          "statement": "Why CERT-In timeline at risk? — SIEM parser lag on new log source; ITGRCA control CTRL-ITO-001 evidence hash mismatch until CISO war-room invoked."
        },
        {
          "step_order": 2,
          "statement": "Why parser lag? — TPSP patch deployed without VMO fourth-party test evidence; RBI outsourcing master direction materiality criteria referenced in ORMC action."
        },
        {
          "step_order": 3,
          "statement": "Why non-prod keys touched prod-class data? — API gateway config drift between Finacle sandpit and DR image; ServiceNow CMDB link to CKYCR test feed missing."
        },
        {
          "step_order": 4,
          "statement": "Why CMDB gap accepted? — IS Audit observation on secrets vault ageing deferred for AFI MRA closure window; RCSA IT Operations cell not refreshed post vendor exit."
        }
      ],
      "opened_at": "2026-04-23T09:00:00Z",
      "rca_started_at": "2026-04-23T08:30:00Z",
      "rca_completed_at": null,
      "owner_senior_manager_id": "SM-CISO-001"
    }
  ],

  preventiveActions: [
    {
      "preventive_action_id": "PA-2026-ORI-01",
      "rca_id": "RCA-2026-ORI-01",
      "title": "Finacle EOD dual-control waiver — codify ORMC condition from RCA-2026-ORI-01",
      "status": "open",
      "target_date": "2026-05-28",
      "owner_senior_manager_id": "SM-CCO-001",
      "closure_evidence_ids": [],
      "linked_pac_note_block_flag": true
    },
    {
      "preventive_action_id": "PA-2026-ORI-02",
      "rca_id": "RCA-2026-ORI-02",
      "title": "FINnet 2.0 STR XML staging guard — ServiceNow CR gate before CAB (FIU schema uplift)",
      "status": "open",
      "target_date": "2026-06-06",
      "owner_senior_manager_id": "SM-CCO-001",
      "closure_evidence_ids": [],
      "linked_pac_note_block_flag": true
    },
    {
      "preventive_action_id": "PA-2026-ORI-03",
      "rca_id": "RCA-2026-ORI-03",
      "title": "SFDC DSA partner LOS handoff — BPM wait-state enforced; CKYCR re-pull on cooling-off breach",
      "status": "open",
      "target_date": "2026-06-19",
      "owner_senior_manager_id": "SM-CCO-001",
      "closure_evidence_ids": [],
      "linked_pac_note_block_flag": true
    },
    {
      "preventive_action_id": "PA-2026-ORI-04",
      "rca_id": "RCA-2026-ORI-04",
      "title": "Retail KYC evidence pack — Finacle UCIC vs CKYCR upload SLA; branch MIS pack for ORM sampling",
      "status": "open",
      "target_date": "2026-07-02",
      "owner_senior_manager_id": "SM-CCO-001",
      "closure_evidence_ids": [],
      "linked_pac_note_block_flag": true
    },
    {
      "preventive_action_id": "PA-2026-ORI-05",
      "rca_id": "RCA-2026-ORI-05",
      "title": "NPCI chargeback playbook — L1 triage queue in ServiceNow aligned to T+1 settlement window",
      "status": "open",
      "target_date": "2026-07-21",
      "owner_senior_manager_id": "SM-CCO-001",
      "closure_evidence_ids": [],
      "linked_pac_note_block_flag": false
    },
    {
      "preventive_action_id": "PA-2026-ORI-06",
      "rca_id": "RCA-2026-ORI-06",
      "title": "BPO seat reduction mid-cycle — ORM impact assessment before L1 AML triage SLA change",
      "status": "open",
      "target_date": "2026-08-04",
      "owner_senior_manager_id": "SM-CCO-001",
      "closure_evidence_ids": [],
      "linked_pac_note_block_flag": false
    },
    {
      "preventive_action_id": "PA-2026-ORI-07",
      "rca_id": "RCA-2026-ORI-04",
      "title": "Branch sampling pack — IS Audit observation closure tied to RCSA retail-liabilities refresh",
      "status": "open",
      "target_date": "2026-05-18",
      "owner_senior_manager_id": "SM-CCO-001",
      "closure_evidence_ids": [],
      "linked_pac_note_block_flag": false
    },
    {
      "preventive_action_id": "PA-2026-ORI-08",
      "rca_id": "RCA-2026-ORI-05",
      "title": "ORMC presentation — chargeback root-cause heatmap vs NPCI feedback file reconciliation",
      "status": "open",
      "target_date": "2026-06-11",
      "owner_senior_manager_id": "SM-CCO-001",
      "closure_evidence_ids": [],
      "linked_pac_note_block_flag": false
    },
    {
      "preventive_action_id": "PA-2026-ORI-09",
      "rca_id": "RCA-2026-ORI-06",
      "title": "AFI MRA linkage — prepaid instrument override limits re-attested in half-yearly RCSA cell",
      "status": "open",
      "target_date": "2026-06-27",
      "owner_senior_manager_id": "SM-CCO-001",
      "closure_evidence_ids": [],
      "linked_pac_note_block_flag": false
    },
    {
      "preventive_action_id": "PA-2026-ORI-10",
      "rca_id": "RCA-2026-ORI-07",
      "title": "FIU FINnet cutover rehearsal — BCM/DR test evidence for FCC analyst surge roster",
      "status": "open",
      "target_date": "2026-07-14",
      "owner_senior_manager_id": "SM-CCO-001",
      "closure_evidence_ids": [],
      "linked_pac_note_block_flag": false
    },
    {
      "preventive_action_id": "PA-2026-ORI-11",
      "rca_id": "RCA-2026-ORI-08",
      "title": "RBI Section 47A exposure register — wealth KFS mis-sell redress workflow in SFDC",
      "status": "open",
      "target_date": "2026-07-29",
      "owner_senior_manager_id": "SM-CCO-001",
      "closure_evidence_ids": [],
      "linked_pac_note_block_flag": false
    },
    {
      "preventive_action_id": "PA-2026-ORI-12",
      "rca_id": "RCA-2026-ORI-09",
      "title": "CERT-In FINnet evidence path — SIEM parser version pin before ITGRCA control re-test",
      "status": "open",
      "target_date": "2026-08-09",
      "owner_senior_manager_id": "SM-CCO-001",
      "closure_evidence_ids": [],
      "linked_pac_note_block_flag": false
    },
    {
      "preventive_action_id": "PA-2026-ORI-13",
      "rca_id": "RCA-2026-ORI-10",
      "title": "Non-prod API key hygiene — VMO fourth-party attestation pack for ORMC",
      "status": "open",
      "target_date": "2026-05-31",
      "owner_senior_manager_id": "SM-CCO-001",
      "closure_evidence_ids": [],
      "linked_pac_note_block_flag": false
    },
    {
      "preventive_action_id": "PA-2026-ORI-14",
      "rca_id": "RCA-2026-ORI-01",
      "title": "Re-KYC backlog playbook — month-end CKYCR upload misses for DBT cohort (Finacle batch)",
      "status": "open",
      "target_date": "2026-06-24",
      "owner_senior_manager_id": "SM-CCO-001",
      "closure_evidence_ids": [],
      "linked_pac_note_block_flag": false
    },
    {
      "preventive_action_id": "PA-2026-ORI-15",
      "rca_id": "RCA-2026-ORI-02",
      "title": "ITSM change template — FINnet STR batch dependency map in ORMC risk agenda",
      "status": "in_progress",
      "target_date": "2026-05-22",
      "owner_senior_manager_id": "SM-CCO-001",
      "closure_evidence_ids": [],
      "linked_pac_note_block_flag": true
    },
    {
      "preventive_action_id": "PA-2026-ORI-16",
      "rca_id": "RCA-2026-ORI-03",
      "title": "LOS v9 sequence guard — ServiceNow release train vs DLA scale-up gate",
      "status": "in_progress",
      "target_date": "2026-06-30",
      "owner_senior_manager_id": "SM-CCO-001",
      "closure_evidence_ids": [],
      "linked_pac_note_block_flag": false
    },
    {
      "preventive_action_id": "PA-2026-ORI-17",
      "rca_id": "RCA-2026-ORI-04",
      "title": "Branch attestation MIS — Finacle vs CKYCR exception ageing for ORM dashboard",
      "status": "in_progress",
      "target_date": "2026-07-17",
      "owner_senior_manager_id": "SM-CCO-001",
      "closure_evidence_ids": [],
      "linked_pac_note_block_flag": false
    },
    {
      "preventive_action_id": "PA-2026-ORI-18",
      "rca_id": "RCA-2026-ORI-05",
      "title": "Payments ops huddle — NPCI dispute file vs Finacle GL bridge for T+1 recon",
      "status": "in_progress",
      "target_date": "2026-08-01",
      "owner_senior_manager_id": "SM-CCO-001",
      "closure_evidence_ids": [],
      "linked_pac_note_block_flag": false
    },
    {
      "preventive_action_id": "PA-2026-ORI-19",
      "rca_id": "RCA-2026-ORI-01",
      "title": "Closed PAC — FIU STR XML sample retest",
      "status": "closed",
      "target_date": "2026-04-01",
      "closed_at": "2026-05-08T16:00:00Z",
      "owner_senior_manager_id": "SM-CCO-001",
      "closure_evidence_ids": [
        "EV-DOC-STR-501",
        "EV-LOG-FIU-ACK-501"
      ],
      "linked_pac_note_block_flag": false
    },
    {
      "preventive_action_id": "PA-2026-ORI-20",
      "rca_id": "RCA-2026-ORI-02",
      "title": "Closed PAC — KFS sequence guard deployed",
      "status": "closed",
      "target_date": "2026-04-10",
      "closed_at": "2026-05-09T11:30:00Z",
      "owner_senior_manager_id": "SM-CCO-001",
      "closure_evidence_ids": [
        "EV-SIGN-KFS-881",
        "EV-LOG-LOS-EVT-884-KFS"
      ],
      "linked_pac_note_block_flag": false
    }
  ],

  lossEvents: [
    {
      "loss_event_id": "LEV-2026-001",
      "event_date": "2026-02-14",
      "gross_loss_inr": 12500000,
      "direct_recovery_inr": 1500000,
      "insurance_recovery_inr": 300000,
      "net_loss_inr": 10700000,
      "recovery_inr": 1800000,
      "business_line": "retail_banking",
      "basel_event_type": "internal_fraud",
      "loss_event_type": "operational_loss",
      "loss_event_subtype": "internal_fraud_staff",
      "business_unit": "Retail Banking",
      "status": "closed_recovered",
      "linked_risk_id": "R-FR-001",
      "linked_control_ids": ["CTRL-UPI-001"],
      "linked_incident_id": "INC-2026-ORI-001",
      "accountable_senior_manager_id": "SM-FCC-001"
    },
    {
      "loss_event_id": "LEV-2026-002",
      "event_date": "2026-01-22",
      "gross_loss_inr": 4200000,
      "direct_recovery_inr": 700000,
      "insurance_recovery_inr": 200000,
      "net_loss_inr": 3300000,
      "recovery_inr": 900000,
      "business_line": "retail_banking",
      "basel_event_type": "internal_fraud",
      "loss_event_type": "operational_loss",
      "loss_event_subtype": "collusion",
      "business_unit": "Retail Operations",
      "status": "open",
      "linked_risk_id": "R-OP-001",
      "linked_control_ids": ["CTRL-AML-002"],
      "linked_incident_id": "INC-2026-ORI-002",
      "accountable_senior_manager_id": "SM-OPS-001"
    },
    {
      "loss_event_id": "LEV-2026-003",
      "event_date": "2025-11-03",
      "gross_loss_inr": 850000,
      "direct_recovery_inr": 0,
      "insurance_recovery_inr": 0,
      "net_loss_inr": 850000,
      "recovery_inr": 0,
      "business_line": "commercial_banking",
      "basel_event_type": "internal_fraud",
      "loss_event_type": "near_miss",
      "loss_event_subtype": "attempted_override",
      "business_unit": "Commercial Banking",
      "status": "closed_no_loss",
      "linked_risk_id": "R-TP-001",
      "linked_control_ids": ["CTRL-VND-001"],
      "linked_incident_id": "INC-2026-ORI-003",
      "accountable_senior_manager_id": "SM-CIO-001"
    },
    {
      "loss_event_id": "LEV-2026-004",
      "event_date": "2026-03-08",
      "gross_loss_inr": 15200000,
      "direct_recovery_inr": 2000000,
      "insurance_recovery_inr": 500000,
      "net_loss_inr": 12700000,
      "recovery_inr": 2500000,
      "business_line": "retail_banking",
      "basel_event_type": "external_fraud",
      "loss_event_type": "operational_loss",
      "loss_event_subtype": "social_engineering",
      "business_unit": "Retail Banking",
      "status": "reported_rbi",
      "linked_risk_id": "R-FR-001",
      "linked_control_ids": ["CTRL-AML-002"],
      "linked_incident_id": "INC-2026-ORI-004",
      "accountable_senior_manager_id": "SM-FCC-001"
    },
    {
      "loss_event_id": "LEV-2026-005",
      "event_date": "2025-12-19",
      "gross_loss_inr": 2200000,
      "direct_recovery_inr": 250000,
      "insurance_recovery_inr": 150000,
      "net_loss_inr": 1800000,
      "recovery_inr": 400000,
      "business_line": "payment_settlement",
      "basel_event_type": "external_fraud",
      "loss_event_type": "operational_loss",
      "loss_event_subtype": "authorised_push_payment",
      "business_unit": "Payments",
      "status": "closed_pending_recovery",
      "linked_risk_id": "R-FC-001",
      "linked_control_ids": ["CTRL-AML-003"],
      "linked_incident_id": "INC-2026-ORI-005",
      "accountable_senior_manager_id": "SM-MLRO-001"
    },
    {
      "loss_event_id": "LEV-2026-006",
      "event_date": "2026-03-22",
      "gross_loss_inr": 650000,
      "direct_recovery_inr": 100000,
      "insurance_recovery_inr": 50000,
      "net_loss_inr": 500000,
      "recovery_inr": 150000,
      "business_line": "commercial_banking",
      "basel_event_type": "employment_practices_workplace_safety",
      "loss_event_type": "operational_loss",
      "loss_event_subtype": "workplace_injury",
      "business_unit": "Commercial Banking",
      "status": "closed_recovered",
      "linked_risk_id": "R-OP-001",
      "linked_control_ids": [],
      "linked_incident_id": "INC-2026-ORI-006",
      "accountable_senior_manager_id": "SM-OPS-001"
    },
    {
      "loss_event_id": "LEV-2026-007",
      "event_date": "2026-02-28",
      "gross_loss_inr": 1800000,
      "direct_recovery_inr": 0,
      "insurance_recovery_inr": 0,
      "net_loss_inr": 1800000,
      "recovery_inr": 0,
      "business_line": "retail_banking",
      "basel_event_type": "clients_products_business_practices",
      "loss_event_type": "operational_loss",
      "loss_event_subtype": "mis_selling",
      "business_unit": "Retail Lending",
      "status": "open",
      "linked_risk_id": "R-CD-001",
      "linked_control_ids": ["CTRL-LND-002"],
      "linked_incident_id": "INC-2026-ORI-007",
      "accountable_senior_manager_id": "SM-BH-RETAIL-001"
    },
    {
      "loss_event_id": "LEV-2026-008",
      "event_date": "2025-10-11",
      "gross_loss_inr": 450000,
      "direct_recovery_inr": 0,
      "insurance_recovery_inr": 0,
      "net_loss_inr": 450000,
      "recovery_inr": 0,
      "business_line": "commercial_banking",
      "basel_event_type": "clients_products_business_practices",
      "loss_event_type": "near_miss",
      "loss_event_subtype": "fee_disclosure_gap",
      "business_unit": "Commercial Banking",
      "status": "closed_no_loss",
      "linked_risk_id": "R-CR-001",
      "linked_control_ids": ["CTRL-LND-001"],
      "linked_incident_id": "INC-2026-ORI-008",
      "accountable_senior_manager_id": "SM-BH-RETAIL-001"
    },
    {
      "loss_event_id": "LEV-2026-009",
      "event_date": "2026-01-05",
      "gross_loss_inr": 3200000,
      "direct_recovery_inr": 800000,
      "insurance_recovery_inr": 300000,
      "net_loss_inr": 2100000,
      "recovery_inr": 1100000,
      "business_line": "agency_services",
      "basel_event_type": "damage_to_physical_assets",
      "loss_event_type": "operational_loss",
      "loss_event_subtype": "branch_fire_smoke",
      "business_unit": "Agency Services",
      "status": "closed_recovered",
      "linked_risk_id": "R-OP-001",
      "linked_control_ids": [],
      "linked_incident_id": "INC-2026-ORI-009",
      "accountable_senior_manager_id": "SM-OPS-001"
    },
    {
      "loss_event_id": "LEV-2026-010",
      "event_date": "2026-03-18",
      "gross_loss_inr": 5600000,
      "direct_recovery_inr": 500000,
      "insurance_recovery_inr": 300000,
      "net_loss_inr": 4800000,
      "recovery_inr": 800000,
      "business_line": "corporate_finance",
      "basel_event_type": "business_disruption_system_failures",
      "loss_event_type": "operational_loss",
      "loss_event_subtype": "core_banking_outage",
      "business_unit": "Corporate Banking",
      "status": "open",
      "linked_risk_id": "R-TC-001",
      "linked_control_ids": ["CTRL-ITO-001"],
      "linked_incident_id": "INC-2026-ORI-010",
      "accountable_senior_manager_id": "SM-CISO-001"
    },
    {
      "loss_event_id": "LEV-2026-011",
      "event_date": "2025-09-27",
      "gross_loss_inr": 780000,
      "direct_recovery_inr": 150000,
      "insurance_recovery_inr": 50000,
      "net_loss_inr": 580000,
      "recovery_inr": 200000,
      "business_line": "retail_banking",
      "basel_event_type": "execution_delivery_process_management",
      "loss_event_type": "operational_loss",
      "loss_event_subtype": "re_kyc_backlog",
      "business_unit": "Retail Operations",
      "status": "closed_recovered",
      "linked_risk_id": "R-CO-001",
      "linked_control_ids": ["CTRL-KYC-003"],
      "linked_incident_id": "INC-2026-ORI-011",
      "accountable_senior_manager_id": "SM-CCO-001"
    },
    {
      "loss_event_id": "LEV-2026-012",
      "event_date": "2026-03-30",
      "gross_loss_inr": 1250000,
      "direct_recovery_inr": 0,
      "insurance_recovery_inr": 0,
      "net_loss_inr": 1250000,
      "recovery_inr": 0,
      "business_line": "payment_settlement",
      "basel_event_type": "execution_delivery_process_management",
      "loss_event_type": "operational_loss",
      "loss_event_subtype": "settlement_cutoff_miss",
      "business_unit": "Payments",
      "status": "open",
      "linked_risk_id": "R-OP-001",
      "linked_control_ids": ["CTRL-AML-002"],
      "linked_incident_id": "INC-2026-ORI-012",
      "accountable_senior_manager_id": "SM-OPS-001"
    },
    {
      "loss_event_id": "LEV-2026-013",
      "event_date": "2025-08-14",
      "gross_loss_inr": 2100000,
      "direct_recovery_inr": 400000,
      "insurance_recovery_inr": 0,
      "net_loss_inr": 1700000,
      "recovery_inr": 400000,
      "business_line": "trading_sales",
      "basel_event_type": "execution_delivery_process_management",
      "loss_event_type": "operational_loss",
      "loss_event_subtype": "trade_capture_error",
      "business_unit": "Markets",
      "status": "closed_recovered",
      "linked_risk_id": "R-FC-001",
      "linked_control_ids": ["CTRL-AML-002"],
      "linked_incident_id": "INC-2026-ORI-013",
      "accountable_senior_manager_id": "SM-MLRO-001"
    },
    {
      "loss_event_id": "LEV-2026-014",
      "event_date": "2026-01-30",
      "gross_loss_inr": 390000,
      "direct_recovery_inr": 90000,
      "insurance_recovery_inr": 0,
      "net_loss_inr": 300000,
      "recovery_inr": 90000,
      "business_line": "asset_management",
      "basel_event_type": "clients_products_business_practices",
      "loss_event_type": "near_miss",
      "loss_event_subtype": "nav_disclosure_delay",
      "business_unit": "Asset Management",
      "status": "closed_no_loss",
      "linked_risk_id": "R-CD-001",
      "linked_control_ids": [],
      "linked_incident_id": "INC-2026-ORI-014",
      "accountable_senior_manager_id": "SM-CCO-001"
    },
    {
      "loss_event_id": "LEV-2026-015",
      "event_date": "2025-12-02",
      "gross_loss_inr": 1200000,
      "direct_recovery_inr": 200000,
      "insurance_recovery_inr": 0,
      "net_loss_inr": 1000000,
      "recovery_inr": 200000,
      "business_line": "retail_brokerage",
      "basel_event_type": "external_fraud",
      "loss_event_type": "operational_loss",
      "loss_event_subtype": "account_takeover",
      "business_unit": "Wealth & Brokerage",
      "status": "open",
      "linked_risk_id": "R-FR-001",
      "linked_control_ids": ["CTRL-UPI-001"],
      "linked_incident_id": "INC-2026-ORI-015",
      "accountable_senior_manager_id": "SM-FCC-001"
    },
    {
      "loss_event_id": "LEV-2026-016",
      "event_date": "2025-06-20",
      "gross_loss_inr": 275000,
      "direct_recovery_inr": 0,
      "insurance_recovery_inr": 75000,
      "net_loss_inr": 200000,
      "recovery_inr": 75000,
      "business_line": "corporate_finance",
      "basel_event_type": "internal_fraud",
      "loss_event_type": "operational_loss",
      "loss_event_subtype": "document_forgery",
      "business_unit": "Corporate Banking",
      "status": "closed_recovered",
      "linked_risk_id": "R-CR-001",
      "linked_control_ids": ["CTRL-LND-001"],
      "linked_incident_id": "INC-2026-ORI-001",
      "accountable_senior_manager_id": "SM-BH-RETAIL-001"
    },
    {
      "loss_event_id": "LEV-2026-017",
      "event_date": "2026-02-02",
      "gross_loss_inr": 540000,
      "direct_recovery_inr": 40000,
      "insurance_recovery_inr": 0,
      "net_loss_inr": 500000,
      "recovery_inr": 40000,
      "business_line": "trading_sales",
      "basel_event_type": "business_disruption_system_failures",
      "loss_event_type": "near_miss",
      "loss_event_subtype": "market_data_feed_gap",
      "business_unit": "Markets",
      "status": "closed_no_loss",
      "linked_risk_id": "R-TC-001",
      "linked_control_ids": ["CTRL-ITO-001"],
      "linked_incident_id": "INC-2026-ORI-003",
      "accountable_senior_manager_id": "SM-CISO-001"
    },
    {
      "loss_event_id": "LEV-2026-018",
      "event_date": "2025-07-09",
      "gross_loss_inr": 1600000,
      "direct_recovery_inr": 600000,
      "insurance_recovery_inr": 0,
      "net_loss_inr": 1000000,
      "recovery_inr": 600000,
      "business_line": "retail_banking",
      "basel_event_type": "damage_to_physical_assets",
      "loss_event_type": "operational_loss",
      "loss_event_subtype": "atm_physical_damage",
      "business_unit": "Retail Operations",
      "status": "closed_recovered",
      "linked_risk_id": "R-OP-001",
      "linked_control_ids": [],
      "linked_incident_id": "INC-2026-ORI-005",
      "accountable_senior_manager_id": "SM-OPS-001"
    }
  ],

  pacNotes: [
    {
      "pac_note_id": "PACN-2026-001",
      "title": "CPC dual-control & BPO EOD handoff SOP — Mumbai clearing",
      "document_version": "v2.3",
      "document_type": "sop",
      "business_unit": "Retail Banking",
      "status": "pending_orm_review",
      "submitted_by_role": "Head of Operations",
      "submitted_at": "2026-04-29T14:30:00Z",
      "target_approval_date": "2026-05-12",
      "accountable_senior_manager_id": "SM-OPS-001",
      "linked_obligation_ids": ["OBL-RBI-KYC-001", "OBL-PMLA-001"],
      "linked_process_ids": ["PROC-KYC-001", "PROC-AML-001"],
      "blocking_preventive_action_ids": ["PA-2026-ORI-01", "PA-2026-ORI-02"],
      "referenced_rca_ids": [],
      "comments": [
        {
          "at": "2026-05-02T10:00:00Z",
          "author_role": "ORM",
          "text": "ORM review pending — link to RCSA Retail Liabilities cycle RC-FY26-H1-RL."
        }
      ]
    },
    {
      "pac_note_id": "PACN-2026-002",
      "title": "STR clock stress — PMLA workflow capacity & BPO queue governance",
      "document_version": "v1.1",
      "document_type": "process_note",
      "business_unit": "Financial Crime",
      "status": "pending_orm_review",
      "submitted_by_role": "MLRO — Principal Officer",
      "submitted_at": "2026-05-04T09:00:00Z",
      "target_approval_date": "2026-05-15",
      "accountable_senior_manager_id": "SM-MLRO-001",
      "linked_obligation_ids": ["OBL-PMLA-003", "OBL-FIU-STR-001"],
      "linked_process_ids": ["PROC-AML-001"],
      "blocking_preventive_action_ids": ["PA-2026-ORI-02", "PA-2026-ORI-15"],
      "referenced_rca_ids": ["RCA-2026-ORI-02"],
      "comments": [
        {
          "at": "2026-05-04T11:30:00Z",
          "author_role": "MLRO-PO",
          "text": "PMLA STR workflow capacity note; no hard regulatory code invented — references existing PMLA s.12 STR timeline discipline."
        }
      ]
    },
    {
      "pac_note_id": "PACN-2026-003",
      "title": "DLA scale-up — LOS sequence guard & KFS discipline product programme",
      "document_version": "v0.9",
      "document_type": "product_program",
      "business_unit": "Digital Lending",
      "status": "pending_orm_review",
      "submitted_by_role": "Chief Compliance Officer",
      "submitted_at": "2026-05-01T08:45:00Z",
      "target_approval_date": "2026-05-10",
      "accountable_senior_manager_id": "SM-CCO-001",
      "linked_obligation_ids": ["OBL-RBI-DL-001", "OBL-RBI-DL-CIMS"],
      "linked_process_ids": ["PROC-LND-001"],
      "blocking_preventive_action_ids": ["PA-2026-ORI-07"],
      "referenced_rca_ids": ["RCA-2026-ORI-03"],
      "comments": [
        {
          "at": "2026-05-05T09:15:00Z",
          "author_role": "Head-ORM",
          "text": "Condition: complete LOS sequence guard retest before DLA scale-up per RBI MD on Digital Lending KFS discipline."
        }
      ]
    },
    {
      "pac_note_id": "PACN-2026-004",
      "title": "NPCI UPI limit pilot — new product approval pack",
      "document_version": "v1.0",
      "document_type": "new_product_approval",
      "business_unit": "Payments",
      "status": "conditional_approval",
      "submitted_by_role": "Head of FCC",
      "submitted_at": "2026-04-26T11:00:00Z",
      "target_approval_date": "2026-05-05",
      "accountable_senior_manager_id": "SM-FCC-001",
      "linked_obligation_ids": ["OBL-PMLA-001"],
      "linked_process_ids": ["PROC-UPI-001"],
      "blocking_preventive_action_ids": [],
      "referenced_rca_ids": [],
      "comments": [
        {
          "at": "2026-04-28T14:00:00Z",
          "author_role": "ORM",
          "text": "Conditional approval: NPCI UPI limit pilot only after FCC sign-off on mule typology rules."
        },
        {
          "at": "2026-04-29T16:00:00Z",
          "author_role": "CRO",
          "text": "Condition accepted — ORMC MOM to capture decision."
        }
      ]
    },
    {
      "pac_note_id": "PACN-2026-005",
      "title": "CERT-In six-hour runbook — IT Operations SOP addendum",
      "document_version": "v1.4",
      "document_type": "sop",
      "business_unit": "IT Operations",
      "status": "conditional_approval",
      "submitted_by_role": "CISO",
      "submitted_at": "2026-04-30T07:30:00Z",
      "target_approval_date": "2026-05-08",
      "accountable_senior_manager_id": "SM-CISO-001",
      "linked_obligation_ids": ["OBL-CERT-IN-001", "OBL-RBI-CSITE-001"],
      "linked_process_ids": ["PROC-ITO-001"],
      "blocking_preventive_action_ids": [],
      "referenced_rca_ids": ["RCA-2026-ORI-09"],
      "comments": [
        {
          "at": "2026-05-01T08:00:00Z",
          "author_role": "CISO",
          "text": "Condition: DR drill evidence pack for CERT-In six-hour runbook attached to CTRL-ITO-001 test population."
        }
      ]
    },
    {
      "pac_note_id": "PACN-2026-006",
      "title": "Corporate onboarding — beneficial ownership refresh process note",
      "document_version": "v3.0",
      "document_type": "process_note",
      "business_unit": "Corporate Banking",
      "status": "approved",
      "submitted_by_role": "ORM",
      "submitted_at": "2026-04-15T09:00:00Z",
      "approved_at": "2026-04-22T16:00:00Z",
      "target_approval_date": "2026-04-21",
      "accountable_senior_manager_id": "SM-CCO-001",
      "linked_obligation_ids": ["OBL-RBI-KYC-001"],
      "linked_process_ids": ["PROC-KYC-001"],
      "blocking_preventive_action_ids": [],
      "referenced_rca_ids": ["RCA-2026-ORI-02", "RCA-2026-ORI-04"],
      "comments": [
        {
          "at": "2026-04-20T12:00:00Z",
          "author_role": "ORM",
          "text": "Approved with linkage to supervisory readiness pack evidence indices."
        }
      ]
    },
    {
      "pac_note_id": "PACN-2026-007",
      "title": "Treasury ALCO — TPSP fourth-party disclosure attestation SOP",
      "document_version": "v2.0",
      "document_type": "sop",
      "business_unit": "Treasury",
      "status": "approved",
      "submitted_by_role": "CIO",
      "submitted_at": "2026-04-18T10:00:00Z",
      "approved_at": "2026-04-25T14:30:00Z",
      "target_approval_date": "2026-04-24",
      "accountable_senior_manager_id": "SM-CIO-001",
      "linked_obligation_ids": ["OBL-RBI-OUTSRC-001"],
      "linked_process_ids": ["PROC-VND-001"],
      "blocking_preventive_action_ids": [],
      "referenced_rca_ids": ["RCA-2026-ORI-05"],
      "comments": [
        {
          "at": "2026-04-25T17:45:00Z",
          "author_role": "ORM",
          "text": "TPSP fourth-party disclosure PAC closed-loop referenced in RCA-2026-ORI-05."
        }
      ]
    },
    {
      "pac_note_id": "PACN-2026-008",
      "title": "Wealth DigiGold — APR disclosure script (retail wealth programme)",
      "document_version": "v0.6",
      "document_type": "product_program",
      "business_unit": "Wealth",
      "status": "rejected",
      "submitted_by_role": "Business Head — Retail",
      "submitted_at": "2026-05-03T12:00:00Z",
      "approved_at": "2026-05-06T13:30:00Z",
      "target_approval_date": "2026-05-07",
      "accountable_senior_manager_id": "SM-BH-RETAIL-001",
      "linked_obligation_ids": ["OBL-RBI-DL-001"],
      "linked_process_ids": ["PROC-LND-001"],
      "blocking_preventive_action_ids": [],
      "referenced_rca_ids": ["RCA-2026-ORI-08"],
      "comments": [
        {
          "at": "2026-05-06T13:00:00Z",
          "author_role": "ORM",
          "text": "Rejected: customer-facing APR script still references deprecated fee slab; re-submit after CCO attestation."
        },
        {
          "at": "2026-05-06T13:30:00Z",
          "author_role": "CCO",
          "text": "Acknowledged — will align to current RBI MD on Digital Lending disclosures."
        }
      ]
    },
    {
      "pac_note_id": "PACN-2026-009",
      "title": "Retail liabilities — dormant account reactivation cooling-off (ORM sign-off)",
      "document_version": "v1.0",
      "document_type": "process_note",
      "business_unit": "Retail Banking",
      "status": "approved",
      "submitted_by_role": "Head of ORM",
      "submitted_at": "2026-05-05T09:00:00Z",
      "approved_at": "2026-05-10T15:00:00Z",
      "target_approval_date": "2026-05-12",
      "accountable_senior_manager_id": "SM-CCO-001",
      "linked_obligation_ids": ["OBL-RBI-KYC-001"],
      "linked_process_ids": ["PROC-KYC-001"],
      "blocking_preventive_action_ids": [],
      "referenced_rca_ids": ["RCA-2026-ORI-03"],
      "comments": []
    },
    {
      "pac_note_id": "PACN-2026-010",
      "title": "Wholesale FX — TPSP SOC2 evidence refresh (conditional)",
      "document_version": "v0.8",
      "document_type": "sop",
      "business_unit": "Treasury",
      "status": "conditional_approval",
      "submitted_by_role": "ORM",
      "submitted_at": "2026-05-04T10:00:00Z",
      "approved_at": "2026-05-09T14:00:00Z",
      "target_approval_date": "2026-05-11",
      "accountable_senior_manager_id": "SM-CIO-001",
      "linked_obligation_ids": ["OBL-RBI-OUTSRC-001"],
      "linked_process_ids": ["PROC-VND-001"],
      "blocking_preventive_action_ids": [],
      "referenced_rca_ids": [],
      "comments": []
    }
  ]

};

export function validateMockData(data) {
  const errors = [];
  const warnings = [];
  const idIndex = {};

  function indexDataset(name, idField) {
    const seen = new Set();
    idIndex[name] = seen;
    if (!Array.isArray(data[name])) {
      errors.push("Dataset " + name + " is not an array");
      return;
    }
    for (const row of data[name]) {
      const id = row[idField];
      if (id == null) {
        errors.push("Dataset " + name + " has a row with no " + idField);
        continue;
      }
      if (seen.has(id)) {
        errors.push("Dataset " + name + " has duplicate " + idField + ": " + id);
      } else {
        seen.add(id);
      }
    }
  }

  function checkRef(fromName, fromId, toName, toId, fieldLabel) {
    if (toId == null || toId === "") return;
    const target = idIndex[toName];
    if (!target) return;
    if (!target.has(toId)) {
      errors.push("Broken ref " + fromName + "[" + fromId + "]." + fieldLabel + " → " + toName + "[" + toId + "] not found");
    }
  }

  function checkRefList(fromName, fromId, toName, list, fieldLabel) {
    if (!Array.isArray(list)) return;
    for (const id of list) checkRef(fromName, fromId, toName, id, fieldLabel);
  }

  indexDataset("personas", "persona_id");
  indexDataset("navigationItems", "nav_id");
  indexDataset("screens", "screen_id");
  indexDataset("metrics", "metric_id");
  indexDataset("riskDomains", "domain_id");
  indexDataset("risks", "risk_id");
  indexDataset("regulations", "regulation_id");
  indexDataset("obligations", "obligation_id");
  indexDataset("controls", "control_id");
  indexDataset("processes", "process_id");
  indexDataset("processSteps", "step_id");
  indexDataset("activities", "activity_id");
  indexDataset("sourceSystems", "source_system_id");
  indexDataset("sourceRecords", "source_record_id");
  indexDataset("correlationRecords", "correlation_id");
  indexDataset("processExecutions", "process_execution_id");
  indexDataset("stepExecutions", "step_execution_id");
  indexDataset("controlInstances", "control_instance_id");
  indexDataset("evidenceRecords", "evidence_id");
  indexDataset("exceptions", "exception_id");
  indexDataset("issues", "issue_id");
  indexDataset("remediationActions", "action_id");
  indexDataset("seniorManagers", "senior_manager_id");
  indexDataset("decisionEvents", "decision_id");
  indexDataset("attestationEvents", "attestation_id");
  indexDataset("testExecutions", "test_id");
  indexDataset("workpapers", "workpaper_id");
  indexDataset("auditPacks", "audit_pack_id");
  indexDataset("aiInsights", "ai_insight_id");
  indexDataset("models", "model_id");
  indexDataset("modelRiskRecords", "mrr_id");
  indexDataset("reportingClocks", "clock_id");
  indexDataset("reportingSubmissions", "submission_id");
  indexDataset("kris", "kri_id");
  indexDataset("kriObservations", "observation_id");
  indexDataset("appetiteMetrics", "appetite_metric_id");
  indexDataset("appetiteObservations", "observation_id");
  indexDataset("rootCauseClusters", "cluster_id");
  indexDataset("auditTrailEvents", "audit_trail_event_id");
  indexDataset("inspectionLenses", "lens_id");
  indexDataset("sourceSystemHealth", "health_id");
  indexDataset("demoStorylines", "storyline_id");
  indexDataset("rcsaCycles", "rcsa_cycle_id");
  indexDataset("rcsaCells", "rcsa_cell_id");
  indexDataset("incidents", "incident_id");
  indexDataset("rcas", "rca_id");
  indexDataset("preventiveActions", "preventive_action_id");
  indexDataset("lossEvents", "loss_event_id");
  indexDataset("pacNotes", "pac_note_id");

  for (const r of data.risks) {
    checkRef("risks", r.risk_id, "riskDomains", r.domain_id, "domain_id");
    checkRef("risks", r.risk_id, "seniorManagers", r.accountable_senior_manager_id, "accountable_senior_manager_id");
    checkRefList("risks", r.risk_id, "obligations", r.linked_obligation_ids, "linked_obligation_ids");
    checkRefList("risks", r.risk_id, "controls", r.linked_control_ids, "linked_control_ids");
    checkRefList("risks", r.risk_id, "kris", r.kri_ids, "kri_ids");
    checkRefList("risks", r.risk_id, "appetiteMetrics", r.appetite_metric_ids, "appetite_metric_ids");
  }

  for (const o of data.obligations) {
    checkRef("obligations", o.obligation_id, "regulations", o.regulation_id, "regulation_id");
    checkRef("obligations", o.obligation_id, "reportingClocks", o.reporting_clock_id, "reporting_clock_id");
    checkRef("obligations", o.obligation_id, "seniorManagers", o.accountable_senior_manager_id, "accountable_senior_manager_id");
    checkRefList("obligations", o.obligation_id, "processes", o.applicable_processes, "applicable_processes");
    checkRefList("obligations", o.obligation_id, "controls", o.linked_control_ids, "linked_control_ids");
  }

  for (const c of data.controls) {
    checkRef("controls", c.control_id, "processes", c.process_id, "process_id");
    checkRef("controls", c.control_id, "seniorManagers", c.accountable_senior_manager_id, "accountable_senior_manager_id");
    checkRefList("controls", c.control_id, "obligations", c.linked_obligations, "linked_obligations");
    checkRefList("controls", c.control_id, "risks", c.linked_risks, "linked_risks");
  }

  for (const p of data.processSteps) checkRef("processSteps", p.step_id, "processes", p.process_id, "process_id");
  for (const a of data.activities) checkRef("activities", a.activity_id, "processSteps", a.step_id, "step_id");

  for (const sr of data.sourceRecords) checkRef("sourceRecords", sr.source_record_id, "sourceSystems", sr.source_system_id, "source_system_id");

  for (const cr of data.correlationRecords) {
    if (cr.from_entity_type === "sourceRecord") checkRef("correlationRecords", cr.correlation_id, "sourceRecords", cr.from_entity_id, "from_entity_id");
    if (cr.to_entity_type === "sourceRecord") checkRef("correlationRecords", cr.correlation_id, "sourceRecords", cr.to_entity_id, "to_entity_id");
  }

  for (const pe of data.processExecutions) checkRef("processExecutions", pe.process_execution_id, "processes", pe.process_id, "process_id");

  for (const se of data.stepExecutions) {
    checkRef("stepExecutions", se.step_execution_id, "processExecutions", se.process_execution_id, "process_execution_id");
    checkRef("stepExecutions", se.step_execution_id, "processSteps", se.step_id, "step_id");
    checkRefList("stepExecutions", se.step_execution_id, "sourceRecords", se.source_record_ids, "source_record_ids");
  }

  for (const ci of data.controlInstances) {
    checkRef("controlInstances", ci.control_instance_id, "controls", ci.control_id, "control_id");
    checkRef("controlInstances", ci.control_instance_id, "processExecutions", ci.process_execution_id, "process_execution_id");
    checkRef("controlInstances", ci.control_instance_id, "stepExecutions", ci.step_execution_id, "step_execution_id");
    checkRef("controlInstances", ci.control_instance_id, "exceptions", ci.exception_id, "exception_id");
    checkRefList("controlInstances", ci.control_instance_id, "evidenceRecords", ci.evidence_ids, "evidence_ids");
    const validOutcomes = ["Pass", "Fail", "DataGap", "EvidenceGap", "NeedsReview", "NA"];
    if (!validOutcomes.includes(ci.outcome)) errors.push("ControlInstance " + ci.control_instance_id + " has invalid outcome: " + ci.outcome);
  }

  for (const ev of data.evidenceRecords) {
    checkRef("evidenceRecords", ev.evidence_id, "sourceSystems", ev.source_system_id, "source_system_id");
    checkRef("evidenceRecords", ev.evidence_id, "sourceRecords", ev.source_record_id, "source_record_id");
    const validStatuses = ["Complete", "Partial", "Missing", "Late", "InvalidHash", "Orphaned", "BpoPending", "NotApplicable"];
    if (!validStatuses.includes(ev.evidence_status)) errors.push("EvidenceRecord " + ev.evidence_id + " has invalid evidence_status: " + ev.evidence_status);
  }

  for (const ex of data.exceptions) {
    checkRef("exceptions", ex.exception_id, "controlInstances", ex.control_instance_id, "control_instance_id");
    checkRef("exceptions", ex.exception_id, "rootCauseClusters", ex.root_cause_cluster_id, "root_cause_cluster_id");
    checkRef("exceptions", ex.exception_id, "issues", ex.linked_issue_id, "linked_issue_id");
  }

  for (const iss of data.issues) {
    checkRef("issues", iss.issue_id, "seniorManagers", iss.accountable_senior_manager_id, "accountable_senior_manager_id");
    checkRefList("issues", iss.issue_id, "controls", iss.linked_control_ids, "linked_control_ids");
    checkRefList("issues", iss.issue_id, "obligations", iss.linked_obligation_ids, "linked_obligation_ids");
    checkRefList("issues", iss.issue_id, "risks", iss.linked_risk_ids, "linked_risk_ids");
    checkRefList("issues", iss.issue_id, "remediationActions", iss.linked_remediation_ids, "linked_remediation_ids");
    checkRefList("issues", iss.issue_id, "aiInsights", iss.linked_ai_insight_ids, "linked_ai_insight_ids");
  }

  for (const ra of data.remediationActions) {
    checkRef("remediationActions", ra.action_id, "issues", ra.issue_id, "issue_id");
    checkRef("remediationActions", ra.action_id, "testExecutions", ra.retest_test_execution_id, "retest_test_execution_id");
    checkRef("remediationActions", ra.action_id, "seniorManagers", ra.owner_id, "owner_id");
  }

  for (const tx of data.testExecutions) {
    checkRef("testExecutions", tx.test_id, "controls", tx.control_id, "control_id");
    checkRef("testExecutions", tx.test_id, "workpapers", tx.linked_workpaper_id, "linked_workpaper_id");
    checkRefList("testExecutions", tx.test_id, "evidenceRecords", tx.evidence_ids, "evidence_ids");
  }

  for (const wp of data.workpapers) {
    checkRef("workpapers", wp.workpaper_id, "controls", wp.control_id, "control_id");
    checkRef("workpapers", wp.workpaper_id, "testExecutions", wp.test_execution_id, "test_execution_id");
    checkRef("workpapers", wp.workpaper_id, "seniorManagers", wp.tester_id, "tester_id");
    checkRef("workpapers", wp.workpaper_id, "seniorManagers", wp.reviewer_id, "reviewer_id");
    checkRefList("workpapers", wp.workpaper_id, "obligations", wp.obligation_ids, "obligation_ids");
    checkRefList("workpapers", wp.workpaper_id, "evidenceRecords", wp.evidence_ids, "evidence_ids");
  }

  for (const ap of data.auditPacks) {
    checkRefList("auditPacks", ap.audit_pack_id, "workpapers", ap.included_workpaper_ids, "included_workpaper_ids");
    checkRefList("auditPacks", ap.audit_pack_id, "evidenceRecords", ap.included_evidence_ids, "included_evidence_ids");
    checkRefList("auditPacks", ap.audit_pack_id, "issues", ap.included_issue_ids, "included_issue_ids");
    checkRefList("auditPacks", ap.audit_pack_id, "attestationEvents", ap.included_attestation_ids, "included_attestation_ids");
    checkRefList("auditPacks", ap.audit_pack_id, "decisionEvents", ap.included_decision_event_ids, "included_decision_event_ids");
  }

  for (const ai of data.aiInsights) {
    checkRef("aiInsights", ai.ai_insight_id, "models", ai.model_id, "model_id");
    checkRefList("aiInsights", ai.ai_insight_id, "evidenceRecords", ai.cited_evidence_ids, "cited_evidence_ids");
    checkRefList("aiInsights", ai.ai_insight_id, "sourceRecords", ai.cited_source_record_ids, "cited_source_record_ids");
    checkRefList("aiInsights", ai.ai_insight_id, "controls", ai.linked_control_ids, "linked_control_ids");
    checkRefList("aiInsights", ai.ai_insight_id, "issues", ai.linked_issue_ids, "linked_issue_ids");
    const validHITL = ["pending", "accepted", "rejected", "escalated", "overridden"];
    if (!validHITL.includes(ai.human_approval_status)) errors.push("AIInsight " + ai.ai_insight_id + " has invalid human_approval_status: " + ai.human_approval_status);
  }

  for (const m of data.modelRiskRecords) checkRef("modelRiskRecords", m.mrr_id, "models", m.model_id, "model_id");

  for (const rc of data.reportingClocks) checkRef("reportingClocks", rc.clock_id, "obligations", rc.obligation_id, "obligation_id");

  for (const rs of data.reportingSubmissions) {
    checkRef("reportingSubmissions", rs.submission_id, "reportingClocks", rs.clock_id, "clock_id");
    checkRef("reportingSubmissions", rs.submission_id, "evidenceRecords", rs.evidence_id_for_ack, "evidence_id_for_ack");
  }

  for (const k of data.kris) checkRef("kris", k.kri_id, "risks", k.linked_risk_id, "linked_risk_id");
  for (const ko of data.kriObservations) checkRef("kriObservations", ko.observation_id, "kris", ko.kri_id, "kri_id");
  for (const am of data.appetiteMetrics) checkRef("appetiteMetrics", am.appetite_metric_id, "risks", am.linked_risk_id, "linked_risk_id");
  for (const ao of data.appetiteObservations) checkRef("appetiteObservations", ao.observation_id, "appetiteMetrics", ao.appetite_metric_id, "appetite_metric_id");

  for (const rcc of data.rootCauseClusters) {
    checkRefList("rootCauseClusters", rcc.cluster_id, "issues", rcc.member_issue_ids, "member_issue_ids");
    checkRefList("rootCauseClusters", rcc.cluster_id, "controls", rcc.member_control_ids, "member_control_ids");
    checkRefList("rootCauseClusters", rcc.cluster_id, "processes", rcc.member_process_ids, "member_process_ids");
    checkRef("rootCauseClusters", rcc.cluster_id, "aiInsights", rcc.ai_signal_id, "ai_signal_id");
    checkRefList("rootCauseClusters", rcc.cluster_id, "remediationActions", rcc.recommended_remediation_action_ids, "recommended_remediation_action_ids");
  }

  for (const ssh of data.sourceSystemHealth) checkRef("sourceSystemHealth", ssh.health_id, "sourceSystems", ssh.source_system_id, "source_system_id");

  if (Array.isArray(data.rcsaCycles)) {
    for (const cyc of data.rcsaCycles) {
      checkRef("rcsaCycles", cyc.rcsa_cycle_id, "processes", cyc.linked_process_id, "linked_process_id");
      checkRef("rcsaCycles", cyc.rcsa_cycle_id, "seniorManagers", cyc.owner_senior_manager_id, "owner_senior_manager_id");
    }
  }
  if (Array.isArray(data.rcsaCells)) {
    for (const cell of data.rcsaCells) {
      checkRef("rcsaCells", cell.rcsa_cell_id, "rcsaCycles", cell.rcsa_cycle_id, "rcsa_cycle_id");
      checkRef("rcsaCells", cell.rcsa_cell_id, "risks", cell.risk_id, "risk_id");
      checkRef("rcsaCells", cell.rcsa_cell_id, "processes", cell.process_id, "process_id");
      checkRefList("rcsaCells", cell.rcsa_cell_id, "controls", cell.control_ids, "control_ids");
    }
  }
  if (Array.isArray(data.incidents)) {
    for (const inc of data.incidents) {
      checkRef("incidents", inc.incident_id, "seniorManagers", inc.accountable_senior_manager_id, "accountable_senior_manager_id");
      checkRefList("incidents", inc.incident_id, "risks", inc.linked_risk_ids, "linked_risk_ids");
      checkRefList("incidents", inc.incident_id, "controls", inc.linked_control_ids, "linked_control_ids");
    }
  }
  if (Array.isArray(data.rcas)) {
    for (const rca of data.rcas) {
      checkRef("rcas", rca.rca_id, "incidents", rca.incident_id, "incident_id");
      checkRef("rcas", rca.rca_id, "seniorManagers", rca.owner_senior_manager_id, "owner_senior_manager_id");
    }
  }
  if (Array.isArray(data.preventiveActions)) {
    for (const pa of data.preventiveActions) {
      checkRef("preventiveActions", pa.preventive_action_id, "rcas", pa.rca_id, "rca_id");
      checkRef("preventiveActions", pa.preventive_action_id, "seniorManagers", pa.owner_senior_manager_id, "owner_senior_manager_id");
      checkRefList("preventiveActions", pa.preventive_action_id, "evidenceRecords", pa.closure_evidence_ids, "closure_evidence_ids");
    }
  }
  if (Array.isArray(data.lossEvents)) {
    for (const lev of data.lossEvents) {
      checkRef("lossEvents", lev.loss_event_id, "risks", lev.linked_risk_id, "linked_risk_id");
      checkRefList("lossEvents", lev.loss_event_id, "controls", lev.linked_control_ids, "linked_control_ids");
      checkRef("lossEvents", lev.loss_event_id, "seniorManagers", lev.accountable_senior_manager_id, "accountable_senior_manager_id");
      checkRef("lossEvents", lev.loss_event_id, "incidents", lev.linked_incident_id, "linked_incident_id");
    }
  }
  if (Array.isArray(data.pacNotes)) {
    for (const pn of data.pacNotes) {
      checkRefList("pacNotes", pn.pac_note_id, "preventiveActions", pn.blocking_preventive_action_ids, "blocking_preventive_action_ids");
      checkRefList("pacNotes", pn.pac_note_id, "rcas", pn.referenced_rca_ids, "referenced_rca_ids");
      checkRefList("pacNotes", pn.pac_note_id, "obligations", pn.linked_obligation_ids, "linked_obligation_ids");
      checkRefList("pacNotes", pn.pac_note_id, "processes", pn.linked_process_ids, "linked_process_ids");
      checkRef("pacNotes", pn.pac_note_id, "seniorManagers", pn.accountable_senior_manager_id, "accountable_senior_manager_id");
    }
  }
  if (Array.isArray(data.incidents)) {
    for (const inc of data.incidents) {
      checkRef("incidents", inc.incident_id, "seniorManagers", inc.accountable_senior_manager_id, "accountable_senior_manager_id");
      checkRefList("incidents", inc.incident_id, "risks", inc.linked_risk_ids, "linked_risk_ids");
      checkRefList("incidents", inc.incident_id, "controls", inc.linked_control_ids, "linked_control_ids");
      checkRef("incidents", inc.incident_id, "rcas", inc.linked_rca_id, "linked_rca_id");
    }
  }
  if (Array.isArray(data.auditTrailEvents)) {
    for (const at of data.auditTrailEvents) {
      const er = at.entity_ref;
      if (er && er.type === "incident" && er.id) {
        checkRef("auditTrailEvents", at.audit_trail_event_id, "incidents", er.id, "entity_ref.id");
      }
    }
  }

  for (const story of data.demoStorylines) {
    if (!Array.isArray(story.steps)) {
      errors.push("Storyline " + story.storyline_id + " has no steps");
      continue;
    }
    for (const step of story.steps) {
      const screenCodes = data.screens.map(function (s) { return s.code; });
      if (!screenCodes.includes(step.screen)) errors.push("Storyline " + story.storyline_id + " step " + step.step_id + " references unknown screen: " + step.screen);
      const ref = step.highlight_record_ref;
      if (ref && ref.type && ref.id) {
        const typeMap = { incident: "incidents", pacNote: "pacNotes", risk: "risks", obligation: "obligations", control: "controls", process: "processes", processExecution: "processExecutions", stepExecution: "stepExecutions", controlInstance: "controlInstances", evidenceRecord: "evidenceRecords", sourceRecord: "sourceRecords", correlationRecord: "correlationRecords", exception: "exceptions", issue: "issues", remediationAction: "remediationActions", seniorManager: "seniorManagers", decisionEvent: "decisionEvents", attestationEvent: "attestationEvents", testExecution: "testExecutions", workpaper: "workpapers", auditPack: "auditPacks", aiInsight: "aiInsights", reportingClock: "reportingClocks", reportingSubmission: "reportingSubmissions", sourceSystem: "sourceSystems", kri: "kris", lossEvent: "lossEvents" };
        const dsName = typeMap[ref.type];
        if (!dsName) warnings.push("Storyline " + story.storyline_id + " step " + step.step_id + " has unknown ref type: " + ref.type);
        else checkRef("demoStorylines", story.storyline_id, dsName, ref.id, "step " + step.step_id + " highlight_record_ref");
      }
    }
  }

  const requiredAnchors = ["UCIC-2024-00123", "UCIC-2024-00126", "UCIC-2024-00127", "AML-ALRT-2024-00501", "AML-ALRT-2024-00502", "AML-ALRT-2024-00505", "DL-APP-2024-00881", "DL-APP-2024-00884", "VEND-2024-00205"];
  const presentAnchors = new Set(data.processExecutions.map(function (pe) { return pe.anchor_key_value; }));
  for (const a of requiredAnchors) if (!presentAnchors.has(a)) warnings.push("Required anchor key not found in processExecutions: " + a);

  const requiredIssues = ["ISS-2026-009", "ISS-2026-027", "ISS-2026-061", "ISS-2026-085"];
  for (const i of requiredIssues) if (!idIndex.issues.has(i)) warnings.push("Required issue ID not present: " + i);

  const requiredControls = ["CTRL-KYC-001", "CTRL-KYC-002", "CTRL-KYC-003", "CTRL-LND-002", "CTRL-AML-002", "CTRL-AML-003", "CTRL-UPI-001", "CTRL-VND-001", "CTRL-ITO-001"];
  for (const c of requiredControls) if (!idIndex.controls.has(c)) warnings.push("Required control ID not present: " + c);

  return { ok: errors.length === 0, errors: errors, warnings: warnings };
}
