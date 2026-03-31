-- Denormalize cloud_provider onto evidence rows to avoid reading collector_runs
-- from high-traffic content endpoints (reduces deadlocks during parallel collects).

ALTER TABLE swift_2026.evidence ADD COLUMN IF NOT EXISTS cloud_provider VARCHAR(16) NULL;

UPDATE swift_2026.evidence e
SET cloud_provider = cr.cloud_provider
FROM swift_2026.collector_runs cr
WHERE e.run_id = cr.run_id
  AND (e.cloud_provider IS NULL OR e.cloud_provider = '');
