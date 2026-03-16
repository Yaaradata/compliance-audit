-- Add ended_at to collector_runs for In/Out time display (swift_2026)
ALTER TABLE swift_2026.collector_runs
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP NULL;

COMMENT ON COLUMN swift_2026.collector_runs.execution_time IS 'In time (run start)';
COMMENT ON COLUMN swift_2026.collector_runs.ended_at IS 'Out time (run end)';
