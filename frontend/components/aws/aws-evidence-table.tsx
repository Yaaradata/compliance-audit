"use client";

import type { AwsEvidenceRow } from "@/lib/aws-api";

interface AwsEvidenceTableProps {
  data: AwsEvidenceRow[];
  onViewContent: (row: AwsEvidenceRow) => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function AwsEvidenceTable({ data, onViewContent }: AwsEvidenceTableProps) {
  if (!data?.length) {
    return (
      <div className="card rounded-xl p-8 text-center">
        <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
          No evidence yet. Fetch AWS evidence from the Dashboard or Control View to collect data.
        </p>
      </div>
    );
  }
  return (
    <div className="card rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--border)", background: "var(--muted)" }}>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>Item</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>Control</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>Source</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>Collected</th>
              <th className="w-20 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }} />
            </tr>
          </thead>
          <tbody>
            {data.map((e) => (
              <tr
                key={e.evidence_id}
                className="border-b last:border-0 transition-colors hover:bg-[var(--muted)]"
                style={{ borderColor: "var(--border)" }}
              >
                <td className="px-4 py-3 font-medium" style={{ color: "var(--foreground)" }}>{e.item_code}</td>
                <td className="px-4 py-3" style={{ color: "var(--foreground)" }}>{e.control_id}</td>
                <td className="px-4 py-3" style={{ color: "var(--foreground-muted)" }}>{e.source_system}</td>
                <td className="px-4 py-3" style={{ color: "var(--foreground-muted)" }}>{formatDate(e.collected_at)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-90"
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
