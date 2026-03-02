"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ProgressBar } from "@/components/ui/progress-bar";
import { scoreColor } from "@/lib/utils";
import { ApprovalEvidenceViewer } from "@/components/approval/approval-evidence-viewer";

interface GateInfo {
  gate: string;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  mfa_verified: boolean;
  notes: string | null;
  ready: boolean;
  progress_pct: number;
  blockers: string[];
  detail: string;
}

interface DomainBreakdown {
  total: number;
  approved: number;
  submitted: number;
  draft: number;
}

interface ReviewLevelStats {
  approved: number;
  total: number;
  pct: number;
}

interface EvidenceForApprovalItem {
  id: string;
  evidence_item_id: string;
  status: string;
  submitted_at: string | null;
}

interface ApprovalSummary {
  overall_compliance_pct: number;
  total_items: number;
  approved_items: number;
  review_level_stats?: Record<string, ReviewLevelStats>;
  all_l_cleared?: boolean;
  evidence_for_approval?: EvidenceForApprovalItem[];
  domain_breakdown: Record<string, DomainBreakdown>;
  gates: GateInfo[];
}

const GATE_META: Record<string, { label: string; icon: string; description: string }> = {
  evidence_complete: {
    label: "Evidence Complete",
    icon: "📄",
    description: "All mandatory evidence items have been submitted and approved",
  },
  review_complete: {
    label: "Review Complete",
    icon: "🔍",
    description: "All L1, L2, and L3 reviews have been completed and approved",
  },
  internal_review: {
    label: "Review Complete",
    icon: "🔍",
    description: "All L1, L2, and L3 reviews have been completed and approved",
  },
  gaps_documented: {
    label: "Gaps Documented",
    icon: "📋",
    description: "All identified gaps have remediation plans documented",
  },
  assessment_complete: {
    label: "Gaps Documented",
    icon: "📋",
    description: "All identified gaps have remediation plans documented",
  },
  final_attestation: {
    label: "Final Attestation",
    icon: "🔒",
    description: "Final sign-off by the Approver (CISO / Head of Compliance)",
  },
};

const LEVEL_LABELS: Record<string, string> = {
  L1: "Completeness",
  L2: "Quality",
  L3: "Assessment",
};

const DOMAIN_COLORS: Record<string, string> = {
  A: "#0F4C75", B: "#1B5E20", C: "#E65100", D: "#B71C1C",
  E: "#4A148C", F: "#1565C0", G: "#F57F17", H: "#BF360C",
};

