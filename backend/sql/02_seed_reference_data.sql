-- ============================================================
-- SWIFT CSCF v2025 — Reference Data Seed
-- Run as: psql -U postgres -d compliance -f backend/sql/02_seed_reference_data.sql
-- ============================================================

BEGIN;
SET search_path TO cscf_2025_new;

-- ============================================================
-- 1. audit_frameworks (1 row)
-- ============================================================

INSERT INTO audit_frameworks (code, name, version, effective_date, metadata)
VALUES (
    'SWIFT_CSCF',
    'SWIFT Customer Security Controls Framework',
    'v2025',
    '2025-07-01',
    '{"objectives": 3, "mandatory_controls": 25, "advisory_controls": 7, "total_controls": 32, "evidence_items": 53}'
) ON CONFLICT (code) DO NOTHING;


-- ============================================================
-- 2. evidence_domains (8 rows)
-- ============================================================

INSERT INTO evidence_domains (id, name, color, accent_color, item_count, sort_order) VALUES
('A', 'Network & Architecture',      '#0F4C75', '#BBE1FA', 6,  1),
('B', 'System Hardening & Config',    '#1B5E20', '#C8E6C9', 8,  2),
('C', 'Access Management',            '#E65100', '#FFE0B2', 9,  3),
('D', 'Vulnerability & Patch Mgmt',   '#B71C1C', '#FFCDD2', 6,  4),
('E', 'Monitoring & Detection',       '#4A148C', '#E1BEE7', 7,  5),
('F', 'Third-Party & Outsourcing',    '#1565C0', '#BBDEFB', 4,  6),
('G', 'Physical Security',            '#F57F17', '#FFF9C4', 4,  7),
('H', 'Policies & Governance',        '#BF360C', '#FFCCBC', 9,  8)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 3. controls (32 rows)
-- architecture_applicability: array of architecture types where the control applies
-- ============================================================

INSERT INTO controls (id, name, control_type, objective, architecture_applicability) VALUES
('1.1',   'SWIFT Environment Protection',            'mandatory', 1, '{A1,A2,A3,A4}'),
('1.2',   'OS Privileged Account Control',            'mandatory', 1, '{A1,A2,A3,A4,B}'),
('1.3',   'Virtualisation/Cloud Protection',          'advisory',  1, '{A1,A2,A3,A4}'),
('1.4',   'Restriction of Internet Access',           'mandatory', 1, '{A1,A2,A3,A4}'),
('1.5',   'Customer Environment Protection',          'mandatory', 1, '{A1,A2,A3,A4}'),
('2.1',   'Internal Data Flow Security',              'mandatory', 1, '{A1,A2,A3,A4}'),
('2.2',   'Security Updates',                         'mandatory', 1, '{A1,A2,A3,A4,B}'),
('2.3',   'System Hardening',                         'mandatory', 1, '{A1,A2,A3,A4,B}'),
('2.4A',  'Back Office Data Flow Security',           'advisory',  1, '{A1,A2,A3,A4}'),
('2.5A',  'External Transmission Data Protection',    'advisory',  1, '{A1,A2,A3,A4}'),
('2.6',   'Operator Session Confidentiality',         'mandatory', 1, '{A1,A2,A3,A4,B}'),
('2.7',   'Vulnerability Scanning',                   'mandatory', 1, '{A1,A2,A3,A4}'),
('2.8',   'Outsourced Critical Activity Protection',  'mandatory', 1, '{A1,A2,A3,A4,B}'),
('2.9',   'Transaction Business Controls',            'mandatory', 1, '{A1,A2,A3,A4,B}'),
('2.10',  'Application Hardening',                    'mandatory', 1, '{A1,A2}'),
('2.11A', 'RMA Business Controls',                    'advisory',  1, '{A1,A2,A3,B}'),
('3.1',   'Physical Security',                        'mandatory', 1, '{A1,A2,A3,A4,B}'),
('4.1',   'Password Policy',                          'mandatory', 2, '{A1,A2,A3,A4,B}'),
('4.2',   'Multi-Factor Authentication',              'mandatory', 2, '{A1,A2,A3,A4,B}'),
('5.1',   'Logical Access Control',                   'mandatory', 2, '{A1,A2,A3,A4,B}'),
('5.2',   'Token Management',                         'mandatory', 2, '{A1,A2,A3,A4,B}'),
('5.3A',  'Personnel Vetting Process',                'advisory',  2, '{A1,A2,A3,A4,B}'),
('5.4',   'Physical & Logical Password Storage',      'mandatory', 2, '{A1,A2,A3,A4,B}'),
('6.1',   'Malware Protection',                       'mandatory', 3, '{A1,A2,A3,A4,B}'),
('6.2',   'Software Integrity',                       'mandatory', 3, '{A1,A2,A3,A4}'),
('6.3',   'Database Integrity',                       'mandatory', 3, '{A1,A2,A3}'),
('6.4',   'Logging and Monitoring',                   'mandatory', 3, '{A1,A2,A3,A4,B}'),
('6.5A',  'Intrusion Detection',                      'advisory',  3, '{A1,A2,A3,A4}'),
('7.1',   'Cyber Incident Response Planning',         'mandatory', 3, '{A1,A2,A3,A4,B}'),
('7.2',   'Security Training & Awareness',            'mandatory', 3, '{A1,A2,A3,A4,B}'),
('7.3A',  'Penetration Testing',                      'advisory',  3, '{A1,A2,A3,A4,B}'),
('7.4A',  'Scenario Risk Assessment',                 'advisory',  3, '{A1,A2,A3,A4,B}')
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 4. canonical_evidence_items (53 rows)
-- ============================================================

-- Domain A (6 items)
INSERT INTO canonical_evidence_items (id, domain_id, sort_order, name, priority, evidence_type, description, reduction_note, control_count) VALUES
('A1', 'A', 1, 'Network Architecture Diagram',   'critical', 'Diagram + Text',     'Highest-reuse diagram. Single upload satisfies 6 controls.',                       '83% reduction — collected 6x without platform.',         6),
('A2', 'A', 2, 'SWIFT Component Inventory',       'critical', 'Spreadsheet',         'Complete hardware/software list within SWIFT secure zone.',                         'Single inventory satisfies 5 control areas.',            5),
('A3', 'A', 3, 'Data Flow Diagrams',              'high',     'Diagram + Matrix',    'All data flows between SWIFT, back-office, and external systems.',                  'One diagram covers 3 data flow controls. 67% reduction.',3),
('A4', 'A', 4, 'Firewall Rule Sets',              'critical', 'Config Export',       'Firewall rule exports for every secure zone boundary.',                             'Single export satisfies 3 mandatory controls.',          3),
('A5', 'A', 5, 'Architecture Type Declaration',   'critical', 'Document + Form',     'SWIFT architecture type declaration with scoping rationale.',                       'Foundational scoping document for all control applicability.',2),
('A6', 'A', 6, 'Secure Zone Design Rationale',    'high',     'Document + Form',     'Zone boundary placement and segmentation rationale.',                               'Single rationale covers both 1.1 and 1.5. 50% reduction.',2)
ON CONFLICT (id) DO NOTHING;

