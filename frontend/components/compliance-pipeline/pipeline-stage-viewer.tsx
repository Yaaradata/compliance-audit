"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { api } from "@/lib/api";

interface Props {
  pipelineId: string;
  stage: number;
  data: Record<string, unknown>;
  status: string;
  issues?: StageValidationIssue[];
  onDataChange: (data: Record<string, unknown>) => void;
}

type ViewMode = "table" | "json";

interface StageValidationIssue {
  path: string;
  problem: string;
  impact: string;
  fix: string;
  blocking: boolean;
}

/** How to edit a column in the table (avoids broken single-line JSON inputs). */
type FieldEditorType = "text" | "boolean" | "number" | "comma-list" | "json";

function valueToEditorText(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

function inferFieldEditorType(key: string, sample: unknown): FieldEditorType {
  if (typeof sample === "boolean") return "boolean";
  if (typeof sample === "number") return "number";
  if (key === "controls_served") return "comma-list";
  if (sample !== null && typeof sample === "object" && !Array.isArray(sample)) return "json";
  if (Array.isArray(sample)) {
    if (sample.length === 0) return "comma-list";
    if (sample.every((x) => typeof x === "string" || typeof x === "number")) return "comma-list";
    return "json";
  }
  return "text";
}

/** Control IDs: comma or newline separated (no JSON required). */
function commaListToText(v: unknown): string {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean).join(", ");
  if (typeof v === "string") return v;
  return "";
}

function parseCommaList(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Turn draft row into typed objects: comma-lists → string[], json strings → objects.
 * Allows editing JSON as raw text without losing keystrokes to JSON.parse on every change.
 */
function finalizeDraftRow(
  draft: Record<string, unknown>,
  original: Record<string, unknown>,
  fieldTypes: Record<string, FieldEditorType>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...draft };
  for (const key of Object.keys(out)) {
    const ft = fieldTypes[key] ?? inferFieldEditorType(key, original[key]);
    const val = out[key];

    if (ft === "comma-list") {
      if (Array.isArray(val)) {
        out[key] = val.map((x) => String(x).trim()).filter(Boolean);
        continue;
      }
      if (typeof val === "string") {
        out[key] = parseCommaList(val);
        continue;
      }
      continue;
    }

    if (ft === "json") {
      if (typeof val !== "string") continue;
      const t = val.trim();
      if (!t) {
        out[key] = original[key];
        continue;
      }
      try {
        out[key] = JSON.parse(t) as unknown;
      } catch {
        throw new Error(`Column "${key.replace(/_/g, " ")}": invalid JSON. Check brackets and quotes.`);
      }
      continue;
    }

    if (ft === "number") {
      if (typeof val === "number" && Number.isFinite(val)) continue;
      if (typeof val === "string") {
        const n = Number(val.trim());
        if (Number.isFinite(n)) out[key] = n;
      }
      continue;
    }
  }
  return out;
}

function buildRowIssueMap(sectionKey: string, issues: StageValidationIssue[]) {
  const map = new Map<number, StageValidationIssue[]>();
  const rowPattern = new RegExp(`^${sectionKey}\\[(\\d+)\\](?:\\.|$)`);
  for (const issue of issues) {
    const m = issue.path.match(rowPattern);
    if (!m) continue;
    const idx = Number(m[1]);
    if (!Number.isFinite(idx)) continue;
    const arr = map.get(idx) || [];
    arr.push(issue);
    map.set(idx, arr);
  }
  return map;
}

const STAGE2_FIELD_TYPES: Record<string, FieldEditorType> = {
  controls_served: "comma-list",
  input_schema: "json",
  sufficiency_dimensions: "json",
};

const STAGE4_FIELD_TYPES: Record<string, FieldEditorType> = {
  sufficiency_criteria: "json",
  evaluation_criteria: "json",
};

const STAGE5_FIELD_TYPES: Record<string, FieldEditorType> = {
  options: "json",
  answers: "json",
  rows: "json",
  show_when_values: "comma-list",
  gcs_services: "json",
  aws_services: "json",
  azure_services: "json",
  question_level_gcs_sources: "json",
  question_level_aws_sources: "json",
  question_level_azure_sources: "json",
};

