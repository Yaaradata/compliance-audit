/**
 * UK Banking Audit version routing — shared by the select-region card.
 * Keep in sync with app/UKBankingAudit/v{1..7}/page.tsx and UKBankingControlTrace variant.
 */
export type UkBankingAuditVersion = "v1" | "v2" | "v3" | "v4" | "v5" | "v6" | "v7";

export const LATEST_UK_BANKING_VERSION: UkBankingAuditVersion = "v7";

export const UK_BANKING_PATHS: Record<UkBankingAuditVersion, string> = {
  v1: "/UKBankingAudit/v1",
  v2: "/UKBankingAudit/v2",
  v3: "/UKBankingAudit/v3",
  v4: "/UKBankingAudit/v4",
  v5: "/UKBankingAudit/v5",
  v6: "/UKBankingAudit/v6",
  v7: "/UKBankingAudit/v7",
};

/** Dropdown labels — latest first. v3–v6 remain reachable and unchanged. */
export const UK_BANKING_VERSION_ORDER: UkBankingAuditVersion[] = [
  "v7",
  "v6",
  "v5",
  "v4",
  "v3",
  "v2",
  "v1",
];

export const UK_BANKING_VERSION_SELECT_LABELS: Record<UkBankingAuditVersion, string> = {
  v7: "v7 — latest",
  v6: "v6",
  v5: "v5",
  v4: "v4",
  v3: "v3",
  v2: "v2",
  v1: "v1",
};
