"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ControlBadge } from "@/components/ui/control-badge";
import { PriorityBadge } from "@/components/ui/badge";
import { PerControlEvidence } from "@/components/domain/per-control-evidence";
import { SufficiencyPanel } from "@/components/domain/sufficiency-panel";
import { AiEvaluationResult } from "@/components/domain/ai-evaluation-result";
import { NoteList } from "@/components/notes/note-list";
import { NoteInput } from "@/components/notes/note-input";
import { EvidenceQuestionsForm } from "@/components/domain/evidence-questions-form";
import { cn } from "@/lib/utils";
import { getArchitecture, getArchitectureDiagramUrl } from "@/lib/frameworks/swift-cscf";
import { A5_EVIDENCE_ITEM_ID, A5_ARCHITECTURE_KEYS } from "@/lib/frameworks/swift-cscf/constants";
import type { EvidenceItem, DomainConfig, AiCriterionResult } from "@/lib/types";
import type { AiEvaluationResult as AiEvalResultType } from "@/lib/types";
import type { EvaluationEditsMap } from "../../../../../domain/ai-evaluation-result";

const ALL_32_CONTROL_ID = "All";

function getControlStatusColor(
  controlId: string,
  sufficiencyResults: AiCriterionResult[] | null | undefined,
  criteriaResults: AiCriterionResult[] | null | undefined,
): "white" | "green" | "orange" | "red" {
  const prefix = `${controlId}_`;
  const relevant = [
    ...(sufficiencyResults ?? []).filter((r) => r.id.startsWith(prefix) || r.id === controlId),
    ...(criteriaResults ?? []).filter((r) => r.id.startsWith(prefix) || r.id === controlId),
  ];
  if (relevant.length === 0) return "white";
  const met = relevant.filter((r) => r.met).length;
  const ratio = met / relevant.length;
  if (ratio >= 1) return "green";
  if (ratio >= 0.5) return "orange";
  return "red";
}

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
  selectedControlId,
  setSelectedControlId,
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
  selectedControlId: string | null;
  setSelectedControlId: (id: string | null) => void;
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

  // Dynamic guide for focused question — shown in evaluation panel until AI runs
  const [focusedQuestionGuide, setFocusedQuestionGuide] = useState<string | null>(null);
  const [focusedQuestionLabel, setFocusedQuestionLabel] = useState<string | null>(null);
  const handleQuestionFocus = useCallback((_key: string, guide: string | null, label: string) => {
    setFocusedQuestionGuide(guide);
    setFocusedQuestionLabel(label);
  }, []);

  // Reset guide when switching evidence items (form will set first question's guide)
  const prevItemIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (currentItem) {
      if (prevItemIdRef.current !== currentItem.id) {
        prevItemIdRef.current = currentItem.id;
        setFocusedQuestionGuide(null);
        setFocusedQuestionLabel(null);
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
        </>
      );
    }
    return (
      <p className="text-sm text-(--foreground-muted)">Cycle context required to load evidence questions.</p>
    );
  };

  return (
    <div className="h-full flex flex-col min-h-0 bg-(--surface) border border-(--border) rounded-xl overflow-hidden shadow-sm">
      <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-3.5 border-b border-(--border) bg-background/40">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="font-mono text-sm font-bold shrink-0" style={{ color: config.color }}>
            {currentItem.id}
          </span>
          <span className="text-sm font-semibold truncate text-foreground">{currentItem.name}</span>
          <PriorityBadge priority={currentItem.priority} />
        </div>
      </div>

      <Tabs defaultValue="common" className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="shrink-0 px-4 pt-3 pb-2">
          <TabsList className="bg-background/60">
            <TabsTrigger value="common">Evidence &amp; Evaluation</TabsTrigger>
            <TabsTrigger value="control">Per-Control</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="common" className="flex-1 min-h-0 flex flex-col overflow-hidden px-0 pb-0">
          {/* Double column: Evidence 45% | Evaluation result 55% */}
          <div className="flex-1 min-h-0 flex flex-col md:flex-row min-w-0 max-w-full overflow-x-hidden">
            {/* Left: Evidence — 45% width */}
            <div className="flex flex-col min-w-0 min-h-0 md:flex-[0_0_45%] md:border-r border-(--border) overflow-hidden md:min-h-[50vh]">
              <div className="shrink-0 px-5 py-4 border-b border-(--border) bg-background/50 min-h-[72px] flex flex-col justify-center">
                <h2 className="text-base font-bold text-foreground">Evidence</h2>
                <p className="text-sm text-(--foreground-muted) mt-1">
                  Form data for this item. Add or edit below; upload files where indicated.
                </p>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-5 space-y-6">
                {renderCommonEvidence()}
              </div>
            </div>

            {/* Right: Evaluation result — 55% width */}
            <div className="w-full min-w-0 flex flex-col min-h-0 md:flex-[0_0_55%] md:min-h-[60vh] bg-(--surface) overflow-hidden border-t md:border-t-0 border-(--border) shadow-sm">
              <div className="shrink-0 px-5 py-4 border-b border-(--border) bg-background/50 min-h-[72px] flex flex-col justify-center">
                <h2 className="text-base font-bold text-foreground">Evaluation result</h2>
                <p className="text-sm text-(--foreground-muted) mt-1">
                  Run AI evaluation and view results below.
                </p>
              </div>
              <div className="flex-1 min-h-[280px] overflow-y-auto overflow-x-hidden p-5 space-y-5">
                {/* 1. Run AI Evaluation card — only show button when not yet evaluated (first run) */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-(--border) bg-background/60 shadow-sm">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {evaluationState === "done" && aiEvaluationResult
                        ? "Evaluation complete — re-run after changes"
                        : "Run AI Evaluation"}
                    </p>
                    <p className="text-sm text-(--foreground-muted) mt-1">
                      {aiEvaluationLoading
                        ? "Evaluating against framework controls…"
                        : !currentSubmissionId
                          ? "Add or save evidence first (upload a file or fill the form and save)."
                          : currentItem.id === "A1" && !itemFormData.diagram_date
                            ? "Enter diagram date and upload your diagram for best results."
                            : "Your diagram and answers will be evaluated against the framework controls."}
                    </p>
                  </div>
                  {!(evaluationState === "done" && aiEvaluationResult) && (
                    <button
                      type="button"
                      onClick={onEvaluateEvidence}
                      disabled={aiEvaluationLoading}
                      className="shrink-0 inline-flex items-center justify-center gap-2 py-2.5 px-5 text-sm font-semibold rounded-lg text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--primary) disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ background: config.color }}
                    >
                      {aiEvaluationLoading ? (
                        <>
                          <span className="inline-block size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Evaluating…
                        </>
                      ) : (
                        "+ Run AI Evaluation"
                      )}
                    </button>
                  )}
                </div>

                {aiEvaluationError && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <p className="text-sm font-semibold text-amber-800">Evaluation failed</p>
                    <p className="text-xs text-amber-700 mt-1 font-mono">{aiEvaluationError}</p>
                    <button
                      type="button"
                      onClick={onEvaluateEvidence}
                      className="mt-2 py-1.5 px-3 text-xs font-semibold rounded-lg bg-amber-200 text-amber-900 hover:bg-amber-300"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {/* 2. AI Evaluation Result or dynamic guide — guide vanishes when AI runs */}
                {aiEvaluationLoading ? (
                  <AiEvaluationResult result={null} loading />
                ) : aiEvaluationResult ? (
                  <AiEvaluationResult
                    result={aiEvaluationResult}
                    loading={false}
                    placeholder={false}
                    editable={submissionStatus !== "submitted" && submissionStatus !== "approved"}
                    onEdit={onEvaluationEdit}
                    evaluationEdits={evaluationEdits}
                  />
                ) : (
                  <div className="rounded-xl border border-(--border) bg-background/60 p-4">
                    {focusedQuestionGuide && focusedQuestionGuide.trim() ? (
                      <>
                        <p className="text-[11px] font-semibold text-(--foreground-muted) uppercase tracking-wider mb-2">Guide</p>
                        <p className="text-sm text-foreground leading-relaxed">{focusedQuestionGuide.trim()}</p>
                      </>
                    ) : (
                      <p className="text-sm text-foreground leading-relaxed">
                        Fill in evidence and upload files, then click + Run AI Evaluation above. Results will appear here.
                      </p>
                    )}
                  </div>
                )}

                {/* 3. Actions and status — below AI result */}
                {evaluationState === "done" && aiEvaluationResult && (
                  <button
                    type="button"
                    onClick={onEvaluateEvidence}
                    className="w-full shrink-0 inline-flex items-center justify-center gap-2 py-2.5 px-5 text-sm font-semibold rounded-lg text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--primary)"
                    style={{ background: config.color }}
                  >
                    ↺ Re-evaluate
                  </button>
                )}
                {aiEvaluationResult && submissionStatus !== "submitted" && submissionStatus !== "approved" && onSubmitForReview && (
                  <button
                    type="button"
                    onClick={onSubmitForReview}
                    disabled={submitForReviewLoading}
                    className="w-full py-2.5 text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 disabled:opacity-60"
                  >
                    {submitForReviewLoading ? "Submitting…" : `Submit ${currentItem.id} for Review`}
                  </button>
                )}
                {(submissionStatus === "submitted" || submissionStatus === "in_review_L2" || submissionStatus === "in_review_L3") && (
                  <div className="py-2.5 px-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm text-center font-medium">
                    Submitted for review
                  </div>
                )}
                {submissionStatus === "approved" && (
                  <div className="py-2.5 px-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm text-center font-medium">
                    Evidence approved
                  </div>
                )}
                {aiEvaluationResult && evaluationState === "idle" && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    Evidence edited. Run AI Evaluation again to refresh results.
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="control" className="flex-1 min-h-0 flex flex-col overflow-hidden px-0 pb-0">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 pb-3">
          {currentItem.id === A5_EVIDENCE_ITEM_ID ? (
            <>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <button
                  type="button"
                  onClick={() => setSelectedControlId(selectedControlId === ALL_32_CONTROL_ID ? null : ALL_32_CONTROL_ID)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border-2 px-3 py-1.5 text-xs font-bold transition-colors",
                    selectedControlId === ALL_32_CONTROL_ID
                      ? "border-(--primary) bg-(--primary-muted) text-(--primary)"
                      : "border-(--border) bg-background text-foreground hover:border-(--primary)/50"
                  )}
                >
                  <span className="font-mono">All 32</span>
                  <span className="opacity-80">controls (scoping)</span>
                </button>
              </div>
              {itemFormData?.[A5_ARCHITECTURE_KEYS.architecture_type] && <A5ArchitecturePreview formData={itemFormData} />}
            </>
          ) : (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {currentItem.controls.map((c) => (
                <ControlBadge
                  key={c.id}
                  id={c.id}
                  ma={c.ma}
                  onClick={() => setSelectedControlId(selectedControlId === c.id ? null : c.id)}
                  selected={selectedControlId === c.id}
                  statusColor={getControlStatusColor(c.id, aiEvaluationResult?.sufficiency_results, aiEvaluationResult?.criteria)}
                />
              ))}
            </div>
          )}
          {currentItem.reductionNote && (
            <div className="text-[11px] font-medium rounded-lg px-2.5 py-1.5 mb-3 bg-(--success-bg) text-(--success)">
              {currentItem.reductionNote}
            </div>
          )}
          <PerControlEvidence
            evidenceItemId={currentItem.id}
            matrix={currentItem.matrix ?? []}
            submissionId={currentSubmissionId}
            evaluationState={evaluationState}
            sufficiencyResults={aiEvaluationResult?.sufficiency_results ?? null}
            criteriaResults={aiEvaluationResult?.criteria ?? null}
            onUploadComplete={onUploadComplete}
            onEnsureSubmission={() => onEnsureSubmission(currentItem.id)}
            selectedControlId={selectedControlId}
            onSelectControl={setSelectedControlId}
            showCommonEvidence={false}
          />
          {currentItem.sufficiency.length > 0 && (
            <SufficiencyPanel dimensions={currentItem.sufficiency} color={config.color} />
          )}
          </div>
        </TabsContent>

        <TabsContent value="notes" className="flex-1 min-h-0 flex flex-col overflow-hidden px-0 pb-0">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 pb-3">
          {!currentSubmissionId ? (
            <p className="text-sm text-(--foreground-muted) py-4">
              Add or save evidence for this item first to enable notes (e.g. upload a file or fill the form and save).
            </p>
          ) : (
            <div className="space-y-4">
              <NoteList
                resourceType="evidence_submission"
                resourceId={currentSubmissionId}
                refreshTrigger={effectiveNotesRefresh}
                emptyMessage="No notes yet."
              />
              <NoteInput
                resourceType="evidence_submission"
                resourceId={currentSubmissionId}
                placeholder={
                  submissionStatus === "returned" || String(submissionStatus ?? "").includes("returned")
                    ? "Add a reply to the reviewer…"
                    : "Add a note…"
                }
                onAdded={() => {
                  setNotesRefresh((r) => r + 1);
                  onNoteAdded?.();
                }}
              />
            </div>
          )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
