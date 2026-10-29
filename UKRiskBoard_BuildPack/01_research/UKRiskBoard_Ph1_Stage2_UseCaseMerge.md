# UK Risk Board View -- Stage 2 Use-Case Merge

- **Run:** Yaara Risk & Compliance, UK Board Risk View. Primary persona: CRO (SMF4) at board altitude. Intent: sales demo to UK CROs and BRC chairs. Wedge: risk as a strategic lever.
- **Engines merged:** GP (ChatGPT), OP (Claude), GM (Gemini). Perplexity was not run, so the scale is `[3-source]`, `[2-source]` and `[single-source]`. There is no `[4-source]`.
- **Inputs:** the three per-source Stage 1 catalogues, each read in full and kept separate:
  - `UKRiskBoard_Ph1_GP_Stage1_UseCaseMining.md` (18 A, 17 B);
  - `UKRiskBoard_Ph1_OP_Stage1_UseCaseMining.md` (18 A, 14 B);
  - `UKRiskBoard_Ph1_GM_Stage1_UseCaseMining.md` (20 A, 18 B).
- **Coverage reference only:** `UKRISK-stage1-merged-27Oct2026.md`, section M-F and the M-B headings. No use cases were mined from it.
- **Date:** 27 October 2026.

## Result at a glance

| Measure | Count |
|---|---|
| Source use cases merged | 105 (GP 35, OP 32, GM 38) |
| Distinct use cases in the longlist | **70**: 37 Bucket A (MA1–MA37), 33 Bucket B (MB1–MB33) |
| `[3-source]` | 14 (9 A, 5 B) |
| `[2-source]` | 11 (4 A, 7 B) |
| `[single-source -- preserve]` | 45 (24 A, 21 B) |
| Ranked shortlist | 13 (scores of 24 to 27 out of 30; the join bias broke the tie at 24) |
| Source IDs mapped to at least one merged ID | 105 of 105 |

---

## How the merge was run

1. **Read in full, per engine.** Each catalogue was read end to end, including its framing, panel notes and recall note. A working map of the source IDs was built as each one was read.
2. **Strict deduplication key.** Two source use cases were merged only when all five of these matched:
   - archetype;
   - signal or business question;
   - primary user and routed exec;
   - decision or action enabled;
   - whether the join is needed.

   Where any element differed, the use cases were kept separate and tagged `[near-dup: …]`.
3. **Convergence recomputed.** Every Stage 1 use case was `[single]` by construction, because each engine mined only its own report. Support was recounted from what actually appears across the three catalogues. No engine's own tag was carried.
4. **Sub-signals are split out where the decision differs.** One source use case can map to more than one merged ID. Examples: GP's "unused capacity" reading of UC-GP-A1, and OP's "orphan initiative" sub-check of UC-OP-A1.
5. **Geography variants are kept apart.** The agentic-AI items stay separate where one leans on US bank stances (MA26) and another on UK framing (MA25).
6. **Flags are carried, not resolved.** These flags are carried forward from the source catalogues:
   - `[illustrative]` on invented figures;
   - `[scope]` on CB Payments and pre-2021 precedents (from GM);
   - `[practice-not-rule]`;
   - `[conflict]`;
   - `[marketing-grade]`;
   - `[long-tail -- preserve]`.
7. **Scoring ranks the shortlist only.** Nothing in the longlist was pruned by score.

### Merge judgements (stated so they can be challenged)

| # | Judgement | Why |
|---|---|---|
| J1 | **MA15 (reportability ledger) and MB6 (awareness clock) are merged across all three engines.** OP lists SMF16 as primary user with the CRO routed; GP and GM list the CRO first with SMF16 routed | The decision owner (a named SMF, usually SMF16) is the same, and so are the workflow (AI prepares, SMF decides) and the decision (report or not). The order of user and exec reflects whose screen the item sits on, not a different workflow. The variant is recorded in the flags rather than split |
| J2 | **MA5 merges GP's lead-time test (UC-GP-A2) with OP's band-width and green-to-red test (UC-OP-A2)** | Both ask "do our thresholds warn in time?". Both route a second-line calibration proposal to the BRC. GM's leading-indicator tree (UC-GM-A15) stays separate as MA6, because its decision is a first-line review of the driver, not a re-calibration |
| J3 | **MB3 merges GP's and OP's numeric pack check with GM's narrative-softening check** | OP's card already covers both (value, RAG and "commentary characterises the trend differently"), and the decision is identical: correct the paper before it circulates |
| J4 | **MA28 merges GP's and OP's receiving-side APP cards** | Both act on the same receiving-side mule signal. GP proposes a mule review and OP an onboarding control review, both inside SMF17's remit |
| J5 | **MB13 merges GP's complaint-theme × unapproved change (UC-GP-B6) with GM's complaint-theme × change (UC-GM-B10)** | Same join, journey, routed owners and review decision. GP's "no risk-owner approval" condition is kept as a sub-check |
| J6 | **MA22 merges three emerging-risk overlays** | All three ask the same question ("which emerging risks map onto which principal risks, and how fast?"), and all three name the overlay as the hero element. OP's "within horizon but no metric" chain break is kept as a sub-check |
| J7 | **Split: UC-GP-A1 → MA1 and MA2; UC-OP-A1 → MA1 and MA3; UC-OP-A3 → MA9 and MA10** | In each case one sub-signal enables a different decision: deliberate growth, linking an orphan initiative to the RAS, or defining a proxy for every zero statement |
| J8 | **Split: GP-A14 (MA25) and OP-A17 (MA26)** | The brief requires geography variants to stay separate. OP's recommended action is a hold-review policy modelled on Bank of America's stance, and its anchors are US bank positions |
| J9 | **Split: remediation and escalation into MA19, MA20 and MA21, and the minutes join into MB1** | The four differ in signal and decision: backlog clearance trajectory; overdue findings never reaching the board; items filtered out of the pack build; ambers never discussed in minutes |
| J10 | **Split: reasonable steps MB7 (trail or pack) and MB8 (resource escalation)** | GM's card tests whether resourcing strain was escalated and decided. It routes a resource paper to the board, which is a different decision from completing an SMF's trail |
| J11 | **Secondary mappings that do not count towards convergence.** UC-GM-B1 maps first to MB2 and second to MB9. UC-OP-A12 maps first to MA20 and is related to MA19 | GM's card names "issue-to-escalation latency" as one measure in its index (F-GM-02), so it counts as partial second support for MB9: MB9 is `[2-source]` on OP-B8 plus that measure. OP-A12's "known-weakness backlog flat or growing" sub-check shares MA19's signal but routes to a BRC agenda item, not a clearance projection. It is not counted, and MA19 stays single-source |

### Flag legend used in this file

| Flag | Meaning |
|---|---|
| `[3-source]` / `[2-source]` | Independently present in that many engine catalogues (recomputed here) |
| `[single-source -- preserve]` | One engine only; kept |
| `[long-tail -- preserve]` | Thin but commercially interesting; the flag is carried from Stage 1 |
| `[near-dup: X]` | Shares most of the key with X but differs on at least one element; kept separate |
| `[legal-review]` | May create a discoverable record. Fully eligible and **not** down-scored (user decision) |
| `[evidence: product design]` | The mechanism is product design, not precedent-backed. GP applies this label to all its minutes-mining |
| `[agentic -- second module]` | Evidenced as a second module or Tier 3 candidate, not the entry point |
| `[conflict]` | Engines or sources disagree; see section 4 |
| `[scope]` | GM anchor from CB Payments (e-money, not a deposit-taker) or a pre-2021 precedent |
| `[practice-not-rule]` | Firm practice, not regulation |

**Evidence-strength note on minutes and narrative mining.** GP labels every minutes-mining mechanism in its Bucket B as product design: "GP cites no case of minutes omitting an amber". This note is carried on every merged B item with GP support. GM gives the run's only direct precedent for narrative suppression: the Metro sequence, in which an action was deleted from the January 2018 steering-group minutes and actions were dropped after 16 August 2018 (B-GM-02, UC-GM-B1). OP's narrative anchors are Starling's "different committees receiving different information" and the FCA's Consumer Duty review finding of "extensive data without sufficiently explaining". Where a merged B item relies on GP alone, it carries `[evidence: product design]`.

---

## 1. Longlist

Column key:
- **Join?** = needs the substrate × governance-narrative join.
- **MVP suitability** = fit for the 3–5 screen sales demo inside the product boundary.
- **Geo** = UK unless stated.

### 1a. Bucket A -- pipeline use cases (37)

