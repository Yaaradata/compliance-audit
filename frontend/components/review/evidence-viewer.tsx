"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { stripCriteriaPrefix, shouldShowCriterion } from "@/lib/utils";

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

interface ChecklistItem {
  id: string;
  control_id: string;
  control_name: string;
  mandatory_advisory: string;
  check_text: string;
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

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["checklist"]));

  const toggleSection = (s: string) => setExpandedSections((prev) => {
    const next = new Set(prev);
    next.has(s) ? next.delete(s) : next.add(s);
    return next;
  });

  const fetchDetail = useCallback(async () => {
    try {
      const resp = await api.get<ReviewDetailData>(`/reviews/${reviewId}/detail`);
      setData(resp);
      const saved = resp.review.checklist_results || {};
      const initial: Record<string, { checked: boolean; note: string }> = {};
      for (const item of resp.checklist || []) {
        const s = saved[item.id];
        initial[item.id] = { checked: s?.checked ?? false, note: s?.note ?? "" };
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

  if (loading) return <div className="py-6 text-center text-xs text-gray-400">Loading details…</div>;
  if (!data) return <div className="py-6 text-center text-xs text-gray-400">Could not load details.</div>;

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

  const SectionHeader = ({ id, label, badge }: { id: string; label: string; badge?: string }) => (
    <button
      type="button"
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-2">
        {badge && <span className="text-[10px] text-gray-500">{badge}</span>}
        <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expandedSections.has(id) ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>
  );

  return (
    <div className="space-y-2">
      {/* Checklist */}
      <SectionHeader id="checklist" label={`${review.level} Checklist`} badge={`${checklistChecked}/${checklistTotal}${savingChecklist ? " saving…" : ""}`} />
      {expandedSections.has("checklist") && (
        <div className="space-y-1.5 pl-1">
          {checklist.length > 0 ? checklist.map((item) => {
            const state = checklistState[item.id] || { checked: false, note: "" };
            return (
              <div key={item.id} className={`rounded-lg border p-2.5 transition-colors ${state.checked ? "border-green-200 bg-green-50/50" : "border-gray-200 bg-white"}`}>
                <div className="flex items-start gap-2">
                  <button type="button" disabled={!isEditable} onClick={() => toggleChecklistItem(item.id)}
                    className={`mt-0.5 shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors text-[10px] ${state.checked ? "bg-green-600 border-green-600 text-white" : "border-gray-300 bg-white hover:border-gray-400"} ${!isEditable ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
                    {state.checked && <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1 py-0.5 rounded">{item.control_id}</span>
                      <span className="text-[9px] text-gray-500 truncate">{item.control_name}</span>
                    </div>
                    <p className="text-[11px] text-gray-700 leading-relaxed">{item.check_text}</p>
                    {isEditable && (
                      <input type="text" value={state.note} onChange={(e) => updateChecklistNote(item.id, e.target.value)} onBlur={blurChecklistNote}
                        placeholder="Note…" className="mt-1 w-full text-[10px] border border-gray-200 rounded p-1 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white/70" />
                    )}
                    {!isEditable && state.note && <p className="mt-0.5 text-[10px] text-gray-500 italic">{state.note}</p>}
                  </div>
                </div>
              </div>
            );
          }) : <p className="text-[11px] text-gray-400 py-2 text-center">No checklist items.</p>}
        </div>
      )}

      {/* Evidence */}
      <SectionHeader id="evidence" label="Evidence" badge={`${formKeys.length} fields, ${attachments.length} files`} />
      {expandedSections.has("evidence") && (
        <div className="space-y-2 pl-1">
          {formKeys.map((key) => (
            <div key={key} className="bg-gray-50 rounded-lg p-2 border border-gray-100">
              <div className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">{key.replace(/_/g, " ")}</div>
              <div className="text-[11px] text-gray-800 whitespace-pre-wrap line-clamp-3">{formData[key]}</div>
            </div>
          ))}
          {attachments.map((att) => (
            <div key={att.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 border border-gray-100">
              <div className="flex-1 min-w-0">
                {att.url ? (
                  <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium text-blue-600 hover:underline truncate block">{att.file_name}</a>
                ) : (
                  <span className="text-[11px] font-medium text-gray-700 truncate block">{att.file_name}</span>
                )}
                <span className="text-[9px] text-gray-400">{formatBytes(att.file_size_bytes)}</span>
              </div>
            </div>
          ))}
          {formKeys.length === 0 && attachments.length === 0 && <p className="text-[11px] text-gray-400 text-center py-2">No evidence submitted.</p>}
        </div>
      )}

      {/* AI Evaluation */}
      <SectionHeader id="evaluation" label="AI Evaluation" badge={evalResult ? (evalResult.overall_met ? "Met" : "Not met") : "—"} />
      {expandedSections.has("evaluation") && (
        <div className="pl-1 space-y-2">
          {evalResult ? (
            <>
              {evalResult.summary && <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-[11px] text-blue-800">{evalResult.summary}</div>}
              {evalResult.sufficiency_results && evalResult.sufficiency_results.length > 0 && (
                <div className="space-y-0.5">
                  <h5 className="text-[10px] font-bold text-gray-600">Sufficiency</h5>
                  {evalResult.sufficiency_results.map((s) => (
                    <div key={s.id} className="flex items-start gap-1.5 text-[11px]">
                      <span className={s.met ? "text-green-600" : "text-red-600"}>{s.met ? "✓" : "✗"}</span>
                      <span className="text-gray-700">{stripCriteriaPrefix(s.label)}</span>
                    </div>
                  ))}
                </div>
              )}
              {evalResult.criteria && evalResult.criteria.length > 0 && (
                <div className="space-y-0.5">
                  <h5 className="text-[10px] font-bold text-gray-600">Evaluation Criteria</h5>
                  {evalResult.criteria.filter((c) => shouldShowCriterion(c.label)).map((c) => (
                    <div key={c.id} className="flex items-start gap-1.5 text-[11px]">
                      <span className={c.met ? "text-green-600" : "text-red-600"}>{c.met ? "✓" : "✗"}</span>
                      <span className="text-gray-700">{stripCriteriaPrefix(c.label)}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : <p className="text-[11px] text-gray-400 text-center py-2">No evaluation yet.</p>}
        </div>
      )}

      {/* Comments */}
      <SectionHeader id="comments" label="Comments" badge={`${comments.length}`} />
      {expandedSections.has("comments") && (
        <div className="pl-1 space-y-1.5">
          {comments.map((c) => (
            <div key={c.id} className="bg-gray-50 rounded-lg p-2 border border-gray-100">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[9px] font-semibold text-gray-600">{c.author_name || c.author_id.slice(0, 8)}</span>
                <span className="text-[9px] text-gray-400">{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-[11px] text-gray-800">{c.body}</p>
            </div>
          ))}
          <div className="flex gap-1.5 pt-1">
            <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add comment…"
              className="flex-1 text-[11px] border border-gray-300 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400" />
            <button onClick={handleAddComment} disabled={!newComment.trim() || submittingComment}
              className="px-2 py-1 bg-blue-600 text-white text-[10px] font-medium rounded hover:bg-blue-700 disabled:opacity-50">Post</button>
          </div>
        </div>
      )}

      {/* History */}
      <SectionHeader id="history" label="History" badge={`${review_history.length} levels`} />
      {expandedSections.has("history") && (
        <div className="pl-1 space-y-1">
          {review_history.map((rh) => (
            <div key={rh.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5 border border-gray-100">
              <div className={`w-1.5 h-1.5 rounded-full ${rh.status === "approved" ? "bg-green-500" : rh.status === "returned" ? "bg-red-500" : "bg-yellow-500"}`} />
              <span className="text-[11px] font-semibold text-gray-700">{normalizeLevel(rh.level)}</span>
              <span className="text-[11px] text-gray-500">{rh.status}</span>
              <span className="text-[9px] text-gray-400 ml-auto">{new Date(rh.assigned_at).toLocaleDateString()}{rh.completed_at && ` → ${new Date(rh.completed_at).toLocaleDateString()}`}</span>
            </div>
          ))}
        </div>
      )}

      {/* Action bar */}
      {canAction && review.status === "assigned" && (
        <div className="border-t border-gray-200 pt-3 mt-2">
          {checklistTotal > 0 && checklistChecked < checklistTotal && (
            <div className="mb-2 px-2 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-700">
              {checklistChecked}/{checklistTotal} checklist items verified
            </div>
          )}
          <div className="flex items-center gap-2">
            <input type="text" value={actionComment} onChange={(e) => setActionComment(e.target.value)} placeholder="Comment (optional)…"
              className="flex-1 text-[11px] border border-gray-300 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400" />
            <button onClick={async () => {
              if (actionComment.trim()) await api.post(`/reviews/${reviewId}/comments`, { body: actionComment.trim() });
              onAction?.("approve", actionComment, checklistState);
            }} className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700">Approve</button>
            <button onClick={async () => {
              if (actionComment.trim()) await api.post(`/reviews/${reviewId}/comments`, { body: actionComment.trim() });
              onAction?.("return", actionComment, checklistState);
            }} className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600">Return</button>
          </div>
        </div>
      )}
    </div>
  );
}
