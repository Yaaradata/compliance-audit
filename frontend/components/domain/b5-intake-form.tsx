"use client";

import {
  B5_FORM_KEYS,
  B5_FORM_LABELS,
  B5_FORM_PLACEHOLDERS,
} from "@/lib/data/b5-evidence";

export interface B5IntakeFormProps {
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

export function B5IntakeForm({ formData, onChange, onBlur, disabled }: B5IntakeFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B5_FORM_LABELS.password_length_min} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData[B5_FORM_KEYS.password_length_min] ?? ""}
          onChange={(e) => onChange(B5_FORM_KEYS.password_length_min, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B5_FORM_PLACEHOLDERS.password_length_min}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B5_FORM_LABELS.complexity_enabled} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[B5_FORM_KEYS.complexity_enabled] ?? ""}
          onChange={(e) => onChange(B5_FORM_KEYS.complexity_enabled, e.target.value)}
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
          {B5_FORM_LABELS.expiration_period} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData[B5_FORM_KEYS.expiration_period] ?? ""}
          onChange={(e) => onChange(B5_FORM_KEYS.expiration_period, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B5_FORM_PLACEHOLDERS.expiration_period}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B5_FORM_LABELS.history_enforced} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData[B5_FORM_KEYS.history_enforced] ?? ""}
          onChange={(e) => onChange(B5_FORM_KEYS.history_enforced, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B5_FORM_PLACEHOLDERS.history_enforced}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B5_FORM_LABELS.lockout_threshold} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData[B5_FORM_KEYS.lockout_threshold] ?? ""}
          onChange={(e) => onChange(B5_FORM_KEYS.lockout_threshold, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B5_FORM_PLACEHOLDERS.lockout_threshold}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B5_FORM_LABELS.pin_settings}
        </label>
        <textarea
          value={formData[B5_FORM_KEYS.pin_settings] ?? ""}
          onChange={(e) => onChange(B5_FORM_KEYS.pin_settings, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B5_FORM_PLACEHOLDERS.pin_settings}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B5_FORM_LABELS.admin_policy_stricter} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[B5_FORM_KEYS.admin_policy_stricter] ?? ""}
          onChange={(e) => onChange(B5_FORM_KEYS.admin_policy_stricter, e.target.value)}
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
          {B5_FORM_LABELS.app_to_app_accounts}
        </label>
        <textarea
          value={formData[B5_FORM_KEYS.app_to_app_accounts] ?? ""}
          onChange={(e) => onChange(B5_FORM_KEYS.app_to_app_accounts, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B5_FORM_PLACEHOLDERS.app_to_app_accounts}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B5_FORM_LABELS.zone_local_auth} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[B5_FORM_KEYS.zone_local_auth] ?? ""}
          onChange={(e) => onChange(B5_FORM_KEYS.zone_local_auth, e.target.value)}
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
          {B5_FORM_LABELS.nolmhash_enabled} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[B5_FORM_KEYS.nolmhash_enabled] ?? ""}
          onChange={(e) => onChange(B5_FORM_KEYS.nolmhash_enabled, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="N/A - no Windows">N/A - no Windows</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B5_FORM_LABELS.policy_review_date} <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={formData[B5_FORM_KEYS.policy_review_date] ?? ""}
          onChange={(e) => onChange(B5_FORM_KEYS.policy_review_date, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B5_FORM_LABELS.known_gaps}
        </label>
        <textarea
          value={formData[B5_FORM_KEYS.known_gaps] ?? ""}
          onChange={(e) => onChange(B5_FORM_KEYS.known_gaps, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B5_FORM_PLACEHOLDERS.known_gaps}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
