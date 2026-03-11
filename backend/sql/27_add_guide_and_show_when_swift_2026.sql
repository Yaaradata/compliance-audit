-- Add guide and conditional visibility columns to evidence_based_questions (swift_2025 and swift_2026).
-- Run as: psql -U postgres -d compliance -f backend/sql/27_add_guide_and_show_when_swift_2026.sql

-- swift_2026
ALTER TABLE swift_2026.evidence_based_questions
  ADD COLUMN IF NOT EXISTS guide TEXT,
  ADD COLUMN IF NOT EXISTS show_when_question VARCHAR(100),
  ADD COLUMN IF NOT EXISTS show_when_values JSONB DEFAULT '[]';

-- swift_2025 (for model compatibility; columns nullable)
ALTER TABLE swift_2025.evidence_based_questions
  ADD COLUMN IF NOT EXISTS guide TEXT,
  ADD COLUMN IF NOT EXISTS show_when_question VARCHAR(100),
  ADD COLUMN IF NOT EXISTS show_when_values JSONB DEFAULT '[]';

-- Extend upload_label and accept to TEXT (CSV has values > 255 chars)
ALTER TABLE swift_2026.evidence_based_questions
  ALTER COLUMN upload_label TYPE TEXT,
  ALTER COLUMN accept TYPE TEXT;
ALTER TABLE swift_2025.evidence_based_questions
  ALTER COLUMN upload_label TYPE TEXT,
  ALTER COLUMN accept TYPE TEXT;
