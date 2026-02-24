import type { UserRole } from "../types";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Platform Administrator",
  compliance_officer: "Compliance Officer",
  it_sme: "IT Subject Matter Expert",
  internal_reviewer: "Internal Reviewer (L1/L2)",
  external_assessor: "External Assessor (L3)",
  approver: "Approver (CISO / Head of Compliance)",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "Onboard banks, manage tenants, assign bank admins.",
  compliance_officer: "Creates evidence requests, manages collection.",
  it_sme: "Subject matter expert; uploads evidence.",
  internal_reviewer: "L1/L2 reviewer for evidence and controls.",
  external_assessor: "L3 independent assessor.",
  approver: "Senior sign-off authority (CISO, Head of Compliance).",
};

export const NAV_BY_ROLE: Record<UserRole, { href: string; label: string; icon: string }[]> = {
  admin: [
    { href: "/admin", label: "Bank Onboarding", icon: "🏦" },
    { href: "/admin/tenants", label: "Tenants", icon: "📋" },
  ],
  compliance_officer: [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/evidence-model", label: "Evidence Model", icon: "🗂️" },
    { href: "/review", label: "Review Queue", icon: "📋" },
    { href: "/approval", label: "Approval", icon: "✅" },
    { href: "/report", label: "Report", icon: "📄" },
  ],
  it_sme: [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/evidence-model", label: "Evidence Model", icon: "🗂️" },
    { href: "/report", label: "Report", icon: "📄" },
  ],
  internal_reviewer: [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/review", label: "Review Queue", icon: "📋" },
    { href: "/evidence-model", label: "Evidence Model", icon: "🗂️" },
    { href: "/report", label: "Report", icon: "📄" },
  ],
  external_assessor: [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/review", label: "Review Queue", icon: "📋" },
    { href: "/report", label: "Report", icon: "📄" },
  ],
  approver: [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/approval", label: "Approval", icon: "✅" },
    { href: "/report", label: "Report", icon: "📄" },
  ],
};
