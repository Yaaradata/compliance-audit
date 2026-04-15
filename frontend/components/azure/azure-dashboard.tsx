"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, FileText, Loader2, BarChart3 } from "lucide-react";
import { AwsKpiCards } from "@/components/aws/aws-kpi-cards";
import {
  AwsSectionTitle,
  awsButtonPrimaryClass,
  awsButtonSecondaryClass,
  awsSegmentShellClass,
  awsSegmentButtonClass,
} from "@/components/aws/aws-page-header";
import { AwsEvidenceTable } from "@/components/aws/aws-evidence-table";
import { RunHistoryVisualsPlotly } from "@/components/cloud/run-history-visuals-plotly";
import type { AzureEvidenceRow, AzureRun } from "@/lib/azure-api";
import { getAzureEvidenceContent } from "@/lib/azure-api";

interface AzureDashboardProps {
  runs: AzureRun[];
  evidenceRows: AzureEvidenceRow[];
  evidenceCount: number;
  controlIdsWithEvidence: string[];
  onFetchEvidence: () => void;
  onOpenRunComparisor: (row: AzureEvidenceRow) => void;
  focusComparisorControlKey?: string | null;
  fetching: boolean;
  fetchError: string | null;
}

export function AzureDashboard({
  runs,
  evidenceRows,
  evidenceCount,
  controlIdsWithEvidence,
  onFetchEvidence,
  onOpenRunComparisor,
  focusComparisorControlKey = null,
  fetching,
  fetchError,
}: AzureDashboardProps) {
  const [userSection, setUserSection] = useState<"evidence" | "run-history">(() =>
    focusComparisorControlKey ? "run-history" : "evidence"
  );
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
  const terminalRuns = runs.filter((r) => ["success", "partial", "failed"].includes((r.status ?? "").toLowerCase()));
  const terminalCount = terminalRuns.length;
  const fullSuccessRuns = terminalRuns.filter((r) => r.status === "success").length;
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
      <section aria-label="Overview" className="w-full">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold leading-tight" style={{ color: "var(--foreground)" }}>
              Azure dashboard
            </h1>
            <p className="mt-1 text-sm leading-snug" style={{ color: "var(--foreground-muted)" }}>
              Compliance evidence at a glance — collect Microsoft Azure configuration via Resource Graph and Defender
              assessments aligned to your SWIFT workbook. Use{" "}
              <Link href="/azure" className="underline font-medium" style={{ color: "var(--primary)" }}>
                Azure Connect
              </Link>{" "}
              to change subscription, tenant, or Microsoft sign-in.
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 md:w-auto md:shrink-0">
            <Link href="/azure" className={`${awsButtonSecondaryClass} min-h-[42px] px-3 sm:px-4`}>
              Azure Connect
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
                Evidence rows are still saved for collectors that succeeded. Details: {partialHint}
              </p>
            </div>
          </div>
        )}
      </section>

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

      {runs.length > 0 && (
        <section
          id="run-history"
          aria-label="Run activity"
          className={activeSection === "run-history" ? "w-full" : "hidden"}
          aria-hidden={activeSection !== "run-history"}
        >
          <RunHistoryVisualsPlotly
            runs={runs}
            evidenceRows={evidenceRows}
            focusComparisorControlKey={focusComparisorControlKey}
            deferredCharts={activeSection !== "run-history"}
            fetchEvidenceContent={(id, cycleId) => getAzureEvidenceContent(id, cycleId)}
          />
        </section>
      )}

      {activeSection === "evidence" && (
        <section id="dashboard-evidence" aria-label="Evidence section" className="w-full">
          <AwsEvidenceTable
            data={evidenceRows}
            runs={runs}
            onOpenRunComparisor={onOpenRunComparisor}
            onFetchEvidence={onFetchEvidence}
            fetching={fetching}
            fetchButtonLabel="Fetch Azure evidence"
          />
        </section>
      )}
    </div>
  );
}
