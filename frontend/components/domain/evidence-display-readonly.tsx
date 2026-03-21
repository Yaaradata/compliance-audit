"use client";

import { useState, useEffect, useCallback, useRef, useId, type ReactNode } from "react";
import { Info } from "lucide-react";
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

/** True when stored value has reviewer-visible content (mirrors evidence form logic). */
function hasMeaningfulFieldValue(questionType: string, value: string): boolean {
  const t = (value ?? "").trim();
  if (!t) return false;
  if (questionType === "spreadsheet") {
    try {
      const rows = JSON.parse(t);
      if (!Array.isArray(rows) || rows.length === 0) return false;
      return rows.some(
        (row) =>
          row && typeof row === "object" && Object.values(row).some((c) => String(c ?? "").trim() !== "")
      );
    } catch {
      return false;
    }
  }
  return true;
}

function readonlyAiEmptyExplanation(hasRawAiKey: boolean, meaningfulAi: boolean): string {
  if (!hasRawAiKey) {
    return "No AI snapshot is stored for this field — for example the submission was saved before “suggest from AWS” ran, or the model left the field empty and it was not persisted. The “Submitted (human)” column is the authoritative evidence on file.";
  }
  if (!meaningfulAi) {
    return "A snapshot exists but the stored value is empty (for example an empty spreadsheet). AWS collection or the model may not have produced data for this question.";
  }
  return "";
}

function ReadonlyFieldInfo({ text, swift }: { text: string; swift?: boolean }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
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
    <span ref={rootRef} className="relative inline-flex shrink-0">
      <button
        type="button"
        className={
          swift
            ? "inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--blue)]/35 bg-[var(--surface)] text-[var(--blue)] shadow-[var(--shadow-xs)] hover:bg-[var(--blue-lt)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)]/30"
            : "inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-sky-300 bg-white text-sky-700 shadow-sm hover:bg-sky-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-200"
        }
        aria-label="Why is the AI (AWS) field empty?"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen((v) => !v);
        }}
      >
        <Info className="h-4 w-4" strokeWidth={2.2} aria-hidden />
      </button>
      {open ? (
        <span
          id={panelId}
          role="tooltip"
          className={
            swift
              ? "absolute right-0 top-full z-50 mt-1.5 w-[min(20rem,calc(100vw-2rem))] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-left text-[11px] leading-snug text-[var(--text-secondary)] shadow-[var(--shadow-md)]"
              : "absolute right-0 top-full z-50 mt-1.5 w-[min(20rem,calc(100vw-2rem))] rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-[11px] leading-snug text-slate-700 shadow-lg dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
          }
        >
          {text}
        </span>
      ) : null}
    </span>
  );
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

function AiFromAwsBadge({ swift }: { swift?: boolean }) {
  return (
    <span
      className={
        swift
          ? "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-[var(--shadow-xs)] bg-[var(--amber-lt)] text-[var(--amber)] border-[var(--amber-mid)]"
          : "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200 border border-amber-200/90 dark:border-amber-800 shadow-sm"
      }
    >
      AI from AWS
    </span>
  );
}

function AwsHumanBadge({ swift }: { swift?: boolean }) {
  return (
    <span
      className={
        swift
          ? "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-[var(--shadow-xs)] bg-[var(--amber-lt)] text-[var(--amber)] border-[var(--amber-mid)]"
          : "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200 border border-amber-200/90 dark:border-amber-800 shadow-sm"
      }
    >
      AWS + Human
    </span>
  );
}

function HumanEditedBadge({ swift }: { swift?: boolean }) {
  return (
    <span
      className={
        swift
          ? "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border shadow-[var(--shadow-xs)] bg-[var(--purple-lt)] text-[var(--purple)] border-[var(--border-2)]"
          : "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-violet-50 text-violet-900 dark:bg-violet-900/40 dark:text-violet-200 border border-violet-200/90 dark:border-violet-800 shadow-sm"
      }
    >
      Human edited
    </span>
  );
}

