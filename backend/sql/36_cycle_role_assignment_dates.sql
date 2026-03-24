-- ============================================================
-- Add role start/end dates to cycle role assignments.
-- Run as: psql -U postgres -d compliance -f backend/sql/36_cycle_role_assignment_dates.sql
-- ============================================================

BEGIN;

ALTER TABLE core.cycle_role_assignments
  ADD COLUMN IF NOT EXISTS role_start_date DATE,
  ADD COLUMN IF NOT EXISTS role_end_date DATE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_role_assignment_date_range'
      AND conrelid = 'core.cycle_role_assignments'::regclass
  ) THEN
    ALTER TABLE core.cycle_role_assignments
      ADD CONSTRAINT chk_role_assignment_date_range CHECK (
        (role_start_date IS NULL AND role_end_date IS NULL) OR
        (role_start_date IS NOT NULL AND role_end_date IS NOT NULL AND role_end_date >= role_start_date)
      );
  END IF;
END $$;

COMMIT;
