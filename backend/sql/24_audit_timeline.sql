-- Audit timeline: cycle end date + per-phase deadlines in both swift_2025 and swift_2026.
-- Run after core schema exists (e.g. after 12_core_schema_and_move_tables.sql).

-- 1. Add end_date to assessment_cycles (audit end date) in core
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'core' AND table_name = 'assessment_cycles' AND column_name = 'end_date'
  ) THEN
    ALTER TABLE core.assessment_cycles ADD COLUMN end_date DATE;
  END IF;
END $$;

-- 2. Create cycle_phase_deadlines in swift_2025 (one row per phase per cycle)
CREATE TABLE IF NOT EXISTS swift_2025.cycle_phase_deadlines (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id   UUID NOT NULL REFERENCES core.assessment_cycles(id) ON DELETE CASCADE,
  phase      VARCHAR(30) NOT NULL,
  start_at   TIMESTAMPTZ NOT NULL,
  end_at     TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_cpd_phase_2025 CHECK (phase IN ('evidence_upload', 'l1_review', 'l2_review', 'approval'))
);

CREATE INDEX IF NOT EXISTS idx_cpd_cycle_2025 ON swift_2025.cycle_phase_deadlines(cycle_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cpd_cycle_phase_2025 ON swift_2025.cycle_phase_deadlines(cycle_id, phase);

COMMENT ON TABLE swift_2025.cycle_phase_deadlines IS 'Per-phase start/end for notifications: evidence_upload, l1_review, l2_review, approval';

-- 3. Create cycle_phase_deadlines in swift_2026 (same structure)
CREATE TABLE IF NOT EXISTS swift_2026.cycle_phase_deadlines (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id   UUID NOT NULL REFERENCES core.assessment_cycles(id) ON DELETE CASCADE,
  phase      VARCHAR(30) NOT NULL,
  start_at   TIMESTAMPTZ NOT NULL,
  end_at     TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_cpd_phase_2026 CHECK (phase IN ('evidence_upload', 'l1_review', 'l2_review', 'approval'))
);

CREATE INDEX IF NOT EXISTS idx_cpd_cycle_2026 ON swift_2026.cycle_phase_deadlines(cycle_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cpd_cycle_phase_2026 ON swift_2026.cycle_phase_deadlines(cycle_id, phase);

COMMENT ON TABLE swift_2026.cycle_phase_deadlines IS 'Per-phase start/end for notifications: evidence_upload, l1_review, l2_review, approval';
