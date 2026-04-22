export const ACCESS_TABS = [
  { id: "overview", label: "Overview" },
  { id: "entitlements", label: "Entitlements" },
  { id: "findings", label: "Findings" },
];

export const PROFILE_ROLE_LABELS: Record<
  string,
  { businessRole: string; itRole: string }
> = {
  "SeniorEngineer-Payments": { businessRole: "Payments Technology", itRole: "SeniorEngineer-Payments" },
  "SeniorEngineer-RetailBanking": { businessRole: "Core Banking Technology", itRole: "SeniorEngineer-RetailBanking" },
  "AssociateEngineer-Cards": { businessRole: "Card Processing Operations", itRole: "Card-System-User" },
  PlatformSRE: { businessRole: "Core Banking Platform Support", itRole: "PlatformSRE" },
  "SeniorEngineer-Security": { businessRole: "Security Operations", itRole: "Security-Admin" },
  "ExternalConsultant-Security": { businessRole: "Security Operations", itRole: "Security-Admin" },
  EngineeringManager: { businessRole: "Access Certification", itRole: "Access-Review-User" },
  QALead: { businessRole: "Internal Audit", itRole: "Audit-Read-Only" },
  "SeniorEngineer-Contract": { businessRole: "Compliance Oversight", itRole: "Compliance-Read-Only" },
  "SeniorEngineer-CustomerExperience": { businessRole: "Account Management", itRole: "CBS-User" },
  MarketingWebDeveloper: { businessRole: "Fraud Detection", itRole: "Fraud-System-User" },
  ReleaseLead: { businessRole: "Identity & Access Management", itRole: "IAM-Admin" },
};

export const SEVERITY_RANK = { Critical: 0, High: 1, Review: 2 };

export const TRIAGE_ROWS = [
  { key: "t1", controlArea: "Orphan Accounts", severity: "Critical", entity: "ACME Consultant", action: "Disable & investigate", icon: "🔴" },
  { key: "t2", controlArea: "MFA", severity: "Critical", entity: "Suresh Kumar", action: "Enforce MFA immediately", icon: "🔴" },
  { key: "t3", controlArea: "MFA", severity: "Critical", entity: "ACME Consultant", action: "Enforce MFA immediately", icon: "🔴" },
  { key: "t4", controlArea: "SoD", severity: "High", entity: "Sridhar Raman", action: "Revoke conflicting role", icon: "🟠" },
  { key: "t5", controlArea: "SoD", severity: "High", entity: "Murali Iyer", action: "Revoke conflicting role", icon: "🟠" },
  { key: "t7", controlArea: "Off-boarding", severity: "Review", entity: "Terminated user", action: "Escalate delayed revocation", icon: "🟡" },
];

export const ZONE3_COMPLIANCE_BARS = [
  { label: "MFA Enforced", pct: 83, barClass: "bg-[#16A34A]", textClass: "text-[#16A34A]" },
  { label: "Key Rotation", pct: 75, barClass: "bg-[#CA8A04]", textClass: "text-[#CA8A04]" },
  { label: "Entitlement Accuracy", pct: 67, barClass: "bg-[#CA8A04]", textClass: "text-[#CA8A04]" },
  { label: "Manager Reviews", pct: 75, barClass: "bg-[#CA8A04]", textClass: "text-[#CA8A04]" },
  { label: "No Overdue Exceptions", pct: 83, barClass: "bg-[#16A34A]", textClass: "text-[#16A34A]" },
];

export const SOD_DEV_PROD_USERNAMES = new Set(["murali.iyer", "suresh.kumar"]);

export const PLATFORM_DETAIL_ROLES: Record<
  string,
  Record<string, Array<{ role: string; scope: string; granted: string; lastUsed: string; status: string; flag?: string }>>
> = {
  "sridhar.raman": {
    GCP: [
      { role: "roles/compute.admin", scope: "projects/nb-platform-prod", granted: "2022-06-01", lastUsed: "2026-04-14", status: "active" },
      { role: "roles/storage.objectAdmin", scope: "projects/nb-platform-prod", granted: "2022-06-01", lastUsed: "2026-04-10", status: "active" },
      { role: "roles/container.clusterAdmin", scope: "projects/nb-platform-prod", granted: "2023-01-15", lastUsed: "2026-03-28", status: "active" },
    ],
  },
  "murali.iyer": {
    GCP: [
      { role: "roles/compute.admin", scope: "projects/nb-infra-prod", granted: "2019-01-01", lastUsed: "2026-04-17", status: "active" },
      { role: "roles/iam.securityAdmin", scope: "projects/nb-infra-prod", granted: "2021-03-10", lastUsed: "2026-04-16", status: "active" },
      { role: "roles/logging.admin", scope: "projects/nb-infra-prod", granted: "2020-08-15", lastUsed: "2026-03-30", status: "active" },
    ],
  },
  "vendor.acme": {
    GCP: [
      { role: "roles/owner", scope: "projects/nb-security-prod", granted: "2025-10-01", lastUsed: "2026-04-10", status: "active", flag: "Overly broad owner role" },
      { role: "roles/storage.admin", scope: "projects/nb-shared-storage", granted: "2025-10-01", lastUsed: "2026-04-10", status: "active" },
    ],
  },
};
