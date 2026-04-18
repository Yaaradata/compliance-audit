/**
 * Change Management & Release Controls — domain types.
 *
 * The collector payloads are treated as "unknown-ish" (raw JSON from Jira /
 * GitHub / Actions / deploy logs / internal services). The `Raw*` types below
 * describe only the fields we actually read; anything else on the payload is
 * preserved via an index signature so the drawer can render it verbatim.
 */
import type { ControlFamilyId, StatusValue, SeverityValue } from "./constants";

/* ---------------------------------------------------------------------------
 * Raw collector payloads (subset used by the dashboard)
 * ------------------------------------------------------------------------ */
export type RawUser = {
  accountId?: string;
  displayName?: string;
  emailAddress?: string;
  login?: string;
  type?: string;
};

export type RawIssue = {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: string;
    issuetype: { name: string; id?: string };
    priority: { name: string };
    status: { name: string; statusCategory?: { key: string } };
    created: string;
    resolutiondate?: string | null;
    reporter: RawUser;
    assignee?: RawUser;
    customfield_10200?: { value: string };
    customfield_10201?: string | null;
    customfield_10202?: string | null;
    customfield_10203?: string | null;
    customfield_10204?: string | null;
    customfield_10205?: string | null;
    customfield_10210?: string | null;
    customfield_10211?: string[];
    customfield_10212?: string;
    customfield_10213?: string;
    customfield_10214?: string | null;
    customfield_10215?: string | null;
    [key: string]: unknown;
  };
  changelog?: unknown;
  [key: string]: unknown;
};

export type RawPullRequest = {
  id: number;
  number: number;
  state?: string;
  title?: string;
  user: { login: string; type?: string };
  merged_by?: { login: string; type?: string };
  merged_at?: string;
  head: { ref: string; sha?: string };
  base?: { ref: string };
  repository?: { full_name: string };
  reviews: Array<{ user: { login: string }; state?: string; submitted_at?: string }>;
  changed_files?: number;
  additions?: number;
  deletions?: number;
  linked_change_key: string;
  [key: string]: unknown;
};

export type RawPipelineStage = {
  name: string;
  status?: string;
  conclusion: string;
  started_at?: string;
  completed_at?: string;
  evidence_url?: string;
  notes?: string;
};

export type RawWorkflowRun = {
  id: number;
  name?: string;
  head_branch?: string;
  head_sha?: string;
  display_title?: string;
  conclusion: string;
  html_url?: string;
  created_at?: string;
  updated_at?: string;
  run_started_at?: string;
  triggering_actor: { login: string; type?: string };
  repository?: { full_name: string };
  linked_change_key: string;
  stages: RawPipelineStage[];
  [key: string]: unknown;
};

export type RawDeployment = {
  id: string;
  environment: string;
  release_version: string;
  deployed_by: string;
  actor_type?: string;
  command_executed_by: string;
  timestamp: string;
  source_ip?: string;
  status: string;
  artifact?: { image?: string; sha?: string };
  linked_change_key: string;
  linked_pr_number?: number;
  linked_pipeline_run_id?: number;
  [key: string]: unknown;
};

export type RawFreezeWindow = {
  id: string;
  label: string;
  start: string;
  end: string;
  reason: string;
  applicable_environments: string[];
  applicable_services?: string[];
  owner?: string;
  declared_at?: string;
};

export type RawFreezeException = {
  id: string;
  freeze_window_id: string;
  linked_change_key: string;
  requested_by?: string;
  approver: string;
  approved_at: string;
  justification?: string;
  status: string;
};

export type RawRollbackRecord = {
  linked_change_key: string;
  rollback_plan_present: boolean;
  rollback_steps: string | null;
  rollback_tested: boolean;
  rollback_tested_at?: string | null;
  rollback_tested_in?: string | null;
  rollback_validator?: string | null;
  evidence_reference?: string | null;
  notes?: string;
};

