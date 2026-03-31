import type { EvidenceQuestion } from "@/lib/types";
import { A5_EVIDENCE_ITEM_ID } from "@/lib/frameworks/swift-cscf/constants";

/** Column schema for spreadsheet-type questions (matches `evidence-questions-form` / DB JSON in `options`). */
export type SpreadsheetColumnSpec = {
  key: string;
  label: string;
  type: "text" | "select";
  required?: boolean;
  options?: string[];
};

export type EvidenceEvaluationValidationIssue = {
  questionKey: string;
  label: string;
  message: string;
};

export type EvidenceEvaluationValidationResult = {
  ok: boolean;
  issues: EvidenceEvaluationValidationIssue[];
};

function parseSpreadsheetColumns(question: EvidenceQuestion): SpreadsheetColumnSpec[] {
  return (question.options?.filter((o) => typeof o === "object" && o !== null && "key" in o) ?? []) as SpreadsheetColumnSpec[];
}

/** Required column keys: explicit `required: true` on column, else all columns when the question is required. */
function requiredColumnKeys(question: EvidenceQuestion): string[] {
  const cols = parseSpreadsheetColumns(question);
  const explicit = cols.filter((c) => c.required === true).map((c) => c.key);
  if (explicit.length > 0) return explicit;
  if (question.required && cols.length > 0) return cols.map((c) => c.key);
  return [];
}

function isQuestionVisible(q: EvidenceQuestion, formData: Record<string, string>): boolean {
  const parentKey = q.show_when_question;
  const showValues = q.show_when_values;
  if (!parentKey || !showValues?.length) return true;
  const parentVal = (formData[parentKey] ?? "").trim();
  return showValues.some((v) => v.trim() === parentVal);
}

/** Same visibility rules as `EvidenceQuestionsForm` for guide-only textareas. */
function isQuestionShownInForm(q: EvidenceQuestion): boolean {
  if (q.question_type !== "textarea") return true;
  const p = (q.placeholder ?? "").trim();
  if (p.includes("logical/physical separation method") || p.includes("firewall devices at every ingress/egress")) return false;
  return true;
}

function shouldIncludeQuestion(q: EvidenceQuestion, evidenceItemId: string): boolean {
  if (evidenceItemId === A5_EVIDENCE_ITEM_ID && q.question_key === "selected_diagram") return false;
  return isQuestionShownInForm(q);
}

/** Matches `EvidenceQuestionsForm` — dual-tab fields use `{key}__ai` for the AI Response tab. */
function isAwsPlusHumanSource(src: string | null | undefined): boolean {
  if (!src) return false;
  const s = src.trim().toLowerCase();
  return s.startsWith("aws") && s.includes("human");
}

/** True if spreadsheet JSON has at least one non-empty cell (same idea as `hasMeaningfulAiValue`). */
function spreadsheetHasMeaningfulContent(raw: string): boolean {
  const t = (raw ?? "").trim();
  if (!t) return false;
  try {
    const rows = JSON.parse(t) as unknown;
    if (!Array.isArray(rows) || rows.length === 0) return false;
    return rows.some(
      (row) =>
        row &&
        typeof row === "object" &&
        Object.values(row as Record<string, unknown>).some((c) => String(c ?? "").trim() !== "")
    );
  } catch {
    return false;
  }
}

/**
 * Merge human + `__ai` when DB `evidence_source` is missing (common) but suggest-from-aws still fills `__ai`
 * and the UI shows dual tabs (`questionSources` in the form).
 */
function shouldMergeAiTwinField(q: EvidenceQuestion, formData: Record<string, string>): boolean {
  if (q.question_type === "file") return false;
  if (isAwsPlusHumanSource(q.evidence_source)) return true;
  const ai = formData[`${q.question_key}__ai`] ?? "";
  if (!ai.trim()) return false;
  if (q.question_type === "spreadsheet") return spreadsheetHasMeaningfulContent(ai);
  return true;
}

