"use client";

type StatusColor = "white" | "green" | "orange" | "red";

const STATUS_STYLES: Record<StatusColor, { bg: string; border: string; color: string }> = {
  white:  { bg: "#ffffff", border: "#d1d5db", color: "#374151" },
  green:  { bg: "#dcfce7", border: "#22c55e", color: "#166534" },
  orange: { bg: "#fff7ed", border: "#f97316", color: "#9a3412" },
  red:    { bg: "#fee2e2", border: "#ef4444", color: "#991b1b" },
};

export function ControlBadge({
  id,
  ma,
  onClick,
  selected,
  statusColor,
}: { id: string; ma: string; onClick?: () => void; selected?: boolean; statusColor?: StatusColor }) {
  const isButton = typeof onClick === "function";
  const sstyle = STATUS_STYLES[statusColor ?? "white"];
  const baseStyle = selected
    ? { background: "var(--primary)", borderColor: "var(--primary)", color: "#fff" }
    : { background: sstyle.bg, borderColor: sstyle.border, color: sstyle.color };

  const className =
    "inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-0.5 text-xs font-medium transition-colors duration-200 " +
    (isButton ? "cursor-pointer hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--primary)]" : "");

  if (isButton) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={className}
        style={baseStyle}
        aria-pressed={selected}
        aria-label={`Control ${id} ${ma}. ${selected ? "Selected" : "Click to view criteria and evidence"}`}
      >
        <span className="font-bold">{id}</span>
        <span className="opacity-80">{ma}</span>
      </button>
    );
  }
  return (
    <span className={className} style={baseStyle}>
      <span className="font-bold">{id}</span>
      <span className="opacity-60">{ma}</span>
    </span>
  );
}
