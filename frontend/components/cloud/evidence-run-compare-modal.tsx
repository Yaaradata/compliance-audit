"use client";

import { useEffect, useMemo, useState } from "react";
import type { CloudCollectorRun, CloudEvidenceRow } from "@/lib/cloud-evidence-types";
import { awsIconButtonClass, awsFieldClass } from "@/components/aws/aws-ui";
import {
  flattenEvidenceForCompare,
  formatAttributePathForDisplay,
  formatSectionLabel,
  rootSectionKey,
} from "@/lib/evidence-compare-flatten";

export interface EvidenceRunCompareModalProps {
  /** When null, modal is closed */
  anchorRow: CloudEvidenceRow | null;
  onClose: () => void;
  allEvidenceRows: CloudEvidenceRow[];
  runs: CloudCollectorRun[];
  cycleId: string | null | undefined;
  fetchEvidenceContent: (evidenceId: string, cycleId?: string | null) => Promise<unknown>;
  /**
   * Load index rows for one run (same API as the evidence table, scoped by run_id).
   * Required so older runs still resolve when the global evidence list is truncated by limit/order.
   */
  fetchEvidenceIndexForRun: (runId: string, cycleId?: string | null) => Promise<CloudEvidenceRow[]>;
  /** Shown in header, e.g. "AWS" or "GCP" */
  providerLabel?: string;
}

const ALL_SECTIONS = "__all__";

type RunColumn = {
  runId: string;
  evidenceId: string | null;
  runLabel: string;
  runStatus: string;
  collectedAt: string | null;
  sourceSystem: string;
  evidenceType: string;
  isAnchor: boolean;
  hasEvidenceRow: boolean;
  flat: Record<string, string>;
  loadError: string | null;
};

function formatRunLabel(run: CloudCollectorRun | undefined, index: number): string {
  if (!run) return "—";
  return `Run ${index + 1}`;
}

function runOrderIndex(runId: string | null | undefined, runs: CloudCollectorRun[]): number {
  if (!runId) return 9999;
  const i = runs.findIndex((r) => sameRunId(r.run_id, runId));
  return i === -1 ? 9999 : i;
}

function sameRunId(a: string | null | undefined, b: string | null | undefined): boolean {
  if (a == null || b == null) return false;
  return String(a).toLowerCase() === String(b).toLowerCase();
}

/**
 * Best evidence row for this run and control/item.
 * Prefers same source_system + evidence_type as the anchor; otherwise same run + control + item (latest).
 */
function pickEvidenceRowForRun(
  runId: string,
  anchor: CloudEvidenceRow,
  all: CloudEvidenceRow[]
): CloudEvidenceRow | null {
  const base = all.filter(
    (r) =>
      sameRunId(r.run_id, runId) &&
      r.control_id === anchor.control_id &&
      r.item_code === anchor.item_code
  );
  if (base.length === 0) return null;
  const strict = base.filter(
    (r) =>
      r.source_system === anchor.source_system &&
      (r.evidence_type || "") === (anchor.evidence_type || "")
  );
  const pool = strict.length > 0 ? strict : base;
  return pool.reduce((best, r) => {
    const t = r.collected_at ? new Date(r.collected_at).getTime() : 0;
    const bt = best.collected_at ? new Date(best.collected_at).getTime() : 0;
    return t >= bt ? r : best;
  });
}

function pickSiblingRows(
  anchor: CloudEvidenceRow,
  all: CloudEvidenceRow[],
  runs: CloudCollectorRun[]
): CloudEvidenceRow[] {
  const siblings = all.filter(
    (r) =>
      r.control_id === anchor.control_id &&
      r.item_code === anchor.item_code &&
      r.source_system === anchor.source_system &&
      (r.evidence_type || "") === (anchor.evidence_type || "")
  );
  const byRun = new Map<string, CloudEvidenceRow>();
  for (const r of siblings) {
    const rid = r.run_id ?? "";
    const existing = byRun.get(rid);
    if (!existing) {
      byRun.set(rid, r);
      continue;
    }
    const a = r.collected_at ? new Date(r.collected_at).getTime() : 0;
    const b = existing.collected_at ? new Date(existing.collected_at).getTime() : 0;
    if (a >= b) byRun.set(rid, r);
  }
  const deduped = Array.from(byRun.values()).sort(
    (x, y) => runOrderIndex(x.run_id, runs) - runOrderIndex(y.run_id, runs)
  );
  return deduped.length > 0 ? deduped : [anchor];
}

