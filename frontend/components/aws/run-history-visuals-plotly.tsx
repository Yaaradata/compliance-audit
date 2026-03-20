"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { getEvidenceContent, type AwsEvidenceRow, type AwsRun } from "@/lib/aws-api";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusColor(status: string | null | undefined): string {
  if (status === "success") return "#16a34a";
  if (status === "partial") return "#d97706";
  if (status === "failed") return "#dc2626";
  return "#64748b";
}

type CompareCell = {
  runId: string;
  runLabel: string;
  status: string;
  collectedAt: string | null;
  values: Record<string, string>;
};

type ControlComparison = {
  controlKey: string;
  label: string;
  rows: Array<{ feature: string; valuesByRun: Record<string, string>; diff: boolean; group: string }>;
};

type DomainComparison = {
  domain: string;
  controls: ControlComparison[];
};

function normalizeValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map((v) => normalizeValue(v)).join(", ");
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function flattenContent(content: unknown, prefix = "", out: Record<string, string> = {}, depth = 0): Record<string, string> {
  if (depth > 5) {
    out[prefix || "value"] = normalizeValue(content);
    return out;
  }

  if (content === null || content === undefined) {
    out[prefix || "value"] = "—";
    return out;
  }

  if (typeof content !== "object") {
    out[prefix || "value"] = normalizeValue(content);
    return out;
  }

  if (Array.isArray(content)) {
    if (content.length === 0) {
      out[prefix || "value"] = "[]";
      return out;
    }

    const allPrimitive = content.every((item) => item === null || item === undefined || typeof item !== "object");
    if (allPrimitive) {
      out[prefix || "value"] = content.map((item) => normalizeValue(item)).join(", ");
      return out;
    }

    content.forEach((item, idx) => {
      const nextPrefix = `${prefix || "value"}[${idx}]`;
      flattenContent(item, nextPrefix, out, depth + 1);
    });
    return out;
  }

  const obj = content as Record<string, unknown>;
  const entries = Object.entries(obj);
  if (!entries.length) {
    out[prefix || "value"] = "{}";
    return out;
  }

  for (const [k, v] of entries) {
    const nextKey = prefix ? `${prefix}.${k}` : k;
    flattenContent(v, nextKey, out, depth + 1);
  }
  return out;
}

function cleanFeatureLabel(feature: string): string {
  return feature.replace(/\[\d+\]/g, "").replace(/\.\./g, ".").replace(/\.$/, "");
}

