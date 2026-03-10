"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { api } from "@/lib/api";
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

function FileIcon({ type }: { type?: string }) {
  if (type?.startsWith("image/")) return <ImageIcon />;
  if (type === "application/pdf") return <PdfIcon />;
  if (type?.includes("spreadsheet")) return <SheetIcon />;
  return <DocIcon />;
}

function UploadIcon() {
  return (
    <svg className="w-10 h-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
  );
}

function PdfIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
  );
}

function SheetIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
  );
}

function DocIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  );
}

export function FileUploadZone({
  submissionId,
  label,
  accept,
  onUploadComplete,
  onEnsureSubmission,
}: {
  submissionId?: string | null;
  label?: string;
  accept?: string;
  onUploadComplete?: () => void;
  /** When provided, upload is allowed without submissionId: submission is created on first upload. */
  onEnsureSubmission?: () => Promise<string | null>;
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
        setError("Upload is not available. Please try again.");
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
          setError(`File "${file.name}" exceeds ${MAX_SIZE_MB} MB`);
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

  return (
    <div className="space-y-3">
      <div
        onClick={() => canUpload && !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
          !canUpload
            ? "cursor-not-allowed opacity-75"
            : dragOver
              ? "border-[var(--primary)] bg-[var(--primary-muted)]"
              : "cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--primary-muted)]/30"
        }`}
        style={{
          borderColor: !canUpload ? "var(--border)" : dragOver ? "var(--primary)" : "var(--border)",
          background: !canUpload ? "var(--background)" : dragOver ? "var(--primary-muted)" : "transparent",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept || ACCEPTED_TYPES}
          multiple
          onChange={handleFileSelect}
          disabled={!canUpload}
        />
        <div className="mb-2" style={{ color: !canUpload ? "var(--foreground-subtle)" : "var(--primary)" }}>
          <UploadIcon />
        </div>
        <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
          {uploading ? "Uploading…" : label || "Drop files here or click to upload"}
        </p>
        {canUpload && !uploading && (
          <p className="text-[11px] mt-1" style={{ color: "var(--foreground-muted)" }}>
            PDF, images, Excel, CSV, or plain text · max {MAX_SIZE_MB} MB
          </p>
        )}
        {uploading && (
          <div className="mt-3 w-full rounded-full overflow-hidden" style={{ background: "var(--border)", height: 6 }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%`, background: "var(--primary)" }}
            />
          </div>
        )}
      </div>

      {error && (
        <div className="text-xs rounded-lg px-3 py-2 border" style={{ color: "var(--danger)", background: "var(--danger-bg)", borderColor: "var(--danger)" }}>
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="rounded-xl border divide-y" style={{ borderColor: "var(--border)" }}>
          {files.map((f) => (
            <div key={f.id} className="flex items-center gap-2 px-3 py-2 text-xs">
              <FileIcon type={f.file_type} />
              <button
                type="button"
                onClick={() => submissionId && setViewingFile(f)}
                className="flex-1 truncate font-medium text-left hover:underline cursor-pointer"
                style={{ color: "var(--foreground)" }}
                title="View file"
              >
                {f.file_name}
              </button>
              <span className="shrink-0" style={{ color: "var(--foreground-muted)" }}>{formatSize(f.file_size_bytes)}</span>
              <button
                type="button"
                onClick={() => handleDelete(f.id)}
                className="shrink-0 p-1 rounded transition-colors hover:bg-[var(--danger-bg)]"
                style={{ color: "var(--danger)" }}
                title="Delete file"
                aria-label="Delete file"
              >
                <span aria-hidden>×</span>
              </button>
            </div>
          ))}
        </div>
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
