-- ============================================================
-- Migration: Remove deprecated user_role enum values.
-- internal_reviewer -> internal_reviewer_l1
-- approver -> external_assessor (external_assessor acts as approver)
-- Run after 09_user_role_l1_l2.sql. Idempotent.
-- ============================================================

BEGIN;

SET search_path TO swift_2025, core, public;

-- 1. Migrate users with deprecated roles (works for core.users or swift_2025.users)
DO $$
DECLARE
  tbl TEXT;
BEGIN
  -- Update core.users if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'core' AND table_name = 'users') THEN
    UPDATE core.users SET role = 'internal_reviewer_l1' WHERE role::text = 'internal_reviewer';
    UPDATE core.users SET role = 'external_assessor' WHERE role::text = 'approver';
  END IF;
  -- Update swift_2025.users if it exists (pre-migration)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'swift_2025' AND table_name = 'users') THEN
    UPDATE swift_2025.users SET role = 'internal_reviewer_l1' WHERE role::text = 'internal_reviewer';
    UPDATE swift_2025.users SET role = 'external_assessor' WHERE role::text = 'approver';
  END IF;
END $$;

-- 2. Create new enum type (swift_2025 schema)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t
                 JOIN pg_namespace n ON t.typnamespace = n.oid
                 WHERE t.typname = 'user_role_new' AND n.nspname = 'swift_2025') THEN
    CREATE TYPE swift_2025.user_role_new AS ENUM (
      'admin',
      'compliance_officer',
      'it_sme',
      'internal_reviewer_l1',
      'internal_reviewer_l2',
      'external_assessor'
    );
  END IF;
END $$;

-- 3. Alter users.role to use new type (core or swift_2025)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns c
             JOIN information_schema.tables t ON c.table_schema = t.table_schema AND c.table_name = t.table_name
             WHERE c.table_schema = 'core' AND c.table_name = 'users' AND c.column_name = 'role'
               AND c.udt_name = 'user_role') THEN
    ALTER TABLE core.users
      ALTER COLUMN role TYPE swift_2025.user_role_new
      USING (role::text::swift_2025.user_role_new);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns c
             WHERE c.table_schema = 'swift_2025' AND c.table_name = 'users' AND c.column_name = 'role'
               AND c.udt_name = 'user_role') THEN
    ALTER TABLE swift_2025.users
      ALTER COLUMN role TYPE swift_2025.user_role_new
      USING (role::text::swift_2025.user_role_new);
  END IF;
END $$;

-- 4. Drop old enum and rename new one
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid
             WHERE t.typname = 'user_role' AND n.nspname = 'swift_2025')
     AND EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid
                 WHERE t.typname = 'user_role_new' AND n.nspname = 'swift_2025') THEN
    DROP TYPE swift_2025.user_role;
    ALTER TYPE swift_2025.user_role_new RENAME TO user_role;
  END IF;
END $$;

COMMIT;
