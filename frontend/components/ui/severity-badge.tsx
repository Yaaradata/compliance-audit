"use client";

export function SeverityBadge({ level }: { level: "critical" | "high" | "medium" | "low" }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    critical: { bg: "#fef2f2", color: "#dc2626", label: "Critical" },
    high: { bg: "#fffbeb", color: "#d97706", label: "High" },
    medium: { bg: "#f0fdf4", color: "#059669", label: "Medium" },
    low: { bg: "#f3f4f6", color: "#6b7280", label: "Low" },
  };
  const s = styles[level] || styles.medium;
  return (
    <span className="inline-block rounded text-[11px] font-semibold px-2 py-0.5" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}
