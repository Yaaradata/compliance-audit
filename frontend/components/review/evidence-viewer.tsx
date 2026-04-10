"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import "./swift-review-template/swift-review-template.css";
import { api } from "@/lib/api";
import { stripCriteriaPrefix, shouldShowCriterion } from "@/lib/utils";
import { EvidenceDisplayReadOnly } from "@/components/domain/evidence-display-readonly";
import { NoteList, type NoteItem } from "@/components/notes/note-list";
import { NoteInput } from "@/components/notes/note-input";
import { AiEvaluationResult } from "@/components/domain/ai-evaluation-result";

interface Attachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  url: string | null;
}

interface Comment {
  id: string;
  review_id?: string;
  level?: string;
  author_id: string;
  author_name?: string;
  body: string;
  is_resolved: boolean;
  created_at: string;
}

interface CheckSubItem {
  id: number;
  check: string;
  description: string;
}

/** New format: { checklist: [{ section, checks: string[] }], action?: { return?, approve? } } */
interface ChecklistSection {
  section: string;
  checks: string[];
}

interface CheckJson {
  task?: string;
  document?: string;
  control?: string;
  checks?: CheckSubItem[];
  /** New format: sections with list of check strings */
  checklist?: ChecklistSection[];
  action?: { return?: string; approve?: string };
}

interface ChecklistItem {
  id: string;
  control_id: string;
  control_name: string;
  mandatory_advisory: string;
  check_text: string;
  check_json?: CheckJson;
}

interface ReviewHistoryEntry {
  id: string;
  level: string;
  status: string;
  decision: string | null;
  assigned_at: string;
  completed_at: string | null;
  checklist_results?: Record<string, { checked: boolean; note?: string | null }>;
}

export interface ReviewDetailData {
  review: {
    id: string;
    level: string;
    status: string;
    decision: string | null;
    reviewer_id: string;
    reviewer_name: string | null;
    assigned_at: string;
    completed_at: string | null;
    checklist_results?: Record<string, { checked: boolean; note?: string | null }>;
  };
  submission: {
    id: string;
    cycle_id?: string;
    evidence_item_id: string;
    status: string;
    form_data: Record<string, string>;
    evaluation_result: {
      evidence_item_id?: string;
      overall_met?: boolean;
      sufficiency_results?: { id: string; label: string; met: boolean; description?: string | null }[];
      criteria?: { id: string; label: string; met: boolean; description?: string | null }[];
      summary?: string | null;
    } | null;
    /** Submitter's edits (met overrides + notes) so L1/L2/approval see Edited tab and overrides. */
    evaluation_edits?: Record<string, { met: boolean; description: string | null; userNote?: string | null }>;
    submitted_at: string | null;
  };
  attachments: Attachment[];
  checklist: ChecklistItem[];
  comments: Comment[];
  review_history: ReviewHistoryEntry[];
}

/** One row from GET /ref/evidence-items/{item_id}/matrix (per-control sufficiency and evaluation criteria). */
interface MatrixRow {
  item_code: string;
  control_id: string;
  evidence_item_name: string;
  control_name: string;
  ma: string;
  evidence_type: string;
  sufficiency_criteria: string | null;
  evaluation_criteria: string | null;
}

