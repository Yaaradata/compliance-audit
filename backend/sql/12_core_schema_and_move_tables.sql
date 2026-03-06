-- ============================================================
-- Migration: Create core schema, rename cscf_2025_new -> swift_2025,
--            move assessment_cycles, audit_frameworks, tenants, users to core,
--            add schema_name to audit_frameworks, seed 2026 framework.
-- Run after 01_schema_ddl and 02_seed_reference_data (or equivalent).
-- Run as: psql -U postgres -d compliance -f backend/sql/12_core_schema_and_move_tables.sql
-- ============================================================

BEGIN;

-- 1. Rename schema if still cscf_2025_new (idempotent: only if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'cscf_2025_new') THEN
    ALTER SCHEMA cscf_2025_new RENAME TO swift_2025;
  END IF;
END $$;

-- 2. Create core schema
CREATE SCHEMA IF NOT EXISTS core;

-- 3. Ensure uuid-ossp in core for default gen
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 4. Move tables to core (order: no FK between these four). Idempotent: skip if already in core.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'swift_2025' AND table_name = 'tenants')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'core' AND table_name = 'tenants') THEN
    ALTER TABLE swift_2025.tenants SET SCHEMA core;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'swift_2025' AND table_name = 'users')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'core' AND table_name = 'users') THEN
    ALTER TABLE swift_2025.users SET SCHEMA core;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'swift_2025' AND table_name = 'audit_frameworks')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'core' AND table_name = 'audit_frameworks') THEN
    ALTER TABLE swift_2025.audit_frameworks SET SCHEMA core;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'swift_2025' AND table_name = 'assessment_cycles')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'core' AND table_name = 'assessment_cycles') THEN
    ALTER TABLE swift_2025.assessment_cycles SET SCHEMA core;
  END IF;
END $$;

-- 5. Add schema_name to core.audit_frameworks (for per-request schema selection)
ALTER TABLE core.audit_frameworks
  ADD COLUMN IF NOT EXISTS schema_name VARCHAR(20) NOT NULL DEFAULT 'swift_2025';

-- Allow two frameworks (2025 and 2026) with same code: unique on (code, version). Idempotent.
ALTER TABLE core.audit_frameworks DROP CONSTRAINT IF EXISTS audit_frameworks_code_key;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE c.conname = 'audit_frameworks_code_version_key' AND n.nspname = 'core'
  ) THEN
    ALTER TABLE core.audit_frameworks ADD CONSTRAINT audit_frameworks_code_version_key UNIQUE (code, version);
  END IF;
END $$;

-- Backfill: 2025 row uses swift_2025 (all existing rows)
UPDATE core.audit_frameworks
SET schema_name = 'swift_2025'
WHERE schema_name = 'swift_2025' OR version = 'v2025' OR cscf_version = '2025v';

-- 6. Insert 2026 framework row (same code, different version, schema swift_2026)
INSERT INTO core.audit_frameworks (code, name, version, effective_date, metadata, schema_name, cscf_version)
SELECT
  'SWIFT_CSCF',
  'SWIFT Customer Security Controls Framework',
  'v2026',
  '2026-07-01',
  '{"objectives": 3, "mandatory_controls": 25, "advisory_controls": 7, "total_controls": 32, "evidence_items": 53}'::jsonb,
  'swift_2026',
  '2026v'
WHERE NOT EXISTS (
  SELECT 1 FROM core.audit_frameworks WHERE code = 'SWIFT_CSCF' AND version = 'v2026'
);

COMMIT;
