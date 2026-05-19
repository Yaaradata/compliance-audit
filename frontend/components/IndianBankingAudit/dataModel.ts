// Bridge layer: import the validated mock dataset and expose typed accessors.
// The mock data lives in `@/lib/IndianBankingAudit/mockIndianBankingAuditData.js`.
// Field names follow Pass 5 schema (snake_case where the mock data is snake_case).

// We intentionally widen types via `any` in the import boundary because the
// underlying file is hand-authored JS. Accessor return types below pin the
// shape we actually consume in the prototype.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
import * as MockModule from '@/lib/IndianBankingAudit/mockIndianBankingAuditData.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const M: any = (MockModule as any).mockData;

export type Persona = {
  persona_id: string;
  code: string;
  title: string;
  default_screen: string;
  persona_questions: string[];
};

export type NavigationItem = {
  nav_id: string;
  label: string;
  icon_name: string;
  default_screen: string | null;
  persona_default_for: string[];
  wave: number;
  enabled_flag: boolean;
  screens_inside: string[];
  entity_anchor: string | null;
};

export type Screen = {
  screen_id: string;
  code: string;
  title: string;
  primary_persona: string;
  persona_question_answered: string;
  anchor_entity: string;
  default_filters: Record<string, unknown>;
  primary_kpis: string[];
};

export type Metric = {
  metric_id: string;
  title: string;
  formula: string;
  weights: Record<string, number>;
  color_thresholds: { green: number; amber: number; red: number };
  denominator_rules: string;
  used_by_screens: string[];
};

export type RiskDomain = { domain_id: string; title: string; regulatory_anchor: string };

export type Risk = {
  risk_id: string;
  domain_id: string;
  title: string;
  inherent_rating: string;
  residual_rating: string;
  residual_rating_trend: string;
  res_score: number;
  accountable_senior_manager_id: string;
  kri_ids: string[];
  appetite_metric_ids: string[];
  linked_obligation_ids: string[];
  linked_control_ids: string[];
};

export type Regulation = {
  regulation_id: string;
  title: string;
  regulator: string;
  citation: string;
  version: string;
  effective_from: string;
  supersedes: string | null;
};

export type Obligation = {
  obligation_id: string;
  atomic_requirement: string;
  regulation_id: string;
  applicability_archetype: string[];
  reporting_clock_id: string | null;
  accountable_senior_manager_id: string;
  applicable_processes: string[];
  linked_control_ids: string[];
};

export type Control = {
  control_id: string;
  title: string;
  type: string;
  nature: string;
  frequency: string;
  process_id: string;
  position_in_step: string;
  owner_role: string;
  accountable_senior_manager_id: string;
  designed_condition: string;
  evidence_specs: string[];
  population_testable_flag: boolean;
  ces_breakdown: { operating_rate: number | null; catch_rate: number | null; evidence_completeness: number | null };
  ces: number | null;
  ces_band: string;
  linked_obligations: string[];
  linked_risks: string[];
};

export type Process = {
  process_id: string;
  name: string;
  owner_role: string;
  regulatory_anchor_ids: string[];
  linked_obligation_ids: string[];
  documented_variant_signature: string;
  pvds: number | null;
  status: string;
};

export type ProcessStep = {
  step_id: string;
  process_id: string;
  step_order: number;
  name: string;
  expected_actor_role: string;
  expected_systems: string[];
  slas: { latency_hours: number };
};

export type SourceSystem = {
  source_system_id: string;
  system_type: string;
  vendor: string;
  integration_mode: string;
  expected_latency_ms: number;
  system_of_record_flag: boolean;
  status: string;
  wave: number;
};

export type SourceRecord = {
  source_record_id: string;
  source_system_id: string;
  source_table_or_api: string;
  source_primary_key: string;
  payload_hash: string | null;
  event_timestamp: string | null;
  ingestion_timestamp: string | null;
  validation_status: string;
  correlation_status: string;
  key_fields_preview: Record<string, unknown>;
};

export type CorrelationRecord = {
  correlation_id: string;
  from_entity_type: string;
  from_entity_id: string;
  to_entity_type: string | null;
  to_entity_id: string | null;
  primary_key_used: string;
  backup_key_used: string | null;
  match_method: string;
  match_confidence: number;
  expected_cardinality: string;
  actual_cardinality: string;
  correlation_status: string;
  explanation: string;
};

export type ProcessExecution = {
  process_execution_id: string;
  process_id: string;
  anchor_key_value: string;
  status: string;
  variant_signature: string;
  control_instance_count: number;
  evidence_completeness: number;
  started_at: string;
  closed_at: string | null;
};

export type StepExecution = {
  step_execution_id: string;
  process_execution_id: string;
  step_id: string;
  actual_actor_type: string;
  actual_system: string;
  start_ts: string | null;
  end_ts: string | null;
  skipped_step_flag: boolean;
  manual_override_flag: boolean;
  bpo_or_vendor_flag: boolean;
  source_record_ids: string[];
  deviation_note: string | null;
};

