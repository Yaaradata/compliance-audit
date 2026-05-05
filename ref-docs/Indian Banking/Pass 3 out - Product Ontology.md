Core Product Ontology — Knowledge Graph for AI-Driven Risk & Compliance Platform
Pass 3 — RegTech / Data / AI Architecture Brief
Personas: RegTech Product Architect | Data Architect (Graph) | AI Systems Architect | Cut-off: April 2026

0. Conventions and IDs (extending Pass 1 + Pass 2)
This pass introduces the runtime entity IDs and event/edge IDs that make the graph executable.
FamilyPatternExampleOriginRegulationREG-<SOURCE>-<NAME>-<YEAR>REG-RBI-MD-KYC-2025Pass 3 (new)ObligationOBL-<SOURCE>-NNNOBL-RBI-001Pass 1RiskR-<DOMAIN>-NNNR-FC-001Pass 1ProcessPROC-<DOMAIN>-NNNPROC-KYC-001Pass 2ProcessExecutionPE-<PROC_REF>-<TS>-<SUBJECT>PE-PROC-KYC-001-2026-04-15T09-22Z-UCIC1234567Pass 3 (new, runtime)ProcessStepSTEP-<PROC>-NNSTEP-KYC-03Pass 2StepExecutionSE-<STEP_REF>-<TS>-<PE_REF>SE-STEP-KYC-03-2026-04-15T09-24Z-PE-...Pass 3 (new, runtime)ControlCTRL-<DOMAIN>-NNNCTRL-KYC-001Pass 2ControlInstanceCI-<CTRL_REF>-<TS>-<SHARD>CI-CTRL-KYC-001-2026-04-15T10-32-04Z-s12Pass 2EvidenceRecordEV-<TYPE>-<NNN>EV-LOG-9981234, EV-DOC-...Pass 3 (new)IssueISS-YYYY-NNNISS-2026-009Pass 2ActionTaskAT-<ISSUE_REF>-NNAT-ISS-2026-009-01Pass 3 (new)EventEVT-<AGG_TYPE>-<NNN>EVT-CTRL-INSTANCE-FIRED-...Pass 3 (new)Edge type:UPPERCASE_VERB:COVERS, :INSTANCE_OFPass 3 (new)
Architectural invariants referenced throughout:

Design-time entities are versioned, slow-moving, declarative.
Run-time entities are append-only, high-volume, derived from real execution.
The graph is bi-temporal: every fact has both valid_time (when it was true in the world) and system_time (when the platform knew it).
Every state change is an event. Current state is a projection; historical state is a replay.
AI outputs are first-class graph nodes (with confidence and provenance), not opaque side effects.


1. Entity Definitions
1.1 Layer split
LayerEntitiesVolumeUpdate patternDesign-time (canonical)Regulation, Obligation, Risk, Process, ProcessStep, Activity, Control, AppetiteMetric, KRI10²–10⁴ per layerVersioned; amended on regulatory or internal changeRun-time (instantiated)ProcessExecution, StepExecution, ControlInstance, EvidenceRecord10⁶–10⁹ per monthAppend-only event logLifecycle (governed)Issue, ActionTask, AIInsight10³–10⁵ per yearState machine with event logCross-cuttingSubject (Customer / Loan / Alert / Vendor / Change), Actor, AppetiteMetric snapshot, RiskRatingSnapshotmixedMixed
The design-time / run-time split is the single most load-bearing architectural choice. It is what enables the platform to answer two very different question classes: "What should be true?" (design) and "What was actually true at moment T?" (runtime).
1.2 Design-time entities
Regulation {
  id                  : string         // REG-RBI-MD-KYC-2025
  title               : string
  source              : enum           // RBI | PMLA | FIU | SEBI | IRDAI | CERT_IN | DPDP | UAPA | NPCI
  citation            : string         // full circular reference
  issued_at           : date
  effective_from      : date
  effective_to        : date | null
  status              : enum           // active | superseded | withdrawn
  supersedes          : list<Regulation.id>
  superseded_by       : Regulation.id | null
  parent_regulation   : Regulation.id | null    // for amendments
  source_uri          : string
  version             : int
  last_amended_at     : date
  raw_text_blob       : URI                     // stored for AI re-ingestion
}

