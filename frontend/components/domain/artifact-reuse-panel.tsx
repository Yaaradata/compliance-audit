"use client";

import { useState, useEffect, useCallback } from "react";
import { getReuseCandidates, executeReuse } from "@/lib/artifact-registry-api";
import type { ReuseCandidateOut } from "@/lib/types";

export interface ArtifactReusePanelProps {
  cycleId: string;
  evidenceItemId: string;
  frameworkSchema: string;
  cscfVersion: string;
  onApplyReuse: (formData: Record<string, string>) => void;
  onClearReuse: () => void;
  disabled?: boolean;
}

function ControlChip({ controlId }: { controlId: string }) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border border-slate-200 bg-white text-slate-800 shadow-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100">
      {controlId}
    </span>
  );
}

export function ArtifactReusePanel({
  cycleId,
  evidenceItemId,
  frameworkSchema,
  cscfVersion,
  onApplyReuse,
  onClearReuse,
  disabled,
}: ArtifactReusePanelProps) {
  const [candidates, setCandidates] = useState<ReuseCandidateOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconfirmNote, setReconfirmNote] = useState("");
  const [expanded, setExpanded] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const fetchCandidates = useCallback(async () => {
    if (!cycleId || !evidenceItemId || !frameworkSchema || !cscfVersion) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getReuseCandidates(evidenceItemId, cycleId, frameworkSchema, cscfVersion);
      setCandidates(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load reuse candidates";
      if (!msg.includes("404")) setError(msg);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [cycleId, evidenceItemId, frameworkSchema, cscfVersion]);

  useEffect(() => {
    setApplied(false);
    setConfirmingId(null);
    setReconfirmNote("");
    fetchCandidates();
  }, [fetchCandidates]);

  const handleApply = useCallback(async (candidate: ReuseCandidateOut) => {
    if (candidate.requires_reconfirmation && !reconfirmNote.trim()) return;
    setApplying(true);
    setError(null);
    try {
      const artifact = await executeReuse(
        candidate.artifact_id,
        cycleId,
        candidate.requires_reconfirmation ? reconfirmNote.trim() : undefined
      );
      const fd = artifact.form_data_json ?? {};
      const stringFd: Record<string, string> = {};
      for (const [k, v] of Object.entries(fd)) {
        stringFd[k] = String(v ?? "");
      }
      onApplyReuse(stringFd);
      setApplied(true);
      setConfirmingId(null);
      setReconfirmNote("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to apply reuse");
    } finally {
      setApplying(false);
    }
  }, [cycleId, reconfirmNote, onApplyReuse]);

  const handleClear = useCallback(() => {
    onClearReuse();
    setApplied(false);
  }, [onClearReuse]);

  if (loading) {
    return (
      <div className="rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/20 px-3 py-2 mb-3">
        <div className="flex items-center gap-2 text-xs text-sky-700 dark:text-sky-300">
          <span className="inline-block size-3 border-2 border-sky-300 border-t-sky-600 rounded-full animate-spin" />
          Checking for reusable evidence…
        </div>
      </div>
    );
  }

  if (candidates.length === 0 && !error) {
    return (
      <div className="rounded-lg border border-(--border) bg-(--surface) px-3 py-2.5 mb-3">
        <div className="flex items-center gap-2 text-[11px] text-(--foreground-muted)">
          <svg className="size-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>
            <span className="font-semibold text-foreground">Artifact Reuse</span>
            {" — "}
            No reusable evidence found from prior cycles for this item.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-(--border) bg-(--surface) mb-3 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-[11px] font-semibold text-foreground hover:bg-(--muted)/40 transition-colors"
      >
        <span className="flex items-center gap-2">
          <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reuse from prior cycles ({candidates.length})
        </span>
        <svg className={`size-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          {applied && (
            <div className="flex items-center justify-between rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-3 py-2">
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                Reused evidence applied. Review and edit as needed.
              </span>
              <button
                type="button"
                onClick={handleClear}
                disabled={disabled}
                className="text-[10px] font-semibold text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
              >
                Clear reused data
              </button>
            </div>
          )}

          {error && (
            <p className="text-[11px] text-red-600 dark:text-red-400">{error}</p>
          )}

          {candidates.map((c) => (
            <div
              key={c.artifact_id}
              className={`rounded-md border p-2.5 transition-colors ${
                c.eligible
                  ? "border-(--border) bg-background hover:bg-(--muted)/20"
                  : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate">{c.title}</p>
                  <p className="text-[10px] text-(--foreground-muted) mt-0.5">
                    {c.cscf_version} &middot; {c.evidence_item_id} &middot; v{c.version} &middot; {c.age_days}d ago &middot; {c.status}
                  </p>
                </div>
                {c.eligible && !applied && (
                  <>
                    {confirmingId === c.artifact_id && c.requires_reconfirmation ? (
                      <button
                        type="button"
                        onClick={() => handleApply(c)}
                        disabled={disabled || applying || !reconfirmNote.trim()}
                        className="shrink-0 px-2.5 py-1 text-[10px] font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                      >
                        {applying ? "Applying…" : "Confirm"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (c.requires_reconfirmation) {
                            setConfirmingId(c.artifact_id);
                          } else {
                            handleApply(c);
                          }
                        }}
                        disabled={disabled || applying}
                        className="shrink-0 px-2.5 py-1 text-[10px] font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                      >
                        {applying ? "Applying…" : "Use this evidence"}
                      </button>
                    )}
                  </>
                )}
                {!c.eligible && (
                  <span className="shrink-0 px-2 py-0.5 text-[10px] font-medium rounded bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                    Not eligible
                  </span>
                )}
              </div>

              {confirmingId === c.artifact_id && c.requires_reconfirmation && (
                <div className="mt-2">
                  <label className="block text-[10px] font-medium text-(--foreground-muted) mb-1">
                    Reconfirmation note (required)
                  </label>
                  <input
                    type="text"
                    value={reconfirmNote}
                    onChange={(e) => setReconfirmNote(e.target.value)}
                    placeholder="Confirm this evidence is still valid for the new cycle…"
                    className="w-full px-2 py-1.5 text-xs rounded-md border border-(--border) bg-background text-foreground placeholder:text-(--foreground-muted)/50 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                  />
                </div>
              )}

              {c.warnings.length > 0 && (
                <div className="mt-1.5 space-y-0.5">
                  {c.warnings.map((w, i) => (
                    <p key={i} className="text-[10px] text-amber-600 dark:text-amber-400 flex items-start gap-1">
                      <span className="shrink-0 mt-px">⚠</span> {w}
                    </p>
                  ))}
                </div>
              )}

              {Object.keys(c.prior_scores).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {Object.keys(c.prior_scores).map((ctrlId) => (
                    <ControlChip key={ctrlId} controlId={ctrlId} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
