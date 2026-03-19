"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronRight, Activity, FileCheck, Layers, Target } from "lucide-react";
import {
  getControl,
  getControlsCoverageItems,
  getEvidenceContent,
  fetchAwsEvidence,
  getRuns,
  getEvidence,
  getControlsCoverage,
  type AwsControlItemWithEvidence,
  type AwsControlDetail,
  type AwsEvidenceByRun,
} from "@/lib/aws-api";
import { AwsEvidenceContentModal } from "./aws-evidence-content-modal";
import { AwsKpiCard } from "./aws-kpi-cards";
import { AwsPageHeader, awsButtonSecondaryClass } from "./aws-page-header";

const AWS_SERVICE_COLORS: Record<string, { bg: string; text: string }> = {
  ec2: { bg: "bg-orange-500/15", text: "text-orange-600 dark:text-orange-400" },
  iam: { bg: "bg-amber-500/15", text: "text-amber-700 dark:text-amber-400" },
  ssm: { bg: "bg-emerald-500/15", text: "text-emerald-700 dark:text-emerald-400" },
  rds: { bg: "bg-sky-500/15", text: "text-sky-600 dark:text-sky-400" },
  kms: { bg: "bg-violet-500/15", text: "text-violet-600 dark:text-violet-400" },
  cloudtrail: { bg: "bg-rose-500/15", text: "text-rose-600 dark:text-rose-400" },
  backup: { bg: "bg-teal-500/15", text: "text-teal-600 dark:text-teal-400" },
  inspector: { bg: "bg-indigo-500/15", text: "text-indigo-600 dark:text-indigo-400" },
  guardduty: { bg: "bg-cyan-500/15", text: "text-cyan-600 dark:text-cyan-400" },
  logs: { bg: "bg-slate-500/15", text: "text-slate-600 dark:text-slate-400" },
  config: { bg: "bg-blue-500/15", text: "text-blue-600 dark:text-blue-400" },
  elbv2: { bg: "bg-orange-400/15", text: "text-orange-600 dark:text-orange-400" },
  wafv2: { bg: "bg-red-500/15", text: "text-red-600 dark:text-red-400" },
  acm: { bg: "bg-lime-500/15", text: "text-lime-700 dark:text-lime-400" },
  secretsmanager: { bg: "bg-fuchsia-500/15", text: "text-fuchsia-600 dark:text-fuchsia-400" },
};

function getAwsServiceFromApi(api: string): string {
  const match = api.match(/^([a-z0-9-]+):/i);
  return (match?.[1] ?? "other").toLowerCase();
}

