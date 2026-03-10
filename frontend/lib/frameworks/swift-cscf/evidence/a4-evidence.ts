/**
 * A4 Firewall Rule Sets — structured evidence prompts.
 * Evidence type: Config Export
 * Controls covered: 1.1(M), 1.4(M), 1.5(M)
 */

export const A4_EVIDENCE_ITEM_ID = "A4";

export const A4_UPLOAD_GUIDANCE: { id: string; label: string }[] = [
  { id: "1", label: "Rule sets from EVERY firewall at secure zone boundary" },
  { id: "2", label: "Deny-by-default posture at end of each ruleset" },
  { id: "3", label: "Source/destination/port/protocol/action per rule" },
  { id: "4", label: "Annual firewall rule review record (signed, dated)" },
  { id: "5", label: "Customer zone firewall rules (A1 architecture only)" },
];

export const A4_FORM_KEYS = {
  firewall_inventory: "firewall_inventory",
  deny_default_confirmation: "deny_default_confirmation",
  allow_any_exceptions: "allow_any_exceptions",
  internet_deny_confirmation: "internet_deny_confirmation",
  jump_server_internet_status: "jump_server_internet_status",
  annual_review_date: "annual_review_date",
  annual_review_reviewer: "annual_review_reviewer",
  shared_firewall_notes: "shared_firewall_notes",
  customer_zone_rule_summary: "customer_zone_rule_summary",
  known_exceptions: "known_exceptions",
} as const;

export type A4FormKey = (typeof A4_FORM_KEYS)[keyof typeof A4_FORM_KEYS];

export const A4_FORM_LABELS: Record<A4FormKey, string> = {
  firewall_inventory: "List all firewalls at secure zone boundaries",
  deny_default_confirmation: "Deny-by-default posture confirmed for all rulesets?",
  allow_any_exceptions: "Any 'allow any' or overly permissive rules?",
  internet_deny_confirmation: "Outbound internet explicitly denied from secure zone?",
  jump_server_internet_status: "Jump server internet access status",
  annual_review_date: "Last annual firewall rule review date",
  annual_review_reviewer: "Review performed by",
  shared_firewall_notes: "Shared firewall status",
  customer_zone_rule_summary: "Customer zone firewall rules (A1 only)",
  known_exceptions: "Known exceptions and remediation plan",
};

export const A4_FORM_PLACEHOLDERS: Partial<Record<A4FormKey, string>> = {
  firewall_inventory:
    "List each firewall: name/model, boundary protected, management method. One per line.",
  allow_any_exceptions:
    "If any permissive rules exist, document each with business justification and planned remediation.",
  shared_firewall_notes:
    "If firewalls also protect non-SWIFT zones, describe management separation.",
  customer_zone_rule_summary:
    "Summarize customer zone boundary rules, deny-by-default status, and annual review status.",
  known_exceptions:
    "Document any rule exceptions with justification, approval, and planned remediation date.",
  annual_review_reviewer: "Name and role of reviewer",
};
