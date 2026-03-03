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

interface TimelineReview {
  level: string;
  status: string;
  decision: string | null;
  reviewer_name: string | null;
  assigned_at: string | null;
  completed_at: string | null;
}

interface EvidenceTimelineItem {
  id: string;
  evidence_item_id: string;
  status: string;
  submitted_at: string | null;
  submitter_name: string | null;
  overall_met: boolean | null;
  eval_summary: string | null;
  reviews: TimelineReview[];
}

interface ApprovalSummary {
  overall_compliance_pct: number;
  total_items: number;
  approved_items: number;
  review_level_stats?: Record<string, ReviewLevelStats>;
  all_l_cleared?: boolean;
  evidence_for_approval?: { id: string; evidence_item_id: string; status: string; submitted_at: string | null }[];
  evidence_timeline?: EvidenceTimelineItem[];
  domain_breakdown: Record<string, DomainBreakdown>;
  gates: GateInfo[];
}

const GATE_META: Record<string, { label: string; icon: string; description: string }> = {
  evidence_complete: { label: "Evidence Complete", icon: "1", description: "All mandatory evidence items submitted and approved" },
  review_complete: { label: "Review Complete", icon: "2", description: "All L1, L2, and L3 reviews completed" },
  internal_review: { label: "Review Complete", icon: "2", description: "All L1, L2, and L3 reviews completed" },
  gaps_documented: { label: "Gaps Documented", icon: "3", description: "All gaps have remediation plans" },
  assessment_complete: { label: "Gaps Documented", icon: "3", description: "All gaps have remediation plans" },
  final_attestation: { label: "Final Attestation", icon: "4", description: "Sign-off by Head of Compliance / CISO" },
};

const LEVEL_LABELS: Record<string, string> = { L1: "Completeness", L2: "Quality", L3: "Assessment" };

const DOMAIN_COLORS: Record<string, string> = {
  A: "#0F4C75", B: "#1B5E20", C: "#E65100", D: "#B71C1C",
  E: "#4A148C", F: "#1565C0", G: "#F57F17", H: "#BF360C",
};

function TimelineStep({ done, current, label, detail, date }: { done: boolean; current: boolean; label: string; detail?: string; date?: string }) {
  return (
    <div className="flex gap-3 relative">
      <div className="flex flex-col items-center">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 z-10 ${
          done ? "bg-green-600 border-green-600 text-white" : current ? "bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100" : "bg-white border-gray-300 text-gray-400"
        }`}>
          {done ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : current ? "●" : "○"}
        </div>
        <div className="w-0.5 flex-1 bg-gray-200 min-h-[24px]" />
      </div>
      <div className="pb-5 pt-0.5 flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${done ? "text-green-700" : current ? "text-blue-700" : "text-gray-500"}`}>{label}</span>
          {date && <span className="text-[10px] text-gray-400">{new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>}
        </div>
        {detail && <p className="text-xs text-gray-500 mt-0.5">{detail}</p>}
      </div>
    </div>
  );
}

