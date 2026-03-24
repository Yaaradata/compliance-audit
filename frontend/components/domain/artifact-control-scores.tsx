"use client";

import { useState, useEffect } from "react";
import { getControlLinks } from "@/lib/artifact-registry-api";
import type { ArtifactControlLinkOut } from "@/lib/types";

export interface ArtifactControlScoresProps {
  artifactId: string;
}

function statusColor(status: string): string {
  switch (status) {
    case "sufficient":
      return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
    case "insufficient":
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800";
    case "partial":
      return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
  }
}

function reviewerBadge(status: string): { label: string; cls: string } | null {
  switch (status) {
    case "l1_approved":
      return { label: "L1 ✓", cls: "text-emerald-600 dark:text-emerald-400" };
    case "l1_rejected":
      return { label: "L1 ✗", cls: "text-red-600 dark:text-red-400" };
    case "l2_approved":
      return { label: "L2 ✓", cls: "text-emerald-600 dark:text-emerald-400" };
    case "l2_rejected":
      return { label: "L2 ✗", cls: "text-red-600 dark:text-red-400" };
    case "approved":
      return { label: "Approved", cls: "text-emerald-600 dark:text-emerald-400" };
    default:
      return null;
  }
}

export function ArtifactControlScores({ artifactId }: ArtifactControlScoresProps) {
  const [links, setLinks] = useState<ArtifactControlLinkOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!artifactId) return;
    setLoading(true);
    getControlLinks(artifactId)
      .then(setLinks)
      .catch(() => setLinks([]))
      .finally(() => setLoading(false));
  }, [artifactId]);

  if (loading) {
    return (
      <div className="text-[11px] text-(--foreground-muted) py-2 flex items-center gap-2">
        <span className="inline-block size-3 border-2 border-slate-300 border-t-sky-600 rounded-full animate-spin" />
        Loading control scores…
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="rounded-lg border border-(--border) bg-(--surface) px-3 py-2">
        <div className="text-[11px] text-(--foreground-muted)">
          <span className="font-semibold text-foreground">Per-Control AI Scores</span> — No control scores available yet. Run AI evaluation first.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-(--border) bg-(--surface) overflow-hidden">
      <div className="px-3 py-2 border-b border-(--border) bg-slate-50 dark:bg-background/50">
        <h3 className="text-[11px] font-bold text-foreground uppercase tracking-wide">
          Per-Control AI Scores
        </h3>
      </div>
      <div className="divide-y divide-(--border)">
        {links.map((link) => {
          const pct = link.ai_score != null ? Math.round(link.ai_score * 100) : null;
          const reviewer = reviewerBadge(link.reviewer_status);
          const isExpanded = expandedId === link.link_id;

          return (
            <div key={link.link_id}>
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : link.link_id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-(--muted)/20 transition-colors"
              >
                <span className="text-xs font-semibold text-foreground w-12 shrink-0">
                  {link.control_id}
                </span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${statusColor(link.sufficiency_status)}`}>
                  {link.sufficiency_status}
                </span>
                {pct != null && (
                  <span className="text-[10px] font-mono text-(--foreground-muted)">
                    {pct}%
                  </span>
                )}
                {reviewer && (
                  <span className={`text-[10px] font-semibold ${reviewer.cls}`}>
                    {reviewer.label}
                  </span>
                )}
                <svg
                  className={`ml-auto size-3 text-(--foreground-muted) transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && link.ai_evaluation_json && (
                <div className="px-3 pb-3">
                  <pre className="text-[10px] text-(--foreground-muted) bg-slate-100 dark:bg-slate-800/60 rounded p-2 overflow-x-auto max-h-48 font-mono leading-relaxed whitespace-pre-wrap">
                    {JSON.stringify(link.ai_evaluation_json, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
