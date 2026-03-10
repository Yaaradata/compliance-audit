-- ============================================================
-- SOC 2 — Seed data (single INSERT script).
-- Source: SOC2_TSC_Canonical_Evidence_Model.xlsx, SOC2_TSC_Applicability_Matrix.xlsx
-- Seeds: evidence_domains (8), controls (CC1–CC9 + A1, PI1, C1, P1–P8),
--        canonical_evidence_items (36), item_control_mappings.
-- For architecture_details, run 02_soc2_architecture_and_controls_seed.sql
-- Run after 03_soc2_full_schema.sql. Does NOT modify any Swift schema.
-- ============================================================

BEGIN;

SET search_path TO soc2, core, public;

-- ========== Evidence domains (from Canonical Evidence Model) ==========
INSERT INTO soc2.evidence_domains (id, name, color, accent_color, item_count, sort_order, soc_version) VALUES
('A', 'Governance & Risk', '#0F4C75', '#BBE1FA', 5, 1, '2022'),
('B', 'Logical Access & Auth', '#1B5E20', '#C8E6C9', 9, 2, '2022'),
('C', 'System Operations', '#4A148C', '#E1BEE7', 5, 3, '2022'),
('D', 'Vulnerability Mgmt', '#E65100', '#FFE0B2', 4, 4, '2022'),
('E', 'Monitoring & Audit', '#1565C0', '#BBDEFB', 3, 5, '2022'),
('F', 'Availability', '#B71C1C', '#FFCDD2', 2, 6, '2022'),
('G', 'Confidentiality & PI', '#00695C', '#B2DFDB', 2, 7, '2022'),
('H', 'Privacy', '#BF360C', '#FFCCBC', 6, 8, '2022')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, item_count = EXCLUDED.item_count, sort_order = EXCLUDED.sort_order;

