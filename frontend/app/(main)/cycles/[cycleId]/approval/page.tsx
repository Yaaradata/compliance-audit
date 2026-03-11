"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ApprovalEvidenceViewer } from "@/components/approval/approval-evidence-viewer";
import { DOMAINS as DOMAIN_LIST } from "@/lib/frameworks/swift-cscf";
import { LoadingState } from "@/components/ui/loading-state";

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

interface FailedCriterion {
  id: string;
  label: string;
  description: string | null;
}

interface GapItem {
  submission_id: string;
  evidence_item_id: string;
  domain: string;
  status: string;
  eval_summary: string | null;
  failed_criteria: FailedCriterion[];
  remediation_ai: string | null;
  remediation_user: string | null;
  is_documented: boolean;
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
  gap_items?: GapItem[];
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

const LEVEL_ACCENT: Record<string, string> = {
  L1: "border-l-blue-500",
  L2: "border-l-violet-500",
  L3: "border-l-amber-500",
};

const DOMAIN_ACCENT_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
];

function Icon({ path, className }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

function EvidenceJourneyCard({
  item,
  onView,
  accentColor,
}: {
  item: EvidenceTimelineItem;
  onView: () => void;
  accentColor: string;
}) {
  const isApproved = item.status === "approved";
  const levelMap = useMemo(() => {
    const m: Record<string, TimelineReview> = {};
    for (const r of item.reviews) {
      const lv = r.level?.toUpperCase().replace("L1_COMPLETENESS", "L1").replace("L2_QUALITY", "L2").replace("L3_ASSESSMENT", "L3") || r.level;
      m[lv] = r;
    }
    return m;
  }, [item.reviews]);
  const l1 = levelMap["L1"] ?? item.reviews.find((r) => r.level?.toLowerCase().includes("l1"));
  const l2 = levelMap["L2"] ?? item.reviews.find((r) => r.level?.toLowerCase().includes("l2"));
  const l3 = levelMap["L3"] ?? item.reviews.find((r) => r.level?.toLowerCase().includes("l3"));

  const statusBg = isApproved
    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
    : "bg-(--surface) text-(--foreground-muted) border-(--border)";

  return (
    <div
      className="relative rounded-xl border border-(--border) bg-(--surface) overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-(--border-strong) hover:-translate-y-0.5"
      style={{ boxShadow: "var(--shadow)" }}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${accentColor}`} />
      <div className="p-4 pl-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="font-bold text-foreground">{item.evidence_item_id}</span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBg}`}>
                {item.status.replace(/_/g, " ")}
              </span>
              {item.overall_met != null && (
                <span className="text-xs font-semibold text-(--foreground-muted)">
                  {item.overall_met ? "Met" : "Review"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {[
                { level: "L1", data: l1 },
                { level: "L2", data: l2 },
                { level: "L3", data: l3 },
              ].map((step, i) => {
                const done = step.data?.status === "approved";
                const active = step.data && step.data.status !== "approved";
                return (
                  <span key={step.level} className="flex items-center gap-1">
                    {i > 0 && <span className="w-4 h-0.5 rounded bg-(--border)" />}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border border-(--border) ${
                        done ? "bg-(--surface) text-foreground" : "bg-background text-(--foreground-subtle)"
                      }`}
                    >
                      {done ? "✓" : active ? "●" : "○"} {step.level}
                    </span>
                  </span>
                );
              })}
            </div>
            {item.submitted_at && (
              <p className="text-[10px] text-(--foreground-subtle) mt-2">
                Submitted {new Date(item.submitted_at).toLocaleDateString("en-US")}
                {item.submitter_name && <> · {item.submitter_name}</>}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-(--primary-muted) text-(--primary) hover:bg-(--primary) hover:text-white transition-colors"
          >
            <Icon path="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" className="w-3.5 h-3.5" />
            View
          </button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  iconPath,
  colorClass,
  accent,
}: {
  label: string;
  value: number | string;
  sub?: string;
  iconPath: string;
  colorClass: string;
  accent: string;
}) {
  return (
    <div className={`rounded-xl border border-(--border) bg-(--surface) p-4 shadow-(--shadow) hover:shadow-(--shadow-md) transition-all duration-300 overflow-hidden border-l-4 ${accent}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
          <p className="text-sm font-medium text-(--foreground-muted) mt-0.5">{label}</p>
          {sub != null && <p className="text-[10px] text-(--foreground-subtle) mt-0.5">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${colorClass}`}>
          <Icon path={iconPath} className="w-5 h-5 text-current" />
        </div>
      </div>
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
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [editingGapId, setEditingGapId] = useState<string | null>(null);
  const [remediationDraft, setRemediationDraft] = useState("");
  const [savingRemediation, setSavingRemediation] = useState(false);

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
      setError(e instanceof Error ? e.message : "Could not load approval data.");
    } finally {
      setLoading(false);
    }
  }, [cycleId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const canApprove = userRole === "external_assessor" || userRole === "admin";

  const handleApproveGate = async (gateType: string) => {
    setApproving(gateType);
    try {
      await api.post(`/assessments/${cycleId}/approval/${gateType}/approve`, {
        notes: notes || null,
        mfa_token: gateType === "final_attestation" ? mfaToken || null : null,
      });
      setNotes("");
      setMfaToken("");
      await fetchSummary();
    } catch {
      /* ignore */
    } finally {
      setApproving(null);
    }
  };

  const handleSaveRemediation = async (submissionId: string) => {
    if (!remediationDraft.trim()) return;
    setSavingRemediation(true);
    try {
      await api.patch(`/assessments/${cycleId}/submissions/${submissionId}/remediation`, {
        remediation_notes: remediationDraft,
      });
      setEditingGapId(null);
      setRemediationDraft("");
      await fetchSummary();
    } catch {
      /* ignore */
    } finally {
      setSavingRemediation(false);
    }
  };

  const timeline = summary?.evidence_timeline ?? [];
  /** One entry per evidence item (A1, A2, …): deduplicate by normalized evidence_item_id. */
  const timelineOnePerItem = useMemo(() => {
    const byItem = new Map<string, EvidenceTimelineItem>();
    for (const item of timeline) {
      const key = (item.evidence_item_id?.trim() ?? "").toUpperCase() || item.id;
      if (!byItem.has(key)) {
        byItem.set(key, item);
        continue;
      }
      const cur = byItem.get(key)!;
      if (item.status === "approved" && cur.status !== "approved") byItem.set(key, item);
      else if (cur.status !== "approved" && item.submitted_at && (!cur.submitted_at || new Date(item.submitted_at) > new Date(cur.submitted_at!)))
        byItem.set(key, item);
    }
    return Array.from(byItem.values());
  }, [timeline]);
  const evidenceByDomain = useMemo(() => {
    const map = new Map<string, EvidenceTimelineItem[]>();
    for (const item of timelineOnePerItem) {
      const domain = item.evidence_item_id?.charAt(0)?.toUpperCase() || "?";
      if (!map.has(domain)) map.set(domain, []);
      map.get(domain)!.push(item);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [timelineOnePerItem]);

  const evidenceByDomainFiltered = useMemo(() => {
    if (!selectedDomain) return evidenceByDomain;
    return evidenceByDomain.filter(([d]) => d === selectedDomain);
  }, [evidenceByDomain, selectedDomain]);

  const domain_breakdown = summary?.domain_breakdown ?? {};
  const domainsAllAtoH = useMemo(() => {
    return DOMAIN_LIST.map((d) => {
      const bd = domain_breakdown[d.id] ?? { total: 0, approved: 0, submitted: 0, draft: 0 };
      const pct = bd.total > 0 ? Math.round((bd.approved / bd.total) * 100) : 0;
      return { id: d.id, name: d.name, color: d.color, accent: d.accent, ...bd, pct };
    });
  }, [domain_breakdown]);

  if (loading && !summary) {
    return <LoadingState message="Loading approval status…" />;
  }
  if (!cycleId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <p className="text-sm text-(--foreground-muted)">No assessment cycle selected.</p>
      </div>
    );
  }
  if (!summary && error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <p className="text-sm text-foreground">{error}</p>
        <button
          type="button"
          onClick={fetchSummary}
          className="mt-4 px-4 py-2 text-sm font-medium rounded-xl bg-(--primary) text-white hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    );
  }
  if (!summary) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-sm text-(--foreground-muted)">
        Could not load approval data.
      </div>
    );
  }

  const {
    overall_compliance_pct,
    total_items,
    approved_items,
    review_level_stats,
    all_l_cleared,
    gates,
  } = summary;
  const domains = Object.entries(domain_breakdown).sort(([a], [b]) => a.localeCompare(b));
  const approvedGateCount = gates.filter((g) => g.status === "approved").length;
  const finalGate = gates.find((g) => g.gate === "final_attestation");
  const preFinalGates = gates.filter((g) => g.gate !== "final_attestation");

  const readyGatesToShow = canApprove
    ? preFinalGates.filter((g) => g.status !== "approved" && g.ready)
    : [];

  const reportHref = `/cycles/${cycleId}/report`;

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-background">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header — same structure as Review Queue */}
        <header className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-(--primary-muted)">
              <Icon path="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" className="w-5 h-5 text-(--primary)" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Approval</h1>
          </div>
          <Link
            href={reportHref}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-(--primary) text-white hover:opacity-90 transition-opacity shadow-md"
          >
            <Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" className="w-4 h-4" />
            Go to Report
          </Link>
        </header>

        {/* Where to approve — move to Report */}
        {/* Metrics — same pattern as Review Queue (left accent, colored icon) */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <MetricCard
            label="Evidence items"
            value={total_items}
            sub={`${approved_items} approved`}
            iconPath="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            colorClass="bg-slate-200 text-slate-700 dark:bg-slate-500 dark:text-slate-100"
            accent="border-l-slate-400"
          />
          <MetricCard
            label="Gates cleared"
            value={`${approvedGateCount}/${gates.length}`}
            iconPath="M5 13l4 4L19 7"
            colorClass="bg-emerald-400 text-emerald-900 dark:bg-emerald-500 dark:text-white"
            accent="border-l-emerald-500"
          />
          <MetricCard
            label="Review levels"
            value={all_l_cleared ? "Cleared" : "In progress"}
            sub={
              review_level_stats
                ? `L1 ${review_level_stats.L1?.approved ?? 0}/${review_level_stats.L1?.total ?? 0} · L2 ${review_level_stats.L2?.approved ?? 0}/${review_level_stats.L2?.total ?? 0} · L3 ${review_level_stats.L3?.approved ?? 0}/${review_level_stats.L3?.total ?? 0}`
                : undefined
            }
            iconPath="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            colorClass="bg-violet-200 text-violet-800 dark:bg-violet-500 dark:text-white"
            accent="border-l-violet-500"
          />
          <MetricCard
            label="Final attestation"
            value={finalGate?.status === "approved" ? "Signed" : finalGate?.ready ? "Ready" : "Pending"}
            iconPath="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 0110.618 3.04A12.02 12.02 0 0123 12c0 2.37-.73 4.57-2.07 6.57A11.975 11.975 0 0112 22z"
            colorClass="bg-amber-200 text-amber-900 dark:bg-amber-500 dark:text-white"
            accent="border-l-amber-500"
          />
        </section>

        <div className="space-y-6">
          {/* Top: Review Levels | Domains (A–H) | Approval gates — parallel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Review levels */}
            <div className="rounded-xl border border-(--border) bg-(--surface) p-4 shadow-(--shadow) min-w-0">
              <h3 className="text-xs font-bold text-(--foreground-muted) uppercase tracking-wider mb-3">Review levels</h3>
              <div className="space-y-2.5">
                {(["L1", "L2", "L3"] as const).map((level) => {
                  const s = review_level_stats?.[level];
                  const pct = s?.total === 0 ? 100 : (s?.pct ?? 0);
                  const accent = LEVEL_ACCENT[level] ?? "border-l-slate-400";
                  return (
                    <div key={level} className={`rounded-lg border border-(--border) bg-background p-3 border-l-4 ${accent}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-foreground">{level} — {LEVEL_LABELS[level]}</span>
                        <span className="text-xs font-bold tabular-nums text-(--foreground-muted)">{s?.approved ?? 0} / {s?.total ?? 0}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-(--border) overflow-hidden">
                        <div className="h-full rounded-full bg-(--foreground-muted) transition-all duration-300" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 rounded-lg border border-(--border) bg-background px-3 py-2.5 flex items-center gap-2">
                <span className="text-sm text-(--foreground-muted)">{all_l_cleared ? "✓" : "○"}</span>
                <span className="text-[11px] font-semibold text-foreground">{all_l_cleared ? "All levels cleared" : "Waiting for reviews"}</span>
              </div>
            </div>

            {/* Domains (A–H) — shown in parallel (grid) */}
            <div className="rounded-xl border border-(--border) bg-(--surface) overflow-hidden shadow-(--shadow) min-w-0">
              <header className="px-4 py-3 border-b border-(--border) bg-background/50">
                <h3 className="text-xs font-bold text-(--foreground-muted) uppercase tracking-wider">Domains (A–H)</h3>
              </header>
              <div className="p-3 grid grid-cols-4 gap-2">
                {domainsAllAtoH.map((d) => {
                  const isSelected = selectedDomain === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedDomain(isSelected ? null : d.id)}
                      className={`rounded-lg border p-2 transition-colors flex flex-col items-center text-center min-w-0 ${
                        isSelected
                          ? "border-(--primary) bg-(--primary-muted) ring-1 ring-(--primary)/30"
                          : "border-(--border) hover:bg-background"
                      }`}
                    >
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm mb-1.5"
                        style={{ backgroundColor: d.color }}
                      >
                        {d.id}
                      </span>
                      <span className="text-[10px] font-semibold text-foreground truncate w-full">Domain {d.id}</span>
                      <span className="text-[10px] font-bold tabular-nums text-(--foreground-muted) mt-0.5">{d.pct}%</span>
                      <div className="w-full h-1.5 rounded-full bg-(--border) overflow-hidden mt-1">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${d.pct}%`, backgroundColor: d.color }}
                        />
                      </div>
                      {d.total > 0 && (
                        <p className="text-[8px] text-(--foreground-subtle) mt-0.5">{d.approved}/{d.total}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Approval gates — next to Domains */}
            <div className="rounded-xl border border-(--border) bg-(--surface) overflow-hidden shadow-(--shadow) min-w-0">
              <header className="px-4 py-3 border-b border-(--border) bg-background/50">
                <h3 className="text-xs font-bold text-(--foreground-muted) uppercase tracking-wider">Approval gates</h3>
              </header>
              <div className="p-3 space-y-2 max-h-[220px] overflow-y-auto">
                {gates.map((g) => {
                  const meta = GATE_META[g.gate];
                  return (
                    <div key={g.gate} className="rounded-lg border border-(--border) bg-background p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-foreground">{meta?.label ?? g.gate}</span>
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold border border-(--border) bg-(--surface) text-(--foreground-muted)">
                          {g.status === "approved" ? "Done" : g.ready ? "Ready" : "Pending"}
                        </span>
                      </div>
                      <div className="h-1 w-full rounded-full bg-(--border) overflow-hidden">
                        <div className="h-full rounded-full bg-(--foreground-muted)" style={{ width: `${g.progress_pct ?? 0}%` }} />
                      </div>
                      <p className="text-[10px] text-(--foreground-muted) mt-1.5">{g.detail}</p>
                      {g.status === "approved" && g.approved_at && (
                        <p className="text-[9px] text-(--foreground-subtle) mt-1">
                          Approved {new Date(g.approved_at).toLocaleDateString("en-US")}
                        </p>
                      )}
                    </div>
                  );
                })}
          </div>
        </div>
      </div>

          {/* Below: Evidence items */}
          <section className="rounded-xl border border-(--border) bg-(--surface) overflow-hidden shadow-(--shadow)">
            <header className="px-5 py-4 border-b border-(--border) bg-background/50">
              <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
                  <h2 className="text-sm font-bold text-foreground">
                    Evidence items{selectedDomain ? ` — Domain ${selectedDomain}` : ""}
                  </h2>
                  <p className="text-[10px] text-(--foreground-muted) mt-0.5">
                    {evidenceByDomainFiltered.reduce((acc, [, items]) => acc + items.length, 0)} items
                    {selectedDomain && " (filtered)"}
                  </p>
                  </div>
                {selectedDomain && (
                  <button
                    type="button"
                    onClick={() => setSelectedDomain(null)}
                    className="text-[11px] font-medium text-(--primary) hover:underline"
                  >
                    Show all domains
                  </button>
                )}
              </div>
            </header>
            <div className="p-4 space-y-5 max-h-[520px] overflow-y-auto">
              {evidenceByDomainFiltered.length === 0 ? (
                <p className="text-sm text-(--foreground-muted) text-center py-8">
                  {selectedDomain ? `No evidence items for Domain ${selectedDomain}.` : "No evidence items yet."}
                </p>
              ) : (
                evidenceByDomainFiltered.map(([domain], idx) => {
                  const items = evidenceByDomainFiltered.find(([d]) => d === domain)?.[1] ?? [];
                  const accentColor = DOMAIN_ACCENT_COLORS[idx % DOMAIN_ACCENT_COLORS.length];
                  return (
                    <div key={domain}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${accentColor} text-white font-bold text-sm shadow`}>
                          {domain}
                        </span>
                        <h2 className="text-sm font-bold text-(--foreground-muted) uppercase tracking-wider">Domain {domain}</h2>
                        <span className="text-xs font-medium text-(--foreground-subtle) bg-background px-2 py-0.5 rounded-full">({items.length})</span>
                      </div>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <EvidenceJourneyCard
                            key={item.id}
                            item={item}
                            onView={() => setViewingEvidenceId(item.id)}
                            accentColor={accentColor}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
          </section>
        </div>

        {/* Gaps & Remediation */}
        {(() => {
          const gapItems = summary?.gap_items ?? [];
          const gapsByDomain = new Map<string, GapItem[]>();
          for (const g of gapItems) {
            if (!gapsByDomain.has(g.domain)) gapsByDomain.set(g.domain, []);
            gapsByDomain.get(g.domain)!.push(g);
          }
          const domainEntries = Array.from(gapsByDomain.entries()).sort(([a], [b]) => a.localeCompare(b));
          const documented = gapItems.filter((g) => g.is_documented).length;
          const total = gapItems.length;
          const canEdit = userRole === "external_assessor" || userRole === "admin" || userRole === "compliance_officer";

          return (
            <section className="mt-6 rounded-xl border border-(--border) overflow-hidden shadow-(--shadow) bg-(--surface)">
              <header className="px-5 py-4 border-b border-(--border) bg-background/50 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-orange-100 dark:bg-orange-900/30">
                    <Icon path="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">Gaps & Remediation</h2>
                    <p className="text-[10px] text-(--foreground-muted) mt-0.5">
                      {total === 0
                        ? "No gaps identified — all evaluated items passed"
                        : `${documented}/${total} gaps documented`}
                    </p>
                  </div>
                </div>
                {total > 0 && (
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    documented === total
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                  }`}>
                    {documented === total ? "All documented" : `${total - documented} need remediation`}
                  </span>
                )}
              </header>

              <div className="p-4 max-h-[520px] overflow-y-auto">
                {total === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="text-3xl mb-2 text-emerald-500">✓</div>
                    <p className="text-sm font-semibold text-foreground">No gaps found</p>
                    <p className="text-xs text-(--foreground-muted) mt-1">All evaluated evidence items meet their criteria.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {domainEntries.map(([domain, items]) => {
                      const domainDoc = items.filter((g) => g.is_documented).length;
                      return (
                        <div key={domain}>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500 text-white font-bold text-xs shadow">
                              {domain}
                            </span>
                            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Domain {domain}</h3>
                            <span className="text-[10px] text-(--foreground-muted) ml-auto">{domainDoc}/{items.length} documented</span>
                          </div>
                          <div className="space-y-2">
                            {items.map((gap) => (
                              <div
                                key={gap.submission_id}
                                className={`rounded-lg border p-3 ${
                                  gap.is_documented
                                    ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20"
                                    : "border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${gap.is_documented ? "bg-emerald-500" : "bg-orange-500"}`} />
                                    <span className="text-xs font-bold text-foreground">{gap.evidence_item_id}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-background border border-(--border) text-(--foreground-muted)">{gap.status}</span>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold shrink-0 ${
                                    gap.is_documented
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400"
                                      : "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400"
                                  }`}>
                                    {gap.is_documented ? "Documented" : "Needs plan"}
                                  </span>
                                </div>

                                {gap.eval_summary && (
                                  <p className="text-[11px] text-(--foreground-muted) mb-2 italic">{gap.eval_summary}</p>
                                )}

                                {gap.failed_criteria.length > 0 && (
                                  <div className="mb-2">
                                    <p className="text-[10px] font-semibold text-(--foreground-muted) mb-1">Failed criteria:</p>
                                    <ul className="space-y-0.5">
                                      {gap.failed_criteria.map((c) => (
                                        <li key={c.id} className="flex items-start gap-1.5 text-[10px] text-(--foreground-muted)">
                                          <span className="text-orange-500 mt-0.5 shrink-0">✕</span>
                                          <span>
                                            <span className="font-semibold">{c.label}</span>
                                            {c.description && <span className="text-(--foreground-subtle)"> — {c.description}</span>}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {gap.remediation_ai && (
                                  <div className="rounded-md bg-background border border-(--border) px-3 py-2 mb-2">
                                    <p className="text-[10px] font-semibold text-(--foreground-muted) mb-0.5">AI remediation</p>
                                    <p className="text-[11px] text-foreground whitespace-pre-line">{gap.remediation_ai}</p>
                                  </div>
                                )}

                                {gap.remediation_user && editingGapId !== gap.submission_id && (
                                  <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 px-3 py-2 mb-2">
                                    <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 mb-0.5">Remediation plan</p>
                                    <p className="text-[11px] text-foreground whitespace-pre-line">{gap.remediation_user}</p>
                                  </div>
                                )}

                                {editingGapId === gap.submission_id ? (
                                  <div className="mt-2 space-y-2">
                                    <textarea
                                      value={remediationDraft}
                                      onChange={(e) => setRemediationDraft(e.target.value)}
                                      rows={3}
                                      placeholder="Describe remediation plan: what will be done, by whom, timeline…"
                                      className="w-full text-xs border border-(--border) rounded-lg p-2.5 resize-none bg-background text-foreground placeholder:text-(--foreground-subtle) focus:outline-none focus:ring-2 focus:ring-(--primary)/30"
                                    />
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleSaveRemediation(gap.submission_id)}
                                        disabled={savingRemediation || !remediationDraft.trim()}
                                        className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-(--primary) text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                                      >
                                        {savingRemediation ? "Saving…" : "Save remediation"}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => { setEditingGapId(null); setRemediationDraft(""); }}
                                        className="px-3 py-1.5 text-[11px] font-semibold rounded-lg border border-(--border) text-(--foreground-muted) hover:bg-background transition-colors"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : canEdit ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingGapId(gap.submission_id);
                                      setRemediationDraft(gap.remediation_user || "");
                                    }}
                                    className="mt-1 text-[11px] font-medium text-(--primary) hover:underline"
                                  >
                                    {gap.remediation_user ? "Edit remediation plan" : "Add remediation plan"}
                                  </button>
                                ) : null}
                </div>
              ))}
                          </div>
                        </div>
                      );
                    })}
            </div>
          )}
        </div>
            </section>
          );
        })()}

        {/* Final attestation — approve here to then move to Report */}
        <section id="final-attestation" className="mt-6 rounded-xl border border-(--border) overflow-hidden shadow-(--shadow) bg-(--surface) scroll-mt-4">
          <div className="px-6 py-4 border-b border-(--border) bg-background/50">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold border-2 border-(--border-strong) bg-(--surface) text-foreground">
                {finalGate?.status === "approved" ? (
                  <Icon path="M5 13l4 4L19 7" className="w-5 h-5" />
                ) : (
                  "4"
                )}
              </div>
              <h2 className="text-base font-bold text-foreground">Final attestation</h2>
            </div>
          </div>

          <div className="p-6">
            {finalGate?.status === "approved" ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-2 text-foreground">✓</div>
                <p className="text-sm font-bold text-foreground">Assessment attested</p>
                <p className="text-xs text-(--foreground-muted) mt-1">
                  Signed off on{" "}
                  {finalGate.approved_at
                    ? new Date(finalGate.approved_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </p>
                {finalGate.notes && (
                  <p className="text-xs text-(--foreground-muted) mt-2 italic">"{finalGate.notes}"</p>
                )}
                <div className="mt-6 pt-4 border-t border-(--border)">
                  <Link
                    href={reportHref}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-(--primary) text-white hover:opacity-90 transition-opacity shadow-md"
                  >
                    <Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" className="w-4 h-4" />
                    Go to Report
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-foreground mb-2">Prerequisites</h4>
                  <div className="space-y-2">
                    {preFinalGates.map((g) => {
                      const meta = GATE_META[g.gate];
                      return (
                        <div key={g.gate} className="flex items-center gap-2">
                          <span className="text-(--foreground-muted)">
                            {g.status === "approved" ? "✓" : "○"}
                          </span>
                          <span
                            className={`text-xs ${g.status === "approved" ? "text-foreground" : "text-(--foreground-muted)"}`}
                          >
                            {meta?.label ?? g.gate}
                          </span>
                          <span className="text-[10px] text-(--foreground-subtle) ml-auto">
                            {g.progress_pct ?? 0}%
                          </span>
                        </div>
                      );
                    })}
                    <div className="flex items-center gap-2">
                      <span className="text-(--foreground-muted)">
                        {all_l_cleared ? "✓" : "○"}
                      </span>
                      <span
                        className={`text-xs ${all_l_cleared ? "text-foreground" : "text-(--foreground-muted)"}`}
                      >
                        All review levels (L1/L2/L3) cleared
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-(--border) pt-4 space-y-3">
                  {canApprove && finalGate?.ready && (
                    <>
                      <div className="rounded-lg border border-(--border) bg-background px-3 py-2.5">
                        <p className="text-[11px] font-semibold text-foreground">MFA required to sign off.</p>
                      </div>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Attestation notes (optional)…"
                        rows={2}
                        className="w-full text-xs border border-(--border) rounded-lg p-2.5 resize-none bg-background text-foreground placeholder:text-(--foreground-subtle) focus:outline-none focus:ring-2 focus:ring-(--primary)/30"
                      />
                      <input
                        type="text"
                        value={mfaToken}
                        onChange={(e) => setMfaToken(e.target.value)}
                        placeholder="Enter MFA token"
                        className="w-full text-sm border border-(--border) rounded-lg p-2.5 bg-background text-foreground placeholder:text-(--foreground-subtle) focus:outline-none focus:ring-2 focus:ring-(--primary)/30"
                      />
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => canApprove && finalGate?.ready && handleApproveGate("final_attestation")}
                    disabled={!canApprove || !finalGate?.ready || approving === "final_attestation" || (!!(canApprove && finalGate?.ready) && !mfaToken.trim())}
                    className="w-full py-3 text-sm font-bold rounded-xl bg-(--primary) text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-opacity"
                  >
                    {approving === "final_attestation" ? "Signing…" : "Approve"}
                  </button>
                  {canApprove && !finalGate?.ready && (
                    <p className="text-xs text-(--foreground-muted) text-center">
                      Complete all prerequisites above before you can approve.
                    </p>
                  )}
                  {!canApprove && (
                    <p className="text-xs text-(--foreground-muted) text-center italic">
                      {userRole === "compliance_officer"
                        ? "Final attestation requires the Approver role (CISO / Head of Compliance)."
                        : "Read-only access."}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Approve ready (non-final) gates */}
        {readyGatesToShow.length > 0 && (
          <section className="mt-6 rounded-xl border border-(--border) bg-(--surface) p-5 shadow-(--shadow)">
            <h3 className="text-sm font-bold text-foreground mb-3">Ready to approve</h3>
            <div className="space-y-3">
              {readyGatesToShow.slice(0, 1).map((g) => {
                const meta = GATE_META[g.gate];
                return (
                  <div
                    key={g.gate}
                    className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-(--border) bg-background"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-foreground">
                        {meta?.label ?? g.gate}
                      </span>
                      <p className="text-[10px] text-(--foreground-muted) mt-0.5">{g.detail}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApproveGate(g.gate)}
                      disabled={approving === g.gate}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-(--primary) text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      {approving === g.gate ? "Approving…" : "Approve"}
          </button>
                  </div>
                );
              })}
        </div>
          </section>
        )}
      </div>

      {/* Evidence detail panel */}
      {viewingEvidenceId && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-(--surface) border-l border-(--border) shadow-xl z-50 flex flex-col">
          <ApprovalEvidenceViewer
            cycleId={cycleId}
            submissionId={viewingEvidenceId}
            onClose={() => setViewingEvidenceId(null)}
          />
        </div>
      )}
    </div>
  );
}
