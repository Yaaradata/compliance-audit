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

interface ReviewHistoryEntry {
  id: string;
  level: string;
  status: string;
  decision: string | null;
  assigned_at: string;
  completed_at: string | null;
}

interface ReviewDetailData {
  review: {
    id: string;
    level: string;
    status: string;
    decision: string | null;
    reviewer_id: string;
    reviewer_name: string | null;
    assigned_at: string;
    completed_at: string | null;
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
  comments: Comment[];
  review_history: ReviewHistoryEntry[];
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export function EvidenceViewer({
  reviewId,
  userRole,
  onAction,
}: {
  reviewId: string;
  userRole: string;
  onAction?: (decision: "approve" | "return", comment?: string) => void;
}) {
  const [data, setData] = useState<ReviewDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"evidence" | "evaluation" | "comments" | "history">("evidence");
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [actionComment, setActionComment] = useState("");

  const fetchDetail = useCallback(async () => {
    try {
      const resp = await api.get<ReviewDetailData>(`/reviews/${reviewId}/detail`);
      setData(resp);
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

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      await api.post(`/reviews/${reviewId}/comments`, { body: newComment.trim() });
      setNewComment("");
      fetchDetail();
    } catch { /* ignore */ }
    setSubmittingComment(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-sm text-gray-400">Loading evidence…</div>;
  }

  if (!data) {
    return <div className="flex items-center justify-center h-64 text-sm text-gray-400">Could not load review details.</div>;
  }

  const { review, submission, attachments, comments, review_history } = data;
  const evalResult = submission.evaluation_result;
  const formData = submission.form_data || {};
  const formKeys = Object.keys(formData).filter((k) => formData[k]);

  const canAction =
    (userRole === "internal_reviewer" && (review.level === "L1" || review.level === "L2")) ||
    (userRole === "external_assessor" && review.level === "L3") ||
    userRole === "compliance_officer" ||
    userRole === "admin";

  const isReadOnly = userRole === "external_assessor" || userRole === "approver";

  const LEVEL_LABELS: Record<string, string> = { L1: "Completeness", L2: "Quality", L3: "Assessment" };
  const normalizeLevel = (l: string) => (["l1_completeness", "l2_quality", "l3_assessment"].includes(l) ? { l1_completeness: "L1", l2_quality: "L2", l3_assessment: "L3" }[l]! : l);
  const l1 = review_history.find((r) => normalizeLevel(r.level) === "L1");
  const l2 = review_history.find((r) => normalizeLevel(r.level) === "L2");
  const l3 = review_history.find((r) => normalizeLevel(r.level) === "L3");
  const currentLevel = normalizeLevel(review.level);
  const pipeline = [
    { level: "L1", label: LEVEL_LABELS.L1, done: l1?.status === "approved" || ["L2", "L3"].includes(currentLevel), current: currentLevel === "L1" },
    { level: "L2", label: LEVEL_LABELS.L2, done: l2?.status === "approved" || currentLevel === "L3", current: currentLevel === "L2" },
    { level: "L3", label: LEVEL_LABELS.L3, done: l3?.status === "approved" || submission.status === "approved", current: currentLevel === "L3" },
  ];

  const TABS = [
    { id: "evidence" as const, label: "Evidence" },
    { id: "evaluation" as const, label: "AI Evaluation" },
    { id: "comments" as const, label: `Comments (${comments.length})` },
    { id: "history" as const, label: "History" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/80 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">{submission.evidence_item_id}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {currentLevel} Review ({LEVEL_LABELS[currentLevel] ?? currentLevel}) · Status: <span className="font-semibold">{review.status}</span>
            </p>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              submission.status === "approved"
                ? "bg-green-100 text-green-700"
                : submission.status === "returned"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
            }`}
          >
            {submission.status}
          </span>
        </div>
        {/* L1 → L2 → L3 pipeline */}
        <div className="flex items-center gap-0 rounded-lg border border-gray-200 bg-white px-2 py-1.5">
          <span className="text-[10px] font-medium text-gray-500 mr-2">Review flow:</span>
          {pipeline.map((step, i) => (
            <div key={step.level} className="flex items-center gap-0.5">
              {i > 0 && <span className="text-gray-300 mx-0.5">→</span>}
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                  step.done
                    ? "bg-green-100 text-green-700"
                    : step.current
                      ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300"
                      : "bg-gray-100 text-gray-500"
                }`}
                title={`${step.level}: ${step.label}`}
              >
                {step.done ? "✓ " : step.current ? "● " : ""}{step.level}
              </span>
              <span className="text-[9px] text-gray-400 hidden sm:inline">{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 px-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              tab === t.id
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === "evidence" && (
          <div className="space-y-4">
            {formKeys.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Form Data</h4>
                <div className="grid grid-cols-1 gap-2">
                  {formKeys.map((key) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                        {key.replace(/_/g, " ")}
                      </div>
                      <div className="text-xs text-gray-800 whitespace-pre-wrap">{formData[key]}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {attachments.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Attachments</h4>
                <ul className="space-y-1.5">
                  {attachments.map((att) => {
                    const isImage = att.file_type?.startsWith("image/");
                    return (
                      <li key={att.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 border border-gray-100">
                        <div className="flex-1 min-w-0">
                          {att.url ? (
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-blue-600 hover:underline truncate block"
                            >
                              {att.file_name}
                            </a>
                          ) : (
                            <span className="text-xs font-medium text-gray-700 truncate block">{att.file_name}</span>
                          )}
                          <span className="text-[10px] text-gray-400">{formatBytes(att.file_size_bytes)}</span>
                        </div>
                        {isImage && att.url && (
                          <img
                            src={att.url}
                            alt={att.file_name}
                            className="w-16 h-16 object-cover rounded border border-gray-200"
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {formKeys.length === 0 && attachments.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No evidence data submitted.</p>
            )}
          </div>
        )}

        {tab === "evaluation" && (
          <div className="space-y-4">
            {evalResult ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-lg ${evalResult.overall_met ? "text-green-600" : "text-red-600"}`}>
                    {evalResult.overall_met ? "✓" : "✗"}
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {evalResult.overall_met ? "Evidence meets requirements" : "Evidence does not fully meet requirements"}
                  </span>
                </div>

                {evalResult.summary && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                    {evalResult.summary}
                  </div>
                )}

                {evalResult.sufficiency_results && evalResult.sufficiency_results.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-700 mb-2">Sufficiency</h4>
                    <div className="space-y-1">
                      {evalResult.sufficiency_results.map((s) => (
                        <div key={s.id} className="flex items-start gap-2 text-xs">
                          <span className={s.met ? "text-green-600" : "text-red-600"}>
                            {s.met ? "✓" : "✗"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-gray-700">{stripCriteriaPrefix(s.label)}</span>
                            {!s.met && s.description && (
                              <p className="text-[11px] text-red-600/90 mt-0.5">{s.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {evalResult.criteria && evalResult.criteria.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-700 mb-2">Evaluation Criteria</h4>
                    <div className="space-y-1">
                      {evalResult.criteria
                        .filter((c) => shouldShowCriterion(c.label))
                        .map((c) => (
                          <div key={c.id} className="flex items-start gap-2 text-xs">
                            <span className={c.met ? "text-green-600" : "text-red-600"}>
                              {c.met ? "✓" : "✗"}
                            </span>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-gray-700">{stripCriteriaPrefix(c.label)}</span>
                              {!c.met && c.description && (
                                <p className="text-[11px] text-red-600/90 mt-0.5">{c.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No AI evaluation available yet.</p>
            )}
          </div>
        )}

        {tab === "comments" && (
          <div className="space-y-3">
            {comments.length > 0 ? (
              <div className="space-y-2">
                {comments.map((c) => (
                  <div key={c.id} className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold text-gray-600">{c.author_name || c.author_id.slice(0, 8)}</span>
                      <span className="text-[10px] text-gray-400">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-gray-800 whitespace-pre-wrap">{c.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">No comments yet.</p>
            )}

            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment…"
                rows={2}
                className="flex-1 text-xs border border-gray-300 rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || submittingComment}
                className="self-end px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Post
              </button>
            </div>
          </div>
        )}

        {tab === "history" && (
          <div className="space-y-2">
            {review_history.map((rh) => (
              <div key={rh.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                <div
                  className={`w-2 h-2 rounded-full ${
                    rh.status === "approved" ? "bg-green-500" : rh.status === "returned" ? "bg-red-500" : "bg-yellow-500"
                  }`}
                />
                <div className="flex-1">
                  <span className="text-xs font-semibold text-gray-700">{rh.level}</span>
                  <span className="text-xs text-gray-500 ml-2">{rh.status}</span>
                  {rh.decision && <span className="text-xs text-gray-400 ml-2">({rh.decision})</span>}
                </div>
                <span className="text-[10px] text-gray-400">
                  {new Date(rh.assigned_at).toLocaleDateString()}
                  {rh.completed_at && ` → ${new Date(rh.completed_at).toLocaleDateString()}`}
                </span>
              </div>
            ))}
            {review_history.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">No review history.</p>
            )}
          </div>
        )}
      </div>

      {/* Action bar */}
      {canAction && review.status === "assigned" && (
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50/80">
          <textarea
            value={actionComment}
            onChange={(e) => setActionComment(e.target.value)}
            placeholder="Add comment with your decision (optional)…"
            rows={2}
            className="w-full text-xs border border-gray-300 rounded-lg p-2 resize-none mb-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <div className="flex gap-2">
            {isReadOnly ? (
              <button
                onClick={async () => {
                  if (actionComment.trim()) {
                    await api.post(`/reviews/${reviewId}/comments`, { body: actionComment.trim() });
                  }
                  onAction?.("approve", actionComment);
                }}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                Accept
              </button>
            ) : (
              <>
                <button
                  onClick={async () => {
                    if (actionComment.trim()) {
                      await api.post(`/reviews/${reviewId}/comments`, { body: actionComment.trim() });
                    }
                    onAction?.("approve", actionComment);
                  }}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={async () => {
                    if (actionComment.trim()) {
                      await api.post(`/reviews/${reviewId}/comments`, { body: actionComment.trim() });
                    }
                    onAction?.("return", actionComment);
                  }}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600"
                >
                  Return with Comments
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