-- Domain B (8 items)
INSERT INTO canonical_evidence_items (id, domain_id, sort_order, name, priority, evidence_type, description, reduction_note, control_count, per_system) VALUES
('B1', 'B', 1, 'OS Hardening Configuration',       'critical', 'Config/Screenshots', 'Per-system OS hardening evidence.',                                                 '50% reduction — serves both 1.2 and 2.3.',              2, true),
('B2', 'B', 2, 'SWIFT Application Security Config', 'critical', 'Config/SG Checklist','SWIFT application-level settings.',                                                 'Single config set covers 2.6 and 2.10. 50% reduction.', 2, false),
('B7', 'B', 3, 'MFA Configuration Evidence',        'critical', 'Config Screenshots', 'Per-access-point MFA evidence.',                                                    'Control-specific for 4.2.',                              1, false),
('B3', 'B', 4, 'Encryption Configuration',           'high',     'Config Exports',     'Highest-reuse in Domain B. 75% reduction.',                                         'One encryption config satisfies 4 data security controls.',4, false),
('B6', 'B', 5, 'Hardening Baseline Comparison',      'high',     'Scan Report',        'Formal CIS/SWIFT SG baseline comparison.',                                          '67% reduction — covers 3 hardening & integrity controls.',3, false),
('B5', 'B', 6, 'Password Policy Configuration',      'high',     'Policy + Config',    'Password policy settings across all SWIFT systems.',                                'Control-specific for 4.1.',                              1, false),
('B8', 'B', 7, 'Operator Session Security Config',   'high',     'Config Exports',     'Detailed session management evidence.',                                             'Supplements B2 for session controls.',                   1, false),
('B4', 'B', 8, 'Virtualisation/Cloud Platform Config','high',    'Config Exports',     'Conditional — only if virtualised SWIFT components exist.',                          'Advisory control 1.3.',                                  1, false)
ON CONFLICT (id) DO NOTHING;

-- Domain C (9 items)
INSERT INTO canonical_evidence_items (id, domain_id, sort_order, name, priority, evidence_type, description, reduction_note, control_count, per_quarter) VALUES
('C1', 'C', 1, 'Access Control Policy',             'critical', 'Policy Document',    'Highest-reuse policy. 80% reduction.',                                              'Covers 5 controls across 3 principles.',                 5, false),
('C2', 'C', 2, 'Privileged Account Inventory',      'critical', 'Spreadsheet/PAM',    'All privileged accounts across SWIFT systems.',                                     '50% reduction — serves both 1.2 and 5.1.',              2, false),
('C3', 'C', 3, 'User Access List',                  'high',     'System Export',       'All user accounts with role assignments.',                                           'Control-specific for 5.1.',                              1, false),
('C4', 'C', 4, 'RBAC Role Definitions',             'high',     'Config/Matrix',       'Formal role definitions with SoD matrix.',                                           'Control-specific for 5.1.',                              1, false),
('C5', 'C', 5, 'Quarterly Access Review Records',   'high',     'Review Docs',         '4 quarterly reviews with management sign-off.',                                     'Control-specific for 5.1.',                              1, true),
('C6', 'C', 6, 'Joiner/Mover/Leaver Process',       'medium',   'Process Doc + Logs', 'JML process with execution evidence.',                                               'Control-specific for 5.1.',                              1, false),
('C7', 'C', 7, 'Token/Certificate Inventory',        'high',     'Inventory/PKI',      'All tokens and certificates with lifecycle procedures.',                             'Control-specific for 5.2.',                              1, false),
('C8', 'C', 8, 'Credential Storage Evidence',        'high',     'Config/Vault',       'Secure credential storage evidence.',                                                'Control-specific for 5.4.',                              1, false),
('C9', 'C', 9, 'Personnel Vetting Records',          'medium',   'HR Documentation',   'Screening and vetting records.',                                                     'Advisory control 5.3A.',                                 1, false)
ON CONFLICT (id) DO NOTHING;

-- Domain D (6 items)
INSERT INTO canonical_evidence_items (id, domain_id, sort_order, name, priority, evidence_type, description, reduction_note, control_count, per_system) VALUES
('D1', 'D', 1, 'Patch Management Policy',           'high',     'Policy Document',    'Patch policy covering SWIFT systems.',                                               'Control-specific for 2.2.',                              1, false),
('D2', 'D', 2, 'Current Patch Levels',              'critical', 'Scan/WSUS Report',   'Current patch status for all SWIFT systems.',                                        'Control-specific for 2.2.',                              1, true),
('D3', 'D', 3, 'Patch Deployment Records (12mo)',   'high',     'Deployment Logs',    '12-month patch deployment history.',                                                 'Control-specific for 2.2.',                              1, false),
('D4', 'D', 4, 'Vulnerability Scan Reports',        'critical', 'Scanner Output',     'Vulnerability scan results for all SWIFT systems.',                                  'Control-specific for 2.7.',                              1, false),
('D5', 'D', 5, 'Vulnerability Remediation Tracking','high',     'Tracking Log',       'Remediation tracker for scans and pen tests.',                                       '50% reduction — covers 2.7 and 7.3A.',                  2, false),
('D6', 'D', 6, 'Penetration Test Reports',          'high',     'Pen Test Report',    'Annual pen test covering SWIFT infrastructure.',                                     'Advisory control 7.3A.',                                 1, false)
ON CONFLICT (id) DO NOTHING;

-- Domain E (7 items)
INSERT INTO canonical_evidence_items (id, domain_id, sort_order, name, priority, evidence_type, description, reduction_note, control_count, per_system) VALUES
('E1', 'E', 1, 'Anti-Malware Config & Updates',     'critical', 'Config/Console Export','AV config for all SWIFT Windows systems.',                                          'Control-specific for 6.1.',                              1, true),
('E4', 'E', 2, 'Software Integrity Verification',   'high',     'Integrity/FIM Reports','SWIFT software integrity checks.',                                                  '50% reduction — serves 6.2 and 2.10.',                  2, false),
('E5', 'E', 3, 'Database Integrity Evidence',        'high',     'Integrity/Audit Logs','Database integrity controls for SWIFT DBs.',                                         'Control-specific for 6.3.',                              1, false),
('E2', 'E', 4, 'SIEM/Logging Configuration',         'critical', 'SIEM Config Export',  'SIEM config, log architecture, retention.',                                          'Control-specific for 6.4.',                              1, false),
('E3', 'E', 5, 'Alert Rules & Escalation',           'high',     'Documentation',       'Alert rules, escalation, response procedures.',                                     '50% reduction — covers 6.4 and 6.5A.',                  2, false),
('E7', 'E', 6, 'Admin Activity Monitoring Logs',     'high',     'Log Extracts/SIEM',  'Admin/privileged activity monitoring.',                                              '67% reduction — serves 3 mandatory controls.',           3, false),
('E6', 'E', 7, 'IDS/IPS Configuration',              'medium',   'Config Export',       'IDS/IPS config for SWIFT segments.',                                                'Advisory control 6.5A.',                                 1, false)
ON CONFLICT (id) DO NOTHING;

