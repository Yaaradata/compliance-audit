# UK Risk Board View -- Stage 3 Insight-Card Catalogue (uk-bank-risk-governance)

- **Run:** Yaara Risk & Compliance -- UK Banking, UK Board Risk View. Primary persona: CRO (SMF4) at board altitude. Secondary: BRC chair (SMF10), SMF16, SMF17, CFO (SMF2), first-line owners, SMF5.
- **Intent:** sales demo to UK CROs and BRC chairs, four hero beats. Internal-first: feasibility notes are inline.
- **Input:** `UKRiskBoard_Ph1_Stage2_UseCaseMerge.md` (70 merged use cases: MA1–MA37, MB1–MB33; shortlist of 13; 45 single-source gems; contradictions C1–C21; coverage check). Stage 1 files consulted for detail on thin items.
- **Method:** appetite-cascade assurance (`yaara-uk-risk-analysis-method.md`). Every card is one of five unit types: position, breach, chain break, tension collision or reportability case.
- **Beachhead (confirmed by the user):** Option A. Tiers 1 and 2 use structured records only. Anything that needs the narrative corpus is Tier 3.
- **ICP:** tier 2 building societies and challengers, £10bn–£65bn total assets. Tier 3 (£1bn–£10bn) is a turnkey variant. Headline board metrics default to 12, configurable, labelled practice.
- **Date:** 27 October 2026.
- **Status:** this file is the single contract that Phase 3 (personas, data model, UI spec) consumes. Stop here; build-spec and UI work happen in Phase 3.

**Terms.** An **insight card** is the proactive UI object the product surfaces. The **bank's business** (its lending book, savings franchise, payments and so on) is what the card analyses. The two are never called by the same noun in this file.

## Result at a glance

| Measure | Count |
|---|---|
| Merged use cases re-sorted through the substrate filter | **70 of 70** (MA1–MA37, MB1–MB33) |
| Group 1: Tier 2 eligible (structured only) | 34 (all Bucket A; MA27 held as a Tier 1 KRI row) |
| Group 2: Tier 2 partial, with a Tier 3 hook | 23 (22 Bucket B, plus MA16) |
| Group 3: Tier 3 only | 13 (11 Bucket B, plus MA25 and MA26) |
| Tier 1 descriptive questions | **74** across 9 headings |
| Tier 2 insight cards | **45** (T2-1 to T2-45): 10 WOW · 29 DIFFERENTIATING · 6 TABLE-STAKES |
| Tier 3 hooks | **36** (H-1 to H-36): 33 on MB items, 3 on MA items (MA16 HR feed; MA25 and MA26 agent data) |
| 24x7 "AI CRO" set | **12** cards across 4 hero beats |

---

## 1. Beachhead statement

### 1.1 What Tiers 1 and 2 may use

Tiers 1 and 2 are answerable from the bank's **structured records** alone. These are consumed, never owned:

| Code | Record | Key structured fields used |
|---|---|---|
| RAS | RAS and limit register | statement_id, principal_risk, level (1/2/3), metric_id, capacity, red (appetite), amber (trigger), operating_limit, zero_tolerance flag, temporary_limit, temp_expiry, headline_flag, approval_date, owner_smf |
| KRI | KRI and metric time series | metric_id, as_of, value, numerator, denominator, version, restated_flag, source_feed_id |
| CTL | Control register and test results | control_id, design_type, feed_id, owner, operating_rating, last_test_date, test_result, test_population, next_test_due |
| RCSA | RCSA outputs | risk_id, control_id, self_assessed_rating, cycle_date, assessor |
| ISS | Issue and action log | issue_id, raised_date, source (L1 / L2 / L3 / regulator / external review / complaint), severity and severity_history, linked_metric_id, linked_control_id, owner, due_date and due_date_history, status and status_history, closure_date, closure_evidence_flag, escalation_forum, escalation_date, risk_acceptance_id, action_type |
| INC | Incident and loss events | event_id, detected_date, logged_date, type, service_id, duration, customers_affected, gross_loss, root_cause_code |
| CMP | Complaints and FOS outcomes (structured fields and counts only) | received_date, product, journey_code, FCA category, root_cause_code, outcome, FOS referral and outcome, redress, vulnerability flag (count level) |
| OBL | Policy and obligation library | obligation_id, source (policy / regulation / VREQ), clause_id, in_force_date, status (consultation / final), mapped control, metric and evidence IDs, owner |
| SMCR | SoRs and the Management Responsibilities Map | smf_id, role, prescribed responsibilities, mapped objects, interim flag, effective_from, version |
| CHG | Technology change and parameter log | change_id, control_id or model_id, parameter, old_value, new_value, approved_value, approver, approval_date, deploy_date, retest_id |
| REC | Data-feed reconciliation counts | feed_id, run_ts, source_count, target_count, source_value, target_value, cohort breakdown, rejected_backlog, rejected_age |
| AUD | Audit findings | finding_id, rating, owner, due_date, extension_count, repeat_flag, status, validated_closure_date |
| RST | VREQ / s166 register and population test results | restriction_id, clause_id, imposed_date, population definition, test_id, run_date, population_in_scope, population_tested, breaches, breach route (product / channel / migration / manual), attestation_due |
| MOD | Model inventory | model_id, use, tier, owner, last_validation, validation_result, approved parameters, performance KRIs |
| CAP | ICAAP / ILAAP, stress and planning outputs | CET1, leverage, LCR, NSFR, stress results, capacity figures, plan volumes by initiative |
| CDO | Consumer Duty outcome MI (structured) | outcome (products and services; price and value; consumer understanding; consumer support), journey, cohort, measure, threshold, owner, action, due_date, success measure, value, cohort_n |
| ATT | Structured attestation records | attestation_id, object_id, attester, role, timestamp, attested_result_id (the reconciliation or test run attested), status, challenger |

### 1.2 Product-owned structured records (also allowed in Tiers 1 and 2)

The product boundary says the product **owns** some records. They are structured, and Tiers 1 and 2 may use them **on one condition**: each entry is keyed into the product as structured fields by a named person. In Tiers 1 and 2, nothing is extracted from papers or minutes by AI.

| Code | Record | Structured content |
|---|---|---|
| CG | Cascade graph | objective → RAS statement → L1 → L2/L3 → obligation → control → feed → owner links (many-to-many); guardrail and leading-lagging pairs; action-to-metric links |
| CAL | Threshold calibration records | per metric: capacity, red, amber, limit, rationale code, lead-time and volatility inputs, approval |
| TEN | Tension register | pair, partner metrics, agreed bounds, floor flag, owner, review date, decision reference ID (an ID only; the minute text is Tier 3) |
| DEC | Decision register | waivers and temporary limits with expiry and structured conditions (metric, bound) |
| RPL | Reportability decision ledger | parent event, child routes, clock start, logged awareness date, decision, decider, timestamp, dissent flag, re-evaluation date |
| RAL | Read-across log | trigger (internal issue or Final Notice), matched control IDs, closure date, closure code |
| PKM | Pack-build manifest and override log | item IDs placed in each forum's exception feed per cycle; overrides with approver and reason code |
| FCL | Forum calendar and routing rules | forum dates; the firm's routing rules as executable configuration (`[practice-not-rule]`) |
| PRC | Precedent corpus (reference data) | real UK Final Notices with structured tags only: failure-shape code, control type, date, penalty, posture tag. The notice text is not mined in Tiers 1 and 2 |

This is a deliberate reading of Option A, not an extension of it. It is listed as Panel call P1 and Open decision D1 so the team can confirm it.

### 1.3 What is parked in Tier 3

**The narrative corpus** (the join asset): committee papers and minutes; escalation notes; attestation commentary text; second-line challenge records as text; complaint narratives; speak-up case text. Every insight that needs it is Tier 3, tagged `[TIER-3 hook → MBx]`.

**Data beyond the beachhead substrate that is not narrative** (also parked in Tier 3):
- HR conduct-outcome feeds (MA16);
- agent mandate stores and agent-tagged payment or session data (MA25, MA26, MB30);
- speak-up data, even aggregated (MB10, MB27, MB28).

### 1.4 Honesty rules that enforce the beachhead

1. **No join is smuggled into Tier 2.** Where a top Bucket B use case has a structured-only partial version, the partial is built as a Tier 2 card and states plainly what it can and cannot tell the CRO. The full narrative version is tagged as the Tier 3 hook.
2. **Wording follows the evidence.** A structured partial says "no action recorded in the action log", never "not discussed" or "the minutes are wrong".
3. **Integrity overrides status.** A metric on a broken feed shows "unverified", never green.
4. **Every number has a denominator.** Synthetic figures carry `[illustrative]`. Precedents are real and posture-tagged.
5. **The product boundary holds.** AI drafts and challenges. It never decides reportability, files or notifies, or re-tunes anything. Action labels read "prepare" or "propose".

### 1.5 Common severity scale and escalation path

Routing is by materiality and decision need, not RAG visibility (method B.8). Each card maps its triggers onto this scale.

| Severity | Typical triggers | Escalation path |
|---|---|---|
| **S1 Critical** | Level 1 red; a restriction breach; a regulatory floor touched; a notification route engaged with no recorded decision; a headline figure "unverified" within 10 working days of a forum `[practice-not-rule]` | CRO and accountable SMF the same day. The BRC chair is told out of cycle at the CRO's call. Auto-surfaces and cannot be suppressed |
| **S2 High** | Level 1 amber; Level 2 red; Level 2 amber for N or more periods; a chain break on a headline metric; an item past SLA by rating | ERC agenda, then the BRC exception feed. An override needs a named approver and a reason code, and is logged |
| **S3 Moderate** | Level 2 amber; Level 3 breach; a chain break on a non-headline metric | Owner and second line; ERC by exception |
| **S4 Watch** | Early-warning trajectory; horizon items | Owner; ERC summary line |

The default N is 2 consecutive quarters for Level 2 (GM B-GM-02), and it is configurable. See Panel call P6.

### 1.6 Audience codes

- **CRO:** SMF4.
- **BRC chair:** SMF10.
- **SMF16:** Head of Compliance.
- **SMF17:** Head of Financial Crime / MLRO.
- **CFO:** SMF2.
- **SMF5:** Head of Internal Audit.
- **Owner:** the first-line risk, metric, feed or control owner.
- **COO/CTO.**

### 1.7 Illustrative firm used in card readouts

Unless stated otherwise, readouts use a tier 2 building society with total assets of £22.4bn `[illustrative]` and a 34-metric Level 1 schedule with 12 headlines `[illustrative]`. Challenger readouts use a £30bn digital bank `[illustrative]`. All synthetic figures are marked.

---
## 2. Mining the merge: all 70 merged use cases through the substrate filter

### 2.1 Filter rules
- **Group 1, Tier 2 eligible.** Fully answerable from the structured records in 1.1 and 1.2. The use case is built as a Tier 2 card, or (for MA27 only) held as a Tier 1 question.
- **Group 2, Tier 2 partial with a Tier 3 hook.** A structured-only version exists that still prompts an action. It is built as a Tier 2 card, and the card states what it can and cannot tell the CRO. The full version that needs the narrative corpus, or data beyond the substrate, is a Tier 3 hook.
- **Group 3, Tier 3 only.** No honest structured partial exists, or what exists adds nothing beyond another Tier 2 card. These are held as hooks only.

### 2.2 Summary

| Group | Count | IDs |
|---|---|---|
| 1. Tier 2 eligible | **34** | MA1–MA15, MA17–MA24, MA27–MA37 |
| 2. Tier 2 partial + Tier 3 hook | **23** | MA16; MB1–MB9; MB11; MB13–MB17; MB19–MB22; MB24–MB26 |
| 3. Tier 3 only | **13** | MA25, MA26; MB10, MB12, MB18, MB23, MB27–MB33 |
| **Total** | **70** | 37 MA + 33 MB |

### 2.3 Placement table (every merged ID)

Column key: **T2** = the Tier 2 card that builds it; **T1** = the Tier 1 question that holds it; **Hook** = Tier 3 hook ID (section 5).

| ID | Use case (short) | Group | Placement | Why (substrate test) |
|---|---|---|---|---|
| MA1 | Appetite used by the plan; when a constraint binds | 1 | T2-1 | RAS, CAP plan volumes, KRI series, CG links |
| MA2 | Unused deliberate growth | 1 | T2-2 | RAS utilisation floor against plan; structured |
| MA3 | Plan initiative with no RAS link | 1 | T2-3 | CAP initiatives × CG links; structured |
| MA4 | What crosses amber before the next forum | 1 | T2-4 | KRI series, CAL lead times, FCL calendar |
| MA5 | Thresholds that fail to warn in time | 1 | T2-20 | KRI history, CAL bands, status history |
| MA6 | Leading indicator moved before its lagging partner | 1 | T2-21 | CG leading–lagging pairs, KRI series |
| MA7 | Restriction obeyed across the whole population | 1 | T2-27 | RST population tests with denominators |
| MA8 | Defend this figure: feed completeness | 1 | T2-14 | REC counts and values, CG lineage, ATT |
| MA9 | Sanctions list coverage; control gone quiet | 1 | T2-15 | KRI alert counts, list and rule counts, CHG |
| MA10 | Every zero statement carries a proxy | 1 | T2-18 | RAS zero_tolerance flag × CG proxy metric |
| MA11 | Cohort activity departs from profile while alerts fall | 1 | T2-25 | Cohort-level KRI aggregates; protected-attribute care |
| MA12 | Growth outrunning financial crime control capacity | 1 | T2-5 | CAP growth, KRI capacity and queue age |
| MA13 | Change touched a control without approval or re-test | 1 | T2-19 | CHG approval and re-test fields × CTL |
| MA14 | AI and ML models inside model risk appetite (SS1/23) | 1 | T2-24 | MOD validation, performance KRIs, CHG |
| MA15 | Multi-clock reportability ledger | 1 | T2-29 | RPL (product-owned), INC, OBL rule library |
| MA16 | Conduct Rule timers from HR outcomes | 2 | T2-29 (SUP 15.11 route once logged) · Hook H-34 | The route is structured once the event is logged; the HR outcome feed is outside the substrate |
| MA17 | No accountable SMF / compromised owner set | 1 | T2-16 | SMCR SoR and MRM × CG objects |
| MA18 | Obligations with no control, metric or evidence | 1 | T2-18 | OBL mapping fields × CTL, KRI |
| MA19 | Remediation backlog clearance date | 1 | T2-36 | ISS and AUD series; least-squares projection |
| MA20 | Audit findings ageing without reaching the board | 1 | T2-36 | AUD × PKM manifest |
| MA21 | Qualifying items filtered out of the BRC pack | 1 | T2-35 | FCL routing rules × PKM manifest and override log |
| MA22 | Emerging risks mapped to principal risks | 1 | T2-13 | Structured emerging-risk entries × CG |
| MA23 | Upcoming obligations with no owner, control or readiness | 1 | T2-31 | OBL in_force_date and status × CG |
| MA24 | 18 March 2027 shadow classification | 1 | T2-31 | INC, third-party register fields, OBL versioned |
| MA25 | Agent payments inside mandate (UK framing) | 3 | Hook H-35 | Agent mandate stores barely exist; outside the substrate |
| MA26 | Agent mandate perimeter (US-stance variant) | 3 | Hook H-36 | As MA25; geography variant kept separate |
| MA27 | Agent and API session SCA-bypass KRI | 1 | T1-9.6 (KRI row only; not carded) | A structured KRI if the bank holds it. GM says it "barely beats a dashboard". `[agentic -- second module]` |
| MA28 | Receiving-side APP exposure against appetite | 1 | T2-10 | KRI reimbursement and mule-detection series |
| MA29 | Impact-tolerance headroom per important business service | 1 | T2-9 | INC durations, tolerance register, vulnerability counts |
| MA30 | Lending migrating to high climate-risk collateral | 1 | T2-11 | KRI new-lending mix by EPC and flood band |
| MA31 | Climate targets off track | 1 | T2-11 | KRI pathway series × DEC |
| MA32 | Internal read-across | 1 | T2-32 | RAL × CTL design_type and feed_id |
| MA33 | Self-identification ratio | 1 | T2-40 | ISS source tags |
| MA34 | Building society nature and funding limits | 1 | T2-8 | CAP balance sheet and funding ratios |
| MA35 | Headline scorecard with promotion lane | 1 | T2-12 | RAS headline_flag × KRI status and velocity |
| MA36 | Consumer Duty outcomes outside tolerance, by cohort | 1 | T2-42 | CDO structured MI with cohort_n |
| MA37 | Inactive fee-payers | 1 | T2-45 | CDO price-and-value measures |
| MB1 | Persistent ambers the forum never discussed | 2 | T2-34 · Hook H-1 | Partial: persistent amber with no logged action, decision or escalation. Minutes are Tier 3 |
| MB2 | Actions disappeared or reworded between forums | 2 | T2-38 · Hook H-2 | Partial: actions cancelled, reassigned or re-dated in the log without closure evidence. Rewording in minutes is Tier 3 |
| MB3 | Different committees shown a different number or story | 2 | T2-22 · Hook H-3 | Partial: value, version or as-of mismatch across pack manifests and the system of record. The circulated story is Tier 3 |
| MB4 | Trade-off colliding; "trade-off" that is a floor | 2 | T2-6 · Hook H-4 | Partial: the pair outside bounds keyed in the tension register; floor check on structured flags. What the board minuted is Tier 3 |
| MB5 | Attesting to evidence or rubber-stamping | 2 | T2-17 · Hook H-5 | Partial: timestamp order, superseded result, attested while out of tolerance, segregation of duties. Commentary text is Tier 3 |
| MB6 | When we first held information that "reasonably suggests" | 2 | T2-30 · Hook H-6 | Partial: the earliest structured signal (issue, test fail, KRI breach, incident detected) predates the logged awareness date. Escalation notes are Tier 3 |
| MB7 | SMF reasonable-steps evidence | 2 | T2-41 · Hook H-7 | Partial: structured steps (action assigned, escalation logged, closure evidence, attestation). Challenge in minutes is Tier 3 |
| MB8 | Resourcing strain escalated on the record | 2 | T2-5 (sub-trigger) · Hook H-8 | Partial: capacity past amber with no resourcing action or decision ID. The SMF's paper trail is Tier 3 |
| MB9 | Bad-news travel time | 2 | T2-37 · Hook H-9 | Partial: escalation latency from the action log (raised date to first BRC escalation or pack entry). The first narrative flag is Tier 3 |
| MB10 | Staff raising the problem before the metric | 3 | Hook H-10 | Needs speak-up text or escalation notes; no structured partial worth building |
| MB11 | Second-line challenge overruled before a breach | 2 | T2-39 · Hook H-11 | Partial: an L2-raised issue closed or risk-accepted by L1, then a breach on the linked metric. Challenge text is Tier 3 |
| MB12 | Did the board challenge the reds? | 3 | Hook H-12 | Board challenge quality exists only in minutes. The structured "no decision ID" signal is already in T2-34 |
| MB13 | Technology change broke a journey (complaints after change) | 2 | T2-44 · Hook H-13 | Partial: step change in coded complaint counts on a journey after a deployment. Narrative themes are Tier 3 |
| MB14 | Complaints cluster on journeys nobody owns | 2 | T2-44 · Hook H-14 | Partial: coded complaints by journey × no horizontal owner. Narrative handoff evidence is Tier 3 |
| MB15 | Declared versus actual change impact | 2 | T2-19 (sub-trigger) · Hook H-15 | Partial: post-change step change against the structured expected-effect field. The narrative rationale is Tier 3 |
| MB16 | Deployed value matches the approved value | 2 | T2-19 (sub-trigger) · Hook H-16 | Partial: approved_value against new_value in the change log. The committee minute is Tier 3 |
| MB17 | Final Notice read-across actually tested the population | 2 | T2-33 · Hook H-17 | Partial: read-across closed "no similar issue" with no test on matched controls afterwards. The memo and minutes are Tier 3 |
| MB18 | Risks discussed but not on the register, and the reverse | 3 | Hook H-18 | Narrative-first by definition |
| MB19 | Consumer Duty board report survives the evidence | 2 | T2-43 · Hook H-19 | Partial: evidence position per outcome before drafting. Reading the report's assertions is Tier 3 |
| MB20 | Told a committee a control was effective when tests said otherwise | 2 | T2-23 · Hook H-20 | Partial: register rating "effective" against a failed latest test. The paper's claim is Tier 3 |
| MB21 | Actions closed while the metric has not moved | 2 | T2-38 · Hook H-21 | Partial: closed action × linked metric still outside band after recovery time. The closure narrative is Tier 3 |
| MB22 | Publishing a figure with an unresolved challenge | 2 | T2-26 · Hook H-22 | Partial: a disclosure figure with an open linked issue, a restatement or "unverified" integrity. Challenge text is Tier 3 |
| MB23 | MI about lifting the restriction, not obeying it | 3 | Hook H-23 | Narrative balance only; T2-27 already carries the test |
| MB24 | Service teams working around a restriction | 2 | T2-27 (override lane) · Hook H-24 | Partial: breaches routed "manual" in the population test. Service notes are Tier 3 |
| MB25 | Supervisory attestation against the population test | 2 | T2-28 · Hook H-25 | Partial: attestation due while the test shows breaches or untested population. The statement text is Tier 3 |
| MB26 | Appetite waiver conditions met | 2 | T2-7 · Hook H-26 | Partial: structured conditions and expiry in the decision register. Conditions held only in minutes are Tier 3 |
| MB27 | Speak-up themes against override behaviour | 3 | Hook H-27 | Speak-up text; outside the substrate |
| MB28 | Zero whistleblowing in a high-growth unit | 3 | Hook H-28 | Speak-up counts are outside the substrate; data-protection limits |
| MB29 | High-risk acceptances re-reviewed on adverse information | 3 | Hook H-29 | Adverse information arrives as narrative or external data |
| MB30 | Customers say an agent acted outside authority | 3 | Hook H-30 | Complaint narratives plus agent data; `[agentic -- second module]` |
| MB31 | Fair value assessment that is only a benchmark | 3 | Hook H-31 | The assessment's reasoning is narrative |
| MB32 | Challenge thinnest where profit is highest | 3 | Hook H-32 | Challenge density needs challenge text |
| MB33 | Vulnerability recording useful and lawful | 3 | Hook H-33 | Needs a DPIA first; vulnerability narrative |

