import type { UserRole } from "../types";

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

export const NAV_BY_ROLE: Record<UserRole, { href: string; label: string; icon?: string }[]> = {
  admin: [
    { href: "/admin", label: "Bank Onboarding" },
    { href: "/admin/tenants", label: "Tenants" },
  ],
  platform_admin: [
    { href: "/admin", label: "Bank Onboarding" },
    { href: "/admin/tenants", label: "Tenants" },
  ],
  tenant_admin: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/assessments/new", label: "Assessment Cycles" },
    { href: "/users-groups", label: "Users & Groups" },
    { href: "/report", label: "Report" },
  ],
  compliance_officer: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/assessments/new", label: "Assessment Cycles" },
    { href: "/users-groups", label: "Users & Groups" },
    { href: "/review", label: "Review Queue" },
    { href: "/approval", label: "Approval" },
    { href: "/report", label: "Report" },
  ],
  it_sme: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/aws", label: "AWS" },
    { href: "/report", label: "Report" },
  ],
  internal_reviewer_l1: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/report", label: "Report" },
  ],
  internal_reviewer_l2: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/report", label: "Report" },
  ],
  external_assessor: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/report", label: "Report" },
  ],
};
