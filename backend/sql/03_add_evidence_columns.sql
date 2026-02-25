-- Migration: Add evidence_description, sufficiency_definition, evaluation_criteria to canonical_evidence_items
-- Run via psql: psql -U postgres -d compliance -f backend/sql/03_add_evidence_columns.sql
-- Or via Python: python backend/scripts/run_migration.py
BEGIN;

SET search_path TO cscf_2025_new;

ALTER TABLE canonical_evidence_items ADD COLUMN IF NOT EXISTS evidence_description TEXT;
ALTER TABLE canonical_evidence_items ADD COLUMN IF NOT EXISTS sufficiency_definition TEXT;
ALTER TABLE canonical_evidence_items ADD COLUMN IF NOT EXISTS evaluation_criteria TEXT;

COMMIT;