Obligation {
  id                       : string             // OBL-RBI-001
  regulation_id            : Regulation.id
  citation                 : string             // section / clause
  atomic_requirement       : string
  jurisdiction             : enum               // India | US | UK | Cross-border
  applicability            : list<archetype>    // [MSPB, PSU, SFB, FBB, NBFC]
  evidence_expectation     : string
  frequency                : enum
  effective_from           : date
  effective_to             : date | null
  version                  : int
  parent_obligation_id     : Obligation.id | null
  interpretation_status    : enum               // ratified | provisional | disputed
  ai_confidence            : float | null       // populated when AI-extracted, awaiting human review
  ai_source_event_id       : Event.id | null
}

Risk {
  id                       : string             // R-FC-001
  domain                   : enum               // CR | OP | CO | CD | TC | FC | TP | FR | MR
  title                    : string
  description              : string
  inherent_likelihood      : enum               // VH | H | M | L
  inherent_impact          : enum
  inherent_rating          : enum               // computed but cached
  parent_risk_id           : Risk.id | null
  owner_actor_id           : Actor.id
  appetite_metric_id       : AppetiteMetric.id | null
  version                  : int
  // residual_rating is COMPUTED at query time — not stored on Risk;
  // it is a function of (inherent_rating, ControlInstance health, open Issues, KRI state) AS OF a given time
}

Process {
  id                          : string          // PROC-KYC-001
  name                        : string
  domain                      : string
  owner_role                  : string
  jurisdictions               : list<jurisdiction>
  step_ids                    : list<ProcessStep.id>
  documented_variant_signature: hash             // canonical step-order hash for conformance check
  version                     : int
  effective_from              : date
}

ProcessStep {
  id                          : string          // STEP-KYC-03
  process_id                  : Process.id
  step_order                  : int
  name                        : string
  step_type                   : enum            // system | manual | judgemental | hybrid
  expected_actor_role         : string
  expected_systems            : list<system_type>
  expected_inputs             : list<DataSchema.id>
  expected_outputs            : list<DataSchema.id>
  preceding_step_ids          : list<ProcessStep.id>
  succeeding_step_ids         : list<ProcessStep.id>
  bpo_involvement_default     : enum            // none | low | medium | heavy
  expected_duration           : duration
  evidence_expectations       : list<EvidenceType>
  version                     : int
}

Activity {
  id                       : string             // ACT-KYC-03-02
  step_id                  : ProcessStep.id
  activity_order           : int
  name                     : string
  expected_actor_role      : string
  expected_system          : system_type
  evidence_expectations    : list<EvidenceType>
  version                  : int
}

Control {
  id                       : string             // CTRL-KYC-001
  title                    : string
  description              : string
  process_id               : Process.id
  process_step_id          : ProcessStep.id
  control_type             : enum               // Preventive | Detective | Corrective
  control_nature           : enum               // Manual | Automated | ITDM
  frequency                : enum
  designed_condition       : predicate          // formal: when it should fire
  operating_signal_spec    : spec               // declarative: what shows it fired
  effectiveness_signal_spec: spec               // declarative: what shows it worked
  obligation_ids           : list<Obligation.id>
  risk_ids                 : list<Risk.id>
  owner_role               : string             // 1LoD
  operator_role            : string
  oversight_role           : string             // 2LoD
  audit_cycle              : enum               // 3LoD
  evidence_expectations    : list<EvidenceType>
  status                   : enum               // active | retired | pending
  version                  : int
  effective_from           : date
  effective_to             : date | null
  supersedes               : Control.id | null
}
1.3 Run-time entities (append-only, event-sourced)
ProcessExecution {
  id                       : string             // PE-PROC-KYC-001-2026-04-15T09-22Z-UCIC1234567
  process_id               : Process.id
  process_version          : string             // pinned at start
  subject_type             : enum               // customer | loan | alert | vendor | change | transaction | complaint
  subject_id               : string
  initiated_at             : timestamp
  completed_at             : timestamp | null
  current_status           : enum               // in_progress | completed | abandoned | exception
  current_step_id          : ProcessStep.id
  variant_signature        : hash               // computed from actual step sequence
  drift_score              : float              // 0-1, populated by process mining
  metadata                 : map
}

StepExecution {
  id                       : string             // SE-STEP-KYC-03-...
  process_execution_id     : ProcessExecution.id
  step_id                  : ProcessStep.id
  step_version             : string             // pinned at start
  start_ts                 : timestamp
  end_ts                   : timestamp | null
  actual_actor_id          : Actor.id           // could be system_account or human
  actual_actor_type        : enum
  actual_system            : enum
  inputs_snapshot_ref      : URI
  outputs_snapshot_ref     : URI
  status                   : enum               // started | completed | exception | skipped | reverted
  drift_flag               : bool
  drift_reason             : enum | null        // unexpected_actor | unexpected_system | step_skipped | order_violated
  evidence_record_ids      : list<EvidenceRecord.id>
  upstream_step_execution  : StepExecution.id | null
}

