"use client";

interface AwsEvidenceContentModalProps {
  content?: unknown;
  error?: string;
  onClose: () => void;
}

export function AwsEvidenceContentModal({ content, error, onClose }: AwsEvidenceContentModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl shadow-lg"
        style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Evidence content</h3>
          <button
            type="button"
            className="rounded p-1 transition-colors hover:opacity-80"
            style={{ color: "var(--foreground-muted)" }}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {error ? (
            <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>
          ) : content !== undefined && content !== null ? (
            <pre className="whitespace-pre-wrap break-words font-mono text-xs" style={{ color: "var(--foreground)" }}>
              {typeof content === "string" ? content : JSON.stringify(content, null, 2)}
            </pre>
          ) : (
            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>No content</p>
          )}
        </div>
      </div>
    </div>
  );
}