-- Domain F (4 items)
INSERT INTO canonical_evidence_items (id, domain_id, sort_order, name, priority, evidence_type, description, reduction_note, control_count) VALUES
('F1', 'F', 1, 'Third-Party Vendor Inventory',      'critical', 'Spreadsheet',         'All third parties with SWIFT access.',                                               'Foundation for all Domain F evidence.',                  1),
('F2', 'F', 2, 'Third-Party SLA/NDA Agreements',    'high',     'Contract Excerpts',   'SLA and NDA per vendor.',                                                           'Per-vendor contractual evidence.',                       1),
('F3', 'F', 3, 'Third-Party Security Assessments',  'high',     'Assessment Reports',  'Risk assessments per vendor.',                                                       'Per-vendor risk assessment evidence.',                   1),
('F4', 'F', 4, 'Third-Party Ongoing Monitoring',    'high',     'SOC Reports/Audits',  'SOC reports, certification tracking, incident history.',                             'Per-vendor ongoing monitoring evidence.',                1)
ON CONFLICT (id) DO NOTHING;

-- Domain G (4 items)
INSERT INTO canonical_evidence_items (id, domain_id, sort_order, name, priority, evidence_type, description, reduction_note, control_count, per_system) VALUES
('G1', 'G', 1, 'Physical Access Controls',          'high',     'Access System Config','Physical access controls for SWIFT equipment areas.',                                'Per-zone evidence.',                                     1, false),
('G2', 'G', 2, 'Physical Access Logs (12mo)',        'high',     'Access Logs',         '12-month physical access logs.',                                                    'Per-zone time-series evidence.',                         1, false),
('G3', 'G', 3, 'Video Surveillance Evidence',        'medium',   'Surveillance Config', 'Camera placement, recording, retention.',                                            'Per-zone environmental monitoring.',                     1, false),
('G4', 'G', 4, 'Equipment Disposal Evidence',        'medium',   'Disposal Records',    'Secure disposal/sanitization procedures.',                                           'Equipment lifecycle evidence.',                          1, false)
ON CONFLICT (id) DO NOTHING;

-- Domain H (9 items)
INSERT INTO canonical_evidence_items (id, domain_id, sort_order, name, priority, evidence_type, description, reduction_note, control_count) VALUES
('H1', 'H', 1, 'Cyber Incident Response Plan',      'critical', 'IR Plan/Runbook',    'IR plan with SWIFT-specific scenarios.',                                             'Foundation for IR evidence.',                            1),
('H2', 'H', 2, 'IR Exercise Records',               'high',     'Exercise Records',   'Tabletop/functional exercise records.',                                              'Validates H1 plan effectiveness.',                       1),
('H3', 'H', 3, 'SWIFT ISAC Participation',           'medium',   'Registration/Alerts','ISAC registration and alert acknowledgments.',                                       'Information sharing compliance.',                        1),
('H4', 'H', 4, 'Security Training Program',          'high',     'Program Document',   'SWIFT security awareness training program.',                                         'Foundation for training evidence.',                      1),
('H5', 'H', 5, 'Training Completion Records',        'high',     'LMS Export',         'Training completions for all SWIFT personnel.',                                      'Execution evidence for H4.',                             1),
('H6', 'H', 6, 'Transaction Control Procedures',     'high',     'Process Docs',       'Transaction verification, dual auth, reconciliation.',                               'Business control procedures.',                           1),
('H7', 'H', 7, 'Transaction Monitoring Config',      'high',     'System Config',      'Monitoring rules, thresholds, alert samples.',                                       'Technical implementation of H6.',                        1),
('H8', 'H', 8, 'RMA Management Procedures',          'medium',   'Process Doc/Records','RMA due diligence and annual review.',                                               'Advisory control 2.11A.',                                1),
('H9', 'H', 9, 'Risk Assessment & Register',         'medium',   'Risk Docs/Register', 'SWIFT risk assessment and risk register.',                                           'Advisory control 7.4A.',                                 1)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 5. item_control_mappings (~90 rows from CONTROL_MATRIX)
-- ============================================================

-- Control 1.1 -> A1, A2, A4, A6, E7
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('A1', '1.1', true), ('A2', '1.1', false), ('A4', '1.1', false), ('A5', '1.1', false), ('A6', '1.1', false)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 1.2 -> B1, C1, C2, E7
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('B1', '1.2', true), ('C1', '1.2', false), ('C2', '1.2', false), ('E7', '1.2', false)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 1.3 -> A2, B4, C1
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('A2', '1.3', false), ('B4', '1.3', true), ('C1', '1.3', false)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 1.4 -> A1, A4
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('A1', '1.4', true), ('A4', '1.4', false)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 1.5 -> A1, A2, A4, A6
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('A1', '1.5', true), ('A2', '1.5', false), ('A4', '1.5', false), ('A5', '1.5', false), ('A6', '1.5', false)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 2.1 -> A1, A3, B3
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('A1', '2.1', false), ('A3', '2.1', true), ('B3', '2.1', false)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 2.2 -> D1, D2, D3
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('D1', '2.2', true), ('D2', '2.2', false), ('D3', '2.2', false)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 2.3 -> B1, B6
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('B1', '2.3', true), ('B6', '2.3', false)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 2.4A -> A1, A2, A3, B3
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('A1', '2.4A', false), ('A2', '2.4A', false), ('A3', '2.4A', true), ('B3', '2.4A', false)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 2.5A -> A1, A3, B3
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('A1', '2.5A', false), ('A3', '2.5A', true), ('B3', '2.5A', false)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 2.6 -> B2, B3, B8, C1
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('B2', '2.6', true), ('B3', '2.6', false), ('B8', '2.6', false), ('C1', '2.6', false)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 2.7 -> D4, D5
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('D4', '2.7', true), ('D5', '2.7', false)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 2.8 -> A2, F1, F2, F3, F4
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('A2', '2.8', false), ('F1', '2.8', true), ('F2', '2.8', false), ('F3', '2.8', false), ('F4', '2.8', false)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 2.9 -> H6, H7
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('H6', '2.9', true), ('H7', '2.9', false)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 2.10 -> B2, B6, E4
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('B2', '2.10', false), ('B6', '2.10', false), ('E4', '2.10', true)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 2.11A -> H8
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('H8', '2.11A', true)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 3.1 -> G1, G2, G3, G4
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('G1', '3.1', true), ('G2', '3.1', false), ('G3', '3.1', false), ('G4', '3.1', false)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 4.1 -> B5
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('B5', '4.1', true)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 4.2 -> B7, C1
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('B7', '4.2', true), ('C1', '4.2', false)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 5.1 -> C1, C2, C3, C4, C5, C6
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('C1', '5.1', true), ('C2', '5.1', false), ('C3', '5.1', false), ('C4', '5.1', false), ('C5', '5.1', false), ('C6', '5.1', false)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 5.2 -> C7
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('C7', '5.2', true)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 5.3A -> C9
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('C9', '5.3A', true)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 5.4 -> C8, E7
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('C8', '5.4', true), ('E7', '5.4', false)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 6.1 -> E1
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('E1', '6.1', true)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 6.2 -> B6, E4
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('B6', '6.2', false), ('E4', '6.2', true)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 6.3 -> E5
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('E5', '6.3', true)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 6.4 -> E2, E3, E7
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('E2', '6.4', true), ('E3', '6.4', false), ('E7', '6.4', false)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 6.5A -> E3, E6
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('E3', '6.5A', false), ('E6', '6.5A', true)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 7.1 -> H1, H2, H3
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('H1', '7.1', true), ('H2', '7.1', false), ('H3', '7.1', false)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 7.2 -> H4, H5
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('H4', '7.2', true), ('H5', '7.2', false)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 7.3A -> D5, D6
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('D5', '7.3A', false), ('D6', '7.3A', true)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Control 7.4A -> H9
INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary) VALUES
('H9', '7.4A', true)
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;


