import type { UserRole } from "@/lib/types";

/** Keys used on home / role dashboards (includes fallback for unassigned). */
export type DashboardButtonRole = UserRole | "fallback";

/**
 * Filled primary CTAs — one distinct hue family per role (no two roles share the same gradient).
 */
export const DASHBOARD_PRIMARY_GRADIENT: Record<DashboardButtonRole, string> = {
  compliance_officer: "linear-gradient(135deg, #0f766e 0%, #0d5c56 100%)",
  it_sme: "linear-gradient(135deg, #c2410c 0%, #9a3412 100%)",
  tenant_admin: "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
  internal_reviewer_l1: "linear-gradient(135deg, #5b21b6 0%, #4c1d95 100%)",
  internal_reviewer_l2: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
  external_assessor: "linear-gradient(135deg, #b45309 0%, #92400e 100%)",
  admin: "linear-gradient(135deg, #4338ca 0%, #3730a3 100%)",
  platform_admin: "linear-gradient(135deg, #059669 0%, #047857 100%)",
  fallback: "linear-gradient(135deg, #71717a 0%, #52525b 100%)",
};

/** Second hero CTA — lighter companion in the same hue as each role. */
export const DASHBOARD_SECONDARY_GRADIENT: Record<DashboardButtonRole, string> = {
  compliance_officer: "linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)",
  it_sme: "linear-gradient(135deg, #fb923c 0%, #ea580c 100%)",
  tenant_admin: "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)",
  internal_reviewer_l1: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
  internal_reviewer_l2: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
  external_assessor: "linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)",
  admin: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
  platform_admin: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
  fallback: "linear-gradient(135deg, #52525b 0%, #3f3f46 100%)",
};

/** Outline buttons — border + text aligned to each role’s primary. */
export const DASHBOARD_OUTLINE_STYLE: Record<
  DashboardButtonRole,
  { border: string; text: string; hoverBg: string }
> = {
  compliance_officer: { border: "#0f766e", text: "#0d5c56", hoverBg: "color-mix(in srgb, #14b8a6 22%, white)" },
  it_sme: { border: "#c2410c", text: "#9a3412", hoverBg: "color-mix(in srgb, #ea580c 20%, white)" },
  tenant_admin: { border: "#db2777", text: "#be185d", hoverBg: "color-mix(in srgb, #ec4899 22%, white)" },
  internal_reviewer_l1: { border: "#5b21b6", text: "#4c1d95", hoverBg: "color-mix(in srgb, #8b5cf6 20%, white)" },
  internal_reviewer_l2: { border: "#2563eb", text: "#1d4ed8", hoverBg: "color-mix(in srgb, #3b82f6 20%, white)" },
  external_assessor: { border: "#b45309", text: "#92400e", hoverBg: "color-mix(in srgb, #f59e0b 22%, white)" },
  admin: { border: "#4338ca", text: "#3730a3", hoverBg: "color-mix(in srgb, #6366f1 20%, white)" },
  platform_admin: { border: "#059669", text: "#047857", hoverBg: "color-mix(in srgb, #10b981 22%, white)" },
  fallback: { border: "#71717a", text: "#52525b", hoverBg: "color-mix(in srgb, #a1a1aa 20%, white)" },
};

function roleKey(role: UserRole | null | undefined): DashboardButtonRole {
  if (!role) return "fallback";
  return role in DASHBOARD_PRIMARY_GRADIENT ? (role as DashboardButtonRole) : "fallback";
}

export function dashboardPrimaryGradient(role: UserRole | null | undefined): string {
  return DASHBOARD_PRIMARY_GRADIENT[roleKey(role)];
}

export function dashboardSecondaryGradient(role: UserRole | null | undefined): string {
  return DASHBOARD_SECONDARY_GRADIENT[roleKey(role)];
}

export function dashboardOutlineStyle(role: UserRole | null | undefined) {
  return DASHBOARD_OUTLINE_STYLE[roleKey(role)];
}
