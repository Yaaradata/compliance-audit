"use client";

import { useState, useEffect, useCallback, useRef, useId } from "react";
import { Info } from "lucide-react";
import "@/components/review/swift-review-template/swift-review-template.css";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
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
  /** Per-question reasons from suggest-from-aws when the model left the field empty. */
  awsSuggestionGaps?: Record<string, string>;
  /** True after a suggest-from-aws round finished for this item (success or error). */
  awsSuggestRoundDone?: boolean;
  /**
   * `swiftReview`: match cycle review evidence UI (Swift tokens, navy AI tab, amber AWS+HUMAN, compact grid).
   * Wraps the form in `.swift-review-tpl.swift-review-embed` so CSS variables apply.
   */
  visualVariant?: "default" | "swiftReview";
}

export type EvidenceFormVisualVariant = "default" | "swiftReview";

const DEFAULT_AWS_GAP_HINT =
  "No value could be derived from the collected AWS evidence for this field. Run AWS collection for this evidence item or answer manually.";

/** Context for the (i) “why no AI value” control — avoids hiding it when suggest round never completes (e.g. locked submission). */
export type AwsGapContext = {
  gaps?: Record<string, string>;
  roundDone?: boolean;
  suggestLoading?: boolean;
  disabled?: boolean;
};

function resolveAwsGapExplanation(
  questionKey: string,
  questionType: string,
  currentValue: string,
  opts: AwsGapContext
): string {
  const custom = (opts.gaps?.[questionKey] ?? "").trim();
  if (custom) return custom;
  if (opts.suggestLoading) {
    return "A suggestion for this field is still being generated.";
  }
  if (opts.disabled) {
    return "This submission is read-only. No new AWS suggestion is applied here; if the field is empty, no value was stored or it was cleared. Enter a value only if your workflow allows edits.";
  }
  if (!opts.roundDone) {
    return "AWS suggestions have not finished loading yet. Wait a few seconds or click “Re-generate AWS suggestions” at the top of this panel.";
  }
  if (questionType === "select") {
    return `${DEFAULT_AWS_GAP_HINT} The model may also decline to pick an option when evidence is ambiguous or the choices do not match AWS data.`;
  }
  return DEFAULT_AWS_GAP_HINT;
}

function hasMeaningfulAiValue(questionType: string, value: string): boolean {
  const t = (value ?? "").trim();
  if (!t) return false;
  if (questionType === "spreadsheet") {
    try {
      const rows = JSON.parse(t);
      if (!Array.isArray(rows) || rows.length === 0) return false;
      return rows.some((row) =>
        row && typeof row === "object" && Object.values(row).some((c) => String(c ?? "").trim() !== "")
      );
    } catch {
      return false;
    }
  }
  return true;
}

/**
 * True when the user still has no usable answer for AWS-assisted auto-fill messaging.
 * Selects: empty OR stored value not in current options (React shows "Select..." but value is stale).
 */
function awsFieldLooksUnfilled(input: EvidenceInput, question: EvidenceQuestion, raw: string): boolean {
  const v = (raw ?? "").trim();
  if (input.type === "select") {
    const opts = input.options ?? [];
    if (!v) return true;
    if (opts.length > 0 && !opts.includes(v)) return true;
    return false;
  }
  if (input.type === "checkbox") {
    return v !== "true";
  }
  return !hasMeaningfulAiValue(question.question_type, raw);
}

function buildAwsGapTooltipText(
  questionKey: string,
  question: EvidenceQuestion,
  input: EvidenceInput,
  raw: string,
  ctx: AwsGapContext
): string {
  const qTypeForResolve = input.type === "select" ? "select" : question.question_type;
  const base = resolveAwsGapExplanation(questionKey, qTypeForResolve, raw, ctx);
  if (input.type === "select") {
    const v = (raw ?? "").trim();
    const opts = input.options ?? [];
    if (v && opts.length > 0 && !opts.includes(v)) {
      return `The saved value does not match any current dropdown option (options or evidence config may have changed). Choose a valid option. ${base}`;
    }
  }
  return base;
}

