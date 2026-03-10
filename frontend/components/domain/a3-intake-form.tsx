"use client";

import {
  A3_FORM_KEYS,
  A3_FORM_LABELS,
  A3_FORM_PLACEHOLDERS,
} from "@/lib/frameworks/swift-cscf/evidence/a3-evidence";

export interface A3IntakeFormProps {
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

export function A3IntakeForm({ formData, onChange, onBlur, disabled }: A3IntakeFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A3_FORM_LABELS.flow_inventory_notes}
        </label>
        <textarea
          value={formData[A3_FORM_KEYS.flow_inventory_notes] ?? ""}
          onChange={(e) => onChange(A3_FORM_KEYS.flow_inventory_notes, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A3_FORM_PLACEHOLDERS.flow_inventory_notes}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-y"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A3_FORM_LABELS.unprotected_legacy_flows} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData[A3_FORM_KEYS.unprotected_legacy_flows] ?? ""}
          onChange={(e) => onChange(A3_FORM_KEYS.unprotected_legacy_flows, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A3_FORM_PLACEHOLDERS.unprotected_legacy_flows}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-y"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A3_FORM_LABELS.hsm_flow_details}
        </label>
        <textarea
          value={formData[A3_FORM_KEYS.hsm_flow_details] ?? ""}
          onChange={(e) => onChange(A3_FORM_KEYS.hsm_flow_details, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A3_FORM_PLACEHOLDERS.hsm_flow_details}
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-y"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A3_FORM_LABELS.encryption_method_summary} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData[A3_FORM_KEYS.encryption_method_summary] ?? ""}
          onChange={(e) => onChange(A3_FORM_KEYS.encryption_method_summary, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A3_FORM_PLACEHOLDERS.encryption_method_summary}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-y"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A3_FORM_LABELS.cross_environment_details}
        </label>
        <textarea
          value={formData[A3_FORM_KEYS.cross_environment_details] ?? ""}
          onChange={(e) => onChange(A3_FORM_KEYS.cross_environment_details, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A3_FORM_PLACEHOLDERS.cross_environment_details}
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-y"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A3_FORM_LABELS.known_gaps}
        </label>
        <textarea
          value={formData[A3_FORM_KEYS.known_gaps] ?? ""}
          onChange={(e) => onChange(A3_FORM_KEYS.known_gaps, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A3_FORM_PLACEHOLDERS.known_gaps}
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-y"
        />
      </div>
    </div>
  );
}
