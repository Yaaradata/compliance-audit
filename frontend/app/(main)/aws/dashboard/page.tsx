"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  getRuns,
  getEvidence,
  getControlsCoverage,
  getControlsCoverageItems,
  fetchAwsEvidence,
  getRunDetail,
  isAwsConnectionVisibleForCycle,
} from "@/lib/aws-api";
import { AwsDashboard } from "@/components/aws/aws-dashboard";
import { AwsDashboardSkeleton } from "@/components/aws/aws-dashboard-skeleton";
import type { AwsRun, AwsEvidenceRow, AwsControlItemWithEvidence } from "@/lib/aws-api";

const POLL_INTERVAL_MS = 4000;
const TIMEOUT_POLL_INTERVAL_MS = 6000;
const TIMEOUT_POLL_MAX_MS = 3 * 60 * 1000; // 3 minutes
const RUN_TERMINAL_STATUSES = ["success", "partial", "failed"];

function AwsDashboardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeCycleId } = useAuth();
  const focusKey = searchParams.get("controlKey");
  const openRunHistory = searchParams.get("runHistory") === "1";
  const focusComparisorControlKey = openRunHistory && focusKey ? focusKey : null;
  const [runs, setRuns] = useState<AwsRun[]>([]);
  const [evidenceRows, setEvidenceRows] = useState<AwsEvidenceRow[]>([]);
  const [evidenceCount, setEvidenceCount] = useState(0);
  const [controlIdsWithEvidence, setControlIdsWithEvidence] = useState<string[]>([]);
  const [controlItems, setControlItems] = useState<AwsControlItemWithEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutPollStartRef = useRef<number>(0);

  const load = useCallback(() => {
    setLoading(true);
    if (!isAwsConnectionVisibleForCycle(activeCycleId)) {
      setRuns([]);
      setEvidenceRows([]);
      setEvidenceCount(0);
      setControlIdsWithEvidence([]);
      setControlItems([]);
      setFetchError("No AWS connection for this cycle. Open AWS Connect and configure this cycle.");
      setLoading(false);
      return;
    }
    Promise.all([
      getRuns(50, activeCycleId),
      getEvidence(500, activeCycleId),
      getControlsCoverage(activeCycleId).then((d) => d.control_ids_with_evidence || []),
      getControlsCoverageItems(activeCycleId),
    ])
      .then(([runsList, evidenceList, ids, itemPairs]) => {
        setRuns(runsList);
        setEvidenceRows(evidenceList);
        setEvidenceCount(evidenceList.length);
        setControlIdsWithEvidence(ids);
        setControlItems(itemPairs);
      })
      .catch(() => {
        setRuns([]);
        setEvidenceRows([]);
        setEvidenceCount(0);
        setControlIdsWithEvidence([]);
        setControlItems([]);
      })
      .finally(() => setLoading(false));
  }, [activeCycleId]);

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
    if (!isAwsConnectionVisibleForCycle(activeCycleId)) {
      setFetchError("No AWS connection for this cycle. Open AWS Connect and configure this cycle.");
      return;
    }
    setFetchError(null);
    setFetching(true);
    fetchAwsEvidence(activeCycleId)
      .then((res) => {
        const runId = res?.run_id;
        if (!runId) {
          load();
          setFetching(false);
          return;
        }
        const poll = () => {
          getRunDetail(runId, activeCycleId)
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
              getRuns(10, activeCycleId),
              getEvidence(500, activeCycleId),
              getControlsCoverage(activeCycleId).then((d) => d.control_ids_with_evidence || []),
              getControlsCoverageItems(activeCycleId),
            ])
              .then(([runsList, evidenceList, ids, itemPairs]) => {
                setRuns(runsList);
                setEvidenceRows(evidenceList);
                setEvidenceCount(evidenceList.length);
                setControlIdsWithEvidence(ids);
                setControlItems(itemPairs);
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
  }, [load, activeCycleId]);

  const onOpenRunComparisor = useCallback(
    (row: AwsEvidenceRow) => {
      const params = new URLSearchParams({
        runHistory: "1",
        controlKey: `${row.control_id}::${row.item_code ?? ""}`,
      });
      router.push(`/aws/dashboard?${params.toString()}`);
    },
    [router]
  );

  if (loading) {
    return (
      <>
        <AwsDashboardSkeleton />
      </>
    );
  }

  return (
    <>
      <AwsDashboard
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
    </>
  );
}

export default function AwsDashboardPage() {
  return (
    <Suspense fallback={<AwsDashboardSkeleton />}>
      <AwsDashboardPageContent />
    </Suspense>
  );
}
