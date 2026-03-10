-- ============================================================
-- Seed evidence_domains and controls for swift_2026 (same as 2025, cscf_version 2026v).
-- Run after 13_swift_2026_schema.sql.
-- ============================================================

BEGIN;

SET search_path TO swift_2026, public;

INSERT INTO swift_2026.evidence_domains (id, name, color, accent_color, item_count, sort_order, cscf_version) VALUES
('A', 'Network & Architecture',      '#0F4C75', '#BBE1FA', 6,  1, '2026v'),
('B', 'System Hardening & Config',    '#1B5E20', '#C8E6C9', 8,  2, '2026v'),
('C', 'Access Management',            '#E65100', '#FFE0B2', 9,  3, '2026v'),
('D', 'Vulnerability & Patch Mgmt',   '#B71C1C', '#FFCDD2', 6,  4, '2026v'),
('E', 'Monitoring & Detection',       '#4A148C', '#E1BEE7', 7,  5, '2026v'),
('F', 'Third-Party & Outsourcing',    '#1565C0', '#BBDEFB', 4,  6, '2026v'),
('G', 'Physical Security',            '#F57F17', '#FFF9C4', 4,  7, '2026v'),
('H', 'Policies & Governance',        '#BF360C', '#FFCCBC', 9,  8, '2026v')
ON CONFLICT (id) DO NOTHING;

-- 2026: 2.4 is Mandatory (Back Office Data Flow Security).
-- 'ALL' is a synthetic control for ESM rows (e.g. A5 scoping) that apply to all 32 controls.
INSERT INTO swift_2026.controls (id, name, control_type, objective, architecture_applicability, cscf_version) VALUES
('ALL',   'All 32 Controls (Scoping)',               'mandatory', 1, '{A1,A2,A3,A4,B}', '2026v'),
('1.1',   'SWIFT Environment Protection',            'mandatory', 1, '{A1,A2,A3,A4}', '2026v'),
('1.2',   'OS Privileged Account Control',            'mandatory', 1, '{A1,A2,A3,A4,B}', '2026v'),
('1.3',   'Virtualisation/Cloud Protection',          'advisory',  1, '{A1,A2,A3,A4}', '2026v'),
('1.4',   'Restriction of Internet Access',           'mandatory', 1, '{A1,A2,A3,A4}', '2026v'),
('1.5',   'Customer Environment Protection',          'mandatory', 1, '{A1,A2,A3,A4}', '2026v'),
('2.1',   'Internal Data Flow Security',              'mandatory', 1, '{A1,A2,A3,A4}', '2026v'),
('2.2',   'Security Updates',                         'mandatory', 1, '{A1,A2,A3,A4,B}', '2026v'),
('2.3',   'System Hardening',                         'mandatory', 1, '{A1,A2,A3,A4,B}', '2026v'),
('2.4',   'Back Office Data Flow Security',          'mandatory', 1, '{A1,A2,A3,A4}', '2026v'),
('2.5A',  'External Transmission Data Protection',    'advisory',  1, '{A1,A2,A3,A4}', '2026v'),
('2.6',   'Operator Session Confidentiality',         'mandatory', 1, '{A1,A2,A3,A4,B}', '2026v'),
('2.7',   'Vulnerability Scanning',                   'mandatory', 1, '{A1,A2,A3,A4}', '2026v'),
('2.8',   'Outsourced Critical Activity Protection',  'mandatory', 1, '{A1,A2,A3,A4,B}', '2026v'),
('2.9',   'Transaction Business Controls',            'mandatory', 1, '{A1,A2,A3,A4,B}', '2026v'),
('2.10',  'Application Hardening',                    'mandatory', 1, '{A1,A2}', '2026v'),
('2.11A', 'RMA Business Controls',                    'advisory',  1, '{A1,A2,A3,B}', '2026v'),
('3.1',   'Physical Security',                        'mandatory', 1, '{A1,A2,A3,A4,B}', '2026v'),
('4.1',   'Password Policy',                          'mandatory', 2, '{A1,A2,A3,A4,B}', '2026v'),
('4.2',   'Multi-Factor Authentication',              'mandatory', 2, '{A1,A2,A3,A4,B}', '2026v'),
('5.1',   'Logical Access Control',                   'mandatory', 2, '{A1,A2,A3,A4,B}', '2026v'),
('5.2',   'Token Management',                         'mandatory', 2, '{A1,A2,A3,A4,B}', '2026v'),
('5.3A',  'Personnel Vetting Process',                'advisory',  2, '{A1,A2,A3,A4,B}', '2026v'),
('5.4',   'Physical & Logical Password Storage',      'mandatory', 2, '{A1,A2,A3,A4,B}', '2026v'),
('6.1',   'Malware Protection',                       'mandatory', 3, '{A1,A2,A3,A4,B}', '2026v'),
('6.2',   'Software Integrity',                       'mandatory', 3, '{A1,A2,A3,A4}', '2026v'),
('6.3',   'Database Integrity',                       'mandatory', 3, '{A1,A2,A3}', '2026v'),
('6.4',   'Logging and Monitoring',                   'mandatory', 3, '{A1,A2,A3,A4,B}', '2026v'),
('6.5A',  'Intrusion Detection',                      'advisory',  3, '{A1,A2,A3,A4}', '2026v'),
('7.1',   'Cyber Incident Response Planning',         'mandatory', 3, '{A1,A2,A3,A4,B}', '2026v'),
('7.2',   'Security Training & Awareness',             'mandatory', 3, '{A1,A2,A3,A4,B}', '2026v'),
('7.3A',  'Penetration Testing',                      'advisory',  3, '{A1,A2,A3,A4,B}', '2026v'),
('7.4A',  'Scenario Risk Assessment',                 'advisory',  3, '{A1,A2,A3,A4,B}', '2026v')
ON CONFLICT (id) DO NOTHING;

COMMIT;
