-- ============================================================
-- Add cycle_role_assignments for group-based role assignment per cycle.
-- Assigns groups or users to roles (it_sme, internal_reviewer_l1, internal_reviewer_l2, external_assessor).
-- Replaces 1:1 user-to-role model with group-based assignment.
-- Run as: psql -U postgres -d compliance -f backend/sql/31_cycle_role_assignments.sql
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS core.cycle_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID NOT NULL REFERENCES core.assessment_cycles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('it_sme', 'internal_reviewer_l1', 'internal_reviewer_l2', 'external_assessor')),
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('group', 'user')),
  group_name VARCHAR(255),
  user_id UUID REFERENCES core.users(id) ON DELETE CASCADE,
  role_start_date DATE,
  role_end_date DATE,
  CONSTRAINT chk_role_assignment_type CHECK (
    (assignment_type = 'group' AND group_name IS NOT NULL AND user_id IS NULL) OR
    (assignment_type = 'user' AND user_id IS NOT NULL AND group_name IS NULL)
  ),
  CONSTRAINT chk_role_assignment_date_range CHECK (
    (role_start_date IS NULL AND role_end_date IS NULL) OR
    (role_start_date IS NOT NULL AND role_end_date IS NOT NULL AND role_end_date >= role_start_date)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cycle_role_assignments_group
  ON core.cycle_role_assignments (cycle_id, role, group_name)
  WHERE group_name IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_cycle_role_assignments_user
  ON core.cycle_role_assignments (cycle_id, role, user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cycle_role_assignments_cycle ON core.cycle_role_assignments(cycle_id);
CREATE INDEX IF NOT EXISTS idx_cycle_role_assignments_user_id ON core.cycle_role_assignments(user_id);

COMMENT ON TABLE core.cycle_role_assignments IS 'Per-cycle role assignments. Groups or users assigned to roles. L3 (external_assessor) must use user_id of users with is_external=true.';

COMMIT;
