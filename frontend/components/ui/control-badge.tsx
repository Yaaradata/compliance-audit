"use client";

export function ControlBadge({
  id,
  ma,
  onClick,
  selected,
}: { id: string; ma: string; onClick?: () => void; selected?: boolean }) {
  const isMandatory = ma === "M" || ma === "M+A";
  const isButton = typeof onClick === "function";
  const baseStyle = {
    background: selected ? "var(--primary)" : isMandatory ? "#fef3c7" : "#e0f2fe",
    borderColor: selected ? "var(--primary)" : isMandatory ? "#f59e0b" : "#7dd3fc",
    color: selected ? "#fff" : isMandatory ? "#92400e" : "#0369a1",
  };
  const className =
    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors duration-200 " +
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