function EvidenceJourneyCard({ item, onView }: { item: EvidenceTimelineItem; onView: () => void }) {
  const isApproved = item.status === "approved";
  const l1 = item.reviews.find((r) => r.level === "L1");
  const l2 = item.reviews.find((r) => r.level === "L2");
  const l3 = item.reviews.find((r) => r.level === "L3");

  const statusBg = isApproved ? "bg-green-100 text-green-700" : item.status?.startsWith("in_review") ? "bg-blue-100 text-blue-700" : item.status === "returned" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600";

  return (
    <div className={`rounded-xl border-2 p-4 transition-colors ${isApproved ? "border-green-200 bg-green-50/30" : "border-gray-200 bg-white"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">{item.evidence_item_id}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBg}`}>{item.status}</span>
          {item.overall_met != null && (
            <span className={`text-xs font-semibold ${item.overall_met ? "text-green-600" : "text-red-600"}`}>
              {item.overall_met ? "✓ Met" : "✗ Not met"}
            </span>
          )}
        </div>
        <button type="button" onClick={onView} className="text-xs font-medium text-blue-600 hover:underline">View detail</button>
      </div>

      {/* Mini L1→L2→L3 pipeline */}
      <div className="flex items-center gap-0">
        {([
          { level: "L1", data: l1 },
          { level: "L2", data: l2 },
          { level: "L3", data: l3 },
        ]).map((step, i) => {
          const done = step.data?.status === "approved";
          const active = step.data && step.data.status !== "approved";
          return (
            <div key={step.level} className="flex items-center">
              {i > 0 && <div className={`w-6 h-0.5 ${done || active ? "bg-green-300" : "bg-gray-200"}`} />}
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold ${
                done ? "bg-green-100 text-green-700" : active ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"
              }`}>
                {done ? "✓" : active ? "●" : "○"} {step.level}
                {step.data?.reviewer_name && <span className="font-normal text-gray-500">({step.data.reviewer_name})</span>}
              </div>
            </div>
          );
        })}
      </div>

      {item.submitted_at && (
        <div className="mt-2 text-[10px] text-gray-400">
          Submitted {new Date(item.submitted_at).toLocaleDateString()}
          {item.submitter_name && <> by {item.submitter_name}</>}
        </div>
      )}
    </div>
  );
}

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
    if (!cycleId) { setLoading(false); setError("No cycle selected."); return; }
    setError(null);
    setLoading(true);
    try {
      const data = await api.get<ApprovalSummary>(`/assessments/${cycleId}/approval/summary`);
      setSummary(data);
    } catch (e) {
      setSummary(null);
      setError(e instanceof Error ? e.message : "Could not load approval data.");
    } finally {
      setLoading(false);
    }
  }, [cycleId]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  const canApprove = userRole === "approver" || userRole === "admin";

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
    } catch { /* */ }
    setApproving(null);
  };

  if (loading && !summary) return <div className="flex items-center justify-center h-64 text-sm text-gray-400">Loading approval status…</div>;
  if (!cycleId) return <div className="flex-col items-center justify-center h-64 text-center px-4"><p className="text-sm text-gray-500">No assessment cycle selected.</p></div>;
  if (!summary && error) return (
    <div className="flex flex-col items-center justify-center h-64 text-center px-4">
      <p className="text-sm text-gray-600">{error}</p>
      <button type="button" onClick={fetchSummary} className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700">Retry</button>
    </div>
  );
  if (!summary) return <div className="flex items-center justify-center h-64 text-sm text-gray-400">Could not load approval data.</div>;

  const { overall_compliance_pct, total_items, approved_items, review_level_stats, all_l_cleared, evidence_timeline, domain_breakdown, gates } = summary;
  const domains = Object.entries(domain_breakdown).sort(([a], [b]) => a.localeCompare(b));
  const timeline = evidence_timeline ?? [];
  const approvedGateCount = gates.filter((g) => g.status === "approved").length;

  const finalGate = gates.find((g) => g.gate === "final_attestation");
  const preFinalGates = gates.filter((g) => g.gate !== "final_attestation");

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-50/50">
      <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">

        {/* Hero */}
        <section className="rounded-2xl p-6 text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${overall_compliance_pct >= 80 ? "#059669" : "#d97706"} 0%, ${overall_compliance_pct >= 80 ? "#047857" : "#b45309"} 100%)` }}>
          <div className="flex flex-wrap justify-between items-center gap-6">
            <div>
              <p className="text-sm font-medium opacity-90 mb-1">SWIFT CSP Compliance Assessment</p>
              <h1 className="text-4xl font-bold">{overall_compliance_pct}%</h1>
              <p className="text-xs opacity-80 mt-1">{approved_items} of {total_items} evidence items approved</p>
              <p className="text-[11px] opacity-70 mt-2">Senior Sign-Off Authority: Head of Compliance / CISO</p>
            </div>
            <div className="flex gap-2">
              {gates.map((g) => {
                const meta = GATE_META[g.gate];
                return (
                  <div key={g.gate} className={`rounded-xl px-4 py-3 text-center min-w-[80px] ${g.status === "approved" ? "bg-white/25" : "bg-white/10"}`}>
                    <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-sm font-bold mb-1 ${g.status === "approved" ? "bg-white/40" : "bg-white/20"}`}>
                      {g.status === "approved" ? "✓" : meta?.icon || "?"}
                    </div>
                    <p className="text-[10px] font-medium">{meta?.label || g.gate}</p>
                    <p className={`text-[11px] font-bold ${g.status === "approved" ? "text-green-200" : "text-white/70"}`}>
                      {g.status === "approved" ? "Done" : `${g.progress_pct ?? 0}%`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Left column */}
          <div className="space-y-6">

            {/* Journey Timeline */}
            <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <header className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                <h2 className="text-sm font-bold text-gray-800">Approval Journey</h2>
                <p className="text-[10px] text-gray-500 mt-0.5">Evidence lifecycle from submission to final attestation</p>
              </header>
              <div className="p-5">
                <TimelineStep
                  done={total_items > 0 && approved_items > 0}
                  current={total_items > 0 && approved_items === 0}
                  label="Evidence Submission"
                  detail={`${total_items} items submitted`}
                />
                {(["L1", "L2", "L3"] as const).map((level) => {
                  const stats = review_level_stats?.[level];
                  const done = stats ? (stats.total === 0 || stats.approved >= stats.total) : false;
                  const inProgress = stats ? stats.approved > 0 && stats.approved < stats.total : false;
                  return (
                    <TimelineStep
                      key={level}
                      done={done}
                      current={inProgress}
                      label={`${level} Review — ${LEVEL_LABELS[level]}`}
                      detail={stats ? `${stats.approved}/${stats.total} approved` : "No reviews yet"}
                    />
                  );
                })}
                {preFinalGates.map((g) => {
                  const meta = GATE_META[g.gate];
                  return (
                    <TimelineStep
                      key={g.gate}
                      done={g.status === "approved"}
                      current={g.ready && g.status !== "approved"}
                      label={`Gate: ${meta?.label || g.gate}`}
                      detail={g.detail}
                      date={g.approved_at ?? undefined}
                    />
                  );
                })}
                <TimelineStep
                  done={finalGate?.status === "approved"}
                  current={finalGate?.ready === true && finalGate?.status !== "approved"}
                  label="Final Attestation — Head of Compliance"
                  detail={finalGate?.status === "approved" ? "Signed off" : finalGate?.ready ? "Ready for sign-off" : "Waiting for previous gates"}
                  date={finalGate?.approved_at ?? undefined}
                />
              </div>
            </section>

            {/* Evidence Cards with timeline */}
            <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <header className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-800">Evidence Items</h2>
                  <p className="text-[10px] text-gray-500 mt-0.5">{timeline.length} items with full review journey</p>
                </div>
              </header>
              <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                {timeline.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No evidence items yet.</p>
                ) : (
                  timeline.map((item) => (
                    <EvidenceJourneyCard key={item.id} item={item} onView={() => setViewingEvidenceId(item.id)} />
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Review Levels */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Review Levels</h3>
              <div className="space-y-2">
                {(["L1", "L2", "L3"] as const).map((level) => {
                  const s = review_level_stats?.[level];
                  const pct = s?.pct ?? 0;
                  const cleared = !s || s.total === 0 || s.approved >= s.total;
                  return (
                    <div key={level} className={`rounded-lg border-2 p-3 ${cleared ? "border-green-200 bg-green-50/40" : "border-amber-200 bg-amber-50/30"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-gray-700">{level} — {LEVEL_LABELS[level]}</span>
                        <span className="text-xs font-bold" style={{ color: scoreColor(s?.total === 0 ? 100 : pct) }}>{s?.approved ?? 0}/{s?.total ?? 0}</span>
                      </div>
                      <ProgressBar pct={s?.total === 0 ? 100 : pct} h={5} />
                    </div>
                  );
                })}
              </div>
              <div className={`mt-3 rounded-lg border-2 px-3 py-2 flex items-center gap-2 ${all_l_cleared ? "border-green-400 bg-green-50 text-green-800" : "border-gray-200 bg-gray-50 text-gray-600"}`}>
                <span className="text-sm">{all_l_cleared ? "✓" : "○"}</span>
                <span className="text-[11px] font-semibold">{all_l_cleared ? "All levels cleared" : "Waiting for reviews"}</span>
              </div>
            </div>

            {/* Domain Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <header className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Domains</h3>
              </header>
              <div className="p-3 space-y-2 max-h-[250px] overflow-y-auto">
                {domains.map(([domain, bd]) => {
                  const pct = bd.total > 0 ? Math.round((bd.approved / bd.total) * 100) : 0;
                  const color = DOMAIN_COLORS[domain] || "#666";
                  return (
                    <button key={domain} onClick={() => router.push(`/cycles/${cycleId}/domains/${domain}`)} className="w-full text-left rounded-lg border border-gray-100 p-2.5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: color }}>{domain}</span>
                          <span className="text-xs font-semibold text-gray-700">Domain {domain}</span>
                        </div>
                        <span className="text-xs font-bold" style={{ color: scoreColor(pct) }}>{pct}%</span>
                      </div>
                      <ProgressBar pct={pct} h={4} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Summary</h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">Evidence items</span><span className="font-bold text-gray-700">{total_items}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Approved</span><span className="font-bold text-green-600">{approved_items}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Gates cleared</span><span className="font-bold text-gray-700">{approvedGateCount}/{gates.length}</span></div>
              </div>
            </div>

            {/* Approval Gates */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <header className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Approval Gates</h3>
              </header>
              <div className="p-3 space-y-2">
                {gates.map((g, idx) => {
                  const meta = GATE_META[g.gate];
                  const isActive = g.status !== "approved" && (idx === 0 || gates[idx - 1]?.status === "approved");
                  return (
                    <div key={g.gate} className={`rounded-lg border p-3 ${g.status === "approved" ? "border-green-200 bg-green-50/50" : isActive ? "border-blue-200 bg-blue-50/30" : "border-gray-200"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-gray-700">{meta?.label || g.gate}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${g.status === "approved" ? "bg-green-100 text-green-700" : g.ready ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                          {g.status === "approved" ? "Approved" : g.ready ? "Ready" : "Pending"}
                        </span>
                      </div>
                      <ProgressBar pct={g.progress_pct ?? 0} h={4} />
                      <p className="text-[10px] text-gray-500 mt-1">{g.detail}</p>
                      {g.status === "approved" && g.approved_at && <p className="text-[9px] text-green-600 mt-0.5">Approved {new Date(g.approved_at).toLocaleDateString()}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Final Attestation — Senior Sign-Off */}
        <section className={`rounded-2xl border-2 overflow-hidden ${finalGate?.status === "approved" ? "border-green-300 bg-green-50/30" : finalGate?.ready ? "border-blue-300 bg-blue-50/20" : "border-gray-200 bg-gray-50/30"}`}>
          <div className="px-6 py-4 border-b border-gray-200 bg-white/80">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${finalGate?.status === "approved" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                {finalGate?.status === "approved" ? "✓" : "4"}
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Senior Sign-Off Authority</h2>
                <p className="text-xs text-gray-500">Head of Compliance / CISO — Final Attestation</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {finalGate?.status === "approved" ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-2">✓</div>
                <p className="text-sm font-bold text-green-700">Assessment Attested</p>
                <p className="text-xs text-gray-500 mt-1">Signed off on {finalGate.approved_at ? new Date(finalGate.approved_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"}</p>
                {finalGate.notes && <p className="text-xs text-gray-600 mt-2 italic">"{finalGate.notes}"</p>}
              </div>
            ) : (
              <>
                {/* Prerequisites */}
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-gray-700 mb-2">Prerequisites</h4>
                  <div className="space-y-1.5">
                    {preFinalGates.map((g) => {
                      const meta = GATE_META[g.gate];
                      return (
                        <div key={g.gate} className="flex items-center gap-2">
                          <span className={`text-sm ${g.status === "approved" ? "text-green-600" : "text-gray-400"}`}>
                            {g.status === "approved" ? "✓" : "○"}
                          </span>
                          <span className={`text-xs ${g.status === "approved" ? "text-gray-700" : "text-gray-500"}`}>
                            {meta?.label || g.gate}
                          </span>
                          <span className="text-[10px] text-gray-400 ml-auto">{g.progress_pct ?? 0}%</span>
                        </div>
                      );
                    })}
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${all_l_cleared ? "text-green-600" : "text-gray-400"}`}>{all_l_cleared ? "✓" : "○"}</span>
                      <span className={`text-xs ${all_l_cleared ? "text-gray-700" : "text-gray-500"}`}>All review levels (L1/L2/L3) cleared</span>
                    </div>
                  </div>
                </div>

                {canApprove && finalGate?.ready && (
                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                      <p className="text-[11px] font-semibold text-amber-800">MFA verification required for final attestation.</p>
                      <p className="text-[10px] text-amber-700 mt-0.5">By signing, you attest that all evidence has been reviewed and the organization is compliant with the SWIFT CSP framework.</p>
                    </div>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Attestation notes (optional)…" rows={2}
                      className="w-full text-xs border border-gray-300 rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400" />
                    <input type="text" value={mfaToken} onChange={(e) => setMfaToken(e.target.value)} placeholder="Enter MFA token"
                      className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    <button onClick={() => handleApproveGate("final_attestation")}
                      disabled={approving === "final_attestation" || !mfaToken.trim()}
                      className="w-full py-3 text-sm font-bold rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 shadow-md">
                      {approving === "final_attestation" ? "Signing…" : "Attest and Sign Off"}
                    </button>
                  </div>
                )}

                {canApprove && !finalGate?.ready && (
                  <p className="text-xs text-gray-400 text-center py-2">Complete all prerequisites before signing off.</p>
                )}
                {!canApprove && (
                  <p className="text-xs text-gray-400 text-center py-2 italic">
                    {userRole === "compliance_officer" ? "Final attestation requires the Approver role (CISO / Head of Compliance)." : "Read-only access."}
                  </p>
                )}
              </>
            )}
          </div>
        </section>

        {/* Non-final gate approval (for compliance_officer or approver) */}
        {canApprove && preFinalGates.some((g) => g.status !== "approved" && g.ready) && (
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Approve Ready Gates</h3>
            <div className="space-y-3">
              {preFinalGates.filter((g) => g.status !== "approved" && g.ready).map((g, idx) => {
                const isFirst = idx === 0 || preFinalGates.filter((pg) => pg.status !== "approved")[0]?.gate === g.gate;
                if (!isFirst) return null;
                const meta = GATE_META[g.gate];
                return (
                  <div key={g.gate} className="flex items-center gap-3">
                    <div className="flex-1">
                      <span className="text-xs font-bold text-gray-700">{meta?.label || g.gate}</span>
                      <span className="text-[10px] text-gray-500 ml-2">{g.detail}</span>
                    </div>
                    <button onClick={() => handleApproveGate(g.gate)} disabled={approving === g.gate}
                      className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                      {approving === g.gate ? "Approving…" : "Approve"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}
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
