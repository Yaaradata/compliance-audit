# Stage 5 Capabilities and Data Model -- yaara-uk-risk

- **Run:** Yaara Risk & Compliance -- UK Banking, UK Board Risk View. Primary persona: CRO (SMF4) at board altitude (`cro-smf4-board`). Phase 3, stage 2 of 5.
- **Date:** 27 October 2026. **Status:** draft for confirmation; not locked.
- **Inputs read in full:**
  - `PHASE3_BRIEF.md`;
  - the stage file `stage-5-capabilities-data-model.md`, `conventions.md` and `output-file-naming.md`;
  - `RunConfig_yaara-uk-risk_cro-smf4-board.md`;
  - the product profile `yaara-uk-risk.md`;
  - **METHODOLOGY_FILE** `yaara-uk-risk-analysis-method.md` (loaded first, as the stage file requires; sections A to F instantiated below);
  - the domain profile `uk-bank-risk-governance.md` and the persona profile `cro-smf4-board.md`;
  - the `sales-demo` intent and the `compliance` and `executive` governance selectors;
  - `Stage3_InsightCard_Catalogue_uk-bank-risk-governance.md`, all 1,568 lines, paged: 74 Tier 1 questions, T2-1 to T2-45, H-1 to H-36, the 24x7 set, P1 to P21 and D1 to D10;
  - `Stage4_Personas_yaara-uk-risk_cro-smf4-board.md`, all 545 lines.
- **Confirmed decisions applied exactly:**
  - Beachhead Option A. No field in this model is populated by AI reading minutes or papers. The interaction corpus is modelled only as reserved Tier 3 placeholders (section 1.7).
  - **D1.** The tension register, the decision and waiver register, the reportability ledger and the pack-build manifest are modelled as **human-keyed structured data**. Every entry carries `keyed_by` (a named person), `keyer_role`, `keyed_at` and, where a board or committee decision lies behind it, `source_decision_ref` (an ID only, never minute text).
  - D3, D6 and the defaults (persistent amber = 2 quarters at Level 2; T2-5 shows both capacity units; worst-of roll-up for the demo; 24-hour triage target labelled firm practice; 12 headlines) are stored as firm configuration with a `practice_not_rule` label and a named approver, never hard-coded.
  - **OD-2: defaulted, not locked.** Firm type is a configuration attribute (`Firm.firm_type`). On the coordinator's later instruction, the demo **defaults to `building_society`** and stays switchable. Building society nature and funding limits (T2-8) are evaluated and rendered only when `firm_type = building_society`. The beat 1 growth story is re-scaled to rapid mortgage and savings growth plus digital member onboarding. The challenger option remains open and flagged. See section 9.1.
- **What this stage does not decide:** screens and layout (Stage 6), flows (Stage 7), component structure (Stage 8), the seeded values (Stage 9A), visual rules (Stage 9C). Tie-out constraints found while modelling are passed to 9A as TC-1 to TC-10 (section 9.3), not fixed here.

**Domain spine (every entity, capability and unit below is positioned on it):**
Strategic Objective → RAS Statement → Level 1 Metric → Level 2/3 Indicators and Thresholds → Policy Obligation → Control → Evidence / Data Feed → Accountable Owner → Attestation → Escalation / Reportability Decision.

---

## 0. Gate summary

| Item | Result |
|---|---|
| Methodology loaded | `yaara-uk-risk-analysis-method.md`. Unit = an **appetite position with chain integrity**, in five types: position, breach, chain break, tension collision, reportability case. Per-unit spec template = section E; pipeline = section C (5 stages); edge-case register = section D (12 entries, coded ER-1 to ER-12 here) |
| Entities | **54 modelled entities** in six groups (E-01 to E-54), plus 4 reserved Tier 3 placeholders (I-01 to I-04) that hold no data in Tiers 1–2 |
| Differentiating joins | 8 (J-1 to J-8), all on structured records. The narrative join (metrics × minutes) is parked as Tier 3 |
| Capabilities | **41 analytics capabilities (C-1 to C-41)** and **13 operational capabilities (O-1 to O-13)**. Each feeds at least one catalogue card |
| Pipeline | The method's 5 stages instantiated: Requirement → Evidence → Sufficiency → Attestation → Gap / escalation. Grain and comparison basis stated per unit family (section 4) |
| Per-unit spec blocks | **23 cards** with full methodology-template blocks: the 14 Layer 1 bound and 9 embedded cards, which include all 17 demo-spine cards (12 core + 5 reserves). The 18 drill and count-only cards are listed one line each (section 5.6). The 4 cards not rendered (T2-41, T2-43, T2-44, T2-45) keep their capabilities only |
| KPIs defined | 34 (K-1 to K-34), each with a plain formula and source fields |
| Top questions | Q1 to Q10 all map to capabilities. No Tier 2 gap. The Tier 3 halves are recorded as by-design gaps (section 3.3) |
| Open decisions | **OD-2 defaulted to building society, still configurable and flagged**, plus the other Stage 4 decisions this model touches, and **14 new Stage 5 decisions (S5-OD-1 to S5-OD-14)**, in section 9 |

---

## 1. Entity model

### 1.1 How to read this section