export type ControlInstance = {
  control_instance_id: string;
  control_id: string;
  process_execution_id: string;
  step_execution_id: string | null;
  subject_id: string;
  outcome: string;
  fire_ts: string | null;
  latency_ms: number | null;
  evidence_ids: string[];
  exception_id: string | null;
  override_reason: string | null;
  fail_reason: string | null;
  data_gap_reason: string | null;
  evidence_gap_reason: string | null;
};

export type EvidenceRecord = {
  evidence_id: string;
  evidence_type: string;
  source_system_id: string;
  source_record_id: string | null;
  payload_hash: string | null;
  evidence_completeness_score: number;
  evidence_status: string;
  freshness_days: number | null;
  retention_class: string;
  regulator_ready_flags: { rbi_afi: boolean; pmla_rule9: boolean; fiu_finnet: boolean; statutory: boolean; concurrent: boolean };
};

export type ExceptionRecord = {
  exception_id: string;
  exception_type: string;
  severity: string;
  control_instance_id: string;
  root_cause_cluster_id: string | null;
  linked_issue_id: string | null;
  status: string;
  disposition: string;
};

export type Issue = {
  issue_id: string;
  title: string;
  severity: string;
  status: string;
  ageing_days: number;
  accountable_senior_manager_id: string;
  root_cause: string;
  rbi_mra_flag: boolean;
  section_47a_exposure_flag: string | null;
  pmla_exposure_flag: boolean;
  linked_control_ids: string[];
  linked_obligation_ids: string[];
  linked_risk_ids: string[];
  linked_remediation_ids: string[];
  linked_ai_insight_ids: string[];
  opened_at: string;
  closed_at: string | null;
};

export type RemediationAction = {
  action_id: string;
  issue_id: string;
  description: string;
  owner_id: string;
  due_date: string;
  actual_close_date: string | null;
  status: string;
  retest_required: boolean;
  retest_test_execution_id: string | null;
  validation_status: string;
};

export type SeniorManager = {
  senior_manager_id: string;
  name: string;
  role: string;
  function: string;
  accountable_processes: string[];
  accountable_controls: string[];
  accountable_risks: string[];
  accountable_obligations: string[];
  saes: number;
  last_attestation_date: string;
};

export type DecisionEvent = {
  decision_id: string;
  decision_type: string;
  decision_maker_id: string;
  decision_timestamp: string;
  approval_basis: string;
  linked_entity_ref: { type: string; id: string };
  evidence_ids: string[];
};

export type AttestationEvent = {
  attestation_id: string;
  attestation_type: string;
  attester_id: string;
  scope: string;
  period: string;
  evidence_ids: string[];
  signed_at: string;
};

export type TestExecution = {
  test_id: string;
  control_id: string;
  test_type: string;
  population_size: number | null;
  tested_count: number | null;
  exception_count: number | null;
  data_gap_count: number | null;
  evidence_gap_count: number | null;
  result: string;
  rerunnable_flag: boolean;
  population_query_ref: string;
  as_of_date: string | null;
  evidence_ids: string[];
  linked_workpaper_id: string | null;
};

export type Workpaper = {
  workpaper_id: string;
  control_id: string | null;
  obligation_ids: string[];
  test_execution_id: string | null;
  sections: string[];
  population_size: number | null;
  tested_count: number | null;
  exception_count: number;
  evidence_ids: string[];
  tester_id: string;
  reviewer_id: string;
  status: string;
  retest_required: boolean;
  readiness_flags: { rbi_afi: boolean; pmla_rule9: boolean; statutory: boolean; concurrent: boolean };
  signed_at: string | null;
  reviewer_signed_at: string | null;
  signed_by_id: string | null;
  reviewed_by_id: string | null;
};

export type AuditPack = {
  audit_pack_id: string;
  scope_type: string;
  scope_id: string;
  target_audience: string;
  readiness_status: string;
  ars: number;
  included_workpaper_ids: string[];
  included_evidence_ids: string[];
  included_issue_ids: string[];
  included_attestation_ids: string[];
  included_decision_event_ids: string[];
  exported_at: string | null;
  content_hash: string | null;
};

export type AIInsight = {
  ai_insight_id: string;
  signal_id: string;
  signal_class: string;
  title: string;
  model_id: string;
  model_version: string;
  confidence: number;
  threshold: { alert: number; review: number; action: number };
  recommendation: string;
  risk_if_wrong: string;
  cited_evidence_ids: string[];
  cited_source_record_ids: string[];
  linked_control_ids: string[];
  linked_obligation_ids: string[];
  linked_issue_ids: string[];
  human_approval_status: string;
  human_approval_reason: string | null;
  fired_at: string;
};

export type Model = {
  model_id: string;
  model_name: string;
  model_version: string;
  model_type: string;
  training_data_id: string;
  last_validation_date: string;
  drift_metrics: Record<string, number>;
};

export type ModelRiskRecord = {
  mrr_id: string;
  model_id: string;
  validation_date: string;
  validator_id: string;
  validation_outcome: string;
  drift_status: string;
  aites: number;
  governance_committee_ref: string;
};