function spreadsheetCellFilled(val: string | undefined, col: SpreadsheetColumnSpec): boolean {
  const t = (val ?? "").trim();
  if (t === "") return false;
  if (col.type === "select" && col.options?.length) {
    return col.options.some((o) => o === t);
  }
  return true;
}

/** Rows that are entirely empty (all declared columns blank) are ignored — matches user expectation when an extra blank row exists at the bottom. */
function spreadsheetNonEmptyRows(rows: Record<string, string>[], cols: SpreadsheetColumnSpec[]): Record<string, string>[] {
  return rows.filter((row) => cols.some((c) => (row[c.key] ?? "").trim() !== ""));
}

/**
 * Returns an error message if the spreadsheet fails validation, or `null` if OK / not applicable.
 */
export function validateSpreadsheetQuestion(question: EvidenceQuestion, raw: string): string | null {
  const cols = parseSpreadsheetColumns(question);
  const reqKeys = requiredColumnKeys(question);
  const mustValidate = question.required || reqKeys.length > 0;
  if (!mustValidate) return null;

  let rows: Record<string, string>[] = [];
  try {
    rows = raw?.trim() ? JSON.parse(raw) : [];
  } catch {
    return "The table data is invalid. Re-enter or fix the spreadsheet.";
  }
  if (!Array.isArray(rows)) return "The table data is invalid.";

  const keysToCheck = reqKeys.length > 0 ? reqKeys : question.required ? cols.map((c) => c.key) : [];
  if (keysToCheck.length === 0) return null;

  const dataRows = cols.length > 0 ? spreadsheetNonEmptyRows(rows, cols) : rows;
  if (dataRows.length === 0) {
    return "Add at least one row and fill all required columns.";
  }

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i]!;
    for (const key of keysToCheck) {
      const col = cols.find((c) => c.key === key);
      if (!col) continue;
      if (!spreadsheetCellFilled(row[key], col)) {
        return `Row ${i + 1}: “${col.label}” is required.`;
      }
    }
  }
  return null;
}

function selectOptions(question: EvidenceQuestion): string[] {
  return (question.options?.filter((o): o is string => typeof o === "string") ?? []).map(String);
}

function nonFileFieldFilled(question: EvidenceQuestion, raw: string): boolean {
  const t = (raw ?? "").trim();
  const qt = question.question_type;

  if (qt === "checkbox") return t === "true";
  if (qt === "spreadsheet") return validateSpreadsheetQuestion(question, raw) === null;
  if (qt === "select") {
    if (!t) return false;
    const opts = selectOptions(question);
    if (opts.length === 0) return true;
    return opts.includes(t);
  }
  return t.length > 0;
}

function pickAwsHumanCanonicalAnswer(q: EvidenceQuestion, formData: Record<string, string>): string {
  const human = formData[q.question_key] ?? "";
  const ai = formData[`${q.question_key}__ai`] ?? "";
  if (q.question_type === "spreadsheet") {
    if (!spreadsheetHasMeaningfulContent(human)) return ai;
    if (validateSpreadsheetQuestion(q, human) === null) return human;
    if (validateSpreadsheetQuestion(q, ai) === null) return ai;
    return human;
  }
  if (q.question_type === "checkbox") {
    if (human.trim() !== "") return human;
    return ai;
  }
  if (human.trim() === "") return ai;
  if (q.required && !nonFileFieldFilled(q, human) && nonFileFieldFilled(q, ai)) return ai;
  return human;
}

/**
 * For dual-tab fields, canonical `question_key` may be empty or stale while the user completed the AI Response tab (`{key}__ai`).
 * Merges for validation/save/LLM context. Uses `__ai` when `evidence_source` is unset but AWS suggest populated the twin key.
 */
export function buildEffectiveFormDataForEvaluation(questions: EvidenceQuestion[], formData: Record<string, string>): Record<string, string> {
  const out = { ...formData };
  for (const q of questions) {
    if (!shouldMergeAiTwinField(q, formData)) continue;
    out[q.question_key] = pickAwsHumanCanonicalAnswer(q, formData);
  }
  return out;
}