**Check:** 34 + 23 + 13 = 70. Every MA and MB ID appears exactly once in the table above.

---
## 3. Tier 1 -- descriptive question taxonomy

Tier 1 holds the self-serve descriptive cuts. Today the CRO assembles them by hand or through an analyst round-trip. They are table-stakes, but each one is still stated in UK board-risk terms and tied to the substrate fields it needs. Every answer shows a denominator, an as-of date and the chain-integrity badge. A figure on a feed that fails integrity reads "unverified".

Default comparison: quarter on quarter. Slices: principal risk × Level (1/2/3) × legal entity × business line or product × customer journey × owner (SMF, risk, control) × time. "Level 1/2/3", the default of 12 headlines and the routing rules are labelled `[practice-not-rule]` wherever they appear.

### T1-1 Strategy, appetite and headroom

| ID | Sub-heading | Question | Substrate fields |
|---|---|---|---|
| T1-1.1 | Strategy strip | For each strategic objective in the plan, what share of the linked appetite is consumed, against the same quarter last year? | CG objective→RAS links; RAS red and capacity; KRI value |
| T1-1.2 | Strategy strip | Which plan initiatives draw on which RAS statements, and what volume does each assume? | CAP plan volumes by initiative; CG links |
| T1-1.3 | RAS scorecard | What is the status of each of the 12 headline Level 1 metrics against capacity, red, amber and operating limit, with the quarter-on-quarter delta? | RAS headline_flag, thresholds; KRI value, as_of |
| T1-1.4 | RAS scorecard | How many Level 1 metrics in the full schedule are amber or red, and for how many consecutive periods? | RAS schedule; KRI status history |
| T1-1.5 | Headroom | What is headroom (appetite set minus actual) per principal risk, in the metric's own unit and with its denominator? | RAS red; KRI value, numerator, denominator |
| T1-1.6 | Headroom | What does the planned volume imply for headroom at the end of the plan year, shown as a range? | CAP plan volumes; KRI series; CAL |
| T1-1.7 | Thresholds | What is the threshold cascade (capacity → red → amber → operating limit) for a metric, and what calibration rationale was approved, when and by whom? | CAL; RAS approval_date |
| T1-1.8 | Waivers | Which temporary limits or appetite waivers are in force, with what conditions and expiry? | DEC; RAS temporary_limit, temp_expiry |
| T1-1.9 | Tensions | Which guardrail pairs has the board agreed, with bounds, owner and review date? | TEN |

### T1-2 Principal risk positions across the nine domains

| ID | Domain | Question | Substrate fields |
|---|---|---|---|
| T1-2.1 | Credit | What are 3m+ arrears, cost of risk and the high-LTV share of new lending against appetite, by product and region? | KRI arrears, impairment, new-lending LTV mix; RAS |
| T1-2.2 | Credit | What share of new mortgage lending is at a loan-to-income ratio of 4.5 or more, against the firm's internal limit? `[verify the FPC flow-limit reference before use]` | KRI new-lending LTI mix; RAS |
| T1-2.3 | Credit | What is the concentration of the book by sector, segment and broker channel against limits? | KRI concentration series; RAS |
| T1-2.4 | Market | What is the banking-book interest rate risk (EVE and NII sensitivities) against appetite? | KRI IRRBB outputs; RAS |
| T1-2.5 | Capital | What are CET1, total capital and leverage against the internal limit, the regulatory minimum plus buffers, and the ICAAP stressed low point? | CAP; RAS |
| T1-2.6 | Liquidity | What are LCR (spot and 12-month average) and NSFR against internal limits, and how many days does the ILAAP survival horizon give? | CAP; KRI; RAS |
| T1-2.7 | Funding (societies) | How close are the nature limit (75%) and the funding limit (50%) under the Building Societies Act 1986, against internal buffers? | CAP balance sheet and funding mix; RAS |
| T1-2.8 | Conduct | Which conduct metrics (complaint uphold rate, FOS overturn rate, redress) sit outside appetite, by product? | CMP counts and outcomes; KRI; RAS |
| T1-2.9 | Climate (PRA prudential) | What share of new lending and stock sits in high physical-risk or low-EPC bands, against the board's limit? Framed under SS3/19 as prudential risk, not ESG | KRI collateral mix by flood and EPC band; RAS |
| T1-2.10 | Financial crime | What are CDD refresh backlog, alert queue median age, SAR volumes and screening coverage against appetite? | KRI; REC; RAS |
| T1-2.11 | Financial crime | What is APP scam reimbursement exposure, as sending and as receiving firm, against appetite? | KRI reimbursement and mule series; RAS |
| T1-2.12 | Operational resilience | For each important business service, what is the worst disruption this year against its impact tolerance? | INC duration; tolerance register; RAS |
| T1-2.13 | Cyber | How many critical vulnerabilities on important-service paths are past their SLA, and what is mean time to patch? | KRI vulnerability register aggregates |
| T1-2.14 | Regulatory | How many regulatory actions, s166 milestones and attestations are due, overdue or complete? | ISS action_type = regulatory; RST; OBL |

### T1-3 Chain integrity (can I defend this figure?)

| ID | Sub-heading | Question | Substrate fields |
|---|---|---|---|
| T1-3.1 | Badge | For each headline metric, which of the four checks pass: owner · feed · attestation · mapping? | CG; SMCR; REC; ATT; OBL |
| T1-3.2 | Feed | For each feed behind a board metric, what were the source count, target count and value at the last run, and when was that? | REC |
| T1-3.3 | Feed | Which cohorts (same-day accounts, migrated product codes, partner channels) are under-reconciled? | REC cohort breakdown |
| T1-3.4 | Feed | How large and how old is the rejected-record backlog for each feed? | REC rejected_backlog, rejected_age |
| T1-3.5 | Attestation | Which metrics were attested this cycle, by whom, and against which reconciliation run? | ATT attested_result_id, timestamp |
| T1-3.6 | Mapping | Which RAS statements, policies and obligations have no linked control, metric or evidence? | OBL; CG |
| T1-3.7 | Mapping | Which zero-tolerance statements have no measurable proxy metric? | RAS zero_tolerance; CG |
| T1-3.8 | Change | Which changes to controls, rules or model parameters were deployed this quarter, and with what approval and re-test record? | CHG; CTL |
| T1-3.9 | Controls | What is the latest operating rating and test result for each control linked to a Level 1 metric? | CTL; CG |
| T1-3.10 | Lineage | What is the full chain for a metric, from objective down to feed and owner? | CG; SMCR; REC; ATT |

### T1-4 Regulatory restrictions and commitments (VREQ / s166)

| ID | Sub-heading | Question | Substrate fields |
|---|---|---|---|
| T1-4.1 | Register | Which VREQs, s166 requirements and supervisory commitments are live, with their clauses, accountable SMF and dates? | RST; SMCR |
| T1-4.2 | Test coverage | For each restriction clause, is there an executable population test, and what share of the in-scope population does it cover? | RST population_in_scope, population_tested |
| T1-4.3 | Result | How many breaches did the last run find, out of how many tested, and by which route (product, channel, migration, manual)? | RST breaches, breach route |
| T1-4.4 | Trend | How many months is it since the last zero-breach month? | RST run history |
| T1-4.5 | Remediation | How far are skilled-person remediation milestones complete against plan dates? | ISS action_type = s166; RST |
| T1-4.6 | Attestation | Which attestations to the supervisor are due, and when? | RST attestation_due; ATT |

### T1-5 Reportability and notifications

| ID | Sub-heading | Question | Substrate fields |
|---|---|---|---|
| T1-5.1 | Ledger | Which logged events are open on the reportability ledger, with each child route (SUP 15.3, FR7, SUP 15.11, SAR question open, OFSI, ICO) and its status? | RPL; INC |
| T1-5.2 | Decisions | Who decided each route, when, with what rationale code, and was dissent recorded? | RPL decider, timestamp, dissent_flag |
| T1-5.3 | Timeliness | What are the days from logged awareness to decision, and from decision to notification, per event this year? | RPL |
| T1-5.4 | Re-evaluation | Which "not reportable" decisions are due for re-evaluation? | RPL re-evaluation date |
| T1-5.5 | Incidents | How many incidents and losses by type, service and root cause occurred this quarter, and what was their gross loss? | INC |
| T1-5.6 | Readiness | Which incidents and third parties have been shadow-classified against the 18 March 2027 regime (FCA PS26/2, PRA PS7/26)? `[verify]` | INC; OBL versioned rules; third-party register fields |
| T1-5.7 | Precedent | Which recent UK Final Notices share a failure shape with our control types? | PRC failure-shape code × CTL design_type |

### T1-6 SMCR accountability

| ID | Sub-heading | Question | Substrate fields |
|---|---|---|---|
| T1-6.1 | MRM | Which SMF holds each principal risk, prescribed responsibility and headline metric? | SMCR; CG |
| T1-6.2 | Gaps | Which board objects (risk, metric, policy, VREQ) have no accountable SMF, or only an interim one? | SMCR interim flag; CG |
| T1-6.3 | Concentration | How many board objects and prescribed responsibilities does each SMF hold? | SMCR; CG |
| T1-6.4 | Independence | Where does the same person own a metric and also audit or validate it? | SMCR; CG; ATT; MOD validator |
| T1-6.5 | Breaches by area | How many reds and breaches fell in each SMF's area this half-year? | SMCR × KRI status × RST |
| T1-6.6 | Versioning | What changed in the MRM since the last BRC, and are the mappings current with SMCR Phase 1 (April 2026)? | SMCR version, effective_from |

### T1-7 Escalation, remediation and governance health

| ID | Sub-heading | Question | Substrate fields |
|---|---|---|---|
| T1-7.1 | Exception feed | Which Level 1 reds and ambers, persistent Level 2 ambers and items past SLA qualify for the BRC this cycle under our routing rules? | FCL; KRI status history; ISS |
| T1-7.2 | Pack | Which qualifying items were included, overridden or removed, by whom and with what reason? | PKM |
| T1-7.3 | Actions | How many actions are open, overdue and re-dated, by rating and owner? | ISS due_date_history, status |
| T1-7.4 | Audit | How many audit findings are open and overdue by rating, how many were extended and how many are repeats? | AUD |
| T1-7.5 | Latency | What is the median time from an issue being raised to its first BRC escalation, by severity? | ISS raised_date, escalation_date; PKM |
| T1-7.6 | Self-identification | What share of high-severity issues did the first and second lines find, against audit, the regulator or an external review? | ISS source |
| T1-7.7 | Effectiveness | How many actions closed this quarter have a linked metric that is back inside its band? | ISS closure × CG action-to-metric × KRI |
| T1-7.8 | Risk acceptances | Which risk acceptances are live, with what expiry and approver? | ISS risk_acceptance_id; DEC |
| T1-7.9 | Read-across | Which read-across reviews are open or closed, and what did they test? | RAL; CTL tests |

### T1-8 Consumer Duty and customer outcomes (PRIN 2A)

| ID | Sub-heading | Question | Substrate fields |
|---|---|---|---|
| T1-8.1 | Outcomes | Where does each of the four outcomes (products and services; price and value; consumer understanding; consumer support) sit against tolerance, by journey? | CDO |
| T1-8.2 | Cohorts | How do outcomes differ for customers with characteristics of vulnerability, at cohort level and above the minimum cohort size? | CDO cohort, cohort_n |
| T1-8.3 | Completeness | Does each outcome measure carry a threshold, owner, action, due date and success measure? | CDO fields |
| T1-8.4 | Complaints | What are complaint volumes, uphold rates and FOS outcomes by journey and root-cause code? | CMP |
| T1-8.5 | Value | How many customers pay fees on inactive or no-value products, and what is the revenue? | CDO price-and-value measures |
| T1-8.6 | Remediation | Which Consumer Duty remediation actions are late? | ISS linked to CDO outcome |
| T1-8.7 | Journeys | Which journeys have no single horizontal owner? | CG journey owner; SMCR |

### T1-9 Emerging risk, horizon and second-module watch

| ID | Sub-heading | Question | Substrate fields |
|---|---|---|---|
| T1-9.1 | Overlay | Which emerging risks map onto which principal risks, with what time to crystallise? | Structured emerging-risk register × CG |
| T1-9.2 | Overlay | Which emerging risks within horizon have no linked metric? | Emerging-risk register × CG |
| T1-9.3 | Regulatory horizon | Which upcoming obligations (for example PRA CP14/26, consultation closing 22 January 2027) have an owner, control and readiness evidence, and is each consultation or final? | OBL status, in_force_date; CG |
| T1-9.4 | Models | Which models are overdue for validation, and which financial crime models changed parameters this quarter (SS1/23 where applicable)? | MOD; CHG |
| T1-9.5 | Climate pathway | Which climate targets are on or off pathway? | KRI pathway series |
| T1-9.6 | Agentic (second module) | If the bank tags them, how many third-party agent or API sessions acted on accounts without step-up authentication, per 10,000 sessions? `[agentic -- second module]`; a KRI row only, never a demo beat (MA27) | KRI session aggregates, where held |

**Tier 1 count:** 9 + 14 + 10 + 6 + 7 + 6 + 9 + 7 + 6 = **74 questions**.

---
## 4. Tier 2 -- proactive insight-card catalogue (the centrepiece)

### 4.0 How to read a card
- **Card rule:** a unit becomes a card only if it carries an action, an owner and its chain. A unit with no action is cut (see 4.8, Cut log).
- **Card ID:** each card carries a `T2-n` ID, a business-question title and a differentiation tag:
  - **TABLE-STAKES:** a competent GRC tool or pack could show it;
  - **DIFFERENTIATING:** it needs the product-owned cascade graph, calibration, decision log or integrity checks;
  - **WOW:** it surfaces an enforcement-shaped failure that firms find only after the event.
- **Card status:** every card's status obeys "integrity overrides status". If its own inputs fail the feed or attestation check, the card shows "unverified".
- **Action labels:** "prepare" and "propose" only. The AI never decides reportability, never files or notifies, and never re-tunes a threshold or model.
- **Precedents:** real, public UK Final Notices, posture-tagged. Engine conflicts on dates and figures (C20) are carried as stated.
- **Partial cards:** Group 2 cards carry a **"Can tell / cannot tell"** line and a `[TIER-3 hook → MBx]`.

The cards are grouped into five families:
- A. Strategy, headroom and positions (T2-1 to T2-13);
- B. Chain integrity and defensibility (T2-14 to T2-26);
- C. Restrictions and reportability (T2-27 to T2-33);
- D. Escalation health: "is bad news reaching me?" (T2-34 to T2-41);
- E. Consumer Duty and customer outcomes (T2-42 to T2-45).

---

### 4.1 Family A -- Strategy, headroom and positions

#### T2-1 How much appetite is the plan using, and when does a constraint bind? · DIFFERENTIATING · 24x7 (beat 1)
- **So what:** the board sees how much risk capacity it is spending to grow, and when growth will hit a threshold.
- **Unit type:** position (headroom and trajectory).
- **Signal and trigger:**
  - utilisation is computed per RAS statement against the plan's volumes;
  - fires when the least-squares projection crosses amber inside the plan horizon (S3), or red inside the plan horizon (S2);
  - fires when a capital or liquidity constraint (CET1, leverage, LCR, NSFR) becomes the binding constraint on the plan (S2).
- **Dimensions watched:** strategic objective × RAS statement × principal risk × product × quarter.
- **Action it prompts:** propose one of three for the BRC: re-phase the initiative; recommend an appetite change with rationale; or confirm deliberate use of headroom. A draft BRC paragraph is prepared for the CRO to accept.
- **Severity and escalation:** S3 → ERC; S2 → BRC agenda item "appetite recommendation", with CFO sign-off on the capital figures.
- **Audience:** CRO (primary); board and BRC chair; CEO; CFO.
- **Substrate fields:** RAS (red, capacity, operating_limit); KRI (value, numerator, denominator); CAP (plan volumes by initiative; CET1, leverage, LCR, NSFR; ICAAP stressed low point); CG objective→RAS links; CAL.
- **Illustrative readout:** "High-LTV (over 90%) share of new lending 17.6% against appetite 20%: headroom 2.4 points, about £96m of a £4.0bn new-lending plan `[illustrative]`. Early-warning projection: amber in Q2 2027 at plan volumes. Binding constraint: high-LTV appetite, not capital."
- **[AI-architect note]:**
  - Deterministic: projection is rule-based least squares over a declared window, labelled "early warning, not a prediction".
  - False-positive risk: plan volumes revised mid-year. Re-run on every plan version and show the version used.
  - Trustworthiness: show headroom as both £ and range (C11 unresolved; see P4). Never show headroom without a denominator (hard fail).
- **[Compliance flag]:** none at insight level. Any "appetite increase" recommendation is a board decision, never auto-applied.
- **Sources:** MA1 (UC-GP-A1, UC-OP-A1). Anchors: FSB RAF (18 November 2013), appetite as accelerator and defence.

#### T2-2 Are we leaving deliberate growth unused? · DIFFERENTIATING
- **So what:** the only card that asks the board to consider taking *more* risk. This is the purest "strategic lever" reading of headroom.
- **Unit type:** position (utilisation floor).
- **Signal and trigger:** utilisation of a growth-linked RAS statement sits below a board-set floor (for example under 50% of appetite) for 2 or more quarters, while the plan's target for that objective is behind.
- **Dimensions watched:** objective × RAS statement × product × quarter.
- **Action it prompts:** propose a BRC discussion: re-deploy headroom, lower appetite to match intent, or note the reason (for example, deliberate caution).
- **Severity and escalation:** S4 → ERC summary; S3 if the plan shortfall is material → BRC.
- **Audience:** CRO; CEO; board.
- **Substrate fields:** RAS; KRI; CAP plan targets and actuals; CG.
- **Illustrative readout:** "First-time-buyer lending appetite 31% used for 3 quarters; plan volume 72% of target (£1.44bn of £2.0bn) `[illustrative]`."
- **[AI-architect note]:** low false-positive risk. The floor is firm-set and labelled `[practice-not-rule]`. Never frame unused appetite as a target to hit.
- **[Compliance flag]:** never pair with financial crime or conduct floors. Unused *financial crime* appetite is not a lever (ethics position; NatWest shape).
- **Sources:** MA2 (UC-GP-A1 sub-signal).