| ID | Name (business question) | Bucket | Archetype | User → exec | Support | Geo | Join? | Source IDs | MVP suitability | Flags |
|---|---|---|---|---|---|---|---|---|---|---|
| MA1 | How much appetite is the growth plan using, and when does a constraint bind? | A | Position (headroom and trajectory) | CRO → board and BRC; CEO; CFO | `[2-source]` | UK | No | UC-GP-A1, UC-OP-A1 | High: demo beat 1 (strategy strip and headroom gauge) | `[near-dup: MA2, MA3, MA4]`; £ versus range unresolved; projection labelled early warning |
| MA2 | Are we leaving deliberate growth unused? (under-used appetite) | A | Position (utilisation floor) | CRO → board; CEO | `[single-source -- preserve]` GP | UK | No | UC-GP-A1 (sub-signal) | Medium: second reading of the headroom gauge | `[long-tail -- preserve]`; `[near-dup: MA1]` |
| MA3 | Which plan initiatives consume appetite with no RAS link? | A | Chain break (cascade mapping) | CRO → board; CFO | `[single-source -- preserve]` OP | UK | No | UC-OP-A1 (sub-check) | High: chain-break marker on the strategy strip | `[near-dup: MA1, MA18]`; CFO versus CRO ownership of the mapping unresolved |
| MA4 | What will cross amber before the next forum, given remediation lead time? | A | Position → breach (velocity) | CRO → CFO and ALCO; first-line owner; BRC chair | `[single-source -- preserve]` GM | UK | No | UC-GM-A1 | High: headroom gauge with threshold cascade | `[near-dup: MA1, MA6]`; "hare" and "tortoise" windows `[practice-not-rule]` |
| MA5 | Which thresholds and early-warning indicators fail to warn in time? (calibration audit) | A | Chain break (calibration) | CRO (second-line designer) → BRC; metric owners | `[2-source]` | UK | No | UC-GP-A2, UC-OP-A2 | Medium: drill (threshold cascade) | `[near-dup: MA6]`; `[practice-not-rule]`; Level 3 → Level 1 roll-up open (G-04); amber-fatigue dispute |
| MA6 | Which leading indicator moved before its lagging partner? | A | Position (leading drift) | CRO → first-line risk owner; BRC for Level 1 | `[single-source -- preserve]` GM | UK | No | UC-GM-A15 | Medium: leading-indicator tree drill | `[near-dup: MA5]`; nine-domain pair table; "early warning, not prediction" |
| MA7 | Is the regulatory restriction obeyed across the whole population, not just where the flag fired? | A | Breach (restriction) and chain break (no test) | CRO → SMF17; SMF16; board | `[3-source]` | UK | No | UC-GP-A3, UC-OP-A4, UC-GM-A4 | High: demo beat 3 | `[conflict]` Monzo count (CF-16) and Starling notice date (CF-17); `[scope]` CB Payments anchor |
| MA8 | Can I defend this figure? Source-to-target completeness, with integrity overriding status | A | Chain break (feed) / silent failure | CRO → SMF17; COO and CTO; CFO for returns | `[3-source]` | UK | No | UC-GP-A4, UC-OP-A6, UC-GM-A3 | High: demo beat 2 | `[conflict]` attestation efficacy (CF-13); count versus value reconciliation dispute; Metro penalty given three ways |
| MA9 | Is sanctions screening covering the whole list, and has any control gone quiet? | A | Chain break (zero-tolerance proxy) / silent failure | CRO → SMF17; CTO; BRC | `[3-source]` | UK | No | UC-GP-A6, UC-OP-A3, UC-GM-A2 | High: chain-integrity badge with ScreeningDenominator (v6) | GP `[long-tail -- preserve]`; dispute over whether a silent sanctions control is immediately board-material (OFSI "immediately") |
| MA10 | Does every zero-appetite statement carry a measurable proxy? | A | Chain break (zero tolerance with no proxy) | CRO → SMF17; risk owners | `[single-source -- preserve]` OP | UK | No | UC-OP-A3 (generalisation) | Medium: mapping check | `[near-dup: MA9, MA18]`; qualitative zero statements are hardest |
| MA11 | Which customer cohorts' cash activity departs from profile while alerts fall? | A | Silent failure (cohort) | CRO → SMF17 | `[single-source -- preserve]` GP | UK | No | UC-GP-A17 | Low: SMF17 territory; silent-failure count at board | `[long-tail -- preserve]`; protected-attribute care on regional slices |
| MA12 | Is growth outrunning financial crime control capacity? | A | Position (capacity headroom) → tension | CRO → CEO and ExCo; board; SMF17; COO | `[3-source]` | UK | No | UC-GP-A5, UC-OP-A5, UC-GM-A6 | High: demo beat 1 | Capacity unit dispute (FTE versus effective capacity); floor never tradeable; `[scope]` Cummings anchor |
| MA13 | Did a rule, parameter or model change touch a control without approval or re-test? | A | Chain break (change) | CRO → CTO and COO; SMF17; model risk | `[3-source]` | UK | No | UC-GP-A7, UC-OP-A8, UC-GM-A9 | Medium: change-lineage drawer on the badge | GP cites "PS6/23"; SS1/23 scope (CF-23); change metadata versus parameter values |
| MA14 | Are AI and ML financial crime models inside the board's model risk appetite? (SS1/23) | A | Position and chain break (model governance) | CRO → model risk committee; SMF17; BRC | `[single-source -- preserve]` GM | UK (EU AI Act and SR 11-7 as contrast) | No | UC-GM-A13 | Low–medium: scorecard row; GM's reframed agentic wedge | `[agentic -- second module]`; `[marketing-grade]` vendor figures |
| MA15 | What may be reportable, on which clock, and who is deciding? | A | Reportability case | CRO ↔ SMF16 (decision owner); SMF17 or SMF4 by matter; board summary | `[3-source]` | UK | No | UC-GP-A8, UC-OP-A9, UC-GM-A10 | High: demo beat 3 | `[conflict]` over- versus under-reporting; CF-10 regime; clocks `[unverified]`; J1 |
| MA16 | Conduct Rule breach notification timers driven by HR outcomes | A | Reportability case (narrow clock) | SMF16 → CRO; HR | `[single-source -- preserve]` OP | UK | No (HR × compliance) | UC-OP-A16 | Low: ledger row; board sees the count | `[long-tail -- preserve]`; timers `[unverified]`; GP and GM carry the SUP 15.11 / REP008 route inside MA15 |
| MA17 | Which board objects have no accountable SMF, or a compromised owner set? | A | Chain break (owner) | CRO → CEO; BRC chair; SMF16; SMF5 | `[3-source]` | UK | No | UC-GP-A9, UC-OP-A7, UC-GM-A8 | High: owner check on the chain-integrity badge | SMCR mappings versioned (CP14/26); vertical versus horizontal ownership; GP independence sub-check |
| MA18 | Which policy or VREQ obligations have no live control, metric or evidence? | A | Chain break (mapping) | CRO → SMF16; policy owners; SMF17 | `[3-source]` | UK | No | UC-GP-A10, UC-OP-A11, UC-GM-A5 | Medium: mapping check, VREQ clauses first | `[conflict]` CF-15 strictness; GM version-drift sub-check; `[scope]` CB Payments |
| MA19 | Will the remediation backlog clear by the committed date? | A | Breach (remediation persistence) | CRO → SMF17; first-line owners; BRC chair | `[single-source -- preserve]` GP | UK | No | UC-GP-A11 (related, not counted: UC-OP-A12 backlog sub-check, see J11) | Medium: exception feed with projected clearance | `[near-dup: MA20, MA21]` |
| MA20 | Which audit findings and known weaknesses are ageing without reaching the board? | A | Breach (persistence) with auto-escalation | CRO → BRC chair; audit committee chair; SMF5 | `[single-source -- preserve]` OP | UK | No | UC-OP-A12 | High: exception feed "unremediated past SLA" | `[near-dup: MA19, MA21]`; BRC versus audit committee ownership |
| MA21 | Which items qualify for the BRC but were filtered out of the pack? (immutable escalation rules) | A | Breach (persistence) with routing | CRO → BRC chair; ERC chair | `[single-source -- preserve]` GM | UK | No | UC-GM-A7 | High: exception feed with override log | `[near-dup: MA20, MB1]`; routing rules `[practice-not-rule]`; persistence N open |
| MA22 | Which emerging risks map onto which principal risks, and how fast are they moving? | A | Position (horizon overlay) with chain break (unmapped) | CRO → BRC; board | `[3-source]` | UK | No | UC-GP-A12, UC-OP-A15, UC-GM-A17 | High as a must-show component; qualifier rather than differentiator | `[practice-not-rule]`; `[conflict]` CF-05, CF-08; OP `[long-tail -- preserve]` |
| MA23 | Which upcoming regulatory obligations have no owner, control or readiness evidence? | A | Chain break (forward mapping) | CRO → SMF16; COO; company secretary | `[single-source -- preserve]` GP | UK | No | UC-GP-A13 | Low–medium: horizon line | `[long-tail -- preserve]`; `[near-dup: MA24]`; consultation versus final status |
| MA24 | Are we ready for 18 March 2027? Shadow classification of incidents and third parties | A | Reportability case (forward-dated) with chain break | CRO → COO and CTO; BRC | `[single-source -- preserve]` OP | UK | No | UC-OP-A14 | Medium: readiness strip feeding the ledger; buying trigger | `[near-dup: MA23, MA29]`; `[conflict]` CF-10; clocks `[unverified]` |
| MA25 | Are agent-initiated payments inside the customer's mandate and the bank's appetite? (UK framing) | A | Breach (mandate) with chain break | CRO → SMF17; CTO; COO; board | `[single-source -- preserve]` GP | UK | No | UC-GP-A14 | Low: emerging-risk row; agent tagging barely exists | `[long-tail -- preserve]`; `[agentic -- second module]`; `[near-dup: MA26]`; liability unsettled |
| MA26 | Agent mandate perimeter with a hold-review policy modelled on US bank stances | A | Breach (mandate scope) | SMF17 → CRO; COO; board | `[single-source -- preserve]` OP | UK with US contrast | No | UC-OP-A17 | Low: 2027–2028 second module; data model only | `[long-tail -- preserve]`; `[agentic -- second module]`; geography variant of MA25; `[conflict]` JPMorgan and Citi |
| MA27 | Are third-party agent or API sessions acting without step-up? (SCA-bypass KRI) | A | Position (leading KRI) | CRO → SMF17; fraud owner; COO and CTO | `[single-source -- preserve]` GM | UK (US bank stance as anchor) | No | UC-GM-A18 | Low: one KRI row, never a beat | `[long-tail -- preserve]`; `[agentic -- second module]`; GM says it barely beats a dashboard |
| MA28 | Is receiving-side APP reimbursement exposure moving against financial crime appetite? | A | Position (harm against appetite) | CRO ↔ SMF17; CFO | `[2-source]` | UK | No | UC-GP-A15, UC-OP-A18 | Medium: the most buildable long-tail item | Both `[long-tail -- preserve]`; `[conflict]` CF-26 figures; never a cost lens |
| MA29 | How much impact-tolerance headroom do our important business services have? | A | Position (headroom against impact tolerance) | CRO → COO and CTO; board | `[single-source -- preserve]` GP | UK | No | UC-GP-A16 | Medium: headroom gauge per service | `[long-tail -- preserve]`; no resilience rule cited in GP |
| MA30 | Is new lending migrating toward high climate-risk collateral? | A | Position (exposure-mix trajectory) | CRO → BRC; CFO | `[single-source -- preserve]` GP | UK | No | UC-GP-A18 | Low: overlay entry | `[long-tail -- preserve]`; `[near-dup: MA31]`; PRA prudential framing; `[conflict]` CF-08 |
| MA31 | Which climate targets are off-track, and what has the board done? | A | Position (target pathway) | CRO → BRC; CFO | `[single-source -- preserve]` GM | UK | No | UC-GM-A19 | Low: scorecard row | `[long-tail -- preserve]`; `[near-dup: MA30]` |
| MA32 | Where else in our estate does this failure pattern exist? (internal read-across) | A | Chain-break propagation | CRO and second line → first-line owners; SMF17; BRC chair | `[2-source]` | UK | No | UC-OP-A10, UC-GM-A11 | Medium: read-across prompt with precedent corpus (v6) | `[near-dup: MB17]`; read-across request dispute (CF-12) |
| MA33 | Are we finding our own problems? (self-identification ratio) | A | Position (governance KPI) | CRO → BRC chair; SMF5; audit committee chair | `[single-source -- preserve]` GM | UK | No | UC-GM-A12 | Medium: one KPI tile with denominator | Gaming risk; no benchmark |
| MA34 | How close are we to the building society nature and funding limits? | A | Position (statutory headroom) | CRO → CFO and ALCO; board | `[single-source -- preserve]` GM | UK (building societies only) | No | UC-GM-A14 | Low: qualifier for a society ICP | `[long-tail -- preserve]` |
| MA35 | Which headline metrics, and is anything in the full RAS schedule moving? | A | Position (promotion lane) | CRO → board; BRC chair | `[single-source -- preserve]` GM | UK | No | UC-GM-A16 | High: RAS headline scorecard (must-show) | `[conflict]` metric count; cap configurable and labelled practice |
| MA36 | Which Consumer Duty outcomes are outside tolerance, and for which cohort? | A | Position and breach (outcome tolerance) | CRO → board; journey owners; SMF16 | `[single-source -- preserve]` OP | UK | No | UC-OP-A13 | Medium | `[near-dup: MB19]`; protected-attribute caution; minimum cohort size |
| MA37 | Are we still charging customers who get no value? (inactive fee-payers) | A | Position (Consumer Duty tolerance) | CRO → SMF16; product owner | `[single-source -- preserve]` GM | UK | No | UC-GM-A20 | Low | `[long-tail -- preserve]`; age-cohort proxy caution |

### 1b. Bucket B -- joins between substrate metrics and governance narrative (33)