-- ============================================================
-- 6. cross_domain_dependencies (~8 rows)
-- ============================================================

INSERT INTO cross_domain_dependencies (source_item_id, target_item_id, dependency_type, description) VALUES
('A1', 'B3', 'validates',    'Network diagram validates encryption placement'),
('A2', 'F1', 'validates',    'Component inventory validates vendor access scope'),
('B1', 'C2', 'validates',    'OS hardening validates privileged account lockdown'),
('C1', 'B7', 'validates',    'Access policy validates MFA enforcement'),
('E2', 'E3', 'supplements',  'SIEM config supplements alert rule definitions'),
('E7', 'C2', 'validates',    'Admin monitoring validates privileged account inventory'),
('H1', 'H2', 'supplements',  'IR plan supplements exercise records'),
('H4', 'H5', 'supplements',  'Training program supplements completion records')
ON CONFLICT (source_item_id, target_item_id) DO NOTHING;

-- ============================================================
-- 7. Evidence Description, Sufficiency Definition, Evaluation Criteria
-- Populates the three rich-text columns on canonical_evidence_items
-- ============================================================

-- Domain A
UPDATE canonical_evidence_items SET
  evidence_description   = $$Comprehensive network topology showing SWIFT secure zone boundaries, all ingress/egress points, firewall placement, system locations, and connectivity to back-office and external networks.$$,
  sufficiency_definition = $$Must show: (1) Secure zone boundary with all entry/exit points labeled, (2) Firewall placement at every boundary, (3) All SWIFT systems identified by name/IP within zone, (4) Data flow direction arrows with protocols, (5) Customer connector zones (if A1), (6) Back-office connection paths.$$,
  evaluation_criteria    = $$Reviewer checks: Zone boundaries clearly defined? Firewalls at all ingress/egress? All SWIFT components visible? No direct internet path? Data flow annotations present? Diagram dated within 12 months?$$
WHERE id = 'A1';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Complete list of all hardware and software within the SWIFT secure zone: servers, VMs, operator PCs, network devices, connectors. Includes hostname, IP, OS, function, owner, and third-party management flags.$$,
  sufficiency_definition = $$Must include per system: (1) Hostname + IP, (2) OS version, (3) Function (messaging interface, communication interface, operator PC, etc.), (4) Physical/virtual indicator, (5) Third-party managed flag, (6) Zone placement.$$,
  evaluation_criteria    = $$Reviewer checks: All systems from network diagram accounted for? VM/host mapping present? Third-party flags populated? No gaps in mandatory fields? Consistent with architecture type declaration?$$
WHERE id = 'A2';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Diagrams showing all data flows between SWIFT components and back-office systems, including direction, protocol, encryption method, and bridging server identification.$$,
  sufficiency_definition = $$Must show per flow: (1) Source and destination systems, (2) Direction (uni/bidirectional), (3) Protocol (MQ, SFTP, API, etc.), (4) Encryption method (TLS version, cipher suite), (5) Whether flow crosses zone boundary, (6) Bridging server identification for back-office flows.$$,
  evaluation_criteria    = $$Reviewer checks: All flows from network diagram accounted for? Encryption annotated for every zone-crossing flow? Back-office first hops identified? External transmission paths shown?$$
WHERE id = 'A3';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Complete firewall rule exports for every boundary of the SWIFT secure zone, including rules between secure zone and general IT, secure zone and internet, and customer connector zones.$$,
  sufficiency_definition = $$Must demonstrate: (1) Deny-by-default posture at all boundaries, (2) Only explicitly permitted traffic with justification, (3) No direct internet connectivity from secure zone, (4) Direction (inbound/outbound) per rule, (5) Any exception rules documented with business justification.$$,
  evaluation_criteria    = $$Reviewer checks: Deny-all default present? No overly permissive rules (any/any)? Internet access explicitly blocked? Customer connector segmentation rules present (if A1)? Rule set dated within assessment period?$$
WHERE id = 'A4';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Formal declaration of which SWIFT architecture type applies to the organization, with supporting rationale. This is the foundational scoping document that determines which of the 32 controls are applicable.$$,
  sufficiency_definition = $$Must include: (1) Selected architecture type with justification, (2) Description of SWIFT infrastructure matching the architecture, (3) List of all SWIFT-related components, (4) Identification of any hybrid setups, (5) Confirmation of component ownership model.$$,
  evaluation_criteria    = $$Reviewer checks: Architecture type matches actual infrastructure? All SWIFT components accounted for? Justification aligns with SWIFT architecture decision tree? Ownership model clear?$$
WHERE id = 'A5';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Written rationale explaining why the specific secure zone boundaries were drawn, referencing SWIFT Security Guidance, and justifying the segmentation approach for both the main secure zone and any customer connector zones.$$,
  sufficiency_definition = $$Must explain: (1) Why boundaries are placed where they are, (2) Reference to SWIFT Security Guidance, (3) Risk-based justification for segmentation approach, (4) Customer connector zone rationale (if A1), (5) Any deviations from SWIFT recommendations with compensating controls.$$,
  evaluation_criteria    = $$Reviewer checks: References SWIFT Security Guidance? Covers both main zone and customer connector zone? Rationale is specific (not generic boilerplate)? Deviations documented?$$
WHERE id = 'A6';

-- Domain B
UPDATE canonical_evidence_items SET
  evidence_description   = $$Operating system hardening evidence for each SWIFT system: privileged account settings, service configurations, USB restrictions, CIS/SWIFT SG baseline compliance.$$,
  sufficiency_definition = $$Must show per system: (1) Privileged account list with restriction evidence, (2) Unnecessary services disabled, (3) USB/removable media restrictions, (4) CIS or SWIFT SG baseline applied, (5) Privilege elevation controls (sudo/UAC config).$$,
  evaluation_criteria    = $$Reviewer checks: All SWIFT systems covered? CIS/SWIFT SG baseline referenced? Privileged accounts justified? Unnecessary services documented as disabled? Evidence per-system, not generic?$$
