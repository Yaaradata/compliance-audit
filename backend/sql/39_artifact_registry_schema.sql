BEGIN;

CREATE SCHEMA IF NOT EXISTS artifact_registry;

DO $$ BEGIN
  CREATE TYPE artifact_registry.artifact_type AS ENUM ('file','form_response','composite','aws_collected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE artifact_registry.artifact_status AS ENUM (
    'draft','submitted','ai_evaluated','pending_l1_review','l1_approved','l1_rejected',
    'pending_l2_review','l2_approved','l2_rejected','pending_approval','approved','rejected','archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE artifact_registry.link_type AS ENUM ('primary','supporting','cross_reference');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE artifact_registry.sufficiency_status AS ENUM ('pending','sufficient','insufficient','partial');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE artifact_registry.reviewer_status AS ENUM (
    'not_started','pending_l1','l1_approved','l1_rejected','pending_l2','l2_approved',
    'l2_rejected','pending_approval','approved','rejected'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE artifact_registry.reuse_category AS ENUM ('always_reusable','date_sensitive','config_refresh','version_dependent','never_reuse');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE artifact_registry.trail_action AS ENUM (
    'created','file_uploaded','form_saved','aws_auto_filled','ai_evaluated','submitted','l1_reviewed',
    'l1_approved','l1_rejected','l2_reviewed','l2_approved','l2_rejected','approval_submitted',
    'approved','rejected','reused_from_prior','version_created','archived','comment_added'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE artifact_registry.cross_check_status AS ENUM ('pending','passed','failed','not_applicable');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION artifact_registry.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION artifact_registry.prevent_audit_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_trail is immutable: % operations are not permitted', TG_OP;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS artifact_registry.artifacts (
  artifact_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_type artifact_registry.artifact_type NOT NULL,
  evidence_item_id VARCHAR(10) NOT NULL,
  framework_schema VARCHAR(50) NOT NULL,
  cscf_version VARCHAR(10) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  file_path VARCHAR(1000),
  file_hash_sha256 VARCHAR(64),
  file_size_bytes BIGINT,
  mime_type VARCHAR(200),
  original_filename VARCHAR(500),
  form_data_json JSONB,
  submission_id UUID,
  cycle_id UUID NOT NULL REFERENCES core.assessment_cycles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES core.users(id),
  status artifact_registry.artifact_status NOT NULL DEFAULT 'draft',
  version INTEGER NOT NULL DEFAULT 1,
  parent_artifact_id UUID REFERENCES artifact_registry.artifacts(artifact_id),
  reuse_source_id UUID REFERENCES artifact_registry.artifacts(artifact_id),
  reuse_source_cycle_id UUID,
  aws_metadata JSONB,
  tags TEXT[],
  metadata JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_art_tenant ON artifact_registry.artifacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_art_cycle ON artifact_registry.artifacts(cycle_id);
CREATE INDEX IF NOT EXISTS idx_art_item ON artifact_registry.artifacts(evidence_item_id);
CREATE INDEX IF NOT EXISTS idx_art_status ON artifact_registry.artifacts(status);
CREATE INDEX IF NOT EXISTS idx_art_schema ON artifact_registry.artifacts(framework_schema);
CREATE INDEX IF NOT EXISTS idx_art_version ON artifact_registry.artifacts(cscf_version);
CREATE INDEX IF NOT EXISTS idx_art_reuse ON artifact_registry.artifacts(reuse_source_id) WHERE reuse_source_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_art_parent ON artifact_registry.artifacts(parent_artifact_id) WHERE parent_artifact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_art_tags ON artifact_registry.artifacts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_art_form ON artifact_registry.artifacts USING GIN(form_data_json) WHERE form_data_json IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_art_tenant_cycle_item ON artifact_registry.artifacts(tenant_id, cycle_id, evidence_item_id);
CREATE INDEX IF NOT EXISTS idx_art_submission ON artifact_registry.artifacts(submission_id) WHERE submission_id IS NOT NULL;
ALTER TABLE artifact_registry.artifacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS artifacts_tenant_policy ON artifact_registry.artifacts;
CREATE POLICY artifacts_tenant_policy ON artifact_registry.artifacts
USING (tenant_id = current_setting('app.current_tenant_id')::uuid OR current_setting('app.is_admin', true) = 'true');
DROP TRIGGER IF EXISTS trg_artifacts_updated_at ON artifact_registry.artifacts;
CREATE TRIGGER trg_artifacts_updated_at BEFORE UPDATE ON artifact_registry.artifacts
FOR EACH ROW EXECUTE FUNCTION artifact_registry.set_updated_at();

CREATE TABLE IF NOT EXISTS artifact_registry.artifact_control_links (
  link_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id UUID NOT NULL REFERENCES artifact_registry.artifacts(artifact_id) ON DELETE CASCADE,
  control_id VARCHAR(10) NOT NULL,
  evidence_item_id VARCHAR(10) NOT NULL,
  cycle_id UUID NOT NULL REFERENCES core.assessment_cycles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  framework_schema VARCHAR(50) NOT NULL,
  link_type artifact_registry.link_type NOT NULL DEFAULT 'primary',
  sufficiency_status artifact_registry.sufficiency_status NOT NULL DEFAULT 'pending',
  ai_score FLOAT,
  ai_evaluation_json JSONB,
  sufficiency_evaluation_id UUID,
  reviewer_status artifact_registry.reviewer_status NOT NULL DEFAULT 'not_started',
  l1_reviewer_id UUID REFERENCES core.users(id),
  l1_reviewed_at TIMESTAMPTZ,
  l1_comment TEXT,
  l2_reviewer_id UUID REFERENCES core.users(id),
  l2_reviewed_at TIMESTAMPTZ,
  l2_comment TEXT,
  approver_id UUID REFERENCES core.users(id),
  approved_at TIMESTAMPTZ,
  approver_comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(artifact_id, control_id, cycle_id)
);
CREATE INDEX IF NOT EXISTS idx_acl_artifact ON artifact_registry.artifact_control_links(artifact_id);
CREATE INDEX IF NOT EXISTS idx_acl_control ON artifact_registry.artifact_control_links(control_id);
CREATE INDEX IF NOT EXISTS idx_acl_cycle ON artifact_registry.artifact_control_links(cycle_id);
CREATE INDEX IF NOT EXISTS idx_acl_tenant ON artifact_registry.artifact_control_links(tenant_id);
CREATE INDEX IF NOT EXISTS idx_acl_rstatus ON artifact_registry.artifact_control_links(reviewer_status);
CREATE INDEX IF NOT EXISTS idx_acl_ctrl_cycle ON artifact_registry.artifact_control_links(control_id, cycle_id);
CREATE INDEX IF NOT EXISTS idx_acl_item_cycle ON artifact_registry.artifact_control_links(evidence_item_id, cycle_id);
ALTER TABLE artifact_registry.artifact_control_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS acl_tenant_policy ON artifact_registry.artifact_control_links;
CREATE POLICY acl_tenant_policy ON artifact_registry.artifact_control_links
USING (tenant_id = current_setting('app.current_tenant_id')::uuid OR current_setting('app.is_admin', true) = 'true');
DROP TRIGGER IF EXISTS trg_acl_updated_at ON artifact_registry.artifact_control_links;
CREATE TRIGGER trg_acl_updated_at BEFORE UPDATE ON artifact_registry.artifact_control_links
FOR EACH ROW EXECUTE FUNCTION artifact_registry.set_updated_at();

CREATE TABLE IF NOT EXISTS artifact_registry.cross_checks (
  cross_check_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_link_id UUID NOT NULL REFERENCES artifact_registry.artifact_control_links(link_id) ON DELETE CASCADE,
  source_artifact_id UUID NOT NULL REFERENCES artifact_registry.artifacts(artifact_id),
  source_evidence_item VARCHAR(10) NOT NULL,
  source_control_id VARCHAR(10) NOT NULL,
  target_evidence_item VARCHAR(10) NOT NULL,
  check_description TEXT NOT NULL,
  target_artifact_id UUID REFERENCES artifact_registry.artifacts(artifact_id),
  status artifact_registry.cross_check_status NOT NULL DEFAULT 'pending',
  resolution_detail TEXT,
  ai_check_result JSONB,
  cycle_id UUID NOT NULL REFERENCES core.assessment_cycles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  framework_schema VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  UNIQUE(source_link_id, target_evidence_item)
);
CREATE INDEX IF NOT EXISTS idx_cc_target ON artifact_registry.cross_checks(target_evidence_item, cycle_id);
CREATE INDEX IF NOT EXISTS idx_cc_status ON artifact_registry.cross_checks(status);
CREATE INDEX IF NOT EXISTS idx_cc_tenant_cycle ON artifact_registry.cross_checks(tenant_id, cycle_id);
ALTER TABLE artifact_registry.cross_checks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cc_tenant_policy ON artifact_registry.cross_checks;
CREATE POLICY cc_tenant_policy ON artifact_registry.cross_checks
USING (tenant_id = current_setting('app.current_tenant_id')::uuid OR current_setting('app.is_admin', true) = 'true');

CREATE TABLE IF NOT EXISTS artifact_registry.reuse_rules (
  rule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_item_id VARCHAR(10) NOT NULL,
  framework_schema VARCHAR(50) NOT NULL,
  cscf_version VARCHAR(10) NOT NULL,
  reuse_category artifact_registry.reuse_category NOT NULL,
  max_age_days INTEGER,
  requires_reconfirmation BOOLEAN NOT NULL DEFAULT false,
  has_version_delta BOOLEAN NOT NULL DEFAULT false,
  version_delta_description TEXT,
  rules_metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(evidence_item_id, framework_schema, cscf_version)
);
DROP TRIGGER IF EXISTS trg_reuse_rules_updated_at ON artifact_registry.reuse_rules;
CREATE TRIGGER trg_reuse_rules_updated_at BEFORE UPDATE ON artifact_registry.reuse_rules
FOR EACH ROW EXECUTE FUNCTION artifact_registry.set_updated_at();

CREATE TABLE IF NOT EXISTS artifact_registry.reuse_records (
  reuse_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_artifact_id UUID NOT NULL REFERENCES artifact_registry.artifacts(artifact_id),
  target_cycle_id UUID NOT NULL REFERENCES core.assessment_cycles(id) ON DELETE CASCADE,
  source_artifact_id UUID NOT NULL REFERENCES artifact_registry.artifacts(artifact_id),
  source_cycle_id UUID NOT NULL REFERENCES core.assessment_cycles(id) ON DELETE CASCADE,
  source_cscf_version VARCHAR(10) NOT NULL,
  reuse_type VARCHAR(50) NOT NULL,
  reused_by UUID NOT NULL REFERENCES core.users(id),
  validity_check JSONB,
  tenant_id UUID NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(target_artifact_id, source_artifact_id)
);
ALTER TABLE artifact_registry.reuse_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rr_tenant_policy ON artifact_registry.reuse_records;
CREATE POLICY rr_tenant_policy ON artifact_registry.reuse_records
USING (tenant_id = current_setting('app.current_tenant_id')::uuid OR current_setting('app.is_admin', true) = 'true');

CREATE TABLE IF NOT EXISTS artifact_registry.audit_trail (
  trail_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id UUID NOT NULL REFERENCES artifact_registry.artifacts(artifact_id),
  control_id VARCHAR(10),
  cycle_id UUID NOT NULL REFERENCES core.assessment_cycles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  action artifact_registry.trail_action NOT NULL,
  from_status VARCHAR(50),
  to_status VARCHAR(50),
  performed_by UUID NOT NULL REFERENCES core.users(id),
  comment TEXT,
  action_metadata JSONB,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS trg_audit_no_update ON artifact_registry.audit_trail;
DROP TRIGGER IF EXISTS trg_audit_no_delete ON artifact_registry.audit_trail;
CREATE TRIGGER trg_audit_no_update BEFORE UPDATE ON artifact_registry.audit_trail
FOR EACH ROW EXECUTE FUNCTION artifact_registry.prevent_audit_mutation();
CREATE TRIGGER trg_audit_no_delete BEFORE DELETE ON artifact_registry.audit_trail
FOR EACH ROW EXECUTE FUNCTION artifact_registry.prevent_audit_mutation();
CREATE INDEX IF NOT EXISTS idx_trail_artifact ON artifact_registry.audit_trail(artifact_id);
CREATE INDEX IF NOT EXISTS idx_trail_cycle ON artifact_registry.audit_trail(cycle_id);
CREATE INDEX IF NOT EXISTS idx_trail_tenant ON artifact_registry.audit_trail(tenant_id);
CREATE INDEX IF NOT EXISTS idx_trail_action ON artifact_registry.audit_trail(action);
CREATE INDEX IF NOT EXISTS idx_trail_time ON artifact_registry.audit_trail(performed_at);
CREATE INDEX IF NOT EXISTS idx_trail_user ON artifact_registry.audit_trail(performed_by);
ALTER TABLE artifact_registry.audit_trail ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS trail_tenant_policy ON artifact_registry.audit_trail;
CREATE POLICY trail_tenant_policy ON artifact_registry.audit_trail
USING (tenant_id = current_setting('app.current_tenant_id')::uuid OR current_setting('app.is_admin', true) = 'true');

CREATE TABLE IF NOT EXISTS artifact_registry.comments (
  comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id UUID NOT NULL REFERENCES artifact_registry.artifacts(artifact_id),
  control_id VARCHAR(10),
  parent_comment_id UUID REFERENCES artifact_registry.comments(comment_id),
  author_id UUID NOT NULL REFERENCES core.users(id),
  author_role VARCHAR(50) NOT NULL,
  body TEXT NOT NULL,
  tagged_question_keys TEXT[],
  tenant_id UUID NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by UUID REFERENCES core.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cmt_artifact ON artifact_registry.comments(artifact_id);
CREATE INDEX IF NOT EXISTS idx_cmt_tenant ON artifact_registry.comments(tenant_id);
ALTER TABLE artifact_registry.comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cmt_tenant_policy ON artifact_registry.comments;
CREATE POLICY cmt_tenant_policy ON artifact_registry.comments
USING (tenant_id = current_setting('app.current_tenant_id')::uuid OR current_setting('app.is_admin', true) = 'true');
DROP TRIGGER IF EXISTS trg_comments_updated_at ON artifact_registry.comments;
CREATE TRIGGER trg_comments_updated_at BEFORE UPDATE ON artifact_registry.comments
FOR EACH ROW EXECUTE FUNCTION artifact_registry.set_updated_at();

INSERT INTO artifact_registry.reuse_rules
  (evidence_item_id, framework_schema, cscf_version, reuse_category, max_age_days, requires_reconfirmation, has_version_delta, version_delta_description)
VALUES
  ('A1','swift_2026','v2026','date_sensitive',365,true,true,'Bridging servers must be explicit, customer client connectors mandatory, 2.4 now Mandatory'),
  ('A2','swift_2026','v2026','date_sensitive',365,true,true,'Bridging servers inventoried, Luna SA7 HSM, customer client connectors explicit'),
  ('A3','swift_2026','v2026','date_sensitive',365,true,true,'2.4 mandatory, back-office flows must be detailed'),
  ('A4','swift_2026','v2026','date_sensitive',365,true,false,NULL),
  ('A5','swift_2026','v2026','always_reusable',NULL,false,false,NULL),
  ('A6','swift_2026','v2026','date_sensitive',365,true,false,NULL),
  ('A7','swift_2026','v2026','version_dependent',NULL,false,true,'A7 is entirely NEW in v2026. No v2025 equivalent.'),
  ('B1','swift_2026','v2026','config_refresh',180,true,false,NULL),
  ('B2','swift_2026','v2026','config_refresh',180,true,false,NULL),
  ('B3','swift_2026','v2026','config_refresh',180,true,true,'2.4 mandatory encryption requirements added'),
  ('B4','swift_2026','v2026','config_refresh',180,true,false,NULL),
  ('B5','swift_2026','v2026','config_refresh',180,true,false,NULL),
  ('B6','swift_2026','v2026','config_refresh',180,true,false,NULL),
  ('B7','swift_2026','v2026','config_refresh',180,true,false,NULL),
  ('B8','swift_2026','v2026','config_refresh',180,true,true,'2.6 renamed, expanded session security requirements'),
  ('C1','swift_2026','v2026','date_sensitive',365,true,true,'Customer client connectors in access policy scope'),
  ('C2','swift_2026','v2026','config_refresh',180,true,false,NULL),
  ('C3','swift_2026','v2026','config_refresh',90,true,false,NULL),
  ('C4','swift_2026','v2026','config_refresh',180,true,false,NULL),
  ('C5','swift_2026','v2026','date_sensitive',365,true,false,NULL),
  ('C6','swift_2026','v2026','date_sensitive',365,true,false,NULL),
  ('C7','swift_2026','v2026','config_refresh',180,true,false,NULL),
  ('C8','swift_2026','v2026','config_refresh',180,true,false,NULL),
  ('C9','swift_2026','v2026','date_sensitive',365,true,false,NULL),
  ('D1','swift_2026','v2026','date_sensitive',365,true,false,NULL),
  ('D2','swift_2026','v2026','never_reuse',NULL,false,false,NULL),
  ('D3','swift_2026','v2026','never_reuse',NULL,false,false,NULL),
  ('D4','swift_2026','v2026','never_reuse',NULL,false,false,NULL),
  ('D5','swift_2026','v2026','never_reuse',NULL,false,false,NULL),
  ('D6','swift_2026','v2026','date_sensitive',365,true,false,NULL),
  ('E1','swift_2026','v2026','config_refresh',180,true,false,NULL),
  ('E2','swift_2026','v2026','config_refresh',180,true,false,NULL),
  ('E3','swift_2026','v2026','config_refresh',180,true,false,NULL),
  ('E4','swift_2026','v2026','config_refresh',180,true,false,NULL),
  ('E5','swift_2026','v2026','config_refresh',180,true,false,NULL),
  ('E6','swift_2026','v2026','config_refresh',180,true,false,NULL),
  ('E7','swift_2026','v2026','never_reuse',NULL,false,false,NULL),
  ('F1','swift_2026','v2026','date_sensitive',365,true,false,NULL),
  ('F2','swift_2026','v2026','date_sensitive',365,true,false,NULL),
  ('F3','swift_2026','v2026','date_sensitive',365,true,false,NULL),
  ('F4','swift_2026','v2026','date_sensitive',365,true,false,NULL),
  ('G1','swift_2026','v2026','date_sensitive',365,true,false,NULL),
  ('G2','swift_2026','v2026','never_reuse',NULL,false,false,NULL),
  ('G3','swift_2026','v2026','date_sensitive',365,true,false,NULL),
  ('G4','swift_2026','v2026','date_sensitive',365,true,false,NULL),
  ('H1','swift_2026','v2026','date_sensitive',365,true,false,NULL),
  ('H2','swift_2026','v2026','never_reuse',NULL,false,false,NULL),
  ('H3','swift_2026','v2026','date_sensitive',365,true,false,NULL),
  ('H4','swift_2026','v2026','date_sensitive',365,true,true,'AI phishing awareness now required in training'),
  ('H5','swift_2026','v2026','never_reuse',NULL,false,false,NULL),
  ('H6','swift_2026','v2026','date_sensitive',365,true,true,'Universal Confirmation requirements expanded'),
  ('H7','swift_2026','v2026','config_refresh',180,true,false,NULL),
  ('H8','swift_2026','v2026','date_sensitive',365,true,false,NULL),
  ('H9','swift_2026','v2026','date_sensitive',365,true,false,NULL)
ON CONFLICT (evidence_item_id, framework_schema, cscf_version) DO NOTHING;

COMMIT;