function renderEditCell(
  c: string,
  row: Record<string, unknown>,
  draftRow: Record<string, unknown>,
  setDraftRow: (next: Record<string, unknown>) => void,
  fieldTypes: Record<string, FieldEditorType>,
) {
  const orig = row[c];
  const ft = fieldTypes[c] ?? inferFieldEditorType(c, orig);
  const draftVal = draftRow[c];

  if (ft === "boolean") {
    const v = draftVal ?? orig;
    return (
      <select
        value={String(v)}
        onChange={(e) => setDraftRow({ ...draftRow, [c]: e.target.value === "true" })}
        className="w-full max-w-[100px] border rounded px-1 py-1"
        style={{ borderColor: "var(--border)" }}
      >
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    );
  }

  if (ft === "number") {
    const display =
      draftVal !== undefined && draftVal !== null ? String(draftVal) : orig !== undefined && orig !== null ? String(orig) : "";
    return (
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={(e) => setDraftRow({ ...draftRow, [c]: e.target.value })}
        className="w-full min-w-[72px] border rounded px-1.5 py-1 font-mono text-[11px]"
        style={{ borderColor: "var(--border)" }}
      />
    );
  }

  if (ft === "comma-list") {
    const fromDraft = draftVal !== undefined ? draftVal : orig;
    const textValue = typeof fromDraft === "string" ? fromDraft : commaListToText(fromDraft);
    return (
      <div className="min-w-[200px] max-w-[320px]">
        <textarea
          rows={4}
          value={textValue}
          onChange={(e) => setDraftRow({ ...draftRow, [c]: e.target.value })}
          placeholder="Control IDs: comma or newline, e.g. 2.8, 1.3"
          className="w-full border rounded px-1.5 py-1 font-mono text-[11px] resize-y"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          spellCheck={false}
        />
        <p className="text-[10px] mt-0.5" style={{ color: "var(--foreground-muted)" }}>
          No JSON brackets needed — separate IDs with commas or new lines.
        </p>
      </div>
    );
  }

  if (ft === "json") {
    const textValue = typeof draftVal === "string" ? draftVal : valueToEditorText(draftVal ?? orig);
    return (
      <textarea
        rows={8}
        value={textValue}
        onChange={(e) => setDraftRow({ ...draftRow, [c]: e.target.value })}
        className="w-full min-w-[240px] max-w-[480px] border rounded px-1.5 py-1 font-mono text-[11px] resize-y"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        spellCheck={false}
      />
    );
  }

  const textDisplay = draftVal !== undefined && draftVal !== null ? String(draftVal) : String(orig ?? "");
  return (
    <textarea
      rows={3}
      value={textDisplay}
      onChange={(e) => setDraftRow({ ...draftRow, [c]: e.target.value })}
      className="w-full min-w-[160px] max-w-[360px] border rounded px-1.5 py-1 text-[11px] resize-y"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    />
  );
}

function formatCellDisplay(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  return String(v);
}

