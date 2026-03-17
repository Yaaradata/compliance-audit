-- Add response_json to swift_2026.evidence for storing JSON content in DB
ALTER TABLE swift_2026.evidence
ADD COLUMN IF NOT EXISTS response_json JSONB NULL;
