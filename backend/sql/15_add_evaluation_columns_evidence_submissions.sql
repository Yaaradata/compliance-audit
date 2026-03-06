-- Add evaluation_result, evaluation_edits, evaluation_remediation to evidence_submissions
-- in both swift_2025 and swift_2026. Run if dashboard/delete cycle fail with
-- "column evidence_submissions.evaluation_result does not exist".
--
-- Run: psql -U postgres -d compliance -f backend/sql/15_add_evaluation_columns_evidence_submissions.sql

-- swift_2025
ALTER TABLE swift_2025.evidence_submissions ADD COLUMN IF NOT EXISTS evaluation_result JSONB;
ALTER TABLE swift_2025.evidence_submissions ADD COLUMN IF NOT EXISTS evaluation_edits JSONB NOT NULL DEFAULT '{}';
ALTER TABLE swift_2025.evidence_submissions ADD COLUMN IF NOT EXISTS evaluation_remediation TEXT;

-- swift_2026 (idempotent; 13 may already define these)
ALTER TABLE swift_2026.evidence_submissions ADD COLUMN IF NOT EXISTS evaluation_result JSONB;
ALTER TABLE swift_2026.evidence_submissions ADD COLUMN IF NOT EXISTS evaluation_edits JSONB NOT NULL DEFAULT '{}';
ALTER TABLE swift_2026.evidence_submissions ADD COLUMN IF NOT EXISTS evaluation_remediation TEXT;
