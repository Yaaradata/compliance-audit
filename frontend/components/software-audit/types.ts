export type ViolationSeverity = "Critical" | "High" | "Medium" | "Low";

export type UserSeverity = ViolationSeverity | "Clean";

export interface Violation {
  type: string;
  severity: ViolationSeverity;
  desc: string;
}

export interface AuditUser {
  id: string;
  name: string;
  role: string;
  dept: string;
  hrStatus: string;
  lastLogin: number;
  mfa: boolean;
  repoAccess: string;
  prApproval: boolean;
  infraAccess: string;
  prodAccess: boolean;
  dbAccess: boolean;
  accessApproved: boolean;
  provisionDate: string;
  source?: {
    userName: string;
    arn: string;
    groups: string[];
    attachedPolicies: string[];
    gitHub: Record<string, unknown>;
    auditFlags: Record<string, unknown>;
  };
}

export interface AuditedUser extends AuditUser {
  violations: Violation[];
  severity: UserSeverity;
  isPrivileged: boolean;
}

export interface RoleBreakdown {
  Admin?: number;
  Architect?: number;
  SeniorEngineer?: number;
  JuniorEngineer?: number;
  InfraEngineer?: number;
  QAReviewer?: number;
  ExternalVendor?: number;
}

export interface AuditAssumptions {
  totalUsers?: number;
  roleBreakdown?: RoleBreakdown;
  identitySource?: string;
  codeAccess?: string;
  hrDataSource?: string;
  logSource?: string;
  mfaProvider?: string;
}

export interface AuditMetadata {
  auditId?: string;
  auditName?: string;
  generatedAt?: string;
  environment?: string;
  accountId?: string;
  accountAlias?: string;
  region?: string;
  auditPeriod?: { from?: string; to?: string };
  assumptions?: AuditAssumptions;
}

export type AwsDevelopedPayload = Record<string, unknown>;
