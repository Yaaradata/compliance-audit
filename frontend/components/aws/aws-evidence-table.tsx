"use client";

import type { AwsEvidenceRow, AwsRun } from "@/lib/aws-api";

interface AwsEvidenceTableProps {
  data: AwsEvidenceRow[];
  runs?: AwsRun[];
  onViewContent: (row: AwsEvidenceRow) => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function formatRunLabel(run: AwsRun | undefined, index: number): string {
  if (!run) return "—";
  const date = run.ended_at ?? run.execution_time;
  if (date) {
    const d = new Date(date);
    const short = d.toLocaleDateString(undefined, { month: "numeric", day: "numeric", year: "2-digit" });
    return `Run ${index + 1} · ${short}`;
  }
  return `Run ${index + 1}`;
}

export function AwsEvidenceTable({ data, runs = [], onViewContent }: AwsEvidenceTableProps) {
  const runById = new Map(runs.map((r, i) => [r.run_id, { run: r, index: i }]));

  const rows = data.map((e) => {
    const runInfo = e.run_id ? runById.get(e.run_id) : undefined;
    return {
      ...e,
      runLabel: runInfo ? formatRunLabel(runInfo.run, runInfo.index) : "—",
      runStatus: runInfo?.run?.status,
    };
  });

  const columns = [
    { key: "item_code", label: "Item", className: "font-medium" },
    { key: "control_id", label: "Control" },
    { key: "source_system", label: "Source" },
    { key: "evidence_type", label: "Evidence type" },
    { key: "runLabel", label: "Run" },
    { key: "collected_at", label: "Collected" },
    { key: "actions", label: "", className: "text-right w-24" },
  ] as const;

  return (
    <div className="card rounded-xl overflow-hidden border flex flex-col min-h-0" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b shrink-0" style={{ borderColor: "var(--border)", background: "var(--muted)" }}>
        <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
          Evidence table
        </h2>
        <span className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>
          {rows.length} row{rows.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="overflow-auto flex-1 min-h-0">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10" style={{ background: "var(--muted)" }}>
            <tr className="border-b" style={{ borderColor: "var(--border)" }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${col.key === "actions" ? "text-right" : ""} ${col.className ?? ""}`}
                  style={{ color: "var(--foreground-muted)" }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr
                key={e.evidence_id}
                className="border-b last:border-0 transition-colors hover:bg-[var(--muted)]/30"
                style={{ borderColor: "var(--border)" }}
              >
                <td className="px-4 py-3 font-medium" style={{ color: "var(--foreground)" }}>
                  {e.item_code}
                </td>
                <td className="px-4 py-3" style={{ color: "var(--foreground)" }}>
                  {e.control_id}
                </td>
                <td className="px-4 py-3" style={{ color: "var(--foreground-muted)" }}>
                  <span className="font-mono text-xs">{e.source_system}</span>
                </td>
                <td className="px-4 py-3" style={{ color: "var(--foreground-muted)" }}>
                  {e.evidence_type || "—"}
                </td>
                <td className="px-4 py-3" style={{ color: "var(--foreground-muted)" }}>
                  <span className="text-xs">{e.runLabel}</span>
                  {e.runStatus && (
                    <span
                      className={`ml-1.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
                        e.runStatus === "success"
                          ? "bg-[var(--success)]/15 text-[var(--success)]"
                          : e.runStatus === "partial"
                            ? "bg-amber-500/15 text-amber-600"
                            : "bg-[var(--danger)]/15 text-[var(--danger)]"
                      }`}
                    >
                      {e.runStatus}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--foreground-muted)" }}>
                  {formatDate(e.collected_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:opacity-90"
                    style={{ borderColor: "var(--border)", color: "var(--primary)" }}
                    onClick={() => onViewContent(e)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
