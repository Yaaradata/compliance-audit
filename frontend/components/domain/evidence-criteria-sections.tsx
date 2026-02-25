"use client";

/**
 * Parses a value that may be JSON (e.g. {"1": "...", "2": "..."}) or plain text.
 * Returns an array of { id, label } for list rendering, or null if plain text (single item).
 */
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

/** Single result from AI: met (tick) or not met (optional description). */
export interface AiCriterionResult {
  id: string;
  label: string;
  met: boolean;
  description?: string | null;
}

type EvaluationState = "idle" | "loading" | "done";

export interface EvidenceCriteriaSectionsProps {
  evidenceDescription?: string | null;
  sufficiencyDefinition?: string | null;
  evaluationCriteria?: string | null;
  /** After user clicks Evaluate: "loading" then "done". "idle" = not yet evaluated. */
  evaluationState?: EvaluationState;
  /** Results for Sufficiency Definition (keyed by id from reference data). */
  sufficiencyResults?: AiCriterionResult[] | null;
  /** Results for Evaluation Criteria (keyed by id); description = what's missing when not met. */
  criteriaResults?: AiCriterionResult[] | null;
}

function EvidenceDescriptionBlock({
  evidenceDescription,
  items,
  plainFallback,
}: {
  evidenceDescription: string;
  items: { id: string; label: string }[] | null;
  plainFallback: string;
}) {
  if (items && items.length > 0) {
    return (
      <ol className="text-xs text-gray-600 leading-relaxed list-decimal list-inside space-y-1">
        {items.map((item) => (
          <li key={item.id} className="pl-1">
            {item.label}
          </li>
        ))}
      </ol>
    );
  }
  return <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{plainFallback}</p>;
}

function SufficiencyOrCriteriaBlock({
  title,
  items,
  plainFallback,
  state,
  results,
  emptyMessage,
}: {
  title: string;
  items: { id: string; label: string }[] | null;
  plainFallback: string;
  state: EvaluationState;
  results: AiCriterionResult[] | null;
  emptyMessage: string;
}) {
  const list = items && items.length > 0 ? items : [{ id: "1", label: plainFallback }];
  const resultByKey = results ? new Map(results.map((r) => [r.id, r])) : null;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/50 overflow-hidden">
      <div className="px-3 py-2 bg-gray-100/80 border-b border-gray-200">
        <span className="text-[11px] font-bold text-gray-700">{title}</span>
        {state === "loading" && (
          <span className="ml-2 text-[11px] text-sky-600 font-medium">Waiting for AI response…</span>
        )}
        {state === "idle" && (
          <span className="ml-2 text-[11px] text-gray-500">{emptyMessage}</span>
        )}
      </div>
      <ul className="divide-y divide-gray-100">
        {list.map((item) => {
          const res = resultByKey?.get(item.id);
          const showResult = state === "done" && res !== undefined;
          return (
            <li key={item.id} className="px-3 py-2.5 flex gap-3 items-start">
              {/* Status icon */}
              <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                {state === "loading" && (
                  <span className="inline-block w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                )}
                {state === "idle" && (
                  <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-[10px]" title="Not yet evaluated">
                    —
                  </span>
                )}
                {showResult && res?.met && (
                  <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center" title="Met">
                    ✓
                  </span>
                )}
                {showResult && res && !res.met && (
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center" title="Not met">
                    ✗
                  </span>
                )}
              </span>
              <div className="flex-1 min-w-0">
                <span className={`text-xs ${showResult && !res?.met ? "text-amber-800 font-medium" : "text-gray-700"}`}>
                  {item.label}
                </span>
                {showResult && res && !res.met && res.description && (
                  <p className="text-[11px] text-amber-700 mt-1 pl-0 bg-amber-50/80 rounded px-2 py-1.5 border border-amber-100">
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

/**
 * Displays Evidence Description (static) plus two evaluable blocks:
 * - Sufficiency Definition: requirements for evidence; once user uploads and runs Evaluate, each item shows tick (met) or cross (not met).
 * - Evaluation Criteria: reviewer checks; AI returns tick or cross + what's missing.
 * States: idle (waiting for AI), loading (evaluating), done (show results).
 */
export function EvidenceCriteriaSections({
  evidenceDescription,
  sufficiencyDefinition,
  evaluationCriteria,
  evaluationState = "idle",
  sufficiencyResults = null,
  criteriaResults = null,
}: EvidenceCriteriaSectionsProps) {
  const hasAny = evidenceDescription || sufficiencyDefinition || evaluationCriteria;
  if (!hasAny) return null;

  const evDescItems = parseAsNumberedList(evidenceDescription ?? null);
  const suffItems = parseAsNumberedList(sufficiencyDefinition ?? null);
  const evalItems = parseAsNumberedList(evaluationCriteria ?? null);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Evidence requirements (from reference data)
      </div>
      {evidenceDescription && (
        <div>
          <div className="text-[11px] font-bold text-gray-700 mb-1">Evidence Description</div>
          <EvidenceDescriptionBlock
            evidenceDescription={evidenceDescription}
            items={evDescItems}
            plainFallback={evidenceDescription}
          />
        </div>
      )}
      {sufficiencyDefinition && (
        <div>
          <div className="text-[11px] font-bold text-gray-700 mb-1">Sufficiency Definition (Summary)</div>
          <p className="text-[11px] text-gray-500 mb-2">Requirements that must be present in the evidence for it to be evaluated. After you upload evidence and run Evaluate, each item will show ✓ when met or ✗ when missing.</p>
          <SufficiencyOrCriteriaBlock
            title="Sufficiency"
            items={suffItems}
            plainFallback={sufficiencyDefinition}
            state={evaluationState}
            results={sufficiencyResults}
            emptyMessage="Upload evidence and click Evaluate to see if each requirement is met."
          />
        </div>
      )}
      {evaluationCriteria && (
        <div>
          <div className="text-[11px] font-bold text-gray-700 mb-1">Evaluation Criteria</div>
          <p className="text-[11px] text-gray-500 mb-2">Reviewer checks applied after sufficiency. When not met, the AI will indicate what is missing.</p>
          <SufficiencyOrCriteriaBlock
            title="Evaluation"
            items={evalItems}
            plainFallback={evaluationCriteria}
            state={evaluationState}
            results={criteriaResults}
            emptyMessage="After sufficiency is checked, AI will evaluate against these criteria and show what's missing if not met."
          />
        </div>
      )}
    </div>
  );
}
