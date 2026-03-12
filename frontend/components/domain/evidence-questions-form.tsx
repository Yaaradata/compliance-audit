"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import { CompactDropzone } from "@/components/domain/compact-dropzone";
import { EvidenceInputRenderer } from "@/components/domain/evidence-input-renderer";
import { FieldAINote } from "@/components/domain/field-ai-note";
import type { EvidenceQuestion, EvidenceInput } from "@/lib/types";

interface SpreadsheetColumn {
  key: string;
  label: string;
  type: "text" | "select";
  required?: boolean;
  options?: string[];
}

export interface EvidenceQuestionsFormProps {
  evidenceItemId: string;
  cycleId: string;
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onBlur?: () => void;
  submissionId: string | null;
  onUploadComplete?: () => void;
  onEnsureSubmission?: (itemId: string) => Promise<string | null>;
  fieldFeedback?: Record<string, string | null>;
  disabled?: boolean;
  /** Called when user focuses/clicks a question. Used to show its guide in the evaluation panel. */
  onQuestionFocus?: (questionKey: string, guide: string | null, label: string, element?: HTMLElement) => void;
}

function questionToInput(q: EvidenceQuestion): EvidenceInput {
  const type = q.question_type;
  const validType: EvidenceInput["type"] =
    type === "text" || type === "textarea" || type === "select" || type === "date" || type === "checkbox"
      ? type
      : "text";
  return {
    id: q.question_key,
    label: q.label,
    type: validType,
    required: q.required,
    placeholder: q.placeholder ?? undefined,
    options: q.options?.filter((o): o is string => typeof o === "string") ?? [],
  };
}

/** Only the DB `guide` column — do not use label or upload_label in the guide section. */
function getQuestionGuide(q: EvidenceQuestion): string | null {
  return q.guide ?? null;
}

