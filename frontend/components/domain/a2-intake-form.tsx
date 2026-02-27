"use client";

import {
  A2_FORM_KEYS,
  A2_FORM_LABELS,
  A2_FORM_PLACEHOLDERS,
  A2_SPREADSHEET_COLUMNS,
} from "@/lib/data/a2-evidence";

export interface A2IntakeFormProps {
  rows: Record<string, string>[];
  onRowChange: (index: number, key: string, value: string) => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

export function A2IntakeForm({
  rows,
  onRowChange,
  onAddRow,
  onRemoveRow,
  formData,
  onChange,
  onBlur,
  disabled,
}: A2IntakeFormProps) {
  const inputClass = "border border-gray-300 rounded px-1.5 py-1 text-xs w-full min-w-0";
  const selectClass = "border border-gray-300 rounded px-1.5 py-1 text-xs w-full min-w-0 bg-white";

  return (
    <div className="space-y-4">
      <div className="rounded border border-gray-200 bg-white">
        <div className="max-h-[400px] overflow-auto">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max border-collapse">
              <thead>
                <tr className="sticky top-0 z-10 bg-gray-100">
                  <th className="border-b border-r border-gray-200 px-2 py-1.5 text-left text-[10px] font-semibold uppercase text-gray-700 w-8">
                    #
                  </th>
                  {A2_SPREADSHEET_COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className="border-b border-r border-gray-200 px-2 py-1.5 text-left text-[10px] font-semibold uppercase text-gray-700 whitespace-nowrap"
                      style={col.width ? { width: col.width } : undefined}
                    >
                      {col.label}
                      {col.required && <span className="text-red-500 ml-0.5">*</span>}
                    </th>
                  ))}
                  <th className="border-b border-gray-200 px-2 py-1.5 w-8" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border-b border-r border-gray-200 px-2 py-1 text-xs text-gray-500">
                      {index + 1}
                    </td>
                    {A2_SPREADSHEET_COLUMNS.map((col) => (
                      <td key={col.key} className="border-b border-r border-gray-200 p-0.5">
                        {col.type === "select" ? (
                          <select
                            value={row[col.key] ?? ""}
                            onChange={(e) => onRowChange(index, col.key, e.target.value)}
                            onBlur={onBlur}
                            disabled={disabled}
                            className={selectClass}
                          >
                            {col.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt || "—"}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={row[col.key] ?? ""}
                            onChange={(e) => onRowChange(index, col.key, e.target.value)}
                            onBlur={onBlur}
                            disabled={disabled}
                            className={inputClass}
                            placeholder={col.required ? "(required)" : ""}
                          />
                        )}
                      </td>
                    ))}
                    <td className="border-b border-gray-200 px-1 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => onRemoveRow(index)}
                        disabled={disabled}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-0.5 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Remove row"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="border-t border-gray-200 p-2">
          <button
            type="button"
            onClick={onAddRow}
            disabled={disabled}
            className="w-full rounded border-2 border-dashed border-green-400 bg-green-50 py-2 text-xs font-medium text-green-700 hover:bg-green-100 hover:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Add Row
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            {A2_FORM_LABELS.exclusion_justification}
          </label>
          <textarea
            value={formData[A2_FORM_KEYS.exclusion_justification] ?? ""}
            onChange={(e) => onChange(A2_FORM_KEYS.exclusion_justification, e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={A2_FORM_PLACEHOLDERS.exclusion_justification}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-y"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            {A2_FORM_LABELS.co_hosting_notes}
          </label>
          <textarea
            value={formData[A2_FORM_KEYS.co_hosting_notes] ?? ""}
            onChange={(e) => onChange(A2_FORM_KEYS.co_hosting_notes, e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={A2_FORM_PLACEHOLDERS.co_hosting_notes}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-y"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            {A2_FORM_LABELS.customer_zone_notes}
          </label>
          <textarea
            value={formData[A2_FORM_KEYS.customer_zone_notes] ?? ""}
            onChange={(e) => onChange(A2_FORM_KEYS.customer_zone_notes, e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={A2_FORM_PLACEHOLDERS.customer_zone_notes}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-y"
          />
        </div>
      </div>
    </div>
  );
}
