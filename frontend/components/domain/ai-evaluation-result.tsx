"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { stripCriteriaPrefix, shouldShowCriterion, cn } from "@/lib/utils";
import "@/components/review/swift-review-template/swift-review-template.css";
import { api } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NoteList } from "@/components/notes/note-list";
import { NoteInput } from "@/components/notes/note-input";
import type { AiEvaluationResult as AiEvaluationResultType, AiCriterionResult } from "@/lib/types";

export type EvaluationEditsMap = Record<
  string,
  { met: boolean; description: string | null; userNote?: string | null }
>;

interface AiEvaluationResultProps {
  result: AiEvaluationResultType | null;
  loading?: boolean;
  placeholder?: boolean;
  onEdit?: (updated: AiEvaluationResultType, edits: EvaluationEditsMap) => void;
  editable?: boolean;
  evaluationEdits?: EvaluationEditsMap;
  /** When set, per-criterion notes are shown as a thread (uploader + reviewer) with name and role. */
  submissionId?: string | null;
  notesRefreshTrigger?: number;
  onNoteAdded?: () => void;
  /** When true (e.g. reviewer view), hide AI explanatory text per criterion and "AI: x/y" badge. */
  hideAiHint?: boolean;
  /** Review queue: match Swift review template (cards, tokens under .swift-review-tpl). */
  visualVariant?: "default" | "swiftReview";
  /** Show embedded "AI evaluation results" title in swift variant. */
  showTitle?: boolean;
  /** IT SME only: render Re-evaluate and Submit buttons inside the Sufficiency & criteria box. */
  onReEvaluate?: () => void;
  onSubmitForReview?: () => void;
  evaluationState?: "idle" | "loading" | "done";
  submissionStatus?: string;
  submitForReviewLoading?: boolean;
  aiEvaluationLoading?: boolean;
  configColor?: string;
  currentItemId?: string;
}

type CriterionWithSection = AiCriterionResult & { section: "sufficiency_results" | "criteria" };

/** Design tokens from swift-review-template.css; required for swiftReview variant when not under ReviewPageShell. */
function SwiftEvalScope({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("swift-review-tpl swift-review-embed flex min-h-0 w-full flex-col", className)}>{children}</div>;
}

function EvalTabCount({ n }: { n: number }) {
  return (
    <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--eval-tab-count-bg)] px-1.5 text-[10px] font-bold tabular-nums text-[var(--eval-tab-count-text)]">
      {n}
    </span>
  );
}

/** Gap / rationale copy. Swift: pale pink panel + slate body text. */
function notMetRationaleClassName(met: boolean, swiftReview?: boolean): string {
  if (met) return "text-(--foreground-muted)";
  if (swiftReview) {
    return "text-[var(--eval-gap-box-text)] text-xs leading-relaxed rounded-lg border px-3.5 py-3";
  }
  return "text-slate-700 dark:text-rose-100/95 rounded-md border border-amber-200/90 bg-amber-50/80 px-3 py-2 leading-relaxed dark:border-rose-900/45 dark:bg-rose-950/35";
}

function notMetRationaleStyle(swiftReview: boolean): CSSProperties | undefined {
  if (!swiftReview) return undefined;
  return {
    backgroundColor: "var(--eval-gap-box-bg)",
    borderColor: "var(--eval-gap-box-border)",
  };
}

/** Donut ring: score/total with color by ratio (same as Control & AI Evaluation). Exported for use in Evaluation result panel header. */
export function EvaluationScoreRing({ score, total, size = 40 }: { score: number; total: number; size?: number }) {
  const pct = total ? score / total : 0;
  const r = size / 2 - 4;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  const color = pct >= 0.75 ? "var(--success, #10b981)" : pct >= 0.5 ? "var(--warning, #f59e0b)" : "var(--danger, #ef4444)";
  const cx = size / 2;
  const cy = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="3.5" />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="3.5"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dasharray .3s ease" }}
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-[10px] font-bold tabular-nums"
        style={{ fill: "var(--foreground)", fontFamily: "ui-monospace, monospace" }}
      >
        {score}/{total}
      </text>
    </svg>
  );
}

