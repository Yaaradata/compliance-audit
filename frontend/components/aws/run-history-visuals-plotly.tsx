"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { getEvidenceContent, type AwsEvidenceRow, type AwsRun } from "@/lib/aws-api";
import { useAuth } from "@/lib/auth-context";
import {
  awsAccordionTriggerClass,
  awsButtonSecondarySmClass,
  awsFieldClass,
  awsPillTabButtonClass,
  awsPillTabListClass,
  awsRowExpandButtonClass,
} from "@/components/aws/aws-ui";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Matches labels used for month-wise run counts (must match aggregation keys). */
function monthLabelFromDate(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
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

/** Split flat dotted keys into top-level groups (e.g. internet_gateways.*) vs leaf rows (account_id). */
function partitionFeatureRows(
  rows: Array<{ feature: string; valuesByRun: Record<string, string>; diff: boolean; group: string }>
): {
  flat: typeof rows;
  groups: Array<{ parent: string; children: Array<{ row: (typeof rows)[number]; childLabel: string }> }>;
} {
  const flat: typeof rows = [];
  const groupMap = new Map<string, Array<{ row: (typeof rows)[number]; childLabel: string }>>();
  const sorted = [...rows].sort((a, b) =>
    cleanFeatureLabel(a.feature).localeCompare(cleanFeatureLabel(b.feature))
  );
  for (const row of sorted) {
    const cleaned = cleanFeatureLabel(row.feature);
    const dot = cleaned.indexOf(".");
    if (dot === -1) {
      flat.push(row);
    } else {
      const parent = cleaned.slice(0, dot);
      const childLabel = cleaned.slice(dot + 1);
      const list = groupMap.get(parent) ?? [];
      list.push({ row, childLabel });
      groupMap.set(parent, list);
    }
  }
  const groups = Array.from(groupMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([parent, children]) => ({ parent, children }));
  return { flat, groups };
}

function filterRowsByComparisorSearch(
  rows: ControlComparison["rows"],
  runIds: string[],
  keyword: string
): ControlComparison["rows"] {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return rows;
  return rows.filter((row) => {
    if (cleanFeatureLabel(row.feature).toLowerCase().includes(kw)) return true;
    if (runIds.some((id) => (row.valuesByRun[id] ?? "").toLowerCase().includes(kw))) return true;
    return false;
  });
}

/** Distinct pill colors for control buttons within an item-code row. */
const CONTROL_BUTTON_COLORS = [
  "#2563eb",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

function getControlIdFromKey(controlKey: string): string {
  return controlKey.split("::")[0] ?? "";
}

function getItemCodeFromKey(controlKey: string): string {
  return controlKey.split("::")[1] ?? "";
}

/** Group controls by item code (e.g. A1, A2); sort controls by control id. */
function groupControlsByItemCode(controls: ControlComparison[]): [string, ControlComparison[]][] {
  const map = new Map<string, ControlComparison[]>();
  for (const c of controls) {
    const itemCode = getItemCodeFromKey(c.controlKey);
    const list = map.get(itemCode) ?? [];
    list.push(c);
    map.set(itemCode, list);
  }
  for (const [, list] of map) {
    list.sort((a, b) =>
      getControlIdFromKey(a.controlKey).localeCompare(getControlIdFromKey(b.controlKey), undefined, {
        numeric: true,
      })
    );
  }
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

export function RunHistoryVisualsPlotly({
  runs,
  evidenceRows,
  focusComparisorControlKey = null,
  deferredCharts = false,
}: {
  runs: AwsRun[];
  evidenceRows: AwsEvidenceRow[];
  /** When set, switch to Run Comparisor and select this control (`control_id::item_code`). */
  focusComparisorControlKey?: string | null;
  /** When true (e.g. Evidence tab visible), skip Plotly charts but still preload Run Comparisor in the background. */
  deferredCharts?: boolean;
}) {
  const { activeCycleId } = useAuth();
  const [activeSidebar, setActiveSidebar] = useState<"metrics" | "comparisor">(() =>
    focusComparisorControlKey ? "comparisor" : "metrics"
  );
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [compareMeta, setCompareMeta] = useState<{ runs: CompareCell[] } | null>(null);
  const [domainComparisons, setDomainComparisons] = useState<DomainComparison[]>([]);
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set(["A", "B", "C"]));
  /** `${domain}::${itemCode}` → selected controlKey for Run Comparisor table. */
  const [itemControlSelection, setItemControlSelection] = useState<Map<string, string>>(new Map());
  const [hasPreloadedComparisor, setHasPreloadedComparisor] = useState(false);
  /** Collapsed = children hidden. Empty set = all parent groups expanded by default. */
  const [collapsedFeatureParents, setCollapsedFeatureParents] = useState<Set<string>>(new Set());
  /** `${domain}::${itemCode}` → Run Comparisor search text. */
  const [comparisorSearchByTable, setComparisorSearchByTable] = useState<Record<string, string>>({});

  const toggleFeatureParent = (controlKey: string, parent: string) => {
    const key = `${controlKey}::${parent}`;
    setCollapsedFeatureParents((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isFeatureParentExpanded = (controlKey: string, parent: string) =>
    !collapsedFeatureParents.has(`${controlKey}::${parent}`);

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
    if (!d || Number.isNaN(d.getTime())) continue;
    const key = monthLabelFromDate(d);
    monthlyRuns.set(key, (monthlyRuns.get(key) ?? 0) + 1);
  }

  const runDates = timeline
    .map((r) => r.time)
    .filter((t): t is string => Boolean(t))
    .map((t) => new Date(t))
    .filter((d) => !Number.isNaN(d.getTime()));
  const latestRunMs = runDates.length ? Math.max(...runDates.map((d) => d.getTime())) : Date.now();
  const nowMs = Date.now();
  const endMs = Math.max(latestRunMs, nowMs);
  /** Calendar year for Jan–Dec month-wise chart (latest activity or today). */
  const monthWiseYear = new Date(endMs).getFullYear();

  const monthWiseData: { month: string; count: number; hoverLabel: string }[] = [];
  for (let month = 0; month < 12; month++) {
    const d = new Date(monthWiseYear, month, 1);
    const monthKey = monthLabelFromDate(d);
    const shortMonth = d.toLocaleDateString(undefined, { month: "short" });
    monthWiseData.push({
      month: shortMonth,
      hoverLabel: monthKey,
      count: monthlyRuns.get(monthKey) ?? 0,
    });
  }

  const monthWiseMaxCount = Math.max(0, ...monthWiseData.map((d) => d.count));

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
        const content = await getEvidenceContent(evidence.evidence_id, activeCycleId);
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
  }, [evidenceRows, runs, runLabelMap, activeCycleId]);

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
      setItemControlSelection((prev) => {
        const next = new Map(prev);
        for (const d of domains) {
          for (const [itemCode, ctrls] of groupControlsByItemCode(d.controls)) {
            const k = `${d.domain}::${itemCode}`;
            if (!next.has(k) && ctrls[0]) next.set(k, ctrls[0].controlKey);
          }
        }
        return next;
      });
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
    if (focusComparisorControlKey) setActiveSidebar("comparisor");
  }, [focusComparisorControlKey]);

  useEffect(() => {
    if (!focusComparisorControlKey || !domainComparisons.length) return;
    const sep = focusComparisorControlKey.indexOf("::");
    if (sep === -1) return;
    const itemCode = focusComparisorControlKey.slice(sep + 2);
    const domain = (itemCode || "").trim().charAt(0).toUpperCase();
    if (!/[A-H]/.test(domain)) return;
    const exists = domainComparisons.some(
      (d) =>
        d.domain === domain && d.controls.some((c) => c.controlKey === focusComparisorControlKey)
    );
    if (!exists) return;
    setItemControlSelection((prev) => new Map(prev).set(`${domain}::${itemCode}`, focusComparisorControlKey));
    setExpandedDomains((prev) => new Set(prev).add(domain));
    setActiveSidebar("comparisor");
  }, [focusComparisorControlKey, domainComparisons]);

  const toggleDomain = (domain: string) => {
    setExpandedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  };

  const selectControlForItem = (domain: string, itemCode: string, controlKey: string) => {
    setItemControlSelection((prev) => new Map(prev).set(`${domain}::${itemCode}`, controlKey));
  };

  const getSelectedControlKey = (domain: string, itemCode: string, ctrls: ControlComparison[]) => {
    const k = `${domain}::${itemCode}`;
    const sel = itemControlSelection.get(k);
    if (sel && ctrls.some((c) => c.controlKey === sel)) return sel;
    return ctrls[0]?.controlKey ?? "";
  };

  return (
    <div className="space-y-4">
      <div className="card rounded-xl border px-3 py-3 sm:px-4" style={{ borderColor: "var(--border)" }}>
        <div className="flex justify-center">
          <div className={awsPillTabListClass} role="tablist" aria-label="Run history view">
            <button
              type="button"
              role="tab"
              aria-selected={activeSidebar === "metrics"}
              onClick={() => setActiveSidebar("metrics")}
              title="Run History Metrics — charts and KPIs per run"
              className={`${awsPillTabButtonClass} ${
                activeSidebar === "metrics" ? "text-[var(--foreground)]" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
              style={
                activeSidebar === "metrics"
                  ? { background: "var(--card)", boxShadow: "0 1px 4px rgba(15, 23, 42, 0.1)" }
                  : undefined
              }
            >
              <span className="truncate">Metrics</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeSidebar === "comparisor"}
              onClick={() => setActiveSidebar("comparisor")}
              title="Run Comparisor — domain-wise comparison across runs"
              className={`${awsPillTabButtonClass} ${
                activeSidebar === "comparisor" ? "text-[var(--foreground)]" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
              style={
                activeSidebar === "comparisor"
                  ? { background: "var(--card)", boxShadow: "0 1px 4px rgba(15, 23, 42, 0.1)" }
                  : undefined
              }
            >
              <span className="truncate">Comparisor</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            Run history insights
          </span>
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{ background: "var(--muted)", color: "var(--foreground-muted)" }}
          >
            {runs.length} run{runs.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {activeSidebar === "metrics" ? (
        deferredCharts ? (
          <div
            className="card rounded-xl border p-6 text-sm"
            style={{ borderColor: "var(--border)", color: "var(--foreground-muted)" }}
          >
            <p style={{ color: "var(--foreground)" }}>
              Charts and timeline appear when you open <strong>Run Details</strong> above.
            </p>
            <p className="mt-2 text-xs">
              {compareLoading
                ? "Run Comparisor is preparing…"
                : hasPreloadedComparisor
                  ? "Run Comparisor is ready — open Run Details and switch to the Comparisor tab."
                  : "Run Comparisor will load when comparable evidence is available."}
            </p>
          </div>
        ) : (
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
            xaxis: { title: { text: "Run sequence" } },
            yaxis: { title: { text: "Evidence count" }, rangemode: "tozero" },
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

          <div className="card rounded-xl border p-5 xl:col-span-6" style={{ borderColor: "var(--border)" }}>
        <h3 className="text-base font-semibold mb-1" style={{ color: "var(--foreground)" }}>Month-wise runs</h3>
        <p className="text-xs mb-3" style={{ color: "var(--foreground-muted)" }}>
          Jan–Dec {monthWiseYear}
        </p>
        <Plot
          data={[
            {
              type: "bar",
              x: monthWiseData.map((d) => d.month),
              y: monthWiseData.map((d) => d.count),
              text: monthWiseData.map((d) => d.hoverLabel),
              marker: { color: "#0ea5e9" },
              hovertemplate: "%{text}<br>%{y} run(s)<extra></extra>",
            },
          ]}
          layout={{
            height: 300,
            margin: { l: 50, r: 20, t: 10, b: 55 },
            xaxis: {
              title: { text: "Month" },
              automargin: true,
              tickangle: 0,
              categoryorder: "array",
              categoryarray: monthWiseData.map((d) => d.month),
            },
            yaxis:
              monthWiseMaxCount === 0
                ? {
                    title: { text: "Runs" },
                    rangemode: "tozero",
                    range: [0, 1],
                    tickmode: "linear",
                    tick0: 0,
                    dtick: 1,
                    tickformat: "d",
                  }
                : monthWiseMaxCount <= 30
                  ? {
                      title: { text: "Runs" },
                      rangemode: "tozero",
                      tickmode: "linear",
                      tick0: 1,
                      dtick: 1,
                      tickformat: "d",
                    }
                  : {
                      title: { text: "Runs" },
                      rangemode: "tozero",
                      tickformat: "d",
                      nticks: 8,
                    },
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            font: { color: "#0f172a", size: 12 },
          }}
          config={{ displayModeBar: false, responsive: true }}
          style={{ width: "100%" }}
        />
          </div>

          <div className="card rounded-xl border p-5 xl:col-span-6" style={{ borderColor: "var(--border)" }}>
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
        )
      ) : (
        <>
          {compareError ? (
            <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)" }}>
              <p className="text-sm mb-2" style={{ color: "var(--danger)" }}>{compareError}</p>
              <button
                type="button"
                onClick={compareRuns}
                disabled={compareLoading}
                className={awsButtonSecondarySmClass}
              >
                {compareLoading ? "Retrying…" : "Retry"}
              </button>
            </div>
          ) : domainComparisons.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
              {compareLoading ? "Comparing…" : "Loading comparison…"}
            </p>
          ) : (
            <div className="space-y-3 overflow-auto">
              {domainComparisons.map((domainBlock) => (
                  <div key={domainBlock.domain} className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
                    <button
                      type="button"
                      onClick={() => toggleDomain(domainBlock.domain)}
                      className={awsAccordionTriggerClass}
                      style={{ background: "var(--muted)" }}
                    >
                      <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{`Domain ${domainBlock.domain}`}</span>
                      <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                        {expandedDomains.has(domainBlock.domain) ? "▾" : "▸"}
                      </span>
                    </button>
                    {expandedDomains.has(domainBlock.domain) && (
                      <div className="p-2 space-y-3">
                        {groupControlsByItemCode(domainBlock.controls).map(([itemCode, ctrls]) => {
                          const selectedKey = getSelectedControlKey(domainBlock.domain, itemCode, ctrls);
                          const ctrl = ctrls.find((c) => c.controlKey === selectedKey) ?? ctrls[0];
                          if (!ctrl) return null;
                          return (
                            <div key={`${domainBlock.domain}-${itemCode}`} className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
                              <div
                                className="flex flex-wrap items-center gap-2 px-3 py-2.5"
                                style={{ background: "var(--card)" }}
                              >
                                <span
                                  className="inline-flex min-w-[2.25rem] shrink-0 items-center justify-center rounded-md px-2 py-1 text-sm font-bold tabular-nums"
                                  style={{ background: "var(--muted)", color: "var(--foreground)" }}
                                  title="Item code"
                                >
                                  {itemCode}
                                </span>
                                <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                                  {ctrls.map((c, idx) => {
                                    const cid = getControlIdFromKey(c.controlKey);
                                    const color = CONTROL_BUTTON_COLORS[idx % CONTROL_BUTTON_COLORS.length];
                                    const selected = c.controlKey === selectedKey;
                                    return (
                                      <button
                                        key={c.controlKey}
                                        type="button"
                                        onClick={() => selectControlForItem(domainBlock.domain, itemCode, c.controlKey)}
                                        className="inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                                        style={{
                                          background: color,
                                          color: "#fff",
                                          opacity: selected ? 1 : 0.55,
                                          boxShadow: selected ? `0 0 0 2px ${color}` : undefined,
                                          filter: selected ? "none" : "brightness(0.95)",
                                        }}
                                        title={c.label}
                                      >
                                        Control {cid}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                              {(() => {
                                const tableKey = `${domainBlock.domain}::${itemCode}`;
                                const keyword = comparisorSearchByTable[tableKey] ?? "";
                                const metaRuns = compareMeta?.runs ?? [];
                                const runIds = metaRuns.map((r) => r.runId);
                                const filteredRows = filterRowsByComparisorSearch(ctrl.rows, runIds, keyword);
                                const runCount = metaRuns.length;

                                return (
                                  <>
                                    <div
                                      className="border-t px-3 py-2.5"
                                      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                                    >
                                      <label className="flex max-w-xl flex-col gap-1">
                                        <span className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>
                                          Search
                                        </span>
                                        <input
                                          type="search"
                                          value={keyword}
                                          onChange={(e) =>
                                            setComparisorSearchByTable((prev) => ({
                                              ...prev,
                                              [tableKey]: e.target.value,
                                            }))
                                          }
                                          placeholder="Filter by feature or cell value…"
                                          className={awsFieldClass}
                                          autoComplete="off"
                                        />
                                      </label>
                                    </div>
                                    <div className="overflow-auto border-t" style={{ borderColor: "var(--border)" }}>
                                      <table className="w-full border-collapse text-sm">
                                        <thead style={{ background: "var(--muted)" }}>
                                          <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                                            <th
                                              className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider"
                                              style={{ color: "var(--foreground-muted)" }}
                                            >
                                              Feature
                                            </th>
                                            {metaRuns.map((r) => (
                                              <th
                                                key={r.runId}
                                                className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider"
                                                style={{ color: "var(--foreground-muted)" }}
                                              >
                                                {r.runLabel}
                                              </th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {(() => {
                                            const { flat, groups } = partitionFeatureRows(filteredRows);
                                            const noRows = flat.length === 0 && groups.length === 0;
                                            if (noRows) {
                                              return (
                                                <tr>
                                                  <td
                                                    className="px-3 py-6 text-sm"
                                                    colSpan={1 + runCount}
                                                    style={{ color: "var(--foreground-muted)" }}
                                                  >
                                                    {keyword.trim()
                                                      ? "No rows match your search."
                                                      : "No rows to show."}
                                                  </td>
                                                </tr>
                                              );
                                            }
                                            return (
                                              <>
                                                {flat.map((row) => (
                                                  <tr
                                                    key={`${ctrl.controlKey}-${row.feature}`}
                                                    className="border-b last:border-0"
                                                    style={{
                                                      borderColor: "var(--border)",
                                                      background: row.diff
                                                        ? "rgba(245, 158, 11, 0.08)"
                                                        : "transparent",
                                                    }}
                                                  >
                                                    <td className="px-3 py-2 font-medium" style={{ color: "var(--foreground)" }}>
                                                      {cleanFeatureLabel(row.feature)}
                                                    </td>
                                                    {metaRuns.map((r) => (
                                                      <td
                                                        key={`${ctrl.controlKey}-${row.feature}-${r.runId}`}
                                                        className="px-3 py-2"
                                                        style={{ color: "var(--foreground)" }}
                                                      >
                                                        {row.valuesByRun[r.runId] ?? "—"}
                                                      </td>
                                                    ))}
                                                  </tr>
                                                ))}
                                                {groups.map(({ parent, children }) => {
                                                  const expanded = isFeatureParentExpanded(ctrl.controlKey, parent);
                                                  return (
                                                    <Fragment key={`${ctrl.controlKey}-grp-${parent}`}>
                                                      <tr
                                                        className="border-b"
                                                        style={{ borderColor: "var(--border)", background: "var(--muted)" }}
                                                      >
                                                        <td className="px-3 py-2" colSpan={1 + runCount}>
                                                          <button
                                                            type="button"
                                                            onClick={() => toggleFeatureParent(ctrl.controlKey, parent)}
                                                            className={awsRowExpandButtonClass}
                                                            style={{ color: "var(--foreground)" }}
                                                          >
                                                            <span
                                                              className="text-xs"
                                                              style={{ color: "var(--foreground-muted)" }}
                                                            >
                                                              {expanded ? "▾" : "▸"}
                                                            </span>
                                                            <span>{parent}</span>
                                                          </button>
                                                        </td>
                                                      </tr>
                                                      {expanded &&
                                                        children.map(({ row, childLabel }) => (
                                                          <tr
                                                            key={`${ctrl.controlKey}-${row.feature}`}
                                                            className="border-b last:border-0"
                                                            style={{
                                                              borderColor: "var(--border)",
                                                              background: row.diff
                                                                ? "rgba(245, 158, 11, 0.08)"
                                                                : "transparent",
                                                            }}
                                                          >
                                                            <td
                                                              className="px-3 py-2 pl-8 text-sm"
                                                              style={{ color: "var(--foreground)" }}
                                                            >
                                                              {childLabel}
                                                            </td>
                                                            {metaRuns.map((r) => (
                                                              <td
                                                                key={`${ctrl.controlKey}-${row.feature}-${r.runId}`}
                                                                className="px-3 py-2 text-sm"
                                                                style={{ color: "var(--foreground)" }}
                                                              >
                                                                {row.valuesByRun[r.runId] ?? "—"}
                                                              </td>
                                                            ))}
                                                          </tr>
                                                        ))}
                                                    </Fragment>
                                                  );
                                                })}
                                              </>
                                            );
                                          })()}
                                        </tbody>
                                      </table>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

