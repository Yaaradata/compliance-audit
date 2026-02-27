"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
].join(",");
const MAX_SIZE_MB = 20;

interface UploadedFile {
  id: string;
  file_name: string;
  file_type?: string;
  file_size_bytes: number;
  uploaded_at?: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CompactDropzone({
  submissionId,
  label = "Drop files or click to upload",
  onUploadComplete,
  onEnsureSubmission,
  className,
  accentColor,
}: {
  submissionId?: string | null;
  label?: string;
  onUploadComplete?: () => void;
  onEnsureSubmission?: () => Promise<string | null>;
  className?: string;
  accentColor?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

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

  const getSubmissionId = useCallback(async (): Promise<string | null> => {
    if (submissionId) return submissionId;
    if (onEnsureSubmission) {
      try {
        return await onEnsureSubmission();
      } catch {
        return null;
      }
    }
    return null;
  }, [submissionId, onEnsureSubmission]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected?.length) return;
    setError(null);
    setUploading(true);
    let sid: string | null = null;
    try {
      sid = await getSubmissionId();
      if (!sid) {
        setError("Upload unavailable.");
        setUploading(false);
        return;
      }
    } catch {
      setError("Could not prepare upload.");
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    const total = selected.length;
    let done = 0;
    try {
      for (const file of Array.from(selected)) {
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          setError(`Max ${MAX_SIZE_MB} MB`);
          break;
        }
        setUploadProgress(total > 0 ? Math.round((done / total) * 100) : 0);
        const result = await api.upload<UploadedFile>(`/evidence/${sid}/files`, file);
        setFiles((prev) => [...prev, { ...result, file_type: file.type, file_size_bytes: result.file_size_bytes }]);
        done++;
        setUploadProgress(Math.round((done / total) * 100));
      }
      onUploadComplete?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (uploading) return;
    const dropped = e.dataTransfer.files;
    if (dropped?.length && inputRef.current) {
      const dt = new DataTransfer();
      for (const f of Array.from(dropped)) dt.items.add(f);
      inputRef.current.files = dt.files;
      handleFileSelect({ target: inputRef.current } as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!uploading) setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDelete = async (fileId: string) => {
    if (!submissionId) return;
    try {
      await api.del(`/evidence/${submissionId}/files/${fileId}`);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch {
      /* ignore */
    }
  };

  const canUpload = !!submissionId || !!onEnsureSubmission;

  type State = "empty" | "dragOver" | "uploading" | "success" | "error";
  const state: State = error ? "error" : uploading ? "uploading" : dragOver ? "dragOver" : files.length > 0 ? "success" : "empty";

  return (
    <div className={cn("flex flex-col gap-2 min-h-0", className)}>
      <div
        onClick={() => canUpload && !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "rounded-xl border-2 border-dashed transition-all duration-200 min-h-[120px] max-h-[180px] flex flex-col items-center justify-center px-4 py-4",
          "focus-within:ring-2 focus-within:ring-offset-2",
          !canUpload && "cursor-not-allowed opacity-60",
          canUpload && !uploading && "cursor-pointer hover:scale-[1.01] active:scale-[0.99]",
          state === "dragOver" && "scale-[1.02]",
          state === "uploading" && "border-[var(--primary)]/50 bg-[var(--primary-muted)]/10",
          state === "success" && "border-[var(--success)]/60 bg-[var(--success)]/10",
          state === "error" && "border-[var(--danger)] bg-[var(--danger-bg)]/30"
        )}
        style={{
          borderColor:
            state === "empty" && !dragOver
              ? "var(--border)"
              : state === "dragOver" || state === "uploading"
                ? accentColor ?? "var(--primary)"
                : undefined,
          ...(state === "dragOver" && accentColor ? { backgroundColor: `${accentColor}18` } : {}),
          ...(state === "empty" && canUpload && accentColor ? { ["--tw-ring-color" as string]: accentColor } : {}),
        }}
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={ACCEPTED_TYPES}
          multiple
          onChange={handleFileSelect}
          disabled={!canUpload}
          aria-label="Upload files"
        />
        {state === "uploading" && (
          <div className="w-full max-w-xs rounded-full overflow-hidden h-2 bg-[var(--border)]">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%`, backgroundColor: accentColor ?? "var(--primary)" }}
            />
          </div>
        )}
        <p className="text-sm font-semibold text-[var(--foreground)] text-center">
          {state === "uploading" && "Uploading…"}
          {state === "dragOver" && "Drop here"}
          {state === "empty" && (canUpload ? "Upload Evidence — " + label : "Create submission to upload")}
          {state === "success" && `${files.length} file${files.length !== 1 ? "s" : ""} uploaded`}
          {state === "error" && error}
        </p>
        {state === "empty" && canUpload && (
          <p className="text-[10px] text-[var(--foreground-muted)] mt-1">PDF, images, Excel, CSV · max {MAX_SIZE_MB} MB</p>
        )}
      </div>
      {files.length > 0 && (
        <ul className="overflow-y-auto min-h-0 rounded-lg border border-[var(--border)] divide-y divide-[var(--border)] max-h-32">
          {files.map((f) => (
            <li key={f.id} className="flex items-center gap-2 px-2 py-1.5 text-[11px]">
              <span className="flex-1 truncate font-medium text-[var(--foreground)]">{f.file_name}</span>
              <span className="shrink-0 text-[var(--foreground-muted)]">{formatSize(f.file_size_bytes)}</span>
              <button
                type="button"
                onClick={() => handleDelete(f.id)}
                className="shrink-0 p-0.5 rounded hover:bg-[var(--danger-bg)] text-[var(--danger)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger)]"
                aria-label={`Delete ${f.file_name}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