export type ReportingClock = {
  clock_id: string;
  obligation_id: string | null;
  clock_label: string;
  deadline_spec: string;
  target_system: string;
  current_status: string;
};

export type ReportingSubmission = {
  submission_id: string;
  clock_id: string;
  submitted_at: string | null;
  ack_id: string | null;
  ack_at: string | null;
  status: string;
  evidence_id_for_ack: string | null;
};

export type KRI = {
  kri_id: string;
  name: string;
  linked_risk_id: string;
  threshold_amber: number;
  threshold_red: number;
  unit: string;
  formula_ref: string;
  /** When latest observation is amber/red — narrative for monitoring cards. */
  breach_summary?: string | null;
};

export type KRIObservation = {
  observation_id: string;
  kri_id: string;
  value: number;
  band: string;
  as_of_ts: string;
};

export type AppetiteMetric = {
  appetite_metric_id: string;
  name: string;
  linked_risk_id: string;
  board_approved_threshold: number;
  unit: string;
  formula_ref: string;
};

export type AppetiteObservation = {
  observation_id: string;
  appetite_metric_id: string;
  value: number;
  band: string;
  board_approval_ref: string;
  as_of_ts: string;
};

export type RootCauseCluster = {
  cluster_id: string;
  label: string;
  member_issue_ids: string[];
  member_control_ids: string[];
  member_process_ids: string[];
  cluster_severity: string;
  ai_signal_id: string;
  recommended_remediation_action_ids: string[];
};

export type AuditTrailEvent = {
  audit_trail_event_id: string;
  entity_ref: { type: string; id: string };
  event_type: string;
  system_time: string;
  valid_time: string;
  actor_id: string;
  actor_role: string;
  payload_summary: string;
  payload_diff: { before: Record<string, unknown> | null; after: Record<string, unknown>; fields: string[] } | null;
  content_hash: string;
};

export type InspectionLens = {
  lens_id: string;
  label: string;
  scope_definition: string;
  required_evidence_specs: string[];
  readiness_score_inputs: string[];
  gap_categories: string[];
};

export type SourceSystemHealth = {
  health_id: string;
  source_system_id: string;
  ingestion_lag_ms: number;
  last_successful_ingest_ts: string;
  error_rate: number;
  schema_version_current: string;
  status: string;
  orphan_count: number;
};

export type DemoStorylineStep = {
  step_id: number;
  persona: string;
  screen: string;
  action_label: string;
  highlight_record_ref: { type: string; id: string };
  narrative: string;
};

export type DemoStoryline = {
  storyline_id: string;
  title: string;
  persona_starts_with: string;
  steps: DemoStorylineStep[];
};

/** ORI — RCSA workspace (mock backbone). */
export type RcsaCycle = {
  rcsa_cycle_id: string;
  cycle_name: string;
  fiscal_period_label: string;
  period_start: string;
  period_end: string;
  status: string;
  linked_process_id: string;
  owner_senior_manager_id: string;
  business_unit?: string;
  refresh_cadence?: string;
  target_signoff_at?: string;
};

export type RcsaCell = {
  rcsa_cell_id: string;
  rcsa_cycle_id: string;
  risk_id: string;
  process_id: string;
  control_ids: string[];
  inherent_likelihood: number;
  inherent_impact: number;
  inherent_rating: string;
  control_effectiveness_score: number;
  residual_rating: string;
  residual_trend: string;
  spoc_attested_at?: string | null;
  last_refreshed?: string;
};

export type Incident = {
  incident_id: string;
  incident_type: string;
  severity: string;
  discovered_date: string;
  gross_loss_inr?: number | null;
  recovery_inr?: number | null;
  status: string;
  title: string;
  linked_risk_ids: string[];
  linked_control_ids: string[];
  accountable_senior_manager_id: string;
  fraud_origin?: string;
  conduct_subtype?: string;
  business_unit?: string;
  basel_event_type?: string;
  basel_event_subtype?: string | null;
  description?: string;
  occurred_date?: string;
  reported_date?: string;
  detection_source?: string;
  rbi_reportable?: boolean;
  fmr_filed?: boolean;
  fmr_filed_date?: string | null;
  cert_in_filed_at?: string | null;
  csite_filed_at?: string | null;
  linked_rca_id?: string | null;
};

/** ORI loss register row (mock snake_case). */
export type LossEvent = {
  loss_event_id: string;
  event_date: string;
  gross_loss_inr: number;
  net_loss_inr: number;
  direct_recovery_inr: number;
  insurance_recovery_inr: number;
  recovery_inr?: number;
  business_line: string;
  basel_event_type: string;
  loss_event_type: string;
  loss_event_subtype?: string | null;
  business_unit: string;
  status: string;
  linked_risk_id: string;
  linked_control_ids: string[];
  linked_incident_id?: string | null;
  accountable_senior_manager_id: string;
};

