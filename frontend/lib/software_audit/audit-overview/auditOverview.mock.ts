export interface UserRef {
  id: string;
  name: string;
  email: string;
  department: string;
}

export interface AuditOverviewData {
  period: { start: string; end: string };
  org: string;
  auditEngagement: string;
  privilegedAccess: {
    totalAdminAccounts: number;
    byType: { os: number; db: number; app: number; network: number };
    withNamedOwner: number;
    withActiveHR: number;
    withJustification: number;
    orphanAccounts: number;
    orphanUsers: UserRef[];
  };
  leastPrivilege: {
    sampleSize: number;
    overPrivilegedCount: number;
    topOverPrivilegedSystems: { system: string; count: number }[];
    violatingUsers: UserRef[];
  };
  dormantAccounts: {
    standard60Days: number;
    privileged30Days: number;
    disabledCount: number;
    lockedOnlyCount: number;
    stillActiveCount: number;
    dormantUsers: (UserRef & {
      daysSinceLogin: number;
      accountType: "standard" | "privileged";
      status: "disabled" | "locked" | "active";
    })[];
  };
  sodViolations: {
    initiateAndApproveCount: number;
    devAndProdCount: number;
    totalViolations: number;
    conflictingUsers: (UserRef & { conflictType: string; systems: string[] })[];
  };
  mfaEnforcement: {
    privileged: { enforced: number; total: number };
    remoteAccess: { enforced: number; total: number };
    adminConsoles: { enforced: number; total: number };
    usersWithoutMfa: UserRef[];
  };
  provisioning: {
    newHires: { total: number; viaApprovedForm: number; adHoc: number };
    terminations: { total: number; revokedWithin24h: number; breached: number; longestDelayDays: number };
    breachedTerminations: (UserRef & { delayDays: number })[];
  };
  overallCompliance: number;
  findingsSummary: { critical: number; high: number; medium: number; low: number };
}

export const AUDIT_OVERVIEW_MOCK: AuditOverviewData = {
  period: { start: "2026-01-01", end: "2026-03-31" },
  org: "Northbank Financial Services",
  auditEngagement: "ENG-2026-Q1-AM",
  privilegedAccess: {
    totalAdminAccounts: 9,
    byType: { os: 3, db: 2, app: 3, network: 1 },
    withNamedOwner: 8,
    withActiveHR: 8,
    withJustification: 7,
    orphanAccounts: 1,
    orphanUsers: [
      { id: "vendor.acme", name: "ACME Consultant", email: "consultant@acme.example.com", department: "Security" },
    ],
  },
  leastPrivilege: {
    sampleSize: 32,
    overPrivilegedCount: 5,
    topOverPrivilegedSystems: [
      { system: "CardSystem", count: 2 },
      { system: "BankSystem", count: 1 },
      { system: "ContractSystem", count: 1 },
      { system: "HRSystem", count: 1 },
    ],
    violatingUsers: [
      { id: "karthik.menon", name: "Karthik Menon", email: "karthik.menon@northbank.example.com", department: "Retail Banking" },
      { id: "anurag.desai", name: "Anurag Desai", email: "anurag.desai@northbank.example.com", department: "Marketing" },
      { id: "vendor.acme", name: "ACME Consultant", email: "consultant@acme.example.com", department: "Security" },
      { id: "rajesh.nair", name: "Rajesh Nair", email: "rajesh.nair@northbank.example.com", department: "Contract Management" },
      { id: "suresh.kumar", name: "Suresh Kumar", email: "suresh.kumar@northbank.example.com", department: "Security" },
    ],
  },
  dormantAccounts: {
    standard60Days: 2,
    privileged30Days: 2,
    disabledCount: 1,
    lockedOnlyCount: 1,
    stillActiveCount: 2,
    dormantUsers: [
      { id: "vendor.acme", name: "ACME Consultant", email: "consultant@acme.example.com", department: "Security", daysSinceLogin: 95, accountType: "privileged", status: "active" },
      { id: "rajesh.nair", name: "Rajesh Nair", email: "rajesh.nair@northbank.example.com", department: "Contract Management", daysSinceLogin: 72, accountType: "standard", status: "locked" },
      { id: "deepa.nair", name: "Deepa Nair", email: "deepa.nair@northbank.example.com", department: "Platform Engineering", daysSinceLogin: 63, accountType: "standard", status: "disabled" },
      { id: "suresh.kumar", name: "Suresh Kumar", email: "suresh.kumar@northbank.example.com", department: "Security", daysSinceLogin: 36, accountType: "privileged", status: "active" },
    ],
  },
  sodViolations: {
    initiateAndApproveCount: 1,
    devAndProdCount: 2,
    totalViolations: 3,
    conflictingUsers: [
      { id: "sridhar.raman", name: "Sridhar Raman", email: "sridhar.raman@northbank.example.com", department: "Platform Engineering", conflictType: "Initiate + Approve financial transactions", systems: ["BankSystem", "ServiceNow"] },
      { id: "murali.iyer", name: "Murali Iyer", email: "murali.iyer@northbank.example.com", department: "Platform Engineering", conflictType: "Developer + Production deploy", systems: ["GitHub", "Jenkins", "AWS"] },
      { id: "suresh.kumar", name: "Suresh Kumar", email: "suresh.kumar@northbank.example.com", department: "Security", conflictType: "Developer + Production deploy", systems: ["GitHub", "Jenkins", "AWS"] },
    ],
  },
  mfaEnforcement: {
    privileged: { enforced: 2, total: 4 },
    remoteAccess: { enforced: 3, total: 5 },
    adminConsoles: { enforced: 4, total: 5 },
    usersWithoutMfa: [
      { id: "suresh.kumar", name: "Suresh Kumar", email: "suresh.kumar@northbank.example.com", department: "Security" },
      { id: "vendor.acme", name: "ACME Consultant", email: "consultant@acme.example.com", department: "Security" },
    ],
  },
  provisioning: {
    newHires: { total: 3, viaApprovedForm: 2, adHoc: 1 },
    terminations: { total: 2, revokedWithin24h: 1, breached: 1, longestDelayDays: 4 },
    breachedTerminations: [
      { id: "vendor.acme", name: "ACME Consultant", email: "consultant@acme.example.com", department: "Security", delayDays: 4 },
    ],
  },
  overallCompliance: 68,
  findingsSummary: { critical: 4, high: 6, medium: 5, low: 1 },
};
