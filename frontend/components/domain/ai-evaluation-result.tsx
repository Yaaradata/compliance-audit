"use client";

import { stripCriteriaPrefix, shouldShowCriterion } from "@/lib/utils";
import type { AiEvaluationResult as AiEvaluationResultType } from "@/lib/types";

interface AiEvaluationResultProps {
  result: AiEvaluationResultType | null;
  loading?: boolean;
  placeholder?: boolean;
}

/**
 * Displays AI evaluation result: criteria with tick (met) or cross + description (not met).
 * Placeholder when AI is not yet integrated.
 */
export function AiEvaluationResult({ result, loading, placeholder }: AiEvaluationResultProps) {
  if (loading) {
    return (
      <div className="bg-sky-50 rounded-xl border border-sky-200 p-4">
        <div className="text-xs font-semibold text-sky-800 mb-2">🤖 AI Evaluation</div>
        <p className="text-xs text-sky-600">Reading Evidence Description, Sufficiency Definition, Evaluation Criteria and submitted evidence…</p>
        <p className="text-[11px] text-sky-500 mt-2">Evaluating criteria and generating descriptions for any gaps.</p>
      </div>
    );
  }

  if (placeholder) {
    return (
      <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
        <div className="text-xs font-semibold text-amber-800 mb-2">🤖 Evaluation results</div>
        <p className="text-xs text-amber-700">
          Fill in evidence and upload files in the <strong>Common Evidence</strong> tab, then click <strong>Evaluate Evidence</strong> there. The AI will compare your submission to the Evidence Description, Sufficiency Definition, and Evaluation Criteria and return:
        </p>
        <ul className="text-[11px] text-amber-800 mt-2 list-disc list-inside space-y-1">
          <li>✓ Tick for each criterion met</li>
          <li>✗ Cross and a short description for any criterion not met</li>
        </ul>
        <p className="text-[11px] text-amber-600 mt-2">Results will appear in this tab after you run evaluation.</p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-700">🤖 AI Evaluation Result</span>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${result.overall_met ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
          {result.overall_met ? "Requirements met" : "Gaps identified"}
        </span>
      </div>
      {result.summary && (
        <p className="text-xs text-gray-600 mb-3">{result.summary}</p>
      )}
      <div className="space-y-2">
        {result.criteria
          .filter((c) => shouldShowCriterion(c.label))
          .map((c) => (
            <div key={c.id} className="flex gap-2 text-xs">
              <span
                className={`shrink-0 w-5 h-5 rounded flex items-center justify-center text-sm font-bold ${
                  c.met ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                }`}
                title={c.met ? "Met" : "Not met"}
              >
                {c.met ? "✓" : "✗"}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-gray-700">{stripCriteriaPrefix(c.label)}</span>
                {!c.met && c.description && (
                  <p className="text-[11px] text-red-600/90 mt-1">{c.description}</p>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
