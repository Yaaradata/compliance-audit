"use client";
import { FileUploadZone } from "@/components/ui/file-upload-zone";
import { FieldAINote } from "@/components/domain/field-ai-note";
import type { EvidenceInput } from "@/lib/types";

/** Renders a single evidence input. Guide is not shown here — it appears only in the right Evaluation panel. */
export function EvidenceInputRenderer({
  input,
  value,
  onChangeValue,
  onBlur,
  onFileUpload,
  fieldFeedbackHint,
}: {
  input: EvidenceInput;
  value: string;
  onChangeValue: (val: string) => void;
  onBlur?: () => void;
  onFileUpload: (key: string) => void;
  /** AI one-line hint for this field (from field_feedback). */
  fieldFeedbackHint?: string | null;
}) {
  const labelClass = "text-sm font-medium text-gray-700";
  const labelRowClass = "flex flex-wrap items-baseline gap-2 mb-1.5";
  const Hint = fieldFeedbackHint ? (
    <FieldAINote text={fieldFeedbackHint} fieldLabel={input.label} variant="inline" />
  ) : null;

  switch (input.type) {
    case "file":
      return (
        <div>
          <div className={labelRowClass}>
            <label className={labelClass}>{input.label} {input.required && <span className="text-red-500">*</span>}</label>
            {Hint}
          </div>
          <FileUploadZone onUploadComplete={() => onFileUpload(input.id)} label={`Upload ${input.label}`} accept={input.accept} />
        </div>
      );
    case "checkbox":
      return (
        <div>
          <label className="flex items-start gap-2 py-1 cursor-pointer">
            <input type="checkbox" checked={value === "true"} onChange={(e) => onChangeValue(String(e.target.checked))}
              onBlur={onBlur} className="mt-0.5 rounded border-gray-300" />
            <span className="text-sm text-gray-700">{input.label} {input.required && <span className="text-red-500">*</span>}</span>
          </label>
          {Hint}
        </div>
      );
    case "select":
      return (
        <div>
          <div className={labelRowClass}>
            <label className={labelClass}>{input.label} {input.required && <span className="text-red-500">*</span>}</label>
            {Hint}
          </div>
          <select value={value} onChange={(e) => onChangeValue(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white">
            <option value="">Select...</option>
            {input.options?.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      );
    case "textarea":
      return (
        <div>
          <div className={labelRowClass}>
            <label className={labelClass}>{input.label} {input.required && <span className="text-red-500">*</span>}</label>
            {Hint}
          </div>
          <textarea value={value} onChange={(e) => onChangeValue(e.target.value)} onBlur={onBlur}
            placeholder={input.placeholder} rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm resize-y" />
        </div>
      );
    case "date":
      return (
        <div>
          <div className={labelRowClass}>
            <label className={labelClass}>{input.label} {input.required && <span className="text-red-500">*</span>}</label>
            {Hint}
          </div>
          <input type="date" value={value} onChange={(e) => onChangeValue(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
        </div>
      );
    default:
      return (
        <div>
          <div className={labelRowClass}>
            <label className={labelClass}>{input.label} {input.required && <span className="text-red-500">*</span>}</label>
            {Hint}
          </div>
          <input type="text" value={value} onChange={(e) => onChangeValue(e.target.value)} onBlur={onBlur}
            placeholder={input.placeholder} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
        </div>
      );
  }
}
