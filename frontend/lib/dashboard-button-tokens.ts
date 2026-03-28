import type { UserRole } from "@/lib/types";

/** Keys used on home / role dashboards (includes fallback for unassigned). */
export type DashboardButtonRole = UserRole | "fallback";

/**
 * Filled primary CTAs — distinct hue per role, tuned for a light UI: saturated mid-tones
 * (readable on white, not overly heavy).
 */
export const DASHBOARD_PRIMARY_GRADIENT: Record<DashboardButtonRole, string> = {
  compliance_officer: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
  it_sme: "linear-gradient(135deg, #fb923c 0%, #ea580c 100%)",
  tenant_admin: "linear-gradient(135deg, #f472b6 0%, #db2777 100%)",
  internal_reviewer_l1: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
  internal_reviewer_l2: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
  external_assessor: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
  admin: "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)",
  platform_admin: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
  fallback: "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)",
};

/** Second hero CTA — lighter companion in the same hue as each role. */
export const DASHBOARD_SECONDARY_GRADIENT: Record<DashboardButtonRole, string> = {
  compliance_officer: "linear-gradient(135deg, #5eead4 0%, #2dd4bf 100%)",
  it_sme: "linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)",
  tenant_admin: "linear-gradient(135deg, #fbcfe8 0%, #f472b6 100%)",
  internal_reviewer_l1: "linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)",
  internal_reviewer_l2: "linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)",
  external_assessor: "linear-gradient(135deg, #fde68a 0%, #fcd34d 100%)",
  admin: "linear-gradient(135deg, #c7d2fe 0%, #a5b4fc 100%)",
  platform_admin: "linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)",
  fallback: "linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)",
};

/** Outline buttons — vivid but readable on white backgrounds. */
export const DASHBOARD_OUTLINE_STYLE: Record<
  DashboardButtonRole,
  { border: string; text: string; hoverBg: string }
> = {
  compliance_officer: { border: "#14b8a6", text: "#0f766e", hoverBg: "color-mix(in srgb, #5eead4 35%, white)" },
  it_sme: { border: "#f97316", text: "#c2410c", hoverBg: "color-mix(in srgb, #fdba74 38%, white)" },
  tenant_admin: { border: "#ec4899", text: "#be185d", hoverBg: "color-mix(in srgb, #fbcfe8 45%, white)" },
  internal_reviewer_l1: { border: "#8b5cf6", text: "#6d28d9", hoverBg: "color-mix(in srgb, #ddd6fe 40%, white)" },
  internal_reviewer_l2: { border: "#3b82f6", text: "#1d4ed8", hoverBg: "color-mix(in srgb, #bfdbfe 42%, white)" },
  external_assessor: { border: "#f59e0b", text: "#b45309", hoverBg: "color-mix(in srgb, #fde68a 45%, white)" },
  admin: { border: "#6366f1", text: "#4338ca", hoverBg: "color-mix(in srgb, #c7d2fe 38%, white)" },
  platform_admin: { border: "#10b981", text: "#047857", hoverBg: "color-mix(in srgb, #6ee7b7 35%, white)" },
  fallback: { border: "#94a3b8", text: "#475569", hoverBg: "color-mix(in srgb, #cbd5e1 35%, white)" },
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
