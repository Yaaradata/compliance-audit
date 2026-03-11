-- Add cycle_user_assignments table for cycle-scoped access.
-- Users with it_sme, internal_reviewer_l1, internal_reviewer_l2, external_assessor
-- only see cycles they are assigned to.
-- Run as: psql -U postgres -d compliance -f backend/sql/20_cycle_user_assignments.sql

CREATE TABLE IF NOT EXISTS core.cycle_user_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID NOT NULL REFERENCES core.assessment_cycles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  UNIQUE(cycle_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_cycle_user_assignments_cycle ON core.cycle_user_assignments(cycle_id);
CREATE INDEX IF NOT EXISTS idx_cycle_user_assignments_user ON core.cycle_user_assignments(user_id);
