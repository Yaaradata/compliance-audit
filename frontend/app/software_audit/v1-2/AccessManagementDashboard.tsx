"use client";

/**
 * =============================================================================
 *  ACCESS MANAGEMENT & IDENTITY GOVERNANCE — Audit Dashboard (Demo)
 * =============================================================================
 *  Stack: React + Tailwind CSS + lucide-react
 *
 *  Data is loaded from collector_data.json (boto3-style collector payloads).
 * =============================================================================
 */

import React, { useMemo, useState, type ReactElement, type ReactNode } from "react";
import {
  ShieldAlert, ShieldCheck, Users, Key, Clock, AlertTriangle,
  CheckCircle2, XCircle, ChevronRight, Search, Download,
  FileText, Activity, Fingerprint, UserCog, X,
  ArrowUpRight, Calendar, Server,
  KeyRound, ScrollText, ShieldQuestion
} from "lucide-react";
import collectorData from "./collector_data.json";

export type CollectorPayload = typeof collectorData;

type CloudTrailEventRow = CollectorPayload["cloudtrail_activity_collector"]["Events"][number];

function cloudTrailLocation(e: CloudTrailEventRow): string {
  const ext = e as CloudTrailEventRow & { AwsRegion?: string; SourceIPAddress?: string };
  const direct = [ext.AwsRegion, ext.SourceIPAddress].filter(Boolean).join(" · ");
  if (direct) return direct;
  try {
    const inner = JSON.parse(e.CloudTrailEvent || "{}") as { awsRegion?: string; sourceIPAddress?: string };
    const s = [inner.awsRegion, inner.sourceIPAddress].filter(Boolean).join(" · ");
    return s || "—";
  } catch {
    return "—";
  }
}

/* ============================================================================
 * 1. AUDIT CONSTANTS
 * ========================================================================= */
const PRIVILEGED_POLICIES = new Set([
  "AdministratorAccess", "PowerUserAccess", "IAMFullAccess"
]);
const DORMANT_PRIV_DAYS = 30;
const DORMANT_NORMAL_DAYS = 60;
const STALE_KEY_DAYS = 180;

function daysSince(iso: string | undefined | null, now: Date): number | null {
  if (!iso) return null;
  return Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000);
}

type FlagSeverity = "critical" | "high" | "medium" | "low";

type AuditFlag = {
  severity: FlagSeverity;
  code: string;
  title: string;
  detail: string;
  evidence: string;
  rule: string;
};

const sevRank: Record<FlagSeverity, number> = { low: 0, medium: 1, high: 2, critical: 3 };

type RiskLevel = FlagSeverity | "clean";

const RISK_LEVELS = ["critical", "high", "medium", "low", "clean"] as const;

const FLAG_SEVERITIES = ["critical", "high", "medium", "low"] as const;

const riskSortRank: Record<RiskLevel, number> = {
  clean: -1,
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

const highestSeverity = (flags: AuditFlag[]): FlagSeverity =>
  flags.reduce(
    (m, f) => (sevRank[f.severity] > sevRank[m] ? f.severity : m),
    "low" as FlagSeverity,
  );

const prettyName = (u: string) =>
  u.replace(/[._]external$/, "").split(/[._]/).map(s =>
    s.charAt(0).toUpperCase() + s.slice(1)).join(" ");

const fmtDate = (iso: string | undefined | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC"
  }) + " UTC";
};
const fmtDateShort = (iso: string | undefined | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "UTC"
  });
};

/* ============================================================================
 * 2. TRANSFORMATION: raw collectors -> view model
 * ========================================================================= */
type CredParsed = CollectorPayload["credential_report_collector"]["Content_Parsed"][number];

type CredFlexible = Partial<CredParsed> & {
  access_key_2_last_rotated?: string;
  access_key_2_last_used_date?: string;
  access_key_2_active?: boolean;
};

type MfaDevicesByUser = Record<
  string,
  CollectorPayload["mfa_device_collector"]["MFADevicesByUser"][keyof CollectorPayload["mfa_device_collector"]["MFADevicesByUser"]]
>;

function buildViewModel(raw: CollectorPayload) {
  const now = new Date(raw._metadata.collected_at);
  const credMap = new Map<string, CredParsed>(
    raw.credential_report_collector.Content_Parsed.map((r) => [r.user, r]),
  );
  const mfaMap = raw.mfa_device_collector.MFADevicesByUser as MfaDevicesByUser;
  const events = raw.cloudtrail_activity_collector.Events;
  const findings = raw.access_analyzer_collector.findings;

  const users = raw.iam_inventory_collector.UserDetailList.map((u) => {
    const cred: CredFlexible = credMap.get(u.UserName) ?? {};
    const mfaDevices = mfaMap[u.UserName]?.MFADevices || [];
    const userEvents = events
      .filter((e) => e.Username === u.UserName)
      .sort(
        (a, b) =>
          new Date(b.EventTime).getTime() - new Date(a.EventTime).getTime(),
      );
    const userFindings = findings.filter(
      f => f._linked_principal_username === u.UserName
    );

    const policyNames = u.AttachedManagedPolicies.map(p => p.PolicyName);
    const isPrivileged = policyNames.some(p => PRIVILEGED_POLICIES.has(p));
    const isAdmin =
      policyNames.includes("AdministratorAccess") ||
      u.GroupList.includes("Admins");
    const mfaEnabled = mfaDevices.length > 0 && cred.mfa_active !== false;

    const lastActivity =
      cred.password_last_used ||
      cred.access_key_1_last_used_date ||
      null;
    const inactiveDays = daysSince(lastActivity, now) ?? 9999;

    const tag = (k: string) => u.Tags.find((t) => t.Key === k)?.Value;
    const role = tag("Role") || "Unknown";
    const department = tag("Department") || "—";
    const hrStatus = tag("HRStatus") || "UNKNOWN";
    const owner = tag("Owner") || "—";

    const accessKeys: {
      slot: number;
      lastRotated?: string;
      lastUsed?: string;
      ageDays: number | null;
    }[] = [];
    if (cred.access_key_1_active) accessKeys.push({
      slot: 1,
      lastRotated: cred.access_key_1_last_rotated,
      lastUsed: cred.access_key_1_last_used_date,
      ageDays: daysSince(cred.access_key_1_last_rotated, now)
    });
    if (cred.access_key_2_active) accessKeys.push({
      slot: 2,
      lastRotated: cred.access_key_2_last_rotated,
      lastUsed: cred.access_key_2_last_used_date,
      ageDays: daysSince(cred.access_key_2_last_rotated, now)
    });

    const flags = evaluateFlags({
      role, isAdmin, isPrivileged, mfaEnabled,
      inactiveDays, policyNames, userFindings, userEvents, accessKeys
    });

    return {
      username: u.UserName,
      displayName: prettyName(u.UserName),
      arn: u.Arn,
      userId: u.UserId,
      role, department, hrStatus, owner,
      createDate: u.CreateDate,
      lastActivity,
      inactiveDays,
      groups: u.GroupList,
      attachedPolicies: u.AttachedManagedPolicies,
      inlinePolicies: u.UserPolicyList,
      tags: u.Tags,
      mfaEnabled,
      mfaDevices,
      accessKeys,
      isAdmin,
      isPrivileged,
      isExternal: u.Path.startsWith("/external/"),
      passwordEnabled: cred.password_enabled === true,
      passwordLastChanged: cred.password_last_changed,
      flags,
      risk: (flags.length ? highestSeverity(flags) : "clean") satisfies RiskLevel,
      events: userEvents,
      findings: userFindings,
      policyNames,
      cred
    };
  });

  // findings keyed for Risks panel too
  const allFindings = findings.map(f => ({
    ...f,
    linkedUser: f._linked_principal_username || null,
    description: f._finding_description
  }));

  return { users, findings: allFindings, events };
}

