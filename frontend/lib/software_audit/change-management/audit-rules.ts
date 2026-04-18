/**
 * Change Management audit rules — one deterministic evaluator per control
 * family. Each evaluator returns a {@link ControlResult} describing the
 * overall status, the severity, a human-readable reason and the sub-controls
 * with their evidence pointers.
 */
import {
  EMERGENCY_CAB_HOURS,
  REQUIRED_GATES,
  STATUS,
  fmtDate,
  prettyUser,
} from "./constants";
import type {
  ControlResult,
  ControlResults,
  EvaluationContext,
  SubControlResult,
} from "./types";

export function evaluateControls(ctx: EvaluationContext): ControlResults {
  return {
    approval: evalApproval(ctx),
    sod: evalSoD(ctx),
    testing: evalTesting(ctx),
    freeze: evalFreeze(ctx),
    rollback: evalRollback(ctx),
  };
}

export function rollupChangeStatus(controls: ControlResults) {
  const values = Object.values(controls).map((c) => c.status);
  if (values.includes(STATUS.NOT_MET)) return STATUS.NOT_MET;
  if (values.includes(STATUS.REVIEW)) return STATUS.REVIEW;
  return STATUS.MET;
}

/* ---------------------------------------------------------------------------
 * CM-01 · Change Approval Workflow (CAB)
 * ------------------------------------------------------------------------ */
function evalApproval(ctx: EvaluationContext): ControlResult {
  const { emergency, cabStatus, cabApprovedAt, createdAt, issue, cabApprover } = ctx;
  const subs: SubControlResult[] = [];

  const cabApproved =
    cabStatus === "APPROVED" ||
    cabStatus === "POST_HOC_APPROVED" ||
    cabStatus === "POST_HOC_APPROVED_LATE";

  subs.push({
    label: "CAB approval recorded",
    status: cabApproved ? STATUS.MET : STATUS.NOT_MET,
    evidence: cabApproved
      ? `Jira ${issue.key} · customfield_10201="${cabStatus}" · approver ${cabApprover} · ${fmtDate(cabApprovedAt)}`
      : `Jira ${issue.key} · customfield_10201="${cabStatus}"`,
  });

  if (emergency) {
    const hours = cabApprovedAt
      ? (new Date(cabApprovedAt).getTime() - new Date(createdAt).getTime()) / 3_600_000
      : Infinity;
    const inWindow = hours <= EMERGENCY_CAB_HOURS;
    subs.push({
      label: `Emergency post-hoc CAB within ${EMERGENCY_CAB_HOURS}h`,
      status: inWindow ? STATUS.MET : STATUS.NOT_MET,
      evidence: `Jira ${issue.key} · raised ${fmtDate(createdAt)} · CAB ${fmtDate(cabApprovedAt)} · elapsed ${Number.isFinite(hours) ? hours.toFixed(1) : "∞"}h`,
    });
  }

  const anyNotMet = subs.some((s) => s.status === STATUS.NOT_MET);
  return {
    status: anyNotMet ? STATUS.NOT_MET : STATUS.MET,
    severity: anyNotMet ? "High" : "Informational",
    reason: anyNotMet
      ? emergency
        ? `Emergency change post-hoc CAB review exceeded the ${EMERGENCY_CAB_HOURS}h window.`
        : "CAB approval is missing or incomplete."
      : "Change passed through CAB workflow within policy.",
    subControls: subs,
    evidenceSources: [
      "change_request_collector.issues[].changelog",
      "change_request_collector.issues[].customfield_10201",
    ],
  };
}

/* ---------------------------------------------------------------------------
 * CM-02 · Developer-to-Production Segregation of Duties
 * ------------------------------------------------------------------------ */
function evalSoD(ctx: EvaluationContext): ControlResult {
  const { prAuthor, deployActor, deployCommandActor, dep, pr } = ctx;
  if (!dep) {
    return {
      status: STATUS.REVIEW,
      severity: "Medium",
      reason: "No deployment record found — audit trail incomplete.",
      subControls: [],
      evidenceSources: ["deployment_activity_collector.deployments"],
    };
  }
  const selfDeployBot = deployActor === prAuthor;
  const selfDeployCommand = deployCommandActor === prAuthor;
  const violation = selfDeployBot || selfDeployCommand;

  const subs: SubControlResult[] = [
    {
      label: "Deployment actor is distinct from PR author",
      status: violation ? STATUS.NOT_MET : STATUS.MET,
      evidence: `PR #${pr?.number ?? "?"} author=${prAuthor ?? "?"} · deployment.deployed_by=${deployActor ?? "?"} · deployment.command_executed_by=${deployCommandActor ?? "?"}`,
    },
  ];

  return {
    status: violation ? STATUS.NOT_MET : STATUS.MET,
    severity: violation ? "High" : "Informational",
    reason: violation
      ? `Developer ${prettyUser(prAuthor)} both authored the code change and executed the production deployment.`
      : "Deployment executed by a release/operations identity separate from the code author.",
    subControls: subs,
    evidenceSources: [
      "pull_request_collector.pull_requests[].user",
      "deployment_activity_collector.deployments[].deployed_by",
      "deployment_activity_collector.deployments[].command_executed_by",
    ],
  };
}

/* ---------------------------------------------------------------------------
 * CM-03 · Pre-deployment Testing
 * ------------------------------------------------------------------------ */
