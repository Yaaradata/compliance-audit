"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type CSSProperties,
} from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import {
  Archive,
  BadgeCheck,
  Binary,
  Boxes,
  Bug,
  CloudCog,
  Compass,
  Database,
  Flame,
  FolderKanban,
  KeyRound,
  LockKeyhole,
  ShieldAlert,
  Shield,
  SquareStack,
  type LucideIcon,
} from "lucide-react";
import type { CloudCollectorRun, CloudEvidenceRow } from "@/lib/cloud-evidence-types";
import { useAuth } from "@/lib/auth-context";
import { getGcpCollectorApiMatrix } from "@/lib/gcp-api";
import {
  awsAccordionTriggerClass,
  awsButtonSecondarySmClass,
  awsFieldClass,
  awsPillTabButtonClass,
  awsPillTabListClass,
  awsRowExpandButtonClass,
} from "@/components/aws/aws-ui";

/** `next/dynamic` widens props to `{}` without assertion; react-plotly passes data/layout/config. */
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false }) as ComponentType<{
  data: Record<string, unknown>[];
  layout?: Record<string, unknown>;
  config?: Record<string, unknown>;
  style?: CSSProperties;
}>;

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Matches labels used for month-wise run counts (must match aggregation keys). */
function monthLabelFromDate(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

function statusColor(status: string | null | undefined): string {
  if (status === "success") return "#16a34a";
  if (status === "partial") return "#d97706";
  if (status === "failed") return "#dc2626";
  return "#64748b";
}

type CompareCell = {
  runId: string;
  runLabel: string;
  status: string;
  collectedAt: string | null;
  values: Record<string, string>;
};

type ControlComparison = {
  controlKey: string;
  label: string;
  rows: Array<{ feature: string; valuesByRun: Record<string, string>; diff: boolean; group: string }>;
};

type DomainComparison = {
  domain: string;
  controls: ControlComparison[];
};

const SOURCE_DISPLAY_OVERRIDES: Record<string, string> = {
  iam: "IAM and admin",
  iam_admin: "IAM and admin",
  iam_and_admin: "IAM and admin",
  marketplace: "Marketplace",
  apis: "APIs and services",
  apis_services: "APIs and services",
  apis_and_services: "APIs and services",
  vertex_ai: "Vertex AI",
  compute_engine: "Compute Engine",
  kubernetes_engine: "Kubernetes engine",
  cloud_storage: "Cloud Storage",
  security: "Security",
  bigquery: "BigQuery",
  monitoring: "Monitoring",
  cloud_run: "Cloud Run",
  vpc_network: "VPC network",
  databases: "Databases",
  cloud_sql: "Cloud SQL",
};

const SOURCE_ORDER = [
  "iam and admin",
  "marketplace",
  "apis and services",
  "vertex ai",
  "compute engine",
  "kubernetes engine",
  "cloud storage",
  "security",
  "bigquery",
  "monitoring",
  "cloud run",
  "vpc network",
  "databases",
  "cloud sql",
];

const SOURCE_API_MAP: Record<string, string[]> = {
  aws_iam: ["iam:ListUsers", "iam:ListRoles", "iam:GetUser", "iam:ListAttachedUserPolicies", "iam:ListAttachedRolePolicies"],
  aws_ec2: ["ec2:DescribeInstances", "ec2:DescribeSecurityGroups", "ec2:DescribeReservations"],
  aws_cloudtrail: ["cloudtrail:DescribeTrails", "cloudtrail:GetTrailStatus"],
  aws_config: ["config:DescribeConfigurationRecorders", "config:DescribeConfigurationRecorderStatus"],
  aws_ssm: ["ssm:DescribeInstancePatchStates", "ssm:DescribePatchBaselines", "ssm:DescribeMaintenanceWindowExecutions"],
  aws_vpc: ["ec2:DescribeVpcs", "ec2:DescribeSubnets", "ec2:DescribeRouteTables", "ec2:DescribeInternetGateways", "ec2:DescribeNatGateways", "ec2:DescribeFlowLogs"],
  aws_encryption: ["kms:ListKeys", "kms:DescribeKey", "kms:GetKeyRotationStatus", "acm:ListCertificates", "acm:DescribeCertificate"],
  aws_backup: ["backup:ListBackupPlans", "backup:GetBackupPlan", "backup:DescribeBackupVault", "rds:DescribeDBInstances", "ec2:DescribeSnapshots"],
  aws_guardduty: ["guardduty:ListDetectors", "guardduty:GetDetector", "guardduty:GetFindingsStatistics", "guardduty:GetMalwareProtectionPlan"],
  aws_inspector: ["inspector2:ListFindingAggregations", "inspector2:ListFindings"],
  aws_logging: ["cloudtrail:DescribeTrails", "cloudtrail:GetTrailStatus", "logs:DescribeLogGroups", "ec2:DescribeFlowLogs"],
  aws_access_credential: ["iam:GenerateCredentialReport", "iam:GetCredentialReport", "iam:ListAccessKeys", "iam:GetAccessKeyLastUsed", "secretsmanager:ListSecrets"],
  storage: ["storage.buckets.list", "storage.buckets.getIamPolicy"],
  cloud_storage: ["storage.buckets.list", "storage.buckets.getIamPolicy"],
  cloud_storage_posture: ["storage.buckets.list", "storage.buckets.getIamPolicy"],
  secretmanager: ["secretmanager.secrets.list"],
  secret_manager: ["secretmanager.secrets.list"],
  secret_manager_inventory: ["secretmanager.secrets.list"],
  securitycenter: ["securitycenter.findings.list"],
  security_center: ["securitycenter.findings.list"],
  scc_findings: ["securitycenter.findings.list"],
  network: [
    "compute.networks.list",
    "compute.subnetworks.aggregatedList",
    "compute.routes.list",
    "compute.routers.aggregatedList",
    "compute.vpnTunnels.aggregatedList",
  ],
  network_topology: [
    "compute.networks.list",
    "compute.subnetworks.aggregatedList",
    "compute.routes.list",
    "compute.routers.aggregatedList",
    "compute.vpnTunnels.aggregatedList",
  ],
  network_flow: ["compute.networks.list", "compute.subnetworks.aggregatedList"],
  network_flow_segmentation: ["compute.networks.list", "compute.subnetworks.aggregatedList"],
  interconnectivity: [
    "compute.networks.list",
    "compute.networks.listPeeringRoutes",
    "compute.interconnectAttachments.aggregatedList",
    "compute.serviceAttachments.aggregatedList",
  ],
  orgpolicy: ["orgpolicy.policies.list"],
  org_policy: ["orgpolicy.policies.list"],
  org_policy_project: ["orgpolicy.policies.list"],
  logging: ["logging.sinks.list", "logging.buckets.list", "logging.logEntries.list"],
  logging_posture: ["logging.sinks.list", "logging.buckets.list"],
  audit_activity: ["logging.logEntries.list"],
  audit_activity_sample: ["logging.logEntries.list"],
  service_accounts: ["iam.serviceAccounts.list", "iam.serviceAccounts.keys.list"],
  service_accounts_keys: ["iam.serviceAccounts.list", "iam.serviceAccounts.keys.list"],
  osconfig: ["osconfig.patchDeployments.list", "osconfig.patchJobs.list", "osconfig.vulnerabilityReports.list"],
  patch_deployments: ["osconfig.patchDeployments.list", "osconfig.patchJobs.list"],
  cloud_ids: ["ids.endpoints.list", "compute.regions.list"],
  kms: ["cloudkms.keyRings.list", "cloudkms.cryptoKeys.list"],
  kms_encryption: [
    "cloudkms.keyRings.list",
    "cloudkms.cryptoKeys.list",
    "compute.sslPolicies.list",
    "certificatemanager.certificates.list",
  ],
  backup: ["compute.snapshots.list", "compute.resourcePolicies.aggregatedList", "sqladmin.instances.list"],
  gcp_backup: ["compute.snapshots.list", "compute.resourcePolicies.aggregatedList", "sqladmin.instances.list"],
  binaryauthorization: ["binaryauthorization.policy.get"],
  binary_authorization: ["binaryauthorization.policy.get"],
  gcp_binaryauthorization: ["binaryauthorization.policy.get"],
  gcp_binary_authorization: ["binaryauthorization.policy.get"],
  cloudasset: ["cloudasset.assets.searchAllResources"],
  cloud_asset: ["cloudasset.assets.searchAllResources"],
  gcp_cloudasset: ["cloudasset.assets.searchAllResources"],
  gcp_cloud_asset: ["cloudasset.assets.searchAllResources"],
  compliance_scope: ["orgpolicy.policies.list", "logging.logEntries.list"],
  gcp_compliance_scope: ["orgpolicy.policies.list", "logging.logEntries.list"],
  compute: ["compute.instances.aggregatedList", "compute.forwardingRules.aggregatedList"],
  gcp_compute: ["compute.instances.aggregatedList", "compute.forwardingRules.aggregatedList"],
  firewall: ["compute.firewalls.list", "compute.networkFirewallPolicies.list", "compute.securityPolicies.list"],
  gcp_firewall: ["compute.firewalls.list", "compute.networkFirewallPolicies.list", "compute.securityPolicies.list"],
  iam: ["resourcemanager.projects.getIamPolicy", "iam.roles.list", "iam.serviceAccounts.list"],
  gcp_iam: ["resourcemanager.projects.getIamPolicy", "iam.roles.list", "iam.serviceAccounts.list"],
  ids: ["ids.endpoints.list", "compute.regions.list"],
  gcp_ids: ["ids.endpoints.list", "compute.regions.list"],
  inventory: ["cloudasset.assets.searchAllResources", "compute.instances.aggregatedList", "sqladmin.instances.list"],
  gcp_inventory: ["cloudasset.assets.searchAllResources", "compute.instances.aggregatedList", "sqladmin.instances.list"],
  iam: ["iam.googleapis.com/v1"],
  iam_admin: ["iam.googleapis.com/v1"],
  marketplace: ["cloudcommerceconsumerprocurement.googleapis.com/v1"],
  apis: ["serviceusage.googleapis.com/v1"],
  apis_services: ["serviceusage.googleapis.com/v1"],
  vertex_ai: ["aiplatform.googleapis.com/v1"],
  compute_engine: ["compute.googleapis.com/v1"],
  kubernetes_engine: ["container.googleapis.com/v1"],
  cloud_storage: ["storage.googleapis.com/storage/v1"],
  security: ["securitycenter.googleapis.com/v1"],
  bigquery: ["bigquery.googleapis.com/v2"],
  monitoring: ["monitoring.googleapis.com/v3"],
  cloud_run: ["run.googleapis.com/v2"],
  vpc_network: ["compute.googleapis.com/v1/networks"],
  databases: ["sqladmin.googleapis.com/v1", "redis.googleapis.com/v1"],
  cloud_sql: ["sqladmin.googleapis.com/v1"],
};

function normalizeSourceKey(source: string): string {
  return source.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function prettySourceLabel(source: string): string {
  const key = normalizeSourceKey(source);
  if (SOURCE_DISPLAY_OVERRIDES[key]) return SOURCE_DISPLAY_OVERRIDES[key];
  return source
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function sourceOrderRank(label: string): number {
  const idx = SOURCE_ORDER.indexOf(label.toLowerCase());
  return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
}

function getApisForSource(label: string): string[] {
  const key = normalizeSourceKey(label);
  const trimmed = key.replace(/^gcp_/, "");
  const providerTrimmed = trimmed.replace(/^aws_/, "");
  const squashed = providerTrimmed.replace(/_/g, "");
  return (
    SOURCE_API_MAP[key] ??
    SOURCE_API_MAP[trimmed] ??
    SOURCE_API_MAP[providerTrimmed] ??
    SOURCE_API_MAP[squashed] ??
    ["API mapping unavailable"]
  );
}

function getApisForSourceWithMatrix(
  label: string,
  matrix: Record<string, string[]> | null
): string[] {
  const key = normalizeSourceKey(label).replace(/^gcp_/, "").replace(/^aws_/, "");
  if (matrix) {
    const direct = matrix[key];
    if (direct?.length) return direct;
    const hit = Object.entries(matrix).find(([collector]) => {
      const c = collector.toLowerCase();
      return key.includes(c) || c.includes(key);
    });
    if (hit?.[1]?.length) return hit[1];
  }
  return getApisForSource(label);
}

function humanizeToken(v: string): string {
  return v
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function apiPurposeHint(method: string): string {
  const m = method.toLowerCase();
  if (m.includes("list")) return "Lists resources for inventory and coverage checks.";
  if (m.includes("get")) return "Reads detailed configuration for validation.";
  if (m.includes("search")) return "Performs broad discovery across project resources.";
  if (m.includes("policy")) return "Evaluates policy posture and control alignment.";
  if (m.includes("findings")) return "Pulls security findings and risk indicators.";
  return "Collects configuration and posture evidence.";
}

function buildApiBreakdown(methods: string[]): Array<{
  method: string;
  service: string;
  operation: string;
  purpose: string;
}> {
  return methods.map((method) => {
    const [serviceRaw, operationRaw] = method.split(".", 2);
    const service = serviceRaw ? humanizeToken(serviceRaw) : "Unknown Service";
    const operation = operationRaw ? humanizeToken(operationRaw) : "General Operation";
    return { method, service, operation, purpose: apiPurposeHint(method) };
  });
}

function sourceDisplayLabel(label: string): string {
  return label.replace(/^(gcp|aws)[\s_-]+/i, "").trim() || label;
}

const SOURCE_ICON_BY_KEY: Record<string, LucideIcon> = {
  backup: Archive,
  binaryauthorization: Binary,
  cloudasset: Boxes,
  compliance_scope: BadgeCheck,
  compute: CloudCog,
  firewall: Flame,
  iam: KeyRound,
  ids: ShieldAlert,
  inventory: Compass,
  databases: Database,
  cloud_sql: LockKeyhole,
  security: Shield,
  monitoring: Bug,
};

function sourceIcon(label: string): LucideIcon {
  const key = normalizeSourceKey(label).replace(/^gcp_/, "").replace(/^aws_/, "");
  return SOURCE_ICON_BY_KEY[key] ?? FolderKanban;
}

function formatRelativeAge(iso: string | null | undefined): string {
  if (!iso) return "No timestamp";
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "No timestamp";
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function sourceTone(index: number): { border: string; bg: string; glow: string; badgeBg: string } {
  const palette = [
    { border: "#38bdf8", bg: "rgba(56, 189, 248, 0.12)", glow: "rgba(56, 189, 248, 0.22)" },
    { border: "#34d399", bg: "rgba(52, 211, 153, 0.12)", glow: "rgba(52, 211, 153, 0.22)" },
    { border: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)", glow: "rgba(245, 158, 11, 0.2)" },
    { border: "#a78bfa", bg: "rgba(167, 139, 250, 0.13)", glow: "rgba(167, 139, 250, 0.22)" },
    { border: "#f472b6", bg: "rgba(244, 114, 182, 0.13)", glow: "rgba(244, 114, 182, 0.22)" },
  ];
  const p = palette[index % palette.length];
  return { ...p, badgeBg: `${p.border}22` };
}

function normalizeValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map((v) => normalizeValue(v)).join(", ");
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function flattenContent(content: unknown, prefix = "", out: Record<string, string> = {}, depth = 0): Record<string, string> {
  if (depth > 5) {
    out[prefix || "value"] = normalizeValue(content);
    return out;
  }

  if (content === null || content === undefined) {
    out[prefix || "value"] = "—";
    return out;
  }

  if (typeof content !== "object") {
    out[prefix || "value"] = normalizeValue(content);
    return out;
  }

  if (Array.isArray(content)) {
    if (content.length === 0) {
      out[prefix || "value"] = "[]";
      return out;
    }

    const allPrimitive = content.every((item) => item === null || item === undefined || typeof item !== "object");
    if (allPrimitive) {
      out[prefix || "value"] = content.map((item) => normalizeValue(item)).join(", ");
      return out;
    }

    content.forEach((item, idx) => {
      const nextPrefix = `${prefix || "value"}[${idx}]`;
      flattenContent(item, nextPrefix, out, depth + 1);
    });
    return out;
  }

  const obj = content as Record<string, unknown>;
  const entries = Object.entries(obj);
  if (!entries.length) {
    out[prefix || "value"] = "{}";
    return out;
  }

  for (const [k, v] of entries) {
    const nextKey = prefix ? `${prefix}.${k}` : k;
    flattenContent(v, nextKey, out, depth + 1);
  }
  return out;
}

function cleanFeatureLabel(feature: string): string {
  return feature.replace(/\[\d+\]/g, "").replace(/\.\./g, ".").replace(/\.$/, "");
}

/** Split flat dotted keys into top-level groups (e.g. internet_gateways.*) vs leaf rows (account_id). */
function partitionFeatureRows(
  rows: Array<{ feature: string; valuesByRun: Record<string, string>; diff: boolean; group: string }>
): {
  flat: typeof rows;
  groups: Array<{ parent: string; children: Array<{ row: (typeof rows)[number]; childLabel: string }> }>;
} {
  const flat: typeof rows = [];
  const groupMap = new Map<string, Array<{ row: (typeof rows)[number]; childLabel: string }>>();
  const sorted = [...rows].sort((a, b) =>
    cleanFeatureLabel(a.feature).localeCompare(cleanFeatureLabel(b.feature))
  );
  for (const row of sorted) {
    const cleaned = cleanFeatureLabel(row.feature);
    const dot = cleaned.indexOf(".");
    if (dot === -1) {
      flat.push(row);
    } else {
      const parent = cleaned.slice(0, dot);
      const childLabel = cleaned.slice(dot + 1);
      const list = groupMap.get(parent) ?? [];
      list.push({ row, childLabel });
      groupMap.set(parent, list);
    }
  }
  const groups = Array.from(groupMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([parent, children]) => ({ parent, children }));
  return { flat, groups };
}

function filterRowsByComparisorSearch(
  rows: ControlComparison["rows"],
  runIds: string[],
  keyword: string
): ControlComparison["rows"] {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return rows;
  return rows.filter((row) => {
    if (cleanFeatureLabel(row.feature).toLowerCase().includes(kw)) return true;
    if (runIds.some((id) => (row.valuesByRun[id] ?? "").toLowerCase().includes(kw))) return true;
    return false;
  });
}

/** Distinct pill colors for control buttons within an item-code row. */
const CONTROL_BUTTON_COLORS = [
  "#2563eb",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

function getControlIdFromKey(controlKey: string): string {
  return controlKey.split("::")[0] ?? "";
}

function getItemCodeFromKey(controlKey: string): string {
  return controlKey.split("::")[1] ?? "";
}

/** Group controls by item code (e.g. A1, A2); sort controls by control id. */
function groupControlsByItemCode(controls: ControlComparison[]): [string, ControlComparison[]][] {
  const map = new Map<string, ControlComparison[]>();
  for (const c of controls) {
    const itemCode = getItemCodeFromKey(c.controlKey);
    const list = map.get(itemCode) ?? [];
    list.push(c);
    map.set(itemCode, list);
  }
  for (const [, list] of map) {
    list.sort((a, b) =>
      getControlIdFromKey(a.controlKey).localeCompare(getControlIdFromKey(b.controlKey), undefined, {
        numeric: true,
      })
    );
  }
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

export function RunHistoryVisualsPlotly({
  runs,
  evidenceRows,
  focusComparisorControlKey = null,
  deferredCharts = false,
  fetchEvidenceContent,
}: {
  runs: CloudCollectorRun[];
  evidenceRows: CloudEvidenceRow[];
  /** When set, switch to Run Comparisor and select this control (`control_id::item_code`). */
  focusComparisorControlKey?: string | null;
  /** When true (e.g. Evidence tab visible), skip Plotly charts but still preload Run Comparisor in the background. */
  deferredCharts?: boolean;
  /** Provider-specific content fetch (AWS: getEvidenceContent; GCP: getGcpEvidenceContent). */
  fetchEvidenceContent: (
    evidenceId: string,
    cycleId: string | null | undefined
  ) => Promise<unknown>;
}) {
  const { activeCycleId } = useAuth();
  const pathname = usePathname();
  const isGcpPage = pathname?.includes("/gcp") ?? false;
  const loadEvidenceContent = useCallback(
    (evidenceId: string) => fetchEvidenceContent(evidenceId, activeCycleId),
    [fetchEvidenceContent, activeCycleId]
  );
  const [collectorApiMatrix, setCollectorApiMatrix] = useState<Record<string, string[]> | null>(null);
  const [sidebarPreference, setSidebarPreference] = useState<"metrics" | "collector">(() =>
    focusComparisorControlKey ? "collector" : "metrics"
  );
  /** Deep-link focus now maps to Collector Sources; otherwise follow tab clicks. */
  const activeSidebar = focusComparisorControlKey ? "collector" : sidebarPreference;
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [compareMeta, setCompareMeta] = useState<{ runs: CompareCell[] } | null>(null);
  const [domainComparisons, setDomainComparisons] = useState<DomainComparison[]>([]);
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set(["A", "B", "C"]));
  /** `${domain}::${itemCode}` → selected controlKey for Run Comparisor table. */
  const [itemControlSelection, setItemControlSelection] = useState<Map<string, string>>(new Map());
  const [hasPreloadedComparisor, setHasPreloadedComparisor] = useState(false);
  /** Collapsed = children hidden. Empty set = all parent groups expanded by default. */
  const [collapsedFeatureParents, setCollapsedFeatureParents] = useState<Set<string>>(new Set());
  /** `${domain}::${itemCode}` → Run Comparisor search text. */
  const [comparisorSearchByTable, setComparisorSearchByTable] = useState<Record<string, string>>({});
  const [sourceDetailsLoading, setSourceDetailsLoading] = useState<Record<string, boolean>>({});
  const [sourceDetailsError, setSourceDetailsError] = useState<Record<string, string | null>>({});
  const [sourceDetailsData, setSourceDetailsData] = useState<
    Record<string, { entries: Array<{ key: string; value: string }>; loadedAt: string }>
  >({});
  const [expandedSourceLabel, setExpandedSourceLabel] = useState<string | null>(null);
  const [sourceCompareLoading, setSourceCompareLoading] = useState<Record<string, boolean>>({});
  const [sourceCompareError, setSourceCompareError] = useState<Record<string, string | null>>({});
  const [sourceCompareData, setSourceCompareData] = useState<
    Record<
      string,
      {
        runColumns: Array<{ runId: string; runLabel: string; at: string | null; isCurrent: boolean }>;
        rows: Array<{ field: string; valuesByRun: Record<string, string>; changedInCurrent: boolean }>;
      }
    >
  >({});

  useEffect(() => {
    if (!isGcpPage) {
      setCollectorApiMatrix(null);
      return;
    }
    let cancelled = false;
    getGcpCollectorApiMatrix(activeCycleId)
      .then((payload) => {
        if (cancelled) return;
        const map: Record<string, string[]> = {};
        for (const row of payload?.by_collector ?? []) {
          const k = normalizeSourceKey(row.collector || "");
          if (!k) continue;
          map[k] = Array.isArray(row.gcp_api_methods) ? row.gcp_api_methods : [];
        }
        setCollectorApiMatrix(map);
      })
      .catch(() => {
        if (!cancelled) setCollectorApiMatrix(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isGcpPage, activeCycleId]);

  const toggleFeatureParent = (controlKey: string, parent: string) => {
    const key = `${controlKey}::${parent}`;
    setCollapsedFeatureParents((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isFeatureParentExpanded = (controlKey: string, parent: string) =>
    !collapsedFeatureParents.has(`${controlKey}::${parent}`);

  const timeline = useMemo(() => {
    if (!runs.length) return [];
    return [...runs]
      .slice()
      .reverse()
      .map((run, index) => ({
        index: index + 1,
        runId: run.run_id,
        time: run.ended_at ?? run.in_time ?? run.execution_time,
        evidence: run.evidence_count ?? 0,
        status: run.status ?? "unknown",
        trigger: (run.trigger_type ?? "unknown").toLowerCase(),
      }));
  }, [runs]);

  const successCount = timeline.filter((r) => r.status === "success").length;
  const partialCount = timeline.filter((r) => r.status === "partial").length;
  const failedCount = timeline.filter((r) => r.status === "failed").length;
  const otherCount = timeline.length - successCount - partialCount - failedCount;

  const monthlyRuns = new Map<string, number>();
  for (const row of timeline) {
    const d = row.time ? new Date(row.time) : null;
    if (!d || Number.isNaN(d.getTime())) continue;
    const key = monthLabelFromDate(d);
    monthlyRuns.set(key, (monthlyRuns.get(key) ?? 0) + 1);
  }

  const runDates = timeline
    .map((r) => r.time)
    .filter((t): t is string => Boolean(t))
    .map((t) => new Date(t))
    .filter((d) => !Number.isNaN(d.getTime()));
  const latestRunMs = runDates.length ? Math.max(...runDates.map((d) => d.getTime())) : Date.now();
  const nowMs = Date.now();
  const endMs = Math.max(latestRunMs, nowMs);
  /** Calendar year for Jan–Dec month-wise chart (latest activity or today). */
  const monthWiseYear = new Date(endMs).getFullYear();

  const monthWiseData: { month: string; count: number; hoverLabel: string }[] = [];
  for (let month = 0; month < 12; month++) {
    const d = new Date(monthWiseYear, month, 1);
    const monthKey = monthLabelFromDate(d);
    const shortMonth = d.toLocaleDateString(undefined, { month: "short" });
    monthWiseData.push({
      month: shortMonth,
      hoverLabel: monthKey,
      count: monthlyRuns.get(monthKey) ?? 0,
    });
  }

  const monthWiseMaxCount = Math.max(0, ...monthWiseData.map((d) => d.count));

  const totalEvidence = timeline.reduce((acc, row) => acc + row.evidence, 0);
  const avgEvidence = Math.round(totalEvidence / Math.max(1, timeline.length));
  /**
   * Canonical run labels are chronological (oldest => Run 1, latest => Run N),
   * independent of how lists are displayed.
   */
  const runLabelMap = useMemo(() => {
    const byTime = [...runs].sort((a, b) => {
      const ta = a.ended_at ?? a.execution_time ?? "";
      const tb = b.ended_at ?? b.execution_time ?? "";
      return ta.localeCompare(tb);
    });
    return new Map(byTime.map((r, i) => [r.run_id, `Run ${i + 1}`]));
  }, [runs]);
  const collectorSources = useMemo(() => {
    const byLabel = new Map<
      string,
      {
        label: string;
        count: number;
        lastCollectedAt: string | null;
        runIds: Set<string>;
        evidenceTypes: Set<string>;
        evidenceTypeCounts: Map<string, number>;
        evidenceIdsByTime: Array<{ id: string; at: string | null; runId: string | null }>;
      }
    >();
    for (const row of evidenceRows) {
      const raw = (row.source_system ?? "").trim();
      if (!raw) continue;
      const label = prettySourceLabel(raw);
      const prev = byLabel.get(label);
      const nextTime =
        row.collected_at && (!prev?.lastCollectedAt || row.collected_at > prev.lastCollectedAt)
          ? row.collected_at
          : prev?.lastCollectedAt ?? row.collected_at ?? null;
      byLabel.set(label, {
        label,
        count: (prev?.count ?? 0) + 1,
        lastCollectedAt: nextTime,
        runIds: new Set([...(prev?.runIds ?? []), ...(row.run_id ? [row.run_id] : [])]),
        evidenceTypes: new Set([
          ...(prev?.evidenceTypes ?? []),
          ...((row.evidence_type ?? "").trim() ? [row.evidence_type.trim()] : []),
        ]),
        evidenceTypeCounts: new Map([
          ...(prev?.evidenceTypeCounts ?? []),
          ...(() => {
            const t = (row.evidence_type ?? "").trim();
            if (!t) return [];
            const curr = prev?.evidenceTypeCounts?.get(t) ?? 0;
            return [[t, curr + 1] as const];
          })(),
        ]),
        evidenceIdsByTime: [
          ...(prev?.evidenceIdsByTime ?? []),
          { id: row.evidence_id, at: row.collected_at ?? null, runId: row.run_id ?? null },
        ],
      });
    }
    const totalRows = Math.max(1, evidenceRows.length);
    const totalRuns = Math.max(1, runs.length);
    return Array.from(byLabel.values())
      .sort((a, b) => {
      const ra = sourceOrderRank(a.label);
      const rb = sourceOrderRank(b.label);
      if (ra !== rb) return ra - rb;
      return a.label.localeCompare(b.label);
      })
      .map((item, idx) => ({
        ...item,
        coveragePct: Math.round((item.count / totalRows) * 100),
        runCoveragePct: Math.round((item.runIds.size / totalRuns) * 100),
        order: idx + 1,
        tone: sourceTone(idx),
        collectedTypeSummary: Array.from(item.evidenceTypeCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([type, c]) => ({ type, count: c })),
        evidenceIdsByTime: item.evidenceIdsByTime
          .filter((e) => Boolean(e.id))
          .sort((a, b) => (b.at ?? "").localeCompare(a.at ?? "")),
        runEvidenceByRun: (() => {
          const latest = new Map<string, { runId: string; evidenceId: string; at: string | null }>();
          for (const e of item.evidenceIdsByTime) {
            if (!e.runId) continue;
            const prev = latest.get(e.runId);
            if (!prev || (e.at ?? "") > (prev.at ?? "")) {
              latest.set(e.runId, { runId: e.runId, evidenceId: e.id, at: e.at ?? null });
            }
          }
          return Array.from(latest.values());
        })(),
      }));
  }, [evidenceRows, runs.length]);

  const loadSourceCollectedData = useCallback(
    async (label: string, evidenceIds: string[], force = false) => {
      if (!evidenceIds.length) return;
      if (!force && sourceDetailsData[label]) return;
      setSourceDetailsLoading((prev) => ({ ...prev, [label]: true }));
      setSourceDetailsError((prev) => ({ ...prev, [label]: null }));
      try {
        const sampleIds = evidenceIds.slice(0, 8);
        const payloads = await Promise.all(sampleIds.map((id) => loadEvidenceContent(id)));
        const valueBag = new Map<string, Set<string>>();
        for (const payload of payloads) {
          const flat = flattenContent(payload);
          for (const [key, value] of Object.entries(flat)) {
            const set = valueBag.get(key) ?? new Set<string>();
            set.add(value);
            valueBag.set(key, set);
          }
        }
        const entries = Array.from(valueBag.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([key, values]) => {
            const vals = Array.from(values);
            return {
              key,
              value: vals.length <= 2 ? vals.join(" | ") : `${vals.slice(0, 2).join(" | ")} (+${vals.length - 2} more)`,
            };
          });
        setSourceDetailsData((prev) => ({
          ...prev,
          [label]: { entries, loadedAt: new Date().toISOString() },
        }));
      } catch (e) {
        setSourceDetailsError((prev) => ({
          ...prev,
          [label]: e instanceof Error ? e.message : "Failed to load collected data.",
        }));
      } finally {
        setSourceDetailsLoading((prev) => ({ ...prev, [label]: false }));
      }
    },
    [loadEvidenceContent, sourceDetailsData]
  );

  const loadSourceRunComparison = useCallback(
    async (
      label: string,
      runEvidenceByRun: Array<{ runId: string; evidenceId: string; at: string | null }>
    ) => {
      if (!runEvidenceByRun.length || sourceCompareData[label]) return;
      setSourceCompareLoading((prev) => ({ ...prev, [label]: true }));
      setSourceCompareError((prev) => ({ ...prev, [label]: null }));
      try {
        const runMeta = [...runEvidenceByRun].sort((a, b) => {
          const ta = a.at ?? "";
          const tb = b.at ?? "";
          return tb.localeCompare(ta); // latest first
        });
        const latestRunId = runMeta[0]?.runId ?? null;
        const payloads = await Promise.all(
          runMeta.map(async (m) => ({
            runId: m.runId,
            at: m.at,
            content: flattenContent(await loadEvidenceContent(m.evidenceId)),
          }))
        );
        const runColumns = runMeta.map((m, idx) => ({
          runId: m.runId,
          runLabel: runLabelMap.get(m.runId) ?? `Run ${idx + 1}`,
          at: m.at,
          isCurrent: latestRunId ? m.runId === latestRunId : idx === 0,
        }));
        const fieldKeys = Array.from(new Set(payloads.flatMap((p) => Object.keys(p.content)))).sort();
        const currentRunId = runColumns[0]?.runId;
        const previousRunId = runColumns[1]?.runId;
        const rows = fieldKeys.map((field) => {
          const valuesByRun: Record<string, string> = {};
          for (const p of payloads) valuesByRun[p.runId] = p.content[field] ?? "—";
          const changedInCurrent =
            Boolean(currentRunId && previousRunId) &&
            (valuesByRun[currentRunId] ?? "—") !== (valuesByRun[previousRunId] ?? "—");
          return { field, valuesByRun, changedInCurrent };
        });
        setSourceCompareData((prev) => ({ ...prev, [label]: { runColumns, rows } }));
      } catch (e) {
        setSourceCompareError((prev) => ({
          ...prev,
          [label]: e instanceof Error ? e.message : "Failed to load run comparison.",
        }));
      } finally {
        setSourceCompareLoading((prev) => ({ ...prev, [label]: false }));
      }
    },
    [loadEvidenceContent, runLabelMap, sourceCompareData]
  );

  const toggleSourceDropdown = useCallback(
    (source: {
      label: string;
      runEvidenceByRun: Array<{ runId: string; evidenceId: string; at: string | null }>;
      evidenceIdsByTime: Array<{ id: string; at: string | null; runId: string | null }>;
    }) => {
      setExpandedSourceLabel((prev) => (prev === source.label ? null : source.label));
      void loadSourceRunComparison(source.label, source.runEvidenceByRun);
      void loadSourceCollectedData(source.label, source.evidenceIdsByTime.map((e) => e.id));
    },
    [loadSourceRunComparison, loadSourceCollectedData]
  );

  const controlOptions = useMemo(() => {
    const map = new Map<string, { controlId: string; itemCode: string }>();
    for (const row of evidenceRows) {
      const d = (row.item_code || "").trim().charAt(0).toUpperCase();
      if (!/[A-H]/.test(d)) continue;
      const key = `${row.control_id}::${row.item_code}`;
      if (!map.has(key)) map.set(key, { controlId: row.control_id, itemCode: row.item_code });
    }
    return Array.from(map.entries())
      .map(([key, v]) => ({ key, ...v }))
      .sort((a, b) => a.itemCode.localeCompare(b.itemCode) || a.controlId.localeCompare(b.controlId));
  }, [evidenceRows]);

  const buildRowsForControl = useCallback(async (controlKey: string) => {
    const [controlId, itemCode] = controlKey.split("::");
    const byRun = new Map<string, CloudEvidenceRow[]>();
    for (const row of evidenceRows) {
      if (row.control_id !== controlId || row.item_code !== itemCode) continue;
      if (!row.run_id) continue;
      const list = byRun.get(row.run_id) ?? [];
      list.push(row);
      byRun.set(row.run_id, list);
    }
    const pickLatest = (runId: string): CloudEvidenceRow | null => {
      const list = byRun.get(runId) ?? [];
      if (!list.length) return null;
      return [...list].sort((a, b) => {
        const at = a.collected_at ? new Date(a.collected_at).getTime() : 0;
        const bt = b.collected_at ? new Date(b.collected_at).getTime() : 0;
        return bt - at;
      })[0];
    };

    const comparableRuns = runs
      .map((run) => ({ run, evidence: pickLatest(run.run_id) }))
      .filter((x): x is { run: CloudCollectorRun; evidence: CloudEvidenceRow } =>
        Boolean(x.evidence)
      );
    if (!comparableRuns.length) return null;

    const contentList = await Promise.all(
      comparableRuns.map(async ({ run, evidence }) => {
        const content = await loadEvidenceContent(evidence.evidence_id);
        return { run, evidence, values: flattenContent(content) };
      })
    );
    const featureKeys = Array.from(new Set(contentList.flatMap((x) => Object.keys(x.values)))).sort();
      const rows = featureKeys.map((feature) => {
      const valuesByRun: Record<string, string> = {};
      for (const row of contentList) valuesByRun[row.run.run_id] = row.values[feature] ?? "—";
      const diff = new Set(Object.values(valuesByRun)).size > 1;
        const cleanedFeature = cleanFeatureLabel(feature);
        const group = cleanedFeature.includes(".") ? cleanedFeature.split(".")[0].toLowerCase() : "general";
      return { feature, valuesByRun, diff, group };
    });
    return {
      runsMeta: contentList.map((x) => ({
        runId: x.run.run_id,
        runLabel: runLabelMap.get(x.run.run_id) ?? "Run —",
        status: x.run.status ?? "unknown",
        collectedAt: x.evidence.collected_at,
        values: x.values,
      })),
      rows,
    };
  }, [evidenceRows, runs, runLabelMap, loadEvidenceContent]);

  const compareRuns = useCallback(async () => {
    if (!controlOptions.length) return;
    setCompareError(null);
    setCompareLoading(true);
    try {
      const domainMap = new Map<string, ControlComparison[]>();
      let sharedRunsMeta: CompareCell[] | null = null;

      const results = await Promise.all(
        controlOptions.map(async (c) => {
          const result = await buildRowsForControl(c.key);
          return { c, result };
        })
      );

      for (const { c, result } of results) {
        if (!result) continue;
        const domain = (c.itemCode || "").trim().charAt(0).toUpperCase();
        if (!sharedRunsMeta) sharedRunsMeta = result.runsMeta;
        const list = domainMap.get(domain) ?? [];
        list.push({
          controlKey: c.key,
          label: `${c.itemCode} · Control ${c.controlId}`,
          rows: result.rows,
        });
        domainMap.set(domain, list);
      }

      if (!domainMap.size) {
        setCompareError("No comparable run values available.");
        setDomainComparisons([]);
        setCompareMeta(null);
        return;
      }

      const domains: DomainComparison[] = Array.from(domainMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([domain, controls]) => ({
          domain,
          controls: controls.sort((a, b) => a.label.localeCompare(b.label)),
        }));
      setDomainComparisons(domains);
      setCompareMeta({ runs: sharedRunsMeta ?? [] });
      setExpandedDomains(new Set(domains.map((d) => d.domain)));
      setItemControlSelection((prev) => {
        const next = new Map(prev);
        for (const d of domains) {
          for (const [itemCode, ctrls] of groupControlsByItemCode(d.controls)) {
            const k = `${d.domain}::${itemCode}`;
            if (!next.has(k) && ctrls[0]) next.set(k, ctrls[0].controlKey);
          }
        }
        return next;
      });
      setHasPreloadedComparisor(true);
    } catch (e) {
      setCompareError(e instanceof Error ? e.message : "Failed to build domain-wise comparison.");
    } finally {
      setCompareLoading(false);
    }
  }, [controlOptions, buildRowsForControl]);

  useEffect(() => {
    if (!hasPreloadedComparisor && controlOptions.length && !compareLoading) {
      compareRuns();
    }
  }, [hasPreloadedComparisor, controlOptions.length, compareLoading, compareRuns]);

  useEffect(() => {
    if (!focusComparisorControlKey || !domainComparisons.length) return;
    const sep = focusComparisorControlKey.indexOf("::");
    if (sep === -1) return;
    const itemCode = focusComparisorControlKey.slice(sep + 2);
    const domain = (itemCode || "").trim().charAt(0).toUpperCase();
    if (!/[A-H]/.test(domain)) return;
    const exists = domainComparisons.some(
      (d) =>
        d.domain === domain && d.controls.some((c) => c.controlKey === focusComparisorControlKey)
    );
    if (!exists) return;
    setItemControlSelection((prev) => new Map(prev).set(`${domain}::${itemCode}`, focusComparisorControlKey));
    setExpandedDomains((prev) => new Set(prev).add(domain));
  }, [focusComparisorControlKey, domainComparisons]);

  const toggleDomain = (domain: string) => {
    setExpandedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  };

  const selectControlForItem = (domain: string, itemCode: string, controlKey: string) => {
    setItemControlSelection((prev) => new Map(prev).set(`${domain}::${itemCode}`, controlKey));
  };

  const getSelectedControlKey = (domain: string, itemCode: string, ctrls: ControlComparison[]) => {
    const k = `${domain}::${itemCode}`;
    const sel = itemControlSelection.get(k);
    if (sel && ctrls.some((c) => c.controlKey === sel)) return sel;
    return ctrls[0]?.controlKey ?? "";
  };

  if (!runs.length) {
    return (
      <div className="card rounded-xl border p-6 text-sm" style={{ borderColor: "var(--border)", color: "var(--foreground-muted)" }}>
        No run history available yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card rounded-xl border px-3 py-3 sm:px-4" style={{ borderColor: "var(--border)" }}>
        <div className="flex justify-center">
          <div className={awsPillTabListClass} role="tablist" aria-label="Run history view">
            <button
              type="button"
              role="tab"
              aria-selected={activeSidebar === "metrics"}
              onClick={() => setSidebarPreference("metrics")}
              title="Run History Metrics — charts and KPIs per run"
              className={`${awsPillTabButtonClass} ${
                activeSidebar === "metrics" ? "text-[var(--foreground)]" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
              style={
                activeSidebar === "metrics"
                  ? { background: "var(--card)", boxShadow: "0 1px 4px rgba(15, 23, 42, 0.1)" }
                  : undefined
              }
            >
              <span className="truncate">Metrics</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeSidebar === "collector"}
              onClick={() => setSidebarPreference("collector")}
              title="Collector Sources — where content was collected from"
              className={`${awsPillTabButtonClass} ${
                activeSidebar === "collector" ? "text-[var(--foreground)]" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
              style={
                activeSidebar === "collector"
                  ? { background: "var(--card)", boxShadow: "0 1px 4px rgba(15, 23, 42, 0.1)" }
                  : undefined
              }
            >
              <span className="truncate">Collector</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            Run history insights
          </span>
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{ background: "var(--muted)", color: "var(--foreground-muted)" }}
          >
            {runs.length} run{runs.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {activeSidebar === "metrics" ? (
        deferredCharts ? (
          <div
            className="card rounded-xl border p-6 text-sm"
            style={{ borderColor: "var(--border)", color: "var(--foreground-muted)" }}
          >
            <p style={{ color: "var(--foreground)" }}>
              Charts and timeline appear when you open <strong>Run Details</strong> above.
            </p>
            <p className="mt-2 text-xs">
              {compareLoading
                ? "Run Comparisor is preparing…"
                : hasPreloadedComparisor
                  ? "Run Comparisor is ready — open Run Details and switch to the Comparisor tab."
                  : "Run Comparisor will load when comparable evidence is available."}
            </p>
          </div>
        ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="card rounded-xl border p-5 xl:col-span-3" style={{ borderColor: "var(--border)" }}>
        <h3 className="text-base font-semibold mb-3" style={{ color: "var(--foreground)" }}>Status split</h3>
        <Plot
          data={[
            {
              type: "pie",
              values: [successCount, partialCount, failedCount, otherCount],
              labels: ["Success", "Partial", "Failed", "Other"],
              hole: 0.52,
              marker: { colors: ["#16a34a", "#d97706", "#dc2626", "#64748b"] },
              textinfo: "label+percent",
              hovertemplate: "%{label}: %{value}<extra></extra>",
            },
          ]}
          layout={{
            height: 280,
            margin: { l: 10, r: 10, t: 10, b: 10 },
            showlegend: false,
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            font: { color: "#0f172a", size: 12 },
          }}
          config={{ displayModeBar: false, responsive: true }}
          style={{ width: "100%" }}
        />
          </div>

          <div className="card rounded-xl border p-5 xl:col-span-6" style={{ borderColor: "var(--border)" }}>
        <h3 className="text-base font-semibold mb-3" style={{ color: "var(--foreground)" }}>Evidence trend by run</h3>
        <Plot
          data={[
            {
              type: "scatter",
              mode: "lines+markers",
              x: timeline.map((r) => `Run ${r.index}`),
              y: timeline.map((r) => r.evidence),
              line: { color: "#2563eb", width: 3 },
              marker: {
                size: 9,
                color: timeline.map((r) => statusColor(r.status)),
                line: { color: "#ffffff", width: 1 },
              },
              text: timeline.map((r) => `${formatDateTime(r.time)} · ${r.trigger}`),
              hovertemplate: "%{x}<br>Evidence: %{y}<br>%{text}<extra></extra>",
            },
          ]}
          layout={{
            height: 280,
            margin: { l: 40, r: 20, t: 10, b: 40 },
            xaxis: { title: { text: "Run sequence" } },
            yaxis: { title: { text: "Evidence count" }, rangemode: "tozero" },
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            font: { color: "#0f172a", size: 12 },
          }}
          config={{ displayModeBar: false, responsive: true }}
          style={{ width: "100%" }}
        />
          </div>

          <div className="card rounded-xl border p-5 xl:col-span-3" style={{ borderColor: "var(--border)" }}>
        <h3 className="text-base font-semibold mb-3" style={{ color: "var(--foreground)" }}>Snapshot</h3>
        <div className="space-y-3">
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>Total runs</p>
            <p className="text-2xl font-semibold" style={{ color: "var(--foreground)" }}>{timeline.length}</p>
          </div>
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>Total evidence</p>
            <p className="text-2xl font-semibold" style={{ color: "var(--foreground)" }}>{totalEvidence}</p>
          </div>
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>Average per run</p>
            <p className="text-2xl font-semibold" style={{ color: "var(--foreground)" }}>{avgEvidence}</p>
          </div>
        </div>
          </div>

          <div className="card rounded-xl border p-5 xl:col-span-6" style={{ borderColor: "var(--border)" }}>
        <h3 className="text-base font-semibold mb-1" style={{ color: "var(--foreground)" }}>Month-wise runs</h3>
        <p className="text-xs mb-3" style={{ color: "var(--foreground-muted)" }}>
          Jan–Dec {monthWiseYear}
        </p>
        <Plot
          data={[
            {
              type: "bar",
              x: monthWiseData.map((d) => d.month),
              y: monthWiseData.map((d) => d.count),
              text: monthWiseData.map((d) => d.hoverLabel),
              marker: { color: "#0ea5e9" },
              hovertemplate: "%{text}<br>%{y} run(s)<extra></extra>",
            },
          ]}
          layout={{
            height: 300,
            margin: { l: 50, r: 20, t: 10, b: 55 },
            xaxis: {
              title: { text: "Month" },
              automargin: true,
              tickangle: 0,
              categoryorder: "array",
              categoryarray: monthWiseData.map((d) => d.month),
            },
            yaxis:
              monthWiseMaxCount === 0
                ? {
                    title: { text: "Runs" },
                    rangemode: "tozero",
                    range: [0, 1],
                    tickmode: "linear",
                    tick0: 0,
                    dtick: 1,
                    tickformat: "d",
                  }
                : monthWiseMaxCount <= 30
                  ? {
                      title: { text: "Runs" },
                      rangemode: "tozero",
                      tickmode: "linear",
                      tick0: 1,
                      dtick: 1,
                      tickformat: "d",
                    }
                  : {
                      title: { text: "Runs" },
                      rangemode: "tozero",
                      tickformat: "d",
                      nticks: 8,
                    },
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            font: { color: "#0f172a", size: 12 },
          }}
          config={{ displayModeBar: false, responsive: true }}
          style={{ width: "100%" }}
        />
          </div>

          <div className="card rounded-xl border p-5 xl:col-span-6" style={{ borderColor: "var(--border)" }}>
        <h3 className="text-base font-semibold mb-4" style={{ color: "var(--foreground)" }}>Run timeline</h3>
        <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
          {[...runs].map((run, idx) => {
            const time = run.ended_at ?? run.in_time ?? run.execution_time;
            return (
              <div key={run.run_id} className="grid grid-cols-[22px_1fr] gap-3">
                <div className="relative flex justify-center pt-1">
                  <span className="h-3 w-3 rounded-full z-10" style={{ background: statusColor(run.status) }} />
                  {idx < runs.length - 1 && (
                    <span className="absolute top-4 bottom-[-14px] w-px" style={{ background: "var(--border)" }} />
                  )}
                </div>
                <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                      {formatDateTime(time)}
                    </p>
                    <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize" style={{ background: `${statusColor(run.status)}22`, color: statusColor(run.status) }}>
                      {run.status ?? "unknown"}
                    </span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>
                    Evidence collected: <strong style={{ color: "var(--foreground)" }}>{run.evidence_count ?? 0}</strong> · Trigger:{" "}
                    <span className="capitalize">{run.trigger_type ?? "unknown"}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
          </div>
        </div>
        )
      ) : collectorSources.length === 0 ? (
        <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
            No collector sources available yet.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)", background: "var(--muted)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              Collector sources
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>
              Dynamic list of systems where evidence content was collected from.
            </p>
          </div>
          <div className="max-h-[640px] overflow-auto p-4" style={{ background: "var(--surface)" }}>
            <div className="grid grid-cols-1 gap-4">
            {collectorSources.map((source) => (
              <div
                key={source.label}
                className="group rounded-xl border text-left"
                style={{
                  "--card-glow": source.tone.glow,
                  "--card-glow-strong": `${source.tone.border}22`,
                  "--card-glow-border": source.tone.bg,
                  "--card-accent": source.tone.border,
                  background: "var(--card)",
                  boxShadow: "none",
                  borderColor: "var(--border)",
                }}
              >
              <button
                type="button"
                onClick={() => toggleSourceDropdown(source)}
                className="w-full px-4 py-4 text-left rounded-xl transition-all duration-200 hover:-translate-y-[1px] hover:border-[var(--card-accent)] hover:shadow-[0_0_0_1px_var(--card-accent),0_0_0_4px_var(--card-glow-strong),0_10px_24px_var(--card-glow)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/45"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[var(--foreground-muted)] bg-[var(--muted)] group-hover:text-[var(--card-accent)] group-hover:bg-[var(--card-glow-border)] group-hover:shadow-[0_0_0_1px_var(--card-accent),0_0_20px_var(--card-glow-strong)]"
                    >
                      {(() => {
                        const Icon = sourceIcon(source.label);
                        return <Icon className="h-[18px] w-[18px]" />;
                      })()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[1.15rem] font-semibold leading-6" style={{ color: "var(--foreground)" }}>
                        {sourceDisplayLabel(source.label)}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>
                        Collector Service
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-[var(--foreground-muted)] group-hover:text-[var(--card-accent)]">
                    View
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--foreground-muted)" }}>
                    Key Collected Data
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {source.collectedTypeSummary.slice(0, 3).map((entry) => (
                      <span
                        key={`${source.label}-${entry.type}`}
                        className="inline-flex rounded-full px-3 py-1.5 text-xs font-medium bg-[var(--muted)] text-[var(--foreground)] group-hover:bg-[var(--card-glow-border)] group-hover:shadow-[0_0_0_1px_var(--card-accent)]"
                        title={`${entry.type} (${entry.count})`}
                      >
                        {entry.type} ({entry.count})
                      </span>
                    ))}
                  </div>
                </div>
              </button>
              {expandedSourceLabel === source.label && (
                <div className="border-t px-4 pb-4 pt-3" style={{ borderColor: "var(--border)", background: "var(--surface-elevated)" }}>
                  <p className="text-base font-semibold mb-2" style={{ color: "var(--foreground)" }}>
                    API breakdown
                  </p>
                  <div className="max-h-[240px] overflow-auto rounded-lg border mb-4 shadow-sm" style={{ borderColor: "var(--border)" }}>
                    <table className="w-full border-collapse text-sm">
                      <thead className="sticky top-0 z-[1]" style={{ background: "var(--muted)" }}>
                        <tr>
                          <th className="px-3 py-2.5 text-left font-bold" style={{ color: "#0f172a" }}>
                            API method
                          </th>
                          <th className="px-3 py-2.5 text-left font-bold" style={{ color: "#0f172a" }}>
                            Service
                          </th>
                          <th className="px-3 py-2.5 text-left font-bold" style={{ color: "#0f172a" }}>
                            Operation
                          </th>
                          <th className="px-3 py-2.5 text-left font-bold" style={{ color: "#0f172a" }}>
                            Purpose
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {buildApiBreakdown(getApisForSourceWithMatrix(source.label, collectorApiMatrix)).map((row) => (
                          <tr
                            key={`${source.label}-api-breakdown-${row.method}`}
                            className="border-t align-top transition-colors hover:bg-[var(--card-glow-border)]/45"
                            style={{ borderColor: "var(--border)" }}
                          >
                            <td className="px-3 py-2 whitespace-nowrap font-medium" style={{ color: "var(--foreground)" }}>
                              <span
                                className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-[var(--muted)] hover:bg-[var(--card-glow-border)] transition-colors"
                                style={{ color: "var(--foreground)" }}
                              >
                                {row.method}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap" style={{ color: "var(--foreground)" }}>
                              <span
                                className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-[var(--muted)] hover:bg-[var(--card-glow-border)] transition-colors"
                                style={{ color: "var(--foreground)" }}
                              >
                                {row.service}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap" style={{ color: "var(--foreground)" }}>
                              <span
                                className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-[var(--muted)] hover:bg-[var(--card-glow-border)] transition-colors"
                                style={{ color: "var(--foreground)" }}
                              >
                                {row.operation}
                              </span>
                            </td>
                            <td className="px-3 py-2" style={{ color: "var(--foreground)" }}>
                              <span
                                className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-[var(--muted)] hover:bg-[var(--card-glow-border)] transition-colors"
                                style={{ color: "var(--foreground)" }}
                              >
                                {row.purpose}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-base font-semibold mb-2" style={{ color: "var(--foreground)" }}>
                    Run-wise comparison (current run highlighted)
                  </p>
                  {sourceCompareLoading[source.label] ? (
                    <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                      Loading run comparison...
                    </p>
                  ) : sourceCompareError[source.label] ? (
                    <p className="text-sm" style={{ color: "var(--danger)" }}>
                      {sourceCompareError[source.label]}
                    </p>
                  ) : !(sourceCompareData[source.label]?.runColumns.length) ? (
                    <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                      No comparable runs available for this source.
                    </p>
                  ) : (
                  <div className="max-h-[420px] overflow-auto rounded-lg border" style={{ borderColor: "var(--border)" }}>
                      <table className="w-full border-collapse text-sm">
                        <thead className="sticky top-0 z-[1]" style={{ background: "var(--muted)" }}>
                          <tr>
                            <th className="px-3 py-2.5 text-left font-bold" style={{ color: "#0f172a", minWidth: 260 }}>
                              Field
                            </th>
                            {sourceCompareData[source.label].runColumns.map((c) => (
                              <th
                                key={`${source.label}-col-${c.runId}`}
                                className="px-3 py-2.5 text-left font-bold"
                                style={{
                                  color: "#0f172a",
                                  background: "transparent",
                                  minWidth: 220,
                                }}
                              >
                                {c.runLabel}{c.isCurrent ? " (Current)" : ""}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sourceCompareData[source.label].rows.slice(0, 120).map((r, rowIdx) => (
                            <tr
                              key={`${source.label}-row-${r.field}`}
                              className="border-t"
                              style={{
                                borderColor: "var(--border)",
                                background: rowIdx % 2 === 0 ? "var(--surface)" : "transparent",
                              }}
                            >
                              <td className="px-3 py-2 align-top whitespace-nowrap font-medium" style={{ color: "var(--foreground)" }}>
                                <span
                                  className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-[var(--muted)] hover:bg-[var(--card-glow-border)] transition-colors"
                                  style={{ color: "var(--foreground)" }}
                                >
                                  {r.field}
                                </span>
                              </td>
                              {sourceCompareData[source.label].runColumns.map((c, idx, arr) => {
                                const currentVal = r.valuesByRun[c.runId] ?? "—";
                                const prevVal = idx === 0 && arr[1] ? (r.valuesByRun[arr[1].runId] ?? "—") : null;
                                const changedCell = idx === 0 && prevVal !== null && currentVal !== prevVal;
                                return (
                                  <td
                                    key={`${source.label}-row-${r.field}-${c.runId}`}
                                    className="px-3 py-2 align-top break-words"
                                    style={{
                                      color: "var(--foreground)",
                                      background: "transparent",
                                    }}
                                  >
                                    <span
                                      className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-[var(--muted)] hover:bg-[var(--card-glow-border)] transition-colors"
                                      style={{ color: "var(--foreground)" }}
                                    >
                                      {currentVal}
                                    </span>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              </div>
            ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

