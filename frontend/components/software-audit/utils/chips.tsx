import type { ReactNode } from "react";

export function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function severityClass(s: string | undefined): string {
  return s?.toLowerCase() || "clean";
}

export function badgeFor(s: string): ReactNode {
  return <span className={`badge-pill badge-${severityClass(s)}`}>{s}</span>;
}

export function boolChip(v: boolean, trueLabel = "Yes", falseLabel = "No"): ReactNode {
  return (
    <span className={`chip ${v ? "chip-yes" : "chip-no"}`}>
      {v ? "✓" : "—"} {v ? trueLabel : falseLabel}
    </span>
  );
}

export function accessChip(v: string | undefined): ReactNode {
  if (!v || v === "None") return <span className="chip chip-no">— None</span>;
  if (v === "Full") return <span className="chip chip-flag">● Full</span>;
  if (v === "Limited" || v === "Read") return <span className="chip chip-warn">◐ {v}</span>;
  if (v === "Write") return <span className="chip chip-info">✎ Write</span>;
  return <span className="chip chip-info">{v}</span>;
}
