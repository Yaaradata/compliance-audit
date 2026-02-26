"use client";

import { useState } from "react";
import { FileUploadZone } from "@/components/ui/file-upload-zone";
import type { ControlCriteria, AiCriterionResult as AiCriterionResultType } from "@/lib/types";

function parseAsNumberedList(value: string | null | undefined): { id: string; label: string }[] | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const keys = Object.keys(parsed).sort((a, b) => {
        const na = parseInt(a, 10);
        const nb = parseInt(b, 10);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        return String(a).localeCompare(String(b));
      });
      return keys.map((k) => ({ id: k, label: String(parsed[k]).trim() })).filter((x) => x.label);
    }
  } catch {
    // Not valid JSON
  }
  return null;
}

type EvaluationState = "idle" | "loading" | "done";

interface CriteriaBlockProps {
  title: string;
  items: { id: string; label: string }[] | null;
  plainFallback: string;
  state: EvaluationState;
  results: AiCriterionResultType[] | null;
  controlId: string;
  emptyMessage: string;
}

function CriteriaBlock({ title, items, plainFallback, state, results, controlId, emptyMessage }: CriteriaBlockProps) {
  const list = items && items.length > 0 ? items : plainFallback ? [{ id: "1", label: plainFallback }] : [];
  if (list.length === 0) return null;

  const resultByKey = results
    ? new Map(results.filter((r) => r.id.startsWith(`${controlId}_`)).map((r) => [r.id.replace(`${controlId}_`, ""), r]))
    : null;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/50 overflow-hidden">
      <div className="px-3 py-1.5 bg-gray-100/80 border-b border-gray-200 flex items-center gap-2">
        <span className="text-[11px] font-bold text-gray-700">{title}</span>
        {state === "loading" && (
          <span className="text-[11px] text-sky-600 font-medium">Waiting for AI…</span>
        )}
        {state === "idle" && (
          <span className="text-[11px] text-gray-500">{emptyMessage}</span>
        )}
      </div>
      <ul className="divide-y divide-gray-100">
        {list.map((item) => {
          const res = resultByKey?.get(item.id);
          const showResult = state === "done" && res !== undefined;
          return (
            <li key={item.id} className="px-3 py-2 flex gap-2.5 items-start">
              <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                {state === "loading" && (
                  <span className="inline-block w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                )}
                {state === "idle" && (
                  <span className="w-4 h-4 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-[9px]">—</span>
                )}
                {showResult && res?.met && (
                  <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs">✓</span>
                )}
                {showResult && res && !res.met && (
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs">✗</span>
                )}
              </span>
              <div className="flex-1 min-w-0">
                <span className={`text-xs ${showResult && !res?.met ? "text-amber-800 font-medium" : "text-gray-700"}`}>
                  {item.label}
                </span>
                {showResult && res && !res.met && res.description && (
                  <p className="text-[11px] text-amber-700 mt-1 bg-amber-50/80 rounded px-2 py-1 border border-amber-100">
                    {res.description}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface ControlSectionProps {
  criteria: ControlCriteria;
  submissionId?: string | null;
  evaluationState: EvaluationState;
  sufficiencyResults: AiCriterionResultType[] | null;
  criteriaResults: AiCriterionResultType[] | null;
  onUploadComplete?: () => void;
  onEnsureSubmission?: () => Promise<string | null>;
  defaultExpanded?: boolean;
}

function ControlSection({
  criteria,
  submissionId,
  evaluationState,
  sufficiencyResults,
  criteriaResults,
  onUploadComplete,
  onEnsureSubmission,
  defaultExpanded = false,
}: ControlSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isMandatory = criteria.ma === "M";

  const suffItems = parseAsNumberedList(criteria.sufficiency_criteria);
  const evalItems = parseAsNumberedList(criteria.evaluation_criteria);
  const hasContent = suffItems || evalItems || criteria.sufficiency_criteria || criteria.evaluation_criteria;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50/50 transition-colors"
      >
        <span
          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium shrink-0"
          style={{
            background: isMandatory ? "#fef3c7" : "#e0f2fe",
            borderColor: isMandatory ? "#f59e0b" : "#7dd3fc",
            color: isMandatory ? "#92400e" : "#0369a1",
          }}
        >
          <span className="font-bold">{criteria.control_id}</span>
          <span className="opacity-60">{criteria.ma}</span>
        </span>
        <span className="flex-1 text-xs font-semibold text-gray-800 truncate">
          {criteria.control_name}
        </span>
        <span className="text-[10px] text-gray-400 uppercase tracking-wider shrink-0">
          {criteria.evidence_type}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && hasContent && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          {(suffItems || criteria.sufficiency_criteria) && (
            <CriteriaBlock
              title="Sufficiency Definition"
              items={suffItems}
              plainFallback={criteria.sufficiency_criteria ?? ""}
              state={evaluationState}
              results={sufficiencyResults}
              controlId={criteria.control_id}
              emptyMessage="Upload evidence & evaluate"
            />
          )}
          {(evalItems || criteria.evaluation_criteria) && (
            <CriteriaBlock
              title="Evaluation Criteria"
              items={evalItems}
              plainFallback={criteria.evaluation_criteria ?? ""}
              state={evaluationState}
              results={criteriaResults}
              controlId={criteria.control_id}
              emptyMessage="AI will evaluate after sufficiency check"
            />
          )}
          <div>
            <div className="text-[11px] font-semibold text-gray-600 mb-1.5">
              Upload evidence for {criteria.control_id}
            </div>
            <FileUploadZone
              submissionId={submissionId}
              label={`Drop files for ${criteria.control_id} — ${criteria.control_name}`}
              onUploadComplete={onUploadComplete}
              onEnsureSubmission={onEnsureSubmission}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export interface PerControlEvidenceProps {
  matrix: ControlCriteria[];
  submissionId?: string | null;
  evaluationState: EvaluationState;
  sufficiencyResults: AiCriterionResultType[] | null;
  criteriaResults: AiCriterionResultType[] | null;
  onUploadComplete?: () => void;
  /** When provided, users can upload directly; submission is created on first upload if needed. */
  onEnsureSubmission?: () => Promise<string | null>;
  /** When provided, selection is controlled by parent (e.g. from clickable control badges above). */
  selectedControlId?: string | null;
  onSelectControl?: (controlId: string | null) => void;
  /** When false, the common evidence upload block is hidden (e.g. when used in tabbed workspace with Common Evidence in another tab). */
  showCommonEvidence?: boolean;
}

export function PerControlEvidence({
  matrix,
  submissionId,
  evaluationState,
  sufficiencyResults,
  criteriaResults,
  onUploadComplete,
  onEnsureSubmission,
  selectedControlId: selectedControlIdProp,
  onSelectControl,
  showCommonEvidence = true,
}: PerControlEvidenceProps) {
  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const isControlled = selectedControlIdProp !== undefined;
  const selectedControlId = isControlled ? selectedControlIdProp ?? null : internalSelected;
  const setSelectedControlId = onSelectControl ?? setInternalSelected;

  if (!matrix || matrix.length === 0) return null;

  const selectedCriteria = selectedControlId
    ? matrix.find((c) => c.control_id === selectedControlId)
    : null;

  return (
    <div className="space-y-4">
      {showCommonEvidence && (
        <div className="card rounded-xl p-4">
          <div className="text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>Common Evidence</div>
          <p className="text-[11px] mb-3" style={{ color: "var(--foreground-muted)" }}>
            Upload evidence files that apply to all controls for this evidence item.
          </p>
          <FileUploadZone
            submissionId={submissionId}
            label="Drop common evidence files here"
            onUploadComplete={onUploadComplete}
            onEnsureSubmission={onEnsureSubmission}
          />
        </div>
      )}

      {/* Per-control: when controlled (e.g. domain page), selection is via badges above — no duplicate section. When uncontrolled (e.g. item page), show heading + chips. */}
      <div className="space-y-3">
        {!isControlled && (
          <>
            <div className="text-xs font-semibold uppercase tracking-wider px-1" style={{ color: "var(--foreground-muted)" }}>
              Per-Control Criteria &amp; Evidence ({matrix.length} control{matrix.length !== 1 ? "s" : ""})
            </div>
            <p className="text-[11px] px-1" style={{ color: "var(--foreground-muted)" }}>
              Click a control to view its criteria and upload evidence for that control.
            </p>
            <div className="sticky top-0 z-10 py-2 -mx-1 px-1 flex flex-wrap gap-2 rounded-xl transition-colors duration-200" style={{ background: "var(--surface)" }}>
              {matrix.map((c) => {
                const isMandatory = c.ma === "M";
                const isSelected = selectedControlId === c.control_id;
                return (
                  <button
                    key={c.control_id}
                    type="button"
                    onClick={() => setSelectedControlId(isSelected ? null : c.control_id)}
                    className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]"
                    style={{
                      background: isSelected ? "var(--primary)" : "var(--background)",
                      borderColor: isSelected ? "var(--primary)" : "var(--border)",
                      color: isSelected ? "#fff" : "var(--foreground)",
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isSelected ? "rgba(255,255,255,0.9)" : "var(--foreground-subtle)" }} aria-hidden />
                    <span className="font-bold">{c.control_id}</span>
                    <span className="opacity-80">{c.ma}</span>
                    <span className="max-w-[140px] truncate text-inherit">{c.control_name}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
        {selectedCriteria ? (
          <div className="pt-1">
            <ControlSection
              key={selectedCriteria.control_id}
              criteria={selectedCriteria}
              submissionId={submissionId}
              evaluationState={evaluationState}
              sufficiencyResults={sufficiencyResults}
              criteriaResults={criteriaResults}
              onUploadComplete={onUploadComplete}
              onEnsureSubmission={onEnsureSubmission}
              defaultExpanded={true}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed px-4 py-8 text-center" style={{ borderColor: "var(--border)", background: "var(--background)" }}>
            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
              Select a control above to view its criteria and upload evidence.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