- **Groups.** A: configuration. B: the cascade (the spine, product-owned). C: evidence (the bank's records, consumed). D: product-owned registers (D1). E: governance calendar and routing. F: surfaced units, drafts and the audit trail.
- **Side codes** (used in section 2):
  - **S** = substrate: the bank's structured record, consumed, never owned;
  - **P** = product-owned record, keyed by a named person (cascade graph, calibration records, attestation records, the D1 registers, the read-across log, precedent tags);
  - **C** = firm configuration: a practice setting with a named approver and a `practice_not_rule` label;
  - **D** = derived by the product at run time (computed, never keyed, never edited by hand);
  - **I** = interaction corpus (minutes, notes, commentary). **Tier 3 only. Not populated in this build.**
- **Cardinality notation:** 1:1, 1:N, N:M.

### 1.2 Entities

| Code | Entity | Group | Spine segment | Record source (Stage 3 code) | Side |
|---|---|---|---|---|---|
| E-01 | Firm | A | (context for the whole spine) | Configuration | C |
| E-02 | PracticeSetting | A | (thresholds, routing, attestation cadence) | FCL, configuration | C |
| E-03 | StrategicObjective | B | Strategic Objective | CG | P |
| E-04 | PlanInitiative | B | Strategic Objective (plan volumes) | CAP | S |
| E-05 | PrincipalRisk | B | RAS Statement (grouping) | RAS, configuration | P |
| E-06 | RASStatement (carries risk capacity) | B | RAS Statement | RAS | S |
| E-07 | Metric (Level 1/2/3; KRI, KCI, capacity, governance) | B | Level 1 Metric; Level 2/3 Indicators | RAS, KRI | S |
| E-08 | ThresholdSet (versioned calibration record) | B | Thresholds | CAL | P |
| E-09 | CascadeLink (typed edge) | B | Every link of the spine | CG | P |
| E-10 | MetricPair (leading–lagging) | B | Level 2/3 → Level 1 | CG | P |
| E-11 | PolicyObligation | B | Policy Obligation | OBL | S |
| E-12 | Control | B | Control | CTL | S |
| E-13 | DataFeed | B | Evidence / Data Feed | REC, CG | S |
| E-14 | Person | B | Accountable Owner | SMCR | S |
| E-15 | OwnershipAssignment | B | Accountable Owner | SMCR, CG | P |
| E-16 | MRMVersion (with SoR entries) | B | Accountable Owner | SMCR | S |
| E-17 | MetricObservation | C | Level 1/2/3 values | KRI | S |
| E-18 | ReconciliationRun | C | Evidence / Data Feed | REC | S |
| E-19 | ReconciliationCohortResult | C | Evidence / Data Feed | REC | S |
| E-20 | ControlTest (with RCSA rating) | C | Control → Evidence | CTL, RCSA | S |
| E-21 | Attestation | C | Attestation | ATT | P |
| E-22 | Issue (issue or action) | C | Escalation | ISS | S |
| E-23 | AuditFinding | C | Escalation | AUD | S |
| E-24 | Incident | C | Escalation / Reportability | INC | S |
| E-25 | ChangeRecord | C | Control → Evidence | CHG | S |
| E-26 | Model | C | Control | MOD | S |
| E-27 | Restriction (VREQ / s166) | C | Policy Obligation (restriction) | RST | S |
| E-28 | RestrictionClause (with executable test definition) | C | Policy Obligation → Control | RST, OBL | S + P (test definition) |
| E-29 | PopulationTestRun | C | Evidence | RST | S |
| E-30 | ImportantBusinessService | C | Level 1 Metric (impact tolerance) | INC, tolerance register | S |
| E-31 | ConsumerDutyMeasure | C | Level 2 Metric (outcome) | CDO | S |
| E-32 | ThirdParty | C | Control (dependency) | Third-party register fields | S |
| E-33 | EmergingRisk | C | Principal risk (horizon) | Emerging-risk register | S |
| E-34 | GuardrailPair (tension register) | D | RAS → Level 1 pair → floor obligation | TEN | P (D1) |
| E-35 | DecisionRecord (decision and waiver register) | D | RAS (waiver) → Escalation | DEC | P (D1) |
| E-36 | WaiverCondition | D | RAS (waiver condition) | DEC | P (D1) |
| E-37 | ReportableEvent (ledger parent) | D | Escalation / Reportability Decision | RPL | P (D1) |
| E-38 | ReportabilityRoute (ledger child) | D | Reportability Decision | RPL | P (D1) |
| E-39 | RouteDecision (append-only) | D | Reportability Decision | RPL | P (D1) |
| E-40 | RuleLibraryEntry (route and clock text, by in-force date) | D | Policy Obligation (regulatory) | OBL | P (reference) |
| E-41 | PackManifest (per forum per cycle) | D | Escalation | PKM | P (D1) |
| E-42 | PackItem | D | Escalation | PKM | P (D1) |
| E-43 | PackOverride | D | Escalation | PKM | P (D1) |
| E-44 | ReadAcrossEntry | D | Control → Evidence | RAL | P |
| E-45 | Precedent (real UK Final Notice, posture-tagged) | D | (reference: Control design shape) | PRC | P (reference) |
| E-46 | Forum | E | Escalation | FCL | C |
| E-47 | ForumMeeting | E | Escalation | FCL | C |
| E-48 | RoutingRule | E | Escalation | FCL | C |
| E-49 | Unit (the surfaced unit behind a card) | F | Whole spine (carries its spine path) | Derived | D |
| E-50 | IntegritySnapshot (the four-dot badge) | F | Feed → Owner → Attestation | Derived | D |
| E-51 | DraftAction (AI draft: prepare / propose) | F | Escalation | Derived, AI | D |
| E-52 | HumanGateDecision | F | Escalation / Decision | Product, keyed by a named person | P |
| E-53 | AuditLogEntry (immutable) | F | Every action | Product | P (system-written, append-only) |
| E-54 | ArtefactVersion (parent_artifact_id chain) | F | Every draft and pack artefact | Product | P |

**Reserved Tier 3 placeholders (no data, no fields populated in Tiers 1–2):** I-01 CommitteeMinute; I-02 EscalationNote; I-03 AttestationCommentary (text); I-04 ChallengeRecordText. Each exists only so Stage 8 can type the "cannot tell" line and the extension teaser. Hooks that would fill them: H-1, H-2, H-3, H-4, H-5, H-6, H-9, H-11, H-17, H-25.

**Not modelled as separate entities (fields instead):**
- risk capacity → `RASStatement.capacity_value` and `ThresholdSet.capacity`;
- capital and liquidity positions (CET1, leverage, LCR, NSFR) → `Metric` rows with `source_code = CAP`;
- disclosure tags (T2-26) → `Metric.disclosure_tags[]`;
- leading–lagging and action-to-metric links → `MetricPair` and `CascadeLink` edges;
- severity → `Unit.severity` (S1 to S4 stored; never shown as an S-code on the face, per Stage 4 R-11).

### 1.3 Relationships and cardinalities

| From | To | Cardinality | Through | Why it matters |
|---|---|---|---|---|
| StrategicObjective | RASStatement | N:M | CascadeLink `objective_ras` | One objective draws on several statements; one statement serves several objectives (method B.1, M-A-01) |
| PlanInitiative | StrategicObjective | N:1 | `PlanInitiative.objective_id` | Plan volumes reach appetite only through the objective |
| PlanInitiative | RASStatement | N:M | CascadeLink `initiative_ras` | An initiative with zero links is the T2-3 chain break |
| PrincipalRisk | RASStatement | 1:N | `RASStatement.principal_risk_id` | Grouping for the strip and the drill |
| RASStatement | Metric | 1:N (Level 1); Metric → Metric N:M (Level 2/3) | `Metric.ras_statement_id`; CascadeLink `rollup` | The Level 3 → Level 1 roll-up path; the rule is declared per Level 1 metric |
| Metric | ThresholdSet | 1:N (versions); 1:1 current | `ThresholdSet.metric_id`, `is_current` | Every status is evaluated against a versioned, approved threshold set |
| Metric | MetricObservation | 1:N | `metric_id`, `as_of` | Time series; restatements kept as versions |
| Metric | Metric | N:M | MetricPair (leading → lagging) | T2-21 |
| Metric | GuardrailPair | N:M (each pair has exactly 2 metrics) | `metric_a_id`, `metric_b_id` | T2-6 |
| Metric / RASStatement | PolicyObligation | N:M | CascadeLink `obligation_metric` | Mapping check (T2-18) |
| PolicyObligation | Control | N:M | CascadeLink `obligation_control` | Mapping check |
| Control | DataFeed | N:M | CascadeLink `control_feed`; `Control.feed_ids[]` | Read-across by shared feed (T2-32) |
| Metric | DataFeed | N:M | CascadeLink `metric_feed` (lineage) | Integrity override: a feed failure flips every dependent metric to "unverified" (T2-14) |
| DataFeed | ReconciliationRun | 1:N | `feed_id`, `run_ts` | Evidence for the feed check |
| ReconciliationRun | ReconciliationCohortResult | 1:N | `run_id` | Cohort-concentrated shortfall (T2-14) |
| Attestation | ReconciliationRun or ControlTest or PopulationTestRun | N:1 | `attested_result_id`, `attested_result_type` | The trust-bearing join: the owner attests a **result**, not a form (P10) |
| Any board object (RAS, Metric, Obligation, Control, Feed, RestrictionClause, Journey) | Person | N:M by owner type | OwnershipAssignment (`owner_type`, `mrm_version_id`) | Owner check, segregation of duties, two owner types (P9, G-6) |
| Person | MRMVersion | N:M | SoR entries in `MRMVersion.entries[]` | Prescribed responsibilities and interim status |
| Restriction | RestrictionClause | 1:N | `restriction_id` | Clause-level tests and attestation |
| RestrictionClause | PopulationTestRun | 1:N | `clause_id`, `run_date` | Adherence by population, never by "flag fired" (HF-3) |
| Issue | Metric / Control | N:M (often sparse) | `linked_metric_ids[]`, `linked_control_ids[]`; CascadeLink `action_metric` | The escalation-health joins (T2-34, T2-38) |
| Issue | DecisionRecord | N:1 | `risk_acceptance_id` | Risk acceptance (T2-39) |
| ReportableEvent | ReportabilityRoute | 1:N | `event_id` | The multi-clock ledger (T2-29); the Boolean trap |
| ReportabilityRoute | RouteDecision | 1:N (append-only) | `route_id`; `supersedes_decision_id` | Decisions are appended, never edited |
| ReportabilityRoute | RuleLibraryEntry | N:1 | `rule_id` (version selected by `in_force_date` ≤ event date) | Rule text by in-force date |
| ReportableEvent | Incident / PopulationTestRun / ControlTest / Issue / MetricObservation | N:M | `linked_record_refs[]` | Earliest structured signal (T2-30) |
| Forum | ForumMeeting | 1:N | `forum_id` | Calendar for "before the next forum" (T2-4) |
| RoutingRule | Forum | N:1 | `target_forum_id` | Which items qualify for which forum (T2-35) |
| ForumMeeting | PackManifest | 1:1 per version; versions chained | `meeting_id`, `parent_artifact_id` | What actually went to each forum |
| PackManifest | PackItem | 1:N | `manifest_id` | Included, qualified, removed |
| PackItem | PackOverride | 1:0..1 | `item_id` | Removal needs a named approver and reason code |
| Precedent | Control | N:M (by tag) | `failure_shape_code` × `Control.design_type` | Read-across after a Final Notice (T2-33) |
| ReadAcrossEntry | Control | 1:N | `matched_control_ids[]` | Read-across tested or not |
| EmergingRisk | PrincipalRisk | N:1 | `principal_risk_id` | Horizon overlay (T2-13) |
| EmergingRisk | Metric | N:M (0 is the gap) | CascadeLink `emerging_metric` | "No linked metric" (T2-13) |
| Unit | Card | N:1 | `card_id` (T2-n) | One card can carry several units (for example 3 persistent ambers) |
| Unit | Spine objects | N:M | `spine_path[]` (ordered object refs) | Every unit can trace its chain (HF-6) |
| Unit | IntegritySnapshot | 1:1 per evaluation | `snapshot_id` | The honesty line |
| Unit | DraftAction | 1:N | `unit_id` | Every card carries an action (method A) |
| DraftAction | HumanGateDecision | 1:0..1 | `draft_id` | Nothing leaves draft without a named human |
| Every write | AuditLogEntry | 1:1 | `object_type`, `object_id` | Immutable trail |
| DraftAction / PackManifest / route case | ArtefactVersion | 1:N | `parent_artifact_id` | Version chain for every artefact |

### 1.4 Joins: what exists in the substrate and what differentiates

**Joins that already exist in the bank's records** (consumed; no differentiation):
- KRI ↔ RAS by `metric_id` (the limit register and the KRI series share keys at most firms);
- control register ↔ test results by `control_id`;
- issue log ↔ metric or control by `linked_metric_id` / `linked_control_id` (present but sparse; Stage 3 notes that missing links are the main false-positive source for T2-34 and T2-38);
- reconciliation counts by `feed_id`;
- SMCR SoR ↔ prescribed responsibilities (but rarely to metrics, feeds or VREQ clauses).

**Differentiating joins** (the joins the product makes and incumbent GRC tools, which "hold the parts", do not; M-J-09, M-S-02). All are on structured records, so all are inside the Option A beachhead.

| Code | Join | What it makes possible | Cards |
|---|---|---|---|
| **J-1** | Strategy-to-control lineage: StrategicObjective ↔ RASStatement ↔ Metric ↔ PolicyObligation ↔ Control ↔ DataFeed ↔ OwnershipAssignment, in the product-owned cascade graph | Headroom with its chain; "unmapped" chips; ownership at the top level | T2-1, T2-2, T2-3, T2-13, T2-16, T2-18; every headline |
| **J-2** | Metric ↔ DataFeed lineage ↔ ReconciliationRun ↔ Attestation **at result-ID level** | Integrity overrides status; "attested without evidence" | T2-14, T2-15, T2-17, T2-26; the badge on every headline |
| **J-3** | RestrictionClause ↔ executable population test ↔ PopulationTestRun (breach route) ↔ accountable SMF ↔ attestation due date | Adherence by population, with the "flag fired" contrast; attestation support per clause | T2-27, T2-28 |
| **J-4** | ReportableEvent ↔ ReportabilityRoute ↔ RuleLibraryEntry (by in-force date) ↔ RouteDecision (named decider), plus the earliest linked structured signal | The multi-clock ledger; the Boolean trap; the awareness prompt | T2-29, T2-30, T2-31 |
| **J-5** | Metric status history ↔ Issue log ↔ DecisionRecord ↔ PackManifest ↔ RoutingRule ↔ ForumMeeting | Escalation health from structured records: persistence with nothing recorded, latency, suppression, closures that did not move the metric | T2-34 to T2-40, T2-22, T2-36 |
| **J-6** | GuardrailPair ↔ both partner series ↔ floor flag ↔ PolicyObligation | Trade-off collision and the floor check | T2-6, T2-2 (guard) |
| **J-7** | PlanInitiative volumes ↔ capacity metrics (qualified FTE, alerts cleared within SLA, queue age) on one time axis | Growth against financial crime control capacity | T2-5 |
| **J-8** | Precedent failure-shape tags ↔ Control `design_type` / `feed_id` ↔ ReadAcrossEntry ↔ later ControlTest | Read-across that is tested, not asserted | T2-32, T2-33 |

**The domain's narrative join** (metric and control data × governance narrative: minutes, escalation notes, commentary) is **not built**. It is the Tier 3 upgrade (H-1 to H-36) and the "extension" teaser only.

### 1.5 The spine encoded explicitly

The spine is representable as one ordered path of typed objects, so any card can trace it:

```
StrategicObjective (E-03)
  → RASStatement (E-06; capacity → appetite)            via CascadeLink objective_ras
    → Metric Level 1 (E-07)                             via Metric.ras_statement_id
      → Metric Level 2/3 (E-07) + ThresholdSet (E-08)   via CascadeLink rollup; ThresholdSet.metric_id
        → PolicyObligation (E-11) / RestrictionClause (E-28)   via CascadeLink obligation_metric
          → Control (E-12)                              via CascadeLink obligation_control
            → DataFeed (E-13) + ReconciliationRun (E-18) / ControlTest (E-20) / PopulationTestRun (E-29)
              → OwnershipAssignment (E-15 → E-14 Person, E-16 MRMVersion)
                → Attestation (E-21; attested_result_id)
                  → Escalation: Issue (E-22), PackItem (E-42), DecisionRecord (E-35)
                    / Reportability Decision: ReportabilityRoute (E-38) → RouteDecision (E-39)
```

- `Unit.spine_path[]` stores this path for each surfaced unit, as ordered `{object_type, object_id}` references. A unit whose path cannot be resolved to at least objective → RAS → metric → feed → owner → attestation cannot render a board-level status. It renders the break instead (HF-6).
- Units whose natural anchor is lower on the spine (for example a restriction clause, or a reportable event) still carry the upward path where one exists, and record `spine_upper_unresolved = true` where it does not. That is itself a mapping chain break (T2-18).

### 1.6 Constraints from DOES_NOT_DO, cohort level and identity level

| Constraint | How the model enforces it |
|---|---|
| Cross-domain joins stay cohort-level | Joins across conduct, financial crime and credit use aggregate measures keyed by product, channel, account-age band or journey. No entity joins a customer across domains. `ReconciliationCohortResult`, `ConsumerDutyMeasure` and the T2-25 cohort aggregates carry `cohort_n` and are suppressed below `Firm.min_cohort_size` |
| Customer-level financial crime records never reach the CRO or board face (HF-10) | `PopulationTestRun.breach_record_refs[]` are pseudonymised references with `visibility_scope = smf17_restricted`. The CRO and board views read counts only |
| SAR content is restricted (tipping-off) | `ReportabilityRoute` of type `sar_question` carries status only (`open` / `closed`). No SAR content field exists in this model; the SAR workflow is outside the product, in SMF17's restricted workflow |
| Financial crime cohorts never use nationality, ethnicity or postcode (P20) | The cohort dimension enum for financial crime metrics is limited to `product`, `channel`, `account_type`, `account_age_band`. Other dimensions are rejected at configuration |
| T2-30 visible to the CRO and the deciding SMF only (D6, HF-9) | `Unit.visibility_scope = cro_and_deciding_smf` for T2-30 units, evaluated against the route's `proposed_decider_id` |
| Individual SMF trails private (T2-41, R-8) | Not rendered in the demo. If built, `visibility_scope = owning_smf_private` with aggregate-only release after `smf_reviewed_at` |
| Product never owns the system of record | Every S-side entity carries `source_system`, `source_record_id` and `ingested_at`. No S-side field is editable in the product |
| AI never decides, files, notifies or re-tunes | `DraftAction.action_verb` is an enum limited to `prepare`, `propose`, `draft`, `send_to_owner`. `ThresholdSet` and `ChangeRecord` have no product write path; a proposed change is a `DraftAction` of type `calibration_proposal` that a human approves outside the product's write scope |

### 1.7 Version chain and immutable audit trail (assurance product requirement)

- **ArtefactVersion (E-54).** Every artefact the product drafts or assembles carries `artefact_id`, `version_no` and `parent_artifact_id`: draft BRC paragraphs, caveat text, per-route cases, per-clause evidence summaries, decision papers, pack manifests (draft → locked → circulated). An edit creates a child version; nothing is overwritten.
- **Versioned reference data.** `ThresholdSet` (calibration versions with approver), `MRMVersion` (SMCR Phase 1 and Phase 2 mappings), `RuleLibraryEntry` (rule text by `in_force_date` and `status` consultation / final), `Metric` definitions (`definition_version`), `MetricObservation` (`version`, `restated_flag`).
- **Append-only decisions.** `RouteDecision` rows are appended with `supersedes_decision_id`; `PackOverride` and `HumanGateDecision` rows are never edited.
- **AuditLogEntry (E-53).** System-written, append-only, hash-chained (`prev_entry_hash`, `entry_hash`). Every draft, gate decision, register keying, send-to-owner and visibility-scoped read of a restricted unit writes one entry with `actor_id`, `actor_role`, `action`, `object_type`, `object_id`, `artefact_version_id`, `ts`, `reason_code`.

---

## 2. Field inventory (catalogue-driven, not a schema dump)

Columns: **Side** (S / P / C / D / I, section 1.1). **★** = trust-bearing: a field the method relies on to make a unit defensible. 9A and 9B must populate every ★ field richly and consistently across screens. **Cards** = the cards that read the field (abbreviated to the card number).

### 2.1 Group A -- configuration

**E-01 Firm**

| Field | Side | ★ | Cards / note |
|---|---|---|---|
| firm_id, display_name `[fictional]` | C | | All. Stage 4 proposed "Fernbridge Building Society" for `building_society`; a challenger name is not yet chosen (OD-2). Check every fictional name against the FCA register before use |
| **firm_type** {building_society, challenger_bank, mid_tier_bank, specialist_lender}; **default `building_society`** | C | ★ | **OD-2, defaulted, not locked.** Gates T2-8 (rendered only when `building_society`), the statutory-limit metrics, the T2-5 growth shape and readout scaling (TC-1) |
| total_assets_gbp `[illustrative]` | C | | Sizing; 22.4bn (society) or 30bn (challenger) per the catalogue |
| icp_tier {tier2, tier3} | C | | Tier 3 variant hides T2-27 and T2-28 where no live VREQ exists (P21) |
| dual_regulated (bool) | C | ★ | T2-29: the FR7 route is required when true (true for both firm types in scope) |
| statutory_limits_enabled (derived: `firm_type = building_society`) | D | | T2-8 render gate |
| restrictions_enabled (derived: at least one live Restriction) | D | | T2-27, T2-28 render gate |
| current_period, comparison_period, current_as_of | C | ★ | Time-travel default: Q3 2026 (as at 30 September 2026) against Q2 2026 (as at 30 June 2026). Demo "today": 27 October 2026 |
| min_cohort_size | C | ★ | T2-25, T2-42 cohort suppression (P20) |
| working_calendar | C | | Working-day windows (T2-14 forum window; T2-30 gap) |

**E-02 PracticeSetting** (every firm-set value that HF-5 requires to be labelled as practice)

| Field | Side | ★ | Cards / note |
|---|---|---|---|
| key, value, unit | C | ★ | e.g. `headline_cap = 12`; `persistence_n = 2` (quarters, Level 2); `default_rollup_rule = worst_of`; `triage_target_hours = 24`; `attestation_due_window_days = 15`; `awareness_gap_working_days = 5`; `forum_unverified_window_working_days = 10`; `extension_count_limit = 2`; `latency_threshold_cycles = 2`; `utilisation_floor_pct = 50`; `interim_owner_max_days`; `fc_feed_attestation_cadence = monthly` |
| label (always `practice_not_rule`) | C | ★ | HF-5 |
| approved_by (Person), approved_on | C | ★ | "configurable with a named approver" (P6) |
| rationale_code | C | | |

### 2.2 Group B -- the cascade

**E-03 StrategicObjective:** objective_id, name, plan_year, owner_person_id (P); target_value and target_unit (S, from the plan); `appetite_consumed_pct` (D, from C-2). Cards: T2-1, T2-2, T2-3.

**E-04 PlanInitiative**

| Field | Side | ★ | Cards |
|---|---|---|---|
| initiative_id, name, objective_id | S | | 1, 2, 3, 5 |
| product_type_code | S | ★ | 3 (whether a financial crime or conduct metric is required) |
| plan_version, plan_volume, plan_value_gbp, launch_date | S | ★ | 1 (re-run on every plan version), 3 (S2 if launch within one quarter), 5 (campaign calendar) |
| actual_volume, actual_value_gbp (to date) | S | | 2 (plan shortfall) |

**E-05 PrincipalRisk:** principal_risk_id, name, **domain_key** {credit, market, liquidity, conduct, climate, fincrime, opsres, cyber, regulatory} matching `riskDomainsV4.ts` `[unverified -- confirm against repo]`, accountable_smf_id. Capital (CET1, leverage) has no domain key in the nine (S5-OD-1).

**E-06 RASStatement**

| Field | Side | ★ | Cards |
|---|---|---|---|
| statement_id, principal_risk_id, text_short | S | | 1, 2, 18 |
| capacity_value, appetite_value (red), unit | S | ★ | 1 (headroom denominator) |
| zero_tolerance_flag | S | ★ | 18 (must carry a proxy, ER-2) |
| temporary_limit, temp_expiry | S | ★ | 7 |
| approval_date, owner_smf_id | S | ★ | 16 |
| growth_linked_flag | P | | 2 (utilisation floor applies only to growth-linked statements; never financial crime or conduct) |

**E-07 Metric**

| Field | Side | ★ | Cards |
|---|---|---|---|
| metric_id, name_plain (board copy), principal_risk_id, ras_statement_id | S | | All |
| level {1, 2, 3} (labelled practice) | S | ★ | 4, 12, 20, 34 |
| metric_kind {kri, kci, capacity, governance, outcome, capital_liquidity, statutory} | P | | 5, 37, 40 |
| direction {higher_is_worse, lower_is_worse} | P | ★ | Every position |
| unit, numerator_label, denominator_label | S | ★ | Every number has a denominator (HF-2) |
| headline_flag, headline_since | S | ★ | 12 (12 of 34) |
| rollup_rule {worst_of, count_of_breaches, weighted} + rollup_params | C | ★ | 1, 4, 12, 20 (S5-OD-3; demo = worst_of) |
| exposure_base_gbp (for £ headroom) | S | ★ | 1, 8 (P4: £ plus own unit) |
| remediation_lead_time_days, recovery_time_days | P (CAL) | ★ | 4, 38 |
| expected_frequency {monthly, quarterly} | S | | 14 (staleness) |
| disclosure_tags[] {pillar3, annual_report, regulatory_return}, publication_date | S | ★ | 26 |
| definition_version | S | ★ | 22 |
| status_current (D), status_history[] (D) | D | ★ | 12, 20, 34, 35 (computed by C-6) |

**E-08 ThresholdSet** (calibration record, versioned)

| Field | Side | ★ | Cards |
|---|---|---|---|
| threshold_set_id, metric_id, version, is_current | P | | All positions |
| capacity, red (appetite), amber (trigger), operating_limit | P | ★ | All positions; nested order validated per `direction` |
| rationale_code, rationale_text_short | P | ★ | Trust threshold item 2; ER-3 (seasonality in rationale, never widening amber) |
| lead_time_days, volatility_input, seasonality_flag | P | ★ | 4, 20 |
| approved_by, approved_on, approving_forum_id | P | ★ | 20 (nothing re-tuned without approval; ER-10) |

**E-09 CascadeLink** (the cascade graph; the core product-owned asset)

| Field | Side | ★ | Cards |
|---|---|---|---|
| link_id, link_type {objective_ras, initiative_ras, rollup, obligation_metric, obligation_control, control_feed, metric_feed, action_metric, emerging_metric, journey_owner} | P | ★ | Every card that traces the chain |
| from_type, from_id, to_type, to_id | P | ★ | |
| evidence_type (for obligation links: control_test, kri, approval, training_record; P16) | P | | 18 |
| keyed_by, keyed_at, approved_by | P | ★ | Who mapped it |
| valid_from, valid_to, source_version_at_mapping | P | ★ | 18 (version drift) |

**E-10 MetricPair:** pair_id, leading_metric_id, lagging_metric_id, declared_by, declared_on (P). Pairs are declared, never mined. Cards: T2-21.

**E-11 PolicyObligation**

| Field | Side | ★ | Cards |
|---|---|---|---|
| obligation_id, source {policy, regulation, vreq, s166}, clause_ref | S | | 18, 31 |
| in_force_date, status {consultation, final}, source_version | S | ★ | 18 (drift), 29 (rule by in-force date), 31 |
| materiality {material, standard} | S | | 18 |
| owner_person_id | S | ★ | 16, 18 |
| product_type_codes[] (obligations a product type requires) | S | | 3 |

**E-12 Control**

| Field | Side | ★ | Cards |
|---|---|---|---|
| control_id, name_plain, design_type | S | ★ | 32, 33 (read-across by design shape) |
| feed_ids[] | S | ★ | 14, 32 |
| owner_person_id | S | ★ | 16, 17 (segregation of duties) |
| operating_rating {effective, partially_effective, ineffective} | S | ★ | 23 |
| test_frequency, next_test_due | S | | 23 |
| is_fincrime_control, is_zero_tolerance_proxy | P | | 15, 19 (S1 if coverage drops) |
| expected_alert_rate_band (lower, upper) per screened population | P (CAL) | ★ | 15 (silence) |
| approved_screening_frequency | S | | 15 |

**E-13 DataFeed:** feed_id, name_plain (face) and feed_code (drill only, R-11), source_system, target_system, reconciliation_frequency, tolerance_count_pct, tolerance_value_pct, cutoff_rule, grace_window_hours, owner_person_id, batch_design_code. All S except tolerance, cut-off and grace window, which are P (CAL). ★ on tolerance, cutoff_rule, grace_window_hours, reconciliation_frequency, owner. Cards: T2-14, T2-17, T2-32.

**E-14 Person:** person_id, display_name `[fictional]`, role_title, smf_function (SMF1, 2, 4, 5, 10, 11, 16, 17, or none), employment_status, left_on. S. ★ on smf_function and left_on (T2-16).

**E-15 OwnershipAssignment**

| Field | Side | ★ | Cards |
|---|---|---|---|
| assignment_id, object_type, object_id | P | ★ | 16 |
| person_id | P | ★ | 16 |
| owner_type {accountable_smf, risk_owner, control_owner, feed_owner, metric_owner, journey_owner} | P | ★ | 16, 44 (P9 and G-6: two owner types per node where relevant) |
| interim_flag, interim_since | S | ★ | 16 |
| mrm_version_id, effective_from, effective_to | S | ★ | 16 |

**E-16 MRMVersion:** mrm_version_id, effective_from, regime {smcr_phase1_apr2026, smcr_phase2_cp14_26_consultation}, entries[] (person_id, prescribed_responsibility_code, mapped_object_refs[]). S. ★ on effective_from and entries. Cards: T2-16.

### 2.3 Group C -- evidence (consumed)

**E-17 MetricObservation**

| Field | Side | ★ | Cards |
|---|---|---|---|
| metric_id, as_of, value | S | ★ | All positions |
| numerator, denominator | S | ★ | HF-2 |
| source_feed_id, source_run_id | S | ★ | Links the value to the reconciliation run that produced it (J-2) |
| version, restated_flag | S | ★ | 22, 26 |
| cohort_key, cohort_n (where cohort-cut) | S | ★ | 10, 25, 42 |

**E-18 ReconciliationRun**

| Field | Side | ★ | Cards |
|---|---|---|---|
| run_id, feed_id, run_started_ts, **run_completed_ts** | S | ★ | 14, 17 (attestation before completion) |
| source_count, target_count | S | ★ | 14 (completeness) |
| source_value_gbp, target_value_gbp (where held) | S | ★ | 14 (count and value, C18; S5-OD-2) |
| rejected_backlog, rejected_age_days | S | ★ | 14 |
| superseded_by_run_id | S | ★ | 17 |
| result_status {within_tolerance, shortfall} (D, from C-7) | D | ★ | 14, 17 |

**E-19 ReconciliationCohortResult:** run_id, cohort_key (for example `same_day_accounts`, `migrated_product_code`, `partner_channel`), cohort_source_count, cohort_target_count. S, all ★. Cards: T2-14.

**E-20 ControlTest:** test_id, control_id, test_date, test_population, result {passed, failed, partially_effective}, tester_person_id (S, ★ on result, date and tester); rcsa_self_rating, rcsa_cycle_date, rcsa_assessor_id (S). Cards: T2-23, T2-30, T2-32, T2-33.

**E-21 Attestation** (product-owned attestation record; the owner attests a result ID)

| Field | Side | ★ | Cards |
|---|---|---|---|
| attestation_id, object_type, object_id | P | ★ | 14, 17, 26, 28 |
| attester_person_id, attester_role | P | ★ | 17 (segregation of duties) |
| **attested_ts** | P | ★ | 17 (before `run_completed_ts`) |
| **attested_result_id**, attested_result_type {reconciliation_run, control_test, population_test_run} | P | ★ | 17 (none, superseded or failing result) |
| attested_status {reconciled_no_exceptions, reconciled_with_exceptions, not_reconciled} | P | ★ | 17 (attested "within tolerance" while the run shows a shortfall) |
| challenger_person_id, challenge_status | P | ★ | 17 (second-line challenge) |
| cycle_label | P | | 17 (3+ consecutive cycles) |
| commentary_text | **I** | | **Not populated** (Tier 3, H-5) |

**E-22 Issue** (issue or action)

| Field | Side | ★ | Cards |
|---|---|---|---|
| issue_id, raised_date, source {L1, L2, L3, regulator, external_review, complaint, skilled_person} | S | ★ | 37, 39, 40 |
| severity, severity_history[] (date, value) | S | ★ | 37 (latency from first "high"), 38 (downgrade) |
| linked_metric_ids[], linked_control_ids[] | S | ★ | 34, 38 (also via CascadeLink `action_metric`) |
| owner_person_id, owner_history[] | S | ★ | 38 (reassigned) |
| due_date, due_date_history[] | S | ★ | 36, 38 |
| status, status_history[] {open, closed, cancelled, risk_accepted} | S | ★ | 34, 38, 39 |
| closure_date, closure_evidence_flag, closure_signoff_by | S | ★ | 38, 39 |
| escalation_forum_id, escalation_date | S | ★ | 34, 37 |
| risk_acceptance_id | S | ★ | 39 |
| action_type {remediation, resourcing, regulatory, s166_milestone} | S | ★ | 5 (resourcing action present?), 36 |

**E-23 AuditFinding:** finding_id, rating, owner_person_id, due_date, extension_count, repeat_of_finding_id, status, validated_closure_date. S; ★ on rating, extension_count, repeat_of_finding_id, validated_closure_date. Cards: T2-36, T2-38, T2-40.

**E-24 Incident:** event_id, type, service_id, **detected_date**, **logged_date**, duration_minutes, customers_affected, gross_loss_gbp, root_cause_code, third_party_id, shadow_class_ps26 (keyed by the owner; T2-31). S; ★ on the two dates, duration and customers affected. Cards: T2-9, T2-29, T2-30, T2-31.

**E-25 ChangeRecord:** change_id, target_type {control, model}, target_id, parameter, old_value, **new_value**, **approved_value**, proposer_id, approver_id, validator_id, approval_date, deploy_date, retest_id, expected_effect_pct, expected_effect_window_days. S; ★ on approved_value, new_value, approver, retest_id, expected effect and the three person IDs. Cards: T2-15, T2-19, T2-24.

**E-26 Model:** model_id, use, tier, owner_person_id, validator_person_id, last_validation_date, validation_result, approved_params_ref, in_inventory_flag, performance_kri_ids[]. S; ★ on validation fields and in_inventory_flag. Cards: T2-24.

**E-27 Restriction:** restriction_id, type {vreq, s166}, imposed_date, accountable_smf_id, attestation_due_date, attestation_period_start, attestation_period_end. S; ★ on accountable SMF and the attestation dates. Cards: T2-27, T2-28.

**E-28 RestrictionClause**

| Field | Side | ★ | Cards |
|---|---|---|---|
| clause_id, restriction_id, clause_text_short | S | | 27, 28 |
| population_definition | S | ★ | 27 |
| **test_definition_id** (the executable test, decomposed by the product) | P | ★ | 27 (no executable test = S1 chain break) |
| test_owner_person_id | P | ★ | 27 |
| covered_routes[] {product, channel, migration, manual} | P | ★ | 27 (a route outside the test's coverage is "untested") |
| owner_smf_id | S | ★ | 16 (an unowned clause is S1) |

**E-29 PopulationTestRun**

| Field | Side | ★ | Cards |
|---|---|---|---|
| test_run_id, clause_id, run_date, period_start, period_end | S | ★ | 27, 28 |
| **population_in_scope**, **population_tested** | S | ★ | 27 (coverage denominator) |
| **breaches_accounts**, **breaches_customers** | S | ★ | 27 |
| breaches_by_route {product, channel, migration, manual} | S | ★ | 27 (manual = the override lane, MB24 partial) |
| previously_exited_count | S | | 27 |
| risk_rating_as_of_event (bool: ratings evaluated at event date) | S | ★ | 27 (point-in-time rating; S5-OD-12) |
| flag_fired_count, flag_blocked_pct (the bank's own flag view) | S | ★ | 27 (shown only as the contrast, never as status; HF-3, R-4) |
| breach_record_refs[] (pseudonymised; `smf17_restricted`) | S | | Not on the CRO face (HF-10) |

**E-30 ImportantBusinessService:** service_id, name, impact_tolerance_minutes, worst_disruption_minutes_ytd (D from Incident), critical_vulns_past_sla, dependency_ids[], dependency_map_completeness_pct. S; ★ on tolerance, worst disruption and completeness. Cards: T2-9.

**E-31 ConsumerDutyMeasure:** measure_id, outcome {products_services, price_value, consumer_understanding, consumer_support}, journey_code, cohort_key, cohort_n, value, tolerance, threshold, owner_person_id, action_ref, due_date, success_measure. S; ★ on value, tolerance, cohort_n and the five completeness fields. Cards: T2-42.

**E-32 ThirdParty:** third_party_id, name `[fictional]`, services_supported[], materiality_assessed_flag, meets_materiality_criteria (keyed), on_register_flag. S. Cards: T2-31.

**E-33 EmergingRisk:** emerging_id, name, principal_risk_id, horizon_months, velocity, owner_person_id, assessed_on. S; ★ on owner and assessed_on (horizon and velocity are owner judgements). Cards: T2-13.

### 2.4 Group D -- product-owned registers (D1: human-keyed structured data)

Every D1 entity carries the same **keying block**, all ★:

| Field | Meaning |
|---|---|
| keyed_by (Person) | The named human who entered the record. Never the AI, never a service account |
| keyer_role {cro_office, company_secretary, smf, second_line} | Default per OD-8: CRO office keys tension, ledger and manifest drafts; the company secretary keys board decisions |
| keyed_at | Timestamp |
| source_decision_ref | An ID for the forum decision behind the entry (for example a minute reference number). **The ID only; minute text is Tier 3** |
| entry_method = `manual_structured` | Constant in Tiers 1–2. `ai_extracted` is not a permitted value until Tier 3 (H-4, H-26) |

**E-34 GuardrailPair (tension register)**

| Field | Side | ★ | Cards |
|---|---|---|---|
| pair_id, name_plain | P | | 6 |
| metric_a_id, metric_b_id (partners) | P | ★ | 6 |
| agreed_trade_off_text_short | P | | 6 |
| bounds[] (metric_id, bound_type {max_increase, max_level, min_level}, value, unit) | P | ★ | 6 (2 of 3 bounds exceeded) |
| **floor_flag** per bound, floor_obligation_id | P | ★ | 6 (a floor is rejected as a tension; ER-9) |
| owner_person_id, review_date | P | ★ | 6 (review overdue) |
| last_decision_id (→ DecisionRecord) | P | ★ | 6 |
| keying block | P | ★ | D1 |

**E-35 DecisionRecord (decision and waiver register)**

| Field | Side | ★ | Cards |
|---|---|---|---|
| decision_id, decision_type {waiver, temporary_limit, risk_acceptance, recalibration, remediation_decision, trade_off_reset, appetite_change, resourcing, governance_review} | P | ★ | 5, 6, 7, 34, 39 |
| forum_id, decided_on, decided_by_forum (never the product) | P | ★ | 7, 34 |
| linked_object_refs[] (metric, pair, issue) | P | ★ | 34 (any decision ID in the window clears the trigger) |
| expiry_date | P | ★ | 7 |
| status {proposed, decided, expired, superseded} | P | ★ | G-7 / OD-9: "proposed to the BRC · decision pending" |
| keying block | P | ★ | D1 |

**E-36 WaiverCondition:** condition_id, decision_id, metric_id, bound_type, bound_value, evaluation_frequency (P, ★). `structured_conditions_present` (D) counts waivers without keyed conditions as a chain break. Cards: T2-7.

**E-37 ReportableEvent (ledger parent)**

| Field | Side | ★ | Cards |
|---|---|---|---|
| event_id (code drill only), title_plain | P | | 29 |
| event_type {incident, restriction_breach, control_failure, conduct_breach, data_breach, sanctions} | P | ★ | 29 (route mapping) |
| origin_unit_id (the card unit that opened the draft entry) | P | | 9, 14, 15, 19, 27 |
| **logged_awareness_date**, awareness_logged_by | P | ★ | 29, 30. The product never re-dates it |
| linked_record_refs[] (Issue, ControlTest, MetricObservation, Incident, PopulationTestRun) | P | ★ | 30 (CascadeLink keys, not text matching) |
| keying block | P | ★ | D1 |

**E-38 ReportabilityRoute (ledger child)**

| Field | Side | ★ | Cards |
|---|---|---|---|
| route_id, event_id | P | | 29 |
| route_type {sup15_3, pra_fr7, sup15_11, rep008, sar_question, ofsi, ico_art33, ps26_2_ps7_26} | P | ★ | 29 |
| rule_id (→ RuleLibraryEntry, by in-force date) | P | ★ | 29 |
| clock_start_ts (default = logged_awareness_date), clock_label (from rule) | P | ★ | 29 (time elapsed against the clock) |
| triage_target_ts (from `triage_target_hours`, practice) | C | ★ | 29 (labelled firm practice) |
| assessment_status {not_assessed, case_prepared, decided} | D | ★ | 29 (Boolean trap: siblings not assessed) |
| proposed_decider_id (proposed by the CRO, confirmed by a human) | P | ★ | 29, 30 (visibility scope for T2-30) |
| re_evaluation_date | P | ★ | 29 ("not reportable" with no re-evaluation date) |
| case_artefact_id (→ ArtefactVersion) | P | | 29 (the prepared case) |

**E-39 RouteDecision (append-only)**

| Field | Side | ★ | Cards |
|---|---|---|---|
| decision_row_id, route_id | P | ★ | 29 |
| decision {notify, not_reportable, defer_pending_facts} | P | ★ | 29 |
| decider_person_id (a named SMF), decided_ts | P | ★ | 29. A decision row with no named SMF is rejected |
| rationale_code, rationale_text_short | P | ★ | 29 |
| dissent_flag, dissenter_person_id | P | ★ | 29 |
| awareness_date_stands (bool) + rationale (T2-30 response) | P | ★ | 30 |
| supersedes_decision_row_id | P | ★ | Append-only chain |
| notification_made_on, notification_recorded_by | P | ★ | K-22 "days from awareness to notification". A **record of fact** keyed by the deciding SMF or their office after the firm has notified through its own channel. It is not an action, carries no "send" function, and the product never submits or notifies (S5-OD-9) |
| submission or send fields | -- | | **None exist.** No field, status or button in the model represents the product filing or notifying |

**E-40 RuleLibraryEntry:** rule_id, route_type, regime_ref (for example SUP 15.3, FR7, UK GDPR Article 33), clock_text (for example "immediately", "72 hours"), clock_hours (nullable), in_force_date, status {consultation, final}, **verification_status {unverified, verified}** (all `unverified` until checked against the texts, S5-OD-7), verified_by, verified_on. P (reference data, keyed). Cards: T2-29, T2-31.

**E-41 PackManifest:** manifest_id, forum_id, meeting_id, cycle_label, version_no, parent_artifact_id, status {draft, locked, circulated}, approved_by (the CRO for the BRC pack), approved_at, keying block. P (D1). ★ on status, approver and versions. Cards: T2-22, T2-35, T2-36, T2-37.

**E-42 PackItem:** item_id, manifest_id, object_type, object_id, qualifying_rule_id (→ RoutingRule), qualified (D), included (bool), placed_value, placed_rag, placed_as_of, placed_definition_version. P (D1). ★ on all of them. Cards: T2-22 (cross-forum mismatch), T2-35, T2-36, T2-37.

**E-43 PackOverride:** override_id, item_id, action {removed, deferred, merged}, approver_person_id, reason_code, override_at. P (D1). ★ on all. A removal with no reason code or approver is itself the S1 trigger of T2-35. Cards: T2-35.

**E-44 ReadAcrossEntry:** read_across_id, trigger_type {internal_issue, internal_test_fail, final_notice}, trigger_ref (issue_id, test_id or precedent_id), opened_on, matched_control_ids[], closure_date, closure_code {no_similar_issue, issue_found, superseded}, keyed_by. P. ★ on matched controls, closure date and code. Cards: T2-32, T2-33.

**E-45 Precedent:** precedent_id, firm_name (real), regulator, notice_date (with `[conflict]` note where engines disagree), penalty_gbp, failure_shape_code, control_type_codes[], posture_tag, source_url, tagged_by, tagged_on. P (reference). ★ on failure_shape_code, posture_tag and the dates and figures. Seed: the 12 v6 precedents in `precedentCorpus.ts` `[unverified -- confirm against repo]`. Notice text is not mined in Tiers 1–2. Cards: T2-33 and the precedent line on every card that has one.

### 2.5 Group E -- governance calendar and routing

- **E-46 Forum:** forum_id, name {Board, BRC, ERC, ALCO, Audit Committee, Model Risk Committee}, chair_person_id, cadence. C.
- **E-47 ForumMeeting:** meeting_id, forum_id, meeting_date, pack_lock_date. C. ★ on meeting_date (T2-4 "before the next forum"; T2-14 "within 10 working days of a forum"). Demo calendar: last ERC 14 October 2026; next BRC mid-December 2026 `[illustrative; Stage 9A fixes]`.
- **E-48 RoutingRule:** rule_id, target_forum_id, condition_expr (for example `level = 1 AND status IN (amber, red)`; `level = 2 AND consecutive_amber_periods >= persistence_n`; `issue past SLA by rating`), sla_days_by_rating, label `practice_not_rule`, approved_by, approved_on. C. ★ on all. Cards: T2-34, T2-35, T2-36, T2-37.

### 2.6 Group F -- surfaced units, drafts and the audit trail

**E-49 Unit** (the product's atomic surfaced object; one or more per card)

| Field | Side | ★ | Note |
|---|---|---|---|
| unit_id, card_id (T2-n), unit_type {position, breach, chain_break, tension_collision, reportability_case} | D | ★ | Method A |
| title_question (business question; resolves to a state, CL-001) | D | | Face |
| spine_path[] (ordered object refs), spine_upper_unresolved | D | ★ | HF-6 |
| status {within_appetite, amber, red, unverified, not_assessed}; flags beyond_capacity, operating_limit_exceeded; underlying_rag (kept for the drill when unverified) | D | ★ | Section 4.4: integrity overrides status |
| position_value, appetite_value, headroom_value, headroom_unit, headroom_gbp, denominator_value, denominator_label | D | ★ | HF-2 |
| trajectory {method = least_squares, window_points, slope, projected_threshold, projected_crossing_date, label = "early warning, not a prediction"} | D | ★ | C-3 |
| severity {S1..S4} (stored, never on the face), materiality_basis | D | ★ | O-3 routing |
| routed_forum_id, accountable_smf_id, routed_exec_ids[] | D | ★ | O-3 |
| suppressible (bool; false for any item a routing rule qualifies) | D | ★ | Method B.8, ER-5 |
| can_tell_text, cannot_tell_text, tier3_hook_ids[] | D | ★ | Group 2 partials (P2 fixed copy) |
| precedent_id (optional) | D | | Posture-tagged |
| data_as_of, comparison_as_of, delta_value, new_since_last_brc (bool) | D | ★ | Time-travel default |
| visibility_scope {all_board, cro_and_deciding_smf, smf17_restricted, owning_smf_private} | D | ★ | O-9 (D6) |
| illustrative_flag | D | ★ | `[illustrative]` on all synthetic values |

**E-50 IntegritySnapshot** (the four-dot badge; the honesty line)

| Field | Side | ★ | Note |
|---|---|---|---|
| snapshot_id, unit_id, evaluated_at | D | ★ | |
| owner_check {pass, fail}, owner_detail (role on the face; name in the drill) | D | ★ | C-9 |
| feed_check {pass, fail, stale}, last_reconciled_ts, completeness_pct | D | ★ | C-7 |
| attestation_check {pass, fail}, attested_by_role, attested_ts, attested_result_id | D | ★ | C-10 |
| mapping_check {pass, fail} | D | ★ | C-11 |
| overall {verified, unverified} | D | ★ | Section 4.4. Any failed check gives `unverified`; there is no partial green |
| caveat_status {none, drafted, accepted}, caveat_artefact_id | D | ★ | An accepted caveat lets the figure appear **in the pack with its caveat**. The face status stays `unverified` until the check passes (HF-1) |

**E-51 DraftAction**

| Field | Side | ★ | Note |
|---|---|---|---|
| draft_id, unit_id, draft_type {brc_paragraph, caveat_text, decision_paper, owner_note, remediation_request, reattestation_challenge, containment_proposal, per_route_case, per_clause_evidence_summary, resourcing_paper, calibration_proposal, mrm_change_draft, read_across_test_proposal, agenda_item, governance_review_proposal, promotion_reason} | D | ★ | |
| **action_verb {prepare, propose, draft, send_to_owner}** | D | ★ | HF-8: no "file", "notify", "submit" or "complete now" value exists |
| options[] (for propose: for example `restore_capacity`, `pace_growth`; never `lower_standard`) | D | ★ | HF-7 |
| ai_generated = true, ai_marker = true, reason_one_line | D | ★ | Rule 2; HF-4 |
| artefact_version_id | D | | E-54 |
| target_person_id / target_role | D | ★ | Routing |
| status {drafted, accepted, edited_and_accepted, rejected, sent_to_owner} | D | ★ | |

**E-52 HumanGateDecision:** gate_id, draft_id, decision {accept, edit_and_accept, reject}, decided_by (Person), decided_at, reason_code. P. ★ on all. Renders as "accepted by [name] on [date]".

**E-53 AuditLogEntry:** entry_id, ts, actor_id, actor_role, actor_kind {human, system}, action, object_type, object_id, artefact_version_id, reason_code, prev_entry_hash, entry_hash. P (system-written). ★ on all.

**E-54 ArtefactVersion:** artefact_id, version_no, **parent_artifact_id**, artefact_type, created_by {human id, or `ai_draft` with ai_marker}, created_at, content_ref, locked (bool). P. ★ on the chain fields.


---

## 3. Capability list (C- and O- coded)

Later stages cite these codes, not prose. **C-n** = analytics capabilities computed over the substrate and the product-owned records. **O-n** = operational capabilities: the drafting, gating, keying, routing, scoping and audit workflow around a unit. Every capability feeds at least one card. "Cards" lists the T2 numbers.

### 3.1 Analytics capabilities (C-1 to C-41)

| Code | Name | What it computes | Main inputs | Cards |
|---|---|---|---|---|
| C-1 | Cascade lineage resolution | Resolves each unit's ordered `spine_path[]` from objective to decision; flags `spine_upper_unresolved` | E-09 CascadeLink, E-15 | Every card (the spine on every unit); directly 1, 14, 27 |
| C-2 | Position and headroom against nested thresholds | Utilisation = actual ÷ appetite; headroom = appetite − actual, in the metric's own unit and in £ where `exposure_base_gbp` exists; position in the cascade capacity → red → amber → operating limit; `operating_limit_exceeded` and `beyond_capacity` flags. Always with a denominator | E-17, E-08, E-07 | 1, 2, 5, 8, 9, 10, 11, 12, 42, 45 |
| C-3 | Rule-based trajectory | Ordinary least-squares line over a declared window (default 6 points; minimum history 4); projected crossing date of the next threshold; two-window agreement (short and long window must both cross) before an early-warning unit fires. Labelled "early warning, not a prediction" | E-17 series, E-08 | 1, 4, 5, 7, 11, 21, 34, 36 |
| C-4 | Plan appetite consumption and binding constraint | Projects each RAS statement's position at plan-year end from `PlanInitiative.plan_volume` per plan version; identifies which constraint (appetite statement, CET1, leverage, LCR, NSFR) binds first | E-04, E-06, E-17, CAP metrics | 1, 2 |
| C-5 | Level 3 → Level 1 roll-up | Applies each Level 1 metric's declared `rollup_rule` (demo: worst-of) to its Level 2/3 children; records the rule used on the unit | E-07 rollup fields, E-09 `rollup` | 1, 4, 12, 20 |
| C-6 | Status evaluation and persistence | Evaluates status per metric per period against the current ThresholdSet, applying the integrity override (section 4.4); writes `status_history[]`; counts consecutive periods at amber or worse | E-17, E-08, E-50 | 12, 20, 34, 35, 37 |
| C-7 | Feed reconciliation completeness | Count and value completeness = target ÷ source; cohort-concentrated shortfall; rejected backlog age against SLA; staleness against `reconciliation_frequency`; applies `cutoff_rule` and `grace_window_hours` before declaring a shortfall | E-13, E-18, E-19 | 14, 17, 26; feed dot on every badge |
| C-8 | Silent-failure detection | Alert rate per screened population against `expected_alert_rate_band` for N consecutive periods; rule coverage ratio = active rule records ÷ reference list entries; screening frequency against approved; cohort silence (activity up while alerts per 10,000 flat or down) | KRI alert counts, list and rule counts, E-12, E-17 cohort rows | 15, 25 |
| C-9 | Owner and segregation-of-duties check | Every board object has an accountable SMF in the current MRM version; interim beyond the firm-set period; leaver not reassigned; same person owns and attests, or owns and validates | E-14, E-15, E-16, E-21, E-26 | 16; owner dot on every badge; 17, 19 |
| C-10 | Attestation integrity | Attested before the referenced run completed (beyond grace); references a superseded run or none; attested status contradicts the run result; 3+ consecutive attestations while the ratio trends down; attester owns the control tested | E-21, E-18, E-20, E-29, E-12 | 17, 26, 28; attestation dot on every badge |
| C-11 | Mapping check | Obligation with no linked control, metric or typed evidence (P16); zero-tolerance statement with no proxy metric; source version changed since mapping; plan initiative with no RAS link; in-horizon emerging risk with no metric | E-09, E-11, E-06, E-04, E-33 | 3, 13, 18; mapping dot on every badge |
| C-12 | Change-control check | Change with no approval or no re-test before deploy; deployed ≠ approved value; post-change effect beyond the expected effect within the declared window; proposer, approver and validator not three different people | E-25, E-12, E-26, E-17 | 19, 24; hand-off target for 15 |
| C-13 | Calibration check | Green-to-red with no amber period; amber band narrower than period-on-period volatility; median warning time shorter than declared lead time; amber persisting 4+ periods with no breach (fatigue candidate). Proposes; never re-tunes | E-17 history, E-08, `status_history[]` | 20 |
| C-14 | Leading–lagging drift | A declared leading indicator crosses its band or turns trend for 2 periods while its lagging partner is still green | E-10, E-17 | 21 |
| C-15 | Forum-horizon early warning | Projected crossing date (C-3) earlier than next forum date + the metric's remediation lead time | C-3 output, E-47, E-07 lead time | 4 |
| C-16 | Growth against control capacity | On one time axis: customer, onboarding and alert growth rates against qualified-capacity growth; customers per qualified handler and alerts cleared within SLA, side by side; queue age against amber; resourcing action or decision present within one cycle | E-04, E-17 capacity metrics, E-22 `action_type = resourcing`, E-35 | 5 |
| C-17 | Tension collision and floor check | Each registered pair: bound-by-bound evaluation, review-date check, and a floor check that rejects any bound carrying `floor_flag` as a tension and re-routes it as a breach | E-34, E-17, E-11 | 6; guard on 2 |
| C-18 | Waiver condition evaluation | Keyed waiver conditions (metric and bound) met or breached; expiry passed with the temporary limit still in the RAS register; condition at risk on trajectory; count of waivers with no structured conditions | E-35, E-36, E-06, E-17 | 7 |
| C-19 | Restriction population test evaluation | Per clause and run: coverage = tested ÷ in-scope; breaches (accounts and customers) by route; untested routes; "flag fired" figures held only as a contrast; months since last zero-breach month; clause with no executable test | E-27, E-28, E-29 | 27, 28 |
| C-20 | Per-clause attestation support | For the attestation period: each clause supported, partly supported or not supported by the structured evidence (breaches, untested population, missed runs, overdue milestones). Never drafts a compliance claim | C-19 output, E-22 s166 milestones, E-21 prior attestations | 28 |
| C-21 | Reportability route mapping and clocks | Maps an event type to every potentially engaged route through the rule library (selected by in-force date); elapsed time against each clock and the triage target; Boolean trap (one route decided, siblings not assessed); FCA decided with no FR7 decision for a dual-regulated firm; "not reportable" with no re-evaluation date or with new linked facts | E-37, E-38, E-39, E-40, E-01 `dual_regulated` | 29; draft entries opened from 9, 14, 15, 19, 27, 28 |
| C-22 | Earliest structured signal | For a ledger event, finds linked structured records (issue, failed test, KRI breach, incident detected date, failed population test) earlier than the logged awareness date by more than the firm-set gap; links by CascadeLink keys, never text | E-37 links, E-22, E-20, E-17, E-24, E-29 | 30 |
| C-23 | Forward-regime readiness | Back-tests incidents against the 18 March 2027 thresholds (shadow classification present or not); third parties meeting materiality but not registered; upcoming obligations with no owner, control or readiness evidence; consultation kept distinct from final | E-24, E-32, E-11, E-40 | 31 |
| C-24 | Read-across matching | Internal: other controls sharing `design_type` or `feed_id` with a failed control and no read-across within N days. External: precedent `failure_shape_code` × control type, read-across closed "no similar issue" with no later test on matched controls | E-12, E-20, E-44, E-45 | 32, 33 |
| C-25 | Persistence without record | Level 1 amber or red, or Level 2 amber for ≥ N periods, with no linked open action, no decision ID and no escalation at the routed forum over the persistence window; secondary count of unlinked actions on the same risk | C-6 output, E-22, E-35, E-48 | 34 |
| C-26 | Pack qualification and override check | Items that meet a routing rule for a forum against that forum's manifest; removals with no reason code or approver | E-48, E-41, E-42, E-43 | 35, 36 |
| C-27 | Cross-forum pack consistency | Same metric and as-of period placed with a different value, RAG, definition version or as-of date in different forums' manifests, or against the system of record; favourable-in-higher-forum ranked first; restatements shown | E-42, E-17 | 22 |
| C-28 | Remediation ageing and clearance projection | High-rated findings and regulatory actions past due with no BRC manifest entry; extension count over limit; repeat findings; backlog flat or growing; least-squares clearance date against committed date | E-23, E-22, E-17 backlog series, E-42 | 36 |
| C-29 | Escalation latency | Median days from severity first reaching "high" (and, shown alongside, from raised date) to first BRC escalation or BRC manifest entry, for high+ issues; count still unescalated after N cycles | E-22 severity_history, escalation fields, E-42 | 37 |
| C-30 | Action effectiveness | Closed actions whose linked metric is still outside band after the declared recovery time; downgrades with no metric improvement; cancelled, reassigned or re-dated actions with no closure evidence while the metric is amber or red; closures not validated where required; share of actions with no linked metric | E-22, E-23, E-09 `action_metric`, E-17, E-07 recovery time | 38 |
| C-31 | Challenge closed then breached | L2-raised issues closed without second-line sign-off or converted to risk acceptance, followed by a breach on the linked object within N months; business-unit level only | E-22, E-35, E-17, E-20 | 39 |
| C-32 | Self-identification ratio | High-severity issues found by L1 or L2 ÷ all high-severity issues, per period, with external sources broken out | E-22 source, E-23 | 40 |
| C-33 | Disclosure readiness | Metrics tagged for external disclosure with an open linked issue, a restatement, an "unverified" integrity status or an unattested reconciliation within N days of publication | E-07 disclosure tags, E-22, E-17, E-50 | 26 |
| C-34 | Model governance position | Validation overdue by tier; performance KRI outside band; output volume drop after an unvalidated change; model in use but not in the inventory | E-26, E-25, E-17 | 24 |
| C-35 | Headline promotion lane | Non-headline Level 1 metric that goes amber or red or passes a velocity rule is proposed for promotion; a headline green for 8 quarters is proposed for rotation; enforces the configurable cap | E-07 headline_flag, C-6 output, C-3 slope, E-02 `headline_cap` | 12 |
| C-36 | Emerging-risk overlay | Maps emerging risks to principal risks by horizon band; flags time to crystallise inside the plan horizon | E-33, E-05, E-09 | 13 |
| C-37 | Consumer Duty outcome tolerance and completeness | Measure against tolerance by journey and cohort (suppressed below minimum cohort size); five-element completeness (threshold, owner, action, due date, success measure); evidence position per outcome | E-31, E-22, CMP counts | 42, 43, 45 |
| C-38 | Complaints step change and journey ownership | Coded complaint step change on a journey within N weeks of a deployment; journey with no horizontal owner and a complaint rate above band | CMP counts, E-25, E-15 `journey_owner` | 44 |
| C-39 | SMF structured-steps coverage | For breaches on objects in an SMF's SoR: action assigned, escalation logged, follow-up, closure evidence, current attestation; aggregate coverage only after SMF review | E-16, E-22, E-21, E-29 | 41 |
| C-40 | Impact-tolerance headroom and concentration | Worst disruption this year ÷ tolerance per important business service; critical vulnerabilities past SLA on the service path; a dependency serving 3+ important services; dependency-map completeness as the denominator | E-30, E-24, E-32 | 9 |
| C-41 | Control rating against test evidence | Register operating rating "effective" while the latest independent test failed or was partially effective, or no test ran within the declared frequency; RCSA self-rating above the latest independent test; on failure, linked metrics turn "unverified" | E-12, E-20, E-09 | 23 |

### 3.2 Operational capabilities (O-1 to O-13)

| Code | Name | What it does | Cards |
|---|---|---|---|
| O-1 | AI drafting | Produces `DraftAction` artefacts with `action_verb ∈ {prepare, propose, draft, send_to_owner}`, the AI marker, a one-line plain-language reason, and options that never include "lower the control standard" | Every card |
| O-2 | Human gate | Accept, edit-and-accept or reject by a named person; renders "accepted by [name] on [date]"; nothing leaves draft without it | Every card |
| O-3 | Materiality routing and non-suppression | Assigns severity, routed forum, accountable SMF and routed executives by materiality and decision need (method B.8); marks `suppressible = false` on anything a routing rule qualifies or anything past SLA | Every card; 34, 35, 36 are the visible proof |
| O-4 | Exception feed and pack-build manifest | Assembles the BRC exception feed and the draft manifest from qualifying units; the CRO approves; any removal requires an override with approver and reason code; manifests versioned draft → locked → circulated | 22, 34, 35, 36, 37, 38 |
| O-5 | D1 register keying | Structured forms for the tension register, the decision and waiver register, the reportability ledger and the pack manifest; stamps the keying block; rejects entries with no named keyer; `entry_method = manual_structured` only | 6, 7, 29, 34, 35 (and every card whose trigger reads a D1 register) |
| O-6 | Reportability ledger workflow | Opens a draft ledger entry from an originating unit; prepares the case per route (facts, rule text by in-force date, options with rationale); proposes a decider; records the SMF's decision append-only with rationale and dissent; schedules re-evaluation; records the awareness-date response to T2-30 | 27, 28, 29, 30; draft entries from 9, 14, 15, 19 |
| O-7 | Send to owner and handoff | Sends an accepted draft (remediation request, re-attestation challenge, containment proposal, owner note, read-across test proposal) to the named owner with an audit entry; deep-links to the v6 CRSA cockpit (SMF16) and MLRO workspace (SMF17) where those screens exist (OD-7) | 4, 5, 14, 17, 19, 21, 23, 27, 32, 33, 38 |
| O-8 | Integrity badge and caveat workflow | Renders the four-dot badge from `IntegritySnapshot`; applies the integrity override; drafts caveat text; on acceptance, carries the figure into the pack with its caveat while the face status stays "unverified" | 14, 15, 16, 17, 18; every headline |
| O-9 | Visibility scoping | Enforces `visibility_scope`: T2-30 to the CRO and deciding SMF only (D6); customer-level financial crime records and SAR state restricted to SMF17; private SMF trails | 25, 27, 29, 30, 41 |
| O-10 | Immutable audit log and artefact versioning | Writes a hash-chained `AuditLogEntry` for every draft, gate, keying, send and restricted read; maintains `parent_artifact_id` chains | Every card |
| O-11 | Configuration governance | Holds practice settings, routing rules, threshold sets and `firm_type` with named approvers and `practice_not_rule` labels; any threshold or model change is a proposal routed to the accountable owner, never a product write | 2, 8, 12, 20, 34, 35, 37; every threshold |
| O-12 | Precedent corpus management | Holds real UK Final Notices with structured tags (failure shape, control type, date, penalty, posture tag) keyed by a named person; surfaces a one-line precedent reference on a card | 33; precedent line on 5, 14, 15, 16, 19, 27, 36 |
| O-13 | Time-travel comparison | Applies the default comparison per card type (quarter-on-quarter; latest run against previous run for monthly-run evidence; clocks for reportability; rolling 4 quarters for escalation health); sets `new_since_last_brc` | Every card |

### 3.3 Persona top questions mapped to capabilities (gap check)

| Question (Stage 4) | Capabilities | Tier 2 answer | Gap marker |
|---|---|---|---|
| Q1 Appetite used by the plan; headroom to grow | C-1, C-2, C-3, C-4, C-5, C-17 (guard), O-1, O-13 | Full | None |
| Q2 What heads for amber or red before the next forum | C-3, C-15, C-14, C-6, O-7 | Full | None. Depends on the roll-up rule (S5-OD-3) |
| Q3 Board figures I cannot defend | C-7, C-8, C-9, C-10, C-11, C-12, C-27, C-33, C-41, O-8 | Full on structured records | **By design (Tier 3):** attestation commentary quality, H-5 |
| Q4 Restrictions obeyed across the population; can the SMF attest | C-19, C-20, O-6, O-9 | Full | **By design (Tier 3):** workarounds in service notes (H-24); attestation text (H-25) |
| Q5 Growth outrunning control capacity | C-16, C-3, O-7 | Full | **By design (Tier 3):** whether the strain was escalated on the record (H-8). **Data gap:** qualified-FTE and alerts-cleared-within-SLA feeds are often not held as KRIs (S5-OD-6) |
| Q6 Trade-offs agreed; collisions; floors | C-17, C-18, O-5 | Full, **provided the tension register is keyed (D1)** | **By design (Tier 3):** bounds against minutes (H-4) |
| Q7 What may be reportable, which clock, who decides | C-21, C-22, O-6, O-9 | Full, provided the ledger is keyed (D1) | **By design (Tier 3):** awareness from narrative (H-6); HR conduct feed (H-34). **Verification gap:** all clock values `[unverified]` (S5-OD-7) |
| Q8 Is bad news reaching the BRC | C-25, C-26, C-28, C-29, C-30, C-31, C-32, O-4 | Full on structured records, provided the pack manifest is keyed (D1) | **By design (Tier 3):** minutes against metrics (H-1, H-2, H-9) |
| Q9 Read-across after a Final Notice | C-24, O-12 | Full | **By design (Tier 3):** memo and minutes (H-17) |
| Q10 Emerging risks mapped; horizon; no metric | C-36, C-11, C-23 | Full | **By design (Tier 3):** risks discussed but not registered (H-18) |

**Result:** no persona top question lacks a capability. The gap markers are either deliberate Tier 3 boundaries (carried as "cannot tell" lines) or data or verification gaps raised as open decisions.

---

## 4. Product pipeline (the methodology's section C instantiated)

The method defines **five** stages (an assurance adaptation of the five-field use-case pipeline). This build instantiates exactly five. It does not import a detection pipeline from another product.

### 4.1 The five stages for this product and domain

| # | Method stage | What happens in this build | Entities written or read | Capabilities | Output |
|---|---|---|---|---|---|
| 1 | **Requirement** | Load the strategy and plan, the RAS and limit register, threshold sets with rationale, policy and regulatory obligations, VREQ and s166 clauses decomposed into executable population tests, the rule library by in-force date, the forum calendar and the routing rules. Key the cascade graph links. Key the D1 registers as forums decide | E-01 to E-16, E-27, E-28, E-34 to E-36, E-40, E-45 to E-48 | C-1, C-11 (structural mapping check), O-5, O-11, O-12 | A resolved cascade graph; an executable test per restriction clause; a versioned threshold set per metric |
| 2 | **Evidence** | Ingest, never own: metric time series, reconciliation runs with cohort breakdown, control tests and RCSA, issue and action logs, audit findings, incidents, change and parameter logs, the model inventory, population test runs, Consumer Duty MI, third-party fields, the emerging-risk register. Committee minutes are **not** ingested in Tiers 1–2 | E-17 to E-33 (S side; each with `source_system`, `source_record_id`, `ingested_at`) | (ingest only) O-13 sets `data_as_of` | Evidence stamped with source and as-of |
| 3 | **Sufficiency** | Compute position, headroom and trajectory against nested thresholds; roll up Level 3 → Level 1; run the six chain-integrity checks (owner, feed, attestation, mapping, restriction, change) and the silent-failure checks; run the tension pairs and waiver conditions; run the escalation-health measures | E-49 (draft units), E-50 | C-2 to C-20, C-24 to C-41 | Candidate units with status, headroom, trajectory and integrity |
| 4 | **Attestation** | The owner attests a **result ID** (a reconciliation run, control test or population test run), never a bare value; the second line challenges; C-10 tests the attestation against the result. Any AI sufficiency note is advisory and marked | E-21, E-50 | C-9, C-10, O-8 | Integrity snapshot per unit; "attested without evidence" where it fails |
| 5 | **Gap / escalation** | Raise breaches, chain breaks and collisions as units only if each carries an action, an owner and its chain (method A); triage reportability across every route; route by materiality, not RAG; assemble the exception feed (non-suppressible items); draft the action; record the human gate and the audit entry | E-37 to E-39, E-41 to E-43, E-49, E-51 to E-54 | C-21, C-22, C-23, O-1 to O-4, O-6, O-7, O-9, O-10 | Rendered cards with drafts, gates and audit trail |

**Card admission rule (method A, applied at stage 5).** A candidate unit with no action, no owner or no resolvable chain is not rendered as a card. If the missing piece is the owner or the chain, it is re-raised as a chain-break unit (T2-16 or T2-18) instead.

### 4.2 Analysis grain

| Unit family | Grain the method computes at | Default comparison |
|---|---|---|
| Position (headroom, trajectory, capacity, impact tolerance, outcomes) | metric × period (quarter for board metrics, month for monthly KRIs) × legal entity (single entity in the demo) × optional slice {product, channel, region, journey, cohort} | Q3 2026 (as at 30 September 2026) against Q2 2026 (as at 30 June 2026); trajectory over a 6-point window |
| Breach (threshold, waiver, persistence, remediation) | metric or object × period × Level × routed forum | Against the current threshold set; persistence counted in consecutive periods |
| Chain break: feed and attestation | feed × reconciliation run (monthly) × cohort; attestation × referenced run × cycle | Latest run against previous run, with the run date shown |
| Chain break: owner, mapping, change, calibration | board object × MRM version; obligation × source version; change × parameter × deploy date; metric × 8-quarter history | Current MRM and source version against the version at mapping |
| Restriction | clause × population test run (monthly) × breach route | Latest run against previous run; months since last zero-breach month |
| Tension collision | guardrail pair × bound × period | Against keyed bounds and the review date |
| Reportability case | event × route × clock | Time elapsed since `clock_start_ts` against the rule clock and the triage target |
| Escalation health | issue or metric × forum cycle (quarter) | This quarter against last quarter over a rolling 4 quarters |

Cohort-cut grains (T2-10, T2-11, T2-25, T2-42) are suppressed below `Firm.min_cohort_size`.

### 4.3 Comparison basis (what each unit is scored against)

| Basis | Held in | Used by |
|---|---|---|
| Nested thresholds: capacity, red (appetite), amber (trigger), operating limit, each with an approved rationale | E-08 ThresholdSet | Every position and breach |
| Plan volumes by plan version | E-04 PlanInitiative | C-4 (T2-1, T2-2), C-16 (T2-5) |
| Prior period value | E-17 | Every delta on the face |
| Declared tolerance, cut-off rule, grace window, frequency | E-13 | C-7, C-10 |
| Expected alert-rate band; list size | E-12; KRI | C-8 |
| Zero breaches across 100% of the in-scope population | E-28, E-29 | C-19, C-20 |
| Keyed bounds and floor flags | E-34 | C-17 |
| Keyed waiver conditions and expiry | E-35, E-36 | C-18 |
| Rule-library clocks by in-force date; triage target (practice) | E-40, E-02 | C-21 |
| Routing rules, persistence N, SLA by rating, extension limit, latency threshold, self-identification target (all practice) | E-48, E-02 | C-25 to C-32 |
| Approved value and expected effect | E-25 | C-12 |

### 4.4 Status precedence: integrity overrides status

The method fixes this rule (section D, "green on a broken feed"; section F, "never green when integrity fails"). It is evaluated per unit, in order. The first rule that applies sets the status.

| Order | Condition | Status on the face |
|---|---|---|
| 1 | No current threshold set, or no observation for the period | `not_assessed` (with the reason) |
| 2 | Any of the four badge checks fails: owner, feed (shortfall or stale), attestation, mapping | **`unverified`**. The underlying RAG is kept in the drill as "would read [colour] if verified" |
| 3 | Value at or beyond red (appetite) | `red` (`beyond_capacity` flag set if past capacity) |
| 4 | Value at or beyond amber (trigger) | `amber` |
| 5 | Otherwise | `within_appetite` (`operating_limit_exceeded` flag set if past the operating limit) |

- Only RAG plus "unverified" are status values (Stage 4, section 1.7). `beyond_capacity` and `operating_limit_exceeded` are flags shown as markers on the threshold cascade, not as extra colours.
- An accepted caveat (O-8) does **not** change the status. It lets the figure travel into the pack with its caveat.
- `Unit.status` in section 2.6 is therefore {within_appetite, amber, red, unverified, not_assessed}, plus the two flags.

### 4.5 Severity and routing (method B.8, catalogue section 1.5)

Severity is stored on the unit and drives routing. It never appears as an S-code on the face (R-11); the face shows position and urgency.

| Severity | Routing (O-3) | Suppressible |
|---|---|---|
| S1 | CRO and accountable SMF the same day; BRC chair out of cycle at the CRO's call (never automatic, P8) | No |
| S2 | ERC agenda, then the BRC exception feed; an override needs a named approver and reason code | No once qualified |
| S3 | Owner and second line; ERC by exception | Yes, with a reason |
| S4 | Owner; ERC summary line | Yes |

Routing rules, the persistence N and the 10-working-day forum window are firm configuration labelled `[practice-not-rule]`.


---

## 5. Unit and signal library (one methodology-template block per rendered card)

### 5.0 Block format

Each block fills **every field of the methodology's per-unit spec template (section E)**, rows M1 to M12, in the method's order. Rows X1 to X9 add the fields the stage file requires that the method template does not name separately. They extend the template; they do not replace it.

| Row | Field | Source |
|---|---|---|
| M1 | Unit (id / name) and type | Method E |
| M2 | Spine position | Method E |
| M3 | Metric / condition (formula; threshold set capacity / red / amber / limit + rationale) | Method E |
| M4 | Trajectory rule | Method E |
| M5 | Integrity checks: owner · feed reconciled (date) · attested (by, date) · mapped | Method E |
| M6 | Restriction test (if any) | Method E |
| M7 | Tension pair (if any) | Method E |
| M8 | Reportability (if any) | Method E |
| M9 | Routing (forum by materiality; accountable SMF) | Method E |
| M10 | Action (draft action; human gate; audit entry) | Method E |
| M11 | Precedent link (real UK Final Notice, posture-tagged) | Method E |
| M12 | Boundary | Method E: "AI drafts and challenges; never decides, files, or re-tunes" |
| X1 | Capabilities and feeds (C-/O- codes; Stage 3 record codes) | Stage 5.5 "inputs/feeds" |
| X2 | Trust gate (evidence sufficiency before the unit may show a status) | Stage 5.5 |
| X3 | Coverage / confidence shown | Stage 5.5 |
| X4 | Impact sizing (£, points, coverage %, customers) | Stage 5.5 |
| X5 | False-positive and over-claim rule-outs | Stage 5.5 |
| X6 | **Honesty line** (the input that actually proves the unit; where detection and attribution use different inputs) | Stage 5.5, quality bar |
| X7 | Can tell / cannot tell + Tier 3 hook (Group 2 partials only; fixed copy per P2) | Catalogue 4.0 |
| X8 | Binding and visibility (Stage 4) | Stage 4 map |
| X9 | Seed readout (catalogue wording, `[illustrative]`) and tie-out flags (TC-n, section 9.3) | Catalogue; for 9A |

**Standing values, so blocks do not repeat them:**
- **M12** is the same in every block: *AI drafts and challenges; never decides, files, notifies or re-tunes. Every AI element carries the AI marker and a one-line reason, and shows "accepted by [name] on [date]" once a named human accepts it.* A block adds to M12 only where the card has a specific boundary.
- **M10** always means: O-1 drafts → O-2 named human gate (accept / edit-and-accept / reject) → O-10 audit entry and artefact version → O-7 send to owner where relevant. Each block names the draft, the gate holder and the decider.
- **M4, where "n/a":** the unit is a check or a count, not a projected position. No trajectory is shown, so no "early warning" label is needed.
- **M5** describes the integrity of the unit's **own inputs**. If any check fails, the unit's status reads "unverified" (section 4.4). For chain-break cards, the failing check *is* the unit.
- Roles appear on the face; names appear in the drill (Stage 4 trust threshold item 4). Every name is `[fictional]`.

Blocks are ordered: the 12 core demo-spine cards by beat (5.1 to 5.4), with the 5 reserves inside their beats; then the other Layer 1 bound and embedded cards (5.5); then the drill and count-only cards (5.6). **Full table blocks** cover all 23 Layer 1 cards (the 17 demo-spine cards plus T2-2, T2-3, T2-8, T2-12, T2-13 and T2-18). The 18 drill and count-only cards are listed one line each in 5.6.

---

### 5.1 Beat 1 -- Headroom and growth against control capacity

#### T2-1 · How much appetite is the plan using, and when does a constraint bind? (core)

| Row | Value |
|---|---|
| M1 | U-T2-1. **Position** (headroom and trajectory) |
| M2 | Objective "grow owner-occupied mortgage lending" `[illustrative]` → RAS statement: high-LTV (over 90%) share of new lending ≤ 20% → **Level 1:** high-LTV share of new lending (%) → Level 2/3: LTV mix by channel and product (worst-of roll-up, demo default) → obligation: responsible lending policy → control: LTV and affordability decision rule at origination → feed: mortgage origination to risk MI → owner: accountable SMF for credit per the MRM; risk owner the Chief Credit Officer → attestation: origination feed reconciliation, attested by the feed owner → escalation: BRC appetite recommendation |
| M3 | **Utilisation** = actual ÷ appetite = 17.6% ÷ 20% = 88%. **Headroom** = appetite − actual = 2.4 points; **£ headroom** = 2.4 points × £4.0bn new-lending plan = **£96m**. Fires S3 if the projection crosses amber inside the plan horizon; S2 if it crosses red inside the plan horizon; S2 if CET1, leverage, LCR or NSFR becomes the binding constraint on the plan (C-4). **Threshold set:** capacity (set at 9A) / red 20% / amber (9A; must sit between 17.6% and 20% for the readout to hold, TC-2) / operating limit (9A). **Rationale:** lead time to change lending criteria and pricing, plus quarter-on-quarter volatility of the completion mix |
| M4 | OLS over the last 6 quarterly points, then forward at plan volumes for the current plan version. Shows the projected quarter of the amber crossing ("amber in Q2 2027 at plan volumes"). Label: "early warning, not a prediction" |
| M5 | owner ✓ (accountable SMF and risk owner mapped) · feed ✓ (reconciled; run date shown) · attested ✓ (feed owner, against that run ID) · mapped ✓. This headline is **verified** in the demo, so it sits beside the T2-14 headline that is not |
| M6 | n/a |
| M7 | n/a. The utilisation-floor reading (T2-2) never applies to financial crime or conduct lines |
| M8 | n/a |
| M9 | S3 → ERC; S2 → BRC agenda item "appetite recommendation", with CFO sign-off on capital figures. Accountable: the CRO presents; the board decides on the BRC's recommendation |
| M10 | **Propose** one of three for the BRC: re-phase the initiative; recommend an appetite change with rationale; or confirm deliberate use of headroom. **Prepare** a draft BRC paragraph. Gate: the CRO accepts or edits; the CFO's sign-off of capital figures appears as an "accepted by" line. The board's decision is keyed afterwards into the decision register by the company secretary (D1); until then the card reads "proposed to the BRC on [date] · decision pending" (OD-9) |
| M11 | None required. Any appetite increase is a board decision, never auto-applied |
| M12 | Standing |
| X1 | C-1, C-2, C-3, C-4, C-5, O-1, O-2, O-13. Records: RAS, KRI, CAP (plan volumes by initiative and version; CET1, leverage, LCR, NSFR; ICAAP stressed low point), CG, CAL |
| X2 | All four badge checks pass on the metric and its feed; the plan version is stamped; at least 4 history points. If the history is shorter, the trajectory is withheld and the card says so |
| X3 | Badge + data as of 30 September 2026; plan version used; trajectory window and point count. The drill shows headroom as a range and under the stress view (P4) |
| X4 | 2.4 points and £96m of a £4.0bn new-lending plan; the binding constraint named ("high-LTV appetite, not capital") |
| X5 | Plan revised mid-year → re-run on every plan version and show the version. Seasonal completion mix → window of at least 4 quarters. Roll-up choice → the rule used is shown on the unit (S5-OD-3). Never headroom without a denominator (ER-11) |
| X6 | **Detection and sizing** come from the RAS register, the KRI series and the corporate plan's volumes. **The projection assumes plan volumes and the current product mix.** It is an early warning, not a lending forecast. It does not claim to know why the mix is moving |
| X7 | n/a (Group 1) |
| X8 | L1 bound, beat 1. Visible to all board viewers |
| X9 | "High-LTV (over 90%) share of new lending 17.6% against appetite 20%: headroom 2.4 points, about £96m of a £4.0bn new-lending plan. Early-warning projection: amber in Q2 2027 at plan volumes. Binding constraint: high-LTV appetite, not capital `[illustrative]`." **TC-2** (conflict with the T2-7 waiver on the same limit) |

#### T2-4 · What will cross amber before the next forum, given remediation lead time? (reserve, embedded)

| Row | Value |
|---|---|
| M1 | U-T2-4. **Position → breach** (velocity) |
| M2 | Objective "maintain a resilient funding base" `[illustrative]` → RAS: liquidity coverage → **Level 1:** LCR 12-month average → Level 2: deposit outflow indicators → obligation: liquidity risk policy (PRA liquidity rules) → control: ALCO liquidity monitoring → feed: treasury liquidity reporting → owner: CFO (SMF2) as accountable for liquidity per the MRM `[illustrative]`; risk owner the Treasurer → attestation: treasury feed reconciliation → escalation: ALCO, then the BRC chair's early-warning line |
| M3 | Fires when **projected crossing date (C-3) < next forum date + metric remediation lead time** (C-15). LCR 12-month average 162%; amber 150%; projected amber in 9 weeks; BRC in 7 weeks; ALCO lead time 6 weeks: 7 + 6 = 13 weeks > 9 weeks, so it fires. **Threshold set:** capacity (regulatory minimum plus buffers) / red (9A) / amber 150% / operating limit (9A). Rationale: ALCO action lead time and outflow volatility. Fast and slow windows are `[practice-not-rule]` |
| M4 | Two-window OLS (short window 3 points, long window 6) over monthly points; both must project a crossing before the unit fires. "Early warning, not a prediction" |
| M5 | owner ✓ · feed ✓ (treasury feed, run date) · attested ✓ · mapped ✓ |
| M6 | n/a |
| M7 | n/a |
| M8 | n/a |
| M9 | Level 1 → S2 to the BRC chair's early-warning line; Level 2 → S3 to ERC. Routed to the first-line owner, the CFO and ALCO |
| M10 | **Propose** a pre-emptive owner action and an early ERC flag; **prepare** a draft note to the owner. Gate: the CRO accepts; the owner decides the action. Sent to the owner with an audit entry |
| M11 | None |
| M12 | Standing |
| X1 | C-3, C-5, C-15, O-1, O-7. Records: KRI series, CAL (lead time, volatility), RAS, FCL forum dates |
| X2 | At least 4 points of monthly history; both windows agree; a current forum calendar |
| X3 | Weeks to crossing, weeks to the forum and lead time shown together, so the arithmetic is visible |
| X4 | Weeks of warning lost (here: 4 weeks short) |
| X5 | Volatile series → minimum history and two-window agreement. Roll-up for a Level 3 metric → its declared rule only (S5-OD-3) |
| X6 | Proved by the KRI series, the approved lead time and the forum calendar. It **does not** predict the liquidity outcome; it says the warning arrives too late for the next forum |
| X7 | n/a |
| X8 | L1 embedded: an early-warning marker on the scorecard row; detail in the drill |
| X9 | "LCR 12-month average 162% against amber 150%; projected amber 9 weeks out; BRC in 7 weeks; ALCO lead time 6 weeks: act now `[illustrative]`." Consistent with the forum calendar (next BRC mid-December 2026) |

#### T2-5 · Is growth outrunning financial crime control capacity? (core)

| Row | Value |
|---|---|
| M1 | U-T2-5. **Position** (capacity headroom) → **tension** (growth against capacity on one time axis) |
| M2 | Objective "grow mortgage and savings balances and digital member onboarding" `[illustrative]` → RAS: financial crime appetite (no appetite for unmanaged financial crime risk) → **Level 1:** alert queue median age (days); members per qualified financial crime handler → Level 2: CDD refresh backlog; alerts cleared within SLA → obligation: MLRs and SYSC 6 systems and controls → control: transaction monitoring alert handling → feed: case management to risk MI; HR qualified-FTE count → owner: SMF17 (Head of Financial Crime) → attestation: monthly financial crime feed attestation → escalation: CEO and board decision "restore capacity or pace growth" |
| M3 | Growth ratio = member growth % ÷ qualified-capacity growth %. **Members per qualified handler** = members ÷ qualified FTE: 1.45m ÷ 58 = 25,000 → 1.90m ÷ 63 = 30,160. Fires S2 if customers per handler, queue age or CDD backlog projects past amber within the plan horizon; **S1** if queue age is already past amber and is a Level 1 financial crime metric (19 days against amber 14, since August). **Sub-trigger (MB8 partial):** capacity past amber with no `Issue.action_type = resourcing` and no DecisionRecord within one cycle. **Sub-trigger (GM):** a growth-enabling appetite change approved with no recorded capacity check. **Threshold set:** queue age red (9A) / amber 14 days; customers per handler red and amber (9A). Rationale: hiring and training lead time for qualified handlers |
| M4 | OLS on both series (members and qualified FTE) over 6 points, projected to the next campaign date (6 weeks). "Early warning, not a prediction" |
| M5 | owner ✓ (SMF17) · feed ✓ (case-management feed; HR FTE feed) · attested ✓ · mapped ✓. If the qualified-FTE feed is not held as a reconciled KRI, the feed dot fails and the capacity side reads "unverified" (S5-OD-6) |
| M6 | n/a |
| M7 | Not a registered guardrail pair. Financial crime is a **floor**: no bound on it may be traded (HF-7). The card offers only "restore capacity" or "pace growth" |
| M8 | n/a unless queue age causes a missed-suspicion risk; then a draft ledger entry is proposed through T2-29 |
| M9 | S2 → ERC and BRC; S1 → CRO and SMF17 the same day, BRC chair informed at the CRO's call. Decision: CEO and board |
| M10 | **Propose** one of two: restore capacity (with a **resourcing paper prepared** for SMF17) or pace growth (re-phase the campaign). "Lower the control standard" does not exist as an option value (HF-7). Gate: the CRO accepts the proposal; SMF17 owns the resourcing paper; CEO and board decide. Card reads "proposed · decision pending" until the decision register entry is keyed (OD-9) |
| M11 | Starling (FCA Final Notice: customers about 43,000 in 2017 to 3.6m in 2023) and Monzo (about 600,000 in 2018 to over 5.8m in 2022): growth outrunning financial crime controls. Posture tags from the corpus |
| M12 | Standing, plus: **no cost or ROI lens on financial crime** in any field or option |
| X1 | C-16, C-3, C-2, O-1, O-2, O-7, O-12. Records: CAP plan volumes and campaign calendar; KRI customer counts, alert volumes, queue age, CDD backlog, handler FTE and qualified FTE, alerts cleared within SLA; ISS (resourcing actions); DEC; RAS |
| X2 | Both capacity units present for the same periods (D4: shown side by side); numerator and denominator on every ratio |
| X3 | Two capacity units side by side: qualified FTE **and** alerts cleared within SLA. Automation gains are footnoted, never netted silently |
| X4 | Members per handler +21% (25,000 → 30,160); queue age 5 days past amber; weeks to the next campaign |
| X5 | Automation distorting FTE ratios → the second unit (alerts cleared within SLA) shows whether throughput kept pace. A resourcing action that exists but is unlinked → shown as "unlinked actions on this risk" (secondary count) |
| X6 | **Detection** from structured counts (members, alerts, queue age, FTE). **Attribution** ("growth caused the strain") is not claimed; the card shows the two series on one axis and lets the board judge. Whether the SMF escalated the strain on the record is Tier 3 |
| X7 | **Can tell:** that no resourcing action or decision is logged. **Cannot tell:** whether the SMF raised the strain orally or in a paper. Fixed copy: "no action, decision or escalation recorded". Hook H-8 |
| X8 | L1 bound, beat 1. All board viewers |
| X9 | **Re-scaled for the building society default** (the catalogue's challenger readout, +58% customers, no longer applies): "Members +31% (1.45m to 1.90m) as digital member onboarding and the mortgage and savings campaigns grew; qualified financial crime handlers +9% (58 to 63); members per handler 25,000 to 30,160; alert queue median age 19 days against amber 14 since August; next savings campaign in 6 weeks; no resourcing decision recorded `[illustrative]`." Alerts cleared within SLA: 9A sets the values. Under `firm_type = challenger_bank` the catalogue readout applies (TC-1) |

#### T2-6 · Is a board-agreed trade-off colliding, and is any "trade-off" actually a regulatory floor? (core)

| Row | Value |
|---|---|
| M1 | U-T2-6. **Tension collision**, with a floor lane that re-raises a **breach** |
| M2 | Objective "grow the savings franchise" `[illustrative]` → RAS: conduct and financial crime appetite for onboarding → **Level 1/2 pair:** savings onboarding conversion (partner A) and high-risk acceptance rate (partner B) → floor obligation: CDD before transacting (MLRs) → control: onboarding CDD gate → feed: onboarding platform to risk MI → owner: first-line product owner; pair owner as keyed in the tension register → attestation: onboarding feed reconciliation → escalation: BRC re-decision of the trade-off |
| M3 | For each bound keyed in the tension register: evaluate the partner metric against the bound. Fires S2 when a partner moves beyond its bound or the review date passes with no new decision ID. **Floor check (C-17):** any bound with `floor_flag = true` is **rejected as a tension** and re-raised as an S1 breach routed to SMF17 and the CRO the same day (ER-9). **Bounds (keyed):** conversion uplift ≤ +5 points; high-risk acceptance ≤ 0.8%; pre-CDD transacting (floor flag). Rationale: as keyed with the board decision reference |
| M4 | OLS per partner over 6 points, shown in the drill only. The trigger is bound-based, not trajectory-based |
| M5 | owner ✓ (pair owner keyed) · feed ✓ · attested ✓ · mapped ✓. **Plus the D1 keying check:** `keyed_by`, `keyer_role`, `keyed_at` and `source_decision_ref` present on the pair; if any is missing, the pair cannot be evaluated and the card shows a mapping chain break |
| M6 | n/a. If the floor is a VREQ breach count, the floor lane hands off to T2-27 |
| M7 | **Pair:** savings onboarding conversion ↔ high-risk acceptance rate. **Agreed trade-off:** faster onboarding accepted within keyed bounds. **Floor:** pre-CDD transacting is a regulatory floor, not tradeable |
| M8 | The floor lane may engage a route (for example SUP 15.3) → a draft ledger entry is proposed through T2-29 |
| M9 | S2 → BRC agenda; S1 (floor) → CRO and SMF17 the same day. Decision: board and BRC |
| M10 | **Propose** a BRC re-decision (re-set the bounds, restore the guardrail, or end the trade-off). **Prepare** a decision paper from the register fields only. Floor items route to the breach path. Gate: the CRO accepts the paper; the BRC decides; the company secretary keys the new decision (D1) |
| M11 | FCA on Monzo: "rapid customer growth must not come at the detriment of compliance". Posture tag from the corpus |
| M12 | Standing, plus: the register **rejects** a floor as a tension at the point of keying (O-5) |
| X1 | C-17, C-3, O-5, O-1, O-2, O-3. Records: TEN (pair, bounds, floor flag, owner, review date, decision reference ID); KRI series for both partners; RAS |
| X2 | The pair is keyed with all bounds, an owner and a review date; both partner series are current |
| X3 | "n of m bounds exceeded" with each bound, its value and the partner value; days past the review date |
| X4 | Points beyond each bound; days overdue |
| X5 | Bounds are explicit, so false-positive risk is low. A bound keyed in error → the keyer and source decision reference are shown so it can be corrected (a correction is a new version, never an edit) |
| X6 | **Proved by** the human-keyed tension register and the two KRI series. It **does not** prove what the board minuted; the keyed bounds are only as good as the keying |
| X7 | **Can tell:** that a registered pair has moved outside its keyed bounds or passed its review date, and that a "tradeable" item is a floor. **Cannot tell:** whether the board discussed the trade-off informally, or whether the keyed bounds match the minute. Hook H-4 |
| X8 | L1 bound, beat 1. Recommended as an inline state of the strategy strip (OD-4) |
| X9 | "Savings onboarding trade-off: 2 of 3 bounds exceeded (conversion +6.2 points against +5 cap; high-risk acceptance 1.1% against 0.8%); review overdue 27 days; 1 item reclassified as a floor (pre-CDD transacting) `[illustrative]`." Where the floor-lane breach renders is open (S5-OD-5) |

---

### 5.2 Beat 2 -- Green that is not defensible (chain integrity)

#### T2-14 · Can I defend this figure? Feed completeness, with integrity overriding status (core)

| Row | Value |
|---|---|
| M1 | U-T2-14. **Chain break** (feed) and silent failure |
| M2 | Objective "keep the franchise safe as it grows" `[illustrative]` → RAS: financial crime appetite → **Level 1 headline:** transaction monitoring coverage → Level 2: coverage by cohort → obligation: MLRs ongoing monitoring → control: transaction monitoring → **feed: core payments → monitoring system (TM-04, code in the drill only)** → owner: feed owner (COO's operations function); accountable SMF17 → attestation: monthly attestation of TM-04 → escalation: caveat in the pack; remediation; draft triage entry |
| M3 | **Completeness** = target count ÷ source count = 2,256,000 ÷ 2,400,000 = **94.0%**; cohort completeness for same-day accounts = **0%**, all other cohorts 99.97%. Fires when the shortfall exceeds tolerance (S2; **S1** on a headline within 10 working days of a forum, practice); cohort-concentrated shortfall (S2); rejected backlog past SLA (S3); last reconciliation stale (S2). **On firing, every dependent metric (via CG lineage) flips from its RAG to "unverified".** Threshold: feed tolerance (keyed per feed; zero for structural gaps, per GP L4) |
| M4 | n/a for the check. The drill shows completeness over the last 3 runs (99.9% → … → 94.0%) |
| M5 | **feed ✗** (shortfall beyond tolerance; last run 26 October 2026) · owner ✓ · attested (see T2-17: attested without evidence) · mapped ✓. The headline's underlying RAG is green; the face shows **"unverified"** |
| M6 | n/a |
| M7 | n/a |
| M8 | A monitoring gap may engage SUP 15.3 and FR7 (and POCA considerations for missed suspicion). **A draft triage entry is opened** in the ledger (T2-29). A named SMF decides |
| M9 | S2 → CRO and feed owner; ERC. **S1** → CRO, SMF17 (monitoring feed) and COO the same day; the BRC chair is informed at the CRO's call |
| M10 | **Propose** that the figure is withheld or caveated; **prepare** caveat text for the CRO to accept (O-8). **Propose** a remediation request to the feed owner and COO/CTO (O-7). **Open a draft** reportability triage entry (O-6). Gate: the CRO accepts the caveat; the owner remediates; the SMF decides reportability |
| M11 | Metro (FCA Final Notice, 12 November 2024, £16,675,200): between 06 June 2016 and 17 December 2020 the monitoring system missed 60,483,951 of 1,008,426,668 transactions (about 6%); a timestamp error excluded 166,358 same-day accounts. Posture tag from the corpus |
| M12 | Standing, plus: integrity overrides status; the product never shows green on this feed until a later run passes |
| X1 | C-7, C-1 (lineage to every dependent metric), C-6 (status override), O-8, O-6, O-7, O-12. Records: REC (counts, values, cohort breakdown, rejected backlog and age, run timestamps), CG lineage, ATT, KRI |
| X2 | Cut-off rule and grace window applied before a shortfall is declared; a cohort breakdown is present |
| X3 | Count completeness with numerator and denominator; per-cohort completeness; last run date; value completeness where the source holds value (S5-OD-2) |
| X4 | 144,000 transactions unreconciled in the run (2,400,000 − 2,256,000); one cohort entirely unmonitored |
| X5 | Timing differences between source and target cut-offs → declared cut-off rule and per-feed tolerance. Legitimate filtering (for example internal transfers excluded by design) → declared exclusions are part of the source definition, not a shortfall |
| X6 | **Proved by** the bank's own reconciliation counts and the product's lineage from metric to feed. It proves that records did not reach the monitoring system. It **does not** prove that any suspicious activity was missed; that would need the missed records to be monitored |
| X7 | n/a (Group 1) |
| X8 | L1 bound, beat 2. All board viewers (counts only) |
| X9 | "Unverified: transaction monitoring coverage. Records reconciled 94.0% (2,256,000 of 2,400,000); same-day accounts 0% monitored, all other cohorts 99.97%; last run 26 October 2026 `[illustrative]`." **TC-3** (cohort arithmetic: the same-day cohort is about 143,300 records in the run) |

#### T2-15 · Has any control gone quiet, and does sanctions screening cover the whole list? (reserve, embedded in the badge)

| Row | Value |
|---|---|
| M1 | U-T2-15. **Chain break** (zero-tolerance proxy) and silent failure |
| M2 | RAS: zero appetite for sanctions breaches → **Level 1 proxy:** individual sanctions list rule coverage; alert rate per screened population → obligation: SAMLA 2018 and OFSI requirements → control: individual sanctions screening → feed: screening engine output counts and list-size feed → owner: SMF17 → attestation: screening configuration attestation → escalation: SMF17 the same day; OFSI route through T2-29 |
| M3 | **Rule coverage ratio** = active rule records ÷ reference list entries = 39 ÷ 3,088 = **1.3%** (S1 for sanctions when < 1.0 as a ratio, i.e. < 100%). **Alert rate** below `expected_alert_rate_band` for N consecutive periods: 0 alerts for 3 weeks against an expected 42 a week (S1 for sanctions; S2 for other controls). Screening frequency ≠ approved (S2). A step change within 14 days of a change-log entry hands off to T2-19. Threshold: expected alert-rate band per screened population (CAL) |
| M4 | n/a |
| M5 | **feed ✗** (the control's output fails its zero-tolerance proxy) · owner ✓ · attested ✓/✗ (9A) · mapped ✓ |
| M6 | n/a |
| M7 | n/a. Sanctions coverage is a floor (HF-7) |
| M8 | Suspected sanctions breaches must be reported to OFSI "immediately" (SAMLA 2018) `[unverified]`. A draft ledger entry (OFSI, SUP 15.3) is opened through T2-29 |
| M9 | Sanctions → **S1**: CRO and SMF17 the same day, always; the BRC chair at the CRO's call (P8). Other controls → S2 to ERC; BRC if silence exceeds one reporting cycle |
| M10 | **Propose** a second-line configuration test and a re-screen of the affected population; **prepare** an investigation note to SMF17; **open a draft** triage entry. Gate: the CRO accepts; SMF17 decides the re-screen and the OFSI route through T2-29 |
| M11 | Starling (FCA Final Notice, £28,959,426; date `[conflict]` CF-17): from 20 July 2017 to 30 January 2023, screening matched 39 of 3,088 designated persons. Posture tag from the corpus |
| M12 | Standing, plus: the platform consumes counts; it never touches the screening engine |
| X1 | C-8, C-12 (hand-off), O-6, O-8, O-12. Records: KRI alert counts by type; screened population counts; list sizes and active rule counts; CTL; CHG. v6 **ScreeningDenominator** hosts the drill |
| X2 | Screened population and list-size counts present for the period; at least N periods of alert history |
| X3 | Coverage ratio with numerator and denominator; weeks of silence against the expected rate |
| X4 | List entries without an active rule (3,049 of 3,088) |
| X5 | Genuine zero-match weeks in small books → rates per screened population and multi-period rules. Vendor engines that report alerts but not rule counts → the ratio is marked "not computable" and the feed dot fails, rather than assumed |
| X6 | **Proved by** counts the bank already holds (alerts, rules, list entries). It proves the control is not covering the list. It **does not** prove that a designated person transacted |
| X7 | n/a |
| X8 | L1 embedded: the feed dot of the badge on the sanctions headline. Detail in the drill |
| X9 | "Individual sanctions screening: 0 alerts for 3 weeks against an expected 42 a week; 39 active rule records against 3,088 list entries (1.3% coverage) `[illustrative replay of the Starling figures]`." **TC-8** (keep "list rule coverage" distinct from "customer screening coverage" in T2-22) |

#### T2-16 · Which board objects have no accountable SMF, or a compromised owner set? (reserve, embedded in the badge)

| Row | Value |
|---|---|
| M1 | U-T2-16. **Chain break** (owner) |
| M2 | Any board object (RAS statement, headline metric, policy, VREQ clause, prescribed responsibility) → **owner** (OwnershipAssignment in the current MRM version) → escalation: CEO approval of reassignment |
| M3 | Fires when a board object has no `accountable_smf` in the current MRM (S2; **S1 for a VREQ clause**); owner interim beyond the firm-set period (S3); the same person owns and attests, or owns and validates, the same object (S2); an SMF has left and their objects are not reassigned (S2). Threshold: `interim_owner_max_days` (practice) |
| M4 | n/a |
| M5 | **owner ✗** is the unit. Feed, attestation and mapping are evaluated on the object as usual |
| M6 | An unowned VREQ clause is S1 and is also shown on the restriction screen |
| M7 | n/a |
| M8 | n/a |
| M9 | S2 → CEO and BRC chair; S1 → CEO the same day |
| M10 | **Propose** a reassignment for CEO approval; **prepare** a draft MRM change for the company secretary. Gate: the CEO approves; the company secretary updates the MRM |
| M11 | Starling: "no single person with sufficient authority and oversight" for the VREQ. Posture tag from the corpus |
| M12 | Standing, plus: a gap is an insight; reassignment is a CEO and board action |
| X1 | C-9, O-1, O-7. Records: SMCR (SoR, MRM, interim flag, version, effective_from); CG; ATT attester; MOD validator |
| X2 | A current MRM version is loaded; all board objects are enumerated (the denominator) |
| X3 | "n of N board objects unowned", with the MRM version and effective date |
| X4 | Count of unowned objects, flagged where any is a VREQ clause |
| X5 | Ownership held at a parent object (for example the principal risk) → inherited only where the MRM says so. Journey ownership missing is a separate chain break (T2-44), not an owner-check failure (P9) |
| X6 | **Proved by** the MRM and SoR as the bank keeps them, joined to the product's cascade graph. It **does not** judge whether the owner is effective |
| X7 | n/a |
| X8 | L1 embedded: the owner dot of the badge ("Ownership at the top level", R-7) |
| X9 | "3 of 214 board objects unowned, including VREQ clause R-03.2; 1 metric owned and attested by the same person `[illustrative]`." **TC-4** (R-03.2 is a clause of the beat 3 restriction) |

#### T2-17 · Is the owner attesting to evidence, or to nothing? (core)

| Row | Value |
|---|---|
| M1 | U-T2-17. **Chain break** (attestation) |
| M2 | Same chain as T2-14, at the **attestation** link: feed TM-04 → owner (feed owner) → **attestation** of the reconciliation result → escalation: second-line challenge and re-attestation |
| M3 | Fires when (C-10): `attested_ts` < `run_completed_ts` beyond the grace window (S2); the attestation references a superseded result or none (S2); attested "reconciled, no exceptions" while the referenced run shows a shortfall beyond tolerance (S2; **S1 on a headline**); attested for 3 or more consecutive cycles while the ratio trends down (S3); the attester owns the control tested (S2). Threshold: grace window per feed; monthly cadence for financial crime feeds (`[practice-not-rule]`, P10) |
| M4 | n/a. The drill shows the ratio over the attested cycles (99.9% → 94.0%) |
| M5 | **attested ✗** ("attested without evidence") · feed ✗ (T2-14) · owner ✓ · mapped ✓ |
| M6 | n/a |
| M7 | n/a |
| M8 | n/a directly; T2-14 carries the triage entry |
| M9 | S2 → second line and owner; ERC. **S1** → CRO, with the headline caveated |
| M10 | **Propose** a second-line challenge and re-attestation against the current run; **prepare** a challenge request to the owner. The badge reads "attested without evidence" until resolved. Gate: the CRO accepts; the owner re-attests against a named run ID |
| M11 | Metro: "Bad Data" rejections ran at about 1,352,665 a month before the July 2019 fix (GM). Posture tag from the corpus |
| M12 | Standing, plus: an insight to the owner first; **not a disciplinary record** |
| X1 | C-10, C-7, C-9, O-8, O-7. Records: ATT (attester, timestamp, attested_result_id, status); REC (run timestamps, result); CTL owner; SMCR |
| X2 | Each attestation carries `attested_result_id`; the referenced run carries `run_completed_ts` |
| X3 | Per cycle: attested status against the run result, and the time gap between signature and run completion |
| X4 | Number of cycles attested against failing or unfinished runs |
| X5 | Late-running jobs → declared grace window. Re-run results → `superseded_by_run_id` is followed before declaring "superseded" |
| X6 | **Proved by** timestamps and result IDs inside the structured attestation and reconciliation records. It **does not** judge the quality of the attestation commentary, which is Tier 3 |
| X7 | **Can tell:** that the signature referenced no run, a superseded run, a failing run, or a run that had not finished. **Cannot tell:** whether the commentary was copied or said anything meaningful. Hook H-5 |
| X8 | L1 bound, beat 2. Recommended as an inline state of the badge (OD-4) |
| X9 | "Feed TM-04: attested 'reconciled, no exceptions' for 3 months; ratio fell from 99.9% to 94.0%; month 2 attestation signed 3 hours before the run completed `[illustrative]`." Ties to T2-14 (same feed, same latest ratio) |

---

### 5.5 Other Layer 1 bound and embedded cards

#### T2-12 · Which non-headline Level 1 metric has moved enough to be promoted to the board view? (bound)

| Row | Value |
|---|---|
| M1 | U-T2-12. **Position** (promotion lane) |
| M2 | RAS schedule → **Level 1 metric** (non-headline) → its own chain as for any metric. For the seed: RAS liquidity → Level 1 NSFR → treasury feed → CFO (SMF2) as accountable per the MRM `[illustrative]` |
| M3 | Fires when a non-headline Level 1 metric goes amber or red, or passes a velocity rule (distance to amber shrinks by more than a firm-set share in one period). **Proposed only:** a headline green for 8 quarters is a candidate to rotate out. Cap: `headline_cap = 12` (practice, configurable, never hard-coded) |
| M4 | Velocity uses the C-3 slope; "early warning, not a prediction" on any projection |
| M5 | The promoted metric's own badge is shown |
| M6 | n/a |
| M7 | n/a |
| M8 | n/a |
| M9 | The promotion itself is S3; the metric's own status sets its escalation |
| M10 | **Propose** promotion to this cycle's board view; **prepare** a one-line reason for the CRO to accept. Gate: the CRO accepts; the change to the headline set is logged |
| M11 | None |
| M12 | Standing |
| X1 | C-35, C-6, C-3, O-11. Records: RAS schedule and headline_flag; KRI status and velocity |
| X2 | The full Level 1 schedule is loaded (the denominator: 34) |
| X3 | "Headlines shown: 12 of 34 Level 1 metrics"; the cap is labelled practice |
| X4 | Distance to amber before and after |
| X5 | A one-period spike → the velocity rule needs the C-3 slope to agree, not a single point |
| X6 | **Proved by** the RAS schedule and KRI series. The cap is a firm choice, not a rule |
| X7 | n/a |
| X8 | L1 bound: the RAS scorecard's promotion lane |
| X9 | "NSFR (not a headline) moved from 10 points above amber to 2 points above amber in one quarter; promoted. Headlines shown: 12 of 34 Level 1 metrics `[illustrative]`." |

#### T2-13 · Which emerging risks map onto which principal risks, and are any within horizon with no metric? (bound, below the fold)

| Row | Value |
|---|---|
| M1 | U-T2-13. **Position** (horizon overlay) with **chain break** (unmapped) |
| M2 | Emerging risk → principal risk → **Level 1/2 metric (missing for one)** → owner (emerging-risk owner) |
| M3 | Fires when time to crystallise drops inside the plan horizon (S3), or an in-horizon emerging risk has no linked Level 1 or Level 2 metric (S3) |
| M4 | n/a. Horizon and velocity are owner judgements, shown with owner and date |
| M5 | owner ✓ (per entry) · feed n/a (register entry) · attested n/a · **mapped ✗** for the unmapped risk |
| M6 | n/a |
| M7 | n/a |
| M8 | n/a |
| M9 | S3 → ERC; BRC quarterly |
| M10 | **Propose** a new metric or owner, or a BRC horizon note. Gate: the CRO accepts; the principal-risk owner decides |
| M11 | None |
| M12 | Standing |
| X1 | C-36, C-11, O-1. Records: structured emerging-risk register; CG |
| X2 | Each entry has an owner and an assessed-on date |
| X3 | "n emerging risks; n within 12 months; n with no linked metric" |
| X4 | Horizon band; principal risk affected |
| X5 | Stale entries → the assessed-on date is shown, and entries older than the firm-set review period are marked stale |
| X6 | **Proved by** the bank's structured emerging-risk register. It does not find risks that committees discuss but nobody registered (Tier 3) |
| X7 | Not a Group 2 partial, but the adjacent hook is shown as the extension teaser: risks discussed but not registered (H-18) |
| X8 | L1 bound, below the fold; carries the T2-31 count |
| X9 | "7 emerging risks; 2 within 12 months; 1 (AI-enabled impersonation fraud) has no linked metric `[illustrative]`." |

#### T2-2 · Are we leaving deliberate growth unused? (embedded: utilisation-floor marker on the strip)

| Row | Value |
|---|---|
| M1 | U-T2-2. **Position** (utilisation floor) |
| M2 | Objective "help first-time buyers" `[illustrative]` → growth-linked RAS statement → Level 1 utilisation → plan target and actuals → owner |
| M3 | Utilisation of a **growth-linked** RAS statement below `utilisation_floor_pct` (practice; for example 50%) for 2 or more quarters while plan actuals are behind target. Never evaluated on financial crime or conduct statements (`growth_linked_flag` gate) |
| M4 | n/a (the trigger is persistence below the floor) |
| M5 | Standard badge on the statement's metric |
| M6–M8 | n/a |
| M9 | S4 → ERC summary; S3 if the plan shortfall is material → BRC |
| M10 | **Propose** a BRC discussion: re-deploy headroom, lower appetite to match intent, or note the reason. Gate: the CRO accepts; the board decides |
| M11 | None |
| M12 | Standing, plus: unused appetite is **never** framed as a target to hit; never on financial crime or conduct lines |
| X1 | C-2, C-4, O-1. Records: RAS; KRI; CAP plan targets and actuals; CG |
| X2 | Growth-linked flag present; plan actuals for the same periods |
| X3 | Utilisation and plan attainment with denominators |
| X4 | Plan shortfall in £ (£560m of £2.0bn) |
| X5 | Deliberate caution → the "note the reason" option records it and suppresses the marker until the review date |
| X6 | Proved by the RAS, KRI and plan actuals. It does not judge whether more risk is wise |
| X7 | n/a |
| X8 | L1 embedded: marker on the strategy strip |
| X9 | "First-time-buyer lending appetite 31% used for 3 quarters; plan volume 72% of target (£1.44bn of £2.0bn) `[illustrative]`." |

#### T2-3 · Which plan initiatives consume appetite with no RAS link? (embedded: "unmapped" chip on the strip)

| Row | Value |
|---|---|
| M1 | U-T2-3. **Chain break** (cascade mapping, top of the spine) |
| M2 | Objective → **PlanInitiative with no link** to a RAS statement → (no Level 1 metric; no financial crime metric where the product type requires one) |
| M3 | A plan initiative with a volume or revenue line has no `initiative_ras` link, or lacks a financial crime or conduct metric that its `product_type_code` requires (C-11). S2 if launch is within one quarter; otherwise S3 |
| M4 | n/a |
| M5 | **mapped ✗** is the unit |
| M6–M8 | n/a |
| M9 | S2 → CRO and CFO; S3 → ERC |
| M10 | **Propose** the missing RAS link and metric to the CRO and CFO (dual ownership: the CRO proposes, the CFO co-signs, G-4). The item stays "unmapped" until resolved |
| M11 | None |
| M12 | Standing |
| X1 | C-11, O-1. Records: CAP plan initiatives; CG; OBL product-type obligations |
| X2 | Plan initiatives carry a product-type code |
| X3 | "n of N plan initiatives unmapped" |
| X4 | Plan volume with no governing appetite |
| X5 | Initiatives with no product-type code → listed as "cannot assess", not as mapped |
| X6 | Proved by the plan and the product's cascade graph |
| X7 | n/a |
| X8 | L1 embedded: chip on the strategy strip |
| X9 | "Business current account launch (Q1 2027 plan: 18,000 accounts) has no RAS line and no financial crime metric `[illustrative]`." |

#### T2-8 · How close are we to the building society nature and funding limits? (embedded; **rendered only when `firm_type = building_society`, the demo default**)

| Row | Value |
|---|---|
| M1 | U-T2-8. **Position** (statutory headroom) |
| M2 | Objective "fund growth sustainably" `[illustrative]` → RAS: funding mix → **Level 1:** wholesale funding share; nature-limit ratio → obligation: Building Societies Act 1986 nature and funding limits (as amended) `[verify]` → control: ALCO funding-plan review → feed: balance sheet and funding by source → owner: CFO (SMF2) attests → attestation: CFO attestation of the calculation → escalation: ALCO, then BRC |
| M3 | **Funding headroom** = internal ceiling − wholesale share (40% − 34% = 6 points); statutory cap 50%. **Nature limit:** loans fully secured on residential property ÷ business assets against 75% (with internal buffer). Fires S3 when either enters the internal buffer or is projected to within the funding plan horizon; S2 if inside the buffer → BRC. **Threshold set:** capacity = statutory limit; red = internal ceiling or floor; amber = buffer trigger. Rationale: funding-plan lead time. **Render gate:** `Firm.firm_type = building_society`; otherwise the unit is not evaluated and nothing is shown (OD-2) |
| M4 | OLS plus funding-plan projection by plan version (39% in Q3 2027). "Early warning, not a prediction" |
| M5 | owner ✓ (CFO) · feed ✓ · attested ✓ (CFO) · mapped ✓ |
| M6 | n/a |
| M7 | n/a. A statutory limit is a floor; never a tension |
| M8 | n/a |
| M9 | S3 → ALCO; S2 → BRC |
| M10 | **Propose** an ALCO review of the funding plan; **prepare** an ALCO note. Gate: the CRO accepts; the CFO and ALCO decide |
| M11 | None |
| M12 | Standing |
| X1 | C-2, C-3, C-4, O-11 (firm-type gate). Records: CAP balance sheet by asset class; funding by source; plan; RAS buffers |
| X2 | The CFO's attestation of the calculation is current |
| X3 | Wholesale share against internal ceiling and statutory cap, with the plan version |
| X4 | Points of headroom to the internal ceiling and to the statutory cap |
| X5 | Definitions changed by the 2024 amendment → the rule-library version is shown and remains `[verify]` |
| X6 | Proved by the society's own balance sheet and funding data, as calculated and attested by the CFO. The product does not compute statutory compliance; it shows the attested position |
| X7 | n/a |
| X8 | L1 embedded: statutory line on the strategy strip, **society only** |
| X9 | "Wholesale funding 34% against an internal ceiling of 40% and a statutory cap of 50%; post-integration plan projects 39% in Q3 2027 `[illustrative]`." Not shown if OD-2 resolves to a challenger |

#### T2-18 · Which obligations and zero-tolerance statements have nothing measuring them? (embedded: mapping dot of the badge)

| Row | Value |
|---|---|
| M1 | U-T2-18. **Chain break** (mapping; zero tolerance with no proxy) |
| M2 | RAS statement or policy obligation → **(no control, metric or evidence linked)** |
| M3 | A material policy, regulatory or VREQ obligation with no linked control, metric or typed evidence (S2 for VREQ clauses; S3 otherwise); a zero-tolerance RAS statement with no proxy metric (S2; ER-2); the obligation's source version changed since mapping (S3). Any typed evidence link satisfies the check (P16) |
| M4 | n/a |
| M5 | **mapped ✗** is the unit |
| M6 | A VREQ clause with no executable test is S1 on T2-27; here it is counted |
| M7–M8 | n/a |
| M9 | S2 → SMF16 and the policy owner; ERC. S3 → owner |
| M10 | **Propose** a mapping, or a proxy metric with an owner. Gate: SMF16 or the policy owner approves the mapping; the CRO approves proxies for zero-tolerance RAS statements |
| M11 | None |
| M12 | Standing |
| X1 | C-11, O-1. Records: OBL; RAS zero_tolerance flag; CG; CTL; KRI |
| X2 | Obligations carry a source version; zero-tolerance flags are set in the RAS register |
| X3 | "n of N VREQ clauses mapped to an executable test"; "n of N zero-tolerance statements carry a proxy" |
| X4 | Count of unevidenced obligations by materiality |
| X5 | Evidence held as a training or approval record → accepted as typed evidence, not flagged |
| X6 | Proved by the obligation library and the product's cascade graph. It does not judge whether the linked control is effective (T2-23 does that) |
| X7 | n/a |
| X8 | L1 embedded: mapping dot of the badge |
| X9 | "VREQ clauses: 14 of 15 mapped to an executable test; zero-tolerance statements: 5 of 7 carry a proxy (reputational harm and market abuse do not) `[illustrative]`." **TC-4** |


---

### 5.3 Beat 3 -- Restriction test failing; multi-clock reportability drafted for an SMF decision

#### T2-27 · Is the regulatory restriction obeyed across the whole population, not just where the flag fired? (core)

| Row | Value |
|---|---|
| M1 | U-T2-27. **Breach** (restriction) and **chain break** (no test, or partial coverage) |
| M2 | Objective "grow the savings franchise" `[illustrative]` → RAS: no appetite for breaching regulatory restrictions → **Level 1 metric:** restriction breaches per population tested; months since last zero-breach month → **obligation: VREQ R-03 clause(s) (no new high-risk customers)** → control: onboarding restriction flag, plus the product's independent population test → evidence: monthly PopulationTestRun → owner: SMF17 for containment; accountable SMF for the restriction per the MRM → attestation: the VREQ attestation (T2-28) → escalation: draft reportability case (T2-29) |
| M3 | Per clause per run (C-19): **coverage** = population_tested ÷ population_in_scope; **breaches** = accounts and customers in the prohibited population on any product, channel, migration or manual route. Fires **S1** on any breach; **S1** for a clause with no executable test, or coverage below the whole in-scope population; **hard fail S1** if adherence is evidenced by "flag fired" rather than a population outcome (ER-6, HF-3). **Override lane (MB24 partial):** breaches with route `manual` shown separately (S1). Comparison basis: zero breaches across 100% of the in-scope population. The bank's flag figures ("fired 1,208 times, 100% blocked") are shown **only as the contrast** beside the test, never as status |
| M4 | n/a for the test. The headline option is "months since last zero-breach month" (count from the run history), not a projection |
| M5 | owner ✓/✗ (if clause R-03.2 is unowned, T2-16 S1 also fires; TC-4) · feed ✓ (population test run date) · attested: pending (T2-28) · **mapped ✗** for the untested partner-channel route |
| M6 | **Population:** customers rated high-risk at the event date (point-in-time rating, S5-OD-12). **Test:** any account opened for, or transaction by, a customer in the population, on any route. **Result:** 112 accounts for 104 restricted customers, of 9,400 tested this month; 97 via the new savings pot outside the flag's scope; 3 previously exited customers. **Untested:** 24,000 partner-channel openings. **Denominators:** tested 9,400; in-scope 9,400 + 24,000 = 33,400 (TC-5) |
| M7 | n/a. A VREQ breach count is a floor and is never a tension (HF-7) |
| M8 | **Mandatory reporting.** A VREQ breach engages SUP 15.3 ("immediately") and PRA FR7 `[unverified]`. A **draft** ledger entry is opened in T2-29. A named SMF decides |
| M9 | **S1** → CRO and SMF17 the same day; SMF16 for the reportability decision; BRC chair informed; board at the next meeting |
| M10 | **Propose** immediate containment to SMF17 (exit or restrict the accounts found); **open a draft** reportability case (O-6); **propose** a test-coverage fix for the untested partner channel. Gate: the CRO accepts the proposals; SMF17 contains and confirms counts; the deciding SMF decides reportability. Customer-level records go to SMF17's restricted view only (O-9) |
| M11 | Starling (FCA Final Notice, £28,959,426; VREQ accepted 17 September 2021; 54,359 accounts opened for 49,183 high-risk customers between September 2021 and November 2023, including 294 previously exited customers; notice date `[conflict]` CF-17). Monzo (£21,091,300; count `[conflict]` CF-16). CB Payments (23 July 2024) for the "flag fired" shape `[scope]`. Posture tags from the corpus |
| M12 | Standing, plus: customer-level detail never reaches the CRO or board face (HF-10) |
| X1 | C-19, C-1, C-9, O-6, O-7, O-9, O-12. Records: RST (clause, population definition, in-scope, tested, breaches, breach route, run date); OBL; SMCR; CG |
| X2 | Each clause has an executable test (`test_definition_id`) and a run for the period; risk ratings are evaluated at the event date. If a clause has no test, the unit **is** the chain break and no adherence status is shown |
| X3 | Coverage % with tested and in-scope counts; breaches with accounts and customers; route breakdown |
| X4 | Accounts and customers in breach; untested population; months since last zero-breach month |
| X5 | Each breach is a named record for SMF17 to confirm (low false-positive risk). Ratings changed after the event → the point-in-time rating is used. Joint accounts → accounts and customers are counted separately, so the two figures differ by design |
| X6 | **Proved by** the product's own population test run against the bank's customer and account records, keyed to the clause. The test proves breaches in the population tested. **It does not prove adherence in the untested 24,000**; those show as untested, not as compliant |
| X7 | Override lane only. **Can tell:** that breaches came through a logged manual route. **Cannot tell:** about workarounds recorded only in service notes. Hook H-24 (H-23 adjacent) |
| X8 | L1 bound, beat 3. Board viewers see counts; SMF17 sees records |
| X9 | "Restriction R-03 (no new high-risk customers): 112 accounts for 104 restricted customers in 9,400 tested this month; 97 via the new savings pot outside the flag's scope; 3 previously exited customers; 24,000 partner-channel openings untested. Flag dashboard for the same month: 'fired 1,208 times, 100% blocked' `[illustrative]`." Headline option: "Months since last zero-breach month: 4 `[illustrative]`." Only 97 of the 112 accounts are attributed to a route (product: the savings pot). 9A assigns the other 15 to the channel, migration and manual routes; a non-zero manual count gives the override lane content. The 3 previously exited customers are a subset of the 104 customers, not a route (TC-5) |

#### T2-28 · Does the attestation we are about to give the supervisor match the population test? (core)

| Row | Value |
|---|---|
| M1 | U-T2-28. **Reportability case × restriction** |
| M2 | Obligation: VREQ R-03 (all clauses) → control: population test → evidence: PopulationTestRun for the attestation period; s166 or remediation milestones → owner: the **attesting SMF** (named per the restriction) → **attestation** to the supervisor (due date) → escalation: SMF16 to consider a reportability case through T2-29 |
| M3 | Fires when a VREQ or s166 attestation is due within `attestation_due_window_days` (practice; default 15) while, for the attestation period: the test shows breaches (S1); part of the population is untested (S1); a remediation milestone is overdue (S2); or the test has not run for the full period (S2). Per clause (C-20): **supported / partly supported / not supported** by the structured evidence |
| M4 | n/a |
| M5 | owner ✓ (attesting SMF named) · feed ✓ (test runs for every month of the period, or ✗ if a month is missing) · attested: **prior** attestations shown with status · mapped ✓ |
| M6 | Population, test and result as T2-27, scoped to the attestation period; per clause |
| M7 | n/a |
| M8 | Evidence contradicting a **prior** attestation may itself open a SUP 15.3 / Principle 11 case. `[legal-review]` applies to how the contradiction is recorded (D3: shown only as this structured partial, on synthetic data) |
| M9 | **S1** → attesting SMF and CRO; SMF16 to consider a case through T2-29 |
| M10 | **Prepare** an evidence summary per clause (supported / partly / not supported) for the attesting SMF; **propose** the facts the attestation should disclose. **The SMF writes and signs the attestation; the product never drafts a compliance claim.** Gate: the attesting SMF |
| M11 | Starling: from the September 2021 VREQ to the first zero-breach month in April 2024, 31 months later (K-6). Posture tag from the corpus |
| M12 | Standing, plus: no field in the model holds attestation wording drafted by the product |
| X1 | C-20, C-19, O-1, O-6. Records: RST (attestation_due, runs, breaches, untested population); ISS (s166 milestones); ATT (prior attestations, status) |
| X2 | A test run exists for each month of the attestation period; otherwise "test has not run for the full period" fires |
| X3 | "n of N clauses not supported", with days to the due date |
| X4 | Breaches and untested population within the attestation period |
| X5 | Applies only where a VREQ or s166 requires attestation. Six-monthly SMF certification to the regulator is not a rule (C21) and is never implied |
| X6 | **Proved by** the population test runs and milestone records for the period. It **cannot** read the draft attestation text, so it cannot say which sentence is unsupported |
| X7 | **Can tell:** what the structured evidence supports for the period. **Cannot tell:** which sentence of the draft attestation is unsupported. Hook H-25 |
| X8 | L1 bound, beat 3 |
| X9 | "Q3 2026 VREQ attestation due in 12 days. Evidence: 6 high-risk onboardings in the period, all via the group migration of 01 August 2026; 1 of 4 clauses not supported `[illustrative]`." **TC-5** (contradicts T2-27's 112 accounts via the savings pot) |

#### T2-29 · What may be reportable, on which clock, and who is deciding? (core)

| Row | Value |
|---|---|
| M1 | U-T2-29. **Reportability case** |
| M2 | **Escalation / reportability decision** (bottom of the spine), reached from the originating unit's chain: for beat 3, VREQ R-03 → population test → breach → ReportableEvent → routes |
| M3 | Per event, C-21 maps `event_type` to every potentially engaged route through the rule library (by in-force date). Fires **S1** when an engaged route has no recorded human decision; **S1 Boolean trap:** one route decided, siblings `not_assessed`; **S2** FCA route decided with no FR7 decision while `Firm.dual_regulated = true`; **S2** "not reportable" with no re-evaluation date, or with new linked facts since the decision. Comparison basis: elapsed time since `clock_start_ts` against each route's clock and the triage target (24 hours for "immediately" clocks; **firm practice, not rule**) |
| M4 | n/a (clocks, not trajectories) |
| M5 | owner ✓ (proposed decider named) · feed n/a (ledger record) · attested n/a · mapped ✓ (each route has a rule-library entry). **Plus the D1 keying check** on the event and each route |
| M6 | Where the event is a restriction breach, the T2-27 counts are attached as facts |
| M7 | n/a |
| M8 | **Routes held:** SUP 15.3 ("immediately"); PRA FR7; SUP 15.11 (once a conduct event is logged); REP008 (annual); SAR question open (status only); OFSI ("immediately"); ICO (UK GDPR Article 33, 72 hours); FCA PS26/2 and PRA PS7/26 from 18 March 2027. **All clock values `[unverified]`** until checked against the texts (S5-OD-7). **Decision owner:** usually SMF16; SMF4 or SMF17 by matter. **Deadline:** per route clock from the logged awareness date |
| M9 | **S1** → the deciding SMF and the CRO immediately. Board sees a ledger summary (counts by status) only; SAR content never reaches the board view |
| M10 | **Prepare** the case per route (facts, rule text versioned by in-force date, options with rationale; the AI proposes **no default answer**, P11). **Propose** the decider. **A named SMF records the decision, timestamp, rationale and any dissent, append-only (E-39).** The product never files or notifies. Gate: the deciding SMF; the CRO accepts the prepared case before it is sent |
| M11 | Starling: VREQ breach found 21 July 2022 and notified 24 August 2022 (34 days; FCA "disappointment"), against prompt notification of the sanctions gap (found January 2023, notified 16 February 2023). Posture tag from the corpus |
| M12 | Standing, plus: the AI never re-dates an awareness timestamp; an ICO route holds no personal data on the board view; SAR content is outside the product |
| X1 | C-21, C-22 (feeds T2-30), O-5, O-6, O-9, O-10. Records: RPL (product-owned), INC, RST, ISS, OBL rule library, SMCR |
| X2 | Event keyed with a named keyer and a logged awareness date; every engaged route has a rule-library entry (even if `unverified`) |
| X3 | "n of N routes decided", with elapsed time against each clock |
| X4 | Customers affected (from the originating event); routes undecided past the triage target |
| X5 | Over-inclusion in routes **considered** is preferred, but the ledger makes no recommendation on any route (P11). Event types that map to no route → the event is kept with "no route engaged" and a named reviewer |
| X6 | **Proved by** the human-keyed ledger and the rule library. The route mapping is deterministic from event type. Whether a route is actually engaged is the SMF's legal judgement, never the product's |
| X7 | **Can tell (SUP 15.11 route):** that a logged conduct event has an undecided route. **Cannot tell:** about an HR outcome nobody has logged. Hooks H-6 and H-34 |
| X8 | L1 bound, beat 3. Board: counts by status only. SAR route: "SAR question open" only, above SMF17 |
| X9 | Catalogue seed: "Event E-2026-117: data error moved 2,300 fixed-rate mortgage customers to the reversion rate without notice. Routes: SUP 15.3 (decided: notify, 23 October); FR7 (not assessed); SUP 15.11 (not assessed; disciplinary outcome logged); SAR (not engaged). 1 of 4 routes decided on day 4 `[illustrative]`." **TC-6** (the seed event is not the beat 3 restriction breach) and **TC-7** (the "day 4" arithmetic) |

#### T2-30 · Did a structured signal exist before the awareness date we logged? (reserve, embedded in the ledger row; **CRO and deciding SMF only**)

| Row | Value |
|---|---|
| M1 | U-T2-30. **Reportability case** (clock integrity) |
| M2 | ReportableEvent → linked structured records on the same control, metric or feed (via CascadeLink keys) → **logged awareness date** → reportability decision |
| M3 | For a ledger event (C-22): earliest linked structured record (issue raised date, failed control test, KRI breach date, incident `detected_date` < `logged_date`, failed population test) predates `logged_awareness_date` by more than `awareness_gap_working_days` (practice; default 5 working days) → **S2** |
| M4 | n/a |
| M5 | owner ✓ (deciding SMF) · feed n/a · attested n/a · mapped ✓ (linkage by CG keys) |
| M6 | Where the event is a restriction breach, the first failed population test run is a candidate earlier signal |
| M7 | n/a |
| M8 | Clock integrity for SUP 15.3 ("reasonably suggests"). Decision owner: the deciding SMF records whether the logged date stands, with rationale (`RouteDecision.awareness_date_stands`) |
| M9 | S2 → the deciding SMF and the CRO. **Never** on the BRC or board view (D6, HF-9) |
| M10 | **Prompt** the deciding SMF to re-test the awareness date, showing the earlier records. **The product never re-dates.** Gate: the deciding SMF; the record is append-only |
| M11 | Metro chronology (GM): "Bad Data" rejections flagged in 2017; scale confirmed April 2018; error logged 17 April 2019; FCA notified 29 May 2019. Posture tag from the corpus |
| M12 | Standing, plus: framed as "prompt to re-test", **never "late"**; people who raised the earlier signal are evidence of good culture, never targets |
| X1 | C-22, O-6, O-9. Records: RPL logged awareness date; ISS raised date; CTL test dates and results; KRI breach dates; INC detected and logged dates; RST run dates; CG |
| X2 | Linked records exist through CG keys; the severity of each earlier record **at the time** is shown, and the SMF may dismiss with a reason |
| X3 | Days from the first structured signal to the logged awareness date |
| X4 | Gap in days (and working days) |
| X5 | An early record that was immaterial when raised → severity at the time is shown; dismissal with reason is recorded |
| X6 | **Proved by** structured records linked by control, metric or feed keys. It **misses** signals recorded only as text, so a gap of zero does not prove timely awareness |
| X7 | **Can tell:** that a structured record about the same control, metric or feed predates the logged awareness. **Cannot tell:** when someone first described the matter in writing, or what they knew. Hook H-6 |
| X8 | L1 embedded in the ledger row. `visibility_scope = cro_and_deciding_smf` (O-9) |
| X9 | "Event E-2026-117 logged awareness 14 October. Earlier linked records: issue I-8812 'duplicate collections' raised 21 August (L2); control test DD-03 failed 02 September. Gap from first structured signal: 54 days `[illustrative]`." 21 August to 14 October = 54 days (checks). **TC-6** and **TC-7** apply |

---

### 5.4 Beat 4 -- BRC chair: is bad news reaching me?

These cards compute the **escalation-health index** from structured signals only. The default comparison is this quarter against last quarter, over a rolling 4 quarters. Wording is fixed per P2: "no action, decision or escalation recorded"; never "not discussed", "ignored" or "suppressed".

#### T2-34 · Which persistent ambers have no logged action, decision or escalation? (core)

| Row | Value |
|---|---|
| M1 | U-T2-34. **Breach** (persistence) and **chain break** (escalation) |
| M2 | Objective "treat customers fairly as we grow" `[illustrative]` → RAS: conduct appetite for vulnerable customers → **Level 2 metric:** vulnerable-customer exceptions per 10,000 contacts → obligation: Consumer Duty (PRIN 2A) and FG21/1 vulnerability guidance `[verify]` → control: vulnerability identification and handling in contact centres → feed: contact-centre MI → owner: metric owner (Head of Customer Operations) `[illustrative]`; accountable SMF16 → attestation: contact-centre MI attestation → **escalation: none recorded** |
| M3 | C-25: Level 1 amber or red, or **Level 2 amber for ≥ N consecutive periods** (N = 2 quarters, practice, configurable with a named approver), where **all** hold over the persistence window: no open or new linked action (via CG); no decision ID in the decision register; no `escalation_forum` entry at the routed forum. Ranked by Level, persistence length and trajectory. **S2**; **S1** if the trajectory reaches red within one forum cycle. **Threshold set:** amber 14, red 18 (per 10,000 contacts); capacity (9A). Rationale: as keyed |
| M4 | OLS over the persistence window and before it: 14.2 → 15.8 → 16.9 → projected red in 2 quarters. "Early warning, not a prediction" |
| M5 | owner ✓ · feed ✓ · attested ✓ · mapped ✓. (The metric is defensible; the escalation is missing) |
| M6–M7 | n/a |
| M8 | n/a. COCON 4.2 reasonable steps is engaged only by inference; not shown |
| M9 | **Auto-placed** on the BRC exception feed; `suppressible = false` (method B.8; ER-5). S2 → BRC exception feed; S1 → BRC chair at the CRO's call before the meeting |
| M10 | **Propose** one of three for the BRC chair: a remediation decision with an owner; a time-limited waiver with expiry; or a re-calibration review (T2-20). Gate: the BRC chair decides; the decision is keyed into the decision register by a named person (D1) |
| M11 | Metro (GM, B-GM-02): an operations risk board ranked bad data among its top five risks from May to August 2018, then reassigned and dropped the actions after 16 August 2018; no periodic MI reached the BRC until an external firm was engaged in December 2018. Posture tag from the corpus |
| M12 | Standing |
| X1 | C-25, C-6, C-3, O-3, O-4, O-5. Records: KRI status history; RAS (Level, thresholds); CG metric → action links; ISS (linked metric, raised date, status, escalation forum and date); DEC; FCL routing rules |
| X2 | Status history for the whole persistence window; routing rule defined for the metric's Level |
| X3 | Quarters at amber; "no action, decision or escalation recorded" for the window; **secondary count:** unlinked actions on the same risk |
| X4 | Distance to red; quarters to red at trajectory |
| X5 | Main false-positive source: actions that exist but are not linked to the metric → the secondary count, and the owner can link one with a reason |
| X6 | **Proved by** the bank's issue log, the D1 decision register and the pack manifest. It proves **nothing was recorded**. It **does not** prove nobody discussed it |
| X7 | **Can tell:** that a persistent amber has no action, decision or escalation in the structured records. **Cannot tell:** whether a committee discussed it, challenged it or minuted "noted". A discussion with no logged action reads the same as no discussion. Hook H-1 (`[legal-review]`) |
| X8 | L1 bound, beat 4 (BRC chair screen, OD-3) |
| X9 | "1 persistent amber with no recorded action: vulnerable-customer exceptions per 10,000 contacts 14.2 → 15.8 → 16.9 over 3 quarters (amber 14, red 18); no linked action, decision or BRC escalation logged; early-warning projection reaches red in 2 quarters `[illustrative]`." **TC-10** (must be one of the 13 items qualifying in T2-35) |

#### T2-35 · Which items qualified for the BRC under our own rules but were left out of the pack? (reserve, embedded: the override log; **the suppressed near-miss**)

| Row | Value |
|---|---|
| M1 | U-T2-35. **Breach** (persistence) with routing |
| M2 | Any qualifying object (Level 1 red or amber metric; Level 2 red; persistent Level 2 amber; lower-forum top risk past SLA) → routing rule → **BRC pack manifest** (E-41, E-42) → override (E-43) → escalation |
| M3 | C-26: an item meets a BRC routing rule and is absent from the BRC manifest (S2); an item removed from a pack it qualifies for **without** an override reason code and approver (**S1**) |
| M4 | n/a |
| M5 | Manifest keying check (D1): manifest `keyed_by`, `approved_by` (the CRO) and version present; each override has an approver and reason code, or it **is** the unit |
| M6–M8 | n/a |
| M9 | S2 → CRO before the pack is issued; S1 → BRC chair (override log) |
| M10 | **Propose** restoring the item, or recording an override reason. **The CRO approves the pack; the BRC chair sees the override log.** Gate: the CRO for the pack; the override needs a named approver and reason code |
| M11 | Illustrative replay of the Metro shape under a 90-day SLA rule: the item would have surfaced in August 2018, about four months before the external engagement `[illustrative]` |
| M12 | Standing, plus: the headline set is capped; **the exception feed is never capped** |
| X1 | C-26, O-4, O-5. Records: FCL routing rules; PKM manifest and override log; KRI status history; ISS |
| X2 | Routing rules written precisely enough to execute, with an approver |
| X3 | "n items qualify; n included; n removed (with / without a reason)" |
| X4 | Items removed without a reason |
| X5 | Items merged into a parent item → `action = merged` with a reason is not a suppression |
| X6 | **Proved by** the firm's executable routing rules and the human-keyed manifest. It does not judge whether a recorded reason is good |
| X7 | n/a (Group 1) |
| X8 | L1 embedded: override log on the exception feed |
| X9 | "13 items qualify for the BRC; 12 included; 1 removed at ERC on 14 October 2026 with no reason recorded `[illustrative]`." **TC-10** |

#### T2-36 · Which known weaknesses are overdue, extended or ageing without reaching the board, and will the backlog clear on time? (core)

| Row | Value |
|---|---|
| M1 | U-T2-36. **Breach** (remediation persistence) with auto-escalation |
| M2 | RAS: financial crime appetite → Level 2: CDD refresh backlog → obligation: MLRs CDD refresh → control: periodic CDD review → evidence: audit finding and backlog series → owner: remediation owner; accountable SMF17 → attestation n/a → **escalation: never in a BRC pack** |
| M3 | C-28: high-rated finding or regulatory action past due with no BRC manifest entry (S2); due date extended more than `extension_count_limit` (practice; 2) (S2); repeat finding (S2); backlog flat or growing for 2+ periods (S2); **clearance projection** later than the committed date (S2; S1 for a regulatory commitment) |
| M4 | **Clearance projection:** OLS over the backlog series, projected to zero. "Early warning, not a prediction" |
| M5 | owner ✓ · feed ✓ (backlog series) · attested ✓/✗ (9A) · mapped ✓ |
| M6 | If the item is an s166 milestone, it also feeds T2-28 |
| M7 | n/a |
| M8 | Overdue regulatory actions and s166 milestones may be relevant to Principle 11 openness. A human decides whether the supervisor is told; nothing is drafted to the supervisor |
| M9 | Auto-surfaced on the exception feed under "unremediated past SLA", `suppressible = false`. S2 → BRC exception feed, audit committee chair copied for audit findings (G-3: surfaced to both); S1 → BRC chair |
| M10 | **Propose** a BRC agenda item and a remediation-owner review; **prepare** a BRC paragraph. Gate: the BRC chair |
| M11 | Starling's November 2018 internal audit report was not conveyed "to either Starling's Board or the Authority"; Nationwide £44,078,500 (12 December 2025), weaknesses not remediated in a timely manner; Santander £107.7m. Posture tags from the corpus |
| M12 | Standing |
| X1 | C-28, C-3, O-3, O-4. Records: AUD (rating, due date, extension count, repeat flag, status); ISS (due-date history, action type); KRI backlog series; PKM manifest |
| X2 | SLA by rating and the extension limit agreed in configuration |
| X3 | Extensions; months open; backlog range; projected against committed clearance |
| X4 | Backlog size (customers); months of slippage |
| X5 | Due dates moved by an approved re-plan → shown as extensions with the approver, still counted |
| X6 | **Proved by** the audit and issue logs, the backlog series and the pack manifest. The projection assumes the current clearance rate |
| X7 | n/a (Group 1) |
| X8 | L1 bound, beat 4 |
| X9 | "High-rated finding on CDD refresh: extended 3 times over 19 months; backlog flat at 41,000–44,000 customers; never in a BRC pack. Projected clearance 31 months against a committed 12 `[illustrative]`." **TC-9** (the CDD backlog in T2-38 is 26,900) |

#### T2-37 · How long does bad news take to reach the BRC? (core)

| Row | Value |
|---|---|
| M1 | U-T2-37. **Position** (governance KRI) with a **breach** on threshold |
| M2 | Issue (logged) → severity reaches "high" → **escalation** to the BRC (escalation date or BRC manifest entry). Spine segment: attestation → escalation |
| M3 | C-29: for issues of severity "high" or above, latency = first BRC escalation date (or first BRC manifest entry) − **date severity first reached "high"** (from `severity_history`); raised date shown alongside. Fires when the median exceeds `latency_threshold_cycles` (practice; 2 cycles) (S2); the median rises 2 quarters running (S3); any material issue still not escalated after N cycles (S2; listed) |
| M4 | Quarter-on-quarter over a rolling 4 quarters (no projection) |
| M5 | Issue-log integrity: `severity_history` and escalation fields populated; share of high issues with no escalation fields shown |
| M6–M8 | n/a |
| M9 | S2 → BRC chair; S3 → CRO |
| M10 | **Propose** a governance review of the escalation route, naming the slowest routes. Gate: the BRC chair commissions the review; keyed into the decision register (D1) |
| M11 | Metro: about two years from the first flag to the board (OP F-OP-04). Posture tag from the corpus |
| M12 | Standing, plus: escalation latency is a culture KRI labelled `[practice-not-rule]`; speak-up data excluded |
| X1 | C-29, O-4. Records: ISS (raised date, severity history, escalation forum and date, source); PKM manifest; FCL |
| X2 | Minimum n for a median (S5-OD-11) |
| X3 | Median with n; count still unescalated |
| X4 | Months of latency; items unescalated after 12 months |
| X5 | Issues that became material later → measured from the date severity first reached "high", with the raised-date figure shown alongside |
| X6 | **Proved by** the issue log and the pack manifest. It measures latency from the **first logged** flag. It **may under-state** true latency |
| X7 | **Can tell:** how long a logged issue took to be logged as escalated to the BRC. **Cannot tell:** about a concern raised in an email, a note or speak-up before anyone logged it. Hook H-9 |
| X8 | L1 bound, beat 4 |
| X9 | "Median 4.6 months from logged issue to first BRC escalation (high severity, n = 23); 3 material items unescalated after 12 months `[illustrative]`." **TC-10** (n = 23 here; T2-40 counts 24 high-severity issues in 2026) |

#### T2-38 · Which actions or issues were closed, downgraded or dropped while the metric they were meant to fix has not moved? (core)

| Row | Value |
|---|---|
| M1 | U-T2-38. **Chain break** (action effectiveness) and escalation |
| M2 | RAS: financial crime appetite → Level 2: overdue CDD reviews → control: CDD refresh → **actions linked to the metric** (CascadeLink `action_metric`) → owner: action owners; SMF5 for validated closure → escalation: BRC exception feed |
| M3 | C-30: **closed, not effective (MB21 partial)**: action closed and linked metric still outside band after the metric's declared recovery time (S2). **Downgraded without movement:** severity lowered while the linked metric did not improve (S2). **Dropped or reassigned (MB2 partial):** cancelled, reassigned or re-dated with no closure evidence while the metric is amber or red (S2). Closure not validated by internal audit where required (S3). S1 if the metric is a Level 1 red |
| M4 | n/a (the comparison is metric movement after the action change) |
| M5 | owner ✓ · feed ✓ (metric series) · attested ✓ · **mapped**: share of actions with no linked metric shown as a mapping gap |
| M6–M8 | n/a |
| M9 | S2 → owner, SMF5 and the BRC exception feed ("closed, not effective"); S1 if Level 1 red |
| M10 | **Propose** re-opening, or reinstating the original severity, for the owner and SMF5 to decide; **prepare** a re-open request. The count goes on the escalation-health index. Gate: the owner and SMF5 |
| M11 | Nationwide £44,078,500 (12 December 2025), remediation not timely. Posture tag from the corpus |
| M12 | Standing |
| X1 | C-30, O-4, O-7. Records: ISS (status, severity, owner and due-date histories; closure date and evidence flag); AUD validated closure date; CG action → metric links; KRI; CAL recovery time |
| X2 | Each action has a linked metric, or is counted in the mapping gap; recovery time is declared per metric |
| X3 | Actions closed against metric movement, with counts and the target |
| X4 | Metric distance from target despite closures |
| X5 | Long recovery times → the declared recovery time per metric is applied before "not effective" fires |
| X6 | **Proved by** the issue log's status histories and the metric series, joined through the product's action-to-metric links. It does not judge what the closure note claimed |
| X7 | **Can tell:** that the log closed, downgraded, cancelled or reassigned an item while the metric did not move. **Cannot tell:** what the closure note claimed, or whether an action disappeared from minutes without ever being logged. Hooks H-21 and H-2 (`[legal-review]` on H-2) |
| X8 | L1 bound, beat 4 |
| X9 | "This quarter: 42 CDD remediation actions closed; overdue CDD still 26,900 against a target of 10,000. 2 issues downgraded from high to medium with no metric movement; 1 action reassigned twice with no closure evidence `[illustrative]`." **TC-9** |


---

### 5.6 Layer 2 drill and count-only cards (one line each; no per-unit block)

Per the coordinator's instruction, per-unit spec blocks are given only for the 23 cards bound or embedded on the primary view (5.1 to 5.5). The cards below are reached in one click from a bound card, or appear as a single count. Each keeps its capability, trigger, gate and honesty line here. A full block is written if Stage 6 promotes one to Layer 1.

| Card | Binding | Unit type | Capabilities | Trigger (catalogue) | Routed to / human gate | Honesty line · Tier 3 hook |
|---|---|---|---|---|---|---|
| T2-7 Waiver conditions | Drill (from T2-6, strip) | Breach | C-18, C-3, O-5 | Keyed condition breached; expiry passed with the temporary limit still in the register; condition at risk | BRC → board decides; the company secretary keys the outcome | Only keyed conditions are governed · H-26 |
| T2-9 Impact-tolerance headroom | Drill (op res) | Position | C-40, C-21, O-6 | > 75% of tolerance used (practice); breach S1; critical vulnerabilities past SLA; one dependency serving 3+ services | COO and CTO; a breach opens a draft ledger entry | Dependency-map completeness shown as the denominator |
| T2-10 Receiving-side APP exposure | Drill (fin crime) | Position | C-2, C-3 | Crosses or trends to amber or red | SMF17 | Own series only; no sector figure without its period; channel and account age only |
| T2-11 Climate collateral and pathway | Drill (climate, SS3/19) | Position | C-2, C-3, C-18 | Share of EPC E–G or high flood risk rising 2 quarters; target off pathway with no decision | CRO; BRC note | EPC coverage gap shown as the denominator |
| T2-19 Change without approval, re-test or effect | Drill (from T2-14, T2-15) | Chain break (change) | C-12, O-6 | No approval or re-test; deployed ≠ approved; effect beyond expected; proposer, approver and validator not three different people | Control owner, CTO, model risk; never reverts | Change-log metadata only · H-15, H-16 |
| T2-20 Thresholds fail to warn | Drill (threshold cascade) | Chain break (calibration) | C-13, C-5, O-11 | Green to red with no amber; band narrower than volatility; warning shorter than lead time; amber fatigue | Owner approves; annual BRC paper; never re-tuned | 8-quarter history; never widen a band only to stop fatigue |
| T2-21 Leading indicator moved first | Drill (indicator tree) | Position | C-14, C-3, O-7 | Declared leading indicator crosses its band or turns trend 2 periods while the lagging metric is green | First-line owner | The pair is declared, not causal |
| T2-22 Pack consistency across forums | Drill (pre-circulation) | Chain break (consistency) | C-27, O-4 | Value, RAG, version or as-of differs across manifests | CRO and company secretary before issue | Structured manifests only · H-3 |
| T2-23 Rated effective after a failed test | Drill (v6 OperationalAssuranceVerdict) | Chain break (assurance) | C-41, O-7 | Rating "effective" with the latest test failed, or not tested in time; RCSA rating above the test | Control owner and second line | Register against test · H-20 |
| T2-24 AI and ML models in model risk appetite | Drill (fin crime, model) | Position + chain break | C-34, C-12 | Validation overdue; KRI out of band; output drop after an unvalidated change; not in inventory | Model risk committee, SMF17 | Inventory and change log; no accuracy claim |
| T2-25 Cohort activity up, alerts down | Removed; count in the fin crime drill | Silent failure | C-8, O-9 | Activity beyond band while alerts per 10,000 flat or down for 2 periods | SMF17 (detail restricted) | Aggregates only; product, channel and account attributes only |
| T2-26 Figure not supported before publication | Count only | Chain break (disclosure) | C-33 | Disclosure-tagged metric with an open issue, restatement, "unverified" or unattested status within N days | CFO and audit committee chair | Structured records only · H-22 |
| T2-31 18 March 2027 readiness | Count only (horizon line) | Reportability (forward) | C-23, O-11 | Unclassified incidents; unregistered material third parties; obligations with no owner | COO and SMF16 | Clocks `[unverified]`; consultation distinct from final |
| T2-32 Internal read-across | Drill (from T2-14) | Chain-break propagation | C-24, O-7 | Shared design type or feed with no read-across within N days | Second line; SMF17 | Depends on consistent design-type coding |
| T2-33 Final Notice read-across tested | Drill (beat 2 precedent line) | Chain break (read-across) | C-24, O-12 | Closed "no similar issue" with no later test on matched controls | Second line; SMF17; BRC count | Coded tags only · H-17 |
| T2-39 L2 challenge closed then breached | Drill (Escalation Health) | Silent failure → breach | C-31 | L2 issue closed or risk-accepted, then a breach within N months | BRC chair (aggregate); SMF5 | Business-unit level · H-11 |
| T2-40 Self-identification ratio | Drill (Escalation Health) | Position (governance) | C-32 | Below the firm target or falling 2 quarters; external high finding in a unit with no self-reports | BRC chair | Severity-weighted; firm-set target |
| T2-42 Consumer Duty outcomes and completeness | Drill (conduct) | Position + breach + chain break | C-37 | Outside tolerance; missing any of the 5 elements | SMF16 and journey owner | Cohort minimum enforced |

Seed readouts for these cards are the catalogue's `[illustrative]` readouts, unchanged. Tie-out constraints TC-2, TC-8, TC-9 and TC-10 apply to T2-7, T2-22 and T2-40.

#### Cards not rendered in the demo build (capabilities kept; no block required)

| Card | Stage 4 binding | Capability kept in the model | Why no block |
|---|---|---|---|
| T2-41 SMF structured steps (private) | Removed (R-8; OD-10) | C-39, O-9 (`owning_smf_private`) | Not rendered on any demo screen. Talk-track only |
| T2-43 Consumer Duty evidence position | Not in demo build | C-37 (evidence position) | No beat; annual-report cadence |
| T2-44 Complaints after change; unowned journey | Not in demo build (G-6) | C-38; `OwnershipAssignment.owner_type = journey_owner` | No beat; the journey owner persona is missing |
| T2-45 Inactive fee-payers | Removed (R-9) | C-37 | Owned by SMF16 and the product owner; not in the CRO's KPI vocabulary |

If any of these is later rendered, its block must be written with the section 5.0 template before Stage 6 binds it.

---

## 6. Edge cases (the methodology's section D register applied per unit)

### 6.1 The register, coded

| Code | Edge case (method D) | Handling (method D) | Where the model enforces it |
|---|---|---|---|
| ER-1 | Green on a broken feed | Integrity overrides status; show "unverified" | Section 4.4 rule 2; `IntegritySnapshot.overall` |
| ER-2 | Zero-tolerance metric with no proxy | Flag as a chain break | C-11; T2-18 |
| ER-3 | Amber fatigue (seasonal spikes) | Calibrate seasonality in the threshold rationale; never widen amber | `ThresholdSet.seasonality_flag`, rationale; C-13 |
| ER-4 | Persistent amber that never escalates | Auto-escalate after N periods | `persistence_n` (practice); C-25; O-3 non-suppression |
| ER-5 | Action dropped or reworded in minutes | Escalation-health index records it; auto-surfaces | Structured half only (C-30 dropped or reassigned); minutes half is Tier 3 (H-2) |
| ER-6 | Restriction adherence measured by "flag fired" | Hard fail | C-19; flag figures held only as contrast |
| ER-7 | Owner attests their own control's test | Segregation-of-duties violation | C-9, C-10 |
| ER-8 | Practice presented as rule | Label it | `PracticeSetting.label`; `RoutingRule.label`; HF-5 |
| ER-9 | Regulatory floor entered as a tension | Reject; floors are not tradeable | O-5 rejects at keying; C-17 re-routes as breach |
| ER-10 | AI re-tune without approval | Block and log | No product write path to ThresholdSet, ChangeRecord or model parameters; proposals only (O-11) |
| ER-11 | Optimistic headroom with no denominator | Hard fail at board altitude | `Unit.denominator_value` required for any position to render |
| ER-12 | A "within appetite" claim relying on a GM-only or unverified figure in a demo | Must carry `[illustrative]` | `Unit.illustrative_flag`; every seed figure |

### 6.2 Which entries bite on which unit

| Card | Entries that apply | Handling specific to the card |
|---|---|---|
| T2-1 | ER-1, ER-8, ER-11, ER-12 | Headroom always with its denominator and plan version; roll-up rule shown (practice); verified badge required before "within appetite" |
| T2-2 | ER-8, ER-9 | Floor set by the firm and labelled; growth-linked gate keeps financial crime and conduct out |
| T2-3 | ER-2 (by analogy: an initiative with no governing statement) | Chip stays until mapped |
| T2-4 | ER-3, ER-8, ER-11 | Fast and slow windows labelled practice; minimum history |
| T2-5 | ER-1, ER-9, ER-11, ER-12 | Capacity side reads "unverified" if the FTE feed is not reconciled; no "lower the standard" option |
| T2-6 | ER-8, ER-9 | Floors rejected at keying and re-routed |
| T2-7 | ER-4, ER-8 | Expired waiver still in the register auto-surfaces |
| T2-8 | ER-11, ER-9 | Statutory limit treated as a floor; render gate by firm type |
| T2-9 | ER-1, ER-11 | Map completeness shown as denominator |
| T2-10, T2-11 | ER-3, ER-11 | Seasonality; EPC coverage as denominator |
| T2-12 | ER-8 | Cap configurable and labelled |
| T2-13 | ER-2 (unmapped in-horizon risk) | Chain break shown |
| T2-14 | **ER-1** (the defining case), ER-12 | Every dependent metric flips; underlying RAG kept in drill |
| T2-15 | ER-1, ER-2, ER-10 | Zero alerts treated as risk, not good news; the product never touches the engine |
| T2-16 | ER-7 | Owns and attests, or owns and validates |
| T2-17 | **ER-7**, ER-1, ER-8 | Monthly cadence labelled practice |
| T2-18 | **ER-2** | Zero-tolerance statements need a proxy |
| T2-19 | **ER-10**, ER-7 | Never reverts; three different people |
| T2-20 | **ER-3**, ER-10 | Never widen to stop fatigue; proposals only |
| T2-21 | ER-3 | Trailing band |
| T2-22 | ER-12 | Restatements flagged |
| T2-23 | ER-1 | Linked metrics turn "unverified" |
| T2-24 | ER-10 | Validation required; no re-tune |
| T2-25 | ER-1 | Silence as risk |
| T2-26 | ER-1, ER-12 | Hold or caveat proposed |
| T2-27 | **ER-6**, ER-11, ER-9 | Population test only; untested shown as untested |
| T2-28 | ER-6, ER-8 | Six-monthly certification never implied |
| T2-29 | ER-8, ER-12 | Triage target labelled practice; clocks `[unverified]` |
| T2-30 | ER-12 | Prompt, never "late" |
| T2-31 | ER-8, ER-12 | Consultation distinct from final |
| T2-32, T2-33 | ER-8 | Read-across expectations labelled practice |
| T2-34 | **ER-4**, ER-5 (structured half), ER-8 | N labelled practice with approver |
| T2-35 | **ER-4**, ER-5 (structured half), ER-8 | Routing rules executable and labelled |
| T2-36 | ER-4, ER-8 | SLA by rating and extension limit labelled |
| T2-37 | ER-5 (structured half), ER-8 | Culture KRI labelled practice |
| T2-38 | **ER-5** (structured half) | Closures that did not move the metric |
| T2-39, T2-40 | ER-8 | Business-unit level; firm-set target |
| T2-42 | ER-3, ER-11 | Cohort minimum |

**Product-level edge cases not in the method register, raised here (S5-OD-13):**
- **Badge with mixed results across a roll-up.** A Level 1 headline whose Level 3 children have different integrity states. Proposed handling: worst-of for integrity, matching the demo roll-up rule (an unverified child makes the parent unverified), with the failing child named in the drill.
- **A D1 register entry with no keyer.** Proposed handling: the entry is rejected at keying (O-5); a card that depends on a register with no entry for the period shows "not assessed (register not keyed)", never an assumed clear.
- **Firm type changed mid-demo.** The firm-type switch re-evaluates every unit; T2-8 units are removed, not hidden with stale values.

---

## 7. KPI definitions

Every KPI that Stage 4 places on a CRO or BRC chair screen, with a plain formula and source fields. N = north-star; D = diagnostic; G = governance or culture KRI (labelled `[practice-not-rule]`).

| Code | KPI (board wording) | Plain formula | Source fields | Persona served | Class | Cards |
|---|---|---|---|---|---|---|
| K-1 | Appetite used | actual ÷ appetite (red), per RAS statement | E-17.value; E-08.red | CRO, board | N | 1 |
| K-2 | Headroom | appetite − actual, in the metric's own unit, with the denominator; £ headroom = points × exposure base | E-08.red; E-17.value; E-07.exposure_base_gbp | CRO, board | N | 1, 8 |
| K-3 | Projected appetite used at plan-year end | position at plan-year end at plan volumes (C-4), shown as a range in the drill | E-04.plan_volume, plan_version; E-17 | CRO, CFO | N | 1 |
| K-4 | Binding constraint | the first constraint (appetite statement, CET1, leverage, LCR, NSFR) projected to reach its limit at plan volumes | C-4 output | CRO, CFO, board | N | 1 |
| K-5 | Level 1 metrics outside appetite | count at amber or red ÷ all Level 1 metrics in the schedule ("n of 34") | E-07.level; status (C-6) | CRO, board | N | 12, scorecard |
| K-6 | Persistence | consecutive periods at amber or worse | `status_history[]` | CRO, BRC chair | N | 34 |
| K-7 | CET1, leverage, LCR, NSFR against internal limits | value against internal limit, regulatory minimum plus buffers and the ICAAP stressed low point | CAP metrics; E-08 | CRO, CFO | N | 1, 4 |
| K-8 | Headlines shown | headline metrics ÷ Level 1 schedule ("12 of 34"), cap labelled practice | E-07.headline_flag; E-02 `headline_cap` | CRO, board | D | 12 |
| K-9 | Time to threshold | projected crossing date (C-3) − today, in weeks; compared with weeks to the next forum + lead time | C-3; E-47; E-07 lead time | CRO, owners | D | 4, 21 |
| K-10 | Leading-indicator drift | period change in the leading indicator while the lagging partner is green | E-10; E-17 | CRO, owners | D | 21 |
| K-11 | Cost of risk; 3m+ arrears | as defined by the bank (consumed); arrears = accounts 3m+ past due ÷ accounts | KRI | CRO | D | 21 (drill) |
| K-12 | Impact-tolerance used | worst disruption this year ÷ impact tolerance, per important business service | E-30; E-24 | CRO, COO | D | 9 |
| K-13 | Customers per qualified financial crime handler | customers ÷ qualified financial crime FTE (Stage 4 addition, OD-11) | KRI customers; HR qualified FTE | CRO, CEO, SMF17 | D | 5 |
| K-14 | Alerts cleared within SLA | alerts closed within SLA ÷ alerts due in the period | KRI case management | CRO, SMF17 | D | 5 |
| K-15 | Alert queue median age | median days open of alerts in the queue | KRI case management | CRO, SMF17 | D | 5 |
| K-16 | Chain integrity (four checks) | per headline: owner, feed, attestation, mapping, each pass or fail; summary "n of 12 headlines verified" | E-50 | CRO, BRC chair | D | badge on every headline; 14 to 18 |
| K-17 | Feed completeness | target count ÷ source count for the latest run (value completeness where held) | E-18 | CRO | D | 14 |
| K-18 | Attestations backed by evidence | attestations that reference the current, completed, passing result ÷ attestations in the cycle | E-21; E-18 | CRO | D | 17 |
| K-19 | Restriction population tested | population tested ÷ population in scope, per clause | E-29 | CRO, SMF17 | D | 27 |
| K-20 | Restriction breaches | accounts (and customers) in breach ÷ population tested, by route | E-29 | CRO, SMF17, board (count) | D | 27 |
| K-21 | Months since last zero-breach month | months since the last test run with zero breaches across a fully tested population | E-29 history | CRO, BRC chair, board | D | 27 |
| K-22 | Days from awareness to notification | `RouteDecision.notification_made_on` − `ReportableEvent.logged_awareness_date`, per route; also awareness to decision | E-37; E-39 | CRO, SMF16 | D | 29 |
| K-23 | Routes decided | routes with a recorded decision ÷ engaged routes, per event | E-38; E-39 | CRO, SMF16, board (count) | D | 29 |
| K-24 | Time elapsed against clock | now − `clock_start_ts`, against the route clock and the triage target (practice) | E-38; E-40; E-02 | CRO, SMF16 | D | 29 |
| K-25 | Awareness gap | `logged_awareness_date` − earliest linked structured signal date, in days | E-37; C-22 | CRO, deciding SMF only (D6) | D | 30 |
| K-26 | Overdue high-rated findings and regulatory actions | count past due ÷ open, by rating; extensions; repeats | E-23; E-22 | CRO, BRC chair, SMF5 | D | 36 |
| K-27 | Projected backlog clearance | least-squares clearance date against committed date | E-17 backlog series | BRC chair | D | 36 |
| K-28 | Escalation latency | median days from severity first "high" to first BRC escalation, high+ issues, with n | E-22 | BRC chair, CRO | G | 37 |
| K-29 | Persistent ambers with nothing recorded | count meeting C-25 ÷ persistent ambers | C-25 | BRC chair | G | 34 |
| K-30 | Pack overrides | items qualified; included; removed with reason; removed without reason | E-42; E-43 | BRC chair | G | 35 |
| K-31 | Closed without effect | closed actions whose linked metric is still outside band after recovery time ÷ closed actions | E-22; E-17; E-09 | BRC chair | G | 38 |
| K-32 | Self-identification ratio | high-severity issues found by L1 or L2 ÷ all high-severity issues | E-22.source | BRC chair, CRO | G | 40 |
| K-33 | Consumer Duty outcome against tolerance | measure value against tolerance by journey and cohort; completeness "n of 5" | E-31 | CRO (drill), SMF16 | D | 42 |
| K-34 | Emerging risks with no metric | in-horizon emerging risks with no linked metric ÷ in-horizon emerging risks | E-33; E-09 | CRO, BRC | D | 13 |

**Coverage check against Stage 4.** Every north-star and diagnostic KPI in Stage 4 section 1.4 has a row: utilisation and headroom (K-1, K-2), outside appetite (K-5, K-6), capital and liquidity (K-7), leading drift and time to threshold (K-9, K-10), cost of risk and arrears (K-11), impact tolerance (K-12), VREQ adherence (K-19 to K-21), chain integrity (K-16), overdue actions (K-26), days to notify (K-22), escalation latency (K-28), self-identification (K-32), Consumer Duty (K-33), and the Stage 4 addition (K-13, with K-14). The BRC chair's vocabulary (Stage 4 section 2.1) is covered by K-26 to K-32.


---

## 8. Capability boundary

Restated from PRODUCT_BOUNDARY and DOES_NOT_DO, and mapped to the entity sides in section 1.1, so the data model cannot imply that the platform owns the system of record or acts on its own.

### 8.1 Consume, own, never own

| | What | Entities | Write path in the product |
|---|---|---|---|
| **Consumes** (S) | RAS and limit register; KRI time series; control register and tests; RCSA; issue and action log; incidents and losses; complaints and FOS (coded counts only); policy and obligation libraries; SMCR SoRs and the MRM; change and parameter logs; feed reconciliation counts; audit findings; VREQ / s166 register and population test results; model inventory; ICAAP / ILAAP and plan outputs; Consumer Duty MI; third-party register fields; emerging-risk register | E-04, E-06, E-07, E-11 to E-14, E-16 to E-20, E-22 to E-33 | **None.** Read-only, stamped with `source_system`, `source_record_id`, `ingested_at` |
| **Owns** (P) | The cascade graph; threshold calibration records; executable restriction test definitions; attestation records (a result ID per attestation); the four D1 registers (tension, decision and waiver, reportability ledger, pack-build manifest with override log); the rule library by in-force date; the read-across log; the precedent corpus (real, posture-tagged); drafts, gate decisions, artefact versions and the audit log | E-03, E-05, E-08 to E-10, E-15, E-21, E-28 (test definition), E-34 to E-45, E-51 to E-54 | Keyed by a named person (O-5, O-11, O-12), or system-written append-only (O-10) |
| **Configures** (C) | Firm attributes including `firm_type`; practice settings; forums, the forum calendar and routing rules | E-01, E-02, E-46 to E-48 | Named approver; `practice_not_rule` label |
| **Derives** (D) | Units, statuses, integrity snapshots, trajectories, KPIs | E-49, E-50; KPIs K-1 to K-34 | Computed only; never hand-edited |
| **Never owns** | The GRC system of record; the core banking, screening and monitoring engines; the regulatory return or any notification to the FCA, PRA, NCA, OFSI or ICO; SAR content; customer-level financial crime case records; committee minutes (Tier 3 reads them, never owns them) | None (no entity holds them) | -- |

### 8.2 No auto-fire

- **Action verbs are an enum:** `prepare`, `propose`, `draft`, `send_to_owner`. No entity, field or status represents filing, notifying, submitting, reverting, re-tuning or "complete now" (HF-8).
- **Every draft needs a named human gate** (E-52) before it leaves the product. "Send to owner" sends an accepted draft to a named person inside the firm; it never reaches a regulator.
- **Reportability:** the product prepares the case and proposes the decider. Only a `RouteDecision` with a named SMF records a decision, append-only. The product never re-dates `logged_awareness_date`. `notification_made_on` is a keyed record of a fact that happened outside the product (S5-OD-9).
- **Thresholds and models:** no write path. A change is a `calibration_proposal` draft. The accountable owner approves it, and the new `ThresholdSet` version is keyed with the approver (SS1/23 governed change).
- **Board decisions:** the product shows "proposed to the BRC on [date] · decision pending" until a named person keys the outcome into the decision register (OD-9). It never shows itself making a board decision.
- **Exception feed:** the product cannot remove a qualifying item. Only a named approver can, with a reason code, and the BRC chair sees the override log.

### 8.3 Cohort level and identity level

- Cross-domain joins are cohort-level only (section 1.6).
- The board and CRO faces show counts with denominators, never customer-level records.
- Cohort cuts are suppressed below `min_cohort_size`. Financial crime cohorts never use nationality, ethnicity or postcode.
- Any differential action on a cohort is gated to a human and a risk review, and logged.
- People appear by role on the face. Names appear in the drill. Individual SMF trails are private to the SMF.

### 8.4 AI marker

`DraftAction.ai_marker = true` and `reason_one_line` are required on every AI draft. The AI marker appears on every AI narrative, sufficiency note and draft. Statuses, integrity checks and KPIs are deterministic rule outputs, not AI outputs. They carry no AI marker, and the drill shows their rule, so no one mistakes them for model scores.

---

## 9. Open decisions, firm type and tie-out constraints

### 9.1 OD-2: firm type as a configuration attribute (defaulted to building society, flagged)

**Default `building_society`, on the coordinator's instruction. Still configurable; not locked.** The switch lets 9A seed either firm without a model change. The challenger alternative stays open for the user to confirm.

| Item | `firm_type = building_society` | `firm_type = challenger_bank` |
|---|---|---|
| T2-8 nature and funding limits | Evaluated and rendered on the strategy strip | **Not evaluated, not rendered.** No empty slot |
| Statutory Level 1 metrics (nature limit, funding limit) | In the Level 1 schedule | Excluded. 9A must keep the schedule count consistent ("12 of 34") by substituting other metrics, or change the denominator everywhere it appears |
| Building Societies Act 1986 rule-library entries | Active (`[verify]` the 2024 amendment) | Inactive |
| T2-5 growth shape | **Re-scaled (default):** members +31% (1.45m to 1.90m) through mortgage and savings growth and digital member onboarding; handlers 58 to 63 | Catalogue readout (+58% customers, 64 to 71 handlers) |
| Customer wording | "Members" where the society context needs it (copy for Stage 6) | "Customers" |
| Illustrative size | £22.4bn total assets `[illustrative]` | £30bn total assets `[illustrative]` |
| Fictional name | Stage 4 proposed "Fernbridge Building Society" | Not yet chosen |
| Everything else | Unchanged. Both are dual-regulated deposit-takers, so FR7 applies to both | Unchanged |

**Applied default:** building society, so T2-8 renders and T2-5 carries the re-scaled member-growth readout. Keep the switch live for a challenger audience. Check every fictional name against the FCA register before use.

### 9.2 Open decisions

**Carried from Stage 4 and earlier, and touched by this model** (none resolved here):

| # | Decision | How the model accommodates it |
|---|---|---|
| OD-1 | Theme | No data effect. The model defines `unverified` as a status value distinct from the RAG values, so the theme must give it its own visual state |
| **OD-2** | **Firm type** | **Configuration attribute, default `building_society` (section 9.1). The challenger option is flagged for user confirmation** |
| OD-4 | Density: T2-6 and T2-17 as inline states | The units are the same either way; the rendering is Stage 6's choice |
| OD-5 / D8 | Badge always on and quiet | `IntegritySnapshot` exists for every headline, so either behaviour is possible |
| OD-7 | Handoff destinations | O-7 supports a "sent to owner" confirmation and deep links to the v6 SMF16 and SMF17 screens |
| OD-8 | Named keyer for the D1 registers | `keyed_by` and `keyer_role` on every entry. Defaults: CRO office for tension, ledger and manifest drafts; company secretary for board decisions |
| OD-9 | How beat 1 resolves | `DecisionRecord.status = proposed` renders "proposed · decision pending" |
| OD-11 | KPI addition | Defined as K-13 with K-14 |
| D7 / G-04 | Level 3 → Level 1 roll-up rule | `Metric.rollup_rule` per metric; demo default worst-of; the rule used is shown on the unit (S5-OD-3) |

**New at Stage 5:**

| # | Decision | Options | Recommendation | Changes |
|---|---|---|---|---|
| S5-OD-1 | **Capital has no domain key.** CET1 and leverage do not map to any of the nine v6 domains | (a) Group under "regulatory"; (b) group under "liquidity" as "capital and liquidity"; (c) add a board-layer key "capital" | (c) on the board layer only, leaving the v6 nine untouched. `[unverified -- confirm against riskDomainsV4.ts]` | Strategy strip; drill routing |
| S5-OD-2 | **Count against value reconciliation** (C18) | Count drives the trigger; value drives it; either drives it | Either drives the trigger when it breaches tolerance; both are shown where the source holds value | T2-14 trigger |
| S5-OD-3 | **Roll-up rule** (method gap G-04) | Worst-of; count-of-breaches; weighted | Worst-of for the demo, declared per metric, with the rule shown on the unit. The method remains open | T2-1, T2-4, T2-12, T2-20 |
| S5-OD-4 | **Trajectory defaults** | Window length; minimum history; the two-window rule | 6-point window; minimum 4 points; short window 3 and long window 6 must agree. Label all three as practice | T2-1, T2-4, T2-5, T2-21, T2-34, T2-36 |
| S5-OD-5 | **Where the T2-6 floor-lane breach renders** | Inline on beat 1 only; or also as a breach on the restriction or integrity path | Inline on beat 1 as "reclassified as a floor", with a link to the breach path. Keep beat 3 focused on VREQ R-03 | Beat 1 and beat 3 copy |
| S5-OD-6 | **Capacity feeds for T2-5** | Qualified FTE and alerts cleared within SLA held as reconciled KRIs; or not held | Seed both as reconciled in the demo. Note in the talk track that many firms hold only headcount; where a feed is missing, the capacity side reads "unverified" | T2-5 honesty line |
| S5-OD-7 | **Clock verification** | All clocks `[unverified]` until checked against the texts | A named reviewer verifies each `RuleLibraryEntry` before any client demo. Until then the drill shows "clock unverified" | T2-29, T2-31 |
| S5-OD-8 | **Caveat and status** | An accepted caveat changes the face status to "caveated"; or the face stays "unverified" | The face stays "unverified". The caveat lets the figure travel into the pack with its caveat text | Beat 2 ending |
| S5-OD-9 | **`notification_made_on` as a keyed fact** | Keep it (supports K-22); or drop K-22 from the demo | Keep it as a fact keyed after the event, never a send action. Confirm with the compliance lens that it does not read as the product notifying | T2-29; K-22 |
| S5-OD-10 | **S1 forum window against the demo calendar** | Count the 10-working-day window to the meeting date; or to the pack-lock date | Count to the **pack-lock date**. With the last ERC on 14 October 2026 and the next BRC in mid-December 2026, the meeting-date window would not make T2-14 an S1 on 27 October 2026. 9A sets the dates either way | T2-14 severity |
| S5-OD-11 | **Minimum sample for governance KRIs** | None; a firm-set minimum | Firm-set minimum (for example n ≥ 10) before a median or ratio is shown; below it the card shows the count only | T2-37, T2-40 |
| S5-OD-12 | **Point-in-time risk ratings** for restriction tests | The bank holds rating history; or only current ratings | The test uses ratings as at the event date where held. Where not held, it uses current ratings and says so on the honesty line | T2-27, T2-28 |
| S5-OD-13 | **Edge cases missing from the method register** (section 6.2): integrity across a roll-up; an unkeyed register; a firm-type switch | Add them to the methodology file; or keep them in Stage 5 only | Add them upstream to `yaara-uk-risk-analysis-method.md` section D (Stage 5 does not author the method) | Methodology file |
| S5-OD-14 | **Repo alignment** | Entity and field names match the existing types in `riskDomainsV4.ts`, `precedentCorpus.ts` and the v6 components; or new board-layer types are added | Stage 8 checks against the repo. Every repo-facing name here is `[unverified -- confirm against repo]` | Stage 8 |

### 9.3 Tie-out constraints for Stage 9A (found while modelling; not fixed here)

| # | Constraint | Cards | Recommendation |
|---|---|---|---|
| TC-1 | T2-5 is re-scaled for the society default; T2-8 renders; the statutory metrics sit inside the 34-metric schedule | T2-5, T2-8, T2-12 | Keep "n of 34" consistent including the nature and funding metrics. If switched to a challenger, use the catalogue T2-5 readout and substitute the two statutory metrics |
| TC-2 | T2-1 measures against high-LTV appetite of 20%. T2-7 says that limit was raised to 25% from April 2026 for 6 months and still reads 25% in the register 3 weeks after expiry. T2-1's amber must sit between 17.6% and 20% | T2-1, T2-7 | Keep both. Show T2-1 against the permanent 20%, with a note that the temporary limit has expired and the register is not yet updated. This ties the two cards together |
| TC-3 | T2-14 arithmetic: 144,000 unreconciled; with other cohorts at 99.97%, the same-day cohort is about 143,300 records in the run | T2-14 | Seed cohort counts that sum exactly |
| TC-4 | VREQ clause R-03.2 is unowned (T2-16), and 1 of 15 VREQ clauses has no executable test (T2-18). The beat 3 restriction is R-03 with 4 clauses (T2-28) | T2-16, T2-18, T2-27, T2-28 | Decide deliberately whether beat 3's restriction carries the unowned clause and the untested clause. If it does, T2-27's owner and mapping dots fail too. Otherwise, move them to another restriction |
| TC-5 | T2-27 (112 accounts this month, 97 via the savings pot, 24,000 partner-channel openings untested) conflicts with T2-28 (6 high-risk onboardings in Q3, all via the 01 August 2026 migration). The coverage denominator unit is unclear (customers tested against account openings) | T2-27, T2-28 | Put the T2-27 run inside the T2-28 attestation period, or make the periods explicit. Fix one population unit and state in-scope and tested in it. Assign all 112 accounts to routes |
| TC-6 | The T2-29 and T2-30 seed event (E-2026-117, mortgage reversion-rate error) is not the beat 3 restriction breach | T2-27, T2-29, T2-30 | Seed two ledger events: the R-03 breach as the beat 3 row (with T2-30 on it, or on E-2026-117), and E-2026-117 as a second row |
| TC-7 | T2-29 says SUP 15.3 was decided on 23 October, "on day 4". T2-30 logs awareness on 14 October, which makes 23 October day 9. On demo day (27 October 2026) the event is on day 13 | T2-29, T2-30 | Fix one awareness date and derive "day n" from it. Recompute the T2-30 gap if the date moves (it is 54 days from 21 August to 14 October) |
| TC-8 | "Screening coverage" is used for two different measures: list rule coverage (1.3%, T2-15) and the pack figure (92%, T2-22) | T2-15, T2-22 | Name them distinctly: "sanctions list rule coverage" and "customer screening coverage" |
| TC-9 | The CDD backlog appears as 41,000–44,000 customers (T2-36) and as overdue CDD of 26,900 against a target of 10,000 (T2-38) | T2-5, T2-36, T2-38 | Define two metrics, total refresh backlog and overdue reviews, or align on one series |
| TC-10 | Escalation-health counts must reconcile: 13 items qualify and 1 is removed (T2-35); 1 persistent amber has no escalation (T2-34); n = 23 high issues (T2-37) against 24 high-severity issues in 2026 (T2-40) | T2-34, T2-35, T2-37, T2-40 | Make the T2-34 persistent amber **the item removed at ERC with no reason**. This joins the near-miss to the beat 4 headline. State the windows for T2-37 and T2-40 so that 23 and 24 reconcile |

---

## 10. Definition-of-done check (stage file quality bar)

| Criterion | Status |
|---|---|
| Methodology loaded from METHODOLOGY_FILE; no technique named outside it | Met. The unit, pipeline, register and template all come from `yaara-uk-risk-analysis-method.md`. The pipeline has 5 stages, as the method defines |
| Every demo-spine card has a full unit block with all methodology-template fields filled | Met. All 23 primary-view cards (including the 12 core and 5 reserve cards) have full blocks, rows M1 to M12 and X1 to X9. The 18 Layer 2 and count-only cards are in a one-line table (5.6), per the coordinator's instruction |
| Every capability is C- or O-coded and feeds at least one card | Met. C-1 to C-41 and O-1 to O-13 each list cards. C-38 and C-39 feed only cards that are not rendered in the demo (T2-44, T2-41); they are kept for the product |
| Every persona top question maps to a capability or is flagged as a gap | Met. Q1 to Q10 all map (section 3.3). Tier 3 halves, data gaps and verification gaps are flagged |
| Every unit's honesty line is stated and does not over-claim | Met. Row X6 in every block separates what proves detection from what the card does not claim. Group 2 partials carry the fixed "can tell / cannot tell" copy |
| The boundary section names what the product never owns | Met (section 8.1) |
| Spine encoded explicitly; differentiating joins named; version and audit chain | Met (sections 1.4, 1.5 and 1.7) |
| Fields are catalogue-driven, not a schema dump; trust-bearing fields flagged | Met. Each field lists the cards that read it; ★ marks the trust-bearing fields |
| No new cards invented | Met. Every block is a catalogue card. No new T2 IDs. Units reuse catalogue readouts |
| D1 modelled as human-keyed structured data | Met. Every D1 entity has the keying block, and `entry_method = manual_structured` is the only permitted value |
| OD-2: firm type as configuration; defaulted to building society; flagged | Met (section 9.1) |

---

## 11. Feeds

- **Stage 6:** capability codes for the Goal → Capability → UI table (section 3); the KPI definitions K-1 to K-34; the status values, including `unverified` as its own state; visibility scopes (D6); the firm-type gate on T2-8.
- **Stage 7:** routing and gates per unit (M9 and M10); the non-suppression rule; the "proposed · decision pending" ending; the send-to-owner handoffs (O-7).
- **Stage 8:** entities E-01 to E-54, relationships, the append-only and versioned objects, and the repo-alignment check (S5-OD-14).
- **Stage 9A:** the comparison basis per unit (section 4.3), the trust-bearing ★ fields to seed richly, tie-out constraints TC-1 to TC-10, and the firm-type switch.
- **Stage 9B:** unit conditions (M3) and payload fields (E-49 to E-51), with the seed readouts (X9).
- **Stage 9C:** HF-1 to HF-10 enforced in the model (sections 4.4, 6.1 and 8). Governance gap: no rule for the "unverified" visual state (OD-1).

*End of Stage 5. Not locked. Next: Stage 6 (UI spec), after the user confirms this stage and the OD-2 default.*
