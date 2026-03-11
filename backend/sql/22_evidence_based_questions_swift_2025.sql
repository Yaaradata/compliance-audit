-- Add evidence_based_questions table to swift_2025 schema.
-- Stores form questions per evidence item for DB-driven generalized form.
-- Run as: psql -U postgres -d compliance -f backend/sql/22_evidence_based_questions_swift_2025.sql

SET search_path TO swift_2025, public;

CREATE TABLE IF NOT EXISTS swift_2025.evidence_based_questions (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_item_id   VARCHAR(5) NOT NULL REFERENCES swift_2025.canonical_evidence_items(id) ON DELETE CASCADE,
    question_key      VARCHAR(100) NOT NULL,
    label             TEXT NOT NULL,
    question_type     VARCHAR(20) NOT NULL,
    required          BOOLEAN NOT NULL DEFAULT true,
    placeholder       TEXT,
    options           JSONB DEFAULT '[]',
    sort_order        INTEGER NOT NULL DEFAULT 0,
    control_id        VARCHAR(10),
    rows              INTEGER,
    accept            VARCHAR(255),
    upload_label      VARCHAR(255),
    cscf_version      VARCHAR(10) NOT NULL DEFAULT '2025v',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_ebq_item_key_2025 UNIQUE (evidence_item_id, question_key)
);

CREATE INDEX IF NOT EXISTS idx_ebq_item_2025 ON swift_2025.evidence_based_questions(evidence_item_id);
