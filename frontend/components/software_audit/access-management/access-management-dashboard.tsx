"use client";

/**
 * =============================================================================
 *  ACCESS MANAGEMENT & IDENTITY GOVERNANCE — Audit Dashboard (Demo)
 * =============================================================================
 *  Stack: React + Tailwind CSS + lucide-react
 *
 *  Data is loaded from lib/software_audit/access-management/collector-data.json
 *  (boto3-style collector payloads).
 * =============================================================================
 */

import { useMemo, useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Key,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Search,
  Download,
  FileText,
  Activity,
  Fingerprint,
  UserCog,
  X,
  ArrowUpRight,
  Calendar,
  Server,
  KeyRound,
  ScrollText,
  ShieldQuestion,
} from "lucide-react";
import collectorData from "@/lib/software_audit/access-management/collector-data.json";
import {
  Card,
  SectionTitle,
  KV,
  DrawerSection,
  SeverityChip,
  SummaryCard,
  SEV_LABEL,
  SEV_STYLES,
  type RiskLevel,
} from "@/components/software_audit/shared";

export type CollectorPayload = typeof collectorData;

type CloudTrailEventRow =
  CollectorPayload["cloudtrail_activity_collector"]["Events"][number];

function cloudTrailLocation(e: CloudTrailEventRow): string {
  const ext = e as CloudTrailEventRow & {
    AwsRegion?: string;
    SourceIPAddress?: string;
  };
  const direct = [ext.AwsRegion, ext.SourceIPAddress]
    .filter(Boolean)
    .join(" · ");
  if (direct) return direct;
  try {
    const inner = JSON.parse(e.CloudTrailEvent || "{}") as {
      awsRegion?: string;
      sourceIPAddress?: string;
    };
    const s = [inner.awsRegion, inner.sourceIPAddress]
      .filter(Boolean)
      .join(" · ");
    return s || "—";
  } catch {
    return "—";
  }
}

/* ============================================================================
 * 1. AUDIT CONSTANTS
 * ========================================================================= */
