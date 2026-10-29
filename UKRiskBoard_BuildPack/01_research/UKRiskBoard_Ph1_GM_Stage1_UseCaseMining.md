Engine: GM (Gemini) -- Stage 1 per-source use-case mining

# UK Risk Board View -- Stage 1 Use-Case Mining (source: GM Stage 0 report)

- **Run:** Yaara Risk & Compliance, UK Board Risk View; primary persona CRO (SMF4) at board altitude; intent sales demo; governance compliance plus executive; engines run GP, OP and GM (PX not run, proceeding with three by user decision).
- **Source mined:** the GM Stage 0 report only (finding IDs A-GM-01 to K-7 plus its Synthesis). No other engine report and no merged corpus was read.
- **Date of this pass:** 27 October 2026.
- **Flags used:** `[illustrative]` invented figure; `[NEW -- beyond file]` added beyond the GM file; `[long-tail -- preserve]` thin but kept; `[single]` appears once in GM; `[scope]` CB Payments (an e-money firm, not a deposit-taker) or a pre-2021 precedent; `[practice-not-rule]` firm practice, not regulation; `[conflict]` GM itself records conflicting evidence; `[marketing-grade]` vendor claim as GM tags it.
- **Citation rule applied:** GM's inline citation markers cannot be mapped reliably to its works-cited list, so sources are named only where GM's own text names them (Final Notices, annual reports, URLs in "Source:" lines). Symbols lost in the export are left as lost and are not reconstructed.

## Framing

This run read GM as a forensic, enforcement-led source. Its strongest material is not the board taxonomy (Section B) but the mechanics of failure in Section H and the paragraphs that feed it: the exact Starling, Metro, Monzo and CB Payments timelines, counts and denominators (39 of 3,088 designated persons screened; 60,483,951 of 1,008,426,668 transactions unmonitored; 54,359 accounts for 49,183 high-risk customers; 199 manual credits), the reportability chronology contrast (Starling notified six days after reconfiguring; Metro 42 days after finding the timestamp error), and the Metro minute-deletion sequence. GM also contributes distinctive structural material that the other anchors in the run configuration do not obviously carry: the ERC → BRC → Board filtering rule set with "persistent Level 2 amber for two or more consecutive quarters" (B-GM-02), the nine-domain leading/lagging pair table (A-GM-05), the four named guardrail pairs including vulnerability against UK GDPR minimisation (G-GM-02), building society statutory nature and funding limits (J-GM-01), the self-identification ratio (E-GM-02), dual-axis horizontal/vertical ownership (D-GM-03), a full notification clock table including SUP 15.11 Form C/D and REP008 (C-GM-01), and a sceptical verdict on the agentic-AI entry point (Synthesis 4). This pass therefore treats the five pipeline fields as an assurance pipeline (requirement → evidence → sufficiency → attestation → gap/escalation), puts the enforcement shapes on the substrate side in Bucket A, and in Bucket B builds the joins GM points at but does not name as joins: minutes against action logs, attestation commentary against reconciliation counts, complaint narratives against restriction populations and change logs, and committee claims against control test outcomes. GM's figures are reused as anchors; every invented figure is marked `[illustrative]`; CB Payments and pre-2021 precedents are tagged `[scope]`; and every card respects the product boundary (AI drafts and challenges, never decides reportability, files, notifies or re-tunes; human gate and audit log on every action; cohort-level joins; practice labelled as practice; no cost or ROI trade-off against financial crime floors).

---

# Bucket A -- pipeline use cases that beat a self-built dashboard

### UC-GM-A1 -- Headroom and trajectory on nested thresholds: "What will cross amber before the next BRC?"

- **Archetype:** Position (headroom plus trajectory), escalating to Breach.
- **Bucket:** A (substrate-side).
- **Signal:** a Level 1 or Level 2 metric that is still green but whose rate of change projects an amber crossing before the next scheduled forum, after allowing for remediation lead time.
- **Cadence/trigger:** daily for "hare" risks (liquidity, deposit outflows); monthly for "tortoise" risks (credit, conduct); re-run on every metric refresh.
- **Primary user → routed exec:** CRO (SMF4) → CFO and ALCO for liquidity and capital; first-line risk owner for credit; BRC chair when an L1 crossing is projected before the BRC.
- **Provenance:** A-GM-02, A-GM-05, A-GM-01, Synthesis 1 (item 2: "4-quarter directional trajectory arrows, and velocity warnings").

**1. Data aggregation (requirement)**
- *Substrate inputs:* RAS and limit register holding, per metric, capacity, red (board limit), amber (trigger) and operating limit with calibration rationale; KRI time series for Level 1 and Level 2 metrics (for example LCR, NSFR, wholesale funding ratio, 7-day notice and instant-access outflow velocity, retail deposit pricing spread against top-5 competitors, share of new lending above 90% LTV or 4.5x LTI); forum calendar (ALCO, ERC, BRC, board dates); remediation lead-time assumptions per metric.
- *Interaction inputs:* none required for detection. Optionally the ALCO or ERC minute that recorded the calibration rationale, used only as the evidence link behind the threshold.

**2. Baseline creation (evidence)**
- *Dimensions:* principal risk × Level (1/2/3) × legal entity × business line × time.
- *Normal:* nested thresholds as GM describes them: amber sits inside red, and Level 2 and Level 3 metrics carry progressively wider amber bands so that a deteriorating business-unit trend triggers remediation "weeks or months before" the Level 1 red (A-GM-02) `[practice-not-rule]`. Normal movement is a rolling band per metric, with the window length set by velocity class: GM's "hares" (boundary and liquidity risks) take short windows, its "tortoises" (operational and misconduct losses with long lags) take long windows (A-GM-05).
- *Seasonality:* savings maturities, ISA season, mortgage completion cycles and known one-offs (for example a funding-scheme repayment) are declared in the calibration rationale, never handled by widening amber.

**3. Dynamic detection (sufficiency)**
- Rule-based least-squares projection over the declared window. Flag when *projected date of amber crossing* is earlier than *next forum date + remediation lead time*.
- Separate velocity alert while still green, as GM's product implication asks: "velocity-of-change alerts that flag rapid movement toward a threshold even while the metric remains green" (A-GM-02).
- Integrity override: if the feed behind the metric is unreconciled or unattested (UC-GM-A3), status is shown as "unverified", never green.

**4. Distillation (attestation)**
- *Suppressed:* projections with too few points or poor fit; movements fully explained by a declared seasonal pattern; metrics already in an approved remediation plan with a dated owner action, unless velocity accelerates.
- *Ranked by:* (time to threshold − remediation lead time), then Level (L1 over L2), then principal risk materiality.
- *Who attests:* the metric owner attests to the reconciliation behind the value; second line challenges the projection; the AI projection note is marked advisory and labelled "early warning, not a prediction".

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* a business-question card ("Will liquidity headroom hold until the BRC on 10 December 2026?") with appetite set vs actual vs projected, the denominator, the days-to-amber figure and the remediation lead time.
- *Recommended action:* propose a pre-emptive ALCO review or a first-line remediation plan before the forum.
- *Draft artifact:* a one-page ALCO or ERC paper section stating the projection, its window and its fit.
- *Human gate:* the CRO accepts the card before it routes; the receiving forum chair decides action. Audit log records acceptance and route.
- *Named hero element:* **headroom gauge** (appetite set vs actual vs forecast, with denominator) paired with the **threshold cascade**.

**Why it beats a self-built dashboard:** a bank dashboard shows today's RAG. It does not hold the nested threshold set with its rationale, does not project against the committee calendar and remediation lead time, and does not demote a green to "unverified" when the feed is broken. GM's CRO lens says high-velocity risks "will breach Board Level 1 limits before management can convene" without these buffers (A-GM-02).

**Differentiation:** substrate-visible.

**Worked example:** a tier 2 building society holds LCR internal amber at 140% and red at 120% `[illustrative]` (for context, GM reports Nationwide's 12-month average LCR at 169% and Nottingham's at 172% in 2024, B-GM-01). After a competitor rate rise, instant-access outflows run at £180m a week against a normal £60m `[illustrative]`. Spot LCR falls from 158% at 4 points a week `[illustrative]`. The least-squares projection puts the amber crossing in about 4.5 weeks; the next BRC is in 9 weeks and the funding-plan lead time is 3 weeks `[illustrative]`. The card fires 6 weeks before the BRC would otherwise have seen it, while the metric is still green.

**Regulatory/governance hook:** GM cites PRA SS31/15 (ICAAP and SREP) and SS24/15 (liquidity and funding) as expecting firms to calibrate early warning indicators and recovery triggers "well ahead of regulatory minima so management has time to act" (A-GM-02); FSB, *Principles for an Effective Risk Appetite Framework* (18 November 2013) and the PRA Rulebook (ICAA 3.1 and General Organisational Requirements 2.1) for cascaded limits (A-GM-01). Level 1/2/3 nomenclature is `[practice-not-rule]`.

**Feasibility (panel view):**
- *Data needed:* RAS register with all four threshold points and rationale; daily or monthly KRI series; forum calendar.
- *Hardest part:* agreeing remediation lead times per metric and declaring the Level 3 → Level 1 roll-up rule for non-financial metrics, which GM's CRO calls "the hardest engineering problem in risk design" (A-GM-01).
- *False-positive risk:* medium. Seasonal outflows and one-off funding events will trigger projections unless declared in the rationale.
- *Disagreement:* the first-line risk owner warns of "amber fatigue" from bands set too sensitive (A-GM-02); the CRO argues that without buffers fast risks breach L1 before management can meet; the NED wants only projections that threaten an L1 boundary on the board view. Left unresolved: the card supports both by routing L2 projections to ERC and only L1 projections to the BRC.

---

### UC-GM-A2 -- Silent-control detector: "Has any control gone suspiciously quiet?"

- **Archetype:** Chain break (silent failure).
- **Bucket:** A (substrate-side).
- **Signal:** alert output from a screening or monitoring control falls to zero or below its expected band for its population, or the control's rule base covers a fraction of its reference list.
- **Cadence/trigger:** daily count check; weekly list-coverage check; immediate re-run after any change touching the control.
- **Primary user → routed exec:** CRO (SMF4) and SMF17 → SMF17 for investigation; COO and CTO for configuration; BRC if the silence exceeds one reporting cycle.
- **Provenance:** H-GM-01 (Starling row), C-GM-02, D-GM-04, Synthesis 3 item 4 ("Zero-Alert / Silent Control detector"), Synthesis 2 ("controls over the controls").

**1. Data aggregation (requirement)**
- *Substrate inputs:* alert counts per control, split by type (individual-name sanctions, entity sanctions, transaction monitoring scenario, fraud rule); screened population counts by segment (for example residency or citizenship); reference list sizes (consolidated sanctions list entries) and the count of active rule records built from them; screening frequency settings (for example post-onboarding re-screen interval); control register; change log entries touching each control.
- *Interaction inputs:* none required.

**2. Baseline creation (evidence)**
- *Dimensions:* control × alert type × customer segment × channel × week.
- *Normal:* an expected alert rate per 10,000 screened per alert type, from a trailing window; expected ratio of active rule records to reference list entries (target 1:1); expected screening frequency (as configured and approved).
- *Seasonality:* list-update events (new designations) raise expected alerts; quiet periods for small books are handled by rates and multi-period rules, not single-week zeros.

**3. Dynamic detection (sufficiency)**
- Alert count for any type at zero, or below the lower band, for N consecutive periods (N set by the firm).
- Rule coverage ratio below 1 (active rule records ÷ reference list entries).
- Screening frequency differs from the approved setting.
- A step-change in alert volume within 14 days of a change log entry on that control (hands off to UC-GM-A9).

**4. Distillation (attestation)**
- *Suppressed:* drops explained by an approved, validated change whose expected effect was documented in advance (still shown in the audit log, not on the board view).
- *Ranked by:* control criticality (sanctions first, then transaction monitoring, then fraud), duration of silence, population exposed.
- *Who attests:* the control owner attests that the control is operating; second line challenges any attestation made during a flagged silence; an AI sufficiency note is marked.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* "Is individual sanctions screening actually producing alerts?" with expected vs actual alerts, the denominator of screened customers, the coverage ratio and days silent. The metric's chain-integrity badge turns to "unverified".
- *Recommended action:* propose a second-line configuration test and a re-screen of the affected population; open a reportability triage case (UC-GM-A10) in draft.
- *Draft artifact:* investigation note to SMF17 with the timeline and population.
- *Human gate:* SMF17 accepts the investigation; any reportability decision is a named SMF's. Audit log on all steps.
- *Named hero element:* **ScreeningDenominator** (v6, built but not wired) inside the **chain-integrity badge**.

**Why it beats a self-built dashboard:** dashboards report alert volumes as workload, where fewer alerts look like good news. This card treats silence as a risk, checks the rule base against the reference list and ties the drop to the change log. GM's point is that "automated dashboards frequently display 'green' simply because the underlying data feed is broken or filtering out exceptions" (D-GM-04).

**Differentiation:** substrate-visible.

