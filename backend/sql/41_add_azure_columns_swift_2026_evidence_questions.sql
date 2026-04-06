-- Azure enrichment columns for evidence_based_questions (parallel to aws_* and gcs_*).
-- Run as: psql -U postgres -d compliance -f backend/sql/41_add_azure_columns_swift_2026_evidence_questions.sql

ALTER TABLE swift_2026.evidence_based_questions
  ADD COLUMN IF NOT EXISTS azure_auto_level TEXT,
  ADD COLUMN IF NOT EXISTS azure_services TEXT,
  ADD COLUMN IF NOT EXISTS question_level_azure_sources TEXT;
