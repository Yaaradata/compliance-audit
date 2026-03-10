"use client";

import {
  B1_FORM_KEYS,
  B1_FORM_LABELS,
  B1_FORM_PLACEHOLDERS,
} from "@/lib/frameworks/swift-cscf/evidence/b1-evidence";

export interface B1IntakeFormProps {
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

export function B1IntakeForm({ formData, onChange, onBlur, disabled }: B1IntakeFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B1_FORM_LABELS.hardening_baseline_name} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData[B1_FORM_KEYS.hardening_baseline_name] ?? ""}
          onChange={(e) => onChange(B1_FORM_KEYS.hardening_baseline_name, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B1_FORM_PLACEHOLDERS.hardening_baseline_name}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B1_FORM_LABELS.builtin_admin_status} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[B1_FORM_KEYS.builtin_admin_status] ?? ""}
          onChange={(e) => onChange(B1_FORM_KEYS.builtin_admin_status, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Select</option>
          <option value="Disabled for interactive login">Disabled for interactive login</option>
          <option value="Restricted to maintenance mode">Restricted to maintenance mode</option>
          <option value="Enabled">Enabled</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B1_FORM_LABELS.individual_admin_confirmed} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[B1_FORM_KEYS.individual_admin_confirmed] ?? ""}
          onChange={(e) => onChange(B1_FORM_KEYS.individual_admin_confirmed, e.target.value)}
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
          {B1_FORM_LABELS.privilege_elevation_logging} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[B1_FORM_KEYS.privilege_elevation_logging] ?? ""}
          onChange={(e) => onChange(B1_FORM_KEYS.privilege_elevation_logging, e.target.value)}
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
          {B1_FORM_LABELS.password_storage_zone_local} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[B1_FORM_KEYS.password_storage_zone_local] ?? ""}
          onChange={(e) => onChange(B1_FORM_KEYS.password_storage_zone_local, e.target.value)}
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
          {B1_FORM_LABELS.network_device_admin_access} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData[B1_FORM_KEYS.network_device_admin_access] ?? ""}
          onChange={(e) => onChange(B1_FORM_KEYS.network_device_admin_access, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B1_FORM_PLACEHOLDERS.network_device_admin_access}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B1_FORM_LABELS.default_passwords_changed} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[B1_FORM_KEYS.default_passwords_changed] ?? ""}
          onChange={(e) => onChange(B1_FORM_KEYS.default_passwords_changed, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Select</option>
          <option value="Yes - all systems">Yes - all systems</option>
          <option value="Partial">Partial</option>
          <option value="No">No</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B1_FORM_LABELS.autolock_configured} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[B1_FORM_KEYS.autolock_configured] ?? ""}
          onChange={(e) => onChange(B1_FORM_KEYS.autolock_configured, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Select</option>
          <option value="Yes - ≤15 min">Yes - ≤15 min</option>
          <option value="Yes - >15 min">Yes - &gt;15 min</option>
          <option value="No">No</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B1_FORM_LABELS.usb_ports_restricted} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[B1_FORM_KEYS.usb_ports_restricted] ?? ""}
          onChange={(e) => onChange(B1_FORM_KEYS.usb_ports_restricted, e.target.value)}
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
          {B1_FORM_LABELS.hardening_check_dates} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData[B1_FORM_KEYS.hardening_check_dates] ?? ""}
          onChange={(e) => onChange(B1_FORM_KEYS.hardening_check_dates, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B1_FORM_PLACEHOLDERS.hardening_check_dates}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B1_FORM_LABELS.deviations_documented}
        </label>
        <textarea
          value={formData[B1_FORM_KEYS.deviations_documented] ?? ""}
          onChange={(e) => onChange(B1_FORM_KEYS.deviations_documented, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B1_FORM_PLACEHOLDERS.deviations_documented}
          rows={3}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B1_FORM_LABELS.known_gaps}
        </label>
        <textarea
          value={formData[B1_FORM_KEYS.known_gaps] ?? ""}
          onChange={(e) => onChange(B1_FORM_KEYS.known_gaps, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B1_FORM_PLACEHOLDERS.known_gaps}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
