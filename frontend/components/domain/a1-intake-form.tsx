"use client";

import {
  A1_FORM_KEYS,
  A1_FORM_LABELS,
  A1_FORM_PLACEHOLDERS,
} from "@/lib/data/a1-evidence";
import { cn } from "@/lib/utils";

export interface A1IntakeFormProps {
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  accentColor?: string;
  architectureFromCycle?: boolean;
}

const inputBase =
  "w-full rounded-xl border-2 border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1";

export function A1IntakeForm({ formData, onChange, onBlur, disabled, accentColor }: A1IntakeFormProps) {
  const ringColor = accentColor ?? "var(--primary)";
  return (
    <div className="space-y-5" style={{ ["--evidence-accent" as string]: ringColor } as React.CSSProperties}>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
        <label className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]">
          {A1_FORM_LABELS.diagram_date} <span className="text-[var(--danger)]" aria-label="required">*</span>
        </label>
        <input
          type="date"
          value={formData[A1_FORM_KEYS.diagram_date] ?? ""}
          onChange={(e) => onChange(A1_FORM_KEYS.diagram_date, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className={cn(inputBase, "focus-visible:ring-[var(--evidence-accent)]")}
        />
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
        <label className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]">
          {A1_FORM_LABELS.internet_exposure_confirmation} <span className="text-[var(--danger)]" aria-label="required">*</span>
        </label>
        <select
          value={formData[A1_FORM_KEYS.internet_exposure_confirmation] ?? ""}
          onChange={(e) => onChange(A1_FORM_KEYS.internet_exposure_confirmation, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className={cn(inputBase, "focus-visible:ring-[var(--evidence-accent)]")}
        >
          <option value="">Select</option>
          <option value="No">No</option>
          <option value="Yes">Yes</option>
          <option value="Unknown">Unknown</option>
        </select>
      </div>

      {formData[A1_FORM_KEYS.internet_exposure_confirmation] === "Yes" && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
          <label className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]">
            {A1_FORM_LABELS.internet_exposure_justification} <span className="text-[var(--danger)]" aria-label="required">*</span>
          </label>
          <textarea
            value={formData[A1_FORM_KEYS.internet_exposure_justification] ?? ""}
            onChange={(e) => onChange(A1_FORM_KEYS.internet_exposure_justification, e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={A1_FORM_PLACEHOLDERS.internet_exposure_justification}
            rows={3}
            className={cn(inputBase, "resize-y focus-visible:ring-[var(--evidence-accent)]")}
          />
        </div>
      )}

      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
        <label className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]">
          {A1_FORM_LABELS.connector_zone_statement} <span className="text-[var(--danger)]" aria-label="required">*</span>
        </label>
        <textarea
          value={formData[A1_FORM_KEYS.connector_zone_statement] ?? ""}
          onChange={(e) => onChange(A1_FORM_KEYS.connector_zone_statement, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A1_FORM_PLACEHOLDERS.connector_zone_statement}
          rows={3}
          className={cn(inputBase, "resize-y focus-visible:ring-[var(--evidence-accent)]")}
        />
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
        <label className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]">
          {A1_FORM_LABELS.backoffice_path_summary} <span className="text-[var(--danger)]" aria-label="required">*</span>
        </label>
        <textarea
          value={formData[A1_FORM_KEYS.backoffice_path_summary] ?? ""}
          onChange={(e) => onChange(A1_FORM_KEYS.backoffice_path_summary, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A1_FORM_PLACEHOLDERS.backoffice_path_summary}
          rows={3}
          className={cn(inputBase, "resize-y focus-visible:ring-[var(--evidence-accent)]")}
        />
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
        <label className="mb-1.5 block text-xs font-medium text-[var(--foreground-muted)]">
          {A1_FORM_LABELS.protocol_encryption_notes} <span className="text-[10px] font-normal">(optional)</span>
        </label>
        <textarea
          value={formData[A1_FORM_KEYS.protocol_encryption_notes] ?? ""}
          onChange={(e) => onChange(A1_FORM_KEYS.protocol_encryption_notes, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A1_FORM_PLACEHOLDERS.protocol_encryption_notes}
          rows={3}
          className={cn(inputBase, "resize-y focus-visible:ring-[var(--evidence-accent)]")}
        />
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
        <label className="mb-1.5 block text-xs font-medium text-[var(--foreground-muted)]">
          {A1_FORM_LABELS.known_gaps_and_plan} <span className="text-[10px] font-normal">(optional)</span>
        </label>
        <textarea
          value={formData[A1_FORM_KEYS.known_gaps_and_plan] ?? ""}
          onChange={(e) => onChange(A1_FORM_KEYS.known_gaps_and_plan, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A1_FORM_PLACEHOLDERS.known_gaps_and_plan}
          rows={2}
          className={cn(inputBase, "resize-y focus-visible:ring-[var(--evidence-accent)]")}
        />
      </div>
    </div>
  );
}
