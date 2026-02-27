"use client";

export type FieldType = "textarea" | "select" | "text" | "date";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  rows?: number;
}

export interface GenericIntakeFormProps {
  fields: FieldDef[];
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

export function GenericIntakeForm({ fields, formData, onChange, onBlur, disabled }: GenericIntakeFormProps) {
  return (
    <div className="space-y-4">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            {f.label}
            {f.required !== false && <span className="text-red-500"> *</span>}
          </label>
          {f.type === "select" ? (
            <select
              value={formData[f.key] ?? ""}
              onChange={(e) => onChange(f.key, e.target.value)}
              onBlur={onBlur}
              disabled={disabled}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Select</option>
              {(f.options ?? ["Yes", "Partial", "No"]).map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          ) : f.type === "date" ? (
            <input
              type="date"
              value={formData[f.key] ?? ""}
              onChange={(e) => onChange(f.key, e.target.value)}
              onBlur={onBlur}
              disabled={disabled}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          ) : f.type === "text" ? (
            <input
              type="text"
              value={formData[f.key] ?? ""}
              onChange={(e) => onChange(f.key, e.target.value)}
              onBlur={onBlur}
              disabled={disabled}
              placeholder={f.placeholder}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          ) : (
            <textarea
              value={formData[f.key] ?? ""}
              onChange={(e) => onChange(f.key, e.target.value)}
              onBlur={onBlur}
              disabled={disabled}
              placeholder={f.placeholder}
              rows={f.rows ?? 2}
              className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          )}
        </div>
      ))}
    </div>
  );
}
