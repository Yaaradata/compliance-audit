"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { AssessmentCycle } from "@/lib/types";

const DEMO_CYCLE_DISPLAY_ID = "CYC-2025-C62845";
const DEMO_CYCLE_LABEL = "SWIFT-2025v-Audit";

function Icon({ path, className }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

interface DemoCardProps {
  step: number;
  title: string;
  why: string;
  forWhat: string;
  iconPath: string;
  phase: string;
  href: string | null;
  disabled?: boolean;
  disabledReason?: string;
}

function DemoCard({ step, title, why, forWhat, iconPath, phase, href, disabled, disabledReason }: DemoCardProps) {
  const handleClick = () => {
    if (disabled || !href) return;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`
        group relative flex flex-col w-full min-w-0 rounded-xl border-l-[3px] text-left
        transition-all duration-200 ease-out overflow-hidden h-full
        ${disabled
          ? "border-l-[var(--foreground-subtle)] bg-[var(--surface)] opacity-60 cursor-not-allowed border border-[var(--border)]"
          : "border-l-[var(--primary)] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-lg hover:-translate-y-0.5 cursor-pointer active:translate-y-0"
        }
      `}
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
    >
      {!disabled && (
        <div
          className="absolute inset-x-0 top-0 h-12 pointer-events-none opacity-[0.04]"
          style={{ background: "linear-gradient(180deg, var(--primary) 0%, transparent 100%)" }}
        />
      )}
      <div className="relative flex flex-col h-full p-3">
        <span
          className="inline-flex text-[11px] font-semibold uppercase tracking-wider w-fit px-2 py-0.5 rounded mb-2"
          style={{
            background: disabled ? "var(--border)" : "var(--primary-muted)",
            color: disabled ? "var(--foreground-muted)" : "var(--primary)",
          }}
        >
          {phase}
        </span>
        <div className="flex items-center gap-2 mb-2.5">
          <div
            className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 font-bold text-sm tabular-nums"
            style={{
              background: disabled ? "var(--border)" : "var(--primary)",
              color: "white",
              boxShadow: disabled ? "none" : "0 1px 4px rgba(0,0,0,0.1)",
            }}
          >
            {step}
          </div>
          <div
            className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
            style={{ background: "var(--primary-muted)", color: "var(--primary)" }}
          >
            <Icon path={iconPath} className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-sm truncate leading-tight" style={{ color: "var(--foreground)" }}>
            {title}
          </h3>
        </div>
        <div className="space-y-2 flex-1 min-h-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--primary)" }}>
              Why
            </p>
            <p className="text-sm leading-snug line-clamp-2" style={{ color: "var(--foreground-muted)" }}>
              {why}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--success)" }}>
              For what
            </p>
            <p className="text-sm leading-snug line-clamp-2" style={{ color: "var(--foreground-muted)" }}>
              {forWhat}
            </p>
          </div>
        </div>
        {disabled && disabledReason && (
          <p className="text-xs mt-1.5 font-medium" style={{ color: "var(--warning)" }}>
            {disabledReason}
          </p>
        )}
        {!disabled && href && (
          <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--primary)" }}>
            Opens in new tab
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </span>
        )}
      </div>
    </button>
  );
}

const COLS_PER_ROW = 4;

function FlowArrowHorizontal() {
  return (
    <div className="shrink-0 flex items-center justify-center w-4 self-stretch" aria-hidden>
      <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: "var(--foreground-muted)" }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}