export type RawData = {
  _metadata: {
    demo: boolean;
    description?: string;
    organization: string;
    audit_period: { start: string; end: string };
    audit_engagement: string;
    generated_at: string;
    thresholds: {
      emergency_cab_post_hoc_window_hours: number;
      required_testing_gates: string[];
    };
    freeze_windows_reference?: Array<{
      id: string;
      start: string;
      end: string;
      reason: string;
    }>;
  };
  change_request_collector: {
    _api: string;
    _endpoint?: string;
    issues: RawIssue[];
    [k: string]: unknown;
  };
  pull_request_collector: {
    _api: string;
    _endpoint?: string;
    pull_requests: RawPullRequest[];
    [k: string]: unknown;
  };
  cicd_evidence_collector: {
    _api: string;
    _endpoint?: string;
    workflow_runs: RawWorkflowRun[];
    [k: string]: unknown;
  };
  deployment_activity_collector: {
    _api: string;
    _endpoint?: string;
    deployments: RawDeployment[];
    [k: string]: unknown;
  };
  freeze_window_collector: {
    _api: string;
    _endpoint?: string;
    freeze_windows: RawFreezeWindow[];
    exceptions: RawFreezeException[];
    [k: string]: unknown;
  };
  rollback_evidence_collector: {
    _api: string;
    _endpoint?: string;
    records: RawRollbackRecord[];
    [k: string]: unknown;
  };
};

/* ---------------------------------------------------------------------------
 * Audit evaluation result types
 * ------------------------------------------------------------------------ */
export type SubControlResult = {
  label: string;
  status: StatusValue;
  evidence: string;
};

export type ControlResult = {
  status: StatusValue;
  severity: SeverityValue;
  reason: string;
  subControls: SubControlResult[];
  evidenceSources: string[];
};

export type ControlResults = Record<ControlFamilyId, ControlResult>;

/* ---------------------------------------------------------------------------
 * View model context (used internally by audit-rules)
 * ------------------------------------------------------------------------ */
export type GateStatus = {
  present: boolean;
  conclusion: string;
  notes?: string;
  [k: string]: unknown;
};

export type EvaluationContext = {
  key: string;
  issue: RawIssue;
  pr: RawPullRequest | null;
  run: RawWorkflowRun | null;
  dep: RawDeployment | null;
  rollback: RawRollbackRecord | null;
  emergency: boolean;
  cabStatus: string | null;
  cabApprover: string | null;
  cabApprovedAt: string | null;
  rollbackNarrative: string;
  targetEnvs: string[];
  businessService: string | undefined;
  riskLevel: string | undefined;
  requester: string;
  gateStatus: Record<string, GateStatus>;
  freezeHit: RawFreezeWindow | null;
  freezeException: RawFreezeException | null;
  prAuthor: string | null;
  prMergedBy: string | null;
  deployActor: string | null;
  deployCommandActor: string | null;
  createdAt: string;
  resolvedAt: string | null | undefined;
};

/* ---------------------------------------------------------------------------
 * Public view-model — one entry per change, consumed by the UI
 * ------------------------------------------------------------------------ */
export type ChangeViewModel = {
  key: string;
  title: string;
  type: string;
  priority: string;
  businessService: string | undefined;
  riskLevel: string | undefined;
  emergency: boolean;
  requester: string;
  requesterDisplay: string;
  cabApprover: string | null;
  cabApprovedAt: string | null;
  environmentsTargeted: string[];
  createdAt: string;
  resolvedAt: string | null | undefined;
  deployTimestamp: string | null;
  deployEnvironment: string | null;
  deployedBy: string | null;
  deployCommandActor: string | null;
  deploymentId: string | null;
  prNumber: number | null;
  prAuthor: string | null;
  prMergedBy: string | null;
  repository: string | null;
  runId: number | null;
  runConclusion: string | null;
  rollbackPlanPresent: boolean | null;
  rollbackTested: boolean | null;
  rollbackEvidenceRef: string | null;
  freezeHit: RawFreezeWindow | null;
  freezeException: RawFreezeException | null;
  gateStatus: Record<string, GateStatus>;
  issue: RawIssue;
  pr: RawPullRequest | null;
  run: RawWorkflowRun | null;
  dep: RawDeployment | null;
  rollback: RawRollbackRecord | null;
  controls: ControlResults;
  overall: StatusValue;
};

export type DashboardViewModel = {
  changes: ChangeViewModel[];
  freezeWindows: RawFreezeWindow[];
  exceptions: RawFreezeException[];
};
