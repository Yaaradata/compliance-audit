"use client";

import { useState, useCallback, useEffect } from "react";
import { stripCriteriaPrefix, shouldShowCriterion } from "@/lib/utils";
import type { AiEvaluationResult as AiEvaluationResultType, AiCriterionResult } from "@/lib/types";

export type EvaluationEditsMap = Record<string, { met: boolean; description: string | null }>;

interface AiEvaluationResultProps {
  result: AiEvaluationResultType | null;
  loading?: boolean;
  placeholder?: boolean;
  onEdit?: (updated: AiEvaluationResultType, edits: EvaluationEditsMap) => void;
  editable?: boolean;
  evaluationEdits?: EvaluationEditsMap;
}

function EditableCriterion({
  criterion,
  onToggle,
  onDescriptionChange,
}: {
  criterion: AiCriterionResult;
  onToggle: () => void;
  onDescriptionChange: (desc: string) => void;
}) {
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState(criterion.description ?? "");

  useEffect(() => {
    setDescDraft(criterion.description ?? "");
  }, [criterion.description]);

  return (
    <div className="flex gap-2 text-xs group">
      <button
        type="button"
        onClick={onToggle}
        className={`shrink-0 w-6 h-6 rounded flex items-center justify-center text-sm font-bold cursor-pointer transition-colors ${
          criterion.met ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-600 hover:bg-red-200"
        }`}
        title={criterion.met ? "Met — click to mark as not met" : "Not met — click to mark as met"}
      >
        {criterion.met ? "✓" : "✗"}
      </button>
      <div className="flex-1 min-w-0">
        <span className="text-gray-700">{stripCriteriaPrefix(criterion.label)}</span>
        {!criterion.met && (
          <div className="mt-1">
            {editingDesc ? (
              <div className="flex gap-1">
                <input
                  type="text"
                  value={descDraft}
                  onChange={(e) => setDescDraft(e.target.value)}
                  onBlur={() => { onDescriptionChange(descDraft); setEditingDesc(false); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { onDescriptionChange(descDraft); setEditingDesc(false); } if (e.key === "Escape") setEditingDesc(false); }}
                  className="flex-1 text-[11px] px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                  autoFocus
                />
              </div>
            ) : (
              <p
                className="text-[11px] text-red-600/90 cursor-pointer hover:underline"
                onClick={() => setEditingDesc(true)}
                title="Click to edit description"
              >
                {criterion.description || "Click to add a description…"}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function AiEvaluationResult({ result, loading, placeholder, onEdit, editable = false, evaluationEdits = {} }: AiEvaluationResultProps) {
  if (loading) {
    return (
      <div className="bg-sky-50 rounded-xl border border-sky-200 p-4">
        <div className="text-xs font-semibold text-sky-800 mb-2">AI Evaluation</div>
        <p className="text-xs text-sky-600">Reading Evidence Description, Sufficiency Definition, Evaluation Criteria and submitted evidence…</p>
        <p className="text-[11px] text-sky-500 mt-2">Evaluating criteria and generating descriptions for any gaps.</p>
      </div>
    );
  }

  if (placeholder) {
    return (
      <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
        <div className="text-xs font-semibold text-amber-800 mb-2">Evaluation results</div>
        <p className="text-xs text-amber-700">
          Fill in evidence and upload files above, then click <strong>Run AI Evaluation</strong>. The AI will compare your submission to the Evidence Description, Sufficiency Definition, and Evaluation Criteria and return:
        </p>
        <ul className="text-[11px] text-amber-800 mt-2 list-disc list-inside space-y-1">
          <li>✓ Tick for each criterion met</li>
          <li>✗ Cross and a short description for any criterion not met</li>
          <li>Per-field feedback when more info is needed</li>
        </ul>
        <p className="text-[11px] text-amber-600 mt-2">Results will appear below after you run evaluation.</p>
      </div>
    );
  }

  if (!result) return null;

  const handleToggle = useCallback((section: "sufficiency_results" | "criteria", id: string) => {
    if (!onEdit || !result) return;
    const updateList = (list: AiCriterionResult[]) =>
      list.map((c) => (c.id === id ? { ...c, met: !c.met } : c));
    const updated = { ...result };
    if (section === "sufficiency_results") {
      updated.sufficiency_results = updateList(updated.sufficiency_results ?? []);
    } else {
      updated.criteria = updateList(updated.criteria ?? []);
    }
    updated.overall_met =
      (updated.sufficiency_results ?? []).every((c) => c.met) &&
      (updated.criteria ?? []).every((c) => c.met);
    const list = section === "sufficiency_results" ? (updated.sufficiency_results ?? []) : (updated.criteria ?? []);
    const criterion = list.find((c) => c.id === id);
    const newEdits = { ...evaluationEdits, [id]: { met: criterion!.met, description: criterion!.description ?? null } };
    onEdit(updated, newEdits);
  }, [onEdit, result, evaluationEdits]);

  const handleDescChange = useCallback((section: "sufficiency_results" | "criteria", id: string, desc: string) => {
    if (!onEdit || !result) return;
    const updateList = (list: AiCriterionResult[]) =>
      list.map((c) => (c.id === id ? { ...c, description: desc || null } : c));
    const updated = { ...result };
    if (section === "sufficiency_results") {
      updated.sufficiency_results = updateList(updated.sufficiency_results ?? []);
    } else {
      updated.criteria = updateList(updated.criteria ?? []);
    }
    const list = section === "sufficiency_results" ? (updated.sufficiency_results ?? []) : (updated.criteria ?? []);
    const criterion = list.find((c) => c.id === id);
    const newEdits = { ...evaluationEdits, [id]: { met: criterion!.met, description: criterion!.description ?? null } };
    onEdit(updated, newEdits);
  }, [onEdit, result, evaluationEdits]);

  const visibleSufficiency = (result.sufficiency_results ?? []).filter((c) => shouldShowCriterion(c.label));
  const visibleCriteria = result.criteria.filter((c) => shouldShowCriterion(c.label));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-700">AI Evaluation Result</span>
        <div className="flex items-center gap-2">
          {editable && (
            <span className="text-[10px] text-blue-500 font-medium">Click ✓/✗ to edit</span>
          )}
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${result.overall_met ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
            {result.overall_met ? "Requirements met" : "Gaps identified"}
          </span>
        </div>
      </div>
      {result.summary && (
        <p className="text-xs text-gray-600 mb-3">{result.summary}</p>
      )}

      {!result.overall_met && result.remediation && result.remediation.trim() && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50/80 p-3">
          <h4 className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-2">
            What’s required to make it correct
          </h4>
          <div className="text-xs text-amber-900 whitespace-pre-wrap">{result.remediation.trim()}</div>
        </div>
      )}

      {visibleSufficiency.length > 0 && (
        <div className="mb-4">
          <h4 className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">Sufficiency Definition</h4>
          <div className="space-y-2">
            {visibleSufficiency.map((c) =>
              editable ? (
                <EditableCriterion
                  key={c.id}
                  criterion={c}
                  onToggle={() => handleToggle("sufficiency_results", c.id)}
                  onDescriptionChange={(desc) => handleDescChange("sufficiency_results", c.id, desc)}
                />
              ) : (
                <div key={c.id} className="flex gap-2 text-xs">
                  <span className={`shrink-0 w-5 h-5 rounded flex items-center justify-center text-sm font-bold ${c.met ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`} title={c.met ? "Met" : "Not met"}>
                    {c.met ? "✓" : "✗"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-gray-700">{stripCriteriaPrefix(c.label)}</span>
                    {!c.met && c.description && <p className="text-[11px] text-red-600/90 mt-1">{c.description}</p>}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      <div>
        <h4 className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">Evaluation Criteria</h4>
        <div className="space-y-2">
          {visibleCriteria.map((c) =>
            editable ? (
              <EditableCriterion
                key={c.id}
                criterion={c}
                onToggle={() => handleToggle("criteria", c.id)}
                onDescriptionChange={(desc) => handleDescChange("criteria", c.id, desc)}
              />
            ) : (
              <div key={c.id} className="flex gap-2 text-xs">
                <span className={`shrink-0 w-5 h-5 rounded flex items-center justify-center text-sm font-bold ${c.met ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`} title={c.met ? "Met" : "Not met"}>
                  {c.met ? "✓" : "✗"}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-gray-700">{stripCriteriaPrefix(c.label)}</span>
                  {!c.met && c.description && <p className="text-[11px] text-red-600/90 mt-1">{c.description}</p>}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
