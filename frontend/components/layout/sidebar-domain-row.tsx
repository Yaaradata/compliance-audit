"use client";

import Link from "next/link";

export type DomainRisk = "green" | "amber" | "red" | "neutral";

function riskColor(risk: DomainRisk): string {
  switch (risk) {
    case "green":
      return "var(--success)";
    case "amber":
      return "var(--warning)";
    case "red":
      return "var(--danger)";
    default:
      return "var(--sidebar-text-muted)";
  }
}

function riskFromScore(score: number | undefined): DomainRisk {
  if (score == null || Number.isNaN(score)) return "neutral";
  if (score >= 90) return "green";
  if (score >= 60) return "amber";
  return "red";
}

export interface SidebarDomainRowProps {
  domainId: string;
  domainName: string;
  domainColor: string;
  domainAccent: string;
  href: string;
  isActive: boolean;
  isOpen: boolean;
  /** 0–100 completion; undefined when no data */
  completionPct?: number;
}

/**
 * Smart domain row: badge, name, completion %, mini progress bar, risk indicator.
 * Strong active styling; 200ms transitions; WCAG AA focus.
 */
export function SidebarDomainRow({
  domainId,
  domainName,
  domainColor,
  domainAccent,
  href,
  isActive,
  isOpen,
  completionPct,
}: SidebarDomainRowProps) {
  const risk = riskFromScore(completionPct);
  const riskDotColor = riskColor(risk);
  const displayPct = completionPct != null && !Number.isNaN(completionPct) ? Math.round(completionPct) : null;

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-xl outline-none transition-all duration-200 hover:bg-[var(--sidebar-hover)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--sidebar-active-text)] min-w-0 ${!isOpen ? "justify-center" : ""}`}
      style={{
        padding: isOpen ? "10px 12px" : "10px 8px",
        backgroundColor: isActive ? "var(--sidebar-active-bg)" : "transparent",
        color: isActive ? "var(--sidebar-active-text)" : "var(--sidebar-text-muted)",
      }}
      title={!isOpen ? `Domain ${domainId}: ${domainName}${displayPct != null ? ` — ${displayPct}%` : ""}` : undefined}
      aria-current={isActive ? "page" : undefined}
    >
      {/* Domain badge + risk dot */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span
          className="w-7 h-7 rounded-lg text-[11px] font-bold flex items-center justify-center border transition-colors duration-200"
          style={{
            background: isActive ? "var(--sidebar-active-bg)" : "var(--sidebar-hover)",
            color: isActive ? "var(--sidebar-active-text)" : domainColor,
            borderColor: isActive ? "var(--sidebar-active-text)" : "var(--sidebar-border)",
          }}
        >
          {domainId}
        </span>
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: riskDotColor }}
          aria-hidden
        />
      </div>

      {isOpen && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium truncate" style={{ color: isActive ? "var(--sidebar-text)" : "var(--sidebar-text-muted)" }}>
              {domainName}
            </span>
            {displayPct != null && (
              <span className="text-[11px] font-semibold tabular-nums shrink-0" style={{ color: riskDotColor }}>
                {displayPct}%
              </span>
            )}
          </div>
          {/* Mini progress bar */}
          <div
            className="mt-1.5 h-1 rounded-full overflow-hidden"
            style={{ background: "var(--sidebar-border)" }}
            role="progressbar"
            aria-valuenow={displayPct ?? 0}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Domain ${domainId} completion ${displayPct ?? 0}%`}
          >
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${displayPct ?? 0}%`,
                backgroundColor: riskDotColor,
              }}
            />
          </div>
        </div>
      )}
    </Link>
  );
}
