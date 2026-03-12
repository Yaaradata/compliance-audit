"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { EvidenceQuestion } from "@/lib/types";

interface SpreadsheetColumn {
  key: string;
  label: string;
  type: "text" | "select";
  required?: boolean;
  options?: string[];
}

export interface EvidenceDisplayReadOnlyProps {
  evidenceItemId: string;
  cycleId: string;
  formData: Record<string, string>;
  /** Attachments for file-type questions (from submission.attachments) */
  attachments?: { id: string; file_name: string; file_type: string; file_size_bytes: number; url: string | null }[];
  /** When set, attachment rows are clickable to open preview (e.g. reviewer modal) */
  onAttachmentClick?: (att: { id: string; file_name: string; file_type: string; file_size_bytes: number; url: string | null }) => void;
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function SpreadsheetReadOnlyDisplay({
  question,
  value,
}: {
  question: EvidenceQuestion;
  value: string;
}) {
  const columns = (
    (question.options?.filter((o) => typeof o === "object" && o !== null && "key" in o) ?? []) as unknown as SpreadsheetColumn[]
  );
  let rows: Record<string, string>[] = [];
  try {
    rows = value ? JSON.parse(value) : [];
  } catch {
    rows = [];
  }
  if (rows.length === 0) return null;

  const getLabel = (col: SpreadsheetColumn) => col.label || col.key.replace(/_/g, " ");

  return (
    <div className="space-y-2.5 rounded-lg border border-transparent">
      <label className="block text-sm font-medium text-gray-700">
        {question.label} {question.required && <span className="text-red-500">*</span>}
      </label>
      <div className="rounded border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-b border-r border-gray-200 px-2.5 py-2 text-left text-xs font-semibold uppercase text-gray-700 w-8">#</th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="border-b border-r border-gray-200 px-2.5 py-2 text-left text-xs font-semibold uppercase text-gray-700 whitespace-nowrap"
                  >
                    {getLabel(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border-b border-r border-gray-200 px-2.5 py-1.5 text-sm text-gray-500">{index + 1}</td>
                  {columns.map((col) => (
                    <td key={col.key} className="border-b border-r border-gray-200 px-2.5 py-1.5 text-sm text-gray-900">
                      {row[col.key] != null ? String(row[col.key]) : ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SingleFieldReadOnlyDisplay({
  question,
  value,
}: {
  question: EvidenceQuestion;
  value: string;
}) {
  const displayValue =
    question.question_type === "checkbox"
      ? value === "true"
        ? "Yes"
        : value === "false"
          ? "No"
          : value || ""
      : value || "";

  /** Textarea-type fields: fixed height, scrollable, user can drag to resize vertically */
  const isResizable = question.question_type === "textarea";

  return (
    <div className="space-y-2.5 rounded-lg border border-transparent">
      <label className="block text-sm font-medium text-gray-700">
        {question.label} {question.required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={
          isResizable
            ? "rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-gray-50 text-gray-900 h-32 min-h-20 max-h-96 overflow-auto resize-y"
            : "rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-gray-50 text-gray-900 min-h-10"
        }
      >
        {displayValue ? (
          <span className="whitespace-pre-wrap leading-relaxed block">{displayValue}</span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </div>
    </div>
  );
}

export function EvidenceDisplayReadOnly({
  evidenceItemId,
  cycleId,
  formData,
  attachments = [],
  onAttachmentClick,
}: EvidenceDisplayReadOnlyProps) {
  const [questions, setQuestions] = useState<EvidenceQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!evidenceItemId || !cycleId) {
      setQuestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get<EvidenceQuestion[]>(`/ref/evidence-items/${evidenceItemId}/questions?cycle_id=${cycleId}`)
      .then((data) => setQuestions(data))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, [evidenceItemId, cycleId]);

  const isQuestionVisible = useCallback(
    (q: EvidenceQuestion): boolean => {
      const parentKey = q.show_when_question;
      const showValues = q.show_when_values;
      if (!parentKey || !showValues?.length) return true;
      const parentVal = (formData[parentKey] ?? "").trim();
      return showValues.some((v) => v.trim() === parentVal);
    },
    [formData]
  );

  /** Same visibility as EvidenceQuestionsForm: hide guide-only textareas */
  const isQuestionShownInForm = useCallback((q: EvidenceQuestion): boolean => {
    if (q.question_type !== "textarea") return true;
    const p = (q.placeholder ?? "").trim();
    if (p.includes("logical/physical separation method") || p.includes("firewall devices at every ingress/egress"))
      return false;
    return true;
  }, []);

  const visibleQuestions = questions.filter(isQuestionVisible).filter(isQuestionShownInForm);

  if (loading) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">Loading…</div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">
        No questions configured for this evidence item.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {visibleQuestions.map((q) => {
        if (q.question_type === "file") {
          return (
            <div key={q.id} className="space-y-2.5 rounded-lg border border-transparent">
              <label className="block text-sm font-medium text-gray-700">
                {q.label} {q.required && <span className="text-red-500">*</span>}
              </label>
              {attachments.length > 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-200">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      role={onAttachmentClick ? "button" : undefined}
                      tabIndex={onAttachmentClick ? 0 : undefined}
                      onClick={onAttachmentClick ? () => onAttachmentClick(att) : undefined}
                      onKeyDown={
                        onAttachmentClick
                          ? (e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onAttachmentClick(att);
                              }
                            }
                          : undefined
                      }
                      className={`flex items-center gap-4 px-4 py-3.5 ${onAttachmentClick ? "cursor-pointer hover:bg-gray-50/50" : ""}`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                        <svg
                          className="w-5 h-5 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{att.file_name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatBytes(att.file_size_bytes)}</p>
                      </div>
                      {onAttachmentClick ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAttachmentClick(att);
                          }}
                          className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100"
                        >
                          View
                        </button>
                      ) : (
                        att.url && (
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100"
                          >
                            Open
                          </a>
                        )
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-gray-50 text-gray-400 min-h-10">
                  —
                </div>
              )}
            </div>
          );
        }
        if (q.question_type === "spreadsheet") {
          return (
            <SpreadsheetReadOnlyDisplay
              key={q.id}
              question={q}
              value={formData[q.question_key] ?? ""}
            />
          );
        }
        return (
          <SingleFieldReadOnlyDisplay
            key={q.id}
            question={q}
            value={formData[q.question_key] ?? ""}
          />
        );
      })}
    </div>
  );
}