function evalTesting(ctx: EvaluationContext): ControlResult {
  const { gateStatus, run } = ctx;
  const labels: Record<string, string> = {
    unit_tests: "Unit tests executed & passed",
    integration_tests: "Integration tests executed & passed",
    uat_signoff: "UAT sign-off recorded",
    security_scan: "Security scan (SAST/DAST) executed",
  };

  const subs: SubControlResult[] = REQUIRED_GATES.map((g) => {
    const s = gateStatus[g];
    const ok = !!s?.present;
    return {
      label: labels[g] || g,
      status: ok ? STATUS.MET : STATUS.NOT_MET,
      evidence: run
        ? `Pipeline run ${run.id} · stage "${g}" · conclusion="${s?.conclusion ?? "missing"}"${s?.notes ? " · " + s.notes : ""}`
        : "No pipeline run linked to this change.",
    };
  });

  const anyMissing = subs.some((s) => s.status === STATUS.NOT_MET);
  const missingGates = subs.filter((s) => s.status === STATUS.NOT_MET).map((s) => s.label);
  return {
    status: anyMissing ? STATUS.NOT_MET : STATUS.MET,
    severity: anyMissing ? "High" : "Informational",
    reason: anyMissing
      ? `Required pre-deployment testing gate(s) not satisfied: ${missingGates.join("; ")}.`
      : "All required testing gates produced successful evidence prior to deployment.",
    subControls: subs,
    evidenceSources: ["cicd_evidence_collector.workflow_runs[].stages"],
  };
}

/* ---------------------------------------------------------------------------
 * CM-04 · Change Freeze Adherence
 * ------------------------------------------------------------------------ */
function evalFreeze(ctx: EvaluationContext): ControlResult {
  const { freezeHit, freezeException, dep } = ctx;
  if (!dep) {
    return {
      status: STATUS.REVIEW,
      severity: "Medium",
      reason: "No deployment record to evaluate against freeze windows.",
      subControls: [],
      evidenceSources: [],
    };
  }
  if (!freezeHit) {
    return {
      status: STATUS.MET,
      severity: "Informational",
      reason: `Deployment on ${fmtDate(dep.timestamp)} fell outside all declared freeze windows.`,
      subControls: [
        {
          label: "Deployment not during a declared freeze window",
          status: STATUS.MET,
          evidence: `deployment ${dep.id} @ ${fmtDate(dep.timestamp)} · no freeze window active for ${dep.environment}`,
        },
      ],
      evidenceSources: [
        "freeze_window_collector.freeze_windows",
        "deployment_activity_collector.deployments",
      ],
    };
  }
  const covered = !!freezeException;
  const subs: SubControlResult[] = [
    {
      label: `Deployment during freeze window "${freezeHit.label}"`,
      status: covered ? STATUS.MET : STATUS.NOT_MET,
      evidence: covered
        ? `Exception ${freezeException!.id} approved by ${freezeException!.approver} at ${fmtDate(freezeException!.approved_at)}`
        : `deployment ${dep.id} at ${fmtDate(dep.timestamp)} falls inside ${freezeHit.id} · no exception record found`,
    },
  ];
  return {
    status: covered ? STATUS.MET : STATUS.NOT_MET,
    severity: covered ? "Informational" : "High",
    reason: covered
      ? `Deployment during "${freezeHit.label}" covered by approved exception ${freezeException!.id}.`
      : `Deployment executed during "${freezeHit.label}" without an approved exception.`,
    subControls: subs,
    evidenceSources: [
      "freeze_window_collector.freeze_windows",
      "freeze_window_collector.exceptions",
    ],
  };
}

/* ---------------------------------------------------------------------------
 * CM-05 · Rollback Capability
 * ------------------------------------------------------------------------ */
function evalRollback(ctx: EvaluationContext): ControlResult {
  const { rollback, key } = ctx;
  if (!rollback) {
    return {
      status: STATUS.NOT_MET,
      severity: "High",
      reason: "No rollback evidence record found for this change.",
      subControls: [],
      evidenceSources: ["rollback_evidence_collector.records"],
    };
  }
  const subs: SubControlResult[] = [];
  subs.push({
    label: "Rollback plan documented",
    status: rollback.rollback_plan_present ? STATUS.MET : STATUS.NOT_MET,
    evidence: rollback.rollback_plan_present
      ? `rollback_evidence_collector record for ${key} · steps: "${(rollback.rollback_steps || "").slice(0, 90)}${(rollback.rollback_steps || "").length > 90 ? "…" : ""}"`
      : `rollback_evidence_collector record for ${key} · rollback_plan_present=false · ${rollback.notes || "no plan narrative in change ticket"}`,
  });
  if (rollback.rollback_plan_present) {
    subs.push({
      label: "Rollback validated in pre-production",
      status: rollback.rollback_tested ? STATUS.MET : STATUS.REVIEW,
      evidence: rollback.rollback_tested
        ? `Tested in ${rollback.rollback_tested_in} on ${fmtDate(rollback.rollback_tested_at)} by ${rollback.rollback_validator} · ${rollback.evidence_reference}`
        : `rollback_tested=false · ${rollback.notes || "no validation execution recorded"}`,
    });
  }
  const anyNotMet = subs.some((s) => s.status === STATUS.NOT_MET);
  const anyReview = subs.some((s) => s.status === STATUS.REVIEW);
  const overall = anyNotMet
    ? STATUS.NOT_MET
    : anyReview
      ? STATUS.REVIEW
      : STATUS.MET;
  return {
    status: overall,
    severity:
      overall === STATUS.NOT_MET
        ? "High"
        : overall === STATUS.REVIEW
          ? "Medium"
          : "Informational",
    reason: !rollback.rollback_plan_present
      ? "Rollback plan is missing for a production change."
      : !rollback.rollback_tested
        ? "Rollback plan documented but not validated in a pre-production environment."
        : "Rollback plan documented and validated in pre-production prior to release.",
    subControls: subs,
    evidenceSources: ["rollback_evidence_collector.records"],
  };
}
