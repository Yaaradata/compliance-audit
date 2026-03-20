-- Mirror classification columns on swift_2025 for ORM compatibility (optional; safe if already present).
ALTER TABLE swift_2025.evidence_based_questions
  ADD COLUMN IF NOT EXISTS evidence_required_raw TEXT,
  ADD COLUMN IF NOT EXISTS evidence_source TEXT,
  ADD COLUMN IF NOT EXISTS collection_method TEXT,
  ADD COLUMN IF NOT EXISTS aws_auto_level TEXT,
  ADD COLUMN IF NOT EXISTS aws_services TEXT,
  ADD COLUMN IF NOT EXISTS question_level_aws_sources TEXT,
  ADD COLUMN IF NOT EXISTS reason_rationale TEXT;
