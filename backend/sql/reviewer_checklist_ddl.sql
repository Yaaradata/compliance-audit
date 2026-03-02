-- ============================================================
-- Reviewer checklist (L1/L2/L3 what to check per evidence item – control)
-- Source: Reviewer_doc/Reviewer.xlsx
-- Run after 01_schema_ddl.sql (same schema as app: cscf_2025_new).
-- ============================================================

SET search_path TO cscf_2025_new, public;

-- Table: reviewer_checklist
-- One row per (evidence item, control) with L1/L2/L3 reviewer guidance.
CREATE TABLE IF NOT EXISTS reviewer_checklist (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_code             VARCHAR(5) NOT NULL,
    evidence_item         VARCHAR(500) NOT NULL,
    control_id            VARCHAR(20) NOT NULL,
    control_name          VARCHAR(500) NOT NULL,
    mandatory_advisory    VARCHAR(10) NOT NULL DEFAULT 'M',
    l1_check              TEXT,
    l2_check              TEXT,
    l3_check              TEXT,
    cscf_version          VARCHAR(10) NOT NULL DEFAULT '2025v',
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviewer_checklist_item_code ON reviewer_checklist(item_code);
CREATE INDEX IF NOT EXISTS idx_reviewer_checklist_control_id ON reviewer_checklist(control_id);
CREATE INDEX IF NOT EXISTS idx_reviewer_checklist_item_control ON reviewer_checklist(item_code, control_id);

COMMENT ON TABLE reviewer_checklist IS 'L1/L2/L3 reviewer tasks and check criteria per evidence item and control (from Reviewer.xlsx)';
