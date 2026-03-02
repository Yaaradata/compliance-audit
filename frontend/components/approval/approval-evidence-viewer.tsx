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
      <div className="flex flex-col h-full bg-white">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800">Evidence detail</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Close
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          Loading…
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800">Evidence detail</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Close
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
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
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50/80">
        <div>
          <h3 className="text-sm font-bold text-gray-900">{submission.evidence_item_id}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Status: <span className="font-semibold">{submission.status}</span>
            {submission.submitted_at && (
              <> · Submitted {new Date(submission.submitted_at).toLocaleDateString()}</>
            )}
            {submission.submitter_name && <> · by {submission.submitter_name}</>}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="px-2 py-1 text-xs font-medium rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {formKeys.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
              Form data
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {formKeys.map((key) => (
                <div
                  key={key}
                  className="bg-gray-50 rounded-lg p-2.5 border border-gray-100"
                >
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                    {key.replace(/_/g, " ")}
                  </div>
                  <div className="text-xs text-gray-800 whitespace-pre-wrap">
                    {formData[key]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {attachments.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
              Attachments
            </h4>
            <ul className="space-y-1.5">
              {attachments.map((att) => {
                const isImage = att.file_type?.startsWith("image/");
                return (
                  <li
                    key={att.id}
                    className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 border border-gray-100"
                  >
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
                        <span className="text-xs font-medium text-gray-700 truncate block">
                          {att.file_name}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400">
                        {formatBytes(att.file_size_bytes)}
                      </span>
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

        {reviews.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
              Review history (L1 → L2 → L3)
            </h4>
            <div className="space-y-1.5">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-100"
                >
                  <span className="text-xs font-semibold text-gray-700">{r.level}</span>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      r.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : r.status === "returned"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {r.status}
                  </span>
                  {r.completed_at && (
                    <span className="text-[10px] text-gray-400">
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
            <h4 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
              AI evaluation
            </h4>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={
                  evalResult.overall_met ? "text-green-600 text-sm" : "text-amber-600 text-sm"
                }
              >
                {evalResult.overall_met ? "✓ Meets requirements" : "⚠ Review recommended"}
              </span>
            </div>
            {evalResult.summary && (
              <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2 border border-gray-100">
                {evalResult.summary}
              </p>
            )}
          </div>
        )}

        {formKeys.length === 0 && attachments.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">No evidence content.</p>
        )}
      </div>
    </div>
  );
}
