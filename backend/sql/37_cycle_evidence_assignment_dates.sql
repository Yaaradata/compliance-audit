-- ============================================================
-- Add evidence start/end dates to cycle evidence assignments.
-- Missing evidence dates should default from IT Expert role dates at API save time.
-- Run as: psql -U postgres -d compliance -f backend/sql/37_cycle_evidence_assignment_dates.sql
-- ============================================================

BEGIN;

ALTER TABLE core.cycle_evidence_assignments
  ADD COLUMN IF NOT EXISTS evidence_start_date DATE,
  ADD COLUMN IF NOT EXISTS evidence_end_date DATE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_evidence_assignment_date_range'
      AND conrelid = 'core.cycle_evidence_assignments'::regclass
  ) THEN
    ALTER TABLE core.cycle_evidence_assignments
      ADD CONSTRAINT chk_evidence_assignment_date_range CHECK (
        (evidence_start_date IS NULL AND evidence_end_date IS NULL) OR
        (evidence_start_date IS NOT NULL AND evidence_end_date IS NOT NULL AND evidence_end_date >= evidence_start_date)
      );
  END IF;
END $$;

COMMIT;
