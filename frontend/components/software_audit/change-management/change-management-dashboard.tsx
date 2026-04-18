"use client";

/**
 * =============================================================================
 *  CHANGE MANAGEMENT & RELEASE CONTROLS — Audit Dashboard
 * =============================================================================
 *  Audit-formatted dashboard (Met / Not Met / Requires Review) for Q1 2026
 *  evidence across Jira change requests, GitHub PRs, GitHub Actions CI/CD
 *  runs, deployment logs, freeze windows, and rollback records.
 *
 *  Pipeline:
 *    RAW collectors  →  buildViewModel(raw)  →  evaluateControls(ctx)  →  UI
 *
 *  Every finding renders the collector field that produced it.
 * =============================================================================
 */

import React, { useMemo, useState, type ReactNode } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  GitPullRequest,
  Rocket,
  ChevronRight,
  Search,
  Download,
  X,
  Calendar,
  ScrollText,
  Package,
  ClipboardCheck,
  ClipboardList,
  Snowflake,
  Undo2,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import {
  CONTROL_FAMILIES,
  EMERGENCY_CAB_HOURS,
  RAW_DATA,
  REQUIRED_GATES,
  SEVERITY_STYLES,
  STATUS,
  STATUS_STYLES,
  fmtDate,
  fmtDateShort,
  hoursBetween,
  prettyUser,
  type ControlFamily,
  type ControlFamilyId,
  type SeverityValue,
  type StatusValue,
} from "@/lib/software_audit/change-management/constants";
import { buildViewModel } from "@/lib/software_audit/change-management/view-model";
import type {
  ChangeViewModel,
  ControlResult,
  DashboardViewModel,
  RawData,
} from "@/lib/software_audit/change-management/types";

/* ============================================================================
 * Primitives
 * ========================================================================= */

function StatusPill({
  status,
  size = "sm",
}: {
  status: StatusValue;
  size?: "sm" | "md";
}) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES[STATUS.NA];
  const Icon = s.icon;
  const pad = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${pad} ${s.bg} ${s.text} ${s.border}`}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      {s.label}
    </span>
  );
}

function StatusDot({ status }: { status: StatusValue }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES[STATUS.NA];
  return <span className={`inline-block w-2 h-2 rounded-full ${s.dot}`} />;
}

function SeverityBadge({ severity }: { severity: SeverityValue | string }) {
  const s =
    SEVERITY_STYLES[severity as SeverityValue] ?? SEVERITY_STYLES.Informational;
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-xs font-semibold ${s.bg} ${s.text} ${s.border}`}
    >
      {severity}
    </span>
  );
}

