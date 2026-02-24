-- ============================================================
-- SWIFT CSCF v2025 Compliance Platform — Schema DDL
-- Run as: psql -U postgres -d compliance -f backend/sql/01_schema_ddl.sql
-- ============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS cscf_2025_new;
SET search_path TO cscf_2025_new;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES (21)
-- ============================================================

DO $$ BEGIN
  CREATE TYPE architecture_type     AS ENUM ('A1','A2','A3','A4','B');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_role              AS ENUM ('admin','compliance_officer','it_sme','internal_reviewer','external_assessor','approver');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE assessment_phase       AS ENUM ('setup','collection','review','approval','reporting','submitted','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE control_type           AS ENUM ('mandatory','advisory');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE collection_priority    AS ENUM ('critical','high','medium');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reuse_tier             AS ENUM ('foundational','ultra_high','high','moderate','control_specific');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE collection_model       AS ENUM ('standard','per_system','per_vendor','per_quarter');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE evidence_status        AS ENUM ('draft','submitted','in_review','returned','approved','escalated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE review_level           AS ENUM ('l1_completeness','l2_quality','l3_assessment');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE review_status          AS ENUM ('assigned','in_progress','approved','returned','escalated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE review_decision        AS ENUM ('approve','return','escalate');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE gate_type              AS ENUM ('evidence_complete','internal_review','assessment_complete','final_attestation');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE gate_status            AS ENUM ('pending','approved','blocked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE sufficiency_status     AS ENUM ('not_started','insufficient','partial','sufficient');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE evaluation_source      AS ENUM ('system','ai','human');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE upload_status          AS ENUM ('uploading','uploaded','processing','processed','failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE report_type            AS ENUM ('draft','final');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE compliance_status      AS ENUM ('compliant','non_compliant','partial');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE vendor_classification  AS ENUM ('outsourcing_agent','connectivity_provider','it_provider','cloud_provider','software_vendor','consulting_firm');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE vendor_access          AS ENUM ('remote','on_site','both','none');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE subscription_tier      AS ENUM ('trial','professional','enterprise');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ============================================================
-- TABLES (20)
-- ============================================================

-- 1. tenants
CREATE TABLE IF NOT EXISTS tenants (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name             VARCHAR(255) NOT NULL,
    slug             VARCHAR(100) NOT NULL,
    bic_code         VARCHAR(11),
    architecture     architecture_type,
    subscription     subscription_tier NOT NULL DEFAULT 'trial',
    settings         JSONB DEFAULT '{}',
    is_active        BOOLEAN NOT NULL DEFAULT true,
    cscf_version     VARCHAR(10) NOT NULL DEFAULT '2025v',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_tenants_slug UNIQUE (slug)
);

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);

-- 2. users
CREATE TABLE IF NOT EXISTS users (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id        UUID REFERENCES tenants(id) ON DELETE SET NULL,
    email            VARCHAR(255) NOT NULL,
    password_hash    VARCHAR(255) NOT NULL,
    name             VARCHAR(255) NOT NULL,
    role             user_role NOT NULL DEFAULT 'it_sme',
    mfa_enabled      BOOLEAN NOT NULL DEFAULT false,
    is_active        BOOLEAN NOT NULL DEFAULT true,
    last_login_at    TIMESTAMPTZ,
    cscf_version     VARCHAR(10) NOT NULL DEFAULT '2025v',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_users_email_tenant UNIQUE (email, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email  ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role   ON users(role);

-- 3. audit_frameworks
CREATE TABLE IF NOT EXISTS audit_frameworks (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code             VARCHAR(30) NOT NULL UNIQUE,
    name             VARCHAR(255) NOT NULL,
    version          VARCHAR(20) NOT NULL,
    effective_date   DATE,
    metadata         JSONB DEFAULT '{}',
    is_active        BOOLEAN NOT NULL DEFAULT true,
    cscf_version     VARCHAR(10) NOT NULL DEFAULT '2025v',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. controls
CREATE TABLE IF NOT EXISTS controls (
    id                          VARCHAR(10) PRIMARY KEY,
    name                        VARCHAR(255) NOT NULL,
    control_type                control_type NOT NULL,
    objective                   INTEGER NOT NULL CHECK (objective BETWEEN 1 AND 3),
    architecture_applicability  TEXT[] NOT NULL DEFAULT '{}',
    description                 TEXT,
    cscf_version                VARCHAR(10) NOT NULL DEFAULT '2025v',
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. evidence_domains
CREATE TABLE IF NOT EXISTS evidence_domains (
    id               CHAR(1) PRIMARY KEY,
    name             VARCHAR(255) NOT NULL,
    color            VARCHAR(10),
    accent_color     VARCHAR(10),
    item_count       INTEGER NOT NULL DEFAULT 0,
    sort_order       INTEGER NOT NULL,
    cscf_version     VARCHAR(10) NOT NULL DEFAULT '2025v',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. canonical_evidence_items
CREATE TABLE IF NOT EXISTS canonical_evidence_items (
    id                    VARCHAR(5) PRIMARY KEY,
    domain_id             CHAR(1) NOT NULL REFERENCES evidence_domains(id),
    sort_order            INTEGER NOT NULL,
    name                  VARCHAR(255) NOT NULL,
    priority              collection_priority NOT NULL DEFAULT 'medium',
    evidence_type         VARCHAR(100) NOT NULL,
    description           TEXT NOT NULL,
    reduction_note        TEXT,
    control_count         INTEGER NOT NULL DEFAULT 0,
    collection_model      collection_model NOT NULL DEFAULT 'standard',
    reuse_tier            reuse_tier NOT NULL DEFAULT 'control_specific',
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
    cscf_version          VARCHAR(10) NOT NULL DEFAULT '2025v',
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cei_domain ON canonical_evidence_items(domain_id);

-- 7. item_control_mappings
CREATE TABLE IF NOT EXISTS item_control_mappings (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_item_id        VARCHAR(5) NOT NULL REFERENCES canonical_evidence_items(id),
    control_id              VARCHAR(10) NOT NULL REFERENCES controls(id),
    is_primary              BOOLEAN NOT NULL DEFAULT false,
    weight                  NUMERIC(5,2) DEFAULT 1.0,
    sufficiency_requirement TEXT,
    cscf_version            VARCHAR(10) NOT NULL DEFAULT '2025v',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_item_control UNIQUE (evidence_item_id, control_id)
);

CREATE INDEX IF NOT EXISTS idx_icm_item    ON item_control_mappings(evidence_item_id);
CREATE INDEX IF NOT EXISTS idx_icm_control ON item_control_mappings(control_id);

-- 8. cross_domain_dependencies
CREATE TABLE IF NOT EXISTS cross_domain_dependencies (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_item_id    VARCHAR(5) NOT NULL REFERENCES canonical_evidence_items(id),
    target_item_id    VARCHAR(5) NOT NULL REFERENCES canonical_evidence_items(id),
    dependency_type   VARCHAR(50) NOT NULL DEFAULT 'validates',
    description       TEXT,
    cscf_version      VARCHAR(10) NOT NULL DEFAULT '2025v',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_dependency UNIQUE (source_item_id, target_item_id)
);

-- 9. assessment_cycles
CREATE TABLE IF NOT EXISTS assessment_cycles (
    id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id                UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    framework_id             UUID REFERENCES audit_frameworks(id),
    label                    VARCHAR(255) NOT NULL,
    cycle_year               INTEGER NOT NULL,
    phase                    assessment_phase NOT NULL DEFAULT 'setup',
    architecture_type        architecture_type,
    start_date               DATE,
    target_submission_date   DATE,
    snapshot_data            JSONB DEFAULT '{}',
    previous_cycle_id        UUID REFERENCES assessment_cycles(id),
    created_by               UUID REFERENCES users(id),
    cscf_version             VARCHAR(10) NOT NULL DEFAULT '2025v',
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ac_tenant ON assessment_cycles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ac_phase  ON assessment_cycles(phase);

-- 10. control_applicability
CREATE TABLE IF NOT EXISTS control_applicability (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cycle_id          UUID NOT NULL REFERENCES assessment_cycles(id) ON DELETE CASCADE,
    control_id        VARCHAR(10) NOT NULL REFERENCES controls(id),
    applicability     control_type NOT NULL,
    is_overridden     BOOLEAN NOT NULL DEFAULT false,
    override_reason   TEXT,
    score             NUMERIC(5,2) DEFAULT 0,
    status            sufficiency_status NOT NULL DEFAULT 'not_started',
    evidence_count    INTEGER NOT NULL DEFAULT 0,
    cscf_version      VARCHAR(10) NOT NULL DEFAULT '2025v',
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_cycle_control UNIQUE (cycle_id, control_id)
);

CREATE INDEX IF NOT EXISTS idx_ca_cycle ON control_applicability(cycle_id);

-- 11. evidence_submissions
CREATE TABLE IF NOT EXISTS evidence_submissions (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cycle_id          UUID NOT NULL REFERENCES assessment_cycles(id) ON DELETE CASCADE,
    tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    evidence_item_id  VARCHAR(5) NOT NULL REFERENCES canonical_evidence_items(id),
    submitted_by      UUID REFERENCES users(id),
    status            evidence_status NOT NULL DEFAULT 'draft',
    scope_key         VARCHAR(255),
    form_data         JSONB DEFAULT '{}',
    completion_pct    NUMERIC(5,2) DEFAULT 0,
    version           INTEGER NOT NULL DEFAULT 1,
    ai_summary        TEXT,
    ai_confidence     NUMERIC(5,2),
    submitted_at      TIMESTAMPTZ,
    cscf_version      VARCHAR(10) NOT NULL DEFAULT '2025v',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_es_cycle   ON evidence_submissions(cycle_id);
CREATE INDEX IF NOT EXISTS idx_es_tenant  ON evidence_submissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_es_item    ON evidence_submissions(evidence_item_id);
CREATE INDEX IF NOT EXISTS idx_es_status  ON evidence_submissions(status);

-- 12. evidence_attachments
CREATE TABLE IF NOT EXISTS evidence_attachments (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id     UUID NOT NULL REFERENCES evidence_submissions(id) ON DELETE CASCADE,
    file_name         VARCHAR(500) NOT NULL,
    file_type         VARCHAR(100) NOT NULL,
    file_size_bytes   BIGINT NOT NULL DEFAULT 0,
    storage_path      VARCHAR(1000) NOT NULL,
    sha256_hash       VARCHAR(64),
    upload_status     upload_status NOT NULL DEFAULT 'uploaded',
    uploaded_by       UUID REFERENCES users(id),
    cscf_version      VARCHAR(10) NOT NULL DEFAULT '2025v',
    uploaded_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ea_submission ON evidence_attachments(submission_id);

-- 13. vendor_registry
CREATE TABLE IF NOT EXISTS vendor_registry (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cycle_id             UUID NOT NULL REFERENCES assessment_cycles(id) ON DELETE CASCADE,
    tenant_id            UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name                 VARCHAR(255) NOT NULL,
    classification       vendor_classification NOT NULL DEFAULT 'it_provider',
    access_type          vendor_access NOT NULL DEFAULT 'none',
    swift_components     TEXT,
    risk_rating          VARCHAR(20),
    is_active            BOOLEAN NOT NULL DEFAULT true,
    cscf_version         VARCHAR(10) NOT NULL DEFAULT '2025v',
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vr_cycle  ON vendor_registry(cycle_id);
CREATE INDEX IF NOT EXISTS idx_vr_tenant ON vendor_registry(tenant_id);

-- 14. sufficiency_scores
CREATE TABLE IF NOT EXISTS sufficiency_scores (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cycle_id          UUID NOT NULL REFERENCES assessment_cycles(id) ON DELETE CASCADE,
    control_id        VARCHAR(10) NOT NULL REFERENCES controls(id),
    overall_score     NUMERIC(5,2) DEFAULT 0,
    status            sufficiency_status NOT NULL DEFAULT 'not_started',
    last_evaluated_at TIMESTAMPTZ,
    cscf_version      VARCHAR(10) NOT NULL DEFAULT '2025v',
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_suf_cycle_control UNIQUE (cycle_id, control_id)
);

CREATE INDEX IF NOT EXISTS idx_ss_cycle ON sufficiency_scores(cycle_id);

-- 15. sufficiency_evaluations
CREATE TABLE IF NOT EXISTS sufficiency_evaluations (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id     UUID NOT NULL REFERENCES evidence_submissions(id) ON DELETE CASCADE,
    dimension_code    VARCHAR(50) NOT NULL,
    score             NUMERIC(5,2) NOT NULL DEFAULT 0,
    rationale         TEXT,
    source            evaluation_source NOT NULL DEFAULT 'system',
    evaluated_by      UUID REFERENCES users(id),
    cscf_version      VARCHAR(10) NOT NULL DEFAULT '2025v',
    evaluated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_se_submission ON sufficiency_evaluations(submission_id);

-- 16. review_assignments
CREATE TABLE IF NOT EXISTS review_assignments (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id     UUID NOT NULL REFERENCES evidence_submissions(id) ON DELETE CASCADE,
    reviewer_id       UUID NOT NULL REFERENCES users(id),
    level             review_level NOT NULL,
    status            review_status NOT NULL DEFAULT 'assigned',
    decision          review_decision,
    sla_due_at        TIMESTAMPTZ,
    started_at        TIMESTAMPTZ,
    completed_at      TIMESTAMPTZ,
    cscf_version      VARCHAR(10) NOT NULL DEFAULT '2025v',
    assigned_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ra_submission ON review_assignments(submission_id);
CREATE INDEX IF NOT EXISTS idx_ra_reviewer   ON review_assignments(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_ra_status     ON review_assignments(status);

-- 17. review_comments
CREATE TABLE IF NOT EXISTS review_comments (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id         UUID NOT NULL REFERENCES review_assignments(id) ON DELETE CASCADE,
    author_id         UUID NOT NULL REFERENCES users(id),
    parent_id         UUID REFERENCES review_comments(id),
    body              TEXT NOT NULL,
    mentions          UUID[] DEFAULT '{}',
    is_resolved       BOOLEAN NOT NULL DEFAULT false,
    resolved_by       UUID REFERENCES users(id),
    cscf_version      VARCHAR(10) NOT NULL DEFAULT '2025v',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rc_review ON review_comments(review_id);

-- 18. approval_gates
CREATE TABLE IF NOT EXISTS approval_gates (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cycle_id          UUID NOT NULL REFERENCES assessment_cycles(id) ON DELETE CASCADE,
    gate              gate_type NOT NULL,
    status            gate_status NOT NULL DEFAULT 'pending',
    approved_by       UUID REFERENCES users(id),
    approved_at       TIMESTAMPTZ,
    mfa_verified      BOOLEAN NOT NULL DEFAULT false,
    notes             TEXT,
    cscf_version      VARCHAR(10) NOT NULL DEFAULT '2025v',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_gate_cycle UNIQUE (cycle_id, gate)
);

CREATE INDEX IF NOT EXISTS idx_ag_cycle ON approval_gates(cycle_id);

-- 19. assessment_reports
CREATE TABLE IF NOT EXISTS assessment_reports (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cycle_id          UUID NOT NULL REFERENCES assessment_cycles(id) ON DELETE CASCADE,
    report_kind       report_type NOT NULL DEFAULT 'draft',
    sections          JSONB DEFAULT '[]',
    snapshot_data     JSONB DEFAULT '{}',
    generated_by      UUID REFERENCES users(id),
    finalized_at      TIMESTAMPTZ,
    cscf_version      VARCHAR(10) NOT NULL DEFAULT '2025v',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ar_cycle ON assessment_reports(cycle_id);

-- 20. audit_log (partitioned by month)
CREATE TABLE IF NOT EXISTS audit_log (
    id                BIGSERIAL,
    tenant_id         UUID REFERENCES tenants(id),
    user_id           UUID REFERENCES users(id),
    action            VARCHAR(100) NOT NULL,
    resource_type     VARCHAR(50) NOT NULL,
    resource_id       UUID,
    metadata          JSONB DEFAULT '{}',
    ip_address        INET,
    cscf_version      VARCHAR(10) NOT NULL DEFAULT '2025v',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- 12 monthly partitions for 2026
DO $$
DECLARE
    m INTEGER;
    start_date TEXT;
    end_date TEXT;
    part_name TEXT;
BEGIN
    FOR m IN 1..12 LOOP
        start_date := format('2026-%s-01', lpad(m::text, 2, '0'));
        IF m < 12 THEN
            end_date := format('2026-%s-01', lpad((m+1)::text, 2, '0'));
        ELSE
            end_date := '2027-01-01';
        END IF;
        part_name := format('audit_log_2026_%s', lpad(m::text, 2, '0'));
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS %I PARTITION OF audit_log FOR VALUES FROM (%L) TO (%L)',
            part_name, start_date, end_date
        );
    END LOOP;
END $$;

-- Default partition for dates outside 2026
CREATE TABLE IF NOT EXISTS audit_log_default PARTITION OF audit_log DEFAULT;

CREATE INDEX IF NOT EXISTS idx_al_tenant  ON audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_al_user    ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_al_action  ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_al_created ON audit_log(created_at);


-- ============================================================
-- IMMUTABILITY TRIGGER on audit_log
-- ============================================================

CREATE OR REPLACE FUNCTION prevent_audit_log_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'audit_log is immutable: UPDATE and DELETE are not allowed';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_log_immutable ON audit_log;
CREATE TRIGGER trg_audit_log_immutable
    BEFORE UPDATE OR DELETE ON audit_log
    FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_mutation();


-- ============================================================
-- ROW-LEVEL SECURITY on 13 tenant-scoped tables
-- ============================================================

ALTER TABLE users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_cycles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_applicability  ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_submissions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_attachments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_registry        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sufficiency_scores     ENABLE ROW LEVEL SECURITY;
ALTER TABLE sufficiency_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_assignments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_comments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_gates         ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_reports     ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log              ENABLE ROW LEVEL SECURITY;

-- Policies: app user sees only rows matching their tenant
-- The application sets current_setting('app.current_tenant_id')

CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_tenant_id', true)::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- users
DROP POLICY IF EXISTS tenant_isolation_users ON users;
CREATE POLICY tenant_isolation_users ON users
    USING (tenant_id = current_tenant_id() OR current_setting('app.is_admin', true) = 'true');

-- assessment_cycles
DROP POLICY IF EXISTS tenant_isolation_ac ON assessment_cycles;
CREATE POLICY tenant_isolation_ac ON assessment_cycles
    USING (tenant_id = current_tenant_id() OR current_setting('app.is_admin', true) = 'true');

-- evidence_submissions
DROP POLICY IF EXISTS tenant_isolation_es ON evidence_submissions;
CREATE POLICY tenant_isolation_es ON evidence_submissions
    USING (tenant_id = current_tenant_id() OR current_setting('app.is_admin', true) = 'true');

-- vendor_registry
DROP POLICY IF EXISTS tenant_isolation_vr ON vendor_registry;
CREATE POLICY tenant_isolation_vr ON vendor_registry
    USING (tenant_id = current_tenant_id() OR current_setting('app.is_admin', true) = 'true');

-- audit_log
DROP POLICY IF EXISTS tenant_isolation_al ON audit_log;
CREATE POLICY tenant_isolation_al ON audit_log
    USING (tenant_id = current_tenant_id() OR current_setting('app.is_admin', true) = 'true');

-- For tables without direct tenant_id (linked via cycle_id), use subquery policies
-- control_applicability -> via cycle_id
DROP POLICY IF EXISTS tenant_isolation_ca ON control_applicability;
CREATE POLICY tenant_isolation_ca ON control_applicability
    USING (
        EXISTS (SELECT 1 FROM assessment_cycles ac WHERE ac.id = cycle_id AND (ac.tenant_id = current_tenant_id() OR current_setting('app.is_admin', true) = 'true'))
    );

-- sufficiency_scores -> via cycle_id
DROP POLICY IF EXISTS tenant_isolation_ss ON sufficiency_scores;
CREATE POLICY tenant_isolation_ss ON sufficiency_scores
    USING (
        EXISTS (SELECT 1 FROM assessment_cycles ac WHERE ac.id = cycle_id AND (ac.tenant_id = current_tenant_id() OR current_setting('app.is_admin', true) = 'true'))
    );

-- approval_gates -> via cycle_id
DROP POLICY IF EXISTS tenant_isolation_ag ON approval_gates;
CREATE POLICY tenant_isolation_ag ON approval_gates
    USING (
        EXISTS (SELECT 1 FROM assessment_cycles ac WHERE ac.id = cycle_id AND (ac.tenant_id = current_tenant_id() OR current_setting('app.is_admin', true) = 'true'))
    );

-- assessment_reports -> via cycle_id
DROP POLICY IF EXISTS tenant_isolation_ar ON assessment_reports;
CREATE POLICY tenant_isolation_ar ON assessment_reports
    USING (
        EXISTS (SELECT 1 FROM assessment_cycles ac WHERE ac.id = cycle_id AND (ac.tenant_id = current_tenant_id() OR current_setting('app.is_admin', true) = 'true'))
    );

-- evidence_attachments -> via submission_id -> evidence_submissions
DROP POLICY IF EXISTS tenant_isolation_ea ON evidence_attachments;
CREATE POLICY tenant_isolation_ea ON evidence_attachments
    USING (
        EXISTS (SELECT 1 FROM evidence_submissions es WHERE es.id = submission_id AND (es.tenant_id = current_tenant_id() OR current_setting('app.is_admin', true) = 'true'))
    );

-- sufficiency_evaluations -> via submission_id -> evidence_submissions
DROP POLICY IF EXISTS tenant_isolation_sev ON sufficiency_evaluations;
CREATE POLICY tenant_isolation_sev ON sufficiency_evaluations
    USING (
        EXISTS (SELECT 1 FROM evidence_submissions es WHERE es.id = submission_id AND (es.tenant_id = current_tenant_id() OR current_setting('app.is_admin', true) = 'true'))
    );

-- review_assignments -> via submission_id -> evidence_submissions
DROP POLICY IF EXISTS tenant_isolation_ra ON review_assignments;
CREATE POLICY tenant_isolation_ra ON review_assignments
    USING (
        EXISTS (SELECT 1 FROM evidence_submissions es WHERE es.id = submission_id AND (es.tenant_id = current_tenant_id() OR current_setting('app.is_admin', true) = 'true'))
    );

-- review_comments -> via review_id -> review_assignments -> evidence_submissions
DROP POLICY IF EXISTS tenant_isolation_rc ON review_comments;
CREATE POLICY tenant_isolation_rc ON review_comments
    USING (
        EXISTS (
            SELECT 1 FROM review_assignments ra
            JOIN evidence_submissions es ON es.id = ra.submission_id
            WHERE ra.id = review_id AND (es.tenant_id = current_tenant_id() OR current_setting('app.is_admin', true) = 'true')
        )
    );

COMMIT;