export default function CycleApprovalPage() {
  const params = useParams();
  const router = useRouter();
  const cycleId = params.cycleId as string;
  const { user } = useAuth();
  const userRole = user?.role || "compliance_officer";

  const [summary, setSummary] = useState<ApprovalSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [mfaToken, setMfaToken] = useState("");
  const [notes, setNotes] = useState("");
  const [viewingEvidenceId, setViewingEvidenceId] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!cycleId) {
      setLoading(false);
      setError("No cycle selected.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await api.get<ApprovalSummary>(`/assessments/${cycleId}/approval/summary`);
      setSummary(data);
    } catch (e) {
      setSummary(null);
      const message = e instanceof Error ? e.message : "Could not load approval data.";
      setError(message || "Could not load approval data.");
    } finally {
      setLoading(false);
    }
  }, [cycleId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const canApprove = userRole === "approver" || userRole === "admin";
  const canViewOnly = userRole === "compliance_officer" || userRole === "internal_reviewer" || userRole === "external_assessor";

  const handleApproveGate = async (gateType: string) => {
    setApproving(gateType);
    try {
      await api.post(`/assessments/${cycleId}/approval/${gateType}/approve`, {
        notes: notes || null,
        mfa_token: gateType === "final_attestation" ? mfaToken || null : null,
      });
      setNotes("");
      setMfaToken("");
      fetchSummary();
    } catch { /* ignore */ }
    setApproving(null);
  };

  if (loading && !summary) {
    return <div className="flex items-center justify-center h-64 text-sm text-gray-400">Loading approval status…</div>;
  }

  if (!cycleId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-4">
        <p className="text-sm text-gray-500">No assessment cycle selected.</p>
        <p className="text-xs text-gray-400 mt-1">Select a cycle from the sidebar or create one.</p>
      </div>
    );
  }

  if (!summary && error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-4">
        <p className="text-sm text-gray-600">{error}</p>
        <button
          type="button"
          onClick={() => fetchSummary()}
          className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!summary) {
    return <div className="flex items-center justify-center h-64 text-sm text-gray-400">Could not load approval data.</div>;
  }

  const {
    overall_compliance_pct,
    total_items,
    approved_items,
    review_level_stats,
    all_l_cleared,
    evidence_for_approval,
    domain_breakdown,
    gates,
  } = summary;
  const domains = Object.entries(domain_breakdown).sort(([a], [b]) => a.localeCompare(b));
  const evidenceList = evidence_for_approval ?? [];
  const approvedCount = gates.filter((g) => g.status === "approved").length;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto py-6 px-4">
          {/* ─── Hero: Overall score + gate pills ─── */}
          <section className="rounded-xl p-6 mb-6 text-white shadow-sm" style={{ background: `linear-gradient(135deg, ${overall_compliance_pct >= 80 ? "#059669" : "#d97706"} 0%, ${overall_compliance_pct >= 80 ? "#047857" : "#b45309"} 100%)` }}>
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h1 className="text-sm font-medium opacity-90">Overall Compliance Score</h1>
                <p className="text-4xl md:text-5xl font-bold mt-1">{overall_compliance_pct}%</p>
                <p className="text-xs opacity-80 mt-1">{approved_items} of {total_items} evidence items approved</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {gates.map((g) => {
                  const meta = GATE_META[g.gate];
                  return (
                    <div key={g.gate} className={`rounded-lg px-4 py-2 text-center min-w-[90px] ${g.status === "approved" ? "bg-white/25" : "bg-white/10"}`}>
                      <span className="text-base">{meta?.icon || "📋"}</span>
                      <p className="text-[10px] font-medium mt-0.5">{meta?.label || g.gate}</p>
                      <p className={`text-xs font-bold ${g.status === "approved" ? "text-green-200" : "text-white/80"}`}>
                        {g.status === "approved" ? "✓ Done" : `${g.progress_pct ?? 0}%`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ─── Section: Review levels (L1 → L2 → L3) with details ─── */}
          <section className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
            <header className="px-4 py-3 bg-slate-50 border-b border-gray-200">
              <h2 className="text-sm font-bold text-gray-800">Review levels</h2>
              <p className="text-xs text-gray-500 mt-0.5">L1 (Completeness) → L2 (Quality) → L3 (Assessment). All must be cleared before approval gates.</p>
            </header>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(["L1", "L2", "L3"] as const).map((level) => {
                  const s = review_level_stats?.[level];
                  const total = s?.total ?? 0;
                  const approved = s?.approved ?? 0;
                  const pct = s?.pct ?? 0;
                  const cleared = total === 0 || approved >= total;
                  const label = LEVEL_LABELS[level] ?? level;
                  return (
                    <div
                      key={level}
                      className={`rounded-lg border-2 p-4 text-center transition-colors ${
                        cleared ? "border-green-200 bg-green-50/60" : "border-amber-200 bg-amber-50/40"
                      }`}
                    >
                      <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">{level}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{label}</div>
                      <div className="mt-2 text-2xl font-bold" style={{ color: scoreColor(total === 0 ? 100 : pct) }}>
                        {approved}/{total}
                      </div>
                      <div className="text-[10px] font-medium text-gray-500 mt-0.5">
                        {total === 0 ? "No reviews yet" : cleared ? "Cleared" : `${pct}%`}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* All L's cleared banner */}
              <div
                className={`mt-4 rounded-lg border-2 px-4 py-3 flex items-center justify-center gap-2 ${
                  all_l_cleared ? "border-green-400 bg-green-50 text-green-800" : "border-gray-200 bg-gray-50 text-gray-600"
                }`}
              >
                <span className="text-xl">{all_l_cleared ? "✓" : "○"}</span>
                <span className="text-sm font-semibold">
                  {all_l_cleared
                    ? "All L's cleared — ready for approval gates below"
                    : "Waiting for all review levels to be cleared before approval"}
                </span>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* ─── Left: Approval gates ─── */}
            <section className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col min-h-0">
              <header className="px-4 py-3 bg-gray-50 border-b border-gray-200 shrink-0">
                <h2 className="text-sm font-bold text-gray-800">Approval gates</h2>
                <p className="text-[10px] text-gray-500 mt-0.5">Clear gates in order. Final attestation requires MFA.</p>
              </header>
              <div className="p-4 space-y-3 overflow-y-auto min-h-0">
                {gates.map((g, idx) => {
                  const meta = GATE_META[g.gate];
                  const isActive = g.status !== "approved" && (idx === 0 || gates[idx - 1]?.status === "approved");
                  return (
                    <div
                      key={g.gate}
                      className={`rounded-lg border-2 p-4 ${
                        g.status === "approved" ? "border-green-200 bg-green-50/50" : isActive ? "border-blue-300 bg-blue-50/30" : "border-gray-200 bg-gray-50/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{meta?.icon || "📋"}</span>
                          <div>
                            <h3 className="text-sm font-bold text-gray-800">{meta?.label || g.gate}</h3>
                            <p className="text-[10px] text-gray-500">{meta?.description}</p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            g.status === "approved" ? "bg-green-100 text-green-700" : g.ready ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {g.status === "approved" ? "Approved" : g.ready ? "Ready" : "Pending"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1"><ProgressBar pct={g.progress_pct ?? 0} h={6} /></div>
                        <span className="text-xs font-bold" style={{ color: scoreColor(g.progress_pct ?? 0) }}>{g.progress_pct ?? 0}%</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mb-2">{g.detail}</p>
                      {Array.isArray(g.blockers) && g.blockers.length > 0 && (
                        <p className="text-[10px] text-red-600 mb-2">Blockers: {g.blockers.slice(0, 5).join(", ")}{g.blockers.length > 5 && ` +${g.blockers.length - 5} more`}</p>
                      )}
                      {g.status === "approved" && g.approved_at && (
                        <p className="text-[10px] text-green-600">Approved {new Date(g.approved_at).toLocaleDateString()}{g.notes && ` — ${g.notes}`}</p>
                      )}
                      {canApprove && g.status !== "approved" && g.ready && isActive && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          {g.gate === "final_attestation" && (
                            <div className="mb-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                              <p className="text-[10px] font-semibold text-amber-800">MFA required for final attestation (CISO / Head of Compliance sign-off).</p>
                            </div>
                          )}
                          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)…" rows={2} className="w-full text-xs border border-gray-300 rounded-lg p-2 resize-none mb-2 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                          {g.gate === "final_attestation" && (
                            <input type="text" value={mfaToken} onChange={(e) => setMfaToken(e.target.value)} placeholder="MFA token (required)" className="w-full text-xs border border-gray-300 rounded-lg p-2 mb-2 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                          )}
                          <button
                            onClick={() => handleApproveGate(g.gate)}
                            disabled={approving === g.gate || (g.gate === "final_attestation" && !mfaToken.trim())}
                            className="w-full py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            {approving === g.gate ? "Approving…" : g.gate === "final_attestation" && !mfaToken.trim() ? "Enter MFA token to approve" : `Approve: ${meta?.label || g.gate}`}
                          </button>
                        </div>
                      )}
                      {canViewOnly && g.status !== "approved" && (
                        <p className="mt-2 text-[10px] text-gray-400 italic">{userRole === "compliance_officer" ? "Gate approval requires the Approver role." : "Read-only access."}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ─── Right: Domain breakdown + summary ─── */}
            <aside className="space-y-4 flex flex-col min-w-0">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col min-h-0">
                <header className="px-4 py-3 bg-gray-50 border-b border-gray-200 shrink-0">
                  <h2 className="text-sm font-bold text-gray-800">Domain breakdown</h2>
                  {domains.length > 0 && <p className="text-[10px] text-gray-500 mt-0.5">{domains.length} domain{domains.length !== 1 ? "s" : ""}</p>}
                </header>
                <div className="p-3 space-y-2 overflow-y-auto min-h-0 max-h-[280px]">
                  {domains.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6">No domains with evidence yet.</p>
                  ) : (
                    domains.map(([domain, bd]) => {
                      const pct = bd.total > 0 ? Math.round((bd.approved / bd.total) * 100) : 0;
                      const color = DOMAIN_COLORS[domain] || "#666";
                      return (
                        <button key={domain} onClick={() => router.push(`/cycles/${cycleId}/domains/${domain}`)} className="w-full text-left rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: color }}>{domain}</span>
                              <span className="text-xs font-semibold text-gray-700">Domain {domain}</span>
                            </div>
                            <span className="text-xs font-bold" style={{ color: scoreColor(pct) }}>{pct}%</span>
                          </div>
                          <ProgressBar pct={pct} h={5} />
                          <div className="flex gap-3 mt-1.5 text-[10px]">
                            <span className="text-green-600">{bd.approved} approved</span>
                            <span className="text-blue-600">{bd.submitted} in review</span>
                            <span className="text-gray-400">{bd.draft} draft</span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h2 className="text-sm font-bold text-gray-800 mb-3">Summary</h2>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-gray-500">Evidence items</span><span className="font-bold text-gray-700">{total_items}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Approved</span><span className="font-bold text-green-600">{approved_items}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Gates approved</span><span className="font-bold text-gray-700">{approvedCount}/{gates.length}</span></div>
                </div>
              </div>
            </aside>
          </div>

          {/* ─── Section: All evidence (scrollable when many items) ─── */}
          <section className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col min-h-0">
            <header className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-sm font-bold text-gray-800">All evidence</h2>
                <p className="text-[10px] text-gray-500 mt-0.5">Review each item before clearing gates. Click View to open details.</p>
              </div>
              <span className="text-xs font-medium text-gray-500">{evidenceList.length} item{evidenceList.length !== 1 ? "s" : ""}</span>
            </header>
            {evidenceList.length === 0 ? (
              <div className="p-8 text-center border-t border-gray-100">
                <p className="text-sm text-gray-500">No evidence items in this cycle yet.</p>
                <p className="text-xs text-gray-400 mt-1">Evidence will appear here once submitted from the domain pages.</p>
              </div>
            ) : (
              <div className="overflow-auto min-h-0 max-h-[400px]">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 shadow-sm">
                    <tr>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-600 uppercase tracking-wider text-left">Item</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-600 uppercase tracking-wider text-left">Status</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-600 uppercase tracking-wider text-left">Submitted</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-600 uppercase tracking-wider text-left w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evidenceList.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="px-4 py-2.5">
                          <span className="text-xs font-semibold text-gray-800">{item.evidence_item_id || "—"}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${item.status === "approved" ? "bg-green-100 text-green-700" : item.status?.startsWith("in_review") ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-[11px] text-gray-500">
                          {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4 py-2.5">
                          <button type="button" onClick={() => setViewingEvidenceId(item.id)} className="text-xs font-medium text-blue-600 hover:underline">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Side panel: evidence detail */}
      {viewingEvidenceId && (
        <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col">
          <ApprovalEvidenceViewer cycleId={cycleId} submissionId={viewingEvidenceId} onClose={() => setViewingEvidenceId(null)} />
        </div>
      )}
    </div>
  );
}
