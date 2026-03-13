"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

interface Attachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  url: string | null;
}

interface EvidenceDetailData {
  submission: {
    id: string;
    evidence_item_id: string;
    status: string;
    form_data: Record<string, string>;
    evaluation_result: { overall_met?: boolean; summary?: string | null } | null;
    evaluation_edits?: Record<string, { met: boolean; description: string | null; userNote?: string | null }>;
    submitter_name: string | null;
    submitted_at: string | null;
    completion_pct: number;
  };
  attachments: Attachment[];
  reviews: { id: string; level: string; status: string; decision: string | null; completed_at: string | null }[];
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export function ApprovalEvidenceViewer({
  cycleId,
  submissionId,
  onClose,
}: {
  cycleId: string;
  submissionId: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<EvidenceDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    if (!cycleId || !submissionId) return;
    setLoading(true);
    try {
      const resp = await api.get<EvidenceDetailData>(
        `/assessments/${cycleId}/evidence/${submissionId}/detail`
      );
      setData(resp);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [cycleId, submissionId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-[var(--surface)]">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between bg-[var(--background)]/50">
          <h3 className="text-sm font-bold text-[var(--foreground)]">Evidence detail</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] text-sm font-medium"
          >
            Close
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center text-sm text-[var(--foreground-muted)]">
          Loading…
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col h-full bg-[var(--surface)]">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between bg-[var(--background)]/50">
          <h3 className="text-sm font-bold text-[var(--foreground)]">Evidence detail</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] text-sm font-medium"
          >
            Close
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center text-sm text-[var(--foreground-muted)]">
          Could not load evidence.
        </div>
      </div>
    );
  }

  const { submission, attachments, reviews } = data;
  const formData = submission.form_data || {};
  const formKeys = Object.keys(formData).filter((k) => formData[k]);
  const evalResult = submission.evaluation_result;

  return (
    <div className="flex flex-col h-full bg-[var(--surface)]">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between bg-[var(--background)]/50">
        <div>
          <h3 className="text-sm font-bold text-[var(--foreground)]">{submission.evidence_item_id}</h3>
          <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
            Status: <span className="font-semibold text-[var(--foreground)]">{submission.status}</span>
            {submission.submitted_at && (
              <> · Submitted {new Date(submission.submitted_at).toLocaleDateString()}</>
            )}
            {submission.submitter_name && <> · by {submission.submitter_name}</>}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
        >
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {formKeys.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-[var(--foreground-muted)] mb-2 uppercase tracking-wider">
              Form data
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {formKeys.map((key) => (
                <div
                  key={key}
                  className="bg-[var(--background)] rounded-lg p-2.5 border border-[var(--border)]"
                >
                  <div className="text-[10px] font-semibold text-[var(--foreground-subtle)] uppercase tracking-wider mb-0.5">
                    {key.replace(/_/g, " ")}
                  </div>
                  <div className="text-xs text-[var(--foreground)] whitespace-pre-wrap">
                    {formData[key]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {attachments.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-[var(--foreground-muted)] mb-2 uppercase tracking-wider">
              Attachments
            </h4>
            <ul className="space-y-1.5">
              {attachments.map((att) => {
                const isImage = att.file_type?.startsWith("image/");
                return (
                  <li
                    key={att.id}
                    className="flex items-center gap-2 bg-[var(--background)] rounded-lg p-2 border border-[var(--border)]"
                  >
                    <div className="flex-1 min-w-0">
                      {att.url ? (
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-[var(--primary)] hover:underline truncate block"
                        >
                          {att.file_name}
                        </a>
                      ) : (
                        <span className="text-xs font-medium text-[var(--foreground)] truncate block">
                          {att.file_name}
                        </span>
                      )}
                      <span className="text-[10px] text-[var(--foreground-subtle)]">
                        {formatBytes(att.file_size_bytes)}
                      </span>
                    </div>
                    {isImage && att.url && (
                      <img
                        src={att.url}
                        alt={att.file_name}
                        className="w-16 h-16 object-cover rounded border border-[var(--border)]"
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {reviews.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-[var(--foreground-muted)] mb-2 uppercase tracking-wider">
              Review history (L1 → L2 → Approver)
            </h4>
            <div className="space-y-1.5">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between bg-[var(--background)] rounded-lg px-3 py-2 border border-[var(--border)]"
                >
                  <span className="text-xs font-semibold text-[var(--foreground)]">{r.level}</span>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      r.status === "approved"
                        ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                        : r.status === "returned"
                          ? "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300"
                          : "bg-[var(--background)] text-[var(--foreground-muted)]"
                    }`}
                  >
                    {r.status}
                  </span>
                  {r.completed_at && (
                    <span className="text-[10px] text-[var(--foreground-subtle)]">
                      {new Date(r.completed_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {evalResult && (
          <div>
            <h4 className="text-xs font-bold text-[var(--foreground-muted)] mb-2 uppercase tracking-wider">
              AI evaluation
            </h4>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={
                  evalResult.overall_met ? "text-emerald-600 dark:text-emerald-400 text-sm" : "text-amber-600 dark:text-amber-400 text-sm"
                }
              >
                {evalResult.overall_met ? "✓ Meets requirements" : "⚠ Review recommended"}
              </span>
            </div>
            {evalResult.summary && (
              <p className="text-xs text-[var(--foreground-muted)] bg-[var(--background)] rounded-lg p-2 border border-[var(--border)]">
                {evalResult.summary}
              </p>
            )}
          </div>
        )}

        {formKeys.length === 0 && attachments.length === 0 && (
          <p className="text-sm text-[var(--foreground-muted)] text-center py-6">No evidence content.</p>
        )}
      </div>
    </div>
  );
}
