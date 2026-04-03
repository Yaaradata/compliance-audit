"use client";

import { useEffect, useMemo, useState } from "react";
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

function valueToEditorText(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

function parseEditorValue(raw: string, prev: unknown): unknown {
  if (typeof prev === "number") {
    const n = Number(raw);
    return Number.isFinite(n) ? n : prev;
  }
  if (typeof prev === "boolean") {
    const s = raw.trim().toLowerCase();
    if (s === "true") return true;
    if (s === "false") return false;
    return prev;
  }
  if (prev && typeof prev === "object") {
    try {
      return JSON.parse(raw);
    } catch {
      return prev;
    }
  }
  return raw;
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

function EditableArrayTable({
  sectionKey,
  title,
  items,
  issues,
  readOnly,
  onItemsChange,
}: {
  sectionKey: string;
  title: string;
  items: Record<string, unknown>[];
  issues: StageValidationIssue[];
  readOnly: boolean;
  onItemsChange: (rows: Record<string, unknown>[]) => void;
}) {
  if (!items.length) return <p className="text-xs text-slate-400 py-2">No {title} data.</p>;
  const cols = Object.keys(items[0]);
  const rowIssues = buildRowIssueMap(sectionKey, issues);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [draftRow, setDraftRow] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    setEditingRow(null);
    setDraftRow(null);
  }, [items.length, sectionKey]);

  const startEdit = (idx: number) => {
    setEditingRow(idx);
    setDraftRow({ ...items[idx] });
  };

  const cancelEdit = () => {
    setEditingRow(null);
    setDraftRow(null);
  };

  const saveRow = () => {
    if (editingRow === null || !draftRow) return;
    const next = items.map((r, i) => (i === editingRow ? draftRow : r));
    onItemsChange(next);
    setEditingRow(null);
    setDraftRow(null);
  };

  const updateDraftField = (key: string, raw: string, prev: unknown) => {
    if (!draftRow) return;
    setDraftRow({ ...draftRow, [key]: parseEditorValue(raw, prev) });
  };

  return (
    <div className="mb-6">
      <h4 className="text-xs font-semibold mb-2" style={{ color: "var(--foreground)" }}>{title} ({items.length} rows)</h4>
      <div className="overflow-x-auto border rounded-lg" style={{ borderColor: "var(--border)" }}>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50">
              {!readOnly && <th className="px-2.5 py-2 text-left font-semibold whitespace-nowrap border-b">Action</th>}
              <th className="px-2.5 py-2 text-left font-semibold whitespace-nowrap border-b">Issues</th>
              {cols.map((c) => (
                <th key={c} className="px-2.5 py-2 text-left font-semibold whitespace-nowrap border-b" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
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
                      <div className="flex gap-1">
                        <button onClick={saveRow} className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px]">Save</button>
                        <button onClick={cancelEdit} className="px-2 py-0.5 rounded border text-[11px]">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(i)} className="px-2 py-0.5 rounded border text-[11px]">Edit row</button>
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
                  <td key={c} className="px-2.5 py-1.5 border-b max-w-[300px] truncate" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                    {editingRow === i ? (
                      typeof row[c] === "boolean" ? (
                        <select
                          value={String((draftRow?.[c] ?? row[c]) as unknown)}
                          onChange={(e) => updateDraftField(c, e.target.value, row[c])}
                          className="w-full border rounded px-1 py-0.5"
                        >
                          <option value="true">true</option>
                          <option value="false">false</option>
                        </select>
                      ) : (
                        <input
                          value={valueToEditorText(draftRow?.[c] ?? row[c])}
                          onChange={(e) => updateDraftField(c, e.target.value, row[c])}
                          className="w-full border rounded px-1 py-0.5"
                        />
                      )
                    ) : (
                      typeof row[c] === "object" ? JSON.stringify(row[c]) : String(row[c] ?? "")
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
  const items = (data.canonical_evidence_items || []) as Record<string, unknown>[];
  const mappings = (data.item_control_mappings || []) as Record<string, unknown>[];

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="card rounded-lg p-3">
          <div className="text-[10px] font-medium" style={{ color: "var(--foreground-muted)" }}>Framework</div>
          <div className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{String(data.framework_name || "—")}</div>
        </div>
        <div className="card rounded-lg p-3">
          <div className="text-[10px] font-medium" style={{ color: "var(--foreground-muted)" }}>Controls</div>
          <div className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{controls.length}</div>
        </div>
        <div className="card rounded-lg p-3">
          <div className="text-[10px] font-medium" style={{ color: "var(--foreground-muted)" }}>Evidence Items</div>
          <div className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{items.length}</div>
        </div>
      </div>
      <EditableArrayTable sectionKey="evidence_domains" title="Evidence Domains" items={domains} issues={issues} readOnly={readOnly} onItemsChange={(rows) => onDataChange({ evidence_domains: rows })} />
      <EditableArrayTable sectionKey="controls" title="Controls" items={controls} issues={issues} readOnly={readOnly} onItemsChange={(rows) => onDataChange({ controls: rows })} />
      <EditableArrayTable sectionKey="canonical_evidence_items" title="Canonical Evidence Items" items={items} issues={issues} readOnly={readOnly} onItemsChange={(rows) => onDataChange({ canonical_evidence_items: rows })} />
      <EditableArrayTable sectionKey="item_control_mappings" title="Item-Control Mappings" items={mappings} issues={issues} readOnly={readOnly} onItemsChange={(rows) => onDataChange({ item_control_mappings: rows })} />
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
  const matrix = (data.sufficiency_matrix || []) as Record<string, unknown>[];
  return (
    <EditableArrayTable
      sectionKey="sufficiency_matrix"
      title="Sufficiency Matrix"
      items={matrix}
      issues={issues}
      readOnly={readOnly}
      onItemsChange={(rows) => onDataChange({ sufficiency_matrix: rows })}
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
  const questions = (data.evaluation_questions || []) as Record<string, unknown>[];
  return (
    <EditableArrayTable
      sectionKey="evaluation_questions"
      title="Evaluation Questions"
      items={questions}
      issues={issues}
      readOnly={readOnly}
      onItemsChange={(rows) => onDataChange({ evaluation_questions: rows })}
    />
  );
}

export function PipelineStageViewer({ pipelineId, stage, data, status, issues = [], onDataChange }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [jsonText, setJsonText] = useState(() => JSON.stringify(data, null, 2));
  const [saving, setSaving] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [tableData, setTableData] = useState<Record<string, unknown>>(data);
  const isConfirmed = status === "confirmed";
  const tableIssueCount = useMemo(() => issues.length, [issues]);

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
}
