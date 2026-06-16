"use client";

import type { CSSProperties, ReactNode } from "react";
import type {
  ComplianceStatus,
  Eligibility,
  EvidenceLink as EvidenceLinkType,
  Severity,
} from "@/lib/Srilanka_Retail/v2/types";

// ── Status colour map ───────────────────────────────────────────────────────
export const STATUS_VAR: Record<ComplianceStatus, string> = {
  healthy: "var(--status-healthy)",
  watch: "var(--status-watch)",
  risk: "var(--status-risk)",
  critical: "var(--status-critical)",
  neutral: "var(--status-neutral)",
};

export const SEVERITY_VAR: Record<Severity, string> = {
  low: "var(--status-neutral)",
  medium: "var(--status-watch)",
  high: "var(--status-risk)",
  critical: "var(--status-critical)",
};

const STATUS_LABEL: Record<ComplianceStatus, string> = {
  healthy: "Healthy",
  watch: "Watch",
  risk: "At-Risk",
  critical: "Critical",
  neutral: "Neutral",
};

// ── Card ────────────────────────────────────────────────────────────────────
export function Card({
  children,
  className = "",
  style,
  accent,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  accent?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg ${onClick ? "cursor-pointer transition-colors" : ""} ${className}`}
      style={{
        backgroundColor: "var(--surface-card)",
        border: "1px solid var(--border-subtle)",
        borderLeft: accent ? `3px solid ${accent}` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Mono text ───────────────────────────────────────────────────────────────
export function Mono({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <span className={`lion-mono ${className}`} style={style}>
      {children}
    </span>
  );
}

// ── Section heading ─────────────────────────────────────────────────────────
export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <div
      className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em]"
      style={{ color: "var(--text-secondary)" }}
    >
      {children}
    </div>
  );
}

// ── StatusDot ───────────────────────────────────────────────────────────────
export function StatusDot({ status, size = 8 }: { status: ComplianceStatus; size?: number }) {
  return (
    <span
      className="inline-block rounded-full"
      style={{ width: size, height: size, backgroundColor: STATUS_VAR[status] }}
    />
  );
}

// ── StatusBadge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status, label }: { status: ComplianceStatus; label?: string }) {
  const c = STATUS_VAR[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
      style={{ color: c, backgroundColor: `color-mix(in srgb, ${c} 14%, transparent)`, border: `1px solid color-mix(in srgb, ${c} 40%, transparent)` }}
    >
      <StatusDot status={status} size={7} />
      {label ?? STATUS_LABEL[status]}
    </span>
  );
}

// ── SeverityBadge ───────────────────────────────────────────────────────────
export function SeverityBadge({ severity }: { severity: Severity }) {
  const c = SEVERITY_VAR[severity];
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
      style={{ color: c, backgroundColor: `color-mix(in srgb, ${c} 16%, transparent)`, border: `1px solid color-mix(in srgb, ${c} 45%, transparent)` }}
    >
      {severity}
    </span>
  );
}

// ── AiBadge — ✦ glyph + children in violet ──────────────────────────────────
export function AiBadge({ children, reasoning }: { children: ReactNode; reasoning?: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--ai-accent)" }}>
        <span aria-hidden>✦</span>
        <span>{children}</span>
      </div>
      {reasoning ? (
        <div className="mt-0.5 text-[12px] leading-snug" style={{ color: "var(--text-secondary)" }}>
          {reasoning}
        </div>
      ) : null}
    </div>
  );
}

// ── AiReasoningBlock — violet panel with reasoning + confidence ─────────────
export function AiReasoningBlock({
  conclusion,
  reasoning,
  confidence,
  metric,
  hypothesis,
}: {
  conclusion?: string;
  reasoning: string;
  confidence: "fact" | "hypothesis";
  metric?: { label: string; value: string };
  hypothesis?: string;
}) {
  const dashed = confidence === "hypothesis";
  return (
    <div
      className="rounded-lg p-3.5"
      style={{
        backgroundColor: "var(--ai-surface)",
        border: `1px ${dashed ? "dashed" : "solid"} color-mix(in srgb, var(--ai-accent) 55%, transparent)`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide" style={{ color: "var(--ai-accent)" }}>
          <span aria-hidden>✦</span>
          AI Reasoning
        </div>
        <span
          className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
          style={{ color: "var(--ai-accent)", border: "1px solid color-mix(in srgb, var(--ai-accent) 45%, transparent)" }}
        >
          {confidence}
        </span>
      </div>
      {conclusion ? (
        <div className="mt-2 text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
          {conclusion}
        </div>
      ) : null}
      <div className="mt-1.5 text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {reasoning}
      </div>
      {hypothesis ? (
        <div className="mt-2 text-[12px] italic" style={{ color: "var(--text-secondary)" }}>
          {hypothesis}
        </div>
      ) : null}
      {metric ? (
        <div className="mt-2.5 inline-flex items-center gap-2 rounded-md px-2 py-1" style={{ backgroundColor: "rgba(124,58,237,0.12)" }}>
          <span className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
            {metric.label}
          </span>
          <Mono className="text-[13px] font-bold" style={{ color: "var(--ai-accent)" }}>
            {metric.value}
          </Mono>
        </div>
      ) : null}
    </div>
  );
}

// ── OwnerChip ───────────────────────────────────────────────────────────────
export function OwnerChip({ name, onReassign }: { name: string | null; onReassign?: () => void }) {
  if (!name) {
    return (
      <span
        className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase"
        style={{ color: "var(--status-critical)", border: "1px solid color-mix(in srgb, var(--status-critical) 45%, transparent)" }}
      >
        Unassigned
      </span>
    );
  }
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("");
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[12px]"
      style={{ backgroundColor: "var(--surface-raised)", color: "var(--text-primary)" }}
      onClick={onReassign}
    >
      <span
        className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold"
        style={{ backgroundColor: "var(--ai-accent)", color: "#fff" }}
      >
        {initials}
      </span>
      {name}
    </span>
  );
}

// ── CounterCard ─────────────────────────────────────────────────────────────
export function CounterCard({
  label,
  value,
  status = "neutral",
  caption,
  onClick,
  ai,
}: {
  label: string;
  value: string;
  status?: ComplianceStatus;
  caption?: string;
  onClick?: () => void;
  ai?: { text: string; reasoning: string };
}) {
  return (
    <Card accent={STATUS_VAR[status]} onClick={onClick} className="p-4">
      <div className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
        {label}
      </div>
      <div className="mt-1 lion-mono text-[28px] font-bold leading-none" style={{ color: status === "neutral" ? "var(--text-primary)" : STATUS_VAR[status] }}>
        {value}
      </div>
      {caption ? (
        <div className="mt-1.5 text-[12px]" style={{ color: "var(--text-secondary)" }}>
          {caption}
        </div>
      ) : null}
      {ai ? (
        <div className="mt-2">
          <AiBadge reasoning={ai.reasoning}>{ai.text}</AiBadge>
        </div>
      ) : null}
    </Card>
  );
}

// ── EligibilityChip ─────────────────────────────────────────────────────────
const ELIG_MAP: Record<Eligibility, { c: string; label: string }> = {
  go: { c: "var(--status-healthy)", label: "GO" },
  amber: { c: "var(--status-watch)", label: "AMBER" },
  hold: { c: "var(--status-critical)", label: "HOLD" },
  unverified: { c: "var(--status-neutral)", label: "UNVERIFIED" },
};
export function EligibilityChip({ eligibility }: { eligibility: Eligibility }) {
  const { c, label } = ELIG_MAP[eligibility];
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
      style={{ color: c, backgroundColor: `color-mix(in srgb, ${c} 16%, transparent)`, border: `1px solid color-mix(in srgb, ${c} 45%, transparent)` }}
    >
      {label}
    </span>
  );
}

// ── EvidenceLink ────────────────────────────────────────────────────────────
export function EvidenceLink({ link, onOpen }: { link: EvidenceLinkType; onOpen?: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left transition-colors hover:brightness-125"
      style={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border-subtle)" }}
    >
      <Mono className="text-[12px]" style={{ color: "var(--text-primary)" }}>
        {link.label}
      </Mono>
      <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
        {link.sourceSystem} →
      </span>
    </button>
  );
}

// ── Button ──────────────────────────────────────────────────────────────────
export function Btn({
  children,
  onClick,
  variant = "ghost",
  disabled,
  full,
  size = "md",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
  full?: boolean;
  size?: "sm" | "md";
}) {
  const base =
    variant === "primary"
      ? { backgroundColor: "var(--ai-accent)", color: "#fff", border: "1px solid var(--ai-accent)" }
      : variant === "danger"
        ? { backgroundColor: "color-mix(in srgb, var(--status-critical) 18%, transparent)", color: "var(--status-critical)", border: "1px solid color-mix(in srgb, var(--status-critical) 50%, transparent)" }
        : { backgroundColor: "transparent", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md font-medium transition-all ${size === "sm" ? "px-2.5 py-1 text-[12px]" : "px-3.5 py-2 text-[13px]"} ${full ? "w-full" : ""} ${disabled ? "cursor-not-allowed opacity-40" : "hover:brightness-110"}`}
      style={base}
    >
      {children}
    </button>
  );
}