function SpreadsheetQuestionRenderer({
  question,
  value,
  onChange,
  onBlur,
  disabled,
  fieldFeedbackHint,
  onFocus,
}: {
  question: EvidenceQuestion;
  value: string;
  onChange: (val: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  fieldFeedbackHint?: string | null;
  onFocus?: (e: React.FocusEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => void;
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
  if (rows.length === 0) rows = [{}];

  const handleRowChange = (index: number, key: string, val: string) => {
    const next = [...rows];
    next[index] = { ...next[index], [key]: val };
    onChange(JSON.stringify(next));
  };
  const handleAddRow = () => onChange(JSON.stringify([...rows, {}]));
  const handleRemoveRow = (index: number) => {
    const next = rows.filter((_, i) => i !== index);
    onChange(JSON.stringify(next.length ? next : [{}]));
  };

  const inputClass = "border border-gray-300 rounded px-2 py-1.5 text-sm w-full min-w-0";
  const selectClass = "border border-gray-300 rounded px-2 py-1.5 text-sm w-full min-w-0 bg-white";

  return (
    <div
      className="space-y-2.5 rounded-lg -m-1 p-1 hover:bg-gray-50/50 transition-colors border border-transparent hover:border-gray-200 focus-within:border-(--primary)/30 focus-within:ring-1 focus-within:ring-(--primary)/20"
      onClick={(e) => onFocus?.(e)}
      onFocus={(e) => onFocus?.(e)}
      role="group"
      aria-label={question.label}
    >
      <div className="flex flex-wrap items-baseline gap-2">
        <label className="block text-sm font-medium text-gray-700">
          {question.label} {question.required && <span className="text-red-500">*</span>}
        </label>
        <FieldAINote text={fieldFeedbackHint} fieldLabel={question.label} variant="inline" />
      </div>
      <div className="rounded border border-gray-200 bg-white max-h-[400px] overflow-auto">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max border-collapse">
            <thead>
              <tr className="sticky top-0 z-10 bg-gray-100">
                <th className="border-b border-r border-gray-200 px-2.5 py-2 text-left text-xs font-semibold uppercase text-gray-700 w-8">#</th>
                {columns.map((col) => (
                  <th key={col.key} className="border-b border-r border-gray-200 px-2.5 py-2 text-left text-xs font-semibold uppercase text-gray-700 whitespace-nowrap">
                    {col.label}
                    {col.required && <span className="text-red-500 ml-0.5">*</span>}
                  </th>
                ))}
                <th className="border-b border-gray-200 px-2.5 py-2 w-8" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border-b border-r border-gray-200 px-2.5 py-1.5 text-sm text-gray-500">{index + 1}</td>
                  {columns.map((col) => (
                    <td key={col.key} className="border-b border-r border-gray-200 p-0.5">
                      {col.type === "select" ? (
                        <select
                          value={row[col.key] ?? ""}
                          onChange={(e) => handleRowChange(index, col.key, e.target.value)}
                          onBlur={onBlur}
                          disabled={disabled}
                          className={selectClass}
                        >
                          {(col.options ?? []).map((opt) => (
                            <option key={opt} value={opt}>{opt || "—"}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={row[col.key] ?? ""}
                          onChange={(e) => handleRowChange(index, col.key, e.target.value)}
                          onBlur={onBlur}
                          disabled={disabled}
                          className={inputClass}
                          placeholder={col.required ? "(required)" : ""}
                        />
                      )}
                    </td>
                  ))}
                  <td className="border-b border-gray-200 px-1 py-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(index)}
                      disabled={disabled}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-0.5 text-sm font-bold disabled:opacity-50"
                      aria-label="Remove row"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-200 p-2">
          <button
            type="button"
            onClick={handleAddRow}
            disabled={disabled}
            className="w-full rounded border-2 border-dashed border-green-400 bg-green-50 py-2 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
          >
            + Add Row
          </button>
        </div>
      </div>
    </div>
  );
}

export function EvidenceQuestionsForm({
  evidenceItemId,
  cycleId,
  formData,
  onChange,
  onBlur,
  submissionId,
  onUploadComplete,
  onEnsureSubmission,
  fieldFeedback,
  disabled,
  onQuestionFocus,
}: EvidenceQuestionsFormProps) {
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

  /** Hide the "Describe how the secure zone boundary..." textarea — guide-only, no extra box. */
  const isQuestionShownInForm = useCallback((q: EvidenceQuestion): boolean => {
    if (q.question_type !== "textarea") return true;
    const p = (q.placeholder ?? "").trim();
    if (p.includes("logical/physical separation method") || p.includes("firewall devices at every ingress/egress")) return false;
    return true;
  }, []);

  const visibleQuestions = questions.filter(isQuestionVisible).filter(isQuestionShownInForm);

  // Set first question's guide when evidence item changes or questions first load
  const initializedForItemRef = useRef<string | null>(null);
  useEffect(() => {
    if (!onQuestionFocus || visibleQuestions.length === 0) return;
    if (initializedForItemRef.current !== evidenceItemId) {
      initializedForItemRef.current = evidenceItemId;
      const first = visibleQuestions[0];
      onQuestionFocus(first.question_key, getQuestionGuide(first), first.label);
    }
  }, [evidenceItemId, visibleQuestions, onQuestionFocus]);

  const markFileUploaded = useCallback((key: string) => {
    onUploadComplete?.();
  }, [onUploadComplete]);

  if (loading) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">Loading questions…</div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">
        No questions configured for this evidence item. Ensure the database is seeded with evidence_based_questions.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {visibleQuestions.map((q) => {
        if (q.question_type === "file") {
          const handleFocus = (e: React.FocusEvent | React.MouseEvent) =>
            onQuestionFocus?.(q.question_key, getQuestionGuide(q), q.label, e.currentTarget as HTMLElement);
          return (
            <div
              key={q.id}
              className="space-y-2.5 rounded-lg -m-1 p-1 hover:bg-gray-50/50 transition-colors border border-transparent hover:border-gray-200 focus-within:border-(--primary)/30 focus-within:ring-1 focus-within:ring-(--primary)/20"
              onClick={handleFocus}
              onFocus={handleFocus}
              role="group"
              aria-label={q.label}
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <label className="block text-sm font-medium text-gray-700">{q.label}</label>
                <FieldAINote text={fieldFeedback?.[q.question_key]} fieldLabel={q.label} variant="inline" />
              </div>
              <CompactDropzone
                submissionId={submissionId}
                label="Drop files or click to upload"
                onUploadComplete={() => onUploadComplete?.()}
                onEnsureSubmission={() => onEnsureSubmission?.(evidenceItemId) ?? Promise.resolve(null)}
                className="min-h-[140px]"
              />
            </div>
          );
        }
        if (q.question_type === "spreadsheet") {
          return (
            <SpreadsheetQuestionRenderer
              key={q.id}
              question={q}
              value={formData[q.question_key] ?? ""}
              onChange={(val) => onChange(q.question_key, val)}
              onBlur={onBlur}
              disabled={disabled}
              fieldFeedbackHint={fieldFeedback?.[q.question_key]}
              onFocus={(e) => onQuestionFocus?.(q.question_key, getQuestionGuide(q), q.label, e.currentTarget)}
            />
          );
        }
        const input = questionToInput(q);
        if (input.type === "textarea" && q.rows) {
          input.type = "textarea";
        }
        const handleFocus = (e: React.FocusEvent | React.MouseEvent) =>
          onQuestionFocus?.(q.question_key, getQuestionGuide(q), q.label, e.currentTarget as HTMLElement);
        return (
          <div
            key={q.id}
            className="rounded-lg -m-1 p-1 hover:bg-gray-50/50 transition-colors border border-transparent hover:border-gray-200 focus-within:border-(--primary)/30 focus-within:ring-1 focus-within:ring-(--primary)/20"
            onClick={handleFocus}
            onFocusCapture={handleFocus}
            role="group"
            aria-label={q.label}
          >
            <EvidenceInputRenderer
              input={input}
              value={formData[q.question_key] ?? ""}
              onChangeValue={(val) => onChange(q.question_key, val)}
              onBlur={onBlur}
              onFileUpload={markFileUploaded}
              fieldFeedbackHint={fieldFeedback?.[q.question_key]}
            />
          </div>
        );
      })}
    </div>
  );
}
