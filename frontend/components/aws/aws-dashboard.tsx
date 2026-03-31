"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, FileText, Loader2, BarChart3 } from "lucide-react";
import { AwsKpiCards } from "./aws-kpi-cards";
import { AwsSectionTitle, awsButtonSecondaryClass, awsSegmentShellClass, awsSegmentButtonClass } from "./aws-page-header";
import { AwsEvidenceTable } from "./aws-evidence-table";
import { RunHistoryVisualsPlotly } from "@/components/cloud/run-history-visuals-plotly";
import { getEvidenceContent, type AwsRun, type AwsEvidenceRow } from "@/lib/aws-api";

interface AwsDashboardProps {
  runs: AwsRun[];
  evidenceRows: AwsEvidenceRow[];
  evidenceCount: number;
  controlIdsWithEvidence: string[];
  onFetchEvidence: () => void;
  /** Navigate to Run Comparisor for this control (e.g. from Evidence table). */
  onOpenRunComparisor: (row: AwsEvidenceRow) => void;
  /** When set (e.g. from ?controlKey= on dashboard URL), open Run history + focus this control in Comparisor. */
  focusComparisorControlKey?: string | null;
  fetching: boolean;
  fetchError: string | null;
}

export function AwsDashboard({
  runs,
  evidenceRows,
  evidenceCount,
  controlIdsWithEvidence,
  onFetchEvidence,
  onOpenRunComparisor,
  focusComparisorControlKey = null,
  fetching,
  fetchError,
}: AwsDashboardProps) {
  const [userSection, setUserSection] = useState<"evidence" | "run-history">(() =>
    focusComparisorControlKey ? "run-history" : "evidence"
  );
  /** Deep-link `?controlKey=` forces Run Details until the param is cleared. */
  const activeSection = focusComparisorControlKey ? "run-history" : userSection;

  useEffect(() => {
    if (focusComparisorControlKey && activeSection === "run-history") {
      requestAnimationFrame(() =>
        document.getElementById("run-history")?.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    }
  }, [focusComparisorControlKey, activeSection]);
  const [evidenceSectionLoading, setEvidenceSectionLoading] = useState(false);
  const [runHistorySectionLoading, setRunHistorySectionLoading] = useState(false);
  /** Terminal runs that finished (success, partial, or failed) — excludes running. */
  const terminalRuns = runs.filter((r) => ["success", "partial", "failed"].includes((r.status ?? "").toLowerCase()));
  const terminalCount = terminalRuns.length;
  /** Runs where every collector succeeded (strict). */
  const fullSuccessRuns = terminalRuns.filter((r) => r.status === "success").length;
  /** Runs that produced at least some evidence (success or partial; not failed). */
  const finishedRuns = terminalRuns.filter((r) => r.status === "success" || r.status === "partial").length;
  const fullSuccessRate = terminalCount ? Math.round((fullSuccessRuns / terminalCount) * 100) : 0;
  const finishedRunRate = terminalCount ? Math.round((finishedRuns / terminalCount) * 100) : 0;
  const latestRun = runs[0];
  const partialHint =
    latestRun && (latestRun.status === "partial" || latestRun.status === "failed") && latestRun.error_message
      ? latestRun.error_message
      : null;

  const openEvidenceSection = () => {
    if (activeSection === "evidence") return;
    setEvidenceSectionLoading(true);
    setTimeout(() => {
      setUserSection("evidence");
      setEvidenceSectionLoading(false);
    }, 450);
  };

  const openRunHistorySection = () => {
    if (activeSection === "run-history") return;
    setRunHistorySectionLoading(true);
    setTimeout(() => {
      setUserSection("run-history");
      setRunHistorySectionLoading(false);
    }, 450);
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Dashboard header: title + Account + Evidence / Run Details (flat on page, no card) */}
      <section aria-label="Overview" className="w-full">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold leading-tight" style={{ color: "var(--foreground)" }}>
              AWS dashboard
            </h1>
            <p className="mt-1 text-sm leading-snug" style={{ color: "var(--foreground-muted)" }}>
              Compliance evidence at a glance — collect and view AWS security evidence for SWIFT controls.
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 md:w-auto md:shrink-0">
            <Link href="/aws" className={`${awsButtonSecondaryClass} min-h-[42px] px-3 sm:px-4`}>
              Account
            </Link>
            <div className={`${awsSegmentShellClass} sm:max-w-none`}>
              <button
                type="button"
                onClick={openEvidenceSection}
                disabled={evidenceSectionLoading || activeSection === "evidence"}
                className={awsSegmentButtonClass}
                style={{
                  background: activeSection === "evidence" ? "var(--primary-muted)" : "transparent",
                  color: activeSection === "evidence" ? "var(--primary)" : "var(--foreground)",
                  boxShadow: activeSection === "evidence" ? "0 1px 2px rgba(15, 23, 42, 0.08)" : undefined,
                }}
              >
                {evidenceSectionLoading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <FileText className="h-4 w-4 shrink-0" />}
                {activeSection === "evidence" ? "Evidence loaded" : "Show evidence"}
              </button>
              <button
                type="button"
                onClick={openRunHistorySection}
                disabled={runHistorySectionLoading || activeSection === "run-history"}
                className={awsSegmentButtonClass}
                style={{
                  background: activeSection === "run-history" ? "var(--primary-muted)" : "transparent",
                  color: activeSection === "run-history" ? "var(--primary)" : "var(--foreground)",
                  boxShadow: activeSection === "run-history" ? "0 1px 2px rgba(15, 23, 42, 0.08)" : undefined,
                }}
              >
                {runHistorySectionLoading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <BarChart3 className="h-4 w-4 shrink-0" />}
                {activeSection === "run-history" ? "Run Details loaded" : "Run Details"}
              </button>
            </div>
          </div>
        </div>

        {fetching && (
          <p className="mt-4 text-sm" style={{ color: "var(--foreground-muted)" }}>
            Run in progress. This page updates automatically when collection finishes.
          </p>
        )}
        {fetchError && (
          <div
            className="mt-4 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm"
            style={{
              borderColor: "var(--danger)",
              background: "var(--danger-bg)",
              color: "var(--danger)",
            }}
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{fetchError}</span>
          </div>
        )}
        {partialHint && !fetchError && (
          <div
            className="mt-4 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm"
            style={{
              borderColor: "var(--warning)",
              background: "var(--warning-bg, rgba(234, 179, 8, 0.08))",
              color: "var(--foreground)",
            }}
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--warning)" }} />
            <div className="min-w-0">
              <p className="font-medium" style={{ color: "var(--foreground)" }}>
                Latest run did not complete with all collectors ({latestRun?.status === "failed" ? "failed" : "partial"}).
              </p>
              <p className="mt-1 break-words text-xs leading-snug" style={{ color: "var(--foreground-muted)" }}>
                Evidence rows are still saved for collectors that succeeded. Each row maps one control to one snapshot — similar
                sources (e.g. aws-iam) can appear multiple times from different collectors. Details: {partialHint}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* KPIs */}
      <section aria-label="Key metrics" className="w-full">
        <AwsSectionTitle>Key metrics</AwsSectionTitle>
        <AwsKpiCards
          runsCount={runs.length}
          evidenceCount={evidenceCount}
          finishedRunRate={finishedRunRate}
          fullSuccessRate={fullSuccessRate}
          controlsWithEvidence={controlIdsWithEvidence.length}
        />
      </section>

      {/* Mount whenever we have runs so Run Comparisor data preloads in the background (hidden while Evidence tab is active). */}
      {runs.length > 0 && (
        <section
          id="run-history"
          aria-label="Run activity"
          className={activeSection === "run-history" ? "w-full" : "hidden"}
          aria-hidden={activeSection !== "run-history"}
        >
          <RunHistoryVisuals
            runs={runs}
            evidenceRows={evidenceRows}
            focusComparisorControlKey={focusComparisorControlKey}
            deferredCharts={activeSection !== "run-history"}
            fetchEvidenceContent={getEvidenceContent}
          />
        </section>
      )}

      {activeSection === "evidence" && (
        <section id="dashboard-evidence" aria-label="Evidence section" className="w-full">
          <AwsEvidenceTable
            data={evidenceRows.slice(0, 150)}
            runs={runs}
            onOpenRunComparisor={onOpenRunComparisor}
            onFetchEvidence={onFetchEvidence}
            fetching={fetching}
          />
        </section>
      )}

      
    </div>
  );
}

function RunHistoryVisuals({
  runs,
  evidenceRows,
  focusComparisorControlKey,
  deferredCharts = false,
  fetchEvidenceContent,
}: {
  runs: AwsRun[];
  evidenceRows: AwsEvidenceRow[];
  focusComparisorControlKey?: string | null;
  /** When true, skip heavy Plotly charts (dashboard is showing Evidence); Comparisor still preloads. */
  deferredCharts?: boolean;
  fetchEvidenceContent: (
    evidenceId: string,
    cycleId: string | null | undefined
  ) => Promise<unknown>;
}) {
  return (
    <RunHistoryVisualsPlotly
      runs={runs}
      evidenceRows={evidenceRows}
      focusComparisorControlKey={focusComparisorControlKey ?? null}
      deferredCharts={deferredCharts}
      fetchEvidenceContent={fetchEvidenceContent}
    />
  );
}
