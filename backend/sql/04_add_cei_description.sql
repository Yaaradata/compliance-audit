-- Migration: Add description and other missing columns to canonical_evidence_items
-- Run via: psql -U postgres -d compliance -f backend/sql/04_add_cei_description.sql
-- Or: python backend/scripts/run_migration.py
BEGIN;

SET search_path TO swift_2025;

-- Add description if missing (required by ORM; older schemas may not have it)
ALTER TABLE canonical_evidence_items ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';

-- Ensure NOT NULL after backfill (only if column was just added with nulls)
UPDATE canonical_evidence_items SET description = COALESCE(description, name) WHERE description IS NULL OR description = '';

COMMIT;
