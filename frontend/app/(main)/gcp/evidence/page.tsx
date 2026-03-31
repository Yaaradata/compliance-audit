"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { RotateCw, FileCheck, Activity, Target, Layers } from "lucide-react";
import {
  getGcpEvidence,
  getGcpRuns,
  getGcpControlsCoverage,
  getGcpEvidenceContent,
  GCP_EVIDENCE_LIST_MAX,
} from "@/lib/gcp-api";
import { EvidenceRunCompareModal } from "@/components/cloud/evidence-run-compare-modal";
import { AwsEvidenceTable } from "@/components/aws/aws-evidence-table";
import { AwsKpiCard } from "@/components/aws/aws-kpi-cards";
import { AwsPageHeader, AwsSectionTitle, awsButtonSecondaryClass } from "@/components/aws/aws-page-header";
import type { GcpEvidenceRow, GcpRun } from "@/lib/gcp-api";
import { useAuth } from "@/lib/auth-context";

export default function GcpEvidencePage() {
  const { activeCycleId } = useAuth();
  const [data, setData] = useState<GcpEvidenceRow[]>([]);
  const [runs, setRuns] = useState<GcpRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [controlsWithEvidenceCount, setControlsWithEvidenceCount] = useState(0);
  const [compareAnchorRow, setCompareAnchorRow] = useState<GcpEvidenceRow | null>(null);

  const load = useCallback(() => {
    setError(null);
    setLoading(true);
    if (!activeCycleId) {
      setData([]);
      setRuns([]);
      setControlsWithEvidenceCount(0);
      setError("Select an assessment cycle first.");
      setLoading(false);
      return;
    }
    Promise.all([
      getGcpEvidence(GCP_EVIDENCE_LIST_MAX, activeCycleId),
      getGcpRuns(50, activeCycleId),
      getGcpControlsCoverage(activeCycleId),
    ])
      .then(([evidence, runsList, coverage]) => {
        setData(evidence);
        setRuns(runsList ?? []);
        setControlsWithEvidenceCount(coverage?.control_ids_with_evidence?.length ?? 0);
        setLastUpdated(new Date());
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load evidence");
        setData([]);
        setRuns([]);
        setControlsWithEvidenceCount(0);
      })
      .finally(() => setLoading(false));
  }, [activeCycleId]);

  useEffect(() => {
    queueMicrotask(() => {
      load();
    });
  }, [load]);

  useEffect(() => {
    const onCollectionComplete = () => load();
    window.addEventListener("gcp-collection-completed", onCollectionComplete);
    return () => window.removeEventListener("gcp-collection-completed", onCollectionComplete);
  }, [load]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    const checkRunInProgress = () => {
      getGcpRuns(3, activeCycleId)
        .then((runsList) => {
          const running = runsList?.some((r) => r.status === "running");
          if (!running && interval) {
            clearInterval(interval);
            interval = null;
            load();
          }
        })
        .catch(() => {});
    };
    getGcpRuns(1, activeCycleId)
      .then((runsList) => {
        if (runsList?.[0]?.status === "running") {
          interval = setInterval(checkRunInProgress, 5000);
        }
      })
      .catch(() => {});
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [load, activeCycleId]);

  const onOpenRunComparisor = useCallback((row: GcpEvidenceRow) => {
    setCompareAnchorRow(row);
  }, []);

  const uniqueSources = new Set(data.map((e) => e.source_system)).size;

  return (
    <>
      <AwsPageHeader
        title="Evidence"
        subtitle="All collected Google Cloud evidence from collector runs. Inspect payloads and trace what was collected per run."
      >
        {lastUpdated && !loading && (
          <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>
            Updated {lastUpdated.toLocaleTimeString(undefined, { timeStyle: "short" })}
          </span>
        )}
        <Link
          href="/gcp/dashboard"
          className={awsButtonSecondaryClass}
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
        >
          ← Back to Dashboard
        </Link>
        <button
          type="button"
          onClick={() => load()}
          disabled={loading}
          className={awsButtonSecondaryClass}
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
          title="Refresh evidence list"
        >
          <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </AwsPageHeader>

      {error && (
        <div
          className="rounded-lg border px-4 py-3 text-sm mb-4"
          style={{ borderColor: "var(--danger)", background: "var(--danger-bg)", color: "var(--danger)" }}
        >
          {error}
        </div>
      )}

      {!error && (
        <>
          <section aria-label="Key metrics" className="mb-6">
            <AwsSectionTitle>Key metrics</AwsSectionTitle>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <AwsKpiCard icon={FileCheck} value={data.length} label="Evidence items" variant="evidence" />
              <AwsKpiCard icon={Activity} value={runs.length} label="Collector runs" variant="default" />
              <AwsKpiCard icon={Target} value={controlsWithEvidenceCount} label="Controls with evidence" variant="controls" />
              <AwsKpiCard icon={Layers} value={uniqueSources} label="Unique sources" variant="default" />
            </div>
          </section>

          <section className="flex-1 min-h-0 flex flex-col">
            {loading ? (
              <div
                className="card rounded-xl py-16 text-center text-sm flex items-center justify-center"
                style={{ color: "var(--foreground-muted)" }}
              >
                Loading evidence…
              </div>
            ) : data.length === 0 ? (
              <div className="card rounded-xl p-10 text-center">
                <p className="text-base font-medium" style={{ color: "var(--foreground)" }}>
                  No GCP evidence yet
                </p>
                <p className="mt-2 text-sm max-w-md mx-auto" style={{ color: "var(--foreground-muted)" }}>
                  Run a collection from the GCP Dashboard to populate this table, then return here to inspect the collected
                  payloads.
                </p>
                <Link
                  href="/gcp/dashboard"
                  className="inline-flex items-center gap-2 mt-4 rounded-lg border px-4 py-2 text-sm font-medium transition"
                  style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
                >
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <AwsEvidenceTable data={data} runs={runs} onOpenRunComparisor={onOpenRunComparisor} />
            )}
          </section>
        </>
      )}
      <EvidenceRunCompareModal
        key={compareAnchorRow?.evidence_id ?? "closed"}
        anchorRow={compareAnchorRow}
        onClose={() => setCompareAnchorRow(null)}
        allEvidenceRows={data}
        runs={runs}
        cycleId={activeCycleId}
        fetchEvidenceContent={getGcpEvidenceContent}
        fetchEvidenceIndexForRun={(runId, cyc) => getGcpEvidence(GCP_EVIDENCE_LIST_MAX, cyc, runId)}
        providerLabel="GCP"
      />
    </>
  );
}
