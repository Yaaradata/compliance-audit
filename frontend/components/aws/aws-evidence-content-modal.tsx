"use client";

import { awsIconButtonClass } from "@/components/aws/aws-ui";

type ComparisonEntry = {
  evidenceId: string;
  runId?: string;
  runLabel: string;
  runStatus: string;
  sourceSystem: string;
  evidenceType: string;
  collectedAt: string | null;
  isCurrent: boolean;
  content?: unknown;
  error?: string;
};

interface AwsEvidenceContentModalProps {
  content?: unknown;
  error?: string;
  comparison?: {
    controlId: string;
    itemCode: string;
    selectedEvidenceId: string;
    entries: ComparisonEntry[];
  };
  onClose: () => void;
}

function normalizeObject(content: unknown): Record<string, unknown> {
  if (content && typeof content === "object" && !Array.isArray(content)) return content as Record<string, unknown>;
  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
    } catch {
      return { value: content };
    }
  }
  if (Array.isArray(content)) return { values: content };
  return { value: content ?? "—" };
}

function compactValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

function renderReadableFields(content: unknown) {
  const obj = normalizeObject(content);
  const entries = Object.entries(obj).slice(0, 16);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
      {entries.map(([k, v]) => (
        <div key={k} className="rounded border px-2.5 py-2" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
          <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>{k.replace(/_/g, " ")}</p>
          <p className="text-xs mt-1 break-words" style={{ color: "var(--foreground)" }}>{compactValue(v)}</p>
        </div>
      ))}
    </div>
  );
}

export function AwsEvidenceContentModal({ content, error, comparison, onClose }: AwsEvidenceContentModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl shadow-lg"
        style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            {comparison ? `Evidence comparison · Item ${comparison.itemCode} · Control ${comparison.controlId}` : "Evidence content"}
          </h3>
          <button
            type="button"
            className={awsIconButtonClass}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {error ? (
            <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>
          ) : comparison ? (
            <div className="space-y-3">
              <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                Selected run is highlighted. Compare direct values across runs for the same evidence item.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {comparison.entries.map((entry) => (
                  <section
                    key={entry.evidenceId}
                    className="rounded-xl border p-3 space-y-2"
                    style={{
                      borderColor: entry.isCurrent ? "var(--primary)" : "var(--border)",
                      background: entry.isCurrent ? "var(--primary-muted)" : "var(--surface)",
                    }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{entry.runLabel}</span>
                        <span
                          className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{
                            color:
                              entry.runStatus === "success"
                                ? "var(--success)"
                                : entry.runStatus === "partial"
                                  ? "#d97706"
                                  : entry.runStatus === "failed"
                                    ? "var(--danger)"
                                    : "var(--warning)",
                            background:
                              entry.runStatus === "success"
                                ? "rgba(22, 163, 74, 0.15)"
                                : entry.runStatus === "partial"
                                  ? "rgba(217,119,6,0.15)"
                                  : entry.runStatus === "failed"
                                    ? "rgba(220, 38, 38, 0.15)"
                                    : "rgba(245, 158, 11, 0.15)",
                          }}
                        >
                          {entry.runStatus}
                        </span>
                        {entry.isCurrent && (
                          <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ color: "var(--primary)", background: "var(--primary-muted)" }}>
                            Current selection
                          </span>
                        )}
                      </div>
                      <p className="text-[11px]" style={{ color: "var(--foreground-muted)" }}>
                        {entry.collectedAt ? new Date(entry.collectedAt).toLocaleString() : "—"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px]" style={{ color: "var(--foreground-muted)" }}>
                      <span className="rounded px-2 py-0.5" style={{ background: "var(--muted)" }}>{entry.sourceSystem}</span>
                      <span className="rounded px-2 py-0.5" style={{ background: "var(--muted)" }}>{entry.evidenceType}</span>
                    </div>

                    {entry.error ? (
                      <p className="text-sm" style={{ color: "var(--danger)" }}>{entry.error}</p>
                    ) : (
                      renderReadableFields(entry.content)
                    )}
                  </section>
                ))}
              </div>
            </div>
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
