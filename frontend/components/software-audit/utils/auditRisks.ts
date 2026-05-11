import type { AuditUser, AuditedUser, UserSeverity, Violation, ViolationSeverity } from "../types";
import { ROLE_DEFINITIONS } from "../constants/roleDefinitions";

export function computeRisks(users: AuditUser[]): AuditedUser[] {
  return users.map((u) => {
    const violations: Violation[] = [];
    const roleDef = ROLE_DEFINITIONS.find((r) => r.role === u.role);

    const isPrivileged =
      u.role === "Admin" || u.prodAccess || u.dbAccess || u.infraAccess === "Full";

    if (roleDef?.mfaRequired && !u.mfa) {
      violations.push({ type: "MFA", severity: "Critical", desc: `MFA required for ${u.role} but not enabled` });
    }
    if ((u.prodAccess || u.role === "Admin") && !u.mfa) {
      violations.push({ type: "MFA", severity: "Critical", desc: "Prod/Admin access without MFA" });
    }

    if (u.role === "Junior Engineer" && u.prodAccess) {
      violations.push({ type: "Least Privilege", severity: "High", desc: "Junior Engineer has Production access" });
    }
    if (u.role === "Junior Engineer" && u.infraAccess !== "None") {
      violations.push({ type: "Least Privilege", severity: "Medium", desc: "Junior Engineer has Infra access" });
    }
    if (u.role === "Infra Engineer" && u.repoAccess === "Write") {
      violations.push({ type: "SoD", severity: "High", desc: "Infra Engineer has Repo Write (SoD)" });
    }
    if (!u.accessApproved) {
      violations.push({
        type: "Provisioning",
        severity: "High",
        desc:
          u.role === "External User"
            ? "External user access not formally approved"
            : "Access not formally approved (missing ITSM / approval record)",
      });
    }

    if (u.hrStatus === "Terminated") {
      violations.push({
        type: "Orphan Account",
        severity: "Critical",
        desc: "Employee terminated but access not revoked",
      });
    }

    const dormantThreshold = isPrivileged ? 30 : 60;
    if (u.lastLogin > dormantThreshold) {
      violations.push({
        type: "Dormant",
        severity: (isPrivileged ? "Critical" : "High") as ViolationSeverity,
        desc: `Inactive ${u.lastLogin} days (threshold: ${dormantThreshold})`,
      });
    }

    if (u.prApproval && u.repoAccess === "Write") {
      if (u.role === "Junior Engineer") {
        violations.push({ type: "SoD", severity: "High", desc: "Junior can both write code and approve PRs" });
      }
    }

    const severity: UserSeverity = violations.some((v) => v.severity === "Critical")
      ? "Critical"
      : violations.some((v) => v.severity === "High")
        ? "High"
        : violations.some((v) => v.severity === "Medium")
          ? "Medium"
          : violations.length > 0
            ? "Low"
            : "Clean";

    return { ...u, violations, severity, isPrivileged };
  });
}