#### T2-3 Which plan initiatives consume appetite with no RAS link? · DIFFERENTIATING
- **So what:** a chain break at the top of the spine. An initiative is spending capacity that no appetite statement governs.
- **Unit type:** chain break (cascade mapping).
- **Signal and trigger:** a plan initiative with a volume or revenue line has no CG link to a RAS statement, or no financial crime or conduct metric where its product type requires one.
- **Dimensions watched:** initiative × product type × RAS statement × principal risk.
- **Action it prompts:** propose the missing RAS link and metric to the CRO and CFO. The item stays "unmapped" on the strategy strip until it is resolved.
- **Severity and escalation:** S2 if the initiative launches within one quarter; otherwise S3 → ERC.
- **Audience:** CRO; CFO; initiative owner.
- **Substrate fields:** CAP plan initiatives; CG; OBL product-type obligations.
- **Illustrative readout:** "Business current account launch (Q1 2027 plan: 18,000 accounts) has no RAS line and no financial crime metric `[illustrative]`."
- **[AI-architect note]:** deterministic. Quality depends on plan initiatives carrying a product-type code. Keep the CFO and CRO dual-ownership of the mapping explicit (Stage 2 flag).
- **[Compliance flag]:** none.
- **Sources:** MA3 (UC-OP-A1 sub-check).

#### T2-4 What will cross amber before the next forum, given remediation lead time? · DIFFERENTIATING
- **So what:** the CRO hears about a threshold before it is crossed, early enough to act before the committee meets.
- **Unit type:** position → breach (velocity).
- **Signal and trigger:** the projected crossing date of amber or red falls before the next scheduled forum plus the metric's declared remediation lead time. Rule-based "fast" and "slow" windows apply (GM's hare and tortoise windows, `[practice-not-rule]`).
- **Dimensions watched:** metric × Level × forum calendar × lead time.
- **Action it prompts:** propose a pre-emptive owner action and an early ERC flag. A draft note to the first-line owner is prepared.
- **Severity and escalation:** Level 1 → S2 to the BRC chair's early-warning line; Level 2 → S3 to ERC.
- **Audience:** CRO; first-line owner; CFO and ALCO for liquidity; BRC chair for Level 1.
- **Substrate fields:** KRI series; CAL (lead time, volatility); RAS thresholds; FCL forum dates.
- **Illustrative readout:** "LCR 12-month average 162% against amber 150%; projected amber 9 weeks out; BRC in 7 weeks; ALCO lead time 6 weeks: act now `[illustrative]`."
- **[AI-architect note]:**
  - Detectability: high.
  - False-positive risk: volatile series. Mitigate with a minimum-history rule and a two-window agreement before firing.
  - Label: "early warning, not a prediction".
  - The Level 3 → Level 1 roll-up rule is open (G-04). This card uses each metric's declared rule only.
- **[Compliance flag]:** none.
- **Sources:** MA4 (UC-GM-A1).

#### T2-5 Is growth outrunning financial crime control capacity? · WOW · 24x7 (beat 1)
- **So what:** the Starling and Monzo shape. Customers grow faster than the people and systems that keep them safe, and nobody puts both on one time axis.
- **Unit type:** position (capacity headroom) → tension.
- **Signal and trigger:**
  - the customer, onboarding or alert growth rate exceeds the qualified capacity growth rate, so customers per qualified handler, alert queue median age, or CDD refresh backlog projects past amber within the plan horizon (S2);
  - queue age is already past amber (S1 if it is a Level 1 financial crime metric);
  - **sub-trigger (MB8 partial):** capacity is past amber with no resourcing action in the issue log and no decision ID in the decision register within one cycle;
  - **sub-trigger (GM):** a growth-enabling appetite change is approved with no recorded capacity check.
- **Dimensions watched:** business line × channel × capacity unit × quarter, against the plan's campaign calendar.
- **Action it prompts:** propose one of two for CEO and board decision: restore capacity (with a resourcing paper drafted for SMF17), or pace growth (re-phase the campaign). **Lowering the control standard is never offered**, because a floor is not tradeable.
- **Severity and escalation:** S2 → ERC and BRC; S1 → CRO and SMF17 the same day, with the BRC chair informed.
- **Audience:** CRO; CEO and ExCo; SMF17; COO; board.
- **Substrate fields:** CAP plan volumes; KRI customer counts, alert volumes, queue age, CDD backlog, handler FTE and qualified FTE; ISS (resourcing actions); DEC; RAS.
- **Illustrative readout:** "Customers +58% (1.2m to 1.9m) against financial crime capacity +11% (64 to 71 qualified handlers); customers per handler 18,750 to 26,760; alert queue median age 19 days against amber 14 since August; next campaign in 6 weeks; no resourcing decision recorded `[illustrative]`."
- **[AI-architect note]:**
  - Detectability: high. It is a cross-system ratio on structured counts.
  - False-positive risk: automation gains distort FTE ratios. Show two capacity units side by side (qualified FTE, and alerts cleared within SLA) until P5 is decided.
  - Trustworthiness: always show both numerator and denominator.
- **[Compliance flag]:** financial crime is a regulatory floor. The card must never present a cost or ROI trade-off. The ratio is an insight; any decision to pace growth or add resource is a board and CEO action.
- **[TIER-3 hook → MB8]:** whether the SMF escalated the strain on the record, and whether the board decided, lives in minutes and papers (H-8).
- **Can tell / cannot tell (MB8 sub-trigger):** it can tell that no resourcing action or decision is logged. It cannot tell whether the SMF raised the strain orally or in a paper.
- **Sources:** MA12 (UC-GP-A5, UC-OP-A5, UC-GM-A6); MB8 partial (UC-GM-B8). Anchors: FCA Final Notices on Starling (customers about 43,000 in 2017 to 3.6m in 2023) and Monzo (about 600,000 in 2018 to over 5.8m in 2022); FCA challenger bank review (22 April 2022). Throttle precedent: Nottingham reduced new mortgage lending from £1.2bn to £0.9bn (GM).

#### T2-6 Is a board-agreed trade-off colliding, and is any "trade-off" actually a regulatory floor? · WOW · 24x7 (beat 1)
- **So what:** turns "risk as a strategic lever" into a governed object. The board sees when a trade-off it agreed has gone beyond its terms, and the product refuses to treat a legal floor as tradeable.
- **Unit type:** tension collision.
- **Signal and trigger:**
  - one partner metric of a guardrail pair improves while the other deteriorates beyond the bounds keyed in the tension register (S2);
  - the review date passes with no new decision ID (S2);
  - **floor check:** a pair whose guardrail carries a floor flag (VREQ breach count, pre-CDD transacting, sanctions coverage) is rejected as a tension and routed as a breach to T2-27 or T2-14 (S1).
- **Dimensions watched:** guardrail pair × bound × review date × product.
- **Action it prompts:** propose a BRC re-decision on the trade-off (re-set the bounds, restore the guardrail, or end the trade-off). A decision paper is drafted from the register fields. Floor items route to the breach path.
- **Severity and escalation:** S2 → BRC agenda; S1 (floor) → CRO and accountable SMF the same day.
- **Audience:** CRO; board and BRC chair; CEO; first-line product owner.
- **Substrate fields:** TEN (pair, bounds, floor flag, owner, review date, decision reference ID); KRI series for both partners; RAS.
- **Illustrative readout:** "Savings onboarding trade-off: 2 of 3 bounds exceeded (conversion +6.2 points against +5 cap; high-risk acceptance 1.1% against 0.8%); review overdue 27 days; 1 item reclassified as a floor (pre-CDD transacting) `[illustrative]`."
- **[AI-architect note]:**
  - Detectability: high once the pair is in the register.
  - The register is keyed by a named person (CRO office or company secretary) after each board decision. Nothing is extracted from minutes.
  - Hardest part: boards rarely minute quantified bounds. The structured decision-record form creates that habit (OP L2).
  - False-positive risk: low, because bounds are explicit.
- **[Compliance flag]:** floor check is a hard fail. "We deliberately accepted more credit risk" can be legitimate; "we deliberately accepted non-compliance with a VREQ" cannot (G-GP-04). Insight is permissible; any differential customer treatment arising from the trade-off is gated to human and risk review.
- **[TIER-3 hook → MB4]:** verifying the bounds against what the board actually minuted, and finding tensions the metrics show but no decision record covers (H-4).
- **Can tell / cannot tell:** it can tell that a registered pair has moved outside its keyed bounds or passed its review date, and that a "tradeable" item is a floor. It cannot tell whether the board discussed the trade-off informally, or whether the keyed bounds match the minute.
- **Sources:** MB4 partial (UC-GP-B4, UC-OP-B5, UC-GM-B4). Anchors: FCA on Monzo, "rapid customer growth must not come at the detriment of compliance". White-space claim CF-25 is unresolved: Protecht is credible in the UK mid-tier.

#### T2-7 Are the conditions on an appetite waiver being met? · DIFFERENTIATING
- **So what:** a temporary limit the board granted on conditions is still in force after its conditions failed or its expiry passed.
- **Unit type:** breach (waiver condition).
- **Signal and trigger:**
  - a structured condition (metric and bound) in the decision register is breached (S2);
  - the expiry passed with the temporary limit still in the RAS register (S2);
  - a condition is at risk on its trajectory (S3).
- **Dimensions watched:** waiver × condition × metric × month.
- **Action it prompts:** propose renewal or restoration of the original limit for board decision. A board decision paper is drafted.
- **Severity and escalation:** S2 → BRC, then board.
- **Audience:** CRO; board; first-line owner.
- **Substrate fields:** DEC (waiver, conditions as metric and bound, expiry); RAS temporary_limit, temp_expiry; KRI.
- **Illustrative readout:** "High-LTV limit raised from 20% to 25% for 6 months from April 2026, conditional on 100% automated income verification; coverage 88% (4,180 of 4,750 loans); limit still 25% in the register 3 weeks after expiry `[illustrative]`."
- **[AI-architect note]:** deterministic where conditions are keyed as structured fields. Waivers are often informal; the card can only govern what is registered. Show the count of waivers that lack structured conditions as a chain break.
- **[Compliance flag]:** none.
- **[TIER-3 hook → MB26]:** conditions that exist only in minute text (H-26).
- **Can tell / cannot tell:** it can tell whether keyed conditions and expiry are met. It cannot tell about conditions the board stated but nobody keyed.
- **Sources:** MB26 partial (UC-GM-B16).

