-- ============================================================
-- Add group_name to core.users for compliance officer group management.
-- Users can be assigned to a group (string) or act as individual (NULL).
-- Run as: psql -U postgres -d compliance -f backend/sql/29_add_user_group_name.sql
-- ============================================================

BEGIN;

ALTER TABLE core.users
  ADD COLUMN IF NOT EXISTS group_name VARCHAR(255);

COMMENT ON COLUMN core.users.group_name IS 'Optional group name; NULL means user acts as individual. Used by compliance officer for grouping users.';

COMMIT;