| ID | Name (business question) | Bucket | Archetype | User → exec | Support | Geo | Join? | Source IDs | MVP suitability | Flags |
|---|---|---|---|---|---|---|---|---|---|---|
| MB1 | Which persistent ambers has the responsible forum never discussed? | B | Chain break (escalation) / silent failure | CRO → BRC chair; ERC chair | `[3-source]` | UK | Yes | UC-GP-B1, UC-OP-B1, UC-GM-B2 | High: escalation-health index | `[legal-review]` (minutes are a legal record); `[evidence: product design]` on GP's mechanism; `[near-dup: MA21, MB12]` |
| MB2 | Did any risk action disappear or get reworded between forums? | B | Chain break (escalation): the Metro shape | CRO → BRC chair; company secretary; SMF5 | `[single-source -- preserve]` GM | UK | Yes | UC-GM-B1 | Medium: minute-trail drill under the index | `[legal-review]` (mining minutes for dropped actions); the only precedent-backed narrative join in the run |
| MB3 | Are different committees being shown a different number or story for the same metric? | B | Chain break (consistency) | CRO → BRC chair; board secretary | `[3-source]` | UK | Yes | UC-GP-B17, UC-OP-B2, UC-GM-B3 | High: pre-submission pack consistency check | Numeric (GP, OP) and narrative-softening (GM, OP) sub-checks; GP and GM `[long-tail -- preserve]`; J3 |
| MB4 | Is a board-agreed trade-off colliding, and is any "trade-off" actually a regulatory floor? | B | Tension collision | CRO → board and BRC; CEO; first-line product owner | `[3-source]` | UK | Yes | UC-GP-B4, UC-OP-B5, UC-GM-B4 | High: tension register and guardrail pair | Floor check is a hard fail; `[conflict]` CF-25 white space; quantified bounds rarely minuted |
| MB5 | Are owners attesting to evidence, or rubber-stamping? | B | Chain break (attestation) | CRO and second line → metric and feed owners; COO and CTO; SMF17 | `[3-source]` | UK | Yes | UC-GP-B9, UC-OP-B4, UC-GM-B5 | High: attestation segment of the chain-integrity badge | Attestation cycle `[practice-not-rule]`; `[conflict]` CF-13; first-line burden |
| MB6 | When did we first hold information that "reasonably suggests" the matter? | B | Reportability case (clock integrity) | CRO ↔ SMF16; SMF17; BRC chair on threshold matters | `[3-source]` | UK | Yes | UC-GP-B3, UC-OP-B7, UC-GM-B6 | High: chronology strip on the ledger | `[legal-review]` (reconstructing an awareness date); whether the BRC or only the deciding SMF sees it is unresolved; never re-dates; J1 |
| MB7 | Can each SMF evidence reasonable steps for the breaches in their area? | B | Chain break (owner engagement) | CRO → each SMF (private view); CEO; BRC chair (aggregate) | `[2-source]` | UK | Yes | UC-GP-B5, UC-OP-B13 | Medium: trail strip on the owner panel; aggregate only at board | `[legal-review]` (SMF reasonable-steps evidence pack); OP `[long-tail -- preserve]`; framed as protection, not surveillance |
| MB8 | Has the SMF escalated resourcing strain on the record, and did the board decide? | B | Position (capacity) × narrative | CRO, SMF16, SMF17 → board; CEO | `[single-source -- preserve]` GM | UK | Yes | UC-GM-B8 | Medium: resource-escalation timeline behind the strategy strip | `[legal-review]`; `[near-dup: MA12, MB7]`; `[scope]` Sonali Bank 2016 |
| MB9 | How long does bad news take to reach the board? | B | Position (culture KRI) with breach | CRO → BRC chair; board | `[2-source]` | UK | Yes | UC-OP-B8, UC-GM-B1 (latency measure) | Medium: latency line on the escalation-health index | `[practice-not-rule]`; speak-up minimum cohort; first-flag matching is hard |
| MB10 | Were staff raising the problem before the metric showed it? | B | Chain break (escalation) and silent failure | CRO → SMF17; COO; BRC chair | `[single-source -- preserve]` GP | UK | Yes | UC-GP-B2 | High: "concerns open" marker on the badge | `[legal-review]`; `[evidence: product design]` (Metro staff-concern anchor only); anonymity |
| MB11 | Was second-line challenge overruled or left unanswered before a breach? | B | Silent failure (challenge effectiveness) → breach | CRO → BRC chair; SMF5; first-line owner | `[2-source]` | UK | Yes | UC-OP-B12, UC-GM-B7 | Medium: challenge segment of the index | `[legal-review]`; OP `[long-tail -- preserve]`; business-unit level only |
| MB12 | Did the board challenge the reds, or just receive data? | B | Silent failure (governance quality) | CRO → BRC chair; board chair | `[single-source -- preserve]` OP | UK | Yes | UC-OP-B9 | Medium: challenge-coverage line, chair only | Boards resist being scored; `[near-dup: MB1, MB19]` |
| MB13 | Did a technology change break a customer journey? (complaint themes after a change) | B | Chain break (change) × customer narrative | CRO → journey risk owner; CTO; SMF16 | `[2-source]` | UK | Yes | UC-GP-B6, UC-GM-B10 | Medium: drill; board only when a control is touched | GP sub-check: no risk-owner approval; `[near-dup: MA13, MB14]`; J5 |
| MB14 | Where do complaints cluster on journeys nobody owns? | B | Chain break (owner), seen through outcomes | CRO → CEO; SMF16 | `[single-source -- preserve]` OP | UK | Yes | UC-OP-B6 | Medium | `[near-dup: MA17, MB13]`; vertical versus horizontal ownership |
| MB15 | Did the change do what its request said it would? (declared versus actual impact) | B | Chain break (change), narrative-backed | CRO → model risk committee; SMF17 | `[single-source -- preserve]` GP | UK | Yes | UC-GP-B11 | Low–medium: drill | `[near-dup: MA13, MB16]`; `[evidence: product design]` |
| MB16 | Does the deployed value match what the committee approved? | B | Chain break (change), narrative side | CRO → model risk; CTO; risk owner | `[single-source -- preserve]` OP | UK | Yes | UC-OP-B14 | Low: drill only | `[long-tail -- preserve]`; `[near-dup: MA13, MB15]` |
| MB17 | After a new Final Notice, did our read-across actually test the population? | B | Chain break (read-across) | CRO and second line → SMF17; BRC | `[2-source]` | UK | Yes | UC-GP-B16, UC-OP-B10 | High: read-across prompt with precedent corpus | `[near-dup: MA32]`; posture-tag every precedent |
| MB18 | Which risks are committees discussing that are not on the register, and the reverse? | B | Chain break (mapping), raised from the narrative | CRO → BRC | `[2-source]` | UK | Yes | UC-GP-B14, UC-OP-B11 | Medium: candidate band on the emerging overlay | Both `[long-tail -- preserve]`; high false-positive rate; GP reverse sub-check |
| MB19 | Does the Consumer Duty board report survive the outcome evidence? | B | Chain break (assurance claim) | CRO and SMF16 → board; Consumer Duty champion | `[2-source]` | UK | Yes | UC-GP-B7, UC-GM-B13 | High: assertion-to-evidence check | Cohort-proxy caution; the board owns the report |
| MB20 | Did we tell a committee a control was effective when tests said otherwise? | B | Chain break (assurance claim) | CRO → BRC chair; SMF5; audit committee chair | `[single-source -- preserve]` GM | UK | Yes | UC-GM-B12 | Medium: OperationalAssuranceVerdict (v6) beside each claim | `[long-tail -- preserve]`; `[scope]`; GM's weakest-sourced row |
| MB21 | Are actions being closed while the metric they were meant to fix has not moved? | B | Chain break (action effectiveness) | CRO → first-line owners; SMF5 | `[single-source -- preserve]` GP | UK | Yes | UC-GP-B12 | High: "closed, not effective" entry in the exception feed | `[near-dup: MA19, MB20]`; `[evidence: product design]` |
| MB22 | Are we about to publish a figure with an unresolved challenge against it? | B | Chain break (disclosure) | CRO → CFO; audit committee chair | `[single-source -- preserve]` GP | UK | Yes | UC-GP-B10 | Medium: figure-level integrity flag | `[long-tail -- preserve]`; Metro 2022 disclosure precedent; sits with the CFO more than the CRO |
| MB23 | Is our MI about lifting the restriction rather than obeying it? | B | Tension collision (growth versus restriction) | CRO → board; SMF17 | `[single-source -- preserve]` OP | UK | Yes | UC-OP-B3 | High: narrative balance strip on the restriction test | Board resistance; Starling MI anchor |
| MB24 | Are service teams working around a restriction? | B | Breach (restriction) × service narrative | CRO → SMF17; head of customer operations | `[single-source -- preserve]` GM | UK | Yes | UC-GM-B11 | Medium: override lane on the restriction test | `[scope]` CB Payments (199 manual credits) |
| MB25 | Does what we attest to the supervisor match what the population test shows? | B | Reportability case × restriction | CRO and SMF17 → attesting SMF; board | `[single-source -- preserve]` GM | UK | Yes | UC-GM-B15 | High: attestation panel linked to the restriction test | `[legal-review]` (contradiction with a prior attestation); applies only where a VREQ or s166 requires attestation; `[conflict]` K-2 |
| MB26 | Are the conditions the board attached to an appetite waiver being met? | B | Breach (waiver condition) × decision record | CRO → board; first-line owner | `[single-source -- preserve]` GM | UK | Yes | UC-GM-B16 | Medium: decisions panel (screen 3) | `[long-tail -- preserve]`; `[near-dup: MB4]` |
| MB27 | Do speak-up themes and override behaviour tell the same culture story? | B | Position (culture) with required human interpretation | CRO → board; CEO; HR director | `[single-source -- preserve]` GP | UK | Yes | UC-GP-B8 | Low: Indicative band only | `[long-tail -- preserve]`; `[near-dup: MB28]`; anonymity |
| MB28 | Is zero whistleblowing in a high-growth unit healthy or a warning? | B | Position × narrative (culture) | CRO → Whistleblowers' Champion; BRC; HR director | `[single-source -- preserve]` GM | UK | Yes | UC-GM-B9 | Low | `[long-tail -- preserve]`; `[near-dup: MB27]`; data-protection limits |
| MB29 | Are high-risk relationship acceptances re-reviewed when adverse information arrives? | B | Chain break (risk acceptance) | CRO → SMF17 | `[single-source -- preserve]` GP | UK | Yes | UC-GP-B13 | Low: count at board, detail in the SMF17 workspace | `[long-tail -- preserve]`; Barclays anchor |
| MB30 | Are customers saying an agent acted outside what they authorised? | B | Breach (mandate), seen through disputes | CRO → SMF17; SMF16; CTO | `[single-source -- preserve]` GP | UK | Yes | UC-GP-B15 | Low: the data barely exists | `[long-tail -- preserve]`; `[agentic -- second module]`; never a liability verdict |
| MB31 | Is our fair value assessment just a competitor benchmark? | B | Chain break (assurance claim) | CRO → SMF16; product governance | `[single-source -- preserve]` GM | UK | Yes | UC-GM-B14 | Low | `[long-tail -- preserve]`; M-F marks the source as out of scope |
| MB32 | Is challenge thinnest where the business is most profitable? | B | Position × narrative (challenge density) | CRO → BRC chair; remuneration committee | `[single-source -- preserve]` GM | UK | Yes | UC-GM-B17 | Low: a provocation | `[long-tail -- preserve]`; `[practice-not-rule]` |
| MB33 | Are we recording vulnerability in a way that is both useful and lawful? | B | Tension collision (GM pair 4) | CRO → SMF16; DPO | `[single-source -- preserve]` GM | UK | Yes | UC-GM-B18 | Low: DPIA needed before build | `[long-tail -- preserve]`; `[near-dup: MB4]` |

---

## 2. Ranked shortlist (13)

### Scoring rubric

Each criterion is scored 1–5, for a total out of 30. The scores were applied only to rank the shortlist; the longlist is unchanged by them.

| Criterion | 1 | 3 | 5 |
|---|---|---|---|
| **Impact** (for the CRO and BRC chair against the "risk as a strategic lever" wedge) | Nice to know | Changes a committee agenda | Changes a board decision or prevents an enforcement-shaped failure |
| **Underserved-ness** | Firms already have it | Partly served by GRC tools or spreadsheets | No incumbent does it; assembled by hand only after the event |
| **Differentiation** | Substrate-visible and table-stakes | Substrate-visible but needs the product-owned cascade graph (scored 2), or narrative-visible (scored 3) | A join that does not exist today |
| **Cross-engine convergence** | Single-source, theme absent elsewhere | `[2-source]` | `[3-source]` |
| **MVP feasibility** (inside the product boundary, demoable on synthetic data in 3–5 screens) | Data barely exists | Needs AI extraction with human confirmation | Deterministic on data firms hold |
| **Regulatory pull** | Practice only | Firm practice plus supervisory commentary | A rule or Final Notice anchor |

Single-source items score 2 on convergence where the theme appears elsewhere without matching the use case, and 1 otherwise.

**Rules applied.**
- `[legal-review]` items are **not** down-scored, as the user decided.
- Agentic-AI items are scored honestly (see the reserve table).
- Where totals tied, join use cases rank above substrate-only ones. This bias decided the boundary at 24: three join use cases (MB7, MB17, MB25) took the last three places, and the substrate-only MA9 became first reserve.

### Ranking

| Rank | ID | Use case | Bucket | Support | I | U | D | C | F | R | **Total** |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | MB1 | Persistent ambers never discussed | B | 3-source | 5 | 5 | 5 | 5 | 3 | 4 | **27** |
| 2 | MB6 | Awareness clock from the narrative | B | 3-source | 4 | 5 | 5 | 5 | 3 | 5 | **27** |
| 3 | MB4 | Tension register and floor check | B | 3-source | 5 | 5 | 5 | 5 | 3 | 3 | **26** |
| 4 | MB5 | Attestation versus evidence | B | 3-source | 4 | 4 | 5 | 5 | 4 | 4 | **26** |
| 5 | MB3 | Same metric, different number or story | B | 3-source | 4 | 4 | 5 | 5 | 4 | 4 | **26** |
| 6 | MB19 | Consumer Duty board report challenge | B | 2-source | 4 | 4 | 5 | 4 | 3 | 5 | **25** |
| 7 | MA7 | Restriction population adherence test | A | 3-source | 5 | 4 | 2 | 5 | 4 | 5 | **25** |
| 8 | MA8 | Feed completeness, integrity over status | A | 3-source | 5 | 4 | 2 | 5 | 4 | 5 | **25** |
| 9 | MA12 | Growth against financial crime control capacity | A | 3-source | 5 | 5 | 2 | 5 | 4 | 4 | **25** |
| 10 | MA15 | Multi-clock reportability ledger | A | 3-source | 5 | 4 | 2 | 5 | 4 | 5 | **25** |
| 11 | MB7 | SMF reasonable-steps trail | B | 2-source | 4 | 5 | 5 | 4 | 2 | 4 | **24** |
| 12 | MB17 | Final Notice read-across actually tested | B | 2-source | 4 | 4 | 5 | 4 | 3 | 4 | **24** |
| 13 | MB25 | Supervisory attestation against the population test | B | single | 4 | 5 | 5 | 2 | 3 | 5 | **24** |

Column key: I = Impact; U = Underserved-ness; D = Differentiation; C = Convergence; F = MVP feasibility; R = Regulatory pull.

**What the shortlist does to the proposed demo beats.** It supports all three of the run configuration's proposed beats and sharpens them:
- **Beat 1 (headroom and capacity):** MA12, with MA1 as the frame.
- **Beat 2 (chain integrity):** MA8, with MB5 and MA9.
- **Beat 3 (restriction and reportability):** MA7, MB25, MA15 and MB6.

The five highest scorers are all joins: MB1, MB6, MB4, MB5 and MB3. Taken together they make a strong case for a fourth, BRC-chair-facing beat: "is bad news reaching me?", built on the escalation-health index and the tension register. That is a Stage 3 decision. It is flagged here, not taken.

---

### #1 MB1 -- Which persistent ambers has the responsible forum never discussed? (27)

- **Sources:** UC-GP-B1, UC-OP-B1, UC-GM-B2 · `[3-source]` · Bucket B · `[legal-review]` · `[evidence: product design]` (GP mechanism)
- **Signal:** a Level 1 or Level 2 metric has been amber or red for N consecutive periods. The minutes of the forum its routing rules assign it to record no discussion, challenge, decision or owner action, or only "noted". GP adds two variants:
  - discussed at the ERC with an action, but never reaching the BRC although it threatens a strategic objective;
  - in the paper, but "noted" with no action for two meetings in a row.
