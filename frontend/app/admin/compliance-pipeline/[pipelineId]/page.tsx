"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { AppHeader } from "@/components/layout/app-header";
import { StageStepper } from "@/components/compliance-pipeline/stage-stepper";
import { StageChatPanel } from "@/components/compliance-pipeline/stage-chat-panel";
import { PipelineStageViewer } from "@/components/compliance-pipeline/pipeline-stage-viewer";

interface Pipeline {
  id: string;
  name: string;
  schema_name: string;
  status: string;
  current_stage: number;
  /** Highest stage tab (1–4) allowed from confirmed outputs; independent of `status` after failures. */
  max_nav_stage: number;
  pdf_storage_path: string | null;
  created_at: string;
}

interface StageOutput {
  id: string;
  pipeline_id: string;
  stage: number;
  version: number;
  output_data: Record<string, unknown>;
  status: string;
  created_at: string;
  updated_at: string;
}

interface StageValidationIssue {
  path: string;
  problem: string;
  impact: string;
  fix: string;
  blocking: boolean;
}

interface StageValidation {
  stage: number;
  ok: boolean;
  blocking_issue_count: number;
  warning_count: number;
  issues: StageValidationIssue[];
}

const ACTIVE_STAGE_STORAGE_KEY = "compliance-pipeline-active-stage";

/** Try to load stage output whenever it might exist — do not gate on `failed` or `finalizing` (outputs remain in DB). */
function shouldFetchPipelineStageOutput(pipeline: Pipeline, activeStage: number): boolean {
  if (activeStage < 1 || activeStage > 3) return false;
  if (pipeline.status === "created") return false;
  if (pipeline.status === `stage_${activeStage}_running`) return false;
  return true;
}