export type AccessManagementViewModel = ReturnType<typeof buildViewModel>;
export type AccessManagementUser = AccessManagementViewModel["users"][number];

type AccessAnalyzerFinding =
  CollectorPayload["access_analyzer_collector"]["findings"][number];

type EvaluateCtx = {
  role: string;
  isAdmin: boolean;
  isPrivileged: boolean;
  mfaEnabled: boolean;
  inactiveDays: number;
  policyNames: string[];
  userFindings: AccessAnalyzerFinding[];
  userEvents: CloudTrailEventRow[];
  accessKeys: {
    slot: number;
    lastRotated?: string;
    lastUsed?: string;
    ageDays: number | null;
  }[];
};

/* ============================================================================
 * 3. AUDIT RULES — deterministic, demo-grade
 * ========================================================================= */
function evaluateFlags(ctx: EvaluateCtx): AuditFlag[] {
  const {
    role, isAdmin, isPrivileged, mfaEnabled,
    inactiveDays, policyNames, userFindings, userEvents, accessKeys
  } = ctx;
  const flags: AuditFlag[] = [];

  // R1: MFA on privileged accounts
  if (isPrivileged && !mfaEnabled) {
    flags.push({
      severity: "critical",
      code: "MFA_MISSING_PRIVILEGED",
      title: "Privileged user without MFA",
      detail: `Privileged policies attached (${policyNames.filter(p => PRIVILEGED_POLICIES.has(p)).join(", ")}) but no active MFA device.`,
      evidence: "Credential Report: mfa_active=false · MFA Device Collector: empty array",
      rule: "R1 — Privileged account MFA enforcement"
    });
  } else if (!mfaEnabled) {
    flags.push({
      severity: "high",
      code: "MFA_MISSING",
      title: "MFA not enabled",
      detail: "Console access is enabled but no MFA device registered.",
      evidence: "MFA Device Collector: empty array",
      rule: "R1b — MFA for console-enabled users"
    });
  }

  // R2: Dormant account thresholds
  if (isPrivileged && inactiveDays > DORMANT_PRIV_DAYS) {
    flags.push({
      severity: "high",
      code: "DORMANT_PRIVILEGED",
      title: "Dormant privileged account",
      detail: `Privileged user inactive for ${inactiveDays} days (threshold ${DORMANT_PRIV_DAYS}).`,
      evidence: "Credential Report: password_last_used & access_key_last_used_date",
      rule: "R2 — Dormant privileged accounts (>30 days)"
    });
  } else if (!isPrivileged && inactiveDays > DORMANT_NORMAL_DAYS) {
    flags.push({
      severity: "medium",
      code: "DORMANT",
      title: "Dormant account",
      detail: `Account inactive for ${inactiveDays} days (threshold ${DORMANT_NORMAL_DAYS}).`,
      evidence: "Credential Report: password_last_used",
      rule: "R2b — Dormant standard accounts (>60 days)"
    });
  }

  // R3: Least privilege — Junior with Admin
  if (role === "JuniorEngineer" && policyNames.includes("AdministratorAccess")) {
    flags.push({
      severity: "high",
      code: "EXCESSIVE_JUNIOR",
      title: "Excessive access for role",
      detail: "Junior Engineer carries AdministratorAccess. Expected baseline: read-only or scoped sandbox.",
      evidence: "IAM Inventory: AttachedManagedPolicies includes AdministratorAccess",
      rule: "R3 — Least privilege by role"
    });
  }

  // R4: Separation of Duties — Infra + IAM
  if (role === "InfrastructureEngineer" && policyNames.includes("IAMFullAccess")) {
    flags.push({
      severity: "high",
      code: "SOD_INFRA_IAM",
      title: "Separation of Duties violation",
      detail: "Infrastructure Engineer holds IAMFullAccess. Infra role should not control identity — enables unilateral privilege escalation.",
      evidence: "IAM Inventory: AttachedManagedPolicies includes IAMFullAccess",
      rule: "R4 — SoD: infra vs identity"
    });
  }

  // R5: Access Analyzer finding linked to user's policy
  userFindings.forEach(f => {
    if (f.status === "ACTIVE") {
      flags.push({
        severity: "high",
        code: "ANALYZER_EXPOSURE",
        title: "Resource exposed via user policy",
        detail: `Access Analyzer flagged ${f.analyzedResource} as ${f.isPublic ? "PUBLIC" : "externally accessible"}.`,
        evidence: `Access Analyzer finding ${f.id}`,
        rule: "R5 — External exposure via principal"
      });
    }
  });

  // R6: Sensitive CloudTrail actions
  const sensitiveNames = [
    "CreateAccessKey", "AttachUserPolicy", "PutUserPolicy",
    "CreateUser", "DeleteUser", "PutBucketPolicy", "CreateRole"
  ];
  const sensitive = userEvents.filter(e => sensitiveNames.includes(e.EventName));
  if (sensitive.length) {
    flags.push({
      severity: sensitive.length > 2 ? "high" : "medium",
      code: "SENSITIVE_ACTIVITY",
      title: "Sensitive actions observed",
      detail: `${sensitive.length} sensitive action(s) in last 7 days: ${[...new Set(sensitive.map(s => s.EventName))].join(", ")}.`,
      evidence: `CloudTrail: ${sensitive.map(s => s.EventId).join(", ")}`,
      rule: "R6 — Sensitive activity review"
    });
  }

  // R7: Stale access keys
  accessKeys.forEach(k => {
    if (k.ageDays != null && k.ageDays > STALE_KEY_DAYS) {
      flags.push({
        severity: "medium",
        code: "STALE_KEY",
        title: "Stale access key",
        detail: `Access key slot ${k.slot} not rotated in ${k.ageDays} days (policy ${STALE_KEY_DAYS}).`,
        evidence: "Credential Report: access_key_last_rotated",
        rule: "R7 — Access key rotation"
      });
    }
  });

  return flags;
}