function CriterionNoteThread({
  submissionId,
  criterionId,
  refreshTrigger,
  onNoteAdded,
  onNoteDeleted,
  onNotesCountChange,
  showRemoveFromEdited,
  onMarkAsMet,
}: {
  submissionId: string;
  criterionId: string;
  refreshTrigger: number;
  onNoteAdded?: () => void;
  onNoteDeleted?: () => void;
  /** Called when notes load so parent can enable X→✓ only when notes exist. */
  onNotesCountChange?: (count: number) => void;
  /** When true (Manually met tab), show "Remove from manually met" button. */
  showRemoveFromEdited?: boolean;
  /** When provided (Not met tab), note add + this callback = mark as met. Called after note is added. */
  onMarkAsMet?: () => void;
}) {
  const [removing, setRemoving] = useState(false);
  const handleRemoveFromEdited = async () => {
    if (removing || !onNoteDeleted) return;
    if (!confirm("Remove from Manually met? All notes for this criterion will be deleted and it will move back to “Not met” (✗).")) return;
    setRemoving(true);
    try {
      const params = new URLSearchParams({
        resource_type: "evidence_submission",
        resource_id: submissionId,
        criterion_id: criterionId,
      });
      await api.del(`/notes/by-criterion?${params.toString()}`);
      onNoteDeleted();
    } catch {
      setRemoving(false);
    }
  };

  return (
    <div className="mt-2 pl-2 border-l-2 border-(--primary)/20 rounded-r bg-(--background)/50 py-2 pr-2 space-y-2">
      {showRemoveFromEdited && onNoteDeleted && (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={handleRemoveFromEdited}
            disabled={removing}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded px-2.5 py-1.5 transition-colors disabled:opacity-50"
            title="Delete all notes and move this criterion back to Not met (remove from manually met)"
          >
            {removing ? "Removing…" : "Remove from manually met"}
          </button>
        </div>
      )}
      <NoteList
        resourceType="evidence_submission"
        resourceId={submissionId}
        criterionId={criterionId}
        refreshTrigger={refreshTrigger}
        emptyMessage="No notes yet. Add a note for reviewers or follow up."
        onNoteDeleted={onNoteDeleted}
        onNotesLoaded={(notes) => onNotesCountChange?.(notes.length)}
        chatMode={showRemoveFromEdited}
      />
      <NoteInput
        resourceType="evidence_submission"
        resourceId={submissionId}
        criterionId={criterionId}
        placeholder={onMarkAsMet ? "Add a note explaining why this is met, then click Mark as Manually Met…" : "Add a note for the reviewer or submitter…"}
        onAdded={() => {
          onNoteAdded?.();
          onMarkAsMet?.();
        }}
        buttonLabel={onMarkAsMet ? "Mark as Manually Met" : undefined}
      />
    </div>
  );
}