function MonoChip({
  children,
  muted = false,
}: {
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded border font-mono text-xs ${
        muted
          ? "bg-slate-50 border-slate-200 text-slate-600"
          : "bg-slate-100 border-slate-200 text-slate-800"
      }`}
    >
      {children}
    </span>
  );
}

function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function SectionTitle({
  children,
  subtitle,
  right,
}: {
  children: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">
      <div>
        <h2 className="text-base font-bold tracking-tight text-slate-900">
          {children}
        </h2>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {right}
    </div>
  );
}

function KV({
  k,
  v,
  mono = false,
}: {
  k: string;
  v: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
      <dt className="text-xs uppercase tracking-wider text-slate-500 font-semibold shrink-0 pt-0.5">
        {k}
      </dt>
      <dd
        className={`text-sm text-slate-900 text-right break-words ${
          mono ? "font-mono text-xs break-all" : ""
        }`}
      >
        {v}
      </dd>
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children?: ReactNode;
  align?: "left" | "center" | "right";
}) {
  const alignCls =
    align === "center"
      ? "text-center"
      : align === "right"
        ? "text-right"
        : "text-left";
  return (
    <th
      className={`${alignCls} font-semibold text-slate-600 text-xs uppercase tracking-wider px-4 py-3`}
    >
      {children}
    </th>
  );
}

/* ============================================================================
 * Main dashboard
 * ========================================================================= */

const TABS = [
  { id: "overview", label: "Audit Overview" },
  { id: "register", label: "Change Register" },
  { id: "findings", label: "Findings" },
  { id: "controls", label: "Control Panels" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ChangeManagementDashboard() {
  const vm: DashboardViewModel = useMemo(
    () => buildViewModel(RAW_DATA as unknown as RawData),
    [],
  );
  const [tab, setTab] = useState<TabId>("overview");
  const [selected, setSelected] = useState<ChangeViewModel | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusValue | "all">("all");

  const metrics = useMemo(() => {
    const all = vm.changes.flatMap((c) => Object.values(c.controls));
    const met = all.filter((c) => c.status === STATUS.MET).length;
    const notMet = all.filter((c) => c.status === STATUS.NOT_MET).length;
    const review = all.filter((c) => c.status === STATUS.REVIEW).length;
    const high = all.filter(
      (c) => c.severity === "High" && c.status === STATUS.NOT_MET,
    ).length;
    const changesMet = vm.changes.filter((c) => c.overall === STATUS.MET).length;
    const changesNotMet = vm.changes.filter(
      (c) => c.overall === STATUS.NOT_MET,
    ).length;
    const changesReview = vm.changes.filter(
      (c) => c.overall === STATUS.REVIEW,
    ).length;
    return {
      totalChanges: vm.changes.length,
      totalControls: all.length,
      met,
      notMet,
      review,
      high,
      changesMet,
      changesNotMet,
      changesReview,
      complianceScore: all.length
        ? Math.round((met / all.length) * 100)
        : 0,
    };
  }, [vm]);

  const filtered = useMemo(
    () =>
      vm.changes.filter((c) => {
        if (statusFilter !== "all" && c.overall !== statusFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          if (
            !c.key.toLowerCase().includes(q) &&
            !c.title.toLowerCase().includes(q) &&
            !(c.businessService || "").toLowerCase().includes(q) &&
            !(c.requester || "").toLowerCase().includes(q)
          )
            return false;
        }
        return true;
      }),
    [vm.changes, search, statusFilter],
  );

  return (
    <div
      className="min-h-screen w-full max-w-none bg-slate-50 text-slate-900 antialiased"
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <header className="sticky top-0 z-20 w-full border-b border-slate-200 bg-white">
        <div className="flex h-14 w-full max-w-none items-center justify-between px-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-slate-900">
                YaaraLabs
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-sm text-slate-600">Audit Console</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium">
              <ClipboardList className="w-3 h-3" />
              {RAW_DATA._metadata.audit_engagement}
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium">
              {RAW_DATA._metadata.organization}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-xs text-indigo-700 font-medium">
              <Calendar className="w-3 h-3" />
              Q1 2026 · evidence pulled{" "}
              {fmtDateShort(RAW_DATA._metadata.generated_at)}
            </span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-none px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
            <span>Engagement</span>
            <ChevronRight className="w-3 h-3" />
            <span>IT General Controls</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 font-medium">
              Module B · Change Management &amp; Release Controls
            </span>
          </div>
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Change Management &amp; Release Controls
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm"
              >
                <Download className="w-4 h-4" /> Export evidence pack
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm"
              >
                <FileText className="w-4 h-4" /> Generate audit memo
              </button>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-200 mb-6">
          <nav className="flex gap-1 flex-wrap">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px ${
                  tab === t.id
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="pb-16">
          {tab === "overview" && (
            <OverviewTab vm={vm} metrics={metrics} onOpen={setSelected} />
          )}
          {tab === "register" && (
            <RegisterTab
              changes={filtered}
              total={vm.changes.length}
              search={search}
              setSearch={setSearch}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onOpen={setSelected}
            />
          )}
          {tab === "findings" && (
            <FindingsTab vm={vm} onOpen={setSelected} />
          )}
          {tab === "controls" && (
            <ControlsTab vm={vm} onOpen={setSelected} />
          )}
        </div>
      </main>

      {selected && (
        <ChangeDrawer change={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

/* ============================================================================
 * Overview tab
 * ========================================================================= */

type OverviewMetrics = {
  totalChanges: number;
  totalControls: number;
  met: number;
  notMet: number;
  review: number;
  high: number;
  changesMet: number;
  changesNotMet: number;
  changesReview: number;
  complianceScore: number;
};

function OverviewTab({
  vm,
  metrics,
  onOpen,
}: {
  vm: DashboardViewModel;
  metrics: OverviewMetrics;
  onOpen: (c: ChangeViewModel) => void;
}) {
  const familyStats = CONTROL_FAMILIES.map((fam) => {
    const counts: Record<StatusValue, number> = {
      [STATUS.MET]: 0,
      [STATUS.NOT_MET]: 0,
      [STATUS.REVIEW]: 0,
      [STATUS.NA]: 0,
    };
    vm.changes.forEach((c) => {
      const r = c.controls[fam.id];
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    return { ...fam, counts, total: vm.changes.length };
  });

  const topFindings = vm.changes
    .flatMap((c) =>
      (Object.entries(c.controls) as Array<[ControlFamilyId, ControlResult]>).map(
        ([famId, r]) => ({ change: c, famId, ...r }),
      ),
    )
    .filter((f) => f.status === STATUS.NOT_MET)
    .sort(
      (a, b) => (b.severity === "High" ? 1 : 0) - (a.severity === "High" ? 1 : 0),
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <SummaryCard
          icon={Package}
          label="Changes reviewed"
          value={metrics.totalChanges}
          sub="Q1 2026 in-scope"
        />
        <SummaryCard
          icon={ClipboardCheck}
          label="Controls evaluated"
          value={metrics.totalControls}
          sub={`${CONTROL_FAMILIES.length} families × ${metrics.totalChanges} changes`}
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Met"
          value={metrics.met}
          sub={`${metrics.complianceScore}% of controls`}
          accent="emerald"
        />
        <SummaryCard
          icon={XCircle}
          label="Not Met"
          value={metrics.notMet}
          sub={`${metrics.changesNotMet} of ${metrics.totalChanges} changes`}
          accent={metrics.notMet > 0 ? "red" : "slate"}
        />
        <SummaryCard
          icon={AlertTriangle}
          label="Requires review"
          value={metrics.review}
          sub={`${metrics.changesReview} of ${metrics.totalChanges} changes`}
          accent={metrics.review > 0 ? "amber" : "slate"}
        />
        <SummaryCard
          icon={ShieldAlert}
          label="High-severity"
          value={metrics.high}
          sub="open findings"
          accent={metrics.high > 0 ? "red" : "slate"}
        />
      </div>

      <Card className="p-6">
        <SectionTitle subtitle="How each control family performs across all Q1 changes. Click a family to see per-change detail.">
          Control Status Summary
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {familyStats.map((fam) => {
            const Icon = fam.icon;
            const anyNotMet = fam.counts[STATUS.NOT_MET] > 0;
            const roll: StatusValue = anyNotMet
              ? STATUS.NOT_MET
              : fam.counts[STATUS.REVIEW] > 0
                ? STATUS.REVIEW
                : STATUS.MET;
            const s = STATUS_STYLES[roll];
            return (
              <div
                key={fam.id}
                className={`rounded-xl border p-4 ${s.bg} ${s.border}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white border ${s.border}`}
                  >
                    <Icon className="w-4 h-4 text-slate-700" />
                  </div>
                  <StatusPill status={roll} />
                </div>
                <div className="text-sm font-bold text-slate-900 leading-tight">
                  {fam.label}
                </div>
                <div className="mt-3 space-y-1.5">
                  <StatRow
                    label="Met"
                    value={fam.counts[STATUS.MET]}
                    total={fam.total}
                    tone="emerald"
                  />
                  {fam.counts[STATUS.REVIEW] > 0 && (
                    <StatRow
                      label="Requires review"
                      value={fam.counts[STATUS.REVIEW]}
                      total={fam.total}
                      tone="amber"
                    />
                  )}
                  {fam.counts[STATUS.NOT_MET] > 0 && (
                    <StatRow
                      label="Not Met"
                      value={fam.counts[STATUS.NOT_MET]}
                      total={fam.total}
                      tone="red"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <SectionTitle
            subtitle="The most significant Not Met findings across in-scope changes"
            right={
              <span className="text-xs text-slate-500">
                {topFindings.length} shown
              </span>
            }
          >
            Priority findings for auditor attention
          </SectionTitle>
          {topFindings.length === 0 ? (
            <div className="p-6 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm text-emerald-800">
                No Not Met findings across the in-scope change set.
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              {topFindings.map((f, i) => {
                const fam = CONTROL_FAMILIES.find((x) => x.id === f.famId)!;
                const FamIcon = fam.icon;
                return (
                  <button
                    key={`${f.change.key}-${f.famId}-${i}`}
                    type="button"
                    onClick={() => onOpen(f.change)}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-red-300 hover:bg-red-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
                          <FamIcon className="w-4 h-4 text-red-700" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <MonoChip>{f.change.key}</MonoChip>
                            <SeverityBadge severity={f.severity} />
                            <span className="text-xs text-slate-500">
                              {fam.label}
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-slate-900 truncate">
                            {f.change.title}
                          </div>
                          <div className="text-xs text-slate-600 mt-0.5">
                            {f.reason}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-2" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <SectionTitle subtitle="Collectors feeding this audit">
            Evidence sources
          </SectionTitle>
          <div className="space-y-2">
            <SourceRow
              name="Change Requests"
              api="jira · /rest/api/3/search"
              count={`${RAW_DATA.change_request_collector.issues.length} issues`}
            />
            <SourceRow
              name="Pull Requests"
              api="github · pulls.list"
              count={`${RAW_DATA.pull_request_collector.pull_requests.length} PRs`}
            />
            <SourceRow
              name="CI/CD Runs"
              api="github · actions.workflow_runs"
              count={`${RAW_DATA.cicd_evidence_collector.workflow_runs.length} runs`}
            />
            <SourceRow
              name="Deployments"
              api="argocd · codedeploy"
              count={`${RAW_DATA.deployment_activity_collector.deployments.length} events`}
            />
            <SourceRow
              name="Freeze Windows"
              api="internal · policy"
              count={`${RAW_DATA.freeze_window_collector.freeze_windows.length} windows · ${RAW_DATA.freeze_window_collector.exceptions.length} exceptions`}
            />
            <SourceRow
              name="Rollback Records"
              api="internal · release-md"
              count={`${RAW_DATA.rollback_evidence_collector.records.length} records`}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: "emerald" | "amber" | "red";
}) {
  const tones: Record<typeof tone, string> = {
    emerald: "bg-emerald-600",
    amber: "bg-amber-600",
    red: "bg-red-600",
  };
  const pct = total ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-0.5">
        <span className="text-slate-600">{label}</span>
        <span className="font-mono tabular-nums text-slate-700">
          {value}
          <span className="text-slate-400">/{total}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white border border-slate-200 overflow-hidden">
        <div
          className={`h-full ${tones[tone]} rounded-full`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = "slate",
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  sub: string;
  accent?: "slate" | "emerald" | "amber" | "red";
}) {
  const accents: Record<typeof accent, string> = {
    slate: "bg-slate-100 text-slate-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    red: "bg-red-100 text-red-600",
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${accents[accent]}`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
        {value}
      </div>
      <div className="text-xs text-slate-500 mt-1">{sub}</div>
    </div>
  );
}

