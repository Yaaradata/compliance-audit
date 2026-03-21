"use client";

import { useState, Fragment } from "react";
import { getRunDetail, deleteRun, type AwsRun, type RunDetail } from "@/lib/aws-api";
import { awsButtonDangerGhostClass, awsIconButtonClass } from "@/components/aws/aws-ui";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { dateStyle: "short" }) + " " + d.toLocaleTimeString(undefined, { timeStyle: "short" });
}

/** Normalize backend response: aws_calls may be list of { collector, apis } or legacy shape. */
function normalizeAwsCalls(d: RunDetail | null): { collector: string; apis: string[] }[] {
  if (!d?.aws_calls) return [];
  const raw = d.aws_calls as unknown;
  if (!Array.isArray(raw)) return [];
  return raw.map((entry: unknown) => {
    const e = entry as Record<string, unknown>;
    const collector = typeof e.collector === "string" ? e.collector : "unknown";
    const apis = Array.isArray(e.apis) ? (e.apis as string[]) : [];
    return { collector, apis };
  });
}

interface AwsRunHistoryProps {
  runs: AwsRun[];
  onRunDeleted?: () => void;
}

export function AwsRunHistory({ runs, onRunDeleted }: AwsRunHistoryProps) {
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [detailByRunId, setDetailByRunId] = useState<Record<string, RunDetail | null>>({});
  const [errorByRunId, setErrorByRunId] = useState<Record<string, string>>({});
  const [loadingRunId, setLoadingRunId] = useState<string | null>(null);
  const [deletingRunId, setDeletingRunId] = useState<string | null>(null);

  const handleDeleteRun = (runId: string) => {
    if (!confirm("Delete this run and all its evidence? This cannot be undone.")) return;
    setDeletingRunId(runId);
    deleteRun(runId)
      .then(() => {
        setExpandedRunId((prev) => (prev === runId ? null : prev));
        setDetailByRunId((prev) => {
          const next = { ...prev };
          delete next[runId];
          return next;
        });
        setErrorByRunId((prev) => {
          const next = { ...prev };
          delete next[runId];
          return next;
        });
        onRunDeleted?.();
      })
      .catch((err: Error) => {
        setErrorByRunId((prev) => ({ ...prev, [runId]: err.message || "Failed to delete run" }));
      })
      .finally(() => setDeletingRunId(null));
  };

  const toggleRun = (runId: string) => {
    if (expandedRunId === runId) {
      setExpandedRunId(null);
      return;
    }
    setExpandedRunId(runId);
    if (detailByRunId[runId] !== undefined && errorByRunId[runId] === undefined) {
      return;
    }
    setLoadingRunId(runId);
    setErrorByRunId((prev) => ({ ...prev, [runId]: "" }));
    getRunDetail(runId)
      .then((data) => {
        setDetailByRunId((prev) => ({ ...prev, [runId]: data }));
        setErrorByRunId((prev) => ({ ...prev, [runId]: "" }));
      })
      .catch((err: Error & { status?: number }) => {
        const msg = err.message || (err.status === 404 ? "Run not found" : "Failed to load run detail");
        setErrorByRunId((prev) => ({ ...prev, [runId]: msg }));
        setDetailByRunId((prev) => ({ ...prev, [runId]: null }));
      })
      .finally(() => setLoadingRunId(null));
  };

  if (!runs?.length) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
          No collector runs yet. Use <strong>Fetch AWS evidence</strong> from the Dashboard to collect data.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b" style={{ borderColor: "var(--border)", background: "var(--muted)" }}>
            <th className="w-10 px-4 py-3" />
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>Date</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>Evidence</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>Trigger</th>
            <th className="w-20 px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {runs.map((r) => (
            <Fragment key={r.run_id}>
              <tr
                className={`border-b last:border-0 transition-colors ${expandedRunId === r.run_id ? "bg-[var(--primary-muted)]/30" : "hover:bg-[var(--muted)]"}`}
                style={{ borderColor: "var(--border)" }}
              >
                <td className="px-4 py-2">
                  <button
                    type="button"
                    className={awsIconButtonClass}
                    onClick={() => toggleRun(r.run_id)}
                    aria-label={expandedRunId === r.run_id ? "Collapse" : "Show details"}
                  >
                    {expandedRunId === r.run_id ? "▼" : "▶"}
                  </button>
                </td>
                <td className="px-4 py-2" style={{ color: "var(--foreground-muted)" }}>
                  {formatDate(r.ended_at ?? r.in_time ?? r.execution_time)}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.status === "success"
                        ? "bg-[var(--success)]/15 text-[var(--success)]"
                        : r.status === "partial"
                          ? "bg-amber-500/15 text-amber-600"
                          : r.status === "failed"
                            ? "bg-[var(--danger)]/15 text-[var(--danger)]"
                            : "bg-[var(--warning)]/15 text-[var(--warning)]"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-2" style={{ color: "var(--foreground)" }}>{r.evidence_count ?? "—"}</td>
                <td className="px-4 py-2" style={{ color: "var(--foreground-muted)" }}>{r.trigger_type || "—"}</td>
                <td className="px-4 py-2">
                  <button
                    type="button"
                    disabled={deletingRunId === r.run_id}
                    onClick={() => handleDeleteRun(r.run_id)}
                    className={awsButtonDangerGhostClass}
                    title="Delete run and its evidence"
                  >
                    {deletingRunId === r.run_id ? "Deleting…" : "Delete"}
                  </button>
                </td>
              </tr>
              {expandedRunId === r.run_id && (
                <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                  <td colSpan={6} className="p-4" style={{ background: "var(--background)" }}>
                    {loadingRunId === r.run_id ? (
                      <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>Loading…</p>
                    ) : errorByRunId[r.run_id] ? (
                      <p className="text-sm" style={{ color: "var(--danger)" }}>{errorByRunId[r.run_id]}</p>
                    ) : (() => {
                      const detail = detailByRunId[r.run_id] ?? null;
                      const errorMsg = detail?.error_message;
                      const awsCalls = normalizeAwsCalls(detail);
                      return (
                        <div className="space-y-3">
                          {errorMsg && (
                            <div className="rounded-lg border p-3" style={{ borderColor: "var(--danger)", background: "var(--danger-muted, rgba(239,68,68,0.08))" }}>
                              <p className="mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--danger)" }}>Collector errors</p>
                              <p className="text-sm" style={{ color: "var(--foreground)" }}>{errorMsg}</p>
                            </div>
                          )}
                          {awsCalls.length > 0 ? (
                            <div>
                              <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>
                                AWS API calls by collector
                              </p>
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {awsCalls.map(({ collector, apis }) => (
                                  <div
                                    key={collector}
                                    className="rounded-lg border p-3"
                                    style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                                  >
                                    <div className="mb-2 font-semibold" style={{ color: "var(--primary)" }}>{collector}</div>
                                    <ul className="list-inside list-disc space-y-0.5 text-xs" style={{ color: "var(--foreground-muted)" }}>
                                      {apis.map((api, i) => (
                                        <li key={i}>
                                          <code style={{ color: "var(--foreground)" }}>{api}</code>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : !errorMsg && (
                            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>No detail available.</p>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
