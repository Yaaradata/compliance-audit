-- Add ALL control and A5 scoping row to evidence_sufficiency_matrix for swift_2025 and swift_2026.
-- A5 "All 32 controls (scoping)" sufficiency and evaluation criteria come from DB.

BEGIN;
SET search_path TO swift_2025, core, public;

-- Add ALL control if not exists (swift_2025)
INSERT INTO swift_2025.controls (id, name, control_type, objective, architecture_applicability) VALUES
('ALL', 'All 32 Controls (Scoping)', 'mandatory', 1, '{A1,A2,A3,A4,B}')
ON CONFLICT (id) DO NOTHING;

-- A5 sufficiency: architecture declaration criteria
-- A5 evaluation: pass/fail/scoping criteria
INSERT INTO swift_2025.evidence_sufficiency_matrix (
  item_code, control_id, evidence_item_name, control_name, ma, evidence_type,
  sufficiency_criteria, evaluation_criteria, cscf_version
) VALUES (
  'A5', 'ALL', 'Architecture Type Declaration', 'All 32 Controls (Scoping)', 'M', 'Document + Form',
  '{"1": "Formal declaration of architecture type: A1, A2, A3, A4, or B", "2": "Decision rationale documented: why this architecture type applies", "3": "Key infrastructure characteristics supporting the declaration (A1: customer connector; A2: owns messaging/communication interface; A3: application at service provider via connector; A4: service provider without dedicated SWIFT component; B: exclusively SWIFT services through back-office applications)", "4": "SWIFT BIC(s) covered by this assessment listed", "5": "Changes from previous architecture type noted (if applicable)", "6": "Multiple architectures per institution flagged if applicable"}',
  '{"1": "Architecture type formally declared with rationale", "2": "BIC(s) listed for scope", "3": "Declaration matches actual infrastructure in A2", "4": "No formal declaration", "5": "Declared type contradicts component inventory (e.g., declared A4 but has messaging interface)", "6": "SCOPING IMPACT: Drives applicability of all 32 controls — validate before proceeding"}',
  '2025v'
) ON CONFLICT (item_code, control_id) DO UPDATE SET
  sufficiency_criteria = EXCLUDED.sufficiency_criteria,
  evaluation_criteria = EXCLUDED.evaluation_criteria;

COMMIT;

-- swift_2026: ALL control already exists from 14_seed_swift_2026_domains_controls.sql
-- Add A5,ALL row for 2026
BEGIN;
SET search_path TO swift_2026, core, public;

INSERT INTO swift_2026.evidence_sufficiency_matrix (
  item_code, control_id, evidence_item_name, control_name, ma, evidence_type,
  sufficiency_criteria, evaluation_criteria, cscf_version
) VALUES (
  'A5', 'ALL', 'Architecture Type Declaration', 'All 32 Controls (Scoping)', 'M', 'Document + Form',
  '{"1": "Formal declaration of architecture type: A1, A2, A3, A4, or B", "2": "Decision rationale documented: why this architecture type applies", "3": "Key infrastructure characteristics supporting the declaration (A1: customer connector; A2: owns messaging/communication interface; A3: application at service provider via connector; A4: service provider without dedicated SWIFT component; B: exclusively SWIFT services through back-office applications)", "4": "SWIFT BIC(s) covered by this assessment listed", "5": "Changes from previous architecture type noted (if applicable)", "6": "Multiple architectures per institution flagged if applicable"}',
  '{"1": "Architecture type formally declared with rationale", "2": "BIC(s) listed for scope", "3": "Declaration matches actual infrastructure in A2", "4": "No formal declaration", "5": "Declared type contradicts component inventory (e.g., declared A4 but has messaging interface)", "6": "SCOPING IMPACT: Drives applicability of all 32 controls — validate before proceeding"}',
  '2026v'
) ON CONFLICT (item_code, control_id) DO UPDATE SET
  sufficiency_criteria = EXCLUDED.sufficiency_criteria,
  evaluation_criteria = EXCLUDED.evaluation_criteria;

COMMIT;
