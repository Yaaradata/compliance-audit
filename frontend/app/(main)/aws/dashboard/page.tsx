"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RotateCw } from "lucide-react";
import Link from "next/link";
import { getRuns, getEvidence, getControlsCoverage, fetchAwsEvidence, getRunDetail } from "@/lib/aws-api";
import { AwsDashboard } from "@/components/aws/aws-dashboard";
import { AwsDashboardSkeleton } from "@/components/aws/aws-dashboard-skeleton";
import { AwsPageHeader, awsButtonSecondaryClass } from "@/components/aws/aws-page-header";
import type { AwsRun } from "@/lib/aws-api";

const POLL_INTERVAL_MS = 4000;
const TIMEOUT_POLL_INTERVAL_MS = 6000;
const TIMEOUT_POLL_MAX_MS = 3 * 60 * 1000; // 3 minutes
const RUN_TERMINAL_STATUSES = ["success", "partial", "failed"];

export default function AwsDashboardPage() {
  const [runs, setRuns] = useState<AwsRun[]>([]);
  const [evidenceCount, setEvidenceCount] = useState(0);
  const [controlIdsWithEvidence, setControlIdsWithEvidence] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutPollStartRef = useRef<number>(0);

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

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timeoutPollRef.current) clearInterval(timeoutPollRef.current);
    };
  }, []);

  const onFetchEvidence = useCallback(() => {
    setFetchError(null);
    setFetching(true);
    fetchAwsEvidence()
      .then((res) => {
        const runId = res?.run_id;
        if (!runId) {
          load();
          setFetching(false);
          return;
        }
        const poll = () => {
          getRunDetail(runId)
            .then((detail) => {
              if (RUN_TERMINAL_STATUSES.includes(detail?.status ?? "")) {
                if (pollRef.current) {
                  clearInterval(pollRef.current);
                  pollRef.current = null;
                }
                setFetching(false);
                load();
                if (typeof window !== "undefined") window.dispatchEvent(new Event("aws-collection-completed"));
              }
            })
            .catch(() => {
              if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
              }
              setFetching(false);
              load();
            });
        };
        poll();
        pollRef.current = setInterval(poll, POLL_INTERVAL_MS);
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
        } else if (e.status === 400 || (msg && /no aws connection|credentials configured|account id and region/i.test(msg))) {
          setFetchError(
            "Connect your AWS account first. Go to AWS → Connect and enter Account ID and Region, then try again."
          );
        } else if (e.status === 500 || e.status === 502 || e.status === 504 || (msg && /internal server error|gateway|timeout/i.test(msg))) {
          setFetchError(
            "Request timed out or the server reported an error. The collection may still have completed. Checking for new data…"
          );
          // Poll runs/evidence until we see a recently completed run or hit max time.
          timeoutPollStartRef.current = Date.now();
          const doTimeoutPoll = () => {
            if (Date.now() - timeoutPollStartRef.current > TIMEOUT_POLL_MAX_MS) {
              if (timeoutPollRef.current) {
                clearInterval(timeoutPollRef.current);
                timeoutPollRef.current = null;
              }
              return;
            }
            Promise.all([
              getRuns(10),
              getEvidence(500).then((list) => list.length),
              getControlsCoverage().then((d) => d.control_ids_with_evidence || []),
            ])
              .then(([runsList, count, ids]) => {
                setRuns(runsList);
                setEvidenceCount(count);
                setControlIdsWithEvidence(ids);
                const first = runsList[0];
                const endedAt = first?.ended_at ? new Date(first.ended_at).getTime() : 0;
                const isRecentCompleted =
                  first &&
                  RUN_TERMINAL_STATUSES.includes(first.status) &&
                  endedAt &&
                  Date.now() - endedAt < TIMEOUT_POLL_MAX_MS;
                if (isRecentCompleted && timeoutPollRef.current) {
                  clearInterval(timeoutPollRef.current);
                  timeoutPollRef.current = null;
                  setFetchError(null);
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("aws-collection-completed"));
                  }
                }
              })
              .catch(() => {});
          };
          doTimeoutPoll();
          timeoutPollRef.current = setInterval(doTimeoutPoll, TIMEOUT_POLL_INTERVAL_MS);
        } else {
          setFetchError(msg);
        }
        setFetching(false);
      });
  }, [load]);

  if (loading) {
    return (
      <>
        <AwsPageHeader
          title="Dashboard"
          subtitle="Compliance evidence at a glance. Run collectors and view key metrics."
        >
          <button
            type="button"
            onClick={load}
            className={awsButtonSecondaryClass}
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
          >
            <RotateCw className="h-4 w-4" />
            Refresh
          </button>
        </AwsPageHeader>
        <AwsDashboardSkeleton />
      </>
    );
  }

  return (
    <>
      <AwsPageHeader
        title="Dashboard"
        subtitle="Compliance evidence at a glance. Run collectors and view key metrics."
      >
        <Link
          href="/aws"
          className={awsButtonSecondaryClass}
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
        >
          Account
        </Link>
        <button
          type="button"
          onClick={load}
          className={awsButtonSecondaryClass}
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
          title="Refresh dashboard data"
        >
          <RotateCw className="h-4 w-4" />
          Refresh
        </button>
      </AwsPageHeader>
      <AwsDashboard
        runs={runs}
        evidenceCount={evidenceCount}
        controlIdsWithEvidence={controlIdsWithEvidence}
        onFetchEvidence={onFetchEvidence}
        onRunDeleted={load}
        fetching={fetching}
        fetchError={fetchError}
      />
    </>
  );
}
