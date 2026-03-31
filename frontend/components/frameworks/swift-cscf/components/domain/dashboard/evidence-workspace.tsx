"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AiEvaluationResult } from "@/components/domain/ai-evaluation-result";
import { EvidenceQuestionsForm } from "@/components/domain/evidence-questions-form";
import { ArtifactReusePanel } from "@/components/domain/artifact-reuse-panel";
import { api, demoAutofill } from "@/lib/api";
import { getAwsCredentialsForCycle } from "@/lib/aws-api";
import type { EvidenceItem, DomainConfig } from "@/lib/types";
import type { AiEvaluationResult as AiEvalResultType } from "@/lib/types";
import type { EvaluationEditsMap } from "../../../../../domain/ai-evaluation-result";
import { evaluationRequiredFieldsHintClassName } from "@/lib/evidence-evaluation-validation";

/** Submission is locked for IT SME editing after submit/approve. */
function isSubmissionAwsLocked(status: string | undefined): boolean {
  const s = (status ?? "").toLowerCase();
  return s === "submitted" || s === "approved" || s === "in_review";
}

/** User already has saved AWS/LLM snapshot in form_data — do not auto-call suggest again. */
function itemHasPersistedAwsSnapshot(fd: Record<string, string>): boolean {
  for (const [k, v] of Object.entries(fd)) {
    if (!(v ?? "").trim()) continue;
    if (k.endsWith("__ai_origin")) return true;
    if (k.endsWith("__ai") && !k.endsWith("__ai_origin")) return true;
  }
  return false;
}

/** Aligns with backend `_aws_suggestion_value_is_usable`: `[]` spreadsheet is not a real fill (gaps explain why). */
function awsSuggestionCountsAsFilled(raw: string | undefined): boolean {
  const v = (raw ?? "").trim();
  if (!v) return false;
  if (v === "[]" || v === "{}") return false;
  try {
    const rows = JSON.parse(v) as unknown;
    if (!Array.isArray(rows)) return true;
    if (rows.length === 0) return false;
    return rows.some(
      (row) =>
        row &&
        typeof row === "object" &&
        Object.values(row as Record<string, unknown>).some((c) => String(c ?? "").trim() !== ""),
    );
  } catch {
    return true;
  }
}