/** Renders one AI result line; pen icon toggles note list + add-note input. Uses shared preFetchedNotes when provided. */
function CriterionNoteBlock({
  submissionId,
  criterionId,
  label,
  met,
  description,
  refreshTrigger,
  onNoteAdded,
  preFetchedNotes,
}: {
  submissionId: string;
  criterionId: string;
  label: string;
  met: boolean;
  description?: string | null;
  refreshTrigger: number;
  onNoteAdded?: () => void;
  preFetchedNotes?: NoteItem[] | null;
}) {
  const [showNoteBox, setShowNoteBox] = useState(false);
  return (
    <div className="py-3 px-0 border-b border-(--border)/50 space-y-2">
      <div className="flex items-start gap-2 text-sm">
        <span className={`shrink-0 ${met ? "text-emerald-600" : "text-rose-600"}`}>{met ? "✓" : "✗"}</span>
        <div className="flex-1 min-w-0">
          <span className="text-foreground">{stripCriteriaPrefix(label)}</span>
          {description && <p className="text-xs text-(--foreground-muted) mt-1">{description}</p>}
        </div>
        <button
          type="button"
          onClick={() => setShowNoteBox((v) => !v)}
          aria-label={showNoteBox ? "Hide add note" : "Add note"}
          className="shrink-0 p-1 rounded text-(--foreground-muted) hover:text-(--primary) hover:bg-(--primary-muted)/30 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </div>
      {showNoteBox && (
        <div className="pl-4 border-l-2 border-(--border) space-y-2">
          <NoteList
            resourceType="evidence_submission"
            resourceId={submissionId}
            criterionId={criterionId}
            refreshTrigger={refreshTrigger}
            emptyMessage="No notes on this criterion yet."
            preFetchedNotes={preFetchedNotes}
          />
          <NoteInput
            resourceType="evidence_submission"
            resourceId={submissionId}
            criterionId={criterionId}
            placeholder={met ? "Add a note for the reviewer or submitter…" : "Add a note explaining why this is met, then click Mark as Manually Met…"}
            onAdded={onNoteAdded}
            buttonLabel={met ? undefined : "Mark as Manually Met"}
          />
        </div>
      )}
    </div>
  );
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

/** Preview type for evidence files: show in popup or offer open in new tab */
function getAttachmentPreviewType(att: Attachment): "image" | "pdf" | "other" {
  const ext = (att.file_name?.split(".").pop() || att.file_type || "").toLowerCase();
  const imageExts = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"];
  if (imageExts.includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  return "other";
}

/** True if the value looks like a browser-usable URL (http/https or blob). */
function isViewableUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:");
}

/**
 * Popup to view submitted evidence file content: images and PDFs inline; others get "Open in new tab".
 * When the API does not return a URL (e.g. local storage), fetches the file via the download endpoint.
 */
function EvidenceFileViewerModal({
  attachment,
  submissionId,
  onClose,
}: {
  attachment: Attachment | null;
  submissionId?: string | null;
  onClose: () => void;
}) {
  const [fetchedUrl, setFetchedUrl] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!attachment || !submissionId) return;
    const apiUrl = attachment.url;
    if (isViewableUrl(apiUrl)) {
      setFetchedUrl(null);
      setFetchError(null);
      return;
    }
    setLoading(true);
    setFetchError(null);
    setFetchedUrl(null);
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    api
      .getBlob(`/evidence/${submissionId}/files/${attachment.id}`)
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        blobUrlRef.current = objectUrl;
        setFetchedUrl(objectUrl);
        setFetchError(null);
      })
      .catch((err) => {
        setFetchError(err?.message || "Could not load file.");
        setFetchedUrl(null);
      })
      .finally(() => setLoading(false));

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [attachment?.id, submissionId, attachment?.url]);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  if (!attachment) return null;
  const previewType = getAttachmentPreviewType(attachment);
  const url = isViewableUrl(attachment.url) ? attachment.url : fetchedUrl;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`View ${attachment.file_name}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-(--surface) rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-(--border)">
        <div className="shrink-0 flex items-center justify-between gap-4 px-4 py-3 border-b border-(--border) bg-background/80">
          <h3 className="text-sm font-semibold text-foreground truncate flex-1 min-w-0">
            {attachment.file_name}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-(--border) bg-(--surface) hover:bg-(--primary-muted) hover:border-(--primary)/40 text-foreground hover:text-(--primary)"
              >
                Open in new tab
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-background text-(--foreground-muted) hover:text-foreground"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0 flex items-center justify-center overflow-auto bg-background/30 p-4">
          {loading ? (
            <p className="text-sm text-(--foreground-muted)">Loading file…</p>
          ) : fetchError ? (
            <p className="text-sm text-(--foreground-muted)">{fetchError}</p>
          ) : !url ? (
            <p className="text-sm text-(--foreground-muted)">File not available to view.</p>
          ) : previewType === "image" ? (
            <img
              src={url}
              alt={attachment.file_name}
              className="max-w-full max-h-[calc(90vh-56px)] w-auto h-auto object-contain rounded-lg shadow-lg"
            />
          ) : previewType === "pdf" ? (
            <iframe
              src={url}
              title={attachment.file_name}
              className="w-full min-h-[calc(90vh-56px)] rounded-lg border-0 bg-white"
              style={{ height: "min(80vh, 800px)" }}
            />
          ) : (
            <div className="text-center max-w-sm p-6 rounded-xl border border-(--border) bg-(--surface)">
              <p className="text-sm text-(--foreground-muted) mb-2">
                Preview not available for this file type (e.g. Excel, Word). Open in a new tab to view.
              </p>
              <p className="text-xs text-(--foreground-subtle) mb-4">{attachment.file_name}</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-(--primary) text-white text-sm font-medium hover:opacity-90"
              >
                Open in new tab
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const LEVEL_LABELS: Record<string, string> = { L1: "Completeness", L2: "Quality", L3: "Approver" };
const normalizeLevel = (l: string) =>
  (({ l1_completeness: "L1", l2_quality: "L2", l3_assessment: "L3" } as Record<string, string>)[l] ?? l);

/**
 * Inline expandable evidence viewer — renders inside a review card.
 * Sections are stacked vertically (not tabbed) for dashboard view.
 */
export function InlineEvidenceDetail({
  reviewId,
  userRole,
  onAction,
}: {
  reviewId: string;
  userRole: string;
  onAction?: (decision: "approve" | "return" | "hold", comment?: string, checklistResults?: Record<string, { checked: boolean; note?: string | null }>) => void;
}) {
  const [data, setData] = useState<ReviewDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [checklistState, setChecklistState] = useState<Record<string, { checked: boolean; note: string }>>({});
  const [savingChecklist, setSavingChecklist] = useState(false);
  const [activeTab, setActiveTab] = useState<"evidence" | "evaluation" | "comments" | "notes" | "history">("evidence");
  const [notesRefresh, setNotesRefresh] = useState(0);

  const fetchDetail = useCallback(async () => {
    try {
      const resp = await api.get<ReviewDetailData>(`/reviews/${reviewId}/detail`);
      setData(resp);
      const saved = resp.review.checklist_results || {};
      const initial: Record<string, { checked: boolean; note: string }> = {};
      for (const item of resp.checklist || []) {
        const s = saved[item.id] ?? saved[item.control_id];
        const note = (s?.note != null && s.note !== "") ? String(s.note) : "";
        initial[item.id] = { checked: s?.checked ?? false, note };
      }
      setChecklistState(initial);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [reviewId]);

  useEffect(() => {
    setLoading(true);
    fetchDetail();
  }, [fetchDetail]);

  const saveChecklistToServer = useCallback(async (results: Record<string, { checked: boolean; note: string }>) => {
    setSavingChecklist(true);
    try { await api.patch(`/reviews/${reviewId}/checklist`, { checklist_results: results }); } catch { /* */ }
    setSavingChecklist(false);
  }, [reviewId]);

  const toggleChecklistItem = useCallback((itemId: string) => {
    setChecklistState((prev) => {
      const next = { ...prev, [itemId]: { ...prev[itemId], checked: !prev[itemId]?.checked } };
      saveChecklistToServer(next);
      return next;
    });
  }, [saveChecklistToServer]);

  const updateChecklistNote = useCallback((itemId: string, note: string) => {
    setChecklistState((prev) => ({ ...prev, [itemId]: { ...prev[itemId], checked: prev[itemId]?.checked ?? false, note } }));
  }, []);

  const blurChecklistNote = useCallback(() => {
    saveChecklistToServer(checklistState);
  }, [checklistState, saveChecklistToServer]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      await api.post(`/reviews/${reviewId}/comments`, { body: newComment.trim() });
      setNewComment("");
      fetchDetail();
    } catch { /* */ }
    setSubmittingComment(false);
  };

  if (loading) return <div className="py-6 text-center text-sm text-(--foreground-muted)">Loading details…</div>;
  if (!data) return <div className="py-6 text-center text-sm text-(--foreground-muted)">Could not load details.</div>;

  const { review, submission, attachments, checklist, comments, review_history } = data;
  const evalResult = submission.evaluation_result;
  const formData = submission.form_data || {};
  const formKeys = Object.keys(formData).filter((k) => formData[k]);

  const rLevel = normalizeLevel(review.level);
  const canAction =
    (userRole === "internal_reviewer_l1" && rLevel === "L1") ||
    (userRole === "internal_reviewer_l2" && rLevel === "L2") ||
    (userRole === "external_assessor" && rLevel === "L3") ||
    userRole === "compliance_officer" ||
    userRole === "admin";

  const checklistTotal = checklist?.length ?? 0;
  const checklistChecked = Object.values(checklistState).filter((v) => v.checked).length;
  const isEditable = review.status === "assigned";

  const levelLabel = LEVEL_LABELS[normalizeLevel(review.level)] ?? review.level;
  const levelDisplay = `${normalizeLevel(review.level)} — ${levelLabel}`;

  const isReturned = submission.status === "returned" || String(submission.status || "").includes("returned");
  const TABS = [
    { id: "evidence" as const, label: "Evidence", badge: `${formKeys.length} fields, ${attachments.length} files` },
    { id: "evaluation" as const, label: "AI Evaluation", badge: evalResult ? (evalResult.overall_met ? "Met" : "Not met") : "—" },
    { id: "notes" as const, label: "Notes", badge: "" },
    { id: "history" as const, label: "History", badge: `${review_history.length} levels` },
  ];

  const tabContentClass = "overflow-y-auto overscroll-contain pr-1 min-h-0";
  const contentMaxHeight = "max-h-[min(70vh,420px)]";

  return (
    <div className="flex flex-col gap-3">
      {isReturned && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-3">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Reviewer requested revision</p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">You can add a reply below in the Notes tab and update the evidence as needed.</p>
        </div>
      )}
      {/* Compact level + tabs row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-wrap">
        <div className="flex items-center gap-2 rounded-lg border border-(--border) bg-(--surface) px-3 py-2">
          <span className="text-[10px] font-semibold text-(--foreground-muted) uppercase tracking-wider">Level</span>
          <span className="text-sm font-bold text-foreground">{levelDisplay}</span>
        </div>
        <div className="flex flex-wrap gap-1 rounded-lg border border-(--border) bg-background p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={activeTab === tab.id}
              aria-label={tab.badge ? `${tab.label}, ${tab.badge}` : tab.label}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === tab.id ? "bg-(--primary) text-white shadow-sm" : "text-(--foreground-muted) hover:bg-(--border) hover:text-foreground"}`}
            >
              {tab.label}
              {tab.badge && <span className={`tabular-nums ${activeTab === tab.id ? "text-white/90" : "text-(--foreground-subtle)"}`}>({tab.badge})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Single scrollable content area — only active tab */}
      <div className={`flex-1 border border-(--border) rounded-xl bg-(--surface) ${contentMaxHeight} flex flex-col overflow-hidden`}>
        {activeTab === "evidence" && (
          <div className={`flex-1 flex flex-col ${tabContentClass} ${contentMaxHeight}`}>
            {/* Evidence: section header */}
            <div className="shrink-0 px-4 py-3 border-b border-(--border) bg-background/50">
              <h3 className="text-sm font-bold text-foreground">Evidence</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <EvidenceDisplayReadOnly
                evidenceItemId={submission.evidence_item_id}
                cycleId={submission.cycle_id ?? ""}
                formData={formData}
                attachments={attachments}
              />
            </div>
          </div>
        )}

        {activeTab === "evaluation" && (
          <div className={`flex-1 flex flex-col ${tabContentClass} ${contentMaxHeight} p-3`}>
            {evalResult ? (
              <div className="space-y-3">
                {evalResult.sufficiency_results && evalResult.sufficiency_results.length > 0 && (
                  <div className="space-y-1">
                    <h5 className="text-[10px] font-bold text-(--foreground-muted) uppercase">Sufficiency</h5>
                    {evalResult.sufficiency_results.map((s) => (
                      <div key={s.id} className="flex items-start gap-2 text-xs">
                        <span className={s.met ? "text-emerald-600" : "text-rose-600"}>{s.met ? "✓" : "✗"}</span>
                        <span className="text-foreground">{stripCriteriaPrefix(s.label)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {evalResult.criteria && evalResult.criteria.length > 0 && (
                  <div className="space-y-1">
                    <h5 className="text-[10px] font-bold text-(--foreground-muted) uppercase">Criteria</h5>
                    {evalResult.criteria.filter((c) => shouldShowCriterion(c.label)).map((c) => (
                      <div key={c.id} className="flex items-start gap-2 text-xs">
                        <span className={c.met ? "text-emerald-600" : "text-rose-600"}>{c.met ? "✓" : "✗"}</span>
                        <span className="text-foreground">{stripCriteriaPrefix(c.label)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : <p className="text-xs text-(--foreground-muted) py-4 text-center">No evaluation yet.</p>}
          </div>
        )}

        {activeTab === "notes" && (
          <div className={`flex-1 flex flex-col ${tabContentClass} ${contentMaxHeight} p-3`}>
            <div className="flex-1 overflow-y-auto space-y-3">
              <NoteList
                resourceType="evidence_submission"
                resourceId={submission.id}
                refreshTrigger={notesRefresh}
                emptyMessage="No notes yet. Add a note or reply to the reviewer."
              />
            </div>
            <div className="shrink-0 pt-3 border-t border-(--border) mt-2">
              <NoteInput
                resourceType="evidence_submission"
                resourceId={submission.id}
                placeholder={isReturned ? "Add a reply to the reviewer…" : "Add a note…"}
                onAdded={() => setNotesRefresh((r) => r + 1)}
              />
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className={`flex-1 flex flex-col ${tabContentClass} ${contentMaxHeight} p-3`}>
            <div className="space-y-1.5">
              {review_history.map((rh) => (
                <div key={rh.id} className="flex items-center gap-2 bg-background rounded-lg px-3 py-2 border border-(--border)">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${rh.status === "approved" ? "bg-emerald-500" : rh.status === "returned" ? "bg-rose-500" : rh.status === "hold" ? "bg-slate-500" : "bg-amber-500"}`} />
                  <span className="text-xs font-semibold text-foreground">{normalizeLevel(rh.level)}</span>
                  <span className="text-xs text-(--foreground-muted) capitalize">{rh.status}</span>
                  <span className="text-[10px] text-(--foreground-subtle) ml-auto">{new Date(rh.assigned_at).toLocaleDateString()}{rh.completed_at ? ` → ${new Date(rh.completed_at).toLocaleDateString()}` : ""}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action bar — Return, Hold, Approve; after approval, green Approved control */}
      {canAction && review.status === "approved" && (
        <div className="border-t border-(--border) pt-3 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled
              aria-label="You approved this review"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/40 cursor-default"
            >
              ✓ Approved
            </button>
          </div>
        </div>
      )}
      {canAction && (review.status === "assigned" || review.status === "hold") && (
        <div className="border-t border-(--border) pt-3 flex flex-col gap-2">
          {checklistTotal > 0 && checklistChecked < checklistTotal && (
            <div className="px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[10px] text-amber-700 dark:text-amber-300">
              {checklistChecked}/{checklistTotal} checklist items verified
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onAction?.("return", undefined, checklistState)}
              aria-label="Return for revision"
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 bg-(--surface)"
            >
              Return
            </button>
            <button
              type="button"
              onClick={() => onAction?.("hold", undefined, checklistState)}
              aria-label="Put on hold"
              aria-pressed={review.status === "hold"}
              className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                review.status === "hold"
                  ? "bg-slate-500 border-slate-500 text-white shadow-md"
                  : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/20 bg-(--surface)"
              }`}
            >
              Hold
            </button>
            <button
              type="button"
              onClick={() => onAction?.("approve", undefined, checklistState)}
              disabled={checklistTotal > 0 && checklistChecked < checklistTotal}
              aria-label={checklistTotal > 0 && checklistChecked < checklistTotal ? `Approve (complete ${checklistChecked}/${checklistTotal} checklist items first)` : "Approve"}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Approve
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Section heading for modal */
function ModalSectionHeader({ title, badge }: { title: string; badge?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1 h-8 rounded-full bg-(--primary)" />
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      {badge != null && <span className="text-sm font-medium text-(--foreground-muted) tabular-nums">({badge})</span>}
    </div>
  );
}

interface HistoryEntry {
  id: string;
  submission_id: string;
  version: number;
  changed_by: string | null;
  changed_at: string;
  change_type: string;
  snapshot_before: Record<string, unknown> | null;
  snapshot_after: Record<string, unknown> | null;
  justification: string | null;
  changed_by_name: string | null;
}

function EvidenceEditsHistorySection({ cycleId, submissionId }: { cycleId: string; submissionId: string }) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .get<HistoryEntry[]>(`/assessments/${cycleId}/evidence/${submissionId}/history`)
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [cycleId, submissionId]);
  if (loading) return <section><ModalSectionHeader title="Evidence edits" /><p className="text-sm text-(--foreground-muted)">Loading…</p></section>;
  if (entries.length === 0) return <section><ModalSectionHeader title="Evidence edits" /><p className="text-sm text-(--foreground-muted)">No edit history.</p></section>;
  return (
    <section className="min-h-0 flex flex-col">
      <ModalSectionHeader title="Evidence edits" badge={`${entries.length}`} />
      <div className="space-y-2 max-h-[min(40vh,320px)] overflow-y-auto pr-1">
        {entries.map((e) => (
          <div key={e.id} className="bg-background rounded-xl px-3 py-2.5 border border-(--border)">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-foreground">{e.change_type}</span>
              <span className="text-[10px] text-(--foreground-muted)">v{e.version}</span>
              {e.changed_by_name && <span className="text-[10px] text-(--foreground-subtle)">{e.changed_by_name}</span>}
              <span className="text-[10px] text-(--foreground-subtle) ml-auto">{new Date(e.changed_at).toLocaleString()}</span>
            </div>
            {e.justification && <p className="text-[11px] text-(--foreground-muted) mt-1 italic">{e.justification}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

/** Full-bleed Swift review palette inside the app shell (counters main `px-*` padding). */
function ReviewPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="swift-review-tpl -mx-2 sm:-mx-4 px-2 sm:px-4 -mt-2 sm:-mt-3 -mb-4 sm:-mb-6 pt-2 pb-4 sm:pt-3 sm:pb-6 min-h-[calc(100dvh-7.5rem)] w-auto">
      {children}
    </div>
  );
}

/**
 * Full-screen popup or inline page showing Checklist, Evidence, AI Evaluation, Comments, and History.
 * When inline=true, renders as a full-page view (no overlay); use for Review Queue detail.
 */
export function EvidenceDetailModal({
  cycleId,
  reviewId,
  evidenceItemId,
  userRole,
  onAction,
  onClose,
  inline = false,
}: {
  cycleId: string;
  reviewId: string;
  evidenceItemId?: string;
  userRole: string;
  onAction?: (decision: "approve" | "return" | "hold", comment?: string, checklistResults?: Record<string, { checked: boolean; note?: string | null }>) => void;
  onClose: () => void;
  /** When true, render as full-page content (no modal overlay). Use "Back to Review Queue" instead of close. */
  inline?: boolean;
}) {
  const [data, setData] = useState<ReviewDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [checklistState, setChecklistState] = useState<Record<string, { checked: boolean; note: string }>>({});
  const [savingChecklist, setSavingChecklist] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [notesRefresh, setNotesRefresh] = useState(0);
  const [submissionNotes, setSubmissionNotes] = useState<NoteItem[]>([]);
  const [matrix, setMatrix] = useState<MatrixRow[]>([]);
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [selectedControlId, setSelectedControlId] = useState<string | null>(null);
  const [actioning, setActioning] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "return" | "hold" | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [approveCommentStep, setApproveCommentStep] = useState<"choose" | "collect">("choose");
  const [approveComment, setApproveComment] = useState("");

  const handleAction = useCallback(async (decision: "approve" | "return" | "hold", comment?: string) => {
    setActionType(decision);
    setActioning(true);
    try {
      await Promise.resolve(onAction?.(decision, comment, checklistState));
      onClose();
    } catch {
      // API failed — leave user on page
    } finally {
      setActioning(false);
      setActionType(null);
    }
  }, [checklistState, onAction, onClose]);

  const handleApproveDirectly = useCallback(() => {
    setShowApproveDialog(false);
    setApproveCommentStep("choose");
    setApproveComment("");
    handleAction("approve");
  }, [handleAction]);

  const handleApproveWithComment = useCallback(async () => {
    const commentTrimmed = approveComment.trim();
    if (commentTrimmed) {
      setActioning(true);
      try {
        await api.post(`/reviews/${reviewId}/comments`, { body: commentTrimmed });
      } catch {
        setActioning(false);
        return;
      }
    }
    setShowApproveDialog(false);
    setApproveCommentStep("choose");
    setApproveComment("");
    handleAction("approve", commentTrimmed || undefined);
  }, [approveComment, reviewId, handleAction]);

  const fetchDetail = useCallback(async () => {
    try {
      const query = cycleId ? `?cycle_id=${encodeURIComponent(cycleId)}` : "";
      const resp = await api.get<ReviewDetailData>(`/reviews/${reviewId}/detail${query}`);
      setData(resp);
      const saved = resp.review.checklist_results || {};
      const initial: Record<string, { checked: boolean; note: string }> = {};
      for (const item of resp.checklist || []) {
        const s = saved[item.id] ?? saved[item.control_id];
        const note = (s?.note != null && s.note !== "") ? String(s.note) : "";
        initial[item.id] = { checked: s?.checked ?? false, note };
      }
      setChecklistState(initial);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [reviewId, cycleId]);

  useEffect(() => {
    setLoading(true);
    fetchDetail();
  }, [fetchDetail]);

  const evidenceItemIdForMatrix = data?.submission?.evidence_item_id;
  // Use submission.cycle_id when available so matrix is always filtered by the same cycle as the submission
  const cycleIdForMatrix = data?.submission?.cycle_id ?? cycleId ?? "";
  // Fixed-length deps so array size never changes between renders (React requirement)
  const matrixItemId = evidenceItemIdForMatrix ?? "";
  const matrixCycleId = cycleIdForMatrix;
  useEffect(() => {
    if (!matrixItemId) {
      setMatrix([]);
      setSelectedControlId(null);
      return;
    }
    setMatrixLoading(true);
    const cycleParam = matrixCycleId ? `?cycle_id=${encodeURIComponent(matrixCycleId)}` : "";
    api
      .get<MatrixRow[]>(`/ref/evidence-items/${encodeURIComponent(matrixItemId)}/matrix${cycleParam}`)
      .then((rows) => {
        setMatrix(Array.isArray(rows) ? rows : []);
        setSelectedControlId((prev) => {
          const controlIds = [...new Set((Array.isArray(rows) ? rows : []).map((r) => r.control_id))];
          if (controlIds.length && !prev) return controlIds[0];
          if (controlIds.includes(prev ?? "")) return prev;
          return controlIds[0] ?? null;
        });
      })
      .catch(() => setMatrix([]))
      .finally(() => setMatrixLoading(false));
  }, [matrixItemId, matrixCycleId]);

  const submissionId = data?.submission?.id;
  useEffect(() => {
    if (!submissionId) {
      setSubmissionNotes([]);
      return;
    }
    const params = new URLSearchParams({ resource_type: "evidence_submission", resource_id: submissionId });
    api
      .get<NoteItem[]>(`/notes?${params.toString()}`)
      .then((list) => setSubmissionNotes(Array.isArray(list) ? list : []))
      .catch(() => setSubmissionNotes([]));
  }, [submissionId, notesRefresh]);

  const saveChecklistToServer = useCallback(async (results: Record<string, { checked: boolean; note: string }>) => {
    setSavingChecklist(true);
    try {
      await api.patch(`/reviews/${reviewId}/checklist`, { checklist_results: results });
    } catch {
      /* */
    }
    setSavingChecklist(false);
  }, [reviewId]);

  const toggleChecklistItem = useCallback(
    (itemId: string) => {
      setChecklistState((prev) => {
        const next = { ...prev, [itemId]: { ...prev[itemId], checked: !prev[itemId]?.checked } };
        saveChecklistToServer(next);
        return next;
      });
    },
    [saveChecklistToServer]
  );

  const updateChecklistNote = useCallback((itemId: string, note: string) => {
    setChecklistState((prev) => ({ ...prev, [itemId]: { ...prev[itemId], checked: prev[itemId]?.checked ?? false, note } }));
  }, []);

  const blurChecklistNote = useCallback(() => {
    saveChecklistToServer(checklistState);
  }, [checklistState, saveChecklistToServer]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      await api.post(`/reviews/${reviewId}/comments`, { body: newComment.trim() });
      setNewComment("");
      fetchDetail();
    } catch {
      /* */
    }
    setSubmittingComment(false);
  };

  useEffect(() => {
    if (inline) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, inline]);

  const loadingContent = (
    <div className="bg-(--surface) rounded-2xl shadow-xl flex flex-col overflow-hidden border border-(--border)">
      <div className="p-6 border-b border-(--border)">
        <h1 id="evidence-modal-title" className="text-xl font-bold text-foreground">
          {evidenceItemId ?? "Review"} — Loading…
        </h1>
      </div>
      <div className="flex-1 flex items-center justify-center p-12">
        <p className="text-(--foreground-muted)">Loading details…</p>
      </div>
    </div>
  );

  if (loading) {
    if (inline) {
      return (
        <ReviewPageShell>
          <div className="bg-[var(--surface)] rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-sm)] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-[var(--border)]">
              <h1 id="evidence-modal-title" className="text-xl font-bold text-[var(--text-primary)]">
                {evidenceItemId ?? "Review"} — Loading…
              </h1>
            </div>
            <div className="flex-1 flex items-center justify-center p-12">
              <p className="text-[var(--text-secondary)]">Loading details…</p>
            </div>
          </div>
        </ReviewPageShell>
      );
    }
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="evidence-modal-title">
        <div className="max-w-6xl w-full max-h-[92vh]">{loadingContent}</div>
      </div>
    );
  }

  const errorContent = (
    <div className="bg-(--surface) rounded-2xl shadow-xl flex flex-col overflow-hidden border border-(--border)">
      <div className="p-6 border-b border-(--border) flex items-center justify-between">
        <h1 id="evidence-modal-title" className="text-xl font-bold text-foreground">
          {evidenceItemId ?? "Review"}
        </h1>
        <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-background text-(--foreground-muted)" aria-label={inline ? "Back to Review Queue" : "Close"}>
          {inline ? (
            <span className="text-sm font-medium text-(--primary)">Back to Review Queue</span>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          )}
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center p-12">
        <p className="text-(--foreground-muted)">Could not load details.</p>
      </div>
    </div>
  );

  if (!data) {
    if (inline) {
      return (
        <ReviewPageShell>
          <div className="bg-[var(--surface)] rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-sm)] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
              <h1 id="evidence-modal-title" className="text-xl font-bold text-[var(--text-primary)]">
                {evidenceItemId ?? "Review"}
              </h1>
              <button
                type="button"
                onClick={onClose}
                className="text-sm font-semibold text-[var(--blue)] hover:underline"
                aria-label="Back to Review Queue"
              >
                Back to Review Queue
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-12">
              <p className="text-[var(--text-secondary)]">Could not load details.</p>
            </div>
          </div>
        </ReviewPageShell>
      );
    }
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
        <div className="max-w-6xl w-full max-h-[92vh]">{errorContent}</div>
      </div>
    );
  }

  const { review, submission, attachments, checklist, comments, review_history } = data;
  const evalResult = submission.evaluation_result;
  const formData = submission.form_data || {};
  const formKeys = Object.keys(formData).filter((k) => formData[k]);

  const rLevel = normalizeLevel(review.level);
  const canAction =
    (userRole === "internal_reviewer_l1" && rLevel === "L1") ||
    (userRole === "internal_reviewer_l2" && rLevel === "L2") ||
    (userRole === "external_assessor" && rLevel === "L3") ||
    userRole === "compliance_officer" ||
    userRole === "admin";

  const checklistTotal = checklist?.length ?? 0;
  const checklistChecked = Object.values(checklistState).filter((v) => v.checked).length;
  const isEditable = review.status === "assigned";
  const levelLabel = LEVEL_LABELS[normalizeLevel(review.level)] ?? review.level;
  const levelDisplay = `${normalizeLevel(review.level)} — ${levelLabel}`;

  const controlId = evidenceItemId ?? submission.evidence_item_id ?? "—";
  const evidenceCodeForHeader = matrix[0]?.item_code ?? controlId;

  const statusDotClass =
    review.status === "approved"
      ? "bg-[var(--green)]"
      : review.status === "returned"
        ? "bg-[var(--red)]"
        : review.status === "hold"
          ? "bg-[var(--text-muted)]"
          : "bg-[var(--amber)]";

  const statusBadgeClass = inline
    ? `shrink-0 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold capitalize border ${
        review.status === "approved"
          ? "bg-[var(--green-lt)] text-[var(--green)] border-[var(--green-mid)]"
          : review.status === "returned"
            ? "bg-[var(--red-lt)] text-[var(--red)] border-[var(--red-mid)]"
            : review.status === "hold"
              ? "bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border)]"
              : "bg-[var(--amber-lt)] text-[var(--amber)] border-[var(--amber-mid)]"
      }`
    : `shrink-0 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
        review.status === "approved"
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
          : review.status === "returned"
            ? "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300"
            : review.status === "hold"
              ? "bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-300"
              : "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
      }`;

  const header = (
    <div
      className={
        inline
          ? "shrink-0 flex items-center justify-between gap-6 px-6 sm:px-8 py-4 border-b border-[var(--border)] bg-[var(--surface)]"
          : "shrink-0 flex items-center justify-between gap-6 px-6 sm:px-8 py-4 border-b border-(--border) bg-background"
      }
    >
      <div className="flex items-center gap-4 min-w-0">
        <div
          className={
            inline
              ? "w-12 h-12 rounded-[var(--radius)] flex items-center justify-center text-base font-bold shrink-0 border-2 border-[var(--blue)]/40 bg-[var(--blue-lt)] text-[var(--blue)]"
              : "w-12 h-12 rounded-2xl flex items-center justify-center text-base font-bold shrink-0 border-2 bg-(--primary-muted)/30 border-(--primary)/30 text-(--primary)"
          }
        >
          {evidenceCodeForHeader}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={
                inline
                  ? "text-base font-bold text-[var(--text-primary)] truncate"
                  : "text-base font-bold text-foreground truncate"
              }
            >
              {levelDisplay}
            </span>
            <span className={statusBadgeClass}>
              {inline && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDotClass}`} aria-hidden />}
              {review.status}
            </span>
          </div>
          {submission.submitted_at && (
            <p
              className={
                inline ? "text-xs text-[var(--text-muted)] mt-0.5" : "text-xs text-(--foreground-muted) mt-0.5"
              }
            >
              Submitted · {new Date(submission.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-[var(--radius)] transition-all ${
            inline
              ? "bg-[var(--text-primary)] text-white hover:opacity-90 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]"
              : "border border-(--border) bg-(--surface) text-foreground hover:bg-(--primary-muted)/30 hover:border-(--primary)/40 hover:text-(--primary) rounded-xl"
          }`}
          aria-label={inline ? "Back to Review Queue" : "Close"}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {inline ? "Back to Review Queue" : "Close"}
        </button>
      </div>
    </div>
  );

  const inner = (
    <div className={`flex flex-col ${inline ? "w-full min-h-0 bg-transparent" : "bg-(--surface) rounded-2xl shadow-xl overflow-hidden border border-(--border) max-w-6xl w-full max-h-[92vh]"}`}>
      {header}

        {/* When inline: allow scroll chaining so panel scroll → page scroll; when modal: contain scroll */}
        <div className={inline ? "flex-1 min-h-0 flex flex-col overflow-y-auto overscroll-y-auto" : "flex-1 min-h-0 overflow-y-auto overscroll-contain"}>
          <div className={inline ? "flex flex-col min-h-0 w-full min-w-0" : "p-6 pb-8 space-y-8"}>
            {/* ——— Evidence | Control & AI evaluation ——— */}
            {(() => {
              const controlIds = matrix.length
                ? [...new Set(matrix.map((r) => r.control_id))]
                : [];
              const selectedRow = selectedControlId ? matrix.find((r) => r.control_id === selectedControlId) : null;
              const filterByControl = selectedControlId && selectedRow;
              const sufficiencyForControl =
                evalResult?.sufficiency_results?.filter(
                  (s) => shouldShowCriterion(s.label) && (!filterByControl || s.id === selectedControlId || s.id.startsWith(selectedControlId + "_"))
                ) ?? [];
              const criteriaForControl =
                evalResult?.criteria?.filter(
                  (c) => shouldShowCriterion(c.label) && (!filterByControl || c.id === selectedControlId || c.id.startsWith(selectedControlId + "_"))
                ) ?? [];
              const itemsForControl = [...sufficiencyForControl, ...criteriaForControl];
              const passCount = itemsForControl.filter((i) => i.met).length;
              const failCount = itemsForControl.filter((i) => !i.met).length;
              const perControlStats: Record<string, { met: number; total: number }> = {};
              controlIds.forEach((cid) => {
                const suf = (evalResult?.sufficiency_results ?? []).filter((s) => shouldShowCriterion(s.label) && (s.id === cid || s.id.startsWith(cid + "_")));
                const crit = (evalResult?.criteria ?? []).filter((c) => shouldShowCriterion(c.label) && (c.id === cid || c.id.startsWith(cid + "_")));
                const all = [...suf, ...crit];
                perControlStats[cid] = { met: all.filter((x) => x.met).length, total: all.length };
              });
              const activeControlMet = selectedControlId ? (perControlStats[selectedControlId]?.met ?? 0) : 0;
              const activeControlTotal = selectedControlId ? (perControlStats[selectedControlId]?.total ?? 0) : 0;
              const evidencePillRow = selectedControlId
                ? matrix.find((r) => r.control_id === selectedControlId)
                : matrix[0];
              const evidencePillLabel =
                evidencePillRow?.item_code && evidencePillRow?.evidence_item_name
                  ? `${evidencePillRow.item_code} — ${evidencePillRow.evidence_item_name}`
                  : evidencePillRow?.evidence_item_name ?? null;

              if (inline) {
                return (
                  <div className="flex min-h-0 max-h-[85vh] w-full min-w-0 gap-4 px-1 sm:px-0">
                    {/* Left: Evidence */}
                    <div className="flex-1 flex flex-col min-w-0 min-h-0 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] overflow-hidden">
                      <div className="shrink-0 px-6 sm:px-8 py-3.5 border-b border-[var(--border)] bg-[var(--surface-2)] flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-sm font-bold text-[var(--text-primary)]">Evidence</h2>
                        {evidencePillLabel ? (
                          <span className="inline-flex max-w-[min(100%,20rem)] items-center truncate rounded-full border border-[var(--blue)]/25 bg-[var(--blue-lt)] px-2.5 py-1 text-xs font-semibold text-[var(--blue)]">
                            {evidencePillLabel}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-auto p-6 bg-[var(--surface-2)]/60">
                        <EvidenceDisplayReadOnly
                          evidenceItemId={submission.evidence_item_id}
                          cycleId={submission.cycle_id ?? cycleId}
                          formData={formData}
                          attachments={attachments}
                          onAttachmentClick={(att) => setPreviewAttachment(att)}
                          visualVariant="swiftReview"
                        />
                      </div>
                    </div>
                    {/* Right: AI evaluation */}
                    <div className="w-full min-w-0 flex flex-col min-h-0 md:flex-[0_0_52%] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] overflow-hidden">
                      <div className="shrink-0 px-6 sm:px-8 py-3.5 border-b border-[var(--border)] bg-[var(--surface-2)]">
                        <h2 className="text-sm font-bold text-[var(--text-primary)]">AI evaluation results</h2>
                      </div>
                      <div className="flex-1 min-h-0 overflow-hidden p-4 sm:p-5 flex flex-col bg-[var(--surface-2)]/40">
                        <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
                          <AiEvaluationResult
                            result={evalResult ? { ...evalResult, evidence_item_id: submission.evidence_item_id, criteria: evalResult.criteria ?? [], overall_met: evalResult.overall_met ?? false } : null}
                            loading={false}
                            placeholder={false}
                            editable={false}
                            evaluationEdits={submission.evaluation_edits ?? {}}
                            submissionId={submission.id}
                            notesRefreshTrigger={notesRefresh}
                            onNoteAdded={() => setNotesRefresh((r) => r + 1)}
                            hideAiHint={false}
                            visualVariant="swiftReview"
                            showTitle={false}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <section className="flex flex-col rounded-xl border border-(--border) bg-white dark:bg-(--surface) shadow-sm overflow-hidden">
                    <div className="shrink-0 px-5 py-4 border-b border-(--border) bg-slate-50/80 dark:bg-background/50">
                      <h2 className="text-sm font-bold text-foreground">Evidence</h2>
                    </div>
                    <div className="p-5 bg-slate-50/30 dark:bg-transparent">
                      <EvidenceDisplayReadOnly
                        evidenceItemId={submission.evidence_item_id}
                        cycleId={submission.cycle_id ?? cycleId}
                        formData={formData}
                        attachments={attachments}
                        onAttachmentClick={(att) => setPreviewAttachment(att)}
                      />
                    </div>
                  </section>
                  <section className="flex flex-col rounded-xl border border-(--border) bg-white dark:bg-(--surface) shadow-sm overflow-hidden">
                    <div className="shrink-0 px-5 py-4 border-b border-(--border) bg-slate-50/80 dark:bg-background/50">
                      <h2 className="text-sm font-bold text-foreground">AI evaluation results</h2>
                    </div>
                    <div className="p-5 bg-slate-50/30 dark:bg-transparent flex flex-col min-h-0 max-h-[min(60vh,500px)]">
                      <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
                        <AiEvaluationResult
                          result={evalResult ? { ...evalResult, evidence_item_id: submission.evidence_item_id, criteria: evalResult.criteria ?? [], overall_met: evalResult.overall_met ?? false } : null}
                          loading={false}
                          placeholder={false}
                          editable={false}
                          evaluationEdits={submission.evaluation_edits ?? {}}
                          submissionId={submission.id}
                          notesRefreshTrigger={notesRefresh}
                          onNoteAdded={() => setNotesRefresh((r) => r + 1)}
                          hideAiHint={true}
                          showTitle={false}
                        />
                      </div>
                    </div>
                  </section>
                </div>
              );
            })()}

            {/* ——— Comments from reviewers (e.g. L1 comment for L2) + Review history ——— */}
            <div
              className={
                inline
                  ? "pt-8 px-4 sm:px-6 pb-8 mx-1 sm:mx-0 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-xs)] mt-6"
                  : "pt-8"
              }
            >
              {comments.length > 0 && (
                <section className="mb-8">
                  <div className="pb-3 border-b border-(--border)/80">
                    <h2 className="text-sm font-semibold text-foreground">Comments from reviewers</h2>
                    <p className="text-[11px] text-(--foreground-muted) mt-0.5">Comments from previous review levels for the next reviewer</p>
                  </div>
                  <div className="pt-4 space-y-3">
                    {comments.map((c) => (
                      <div key={c.id} className="py-3 px-0 border-b border-(--border)/50 last:border-b-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-foreground">
                            {c.level ? `${c.level} reviewer` : c.author_name || c.author_id.slice(0, 8)}
                          </span>
                          <span className="text-[10px] text-(--foreground-muted)">{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed" style={{ lineHeight: 1.5 }}>{c.body}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              <section>
                <div className="pb-3 border-b border-(--border)/80">
                  <h2 className="text-sm font-semibold text-foreground">Review history</h2>
                </div>
                <div className="pt-4 space-y-2">
                  {review_history.map((rh) => (
                    <div key={rh.id} className="flex items-center gap-3 py-2.5 border-b border-(--border)/50 last:border-b-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${rh.status === "approved" ? "bg-emerald-500" : rh.status === "returned" ? "bg-rose-500" : rh.status === "hold" ? "bg-slate-500" : "bg-amber-500"}`} />
                      <span className="text-xs font-semibold text-foreground">{normalizeLevel(rh.level)}</span>
                      <span className="text-xs text-(--foreground-muted) capitalize">{rh.status}</span>
                      <span className="text-[10px] text-(--foreground-subtle) ml-auto whitespace-nowrap">{new Date(rh.assigned_at).toLocaleDateString()}{rh.completed_at ? ` → ${new Date(rh.completed_at).toLocaleDateString()}` : ""}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Decision buttons: below Comments (inline). After approval, show green Approved control. */}
            {canAction &&
              inline &&
              (review.status === "approved" || review.status === "assigned" || review.status === "hold") && (
              <div className="px-6 pb-8 pt-2">
                {review.status === "approved" ? (
                  <div className="max-w-xs">
                    <button
                      type="button"
                      disabled
                      aria-label="You approved this review"
                      className="flex w-full items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-emerald-600 text-white shadow-lg shadow-emerald-100 dark:shadow-emerald-900/30 ring-2 ring-emerald-500/40 cursor-default"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Approved
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 max-w-2xl">
                    <button
                      type="button"
                      onClick={() => handleAction("return")}
                      disabled={actioning}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border transition-all ${actionType === "return" ? "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-100 dark:shadow-rose-900/30" : "bg-(--surface) border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:shadow-sm"}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                      Return
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction("hold")}
                      disabled={actioning}
                      aria-pressed={review.status === "hold"}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border transition-all ${
                        actionType === "hold" || review.status === "hold"
                          ? "bg-slate-500 border-slate-500 text-white shadow-lg shadow-slate-100 dark:shadow-slate-900/30"
                          : "bg-(--surface) border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/20 hover:shadow-sm"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Hold
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowApproveDialog(true)}
                      disabled={actioning}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border transition-all ${actionType === "approve" ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100 dark:shadow-emerald-900/30" : "bg-(--surface) border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:shadow-sm"}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Approve
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Action bar — at bottom of scroll (modal only). After approval, green Approved control. */}
            {canAction &&
              !inline &&
              (review.status === "approved" || review.status === "assigned" || review.status === "hold") && (
              <div className="border-t border-(--border)/80 pt-8 flex flex-col gap-3">
                {review.status === "approved" ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled
                      aria-label="You approved this review"
                      className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500/40 cursor-default"
                    >
                      ✓ Approved
                    </button>
                  </div>
                ) : (
                  <>
                    {checklistTotal > 0 && checklistChecked < checklistTotal && (
                      <div className="px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-300">
                        {checklistChecked}/{checklistTotal} checklist items verified
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleAction("return")}
                        disabled={actioning}
                        className="px-5 py-2.5 text-sm font-semibold rounded-lg border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 bg-(--surface) disabled:opacity-60"
                      >
                        Return
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction("hold")}
                        disabled={actioning}
                        aria-pressed={review.status === "hold"}
                        className={`px-5 py-2.5 text-sm font-semibold rounded-lg border transition-colors disabled:opacity-60 ${
                          review.status === "hold"
                            ? "bg-slate-500 border-slate-500 text-white shadow-md"
                            : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/20 bg-(--surface)"
                        }`}
                      >
                        Hold
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowApproveDialog(true)}
                        disabled={actioning || (checklistTotal > 0 && checklistChecked < checklistTotal)}
                        className={`px-5 py-2.5 text-sm font-semibold rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                          actionType === "approve" && actioning
                            ? "bg-emerald-600 ring-2 ring-emerald-400/60"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                      >
                        Approve
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Approve dialog: optional comment for next reviewer */}
            {showApproveDialog && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="approve-dialog-title">
                <div className="bg-(--surface) rounded-2xl shadow-xl border border-(--border) max-w-md w-full p-6">
                  <h2 id="approve-dialog-title" className="text-lg font-semibold text-foreground mb-1">Approve and move to next review</h2>
                  <p className="text-sm text-(--foreground-muted) mb-6">Do you have any comments for the next reviewer?</p>
                  {approveCommentStep === "choose" ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={handleApproveDirectly}
                        disabled={actioning}
                        className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold border border-(--border) bg-(--surface) text-foreground hover:bg-(--border)/50 disabled:opacity-50"
                      >
                        No, approve directly
                      </button>
                      <button
                        type="button"
                        onClick={() => setApproveCommentStep("collect")}
                        disabled={actioning}
                        className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold bg-(--primary) text-white hover:opacity-90 disabled:opacity-50"
                      >
                        Yes, add a comment
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <textarea
                        value={approveComment}
                        onChange={(e) => setApproveComment(e.target.value)}
                        placeholder="Add a comment for the next reviewer…"
                        rows={4}
                        className="w-full text-sm border border-(--border) rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--primary)/30 bg-background resize-y"
                      />
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => { setApproveCommentStep("choose"); setApproveComment(""); }}
                          disabled={actioning}
                          className="px-4 py-2.5 rounded-lg text-sm font-medium border border-(--border) text-foreground hover:bg-(--border)/50 disabled:opacity-50"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleApproveWithComment}
                          disabled={actioning}
                          className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {approveComment.trim() ? "Add comment & Approve" : "Approve"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {previewAttachment && typeof document !== "undefined" && createPortal(
          <EvidenceFileViewerModal
            attachment={previewAttachment}
            submissionId={data?.submission?.id}
            onClose={() => setPreviewAttachment(null)}
          />,
          document.body
        )}
      </div>
  );

  if (inline) {
    return <ReviewPageShell>{inner}</ReviewPageShell>;
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {inner}
    </div>
  );
}
