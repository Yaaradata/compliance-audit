-- ============================================================
-- SOC 2 — Alter evidence_sufficiency_matrix: sufficiency_criteria
-- and evaluation_criteria from TEXT to JSONB.
-- Run once if the table was created with TEXT columns (e.g. before
-- 03_soc2_full_schema was updated). New installs use JSONB in 03.
-- ============================================================

BEGIN;

SET search_path TO soc2, core, public;

-- Convert TEXT to JSONB: wrap existing content in {"text": "..."} so no data loss
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'soc2' AND table_name = 'evidence_sufficiency_matrix'
    AND column_name = 'sufficiency_criteria' AND data_type = 'text'
  ) THEN
    ALTER TABLE soc2.evidence_sufficiency_matrix
      ALTER COLUMN sufficiency_criteria TYPE JSONB
      USING jsonb_build_object('text', sufficiency_criteria);
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'soc2' AND table_name = 'evidence_sufficiency_matrix'
    AND column_name = 'evaluation_criteria' AND data_type = 'text'
  ) THEN
    ALTER TABLE soc2.evidence_sufficiency_matrix
      ALTER COLUMN evaluation_criteria TYPE JSONB
      USING jsonb_build_object('text', evaluation_criteria);
  END IF;
END $$;

COMMIT;