ControlInstance {
  id                       : string             // CI-CTRL-KYC-001-...
  control_id               : Control.id
  control_version          : string             // pinned at start
  step_execution_id        : StepExecution.id
  process_execution_id     : ProcessExecution.id
  subject_type             : enum
  subject_id               : string
  start_ts                 : timestamp
  end_ts                   : timestamp
  actor_id                 : Actor.id
  actor_type               : enum
  system                   : enum
  expected_to_fire         : bool               // derived from designed_condition predicate
  fired                    : bool
  caught_what_designed     : enum               // true | false | n/a
  status                   : enum               // pass | fail | exception | override | pending
  exception_disposition    : enum | null
  override_actor_id        : Actor.id | null
  override_reason          : enum | null
  evidence_record_ids      : list<EvidenceRecord.id>
  upstream_instance_refs   : list<ControlInstance.id>
  latency_ms               : int
  metadata                 : map                // control-specific (hit_count, list_version, etc.)
}

EvidenceRecord {
  id                       : string             // EV-LOG-9981234
  type                     : enum               // LOG | DOC | ATTEST | SIGN | RECON | CALL | IMG | BIO
  source_system            : enum
  timestamp                : timestamp          // when the evidenced event happened
  ingested_at              : timestamp          // when the platform received it
  payload_uri              : URI
  hash                     : string
  hash_verified            : bool
  schema_id                : DataSchema.id | null   // for structured payloads
  parsed_payload_ref       : URI | null         // post-AI extraction
  control_instance_ids     : list<ControlInstance.id>
  step_execution_id        : StepExecution.id | null
  classification           : enum               // public | internal | confidential | restricted
  retention_class          : enum               // regulatory | tax | hr | operational
  signed_by                : list<Actor.id>     // for ATTEST / SIGN types
  completeness_score       : float              // 0-1, computed
  collection_method        : enum               // auto | manual_upload | workflow_attestation
  metadata                 : map
}
1.4 Governed lifecycle entities
Issue {
  id                       : string             // ISS-2026-009
  title                    : string
  description              : string
  source                   : enum               // internal_audit | regulatory | self | 2lod_qa | 3lod | external | ai_detected
  severity                 : enum               // High | Medium | Low
  raised_at                : timestamp
  raised_by                : Actor.id
  due_at                   : timestamp
  closed_at                : timestamp | null
  status                   : enum               // open | in_remediation | in_validation | closed | past_due
  root_cause_category      : enum
  related_control_ids               : list<Control.id>
  related_control_instance_ids      : list<ControlInstance.id>   // failing CIs that surfaced the issue
  related_risk_ids                  : list<Risk.id>
  related_obligation_ids            : list<Obligation.id>
  action_task_ids                   : list<ActionTask.id>
  ai_detected                       : bool
  ai_confidence                     : float | null
  version                  : int
  // history is reconstructed from events, not stored as nested list
}

ActionTask {
  id                       : string             // AT-ISS-2026-009-01
  issue_id                 : Issue.id
  description              : string
  owner_actor_id           : Actor.id
  due_at                   : timestamp
  status                   : enum               // open | in_progress | completed | overdue | abandoned
  evidence_record_ids      : list<EvidenceRecord.id>   // proof of completion
  completed_at             : timestamp | null
  validated_by             : Actor.id | null    // 2LoD validator
}

AIInsight {
  id                       : string             // AIINS-2026-...
  insight_type             : enum               // anomaly | drift | coverage_gap | effectiveness_decay | clustering | classification | extraction
  produced_by_model_id     : Model.id
  model_version            : string
  produced_at              : timestamp
  confidence               : float              // 0-1
  subject_node_id          : string             // graph node this insight is about
  subject_node_type        : string
  payload                  : map                // insight-specific
  human_review_status      : enum               // pending | accepted | rejected | overridden
  reviewed_by              : Actor.id | null
  reviewed_at              : timestamp | null
  resulting_issue_id       : Issue.id | null    // if the insight created an issue
  resulting_action_id      : string | null
}
1.5 Cross-cutting
Actor {
  id              : string                       // emp_id or system_account_id or BPO_user_id
  type            : enum                         // human | system | tpsp | ai_model | regulator
  role            : string
  organisational_unit : string
  // Actors are first-class graph nodes — every ControlInstance, StepExecution, IssueEvent points to one
}