WHERE id = 'B1';

UPDATE canonical_evidence_items SET
  evidence_description   = $$SWIFT application-level security settings: session encryption, GUI access controls, session timeouts, application whitelisting, and hardening per SWIFT Security Guidance.$$,
  sufficiency_definition = $$Must show: (1) Encrypted session config (TLS/SSH) for operator connections, (2) GUI access security settings, (3) Session timeout configuration, (4) Application whitelisting evidence, (5) Hardening per SWIFT Security Guidance.$$,
  evaluation_criteria    = $$Reviewer checks: TLS 1.2+ for operator sessions? Session timeouts configured? Application whitelisting active? SWIFT Security Guidance checklist completed? All SWIFT applications covered?$$
WHERE id = 'B2';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Encryption settings for all SWIFT-related communications: TLS versions, cipher suites, certificate management, and at-rest encryption for stored SWIFT data.$$,
  sufficiency_definition = $$Must show: (1) TLS version per connection type (minimum 1.2), (2) Cipher suite selection, (3) Certificate management evidence, (4) At-rest encryption for backups/archives, (5) Encryption config per data flow (matching A3 diagram).$$,
  evaluation_criteria    = $$Reviewer checks: TLS 1.2+ everywhere? Strong cipher suites only? Certificates valid and not expired? At-rest encryption for data outside secure zone? Config matches data flow diagram?$$
WHERE id = 'B3';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Hypervisor or cloud platform security settings showing SWIFT VM isolation, platform hardening, and administrative access controls for the virtualisation layer.$$,
  sufficiency_definition = $$Must show: (1) SWIFT VMs separated from non-SWIFT workloads, (2) Hypervisor/cloud platform hardened, (3) Platform admin access restricted and logged, (4) VM escape protections, (5) Resource isolation configuration.$$,
  evaluation_criteria    = $$Reviewer checks: SWIFT VMs isolated? Platform admin accounts restricted? Hardening documentation present? No shared resources with non-SWIFT workloads?$$
WHERE id = 'B4';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Password policy settings enforced across all SWIFT systems: length, complexity, expiry, lockout thresholds, and history requirements.$$,
  sufficiency_definition = $$Must show per system type: (1) Minimum length (≥10 chars recommended), (2) Complexity requirements, (3) Maximum validity period, (4) Account lockout after failed attempts, (5) Password history enforcement, (6) Token/device PIN requirements.$$,
  evaluation_criteria    = $$Reviewer checks: Policy enforced (not just documented)? All SWIFT system types covered? Lockout thresholds reasonable? Aligns with SWIFT guidance? Token PINs included?$$
WHERE id = 'B5';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Formal comparison of current system and application configuration against CIS benchmarks and/or SWIFT Security Guidance baselines, with deviations documented and justified.$$,
  sufficiency_definition = $$Must show: (1) Baseline standard used (CIS, SWIFT SG), (2) Per-system compliance score, (3) Deviations listed with justification, (4) Application integrity verification results, (5) Authorized software list.$$,
  evaluation_criteria    = $$Reviewer checks: Recognized baseline used? All SWIFT systems scanned? Deviations justified (not just listed)? Application integrity verified? Software whitelist current?$$
WHERE id = 'B6';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Multi-factor authentication configuration for all access points to SWIFT infrastructure: operator access, admin access, remote access, and sensitive operations.$$,
  sufficiency_definition = $$Must show: (1) MFA enforced for all interactive access to SWIFT systems, (2) MFA types used (hardware token, software token, biometric), (3) Coverage of all access points (operator PCs, jump servers, remote), (4) Fallback/break-glass procedures, (5) Same-device risk assessment if applicable.$$,
  evaluation_criteria    = $$Reviewer checks: All access points covered? MFA enforced (not optional)? Supported MFA types appropriate? Break-glass documented? Same-device considerations addressed per NIST SP 800-63B?$$
WHERE id = 'B7';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Detailed session management configuration for SWIFT operator connections: session encryption, timeout settings, concurrent session limits, and session recording.$$,
  sufficiency_definition = $$Must show: (1) TLS/SSH encryption for all operator sessions, (2) Session timeout configuration, (3) Concurrent session controls, (4) Jump server session management (if used), (5) Session logging/recording evidence.$$,
  evaluation_criteria    = $$Reviewer checks: All operator connection types encrypted? Timeouts enforced? Jump server properly configured? Session logs retained?$$
WHERE id = 'B8';

-- Domain C
UPDATE canonical_evidence_items SET
  evidence_description   = $$Organization''s access control policy covering SWIFT infrastructure: RBAC model, privileged access rules, MFA requirements, session management, joiner/mover/leaver procedures, and quarterly review mandates.$$,
  sufficiency_definition = $$Must include: (1) RBAC model with role definitions, (2) Privileged access governance, (3) MFA requirements for all SWIFT access, (4) Session management rules, (5) Quarterly access review mandate, (6) JML process, (7) Least privilege and separation of duties principles.$$,
  evaluation_criteria    = $$Reviewer checks: Covers all 5 controls'' requirements? RBAC model specific to SWIFT? JML process documented? Review frequency stated? Separation of duties addressed? Dated and approved?$$
WHERE id = 'C1';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Complete list of all privileged/admin accounts across all SWIFT systems with justification for each, usage evidence, and last review date.$$,
  sufficiency_definition = $$Must include per account: (1) Account name and system, (2) Privilege level, (3) Assigned person/team, (4) Business justification, (5) Last review date, (6) Usage evidence (last login), (7) Status (active/disabled).$$,
  evaluation_criteria    = $$Reviewer checks: All SWIFT systems represented? Each account justified? Stale accounts identified? Review dates within 90 days? Consistent with B1 OS hardening evidence?$$
WHERE id = 'C2';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Complete list of all user accounts (privileged and non-privileged) on SWIFT systems, with role assignments and access permissions.$$,
  sufficiency_definition = $$Must include per account: (1) Username, (2) System/application, (3) Assigned role(s), (4) Permissions summary, (5) Department/team, (6) Account creation date, (7) Last login date.$$,
  evaluation_criteria    = $$Reviewer checks: All systems covered? Roles align with RBAC model from C1? No orphaned accounts? Permissions align with job functions?$$
WHERE id = 'C3';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Formal definition of all SWIFT-related roles with permissions, separation of duties rules, and mapping of users to roles.$$,
  sufficiency_definition = $$Must show: (1) Each role with defined permissions, (2) Separation of duties matrix (who cannot hold which role combinations), (3) User-to-role assignment, (4) Role approval workflow, (5) Maker-checker enforcement for transactions.$$,
  evaluation_criteria    = $$Reviewer checks: Roles match actual system permissions? Separation of duties enforced? Maker-checker in place? No excessive role accumulation?$$
