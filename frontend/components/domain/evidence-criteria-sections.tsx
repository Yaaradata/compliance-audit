"use client";

export interface EvidenceCriteriaSectionsProps {
  evidenceDescription?: string | null;
}

/**
 * Displays the static Evidence Description block.
 * Per-control sufficiency/evaluation criteria are handled by PerControlEvidence.
 */
export function EvidenceCriteriaSections({
  evidenceDescription,
}: EvidenceCriteriaSectionsProps) {
  if (!evidenceDescription) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Evidence Description
      </div>
      <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
        {evidenceDescription}
      </p>
    </div>
  );
}