Subject {
  // a polymorphic anchor: customer, loan, alert, vendor, change_ticket, transaction, complaint
  id              : string
  type            : enum
  // every ProcessExecution and ControlInstance has a subject
  // this is the join key for "show me everything that happened to customer X"
}

AppetiteMetric {
  id                  : string                   // APP-FC-001
  risk_domain         : enum
  metric_definition   : string
  green_band          : range
  amber_band          : range
  red_band            : range
  current_band        : enum                     // computed snapshot
  current_value       : value
  owner_actor_id      : Actor.id
  // snapshots are events: AppetiteBandChangedEvent
}

KRI {
  id                  : string                   // KRI-FC-016
  name                : string
  linked_risk_ids     : list<Risk.id>
  linked_control_ids  : list<Control.id>
  source_system       : enum
  frequency           : enum
  green / amber / red bands
  current_value       : value
  trend               : enum                     // improving | stable | worsening
}

2. Relationships
The graph is the binding layer. Every relationship has a type, a cardinality, and where useful a temporal validity (since/until) — because controls move between processes, obligations are reassigned, etc.
2.1 Edge catalogue
Edge typeFrom → ToCardinalityProperties on edgeLayer:CONTAINSRegulation → Obligation1 : N—Design:AMENDSRegulation → RegulationN : 1effective_from, clause_diff_refDesign:SUPERSEDESRegulation → RegulationN : 1effective_fromDesign:HAS_STEPProcess → ProcessStep1 : Nstep_orderDesign:HAS_ACTIVITYProcessStep → Activity1 : Nactivity_orderDesign:PRECEDESProcessStep → ProcessStepN : Ncondition, defaultDesign:OPERATES_ATControl → ProcessStepN : 1since, untilDesign:COVERSControl → ObligationN : Ncoverage_strength, since, untilDesign:MITIGATESControl → RiskN : Nmitigation_strength, since, untilDesign:ARISES_INRisk → ProcessN : N—Design:HAS_APPETITERisk → AppetiteMetricN : 1—Design:TRACKED_BYRisk → KRIN : N—Design:INSTANCE_OFProcessExecution → ProcessN : 1process_version_pinnedBridge:INSTANCE_OFStepExecution → ProcessStepN : 1step_version_pinnedBridge:INSTANCE_OFControlInstance → ControlN : 1control_version_pinnedBridge:PART_OFStepExecution → ProcessExecutionN : 1—Run:CAPTURED_ATControlInstance → StepExecutionN : 1—Run:OPERATES_ONControlInstance → SubjectN : 1—Run:OPERATES_ONProcessExecution → SubjectN : 1—Run:SUPPORTSEvidenceRecord → ControlInstanceN : Ncompleteness_contributionRun:GENERATED_ATEvidenceRecord → StepExecutionN : 1—Run:DERIVED_FROMEvidenceRecord → EvidenceRecordN : 1derivation_methodRun (e.g., parsed JSON from PDF):PERFORMED_BYStepExecution → ActorN : 1—Run:PERFORMED_BYControlInstance → ActorN : 1—Run:FOUND_INIssue → ControlInstanceN : Ndiscovery_roleLifecycle:AFFECTSIssue → ControlN : Nimpact_severityLifecycle:BREACHESIssue → ObligationN : N—Lifecycle:ELEVATESIssue → RiskN : Ndelta_likelihood, delta_impactLifecycle:REMEDIATESActionTask → IssueN : 1—Lifecycle:PRODUCESActionTask → EvidenceRecordN : N—Lifecycle:DETECTED_BYIssue → AIInsight1 : 1—Lifecycle:GENERATED_BYAIInsight → ModelN : 1confidenceAI:RECOMMENDSAIInsight → ControlN : Nconfidence, rationale_refAI:RECOMMENDS_OBLIGATION_FORAIInsight → RegulationN : 1extracted_text_spanAI
2.2 Why edges-as-first-class-citizens
Three of the above edges carry the platform's most expensive queries:

