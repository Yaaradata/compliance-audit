"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getAzureRuns,
  getAzureEvidence,
  getAzureControlsCoverage,
  fetchAzureEvidence,
  getAzureRunDetail,
  getAzureEvidenceContent,
  getAzureConfig,
  AZURE_EVIDENCE_LIST_MAX,
  type AzureRun,
  type AzureEvidenceRow,
  type AzureConfigResponse,
} from "@/lib/azure-api";
import { AzureDashboard } from "@/components/azure/azure-dashboard";
import { AwsDashboardSkeleton } from "@/components/aws/aws-dashboard-skeleton";
import { EvidenceRunCompareModal } from "@/components/cloud/evidence-run-compare-modal";
import {
  AwsPageHeader,
  awsButtonPrimaryClass,
  awsButtonSecondaryClass,
} from "@/components/aws/aws-page-header";

type AzureConnectionGate = "none" | "no_cycle" | "not_connected";

const POLL_INTERVAL_MS = 4000;
const TIMEOUT_POLL_INTERVAL_MS = 6000;
const TIMEOUT_POLL_MAX_MS = 5 * 60 * 1000;
const RUN_TERMINAL_STATUSES = ["success", "partial", "failed"];
const FETCH_TIME_SKEW_MS = 2 * 60 * 1000;

function isNewestRunTerminalAfterFetch(runsList: AzureRun[], fetchStartedAt: number): boolean {
  const first = runsList[0];
  if (!first || !RUN_TERMINAL_STATUSES.includes(first.status ?? "")) return false;
  const ended = first.ended_at ? new Date(first.ended_at).getTime() : 0;
  const started = first.execution_time ? new Date(first.execution_time).getTime() : 0;
  const t = Math.max(ended, started);
  if (t <= 0) return false;
  return t >= fetchStartedAt - FETCH_TIME_SKEW_MS;
}

function isCollectRecoveryComplete(
  runsList: AzureRun[],
  evidenceList: AzureEvidenceRow[],
  baselineEvidenceCount: number,
  fetchStartedAt: number
): boolean {
  if (evidenceList.length > baselineEvidenceCount) return true;
  return isNewestRunTerminalAfterFetch(runsList, fetchStartedAt);
}

function azureDashboardUnlocked(c: { configured?: boolean; dashboard_unlocked?: boolean } | null): boolean {
  if (!c) return false;
  return Boolean(typeof c.dashboard_unlocked === "boolean" ? c.dashboard_unlocked : c.configured);
}

function AzureDashboardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeCycleId } = useAuth();
  const [microsoftSignInWelcome, setMicrosoftSignInWelcome] = useState(false);
  const focusKey = searchParams.get("controlKey");
  const openRunHistory = searchParams.get("runHistory") === "1";
  const focusComparisorControlKey = openRunHistory && focusKey ? focusKey : null;
  const [runs, setRuns] = useState<AzureRun[]>([]);
  const [evidenceRows, setEvidenceRows] = useState<AzureEvidenceRow[]>([]);
  const [evidenceCount, setEvidenceCount] = useState(0);
  const [controlIdsWithEvidence, setControlIdsWithEvidence] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [connectionGate, setConnectionGate] = useState<AzureConnectionGate>("none");
  const [gateConfig, setGateConfig] = useState<AzureConfigResponse | null>(null);
  const [compareAnchorRow, setCompareAnchorRow] = useState<AzureEvidenceRow | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutPollStartRef = useRef<number>(0);
  const evidenceBaselineRef = useRef(0);
  const fetchStartedAtRef = useRef(0);

  const load = useCallback(() => {
    setLoading(true);
    if (!activeCycleId) {
      setConnectionGate("no_cycle");
      setGateConfig(null);
      setRuns([]);
      setEvidenceRows([]);
      setEvidenceCount(0);
      setControlIdsWithEvidence([]);
      setFetchError("Select an assessment cycle first. Azure evidence is scoped per cycle.");
      setLoading(false);
      return;
    }
    getAzureConfig(activeCycleId)
      .then((cfg) => {
        if (!azureDashboardUnlocked(cfg)) {
          setConnectionGate("not_connected");
          setGateConfig(cfg);
          setRuns([]);
          setEvidenceRows([]);
          setEvidenceCount(0);
          setControlIdsWithEvidence([]);
          setFetchError(null);
          setLoading(false);
          return;
        }
        setConnectionGate("none");
        setGateConfig(null);
        return Promise.all([
          getAzureRuns(50, activeCycleId),
          getAzureEvidence(AZURE_EVIDENCE_LIST_MAX, activeCycleId),
          getAzureControlsCoverage(activeCycleId).then((d) => d.control_ids_with_evidence || []),
        ]).then(([runsList, evidenceList, ids]) => {
          setRuns(runsList);
          setEvidenceRows(evidenceList);
          setEvidenceCount(evidenceList.length);
          setControlIdsWithEvidence(ids);
          setFetchError(null);
        });
      })
      .catch(() => {
        setConnectionGate("none");
        setGateConfig(null);
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

  useEffect(() => {
    if (searchParams.get("azure_oauth") !== "success") return;
    setMicrosoftSignInWelcome(true);
    const next = new URLSearchParams(searchParams.toString());
    next.delete("azure_oauth");
    next.delete("message");
    const q = next.toString();
    router.replace(q ? `/azure/dashboard?${q}` : "/azure/dashboard", { scroll: false });
  }, [searchParams, router]);

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
    fetchAzureEvidence(activeCycleId)
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
          getAzureRunDetail(runId, activeCycleId)
            .then((detail) => {
              if (RUN_TERMINAL_STATUSES.includes(detail?.status ?? "")) {
                if (pollRef.current) {
                  clearInterval(pollRef.current);
                  pollRef.current = null;
                }
                setFetching(false);
                load();
                if (typeof window !== "undefined") window.dispatchEvent(new Event("azure-collection-completed"));
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
            "Collect endpoint not found. Ensure the backend is running (e.g. uvicorn on port 8000) and NEXT_PUBLIC_BACKEND_URL in frontend/.env points to it."
          );
          setFetching(false);
        } else if (!msg || /failed to fetch|network error|load failed/i.test(msg)) {
          setFetchError(
            "Cannot reach the backend. Check that the backend is running and NEXT_PUBLIC_BACKEND_URL in frontend/.env is correct (e.g. http://127.0.0.1:8000)."
          );
          setFetching(false);
        } else if (
          e.status === 400 ||
          (msg && /subscription|tenant|credential|test connection|resource graph/i.test(msg))
        ) {
          setFetchError(
            "Cannot collect Azure evidence yet. On Azure → Connect, use Sign in with Microsoft (or save subscription and tenant and pass Test connection), or set AZURE_CLIENT_ID and AZURE_CLIENT_SECRET in backend .env, or use managed identity when the API runs on Azure."
          );
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
              getAzureRuns(50, activeCycleId),
              getAzureEvidence(AZURE_EVIDENCE_LIST_MAX, activeCycleId),
              getAzureControlsCoverage(activeCycleId).then((d) => d.control_ids_with_evidence || []),
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
                  setFetching(false);
                  setFetchError(null);
                  if (typeof window !== "undefined") window.dispatchEvent(new Event("azure-collection-completed"));
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

  const onOpenRunCompare = useCallback((row: AzureEvidenceRow) => {
    setCompareAnchorRow(row);
  }, []);

  if (loading) {
    return <AwsDashboardSkeleton />;
  }

  if (connectionGate === "no_cycle") {
    return (
      <div className="w-full flex flex-col gap-5">
        <AwsPageHeader
          title="Azure dashboard"
          subtitle="Evidence and run history appear after you connect Microsoft Azure for the selected assessment cycle."
        >
          <Link href="/azure" className={awsButtonSecondaryClass}>
            Azure Connect
          </Link>
        </AwsPageHeader>
        <div
          className="rounded-lg border px-4 py-3 text-sm max-w-2xl"
          style={{ borderColor: "var(--warning)", background: "var(--warning-bg)", color: "var(--warning)" }}
        >
          {fetchError}
        </div>
      </div>
    );
  }

  if (connectionGate === "not_connected") {
    const oauthOn = Boolean(gateConfig?.azure_oauth_env_configured);
    return (
      <div className="w-full flex flex-col gap-5">
        <AwsPageHeader
          title="Azure dashboard"
          subtitle="Open Azure Connect and use Sign in with Microsoft (when OAuth is enabled) to detect subscription and tenant, or save scope and Test connection — then return here to collect evidence."
        >
          <Link href="/azure" className={awsButtonPrimaryClass}>
            Azure Connect
          </Link>
        </AwsPageHeader>
        <div
          className="rounded-lg border px-4 py-4 text-sm space-y-3 max-w-2xl"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <p style={{ color: "var(--foreground)" }}>
            This cycle is not connected yet. On Azure Connect, save subscription and tenant, then{" "}
            {oauthOn ? (
              <>
                use <strong className="font-medium">Sign in with Microsoft</strong> on Connect (or Test connection for service principal).
              </>
            ) : (
              "run Test connection (or configure a service principal on the API)."
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/azure" className={awsButtonPrimaryClass}>
              Open Azure Connect
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {microsoftSignInWelcome && (
        <div
          className="rounded-lg border px-4 py-3 text-sm flex items-start gap-3"
          style={{
            borderColor: "var(--success)",
            background: "var(--success-bg)",
            color: "var(--success)",
          }}
          role="status"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="font-medium" style={{ color: "var(--foreground)" }}>
              Microsoft sign-in completed
            </p>
            <p className="mt-1 text-xs sm:text-sm" style={{ color: "var(--foreground-muted)" }}>
              You can fetch Azure evidence below. If collection fails, open Azure → Connect and run Test connection, or check Reader
              access on your subscription.
            </p>
            <button
              type="button"
              className="mt-2 text-xs font-medium underline"
              style={{ color: "var(--primary)" }}
              onClick={() => setMicrosoftSignInWelcome(false)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      <AzureDashboard
        runs={runs}
        evidenceRows={evidenceRows}
        evidenceCount={evidenceCount}
        controlIdsWithEvidence={controlIdsWithEvidence}
        onFetchEvidence={onFetchEvidence}
        onOpenRunComparisor={onOpenRunCompare}
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
        fetchEvidenceContent={getAzureEvidenceContent}
        fetchEvidenceIndexForRun={(runId, cyc) => getAzureEvidence(AZURE_EVIDENCE_LIST_MAX, cyc, runId)}
        providerLabel="Azure"
      />
    </>
  );
}

export default function AzureDashboardPage() {
  return (
    <Suspense fallback={<AwsDashboardSkeleton />}>
      <AzureDashboardPageContent />
    </Suspense>
  );
}
