"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { FileViewerModal } from "@/components/ui/file-viewer-modal";

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
  const [viewingFile, setViewingFile] = useState<UploadedFile | null>(null);

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
    setViewingFile(null);
    if (!submissionId) {
      setFiles([]);
      return;
    }
    setFiles([]);
    fetchFiles();
  }, [submissionId, fetchFiles]);

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

  const handleViewFile = (file: UploadedFile) => {
    if (!submissionId) return;
    setViewingFile(file);
  };

  const canUpload = !!submissionId || !!onEnsureSubmission;

  type State = "empty" | "dragOver" | "uploading" | "success" | "error";
  const state: State = error ? "error" : uploading ? "uploading" : dragOver ? "dragOver" : files.length > 0 ? "success" : "empty";
  const hasFiles = files.length > 0;

  const AddMoreTrigger = (
    <div
      onClick={() => canUpload && !uploading && inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "rounded-lg border border-dashed border-(--border) transition-all duration-200 flex items-center justify-center gap-2 px-3 py-1.5 min-h-[32px] shrink-0",
        "focus-within:ring-2 focus-within:ring-offset-1 focus-within:ring-(--primary)",
        !canUpload && "cursor-not-allowed opacity-60",
        canUpload && !uploading && "cursor-pointer hover:border-(--primary) hover:bg-(--primary-muted)/10",
        state === "dragOver" && "border-(--primary) bg-(--primary-muted)/20",
        state === "uploading" && "border-(--primary)/50 bg-(--primary-muted)/10",
        state === "error" && "border-(--danger) bg-(--danger-bg)/30"
      )}
      style={state === "dragOver" && accentColor ? { borderColor: accentColor, backgroundColor: `${accentColor}18` } : undefined}
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
      {state === "uploading" ? (
        <div className="w-16 rounded-full overflow-hidden h-1.5 bg-(--border) shrink-0">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%`, backgroundColor: accentColor ?? "var(--primary)" }}
          />
        </div>
      ) : (
        <span className="text-xs font-medium text-foreground">
          {hasFiles ? "+ Add more" : canUpload ? "Drop or click to upload" : "Create submission to upload"}
        </span>
      )}
    </div>
  );

  const EmptyDropzone = (
    <div
      onClick={() => canUpload && !uploading && inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "rounded-lg border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-1 px-4 py-2.5 min-h-[52px]",
        "focus-within:ring-2 focus-within:ring-offset-1",
        !canUpload && "cursor-not-allowed opacity-60",
        canUpload && !uploading && "cursor-pointer hover:border-(--primary)/60",
        state === "dragOver" && "border-(--primary) bg-(--primary-muted)/20",
        state === "uploading" && "border-(--primary)/50 bg-(--primary-muted)/10",
        state === "error" && "border-(--danger) bg-(--danger-bg)/30"
      )}
      style={{
        borderColor: state === "empty" && !dragOver ? "var(--border)" : undefined,
        ...(state === "dragOver" && accentColor ? { borderColor: accentColor, backgroundColor: `${accentColor}18` } : {}),
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
      {state === "uploading" ? (
        <div className="w-full max-w-[160px] rounded-full overflow-hidden h-2 bg-(--border)">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%`, backgroundColor: accentColor ?? "var(--primary)" }}
          />
        </div>
      ) : (
        <>
          <span className="text-sm font-medium text-foreground">
            {state === "dragOver" && "Drop here"}
            {state === "empty" && (canUpload ? label : "Create submission to upload")}
            {state === "error" && error}
          </span>
          {state === "empty" && canUpload && (
            <span className="text-[10px] text-(--foreground-muted)">PDF, images, Excel, CSV · max {MAX_SIZE_MB} MB</span>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className={cn("flex flex-col gap-2 min-h-0", className)}>
      {hasFiles ? (
        <>
          <ul className="rounded-lg border border-(--border) divide-y divide-(--border) overflow-hidden">
            {files.map((f) => (
              <li key={f.id} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-background hover:bg-(--surface)">
                <button
                  type="button"
                  onClick={() => handleViewFile(f)}
                  className="flex-1 min-w-0 truncate font-medium text-foreground hover:underline text-left cursor-pointer"
                  title="View / download"
                >
                  {f.file_name}
                </button>
                <span className="shrink-0 text-(--foreground-muted) tabular-nums">{formatSize(f.file_size_bytes)}</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDelete(f.id); }}
                  className="shrink-0 p-0.5 rounded hover:bg-(--danger-bg) text-(--danger) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--danger)"
                  aria-label={`Delete ${f.file_name}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          {AddMoreTrigger}
          {error && <p className="text-xs text-(--danger)">{error}</p>}
        </>
      ) : (
        <>
          {EmptyDropzone}
          {error && <p className="text-xs text-(--danger)">{error}</p>}
        </>
      )}
      {viewingFile && submissionId && (
        <FileViewerModal
          attachment={{ id: viewingFile.id, file_name: viewingFile.file_name, file_type: viewingFile.file_type }}
          submissionId={submissionId}
          onClose={() => setViewingFile(null)}
        />
      )}
    </div>
  );
}