export type RcaRecord = {
  rca_id: string;
  incident_id: string;
  status?: string;
  opened_at?: string;
  rca_started_at?: string | null;
  rca_completed_at?: string | null;
  owner_senior_manager_id?: string;
  five_whys_steps?: { step_order: number; statement: string }[];
  methodology?: string;
  root_cause_categories?: string[];
  root_cause_summary?: string;
  lessons_learnt?: string;
};

export type PreventiveAction = {
  preventive_action_id: string;
  rca_id: string;
  status: string;
  target_date?: string;
  title?: string;
  owner_senior_manager_id?: string;
  linked_pac_note_block_flag?: boolean;
  /** When the PA moved to closed (for weekly deltas / velocity). */
  closed_at?: string | null;
};

export type PacNoteComment = { at: string; author_role: string; text: string };

export type PacNote = {
  pac_note_id: string;
  title?: string;
  document_version?: string;
  blocking_preventive_action_ids: string[];
  referenced_rca_ids: string[];
  status?: string;
  document_type?: string;
  business_unit?: string;
  submitted_by_role?: string;
  submitted_at?: string;
  target_approval_date?: string;
  approved_at?: string | null;
  accountable_senior_manager_id?: string;
  linked_obligation_ids?: string[];
  linked_process_ids?: string[];
  comments?: PacNoteComment[];
};

// Dataset exports
export const personas: Persona[] = M.personas;
export const navigationItems: NavigationItem[] = M.navigationItems;
export const screens: Screen[] = M.screens;
export const metrics: Metric[] = M.metrics;
export const riskDomains: RiskDomain[] = M.riskDomains;
export const risks: Risk[] = M.risks;
export const regulations: Regulation[] = M.regulations;
export const obligations: Obligation[] = M.obligations;
export const controls: Control[] = M.controls;
export const processes: Process[] = M.processes;
export const processSteps: ProcessStep[] = M.processSteps;
export const sourceSystems: SourceSystem[] = M.sourceSystems;
export const sourceRecords: SourceRecord[] = M.sourceRecords;
export const correlationRecords: CorrelationRecord[] = M.correlationRecords;
export const processExecutions: ProcessExecution[] = M.processExecutions;
export const stepExecutions: StepExecution[] = M.stepExecutions;
export const controlInstances: ControlInstance[] = M.controlInstances;
export const evidenceRecords: EvidenceRecord[] = M.evidenceRecords;
export const exceptionRecords: ExceptionRecord[] = M.exceptions;
export const issues: Issue[] = M.issues;
export const remediationActions: RemediationAction[] = M.remediationActions;
export const seniorManagers: SeniorManager[] = M.seniorManagers;
export const decisionEvents: DecisionEvent[] = M.decisionEvents;
export const attestationEvents: AttestationEvent[] = M.attestationEvents;
export const testExecutions: TestExecution[] = M.testExecutions;
export const workpapers: Workpaper[] = M.workpapers;
export const auditPacks: AuditPack[] = M.auditPacks;
export const aiInsights: AIInsight[] = M.aiInsights;
export const models: Model[] = M.models;
export const modelRiskRecords: ModelRiskRecord[] = M.modelRiskRecords;
export const reportingClocks: ReportingClock[] = M.reportingClocks;
export const reportingSubmissions: ReportingSubmission[] = M.reportingSubmissions;
export const kris: KRI[] = M.kris;
export const kriObservations: KRIObservation[] = M.kriObservations;
export const appetiteMetrics: AppetiteMetric[] = M.appetiteMetrics;
export const appetiteObservations: AppetiteObservation[] = M.appetiteObservations;
export const rootCauseClusters: RootCauseCluster[] = M.rootCauseClusters;
export const auditTrailEvents: AuditTrailEvent[] = M.auditTrailEvents;
export const inspectionLenses: InspectionLens[] = M.inspectionLenses;
export const sourceSystemHealth: SourceSystemHealth[] = M.sourceSystemHealth;
export const demoStorylines: DemoStoryline[] = M.demoStorylines;
export const rcsaCycles: RcsaCycle[] = Array.isArray(M.rcsaCycles) ? M.rcsaCycles : [];
export const rcsaCells: RcsaCell[] = Array.isArray(M.rcsaCells) ? M.rcsaCells : [];
export const incidents: Incident[] = Array.isArray(M.incidents) ? M.incidents : [];
export const rcas: RcaRecord[] = Array.isArray(M.rcas) ? M.rcas : [];
export const preventiveActions: PreventiveAction[] = Array.isArray(M.preventiveActions) ? M.preventiveActions : [];
export const pacNotes: PacNote[] = Array.isArray(M.pacNotes) ? M.pacNotes : [];
export const lossEvents: LossEvent[] = Array.isArray(M.lossEvents) ? M.lossEvents : [];

// Generic finder
export function findBy<T>(arr: T[], key: keyof T, id: string | null | undefined): T | null {
  if (id == null) return null;
  return arr.find((row) => (row as unknown as Record<string, unknown>)[key as string] === id) || null;
}

