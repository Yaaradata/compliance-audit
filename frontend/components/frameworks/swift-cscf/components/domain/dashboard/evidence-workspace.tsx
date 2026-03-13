"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { AiEvaluationResult } from "@/components/domain/ai-evaluation-result";
import { EvidenceQuestionsForm } from "@/components/domain/evidence-questions-form";
import { getArchitecture, getArchitectureDiagramUrl } from "@/lib/frameworks/swift-cscf";
import { A5_EVIDENCE_ITEM_ID, A5_ARCHITECTURE_KEYS } from "@/lib/frameworks/swift-cscf/constants";
import type { EvidenceItem, DomainConfig } from "@/lib/types";
import type { AiEvaluationResult as AiEvalResultType } from "@/lib/types";
import type { EvaluationEditsMap } from "../../../../../domain/ai-evaluation-result";

function A5ArchitecturePreview({ formData }: { formData: Record<string, string> }) {
  const archType = formData[A5_ARCHITECTURE_KEYS.architecture_type];
  const diagramFile = formData[A5_ARCHITECTURE_KEYS.selected_diagram];
  const arch = archType ? getArchitecture(archType) : null;
  if (!archType && !diagramFile) return null;
  return (
    <div className="rounded-lg border border-(--border) bg-background p-3">
      <div className="text-[11px] font-semibold text-foreground mb-2">Architecture Evidence (from cycle selection)</div>
      <div className="flex items-start gap-3">
        {archType && (
          <div className="shrink-0">
            <div className="text-[10px] text-(--foreground-muted)">Declared type</div>
            <div className="text-sm font-bold text-foreground">{arch?.name ?? archType}</div>
          </div>
        )}
        {diagramFile && (
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-(--foreground-muted) mb-1">Selected diagram</div>
            <div className="rounded border border-(--border) overflow-hidden bg-(--surface) max-w-[280px]">
              <img src={getArchitectureDiagramUrl(diagramFile)} alt="Architecture diagram" className="w-full h-auto max-h-40 object-contain" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
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
}) {
  const [notesRefresh, setNotesRefresh] = useState(0);
  const effectiveNotesRefresh = (notesRefreshTrigger ?? 0) + notesRefresh;

  const [focusedQuestionGuide, setFocusedQuestionGuide] = useState<string | null>(null);
  const [focusedQuestionLabel, setFocusedQuestionLabel] = useState<string | null>(null);
  const [guideAtBottom, setGuideAtBottom] = useState(false);
  const [guideSpacerHeight, setGuideSpacerHeight] = useState(0);
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
      }
    } else {
      prevItemIdRef.current = null;
    }
  }, [currentItem?.id]);

  if (!currentItem) {
    return (
      <div className="h-full flex items-center justify-center rounded-xl border border-(--border) bg-(--surface) text-(--foreground-muted) text-sm">
        Select an evidence item from the list
      </div>
    );
  }

  const renderCommonEvidence = () => {
    if (cycleId) {
      return (
        <>
          {currentItem.id === A5_EVIDENCE_ITEM_ID && itemFormData[A5_ARCHITECTURE_KEYS.architecture_type] && (
            <div className="mb-4">
              <A5ArchitecturePreview formData={itemFormData} />
            </div>
          )}
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
          />
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
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-slate-800 dark:text-foreground">Evidence</h2>
                  </div>
                  {hasResult && <div className="w-[88px] shrink-0 lg:block hidden" aria-hidden />}
                </div>
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
                    <AiEvaluationResult
                      result={aiEvaluationResult}
                      loading={aiEvaluationLoading}
                      placeholder={false}
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

                      {aiEvaluationError && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4 shadow-sm">
                          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Evaluation failed</p>
                          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 font-mono">{aiEvaluationError}</p>
                          <button
                            type="button"
                            onClick={onEvaluateEvidence}
                            className="mt-2 py-1.5 px-3 text-xs font-semibold rounded-lg bg-amber-200 text-amber-900 hover:bg-amber-300 dark:bg-amber-800 dark:text-amber-100 dark:hover:bg-amber-700 transition-colors"
                          >
                            Try again
                          </button>
                        </div>
                      )}
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
