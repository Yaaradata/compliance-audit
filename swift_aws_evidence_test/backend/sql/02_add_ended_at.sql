-- Add ended_at to collector_runs for In/Out time display
ALTER TABLE swift_2025.collector_runs
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP NULL;

COMMENT ON COLUMN swift_2025.collector_runs.execution_time IS 'In time (run start)';
COMMENT ON COLUMN swift_2025.collector_runs.ended_at IS 'Out time (run end)';