function SourceRow({
  name,
  api,
  count,
}: {
  name: string;
  api: string;
  count: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-slate-900">{name}</div>
        <div className="text-xs text-slate-500 font-mono truncate">{api}</div>
      </div>
      <span className="text-xs text-slate-600 font-medium shrink-0 tabular-nums">
        {count}
      </span>
    </div>
  );
}

/* ============================================================================
 * Register tab
 * ========================================================================= */

function RegisterTab({
  changes,
  total,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  onOpen,
}: {
  changes: ChangeViewModel[];
  total: number;
  search: string;
  setSearch: (v: string) => void;
  statusFilter: StatusValue | "all";
  setStatusFilter: (v: StatusValue | "all") => void;
  onOpen: (c: ChangeViewModel) => void;
}) {
  const filters: Array<{ id: StatusValue | "all"; label: string }> = [
    { id: "all", label: "All" },
    { id: STATUS.MET, label: "Met" },
    { id: STATUS.NOT_MET, label: "Not Met" },
    { id: STATUS.REVIEW, label: "Requires Review" },
  ];

  const priorityToSeverity = (p: string): SeverityValue =>
    p === "Critical"
      ? "Critical"
      : p === "High"
        ? "High"
        : p === "Medium"
          ? "Medium"
          : "Low";

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search change ID, title, service, or requester…"
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
          />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === f.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500 tabular-nums ml-auto">
          {changes.length} / {total} changes
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <Th>Change</Th>
              <Th>Type</Th>
              <Th>Requester</Th>
              <Th>Approver</Th>
              <Th>Environment · Deployed</Th>
              <Th align="center">Controls</Th>
              <Th>Overall audit status</Th>
              <Th />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {changes.map((c) => {
              const met = Object.values(c.controls).filter(
                (x) => x.status === STATUS.MET,
              ).length;
              const notMet = Object.values(c.controls).filter(
                (x) => x.status === STATUS.NOT_MET,
              ).length;
              const review = Object.values(c.controls).filter(
                (x) => x.status === STATUS.REVIEW,
              ).length;
              return (
                <tr
                  key={c.key}
                  onClick={() => onOpen(c)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <MonoChip>{c.key}</MonoChip>
                      {c.emergency && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-bold uppercase bg-red-100 text-red-800 border border-red-200">
                          Emergency
                        </span>
                      )}
                      <SeverityBadge severity={priorityToSeverity(c.priority)} />
                    </div>
                    <div className="text-sm font-semibold text-slate-900 leading-snug">
                      {c.title}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {c.businessService}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-slate-700">
                    {c.type}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="text-sm text-slate-900">
                      {prettyUser(c.requester)}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {c.requester}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    {c.cabApprover ? (
                      <div>
                        <div className="text-sm text-slate-900">
                          {prettyUser(c.cabApprover)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {fmtDateShort(c.cabApprovedAt)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    {c.deployEnvironment ? (
                      <div>
                        <div className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                          {c.deployEnvironment}
                        </div>
                        <div className="text-xs text-slate-500">
                          {fmtDateShort(c.deployTimestamp)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">
                        not deployed
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold tabular-nums">
                        <CheckCircle2 className="w-3 h-3" />
                        {met}
                      </span>
                      {review > 0 && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold tabular-nums">
                          <AlertTriangle className="w-3 h-3" />
                          {review}
                        </span>
                      )}
                      {notMet > 0 && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-xs font-semibold tabular-nums">
                          <XCircle className="w-3 h-3" />
                          {notMet}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <StatusPill status={c.overall} />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {changes.length === 0 && (
          <div className="p-12 text-center text-sm text-slate-500">
            No changes match the current filter.
          </div>
        )}
      </div>
    </Card>
  );
}

/* ============================================================================
 * Findings tab
 * ========================================================================= */

type FindingsMode = "not_met" | "review" | "met";

function FindingsTab({
  vm,
  onOpen,
}: {
  vm: DashboardViewModel;
  onOpen: (c: ChangeViewModel) => void;
}) {
  const [mode, setMode] = useState<FindingsMode>("not_met");

  const flat = vm.changes.flatMap((c) =>
    (Object.entries(c.controls) as Array<[ControlFamilyId, ControlResult]>).map(
      ([famId, r]) => ({ change: c, famId, ...r }),
    ),
  );

  const notMet = flat.filter((f) => f.status === STATUS.NOT_MET);
  const review = flat.filter((f) => f.status === STATUS.REVIEW);
  const met = flat.filter((f) => f.status === STATUS.MET);

  const current =
    mode === "not_met" ? notMet : mode === "review" ? review : met;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <FindingsToggle
          mode={mode}
          setMode={setMode}
          counts={{
            not_met: notMet.length,
            review: review.length,
            met: met.length,
          }}
        />
      </div>

      {current.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-sm text-slate-500">No items to show.</div>
        </Card>
      ) : (
        <div className="space-y-3">
          {current.map((f, i) => {
            const fam = CONTROL_FAMILIES.find((x) => x.id === f.famId)!;
            const FamIcon = fam.icon;
            const s = STATUS_STYLES[f.status];
            return (
              <button
                key={`${f.change.key}-${f.famId}-${i}`}
                type="button"
                onClick={() => onOpen(f.change)}
                className={`w-full text-left rounded-xl border ${s.border} bg-white hover:shadow-md transition-shadow p-4`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-lg ${s.bg} border ${s.border} flex items-center justify-center shrink-0`}
                    >
                      <FamIcon className={`w-4 h-4 ${s.text}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <MonoChip>{f.change.key}</MonoChip>
                        <StatusPill status={f.status} />
                        {f.status !== STATUS.MET && (
                          <SeverityBadge severity={f.severity} />
                        )}
                        <span className="text-xs text-slate-500 font-medium">
                          {fam.label}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900 mb-1">
                        {f.change.title}
                      </div>
                      <div className="text-sm text-slate-700 mb-2">
                        {f.reason}
                      </div>
                      {f.subControls.length > 0 && (
                        <div className="space-y-1.5 mt-2">
                          {f.subControls.map((sc, j) => (
                            <div
                              key={j}
                              className="flex items-start gap-2 text-xs"
                            >
                              <StatusDot status={sc.status} />
                              <div className="min-w-0 flex-1">
                                <span className="font-medium text-slate-800">
                                  {sc.label}
                                </span>
                                <div className="text-slate-500 font-mono break-all mt-0.5">
                                  {sc.evidence}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-2" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FindingsToggle({
  mode,
  setMode,
  counts,
}: {
  mode: FindingsMode;
  setMode: (m: FindingsMode) => void;
  counts: { not_met: number; review: number; met: number };
}) {
  const opts: Array<{
    id: FindingsMode;
    label: string;
    count: number;
    tone: "red" | "amber" | "emerald";
  }> = [
    { id: "not_met", label: "Not Met", count: counts.not_met, tone: "red" },
    { id: "review", label: "Requires Review", count: counts.review, tone: "amber" },
    { id: "met", label: "Met", count: counts.met, tone: "emerald" },
  ];
  const toneStyles: Record<(typeof opts)[number]["tone"], string> = {
    red: "bg-red-50 border-red-200 text-red-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
  };
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200">
      {opts.map((o) => {
        const active = mode === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => setMode(o.id)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              active
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>{o.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-xs font-bold tabular-nums border ${
                active
                  ? toneStyles[o.tone]
                  : "bg-slate-200 border-slate-300 text-slate-700"
              }`}
            >
              {o.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================================
 * Controls tab (five panels)
 * ========================================================================= */

function ControlsTab({
  vm,
  onOpen,
}: {
  vm: DashboardViewModel;
  onOpen: (c: ChangeViewModel) => void;
}) {
  const [panel, setPanel] = useState<ControlFamilyId>("approval");
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {CONTROL_FAMILIES.map((f: ControlFamily) => {
          const Icon = f.icon;
          const active = panel === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setPanel(f.id)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {f.short}
            </button>
          );
        })}
      </div>

      {panel === "approval" && <ApprovalPanel vm={vm} onOpen={onOpen} />}
      {panel === "sod" && <SoDPanel vm={vm} onOpen={onOpen} />}
      {panel === "testing" && <TestingPanel vm={vm} onOpen={onOpen} />}
      {panel === "freeze" && <FreezePanel vm={vm} onOpen={onOpen} />}
      {panel === "rollback" && <RollbackPanel vm={vm} onOpen={onOpen} />}
    </div>
  );
}

function ControlRow({
  change,
  status,
  left,
  right,
  onOpen,
}: {
  change: ChangeViewModel;
  status: StatusValue;
  left: ReactNode;
  right?: ReactNode;
  onOpen: (c: ChangeViewModel) => void;
}) {
  const s = STATUS_STYLES[status];
  return (
    <button
      type="button"
      onClick={() => onOpen(change)}
      className={`w-full text-left p-3 rounded-lg border ${s.border} bg-white hover:shadow-sm transition-shadow flex items-center justify-between gap-3 flex-wrap`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <MonoChip>{change.key}</MonoChip>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">
            {change.title}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{left}</div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {right}
        <StatusPill status={status} />
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>
    </button>
  );
}

function ApprovalPanel({
  vm,
  onOpen,
}: {
  vm: DashboardViewModel;
  onOpen: (c: ChangeViewModel) => void;
}) {
  const normals = vm.changes.filter((c) => !c.emergency);
  const emergencies = vm.changes.filter((c) => c.emergency);
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <SectionTitle subtitle="Normal changes — every change must pass CAB (or equivalent) before deployment">
          CAB approval — normal changes
        </SectionTitle>
        <div className="space-y-2">
          {normals.map((c) => (
            <ControlRow
              key={c.key}
              change={c}
              status={c.controls.approval.status}
              onOpen={onOpen}
              left={`Approver: ${prettyUser(c.cabApprover)} · ${fmtDateShort(c.cabApprovedAt)}`}
              right={
                <MonoChip muted>
                  {c.controls.approval.subControls[0]?.evidence
                    .split("·")[0]
                    .trim() || "—"}
                </MonoChip>
              }
            />
          ))}
        </div>
      </Card>
      <Card className="p-6">
        <SectionTitle
          subtitle={`Emergency changes require post-hoc CAB review within ${EMERGENCY_CAB_HOURS} hours of deployment`}
        >
          CAB post-hoc review — emergency changes
        </SectionTitle>
        {emergencies.length === 0 ? (
          <div className="text-sm text-slate-500">
            No emergency changes in scope.
          </div>
        ) : (
          <div className="space-y-2">
            {emergencies.map((c) => {
              const hours =
                c.cabApprovedAt && c.createdAt
                  ? hoursBetween(c.createdAt, c.cabApprovedAt)
                  : null;
              const ok = hours != null && hours <= EMERGENCY_CAB_HOURS;
              return (
                <ControlRow
                  key={c.key}
                  change={c}
                  status={c.controls.approval.status}
                  onOpen={onOpen}
                  left={`Raised ${fmtDate(c.createdAt)} · CAB ${fmtDate(c.cabApprovedAt)}`}
                  right={
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded ${
                        ok
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {hours != null ? `${hours.toFixed(1)}h elapsed` : "no CAB"}
                    </span>
                  }
                />
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function SoDPanel({
  vm,
  onOpen,
}: {
  vm: DashboardViewModel;
  onOpen: (c: ChangeViewModel) => void;
}) {
  const productionDeploys = vm.changes.filter(
    (c) => c.deployEnvironment === "prod",
  );
  return (
    <Card className="p-6">
      <SectionTitle subtitle="A code author should not be the identity that executes the production deployment">
        Developer-to-Production Segregation
      </SectionTitle>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-y border-slate-200">
            <tr>
              <Th>Change</Th>
              <Th>PR author</Th>
              <Th>Deployed by (identity)</Th>
              <Th>Command actor</Th>
              <Th>SoD result</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {productionDeploys.map((c) => (
              <tr
                key={c.key}
                onClick={() => onOpen(c)}
                className="hover:bg-slate-50 cursor-pointer"
              >
                <td className="px-4 py-3">
                  <MonoChip>{c.key}</MonoChip>
                  <div className="text-xs text-slate-500 mt-1 truncate">
                    {c.title}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-700 font-mono">
                  {c.prAuthor || "—"}
                </td>
                <td className="px-4 py-3 text-xs text-slate-700 font-mono">
                  {c.deployedBy || "—"}
                </td>
                <td className="px-4 py-3 text-xs text-slate-700 font-mono">
                  {c.deployCommandActor || "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={c.controls.sod.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function TestingPanel({
  vm,
  onOpen,
}: {
  vm: DashboardViewModel;
  onOpen: (c: ChangeViewModel) => void;
}) {
  const gateLabels: Record<string, string> = {
    unit_tests: "Unit",
    integration_tests: "Integration",
    uat_signoff: "UAT",
    security_scan: "SAST/DAST",
  };
  return (
    <Card className="p-6">
      <SectionTitle subtitle="Unit, integration, UAT, and security-scan evidence must be present for every prod deployment">
        Pre-deployment Testing Evidence
      </SectionTitle>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-y border-slate-200">
            <tr>
              <Th>Change</Th>
              <Th>Pipeline run</Th>
              {REQUIRED_GATES.map((g) => (
                <Th key={g} align="center">
                  {gateLabels[g] || g}
                </Th>
              ))}
              <Th>Result</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vm.changes.map((c) => (
              <tr
                key={c.key}
                onClick={() => onOpen(c)}
                className="hover:bg-slate-50 cursor-pointer"
              >
                <td className="px-4 py-3">
                  <MonoChip>{c.key}</MonoChip>
                  <div className="text-xs text-slate-500 mt-1 truncate">
                    {c.title}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600 font-mono">
                  {c.runId || "—"}
                </td>
                {REQUIRED_GATES.map((g) => {
                  const s = c.gateStatus[g];
                  return (
                    <td key={g} className="px-4 py-3 text-center">
                      {s?.present ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 inline-block" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600 inline-block" />
                      )}
                    </td>
                  );
                })}
                <td className="px-4 py-3">
                  <StatusPill status={c.controls.testing.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function FreezePanel({
  vm,
  onOpen,
}: {
  vm: DashboardViewModel;
  onOpen: (c: ChangeViewModel) => void;
}) {
  const inFreeze = vm.changes.filter((c) => c.freezeHit);
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <SectionTitle subtitle="Declared change-freeze windows covering the audit period">
          Freeze windows in effect
        </SectionTitle>
        <div className="space-y-2">
          {vm.freezeWindows.map((w) => (
            <div
              key={w.id}
              className="p-3 rounded-lg border border-slate-200 bg-slate-50"
            >
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <MonoChip>{w.id}</MonoChip>
                <span className="text-sm font-semibold text-slate-900">
                  {w.label}
                </span>
              </div>
              <div className="text-xs text-slate-600 font-mono">
                {fmtDate(w.start)} → {fmtDate(w.end)} · envs:{" "}
                {w.applicable_environments.join(", ")}
              </div>
              <div className="text-xs text-slate-500 mt-1">{w.reason}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <SectionTitle subtitle="Changes deployed during a freeze window — exception approval required">
          Deployments during freeze windows
        </SectionTitle>
        {inFreeze.length === 0 ? (
          <div className="text-sm text-slate-500">
            No deployments intersected a declared freeze window.
          </div>
        ) : (
          <div className="space-y-2">
            {inFreeze.map((c) => (
              <ControlRow
                key={c.key}
                change={c}
                status={c.controls.freeze.status}
                onOpen={onOpen}
                left={`${c.freezeHit!.label} · deployed ${fmtDate(c.deployTimestamp)}`}
                right={
                  c.freezeException ? (
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Exception {c.freezeException.id}
                    </span>
                  ) : (
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                      No exception
                    </span>
                  )
                }
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function RollbackPanel({
  vm,
  onOpen,
}: {
  vm: DashboardViewModel;
  onOpen: (c: ChangeViewModel) => void;
}) {
  return (
    <Card className="p-6">
      <SectionTitle subtitle="Every change must have a documented rollback plan validated in pre-production">
        Rollback Readiness
      </SectionTitle>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-y border-slate-200">
            <tr>
              <Th>Change</Th>
              <Th align="center">Plan documented</Th>
              <Th align="center">Validated in pre-prod</Th>
              <Th>Evidence reference</Th>
              <Th>Result</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vm.changes.map((c) => (
              <tr
                key={c.key}
                onClick={() => onOpen(c)}
                className="hover:bg-slate-50 cursor-pointer"
              >
                <td className="px-4 py-3">
                  <MonoChip>{c.key}</MonoChip>
                  <div className="text-xs text-slate-500 mt-1 truncate">
                    {c.title}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  {c.rollbackPlanPresent ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 inline-block" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600 inline-block" />
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {c.rollbackTested === true ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 inline-block" />
                  ) : c.rollbackTested === false ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 inline-block" />
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-slate-600 font-mono truncate max-w-xs">
                  {c.rollbackEvidenceRef || "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={c.controls.rollback.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ============================================================================
 * Change detail drawer
 * ========================================================================= */

function DrawerSection({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
        <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-600">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-sm font-bold tracking-tight text-slate-900">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

function RawBlock({ title, payload }: { title: string; payload: unknown }) {
  return (
    <details className="rounded-lg border border-slate-200 bg-slate-50">
      <summary className="px-3 py-2 cursor-pointer text-xs font-mono text-slate-700 font-semibold">
        {title}
      </summary>
      <pre className="px-3 pb-3 text-xs leading-relaxed text-slate-700 overflow-x-auto font-mono">
        {JSON.stringify(payload, null, 2)}
      </pre>
    </details>
  );
}

function ChangeDrawer({
  change,
  onClose,
}: {
  change: ChangeViewModel;
  onClose: () => void;
}) {
  const c = change;
  const priorityToSeverity: SeverityValue =
    c.priority === "Critical"
      ? "Critical"
      : c.priority === "High"
        ? "High"
        : c.priority === "Medium"
          ? "Medium"
          : "Low";

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-3xl bg-white shadow-2xl z-40 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 z-10">
          <div className="px-6 py-4 flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <MonoChip>{c.key}</MonoChip>
                <StatusPill status={c.overall} size="md" />
                {c.emergency && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase bg-red-100 text-red-800 border border-red-200">
                    Emergency
                  </span>
                )}
                <SeverityBadge severity={priorityToSeverity} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {c.title}
              </h2>
              <div className="text-sm text-slate-500 mt-1">
                {c.type} · {c.businessService} · target environments:{" "}
                {c.environmentsTargeted.join(", ")}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 shrink-0"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <DrawerSection
            icon={ClipboardCheck}
            title="Control-by-control assessment"
          >
            <div className="space-y-3">
              {CONTROL_FAMILIES.map((fam) => {
                const r = c.controls[fam.id];
                const s = STATUS_STYLES[r.status];
                const Icon = fam.icon;
                return (
                  <div
                    key={fam.id}
                    className={`rounded-lg border ${s.border} ${s.bg} p-4`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg bg-white border ${s.border} flex items-center justify-center`}
                        >
                          <Icon className="w-4 h-4 text-slate-700" />
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          {fam.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={r.severity} />
                        <StatusPill status={r.status} />
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 mb-2">{r.reason}</p>
                    {r.subControls.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {r.subControls.map((sc, i) => (
                          <div
                            key={i}
                            className="bg-white rounded-md border border-slate-200 p-2.5"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <StatusDot status={sc.status} />
                              <span className="text-xs font-semibold text-slate-800">
                                {sc.label}
                              </span>
                              <span
                                className={`ml-auto text-xs font-semibold ${STATUS_STYLES[sc.status].text}`}
                              >
                                {STATUS_STYLES[sc.status].label}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 font-mono break-all">
                              {sc.evidence}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </DrawerSection>

          <DrawerSection icon={FileText} title="Change request (Jira)">
            <dl>
              <KV k="Key" v={<MonoChip>{c.key}</MonoChip>} />
              <KV k="Type" v={c.type} />
              <KV k="Priority" v={c.priority} />
              <KV
                k="Emergency"
                v={
                  c.emergency ? (
                    <span className="text-red-700 font-semibold">Yes</span>
                  ) : (
                    "No"
                  )
                }
              />
              <KV k="Risk level" v={c.riskLevel || "—"} />
              <KV
                k="Requester"
                v={`${c.requesterDisplay} (${c.requester})`}
              />
              <KV k="Created" v={fmtDate(c.createdAt)} mono />
              <KV k="CAB approver" v={prettyUser(c.cabApprover)} />
              <KV k="CAB approved at" v={fmtDate(c.cabApprovedAt)} mono />
              <KV k="Resolution date" v={fmtDate(c.resolvedAt)} mono />
              <KV k="Target environments" v={c.environmentsTargeted.join(", ")} />
              <KV
                k="Business service"
                v={<MonoChip muted>{c.businessService ?? "—"}</MonoChip>}
              />
            </dl>
          </DrawerSection>

          {c.pr && (
            <DrawerSection icon={GitPullRequest} title="Code change (GitHub)">
              <dl>
                <KV
                  k="Repository"
                  v={<MonoChip muted>{c.repository ?? "—"}</MonoChip>}
                />
                <KV
                  k="Pull request"
                  v={<MonoChip muted>#{c.prNumber ?? "—"}</MonoChip>}
                />
                <KV
                  k="Branch"
                  v={
                    <span className="font-mono text-xs">{c.pr.head.ref}</span>
                  }
                />
                <KV
                  k="Author"
                  v={<span className="font-mono text-xs">{c.prAuthor}</span>}
                />
                <KV
                  k="Reviewers"
                  v={
                    c.pr.reviews.map((r) => r.user.login).join(", ") || "—"
                  }
                />
                <KV
                  k="Merged by"
                  v={<span className="font-mono text-xs">{c.prMergedBy}</span>}
                />
                <KV k="Merged at" v={fmtDate(c.pr.merged_at)} mono />
                <KV
                  k="Files changed"
                  v={`${c.pr.changed_files ?? 0} (+${c.pr.additions ?? 0} / −${c.pr.deletions ?? 0})`}
                />
              </dl>
            </DrawerSection>
          )}

          {c.run && (
            <DrawerSection icon={Workflow} title="Pipeline evidence (CI/CD)">
              <div className="mb-3">
                <div className="text-xs text-slate-500 font-mono break-all">
                  {c.run.html_url}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Triggered by{" "}
                  <span className="font-mono">
                    {c.run.triggering_actor.login}
                  </span>{" "}
                  · {fmtDate(c.run.run_started_at)} →{" "}
                  {fmtDate(c.run.updated_at)}
                </div>
              </div>
              <div className="space-y-1.5">
                {c.run.stages.map((s, i) => {
                  const ok = s.conclusion === "success";
                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-between gap-3 p-2.5 rounded-md border ${
                        ok
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-red-200 bg-red-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {ok ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900">
                            {s.name}
                          </div>
                          {s.notes && (
                            <div className="text-xs text-slate-600 mt-0.5">
                              {s.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${
                          ok
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {s.conclusion}
                      </span>
                    </div>
                  );
                })}
              </div>
            </DrawerSection>
          )}

          {c.dep && (
            <DrawerSection icon={Rocket} title="Production deployment">
              <dl>
                <KV
                  k="Deployment ID"
                  v={<MonoChip muted>{c.dep.id}</MonoChip>}
                />
                <KV
                  k="Environment"
                  v={
                    <span className="font-semibold uppercase">
                      {c.dep.environment}
                    </span>
                  }
                />
                <KV
                  k="Release version"
                  v={
                    <span className="font-mono text-xs">
                      {c.dep.release_version}
                    </span>
                  }
                />
                <KV k="Status" v={c.dep.status} />
                <KV
                  k="Deployed_by (identity)"
                  v={
                    <span className="font-mono text-xs">
                      {c.dep.deployed_by}
                    </span>
                  }
                />
                <KV k="Actor type" v={c.dep.actor_type ?? "—"} />
                <KV
                  k="Command executed by"
                  v={
                    <span className="font-mono text-xs">
                      {c.dep.command_executed_by}
                    </span>
                  }
                />
                <KV k="Timestamp" v={fmtDate(c.dep.timestamp)} mono />
                <KV
                  k="Source IP"
                  v={
                    <span className="font-mono text-xs">
                      {c.dep.source_ip ?? "—"}
                    </span>
                  }
                />
                <KV
                  k="Artifact image"
                  v={
                    <span className="font-mono text-xs break-all">
                      {c.dep.artifact?.image ?? "—"}
                    </span>
                  }
                />
              </dl>
            </DrawerSection>
          )}

          {(c.freezeHit || c.freezeException) && (
            <DrawerSection icon={Snowflake} title="Freeze window evaluation">
              {c.freezeHit ? (
                <>
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 mb-3">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <MonoChip>{c.freezeHit.id}</MonoChip>
                      <span className="text-sm font-semibold text-slate-900">
                        {c.freezeHit.label}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-mono">
                      {fmtDate(c.freezeHit.start)} → {fmtDate(c.freezeHit.end)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {c.freezeHit.reason}
                    </div>
                  </div>
                  {c.freezeException ? (
                    <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50">
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-semibold text-emerald-800">
                          Exception approved
                        </span>
                      </div>
                      <dl>
                        <KV
                          k="Exception ID"
                          v={<MonoChip muted>{c.freezeException.id}</MonoChip>}
                        />
                        <KV
                          k="Approver"
                          v={prettyUser(c.freezeException.approver)}
                        />
                        <KV
                          k="Approved at"
                          v={fmtDate(c.freezeException.approved_at)}
                          mono
                        />
                        <KV
                          k="Justification"
                          v={
                            <span className="text-xs">
                              {c.freezeException.justification ?? "—"}
                            </span>
                          }
                        />
                      </dl>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg border border-red-200 bg-red-50">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-semibold text-red-800">
                          No exception record found for this deployment
                        </span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-emerald-800">
                    Deployment did not fall inside any declared freeze window.
                  </span>
                </div>
              )}
            </DrawerSection>
          )}

          {c.rollback && (
            <DrawerSection icon={Undo2} title="Rollback evidence">
              <dl>
                <KV
                  k="Plan documented"
                  v={
                    c.rollback.rollback_plan_present ? (
                      "Yes"
                    ) : (
                      <span className="text-red-700 font-semibold">No</span>
                    )
                  }
                />
                {c.rollback.rollback_plan_present && (
                  <>
                    <KV
                      k="Steps"
                      v={
                        <span className="text-xs">
                          {c.rollback.rollback_steps ?? "—"}
                        </span>
                      }
                    />
                    <KV
                      k="Validated in pre-prod"
                      v={
                        c.rollback.rollback_tested ? (
                          "Yes"
                        ) : (
                          <span className="text-amber-700 font-semibold">No</span>
                        )
                      }
                    />
                    <KV
                      k="Tested in"
                      v={c.rollback.rollback_tested_in || "—"}
                    />
                    <KV
                      k="Tested at"
                      v={fmtDate(c.rollback.rollback_tested_at)}
                      mono
                    />
                    <KV
                      k="Validator"
                      v={c.rollback.rollback_validator || "—"}
                    />
                    <KV
                      k="Evidence ref"
                      v={
                        <span className="font-mono text-xs break-all">
                          {c.rollback.evidence_reference || "—"}
                        </span>
                      }
                    />
                  </>
                )}
                {c.rollback.notes && (
                  <KV
                    k="Notes"
                    v={
                      <span className="text-xs text-amber-700">
                        {c.rollback.notes}
                      </span>
                    }
                  />
                )}
              </dl>
            </DrawerSection>
          )}

          <DrawerSection icon={ScrollText} title="Raw collector payloads">
            <div className="space-y-2">
              <RawBlock
                title="change_request_collector.issues[] entry"
                payload={c.issue}
              />
              {c.pr && (
                <RawBlock
                  title="pull_request_collector.pull_requests[] entry"
                  payload={c.pr}
                />
              )}
              {c.run && (
                <RawBlock
                  title="cicd_evidence_collector.workflow_runs[] entry"
                  payload={c.run}
                />
              )}
              {c.dep && (
                <RawBlock
                  title="deployment_activity_collector.deployments[] entry"
                  payload={c.dep}
                />
              )}
              {c.freezeHit && (
                <RawBlock
                  title="freeze_window_collector.freeze_windows[] entry"
                  payload={c.freezeHit}
                />
              )}
              {c.freezeException && (
                <RawBlock
                  title="freeze_window_collector.exceptions[] entry"
                  payload={c.freezeException}
                />
              )}
              {c.rollback && (
                <RawBlock
                  title="rollback_evidence_collector.records[] entry"
                  payload={c.rollback}
                />
              )}
            </div>
          </DrawerSection>
        </div>
      </div>
    </>
  );
}