-- ========== Controls (Common Criteria + optional TSC from Applicability Matrix) ==========
INSERT INTO soc2.controls (id, name, control_type, description, scope_applicability, soc_version) VALUES
('CC1', 'Control Environment', 'mandatory', 'Standards, processes, and structures for internal control.', '{SECURITY_ONLY,SECURITY_AVAILABILITY,SECURITY_PI,SECURITY_CONFIDENTIALITY,SECURITY_PRIVACY,ALL_FIVE_TSC}', '2022'),
('CC2', 'Communication and Information', 'mandatory', 'Information for internal control; external communication.', '{SECURITY_ONLY,SECURITY_AVAILABILITY,SECURITY_PI,SECURITY_CONFIDENTIALITY,SECURITY_PRIVACY,ALL_FIVE_TSC}', '2022'),
('CC3', 'Risk Assessment', 'mandatory', 'Objectives with sufficient clarity; risks to objectives.', '{SECURITY_ONLY,SECURITY_AVAILABILITY,SECURITY_PI,SECURITY_CONFIDENTIALITY,SECURITY_PRIVACY,ALL_FIVE_TSC}', '2022'),
('CC4', 'Monitoring Activities', 'mandatory', 'Ongoing and separate evaluations of internal control.', '{SECURITY_ONLY,SECURITY_AVAILABILITY,SECURITY_PI,SECURITY_CONFIDENTIALITY,SECURITY_PRIVACY,ALL_FIVE_TSC}', '2022'),
('CC5', 'Control Activities', 'mandatory', 'Control activities that mitigate risks to objectives.', '{SECURITY_ONLY,SECURITY_AVAILABILITY,SECURITY_PI,SECURITY_CONFIDENTIALITY,SECURITY_PRIVACY,ALL_FIVE_TSC}', '2022'),
('CC6', 'Logical and Physical Access Controls', 'mandatory', 'Logical and physical access controls.', '{SECURITY_ONLY,SECURITY_AVAILABILITY,SECURITY_PI,SECURITY_CONFIDENTIALITY,SECURITY_PRIVACY,ALL_FIVE_TSC}', '2022'),
('CC7', 'System Operations', 'mandatory', 'Detect, monitor, and respond to security events and incidents.', '{SECURITY_ONLY,SECURITY_AVAILABILITY,SECURITY_PI,SECURITY_CONFIDENTIALITY,SECURITY_PRIVACY,ALL_FIVE_TSC}', '2022'),
('CC8', 'Change Management', 'mandatory', 'Authorize, design, develop, implement changes.', '{SECURITY_ONLY,SECURITY_AVAILABILITY,SECURITY_PI,SECURITY_CONFIDENTIALITY,SECURITY_PRIVACY,ALL_FIVE_TSC}', '2022'),
('CC9', 'Risk Mitigation', 'mandatory', 'Risk mitigation for business disruptions; vendor risk.', '{SECURITY_ONLY,SECURITY_AVAILABILITY,SECURITY_PI,SECURITY_CONFIDENTIALITY,SECURITY_PRIVACY,ALL_FIVE_TSC}', '2022'),
('A1', 'Availability (Capacity, Recovery, Testing)', 'advisory', 'Processing capacity; recovery infrastructure; recovery testing.', '{SECURITY_AVAILABILITY,ALL_FIVE_TSC}', '2022'),
('PI1', 'Processing Integrity', 'advisory', 'Quality information; input, processing, output, storage controls.', '{SECURITY_PI,ALL_FIVE_TSC}', '2022'),
('C1', 'Confidentiality', 'advisory', 'Identify, maintain, dispose of confidential information.', '{SECURITY_CONFIDENTIALITY,ALL_FIVE_TSC}', '2022'),
('P1', 'Privacy Notice and Communication', 'advisory', 'Notice to data subjects.', '{SECURITY_PRIVACY,ALL_FIVE_TSC}', '2022'),
('P2', 'Choice and Consent', 'advisory', 'Communicates choices and obtains consent.', '{SECURITY_PRIVACY,ALL_FIVE_TSC}', '2022'),
('P3', 'Collection', 'advisory', 'Collection of personal information.', '{SECURITY_PRIVACY,ALL_FIVE_TSC}', '2022'),
('P4', 'Use, Retention and Disposal', 'advisory', 'Use, retention, disposal of PI.', '{SECURITY_PRIVACY,ALL_FIVE_TSC}', '2022'),
('P5', 'Access', 'advisory', 'Data subject access and correction.', '{SECURITY_PRIVACY,ALL_FIVE_TSC}', '2022'),
('P6', 'Disclosure to Third Parties', 'advisory', 'Disclosure and breach notification.', '{SECURITY_PRIVACY,ALL_FIVE_TSC}', '2022'),
('P7', 'Quality', 'advisory', 'Quality of personal information.', '{SECURITY_PRIVACY,ALL_FIVE_TSC}', '2022'),
('P8', 'Monitoring and Enforcement', 'advisory', 'Privacy monitoring and enforcement.', '{SECURITY_PRIVACY,ALL_FIVE_TSC}', '2022')
ON CONFLICT (id) DO NOTHING;

