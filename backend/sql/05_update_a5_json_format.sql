-- Migration: Update A5 (Architecture Type Declaration) with structured JSON format
-- for sufficiency_definition and evaluation_criteria
-- Run via: psql -U postgres -d compliance -f backend/sql/05_update_a5_json_format.sql
BEGIN;

SET search_path TO swift_2025;

-- Ensure columns are JSONB (if they were TEXT, this will need to be run after alter)
UPDATE canonical_evidence_items SET
  sufficiency_definition = '{"1": "Selected architecture type with justification,", "2": "Description of SWIFT infrastructure matching the architecture,", "3": "List of all SWIFT-related components,", "4": "Identification of any hybrid setups,", "5": "Confirmation of component ownership model"}'::jsonb,
  evaluation_criteria    = '{"1": "Architecture type matches actual infrastructure?", "2": "All SWIFT components accounted for?", "3": "Justification aligns with SWIFT architecture decision tree?", "4": "Ownership model clear?"}'::jsonb
WHERE id = 'A5';

COMMIT;
