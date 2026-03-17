"use client";

import Link from "next/link";
import { Play, ExternalLink, Clock, AlertCircle } from "lucide-react";
import { AwsKpiCards } from "./aws-kpi-cards";
import { AwsQuickLinks } from "./aws-quick-links";
import { AwsRunHistory } from "./aws-run-history";
import type { AwsRun } from "@/lib/aws-api";

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

interface AwsDashboardProps {
  runs: AwsRun[];
  evidenceCount: number;
  controlIdsWithEvidence: string[];
  onFetchEvidence: () => void;
  onRunDeleted?: () => void;
  fetching: boolean;
  fetchError: string | null;
}

export function AwsDashboard({
  runs,
  evidenceCount,
  controlIdsWithEvidence,
  onFetchEvidence,
  onRunDeleted,
  fetching,
  fetchError,
}: AwsDashboardProps) {
  const successRuns = runs.filter((r) => r.status === "success").length;
  const successRate = runs.length ? Math.round((successRuns / runs.length) * 100) : 0;
  const recentRuns = runs.slice(0, 8);
  const lastRun = runs[0];
  const lastCollectedAt = lastRun?.in_time ?? lastRun?.execution_time;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Hero — matches OverallProgress gradient (primary palette) */}
      <section
        aria-label="Overview"
        className="rounded-xl p-5 text-white"
        style={{
          background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)",
        }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm opacity-90">Compliance evidence at a glance</div>
            <p className="mt-1 max-w-xl text-sm opacity-90">
              Collect and view AWS security evidence for SWIFT controls. Run collectors or browse by control.
            </p>
            {lastCollectedAt && (
              <p className="mt-3 flex items-center gap-2 text-xs opacity-80">
                <Clock className="h-3.5 w-3.5" />
                Last collected {formatRelative(lastCollectedAt)} ({formatDateTime(lastCollectedAt)})
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:shrink-0">
            <button
              type="button"
              onClick={onFetchEvidence}
              disabled={fetching}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 font-semibold text-[var(--primary)] shadow-sm transition hover:bg-white/90 disabled:opacity-70"
            >
              {fetching ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--primary)]/30 border-t-[var(--primary)]" />
                  Collecting…
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Fetch AWS evidence
                </>
              )}
            </button>
            <Link
              href="/aws/controls"
              className="inline-flex items-center gap-2 rounded-lg border border-white/40 bg-white/10 px-5 py-2.5 font-medium text-white transition hover:bg-white/20"
            >
              View controls
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
        {fetchError && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-white/15 px-4 py-3 text-sm text-white">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{fetchError}</span>
          </div>
        )}
      </section>

      {/* KPIs — same structure as OverallProgress stats */}
      <section aria-label="Key metrics">
        <div className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>
          Key metrics
        </div>
        <AwsKpiCards
          runsCount={runs.length}
          evidenceCount={evidenceCount}
          successRate={successRate}
          controlsWithEvidence={controlIdsWithEvidence.length}
        />
      </section>

      {/* Two-column: Recent runs + Quick links */}
      <section aria-label="Recent activity and quick links" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>
            Recent runs
          </div>
          <div className="card rounded-xl p-4">
            {recentRuns.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>No runs yet</p>
                <p className="mt-1 text-xs" style={{ color: "var(--foreground-muted)" }}>
                  Use <strong>Fetch AWS evidence</strong> above to run collectors.
                </p>
              </div>
            ) : (
              <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
                {recentRuns.map((r) => (
                  <li key={r.run_id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        background:
                          r.status === "success"
                            ? "var(--success)"
                            : r.status === "failed"
                              ? "var(--danger)"
                              : "var(--warning)",
                      }}
                      title={r.status}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 text-sm" style={{ color: "var(--foreground-muted)" }}>
                      {formatRelative(r.in_time ?? r.execution_time)} ·{" "}
                      <span className="font-medium" style={{ color: "var(--foreground)" }}>
                        {r.evidence_count ?? 0}
                      </span>{" "}
                      items
                    </span>
                    <span
                      className="shrink-0 rounded px-2 py-0.5 text-xs"
                      style={{ background: "var(--muted)", color: "var(--foreground-muted)" }}
                    >
                      {r.trigger_type || "—"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Link
            href="#run-history"
            className="mt-2 text-xs font-medium"
            style={{ color: "var(--primary)" }}
          >
            View all →
          </Link>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>
            Quick links
          </div>
          <AwsQuickLinks />
        </div>
      </section>

      {/* Run history */}
      <section id="run-history" aria-labelledby="run-history-heading">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h2 id="run-history-heading" className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            Run history
          </h2>
          {runs.length > 0 && (
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ background: "var(--muted)", color: "var(--foreground-muted)" }}
            >
              {runs.length} run{runs.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="card rounded-xl overflow-hidden">
          <AwsRunHistory runs={runs} onRunDeleted={onRunDeleted} />
        </div>
      </section>
    </div>
  );
}