// Strongly-typed accessors for common entities
export const getPersona = (id: string | null) => findBy(personas, 'persona_id', id);
export const getRisk = (id: string | null) => findBy(risks, 'risk_id', id);
export const getRiskDomain = (id: string | null) => findBy(riskDomains, 'domain_id', id);
export const getControl = (id: string | null) => findBy(controls, 'control_id', id);
export const getControlInstance = (id: string | null) => findBy(controlInstances, 'control_instance_id', id);
export const getObligation = (id: string | null) => findBy(obligations, 'obligation_id', id);
export const getRegulation = (id: string | null) => findBy(regulations, 'regulation_id', id);
export const getProcess = (id: string | null) => findBy(processes, 'process_id', id);
export const getProcessStep = (id: string | null) => findBy(processSteps, 'step_id', id);
export const getProcessExecution = (id: string | null) => findBy(processExecutions, 'process_execution_id', id);
export const getStepExecution = (id: string | null) => findBy(stepExecutions, 'step_execution_id', id);
export const getEvidence = (id: string | null) => findBy(evidenceRecords, 'evidence_id', id);
export const getSourceRecord = (id: string | null) => findBy(sourceRecords, 'source_record_id', id);
export const getCorrelation = (id: string | null) => findBy(correlationRecords, 'correlation_id', id);
export const getException = (id: string | null) => findBy(exceptionRecords, 'exception_id', id);
export const getIssue = (id: string | null) => findBy(issues, 'issue_id', id);
export const getIncident = (id: string | null) => findBy(incidents, 'incident_id', id);
export const getLossEvent = (id: string | null) => findBy(lossEvents, 'loss_event_id', id);
export const getRca = (id: string | null) => findBy(rcas, 'rca_id', id);
export const getPreventiveAction = (id: string | null) => findBy(preventiveActions, 'preventive_action_id', id);
export const getPacNote = (id: string | null) => findBy(pacNotes, 'pac_note_id', id);
export const getRemediation = (id: string | null) => findBy(remediationActions, 'action_id', id);
export const getSeniorManager = (id: string | null) => findBy(seniorManagers, 'senior_manager_id', id);
export const getDecision = (id: string | null) => findBy(decisionEvents, 'decision_id', id);
export const getAttestation = (id: string | null) => findBy(attestationEvents, 'attestation_id', id);
export const getInsight = (id: string | null) => findBy(aiInsights, 'ai_insight_id', id);
export const getModel = (id: string | null) => findBy(models, 'model_id', id);
export const getMRR = (id: string | null) => findBy(modelRiskRecords, 'mrr_id', id);
export const getTest = (id: string | null) => findBy(testExecutions, 'test_id', id);
export const getWorkpaper = (id: string | null) => findBy(workpapers, 'workpaper_id', id);
export const getAuditPack = (id: string | null) => findBy(auditPacks, 'audit_pack_id', id);
export const getReportingClock = (id: string | null) => findBy(reportingClocks, 'clock_id', id);
export const getReportingSubmission = (id: string | null) => findBy(reportingSubmissions, 'submission_id', id);
export const getKRI = (id: string | null) => findBy(kris, 'kri_id', id);
export const getAppetite = (id: string | null) => findBy(appetiteMetrics, 'appetite_metric_id', id);
export const getCluster = (id: string | null) => findBy(rootCauseClusters, 'cluster_id', id);
export const getInspectionLens = (id: string | null) => findBy(inspectionLenses, 'lens_id', id);
export const getSourceSystem = (id: string | null) => findBy(sourceSystems, 'source_system_id', id);
export const getSourceSystemHealth = (sysId: string | null) =>
  sourceSystemHealth.find((h) => h.source_system_id === sysId) || null;

// Cross-entity selectors
export const controlInstancesForControl = (controlId: string) =>
  controlInstances.filter((ci) => ci.control_id === controlId);

export const evidenceForControlInstance = (ci: ControlInstance) =>
  ci.evidence_ids.map((id) => getEvidence(id)).filter((e): e is EvidenceRecord => e != null);

export const stepExecutionsForExecution = (peId: string) =>
  stepExecutions.filter((se) => se.process_execution_id === peId);

export const correlationsForSourceRecord = (srId: string) =>
  correlationRecords.filter((c) => c.from_entity_id === srId || c.to_entity_id === srId);

export const aiInsightsForControl = (ctrlId: string) =>
  aiInsights.filter((a) => a.linked_control_ids.includes(ctrlId));

export const issuesForControl = (ctrlId: string) =>
  issues.filter((i) => i.linked_control_ids.includes(ctrlId));

export const issuesForSeniorManager = (smId: string) =>
  issues.filter((i) => i.accountable_senior_manager_id === smId);

/** Issues still open or in remediation that cite this risk. */
export const openIssuesForRisk = (riskId: string) =>
  issues.filter(
    (i) =>
      (i.status === 'open' || i.status === 'in_remediation') &&
      Array.isArray(i.linked_risk_ids) &&
      i.linked_risk_ids.includes(riskId)
  );

