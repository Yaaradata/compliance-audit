-- Migration: Evidence submission history for audit trail
-- Run: psql -U postgres -d compliance -f backend/sql/10_evidence_submission_history.sql
BEGIN;

SET search_path TO swift_2025;

CREATE TABLE IF NOT EXISTS evidence_submission_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES evidence_submissions(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  change_type VARCHAR(50) NOT NULL,
  snapshot_before JSONB,
  snapshot_after JSONB,
  justification TEXT
);

CREATE INDEX IF NOT EXISTS idx_evidence_submission_history_submission ON evidence_submission_history(submission_id);
CREATE INDEX IF NOT EXISTS idx_evidence_submission_history_changed_at ON evidence_submission_history(changed_at);

COMMIT;
