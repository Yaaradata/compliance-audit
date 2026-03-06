-- ============================================================
-- Ensure A7 (Back-office data flow inventory) exists in swift_2026
-- with control 2.4 so 2026 Domain A shows the control properly.
-- Run after 16_seed_swift_2026_evidence_items_mappings.sql.
-- ============================================================

BEGIN;

SET search_path TO swift_2026, core, public;

-- A7 is new in v2026: mandatory inventory of back-office data flows (control 2.4).
INSERT INTO swift_2026.canonical_evidence_items (
    id, domain_id, sort_order, name, priority, evidence_type, description,
    control_count, evidence_description, cscf_version
)
VALUES (
    'A7',
    'A',
    7,
    'Back-office data flow inventory with protection status',
    'critical'::swift_2026.collection_priority,
    'Document + Inventory',
    'NEW for v2026: Mandatory inventory of all data flows between back-office first hops and SWIFT infrastructure components. Classifies each flow as: (1) New direct flow (mandatory protection), (2) Bridging server flow (mandatory protection), (3) Legacy direct flow (advisory until ~v2028). Includes protection status assessment per flow and migration plan for unprotected legacy flows.',
    1,
    'NEW for v2026: Mandatory inventory of all data flows between back-office first hops and SWIFT infrastructure components. Classifies each flow as: (1) New direct flow (mandatory protection), (2) Bridging server flow (mandatory protection), (3) Legacy direct flow (advisory until ~v2028). Includes protection status assessment per flow and migration plan for unprotected legacy flows.',
    '2026v'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    evidence_description = EXCLUDED.evidence_description,
    control_count = EXCLUDED.control_count;

-- Map A7 to control 2.4 (Back Office Data Flow Security – mandatory in 2026).
INSERT INTO swift_2026.item_control_mappings (evidence_item_id, control_id, is_primary, cscf_version)
VALUES ('A7', '2.4', true, '2026v')
ON CONFLICT (evidence_item_id, control_id) DO NOTHING;

-- Domain A has 7 evidence items in 2026 (A1–A7).
UPDATE swift_2026.evidence_domains SET item_count = 7 WHERE id = 'A';

-- One row in evidence_sufficiency_matrix so per-control criteria can be shown.
INSERT INTO swift_2026.evidence_sufficiency_matrix (
    item_code, control_id, evidence_item_name, control_name, ma, evidence_type,
    sufficiency_criteria, evaluation_criteria, cscf_version
)
VALUES (
    'A7', '2.4',
    'Back-office data flow inventory with protection status',
    'Back Office Data Flow Security',
    'M', 'Document + Inventory',
    'Inventory covers all back-office to SWIFT data flows with classification and protection status.',
    'Evidence demonstrates complete inventory and protection status per flow.',
    '2026v'
)
ON CONFLICT (item_code, control_id) DO NOTHING;

COMMIT;
