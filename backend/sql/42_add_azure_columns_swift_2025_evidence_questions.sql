-- Azure enrichment columns for swift_2025.evidence_based_questions (parallel to swift_2026).
ALTER TABLE swift_2025.evidence_based_questions
  ADD COLUMN IF NOT EXISTS azure_auto_level TEXT,
  ADD COLUMN IF NOT EXISTS azure_services TEXT,
  ADD COLUMN IF NOT EXISTS question_level_azure_sources TEXT;
