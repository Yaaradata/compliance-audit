"use client";

export function Badge({ text, color, bg }: { text: string; color: string; bg: string }) {
  return (
    <span
      className="inline-block rounded text-[11px] font-semibold tracking-wide"
      style={{ padding: "2px 8px", color, background: bg }}
    >
      {text}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    CRITICAL: { bg: "#DC2626", text: "#fff" },
    HIGH: { bg: "#D97706", text: "#fff" },
    "HIGH*": { bg: "#D97706", text: "#fff" },
    MEDIUM: { bg: "#059669", text: "#fff" },
  };
  const c = colors[priority] || colors.MEDIUM;
  return (
    <span
      className="inline-block rounded text-[11px] font-bold tracking-wide"
      style={{ padding: "2px 8px", background: c.bg, color: c.text }}
    >
      {priority}
    </span>
  );
}
