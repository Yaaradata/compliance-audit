"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ProgressBar } from "@/components/ui/progress-bar";
import { scoreColor } from "@/lib/utils";

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

interface ApprovalSummary {
  overall_compliance_pct: number;
  total_items: number;
  approved_items: number;
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
  gaps_documented: {
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
  const [approving, setApproving] = useState<string | null>(null);
  const [mfaToken, setMfaToken] = useState("");
  const [notes, setNotes] = useState("");

  const fetchSummary = useCallback(async () => {
    if (!cycleId) return;
    try {
      const data = await api.get<ApprovalSummary>(`/assessments/${cycleId}/approval/summary`);
      setSummary(data);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [cycleId]);

  useEffect(() => {
    setLoading(true);
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

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-sm text-gray-400">Loading approval status…</div>;
  }

  if (!summary) {
    return <div className="flex items-center justify-center h-64 text-sm text-gray-400">Could not load approval data.</div>;
  }

  const { overall_compliance_pct, total_items, approved_items, domain_breakdown, gates } = summary;
  const domains = Object.entries(domain_breakdown).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div
        className="rounded-xl p-6 mb-6 text-white"
        style={{
          background: `linear-gradient(135deg, ${overall_compliance_pct >= 80 ? "#059669" : "#d97706"} 0%, ${overall_compliance_pct >= 80 ? "#047857" : "#b45309"} 100%)`,
        }}
      >
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm opacity-80 mb-1">Overall Compliance Score</div>
            <div className="text-5xl font-bold">{overall_compliance_pct}%</div>
            <div className="text-xs opacity-80 mt-1">{approved_items}/{total_items} evidence items approved</div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {gates.map((g) => {
              const meta = GATE_META[g.gate];
              return (
                <div
                  key={g.gate}
                  className={`rounded-lg p-3 text-center min-w-[100px] ${
                    g.status === "approved" ? "bg-white/25" : "bg-white/10"
                  }`}
                >
                  <div className="text-lg">{meta?.icon || "📋"}</div>
                  <div className="text-[10px] font-medium mt-1">{meta?.label || g.gate}</div>
                  <div className={`text-xs font-bold mt-0.5 ${g.status === "approved" ? "text-green-200" : "text-white/70"}`}>
                    {g.status === "approved" ? "✓ Done" : `${g.progress_pct ?? 0}%`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-6">
        {/* Left: Gate stepper + domain breakdown */}
        <div className="space-y-4">
          {/* Gate stepper */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-800">Approval Gates</h3>
            </div>
            <div className="p-4 space-y-3">
              {gates.map((g, idx) => {
                const meta = GATE_META[g.gate];
                const isActive = g.status !== "approved" && (idx === 0 || gates[idx - 1]?.status === "approved");
                return (
                  <div
                    key={g.gate}
                    className={`rounded-lg border-2 p-4 transition-colors ${
                      g.status === "approved"
                        ? "border-green-200 bg-green-50/50"
                        : isActive
                          ? "border-blue-300 bg-blue-50/30"
                          : "border-gray-200 bg-gray-50/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{meta?.icon || "📋"}</span>
                        <div>
                          <h4 className="text-sm font-bold text-gray-800">{meta?.label || g.gate}</h4>
                          <p className="text-[10px] text-gray-500">{meta?.description}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          g.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : g.ready
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {g.status === "approved" ? "Approved" : g.ready ? "Ready" : "Pending"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1">
                        <ProgressBar pct={g.progress_pct ?? 0} h={6} />
                      </div>
                      <span className="text-xs font-bold" style={{ color: scoreColor(g.progress_pct ?? 0) }}>
                        {g.progress_pct ?? 0}%
                      </span>
                    </div>

                    <p className="text-[10px] text-gray-500 mb-2">{g.detail}</p>

                    {Array.isArray(g.blockers) && g.blockers.length > 0 && (
                      <div className="text-[10px] text-red-600 mb-2">
                        Blockers: {g.blockers.slice(0, 5).join(", ")}
                        {g.blockers.length > 5 && ` +${g.blockers.length - 5} more`}
                      </div>
                    )}

                    {g.status === "approved" && g.approved_at && (
                      <div className="text-[10px] text-green-600">
                        Approved {new Date(g.approved_at).toLocaleDateString()}
                        {g.notes && ` — ${g.notes}`}
                      </div>
                    )}

                    {canApprove && g.status !== "approved" && g.ready && isActive && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Notes (optional)…"
                          rows={2}
                          className="w-full text-xs border border-gray-300 rounded-lg p-2 resize-none mb-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                        {g.gate === "final_attestation" && (
                          <input
                            type="text"
                            value={mfaToken}
                            onChange={(e) => setMfaToken(e.target.value)}
                            placeholder="MFA Token"
                            className="w-full text-xs border border-gray-300 rounded-lg p-2 mb-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
                          />
                        )}
                        <button
                          onClick={() => handleApproveGate(g.gate)}
                          disabled={approving === g.gate}
                          className="w-full py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {approving === g.gate ? "Approving…" : `Approve: ${meta?.label || g.gate}`}
                        </button>
                      </div>
                    )}

                    {canViewOnly && g.status !== "approved" && (
                      <div className="mt-2 text-[10px] text-gray-400 italic">
                        {userRole === "compliance_officer"
                          ? "Gate approval requires the Approver role."
                          : "Read-only access to approval status."}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Domain breakdown + evidence summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-800">Domain Breakdown</h3>
            </div>
            <div className="p-3 space-y-2">
              {domains.map(([domain, bd]) => {
                const pct = bd.total > 0 ? Math.round((bd.approved / bd.total) * 100) : 0;
                const color = DOMAIN_COLORS[domain] || "#666";
                return (
                  <button
                    key={domain}
                    onClick={() => router.push(`/cycles/${cycleId}/domains/${domain}`)}
                    className="w-full text-left rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ backgroundColor: color }}
                        >
                          {domain}
                        </span>
                        <span className="text-xs font-semibold text-gray-700">Domain {domain}</span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: scoreColor(pct) }}>
                        {pct}%
                      </span>
                    </div>
                    <ProgressBar pct={pct} h={5} />
                    <div className="flex gap-3 mt-1.5 text-[10px]">
                      <span className="text-green-600">{bd.approved} approved</span>
                      <span className="text-blue-600">{bd.submitted} in review</span>
                      <span className="text-gray-400">{bd.draft} draft</span>
                    </div>
                  </button>
                );
              })}
              {domains.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No evidence data available.</p>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Assessment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Total Evidence Items</span>
                <span className="font-bold text-gray-700">{total_items}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Approved</span>
                <span className="font-bold text-green-600">{approved_items}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Remaining</span>
                <span className="font-bold text-amber-600">{total_items - approved_items}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Gates Approved</span>
                <span className="font-bold text-gray-700">
                  {gates.filter((g) => g.status === "approved").length}/{gates.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
