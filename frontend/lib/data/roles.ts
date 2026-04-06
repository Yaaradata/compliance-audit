import type { UserRole } from "../types";

/** Primary nav entry: flat link, grouped links, or cloud evidence flyout (single row + hover/click panel). */
export type NavItem =
  | { href: string; label: string; icon?: string }
  | { kind: "group"; label: string; children: { href: string; label: string }[] }
  | { kind: "cloud_evidence"; label: string };

export function isNavGroup(item: NavItem): item is { kind: "group"; label: string; children: { href: string; label: string }[] } {
  return "kind" in item && item.kind === "group";
}

export function isNavCloudEvidence(item: NavItem): item is { kind: "cloud_evidence"; label: string } {
  return "kind" in item && item.kind === "cloud_evidence";
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Platform Administrator",
  platform_admin: "Platform Administrator",
  tenant_admin: "Tenant Administrator",
  compliance_officer: "Compliance Officer",
  it_sme: "IT Subject Matter Expert",
  internal_reviewer_l1: "Internal Reviewer (L1)",
  internal_reviewer_l2: "Internal Reviewer (L2)",
  external_assessor: "External Assessor (L3) / Approver",
};

/** Resolve a display label for any role including null (unassigned). */
export function getRoleLabel(role: UserRole | string | null | undefined): string {
  if (!role) return "Unassigned";
  return ROLE_LABELS[role as UserRole] ?? role;
}

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "Onboard banks, manage tenants, assign bank admins.",
  platform_admin: "Onboard banks, manage tenants, assign bank admins.",
  tenant_admin: "Manage tenant users and settings.",
  compliance_officer: "Creates evidence requests, manages collection.",
  it_sme: "Subject matter expert; uploads evidence.",
  internal_reviewer_l1: "L1 completeness reviewer.",
  internal_reviewer_l2: "L2 quality reviewer.",
  external_assessor: "Final approver for evidence.",
};

/** Minimal nav for users with no global role and no active cycle role. */
export const UNASSIGNED_NAV: NavItem[] = [{ href: "/dashboard", label: "Dashboard" }];

/** Resolve nav items for a role, including null (unassigned). */
export function getNavForRole(role: UserRole | string | null | undefined): NavItem[] {
  if (!role) return UNASSIGNED_NAV;
  return NAV_BY_ROLE[role as UserRole] ?? UNASSIGNED_NAV;
}

export const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  admin: [
    { href: "/admin", label: "Bank Onboarding" },
    { href: "/admin/compliance-pipeline", label: "New Compliance" },
    { href: "/admin/tenants", label: "Tenants" },
  ],
  platform_admin: [
    { href: "/admin", label: "Bank Onboarding" },
    { href: "/admin/compliance-pipeline", label: "New Compliance" },
    { href: "/admin/tenants", label: "Tenants" },
  ],
  tenant_admin: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/users-groups", label: "Users & Groups" },
    { href: "/report", label: "Report" },
  ],
  compliance_officer: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/users-groups", label: "Users & Groups" },
    { href: "/review", label: "Review Queue" },
    { href: "/approval", label: "Approval" },
    { href: "/report", label: "Report" },
  ],
  it_sme: [
    { href: "/dashboard", label: "Dashboard" },
    { kind: "cloud_evidence", label: "Cloud Evidence" },
    { href: "/report", label: "Report" },
  ],
  internal_reviewer_l1: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/review", label: "Review Queue" },
    { href: "/report", label: "Report" },
  ],
  internal_reviewer_l2: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/review", label: "Review Queue" },
    { href: "/report", label: "Report" },
  ],
  external_assessor: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/review", label: "Review Queue" },
    { href: "/report", label: "Report" },
  ],
};
