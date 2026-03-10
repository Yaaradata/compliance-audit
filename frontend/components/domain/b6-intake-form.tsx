"use client";

import {
  B6_FORM_KEYS,
  B6_FORM_LABELS,
  B6_FORM_PLACEHOLDERS,
} from "@/lib/frameworks/swift-cscf/evidence/b6-evidence";

export interface B6IntakeFormProps {
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

export function B6IntakeForm({ formData, onChange, onBlur, disabled }: B6IntakeFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B6_FORM_LABELS.baseline_name_version} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData[B6_FORM_KEYS.baseline_name_version] ?? ""}
          onChange={(e) => onChange(B6_FORM_KEYS.baseline_name_version, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B6_FORM_PLACEHOLDERS.baseline_name_version}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B6_FORM_LABELS.scan_date} <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={formData[B6_FORM_KEYS.scan_date] ?? ""}
          onChange={(e) => onChange(B6_FORM_KEYS.scan_date, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B6_FORM_LABELS.scan_frequency} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[B6_FORM_KEYS.scan_frequency] ?? ""}
          onChange={(e) => onChange(B6_FORM_KEYS.scan_frequency, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Select</option>
          <option value="Twice per year or more">Twice per year or more</option>
          <option value="Once per year">Once per year</option>
          <option value="Less than annual">Less than annual</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B6_FORM_LABELS.system_types_covered} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData[B6_FORM_KEYS.system_types_covered] ?? ""}
          onChange={(e) => onChange(B6_FORM_KEYS.system_types_covered, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B6_FORM_PLACEHOLDERS.system_types_covered}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B6_FORM_LABELS.deviation_summary}
        </label>
        <textarea
          value={formData[B6_FORM_KEYS.deviation_summary] ?? ""}
          onChange={(e) => onChange(B6_FORM_KEYS.deviation_summary, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B6_FORM_PLACEHOLDERS.deviation_summary}
          rows={3}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B6_FORM_LABELS.remediation_plan}
        </label>
        <textarea
          value={formData[B6_FORM_KEYS.remediation_plan] ?? ""}
          onChange={(e) => onChange(B6_FORM_KEYS.remediation_plan, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B6_FORM_PLACEHOLDERS.remediation_plan}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B6_FORM_LABELS.swift_app_comparison} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[B6_FORM_KEYS.swift_app_comparison] ?? ""}
          onChange={(e) => onChange(B6_FORM_KEYS.swift_app_comparison, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B6_FORM_LABELS.app_deviations}
        </label>
        <textarea
          value={formData[B6_FORM_KEYS.app_deviations] ?? ""}
          onChange={(e) => onChange(B6_FORM_KEYS.app_deviations, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B6_FORM_PLACEHOLDERS.app_deviations}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B6_FORM_LABELS.authorized_software_baseline} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[B6_FORM_KEYS.authorized_software_baseline] ?? ""}
          onChange={(e) => onChange(B6_FORM_KEYS.authorized_software_baseline, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B6_FORM_LABELS.software_baseline_version_controlled}
        </label>
        <select
          value={formData[B6_FORM_KEYS.software_baseline_version_controlled] ?? ""}
          onChange={(e) => onChange(B6_FORM_KEYS.software_baseline_version_controlled, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B6_FORM_LABELS.known_gaps}
        </label>
        <textarea
          value={formData[B6_FORM_KEYS.known_gaps] ?? ""}
          onChange={(e) => onChange(B6_FORM_KEYS.known_gaps, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B6_FORM_PLACEHOLDERS.known_gaps}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
