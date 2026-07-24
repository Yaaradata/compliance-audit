/**
 * Demo access-control foundation — dashboard keys and path helpers.
 * Gating is not wired yet; this module is the shared source of truth.
 *
 * SWIFT is protected by omission: it is not in DASHBOARDS and must never be added.
 */

export const DASHBOARDS: Record<string, string> = {
  "/UKBankingAudit": "uk-banking",
  "/UK_Process_Audit": "uk-process",
  "/USBankingAudit": "us-banking",
  "/IndianBankingAudit": "indian-banking",
  "/Indian_Process_Audit": "indian-process",
  "/Srilanka_Retail": "srilanka-retail",
  "/software_audit": "software-audit",
  "/Internal_Audit": "internal-audit",
  "/scope3emissions": "scope3",
};

export const DASHBOARD_LABELS: Record<string, string> = {
  "uk-banking": "UK Banking Audit",
  "uk-process": "UK Process Audit",
  "us-banking": "US Banking Audit",
  "indian-banking": "Indian Banking Audit",
  "indian-process": "Indian Process",
  "srilanka-retail": "Srilanka Retail",
  "software-audit": "Software Audit",
  "internal-audit": "Internal Audit",
  scope3: "Scope 3 Emissions",
};

/** null = not gated. SWIFT is absent from DASHBOARDS, so it returns null. */
export function keyForPath(pathname: string): string | null {
  for (const [prefix, key] of Object.entries(DASHBOARDS)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return key;
  }
  return null;
}

/** '*' = admin, everything. Otherwise a comma-separated list. */
export function hasAccess(access: string, key: string): boolean {
  if (!access) return false;
  if (access.trim() === "*") return true;
  return access
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .includes(key);
}

/** Admin role alone is enough — empty access_to still opens every dashboard. */
export function isAdminRole(role: string | null | undefined): boolean {
  return (role ?? "").trim().toLowerCase() === "admin";
}

/**
 * Effective access string for gates and UI.
 * Admin with blank access_to → "*" so role alone grants everything.
 */
export function effectiveAccess(
  role: string | null | undefined,
  access: string | null | undefined,
): string {
  const a = (access ?? "").trim();
  if (a === "*") return "*";
  if (isAdminRole(role)) return a || "*";
  return a;
}

/** Path gate: admin role or hasAccess(access, key). */
export function canOpenDashboard(
  role: string | null | undefined,
  access: string | null | undefined,
  key: string,
): boolean {
  if (isAdminRole(role)) return true;
  return hasAccess(effectiveAccess(role, access), key);
}
