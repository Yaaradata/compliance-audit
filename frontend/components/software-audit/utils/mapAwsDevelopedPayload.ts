import type { AuditMetadata, AuditUser } from "../types";

interface IamTag {
  Key: string;
  Value: string;
}

interface AuditFlagsShape {
  mfaEnabled?: boolean;
  lastLoginDaysAgo?: number;
  accessApproved?: boolean;
  leastPrivilegeViolations?: string[];
  sodViolations?: string[];
}

interface InlinePolicyShape {
  PolicyDocument?: { Action?: string | string[] };
}

interface GitHubAccessShape {
  repoPermission?: string;
  prApprovalRight?: boolean;
}

interface IamUserRow {
  UserId?: string;
  UserName?: string;
  DisplayName?: string;
  Arn?: string;
  CreateDate?: string;
  Tags?: IamTag[];
  Groups?: string[];
  AttachedPolicies?: string[];
  InlinePolicies?: InlinePolicyShape[];
  GitHubAccess?: GitHubAccessShape;
  AuditFlags?: AuditFlagsShape;
}

interface PayloadShape {
  IAMUsers?: { Users?: IamUserRow[] };
  AuditMetadata?: {
    auditId?: string;
    auditName?: string;
    generatedAt?: string;
    environment?: string;
    accountId?: string;
    accountAlias?: string;
    region?: string;
    auditPeriod?: { from?: string; to?: string };
    assumptions?: AuditMetadata["assumptions"];
  };
}

function tagValue(tags: IamTag[] | undefined, key: string): string {
  const hit = tags?.find((t) => t.Key === key);
  return hit?.Value ?? "";
}

function mapRepoPermission(perm: string | undefined): string {
  const v = String(perm || "").toLowerCase();
  if (v === "admin") return "Full";
  if (v === "write") return "Write";
  if (v === "read") return "Read";
  if (v === "none") return "None";
  return "None";
}

function inferInfraAccess(attachedPolicies: string[], groups: string[]): string {
  const pol = attachedPolicies || [];
  const grp = groups || [];
  if (pol.includes("AdministratorAccess")) return "Full";
  if (
    grp.includes("grp-infra-engineers") ||
    pol.some((p) => ["FullInfraPolicy", "EC2FullAccess", "S3FullAccess"].includes(p))
  ) {
    return "Full";
  }
  if (pol.includes("LimitedInfraPolicy")) return "Limited";
  if (pol.includes("ReadOnlyAccess")) return "Read";
  return "None";
}

function inferProdAccess(
  attachedPolicies: string[],
  inlinePolicies: InlinePolicyShape[] | undefined,
  flags: AuditFlagsShape | undefined,
): boolean {
  const pol = attachedPolicies || [];
  if (pol.includes("AdministratorAccess")) return true;
  const lp = flags?.leastPrivilegeViolations || [];
  const sod = flags?.sodViolations || [];
  if (lp.some((x) => String(x).includes("PROD"))) return true;
  if (sod.some((x) => /PROD_DEPLOY|PROD_ACCESS/i.test(String(x)))) return true;
  for (const inline of inlinePolicies || []) {
    const actions = inline?.PolicyDocument?.Action;
    const list = Array.isArray(actions) ? actions : actions ? [actions] : [];
    if (
      list.some((a) => {
        const s = String(a);
        return s.includes("codedeploy:CreateDeployment") || (s.includes("elasticbeanstalk:") && !s.includes("Describe"));
      })
    ) {
      return true;
    }
  }
  return false;
}

function inferDbAccess(attachedPolicies: string[]): boolean {
  const pol = attachedPolicies || [];
  return pol.some((p) => String(p).includes("RDS"));
}

export function mapIamUsersFromPayload(payload: unknown): AuditUser[] {
  const p = payload as PayloadShape;
  const rows = p?.IAMUsers?.Users;
  if (!Array.isArray(rows)) return [];

  return rows.map((row, index) => {
    const tags = row.Tags || [];
    const role = tagValue(tags, "Role");
    const dept = tagValue(tags, "Department");
    const hrStatus = tagValue(tags, "HRStatus") || "Active";
    const gh = row.GitHubAccess || {};
    const flags = row.AuditFlags || {};
    const attached = row.AttachedPolicies || [];
    const groups = row.Groups || [];
    const create = row.CreateDate || "";
    const provisionDate = create.includes("T") ? create.split("T")[0] : create;

    const repoAccess = mapRepoPermission(gh.repoPermission);
    const prApproval = Boolean(gh.prApprovalRight);
    const mfa = Boolean(flags.mfaEnabled);
    const lastLogin = Number(flags.lastLoginDaysAgo ?? 0);
    const accessApproved = Boolean(flags.accessApproved);
    const infraAccess = inferInfraAccess(attached, groups);
    const prodAccess = inferProdAccess(attached, row.InlinePolicies, flags);
    const dbAccess = inferDbAccess(attached);

    return {
      id: String(row.UserId || row.UserName || index),
      name: row.DisplayName || row.UserName || "",
      role,
      dept,
      hrStatus,
      lastLogin,
      mfa,
      repoAccess,
      prApproval,
      infraAccess,
      prodAccess,
      dbAccess,
      accessApproved,
      provisionDate,
      source: {
        userName: row.UserName || "",
        arn: row.Arn || "",
        groups,
        attachedPolicies: attached,
        gitHub: gh as Record<string, unknown>,
        auditFlags: flags as Record<string, unknown>,
      },
    };
  });
}

export function buildAuditMetadata(payload: unknown): AuditMetadata {
  const p = payload as PayloadShape;
  const m = p?.AuditMetadata;
  const assumptions = m?.assumptions;
  return {
    auditId: m?.auditId,
    auditName: m?.auditName,
    generatedAt: m?.generatedAt,
    environment: m?.environment,
    accountId: m?.accountId,
    accountAlias: m?.accountAlias,
    region: m?.region,
    auditPeriod: m?.auditPeriod,
    assumptions,
  };
}
