-- Add tenant_id to collector_runs and evidence for per-tenant AWS data.
ALTER TABLE swift_2026.collector_runs ADD COLUMN IF NOT EXISTS tenant_id UUID NULL;
ALTER TABLE swift_2026.evidence ADD COLUMN IF NOT EXISTS tenant_id UUID NULL;
CREATE INDEX IF NOT EXISTS idx_collector_runs_tenant_id ON swift_2026.collector_runs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_evidence_tenant_id ON swift_2026.evidence(tenant_id);
