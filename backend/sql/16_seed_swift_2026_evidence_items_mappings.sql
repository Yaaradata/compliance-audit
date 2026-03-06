-- ============================================================
-- Seed swift_2026 canonical_evidence_items and item_control_mappings
-- so that 2026 cycles show the same evidence items and controls as 2025.
-- Run after 14_seed_swift_2026_domains_controls.sql.
-- ============================================================

BEGIN;

SET search_path TO swift_2026, swift_2025, core, public;

-- Copy all canonical evidence items from swift_2025 to swift_2026 (same structure, cscf_version 2026v).
INSERT INTO swift_2026.canonical_evidence_items (
    id, domain_id, sort_order, name, priority, evidence_type, description, reduction_note,
    control_count, collection_model, reuse_tier, input_schema, sufficiency_dimensions,
    per_system, per_zone, per_quarter, per_access_point, is_advisory, is_conditional,
    conditional_note, evidence_description, sufficiency_definition, evaluation_criteria,
    cscf_version, created_at
)
SELECT
    id, domain_id, sort_order, name,
    cei.priority::text::swift_2026.collection_priority,
    evidence_type, description, reduction_note,
    control_count,
    cei.collection_model::text::swift_2026.collection_model,
    cei.reuse_tier::text::swift_2026.reuse_tier,
    input_schema, sufficiency_dimensions,
    per_system, per_zone, per_quarter, per_access_point, is_advisory, is_conditional,
    conditional_note, evidence_description, sufficiency_definition, evaluation_criteria,
    '2026v', COALESCE(cei.created_at, now())
FROM swift_2025.canonical_evidence_items cei
ON CONFLICT (id) DO NOTHING;

-- Copy item_control_mappings (new UUIDs, same evidence_item_id and control_id; cscf_version 2026v).
INSERT INTO swift_2026.item_control_mappings (
    id, evidence_item_id, control_id, is_primary, weight, sufficiency_requirement,
    cscf_version, created_at
)
SELECT
    uuid_generate_v4(),
    evidence_item_id,
    control_id,
    is_primary,
    weight,
    sufficiency_requirement,
    '2026v',
    COALESCE(icm.created_at, now())
FROM swift_2025.item_control_mappings icm
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Copy evidence_sufficiency_matrix so per-control criteria and sufficiency show for 2026 (same as 2025).
INSERT INTO swift_2026.evidence_sufficiency_matrix (
    item_code, control_id, evidence_item_name, control_name, ma, evidence_type,
    sufficiency_criteria, evaluation_criteria, cscf_version, created_at
)
SELECT
    item_code, control_id, evidence_item_name, control_name, ma, evidence_type,
    sufficiency_criteria, evaluation_criteria, '2026v', COALESCE(esm.created_at, now())
FROM swift_2025.evidence_sufficiency_matrix esm
ON CONFLICT (item_code, control_id) DO NOTHING;

COMMIT;
