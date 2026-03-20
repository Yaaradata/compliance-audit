-- Scope AWS connections and AWS evidence by tenant + cycle + user.

CREATE TABLE IF NOT EXISTS core.cycle_user_aws_config (
  tenant_id uuid NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  cycle_id uuid NOT NULL REFERENCES core.assessment_cycles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  aws_account_id varchar(20),
  aws_region varchar(32) NOT NULL DEFAULT 'us-east-1',
  connection_type varchar(32) NOT NULL DEFAULT 'access_key',
  encrypted_access_key_id text,
  encrypted_secret_access_key text,
  sso_start_url text,
  sso_region varchar(32),
  encrypted_refresh_token text,
  sso_account_id varchar(20),
  sso_role_name varchar(255),
  role_arn varchar(512),
  external_id varchar(255),
  is_active boolean NOT NULL DEFAULT true,
  connected_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, cycle_id, user_id)
);

ALTER TABLE swift_2026.collector_runs
  ADD COLUMN IF NOT EXISTS cycle_id uuid,
  ADD COLUMN IF NOT EXISTS user_id uuid;

ALTER TABLE swift_2026.evidence
  ADD COLUMN IF NOT EXISTS cycle_id uuid,
  ADD COLUMN IF NOT EXISTS user_id uuid;

CREATE INDEX IF NOT EXISTS idx_collector_runs_tenant_cycle_user
  ON swift_2026.collector_runs (tenant_id, cycle_id, user_id, execution_time DESC);

CREATE INDEX IF NOT EXISTS idx_evidence_tenant_cycle_user
  ON swift_2026.evidence (tenant_id, cycle_id, user_id, collected_at DESC);
