-- ============================================================
-- Add is_external to core.users for L3 (External Assessor) constraint.
-- L3 role can only be assigned to users with is_external = true.
-- Run as: psql -U postgres -d compliance -f backend/sql/30_add_user_is_external.sql
-- ============================================================

BEGIN;

ALTER TABLE core.users
  ADD COLUMN IF NOT EXISTS is_external BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN core.users.is_external IS 'True for external assessors (e.g. PCI ISA). L3 role can only be assigned to external users.';

COMMIT;
