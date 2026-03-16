"use client";

import { useState, Fragment } from "react";
import { getRunDetail, type AwsRun, type RunDetail } from "@/lib/aws-api";

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
}

export function AwsRunHistory({ runs }: AwsRunHistoryProps) {
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [detailByRunId, setDetailByRunId] = useState<Record<string, RunDetail | null>>({});
  const [errorByRunId, setErrorByRunId] = useState<Record<string, string>>({});
  const [loadingRunId, setLoadingRunId] = useState<string | null>(null);

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
                    className="rounded p-1 transition-colors hover:opacity-80"
                    style={{ color: "var(--foreground-muted)" }}
                    onClick={() => toggleRun(r.run_id)}
                    aria-label={expandedRunId === r.run_id ? "Collapse" : "Show details"}
                  >
                    {expandedRunId === r.run_id ? "▼" : "▶"}
                  </button>
                </td>
                <td className="px-4 py-2" style={{ color: "var(--foreground-muted)" }}>
                  {formatDate(r.in_time ?? r.execution_time)}
                </td>
                <td className="px-4 py-2">
                  <span className="font-medium" style={{ color: r.status === "success" ? "var(--success)" : r.status === "failed" ? "var(--danger)" : "var(--warning)" }}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-2" style={{ color: "var(--foreground)" }}>{r.evidence_count ?? "—"}</td>
                <td className="px-4 py-2" style={{ color: "var(--foreground-muted)" }}>{r.trigger_type || "—"}</td>
              </tr>
              {expandedRunId === r.run_id && (
                <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                  <td colSpan={5} className="p-4" style={{ background: "var(--background)" }}>
                    {loadingRunId === r.run_id ? (
                      <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>Loading…</p>
                    ) : errorByRunId[r.run_id] ? (
                      <p className="text-sm" style={{ color: "var(--danger)" }}>{errorByRunId[r.run_id]}</p>
                    ) : (() => {
                      const awsCalls = normalizeAwsCalls(detailByRunId[r.run_id] ?? null);
                      return awsCalls.length > 0 ? (
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
                      ) : (
                        <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>No detail available.</p>
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
