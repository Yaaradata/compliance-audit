"use client";

import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Database, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useKeystoneV5Colors } from "../theme/KeystoneV5ThemeProvider";
import type { V5SourceTag } from "@/lib/Srilanka_Retail/v5/types";

const TAG_LABEL: Record<V5SourceTag, string> = {
  SOURCED: "SOURCED",
  VERIFIED: "VERIFIED",
  ILLUSTRATIVE: "ILLUSTRATIVE",
  ASSUMPTION: "ASSUMPTION",
  LION_VALIDATE: "LION-VALIDATE",
  OPEN: "OPEN",
  PXTY: "PXTY",
};

function tagDot(C: ReturnType<typeof useKeystoneV5Colors>, tag: V5SourceTag) {
  const map: Record<V5SourceTag, string> = {
    SOURCED: C.green,
    VERIFIED: C.green,
    ILLUSTRATIVE: C.amber,
    ASSUMPTION: C.faint,
    LION_VALIDATE: C.faint,
    OPEN: C.open,
    PXTY: "transparent",
  };
  return map[tag] ?? C.faint;
}

export function Chip({ tag }: { tag: V5SourceTag }) {
  const C = useKeystoneV5Colors();
  const label = TAG_LABEL[tag] ?? "ASSUMPTION";
  const dot = tagDot(C, tag);
  const ring = tag === "PXTY";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide"
      style={{ background: C.chipBg, border: `1px solid ${C.borderSoft}`, color: C.dim }}
    >
      <span
        className="inline-flex h-1.5 w-1.5 items-center justify-center rounded-full"
        style={{ background: dot, border: ring ? `1px solid ${C.amber}` : "none" }}
      />
      {tag === "VERIFIED" && <CheckCircle2 size={9} color={C.green} />}
      {label}
    </span>
  );
}

export function Range({ low, high, unit, prefix = "" }: { low: number; high: number; unit?: string; prefix?: string }) {
  const f = (n: number) => (n >= 1000 ? n.toLocaleString("en-US") : n);
  return (
    <span className="tabular-nums">
      {prefix}{f(low)}–{f(high)}{unit ? ` ${unit}` : ""}
    </span>
  );
}

export function ValidateField({ note = "validate on call" }: { note?: string }) {
  const C = useKeystoneV5Colors();
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px]"
      style={{ background: C.chipBg, border: `1px dashed ${C.faint}`, color: C.faint }}
    >
      <span className="tabular-nums">—</span>
      <span className="italic">{note}</span>
    </span>
  );
}

export function Btn({
  children,
  onClick,
  kind = "primary",
  icon: Icon,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  kind?: "primary" | "ghost" | "neutral";
  icon?: LucideIcon;
  type?: "button" | "submit";
}) {
  const C = useKeystoneV5Colors();
  const styles: CSSProperties =
    kind === "primary"
      ? { background: C.accent, color: C.onAccent, border: `1px solid ${C.accent}` }
      : kind === "ghost"
        ? { background: "transparent", color: C.dim, border: `1px solid ${C.border}` }
        : { background: C.raise, color: C.text, border: `1px solid ${C.border}` };
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
      style={{ ...styles, outlineColor: C.accent }}
    >
      {Icon && <Icon size={15} strokeWidth={2.2} />}
      {children}
    </button>
  );
}

export function Card({ children, style, className = "" }: { children: ReactNode; style?: CSSProperties; className?: string }) {
  const C = useKeystoneV5Colors();
  return (
    <div className={`rounded-xl ${className}`} style={{ background: C.panel, border: `1px solid ${C.border}`, ...style }}>
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  const C = useKeystoneV5Colors();
  return (
    <div className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: C.faint }}>
      {children}
    </div>
  );
}

export function SourceLabel({ src, managed }: { src: string; managed?: boolean }) {
  const C = useKeystoneV5Colors();
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: C.faint }}>
      <Database size={12} /> {src}
      {managed && (
        <span className="rounded px-1.5 py-0.5 text-[10px]" style={{ background: C.accentDim, color: C.accent, border: `1px solid ${C.accentEdge}` }}>
          wired during onboarding
        </span>
      )}
    </span>
  );
}

export function SevPill({ level }: { level: string }) {
  const C = useKeystoneV5Colors();
  const col = { HIGH: C.red, MED: C.amber, LOW: C.green }[level] ?? C.dim;
  return (
    <span
      className="inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
      style={{ background: C.chipBg, color: col, border: `1px solid ${col}55` }}
    >
      {level}
    </span>
  );
}

export function Trend({ dir }: { dir: string }) {
  const C = useKeystoneV5Colors();
  if (dir === "IMPROVING") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: C.green }}>
        <TrendingDown size={13} /> improving
      </span>
    );
  }
  if (dir === "WORSENING") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: C.red }}>
        <TrendingUp size={13} /> worsening
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: C.dim }}>
      <Minus size={13} /> stable
    </span>
  );
}