WHERE id = 'C4';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Evidence of regular (at least quarterly) access reviews for all SWIFT system accounts, including reviewer identity, findings, and remediation actions.$$,
  sufficiency_definition = $$Must show: (1) Review date and reviewer, (2) Scope (all SWIFT systems), (3) Findings (excessive access, stale accounts), (4) Remediation actions taken, (5) Sign-off by management, (6) Minimum 4 reviews in 12-month period.$$,
  evaluation_criteria    = $$Reviewer checks: Reviews conducted quarterly? All systems in scope? Findings acted upon? Management sign-off present? Access removed for leavers?$$
WHERE id = 'C5';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Documented process for managing SWIFT access when staff join, move roles, or leave the organization, with evidence of execution.$$,
  sufficiency_definition = $$Must show: (1) Documented JML process, (2) Trigger mechanism (HR notification), (3) Timeliness SLAs, (4) Sample evidence of execution (recent joiners/leavers), (5) Escalation for overdue actions.$$,
  evaluation_criteria    = $$Reviewer checks: Process documented and approved? Triggered by HR events? Timeliness tracked? Evidence of actual execution? Covers all SWIFT systems?$$
WHERE id = 'C6';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Inventory of all hardware/software tokens and certificates used for SWIFT operations, with lifecycle management procedures (issuance, renewal, revocation).$$,
  sufficiency_definition = $$Must include: (1) Token/cert inventory with assignment, (2) Issuance/distribution process, (3) Annual review evidence, (4) Revocation process for leavers, (5) Secure storage requirements, (6) PED key management (if HSM used), (7) Software token management.$$,
  evaluation_criteria    = $$Reviewer checks: All tokens accounted for? Annual review completed? Revocation for leavers confirmed? Storage requirements met? PED keys properly managed?$$
WHERE id = 'C7';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Evidence that passwords and credentials for SWIFT systems are stored securely: encrypted at rest, access-controlled, no plaintext storage, and access logged.$$,
  sufficiency_definition = $$Must show: (1) No plaintext password storage, (2) Encryption-at-rest for stored credentials, (3) Authenticated access to credential store, (4) Access logging for credential retrieval, (5) Physical passwords in sealed envelopes in safe, (6) Emergency access procedure with password change.$$,
  evaluation_criteria    = $$Reviewer checks: No plaintext anywhere? Vault/HSM properly configured? Access logging active? Physical password storage secure? Emergency procedures documented?$$
WHERE id = 'C8';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Background check policy and execution records for staff with operational access to SWIFT systems, including initial screening and periodic re-vetting.$$,
  sufficiency_definition = $$Must include: (1) Screening policy document, (2) Evidence of pre-employment checks for SWIFT operators, (3) Periodic re-vetting schedule, (4) Coverage scope (employees, contractors, consultants), (5) Process for identified concerns.$$,
  evaluation_criteria    = $$Reviewer checks: Policy exists and is approved? Covers all SWIFT-access personnel? Pre-employment and periodic checks both addressed? Contractor coverage?$$
WHERE id = 'C9';

-- Domain D
UPDATE canonical_evidence_items SET
  evidence_description   = $$Documented patch management policy covering SWIFT systems: update frequency, testing procedures, rollback plans, and emergency patching process.$$,
  sufficiency_definition = $$Must include: (1) Patch frequency (at minimum monthly review), (2) Testing requirements before deployment, (3) Rollback procedures, (4) Emergency/critical patch process, (5) Scope coverage (all SWIFT systems), (6) Vendor support lifecycle requirements.$$,
  evaluation_criteria    = $$Reviewer checks: Policy approved and current? Covers all system types? Testing mandated? Emergency process defined? Vendor support requirements stated?$$
WHERE id = 'D1';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Current patch status for all SWIFT systems showing installed patches, missing patches, and vendor support status for all software and hardware.$$,
  sufficiency_definition = $$Must show per system: (1) OS patch level (date of last update), (2) Application patch level, (3) Missing critical/security patches, (4) Vendor support status (supported/EOL), (5) Maintenance contract status.$$,
  evaluation_criteria    = $$Reviewer checks: All SWIFT systems scanned? Critical patches applied within policy timeframe? No EOL software? Maintenance contracts current?$$
WHERE id = 'D2';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Historical patch deployment records for the past 12 months showing regular patching cadence and timely application of security updates.$$,
  sufficiency_definition = $$Must show: (1) Monthly deployment records, (2) Time from patch release to deployment, (3) Testing records before production deployment, (4) Failed deployments and rollbacks, (5) Coverage across all SWIFT systems.$$,
  evaluation_criteria    = $$Reviewer checks: Regular cadence maintained? Critical patches applied within 30 days? Testing evidence present? All systems covered?$$
WHERE id = 'D3';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Vulnerability scan results for all SWIFT systems from the most recent quarter, including severity ratings, identified vulnerabilities, and scanner configuration.$$,
  sufficiency_definition = $$Must show: (1) All SWIFT systems in scan scope, (2) Scanner tool and version, (3) Scan date(s) within last quarter, (4) Findings by severity (critical/high/medium/low), (5) Scanner configuration covering both OS and application layers.$$,
  evaluation_criteria    = $$Reviewer checks: All SWIFT systems scanned? Up-to-date scanner used? Both OS and app layers covered? Scan within last 90 days?$$
WHERE id = 'D4';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Tracking log for all identified vulnerabilities (from scans and pen tests) showing severity, owner, remediation timeline, status, and evidence of resolution.$$,
  sufficiency_definition = $$Must include per finding: (1) Vulnerability ID, (2) Severity rating, (3) Affected system(s), (4) Remediation owner, (5) Target date, (6) Actual resolution date, (7) Verification evidence, (8) Risk acceptance (if deferred).$$,
  evaluation_criteria    = $$Reviewer checks: All scan and pen test findings tracked? Critical findings resolved timely? Overdue items escalated? Verification evidence for closed items?$$
WHERE id = 'D5';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Penetration test reports covering SWIFT infrastructure: scope, methodology, findings, severity ratings, and retest evidence for resolved findings.$$,
  sufficiency_definition = $$Must include: (1) Scope covering SWIFT secure zone, (2) Methodology (OWASP, PTES, etc.), (3) Findings with severity, (4) Exploitation evidence, (5) Remediation recommendations, (6) Retest results for previously identified issues.$$,
  evaluation_criteria    = $$Reviewer checks: SWIFT infrastructure in scope? Qualified tester? Methodology documented? Findings severity-rated? Retesting performed?$$
WHERE id = 'D6';

-- Domain E
UPDATE canonical_evidence_items SET
  evidence_description   = $$Anti-malware software configuration for all SWIFT Windows systems: product details, definition update frequency, scan schedules, and exclusion documentation.$$,
  sufficiency_definition = $$Must show: (1) AV product and version on each system, (2) Definition update frequency (at least daily), (3) Real-time scanning enabled, (4) Scheduled full scan configuration, (5) Any exclusions documented with justification, (6) Centralized management evidence.$$,
  evaluation_criteria    = $$Reviewer checks: All Windows SWIFT systems covered? Definitions current? Real-time enabled? Exclusions justified? Centrally managed?$$
