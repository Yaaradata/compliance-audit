-- ============================================================
-- Add cycle_evidence_assignments for evidence item to IT SME assignment.
-- Assigns groups or users to evidence items (A1, A2, B1, etc.) for upload responsibility.
-- Only groups/users assigned as IT Expert for the cycle can be assigned.
-- Run as: psql -U postgres -d compliance -f backend/sql/32_cycle_evidence_assignments.sql
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS core.cycle_evidence_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID NOT NULL REFERENCES core.assessment_cycles(id) ON DELETE CASCADE,
  evidence_item_id VARCHAR(5) NOT NULL,
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('group', 'user')),
  group_name VARCHAR(255),
  user_id UUID REFERENCES core.users(id) ON DELETE CASCADE,
  evidence_start_date DATE,
  evidence_end_date DATE,
  CONSTRAINT chk_evidence_assignment_type CHECK (
    (assignment_type = 'group' AND group_name IS NOT NULL AND user_id IS NULL) OR
    (assignment_type = 'user' AND user_id IS NOT NULL AND group_name IS NULL)
  ),
  CONSTRAINT chk_evidence_assignment_date_range CHECK (
    (evidence_start_date IS NULL AND evidence_end_date IS NULL) OR
    (evidence_start_date IS NOT NULL AND evidence_end_date IS NOT NULL AND evidence_end_date >= evidence_start_date)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cycle_evidence_assignments_group
  ON core.cycle_evidence_assignments (cycle_id, evidence_item_id, group_name)
  WHERE group_name IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_cycle_evidence_assignments_user
  ON core.cycle_evidence_assignments (cycle_id, evidence_item_id, user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cycle_evidence_assignments_cycle ON core.cycle_evidence_assignments(cycle_id);
CREATE INDEX IF NOT EXISTS idx_cycle_evidence_assignments_item ON core.cycle_evidence_assignments(evidence_item_id);

COMMENT ON TABLE core.cycle_evidence_assignments IS 'Per-cycle evidence item to IT SME assignment. Only groups/users with it_sme role for this cycle can be assigned.';

COMMIT;
