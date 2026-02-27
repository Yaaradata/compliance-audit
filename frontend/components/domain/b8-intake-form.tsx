"use client";

import {
  B8_FORM_KEYS,
  B8_FORM_LABELS,
  B8_FORM_PLACEHOLDERS,
} from "@/lib/data/b8-evidence";

export interface B8IntakeFormProps {
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

export function B8IntakeForm({ formData, onChange, onBlur, disabled }: B8IntakeFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B8_FORM_LABELS.app_timeout_configured} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[B8_FORM_KEYS.app_timeout_configured] ?? ""}
          onChange={(e) => onChange(B8_FORM_KEYS.app_timeout_configured, e.target.value)}
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
          {B8_FORM_LABELS.app_timeout_value} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData[B8_FORM_KEYS.app_timeout_value] ?? ""}
          onChange={(e) => onChange(B8_FORM_KEYS.app_timeout_value, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B8_FORM_PLACEHOLDERS.app_timeout_value}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B8_FORM_LABELS.os_screen_lock} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[B8_FORM_KEYS.os_screen_lock] ?? ""}
          onChange={(e) => onChange(B8_FORM_KEYS.os_screen_lock, e.target.value)}
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
          {B8_FORM_LABELS.os_lock_timeout} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData[B8_FORM_KEYS.os_lock_timeout] ?? ""}
          onChange={(e) => onChange(B8_FORM_KEYS.os_lock_timeout, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B8_FORM_PLACEHOLDERS.os_lock_timeout}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B8_FORM_LABELS.remote_session_timeout} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[B8_FORM_KEYS.remote_session_timeout] ?? ""}
          onChange={(e) => onChange(B8_FORM_KEYS.remote_session_timeout, e.target.value)}
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
          {B8_FORM_LABELS.remote_timeout_value}
        </label>
        <input
          type="text"
          value={formData[B8_FORM_KEYS.remote_timeout_value] ?? ""}
          onChange={(e) => onChange(B8_FORM_KEYS.remote_timeout_value, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B8_FORM_PLACEHOLDERS.remote_timeout_value}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B8_FORM_LABELS.reauth_after_timeout} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[B8_FORM_KEYS.reauth_after_timeout] ?? ""}
          onChange={(e) => onChange(B8_FORM_KEYS.reauth_after_timeout, e.target.value)}
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
          {B8_FORM_LABELS.session_recording}
        </label>
        <select
          value={formData[B8_FORM_KEYS.session_recording] ?? ""}
          onChange={(e) => onChange(B8_FORM_KEYS.session_recording, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="Partial">Partial</option>
          <option value="No">No</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B8_FORM_LABELS.concurrent_session_restrictions}
        </label>
        <select
          value={formData[B8_FORM_KEYS.concurrent_session_restrictions] ?? ""}
          onChange={(e) => onChange(B8_FORM_KEYS.concurrent_session_restrictions, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="N/A">N/A</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B8_FORM_LABELS.known_gaps}
        </label>
        <textarea
          value={formData[B8_FORM_KEYS.known_gaps] ?? ""}
          onChange={(e) => onChange(B8_FORM_KEYS.known_gaps, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B8_FORM_PLACEHOLDERS.known_gaps}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