function EditableArrayTable({
  sectionKey,
  title,
  items,
  issues,
  readOnly,
  onItemsChange,
  fieldTypes = {},
}: {
  sectionKey: string;
  title: string;
  items: Record<string, unknown>[];
  issues: StageValidationIssue[];
  readOnly: boolean;
  onItemsChange: (rows: Record<string, unknown>[]) => void;
  fieldTypes?: Record<string, FieldEditorType>;
}) {
  const cols = items.length ? Object.keys(items[0]) : [];
  const rowIssues = buildRowIssueMap(sectionKey, issues);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [draftRow, setDraftRow] = useState<Record<string, unknown> | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  if (!items.length) {
    return <p className="text-xs text-slate-400 py-2">No {title} data.</p>;
  }

  const startEdit = (idx: number) => {
    setParseError(null);
    setEditingRow(idx);
    setDraftRow({ ...items[idx] });
  };

  const cancelEdit = () => {
    setEditingRow(null);
    setDraftRow(null);
    setParseError(null);
  };

  const saveRow = () => {
    if (editingRow === null || !draftRow) return;
    setParseError(null);
    try {
      const finalized = finalizeDraftRow(draftRow, items[editingRow], fieldTypes);
      const next = items.map((r, i) => (i === editingRow ? finalized : r));
      onItemsChange(next);
      setEditingRow(null);
      setDraftRow(null);
    } catch (e: unknown) {
      setParseError(e instanceof Error ? e.message : "Could not save this row");
    }
  };

  return (
    <div className="mb-6">
      <h4 className="text-xs font-semibold mb-2" style={{ color: "var(--foreground)" }}>{title} ({items.length} rows)</h4>
      <div className="overflow-x-auto border rounded-lg" style={{ borderColor: "var(--border)" }}>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50">
              {!readOnly && <th className="px-2.5 py-2 text-left font-semibold whitespace-nowrap border-b">Action</th>}
              <th className="px-2.5 py-2 text-left font-semibold whitespace-nowrap border-b min-w-[220px]">Issues</th>
              {cols.map((c) => (
                <th key={c} className="px-2.5 py-2 text-left font-semibold border-b align-bottom" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                  {c.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((row, i) => (
              <tr
                key={i}
                className={`${rowIssues.has(i) ? "bg-red-50 hover:bg-red-100/60" : "hover:bg-slate-50/50"}`}
              >
                {!readOnly && (
                  <td className="px-2.5 py-1.5 border-b align-top">
                    {editingRow === i ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-1 flex-wrap">
                          <button type="button" onClick={saveRow} className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px]">Save</button>
                          <button type="button" onClick={cancelEdit} className="px-2 py-0.5 rounded border text-[11px]">Cancel</button>
                        </div>
                        {parseError && <p className="text-[10px] text-red-600 leading-tight">{parseError}</p>}
                      </div>
                    ) : (
                      <button type="button" onClick={() => startEdit(i)} className="px-2 py-0.5 rounded border text-[11px]">Edit row</button>
                    )}
                  </td>
                )}
                <td className="px-2.5 py-1.5 border-b align-top min-w-[220px]">
                  {rowIssues.has(i) ? (
                    <div className="space-y-1">
                      {(rowIssues.get(i) || []).map((issue, j) => (
                        <div key={`${sectionKey}-${i}-${j}`} className="rounded border border-red-200 bg-white px-2 py-1">
                          <p className="text-[11px] font-semibold text-red-700">{issue.blocking ? "Blocking" : "Warning"}: {issue.problem}</p>
                          <p className="text-[11px] text-slate-700">Fix: {issue.fix}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-emerald-700">No issues</span>
                  )}
                </td>
                {cols.map((c) => (
                  <td key={c} className="px-2.5 py-1.5 border-b align-top" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                    {editingRow === i && draftRow ? (
                      renderEditCell(c, row, draftRow, (next) => setDraftRow(next), fieldTypes)
                    ) : (
                      <div className="max-w-[280px] break-words whitespace-pre-wrap text-[11px] leading-snug" title={formatCellDisplay(row[c])}>
                        {formatCellDisplay(row[c])}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stage1View({
  data,
  issues,
  readOnly,
  onDataChange,
}: {
  data: Record<string, unknown>;
  issues: StageValidationIssue[];
  readOnly: boolean;
  onDataChange: (patch: Record<string, unknown>) => void;
}) {
  const domains = (data.evidence_domains || []) as Record<string, unknown>[];
  const controls = (data.controls || []) as Record<string, unknown>[];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="card rounded-lg p-3">
          <div className="text-[10px] font-medium" style={{ color: "var(--foreground-muted)" }}>Framework</div>
          <div className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{String(data.framework_name || "—")}</div>
        </div>
        <div className="card rounded-lg p-3">
          <div className="text-[10px] font-medium" style={{ color: "var(--foreground-muted)" }}>Controls</div>
          <div className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{controls.length}</div>
        </div>
      </div>
      <EditableArrayTable key={`evidence_domains-${domains.length}`} sectionKey="evidence_domains" title="Evidence Domains" items={domains} issues={issues} readOnly={readOnly} onItemsChange={(rows) => onDataChange({ evidence_domains: rows })} />
      <EditableArrayTable key={`controls-${controls.length}`} sectionKey="controls" title="Controls" items={controls} issues={issues} readOnly={readOnly} onItemsChange={(rows) => onDataChange({ controls: rows })} />
    </div>
  );
}

function Stage2View({
  data,
  issues,
  readOnly,
  onDataChange,
}: {
  data: Record<string, unknown>;
  issues: StageValidationIssue[];
  readOnly: boolean;
  onDataChange: (patch: Record<string, unknown>) => void;
}) {
  const items = (data.canonical_evidence_items || []) as Record<string, unknown>[];
  return (
    <EditableArrayTable
      key={`canonical_evidence_items-${items.length}`}
      sectionKey="canonical_evidence_items"
      title="Canonical Evidence Items"
      items={items}
      issues={issues}
      readOnly={readOnly}
      fieldTypes={STAGE2_FIELD_TYPES}
      onItemsChange={(rows) => onDataChange({ canonical_evidence_items: rows })}
    />
  );
}

function Stage3View({
  data,
  issues,
  readOnly,
  onDataChange,
}: {
  data: Record<string, unknown>;
  issues: StageValidationIssue[];
  readOnly: boolean;
  onDataChange: (patch: Record<string, unknown>) => void;
}) {
  const mappings = (data.item_control_mappings || []) as Record<string, unknown>[];
  return (
    <EditableArrayTable
      key={`item_control_mappings-${mappings.length}`}
      sectionKey="item_control_mappings"
      title="Item-Control Mappings"
      items={mappings}
      issues={issues}
      readOnly={readOnly}
      onItemsChange={(rows) => onDataChange({ item_control_mappings: rows })}
    />
  );
}

function Stage4View({
  data,
  issues,
  readOnly,
  onDataChange,
}: {
  data: Record<string, unknown>;
  issues: StageValidationIssue[];
  readOnly: boolean;
  onDataChange: (patch: Record<string, unknown>) => void;
}) {
  const matrix = (data.evidence_sufficiency_matrix || []) as Record<string, unknown>[];
  return (
    <EditableArrayTable
      key={`evidence_sufficiency_matrix-${matrix.length}`}
      sectionKey="evidence_sufficiency_matrix"
      title="Evidence Sufficiency Matrix"
      items={matrix}
      issues={issues}
      readOnly={readOnly}
      fieldTypes={STAGE4_FIELD_TYPES}
      onItemsChange={(rows) => onDataChange({ evidence_sufficiency_matrix: rows })}
    />
  );
}

function Stage5View({
  data,
  issues,
  readOnly,
  onDataChange,
}: {
  data: Record<string, unknown>;
  issues: StageValidationIssue[];
  readOnly: boolean;
  onDataChange: (patch: Record<string, unknown>) => void;
}) {
  const questions = (data.evidence_based_questions || []) as Record<string, unknown>[];
  return (
    <EditableArrayTable
      key={`evidence_based_questions-${questions.length}`}
      sectionKey="evidence_based_questions"
      title="Evidence Based Questions"
      items={questions}
      issues={issues}
      readOnly={readOnly}
      fieldTypes={STAGE5_FIELD_TYPES}
      onItemsChange={(rows) => onDataChange({ evidence_based_questions: rows })}
    />
  );
}

export type PipelineStageViewerHandle = {
  /** Latest draft: table state or parsed JSON editor (for run-stage / repair payload). */
  getOutputDataForRun: () =>
    | { ok: true; data: Record<string, unknown> }
    | { ok: false; error: string };
};

export const PipelineStageViewer = forwardRef<PipelineStageViewerHandle, Props>(function PipelineStageViewer(
  { pipelineId, stage, data, status, issues = [], onDataChange },
  ref,
) {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [jsonText, setJsonText] = useState(() => JSON.stringify(data, null, 2));
  const [saving, setSaving] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [tableData, setTableData] = useState<Record<string, unknown>>(data);
  const isConfirmed = status === "confirmed";
  const tableIssueCount = useMemo(() => issues.length, [issues]);

  useImperativeHandle(
    ref,
    () => ({
      getOutputDataForRun: () => {
        if (viewMode === "json") {
          try {
            const parsed = JSON.parse(jsonText) as unknown;
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
              return { ok: true as const, data: parsed as Record<string, unknown> };
            }
            return { ok: false as const, error: "Root JSON value must be an object." };
          } catch (e: unknown) {
            return {
              ok: false as const,
              error: e instanceof Error ? e.message : "Invalid JSON",
            };
          }
        }
        return { ok: true as const, data: tableData };
      },
    }),
    [viewMode, jsonText, tableData],
  );

  useEffect(() => {
    setTableData(data);
    setJsonText(JSON.stringify(data, null, 2));
  }, [data]);

  const saveData = async (next: Record<string, unknown>) => {
    setSaving(true);
    try {
      await api.put(`/compliance-pipeline/${pipelineId}/stage/${stage}/output`, { output_data: next });
      onDataChange(next);
      setTableData(next);
    } finally {
      setSaving(false);
    }
  };

  const applyTablePatch = async (patch: Record<string, unknown>) => {
    const next = { ...tableData, ...patch };
    await saveData(next);
  };

  const handleJsonChange = (text: string) => {
    setJsonText(text);
    try {
      JSON.parse(text);
      setJsonError(null);
    } catch (e: unknown) {
      setJsonError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  const handleSaveJson = async () => {
    try {
      const parsed = JSON.parse(jsonText);
      await saveData(parsed);
    } catch {
      // keep existing behavior: stay on screen when invalid
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode("table")}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${viewMode === "table" ? "bg-blue-100 text-blue-700" : "text-slate-500 hover:bg-slate-100"}`}
          >
            Table View
          </button>
          <button
            onClick={() => { setViewMode("json"); setJsonText(JSON.stringify(data, null, 2)); setJsonError(null); }}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${viewMode === "json" ? "bg-blue-100 text-blue-700" : "text-slate-500 hover:bg-slate-100"}`}
          >
            JSON View
          </button>
        </div>
        {viewMode === "json" && !isConfirmed && (
          <button
            onClick={handleSaveJson}
            disabled={saving || !!jsonError}
            className="btn-primary px-3 py-1 text-xs rounded-lg disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>

      {viewMode === "table" ? (
        <div>
          {!!tableIssueCount && (
            <p className="text-xs text-red-700 mb-2">
              {tableIssueCount} validation issue(s) mapped below. Red rows contain problems; edit and save per row.
            </p>
          )}
          {saving && <p className="text-xs text-slate-500 mb-2">Saving changes...</p>}
          {stage === 1 && <Stage1View data={tableData} issues={issues} readOnly={isConfirmed} onDataChange={applyTablePatch} />}
          {stage === 2 && <Stage2View data={tableData} issues={issues} readOnly={isConfirmed} onDataChange={applyTablePatch} />}
          {stage === 3 && <Stage3View data={tableData} issues={issues} readOnly={isConfirmed} onDataChange={applyTablePatch} />}
          {stage === 4 && <Stage4View data={tableData} issues={issues} readOnly={isConfirmed} onDataChange={applyTablePatch} />}
          {stage === 5 && <Stage5View data={tableData} issues={issues} readOnly={isConfirmed} onDataChange={applyTablePatch} />}
        </div>
      ) : (
        <div>
          {jsonError && <p className="text-xs text-red-500 mb-1">{jsonError}</p>}
          <textarea
            value={jsonText}
            onChange={(e) => handleJsonChange(e.target.value)}
            readOnly={isConfirmed}
            className="w-full h-[500px] font-mono text-xs p-3 rounded-lg border resize-y"
            style={{ borderColor: jsonError ? "#ef4444" : "var(--border)", background: "var(--surface)" }}
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
});
