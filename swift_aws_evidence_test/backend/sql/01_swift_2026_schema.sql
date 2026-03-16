-- SWIFT AWS Evidence — PostgreSQL schema (Google Cloud SQL)
-- Schema: swift_2026 (SWIFT CSCF 2026)

CREATE SCHEMA IF NOT EXISTS swift_2026;

-- Collector execution history
CREATE TABLE IF NOT EXISTS swift_2026.collector_runs (
    run_id UUID PRIMARY KEY,
    collector_name VARCHAR(255) NOT NULL,
    cloud_provider VARCHAR(64) NOT NULL DEFAULT 'aws',
    execution_time TIMESTAMP NOT NULL,
    status VARCHAR(64) NOT NULL,
    trigger_type VARCHAR(64)
);

-- Evidence metadata (S3 pointer + hash)
CREATE TABLE IF NOT EXISTS swift_2026.evidence (
    evidence_id UUID PRIMARY KEY,
    run_id UUID NOT NULL REFERENCES swift_2026.collector_runs(run_id),
    item_code VARCHAR(32) NOT NULL,
    control_id VARCHAR(32) NOT NULL,
    evidence_type VARCHAR(128) NOT NULL,
    source_system VARCHAR(128) NOT NULL,
    storage_uri TEXT NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    collected_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_evidence_run_id ON swift_2026.evidence(run_id);
CREATE INDEX IF NOT EXISTS idx_evidence_item_control ON swift_2026.evidence(item_code, control_id);
CREATE INDEX IF NOT EXISTS idx_evidence_control_id ON swift_2026.evidence(control_id);

-- SWIFT Canonical Evidence Items / Control mapping (SWIFT 2026)
CREATE TABLE IF NOT EXISTS swift_2026.evidence_sufficiency_matrix (
    item_code VARCHAR(32) NOT NULL,
    control_id VARCHAR(32) NOT NULL,
    evidence_item_name VARCHAR(512),
    control_name VARCHAR(512),
    ma VARCHAR(8),
    evidence_type VARCHAR(128),
    sufficiency_criteria TEXT,
    evaluation_criteria TEXT,
    cscf_version VARCHAR(32),
    created_at TIMESTAMP,
    PRIMARY KEY (item_code, control_id)
);

-- Seed sample CEI mapping for AWS evidence test (SWIFT 2026)
INSERT INTO swift_2026.evidence_sufficiency_matrix
(item_code, control_id, evidence_item_name, control_name, ma, evidence_type, cscf_version)
VALUES
('A2', '1.1', 'IAM Users and access', 'Access control', 'M', 'config', '2026'),
('A2', '1.2', 'IAM Roles and policies', 'Access control', 'M', 'config', '2026'),
('B1', '2.1', 'EC2 instance inventory', 'Asset management', 'M', 'config', '2026'),
('B2', '2.2', 'EC2 security groups', 'Network security', 'M', 'config', '2026'),
('C1', '3.1', 'CloudTrail audit logs', 'Logging and monitoring', 'M', 'config', '2026'),
('D1', '4.1', 'AWS Config compliance', 'Configuration management', 'M', 'config', '2026'),
('E1', '5.1', 'SSM Patch compliance', 'Patch management', 'M', 'config', '2026')
ON CONFLICT (item_code, control_id) DO NOTHING;
