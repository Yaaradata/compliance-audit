"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  getGcpRuns,
  getGcpEvidence,
  getGcpControlsCoverage,
  fetchGcpEvidence,
  getGcpRunDetail,
  getGcpEvidenceContent,
  GCP_EVIDENCE_LIST_MAX,
  type GcpRun,
  type GcpEvidenceRow,
} from "@/lib/gcp-api";
import { GcpDashboard } from "@/components/gcp/gcp-dashboard";
import { EvidenceRunCompareModal } from "@/components/cloud/evidence-run-compare-modal";
import { AwsDashboardSkeleton } from "@/components/aws/aws-dashboard-skeleton";

const POLL_INTERVAL_MS = 4000;
const TIMEOUT_POLL_INTERVAL_MS = 6000;
const TIMEOUT_POLL_MAX_MS = 5 * 60 * 1000;
const RUN_TERMINAL_STATUSES = ["success", "partial", "failed"];
const FETCH_TIME_SKEW_MS = 2 * 60 * 1000;

function isNewestRunTerminalAfterFetch(runsList: GcpRun[], fetchStartedAt: number): boolean {
  const first = runsList[0];
  if (!first || !RUN_TERMINAL_STATUSES.includes(first.status ?? "")) return false;
  const ended = first.ended_at ? new Date(first.ended_at).getTime() : 0;
  const started = first.execution_time ? new Date(first.execution_time).getTime() : 0;
  const t = Math.max(ended, started);
  if (t <= 0) return false;
  return t >= fetchStartedAt - FETCH_TIME_SKEW_MS;
}

function isCollectRecoveryComplete(
  runsList: GcpRun[],
  evidenceList: GcpEvidenceRow[],
  baselineEvidenceCount: number,
  fetchStartedAt: number
): boolean {
  if (evidenceList.length > baselineEvidenceCount) return true;
  return isNewestRunTerminalAfterFetch(runsList, fetchStartedAt);
}

