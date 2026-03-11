"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
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

interface RefDomain {
  id: string;
  name: string;
  sort_order: number;
}


const STATUS_TABS = [
  { key: "all", label: "All", icon: "M4 6h16M4 12h16M4 18h16" },
  { key: "assigned", label: "My Queue", icon: "M12 8v4l3 3m-6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
  { key: "approved", label: "Approved", icon: "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
  { key: "returned", label: "Returned", icon: "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" },
  { key: "hold", label: "Hold", icon: "M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" },
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
  hold: { bg: "bg-slate-50 dark:bg-slate-950/40", text: "text-slate-700 dark:text-slate-300", dot: "bg-slate-500" },
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
      className="relative rounded-xl border border-(--border) bg-(--surface) overflow-visible transition-all duration-300 ease-out hover:border-(--border-strong) hover:shadow-lg hover:-translate-y-0.5"
      style={{ boxShadow: "var(--shadow)" }}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${lc.bg}`} />

      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpenDetail(selectedReview.id, evidenceItemId)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpenDetail(selectedReview.id, evidenceItemId); } }}
        className={`w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2 rounded-xl cursor-pointer ${compact ? "p-3 pl-4" : "p-4 pl-5"}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className={`flex items-center gap-2 flex-wrap ${compact ? "mb-2" : "mb-3"}`}>
              <span className="font-semibold text-foreground truncate">{evidenceItemId}</span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${statusStyle.bg} ${statusStyle.text}`}>
                <span className={`w-1 h-1 rounded-full ${statusStyle.dot}`} />
                {selectedReview.status}
              </span>
            </div>
            <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLevelMenuOpen((o) => !o); }}
                className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${lc.light} ${lc.text} border-(--border) hover:border-(--border-strong)`}
              >
                {levelDisplay}
                <Icon path="M19 9l-7 7-7-7" className={`w-3.5 h-3.5 shrink-0 transition-transform ${levelMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {levelMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" aria-hidden onClick={() => setLevelMenuOpen(false)} />
                  <div className="absolute left-0 top-full z-100 mt-1 w-56 rounded-xl border border-(--border) bg-(--surface) shadow-xl py-1.5">
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
                          className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left ${isDone ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300" : isCurrent ? `${levelColor.light} ${levelColor.text}` : "text-(--foreground-muted)"} hover:bg-background`}
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
            <span className="text-[10px] sm:text-xs text-(--foreground-muted)">
              {dateStr}{!compact && ` · ${timeStr}`}
            </span>
            <span className="p-1 rounded-lg bg-background">
              <Icon path="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" className="w-3.5 h-3.5 text-(--foreground-muted)" />
            </span>
          </div>
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
          <div className="h-4 w-24 bg-(--border) rounded mb-3 animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-(--border) bg-(--surface) p-4 animate-pulse">
                <div className="flex justify-between mb-2">
                  <div className="h-4 w-32 bg-(--border) rounded" />
                  <div className="h-4 w-20 bg-(--border) rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-(--border) rounded" />
                  <div className="h-5 w-20 bg-(--border) rounded" />
                  <div className="h-5 w-14 bg-(--border) rounded" />
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

  const roleLevel = userRole === "internal_reviewer_l1" ? "L1" : userRole === "internal_reviewer_l2" ? "L2" : userRole === "external_assessor" ? "L3" : null;
  const levelFromUrl = searchParams.get("level");
  const initialLevel = levelFromUrl && VALID_LEVELS.includes(levelFromUrl as (typeof VALID_LEVELS)[number]) ? levelFromUrl : (roleLevel ?? "all");

  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>(initialLevel);
  const [searchQuery, setSearchQuery] = useState("");
  const [domains, setDomains] = useState<RefDomain[]>([]);
  const [itemNames, setItemNames] = useState<Record<string, string>>({});
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  useEffect(() => {
    if (levelFromUrl && VALID_LEVELS.includes(levelFromUrl as (typeof VALID_LEVELS)[number])) {
      setLevelFilter(levelFromUrl);
    } else if (levelFromUrl === null || levelFromUrl === "") {
      setLevelFilter(roleLevel ?? "all");
    }
  }, [levelFromUrl, roleLevel]);

  useEffect(() => {
    if (roleLevel && (!levelFromUrl || levelFromUrl !== roleLevel)) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("level", roleLevel);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [roleLevel, levelFromUrl, pathname, router, searchParams]);

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
      const levelParam = roleLevel ? `?level=${roleLevel}` : "";
      const data = await api.getDirect<ApiReview[]>(`/assessments/${cycleId}/reviews${levelParam}`);
      setReviews(data);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [cycleId, roleLevel]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  useEffect(() => {
    api.get<RefDomain[]>("/ref/domains").then(setDomains).catch(() => setDomains([]));
  }, []);

  useEffect(() => {
    if (!cycleId || reviews.length === 0) {
      setItemNames({});
      return;
    }
    const domainLetters = [...new Set(reviews.map((r) => domainFrom(r.evidence_item_id ?? "")))].filter(Boolean);
    const map: Record<string, string> = {};
    Promise.all(
      domainLetters.map((letter) =>
        api
          .get<{ domain: { id: string; name: string }; evidence_items: { id: string; name: string }[] }>(`/ref/domains/${letter}?cycle_id=${cycleId}`)
          .then((res) => {
            for (const item of res.evidence_items ?? []) {
              map[item.id] = item.name;
            }
          })
          .catch(() => {})
      )
    ).then(() => setItemNames((prev) => ({ ...prev, ...map })));
  }, [cycleId, reviews.length]);

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

  /** One card per evidence item (A1, A2, A5, …). Group only by evidence_item_id so A1 appears once. */
  const groupedByItemThenDomain = useMemo(() => {
    const byItem = new Map<string, ApiReview[]>();
    for (const r of filtered) {
      const raw = r.evidence_item_id?.trim();
      const id = raw ? raw.toUpperCase() : "_other";
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

  /** Flatten to one row per review for table; optionally filter by selected domain. */
  const tableRows = useMemo(() => {
    const rows: { domain: string; itemId: string; review: ApiReview }[] = [];
    for (const [domain, items] of groupedByItemThenDomain) {
      if (selectedDomain != null && selectedDomain !== domain) continue;
      for (const { itemId, reviews: revs } of items) {
        for (const review of revs) {
          rows.push({ domain, itemId, review });
        }
      }
    }
    return rows.sort((a, b) => {
      const d = a.domain.localeCompare(b.domain);
      if (d !== 0) return d;
      const i = a.itemId.localeCompare(b.itemId);
      if (i !== 0) return i;
      return (a.review.assigned_at > b.review.assigned_at ? -1 : 1);
    });
  }, [groupedByItemThenDomain, selectedDomain]);

  const domainListWithCounts = useMemo(() => {
    return groupedByItemThenDomain.map(([domainId, items]) => {
      const total = items.reduce((acc, { reviews }) => acc + reviews.length, 0);
      const approved = items.reduce((acc, { reviews }) => acc + reviews.filter((r) => r.status === "approved").length, 0);
      const domainMeta = domains.find((d) => d.id === domainId);
      return {
        id: domainId,
        name: domainMeta?.name ?? `Domain ${domainId}`,
        total,
        approved,
      };
    });
  }, [domains, groupedByItemThenDomain]);

  const hasActiveFilters = filter !== "all" || levelFilter !== "all" || searchQuery.trim() !== "";
  const statusCounts = useMemo(() => ({
    all: reviews.length,
    assigned: reviews.filter((r) => r.status === "assigned" && r.reviewer_id === user?.id).length,
    approved: reviews.filter((r) => r.status === "approved").length,
    returned: reviews.filter((r) => r.status === "returned").length,
    hold: reviews.filter((r) => r.status === "hold").length,
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
    <div className="min-h-[calc(100vh-64px)] w-full bg-background">
      <div className="w-full">
        <>
        <header className="mb-6 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-(--primary-muted)">
            <Icon path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" className="w-5 h-5 text-(--primary)" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Review Queue</h1>
        </header>

        {/* Flexible filter bar: search + status chips with counts + level chips + clear + view toggle */}
        <section className="mb-6 rounded-xl border border-(--border) bg-(--surface) p-4 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <label className="sr-only">Search</label>
              <div className="relative flex-1 min-w-[180px] max-w-xs">
                <Icon path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--foreground-muted)" />
                <input
                  type="search"
                  placeholder="Search by ID…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-(--border) rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-(--primary)/30"
                />
              </div>
              <span className="text-(--foreground-subtle) text-sm hidden sm:inline">Status</span>
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
                          ? "bg-(--primary) text-white border-(--primary) shadow-md"
                          : isDisabled
                            ? "bg-background border-(--border) text-(--foreground-subtle) opacity-60 cursor-not-allowed"
                            : "bg-background border-(--border) text-(--foreground-muted) hover:bg-(--border) hover:text-foreground"}
                      `}
                    >
                      <Icon path={t.icon} className="w-4 h-4 shrink-0" />
                      {t.label}
                      <span className={`tabular-nums ${isActive ? "text-white/90" : "text-(--foreground-subtle)"}`}>({count})</span>
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
            <div className={`flex flex-wrap items-center gap-2 border-t border-(--border) pt-3 ${roleLevel ? "hidden" : ""}`}>
              <span className="text-(--foreground-subtle) text-sm">Level</span>
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
                          ? "bg-foreground text-(--surface) border-foreground"
                          : `${LEVEL_COLORS[lv]?.light} ${LEVEL_COLORS[lv]?.text} border-current ring-1 ${LEVEL_COLORS[lv]?.ring}`
                        : isDisabled
                          ? "bg-(--surface) border-(--border) text-(--foreground-subtle) opacity-60 cursor-not-allowed"
                          : "bg-(--surface) border-(--border) text-(--foreground-muted) hover:bg-background hover:text-foreground"}
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

        {/* Content: Domain sidebar + Table (JSX-style layout) */}
        {loading ? (
          <ReviewQueueSkeleton />
        ) : groupedByItemThenDomain.length === 0 ? (
          <EmptyState
            title="No reviews found"
            description={hasActiveFilters ? "Try clearing filters or different criteria." : "Reviews appear here once evidence is submitted for review."}
          />
        ) : (
          <div className="flex flex-1 overflow-hidden rounded-xl border border-(--border) bg-(--surface) shadow-sm">
            {/* Domain sidebar */}
            <div className="w-56 flex-shrink-0 border-r border-(--border) flex flex-col bg-(--background) overflow-hidden">
              <div className="flex-shrink-0 px-4 py-3 border-b border-(--border)">
                <p className="text-[10px] font-bold text-(--foreground-muted) uppercase tracking-widest">Domains</p>
              </div>
              <div className="flex-1 overflow-y-auto py-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedDomain(null)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-l-2 ${selectedDomain === null ? "bg-(--surface) border-(--primary) shadow-sm" : "border-transparent hover:bg-(--surface) hover:border-(--border)"}`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${selectedDomain === null ? "bg-(--primary) text-(--surface)" : "bg-(--border) text-(--foreground-muted)"}`}>
                    •
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${selectedDomain === null ? "text-foreground" : "text-(--foreground-muted)"}`}>All domains</p>
                    <p className="text-[10px] text-(--foreground-subtle) mt-0.5">{filtered.length} items</p>
                  </div>
                </button>
                {domainListWithCounts.map((d) => {
                  const isActive = selectedDomain === d.id;
                  const accentColor = DOMAIN_ACCENT_COLORS[domainListWithCounts.indexOf(d) % DOMAIN_ACCENT_COLORS.length];
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedDomain(d.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-l-2 ${isActive ? "bg-(--surface) border-(--primary) shadow-sm" : "border-transparent hover:bg-(--surface) hover:border-(--border)"}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${isActive ? accentColor + " text-white" : "bg-(--border) text-(--foreground-muted)"}`}>
                        {d.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${isActive ? "text-foreground" : "text-(--foreground-muted)"}`}>{d.name}</p>
                        <p className="text-[10px] text-(--foreground-subtle) mt-0.5">{d.total} items · {d.approved} approved</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main: domain header + table */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
              <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-(--border) bg-(--surface)">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-(--primary) bg-(--primary-muted) border border-(--primary)/30 px-2.5 py-1 rounded-lg">
                      {selectedDomain ?? "All"}
                    </span>
                    <h2 className="text-lg font-bold text-foreground">
                      {selectedDomain ? domainListWithCounts.find((d) => d.id === selectedDomain)?.name ?? `Domain ${selectedDomain}` : "All domains"}
                    </h2>
                  </div>
                  <p className="text-xs text-(--foreground-muted) mt-0.5 ml-0.5">
                    {tableRows.length} review{tableRows.length !== 1 ? "s" : ""} — click a row to open and review
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-(--border)">
                      <th className="pb-3 pt-2 px-4 text-left text-[11px] font-bold text-(--foreground-muted) uppercase tracking-widest w-20">Control</th>
                      <th className="pb-3 pt-2 px-4 text-left text-[11px] font-bold text-(--foreground-muted) uppercase tracking-widest">Title</th>
                      <th className="pb-3 pt-2 px-4 text-left text-[11px] font-bold text-(--foreground-muted) uppercase tracking-widest w-20">Level</th>
                      <th className="pb-3 pt-2 px-4 text-left text-[11px] font-bold text-(--foreground-muted) uppercase tracking-widest w-28">Submitted</th>
                      <th className="pb-3 pt-2 px-4 text-left text-[11px] font-bold text-(--foreground-muted) uppercase tracking-widest w-28">Date</th>
                      <th className="pb-3 pt-2 px-4 text-left text-[11px] font-bold text-(--foreground-muted) uppercase tracking-widest w-28">Status</th>
                      <th className="pb-3 pt-2 w-24"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-(--border)">
                    {tableRows.map(({ itemId, review }) => {
                      const st = review.status;
                      const style = STATUS_STYLES[st] ?? STATUS_STYLES.assigned;
                      const displayLevel = normalizeLevel(review.level);
                      const lc = LEVEL_COLORS[displayLevel] ?? LEVEL_COLORS.L1;
                      const dateStr = new Date(review.assigned_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                      const title = itemNames[itemId] ?? itemId;
                      return (
                        <tr
                          key={review.id}
                          onClick={() => router.push(`/cycles/${cycleId}/review/${review.id}`)}
                          className="cursor-pointer hover:bg-(--primary-muted)/20 transition-colors group"
                        >
                          <td className="py-4 px-4 align-top">
                            <span className="font-semibold text-foreground">{itemId === "_other" ? "Other" : itemId}</span>
                          </td>
                          <td className="py-4 px-4 align-top">
                            <p className="text-sm font-medium text-foreground group-hover:text-(--primary) transition-colors line-clamp-1">{title}</p>
                            <p className="text-xs text-(--foreground-muted) mt-0.5 line-clamp-1 max-w-md">Evidence submission</p>
                          </td>
                          <td className="py-4 px-4 align-top">
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${lc.light} ${lc.text} border-(--border)`}>
                              {displayLevel} — {LEVEL_LABELS[displayLevel] ?? displayLevel}
                            </span>
                          </td>
                          <td className="py-4 px-4 align-top text-xs text-(--foreground-muted)">—</td>
                          <td className="py-4 px-4 align-top text-xs text-(--foreground-muted)">{dateStr}</td>
                          <td className="py-4 px-4 align-top">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${style.bg} ${style.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
                              {st}
                            </span>
                          </td>
                          <td className="py-4 px-4 align-top">
                            <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-(--primary-muted) text-(--primary) border border-(--primary)/30 opacity-0 group-hover:opacity-100 transition-opacity">
                              Review
                              <Icon path="M9 5l7 7-7 7" className="w-3 h-3" />
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        </>
      </div>
    </div>
  );
}