-- ========== Canonical evidence items (from Canonical Evidence Model, 36 items) ==========
INSERT INTO soc2.canonical_evidence_items (id, domain_id, sort_order, name, priority, evidence_type, description, control_count, input_schema, soc_version) VALUES
('A1', 'A', 1, 'Information security policy (comprehensive)', 'critical', 'Policy document; narrative PDF; standards document', 'Master information security policy covering tone at top, board oversight, management structures, control activities, and risk mitigation. Must be board-approved and annually reviewed.', 5, '[]', '2022'),
('A2', 'A', 2, 'Risk assessment methodology & risk register', 'critical', 'Risk assessment document; risk register; scenario analysis', 'Documented risk assessment methodology covering objectives specification, risk identification, fraud risk, and change risk. Includes live risk register with residual risk ratings.', 4, '[]', '2022'),
('A3', 'A', 3, 'Board & management oversight evidence', 'high', 'Board minutes; committee reports; management review records', 'Evidence of board independence, oversight of internal controls, and management communication of deficiencies. Board minutes or committee reports showing security/availability/privacy oversight.', 2, '[]', '2022'),
('A4', 'A', 4, 'Vendor & third-party risk management program', 'high', 'Vendor register; risk tier classification; contract excerpts; assessment records', 'Comprehensive third-party risk management covering vendor inventory, tiering, assessments, SLAs, and ongoing monitoring. Includes confidentiality/privacy commitments from vendors.', 1, '[]', '2022'),
('A5', 'A', 5, 'Business continuity & disaster recovery plan', 'high', 'BCP/DR plan document; test records; alternate processing procedures', 'Documented business continuity and disaster recovery plan covering risk mitigation for disruptions, environmental protections, backup processes, and recovery testing.', 3, '[]', '2022'),
('B1', 'B', 6, 'Logical access control policy & procedures', 'critical', 'Policy document; procedures; standards', 'Comprehensive logical access security policy covering access control software, user registration/deregistration, and role-based access controls aligned with least privilege and separation of duties.', 3, '[]', '2022'),
('B2', 'B', 7, 'User access list & privileged account inventory', 'high', 'Account listing; AD export; system account reports', 'Complete inventory of all user accounts (standard and privileged) across all in-scope systems. Includes account type, system, role assignment, last review date.', 2, '[]', '2022'),
('B3', 'B', 8, 'Access review records (periodic)', 'high', 'Review reports; sign-off records; exception logs', 'Evidence of periodic access rights reviews covering appropriateness of access roles and rules, including modification and revocation actions taken.', 1, '[]', '2022'),
('B4', 'B', 9, 'MFA configuration evidence', 'critical', 'Configuration exports; architecture diagram; MFA policy', 'Multi-factor authentication configuration evidence covering internal access, remote access, and external boundary protection. Documents MFA methods, coverage, and enforcement points.', 2, '[]', '2022'),
('B5', 'B', 10, 'Credential & encryption key management', 'high', 'Key inventory; rotation records; vault/HSM config; encryption standards', 'Evidence of cryptographic key management covering generation, storage, use, and destruction. Includes key rotation schedule, vault/HSM configuration, and algorithm standards.', 1, '[]', '2022'),
('B6', 'B', 11, 'Physical access control evidence', 'high', 'Access control system reports; badge logs; policy', 'Physical access controls for all facilities housing in-scope systems. Covers data centres, office spaces, backup media storage, and other sensitive locations.', 1, '[]', '2022'),
('B7', 'B', 12, 'Media disposal & data sanitisation evidence', 'medium', 'Disposal certificates; sanitisation records; procedures', 'Evidence of secure disposal of physical assets with procedures that diminish ability to recover data or software before discontinuing logical and physical protections.', 1, '[]', '2022'),
('B8', 'B', 13, 'Boundary protection systems configuration', 'high', 'Firewall configuration; IDS/IPS setup; network topology', 'Configuration and evidence of boundary protection systems (firewalls, IDS/IPS, DMZ) and data transmission controls (DLP, encryption in transit, removable media controls).', 2, '[]', '2022'),
('B9', 'B', 14, 'Malware protection & unauthorised software controls', 'critical', 'Anti-malware config; update logs; software allowlist; change control evidence', 'Evidence of controls preventing or detecting unauthorised or malicious software, including anti-malware configuration, software installation restrictions, and change-detection mechanisms.', 1, '[]', '2022'),
('C1', 'C', 15, 'System configuration standards & hardening', 'high', 'Configuration exports; CIS benchmark results; hardening checklist', 'Documented configuration standards and hardening evidence showing defined baselines, monitoring for non-compliance, and detection of new vulnerabilities.', 1, '[]', '2022'),
('C2', 'C', 16, 'Anomaly detection & monitoring configuration', 'critical', 'SIEM config; log source list; alert rules; retention policy', 'Security monitoring configuration covering detection policies, anomaly detection rules, log sources, and filtering/analysis processes to identify security events.', 1, '[]', '2022'),
('C3', 'C', 17, 'Security incident evaluation procedures', 'high', 'Incident management procedures; evaluation workflow; escalation matrix', 'Procedures for evaluating detected security events to determine if they constitute incidents, including impact assessment on confidential information and personal information.', 1, '[]', '2022'),
('C4', 'C', 18, 'Security incident response & recovery procedures', 'high', 'Incident response plan; response records; recovery procedures; lessons learned', 'Documented incident response program covering role assignments, containment, remediation, communication protocols, recovery procedures, and incident recovery plan testing.', 2, '[]', '2022'),
('C5', 'C', 19, 'Change management procedures & records', 'critical', 'Change management policy; change records; approval evidence; test records', 'Evidence of controlled change management for infrastructure, data, software, and procedures. Covers authorisation, design, testing, approval, and deployment including emergency change processes.', 1, '[]', '2022'),
('D1', 'D', 20, 'Vulnerability scanning & patch management policy', 'high', 'Policy document; procedures; scanning schedule', 'Documented vulnerability scanning policy and patch management procedures covering scanning frequency, severity-based remediation timelines, and in-scope system coverage.', 1, '[]', '2022'),
('D2', 'D', 21, 'Current vulnerability scan results', 'critical', 'Scan tool output; vulnerability report with severity ratings', 'Recent vulnerability scan results from a recognised scanning tool covering all in-scope systems, showing current vulnerability status and severity ratings.', 1, '[]', '2022'),
('D3', 'D', 22, 'Vulnerability remediation tracking log', 'high', 'Remediation tracker; risk register; action plan records', 'Tracking of vulnerability remediation from scans and penetration tests, including severity-based prioritisation, risk acceptance records, and closure evidence.', 1, '[]', '2022'),
('D4', 'D', 23, 'Penetration test reports (annual)', 'medium', 'Penetration test report; executive summary; remediation plan', 'Application, system, and network penetration testing conducted by an independent party. Scope covers all in-scope systems relevant to trust services categories.', 1, '[]', '2022'),
('E1', 'E', 24, 'Monitoring activities & internal audit program', 'high', 'Internal audit plan; audit reports; monitoring schedules', 'Evidence of ongoing and separate monitoring activities, including internal audit program, assessments, and management of identified deficiencies. Covers both process and outcome.', 2, '[]', '2022'),
('E2', 'E', 25, 'Control environment & ethics evidence', 'high', 'Code of conduct; ethics training records; HR policy; disciplinary records', 'Evidence of commitment to integrity and ethical values, staff competency, and accountability. Includes code of conduct, training, and performance management processes.', 3, '[]', '2022'),
('E3', 'E', 26, 'Information & communication procedures', 'medium', 'Communication plan; internal reporting records; external communication evidence', 'Evidence of information quality management and communication procedures, covering internal control information, personnel communication, and external party communication including incident reporting.', 3, '[]', '2022'),
('F1', 'F', 27, 'Capacity management & availability monitoring', 'high', 'Capacity reports; monitoring dashboards; utilisation data', 'Current processing capacity measurements, utilisation baselines, capacity forecasts, and change triggers for when forecasted usage exceeds tolerance.', 1, '[]', '2022'),
('F2', 'F', 28, 'Backup & recovery infrastructure evidence', 'critical', 'Backup configuration; offsite storage evidence; recovery infrastructure docs; test records', 'Evidence of environmental protections, data backup processes, offsite storage, alternate processing infrastructure, and recovery plan testing.', 2, '[]', '2022'),
('G1', 'G', 29, 'Confidential information identification & retention', 'high', 'Data classification policy; confidential data inventory; retention schedule', 'Procedures to identify, designate, retain, and dispose of confidential information. Covers both retention during designated period and secure disposal at end of retention.', 2, '[]', '2022'),
('G2', 'G', 30, 'Processing integrity controls (input/processing/output)', 'high', 'Input validation rules; processing specs; output distribution procedures; error logs', 'Evidence of processing integrity controls covering information quality, input controls, processing specifications, output completeness/accuracy, and storage integrity.', 5, '[]', '2022'),
('H1', 'H', 31, 'Privacy notice & consent management', 'critical', 'Privacy notice; consent records; data subject communication', 'Privacy notice communicated to data subjects including purposes, choices, consent records, and procedures for obtaining explicit consent for sensitive information collection.', 3, '[]', '2022'),
('H2', 'H', 32, 'Personal information collection & use controls', 'high', 'Data inventory; collection procedures; data minimisation evidence; use records', 'Evidence that personal information is collected only for stated purposes using fair and lawful means, used only for intended purposes, and retained only as long as necessary.', 3, '[]', '2022'),
('H3', 'H', 33, 'Personal information disposal procedures', 'high', 'Deletion procedures; deletion request logs; destruction certificates', 'Evidence of secure disposal of personal information including procedures for identifying, capturing deletion requests, and destroying PI that has been identified for disposal.', 1, '[]', '2022'),
('H4', 'H', 34, 'Data subject access & correction procedures', 'high', 'Access request procedure; correction procedure; request log; response records', 'Procedures and evidence for granting authenticated data subjects access to their personal information and correcting/amending information upon request.', 2, '[]', '2022'),
('H5', 'H', 35, 'Third-party PI disclosure & breach notification', 'high', 'Disclosure records; third-party PI agreements; breach notification procedure; breach log', 'Evidence of controlled disclosure of PI to third parties with consent, records of disclosures, breach detection and notification procedures, and third-party commitment to report unauthorised disclosures.', 7, '[]', '2022'),
('H6', 'H', 36, 'Privacy quality & monitoring program', 'high', 'Privacy monitoring reports; complaint log; compliance review; training records', 'Evidence of accurate and complete PI maintenance, monitoring of privacy compliance, and processes for receiving/resolving data subject inquiries, complaints, and disputes.', 2, '[]', '2022')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, domain_id = EXCLUDED.domain_id, sort_order = EXCLUDED.sort_order, priority = EXCLUDED.priority, evidence_type = EXCLUDED.evidence_type, description = EXCLUDED.description, control_count = EXCLUDED.control_count;