WHERE id = 'E1';

UPDATE canonical_evidence_items SET
  evidence_description   = $$SIEM or centralized logging configuration showing which SWIFT systems and events are monitored, log retention periods, and alert configuration.$$,
  sufficiency_definition = $$Must show: (1) All SWIFT systems sending logs to SIEM, (2) Event types captured (auth, admin, transaction, system), (3) Log retention period (minimum 6 months, recommended 13 months), (4) Log integrity protection, (5) Regular log review process.$$,
  evaluation_criteria    = $$Reviewer checks: All SWIFT systems covered? All required event types captured? Retention meets minimum? Integrity protection active? Review process documented?$$
WHERE id = 'E2';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Defined alert rules for security events on SWIFT systems, escalation procedures, and response workflows for different alert severities.$$,
  sufficiency_definition = $$Must show: (1) Alert rules for SWIFT-specific events (failed logins, privilege escalation, unusual transactions), (2) Escalation matrix with contacts, (3) Response procedures per alert type, (4) Evidence of regular alert review, (5) IDS/IPS rules for SWIFT network segments (if 6.5A).$$,
  evaluation_criteria    = $$Reviewer checks: SWIFT-specific alerts defined? Escalation matrix current? Response procedures actionable? IDS/IPS rules documented (advisory)?$$
WHERE id = 'E3';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Software integrity verification for SWIFT applications: baseline integrity checks, change detection monitoring, authorized software list, and verification against SWIFT-approved versions.$$,
  sufficiency_definition = $$Must show: (1) Integrity verification process for SWIFT software, (2) Baseline check results, (3) Change detection/monitoring active, (4) Authorized software list maintained, (5) Verification that installed software matches SWIFT-approved versions.$$,
  evaluation_criteria    = $$Reviewer checks: Integrity checks performed regularly? Baseline established? Change detection active? Unauthorized software identified? Matches SWIFT versions?$$
WHERE id = 'E4';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Evidence of database integrity controls for SWIFT transaction databases: integrity verification, access controls, change detection, and audit logging.$$,
  sufficiency_definition = $$Must show: (1) Database integrity verification process, (2) Database access controls (limited to authorized accounts), (3) Change detection/audit trail active, (4) Backup integrity verified, (5) No direct database modification outside application.$$,
  evaluation_criteria    = $$Reviewer checks: Integrity checks active? Access restricted? Audit trail present? Backup integrity verified? Direct modification prevented?$$
WHERE id = 'E5';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Intrusion detection/prevention system configuration for SWIFT network segments: detection rules, alert configuration, and response procedures.$$,
  sufficiency_definition = $$Must show: (1) IDS/IPS deployed on SWIFT network segments, (2) Detection signatures/rules current, (3) Alert integration with SIEM/SOC, (4) Response procedures for IDS alerts, (5) Regular signature updates.$$,
  evaluation_criteria    = $$Reviewer checks: Covers SWIFT network segments? Signatures current? Integrated with monitoring? Response procedures defined?$$
WHERE id = 'E6';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Logs showing monitoring of administrative/privileged activity on SWIFT systems: login events, privilege escalation, configuration changes, and credential access.$$,
  sufficiency_definition = $$Must show: (1) Admin login events captured, (2) Privilege escalation logged, (3) Configuration changes tracked, (4) Credential store access logged, (5) Unusual admin activity flagged.$$,
  evaluation_criteria    = $$Reviewer checks: All admin actions logged? Privilege escalation tracked? Config changes auditable? Credential access logged? Alerts for unusual activity?$$
WHERE id = 'E7';

-- Domain F
UPDATE canonical_evidence_items SET
  evidence_description   = $$Complete inventory of all third parties with access to or management of SWIFT-related components, including service bureaus, cloud providers, and IT outsourcers.$$,
  sufficiency_definition = $$Must include per vendor: (1) Vendor name and service description, (2) SWIFT components accessed/managed, (3) Access type (remote/on-site), (4) Contract dates, (5) SWIFT architecture implications, (6) Classification (outsourcing agent, connectivity provider, IT provider).$$,
  evaluation_criteria    = $$Reviewer checks: All third parties identified? SWIFT components mapped? Classification correct per SWIFT definitions? No missing vendors?$$
WHERE id = 'F1';

UPDATE canonical_evidence_items SET
  evidence_description   = $$SLA and NDA documentation for each third party managing SWIFT-related components, defining standard of care and confidentiality obligations.$$,
  sufficiency_definition = $$Must show per vendor: (1) SLA defining security standard of care, (2) NDA covering SWIFT-related data, (3) CSCF alignment requirements, (4) Incident notification obligations, (5) Right to audit clause.$$,
  evaluation_criteria    = $$Reviewer checks: SLA and NDA in place for each vendor? Security standards defined? CSCF alignment referenced? Incident notification included?$$
WHERE id = 'F2';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Security risk assessments for each third party managing SWIFT-related components: initial assessment and periodic reviews.$$,
  sufficiency_definition = $$Must include: (1) Risk assessment per vendor at engagement start, (2) Periodic review evidence (at least annual), (3) Assessment against Outsourcing Agents Security Requirements Baseline, (4) Comfort letters or certification evidence (SOC 2, ISO 27001, PCI DSS), (5) Identified risks and mitigations.$$,
  evaluation_criteria    = $$Reviewer checks: Assessment per vendor? Aligned with SWIFT Outsourcing Baseline? Certifications current? Risk mitigations documented?$$
WHERE id = 'F3';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Evidence of ongoing monitoring of third-party security posture: periodic SOC reports, audit findings, certification renewals, and incident tracking.$$,
  sufficiency_definition = $$Must show: (1) Current SOC 2 Type II or equivalent reports, (2) Annual review of vendor security posture, (3) Certification renewal tracking, (4) Incident history with vendor, (5) Action items from previous assessments.$$,
  evaluation_criteria    = $$Reviewer checks: SOC reports current? Annual reviews completed? Certifications valid? Incidents tracked? Previous findings resolved?$$
WHERE id = 'F4';

-- Domain G
UPDATE canonical_evidence_items SET
  evidence_description   = $$Physical access controls for areas housing SWIFT equipment: access control systems, authorized personnel lists, and visitor management.$$,
  sufficiency_definition = $$Must show: (1) Physical access control system (card reader, biometric) at data center/server room, (2) Authorized personnel list for SWIFT equipment areas, (3) Visitor management process, (4) Annual access list review, (5) Access revocation for role changes/leavers.$$,
  evaluation_criteria    = $$Reviewer checks: Access controls in place? Authorized list maintained? Visitors escorted? Annual review completed? Revocation timely?$$