export function RunHistoryVisualsPlotly({ runs, evidenceRows }: { runs: AwsRun[]; evidenceRows: AwsEvidenceRow[] }) {
  const [activeSidebar, setActiveSidebar] = useState<"metrics" | "comparisor">("metrics");
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [compareMeta, setCompareMeta] = useState<{ runs: CompareCell[] } | null>(null);
  const [domainComparisons, setDomainComparisons] = useState<DomainComparison[]>([]);
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set(["A", "B", "C"]));
  const [expandedControls, setExpandedControls] = useState<Set<string>>(new Set());
  const [hasPreloadedComparisor, setHasPreloadedComparisor] = useState(false);

  if (!runs.length) {
    return (
      <div className="card rounded-xl border p-6 text-sm" style={{ borderColor: "var(--border)", color: "var(--foreground-muted)" }}>
        No run history available yet.
      </div>
    );
  }

  const timeline = [...runs]
    .slice()
    .reverse()
    .map((run, index) => ({
      index: index + 1,
      runId: run.run_id,
      time: run.ended_at ?? run.in_time ?? run.execution_time,
      evidence: run.evidence_count ?? 0,
      status: run.status ?? "unknown",
      trigger: (run.trigger_type ?? "unknown").toLowerCase(),
    }));

  const successCount = timeline.filter((r) => r.status === "success").length;
  const partialCount = timeline.filter((r) => r.status === "partial").length;
  const failedCount = timeline.filter((r) => r.status === "failed").length;
  const otherCount = timeline.length - successCount - partialCount - failedCount;

  const monthlyRuns = new Map<string, number>();
  for (const row of timeline) {
    const d = row.time ? new Date(row.time) : null;
    const key = d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "Unknown";
    monthlyRuns.set(key, (monthlyRuns.get(key) ?? 0) + 1);
  }
  const monthWiseData = Array.from(monthlyRuns.entries()).map(([month, count]) => ({ month, count }));

  const totalEvidence = timeline.reduce((acc, row) => acc + row.evidence, 0);
  const avgEvidence = Math.round(totalEvidence / Math.max(1, timeline.length));
  const runLabelMap = useMemo(() => new Map(runs.map((r, i) => [r.run_id, `Run ${i + 1}`])), [runs]);

  const controlOptions = useMemo(() => {
    const map = new Map<string, { controlId: string; itemCode: string }>();
    for (const row of evidenceRows) {
      const d = (row.item_code || "").trim().charAt(0).toUpperCase();
      if (!/[A-H]/.test(d)) continue;
      const key = `${row.control_id}::${row.item_code}`;
      if (!map.has(key)) map.set(key, { controlId: row.control_id, itemCode: row.item_code });
    }
    return Array.from(map.entries())
      .map(([key, v]) => ({ key, ...v }))
      .sort((a, b) => a.itemCode.localeCompare(b.itemCode) || a.controlId.localeCompare(b.controlId));
  }, [evidenceRows]);

  const buildRowsForControl = useCallback(async (controlKey: string) => {
    const [controlId, itemCode] = controlKey.split("::");
    const byRun = new Map<string, AwsEvidenceRow[]>();
    for (const row of evidenceRows) {
      if (row.control_id !== controlId || row.item_code !== itemCode) continue;
      if (!row.run_id) continue;
      const list = byRun.get(row.run_id) ?? [];
      list.push(row);
      byRun.set(row.run_id, list);
    }
    const pickLatest = (runId: string): AwsEvidenceRow | null => {
      const list = byRun.get(runId) ?? [];
      if (!list.length) return null;
      return [...list].sort((a, b) => {
        const at = a.collected_at ? new Date(a.collected_at).getTime() : 0;
        const bt = b.collected_at ? new Date(b.collected_at).getTime() : 0;
        return bt - at;
      })[0];
    };

    const comparableRuns = runs
      .map((run) => ({ run, evidence: pickLatest(run.run_id) }))
      .filter((x): x is { run: AwsRun; evidence: AwsEvidenceRow } => Boolean(x.evidence));
    if (!comparableRuns.length) return null;

    const contentList = await Promise.all(
      comparableRuns.map(async ({ run, evidence }) => {
        const content = await getEvidenceContent(evidence.evidence_id);
        return { run, evidence, values: flattenContent(content) };
      })
    );
    const featureKeys = Array.from(new Set(contentList.flatMap((x) => Object.keys(x.values)))).sort();
      const rows = featureKeys.map((feature) => {
      const valuesByRun: Record<string, string> = {};
      for (const row of contentList) valuesByRun[row.run.run_id] = row.values[feature] ?? "—";
      const diff = new Set(Object.values(valuesByRun)).size > 1;
        const cleanedFeature = cleanFeatureLabel(feature);
        const group = cleanedFeature.includes(".") ? cleanedFeature.split(".")[0].toLowerCase() : "general";
      return { feature, valuesByRun, diff, group };
    });
    return {
      runsMeta: contentList.map((x) => ({
        runId: x.run.run_id,
        runLabel: runLabelMap.get(x.run.run_id) ?? "Run —",
        status: x.run.status ?? "unknown",
        collectedAt: x.evidence.collected_at,
        values: x.values,
      })),
      rows,
    };
  }, [evidenceRows, runs, runLabelMap]);

  const compareRuns = useCallback(async () => {
    if (!controlOptions.length) return;
    setCompareError(null);
    setCompareLoading(true);
    try {
      const domainMap = new Map<string, ControlComparison[]>();
      let sharedRunsMeta: CompareCell[] | null = null;

      const results = await Promise.all(
        controlOptions.map(async (c) => {
          const result = await buildRowsForControl(c.key);
          return { c, result };
        })
      );

      for (const { c, result } of results) {
        if (!result) continue;
        const domain = (c.itemCode || "").trim().charAt(0).toUpperCase();
        if (!sharedRunsMeta) sharedRunsMeta = result.runsMeta;
        const list = domainMap.get(domain) ?? [];
        list.push({
          controlKey: c.key,
          label: `${c.itemCode} · Control ${c.controlId}`,
          rows: result.rows,
        });
        domainMap.set(domain, list);
      }

      if (!domainMap.size) {
        setCompareError("No comparable run values available.");
        setDomainComparisons([]);
        setCompareMeta(null);
        return;
      }

      const domains: DomainComparison[] = Array.from(domainMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([domain, controls]) => ({
          domain,
          controls: controls.sort((a, b) => a.label.localeCompare(b.label)),
        }));
      setDomainComparisons(domains);
      setCompareMeta({ runs: sharedRunsMeta ?? [] });
      setExpandedDomains(new Set(domains.map((d) => d.domain)));
      if (domains.length) {
        const firstPerDomain = new Set(domains.map((d) => d.controls[0]?.controlKey).filter(Boolean) as string[]);
        setExpandedControls(firstPerDomain);
      }
      setHasPreloadedComparisor(true);
    } catch (e) {
      setCompareError(e instanceof Error ? e.message : "Failed to build domain-wise comparison.");
    } finally {
      setCompareLoading(false);
    }
  }, [controlOptions, buildRowsForControl]);

  useEffect(() => {
    if (!hasPreloadedComparisor && controlOptions.length && !compareLoading) {
      compareRuns();
    }
  }, [hasPreloadedComparisor, controlOptions.length, compareLoading, compareRuns]);

  useEffect(() => {
    if (activeSidebar === "comparisor" && !hasPreloadedComparisor) {
      compareRuns();
    }
  }, [activeSidebar, hasPreloadedComparisor, compareRuns]);

  const toggleDomain = (domain: string) => {
    setExpandedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  };

  const toggleControl = (controlKey: string) => {
    setExpandedControls((prev) => {
      const next = new Set(prev);
      if (next.has(controlKey)) next.delete(controlKey);
      else next.add(controlKey);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="card rounded-xl border p-2" style={{ borderColor: "var(--border)" }}>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSidebar("metrics")}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
              activeSidebar === "metrics"
                ? "border-[var(--primary)] bg-[var(--primary-muted)] text-[var(--primary)]"
                : "hover:bg-[var(--muted)]/40"
            }`}
            style={activeSidebar === "metrics" ? undefined : { borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            Run History Metrics
          </button>
          <button
            type="button"
            onClick={() => setActiveSidebar("comparisor")}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
              activeSidebar === "comparisor"
                ? "border-[var(--primary)] bg-[var(--primary-muted)] text-[var(--primary)]"
                : "hover:bg-[var(--muted)]/40"
            }`}
            style={activeSidebar === "comparisor" ? undefined : { borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            Run Comparisor
          </button>
        </div>
      </div>

      {activeSidebar === "metrics" ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="card rounded-xl border p-5 xl:col-span-3" style={{ borderColor: "var(--border)" }}>
        <h3 className="text-base font-semibold mb-3" style={{ color: "var(--foreground)" }}>Status split</h3>
        <Plot
          data={[
            {
              type: "pie",
              values: [successCount, partialCount, failedCount, otherCount],
              labels: ["Success", "Partial", "Failed", "Other"],
              hole: 0.52,
              marker: { colors: ["#16a34a", "#d97706", "#dc2626", "#64748b"] },
              textinfo: "label+percent",
              hovertemplate: "%{label}: %{value}<extra></extra>",
            },
          ]}
          layout={{
            height: 280,
            margin: { l: 10, r: 10, t: 10, b: 10 },
            showlegend: false,
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            font: { color: "#0f172a", size: 12 },
          }}
          config={{ displayModeBar: false, responsive: true }}
          style={{ width: "100%" }}
        />
          </div>

          <div className="card rounded-xl border p-5 xl:col-span-6" style={{ borderColor: "var(--border)" }}>
        <h3 className="text-base font-semibold mb-3" style={{ color: "var(--foreground)" }}>Evidence trend by run</h3>
        <Plot
          data={[
            {
              type: "scatter",
              mode: "lines+markers",
              x: timeline.map((r) => `Run ${r.index}`),
              y: timeline.map((r) => r.evidence),
              line: { color: "#2563eb", width: 3 },
              marker: {
                size: 9,
                color: timeline.map((r) => statusColor(r.status)),
                line: { color: "#ffffff", width: 1 },
              },
              text: timeline.map((r) => `${formatDateTime(r.time)} · ${r.trigger}`),
              hovertemplate: "%{x}<br>Evidence: %{y}<br>%{text}<extra></extra>",
            },
          ]}
          layout={{
            height: 280,
            margin: { l: 40, r: 20, t: 10, b: 40 },
            xaxis: { title: "Run sequence" },
            yaxis: { title: "Evidence count", rangemode: "tozero" },
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            font: { color: "#0f172a", size: 12 },
          }}
          config={{ displayModeBar: false, responsive: true }}
          style={{ width: "100%" }}
        />
          </div>

          <div className="card rounded-xl border p-5 xl:col-span-3" style={{ borderColor: "var(--border)" }}>
        <h3 className="text-base font-semibold mb-3" style={{ color: "var(--foreground)" }}>Snapshot</h3>
        <div className="space-y-3">
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>Total runs</p>
            <p className="text-2xl font-semibold" style={{ color: "var(--foreground)" }}>{timeline.length}</p>
          </div>
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>Total evidence</p>
            <p className="text-2xl font-semibold" style={{ color: "var(--foreground)" }}>{totalEvidence}</p>
          </div>
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>Average per run</p>
            <p className="text-2xl font-semibold" style={{ color: "var(--foreground)" }}>{avgEvidence}</p>
          </div>
        </div>
          </div>

          <div className="card rounded-xl border p-5 xl:col-span-4" style={{ borderColor: "var(--border)" }}>
        <h3 className="text-base font-semibold mb-3" style={{ color: "var(--foreground)" }}>Month-wise runs</h3>
        <Plot
          data={[
            {
              type: "bar",
              x: monthWiseData.map((d) => d.month),
              y: monthWiseData.map((d) => d.count),
              marker: { color: "#0ea5e9" },
              hovertemplate: "%{x}: %{y} run(s)<extra></extra>",
            },
          ]}
          layout={{
            height: 300,
            margin: { l: 50, r: 20, t: 10, b: 50 },
            xaxis: { title: "Month", automargin: true },
            yaxis: { title: "Runs", rangemode: "tozero" },
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            font: { color: "#0f172a", size: 12 },
          }}
          config={{ displayModeBar: false, responsive: true }}
          style={{ width: "100%" }}
        />
          </div>

          <div className="card rounded-xl border p-5 xl:col-span-8" style={{ borderColor: "var(--border)" }}>
        <h3 className="text-base font-semibold mb-4" style={{ color: "var(--foreground)" }}>Run timeline</h3>
        <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
          {[...runs].map((run, idx) => {
            const time = run.ended_at ?? run.in_time ?? run.execution_time;
            return (
              <div key={run.run_id} className="grid grid-cols-[22px_1fr] gap-3">
                <div className="relative flex justify-center pt-1">
                  <span className="h-3 w-3 rounded-full z-10" style={{ background: statusColor(run.status) }} />
                  {idx < runs.length - 1 && (
                    <span className="absolute top-4 bottom-[-14px] w-px" style={{ background: "var(--border)" }} />
                  )}
                </div>
                <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                      {formatDateTime(time)}
                    </p>
                    <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize" style={{ background: `${statusColor(run.status)}22`, color: statusColor(run.status) }}>
                      {run.status ?? "unknown"}
                    </span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>
                    Evidence collected: <strong style={{ color: "var(--foreground)" }}>{run.evidence_count ?? 0}</strong> · Trigger:{" "}
                    <span className="capitalize">{run.trigger_type ?? "unknown"}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
          </div>
        </div>
      ) : (
        <div className="card rounded-xl border p-4" style={{ borderColor: "var(--border)" }}>
          <h3 className="text-base font-semibold mb-3" style={{ color: "var(--foreground)" }}>Run Comparisor</h3>
          <p className="text-sm mb-3" style={{ color: "var(--foreground-muted)" }}>
            Domain-wise comparison is shown by default across available runs.
          </p>
          <div className="flex justify-end mb-3">
            <button
              type="button"
              onClick={compareRuns}
              disabled={compareLoading}
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
              style={{ background: "var(--primary)", color: "var(--primary-foreground, #fff)" }}
            >
              {compareLoading ? "Comparing..." : "Compare"}
            </button>
          </div>
          <div className="overflow-auto">
            {compareError ? (
              <p className="text-sm" style={{ color: "var(--danger)" }}>{compareError}</p>
            ) : domainComparisons.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                Loading comparison...
              </p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--border)" }}>
                    <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>Feature set</p>
                    <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                      {domainComparisons.reduce((acc, d) => acc + d.controls.reduce((n, c) => n + c.rows.length, 0), 0)} comparable fields
                    </p>
                  </div>
                  <div className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--border)" }}>
                    <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>Compared runs</p>
                    <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{compareMeta?.runs?.length ?? 0}</p>
                  </div>
                </div>
                {domainComparisons.map((domainBlock) => (
                  <div key={domainBlock.domain} className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
                    <button
                      type="button"
                      onClick={() => toggleDomain(domainBlock.domain)}
                      className="w-full px-3 py-2.5 flex items-center justify-between text-left"
                      style={{ background: "var(--muted)" }}
                    >
                      <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{`Domain ${domainBlock.domain}`}</span>
                      <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                        {expandedDomains.has(domainBlock.domain) ? "▾" : "▸"}
                      </span>
                    </button>
                    {expandedDomains.has(domainBlock.domain) && (
                      <div className="p-2 space-y-2">
                        {domainBlock.controls.map((ctrl) => (
                          <div key={ctrl.controlKey} className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
                            <button
                              type="button"
                              onClick={() => toggleControl(ctrl.controlKey)}
                              className="w-full px-3 py-2 flex items-center justify-between text-left"
                              style={{ background: "var(--card)" }}
                            >
                              <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{ctrl.label}</span>
                              <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                                {expandedControls.has(ctrl.controlKey) ? "▾" : "▸"}
                              </span>
                            </button>
                            {expandedControls.has(ctrl.controlKey) && (
                              <div className="overflow-auto">
                                <table className="w-full border-collapse text-sm">
                                  <thead style={{ background: "var(--muted)" }}>
                                    <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>Feature</th>
                                      {(compareMeta?.runs ?? []).map((r) => (
                                        <th key={r.runId} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>
                                          {r.runLabel}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {ctrl.rows.map((row) => (
                                      <tr key={`${ctrl.controlKey}-${row.feature}`} className="border-b last:border-0" style={{ borderColor: "var(--border)", background: row.diff ? "rgba(245, 158, 11, 0.08)" : "transparent" }}>
                                        <td className="px-3 py-2 font-medium" style={{ color: "var(--foreground)" }}>{cleanFeatureLabel(row.feature)}</td>
                                        {(compareMeta?.runs ?? []).map((r) => (
                                          <td key={`${ctrl.controlKey}-${row.feature}-${r.runId}`} className="px-3 py-2" style={{ color: "var(--foreground)" }}>
                                            {row.valuesByRun[r.runId] ?? "—"}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