async function buildInitialColumns(
  anchorRow: CloudEvidenceRow,
  allEvidenceRows: CloudEvidenceRow[],
  runs: CloudCollectorRun[],
  cycleId: string | null | undefined,
  fetchEvidenceIndexForRun: (runId: string, cycleId?: string | null) => Promise<CloudEvidenceRow[]>
): Promise<RunColumn[]> {
  const runById = new Map(runs.map((r, i) => [r.run_id, { run: r, index: i }] as const));

  if (runs.length > 0) {
    return Promise.all(
      runs.map(async (run, index) => {
        let row = pickEvidenceRowForRun(run.run_id, anchorRow, allEvidenceRows);
        if (!row) {
          try {
            const forRun = await fetchEvidenceIndexForRun(run.run_id, cycleId);
            row = pickEvidenceRowForRun(run.run_id, anchorRow, forRun);
          } catch {
            row = null;
          }
        }
        return {
          runId: run.run_id,
          evidenceId: row?.evidence_id ?? null,
          runLabel: formatRunLabel(run, index),
          runStatus: run.status ?? "unknown",
          collectedAt: row?.collected_at ?? null,
          sourceSystem: row?.source_system ?? anchorRow.source_system,
          evidenceType: row?.evidence_type ?? anchorRow.evidence_type,
          isAnchor: row ? row.evidence_id === anchorRow.evidence_id : false,
          hasEvidenceRow: !!row,
          flat: {},
          loadError: null,
        };
      })
    );
  }

  const siblings = pickSiblingRows(anchorRow, allEvidenceRows, runs);
  return siblings.map((r, i) => {
    const info = r.run_id ? runById.get(r.run_id) : undefined;
    return {
      runId: r.run_id ?? `unknown-${i}`,
      evidenceId: r.evidence_id,
      runLabel: info ? formatRunLabel(info.run, info.index) : `Run ${i + 1}`,
      runStatus: info?.run?.status ?? "unknown",
      collectedAt: r.collected_at,
      sourceSystem: r.source_system,
      evidenceType: r.evidence_type,
      isAnchor: r.evidence_id === anchorRow.evidence_id,
      hasEvidenceRow: true,
      flat: {},
      loadError: null,
    };
  });
}