const DEMO_STEPS = [
  {
    step: 1,
    phase: "Setup",
    title: "Login",
    why: "Compliance Officer must authenticate to access the platform.",
    forWhat: "Create cycles, assign L1/L2/L3 reviewers, and select architecture diagrams.",
    iconPath: "M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1",
    path: "/login",
  },
  {
    step: 2,
    phase: "Overview",
    title: "Dashboard",
    why: "Central view of the audit cycle and evidence status.",
    forWhat: "Track progress across domains and navigate to evidence upload.",
    iconPath: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
    pathKey: "dashboard" as const,
  },
  {
    step: 3,
    phase: "Quality Gate 1",
    title: "Review L1",
    why: "First gate: evidence submitted correctly and complete.",
    forWhat: "Confirm documents exist, dated, and linked to the right control.",
    iconPath: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    pathKey: "reviewL1" as const,
  },
  {
    step: 4,
    phase: "Quality Gate 2",
    title: "Review L2",
    why: "Second gate: technical validation of evidence.",
    forWhat: "Verify diagrams and configs satisfy control requirements.",
    iconPath: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    pathKey: "reviewL2" as const,
  },
  {
    step: 5,
    phase: "Quality Gate 3",
    title: "Review L3",
    why: "Third gate: independent attestation.",
    forWhat: "Rate Compliant / Partially / Non-Compliant; assess authenticity.",
    iconPath: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    pathKey: "reviewL3" as const,
  },
  {
    step: 6,
    phase: "Sign-off",
    title: "Approval",
    why: "Head of Compliance attests to the audit.",
    forWhat: "Formal approval; evidence journey timeline; prerequisites.",
    iconPath: "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
    pathKey: "approval" as const,
  },
  {
    step: 7,
    phase: "Output",
    title: "Report",
    why: "Produce deliverables for auditors and regulators.",
    forWhat: "Export cycle report and compliance summary.",
    iconPath: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    pathKey: "report" as const,
  },
] as const;

