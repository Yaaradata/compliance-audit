"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { api } from "@/lib/api";

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
].join(",");

interface UploadedFile {
  id: string;
  file_name: string;
  file_type?: string;
  file_size_bytes: number;
  uploaded_at?: string;
}

function fileIcon(type?: string) {
  if (!type) return "📄";
  if (type === "application/pdf") return "📕";
  if (type.startsWith("image/")) return "🖼️";
  if (type.includes("spreadsheet")) return "📊";
  return "📄";
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUploadZone({
  submissionId,
  label,
  accept,
  onUploadComplete,
}: {
  submissionId?: string | null;
  label?: string;
  accept?: string;
  onUploadComplete?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    if (!submissionId) return;
    try {
      const data = await api.get<UploadedFile[]>(`/evidence/${submissionId}/files`);
      setFiles(data);
    } catch {
      /* ignore */
    }
  }, [submissionId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || !submissionId) return;
    setError(null);
    setUploading(true);

    try {
      for (const file of Array.from(selected)) {
        const result = await api.upload<UploadedFile>(`/evidence/${submissionId}/files`, file);
        setFiles((prev) => [
          ...prev,
          { ...result, file_type: file.type, file_size_bytes: result.file_size_bytes },
        ]);
      }
      onUploadComplete?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!submissionId) return;
    try {
      await api.del(`/evidence/${submissionId}/files/${fileId}`);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch {
      /* ignore */
    }
  };

  const isDisabled = !submissionId;

  return (
    <div className="space-y-2">
      <div
        onClick={() => !isDisabled && !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
          isDisabled
            ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
            : "border-blue-300 bg-blue-50/50 cursor-pointer hover:bg-blue-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept || ACCEPTED_TYPES}
          multiple
          onChange={handleFileSelect}
          disabled={isDisabled}
        />
        <div className="text-2xl mb-1">{uploading ? "⏳" : "📎"}</div>
        <div className="text-sm font-semibold text-blue-800">
          {uploading ? "Uploading…" : label || "Drop files here or click to upload"}
        </div>
        {!isDisabled && (
          <div className="text-[11px] text-gray-500 mt-1">PDF, images, Excel, CSV, or plain text</div>
        )}
        {isDisabled && (
          <div className="text-[11px] text-gray-400 mt-1">Save the submission first to enable uploads</div>
        )}
      </div>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
          {files.map((f) => (
            <div key={f.id} className="flex items-center gap-2 px-3 py-2 text-xs">
              <span>{fileIcon(f.file_type)}</span>
              <span className="flex-1 truncate font-medium text-gray-700">{f.file_name}</span>
              <span className="text-gray-400 shrink-0">{formatSize(f.file_size_bytes)}</span>
              <button
                onClick={() => handleDelete(f.id)}
                className="text-red-400 hover:text-red-600 shrink-0"
                title="Delete file"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