export function EvidenceRunCompareModal({
  anchorRow,
  onClose,
  allEvidenceRows,
  runs,
  cycleId,
  fetchEvidenceContent,
  fetchEvidenceIndexForRun,
  providerLabel = "Cloud",
}: EvidenceRunCompareModalProps) {
  const [columns, setColumns] = useState<RunColumn[]>([]);
  const [loading, setLoading] = useState(false);
  const [sectionFilter, setSectionFilter] = useState<string>(ALL_SECTIONS);

  useEffect(() => {
    if (!anchorRow) return undefined;
    let cancelled = false;

    void (async () => {
      const initialCols = await buildInitialColumns(
        anchorRow,
        allEvidenceRows,
        runs,
        cycleId,
        fetchEvidenceIndexForRun
      );

      if (cancelled) return;
      setLoading(true);
      setColumns(initialCols);

      const results = await Promise.all(
        initialCols.map(async (col) => {
          if (!col.evidenceId) {
            return { runId: col.runId, flat: {} as Record<string, string>, err: null as string | null };
          }
          try {
            const content = await fetchEvidenceContent(col.evidenceId, cycleId);
            return {
              runId: col.runId,
              flat: flattenEvidenceForCompare(content),
              err: null as string | null,
            };
          } catch (e) {
            return {
              runId: col.runId,
              flat: {} as Record<string, string>,
              err: e instanceof Error ? e.message : "Failed to load evidence",
            };
          }
        })
      );

      if (cancelled) return;
      setColumns((prev) =>
        prev.map((col) => {
          const hit = results.find((x) => x.runId === col.runId);
          if (!hit) return col;
          return { ...col, flat: hit.flat, loadError: hit.err };
        })
      );
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [anchorRow, allEvidenceRows, runs, cycleId, fetchEvidenceContent, fetchEvidenceIndexForRun]);

  const attributePaths = useMemo(() => {
    const set = new Set<string>();
    for (const c of columns) {
      for (const k of Object.keys(c.flat)) set.add(k);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [columns]);

  const sectionOptions = useMemo(() => {
    const keys = new Set<string>();
    for (const p of attributePaths) {
      keys.add(rootSectionKey(p));
    }
    const sorted = Array.from(keys).sort((a, b) => a.localeCompare(b));
    return sorted.map((key) => ({
      value: key,
      label: formatSectionLabel(key),
      count: attributePaths.filter((p) => rootSectionKey(p) === key).length,
    }));
  }, [attributePaths]);

  const filteredAttributePaths = useMemo(() => {
    if (sectionFilter === ALL_SECTIONS) return attributePaths;
    return attributePaths.filter((p) => rootSectionKey(p) === sectionFilter);
  }, [attributePaths, sectionFilter]);

  if (!anchorRow) return null;

  const headerTitle = `${providerLabel} evidence · Item ${anchorRow.item_code} · Control ${anchorRow.control_id}`;

  function payloadStatusText(col: RunColumn): string {
    if (!col.hasEvidenceRow) return "No evidence row for this run";
    if (col.loadError) return col.loadError;
    if (loading) return "Loading…";
    return "Ready";
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-3 sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[92vh] w-full max-w-[min(96rem,calc(100vw-1rem))] flex-col overflow-hidden rounded-xl shadow-xl"
        style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b px-4 py-3 shrink-0" style={{ borderColor: "var(--border)" }}>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold leading-snug" style={{ color: "var(--foreground)" }}>
              Compare runs
            </h3>
            <p className="mt-1 text-xs leading-snug" style={{ color: "var(--foreground-muted)" }}>
              {headerTitle}
            </p>
            <p className="mt-1 text-[11px] leading-snug" style={{ color: "var(--foreground-muted)" }}>
              Every collector run is a column (even if this control was only captured in some runs). Use the section menu
              to focus part of the payload — values are field-by-field, not raw JSON.
            </p>
          </div>
          <button type="button" className={awsIconButtonClass} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b px-4 py-2.5 shrink-0" style={{ borderColor: "var(--border)" }}>
          <label className="text-xs font-medium whitespace-nowrap" style={{ color: "var(--foreground-muted)" }}>
            Section
          </label>
          <select
            className={`min-w-[12rem] max-w-full ${awsFieldClass}`}
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            aria-label="Filter comparison by section"
            disabled={sectionOptions.length === 0 && attributePaths.length === 0}
          >
            <option value={ALL_SECTIONS}>
              {sectionOptions.length === 0
                ? "All fields"
                : `All fields (${attributePaths.length})`}
            </option>
            {sectionOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label} ({opt.count})
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-h-0 overflow-auto">
          {loading && columns.length === 0 ? (
            <p className="p-6 text-sm" style={{ color: "var(--foreground-muted)" }}>
              Loading comparison…
            </p>
          ) : (
            <div className="p-3 sm:p-4">
              <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--border)" }}>
                <table className="w-full min-w-[640px] border-collapse text-xs">
                  <thead>
                    <tr style={{ background: "var(--muted)" }}>
                      <th
                        className="sticky left-0 z-20 border-b border-r px-3 py-2.5 text-left font-semibold uppercase tracking-wide"
                        style={{
                          borderColor: "var(--border)",
                          background: "var(--muted)",
                          color: "var(--foreground-muted)",
                          minWidth: "11rem",
                        }}
                      >
                        Field
                      </th>
                      {columns.map((col) => (
                        <th
                          key={col.runId}
                          className="border-b px-3 py-2.5 text-left font-semibold align-top min-w-[12rem]"
                          style={{
                            borderColor: "var(--border)",
                            color: "var(--foreground)",
                            boxShadow: col.isAnchor ? "inset 0 0 0 2px var(--primary)" : undefined,
                            background: col.isAnchor ? "var(--primary-muted)" : "var(--muted)",
                          }}
                        >
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span>{col.runLabel}</span>
                            <span
                              className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium"
                              style={{
                                color:
                                  col.runStatus === "success"
                                    ? "var(--success)"
                                    : col.runStatus === "partial"
                                      ? "#d97706"
                                      : col.runStatus === "failed"
                                        ? "var(--danger)"
                                        : "var(--warning)",
                                background:
                                  col.runStatus === "success"
                                    ? "rgba(22, 163, 74, 0.12)"
                                    : col.runStatus === "partial"
                                      ? "rgba(217,119,6,0.12)"
                                      : col.runStatus === "failed"
                                        ? "rgba(220, 38, 38, 0.12)"
                                        : "rgba(245, 158, 11, 0.12)",
                              }}
                            >
                              {col.runStatus}
                            </span>
                            {col.isAnchor ? (
                              <span
                                className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium"
                                style={{ color: "var(--primary)", background: "var(--surface)" }}
                              >
                                This row
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 font-normal normal-case text-[10px] font-medium" style={{ color: "var(--foreground-muted)" }}>
                            {col.collectedAt ? new Date(col.collectedAt).toLocaleString() : "—"}
                          </p>
                          <p className="mt-0.5 font-normal normal-case text-[10px]" style={{ color: "var(--foreground-muted)" }}>
                            {col.sourceSystem} · {col.evidenceType || "—"}
                          </p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        className="sticky left-0 z-10 border-b border-r px-3 py-2 font-medium"
                        style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground-muted)" }}
                      >
                        Payload status
                      </td>
                      {columns.map((col) => (
                        <td
                          key={`${col.runId}-status`}
                          className="border-b px-3 py-2 align-top"
                          style={{
                            borderColor: "var(--border)",
                            background: col.isAnchor ? "var(--primary-muted)" : "var(--card)",
                            color: col.loadError ? "var(--danger)" : "var(--foreground-muted)",
                          }}
                        >
                          {payloadStatusText(col)}
                        </td>
                      ))}
                    </tr>
                    {filteredAttributePaths.length === 0 && !loading ? (
                      <tr>
                        <td
                          colSpan={columns.length + 1}
                          className="px-3 py-6 text-center"
                          style={{ color: "var(--foreground-muted)", borderColor: "var(--border)" }}
                        >
                          {attributePaths.length === 0
                            ? "No structured fields in this section (or payload is empty) for runs that have evidence."
                            : "No fields in this section — choose “All fields” or another section."}
                        </td>
                      </tr>
                    ) : (
                      filteredAttributePaths.map((path) => {
                        const values = columns.map((c) => c.flat[path] ?? "—");
                        const distinct = new Set(values);
                        const differs = distinct.size > 1;

                        return (
                          <tr key={path}>
                            <td
                              className="sticky left-0 z-10 border-b border-r px-3 py-2 align-top font-medium"
                              style={{
                                borderColor: "var(--border)",
                                background: differs ? "rgba(245, 158, 11, 0.06)" : "var(--card)",
                                color: "var(--foreground)",
                              }}
                            >
                              <span className="leading-snug">{formatAttributePathForDisplay(path)}</span>
                              {differs ? (
                                <span className="ml-1.5 align-middle text-[10px] font-semibold text-amber-700">
                                  ●
                                </span>
                              ) : null}
                            </td>
                            {columns.map((col) => {
                              const val = col.flat[path] ?? "—";
                              const cellDiffers = differs;
                              return (
                                <td
                                  key={`${col.runId}-${path}`}
                                  className="border-b px-3 py-2 align-top break-words max-w-[24rem]"
                                  style={{
                                    borderColor: "var(--border)",
                                    background: cellDiffers
                                      ? col.isAnchor
                                        ? "rgba(37, 99, 235, 0.1)"
                                        : "rgba(245, 158, 11, 0.06)"
                                      : col.isAnchor
                                        ? "var(--primary-muted)"
                                        : "var(--card)",
                                    color: "var(--foreground)",
                                  }}
                                >
                                  {val}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