WHERE id = 'G1';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Physical access logs for areas housing SWIFT equipment, retained for minimum 12 months, available for audit and investigation.$$,
  sufficiency_definition = $$Must show: (1) Access logs for all SWIFT equipment areas, (2) Minimum 12-month retention, (3) Logs available for audit, (4) Unusual access flagged, (5) Compliance with local privacy regulations for log retention.$$,
  evaluation_criteria    = $$Reviewer checks: Logs retained 12+ months? All entry points covered? Available for investigation? Privacy compliance?$$
WHERE id = 'G2';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Video surveillance configuration for areas housing SWIFT equipment: camera placement, recording configuration, and retention (ideally 3+ months).$$,
  sufficiency_definition = $$Must show: (1) Camera placement covering SWIFT equipment areas, (2) Motion detection and recording active, (3) Retention period (recommended 3+ months), (4) Compliance with applicable surveillance laws, (5) Access controls on surveillance footage.$$,
  evaluation_criteria    = $$Reviewer checks: SWIFT areas covered? Recording active? Retention adequate? Legal compliance? Footage access controlled?$$
WHERE id = 'G3';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Evidence of secure disposal or sanitization procedures for SWIFT equipment being decommissioned: data wiping, physical destruction, and chain of custody.$$,
  sufficiency_definition = $$Must show: (1) Disposal/sanitization process documented, (2) Evidence of execution for recent disposals, (3) Chain of custody maintained, (4) Data wiping/destruction certification, (5) Covers all storage media.$$,
  evaluation_criteria    = $$Reviewer checks: Process documented? Execution evidence present? Chain of custody maintained? Storage media addressed?$$
WHERE id = 'G4';

-- Domain H
UPDATE canonical_evidence_items SET
  evidence_description   = $$Documented incident response plan covering SWIFT-specific scenarios: detection, containment, eradication, recovery, and communication procedures.$$,
  sufficiency_definition = $$Must include: (1) SWIFT-specific incident scenarios, (2) Detection and triage procedures, (3) Containment and eradication steps, (4) Recovery procedures, (5) Communication plan (internal + SWIFT ISAC), (6) Roles and responsibilities, (7) Contact lists (internal + external).$$,
  evaluation_criteria    = $$Reviewer checks: SWIFT scenarios covered? All IR phases addressed? SWIFT ISAC notification included? Contact lists current? Roles defined?$$
WHERE id = 'H1';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Records of incident response exercises (tabletop or functional) covering SWIFT-related scenarios, including findings and improvements.$$,
  sufficiency_definition = $$Must show: (1) Exercise conducted within last 12 months, (2) SWIFT-related scenario(s) tested, (3) Participant list, (4) Findings and observations, (5) Lessons learned, (6) Improvement actions tracked.$$,
  evaluation_criteria    = $$Reviewer checks: Exercise within 12 months? SWIFT scenario included? Findings documented? Improvements tracked? Lessons incorporated into plan?$$
WHERE id = 'H2';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Evidence of participation in SWIFT Information Sharing and Analysis Centre (ISAC) for threat intelligence and incident reporting.$$,
  sufficiency_definition = $$Must show: (1) SWIFT ISAC registration/participation, (2) Alert receipt acknowledgments, (3) Designated point of contact, (4) Process for acting on ISAC alerts.$$,
  evaluation_criteria    = $$Reviewer checks: ISAC participation active? Alerts reviewed? Contact designated? Process for action?$$
WHERE id = 'H3';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Documented security awareness training program covering SWIFT-specific content: training curriculum, delivery method, frequency, and target audience.$$,
  sufficiency_definition = $$Must include: (1) Training program scope (all SWIFT-related personnel), (2) SWIFT-specific content topics, (3) Delivery frequency (at least annual), (4) Phishing simulation program (recommended), (5) New-hire training requirements.$$,
  evaluation_criteria    = $$Reviewer checks: SWIFT-specific content included? All relevant staff in scope? Annual minimum? Phishing simulations conducted?$$
WHERE id = 'H4';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Training completion records for all SWIFT-related personnel showing who completed training, when, and assessment results.$$,
  sufficiency_definition = $$Must show: (1) Completion records for all SWIFT personnel, (2) Completion dates within 12 months, (3) Pass/fail results (if assessment-based), (4) Non-compliance follow-up, (5) Phishing simulation results.$$,
  evaluation_criteria    = $$Reviewer checks: All SWIFT personnel completed? Within 12 months? Non-compliance addressed? Phishing results tracked?$$
WHERE id = 'H5';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Documented procedures for transaction business controls: verification, dual authorization, out-of-band confirmation, monitoring rules, and reconciliation processes.$$,
  sufficiency_definition = $$Must include: (1) Transaction verification procedures, (2) Dual authorization requirements, (3) Out-of-band confirmation processes, (4) Amount/currency/beneficiary monitoring rules, (5) End-of-day reconciliation process, (6) Exception handling procedures.$$,
  evaluation_criteria    = $$Reviewer checks: All control types documented? Dual authorization enforced? Monitoring rules defined? Reconciliation process active? Exception handling clear?$$
WHERE id = 'H6';

UPDATE canonical_evidence_items SET
  evidence_description   = $$Configuration evidence for transaction monitoring: system rules, thresholds, alert examples, and reconciliation execution records.$$,
  sufficiency_definition = $$Must show: (1) Monitoring rules configured (amounts, currencies, beneficiaries), (2) Threshold definitions, (3) Alert samples and response evidence, (4) Daily reconciliation execution records, (5) Session number tracking evidence.$$,
  evaluation_criteria    = $$Reviewer checks: Rules configured and active? Thresholds appropriate? Alerts acted upon? Reconciliation performed daily? Session tracking active?$$
WHERE id = 'H7';

UPDATE canonical_evidence_items SET
  evidence_description   = $$RMA relationship management procedures: due diligence process, annual review evidence, and procedure for adding/removing RMA authorizations.$$,
  sufficiency_definition = $$Must show: (1) RMA management procedures documented, (2) Due diligence for new relationships, (3) Annual review of existing RMA relationships, (4) Process for removing obsolete relationships, (5) Current RMA authorization list.$$,
  evaluation_criteria    = $$Reviewer checks: Procedures documented? Annual review completed? Obsolete relationships removed? Due diligence for new partners?$$
WHERE id = 'H8';

UPDATE canonical_evidence_items SET
  evidence_description   = $$SWIFT-specific risk assessment methodology and risk register: scenario analysis, risk ratings, treatment decisions, and residual risk acceptance.$$,
  sufficiency_definition = $$Must include: (1) Risk assessment methodology, (2) SWIFT-specific risk scenarios analyzed, (3) Risk register entries with severity ratings, (4) Risk treatment decisions (accept/mitigate/transfer/avoid), (5) Residual risk acceptance by management.$$,
  evaluation_criteria    = $$Reviewer checks: Methodology documented? SWIFT scenarios covered? Risks rated consistently? Treatment decisions documented? Management acceptance?$$
WHERE id = 'H9';

COMMIT;
