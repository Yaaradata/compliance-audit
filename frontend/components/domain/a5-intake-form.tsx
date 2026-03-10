"use client";

import {
  A5_FORM_KEYS,
  A5_FORM_LABELS,
  A5_FORM_PLACEHOLDERS,
  type A5FormKey,
} from "@/lib/frameworks/swift-cscf/evidence/a5-criteria";
import { ARCHITECTURES } from "@/lib/frameworks/swift-cscf";

const ARCH_OPTIONS = ARCHITECTURES.map((a) => ({ value: a.id, label: `${a.id}: ${a.subtitle}` }));

export interface A5IntakeFormProps {
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  /** When true, architecture_type and selected_diagram are read-only (from cycle selection). */
  architectureFromCycle?: boolean;
}

export function A5IntakeForm({
  formData,
  onChange,
  onBlur,
  disabled,
  architectureFromCycle = true,
}: A5IntakeFormProps) {
  const handleChange = (key: A5FormKey, value: string) => {
    onChange(key, value);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            {A5_FORM_LABELS.architecture_type}
          </label>
          {architectureFromCycle ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800">
              {formData[A5_FORM_KEYS.architecture_type] || "—"}
            </div>
          ) : (
            <select
              value={formData[A5_FORM_KEYS.architecture_type] ?? ""}
              onChange={(e) => handleChange(A5_FORM_KEYS.architecture_type, e.target.value)}
              onBlur={onBlur}
              disabled={disabled}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Select architecture type</option>
              {ARCH_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        </div>
        {formData[A5_FORM_KEYS.selected_diagram] && (
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              {A5_FORM_LABELS.selected_diagram}
            </label>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800">
              {formData[A5_FORM_KEYS.selected_diagram]}
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A5_FORM_LABELS.decision_rationale} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData[A5_FORM_KEYS.decision_rationale] ?? ""}
          onChange={(e) => handleChange(A5_FORM_KEYS.decision_rationale, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A5_FORM_PLACEHOLDERS.decision_rationale}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-y"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A5_FORM_LABELS.infrastructure_characteristics}
        </label>
        <textarea
          value={formData[A5_FORM_KEYS.infrastructure_characteristics] ?? ""}
          onChange={(e) => handleChange(A5_FORM_KEYS.infrastructure_characteristics, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A5_FORM_PLACEHOLDERS.infrastructure_characteristics}
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-y"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A5_FORM_LABELS.bics} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData[A5_FORM_KEYS.bics] ?? ""}
          onChange={(e) => handleChange(A5_FORM_KEYS.bics, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A5_FORM_PLACEHOLDERS.bics}
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-y"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A5_FORM_LABELS.changes_from_previous}
        </label>
        <textarea
          value={formData[A5_FORM_KEYS.changes_from_previous] ?? ""}
          onChange={(e) => handleChange(A5_FORM_KEYS.changes_from_previous, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A5_FORM_PLACEHOLDERS.changes_from_previous}
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-y"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A5_FORM_LABELS.multiple_architectures}
        </label>
        <select
          value={formData[A5_FORM_KEYS.multiple_architectures] ?? ""}
          onChange={(e) => handleChange(A5_FORM_KEYS.multiple_architectures, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">—</option>
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
        {formData[A5_FORM_KEYS.multiple_architectures] === "Yes" && (
          <p className="mt-1 text-[11px] text-amber-700">
            Describe in &quot;Key infrastructure characteristics&quot; or upload a document.
          </p>
        )}
      </div>
    </div>
  );
}
