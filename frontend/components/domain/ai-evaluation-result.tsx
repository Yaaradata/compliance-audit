"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Pencil } from "lucide-react";
import { stripCriteriaPrefix, shouldShowCriterion } from "@/lib/utils";
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
  showRemoveFromEdited,
}: {
  submissionId: string;
  criterionId: string;
  refreshTrigger: number;
  onNoteAdded?: () => void;
  onNoteDeleted?: () => void;
  /** When true (Edited tab), show "Remove from edited" to delete all notes and move criterion back to Not met. */
  showRemoveFromEdited?: boolean;
}) {
  const [removing, setRemoving] = useState(false);
  const handleRemoveFromEdited = async () => {
    if (removing || !onNoteDeleted) return;
    if (!confirm("Remove from Edited? All notes for this criterion will be deleted and it will move back to “Not met” (✗).")) return;
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
            title="Delete all notes and move this criterion back to Not met"
          >
            {removing ? "Removing…" : "Remove from edited"}
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
      />
      <NoteInput
        resourceType="evidence_submission"
        resourceId={submissionId}
        criterionId={criterionId}
        placeholder="Add a note for the reviewer or submitter…"
        onAdded={onNoteAdded}
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
  onClearCriterionEdit,
  hideAiHint,
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
  onClearCriterionEdit?: () => void;
  hideAiHint?: boolean;
}) {
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState(userNote ?? "");
  const [showNoteBox, setShowNoteBox] = useState(!!defaultExpandNote);

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
  const showPen = (isNotMet && hasThread) || (isEditedRow && hasThread);
  const showThreadInline = hasThread && showNoteBox && (isNotMet || isEditedRow);

  return (
    <div className="grid grid-cols-[1.5rem_1fr_2rem] gap-3 items-start py-3 px-0 border-b border-(--border)/50 last:border-b-0 hover:bg-(--primary-muted)/5 transition-colors group">
      <button
        type="button"
        onClick={onToggle}
        className={`w-6 h-6 flex shrink-0 items-center justify-center rounded text-base font-bold cursor-pointer transition-colors mt-0.5 ${
          criterion.met ? "text-emerald-600 hover:text-emerald-700" : "text-rose-600 hover:text-rose-700"
        }`}
        title={criterion.met ? "Met — click to mark as not met" : "Not met — click to mark as met"}
      >
        {criterion.met ? "✓" : "✗"}
      </button>
      <div className="flex-1 min-w-0 space-y-1 py-0.5">
        <span className="text-sm text-foreground font-medium leading-snug">{stripCriteriaPrefix(criterion.label)}</span>
        {!hideAiHint && aiDescription && aiDescription.trim() && (
          <p className={`text-xs ${criterion.met ? "text-(--foreground-muted)" : "text-rose-600/90"}`}>{aiDescription.trim()}</p>
        )}
        {showThreadInline ? (
          <CriterionNoteThread
            submissionId={submissionId!}
            criterionId={criterion.id}
            refreshTrigger={notesRefreshTrigger ?? 0}
            onNoteAdded={onNoteAdded}
            onNoteDeleted={onClearCriterionEdit}
            showRemoveFromEdited={defaultExpandNote}
          />
        ) : hasThread && !isNotMet && !isEditedRow ? null : !hasThread ? (
          <>
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
      <div className="w-8 h-8 flex shrink-0 items-center justify-center mt-0.5">
        {showPen && (
          <button
            type="button"
            onClick={() => setShowNoteBox((v) => !v)}
            className="p-1.5 rounded text-(--foreground-muted) hover:text-(--primary) hover:bg-(--primary-muted)/30 transition-colors"
            title={showNoteBox ? "Hide note" : "Add or view note"}
            aria-label={showNoteBox ? "Hide note" : "Add or view note"}
          >
            <Pencil className="w-4 h-4" strokeWidth={2} />
          </button>
        )}
        {!hasThread && (
          <button
            type="button"
            onClick={() => setEditingNote(true)}
            className="p-1.5 rounded text-(--foreground-muted) hover:text-(--primary) hover:bg-(--primary-muted)/30 transition-colors"
            title="Add or edit note"
            aria-label="Add or edit note"
          >
            <Pencil className="w-4 h-4" strokeWidth={2} />
          </button>
        )}
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
  onClearCriterionEdit,
  hideAiHint,
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
  onClearCriterionEdit?: () => void;
  hideAiHint?: boolean;
}) {
  const edit = evaluationEdits[criterion.id];
  const userNote = edit?.userNote ?? null;
  const aiDescription = criterion.description ?? null;
  const [showNoteBox, setShowNoteBox] = useState(!!defaultExpandNote);

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
        onClearCriterionEdit={onClearCriterionEdit}
        hideAiHint={hideAiHint}
      />
    );
  }
  const hasThread = Boolean(submissionId);
  const isNotMet = !criterion.met;
  const isEditedRow = !!defaultExpandNote;
  const showPen = (isNotMet && hasThread) || (isEditedRow && hasThread);
  const showThreadInline = hasThread && showNoteBox && (isNotMet || isEditedRow);
  return (
    <div className="grid grid-cols-[1.5rem_1fr_2rem] gap-3 items-start py-3 px-0 border-b border-(--border)/50 last:border-b-0 hover:bg-(--primary-muted)/5 transition-colors">
      <span
        className={`w-6 h-6 flex shrink-0 items-center justify-center rounded text-base font-bold mt-0.5 ${
          criterion.met ? "text-emerald-600" : "text-rose-600"
        }`}
        title={criterion.met ? "Met" : "Not met"}
      >
        {criterion.met ? "✓" : "✗"}
      </span>
      <div className="flex-1 min-w-0 space-y-1 py-0.5">
        <span className="text-sm text-foreground font-medium leading-snug">{stripCriteriaPrefix(criterion.label)}</span>
        {!hideAiHint && aiDescription && aiDescription.trim() && (
          <p className={`text-xs ${criterion.met ? "text-(--foreground-muted)" : "text-rose-600/90"}`}>{aiDescription.trim()}</p>
        )}
        {showThreadInline ? (
          <CriterionNoteThread
            submissionId={submissionId!}
            criterionId={criterion.id}
            refreshTrigger={notesRefreshTrigger ?? 0}
            onNoteAdded={onNoteAdded}
            onNoteDeleted={onClearCriterionEdit}
            showRemoveFromEdited={defaultExpandNote}
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
      <div className="w-8 h-8 flex shrink-0 items-center justify-center mt-0.5">
        {showPen && (
          <button
            type="button"
            onClick={() => setShowNoteBox((v) => !v)}
            className="p-1.5 rounded text-(--foreground-muted) hover:text-(--primary) hover:bg-(--primary-muted)/30 transition-colors"
            title={showNoteBox ? "Hide note" : "View or add note"}
            aria-label={showNoteBox ? "Hide note" : "View or add note"}
          >
            <Pencil className="w-4 h-4" strokeWidth={2} />
          </button>
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
}) {
  const [activeTab, setActiveTab] = useState<"x" | "tick" | "edited">("x");
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
  const metCount = allCriteria.filter((c) => getEffectiveMet(c)).length;
  const totalCount = allCriteria.length;

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

  const renderList = (
    items: CriterionWithSection[],
    options?: { defaultExpandNote?: boolean; onClearCriterionEdit?: (criterionId: string) => void; hideAiHint?: boolean }
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
            onClearCriterionEdit={options?.onClearCriterionEdit ? () => options!.onClearCriterionEdit!(c.id) : undefined}
            hideAiHint={options?.hideAiHint}
          />
        ))
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-(--border) overflow-hidden shadow-sm flex flex-col min-h-0 h-full">
      {/* Summary bar: pass / fail / AI count (no duplicate title/donut — those are in Evaluation result header) */}
      {totalCount > 0 && (
        <div className="shrink-0 flex items-center justify-between px-4 pt-3 pb-2 border-b border-(--border) bg-background/40">
          <span className="text-[10px] font-bold uppercase tracking-widest text-(--foreground-muted)">
            Sufficiency & criteria
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {metCount} pass
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-rose-600 dark:text-rose-400">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              {totalCount - metCount} fail
            </span>
            {!hideAiHint && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-(--border) bg-(--surface) text-(--foreground-muted) tabular-nums">
                AI: {metCount}/{totalCount}
              </span>
            )}
          </div>
        </div>
      )}

      <Tabs value={activeTab} onChange={(v) => setActiveTab(v as "x" | "tick" | "edited")} className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <TabsList className="shrink-0 mx-4 mt-3 mb-0 rounded-lg p-1 bg-(--surface) border border-(--border)">
          <TabsTrigger value="x" className="text-xs">
            ✗ Not met ({failed.length})
          </TabsTrigger>
          <TabsTrigger value="tick" className="text-xs">
            ✓ Met ({passed.length})
          </TabsTrigger>
          <TabsTrigger value="edited" className="text-xs">
            Edited ({edited.length})
          </TabsTrigger>
        </TabsList>

        <div className="px-4 py-3 flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-auto">
          <TabsContent value="x" className="mt-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-[11px] font-bold text-(--foreground-muted) uppercase tracking-wider">
                Sufficiency & criteria — not met
              </h4>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded shrink-0 ${
                  result.overall_met ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}
              >
                {result.overall_met ? "Requirements met" : "Gaps identified"}
              </span>
            </div>
            {renderList(failed, { onClearCriterionEdit: handleClearCriterionEdit, hideAiHint })}
          </TabsContent>
          <TabsContent value="tick" className="mt-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-[11px] font-bold text-(--foreground-muted) uppercase tracking-wider">
                Sufficiency & criteria — met
              </h4>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded shrink-0 ${
                  result.overall_met ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}
              >
                {result.overall_met ? "Requirements met" : "Gaps identified"}
              </span>
            </div>
            {renderList(passed, { onClearCriterionEdit: handleClearCriterionEdit, hideAiHint })}
          </TabsContent>
          <TabsContent value="edited" className="mt-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-[11px] font-bold text-(--foreground-muted) uppercase tracking-wider">
                Edited by you (note or x→✓)
              </h4>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded shrink-0 ${
                  result.overall_met ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}
              >
                {result.overall_met ? "Requirements met" : "Gaps identified"}
              </span>
            </div>
            {renderList(edited, { defaultExpandNote: true, onClearCriterionEdit: handleClearCriterionEdit, hideAiHint })}
          </TabsContent>
        </div>

        {/* IT SME only: Re-evaluate and Submit buttons inside the Sufficiency & criteria box */}
        {editable && (onReEvaluate || onSubmitForReview) && (
          <div className="shrink-0 px-4 pb-4 pt-2 border-t border-(--border) bg-background/30 space-y-3">
            {evaluationState === "done" && onReEvaluate && (
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
            {submissionStatus !== "submitted" && submissionStatus !== "approved" && onSubmitForReview && (
              <button
                type="button"
                onClick={onSubmitForReview}
                disabled={submitForReviewLoading}
                className="w-full py-2.5 text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 disabled:opacity-60"
              >
                {submitForReviewLoading ? "Submitting…" : `Submit ${currentItemId ?? "item"} for Review`}
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
            {evaluationState === "idle" && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Evidence edited. Run Re-evaluate to refresh results.
              </div>
            )}
          </div>
        )}
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
  onReEvaluate,
  onSubmitForReview,
  evaluationState,
  submissionStatus,
  submitForReviewLoading,
  aiEvaluationLoading,
  configColor,
  currentItemId,
}: AiEvaluationResultProps) {
  if (loading) {
    return (
      <div className="bg-sky-50 rounded-xl border border-sky-200 p-4">
        <div className="text-xs font-semibold text-sky-800 mb-2">AI Evaluation</div>
        <p className="text-xs text-sky-600">
          Reading Evidence Description, Sufficiency Definition, Evaluation Criteria and submitted evidence…
        </p>
        <p className="text-[11px] text-sky-500 mt-2">Evaluating criteria and generating descriptions for any gaps.</p>
      </div>
    );
  }
  if (placeholder) {
    return (
      <p className="text-sm text-(--foreground-muted) py-4 text-center">
        Fill in evidence and upload files, then click <strong>+ Run AI Evaluation</strong> above. Results will appear
        here.
      </p>
    );
  }
  if (!result) return null;
  return (
    <AiEvaluationResultTabs
      result={result}
      onEdit={onEdit ?? (() => {})}
      editable={editable}
      evaluationEdits={evaluationEdits}
      submissionId={submissionId}
      notesRefreshTrigger={notesRefreshTrigger}
      onNoteAdded={onNoteAdded}
      hideAiHint={hideAiHint}
      onReEvaluate={onReEvaluate}
      onSubmitForReview={onSubmitForReview}
      evaluationState={evaluationState}
      submissionStatus={submissionStatus}
      submitForReviewLoading={submitForReviewLoading}
      aiEvaluationLoading={aiEvaluationLoading}
      configColor={configColor}
      currentItemId={currentItemId}
    />
  );
}
