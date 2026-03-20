"use client";

import {
  Activity,
  FileCheck,
  CheckCircle2,
  Target,
  type LucideIcon,
} from "lucide-react";

interface KpiCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  variant?: "default" | "evidence" | "success" | "controls";
}

const variantStyles: Record<string, { bg: string; color: string }> = {
  default: { bg: "var(--primary-muted)", color: "var(--primary)" },
  evidence: { bg: "var(--success-bg)", color: "var(--success)" },
  success: { bg: "var(--success-bg)", color: "var(--success)" },
  controls: { bg: "var(--warning-bg)", color: "var(--warning)" },
};

export function AwsKpiCard({
  icon: Icon,
  value,
  label,
  variant = "default",
}: KpiCardProps) {
  const style = variantStyles[variant] ?? variantStyles.default;
  return (
    <div
      className="card rounded-xl p-5 transition-shadow hover:shadow-md"
      role="figure"
      aria-label={`${label}: ${value}`}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ background: style.bg, color: style.color }}
          aria-hidden
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-2xl sm:text-[1.75rem] font-bold tabular-nums tracking-tight leading-none" style={{ color: "var(--foreground)" }}>
            {value}
          </p>
          <p className="mt-1 text-sm font-medium" style={{ color: "var(--foreground-muted)" }}>
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

interface AwsKpiCardsProps {
  runsCount: number;
  evidenceCount: number;
  successRate: number;
  controlsWithEvidence: number;
}

export function AwsKpiCards({
  runsCount,
  evidenceCount,
  successRate,
  controlsWithEvidence,
}: AwsKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <AwsKpiCard icon={Activity} value={runsCount} label="Collector runs" variant="default" />
      <AwsKpiCard icon={FileCheck} value={evidenceCount} label="Evidence items" variant="evidence" />
      <AwsKpiCard icon={CheckCircle2} value={`${successRate}%`} label="Success rate" variant="success" />
      <AwsKpiCard icon={Target} value={controlsWithEvidence} label="Controls with evidence" variant="controls" />
    </div>
  );
}
