import type { UkDomainEntity, UkProcessAuditDomainId } from "./types";

/** Per-domain audited entity naming — UK-apt (retail/SME banking). */
export const ENTITY_BY_DOMAIN: Record<UkProcessAuditDomainId, UkDomainEntity> = {
  ONB: { singular: "Customer", plural: "Customers", entity: "customer" },
  DEP: { singular: "Account", plural: "Accounts", entity: "account" },
  PAY: { singular: "Payment", plural: "Payments", entity: "payment" },
  LEN: { singular: "Loan Application", plural: "Loan Applications", entity: "application" },
  COL: { singular: "Arrears Case", plural: "Arrears Cases", entity: "case" },
  FC: { singular: "Alert", plural: "Alerts", entity: "alert" },
  FRD: { singular: "Fraud Claim", plural: "Fraud Claims", entity: "claim" },
  CMP: { singular: "Complaint", plural: "Complaints", entity: "complaint" },
};

export const JOURNEY_TITLE_BY_DOMAIN: Record<UkProcessAuditDomainId, string> = {
  ONB: "Customer onboarding journey — CDD & activation evidence trail",
  DEP: "Account servicing journey — lifecycle & depositor-protection evidence trail",
  PAY: "Payment processing journey — initiation to reconciliation evidence trail",
  LEN: "Loan origination journey — application to drawdown evidence trail",
  COL: "Collections & recoveries journey — arrears to resolution evidence trail",
  FC: "Financial-crime case journey — detection to SAR evidence trail",
  FRD: "Fraud & scam claim journey — detection to reimbursement evidence trail",
  CMP: "Complaint handling journey — intake to final response evidence trail",
};

/** Second-line / operations function that owns SOP stages in the domain. */
export const TEAM_BY_DOMAIN: Record<UkProcessAuditDomainId, string> = {
  ONB: "Customer Onboarding & KYC Operations",
  DEP: "Deposit & Account Servicing Operations",
  PAY: "Payment Operations",
  LEN: "Lending & Underwriting Operations",
  COL: "Collections & Recoveries Operations",
  FC: "Financial Crime Operations (2LoD)",
  FRD: "Fraud & Scams Operations",
  CMP: "Complaints & Redress Operations",
};

/** Case segments per domain, used to label the audited population sample. */
export const SEGMENTS_BY_DOMAIN: Record<UkProcessAuditDomainId, string[]> = {
  ONB: [
    "Retail · Personal current account",
    "SME · Business current account",
    "Commercial · Corporate entity (KYB)",
    "Retail · Savings (higher-risk geography)",
    "SME · PEP-connected director",
  ],
  DEP: [
    "Retail · Instant-access savings",
    "SME · Business deposit",
    "Retail · Fixed-term bond",
    "Retail · Dormant reactivation",
    "Retail · CASS switch-in",
  ],
  PAY: [
    "Faster Payment · outbound",
    "CHAPS · high-value",
    "Bacs · direct debit",
    "Card · cross-border",
    "Faster Payment · Confirmation of Payee mismatch",
  ],
  LEN: [
    "Retail · Residential mortgage",
    "Retail · Unsecured personal loan",
    "SME · Term loan",
    "Retail · Buy-to-let",
    "SME · Overdraft facility",
  ],
  COL: [
    "Retail · Mortgage arrears (early)",
    "Retail · Credit-card arrears",
    "Vulnerable customer · financial difficulty",
    "SME · term-loan arrears",
    "Retail · pre-litigation",
  ],
  FC: [
    "Transaction-monitoring alert",
    "Sanctions true-match",
    "PEP relationship review",
    "SAR escalation",
    "High-risk EDD relationship",
  ],
  FRD: [
    "APP scam · Faster Payments",
    "Card fraud · unauthorised",
    "Account takeover",
    "Mule / receiving account",
    "APP scam · vulnerable customer",
  ],
  CMP: [
    "Banking · service failure",
    "Lending · affordability",
    "Consumer Duty · fair value",
    "Fraud · reimbursement dispute",
    "FOS-referred complaint",
  ],
};
