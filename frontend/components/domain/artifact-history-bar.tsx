"use client";

import { useState, useEffect } from "react";
import { getVersions, getAuditTrail } from "@/lib/artifact-registry-api";
import type { ArtifactOut, AuditTrailOut } from "@/lib/types";

export interface ArtifactHistoryBarProps {
  artifactId: string;
}

function statusLabel(status: string): string {
  switch (status) {
    case "draft": return "Draft";
    case "ai_evaluated": return "AI Evaluated";
    case "submitted": return "Submitted";
    case "l1_approved": return "L1 Approved";
    case "l1_rejected": return "L1 Rejected";
    case "l2_approved": return "L2 Approved";
    case "l2_rejected": return "L2 Rejected";
    case "approved": return "Approved";
    default: return status;
  }
}

function statusPillColor(status: string, isCurrent: boolean): string {
  if (isCurrent) {
    switch (status) {
      case "approved":
      case "l2_approved":
        return "bg-emerald-600 text-white";
      case "l1_rejected":
      case "l2_rejected":
        return "bg-red-600 text-white";
      case "submitted":
      case "l1_approved":
        return "bg-sky-600 text-white";
      case "ai_evaluated":
        return "bg-violet-600 text-white";
      default:
        return "bg-slate-700 text-white dark:bg-slate-300 dark:text-slate-900";
    }
  }
  return "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600";
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export function ArtifactHistoryBar({ artifactId }: ArtifactHistoryBarProps) {
  const [versions, setVersions] = useState<ArtifactOut[]>([]);
  const [trail, setTrail] = useState<AuditTrailOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTimeline, setShowTimeline] = useState(false);
  const [viewingVersion, setViewingVersion] = useState<ArtifactOut | null>(null);

  useEffect(() => {
    if (!artifactId) return;
    setLoading(true);
    setViewingVersion(null);
    Promise.all([
      getVersions(artifactId).catch(() => []),
      getAuditTrail(artifactId).catch(() => []),
    ]).then(([v, t]) => {
      setVersions(v);
      setTrail(t);
    }).finally(() => setLoading(false));
  }, [artifactId]);

  if (loading || versions.length === 0) return null;

  const currentVersion = versions[versions.length - 1];

  return (
    <div className="rounded-lg border border-(--border) bg-(--surface) mb-3 overflow-hidden">
      <div className="px-3 py-2 flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-bold text-(--foreground-muted) uppercase tracking-wide shrink-0">
          History
        </span>

        <div className="flex items-center gap-1 flex-wrap">
          {versions.map((v) => {
            const isCurrent = v.artifact_id === currentVersion?.artifact_id;
            return (
              <button
                key={v.artifact_id}
                type="button"
                onClick={() => {
                  if (isCurrent) {
                    setViewingVersion(null);
                  } else {
                    setViewingVersion(v);
                  }
                }}
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${statusPillColor(v.status, isCurrent || viewingVersion?.artifact_id === v.artifact_id)}`}
              >
                v{v.version} ({statusLabel(v.status)})
              </button>
            );
          })}
        </div>

        {trail.length > 0 && (
          <button
            type="button"
            onClick={() => setShowTimeline((s) => !s)}
            className="ml-auto text-[10px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {showTimeline ? "Hide timeline" : "Show timeline"}
          </button>
        )}
      </div>

      {viewingVersion && (
        <div className="px-3 pb-3 border-t border-(--border)">
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold text-(--foreground-muted)">
              Viewing v{viewingVersion.version} — {statusLabel(viewingVersion.status)} (read-only)
            </p>
            <button
              type="button"
              onClick={() => setViewingVersion(null)}
              className="text-[10px] font-medium text-red-600 dark:text-red-400 hover:underline"
            >
              Close
            </button>
          </div>
          {viewingVersion.form_data_json && Object.keys(viewingVersion.form_data_json).length > 0 ? (
            <div className="mt-2 rounded-md bg-slate-100 dark:bg-slate-800/50 border border-(--border) p-2 max-h-48 overflow-y-auto">
              {Object.entries(viewingVersion.form_data_json).map(([k, v]) => (
                <div key={k} className="mb-1 last:mb-0">
                  <span className="text-[10px] font-semibold text-(--foreground-muted)">{k}:</span>{" "}
                  <span className="text-[10px] text-foreground">{String(v ?? "")}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[10px] text-(--foreground-muted)">No form data for this version.</p>
          )}
        </div>
      )}

      {showTimeline && trail.length > 0 && (
        <div className="px-3 pb-3 border-t border-(--border)">
          <div className="mt-2 space-y-1.5">
            {trail.map((t) => (
              <div key={t.trail_id} className="flex items-start gap-2">
                <div className="shrink-0 mt-1 size-1.5 rounded-full bg-indigo-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-foreground font-medium">
                    {t.action}
                    {t.from_status && t.to_status && (
                      <span className="text-(--foreground-muted)"> ({statusLabel(t.from_status)} → {statusLabel(t.to_status)})</span>
                    )}
                  </p>
                  <p className="text-[10px] text-(--foreground-muted)">
                    {formatDate(t.performed_at)}
                    {t.comment && <> &middot; {t.comment}</>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
