-- ============================================================
-- Migration: Create evidence_sufficiency_matrix table
-- Mirrors CSCF_v2025_Complete_Sufficiency_Matrix (one row per item_code + control_id).
-- Run as: psql -U postgres -d compliance -f backend/sql/06_evidence_sufficiency_matrix.sql
-- ============================================================

BEGIN;

SET search_path TO cscf_2025_new;

-- evidence_sufficiency_matrix: source of truth for sufficiency and evaluation criteria per (item, control)
CREATE TABLE IF NOT EXISTS evidence_sufficiency_matrix (
    item_code            VARCHAR(5) NOT NULL REFERENCES canonical_evidence_items(id),
    control_id           VARCHAR(10) NOT NULL REFERENCES controls(id),
    evidence_item_name   VARCHAR(255) NOT NULL,
    control_name         VARCHAR(255) NOT NULL,
    ma                  VARCHAR(1) NOT NULL,
    evidence_type        VARCHAR(100) NOT NULL,
    sufficiency_criteria  TEXT,
    evaluation_criteria  TEXT,
    cscf_version         VARCHAR(10) NOT NULL DEFAULT '2025v',
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (item_code, control_id)
);

CREATE INDEX IF NOT EXISTS idx_esm_item_code ON evidence_sufficiency_matrix(item_code);
CREATE INDEX IF NOT EXISTS idx_esm_control_id ON evidence_sufficiency_matrix(control_id);

COMMIT;