const PRIVILEGED_POLICIES = new Set([
  "AdministratorAccess",
  "PowerUserAccess",
  "IAMFullAccess",
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

const sevRank: Record<FlagSeverity, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

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
  u
    .replace(/[._]external$/, "")
    .split(/[._]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");

const fmtDate = (iso: string | undefined | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return (
    d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }) + " UTC"
  );
};
const fmtDateShort = (iso: string | undefined | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

/* ============================================================================
 * 2. TRANSFORMATION: raw collectors -> view model
 * ========================================================================= */
type CredParsed =
  CollectorPayload["credential_report_collector"]["Content_Parsed"][number];

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
      (f) => f._linked_principal_username === u.UserName,
    );

    const policyNames = u.AttachedManagedPolicies.map((p) => p.PolicyName);
    const isPrivileged = policyNames.some((p) => PRIVILEGED_POLICIES.has(p));
    const isAdmin =
      policyNames.includes("AdministratorAccess") ||
      u.GroupList.includes("Admins");
    const mfaEnabled = mfaDevices.length > 0 && cred.mfa_active !== false;

    const lastActivity =
      cred.password_last_used || cred.access_key_1_last_used_date || null;
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
    if (cred.access_key_1_active)
      accessKeys.push({
        slot: 1,
        lastRotated: cred.access_key_1_last_rotated,
        lastUsed: cred.access_key_1_last_used_date,
        ageDays: daysSince(cred.access_key_1_last_rotated, now),
      });
    if (cred.access_key_2_active)
      accessKeys.push({
        slot: 2,
        lastRotated: cred.access_key_2_last_rotated,
        lastUsed: cred.access_key_2_last_used_date,
        ageDays: daysSince(cred.access_key_2_last_rotated, now),
      });

    const flags = evaluateFlags({
      role,
      isAdmin,
      isPrivileged,
      mfaEnabled,
      inactiveDays,
      policyNames,
      userFindings,
      userEvents,
      accessKeys,
    });

    return {
      username: u.UserName,
      displayName: prettyName(u.UserName),
      arn: u.Arn,
      userId: u.UserId,
      role,
      department,
      hrStatus,
      owner,
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
      risk: (flags.length
        ? highestSeverity(flags)
        : "clean") satisfies RiskLevel,
      events: userEvents,
      findings: userFindings,
      policyNames,
      cred,
    };
  });

  const allFindings = findings.map((f) => ({
    ...f,
    linkedUser: f._linked_principal_username || null,
    description: f._finding_description,
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
    role,
    isPrivileged,
    mfaEnabled,
    inactiveDays,
    policyNames,
    userFindings,
    userEvents,
    accessKeys,
  } = ctx;
  const flags: AuditFlag[] = [];

  if (isPrivileged && !mfaEnabled) {
    flags.push({
      severity: "critical",
      code: "MFA_MISSING_PRIVILEGED",
      title: "Privileged user without MFA",
      detail: `Privileged policies attached (${policyNames
        .filter((p) => PRIVILEGED_POLICIES.has(p))
        .join(", ")}) but no active MFA device.`,
      evidence:
        "Credential Report: mfa_active=false · MFA Device Collector: empty array",
      rule: "R1 — Privileged account MFA enforcement",
    });
  } else if (!mfaEnabled) {
    flags.push({
      severity: "high",
      code: "MFA_MISSING",
      title: "MFA not enabled",
      detail: "Console access is enabled but no MFA device registered.",
      evidence: "MFA Device Collector: empty array",
      rule: "R1b — MFA for console-enabled users",
    });
  }

  if (isPrivileged && inactiveDays > DORMANT_PRIV_DAYS) {
    flags.push({
      severity: "high",
      code: "DORMANT_PRIVILEGED",
      title: "Dormant privileged account",
      detail: `Privileged user inactive for ${inactiveDays} days (threshold ${DORMANT_PRIV_DAYS}).`,
      evidence:
        "Credential Report: password_last_used & access_key_last_used_date",
      rule: "R2 — Dormant privileged accounts (>30 days)",
    });
  } else if (!isPrivileged && inactiveDays > DORMANT_NORMAL_DAYS) {
    flags.push({
      severity: "medium",
      code: "DORMANT",
      title: "Dormant account",
      detail: `Account inactive for ${inactiveDays} days (threshold ${DORMANT_NORMAL_DAYS}).`,
      evidence: "Credential Report: password_last_used",
      rule: "R2b — Dormant standard accounts (>60 days)",
    });
  }

  if (role === "JuniorEngineer" && policyNames.includes("AdministratorAccess")) {
    flags.push({
      severity: "high",
      code: "EXCESSIVE_JUNIOR",
      title: "Excessive access for role",
      detail:
        "Junior Engineer carries AdministratorAccess. Expected baseline: read-only or scoped sandbox.",
      evidence:
        "IAM Inventory: AttachedManagedPolicies includes AdministratorAccess",
      rule: "R3 — Least privilege by role",
    });
  }

  if (
    role === "InfrastructureEngineer" &&
    policyNames.includes("IAMFullAccess")
  ) {
    flags.push({
      severity: "high",
      code: "SOD_INFRA_IAM",
      title: "Separation of Duties violation",
      detail:
        "Infrastructure Engineer holds IAMFullAccess. Infra role should not control identity — enables unilateral privilege escalation.",
      evidence: "IAM Inventory: AttachedManagedPolicies includes IAMFullAccess",
      rule: "R4 — SoD: infra vs identity",
    });
  }

  userFindings.forEach((f) => {
    if (f.status === "ACTIVE") {
      flags.push({
        severity: "high",
        code: "ANALYZER_EXPOSURE",
        title: "Resource exposed via user policy",
        detail: `Access Analyzer flagged ${f.analyzedResource} as ${f.isPublic ? "PUBLIC" : "externally accessible"}.`,
        evidence: `Access Analyzer finding ${f.id}`,
        rule: "R5 — External exposure via principal",
      });
    }
  });

  const sensitiveNames = [
    "CreateAccessKey",
    "AttachUserPolicy",
    "PutUserPolicy",
    "CreateUser",
    "DeleteUser",
    "PutBucketPolicy",
    "CreateRole",
  ];
  const sensitive = userEvents.filter((e) =>
    sensitiveNames.includes(e.EventName),
  );
  if (sensitive.length) {
    flags.push({
      severity: sensitive.length > 2 ? "high" : "medium",
      code: "SENSITIVE_ACTIVITY",
      title: "Sensitive actions observed",
      detail: `${sensitive.length} sensitive action(s) in last 7 days: ${[
        ...new Set(sensitive.map((s) => s.EventName)),
      ].join(", ")}.`,
      evidence: `CloudTrail: ${sensitive.map((s) => s.EventId).join(", ")}`,
      rule: "R6 — Sensitive activity review",
    });
  }

  accessKeys.forEach((k) => {
    if (k.ageDays != null && k.ageDays > STALE_KEY_DAYS) {
      flags.push({
        severity: "medium",
        code: "STALE_KEY",
        title: "Stale access key",
        detail: `Access key slot ${k.slot} not rotated in ${k.ageDays} days (policy ${STALE_KEY_DAYS}).`,
        evidence: "Credential Report: access_key_last_rotated",
        rule: "R7 — Access key rotation",
      });
    }
  });

  return flags;
}

/* ============================================================================
 * 4. MAIN COMPONENT
 * ========================================================================= */
const TABS = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "User Access" },
  { id: "privileged", label: "Privileged" },
  { id: "risks", label: "Risks & Findings" },
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
    const privileged = vm.users.filter((u) => u.isPrivileged).length;
    const noMfa = vm.users.filter((u) => !u.mfaEnabled).length;
    const dormantPriv = vm.users.filter(
      (u) => u.isPrivileged && u.inactiveDays > DORMANT_PRIV_DAYS,
    ).length;
    const highRisk = vm.users.filter(
      (u) => u.risk === "critical" || u.risk === "high",
    ).length;
    const critical = vm.users.filter((u) => u.risk === "critical").length;
    const clean = vm.users.filter((u) => u.risk === "clean").length;
    const score = Math.round((clean / total) * 100);
    return {
      total,
      privileged,
      noMfa,
      dormantPriv,
      highRisk,
      critical,
      clean,
      score,
    };
  }, [vm]);

  const filtered = useMemo(() => {
    return vm.users.filter((u) => {
      if (riskFilter !== "all" && u.risk !== riskFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !u.username.toLowerCase().includes(q) &&
          !u.displayName.toLowerCase().includes(q) &&
          !u.role.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [vm.users, search, riskFilter]);

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-indigo-50/70 to-violet-100/80 text-slate-900 antialiased"
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
      }}
    >
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
              <span className="text-sm font-medium text-slate-600">
                Audit Console
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="hidden items-center gap-1.5 rounded-lg border border-indigo-200/80 bg-indigo-50/90 px-2.5 py-1 font-mono text-xs font-medium text-indigo-800 md:inline-flex">
              <Server className="h-3 w-3 text-indigo-500" /> aws ·{" "}
              {data._metadata.account_id}
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

      <main className="w-full max-w-none px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-8">
          <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-indigo-600/80">
            <span className="font-medium text-indigo-500">Engagement</span>
            <ChevronRight className="h-3 w-3 shrink-0 text-indigo-300" />
            <span>Identity & Access</span>
            <ChevronRight className="h-3 w-3 shrink-0 text-indigo-300" />
            <span className="font-semibold text-slate-800">
              Module A · Access Management
            </span>
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

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <SummaryCard
            icon={<Users />}
            label="Total users"
            value={totals.total}
            sub="IAM principals"
          />
          <SummaryCard
            icon={<Key />}
            label="Privileged"
            value={totals.privileged}
            sub={`${Math.round((totals.privileged / totals.total) * 100)}% of users`}
            accent="orange"
          />
          <SummaryCard
            icon={<Fingerprint />}
            label="MFA missing"
            value={totals.noMfa}
            sub="users without MFA"
            accent={totals.noMfa > 0 ? "red" : "clean"}
          />
          <SummaryCard
            icon={<Clock />}
            label="Dormant privileged"
            value={totals.dormantPriv}
            sub={`>${DORMANT_PRIV_DAYS} days inactive`}
            accent={totals.dormantPriv > 0 ? "orange" : "clean"}
          />
          <SummaryCard
            icon={<AlertTriangle />}
            label="High-risk users"
            value={totals.highRisk}
            sub={`${totals.critical} critical`}
            accent={totals.highRisk > 0 ? "red" : "clean"}
          />
          <SummaryCard
            icon={<CheckCircle2 />}
            label="Compliance"
            value={`${totals.score}%`}
            sub={`${totals.clean}/${totals.total} clean`}
            accent={
              totals.score >= 70
                ? "clean"
                : totals.score >= 40
                  ? "orange"
                  : "red"
            }
          />
        </div>

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

        <div className="pb-16">
          {tab === "overview" && (
            <OverviewTab
              vm={vm}
              totals={totals}
              raw={data}
              onOpenUser={setSelectedUser}
            />
          )}
          {tab === "users" && (
            <UsersTab
              filtered={filtered}
              total={vm.users.length}
              search={search}
              setSearch={setSearch}
              riskFilter={riskFilter}
              setRiskFilter={setRiskFilter}
              onOpenUser={setSelectedUser}
            />
          )}
          {tab === "privileged" && (
            <PrivilegedTab vm={vm} onOpenUser={setSelectedUser} />
          )}
          {tab === "risks" && (
            <RisksTab vm={vm} onOpenUser={setSelectedUser} />
          )}
        </div>
      </main>

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
 * 5. OVERVIEW TAB
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
    critical: vm.users.filter((u) => u.risk === "critical"),
    high: vm.users.filter((u) => u.risk === "high"),
    medium: vm.users.filter((u) => u.risk === "medium"),
    low: vm.users.filter((u) => u.risk === "low"),
    clean: vm.users.filter((u) => u.risk === "clean"),
  };
  const topRisk = [...vm.users]
    .filter((u) => u.flags.length > 0)
    .sort(
      (a, b) =>
        riskSortRank[b.risk as RiskLevel] - riskSortRank[a.risk as RiskLevel] ||
        b.flags.length - a.flags.length,
    )
    .slice(0, 6);

  const controls = [
    {
      name: "All privileged users have MFA",
      pass:
        vm.users.filter((u) => u.isPrivileged && !u.mfaEnabled).length === 0,
    },
    {
      name: "No dormant privileged accounts (>30d)",
      pass: totals.dormantPriv === 0,
    },
    {
      name: "No junior users with AdministratorAccess",
      pass: !vm.users.some(
        (u) =>
          u.role === "JuniorEngineer" &&
          u.policyNames.includes("AdministratorAccess"),
      ),
    },
    {
      name: "Separation of Duties (infra vs identity)",
      pass: !vm.users.some(
        (u) =>
          u.role === "InfrastructureEngineer" &&
          u.policyNames.includes("IAMFullAccess"),
      ),
    },
    {
      name: "No active Access Analyzer findings",
      pass: vm.findings.filter((f) => f.status === "ACTIVE").length === 0,
    },
    {
      name: "External users scoped & monitored",
      pass: vm.users
        .filter((u) => u.isExternal)
        .every((u) => !u.policyNames.includes("AdministratorAccess")),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="p-6 lg:col-span-2">
        <SectionTitle subtitle="Distribution of audited principals by highest-severity flag">
          Risk composition
        </SectionTitle>
        <div className="space-y-3">
          {RISK_LEVELS.map((sev) => {
            const count = byRisk[sev].length;
            const pct = totals.total ? (count / totals.total) * 100 : 0;
            const s = SEV_STYLES[sev];
            return (
              <div key={sev}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                    <span className="font-medium text-slate-700">
                      {SEV_LABEL[sev]}
                    </span>
                  </div>
                  <span className="tabular-nums text-slate-500">
                    {count}{" "}
                    <span className="text-slate-400">/ {totals.total}</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${s.solid}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-6">
        <SectionTitle subtitle="Key identity controls">
          Control checks
        </SectionTitle>
        <ul className="space-y-3">
          {controls.map((c, i) => (
            <li key={i} className="flex items-start gap-3">
              {c.pass ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              )}
              <span className="text-sm leading-snug text-slate-700">
                {c.name}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6 lg:col-span-2">
        <SectionTitle subtitle="Click a row to inspect the evidence trail">
          Highest-risk identities
        </SectionTitle>
        {topRisk.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            No elevated-risk users detected.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {topRisk.map((u) => (
              <button
                key={u.username}
                onClick={() => onOpenUser(u)}
                className="-mx-2 flex w-full items-center justify-between gap-4 rounded-xl px-2 py-3 text-left transition-colors hover:bg-indigo-50/60"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                    {u.displayName
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">
                      {u.displayName}
                    </div>
                    <div className="truncate font-mono text-xs text-slate-500">
                      {u.username} · {humanizeRole(u.role)}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <div className="hidden tabular-nums text-xs text-slate-500 sm:block">
                    {u.flags.length} finding{u.flags.length !== 1 ? "s" : ""}
                  </div>
                  <SeverityChip severity={u.risk as RiskLevel} />
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <SectionTitle subtitle="Collectors feeding this module">
          Evidence sources
        </SectionTitle>
        <div className="space-y-2.5">
          <EvidenceSourceCard
            name="IAM Inventory"
            api="iam:GetAccountAuthorizationDetails"
            count={`${raw.iam_inventory_collector.UserDetailList.length} users`}
          />
          <EvidenceSourceCard
            name="Credential Report"
            api="iam:GetCredentialReport"
            count={`${raw.credential_report_collector.Content_Parsed.length} rows`}
          />
          <EvidenceSourceCard
            name="MFA Devices"
            api="iam:ListMFADevices"
            count={`${Object.keys(raw.mfa_device_collector.MFADevicesByUser).length} users`}
          />
          <EvidenceSourceCard
            name="CloudTrail"
            api="cloudtrail:LookupEvents"
            count={`${raw.cloudtrail_activity_collector.Events.length} events · 7d`}
          />
          <EvidenceSourceCard
            name="Access Analyzer"
            api="accessanalyzer:ListFindings"
            count={`${raw.access_analyzer_collector.findings.length} findings`}
          />
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
        <div className="truncate font-mono text-xs text-slate-500">{api}</div>
      </div>
      <span className="shrink-0 text-xs font-medium tabular-nums text-slate-600">
        {count}
      </span>
    </div>
  );
}

function humanizeRole(r: string) {
  return r.replace(/([A-Z])/g, " $1").replace(/^ /, "").trim();
}

/* ============================================================================
 * 6. USERS TAB
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, role, or username…"
              className="w-full rounded-xl border border-indigo-200/80 bg-white/90 py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200/60"
            />
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-indigo-100 bg-white/80 p-1 shadow-sm">
            {riskOptions.map((r) => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                  riskFilter === r
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-800"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="ml-auto tabular-nums text-xs text-slate-500">
            {filtered.length} / {total} users
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-indigo-100 bg-gradient-to-r from-indigo-50/90 to-violet-50/70">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Access level
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                  MFA
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Last active
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Findings
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Risk
                </th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr
                  key={u.username}
                  onClick={() => onOpenUser(u)}
                  className="cursor-pointer transition-colors hover:bg-indigo-50/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                        {u.displayName
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-slate-900">
                          {u.displayName}
                        </div>
                        <div className="truncate font-mono text-xs text-slate-500">
                          {u.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-700">
                      {humanizeRole(u.role)}
                    </span>
                    {u.isExternal && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded border border-purple-200 bg-purple-50 px-1.5 py-0.5 text-xs font-medium uppercase tracking-wider text-purple-700">
                        External
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.isAdmin ? (
                      <span className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                        Administrator
                      </span>
                    ) : u.isPrivileged ? (
                      <span className="inline-flex items-center gap-1 rounded border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">
                        Privileged
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">Standard</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {u.mfaEnabled ? (
                      <CheckCircle2 className="inline-block h-4 w-4 text-emerald-600" />
                    ) : (
                      <XCircle className="inline-block h-4 w-4 text-red-600" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.lastActivity ? (
                      <div>
                        <div className="tabular-nums text-slate-700">
                          {fmtDateShort(u.lastActivity)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {u.inactiveDays}d ago
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">never</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {u.flags.length > 0 ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold tabular-nums text-slate-700">
                        {u.flags.length}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <SeverityChip severity={u.risk as RiskLevel} />
                  </td>
                  <td className="px-4 py-3">
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-sm text-slate-500">
              No users match the current filters.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ============================================================================
 * 7. PRIVILEGED TAB
 * ========================================================================= */
function PrivilegedTab({
  vm,
  onOpenUser,
}: {
  vm: AccessManagementViewModel;
  onOpenUser: (u: AccessManagementUser) => void;
}) {
  const privileged = vm.users.filter((u) => u.isPrivileged);
  const privNoMfa = privileged.filter((u) => !u.mfaEnabled);
  const privDormant = privileged.filter(
    (u) => u.inactiveDays > DORMANT_PRIV_DAYS,
  );
  const admins = vm.users.filter((u) => u.isAdmin);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <SectionTitle
          subtitle={`${privileged.length} principals holding elevated policies (AdministratorAccess, PowerUserAccess, or IAMFullAccess)`}
        >
          Privileged register
        </SectionTitle>
        <div className="-mx-6 divide-y divide-slate-100">
          {privileged.map((u) => (
            <button
              key={u.username}
              onClick={() => onOpenUser(u)}
              className="flex w-full items-center justify-between gap-4 px-6 py-3 text-left transition-colors hover:bg-slate-50"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                  {u.displayName
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">
                    {u.displayName}
                  </div>
                  <div className="truncate font-mono text-xs text-slate-500">
                    {humanizeRole(u.role)} ·{" "}
                    {u.policyNames
                      .filter((p) => PRIVILEGED_POLICIES.has(p))
                      .join(", ")}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {u.mfaEnabled ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5" /> MFA
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700">
                    <ShieldAlert className="h-3.5 w-3.5" /> No MFA
                  </span>
                )}
                <span className="tabular-nums text-xs text-slate-500">
                  {u.inactiveDays}d idle
                </span>
                <SeverityChip severity={u.risk as RiskLevel} />
              </div>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="p-6">
          <SectionTitle subtitle="Rule R1 · Critical if privileged">
            Privileged without MFA
          </SectionTitle>
          <QuickList
            users={privNoMfa}
            emptyMsg="All privileged users have MFA enabled."
            onOpenUser={onOpenUser}
          />
        </Card>
        <Card className="p-6">
          <SectionTitle subtitle={`Rule R2 · Inactive >${DORMANT_PRIV_DAYS} days`}>
            Dormant privileged
          </SectionTitle>
          <QuickList
            users={privDormant}
            emptyMsg="No dormant privileged users."
            onOpenUser={onOpenUser}
          />
        </Card>
      </div>

      <Card className="p-6">
        <SectionTitle subtitle="Full administrators">
          Administrator accounts
        </SectionTitle>
        <QuickList
          users={admins}
          emptyMsg="No accounts hold AdministratorAccess."
          onOpenUser={onOpenUser}
        />
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
      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        <span className="text-sm text-emerald-700">{emptyMsg}</span>
      </div>
    );
  }
  return (
    <ul className="space-y-1.5">
      {users.map((u) => (
        <li key={u.username}>
          <button
            onClick={() => onOpenUser(u)}
            className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2 text-left transition-colors hover:border-slate-200 hover:bg-slate-50"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-slate-900">
                {u.displayName}
              </div>
              <div className="truncate font-mono text-xs text-slate-500">
                {humanizeRole(u.role)}
              </div>
            </div>
            <SeverityChip severity={u.risk as RiskLevel} />
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ============================================================================
 * 8. RISKS TAB
 * ========================================================================= */
function RisksTab({
  vm,
  onOpenUser,
}: {
  vm: AccessManagementViewModel;
  onOpenUser: (u: AccessManagementUser) => void;
}) {
  const allFlags = vm.users.flatMap((u) =>
    u.flags.map((f) => ({ ...f, user: u })),
  );
  const grouped = FLAG_SEVERITIES.map((sev) => ({
    sev,
    items: allFlags.filter((f) => f.severity === sev),
  }));
  const activeFindings = vm.findings.filter((f) => f.status === "ACTIVE");

  return (
    <div className="space-y-6">
      {grouped.map(
        (g) =>
          g.items.length > 0 && (
            <Card key={g.sev} className="p-6">
              <SectionTitle
                subtitle={`${g.items.length} finding${g.items.length !== 1 ? "s" : ""}`}
                right={<SeverityChip severity={g.sev as RiskLevel} size="md" />}
              >
                {SEV_LABEL[g.sev as RiskLevel]} severity
              </SectionTitle>
              <div className="space-y-3">
                {g.items.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => onOpenUser(f.user)}
                    className={`w-full rounded-lg border p-4 text-left transition-shadow hover:shadow-sm ${SEV_STYLES[g.sev as FlagSeverity].border} bg-white`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="mb-1 flex items-center gap-2">
                          <span
                            className={`rounded px-1.5 py-0.5 font-mono text-xs font-semibold ${SEV_STYLES[g.sev as FlagSeverity].bg} ${SEV_STYLES[g.sev as FlagSeverity].text}`}
                          >
                            {f.code}
                          </span>
                          <span className="text-xs text-slate-500">
                            {f.rule}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-slate-900">
                          {f.title}
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          {f.detail}
                        </div>
                        <div className="mt-2 truncate font-mono text-xs text-slate-500">
                          {f.evidence}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs text-slate-500">
                            Principal
                          </div>
                          <div className="text-sm font-semibold text-slate-900">
                            {f.user.displayName}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          ),
      )}

      {activeFindings.length > 0 && (
        <Card className="p-6">
          <SectionTitle subtitle="External exposure detected by AWS Access Analyzer">
            Access Analyzer findings
          </SectionTitle>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {activeFindings.map((f) => {
              const linked = vm.users.find((u) => u.username === f.linkedUser);
              return (
                <div
                  key={f.id}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="mb-2 flex items-center gap-2">
                    {f.isPublic ? (
                      <span className="inline-flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-red-700">
                        Public
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-orange-100 px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-orange-700">
                        External
                      </span>
                    )}
                    <span className="font-mono text-xs text-slate-500">
                      {f.id}
                    </span>
                  </div>
                  <div className="mb-1 break-all font-mono text-sm text-slate-900">
                    {f.analyzedResource}
                  </div>
                  <div className="mb-3 text-xs text-slate-600">
                    {f.description}
                  </div>
                  {linked && (
                    <button
                      onClick={() => onOpenUser(linked)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      Linked to {linked.displayName}{" "}
                      <ArrowUpRight className="h-3 w-3" />
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
 * 9. USER DRAWER
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
  const rawMfa = (
    raw.mfa_device_collector.MFADevicesByUser as MfaDevicesByUser
  )[user.username];

  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed bottom-0 right-0 top-0 z-40 w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-indigo-100/90 bg-white/95 shadow-sm shadow-indigo-950/5 backdrop-blur-md">
          <div className="flex items-start justify-between gap-4 px-6 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                {user.displayName
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">
                    {user.displayName}
                  </h2>
                  <SeverityChip severity={user.risk as RiskLevel} />
                </div>
                <div className="truncate font-mono text-sm text-slate-500">
                  {user.username}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-slate-100"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <DrawerSection
            icon={<UserCog className="h-4 w-4" />}
            title="Identity"
          >
            <dl>
              <KV k="Username" v={user.username} mono />
              <KV k="Display name" v={user.displayName} />
              <KV k="Role" v={humanizeRole(user.role)} />
              <KV k="Department" v={user.department} />
              <KV
                k="HR status"
                v={
                  <span
                    className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-semibold uppercase ${user.hrStatus === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                  >
                    {user.hrStatus}
                  </span>
                }
              />
              <KV k="Owner" v={user.owner} mono />
              <KV k="ARN" v={user.arn} mono />
              <KV k="Created" v={fmtDate(user.createDate)} mono />
            </dl>
          </DrawerSection>

          {user.flags.length > 0 && (
            <DrawerSection
              icon={<ShieldAlert className="h-4 w-4" />}
              title={`Findings (${user.flags.length})`}
            >
              <div className="space-y-2">
                {user.flags.map((f, i) => {
                  const s = SEV_STYLES[f.severity];
                  return (
                    <div
                      key={i}
                      className={`rounded-lg border p-3 ${s.border} ${s.bg}`}
                    >
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <SeverityChip severity={f.severity} />
                          <span className="font-mono text-xs font-semibold text-slate-500">
                            {f.code}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {f.title}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        {f.detail}
                      </div>
                      <div className="mt-2 text-xs italic text-slate-500">
                        {f.rule}
                      </div>
                      <div className="mt-1 font-mono text-xs text-slate-500">
                        Evidence: {f.evidence}
                      </div>
                    </div>
                  );
                })}
              </div>
            </DrawerSection>
          )}

          <DrawerSection icon={<Key className="h-4 w-4" />} title="Access profile">
            <div className="space-y-3">
              <div>
                <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Groups
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {user.groups.length > 0 ? (
                    user.groups.map((g) => (
                      <span
                        key={g}
                        className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700"
                      >
                        {g}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">None</span>
                  )}
                </div>
              </div>
              <div>
                <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Attached managed policies
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {user.attachedPolicies.length > 0 ? (
                    user.attachedPolicies.map((p) => {
                      const priv = PRIVILEGED_POLICIES.has(p.PolicyName);
                      return (
                        <span
                          key={p.PolicyArn}
                          className={`rounded border px-2 py-0.5 font-mono text-xs ${priv ? "border-orange-200 bg-orange-50 text-orange-700" : "border-slate-200 bg-slate-100 text-slate-700"}`}
                        >
                          {p.PolicyName}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-slate-400">None</span>
                  )}
                </div>
              </div>
              {user.inlinePolicies.length > 0 && (
                <div>
                  <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Inline policies
                  </div>
                  <div className="space-y-2">
                    {user.inlinePolicies.map((p) => (
                      <details
                        key={p.PolicyName}
                        className="rounded-lg border border-slate-200 bg-slate-50"
                      >
                        <summary className="cursor-pointer px-3 py-2 font-mono text-xs font-semibold text-slate-700">
                          {p.PolicyName}
                        </summary>
                        <pre className="overflow-x-auto px-3 pb-3 font-mono text-xs leading-relaxed text-slate-700">
                          {JSON.stringify(p.PolicyDocument, null, 2)}
                        </pre>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DrawerSection>

          <DrawerSection icon={<KeyRound className="h-4 w-4" />} title="Credentials">
            <dl>
              <KV k="Password enabled" v={user.passwordEnabled ? "Yes" : "No"} />
              <KV
                k="Password last changed"
                v={fmtDate(user.passwordLastChanged)}
                mono
              />
              <KV k="Last activity" v={fmtDate(user.lastActivity)} mono />
              <KV k="Inactive days" v={`${user.inactiveDays} days`} />
              <KV
                k="MFA enabled"
                v={
                  user.mfaEnabled ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-semibold text-red-700">
                      <XCircle className="h-3.5 w-3.5" /> No
                    </span>
                  )
                }
              />
              {user.mfaDevices.length > 0 && (
                <KV
                  k="MFA device"
                  v={
                    <span className="font-mono text-xs">
                      {user.mfaDevices[0].SerialNumber.split("/").pop()}
                    </span>
                  }
                />
              )}
            </dl>
            {user.accessKeys.length > 0 && (
              <div className="mt-3">
                <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Access keys
                </div>
                <div className="space-y-1.5">
                  {user.accessKeys.map((k) => (
                    <div
                      key={k.slot}
                      className="flex items-center justify-between rounded border border-slate-200 bg-white p-2 text-xs"
                    >
                      <span className="font-mono text-slate-700">
                        Slot {k.slot}
                      </span>
                      <span className="text-slate-500">
                        rotated {k.ageDays}d ago · last used{" "}
                        {fmtDateShort(k.lastUsed)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DrawerSection>

          {user.events.length > 0 && (
            <DrawerSection
              icon={<Activity className="h-4 w-4" />}
              title={`Recent CloudTrail events (${user.events.length})`}
            >
              <ul className="space-y-2">
                {user.events.slice(0, 8).map((e) => {
                  const sensitive = [
                    "CreateAccessKey",
                    "AttachUserPolicy",
                    "PutUserPolicy",
                    "CreateUser",
                    "DeleteUser",
                    "PutBucketPolicy",
                    "CreateRole",
                  ].includes(e.EventName);
                  return (
                    <li
                      key={e.EventId}
                      className={`rounded-lg border p-2.5 text-xs ${sensitive ? "border-orange-200 bg-orange-50" : "border-slate-200 bg-white"}`}
                    >
                      <div className="mb-0.5 flex items-center justify-between gap-2">
                        <span
                          className={`font-mono font-semibold ${sensitive ? "text-orange-800" : "text-slate-800"}`}
                        >
                          {e.EventName}
                        </span>
                        <span className="tabular-nums text-slate-500">
                          {fmtDate(e.EventTime)}
                        </span>
                      </div>
                      <div className="truncate font-mono text-xs text-slate-500">
                        {e.EventSource} · {cloudTrailLocation(e)}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </DrawerSection>
          )}

          {user.findings.length > 0 && (
            <DrawerSection
              icon={<ShieldQuestion className="h-4 w-4" />}
              title="Linked Access Analyzer findings"
            >
              <div className="space-y-2">
                {user.findings.map((f) => (
                  <div
                    key={f.id}
                    className="rounded-lg border border-orange-200 bg-orange-50 p-3"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${f.isPublic ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}
                      >
                        {f.isPublic ? "Public" : "External"}
                      </span>
                      <span className="font-mono text-xs text-slate-500">
                        {f.id}
                      </span>
                    </div>
                    <div className="break-all font-mono text-xs text-slate-900">
                      {f.analyzedResource}
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      {f._finding_description}
                    </div>
                  </div>
                ))}
              </div>
            </DrawerSection>
          )}

          <DrawerSection
            icon={<ScrollText className="h-4 w-4" />}
            title="Raw collector payload"
          >
            <div className="space-y-2">
              <details className="rounded-lg border border-slate-200 bg-slate-50">
                <summary className="cursor-pointer px-3 py-2 font-mono text-xs font-semibold text-slate-700">
                  iam_inventory_collector → UserDetailList entry
                </summary>
                <pre className="overflow-x-auto px-3 pb-3 font-mono text-xs leading-relaxed text-slate-700">
                  {JSON.stringify(rawInv, null, 2)}
                </pre>
              </details>
              {rawCred && (
                <details className="rounded-lg border border-slate-200 bg-slate-50">
                  <summary className="cursor-pointer px-3 py-2 font-mono text-xs font-semibold text-slate-700">
                    credential_report_collector → row
                  </summary>
                  <pre className="overflow-x-auto px-3 pb-3 font-mono text-xs leading-relaxed text-slate-700">
                    {JSON.stringify(rawCred, null, 2)}
                  </pre>
                </details>
              )}
              {rawMfa && (
                <details className="rounded-lg border border-slate-200 bg-slate-50">
                  <summary className="cursor-pointer px-3 py-2 font-mono text-xs font-semibold text-slate-700">
                    mfa_device_collector → MFADevicesByUser entry
                  </summary>
                  <pre className="overflow-x-auto px-3 pb-3 font-mono text-xs leading-relaxed text-slate-700">
                    {JSON.stringify(rawMfa, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </DrawerSection>
        </div>
      </div>
    </>
  );
}
