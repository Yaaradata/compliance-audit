-- ============================================================
-- SOC 2 — Full schema (single CREATE script).
-- Mirrors Swift structure: schema + architecture_details + controls,
-- evidence domains, canonical evidence items, mappings, submissions,
-- attachments, applicability, reviews, gates, reports, etc.
-- FKs to core.assessment_cycles, core.tenants, core.users.
-- Does NOT modify or depend on any Swift schema.
-- Run after core schema exists (e.g. 12_core_schema_and_move_tables.sql).
-- Optional: 01_soc2_schema.sql and 02_soc2_architecture_and_controls_seed.sql
-- remain for architecture-only setup; this file is self-contained.
-- ============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS soc2;

SET search_path TO soc2, core, public;

-- ========== ENUM TYPES (soc2 schema only; no conflict with Swift) ==========
DO $$ BEGIN CREATE TYPE soc2.control_type AS ENUM ('mandatory','advisory'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE soc2.collection_priority AS ENUM ('critical','high','medium'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE soc2.evidence_status AS ENUM ('draft','submitted','in_review','returned','approved','escalated'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE soc2.review_level AS ENUM ('l1_completeness','l2_quality','l3_assessment'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE soc2.review_status AS ENUM ('assigned','in_progress','approved','returned','escalated'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE soc2.review_decision AS ENUM ('approve','return','escalate'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE soc2.gate_type AS ENUM ('evidence_complete','internal_review','assessment_complete','final_attestation'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE soc2.gate_status AS ENUM ('pending','approved','blocked'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE soc2.sufficiency_status AS ENUM ('not_started','insufficient','partial','sufficient'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE soc2.evaluation_source AS ENUM ('system','ai','human'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE soc2.upload_status AS ENUM ('uploading','uploaded','processing','processed','failed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE soc2.report_type AS ENUM ('draft','final'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

SET search_path TO soc2, core, public;

-- ========== Architecture details (same as 01_soc2_schema; for self-contained run) ==========
CREATE TABLE IF NOT EXISTS soc2.architecture_details (
    id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    architecture_code     VARCHAR(30)   NOT NULL UNIQUE,
    name                  VARCHAR(255)  NOT NULL,
    category              VARCHAR(20)   NOT NULL CHECK (category IN ('overview', 'scope', 'deployment')),
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

CREATE INDEX IF NOT EXISTS idx_soc2_arch_category    ON soc2.architecture_details(category);
CREATE INDEX IF NOT EXISTS idx_soc2_arch_sort         ON soc2.architecture_details(sort_order);
CREATE INDEX IF NOT EXISTS idx_soc2_arch_soc_version  ON soc2.architecture_details(soc_version);
CREATE INDEX IF NOT EXISTS idx_soc2_arch_controls_gin ON soc2.architecture_details USING GIN (controls_available);
CREATE INDEX IF NOT EXISTS idx_soc2_arch_mandatory_gin ON soc2.architecture_details USING GIN (mandatory_controls);

-- ========== Controls (CC1–CC9 and optional TSC controls) ==========
CREATE TABLE IF NOT EXISTS soc2.controls (
    id                      VARCHAR(20) PRIMARY KEY,
    name                    VARCHAR(255) NOT NULL,
    control_type            soc2.control_type NOT NULL,
    description             TEXT,
    scope_applicability     TEXT[] NOT NULL DEFAULT '{}',
    soc_version             VARCHAR(20) NOT NULL DEFAULT '2022',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========== Evidence domains ==========
CREATE TABLE IF NOT EXISTS soc2.evidence_domains (
    id               CHAR(1) PRIMARY KEY,
    name             VARCHAR(255) NOT NULL,
    color            VARCHAR(10),
    accent_color     VARCHAR(10),
    item_count       INTEGER NOT NULL DEFAULT 0,
    sort_order       INTEGER NOT NULL,
    soc_version      VARCHAR(20) NOT NULL DEFAULT '2022',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========== Canonical evidence items ==========
CREATE TABLE IF NOT EXISTS soc2.canonical_evidence_items (
    id                    VARCHAR(10) PRIMARY KEY,
    domain_id              CHAR(1) NOT NULL REFERENCES soc2.evidence_domains(id),
    sort_order             INTEGER NOT NULL,
    name                   VARCHAR(255) NOT NULL,
    priority               soc2.collection_priority NOT NULL DEFAULT 'medium',
    evidence_type          VARCHAR(100) NOT NULL,
    description            TEXT NOT NULL,
    control_count          INTEGER NOT NULL DEFAULT 0,
    input_schema           JSONB DEFAULT '[]',
    soc_version            VARCHAR(20) NOT NULL DEFAULT '2022',
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_soc2_cei_domain ON soc2.canonical_evidence_items(domain_id);

-- ========== Item–control mappings ==========
CREATE TABLE IF NOT EXISTS soc2.item_control_mappings (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evidence_item_id        VARCHAR(10) NOT NULL REFERENCES soc2.canonical_evidence_items(id),
    control_id              VARCHAR(20) NOT NULL REFERENCES soc2.controls(id),
    is_primary              BOOLEAN NOT NULL DEFAULT false,
    weight                  NUMERIC(5,2) DEFAULT 1.0,
    sufficiency_requirement TEXT,
    soc_version             VARCHAR(20) NOT NULL DEFAULT '2022',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_soc2_item_control UNIQUE (evidence_item_id, control_id)
);

CREATE INDEX IF NOT EXISTS idx_soc2_icm_item ON soc2.item_control_mappings(evidence_item_id);
CREATE INDEX IF NOT EXISTS idx_soc2_icm_control ON soc2.item_control_mappings(control_id);

-- ========== Control applicability (per assessment cycle) ==========
CREATE TABLE IF NOT EXISTS soc2.control_applicability (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id          UUID NOT NULL REFERENCES core.assessment_cycles(id) ON DELETE CASCADE,
    control_id        VARCHAR(20) NOT NULL REFERENCES soc2.controls(id),
    applicability     soc2.control_type NOT NULL,
    is_overridden     BOOLEAN NOT NULL DEFAULT false,
    override_reason   TEXT,
    score             NUMERIC(5,2) DEFAULT 0,
    status            soc2.sufficiency_status NOT NULL DEFAULT 'not_started',
    evidence_count    INTEGER NOT NULL DEFAULT 0,
    soc_version       VARCHAR(20) NOT NULL DEFAULT '2022',
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_soc2_cycle_control UNIQUE (cycle_id, control_id)
);

CREATE INDEX IF NOT EXISTS idx_soc2_ca_cycle ON soc2.control_applicability(cycle_id);

-- ========== Evidence submissions ==========
CREATE TABLE IF NOT EXISTS soc2.evidence_submissions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id          UUID NOT NULL REFERENCES core.assessment_cycles(id) ON DELETE CASCADE,
    tenant_id         UUID NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
    evidence_item_id  VARCHAR(10) NOT NULL REFERENCES soc2.canonical_evidence_items(id),
    submitted_by      UUID REFERENCES core.users(id),
    status            soc2.evidence_status NOT NULL DEFAULT 'draft',
    scope_key         VARCHAR(255),
    form_data         JSONB DEFAULT '{}',
    completion_pct    NUMERIC(5,2) DEFAULT 0,
    version           INTEGER NOT NULL DEFAULT 1,
    ai_summary        TEXT,
    ai_confidence     NUMERIC(5,2),
    submitted_at      TIMESTAMPTZ,
    evaluation_edits  JSONB NOT NULL DEFAULT '{}',
    evaluation_remediation TEXT,
    soc_version       VARCHAR(20) NOT NULL DEFAULT '2022',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_soc2_es_cycle ON soc2.evidence_submissions(cycle_id);
CREATE INDEX IF NOT EXISTS idx_soc2_es_tenant ON soc2.evidence_submissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_soc2_es_item ON soc2.evidence_submissions(evidence_item_id);
CREATE INDEX IF NOT EXISTS idx_soc2_es_status ON soc2.evidence_submissions(status);

-- ========== Evidence attachments ==========
CREATE TABLE IF NOT EXISTS soc2.evidence_attachments (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id     UUID NOT NULL REFERENCES soc2.evidence_submissions(id) ON DELETE CASCADE,
    file_name         VARCHAR(500) NOT NULL,
    file_type         VARCHAR(100) NOT NULL,
    file_size_bytes   BIGINT NOT NULL DEFAULT 0,
    storage_path      VARCHAR(1000) NOT NULL,
    sha256_hash       VARCHAR(64),
    upload_status     soc2.upload_status NOT NULL DEFAULT 'uploaded',
    uploaded_by       UUID REFERENCES core.users(id),
    soc_version       VARCHAR(20) NOT NULL DEFAULT '2022',
    uploaded_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_soc2_ea_submission ON soc2.evidence_attachments(submission_id);

-- ========== Sufficiency scores ==========
CREATE TABLE IF NOT EXISTS soc2.sufficiency_scores (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id          UUID NOT NULL REFERENCES core.assessment_cycles(id) ON DELETE CASCADE,
    control_id        VARCHAR(20) NOT NULL REFERENCES soc2.controls(id),
    overall_score     NUMERIC(5,2) DEFAULT 0,
    status            soc2.sufficiency_status NOT NULL DEFAULT 'not_started',
    last_evaluated_at TIMESTAMPTZ,
    soc_version       VARCHAR(20) NOT NULL DEFAULT '2022',
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_soc2_suf_cycle_control UNIQUE (cycle_id, control_id)
);

CREATE INDEX IF NOT EXISTS idx_soc2_ss_cycle ON soc2.sufficiency_scores(cycle_id);

-- ========== Sufficiency evaluations ==========
CREATE TABLE IF NOT EXISTS soc2.sufficiency_evaluations (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id     UUID NOT NULL REFERENCES soc2.evidence_submissions(id) ON DELETE CASCADE,
    dimension_code    VARCHAR(50) NOT NULL,
    score             NUMERIC(5,2) NOT NULL DEFAULT 0,
    rationale         TEXT,
    source            soc2.evaluation_source NOT NULL DEFAULT 'system',
    evaluated_by      UUID REFERENCES core.users(id),
    soc_version       VARCHAR(20) NOT NULL DEFAULT '2022',
    evaluated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_soc2_se_submission ON soc2.sufficiency_evaluations(submission_id);

-- ========== Review assignments ==========
CREATE TABLE IF NOT EXISTS soc2.review_assignments (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id     UUID NOT NULL REFERENCES soc2.evidence_submissions(id) ON DELETE CASCADE,
    reviewer_id       UUID NOT NULL REFERENCES core.users(id),
    level             soc2.review_level NOT NULL,
    status            soc2.review_status NOT NULL DEFAULT 'assigned',
    decision          soc2.review_decision,
    sla_due_at        TIMESTAMPTZ,
    started_at        TIMESTAMPTZ,
    completed_at      TIMESTAMPTZ,
    checklist_results JSONB NOT NULL DEFAULT '{}',
    soc_version       VARCHAR(20) NOT NULL DEFAULT '2022',
    assigned_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_soc2_ra_submission ON soc2.review_assignments(submission_id);
CREATE INDEX IF NOT EXISTS idx_soc2_ra_reviewer ON soc2.review_assignments(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_soc2_ra_status ON soc2.review_assignments(status);

-- ========== Review comments ==========
CREATE TABLE IF NOT EXISTS soc2.review_comments (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id         UUID NOT NULL REFERENCES soc2.review_assignments(id) ON DELETE CASCADE,
    author_id         UUID NOT NULL REFERENCES core.users(id),
    parent_id         UUID REFERENCES soc2.review_comments(id),
    body              TEXT NOT NULL,
    mentions          UUID[] DEFAULT '{}',
    is_resolved       BOOLEAN NOT NULL DEFAULT false,
    resolved_by       UUID REFERENCES core.users(id),
    soc_version       VARCHAR(20) NOT NULL DEFAULT '2022',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_soc2_rc_review ON soc2.review_comments(review_id);

-- ========== Approval gates ==========
CREATE TABLE IF NOT EXISTS soc2.approval_gates (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id          UUID NOT NULL REFERENCES core.assessment_cycles(id) ON DELETE CASCADE,
    gate              soc2.gate_type NOT NULL,
    status            soc2.gate_status NOT NULL DEFAULT 'pending',
    approved_by       UUID REFERENCES core.users(id),
    approved_at       TIMESTAMPTZ,
    mfa_verified      BOOLEAN NOT NULL DEFAULT false,
    notes             TEXT,
    soc_version       VARCHAR(20) NOT NULL DEFAULT '2022',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_soc2_gate_cycle UNIQUE (cycle_id, gate)
);

CREATE INDEX IF NOT EXISTS idx_soc2_ag_cycle ON soc2.approval_gates(cycle_id);

-- ========== Assessment reports ==========
CREATE TABLE IF NOT EXISTS soc2.assessment_reports (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id          UUID NOT NULL REFERENCES core.assessment_cycles(id) ON DELETE CASCADE,
    report_kind       soc2.report_type NOT NULL DEFAULT 'draft',
    sections          JSONB DEFAULT '[]',
    snapshot_data      JSONB DEFAULT '{}',
    generated_by      UUID REFERENCES core.users(id),
    finalized_at      TIMESTAMPTZ,
    soc_version       VARCHAR(20) NOT NULL DEFAULT '2022',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_soc2_ar_cycle ON soc2.assessment_reports(cycle_id);

-- ========== Evidence sufficiency matrix ==========
CREATE TABLE IF NOT EXISTS soc2.evidence_sufficiency_matrix (
    item_code             VARCHAR(10) NOT NULL REFERENCES soc2.canonical_evidence_items(id),
    control_id            VARCHAR(20) NOT NULL REFERENCES soc2.controls(id),
    evidence_item_name    VARCHAR(255) NOT NULL,
    control_name          VARCHAR(255) NOT NULL,
    mandatory_advisory    VARCHAR(1) NOT NULL,
    evidence_type         VARCHAR(100) NOT NULL,
    sufficiency_criteria  JSONB,
    evaluation_criteria   JSONB,
    soc_version           VARCHAR(20) NOT NULL DEFAULT '2022',
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (item_code, control_id)
);

CREATE INDEX IF NOT EXISTS idx_soc2_esm_item ON soc2.evidence_sufficiency_matrix(item_code);
CREATE INDEX IF NOT EXISTS idx_soc2_esm_control ON soc2.evidence_sufficiency_matrix(control_id);

-- ========== Reviewer checklist ==========
CREATE TABLE IF NOT EXISTS soc2.reviewer_checklist (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_code             VARCHAR(10) NOT NULL,
    evidence_item         VARCHAR(500) NOT NULL,
    control_id            VARCHAR(20) NOT NULL,
    control_name          VARCHAR(500) NOT NULL,
    mandatory_advisory    VARCHAR(10) NOT NULL DEFAULT 'M',
    l1_check              JSONB,
    l2_check              JSONB,
    l3_check              JSONB,
    soc_version           VARCHAR(20) NOT NULL DEFAULT '2022',
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_soc2_rc_item ON soc2.reviewer_checklist(item_code);
CREATE INDEX IF NOT EXISTS idx_soc2_rc_control ON soc2.reviewer_checklist(control_id);
CREATE INDEX IF NOT EXISTS idx_soc2_rc_item_control ON soc2.reviewer_checklist(item_code, control_id);

-- ========== Evidence submission history ==========
CREATE TABLE IF NOT EXISTS soc2.evidence_submission_history (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id  UUID NOT NULL REFERENCES soc2.evidence_submissions(id) ON DELETE CASCADE,
    version        INTEGER NOT NULL,
    changed_by     UUID REFERENCES core.users(id),
    changed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    change_type    VARCHAR(50) NOT NULL,
    snapshot_before JSONB,
    snapshot_after  JSONB,
    justification  TEXT
);

CREATE INDEX IF NOT EXISTS idx_soc2_esh_submission ON soc2.evidence_submission_history(submission_id);
CREATE INDEX IF NOT EXISTS idx_soc2_esh_changed_at ON soc2.evidence_submission_history(changed_at);

-- ========== Notes ==========
CREATE TABLE IF NOT EXISTS soc2.notes (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id      UUID NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
    resource_type  VARCHAR(50) NOT NULL,
    resource_id    UUID NOT NULL,
    parent_id      UUID REFERENCES soc2.notes(id) ON DELETE CASCADE,
    author_id     UUID NOT NULL REFERENCES core.users(id),
    body          TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_soc2_notes_resource ON soc2.notes(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_soc2_notes_created ON soc2.notes(resource_type, resource_id, created_at);

-- ========== Notifications ==========
CREATE TABLE IF NOT EXISTS soc2.notifications (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    resource_type  VARCHAR(50) NOT NULL,
    resource_id    UUID NOT NULL,
    action         VARCHAR(50) NOT NULL,
    actor_id       UUID REFERENCES core.users(id),
    title          VARCHAR(255),
    body           TEXT,
    read_at        TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_soc2_notif_user_created ON soc2.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_soc2_notif_user_unread ON soc2.notifications(user_id) WHERE read_at IS NULL;

-- ========== Audit log ==========
CREATE TABLE IF NOT EXISTS soc2.audit_log (
    id             BIGSERIAL,
    tenant_id      UUID REFERENCES core.tenants(id),
    user_id        UUID REFERENCES core.users(id),
    action         VARCHAR(100) NOT NULL,
    resource_type  VARCHAR(50) NOT NULL,
    resource_id    UUID,
    metadata       JSONB DEFAULT '{}',
    ip_address     INET,
    soc_version    VARCHAR(20) NOT NULL DEFAULT '2022',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_soc2_al_tenant ON soc2.audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_soc2_al_user ON soc2.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_soc2_al_action ON soc2.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_soc2_al_created ON soc2.audit_log(created_at);

COMMIT;