/** Controls linked via risk record, reverse linkage, or RCSA cells. */
export const controlsForRisk = (riskId: string): Control[] => {
  const ids = new Set<string>();
  const risk = getRisk(riskId);
  if (risk) {
    for (const id of risk.linked_control_ids) ids.add(id);
  }
  for (const c of controls) {
    if (c.linked_risks.includes(riskId)) ids.add(c.control_id);
  }
  for (const cell of rcsaCells) {
    if (cell.risk_id !== riskId) continue;
    for (const id of cell.control_ids) ids.add(id);
  }
  return Array.from(ids)
    .map((id) => getControl(id))
    .filter((c): c is Control => c != null);
};

/** Most recent population / design test for a control (excludes pending retests). */
export const latestTestExecutionForControl = (controlId: string): TestExecution | null => {
  const rows = testExecutions
    .filter((t) => t.control_id === controlId && t.test_type !== 'retest' && t.as_of_date)
    .sort((a, b) => (a.as_of_date! < b.as_of_date! ? 1 : -1));
  return rows[0] ?? null;
};

/** Incidents citing this risk, discovered within the last N calendar days (default 90). */
export const incidentsForRiskWithinDays = (riskId: string, days = 90): Incident[] => {
  const cutoff = Date.now() - days * 86400000;
  return incidents
    .filter((inc) => {
      if (!Array.isArray(inc.linked_risk_ids) || !inc.linked_risk_ids.includes(riskId)) return false;
      const t = new Date(inc.discovered_date).getTime();
      return !Number.isNaN(t) && t >= cutoff;
    })
    .sort((a, b) => (a.discovered_date < b.discovered_date ? 1 : -1));
};

export const rcsaCellsForRisk = (riskId: string): RcsaCell[] =>
  rcsaCells.filter((c) => c.risk_id === riskId);

const incidentById: Record<string, Incident> = {};
for (const inc of incidents) {
  incidentById[inc.incident_id] = inc;
}

/** Median calendar days from RCA start to completion (completed RCAs only). */
export const medianRcaCycleTimeDays = (): number | null => {
  const durations = rcas
    .filter((r) => r.rca_completed_at && r.rca_started_at)
    .map((r) => {
      const end = new Date(r.rca_completed_at as string).getTime();
      const start = new Date(r.rca_started_at as string).getTime();
      return (end - start) / 86400000;
    });
  if (!durations.length) return null;
  durations.sort((a, b) => a - b);
  const mid = Math.floor(durations.length / 2);
  if (durations.length % 2 === 1) return Math.round(durations[mid] * 10) / 10;
  return Math.round(((durations[mid - 1] + durations[mid]) / 2) * 10) / 10;
};

/** Open / in-progress preventive actions whose RCA’s incident links this risk_id. */
export const openPreventiveActionCountForRisk = (riskId: string): number => {
  const openPa = (s: string) => s === 'open' || s === 'in_progress';
  return preventiveActions.filter((pa) => {
    if (!openPa(pa.status)) return false;
    const rca = rcas.find((r) => r.rca_id === pa.rca_id);
    if (!rca) return false;
    const inc = incidentById[rca.incident_id];
    const ids = inc?.linked_risk_ids;
    return Array.isArray(ids) && ids.includes(riskId);
  }).length;
};

export const obligationsForRegulator = (regulator: string) =>
  obligations.filter((o) => {
    const reg = getRegulation(o.regulation_id);
    return reg?.regulator === regulator;
  });

export const controlsForObligation = (obId: string) =>
  controls.filter((c) => c.linked_obligations.includes(obId));

export const remediationsForIssue = (issueId: string) =>
  remediationActions.filter((r) => r.issue_id === issueId);

export const decisionsForSeniorManager = (smId: string) =>
  decisionEvents.filter((d) => d.decision_maker_id === smId);

export const attestationsForSeniorManager = (smId: string) =>
  attestationEvents.filter((a) => a.attester_id === smId);

export const submissionsForClock = (clockId: string) =>
  reportingSubmissions.filter((s) => s.clock_id === clockId);

export const observationsForKRI = (kriId: string) =>
  kriObservations
    .filter((o) => o.kri_id === kriId)
    .sort((a, b) => (a.as_of_ts < b.as_of_ts ? -1 : 1));

/** KRIs with at least one observation (active in monitoring). */
export const activeKriCount = (): number => {
  return kris.filter((k) => observationsForKRI(k.kri_id).length > 0).length;
};

/** Latest observation at or beyond amber threshold. */
export function isKriAtOrAboveAmber(k: KRI, asOfTs?: number): boolean {
  const obs = observationsForKRI(k.kri_id);
  if (!obs.length) return false;
  const last = asOfTs != null ? pickKriObsAtOrBefore(obs, asOfTs) : obs[obs.length - 1];
  return last != null && last.value >= k.threshold_amber;
}