function EditableCriterion({
  criterion,
  section,
  onToggle,
  onDescriptionChange,
  userNote,
  aiDescription,
  submissionId,
  notesRefreshTrigger,
  onNoteAdded,
  defaultExpandNote,
  showMarkAsMetButton,
  onMarkAsMetCallback,
  onClearCriterionEdit,
  hideAiHint,
  swiftReview,
}: {
  criterion: AiCriterionResult;
  section: "sufficiency_results" | "criteria";
  onToggle: () => void;
  onDescriptionChange: (desc: string) => void;
  userNote: string | null;
  aiDescription: string | null;
  submissionId?: string | null;
  notesRefreshTrigger?: number;
  onNoteAdded?: () => void;
  defaultExpandNote?: boolean;
  showMarkAsMetButton?: boolean;
  /** When provided, used for "Mark as Manually met" (e.g. toggle + switch tab). */
  onMarkAsMetCallback?: () => void;
  onClearCriterionEdit?: () => void;
  hideAiHint?: boolean;
  swiftReview?: boolean;
}) {
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState(userNote ?? "");
  const [showNoteBox, setShowNoteBox] = useState(!!defaultExpandNote);
  const [threadNotesCount, setThreadNotesCount] = useState(0);

  useEffect(() => {
    setNoteDraft(userNote ?? "");
  }, [userNote]);

  const handleSaveNote = () => {
    onDescriptionChange(noteDraft);
    setEditingNote(false);
  };

  const hasThread = Boolean(submissionId);
  const isNotMet = !criterion.met;
  const isEditedRow = !!defaultExpandNote;
  const hasNotes = hasThread ? threadNotesCount > 0 : Boolean(userNote?.trim());
  const canToggleToMet = criterion.met || hasNotes;
  const canToggleToNotMet = !criterion.met || !isEditedRow;
  const showAddComment = (isNotMet && hasThread) || (isEditedRow && hasThread);
  const showThreadInline = hasThread && showNoteBox && (isNotMet || isEditedRow);

  const handleToggleClick = () => {
    if (criterion.met) {
      if (!canToggleToNotMet) return;
    } else {
      if (!canToggleToMet) return;
    }
    onToggle();
  };

  if (swiftReview && isNotMet) {
    const xDisabled = !criterion.met && !canToggleToMet;
    return (
      <article className="mb-4 last:mb-0 rounded-[var(--radius-lg)] border border-[var(--border)] border-t-4 border-t-[var(--red)] bg-[var(--surface)] p-4 shadow-[var(--shadow-xs)]">
        <div className="flex gap-3 items-start">
          <button
            type="button"
            onClick={handleToggleClick}
            disabled={(!criterion.met && !canToggleToMet) || (criterion.met && !canToggleToNotMet)}
            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white transition-[transform,opacity,filter] active:scale-[0.97] ${
              xDisabled ? "cursor-not-allowed bg-[var(--red)] opacity-80" : "cursor-pointer bg-[var(--red)] hover:brightness-110"
            }`}
            title={
              !criterion.met && !canToggleToMet
                ? "Add a note first to mark as met"
                : criterion.met
                  ? canToggleToNotMet
                    ? "Met — click to mark as not met"
                    : "Edited — cannot change back to not met"
                  : "Not met — add a note then click to mark as met"
            }
          >
            ✗
          </button>
          <div className="flex-1 min-w-0 space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] leading-snug">{stripCriteriaPrefix(criterion.label)}</h3>
            {!hideAiHint && aiDescription && aiDescription.trim() && (
              <div className="flex flex-col gap-2">
                <p
                  className={notMetRationaleClassName(criterion.met, true)}
                  style={notMetRationaleStyle(true)}
                >
                  {aiDescription.trim()}
                </p>
                {showAddComment && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={() => setShowNoteBox((v) => !v)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setShowNoteBox((v) => !v);
                      }
                    }}
                    className="text-left text-xs font-semibold text-[var(--blue)] hover:underline cursor-pointer w-fit"
                  >
                    + Add comment
                  </span>
                )}
              </div>
            )}
            {showAddComment && !aiDescription?.trim() && (
              <span
                role="button"
                tabIndex={0}
                onClick={() => setShowNoteBox((v) => !v)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setShowNoteBox((v) => !v);
                  }
                }}
                className="text-xs font-semibold text-[var(--blue)] hover:underline cursor-pointer"
              >
                + Add comment
              </span>
            )}
            {showThreadInline ? (
              <CriterionNoteThread
                submissionId={submissionId!}
                criterionId={criterion.id}
                refreshTrigger={notesRefreshTrigger ?? 0}
                onNoteAdded={onNoteAdded}
                onNoteDeleted={onClearCriterionEdit}
                onNotesCountChange={setThreadNotesCount}
                showRemoveFromEdited={defaultExpandNote}
                onMarkAsMet={onMarkAsMetCallback ?? (showMarkAsMetButton ? onToggle : undefined)}
              />
            ) : (
              !hasThread && (
                <>
                  {!editingNote && isNotMet && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => setEditingNote(true)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setEditingNote(true);
                        }
                      }}
                      className="text-xs font-semibold text-[var(--blue)] hover:underline cursor-pointer block"
                    >
                      + Add comment
                    </span>
                  )}
                  {editingNote ? (
                    <div className="flex flex-col gap-2 mt-1.5">
                      <textarea
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") setEditingNote(false);
                        }}
                        placeholder="Add a note for the reviewer…"
                        rows={2}
                        className="w-full text-[11px] px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 resize-y"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleSaveNote}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNote(false);
                            setNoteDraft(userNote ?? "");
                          }}
                          className="text-[11px] font-medium px-2.5 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    userNote != null &&
                    userNote.trim() !== "" && (
                      <p className="text-xs text-[var(--text-secondary)] border-l-2 border-[var(--blue)]/25 pl-2 py-0.5 bg-[var(--blue-lt)]/40 rounded">
                        {userNote.trim()}
                      </p>
                    )
                  )}
                </>
              )
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="grid grid-cols-[1.5rem_1fr] gap-3 items-start py-3 px-0 border-b border-(--border)/50 last:border-b-0 hover:bg-(--primary-muted)/5 transition-colors group">
      <button
        type="button"
        onClick={handleToggleClick}
        disabled={(!criterion.met && !canToggleToMet) || (criterion.met && !canToggleToNotMet)}
        className={`w-6 h-6 flex shrink-0 items-center justify-center rounded text-base font-bold transition-colors mt-0.5 ${
          !criterion.met && !canToggleToMet
            ? "text-rose-400 cursor-not-allowed"
            : criterion.met
              ? canToggleToNotMet
                ? "text-emerald-600 hover:text-emerald-700 cursor-pointer"
                : "text-emerald-600 cursor-not-allowed"
              : "text-rose-500 hover:text-rose-600 cursor-pointer dark:text-rose-400"
        }`}
        title={
          !criterion.met && !canToggleToMet
            ? "Add a note first to mark as met"
            : criterion.met
              ? canToggleToNotMet
                ? "Met — click to mark as not met"
                : "Edited — cannot change back to not met"
              : "Not met — add a note then click to mark as met"
        }
      >
        {criterion.met ? "✓" : "✗"}
      </button>
      <div className="flex-1 min-w-0 space-y-1 py-0.5">
        <span className="text-sm text-foreground font-medium leading-snug">{stripCriteriaPrefix(criterion.label)}</span>
        {!hideAiHint && aiDescription && aiDescription.trim() && (
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className={`text-xs ${notMetRationaleClassName(criterion.met)}`}>{aiDescription.trim()}</p>
            {showAddComment && (
              <span
                role="button"
                tabIndex={0}
                onClick={() => setShowNoteBox((v) => !v)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShowNoteBox((v) => !v); } }}
                className="text-xs text-(--primary) hover:underline cursor-pointer font-medium"
              >
                +Add comment
              </span>
            )}
          </div>
        )}
        {showAddComment && !aiDescription?.trim() && (
          <span
            role="button"
            tabIndex={0}
            onClick={() => setShowNoteBox((v) => !v)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShowNoteBox((v) => !v); } }}
            className="text-xs text-(--primary) hover:underline cursor-pointer font-medium block"
          >
            +Add comment
          </span>
        )}
        {showThreadInline ? (
          <CriterionNoteThread
            submissionId={submissionId!}
            criterionId={criterion.id}
            refreshTrigger={notesRefreshTrigger ?? 0}
            onNoteAdded={onNoteAdded}
            onNoteDeleted={onClearCriterionEdit}
            onNotesCountChange={setThreadNotesCount}
            showRemoveFromEdited={defaultExpandNote}
            onMarkAsMet={onMarkAsMetCallback ?? (showMarkAsMetButton ? onToggle : undefined)}
          />
        ) : hasThread && !isNotMet && !isEditedRow ? null : !hasThread ? (
          <>
            {!editingNote && isNotMet && (
              <span
                role="button"
                tabIndex={0}
                onClick={() => setEditingNote(true)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setEditingNote(true); } }}
                className="text-xs text-(--primary) hover:underline cursor-pointer font-medium block mt-0.5"
              >
                +Add comment
              </span>
            )}
            {editingNote ? (
              <div className="flex flex-col gap-2 mt-1.5">
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setEditingNote(false);
                  }}
                  placeholder="Add a note for the reviewer…"
                  rows={2}
                  className="w-full text-[11px] px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 resize-y"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingNote(false); setNoteDraft(userNote ?? ""); }}
                    className="text-[11px] font-medium px-2.5 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              userNote != null &&
              userNote.trim() !== "" && (
                <p className="text-xs text-(--foreground-muted) border-l-2 border-(--primary)/30 pl-2 py-0.5 bg-(--primary-muted)/10 rounded mt-1">
                  {userNote.trim()}
                </p>
              )
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

function CriterionRow({
  criterion,
  editable,
  onToggle,
  onDescriptionChange,
  section,
  evaluationEdits,
  submissionId,
  notesRefreshTrigger,
  onNoteAdded,
  defaultExpandNote,
  showMarkAsMetButton,
  onClearCriterionEdit,
  hideAiHint,
  /** When provided (e.g. Not met tab), used for "Mark as Manually met" so we can also switch tab to Manually met. */
  onMarkAsMetOverride,
  visualVariant = "default",
}: {
  criterion: CriterionWithSection;
  editable: boolean;
  onToggle: () => void;
  onDescriptionChange: (desc: string) => void;
  section: "sufficiency_results" | "criteria";
  evaluationEdits: EvaluationEditsMap;
  submissionId?: string | null;
  notesRefreshTrigger?: number;
  onNoteAdded?: () => void;
  defaultExpandNote?: boolean;
  showMarkAsMetButton?: boolean;
  onClearCriterionEdit?: () => void;
  hideAiHint?: boolean;
  onMarkAsMetOverride?: () => void;
  visualVariant?: "default" | "swiftReview";
}) {
  const edit = evaluationEdits[criterion.id];
  const userNote = edit?.userNote ?? null;
  const aiDescription = criterion.description ?? null;
  const [showNoteBox, setShowNoteBox] = useState(!!defaultExpandNote);
  const markAsMetCallback = showMarkAsMetButton ? (onMarkAsMetOverride ?? onToggle) : undefined;
  const swift = visualVariant === "swiftReview";

  if (editable) {
    return (
      <EditableCriterion
        criterion={criterion}
        section={section}
        onToggle={onToggle}
        onDescriptionChange={onDescriptionChange}
        userNote={userNote}
        aiDescription={aiDescription}
        submissionId={submissionId}
        notesRefreshTrigger={notesRefreshTrigger}
        onNoteAdded={onNoteAdded}
        defaultExpandNote={defaultExpandNote}
        showMarkAsMetButton={showMarkAsMetButton}
        onMarkAsMetCallback={markAsMetCallback}
        onClearCriterionEdit={onClearCriterionEdit}
        hideAiHint={hideAiHint}
        swiftReview={swift}
      />
    );
  }
  const hasThread = Boolean(submissionId);
  const isNotMet = !criterion.met;
  const isEditedRow = !!defaultExpandNote;
  const showAddComment = (isNotMet && hasThread) || (isEditedRow && hasThread);
  const showThreadInline = hasThread && showNoteBox && (isNotMet || isEditedRow);

  if (swift && isNotMet) {
    return (
      <article className="mb-4 last:mb-0 rounded-[var(--radius-lg)] border border-[var(--border)] border-t-4 border-t-[var(--red)] bg-[var(--surface)] p-4 shadow-[var(--shadow-xs)]">
        <div className="flex gap-3 items-start">
          <span
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--red)] text-sm font-bold leading-none text-white"
            title="Not met"
            aria-hidden
          >
            ✗
          </span>
          <div className="flex-1 min-w-0 space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] leading-snug">
              {stripCriteriaPrefix(criterion.label)}
            </h3>
            {!hideAiHint && aiDescription && aiDescription.trim() && (
              <>
                <p
                  className={notMetRationaleClassName(criterion.met, true)}
                  style={notMetRationaleStyle(true)}
                >
                  {aiDescription.trim()}
                </p>
                {showAddComment && (
                  <button
                    type="button"
                    onClick={() => setShowNoteBox((v) => !v)}
                    className="text-left text-xs font-semibold text-[var(--blue)] hover:underline cursor-pointer"
                  >
                    + Add comment
                  </button>
                )}
              </>
            )}
            {showAddComment && !aiDescription?.trim() && (
              <button
                type="button"
                onClick={() => setShowNoteBox((v) => !v)}
                className="text-left text-xs font-semibold text-[var(--blue)] hover:underline cursor-pointer"
              >
                + Add comment
              </button>
            )}
            {showThreadInline ? (
              <CriterionNoteThread
                submissionId={submissionId!}
                criterionId={criterion.id}
                refreshTrigger={notesRefreshTrigger ?? 0}
                onNoteAdded={onNoteAdded}
                onNoteDeleted={onClearCriterionEdit}
                showRemoveFromEdited={defaultExpandNote}
                onMarkAsMet={markAsMetCallback}
              />
            ) : (
              !hasThread &&
              userNote &&
              userNote.trim() && (
                <p className="text-xs text-[var(--text-secondary)] border-l-2 border-[var(--blue)]/25 pl-2 py-0.5 bg-[var(--blue-lt)]/40 rounded">
                  {userNote.trim()}
                </p>
              )
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <div
      className={
        swift
          ? "grid grid-cols-[1.5rem_1fr] gap-3 items-start py-3 px-3 mb-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-xs)] last:mb-0"
          : "grid grid-cols-[1.5rem_1fr] gap-3 items-start py-3 px-0 border-b border-(--border)/50 last:border-b-0 hover:bg-(--primary-muted)/5 transition-colors"
      }
    >
      <span
        className={`w-6 h-6 flex shrink-0 items-center justify-center rounded text-base font-bold mt-0.5 ${
          criterion.met ? "text-emerald-600" : "text-rose-500 dark:text-rose-400"
        }`}
        title={criterion.met ? "Met" : "Not met"}
      >
        {criterion.met ? "✓" : "✗"}
      </span>
      <div className="flex-1 min-w-0 space-y-1 py-0.5">
        <span className="text-sm text-foreground font-medium leading-snug">{stripCriteriaPrefix(criterion.label)}</span>
        {!hideAiHint && aiDescription && aiDescription.trim() && (
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className={`text-xs ${notMetRationaleClassName(criterion.met, swift)}`}>{aiDescription.trim()}</p>
            {showAddComment && (
              <span
                role="button"
                tabIndex={0}
                onClick={() => setShowNoteBox((v) => !v)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setShowNoteBox((v) => !v);
                  }
                }}
                className="text-xs text-(--primary) hover:underline cursor-pointer font-medium"
              >
                +Add comment
              </span>
            )}
          </div>
        )}
        {showAddComment && !aiDescription?.trim() && (
          <span
            role="button"
            tabIndex={0}
            onClick={() => setShowNoteBox((v) => !v)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setShowNoteBox((v) => !v);
              }
            }}
            className="text-xs text-(--primary) hover:underline cursor-pointer font-medium block"
          >
            +Add comment
          </span>
        )}
        {showThreadInline ? (
          <CriterionNoteThread
            submissionId={submissionId!}
            criterionId={criterion.id}
            refreshTrigger={notesRefreshTrigger ?? 0}
            onNoteAdded={onNoteAdded}
            onNoteDeleted={onClearCriterionEdit}
            showRemoveFromEdited={defaultExpandNote}
            onMarkAsMet={markAsMetCallback}
          />
        ) : (
          !hasThread &&
          userNote &&
          userNote.trim() && (
            <p className="text-xs text-(--foreground-muted) border-l-2 border-(--primary)/30 pl-2 py-0.5 bg-(--primary-muted)/10 rounded">
              {userNote.trim()}
            </p>
          )
        )}
      </div>
    </div>
  );
}

function AiEvaluationResultTabs({
  result,
  onEdit,
  editable,
  evaluationEdits,
  submissionId,
  notesRefreshTrigger,
  onNoteAdded,
  hideAiHint,
  onReEvaluate,
  onSubmitForReview,
  evaluationState,
  submissionStatus,
  submitForReviewLoading,
  aiEvaluationLoading,
  configColor,
  currentItemId,
  visualVariant = "default",
  showTitle = true,
}: {
  result: AiEvaluationResultType;
  onEdit: (updated: AiEvaluationResultType, edits: EvaluationEditsMap) => void;
  editable: boolean;
  evaluationEdits: EvaluationEditsMap;
  submissionId?: string | null;
  notesRefreshTrigger?: number;
  onNoteAdded?: () => void;
  hideAiHint?: boolean;
  onReEvaluate?: () => void;
  onSubmitForReview?: () => void;
  evaluationState?: "idle" | "loading" | "done";
  submissionStatus?: string;
  submitForReviewLoading?: boolean;
  aiEvaluationLoading?: boolean;
  configColor?: string;
  currentItemId?: string;
  visualVariant?: "default" | "swiftReview";
  showTitle?: boolean;
}) {
  const swift = visualVariant === "swiftReview";
  const [activeTab, setActiveTab] = useState<"x" | "tick" | "edited" | "notes">("x");
  const prevResultRef = useRef<AiEvaluationResultType | null>(null);
  useEffect(() => {
    if (result !== prevResultRef.current) {
      prevResultRef.current = result;
      setActiveTab("x");
    }
  }, [result]);

  const visibleSufficiency = (result.sufficiency_results ?? []).filter((c) => shouldShowCriterion(c.label));
  const visibleCriteria = (result.criteria ?? []).filter((c) => shouldShowCriterion(c.label));
  const allCriteria: CriterionWithSection[] = [
    ...visibleSufficiency.map((c) => ({ ...c, section: "sufficiency_results" as const })),
    ...visibleCriteria.map((c) => ({ ...c, section: "criteria" as const })),
  ];
  const getEffectiveMet = (c: CriterionWithSection) => evaluationEdits[c.id]?.met ?? c.met;
  const failed = allCriteria.filter((c) => !getEffectiveMet(c));
  const passed = allCriteria.filter((c) => getEffectiveMet(c) && !(c.id in evaluationEdits));
  const edited = allCriteria.filter((c) => c.id in evaluationEdits);
  const handleToggle = useCallback(
    (section: "sufficiency_results" | "criteria", id: string) => {
      if (!onEdit || !result) return;
      const updateList = (list: AiCriterionResult[]) =>
        list.map((c) => (c.id === id ? { ...c, met: !c.met } : c));
      const updated = { ...result };
      if (section === "sufficiency_results") {
        updated.sufficiency_results = updateList(updated.sufficiency_results ?? []);
      } else {
        updated.criteria = updateList(updated.criteria ?? []);
      }
      updated.overall_met =
        (updated.sufficiency_results ?? []).every((c) => c.met) &&
        (updated.criteria ?? []).every((c) => c.met);
      const list =
        section === "sufficiency_results" ? updated.sufficiency_results ?? [] : updated.criteria ?? [];
      const criterion = list.find((c) => c.id === id)!;
      const existing = evaluationEdits[id] ?? { met: criterion.met, description: criterion.description ?? null };
      const newEdits: EvaluationEditsMap = {
        ...evaluationEdits,
        [id]: { ...existing, met: criterion.met, userNote: existing.userNote ?? existing.description ?? null },
      };
      onEdit(updated, newEdits);
    },
    [onEdit, result, evaluationEdits]
  );

  const handleDescChange = useCallback(
    (section: "sufficiency_results" | "criteria", id: string, desc: string) => {
      if (!onEdit || !result) return;
      const list =
        section === "sufficiency_results" ? result.sufficiency_results ?? [] : result.criteria ?? [];
      const criterion = list.find((c) => c.id === id);
      if (!criterion) return;
      const existing = evaluationEdits[id] ?? { met: criterion.met, description: criterion.description ?? null };
      const newEdits: EvaluationEditsMap = {
        ...evaluationEdits,
        [id]: { ...existing, userNote: desc || null },
      };
      onEdit(result, newEdits);
    },
    [onEdit, result, evaluationEdits]
  );

  const handleClearCriterionEdit = useCallback(
    (criterionId: string) => {
      if (!onEdit || !result) return;
      const next = { ...evaluationEdits };
      delete next[criterionId];
      onEdit(result, next);
    },
    [onEdit, result, evaluationEdits]
  );

  /** IT SME only: Re-evaluate, Submit, and status badges — rendered inside each tab. Always show when callbacks exist, including after submission. */
  const renderActionButtons = () => {
    if (!onReEvaluate && !onSubmitForReview) return null;
    const isSubmitted = submissionStatus === "submitted" || submissionStatus === "in_review_L2" || submissionStatus === "in_review_L3";
    const isApproved = submissionStatus === "approved";
    const canEdit = !isSubmitted && !isApproved;

    /** After form edits, domain page sets evaluationState to "idle" but keeps last result — still need Re-evaluate. */
    const showReEvaluate =
      canEdit &&
      onReEvaluate &&
      (evaluationState === "done" || (evaluationState === "idle" && result));

    return (
      <div className="shrink-0 mt-4 pt-4 border-t border-(--border) space-y-3">
        {/* Re-evaluate: after a completed run ("done") or after edits invalidated run ("idle" but result still shown) */}
        {showReEvaluate && (
          <button
            type="button"
            onClick={onReEvaluate}
            disabled={(aiEvaluationLoading ?? false) || submitForReviewLoading}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-5 text-sm font-semibold rounded-lg text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--primary) disabled:opacity-60"
            style={{ background: configColor ?? "var(--primary)" }}
          >
            {aiEvaluationLoading ? (
              <>
                <span className="inline-block size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Evaluating…
              </>
            ) : (
              "↺ Re-evaluate"
            )}
          </button>
        )}
        {/* Submit for Review: only when not yet submitted/approved */}
        {canEdit && onSubmitForReview && (
          <button
            type="button"
            onClick={onSubmitForReview}
            disabled={submitForReviewLoading}
            className="w-full py-2.5 text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 disabled:opacity-60"
          >
            {submitForReviewLoading ? "Submitting…" : `Submit ${currentItemId ?? "item"} for Review`}
          </button>
        )}
        {/* Submitted for review: show after user submits */}
        {isSubmitted && (
          <div className="py-2.5 px-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-sm text-center font-medium">
            Submitted for review
          </div>
        )}
        {/* Evidence approved: show when reviewer approves */}
        {isApproved && (
          <div className="py-2.5 px-3 rounded-lg bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 text-sm text-center font-medium">
            Evidence approved
          </div>
        )}
      </div>
    );
  };

  const renderList = (
    items: CriterionWithSection[],
    options?: {
      defaultExpandNote?: boolean;
      showMarkAsMetButton?: boolean;
      onClearCriterionEdit?: (criterionId: string) => void;
      hideAiHint?: boolean;
      /** When provided (e.g. Not met tab), "Mark as Manually met" will call this after adding the note (toggle + switch tab). */
      getMarkAsMetCallback?: (c: CriterionWithSection) => () => void;
    }
  ) => (
    <div className="space-y-0">
      {items.length === 0 ? (
        <p className="text-[11px] text-gray-500 py-4 text-center">No items in this group.</p>
      ) : (
        items.map((c) => (
          <CriterionRow
            key={c.id}
            criterion={{ ...c, met: getEffectiveMet(c) }}
            editable={editable}
            onToggle={() => handleToggle(c.section, c.id)}
            onDescriptionChange={(desc) => handleDescChange(c.section, c.id, desc)}
            section={c.section}
            evaluationEdits={evaluationEdits}
            submissionId={submissionId}
            notesRefreshTrigger={notesRefreshTrigger}
            onNoteAdded={onNoteAdded}
            defaultExpandNote={options?.defaultExpandNote}
            showMarkAsMetButton={options?.showMarkAsMetButton}
            onMarkAsMetOverride={options?.getMarkAsMetCallback?.(c)}
            onClearCriterionEdit={options?.onClearCriterionEdit ? () => options!.onClearCriterionEdit!(c.id) : undefined}
            hideAiHint={options?.hideAiHint}
            visualVariant={visualVariant}
          />
        ))
      )}
    </div>
  );

  const swiftTabBase =
    "group inline-flex items-center gap-2 rounded-lg border-2 border-transparent px-3 py-2 text-xs font-semibold shadow-none transition-colors data-[state=inactive]:bg-transparent data-[state=inactive]:text-[var(--eval-tab-inactive-text)] data-[state=inactive]:shadow-none data-[state=inactive]:hover:bg-[var(--surface)]";

  return (
    <div
      className={
        swift
          ? "flex h-full min-h-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]"
          : "flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-(--border) dark:bg-(--surface)"
      }
    >
      {swift && showTitle && (
        <div className="shrink-0 px-4 pt-4 pb-2">
          <h3 className="mb-2 text-base font-bold tracking-tight text-[var(--text-primary)]">AI evaluation results</h3>
        </div>
      )}
      <Tabs value={activeTab} onChange={(v) => setActiveTab(v as "x" | "tick" | "edited" | "notes")} className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <TabsList
          className={
            swift
              ? "shrink-0 mx-4 mt-2 mb-1 flex flex-wrap gap-2 rounded-none border-0 bg-transparent p-0 shadow-none"
              : "shrink-0 mx-4 mt-3 mb-0 rounded-xl p-1 bg-slate-100/80 dark:bg-(--surface) border border-slate-200 dark:border-(--border) gap-0.5"
          }
        >
          <TabsTrigger
            value="x"
            className={
              swift
                ? cn(
                    swiftTabBase,
                    "data-[state=active]:border-[var(--eval-tab-active-notmet-border)] data-[state=active]:bg-[var(--eval-tab-active-notmet-bg)] data-[state=active]:text-[var(--eval-tab-active-notmet-text)] data-[state=active]:shadow-sm"
                  )
                : "text-xs data-[state=active]:bg-rose-100 data-[state=active]:text-rose-800 dark:data-[state=active]:bg-rose-900/30 dark:data-[state=active]:text-rose-200 rounded-lg"
            }
          >
            {swift ? (
              <>
                <span className="text-[var(--text-muted)] group-data-[state=active]:text-[var(--red)]" aria-hidden>
                  ✗
                </span>
                <span>Not met</span>
                <EvalTabCount n={failed.length} />
              </>
            ) : (
              <>✗ Not met ({failed.length})</>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="tick"
            className={
              swift
                ? cn(
                    swiftTabBase,
                    "data-[state=active]:border-[var(--eval-tab-active-met-border)] data-[state=active]:bg-[var(--eval-tab-active-met-bg)] data-[state=active]:text-[var(--eval-tab-active-met-text)] data-[state=active]:shadow-sm"
                  )
                : "text-xs data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-200 rounded-lg"
            }
          >
            {swift ? (
              <>
                <span className="text-[var(--text-muted)] group-data-[state=active]:text-[var(--green)]" aria-hidden>
                  ✓
                </span>
                <span>Met</span>
                <EvalTabCount n={passed.length} />
              </>
            ) : (
              <>Met ({passed.length})</>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="edited"
            className={
              swift
                ? cn(
                    swiftTabBase,
                    "data-[state=active]:border-[var(--eval-tab-active-manual-border)] data-[state=active]:bg-[var(--eval-tab-active-manual-bg)] data-[state=active]:text-[var(--eval-tab-active-manual-text)] data-[state=active]:shadow-sm"
                  )
                : "text-xs data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800 dark:data-[state=active]:bg-amber-900/30 dark:data-[state=active]:text-amber-200 rounded-lg"
            }
          >
            {swift ? (
              <>
                <span className="text-[var(--text-muted)] group-data-[state=active]:text-[var(--amber)]" aria-hidden>
                  ○
                </span>
                <span>Manually met</span>
                <EvalTabCount n={edited.length} />
              </>
            ) : (
              <>Manually met ({edited.length})</>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className={
              swift
                ? cn(
                    swiftTabBase,
                    "data-[state=active]:border-[var(--eval-tab-active-notes-border)] data-[state=active]:bg-[var(--eval-tab-active-notes-bg)] data-[state=active]:text-[var(--eval-tab-active-notes-text)] data-[state=active]:shadow-sm"
                  )
                : "text-xs data-[state=active]:bg-sky-100 data-[state=active]:text-sky-800 dark:data-[state=active]:bg-sky-900/30 dark:data-[state=active]:text-sky-200 rounded-lg"
            }
          >
            Notes
          </TabsTrigger>
        </TabsList>

        <div
          className={
            swift
              ? "flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-auto scroll-smooth bg-[var(--eval-scroll-bg)] px-4 py-3 pr-4"
              : "flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-auto scroll-smooth bg-slate-50/50 px-4 py-3 pr-4 dark:bg-transparent"
          }
        >
          <TabsContent value="x" className="mt-0 block">
            {!swift && (
              <div className="mb-2 flex items-center gap-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-(--foreground-muted)">Not met</h4>
                <span className="shrink-0 rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                  Gaps identified
                </span>
              </div>
            )}
            {renderList(failed, {
              showMarkAsMetButton: true,
              onClearCriterionEdit: handleClearCriterionEdit,
              hideAiHint,
              getMarkAsMetCallback: (c) => () => {
                handleToggle(c.section, c.id);
                setActiveTab("edited");
              },
            })}
            {renderActionButtons()}
          </TabsContent>
          <TabsContent value="tick" className="mt-0 block">
            <div className={swift ? "mb-3" : "flex items-center gap-2 mb-2"}>
              <h4
                className={
                  swift
                    ? "text-sm font-bold text-[var(--text-primary)]"
                    : "text-[11px] font-bold text-(--foreground-muted) uppercase tracking-wider"
                }
              >
                Met
              </h4>
            </div>
            {renderList(passed, { onClearCriterionEdit: handleClearCriterionEdit, hideAiHint })}
            {renderActionButtons()}
          </TabsContent>
          <TabsContent value="edited" className="mt-0 block">
            <div className={swift ? "mb-3" : "flex items-center gap-2 mb-2"}>
              <h4
                className={
                  swift
                    ? "text-sm font-bold text-[var(--text-primary)]"
                    : "text-[11px] font-bold text-(--foreground-muted) uppercase tracking-wider"
                }
              >
                {swift ? "Manually met" : "Manually met (note or x→✓)"}
              </h4>
            </div>
            {renderList(edited, { defaultExpandNote: true, onClearCriterionEdit: handleClearCriterionEdit, hideAiHint: false })}
            {renderActionButtons()}
          </TabsContent>
          <TabsContent value="notes" className="mt-0 block">
            <div className={swift ? "mb-3" : "flex items-center gap-2 mb-2"}>
              <h4
                className={
                  swift
                    ? "text-sm font-bold text-[var(--text-primary)]"
                    : "text-[11px] font-bold text-(--foreground-muted) uppercase tracking-wider"
                }
              >
                Notes
              </h4>
            </div>
            {submissionId ? (
              <div className="space-y-4">
                <NoteList
                  resourceType="evidence_submission"
                  resourceId={submissionId}
                  refreshTrigger={notesRefreshTrigger ?? 0}
                  emptyMessage="No notes yet."
                />
                <NoteInput
                  resourceType="evidence_submission"
                  resourceId={submissionId}
                  placeholder="Add a note…"
                  onAdded={onNoteAdded}
                />
              </div>
            ) : (
              <p className="text-[11px] text-gray-500 py-4">Save evidence first to add notes.</p>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export function AiEvaluationResult({
  result,
  loading,
  placeholder,
  onEdit,
  editable = false,
  evaluationEdits = {},
  submissionId,
  notesRefreshTrigger = 0,
  onNoteAdded,
  hideAiHint = false,
  visualVariant = "default",
  onReEvaluate,
  onSubmitForReview,
  evaluationState,
  submissionStatus,
  submitForReviewLoading,
  aiEvaluationLoading,
  configColor,
  currentItemId,
  showTitle = true,
}: AiEvaluationResultProps) {
  const swift = visualVariant === "swiftReview";

  if (loading) {
    if (swift) {
      return (
        <SwiftEvalScope>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
            <div className="mb-3 flex items-center gap-3">
              <span
                className="inline-block size-8 animate-spin rounded-full border-2 border-[var(--border-2)] border-t-[var(--blue)]"
                aria-hidden
              />
              <span className="text-sm font-bold text-[var(--text-primary)]">AI evaluation</span>
            </div>
            <p className="text-sm font-medium leading-relaxed text-[var(--text-secondary)]">
              Reading evidence, sufficiency definition, evaluation criteria and submitted answers…
            </p>
            <p className="mt-2 text-xs text-[var(--text-muted)]">Evaluating criteria and generating gap descriptions.</p>
          </div>
        </SwiftEvalScope>
      );
    }
    return (
      <div className="rounded-2xl border-2 border-sky-200 dark:border-sky-700 bg-white dark:bg-slate-900/60 shadow-md p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="inline-block size-8 border-2 border-sky-200 border-t-sky-600 dark:border-sky-600 dark:border-t-sky-400 rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">AI Evaluation</span>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
          Reading Evidence Description, Sufficiency Definition, Evaluation Criteria and submitted evidence…
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
          Evaluating criteria and generating descriptions for any gaps.
        </p>
      </div>
    );
  }
  if (placeholder) {
    if (swift) {
      return (
        <SwiftEvalScope>
          <p className="py-6 text-center text-sm text-[var(--text-secondary)]">
            Fill in evidence and upload files, then run evaluation. Results will appear here.
          </p>
        </SwiftEvalScope>
      );
    }
    return (
      <p className="text-sm text-(--foreground-muted) py-4 text-center">
        Fill in evidence and upload files, then click <strong>+ Run AI Evaluation</strong> above. Results will appear
        here.
      </p>
    );
  }
  if (!result) return null;
  const tabs = (
    <AiEvaluationResultTabs
      result={result}
      onEdit={onEdit ?? (() => {})}
      editable={editable}
      evaluationEdits={evaluationEdits}
      submissionId={submissionId}
      notesRefreshTrigger={notesRefreshTrigger}
      onNoteAdded={onNoteAdded}
      hideAiHint={hideAiHint}
      visualVariant={visualVariant}
      onReEvaluate={onReEvaluate}
      onSubmitForReview={onSubmitForReview}
      evaluationState={evaluationState}
      submissionStatus={submissionStatus}
      submitForReviewLoading={submitForReviewLoading}
      aiEvaluationLoading={aiEvaluationLoading}
      configColor={configColor}
      currentItemId={currentItemId}
      showTitle={showTitle}
    />
  );
  if (swift) {
    return <SwiftEvalScope className="min-h-[min(420px,70vh)] flex-1">{tabs}</SwiftEvalScope>;
  }
  return tabs;
}
