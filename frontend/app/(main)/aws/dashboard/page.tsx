"use client";

import { useState, useEffect, useCallback } from "react";
import { RotateCw } from "lucide-react";
import Link from "next/link";
import { getRuns, getEvidence, getControlsCoverage, fetchAwsEvidence } from "@/lib/aws-api";
import { AwsDashboard } from "@/components/aws/aws-dashboard";
import { AwsDashboardSkeleton } from "@/components/aws/aws-dashboard-skeleton";
import type { AwsRun } from "@/lib/aws-api";

export default function AwsDashboardPage() {
  const [runs, setRuns] = useState<AwsRun[]>([]);
  const [evidenceCount, setEvidenceCount] = useState(0);
  const [controlIdsWithEvidence, setControlIdsWithEvidence] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      getRuns(50),
      getEvidence(500).then((list) => list.length),
      getControlsCoverage().then((d) => d.control_ids_with_evidence || []),
    ])
      .then(([runsList, count, ids]) => {
        setRuns(runsList);
        setEvidenceCount(count);
        setControlIdsWithEvidence(ids);
      })
      .catch(() => {
        setRuns([]);
        setEvidenceCount(0);
        setControlIdsWithEvidence([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onFetchEvidence = useCallback(() => {
    setFetchError(null);
    setFetching(true);
    fetchAwsEvidence()
      .then(() => {
        load();
      })
      .catch((e: Error & { detail?: unknown; status?: number }) => {
        const msg = typeof e.detail === "string" ? e.detail : e.message;
        if (e.status === 404 || (msg && msg.toLowerCase().includes("not found"))) {
          setFetchError(
            "Collect endpoint not found. Ensure the backend is running (e.g. uvicorn on port 8000) and NEXT_PUBLIC_BACKEND_URL in frontend/.env points to it."
          );
        } else if (!msg || /failed to fetch|network error|load failed/i.test(msg)) {
          setFetchError(
            "Cannot reach the backend. Check that the backend is running and NEXT_PUBLIC_BACKEND_URL in frontend/.env is correct (e.g. http://127.0.0.1:8000)."
          );
        } else if (e.status === 400 || (msg && /no aws credentials|credentials configured/i.test(msg))) {
          setFetchError(
            "Connect your AWS account first. Go to AWS (Connect) and enter your Access Key and Secret, then try again."
          );
        } else if (e.status === 500 || e.status === 502 || e.status === 504 || (msg && /internal server error|gateway|timeout/i.test(msg))) {
          setFetchError(
            "Request timed out or the server reported an error. The collection may still have completed. Click Refresh to see if new evidence is available."
          );
        } else {
          setFetchError(msg);
        }
      })
      .finally(() => setFetching(false));
  }, [load]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
          >
            <RotateCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
        <AwsDashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-end gap-2">
        <Link
          href="/aws"
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:opacity-90"
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
        >
          Account
        </Link>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:opacity-90"
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
          title="Refresh dashboard data"
        >
          <RotateCw className="h-4 w-4" />
          Refresh
        </button>
      </div>
      <AwsDashboard
        runs={runs}
        evidenceCount={evidenceCount}
        controlIdsWithEvidence={controlIdsWithEvidence}
        onFetchEvidence={onFetchEvidence}
        onRunDeleted={load}
        fetching={fetching}
        fetchError={fetchError}
      />
    </div>
  );
}