export default function DemoPage() {
  const { user } = useAuth();
  const [cycleId, setCycleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const envCycleId = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_DEMO_CYCLE_ID : undefined;

  const fetchDemoCycle = useCallback(async () => {
    if (!user) {
      if (envCycleId) {
        setCycleId(envCycleId);
        setError(null);
      } else {
        setCycleId(null);
        setError(null);
      }
      setLoading(false);
      return;
    }
    try {
      const cycles = await api.get<AssessmentCycle[]>("/assessments");
      const demo = cycles.find((c) => c.display_id === DEMO_CYCLE_DISPLAY_ID);
      if (demo) {
        setCycleId(demo.id);
        setError(null);
      } else {
        setCycleId(null);
        setError(`Demo cycle not found. Create a cycle with display ID ${DEMO_CYCLE_DISPLAY_ID} first.`);
      }
    } catch {
      setCycleId(envCycleId ?? null);
      setError(envCycleId ? null : "Could not load cycles. Log in to access.");
    } finally {
      setLoading(false);
    }
  }, [user, envCycleId]);

  useEffect(() => {
    fetchDemoCycle();
  }, [fetchDemoCycle]);

  const cycleReady = !!cycleId;
  const cyclePaths = cycleId
    ? {
        dashboard: `/cycles/${cycleId}/dashboard`,
        reviewL1: `/cycles/${cycleId}/review?level=L1`,
        reviewL2: `/cycles/${cycleId}/review?level=L2`,
        reviewL3: `/cycles/${cycleId}/review?level=L3`,
        approval: `/cycles/${cycleId}/approval`,
        report: `/cycles/${cycleId}/report`,
      }
    : null;

  const disabledReason = !user ? "Log in to access" : "Demo cycle not found";

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "var(--background)" }}>
      <header className="shrink-0 border-b" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="max-w-full mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
              YaaraLabs
            </span>
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-md"
              style={{ color: "var(--primary)", background: "var(--primary-muted)" }}
            >
              SWIFT Compliance Platform
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle variant="default" />
            <Link
              href="/"
              className="text-sm hover:opacity-80 transition-opacity"
              style={{ color: "var(--foreground-muted)" }}
            >
              Back to home
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col min-h-0 px-5 py-5">
        <div className="shrink-0 mb-4">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-0.5" style={{ color: "var(--foreground)" }}>
            SWIFT Compliance Platform
          </h1>
          <p className="text-sm mb-3" style={{ color: "var(--foreground-muted)" }}>
            Cycle <strong>{DEMO_CYCLE_LABEL}</strong> ({DEMO_CYCLE_DISPLAY_ID}) · Each card opens in a new tab
          </p>
          <div
            className="rounded-xl border px-4 py-3 text-sm flex items-center gap-2"
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground-muted)" }}
          >
            <span className="font-semibold shrink-0" style={{ color: "var(--foreground)" }}>Flow:</span>
            <span className="flex items-center gap-1.5 flex-wrap">
              <span>Setup</span>
              <span aria-hidden className="opacity-50">→</span>
              <span>Overview</span>
              <span aria-hidden className="opacity-50">→</span>
              <span>L1 · L2 · L3</span>
              <span aria-hidden className="opacity-50">→</span>
              <span>Sign-off</span>
              <span aria-hidden className="opacity-50">→</span>
              <span>Report</span>
            </span>
          </div>
        </div>

        {error && (
          <div
            className="shrink-0 mb-4 p-3 rounded-lg border text-sm"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
              color: "var(--foreground-muted)",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            <div className="grid gap-x-2 min-h-0" style={{ gridTemplateColumns: `repeat(${COLS_PER_ROW}, minmax(0, 1fr))` }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-l-[3px] border-l-[var(--border)] p-3 animate-pulse min-h-[180px]" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                  <div className="h-3 w-14 rounded bg-[var(--border)] mb-2" />
                  <div className="h-6 w-full rounded-lg bg-[var(--border)] mb-2" />
                  <div className="h-2.5 w-full bg-[var(--border)] rounded mb-1.5" />
                  <div className="h-2.5 w-full bg-[var(--border)] rounded" />
                </div>
              ))}
            </div>
            <div className="py-0.5" />
            <div className="grid gap-x-2 min-h-0" style={{ gridTemplateColumns: `repeat(${COLS_PER_ROW}, minmax(0, 1fr))` }}>
              {[4, 5, 6].map((i) => (
                <div key={i} className="rounded-xl border border-l-[3px] border-l-[var(--border)] p-3 animate-pulse min-h-[180px]" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                  <div className="h-3 w-14 rounded bg-[var(--border)] mb-2" />
                  <div className="h-6 w-full rounded-lg bg-[var(--border)] mb-2" />
                  <div className="h-2.5 w-full bg-[var(--border)] rounded mb-1.5" />
                  <div className="h-2.5 w-full bg-[var(--border)] rounded" />
                </div>
              ))}
              <div />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-auto">
            {/* Row 1: steps 1–4 with horizontal flow */}
            <div className="grid gap-x-2 gap-y-0 min-h-0" style={{ gridTemplateColumns: `repeat(${COLS_PER_ROW}, minmax(0, 1fr))` }}>
              {DEMO_STEPS.slice(0, COLS_PER_ROW).map((s, idx) => (
                <div key={s.step} className="flex items-stretch gap-1 min-w-0">
                  <div className="flex-1 min-w-0 min-h-[180px]">
                    <DemoCard
                      step={s.step}
                      phase={s.phase}
                      title={s.title}
                      why={s.why}
                      forWhat={s.forWhat}
                      iconPath={s.iconPath}
                      href={"path" in s ? s.path : cyclePaths ? cyclePaths[s.pathKey] : null}
                      disabled={!("path" in s) && !cycleReady}
                      disabledReason={!("path" in s) && !cycleReady ? disabledReason : undefined}
                    />
                  </div>
                  {idx < COLS_PER_ROW - 1 && <FlowArrowHorizontal />}
                </div>
              ))}
            </div>
            {/* Row 2: steps 5–7, same 4-column grid so card widths align */}
            <div className="grid gap-x-2 gap-y-0 min-h-0" style={{ gridTemplateColumns: `repeat(${COLS_PER_ROW}, minmax(0, 1fr))` }}>
              {DEMO_STEPS.slice(COLS_PER_ROW, 7).map((s, idx) => (
                <div key={s.step} className="flex items-stretch gap-1 min-w-0">
                  <div className="flex-1 min-w-0 min-h-[180px]">
                    <DemoCard
                      step={s.step}
                      phase={s.phase}
                      title={s.title}
                      why={s.why}
                      forWhat={s.forWhat}
                      iconPath={s.iconPath}
                      href={cyclePaths && "pathKey" in s ? cyclePaths[s.pathKey] : null}
                      disabled={!cycleReady}
                      disabledReason={!cycleReady ? disabledReason : undefined}
                    />
                  </div>
                  {idx < 2 && <FlowArrowHorizontal />}
                </div>
              ))}
              <div className="min-w-0" />
            </div>
          </div>
        )}
      </main>

      <footer className="shrink-0 border-t py-2" style={{ borderColor: "var(--border)" }}>
        <div className="text-center text-xs" style={{ color: "var(--foreground-muted)" }}>
          YaaraLabs SWIFT Compliance Platform ·  Click a card to open in new tab
        </div>
      </footer>
    </div>
  );
}
