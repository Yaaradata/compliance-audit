-- ============================================================
-- Create core.compliance_pipelines + per-schema staging tables.
-- Run after 12_core_schema_and_move_tables.sql.
-- ============================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS core.compliance_pipelines (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name              VARCHAR(255) NOT NULL,
    schema_name       VARCHAR(50)  NOT NULL UNIQUE,
    pdf_storage_path  VARCHAR(1000),
    status            VARCHAR(30)  NOT NULL DEFAULT 'created',
    current_stage     INTEGER      NOT NULL DEFAULT 0,
    created_by        UUID REFERENCES core.users(id),
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cp_status ON core.compliance_pipelines(status);
CREATE INDEX IF NOT EXISTS idx_cp_created_by ON core.compliance_pipelines(created_by);

COMMIT;
