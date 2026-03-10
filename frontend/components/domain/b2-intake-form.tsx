"use client";

import {
  B2_FORM_KEYS,
  B2_FORM_LABELS,
  B2_FORM_PLACEHOLDERS,
} from "@/lib/frameworks/swift-cscf/evidence/b2-evidence";

export interface B2IntakeFormProps {
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

export function B2IntakeForm({ formData, onChange, onBlur, disabled }: B2IntakeFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B2_FORM_LABELS.tls_version_enforced} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[B2_FORM_KEYS.tls_version_enforced] ?? ""}
          onChange={(e) => onChange(B2_FORM_KEYS.tls_version_enforced, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Select</option>
          <option value="TLS 1.3">TLS 1.3</option>
          <option value="TLS 1.2+">TLS 1.2+</option>
          <option value="Mixed (includes TLS 1.1 or lower)">Mixed (includes TLS 1.1 or lower)</option>
          <option value="Unknown">Unknown</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B2_FORM_LABELS.cipher_suites_configured} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData[B2_FORM_KEYS.cipher_suites_configured] ?? ""}
          onChange={(e) => onChange(B2_FORM_KEYS.cipher_suites_configured, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B2_FORM_PLACEHOLDERS.cipher_suites_configured}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B2_FORM_LABELS.session_timeout_value} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData[B2_FORM_KEYS.session_timeout_value] ?? ""}
          onChange={(e) => onChange(B2_FORM_KEYS.session_timeout_value, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder="e.g. 15"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B2_FORM_LABELS.weak_protocols_disabled} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[B2_FORM_KEYS.weak_protocols_disabled] ?? ""}
          onChange={(e) => onChange(B2_FORM_KEYS.weak_protocols_disabled, e.target.value)}
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

      {formData[B2_FORM_KEYS.weak_protocols_disabled] === "Partial" && (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            {B2_FORM_LABELS.weak_protocols_remaining} <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData[B2_FORM_KEYS.weak_protocols_remaining] ?? ""}
            onChange={(e) => onChange(B2_FORM_KEYS.weak_protocols_remaining, e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={B2_FORM_PLACEHOLDERS.weak_protocols_remaining}
            rows={2}
            className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B2_FORM_LABELS.jump_server_encryption}
        </label>
        <textarea
          value={formData[B2_FORM_KEYS.jump_server_encryption] ?? ""}
          onChange={(e) => onChange(B2_FORM_KEYS.jump_server_encryption, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B2_FORM_PLACEHOLDERS.jump_server_encryption}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B2_FORM_LABELS.swift_hardening_applied} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[B2_FORM_KEYS.swift_hardening_applied] ?? ""}
          onChange={(e) => onChange(B2_FORM_KEYS.swift_hardening_applied, e.target.value)}
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
          {B2_FORM_LABELS.default_app_passwords_changed} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[B2_FORM_KEYS.default_app_passwords_changed] ?? ""}
          onChange={(e) => onChange(B2_FORM_KEYS.default_app_passwords_changed, e.target.value)}
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
          {B2_FORM_LABELS.unnecessary_components_disabled} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[B2_FORM_KEYS.unnecessary_components_disabled] ?? ""}
          onChange={(e) => onChange(B2_FORM_KEYS.unnecessary_components_disabled, e.target.value)}
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
          {B2_FORM_LABELS.app_deviations_documented}
        </label>
        <textarea
          value={formData[B2_FORM_KEYS.app_deviations_documented] ?? ""}
          onChange={(e) => onChange(B2_FORM_KEYS.app_deviations_documented, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B2_FORM_PLACEHOLDERS.app_deviations_documented}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B2_FORM_LABELS.known_gaps}
        </label>
        <textarea
          value={formData[B2_FORM_KEYS.known_gaps] ?? ""}
          onChange={(e) => onChange(B2_FORM_KEYS.known_gaps, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B2_FORM_PLACEHOLDERS.known_gaps}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
