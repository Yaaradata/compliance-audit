"use client";

import { FieldAINote } from "@/components/domain/field-ai-note";

export type FieldType = "textarea" | "select" | "text" | "date";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  rows?: number;
}

export interface GenericIntakeFormProps {
  fields: FieldDef[];
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  /** AI per-field feedback for "AI — needs more info". */
  fieldFeedback?: Record<string, string | null>;
}

const inputBase =
  "w-full rounded-xl border border-(--border) bg-background px-4 py-3 text-base text-foreground outline-none transition placeholder:text-(--foreground-muted)/80 placeholder:text-base focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20 disabled:opacity-60 disabled:cursor-not-allowed";

export function GenericIntakeForm({ fields, formData, onChange, onBlur, disabled, fieldFeedback }: GenericIntakeFormProps) {
  const fb = fieldFeedback ?? {};
  return (
    <div className="space-y-6">
      {fields.map((f) => (
        <div key={f.key} className="space-y-2.5">
          <label className="block text-base font-medium text-foreground">
            {f.label}
            {f.required !== false && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          {f.type === "select" ? (
            <select
              value={formData[f.key] ?? ""}
              onChange={(e) => onChange(f.key, e.target.value)}
              onBlur={onBlur}
              disabled={disabled}
              className={inputBase}
            >
              <option value="">Select</option>
              {(f.options ?? ["Yes", "Partial", "No"]).map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          ) : f.type === "date" ? (
            <input
              type="date"
              value={formData[f.key] ?? ""}
              onChange={(e) => onChange(f.key, e.target.value)}
              onBlur={onBlur}
              disabled={disabled}
              className={inputBase}
            />
          ) : f.type === "text" ? (
            <input
              type="text"
              value={formData[f.key] ?? ""}
              onChange={(e) => onChange(f.key, e.target.value)}
              onBlur={onBlur}
              disabled={disabled}
              placeholder={f.placeholder}
              className={inputBase}
            />
          ) : (
            <textarea
              value={formData[f.key] ?? ""}
              onChange={(e) => onChange(f.key, e.target.value)}
              onBlur={onBlur}
              disabled={disabled}
              placeholder={f.placeholder}
              rows={f.rows ?? 4}
              className={`${inputBase} resize-y min-h-[100px]`}
            />
          )}
          <FieldAINote text={fb[f.key]} fieldLabel={f.label} variant="inline" />
        </div>
      ))}
    </div>
  );
}
