-- Add classification columns from SWIFT_CSCF2026_Combined CSV
-- for exact column-level persistence in evidence_based_questions.
-- Run as:
--   psql -U postgres -d compliance -f backend/sql/37_add_evidence_question_classification_columns.sql

ALTER TABLE swift_2026.evidence_based_questions
  ADD COLUMN IF NOT EXISTS evidence_required_raw TEXT,
  ADD COLUMN IF NOT EXISTS evidence_source TEXT,
  ADD COLUMN IF NOT EXISTS collection_method TEXT,
  ADD COLUMN IF NOT EXISTS aws_auto_level TEXT,
  ADD COLUMN IF NOT EXISTS aws_services TEXT,
  ADD COLUMN IF NOT EXISTS question_level_aws_sources TEXT,
  ADD COLUMN IF NOT EXISTS reason_rationale TEXT;
