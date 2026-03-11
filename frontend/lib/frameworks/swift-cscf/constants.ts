/**
 * Minimal SWIFT CSCF constants. All form definitions, labels, and criteria come from the database.
 */

/** A5 Architecture Type Declaration evidence item ID. */
export const A5_EVIDENCE_ITEM_ID = "A5";

/** Control ID for "All 32 controls (scoping)" — matches DB control_id. */
export const A5_ALL_CONTROL_ID = "ALL";

/** Form keys for A5 (from evidence_based_questions). Used for preview and completion checks. */
export const A5_ARCHITECTURE_KEYS = {
  architecture_type: "architecture_type",
  selected_diagram: "selected_diagram",
  decision_rationale: "decision_rationale",
  bics: "bics",
  infrastructure_characteristics: "infrastructure_characteristics",
} as const;