/* ============================================================================
 * 4. STYLE TOKENS & PRIMITIVES
 * ========================================================================= */
const SEV_STYLES = {
  critical: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500", solid: "bg-red-600", soft: "bg-red-100" },
  high:     { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500", solid: "bg-orange-600", soft: "bg-orange-100" },
  medium:   { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500", solid: "bg-amber-600", soft: "bg-amber-100" },
  low:      { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400", solid: "bg-slate-500", soft: "bg-slate-100" },
  clean:    { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", solid: "bg-emerald-600", soft: "bg-emerald-100" }
};

const SEV_LABEL: Record<RiskLevel, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  clean: "Clean",
};

function SeverityChip({ severity, size = "sm" }: { severity: RiskLevel; size?: "sm" | "md" }) {
  const s = SEV_STYLES[severity as keyof typeof SEV_STYLES] || SEV_STYLES.low;
  const pad = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-wider ${pad} ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
      {SEV_LABEL[severity] ?? severity}
    </span>
  );
}

function KV({ k, v, mono = false }: { k: string; v: ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
      <dt className="text-xs uppercase tracking-wider text-slate-500 font-semibold shrink-0 pt-0.5">{k}</dt>
      <dd className={`text-sm text-slate-900 text-right ${mono ? "font-mono text-xs break-all" : ""}`}>{v}</dd>
    </div>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border border-indigo-100/90 bg-white/95 shadow-md shadow-indigo-950/5 ring-1 ring-white/60 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}

function SectionTitle({
  children,
  right,
  subtitle,
}: {
  children: ReactNode;
  right?: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">{children}</h2>
        {subtitle && <p className="text-sm text-indigo-600/75 mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

/* ============================================================================
 * 5. MAIN COMPONENT
 * ========================================================================= */
const TABS = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "User Access" },
  { id: "privileged", label: "Privileged" },
  { id: "risks", label: "Risks & Findings" },
  { id: "activity", label: "Activity" }
];

export default function AccessManagementDashboard({
  data = collectorData,
}: {
  data?: CollectorPayload;
}) {
  const vm = useMemo(() => buildViewModel(data), [data]);
  const [tab, setTab] = useState("overview");
  const [selectedUser, setSelectedUser] = useState<AccessManagementUser | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");

  const totals = useMemo(() => {
    const total = vm.users.length;
    const privileged = vm.users.filter(u => u.isPrivileged).length;
    const noMfa = vm.users.filter(u => !u.mfaEnabled).length;
    const dormantPriv = vm.users.filter(u => u.isPrivileged && u.inactiveDays > DORMANT_PRIV_DAYS).length;
    const highRisk = vm.users.filter(u => u.risk === "critical" || u.risk === "high").length;
    const critical = vm.users.filter(u => u.risk === "critical").length;
    const clean = vm.users.filter(u => u.risk === "clean").length;
    const score = Math.round((clean / total) * 100);
    return { total, privileged, noMfa, dormantPriv, highRisk, critical, clean, score };
  }, [vm]);

  const filtered = useMemo(() => {
    return vm.users.filter(u => {
      if (riskFilter !== "all" && u.risk !== riskFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!u.username.toLowerCase().includes(q) &&
            !u.displayName.toLowerCase().includes(q) &&
            !u.role.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [vm.users, search, riskFilter]);

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-indigo-50/70 to-violet-100/80 text-slate-900 antialiased"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}
    >
      {/* Top bar */}
      <header className="sticky top-0 z-20 w-full border-b border-indigo-200/50 bg-white/75 shadow-sm shadow-indigo-900/5 backdrop-blur-md">
        <div className="flex h-14 w-full items-center justify-between px-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md shadow-indigo-500/30">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="bg-gradient-to-r from-indigo-700 to-violet-600 bg-clip-text text-sm font-bold text-transparent">
                YaaraLabs
              </span>
              <span className="text-indigo-300">/</span>
              <span className="text-sm font-medium text-slate-600">Audit Console</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="hidden items-center gap-1.5 rounded-lg border border-indigo-200/80 bg-indigo-50/90 px-2.5 py-1 font-mono text-xs font-medium text-indigo-800 md:inline-flex">
              <Server className="h-3 w-3 text-indigo-500" /> aws · {data._metadata.account_id}
            </span>
            <span className="hidden items-center gap-1.5 rounded-lg border border-violet-200/80 bg-violet-50/90 px-2.5 py-1 font-mono text-xs font-medium text-violet-800 sm:inline-flex">
              {data._metadata.region}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200/90 bg-gradient-to-r from-cyan-50 to-sky-50 px-2.5 py-1 text-xs font-semibold text-cyan-900">
              <Calendar className="h-3 w-3 text-cyan-600" />
              Collected {fmtDateShort(data._metadata.collected_at)}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="w-full max-w-none px-5 py-8 sm:px-8 lg:px-10">
        {/* Breadcrumb + page title */}
        <div className="mb-8">
          <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-indigo-600/80">
            <span className="font-medium text-indigo-500">Engagement</span>
            <ChevronRight className="h-3 w-3 shrink-0 text-indigo-300" />
            <span>Identity & Access</span>
            <ChevronRight className="h-3 w-3 shrink-0 text-indigo-300" />
            <span className="font-semibold text-slate-800">Module A · Access Management</span>
          </div>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <h1 className="bg-gradient-to-r from-slate-900 via-indigo-900 to-violet-800 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
                Access Management & Identity Governance
              </h1>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-200/90 bg-white/90 px-4 py-2.5 text-sm font-semibold text-indigo-800 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50/80"
              >
                <Download className="h-4 w-4 text-indigo-500" />
                Export evidence pack
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:from-indigo-500 hover:to-violet-500"
              >
                <FileText className="h-4 w-4" />
                Generate audit memo
              </button>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <SummaryCard icon={<Users />} label="Total users" value={totals.total} sub="IAM principals" />
          <SummaryCard icon={<Key />} label="Privileged" value={totals.privileged} sub={`${Math.round(totals.privileged / totals.total * 100)}% of users`} accent="orange" />
          <SummaryCard icon={<Fingerprint />} label="MFA missing" value={totals.noMfa} sub="users without MFA" accent={totals.noMfa > 0 ? "red" : "clean"} />
          <SummaryCard icon={<Clock />} label="Dormant privileged" value={totals.dormantPriv} sub={`>${DORMANT_PRIV_DAYS} days inactive`} accent={totals.dormantPriv > 0 ? "orange" : "clean"} />
          <SummaryCard icon={<AlertTriangle />} label="High-risk users" value={totals.highRisk} sub={`${totals.critical} critical`} accent={totals.highRisk > 0 ? "red" : "clean"} />
          <SummaryCard icon={<CheckCircle2 />} label="Compliance" value={`${totals.score}%`} sub={`${totals.clean}/${totals.total} clean`} accent={totals.score >= 70 ? "clean" : totals.score >= 40 ? "orange" : "red"} />
        </div>

        {/* Tabs */}
        <div className="mb-6 rounded-2xl border border-indigo-100/90 bg-white/60 p-1.5 shadow-inner shadow-indigo-950/5 backdrop-blur-sm">
          <nav className="flex w-full flex-wrap gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  tab === t.id
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25"
                    : "text-slate-600 hover:bg-white/80 hover:text-indigo-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="pb-16">
          {tab === "overview" && (
            <OverviewTab
              vm={vm}
              totals={totals}
              raw={data}
              onOpenUser={setSelectedUser}
            />
          )}
          {tab === "users" && <UsersTab filtered={filtered} total={vm.users.length} search={search} setSearch={setSearch} riskFilter={riskFilter} setRiskFilter={setRiskFilter} onOpenUser={setSelectedUser} />}
          {tab === "privileged" && <PrivilegedTab vm={vm} onOpenUser={setSelectedUser} />}
          {tab === "risks" && <RisksTab vm={vm} onOpenUser={setSelectedUser} />}
          {tab === "activity" && <ActivityTab vm={vm} onOpenUser={setSelectedUser} />}
        </div>
      </main>

      {/* User drawer */}
      {selectedUser && (
        <UserDrawer
          user={selectedUser}
          raw={data}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}

/* ============================================================================
 * 6. SUMMARY CARD
 * ========================================================================= */
function SummaryCard({
  icon,
  label,
  value,
  sub,
  accent = "neutral",
}: {
  icon: ReactElement<{ className?: string }>;
  label: string;
  value: ReactNode;
  sub: string;
  accent?: "neutral" | "red" | "orange" | "clean";
}) {
  const accentStyles: Record<
    "neutral" | "red" | "orange" | "clean",
    string
  > = {
    neutral: "bg-slate-100 text-slate-600",
    red: "bg-red-100 text-red-600",
    orange: "bg-orange-100 text-orange-600",
    clean: "bg-emerald-100 text-emerald-600"
  };
  const a = accentStyles[accent] || accentStyles.neutral;
  const bar =
    accent === "red"
      ? "from-rose-500 to-orange-500"
      : accent === "orange"
        ? "from-amber-500 to-orange-500"
        : accent === "clean"
          ? "from-emerald-500 to-teal-500"
          : "from-indigo-500 to-violet-500";
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-indigo-100/80 bg-white/90 p-4 shadow-md shadow-indigo-950/5 ring-1 ring-white/50 backdrop-blur-sm transition hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/10">
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-90 ${bar}`}
        aria-hidden
      />
      <div className="mb-3 flex items-center justify-between pt-1">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-900/55">
          {label}
        </span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl shadow-sm ${a}`}>
          {React.cloneElement(icon, { className: "w-4 h-4" })}
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight text-slate-900">{value}</div>
      <div className="mt-1 text-xs font-medium text-slate-500">{sub}</div>
    </div>
  );
}

/* ============================================================================
 * 7. OVERVIEW TAB
 * ========================================================================= */
function OverviewTab({
  vm,
  totals,
  raw,
  onOpenUser,
}: {
  vm: AccessManagementViewModel;
  totals: {
    total: number;
    privileged: number;
    noMfa: number;
    dormantPriv: number;
    highRisk: number;
    critical: number;
    clean: number;
    score: number;
  };
  raw: CollectorPayload;
  onOpenUser: (u: AccessManagementUser) => void;
}) {
  const byRisk = {
    critical: vm.users.filter(u => u.risk === "critical"),
    high: vm.users.filter(u => u.risk === "high"),
    medium: vm.users.filter(u => u.risk === "medium"),
    low: vm.users.filter(u => u.risk === "low"),
    clean: vm.users.filter(u => u.risk === "clean"),
  };
  const topRisk = [...vm.users]
    .filter(u => u.flags.length > 0)
    .sort(
      (a, b) =>
        riskSortRank[b.risk as RiskLevel] - riskSortRank[a.risk as RiskLevel] ||
        b.flags.length - a.flags.length,
    )
    .slice(0, 6);

  const controls = [
    { name: "All privileged users have MFA", pass: vm.users.filter(u => u.isPrivileged && !u.mfaEnabled).length === 0 },
    { name: "No dormant privileged accounts (>30d)", pass: totals.dormantPriv === 0 },
    { name: "No junior users with AdministratorAccess", pass: !vm.users.some(u => u.role === "JuniorEngineer" && u.policyNames.includes("AdministratorAccess")) },
    { name: "Separation of Duties (infra vs identity)", pass: !vm.users.some(u => u.role === "InfrastructureEngineer" && u.policyNames.includes("IAMFullAccess")) },
    { name: "No active Access Analyzer findings", pass: vm.findings.filter(f => f.status === "ACTIVE").length === 0 },
    { name: "External users scoped & monitored", pass: vm.users.filter(u => u.isExternal).every(u => !u.policyNames.includes("AdministratorAccess")) },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Risk composition */}
      <Card className="p-6 lg:col-span-2">
        <SectionTitle subtitle="Distribution of audited principals by highest-severity flag">Risk composition</SectionTitle>
        <div className="space-y-3">
          {RISK_LEVELS.map((sev) => {
            const count = byRisk[sev].length;
            const pct = totals.total ? (count / totals.total) * 100 : 0;
            const s = SEV_STYLES[sev];
            return (
              <div key={sev}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${s.dot}`}></span>
                    <span className="font-medium text-slate-700">{SEV_LABEL[sev]}</span>
                  </div>
                  <span className="text-slate-500 tabular-nums">{count} <span className="text-slate-400">/ {totals.total}</span></span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full ${s.solid} rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Control checks */}
      <Card className="p-6">
        <SectionTitle subtitle="Key identity controls">Control checks</SectionTitle>
        <ul className="space-y-3">
          {controls.map((c, i) => (
            <li key={i} className="flex items-start gap-3">
              {c.pass
                ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                : <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
              <span className="text-sm text-slate-700 leading-snug">{c.name}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Highest-risk identities */}
      <Card className="p-6 lg:col-span-2">
        <SectionTitle subtitle="Click a row to inspect the evidence trail">Highest-risk identities</SectionTitle>
        {topRisk.length === 0 ? (
          <div className="text-sm text-slate-500 text-center py-8">No elevated-risk users detected.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {topRisk.map(u => (
              <button key={u.username} onClick={() => onOpenUser(u)}
                className="-mx-2 flex w-full items-center justify-between gap-4 rounded-xl px-2 py-3 text-left transition-colors hover:bg-indigo-50/60">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600 shrink-0">
                    {u.displayName.split(" ").map(w => w[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{u.displayName}</div>
                    <div className="text-xs text-slate-500 font-mono truncate">{u.username} · {humanizeRole(u.role)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="hidden sm:block text-xs text-slate-500 tabular-nums">
                    {u.flags.length} finding{u.flags.length !== 1 ? "s" : ""}
                  </div>
                  <SeverityChip severity={u.risk as RiskLevel} />
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Evidence sources */}
      <Card className="p-6">
        <SectionTitle subtitle="Collectors feeding this module">Evidence sources</SectionTitle>
        <div className="space-y-2.5">
          <EvidenceSourceCard name="IAM Inventory" api="iam:GetAccountAuthorizationDetails" count={`${raw.iam_inventory_collector.UserDetailList.length} users`} />
          <EvidenceSourceCard name="Credential Report" api="iam:GetCredentialReport" count={`${raw.credential_report_collector.Content_Parsed.length} rows`} />
          <EvidenceSourceCard name="MFA Devices" api="iam:ListMFADevices" count={`${Object.keys(raw.mfa_device_collector.MFADevicesByUser).length} users`} />
          <EvidenceSourceCard name="CloudTrail" api="cloudtrail:LookupEvents" count={`${raw.cloudtrail_activity_collector.Events.length} events · 7d`} />
          <EvidenceSourceCard name="Access Analyzer" api="accessanalyzer:ListFindings" count={`${raw.access_analyzer_collector.findings.length} findings`} />
        </div>
      </Card>
    </div>
  );
}

function EvidenceSourceCard({
  name,
  api,
  count,
}: {
  name: string;
  api: string;
  count: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-indigo-100/80 p-3 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-slate-900">{name}</div>
        <div className="text-xs text-slate-500 font-mono truncate">{api}</div>
      </div>
      <span className="text-xs text-slate-600 font-medium shrink-0 tabular-nums">{count}</span>
    </div>
  );
}

function humanizeRole(r: string) {
  return r.replace(/([A-Z])/g, " $1").replace(/^ /, "").trim();
}

/* ============================================================================
 * 8. USERS TAB
 * ========================================================================= */
function UsersTab({
  filtered,
  total,
  search,
  setSearch,
  riskFilter,
  setRiskFilter,
  onOpenUser,
}: {
  filtered: AccessManagementUser[];
  total: number;
  search: string;
  setSearch: (s: string) => void;
  riskFilter: string;
  setRiskFilter: (r: string) => void;
  onOpenUser: (u: AccessManagementUser) => void;
}) {
  const riskOptions = ["all", "critical", "high", "medium", "low", "clean"];
  return (
    <div>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-indigo-100/90 bg-gradient-to-r from-indigo-50/40 to-violet-50/30 p-4">
          <div className="relative w-64 min-w-[12rem] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search user, role, or username…"
              className="w-full rounded-xl border border-indigo-200/80 bg-white/90 py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200/60"
            />
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-indigo-100 bg-white/80 p-1 shadow-sm">
            {riskOptions.map(r => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                  riskFilter === r
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-800"
                }`}>
                {r}
              </button>
            ))}
          </div>
          <div className="text-xs text-slate-500 tabular-nums ml-auto">
            {filtered.length} / {total} users
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-indigo-100 bg-gradient-to-r from-indigo-50/90 to-violet-50/70">
              <tr>
                <th className="text-left font-semibold text-slate-600 text-xs uppercase tracking-wider px-4 py-3">User</th>
                <th className="text-left font-semibold text-slate-600 text-xs uppercase tracking-wider px-4 py-3">Role</th>
                <th className="text-left font-semibold text-slate-600 text-xs uppercase tracking-wider px-4 py-3">Access level</th>
                <th className="text-center font-semibold text-slate-600 text-xs uppercase tracking-wider px-4 py-3">MFA</th>
                <th className="text-right font-semibold text-slate-600 text-xs uppercase tracking-wider px-4 py-3">Last active</th>
                <th className="text-center font-semibold text-slate-600 text-xs uppercase tracking-wider px-4 py-3">Findings</th>
                <th className="text-left font-semibold text-slate-600 text-xs uppercase tracking-wider px-4 py-3">Risk</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(u => (
                <tr key={u.username} onClick={() => onOpenUser(u)} className="cursor-pointer transition-colors hover:bg-indigo-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600 shrink-0">
                        {u.displayName.split(" ").map(w => w[0]).slice(0, 2).join("")}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{u.displayName}</div>
                        <div className="text-xs text-slate-500 font-mono truncate">{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-700">{humanizeRole(u.role)}</span>
                    {u.isExternal && <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-purple-50 text-purple-700 border border-purple-200 font-medium uppercase tracking-wider">External</span>}
                  </td>
                  <td className="px-4 py-3">
                    {u.isAdmin
                      ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">Administrator</span>
                      : u.isPrivileged
                      ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">Privileged</span>
                      : <span className="text-xs text-slate-500">Standard</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {u.mfaEnabled
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-600 inline-block" />
                      : <XCircle className="w-4 h-4 text-red-600 inline-block" />}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.lastActivity ? (
                      <div>
                        <div className="text-slate-700 tabular-nums">{fmtDateShort(u.lastActivity)}</div>
                        <div className="text-xs text-slate-500">{u.inactiveDays}d ago</div>
                      </div>
                    ) : <span className="text-slate-400">never</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {u.flags.length > 0
                      ? <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-slate-100 text-slate-700 tabular-nums">{u.flags.length}</span>
                      : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3"><SeverityChip severity={u.risk as RiskLevel} /></td>
                  <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-slate-400" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-sm text-slate-500">No users match the current filters.</div>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ============================================================================
 * 9. PRIVILEGED TAB
 * ========================================================================= */
function PrivilegedTab({
  vm,
  onOpenUser,
}: {
  vm: AccessManagementViewModel;
  onOpenUser: (u: AccessManagementUser) => void;
}) {
  const privileged = vm.users.filter(u => u.isPrivileged);
  const privNoMfa = privileged.filter(u => !u.mfaEnabled);
  const privDormant = privileged.filter(u => u.inactiveDays > DORMANT_PRIV_DAYS);
  const admins = vm.users.filter(u => u.isAdmin);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <SectionTitle subtitle={`${privileged.length} principals holding elevated policies (AdministratorAccess, PowerUserAccess, or IAMFullAccess)`}>
          Privileged register
        </SectionTitle>
        <div className="divide-y divide-slate-100 -mx-6">
          {privileged.map(u => (
            <button key={u.username} onClick={() => onOpenUser(u)}
              className="w-full flex items-center justify-between gap-4 px-6 py-3 hover:bg-slate-50 text-left transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600 shrink-0">
                  {u.displayName.split(" ").map(w => w[0]).slice(0, 2).join("")}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">{u.displayName}</div>
                  <div className="text-xs text-slate-500 font-mono truncate">{humanizeRole(u.role)} · {u.policyNames.filter(p => PRIVILEGED_POLICIES.has(p)).join(", ")}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {u.mfaEnabled
                  ? <span className="inline-flex items-center gap-1 text-xs text-emerald-700"><ShieldCheck className="w-3.5 h-3.5" /> MFA</span>
                  : <span className="inline-flex items-center gap-1 text-xs text-red-700 font-semibold"><ShieldAlert className="w-3.5 h-3.5" /> No MFA</span>}
                <span className="text-xs text-slate-500 tabular-nums">{u.inactiveDays}d idle</span>
                <SeverityChip severity={u.risk as RiskLevel} />
              </div>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <SectionTitle subtitle="Rule R1 · Critical if privileged">
            Privileged without MFA
          </SectionTitle>
          <QuickList users={privNoMfa} emptyMsg="All privileged users have MFA enabled." onOpenUser={onOpenUser} />
        </Card>
        <Card className="p-6">
          <SectionTitle subtitle={`Rule R2 · Inactive >${DORMANT_PRIV_DAYS} days`}>
            Dormant privileged
          </SectionTitle>
          <QuickList users={privDormant} emptyMsg="No dormant privileged users." onOpenUser={onOpenUser} />
        </Card>
      </div>

      <Card className="p-6">
        <SectionTitle subtitle="Full administrators">Administrator accounts</SectionTitle>
        <QuickList users={admins} emptyMsg="No accounts hold AdministratorAccess." onOpenUser={onOpenUser} />
      </Card>
    </div>
  );
}

function QuickList({
  users,
  emptyMsg,
  onOpenUser,
}: {
  users: AccessManagementUser[];
  emptyMsg: string;
  onOpenUser: (u: AccessManagementUser) => void;
}) {
  if (users.length === 0) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <span className="text-sm text-emerald-700">{emptyMsg}</span>
      </div>
    );
  }
  return (
    <ul className="space-y-1.5">
      {users.map(u => (
        <li key={u.username}>
          <button onClick={() => onOpenUser(u)} className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-left transition-colors">
            <div className="min-w-0">
              <div className="text-sm font-medium text-slate-900 truncate">{u.displayName}</div>
              <div className="text-xs text-slate-500 font-mono truncate">{humanizeRole(u.role)}</div>
            </div>
            <SeverityChip severity={u.risk as RiskLevel} />
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ============================================================================
 * 10. RISKS TAB
 * ========================================================================= */
function RisksTab({
  vm,
  onOpenUser,
}: {
  vm: AccessManagementViewModel;
  onOpenUser: (u: AccessManagementUser) => void;
}) {
  const allFlags = vm.users.flatMap(u => u.flags.map(f => ({ ...f, user: u })));
  const grouped = FLAG_SEVERITIES.map((sev) => ({
    sev,
    items: allFlags.filter(f => f.severity === sev)
  }));
  const activeFindings = vm.findings.filter(f => f.status === "ACTIVE");

  return (
    <div className="space-y-6">
      {grouped.map(g => g.items.length > 0 && (
        <Card key={g.sev} className="p-6">
          <SectionTitle
            subtitle={`${g.items.length} finding${g.items.length !== 1 ? "s" : ""}`}
            right={<SeverityChip severity={g.sev as RiskLevel} size="md" />}>
            {SEV_LABEL[g.sev as RiskLevel]} severity
          </SectionTitle>
          <div className="space-y-3">
            {g.items.map((f, i) => (
              <button key={i} onClick={() => onOpenUser(f.user)}
                className={`w-full text-left p-4 rounded-lg border ${SEV_STYLES[g.sev as FlagSeverity].border} bg-white hover:shadow-sm transition-shadow`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${SEV_STYLES[g.sev as FlagSeverity].bg} ${SEV_STYLES[g.sev as FlagSeverity].text}`}>{f.code}</span>
                      <span className="text-xs text-slate-500">{f.rule}</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">{f.title}</div>
                    <div className="text-sm text-slate-600 mt-1">{f.detail}</div>
                    <div className="text-xs text-slate-500 font-mono mt-2 truncate">{f.evidence}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Principal</div>
                      <div className="text-sm font-semibold text-slate-900">{f.user.displayName}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      ))}

      {activeFindings.length > 0 && (
        <Card className="p-6">
          <SectionTitle subtitle="External exposure detected by AWS Access Analyzer">
            Access Analyzer findings
          </SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeFindings.map(f => {
              const linked = vm.users.find(u => u.username === f.linkedUser);
              return (
                <div key={f.id} className="p-4 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    {f.isPublic
                      ? <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-100 text-red-700">Public</span>
                      : <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">External</span>}
                    <span className="text-xs font-mono text-slate-500">{f.id}</span>
                  </div>
                  <div className="text-sm font-mono text-slate-900 break-all mb-1">{f.analyzedResource}</div>
                  <div className="text-xs text-slate-600 mb-3">{f.description}</div>
                  {linked && (
                    <button onClick={() => onOpenUser(linked)} className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
                      Linked to {linked.displayName} <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ============================================================================
 * 11. ACTIVITY TAB
 * ========================================================================= */
function ActivityTab({
  vm,
  onOpenUser,
}: {
  vm: AccessManagementViewModel;
  onOpenUser: (u: AccessManagementUser) => void;
}) {
  const SENSITIVE = new Set(["CreateAccessKey", "AttachUserPolicy", "PutUserPolicy", "CreateUser", "DeleteUser", "PutBucketPolicy", "CreateRole"]);
  const events = [...vm.events].sort(
    (a, b) =>
      new Date(b.EventTime).getTime() - new Date(a.EventTime).getTime(),
  );

  return (
    <Card className="p-6">
      <SectionTitle subtitle="CloudTrail events from the last 7 days · sensitive actions highlighted">
        Recent activity
      </SectionTitle>
      <div className="relative">
        <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-200"></div>
        <ul className="space-y-3">
          {events.map((e, i) => {
            const sensitive = SENSITIVE.has(e.EventName);
            const user = vm.users.find(u => u.username === e.Username);
            return (
              <li key={e.EventId} className="relative pl-10">
                <div className={`absolute left-3 top-3 w-3 h-3 rounded-full border-2 border-white ring-2 ${sensitive ? "bg-orange-500 ring-orange-200" : "bg-slate-300 ring-slate-200"}`}></div>
                <button
                  onClick={() => user && onOpenUser(user)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    sensitive
                      ? "border-orange-200 bg-orange-50 hover:bg-orange-100"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-mono text-sm font-semibold ${sensitive ? "text-orange-800" : "text-slate-800"}`}>{e.EventName}</span>
                        {sensitive && <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-200 text-orange-900">Sensitive</span>}
                        <span className="text-xs text-slate-500">by</span>
                        <span className="text-xs font-semibold text-slate-700">{user?.displayName || e.Username}</span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-1 truncate">
                        {e.EventSource} · {cloudTrailLocation(e)}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 tabular-nums shrink-0">{fmtDate(e.EventTime)}</div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
}

/* ============================================================================
 * 12. USER DRAWER
 * ========================================================================= */
function UserDrawer({
  user,
  raw,
  onClose,
}: {
  user: AccessManagementUser;
  raw: CollectorPayload;
  onClose: () => void;
}) {
  const rawInv = raw.iam_inventory_collector.UserDetailList.find(
    (x) => x.UserName === user.username,
  );
  const rawCred = raw.credential_report_collector.Content_Parsed.find(
    (x) => x.user === user.username,
  );
  const rawMfa = (raw.mfa_device_collector.MFADevicesByUser as MfaDevicesByUser)[
    user.username
  ];

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-30" onClick={onClose}></div>
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-40 overflow-y-auto">
        {/* Drawer header */}
        <div className="sticky top-0 z-10 border-b border-indigo-100/90 bg-white/95 shadow-sm shadow-indigo-950/5 backdrop-blur-md">
          <div className="px-6 py-4 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-700 shrink-0">
                {user.displayName.split(" ").map(w => w[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{user.displayName}</h2>
                  <SeverityChip severity={user.risk as RiskLevel} />
                </div>
                <div className="text-sm text-slate-500 font-mono truncate">{user.username}</div>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 shrink-0">
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Identity */}
          <DrawerSection icon={<UserCog className="w-4 h-4" />} title="Identity">
            <dl>
              <KV k="Username" v={user.username} mono />
              <KV k="Display name" v={user.displayName} />
              <KV k="Role" v={humanizeRole(user.role)} />
              <KV k="Department" v={user.department} />
              <KV k="HR status" v={<span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold uppercase ${user.hrStatus === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{user.hrStatus}</span>} />
              <KV k="Owner" v={user.owner} mono />
              <KV k="ARN" v={user.arn} mono />
              <KV k="Created" v={fmtDate(user.createDate)} mono />
            </dl>
          </DrawerSection>

          {/* Findings */}
          {user.flags.length > 0 && (
            <DrawerSection icon={<ShieldAlert className="w-4 h-4" />} title={`Findings (${user.flags.length})`}>
              <div className="space-y-2">
                {user.flags.map((f, i) => {
                  const s = SEV_STYLES[f.severity];
                  return (
                    <div key={i} className={`p-3 rounded-lg border ${s.border} ${s.bg}`}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <SeverityChip severity={f.severity} />
                          <span className="text-xs font-mono font-semibold text-slate-500">{f.code}</span>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">{f.title}</div>
                      <div className="text-sm text-slate-600 mt-1">{f.detail}</div>
                      <div className="text-xs text-slate-500 mt-2 italic">{f.rule}</div>
                      <div className="text-xs text-slate-500 font-mono mt-1">Evidence: {f.evidence}</div>
                    </div>
                  );
                })}
              </div>
            </DrawerSection>
          )}

          {/* Access profile */}
          <DrawerSection icon={<Key className="w-4 h-4" />} title="Access profile">
            <div className="space-y-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1.5">Groups</div>
                <div className="flex flex-wrap gap-1.5">
                  {user.groups.length > 0
                    ? user.groups.map(g => <span key={g} className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">{g}</span>)
                    : <span className="text-xs text-slate-400">None</span>}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1.5">Attached managed policies</div>
                <div className="flex flex-wrap gap-1.5">
                  {user.attachedPolicies.length > 0
                    ? user.attachedPolicies.map(p => {
                        const priv = PRIVILEGED_POLICIES.has(p.PolicyName);
                        return <span key={p.PolicyArn} className={`text-xs font-mono px-2 py-0.5 rounded border ${priv ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-slate-100 border-slate-200 text-slate-700"}`}>{p.PolicyName}</span>;
                      })
                    : <span className="text-xs text-slate-400">None</span>}
                </div>
              </div>
              {user.inlinePolicies.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1.5">Inline policies</div>
                  <div className="space-y-2">
                    {user.inlinePolicies.map(p => (
                      <details key={p.PolicyName} className="rounded-lg border border-slate-200 bg-slate-50">
                        <summary className="px-3 py-2 cursor-pointer text-xs font-mono text-slate-700 font-semibold">{p.PolicyName}</summary>
                        <pre className="px-3 pb-3 text-xs leading-relaxed text-slate-700 overflow-x-auto font-mono">{JSON.stringify(p.PolicyDocument, null, 2)}</pre>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DrawerSection>

          {/* Credentials */}
          <DrawerSection icon={<KeyRound className="w-4 h-4" />} title="Credentials">
            <dl>
              <KV k="Password enabled" v={user.passwordEnabled ? "Yes" : "No"} />
              <KV k="Password last changed" v={fmtDate(user.passwordLastChanged)} mono />
              <KV k="Last activity" v={fmtDate(user.lastActivity)} mono />
              <KV k="Inactive days" v={`${user.inactiveDays} days`} />
              <KV k="MFA enabled" v={user.mfaEnabled
                ? <span className="inline-flex items-center gap-1 text-emerald-700"><CheckCircle2 className="w-3.5 h-3.5" /> Yes</span>
                : <span className="inline-flex items-center gap-1 text-red-700 font-semibold"><XCircle className="w-3.5 h-3.5" /> No</span>} />
              {user.mfaDevices.length > 0 && (
                <KV k="MFA device" v={<span className="font-mono text-xs">{user.mfaDevices[0].SerialNumber.split("/").pop()}</span>} />
              )}
            </dl>
            {user.accessKeys.length > 0 && (
              <div className="mt-3">
                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1.5">Access keys</div>
                <div className="space-y-1.5">
                  {user.accessKeys.map(k => (
                    <div key={k.slot} className="flex items-center justify-between text-xs p-2 rounded border border-slate-200 bg-white">
                      <span className="font-mono text-slate-700">Slot {k.slot}</span>
                      <span className="text-slate-500">rotated {k.ageDays}d ago · last used {fmtDateShort(k.lastUsed)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DrawerSection>

          {/* Recent activity */}
          {user.events.length > 0 && (
            <DrawerSection icon={<Activity className="w-4 h-4" />} title={`Recent CloudTrail events (${user.events.length})`}>
              <ul className="space-y-2">
                {user.events.slice(0, 8).map(e => {
                  const sensitive = ["CreateAccessKey", "AttachUserPolicy", "PutUserPolicy", "CreateUser", "DeleteUser", "PutBucketPolicy", "CreateRole"].includes(e.EventName);
                  return (
                    <li key={e.EventId} className={`p-2.5 rounded-lg border text-xs ${sensitive ? "border-orange-200 bg-orange-50" : "border-slate-200 bg-white"}`}>
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className={`font-mono font-semibold ${sensitive ? "text-orange-800" : "text-slate-800"}`}>{e.EventName}</span>
                        <span className="text-slate-500 tabular-nums">{fmtDate(e.EventTime)}</span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono truncate">
                        {e.EventSource} · {cloudTrailLocation(e)}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </DrawerSection>
          )}

          {/* Linked findings */}
          {user.findings.length > 0 && (
            <DrawerSection icon={<ShieldQuestion className="w-4 h-4" />} title="Linked Access Analyzer findings">
              <div className="space-y-2">
                {user.findings.map(f => (
                  <div key={f.id} className="p-3 rounded-lg border border-orange-200 bg-orange-50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${f.isPublic ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                        {f.isPublic ? "Public" : "External"}
                      </span>
                      <span className="text-xs font-mono text-slate-500">{f.id}</span>
                    </div>
                    <div className="text-xs font-mono text-slate-900 break-all">{f.analyzedResource}</div>
                    <div className="text-xs text-slate-600 mt-1">{f._finding_description}</div>
                  </div>
                ))}
              </div>
            </DrawerSection>
          )}

          {/* Raw payload */}
          <DrawerSection icon={<ScrollText className="w-4 h-4" />} title="Raw collector payload">
            <div className="space-y-2">
              <details className="rounded-lg border border-slate-200 bg-slate-50">
                <summary className="px-3 py-2 cursor-pointer text-xs font-mono text-slate-700 font-semibold">iam_inventory_collector → UserDetailList entry</summary>
                <pre className="px-3 pb-3 text-xs leading-relaxed text-slate-700 overflow-x-auto font-mono">{JSON.stringify(rawInv, null, 2)}</pre>
              </details>
              {rawCred && (
                <details className="rounded-lg border border-slate-200 bg-slate-50">
                  <summary className="px-3 py-2 cursor-pointer text-xs font-mono text-slate-700 font-semibold">credential_report_collector → row</summary>
                  <pre className="px-3 pb-3 text-xs leading-relaxed text-slate-700 overflow-x-auto font-mono">{JSON.stringify(rawCred, null, 2)}</pre>
                </details>
              )}
              {rawMfa && (
                <details className="rounded-lg border border-slate-200 bg-slate-50">
                  <summary className="px-3 py-2 cursor-pointer text-xs font-mono text-slate-700 font-semibold">mfa_device_collector → MFADevicesByUser entry</summary>
                  <pre className="px-3 pb-3 text-xs leading-relaxed text-slate-700 overflow-x-auto font-mono">{JSON.stringify(rawMfa, null, 2)}</pre>
                </details>
              )}
            </div>
          </DrawerSection>
        </div>
      </div>
    </>
  );
}

function DrawerSection({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
        <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-600">{icon}</div>
        <h3 className="text-sm font-bold tracking-tight text-slate-900">{title}</h3>
      </div>
      {children}
    </section>
  );
}
