"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { ReportSection } from "@/lib/types";

interface ApiReport {
  id: string;
  cycle_id: string;
  report_kind: string;
  sections: ReportSection[];
  snapshot_data: Record<string, unknown>;
  finalized_at: string | null;
  created_at: string;
  updated_at: string;
}

function Icon({ path, className }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const STATUS_DOT: Record<string, string> = {
  complete: "bg-emerald-500",
  generating: "bg-amber-400 animate-pulse",
  in_progress: "bg-blue-400",
  draft: "bg-[var(--border)]",
};

function SimpleMarkdown({ content }: { content: string }) {
  if (!content) return <p className="text-xs italic text-[var(--foreground-muted)]">No content yet.</p>;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("### ")) {
      elements.push(<h4 key={i} className="text-sm font-bold text-[var(--foreground)] mt-4 mb-1">{line.slice(4)}</h4>);
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(<h3 key={i} className="text-base font-bold text-[var(--foreground)] mt-5 mb-2">{line.slice(3)}</h3>);
      i++;
      continue;
    }

    if (line.trim().startsWith("|") && line.includes("|", 1)) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const stripped = lines[i].trim();
        if (!stripped.replace(/[|\-: ]/g, "")) { i++; continue; }
        tableLines.push(stripped);
        i++;
      }
      if (tableLines.length > 0) {
        const rows = tableLines.map((l) => l.split("|").filter(Boolean).map((c) => c.trim()));
        elements.push(
          <div key={`table-${i}`} className="overflow-x-auto my-3">
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr>
                  {rows[0]?.map((cell, ci) => (
                    <th key={ci} className="border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-left font-bold text-[var(--foreground)]">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(1).map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="border border-[var(--border)] px-2 py-1.5 text-[var(--foreground-muted)]">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      elements.push(
        <li key={i} className="text-xs text-[var(--foreground)] ml-4 list-disc mb-0.5">
          <RichText text={line.trim().slice(2)} />
        </li>
      );
      i++;
      continue;
    }

    if (/^\d+\.\s/.test(line.trim())) {
      elements.push(
        <li key={i} className="text-xs text-[var(--foreground)] ml-4 list-decimal mb-0.5">
          <RichText text={line.trim().replace(/^\d+\.\s/, "")} />
        </li>
      );
      i++;
      continue;
    }

    if (!line.trim()) { i++; continue; }

    elements.push(
      <p key={i} className="text-xs text-[var(--foreground)] leading-relaxed mb-2">
        <RichText text={line} />
      </p>
    );
    i++;
  }

  return <>{elements}</>;
}

function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**"))
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.startsWith("*") && part.endsWith("*"))
          return <em key={i}>{part.slice(1, -1)}</em>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function CycleReportPage() {
  const params = useParams();
  const cycleId = params.cycleId as string;

  const [sections, setSections] = useState<ReportSection[]>([]);
  const [activeSection, setActiveSection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reportId, setReportId] = useState<string | null>(null);
  const [reportKind, setReportKind] = useState("draft");
  const [snapshotMeta, setSnapshotMeta] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [generatingSectionIdx, setGeneratingSectionIdx] = useState<number | null>(null);
  const [regeneratingIdx, setRegeneratingIdx] = useState<number | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    if (!cycleId) { setSections([]); setLoading(false); return; }
    setLoading(true);
    try {
      const reports = await api.get<ApiReport[]>(`/assessments/${cycleId}/reports`);
      if (reports.length > 0) {
        const latest = reports[0];
        setReportId(latest.id);
        setReportKind(latest.report_kind);
        setSections(latest.sections?.length > 0 ? latest.sections : []);
        const meta = (latest.snapshot_data as Record<string, Record<string, string>>)?.metadata;
        if (meta) setSnapshotMeta(meta);
      } else {
        setSections([]);
      }
    } catch {
      setSections([]);
    } finally {
      setLoading(false);
    }
  }, [cycleId]);

  useEffect(() => { loadReports(); }, [loadReports]);

  const handleCreateReport = async () => {
    try {
      const r = await api.post<ApiReport>(`/assessments/${cycleId}/reports`, { report_kind: "draft" });
      setReportId(r.id);
      setSections(r.sections?.length > 0 ? r.sections : []);
    } catch { /* ignore */ }
  };

  const handleGenerate = async () => {
    if (!reportId || !sections.length) return;
    setGenerateError(null);
    setGenerating(true);
    const pathPrefix = `/assessments/${cycleId}/reports/${reportId}`;
    const timeoutPerSection = 240_000; // 4 min per section (retries can be long)
    const indicesToGenerate = sections
      .map((s, i) => (s.ai !== false ? i : -1))
      .filter((i) => i >= 0);

    try {
      for (let i = 0; i < indicesToGenerate.length; i++) {
        const index = indicesToGenerate[i];
        setGeneratingSectionIdx(index);
        setSections((prev) => {
          const next = [...prev];
          if (next[index]) next[index] = { ...next[index], status: "generating" as const };
          return next;
        });
        try {
          const r = await api.postDirect<ApiReport>(
            `${pathPrefix}/sections/${index}/regenerate`,
            undefined,
            timeoutPerSection,
          );
          setSections(r.sections || []);
          const meta = (r.snapshot_data as Record<string, Record<string, string>>)?.metadata;
          if (meta) setSnapshotMeta(meta);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Section generation failed.";
          setGenerateError(
            `Section ${i + 1}/${indicesToGenerate.length} failed: ${msg}. You can regenerate that section later.`,
          );
          setSections((prev) => {
            const next = [...prev];
            if (next[index]) next[index] = { ...next[index], status: "draft" as const };
            return next;
          });
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Generate failed.";
      setGenerateError(msg);
    } finally {
      setGenerating(false);
      setGeneratingSectionIdx(null);
    }
  };

  const handleRegenerate = async (idx: number) => {
    if (!reportId) return;
    setRegenerateError(null);
    setRegeneratingIdx(idx);
    setSections((prev) => {
      const next = [...prev];
      if (next[idx]) next[idx] = { ...next[idx], status: "generating" as const };
      return next;
    });
    const pathPrefix = `/assessments/${cycleId}/reports/${reportId}`;
    const timeoutMs = 240_000; // 4 min (retries on 429 can be long)
    try {
      const r = await api.postDirect<ApiReport>(`${pathPrefix}/sections/${idx}/regenerate`, undefined, timeoutMs);
      setSections(r.sections || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Regeneration failed.";
      setRegenerateError(msg);
      setSections((prev) => {
        const next = [...prev];
        if (next[idx]) next[idx] = { ...next[idx], status: "draft" as const };
        return next;
      });
    } finally {
      setRegeneratingIdx(null);
    }
  };

  const handleSave = async () => {
    if (!reportId) return;
    setSaving(true);
    const updated = [...sections];
    updated[activeSection] = { ...updated[activeSection], content: editDraft };
    try {
      const r = await api.put<ApiReport>(`/assessments/${cycleId}/reports/${reportId}`, { sections: updated });
      setSections(r.sections || updated);
      setEditing(false);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const handleMarkStatus = async (status: "complete" | "draft") => {
    if (!reportId) return;
    const updated = [...sections];
    updated[activeSection] = { ...updated[activeSection], status };
    try {
      const r = await api.put<ApiReport>(`/assessments/${cycleId}/reports/${reportId}`, { sections: updated });
      setSections(r.sections || updated);
    } catch { /* ignore */ }
  };

  const handleExport = async (format: "docx" | "pdf") => {
    if (!reportId) return;
    setExporting(format);
    try {
      const token = localStorage.getItem("swift_compliance_token") || "";
      const response = await fetch(`/api/v1/assessments/${cycleId}/reports/${reportId}/export?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SWIFT_CSP_Report_${snapshotMeta.assessment_year || "draft"}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
    finally { setExporting(null); }
  };

  const completeSections = sections.filter((s) => s.status === "complete").length;
  const currentSection = sections[activeSection] ?? null;
  const isCurrentSectionGenerating =
    regeneratingIdx === activeSection ||
    (generating && generatingSectionIdx === activeSection) ||
    currentSection?.status === "generating";
  const generatingProgress =
    generating && generatingSectionIdx !== null
      ? (() => {
          const indices = sections.map((s, i) => (s.ai !== false ? i : -1)).filter((i) => i >= 0);
          const pos = indices.indexOf(generatingSectionIdx);
          return pos >= 0 ? { current: pos + 1, total: indices.length } : null;
        })()
      : null;

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh] text-sm text-[var(--foreground-muted)]">Loading report…</div>;
  }

  if (sections.length === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)] w-full bg-[var(--background)] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-[var(--primary-muted)] flex items-center justify-center mb-4">
          <Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" className="w-8 h-8 text-[var(--primary)]" />
        </div>
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-1">No report yet</h2>
        <p className="text-sm text-[var(--foreground-muted)] mb-6 max-w-md">
          Create a draft report to get started. The report will have 14 sections structured by domain (A–H), plus executive summary, gap analysis, and attestation.
        </p>
        <button
          onClick={handleCreateReport}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--primary)] text-white hover:opacity-90 transition-opacity shadow-md"
        >
          Create Draft Report
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-[var(--background)]">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--primary-muted)]">
              <Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">Report</h1>
              <p className="text-[10px] text-[var(--foreground-muted)] mt-0.5">
                SWIFT CSP Assessment Report
                {snapshotMeta.bank_name && ` · ${snapshotMeta.bank_name}`}
                {snapshotMeta.assessment_year && ` · ${snapshotMeta.assessment_year}`}
                {snapshotMeta.architecture_type && ` · ${snapshotMeta.architecture_type}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
              reportKind === "final"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
            }`}>
              {reportKind === "final" ? "Finalised" : "Draft"}
            </span>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--primary)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity shadow-md"
            >
              <Icon path="M13 10V3L4 14h7v7l9-11h-7z" className="w-3.5 h-3.5" />
              {generating
                ? generatingProgress
                  ? `Generating ${generatingProgress.current}/${generatingProgress.total}…`
                  : "Generating…"
                : "Generate All Sections"}
            </button>
          </div>
        </header>

        {(generateError || regenerateError) && (
          <div
            className="mb-4 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm flex items-start justify-between gap-3"
            role="alert"
          >
            <span>{generateError ?? regenerateError}</span>
            <button
              type="button"
              onClick={() => { setGenerateError(null); setRegenerateError(null); }}
              className="flex-shrink-0 text-amber-600 dark:text-amber-400 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main layout */}
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5">
          {/* Left sidebar — section navigator */}
          <aside className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--background)]/50">
              <p className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">Sections</p>
              <p className="text-[10px] text-[var(--foreground-subtle)] mt-0.5">{completeSections}/{sections.length} complete</p>
            </div>
            <div className="p-2 space-y-0.5 max-h-[calc(100vh-280px)] overflow-y-auto">
              {sections.map((s, i) => (
                <button
                  key={s.key || i}
                  onClick={() => { setActiveSection(i); setEditing(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    i === activeSection
                      ? "bg-[var(--primary-muted)] ring-1 ring-[var(--primary)]/20"
                      : "hover:bg-[var(--background)]"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[s.status] || STATUS_DOT.draft}`} />
                  <span className={`text-[11px] truncate flex-1 ${
                    i === activeSection ? "font-semibold text-[var(--foreground)]" : "text-[var(--foreground-muted)]"
                  }`}>
                    {s.name}
                  </span>
                  {s.ai && <span className="text-[8px] px-1.5 py-0.5 rounded bg-[var(--primary-muted)] text-[var(--primary)] font-bold flex-shrink-0">AI</span>}
                  {s.status === "generating" && (
                    <span className="w-3 h-3 flex-shrink-0">
                      <svg className="animate-spin w-3 h-3 text-amber-500" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </aside>

          {/* Main content area */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] flex flex-col shadow-[var(--shadow)] overflow-hidden">
            {currentSection && (
              <>
                {/* Section toolbar */}
                <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--background)]/50 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-[var(--foreground)]">{currentSection.name}</h2>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      isCurrentSectionGenerating
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                        : currentSection.status === "complete"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-[var(--background)] text-[var(--foreground-muted)] border border-[var(--border)]"
                    }`}>
                      {isCurrentSectionGenerating ? "generating" : currentSection.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {currentSection.ai && (
                      <button
                        onClick={() => handleRegenerate(activeSection)}
                        disabled={regeneratingIdx === activeSection || generating}
                        className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[10px] font-semibold text-[var(--foreground-muted)] hover:bg-[var(--background)] disabled:opacity-50 transition-colors"
                      >
                        {regeneratingIdx === activeSection ? "Generating…" : "Regenerate"}
                      </button>
                    )}
                    {!editing ? (
                      <button
                        onClick={() => { setEditing(true); setEditDraft(currentSection.content || ""); }}
                        className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[10px] font-semibold text-[var(--foreground-muted)] hover:bg-[var(--background)] transition-colors"
                      >
                        Edit
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="px-2.5 py-1.5 rounded-lg bg-[var(--primary)] text-white text-[10px] font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                        >
                          {saving ? "Saving…" : "Save"}
                        </button>
                        <button
                          onClick={() => setEditing(false)}
                          className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[10px] font-semibold text-[var(--foreground-muted)] hover:bg-[var(--background)] transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {currentSection.status !== "complete" ? (
                      <button
                        onClick={() => handleMarkStatus("complete")}
                        className="px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                      >
                        Mark complete
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarkStatus("draft")}
                        className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[10px] font-semibold text-[var(--foreground-muted)] hover:bg-[var(--background)] transition-colors"
                      >
                        Revert to draft
                      </button>
                    )}
                  </div>
                </div>

                {/* Content area */}
                <div className="flex-1 overflow-y-auto max-h-[calc(100vh-350px)]">
                  {editing ? (
                    <textarea
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      className="w-full h-full min-h-[500px] p-5 text-xs font-mono bg-[var(--background)] text-[var(--foreground)] resize-none focus:outline-none leading-relaxed"
                      placeholder="Write markdown content here…"
                    />
                  ) : (
                    <div className="p-5">
                      {isCurrentSectionGenerating ? (
                        <div className="flex flex-col items-center gap-3 py-10 justify-center">
                          <svg className="animate-spin w-5 h-5 text-[var(--primary)]" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span className="text-sm text-[var(--foreground-muted)]">
                            {generatingProgress
                              ? `Generating section ${generatingProgress.current} of ${generatingProgress.total}…`
                              : "AI is generating this section…"}
                          </span>
                        </div>
                      ) : currentSection.content ? (
                        <SimpleMarkdown content={currentSection.content} />
                      ) : (
                        <div className="text-center py-10">
                          <p className="text-sm text-[var(--foreground-muted)]">
                            {currentSection.ai
                              ? 'No content yet. Click "Generate All Sections" or "Regenerate" to draft with AI.'
                              : "This section requires manual content. Click Edit to add content."}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Export bar */}
            <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--background)]/50 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExport("docx")}
                  disabled={!!exporting}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--primary)] text-white text-[11px] font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
                >
                  <Icon path="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" className="w-3.5 h-3.5" />
                  {exporting === "docx" ? "Exporting…" : "Export Word"}
                </button>
                <button
                  onClick={() => handleExport("pdf")}
                  disabled={!!exporting}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] text-[11px] font-semibold hover:bg-[var(--background)] disabled:opacity-50 transition-colors"
                >
                  <Icon path="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" className="w-3.5 h-3.5" />
                  {exporting === "pdf" ? "Exporting…" : "Export PDF"}
                </button>
              </div>
              <span className="text-[10px] text-[var(--foreground-subtle)]">
                {reportId ? `Report ${reportId.slice(0, 8)}` : ""}
                {completeSections === sections.length && sections.length > 0 && " · All sections complete"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
