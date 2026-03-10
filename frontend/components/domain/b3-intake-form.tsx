"use client";

import {
  B3_FORM_KEYS,
  B3_FORM_LABELS,
  B3_FORM_PLACEHOLDERS,
} from "@/lib/frameworks/swift-cscf/evidence/b3-evidence";

export interface B3IntakeFormProps {
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

const FIELDS: { key: keyof typeof B3_FORM_KEYS; rows: number; required?: boolean }[] = [
  { key: "internal_flow_summary", rows: 3, required: true },
  { key: "tls_version_per_flow", rows: 3, required: true },
  { key: "lau_configuration", rows: 2 },
  { key: "cross_environment_encryption", rows: 2 },
  { key: "backoffice_flow_protection", rows: 3, required: true },
  { key: "external_transmission_encryption", rows: 2, required: true },
  { key: "backup_encryption", rows: 2 },
  { key: "at_rest_encryption", rows: 2 },
  { key: "key_management_approach", rows: 2, required: true },
  { key: "operator_session_transport", rows: 2, required: true },
  { key: "unprotected_flows", rows: 2 },
  { key: "known_gaps", rows: 2 },
];

export function B3IntakeForm({ formData, onChange, onBlur, disabled }: B3IntakeFormProps) {
  return (
    <div className="space-y-4">
      {FIELDS.map(({ key, rows, required }) => {
        const formKey = B3_FORM_KEYS[key];
        return (
          <div key={key}>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              {B3_FORM_LABELS[formKey]}
              {required && <span className="text-red-500"> *</span>}
            </label>
            <textarea
              value={formData[formKey] ?? ""}
              onChange={(e) => onChange(formKey, e.target.value)}
              onBlur={onBlur}
              disabled={disabled}
              placeholder={B3_FORM_PLACEHOLDERS[formKey]}
              rows={rows}
              className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </div>
        );
      })}
    </div>
  );
}
