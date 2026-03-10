"use client";

import {
  A4_FORM_KEYS,
  A4_FORM_LABELS,
  A4_FORM_PLACEHOLDERS,
} from "@/lib/frameworks/swift-cscf/evidence/a4-evidence";

export interface A4IntakeFormProps {
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

export function A4IntakeForm({ formData, onChange, onBlur, disabled }: A4IntakeFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A4_FORM_LABELS.firewall_inventory} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData[A4_FORM_KEYS.firewall_inventory] ?? ""}
          onChange={(e) => onChange(A4_FORM_KEYS.firewall_inventory, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A4_FORM_PLACEHOLDERS.firewall_inventory}
          rows={3}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A4_FORM_LABELS.deny_default_confirmation} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[A4_FORM_KEYS.deny_default_confirmation] ?? ""}
          onChange={(e) => onChange(A4_FORM_KEYS.deny_default_confirmation, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Select</option>
          <option value="Yes - all rulesets">Yes - all rulesets</option>
          <option value="Partial - some rulesets">Partial - some rulesets</option>
          <option value="No">No</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A4_FORM_LABELS.allow_any_exceptions}
        </label>
        <textarea
          value={formData[A4_FORM_KEYS.allow_any_exceptions] ?? ""}
          onChange={(e) => onChange(A4_FORM_KEYS.allow_any_exceptions, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A4_FORM_PLACEHOLDERS.allow_any_exceptions}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A4_FORM_LABELS.internet_deny_confirmation} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[A4_FORM_KEYS.internet_deny_confirmation] ?? ""}
          onChange={(e) => onChange(A4_FORM_KEYS.internet_deny_confirmation, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Select</option>
          <option value="Yes - all systems">Yes - all systems</option>
          <option value="Yes - with documented exceptions">Yes - with documented exceptions</option>
          <option value="No">No</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A4_FORM_LABELS.jump_server_internet_status} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[A4_FORM_KEYS.jump_server_internet_status] ?? ""}
          onChange={(e) => onChange(A4_FORM_KEYS.jump_server_internet_status, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Select</option>
          <option value="Blocked">Blocked</option>
          <option value="Restricted via proxy">Restricted via proxy</option>
          <option value="Not blocked">Not blocked</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A4_FORM_LABELS.annual_review_date} <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={formData[A4_FORM_KEYS.annual_review_date] ?? ""}
          onChange={(e) => onChange(A4_FORM_KEYS.annual_review_date, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A4_FORM_LABELS.annual_review_reviewer} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData[A4_FORM_KEYS.annual_review_reviewer] ?? ""}
          onChange={(e) => onChange(A4_FORM_KEYS.annual_review_reviewer, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A4_FORM_PLACEHOLDERS.annual_review_reviewer}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A4_FORM_LABELS.shared_firewall_notes}
        </label>
        <textarea
          value={formData[A4_FORM_KEYS.shared_firewall_notes] ?? ""}
          onChange={(e) => onChange(A4_FORM_KEYS.shared_firewall_notes, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A4_FORM_PLACEHOLDERS.shared_firewall_notes}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A4_FORM_LABELS.customer_zone_rule_summary}
        </label>
        <textarea
          value={formData[A4_FORM_KEYS.customer_zone_rule_summary] ?? ""}
          onChange={(e) => onChange(A4_FORM_KEYS.customer_zone_rule_summary, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A4_FORM_PLACEHOLDERS.customer_zone_rule_summary}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A4_FORM_LABELS.known_exceptions}
        </label>
        <textarea
          value={formData[A4_FORM_KEYS.known_exceptions] ?? ""}
          onChange={(e) => onChange(A4_FORM_KEYS.known_exceptions, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A4_FORM_PLACEHOLDERS.known_exceptions}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
