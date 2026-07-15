/**
 * UK Banking Audit version routing — shared by the select-region card.
 * Keep in sync with app/UKBankingAudit/v{1..5}/page.tsx and UKBankingControlTrace variant.
 */
export type UkBankingAuditVersion = "v1" | "v2" | "v3" | "v4" | "v5";

export const LATEST_UK_BANKING_VERSION: UkBankingAuditVersion = "v5";

export const UK_BANKING_PATHS: Record<UkBankingAuditVersion, string> = {
  v1: "/UKBankingAudit/v1",
  v2: "/UKBankingAudit/v2",
  v3: "/UKBankingAudit/v3",
  v4: "/UKBankingAudit/v4",
  v5: "/UKBankingAudit/v5",
};

/** Dropdown labels — latest first. */
export const UK_BANKING_VERSION_ORDER: UkBankingAuditVersion[] = ["v5", "v4", "v3", "v2", "v1"];

export const UK_BANKING_VERSION_SELECT_LABELS: Record<UkBankingAuditVersion, string> = {
  v5: "v5 — latest",
  v4: "v4",
  v3: "v3",
  v2: "v2",
  v1: "v1",
};