:COVERS (Control → Obligation) — answers "Does this regulation have a control behind it?" — the obligation coverage map (Compliance view).
:CAPTURED_AT (ControlInstance → StepExecution) — answers "What was the operational context when this control fired?" — the audit chain.
:ELEVATES (Issue → Risk) — closes the residual-rating loop. Risk's residual rating is computed by walking open :ELEVATES edges from active issues, plus weighted ControlInstance health from :MITIGATES paths.

Edges in this graph are not stateless. Each carries since / until so that time-travel queries return the graph as it was wired on date T, not just the entities.

3. Time Model
3.1 Bi-temporal frame
Every fact in the graph carries two timestamps:

valid_time — when the fact was true in the world (e.g., regulation effective from 12-Jun-2025; control fired at 10:32:04 IST).
system_time — when the platform learned the fact (e.g., obligation extracted by AI on 14-Jun-2025; ControlInstance ingested at 10:32:09 IST).

This allows the platform to distinguish:

"What did we know on 31 March, and was it correct?" (system_time pinned, valid_time queried)
"What was the actual state of the world on 31 March, given everything we know now?" (valid_time pinned, system_time = now)

The bi-temporal split is the foundation of audit-grade traceability. RBI inspections and IA reviews routinely need both.
3.2 Event sourcing
The system-of-record is an append-only event log. Every state change produces an immutable event. Current state is a projection computed from the event stream.
Event {
  event_id              : string                 // EVT-CTRL-INSTANCE-FIRED-...
  event_type            : enum                   // see catalogue below
  aggregate_type        : string                 // ControlInstance | Issue | Control | etc.
  aggregate_id          : string                 // CI-CTRL-KYC-001-...
  valid_time            : timestamp
  system_time           : timestamp              // ingestion / write time
  actor_id              : Actor.id
  payload               : map                    // event-specific delta
  causation_id          : Event.id | null        // event that caused this one
  correlation_id        : string                 // all events in one logical operation
  schema_version        : int
}
Event catalogue (representative, ~40 types in production):
AggregateEvent typesRegulationRegulationPublished, RegulationAmended, RegulationSuperseded, RegulationWithdrawnObligationObligationExtracted (AI), ObligationRatified (human), ObligationAmended, ObligationLinkedToControlControlControlPublished, ControlAmended, ControlRetired, ControlVersionPinnedProcessExecutionProcessStarted, StepEntered, StepCompleted, StepFailed, ProcessCompleted, ProcessAbandonedControlInstanceControlInstanceFired, ControlInstanceFailed, ControlInstanceOverridden, ControlInstanceExceptionRaisedEvidenceEvidenceCaptured, EvidenceParsed, EvidenceLinkedToControlInstance, EvidenceHashVerifiedIssueIssueCreated, IssueAssigned, IssueStatusChanged, IssueClosed, IssueRootCauseTaggedActionTaskActionCreated, ActionAssigned, ActionCompleted, ActionValidatedRiskRiskRatingComputed, RiskAppetiteBandChangedAIAIInsightProduced, AIInsightAccepted, AIInsightRejected, AIInsightOverridden
3.3 Time-travel queries
The platform supports four canonical time-travel patterns:

AS OF point-in-time — "State of Control CTRL-KYC-001 as of 2026-03-31". Replay events with system_time ≤ 2026-03-31. Used in audit, AFI prep, regulatory submissions.
AS WAS valid-time — "What was actually true in the world on 2026-03-31, with all our hindsight?". Filter on valid_time and use latest system_time. Used in retroactive root-cause and root-fact analysis.
DELTA between two times — "What changed for this risk between Q4-FY25 and Q1-FY26?". Returns event diff over the window. Used in trend / what-changed dashboards.
REPLAY for reconstruction — "Show the entire causal chain that produced Issue ISS-2026-009". Walks causation_id and correlation_id. Used in deep audit and post-incident review.

3.4 Audit state reconstruction
Audit reconstruction = ability to produce, for any historical moment, a fully-cited graph snapshot showing (a) what controls existed and how they were wired to obligations, (b) what the runtime data looked like, (c) what the platform knew at that time, and (d) what AI insights had been produced and accepted/rejected.
This is achieved by:

Snapshotting projections to a time-indexed graph store (e.g., daily snapshots of "current state")
Storing events in an immutable, hash-chained log (each event references the prior event hash)
Materialising "as-of" projections lazily on query, falling back to event replay for cold dates

The hash chain is the regulator-defensible artefact: any tampering is detectable.
3.5 Versioning vs. history
Two distinct concepts that must not collapse:

