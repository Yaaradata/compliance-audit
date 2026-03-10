-- ============================================================
-- SWIFT 2025: Update controls from official architecture matrix
-- (Mandatory and Advisory Security Controls by Architecture Type)
-- Source: ref-docs/swift/2025/control_architecture_applicability_2025.json
-- Run after 02_seed_reference_data.sql (or equivalent swift_2025 controls seed).
-- 2025 uses 2.4A (advisory) only; no 2.4.
-- ============================================================

BEGIN;

SET search_path TO swift_2025, public;

-- Update name and architecture_applicability for each control per 2025 matrix
UPDATE swift_2025.controls SET name = 'Swift Environment Protection',            architecture_applicability = '{A1,A2,A3}' WHERE id = '1.1';
UPDATE swift_2025.controls SET name = 'Operating System Privileged Account Control', architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '1.2';
UPDATE swift_2025.controls SET name = 'Virtualisation or Cloud Platform Protection', architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '1.3';
UPDATE swift_2025.controls SET name = 'Restriction of Internet Access',           architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '1.4';
UPDATE swift_2025.controls SET name = 'Customer Environment Protection',          architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '1.5';

UPDATE swift_2025.controls SET name = 'Internal Data Flow Security',             architecture_applicability = '{A1,A2,A3}' WHERE id = '2.1';
UPDATE swift_2025.controls SET name = 'Security Updates',                        architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '2.2';
UPDATE swift_2025.controls SET name = 'System Hardening',                         architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '2.3';
UPDATE swift_2025.controls SET name = 'Back Office Data Flow Security',           architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '2.4A';
UPDATE swift_2025.controls SET name = 'External Transmission Data Protection',    architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '2.5A';
UPDATE swift_2025.controls SET name = 'Operator Session Confidentiality and Integrity', architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '2.6';
UPDATE swift_2025.controls SET name = 'Vulnerability Scanning',                   architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '2.7';
UPDATE swift_2025.controls SET name = 'Outsourced Critical Activity Protection', architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '2.8';
UPDATE swift_2025.controls SET name = 'Transaction Business Controls',           architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '2.9';
UPDATE swift_2025.controls SET name = 'Application Hardening',                    architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '2.10';
UPDATE swift_2025.controls SET name = 'RMA Business Controls',                   architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '2.11A';

UPDATE swift_2025.controls SET name = 'Physical Security',                        architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '3.1';

UPDATE swift_2025.controls SET name = 'Password Policy',                         architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '4.1';
UPDATE swift_2025.controls SET name = 'Multi-Factor Authentication',               architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '4.2';

UPDATE swift_2025.controls SET name = 'Logical Access Control',                  architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '5.1';
UPDATE swift_2025.controls SET name = 'Token Management',                         architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '5.2';
UPDATE swift_2025.controls SET name = 'Staff Screening Process',                 architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '5.3A';
UPDATE swift_2025.controls SET name = 'Password Repository Protection',           architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '5.4';

UPDATE swift_2025.controls SET name = 'Malware Protection',                      architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '6.1';
UPDATE swift_2025.controls SET name = 'Software Integrity',                       architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '6.2';
UPDATE swift_2025.controls SET name = 'Database Integrity',                      architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '6.3';
UPDATE swift_2025.controls SET name = 'Logging and Monitoring',                   architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '6.4';
UPDATE swift_2025.controls SET name = 'Intrusion Detection',                     architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '6.5A';

UPDATE swift_2025.controls SET name = 'Cyber Incident Response Planning',        architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '7.1';
UPDATE swift_2025.controls SET name = 'Security Training and Awareness',          architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '7.2';
UPDATE swift_2025.controls SET name = 'Penetration Testing',                      architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '7.3A';
UPDATE swift_2025.controls SET name = 'Scenario-based Risk Assessment',           architecture_applicability = '{A1,A2,A3,A4,B}' WHERE id = '7.4A';

COMMIT;
