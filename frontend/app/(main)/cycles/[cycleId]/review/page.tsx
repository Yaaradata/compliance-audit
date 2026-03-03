"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { EvidenceDetailModal } from "@/components/review/evidence-viewer";
import { EmptyState } from "@/components/ui/loading-state";

interface ApiReview {
  id: string;
  submission_id: string;
  reviewer_id: string;
  level: string;
  status: string;
  decision: string | null;
  assigned_at: string;
  completed_at: string | null;
  evidence_item_id: string | null;
  submission_status: string | null;
}

const STATUS_TABS = [
  { key: "all", label: "All", icon: "M4 6h16M4 12h16M4 18h16" },
  { key: "assigned", label: "My Queue", icon: "M12 8v4l3 3m6-3a9 9A9 9 0 11-18 0 9 9 0 0118 0z" },
  { key: "approved", label: "Approved", icon: "M9 12l2 2 4-4m6 2a9 9A9 9 0 11-18 0 9 9 0 0118 0z" },
  { key: "returned", label: "Returned", icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9A9 9 0 11-18 0 9 9 0 0118 0z" },
] as const;

const LEVEL_COLORS: Record<string, { bg: string; text: string; ring: string; border: string; light: string; gradient: string }> = {
  L1: { bg: "bg-blue-600", text: "text-blue-700", ring: "ring-blue-400", border: "border-l-blue-500", light: "bg-blue-50", gradient: "from-blue-500 to-cyan-500" },
  L2: { bg: "bg-violet-600", text: "text-violet-700", ring: "ring-violet-400", border: "border-l-violet-500", light: "bg-violet-50", gradient: "from-violet-500 to-purple-600" },
  L3: { bg: "bg-amber-600", text: "text-amber-700", ring: "ring-amber-400", border: "border-l-amber-500", light: "bg-amber-50", gradient: "from-amber-500 to-orange-500" },
};

const DOMAIN_ACCENT_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-fuchsia-500",
  "bg-indigo-500",
];

const LEVEL_LABELS: Record<string, string> = {
  L1: "Completeness",
  L2: "Quality",
  L3: "Assessment",
};

