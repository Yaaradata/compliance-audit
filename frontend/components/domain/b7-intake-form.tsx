"use client";

import {
  B7_FORM_KEYS,
  B7_FORM_LABELS,
  B7_FORM_PLACEHOLDERS,
} from "@/lib/frameworks/swift-cscf/evidence/b7-evidence";

export interface B7IntakeFormProps {
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

const SELECT_YES_NO: { value: string; label: string }[] = [
  { value: "", label: "Select" },
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const SELECT_YES_NO_NA: { value: string; label: string }[] = [
  { value: "", label: "Select" },
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
  { value: "N/A", label: "N/A" },
];

export function B7IntakeForm({ formData, onChange, onBlur, disabled }: B7IntakeFormProps) {
  const sel = (key: string, label: string, options: { value: string; label: string }[], required = true) => (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={formData[key] ?? ""}
        onChange={(e) => onChange(key, e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  return (
    <div className="space-y-4">
      {sel(B7_FORM_KEYS.os_admin_mfa, B7_FORM_LABELS.os_admin_mfa, SELECT_YES_NO)}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B7_FORM_LABELS.os_admin_mfa_method}
        </label>
        <input
          type="text"
          value={formData[B7_FORM_KEYS.os_admin_mfa_method] ?? ""}
          onChange={(e) => onChange(B7_FORM_KEYS.os_admin_mfa_method, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B7_FORM_PLACEHOLDERS.os_admin_mfa_method}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      {sel(B7_FORM_KEYS.end_user_mfa, B7_FORM_LABELS.end_user_mfa, SELECT_YES_NO)}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B7_FORM_LABELS.end_user_mfa_method}
        </label>
        <input
          type="text"
          value={formData[B7_FORM_KEYS.end_user_mfa_method] ?? ""}
          onChange={(e) => onChange(B7_FORM_KEYS.end_user_mfa_method, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B7_FORM_PLACEHOLDERS.end_user_mfa_method}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      {sel(B7_FORM_KEYS.remote_vpn_mfa, B7_FORM_LABELS.remote_vpn_mfa, SELECT_YES_NO)}
      {sel(B7_FORM_KEYS.virtualisation_console_mfa, B7_FORM_LABELS.virtualisation_console_mfa, SELECT_YES_NO_NA)}
      {sel(B7_FORM_KEYS.hsm_mfa, B7_FORM_LABELS.hsm_mfa, SELECT_YES_NO_NA)}
      {sel(B7_FORM_KEYS.service_provider_mfa, B7_FORM_LABELS.service_provider_mfa, SELECT_YES_NO_NA)}

      {sel(B7_FORM_KEYS.separate_device_confirmed, B7_FORM_LABELS.separate_device_confirmed, SELECT_YES_NO)}
      {sel(B7_FORM_KEYS.credentials_in_zone, B7_FORM_LABELS.credentials_in_zone, SELECT_YES_NO)}
      {sel(B7_FORM_KEYS.individual_assignment, B7_FORM_LABELS.individual_assignment, SELECT_YES_NO)}
      {sel(B7_FORM_KEYS.sso_mfa_status, B7_FORM_LABELS.sso_mfa_status, [
        { value: "", label: "Select" },
        { value: "Yes", label: "Yes" },
        { value: "No", label: "No" },
        { value: "SSO not used", label: "SSO not used" },
      ])}

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B7_FORM_LABELS.known_gaps}
        </label>
        <textarea
          value={formData[B7_FORM_KEYS.known_gaps] ?? ""}
          onChange={(e) => onChange(B7_FORM_KEYS.known_gaps, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B7_FORM_PLACEHOLDERS.known_gaps}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
