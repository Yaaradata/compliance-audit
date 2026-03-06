-- ============================================================
-- Add log_date and log_month to swift_2025.audit_log for easier filtering.
-- Run after 12_core_schema_and_move_tables.sql.
-- ============================================================

BEGIN;

SET search_path TO swift_2025, public;

-- Use AT TIME ZONE 'UTC' so expressions are immutable (timestamptz::date depends on session TZ).
ALTER TABLE audit_log
  ADD COLUMN IF NOT EXISTS log_date DATE GENERATED ALWAYS AS ((created_at AT TIME ZONE 'UTC')::date) STORED,
  ADD COLUMN IF NOT EXISTS log_month INTEGER GENERATED ALWAYS AS (EXTRACT(MONTH FROM (created_at AT TIME ZONE 'UTC'))::integer) STORED;

CREATE INDEX IF NOT EXISTS idx_audit_log_log_date ON audit_log(log_date);
CREATE INDEX IF NOT EXISTS idx_audit_log_log_month_date ON audit_log(log_month, log_date);

COMMIT;
