"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface AwsEvidenceRow {
  evidence_id: string;
  item_code: string;
  control_id: string;
  evidence_type: string;
  source_system: string;
  collected_at: string | null;
}

interface AwsRun {
  run_id: string;
  collector_name: string;
  cloud_provider: string;
  execution_time: string | null;
  ended_at: string | null;
  status: string;
  trigger_type: string | null;
  evidence_count: number;
}

const DOMAIN_NAMES: Record<string, string> = {
  A: "Network & Architecture",
  B: "System Hardening & Config",
  C: "Access Management",
  D: "Vulnerability & Patch Mgmt",
  E: "Monitoring & Detection",
  F: "Third-Party & Outsourcing",
  G: "Physical Security",
  H: "Policies & Governance",
};

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatDateShort(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

type TabId = "overview" | "domain" | "control" | "evidence";

export default function AwsEvidencePage() {
  const { user } = useAuth();
  const [list, setList] = useState<AwsEvidenceRow[]>([]);
  const [runs, setRuns] = useState<AwsRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [viewId, setViewId] = useState<string | null>(null);
  const [viewContent, setViewContent] = useState<unknown>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set(["A", "B", "C"]));

  const fetchData = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [evidenceRes, runsRes] = await Promise.all([
        api.get<AwsEvidenceRow[]>("/aws/evidence?limit=500"),
        api.get<AwsRun[]>("/aws/runs?limit=20").catch(() => []),
      ]);
      setList(Array.isArray(evidenceRes) ? evidenceRes : []);
      setRuns(Array.isArray(runsRes) ? runsRes : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
      setList([]);
      setRuns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onCollect = async () => {
    setError(null);
    setCollecting(true);
    try {
      await api.post("/aws/runs/collect");
      await fetchData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Collection failed");
    } finally {
      setCollecting(false);
    }
  };

  const onView = async (evidenceId: string) => {
    setViewId(evidenceId);
    setViewContent(null);
    setViewLoading(true);
    try {
      const data = await api.get(`/aws/evidence/${evidenceId}/content`);
      setViewContent(data);
    } catch {
      setViewContent({ error: "Failed to load evidence content" });
    } finally {
      setViewLoading(false);
    }
  };

  const closeModal = useCallback(() => {
    setViewId(null);
    setViewContent(null);
  }, []);

  useEffect(() => {
    if (viewId === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewId, closeModal]);

  const copyJson = useCallback(() => {
    const raw = typeof viewContent === "string" ? viewContent : JSON.stringify(viewContent, null, 2);
    void navigator.clipboard.writeText(raw);
  }, [viewContent]);

  // Derived stats
  const stats = useMemo(() => {
    const uniqueItems = new Set(list.map((e) => e.item_code));
    const uniqueControls = new Set(list.map((e) => e.control_id));
    const sources = new Set(list.map((e) => e.source_system));
    const dates = list.map((e) => e.collected_at).filter(Boolean) as string[];
    const lastCollected = dates.length ? dates.sort().reverse()[0] : null;
    return {
      totalEvidence: list.length,
      uniqueItems: uniqueItems.size,
      uniqueControls: uniqueControls.size,
      sourceCount: sources.size,
      sources: Array.from(sources).sort(),
      lastCollected,
      totalRuns: runs.length,
      lastRun: runs[0] ?? null,
    };
  }, [list, runs]);

  // Group by domain (first letter of item_code)
  const byDomain = useMemo(() => {
    const map: Record<string, { count: number; items: Record<string, { controlIds: Set<string>; count: number }> }> = {};
    for (const e of list) {
      const domain = (e.item_code && e.item_code[0]) || "?";
      if (!map[domain]) map[domain] = { count: 0, items: {} };
      map[domain].count += 1;
      if (!map[domain].items[e.item_code]) map[domain].items[e.item_code] = { controlIds: new Set(), count: 0 };
      map[domain].items[e.item_code].controlIds.add(e.control_id);
      map[domain].items[e.item_code].count += 1;
    }
    return map;
  }, [list]);

  // Group by control_id
  const byControl = useMemo(() => {
    const map: Record<string, { count: number; itemCodes: Set<string> }> = {};
    for (const e of list) {
      if (!map[e.control_id]) map[e.control_id] = { count: 0, itemCodes: new Set() };
      map[e.control_id].count += 1;
      map[e.control_id].itemCodes.add(e.item_code);
    }
    return map;
  }, [list]);

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "domain", label: "By domain" },
    { id: "control", label: "By control" },
    { id: "evidence", label: "All evidence" },
  ];

  if (user?.role !== "it_sme") {
    return (
      <div className="p-6 max-w-2xl">
        <h1 className="text-xl font-semibold text-foreground">AWS Evidence</h1>
        <p className="mt-2 text-(--foreground-muted)">
          You do not have access to this page. This section is only available for IT Subject Matter Experts.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AWS Evidence</h1>
          <p className="mt-1 text-sm text-(--foreground-muted)">
            SWIFT security evidence collected from AWS (IAM, EC2, CloudTrail, Config, SSM, and more).
          </p>
        </div>
        <button
          type="button"
          onClick={onCollect}
          disabled={collecting}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {collecting ? "Collecting…" : "Collect evidence"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-(--foreground-muted)">Loading…</p>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <div className="rounded-xl border border-(--border) bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-(--foreground-muted)">Total evidence</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{stats.totalEvidence}</p>
            </div>
            <div className="rounded-xl border border-(--border) bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-(--foreground-muted)">Evidence items</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{stats.uniqueItems}</p>
            </div>
            <div className="rounded-xl border border-(--border) bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-(--foreground-muted)">Controls</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{stats.uniqueControls}</p>
            </div>
            <div className="rounded-xl border border-(--border) bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-(--foreground-muted)">Sources</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{stats.sourceCount}</p>
            </div>
            <div className="rounded-xl border border-(--border) bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-(--foreground-muted)">Collection runs</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{stats.totalRuns}</p>
            </div>
            <div className="rounded-xl border border-(--border) bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-(--foreground-muted)">Last collected</p>
              <p className="mt-1 text-sm font-medium text-foreground">{formatDateShort(stats.lastCollected)}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-(--border) mb-4">
            <nav className="flex gap-1" aria-label="AWS evidence views">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-(--foreground-muted) hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab content */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">Domain summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["A", "B", "C", "D", "E", "F", "G", "H"].map((domain) => {
                    const data = byDomain[domain];
                    const count = data?.count ?? 0;
                    const name = DOMAIN_NAMES[domain] ?? domain;
                    return (
                      <div
                        key={domain}
                        className="rounded-lg border border-(--border) bg-card p-3 cursor-pointer hover:bg-muted/30"
                        onClick={() => {
                          setActiveTab("domain");
                          setExpandedDomains((prev) => new Set(prev).add(domain));
                        }}
                      >
                        <p className="text-xs text-(--foreground-muted)">{name}</p>
                        <p className="text-xl font-bold text-foreground">{count}</p>
                        <p className="text-xs text-(--foreground-muted)">evidence items</p>
                      </div>
                    );
                  })}
                </div>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">Recent runs</h2>
                {runs.length === 0 ? (
                  <p className="text-sm text-(--foreground-muted)">No collection runs yet. Click &quot;Collect evidence&quot; to run AWS collectors.</p>
                ) : (
                  <div className="rounded-xl border border-(--border) bg-card overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-(--border) bg-muted/50">
                          <th className="px-4 py-2 text-left font-semibold text-foreground">Time</th>
                          <th className="px-4 py-2 text-left font-semibold text-foreground">Status</th>
                          <th className="px-4 py-2 text-left font-semibold text-foreground">Evidence count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {runs.slice(0, 5).map((r) => (
                          <tr key={r.run_id} className="border-b border-(--border) last:border-0">
                            <td className="px-4 py-2 text-foreground">{formatDateTime(r.execution_time)}</td>
                            <td className="px-4 py-2">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                                  r.status === "success" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                }`}
                              >
                                {r.status}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-foreground">{r.evidence_count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === "domain" && (
            <div className="space-y-3">
              <p className="text-sm text-(--foreground-muted)">Evidence grouped by SWIFT domain (first letter of evidence item code).</p>
              {["A", "B", "C", "D", "E", "F", "G", "H"].map((domain) => {
                const data = byDomain[domain];
                const count = data?.count ?? 0;
                const name = DOMAIN_NAMES[domain] ?? domain;
                const isExpanded = expandedDomains.has(domain);
                const itemEntries = data ? Object.entries(data.items).sort((a, b) => a[0].localeCompare(b[0])) : [];
                return (
                  <div key={domain} className="rounded-xl border border-(--border) bg-card overflow-hidden">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30"
                      onClick={() =>
                        setExpandedDomains((prev) => {
                          const next = new Set(prev);
                          if (next.has(domain)) next.delete(domain);
                          else next.add(domain);
                          return next;
                        })
                      }
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-foreground w-8">{domain}</span>
                        <span className="text-sm text-(--foreground-muted)">{name}</span>
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">{count} evidence</span>
                      </div>
                      <svg
                        className={`h-5 w-5 text-(--foreground-muted) transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isExpanded && itemEntries.length > 0 && (
                      <div className="border-t border-(--border) px-4 py-3 bg-muted/20">
                        <div className="grid gap-2">
                          {itemEntries.map(([itemCode, { count: itemCount, controlIds }]) => (
                            <div key={itemCode} className="flex items-center justify-between text-sm">
                              <span className="font-medium text-foreground">{itemCode}</span>
                              <span className="text-(--foreground-muted)">
                                {itemCount} evidence · controls: {Array.from(controlIds).sort().join(", ")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "control" && (
            <div className="space-y-3">
              <p className="text-sm text-(--foreground-muted)">Evidence grouped by control ID.</p>
              <div className="rounded-xl border border-(--border) bg-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-(--border) bg-muted/50">
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Control ID</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Evidence count</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Evidence items</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(byControl)
                      .sort((a, b) => a[0].localeCompare(b[0]))
                      .map(([controlId, { count, itemCodes }]) => (
                        <tr key={controlId} className="border-b border-(--border) last:border-0 hover:bg-muted/20">
                          <td className="px-4 py-3 font-medium text-foreground">{controlId}</td>
                          <td className="px-4 py-3 text-foreground">{count}</td>
                          <td className="px-4 py-3 text-(--foreground-muted)">{Array.from(itemCodes).sort().join(", ")}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {Object.keys(byControl).length === 0 && (
                  <p className="px-4 py-8 text-center text-(--foreground-muted)">No evidence yet. Run a collection to populate controls.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "evidence" && (
            <div className="overflow-x-auto rounded-xl border border-(--border) bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-(--border) bg-muted/50">
                    <th className="px-4 py-3 font-semibold text-foreground">Item</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Control</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Source</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Collected</th>
                    <th className="px-4 py-3 font-semibold text-foreground w-24" />
                  </tr>
                </thead>
                <tbody>
                  {list.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-(--foreground-muted)">
                        No evidence collected yet. Click &quot;Collect evidence&quot; to run AWS collectors.
                      </td>
                    </tr>
                  ) : (
                    list.map((row) => (
                      <tr key={row.evidence_id} className="border-b border-(--border) last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3 text-foreground">{row.item_code}</td>
                        <td className="px-4 py-3 text-foreground">{row.control_id}</td>
                        <td className="px-4 py-3 text-foreground">{row.source_system}</td>
                        <td className="px-4 py-3 text-(--foreground-muted)">{formatDateTime(row.collected_at)}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => onView(row.evidence_id)}
                            className="rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Evidence content modal */}
      {viewId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="aws-evidence-modal-title"
        >
          <div className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-xl border border-(--border) bg-card shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b border-(--border) px-4 py-3">
              <h2 id="aws-evidence-modal-title" className="text-lg font-semibold text-foreground">
                Evidence content
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyJson}
                  className="rounded px-3 py-1.5 text-xs font-medium bg-muted text-foreground hover:bg-muted/80"
                >
                  Copy JSON
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded p-1 text-(--foreground-muted) hover:bg-muted hover:text-foreground"
                  aria-label="Close"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 font-mono text-xs bg-(--muted)/30">
              {viewLoading ? (
                <p className="text-(--foreground-muted)">Loading…</p>
              ) : (
                <pre className="whitespace-pre-wrap break-words text-foreground">
                  {typeof viewContent === "string" ? viewContent : JSON.stringify(viewContent, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