function AwsDataGapInfo({ text, swift }: { text: string; swift?: boolean }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const el = rootRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={rootRef} className="relative inline-flex items-center ml-0.5 align-middle shrink-0">
      <button
        type="button"
        className={
          swift
            ? "inline-flex h-7 w-7 min-h-7 min-w-7 items-center justify-center rounded-full border-2 border-[var(--blue)]/35 bg-[var(--blue-lt)] text-[var(--blue)] shadow-[var(--shadow-xs)] hover:bg-[var(--blue-mid)]/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)]/25"
            : "inline-flex h-7 w-7 min-h-7 min-w-7 items-center justify-center rounded-full border-2 border-sky-300 bg-sky-50 text-sky-800 shadow-sm hover:bg-sky-100 hover:border-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-sky-700 dark:bg-sky-950/80 dark:text-sky-200 dark:hover:bg-sky-900/80"
        }
        aria-label="Why is there no AI suggestion for this field?"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen((v) => !v);
        }}
      >
        <Info className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
      </button>
      {open ? (
        <span
          id={panelId}
          role="tooltip"
          className={
            swift
              ? "absolute left-0 top-full z-80 mt-1 w-[min(20rem,calc(100vw-2rem))] rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2 text-left text-[11px] leading-snug text-[var(--text-secondary)] shadow-[var(--shadow-md)]"
              : "absolute left-0 top-full z-80 mt-1 w-[min(20rem,calc(100vw-2rem))] rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-left text-[11px] leading-snug text-slate-700 shadow-lg dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
          }
        >
          {text}
        </span>
      ) : null}
    </span>
  );
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

function AiFieldSpinner({ swift }: { swift?: boolean }) {
  return (
    <div
      className={
        swift
          ? "flex items-center gap-2 py-2.5 px-3 rounded-lg border border-[var(--blue)]/25 bg-[var(--blue-lt)] animate-pulse"
          : "flex items-center gap-2 py-3 px-3 rounded-lg border border-sky-200 bg-sky-50/60 dark:border-sky-800 dark:bg-sky-950/30 animate-pulse"
      }
    >
      <span
        className={
          swift
            ? "inline-block size-4 border-2 border-[var(--blue)]/30 border-t-[var(--blue)] rounded-full animate-spin shrink-0"
            : "inline-block size-4 border-2 border-sky-300 border-t-sky-600 rounded-full animate-spin shrink-0"
        }
      />
      <span
        className={
          swift
            ? "text-xs font-medium text-[var(--blue)]"
            : "text-xs font-medium text-sky-700 dark:text-sky-300"
        }
      >
        AI is generating a response…
      </span>
    </div>
  );
}

function AiBadge({ swift }: { swift?: boolean }) {
  return (
    <span
      className={
        swift
          ? "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[var(--blue-lt)] text-[var(--blue)] border border-[var(--blue-mid)] shadow-[var(--shadow-xs)]"
          : "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-900 border border-sky-200/90 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-800"
      }
    >
      <svg className="size-3" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
        <path d="M8 1a1 1 0 011 1v1.07A5.001 5.001 0 0113 8a5 5 0 01-4 4.9V14a1 1 0 11-2 0v-1.1A5.001 5.001 0 013 8a5 5 0 014-4.93V2a1 1 0 011-1zm0 4a3 3 0 100 6 3 3 0 000-6z" />
      </svg>
      AI
    </span>
  );
}

/** Amber “AWS + Human” chip — matches evidence review readonly. */
function AwsHumanChip({ swift }: { swift: boolean }) {
  return (
    <span
      className={
        swift
          ? "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[var(--amber-lt)] text-[var(--amber)] border border-[var(--amber-mid)] shadow-[var(--shadow-xs)]"
          : "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
      }
    >
      {swift ? "AWS + HUMAN" : "AWS + Human"}
    </span>
  );
}