function GcpDashboardPageContent() {
  const searchParams = useSearchParams();
  const { activeCycleId } = useAuth();
  const focusKey = searchParams.get("controlKey");
  const openRunHistory = searchParams.get("runHistory") === "1";
  const focusComparisorControlKey = openRunHistory && focusKey ? focusKey : null;
  const [runs, setRuns] = useState<GcpRun[]>([]);
  const [evidenceRows, setEvidenceRows] = useState<GcpEvidenceRow[]>([]);
  const [evidenceCount, setEvidenceCount] = useState(0);
  const [controlIdsWithEvidence, setControlIdsWithEvidence] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [compareAnchorRow, setCompareAnchorRow] = useState<GcpEvidenceRow | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutPollStartRef = useRef<number>(0);
  const evidenceBaselineRef = useRef(0);
  const fetchStartedAtRef = useRef(0);

  const load = useCallback(() => {
    setLoading(true);
    if (!activeCycleId) {
      setRuns([]);
      setEvidenceRows([]);
      setEvidenceCount(0);
      setControlIdsWithEvidence([]);
      setFetchError("Select an assessment cycle first.");
      setLoading(false);
      return;
    }
    Promise.all([
      getGcpRuns(50, activeCycleId),
      getGcpEvidence(GCP_EVIDENCE_LIST_MAX, activeCycleId),
      getGcpControlsCoverage(activeCycleId).then((d) => d.control_ids_with_evidence || []),
    ])
      .then(([runsList, evidenceList, ids]) => {
        setRuns(runsList);
        setEvidenceRows(evidenceList);
        setEvidenceCount(evidenceList.length);
        setControlIdsWithEvidence(ids);
      })
      .catch(() => {
        setRuns([]);
        setEvidenceRows([]);
        setEvidenceCount(0);
        setControlIdsWithEvidence([]);
      })
      .finally(() => setLoading(false));
  }, [activeCycleId]);

  useEffect(() => {
    queueMicrotask(() => {
      load();
    });
  }, [load]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timeoutPollRef.current) clearInterval(timeoutPollRef.current);
    };
  }, []);

  const onFetchEvidence = useCallback(() => {
    if (!activeCycleId) {
      setFetchError("Select an assessment cycle first.");
      return;
    }
    setFetchError(null);
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (timeoutPollRef.current) {
      clearInterval(timeoutPollRef.current);
      timeoutPollRef.current = null;
    }
    evidenceBaselineRef.current = evidenceRows.length;
    fetchStartedAtRef.current = Date.now();
    setFetching(true);
    fetchGcpEvidence(activeCycleId)
      .then((res) => {
        if (timeoutPollRef.current) {
          clearInterval(timeoutPollRef.current);
          timeoutPollRef.current = null;
        }
        const runId = res?.run_id;
        if (!runId) {
          load();
          setFetching(false);
          return;
        }
        const poll = () => {
          getGcpRunDetail(runId, activeCycleId)
            .then((detail) => {
              if (RUN_TERMINAL_STATUSES.includes(detail?.status ?? "")) {
                if (pollRef.current) {
                  clearInterval(pollRef.current);
                  pollRef.current = null;
                }
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new Event("gcp-collection-completed"));
                  window.location.reload();
                }
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
      .catch((e: Error & { detail?: unknown; status?: number; name?: string }) => {
        const msg = typeof e.detail === "string" ? e.detail : e.message;
        const errName = typeof e.name === "string" ? e.name : "";
        const looksLikeCollectTimeoutOrOverload =
          errName === "TimeoutError" ||
          e.status === 500 ||
          e.status === 502 ||
          e.status === 503 ||
          e.status === 504 ||
          (msg && /internal server error|gateway|timeout|timed out|abort/i.test(msg));

        if (e.status === 404 || (msg && msg.toLowerCase().includes("not found"))) {
          setFetchError(
            "Collect endpoint not found. Ensure the backend is running and NEXT_PUBLIC_BACKEND_URL points to it."
          );
          setFetching(false);
        } else if (!msg || /failed to fetch|network error|load failed/i.test(msg)) {
          setFetchError(
            "Cannot reach the backend. Check NEXT_PUBLIC_BACKEND_URL in frontend/.env (e.g. http://127.0.0.1:8000)."
          );
          setFetching(false);
        } else if (e.status === 503 || (msg && /not configured|GCP_EVIDENCE_PROJECT_ID/i.test(msg))) {
          setFetchError("Configure GCP_EVIDENCE_PROJECT_ID on the backend and ensure ADC credentials are available.");
          setFetching(false);
        } else if (looksLikeCollectTimeoutOrOverload) {
          timeoutPollStartRef.current = Date.now();
          const baseline = evidenceBaselineRef.current;
          const startedAt = fetchStartedAtRef.current;
          const doTimeoutPoll = () => {
            if (Date.now() - timeoutPollStartRef.current > TIMEOUT_POLL_MAX_MS) {
              if (timeoutPollRef.current) {
                clearInterval(timeoutPollRef.current);
                timeoutPollRef.current = null;
              }
              setFetching(false);
              setFetchError(
                "Collection is still finishing or took longer than expected. Refresh the page to see the latest evidence."
              );
              return;
            }
            Promise.all([
              getGcpRuns(50, activeCycleId),
              getGcpEvidence(GCP_EVIDENCE_LIST_MAX, activeCycleId),
              getGcpControlsCoverage(activeCycleId).then((d) => d.control_ids_with_evidence || []),
            ])
              .then(([runsList, evidenceList, ids]) => {
                setRuns(runsList);
                setEvidenceRows(evidenceList);
                setEvidenceCount(evidenceList.length);
                setControlIdsWithEvidence(ids);
                if (isCollectRecoveryComplete(runsList, evidenceList, baseline, startedAt)) {
                  if (timeoutPollRef.current) {
                    clearInterval(timeoutPollRef.current);
                    timeoutPollRef.current = null;
                  }
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("gcp-collection-completed"));
                    window.location.reload();
                  }
                }
              })
              .catch(() => {});
          };
          doTimeoutPoll();
          timeoutPollRef.current = setInterval(doTimeoutPoll, TIMEOUT_POLL_INTERVAL_MS);
        } else {
          setFetchError(msg ?? "Collect failed.");
          setFetching(false);
        }
      });
  }, [load, activeCycleId, evidenceRows.length]);

  const onOpenRunComparisor = useCallback((row: GcpEvidenceRow) => {
    setCompareAnchorRow(row);
  }, []);

  if (loading) {
    return <AwsDashboardSkeleton />;
  }

  return (
    <>
      <GcpDashboard
        runs={runs}
        evidenceRows={evidenceRows}
        evidenceCount={evidenceCount}
        controlIdsWithEvidence={controlIdsWithEvidence}
        onFetchEvidence={onFetchEvidence}
        onOpenRunComparisor={onOpenRunComparisor}
        focusComparisorControlKey={focusComparisorControlKey}
        fetching={fetching}
        fetchError={fetchError}
      />
      <EvidenceRunCompareModal
        key={compareAnchorRow?.evidence_id ?? "closed"}
        anchorRow={compareAnchorRow}
        onClose={() => setCompareAnchorRow(null)}
        allEvidenceRows={evidenceRows}
        runs={runs}
        cycleId={activeCycleId}
        fetchEvidenceContent={getGcpEvidenceContent}
        fetchEvidenceIndexForRun={(runId, cyc) => getGcpEvidence(GCP_EVIDENCE_LIST_MAX, cyc, runId)}
        providerLabel="GCP"
      />
    </>
  );
}

export default function GcpDashboardPage() {
  return (
    <Suspense fallback={<AwsDashboardSkeleton />}>
      <GcpDashboardPageContent />
    </Suspense>
  );
}