export function EvidenceWorkspace({
  cycleId,
  domainId,
  config,
  currentItem,
  currentSubmissionId,
  evaluated,
  aiEvaluationLoading,
  aiEvaluationResult,
  completionPctByItem,
  getItemCompletion,
  onEnsureSubmission,
  onUploadComplete,
  onEvaluateEvidence,
  onSubmitForReview,
  submitForReviewLoading,
  submissionStatus,
  aiEvaluationError,
  evaluationState,
  itemFormData,
  onItemFormChange,
  onItemFormBlur,
  onEvaluationEdit,
  evaluationEdits,
  notesRefreshTrigger = 0,
  onNoteAdded,
  cscfVersion,
}: {
  cycleId: string | null;
  domainId: string;
  config: DomainConfig;
  currentItem: EvidenceItem | null;
  currentSubmissionId: string | null;
  evaluated: boolean;
  aiEvaluationLoading: boolean;
  aiEvaluationResult: AiEvalResultType | null;
  completionPctByItem: Record<string, number>;
  getItemCompletion: (itemId: string) => number;
  onEnsureSubmission: (itemId: string) => Promise<string | null>;
  onUploadComplete: () => void;
  onEvaluateEvidence: () => void;
  onSubmitForReview?: () => void;
  submitForReviewLoading?: boolean;
  submissionStatus?: string;
  aiEvaluationError?: string | null;
  evaluationState: "idle" | "loading" | "done";
  itemFormData: Record<string, string>;
  onItemFormChange: (key: string, value: string) => void;
  onItemFormBlur: () => void;
  onEvaluationEdit?: (updated: AiEvalResultType, edits: EvaluationEditsMap) => void;
  evaluationEdits?: EvaluationEditsMap;
  notesRefreshTrigger?: number;
  onNoteAdded?: () => void;
  cscfVersion?: string;
}) {
  const router = useRouter();
  const [notesRefresh, setNotesRefresh] = useState(0);
  const [reuseApplied, setReuseApplied] = useState(false);
  const effectiveNotesRefresh = (notesRefreshTrigger ?? 0) + notesRefresh;

  const [focusedQuestionGuide, setFocusedQuestionGuide] = useState<string | null>(null);
  const [focusedQuestionLabel, setFocusedQuestionLabel] = useState<string | null>(null);
  const [guideAtBottom, setGuideAtBottom] = useState(false);
  const [guideSpacerHeight, setGuideSpacerHeight] = useState(0);
  const [awsSuggestLoading, setAwsSuggestLoading] = useState(false);
  const [awsSuggestMessage, setAwsSuggestMessage] = useState<string | null>(null);
  const [awsSuggestError, setAwsSuggestError] = useState<string | null>(null);
  const [awsSuggestRoundDone, setAwsSuggestRoundDone] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string>>({});
  const [awsSuggestionGaps, setAwsSuggestionGaps] = useState<Record<string, string>>({});
  const [questionSources, setQuestionSources] = useState<Record<string, string>>({});
  const [awsConnectionChecked, setAwsConnectionChecked] = useState(false);
  const [awsConnected, setAwsConnected] = useState(false);
  const autoFilledItemsRef = useRef<Set<string>>(new Set());
  const evidenceScrollRef = useRef<HTMLDivElement>(null);
  const guidanceContentRef = useRef<HTMLDivElement>(null);
  const focusedQuestionElementRef = useRef<HTMLElement | null>(null);

  const getAlignmentElement = useCallback((el: HTMLElement): HTMLElement => {
    const label = el.querySelector("label");
    return (label as HTMLElement) ?? el;
  }, []);

  const updateGuideAlignment = useCallback(() => {
    const el = focusedQuestionElementRef.current;
    const evidenceEl = evidenceScrollRef.current;
    const guidanceEl = guidanceContentRef.current;
    if (!el || !evidenceEl || !guidanceEl || guideAtBottom) return;
    const alignEl = getAlignmentElement(el);
    const questionRect = alignEl.getBoundingClientRect();
    const evidenceRect = evidenceEl.getBoundingClientRect();
    const rawOffset = questionRect.top - evidenceRect.top;
    const guidanceHeight = guidanceEl.clientHeight;
    const guideHeightEstimate = 140;
    const maxSpacer = Math.max(0, guidanceHeight - guideHeightEstimate);
    const capped = Math.max(0, Math.min(Math.round(rawOffset), maxSpacer));
    setGuideSpacerHeight((prev) => (prev !== capped ? capped : prev));
  }, [getAlignmentElement, guideAtBottom]);

  const handleQuestionFocus = useCallback(
    (_key: string, guide: string | null, label: string, element?: HTMLElement, isLastQuestion?: boolean) => {
      setFocusedQuestionGuide(guide);
      setFocusedQuestionLabel(label);
      setGuideAtBottom(isLastQuestion ?? false);
      focusedQuestionElementRef.current = element ?? null;
      if (isLastQuestion) {
        setGuideSpacerHeight(0);
      } else if (element && evidenceScrollRef.current && guidanceContentRef.current) {
        const alignEl = getAlignmentElement(element);
        const questionRect = alignEl.getBoundingClientRect();
        const evidenceRect = evidenceScrollRef.current.getBoundingClientRect();
        const rawOffset = questionRect.top - evidenceRect.top;
        const guidanceHeight = guidanceContentRef.current.clientHeight;
        const guideHeightEstimate = 140;
        const maxSpacer = Math.max(0, guidanceHeight - guideHeightEstimate);
        const capped = Math.max(0, Math.min(Math.round(rawOffset), maxSpacer));
        setGuideSpacerHeight(capped);
      } else {
        setGuideSpacerHeight(0);
      }
    },
    [getAlignmentElement]
  );

  useEffect(() => {
    const evidenceEl = evidenceScrollRef.current;
    if (!evidenceEl) return;
    const onScroll = () => {
      if (focusedQuestionElementRef.current && !guideAtBottom) updateGuideAlignment();
    };
    evidenceEl.addEventListener("scroll", onScroll, { passive: true });
    return () => evidenceEl.removeEventListener("scroll", onScroll);
  }, [updateGuideAlignment, guideAtBottom]);

  useEffect(() => {
    if (!guidanceContentRef.current) return;
    const ro = new ResizeObserver(() => {
      if (focusedQuestionElementRef.current && !guideAtBottom) updateGuideAlignment();
    });
    ro.observe(guidanceContentRef.current);
    return () => ro.disconnect();
  }, [updateGuideAlignment, guideAtBottom]);

  const [demoAutofillLoading, setDemoAutofillLoading] = useState(false);
  const [demoAutofillDone, setDemoAutofillDone] = useState(false);
  const [demoAutofillError, setDemoAutofillError] = useState<string | null>(null);
  const [fileRefreshTrigger, setFileRefreshTrigger] = useState(0);

  const prevItemIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (currentItem) {
      if (prevItemIdRef.current !== currentItem.id) {
        prevItemIdRef.current = currentItem.id;
        setFocusedQuestionGuide(null);
        setFocusedQuestionLabel(null);
        setGuideAtBottom(false);
        setGuideSpacerHeight(0);
        focusedQuestionElementRef.current = null;
        setAwsSuggestMessage(null);
        setAwsSuggestError(null);
        setAiSuggestions({});
        setAwsSuggestionGaps({});
        setAwsSuggestRoundDone(false);
        setQuestionSources({});
        setDemoAutofillDone(false);
        setDemoAutofillError(null);
        setFileRefreshTrigger(0);
      }
    } else {
      prevItemIdRef.current = null;
    }
  }, [currentItem?.id]);

  const evidenceFormLocked = isSubmissionAwsLocked(submissionStatus);

  const handleDemoAutofill = useCallback(async () => {
    if (!cycleId || !currentItem) return;
    setDemoAutofillLoading(true);
    setDemoAutofillError(null);
    try {
      const result = await demoAutofill(cycleId, currentItem.id);
      const subId =
        (await onEnsureSubmission(currentItem.id)) ?? result.submission_id ?? null;
      if (subId && cycleId) {
        try {
          const sub = await api.get<{ form_data: Record<string, string> }>(
            `/assessments/${cycleId}/evidence/${subId}`
          );
          if (sub?.form_data) {
            Object.entries(sub.form_data).forEach(([k, v]) => {
              onItemFormChange(k, String(v ?? ""));
            });
          }
        } catch {
          /* best-effort */
        }
      }
      setFileRefreshTrigger((n) => n + 1);
      onUploadComplete();
      setDemoAutofillDone(true);
    } catch (e: unknown) {
      setDemoAutofillError(e instanceof Error ? e.message : "Auto-fill failed");
    } finally {
      setDemoAutofillLoading(false);
    }
  }, [cycleId, currentItem, onEnsureSubmission, onItemFormChange, onUploadComplete]);

  useEffect(() => {
    if (!cycleId) {
      setAwsConnected(false);
      setAwsConnectionChecked(true);
      return;
    }
    setAwsConnectionChecked(false);
    getAwsCredentialsForCycle(cycleId)
      .then((cfg) => setAwsConnected(Boolean(cfg?.has_config)))
      .catch(() => setAwsConnected(false))
      .finally(() => setAwsConnectionChecked(true));
  }, [cycleId]);

  const handleSuggestFromAws = useCallback(async (itemId?: string) => {
    const targetItem = itemId ?? currentItem?.id;
    if (!cycleId || !targetItem) return;
    if (isSubmissionAwsLocked(submissionStatus)) return;
    if (!awsConnected) {
      setAwsSuggestError(null);
      setAwsSuggestMessage("AWS is not connected for this cycle. Connect to AWS first.");
      setAwsSuggestRoundDone(false);
      return;
    }
    setAwsSuggestLoading(true);
    setAwsSuggestError(null);
    setAwsSuggestMessage(null);
    setAiSuggestions({});
    setAwsSuggestionGaps({});
    try {
      const res = await api.postViaProxy<{
        suggestions: Record<string, string>;
        suggestion_gaps?: Record<string, string>;
        question_keys_attempted: string[];
        question_sources: Record<string, string>;
        aws_evidence_bundle_count: number;
        aws_evidence_row_count: number;
        message?: string | null;
      }>(`/assessments/${cycleId}/evidence-items/${targetItem}/suggest-from-aws`, {}, 180_000);
      const sugg = res.suggestions ?? {};
      const sources = res.question_sources ?? {};
      const gaps = res.suggestion_gaps ?? {};
      setQuestionSources(sources);
      setAiSuggestions(sugg);
      setAwsSuggestionGaps(gaps);
      autoFilledItemsRef.current.add(targetItem);

      Object.keys(sugg).forEach((k) => {
        const val = sugg[k] ?? "";
        onItemFormChange(`${k}__ai_origin`, val);
        const src = (sources[k] ?? "").trim().toLowerCase();
        const isAwsPlusHuman = src.startsWith("aws") && src.includes("human");
        if (isAwsPlusHuman) {
          onItemFormChange(`${k}__ai`, val);
        } else {
          onItemFormChange(k, val);
          onItemFormChange(`${k}__ai`, val);
        }
      });
      const attempted = Array.from(new Set([
        ...(res.question_keys_attempted ?? []),
        ...Object.keys(sugg),
        ...Object.keys(gaps),
      ]));
      attempted.forEach((k) => {
        onItemFormChange(`${k}__ai_gap`, (gaps[k] ?? "").trim());
      });
      const filledCount = Object.keys(sugg).filter((k) => awsSuggestionCountsAsFilled(sugg[k])).length;
      if (filledCount > 0) {
        await onEnsureSubmission(targetItem);
        onItemFormBlur();
      }
      if (res.message) setAwsSuggestMessage(res.message);
      else if (filledCount > 0) {
        setAwsSuggestMessage(`Filled ${filledCount} field(s) from AWS evidence (${res.aws_evidence_bundle_count} snapshot(s)).`);
      } else {
        setAwsSuggestMessage("No usable values returned — see (i) hints per field or check AWS collection / evidence_source.");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Request failed";
      setAwsSuggestError(msg);
    } finally {
      setAwsSuggestLoading(false);
      setAwsSuggestRoundDone(true);
    }
  }, [cycleId, currentItem?.id, submissionStatus, onItemFormChange, onEnsureSubmission, onItemFormBlur, awsConnected]);

  useEffect(() => {
    if (!cycleId || !currentItem) return;

    if (!awsConnected) {
      setAwsSuggestLoading(false);
      setAwsSuggestRoundDone(false);
      return;
    }

    if (evidenceFormLocked) {
      autoFilledItemsRef.current.add(currentItem.id);
      return;
    }

    if (itemHasPersistedAwsSnapshot(itemFormData)) {
      autoFilledItemsRef.current.add(currentItem.id);
      setAwsSuggestRoundDone(true);
      return;
    }

    if (autoFilledItemsRef.current.has(currentItem.id)) return;

    handleSuggestFromAws(currentItem.id);
  }, [cycleId, currentItem?.id, submissionStatus, itemFormData, evidenceFormLocked, handleSuggestFromAws, awsConnected]);

  if (!currentItem) {
    return (
      <div className="h-full flex items-center justify-center rounded-xl border border-(--border) bg-(--surface) text-(--foreground-muted) text-sm">
        Select an evidence item from the list
      </div>
    );
  }

  const frameworkSchema = cscfVersion
    ? `swift_${cscfVersion.replace(/^v/, "")}`
    : null;

  const renderCommonEvidence = () => {
    if (cycleId) {
      return (
        <>
          {cycleId && currentItem && frameworkSchema && cscfVersion && !evidenceFormLocked && (
            <ArtifactReusePanel
              cycleId={cycleId}
              evidenceItemId={currentItem.id}
              frameworkSchema={frameworkSchema}
              cscfVersion={cscfVersion}
              onApplyReuse={(fd) => {
                Object.entries(fd).forEach(([k, v]) => onItemFormChange(k, v));
                onItemFormBlur();
                setReuseApplied(true);
              }}
              onClearReuse={() => {
                Object.keys(itemFormData).forEach((k) => onItemFormChange(k, ""));
                onItemFormBlur();
                setReuseApplied(false);
              }}
              disabled={evidenceFormLocked}
            />
          )}
          <div className="mb-3 flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between rounded-lg border border-(--border) bg-(--surface) px-3 py-2.5">
            <div className="text-[11px] text-(--foreground-muted) min-w-0">
              {!awsConnectionChecked ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block size-3.5 border-2 border-slate-300 border-t-sky-600 rounded-full animate-spin" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Checking AWS connection…</span>
                </span>
              ) : !awsConnected ? (
                <>
                  <span className="font-semibold text-foreground">AWS-assisted answers</span>
                  {" — "}
                  Connect to AWS for this cycle to enable auto-fill suggestions.
                </>
              ) : awsSuggestLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block size-3.5 border-2 border-sky-300 border-t-sky-600 rounded-full animate-spin" />
                  <span className="font-semibold text-sky-700 dark:text-sky-300">Auto-filling from AWS evidence…</span>
                </span>
              ) : (
                <>
                  <span className="font-semibold text-foreground">AWS-assisted answers</span>
                  {" — "}
                  Auto-fills questions where evidence_source is AWS or AWS + Human.
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                if (!awsConnected) {
                  router.push("/aws");
                  return;
                }
                autoFilledItemsRef.current.delete(currentItem.id);
                handleSuggestFromAws(currentItem.id);
              }}
              disabled={awsSuggestLoading || evidenceFormLocked || !awsConnectionChecked}
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-lg border border-(--border) bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-(--muted)/40 disabled:opacity-50"
            >
              {!awsConnected ? "Connect to AWS" : awsSuggestLoading ? "Generating…" : "Re-generate AWS suggestions"}
            </button>
            {awsSuggestError && (
              <p className="text-[11px] text-red-600 w-full">{awsSuggestError}</p>
            )}
            {awsSuggestMessage && !awsSuggestError && (
              <p className="text-[11px] text-(--foreground-muted) w-full">{awsSuggestMessage}</p>
            )}
          </div>

          <EvidenceQuestionsForm
            evidenceItemId={currentItem.id}
            cycleId={cycleId}
            formData={itemFormData}
            onChange={onItemFormChange}
            onBlur={onItemFormBlur}
            submissionId={currentSubmissionId}
            onUploadComplete={onUploadComplete}
            onEnsureSubmission={onEnsureSubmission}
            fieldFeedback={aiEvaluationResult?.field_feedback ?? {}}
            onQuestionFocus={handleQuestionFocus}
            aiSuggestLoading={awsSuggestLoading}
            aiSuggestions={aiSuggestions}
            questionSources={questionSources}
            disabled={evidenceFormLocked}
            awsSuggestionGaps={awsSuggestionGaps}
            awsSuggestRoundDone={awsSuggestRoundDone}
            visualVariant="swiftReview"
            fileRefreshTrigger={fileRefreshTrigger}
            awsAssistanceEnabled={awsConnectionChecked && awsConnected}
          />

          {aiEvaluationError && !aiEvaluationResult && (
            <p className={`${evaluationRequiredFieldsHintClassName} mb-2`} role="alert">
              {aiEvaluationError}
            </p>
          )}

          {!aiEvaluationResult && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl border border-(--border) bg-gradient-to-br from-background to-background/80 shadow-md hover:shadow-lg transition-shadow duration-200">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground">Run AI Evaluation</p>
                <p className="text-sm text-(--foreground-muted) mt-1.5 leading-relaxed">
                  {!currentSubmissionId
                    ? "Add or save evidence first (upload a file or fill the form and save)."
                    : currentItem.id === "A1" && !itemFormData.diagram_date
                      ? "Enter diagram date and upload your diagram for best results."
                      : "Your diagram and answers will be evaluated against the framework controls."}
                </p>
              </div>
              <button
                type="button"
                onClick={onEvaluateEvidence}
                disabled={aiEvaluationLoading}
                className="shrink-0 inline-flex items-center justify-center gap-2 py-2.5 px-6 text-sm font-semibold rounded-xl text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--primary) disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-95 active:scale-[0.98] shadow-md"
                style={{ background: config.color }}
              >
                + Run AI Evaluation
              </button>
            </div>
          )}
        </>
      );
    }
    return (
      <p className="text-sm text-(--foreground-muted)">Cycle context required to load evidence questions.</p>
    );
  };

  return (
    <div className="h-full flex flex-col min-h-0 bg-(--surface) border border-(--border) rounded-xl overflow-hidden shadow-sm">
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {(() => {
            const hasResult = !!aiEvaluationResult || aiEvaluationLoading;
            return (
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row min-w-0 max-w-full overflow-x-hidden transition-all duration-300 gap-0">
            {/* Left: Evidence — card-style container (75% when Guidance, 45% when Evaluation result) */}
            <div
              className={`flex flex-col min-w-0 min-h-0 overflow-hidden md:min-h-[50vh] transition-[flex] duration-300 ease-out rounded-l-xl border border-(--border) lg:border-r-0 bg-white dark:bg-(--surface) shadow-sm ${
                hasResult ? "md:flex-[0_0_45%]" : "md:flex-[0_0_75%]"
              }`}
            >
              <div className="shrink-0 px-4 py-2.5 border-b border-slate-200 dark:border-(--border) bg-slate-50/80 dark:bg-background/50 min-h-[48px] flex flex-col justify-center">
                <div className="flex items-center justify-between gap-3 min-h-[36px]">
                  <h2 className="text-sm font-bold text-slate-800 dark:text-foreground shrink-0">Evidence</h2>
                  <div className="flex items-center justify-end gap-2 min-w-0 flex-1">
                    {!evidenceFormLocked &&
                      cycleId &&
                      (getItemCompletion(currentItem.id) === 0 || demoAutofillLoading || demoAutofillDone) && (
                        <button
                          type="button"
                          disabled={demoAutofillLoading}
                          onClick={handleDemoAutofill}
                          aria-label={
                            demoAutofillLoading
                              ? "Auto-filling demo data"
                              : demoAutofillDone
                                ? "Re-fill from demo data"
                                : "Auto-fill for demo"
                          }
                          aria-busy={demoAutofillLoading}
                          className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1.5 text-[11px] font-semibold text-amber-900 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800/60 disabled:opacity-50"
                        >
                          {demoAutofillLoading && (
                            <span className="inline-block size-3 border-2 border-amber-400 border-t-amber-700 dark:border-amber-600 dark:border-t-amber-300 rounded-full animate-spin" />
                          )}
                          {demoAutofillLoading ? "Auto-filling…" : demoAutofillDone ? "Re-fill" : "Auto-fill for demo"}
                        </button>
                      )}
                    {hasResult && <div className="w-[88px] shrink-0 lg:block hidden" aria-hidden />}
                  </div>
                </div>
                {demoAutofillError && (
                  <p className="text-[11px] text-red-600 mt-1.5 text-right">{demoAutofillError}</p>
                )}
              </div>
              <div ref={evidenceScrollRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 md:p-5 space-y-4 bg-slate-50/30 dark:bg-transparent">
                {renderCommonEvidence()}
              </div>
            </div>

            {/* Right: Guidance (25%) when no result, Evaluation result (55%) when has result or loading — card-style */}
            <div
              className={`w-full min-w-0 flex flex-col bg-white dark:bg-(--surface) overflow-hidden border border-(--border) lg:border-l shadow-sm transition-[flex] duration-300 ease-out min-h-[35vh] rounded-r-xl ${
                hasResult ? "lg:flex-[0_0_55%] lg:min-h-[60vh]" : "lg:flex-[0_0_25%]"
              }`}
            >
              <div className="shrink-0 px-4 py-2.5 border-b border-slate-200 dark:border-(--border) bg-slate-50/80 dark:bg-background/50 min-h-[48px] flex flex-col justify-center">
                <div className="flex items-center justify-between gap-3 min-h-[36px]">
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-slate-800 dark:text-foreground">
                      {hasResult ? "AI evaluation results" : "Guidance"}
                    </h2>
                  </div>
                  {hasResult && aiEvaluationLoading && !aiEvaluationResult && (
                    <div className="shrink-0 flex items-center gap-2">
                      <span className="inline-block size-5 border-2 border-slate-300 border-t-sky-600 dark:border-slate-600 dark:border-t-sky-400 rounded-full animate-spin" />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Evaluating…</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden p-4 md:p-5 flex flex-col gap-4 bg-slate-50/30 dark:bg-transparent">
                {/* When has result or loading: show Evaluation result view. Otherwise: Guidance. */}
                {hasResult ? (
                  <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden overflow-y-auto">
                    {aiEvaluationError && (
                      <p className={`${evaluationRequiredFieldsHintClassName} mb-3 shrink-0`} role="alert">
                        {aiEvaluationError}
                      </p>
                    )}
                    <AiEvaluationResult
                      result={aiEvaluationResult}
                      loading={aiEvaluationLoading}
                      placeholder={false}
                      showTitle={false}
                      editable={submissionStatus !== "submitted" && submissionStatus !== "approved"}
                      onEdit={onEvaluationEdit}
                      evaluationEdits={evaluationEdits}
                      submissionId={currentSubmissionId}
                      notesRefreshTrigger={effectiveNotesRefresh}
                      onNoteAdded={() => {
                        setNotesRefresh((r) => r + 1);
                        onNoteAdded?.();
                      }}
                      onReEvaluate={onEvaluateEvidence}
                      onSubmitForReview={onSubmitForReview}
                      evaluationState={evaluationState}
                      submissionStatus={submissionStatus}
                      submitForReviewLoading={submitForReviewLoading}
                      aiEvaluationLoading={aiEvaluationLoading}
                      configColor={config.color}
                      currentItemId={currentItem.id}
                      visualVariant="swiftReview"
                      hideAiHint={false}
                    />
                  </div>
                ) : (
                  <div ref={guidanceContentRef} className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
                    {guideAtBottom ? (
                      <div className="flex-1 min-h-0" aria-hidden />
                    ) : (
                      guideSpacerHeight > 0 && <div className="shrink-0" style={{ minHeight: guideSpacerHeight }} aria-hidden />
                    )}
                    <div className={guideAtBottom ? "mt-auto flex flex-col gap-3 shrink-0" : "flex flex-col gap-3 shrink-0"}>
                      <div
                        className="relative overflow-hidden rounded-2xl p-5 min-w-0 shadow-lg border border-white/10"
                        style={{
                          background: "linear-gradient(145deg, #1e3a5f 0%, #152a45 40%, #0f1f35 100%)",
                          boxShadow: "0 4px 24px -4px rgba(30, 58, 95, 0.4), 0 0 0 1px rgba(255,255,255,0.05)",
                        }}
                      >
                        <div
                          className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-15"
                          style={{
                            background: "radial-gradient(circle, #60a5fa 0%, transparent 70%)",
                            transform: "translate(32%, -32%)",
                          }}
                          aria-hidden
                        />
                        <div className="relative">
                          <div className="flex items-center gap-2 mb-3">
                            <span
                              className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider text-white"
                              style={{ background: "rgba(96, 165, 250, 0.4)", backdropFilter: "blur(2px)" }}
                            >
                              Guide
                            </span>
                          </div>
                          <p className="text-sm text-white/95 leading-relaxed wrap-break-word min-w-0">
                            {focusedQuestionGuide && focusedQuestionGuide.trim()
                              ? focusedQuestionGuide.trim()
                              : "Fill in evidence and upload files, then click + Run AI Evaluation in the Evidence section. Results will appear here."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
            );
          })()}
      </div>
    </div>
  );
}
