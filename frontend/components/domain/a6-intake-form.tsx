"use client";

import {
  A6_FORM_KEYS,
  A6_FORM_LABELS,
  A6_FORM_PLACEHOLDERS,
} from "@/lib/frameworks/swift-cscf/evidence/a6-evidence";

export interface A6IntakeFormProps {
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

export function A6IntakeForm({ formData, onChange, onBlur, disabled }: A6IntakeFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A6_FORM_LABELS.zone_boundary_rationale} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData[A6_FORM_KEYS.zone_boundary_rationale] ?? ""}
          onChange={(e) => onChange(A6_FORM_KEYS.zone_boundary_rationale, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A6_FORM_PLACEHOLDERS.zone_boundary_rationale}
          rows={4}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A6_FORM_LABELS.swift_guidance_reference} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData[A6_FORM_KEYS.swift_guidance_reference] ?? ""}
          onChange={(e) => onChange(A6_FORM_KEYS.swift_guidance_reference, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A6_FORM_PLACEHOLDERS.swift_guidance_reference}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A6_FORM_LABELS.segmentation_approach} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData[A6_FORM_KEYS.segmentation_approach] ?? ""}
          onChange={(e) => onChange(A6_FORM_KEYS.segmentation_approach, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Select</option>
          <option value="Dedicated SWIFT zone">Dedicated SWIFT zone</option>
          <option value="Extended production zone">Extended production zone</option>
          <option value="Payment zone">Payment zone</option>
          <option value="Hybrid approach">Hybrid approach</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A6_FORM_LABELS.auth_separation_rationale} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData[A6_FORM_KEYS.auth_separation_rationale] ?? ""}
          onChange={(e) => onChange(A6_FORM_KEYS.auth_separation_rationale, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A6_FORM_PLACEHOLDERS.auth_separation_rationale}
          rows={3}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A6_FORM_LABELS.shared_component_risk}
        </label>
        <textarea
          value={formData[A6_FORM_KEYS.shared_component_risk] ?? ""}
          onChange={(e) => onChange(A6_FORM_KEYS.shared_component_risk, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A6_FORM_PLACEHOLDERS.shared_component_risk}
          rows={3}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A6_FORM_LABELS.co_hosting_justification}
        </label>
        <textarea
          value={formData[A6_FORM_KEYS.co_hosting_justification] ?? ""}
          onChange={(e) => onChange(A6_FORM_KEYS.co_hosting_justification, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A6_FORM_PLACEHOLDERS.co_hosting_justification}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A6_FORM_LABELS.customer_zone_rationale}
        </label>
        <textarea
          value={formData[A6_FORM_KEYS.customer_zone_rationale] ?? ""}
          onChange={(e) => onChange(A6_FORM_KEYS.customer_zone_rationale, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A6_FORM_PLACEHOLDERS.customer_zone_rationale}
          rows={3}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          {A6_FORM_LABELS.customer_zone_equivalence}
        </label>
        <textarea
          value={formData[A6_FORM_KEYS.customer_zone_equivalence] ?? ""}
          onChange={(e) => onChange(A6_FORM_KEYS.customer_zone_equivalence, e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={A6_FORM_PLACEHOLDERS.customer_zone_equivalence}
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
