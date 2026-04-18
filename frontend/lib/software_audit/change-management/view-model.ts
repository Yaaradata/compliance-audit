/**
 * Change Management & Release Controls — view-model builder.
 *
 * Joins the six raw collector payloads (Jira / GitHub / GitHub Actions /
 * deployment / freeze-window / rollback) by `change_id`, derives a per-change
 * {@link ChangeViewModel}, and evaluates the five control families.
 */
import { REQUIRED_GATES } from "./constants";
import { evaluateControls, rollupChangeStatus } from "./audit-rules";
import type {
  ChangeViewModel,
  DashboardViewModel,
  EvaluationContext,
  GateStatus,
  RawData,
  RawFreezeWindow,
} from "./types";

const findFreezeWindowFor = (
  ts: string,
  env: string,
  freezeWindows: RawFreezeWindow[],
): RawFreezeWindow | null =>
  freezeWindows.find(
    (w) =>
      w.applicable_environments.includes(env) &&
      new Date(ts) >= new Date(w.start) &&
      new Date(ts) <= new Date(w.end),
  ) || null;

export function buildViewModel(raw: RawData): DashboardViewModel {
  const issues = raw.change_request_collector.issues;
  const prs = raw.pull_request_collector.pull_requests;
  const runs = raw.cicd_evidence_collector.workflow_runs;
  const deps = raw.deployment_activity_collector.deployments;
  const freezeWindows = raw.freeze_window_collector.freeze_windows;
  const exceptions = raw.freeze_window_collector.exceptions;
  const rollbacks = raw.rollback_evidence_collector.records;

  const changes: ChangeViewModel[] = issues.map((issue) => {
    const key = issue.key;
    const f = issue.fields;
    const pr = prs.find((p) => p.linked_change_key === key) || null;
    const run = runs.find((r) => r.linked_change_key === key) || null;
    const dep = deps.find((d) => d.linked_change_key === key) || null;
    const rollback = rollbacks.find((r) => r.linked_change_key === key) || null;

    const emergency = f.customfield_10200?.value === "Emergency";
    const cabStatus = (f.customfield_10201 ?? null) as string | null;
    const cabApprover = (f.customfield_10202 ?? null) as string | null;
    const cabApprovedAt = (f.customfield_10203 ?? null) as string | null;
    const rollbackNarrative = (f.customfield_10210 as string) || "";
    const targetEnvs = (f.customfield_10211 as string[]) || [];
    const businessService = f.customfield_10212 as string | undefined;
    const riskLevel = f.customfield_10213 as string | undefined;
    const requester = f.reporter?.emailAddress?.split("@")[0] ?? "—";

    const stagesByName: Record<string, GateStatus & { name?: string }> = {};
    if (run)
      run.stages.forEach((s) => {
        stagesByName[s.name] = {
          ...s,
          present: s.conclusion === "success",
          conclusion: s.conclusion,
        };
      });
    const gateStatus: Record<string, GateStatus> = {};
    REQUIRED_GATES.forEach((g) => {
      const stage = stagesByName[g];
      gateStatus[g] = stage
        ? stage
        : { present: false, conclusion: "missing" };
    });

    const freezeHit = dep
      ? findFreezeWindowFor(dep.timestamp, dep.environment, freezeWindows)
      : null;
    const freezeException = freezeHit
      ? exceptions.find(
          (e) =>
            e.linked_change_key === key &&
            e.freeze_window_id === freezeHit.id &&
            e.status === "APPROVED",
        ) || null
      : null;

    const prAuthor = pr?.user?.login || null;
    const prMergedBy = pr?.merged_by?.login || null;
    const deployActor = dep?.deployed_by || null;
    const deployCommandActor = dep?.command_executed_by || null;

    const ctx: EvaluationContext = {
      key,
      issue,
      pr,
      run,
      dep,
      rollback,
      emergency,
      cabStatus,
      cabApprover,
      cabApprovedAt,
      rollbackNarrative,
      targetEnvs,
      businessService,
      riskLevel,
      requester,
      gateStatus,
      freezeHit,
      freezeException,
      prAuthor,
      prMergedBy,
      deployActor,
      deployCommandActor,
      createdAt: f.created,
      resolvedAt: f.resolutiondate,
    };

    const controls = evaluateControls(ctx);
    const overall = rollupChangeStatus(controls);

    return {
      key,
      title: f.summary,
      type: f.issuetype.name,
      priority: f.priority.name,
      businessService,
      riskLevel,
      emergency,
      requester,
      requesterDisplay: f.reporter.displayName ?? "—",
      cabApprover,
      cabApprovedAt,
      environmentsTargeted: targetEnvs,
      createdAt: f.created,
      resolvedAt: f.resolutiondate,
      deployTimestamp: dep?.timestamp || null,
      deployEnvironment: dep?.environment || null,
      deployedBy: deployActor,
      deployCommandActor,
      deploymentId: dep?.id || null,
      prNumber: pr?.number ?? null,
      prAuthor,
      prMergedBy,
      repository: pr?.repository?.full_name || null,
      runId: run?.id || null,
      runConclusion: run?.conclusion || null,
      rollbackPlanPresent: rollback?.rollback_plan_present ?? null,
      rollbackTested: rollback?.rollback_tested ?? null,
      rollbackEvidenceRef: rollback?.evidence_reference ?? null,
      freezeHit,
      freezeException,
      gateStatus,
      issue,
      pr,
      run,
      dep,
      rollback,
      controls,
      overall,
    };
  });

  return { changes, freezeWindows, exceptions };
}