function AiTabEditedBadge({ swift }: { swift?: boolean }) {
  return (
    <span
      className={
        swift
          ? "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border shadow-[var(--shadow-xs)] bg-[var(--amber-lt)] text-[var(--amber)] border-[var(--amber-mid)]"
          : "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 border border-amber-200/90 dark:border-amber-800 shadow-sm"
      }
    >
      AI tab edited
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
  /**
   * Match Swift review template: amber AI badges, neutral columns, blue AI values, soft borders.
   * Use inside `.swift-review-tpl` (e.g. cycle review detail).
   */
  visualVariant?: "default" | "swiftReview";
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
  visualVariant = "default",
  valueEmphasis = "default",
}: {
  question: EvidenceQuestion;
  value: string;
  hideLabel?: boolean;
  /** Shown when the table has no rows (e.g. “Changes only” filter yielded nothing). */
  emptyCaption?: string;
  visualVariant?: "default" | "swiftReview";
  /** When `ai`, body cell text uses Swift blue (AI snapshot column). */
  valueEmphasis?: "default" | "ai";
}) {
  const swift = visualVariant === "swiftReview";
  const aiTone = valueEmphasis === "ai";
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
          <label
            className={
              swift ? "block text-sm font-medium text-[var(--text-primary)]" : "block text-sm font-medium text-slate-800"
            }
          >
            {question.label} {question.required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div
          className={
            swift
              ? "rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-3 py-5 text-sm text-[var(--text-secondary)] text-center leading-relaxed"
              : "rounded-lg border border-dashed border-slate-300 bg-slate-50/80 dark:border-gray-600 px-3 py-5 text-sm dark:bg-gray-900/40 text-slate-700 dark:text-gray-400 text-center leading-relaxed"
          }
        >
          {emptyCaption ?? "—"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 rounded-lg border border-transparent">
      {!hideLabel && (
        <label
          className={
            swift ? "block text-sm font-medium text-[var(--text-primary)]" : "block text-sm font-medium text-slate-800"
          }
        >
          {question.label} {question.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div
        className={
          swift
            ? "rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-[var(--shadow-xs)]"
            : "rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm"
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-max border-collapse">
            <thead>
              <tr className={swift ? "bg-[var(--surface-2)]" : "bg-slate-100"}>
                <th
                  className={
                    swift
                      ? "border-b border-r border-[var(--border)] px-2.5 py-2 text-left text-xs font-semibold uppercase text-[var(--text-secondary)] w-8"
                      : "border-b border-r border-slate-200 px-2.5 py-2 text-left text-xs font-semibold uppercase text-slate-800 w-8"
                  }
                >
                  #
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={
                      swift
                        ? "border-b border-r border-[var(--border)] px-2.5 py-2 text-left text-xs font-semibold uppercase text-[var(--text-secondary)] whitespace-nowrap"
                        : "border-b border-r border-slate-200 px-2.5 py-2 text-left text-xs font-semibold uppercase text-slate-800 whitespace-nowrap"
                    }
                  >
                    {getLabel(col)}
                  </th>
                ))}
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
                        : "bg-[var(--surface-2)]/70"
                      : index % 2 === 0
                        ? "bg-white"
                        : "bg-slate-50/80"
                  }
                >
                  <td
                    className={
                      swift
                        ? "border-b border-r border-[var(--border)] px-2.5 py-1.5 text-sm text-[var(--text-muted)]"
                        : "border-b border-r border-slate-200 px-2.5 py-1.5 text-sm text-slate-500"
                    }
                  >
                    {index + 1}
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={
                        swift
                          ? cn(
                              "border-b border-r border-[var(--border)] px-2.5 py-1.5 text-sm",
                              aiTone ? "font-semibold text-[var(--blue)]" : "text-[var(--text-primary)]"
                            )
                          : "border-b border-r border-slate-200 px-2.5 py-1.5 text-sm text-slate-900"
                      }
                    >
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
  visualVariant = "default",
  valueEmphasis = "default",
}: {
  question: EvidenceQuestion;
  value: string;
  hideLabel?: boolean;
  visualVariant?: "default" | "swiftReview";
  valueEmphasis?: "default" | "ai";
}) {
  const swift = visualVariant === "swiftReview";
  const aiTone = valueEmphasis === "ai";
  const displayValue =
    question.question_type === "checkbox"
      ? value === "true"
        ? "Yes"
        : value === "false"
          ? "No"
          : value || ""
      : value || "";

  /** Textarea: height follows line breaks (compact min height); scroll only if extremely long */
  const isTextarea = question.question_type === "textarea";

  const boxSwift = isTextarea
    ? "rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-sm min-h-9 w-full max-h-[min(70vh,28rem)] overflow-y-auto shadow-[var(--shadow-xs)] leading-snug"
    : "rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-sm min-h-9 shadow-[var(--shadow-xs)]";

  const boxDefault = isTextarea
    ? "rounded-lg border border-slate-200/90 bg-white px-2.5 py-1.5 text-sm text-slate-800 min-h-9 w-full max-h-[min(70vh,28rem)] overflow-y-auto shadow-[0_1px_2px_rgb(15_23_42/0.04)] dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-100 leading-snug"
    : "rounded-lg border border-slate-200/90 bg-white px-2.5 py-1.5 text-sm text-slate-800 min-h-9 shadow-[0_1px_2px_rgb(15_23_42/0.04)] dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-100";

  const valueTextSwift = aiTone
    ? "block whitespace-pre-wrap break-words leading-snug font-semibold text-[var(--blue)]"
    : "block whitespace-pre-wrap break-words leading-snug text-[var(--text-primary)]";

  return (
    <div className="space-y-2.5 rounded-lg border border-transparent">
      {!hideLabel && (
        <label
          className={
            swift ? "block text-sm font-medium text-[var(--text-primary)]" : "block text-sm font-medium text-slate-800"
          }
        >
          {question.label} {question.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className={swift ? boxSwift : boxDefault}>
        {displayValue ? (
          <span
            className={
              swift
                ? valueTextSwift
                : "block whitespace-pre-wrap break-words leading-snug text-slate-800 dark:text-slate-100"
            }
          >
            {displayValue}
          </span>
        ) : (
          <span className={swift ? "text-[var(--text-muted)]" : "text-slate-400 dark:text-slate-500"}>—</span>
        )}
      </div>
    </div>
  );
}

/**
 * Reviewer view: human + AI snapshots side-by-side (no tab switching), optional comparison when they differ.
 */
function ReviewerEvidenceQuestionBlock({
  question,
  formData,
  visualVariant = "default",
}: {
  question: EvidenceQuestion;
  formData: Record<string, string>;
  visualVariant?: "default" | "swiftReview";
}) {
  const swift = visualVariant === "swiftReview";
  const src = question.evidence_source;
  const humanVal = formData[question.question_key] ?? "";
  const aiSnapKey = `${question.question_key}__ai`;
  const aiVal = formData[aiSnapKey] ?? "";
  const originVal = formData[`${question.question_key}__ai_origin`] ?? "";
  const hasRawAiKey = Object.prototype.hasOwnProperty.call(formData, aiSnapKey);
  const meaningfulAi = hasMeaningfulFieldValue(question.question_type, aiVal);
  const plusHuman = isAwsPlusHuman(src);
  const onlyAws = isAwsOnly(src);
  const differs =
    meaningfulAi && !valuesEqualForQuestion(humanVal, aiVal, question.question_type);
  const showOrigin =
    meaningfulAi &&
    (originVal ?? "").trim().length > 0 &&
    !valuesEqualForQuestion(originVal ?? "", aiVal, question.question_type);
  const aiTabEdited = showOrigin;
  const isSheet = question.question_type === "spreadsheet";

  const emptyExplain = readonlyAiEmptyExplanation(hasRawAiKey, meaningfulAi);

  let comparisonBody: ReactNode = null;
  if (differs) {
    if (isSheet) {
      const filtered = filterSpreadsheetToChangedHumanRows(humanVal, aiVal);
      let emptyRows = false;
      try {
        const r = filtered ? JSON.parse(filtered) : [];
        emptyRows = !Array.isArray(r) || r.length === 0;
      } catch {
        emptyRows = true;
      }
      comparisonBody = (
        <SpreadsheetReadOnlyDisplay
          question={question}
          value={emptyRows ? "[]" : filtered}
          hideLabel
          visualVariant={visualVariant}
          emptyCaption={
            emptyRows
              ? "No rows differ between the submitted inventory and the AI suggestion."
              : undefined
          }
        />
      );
    } else {
      comparisonBody = (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div
            className={
              swift
                ? "min-w-0 space-y-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3"
                : "min-w-0 space-y-2 rounded-lg border border-violet-200/80 bg-violet-50/40 p-3 dark:border-violet-900/50 dark:bg-violet-950/20"
            }
          >
            <p
              className={
                swift
                  ? "text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]"
                  : "text-[10px] font-bold uppercase tracking-wider text-violet-900/85 dark:text-violet-300"
              }
            >
              Human (submitted)
            </p>
            <SingleFieldReadOnlyDisplay
              question={question}
              value={humanVal}
              hideLabel
              visualVariant={visualVariant}
              valueEmphasis="default"
            />
          </div>
          <div
            className={
              swift
                ? "min-w-0 space-y-2 rounded-xl border border-[var(--border)] bg-[var(--blue-lt)]/35 p-3"
                : "min-w-0 space-y-2 rounded-lg border border-sky-200/80 bg-sky-50/40 p-3 dark:border-sky-900/40 dark:bg-sky-950/20"
            }
          >
            <p
              className={
                swift
                  ? "text-[10px] font-bold uppercase tracking-wider text-[var(--blue)]"
                  : "text-[10px] font-bold uppercase tracking-wider text-sky-900/85 dark:text-sky-300"
              }
            >
              AI (AWS)
            </p>
            <SingleFieldReadOnlyDisplay
              question={question}
              value={aiVal}
              hideLabel
              visualVariant={visualVariant}
              valueEmphasis="ai"
            />
          </div>
        </div>
      );
    }
  }

  return (
    <div
      className={
        swift
          ? "space-y-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-xs)]"
          : "space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700/80 dark:bg-gray-900/20 dark:shadow-none"
      }
    >
      <div
        className={
          swift
            ? "flex flex-wrap items-start gap-2 border-b border-[var(--border)] pb-3"
            : "flex flex-wrap items-start gap-2 border-b border-slate-100 pb-3 dark:border-slate-800"
        }
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 gap-y-1">
          <label
            className={
              swift
                ? "text-sm font-semibold leading-snug text-[var(--text-primary)]"
                : "text-sm font-semibold leading-snug text-slate-900 dark:text-gray-100"
            }
          >
            {question.label} {question.required && <span className="text-red-500">*</span>}
          </label>
          {plusHuman && <AwsHumanBadge swift={swift} />}
          {(meaningfulAi || onlyAws || plusHuman) && <AiFromAwsBadge swift={swift} />}
          {differs && <HumanEditedBadge swift={swift} />}
          {aiTabEdited && <AiTabEditedBadge swift={swift} />}
        </div>
      </div>

      <p
        className={
          swift
            ? "text-[11px] leading-relaxed text-[var(--text-muted)]"
            : "text-[11px] leading-relaxed text-slate-500 dark:text-slate-400"
        }
      >
        Submitted evidence and the AWS snapshot are shown together. If they differ, a comparison section appears below.
      </p>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2 xl:items-stretch">
        <section
          className={
            swift
              ? "flex min-h-0 flex-col rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/80 p-3"
              : "flex min-h-0 flex-col rounded-lg border border-slate-200/90 bg-white p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.8)] dark:border-slate-700 dark:bg-slate-900/40"
          }
          aria-labelledby={`human-${question.id}`}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3
              id={`human-${question.id}`}
              className={
                swift
                  ? "text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]"
                  : "text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              }
            >
              Submitted (human)
            </h3>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            {isSheet ? (
              <SpreadsheetReadOnlyDisplay
                question={question}
                value={humanVal}
                hideLabel
                visualVariant={visualVariant}
                valueEmphasis="default"
              />
            ) : (
              <SingleFieldReadOnlyDisplay
                question={question}
                value={humanVal}
                hideLabel
                visualVariant={visualVariant}
                valueEmphasis="default"
              />
            )}
          </div>
        </section>

        <section
          className={cn(
            "flex min-h-0 flex-col rounded-lg border p-3",
            swift
              ? meaningfulAi
                ? "border-[var(--border)] bg-[var(--surface-2)]/80"
                : "border-dashed border-[var(--border)] bg-[var(--surface-2)]/50"
              : "dark:bg-slate-900/30",
            !swift &&
              (meaningfulAi
                ? "border-sky-200/90 bg-sky-50/40 dark:border-sky-800/60 dark:bg-sky-950/25"
                : "border-dashed border-sky-200/80 bg-sky-50/25 dark:border-sky-800 dark:bg-sky-950/20")
          )}
          aria-labelledby={`ai-${question.id}`}
        >
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h3
              id={`ai-${question.id}`}
              className={
                swift
                  ? "text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]"
                  : "text-[11px] font-bold uppercase tracking-wide text-sky-900/90 dark:text-sky-200"
              }
            >
              AI (AWS) snapshot
            </h3>
            {!meaningfulAi && emptyExplain ? <ReadonlyFieldInfo text={emptyExplain} swift={swift} /> : null}
          </div>
          {aiTabEdited && (
            <p
              className={
                swift
                  ? "mb-2 rounded-md border border-[var(--amber-mid)] bg-[var(--amber-lt)] px-2 py-1.5 text-[10px] font-medium text-[var(--amber)]"
                  : "mb-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-[10px] font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
              }
            >
              The AI-tab value was edited after the first AWS / LLM output (see comparison below if human and AI differ).
            </p>
          )}
          <div className="min-h-0 flex-1 overflow-auto">
            {meaningfulAi ? (
              isSheet ? (
                <SpreadsheetReadOnlyDisplay
                  question={question}
                  value={aiVal}
                  hideLabel
                  visualVariant={visualVariant}
                  valueEmphasis="ai"
                />
              ) : (
                <SingleFieldReadOnlyDisplay
                  question={question}
                  value={aiVal}
                  hideLabel
                  visualVariant={visualVariant}
                  valueEmphasis="ai"
                />
              )
            ) : (
              <div
                className={
                  swift
                    ? "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] px-3 py-5 text-center"
                    : "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-sky-200 bg-white/70 px-3 py-5 text-center dark:border-sky-800 dark:bg-slate-950/40"
                }
              >
                <p
                  className={
                    swift
                      ? "text-sm font-medium text-[var(--text-secondary)]"
                      : "text-sm font-medium text-slate-600 dark:text-slate-300"
                  }
                >
                  No AWS-generated value
                </p>
                <p
                  className={
                    swift
                      ? "max-w-xs text-xs leading-relaxed text-[var(--text-muted)]"
                      : "max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400"
                  }
                >
                  Use the{" "}
                  <span className={swift ? "font-semibold text-[var(--blue)]" : "font-semibold text-sky-700 dark:text-sky-300"}>
                    (i)
                  </span>{" "}
                  button above for common reasons.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {showOrigin && !isSheet && (
        <div
          className={
            swift
              ? "rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/60 p-3"
              : "rounded-lg border border-slate-200/90 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/50"
          }
        >
          <p
            className={
              swift
                ? "mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]"
                : "mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            }
          >
            Original AWS / LLM output (before AI-tab edits)
          </p>
          <SingleFieldReadOnlyDisplay
            question={question}
            value={originVal}
            hideLabel
            visualVariant={visualVariant}
            valueEmphasis="ai"
          />
        </div>
      )}

      {differs && (
        <section
          className={
            swift
              ? "rounded-xl border border-[var(--amber-mid)] bg-[var(--amber-lt)]/40 p-4"
              : "rounded-xl border border-amber-200/80 bg-linear-to-b from-amber-50/50 to-white p-4 dark:border-amber-900/50 dark:from-amber-950/30 dark:to-slate-900/40"
          }
          aria-label="Human versus AI comparison"
        >
          <h3
            className={
              swift
                ? "mb-3 text-[11px] font-bold uppercase tracking-wide text-[var(--amber)]"
                : "mb-3 text-[11px] font-bold uppercase tracking-wide text-amber-950/90 dark:text-amber-200"
            }
          >
            Comparison — human vs AI
          </h3>
          {comparisonBody}
        </section>
      )}

    </div>
  );
}

export function EvidenceDisplayReadOnly({
  evidenceItemId,
  cycleId,
  formData,
  attachments = [],
  onAttachmentClick,
  visualVariant = "default",
}: EvidenceDisplayReadOnlyProps) {
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
      <div className={swift ? "py-8 text-center text-sm text-[var(--text-secondary)]" : "py-8 text-center text-sm text-slate-600"}>
        Loading…
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className={swift ? "py-8 text-center text-sm text-[var(--text-secondary)]" : "py-8 text-center text-sm text-slate-600"}>
        No questions configured for this evidence item.
      </div>
    );
  }

  return (
    <div className={swift ? "space-y-4 text-[var(--text-primary)]" : "space-y-5"}>
      {visibleQuestions.map((q) => {
        const srcMeta = q.evidence_source;
        const aiSnap = (formData[`${q.question_key}__ai`] ?? "").trim().length > 0;
        const showReviewerAiChrome = isAwsSource(srcMeta) || aiSnap;

        if (q.question_type === "file") {
          return (
            <div key={q.id} className="space-y-2.5 rounded-lg border border-transparent">
              <div className="flex flex-wrap items-center gap-2">
                <label
                  className={
                    swift ? "block text-sm font-medium text-[var(--text-primary)]" : "block text-sm font-medium text-slate-800"
                  }
                >
                  {q.label} {q.required && <span className="text-red-500">*</span>}
                </label>
                {isAwsPlusHuman(srcMeta) && <AwsHumanBadge swift={swift} />}
                {isAwsOnly(srcMeta) && <AiFromAwsBadge swift={swift} />}
              </div>
              {attachments.length > 0 ? (
                <div
                  className={
                    swift
                      ? "rounded-xl border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)] shadow-[var(--shadow-xs)]"
                      : "rounded-lg border border-slate-200 bg-white divide-y divide-slate-200 shadow-sm"
                  }
                >
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
                      className={
                        swift
                          ? `flex items-center gap-3 px-3 py-2.5 ${onAttachmentClick ? "cursor-pointer hover:bg-[var(--surface-2)]/80" : ""}`
                          : `flex items-center gap-3 px-3 py-2.5 ${onAttachmentClick ? "cursor-pointer hover:bg-gray-50/50" : ""}`
                      }
                    >
                      <div
                        className={
                          swift
                            ? "w-9 h-9 rounded-md bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center shrink-0"
                            : "w-9 h-9 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0"
                        }
                      >
                        <svg
                          className={swift ? "w-5 h-5 text-[var(--text-muted)]" : "w-5 h-5 text-gray-500"}
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
                        <p
                          className={
                            swift ? "text-sm font-medium text-[var(--text-primary)] truncate" : "text-sm font-medium text-slate-900 truncate"
                          }
                        >
                          {att.file_name}
                        </p>
                        <p
                          className={
                            swift ? "text-xs text-[var(--text-muted)] mt-0.5" : "text-xs text-slate-500 mt-0.5"
                          }
                        >
                          {formatBytes(att.file_size_bytes)}
                        </p>
                      </div>
                      {onAttachmentClick ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAttachmentClick(att);
                          }}
                          className={
                            swift
                              ? "shrink-0 text-xs font-semibold px-3 py-1.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
                              : "shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                          }
                        >
                          View
                        </button>
                      ) : (
                        att.url && (
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={
                              swift
                                ? "shrink-0 text-xs font-semibold px-3 py-1.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
                                : "shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                            }
                          >
                            Open
                          </a>
                        )
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className={
                    swift
                      ? "rounded-xl border border-dashed border-[var(--border)] px-3 py-2.5 text-sm bg-[var(--surface-2)] text-[var(--text-muted)] min-h-10"
                      : "rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-sm bg-slate-50 text-slate-500 min-h-10"
                  }
                >
                  —
                </div>
              )}
            </div>
          );
        }
        if (q.question_type === "spreadsheet") {
          if (showReviewerAiChrome) {
            return (
              <ReviewerEvidenceQuestionBlock key={q.id} question={q} formData={formData} visualVariant={visualVariant} />
            );
          }
          return (
            <SpreadsheetReadOnlyDisplay
              key={q.id}
              question={q}
              value={formData[q.question_key] ?? ""}
              visualVariant={visualVariant}
            />
          );
        }
        if (showReviewerAiChrome) {
          return (
            <ReviewerEvidenceQuestionBlock key={q.id} question={q} formData={formData} visualVariant={visualVariant} />
          );
        }
        return (
          <SingleFieldReadOnlyDisplay
            key={q.id}
            question={q}
            value={formData[q.question_key] ?? ""}
            visualVariant={visualVariant}
          />
        );
      })}
    </div>
  );
}
