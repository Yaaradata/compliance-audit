-- ============================================================
-- SOC 2 — Single table: Architecture_Details
-- All data for the architecture page: what the architecture is,
-- what it defines, detailed description, controls available,
-- mandatory controls, advisory controls, soc_version.
-- Long-text fields stored as JSONB for structured frontend consumption.
-- Run after core schema exists (e.g. 12_core_schema_and_move_tables.sql).
-- ============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS soc2;

SET search_path TO soc2, public;

-- ========== Single table: everything for the architecture page ==========
CREATE TABLE IF NOT EXISTS soc2.architecture_details (
    id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    architecture_code     VARCHAR(30)   NOT NULL UNIQUE,
    name                  VARCHAR(255)  NOT NULL,
    category              VARCHAR(20)   NOT NULL CHECK (category IN ('overview', 'scope', 'deployment')),

    -- Structured JSONB fields (replaces flat TEXT columns)
    -- what_it_defines:      { "summary": "..." }
    -- detailed_description: { "summary": "...", "points": ["...", "..."] }
    -- controls_available:   { "series": ["CC1", ...], "labels": { "CC1": "Control Environment", ... } }
    -- mandatory_controls:   { "summary": "...", "items": ["...", "..."] }
    -- advisory_controls:    { "summary": "...", "items": ["...", "..."] }

    what_it_defines       JSONB,
    detailed_description  JSONB         NOT NULL,
    controls_available    JSONB,
    mandatory_controls    JSONB,
    advisory_controls     JSONB,

    soc_version           VARCHAR(20)   NOT NULL DEFAULT '2022',
    sort_order            INTEGER       NOT NULL DEFAULT 0,
    created_at            TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ   NOT NULL DEFAULT now()
);

COMMENT ON TABLE soc2.architecture_details IS
  'Single table for SOC 2 architecture page. Long-text fields are JSONB for structured frontend consumption.';

COMMENT ON COLUMN soc2.architecture_details.what_it_defines IS
  'JSONB: { "summary": string }';
COMMENT ON COLUMN soc2.architecture_details.detailed_description IS
  'JSONB: { "summary": string, "points": string[] }';
COMMENT ON COLUMN soc2.architecture_details.controls_available IS
  'JSONB: { "series": string[], "labels": { [series]: string } }';
COMMENT ON COLUMN soc2.architecture_details.mandatory_controls IS
  'JSONB: { "summary": string, "items": string[] }';
COMMENT ON COLUMN soc2.architecture_details.advisory_controls IS
  'JSONB: { "summary": string, "items": string[] }';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_soc2_arch_category   ON soc2.architecture_details(category);
CREATE INDEX IF NOT EXISTS idx_soc2_arch_sort        ON soc2.architecture_details(sort_order);
CREATE INDEX IF NOT EXISTS idx_soc2_arch_soc_version ON soc2.architecture_details(soc_version);

-- GIN indexes for JSONB querying
CREATE INDEX IF NOT EXISTS idx_soc2_arch_controls_gin    ON soc2.architecture_details USING GIN (controls_available);
CREATE INDEX IF NOT EXISTS idx_soc2_arch_mandatory_gin   ON soc2.architecture_details USING GIN (mandatory_controls);

COMMIT;