-- Add L1 and L2 reviewer roles to user_role enum (swift_2025 schema).
-- Run once per environment. If values already exist, this will error; ignore or use idempotent pattern below.
SET search_path TO swift_2025;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE t.typname = 'user_role' AND n.nspname = 'swift_2025' AND e.enumlabel = 'internal_reviewer_l1'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'internal_reviewer_l1';
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE t.typname = 'user_role' AND n.nspname = 'swift_2025' AND e.enumlabel = 'internal_reviewer_l2'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'internal_reviewer_l2';
  END IF;
END $$;
