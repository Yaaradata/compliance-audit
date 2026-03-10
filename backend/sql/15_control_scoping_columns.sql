-- ============================================================
-- Migration: Add control scoping decision columns to control_applicability.
-- Allows per-control: Applicable (default), Not applicable, Accept risk (with justification).
-- Run as: psql -U postgres -d compliance -f backend/sql/15_control_scoping_columns.sql
-- ============================================================

BEGIN;

-- swift_2025.control_applicability
ALTER TABLE swift_2025.control_applicability
  ADD COLUMN IF NOT EXISTS scoping_decision VARCHAR(20) NOT NULL DEFAULT 'applicable';
ALTER TABLE swift_2025.control_applicability
  ADD COLUMN IF NOT EXISTS scoping_justification_text TEXT;
ALTER TABLE swift_2025.control_applicability
  ADD COLUMN IF NOT EXISTS scoping_justification_file_path VARCHAR(500);
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ca_scoping_decision_check_2025'
    AND conrelid = 'swift_2025.control_applicability'::regclass
  ) THEN
    ALTER TABLE swift_2025.control_applicability
      ADD CONSTRAINT ca_scoping_decision_check_2025
      CHECK (scoping_decision IN ('applicable', 'not_applicable', 'risk_accepted'));
  END IF;
END $$;

-- swift_2026.control_applicability
ALTER TABLE swift_2026.control_applicability
  ADD COLUMN IF NOT EXISTS scoping_decision VARCHAR(20) NOT NULL DEFAULT 'applicable';
ALTER TABLE swift_2026.control_applicability
  ADD COLUMN IF NOT EXISTS scoping_justification_text TEXT;
ALTER TABLE swift_2026.control_applicability
  ADD COLUMN IF NOT EXISTS scoping_justification_file_path VARCHAR(500);
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ca_scoping_decision_check_2026'
    AND conrelid = 'swift_2026.control_applicability'::regclass
  ) THEN
    ALTER TABLE swift_2026.control_applicability
      ADD CONSTRAINT ca_scoping_decision_check_2026
      CHECK (scoping_decision IN ('applicable', 'not_applicable', 'risk_accepted'));
  END IF;
END $$;

COMMIT;