const LEVEL_FILTERS: { key: "all" | "L1" | "L2" | "L3"; label: string }[] = [
  { key: "all", label: "All levels" },
  { key: "L1", label: "L1" },
  { key: "L2", label: "L2" },
  { key: "L3", label: "L3" },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  assigned: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
  approved: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  returned: { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-700 dark:text-rose-300", dot: "bg-rose-500" },
};

function normalizeLevel(level: string): string {
  return ({ l1_completeness: "L1", l2_quality: "L2", l3_assessment: "L3" } as Record<string, string>)[level] || level;
}

function domainFrom(itemId: string | null) {
  return itemId ? itemId.charAt(0).toUpperCase() : "?";
}

function Icon({ path, className }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

/** One card per evidence item (e.g. A1); click opens detail in a popup. L1/L2/L3 switchable in card. */
function EvidenceItemCard({
  evidenceItemId,
  reviews,
  onOpenDetail,
  userRole,
  compact = false,
}: {
  evidenceItemId: string;
  reviews: ApiReview[];
  onOpenDetail: (reviewId: string, evidenceItemId: string) => void;
  userRole: string;
  compact?: boolean;
}) {
  const [levelMenuOpen, setLevelMenuOpen] = useState(false);
  const levels = ["L1", "L2", "L3"] as const;
  const reviewByLevel = useMemo(() => {
    const m = new Map<string, ApiReview>();
    for (const r of reviews) m.set(normalizeLevel(r.level), r);
    return m;
  }, [reviews]);
  const defaultLevel = useMemo(() => {
    const assigned = reviews.find((r) => r.status === "assigned");
    if (assigned) return normalizeLevel(assigned.level);
    for (const lv of levels) if (reviewByLevel.get(lv)) return lv;
    return "L1";
  }, [reviews, reviewByLevel]);
  const [selectedLevel, setSelectedLevel] = useState<string>(defaultLevel);
  useEffect(() => {
    if (reviewByLevel.get(selectedLevel) === undefined) setSelectedLevel(defaultLevel);
  }, [defaultLevel, reviewByLevel, selectedLevel]);
  const selectedReview = reviewByLevel.get(selectedLevel) ?? reviews[0];
  const displayLevel = selectedLevel as "L1" | "L2" | "L3";
  const lc = LEVEL_COLORS[displayLevel] || LEVEL_COLORS.L1;
  const statusStyle = STATUS_STYLES[selectedReview.status] || STATUS_STYLES.assigned;
  const assignedDate = new Date(selectedReview.assigned_at);
  const dateStr = assignedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const timeStr = assignedDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const levelLabel = LEVEL_LABELS[displayLevel] ?? displayLevel;
  const levelDisplay = `Level ${displayLevel} — ${levelLabel}`;

  const handleLevelSelect = (level: string) => {
    if (reviewByLevel.get(level)) setSelectedLevel(level);
    setLevelMenuOpen(false);
  };

  return (
    <div
      className="relative rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-visible transition-all duration-300 ease-out hover:border-[var(--border-strong)] hover:shadow-lg hover:-translate-y-0.5"
      style={{ boxShadow: "var(--shadow)" }}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${lc.bg}`} />

      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpenDetail(selectedReview.id, evidenceItemId)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpenDetail(selectedReview.id, evidenceItemId); } }}
        className={`w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 rounded-xl cursor-pointer ${compact ? "p-3 pl-4" : "p-4 pl-5"}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className={`flex items-center gap-2 flex-wrap ${compact ? "mb-2" : "mb-3"}`}>
              <span className="font-semibold text-[var(--foreground)] truncate">{evidenceItemId}</span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${statusStyle.bg} ${statusStyle.text}`}>
                <span className={`w-1 h-1 rounded-full ${statusStyle.dot}`} />
                {selectedReview.status}
              </span>
            </div>
            <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLevelMenuOpen((o) => !o); }}
                className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${lc.light} ${lc.text} border-[var(--border)] hover:border-[var(--border-strong)]`}
              >
                {levelDisplay}
                <Icon path="M19 9l-7 7-7-7" className={`w-3.5 h-3.5 shrink-0 transition-transform ${levelMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {levelMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" aria-hidden onClick={() => setLevelMenuOpen(false)} />
                  <div className="absolute left-0 top-full z-[100] mt-1 w-56 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl py-1.5">
                    {levels.map((level) => {
                      const rev = reviewByLevel.get(level);
                      const isCurrent = displayLevel === level;
                      const isDone = rev?.status === "approved";
                      const levelColor = LEVEL_COLORS[level];
                      if (!rev) return null;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLevelSelect(level); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left ${isDone ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300" : isCurrent ? `${levelColor.light} ${levelColor.text}` : "text-[var(--foreground-muted)]"} hover:bg-[var(--background)]`}
                        >
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-current">
                            {isDone ? <Icon path="M5 13l4 4L19 7" className="w-2.5 h-2.5" /> : isCurrent ? <span className="text-[8px] font-bold">●</span> : <span className="text-[8px]">○</span>}
                          </span>
                          <span className="font-medium">{level} — {LEVEL_LABELS[level]}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] sm:text-xs text-[var(--foreground-muted)]">
              {dateStr}{!compact && ` · ${timeStr}`}
            </span>
            <span className="p-1 rounded-lg bg-[var(--background)]">
              <Icon path="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" className="w-3.5 h-3.5 text-[var(--foreground-muted)]" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  iconPath,
  colorClass,
  accent,
}: {
  label: string;
  value: number;
  iconPath: string;
  colorClass: string;
  accent?: string;
}) {
  return (
    <div className={`rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] hover:shadow-[var(--shadow-md)] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden ${accent ? `border-l-4 ${accent}` : ""}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold tabular-nums text-[var(--foreground)]">{value}</p>
          <p className="text-sm font-medium text-[var(--foreground-muted)] mt-0.5">{label}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${colorClass}`}>
          <Icon path={iconPath} className="w-5 h-5 text-current" />
        </div>
      </div>
    </div>
  );
}

function ReviewQueueSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((g) => (
        <div key={g}>
          <div className="h-4 w-24 bg-[var(--border)] rounded mb-3 animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 animate-pulse">
                <div className="flex justify-between mb-2">
                  <div className="h-4 w-32 bg-[var(--border)] rounded" />
                  <div className="h-4 w-20 bg-[var(--border)] rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-[var(--border)] rounded" />
                  <div className="h-5 w-20 bg-[var(--border)] rounded" />
                  <div className="h-5 w-14 bg-[var(--border)] rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const VALID_LEVELS = ["L1", "L2", "L3"] as const;

export default function CycleReviewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const cycleId = params.cycleId as string;
  const { user } = useAuth();
  const userRole = user?.role || "compliance_officer";

  const levelFromUrl = searchParams.get("level");
  const initialLevel = levelFromUrl && VALID_LEVELS.includes(levelFromUrl as (typeof VALID_LEVELS)[number]) ? levelFromUrl : "all";

  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>(initialLevel);
  const [modalReviewId, setModalReviewId] = useState<string | null>(null);
  const [modalEvidenceItemId, setModalEvidenceItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (levelFromUrl && VALID_LEVELS.includes(levelFromUrl as (typeof VALID_LEVELS)[number])) {
      setLevelFilter(levelFromUrl);
    } else if (levelFromUrl === null || levelFromUrl === "") {
      setLevelFilter("all");
    }
  }, [levelFromUrl]);

  const updateLevelFilter = useCallback(
    (lv: string) => {
      setLevelFilter(lv);
      const params = new URLSearchParams(searchParams.toString());
      if (lv === "all") {
        params.delete("level");
      } else {
        params.set("level", lv);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname ?? "");
    },
    [pathname, router, searchParams]
  );

  const fetchReviews = useCallback(async () => {
    if (!cycleId) return;
    setLoading(true);
    try {
      const data = await api.get<ApiReview[]>(`/assessments/${cycleId}/reviews`);
      setReviews(data);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [cycleId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const metrics = useMemo(() => {
    const assigned = reviews.filter((r) => r.status === "assigned").length;
    const approved = reviews.filter((r) => r.status === "approved").length;
    const returned = reviews.filter((r) => r.status === "returned").length;
    return { assigned, approved, returned, total: reviews.length };
  }, [reviews]);

  const filtered = useMemo(() => {
    let list = reviews;
    if (filter === "assigned") {
      list = list.filter((r) => r.status === "assigned" && r.reviewer_id === user?.id);
    } else if (filter !== "all") {
      list = list.filter((r) => r.status === filter);
    }
    if (levelFilter !== "all") {
      list = list.filter((r) => normalizeLevel(r.level) === levelFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (r) =>
          (r.evidence_item_id?.toLowerCase().includes(q)) ||
          (r.submission_id?.toLowerCase().includes(q))
      );
    }
    return list;
  }, [filter, levelFilter, reviews, user?.id, searchQuery]);

  /** Group by evidence_item_id (one card per A1, A2, …), then by domain for section headers. */
  const groupedByItemThenDomain = useMemo(() => {
    const byItem = new Map<string, ApiReview[]>();
    for (const r of filtered) {
      const id = r.evidence_item_id ?? r.submission_id;
      if (!byItem.has(id)) byItem.set(id, []);
      byItem.get(id)!.push(r);
    }
    const byDomain = new Map<string, { itemId: string; reviews: ApiReview[] }[]>();
    for (const [itemId, revs] of byItem.entries()) {
      const domain = domainFrom(itemId);
      if (!byDomain.has(domain)) byDomain.set(domain, []);
      byDomain.get(domain)!.push({ itemId, reviews: revs });
    }
    return Array.from(byDomain.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([domain, items]) => [domain, items.sort((x, y) => x.itemId.localeCompare(y.itemId))] as const);
  }, [filtered]);

  const handleAction = async (
    reviewId: string,
    decision: "approve" | "return",
    _comment?: string,
    checklistResults?: Record<string, { checked: boolean; note?: string | null }>,
  ) => {
    try {
      const res = await api.put<{ review: ApiReview; next_review_id: string | null }>(
        `/reviews/${reviewId}`,
        { decision, checklist_results: checklistResults ?? null }
      );
      if (res?.next_review_id) {
        updateLevelFilter("all");
        setFilter("all");
      }
      await fetchReviews();
      setModalReviewId(null);
      setModalEvidenceItemId(null);
    } catch { /* ignore */ }
  };

  const hasActiveFilters = filter !== "all" || levelFilter !== "all" || searchQuery.trim() !== "";
  const statusCounts = useMemo(() => ({
    all: reviews.length,
    assigned: reviews.filter((r) => r.status === "assigned" && r.reviewer_id === user?.id).length,
    approved: reviews.filter((r) => r.status === "approved").length,
    returned: reviews.filter((r) => r.status === "returned").length,
  }), [reviews, user?.id]);
  const levelCounts = useMemo(() => ({
    all: reviews.length,
    L1: reviews.filter((r) => normalizeLevel(r.level) === "L1").length,
    L2: reviews.filter((r) => normalizeLevel(r.level) === "L2").length,
    L3: reviews.filter((r) => normalizeLevel(r.level) === "L3").length,
  }), [reviews]);

  const clearFilters = () => {
    setFilter("all");
    updateLevelFilter("all");
    setSearchQuery("");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-[var(--background)]">
      <div className="w-full">
        <header className="mb-6 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--primary-muted)]">
            <Icon path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">Review Queue</h1>
        </header>

        {/* Metrics — colorful left accent */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <MetricCard label="Total" value={metrics.total} iconPath="M4 6h16M4 10h16M4 14h16M4 18h16" colorClass="bg-slate-200 text-slate-700 dark:bg-slate-500 dark:text-slate-100" accent="border-l-slate-400" />
          <MetricCard label="In queue" value={metrics.assigned} iconPath="M12 8v4l3 3m6-3a9 9A9 9 0 11-18 0 9 9 0 0118 0z" colorClass="bg-amber-400 text-amber-900 dark:bg-amber-500 dark:text-white" accent="border-l-amber-500" />
          <MetricCard label="Approved" value={metrics.approved} iconPath="M9 12l2 2 4-4m6 2a9 9A9 9 0 11-18 0 9 9 0 0118 0z" colorClass="bg-emerald-400 text-emerald-900 dark:bg-emerald-500 dark:text-white" accent="border-l-emerald-500" />
          <MetricCard label="Returned" value={metrics.returned} iconPath="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9A9 9 0 11-18 0 9 9 0 0118 0z" colorClass="bg-rose-400 text-rose-900 dark:bg-rose-500 dark:text-white" accent="border-l-rose-500" />
        </section>

        {/* Flexible filter bar: search + status chips with counts + level chips + clear + view toggle */}
        <section className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <label className="sr-only">Search</label>
              <div className="relative flex-1 min-w-[180px] max-w-xs">
                <Icon path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
                <input
                  type="search"
                  placeholder="Search by ID…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                />
              </div>
              <span className="text-[var(--foreground-subtle)] text-sm hidden sm:inline">Status</span>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_TABS.map((t) => {
                  const count = statusCounts[t.key];
                  const isActive = filter === t.key;
                  const isDisabled = count === 0 && !isActive;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => !isDisabled && setFilter(t.key)}
                      disabled={isDisabled}
                      aria-pressed={isActive}
                      aria-label={`${t.label}, ${count} items`}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border
                        ${isActive
                          ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md"
                          : isDisabled
                            ? "bg-[var(--background)] border-[var(--border)] text-[var(--foreground-subtle)] opacity-60 cursor-not-allowed"
                            : "bg-[var(--background)] border-[var(--border)] text-[var(--foreground-muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)]"}
                      `}
                    >
                      <Icon path={t.icon} className="w-4 h-4 shrink-0" />
                      {t.label}
                      <span className={`tabular-nums ${isActive ? "text-white/90" : "text-[var(--foreground-subtle)]"}`}>({count})</span>
                    </button>
                  );
                })}
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  aria-label="Clear all filters"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800 transition-colors"
                >
                  <Icon path="M6 18L18 6M6 6l12 12" className="w-4 h-4" />
                  Clear filters
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-3">
              <span className="text-[var(--foreground-subtle)] text-sm">Level</span>
              {LEVEL_FILTERS.map(({ key: lv, label: tabLabel }) => {
                const count = levelCounts[lv];
                const isActive = levelFilter === lv;
                const isDisabled = count === 0 && !isActive;
                const levelLabel = lv === "all" ? tabLabel : `${lv} ${LEVEL_LABELS[lv]}`;
                return (
                  <button
                    key={lv}
                    type="button"
                    onClick={() => !isDisabled && updateLevelFilter(lv)}
                    disabled={isDisabled}
                    aria-pressed={isActive}
                    aria-label={`${levelLabel}, ${count} items`}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border
                      ${isActive
                        ? lv === "all"
                          ? "bg-[var(--foreground)] text-[var(--surface)] border-[var(--foreground)]"
                          : `${LEVEL_COLORS[lv]?.light} ${LEVEL_COLORS[lv]?.text} border-current ring-1 ${LEVEL_COLORS[lv]?.ring}`
                        : isDisabled
                          ? "bg-[var(--surface)] border-[var(--border)] text-[var(--foreground-subtle)] opacity-60 cursor-not-allowed"
                          : "bg-[var(--surface)] border-[var(--border)] text-[var(--foreground-muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"}
                    `}
                  >
                    {levelLabel}
                    <span className="tabular-nums opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-[var(--foreground-muted)] mb-4">
            Showing <strong className="text-[var(--foreground)]">{groupedByItemThenDomain.reduce((acc, [, rows]) => acc + rows.length, 0)}</strong> {groupedByItemThenDomain.reduce((acc, [, rows]) => acc + rows.length, 0) === 1 ? "item" : "items"}
            {hasActiveFilters && " (filtered)"}
          </p>
        )}

        {/* Content */}
        {loading ? (
          <ReviewQueueSkeleton />
        ) : groupedByItemThenDomain.length === 0 ? (
          <EmptyState
            title="No reviews found"
            description={hasActiveFilters ? "Try clearing filters or different criteria." : "Reviews appear here once evidence is submitted for review."}
          />
        ) : (
          <div className="space-y-6">
            {groupedByItemThenDomain.map(([domain], idx) => {
              const itemRows = groupedByItemThenDomain.find(([d]) => d === domain)?.[1] ?? [];
              const accentColor = DOMAIN_ACCENT_COLORS[idx % DOMAIN_ACCENT_COLORS.length];
              return (
                <section key={domain}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${accentColor} text-white font-bold text-sm shadow`}>
                      {domain}
                    </span>
                    <h2 className="text-sm font-bold text-[var(--foreground-muted)] uppercase tracking-wider">Domain {domain}</h2>
                    <span className="text-xs font-medium text-[var(--foreground-subtle)] bg-[var(--background)] px-2 py-0.5 rounded-full">({itemRows.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {itemRows.map(({ itemId, reviews: itemReviews }) => (
                      <EvidenceItemCard
                        key={itemId}
                        evidenceItemId={itemId}
                        reviews={itemReviews}
                        onOpenDetail={(reviewId, evidenceItemId) => {
                          setModalReviewId(reviewId);
                          setModalEvidenceItemId(evidenceItemId);
                        }}
                        userRole={userRole}
                        compact={true}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {modalReviewId && modalEvidenceItemId && (
        <EvidenceDetailModal
          reviewId={modalReviewId}
          evidenceItemId={modalEvidenceItemId}
          userRole={userRole}
          onAction={(decision, comment, checklistResults) => handleAction(modalReviewId, decision, comment, checklistResults)}
          onClose={() => {
            setModalReviewId(null);
            setModalEvidenceItemId(null);
          }}
        />
      )}
    </div>
  );
}