function readSavedActiveStage(pipelineId: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${ACTIVE_STAGE_STORAGE_KEY}:${pipelineId}`);
    if (!raw) return null;
    const n = parseInt(raw, 10);
    if (Number.isFinite(n) && n >= 1 && n <= 4) return n;
  } catch {
    /* ignore */
  }
  return null;
}

export default function PipelineWorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const pipelineId = params.pipelineId as string;
  const { user, isPlatformAdmin } = useAuth();

  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [activeStage, setActiveStage] = useState(1);
  const [stageOutput, setStageOutput] = useState<StageOutput | null>(null);
  const [stageValidation, setStageValidation] = useState<StageValidation | null>(null);
  const [loading, setLoading] = useState(true);
  const [stageLoading, setStageLoading] = useState(false);
  const [validationLoading, setValidationLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(true);
  const [editedSinceLoad, setEditedSinceLoad] = useState(false);
  const [hadIssuesInCurrentOutput, setHadIssuesInCurrentOutput] = useState(false);
  const initialStageSet = useRef(false);

  useEffect(() => {
    if (user && !isPlatformAdmin) router.replace("/dashboard");
    if (!user) router.replace("/login");
  }, [user, isPlatformAdmin, router]);

  const loadPipeline = useCallback(async () => {
    try {
      const p = await api.get<Pipeline>(`/compliance-pipeline/${pipelineId}`);
      setPipeline(p);
      if (!initialStageSet.current) {
        const fromServer = p.current_stage > 0 ? p.current_stage : 1;
        const saved = readSavedActiveStage(pipelineId);
        const stage = saved ?? (fromServer >= 1 && fromServer <= 4 ? fromServer : 1);
        setActiveStage(stage);
        initialStageSet.current = true;
      }
    } catch {
      setError("Failed to load pipeline");
    } finally {
      setLoading(false);
    }
  }, [pipelineId]);

  useEffect(() => {
    if (isPlatformAdmin) loadPipeline();
  }, [isPlatformAdmin, loadPipeline]);

  /** Keep visible tab within allowed range when `max_nav_stage` updates (e.g. after confirm or failed finalize). */
  useEffect(() => {
    if (!pipeline) return;
    const max = Math.min(4, Math.max(1, pipeline.max_nav_stage ?? 1));
    setActiveStage((s) => (s > max ? max : s));
  }, [pipeline?.id, pipeline?.max_nav_stage]);

  const loadStageOutput = useCallback(async (stage: number) => {
    setStageLoading(true);
    setStageOutput(null);
    setStageValidation(null);
    try {
      const out = await api.get<StageOutput>(`/compliance-pipeline/${pipelineId}/stage/${stage}/output`);
      setStageOutput(out);
      setEditedSinceLoad(false);
      setHadIssuesInCurrentOutput(false);
    } catch {
      setStageOutput(null);
      setEditedSinceLoad(false);
      setHadIssuesInCurrentOutput(false);
    } finally {
      setStageLoading(false);
    }
  }, [pipelineId]);

  const loadStageValidation = useCallback(async (stage: number) => {
    if (stage < 1 || stage > 3) {
      setStageValidation(null);
      setValidationLoading(false);
      return;
    }
    setValidationLoading(true);
    try {
      const v = await api.get<StageValidation>(`/compliance-pipeline/${pipelineId}/stage/${stage}/validation`);
      setStageValidation(v);
    } catch {
      setStageValidation(null);
    } finally {
      setValidationLoading(false);
    }
  }, [pipelineId]);

  useEffect(() => {
    if (typeof window === "undefined" || !pipelineId) return;
    try {
      sessionStorage.setItem(`${ACTIVE_STAGE_STORAGE_KEY}:${pipelineId}`, String(activeStage));
    } catch {
      /* quota / private mode */
    }
  }, [pipelineId, activeStage]);

  useEffect(() => {
    if (!pipeline) return;

    if (shouldFetchPipelineStageOutput(pipeline, activeStage)) {
      loadStageOutput(activeStage);
    } else {
      setStageOutput(null);
      setStageLoading(false);
    }
  }, [activeStage, pipeline, loadStageOutput]);

  useEffect(() => {
    if (!stageOutput || activeStage < 1 || activeStage > 3) {
      setStageValidation(null);
      setHadIssuesInCurrentOutput(false);
      setValidationLoading(false);
      return;
    }
    loadStageValidation(activeStage);
  }, [stageOutput?.id, stageOutput?.updated_at, activeStage, loadStageValidation]);

  useEffect(() => {
    if (!stageValidation) return;
    if ((stageValidation.issues?.length ?? 0) > 0) {
      setHadIssuesInCurrentOutput(true);
    }
  }, [stageValidation?.stage, stageValidation?.issues?.length, stageOutput?.id]);

  useEffect(() => {
    if (!pipeline) return;
    if (!pipeline.status.endsWith("_running")) return;
    const t = setInterval(() => {
      loadPipeline();
    }, 8000);
    return () => clearInterval(t);
  }, [pipeline, loadPipeline]);

  const handleRunStage = async () => {
    setRunning(true);
    setError(null);
    try {
      // Stage runs can take several minutes (model generation + retry for strict JSON output).
      await api.postDirect(`/compliance-pipeline/${pipelineId}/run-stage/${activeStage}`, {}, 90_000);
      await loadPipeline();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Stage execution failed");
    } finally {
      setRunning(false);
    }
  };

  const handleConfirmStage = async () => {
    setConfirming(true);
    setError(null);
    try {
      await api.post(`/compliance-pipeline/${pipelineId}/stage/${activeStage}/confirm`, {});
      await loadPipeline();
      await loadStageOutput(activeStage);
      if (activeStage === 3) {
        setActiveStage(4);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Confirm failed");
    } finally {
      setConfirming(false);
    }
  };

  const handleFinalize = async () => {
    setFinalizing(true);
    setError(null);
    try {
      // Finalization can be heavy (DDL + bulk inserts), keep a generous timeout.
      await api.postDirect(`/compliance-pipeline/${pipelineId}/finalize`, {}, 900_000);
      await loadPipeline();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Finalization failed");
    } finally {
      setFinalizing(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!pipeline) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <p className="text-sm text-slate-500">Pipeline not found.</p>
      </div>
    );
  }

  const maxNavStage = Math.min(4, Math.max(1, pipeline.max_nav_stage ?? 1));

  const handleStageClick = (stage: number) => {
    if (stage >= 1 && stage <= 4 && stage <= maxNavStage) setActiveStage(stage);
  };

  const isFinalized = pipeline.status === "finalized";
  const isFinalizing = pipeline.status === "finalizing";
  const stageHasOutput = !!stageOutput;
  const stageIsConfirmed = stageOutput?.status === "confirmed";
  const isStageRunning = pipeline.status === `stage_${activeStage}_running`;
  const canRun = !running && !isStageRunning && !isFinalized && activeStage <= 3;
  const hasBlockingValidationIssues = (stageValidation?.blocking_issue_count ?? 0) > 0;
  const hasAnyValidationIssues = (stageValidation?.issues?.length ?? 0) > 0;
  const requiresEditBeforeConfirm = stageHasOutput && !stageIsConfirmed && hadIssuesInCurrentOutput;
  const canConfirm =
    stageHasOutput &&
    !stageIsConfirmed &&
    !running &&
    !confirming &&
    !validationLoading &&
    !hasBlockingValidationIssues &&
    !hasAnyValidationIssues &&
    (!requiresEditBeforeConfirm || editedSinceLoad);
  const confirmDisabledReason = confirming
    ? `Confirming Stage ${activeStage}...`
    : validationLoading
      ? "Validating latest output..."
      : hasBlockingValidationIssues
        ? "Fix blocking validation issues and save edits to confirm"
        : hasAnyValidationIssues
          ? "Fix validation issues in rows/JSON, save, then confirm"
          : requiresEditBeforeConfirm && !editedSinceLoad
            ? "This output had issues earlier. Save at least one edit before confirm."
            : null;
  const canFinalize =
    !isFinalized && !isFinalizing && !finalizing && maxNavStage >= 4;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      <AppHeader />

      <div className="border-b px-4 py-2" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="flex items-center gap-3 mb-2">
          <Link href="/admin/compliance-pipeline" className="text-xs text-blue-600 hover:underline">&larr; Back</Link>
          <h1 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{pipeline.name}</h1>
          <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: "var(--background)", color: "var(--foreground-muted)" }}>
            {pipeline.schema_name}
          </span>
        </div>
        <StageStepper
          currentStage={pipeline.current_stage}
          maxNavStage={maxNavStage}
          status={pipeline.status}
          onStageClick={handleStageClick}
        />
      </div>

      {error && (
        <div className="mx-4 mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 flex justify-between items-center">
          {error}
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-2">&times;</button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <div className={`flex-1 overflow-y-auto p-4 ${showChat ? "" : ""}`}>
          {activeStage <= 3 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                  Stage {activeStage} Output
                  {stageIsConfirmed && <span className="ml-2 text-emerald-600 text-xs font-normal">Confirmed</span>}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="px-2.5 py-1 rounded text-xs font-medium transition-colors hover:bg-slate-100"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    {showChat ? "Hide Chat" : "Show Chat"}
                  </button>

                  {!stageHasOutput && canRun && (
                    <button
                      onClick={handleRunStage}
                      disabled={running}
                      className="btn-primary px-3 py-1.5 text-xs rounded-lg disabled:opacity-50"
                    >
                      {running ? "Running AI..." : `Run Stage ${activeStage}`}
                    </button>
                  )}

                  {stageHasOutput && !stageIsConfirmed && canRun && (
                    <button
                      onClick={handleRunStage}
                      disabled={running}
                      className="px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors hover:bg-slate-50"
                      style={{ borderColor: "var(--border)", color: "var(--foreground-muted)" }}
                    >
                      {running ? "Re-running..." : "Re-run Stage"}
                    </button>
                  )}

                  {stageHasOutput && !stageIsConfirmed && (
                    <>
                      <button
                        onClick={handleConfirmStage}
                        disabled={!canConfirm}
                        className="bg-emerald-600 text-white px-3 py-1.5 text-xs rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {confirming
                          ? `Confirming Stage ${activeStage}...`
                          : validationLoading
                            ? "Validating..."
                            : `Confirm Stage ${activeStage}`}
                      </button>
                      {confirmDisabledReason && (
                        <span className={`text-[11px] font-medium ${confirming || validationLoading ? "text-slate-600" : "text-red-600"}`}>
                          {confirmDisabledReason}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {(running || isStageRunning) && !stageHasOutput && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                  <p className="text-sm font-medium" style={{ color: "var(--foreground-muted)" }}>
                    AI is processing Stage {activeStage}... You can stay on this page; output will appear automatically.
                  </p>
                </div>
              )}

              {stageLoading && !running && !isStageRunning && (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
                </div>
              )}

              {stageHasOutput && !stageLoading && (
                <>
                  {stageValidation && stageValidation.issues.length > 0 && (
                    <div className={`mb-3 rounded-lg border px-3 py-2 ${stageValidation.blocking_issue_count > 0 ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
                      <p className={`text-xs font-semibold ${stageValidation.blocking_issue_count > 0 ? "text-red-700" : "text-amber-700"}`}>
                        Validation found {stageValidation.issues.length} issue(s): {stageValidation.blocking_issue_count} blocking, {stageValidation.warning_count} warning.
                      </p>
                      <p className={`text-xs mt-1 ${stageValidation.blocking_issue_count > 0 ? "text-red-700" : "text-amber-700"}`}>
                        If you proceed without fixing blocking issues, confirm/finalize can fail or create inconsistent mappings.
                      </p>
                      <div className="mt-2 max-h-52 overflow-auto space-y-2">
                        {stageValidation.issues.map((issue, idx) => (
                          <div key={`${issue.path}-${idx}`} className="rounded border border-slate-200 bg-white px-2 py-1.5">
                            <p className="text-[11px] font-semibold text-slate-700">
                              {issue.blocking ? "Blocking" : "Warning"} - <code>{issue.path}</code>
                            </p>
                            <p className="text-[11px] text-slate-700">Mistake: {issue.problem}</p>
                            <p className="text-[11px] text-slate-700">Impact: {issue.impact}</p>
                            <p className="text-[11px] text-slate-700">Fix: {issue.fix}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <PipelineStageViewer
                    pipelineId={pipelineId}
                    stage={activeStage}
                    data={stageOutput.output_data}
                    status={stageOutput.status}
                    issues={stageValidation?.issues || []}
                    onDataChange={(d) => {
                      setStageOutput((prev) => prev ? { ...prev, output_data: d } : prev);
                      setEditedSinceLoad(true);
                      loadStageValidation(activeStage);
                    }}
                  />
                </>
              )}

              {!stageHasOutput && !running && !isStageRunning && !stageLoading && (
                <div className="card rounded-xl p-8 text-center">
                  <p className="text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>No output yet</p>
                  <p className="text-xs mb-4" style={{ color: "var(--foreground-muted)" }}>
                    {activeStage === 1
                      ? "Click \"Run Stage 1\" to extract the Canonical Evidence Model from the uploaded PDF."
                      : pipeline.status === "failed"
                        ? "Could not load this stage’s output (or none exists yet). Try refreshing, or select the stage in the stepper again."
                        : `Confirm Stage ${activeStage - 1} first, then run Stage ${activeStage}.`
                    }
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="card rounded-xl p-8 text-center">
              {isFinalized ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold mb-1" style={{ color: "var(--foreground)" }}>Pipeline Finalized</h3>
                  <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                    Schema <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">{pipeline.schema_name}</code> has been created with all tables and seed data.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-sm font-bold mb-1" style={{ color: "var(--foreground)" }}>Finalize Pipeline</h3>
                  <p className="text-xs mb-4" style={{ color: "var(--foreground-muted)" }}>
                    All 3 stages must be confirmed. This will create the full database schema and populate seed data.
                  </p>
                  <button
                    onClick={handleFinalize}
                    disabled={!canFinalize}
                    className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
                  >
                    {finalizing ? "Finalizing..." : "Finalize & Create Schema"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {showChat && activeStage <= 3 && stageHasOutput && (
          <div className="w-80 shrink-0">
            <StageChatPanel
              pipelineId={pipelineId}
              stage={activeStage}
              onOutputUpdated={() => loadStageOutput(activeStage)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
