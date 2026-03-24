"use client";

import { useState, useEffect } from "react";
import { getArtifactCrossChecks } from "@/lib/artifact-registry-api";
import type { CrossCheckOut } from "@/lib/types";

export interface ArtifactCrossChecksProps {
  artifactId: string;
}

function statusIcon(status: string) {
  switch (status) {
    case "resolved":
    case "passed":
      return <span className="text-emerald-600 dark:text-emerald-400">✓</span>;
    case "failed":
      return <span className="text-red-600 dark:text-red-400">✗</span>;
    default:
      return <span className="text-amber-500 dark:text-amber-400">●</span>;
  }
}

export function ArtifactCrossChecks({ artifactId }: ArtifactCrossChecksProps) {
  const [checks, setChecks] = useState<CrossCheckOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!artifactId) return;
    setLoading(true);
    getArtifactCrossChecks(artifactId)
      .then(setChecks)
      .catch(() => setChecks([]))
      .finally(() => setLoading(false));
  }, [artifactId]);

  if (loading) {
    return (
      <div className="text-[11px] text-(--foreground-muted) py-2 flex items-center gap-2">
        <span className="inline-block size-3 border-2 border-slate-300 border-t-sky-600 rounded-full animate-spin" />
        Loading cross-checks…
      </div>
    );
  }

  if (checks.length === 0) {
    return (
      <div className="rounded-lg border border-(--border) bg-(--surface) px-3 py-2">
        <div className="text-[11px] text-(--foreground-muted)">
          <span className="font-semibold text-foreground">Cross-Checks</span> — No cross-checks available yet for this artifact.
        </div>
      </div>
    );
  }

  const passed = checks.filter((c) => c.status === "resolved" || c.status === "passed").length;
  const pending = checks.filter((c) => c.status === "pending").length;

  return (
    <div className="rounded-lg border border-(--border) bg-(--surface) overflow-hidden">
      <div className="px-3 py-2 border-b border-(--border) bg-slate-50 dark:bg-background/50 flex items-center justify-between">
        <h3 className="text-[11px] font-bold text-foreground uppercase tracking-wide">
          Cross-Checks
        </h3>
        <span className="text-[10px] text-(--foreground-muted) font-medium">
          {passed}/{checks.length} passed{pending > 0 ? ` · ${pending} pending` : ""}
        </span>
      </div>
      <div className="divide-y divide-(--border)">
        {checks.map((check) => {
          const isExpanded = expandedId === check.cross_check_id;
          return (
            <div key={check.cross_check_id}>
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : check.cross_check_id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-(--muted)/20 transition-colors"
              >
                <span className="shrink-0 text-xs">{statusIcon(check.status)}</span>
                <span className="flex-1 min-w-0 text-xs text-foreground truncate">
                  {check.source_control_id}: {check.source_evidence_item} → {check.target_evidence_item}
                </span>
                <span className="shrink-0 text-[10px] text-(--foreground-muted) capitalize">
                  {check.status}
                </span>
                <svg
                  className={`size-3 text-(--foreground-muted) transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isExpanded && (
                <div className="px-3 pb-2.5 space-y-1">
                  <p className="text-[11px] text-(--foreground-muted) leading-relaxed">
                    {check.check_description}
                  </p>
                  {check.status === "pending" && !check.target_artifact_id && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400">
                      Waiting for evidence on {check.target_evidence_item}
                    </p>
                  )}
                  {check.resolution_detail && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                      {check.resolution_detail}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
