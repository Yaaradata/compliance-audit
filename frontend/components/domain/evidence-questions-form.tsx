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
  onQuestionFocus?: (questionKey: string, guide: string | null, label: string, element?: HTMLElement, isLastQuestion?: boolean) => void;
  /** True while LLM suggestions are being fetched for this item. */
  aiSuggestLoading?: boolean;
  /** LLM-suggested values keyed by question_key. */
  aiSuggestions?: Record<string, string>;
  /** Maps question_key to evidence_source classification (e.g. "AWS", "AWS + Human"). */
  questionSources?: Record<string, string>;
}

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

function getQuestionGuide(q: EvidenceQuestion): string | null {
  return q.guide ?? null;
}

function AiFieldSpinner() {
  return (
    <div className="flex items-center gap-2 py-3 px-3 rounded-lg border border-sky-200 bg-sky-50/60 dark:border-sky-800 dark:bg-sky-950/30 animate-pulse">
      <span className="inline-block size-4 border-2 border-sky-300 border-t-sky-600 rounded-full animate-spin shrink-0" />
      <span className="text-xs font-medium text-sky-700 dark:text-sky-300">AI is generating a response…</span>
    </div>
  );
}

function AiBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
      <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a1 1 0 011 1v1.07A5.001 5.001 0 0113 8a5 5 0 01-4 4.9V14a1 1 0 11-2 0v-1.1A5.001 5.001 0 013 8a5 5 0 014-4.93V2a1 1 0 011-1zm0 4a3 3 0 100 6 3 3 0 000-6z"/></svg>
      AI
    </span>
  );
}