- **Why it beats a dashboard:** a dashboard can show the amber. It cannot show that nobody governed it. The metric store knows the amber persisted; the minutes know what was discussed. Neither knows on its own that a persistent amber was never acted on. Board secretariats track actions, not silences (GP, OP, GM agree).
- **Differentiation:** requires the join; does not exist today.
- **Best worked example (GP, with GM's real anchor):**
  - A conduct metric, "vulnerable-customer exceptions per 10,000 contacts", reads 14.2, then 15.8, then 16.9 over three quarters, against amber 14 and red 18 `[illustrative]`.
  - It appears in all three BRC papers. Each time the minutes record "the Committee noted the conduct dashboard", with no action or owner. One ERC action from Q1 was never closed.
  - The index reads: "1 persistent amber, 3 cycles, no BRC decision; trajectory reaches red in 2 quarters."
  - Real precedent for narrative suppression (GM, B-GM-02): at Metro, an operations risk board ranked bad data among its top five risks from May to August 2018. It then reassigned and dropped the actions after 16 August 2018. No periodic MI reached the BRC until an external firm was engaged in December 2018.
- **Named UI hero element:** **escalation-health index**, with a "persistent amber, not discussed" list and the option of a waiver with expiry or a remediation decision (OP). GM shows it as a "discussed?" marker on the exception feed.
- **Regulatory hook:**
  - GP (B-GP-11): no rule prescribes "red only to board", and a board can legitimately need an amber that threatens strategy.
  - FCA COCON 4.2, reasonable steps (GP).
  - FCA Consumer Duty board report review (December 2024), criticising minutes that show "generic satisfaction" without active challenge (GM, F-GM-01).
  - FCA Final Notice, Starling: inconsistent MI across committees (OP).
  - The routing cascade is `[practice-not-rule]`.
- **Legal-review condition:** minutes are a legal record. The card must state "no action recorded", never "the minutes are wrong". Access and retention must be agreed (GP L2 and L4; OP L4).
- **Evidence-strength note:**
  - GP's mechanism is product design: GP cites no case of minutes omitting an amber.
  - GM's Metro sequence is the only precedent-backed narrative anchor in the run.
  - Absence of a mention is not proof of absence of discussion (OP L3; GM CRO). Hence evidence bands and secretary confirmation.
- **Score:** Impact 5 · Underserved 5 · Differentiation 5 · Convergence 5 · Feasibility 3 (minutes extraction, alias table for metric names) · Regulatory pull 4 = **27**

---

### #2 MB6 -- When did we first hold information that "reasonably suggests" the matter? (27)

- **Sources:** UC-GP-B3, UC-OP-B7, UC-GM-B6 · `[3-source]` · Bucket B · `[legal-review]` (reconstructing an "awareness" date)
- **Signal:** escalation notes, challenge records, steering-group minutes or committee papers describe the matter earlier than the awareness timestamp logged in the reportability ledger. The clock may therefore have started earlier than recorded. SUP 15.3 runs from "reasonably suggests", not from a completed investigation.
- **Why it beats a dashboard:** the ledger holds one logged date. The earlier signal sits only in narrative records. Today this reconstruction is done by enforcement lawyers after the event, if at all.
- **Differentiation:** requires the join; does not exist today.
- **Best worked example (GM, real chronology):**
  - Metro's "Bad Data" rejections were flagged by staff in 2017, a moderate-band signal.
  - A report confirmed the scale in April 2018, a strong-band signal.
  - The timestamp error was found and logged on 17 April 2019.
  - The FCA was notified on 29 May 2019.
  - So roughly 12 months passed from the strong signal to logged awareness, and 42 days from logged awareness to notification (computed from GM's dates).
  - Contrasts:
    - Starling's sanctions gap was found in January 2023 and notified on 16 February 2023, and Starling was credited for it (GM).
    - Starling's separate VREQ breach was found on 21 July 2022 and notified on 24 August 2022, 34 days later, drawing the FCA's "disappointment" (OP).
  - GP's illustrative case: a second-line challenge on 21 August asks whether duplicate direct-debit collections are systemic; an ERC paper on 02 September describes them; a case is opened on 14 October; the gap is 54 days `[illustrative]`.
- **Named UI hero element:** **reportability decision ledger with a chronology strip.** "First narrative signal" sits beside the logged awareness date (GM). GP's version adds a "days from first mention" column.
- **Regulatory hook:**
  - FCA Principle 11.
  - SUP 15.3.1R ("immediately it becomes aware, or has information which reasonably suggests").
  - PRA Fundamental Rule 7 (wording `[unverified]`).
  - COCON Senior Manager Conduct Rules 3 and 4, as GM describes them.
  - Under-reporting can itself breach openness and co-operation (GP C-GP-06).
- **Legal-review condition:**
  - The product presents a prompt to re-test, never a finding of lateness.
  - The AI never re-dates anything; the deciding SMF records whether the awareness date stands.
  - The record may be disclosable (OP L4, GP L4).
  - Framing (GM): those who raised concerns are evidence of good culture, not targets.
- **Unresolved:** whether the BRC sees this or only the deciding SMF (GM panel).
- **Score:** Impact 4 · Underserved 5 · Differentiation 5 · Convergence 5 · Feasibility 3 (entity matching across notes, with human confirmation) · Regulatory pull 5 = **27**

---

### #3 MB4 -- Is a board-agreed trade-off colliding, and is any "trade-off" actually a regulatory floor? (26)

- **Sources:** UC-GP-B4, UC-OP-B5, UC-GM-B4 · `[3-source]` · Bucket B
- **Signal:** the board minuted a trade-off with bounds and a review date, and one of three things has happened:
  - the guardrail pair has diverged beyond those bounds; or
  - the review date has passed with no re-decision; or
  - the metrics show a tension with no decision record at all.

  **Floor check:** if the guardrail is a restriction or legal requirement (for example a VREQ breach count, or pre-CDD transacting), the pair is rejected as a tension and routed as a breach.
- **Why it beats a dashboard:** a paired chart shows divergence. It cannot say whether the board agreed to it, on what terms, or whether those terms have lapsed. The agreement exists only in minutes.
  - GP found no incumbent publicly demonstrating tension detection (G-GP-05, an absence-of-evidence conclusion).
  - OP's competitor table and GM's capability grid both show "No" across the incumbents (J-OP-05 `[unverified]`; J-GM-03 `[marketing-grade]`).
- **Differentiation:** requires the join; does not exist today. GM calls it its "differentiator feature". GP's L1 calls it "the single strongest 'risk as strategic lever' artifact".
- **Best worked example (GP, with GM's real anchors):**
  - In March the board relaxed onboarding friction for a savings product, within these bounds: conversion up to +5 points; high-risk acceptance below 0.8% of new customers; manual review backlog below 3 days; review in September.
  - By August: conversion +6.2 points; high-risk acceptance 1.1%; backlog 5 days; no September review minuted.
  - The decision record also lists "pre-CDD transacting" as tradeable friction, which the floor check rejects.
  - Register line: "Savings onboarding trade-off: 2 of 3 bounds exceeded; review overdue 27 days; 1 item reclassified as a floor" `[illustrative]`.
  - GM's four named pairs give real anchors: Skipton committed 50% of new lending to first-time buyers; Leeds paid +0.90% above market in 2025; sector-wide extra savings interest was £2.3bn in 2024 (G-GM-02).
- **Named UI hero element:** **tension register and guardrail pair**. Each pair shows the agreed trade-off with its minute reference and date, the current position and the review date. The board view shows collisions only (GM NED).
- **Regulatory hook:**
  - On Monzo, the FCA said that "rapid customer growth must not come at the detriment of compliance".
  - GP's line: "we deliberately accepted more credit risk" can be legitimate; "we deliberately accepted non-compliance with a VREQ" is not (G-GP-04; Starling and Monzo Final Notices).
  - FSB RAF (18 November 2013): appetite works as both accelerator and defence.
  - Joint FCA/ICO statement for GM's pair 4 (see MB33).
- **Tension carried:** boards rarely minute quantified bounds. GP L3 and OP L3 propose a structured decision-record form; OP L2 says the tool should create the habit. CF-25 (the white-space claim) is unresolved: Protecht is credible in the mid-tier.
- **Score:** Impact 5 · Underserved 5 · Differentiation 5 · Convergence 5 · Feasibility 3 (quantified bounds rarely in minutes) · Regulatory pull 3 (no rule; Final Notice language only) = **26**

---

### #4 MB5 -- Are owners attesting to evidence, or rubber-stamping? (26)

- **Sources:** UC-GP-B9, UC-OP-B4, UC-GM-B5 · `[3-source]` · Bucket B
- **Signal:** any of the following, while the reconciliation or test result shows a gap, a material move or no run at all:
  - attestation commentary claims completeness or "no unexplained movements";
  - the commentary is copied unchanged across cycles;
  - the same caveat repeats for three or more periods without action.

  Two sub-checks:
  - **timestamp order:** the attestation was signed before the reconciliation it attests had run (OP);
  - **segregation of duties:** an owner has attested their own control's test (GM).
- **Why it beats a dashboard:** an attestation workflow shows 100% completion. Only joining the text and timestamp to the result shows whether the signature said anything true.
- **Differentiation:** requires the join; does not exist today.
- **Best worked example (OP):**
  - A feed owner attests "Reconciled, no exceptions" for the third month running, with identical text.
  - Over the same period the reconciliation ratio falls from 99.9% to 94.0% `[illustrative]`.
  - In month 2, the attestation is timestamped 3 hours before the reconciliation job completed.
  - The badge reads "attested without evidence".
  - Real anchors:
    - Starling added "daily testing and assurance activity" from 17 January 2023 (OP).
    - Metro's "Bad Data" rejections ran at about 1,352,665 a month before the July 2019 fix (GM).
- **Named UI hero element:** **chain-integrity badge, attestation segment.** It shows "attested, challenged" (GP) or "attested without evidence" (OP) instead of a tick. GM adds an attestation strip with owner, date and commentary flags.
- **Regulatory hook:**
  - SMCR "reasonable steps" and the Duty of Responsibility (FSMA s66A(5); section numbers `[unverified]`).
  - Monthly data attestation is `[practice-not-rule]` (GP D-GP-07, OP D-OP-05, GM D-GM-02).
  - GM's NED: a name and timestamp next to a metric "sharpens accountability".
- **Tension carried:** CF-13 is unresolved. There is no evidence that monthly attestation improves outcomes, and first-line owners warn of fatigue (OP J-OP-04: "the product dies if it is seen as a burden"). GM's CRO adopts monthly attestation for financial crime feeds only, labelled practice.
- **Score:** Impact 4 · Underserved 4 · Differentiation 5 · Convergence 5 · Feasibility 4 (text comparison and timestamps are simple) · Regulatory pull 4 = **26**

---

### #5 MB3 -- Are different committees being shown a different number or story for the same metric? (26)

- **Sources:** UC-GP-B17, UC-OP-B2, UC-GM-B3 · `[3-source]` · Bucket B · GP and GM `[long-tail -- preserve]`
- **Signal:** the same metric for the same as-of date appears with any of the following differences across ERC, BRC and board papers, or against the system of record:
  - a different value;
  - a different RAG status;
  - a different definition;
  - a different narrative (status softened, denominator dropped, trend omitted).
- **Why it beats a dashboard:** a dashboard can be the single source of truth. It cannot audit the documents people actually circulate (OP).
- **Differentiation:** requires the join; does not exist today.
- **Best worked example (OP numeric, GM narrative):**
  - *Numeric:* the ERC paper reports screening coverage of 92% (amber). The BRC paper rounds it to "over 90%, green", using an older as-of date `[illustrative]`.
  - *Narrative:* the ERC paper says "screening backlog 2,100 cases, up 38% on quarter, amber". The BRC paper says "screening operations broadly stable; remediation in hand" `[illustrative]`, a strong-band divergence.
  - Real anchor: at Starling, "different committees receiv[ed] different information" (OP, B-OP-03).
- **Named UI hero element:** **pack consistency check**, run before submission inside the escalation-health index. Differences that are more favourable in the higher forum rank first (OP).
- **Regulatory hook:**
  - FCA Final Notice, Starling.
  - PRA FR6 and the Metro PRA case of 21 December 2021 on reporting governance (OP).
  - SUP 15.6 on false or misleading information to the regulator, by read-across `[inference]`.
  - GM's comparative row: controls "operated weaker in practice than reported to committees" `[scope]`.
- **Score:** Impact 4 · Underserved 4 · Differentiation 5 · Convergence 5 · Feasibility 4 (reliable on templated packs) · Regulatory pull 4 = **26**

---

### #6 MB19 -- Does the Consumer Duty board report survive the outcome evidence? (25)

- **Sources:** UC-GP-B7, UC-GM-B13 · `[2-source]` · Bucket B · `[near-dup: MA36]` (OP's substrate-side outcome tolerances)
- **Signal:** an assertion in the draft annual Consumer Duty board report is contradicted by the evidence for that outcome and cohort, in any of these ways:
  - the outcome metrics contradict it;
  - complaint themes contradict it;
  - late remediation actions contradict it;
  - the minutes show no challenge by the board or the Consumer Duty champion.
- **Why it beats a dashboard:** a Consumer Duty dashboard shows metrics. It cannot read the board's own statement, or show whether the board challenged it.
- **Differentiation:** requires the join; does not exist today.
- **Best worked example (GM, with GP's variant):**
  - GM: the draft claims "customers in financial difficulty receive good support". Journey MI shows the SLA breach rate on vulnerable-support queues at 14%, against a 5% tolerance. Two of five remediation actions are late. The minutes show no champion challenge in three meetings `[illustrative]`.
  - GP's variant: forbearance complaints are up 38% year on year; vulnerable-customer exceptions are at 16.9 against an amber of 14; no measure is linked to "appropriate support" `[illustrative]`.
- **Named UI hero element:** **assertion-to-evidence check on the board report** (GP). GM shows it as a claim-check drill on the Consumer Duty outcome panel (four outcomes × journeys).
- **Regulatory hook:**
  - PRIN 2A.8.3R to 2A.8.5R.
  - FCA, *Consumer Duty board reports: good practice and areas for improvement* (11 December 2024, updated 24 February 2025; CF-18 resolved): a review of 180 firms' first reports.
  - Consumer Duty Focus Areas (07 May 2026 and 24 September 2026).
- **Compliance condition:** a cohort slice by vulnerability is permissible for insight. Any differential action is gated to a human and a risk review. The board owns the report; the AI only suggests wording.
- **Score:** Impact 4 · Underserved 4 · Differentiation 5 · Convergence 4 · Feasibility 3 (linking prose assertions to metrics) · Regulatory pull 5 = **25**

---

### #7 MA7 -- Is the regulatory restriction obeyed across the whole population, not just where the flag fired? (25)

- **Sources:** UC-GP-A3, UC-OP-A4, UC-GM-A4 · `[3-source]` · Bucket A
- **Signal:** any of the following:
  - an account opened for, or a transaction by, a customer in a VREQ or s166 prohibited population, on any product, channel or migration route;
  - a restriction clause with no executable test, or with test coverage below the whole population;
  - adherence measured by "flag fired" rather than by population outcome (a hard fail).
- **Why it beats a dashboard:** the self-built version is exactly what failed. The product's test is independent of the onboarding system's own flag. It carries its own coverage denominator, and a missing test becomes a visible chain break rather than a green tick. A GRC tool stores the VREQ as a document, not as an executable test (OP).
- **Differentiation:** substrate-visible. It needs the product-owned clause-to-test decomposition.
- **Best worked example (GM, with GP's coverage line):**
  - Starling accepted a VREQ on 17 September 2021. It then opened 54,359 accounts for 49,183 high-risk customers between September 2021 and November 2023, including 294 previously exited customers. April 2024 was its first month with zero breaches, 31 months after the VREQ (GM, H-GM-01, K-6).
  - Illustrative replay `[illustrative]`:
    - a challenger's daily test runs over 9,400 new accounts a month;
    - it finds 112 accounts for 104 restricted customers, 97 of them via a newly launched savings pot outside the flag's scope;
    - 3 are previously exited customers;
    - the flag dashboard for the same month reads "flag fired 1,208 times, 100% blocked".
  - GP's board line `[illustrative]`: "Restriction R-03: 37 breaches in 388,000 tested; 24,000 openings untested (partner channel)", not green.
- **Named UI hero element:** **restriction adherence test** (population, test, result and denominator). It shows flag versus population side by side (OP), and "months since last zero-breach month" as a board headline option (GM NED).
- **Regulatory hook:**
  - FCA Final Notice, Starling, £28,959,426. The date is 27 September 2024 or 02 October 2024 (`[conflict]` CF-17).
  - FCA, Monzo, £21,091,300 (07 or 08 July 2025). The count is 34,000+ customers versus 26,325 accounts (`[conflict]` CF-16).
  - CB Payments (23 July 2024), cited for the "flag fired" shape `[scope]`.
  - SUP 15.3.1R and PRA FR7 engaged on breach, for a human decision.
  - Escalation ladder: supervisory letter → s166 → VREQ → enforcement (OP).
- **Score:** Impact 5 · Underserved 4 · Differentiation 2 · Convergence 5 · Feasibility 4 (point-in-time ratings are the hard part) · Regulatory pull 5 = **25**

---

### #8 MA8 -- Can I defend this figure? Source-to-target completeness, with integrity overriding status (25)

- **Sources:** UC-GP-A4, UC-OP-A6, UC-GM-A3 · `[3-source]` · Bucket A
- **Signal:** any of the following:
  - the reconciliation for a feed behind a board metric shows a shortfall beyond tolerance;
  - the shortfall is concentrated in one cohort (for example same-day accounts, a migrated product code or a partnership channel);
  - rejected-record backlogs have aged past their SLA;
  - the reconciliation is stale or unattested.

  Every dependent metric shows "unverified" instead of green.
- **Why it beats a dashboard:** the dashboard is fed by the same pipe, so it reports what the monitoring system saw, not what it did not see. The product makes completeness the gate for showing any status at all.
- **Differentiation:** substrate-visible. It needs product-owned lineage and attestation records.
- **Best worked example (GM, exact enforcement denominators):**
  - Between 06 June 2016 and 17 December 2020, Metro's transaction monitoring system missed 60,483,951 of 1,008,426,668 transactions (about 6%), worth £51.25bn of £675.8bn.
  - A timestamp logic error excluded 166,358 accounts that were opened and used on the same day.
  - The look-back led to 153 SARs (H-GM-01).
  - Illustrative badge `[illustrative]`: "Records reconciled: 94.0% (2,256,000 of 2,400,000), last run 26 October 2026". Same-day accounts are 0% monitored; all other cohorts are 99.97%.
  - OP's board flip `[illustrative]`: "unverified: 1.1m of 18.4m transactions not monitored (6.0%)".
- **Named UI hero element:** **chain-integrity badge (feed check)**, with denominator and last-reconciliation date. The v6 ScreeningDenominator component is paired with it.
- **Regulatory hook:**
  - FCA Final Notice, Metro (12 November 2024): £16,675,200 (£23,821,700 before discount); Principle 3; SYSC 6; MLR 2007 Reg 8.
  - PRA FR2 and FR6 enforcement against Metro (21 December 2021) on COREP.
  - SUP 15.3 significance factors: "delay in identifying or correcting".
- **Tensions carried:**
  - Count versus value reconciliation (GM architect versus regulatory adviser).
  - Tolerance width: GP L4 would set it at zero for structural gaps.
  - Badge always on, or shown only when it fails (GM NED).
  - The Metro penalty appears in three forms; the exact figure is used.
- **Score:** Impact 5 · Underserved 4 · Differentiation 2 · Convergence 5 · Feasibility 4 (lineage from board metric to feed is the build) · Regulatory pull 5 = **25**

---

### #9 MA12 -- Is growth outrunning financial crime control capacity? (25)

- **Sources:** UC-GP-A5, UC-OP-A5, UC-GM-A6 · `[3-source]` · Bucket A
- **Signal:** customer, onboarding or alert growth outpaces qualified financial crime capacity, so capacity ratios or queue age project past amber inside the plan horizon. GM adds a further trigger: a growth-enabling appetite change approved without a recorded capacity check.
- **Why it beats a dashboard:** growth sits in the commercial or finance pack, and capacity in the financial crime MI. Nobody puts them on one time axis with a crossing date. The FCA's own phrase, "did not keep pace with its growth", describes a ratio that firms did not compute (OP).
- **Differentiation:** substrate-visible, as a cross-system ratio. All three engines call it apparently unserved.
- **Best worked example (GP, with GM's throttle precedent):**
  - An illustrative challenger `[illustrative]`:
    - customers grow from 1.2m to 1.9m in four quarters (+58%);
    - case handlers grow from 64 to 71 (+11%);
    - customers per handler rise from 18,750 to 26,760;
    - alert queue median age rises from 6 to 19 days, against an amber of 14.
  - Card: "Growth of 58% against 11% more financial crime capacity; queue age past amber since August; next campaign launches in 6 weeks."
  - Real anchors:
    - Starling grew from about 43,000 customers (2017) to 3.6m (2023); Monzo from about 600,000 (2018) to over 5.8m (2022).
    - Nottingham deliberately cut new mortgage lending from £1.2bn (2024) to £0.9bn (2025) to embed a platform before scaling: a precedent for a board-approved throttle (GM).
- **Named UI hero element:** **growth-versus-capacity paired gauge on the strategy strip** (GP and GM). OP pairs CadenceFeasibility (v6) with the strip's growth line.
- **Regulatory hook:**
  - FCA Final Notices, Starling and Monzo.
  - FCA challenger bank review (22 April 2022): controls "commensurate with a bank's expansion".
  - Starling Final Notice, para 4.15 (senior management lacked AML skills).
  - FCA Principle 3.
  - FSB RAF.
- **Boundary:** the card proposes either restoring capacity or pacing growth. Lowering the control standard is never offered, because a floor is not tradeable.
- **Tensions carried:**
  - The capacity unit: FTE, alerts cleared within SLA, or qualified effective capacity.
  - Automation gains.
  - The ratio can be read as a cost lever (GP L2).
- **Score:** Impact 5 · Underserved 5 · Differentiation 2 · Convergence 5 · Feasibility 4 · Regulatory pull 4 = **25**

---

### #10 MA15 -- What may be reportable, on which clock, and who is deciding? (25)

- **Sources:** UC-GP-A8, UC-OP-A9, UC-GM-A10 · `[3-source]` · Bucket A (narrative twin: MB6)
- **Signal:** a logged event engages one or more notification routes and has no recorded human decision on each route. Three related failures are also flagged:
  - **the Boolean trap:** one route decided while sibling routes are unassessed (GP);
  - an FCA decision recorded without a PRA decision (OP);
  - a "not reportable" decision with no re-evaluation date, or with new facts but no re-test.
- **Why it beats a dashboard:** a self-built tracker records "reported: yes/no" and decides in email. One event spawns several obligations, each with its own clock, owner and evidence. SAR suspicion must stay separate from regulatory materiality, and an immutable, re-testable decision record is needed. That is not a spreadsheet job.
- **Differentiation:** substrate-visible. It relies on the product-owned decision log and a rule library versioned by in-force date.
- **Best worked example (GP):**
  - A data error rolls 2,300 fixed-rate mortgage customers onto a reversion rate without notice. It is found 19 days late, and a senior manager is disciplined `[illustrative]`.
  - Child routes:
    - SUP 15.3 ("immediately");
    - FR7 (consider);
    - SUP 15.11 (SMF Conduct Rule disciplinary action, short timetable);
    - REP008 (annual);
    - SAR (not engaged).
  - On day 4 the ledger shows "1 of 4 routes decided" in amber.
  - Real anchors: OP's Starling 34-day gap (21 July to 24 August 2022); GM's Starling credit for prompt notification (16 February 2023).
- **Named UI hero element:** **reportability decision ledger (multi-clock)**. Each row shows one parent event with its child obligations, and each obligation its clock, owner, status and any dissent. SAR content is kept in a restricted workflow: the board sees only that a SAR question is open (OP).
- **Regulatory hook:**
  - FCA Principle 11; SUP 15.3.1R and 15.3.11R; SUP 15.6.
  - PRA FR7.
  - SUP 15.11 Form C/D and REP008.
  - POCA 2002 (SAR); SAMLA 2018 (OFSI "immediately"); UK GDPR Article 33 (ICO, 72 hours).
  - FCA PS26/2 and PRA PS7/26 from 18 March 2027.
  - Handbook Notice 139 `[single]`.
  - Timers are `[unverified]`.
- **Tensions carried:** over-reporting versus under-reporting (see section 4, C6). CF-10: GM describes the current incident regime under CP24/28.
- **Score:** Impact 5 · Underserved 4 · Differentiation 2 · Convergence 5 · Feasibility 4 · Regulatory pull 5 = **25**

---

### #11 MB7 -- Can each SMF evidence reasonable steps for the breaches in their area? (24)

- **Sources:** UC-GP-B5, UC-OP-B13 · `[2-source]` · Bucket B · `[legal-review]` (SMF reasonable-steps evidence pack) · OP `[long-tail -- preserve]`
- **Signal:** a red or breach on a node mapped to an SMF's Statement of Responsibilities, where the narrative record shows missing steps by that SMF within the window. The steps checked are challenge, action assignment, follow-up, escalation and closure evidence.
- **Why it beats a dashboard:** the SoR says who is accountable and the metrics say when something was wrong. Only the narrative says whether that person acted. SMFs assemble this by hand only once an investigation starts.
- **Differentiation:** requires the join; does not exist today.
- **Best worked example (GP):**
  - The SMF responsible for financial crime systems has 3 reds in two quarters.
  - The trail shows: challenge 2 of 3; action assigned 3 of 3; follow-up 1 of 3; escalation to the BRC 0 of 3; closure evidence 1 of 3 `[illustrative]`.
  - Real anchor (OP): at Starling there was "no single person with sufficient authority and oversight" for the VREQ.
- **Named UI hero element:** **reasonable-steps trail strip on the owner panel** (GP). OP shows it as an evidence drawer on the chain-integrity badge. The SMF sees a private pack; the board sees aggregate coverage only.
- **Regulatory hook:**
  - FCA COCON 4.2.
  - Duty of Responsibility (FSMA s66A/66B; section numbers `[unverified]`).
  - HM Treasury SMCR response (22 April 2026).
  - SMCR Phase 1 (April 2026).
  - Six-monthly SMF attestation is internal practice, not a regulatory certification (D-OP-03, K-2).
- **Legal-review condition:**
  - The pack may itself become evidence.
  - It is framed as the SMF's own protection, not surveillance.
  - Nothing reaches the board before the SMF has reviewed it.
  - OP L4: create it only with legal sign-off.
- **Score:** Impact 4 · Underserved 5 · Differentiation 5 · Convergence 4 · Feasibility 2 (attributing actions in minutes; SMF resistance) · Regulatory pull 4 = **24**

---

### #12 MB17 -- After a new Final Notice, did our read-across actually test the population? (24)

- **Sources:** UC-GP-B16, UC-OP-B10 · `[2-source]` · Bucket B · `[near-dup: MA32]` (internal read-across; GM and OP, no join)
- **Signal:** a new Final Notice's failure shape matches some of our controls (same design, feed or restriction type), and either:
  - no read-across is recorded in the minutes; or
  - the read-across was closed as "no similar issue identified" but no population test of the matched controls is logged after the closure date.
- **Why it beats a dashboard:** the precedent text, our minutes and our control tests sit in three places. Only joining them shows "we said we would look, and we did not". The FCA cited "numerous published FCA notices" as aggravating factors against Nationwide (OP).
- **Differentiation:** requires the join; does not exist today.
- **Best worked example (GP, with OP's variant):**
  - Precedent: FCA, Metro £16.68m (12 November 2024), a monitoring feed omission.
  - The bank's read-across memo of 03 December 2024 concluded "no equivalent gap". Three feeds into monitoring share the same nightly batch design; only one has had a reconciliation test since November 2024 `[illustrative]`.
  - OP's variant: "Nationwide, 12 December 2025 (CDD refresh): 3 matching controls; minuted at BRC on 21 January 2026; 1 of 3 tested since" `[illustrative]`.
- **Named UI hero element:** **read-across prompt linked to the precedent corpus panel** (v6; 12 real UK precedents, posture-tagged).
- **Regulatory hook:**
  - FCA Final Notices: Metro (12 November 2024), Starling, Monzo, Nationwide (12 December 2025, £44,078,500).
  - 13 FCA AML fines on banks since 2021, totalling £300,767,526 (OP).
  - Read-across has no standalone rule (C-GP-06, `[practice-not-rule]`).
  - "Published practice and notices ratchet expectations up" (`[inference]`).
- **Score:** Impact 4 · Underserved 4 · Differentiation 5 · Convergence 4 · Feasibility 3 (matching the failure shape; second-line confirmation) · Regulatory pull 4 = **24**

---

### #13 MB25 -- Does what we attest to the supervisor match what the population test shows? (24)

- **Sources:** UC-GM-B15 · `[single-source -- preserve]` GM · Bucket B · `[legal-review]` (a contradiction with a prior attestation may open a reportability case)
- **Signal:** a periodic VREQ or s166 attestation draft states compliance or progress that the evidence does not support. The evidence checked is the population test, the override log and the remediation milestones.
- **Why it beats a dashboard:** the attestation is narrative and the evidence is data. The check runs statement by statement before signature.
- **Differentiation:** requires the join; does not exist today.
- **Best worked example (GM):**
  - The Q3 2026 draft says "no high-risk onboardings in the period". The population test shows 6, all via a group migration `[illustrative]`.
  - Real anchor: Starling moved from its September 2021 VREQ to zero monthly breaches in April 2024 (31 months), 14 months after the January 2023 discovery (K-6).
- **Named UI hero element:** **restriction adherence test linked to an attestation panel**, with each statement shown as supported, unsupported or partly supported.
- **Regulatory hook:**
  - Starling Final Notice.
  - SUP 15.3.1R on VREQ breaches.
  - FCA Principle 11.
  - It applies only where a VREQ or s166 requires attestation. Six-monthly SMF certification to the regulator is not a rule (K-2; GM tags D-GM-02 `[conflict]`).
- **Why it made the shortlist despite single-source support:** it closes demo beat 3 cleanly (test → attestation → reportability), it is the purest Starling-shape join, and the join bias applies at a tied score.
- **Score:** Impact 4 (firms under a restriction only) · Underserved 5 · Differentiation 5 · Convergence 2 · Feasibility 3 (attestation templates are bespoke) · Regulatory pull 5 = **24**

---

### Scored reserves (not shortlisted; kept in the longlist)

| ID | Use case | I | U | D | C | F | R | Total | Why it is not on the shortlist |
|---|---|---|---|---|---|---|---|---|---|
| MA9 | Sanctions list coverage / silent control | 4 | 4 | 2 | 5 | 4 | 5 | 24 | Tied at 24; the join bias favoured three join use cases. It still features in demo beat 2 as the zero-tolerance proxy inside MA8's badge |
| MB2 | Dropped or reworded actions between forums | 5 | 5 | 5 | 2 | 2 | 4 | 23 | Single-source and hardest to build. It is the only precedent-backed narrative join (Metro), so it is the first Bucket B reserve |
| MB23 | MI about lifting the restriction rather than obeying it | 4 | 5 | 5 | 2 | 3 | 4 | 23 | Single-source. Strong add-on to MA7 as a narrative balance strip |
| MA17 | No accountable SMF / compromised owner set | 4 | 3 | 2 | 5 | 4 | 5 | 23 | SMCR tools partly serve it. It ships anyway as the owner check on the badge |
| MB11 | Challenge overruled or unanswered before a breach | 4 | 5 | 5 | 4 | 2 | 3 | 23 | Topic linking is inferred; first-line pushback |
| MA1 | Appetite used by the growth plan; when does a constraint bind? | 5 | 4 | 2 | 4 | 4 | 3 | 22 | Lower regulatory pull. It is still the wedge's frame for demo beat 1, paired with MA12 |
| MB9 | Bad-news travel time | 4 | 5 | 5 | 3 | 2 | 3 | 22 | First-flag matching is hard; speak-up anonymity. Convergence is 3 because GM's support is one measure inside UC-GM-B1 (J11) |
| MB21 | Actions closed while the metric has not moved | 4 | 4 | 5 | 2 | 4 | 3 | 22 | Single-source; strong exception-feed entry |
| MB10 | Staff concerns open while the metric is green | 4 | 5 | 5 | 2 | 2 | 4 | 22 | `[evidence: product design]`; anonymity |
| MA13 | Change touched a control without approval or re-test | 3 | 4 | 2 | 5 | 3 | 4 | 21 | Control-level at board altitude; drill |
| MA18 | Obligations with no live control, metric or evidence | 4 | 3 | 2 | 5 | 3 | 4 | 21 | Initial mapping effort; partly served by GRC |
| MA22 | Emerging risk overlay | 4 | 2 | 2 | 5 | 5 | 2 | 20 | Qualifier; must-show component regardless |
| MA20 | Audit findings ageing without reaching the board | 4 | 3 | 2 | 2 | 5 | 4 | 20 | Overlaps MA21; exception-feed rule |
| MA21 | Items filtered out of the BRC pack | 4 | 4 | 2 | 2 | 5 | 3 | 20 | Single-source; exception-feed rule |
| MB30 | Agent acted outside what the customer authorised | 2 | 5 | 5 | 2 | 1 | 2 | 17 | `[agentic -- second module]`; the data barely exists |
| MA14 | AI and ML financial crime models inside model risk appetite (SS1/23) | 3 | 3 | 2 | 2 | 2 | 4 | 16 | `[agentic -- second module]`; GM's reframed wedge; scorecard row |
| MA35 | Headline scorecard with promotion lane | 4 | 2 | 1 | 2 | 5 | 2 | 16 | Must-show component, but table-stakes |
| MA25 | Agent payments inside mandate (UK framing) | 2 | 4 | 2 | 2 | 1 | 2 | 13 | `[agentic -- second module]`; agent tagging barely exists |
| MA26 | Agent mandate perimeter (US stance) | 2 | 4 | 2 | 2 | 1 | 1 | 12 | `[agentic -- second module]`; OP: "do not sell compliance with rules that do not exist" |
| MA27 | Agent and API session SCA-bypass KRI | 2 | 2 | 1 | 2 | 2 | 2 | 11 | `[agentic -- second module]`; GM: it "does not, much" beat a dashboard |

Every other longlist item is unscored, as the stage rules allow ("score only the shortlist"). Each one stays in the longlist with its flags.

**Agentic-AI items, scored honestly.** All five agentic items sit at the bottom: MA25, MA26, MA27, MB30 and MA14. The reason is mainly MVP feasibility and present regulatory pull, not irrelevance:
- agent tagging and mandate stores barely exist in bank data (GP L3, OP L3);
- UK rules do not yet exist (the Mills Review recommendations of 06 July 2026 are not rules);
- the Bank of England and FCA survey found 2% broad-autonomy agents, and no more than 9% of firms expecting agents to initiate, execute or block payments within 12 months (GP).

All three engines independently place agentic AI as a second module or emerging-risk row, not the entry point. The two highest-scoring agentic items are:
- MB30 (17), a join that does not exist today, though its data barely exists;
- MA14 (16), GM's reframe, which has regulatory pull today through SS1/23.

MA14 is the most demo-safe route into the theme.

---

## 3. Single-source gems (45, all preserved)

Every `[single-source -- preserve]` item from the longlist is listed below. None is dropped. Items already flagged `[long-tail -- preserve]` at Stage 1 keep that flag in the longlist. MB25 is a single-source item that made the shortlist.

### 3a. GP only (14)

| ID | Gem | Source | Why it is interesting |
|---|---|---|---|
| MA2 | Unused appetite as a board question | UC-GP-A1 (A-GP-06) | It turns the headroom gauge both ways: being far inside appetite may mean profitable growth is being left unused. This is the purest "strategic lever" framing in the run, and the only one that asks the board to take *more* risk |
| MA11 | Cohort cash activity rising while alerts fall | UC-GP-A17 | A silent-failure test on monitoring that does not fire, anchored on NatWest's £264.8m criminal fine (13 December 2021) and Nationwide's personal accounts behaving like business accounts |
| MA19 | Remediation backlog projected clearance date | UC-GP-A11 | It puts a least-squares clearance date against the committed date. Example: 31 months against a committed 12 `[illustrative]`. Anchors: Nationwide £44.08m and Santander £107.7m |
| MA23 | Upcoming obligations as chain objects | UC-GP-A13 | It makes the 18 March 2027 regime and PRA CP14/26 (consultation closes 22 January 2027) chain objects before go-live, and keeps consultation status distinct from final |
| MA25 | Agent lineage card (UK framing) | UC-GP-A14 | GP's eight accountability questions for an agent action, and the mandate stored as machine-readable constraints. Strategically important for module 2 |
| MA29 | Impact-tolerance headroom per important business service | UC-GP-A16 | Applies headroom mechanics to operational resilience. Example: 4 hours 40 minutes of disruption against a 6-hour tolerance `[illustrative]` |
| MA30 | Lending migration toward climate-risk collateral | UC-GP-A18 | Keeps climate inside the credit chain as a prudential concern, not ESG |
| MB10 | Staff concerns open while the metric is green | UC-GP-B2 | Turns the Metro "junior staff raised concerns" anchor into an integrity marker: "the metric says fine, the people say not fine" |
| MB15 | Declared versus actual change impact | UC-GP-B11 | The narrative rationale ("no loss of coverage") is tested against post-change metrics. HSBC anchor (£63.9m, 17 December 2021) |
| MB21 | Actions closed while the metric has not moved | UC-GP-B12 | Action trackers improve when actions are closed, whatever the effect. Strong exception-feed entry |
| MB22 | Publishing a figure with an open challenge | UC-GP-B10 | Distinct precedent: the Metro £10.0m disclosure fine (12 December 2022). Routes to the CFO and audit committee |
| MB27 | Culture card with required human interpretation | UC-GP-B8 | Separates "worse culture" from "better willingness to report", and never scores more reports as worse |
| MB29 | High-risk acceptances not re-reviewed after adverse information | UC-GP-B13 | Barclays c.£42m (16 July 2025; WealthTek and Stunt & Co). Detail stays in the SMF17 workspace |
| MB30 | Disputed agent payments, inside versus outside mandate | UC-GP-B15 | Separates a mandate-design or customer-understanding problem from a control failure. The product never gives a liability verdict |

### 3b. OP only (11, plus one OP-distinctive sub-check)

| ID | Gem | Source | Why it is interesting |
|---|---|---|---|
| MA3 | Plan initiatives with no RAS link | UC-OP-A1 (sub-check) | A cascade chain break at the very top of the spine: a business current account launch in the plan with no RAS line and no financial crime metric `[illustrative]` |
| MA10 | Every zero statement needs a proxy | UC-OP-A3 (generalisation) | Generalises the Starling sanctions lesson to every "no appetite" statement, including qualitative ones such as reputational harm |
| MA16 | Conduct Rule timers driven by HR outcomes | UC-OP-A16 | The trigger is an HR event that compliance often learns about late. Timers are `[unverified]` |
| MA20 | Audit findings ageing without reaching the board | UC-OP-A12 | Anchor: Starling's November 2018 internal audit report was not conveyed "to either Starling's Board or the Authority". The item cannot be suppressed |
| MA24 | 18 March 2027 shadow-classification back-test | UC-OP-A14 | A fixed-date buying trigger (J-OP-04). TSB anchor: £48,650,000 (20 December 2022) |
| MA26 | Agent mandate perimeter (US-stance variant) | UC-OP-A17 | Carries the Bank of America hold-review stance and the Mills Review (06 July 2026). Positioned as a 2027–2028 module |
| MA36 | Consumer Duty outcome tolerance with five-element completeness strip | UC-OP-A13 | Enforces threshold, owner, action, due date and success measure: the gaps the FCA found in its review of 180 reports |
| MB12 | Did the board challenge the reds? | UC-OP-B9 | Board challenge quality, shown to the chair only. The FCA explicitly looks for recorded challenge |
| MB14 | Complaints clustering on unowned journeys | UC-OP-B6 | Horizontal ownership gaps: three functions each green, 62% of complaints citing handoffs `[illustrative]` |
| MB16 | Approved versus deployed parameter value | UC-OP-B14 | A strong, cheap join where minutes record values: "approved 7,500; deployed 9,500" `[illustrative]` |
| MB23 | MI about lifting the restriction rather than obeying it | UC-OP-B3 | The exact Starling narrative: MI focused on "how the VREQ could be reduced or removed" while 54,359 accounts breached. Shows the board looking the wrong way |
| (MA5 sub-check) | Green-to-red jump as a calibration failure | UC-OP-A2 | Kept inside the `[2-source]` MA5, but OP-distinctive: amber band narrower than volatility; green-to-red with no amber period |

### 3c. GM only (20)

| ID | Gem | Source | Why it is interesting |
|---|---|---|---|
| MA4 | Projected amber before the next forum, net of remediation lead time | UC-GM-A1 | Uses the committee calendar and "hare" versus "tortoise" velocity windows. Fires 6 weeks before the BRC would otherwise see it `[illustrative]` |
| MA6 | Leading-indicator tree per domain | UC-GM-A15 | GM's nine-domain leading and lagging pair table is the richest indicator library in the run |
| MA14 | Board model risk appetite overlay (SS1/23) | UC-GM-A13 | GM's reframed agentic wedge: governance of AI-driven financial crime controls rather than external agents. Flags a fall in SARs after a model "improvement" |
| MA21 | Immutable escalation rules with override log | UC-GM-A7 | Replays Metro: under a 90-day SLA rule, the bad-data item would have surfaced in August 2018, about four months before the external engagement |
| MA27 | Agent and API session SCA-bypass KRI | UC-GM-A18 | A leading fraud KRI. GM itself says it barely beats a dashboard; kept for recall |
| MA31 | Climate pathway on or off track | UC-GM-A19 | Leeds openly reported being off track on three climate targets before re-baselining to 2034 |
| MA33 | Self-identification ratio | UC-GM-A12 | An objective measure of first-line maturity (E-GM-02). The only governance-health KPI of its kind in the run |
| MA34 | Building society nature and funding limits | UC-GM-A14 | Statutory headroom specific to the ICP: 75% nature limit; 50% funding limit, with wholesale "well below 31.5%" in practice |
| MA35 | Headline scorecard with promotion lane | UC-GM-A16 | Resolves the metric-count dispute in the product: a configurable cap, with any full-schedule Level 1 metric that moves promoted, and a stated reason |
| MA37 | Inactive fee-paying customers | UC-GM-A20 | A price-and-value outcome tolerance. Example: 6.8% inactive against 4% tolerance; £410k `[illustrative]` |
| MB2 | Dropped or reworded actions between forums | UC-GM-B1 | **The run's only precedent-backed narrative join:** Metro's January 2018 minute deletion and the post-16 August 2018 drop. `[legal-review]` |
| MB8 | Resource escalation on the record | UC-GM-B8 | Shows the SMF's exposure (no escalation) and the board's (no decision). Sonali Bank / Steven Smith 2016 `[scope]` |
| MB20 | Committee assurance claims against test outcomes | UC-GM-B12 | "Operating effectively" stated after a failed test. Uses the v6 OperationalAssuranceVerdict |
| MB24 | Service teams working around a restriction | UC-GM-B11 | Catches off-system workarounds that override logs miss. CB Payments (199 manual credits) `[scope]` |
| MB25 | Supervisory attestation against the population test | UC-GM-B15 | **Shortlisted (#13).** Closes demo beat 3 from test to attestation to reportability |
| MB26 | Appetite waiver conditions | UC-GM-B16 | Waiver conditions live only in minutes. Feeds the persona's screen 3 decisions panel |
| MB28 | Zero whistleblowing in a high-growth unit | UC-GM-B9 | Silence as a signal. Leeds "Your Voice" anchor (8.4/10; 1,653 respondents) |
| MB31 | Fair value assessment that is only a competitor benchmark | UC-GM-B14 | The FCA rejected "roughly in line with competitors" reasoning |
| MB32 | Profit blind spot | UC-GM-B17 | Asks whether challenge is thinnest where profit is highest (Chapelle). A provocation for the BRC chair |
| MB33 | Vulnerability evidence against data minimisation | UC-GM-B18 | GM's guardrail pair 4. Needs a DPIA before build |

*Count check: 14 GP + 11 OP (the twelfth OP row is a sub-check inside the `[2-source]` MA5, listed for visibility and not counted) + 20 GM rows = 45 single-source IDs. The 20 GM rows include MB25, which is on the shortlist.*

---

## 4. Contradictions and tensions (for human resolution, not averaged)

### 4a. Contradictions the brief named

| # | Subject | Competing positions | Affects | Suggested resolver |
|---|---|---|---|---|
| C1 | **ICP tier ranges** | GM's J-GM-01 table gives tier 2 as £10bn–£65bn, but its own product implication targets "Tier 2 and Tier 3 building societies (assets £2bn–£45bn)". The run configuration uses tier 2 at £10bn–£65bn and tier 3 at £1bn–£10bn `[confirm]` | MA34 relevance; demo sizing for MA1, MA7, MA12 and MA8 (illustrative firms of £22.4bn and £30bn); whether the tier 3 turnkey variant includes restriction testing (OP L3: many tier 3 firms have no live VREQ) | User. Confirm the ICP band before Stage 3 |
| C2 | **JPMorgan and Citi on agentic AI** | GP: JPMorgan's restriction is "not just any outside agent", and Citi's 28 July 2026 paper envisages agent-executed transactions, contradicting the broad prohibition claim (I-GP-07, I-GP-08; `[conflict]`). OP: JPMorgan, Citi and Bank of America restrict *third-party* agents (October 2026), and the claim is true only for third-party agents. GM: "confirmed" that they block third-party agents, relying on trade and crypto press (K-4). Merged verdict CF-29: partly supported | MA26 (US-stance variant), MA27, MA25, MB30 | Verify against the banks' own terms of use before any demo copy cites them |
| C3 | **Headline metric count** | OP L1 (NED): about 12. OP L2 (CRO): 12–15 with drill-down. GP: no cap; 8–15 primary. GM: 10–15 headlines over a full Level 1 schedule of 25–45 (its CRO says 30+), with the full suite "legally required" to be board-approved annually (no rule cited). OP: 7–10 principal risks imply about 10–30 Level 1 metrics. Merged verdicts: CF-02 `[unresolved-conflict]`; CF-27 "not supported as a rule; partly supported as practice" | MA35, MA1, MA5; the RAS scorecard default | Product position already set: configurable cap, default about 12, labelled practice. **Open:** the demo default and whether the full schedule is shown |
| C4 | **Over- versus under-reporting** | GP and OP: no text penalises over-reporting; it is a governance cost, not an offence, so GP L4 prefers an over-inclusive engine. GM's regulatory adviser treats late notification as career-ending (Principle 11, FR7, Senior Manager Conduct Rules 3 and 4). GM's CRO and first-line owner fear defensive over-reporting bringing read-across information requests and a "supervisory watch-list" (C-GM-02). CF-12: compatible, with a possible supervisory cost `[inference]` | MA15, MB6, MA32, MB17 | User and legal adviser. Also decide the triage-window default (GM: 24–72 hours `[practice-not-rule]`) and whether MB6 is shown to the BRC or only to the deciding SMF |

### 4b. Further tensions surfaced by the engines' panels

| # | Subject | Competing positions | Affects |
|---|---|---|---|
| C5 | Does monthly attestation work? (CF-13) | GM: mature UK firms run it and it sharpens accountability (trade source). GP: frequency varies, with no evidence it improves outcomes. OP L3: rubber-stamping, and "the product dies if it is seen as a burden". OP L4: it evidences reasonable steps | MB5, MA8 |
| C6 | Must every policy map to a metric? (CF-15) | GM: every policy and VREQ maps to at least one control and one KRI, and a clause cannot be "Active" otherwise. OP: each statement maps to a metric or test. GP: too strong; evidence can be a control test, approval, training or qualitative assurance | MA18, MA10 |
| C7 | Strength of the white-space claim (CF-25) | OP: no one combines strategy linkage, tension, SMCR and reportability. GM and GP's NED: clear white space. GM's own table: Protecht is strong in the UK mid-tier. GP's CRO: large banks may approximate this with bespoke tooling. GP's safe claim: "poorly integrated and operationally expensive in many firms" | MB4, MA1, MA5, positioning |
| C8 | Vertical SMF versus horizontal journey ownership | OP L2: one SMF per node. OP L3 and GM D-GM-03: failures sit on handoffs, so a horizontal risk owner is needed per journey. Unresolved: does the cascade graph carry two owner types per node? | MA17, MB14, MB13 |
| C9 | Should the product measure board behaviour? | GP L1 and OP L1: "is bad news reaching me?" is the most valuable signal, but scoring the board's own challenge will be resisted. OP L3 and GM's CRO: minutes are brief, so absence is not proof. GM's regulatory adviser: what is not minuted did not happen for enforcement purposes. Working compromise: evidence bands, secretary confirmation, chair-only visibility | MB1, MB12, MB23, MB11, MB32 |
| C10 | Amber fatigue versus early warning; persistence N | GM's first-line owner: Level 3 bands set too sensitive create "perpetual amber fatigue". GM's CRO: without buffers, fast risks breach Level 1 before management can meet. GM and GP NED: nothing below a Level 1 threat belongs on the board view. OP L3: wider bands "hide" problems. OP L2: narrow bands train people to ignore amber. Open: N, and who sets the default | MA4, MA5, MA21, MB1 |
| C11 | £ or % first on headroom; single figure or range | GP L1 and OP L1: one plain number ("£150m of growth left"). GP L2 and OP L2: a range with denominator and stress capacity, to avoid false precision | MA1 |
| C12 | Capacity unit | FTE (GM, OP) versus "alerts cleared within SLA" (GP L3) versus qualified effective capacity. Automation gains distort the ratio. GM's regulatory adviser: the FCA judged skills and resourcing at Starling, not tooling | MA12 |
| C13 | Legal exposure of narrative cards | GP L4 and OP L4: an awareness timeline and a reasonable-steps pack may become discoverable evidence; create them only with legal sign-off. OP L2: the regulator will reconstruct the timeline anyway. GM's NED: wary of SMFs building defence files against the board. GM's regulatory adviser: that is SMCR's design. **By user decision, these stay eligible and are not down-scored; carried as `[legal-review]`** | MB1, MB2, MB6, MB7, MB8, MB10, MB11, MB25 |
| C14 | What the agentic second module actually is | GP: a narrowed wedge, governing human and AI-initiated payments and testing mandate adherence. OP: a 2027–2028 module for the external agent mandate perimeter; build the data model now (L2), but do not demo it (L1). GM: not external agents at all, but SS1/23 governance of AI-driven financial crime controls. All three agree it is not the entry point | MA14, MA25, MA26, MA27, MB30 |
| C15 | Current operational incident regime (CF-10) | OP and GP: PS26/2 and PS7/26 apply from 18 March 2027, with Principle 11 and FR7 until then. GM: immediate notification on an impact-tolerance breach now, under PS21/3, SS1/21, SS2/21, PS16/24 and "CP24/28". GM does not mention PS26/2 or PS7/26. Resolved in favour of OP and GP; GM's current-state description `[unverified]` | MA15, MA24, MA29 |
| C16 | SS1/23 scope and strictness (CF-23) | OP: formally targets firms with internal model approval; others may adopt it. GM: banks are "not permitted" to let self-learning models re-tune production thresholds without validation `[inference]`. GP cites model risk guidance as "PS6/23 (17 May 2023)" alongside SS1/23 | MA13, MA14, MB16 |
| C17 | Climate classification (CF-08) | OP and GP: at Leeds, climate is emerging or cross-cutting. GM: climate is a principal risk. Brand rules require PRA prudential framing in all cases | MA30, MA31, MA22 |
| C18 | Count versus value reconciliation; badge always on or only when failing | GM's architect: counts only (cheap and robust). GM's regulatory adviser: value too, because Metro's scale was stated in £51.25bn. GP L1, GM NED and GP's sanctions L1 want the badge visible only when broken. GP L2 wants a permanent badge check | MA8, MA9 |
| C19 | Is a silent sanctions control immediately board-material? | GM's NED: only if a Level 1 boundary is threatened. GM's regulatory adviser: immediately, because of the OFSI "immediately" clock. GP L4: any coverage gap is potentially notifiable | MA9 |
| C20 | Enforcement figures and dates that disagree across engines | Starling Final Notice date: 27 September or 02 October 2024 (CF-17). Monzo breach count: 34,000+ customers versus 26,325 accounts (CF-16). Metro FCA penalty: £16,675,200 / £16.67m / £16.68m. APP reimbursement: 88% / £173m versus 89% / £243m versus 88% / £316m (CF-26, different periods). Monzo Final Notice date: 07 or 08 July 2025 | Worked examples in MA7, MA8, MA28, MB6, MB17 |
| C21 | Practitioner claims (verify list) | Six-monthly SMF certification to the regulator: not a rule (all three). Building societies "about 25%": partly supported; measure-dependent (CF-28). "12–18 months to build a board framework": GM confirmed, OP and GP unverifiable (CF-31). "30 minutes to under 20 seconds": not supported as stated (CF-32) | Copy on all demo screens; MB25, MB7 |

---

## 5. Coverage check

### 5a. Theme coverage against M-F (research-level merged corpus)

Each theme in M-F is checked against the longlist. "Context" means the theme is research background that is not itself a use case. Context themes are carried inside hooks, anchors or flags rather than as a card. Mapping a context theme to a hook is not counted as coverage of a use case.

| M-F theme | Where in M-B | Longlist coverage | Status |
|---|---|---|---|
| FSB RAF definitions and the strategy link | M-A-01 | MA1, MA3 | Covered |
| Terminology (RMF, RAF, RAS, KRI, KCI, RCSA, RCM) | M-A-02 | Context: vocabulary across all cards | Context |
| Level 1/2/3 is practice, not rule | M-A-03 | MA5, MA35 (flag `[practice-not-rule]`) | Covered |
| Nested thresholds and buffers | M-A-04 | MA4, MA5, MA1 | Covered |
| Rolling non-financial metrics up the levels | M-A-05 | MA5 (OP roll-up sub-check), MA4 (GM "hardest engineering problem") | **Partial**: no engine supplies a method (gap G-04) |
| Zero tolerance and proxies | M-A-06 | MA9, MA10 | Covered |
| Calibrating amber and red; wider lower-tier bands; amber fatigue | M-A-07 | MA5, MA4, MB1 | Covered (no calibration method evidenced anywhere) |
| Number of metrics | M-A-08 | MA35; C3 | Covered |
| Strategy, planning and ICAAP links | M-A-09 | MA1, MA3 | Covered |
| Credit appetite as a growth lever | M-A-10 | MA1, MA2 | Covered |
| Appetite as a throttle | M-A-11 | MA12 (Nottingham throttle anchor), MA2 (reverse reading) | Covered |
| Matching growth to control capacity | M-A-12, M-E-05 | MA12, MB8 | Covered |
| Leading and lagging indicator library | M-A-13 | MA6, MA5 | Covered |
| FCA guidance for solo-regulated firms | M-A-14 | Hooks only (Principle 3 and SYSC in MA12, MA18) | **Recall gap (thin)**: no use case specific to FCA-only firms |
| PRA rule anchors | M-A-15 | Hooks across MA1, MA4, MA13, MA15 | Context |
| Disclosure versus internal packs | M-B-01 | MA22 (narrative disclosure export convention), MB22 (figure integrity before publication) | Covered, thinly, on the export side |
| Firm-by-firm disclosures (15 firms) | M-B-03 to M-B-17 | Anchors in MA1 (Coventry), MA4 (Nationwide, Nottingham LCR), MA35 (Nationwide, Leeds, Nottingham), MA22 (Metro, Coventry), MB4 (Skipton, Leeds) | Context |
| Sector benchmarks (branches, fair value premium) | M-B-18 | MB4 (Leeds +0.90%, £2.3bn sector premium), MB31 | Fair value covered; branch benchmark is context only |
| Escalation filtering | M-B-19 | MA21, MB1 | Covered |
| Suppression of bad news (Metro) | M-B-20 | MB2, MB1, MB9, MB10 | Covered |
| Principle 11 and SUP 15 | M-C-01 | MA15, MB6 | Covered |
| PRA FR7 | M-C-02 | MA15 | Covered |
| SUP 15 amendments in 2026 | M-C-03 | MA15 (rule library versioned by in-force date) | Covered |
| Incident and third-party regime from 2027 | M-C-04 | MA24, MA23, MA15; C15 | Covered |
| Conduct Rule notifications | M-C-05 | MA16, MA15 | Covered |
| SARs | M-C-06 | MA15 (restricted workflow) | Covered |
| OFSI and ICO | M-C-07 | MA15 (GM clock table), MA9 | Covered |
| Notification timing cases (Starling, Metro) | M-C-08 to M-C-10 | MB6, MA15 | Covered |
| Under- and over-reporting; read-across | M-C-11 | MA15, MA32, MB17; C4 | Covered |
| Defensible decision step | M-C-12 | MA15 | Covered |
| One event, many clocks | M-C-13 | MA15 | Covered |
| SMCR architecture | M-D-01 | MA17, MB7 | Covered |
| SMCR reform timeline | M-D-02 | MA23 (CP14/26), MA17 (versioned mappings) | Covered |
| The six-monthly certification claim | M-D-03 | Labels in MB7, MB25; C21 | Covered |
| Risk owner versus control owner | M-D-04 | MA17 (GM sub-check) | Covered |
| Horizontal and vertical ownership; line of sight | M-D-05 | MB14, MB13, MA17; C8 | Covered |
| Monthly attestation | M-D-06 | MB5, MA8; C5 | Covered |
| The IIA model | M-E-01 | MA17 (independence), MB11 | Covered |
| Leeds three-lines example | M-E-02 | MA17 hook (GP) | Context |
| Metric suites by line | M-E-03 | MA33 (Line 3 suite), MA20 | Covered |
| Independence of internal audit | M-E-04 | MA17 (GP independence-breach sub-check) | Covered |
| Controls outpaced by growth | M-E-05 | MA12 | Covered |
| Under-resourced second line | M-E-06 | MB8 | Covered |
| Reliance on external reviews | M-E-07 | MA33 | Covered |
| Audit findings not reaching the board | M-E-08 | MA20 | Covered |
| Consumer Duty board report | M-F-01 | MB19, MB12 | Covered |
| Outcomes by cohort and vulnerability | M-F-02 | MA36, MB33 | Covered |
| Fair value | M-F-03 | MB31, MA37 | Covered (M-F marks the source as out of scope) |
| Journey ownership | M-F-04 | MB14, MB13 | Covered |
| Culture and non-financial misconduct | M-F-05 | MB27, MB28, MB9, MA16 | Covered |
| Data versus judgement | M-F-06 | MB27 (mandatory interpretation), MB28 | Covered |
| Policy-to-metric linkage | M-G-01, M-G-02 | MA18, MA10; C6 | Covered |
| Metric tensions | M-G-03, M-G-04 | MB4, MB23, MB33 | Covered |
| Tools for detecting conflicts | M-G-05 | MB4 differentiation; C7 | Covered |
| Enforcement cases (13) | M-H-01 to M-H-15 | MA7 (Starling, Monzo, CB Payments), MA8 (Metro FCA, Metro PRA), MA9 (Starling), MA11 (NatWest), MA13 (HSBC), MA19 (Santander, Nationwide), MA24 (TSB), MB22 (Metro 2022), MB29 (Barclays), MB17 (precedent corpus) | Covered. Recall gap carried from M-F: no building society case beyond Nationwide |
| UK agentic AI statements | M-I-01 | MA25, MA26, MB30 | Covered |
| Survey on AI and agent adoption | M-I-02 | MA25 (worked example), MB18 (theme anchor) | Covered |
| FSB agentic practices | M-I-03 | MA26 hook (`[unverified]`) | Covered thinly |
| EU and US positions | M-I-04 | MA26 (US), MA14 (EU AI Act and SR 11-7 as contrast) | **Partial**: no EU-variant use case; EU not researched to primary standard |
| Liability and the APP regime | M-I-05, M-I-06 | MA28, MB30, MA25 | Covered |
| US bank stances | M-I-07 | MA26, MA27; C2 | Covered |
| Speed and scale of AI fraud | M-I-08 | MA27 (KRI), MA22 ("AI-enabled threats" overlay entry) | **Recall gap (thin)**: no dedicated use case for AI-enabled fraud velocity against fraud appetite |
| Latency benchmarks | M-I-09 | MA25 (detection-to-human latency limit) | Covered as a sub-signal; no benchmark exists |
| SS1/23 | M-I-10 | MA13, MA14, MB16 | Covered |
| Vendors | M-I-11 | MA14 (`[marketing-grade]` anchors) | Context |
| First-party bank agents | M-I-12 | MA14 (model risk governance only) | **Partial**: governance of the bank's own permissioned agents has no dedicated use case |
| Number of building societies and market shares | M-J-01, M-J-02 | Context (ICP); C21 | Context |
| Statutory nature and funding limits | M-J-03 | MA34 | Covered |
| Market tiers | M-J-04, M-J-05 | Context; C1 | Context |
| Buyers and triggers | M-J-06, M-J-07 | MA24 (fixed-date trigger), MB17 and MA32 (peer Final Notice trigger), MA17 (FCA Register SMF changes) | Context, reflected in cards |
| Competitors | M-J-08, M-J-09 | MB4 differentiation; C7 | Context |
| Partnership programmes | M-J-10 | None | Context (not a use case) |
| Claims 1–7 | K, M-E | C3, C21, C2 | Covered in contradictions |
| Synthesis: board view, qualifiers, requirements, agentic verdict | M-S-01 to M-S-04 | Shortlist and must-show components (MA1, MA35, MA22, MA8, MA7, MA15, MB4); C14 | Covered |
| Questions for a former CRO | M-J register | Open items in C3, C5, C10, C11, C12 | Context |

**Archetype coverage.** All five units in the methodology appear in the longlist:
- position: MA1, MA4, MA12 and others;
- breach: MA7, MA19, MA20, MA21, MB24, MB26;
- chain break: owner MA17; feed MA8; attestation MB5; mapping MA18; restriction MA7; change MA13;
- tension collision: MB4, MB23, MB33;
- reportability case: MA15, MA16, MA24, MB6, MB25.

The methodology's silent-failure detection is covered by MA9, MA11 and MA8.

**Recall gaps named.**
1. **Level 3 → Level 1 roll-up method** (G-04). It appears only as a sub-check (MA5) and a stated difficulty (MA4). No engine supplies a method, so the gap is in the research, not the merge.
2. **FCA-only (solo-regulated) firms.** There is no distinct use case, only Principle 3 and SYSC hooks. It matters if the ICP includes FCA-only specialist lenders or e-money firms.
3. **AI-enabled fraud speed and scale.** Only a single KRI (MA27) and an overlay entry. No card measures fraud velocity against fraud appetite.
4. **Governance of the bank's own permissioned agents.** This is reached only through model risk (MA14). The engines treat first-party agents as context.
5. **EU agentic variant.** There is no EU-specific use case, because no engine researched the EU to primary standard. It is held as contrast only.
6. **Prudential capital and liquidity positions.** CET1, leverage, NSFR and ICAAP headroom are covered generically by MA1 (capital as a binding constraint), MA4 (LCR), MA35 (NSFR promotion) and MB22 (CET1 headroom figure). No engine mined a dedicated capital-headroom card. Thin, but within the generic position archetype.
7. **Cyber.** Present only through MA6 (mean time to patch, privileged phishing) and MA29 (vulnerabilities past SLA).
8. **PX missing** (carried from M-F). A fourth independent view is absent throughout, so `[3-source]` is the ceiling.

### 5b. Mapping check: all 105 source use case IDs → merged ID

"Primary" is the merged ID that counts towards convergence. "Also" lists secondary mappings (split sub-signals or partial support; see J7 and J11).

#### GP (35: 18 A, 17 B)

| # | Source ID | Primary merged ID | Also |
|---|---|---|---|
| 1 | UC-GP-A1 | MA1 | MA2 (unused-capacity sub-signal) |
| 2 | UC-GP-A2 | MA5 | — |
| 3 | UC-GP-A3 | MA7 | — |
| 4 | UC-GP-A4 | MA8 | — |
| 5 | UC-GP-A5 | MA12 | — |
| 6 | UC-GP-A6 | MA9 | — |
| 7 | UC-GP-A7 | MA13 | — |
| 8 | UC-GP-A8 | MA15 | — |
| 9 | UC-GP-A9 | MA17 | — |
| 10 | UC-GP-A10 | MA18 | — |
| 11 | UC-GP-A11 | MA19 | — |
| 12 | UC-GP-A12 | MA22 | — |
| 13 | UC-GP-A13 | MA23 | — |
| 14 | UC-GP-A14 | MA25 | — |
| 15 | UC-GP-A15 | MA28 | — |
| 16 | UC-GP-A16 | MA29 | — |
| 17 | UC-GP-A17 | MA11 | — |
| 18 | UC-GP-A18 | MA30 | — |
| 19 | UC-GP-B1 | MB1 | — |
| 20 | UC-GP-B2 | MB10 | — |
| 21 | UC-GP-B3 | MB6 | — |
| 22 | UC-GP-B4 | MB4 | — |
| 23 | UC-GP-B5 | MB7 | — |
| 24 | UC-GP-B6 | MB13 | — |
| 25 | UC-GP-B7 | MB19 | — |
| 26 | UC-GP-B8 | MB27 | — |
| 27 | UC-GP-B9 | MB5 | — |
| 28 | UC-GP-B10 | MB22 | — |
| 29 | UC-GP-B11 | MB15 | — |
| 30 | UC-GP-B12 | MB21 | — |
| 31 | UC-GP-B13 | MB29 | — |
| 32 | UC-GP-B14 | MB18 | — |
| 33 | UC-GP-B15 | MB30 | — |
| 34 | UC-GP-B16 | MB17 | — |
| 35 | UC-GP-B17 | MB3 | — |

#### OP (32: 18 A, 14 B)

| # | Source ID | Primary merged ID | Also |
|---|---|---|---|
| 36 | UC-OP-A1 | MA1 | MA3 (orphan-initiative sub-check) |
| 37 | UC-OP-A2 | MA5 | — |
| 38 | UC-OP-A3 | MA9 | MA10 (proxy-for-every-zero generalisation) |
| 39 | UC-OP-A4 | MA7 | — |
| 40 | UC-OP-A5 | MA12 | — |
| 41 | UC-OP-A6 | MA8 | — |
| 42 | UC-OP-A7 | MA17 | — |
| 43 | UC-OP-A8 | MA13 | — |
| 44 | UC-OP-A9 | MA15 | — |
| 45 | UC-OP-A10 | MA32 | — |
| 46 | UC-OP-A11 | MA18 | — |
| 47 | UC-OP-A12 | MA20 | MA19 (related backlog sub-check; not counted, J11) |
| 48 | UC-OP-A13 | MA36 | — |
| 49 | UC-OP-A14 | MA24 | — |
| 50 | UC-OP-A15 | MA22 | — |
| 51 | UC-OP-A16 | MA16 | — |
| 52 | UC-OP-A17 | MA26 | — |
| 53 | UC-OP-A18 | MA28 | — |
| 54 | UC-OP-B1 | MB1 | — |
| 55 | UC-OP-B2 | MB3 | — |
| 56 | UC-OP-B3 | MB23 | — |
| 57 | UC-OP-B4 | MB5 | — |
| 58 | UC-OP-B5 | MB4 | — |
| 59 | UC-OP-B6 | MB14 | — |
| 60 | UC-OP-B7 | MB6 | — |
| 61 | UC-OP-B8 | MB9 | — |
| 62 | UC-OP-B9 | MB12 | — |
| 63 | UC-OP-B10 | MB17 | — |
| 64 | UC-OP-B11 | MB18 | — |
| 65 | UC-OP-B12 | MB11 | — |
| 66 | UC-OP-B13 | MB7 | — |
| 67 | UC-OP-B14 | MB16 | — |

#### GM (38: 20 A, 18 B)

| # | Source ID | Primary merged ID | Also |
|---|---|---|---|
| 68 | UC-GM-A1 | MA4 | — |
| 69 | UC-GM-A2 | MA9 | — |
| 70 | UC-GM-A3 | MA8 | — |
| 71 | UC-GM-A4 | MA7 | — |
| 72 | UC-GM-A5 | MA18 | — |
| 73 | UC-GM-A6 | MA12 | — |
| 74 | UC-GM-A7 | MA21 | — |
| 75 | UC-GM-A8 | MA17 | — |
| 76 | UC-GM-A9 | MA13 | — |
| 77 | UC-GM-A10 | MA15 | — |
| 78 | UC-GM-A11 | MA32 | — |
| 79 | UC-GM-A12 | MA33 | — |
| 80 | UC-GM-A13 | MA14 | — |
| 81 | UC-GM-A14 | MA34 | — |
| 82 | UC-GM-A15 | MA6 | — |
| 83 | UC-GM-A16 | MA35 | — |
| 84 | UC-GM-A17 | MA22 | — |
| 85 | UC-GM-A18 | MA27 | — |
| 86 | UC-GM-A19 | MA31 | — |
| 87 | UC-GM-A20 | MA37 | — |
| 88 | UC-GM-B1 | MB2 | MB9 (issue-to-escalation latency measure; counted, J11) |
| 89 | UC-GM-B2 | MB1 | — |
| 90 | UC-GM-B3 | MB3 | — |
| 91 | UC-GM-B4 | MB4 | — |
| 92 | UC-GM-B5 | MB5 | — |
| 93 | UC-GM-B6 | MB6 | — |
| 94 | UC-GM-B7 | MB11 | — |
| 95 | UC-GM-B8 | MB8 | — |
| 96 | UC-GM-B9 | MB28 | — |
| 97 | UC-GM-B10 | MB13 | — |
| 98 | UC-GM-B11 | MB24 | — |
| 99 | UC-GM-B12 | MB20 | — |
| 100 | UC-GM-B13 | MB19 | — |
| 101 | UC-GM-B14 | MB31 | — |
| 102 | UC-GM-B15 | MB25 | — |
| 103 | UC-GM-B16 | MB26 | — |
| 104 | UC-GM-B17 | MB32 | — |
| 105 | UC-GM-B18 | MB33 | — |

**Mapping result.**
- **105 of 105 source IDs map** to at least one merged ID: 35 from GP, 32 from OP, 38 from GM.
- **No source ID is unmapped.**
- **Every merged ID** (MA1–MA37, MB1–MB33) has at least one source ID. Sixty-seven merged IDs are reached by a primary mapping. MA2, MA3 and MA10 are reached through secondary mappings, because each is a sub-signal split out of a source use case under J7.
- **Four source IDs carry a secondary mapping:** GP-A1, OP-A1, OP-A3 and GM-B1. OP-A12 also carries an uncounted "related" link to MA19 (J11).

---

## Decisions for the user before Stage 3

1. **A fourth demo beat?** The top five scores are all joins: MB1, MB6, MB4, MB5 and MB3. Option: add a BRC-chair beat, "is bad news reaching me?" (escalation-health index plus tension register), alongside the three proposed beats. Alternatively, fold MB1 into beat 2 and MB4 into beat 1.
2. **Legal-review posture for the demo.** Decide whether the `[legal-review]` cards are shown with synthetic data only, or held back from CRO demos until a legal adviser has reviewed them. The cards are MB1, MB2, MB6, MB7, MB8, MB10, MB11 and MB25. Their scores are unaffected either way.
3. **ICP band (C1)** and **headline metric default (C3)**. Both change the illustrative firm sizes and the default scorecard.