function dualTabBarClass(active: boolean, swift: boolean): string {
  if (swift) {
    return cn(
      "px-4 py-2 text-xs font-semibold rounded-t-[var(--radius)] border border-b-0 transition-colors",
      active
        ? "z-[1] bg-[var(--text-primary)] text-white border-[var(--border)] shadow-[var(--shadow-xs)]"
        : "bg-[var(--surface-2)] text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)] hover:bg-[var(--border)]/30"
    );
  }
  return cn(
    "px-3 py-1.5 text-xs font-semibold rounded-t-md border border-b-0 transition-colors",
    active
      ? "bg-white text-slate-900 border-slate-200 shadow-sm z-[1] dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600"
      : "bg-slate-100/90 text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100 dark:bg-slate-800/80 dark:text-slate-500 dark:hover:text-slate-300"
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
  awsGapContext,
  visualVariant = "default",
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
  awsGapContext: AwsGapContext;
  visualVariant?: EvidenceFormVisualVariant;
}) {
  const swift = visualVariant === "swiftReview";
  const [activeTab, setActiveTab] = useState<"ai" | "human">("ai");
  const aiEmpty = awsFieldLooksUnfilled(input, question, aiValue);
  const showGapInfo = Boolean(activeTab === "ai" && aiEmpty && !awsGapContext.suggestLoading);
  const gapText = buildAwsGapTooltipText(question.question_key, question, input, aiValue, awsGapContext);

  const ctlSwift =
    "w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue)]/15 disabled:opacity-60";
  const ctlDefault = "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm";

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
          className={swift ? `${ctlSwift} bg-[var(--surface)]` : `${ctlDefault} bg-white`}
        >
          <option value="">Select...</option>
          {input.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
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
          className={swift ? `${ctlSwift} resize-y min-h-[4.5rem] leading-snug` : `${ctlDefault} resize-y`}
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
          className={swift ? ctlSwift : ctlDefault}
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
            className={swift ? "mt-0.5 rounded border-[var(--border)]" : "mt-0.5 rounded border-gray-300"}
          />
          <span className={swift ? "text-xs text-[var(--text-secondary)]" : "text-sm text-gray-700"}>
            {isAi ? "AI-selected" : "Your selection"}
          </span>
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
        className={swift ? ctlSwift : ctlDefault}
      />
    );
  };

  return (
    <div className="min-w-0">
      <div className={cn("flex flex-wrap items-baseline gap-2", swift ? "mb-2" : "mb-1")}>
        <label
          className={
            swift ? "text-sm font-semibold text-[var(--text-primary)]" : "text-sm font-medium text-gray-700"
          }
        >
          {question.label} {question.required && <span className="text-red-500">*</span>}
        </label>
        <AwsHumanChip swift={swift} />
        <FieldAINote text={fieldFeedbackHint} fieldLabel={question.label} variant="inline" />
      </div>
      <div className="flex gap-0.5 mt-1">
        <button type="button" className={dualTabBarClass(activeTab === "ai", swift)} onClick={() => setActiveTab("ai")}>
          AI Response
        </button>
        <button
          type="button"
          className={dualTabBarClass(activeTab === "human", swift)}
          onClick={() => setActiveTab("human")}
        >
          Human Response
        </button>
      </div>
      <div
        className={cn(
          swift
            ? "rounded-b-[var(--radius)] rounded-tr-[var(--radius)] border border-[var(--border)] bg-[var(--surface-2)] p-4 shadow-[var(--shadow-xs)]"
            : cn(
                "rounded-b-lg rounded-tr-lg border p-3",
                activeTab === "ai"
                  ? "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/40"
                  : "border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900/30"
              )
        )}
      >
        {activeTab === "ai" ? (
          <div className={cn(swift && "rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3")}>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <AiBadge swift={swift} />
              <span
                className={
                  swift
                    ? "text-[10px] font-medium text-[var(--text-muted)]"
                    : "text-[10px] font-medium text-slate-600 dark:text-slate-400"
                }
              >
                Suggested from AWS evidence — editable in this tab
              </span>
              {showGapInfo && input.type !== "select" && <AwsDataGapInfo text={gapText} swift={swift} />}
            </div>
            {input.type === "select" ? (
              <div>
                {showGapInfo && (
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <AwsDataGapInfo text={gapText} swift={swift} />
                    <span
                      className={
                        swift
                          ? "text-[10px] text-[var(--text-muted)]"
                          : "text-[10px] text-slate-500 dark:text-slate-400"
                      }
                    >
                      No option chosen from AWS — tap (i) for why
                    </span>
                  </div>
                )}
                {renderInput(aiValue, onChangeAi, true)}
              </div>
            ) : (
              renderInput(aiValue, onChangeAi, true)
            )}
          </div>
        ) : (
          <div className={cn(swift && "rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3")}>
            <div className="flex items-center gap-1.5 mb-2">
              <span className={swift ? "text-[10px] text-[var(--text-muted)]" : "text-[10px] text-gray-500"}>
                Your manual response
              </span>
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
  hideLabel = false,
  visualVariant = "default",
}: {
  question: EvidenceQuestion;
  value: string;
  onChange: (val: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  fieldFeedbackHint?: string | null;
  onFocus?: (e: React.FocusEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => void;
  /** Hide title row when the parent (e.g. dual-tab block) already shows the label. */
  hideLabel?: boolean;
  visualVariant?: EvidenceFormVisualVariant;
}) {
  const swift = visualVariant === "swiftReview";
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

  const inputClass = swift
    ? "border border-[var(--border)] rounded-md px-2 py-1 text-xs w-full min-w-0 bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--blue)] focus:ring-1 focus:ring-[var(--blue)]/20"
    : "border border-gray-300 rounded px-2 py-1.5 text-sm w-full min-w-0";
  const selectClass = swift
    ? `${inputClass} bg-[var(--surface)]`
    : "border border-gray-300 rounded px-2 py-1.5 text-sm w-full min-w-0 bg-white";

  return (
    <div
      className={cn("min-w-0", hideLabel ? "space-y-0" : "space-y-2 rounded-lg")}
      onClick={(e) => onFocus?.(e)}
      onFocus={(e) => onFocus?.(e)}
      role="group"
      aria-label={question.label}
    >
      {!hideLabel && (
        <div className="flex flex-wrap items-baseline gap-2">
          <label
            className={
              swift ? "block text-sm font-semibold text-[var(--text-primary)]" : "block text-sm font-medium text-gray-700"
            }
          >
            {question.label} {question.required && <span className="text-red-500">*</span>}
          </label>
          <FieldAINote text={fieldFeedbackHint} fieldLabel={question.label} variant="inline" />
        </div>
      )}
      <div
        className={
          swift
            ? "rounded-xl border border-[var(--border)] bg-[var(--surface)] max-h-[min(52vh,380px)] overflow-auto shadow-[var(--shadow-xs)]"
            : "rounded border border-gray-200 bg-white max-h-[400px] overflow-auto"
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-max border-collapse">
            <thead>
              <tr
                className={
                  swift
                    ? "sticky top-0 z-10 bg-[var(--surface-2)]"
                    : "sticky top-0 z-10 bg-gray-100"
                }
              >
                <th
                  className={
                    swift
                      ? "border-b border-r border-[var(--border)] px-2 py-1.5 text-left text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] w-8"
                      : "border-b border-r border-gray-200 px-2.5 py-2 text-left text-xs font-semibold uppercase text-gray-700 w-8"
                  }
                >
                  #
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={
                      swift
                        ? "border-b border-r border-[var(--border)] px-2 py-1.5 text-left text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] whitespace-nowrap"
                        : "border-b border-r border-gray-200 px-2.5 py-2 text-left text-xs font-semibold uppercase text-gray-700 whitespace-nowrap"
                    }
                  >
                    {col.label}
                    {col.required && <span className="text-red-500 ml-0.5">*</span>}
                  </th>
                ))}
                <th className={swift ? "border-b border-[var(--border)] px-2 py-1.5 w-8" : "border-b border-gray-200 px-2.5 py-2 w-8"} />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={index}
                  className={
                    swift
                      ? index % 2 === 0
                        ? "bg-[var(--surface)]"
                        : "bg-[var(--surface-2)]/60"
                      : index % 2 === 0
                        ? "bg-white"
                        : "bg-gray-50"
                  }
                >
                  <td
                    className={
                      swift
                        ? "border-b border-r border-[var(--border)] px-2 py-1 text-xs text-[var(--text-muted)]"
                        : "border-b border-r border-gray-200 px-2.5 py-1.5 text-sm text-gray-500"
                    }
                  >
                    {index + 1}
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={swift ? "border-b border-r border-[var(--border)] p-0.5" : "border-b border-r border-gray-200 p-0.5"}
                    >
                      {col.type === "select" ? (
                        <select
                          value={row[col.key] ?? ""}
                          onChange={(e) => handleRowChange(index, col.key, e.target.value)}
                          onBlur={onBlur}
                          disabled={disabled}
                          className={selectClass}
                        >
                          {(col.options ?? []).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt || "—"}
                            </option>
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
                  <td className={swift ? "border-b border-[var(--border)] px-1 py-0.5 text-center" : "border-b border-gray-200 px-1 py-1 text-center"}>
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(index)}
                      disabled={disabled}
                      className={
                        swift
                          ? "text-[var(--red)] hover:bg-[var(--red-lt)] rounded p-0.5 text-xs font-bold disabled:opacity-50"
                          : "text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-0.5 text-sm font-bold disabled:opacity-50"
                      }
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
        <div className={swift ? "border-t border-[var(--border)] p-2 bg-[var(--surface-2)]/50" : "border-t border-gray-200 p-2"}>
          <button
            type="button"
            onClick={handleAddRow}
            disabled={disabled}
            className={
              swift
                ? "w-full rounded-lg border-2 border-dashed border-[var(--green-mid)] bg-[var(--green-lt)] py-2 text-xs font-semibold text-[var(--green)] hover:bg-[var(--green-mid)]/25 disabled:opacity-50"
                : "w-full rounded border-2 border-dashed border-green-400 bg-green-50 py-2 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
            }
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
  awsGapContext,
  visualVariant = "default",
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
  awsGapContext: AwsGapContext;
  visualVariant?: EvidenceFormVisualVariant;
}) {
  const swift = visualVariant === "swiftReview";
  const [activeTab, setActiveTab] = useState<"ai" | "human">("ai");
  const aiEmpty = !hasMeaningfulAiValue("spreadsheet", aiValue);
  const showGapInfo = Boolean(activeTab === "ai" && aiEmpty && !awsGapContext.suggestLoading);
  const gapText = resolveAwsGapExplanation(question.question_key, "spreadsheet", aiValue, awsGapContext);

  return (
    <div className="min-w-0" role="group" aria-label={question.label}>
      <div className={cn("flex flex-wrap items-baseline gap-2", swift ? "mb-2" : "mb-1")}>
        <label
          className={
            swift ? "block text-sm font-semibold text-[var(--text-primary)]" : "block text-sm font-medium text-gray-700"
          }
        >
          {question.label} {question.required && <span className="text-red-500">*</span>}
        </label>
        <AwsHumanChip swift={swift} />
        <FieldAINote text={fieldFeedbackHint} fieldLabel={question.label} variant="inline" />
      </div>
      <div className="flex gap-0.5 mt-1">
        <button type="button" className={dualTabBarClass(activeTab === "ai", swift)} onClick={() => setActiveTab("ai")}>
          AI Response
        </button>
        <button type="button" className={dualTabBarClass(activeTab === "human", swift)} onClick={() => setActiveTab("human")}>
          Human Response
        </button>
      </div>
      <div
        className={cn(
          swift
            ? "rounded-b-[var(--radius)] rounded-tr-[var(--radius)] border border-[var(--border)] bg-[var(--surface-2)] p-4 shadow-[var(--shadow-xs)]"
            : cn(
                "rounded-b-lg rounded-tr-lg border p-3",
                activeTab === "ai"
                  ? "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/40"
                  : "border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900/30"
              )
        )}
      >
        {activeTab === "ai" ? (
          <div className={cn(swift && "rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3")}>
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              <AiBadge swift={swift} />
              <span
                className={
                  swift
                    ? "text-[10px] font-medium text-[var(--text-muted)]"
                    : "text-[10px] font-medium text-slate-600 dark:text-slate-400"
                }
              >
                Suggested from AWS evidence — editable in this tab
              </span>
              {showGapInfo && <AwsDataGapInfo text={gapText} swift={swift} />}
            </div>
            <SpreadsheetQuestionRenderer
              question={question}
              value={aiValue}
              onChange={onChangeAi}
              onBlur={onBlur}
              disabled={disabled}
              fieldFeedbackHint={fieldFeedbackHint}
              onFocus={onFocus}
              hideLabel
              visualVariant={visualVariant}
            />
          </div>
        ) : (
          <div className={cn(swift && "rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3")}>
            <div className="flex items-center gap-1.5 mb-3">
              <span className={swift ? "text-[10px] text-[var(--text-muted)]" : "text-[10px] text-gray-500"}>
                Your manual response
              </span>
            </div>
            <SpreadsheetQuestionRenderer
              question={question}
              value={humanValue}
              onChange={onChangeHuman}
              onBlur={onBlur}
              disabled={disabled}
              fieldFeedbackHint={fieldFeedbackHint}
              onFocus={onFocus}
              hideLabel
              visualVariant={visualVariant}
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
  disabled = false,
  onQuestionFocus,
  aiSuggestLoading,
  aiSuggestions,
  questionSources,
  awsSuggestionGaps = {},
  awsSuggestRoundDone = false,
  visualVariant = "default",
}: EvidenceQuestionsFormProps) {
  const swift = visualVariant === "swiftReview";
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

  const makeAwsGapContext = useCallback(
    (q: EvidenceQuestion): AwsGapContext => ({
      gaps: awsSuggestionGaps,
      roundDone: awsSuggestRoundDone,
      suggestLoading: shouldShowSpinner(q),
      disabled,
    }),
    [awsSuggestionGaps, awsSuggestRoundDone, shouldShowSpinner, disabled]
  );

  if (loading) {
    const el = (
      <div
        className={
          swift ? "py-8 text-center text-sm text-[var(--text-secondary)]" : "py-8 text-center text-sm text-gray-500"
        }
      >
        Loading questions…
      </div>
    );
    return swift ? (
      <div className="swift-review-tpl swift-review-embed min-w-0">
        {el}
      </div>
    ) : (
      el
    );
  }

  if (questions.length === 0) {
    const el = (
      <div
        className={
          swift ? "py-8 text-center text-sm text-[var(--text-secondary)]" : "py-8 text-center text-sm text-gray-500"
        }
      >
        No questions configured for this evidence item. Ensure the database is seeded with evidence_based_questions.
      </div>
    );
    return swift ? (
      <div className="swift-review-tpl swift-review-embed min-w-0">
        {el}
      </div>
    ) : (
      el
    );
  }

  const formBody = (
    <div className={cn("min-w-0", swift ? "space-y-4" : "space-y-4")}>
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
                <label
                  className={
                    swift ? "block text-sm font-semibold text-[var(--text-primary)]" : "block text-sm font-medium text-gray-700"
                  }
                >
                  {q.label}
                </label>
                {isAwsSource(src) && <AiBadge swift={swift} />}
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
                  <label
                    className={
                      swift ? "text-sm font-semibold text-[var(--text-primary)]" : "text-sm font-medium text-gray-700"
                    }
                  >
                    {q.label} {q.required && <span className="text-red-500">*</span>}
                  </label>
                  {spreadsheetIsAwsHuman && <AwsHumanChip swift={swift} />}
                  {spreadsheetIsAws && <AiBadge swift={swift} />}
                </div>
                <AiFieldSpinner swift={swift} />
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
                awsGapContext={makeAwsGapContext(q)}
                visualVariant={visualVariant}
              />
            );
          }

          if (spreadsheetIsAws) {
            const sheetVal = formData[q.question_key] ?? "";
            const showSheetGap =
              !spreadsheetShowSpinner && !hasMeaningfulAiValue("spreadsheet", sheetVal);
            const sheetGapText = buildAwsGapTooltipText(
              q.question_key,
              q,
              { id: q.question_key, label: q.label, type: "text", required: q.required, options: [] },
              sheetVal,
              makeAwsGapContext(q)
            );
            return (
              <div key={q.id} className="rounded-lg" role="group" aria-label={q.label}>
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <AiBadge swift={swift} />
                  <span
                    className={
                      swift
                        ? "text-[10px] font-medium text-[var(--text-muted)]"
                        : "text-[10px] font-medium text-slate-600 dark:text-slate-400"
                    }
                  >
                    AWS-assisted — editable
                  </span>
                  {showSheetGap && <AwsDataGapInfo text={sheetGapText} swift={swift} />}
                </div>
                <SpreadsheetQuestionRenderer
                  question={q}
                  value={formData[q.question_key] ?? ""}
                  onChange={(val) => onChange(q.question_key, val)}
                  onBlur={onBlur}
                  disabled={disabled}
                  fieldFeedbackHint={fieldFeedback?.[q.question_key]}
                  onFocus={handleSpreadsheetFocus}
                  visualVariant={visualVariant}
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
              visualVariant={visualVariant}
            />
          );
        }

        if (showSpinner) {
          return (
            <div key={q.id} className="rounded-lg" role="group" aria-label={q.label}>
              <div className="flex flex-wrap items-baseline gap-2 mb-1">
                <label
                  className={
                    swift ? "text-sm font-semibold text-[var(--text-primary)]" : "text-sm font-medium text-gray-700"
                  }
                >
                  {q.label} {q.required && <span className="text-red-500">*</span>}
                </label>
                {isAwsPlusHuman(src) && <AwsHumanChip swift={swift} />}
                {isAwsOnly(src) && <AiBadge swift={swift} />}
              </div>
              <AiFieldSpinner swift={swift} />
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
                awsGapContext={makeAwsGapContext(q)}
                visualVariant={visualVariant}
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
        const mainVal = formData[q.question_key] ?? "";
        const showAwsGapInfo = isAws && !showSpinner && awsFieldLooksUnfilled(input, q, mainVal);
        const awsGapTooltip = showAwsGapInfo
          ? buildAwsGapTooltipText(q.question_key, q, input, mainVal, makeAwsGapContext(q))
          : "";

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
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <AiBadge swift={swift} />
                <span
                  className={
                    swift
                      ? "text-[10px] font-medium text-[var(--text-muted)]"
                      : "text-[10px] font-medium text-slate-600 dark:text-slate-400"
                  }
                >
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
              disabled={disabled}
              afterLabel={showAwsGapInfo ? <AwsDataGapInfo text={awsGapTooltip} swift={swift} /> : undefined}
            />
          </div>
        );
      })}
    </div>
  );

  if (swift) {
    return (
      <div className="swift-review-tpl swift-review-embed min-w-0">
        {formBody}
      </div>
    );
  }

  return formBody;
}
