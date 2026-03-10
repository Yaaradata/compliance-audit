/**
 * A5 Architecture Type Declaration — sufficiency and evaluation criteria.
 * Used in UI and aligned with backend/AI evaluation.
 */

export const A5_EVIDENCE_ITEM_ID = "A5";

export const A5_SUFFICIENCY_ITEMS: { id: string; label: string }[] = [
  { id: "1", label: "Formal declaration of architecture type: A1, A2, A3, A4, or B" },
  { id: "2", label: "Decision rationale documented: why this architecture type applies" },
  {
    id: "3",
    label:
      "Key infrastructure characteristics supporting the declaration (A1: customer connector; A2: owns messaging/communication interface; A3: application at service provider via connector; A4: service provider without dedicated SWIFT component; B: exclusively SWIFT services through back-office applications)",
  },
  { id: "4", label: "SWIFT BIC(s) covered by this assessment listed" },
  { id: "5", label: "Changes from previous architecture type noted (if applicable)" },
  { id: "6", label: "Multiple architectures per institution flagged if applicable" },
];

export const A5_EVALUATION_ITEMS: { id: string; label: string; type: "PASS" | "FAIL" | "SCOPING" }[] = [
  { id: "1", label: "Architecture type formally declared with rationale", type: "PASS" },
  { id: "2", label: "BIC(s) listed for scope", type: "PASS" },
  { id: "3", label: "Declaration matches actual infrastructure in A2", type: "PASS" },
  { id: "4", label: "No formal declaration", type: "FAIL" },
  {
    id: "5",
    label: "Declared type contradicts component inventory (e.g., declared A4 but has messaging interface)",
    type: "FAIL",
  },
  {
    id: "6",
    label: "SCOPING IMPACT: Drives applicability of all 32 controls — validate before proceeding",
    type: "SCOPING",
  },
];

/** Form field keys for A5 submission form_data (persisted to backend). */
export const A5_FORM_KEYS = {
  architecture_type: "architecture_type",
  selected_diagram: "selected_diagram",
  decision_rationale: "decision_rationale",
  infrastructure_characteristics: "infrastructure_characteristics",
  bics: "bics",
  changes_from_previous: "changes_from_previous",
  multiple_architectures: "multiple_architectures",
} as const;

export type A5FormKey = (typeof A5_FORM_KEYS)[keyof typeof A5_FORM_KEYS];

/** Human-readable labels for A5 form fields. */
export const A5_FORM_LABELS: Record<A5FormKey, string> = {
  architecture_type: "Declared architecture type",
  selected_diagram: "Selected diagram (from architecture selection)",
  decision_rationale: "Decision rationale",
  infrastructure_characteristics: "Key infrastructure characteristics",
  bics: "SWIFT BIC(s) covered by this assessment",
  changes_from_previous: "Changes from previous architecture type (if applicable)",
  multiple_architectures: "Multiple architectures per institution (Yes/No)",
};

/** Placeholder / help text for A5 form fields. */
export const A5_FORM_PLACEHOLDERS: Partial<Record<A5FormKey, string>> = {
  decision_rationale:
    "Explain why this architecture type applies to your organisation (e.g. reference to SWIFT decision tree).",
  infrastructure_characteristics:
    "Describe how your infrastructure aligns with the declared type (A1: customer connector; A2: own messaging/comm interface; A3: connector at provider; A4: no dedicated SWIFT component; B: back-office only).",
  bics: "List BIC(s) in scope for this assessment, one per line or comma-separated.",
  changes_from_previous:
    "If you previously declared a different architecture type, note what changed and when.",
  multiple_architectures:
    "If your institution uses more than one architecture (e.g. different entities), flag here and describe.",
};
