"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";

export interface FileViewerAttachment {
  id: string;
  file_name: string;
  file_type?: string;
}

function getPreviewType(fileName: string, fileType?: string): "image" | "pdf" | "other" {
  const ext = (fileName?.split(".").pop() || fileType || "").toLowerCase().replace(/^.*\//, "");
  const imageExts = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"];
  if (imageExts.includes(ext)) return "image";
  if (ext === "pdf" || (fileType && fileType.toLowerCase().includes("pdf"))) return "pdf";
  return "other";
}

/**
 * Modal to view an evidence file in the UI: images and PDFs inline; other types get "Open in new tab".
 * Fetches the file via the evidence download endpoint and shows in a lightbox.
 */
export function FileViewerModal({
  attachment,
  submissionId,
  onClose,
}: {
  attachment: FileViewerAttachment | null;
  submissionId: string | null;
  onClose: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!attachment || !submissionId) return;
    setLoading(true);
    setError(null);
    setUrl(null);
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    api
      .getBlob(`/evidence/${submissionId}/files/${attachment.id}`)
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        blobUrlRef.current = objectUrl;
        setUrl(objectUrl);
      })
      .catch((err) => {
        setError(err?.message || "Could not load file.");
      })
      .finally(() => setLoading(false));

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [attachment?.id, submissionId]);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  if (!attachment) return null;

  const previewType = getPreviewType(attachment.file_name, attachment.file_type);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`View ${attachment.file_name}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[var(--surface)] rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-[var(--border)]">
        <div className="shrink-0 flex items-center justify-between gap-4 px-4 py-3 border-b border-[var(--border)] bg-[var(--background)]/80">
          <h3 className="text-sm font-semibold text-[var(--foreground)] truncate flex-1 min-w-0">
            {attachment.file_name}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                download={attachment.file_name}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--primary-muted)] hover:border-[var(--primary)]/40 text-[var(--foreground)] hover:text-[var(--primary)]"
              >
                Open in new tab
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--background)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0 flex items-center justify-center overflow-auto bg-[var(--background)]/30 p-4">
          {loading ? (
            <p className="text-sm text-[var(--foreground-muted)]">Loading file…</p>
          ) : error ? (
            <p className="text-sm text-[var(--foreground-muted)]">{error}</p>
          ) : !url ? (
            <p className="text-sm text-[var(--foreground-muted)]">File not available to view.</p>
          ) : previewType === "image" ? (
            <img
              src={url}
              alt={attachment.file_name}
              className="max-w-full max-h-[calc(90vh-56px)] w-auto h-auto object-contain rounded-lg shadow-lg"
            />
          ) : previewType === "pdf" ? (
            <iframe
              src={url}
              title={attachment.file_name}
              className="w-full min-h-[calc(90vh-56px)] rounded-lg border-0 bg-white"
              style={{ height: "min(80vh, 800px)" }}
            />
          ) : (
            <div className="text-center max-w-sm p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
              <p className="text-sm text-[var(--foreground-muted)] mb-2">
                Preview not available for this file type. Open in a new tab to view or download.
              </p>
              <p className="text-xs text-[var(--foreground-subtle)] mb-4">{attachment.file_name}</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                download={attachment.file_name}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90"
              >
                Open in new tab
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