export type ValidateEvidenceEvaluationParams = {
  questions: EvidenceQuestion[];
  /** Form keys match `question_key` (no item prefix). */
  formData: Record<string, string>;
  evidenceItemId: string;
  /** Total attachments on the submission (all file questions share one list). */
  submissionFileCount: number;
};

/**
 * Client-side gate before POST `/evidence/evaluate`.
 * Aligns with `EvidenceQuestionsForm`: visibility, A5 `selected_diagram` omit, spreadsheet columns, required file count.
 */
export function validateEvidenceQuestionsForEvaluation(params: ValidateEvidenceEvaluationParams): EvidenceEvaluationValidationResult {
  const { questions, formData, evidenceItemId, submissionFileCount } = params;
  const issues: EvidenceEvaluationValidationIssue[] = [];

  const effective = buildEffectiveFormDataForEvaluation(questions, formData);
  const visible = questions.filter((q) => shouldIncludeQuestion(q, evidenceItemId) && isQuestionVisible(q, effective));

  const requiredFileQuestions = visible.filter((q) => q.question_type === "file" && q.required);
  if (requiredFileQuestions.length > 0 && submissionFileCount < requiredFileQuestions.length) {
    const n = requiredFileQuestions.length;
    issues.push({
      questionKey: requiredFileQuestions[0]!.question_key,
      label: n === 1 ? requiredFileQuestions[0]!.label : "File uploads",
      message:
        n === 1
          ? "Upload the required file before running AI evaluation."
          : `This item requires ${n} file attachment(s); ${submissionFileCount} uploaded.`,
    });
  }

  for (const q of visible) {
    if (q.question_type === "file") continue;

    if (q.question_type === "spreadsheet") {
      const err = validateSpreadsheetQuestion(q, effective[q.question_key] ?? "");
      if (err) {
        issues.push({ questionKey: q.question_key, label: q.label, message: err });
      }
      continue;
    }

    if (!q.required) continue;

    const raw = effective[q.question_key] ?? "";
    if (!nonFileFieldFilled(q, raw)) {
      issues.push({
        questionKey: q.question_key,
        label: q.label,
        message: "This field is required.",
      });
    }
  }

  return { ok: issues.length === 0, issues };
}

/**
 * Single line shown above “Run AI Evaluation” when `validateEvidenceQuestionsForEvaluation` returns `ok: false`.
 * Detailed `issues` stay on the result object for tests, analytics, or future per-field UI.
 */
/** Shown above “Run AI evaluation” when required fields block the run. Leading “* ” is intentional (bullet-style cue). */
export const EVIDENCE_EVALUATION_REQUIRED_SHORT_HINT =
  "* Complete required fields before running AI evaluation.";

/** Top alert copy with the missing field(s) so users know exactly what to fill. */
export function buildRequiredFieldsTopHint(result: EvidenceEvaluationValidationResult, maxFields = 2): string {
  if (result.ok || result.issues.length === 0) return EVIDENCE_EVALUATION_REQUIRED_SHORT_HINT;
  const firstDetail = (result.issues[0]?.message ?? "").trim();
  const labels = Array.from(
    new Set(
      result.issues
        .map((i) => (i.label ?? "").trim())
        .filter(Boolean)
    )
  );
  if (labels.length === 0) return EVIDENCE_EVALUATION_REQUIRED_SHORT_HINT;
  const shown = labels.slice(0, maxFields);
  const extra = labels.length - shown.length;
  const suffix = extra > 0 ? ` (+${extra} more)` : "";
  const base = `${EVIDENCE_EVALUATION_REQUIRED_SHORT_HINT} Missing: ${shown.join(", ")}${suffix}`;
  if (firstDetail && !base.includes(firstDetail)) {
    return `${base} (${firstDetail})`;
  }
  return base;
}

/** Red inline alert; `!` wins over inherited `.swift-review-tpl` / parent `color` if the hint is ever nested there. */
export const evaluationRequiredFieldsHintClassName =
  "text-sm font-medium !text-red-600 dark:!text-red-500";
