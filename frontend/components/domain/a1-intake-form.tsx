"use client";

import {
  A1_FORM_KEYS,
  A1_FORM_LABELS,
  A1_FORM_PLACEHOLDERS,
} from "@/lib/data/a1-evidence";

export interface A1IntakeFormProps {
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

export function A1IntakeForm({ formData, onChange, onBlur, disabled }: A1IntakeFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A1_FORM_LABELS.diagram_date} <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={formData[A1_FORM_KEYS.diagram_date] ?? ""}
          onChange={(e) => onChange(A1_FORM_KEYS.diagram_date, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A1_FORM_LABELS.internet_exposure_confirmation} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[A1_FORM_KEYS.internet_exposure_confirmation] ?? ""}
          onChange={(e) => onChange(A1_FORM_KEYS.internet_exposure_confirmation, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Select</option>
          <option value="No">No</option>
          <option value="Yes">Yes</option>
          <option value="Unknown">Unknown</option>
        </select>
      </div>

      {formData[A1_FORM_KEYS.internet_exposure_confirmation] === "Yes" && (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            {A1_FORM_LABELS.internet_exposure_justification} <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData[A1_FORM_KEYS.internet_exposure_justification] ?? ""}
            onChange={(e) => onChange(A1_FORM_KEYS.internet_exposure_justification, e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={A1_FORM_PLACEHOLDERS.internet_exposure_justification}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-y"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A1_FORM_LABELS.connector_zone_statement} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData[A1_FORM_KEYS.connector_zone_statement] ?? ""}
          onChange={(e) => onChange(A1_FORM_KEYS.connector_zone_statement, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A1_FORM_PLACEHOLDERS.connector_zone_statement}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-y"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A1_FORM_LABELS.backoffice_path_summary} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData[A1_FORM_KEYS.backoffice_path_summary] ?? ""}
          onChange={(e) => onChange(A1_FORM_KEYS.backoffice_path_summary, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A1_FORM_PLACEHOLDERS.backoffice_path_summary}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-y"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A1_FORM_LABELS.protocol_encryption_notes}
        </label>
        <textarea
          value={formData[A1_FORM_KEYS.protocol_encryption_notes] ?? ""}
          onChange={(e) => onChange(A1_FORM_KEYS.protocol_encryption_notes, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A1_FORM_PLACEHOLDERS.protocol_encryption_notes}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-y"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A1_FORM_LABELS.known_gaps_and_plan}
        </label>
        <textarea
          value={formData[A1_FORM_KEYS.known_gaps_and_plan] ?? ""}
          onChange={(e) => onChange(A1_FORM_KEYS.known_gaps_and_plan, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A1_FORM_PLACEHOLDERS.known_gaps_and_plan}
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-y"
        />
      </div>
    </div>
  );
}
