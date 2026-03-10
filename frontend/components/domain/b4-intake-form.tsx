"use client";

import {
  B4_FORM_KEYS,
  B4_FORM_LABELS,
  B4_FORM_PLACEHOLDERS,
} from "@/lib/frameworks/swift-cscf/evidence/b4-evidence";

export interface B4IntakeFormProps {
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

export function B4IntakeForm({ formData, onChange, onBlur, disabled }: B4IntakeFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B4_FORM_LABELS.platform_type} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData[B4_FORM_KEYS.platform_type] ?? ""}
          onChange={(e) => onChange(B4_FORM_KEYS.platform_type, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B4_FORM_PLACEHOLDERS.platform_type}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B4_FORM_LABELS.platform_location} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[B4_FORM_KEYS.platform_location] ?? ""}
          onChange={(e) => onChange(B4_FORM_KEYS.platform_location, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Select</option>
          <option value="Yes - in secure zone">Yes - in secure zone</option>
          <option value="Equivalent secure zone">Equivalent secure zone</option>
          <option value="No">No</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B4_FORM_LABELS.vm_isolation_configured} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[B4_FORM_KEYS.vm_isolation_configured] ?? ""}
          onChange={(e) => onChange(B4_FORM_KEYS.vm_isolation_configured, e.target.value)}
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
          {B4_FORM_LABELS.network_flow_filtering} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData[B4_FORM_KEYS.network_flow_filtering] ?? ""}
          onChange={(e) => onChange(B4_FORM_KEYS.network_flow_filtering, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B4_FORM_PLACEHOLDERS.network_flow_filtering}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B4_FORM_LABELS.privileged_access_restrictions} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData[B4_FORM_KEYS.privileged_access_restrictions] ?? ""}
          onChange={(e) => onChange(B4_FORM_KEYS.privileged_access_restrictions, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B4_FORM_PLACEHOLDERS.privileged_access_restrictions}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B4_FORM_LABELS.platform_password_policy} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[B4_FORM_KEYS.platform_password_policy] ?? ""}
          onChange={(e) => onChange(B4_FORM_KEYS.platform_password_policy, e.target.value)}
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
          {B4_FORM_LABELS.security_update_status} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData[B4_FORM_KEYS.security_update_status] ?? ""}
          onChange={(e) => onChange(B4_FORM_KEYS.security_update_status, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B4_FORM_PLACEHOLDERS.security_update_status}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B4_FORM_LABELS.mfa_for_vm_access} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[B4_FORM_KEYS.mfa_for_vm_access] ?? ""}
          onChange={(e) => onChange(B4_FORM_KEYS.mfa_for_vm_access, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Select</option>
          <option value="Yes - at VM level">Yes - at VM level</option>
          <option value="Yes - at platform level">Yes - at platform level</option>
          <option value="No">No</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B4_FORM_LABELS.physical_protection}
        </label>
        <textarea
          value={formData[B4_FORM_KEYS.physical_protection] ?? ""}
          onChange={(e) => onChange(B4_FORM_KEYS.physical_protection, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B4_FORM_PLACEHOLDERS.physical_protection}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B4_FORM_LABELS.container_isolation}
        </label>
        <textarea
          value={formData[B4_FORM_KEYS.container_isolation] ?? ""}
          onChange={(e) => onChange(B4_FORM_KEYS.container_isolation, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B4_FORM_PLACEHOLDERS.container_isolation}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B4_FORM_LABELS.third_party_hosted} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[B4_FORM_KEYS.third_party_hosted] ?? ""}
          onChange={(e) => onChange(B4_FORM_KEYS.third_party_hosted, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>

      {formData[B4_FORM_KEYS.third_party_hosted] === "Yes" && (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            {B4_FORM_LABELS.third_party_comfort} <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData[B4_FORM_KEYS.third_party_comfort] ?? ""}
            onChange={(e) => onChange(B4_FORM_KEYS.third_party_comfort, e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={B4_FORM_PLACEHOLDERS.third_party_comfort}
            rows={3}
            className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {B4_FORM_LABELS.known_gaps}
        </label>
        <textarea
          value={formData[B4_FORM_KEYS.known_gaps] ?? ""}
          onChange={(e) => onChange(B4_FORM_KEYS.known_gaps, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={B4_FORM_PLACEHOLDERS.known_gaps}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
