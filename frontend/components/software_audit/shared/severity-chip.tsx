export type RiskLevel = "critical" | "high" | "medium" | "low" | "clean";

const SEV_STYLES: Record<
  RiskLevel,
  { bg: string; text: string; border: string; dot: string; solid: string }
> = {
  critical: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
    solid: "bg-red-600",
  },
  high: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-500",
    solid: "bg-orange-600",
  },
  medium: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
    solid: "bg-amber-600",
  },
  low: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    dot: "bg-slate-400",
    solid: "bg-slate-500",
  },
  clean: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    solid: "bg-emerald-600",
  },
};

const SEV_LABEL: Record<RiskLevel, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  clean: "Clean",
};

export function severityStyles(severity: RiskLevel) {
  return SEV_STYLES[severity] || SEV_STYLES.low;
}

export default function SeverityChip({
  severity,
  size = "sm",
}: {
  severity: RiskLevel;
  size?: "sm" | "md";
}) {
  const s = severityStyles(severity);
  const pad = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-wider ${pad} ${s.bg} ${s.text} ${s.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {SEV_LABEL[severity] ?? severity}
    </span>
  );
}

export { SEV_STYLES, SEV_LABEL };
