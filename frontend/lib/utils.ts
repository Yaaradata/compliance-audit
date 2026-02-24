export function scoreColor(s: number): string {
  if (s >= 90) return "#059669";
  if (s >= 60) return "#d97706";
  if (s > 0) return "#dc2626";
  return "#9ca3af";
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
  if (pct >= 90) return "#059669";
  if (pct >= 60) return "#d97706";
  if (pct > 0) return "#dc2626";
  return "#94a3b8";
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