function pickKriObsAtOrBefore(obs: KRIObservation[], asOfTs: number): KRIObservation | null {
  let pick: KRIObservation | null = null;
  for (const o of obs) {
    const t = new Date(o.as_of_ts).getTime();
    if (t <= asOfTs && (!pick || t > new Date(pick.as_of_ts).getTime())) pick = o;
  }
  return pick;
}

/** Count and % of active KRIs at or above amber on latest observation. */
export const aggregateKRIBreachCounts = (asOfTs?: number) => {
  const active = kris.filter((k) => {
    const obs = observationsForKRI(k.kri_id);
    if (!obs.length) return false;
    if (asOfTs == null) return true;
    return obs.some((o) => new Date(o.as_of_ts).getTime() <= asOfTs);
  });
  const atAmber = active.filter((k) => isKriAtOrAboveAmber(k, asOfTs)).length;
  const total = active.length;
  const pct = total ? Math.round((100 * atAmber) / total) : 0;
  return { atAmber, total, pct };
};

/** % of KRIs whose latest observation value is at or beyond amber threshold (ORM breach band). */
export const aggregateKRIBreachRatePct = (): number => aggregateKRIBreachCounts().pct;

/** Breach count grouped by risk domain code (for KPI tooltip). */
export const kriBreachCountByDomain = (asOfTs?: number): { domainId: string; count: number }[] => {
  const map = new Map<string, number>();
  for (const k of kris) {
    if (!isKriAtOrAboveAmber(k, asOfTs)) continue;
    const risk = getRisk(k.linked_risk_id);
    const domainId = risk?.domain_id ?? '—';
    map.set(domainId, (map.get(domainId) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([domainId, count]) => ({ domainId, count }))
    .sort((a, b) => b.count - a.count || a.domainId.localeCompare(b.domainId));
};

const INCIDENT_CLOSED_AGG = new Set(['closed', 'closed_no_loss']);

function parseYmdLocalAgg(ymd: string): number {
  return new Date(ymd.includes('T') ? ymd : `${ymd}T12:00:00`).getTime();
}

/** Open incidents in last 30d window with escalated subset (ORM taxonomy). */
export const aggregateOpenIncidents30dDetail = () => {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - 30);
  const t0 = cutoff.getTime();

  const inWindow = incidents.filter((i) => {
    if (INCIDENT_CLOSED_AGG.has(i.status)) return false;
    return parseYmdLocalAgg(i.discovered_date) >= t0;
  });

  const escalated = inWindow.filter(isIncidentEscalated).length;
  return { open: inWindow.length, escalated };
};

export function isIncidentEscalated(i: Incident): boolean {
  const status = (i.status || '').toLowerCase();
  if (status.includes('escalat')) return true;
  if (i.fmr_filed) return true;
  if ((i.severity === 'high' || i.severity === 'critical') && i.rbi_reportable) return true;
  return false;
}

/** Open incidents with discovered_at in the last 30 calendar days. */
export const aggregateOpenIncidents30d = (): number => aggregateOpenIncidents30dDetail().open;

/** Latest ingestion / observation timestamp for posture aggregates (floored to refresh cadence). */
export const getPostureDataRefreshAt = (cadenceMinutes = 15): Date => {
  let max = 0;
  for (const o of kriObservations) {
    max = Math.max(max, new Date(o.as_of_ts).getTime());
  }
  for (const o of appetiteObservations) {
    max = Math.max(max, new Date(o.as_of_ts).getTime());
  }
  for (const s of reportingSubmissions) {
    if (s.submitted_at) max = Math.max(max, new Date(s.submitted_at).getTime());
  }
  if (!max) max = Date.now();
  const cadenceMs = cadenceMinutes * 60 * 1000;
  const floored = Math.floor(max / cadenceMs) * cadenceMs;
  return new Date(floored);
};

/** Preventive actions still open and past target_date (strict status = open). */
export const aggregateOverdueOpenPreventiveActions = (): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const t0 = today.getTime();
  return preventiveActions.filter((pa) => {
    if (pa.status !== 'open') return false;
    if (!pa.target_date) return false;
    const t = parseYmdLocalAgg(pa.target_date);
    return !Number.isNaN(t) && t < t0;
  }).length;
};

/** Net loss as % of gross for FY26 loss register rows (Apr 2025–Mar 2026). */
export const aggregateORLR = (): number | null => {
  const fyStart = '2025-04-01';
  const fyEnd = '2026-03-31';
  const rows = lossEvents.filter((e) => e.event_date >= fyStart && e.event_date <= fyEnd);
  const gross = rows.reduce((s, e) => s + (e.gross_loss_inr || 0), 0);
  if (!gross) return null;
  const net = rows.reduce((s, e) => s + (e.net_loss_inr ?? e.gross_loss_inr), 0);
  return Math.round((1000 * net) / gross) / 10;
};

