"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { api } from "@/lib/api";
import { stripCriteriaPrefix, shouldShowCriterion } from "@/lib/utils";
import { getEvidenceFieldLabel, getOrderedEvidenceKeys, getEvidenceTableColumnLabels } from "@/lib/data/evidence-review-labels";
import { NoteList } from "@/components/notes/note-list";
import { NoteInput } from "@/components/notes/note-input";

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

/** Renders one AI result line plus threaded notes scoped to that criterion. */
function CriterionNoteBlock({
  submissionId,
  criterionId,
  label,
  met,
  description,
  refreshTrigger,
  onNoteAdded,
}: {
  submissionId: string;
  criterionId: string;
  label: string;
  met: boolean;
  description?: string | null;
  refreshTrigger: number;
  onNoteAdded?: () => void;
}) {
  return (
    <div className="rounded-xl border border-(--border) bg-(--surface) p-3 space-y-2">
      <div className="flex items-start gap-2 text-sm">
        <span className={met ? "text-emerald-600" : "text-rose-600"}>{met ? "✓" : "✗"}</span>
        <div className="flex-1 min-w-0">
          <span className="text-foreground">{stripCriteriaPrefix(label)}</span>
          {description && <p className="text-xs text-(--foreground-muted) mt-1">{description}</p>}
        </div>
      </div>
      <div className="pl-4 border-l-2 border-(--border) space-y-2">
        <NoteList
          resourceType="evidence_submission"
          resourceId={submissionId}
          criterionId={criterionId}
          refreshTrigger={refreshTrigger}
          emptyMessage="No notes on this criterion yet."
        />
        <NoteInput
          resourceType="evidence_submission"
          resourceId={submissionId}
          criterionId={criterionId}
          placeholder="Add a note for the reviewer or submitter…"
          onAdded={onNoteAdded}
        />
      </div>
    </div>
  );
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

type ParsedFormValue =
  | { kind: "table"; rows: Record<string, unknown>[]; columns: string[] }
  | { kind: "text"; text: string };

function parseFormValue(raw: string | null | undefined): ParsedFormValue {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (!s) return { kind: "text", text: "" };
  if (s.startsWith("[") || s.startsWith("{")) {
    try {
      const data = JSON.parse(s) as unknown;
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object" && data[0] !== null) {
        const rows = data as Record<string, unknown>[];
        const columns = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
        return { kind: "table", rows, columns };
      }
      if (typeof data === "object" && data !== null && !Array.isArray(data)) {
        const rows = [data as Record<string, unknown>];
        const columns = Object.keys(rows[0]);
        return { kind: "table", rows, columns };
      }
    } catch {
      /* fall through to text */
    }
  }
  return { kind: "text", text: raw ?? "" };
}