**Worked example:** GM anchors: at Starling, automated screening from 20 July 2017 to 30 January 2023 checked only UK citizens or residents, matching 39 of 3,088 designated persons, and generated zero individual sanctions alerts between 01 July 2022 and 30 January 2023 (H-GM-01). Illustrative replay: a firm normally sees 42 individual-name alerts a week `[illustrative]`. Week 1 after a change: 3 alerts; weeks 2 to 4: zero `[illustrative]`. The detector fires in week 2 (below the 5th percentile, two consecutive periods) and the coverage check shows 39 active rule records against 3,088 list entries, a 1.3% coverage ratio (computed from GM's figures). Under this rule the silence would have surfaced within weeks rather than the roughly seven months GM records.

**Regulatory/governance hook:** Starling Final Notice (02 October 2024): Principle 3 and VREQ contravention, £28,959,426 penalty (H-GM-01); SAMLA 2018 requires suspected sanctions breaches to be reported "immediately" to OFSI (C-GM-01); Metro Final Notice (12 November 2024) cites SYSC 6 and MLR 2007 Reg 8 (H-GM-01).

**Feasibility (panel view):**
- *Data needed:* alert logs by type from the screening engine; list sizes; rule counts; screened population counts.
- *Hardest part:* extracting active rule counts and segment-level screened populations from vendor screening engines that report only alerts.
- *False-positive risk:* medium for tier 3 societies with small books where genuine zero-match weeks occur; mitigated by rates per screened population and multi-period rules.
- *Disagreement:* the NED wants board visibility only if an L1 boundary is threatened; the regulatory adviser holds that a silent sanctions control is board-material at once because of the OFSI "immediately" clock. The architect lens notes the platform consumes counts and never touches the screening engine.

---

### UC-GM-A3 -- Source-to-monitoring completeness badge: "Did 100% of records reach the control?"

- **Archetype:** Chain break (feed).
- **Bucket:** A (substrate-side).
- **Signal:** the count of records reaching a monitoring system falls short of the source count, or rejected records accumulate in an exceptions folder.
- **Cadence/trigger:** daily reconciliation; monthly attestation before the ERC pack locks.
- **Primary user → routed exec:** CRO (SMF4) → SMF17 for financial crime monitoring; COO and CTO for the feed; BRC when the gap persists past one cycle.
- **Provenance:** H-GM-01 (Metro row), D-GM-04, D-GM-03, A-GM-05 (financial crime leading indicator 1), Synthesis 1 item 4 ("Source-to-Monitoring Data Completeness Badge"), Synthesis 3 item 4.

**1. Data aggregation (requirement)**
- *Substrate inputs:* daily record counts (customers, accounts, transactions) in the core banking data store; counts received and processed by the automated transaction monitoring system (ATMS) and screening engines; rejected-record ("Bad Data") folder counts and ages; account opening and first-use timestamps; channel or partnership identifiers; value totals.
- *Interaction inputs:* none required (attestation commentary is used in UC-GM-B5).

**2. Baseline creation (evidence)**
- *Dimensions:* feed × record type × channel or partnership × account-age cohort (for example opened and used the same day) × day.
- *Normal:* 100% completeness, with a declared tolerance for timing lags that clear by T+1; a trailing baseline for the reject rate per feed.
- *Seasonality:* month-end and year-end volume peaks; batch windows.

**3. Dynamic detection (sufficiency)**
- Gap = source count − monitored count, above tolerance after timing lags clear.
- Cohort-specific gap: any cohort (for example same-day accounts, a partnership channel) with a materially higher gap than the feed average.
- Reject backlog older than its SLA, or rejects rising against baseline.
- No reconciliation run in the period (absence of evidence is itself a chain break).

**4. Distillation (attestation)**
- *Suppressed:* timing-only gaps that clear by T+1.
- *Ranked by:* unmonitored value, then duration, then control criticality.
- *Who attests:* the vertical control owner (for example the core banking engineering lead) and the horizontal risk owner sign off "not only the metric value, but also the underlying reconciliation control proving that 100% of source records reached the monitoring system" (D-GM-04) `[practice-not-rule]`. Owner self-test of their own control is blocked (segregation of duties).

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* every financial-crime metric on the board view carries a badge, "Records reconciled: 94.0% (2,256,000 of 2,400,000), last run 26 October 2026" `[illustrative]`; any metric on a failing feed shows "unverified" instead of green.
- *Recommended action:* propose a remediation plan and a look-back over the unmonitored population; open a draft reportability triage (UC-GM-A10).
- *Draft artifact:* a look-back scoping note listing affected cohorts and periods.
- *Human gate:* SMF17 approves the look-back; the CRO decides whether the BRC pack carries the metric as caveated. Audit log throughout.
- *Named hero element:* **chain-integrity badge** (feed segment) with denominator.

**Why it beats a self-built dashboard:** a self-built dashboard reports what the monitoring system saw. It cannot report what the monitoring system did not see. GM's point is that Metro's failure was "no daily source-to-ATMS reconciliation until 17 Dec 2020" (H-GM-01). The badge makes completeness the gate for showing any status at all.

**Differentiation:** substrate-visible.

**Worked example:** GM anchors: between 06 June 2016 and 17 December 2020, Metro's ATMS missed 60,483,951 of 1,008,426,668 transactions (about 6%), worth £51.25bn of £675.8bn; a timestamp code logic error excluded accounts opened and used on the same day (166,358 accounts, plus 71,627 others: 238,000 missing); a July 2019 tactical fix cut rejections from 1,352,665 to 438 a month; an ad hoc reconciliation in July 2020 found a 3,135-customer discrepancy; the look-back led to 153 SARs and 43 account closures (H-GM-01). Illustrative: a challenger processes 2.4m transactions a day; ATMS receives 2,256,000 (94.0%) `[illustrative]`. Cohort split shows same-day accounts at 0% monitored and all other cohorts at 99.97% `[illustrative]`. The badge fires on day 1, names the cohort, and the gap is traced to a timestamp rule rather than to volume.

**Regulatory/governance hook:** Metro Final Notice (12 November 2024): £16,675,200 penalty (£23,821,700 before the 30% discount), Principle 3, SYSC 6, MLR 2007 Reg 8 (H-GM-01). The Metro figure appears in GM also as £16.67m and £16.68m; this card uses the exact figure.

**Feasibility (panel view):**
- *Data needed:* daily counts from source and target, reject folder counts, timestamps.
- *Hardest part:* agreeing a stable record key between core banking and the monitoring system, and getting counts from vendor systems without new integration work.
- *False-positive risk:* low once timing tolerances are tuned; high in the first month.
- *Disagreement:* the architect lens prefers count reconciliation only (cheap, robust); the regulatory adviser wants value reconciliation too, because Metro's scale was stated in value (£51.25bn). The NED wants the badge on the board view only when it fails, not as a permanent decoration.

---

### UC-GM-A4 -- Restriction population adherence test: "Is the VREQ obeyed across the whole population, not just where the flag fired?"

- **Archetype:** Breach (restriction) and Chain break (restriction test missing).
- **Bucket:** A (substrate-side).
- **Signal:** any customer inside a VREQ or s166 restricted population is onboarded, served or transacting, on any product, channel or migration route; or the adherence metric tracks rule firing rather than population outcome.
- **Cadence/trigger:** daily population test; monthly adherence reporting; immediate re-run after any product launch, migration or change to onboarding logic.
- **Primary user → routed exec:** CRO (SMF4) and SMF17 → SMF17 and SMF16; board where a breach engages a reportability clock.
- **Provenance:** H-GM-01 (Starling, Monzo and CB Payments rows), G-GM-01, D-GM-03, A-GM-05 (financial crime lagging indicator 1), Synthesis 3 item 3.

**1. Data aggregation (requirement)**
- *Substrate inputs:* VREQ and s166 register with clause text; customer master with risk rating and its history; account opening log; transaction ledger; product and service catalogue (including newly launched services); migration records (customers moved from other group entities); manual credit and override logs; exited-customer list.
- *Interaction inputs:* none required (complaint narratives are joined in UC-GM-B11).

**2. Baseline creation (evidence)**
- *Dimensions:* restriction clause × product or service × channel × migration route × month.
- *Normal:* zero is the restriction; the measurable proxy (as the method requires for a zero-tolerance statement) is a monthly breach count with 100% product and route coverage of the test.
- *Seasonality:* none; volume of new accounts sets the denominator.

**3. Dynamic detection (sufficiency)**
- Any account opened for, or any transaction executed by, a customer meeting the restricted definition at the time of the event.
- Coverage gap: a product, service or migration route not inside the test's scope.
- Metric-design hard fail: the restriction's reported KPI counts flag triggers rather than population outcomes (GM: CB Payments "dashboards tracked only whether the flag fired, not the policy outcome", G-GM-01).
- Previously exited customers reappearing as new customers.

**4. Distillation (attestation)**
- *Suppressed:* duplicates (customers vs accounts deduplicated, both shown); re-ratings after opening are shown separately, not as breaches.
- *Ranked by:* previously exited customers first, then value transacted, then count.
- *Who attests:* SMF17 attests to the population test result (not to the flag count); second line validates the query against the clause text.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* "Is our VREQ obeyed across the whole population?" with breaches this month, customers vs accounts, coverage by product and route (with denominators), and months since the last zero-breach month.
- *Recommended action:* propose containment (block, exit review) by first line; open a draft reportability case, because GM lists significant VREQ breaches among SUP 15.3.1R matters (C-GM-01).
- *Draft artifact:* the monthly VREQ adherence statement draft for SMF review (feeds UC-GM-B15).
- *Human gate:* SMF17 accepts the result; a named SMF decides reportability. Audit log on every step.
- *Named hero element:* **restriction adherence test** (VREQ/s166 population check, with denominator).

**Why it beats a self-built dashboard:** the self-built version is exactly what failed: a flag count. GM shows all three cases measured the wrong thing or measured nothing (H-GM-01 "Was policy adherence tracked?": No; No; Partly/Faulty).

**Differentiation:** substrate-visible.

**Worked example:** GM anchors: Starling accepted a VREQ on 17 September 2021 not to open accounts for high-risk customers, but opened 54,359 accounts for 49,183 high-risk customers between September 2021 and November 2023, including 294 previously exited customers, earning about £900k; April 2024 was the first month with zero high-risk VREQ breaches (H-GM-01), 31 months after the VREQ (K-6). CB Payments `[scope]`: 1,034 migrated customers were never checked; a June 2022 service bypassed the flag; 199 flagged customers received manual e-money credits (H-GM-01). Illustrative: a challenger's daily test runs over 9,400 new accounts a month `[illustrative]`. It finds 112 accounts for 104 restricted customers this month, 97 via a newly launched savings pot not in the flag's scope and 7 via a group migration `[illustrative]`; 3 are previously exited customers `[illustrative]`. The flag count dashboard for the same month reads "flag fired 1,208 times, 100% blocked" `[illustrative]`.

**Regulatory/governance hook:** Starling Final Notice (02 October 2024), s.55L / s.204A FSMA VREQ contravention (H-GM-01); Monzo Final Notice (07 July 2025): £21,091,300, including a £10.0m deterrence uplift on the £805,250 post-VREQ figure (H-GM-01); CB Payments Final Notice (23 July 2024), Principle 2 and VREQ breach `[scope]`; SUP 15.3.1R (C-GM-01).

**Feasibility (panel view):**
- *Data needed:* customer risk ratings with history, account and transaction data across all products, migration records.
- *Hardest part:* turning clause text into an executable population query, and getting newly launched services into scope at launch (GM: Coinbase Pro and the June 2022 service at CB Payments `[scope]`).
- *False-positive risk:* low for opening breaches; medium for transaction-based restrictions where the rating changed intra-day.
- *Disagreement:* the first-line owner wants re-rated customers excluded; the regulatory adviser insists they are shown, separately, because a regulator will count them. The NED asks for months since last zero-breach month as the board headline, not the raw count.

---

### UC-GM-A5 -- Clause-to-code traceability: "Which policy or VREQ obligations have no live control or metric?"

- **Archetype:** Chain break (mapping).
- **Bucket:** A (substrate-side; AI-assisted extraction from policy text).
- **Signal:** an operative obligation in a policy or VREQ has no mapped live control ID and no quantitative adherence metric; or a control was built from a superseded version of the text; or policy text changed without a control re-test.
- **Cadence/trigger:** on every policy or VREQ version change; monthly sweep.
- **Primary user → routed exec:** CRO (SMF4) and SMF16 → policy owner and control owner; SMF17 for financial crime policies.
- **Provenance:** G-GM-01, H-GM-01 (CB Payments and Monzo rows), Synthesis 3 item 3 ("Clause-to-Code Policy & VREQ Traceability").

**1. Data aggregation (requirement)**
- *Substrate inputs:* policy library and VREQ texts with version history; regulatory obligation library; control register with system rule or configuration IDs; KRI register; control test results with dates.
- *Interaction inputs:* none required for detection (policy text is a substrate record, not governance narrative).

**2. Baseline creation (evidence)**
- *Dimensions:* policy or VREQ × clause × version × control × metric.
- *Normal:* GM's rule: "every internal policy (and every external regulatory requirement or VREQ) must be mapped to at least one operational control (tested via RCSA/KCI) and one outcome metric (KRI)" (G-GM-01). The control's build reference must match the current version.
- *Seasonality:* none; driven by version events.

**3. Dynamic detection (sufficiency)**
- Orphan obligation: no control or no outcome metric.
- Version drift: control built against an earlier draft (the CB Payments shape).
- Change without re-test: policy text updated, mapped control not re-tested since the update.
- Undefined operative term (for example a policy that requires EDD for PEPs but does not define PEP; the Monzo shape).

**4. Distillation (attestation)**
- *Suppressed:* descriptive clauses classified as non-operative (classification is AI-proposed, human-confirmed).
- *Ranked by:* VREQ or s166 clauses first, then financial crime policy, then others; within those, by exposure population.
- *Who attests:* the policy owner confirms the clause extraction; the control owner confirms the mapping; second line challenges. GM's product rule: a policy or VREQ clause "cannot be marked 'Active' in the system unless each operative obligation is linked to a live control ID and a quantitative adherence metric" (G-GM-01).

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* "Which obligations have no control or no outcome metric?" with a count of operative obligations, mapped, version-drifted and orphaned, per policy.
- *Recommended action:* propose mapping tasks with named owners and target dates; for VREQ clauses, propose a population test (UC-GM-A4).
- *Draft artifact:* gap list and draft control-to-clause mapping, AI-marked.
- *Human gate:* policy owner and second line approve each mapping; nothing is marked "Active" by AI.
- *Named hero element:* **chain-integrity badge** (mapping segment) with drill to clause.

**Why it beats a self-built dashboard:** dashboards hold controls and metrics, not the clause text and its versions. The failure GM documents is in the translation from text to system logic (H-GM-01 introduction: "the failure occurred in the translation of requirements into system logic").

**Differentiation:** substrate-visible.

**Worked example:** GM anchors: CB Payments' automated flag was coded from an earlier draft of the VREQ, leaving four risk-indicating questions unmapped; pre-implementation testing used one record; customers could overwrite their own answers to lower their risk rating (H-GM-01, G-GM-01) `[scope]`. Monzo's EDD procedure did not specify when EDD was required, PEPs were not clearly defined, and customers transacted before CDD completed (G-GM-01). Illustrative: a society's EDD policy v4.2 has 37 operative obligations; 31 are mapped to live controls and metrics; 4 map to controls whose last test predates v4.2; 2 are unmapped, including the PEP definition clause `[illustrative]`. The card lists 6 gaps of 37, ranked with the PEP clause first.

**Regulatory/governance hook:** Monzo Final Notice (07 July 2025), Principle 3 and VREQ breach; CB Payments Final Notice (23 July 2024) `[scope]`; Skipton Group Annual Report 2025 disclosing work at Skipton International Limited on "historic issues with ... policies, procedures, and overall risk management" (G-GM-01).

**Feasibility (panel view):**
- *Data needed:* versioned policy text; control register with system IDs.
- *Hardest part:* reliable clause extraction from prose. AI may propose; humans must confirm, and the first full mapping is a project.
- *False-positive risk:* medium (non-operative clauses flagged as orphans) until the classification is confirmed.
- *Disagreement:* the CRO wants every policy mapped; the first-line owner argues this is the "theoretical KRIs that do not map to live operational workflow queues" problem (A-GM-01) and asks to start with VREQ and financial crime policies only. The panel agrees on VREQ-first sequencing.

---

### UC-GM-A6 -- Growth against control capacity: "Is financial crime control capacity keeping pace with growth?"

- **Archetype:** Position (capacity headroom) escalating to Tension collision.
- **Bucket:** A (substrate-side).
- **Signal:** the ratio of high-risk onboarding volume (or alert volume) to qualified analyst capacity rises past threshold, or EDD backlog age passes its SLA, or the strategic plan projects a capacity gap within the planning horizon.
- **Cadence/trigger:** monthly; on every growth-enabling appetite change; at annual planning.
- **Primary user → routed exec:** CRO (SMF4) → CEO and ExCo (throttle or resource), board (appetite decision), SMF17.
- **Provenance:** A-GM-04, E-GM-03, A-GM-05 (financial crime leading indicator 2: "Ratio of high-risk customer onboarding velocity to qualified AML/EDD analyst headcount and backlog age"), Synthesis 1 item 1, Synthesis 2 ("Growth-vs-Control Capacity Gating").

**1. Data aggregation (requirement)**
- *Substrate inputs:* customer and account growth by risk rating; alert and case volumes; EDD queue size and age; qualified analyst FTE (with qualification status); strategic plan growth targets; appetite changes that enable growth (for example relaxed high-LTV limits, faster onboarding).
- *Interaction inputs:* none required (resource requests in minutes are joined in UC-GM-B8).

**2. Baseline creation (evidence)**
- *Dimensions:* business line × product × risk rating × team × month.
- *Normal:* the capacity ratio and backlog age during a period when quality assurance results were acceptable; plan-based forward projection over the planning horizon.
- *Seasonality:* campaign spikes, ISA season, year-end.

**3. Dynamic detection (sufficiency)**
- Capacity ratio above threshold; backlog age past SLA; projected gap within the plan horizon.
- A growth-enabling appetite change approved without a recorded capacity check (GM: the platform "pairs every growth-enabling appetite adjustment ... with a mandatory capacity check", A-GM-04).

**4. Distillation (attestation)**
- *Suppressed:* short spikes with documented temporary resourcing.
- *Ranked by:* financial crime first; then by size of projected gap.
- *Who attests:* SMF17 attests to capacity figures (qualified FTE, not headcount); first-line owner attests to growth forecast; second line challenges.
- *Boundary:* no cost or ROI lens; the card never offers "accept the risk to save cost" as an option, because a financial crime floor is not tradeable.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* on the strategy strip, each growth objective shows appetite consumed and a capacity indicator: "Onboarding growth +40% plan; EDD capacity +6%; backlog 19 days vs 10-day SLA" `[illustrative]`.
- *Recommended action:* propose either a growth throttle or a resourcing plan, for board decision.
- *Draft artifact:* board paper section framing the decision (growth pace vs capacity), with the floor stated as non-negotiable.
- *Human gate:* CEO and board decide; CRO recommends. Audit log.
- *Named hero element:* **strategy strip** with capacity indicator, linked to the **headroom gauge**.

**Why it beats a self-built dashboard:** growth sits in the finance pack and capacity sits in the financial crime MI; nobody puts them on one axis with a plan projection. GM describes this as the "Starling and Monzo failure mode" that the board view must prevent (Synthesis 1 item 1).

**Differentiation:** substrate-visible.

**Worked example:** GM anchors: Starling grew from 43k customers (2017) to 3.6m (2023) "without scaling FinCrime controls" (H-GM-01); the Final Notice (para 4.15) found senior management lacked AML skills and awareness of the impact of a VREQ (E-GM-03). Nottingham deliberately moderated new mortgage lending from £1.2bn in 2024 to £0.9bn in 2025 to embed its MQube platform before scaling (A-GM-04), a precedent for a board-approved throttle. Illustrative: a challenger's plan adds 40% accounts in 2027; qualified EDD analysts are 18 FTE; high-risk onboardings per FTE rise from 210 to 340 a month; backlog age from 6 to 19 days against a 10-day SLA `[illustrative]`. The card projects the SLA breach in month 2 of the plan and asks for a board decision before the plan is approved.

**Regulatory/governance hook:** Principle 3 (Starling, Monzo; H-GM-01); Starling Final Notice para 4.15 (E-GM-03); GM cites Peter Cummings / Bank of Scotland (2012) for personal enforcement where growth outran control `[scope]` (A-GM-04); FSB RAF (2013) on appetite as both accelerator and defence (A-GM-04).

**Feasibility (panel view):**
- *Data needed:* FTE with qualification status, queue data, plan targets.
- *Hardest part:* defining "qualified" capacity and accounting for automation gains without letting vendor claims inflate capacity.
- *False-positive risk:* medium; seasonal campaigns.
- *Disagreement:* the first-line owner says headcount is a poor proxy where automation is improving; the regulatory adviser says the FCA judged skills and resourcing, not tooling, at Starling; the NED wants one board-level indicator per growth objective, not a queue chart.

---
### UC-GM-A7 -- Immutable escalation rules: "Which persistent ambers and overdue items must reach the BRC regardless of who filters?"

- **Archetype:** Breach (persistence) with routing.
- **Bucket:** A (substrate-side: status histories, forum routing rules, action log).
- **Signal:** a Level 2 metric amber for two or more consecutive quarters, a Level 2 red, an adverse trajectory arrow on a Level 2 amber, or an item flagged as a top risk at a lower forum and left unremediated past its SLA.
- **Cadence/trigger:** evaluated at every pack build (monthly ERC, quarterly BRC, board); event-driven on SLA expiry.
- **Primary user → routed exec:** CRO (SMF4) → BRC chair (SMF10); ERC chair for remediation owners.
- **Provenance:** B-GM-02, Synthesis 1 item 3, Synthesis 3 item 6 ("Immutable Escalation Filtering").

**1. Data aggregation (requirement)**
- *Substrate inputs:* metric status history by Level; forum routing rules (ERC: all reds and ambers across L1–L3; BRC: all L1 metrics, all L2 reds, persistent L2 ambers; board: 10–12 headline metrics, L1 red or amber needing a trade-off or waiver, BRC chair's report) as GM describes them (B-GM-02) `[practice-not-rule]`; issue and action log with SLA dates; lower-forum top-risk registers.
- *Interaction inputs:* none required for the rule engine (the minutes join is UC-GM-B1).

**2. Baseline creation (evidence)**
- *Dimensions:* metric × Level × forum × period.
- *Normal:* the firm's own declared routing rules, stored as configuration with an owner and approval date; N (persistence periods) and SLA days set by the firm.
- *Seasonality:* none; persistence counts are calendar-based.

**3. Dynamic detection (sufficiency)**
- Rule match without routing: an item that meets a BRC rule but is absent from the BRC pack build.
- Persistence: amber for ≥ N consecutive periods.
- Overdue: top-risk item past SLA without closure evidence.
- Manual removal: an item removed from a pack it qualifies for, without a recorded override reason and approver.

**4. Distillation (attestation)**
- *Suppressed:* nothing that meets a rule. Items can be annotated but not removed; that is the point of the card (method: "items flagged at a lower forum, or left unremediated past their SLA, cannot be suppressed").
- *Ranked by:* Level, persistence length, days past SLA.
- *Who attests:* the CRO attests the pack is complete against the rules; any override needs a named approver and reason, logged.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* exception feed: "12 items qualify for the BRC; 12 included; 0 overrides" or "13 qualify; 12 included; 1 removed by ERC on 14 October 2026 without reason" `[illustrative]`.
- *Recommended action:* restore the item or record an override reason.
- *Draft artifact:* BRC exception feed section, auto-populated.
- *Human gate:* CRO approves the pack; BRC chair sees the override log. Audit log is immutable.
- *Named hero element:* **exception feed** with an override log.

**Why it beats a self-built dashboard:** pack assembly is manual in most firms (GM: incoming chairs reject "inherited 200-page spreadsheet packs", J-GM-02). A spreadsheet has no memory of what qualified and was removed. GM's first-line lens notes that when a metric is downgraded or removed at an executive sub-committee "there is rarely an immutable audit trail visible to the second or third line" (B-GM-02).

**Differentiation:** substrate-visible.

**Worked example:** GM anchor: at Metro, an operations risk board ranked bad data among its top five risks between May and August 2018, then reassigned and dropped the actions after 16 August 2018; no periodic MI reached the BRC or board until an external firm was engaged in December 2018 (B-GM-02). Illustrative replay: under a 90-day SLA rule `[illustrative]`, the bad-data item flagged in May 2018 would have auto-surfaced on the BRC exception feed in August 2018, about four months before the external engagement.

**Regulatory/governance hook:** Metro Final Notice (12 November 2024) (B-GM-02, H-GM-01); FCA criticism of board minutes that ignored "late delivery of key remediation actions raised in lower-level packs" in the Consumer Duty board report review (December 2024) (F-GM-01).

**Feasibility (panel view):**
- *Data needed:* status history; action log; the firm's routing rules.
- *Hardest part:* getting the firm to write down its routing rules precisely enough to execute.
- *False-positive risk:* low (rules are deterministic); the risk is pack bloat if N is set too low.
- *Disagreement:* the NED fears pack bloat and wants a cap on BRC items; the regulatory adviser says no cap may override a rule match; the CRO proposes a cap on the headline and no cap on the exception feed. GM's "persistent Level 2 Ambers ([] quarters)" in Synthesis 1 lost its symbol; this card uses "two or more consecutive quarters" from B-GM-02 only.

---

### UC-GM-A8 -- SMCR ownership gaps: "Which risks, metrics, policies or VREQs have no accountable SMF?"

- **Archetype:** Chain break (owner).
- **Bucket:** A (substrate-side).
- **Signal:** a principal risk, RAS metric, policy, regulatory obligation or VREQ clause with no single accountable SMF mapped to a Statement of Responsibilities; or overlapping owners; or a risk owner who is also the control owner for the same control.
- **Cadence/trigger:** on every SoR or MRM change, SMF departure or appointment, new VREQ, or new metric; quarterly sweep.
- **Primary user → routed exec:** CRO (SMF4) → CEO (SMF1) and company secretary for MRM; BRC chair.
- **Provenance:** D-GM-01, D-GM-03, H-GM-01 (Monzo row, leading indicator 2: "Count of VREQ requirements without a named SMF/First-Line owner in the Responsibilities Map").

**1. Data aggregation (requirement)**
- *Substrate inputs:* SoRs (SUP 10C.11) and Prescribed Responsibilities (SYSC 24.2, for example PR (d) on financial crime); MRM (SYSC 25); risk register with risk owners; control register with control owners; RAS metric register; policy register; VREQ / s166 register; FCA Register changes (appointments).
- *Interaction inputs:* none required.

**2. Baseline creation (evidence)**
- *Dimensions:* object type × object × SMF × risk owner × control owner × journey (horizontal) × function (vertical).
- *Normal:* exactly one accountable SMF per object; a distinct risk owner and control owner (GM: conflating them is "a foundational flaw", D-GM-03); every journey has a horizontal risk owner.
- *Seasonality:* none.

**3. Dynamic detection (sufficiency)**
- Unowned object; multiple accountable SMFs; SMF departed with no reallocation; risk owner = control owner; journey with no horizontal owner; VREQ clause with no SMF.

**4. Distillation (attestation)**
- *Suppressed:* intentional joint arrangements recorded in the MRM with rationale.
- *Ranked by:* VREQ first, then L1 metrics, then policies; days unowned.
- *Who attests:* each SMF attests their SoR is accurate (GM: internal six-monthly attestation is common practice, D-GM-02 `[practice-not-rule]`).

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* chain-integrity badge (owner segment) on every headline; a summary "4 board metrics and 1 VREQ clause have no accountable SMF" `[illustrative]`.
- *Recommended action:* propose an allocation for CEO and board approval.
- *Draft artifact:* MRM amendment draft.
- *Human gate:* CEO proposes; board approves MRM changes. AI never assigns an owner.
- *Named hero element:* **chain-integrity badge** (owner) and the **Ownership** lens (v6).

**Why it beats a self-built dashboard:** SoRs and MRMs live as Word documents with the company secretary; risk registers live in the GRC tool. No one joins them to the metric and VREQ registers. GM: Monzo's external law firm review found "it was unclear who at the firm was accountable for various aspects of the VREQ" (H-GM-01).

**Differentiation:** substrate-visible.

**Worked example:** GM anchor: Monzo, a root cause of the VREQ breach was unclear accountability (D-GM-01). Illustrative: a society with 38 Level 1 metrics, 6 VREQ clauses and 214 policies `[illustrative]`: after the CRO's predecessor leaves, 4 L1 metrics show the former SMF; 1 VREQ clause (re-screening of migrated customers) has no SMF; 11 controls have the same person as risk and control owner `[illustrative]`.

**Regulatory/governance hook:** FSMA s.66A(5) Duty of Responsibility ("reasonable steps"); SUP 10C.11; SYSC 24.2, SYSC 25 (D-GM-01). SMCR reform: DP1/23 / DP23/1 (30 March 2023) and streamlining 2024–2026 while retaining SoRs, MRMs and the Duty of Responsibility (D-GM-01).

**Feasibility (panel view):**
- *Data needed:* SoRs and MRM in structured form.
- *Hardest part:* converting prose SoRs into structured responsibilities that can be matched to objects.
- *False-positive risk:* low.
- *Disagreement:* the CRO wants SMF and risk owner on every L3 metric; the first-line owner says that is bureaucracy and asks for SMF at L1/L2 only, risk and control owner at L3. Panel adopts the latter as the default, configurable.

---

### UC-GM-A9 -- Change-to-control impact: "Which technology or rule changes touched a control without approval or re-test?"

- **Archetype:** Chain break (change).
- **Bucket:** A (substrate-side).
- **Signal:** a parameter, rule logic, filter or data-mapping change on a system that hosts a control, with no approval record from the control owner or no post-change test; or a control behaviour change within days of a change.
- **Cadence/trigger:** daily ingestion of change logs; event-driven on each change.
- **Primary user → routed exec:** CRO (SMF4) → CTO and COO; SMF17 for financial crime controls; model risk for model parameters.
- **Provenance:** D-GM-03 (line of sight must include "parameter, rule-logic, or threshold changes made by technology and engineering teams"), I-GM-04 (SS1/23 and threshold drift), H-GM-01 (Starling 2017 configuration; Metro timestamp logic), Synthesis 2 ("IT parameter/rule-change audit feeds").

**1. Data aggregation (requirement)**
- *Substrate inputs:* technology change log (tickets, deployments, configuration changes); control register mapping systems to controls; approvals; control test results; alert and population counts before and after (from UC-GM-A2, A3); model inventory.
- *Interaction inputs:* none required.

**2. Baseline creation (evidence)**
- *Dimensions:* system × control × change type × week.
- *Normal:* every change touching a control carries owner approval and a post-change test; control output stable within its band across the change.
- *Seasonality:* release calendars.

**3. Dynamic detection (sufficiency)**
- Change touching a control without approval; without post-change test; followed by a step change in control output; parameter drift in a model without validation sign-off (SS1/23).

**4. Distillation (attestation)**
- *Suppressed:* cosmetic changes on systems with no control mapping.
- *Ranked by:* control criticality; output change magnitude.
- *Who attests:* control owner approves; second line or model risk validates; proposer, approver and validator must be different people.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* "3 changes touched financial crime controls this month without a post-change test" `[illustrative]`, with drill to change ticket and control.
- *Recommended action:* propose a retrospective test; block further changes on the control until tested (a proposal to the CTO, not an action the platform takes).
- *Draft artifact:* change-impact note.
- *Human gate:* CTO and control owner decide. AI never reverts or re-tunes anything.
- *Named hero element:* **chain-integrity badge** (change segment) with a change timeline on the drill.

**Why it beats a self-built dashboard:** change management and risk management are separate systems with separate owners. GM: the risk owner "cannot rely on a static quarterly RCSA workshop" (D-GM-03).

**Differentiation:** substrate-visible.

**Worked example:** GM anchors: Starling's 2017 configuration restricted screening to UK citizens or residents and a separate control failed to update, letting 294 previously exited customers open new accounts (D-GM-03); Metro's timestamp code logic error (found 17 April 2019) excluded same-day accounts (C-GM-02, H-GM-01). Illustrative: a release on 03 March 2027 changes the customer-type mapping in the screening feed; no screening owner approval exists; individual alerts drop 92% in week 1 `[illustrative]`. The card links the drop to the change on day 3.

**Regulatory/governance hook:** PRA SS1/23 (effective 17 May 2024), Principle 5 on recalibration and parameter tuning governance; GM: UK banks "are not permitted to allow 'self-learning' models to autonomously re-tune production AML or fraud thresholds in real time without human model-risk validation" (I-GM-04).

**Feasibility (panel view):**
- *Data needed:* change logs mapped to systems; system-to-control map.
- *Hardest part:* the system-to-control map; change tickets rarely name controls.
- *False-positive risk:* high initially (many changes touch mapped systems harmlessly); falls once mapping is precise.
- *Disagreement:* the architect lens says the platform must not ingest code diffs, only change metadata; the regulatory adviser wants evidence of the actual parameter change for model controls. Agreed: metadata by default, parameter values for models in the SS1/23 inventory.

---

### UC-GM-A10 -- Multi-clock reportability triage and decision log: "What may be reportable, on which clock, and who decides?"

- **Archetype:** Reportability case.
- **Bucket:** A (substrate-side event log; the narrative join variant is UC-GM-B6).
- **Signal:** a logged incident, control failure, breach or conduct event that maps to one or more external notification clocks.
- **Cadence/trigger:** event-driven, from the moment of logging; clock reminders thereafter.
- **Primary user → routed exec:** CRO (SMF4) → SMF16 (usual decision owner), SMF17 (SAR, OFSI), DPO for ICO; board informed.
- **Provenance:** C-GM-01 (clock table), C-GM-02 (triage window, defensibility), Synthesis 3 item 7, Synthesis 1 item 5.

**1. Data aggregation (requirement)**
- *Substrate inputs:* incident and loss log; control failure records (from A2, A3, A4, A9); conduct breach and disciplinary records; impact-tolerance breaches; personal data breach records; sanctions match records; event timestamps (aware, reasonably suggests, confirmed).
- *Interaction inputs:* none required for triage (escalation notes are joined in UC-GM-B6).

**2. Baseline creation (evidence)**
- *Dimensions:* event × clock × decision owner.
- *Normal:* the clock map from GM (C-GM-01): FCA Principle 11 and SUP 15.3.1R "immediately"; PRA FR7 "immediately" (or in advance for prospective material changes); SUP 15.11 Form C/D within 7 business days for SMF disciplinary action; REP008 annually; operational incident breaching an impact tolerance "immediately" with staged reports; NCA SAR "as soon as practicable"; OFSI "immediately"; ICO "within 72 hours" under UK GDPR Article 33. GM also describes a "brief, focused triage window (typically 24 to 72 hours, or up to a few days for complex technical bugs)" `[practice-not-rule]` (C-GM-02).
- *Seasonality:* none.

**3. Dynamic detection (sufficiency)**
- Event matches one or more clock criteria; elapsed time since awareness exceeds the firm's triage window without a decision; a "not reportable" decision lacks a re-evaluation date.

**4. Distillation (attestation)**
- *Suppressed:* nothing is suppressed from the log; events that match no clock are shown in a "screened, no clock" list with rationale.
- *Ranked by:* shortest clock remaining.
- *Who attests:* a named SMF (typically SMF4 or SMF16, per GM's NED, C-GM-02) records the decision with the facts known at that timestamp, the SUP 15 / FR7 criteria evaluated, the rationale and the re-evaluation date. Dissent is recorded.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* the reportability ledger: each case, clocks engaged, time elapsed, decision owner, decision status.
- *Recommended action:* "prepare" a notification draft, or "prepare" a not-reportable rationale; never "file" or "notify".
- *Draft artifact:* AI-drafted case summary and draft notification text, AI-marked.
- *Human gate:* named SMF decides; submission happens outside the platform. Audit log with timestamps.
- *Named hero element:* **reportability decision ledger** (multi-clock).

**Why it beats a self-built dashboard:** clocks sit in different policies and different teams (compliance, MLRO, DPO, operational resilience). A dashboard can count incidents; it cannot map one event to five clocks and hold the SMF's contemporaneous rationale. GM's NED: what makes a decision defensible, "particularly when the decision is not to report", is "a contemporaneously documented human governance step" (C-GM-02).

**Differentiation:** substrate-visible.

**Worked example:** GM anchors: Starling's second line found zero individual alerts since July 2022 in January 2023; reconfigured and tested on 10 February 2023; notified the FCA on 16 February 2023; finished re-screening 3.5m customers by 24 February 2023, and received credit (para 2.11) (C-GM-02). Metro: "Bad Data" rejections flagged 2017; scale confirmed April 2018; timestamp error found 17 April 2019; FCA notified 29 May 2019 (42 days later, computed) (C-GM-02). Illustrative: a silent-control event logged on 02 November 2026 at 09:10 engages SUP 15.3 and OFSI (possible sanctions exposure), and possibly an NCA SAR; the ledger shows three clocks, SMF16 and SMF17 as decision owners, and a 48-hour triage window `[illustrative]`; SMF16 records "reportable" at 15:40 on 03 November 2026 `[illustrative]`.

**Regulatory/governance hook:** Principle 11; SUP 15.3.1R; FR7; SUP 15.11; REP008; SS1/21, SS2/21, PS16/24, CP24/28; POCA 2002 s.330–331; Terrorism Act 2000; SAMLA 2018; UK GDPR Article 33 (C-GM-01). GM: under-reporting turns a Principle 2 or 3 breach into "a career-ending Principle 11 / Fundamental Rule 7 violation alongside a breach of Senior Manager Conduct Rule 3 ... and Rule 4" (C-GM-02). Note: GM cites CP24/28 for incident reporting; the run configuration names PS26/2 and PS7/26 from 18 March 2027, which GM does not mention `[NEW -- beyond file]` for the latter.

**Feasibility (panel view):**
- *Data needed:* incident log with awareness timestamps; event classification.
- *Hardest part:* recording "aware" honestly; firms back-date or forward-date awareness.
- *False-positive risk:* medium; the triage screen will catch many events that match no clock, which is intended.
- *Disagreement:* GM's own panel splits: the regulatory adviser fears under-reporting; the first-line owner and CRO fear defensive over-reporting that leads to read-across information requests and a "supervisory watch-list" (C-GM-02). The card supports both by making not-reportable decisions as documented as reportable ones.

---

### UC-GM-A11 -- Read-across prompt: "Where else does this failure pattern exist in our own estate?"

- **Archetype:** Reportability case (read-across) and Chain break discovery.
- **Bucket:** A (substrate-side).
- **Signal:** a confirmed internal control failure, or a new external Final Notice, whose failure pattern matches controls in sibling systems, products or entities.
- **Cadence/trigger:** event-driven: internal failure confirmed; peer Final Notice published.
- **Primary user → routed exec:** CRO (SMF4) → second line (read-across review); SMF17; BRC chair (who, per GM, demands proof after peer fines).
- **Provenance:** C-GM-02 (automatic "Read-Across Prompt that checks horizontal sibling systems before the regulator asks"), J-GM-02 (trigger 6: peer enforcement read-across), H-GM-01 (prevention suite).

**1. Data aggregation (requirement)**
- *Substrate inputs:* control register with design attributes (control type, system, feed, rule family, vendor); the failure record; precedent corpus (real Final Notices, posture-tagged); systems inventory.
- *Interaction inputs:* none required.

**2. Baseline creation (evidence)**
- *Dimensions:* control × design attribute × system × entity.
- *Normal:* each failure pattern maps to a set of attributes (for example "screening filter restricts population by residency", "feed excludes records by timestamp", "restriction flag scoped to one product").
- *Seasonality:* none.

**3. Dynamic detection (sufficiency)**
- Sibling controls sharing the failing attribute set; controls matching a precedent's failure pattern with no test since the precedent's publication date.

**4. Distillation (attestation)**
- *Suppressed:* matches already tested since the trigger date with a passing result.
- *Ranked by:* similarity of design, population size, criticality.
- *Who attests:* second line confirms each match as relevant or not, with reason.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* read-across prompt: "Metro pattern (timestamp exclusion): 4 of our feeds use the same open-date logic; 1 untested since 12 November 2024" `[illustrative]`.
- *Recommended action:* propose read-across tests with owners and dates.
- *Draft artifact:* BRC chair response note: "what we checked after the Metro Final Notice".
- *Human gate:* second line approves scope; CRO signs the note. Audit log.
- *Named hero element:* **read-across prompt** linked to the **precedent corpus panel** (v6).

**Why it beats a self-built dashboard:** read-across depends on design attributes of controls, not their RAG status. GM: under-reporting leads the regulator to trigger "a 'read-across' s166 Skilled Person review or VREQ across the entire firm" (C-GM-02); doing it first is the defence.

**Differentiation:** substrate-visible.

**Worked example:** GM anchors: J-GM-02 lists the £28.96m Starling (October 2024), £16.68m Metro (November 2024) and £21.09m Monzo (July 2025) fines as triggers for every BRC chair to "demand proof from their CRO that their own transaction monitoring data feeds and sanctions filters do not suffer from similar silent gaps". Illustrative: after the Monzo Final Notice, the platform matches "customers transact before CDD complete" to 3 product journeys; 2 have hard system gates; 1 (a business savings product) relies on a manual check `[illustrative]`.

**Regulatory/governance hook:** Principle 11 and SUP 15 (C-GM-02); Starling, Metro and Monzo Final Notices (H-GM-01); 2021 challenger bank financial crime review cited by GM (C-GM-02).

**Feasibility (panel view):**
- *Data needed:* control design attributes, which most registers lack.
- *Hardest part:* attribute tagging of the control register.
- *False-positive risk:* medium-high (pattern matching is broad); second-line confirmation is essential.
- *Disagreement:* GM's CRO and first-line owner warn that defensive read-across can itself trigger regulator "read-across information requests demanding verification across all sibling product systems" (C-GM-02); the regulatory adviser says doing it internally first is precisely what avoids that.

---

### UC-GM-A12 -- Self-identification ratio: "Are we finding our own problems, or is audit or the regulator finding them?"

- **Archetype:** Position (governance health KPI).
- **Bucket:** A (substrate-side).
- **Signal:** the share of issues identified by Line 1 and Line 2 before Line 3 or the regulator falls, or is low in a specific business unit.
- **Cadence/trigger:** quarterly to BRC; monthly trend.
- **Primary user → routed exec:** CRO (SMF4) → BRC chair; Head of Internal Audit (SMF5) and Audit Committee chair (SMF11).
- **Provenance:** E-GM-02 (Line 3 metric suite and product implication), E-GM-03 (over-reliance on episodic external reviews).

**1. Data aggregation (requirement)**
- *Substrate inputs:* issue log with source of identification (L1 RCSA, L2 monitoring, L3 audit, regulator, external review, customer complaint); repeat and reopened findings; overdue high-priority audit issues; audit rating distribution.
- *Interaction inputs:* none required.

**2. Baseline creation (evidence)**
- *Dimensions:* business unit × principal risk × severity × quarter.
- *Normal:* trailing ratio per unit; GM gives no benchmark, so the firm sets its target `[practice-not-rule]`.
- *Seasonality:* audit plan timing (Q4 audit-heavy periods).

**3. Dynamic detection (sufficiency)**
- Ratio below target; falling for two quarters; high-severity issues found externally in a unit that self-reported none.

**4. Distillation (attestation)**
- *Suppressed:* low-severity issues for the board view (counted, not listed).
- *Ranked by:* severity-weighted externally found issues.
- *Who attests:* SMF5 attests to identification source tagging (third line must not own the metric it audits, but it does own the tagging of its own findings).

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* "Self-identified: 58% of high-severity issues this year (down from 71%)" `[illustrative]`, by unit.
- *Recommended action:* propose a focused first-line assurance review in the weakest unit.
- *Draft artifact:* BRC paper paragraph.
- *Human gate:* CRO accepts; BRC decides any action.
- *Named hero element:* a single KPI tile with denominator on the BRC view (not a heat-map).

**Why it beats a self-built dashboard:** issue logs rarely record identification source consistently, and audit and regulator findings sit in different trackers. GM: "an objective measure of first-line risk maturity" (E-GM-02).

**Differentiation:** substrate-visible.

**Worked example:** GM anchors: Monzo received a third-party review in late 2019 flagging monitoring weaknesses; Starling found its 2017 screening bug only in a January 2023 second-line review (E-GM-03). Illustrative: of 24 high-severity issues in 2026, 14 were self-identified (58%), 7 by internal audit, 2 by a s166 skilled person, 1 by the FCA `[illustrative]`.

**Regulatory/governance hook:** IIA Three Lines Model (2020) and BCBS Corporate Governance Principles as cited by GM (E-GM-01); Starling Final Notice para 4.15 on skills (E-GM-03).

**Feasibility (panel view):**
- *Data needed:* consistent source tagging.
- *Hardest part:* retro-tagging history.
- *False-positive risk:* low; the risk is gaming (logging trivial self-identified issues).
- *Disagreement:* the NED likes one number; the CRO fears gaming and wants severity weighting; the first-line owner objects that audit-found issues are sometimes already known but unlogged. `[single]` in GM.

---

### UC-GM-A13 -- Board model risk appetite overlay (SS1/23): "Are our AI and ML financial crime models inside model risk appetite?"

- **Archetype:** Position and Chain break (model governance).
- **Bucket:** A (substrate-side).
- **Signal:** a production model (AML scoring, fraud, credit, internal AI tool) whose drift, false-positive-to-SAR conversion or validation status breaches the board's model risk appetite, or whose parameters changed without validation.
- **Cadence/trigger:** monthly; event-driven on parameter change.
- **Primary user → routed exec:** CRO (SMF4) → model risk committee; SMF17 for financial crime models; BRC.
- **Provenance:** I-GM-01, I-GM-04, K-7, Synthesis 3 item 10, Synthesis 4 (entry-point verdict).

**1. Data aggregation (requirement)**
- *Substrate inputs:* model inventory and tiering (SS1/23 Principle 1); validation status and dates; drift indicators; alert volumes; SAR conversion (alerts → cases → SARs); parameter change log with approvals; data-feed completeness for model inputs.
- *Interaction inputs:* none required.

**2. Baseline creation (evidence)**
- *Dimensions:* model × tier × business use × month.
- *Normal:* validated performance range at last validation; board model risk appetite limits (for example maximum days past validation, drift band).
- *Seasonality:* typology shifts; campaign periods.

**3. Dynamic detection (sufficiency)**
- Validation overdue; drift outside band; false-positive-to-SAR ratio moves sharply after a change; unapproved parameter change; input feed incomplete (from A3).

**4. Distillation (attestation)**
- *Suppressed:* tier 3 models from the board view (shown at ERC).
- *Ranked by:* model tier and financial crime use first.
- *Who attests:* model owner; independent validator (SS1/23 Principle 4); approver distinct from proposer.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* "2 tier 1 models outside model risk appetite: AML scoring drift; fraud rule set changed without validation" `[illustrative]`.
- *Recommended action:* propose validation or rollback review by model risk.
- *Draft artifact:* model risk committee paper.
- *Human gate:* model risk committee decides. The platform never re-tunes.
- *Named hero element:* model risk row on the **RAS headline scorecard**, with drill to inventory.

**Why it beats a self-built dashboard:** the model inventory, alert MI and SAR outcomes sit with different teams; SS1/23 asks the board to set model risk appetite, which needs them together. GM: the platform "should not try to replace heavy ... transaction-scoring engines ...; instead, it should sit above them as the Board & SMF4/SMF17 Governance Layer" (I-GM-04).

**Differentiation:** substrate-visible.

**Worked example:** GM anchors `[marketing-grade]` where GM tags them: legacy rules-based systems suffer over 95% false positives in phase-1 review, with about 98% of alerts never culminating in a SAR; Google Cloud AML AI at HSBC identified 2x to 4x more confirmed suspicious activity while reducing alert volumes by 60% and cutting investigation times from several weeks to about 8 days (I-GM-04). Illustrative: after a vendor model upgrade, alerts fall 55% and SARs fall 30% `[illustrative]`. The card flags that SARs should not fall if detection improved, and asks model risk to test for lost coverage.

**Regulatory/governance hook:** PRA SS1/23 (published May 2023, effective 17 May 2024), Principles 1 to 5 (I-GM-01); EU AI Act (Regulation (EU) 2024/1689) and US SR 11-7 as contrast (I-GM-01).

**Feasibility (panel view):**
- *Data needed:* model inventory; SAR outcomes linked to alerts.
- *Hardest part:* linking SAR outcomes back to the model and alert that produced them.
- *False-positive risk:* medium.
- *Disagreement:* GM's verdict (Synthesis 4) is that agentic AI financial crime is credible only as "Board and SMF4/SMF17 Governance of AI-Driven Financial Crime Controls and SS1/23 Model Risk", not as governing external customer agents. The NED sees this as a board-relevant wedge; the regulatory adviser warns against leading with AI before UK rules exist (product profile, M-S-04); the CRO places it inside the scorecard, not as a separate module, as GM recommends (I-GM-01).

---

### UC-GM-A14 -- Building society statutory limits headroom: "How close are we to the nature and funding limits?" `[single]`

- **Archetype:** Position.
- **Bucket:** A (substrate-side).
- **Signal:** a building society's nature limit (share of assets in residential property loans) or funding limit (share of funding from members) moving toward its statutory boundary or the firm's internal buffer.
- **Cadence/trigger:** monthly; on any wholesale funding plan or acquisition.
- **Primary user → routed exec:** CRO (SMF4) → CFO (SMF2) and ALCO; board.
- **Provenance:** J-GM-01 (Building Societies Act 1986 and the 2024 Amendment Act), A-GM-05 (liquidity leading indicator 2: "Wholesale funding reliance ratio approaching internal buffer below the 50% statutory building society limit"), B-GM-01 (Nationwide wholesale funding limit).

**1. Data aggregation (requirement)**
- *Substrate inputs:* balance sheet by asset class; funding by source; ALCO funding plan; acquisition pipeline (for example mutual-owned bank integration).
- *Interaction inputs:* none.

**2. Baseline creation (evidence)**
- *Dimensions:* entity × month.
- *Normal:* GM: nature limit "at least 75% of assets must be residential property loans/mortgages"; funding limit "at least 50% of funding must come from member deposits, with wholesale funding capped at 50%—and in practice averaging well below 31.5%" (J-GM-01). Internal buffers set by the board.
- *Seasonality:* funding scheme repayments; securitisation timing.

**3. Dynamic detection (sufficiency)**
- Ratio within the internal buffer; projected to enter it within the funding plan horizon.

**4. Distillation (attestation)**
- *Suppressed:* nothing at L1.
- *Ranked by:* distance to statutory limit.
- *Who attests:* CFO attests to the calculation.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* headroom gauge for both limits, with denominator.
- *Recommended action:* propose an ALCO review of the funding plan.
- *Draft artifact:* ALCO note.
- *Human gate:* CFO and ALCO decide.
- *Named hero element:* **headroom gauge**.

**Why it beats a self-built dashboard:** most societies already track this; the gain is linking the funding plan projection to the board's appetite and to the acquisition pipeline. It is a qualifier rather than a differentiator, kept for recall.

**Differentiation:** substrate-visible.

**Worked example:** GM anchor: GM states wholesale funding averages "well below 31.5%" in practice (J-GM-01). Illustrative: a society after acquiring a mutual-owned bank sees wholesale funding at 34% against an internal ceiling of 40% `[illustrative]`; the post-integration plan projects 39% in Q3 2027 `[illustrative]`.

**Regulatory/governance hook:** Building Societies Act 1986, as modernised by the Building Societies Act 1986 (Amendment) Act 2024 (J-GM-01); House of Lords Library Briefing LLN-2024-0018 (23 April 2024).

**Feasibility (panel view):**
- *Data needed:* standard finance data.
- *Hardest part:* none significant.
- *False-positive risk:* low.
- *Disagreement:* the NED finds it table-stakes for a society board; the CRO values it only as a link to the tension register (UC-GM-B4, member pricing vs capital). `[long-tail -- preserve]`; tier 2 and 3 societies only.

---

### UC-GM-A15 -- Leading-indicator tree per domain: "Which leading indicator moved before the lagging one?"

- **Archetype:** Position (leading indicator drift).
- **Bucket:** A (substrate-side).
- **Signal:** a leading indicator (predictive or capacity strain) moves adverse while its paired lagging indicator is still in appetite.
- **Cadence/trigger:** monthly.
- **Primary user → routed exec:** CRO (SMF4) → first-line risk owner per domain; BRC for L1 domains.
- **Provenance:** A-GM-05 (nine-domain table), Synthesis 1 item 2.

**1. Data aggregation (requirement)**
- *Substrate inputs:* GM's paired indicators across the nine domains (A-GM-05), for example credit: share of new originations above 90% LTV or 4.5x LTI and early arrears migration (leading) against 3m+ arrears and cost of risk (lagging); market (IRRBB): unhedged pipeline relative to swap execution capacity, EVE and NII sensitivity to a 200bp parallel shock (leading) against NIM compression; operational resilience: share of Important Business Services on unremediated legacy IT or untested critical third parties, failed DR failovers or change rollbacks (leading) against impact-tolerance breaches; cyber: mean time to patch critical vulnerabilities, phishing click-through among privileged administrators (leading); regulatory: count of upcoming implementation deadlines with unmapped policies, overdue L2 and L3 high-priority actions (leading).
- *Interaction inputs:* none.

**2. Baseline creation (evidence)**
- *Dimensions:* domain × indicator pair × lag × month.
- *Normal:* trailing band per leading indicator; the declared lag between leading and lagging (GM's "tortoises" and "hares", A-GM-05).
- *Seasonality:* per indicator.

**3. Dynamic detection (sufficiency)**
- Leading indicator out of band for two periods while the lagging partner is green; the projected effect on the lagging partner at the declared lag.

**4. Distillation (attestation)**
- *Suppressed:* pairs with no declared lag or owner (flagged as a chain break instead).
- *Ranked by:* projected lagging impact at L1.
- *Who attests:* domain risk owner.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* per principal risk, the leading-indicator tree with the moved branch highlighted.
- *Recommended action:* propose a first-line review of the leading driver.
- *Draft artifact:* ERC note.
- *Human gate:* risk owner decides action.
- *Named hero element:* **leading-indicator tree**.

**Why it beats a self-built dashboard:** GM says board packs over-rely on lagging indicators (A-GM-05); a dashboard shows both but does not pair them or carry the lag.

**Differentiation:** substrate-visible.

**Worked example:** GM anchors: Leeds 3m+ arrears 0.57%; cost of risk 11 bps at Nationwide, 51 bps at Shawbrook (A-GM-05). Illustrative: high-LTV share of new lending rises from 18% to 27% over two quarters and early arrears migration rises 40% `[illustrative]`, while 3m+ arrears is flat at 0.55% `[illustrative]`; the tree highlights credit, branch "new lending mix".

**Regulatory/governance hook:** GM cites UK operational risk literature "drawing on PRA Statement of Policy methodologies" for the lag distinction (A-GM-05) `[practice-not-rule]`; SS3/19 for climate is in the run configuration, not in GM `[NEW -- beyond file]`.

**Feasibility (panel view):**
- *Data needed:* nine-domain indicators; many firms lack cyber and resilience leading indicators.
- *Hardest part:* declaring lags.
- *False-positive risk:* medium-high; leading indicators are noisy.
- *Disagreement:* GM's product implication asks every domain dashboard to show leading on the left, lagging on the right; the NED wants only the moved branches at board altitude; the regulatory adviser cautions that "projected effect" must be labelled early warning, not prediction.

---

### UC-GM-A16 -- Headline scorecard and full RAS schedule: "Which 10–12 headlines, and is anything in the other 30 moving?" `[conflict]`

- **Archetype:** Position.
- **Bucket:** A (substrate-side).
- **Signal:** a Level 1 metric outside the headline scorecard moves to amber or red, or crosses a velocity rule, and is promoted to the board view.
- **Cadence/trigger:** quarterly board; monthly ERC.
- **Primary user → routed exec:** CRO (SMF4) → board and BRC chair.
- **Provenance:** A-GM-03, K-1, B-GM-01, Synthesis 1 item 2.

**1. Data aggregation (requirement)**
- *Substrate inputs:* full Level 1 RAS schedule (GM: typically 25–45 metrics; the CRO lens says 30+); headline subset (10–15 per GM; 10–12 per the practitioner claim); statuses and trajectories.
- *Interaction inputs:* none.

**2. Baseline creation (evidence)**
- *Dimensions:* principal risk × metric × headline flag × quarter.
- *Normal:* the configurable cap (default about 12) set by the board; GM's K-1 verdict: "partly supported", supported for principal risk categories and the board summary, not for the full schedule `[practice-not-rule]`.
- *Seasonality:* none.

**3. Dynamic detection (sufficiency)**
- Non-headline L1 metric amber, red or with an adverse velocity flag; a headline that has been green for 8 quarters `[illustrative]` (candidate to rotate out, proposed only).

**4. Distillation (attestation)**
- *Suppressed:* green non-headline metrics on the board view (visible in the full schedule).
- *Ranked by:* status severity, then velocity.
- *Who attests:* CRO proposes the headline set; board approves it annually with the RAS.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* scorecard plus a "promoted from schedule" lane.
- *Recommended action:* propose the promotion to the board view for this cycle.
- *Draft artifact:* board summary cover.
- *Human gate:* CRO approves; board sees promotion reasons.
- *Named hero element:* **RAS headline scorecard** with a promotion lane.

**Why it beats a self-built dashboard:** packs hard-code the headline set; promotions are manual. GM's NED: with 60 metrics "directors lose strategic focus and descend into micromanagement"; GM's CRO: the board must still approve the full suite annually (A-GM-03).

**Differentiation:** substrate-visible.

**Worked example:** GM anchors: Nationwide about 12 headline metrics (CET1 19.1%, leverage 5.3%, 12-month average LCR 169%, cost of risk 11 bps); Leeds about 11 (CET1 25.5%, arrears 0.57%); Nottingham about 8 (B-GM-01). Illustrative: a society's 34-metric schedule has 12 headlines; NSFR (not a headline) drops from amber-plus-10 to amber-plus-2 percentage points in one quarter `[illustrative]` and is promoted with a reason.

**Regulatory/governance hook:** FSB RAF (18 November 2013); PRA Rulebook ICAA 3.1 and General Organisational Requirements 2.1 (A-GM-01); 10–12 cap is `[practice-not-rule]`, and GM tags A-GM-03 `[conflict]`.

**Feasibility (panel view):**
- *Data needed:* RAS schedule.
- *Hardest part:* agreeing promotion rules.
- *False-positive risk:* low.
- *Disagreement:* recorded in GM itself (NED vs CRO on 10–12). The panel keeps the cap configurable and never presents it as a rule.

---

### UC-GM-A17 -- Top and emerging risk overlay: "Which emerging risks map onto which principal risks, and how fast?" `[long-tail -- preserve]`

- **Archetype:** Position (horizon).
- **Bucket:** A (substrate-side).
- **Signal:** an emerging risk with rising scenario weight or velocity maps onto a principal risk whose headroom is already thin.
- **Cadence/trigger:** quarterly horizon scan; event-driven on major external developments.
- **Primary user → routed exec:** CRO (SMF4) → BRC.
- **Provenance:** B-GM-01 (product implication: separate principal from top and emerging risks, "tracked via horizon scanning, velocity arrows, and scenario weights"), Synthesis 1 item 5.

**1. Data aggregation (requirement)**
- *Substrate inputs:* emerging risk register with velocity, scenario weights and mapped principal risks; principal risk headroom (from A1).
- *Interaction inputs:* none required.

**2. Baseline creation (evidence)**
- *Dimensions:* emerging risk × principal risk × quarter.
- *Normal:* the prior quarter's weights and velocities.
- *Seasonality:* none.

**3. Dynamic detection (sufficiency)**
- Weight or velocity up and mapped principal risk headroom below a set share.

**4. Distillation (attestation)**
- *Suppressed:* unmapped emerging risks (flagged as chain breaks).
- *Ranked by:* weight × headroom thinness.
- *Who attests:* CRO.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* overlay on the principal risk list showing emerging risks and time to crystallise.
- *Recommended action:* propose a scenario test.
- *Draft artifact:* BRC horizon-scanning note.
- *Human gate:* BRC.
- *Named hero element:* **top and emerging risk overlay**.

**Why it beats a self-built dashboard:** horizon scans are narrative documents; linking them to headroom is new.

**Differentiation:** substrate-visible.

**Worked example:** GM anchors: Shawbrook assigned a 40% combined probability weight to downside and severe downside scenarios in ECL models (B-GM-01); emerging risks across firms include higher-for-longer rates feeding arrears, AI and cyber, core banking replacement (B-GM-01). Illustrative: "core banking replacement" velocity rises; operational resilience headroom is 15% of tolerance `[illustrative]`.

**Regulatory/governance hook:** GM cites disclosure practice in annual reports and Pillar 3 (B-GM-01) `[practice-not-rule]`.

**Feasibility (panel view):**
- *Hardest part:* emerging risks lack metrics.
- *False-positive risk:* medium.
- *Disagreement:* the NED values it; the architect lens notes it is mostly judgement, not detection.

---

### UC-GM-A18 -- Agentic session and SCA-bypass anomaly KRI: "Are third-party agents or API sessions acting on accounts without step-up?" `[long-tail -- preserve]`

- **Archetype:** Position (leading KRI).
- **Bucket:** A (substrate-side).
- **Signal:** a rise in third-party API or agent-pattern sessions initiating payments, or SCA bypass attempts, against baseline.
- **Cadence/trigger:** weekly.
- **Primary user → routed exec:** CRO (SMF4) → SMF17 and fraud owner; COO and CTO.
- **Provenance:** I-GM-02 (product implication: track "Third-Party API / Agentic Session Anomalies" and SCA bypass attempts as a leading KRI), I-GM-03.

**1. Data aggregation (requirement)**
- *Substrate inputs:* session logs by access route (Open Banking PISP, credential-sharing patterns), SCA challenge outcomes, APP fraud claims.
- *Interaction inputs:* none required.

**2. Baseline creation (evidence)**
- *Dimensions:* access route × payment type × week.
- *Normal:* trailing band.
- *Seasonality:* payday cycles.

**3. Dynamic detection (sufficiency)**
- Agent-pattern sessions initiating payments up; SCA bypass attempts up; APP claims linked to such sessions.

**4. Distillation (attestation)**
- *Suppressed:* regulated PISP traffic within expected band.
- *Ranked by:* value initiated.
- *Who attests:* fraud owner.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* one KRI line under fraud and payment risk appetite.
- *Recommended action:* propose a review of step-up rules (the CTO decides).
- *Draft artifact:* ERC note.
- *Human gate:* fraud owner and CTO.
- *Named hero element:* KRI row on the scorecard (fraud filter).

**Why it beats a self-built dashboard:** it does not, much; kept for recall as a leading indicator GM names.

**Differentiation:** substrate-visible.

**Worked example:** GM anchors: PSR Specific Direction 20 (effective 07 October 2024), 50:50 split up to £85,000 cap (I-GM-02); JPMorgan and Citi block third-party agents from executing transactions (I-GM-03, K-4). Illustrative: credential-sharing session patterns initiating payments rise from 0.2% to 0.9% of sessions in a quarter `[illustrative]`.

**Regulatory/governance hook:** PSRs 2017 Regs 67 and 76; PSR APP reimbursement; Consumer Duty PRIN 12 (I-GM-02). GM tags the application to agentic prompt injection `[inference]`.

**Feasibility (panel view):**
- *Hardest part:* identifying agent sessions reliably.
- *False-positive risk:* high.
- *Disagreement:* GM's own verdict (Synthesis 4) argues against leading with external agent governance; the panel keeps this as a single KRI only, never a module or a demo beat.

---

### UC-GM-A19 -- Climate pathway on-track/off-track: "Which climate targets are off-track, and what has the board done about it?" `[long-tail -- preserve]`

- **Archetype:** Position (target pathway).
- **Bucket:** A (substrate-side).
- **Signal:** a climate target deviates from its pathway, or EPC F/G or high flood-risk share of new lending rises.
- **Cadence/trigger:** quarterly; annual with climate report.
- **Primary user → routed exec:** CRO (SMF4) → BRC; CFO.
- **Provenance:** A-GM-05 (climate row), B-GM-01 (Leeds on-track/off-track reporting and re-baselining to 2034).

**1. Data aggregation (requirement)**
- *Substrate inputs:* new lending by EPC rating and flood-risk postcode; financed emissions intensity; target pathway milestones.
- *Interaction inputs:* none required.

**2. Baseline creation (evidence)**
- *Dimensions:* target × year.
- *Normal:* declared pathway.
- *Seasonality:* none.

**3. Dynamic detection (sufficiency)**
- Deviation from pathway; adverse trend in leading shares.

**4. Distillation (attestation)**
- *Suppressed:* targets on track.
- *Ranked by:* deviation.
- *Who attests:* climate risk owner.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* on-track / off-track status per target, framed as PRA prudential risk, not ESG.
- *Recommended action:* propose a board review of the pathway.
- *Draft artifact:* BRC note.
- *Human gate:* board.
- *Named hero element:* row on the scorecard.

**Why it beats a self-built dashboard:** marginally; kept because GM records a real board transparency practice.

**Differentiation:** substrate-visible.

**Worked example:** GM anchors: Leeds openly reported being off-track on three of its 2021–2030 climate targets before re-baselining to 2034; its 2034 targets include a 90% Scope 1 and 2 market-based cut and a 70% Scope 3 mortgage intensity cut (B-GM-01). Illustrative: EPC F/G share of new lending rises from 3.1% to 4.4% `[illustrative]`.

**Regulatory/governance hook:** GM cites the Leeds Climate Report 2025 and disclosure practice; SS3/19 is in the run configuration, not in GM `[NEW -- beyond file]`.

**Feasibility (panel view):**
- *Hardest part:* EPC data coverage.
- *False-positive risk:* low.
- *Disagreement:* the NED supports transparency; the CRO wants climate kept as prudential framing only, per brand rules.

---

### UC-GM-A20 -- Inactive fee-paying customers: "Are we still charging customers who get no value?" `[long-tail -- preserve]`

- **Archetype:** Position (Consumer Duty outcome tolerance).
- **Bucket:** A (substrate-side; the narrative join is UC-GM-B14).
- **Signal:** the share of active fee-paying accounts with zero engagement over 12 months rises against tolerance.
- **Cadence/trigger:** monthly; annual Consumer Duty board report.
- **Primary user → routed exec:** CRO (SMF4) → SMF16 and the product owner; board via the Consumer Duty report.
- **Provenance:** A-GM-05 (conduct leading indicator 1), F-GM-01 (fair value feedback: "policies to stop collecting fees when clients have not engaged with a service for an extended period").

**1. Data aggregation (requirement)**
- *Substrate inputs:* fee-paying accounts; engagement events; fees charged.
- *Interaction inputs:* none required.

**2. Baseline creation (evidence)**
- *Dimensions:* product × customer cohort × month.
- *Normal:* tolerance set by the board in its Consumer Duty outcome MI.
- *Seasonality:* annual fee cycles.

**3. Dynamic detection (sufficiency)**
- Share above tolerance; rising for two periods.

**4. Distillation (attestation)**
- *Suppressed:* products with an approved fee-stop rule operating.
- *Ranked by:* fees collected from inactive customers.
- *Who attests:* product owner.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* outcome tolerance tile with denominator.
- *Recommended action:* propose a fee-stop review.
- *Draft artifact:* Consumer Duty board report section.
- *Human gate:* SMF16 and product owner.
- *Named hero element:* Consumer Duty row on the scorecard.

**Why it beats a self-built dashboard:** modestly; most firms can compute it but do not tie it to a board tolerance.

**Differentiation:** substrate-visible.

**Worked example:** Illustrative: 6.8% of fee-paying packaged accounts show zero engagement for 12 months, against a 4% tolerance; £410k in fees in the year `[illustrative]`.

**Regulatory/governance hook:** PRIN 2A Price and Value outcome; FCA fair value feedback (September 2024 and 2025/26) (F-GM-01).

**Feasibility (panel view):**
- *Hardest part:* defining engagement.
- *False-positive risk:* low.
- *Disagreement:* the compliance lens notes cohort slicing must avoid proxies for protected attributes (age cohorts in particular).

---
# Bucket B -- net-new joins between substrate metrics and governance narrative

All Bucket B cards join substrate records (metrics, action logs, reconciliations, tests, change logs, restriction populations) with the governance narrative corpus (committee papers and minutes, escalation notes, attestation commentary, second-line challenge records, complaint narratives, aggregated speak-up cases). AI extraction from narrative is always marked, advisory and confirmed by a named person. Joins are framed at cohort, forum or business-unit level, never at the level of an individual complainant or whistleblower.

### UC-GM-B1 -- Dropped and reworded actions: "Did any risk action disappear between the working group and the BRC?"

- **Archetype:** Chain break (escalation) -- the Metro shape.
- **Bucket:** B.
- **Signal:** an action or risk raised in one forum's minutes is absent, downgraded, reassigned or reworded in the next forum's minutes or in the action log, without a recorded closure or override reason.
- **Cadence/trigger:** at every minute approval; quarterly index to the BRC.
- **Primary user → routed exec:** CRO (SMF4) → BRC chair (SMF10); company secretary; Head of Internal Audit (SMF5).
- **Provenance:** B-GM-02, F-GM-02 ("count of risk actions reassigned or dropped from committee minutes"), H-GM-01 (Metro row: "Culture & Escalation Layer"), Synthesis 2 ("flags deleted or reassigned risk actions"), Synthesis 3 item 6.

**1. Data aggregation (requirement)**
- *Substrate inputs:* action log (ID, owner, due date, status history, reassignment events); top-risk registers by forum; metric status series tied to each action.
- *Interaction inputs:* minutes and papers for working groups, steering groups (for example a financial crime steering group), operations risk boards, ERC, BRC; draft vs approved minute versions where available.

**2. Baseline creation (evidence)**
- *Dimensions:* forum × action × period × business unit.
- *Normal:* every action raised in a minute either appears in the action log and is carried to closure with evidence, or is explicitly closed or escalated in a later minute. GM's derived escalation-health measures: "average lag in days between an issue being logged in a working group and its escalation to the ERC/BRC" and "count of risk actions reassigned or dropped from committee minutes" (F-GM-02).
- *Seasonality:* forum calendar; holiday gaps.

**3. Dynamic detection (sufficiency) -- the time-aligned cross-domain correlation**
- For each action, align three series in time: (a) the narrative trail across forums (raised, discussed, reworded, absent); (b) the action log status history; (c) the linked metric or control status.
- Flag when the narrative trail ends (action no longer mentioned, or reworded as "lacking context", "not yet substantiated") **while** the action log shows it open, reassigned or deleted **and** the linked metric or control has not improved.
- Flag draft-to-final minute changes that remove an action.

**4. Distillation (attestation)**
- *Suppressed:* actions closed with evidence; reassignments with a recorded reason and approver.
- *Ranked by:* severity of the linked risk; number of forums the item passed through; days since last mention.
- *Who attests:* the forum chair confirms each flagged discontinuity (closed, merged, escalated or dropped); second line challenges; AI extraction of actions from minutes is marked and confirmed by the forum secretary.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* escalation-health index per forum and business unit (issue-to-escalation latency; dropped and reassigned actions), plus a list of unexplained discontinuities.
- *Correlation-evidence band:* **strong** where the minute trail ends, the action log shows deletion or reassignment and the metric is unchanged; **moderate** where only two of the three align; **weak** where the narrative is ambiguous (for example an action merged into another without a reference).
- *Recommended action:* propose that the item auto-surface on the BRC exception feed (UC-GM-A7) and that the forum chair records a reason.
- *Draft artifact:* BRC chair's note listing discontinuities, with minute extracts.
- *Human gate:* BRC chair decides follow-up. The platform never edits minutes.
- *Named hero element:* **escalation-health index** with a "minute trail" drill.

**Why it beats a self-built dashboard (why it is impossible without the join):** the action log alone shows a reassignment, which is normal. Minutes alone show a topic fading, which is normal. Only together, with the unchanged metric, do they show suppression. GM's first-line lens notes that when a metric is removed at a sub-committee "there is rarely an immutable audit trail visible to the second or third line" (B-GM-02).

**Differentiation:** requires the join -- does not exist today.

**Worked example:** GM anchors: Metro junior staff raised "Bad Data" concerns in 2017; a financial crime steering group deleted the review action from its January 2018 minutes "as lacking context and not yet substantiated"; an operations risk board ranked bad data among its top five risks between May and August 2018, then reassigned and dropped the actions after 16 August 2018; no periodic MI reached the BRC until an external firm was engaged in December 2018 (B-GM-02). Illustrative replay: the join flags January 2018 as a moderate-band discontinuity (minute removes action; the rejected-record backlog is assumed unchanged at GM's pre-fix rate of 1,352,665 a month from H-GM-01, an illustrative assumption `[illustrative]`) and August 2018 as strong (top-five risk dropped; actions reassigned then dropped, per GM; backlog unchanged). Issue-to-BRC latency for this item: over 18 months and counting `[illustrative]`.

**Regulatory/governance hook:** Metro Final Notice (12 November 2024), Principle 3, SYSC 6 (H-GM-01); FCA Consumer Duty board report review (December 2024) criticising minutes that ignored late remediation raised in lower-level packs (F-GM-01).

**Feasibility (panel view):**
- *Data needed:* minutes in text form across forums, consistent action IDs (often absent).
- *Hardest part:* linking minute text to action IDs where minutes do not cite them; AI proposes links, secretaries confirm.
- *False-positive risk:* medium-high; legitimate merges and closures recorded loosely in minutes.
- *Disagreement:* the NED supports it strongly (GM: committees "manage out" embarrassing data gaps); the first-line owner fears a chilling effect on candid working-group minutes; the regulatory adviser notes the index must be framed as governance health, not as an accusation against named individuals. Cohort framing: forum and business unit level.

---

### UC-GM-B2 -- Silent amber: "Which metrics have been amber for quarters without being discussed?"

- **Archetype:** Breach (persistence) × narrative silence.
- **Bucket:** B.
- **Signal:** a metric amber or red for N periods that has no substantive mention in the minutes of the forum that its routing rules assign it to.
- **Cadence/trigger:** quarterly at BRC pack build; monthly at ERC.
- **Primary user → routed exec:** CRO (SMF4) → BRC chair (SMF10); ERC chair.
- **Provenance:** B-GM-02 (persistent Level 2 ambers to the BRC), F-GM-01 (minutes recording "generic satisfaction"), domain profile join note ("a persistent amber never discussed").

**1. Data aggregation (requirement)**
- *Substrate inputs:* metric status series by Level; routing rules; pack contents (which metrics were in which pack).
- *Interaction inputs:* forum minutes; chair's reports; discussion records.

**2. Baseline creation (evidence)**
- *Dimensions:* metric × forum × period.
- *Normal:* a metric in a pack in amber or red receives a substantive minute entry (decision, action, challenge or explicit noting with reason) at least once per N periods.
- *Seasonality:* none.

**3. Dynamic detection (sufficiency) -- time-aligned correlation**
- Align metric status per period with minute coverage per period. Flag when status is amber or red for ≥ N periods **and** the minutes contain no substantive entry for that metric in the same window (only "noted" or nothing).

**4. Distillation (attestation)**
- *Suppressed:* metrics with an active remediation plan referenced in minutes within the window.
- *Ranked by:* Level, duration, trajectory.
- *Who attests:* forum secretary confirms the minute search; chair confirms.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* "3 ambers persisted 3+ quarters with no recorded discussion at ERC" `[illustrative]`.
- *Correlation-evidence band:* strong (in pack, no entry, worsening); moderate (in pack, noted only); weak (not in pack -- this becomes a routing break, UC-GM-A7).
- *Recommended action:* propose an agenda item at the next forum.
- *Draft artifact:* agenda paper stub.
- *Human gate:* chair accepts the agenda item.
- *Named hero element:* **exception feed** with a "discussed?" marker.

**Why it beats a self-built dashboard (why it is impossible without the join):** the metric series cannot show whether anyone discussed it; minutes cannot show that the metric has been amber for a year.

**Differentiation:** requires the join -- does not exist today.

**Worked example:** Illustrative: Level 2 "EDD backlog over 30 days" has been amber for 4 quarters at ERC; the minutes show "noted" twice and nothing twice; backlog rose from 210 to 640 cases `[illustrative]`.

**Regulatory/governance hook:** B-GM-02 routing practice `[practice-not-rule]`; FCA criticism of minutes lacking evidence of active challenge (F-GM-01).

**Feasibility (panel view):**
- *Hardest part:* deciding what "substantive" means; AI classification marked and confirmed.
- *False-positive risk:* medium.
- *Disagreement:* the CRO says ERC discusses in the room more than minutes record; the regulatory adviser replies that what is not minuted did not happen for enforcement purposes.

---

### UC-GM-B3 -- Same metric, different story: "Did the BRC receive a different picture from the one the ERC saw?"

- **Archetype:** Chain break (information asymmetry).
- **Bucket:** B.
- **Signal:** the narrative description of a metric or issue in a higher-forum paper differs materially from the lower-forum paper or the underlying series (status softened, value rounded favourably, denominator dropped, trend omitted).
- **Cadence/trigger:** at each pack build.
- **Primary user → routed exec:** CRO (SMF4) → BRC chair (SMF10).
- **Provenance:** B-GM-02 (filtering), H-GM-01 (Nationwide and Barclays comparative row: "automated or manual controls operated weaker in practice than reported to committees") `[scope]` for Barclays Stunt & Co, which GM places under historical precedents.

**1. Data aggregation (requirement)**
- *Substrate inputs:* metric series; pack data tables.
- *Interaction inputs:* paper narratives at ERC, BRC and board; chair's reports.

**2. Baseline creation (evidence)**
- *Dimensions:* metric × forum × period.
- *Normal:* the higher-forum narrative is consistent with the series and the lower-forum narrative: same status, same direction, denominators preserved.
- *Seasonality:* none.

**3. Dynamic detection (sufficiency) -- time-aligned correlation**
- For the same period, compare (a) the series value and status, (b) ERC paper language, (c) BRC paper language. Flag status softening ("broadly stable" against two adverse moves), missing denominators, or omitted trends.

**4. Distillation (attestation)**
- *Suppressed:* intended summarisation where the status and direction survive.
- *Ranked by:* Level and size of divergence.
- *Who attests:* the paper author confirms or corrects; the CRO signs the pack.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees (before the pack goes):* a pre-submission consistency check with each divergence.
- *Correlation-evidence band:* strong (status contradicts series); moderate (direction omitted); weak (denominator omitted only).
- *Recommended action:* propose a wording correction.
- *Draft artifact:* corrected paragraph, AI-marked.
- *Human gate:* paper author and CRO accept.
- *Named hero element:* a pack consistency check on the **RAS headline scorecard** drill.

**Why it beats a self-built dashboard (why it is impossible without the join):** the series is consistent with itself; the papers are consistent with themselves; only the comparison shows the softening.

**Differentiation:** requires the join -- does not exist today.

**Worked example:** GM anchor: the comparative row records controls "operated weaker in practice than reported to committees" (H-GM-01). Illustrative: ERC paper: "screening backlog 2,100 cases, up 38% on quarter, amber"; BRC paper: "screening operations broadly stable; remediation in hand" `[illustrative]`; strong band.

**Regulatory/governance hook:** Principle 11 and SUP 15.3 are not engaged by internal reporting, but GM's Metro and comparative cases show the enforcement consequence of weaker-than-reported controls (H-GM-01).

**Feasibility (panel view):**
- *Hardest part:* narrative-to-metric matching.
- *False-positive risk:* medium.
- *Disagreement:* the NED wants this as a pre-submission check only (helping the CRO), never a public score on authors; the regulatory adviser agrees. `[long-tail -- preserve]` as a GM-implied join.

---

### UC-GM-B4 -- Tension collision against the board's recorded trade-off: "Is a guardrail pair colliding, and did the board actually agree this trade-off?"

- **Archetype:** Tension collision.
- **Bucket:** B.
- **Signal:** a growth metric improves while its paired guardrail deteriorates past amber, and the board or BRC decision record for that pair is missing, stale or conditional on terms now breached.
- **Cadence/trigger:** monthly; event-driven on a threshold or policy change in either domain.
- **Primary user → routed exec:** CRO (SMF4) → board and BRC; CEO; first-line product owner.
- **Provenance:** G-GM-02 (four tension pairs and the guardrail-pair method), A-GM-04, Synthesis 2 ("Automated Metric-Tension & Trade-Off Analysis"), Synthesis 3 item 2.

**1. Data aggregation (requirement)**
- *Substrate inputs:* tension register (pairs stored as objects with partner metric, agreed trade-off, any regulatory floor, owner, review date); the four GM pairs: (1) digital onboarding velocity and conversion vs % of accounts transacting pre-CDD and VREQ high-risk onboarding breach count (target 0); (2) FTB and high-LTV share vs early arrears migration and cost of risk; (3) savings premium above market vs NIM floor and CET1 / leverage buffers; (4) vulnerable cohort identified and supported vs UK GDPR minimisation and consent audit pass rate (G-GM-02).
- *Interaction inputs:* board and BRC minutes recording each trade-off decision, its conditions and review date; ALCO minutes for pair 3; product governance minutes for pairs 1 and 2.

**2. Baseline creation (evidence)**
- *Dimensions:* pair × business line × month.
- *Normal:* GM's rule: "a first-line owner is only permitted to optimise the primary metric provided the paired guardrail metric remains in its Green zone" (G-GM-02) `[practice-not-rule]`; plus the conditions in the recorded decision.
- *Seasonality:* per metric.

**3. Dynamic detection (sufficiency) -- time-aligned correlation**
- Divergence in the pair (primary up, guardrail past amber) aligned with the decision record: flag when no decision exists, the review date has passed, or a recorded condition is breached.
- Hard rule: if the guardrail is a regulatory floor (pair 1's VREQ breach count), the pair is not a tension; any breach is routed as a breach (UC-GM-A4) and the card states the floor is not tradeable.

**4. Distillation (attestation)**
- *Suppressed:* divergence inside the band the board explicitly accepted, before its review date.
- *Ranked by:* floor involvement first, then distance past amber, then days past review date.
- *Who attests:* pair owner attests to both metrics; second line challenges; board records any re-set.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* tension register summary: each pair, both metrics, the agreed trade-off with its minute reference and date, and collision status.
- *Correlation-evidence band:* strong (diverging, no valid decision); moderate (diverging, decision exists but condition at risk); weak (one metric noisy).
- *Recommended action:* propose a board re-set of the trade-off, or a first-line throttle.
- *Draft artifact:* board paper section framing the choice; for floors, an escalation note instead.
- *Human gate:* board decides; no cost or ROI framing on financial crime floors.
- *Named hero element:* **tension register and guardrail pair**.

**Why it beats a self-built dashboard (why it is impossible without the join):** a paired chart shows divergence; it cannot say whether the board agreed to it, on what terms, or whether the terms lapsed. The decision lives only in minutes.

**Differentiation:** requires the join -- does not exist today. GM's competitor table rates MetricStream, ServiceNow, Archer and OpenPages "No" on metric-tension analysis and Protecht as "emerging conceptual thought leadership ... not an automated trade-off engine" (J-GM-03) `[marketing-grade]`.

**Worked example:** GM anchors: Skipton committed 50% of new lending to first-time buyers; Leeds "Income Plus" lends an average £66,000 more at 95% LTV; Leeds paid +0.90% above market in 2025; sector-wide extra savings interest £2.3bn in 2024 (A-GM-04, G-GM-02). Illustrative: in March 2026 the board minuted acceptance of FTB share up to 50% "provided early arrears migration stays below 1.2% and cost of risk below 20 bps, review September 2026" `[illustrative]`. By October 2026, FTB share is 49%, early arrears migration 1.35%, cost of risk 17 bps and the review has not occurred `[illustrative]`. Strong band: condition breached and review date passed.

**Regulatory/governance hook:** FSB RAF (2013) on appetite as accelerator and defence (A-GM-04); joint FCA/ICO statement on vulnerability and data protection referenced in the FCA's Consumer Duty Focus Areas (24 September 2026) for pair 4 (G-GM-02); Starling and Monzo VREQ breaches for pair 1 (H-GM-01).

**Feasibility (panel view):**
- *Data needed:* tension register (new object), board minutes.
- *Hardest part:* getting boards to record trade-offs with conditions in minutes.
- *False-positive risk:* medium.
- *Disagreement:* the first-line owner values the "permission to grow" framing; the regulatory adviser insists pair 1 is a floor, not a tension; the NED wants only collisions, not the full register, on the board view. GM labels this its "differentiator feature" (G-GM-02).

---

### UC-GM-B5 -- Attestation commentary against reconciliation evidence: "Are owners attesting to data they have not seen reconciled?"

- **Archetype:** Chain break (attestation).
- **Bucket:** B.
- **Signal:** a monthly attestation is signed with commentary claiming completeness while the reconciliation for that feed shows a gap, was not run, or the commentary repeats caveats month after month.
- **Cadence/trigger:** monthly before the ERC pack locks.
- **Primary user → routed exec:** CRO (SMF4) → metric owner; COO and CTO; SMF17.
- **Provenance:** D-GM-04 (monthly human attestation of the reconciliation, not only the value), Synthesis 1 item 4 (attestation strip), D-GM-02 (internal attestation practice `[practice-not-rule]`).

**1. Data aggregation (requirement)**
- *Substrate inputs:* reconciliation results per feed (from UC-GM-A3); attestation records (who, when, which metric).
- *Interaction inputs:* attestation commentary text; caveats; second-line challenge notes on attestations.

**2. Baseline creation (evidence)**
- *Dimensions:* metric × feed × owner role × month.
- *Normal:* attestation follows a passing reconciliation run in the same period; commentary caveats are resolved within N periods.
- *Seasonality:* none.

**3. Dynamic detection (sufficiency) -- time-aligned correlation**
- Attestation timestamp vs reconciliation timestamp and result: flag "attested complete" when no reconciliation ran or it failed.
- Commentary analysis: the same caveat ("minor timing differences", "known data issue, fix planned") repeated for ≥ 3 months `[illustrative]` while the reconciliation gap persists.
- Segregation check: the owner attests to their own control's test.

**4. Distillation (attestation)**
- *Suppressed:* timing-only caveats that clear by T+1.
- *Ranked by:* criticality of the metric's feed; caveat age.
- *Who attests:* this card tests the attesters; second line confirms each flag.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* attestation strip: per headline, owner, date, status and "commentary flags" count.
- *Correlation-evidence band:* strong (attested complete, reconciliation failed); moderate (attested with recurring caveat, gap persists); weak (attested before the run, run later passed).
- *Recommended action:* propose withholding or caveating the figure in the BRC pack.
- *Draft artifact:* challenge note to the owner.
- *Human gate:* CRO decides on caveating.
- *Named hero element:* **chain-integrity badge** (attestation segment).

**Why it beats a self-built dashboard (why it is impossible without the join):** the reconciliation log shows a gap; the attestation register shows a signature; only together, with the commentary, do they show that the signature was given over a known gap.

**Differentiation:** requires the join -- does not exist today.

**Worked example:** GM anchor: Metro's "Bad Data" rejections ran at about 1,352,665 a month before the July 2019 tactical fix (H-GM-01). Illustrative: the control owner attested "monitoring population complete" for 7 consecutive months with the comment "known reject backlog, tactical fix in progress"; reconciliation ran in only 2 of those months, both failing `[illustrative]`.

**Regulatory/governance hook:** GM's NED: "when an executive's name and timestamp appear next to a metric in the Board Risk Pack, behavioural accountability sharpens dramatically" (D-GM-04); FSMA s.66A(5) reasonable steps (D-GM-01).

**Feasibility (panel view):**
- *Hardest part:* firms rarely store attestation commentary in structured form.
- *False-positive risk:* low for strong band.
- *Disagreement:* the first-line owner warns attestation fatigue; the NED says that is the point; the CRO adopts monthly for financial crime feeds only, quarterly elsewhere (labelled practice).

---

### UC-GM-B6 -- Awareness clock from the narrative: "When did we first have information that 'reasonably suggests' a reportable matter?"

- **Archetype:** Reportability case.
- **Bucket:** B.
- **Signal:** escalation notes, steering-group minutes or second-line records show language indicating a potentially reportable matter well before the event's logged awareness timestamp in the reportability ledger.
- **Cadence/trigger:** event-driven on any reportability case; retrospective sweep quarterly.
- **Primary user → routed exec:** CRO (SMF4) → SMF16 (decision owner); SMF17.
- **Provenance:** C-GM-02 ("immediately" interpreted strictly; triage window; Metro chronology), C-GM-01, Synthesis 1 item 5.

**1. Data aggregation (requirement)**
- *Substrate inputs:* reportability ledger (from UC-GM-A10) with awareness, decision and notification timestamps; linked incident and control failure records.
- *Interaction inputs:* escalation notes; steering-group and working-group minutes; second-line challenge records; incident narratives.

**2. Baseline creation (evidence)**
- *Dimensions:* case × narrative source × date.
- *Normal:* the logged awareness date is within the firm's triage window of the first narrative record that "reasonably suggests" the matter (GM: typically 24 to 72 hours, a few days for complex technical bugs, C-GM-02 `[practice-not-rule]`).
- *Seasonality:* none.

**3. Dynamic detection (sufficiency) -- time-aligned correlation**
- For each case, find the earliest narrative record mentioning the same control, feed or population with risk language; compute the gap to the logged awareness date and to the decision date. Flag gaps beyond the triage window.

**4. Distillation (attestation)**
- *Suppressed:* earlier mentions confirmed by the SMF as unrelated.
- *Ranked by:* gap length; clocks engaged.
- *Who attests:* the deciding SMF reviews the narrative trail and records whether the awareness date stands; AI never re-dates it.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* on each ledger entry, "first narrative signal" date beside the logged awareness date.
- *Correlation-evidence band:* strong (explicit language about scale or breach); moderate (concern raised, unquantified); weak (topic mention only).
- *Recommended action:* propose that the SMF reviews the awareness date and the decision rationale.
- *Draft artifact:* chronology for the decision file.
- *Human gate:* SMF16 decides. The platform never files.
- *Named hero element:* **reportability decision ledger** with a chronology strip.

**Why it beats a self-built dashboard (why it is impossible without the join):** the ledger holds only the date someone logged awareness; the narrative holds the date the firm actually had the information. GM's Metro chronology is exactly that gap.

**Differentiation:** requires the join -- does not exist today.

**Worked example:** GM anchors: Metro: staff flagged "Bad Data" rejections in 2017; a report confirmed the scale in April 2018; the timestamp error was found on 17 April 2019; the FCA was notified on 29 May 2019 (C-GM-02). Starling, by contrast: discovery in January 2023, notification 16 February 2023 (C-GM-02). Illustrative: the chronology strip for a Metro-shaped case shows first narrative signal in 2017 (moderate band), scale confirmation April 2018 (strong band), logged awareness 17 April 2019, notification 29 May 2019: gaps of roughly 12 months from strong signal to logged awareness and 42 days from logged awareness to notification (computed from GM's dates).

**Regulatory/governance hook:** SUP 15.3.1R ("immediately it becomes aware, or has information which reasonably suggests"); Principle 11; FR7; COCON SC3 and SC4 as GM describes them (C-GM-01, C-GM-02).

**Feasibility (panel view):**
- *Hardest part:* matching narrative to case; sensitive because it can expose individuals.
- *False-positive risk:* medium.
- *Disagreement:* the regulatory adviser regards this as the most defensible use of the narrative corpus; the first-line owner fears it will be used against staff who raised concerns. Panel: it must be framed to protect those who raised concerns (they are the evidence of good culture), and it never re-dates anything automatically.

---

### UC-GM-B7 -- Unanswered second-line challenge: "Which challenges were raised, not resolved, and then breached?"

- **Archetype:** Chain break (challenge) leading to Breach.
- **Bucket:** B.
- **Signal:** a second-line challenge record on a metric, control or plan is closed without substantive response or left open, and the challenged item later breaches.
- **Cadence/trigger:** monthly; quarterly to BRC.
- **Primary user → routed exec:** CRO (SMF4) → BRC chair; first-line owner.
- **Provenance:** E-GM-01 (Line 2 provides "informed independent challenge"), F-GM-01 (minutes failing to evidence active challenge), F-GM-02 ("overdue challenges" in the escalation index).

**1. Data aggregation (requirement)**
- *Substrate inputs:* metric and control status series; issue log.
- *Interaction inputs:* second-line challenge records (text, date, response, closure); ERC minutes.

**2. Baseline creation (evidence)**
- *Dimensions:* challenge × object × business unit × quarter.
- *Normal:* challenges receive a substantive response within SLA; closure cites evidence.
- *Seasonality:* none.

**3. Dynamic detection (sufficiency) -- time-aligned correlation**
- Align challenge date, response quality (AI-classified: substantive, generic, none) and closure with the object's subsequent status. Flag challenges with generic or no response followed by an amber or red on the same object within a window.
- Report a "challenge predictive value": the share of breached objects that had an unresolved prior challenge.

**4. Distillation (attestation)**
- *Suppressed:* challenges withdrawn by second line with reason.
- *Ranked by:* breach severity.
- *Who attests:* second line confirms classification.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* "4 of 7 breaches this quarter had an unresolved second-line challenge beforehand" `[illustrative]`.
- *Correlation-evidence band:* strong (specific challenge, no response, same object breached); moderate (generic response); weak (related object).
- *Recommended action:* propose a BRC review of challenge closure discipline in the unit.
- *Draft artifact:* BRC paragraph.
- *Human gate:* BRC chair.
- *Named hero element:* **escalation-health index** (challenge segment).

**Why it beats a self-built dashboard (why it is impossible without the join):** challenge records are text; breaches are metrics. Without aligning them, nobody can show that second line saw it coming.

**Differentiation:** requires the join -- does not exist today.

**Worked example:** Illustrative: second line challenged the "EDD backlog" KRI calibration in June 2026 ("amber band too wide for current volumes"); first-line response "noted"; KRI breached red in September 2026 `[illustrative]`. GM anchor: Monzo's late-2019 third-party review flagged monitoring weaknesses before the failings found (E-GM-03).

**Regulatory/governance hook:** IIA Three Lines Model (2020) and BCBS principles as GM cites them (E-GM-01); FCA Consumer Duty board report review (F-GM-01).

**Feasibility (panel view):**
- *Hardest part:* challenge records are often emails, not structured.
- *False-positive risk:* medium.
- *Disagreement:* the CRO welcomes evidence of second line's value; the first-line owner objects to retrospective blame. Framing: unit-level, forward-looking.

---

### UC-GM-B8 -- Reasonable-steps evidence: "Has the SMF escalated resourcing strain on the record, and does capacity data back it?"

- **Archetype:** Position (capacity) × narrative (resource escalation).
- **Bucket:** B.
- **Signal:** capacity strain metrics (from UC-GM-A6) worsen without a corresponding resource escalation in minutes or notes; or a resource escalation is on record but no board decision follows.
- **Cadence/trigger:** monthly; quarterly to BRC; on demand for an SMF's reasonable-steps file.
- **Primary user → routed exec:** CRO (SMF4), SMF16, SMF17 → board; CEO.
- **Provenance:** E-GM-03 (Sonali Bank / Steven Smith 2016 MLRO precedent; Starling para 4.15; "Resource & Capability Strain Indicator ... logging formal resource escalation requests to the Board"), D-GM-01 ("Reasonable Steps Evidence Pack of challenges, escalations, and resource requests"), Synthesis 3 item 9.

**1. Data aggregation (requirement)**
- *Substrate inputs:* capacity ratio, backlog age, qualified FTE, alert and onboarding growth.
- *Interaction inputs:* resource requests in ExCo, ERC, BRC and board papers and minutes; SMF escalation notes; responses and decisions.

**2. Baseline creation (evidence)**
- *Dimensions:* SMF area × team × month.
- *Normal:* when strain crosses amber, a documented escalation follows within one cycle, and a decision (approve, defer with reason, reject with reason) follows within the next.
- *Seasonality:* budget cycle.

**3. Dynamic detection (sufficiency) -- time-aligned correlation**
- Strain amber or red with no escalation in the narrative (the SMF's exposure); escalation on record with no decision (the board's exposure); decision recorded but capacity unchanged after the committed date.

**4. Distillation (attestation)**
- *Suppressed:* strain covered by an approved plan on schedule.
- *Ranked by:* financial crime first; months unaddressed.
- *Who attests:* the SMF confirms the escalation record; the company secretary confirms decisions.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO and SMF17 see:* a timeline of strain against escalations and decisions; an exportable reasonable-steps pack.
- *Correlation-evidence band:* strong (strain red, no escalation or no decision for 2+ cycles); moderate (escalation vague); weak (strain amber only).
- *Recommended action:* propose a formal resource paper to the board.
- *Draft artifact:* resource request paper, AI-drafted and marked; reasonable-steps pack.
- *Human gate:* SMF submits; board decides. No cost or ROI trade-off framing against financial crime floors.
- *Named hero element:* **strategy strip** capacity indicator with a "resource escalation" timeline.

**Why it beats a self-built dashboard (why it is impossible without the join):** capacity metrics prove the strain; only minutes prove it was escalated and what the board decided. GM: the FCA penalised an MLRO who "failed to impress upon senior management how overstretched and under-resourced his department had become" (E-GM-03).

**Differentiation:** requires the join -- does not exist today.

**Worked example:** GM anchors: Sonali Bank (Steven Smith, 2016) `[scope]`; Starling Final Notice para 4.15 (E-GM-03). Illustrative: EDD backlog red for 3 months; SMF17's ERC paper in August 2026 requests 6 FTE; ExCo minute "defer to Q1 budget"; no board record; backlog doubles by November 2026 `[illustrative]`. Strong band for the board's exposure, and the SMF's pack shows the escalation.

**Regulatory/governance hook:** FSMA s.66A(5) (D-GM-01); Principle 3 (H-GM-01).

**Feasibility (panel view):**
- *Hardest part:* resource requests are scattered in budget papers.
- *False-positive risk:* low.
- *Disagreement:* the NED is wary of a tool that builds SMFs' personal defence files against the board; the regulatory adviser says that is exactly SMCR's design; the CRO frames it as a board decision prompt, with the pack as a by-product.

---

### UC-GM-B9 -- Speak-up silence against control strain: "Is zero whistleblowing in a high-growth unit healthy or a warning?"

- **Archetype:** Position × narrative (culture signal).
- **Bucket:** B.
- **Signal:** a business unit with rising control failures, overdue actions or growth strain shows speak-up volumes far below comparable units, or speak-up themes (aggregated) cluster on a control area that metrics show deteriorating.
- **Cadence/trigger:** quarterly; annual culture review.
- **Primary user → routed exec:** CRO (SMF4) → Whistleblowers' Champion (independent NED); BRC; HR director.
- **Provenance:** F-GM-02 (speak-up volumes under SYSC 18; "whether zero whistleblowing reports in a high-growth division reflects a healthy culture or a culture of fear"; Chapelle on profitable lines), F-GM-02 (Leeds "Your Voice" 8.4/10, 89% response across 1,653 respondents, June 2025).

**1. Data aggregation (requirement)**
- *Substrate inputs:* control failures, overdue actions, growth by unit; colleague survey participation and psychological safety scores by unit; HR grievance and non-financial misconduct rates.
- *Interaction inputs:* aggregated speak-up case themes (no individual cases); time to investigate.

**2. Baseline creation (evidence)**
- *Dimensions:* business unit × quarter (minimum cohort size enforced).
- *Normal:* speak-up rate per 100 colleagues within a band of comparable units; theme distribution.
- *Seasonality:* survey cycles.

**3. Dynamic detection (sufficiency) -- time-aligned correlation**
- Units in the top quartile for control strain and bottom quartile for speak-up rate and psychological safety. Theme clustering: aggregated themes match the control area that is deteriorating.

**4. Distillation (attestation)**
- *Suppressed:* cohorts below the minimum size (privacy); individual cases always.
- *Ranked by:* strain × silence.
- *Who attests:* Whistleblowers' Champion reviews; HR confirms.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* a small set of flagged units with both signals, labelled "requires human judgement".
- *Correlation-evidence band:* moderate at best; GM's panel says interpretation needs "human attestation and qualitative board judgement" (F-GM-02).
- *Recommended action:* propose a culture deep-dive by the Champion.
- *Draft artifact:* BRC note.
- *Human gate:* Champion and BRC.
- *Named hero element:* row on the **escalation-health index**.

**Why it beats a self-built dashboard (why it is impossible without the join):** silence is not visible in control data; strain is not visible in speak-up data.

**Differentiation:** requires the join -- does not exist today.

**Worked example:** Illustrative: the digital onboarding unit grew 60% in a year, has 9 overdue high-priority actions and 0 speak-up reports, against 3.1 per 100 colleagues elsewhere; psychological safety score 5.9 vs 7.4 `[illustrative]`.

**Regulatory/governance hook:** SYSC 18; COCON and the non-financial misconduct rules (July 2025 and April 2026 updates as GM describes) (F-GM-02).

**Feasibility (panel view):**
- *Hardest part:* privacy; minimum cohort sizes; access to speak-up data.
- *False-positive risk:* high.
- *Disagreement:* the regulatory adviser warns of data-protection limits and of chilling whistleblowing if the tool is seen as monitoring; the NED values it; the architect insists on aggregates only. `[long-tail -- preserve]`.

---

### UC-GM-B10 -- Complaint themes after a change: "Did a technology change break a customer journey before anyone noticed?"

- **Archetype:** Chain break (change) × customer narrative.
- **Bucket:** B.
- **Signal:** a complaint narrative theme on a journey spikes within days of a change log entry touching a control or system on that journey.
- **Cadence/trigger:** daily theme extraction; event-driven on changes.
- **Primary user → routed exec:** CRO (SMF4) → horizontal journey risk owner; CTO; SMF16.
- **Provenance:** D-GM-03 (horizontal risk owner needs "live dashboard visibility into customer complaints and root-cause trends along their journey" and "parameter, rule-logic, or threshold changes made by technology and engineering teams"), F-GM-01 (good practice: journey-based complaints root-cause analysis).

**1. Data aggregation (requirement)**
- *Substrate inputs:* change log; system-to-journey map; complaint counts by journey; manual override counts.
- *Interaction inputs:* complaint narratives (themes extracted by AI, aggregated).

**2. Baseline creation (evidence)**
- *Dimensions:* journey × theme × day.
- *Normal:* trailing theme rate per journey.
- *Seasonality:* product campaigns, payday.

**3. Dynamic detection (sufficiency) -- time-aligned correlation**
- A theme above band within N days after a change on a system mapped to that journey, with no other explanatory event.

**4. Distillation (attestation)**
- *Suppressed:* themes explained by a known outage already logged.
- *Ranked by:* complaint lift × vulnerable cohort share (aggregated).
- *Who attests:* journey risk owner confirms; CTO confirms change linkage.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* only when the theme concerns a control (for example customers reporting they could transact before verification, or blocked customers reporting money credited); journey-level otherwise.
- *Correlation-evidence band:* strong (theme spike starts within 72 hours of the change, single journey); moderate (within 2 weeks); weak (diffuse).
- *Recommended action:* propose a post-change test (UC-GM-A9) and a root-cause review.
- *Draft artifact:* incident note.
- *Human gate:* journey owner and CTO.
- *Named hero element:* chain-integrity badge (change) with a complaint theme overlay.

**Why it beats a self-built dashboard (why it is impossible without the join):** change logs do not record customer impact; complaints do not record which deployment caused them.

**Differentiation:** requires the join -- does not exist today.

**Worked example:** Illustrative: on 12 January 2027 a release changes onboarding verification order; within 48 hours complaints with the theme "account frozen after first payment" rise from 4 a day to 31 a day on the onboarding journey `[illustrative]`, implying customers transacted before checks completed (the Monzo shape: "allowed customers to transact before CDD completion", H-GM-01).

**Regulatory/governance hook:** Consumer Duty PRIN 2A consumer support outcome; Monzo Final Notice (07 July 2025) (H-GM-01); FCA Complaints and Root Cause Analysis review (December 2024) (F-GM-01).

**Feasibility (panel view):**
- *Hardest part:* system-to-journey mapping.
- *False-positive risk:* medium.
- *Disagreement:* the CRO says this is a first-line tool, shown at board altitude only when it touches a control; the NED agrees; the regulatory adviser wants vulnerable-cohort outcomes kept in, aggregated.

---

### UC-GM-B11 -- Manual overrides in the narrative: "Are service teams working around a restriction?"

- **Archetype:** Breach (restriction) × service narrative.
- **Bucket:** B.
- **Signal:** customer service case notes or complaint narratives describing manual credits, unblocks or workarounds for customers in a restricted population, aligned with override logs.
- **Cadence/trigger:** daily; monthly to SMF17.
- **Primary user → routed exec:** CRO (SMF4) → SMF17; head of customer operations.
- **Provenance:** H-GM-01 (CB Payments: "customer service manually credited e-money to 199 flagged customers"; leading indicator 2: "Count of unapproved customer service manual overrides") `[scope]`, D-GM-03 (line of sight into "manual overrides (such as customer service manual credits or bad-data folders)").

**1. Data aggregation (requirement)**
- *Substrate inputs:* restricted population (from UC-GM-A4); manual override and credit logs; approval records.
- *Interaction inputs:* service case notes; complaint narratives (customers complaining about restrictions and then reporting resolution).

**2. Baseline creation (evidence)**
- *Dimensions:* restriction × team × month.
- *Normal:* zero unapproved overrides on restricted customers.
- *Seasonality:* none.

**3. Dynamic detection (sufficiency) -- time-aligned correlation**
- Restricted customer complaint → case note with workaround language → override log entry, within days, without approval. Also: workaround language with no override log entry (off-system workaround).

**4. Distillation (attestation)**
- *Suppressed:* approved overrides with SMF17 delegation.
- *Ranked by:* count and value.
- *Who attests:* SMF17.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* "Restriction workarounds this month: 14 (11 logged, 3 off-system)" `[illustrative]`.
- *Correlation-evidence band:* strong (all three align); moderate (narrative plus log, no complaint); weak (narrative only).
- *Recommended action:* propose a service process fix and a restriction test expansion.
- *Draft artifact:* SMF17 note; input to reportability triage.
- *Human gate:* SMF17.
- *Named hero element:* **restriction adherence test** with an "override" lane.

**Why it beats a self-built dashboard (why it is impossible without the join):** override logs miss off-system workarounds; narratives alone cannot tell which customers are restricted.

**Differentiation:** requires the join -- does not exist today.

**Worked example:** GM anchor: 199 flagged customers manually credited at CB Payments `[scope]` (H-GM-01). Illustrative: in a month, 37 restricted customers complain about blocked accounts; case notes show 14 resolved by "manual release"; 3 have no override log entry `[illustrative]`.

**Regulatory/governance hook:** CB Payments Final Notice (23 July 2024), Principle 2 and VREQ breach `[scope]`; SUP 15.3.1R on significant VREQ breaches (C-GM-01).

**Feasibility (panel view):**
- *Hardest part:* access to service case notes.
- *False-positive risk:* medium.
- *Disagreement:* the first-line owner points out legitimate releases (vulnerable customers needing funds); the regulatory adviser says they must still be approved and logged. Cohort framing at team level.

---

### UC-GM-B12 -- Committee assurance claims against control test outcomes: "Did we tell a committee a control was effective when tests said otherwise?"

- **Archetype:** Chain break (assurance claim).
- **Bucket:** B.
- **Signal:** a paper or minute states a control is "operating effectively", "embedded" or "remediated" while the latest control tests, audit ratings or outcome metrics contradict it.
- **Cadence/trigger:** at every pack build.
- **Primary user → routed exec:** CRO (SMF4) → BRC chair; SMF5 and Audit Committee chair (SMF11).
- **Provenance:** H-GM-01 (comparative row: "controls operated weaker in practice than reported to committees"; "controls were assumed effective based on high-level status reporting without deep-dive outcome verification") `[scope]` for the Barclays Stunt & Co and Nationwide historical precedents as GM groups them; E-GM-02 (audit ratings).

**1. Data aggregation (requirement)**
- *Substrate inputs:* control tests; audit ratings; outcome KRIs.
- *Interaction inputs:* committee papers and minutes with assurance statements.

**2. Baseline creation (evidence)**
- *Dimensions:* control × forum × period.
- *Normal:* assurance language consistent with the latest test result and audit rating.
- *Seasonality:* none.

**3. Dynamic detection (sufficiency) -- time-aligned correlation**
- Assurance claim date vs latest test date and result: flag claims made after a failed test, or claims with no test in the period.

**4. Distillation (attestation)**
- *Suppressed:* claims qualified correctly ("effective subject to remediation of X").
- *Ranked by:* control criticality.
- *Who attests:* paper author; SMF5 for audit consistency.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* pre-submission check listing claims without support.
- *Correlation-evidence band:* strong (claim after failed test); moderate (no test); weak (test passed with exceptions).
- *Recommended action:* propose rewording or a test.
- *Draft artifact:* corrected paragraph.
- *Human gate:* CRO and author.
- *Named hero element:* **OperationalAssuranceVerdict** (v6, built but not wired) beside each claim.

**Why it beats a self-built dashboard (why it is impossible without the join):** claims are text; evidence is test data.

**Differentiation:** requires the join -- does not exist today.

**Worked example:** GM anchor: Barclays £39.3m Stunt & Co Final Notice, as GM cites it, missed clear AML warning signs and law enforcement alerts (H-GM-01) `[scope]`. Illustrative: BRC paper of 11 September 2026: "transaction monitoring controls operating effectively"; latest test (July 2026) failed on scenario coverage; audit rating "Needs Improvement" `[illustrative]`.

**Regulatory/governance hook:** Principle 3; SYSC 6 (H-GM-01).

**Feasibility (panel view):**
- *Hardest part:* claim extraction.
- *False-positive risk:* medium.
- *Disagreement:* SMF5 lens (via the CRO) worries about the second line policing papers; the NED wants it. `[long-tail -- preserve]` because GM's evidence for this row is the weakest-sourced (LearnSignal guides citing other notices).

---

### UC-GM-B13 -- Consumer Duty board report challenge test: "Does the board report's 'good outcomes' claim survive the outcome MI and the action log?"

- **Archetype:** Chain break (assurance claim) × Consumer Duty outcome.
- **Bucket:** B.
- **Signal:** the annual Consumer Duty board report or Duty-related minutes record satisfaction with progress while outcome tolerances are breached, cohort outcomes are worse for vulnerable customers, or remediation actions from lower packs are late; or minutes show no active challenge by the board or the Consumer Duty Champion.
- **Cadence/trigger:** annual board report drafting; quarterly Duty MI.
- **Primary user → routed exec:** CRO (SMF4) and SMF16 → board; Consumer Duty Champion.
- **Provenance:** F-GM-01 (PRIN 2A.8.3R to 2A.8.5R; FCA December 2024 review; poor practice: no thresholds, generic satisfaction, ignoring late remediation, no evidence of challenge), Synthesis 3 item 8.

**1. Data aggregation (requirement)**
- *Substrate inputs:* outcome MI by the four outcomes and journeys; tolerances; cohort outcomes (vulnerable vs not, aggregated); complaints and FOS outcomes; remediation action log.
- *Interaction inputs:* board report draft; board, BRC and Duty committee minutes; Champion challenge records; complaint narratives (themes).

**2. Baseline creation (evidence)**
- *Dimensions:* outcome × journey × cohort × quarter.
- *Normal:* each outcome has a tolerance (GM: poor-practice firms "failed to define statistical thresholds or clear qualitative tolerances"); report claims match MI; late actions are disclosed.
- *Seasonality:* annual cycle.

**3. Dynamic detection (sufficiency) -- time-aligned correlation**
- Report or minute claims ("good outcomes delivered", "Duty embedded") vs outcome tolerances, cohort gaps and late actions over the same period; absence of challenge language in minutes.

**4. Distillation (attestation)**
- *Suppressed:* claims qualified with the gap and action.
- *Ranked by:* vulnerable cohort gaps first.
- *Who attests:* SMF16 drafts; the board approves the report (PRIN 2A.8); the Champion records challenge.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* report readiness view: each claim with its supporting MI, cohort gaps and late actions.
- *Correlation-evidence band:* strong (claim contradicts MI); moderate (no tolerance defined); weak (challenge not minuted).
- *Recommended action:* propose rewording and an action plan.
- *Draft artifact:* report section drafts, AI-marked.
- *Human gate:* board approves the report.
- *Named hero element:* Consumer Duty outcome panel (four outcomes × journeys) with a claim-check drill.

**Why it beats a self-built dashboard (why it is impossible without the join):** the MI shows outcomes; only the report and minutes show what the board claimed and whether it challenged.

**Differentiation:** requires the join -- does not exist today.

**Worked example:** Illustrative: board report draft claims "customers in financial difficulty receive good support"; journey MI shows SLA breach rate on vulnerable support queues at 14% against a 5% tolerance; 2 of 5 remediation actions late; minutes show no Champion challenge in 3 meetings `[illustrative]`.

**Regulatory/governance hook:** PRIN 2A.8.3R to 2A.8.5R; FCA Consumer Duty Board Reports good and poor practice (December 2024); Consumer Duty Focus Areas (updated 07 May 2026 and 24 September 2026) (F-GM-01); K-5 (FCA benchmarks against best in market).

**Feasibility (panel view):**
- *Hardest part:* journey-level MI with tolerances.
- *False-positive risk:* low-medium.
- *Disagreement:* the compliance lens flags cohort slicing that could proxy protected attributes; insight is permissible, differential action needs human and risk review.

---

### UC-GM-B14 -- Fair value narrative against engagement data: "Is our fair value assessment just a competitor benchmark?" `[long-tail -- preserve]`

- **Archetype:** Chain break (assurance claim) × Consumer Duty price and value.
- **Bucket:** B.
- **Signal:** a fair value assessment's narrative relies on competitor benchmarking while internal data shows inactive fee-paying customers or poor non-financial support outcomes.
- **Cadence/trigger:** annual per product; on product changes.
- **Primary user → routed exec:** CRO (SMF4) → SMF16; product governance committee.
- **Provenance:** F-GM-01 (FCA rejected fair value assessments that say "charges are roughly in line with competitors"), A-GM-05 (zero-engagement fee-paying share).

**1. Data aggregation (requirement)**
- *Substrate inputs:* inactive fee-paying share (UC-GM-A20); support SLA outcomes; complaints by product.
- *Interaction inputs:* fair value assessment text; product governance minutes.

**2. Baseline creation (evidence)**
- *Dimensions:* product × year.
- *Normal:* the assessment evaluates lifetime cost against benefits received and addresses inactive customers.
- *Seasonality:* annual.

**3. Dynamic detection (sufficiency)**
- Benchmark-only narrative and inactive share above tolerance in the same period.

**4. Distillation (attestation)**
- *Suppressed:* assessments that address the gap.
- *Ranked by:* fees from inactive customers.
- *Who attests:* product owner; SMF16.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* products with unsupported fair value conclusions.
- *Correlation-evidence band:* strong (benchmark-only plus breach); moderate; weak.
- *Recommended action:* propose re-assessment.
- *Draft artifact:* assessment gap note.
- *Human gate:* product governance.
- *Named hero element:* Consumer Duty outcome panel (price and value).

**Why it beats a self-built dashboard (why it is impossible without the join):** the assessment text and the engagement data live apart.

**Differentiation:** requires the join -- does not exist today.

**Worked example:** Illustrative: packaged account assessment concludes "fees in line with top-5 peers"; 6.8% of fee-payers inactive 12 months; £410k fees `[illustrative]`.

**Regulatory/governance hook:** PRIN 2A price and value; FCA fair value feedback (September 2024, 2025/26) (F-GM-01).

**Feasibility (panel view):** hardest part: assessment texts vary. False-positive risk: low. Disagreement: the NED sees this as SMF16 territory, not board altitude, unless material.

---

### UC-GM-B15 -- Supervisory attestation against the population test: "Does what we attest to the supervisor match what the data shows?"

- **Archetype:** Reportability case × restriction.
- **Bucket:** B.
- **Signal:** a periodic VREQ or s166 attestation draft states compliance or progress that the population test, override log or remediation milestones do not support.
- **Cadence/trigger:** each attestation cycle (quarterly or six-monthly where a supervisor requires it).
- **Primary user → routed exec:** CRO (SMF4) and SMF17 → attesting SMF; board.
- **Provenance:** D-GM-02 (bespoke supervisory VREQ or s166 attestation `[practice-not-rule]`; GM tags the claim `[conflict]`), K-2, H-GM-01.

**1. Data aggregation (requirement)**
- *Substrate inputs:* population test results (UC-GM-A4); overrides (UC-GM-B11); remediation milestone log.
- *Interaction inputs:* attestation draft text; previous attestations; supervisor correspondence held as records.

**2. Baseline creation (evidence)**
- *Dimensions:* restriction × attestation period.
- *Normal:* each statement in the attestation maps to evidence in the period.
- *Seasonality:* none.

**3. Dynamic detection (sufficiency) -- time-aligned correlation**
- Statement-by-statement check: "no breaches in the period" vs breach count; "milestone X complete" vs milestone log; drift between successive attestations' language and the trend.

**4. Distillation (attestation)**
- *Suppressed:* none; every unsupported statement is shown.
- *Ranked by:* materiality.
- *Who attests:* the attesting SMF, after second-line review.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* attestation readiness: statements supported, unsupported, partly supported.
- *Correlation-evidence band:* strong (contradicted); moderate (no evidence); weak (evidence stale).
- *Recommended action:* propose corrections before signature; open reportability triage if a contradiction exists for a prior attestation.
- *Draft artifact:* corrected attestation draft, AI-marked; the platform never submits it.
- *Human gate:* SMF signs and submits outside the platform.
- *Named hero element:* **restriction adherence test** linked to an attestation panel.

**Why it beats a self-built dashboard (why it is impossible without the join):** the attestation is narrative; the evidence is data.

**Differentiation:** requires the join -- does not exist today.

**Worked example:** GM anchors: Starling moved from the September 2021 VREQ to zero monthly breaches in April 2024 (31 months), 14 months after the January 2023 discovery (K-6); GM records periodic VREQ compliance reporting to the Authority (D-GM-02). Illustrative: the Q3 2026 draft says "no high-risk onboardings in the period"; the population test shows 6, all via a group migration `[illustrative]`.

**Regulatory/governance hook:** Starling Final Notice (02 October 2024); SUP 15.3.1R on VREQ breaches; Principle 11 (C-GM-01).

**Feasibility (panel view):**
- *Hardest part:* attestation templates are bespoke per supervisor.
- *False-positive risk:* low.
- *Disagreement:* GM's K-2 shows six-monthly SMF certification to the regulator is not a rule; the card applies only where a VREQ or s166 requires attestation, and labels practice as practice.

---

### UC-GM-B16 -- Appetite waiver conditions: "Are the conditions the board attached to a waiver being met?"

- **Archetype:** Breach (waiver condition) × decision record.
- **Bucket:** B.
- **Signal:** a board or BRC minute grants an appetite waiver or temporary limit with conditions and an expiry, and metrics show a condition breached or the expiry passed without renewal.
- **Cadence/trigger:** monthly; at expiry.
- **Primary user → routed exec:** CRO (SMF4) → board; first-line owner.
- **Provenance:** B-GM-02 (board receives "any Level 1 Red or Amber metrics requiring a strategic trade-off or appetite waiver"), A-GM-04 (appetite recalibration for growth), Synthesis 1 item 3. `[long-tail -- preserve]`

**1. Data aggregation (requirement)**
- *Substrate inputs:* RAS register with temporary limits; metric series.
- *Interaction inputs:* board and BRC minutes granting waivers; conditions; expiry dates.

**2. Baseline creation (evidence)**
- *Dimensions:* waiver × condition × month.
- *Normal:* conditions met; expiry renewed or limit restored.
- *Seasonality:* none.

**3. Dynamic detection (sufficiency) -- time-aligned correlation**
- Condition metric past its stated bound; expiry passed with the temporary limit still in force in the register.

**4. Distillation (attestation)**
- *Suppressed:* none.
- *Ranked by:* L1 first.
- *Who attests:* waiver owner.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* waiver list with conditions and status.
- *Correlation-evidence band:* strong (register still shows expired waiver); moderate (condition breached); weak (condition at risk).
- *Recommended action:* propose renewal or restoration for board decision.
- *Draft artifact:* board decision paper.
- *Human gate:* board.
- *Named hero element:* decisions panel (persona screen 3).

**Why it beats a self-built dashboard (why it is impossible without the join):** the register shows a limit; the conditions live only in minutes.

**Differentiation:** requires the join -- does not exist today.

**Worked example:** Illustrative: in April 2026 the board raised the high-LTV share limit from 20% to 25% for 6 months, conditional on automated income verification covering 100% of such loans; in October 2026 coverage is 88% and the 25% limit is still in the register after expiry `[illustrative]`.

**Regulatory/governance hook:** FSB RAF (2013); PRA ICAA 3.1 (A-GM-01).

**Feasibility (panel view):** hardest part: waivers are often informal. False-positive risk: low. Disagreement: the NED wants every waiver on the board view; the CRO wants only those at risk.

---

### UC-GM-B17 -- Profit blind spot: "Is challenge thinnest where the business is most profitable?" `[long-tail -- preserve]`

- **Archetype:** Position × narrative (challenge density).
- **Bucket:** B.
- **Signal:** the most profitable or fastest-growing business lines receive the least second-line challenge and board discussion per unit of risk.
- **Cadence/trigger:** annual; with the RAS refresh.
- **Primary user → routed exec:** CRO (SMF4) → BRC chair; remuneration committee.
- **Provenance:** F-GM-02 (Ariane Chapelle: "the risks most likely to strike a firm severely are those occurring in the most profitable parts of the business"; bonus structures "subtly blinding management").

**1. Data aggregation (requirement)**
- *Substrate inputs:* profit and growth by business line; risk metrics by line.
- *Interaction inputs:* challenge records and minute coverage by line.

**2. Baseline creation (evidence)**
- *Dimensions:* business line × year.
- *Normal:* challenge and discussion roughly proportional to risk exposure.
- *Seasonality:* none.

**3. Dynamic detection (sufficiency)**
- High profit or growth, high risk, low challenge density.

**4. Distillation (attestation)**
- *Suppressed:* small lines.
- *Ranked by:* exposure × under-challenge.
- *Who attests:* CRO.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* a short ranked list, not a matrix.
- *Correlation-evidence band:* weak to moderate; judgement required.
- *Recommended action:* propose a BRC deep-dive.
- *Draft artifact:* BRC agenda note.
- *Human gate:* BRC chair.
- *Named hero element:* row on the escalation-health index.

**Why it beats a self-built dashboard (why it is impossible without the join):** profitability is in finance data; challenge density is in narrative.

**Differentiation:** requires the join -- does not exist today.

**Worked example:** Illustrative: specialist buy-to-let lending is 31% of profit and 24% of credit risk-weighted assets but received 6% of second-line challenges and 2 minute entries in 12 months `[illustrative]`.

**Regulatory/governance hook:** practice and expert view as GM cites it, not a rule `[practice-not-rule]`.

**Feasibility (panel view):** hardest part: measuring challenge density fairly. False-positive risk: high. Disagreement: the NED likes it as a provocation; the CRO fears it reads as an accusation.

---

### UC-GM-B18 -- Vulnerability evidence against data minimisation: "Are we recording vulnerability in a way that is both useful and lawful?" `[long-tail -- preserve]`

- **Archetype:** Tension collision (pair 4).
- **Bucket:** B.
- **Signal:** vulnerability identification rises or falls in ways the narrative shows are driven by over-capture (raw medical detail in notes) or under-capture (complaints by customers with support needs not identified).
- **Cadence/trigger:** quarterly.
- **Primary user → routed exec:** CRO (SMF4) → SMF16; DPO.
- **Provenance:** G-GM-02 (pair 4; joint FCA/ICO statement; "recording support needs rather intrusive raw medical data").

**1. Data aggregation (requirement)**
- *Substrate inputs:* vulnerable cohort identification rate; consent audit pass rate.
- *Interaction inputs:* case note language (aggregated classification: support need vs raw health detail); complaint narratives indicating unrecognised support needs.

**2. Baseline creation (evidence)**
- *Dimensions:* journey × quarter.
- *Normal:* identification within band; notes record support needs, not diagnoses.
- *Seasonality:* none.

**3. Dynamic detection (sufficiency)**
- Over-capture: share of notes with raw health detail above tolerance. Under-capture: complaints showing unrecognised needs while identification is flat.

**4. Distillation (attestation)**
- *Suppressed:* individual notes never shown; aggregates only.
- *Ranked by:* journey.
- *Who attests:* SMF16 and DPO.

**5. Surfacing and routing (gap / escalation)**
- *What the CRO sees:* pair 4 in the tension register.
- *Correlation-evidence band:* moderate.
- *Recommended action:* propose guidance or training.
- *Draft artifact:* SMF16 and DPO note.
- *Human gate:* SMF16 and DPO.
- *Named hero element:* tension register.

**Why it beats a self-built dashboard (why it is impossible without the join):** identification rates cannot show what is written or missed.

**Differentiation:** requires the join -- does not exist today.

**Worked example:** Illustrative: 9% of notes tagged vulnerable contain diagnosis-level detail; complaints with unrecognised support needs rose 22% `[illustrative]`.

**Regulatory/governance hook:** joint FCA/ICO statement referenced in the FCA's Consumer Duty Focus Areas (24 September 2026) (G-GM-02); UK GDPR.

**Feasibility (panel view):** hardest part: reading case notes is itself a data-protection question; processing must be minimised. False-positive risk: medium. Disagreement: the regulatory adviser says this card must pass a DPIA before build; the NED questions board relevance.

---
# Panel Notes

## Sharpest disagreements (surfaced, not averaged)

1. **Over-reporting versus under-reporting (UC-GM-A10, A11, B6).** GM's own panel splits. The UK regulatory and enforcement adviser treats late notification as the career-ending risk: it turns a Principle 2 or 3 failure into a Principle 11 / FR7 and Senior Manager Conduct Rules 3 and 4 matter, and GM's Metro chronology (scale known April 2018, notified 29 May 2019) is the anchor. The CRO and the first-line owner fear defensive over-reporting that brings regulator read-across information requests and a "supervisory watch-list" (C-GM-02). The NED's resolution, a contemporaneous SMF-signed materiality record for "not reportable" calls, is adopted as the product position, but the tension stays live in how wide the triage window is set and how aggressively the narrative awareness clock (B6) is applied. Unresolved: whether B6 should be visible to the BRC or only to the deciding SMF.

2. **Amber fatigue versus early warning (UC-GM-A1, A7, B2).** The first-line owner says Level 3 bands are set so sensitive that seasonal spikes create "perpetual amber fatigue"; the CRO says without buffers high-velocity risks breach Level 1 before management can meet (A-GM-02). The NED adds a third view: nothing below a Level 1 threat belongs on the board view. The panel does not average: routing rules decide altitude (L2 projections to ERC, L1 to BRC), seasonality is declared in the calibration rationale rather than by widening amber, and persistent ambers auto-escalate. The open question is N (persistence periods) and whether the firm or the product sets the default.

3. **How much of the narrative corpus to mine (UC-GM-B1, B5, B6, B7, B9).** The NED and regulatory adviser want minutes, attestation commentary and challenge records joined against metrics because that is the only place suppression shows. The first-line owner fears a chilling effect on candid working-group minutes and on speak-up, and that retrospective joins will be used to blame individuals who were in fact raising concerns. The architect lens adds that minutes rarely carry action IDs, so linking is AI-proposed and secretary-confirmed, with real false-positive cost. Agreed guard-rails: forum and business-unit cohort framing, never individual scoring; those who raised concerns are evidence of good culture; speak-up only in aggregates above a minimum cohort size; nothing is re-dated or re-worded by AI.

4. **Agentic-AI financial crime as an entry point (UC-GM-A13, A18).** GM's Synthesis 4 is unusually decisive: governing external customer payment agents is not credible now (JPMorgan and Citi block them; mid-tier firms are fined for foundational feed and filter failures, not agent exploits), but "Board and SMF4/SMF17 governance of AI-driven financial crime controls and SS1/23 model risk" is a sharp wedge. The NED likes the wedge for buyer resonance; the regulatory adviser (and the product profile) warns against leading with agentic AI before UK rules exist; the CRO wants model risk inside the RAS scorecard rather than a separate module, which GM itself recommends (I-GM-01). Kept as a scorecard row and a single KRI, not a demo beat. GM's vendor percentages are `[marketing-grade]` and its "30 minutes to under 20 seconds" claim is "partly supported" with a `[conflict]` tag (K-7).

## Five strongest UI candidates

1. **Restriction adherence test with denominator and override lane** (UC-GM-A4 with B11 and B15). Population test, customers vs accounts, coverage by product and migration route, months since last zero-breach month, plus off-system workarounds from service narratives. GM anchor: 54,359 accounts for 49,183 customers, 294 previously exited; CB Payments 1,034 migrated and 199 manual credits `[scope]`. This is demo beat 3 in the run configuration.
2. **Chain-integrity badge with completeness denominator and silent-control check** (UC-GM-A2, A3, B5). "Records reconciled 94.0% (2,256,000 of 2,400,000)" `[illustrative]`; green turns to "unverified" when the feed, the attestation or the alert rate fails. GM anchors: 39 of 3,088 designated persons; 60,483,951 of 1,008,426,668 transactions. This is demo beat 2.
3. **Strategy strip with capacity indicator** (UC-GM-A6 with B8). Each growth objective shows appetite consumed and whether financial crime control capacity is keeping pace, with the resource escalation timeline behind it. GM anchors: Starling 43k → 3.6m; Nottingham's deliberate throttle from £1.2bn to £0.9bn. This is demo beat 1.
4. **Escalation-health index with minute-trail drill** (UC-GM-B1 with A7 and B2). Issue-to-escalation latency, dropped and reassigned actions, silent ambers, override log. GM anchor: the Metro January 2018 minute deletion and the post-16 August 2018 drop. The single strongest Bucket B join in this source.
5. **Reportability decision ledger with chronology strip** (UC-GM-A10 with B6). Multi-clock (SUP 15.3, FR7, SUP 15.11 Form C/D, OFSI, NCA SAR, ICO 72 hours), named SMF decision, "first narrative signal" beside logged awareness, and the Starling-versus-Metro contrast as the precedent link.

Runner-up: **tension register with board decision conditions** (UC-GM-B4), GM's self-declared "differentiator feature", with four concrete pairs.

## Recall note -- GM gems to preserve at merge

- **Exact enforcement denominators and timelines** (H-GM-01, C-GM-02): Starling 39 of 3,088; zero individual alerts 01 July 2022 to 30 January 2023; 14-day re-screen interval; reconfigured 10 February 2023, notified 16 February 2023, 3.5m re-screened by 24 February 2023, credit at para 2.11; zero-breach month April 2024 (31 months after the VREQ). Metro 60,483,951 of 1,008,426,668 (about 6%, £51.25bn of £675.8bn); 166,358 timestamp-excluded plus 71,627 others; rejections cut from 1,352,665 to 438 a month; 3,135-customer discrepancy in July 2020; 153 SARs and 43 closures; timestamp error found 17 April 2019, notified 29 May 2019. Monzo £21,091,300 including a £10.0m deterrence uplift on £805,250. CB Payments `[scope]`: earlier VREQ draft, four unmapped questions, one-record test, 1,034 migrated customers, 199 manual credits, 62 SARs (about $1.75m).
- **Metro minute-deletion sequence** (B-GM-02): the only source text in GM that directly evidences a governance-narrative join (UC-GM-B1).
- **Escalation filtering rule set** (B-GM-02): ERC all reds and ambers across L1–L3; BRC all L1, all L2 reds, persistent L2 ambers (two or more consecutive quarters or adverse arrow); board 10–12 headlines plus waivers plus BRC chair's report. `[practice-not-rule]`
- **Nine-domain leading/lagging pair table** (A-GM-05), including financial crime leading indicators "daily data-feed reconciliation discrepancy count" and "high-risk onboarding velocity to qualified analyst headcount and backlog age", and the "tortoises and hares" velocity distinction.
- **Four named guardrail pairs** (G-GM-02), especially pair 4 (vulnerability vs UK GDPR minimisation) and pair 3 (member savings premium vs NIM and CET1, with £2.3bn sector-wide and Leeds +0.90%).
- **Full notification clock table** (C-GM-01) including SUP 15.11 Form C/D within 7 business days and annual REP008, plus the 24–72 hour triage window `[practice-not-rule]` (C-GM-02).
- **Self-identification ratio** (E-GM-02) `[single]`, **dual-axis horizontal/vertical ownership** (D-GM-03) and **monthly attestation of the reconciliation, not the value** (D-GM-04).
- **Resource-escalation precedent** (E-GM-03): Starling para 4.15 and Sonali Bank / Steven Smith 2016 `[scope]`; and Peter Cummings / Bank of Scotland 2012 `[scope]` (A-GM-04).
- **Building society statutory limits** (J-GM-01): nature limit 75%, funding limit 50% with wholesale "well below 31.5%" in practice; the 2024 Amendment Act. `[single]`
- **Board disclosure benchmarks** (B-GM-01): Nationwide about 12 headlines (CET1 19.1%, leverage 5.3%, LCR 169%, cost of risk 11 bps, BoE stress low-point 14.5%); Leeds about 11 (CET1 25.5%, arrears 0.57%, off-track on three climate targets then re-baselined to 2034); Nottingham about 8 with directional arrows and a 25% deliberate lending cut; Shawbrook 40% downside scenario weight, cost of risk 47/51 bps, time-to-offer cut by 46%.
- **Six buying triggers** (J-GM-02), including FCA Register changes to SMF4/SMF10/SMF16/SMF17 and peer Final Notices; **paid PoC band £25k–£100k over 8–12 weeks** `[single]` and the BSA Associate Member route (49 firms) (J-GM-04).
- **Competitor capability grid** (J-GM-03) `[marketing-grade]`: incumbents "No" on metric-tension analysis; Protecht the sharpest UK mid-tier rival.
- **GM's verdicts on practitioner claims** (K-1 to K-7): 10–12 metrics "partly supported" (board summary yes, full schedule 25–45 no); six-monthly SMF certification "not supported" as a rule; building societies about 25% "confirmed" with breakdown; JPMorgan and Citi "confirmed" for third-party agents; 12–18 months to build "confirmed"; 30 minutes to 20 seconds "partly supported".
- **Agentic-AI verdict** (Synthesis 4): reframe to SS1/23 governance of AI-driven financial crime controls; not external agent governance.

## Problems reading the source (for the merge)

- Inline citation markers are superscript numbers keyed to an unnumbered-in-text works-cited list; they were not used for attribution. Sources are cited only where GM's "Source:" lines or body text name them.
- Lost symbols, left unreconstructed: arrows in the cascade chains (A-GM-01, Synthesis 2 and 3); the Greek-letter sensitivities in the IRRBB row (A-GM-05); the climate intensity unit; Nationwide's leverage target and its comparison value (B-GM-01); the persistence count in Synthesis 1 item 3 (this file uses "two or more consecutive quarters" from B-GM-02 instead); the Google Cloud SLA uptime and downtime figures (I-GM-04); three figures or images at lines 19, 1300, 1588 and 1680 of the text conversion.
- Metro penalty appears as £16,675,200 (H-GM-01), £16.67m (C-GM-02) and £16.68m (J-GM-02, Synthesis 4); the exact figure is used where precision matters.
- J-GM-01's table gives tier 2 as £10bn–£65bn, while its product implication targets "Tier 2 and Tier 3 building societies (assets £2bn–£45bn)"; internal inconsistency in GM, not resolved here.
- Some GM sources are secondary or dated after the events they describe (for example LearnSignal and BankingNewsAI guides "reviewed 21 October 2026" or "22 October 2026"); facts drawn from them are kept but should be verified against the Final Notices at merge.
- GM does not mention PS26/2, PS7/26 or SMCR Phase 1/Phase 2 (CP14/26); where this file refers to them it is tagged `[NEW -- beyond file]`.
