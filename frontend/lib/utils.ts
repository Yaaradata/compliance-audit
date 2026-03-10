/** Prefixes that indicate a criterion should be hidden in the UI (fail-if and cross-check). */
const CRITERIA_HIDE_PREFIXES = [
  "FAIL:",
  "CROSS-CHECK:",
  "[FAIL IF]",
  "[CROSS-CHECK]",
];

/** Strip PASS:, FAIL:, CROSS-CHECK:, [FAIL IF], [CROSS-CHECK] prefix from criterion label for display. */
export function stripCriteriaPrefix(label: string | null | undefined): string {
  if (!label || typeof label !== "string") return label ?? "";
  const t = label.trim();
  const prefixes = ["PASS:", "FAIL:", "CROSS-CHECK:", "[FAIL IF]", "[CROSS-CHECK]"];
  for (const p of prefixes) {
    if (t.toUpperCase().startsWith(p.toUpperCase())) {
      return t.slice(p.length).trim();
    }
  }
  return t;
}

/** True if this criterion should be shown in the UI. [FAIL IF] and [CROSS-CHECK] (and FAIL:, CROSS-CHECK:) are hidden. */
export function shouldShowCriterion(label: string | null | undefined): boolean {
  if (!label || typeof label !== "string") return true;
  const upper = label.trim().toUpperCase();
  return !CRITERIA_HIDE_PREFIXES.some((p) => upper.startsWith(p.toUpperCase()));
}

export function scoreColor(s: number): string {
  if (s >= 90) return "var(--success)";
  if (s >= 60) return "var(--warning)";
  if (s > 0) return "var(--danger)";
  return "var(--foreground-subtle)";
}

export function scoreBg(s: number): string {
  if (s >= 90) return "#d1fae5";
  if (s >= 60) return "#fef3c7";
  if (s > 0) return "#fee2e2";
  return "#f3f4f6";
}

export const statusColorMap: Record<string, string> = {
  approved: "#059669",
  review: "#2563eb",
  partial: "#d97706",
  gap: "#dc2626",
  pending: "#d97706",
  in_review: "#2563eb",
  returned: "#ea580c",
};

export const statusLabelMap: Record<string, string> = {
  approved: "Approved",
  review: "In Review",
  partial: "Partial",
  gap: "Gap",
  pending: "Pending",
  in_review: "In Review",
  returned: "Returned",
};

export function getStatusColor(pct: number): string {
  if (pct >= 90) return "var(--success)";
  if (pct >= 60) return "var(--warning)";
  if (pct > 0) return "var(--danger)";
  return "var(--foreground-subtle)";
}

export function getStatusLabel(pct: number): string {
  if (pct >= 90) return "Sufficient";
  if (pct >= 60) return "Partial";
  if (pct > 0) return "Insufficient";
  return "Not Started";
}

export function getStatusIcon(pct: number): string {
  if (pct >= 90) return "✓";
  if (pct >= 60) return "⚠";
  if (pct > 0) return "✗";
  return "○";
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