function DualTabField({
  question,
  input,
  aiValue,
  humanValue,
  onChangeAi,
  onChangeHuman,
  onBlur,
  fieldFeedbackHint,
  disabled,
}: {
  question: EvidenceQuestion;
  input: EvidenceInput;
  aiValue: string;
  humanValue: string;
  onChangeAi: (val: string) => void;
  onChangeHuman: (val: string) => void;
  onBlur?: () => void;
  fieldFeedbackHint?: string | null;
  disabled?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"ai" | "human">("ai");

  const tabClass = (tab: "ai" | "human") =>
    `px-3 py-1.5 text-xs font-semibold rounded-t-lg border border-b-0 transition-colors ${
      activeTab === tab
        ? tab === "ai"
          ? "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800"
          : "bg-white text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700"
        : "bg-gray-50 text-gray-400 border-transparent hover:text-gray-600 dark:bg-gray-800 dark:text-gray-500 dark:hover:text-gray-300"
    }`;

  const renderInput = (value: string, onChange: (val: string) => void, isAi: boolean) => {
    const rows = question.rows ?? 3;
    const placeholder = isAi ? "AI-generated response" : (question.placeholder ?? "Enter your response here…");

    if (input.type === "select") {
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white"
        >
          <option value="">Select...</option>
          {input.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    }
    if (input.type === "textarea") {
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm resize-y"
        />
      );
    }
    if (input.type === "date") {
      return (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
        />
      );
    }
    if (input.type === "checkbox") {
      return (
        <label className="flex items-start gap-2 py-1 cursor-pointer">
          <input
            type="checkbox"
            checked={value === "true"}
            onChange={(e) => onChange(String(e.target.checked))}
            onBlur={onBlur}
            disabled={disabled}
            className="mt-0.5 rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">{isAi ? "AI-selected" : "Your selection"}</span>
        </label>
      );
    }
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
      />
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-2 mb-1">
        <label className="text-sm font-medium text-gray-700">
          {question.label} {question.required && <span className="text-red-500">*</span>}
        </label>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          AWS + Human
        </span>
        <FieldAINote text={fieldFeedbackHint} fieldLabel={question.label} variant="inline" />
      </div>
      <div className="flex gap-0.5 mt-1">
        <button type="button" className={tabClass("ai")} onClick={() => setActiveTab("ai")}>
          AI Response
        </button>
        <button type="button" className={tabClass("human")} onClick={() => setActiveTab("human")}>
          Human Response
        </button>
      </div>
      <div className={`rounded-b-lg rounded-tr-lg border p-3 ${
        activeTab === "ai"
          ? "border-sky-200 bg-sky-50/30 dark:border-sky-800 dark:bg-sky-950/20"
          : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
      }`}>
        {activeTab === "ai" ? (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <AiBadge />
              <span className="text-[10px] text-sky-600 dark:text-sky-400">Auto-filled from AWS evidence — editable</span>
            </div>
            {renderInput(aiValue, onChangeAi, true)}
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] text-gray-500">Your manual response</span>
            </div>
            {renderInput(humanValue, onChangeHuman, false)}
          </div>
        )}
      </div>
    </div>
  );
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
      className="space-y-2 rounded-lg"
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

function DualTabSpreadsheet({
  question,
  aiValue,
  humanValue,
  onChangeAi,
  onChangeHuman,
  onBlur,
  disabled,
  fieldFeedbackHint,
  onFocus,
}: {
  question: EvidenceQuestion;
  aiValue: string;
  humanValue: string;
  onChangeAi: (val: string) => void;
  onChangeHuman: (val: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  fieldFeedbackHint?: string | null;
  onFocus?: (e: React.FocusEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => void;
}) {
  const [activeTab, setActiveTab] = useState<"ai" | "human">("ai");
  const tabCls = (tab: "ai" | "human") =>
    `px-3 py-1.5 text-xs font-semibold rounded-t-lg border border-b-0 transition-colors ${
      activeTab === tab
        ? tab === "ai"
          ? "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800"
          : "bg-white text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700"
        : "bg-gray-50 text-gray-400 border-transparent hover:text-gray-600 dark:bg-gray-800 dark:text-gray-500 dark:hover:text-gray-300"
    }`;

  return (
    <div role="group" aria-label={question.label}>
      <div className="flex flex-wrap items-baseline gap-2 mb-1">
        <label className="block text-sm font-medium text-gray-700">
          {question.label} {question.required && <span className="text-red-500">*</span>}
        </label>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          AWS + Human
        </span>
      </div>
      <div className="flex gap-0.5 mt-1">
        <button type="button" className={tabCls("ai")} onClick={() => setActiveTab("ai")}>AI Response</button>
        <button type="button" className={tabCls("human")} onClick={() => setActiveTab("human")}>Human Response</button>
      </div>
      <div className={`rounded-b-lg rounded-tr-lg border p-3 ${
        activeTab === "ai"
          ? "border-sky-200 bg-sky-50/30 dark:border-sky-800 dark:bg-sky-950/20"
          : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
      }`}>
        {activeTab === "ai" ? (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <AiBadge />
              <span className="text-[10px] text-sky-600 dark:text-sky-400">Auto-filled from AWS evidence — editable</span>
            </div>
            <SpreadsheetQuestionRenderer
              question={question}
              value={aiValue}
              onChange={onChangeAi}
              onBlur={onBlur}
              disabled={disabled}
              fieldFeedbackHint={fieldFeedbackHint}
              onFocus={onFocus}
            />
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] text-gray-500">Your manual response</span>
            </div>
            <SpreadsheetQuestionRenderer
              question={question}
              value={humanValue}
              onChange={onChangeHuman}
              onBlur={onBlur}
              disabled={disabled}
              fieldFeedbackHint={fieldFeedbackHint}
              onFocus={onFocus}
            />
          </div>
        )}
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
  aiSuggestLoading,
  aiSuggestions,
  questionSources,
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

  const isQuestionShownInForm = useCallback((q: EvidenceQuestion): boolean => {
    if (q.question_type !== "textarea") return true;
    const p = (q.placeholder ?? "").trim();
    if (p.includes("logical/physical separation method") || p.includes("firewall devices at every ingress/egress")) return false;
    return true;
  }, []);

  const visibleQuestions = questions.filter(isQuestionVisible).filter(isQuestionShownInForm);

  const initializedForItemRef = useRef<string | null>(null);
  useEffect(() => {
    if (!onQuestionFocus || visibleQuestions.length === 0) return;
    if (initializedForItemRef.current !== evidenceItemId) {
      initializedForItemRef.current = evidenceItemId;
      const first = visibleQuestions[0];
      onQuestionFocus(first.question_key, getQuestionGuide(first), first.label, undefined, visibleQuestions.length === 1);
    }
  }, [evidenceItemId, visibleQuestions, onQuestionFocus]);

  const markFileUploaded = useCallback((_key: string) => {
    onUploadComplete?.();
  }, [onUploadComplete]);

  const getEffectiveSource = useCallback((q: EvidenceQuestion): string | null => {
    if (questionSources && questionSources[q.question_key]) return questionSources[q.question_key];
    return q.evidence_source ?? null;
  }, [questionSources]);

  const shouldShowSpinner = useCallback((q: EvidenceQuestion): boolean => {
    if (!aiSuggestLoading) return false;
    const src = getEffectiveSource(q);
    return isAwsSource(src);
  }, [aiSuggestLoading, getEffectiveSource]);

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
    <div className="space-y-4">
      {visibleQuestions.map((q, index) => {
        const isLastQuestion = index === visibleQuestions.length - 1;
        const src = getEffectiveSource(q);
        const showSpinner = shouldShowSpinner(q);
        const qType = (q.question_type || "").toLowerCase();

        if (q.question_type === "file") {
          const handleFocus = (e: React.FocusEvent | React.MouseEvent) =>
            onQuestionFocus?.(q.question_key, getQuestionGuide(q), q.label, e.currentTarget as HTMLElement, isLastQuestion);
          return (
            <div
              key={q.id}
              className="space-y-1.5"
              onClick={handleFocus}
              onFocus={handleFocus}
              role="group"
              aria-label={q.label}
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <label className="block text-sm font-medium text-gray-700">{q.label}</label>
                {isAwsSource(src) && <AiBadge />}
                <FieldAINote text={fieldFeedback?.[q.question_key]} fieldLabel={q.label} variant="inline" />
              </div>
              <CompactDropzone
                submissionId={submissionId}
                label="Drop files or click to upload"
                onUploadComplete={() => onUploadComplete?.()}
                onEnsureSubmission={() => onEnsureSubmission?.(evidenceItemId) ?? Promise.resolve(null)}
              />
            </div>
          );
        }

        if (q.question_type === "spreadsheet") {
          const handleSpreadsheetFocus = (e: React.FocusEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) =>
            onQuestionFocus?.(q.question_key, getQuestionGuide(q), q.label, e.currentTarget, isLastQuestion);
          const spreadsheetSrc = getEffectiveSource(q);
          const spreadsheetIsAwsHuman = isAwsPlusHuman(spreadsheetSrc);
          const spreadsheetIsAws = isAwsOnly(spreadsheetSrc);
          const spreadsheetShowSpinner = shouldShowSpinner(q);

          if (spreadsheetShowSpinner) {
            return (
              <div key={q.id} className="rounded-lg" role="group" aria-label={q.label}>
                <div className="flex flex-wrap items-baseline gap-2 mb-1">
                  <label className="text-sm font-medium text-gray-700">
                    {q.label} {q.required && <span className="text-red-500">*</span>}
                  </label>
                  {spreadsheetIsAwsHuman && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      AWS + Human
                    </span>
                  )}
                  {spreadsheetIsAws && <AiBadge />}
                </div>
                <AiFieldSpinner />
              </div>
            );
          }

          if (spreadsheetIsAwsHuman) {
            const aiKey = `${q.question_key}__ai`;
            return (
              <DualTabSpreadsheet
                key={q.id}
                question={q}
                aiValue={formData[aiKey] ?? ""}
                humanValue={formData[q.question_key] ?? ""}
                onChangeAi={(val) => onChange(aiKey, val)}
                onChangeHuman={(val) => onChange(q.question_key, val)}
                onBlur={onBlur}
                disabled={disabled}
                fieldFeedbackHint={fieldFeedback?.[q.question_key]}
                onFocus={handleSpreadsheetFocus}
              />
            );
          }

          if (spreadsheetIsAws) {
            return (
              <div key={q.id} className="rounded-lg" role="group" aria-label={q.label}>
                <div className="flex items-center gap-1.5 mb-1">
                  <AiBadge />
                  <span className="text-[10px] text-sky-600 dark:text-sky-400">Auto-filled from AWS — editable</span>
                </div>
                <SpreadsheetQuestionRenderer
                  question={q}
                  value={formData[q.question_key] ?? ""}
                  onChange={(val) => onChange(q.question_key, val)}
                  onBlur={onBlur}
                  disabled={disabled}
                  fieldFeedbackHint={fieldFeedback?.[q.question_key]}
                  onFocus={handleSpreadsheetFocus}
                />
              </div>
            );
          }

          return (
            <SpreadsheetQuestionRenderer
              key={q.id}
              question={q}
              value={formData[q.question_key] ?? ""}
              onChange={(val) => onChange(q.question_key, val)}
              onBlur={onBlur}
              disabled={disabled}
              fieldFeedbackHint={fieldFeedback?.[q.question_key]}
              onFocus={handleSpreadsheetFocus}
            />
          );
        }

        if (showSpinner) {
          return (
            <div key={q.id} className="rounded-lg" role="group" aria-label={q.label}>
              <div className="flex flex-wrap items-baseline gap-2 mb-1">
                <label className="text-sm font-medium text-gray-700">
                  {q.label} {q.required && <span className="text-red-500">*</span>}
                </label>
                {isAwsPlusHuman(src) && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    AWS + Human
                  </span>
                )}
                {isAwsOnly(src) && <AiBadge />}
              </div>
              <AiFieldSpinner />
            </div>
          );
        }

        if (isAwsPlusHuman(src)) {
          const input = questionToInput(q);
          const aiKey = `${q.question_key}__ai`;
          const handleFocus = (e: React.FocusEvent | React.MouseEvent) =>
            onQuestionFocus?.(q.question_key, getQuestionGuide(q), q.label, e.currentTarget as HTMLElement, isLastQuestion);
          return (
            <div key={q.id} className="rounded-lg" onClick={handleFocus} onFocusCapture={handleFocus} role="group" aria-label={q.label}>
              <DualTabField
                question={q}
                input={input}
                aiValue={formData[aiKey] ?? ""}
                humanValue={formData[q.question_key] ?? ""}
                onChangeAi={(val) => onChange(aiKey, val)}
                onChangeHuman={(val) => onChange(q.question_key, val)}
                onBlur={onBlur}
                fieldFeedbackHint={fieldFeedback?.[q.question_key]}
                disabled={disabled}
              />
            </div>
          );
        }

        const input = questionToInput(q);
        if (input.type === "textarea" && q.rows) {
          input.type = "textarea";
        }
        const handleFocus = (e: React.FocusEvent | React.MouseEvent) =>
          onQuestionFocus?.(q.question_key, getQuestionGuide(q), q.label, e.currentTarget as HTMLElement, isLastQuestion);

        const isAws = isAwsOnly(src);

        return (
          <div
            key={q.id}
            className="rounded-lg"
            onClick={handleFocus}
            onFocusCapture={handleFocus}
            role="group"
            aria-label={q.label}
          >
            {/* Always show for AWS-only fields (gating on value hid the badge for empty selects until first change → flicker) */}
            {isAws && (
              <div className="flex items-center gap-1.5 mb-1">
                <AiBadge />
                <span className="text-[10px] text-sky-600 dark:text-sky-400">
                  AWS-assisted from collected evidence — editable
                </span>
              </div>
            )}
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
