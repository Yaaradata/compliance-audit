"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Clock, AlertCircle, FileText, Loader2, BarChart3 } from "lucide-react";
import { AwsKpiCards } from "./aws-kpi-cards";
import { AwsSectionTitle } from "./aws-page-header";
import { AwsEvidenceTable } from "./aws-evidence-table";
import { RunHistoryVisualsPlotly } from "./run-history-visuals-plotly";
import type { AwsRun, AwsEvidenceRow } from "@/lib/aws-api";

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
  evidenceRows: AwsEvidenceRow[];
  evidenceCount: number;
  controlIdsWithEvidence: string[];
  onFetchEvidence: () => void;
  onRefresh: () => void;
  onViewEvidenceContent: (row: AwsEvidenceRow) => void;
  fetching: boolean;
  fetchError: string | null;
}

export function AwsDashboard({
  runs,
  evidenceRows,
  evidenceCount,
  controlIdsWithEvidence,
  onFetchEvidence,
  onRefresh,
  onViewEvidenceContent,
  fetching,
  fetchError,
}: AwsDashboardProps) {
  const [activeSection, setActiveSection] = useState<"evidence" | "run-history" | null>("evidence");
  const [evidenceSectionLoading, setEvidenceSectionLoading] = useState(false);
  const [runHistorySectionLoading, setRunHistorySectionLoading] = useState(false);
  const successRuns = runs.filter((r) => r.status === "success").length;
  const successRate = runs.length ? Math.round((successRuns / runs.length) * 100) : 0;
  const lastRun = runs[0];
  // Use end time when available so "Last collected" shows when the run finished (e.g. "Just now")
  const lastCollectedAt = lastRun?.ended_at ?? lastRun?.in_time ?? lastRun?.execution_time;

  const openEvidenceSection = () => {
    if (activeSection === "evidence") return;
    setEvidenceSectionLoading(true);
    setTimeout(() => {
      setActiveSection("evidence");
      setEvidenceSectionLoading(false);
    }, 450);
  };

  const openRunHistorySection = () => {
    if (activeSection === "run-history") return;
    setRunHistorySectionLoading(true);
    setTimeout(() => {
      setActiveSection("run-history");
      setRunHistorySectionLoading(false);
    }, 450);
  };

  return (
    <div className="w-full flex flex-col gap-7">
      {/* Hero — full width, primary gradient */}
      <section
        aria-label="Overview"
        className="w-full rounded-2xl p-6 md:p-7 text-white shadow-sm"
        style={{
          background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)",
        }}
      >
        <div className="mb-4 pb-4 border-b border-white/20 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-white leading-tight">Dashboard</h1>
            <p className="text-sm text-white/85 mt-1">Compliance evidence at a glance. Run collectors and view key metrics.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/aws"
              className="inline-flex items-center gap-2 rounded-lg border border-white/35 bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20 transition"
            >
              Account
            </Link>
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-2 rounded-lg border border-white/35 bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20 transition"
            >
              Refresh
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl md:text-2xl font-semibold opacity-95 leading-tight">Compliance evidence at a glance</h2>
            <p className="mt-2 max-w-2xl text-sm md:text-base opacity-90 leading-relaxed">
              Collect and view AWS security evidence for SWIFT controls.
            </p>
            {lastCollectedAt && (
              <p className="mt-4 flex items-center gap-2 text-sm opacity-85">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                Last collected {formatRelative(lastCollectedAt)} ({formatDateTime(lastCollectedAt)})
              </p>
            )}
          </div>
          <div className="flex flex-shrink-0 flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onFetchEvidence}
              disabled={fetching}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[var(--primary)] shadow-sm transition hover:bg-white/90 disabled:opacity-70 min-h-[44px]"
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
            <div className="inline-flex items-stretch rounded-lg border border-white/35 overflow-hidden">
              <button
                type="button"
                onClick={openEvidenceSection}
                disabled={evidenceSectionLoading || activeSection === "evidence"}
                className="inline-flex items-center justify-center gap-2 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/20 min-h-[44px] disabled:opacity-70"
              >
                {evidenceSectionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                {activeSection === "evidence" ? "Evidence loaded" : "Show evidence"}
              </button>
              <button
                type="button"
                onClick={openRunHistorySection}
                disabled={runHistorySectionLoading || activeSection === "run-history"}
                className="inline-flex items-center justify-center gap-2 border-l border-white/25 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/20 min-h-[44px] disabled:opacity-70"
              >
                {runHistorySectionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
                {activeSection === "run-history" ? "Run Details loaded" : "Run Details"}
              </button>
            </div>
          </div>
        </div>
        {fetching && (
          <p className="mt-3 text-sm opacity-90 text-white/90">Run in progress. This page updates automatically when collection finishes.</p>
        )}
        {fetchError && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-white/15 px-4 py-3 text-sm text-white">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{fetchError}</span>
          </div>
        )}
      </section>

      {/* KPIs */}
      <section aria-label="Key metrics" className="w-full">
        <AwsSectionTitle>Key metrics</AwsSectionTitle>
        <AwsKpiCards
          runsCount={runs.length}
          evidenceCount={evidenceCount}
          successRate={successRate}
          controlsWithEvidence={controlIdsWithEvidence.length}
        />
      </section>

      {activeSection === "run-history" && (
        <section id="run-history" aria-label="Run activity" className="w-full">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <AwsSectionTitle className="mb-0">Run history insights</AwsSectionTitle>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ background: "var(--muted)", color: "var(--foreground-muted)" }}
            >
              {runs.length} run{runs.length !== 1 ? "s" : ""}
            </span>
          </div>
          <RunHistoryVisuals runs={runs} evidenceRows={evidenceRows} />
        </section>
      )}

      {activeSection === "evidence" && (
        <section id="dashboard-evidence" aria-label="Evidence section" className="w-full">
          <AwsSectionTitle>Evidence table</AwsSectionTitle>
          <AwsEvidenceTable
            data={evidenceRows.slice(0, 150)}
            runs={runs}
            onViewContent={onViewEvidenceContent}
          />
        </section>
      )}

      
    </div>
  );
}

function RunHistoryVisuals({ runs, evidenceRows }: { runs: AwsRun[]; evidenceRows: AwsEvidenceRow[] }) {
  return <RunHistoryVisualsPlotly runs={runs} evidenceRows={evidenceRows} />;
}