function AwsApiTag({ api }: { api: string }) {
  const service = getAwsServiceFromApi(api);
  const style = AWS_SERVICE_COLORS[service] ?? { bg: "bg-[var(--muted)]", text: "text-[var(--foreground-muted)]" };
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 font-mono text-xs font-medium ${style.bg} ${style.text}`}
      style={{ borderColor: "var(--border)" }}
    >
      {api}
    </span>
  );
}

export function AwsControlView() {
  const params = useParams();
  const searchParams = useSearchParams();
  const controlId = params?.controlId as string | undefined;
  const itemCode = searchParams?.get("item")?.trim() || undefined;

  const [controlItems, setControlItems] = useState<AwsControlItemWithEvidence[]>([]);
  const [selectedControl, setSelectedControl] = useState<AwsControlDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [contentModal, setContentModal] = useState<{ content?: unknown; error?: string } | null>(null);
  const [contentLoading, setContentLoading] = useState(false);

  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [kpis, setKpis] = useState({ runsCount: 0, evidenceCount: 0, controlsWithEvidence: 0 });
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set(["A"]));
  const [selectedRunIndex, setSelectedRunIndex] = useState(0);

  useEffect(() => {
    Promise.all([getRuns(50), getEvidence(500).then((r) => r.length), getControlsCoverage()])
      .then(([runs, evidenceCount, coverage]) => {
        setKpis({
          runsCount: runs?.length ?? 0,
          evidenceCount,
          controlsWithEvidence: coverage?.control_ids_with_evidence?.length ?? 0,
        });
      })
      .catch(() => {});
  }, []);

  const toggleDomain = (domain: string) => {
    setExpandedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  };

  useEffect(() => {
    setError(null);
    getControlsCoverageItems()
      .then((data) => {
        setControlItems(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch((e: Error & { status?: number }) => {
        const msg = e?.message ?? "Failed to load control list";
        setError(msg);
        setControlItems([]);
      });
  }, []);

  useEffect(() => {
    if (!controlId) {
      setSelectedControl(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setSelectedRunIndex(0);
    getControl(controlId, itemCode)
      .then(setSelectedControl)
      .catch(() => setSelectedControl(null))
      .finally(() => setLoading(false));
  }, [controlId, itemCode]);


  useEffect(() => {
    const onCollectionComplete = () => {
      getControlsCoverageItems().then(setControlItems);
      if (controlId) {
        getControl(controlId, itemCode).then(setSelectedControl);
      }
      Promise.all([getRuns(50), getEvidence(500).then((r) => r.length), getControlsCoverage()]).then(
        ([runs, evidenceCount, coverage]) => {
          setKpis({
            runsCount: runs?.length ?? 0,
            evidenceCount,
            controlsWithEvidence: coverage?.control_ids_with_evidence?.length ?? 0,
          });
        }
      ).catch(() => {});
    };
    window.addEventListener("aws-collection-completed", onCollectionComplete);
    return () => window.removeEventListener("aws-collection-completed", onCollectionComplete);
  }, [controlId, itemCode]);

  const refreshControl = useCallback(() => {
    if (!controlId) return;
    getControl(controlId, itemCode).then(setSelectedControl);
    getControlsCoverageItems().then(setControlItems);
  }, [controlId, itemCode]);

  const handleFetchAwsEvidence = () => {
    setFetchError(null);
    setFetching(true);
    fetchAwsEvidence()
      .then(() => refreshControl())
      .catch((e: Error & { detail?: unknown }) => {
        const msg = typeof e.detail === "string" ? e.detail : e.message;
        setFetchError(msg);
      })
      .finally(() => setFetching(false));
  };

  const handleViewContent = (evidenceId: string) => {
    setContentLoading(true);
    getEvidenceContent(evidenceId)
      .then((content) => setContentModal({ content }))
      .catch((err) => setContentModal({ error: err.message }))
      .finally(() => setContentLoading(false));
  };

  if (loading && controlId) {
    return <div className="py-8 text-center text-[var(--foreground-muted)]">Loading…</div>;
  }

  const showControlsError = error && controlItems.length === 0;
  const evidenceByRun = selectedControl?.evidence_by_run ?? [];

  // Group control items (one per control_id + item_code with evidence) by domain from item_code. Clicking A2 shows only A2 evidence.
  const controlsByDomain: Record<string, AwsControlItemWithEvidence[]> = {};
  for (const c of controlItems) {
    const item = (c.item_code || "").trim();
    const letter = item ? item[0]?.toUpperCase() : "Other";
    const domainKey = /[A-H]/.test(letter) ? letter : "Other";
    if (!controlsByDomain[domainKey]) controlsByDomain[domainKey] = [];
    controlsByDomain[domainKey].push(c);
  }
  const orderedDomains: string[] = [];
  "ABCDEFGH".split("").forEach((d) => {
    if (controlsByDomain[d]?.length) orderedDomains.push(d);
  });
  if (controlsByDomain["Other"]?.length) orderedDomains.push("Other");

  const domainCount = orderedDomains.length;
  for (const d of orderedDomains) {
    const list = controlsByDomain[d] ?? [];
    list.sort((a, b) => {
      const c = (a.control_id || "").localeCompare(b.control_id || "");
      if (c !== 0) return c;
      return (a.item_code || "").localeCompare(b.item_code || "");
    });
  }

  return (
    <div className="w-full flex flex-col min-h-0">
      <AwsPageHeader
        title="Controls"
        subtitle="SWIFT controls by domain (A–H). Select a control to see required items, AWS evidence, and compare runs."
      >
        <Link
          href="/aws/dashboard"
          className={awsButtonSecondaryClass}
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
        >
          ← Back to Dashboard
        </Link>
      </AwsPageHeader>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        <AwsKpiCard icon={Target} value={controlItems.length} label="Control items with evidence" variant="controls" />
        <AwsKpiCard icon={Layers} value={domainCount} label="Domains" variant="default" />
        <AwsKpiCard icon={Activity} value={kpis.runsCount} label="Collector runs" variant="default" />
        <AwsKpiCard icon={FileCheck} value={kpis.evidenceCount} label="Evidence items" variant="evidence" />
      </div>

      {showControlsError && (
        <div
          className="rounded-lg border px-4 py-3 text-sm mb-4"
          style={{ borderColor: "var(--warning)", background: "var(--warning-bg)", color: "var(--warning)" }}
        >
          <strong>Controls list could not be loaded.</strong> {error}. Ensure the backend is running and the AWS evidence
          database is set up.
        </div>
      )}

      <div className="flex-1 grid gap-4 lg:grid-cols-[minmax(0,320px)_1fr] min-h-0">
        <aside className="card rounded-xl overflow-hidden flex flex-col min-h-[420px]">
          <div className="p-4 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                Control list by domain
              </span>
              {controlItems.length > 0 && (
                <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: "var(--muted)", color: "var(--foreground-muted)" }}>
                  {controlItems.length} with evidence
                </span>
              )}
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--foreground-muted)" }}>
              Expand a domain to select a control. Item codes (A2, B3…) map to evidence items.
            </p>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-1">
            {orderedDomains.map((domain) => {
              const list = controlsByDomain[domain] || [];
              const isExpanded = expandedDomains.has(domain);
              return (
                <div key={domain} className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
                  <button
                    type="button"
                    onClick={() => toggleDomain(domain)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-medium transition"
                    style={{ color: "var(--foreground)", background: "var(--muted)" }}
                  >
                    <span className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                      Domain {domain}
                    </span>
                    <span className="text-xs font-normal" style={{ color: "var(--foreground-muted)" }}>
                      {list.length} controls
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="border-t p-1.5 space-y-1" style={{ borderColor: "var(--border)" }}>
                      {list.map((c) => {
                        const isActive = controlId === c.control_id && (itemCode || "") === (c.item_code || "").trim();
                        const displayItemCode = (c.item_code || "").trim() || "—";
                        return (
                          <Link
                            key={`${c.control_id}-${c.item_code}`}
                            href={`/aws/controls/${c.control_id}?item=${encodeURIComponent((c.item_code || "").trim())}`}
                            className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs sm:text-sm transition ${
                              isActive
                                ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                                : "border-[var(--border)] bg-[var(--muted)]/20 text-[var(--foreground)] hover:bg-[var(--border)]/40"
                            }`}
                          >
                            <span className="min-w-0 flex-1 truncate">
                              <span className="font-semibold">{displayItemCode}</span>{" "}
                              <span className="opacity-80">
                                · {c.control_id} — {c.control_name || "Control"}
                              </span>
                            </span>
                            <span className="shrink-0 rounded-full bg-[var(--success)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--success)]">
                              Evidence
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        <main className="card rounded-xl p-5 flex flex-col min-h-[420px] overflow-auto">
          {selectedControl ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4 shrink-0">
                <div>
                  <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
                    Evidence item{" "}
                    <span className="text-[var(--primary)]">
                      {selectedControl.item_code ?? selectedControl.required_evidence_items?.[0]?.item_code ?? "—"}
                    </span>
                  </h2>
                  <p className="text-sm mt-0.5" style={{ color: "var(--foreground-muted)" }}>
                    Control {selectedControl.control_id} · {selectedControl.control_name || "—"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleFetchAwsEvidence}
                  disabled={fetching}
                  className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-70"
                  title="Run AWS collectors to gather evidence for this and other controls."
                >
                  {fetching ? "Fetching…" : "Fetch AWS evidence"}
                </button>
              </div>
              {fetchError && (
                <p className="text-sm shrink-0" style={{ color: "var(--danger)" }}>
                  {fetchError}
                </p>
              )}

              {selectedControl.aws_calls?.aws_apis?.length > 0 && (
                <section className="shrink-0 mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--foreground-muted)" }}>
                    AWS APIs for this control
                  </h3>
                  <p className="text-sm mb-3" style={{ color: "var(--foreground-muted)" }}>
                    APIs used to collect evidence. Grouped by service for clarity.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(selectedControl.aws_calls.aws_apis || []).map((api) => (
                      <AwsApiTag key={api} api={api} />
                    ))}
                  </div>
                </section>
              )}

              <section className="shrink-0 mt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--foreground-muted)" }}>
                  Required evidence items
                </h3>
                <ul className="list-inside list-disc space-y-0.5 text-sm" style={{ color: "var(--foreground-muted)" }}>
                  {(selectedControl.required_evidence_items || []).map((item, i) => (
                    <li key={i}>
                      <span className="font-medium text-[var(--primary)]">{item.item_code}</span>{" "}
                      {item.evidence_item_name}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mt-6 flex-1 min-h-0 flex flex-col">
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 shrink-0" style={{ color: "var(--foreground-muted)" }}>
                  Compare evidence by run
                </h3>
                {evidenceByRun.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-center flex-1 flex items-center justify-center" style={{ borderColor: "var(--border)", background: "var(--muted)/10" }}>
                    <div>
                      <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>No evidence for this control yet.</p>
                      <p className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>
                        Use <strong>Fetch AWS evidence</strong> to run collectors.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-1 border-b shrink-0 mb-3" style={{ borderColor: "var(--border)" }}>
                      {evidenceByRun.map((run, runIndex) => {
                        const isSelected = selectedRunIndex === runIndex;
                        return (
                          <button
                            key={run.run_id}
                            type="button"
                            onClick={() => setSelectedRunIndex(runIndex)}
                            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition ${
                              isSelected
                                ? "bg-[var(--muted)] border border-b-0 -mb-px"
                                : "hover:bg-[var(--muted)]/50"
                            }`}
                            style={{
                              color: isSelected ? "var(--foreground)" : "var(--foreground-muted)",
                              borderColor: "var(--border)",
                            }}
                          >
                            Run {runIndex + 1}
                            {run.ended_at && (
                              <span className="ml-1.5 text-xs opacity-80">
                                {new Date(run.ended_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                            <span
                              className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${
                                run.status === "success" ? "bg-[var(--success)]/15 text-[var(--success)]" : run.status === "partial" ? "bg-amber-500/15 text-amber-600" : "bg-[var(--danger)]/15 text-[var(--danger)]"
                              }`}
                            >
                              {run.status}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <RunEvidenceTable
                      run={evidenceByRun[Math.min(selectedRunIndex, evidenceByRun.length - 1)]}
                      onViewContent={handleViewContent}
                      contentLoading={contentLoading}
                    />
                  </>
                )}
              </section>

              {contentModal && (
                <AwsEvidenceContentModal
                  content={contentModal.content}
                  error={contentModal.error}
                  onClose={() => setContentModal(null)}
                />
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm" style={{ color: "var(--foreground-muted)" }}>
              Select a control from the list on the left to view AWS calls, required evidence, and compare runs.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function RunEvidenceTable({
  run,
  onViewContent,
  contentLoading,
}: {
  run: AwsEvidenceByRun | undefined;
  onViewContent: (evidenceId: string) => void;
  contentLoading: boolean;
}) {
  if (!run) return null;
  return (
    <div className="rounded-lg border overflow-auto flex-1 min-h-0" style={{ borderColor: "var(--border)" }}>
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10" style={{ background: "var(--muted)" }}>
          <tr className="border-b" style={{ borderColor: "var(--border)" }}>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase" style={{ color: "var(--foreground-muted)" }}>Item</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase" style={{ color: "var(--foreground-muted)" }}>Source</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase" style={{ color: "var(--foreground-muted)" }}>Collected</th>
            <th className="w-24 px-4 py-2.5 text-right text-xs font-semibold uppercase" style={{ color: "var(--foreground-muted)" }} />
          </tr>
        </thead>
        <tbody>
          {run.evidence.map((e) => (
            <tr
              key={e.evidence_id}
              className="border-b last:border-0 hover:bg-[var(--muted)]/20"
              style={{ borderColor: "var(--border)" }}
            >
              <td className="px-4 py-2 font-medium" style={{ color: "var(--foreground)" }}>{e.item_code}</td>
              <td className="px-4 py-2" style={{ color: "var(--foreground-muted)" }}>{e.source_system}</td>
              <td className="px-4 py-2" style={{ color: "var(--foreground-muted)" }}>
                {e.collected_at ? new Date(e.collected_at).toLocaleString() : "—"}
              </td>
              <td className="px-4 py-2 text-right">
                <button
                  type="button"
                  className="rounded border px-2.5 py-1 text-xs font-medium hover:opacity-90 disabled:opacity-50"
                  style={{ borderColor: "var(--border)", color: "var(--primary)" }}
                  onClick={() => onViewContent(e.evidence_id)}
                  disabled={contentLoading}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