function EvidenceFieldValue({
  value,
  columnLabels,
}: {
  value: string | null | undefined;
  columnLabels?: Record<string, string> | null;
}) {
  const parsed = parseFormValue(value);
  if (parsed.kind === "table") {
    const { rows, columns } = parsed;
    const getLabel = (col: string) => (columnLabels && columnLabels[col]) || col.replace(/_/g, " ");
    return (
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="w-full min-w-[400px] text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800">
              {columns.map((col) => (
                <th key={col} className="py-2 px-3 font-semibold text-foreground border-b border-slate-200 dark:border-slate-700">
                  {getLabel(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0 bg-(--surface)">
                {columns.map((col) => (
                  <td key={col} className="py-2 px-3 text-foreground align-top">
                    {row[col] != null ? String(row[col]) : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <span className="whitespace-pre-wrap text-foreground leading-relaxed">
      {parsed.text}
    </span>
  );
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

const LEVEL_LABELS: Record<string, string> = { L1: "Completeness", L2: "Quality", L3: "Assessment" };
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
  onAction?: (decision: "approve" | "return", comment?: string, checklistResults?: Record<string, { checked: boolean; note?: string | null }>) => void;
}) {
  const [data, setData] = useState<ReviewDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [actionComment, setActionComment] = useState("");
  const [checklistState, setChecklistState] = useState<Record<string, { checked: boolean; note: string }>>({});
  const [savingChecklist, setSavingChecklist] = useState(false);
  const [activeTab, setActiveTab] = useState<"checklist" | "evidence" | "evaluation" | "comments" | "notes" | "history">("checklist");
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

  const canAction =
    (userRole === "internal_reviewer" && (review.level === "L1" || review.level === "L2")) ||
    (userRole === "external_assessor" && review.level === "L3") ||
    userRole === "compliance_officer" ||
    userRole === "admin";

  const checklistTotal = checklist?.length ?? 0;
  const checklistChecked = Object.values(checklistState).filter((v) => v.checked).length;
  const isEditable = review.status === "assigned";

  const levelLabel = LEVEL_LABELS[normalizeLevel(review.level)] ?? review.level;
  const levelDisplay = `${normalizeLevel(review.level)} — ${levelLabel}`;

  const isReturned = submission.status === "returned" || String(submission.status || "").includes("returned");
  const TABS = [
    { id: "checklist" as const, label: "Checklist", badge: `${checklistChecked}/${checklistTotal}${savingChecklist ? " …" : ""}` },
    { id: "evidence" as const, label: "Evidence", badge: `${formKeys.length} fields, ${attachments.length} files` },
    { id: "evaluation" as const, label: "AI Evaluation", badge: evalResult ? (evalResult.overall_met ? "Met" : "Not met") : "—" },
    { id: "comments" as const, label: "Comments", badge: `${comments.length}` },
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
        {activeTab === "checklist" && (
          <div className={`flex-1 flex flex-col ${tabContentClass} ${contentMaxHeight}`}>
            {/* Checklist: dedicated section header */}
            <div className="shrink-0 px-4 py-3 border-b border-(--border) bg-background/50">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-foreground">Checklist</h3>
                <span className="text-xs font-medium tabular-nums text-(--foreground-muted)">
                  {checklistChecked} of {checklistTotal} verified{savingChecklist ? " …" : ""}
                </span>
              </div>
              <p className="text-[10px] text-(--foreground-subtle) mt-0.5">Verify each control and add notes as needed.</p>
            </div>
            {checklist.length > 0 ? (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {checklist.map((item) => {
                  const state = checklistState[item.id] || { checked: false, note: "" };
                  const cj = item.check_json;
                  const subChecks = cj?.checks ?? [];
                  const controlLabel = item.mandatory_advisory ? `${item.control_id} (${item.mandatory_advisory})` : item.control_id;
                  return (
                    <article
                      key={item.id}
                      className="flex flex-col rounded-xl border border-(--border) overflow-hidden bg-(--surface)"
                    >
                      {/* Card header: checkbox + single control badge (id + M) + name */}
                      <div className="flex items-start gap-3 p-4 pb-2">
                        <button
                          type="button"
                          disabled={!isEditable}
                          onClick={() => toggleChecklistItem(item.id)}
                          className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${state.checked ? "bg-emerald-500 border-emerald-600 text-white" : "border-(--border-strong) bg-(--surface) hover:border-foreground"} ${!isEditable ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          {state.checked && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                          <span className="text-[11px] font-semibold text-foreground bg-background border border-(--border) px-2 py-0.5 rounded-md inline-block w-fit">
                            {controlLabel}
                          </span>
                          <h4 className="text-sm font-semibold text-foreground leading-tight">{item.control_name}</h4>
                        </div>
                      </div>
                      {/* Task / document (legacy) */}
                      {(cj?.task || cj?.document) && (
                        <div className="px-4 pb-1">
                          <p className="text-[11px] text-foreground">
                            {[cj.task, cj.document].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                      )}
                      {/* New format: sections + checks */}
                      {Array.isArray(cj?.checklist) && cj.checklist.length > 0 ? (
                        <div className="px-4 pb-3 space-y-3">
                          {cj.action && (cj.action.return || cj.action.approve) && (
                            <p className="text-[10px] text-(--foreground-subtle) italic">
                              {[cj.action.return, cj.action.approve].filter(Boolean).join(" · ")}
                            </p>
                          )}
                          {cj.checklist.map((sec, idx) => (
                            <div key={idx}>
                              <h5 className="text-[11px] font-semibold text-foreground mb-1">{sec.section}</h5>
                              <ul className="space-y-1 pl-3 border-l-2 border-(--border) list-none">
                                {(sec.checks || []).map((line, i) => (
                                  <li key={i} className="text-[11px] leading-snug text-foreground">{line}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          {/* Check text (legacy/summary) */}
                          <div className="px-4 pb-2">
                            <p className="text-xs text-foreground leading-relaxed" style={{ lineHeight: 1.5 }}>
                              {item.check_text}
                            </p>
                          </div>
                          {/* Legacy sub-checks */}
                          {subChecks.length > 0 && (
                            <div className="px-4 pb-3">
                              <ul className="space-y-2 pl-3 border-l-2 border-(--border)">
                                {subChecks.map((sub) => (
                                  <li key={sub.id} className="text-[11px] leading-snug text-foreground">
                                    <span className="font-semibold">{sub.check}</span>
                                    <span> — {sub.description}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      )}
                      {/* Note */}
                      <div className="mt-auto px-4 pb-4 pt-2 border-t border-(--border)">
                        {isEditable ? (
                          <input
                            type="text"
                            value={state.note}
                            onChange={(e) => updateChecklistNote(item.id, e.target.value)}
                            onBlur={blurChecklistNote}
                            placeholder="Note…"
                            className="w-full text-xs border border-(--border) rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--primary)/30 bg-background text-foreground placeholder:text-(--foreground-subtle)"
                          />
                        ) : state.note ? (
                          <p className="text-xs text-foreground italic border-l-2 border-(--border) pl-3 py-1">{state.note}</p>
                        ) : (
                          <p className="text-[11px] text-foreground italic">No note</p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <p className="text-sm text-(--foreground-muted)">No checklist items.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "evidence" && (
          <div className={`flex-1 flex flex-col ${tabContentClass} ${contentMaxHeight}`}>
            {/* Evidence: section header */}
            <div className="shrink-0 px-4 py-3 border-b border-(--border) bg-background/50">
              <h3 className="text-sm font-bold text-foreground">Evidence</h3>
              <p className="text-[10px] text-(--foreground-subtle) mt-0.5">
                Form data and attachments for this submission.
              </p>
            </div>
            <div className="flex-1 p-4 flex flex-col gap-6 overflow-y-auto">
              {formKeys.length > 0 && (() => {
                const orderedFormKeys = getOrderedEvidenceKeys(submission.evidence_item_id, formKeys);
                return (
                  <section className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 rounded-full bg-(--primary)/60" />
                      <h4 className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                        Form data
                      </h4>
                      <span className="text-[10px] font-medium text-(--foreground-muted) tabular-nums">({orderedFormKeys.length} fields)</span>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr>
                            <th className="w-[min(200px,38%)] py-3 px-4 text-[11px] font-bold text-slate-100 uppercase tracking-wider bg-slate-600 dark:bg-slate-700 border-b border-slate-500 dark:border-slate-600">
                              Field
                            </th>
                            <th className="py-3 px-4 text-[11px] font-bold text-slate-100 uppercase tracking-wider bg-slate-600 dark:bg-slate-700 border-b border-slate-500 dark:border-slate-600">
                              Response
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderedFormKeys.map((key) => (
                            <tr key={key} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0 bg-(--surface)">
                              <td className="w-[min(200px,38%)] py-3.5 px-4 align-top border-r border-slate-200 dark:border-slate-700">
                                <span className="text-[11px] font-semibold text-foreground">
                                  {getEvidenceFieldLabel(submission.evidence_item_id, key)}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-xs align-top">
                                <EvidenceFieldValue
                                  value={formData[key]}
                                  columnLabels={getEvidenceTableColumnLabels(submission.evidence_item_id, key)}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                );
              })()}
              {attachments.length > 0 && (
                <section className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full bg-(--primary)/60" />
                    <h4 className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                      Attachments
                    </h4>
                    <span className="text-[10px] font-medium text-(--foreground-muted) tabular-nums">({attachments.length} files)</span>
                  </div>
                  <div className="rounded-xl border border-(--border) bg-(--surface) overflow-hidden shadow-(--shadow)">
                    <ul className="divide-y divide-(--border)">
                      {attachments.map((att) => (
                        <li key={att.id} className="flex items-center gap-4 px-4 py-3.5 hover:bg-background/50 transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-background border border-(--border) flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-(--foreground-muted)" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            {att.url ? (
                              <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-foreground hover:text-(--primary) hover:underline truncate block">
                                {att.file_name}
                              </a>
                            ) : (
                              <span className="text-xs font-semibold text-foreground truncate block">{att.file_name}</span>
                            )}
                            <span className="text-[10px] text-(--foreground-muted) mt-0.5 block">{formatBytes(att.file_size_bytes)}</span>
                          </div>
                          {att.url && (
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-(--border) bg-background text-foreground hover:bg-(--primary-muted) hover:border-(--primary)/40 hover:text-(--primary) transition-colors"
                            >
                              Open
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}
              {formKeys.length === 0 && attachments.length === 0 && (
                <div className="flex-1 flex items-center justify-center p-8">
                  <p className="text-sm text-(--foreground-muted)">No form data or attachments.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "evaluation" && (
          <div className={`flex-1 flex flex-col ${tabContentClass} ${contentMaxHeight} p-3`}>
            {evalResult ? (
              <div className="space-y-3">
                {evalResult.summary && <div className="bg-(--info-bg) border border-(--info)/30 rounded-lg p-3 text-xs leading-relaxed" style={{ lineHeight: 1.5 }}>{evalResult.summary}</div>}
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

        {activeTab === "comments" && (
          <div className={`flex-1 flex flex-col ${tabContentClass} ${contentMaxHeight} p-3`}>
            <div className="space-y-2 flex-1">
              {comments.map((c) => (
                <div key={c.id} className="bg-background rounded-lg p-3 border border-(--border)">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-foreground">{c.author_name || c.author_id.slice(0, 8)}</span>
                    <span className="text-[10px] text-(--foreground-muted)">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed" style={{ lineHeight: 1.5 }}>{c.body}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2 shrink-0 border-t border-(--border) mt-2">
              <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment…"
                className="flex-1 text-xs border border-(--border) rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--primary)/30 bg-(--surface)" />
              <button onClick={handleAddComment} disabled={!newComment.trim() || submittingComment}
                className="px-3 py-2 bg-(--primary) text-white text-xs font-medium rounded-lg hover:opacity-90 disabled:opacity-50">Post</button>
            </div>
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
                  <div className={`w-2 h-2 rounded-full shrink-0 ${rh.status === "approved" ? "bg-emerald-500" : rh.status === "returned" ? "bg-rose-500" : "bg-amber-500"}`} />
                  <span className="text-xs font-semibold text-foreground">{normalizeLevel(rh.level)}</span>
                  <span className="text-xs text-(--foreground-muted) capitalize">{rh.status}</span>
                  <span className="text-[10px] text-(--foreground-subtle) ml-auto">{new Date(rh.assigned_at).toLocaleDateString()}{rh.completed_at ? ` → ${new Date(rh.completed_at).toLocaleDateString()}` : ""}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action bar — always visible at bottom */}
      {canAction && review.status === "assigned" && (
        <div className="border-t border-(--border) pt-3 flex flex-col gap-2">
          {checklistTotal > 0 && checklistChecked < checklistTotal && (
            <div className="px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[10px] text-amber-700 dark:text-amber-300">
              {checklistChecked}/{checklistTotal} checklist items verified
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <input type="text" value={actionComment} onChange={(e) => setActionComment(e.target.value)} placeholder="Comment (optional)…"
              className="flex-1 min-w-[140px] text-xs border border-(--border) rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--primary)/30 bg-(--surface)" />
            <button
              type="button"
              onClick={async () => {
                if (actionComment.trim()) await api.post(`/reviews/${reviewId}/comments`, { body: actionComment.trim() });
                onAction?.("approve", actionComment, checklistState);
              }}
              disabled={checklistTotal > 0 && checklistChecked < checklistTotal}
              aria-label={checklistTotal > 0 && checklistChecked < checklistTotal ? `Approve (complete ${checklistChecked}/${checklistTotal} checklist items first)` : "Approve"}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={async () => {
                if (actionComment.trim()) await api.post(`/reviews/${reviewId}/comments`, { body: actionComment.trim() });
                onAction?.("return", actionComment, checklistState);
              }}
              aria-label="Return for revision"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600"
            >
              Return
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

/**
 * Full-screen popup showing Checklist, Evidence, AI Evaluation, Comments, and History
 * in one scrollable view at large scale. Replaces the tabbed inline view.
 */
export function EvidenceDetailModal({
  cycleId,
  reviewId,
  evidenceItemId,
  userRole,
  onAction,
  onClose,
}: {
  cycleId: string;
  reviewId: string;
  evidenceItemId?: string;
  userRole: string;
  onAction?: (decision: "approve" | "return", comment?: string, checklistResults?: Record<string, { checked: boolean; note?: string | null }>) => void;
  onClose: () => void;
}) {
  const [data, setData] = useState<ReviewDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [actionComment, setActionComment] = useState("");
  const [checklistState, setChecklistState] = useState<Record<string, { checked: boolean; note: string }>>({});
  const [savingChecklist, setSavingChecklist] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [notesRefresh, setNotesRefresh] = useState(0);
  const [matrix, setMatrix] = useState<MatrixRow[]>([]);
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [selectedControlId, setSelectedControlId] = useState<string | null>(null);

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

  const evidenceItemIdForMatrix = data?.submission?.evidence_item_id;
  useEffect(() => {
    if (!evidenceItemIdForMatrix) {
      setMatrix([]);
      setSelectedControlId(null);
      return;
    }
    setMatrixLoading(true);
    api
      .get<MatrixRow[]>(`/ref/evidence-items/${encodeURIComponent(evidenceItemIdForMatrix)}/matrix`)
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
  }, [evidenceItemIdForMatrix]);

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
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="evidence-modal-title">
        <div className="bg-(--surface) rounded-2xl shadow-xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden">
          <div className="p-6 border-b border-(--border)">
            <h1 id="evidence-modal-title" className="text-xl font-bold text-foreground">
              {evidenceItemId ?? "Review"} — Loading…
            </h1>
          </div>
          <div className="flex-1 flex items-center justify-center p-12">
            <p className="text-(--foreground-muted)">Loading details…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
        <div className="bg-(--surface) rounded-2xl shadow-xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden">
          <div className="p-6 border-b border-(--border) flex items-center justify-between">
            <h1 id="evidence-modal-title" className="text-xl font-bold text-foreground">
              {evidenceItemId ?? "Review"}
            </h1>
            <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-background text-(--foreground-muted)" aria-label="Close">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-12">
            <p className="text-(--foreground-muted)">Could not load details.</p>
          </div>
        </div>
      </div>
    );
  }

  const { review, submission, attachments, checklist, comments, review_history } = data;
  const evalResult = submission.evaluation_result;
  const formData = submission.form_data || {};
  const formKeys = Object.keys(formData).filter((k) => formData[k]);

  const canAction =
    (userRole === "internal_reviewer" && (review.level === "L1" || review.level === "L2")) ||
    (userRole === "external_assessor" && review.level === "L3") ||
    userRole === "compliance_officer" ||
    userRole === "admin";

  const checklistTotal = checklist?.length ?? 0;
  const checklistChecked = Object.values(checklistState).filter((v) => v.checked).length;
  const isEditable = review.status === "assigned";
  const levelLabel = LEVEL_LABELS[normalizeLevel(review.level)] ?? review.level;
  const levelDisplay = `${normalizeLevel(review.level)} — ${levelLabel}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-(--surface) rounded-2xl shadow-xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-(--border)">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between gap-4 px-6 py-4 border-b border-(--border) bg-background/50">
          <div className="flex items-center gap-3 min-w-0">
            <h1 id="evidence-modal-title" className="text-xl font-bold text-foreground truncate">
              {evidenceItemId ?? submission.evidence_item_id ?? "Review"}
            </h1>
            <span className="shrink-0 text-sm font-medium text-(--foreground-muted)">{levelDisplay}</span>
            <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${review.status === "approved" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300" : review.status === "returned" ? "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300" : "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"}`}>
              {review.status}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-2 rounded-lg hover:bg-background text-(--foreground-muted) hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body — left: evidence list, right: control + AI; bottom: checklist, notes, actions */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-6 space-y-6">
            {/* ——— Left: Evidence list | Right: Control pills + Sufficiency + Criteria + AI (per-criterion notes) ——— */}
            {(() => {
              const controlIds = matrix.length
                ? [...new Set(matrix.map((r) => r.control_id))]
                : [];
              const selectedRow = selectedControlId ? matrix.find((r) => r.control_id === selectedControlId) : null;
              const filterByControl = selectedControlId && selectedRow;
              const sufficiencyForControl =
                evalResult?.sufficiency_results?.filter(
                  (s) => !filterByControl || s.id === selectedControlId || s.id.startsWith(selectedControlId + "_")
                ) ?? [];
              const criteriaForControl =
                evalResult?.criteria?.filter(
                  (c) => shouldShowCriterion(c.label) && (!filterByControl || c.id === selectedControlId || c.id.startsWith(selectedControlId + "_"))
                ) ?? [];
              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  {/* Left: Evidence list */}
                  <section className="min-h-0 flex flex-col rounded-xl border border-(--border) bg-(--surface) overflow-hidden">
                    <div className="shrink-0 px-4 py-3 border-b border-(--border) bg-background/50">
                      <h2 className="text-sm font-bold text-foreground">Evidence</h2>
                      <p className="text-[10px] text-(--foreground-subtle) mt-0.5">Form data and attachments.</p>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[min(50vh,400px)] p-4 space-y-4 pr-1">
                      {formKeys.length > 0 && (() => {
                        const orderedFormKeys = getOrderedEvidenceKeys(submission.evidence_item_id, formKeys);
                        return (
                          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md">
                            <table className="w-full text-left border-collapse text-sm">
                              <thead>
                                <tr>
                                  <th className="w-[min(180px,38%)] py-3 px-4 text-xs font-bold text-slate-100 uppercase tracking-wider bg-slate-600 dark:bg-slate-700 border-b border-slate-500">Field</th>
                                  <th className="py-3 px-4 text-xs font-bold text-slate-100 uppercase tracking-wider bg-slate-600 dark:bg-slate-700 border-b border-slate-500">Response</th>
                                </tr>
                              </thead>
                              <tbody>
                                {orderedFormKeys.map((key) => (
                                  <tr key={key} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0 bg-(--surface)">
                                    <td className="w-[min(180px,38%)] py-3 px-4 align-top border-r border-slate-200 dark:border-slate-700 text-xs font-semibold text-foreground">
                                      {getEvidenceFieldLabel(submission.evidence_item_id, key)}
                                    </td>
                                    <td className="py-3 px-4 text-xs align-top">
                                      <EvidenceFieldValue value={formData[key]} columnLabels={getEvidenceTableColumnLabels(submission.evidence_item_id, key)} />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      })()}
                      {attachments.length > 0 && (
                        <ul className="divide-y divide-(--border) rounded-xl border border-(--border) overflow-hidden">
                          {attachments.map((att) => (
                            <li
                              key={att.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => setPreviewAttachment(att)}
                              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setPreviewAttachment(att))}
                              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-(--primary-muted)/30 active:bg-(--primary-muted)/50 transition-colors"
                            >
                              <div className="w-10 h-10 rounded-lg bg-background border border-(--border) flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 text-(--foreground-muted)" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-xs font-semibold text-foreground truncate block">{att.file_name}</span>
                                <span className="text-[10px] text-(--foreground-muted) mt-0.5 block">{formatBytes(att.file_size_bytes)}</span>
                              </div>
                              <button type="button" onClick={(e) => { e.stopPropagation(); setPreviewAttachment(att); }} className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border border-(--primary)/50 bg-(--primary-muted)/50 text-(--primary) hover:bg-(--primary-muted) hover:border-(--primary) transition-colors">View</button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {formKeys.length === 0 && attachments.length === 0 && <p className="text-sm text-(--foreground-muted) py-3">No form data or attachments.</p>}
                    </div>
                  </section>

                  {/* Right: Control pills + Sufficiency definition + Evaluation criteria + AI results with per-criterion notes */}
                  <section className="min-h-0 flex flex-col rounded-xl border border-(--border) bg-(--surface) overflow-hidden">
                    <div className="shrink-0 px-4 py-3 border-b border-(--border) bg-background/50">
                      <h2 className="text-sm font-bold text-foreground">Control & AI evaluation</h2>
                      <p className="text-[10px] text-(--foreground-subtle) mt-0.5">Sufficiency, criteria, and AI results per control.</p>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[min(50vh,400px)] p-4 space-y-4 pr-1">
                      {controlIds.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {controlIds.map((cid) => (
                            <button
                              key={cid}
                              type="button"
                              onClick={() => setSelectedControlId(cid)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${selectedControlId === cid ? "bg-(--primary) text-white border-(--primary)" : "bg-background border-(--border) text-foreground hover:border-(--primary)/50"}`}
                            >
                              {cid}
                            </button>
                          ))}
                        </div>
                      )}
                      {matrixLoading && <p className="text-xs text-(--foreground-muted)">Loading matrix…</p>}
                      {selectedRow && (
                        <>
                          {selectedRow.sufficiency_criteria && (
                            <div className="rounded-lg border border-(--border) bg-background/50 p-3">
                              <h5 className="text-[10px] font-bold text-(--foreground-muted) uppercase tracking-wider mb-1.5">Sufficiency definition</h5>
                              <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{selectedRow.sufficiency_criteria}</p>
                            </div>
                          )}
                          {selectedRow.evaluation_criteria && (
                            <div className="rounded-lg border border-(--border) bg-background/50 p-3">
                              <h5 className="text-[10px] font-bold text-(--foreground-muted) uppercase tracking-wider mb-1.5">Evaluation criteria</h5>
                              <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{selectedRow.evaluation_criteria}</p>
                            </div>
                          )}
                        </>
                      )}
                      {evalResult?.summary && (
                        <div className="bg-(--info-bg) border border-(--info)/30 rounded-lg p-3 text-xs leading-relaxed" style={{ lineHeight: 1.6 }}>{evalResult.summary}</div>
                      )}
                      {(sufficiencyForControl.length > 0 || criteriaForControl.length > 0) ? (
                        <div className="space-y-3">
                          {sufficiencyForControl.map((s) => (
                            <CriterionNoteBlock
                              key={s.id}
                              submissionId={submission.id}
                              criterionId={s.id}
                              label={s.label}
                              met={s.met}
                              description={null}
                              refreshTrigger={notesRefresh}
                              onNoteAdded={() => setNotesRefresh((r) => r + 1)}
                            />
                          ))}
                          {criteriaForControl.map((c) => (
                            <CriterionNoteBlock
                              key={c.id}
                              submissionId={submission.id}
                              criterionId={c.id}
                              label={c.label}
                              met={c.met}
                              description={c.description ?? null}
                              refreshTrigger={notesRefresh}
                              onNoteAdded={() => setNotesRefresh((r) => r + 1)}
                            />
                          ))}
                        </div>
                      ) : evalResult ? (
                        <p className="text-xs text-(--foreground-muted)">No sufficiency or criteria for this control.</p>
                      ) : (
                        <p className="text-sm text-(--foreground-muted) py-2">No evaluation yet.</p>
                      )}
                    </div>
                  </section>
                </div>
              );
            })()}

            {/* ——— Bottom: Full-width Checklist ——— */}
            <section className="min-h-0 flex flex-col">
              <ModalSectionHeader title="Checklist" badge={`${checklistChecked}/${checklistTotal}${savingChecklist ? " …" : ""}`} />
              {checklist.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {checklist.map((item) => {
                    const state = checklistState[item.id] || { checked: false, note: "" };
                    const cj = item.check_json;
                    const subChecks = cj?.checks ?? [];
                    const controlLabel = item.mandatory_advisory ? `${item.control_id} (${item.mandatory_advisory})` : item.control_id;
                    return (
                      <article key={item.id} className="flex flex-col rounded-xl border border-(--border) overflow-hidden bg-(--surface)">
                        <div className="flex items-start gap-3 p-4 pb-2">
                          <button
                            type="button"
                            disabled={!isEditable}
                            onClick={() => toggleChecklistItem(item.id)}
                            className={`shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${state.checked ? "bg-emerald-500 border-emerald-600 text-white" : "border-(--border-strong) bg-(--surface) hover:border-foreground"} ${!isEditable ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            {state.checked && (
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          <div className="flex-1 min-w-0 flex flex-col gap-1">
                            <span className="text-sm font-semibold text-foreground bg-background border border-(--border) px-2 py-0.5 rounded-md inline-block w-fit">{controlLabel}</span>
                            <h4 className="text-sm font-semibold text-foreground leading-tight">{item.control_name}</h4>
                          </div>
                        </div>
                        {(cj?.task || cj?.document) && (
                          <div className="px-4 pb-1">
                            <p className="text-xs text-foreground">{[cj.task, cj.document].filter(Boolean).join(" · ")}</p>
                          </div>
                        )}
                        {Array.isArray(cj?.checklist) && cj.checklist.length > 0 ? (
                          <div className="px-4 pb-3 space-y-3">
                            {cj.action && (cj.action.return || cj.action.approve) && (
                              <p className="text-[10px] text-(--foreground-subtle) italic">{[cj.action.return, cj.action.approve].filter(Boolean).join(" · ")}</p>
                            )}
                            {cj.checklist.map((sec, idx) => (
                              <div key={idx}>
                                <h5 className="text-xs font-semibold text-foreground mb-1">{sec.section}</h5>
                                <ul className="space-y-1 pl-3 border-l-2 border-(--border) list-none">
                                  {(sec.checks || []).map((line, i) => (
                                    <li key={i} className="text-xs leading-snug text-foreground">{line}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <>
                            <div className="px-4 pb-2">
                              <p className="text-xs text-foreground leading-relaxed" style={{ lineHeight: 1.5 }}>{item.check_text}</p>
                            </div>
                            {subChecks.length > 0 && (
                              <div className="px-4 pb-3">
                                <ul className="space-y-1.5 pl-3 border-l-2 border-(--border)">
                                  {subChecks.map((sub) => (
                                    <li key={sub.id} className="text-xs leading-snug text-foreground">
                                      <span className="font-semibold">{sub.check}</span>
                                      <span> — {sub.description}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        )}
                        <div className="mt-auto px-4 pb-4 pt-2 border-t border-(--border)">
                          {isEditable ? (
                            <input type="text" value={state.note} onChange={(e) => updateChecklistNote(item.id, e.target.value)} onBlur={blurChecklistNote} placeholder="Note…"
                              className="w-full text-xs border border-(--border) rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--primary)/30 bg-background" />
                          ) : state.note ? (
                            <p className="text-xs text-foreground italic border-l-2 border-(--border) pl-2 py-0.5">{state.note}</p>
                          ) : (
                            <p className="text-xs text-(--foreground-muted) italic">No note</p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-(--foreground-muted) py-3">No checklist items.</p>
              )}
            </section>

            {/* ——— Notes ——— */}
            <section className="min-h-0 flex flex-col">
              <ModalSectionHeader title="Notes" />
              <div className="space-y-3">
                <NoteList resourceType="evidence_submission" resourceId={submission.id} refreshTrigger={notesRefresh} emptyMessage="No notes yet." />
                <NoteInput
                  resourceType="evidence_submission"
                  resourceId={submission.id}
                  placeholder={submission.status === "returned" || String(submission.status || "").includes("returned") ? "Add a reply to the reviewer…" : "Add a note…"}
                  onAdded={() => { setNotesRefresh((r) => r + 1); fetchDetail(); }}
                />
              </div>
            </section>

            {/* ——— Comments & History ——— */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <section className="min-h-0 flex flex-col">
                <ModalSectionHeader title="Comments" badge={`${comments.length}`} />
                <div className="space-y-3 flex-1">
                  <div className="space-y-2 max-h-[min(36vh,280px)] overflow-y-auto pr-1">
                    {comments.map((c) => (
                      <div key={c.id} className="bg-background rounded-xl p-3 border border-(--border)">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-foreground">{c.author_name || c.author_id.slice(0, 8)}</span>
                          <span className="text-[10px] text-(--foreground-muted)">{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed" style={{ lineHeight: 1.5 }}>{c.body}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2 shrink-0 border-t border-(--border) mt-2">
                    <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment…"
                      className="flex-1 text-sm border border-(--border) rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--primary)/30 bg-background" />
                    <button onClick={handleAddComment} disabled={!newComment.trim() || submittingComment} className="px-3 py-2 bg-(--primary) text-white text-xs font-medium rounded-lg hover:opacity-90 disabled:opacity-50">Post</button>
                  </div>
                </div>
              </section>
              <section className="min-h-0 flex flex-col">
                <ModalSectionHeader title="Review history" />
                <div className="space-y-2 max-h-[min(36vh,280px)] overflow-y-auto pr-1">
                  {review_history.map((rh) => (
                    <div key={rh.id} className="flex items-center gap-3 bg-background rounded-xl px-3 py-2.5 border border-(--border)">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${rh.status === "approved" ? "bg-emerald-500" : rh.status === "returned" ? "bg-rose-500" : "bg-amber-500"}`} />
                      <span className="text-xs font-semibold text-foreground">{normalizeLevel(rh.level)}</span>
                      <span className="text-xs text-(--foreground-muted) capitalize">{rh.status}</span>
                      <span className="text-[10px] text-(--foreground-subtle) ml-auto whitespace-nowrap">{new Date(rh.assigned_at).toLocaleDateString()}{rh.completed_at ? ` → ${new Date(rh.completed_at).toLocaleDateString()}` : ""}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {cycleId && <EvidenceEditsHistorySection cycleId={cycleId} submissionId={submission.id} />}

            {/* Action bar — at bottom of scroll */}
            {canAction && review.status === "assigned" && (
              <div className="border-t border-(--border) pt-6 flex flex-col gap-3">
                {checklistTotal > 0 && checklistChecked < checklistTotal && (
                  <div className="px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-300">
                    {checklistChecked}/{checklistTotal} checklist items verified
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    value={actionComment}
                    onChange={(e) => setActionComment(e.target.value)}
                    placeholder="Comment (optional)…"
                    className="flex-1 min-w-[200px] text-sm border border-(--border) rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-(--primary)/30 bg-(--surface)"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (actionComment.trim()) await api.post(`/reviews/${reviewId}/comments`, { body: actionComment.trim() });
                      onAction?.("approve", actionComment, checklistState);
                      onClose();
                    }}
                    disabled={checklistTotal > 0 && checklistChecked < checklistTotal}
                    className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (actionComment.trim()) await api.post(`/reviews/${reviewId}/comments`, { body: actionComment.trim() });
                      onAction?.("return", actionComment, checklistState);
                      onClose();
                    }}
                    className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600"
                  >
                    Return
                  </button>
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
    </div>
  );
}
