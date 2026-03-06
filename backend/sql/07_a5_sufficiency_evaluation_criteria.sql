-- Migration: A5 Architecture Type Declaration — sufficiency and evaluation criteria
-- (aligned with UI and AI evaluation)
-- Run via: psql -U postgres -d compliance -f backend/sql/07_a5_sufficiency_evaluation_criteria.sql
BEGIN;

SET search_path TO swift_2025;

UPDATE canonical_evidence_items SET
  sufficiency_definition = $$• Formal declaration of architecture type: A1, A2, A3, A4, or B
• Decision rationale documented: why this architecture type applies
• Key infrastructure characteristics supporting the declaration:
  - A1: Has customer connector providing connectivity to service provider
  - A2: Owns messaging/communication interface within its environment
  - A3: Uses application running at service provider via connector
  - A4: Uses service provider without dedicated SWIFT component
  - B: Exclusively uses SWIFT services through back-office applications
• SWIFT BIC(s) covered by this assessment listed
• Changes from previous architecture type noted (if applicable)
• Multiple architectures per institution flagged if applicable$$,
  evaluation_criteria = $$• PASS: Architecture type formally declared with rationale
• PASS: BIC(s) listed for scope
• PASS: Declaration matches actual infrastructure in A2
• FAIL: No formal declaration
• FAIL: Declared type contradicts component inventory (e.g., declared A4 but has messaging interface)
• SCOPING IMPACT: Drives applicability of all 32 controls — validate before proceeding$$
WHERE id = 'A5';

COMMIT;
