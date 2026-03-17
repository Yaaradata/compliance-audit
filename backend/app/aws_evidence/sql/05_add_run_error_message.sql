-- Store per-run error summary (e.g. which collector failed and why)
ALTER TABLE swift_2026.collector_runs ADD COLUMN IF NOT EXISTS error_message TEXT NULL;
