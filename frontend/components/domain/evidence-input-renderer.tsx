"use client";
import { FileUploadZone } from "@/components/ui/file-upload-zone";
import type { EvidenceInput } from "@/lib/types";

export function EvidenceInputRenderer({
  input, value, onChangeValue, onFileUpload,
}: {
  input: EvidenceInput;
  value: string;
  onChangeValue: (val: string) => void;
  onFileUpload: (key: string) => void;
}) {
  const labelClass = "block text-xs font-medium text-gray-700 mb-1";

  switch (input.type) {
    case "file":
      return (
        <div>
          <label className={labelClass}>{input.label} {input.required && <span className="text-red-500">*</span>}</label>
          <FileUploadZone onUploadComplete={() => onFileUpload(input.id)} label={`Upload ${input.label}`} accept={input.accept} />
        </div>
      );
    case "checkbox":
      return (
        <label className="flex items-start gap-2 py-1 cursor-pointer">
          <input type="checkbox" checked={value === "true"} onChange={(e) => onChangeValue(String(e.target.checked))}
            className="mt-0.5 rounded border-gray-300" />
          <span className="text-xs text-gray-700">{input.label} {input.required && <span className="text-red-500">*</span>}</span>
        </label>
      );
    case "select":
      return (
        <div>
          <label className={labelClass}>{input.label} {input.required && <span className="text-red-500">*</span>}</label>
          <select value={value} onChange={(e) => onChangeValue(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs bg-white">
            <option value="">Select...</option>
            {input.options?.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      );
    case "textarea":
      return (
        <div>
          <label className={labelClass}>{input.label} {input.required && <span className="text-red-500">*</span>}</label>
          <textarea value={value} onChange={(e) => onChangeValue(e.target.value)} placeholder={input.placeholder}
            rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs resize-y" />
        </div>
      );
    case "date":
      return (
        <div>
          <label className={labelClass}>{input.label} {input.required && <span className="text-red-500">*</span>}</label>
          <input type="date" value={value} onChange={(e) => onChangeValue(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs" />
        </div>
      );
    default:
      return (
        <div>
          <label className={labelClass}>{input.label} {input.required && <span className="text-red-500">*</span>}</label>
          <input type="text" value={value} onChange={(e) => onChangeValue(e.target.value)} placeholder={input.placeholder}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs" />
        </div>
      );
  }
}