Versioning applies to design-time entities (Control v1 → v2 when the regulation amends). The graph keeps both versions, and INSTANCE_OF edges pin the version that was in force at execution time.
History applies to lifecycle entities (Issue moves open → in_remediation → closed). History is an event stream; the entity has no "version" per se, only a current state projection.


4. Multi-Persona Views
The same underlying graph is projected differently for each persona. No persona has its own data — every view is a traversal over shared nodes and edges.
4.1 View definitions
PersonaAnchor entityDefault time sliceDefault filtersTypical traversalCRORisk (aggregated by domain)"now" + 13-week trendresidual_rating ∈ {High, Very High} OR appetite_breach=true OR trend=worseningRisk → :MITIGATES (reverse) → Control → ControlInstance health → AppetiteMetric current_bandComplianceObligation (full universe)"now"coverage_strength < 0.7 OR open issues breach this OBLObligation → :COVERS (reverse) → Control → ControlInstance healthAuditControl (one at a time)testing window (typically 12 months)status ∈ {fail, exception, override} OR completeness < 0.8Control → :INSTANCE_OF (reverse) → ControlInstance → :SUPPORTS (reverse) → EvidenceRecordOperationsProcess (one at a time)"now" + 7-day in-flightexceptions, drift_flag=true, KRI in amber/redProcess → :HAS_STEP → ProcessStep → :INSTANCE_OF (reverse) → in-flight StepExecution
4.2 CRO view — "Risk Posture"
Shape: a heatmap of risk domains × residual rating, with trend arrows and appetite-breach flags. Drill paths:
Risk Domain (FC)
  └→ Risk (R-FC-001 AML)                                                [residual: High, ▲]
       └→ Top contributing Issues  (ISS-2026-009 …)
            └→ Failing ControlInstances (last 30 days)
                 └→ StepExecutions where they failed
                      └→ Subjects (specific customers / alerts)
       └→ AppetiteMetric (APP-FC-002 alert backlog %)              [current: Red 6.1%]
       └→ KRIs (KRI-FC-016, KRI-FC-017)                            [worsening, worsening]
Computed fields the CRO view depends on:

Risk.residual_rating(as_of=now) = function of inherent_rating, weighted ControlInstance pass-rate over rolling window, count of open Issues with :ELEVATES edge, KRI band.
Risk.trend(window=13w) = slope of residual_rating over the window.

4.3 Compliance view — "Obligation Coverage"
Shape: an obligation-by-obligation grid showing coverage status. Three traversal-driven columns:

Coverage strength: derived from :COVERS edges + control effectiveness of the linked controls
Open issues breaching this obligation: Issue :BREACHES Obligation
Recent regulatory change impact: Regulation :AMENDS events in the last quarter touching this Obligation

Compliance view also surfaces thinly covered obligations — where only one weak control links to a critical obligation. Identifying these is one of the platform's high-value outputs.
4.4 Audit view — "Evidence Chain"
Shape: a linear walk down a single control:
Control CTRL-KYC-001 (v3.2)                              [active since 2025-Jun-12]
 ├ Designed condition: "before account activation in CBS"
 ├ Linked obligations: OBL-RBI-001, OBL-RBI-005
 ├ Linked risks:       R-FC-001
 │
 ├ ControlInstances (Q1 FY26)              ......... 47,228 fired / 47,231 expected
 │   ├ Pass:     46,892
 │   ├ Fail:        191                                  [→ Issue ISS-2026-031]
 │   ├ Exception:    87
 │   ├ Override:     61                                  [→ outliers; high reviewer queue]
 │   └ Pending:       3
 │
 ├ Sample 25 random CIs for reperformance:
 │   └ For each CI: walk to :SUPPORTS Evidence → fetch payload → verify hash
 │
 └ Evidence completeness distribution:
     ├ 90-100:   89%
     ├ 70-89:     8%
     └ <70:       3%                                     [→ targeted review]