/** Mean days from incident discovery to RCA completion (completed RCAs only). */
export const aggregateINCV = (): number | null => {
  let sum = 0;
  let n = 0;
  for (const r of rcas) {
    if (!r.rca_completed_at) continue;
    const inc = getIncident(r.incident_id);
    if (!inc) continue;
    const d0 = parseYmdLocalAgg(inc.discovered_date);
    const d1 = new Date(r.rca_completed_at).getTime();
    if (Number.isNaN(d0) || Number.isNaN(d1) || d1 < d0) continue;
    sum += (d1 - d0) / 86400000;
    n += 1;
  }
  if (!n) return null;
  return Math.round((sum / n) * 10) / 10;
};

/** Mean calendar days from PAC submission to approval (notes with approved_at). */
export const aggregatePACV = (): number | null => {
  const vals: number[] = [];
  for (const pn of pacNotes) {
    if (!pn.approved_at || !pn.submitted_at) continue;
    const a = new Date(pn.approved_at).getTime();
    const b = new Date(pn.submitted_at).getTime();
    if (Number.isNaN(a) || Number.isNaN(b) || a < b) continue;
    vals.push((a - b) / 86400000);
  }
  if (!vals.length) return null;
  const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
  return Math.round(avg * 10) / 10;
};

/** % of open / in-progress preventive actions that are past target_date. */
export const aggregatePOAOR = (): number | null => {
  const openish = preventiveActions.filter((p) => p.status === 'open' || p.status === 'in_progress');
  if (!openish.length) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const t0 = today.getTime();
  const overdue = openish.filter((pa) => {
    if (!pa.target_date) return false;
    const t = parseYmdLocalAgg(pa.target_date);
    return !Number.isNaN(t) && t < t0;
  }).length;
  return Math.round((100 * overdue) / openish.length);
};

export const observationsForAppetite = (apId: string) =>
  appetiteObservations
    .filter((o) => o.appetite_metric_id === apId)
    .sort((a, b) => (a.as_of_ts < b.as_of_ts ? -1 : 1));

export const auditTrailForEntity = (type: string, id: string) =>
  auditTrailEvents
    .filter((e) => e.entity_ref.type === type && e.entity_ref.id === id)
    .sort((a, b) => (a.system_time < b.system_time ? -1 : 1));

// Aggregate / derived metric helpers
export const aggregateRES = () => {
  const total = risks.reduce((s, r) => s + r.res_score, 0);
  return Math.round(total / Math.max(1, risks.length));
};

export const aggregateARS = () => {
  const total = auditPacks.reduce((s, p) => s + p.ars, 0);
  return Math.round(total / Math.max(1, auditPacks.length));
};

export const aggregateCES = () => {
  const valid = controls.filter((c) => c.ces != null).map((c) => c.ces as number);
  if (!valid.length) return null;
  return Math.round((valid.reduce((s, v) => s + v, 0) / valid.length) * 10) / 10;
};

export const aggregateOCS = () => {
  if (!obligations.length) return 0;
  const covered = obligations.filter((o) => o.linked_control_ids.length > 0);
  const passingControls = controls.filter((c) => c.ces != null && (c.ces as number) >= 80).length;
  const totalControls = controls.filter((c) => c.ces != null).length;
  const coverageRatio = covered.length / obligations.length;
  const strengthRatio = totalControls ? passingControls / totalControls : 0;
  return Math.round((coverageRatio * 0.6 + strengthRatio * 0.4) * 100);
};

export const aggregateEIFS = () => {
  if (!evidenceRecords.length) return 0;
  const complete = evidenceRecords.filter((e) => e.evidence_status === 'Complete').length;
  return Math.round((complete / evidenceRecords.length) * 100);
};

export const aggregateRTS = () => {
  const required = reportingSubmissions.length;
  if (!required) return 100;
  const onTime = reportingSubmissions.filter((s) => s.status === 'on_time').length;
  return Math.round((onTime / required) * 100);
};

export const aggregateSAES = () => {
  if (!seniorManagers.length) return 0;
  return Math.round(seniorManagers.reduce((s, m) => s + m.saes, 0) / seniorManagers.length);
};

export const aggregateAITES = () => {
  if (!modelRiskRecords.length) return 0;
  return Math.round(modelRiskRecords.reduce((s, m) => s + m.aites, 0) / modelRiskRecords.length);
};

export const aggregateDCQS = () => {
  const total = correlationRecords.length;
  if (!total) return 0;
  const matched = correlationRecords.filter(
    (c) => c.correlation_status === 'matched' || c.correlation_status === 'matched_with_warning'
  ).length;
  return Math.round((matched / total) * 100);
};

export const aggregatePVDS = () => {
  const valid = processes.filter((p) => p.pvds != null).map((p) => p.pvds as number);
  if (!valid.length) return 0;
  return Math.round(valid.reduce((s, v) => s + v, 0) / valid.length);
};

export const pendingAIInsights = () => aiInsights.filter((a) => a.human_approval_status === 'pending');

export const wave1NavItems = () => navigationItems.filter((n) => n.wave === 1 && n.enabled_flag);

export const navItemsForPersona = (personaCode: string) =>
  navigationItems.filter(
    (n) => n.enabled_flag && (n.persona_default_for.includes(personaCode) || n.wave === 1)
  );
