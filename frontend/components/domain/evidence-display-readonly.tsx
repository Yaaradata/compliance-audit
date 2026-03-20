"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { EvidenceQuestion } from "@/lib/types";

function isAwsSource(src: string | null | undefined): boolean {
  if (!src) return false;
  const s = src.trim().toLowerCase();
  return s === "aws" || (s.startsWith("aws") && s.includes("human"));
}

function isAwsPlusHuman(src: string | null | undefined): boolean {
  if (!src) return false;
  const s = src.trim().toLowerCase();
  return s.startsWith("aws") && s.includes("human");
}

function isAwsOnly(src: string | null | undefined): boolean {
  if (!src) return false;
  const s = src.trim().toLowerCase();
  return s === "aws";
}

function valuesEqualForQuestion(a: string, b: string, questionType: string): boolean {
  const ta = (a ?? "").trim();
  const tb = (b ?? "").trim();
  if (ta === tb) return true;
  if (questionType === "spreadsheet") {
    try {
      const ja = ta ? JSON.parse(ta) : [];
      const jb = tb ? JSON.parse(tb) : [];
      return JSON.stringify(ja) === JSON.stringify(jb);
    } catch {
      return false;
    }
  }
  return false;
}

/** Rows in human JSON where at least one cell differs from AI JSON (same row index). */
function filterSpreadsheetToChangedHumanRows(humanJson: string, aiJson: string): string {
  let h: Record<string, string>[] = [];
  let a: Record<string, string>[] = [];
  try {
    h = humanJson ? JSON.parse(humanJson) : [];
  } catch {
    return "[]";
  }
  try {
    a = aiJson ? JSON.parse(aiJson) : [];
  } catch {
    return humanJson;
  }
  if (!Array.isArray(h)) return "[]";
  if (!Array.isArray(a)) a = [];
  const changed: Record<string, string>[] = [];
  const max = Math.max(h.length, a.length);
  for (let i = 0; i < max; i++) {
    const hr = h[i] ?? {};
    const ar = a[i] ?? {};
    const keys = new Set([...Object.keys(hr), ...Object.keys(ar)]);
    let rowDiff = false;
    for (const k of keys) {
      if (String(hr[k] ?? "").trim() !== String(ar[k] ?? "").trim()) {
        rowDiff = true;
        break;
      }
    }
    if (rowDiff) changed.push({ ...hr });
  }
  return JSON.stringify(changed);
}

export type ReviewerEvidenceViewMode = "submitted" | "ai" | "edits";

/** Secondary line under segment labels — avoids low-contrast opacity on light backgrounds. */
function SegmentSubtitle({ children, active }: { children: ReactNode; active: boolean }) {
  return (
    <span className={cn("block text-[10px] font-normal mt-0.5", active ? "text-slate-600" : "text-slate-500 dark:text-slate-500")}>
      {children}
    </span>
  );
}

function AiFromAwsBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-900 dark:bg-sky-900/50 dark:text-sky-200 border border-sky-200/90 dark:border-sky-800 shadow-sm">
      AI from AWS
    </span>
  );
}

function AwsHumanBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200 border border-amber-200/90 dark:border-amber-800 shadow-sm">
      AWS + Human
    </span>
  );
}

function HumanEditedBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-violet-50 text-violet-900 dark:bg-violet-900/40 dark:text-violet-200 border border-violet-200/90 dark:border-violet-800 shadow-sm">
      Human edited
    </span>
  );
}

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
  hideLabel = false,
  emptyCaption,
}: {
  question: EvidenceQuestion;
  value: string;
  hideLabel?: boolean;
  /** Shown when the table has no rows (e.g. “Changes only” filter yielded nothing). */
  emptyCaption?: string;
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

  const getLabel = (col: SpreadsheetColumn) => col.label || col.key.replace(/_/g, " ");

  if (rows.length === 0) {
    return (
      <div className="space-y-2.5 rounded-lg border border-transparent">
        {!hideLabel && (
          <label className="block text-sm font-medium text-slate-800">
            {question.label} {question.required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/80 dark:border-gray-600 px-4 py-8 text-sm dark:bg-gray-900/40 text-slate-700 dark:text-gray-400 text-center leading-relaxed">
          {emptyCaption ?? "—"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 rounded-lg border border-transparent">
      {!hideLabel && (
        <label className="block text-sm font-medium text-slate-800">
          {question.label} {question.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="border-b border-r border-slate-200 px-2.5 py-2 text-left text-xs font-semibold uppercase text-slate-800 w-8">#</th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="border-b border-r border-slate-200 px-2.5 py-2 text-left text-xs font-semibold uppercase text-slate-800 whitespace-nowrap"
                  >
                    {getLabel(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/80"}>
                  <td className="border-b border-r border-slate-200 px-2.5 py-1.5 text-sm text-slate-500">{index + 1}</td>
                  {columns.map((col) => (
                    <td key={col.key} className="border-b border-r border-slate-200 px-2.5 py-1.5 text-sm text-slate-900">
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
  hideLabel = false,
}: {
  question: EvidenceQuestion;
  value: string;
  hideLabel?: boolean;
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
      {!hideLabel && (
        <label className="block text-sm font-medium text-slate-800">
          {question.label} {question.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div
        className={
          isResizable
            ? "rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 h-32 min-h-20 max-h-96 overflow-auto resize-y shadow-sm dark:border-gray-600 dark:bg-gray-900/30"
            : "rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 min-h-10 shadow-sm dark:border-gray-600 dark:bg-gray-900/30"
        }
      >
        {displayValue ? (
          <span className="whitespace-pre-wrap leading-relaxed block">{displayValue}</span>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </div>
    </div>
  );
}

function ScalarDiffReadOnly({ question, humanVal, aiVal }: { question: EvidenceQuestion; humanVal: string; aiVal: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-violet-800/60 dark:from-violet-950/30 dark:to-gray-900/50 p-4 space-y-4 shadow-sm dark:bg-gray-900/30">
      <div className="rounded-lg border border-violet-100 bg-violet-50/80 p-3 dark:border-violet-900/50 dark:bg-violet-950/20">
        <p className="text-[10px] font-bold uppercase tracking-wider text-violet-800 dark:text-violet-300 mb-2">Submitted (human)</p>
        <SingleFieldReadOnlyDisplay question={question} value={humanVal} hideLabel />
      </div>
      <div className="rounded-lg border border-sky-100 bg-sky-50/60 p-3 dark:border-sky-900/40 dark:bg-sky-950/20">
        <p className="text-[10px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300 mb-2">AI suggestion (AWS)</p>
        <SingleFieldReadOnlyDisplay question={question} value={aiVal} hideLabel />
      </div>
    </div>
  );
}

/** Segmented control: default = exact submitted evidence; optional AI and “changes only” when AI snapshot exists. */
function ReviewerEvidenceQuestionBlock({ question, formData }: { question: EvidenceQuestion; formData: Record<string, string> }) {
  const src = question.evidence_source;
  const humanVal = formData[question.question_key] ?? "";
  const aiVal = formData[`${question.question_key}__ai`] ?? "";
  const hasAiSnapshot = (aiVal ?? "").trim().length > 0;
  const plusHuman = isAwsPlusHuman(src);
  const onlyAws = isAwsOnly(src);
  const differs = hasAiSnapshot && !valuesEqualForQuestion(humanVal, aiVal, question.question_type);
  const [mode, setMode] = useState<ReviewerEvidenceViewMode>("submitted");

  useEffect(() => {
    if (!differs && mode === "edits") setMode("submitted");
  }, [differs, mode]);

  const segmentClass = (active: boolean) =>
    `relative flex-1 min-w-[120px] px-3 py-2.5 text-left rounded-lg text-xs transition-all outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 ${
      active
        ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600"
        : "text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
    }`;

  let body: ReactNode;
  const isSheet = question.question_type === "spreadsheet";

  if (hasAiSnapshot && mode === "edits") {
    if (isSheet) {
      const filtered = filterSpreadsheetToChangedHumanRows(humanVal, aiVal);
      let emptyRows = false;
      try {
        const r = filtered ? JSON.parse(filtered) : [];
        emptyRows = !Array.isArray(r) || r.length === 0;
      } catch {
        emptyRows = true;
      }
      body = (
        <SpreadsheetReadOnlyDisplay
          question={question}
          value={emptyRows ? "[]" : filtered}
          hideLabel
          emptyCaption={
            emptyRows
              ? "No rows differ between the submitted inventory and the AI suggestion."
              : undefined
          }
        />
      );
    } else if (differs) {
      body = <ScalarDiffReadOnly question={question} humanVal={humanVal} aiVal={aiVal} />;
    } else {
      body = (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 dark:border-gray-600 dark:bg-gray-900/40 dark:text-gray-400">
          No difference between submitted answer and AI suggestion for this field.
        </div>
      );
    }
  } else {
    const displayVal = mode === "ai" ? aiVal : humanVal;
    body = isSheet ? (
      <SpreadsheetReadOnlyDisplay question={question} value={displayVal} hideLabel />
    ) : (
      <SingleFieldReadOnlyDisplay question={question} value={displayVal} hideLabel />
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-gray-700/80 dark:bg-gray-900/20 dark:shadow-none p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 gap-y-1 min-w-0">
          <label className="text-sm font-semibold text-slate-900 dark:text-gray-100">
            {question.label} {question.required && <span className="text-red-500">*</span>}
          </label>
          {plusHuman && <AwsHumanBadge />}
          {(hasAiSnapshot || onlyAws) && <AiFromAwsBadge />}
          {differs && <HumanEditedBadge />}
        </div>
      </div>

      {hasAiSnapshot && (
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-slate-600 dark:text-gray-400">Review filter — default shows the exact evidence on file.</p>
          <div
            className="inline-flex w-full max-w-2xl rounded-xl border border-slate-200 bg-slate-100 p-1 gap-0.5 dark:border-gray-600 dark:bg-gray-800/80"
            role="radiogroup"
            aria-label="Evidence view"
          >
            <button
              type="button"
              role="radio"
              aria-checked={mode === "submitted"}
              onClick={() => setMode("submitted")}
              className={segmentClass(mode === "submitted")}
            >
              <span className={cn("block font-semibold", mode === "submitted" ? "text-slate-900" : "text-slate-600")}>Submitted</span>
              <SegmentSubtitle active={mode === "submitted"}>Human answer</SegmentSubtitle>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={mode === "ai"}
              onClick={() => setMode("ai")}
              className={segmentClass(mode === "ai")}
            >
              <span className={cn("block font-semibold", mode === "ai" ? "text-slate-900" : "text-slate-600")}>AI (AWS)</span>
              <SegmentSubtitle active={mode === "ai"}>Generated</SegmentSubtitle>
            </button>
            {differs && (
              <button
                type="button"
                role="radio"
                aria-checked={mode === "edits"}
                onClick={() => setMode("edits")}
                className={segmentClass(mode === "edits")}
              >
                <span className={cn("block font-semibold", mode === "edits" ? "text-slate-900" : "text-slate-600")}>Changes only</span>
                <SegmentSubtitle active={mode === "edits"}>Human vs AI</SegmentSubtitle>
              </button>
            )}
          </div>
        </div>
      )}

      {hasAiSnapshot && !differs && mode !== "ai" && (
        <p className="text-[11px] font-medium text-slate-600 dark:text-gray-400">Submitted answer matches the stored AI suggestion.</p>
      )}

      <div className="pt-1">{body}</div>
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
      <div className="py-8 text-center text-sm text-slate-600">Loading…</div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-600">
        No questions configured for this evidence item.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {visibleQuestions.map((q) => {
        const srcMeta = q.evidence_source;
        const aiSnap = (formData[`${q.question_key}__ai`] ?? "").trim().length > 0;
        const showReviewerAiChrome = isAwsSource(srcMeta) || aiSnap;

        if (q.question_type === "file") {
          return (
            <div key={q.id} className="space-y-2.5 rounded-lg border border-transparent">
              <div className="flex flex-wrap items-center gap-2">
                <label className="block text-sm font-medium text-slate-800">
                  {q.label} {q.required && <span className="text-red-500">*</span>}
                </label>
                {isAwsPlusHuman(srcMeta) && <AwsHumanBadge />}
                {isAwsOnly(srcMeta) && <AiFromAwsBadge />}
              </div>
              {attachments.length > 0 ? (
                <div className="rounded-lg border border-slate-200 bg-white divide-y divide-slate-200 shadow-sm">
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
                        <p className="text-sm font-medium text-slate-900 truncate">{att.file_name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{formatBytes(att.file_size_bytes)}</p>
                      </div>
                      {onAttachmentClick ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAttachmentClick(att);
                          }}
                          className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                        >
                          View
                        </button>
                      ) : (
                        att.url && (
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                          >
                            Open
                          </a>
                        )
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-sm bg-slate-50 text-slate-500 min-h-10">
                  —
                </div>
              )}
            </div>
          );
        }
        if (q.question_type === "spreadsheet") {
          if (showReviewerAiChrome) {
            return <ReviewerEvidenceQuestionBlock key={q.id} question={q} formData={formData} />;
          }
          return (
            <SpreadsheetReadOnlyDisplay
              key={q.id}
              question={q}
              value={formData[q.question_key] ?? ""}
            />
          );
        }
        if (showReviewerAiChrome) {
          return <ReviewerEvidenceQuestionBlock key={q.id} question={q} formData={formData} />;
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
