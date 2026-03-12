-- ============================================================
-- Create swift_2026 schema and all framework tables.
-- FKs to core.assessment_cycles, core.tenants, core.users, core.audit_frameworks.
-- Run after 12_core_schema_and_move_tables.sql and 12b.
-- ============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS swift_2026;

SET search_path TO swift_2026, core, swift_2025, public;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========== ENUM TYPES (same as swift_2025) ==========
DO $$ BEGIN CREATE TYPE swift_2026.architecture_type AS ENUM ('A1','A2','A3','A4','B'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
-- user_role: internal_reviewer_l1/L2 for L1/L2 review; external_assessor (L3) acts as approver
DO $$ BEGIN
  CREATE TYPE swift_2026.user_role AS ENUM (
    'admin',
    'compliance_officer',
    'it_sme',
    'internal_reviewer_l1',
    'internal_reviewer_l2',
    'external_assessor'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE swift_2026.assessment_phase AS ENUM ('setup','collection','review','approval','reporting','submitted','archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE swift_2026.control_type AS ENUM ('mandatory','advisory'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE swift_2026.collection_priority AS ENUM ('critical','high','medium'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE swift_2026.reuse_tier AS ENUM ('foundational','ultra_high','high','moderate','control_specific'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE swift_2026.collection_model AS ENUM ('standard','per_system','per_vendor','per_quarter'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE swift_2026.evidence_status AS ENUM ('draft','submitted','in_review','returned','approved','escalated'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE swift_2026.review_level AS ENUM ('l1_completeness','l2_quality','l3_assessment'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE swift_2026.review_status AS ENUM ('assigned','in_progress','approved','returned','escalated','hold'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE swift_2026.review_decision AS ENUM ('approve','return','escalate','hold'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE swift_2026.gate_type AS ENUM ('evidence_complete','internal_review','assessment_complete','final_attestation'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE swift_2026.gate_status AS ENUM ('pending','approved','blocked'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE swift_2026.sufficiency_status AS ENUM ('not_started','insufficient','partial','sufficient'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE swift_2026.evaluation_source AS ENUM ('system','ai','human'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE swift_2026.upload_status AS ENUM ('uploading','uploaded','processing','processed','failed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE swift_2026.report_type AS ENUM ('draft','final'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE swift_2026.compliance_status AS ENUM ('compliant','non_compliant','partial'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE swift_2026.vendor_classification AS ENUM ('outsourcing_agent','connectivity_provider','it_provider','cloud_provider','software_vendor','consulting_firm'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE swift_2026.vendor_access AS ENUM ('remote','on_site','both','none'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE swift_2026.subscription_tier AS ENUM ('trial','professional','enterprise'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

SET search_path TO swift_2026, core, swift_2025, public;

-- ========== TABLES (no tenants, users, audit_frameworks, assessment_cycles) ==========

-- controls
CREATE TABLE IF NOT EXISTS swift_2026.controls (
    id                          VARCHAR(10) PRIMARY KEY,
    name                        VARCHAR(255) NOT NULL,
    control_type                swift_2026.control_type NOT NULL,
    objective                   INTEGER NOT NULL CHECK (objective BETWEEN 1 AND 3),
    architecture_applicability  TEXT[] NOT NULL DEFAULT '{}',
    description                 TEXT,
    cscf_version                VARCHAR(10) NOT NULL DEFAULT '2026v',
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- evidence_domains
CREATE TABLE IF NOT EXISTS swift_2026.evidence_domains (
    id               CHAR(1) PRIMARY KEY,
    name             VARCHAR(255) NOT NULL,
    color            VARCHAR(10),
    accent_color     VARCHAR(10),
    item_count       INTEGER NOT NULL DEFAULT 0,
    sort_order       INTEGER NOT NULL,
    cscf_version     VARCHAR(10) NOT NULL DEFAULT '2026v',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- canonical_evidence_items
CREATE TABLE IF NOT EXISTS swift_2026.canonical_evidence_items (
    id                    VARCHAR(5) PRIMARY KEY,
    domain_id             CHAR(1) NOT NULL REFERENCES swift_2026.evidence_domains(id),
    sort_order            INTEGER NOT NULL,
    name                  VARCHAR(255) NOT NULL,
    priority              swift_2026.collection_priority NOT NULL DEFAULT 'medium',
    evidence_type         VARCHAR(100) NOT NULL,
    description           TEXT NOT NULL,
    reduction_note        TEXT,
    control_count         INTEGER NOT NULL DEFAULT 0,
    collection_model      swift_2026.collection_model NOT NULL DEFAULT 'standard',
    reuse_tier            swift_2026.reuse_tier NOT NULL DEFAULT 'control_specific',
    input_schema          JSONB DEFAULT '[]',
    sufficiency_dimensions JSONB DEFAULT '[]',
    per_system            BOOLEAN NOT NULL DEFAULT false,
    per_zone              BOOLEAN NOT NULL DEFAULT false,
    per_quarter           BOOLEAN NOT NULL DEFAULT false,
    per_access_point      BOOLEAN NOT NULL DEFAULT false,
    is_advisory           BOOLEAN NOT NULL DEFAULT false,
    is_conditional        BOOLEAN NOT NULL DEFAULT false,
    conditional_note       TEXT,
    evidence_description   TEXT,
    sufficiency_definition TEXT,
    evaluation_criteria    TEXT,
    cscf_version          VARCHAR(10) NOT NULL DEFAULT '2026v',
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cei_domain_2026 ON swift_2026.canonical_evidence_items(domain_id);

-- item_control_mappings
CREATE TABLE IF NOT EXISTS swift_2026.item_control_mappings (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_item_id        VARCHAR(5) NOT NULL REFERENCES swift_2026.canonical_evidence_items(id),
    control_id              VARCHAR(10) NOT NULL REFERENCES swift_2026.controls(id),
    is_primary              BOOLEAN NOT NULL DEFAULT false,
    weight                  NUMERIC(5,2) DEFAULT 1.0,
    sufficiency_requirement TEXT,
    cscf_version            VARCHAR(10) NOT NULL DEFAULT '2026v',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_item_control_2026 UNIQUE (evidence_item_id, control_id)
);

CREATE INDEX IF NOT EXISTS idx_icm_item_2026 ON swift_2026.item_control_mappings(evidence_item_id);
CREATE INDEX IF NOT EXISTS idx_icm_control_2026 ON swift_2026.item_control_mappings(control_id);

-- cross_domain_dependencies
CREATE TABLE IF NOT EXISTS swift_2026.cross_domain_dependencies (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_item_id    VARCHAR(5) NOT NULL REFERENCES swift_2026.canonical_evidence_items(id),
    target_item_id    VARCHAR(5) NOT NULL REFERENCES swift_2026.canonical_evidence_items(id),
    dependency_type   VARCHAR(50) NOT NULL DEFAULT 'validates',
    description       TEXT,
    cscf_version      VARCHAR(10) NOT NULL DEFAULT '2026v',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_dependency_2026 UNIQUE (source_item_id, target_item_id)
);

-- control_applicability (FK to core.assessment_cycles)
CREATE TABLE IF NOT EXISTS swift_2026.control_applicability (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cycle_id          UUID NOT NULL REFERENCES core.assessment_cycles(id) ON DELETE CASCADE,
    control_id        VARCHAR(10) NOT NULL REFERENCES swift_2026.controls(id),
    applicability     swift_2026.control_type NOT NULL,
    is_overridden     BOOLEAN NOT NULL DEFAULT false,
    override_reason   TEXT,
    score             NUMERIC(5,2) DEFAULT 0,
    status            swift_2026.sufficiency_status NOT NULL DEFAULT 'not_started',
    evidence_count    INTEGER NOT NULL DEFAULT 0,
    cscf_version      VARCHAR(10) NOT NULL DEFAULT '2026v',
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_cycle_control_2026 UNIQUE (cycle_id, control_id)
);

CREATE INDEX IF NOT EXISTS idx_ca_cycle_2026 ON swift_2026.control_applicability(cycle_id);

-- evidence_submissions (with optional columns for evaluation)
CREATE TABLE IF NOT EXISTS swift_2026.evidence_submissions (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cycle_id          UUID NOT NULL REFERENCES core.assessment_cycles(id) ON DELETE CASCADE,
    tenant_id         UUID NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
    evidence_item_id  VARCHAR(5) NOT NULL REFERENCES swift_2026.canonical_evidence_items(id),
    submitted_by      UUID REFERENCES core.users(id),
    status            swift_2026.evidence_status NOT NULL DEFAULT 'draft',
    scope_key         VARCHAR(255),
    form_data         JSONB DEFAULT '{}',
    completion_pct    NUMERIC(5,2) DEFAULT 0,
    version           INTEGER NOT NULL DEFAULT 1,
    ai_summary        TEXT,
    ai_confidence     NUMERIC(5,2),
    submitted_at      TIMESTAMPTZ,
    evaluation_edits  JSONB NOT NULL DEFAULT '{}',
    evaluation_remediation TEXT,
    cscf_version      VARCHAR(10) NOT NULL DEFAULT '2026v',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_es_cycle_2026 ON swift_2026.evidence_submissions(cycle_id);
CREATE INDEX IF NOT EXISTS idx_es_tenant_2026 ON swift_2026.evidence_submissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_es_item_2026 ON swift_2026.evidence_submissions(evidence_item_id);
CREATE INDEX IF NOT EXISTS idx_es_status_2026 ON swift_2026.evidence_submissions(status);

-- evidence_attachments
CREATE TABLE IF NOT EXISTS swift_2026.evidence_attachments (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id     UUID NOT NULL REFERENCES swift_2026.evidence_submissions(id) ON DELETE CASCADE,
    file_name         VARCHAR(500) NOT NULL,
    file_type         VARCHAR(100) NOT NULL,
    file_size_bytes   BIGINT NOT NULL DEFAULT 0,
    storage_path      VARCHAR(1000) NOT NULL,
    sha256_hash       VARCHAR(64),
    upload_status     swift_2026.upload_status NOT NULL DEFAULT 'uploaded',
    uploaded_by       UUID REFERENCES core.users(id),
    cscf_version      VARCHAR(10) NOT NULL DEFAULT '2026v',
    uploaded_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ea_submission_2026 ON swift_2026.evidence_attachments(submission_id);

-- vendor_registry (core FKs)
CREATE TABLE IF NOT EXISTS swift_2026.vendor_registry (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cycle_id             UUID NOT NULL REFERENCES core.assessment_cycles(id) ON DELETE CASCADE,
    tenant_id            UUID NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
    name                 VARCHAR(255) NOT NULL,
    classification       swift_2026.vendor_classification NOT NULL DEFAULT 'it_provider',
    access_type          swift_2026.vendor_access NOT NULL DEFAULT 'none',
    swift_components     TEXT,
    risk_rating          VARCHAR(20),
    is_active            BOOLEAN NOT NULL DEFAULT true,
    cscf_version         VARCHAR(10) NOT NULL DEFAULT '2026v',
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vr_cycle_2026 ON swift_2026.vendor_registry(cycle_id);
CREATE INDEX IF NOT EXISTS idx_vr_tenant_2026 ON swift_2026.vendor_registry(tenant_id);

-- sufficiency_scores
CREATE TABLE IF NOT EXISTS swift_2026.sufficiency_scores (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cycle_id          UUID NOT NULL REFERENCES core.assessment_cycles(id) ON DELETE CASCADE,
    control_id        VARCHAR(10) NOT NULL REFERENCES swift_2026.controls(id),
    overall_score     NUMERIC(5,2) DEFAULT 0,
    status            swift_2026.sufficiency_status NOT NULL DEFAULT 'not_started',
    last_evaluated_at TIMESTAMPTZ,
    cscf_version      VARCHAR(10) NOT NULL DEFAULT '2026v',
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_suf_cycle_control_2026 UNIQUE (cycle_id, control_id)
);

CREATE INDEX IF NOT EXISTS idx_ss_cycle_2026 ON swift_2026.sufficiency_scores(cycle_id);

-- sufficiency_evaluations
CREATE TABLE IF NOT EXISTS swift_2026.sufficiency_evaluations (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id     UUID NOT NULL REFERENCES swift_2026.evidence_submissions(id) ON DELETE CASCADE,
    dimension_code    VARCHAR(50) NOT NULL,
    score             NUMERIC(5,2) NOT NULL DEFAULT 0,
    rationale         TEXT,
    source            swift_2026.evaluation_source NOT NULL DEFAULT 'system',
    evaluated_by      UUID REFERENCES core.users(id),
    cscf_version      VARCHAR(10) NOT NULL DEFAULT '2026v',
    evaluated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_se_submission_2026 ON swift_2026.sufficiency_evaluations(submission_id);

-- review_assignments
CREATE TABLE IF NOT EXISTS swift_2026.review_assignments (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id     UUID NOT NULL REFERENCES swift_2026.evidence_submissions(id) ON DELETE CASCADE,
    reviewer_id       UUID NOT NULL REFERENCES core.users(id),
    level             swift_2026.review_level NOT NULL,
    status            swift_2026.review_status NOT NULL DEFAULT 'assigned',
    decision          swift_2026.review_decision,
    sla_due_at        TIMESTAMPTZ,
    started_at        TIMESTAMPTZ,
    completed_at      TIMESTAMPTZ,
    cscf_version      VARCHAR(10) NOT NULL DEFAULT '2026v',
    assigned_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ra_submission_2026 ON swift_2026.review_assignments(submission_id);
CREATE INDEX IF NOT EXISTS idx_ra_reviewer_2026 ON swift_2026.review_assignments(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_ra_status_2026 ON swift_2026.review_assignments(status);

-- review_comments
CREATE TABLE IF NOT EXISTS swift_2026.review_comments (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id         UUID NOT NULL REFERENCES swift_2026.review_assignments(id) ON DELETE CASCADE,
    author_id         UUID NOT NULL REFERENCES core.users(id),
    parent_id         UUID REFERENCES swift_2026.review_comments(id),
    body              TEXT NOT NULL,
    mentions          UUID[] DEFAULT '{}',
    is_resolved       BOOLEAN NOT NULL DEFAULT false,
    resolved_by       UUID REFERENCES core.users(id),
    cscf_version      VARCHAR(10) NOT NULL DEFAULT '2026v',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rc_review_2026 ON swift_2026.review_comments(review_id);

-- approval_gates
CREATE TABLE IF NOT EXISTS swift_2026.approval_gates (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cycle_id          UUID NOT NULL REFERENCES core.assessment_cycles(id) ON DELETE CASCADE,
    gate              swift_2026.gate_type NOT NULL,
    status            swift_2026.gate_status NOT NULL DEFAULT 'pending',
    approved_by       UUID REFERENCES core.users(id),
    approved_at       TIMESTAMPTZ,
    mfa_verified      BOOLEAN NOT NULL DEFAULT false,
    notes             TEXT,
    cscf_version      VARCHAR(10) NOT NULL DEFAULT '2026v',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_gate_cycle_2026 UNIQUE (cycle_id, gate)
);

CREATE INDEX IF NOT EXISTS idx_ag_cycle_2026 ON swift_2026.approval_gates(cycle_id);

-- assessment_reports
CREATE TABLE IF NOT EXISTS swift_2026.assessment_reports (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cycle_id          UUID NOT NULL REFERENCES core.assessment_cycles(id) ON DELETE CASCADE,
    report_kind       swift_2026.report_type NOT NULL DEFAULT 'draft',
    sections          JSONB DEFAULT '[]',
    snapshot_data     JSONB DEFAULT '{}',
    generated_by      UUID REFERENCES core.users(id),
    finalized_at      TIMESTAMPTZ,
    cscf_version      VARCHAR(10) NOT NULL DEFAULT '2026v',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ar_cycle_2026 ON swift_2026.assessment_reports(cycle_id);

-- evidence_sufficiency_matrix
CREATE TABLE IF NOT EXISTS swift_2026.evidence_sufficiency_matrix (
    item_code            VARCHAR(5) NOT NULL REFERENCES swift_2026.canonical_evidence_items(id),
    control_id           VARCHAR(10) NOT NULL REFERENCES swift_2026.controls(id),
    evidence_item_name   VARCHAR(255) NOT NULL,
    control_name         VARCHAR(255) NOT NULL,
    ma                  VARCHAR(1) NOT NULL,
    evidence_type        VARCHAR(100) NOT NULL,
    sufficiency_criteria  TEXT,
    evaluation_criteria  TEXT,
    cscf_version         VARCHAR(10) NOT NULL DEFAULT '2026v',
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (item_code, control_id)
);

CREATE INDEX IF NOT EXISTS idx_esm_item_code_2026 ON swift_2026.evidence_sufficiency_matrix(item_code);
CREATE INDEX IF NOT EXISTS idx_esm_control_id_2026 ON swift_2026.evidence_sufficiency_matrix(control_id);

-- reviewer_checklist (L1/L2/L3 as JSONB for 2026)
CREATE TABLE IF NOT EXISTS swift_2026.reviewer_checklist (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_code             VARCHAR(5) NOT NULL,
    evidence_item         VARCHAR(500) NOT NULL,
    control_id            VARCHAR(20) NOT NULL,
    control_name          VARCHAR(500) NOT NULL,
    mandatory_advisory    VARCHAR(10) NOT NULL DEFAULT 'M',
    l1_check              JSONB,
    l2_check              JSONB,
    l3_check              JSONB,
    cscf_version          VARCHAR(10) NOT NULL DEFAULT '2026v',
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rc_item_code_2026 ON swift_2026.reviewer_checklist(item_code);
CREATE INDEX IF NOT EXISTS idx_rc_control_id_2026 ON swift_2026.reviewer_checklist(control_id);
CREATE INDEX IF NOT EXISTS idx_rc_item_control_2026 ON swift_2026.reviewer_checklist(item_code, control_id);

-- evidence_submission_history
CREATE TABLE IF NOT EXISTS swift_2026.evidence_submission_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES swift_2026.evidence_submissions(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    changed_by UUID REFERENCES core.users(id),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    change_type VARCHAR(50) NOT NULL,
    snapshot_before JSONB,
    snapshot_after JSONB,
    justification TEXT
);
CREATE INDEX IF NOT EXISTS idx_esh_submission_2026 ON swift_2026.evidence_submission_history(submission_id);
CREATE INDEX IF NOT EXISTS idx_esh_changed_at_2026 ON swift_2026.evidence_submission_history(changed_at);

-- notes (core FKs)
CREATE TABLE IF NOT EXISTS swift_2026.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID NOT NULL,
    parent_id UUID REFERENCES swift_2026.notes(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES core.users(id),
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notes_resource_2026 ON swift_2026.notes(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_2026 ON swift_2026.notes(resource_type, resource_id, created_at);

-- notifications (core FKs)
CREATE TABLE IF NOT EXISTS swift_2026.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    actor_id UUID REFERENCES core.users(id),
    title VARCHAR(255),
    body TEXT,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created_2026 ON swift_2026.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread_2026 ON swift_2026.notifications(user_id) WHERE read_at IS NULL;

-- review_assignments checklist_results (optional)
ALTER TABLE swift_2026.review_assignments ADD COLUMN IF NOT EXISTS checklist_results JSONB NOT NULL DEFAULT '{}';

-- audit_log with log_date, log_month (core FKs)
CREATE TABLE IF NOT EXISTS swift_2026.audit_log (
    id                BIGSERIAL,
    tenant_id         UUID REFERENCES core.tenants(id),
    user_id           UUID REFERENCES core.users(id),
    action            VARCHAR(100) NOT NULL,
    resource_type     VARCHAR(50) NOT NULL,
    resource_id       UUID,
    metadata          JSONB DEFAULT '{}',
    ip_address        INET,
    cscf_version      VARCHAR(10) NOT NULL DEFAULT '2026v',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    log_date          DATE GENERATED ALWAYS AS ((created_at AT TIME ZONE 'UTC')::date) STORED,
    log_month         INTEGER GENERATED ALWAYS AS (EXTRACT(MONTH FROM (created_at AT TIME ZONE 'UTC'))::integer) STORED,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

DO $$
DECLARE m INTEGER; start_date TEXT; end_date TEXT; part_name TEXT;
BEGIN
    FOR m IN 1..12 LOOP
        start_date := format('2026-%s-01', lpad(m::text, 2, '0'));
        IF m < 12 THEN end_date := format('2026-%s-01', lpad((m+1)::text, 2, '0'));
        ELSE end_date := '2027-01-01'; END IF;
        part_name := format('audit_log_2026_%s', lpad(m::text, 2, '0'));
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS swift_2026.%I PARTITION OF swift_2026.audit_log FOR VALUES FROM (%L) TO (%L)',
            part_name, start_date, end_date
        );
    END LOOP;
END $$;

CREATE TABLE IF NOT EXISTS swift_2026.audit_log_default PARTITION OF swift_2026.audit_log DEFAULT;

CREATE INDEX IF NOT EXISTS idx_al_tenant_2026 ON swift_2026.audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_al_user_2026 ON swift_2026.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_al_action_2026 ON swift_2026.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_al_created_2026 ON swift_2026.audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_al_log_date_2026 ON swift_2026.audit_log(log_date);
CREATE INDEX IF NOT EXISTS idx_al_log_month_date_2026 ON swift_2026.audit_log(log_month, log_date);

COMMIT;