#### T2-8 How close are we to the building society nature and funding limits? · TABLE-STAKES
- **So what:** statutory headroom for the core ICP. It is table-stakes for a society board, but it must sit on the same strip as the growth plan.
- **Unit type:** position (statutory headroom).
- **Signal and trigger:** the nature limit (at least 75% of business assets in loans fully secured on residential property) or the funding limit (at least 50% of funding from members; wholesale capped at 50%) enters the board's internal buffer, or is projected to within the funding plan horizon. `[verify the Act's current definitions, as amended by the Building Societies Act 1986 (Amendment) Act 2024]`
- **Dimensions watched:** entity × month × funding plan version × acquisition pipeline.
- **Action it prompts:** propose an ALCO review of the funding plan. An ALCO note is drafted.
- **Severity and escalation:** S3 → ALCO; S2 if inside the buffer → BRC.
- **Audience:** CRO; CFO and ALCO; board.
- **Substrate fields:** CAP balance sheet by asset class; funding by source; plan; RAS buffers.
- **Illustrative readout:** "Wholesale funding 34% against an internal ceiling of 40% and a statutory cap of 50%; post-integration plan projects 39% in Q3 2027 `[illustrative]`."
- **[AI-architect note]:** standard finance data with low false-positive risk. CFO attests the calculation.
- **[Compliance flag]:** statutory limit. A breach is not a tension (floor).
- **Sources:** MA34 (UC-GM-A14). Society ICP only; hidden for banks.

#### T2-9 How much impact-tolerance headroom do our important business services have? · DIFFERENTIATING
- **So what:** applies headroom mechanics to operational resilience, so the board sees which important services are closest to an intolerable outage.
- **Unit type:** position (headroom against impact tolerance).
- **Signal and trigger:**
  - worst disruption this year exceeds a firm-set share of tolerance (for example 75%) (S3);
  - any breach of tolerance (S1, with a draft reportability case through T2-29);
  - critical vulnerabilities past SLA on the service path (S3);
  - one dependency serves three or more important services (S3).
- **Dimensions watched:** important business service × dependency × month.
- **Action it prompts:** propose remediation priority for the COO and CTO. An ERC note is drafted. A tolerance breach opens a draft ledger entry.
- **Severity and escalation:** S3 → ERC; S1 → CRO and COO the same day; BRC.
- **Audience:** CRO; COO and CTO; board.
- **Substrate fields:** INC (service_id, duration, customers affected); impact-tolerance register; KRI vulnerability aggregates; dependency map fields.
- **Illustrative readout:** "Mortgage payments: worst disruption 4h40m against a 6h tolerance (78% used); 9 critical vulnerabilities past SLA on its path; one hosting provider serves 3 of 5 important services `[illustrative]`."
- **[AI-architect note]:** incident durations are reliable; dependency maps are often incomplete. Show the map's completeness as a denominator. Vulnerability counts without exploitability context over-alert; rank by critical-path only.
- **[Compliance flag]:** a tolerance breach may engage notification routes. The card prepares the case for a named SMF; the current regime is Principle 11 and FR7, with PS26/2 and PS7/26 from 18 March 2027 (C15; `[verify]`).
- **Sources:** MA29 (UC-GP-A16).

#### T2-10 Is receiving-side APP reimbursement exposure moving against financial crime appetite? · DIFFERENTIATING
- **So what:** since 07 October 2024 the receiving firm shares reimbursement cost, so mule detection is now an appetite metric, not only an operations metric.
- **Unit type:** position (harm against appetite).
- **Signal and trigger:** receiving-side reimbursement liability, or inbound APP-linked accounts per 10,000 new accounts, crosses amber or trends towards it (S3), or crosses red (S2).
- **Dimensions watched:** sending and receiving role × product × onboarding channel × account age × month.
- **Action it prompts:** propose a mule-account review and an onboarding control review within SMF17's remit.
- **Severity and escalation:** S3 → ERC; S2 → BRC.
- **Audience:** CRO; SMF17; CFO.
- **Substrate fields:** KRI reimbursement series (as sender and receiver), mule-flag counts, account-age bands; RAS.
- **Illustrative readout:** "Receiving-side reimbursement share £1.9m in Q3, up 46% on Q2 (£1.3m); 61% by value from accounts under 90 days old, opened through one partner channel `[illustrative]`."
- **[AI-architect note]:** reliable structured series. Engine figures for sector reimbursement disagree by period (CF-26); never quote a sector figure without its period.
- **[Compliance flag]:** never a cost lens on financial crime. Channel-level slicing is fine; slicing by nationality or postcode can proxy protected characteristics. Use channel and account-age only.
- **Sources:** MA28 (UC-GP-A15, UC-OP-A18). Anchor: PSR APP reimbursement regime from 07 October 2024 (`[verify]`).

#### T2-11 Is new lending migrating toward high climate-risk collateral, and are climate targets off track? · TABLE-STAKES
- **So what:** keeps climate inside the credit chain as a PRA prudential risk (SS3/19), not ESG.
- **Unit type:** position (exposure-mix trajectory and target pathway).
- **Signal and trigger:**
  - the share of new lending in high flood-risk or low EPC bands rises for 2 quarters towards the board's limit (S3);
  - a board climate target is off its pathway with no decision ID recorded (S3).
- **Dimensions watched:** collateral band × product × region × quarter.
- **Action it prompts:** propose a credit policy review or a BRC note on the pathway.
- **Severity and escalation:** S3 → ERC and BRC.
- **Audience:** CRO; BRC; CFO.
- **Substrate fields:** KRI new-lending mix by EPC and flood band; pathway series; DEC; RAS.
- **Illustrative readout:** "New lending in EPC E–G: 14.2% of completions (1,136 of 8,000), up from 11.0%, against a limit of 15% `[illustrative]`."
- **[AI-architect note]:** data quality on EPC coverage is the main risk. Show the share of loans with no EPC as a denominator gap.
- **[Compliance flag]:** regional slices are permissible for prudential insight. Any differential lending action by geography is gated to human and risk review (geography can proxy protected characteristics).
- **Sources:** MA30 (UC-GP-A18), MA31 (UC-GM-A19). Climate classification (emerging or principal) is unresolved (C17).

#### T2-12 Which non-headline Level 1 metric has moved enough to be promoted to the board view? · TABLE-STAKES
- **So what:** the board can see a short headline set without losing the full RAS schedule. A metric that moves is promoted, with a stated reason.
- **Unit type:** position (promotion lane).
- **Signal and trigger:** a non-headline Level 1 metric goes amber or red, or passes a velocity rule. Proposed only: a headline green for 8 quarters is a candidate to rotate out.
- **Dimensions watched:** principal risk × metric × headline flag × quarter.
- **Action it prompts:** propose promoting the metric to this cycle's board view. A reason line is drafted for the CRO to accept.
- **Severity and escalation:** the promotion itself is S3. The metric's own status sets its escalation.
- **Audience:** CRO; board; BRC chair.
- **Substrate fields:** RAS schedule and headline_flag; KRI status and velocity.
- **Illustrative readout:** "NSFR (not a headline) moved from 10 points above amber to 2 points above amber in one quarter; promoted. Headlines shown: 12 of 34 Level 1 metrics `[illustrative]`."
- **[AI-architect note]:** deterministic. The cap is configurable (default 12) and labelled `[practice-not-rule]`; never hard-coded.
- **[Compliance flag]:** none.
- **Sources:** MA35 (UC-GM-A16).

#### T2-13 Which emerging risks map onto which principal risks, and are any within horizon with no metric? · TABLE-STAKES
- **So what:** a must-show qualifier. The board sees the horizon mapped to its principal risks, and the gaps.
- **Unit type:** position (horizon overlay) with chain break (unmapped).
- **Signal and trigger:**
  - an emerging risk's time to crystallise drops inside the plan horizon (S3);
  - an in-horizon emerging risk has no linked Level 1 or Level 2 metric (chain break, S3).
- **Dimensions watched:** emerging risk × principal risk × horizon band × quarter.
- **Action it prompts:** propose a new metric or owner, or a BRC horizon note.
- **Severity and escalation:** S3 → ERC; BRC quarterly.
- **Audience:** CRO; BRC; board.
- **Substrate fields:** structured emerging-risk register (risk, principal risk link, horizon, velocity, owner); CG.
- **Illustrative readout:** "7 emerging risks; 2 within 12 months; 1 (AI-enabled impersonation fraud) has no linked metric `[illustrative]`."
- **[AI-architect note]:** structured register entries only. Horizon and velocity are owner judgements; show the owner and date.
- **[Compliance flag]:** none.
- **[TIER-3 hook → MB18]:** risks committees discuss that are not on the register (H-18).
- **Sources:** MA22 (UC-GP-A12, UC-OP-A15, UC-GM-A17).

---
### 4.2 Family B -- Chain integrity and defensibility ("can I defend this figure?")

#### T2-14 Can I defend this figure? Feed completeness, with integrity overriding status · WOW · 24x7 (beat 2)
- **So what:** the Metro shape. A board metric reads green because the feed behind it silently drops records. The product refuses to show a status it cannot evidence.
- **Unit type:** chain break (feed) and silent failure.
- **Signal and trigger:** for any feed behind a board metric:
  - the reconciliation shortfall (count or value) exceeds tolerance (S2; S1 on a headline metric within 10 working days of a forum);
  - the shortfall is concentrated in one cohort, such as same-day accounts, a migrated product code or a partner channel (S2);
  - the rejected-record backlog is aged past its SLA (S3);
  - the last reconciliation is stale, beyond its declared frequency (S2).
  Every dependent metric flips from its RAG to **"unverified"**.
- **Dimensions watched:** feed × cohort × board metric (through CG lineage) × run date.
- **Action it prompts:**
  - propose that the figure is withheld or caveated in the pack, with draft caveat text for the CRO to accept;
  - propose a remediation request to the feed owner and COO/CTO;
  - if a financial crime control is affected, open a draft reportability triage entry (T2-29).
- **Severity and escalation:** S2 → CRO and feed owner; ERC. S1 → CRO, SMF17 (if a monitoring feed) and COO the same day; the BRC chair is informed.
- **Audience:** CRO; SMF17; COO and CTO; CFO (for regulatory returns).
- **Substrate fields:** REC (source and target counts and values, cohort breakdown, rejected_backlog, rejected_age, run_ts); CG lineage metric→feed; ATT; KRI.
- **Illustrative readout:** "Unverified: transaction monitoring coverage. Records reconciled 94.0% (2,256,000 of 2,400,000); same-day accounts 0% monitored, all other cohorts 99.97%; last run 26 October 2026 `[illustrative]`."
- **[AI-architect note]:**
  - Detectability: high, from simple count and denominator rules.
  - The build is lineage from board metric to feed, which the product owns in CG.
  - False-positive risk: timing differences between source and target cut-offs. Mitigate with a declared cut-off rule and a tolerance per feed (GP L4 would set zero for structural gaps).
  - Count versus value reconciliation is unresolved (C18). Show both where the source holds value.
  - Badge visibility (always on, or only when failing) is P7.
- **[Compliance flag]:** a monitoring gap may engage SUP 15.3 and FR7 (and POCA considerations for missed suspicion). The card prepares a triage entry; a named SMF decides.
- **Sources:** MA8 (UC-GP-A4, UC-OP-A6, UC-GM-A3). Anchors: FCA Final Notice, Metro (12 November 2024), £16,675,200. Between 06 June 2016 and 17 December 2020 the monitoring system missed 60,483,951 of 1,008,426,668 transactions (about 6%); a timestamp error excluded 166,358 same-day accounts. PRA enforcement against Metro (21 December 2021) on regulatory reporting.

#### T2-15 Has any control gone quiet, and does sanctions screening cover the whole list? · WOW · 24x7 reserve 1
- **So what:** the Starling sanctions shape. Silence from a control is treated as a risk, not as good news.
- **Unit type:** chain break (zero-tolerance proxy) and silent failure.
- **Signal and trigger:**
  - alert count per screened population for a control falls to zero, or below its lower band, for N consecutive periods (S2; S1 for sanctions);
  - the rule coverage ratio (active rule records ÷ reference list entries) is below 1 (S1 for sanctions);
  - screening frequency differs from the approved setting (S2);
  - a step change within 14 days of a change log entry on the control hands off to T2-19.
- **Dimensions watched:** control × alert type × customer segment × channel × week.
- **Action it prompts:** propose a second-line configuration test and a re-screen of the affected population. An investigation note is drafted to SMF17. A reportability triage entry (OFSI, SUP 15.3) is opened in draft through T2-29.
- **Severity and escalation:** sanctions → S1 (CRO and SMF17 the same day); other controls → S2 (ERC; BRC if silence exceeds one reporting cycle).
- **Audience:** CRO; SMF17; CTO; BRC.
- **Substrate fields:** KRI alert counts by type; screened population counts; list sizes and active rule counts; CTL; CHG.
- **Illustrative readout:** "Individual sanctions screening: 0 alerts for 3 weeks against an expected 42 a week; 39 active rule records against 3,088 list entries (1.3% coverage) `[illustrative replay of the Starling figures]`."
- **[AI-architect note]:**
  - The platform consumes counts; it never touches the screening engine.
  - Hardest part: vendor engines that report alerts but not rule counts or screened populations.
  - False-positive risk: medium for small tier 3 books with genuine zero-match weeks. Use rates per screened population and multi-period rules.
  - Uses the v6 ScreeningDenominator component inside the badge.
- **[Compliance flag]:** suspected sanctions breaches must be reported to OFSI "immediately" (SAMLA 2018). Board materiality is disputed (C19, P8). The card always reaches SMF17 at once, and the BRC chair at the CRO's call.
- **Sources:** MA9 (UC-GP-A6, UC-OP-A3, UC-GM-A2). Anchor: FCA Final Notice, Starling (£28,959,426; date CF-17). From 20 July 2017 to 30 January 2023, screening matched 39 of 3,088 designated persons.

#### T2-16 Which board objects have no accountable SMF, or a compromised owner set? · TABLE-STAKES
- **So what:** the Starling "no single person with sufficient authority" shape. Every headline needs a named SMF before the CRO presents it.
- **Unit type:** chain break (owner).
- **Signal and trigger:**
  - a RAS statement, headline metric, policy, VREQ clause or prescribed responsibility has no SMF in the current MRM (S2; S1 for a VREQ);
  - the owner is interim beyond a firm-set period (S3);
  - the same person owns and attests, or owns and validates, the same object: a segregation-of-duties failure (S2);
  - an SMF has left, per the MRM version, and their objects have not been reassigned (S2).
- **Dimensions watched:** board object × SMF × MRM version.
- **Action it prompts:** propose a reassignment for CEO approval and an MRM update for the company secretary. A draft MRM change is prepared.
- **Severity and escalation:** S2 → CEO and BRC chair; S1 → CEO the same day.
- **Audience:** CRO; CEO; BRC chair; SMF16; SMF5.
- **Substrate fields:** SMCR (SoR, MRM, interim flag, version, effective_from); CG; ATT attester; MOD validator.
- **Illustrative readout:** "3 of 214 board objects unowned, including VREQ clause R-03.2; 1 metric owned and attested by the same person `[illustrative]`."
- **[AI-architect note]:** deterministic, with low false-positive risk. MRM mappings are versioned for SMCR Phase 1 (April 2026) and Phase 2 (PRA CP14/26). Vertical versus horizontal ownership is open (C8, P9).
- **[Compliance flag]:** SMCR prescribed responsibilities. A gap is an insight; reassignment is a CEO and board action.
- **Sources:** MA17 (UC-GP-A9, UC-OP-A7, UC-GM-A8).

#### T2-17 Is the owner attesting to evidence, or to nothing? (structured attestation integrity) · WOW · 24x7 (beat 2)
- **So what:** an attestation workflow shows 100% completion. This card shows whether each signature attested a real, passing result.
- **Unit type:** chain break (attestation).
- **Signal and trigger** (all from structured fields):
  - the attestation timestamp precedes the completion of the reconciliation run it references (S2);
  - the attestation references a superseded result, or none (S2);
  - attested "within tolerance" while the referenced run shows a shortfall beyond tolerance (S2; S1 on a headline);
  - attested for 3 or more consecutive cycles while the reconciliation ratio trends down (S3);
  - the attester owns the control whose test is attested: a segregation-of-duties failure (S2).
- **Dimensions watched:** attestation × object × attester × referenced run × cycle.
- **Action it prompts:** propose second-line challenge and re-attestation against the current run. The badge reads "attested without evidence" until it is resolved. A challenge request to the owner is drafted.
- **Severity and escalation:** S2 → second line and owner; ERC. S1 → CRO, with the headline caveated.
- **Audience:** CRO; second line; metric and feed owners; COO and CTO; SMF17.
- **Substrate fields:** ATT (attester, timestamp, attested_result_id, status); REC (run_ts, result); CTL owner; SMCR.
- **Illustrative readout:** "Feed TM-04: attested 'reconciled, no exceptions' for 3 months; ratio fell from 99.9% to 94.0%; month 2 attestation signed 3 hours before the run completed `[illustrative]`."
- **[AI-architect note]:**
  - Detectability: high. Timestamps and result IDs are simple joins inside structured data.
  - False-positive risk: late-running jobs. Allow a declared grace window.
  - Burden risk: OP J-OP-04, "the product dies if it is seen as a burden". Attest a result ID, not a form.
  - Monthly attestation is `[practice-not-rule]` (C5). The default applies to financial crime feeds only (P10).
- **[Compliance flag]:** relevant to SMCR reasonable steps and the Duty of Responsibility (section numbers `[unverified]`). The card is an insight to the owner first, and is not a disciplinary record.
- **[TIER-3 hook → MB5]:** commentary copied across cycles, or text claiming "no unexplained movements" against moving results (H-5).
- **Can tell / cannot tell:** it can tell that the signature referenced no run, a superseded run, a failing run, or a run that had not finished. It cannot tell whether the commentary was copied or said anything meaningful.
- **Sources:** MB5 partial (UC-GP-B9, UC-OP-B4, UC-GM-B5). Anchor: Metro's "Bad Data" rejections ran at about 1,352,665 a month before the July 2019 fix (GM).

#### T2-18 Which obligations and zero-tolerance statements have nothing measuring them? · DIFFERENTIATING
- **So what:** a policy clause or a "no appetite" statement with no control, metric or proxy is a promise nobody can evidence.
- **Unit type:** chain break (mapping; zero tolerance without a proxy).
- **Signal and trigger:**
  - a material policy, regulatory or VREQ obligation has no linked control, metric or evidence (S2 for VREQ clauses; S3 otherwise);
  - a zero-tolerance RAS statement has no proxy metric, such as coverage or completeness (S2);
  - an obligation's source version has changed since the mapping was approved: version drift (S3).
- **Dimensions watched:** obligation × source × clause × control × metric × version.
- **Action it prompts:** propose a mapping, or a proxy metric with an owner. The obligation stays "unmapped" on the badge until it is resolved.
- **Severity and escalation:** S2 → SMF16 and policy owner; ERC. S3 → owner.
- **Audience:** CRO; SMF16; SMF17; policy owners.
- **Substrate fields:** OBL; RAS zero_tolerance flag; CG; CTL; KRI.
- **Illustrative readout:** "VREQ clauses: 14 of 15 mapped to an executable test; zero-tolerance statements: 5 of 7 carry a proxy (reputational harm and market abuse do not) `[illustrative]`."
- **[AI-architect note]:**
  - Mapping effort is the cost. Start with VREQ clauses and zero-tolerance statements.
  - Strictness is disputed (C6): evidence can be a control test, approval or training record, not only a KRI. The card accepts any typed evidence link.
- **[Compliance flag]:** none beyond the obligation itself.
- **Sources:** MA18 (UC-GP-A10, UC-OP-A11, UC-GM-A5); MA10 (UC-OP-A3 generalisation).

#### T2-19 Did a change move a control, or a model parameter, without approval, re-test, or the expected effect? · DIFFERENTIATING
- **So what:** a parameter change can quietly move the bank's effective appetite. The board approved one value; another may be live.
- **Unit type:** chain break (change).
- **Signal and trigger:**
  - a change touching a control or model has no approval record, or no re-test, before deploy (S2);
  - **MB16 partial:** deployed new_value ≠ approved_value in the change log (S2);
  - **MB15 partial:** within a declared window after deploy, the control's output moved beyond the structured expected-effect field (S3);
  - the proposer, approver and validator are not three different people (S2).
- **Dimensions watched:** change × control or model × parameter × deploy date × post-change window.
- **Action it prompts:** propose a re-test and an approval review for the accountable owner. **The product never reverts or re-tunes anything** (SS1/23 governed change; boundary).
- **Severity and escalation:** S2 → control owner, CTO and model risk; S1 if a financial crime control's coverage dropped (to SMF17 and T2-29 triage).
- **Audience:** CRO; CTO and COO; SMF17; model risk committee.
- **Substrate fields:** CHG (approved_value, new_value, approver, approval_date, deploy_date, retest_id, expected effect); CTL; MOD; KRI post-change.
- **Illustrative readout:** "Transaction monitoring threshold TM-R12: approved £7,500; deployed £9,500 on 02 September 2026; alerts down 31% (1,420 to 980 a month) against an expected fall of 5% `[illustrative]`."
- **[AI-architect note]:** deterministic on change metadata. Where change tickets hold no parameter values, the card can test approval and re-test only, and says so. SS1/23 scope (C16): it formally targets firms with internal model approval; others may adopt it.
- **[Compliance flag]:** a coverage drop on a financial crime control may be notifiable; a human decides.
- **[TIER-3 hook → MB15, MB16]:** the narrative rationale ("no loss of coverage"), and the value recorded in committee minutes rather than the change log (H-15, H-16).
- **Can tell / cannot tell:** it can tell that a value differs from the logged approval, or that the effect differs from the logged expectation. It cannot tell what the committee or change request said in prose.
- **Sources:** MA13 (UC-GP-A7, UC-OP-A8, UC-GM-A9); MB15 partial (UC-GP-B11); MB16 partial (UC-OP-B14). Anchor: FCA Final Notice, HSBC (£63.9m, 17 December 2021).

#### T2-20 Which thresholds fail to warn in time? (calibration check) · DIFFERENTIATING
- **So what:** an amber that never fires before red gives false comfort. The second line sees which bands need re-calibrating.
- **Unit type:** chain break (calibration).
- **Signal and trigger:**
  - in the history, the metric went from green straight to red with no amber period (S2);
  - the amber band is narrower than the metric's typical period-on-period volatility (S3);
  - the median warning time (first amber to red) is shorter than the declared remediation lead time (S3);
  - an amber has persisted for 4 or more periods with no breach (amber fatigue: candidate to re-calibrate, S4).
- **Dimensions watched:** metric × Level × band width × volatility × lead time.
- **Action it prompts:** propose a calibration review to the second line and a BRC recommendation. **The product proposes; the owner approves; nothing is re-tuned automatically.**
- **Severity and escalation:** S3 → second line; the BRC receives an annual calibration paper.
- **Audience:** CRO (as second-line designer); BRC; metric owners.
- **Substrate fields:** KRI history; CAL; RAS status history.
- **Illustrative readout:** "4 of 34 Level 1 metrics went green to red with no amber in the last 8 quarters; 6 have amber bands narrower than their volatility `[illustrative]`."
- **[AI-architect note]:** deterministic on history. The roll-up rule is open (G-04). Amber fatigue and early warning pull in opposite directions (C10); never widen a band to stop fatigue alone (method edge case).
- **[Compliance flag]:** none.
- **Sources:** MA5 (UC-GP-A2, UC-OP-A2).

#### T2-21 Which leading indicator moved before its lagging partner? · DIFFERENTIATING
- **So what:** the board hears about a driver before the Level 1 outcome moves.
- **Unit type:** position (leading drift).
- **Signal and trigger:** a leading indicator in a declared leading–lagging pair crosses its band, or turns its trend for 2 periods, while the lagging metric is still green (S3; S2 if the lagging metric is a Level 1 headline).
- **Dimensions watched:** principal risk × pair × period, across the nine domains.
- **Action it prompts:** propose a first-line driver review. A note to the owner is drafted.
- **Severity and escalation:** S3 → owner and ERC; S2 → BRC early-warning line.
- **Audience:** CRO; first-line risk owner; BRC for Level 1.
- **Substrate fields:** CG leading–lagging pairs; KRI series; RAS.
- **Illustrative readout:** "Early arrears (1 month past due) up 22% on the quarter (3,410 to 4,160 of 212,000 accounts) while 3m+ arrears are still green at 0.62% `[illustrative]`."
- **[AI-architect note]:** pairs are declared, not mined. That keeps it explainable. Label "early warning, not a prediction".
- **[Compliance flag]:** none.
- **Sources:** MA6 (UC-GM-A15).

#### T2-22 Is the same metric being shown with a different value to different forums? (structured pack consistency) · DIFFERENTIATING
- **So what:** the Starling "different committees receiving different information" shape. It is caught before the pack circulates.
- **Unit type:** chain break (consistency).
- **Signal and trigger:** for the same metric and as-of period, the value, RAG, definition version or as-of date differs between ERC, BRC and board pack manifests, or between a pack and the system of record (S2). Differences that are more favourable in the higher forum rank first.
- **Dimensions watched:** metric × forum × as-of × version.
- **Action it prompts:** propose a correction before circulation. A reconciliation note is drafted for the paper owner.
- **Severity and escalation:** S2 → CRO and company secretary before the pack is issued.
- **Audience:** CRO; BRC chair; board secretary.
- **Substrate fields:** PKM (structured values placed in each pack); KRI (value, version, as_of, restated_flag); RAS.
- **Illustrative readout:** "Screening coverage: ERC 92% amber (as of 30 September); BRC draft 'over 90%' green (as of 31 August) `[illustrative]`."
- **[AI-architect note]:**
  - Reliable only where packs are built from the product, or from templated structured tables.
  - Free-text figures in papers are out of scope for Tier 2.
  - False-positive risk: legitimate restatements. Show restated_flag.
- **[Compliance flag]:** misleading information to a regulator (SUP 15.6) is engaged only by read-across `[inference]`. The card is internal quality control.
- **[TIER-3 hook → MB3]:** figures and narrative in the prose of circulated papers, such as status softened, denominator dropped or trend omitted (H-3).
- **Can tell / cannot tell:** it can tell that the structured value, RAG or as-of date differs across forums. It cannot tell whether the paper's words soften the story.
- **Sources:** MB3 partial (UC-GP-B17, UC-OP-B2, UC-GM-B3).

#### T2-23 Is any control rated "effective" whose latest test failed? · DIFFERENTIATING
- **So what:** the control register should not carry a better rating than the evidence.
- **Unit type:** chain break (assurance claim).
- **Signal and trigger:** the register operating rating is "effective" while the latest test result is "failed" or "partially effective", or no test has run within the declared frequency (S2 for controls linked to Level 1; S3 otherwise). RCSA self-assessed rating above the latest independent test is also flagged (S3).
- **Dimensions watched:** control × rating × test result × date.
- **Action it prompts:** propose a re-rating for the control owner and second line. Linked metrics show "unverified" until it is resolved.
- **Severity and escalation:** S2 → ERC; BRC chair if a Level 1 control.
- **Audience:** CRO; BRC chair; SMF5; audit committee chair.
- **Substrate fields:** CTL (operating_rating, last_test_date, test_result); RCSA; CG.
- **Illustrative readout:** "2 controls on Level 1 metrics rated effective after a failed test; RCSA rates 11 controls higher than their last independent test `[illustrative]`."
- **[AI-architect note]:** deterministic. Uses the v6 OperationalAssuranceVerdict component.
- **[Compliance flag]:** none.
- **[TIER-3 hook → MB20]:** the claim of effectiveness made in a committee paper's prose (H-20).
- **Can tell / cannot tell:** it can tell that the register and the test disagree. It cannot tell what a committee was told in prose.
- **Sources:** MB20 partial (UC-GM-B12).

#### T2-24 Are AI and ML financial crime models inside the board's model risk appetite? · DIFFERENTIATING
- **So what:** the demo-safe route into the agentic theme. Board oversight of AI-driven controls, under SS1/23 where it applies.
- **Unit type:** position and chain break (model governance).
- **Signal and trigger:**
  - a model's validation is overdue (S3; S2 for a tier 1 model);
  - a performance KRI is outside its band (S3);
  - SAR or alert volumes fall after a model "improvement" without validation (S2; hand-off to T2-19);
  - a model is in use but not in the inventory (S2).
- **Dimensions watched:** model × use × tier × validation status × quarter.
- **Action it prompts:** propose validation or a model risk committee review. A draft note is prepared.
- **Severity and escalation:** S2 → model risk committee and SMF17; BRC summary.
- **Audience:** CRO; model risk committee; SMF17; BRC.
- **Substrate fields:** MOD; CHG; KRI performance and output volumes.
- **Illustrative readout:** "Fraud model v4.2: SAR referrals down 38% (210 to 130 a month) since the 14 August update; validation not yet run `[illustrative]`."
- **[AI-architect note]:** deterministic on the inventory. SS1/23 scope (C16): formal for internal-model firms; adopted by others as practice. Vendor figures are `[marketing-grade]` and never on screen.
- **[Compliance flag]:** none at insight level.
- **Sources:** MA14 (UC-GM-A13). `[agentic -- second module]` (the governance route only).

#### T2-25 Which customer cohorts' activity departs from profile while alerts fall? · DIFFERENTIATING
- **So what:** a silent-failure test on monitoring that does not fire. The NatWest and Nationwide shape (personal accounts behaving like business accounts).
- **Unit type:** silent failure (cohort).
- **Signal and trigger:** in a product or channel cohort, cash deposit or business-like activity per account rises beyond its band while alerts per 10,000 accounts fall or stay flat for 2 periods (S2).
- **Dimensions watched:** product × channel × account type × account age × month. **Not** nationality, ethnicity or postcode.
- **Action it prompts:** propose a scenario-coverage review by SMF17. A count is reported to the board; the detail stays in the SMF17 workspace.
- **Severity and escalation:** S2 → SMF17; BRC count only.
- **Audience:** CRO; SMF17.
- **Substrate fields:** KRI cohort aggregates (cash volumes, transaction profile, alerts); CTL.
- **Illustrative readout:** "Personal current accounts opened through the app in 2025: cash deposits per account +64%, alerts per 10,000 accounts −12% `[illustrative]`."
- **[AI-architect note]:** medium false-positive risk (seasonality and campaigns). Cohort aggregates only, with a minimum cohort size.
- **[Compliance flag]:** **protected-attribute proxying.** Regional or demographic slices can proxy race, nationality or religion. Slices are restricted to product, channel and account attributes. Any differential monitoring of a cohort is gated to SMF17 and risk review, with an equality check.
- **Sources:** MA11 (UC-GP-A17). Anchor: NatWest criminal fine £264.8m (13 December 2021).

#### T2-26 Are we about to publish a figure the chain cannot yet support? · DIFFERENTIATING
- **So what:** the Metro 2022 disclosure shape. A figure going into an external disclosure has an open issue, a restatement or an unverified feed behind it.
- **Unit type:** chain break (disclosure).
- **Signal and trigger:** a metric tagged for an external disclosure (Pillar 3, annual report, regulatory return) has an open linked issue, a restatement in the period, an "unverified" integrity status or an unattested reconciliation, within N days of the publication date (S2).
- **Dimensions watched:** disclosure × figure × linked metric × publication date.
- **Action it prompts:** propose a hold or a caveat review for the CFO and audit committee chair.
- **Severity and escalation:** S2 → CFO and audit committee chair; the CRO is informed.
- **Audience:** CRO; CFO; audit committee chair.
- **Substrate fields:** KRI disclosure tag and restated_flag; ISS linked_metric_id; REC; ATT.
- **Illustrative readout:** "CET1 ratio for the interim results: 1 open issue on the RWA feed (raised 09 October 2026); reconciliation unattested `[illustrative]`."
- **[AI-architect note]:** deterministic. This sits with the CFO more than the CRO; it is shown on the CRO view as a count.
- **[Compliance flag]:** disclosure accuracy obligations. The product never edits or files a disclosure.
- **[TIER-3 hook → MB22]:** an unresolved challenge recorded only as text (H-22).
- **Can tell / cannot tell:** it can tell that a structured issue, restatement or integrity failure is open. It cannot tell about a challenge raised only in an email or a minute.
- **Sources:** MB22 partial (UC-GP-B10). Anchor: Metro disclosure fine £10.0m (12 December 2022).

---
### 4.3 Family C -- Restrictions and reportability

#### T2-27 Is the regulatory restriction obeyed across the whole population, not just where the flag fired? · WOW · 24x7 (beat 3)
- **So what:** the Starling and Monzo shape. The self-built "flag fired" view is exactly what failed. The product tests the population independently and turns a missing test into a visible chain break.
- **Unit type:** breach (restriction) and chain break (no test).
- **Signal and trigger:**
  - any account opened for, or transaction by, a customer in a VREQ or s166 prohibited population, on any product, channel or migration route (S1);
  - a restriction clause with no executable test, or test coverage below the whole in-scope population (S1 for a VREQ);
  - adherence evidenced by "flag fired" rather than a population outcome (hard fail, S1);
  - **override lane (MB24 partial):** breaches whose route is "manual" (staff override or manual credit) are shown separately (S1).
- **Dimensions watched:** restriction clause × product × channel × migration route × breach route × month.
- **Action it prompts:**
  - propose immediate containment to SMF17 (for example, exit or restrict the accounts found);
  - open a draft reportability case in T2-29 (SUP 15.3, FR7) for a named SMF decision;
  - propose a test-coverage fix for any untested channel.
- **Severity and escalation:** S1 → CRO and SMF17 the same day; SMF16 for the reportability decision; BRC chair informed; board at the next meeting.
- **Audience:** CRO; SMF17; SMF16; BRC chair; board.
- **Substrate fields:** RST (clause, population definition, population_in_scope, population_tested, breaches, breach route, run_date); OBL; SMCR (accountable SMF); CG.
- **Illustrative readout:** "Restriction R-03 (no new high-risk customers): 112 accounts for 104 restricted customers in 9,400 tested this month; 97 via the new savings pot outside the flag's scope; 3 previously exited customers; 24,000 partner-channel openings untested. Flag dashboard for the same month: 'fired 1,208 times, 100% blocked' `[illustrative]`."
- **Board headline option (GM NED):** "Months since last zero-breach month: 4" `[illustrative]`.
- **[AI-architect note]:**
  - Detectability: high once each clause is decomposed into an executable test, which the product owns.
  - Hardest part: point-in-time risk ratings (was the customer high-risk *at* opening?). Store the rating as of the event date.
  - False-positive risk: low; each breach is a named record for SMF17 to confirm.
  - Flag and population results are shown side by side.
- **[Compliance flag]:**
  - **Mandatory reporting.** A VREQ breach engages SUP 15.3 ("immediately") and FR7. The card drafts; a named SMF decides.
  - Customer-level detail stays in the SMF17 workspace; the board sees counts.
- **[TIER-3 hook → MB24, MB23]:** workarounds visible only in service notes (H-24); MI that focuses on lifting the restriction rather than obeying it (H-23).
- **Can tell / cannot tell (override lane):** it can tell that breaches came through a logged manual route. It cannot tell about workarounds recorded only in service notes.
- **Sources:** MA7 (UC-GP-A3, UC-OP-A4, UC-GM-A4); MB24 partial (UC-GM-B11). Anchors:
  - FCA Final Notice, Starling: £28,959,426; VREQ accepted 17 September 2021; 54,359 accounts opened for 49,183 high-risk customers between September 2021 and November 2023, including 294 previously exited customers; notice date 27 September or 02 October 2024 (`[conflict]` CF-17).
  - FCA, Monzo: £21,091,300; count 34,000+ customers versus 26,325 accounts (`[conflict]` CF-16).
  - CB Payments (23 July 2024) for the "flag fired" shape `[scope]`.

#### T2-28 Does the attestation we are about to give the supervisor match the population test? · WOW · 24x7 (beat 3)
- **So what:** before an SMF signs a restriction attestation, they see whether the population test supports it.
- **Unit type:** reportability case × restriction.
- **Signal and trigger:** a VREQ or s166 attestation is due within N days (for example 15) while, for the attestation period, any of the following holds:
  - the population test shows breaches (S1);
  - part of the population is untested (S1);
  - a remediation milestone is overdue (S2);
  - the test has not run for the full period (S2).
- **Dimensions watched:** restriction × attestation period × clause × test result × milestone.
- **Action it prompts:** prepare an evidence summary per clause (supported / not supported / partly supported by the structured evidence) for the attesting SMF. Propose the facts the attestation should disclose. **The SMF writes and signs the attestation; the product never drafts a compliance claim.**
- **Severity and escalation:** S1 → attesting SMF and CRO; SMF16 to consider a reportability case through T2-29.
- **Audience:** CRO; SMF17; the attesting SMF; board.
- **Substrate fields:** RST (attestation_due, test runs, breaches, untested population); ISS (s166 milestones); ATT (prior attestations, status).
- **Illustrative readout:** "Q3 2026 VREQ attestation due in 12 days. Evidence: 6 high-risk onboardings in the period, all via the group migration of 01 August 2026; 1 of 4 clauses not supported `[illustrative]`."
- **[AI-architect note]:**
  - Deterministic on test results.
  - Applies only where a VREQ or s166 requires attestation. Six-monthly SMF certification to the regulator is not a rule (C21); never imply it is.
- **[Compliance flag]:**
  - **Mandatory reporting.** Evidence contradicting a *prior* attestation may itself open a SUP 15.3 / Principle 11 case. `[legal-review]` applies to how the contradiction is recorded.
  - Insight to the SMF; the decision is theirs.
- **[TIER-3 hook → MB25]:** checking the attestation's own statements, sentence by sentence, against the evidence (H-25).
- **Can tell / cannot tell:** it can tell what the structured evidence supports for the period. It cannot read the draft attestation text, so it cannot say which sentence is unsupported.
- **Sources:** MB25 partial (UC-GM-B15). Anchor: Starling moved from its September 2021 VREQ to its first zero-breach month in April 2024, 31 months later (K-6).

#### T2-29 What may be reportable, on which clock, and who is deciding? · DIFFERENTIATING · 24x7 (beat 3)
- **So what:** one event can start several clocks. The ledger shows every route, its clock and its named decider. The AI prepares; the SMF decides.
- **Unit type:** reportability case.
- **Signal and trigger:**
  - a logged event (incident, restriction breach, control failure, conduct breach) engages one or more routes and has no recorded human decision on each (S1);
  - **Boolean trap:** one route decided, sibling routes unassessed (S1);
  - an FCA decision recorded with no PRA (FR7) decision for a dual-regulated firm (S2);
  - a "not reportable" decision with no re-evaluation date, or with new linked facts since the decision (S2).
- **Dimensions watched:** parent event × child route × clock × decider × status.
- **Routes held:**
  - SUP 15.3 ("immediately");
  - PRA FR7;
  - SUP 15.11 Conduct Rule notifications (including the MA16 timer once an HR outcome is logged);
  - REP008 (annual);
  - SAR question open (POCA 2002; content kept in a restricted workflow);
  - OFSI (SAMLA 2018, "immediately");
  - ICO (UK GDPR Article 33, 72 hours);
  - FCA PS26/2 and PRA PS7/26 from 18 March 2027.
  All clocks are `[unverified]` until checked against the texts.
- **Action it prompts:** prepare the case per route: facts, rule text versioned by in-force date, and the options with rationale. Propose the decider. **A named SMF (usually SMF16; SMF4 or SMF17 by matter) records the decision, with timestamp, rationale and any dissent. The product never files or notifies.**
- **Severity and escalation:** S1 → the deciding SMF and CRO immediately; the board sees a ledger summary (counts by status). SAR content never reaches the board view.
- **Audience:** CRO ↔ SMF16 (decision owner); SMF17; board (summary).
- **Substrate fields:** RPL (product-owned); INC; RST; ISS; OBL (rule library by in-force date); SMCR.
- **Illustrative readout:** "Event E-2026-117: data error moved 2,300 fixed-rate mortgage customers to the reversion rate without notice. Routes: SUP 15.3 (decided: notify, 23 October); FR7 (not assessed); SUP 15.11 (not assessed; disciplinary outcome logged); SAR (not engaged). 1 of 4 routes decided on day 4 `[illustrative]`."
- **[AI-architect note]:**
  - Deterministic route mapping from event type to the rule library.
  - Over-inclusion is preferred (GP L4), but over-reporting carries a governance cost (C4, P11).
  - The record is immutable and re-testable: decisions are appended, never edited.
- **[Compliance flag]:**
  - **Mandatory reporting obligations throughout.** The AI never decides reportability, and never re-dates an awareness timestamp.
  - SAR tipping-off risk: restricted workflow, with only "SAR question open" visible above SMF17.
  - Data protection: an ICO route is held without personal data on the board view.
- **[TIER-3 hook → MB6]:** awareness reconstructed from escalation notes and minutes (H-6).
- **[TIER-3 hook → MA16]:** an HR conduct-outcome feed that would start the SUP 15.11 timer automatically. Until then, the route opens only when someone logs the event (H-34).
- **Can tell / cannot tell (MA16 route):** it can tell that a logged conduct event has an undecided SUP 15.11 route. It cannot tell about an HR outcome that nobody has logged.
- **Sources:** MA15 (UC-GP-A8, UC-OP-A9, UC-GM-A10); MA16 route (UC-OP-A16). Anchors: Starling's VREQ breach found 21 July 2022 and notified 24 August 2022 (34 days; FCA "disappointment"), against prompt notification of the sanctions gap (found January 2023, notified 16 February 2023).

#### T2-30 Did a structured signal exist before the awareness date we logged? · WOW · 24x7 reserve (shown in beat 3)
- **So what:** SUP 15.3 runs from information that "reasonably suggests", not from a finished investigation. Before the SMF decides, the product shows any earlier structured signal of the same matter.
- **Unit type:** reportability case (clock integrity).
- **Signal and trigger:** for a ledger event, a linked structured record predates the logged awareness date by more than N days (for example 5 working days) (S2):
  - an issue log entry on the same control or metric;
  - a failed control test;
  - a KRI breach;
  - an incident's detected_date earlier than its logged_date;
  - a failed population test.
- **Dimensions watched:** ledger event × linked records (control, metric, feed, restriction) × dates.
- **Action it prompts:** prompt the deciding SMF to re-test the awareness date, showing the earlier records. **The product never re-dates; the SMF records whether the logged date stands, with rationale.**
- **Severity and escalation:** S2 → the deciding SMF and CRO; whether the BRC sees it is open (P12).
- **Audience:** CRO ↔ SMF16; SMF17; BRC chair (on threshold matters, subject to P12).
- **Substrate fields:** RPL logged awareness date; ISS raised_date; CTL test dates and results; KRI breach dates; INC detected_date and logged_date; RST run dates; CG linking.
- **Illustrative readout:** "Event E-2026-117 logged awareness 14 October. Earlier linked records: issue I-8812 'duplicate collections' raised 21 August (L2); control test DD-03 failed 02 September. Gap from first structured signal: 54 days `[illustrative]`."
- **[AI-architect note]:**
  - Linking relies on CG keys (control, metric, feed), not text matching. That keeps it deterministic, but it misses signals recorded only as text.
  - False-positive risk: an early record that was immaterial when raised. Show severity at the time and let the SMF dismiss with a reason.
- **[Compliance flag]:**
  - **Mandatory reporting clock.** `[legal-review]`: an awareness chronology may be disclosable. Frame it as "prompt to re-test", never "late".
  - People who raised the earlier signal are evidence of good culture, never targets.
- **[TIER-3 hook → MB6]:** the first narrative signal in escalation notes, challenge records and minutes. This is the full chronology strip (H-6).
- **Can tell / cannot tell:** it can tell that a structured record about the same control, metric or feed predates the logged awareness. It cannot tell when someone first *described* the matter in writing, or what they knew.
- **Sources:** MB6 partial (UC-GP-B3, UC-OP-B7, UC-GM-B6). Anchor (GM chronology): at Metro, "Bad Data" rejections were flagged in 2017, the scale was confirmed in April 2018, the error was logged on 17 April 2019 and the FCA was notified on 29 May 2019.

#### T2-31 Which upcoming obligations are we not ready for? (18 March 2027 and the regulatory horizon) · DIFFERENTIATING
- **So what:** a fixed-date buying trigger. Incidents and third parties logged today would fall under the new regime, but are not classified.
- **Unit type:** reportability case (forward-dated) with chain break (forward mapping).
- **Signal and trigger:**
  - an incident logged now would meet the PS26/2 / PS7/26 threshold but has no shadow classification (S3; S2 inside 90 days of 18 March 2027);
  - a third party meets the materiality criteria but is not on the register (S3);
  - an upcoming obligation (for example PRA CP14/26 SMCR Phase 2, consultation closing 22 January 2027) has no owner, control or readiness evidence (S3).
  Consultation status is always kept distinct from final.
- **Dimensions watched:** obligation × in-force date × status × incident or third party × owner.
- **Action it prompts:** propose a classification backlog plan and owners. A readiness paper is drafted for the COO and BRC.
- **Severity and escalation:** S3 → COO and ERC; S2 → BRC.
- **Audience:** CRO; COO and CTO; SMF16; BRC; company secretary.
- **Substrate fields:** INC; third-party register fields; OBL (in_force_date, status, versioned rules); CG; SMCR.
- **Illustrative readout:** "Back-test of the last 12 months: 9 incidents would have been reportable, 4 classified; 17 of 22 material third parties registered; 3 incidents relate to one cloud provider not yet classified as material. 142 days to 18 March 2027 `[illustrative]`."
- **[AI-architect note]:** incident logs usually lack the needed attributes, so a one-off enrichment is needed (structured fields keyed by the owner). Over-classification during shadow running is acceptable.
- **[Compliance flag]:** forward reporting obligations. Thresholds and clocks are `[unverified]` until confirmed (C15).
- **Sources:** MA24 (UC-OP-A14); MA23 (UC-GP-A13). Anchor: TSB, FCA and PRA, £48,650,000 (20 December 2022).

#### T2-32 Where else in our estate does this failure pattern exist? (internal read-across) · DIFFERENTIATING
- **So what:** when one control breaks, every control with the same design or feed is a candidate for the same failure.
- **Unit type:** chain-break propagation.
- **Signal and trigger:** a control fails a test, or an issue is raised on it, and other controls share its design_type or feed_id, with no read-across logged within N days (S3; S2 for financial crime controls).
- **Dimensions watched:** failed control × design type × feed × business line.
- **Action it prompts:** propose a read-across review listing the matched controls with their last test dates.
- **Severity and escalation:** S3 → second line and owners; S2 → SMF17 and ERC.
- **Audience:** CRO and second line; first-line owners; SMF17; BRC chair (count).
- **Substrate fields:** CTL (design_type, feed_id, test dates); ISS; RAL.
- **Illustrative readout:** "Feed TM-04 failed reconciliation; 3 other feeds share the same nightly batch design; 1 tested since `[illustrative]`."
- **[AI-architect note]:** deterministic if design_type is coded consistently. Coding quality is the risk.
- **[Compliance flag]:** a read-across that finds a second breach may engage reporting (T2-29). Over-reporting may bring read-across information requests (CF-12, C4).
- **Sources:** MA32 (UC-OP-A10, UC-GM-A11).

#### T2-33 After a new Final Notice, did our read-across actually test the population? · DIFFERENTIATING
- **So what:** the FCA cited "numerous published FCA notices" as aggravating against Nationwide. The card catches "we said we would look, and we did not test".
- **Unit type:** chain break (read-across).
- **Signal and trigger:** a precedent in the corpus matches our controls (shared failure-shape code and control type), and either:
  - no read-across entry exists within N days of the notice (S3); or
  - the read-across was closed with code "no similar issue" and no population test of the matched controls is logged after the closure date (S2).
- **Dimensions watched:** precedent × failure shape × matched control × closure date × test date.
- **Action it prompts:** propose a population test of the matched controls, and re-open the read-across. A note to the second line is drafted.
- **Severity and escalation:** S2 → second line and SMF17; BRC (count and list).
- **Audience:** CRO and second line; SMF17; BRC.
- **Substrate fields:** PRC (structured tags only); RAL (matched controls, closure date, closure code); CTL tests.
- **Illustrative readout:** "Metro, 12 November 2024 (monitoring feed omission): read-across closed 03 December 2024 'no equivalent gap'; 3 feeds share the batch design; 1 of 3 tested since `[illustrative]`."
- **[AI-architect note]:**
  - Failure-shape matching uses coded tags on each precedent, not text mining. Tags are assigned by a named person when the precedent is loaded.
  - The 12 v6 precedents are the seed corpus; each is posture-tagged.
- **[Compliance flag]:** read-across has no standalone rule (`[practice-not-rule]`); expectations ratchet with published notices (`[inference]`).
- **[TIER-3 hook → MB17]:** whether the read-across was minuted and what the memo concluded in prose (H-17).
- **Can tell / cannot tell:** it can tell that a closed read-across has no logged test on the matched controls. It cannot tell what the memo or the committee said.
- **Sources:** MB17 partial (UC-GP-B16, UC-OP-B10). Anchors: Metro (12 November 2024); Nationwide (12 December 2025, £44,078,500); 13 FCA AML fines on banks since 2021, totalling £300,767,526 (single source).

---
### 4.4 Family D -- Escalation health: "is bad news reaching me?" (the BRC chair's beat)

Every card in this family is built only from structured signals: status history, the issue and action log, audit findings, the pack-build manifest and the forum calendar. Together they form the **escalation-health index**: a short set of numbers, each with a denominator, shown to the BRC chair. The narrative version (what the minutes and papers actually say) is Tier 3.

#### T2-34 Which persistent ambers have no logged action, decision or escalation? · WOW · 24x7 (beat 4)
- **So what:** a dashboard can show an amber. This card shows an amber that has persisted with **nothing recorded against it** in the bank's own action and decision records.
- **Unit type:** breach (persistence) and chain break (escalation).
- **Signal and trigger:** a Level 1 metric amber or red, or a Level 2 metric amber for N or more consecutive periods (default N = 2 quarters, configurable; `[practice-not-rule]`), where **all** of these hold for the persistence window:
  - no open or new action in the issue log linked to the metric (through CG);
  - no decision ID in the decision register (waiver, accepted risk, re-calibration);
  - no escalation_forum entry at the forum its routing rules assign.
  Ranked by Level, persistence length and trajectory (S2; S1 if the trajectory reaches red within one forum cycle).
- **Dimensions watched:** metric × Level × routed forum × period × owner.
- **Action it prompts:** auto-place the item on the BRC exception feed (it cannot be suppressed; method B.8). Propose one of three for the BRC chair: a remediation decision with an owner; a time-limited waiver with expiry; or a re-calibration review (T2-20).
- **Severity and escalation:** S2 → BRC exception feed; S1 → BRC chair at the CRO's call before the meeting.
- **Audience:** BRC chair (primary for this beat); CRO; ERC chair; metric owner.
- **Substrate fields:** KRI status history; RAS (Level, thresholds); CG metric→action links; ISS (linked_metric_id, raised_date, status, escalation_forum, escalation_date); DEC; FCL routing rules.
- **Illustrative readout:** "1 persistent amber with no recorded action: vulnerable-customer exceptions per 10,000 contacts 14.2 → 15.8 → 16.9 over 3 quarters (amber 14, red 18); no linked action, decision or BRC escalation logged; early-warning projection reaches red in 2 quarters `[illustrative]`."
- **[AI-architect note]:**
  - Deterministic.
  - The main false-positive source is actions that exist but are not linked to the metric in CG. Show "unlinked actions on this risk" as a secondary count, and let the owner link one with a reason.
  - Persistence N and the routing rules are firm configuration with a named owner and approval date.
- **[Compliance flag]:** none at insight level. Wording is fixed: "no action recorded in the action log", never "not discussed" or "ignored". COCON 4.2 reasonable steps is engaged only by inference.
- **[TIER-3 hook → MB1]:** whether the responsible forum's minutes record discussion, challenge or only "noted" (H-1). `[legal-review]`.
- **Can tell / cannot tell:** it can tell that a persistent amber has no action, decision or escalation in the structured records. It **cannot** tell whether a committee discussed it, challenged it or minuted "noted". A discussion with no logged action reads the same as no discussion.
- **Sources:** MB1 partial (UC-GP-B1, UC-OP-B1, UC-GM-B2); exception-feed rule from MA21 (UC-GM-A7). Anchor (GM, B-GM-02): at Metro an operations risk board ranked bad data among its top five risks from May to August 2018, then reassigned and dropped the actions after 16 August 2018. No periodic MI reached the BRC until an external firm was engaged in December 2018.

#### T2-35 Which items qualified for the BRC under our own rules but were left out of the pack? · DIFFERENTIATING · 24x7 reserve
- **So what:** a spreadsheet has no memory of what qualified and was removed. The pack-build manifest does.
- **Unit type:** breach (persistence) with routing.
- **Signal and trigger:**
  - an item meets a BRC routing rule (Level 1 red or amber; Level 2 red; persistent Level 2 amber; lower-forum top risk past SLA) and is absent from the BRC pack manifest (S2);
  - an item was removed from a pack it qualifies for without an override reason code and approver (S1).
- **Dimensions watched:** item × rule × forum × cycle × override.
- **Action it prompts:** propose restoring the item, or recording an override reason. **The CRO approves the pack; the BRC chair sees the override log.**
- **Severity and escalation:** S2 → CRO before the pack is issued; S1 → BRC chair (override log).
- **Audience:** BRC chair; CRO; ERC chair.
- **Substrate fields:** FCL routing rules; PKM manifest and override log; KRI status history; ISS.
- **Illustrative readout:** "13 items qualify for the BRC; 12 included; 1 removed at ERC on 14 October 2026 with no reason recorded `[illustrative]`."
- **[AI-architect note]:**
  - Deterministic.
  - Hardest part: getting the firm to write its routing rules precisely enough to execute.
  - Pack bloat if N is low (NED concern). Cap the headline, never the exception feed (regulatory adviser).
- **[Compliance flag]:** none. Routing rules are `[practice-not-rule]`.
- **Sources:** MA21 (UC-GM-A7). Illustrative replay of the Metro shape under a 90-day SLA rule: the item would have surfaced in August 2018, about four months before the external engagement `[illustrative]`.

#### T2-36 Which known weaknesses are overdue, extended or ageing without reaching the board, and will the backlog clear on time? · DIFFERENTIATING · 24x7 (beat 4)
- **So what:** the Starling and Nationwide shape. Known weaknesses sit past their due dates and never reach the risk committee.
- **Unit type:** breach (remediation persistence) with auto-escalation.
- **Signal and trigger:**
  - a high-rated audit finding or regulatory action is past due, with no BRC pack entry in the manifest (S2);
  - a due date has been extended more than a firm-set number of times, for example 2 (S2);
  - a finding repeats a closed one (S2);
  - a known-weakness backlog (for example, CDD refresh overdue) is flat or growing for 2 or more periods (S2);
  - **clearance projection (MA19):** the least-squares clearance date falls after the committed date (S2; S1 if the item is a regulatory commitment).
- **Dimensions watched:** finding or action × rating × owner × due-date history × backlog series.
- **Action it prompts:** auto-surface on the exception feed under "unremediated past SLA" (cannot be suppressed). Propose a BRC agenda item and a remediation-owner review. A BRC paper paragraph is drafted.
- **Severity and escalation:** S2 → BRC exception feed; audit committee chair copied for audit findings; S1 → BRC chair.
- **Audience:** BRC chair; CRO; audit committee chair; SMF5; first-line owners; SMF17 for financial crime backlogs.
- **Substrate fields:** AUD (rating, due_date, extension_count, repeat_flag, status); ISS (due_date_history, action_type); KRI backlog series; PKM manifest.
- **Illustrative readout:** "High-rated finding on CDD refresh: extended 3 times over 19 months; backlog flat at 41,000–44,000 customers; never in a BRC pack. Projected clearance 31 months against a committed 12 `[illustrative]`."
- **[AI-architect note]:**
  - Easy; the data exists.
  - Agree the SLA by rating and the extension count in configuration.
  - The clearance projection is labelled "early warning, not a prediction".
  - Whether the BRC or the audit committee owns the item is contested. Surface it to both (L1).
- **[Compliance flag]:** overdue regulatory actions and s166 milestones may be relevant to Principle 11 openness. A human decides whether the supervisor is told.
- **Sources:** MA20 (UC-OP-A12); MA19 (UC-GP-A11). Anchors: Starling's November 2018 internal audit report was not conveyed "to either Starling's Board or the Authority"; Nationwide £44,078,500 (12 December 2025), weaknesses not remediated in a timely manner; Santander £107.7m.

#### T2-37 How long does bad news take to reach the BRC? (escalation latency from the action log) · DIFFERENTIATING · 24x7 (beat 4)
- **So what:** a single, defensible number for the BRC chair. It is the median time from a material issue being logged to its first BRC escalation.
- **Unit type:** position (governance KRI) with a breach on threshold.
- **Signal and trigger:** for issues of severity "high" or above, latency is measured from raised_date (first structured flag) to the first BRC escalation_date or BRC pack manifest entry. The card fires when:
  - the median exceeds the firm's threshold, for example 2 cycles (S2);
  - the median rises 2 quarters running (S3);
  - any material issue is still not escalated after N cycles (S2; listed).
- **Dimensions watched:** severity × principal risk × business line × source (L1 / L2 / L3) × quarter.
- **Action it prompts:** propose a governance review of the escalation route for the BRC chair, naming the slowest routes.
- **Severity and escalation:** S2 → BRC chair; S3 → CRO.
- **Audience:** BRC chair; CRO; board.
- **Substrate fields:** ISS (raised_date, severity and severity_history, escalation_forum, escalation_date, source); PKM manifest; FCL.
- **Illustrative readout:** "Median 4.6 months from logged issue to first BRC escalation (high severity, n = 23); 3 material items unescalated after 12 months `[illustrative]`."
- **[AI-architect note]:**
  - Deterministic on the log.
  - False-positive risk: issues that were not material when raised and became so later. Measure from the date the severity first reached "high" (severity_history), not the raised date, and show both.
  - Escalation latency is a culture KRI labelled `[practice-not-rule]`.
- **[Compliance flag]:** none at insight level. Speak-up data is excluded from Tier 2 entirely.
- **[TIER-3 hook → MB9]:** the first narrative flag in escalation notes, challenge records or aggregated speak-up themes, matched to the first mention in BRC minutes (H-9).
- **Can tell / cannot tell:** it can tell how long a *logged* issue took to be *logged* as escalated to the BRC. It cannot see a concern that was raised in an email, a note or speak-up before anyone logged it, so it may under-state true latency.
- **Sources:** MB9 partial (UC-OP-B8; GM latency measure in UC-GM-B1). Anchor: at Metro, about two years passed from the first flag to the board (OP F-OP-04).

#### T2-38 Which actions or issues were closed, downgraded or dropped while the metric they were meant to fix has not moved? · WOW · 24x7 (beat 4)
- **So what:** action trackers improve when items are closed, whatever the effect. This card shows the BRC chair the closures and downgrades that did not change the risk.
- **Unit type:** chain break (action effectiveness) and escalation.
- **Signal and trigger:**
  - **closed, not effective (MB21 partial):** an action is closed, and its linked metric is still outside band after the declared recovery time (S2);
  - **downgraded without movement:** an issue's severity is lowered while its linked metric has not improved over the same period (S2);
  - **dropped or reassigned (MB2 partial):** an action is cancelled, reassigned or re-dated with no closure evidence flag, while its metric is still amber or red (S2);
  - a closure was not validated by internal audit where the rating requires it (S3).
- **Dimensions watched:** action or issue × linked metric × status and severity history × months after change.
- **Action it prompts:** propose re-opening, or reinstating the original severity, for the owner and SMF5 to decide. The count goes on the escalation-health index; a re-open request is drafted.
- **Severity and escalation:** S2 → owner, SMF5 and BRC exception feed ("closed, not effective"); S1 if the metric is a Level 1 red.
- **Audience:** BRC chair; CRO; first-line owners; SMF5.
- **Substrate fields:** ISS (status_history, severity_history, closure_date, closure_evidence_flag, owner history, due_date_history); AUD validated_closure_date; CG action→metric links; KRI; CAL recovery time.
- **Illustrative readout:** "This quarter: 42 CDD remediation actions closed; overdue CDD still 26,900 against a target of 10,000. 2 issues downgraded from high to medium with no metric movement; 1 action reassigned twice with no closure evidence `[illustrative]`."
- **[AI-architect note]:**
  - Hardest part: action-to-metric links. Show the share of actions with no linked metric as a mapping gap.
  - False-positive risk: long recovery times. Use the declared recovery time per metric.
  - Deterministic otherwise.
- **[Compliance flag]:** none at insight level.
- **[TIER-3 hook → MB21, MB2]:** what the closure narrative claimed (H-21); and actions that disappeared or were reworded between forums' minutes, the Metro shape (H-2). `[legal-review]` on H-2.
- **Can tell / cannot tell:** it can tell that the log closed, downgraded, cancelled or reassigned an item while the metric did not move. It cannot tell what the closure note claimed, or whether an action disappeared from minutes without ever being logged.
- **Sources:** MB21 partial (UC-GP-B12); MB2 partial (UC-GM-B1). Anchor: Nationwide £44,078,500 (12 December 2025), remediation not timely.

#### T2-39 Was a second-line challenge closed or risk-accepted by the first line before a breach? · DIFFERENTIATING
- **So what:** a challenge that was overruled and then proved right is the clearest evidence that the second line is not being heard.
- **Unit type:** silent failure (challenge effectiveness) → breach.
- **Signal and trigger:** an issue raised by the second line (source = L2) was closed without the second line's sign-off, or converted into a risk acceptance, and a breach occurred on the linked metric or control within N months (S2). The count is shown at business-unit level only.
- **Dimensions watched:** business unit × principal risk × issue source × closure route × later breach.
- **Action it prompts:** propose a review of the closure and of the risk acceptance, for the BRC chair and SMF5.
- **Severity and escalation:** S2 → BRC chair (aggregate); detail goes to the second line.
- **Audience:** BRC chair; CRO; SMF5; first-line owner.
- **Substrate fields:** ISS (source, closure route, risk_acceptance_id, closure sign-off fields); DEC; KRI; CTL.
- **Illustrative readout:** "Retail lending: 4 L2-raised issues risk-accepted in H1 2026; 2 of the linked metrics breached red within 5 months `[illustrative]`."
- **[AI-architect note]:** depends on the issue log recording the raising line and the closure route. Show it at business-unit level, never at individual level.
- **[Compliance flag]:** individual-level attribution is avoided. This is a governance insight, not a conduct finding.
- **[TIER-3 hook → MB11]:** challenges recorded only as text, and whether they were answered (H-11). `[legal-review]`.
- **Can tell / cannot tell:** it can tell that a logged L2 issue was closed or accepted and then breached. It cannot see challenges that never became a logged issue.
- **Sources:** MB11 partial (UC-OP-B12, UC-GM-B7).

#### T2-40 Are we finding our own problems? (self-identification ratio) · DIFFERENTIATING
- **So what:** an objective measure of first- and second-line maturity. When audit or the regulator finds the problems, the first two lines are not working.
- **Unit type:** position (governance KPI).
- **Signal and trigger:** the share of high-severity issues found by the first and second lines falls below the firm's target, or falls for 2 quarters, or a unit with no self-reported issues has a high-severity issue found externally (S3; S2 for a regulator- or s166-found issue).
- **Dimensions watched:** business unit × principal risk × severity × source × quarter.
- **Action it prompts:** propose a focused first-line assurance review in the weakest unit. A BRC paragraph is drafted.
- **Severity and escalation:** S3 → BRC quarterly; S2 → BRC chair.
- **Audience:** BRC chair; CRO; SMF5; audit committee chair.
- **Substrate fields:** ISS source tags and severity; AUD.
- **Illustrative readout:** "Self-identified: 14 of 24 high-severity issues in 2026 (58%, down from 71%); 7 found by internal audit, 2 by a skilled person, 1 by the FCA `[illustrative]`."
- **[AI-architect note]:**
  - Gaming risk: logging trivial self-identified issues. Weight by severity.
  - SMF5 owns the tagging of audit findings, but does not own the metric.
  - No benchmark exists; the target is set by the firm.
- **[Compliance flag]:** none.
- **Sources:** MA33 (UC-GM-A12).

#### T2-41 Can each SMF show the structured steps taken on breaches in their area? · DIFFERENTIATING
- **So what:** protection for the SMF, not surveillance. The SMF sees, privately and early, where their recorded trail is thin.
- **Unit type:** chain break (owner engagement).
- **Signal and trigger:** a red or breach on a board object mapped to an SMF's Statement of Responsibilities, with any of these missing from the structured record within the window:
  - an action assigned with an owner;
  - an escalation logged to the routed forum;
  - a follow-up (due-date review);
  - closure evidence;
  - a current attestation.
  (S3 to the SMF privately.)
- **Dimensions watched:** SMF × board object × breach × step × window.
- **Action it prompts:** propose the missing steps to the SMF, in their **private** view first. The board sees only aggregate coverage ("structured trail complete for 17 of 21 breaches"), and only after the SMF has reviewed it.
- **Severity and escalation:** S3 → SMF privately; aggregate only → BRC chair.
- **Audience:** each SMF (private); CRO; CEO; BRC chair (aggregate only).
- **Substrate fields:** SMCR SoR mapping; KRI and RST breaches; ISS (owner, escalation, due-date history, closure evidence); ATT.
- **Illustrative readout:** "SMF for financial crime systems, 3 reds in 2 quarters: action assigned 3 of 3; escalation to the BRC logged 0 of 3; follow-up 1 of 3; closure evidence 1 of 3 `[illustrative]`."
- **[AI-architect note]:** deterministic on the log. SMF resistance is the adoption risk; private-first framing is mandatory.
- **[Compliance flag]:**
  - SMCR reasonable steps and the Duty of Responsibility. `[legal-review]`: an evidence pack may itself become disclosable.
  - Data protection: individual-level data stays in the SMF's private view.
  - Six-monthly SMF attestation is internal practice, not a regulatory certification.
- **[TIER-3 hook → MB7]:** challenge, follow-up and escalation evidenced in minutes and correspondence (H-7).
- **Can tell / cannot tell:** it can tell which steps are recorded in structured logs. It cannot see steps taken in meetings or correspondence, so a thin structured trail does not mean the SMF took no reasonable steps.
- **Sources:** MB7 partial (UC-GP-B5, UC-OP-B13). Anchor: at Starling there was "no single person with sufficient authority and oversight" for the VREQ.

---

### 4.5 Family E -- Consumer Duty and customer outcomes (PRIN 2A)

#### T2-42 Which Consumer Duty outcomes are outside tolerance, for which cohort, and is each measure complete? · DIFFERENTIATING
- **So what:** the FCA's review of 180 board reports found outcome measures without thresholds, owners or actions. This card enforces all five elements and shows the cohorts that are outside tolerance.
- **Unit type:** position and breach (outcome tolerance); chain break (completeness).
- **Signal and trigger:**
  - an outcome measure for a journey or cohort is outside tolerance (S3; S2 for 2 or more periods or for a vulnerability cohort);
  - a measure is missing any of threshold, owner, action, due date or success measure (chain break, S3).
- **Dimensions watched:** outcome × journey × cohort (minimum cohort size enforced) × period.
- **Action it prompts:** propose a journey-owner remediation action and a completeness fix. A line for the SMF16 report is drafted.
- **Severity and escalation:** S3 → journey owner and SMF16; S2 → ERC and BRC; board via the annual report.
- **Audience:** CRO; SMF16; journey owners; Consumer Duty champion; board.
- **Substrate fields:** CDO (outcome, journey, cohort, cohort_n, measure, threshold, owner, action, due_date, success measure); ISS linked actions.
- **Illustrative readout:** "Consumer support: SLA breach rate on vulnerable-customer support queues 14% (1,260 of 9,000 contacts) against a 5% tolerance; completeness strip 4 of 5 (no success measure) `[illustrative]`."
- **[AI-architect note]:** structured MI only, with a minimum cohort size so that small cohorts are suppressed. Completeness is deterministic.
- **[Compliance flag]:**
  - **Protected-attribute proxying.** Vulnerability, age and disability cohorts are permissible for *insight* (required for the outcome test). Any *differential action* by cohort is gated to SMF16 and risk review.
  - Data protection: cohort-level only, never identity-level on the board view.
- **Sources:** MA36 (UC-OP-A13). Anchor: FCA, *Consumer Duty board reports: good practice and areas for improvement* (11 December 2024, updated 24 February 2025).

#### T2-43 Before the Consumer Duty board report is drafted, does the outcome evidence support a positive conclusion? · DIFFERENTIATING
- **So what:** the board owns the annual report. This card gives it the evidence position per outcome before anyone writes "good outcomes".
- **Unit type:** chain break (assurance claim), evidence side.
- **Signal and trigger:** for each of the four outcomes, an evidence position (supported / mixed / not supported) is computed from structured MI. It fires if any outcome is not supported, because measures are outside tolerance, linked remediation actions are late, or coded complaint uphold or FOS overturn rates are adverse, within N weeks of the report's board date (S2).
- **Dimensions watched:** outcome × journey × cohort × measure × action status × complaint codes.
- **Action it prompts:** prepare the evidence pack per outcome for SMF16 and the Consumer Duty champion. Propose where the board's conclusion needs qualification. **The board owns the report; the product does not draft its conclusions.**
- **Severity and escalation:** S2 → SMF16, the champion and the BRC; board before approval.
- **Audience:** CRO; SMF16; Consumer Duty champion; board.
- **Substrate fields:** CDO; ISS linked actions; CMP coded counts, uphold, FOS outcomes.
- **Illustrative readout:** "Consumer support: not supported. Vulnerable-queue SLA breaches 14% against 5%; 2 of 5 remediation actions late; forbearance complaints up 38% year on year (412 to 569) `[illustrative]`."
- **[AI-architect note]:** deterministic on MI. The outcome-to-measure mapping is product-owned (CG) and must be agreed with SMF16.
- **[Compliance flag]:** PRIN 2A.8 annual board report obligation. Cohort caution as in T2-42.
- **[TIER-3 hook → MB19]:** reading the draft report's own assertions and testing each one against the evidence and complaint narratives, plus whether the minutes show champion or board challenge (H-19).
- **Can tell / cannot tell:** it can tell what the structured evidence supports per outcome. It cannot read the draft report, so it cannot point to the sentence that over-claims.
- **Sources:** MB19 partial (UC-GP-B7, UC-GM-B13). Anchors: PRIN 2A.8.3R to 2A.8.5R; Consumer Duty focus areas (07 May 2026 and 24 September 2026).

#### T2-44 Did complaints spike on a journey after a change, or cluster on a journey nobody owns? · DIFFERENTIATING
- **So what:** customers feel a broken journey before any control test does. Coded complaint counts are the earliest structured signal.
- **Unit type:** chain break (change × outcome; ownership).
- **Signal and trigger:**
  - **after a change (MB13 partial):** coded complaints on a journey step up beyond their band within N weeks of a deployment that touched the journey (S3; S2 if the change lacked a risk-owner approval in the change log);
  - **unowned journey (MB14 partial):** a journey with no horizontal owner in CG has a complaint rate above band, while each functional owner's metrics are green (S3).
- **Dimensions watched:** journey × root-cause code × change × week; journey × owner type.
- **Action it prompts:** propose a journey review by the journey risk owner and CTO, and propose an owner for an unowned journey for CEO approval.
- **Severity and escalation:** S3 → journey owner and SMF16; S2 → ERC, and the board only when a control is touched.
- **Audience:** CRO; journey risk owner; CTO; SMF16; CEO (ownership).
- **Substrate fields:** CMP (journey_code, root_cause_code, received_date, counts); CHG (deploy_date, approver, journey link); CG journey owner; SMCR.
- **Illustrative readout:** "Mortgage switching: complaints coded 'unexpected rate' up from 38 to 141 a month in the 3 weeks after release R-2026-09; the change has no risk-owner approval recorded `[illustrative]`."
- **[AI-architect note]:** depends on consistent journey and root-cause coding. Show the uncoded share as a denominator gap. False-positive risk: unrelated seasonal spikes; require a step change against a trailing band.
- **[Compliance flag]:** cohort caution where complaint cohorts proxy protected characteristics. Aggregate only.
- **[TIER-3 hook → MB13, MB14]:** narrative complaint themes linked to the change, and the handoff evidence in complaint text (H-13, H-14).
- **Can tell / cannot tell:** it can tell that coded complaint counts moved on a journey after a change, or on an unowned journey. It cannot tell what customers said, so it cannot confirm the causal theme.
- **Sources:** MB13 partial (UC-GP-B6, UC-GM-B10); MB14 partial (UC-OP-B6).

#### T2-45 Are we still charging customers who get no value? · TABLE-STAKES
- **So what:** a price-and-value outcome tolerance. Inactive fee-payers are an easy Consumer Duty test for the board.
- **Unit type:** position (Consumer Duty tolerance).
- **Signal and trigger:** the share of fee-paying customers with no qualifying activity for 12 months exceeds tolerance (S3).
- **Dimensions watched:** product × fee type × activity band × quarter. Age cohorts are excluded from the trigger (see the compliance flag).
- **Action it prompts:** propose a product-governance review, and customer contact or a fee review, for SMF16 and the product owner.
- **Severity and escalation:** S3 → SMF16 and product owner; ERC.
- **Audience:** CRO; SMF16; product owner.
- **Substrate fields:** CDO price-and-value measures; product fee and activity aggregates.
- **Illustrative readout:** "Packaged current account: 6.8% of fee-payers inactive for 12 months (4,080 of 60,000) against a 4% tolerance; £410k annual fees `[illustrative]`."
- **[AI-architect note]:** simple and deterministic. Define "activity" in configuration.
- **[Compliance flag]:** **protected-attribute proxying.** Inactivity correlates with age. An insight by age cohort is permissible; any differential action by age is gated to SMF16 and risk review.
- **Sources:** MA37 (UC-GM-A20).

---
### 4.6 Cut log (units considered and not carded)

| Candidate | Why it was cut or held |
|---|---|
| MA27 agent and API session SCA-bypass KRI as a card | No action beyond what a fraud dashboard prompts. GM says it "barely beats a dashboard". Held as Tier 1 question T1-9.6, as a KRI row only |
| A standalone "capital headroom" card (recall gap 6) | Covered by T2-1 (binding constraint) and the scorecard (T2-12). A separate card adds no new action |
| A standalone "silent amber with no RAG change" card | Merged into T2-34. Two cards would prompt the same BRC decision |
| A board-level "speak-up volume" card | Speak-up data is outside the beachhead substrate, and the data-protection minimum cohort cannot be honoured at board altitude. Tier 3 (H-27, H-28) |
| A "board challenge score" card (MB12) | No structured partial adds anything beyond T2-34's "no decision ID" test. Scoring the board needs minutes. Tier 3 only (H-12) |

---

## 5. Tier 3 hooks (join-dependent extensions; tagged, not built)

**What Tier 3 adds.** Tier 3 adds the narrative corpus: committee papers and minutes, escalation notes, attestation commentary, second-line challenge text, complaint narratives and speak-up case text. It also covers the few data sources outside the substrate (HR outcomes, agent mandate data).

**Rules for every hook:**
- cohort-level framing by default;
- evidence bands (strong / moderate / weak), with secretary or owner confirmation before anything reaches a board view;
- the AI marks its extraction, and a named person accepts it.

**Legend:**
- `[legal-review]` is the Stage 2 flag. These items may create a discoverable record. They are eligible and not down-scored, by user decision.
- `[DP]` marks a data-protection or anonymity condition.

| Hook | Merge ID | Extends Tier 2 | What the join adds | Extra data | Flags | Stage 2 rank |
|---|---|---|---|---|---|---|
| H-1 | MB1 | T2-34 | Whether the routed forum's minutes record discussion, challenge, decision or only "noted"; ERC-to-BRC drop-off; two "noted" cycles in a row | BRC, ERC and board minutes; alias table for metric names | `[legal-review]` (minutes are a legal record; state "no action recorded", never "minutes wrong"); `[evidence: product design]` (GP) | #1 (27) |
| H-2 | MB2 | T2-38 | Actions that disappear or are reworded between forums' minutes without a log entry: the Metro shape | Minute trails across forums | `[legal-review]`; the only precedent-backed narrative join in the run | Reserve (23) |
| H-3 | MB3 | T2-22 | Narrative softening across forums (status softened, denominator dropped, trend omitted), and figures in free text | ERC, BRC and board paper text | Reliable only on templated packs | #5 (26) |
| H-4 | MB4 | T2-6 | Checks the keyed bounds against the minuted decision; finds tensions with no decision record; extracts trade-offs from minutes | Board and BRC minutes | CF-25 white-space claim unresolved | #3 (26) |
| H-5 | MB5 | T2-17 | Commentary copied across cycles; "no unexplained movements" text against moving results; repeat caveats | Attestation commentary text | Burden risk (C5) | #4 (26) |
| H-6 | MB6 | T2-30, T2-29 | The first narrative signal ("reasonably suggests") in escalation notes, challenge records and minutes; the full chronology strip | Escalation notes; challenge records; minutes | `[legal-review]` (reconstructing an awareness date); never re-dates; visibility to the BRC open (P12) | #2 (27) |
| H-7 | MB7 | T2-41 | Challenge, follow-up and escalation evidenced in minutes and correspondence: the full reasonable-steps trail | Minutes; correspondence; attestation commentary | `[legal-review]` (evidence pack); private-first; `[DP]` | #11 (24) |
| H-8 | MB8 | T2-5 | Whether the SMF escalated resourcing strain on the record, and whether the board decided | Papers; minutes | `[legal-review]`; `[scope]` Sonali Bank 2016 | Longlist |
| H-9 | MB9 | T2-37 | The true first flag (narrative or aggregated speak-up theme) to the first BRC or board minute mention | Escalation notes; challenge records; aggregated speak-up; minutes | `[DP]` speak-up minimum cohort; first-flag matching is hard | Reserve (22) |
| H-10 | MB10 | (none; badge marker) | "Concerns open" while the metric is green: staff concerns against metric status | Escalation notes; speak-up text | `[legal-review]`; `[DP]` anonymity; `[evidence: product design]` | Reserve (22) |
| H-11 | MB11 | T2-39 | Challenges recorded only as text, whether they were answered, and their later outcome | Second-line challenge text | `[legal-review]`; business-unit level only | Reserve (23) |
| H-12 | MB12 | (T2-34 test only) | Board challenge quality on reds, for the chair only | Board minutes | Boards resist scoring (C9); chair-only | Longlist |
| H-13 | MB13 | T2-44 | Narrative complaint themes linked to a technology change | Complaint narratives; change requests | Cohort caution | Longlist |
| H-14 | MB14 | T2-44 | Handoff evidence in complaint text on unowned journeys | Complaint narratives | Vertical versus horizontal ownership (C8) | Longlist |
| H-15 | MB15 | T2-19 | The change request's stated rationale ("no loss of coverage") against the actual effect | Change request text | `[evidence: product design]` | Longlist |
| H-16 | MB16 | T2-19 | The value approved in committee minutes against the deployed value | Model risk committee minutes | Cheap where minutes record values | Longlist |
| H-17 | MB17 | T2-33 | The read-across memo's conclusion and minuting, against the population test | Read-across memos; minutes; Final Notice text | Precedents posture-tagged | #12 (24) |
| H-18 | MB18 | T2-13 | Risks committees discuss that are not on the register, and the reverse | Minutes; papers | High false-positive rate | Longlist |
| H-19 | MB19 | T2-43 | Each assertion in the draft Consumer Duty report tested against evidence and complaint narratives; champion and board challenge in the minutes | Draft report text; minutes; complaint narratives | Cohort caution; the board owns the report; the AI only suggests wording | #6 (25) |
| H-20 | MB20 | T2-23 | Effectiveness claims made in committee papers against failed tests | Committee paper text | `[scope]` | Longlist |
| H-21 | MB21 | T2-38 | What the closure narrative claimed against the unmoved metric | Closure notes; audit validation notes | `[evidence: product design]` | Reserve (22) |
| H-22 | MB22 | T2-26 | Unresolved challenges recorded only as text against a figure about to be published | Challenge text; audit committee papers | Sits with the CFO | Longlist |
| H-23 | MB23 | T2-27 | MI balance: papers focused on lifting the restriction rather than obeying it (the Starling MI shape) | Board and BRC papers | Board resistance | Reserve (23) |
| H-24 | MB24 | T2-27 | Workarounds recorded only in service notes | Service and case notes | `[scope]` CB Payments | Longlist |
| H-25 | MB25 | T2-28 | The attestation's own statements checked sentence by sentence against the evidence | Draft attestation text | `[legal-review]` (contradiction with a prior attestation) | #13 (24) |
| H-26 | MB26 | T2-7 | Waiver conditions held only in minute text | Board and BRC minutes | Waivers often informal | Longlist |
| H-27 | MB27 | (none) | Speak-up themes against override behaviour; a culture card with required human interpretation | Speak-up text; override logs | `[DP]` anonymity; never score more reports as worse | Longlist |
| H-28 | MB28 | (none) | Zero whistleblowing in a high-growth unit: silence as a signal | Speak-up counts and text | `[DP]` | Longlist |
| H-29 | MB29 | (none) | High-risk relationship acceptances re-reviewed on adverse information | Adverse media; relationship notes | Detail in the SMF17 workspace | Longlist |
| H-30 | MB30 | (none) | Disputes saying an agent acted outside authority, split by mandate design and control failure | Complaint narratives; agent mandate data | `[agentic -- second module]`; never a liability verdict | Reserve (17) |
| H-31 | MB31 | (none) | Fair value reasoning that is only a competitor benchmark | Fair value assessment text | M-F marks the source out of scope | Longlist |
| H-32 | MB32 | (none) | Challenge density against profitability | Challenge text; P&L by unit | A provocation; `[practice-not-rule]` | Longlist |
| H-33 | MB33 | (none) | Vulnerability recording that is useful and lawful (guardrail pair 4) | Vulnerability notes | `[DP]` DPIA required before build | Longlist |
| H-34 | MA16 | T2-29 (SUP 15.11 route) | HR conduct-outcome feed driving Conduct Rule notification timers | HR case outcomes | Timers `[unverified]`; `[DP]` employee data | Longlist |
| H-35 | MA25 | (none) | Agent-initiated payments inside the customer's mandate (UK framing) | Agent mandate store; agent-tagged payments | `[agentic -- second module]`; liability unsettled | Reserve (13) |
| H-36 | MA26 | (none) | Agent mandate perimeter with a hold-review policy (US-stance variant) | As H-35 | `[agentic -- second module]`; C2 verify bank terms; do not demo | Reserve (12) |

**Hook count:** 36 = 33 MB hooks + 3 MA hooks (MA16, MA25, MA26).
- **23 hooks** belong to Group 2 use cases, whose structured partial is built in Tier 2.
- **13 hooks** belong to Group 3 use cases (H-10, H-12, H-18, H-23, H-27 to H-33, H-35, H-36). No partial of them is built. Some are noted against an adjacent card (H-12 → T2-34; H-18 → T2-13; H-23 → T2-27) only to show where the join would surface.

**Recommended Tier 3 build order** (for the first join release):
1. H-1 and H-2 (escalation-health join), because they complete beat 4 and carry the run's only precedent-backed narrative join;
2. H-6 (awareness chronology), because it completes beat 3;
3. H-4 (tension bounds against minutes);
4. H-5 (attestation commentary);
5. H-3 (pack narrative consistency).
These are the five highest Stage 2 scores. All have a Tier 2 partial already in the demo, so the join is an upgrade, not a rebuild.

---

## 6. Exceed-expectations map

### 6.1 Every Tier 2 card classified

| Card | Short name | Family | Unit type | Tag | 24x7 |
|---|---|---|---|---|---|
| T2-1 | Appetite used by the plan | A | Position | DIFFERENTIATING | **Core, beat 1** |
| T2-2 | Unused deliberate growth | A | Position | DIFFERENTIATING | |
| T2-3 | Initiative with no RAS link | A | Chain break | DIFFERENTIATING | |
| T2-4 | Crosses amber before next forum | A | Position → breach | DIFFERENTIATING | |
| T2-5 | Growth against financial crime capacity | A | Position → tension | **WOW** | **Core, beat 1** |
| T2-6 | Trade-off colliding; floor check | A | Tension collision | **WOW** | **Core, beat 1** |
| T2-7 | Waiver conditions | A | Breach | DIFFERENTIATING | |
| T2-8 | Society nature and funding limits | A | Position | TABLE-STAKES | |
| T2-9 | Impact-tolerance headroom | A | Position | DIFFERENTIATING | |
| T2-10 | Receiving-side APP exposure | A | Position | DIFFERENTIATING | |
| T2-11 | Climate collateral and pathway | A | Position | TABLE-STAKES | |
| T2-12 | Promotion lane | A | Position | TABLE-STAKES | |
| T2-13 | Emerging risk overlay | A | Position + chain break | TABLE-STAKES | |
| T2-14 | Feed completeness; integrity over status | B | Chain break / silent failure | **WOW** | **Core, beat 2** |
| T2-15 | Control gone quiet; sanctions coverage | B | Chain break / silent failure | **WOW** | Reserve (beat 2 badge) |
| T2-16 | No accountable SMF | B | Chain break (owner) | TABLE-STAKES | Reserve (beat 2 badge) |
| T2-17 | Structured attestation integrity | B | Chain break (attestation) | **WOW** | **Core, beat 2** |
| T2-18 | Unmapped obligations; zero with no proxy | B | Chain break (mapping) | DIFFERENTIATING | |
| T2-19 | Change without approval, re-test or expected effect | B | Chain break (change) | DIFFERENTIATING | |
| T2-20 | Thresholds that fail to warn | B | Chain break (calibration) | DIFFERENTIATING | |
| T2-21 | Leading indicator moved first | B | Position | DIFFERENTIATING | |
| T2-22 | Structured pack consistency | B | Chain break (consistency) | DIFFERENTIATING | |
| T2-23 | Rated effective after a failed test | B | Chain break (assurance) | DIFFERENTIATING | |
| T2-24 | AI and ML models in model risk appetite | B | Position + chain break | DIFFERENTIATING | |
| T2-25 | Cohort activity up, alerts down | B | Silent failure | DIFFERENTIATING | |
| T2-26 | Figure not supported before publication | B | Chain break (disclosure) | DIFFERENTIATING | |
| T2-27 | Restriction population test | C | Breach + chain break | **WOW** | **Core, beat 3** |
| T2-28 | Supervisory attestation against the test | C | Reportability × restriction | **WOW** | **Core, beat 3** |
| T2-29 | Multi-clock reportability ledger | C | Reportability case | DIFFERENTIATING | **Core, beat 3** |
| T2-30 | Structured signal before logged awareness | C | Reportability (clock integrity) | **WOW** | Reserve (shown in beat 3 ledger) |
| T2-31 | 18 March 2027 and horizon readiness | C | Reportability (forward) + chain break | DIFFERENTIATING | |
| T2-32 | Internal read-across | C | Chain-break propagation | DIFFERENTIATING | |
| T2-33 | Final Notice read-across tested | C | Chain break (read-across) | DIFFERENTIATING | |
| T2-34 | Persistent amber with no logged action | D | Breach + chain break | **WOW** | **Core, beat 4** |
| T2-35 | Qualified but left out of the pack | D | Breach with routing | DIFFERENTIATING | Reserve (beat 4; provides the suppressed near-miss) |
| T2-36 | Overdue, extended, ageing; clearance date | D | Breach (persistence) | DIFFERENTIATING | **Core, beat 4** |
| T2-37 | Escalation latency | D | Position (governance KRI) | DIFFERENTIATING | **Core, beat 4** |
| T2-38 | Closed, downgraded or dropped without movement | D | Chain break (effectiveness) | **WOW** | **Core, beat 4** |
| T2-39 | L2 challenge closed then breached | D | Silent failure → breach | DIFFERENTIATING | |
| T2-40 | Self-identification ratio | D | Position | DIFFERENTIATING | |
| T2-41 | SMF structured steps (private) | D | Chain break (owner engagement) | DIFFERENTIATING | |
| T2-42 | Consumer Duty outcome tolerance and completeness | E | Position + breach + chain break | DIFFERENTIATING | |
| T2-43 | Consumer Duty evidence position before the report | E | Chain break (assurance, evidence side) | DIFFERENTIATING | |
| T2-44 | Complaints after change; unowned journey | E | Chain break | DIFFERENTIATING | |
| T2-45 | Inactive fee-payers | E | Position | TABLE-STAKES | |

**Totals:** 45 cards. **WOW 10** (T2-5, 6, 14, 15, 17, 27, 28, 30, 34, 38). **DIFFERENTIATING 29.** **TABLE-STAKES 6** (T2-8, 11, 12, 13, 16, 45).

**Tag discipline.**
- **WOW:** surfaces an enforcement-shaped failure (Starling, Monzo, Metro, Nationwide) that firms find only after the event, from structured data alone.
- **DIFFERENTIATING:** needs a product-owned object: the cascade graph, calibration records, tension or decision register, reportability ledger, pack manifest or precedent tags.
- **TABLE-STAKES:** a competent GRC tool or pack shows it today. It is kept because the board view is incomplete without it.

### 6.2 The 24x7 "AI CRO" set: 12 cards, the demo spine

These are the cards that let a CRO stop reading the daily dump. Between them they cover:
- what moved against appetite;
- what cannot be defended;
- what is breached or reportable;
- whether bad news is travelling.

Each beat ends in a **decide** or **prepare** moment.

| Beat | Question the beat answers | Core cards | Reserve or embedded | Ends in |
|---|---|---|---|---|
| **1. Headroom and growth against control capacity** | "We have room to grow in credit. Can our controls keep pace, and is any trade-off we agreed now outside its terms?" | **T2-1** appetite used by the plan · **T2-5** growth against financial crime capacity · **T2-6** trade-off colliding, with floor check | T2-4 (early warning on the strip) | **Decide:** the board chooses to pace growth or restore capacity. Lowering the control standard is never offered. The pre-CDD "trade-off" is reclassified as a floor |
| **2. Green that is not defensible (chain integrity)** | "This headline is green. Can I defend it?" | **T2-14** feed completeness flips green to "unverified" · **T2-17** attestation signed before the reconciliation ran | T2-15 (sanctions silence, inside the badge) · T2-16 (owner check, inside the badge) | **Prepare:** caveat text for the pack; a re-attestation and remediation request to the owner |
| **3. Restriction test failing; multi-clock reportability drafted for an SMF decision** | "Is the VREQ obeyed across the population, and what must we decide about reporting?" | **T2-27** population test (112 breaches against "flag fired 100%") · **T2-28** the attestation due in 12 days is not supported · **T2-29** ledger: 1 of 4 routes decided | T2-30 (earlier structured signal shown on the ledger row) | **Prepare** the case per route; **a named SMF decides**. The product never files |
| **4. BRC chair: is bad news reaching me?** | "What is persisting with nothing done, what is overdue, how slow is escalation, and what was closed without fixing anything?" | **T2-34** persistent amber with no logged action · **T2-36** overdue and extended, never in a BRC pack · **T2-37** escalation latency median · **T2-38** closed or downgraded without metric movement | T2-35 (override log: 13 qualified, 12 included, 1 removed without reason, which is the **suppressed near-miss** the demo data needs) | **Decide:** the BRC chair puts items on the agenda and commissions a governance review of the escalation route |

**Count:** 3 + 2 + 3 + 4 = **12 core cards**, with 5 reserves (T2-4, T2-15, T2-16, T2-30, T2-35) available inside the same screens.

**Why this set.**
- It contains 8 of the 10 WOW cards.
- Every top-13 Stage 2 item appears, either as a Tier 2 card or as a Tier 2 partial with its hook visible:
  - MB1 → T2-34; MB6 → T2-30; MB4 → T2-6; MB5 → T2-17; MB3 → T2-22 (not in the set; drill only); MB19 → T2-43 (not in the set);
  - MA7 → T2-27; MA8 → T2-14; MA12 → T2-5; MA15 → T2-29;
  - MB7 → T2-41 (not in the set); MB17 → T2-33 (not in the set); MB25 → T2-28.
- The four not in the set are T2-22, T2-43, T2-41 and T2-33. They are drills, kept off the spine to hold the demo at 3–5 screens.

**Demo hook moment.** On each Group 2 card, the honest "cannot tell" line is the hand-off to the Tier 3 story. For example: "This shows no action was logged. Whether the committee discussed it is in the minutes; that is the next module."

**Screen mapping (for Phase 3; indicative only):**
1. **Board Risk View:** beat 1 (strategy strip, scorecard, headroom gauge) and beat 2 (badge flips).
2. **Principal-risk drill:** beat 2 detail (lineage, reconciliation, attestation).
3. **Restrictions and reportability:** beat 3.
4. **Escalation health (BRC chair):** beat 4.

---
## 7. Panel calls (lens disagreements turned into design decisions)

**Lenses:**
- **L1:** UK board NED and BRC chair (buyer resonance).
- **L2:** CRO and second-line framework designer (product IP).
- **L3:** first-line owner plus data and AI architect (feasibility).
- **L4:** UK regulatory and enforcement adviser (defensibility).

Each call records the tension, then the design decision this catalogue takes. Calls marked **[open]** go to the team (section 8.2).

| # | Subject (Stage 2 ref) | Tension | Design decision in this catalogue | Cards affected |
|---|---|---|---|---|
| P1 | **Does a product-owned register count as "structured" under Option A?** (new at Stage 3) | L2 and L1: the tension register, decision register and pack manifest are what make beats 1 and 4 work. L4 and L3: if they are filled by AI reading minutes, that is the join under another name | **Allowed in Tiers 1–2 only when each entry is keyed as structured fields by a named person, with no AI extraction from papers.** AI extraction from minutes into these registers is Tier 3 (H-4, H-26). **[open → D1]** for team confirmation | T2-6, T2-7, T2-22, T2-29, T2-33, T2-34, T2-35 |
| P2 | **Wording on structured partials** (C9, C13) | L1 wants "never discussed" because it lands harder. L4: what is not minuted did not happen for enforcement purposes, but a structured partial cannot see minutes at all | **Fixed copy:** "no action, decision or escalation recorded". Never "not discussed", "ignored" or "suppressed". Every partial card carries a "Can tell / cannot tell" line on its drill | All Group 2 cards |
| P3 | **Fourth beat** (Stage 2 decision 1) | Fold MB1 into beat 2 and MB4 into beat 1, or add a BRC-chair beat | **Taken:** beat 4 is built from structured signals (T2-34, T2-36, T2-37, T2-38). MB4's partial stays in beat 1 (T2-6). The narrative version is the Tier 3 upgrade story | Beat 4 |
| P4 | **£ or % first on headroom; single figure or range** (C11) | L1: one plain number ("£540m of growth left"). L2: a range with denominator, to avoid false precision | **The headline shows the plain number with its denominator. The drill shows the range and the stress view.** Headroom without a denominator is a hard fail | T2-1, T2-8, T2-9 |
| P5 | **Capacity unit** (C12) | FTE (GM, OP) against alerts cleared within SLA (GP L3) against qualified effective capacity. L4: the FCA judged skills and resourcing at Starling, not tooling | **Show two units side by side: qualified FTE and alerts cleared within SLA.** Automation gains are footnoted, never netted silently. **[open → D4]** for the demo default | T2-5 |
| P6 | **Persistence N and amber fatigue** (C10) | GM first-line: perpetual amber fatigue. GM CRO: buffers needed. NED: nothing below a Level 1 threat on the board view. OP L2: narrow bands train people to ignore amber | **Default N = 2 consecutive quarters for Level 2 (B-GM-02), configurable with a named approver.** Fatigue is handled through calibration (T2-20), never by widening amber. The board view shows Level 2 only when it persists or threatens Level 1 | T2-34, T2-35, T2-20, T2-4 |
| P7 | **Badge always on, or only when failing** (C18) | GP L1, GM NED: show only when broken (avoid noise). GP L2: always on (honesty line on every headline) | **The badge is always present but quiet:** a compact four-dot integrity line on every headline (the honesty line in the card anatomy). It expands to a red "unverified" state only when a check fails | T2-14 to T2-17 |
| P8 | **Is a silent sanctions control immediately board-material?** (C19) | NED: only if a Level 1 boundary is threatened. L4: immediately, because of OFSI's "immediately" | **It routes to SMF17 and the CRO the same day (S1), always.** The BRC chair is informed at the CRO's call, not automatically. The reporting decision stays with a named SMF | T2-15 |
| P9 | **Vertical SMF against horizontal journey owner** (C8) | OP L2: one SMF per node. OP L3, GM: failures sit on handoffs | **The cascade graph carries two owner types per node, where relevant:** the accountable SMF (vertical) and the journey risk owner (horizontal). The owner check fails if the SMF is missing; a missing journey owner is a separate chain break (T2-44) | T2-16, T2-44 |
| P10 | **Monthly attestation** (C5) | GM: it sharpens accountability. GP: no outcome evidence. OP L3: burden kills adoption. OP L4: it evidences reasonable steps | **Attest a result ID, not a form. Monthly for financial crime feeds only by default**, labelled `[practice-not-rule]`; other feeds attest on their reconciliation cadence | T2-17, T2-14 |
| P11 | **Over- against under-reporting** (C4) | GP and OP: over-reporting is a governance cost, not an offence. GM CRO and first line: defensive over-reporting invites read-across information requests | **The ledger is over-inclusive in *routes considered*, not in *recommendations*.** Every engaged route must carry a human decision; the AI proposes no default answer. Triage-window default **[open → D5]** (GM: 24–72 hours `[practice-not-rule]`) | T2-29, T2-32, T2-33 |
| P12 | **Does the BRC see the awareness-gap card?** (C4, MB6) | GM panel unresolved. L1 wants it. L4 and legal: the record may be disclosable | **Default: shown to the deciding SMF and the CRO only.** The BRC sees ledger counts. **[open → D6]** with the legal adviser | T2-30 |
| P13 | **Legal-review posture in demos** (C13; Stage 2 decision 2) | Show `[legal-review]` items on synthetic data, or hold them until a legal adviser has reviewed them | **The Tier 2 partials of `[legal-review]` items are demoed on synthetic data** (T2-30, T2-41 private view, T2-28). The Tier 3 narrative versions (H-1, H-2, H-6, H-7, H-8, H-10, H-11, H-25) are described as the extension story, never shown with real minutes. **[open → D3]** for confirmation | T2-28, T2-30, T2-41 |
| P14 | **Headline metric count** (C3) | About 12 (OP NED) against 12–15 (OP CRO) against 10–15 over a schedule of 25–45 (GM) | **Default 12, configurable. A promotion lane shows the full schedule moving** (T2-12). Labelled `[practice-not-rule]`; never hard-coded | T2-12, T1-1.3 |
| P15 | **White-space claim** (C7) | OP, GM NED: clear white space. GM's own table: Protecht is credible in the UK mid-tier | **Demo copy says "poorly integrated and operationally expensive in many firms" (GP), never "nobody does this".** Differentiation is claimed at card level (chain, floor check, integrity over status), not at category level | All WOW cards; positioning |
| P16 | **Policy-to-metric strictness** (C6) | GM: every policy maps to a control and a KRI. GP: evidence can be a test, approval or training record | **Any typed evidence link satisfies the mapping check.** Zero-tolerance statements must have a measurable proxy | T2-18 |
| P17 | **Agentic module** (C14) | GP: governed payments. OP: external agent perimeter, 2027–2028. GM: SS1/23 governance of AI controls | **Only the SS1/23 route is built in Tier 2 (T2-24).** The agent mandate items are Tier 3 (H-30, H-35, H-36). MA27 is a Tier 1 KRI row only. No demo beat | T2-24; T1-9.6 |
| P18 | **Current incident regime** (C15) | GM describes a current regime under CP24/28; OP and GP use Principle 11 and FR7 until PS26/2 / PS7/26 on 18 March 2027 | **Resolved in favour of OP and GP.** GM's current-state description stays `[unverified]` and off screen | T2-9, T2-29, T2-31 |
| P19 | **Enforcement figures that disagree** (C20) | Starling date (CF-17); Monzo count (CF-16); Metro penalty form; APP reimbursement periods (CF-26) | **Use the exact Final Notice figure where one exists (Metro £16,675,200). Show both dates or counts with a `[conflict]` note until verified.** Never quote an APP sector figure without its period | T2-14, T2-27, T2-10 |
| P20 | **Protected-attribute proxies in cohort cards** (compliance lens) | L2 wants cohort insight (Consumer Duty requires it). L4: geography and age slices proxy protected characteristics | **Insight by cohort is permitted with a minimum cohort size. Any differential action by cohort is gated to a human and a risk review, and logged.** Financial crime cohorts use product, channel and account attributes only | T2-10, T2-11, T2-25, T2-42, T2-43, T2-45 |
| P21 | **ICP band** (C1) | GM £2bn–£45bn against the run configuration's £10bn–£65bn | **Confirmed by the user:** tier 2 at £10bn–£65bn; tier 3 (£1bn–£10bn) as a turnkey variant. The tier 3 variant hides T2-27 and T2-28 where no live VREQ exists (OP L3) and keeps T2-8 for societies | T2-8, T2-27, T2-28; illustrative sizing |

---

## 8. Close

### 8.1 Top compliance guardrails to design in

1. **The AI never decides, files, notifies or re-tunes.**
   - Every reportability route needs a named SMF decision, with timestamp, rationale and dissent.
   - Action labels read "prepare" or "propose" only.
   - Threshold and model changes are proposed, approved by the accountable owner and logged (SS1/23 governed change).
   - Enforced in: T2-19, T2-20, T2-27 to T2-30.
2. **Integrity overrides status.**
   - No green on a feed that is unreconciled, stale or unattested; show "unverified".
   - No headroom or coverage figure without a denominator.
   - No restriction shown as compliant because a flag fired.
   - All three are hard fails, enforced in T2-14, T2-17 and T2-27.
3. **Regulatory floors are never tradeable.**
   - The tension register rejects floors (VREQ breach counts, pre-CDD transacting, sanctions coverage) and routes them as breaches.
   - No cost or ROI lens on financial crime. Growth against capacity offers "restore capacity" or "pace growth", never "lower the standard".
   - Enforced in: T2-5, T2-6, T2-2.
4. **Mandatory reporting is visible, not decided.**
   - The cards that touch SUP 15.3, FR7, SUP 15.11, SAR, OFSI, ICO and PS26/2 / PS7/26 are T2-9, T2-14, T2-15, T2-19 and T2-27 to T2-31. Each carries a compliance flag and opens a draft ledger entry.
   - The ledger is append-only.
   - The awareness date is never re-dated by the product.
   - All clock values are `[unverified]` until checked against the texts.
5. **SAR and tipping-off protection.** SAR content lives in a restricted SMF17 workflow. Above SMF17 the only visible state is "SAR question open". No customer-level financial crime detail reaches the board view.
6. **Insight is separated from differential action on cohorts.**
   - Cohort cuts (vulnerability, age, region, channel) are permitted for insight, above a minimum cohort size.
   - Any differential treatment is gated to a human and a risk review, and logged.
   - Financial crime cohorts never use nationality, ethnicity or postcode.
7. **Honest partials.**
   - Every Group 2 card carries its "Can tell / cannot tell" line and Tier 3 hook.
   - Copy says "no action recorded", never "not discussed".
   - Nothing extracted from minutes or papers appears in Tiers 1–2.
8. **SMCR fairness and data protection.**
   - Individual-level SMF trails are private to the SMF first (T2-41); the board sees aggregates only.
   - Challenge and closure analysis stays at business-unit level (T2-39).
   - Speak-up data is excluded from Tiers 1–2.
   - `[legal-review]` items are demoed on synthetic data only.
9. **Practice is labelled as practice.** These are all labelled `[practice-not-rule]`:
   - Level 1/2/3;
   - the 12-headline default;
   - the persistence N and routing rules;
   - monthly attestation;
   - six-monthly SMF attestation;
   - read-across expectations.
10. **Synthetic figures carry `[illustrative]`; precedents are real and posture-tagged.** Engine conflicts on enforcement facts (C20) are shown as conflicts until verified.

### 8.2 Open decisions for the team

| # | Decision | Options | Recommendation | Changes |
|---|---|---|---|---|
| D1 | **Product-owned registers under Option A** (P1) | (a) Allowed when keyed by a named person; (b) excluded from Tiers 1–2 | (a). Without it, T2-6, T2-7, T2-29, T2-33, T2-34 and T2-35 lose their decision, ledger or manifest inputs, and beats 1, 3 and 4 weaken | Data model in Phase 3 |
| D2 | **Persistence N and the routing rules for the demo firm** (P6) | N = 2 quarters (Level 2); or N = 3 | N = 2, shown as configurable, with a named approver | T2-34, T2-35 |
| D3 | **Legal-review posture** (P13) | Synthetic-only demo of the partials; or hold until legal review | Synthetic-only for the Tier 2 partials; the Tier 3 narrative is described, not shown | Beat 3 and beat 4 copy |
| D4 | **Capacity unit default** (P5) | Qualified FTE; alerts cleared within SLA; both | Both, side by side | T2-5 |
| D5 | **Reportability triage window default** (P11) | 24, 48 or 72 hours `[practice-not-rule]` | 24 hours for S1 routes engaging "immediately" clocks | T2-29 |
| D6 | **BRC visibility of the awareness-gap card** (P12) | Deciding SMF and CRO only; or the BRC chair on threshold matters | SMF and CRO only, until the legal adviser confirms | T2-30 |
| D7 | **Level 3 → Level 1 roll-up rule** (G-04; open in the method) | Worst-of; count-of-breaches; weighted | Declare per metric; demo uses worst-of | T2-1, T2-4, T2-20 |
| D8 | **Badge behaviour** (P7) | Always on; failure only | Always on, quiet; red on failure | Every headline |
| D9 | **Tier 3 first release** (section 5) | H-1 and H-2 first; or H-6 first | H-1 and H-2 (escalation join, beat 4 upgrade), then H-6 | Roadmap and sales story |
| D10 | **Theme** (CF-002, carried from Phase 0) | Dark brand palette; light low-chroma | Light for board altitude, with dark for exec demos with verified contrast. Confirm in Phase 3 | UI |

### 8.3 What the beachhead deliberately parks, and why

The beachhead parks **13 merged use cases entirely** (Group 3) and **the narrative half of 23 more** (Group 2).

- **The narrative joins are the product's differentiator, and the reason Tier 3 exists.**
  - MB1, MB6, MB4, MB5 and MB3 were the five top Stage 2 scores, and all are joins.
  - Option A ships their structured partials now (T2-34, T2-30, T2-6, T2-17, T2-22) and keeps the join as the upgrade path.
  - This is honest: the structured partial is defensible on its own, and its "cannot tell" line is the sales hand-off to the next module.
  - Shipping the joins first would put an AI reading of minutes in front of a board before legal review (C13) and before evidence bands are calibrated (C9).
- **Board-behaviour and culture items** (MB12, MB27, MB28, MB32) need minutes or speak-up text.
  - Boards resist being scored.
  - Speak-up data carries anonymity and data-protection limits that a board view cannot honour at small cohort sizes.
  - Parked until a minimum-cohort rule and a chair-only view are designed.
- **Narrative-only checks with no useful structured partial** (MB10, MB18, MB23, MB29, MB31) are parked whole:
  - MB10 needs staff concerns;
  - MB18 needs committee discussion;
  - MB23 needs MI balance in papers;
  - MB29 needs adverse information as text;
  - MB31 needs the fair value reasoning.
  Their adjacent structured cards (T2-13, T2-27) stay in Tier 2.
- **Agentic items** (MA25, MA26, MB30) are parked:
  - agent mandate data barely exists in banks;
  - UK rules do not yet exist (the Mills Review of 06 July 2026 is not a rule);
  - all three engines placed agentic AI as a second module.
  The demo-safe route is T2-24 (SS1/23 model governance). MA27 is a Tier 1 KRI row only.
- **MB33 (vulnerability recording)** needs a DPIA before any build.
- **MA16 (HR-driven Conduct Rule timers)** needs an HR outcome feed outside the substrate. The SUP 15.11 route itself is held in the ledger (T2-29) once the event is logged.

**Recall gaps carried from Stage 2 (not created by the beachhead):**
- Level 3 → Level 1 roll-up method (D7);
- FCA-only firms;
- AI-enabled fraud velocity against fraud appetite (partly T2-13);
- governance of the bank's own permissioned agents;
- the EU agentic variant;
- dedicated capital headroom (covered inside T2-1 and T2-12);
- cyber (T1-2.13 and T2-9 only);
- PX missing, so `[3-source]` is the ceiling.

---

*End of Stage 3. Handoff: this catalogue is the input to Phase 3 (personas, data model, UI spec). No build-spec or UI work is done here.*