The audit view is the most evidence-intensive view — every node is a click-through to source artefacts. The platform must serve evidence payloads (PDFs, recordings, system logs) with sub-second latency from blob storage, with hash verification on read.
4.5 Operations view — "Process Health"
Shape: a swim-lane of in-flight ProcessExecutions with KRI overlays. Drill paths:
Process PROC-AML-001 (AML alert disposition)
 ├ In-flight ProcessExecutions:                         12,847 alerts open
 │   ├ At STEP-AML-04 (L1 triage):                       8,021     [median age: 3.2d]
 │   ├ At STEP-AML-05 (L2):                              3,889     [median age: 11.4d]
 │   ├ At STEP-AML-06 (L3):                                712     [median age: 19.7d ▲]
 │   └ At STEP-AML-07 (STR filing):                        225     [median age: 4.1d]
 │
 ├ Drift: 7% of executions are bypassing STEP-AML-05            [process mining flag]
 │       → AIInsight ID: AIINS-2026-04-12-process-mining
 │
 ├ Active KRIs:
 │   ├ KRI-FC-016 (alert backlog %):     6.1% RED ▲
 │   └ KRI-FC-017 (L3 case aging):       12 cases >30d RED ▲
 │
 └ Open Issues:
     ├ ISS-2026-009 (Capacity)
     └ ISS-2026-052 (L3 aging)
4.6 The persona-view invariant
No view should require its own table. Every view is a saved Cypher / SPARQL / Gremlin query (or a parameterised stored projection) over the graph. This is what makes the platform's data architecture durable across requirements changes — the same underlying graph supports CRO, Compliance, Audit, and Ops without schema duplication.

5. AI Layer
AI capabilities are not bolted on. They consume graph nodes, produce AIInsight nodes, and feed back into the lifecycle (Issues, ActionTasks, Control recommendations). Every AI output is versioned, has explicit confidence, has provenance to source data, and is revisable by humans through the event log.
5.1 Capability spine
CapabilityPass 1 refInputs (graph)Outputs (graph)CadenceModel classHuman-in-loopAnomaly detectionAI-001, AI-004ControlInstance event stream; StepExecution stream; Subject contextAIInsight {type=anomaly} linked to source CI/SE; optional Issue if confidence > τContinuous (sub-second per event)Time-series (LSTM/transformer) + isolation forest + behavioural graphRisk officer reviews high-confidence; auto-issues on ultra-highControl effectiveness(effectiveness score on Control)Rolling ControlInstance outcomes; Evidence completeness scores; linked IssuesControl.effectiveness_score(as_of=t) projection; AIInsight {type=effectiveness_decay}DailyBayesian aggregation + survival analysisCompliance reviews decay alertsProcess miningAI-002, AI-015ProcessExecution + StepExecution event streamsProcessVariant nodes; drift_flag on StepExecution; AIInsight {type=drift} for novel variantsContinuous + batch (weekly conformance)Variant analysis, conformance checking (alpha / heuristic miners), graph clusteringProcess owner + audit triages new variantsRegulatory mappingAI-003Regulation raw_text_blob (newly published or amended)AIInsight {type=extraction} proposing Obligation nodes + :COVERS edges to ControlsOn regulation publish/amendLLM extraction + retrieval over Control corpus + structured promptingCCO / regulatory specialist ratifies before commitIssue clustering / RCAAI-010Issue corpus + Control / Process linkagesAIInsight {type=clustering} proposing root-cause clustersWeekly batchEmbeddings + clustering + LLM summarisationRisk lead reviews proposed clustersEvidence extractionAI-005EvidenceRecord (DOC / CALL / IMG types)Updated EvidenceRecord.parsed_payload_ref; structured fields populatedOn ingestionLLM + ASR + vision OCRAudit on sampleMule / fraud networkAI-001, AI-011UPI / payment ControlInstances + Subject graphAIInsight {type=mule_cluster} linked to multiple Subjects; high-priority IssueReal-timeGraph ML (GNN) + rule overlays + NPCI signal fusionFraud ops triagePredictive risk(cross-cutting)Risk + Control + Issue history + KRI streamsRisk.projected_residual_rating(t+horizon) snapshotDailyTime-series ensembleCRO reviews projections > red
5.2 The AIInsight contract
Every AI capability writes to a single normalised entity: AIInsight. This is the platform's design discipline — AI cannot mutate operational graph state directly; it can only propose changes via insights, which a human (or a policy-based auto-accept rule) commits to the graph.
AIInsight → :PROPOSES_NEW → Issue / Obligation / Control_link
AIInsight → :HAS_CONFIDENCE → float
AIInsight → :GENERATED_BY → Model (with version + training_data_snapshot_id)
AIInsight → :EXPLAINS_VIA → ExplanationRecord (SHAP values / rationale text / cited evidence)
AIInsight → :REVIEWED_BY → Actor (when human disposition occurs)
AIInsight → :RESULTED_IN → Issue / ActionTask / null
This contract gives three valuable properties:

Auditability: every AI-influenced state change has a chain back to the model version, training data, input features, and human review decision.
Reversibility: rejecting an insight is itself an event; it does not erase history.
Continuous learning: accepted/rejected insights are training signal for the next model version. The model's training_data_snapshot_id pins this provenance.

5.3 Model meta-graph
Models themselves are graph nodes:
Model {
  id                  : string                   // MDL-MULE-DETECT-v2.4
  capability          : enum
  version             : string
  trained_at          : date
  training_data_id    : string
  input_features      : list<feature>
  approved_by         : Actor.id                 // MRM
  approval_evidence   : EvidenceRecord.id
  effective_from      : date
  effective_to        : date | null
  retired_reason      : string | null
}
Models are versioned, validated, and governed exactly like any other Control under SR 11-7 / RBI MRM expectations. The platform's own AI is treated as in-scope for R-MR-001 (model risk) — model drift, validation failures, and override patterns produce AIInsight {type=meta} records.
5.4 Confidence, thresholds, and auto-action
Each capability has three thresholds:

τ_alert — below this, the insight is silent (only stored).
τ_review — between τ_alert and τ_action, insight is queued for human review.
τ_action — above this, insight may auto-trigger workflow (create Issue, escalate, suspend a control instance).

Threshold settings are themselves configuration controlled via the event log (so we can answer "why did the system auto-create this issue?" months later).

Caveats

Storage backend is intentionally not specified. The schema works on a property graph (Neo4j / Amazon Neptune / TigerGraph) backed by an event log (Kafka / EventStoreDB) and blob store (S3) for evidence payloads. RDF/SPARQL is also viable. The choice is downstream of latency / write volume / regulatory residency requirements.
Subject polymorphism. Treating customer / loan / alert / vendor / change-ticket / transaction / complaint as a single Subject archetype is a simplification. In practice each subject type has its own attribute set; the platform should model Subject as an interface with concrete implementations per type while keeping the join key uniform.
Volume cliff at ControlInstance. With ~10⁹ ControlInstances/year for a mid-sized PB (CTRL-AML-001, CTRL-UPI-001), even partitioned graph storage strains. Two patterns work in practice: (a) high-volume CIs land in an event store + columnar warehouse first, with a thin "graph-shaped index" pointing back, and (b) graph storage holds aggregates and exemplars while event store holds the raw stream. The persona views in Section 4 must compose across both layers.
Edge temporality is non-trivial. Time-travel over edges (an obligation moving between Controls; a control moving between process steps) is conceptually clean but operationally expensive. Most graph DBs support edge temporality only via convention. Plan to maintain it explicitly.
AI confidence calibration is itself a model. The thresholds (τ_alert, τ_review, τ_action) per capability need their own calibration governance — under-confident models produce noise; over-confident ones produce auto-actions that breach human-in-loop expectations under DPDP and RBI ITGRCA. The platform's AI layer needs an "AI risk register" that mirrors R-MR-*.
Residual rating is not stored. Section 1.2 deliberately omits residual_rating from Risk as a stored field. It is a function of the graph state at a moment in time. Some implementations cache it for performance, but the cache is a projection — the canonical answer is always derived from current ControlInstance health + open Issues + KRIs.
Issue → ControlInstance back-link is a key affordance. In legacy GRC systems, issues are recorded against controls (the design entity), not against runtime instances. Linking issues to specific failing CIs is what enables the platform to demonstrate empirically — not aspirationally — that a control is broken. The graph schema enforces this; the data discipline is up to ingestion design.
Cross-process subject view. A single customer (one UCIC) appears as Subject across PROC-KYC-001 (onboarding), PROC-AML-001 (monitoring), PROC-LND-001 (lending), PROC-COMP-001 (complaints). The platform's most powerful query is "show me everything that ever happened to this UCIC" — this is a core differentiator vs siloed GRC tools and demands the cross-cutting Subject model.
Regulator-facing exports. Persona views (CRO/Compliance/Audit/Ops) are internal. A fifth view — Regulator Submission — is needed for AFI / inspection / RMP closure: it produces signed, hash-verifiable bundles drawn from the same graph, with bi-temporal pinning. This is out of scope for Pass 3 but should be allowed for in the schema (it adds no new entities, only export workflows).
The graph is not a substitute for the business systems. It is a control overlay. CBS, LOS, AML engine, etc. remain the systems of execution. The graph is the system of evidenced execution: who did what, when, with what proof, against which obligation, to mitigate which risk.

