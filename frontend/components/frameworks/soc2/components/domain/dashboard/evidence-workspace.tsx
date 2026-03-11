"use client";

/**
 * SOC 2 evidence workspace: generic evidence collection and evaluation.
 * Extend this file (or add SOC 2–specific evidence item handling) without touching SWIFT code.
 */

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ControlBadge } from "@/components/ui/control-badge";
import { PriorityBadge } from "@/components/ui/badge";
import { CompactDropzone } from "@/components/domain/compact-dropzone";
import { PerControlEvidence } from "@/components/domain/per-control-evidence";
import { SufficiencyPanel } from "@/components/domain/sufficiency-panel";
import { AiEvaluationResult } from "@/components/domain/ai-evaluation-result";
import { NoteList } from "@/components/notes/note-list";
import { NoteInput } from "@/components/notes/note-input";
import type { EvidenceWorkspaceProps } from "@/lib/frameworks/types";
import type { AiCriterionResult } from "@/lib/types";

const ALL_CONTROLS_ID = "All";

function getControlStatusColor(
  controlId: string,
  sufficiencyResults: AiCriterionResult[] | null | undefined,
  criteriaResults: AiCriterionResult[] | null | undefined
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
}: EvidenceWorkspaceProps) {
  const [notesRefresh, setNotesRefresh] = useState(0);
  const effectiveNotesRefresh = (notesRefreshTrigger ?? 0) + notesRefresh;

  if (!currentItem) {
    return (
      <div className="h-full flex items-center justify-center rounded-xl border border-(--border) bg-(--surface) text-(--foreground-muted) text-sm">
        Select an evidence item from the list
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0 bg-(--surface) border border-(--border) rounded-xl overflow-hidden">
      <div className="shrink-0 flex items-center justify-between gap-2 p-3 border-b border-(--border)">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-sm font-bold shrink-0" style={{ color: config.color }}>
            {currentItem.id}
          </span>
          <span className="text-sm font-semibold truncate text-foreground">{currentItem.name}</span>
          <PriorityBadge priority={currentItem.priority} />
        </div>
      </div>

      <Tabs defaultValue="common" className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 px-3 pt-2 pb-1">
          <TabsList>
            <TabsTrigger value="common">Common Evidence</TabsTrigger>
            <TabsTrigger value="control">Per-Control</TabsTrigger>
            <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="common" className="px-3 pb-3 overflow-y-auto">
          <section className="rounded-xl border border-(--border) bg-background p-4 mb-4">
            <h2 className="text-xs font-semibold text-foreground mb-2">Evidence</h2>
            <p className="text-[11px] text-(--foreground-muted) mb-3">
              Upload evidence files and documents that support this control requirement.
            </p>
            <CompactDropzone
              key={`upload-${currentItem.id}-${currentSubmissionId ?? "none"}`}
              submissionId={currentSubmissionId}
              label="Drop files or click to upload"
              onUploadComplete={onUploadComplete}
              onEnsureSubmission={() => onEnsureSubmission(currentItem.id)}
              className="max-h-[220px]"
            />
          </section>
          <div className="pt-4 border-t border-(--border)">
            <button
              type="button"
              onClick={onEvaluateEvidence}
              disabled={aiEvaluationLoading}
              className="w-full py-2.5 text-sm font-semibold rounded-lg text-white transition-all duration-150 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--primary) disabled:opacity-60 disabled:pointer-events-none"
              style={{ background: config.color }}
            >
              {aiEvaluationLoading ? "Evaluating…" : `Evaluate Evidence for ${currentItem.id}`}
            </button>
            {aiEvaluationError && (
              <p className="mt-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                {aiEvaluationError}
              </p>
            )}
            {aiEvaluationResult && submissionStatus !== "submitted" && submissionStatus !== "approved" && onSubmitForReview && (
              <button
                type="button"
                onClick={onSubmitForReview}
                disabled={submitForReviewLoading}
                className="w-full mt-3 py-2.5 text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 disabled:opacity-60 disabled:pointer-events-none"
              >
                {submitForReviewLoading ? "Submitting…" : `Submit ${currentItem.id} for Review`}
              </button>
            )}
            {(submissionStatus === "submitted" || submissionStatus === "in_review_L2" || submissionStatus === "in_review_L3") && (
              <div className="mt-3 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm text-center font-medium">
                Submitted for review
              </div>
            )}
            {submissionStatus === "approved" && (
              <div className="mt-3 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm text-center font-medium">
                Evidence approved
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="control" className="px-3 pb-3 overflow-y-auto">
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
        </TabsContent>

        <TabsContent value="evaluation" className="px-3 pb-3 overflow-y-auto">
          <AiEvaluationResult
            result={aiEvaluationResult}
            loading={aiEvaluationLoading}
            placeholder={!aiEvaluationLoading && !aiEvaluationResult}
            editable={!!aiEvaluationResult && submissionStatus !== "approved"}
            onEdit={onEvaluationEdit}
            evaluationEdits={evaluationEdits}
          />
        </TabsContent>

        <TabsContent value="notes" className="px-3 pb-3 overflow-y-auto">
          {!currentSubmissionId ? (
            <p className="text-sm text-(--foreground-muted) py-4">
              Add or save evidence for this item first to enable notes (e.g. upload a file).
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