-- ========== Item–control mappings (from Criteria Served per evidence item) ==========
INSERT INTO soc2.item_control_mappings (evidence_item_id, control_id, is_primary, weight, soc_version) VALUES
('A1', 'CC1', false, 1.0, '2022'),
('A1', 'CC5', false, 1.0, '2022'),
('A1', 'CC9', false, 1.0, '2022'),
('A2', 'CC3', false, 1.0, '2022'),
('A3', 'CC1', false, 1.0, '2022'),
('A3', 'CC4', false, 1.0, '2022'),
('A4', 'CC9', false, 1.0, '2022'),
('A5', 'A1', false, 1.0, '2022'),
('A5', 'CC9', false, 1.0, '2022'),
('B1', 'CC6', false, 1.0, '2022'),
('B2', 'CC6', false, 1.0, '2022'),
('B3', 'CC6', false, 1.0, '2022'),
('B4', 'CC6', false, 1.0, '2022'),
('B5', 'CC6', false, 1.0, '2022'),
('B6', 'CC6', false, 1.0, '2022'),
('B7', 'CC6', false, 1.0, '2022'),
('B8', 'CC6', false, 1.0, '2022'),
('B9', 'CC6', false, 1.0, '2022'),
('C1', 'CC7', false, 1.0, '2022'),
('C2', 'CC7', false, 1.0, '2022'),
('C3', 'CC7', false, 1.0, '2022'),
('C4', 'CC7', false, 1.0, '2022'),
('C5', 'CC8', false, 1.0, '2022'),
('D1', 'CC7', false, 1.0, '2022'),
('D2', 'CC7', false, 1.0, '2022'),
('D3', 'CC7', false, 1.0, '2022'),
('D4', 'CC4', false, 1.0, '2022'),
('E1', 'CC4', false, 1.0, '2022'),
('E2', 'CC1', false, 1.0, '2022'),
('E3', 'CC2', false, 1.0, '2022'),
('F1', 'A1', false, 1.0, '2022'),
('F2', 'A1', false, 1.0, '2022'),
('G1', 'C1', false, 1.0, '2022'),
('G2', 'PI1', false, 1.0, '2022'),
('H1', 'P1', false, 1.0, '2022'),
('H1', 'P2', false, 1.0, '2022'),
('H1', 'P3', false, 1.0, '2022'),
('H2', 'P3', false, 1.0, '2022'),
('H2', 'P4', false, 1.0, '2022'),
('H3', 'P4', false, 1.0, '2022'),
('H4', 'P5', false, 1.0, '2022'),
('H5', 'P6', false, 1.0, '2022'),
('H6', 'P7', false, 1.0, '2022'),
('H6', 'P8', false, 1.0, '2022')
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

COMMIT;
