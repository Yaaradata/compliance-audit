**Engine tag: GP (ChatGPT)** -- Stage 1 per-source use-case mining, UK Risk Board View run

# UK Risk Board View -- Stage 1 Use-Case Mining (source: GP Stage 0 report)

- **Source mined:** `chatgpt.md` (GP Stage 0 output, research cut-off 27 October 2026), finding IDs A-GP-01 to K-GP-07 plus the GP Synthesis. No other engine report and no merged corpus was read.
- **Run configuration:** Yaara Risk & Compliance, UK Board Risk View; primary persona CRO (SMF4) at board altitude; intent sales demo; governance compliance plus executive; engines GP, OP and GM (PX not run, by user decision).
- **Date of mining:** 27 October 2026.

## Framing -- how this run read the source

GP's report is the most rule-literal and evidence-cautious of the three framings this run expects. It confirms the practitioner thesis (a control-level view sits below a board's decision altitude) and grounds it in the FSB RAF order of strategy, capacity, appetite, limits and controls (A-GP-01), but it is careful to strip practice of regulatory standing: Level 1/2/3 tiers, a 10–12 metric cap, six-monthly SMF certification and monthly data attestation are all "practice-not-rule" or "not supported" (A-GP-02, A-GP-05, D-GP-03, D-GP-07, K-GP-01, K-GP-02). Its strongest product material is in four places, and this catalogue mines each of them hard: the enforcement table (H-GP-01 to H-GP-09), which GP reads as "the chain between stated appetite and what actually happened" breaking through growth, data, configuration, execution and ownership; the reportability section (C-GP-01 to C-GP-07), which models one event as a parent with many child obligations on different clocks (SUP 15.3 "immediately", FR7, SUP 15.11, REP008, SAR suspicion and the 18 March 2027 incident and third-party regime); the metric-tension section (G-GP-03 to G-GP-05), which GP calls an under-served differentiator on an absence-of-evidence basis; and the agentic-AI section (I-GP-01 to I-GP-11), which GP treats as an early, narrowed wedge rather than a mature market. GP is thin on the interaction corpus as such: it never discusses committee minutes being edited, and its only narrative-side enforcement anchor is that Metro's junior staff raised concerns before full remediation (H-GP-03). Bucket B use cases therefore rest on GP's governance-narrative findings (B-GP-11 materiality-based escalation, C-GP-06 delay and incomplete escalation, D-GP-02 the reasonable-steps trail, D-GP-06 journey ownership, F-GP-03 culture needing narrative interpretation, F-GP-04 structured attestation beside data, G-GP-04 trade-off decision records) joined to its substrate anchors, and any minutes-specific mechanism is labelled product design, not precedent. Citations in the source often appear as internal tokens (for example `turn9search0`); these are treated as untraceable, so each hook below cites the publication name and date GP gives, and no URL is supplied for a token. Five pipeline fields follow the assurance adaptation (requirement, evidence, sufficiency, attestation, gap/escalation). Every use case is single-source by construction; long-tail items carry `[long-tail -- preserve]`, invented figures carry `[illustrative]`, and anything the GP file does not contain carries `[NEW -- beyond file]`. Correlation-evidence bands in Bucket B use a run convention: **Strong** (same cohort, time-aligned, two or more independent narrative sources), **Moderate** (same cohort, time-aligned, one narrative source) and **Indicative** (co-occurrence only, needs human reading). Nothing is ranked and no convergence is computed here.

**Product boundary applied to every use case.** AI drafts and challenges; it never decides reportability, files or notifies anything, or re-tunes thresholds or models. Every action has a human gate and an audit log entry. Joins are at cohort level (committee, metric, control, product, journey, channel), never identity-level customer or employee profiling. Practice is labelled as practice. No cost or ROI trade-off is ever offered against a financial crime floor.

**Panel lenses used in every Feasibility block.** L1 UK board NED / BRC chair (buyer resonance); L2 CRO and second-line framework designer (product IP and platform fit); L3 first-line business risk owner plus data and AI architect (feasibility and runnability); L4 UK regulatory and enforcement adviser (compliance and defensibility).

---

# Bucket A -- pipeline use cases that beat a self-built dashboard

### UC-GP-A1 -- How much credit appetite is the strategy using, and how much growth is left before a constraint binds?
*Provenance: A-GP-01, A-GP-04, A-GP-06, B-GP-06, B-GP-10, Synthesis "risk capacity as growth intelligence" and requirement "risk-capacity/growth simulator" · flags: [single]*

- **Archetype:** Position (headroom and trajectory against nested thresholds).
- **Bucket:** A.
- **Signal:** the plan's segment mix (high-LTV, high-DTI) is projected to consume credit appetite faster than the plan horizon allows, or the firm is so far inside appetite that it is leaving deliberate growth unused.
- **Cadence / trigger:** monthly ERC refresh; quarterly BRC and board; annual RAS refresh with corporate planning and stress testing; event trigger when a plan re-forecast is loaded.
- **Primary user → routed exec:** CRO (SMF4) → board and BRC (appetite allocation), CEO and CFO (plan), first-line credit risk owner.

**1. Data aggregation (requirement)**
- Requirement: the strategic objective (for example "grow first-time-buyer share"), the board-approved credit RAS statement, risk capacity, and the primary Level 1 credit metrics (high-LTV share of completions, expected loss and capital consumed by new lending), each linked to Level 2 indicators (approval mix by LTV and DTI band, underwriting overrides and exceptions) and Level 3 channel indicators. Tier names are configurable, because GP finds Level 1/2/3 is a practice, not a rule (A-GP-02).
- Substrate inputs: RAS and limit register; origination MI by segment and channel; arrears and default flow; ECL movements; corporate plan volumes by segment; stress-test outputs where held.
- Interaction inputs: none required. The BRC minute that approved the current allocation is linked as the decision record, not mined.

**2. Baseline creation (evidence)**
- Dimensions: principal risk × segment (LTV band, DTI band, first-time buyer, buy-to-let) × channel (broker, direct) × quarter.
- Normal: the nested threshold set per metric (capacity, red/appetite, amber/trigger, operating limit), each with its stored calibration rationale (lead time, volatility, remediation time; A-GP-04), and a trailing eight-quarter mix by channel.
- Seasonality: purchase-market and quarter-end broker volume patterns are stored in the threshold rationale so that a seasonal surge is not read as drift `[NEW -- beyond file]` (seasonal pattern is a design assumption, not a GP fact).

**3. Dynamic detection (sufficiency)**
- Headroom = appetite minus actual, always shown with its denominator (completions in the period).
- Trajectory: rule-based least-squares projection to the next threshold, labelled an early-warning indicator, never a prediction.
- Growth capacity = remaining headroom divided by the plan's marginal appetite consumption per £ of planned lending, giving a "binding date" and a "binding constraint" (credit, capital or another linked metric).
- Fires when (a) the projected binding date falls inside the plan horizon, or (b) utilisation stays below a configurable floor for N quarters, prompting the "unused capacity" question GP raises (A-GP-06; CRO interview question 3).
- Integrity gate: if the origination feed is unreconciled or the owner has not attested, the position shows "unverified" rather than a headroom figure.

**4. Distillation (attestation)**
- Suppressed: metrics inside the operating range with a flat trajectory; moves fully explained by the stored seasonal band.
- Ranking inputs: time to bind relative to plan horizon; strategic weight of the objective; whether the binding constraint is a hard regulatory floor (which is never traded).
- Attestation: the first-line credit risk owner attests the reconciled origination feed; second-line risk challenges the marginal-consumption assumption; the CRO accepts the position before it reaches the board strip.

**5. Surfacing and routing (gap / escalation)**
- CRO and board see: the objective on the strategy strip with appetite consumed, and a headroom gauge (appetite set vs actual vs forecast, with denominator), with the binding constraint named.
- Recommended action: propose to the BRC either a reallocation of credit appetite between segments or a plan adjustment; or, for unused capacity, propose a discussion of deliberate growth.
- Draft artifact: a BRC paper section "Credit appetite allocation against plan", AI-marked.
- Human gate and audit: the CRO proposes, the BRC recommends, the board approves any appetite change; every step is logged with name and date.
- Hero element: **strategy strip + headroom gauge**.

**Why it beats a self-built dashboard.** A bank can chart high-LTV share in an afternoon. It cannot cheaply hold the nested thresholds with their calibration rationale, join them to the plan's segment volumes, project a binding date with an integrity gate, and tell the board which constraint binds first. GP's synthesis names this "risk capacity as growth intelligence" as a differentiator, not a qualifier.

**Differentiation:** substrate-visible.

**Worked example.** An illustrative tier 2 society with £30bn assets `[illustrative]` has a RAS limit that high-LTV (above 90% LTV) completions stay at or below 15% of quarterly completions, with amber at 12.5%, operating limit 11% and capacity 18% `[illustrative]`. In Q3 high-LTV share is 11.8% of £2.4bn completions, about £283m `[illustrative]`. The share has risen 0.4 percentage points a quarter for five quarters `[illustrative]`, so the least-squares projection reaches amber in two quarters and red in eight. The plan's first-time-buyer objective needs 13.5% high-LTV share in year two on £10bn annual completions, which is £1.35bn against an appetite of £1.5bn: £150m of headroom, 90% utilisation `[illustrative]`. The card reads: "First-time-buyer growth uses 90% of high-LTV appetite by year two; amber in Q1; binding constraint is high-LTV share, not capital." The BRC is asked to decide, not to note.

**Regulatory / governance hook.** FSB, *Principles for an Effective Risk Appetite Framework* (18 November 2013): strategy pursued subject to capacity, appetite translated into limits (A-GP-01). Leeds Building Society, *Annual Report and Accounts 2025* (26 February 2026): SRA metrics feed corporate planning and stress testing, and credit appetite is deployed through lending policies and limits (A-GP-06). Metro Bank, *Annual Report and Accounts 2025* (15 April 2026): credit policy, appetite and control framework updated to support strategic growth (B-GP-10). Tiering and the growth-capacity figure are labelled practice and product design.

**Feasibility (panel view).**
- Data needed: plan volumes by segment from finance; origination MI; limit register with calibration rationale.
- Hardest part: the marginal-consumption model (how much appetite one more £ of lending uses); GP itself caveats growth capacity as "subject to modelling caveats".
- False-positive risk: seasonal surges triggering amber (amber fatigue); plan re-forecasts that move the horizon.
- Disagreement: **L1** wants one plain number ("£150m of growth left"). **L2** objects that a single £ figure implies false precision and wants a range plus the binding constraint. **L3** notes plan data lives in finance, not risk, so the CFO is a co-sponsor (J-GP-03). **L4** insists the projection is labelled early warning, never a forecast, and that no headroom figure appears without a denominator. Unresolved: whether the board sees £ or % first.

---

### UC-GP-A2 -- Which of our early-warning indicators actually warn early enough to act?
*Provenance: A-GP-04, A-GP-07, Synthesis "early-warning graph" and requirement "leading-indicator cascade" · flags: [single]*

- **Archetype:** Chain break (calibration) surfaced as a position on each indicator.
- **Bucket:** A.
- **Signal:** a Level 2 or Level 3 indicator whose amber historically fires later than the time needed to remediate before its Level 1 parent turns amber.
- **Cadence / trigger:** quarterly calibration review; annual RAS refresh; event trigger whenever a Level 1 metric enters amber (retrospective check of which children warned).
- **Primary user → routed exec:** CRO in the second-line framework-designer role → BRC (approval of re-calibration), first-line metric owners.

**1. Data aggregation (requirement)**
- Requirement: each Level 1 metric with its child indicators and, per child, the amber value, declared response time, escalation action, owner and the upstream metric it affects, which is exactly the threshold configuration GP asks for (A-GP-04 product implication).
- Substrate inputs: KRI time series (ideally three or more years); threshold change history; breach history; action log with time to remediate.
- Interaction inputs: none required.

**2. Baseline creation (evidence)**
- Dimensions: principal risk × parent metric × child indicator × period.
- Normal: for each child, the historical lead time (median periods between child crossing amber and parent crossing amber), the number of episodes, and the child's volatility. A healthy child has a lead time at least equal to remediation time plus one governance cycle.
- Seasonality: children with known seasonal swings carry a seasonal band in their rationale; the lead-time calculation uses de-seasonalised crossings.

**3. Dynamic detection (sufficiency)**
- **Late-warning indicator:** lead time shorter than declared remediation time ("no early warning", GP's own words in A-GP-04).
- **Dead indicator:** never crossed amber before any parent episode.
- **Noisy indicator:** crossed amber N times without any parent movement.
- Method is counts and medians with the episode count shown, not statistical modelling; GP's "statistical relationship" is offered only where episodes are sufficient.

**4. Distillation (attestation)**
- Suppressed: children with too few episodes are shown as "insufficient history", not hidden and not scored.
- Ranking inputs: strategic weight of the parent; size of the shortfall in weeks; whether the parent is a hard floor.
- Attestation: second line proposes re-calibration; the metric owner attests the history; the BRC approves the new band. The product never re-tunes a threshold.

**5. Surfacing and routing (gap / escalation)**
- CRO sees: the leading-indicator tree under each board metric, with "warning weeks" on each branch and late, dead or noisy branches marked.
- Recommended action: propose re-calibration of amber band width with rationale (lead time, volatility, control response time), for approval at the next RAS refresh.
- Draft artifact: calibration memo per parent metric, AI-marked.
- Human gate and audit: owner attests; second line validates; BRC approves; change logged against the parent metric.
- Hero element: **leading-indicator tree with warning lead time**.

**Why it beats a self-built dashboard.** A bank can plot child KRIs next to their parent. It does not routinely compute, store and challenge how much warning each child has actually given, which is the only way to know whether "lower tiers carry wider amber bands" is doing its job. GP explicitly rejects an arbitrary widening percentage in favour of lead time and response time.

**Differentiation:** substrate-visible.

**Worked example.** Credit, Level 1 metric 3m+ arrears rate `[illustrative]`. Over 12 quarters there were three parent amber episodes `[illustrative]`. Child "underwriting overrides" crossed amber 7, 9 and 8 months before each episode; remediation (policy tightening reaching the book) takes about 6 months, so the child is healthy `[illustrative]`. Child "high-DTI approval share" has amber set 2 points below its red; it crossed amber a median of 3 weeks before the parent, so it gives no usable warning `[illustrative]`. Child "broker exception rate" crossed amber 11 times with one parent episode: noisy `[illustrative]`. The card reads: "2 of 3 credit early-warning indicators do not warn in time; proposed re-calibration attached for BRC approval."

**Regulatory / governance hook.** FSB RAF (18 November 2013) on limits that constrain actual risk-taking; Nationwide, *Annual Report and Accounts 2026* (20 May 2026), appetite supported by "metrics, limits and triggers"; Leeds (26 February 2026), early-warning indicators and escalation procedures (A-GP-04). The calibration pattern itself is `[practice-not-rule]`.

**Feasibility (panel view).**
- Data needed: three or more years of KRI history with threshold change history.
- Hardest part: small numbers of parent episodes; most Level 1 metrics rarely breach.
- False-positive risk: spurious lead-lag from coincidence; restructured metrics breaking the series.
- Disagreement: **L2** wants GP's statistical relationship between tiers. **L3** says episode counts are too small for statistics and insists the episode count is printed on the card. **L4** warns that "lead time" must never be presented as a predictive claim. **L1** wants the tree only one click down, not on the board page.

---

### UC-GP-A3 -- Is the regulatory restriction actually being obeyed across the whole population?
*Provenance: G-GP-02, H-GP-01, H-GP-02, Synthesis "regulatory restriction adherence testing" and requirement "population-level policy adherence" · flags: [single]*

- **Archetype:** Breach (restriction) and chain break (restriction with no executable test).
- **Bucket:** A.
- **Signal:** any new account opened, after a restriction's effective date, for a customer in the prohibited population; or a restriction with no executable population test, or a test that covers less than the whole population.
- **Cadence / trigger:** daily test run by the bank's own data platform and consumed; monthly ERC; event-driven escalation to SMF17 and SMF16 on any breach; quarterly board line.
- **Primary user → routed exec:** CRO → SMF17 (Head of Financial Crime), SMF16 (reportability decision), board and BRC.

**1. Data aggregation (requirement)**
- Requirement: each restriction (VREQ clause, board limit, policy restriction) decomposed into an executable rule: population (accounts opened on or after the effective date, all channels and products), condition (customer risk rating "high" at opening, or reclassified to high within a defined window), tolerance (zero, with measurable proxies).
- Substrate inputs: restriction register; onboarding and account-opening records by channel; customer risk assessment history (point-in-time ratings); reclassification log.
- Interaction inputs: none required.

**2. Baseline creation (evidence)**
- Dimensions: restriction × channel × product × month.
- Normal: zero prohibited openings (no intentional tolerance), plus proxies that can be measured: test coverage (population tested over population opened, always with the denominator) and reclassification lag.
- Seasonality: onboarding campaign peaks raise volume; the test result is reported per period with its own denominator so a peak cannot hide a breach.

**3. Dynamic detection (sufficiency)**
- **Breach:** any account in the population meets the prohibited condition.
- **Reclassification leakage:** customers rated medium at opening and re-rated high within 90 days `[illustrative window]`.
- **Chain break:** the restriction has no executable test; the test covers fewer than all channels; or adherence is evidenced by "the flag fired" rather than by a population outcome (method hard fail).

**4. Distillation (attestation)**
- Suppressed: nothing that is a genuine breach; a regulatory floor is never suppressed. Duplicates are collapsed by customer, and both counts (accounts and customers) are shown, as in the Starling facts.
- Ranking inputs: count and trend of prohibited openings; channel; time since effective date.
- Attestation: SMF17 attests the test design; the second line validates that the test is independent of the onboarding system's own flag; internal audit assures.

**5. Surfacing and routing (gap / escalation)**
- CRO and board see: restriction adherence test showing population, test, result and denominator, and "not tested" in place of green where the test is missing.
- Recommended action: open a draft reportability case (routed to UC-GP-A8) and propose read-across to every other restriction and channel.
- Draft artifact: breach summary with population counts, AI-marked.
- Human gate and audit: SMF17 confirms the breach; SMF16 decides reportability; every step logged.
- Hero element: **restriction adherence test (population, result, denominator)**.

**Why it beats a self-built dashboard.** Banks report "VREQ in place" and "onboarding control operating"; Starling and Monzo show that status is not adherence. The product's test is independent of the system that is supposed to enforce the restriction, carries its own coverage denominator, and turns a missing test into a visible chain break.

**Differentiation:** substrate-visible.

**Worked example.** Starling agreed a VREQ in 2021 not to open accounts for high-risk customers, yet opened more than 54,000 accounts for approximately 49,000 high-risk customers between September 2021 and November 2023 (G-GP-02). Spread evenly over roughly 26 months that is about 2,000 prohibited openings a month `[illustrative -- derived arithmetic, assumes even spread]`: a monthly test would have shown a non-zero result in its first month. For an illustrative challenger `[illustrative]`: 412,000 accounts opened since a restriction took effect; the test covers app and web (388,000, 94.2%) but not a partner channel (24,000 untested); 37 prohibited openings found in the tested population. The board line reads "Restriction R-03: 37 breaches in 388,000 tested; 24,000 openings untested (partner channel)", not green.

**Regulatory / governance hook.** FCA Final Notice and press release, Starling Bank, £28.96m (02 October 2024); FCA, Monzo Bank, £21.09m (08 July 2025), more than 34,000 high-risk customers onboarded contrary to a restriction (H-GP-01, H-GP-02). SUP 15.3 significant rule breach notification and PRA FR7 potentially engaged on breach, for a human decision (C-GP-01, C-GP-02).

**Feasibility (panel view).**
- Data needed: point-in-time customer risk ratings and account openings for every channel.
- Hardest part: translating the restriction's legal text into a precise rule, and keeping point-in-time ratings rather than current ratings.
- False-positive risk: retrospective re-rating making historic openings look prohibited; test-account noise.
- Disagreement: **L4** insists the test runs independently of the onboarding system's flag, or it repeats the failure. **L3** notes this means a second data path and its own reconciliation. **L1** wants a single yes/no line. **L2** refuses any line without the coverage denominator. Resolved: board sees one line, but the line carries the denominator.

---

### UC-GP-A4 -- Is every transaction we believe we monitor actually reaching the monitoring engine?
*Provenance: H-GP-03, A-GP-07 (financial crime row), C-GP-01, Synthesis "Can we prove that the population actually obeyed" · flags: [single]*

- **Archetype:** Chain break (feed) and silent failure.
- **Bucket:** A.
- **Signal:** a source-to-monitoring reconciliation shortfall, by transaction type and timing, beyond tolerance; or a reconciliation that has not run.
- **Cadence / trigger:** daily reconciliation consumed from data operations; monthly owner attestation; event trigger on any structural gap.
- **Primary user → routed exec:** CRO → SMF17, COO and CTO (feed owners), board on material gaps.

**1. Data aggregation (requirement)**
- Requirement: the financial crime appetite statement's monitoring commitment, expressed as a measurable proxy (in-scope transactions monitored as a share of in-scope transactions processed, by type).
- Substrate inputs: core banking transaction counts and values by type and posting timing; monitoring-engine ingestion counts; reconciliation logs; data-feed change log; declared exclusions.
- Interaction inputs: none required (the narrative side is UC-GP-B2).

**2. Baseline creation (evidence)**
- Dimensions: transaction type × timing bucket (same-day, posted, account-opening window) × channel × day.
- Normal: the coverage ratio per bucket with a narrow tolerance, plus the expected timing difference that clears by the next day.
- Seasonality: month-end, payday and holiday volume patterns, so a volume spike is not mistaken for a gap.

**3. Dynamic detection (sufficiency)**
- **Shortfall:** ingested below source beyond tolerance.
- **Structural gap:** a category consistently absent (Metro shape: same-day activity around account opening not monitored until records updated).
- **Staleness:** reconciliation not run, or run without attestation.
- **Integrity override:** any financial crime appetite metric that depends on the failing feed is shown "unverified", never green.

**4. Distillation (attestation)**
- Suppressed: intraday timing differences that clear by T+1; declared exclusions with an approved rationale.
- Ranking inputs: value and count unmonitored; duration; whether the gap touches high-risk segments or new-account windows.
- Attestation: the data owner attests the reconciliation result (not a bare value); SMF17 reviews; second line challenges declared exclusions.

**5. Surfacing and routing (gap / escalation)**
- CRO sees: the chain-integrity badge on the financial crime headline flipped to "feed not reconciled" with the unmonitored count and value.
- Recommended action: propose an investigation and read-across to every other feed into the monitoring engine; open a draft reportability case if the gap is material.
- Draft artifact: feed-gap note with population, value, start date and suspected cause, AI-marked.
- Human gate and audit: COO or CTO owns the fix; SMF17 confirms materiality; SMF16 decides reportability.
- Hero element: **chain-integrity badge (feed check)**, with the v6 **ScreeningDenominator**.

**Why it beats a self-built dashboard.** Data teams often hold the counts but they never reach the board, and the board metric built on the feed stays green. The product makes integrity override status, which a bank's own dashboard almost never does, because the dashboard is fed by the same pipe.

**Differentiation:** substrate-visible.

**Worked example.** Metro Bank's transaction-monitoring feed omitted same-day activity around account opening and other transactions until records updated; more than 60m transactions worth £51bn were inadequately monitored over the relevant period (H-GP-03). For an illustrative mid-tier bank `[illustrative]`: 9.6m in-scope transactions a month; the engine ingests 9.41m, a 2.0% shortfall; the gap is concentrated in "same-day credit to an account opened in the last 7 days" (190,000 transactions a month, £410m). The financial crime Level 1 metric "alerts reviewed within SLA" stays at 98% green on the old dashboard; on the board view it reads "unverified: 190,000 transactions a month not reaching monitoring since 14 June".

**Regulatory / governance hook.** FCA, *FCA fines Metro Bank £16m for financial crime failings* (12 November 2024), £16.68m (H-GP-03); GP's leading indicators "daily source-to-monitoring reconciliation; % transactions screened". SUP 15.3: significance depends partly on "systems-and-controls implications and delay in identifying or correcting the problem" (C-GP-01).

**Feasibility (panel view).**
- Data needed: counts from both sides of the feed, by type and timing.
- Hardest part: defining the in-scope population and its exclusions, and matching on timing.
- False-positive risk: timing differences; legitimate exclusions not yet declared.
- Disagreement: **L3** says counts are cheap but agreed matching definitions are expensive. **L1** wants one percentage. **L4** says an unexplained gap is a potential SUP 15.3 matter and the tolerance must not hide it. **L2** wants integrity to override status in every case. Unresolved: the tolerance width, which L4 would set at zero for structural gaps.

---

### UC-GP-A5 -- Is growth outrunning our financial crime control capacity?
*Provenance: E-GP-04, H-GP-01, H-GP-02 (leading indicators "growth-to-FC-staff/control-capacity ratio", "control-capacity per 100k customers"), A-GP-07, Synthesis item 8 · flags: [single]*

- **Archetype:** Position (capacity headroom) with trajectory.
- **Bucket:** A.
- **Signal:** customers, onboarding volume or alert volume per unit of financial crime control capacity rising past its calibrated amber, with queue age rising, while the growth plan accelerates.
- **Cadence / trigger:** monthly; quarterly BRC alongside the plan; event trigger on any campaign or product launch.
- **Primary user → routed exec:** CRO → CEO and board (growth pace), SMF17, COO.

**1. Data aggregation (requirement)**
- Requirement: the growth objective on the strategy strip, and a financial crime capacity appetite statement (for example alert queue median age and periodic review backlog within set limits).
- Substrate inputs: customer and account counts; onboarding volumes; alert and case volumes; sanctions and AML queue age; financial crime case-handler capacity (hours or FTE); periodic review backlog; growth plan.
- Interaction inputs: none required.

**2. Baseline creation (evidence)**
- Dimensions: product × channel × month; capacity ratio per 100,000 customers (GP's own unit).
- Normal: historical ratio band and queue age band during steady growth.
- Seasonality: campaign launches and year-end switching windows.

**3. Dynamic detection (sufficiency)**
- Fires when the capacity ratio deteriorates while growth accelerates, when projected queue age crosses amber inside the plan horizon, or when the plan implies a breach.
- The pairing is rule-based: growth trajectory and capacity trajectory on one axis of time.

**4. Distillation (attestation)**
- Suppressed: alert spikes explained by a governed, approved scenario change (linked to UC-GP-A7); temporary surges with an approved surge plan.
- Ranking inputs: projected time to amber against the next growth milestone; whether high-risk segments are affected.
- Attestation: SMF17 attests capacity data; the CFO attests plan volumes; second line challenges the capacity unit.

**5. Surfacing and routing (gap / escalation)**
- CEO and board see: a paired strip "growth vs financial crime control capacity" on the strategy strip.
- Recommended action: propose to restore capacity before the next growth milestone, or to pace growth. The product boundary forbids presenting the trade as "accept a lower control standard to protect revenue"; the floor is not tradeable.
- Draft artifact: ExCo and BRC note with the two trajectories and the date they cross.
- Human gate and audit: CEO and board decide pace; SMF17 owns capacity; logged.
- Hero element: **growth-versus-capacity paired gauge on the strategy strip**.

**Why it beats a self-built dashboard.** Growth sits in the commercial pack and control capacity in the financial crime MI; nobody puts them on one time axis with a crossing date. GP's reading of Starling and Monzo is that these were first-line scaling failures, not only second-line compliance failures.

**Differentiation:** substrate-visible.

**Worked example.** Starling grew from roughly 43,000 customers in 2017 to 3.6m in 2023 while financial crime controls failed to keep pace; Monzo grew from around 600,000 in 2018 to more than 5.8m in 2022 (E-GP-04). For an illustrative challenger `[illustrative]`: customers 1.2m → 1.9m in four quarters (+58%); case handlers 64 → 71 (+11%); customers per handler 18,750 → 26,760; alert queue median age 6 → 19 days against an amber of 14 days. The card reads: "Growth of 58% against 11% more financial crime capacity; queue age past amber since August; next campaign launches in 6 weeks."

**Regulatory / governance hook.** FCA Final Notices, Starling (02 October 2024) and Monzo (08 July 2025); GP's leading indicators for both cases (H-GP-01, H-GP-02). FSB RAF (18 November 2013): appetite constrains risk-taking activities.

**Feasibility (panel view).**
- Data needed: headcount or hours, queue ages, customer counts, plan.
- Hardest part: agreeing a capacity unit when automation changes productivity.
- False-positive risk: genuine automation gains making the ratio look worse than reality.
- Disagreement: **L1** calls this the single most board-resonant chart in the source. **L2** warns it can be read as a cost lever and must be framed as a floor. **L3** wants the unit to be "alerts cleared within SLA per period", not headcount. **L4** supports it, because GP's Starling and Monzo readings make it a precedent-backed indicator.

---

### UC-GP-A6 -- Does our sanctions screening cover the whole list it is meant to cover?
*Provenance: H-GP-01 (sanctions screening covered only a fraction of the relevant list; leading indicator "sanctions-list coverage/completeness"), A-GP-04 (zero tolerance needs a measurable proxy) · flags: [single], [long-tail -- preserve]*

- **Archetype:** Chain break (zero-tolerance proxy) and silent failure.
- **Bucket:** A.
- **Signal:** list entries loaded and screened, as a share of list entries in scope, below 100%; or list version lag beyond policy; or the alert rate collapsing against its baseline.
- **Cadence / trigger:** daily; on every list update; on every screening configuration change.
- **Primary user → routed exec:** CRO → SMF17, CTO (screening platform owner).

**1. Data aggregation (requirement)**
- Requirement: the no-intentional-tolerance statement for sanctions breaches, which GP says should not be read as a prediction that no incident can occur, carried by measurable proxies: list coverage (100%), list update lag (within policy), screening population coverage.
- Substrate inputs: screening engine configuration (lists loaded, entry counts); published list entry counts; list update log; configuration change log; alert counts per 10,000 screened.
- Interaction inputs: none required.

**2. Baseline creation (evidence)**
- Dimensions: list × screening point (onboarding, payments, periodic) × day.
- Normal: 100% of in-scope entries loaded; update lag within policy; alert rate per 10,000 screened inside its historical band.
- Seasonality: none material; designation waves cause step changes, stored as events.

**3. Dynamic detection (sufficiency)**
- Coverage below 100%; list version stale; alert rate collapse against baseline (silent failure); configuration change with no approval record.

**4. Distillation (attestation)**
- Suppressed: planned list-transition windows logged in advance.
- Ranking inputs: size and duration of the coverage gap; screening points affected.
- Attestation: SMF17 attests list scope; the second line tests coverage independently of the vendor's dashboard.

**5. Surfacing and routing (gap / escalation)**
- CRO sees: a zero-tolerance proxy line in the financial crime row ("list coverage 81% against 100%"), shown only when broken, so the board page stays sparse.
- Recommended action: propose immediate remediation and a look-back; open a draft reportability case (UC-GP-A8). Sanctions-specific notification routes such as OFSI are outside the GP file `[NEW -- beyond file]` and are named only as a route for the human to consider.
- Draft artifact: coverage-gap note with entries missing and dates.
- Human gate and audit: SMF17 confirms; SMF16 decides reportability; logged.
- Hero element: **zero-tolerance proxy line on the chain-integrity badge** (with the v6 **ScreeningDenominator**).

**Why it beats a self-built dashboard.** The bank's screening dashboard is produced by the same engine whose configuration is wrong, so it reports what it screens, not what it should screen. The product compares the loaded list with the published list.

**Differentiation:** substrate-visible.

**Worked example.** Starling's sanctions screening covered only a fraction of the relevant list (H-GP-01). For an illustrative bank `[illustrative]`: 4,880 in-scope list entries; the engine has 3,960 loaded (81.1%) since a vendor configuration change 11 weeks earlier; alerts fell from 3.1 to 2.4 per 10,000 screened over the same period. The board view shows "Sanctions list coverage 81.1% (3,960 of 4,880) since 12 August; unverified".

**Regulatory / governance hook.** FCA, Starling Bank, £28.96m (02 October 2024) (H-GP-01); A-GP-04 zero-tolerance calibration `[practice-not-rule]`; SUP 15.3 significant systems-and-controls failure (C-GP-01).

**Feasibility (panel view).**
- Data needed: list entry counts from the engine; published list counts.
- Hardest part: vendor engines may not expose loaded-entry counts.
- False-positive risk: lists legitimately out of scope that have not been declared.
- Disagreement: **L4** treats any coverage gap as potentially notifiable. **L3** warns vendor access is the blocker. **L1** wants it visible only when broken. **L2** wants it as a permanent badge check, not an occasional line. GP gives this fact only inside the Starling row, hence `[long-tail -- preserve]`.

---

### UC-GP-A7 -- Did a change to a model, rule or parameter move our effective financial crime appetite without approval?
*Provenance: I-GP-09, H-GP-06, CRO interview question 6, Synthesis "dynamic AI/agent control governance" · flags: [single]*

- **Archetype:** Chain break (change).
- **Bucket:** A.
- **Signal:** a parameter, scenario or model change touching a financial crime control with no approval record, with the same person proposing and approving, or with no mapped appetite metric; and a post-change shift in alert volume or alert-to-SAR conversion.
- **Cadence / trigger:** on every change event; monthly roll-up; quarterly model risk report.
- **Primary user → routed exec:** CRO (model risk owner) → SMF17, CTO, model risk committee.

**1. Data aggregation (requirement)**
- Requirement: the model inventory with SS1/23 materiality classification; the change policy (proposer, approver and validator must be different people); a mapping from each change to the appetite metric it moves.
- Substrate inputs: technology change and parameter logs; model inventory; scenario coverage register; alert volumes and alert-to-SAR conversion per scenario.
- Interaction inputs: none required (the narrative side is UC-GP-B11).

**2. Baseline creation (evidence)**
- Dimensions: scenario or model × parameter × month.
- Normal: pre-change alert volume and conversion per scenario; the expected impact declared in the change request.
- Seasonality: payment seasonality in alert volumes, so post-change comparisons use like-for-like periods.

**3. Dynamic detection (sufficiency)**
- Chain break: change without approval, with role collision, or with no mapped appetite metric.
- Drift: actual impact differs from declared impact beyond tolerance.
- Coverage: scenario coverage falls; parameters changed without testing (HSBC shape).

**4. Distillation (attestation)**
- Suppressed: changes classified non-material with evidence (for example cosmetic or logging changes).
- Ranking inputs: appetite metric moved; size of the alert or conversion change; materiality class.
- Attestation: the validator (second line or model risk) attests; the accountable business owner approves.

**5. Surfacing and routing (gap / escalation)**
- CRO sees: change lineage under the financial crime threshold cascade, with unapproved changes highlighted.
- Recommended action: propose a retrospective validation or a rollback review. The product never re-tunes or rolls back itself.
- Draft artifact: change-exception memo.
- Human gate and audit: accountable owner approves; validator signs; every proposal and decision logged.
- Hero element: **change-lineage strip under the threshold cascade**.

**Why it beats a self-built dashboard.** Change logs live in technology tooling, appetite metrics in risk tooling. Joining a parameter change to the appetite metric it moves, and checking segregation of duties on it, is the link GP says adaptive models need so they do not "silently change the firm's effective financial crime appetite".

**Differentiation:** substrate-visible.

**Worked example.** HSBC's FCA fine of £63.9m (17 December 2021) concerned a deficient automated transaction-monitoring framework, including scenario coverage, parameters and testing (H-GP-06). For an illustrative bank `[illustrative]`: the threshold on a "rapid movement of funds" scenario is raised from £5,000 to £8,000; alerts fall 38% (1,240 to 770 a month); conversion to SAR stays at 2.1%, so roughly 26 SAR-worthy alerts a month become 16. The change was proposed and approved by the same person and mapped to no appetite metric. The card reads: "Scenario change on 03 September reduced SAR-worthy alerts by about 10 a month; no independent approval."

**Regulatory / governance hook.** PRA model risk management principles for banks, cited by GP as PS6/23 (17 May 2023) and SS1/23 (I-GP-09); Bank of England AI Consortium minutes (09 February 2026) on applying SS1/23 to AI components. HSBC Final Notice (17 December 2021; GP gives no URL, citation token only).

**Feasibility (panel view).**
- Data needed: change logs with approver identities; per-scenario alert and SAR counts.
- Hardest part: mapping each change to an appetite metric.
- False-positive risk: legitimate false-positive reduction flagged as appetite drift.
- Disagreement: **L3** wants false-positive reduction recognised as a good outcome. **L4** says a reduction must be evidenced as no loss of coverage. **L2** insists every change names its metric. **L1** wants only material changes at board level.

---

### UC-GP-A8 -- What may be reportable, on which clock, and who is deciding?
*Provenance: C-GP-01 to C-GP-07, Synthesis "reportability decision intelligence" and requirement "regulatory-notification decision trail" · flags: [single]*

- **Archetype:** Reportability case.
- **Bucket:** A.
- **Signal:** a logged event that matches one or more notification routes and has no recorded human decision on each route.
- **Cadence / trigger:** event-driven on logging; weekly ledger review; quarterly BRC summary.
- **Primary user → routed exec:** CRO → SMF16 (decision), SMF17 (SAR), SMF4 (prudential matters), board (summary).

**1. Data aggregation (requirement)**
- Requirement: a rule library with each route as a separate test: SUP 15.3 (notify immediately on awareness or information reasonably suggesting a matter has occurred, may have occurred or may occur); PRA FR7 ("would the PRA reasonably expect notice?"); SUP 15.11 SMF Conduct Rule disciplinary notification (short timetable); REP008 annual reporting for non-SMF Conduct Rule breaches; SAR (suspicion threshold, separate from materiality); FCA operational incident and material third-party rules and PRA PS7/26 from 18 March 2027.
- Substrate inputs: incident log; issue and breach register; restriction test results (UC-GP-A3); feed gaps (UC-GP-A4); aggregated conduct-case outcomes.
- Interaction inputs: none required here; awareness evidence from narrative is UC-GP-B3.

**2. Baseline creation (evidence)**
- Dimensions: route × event type × business area.
- Normal: the firm's own decision latency (days from logging to decision) per route; internal decision precedents.
- Seasonality: none; volumes are event-driven.

**3. Dynamic detection (sufficiency)**
- An event qualifies for one or more routes without a decision.
- A decision on an "immediately" route is older than the firm's set tolerance.
- **Boolean trap:** one route decided, sibling routes not assessed (GP: model notifications as one-to-many children of an incident).
- **Reopen trigger:** new facts arrive after a "not reportable" decision.

**4. Distillation (attestation)**
- Suppressed: events with a recorded "not reportable" decision and no new facts.
- Ranking inputs: clock urgency; SUP 15.3 significance factors GP lists (potential loss, frequency, systems-and-controls implications, delay in identifying or correcting).
- Attestation: the named SMF records the decision, rationale and dissent; legal, compliance or MLRO advice is attached.

**5. Surfacing and routing (gap / escalation)**
- CRO sees: the reportability decision ledger, one parent event with child obligations, each with clock, owner and status.
- Recommended action: "prepare case for SMF16 decision", never "file" or "notify now".
- Draft artifact: the case GP specifies (C-GP-06, C-GP-07): facts known at the time, rule basis, materiality analysis, counterargument, decision-maker, time, regulator contact, read-across population.
- Human gate and audit: SMF16 decides (SMF4 or SMF17 by matter); decisions are reversible and time-stamped.
- Hero element: **reportability decision ledger (multi-clock)**.

**Why it beats a self-built dashboard.** A self-built tracker records "reported: yes/no". GP's core finding is that one event spawns several obligations with different clocks, owners and evidence, and that SAR suspicion must be kept separate from regulatory materiality. A ledger that models that structure, plus the 18 March 2027 dual-running, is not a spreadsheet job.

**Differentiation:** substrate-visible.

**Worked example.** An illustrative data error rolls 2,300 fixed-rate mortgage customers onto a reversion rate without the required notice; it is found 19 days late and a senior manager is disciplined `[illustrative]`. Children: SUP 15.3 (significant rule breach with customer detriment, "immediately"); FR7 (consider); SUP 15.11 (SMF Conduct Rule disciplinary action, short timetable); REP008 (two certified staff, annual); SAR (not engaged: no suspicion). On day 4 only the SUP 15.3 child has a decision; three siblings are open. The ledger shows "1 of 4 routes decided" in amber.

**Regulatory / governance hook.** FCA Handbook SUP 15.3 (extract 27 March 2026); PRA FR7 as referenced in PS7/26 (18 March 2026); FCA *Conduct Rules* page (29 March 2023) and SUP 15.11; NCA SAR guidance (current 2026 page); FCA *Reporting material third party arrangements* (18 March 2026), go-live 18 March 2027. Over-reporting is a governance cost, not an offence (C-GP-06, `[practice-not-rule]`).

**Feasibility (panel view).**
- Data needed: a clean incident log; an aggregated HR conduct-case feed.
- Hardest part: maintaining the rule library and dual-running current and 18 March 2027 logic.
- False-positive risk: over-flagging, which GP judges a lesser harm than under-reporting.
- Disagreement: **L4** prefers an over-inclusive engine. **L1** worries about noise reaching the board. **L2** insists AI only prepares the case. **L3** flags that HR data is sensitive, so only route-relevant aggregates are consumed.

---
### UC-GP-A9 -- Which board figures and obligations have no distinct, named owner, and where is independence compromised?
*Provenance: D-GP-01, D-GP-05, E-GP-01, E-GP-02, E-GP-03, Synthesis item 7 and requirement "multi-dimensional ownership" · flags: [single]*

- **Archetype:** Chain break (owner).
- **Bucket:** A.
- **Signal:** a risk, metric, control, issue, restriction or regulatory obligation that does not resolve to a named person in each required role (risk owner, control owner, data owner, SMF, second-line challenger, third-line assurer), or where the roles collapse onto one person in a way that breaks independence.
- **Cadence / trigger:** continuous; monthly roll-up; event trigger on any SoR or MRM change, leaver or reorganisation.
- **Primary user → routed exec:** CRO → CEO (allocation of SMF responsibilities), first-line owners, Head of Internal Audit (SMF5).

**1. Data aggregation (requirement)**
- Requirement: every object on the spine resolves to a named accountable person and, where relevant, their SMCR responsibility (D-GP-01); owner fields are separate for risk, control, data and action (D-GP-05); each metric shows owner, challenger and assurer (E-GP-02).
- Substrate inputs: SMCR Statements of Responsibilities and the Management Responsibilities Map; HR leaver and mover feed; risk and control registers with owner fields; metric dictionary; audit plan.
- Interaction inputs: none required.

**2. Baseline creation (evidence)**
- Dimensions: principal risk × object type × role × legal entity.
- Normal: 100% of board-level objects owned in every required role; no person holding both first-line ownership and third-line assurance of the same metric.
- Seasonality: none; reorganisations and SMCR changes cause step events.

**3. Dynamic detection (sufficiency)**
- **Unowned:** an object with an empty or departed owner.
- **Single-owner collapse:** one generic "owner" holding risk, control and data roles on a board metric.
- **Independence breach:** internal audit owns a business-risk metric it later audits (E-GP-03).
- **Silent second line:** second line recorded as operational owner (E-GP-01 implication).
- **SoR gap:** an obligation's prescribed responsibility does not appear in any current SoR.

**4. Distillation (attestation)**
- Suppressed: objects below board altitude unless they feed a board metric; temporary cover assignments with an end date.
- Ranking inputs: altitude of the object; whether it is a restriction or zero-tolerance proxy; days unowned.
- Attestation: SMFs confirm their SoR mapping; HR confirms leavers; second line challenges collapsed ownership.

**5. Surfacing and routing (gap / escalation)**
- CRO sees: the owner check on the chain-integrity badge, and a short "unowned" list in the exception feed.
- Recommended action: propose an allocation to the CEO; propose a SoR update where an SMF responsibility is missing.
- Draft artifact: allocation proposal and SoR change note.
- Human gate and audit: the CEO allocates; the SMF accepts; logged.
- Hero element: **chain-integrity badge (owner check)** with owner, challenger and assurer shown.

**Why it beats a self-built dashboard.** Registers each hold an owner field; nobody checks the full set of roles across all objects against the SoRs and the leaver feed, or tests independence between lines. GP calls one generic owner field a design error.

**Differentiation:** substrate-visible.

**Worked example.** An illustrative society holds 96 board-linked objects `[illustrative]`. Seven have no current owner after a reorganisation on 01 September (two feed a Level 1 metric); 11 board metrics have one person as risk, control and data owner; one conduct metric is owned by the Head of Internal Audit, who also audits it in Q1 `[illustrative]`. The badge reads "Owner: 7 unowned, 1 independence breach".

**Regulatory / governance hook.** HM Treasury, *Reforming the Senior Managers & Certification Regime: Consultation Response* (22 April 2026): clear allocation of responsibilities and individual accountability for key risks (D-GP-01). FCA COCON 4.2 (current 2026): failure to take reasonable steps to allocate responsibilities clearly (D-GP-02). IIA Three Lines Model (08 September 2020, updated 2024) (E-GP-01). Leeds (26 February 2026) for a UK implementation (E-GP-02). The separate-owner-field model is `[practice-not-rule]`.

**Feasibility (panel view).**
- Data needed: SoRs and MRM in structured form; HR leaver feed.
- Hardest part: SoRs are prose documents; mapping them to objects is manual at first.
- False-positive risk: delegated ownership that is valid but not recorded.
- Disagreement: **L1** wants the count, not the list, on the board page. **L2** wants the independence breach treated as a hard fail. **L3** says SoR parsing needs human confirmation. **L4** says SMCR is in active reform (Phase 2, CP14/26, 23 October 2026) so mappings must be versioned, not static (D-GP-04).

---

### UC-GP-A10 -- Which material policy obligations have no evidence that they are implemented and monitored?
*Provenance: G-GP-01, A-GP-03, Synthesis item 10 and requirement "strategic risk graph" · flags: [single]*

- **Archetype:** Chain break (mapping).
- **Bucket:** A.
- **Signal:** a material policy obligation, or a board appetite statement, with no linked control, metric or evidence, or with evidence that is stale.
- **Cadence / trigger:** monthly; on every policy approval or obligation library update.
- **Primary user → routed exec:** CRO → SMF16, policy owners, first-line owners.

**1. Data aggregation (requirement)**
- Requirement: policy → obligation → control / metric / evidence, many-to-many (G-GP-01). Every board appetite statement must have enough measures and controls to establish whether the firm is within it.
- Substrate inputs: policy register; regulatory obligation library; control register and test results; metric dictionary; evidence repository dates.
- Interaction inputs: none required.

**2. Baseline creation (evidence)**
- Dimensions: principal risk × policy × obligation materiality.
- Normal: every material obligation has at least one live evidence path (control test, metric, sample test, approval workflow, training record or qualitative assurance) inside its evidence freshness window. GP rejects "every policy must have a metric"; a non-metric evidence path is valid.
- Seasonality: annual policy review cycles create predictable staleness windows.

**3. Dynamic detection (sufficiency)**
- Unmapped obligation; mapped only to a control with no test in the window; appetite statement with no measure; evidence path that exists only as a policy document.

**4. Distillation (attestation)**
- Suppressed: non-material obligations, unless they are restrictions.
- Ranking inputs: materiality; link to a Level 1 statement; regulator interest.
- Attestation: policy owner attests the mapping; second line challenges sufficiency; AI sufficiency note marked advisory.

**5. Surfacing and routing (gap / escalation)**
- CRO sees: the mapping check on the chain-integrity badge; a coverage line per principal risk ("conduct: 46 of 49 material obligations evidenced").
- Recommended action: propose a control, metric or test owner for each gap.
- Draft artifact: gap list with proposed evidence path.
- Human gate and audit: the policy owner accepts; logged.
- Hero element: **chain-integrity badge (mapping check)**.

**Why it beats a self-built dashboard.** GRC tools link risks to controls; few hold the upward link from appetite statement to evidence or test that the evidence is live. GP names the white space as "the graph between existing GRC objects" (J-GP-06).

**Differentiation:** substrate-visible.

**Worked example.** An illustrative bank has 212 material obligations `[illustrative]`. 19 have no evidence path; 14 are mapped only to controls untested for more than 12 months; one conduct appetite statement ("we do not tolerate foreseeable harm to vulnerable customers") has no measure at all. The board line reads "Conduct appetite statement 3: no measure".

**Regulatory / governance hook.** FSB RAF (18 November 2013) on appetite being monitorable; Nationwide (20 May 2026) appetite "supported by detailed metrics/indicators, policies and standards"; Leeds (26 February 2026) SRA reinforced through policies and standards (G-GP-01, tagged `[partly-supported]` in GP).

**Feasibility (panel view).**
- Data needed: a structured obligation library.
- Hardest part: obligation decomposition and materiality.
- False-positive risk: evidence held outside the systems consumed.
- Disagreement: **L2** says this is the core product IP. **L1** finds it below board altitude unless tied to a Level 1 statement. **L3** warns that initial mapping effort is the real cost. **L4** insists on GP's correction: the test is evidence, not a metric per policy.

---

### UC-GP-A11 -- Which known weaknesses are not being remediated in time?
*Provenance: H-GP-09, H-GP-05, A-GP-07 (regulatory row "overdue policy/control remediation"), Synthesis item 8 · flags: [single]*

- **Archetype:** Breach (remediation persistence).
- **Bucket:** A.
- **Signal:** remediation backlogs (overdue CDD, high-risk review backlog, overdue audit and regulatory actions) ageing past SLA, or growing faster than closure.
- **Cadence / trigger:** monthly; quarterly BRC; event trigger when an item passes its SLA.
- **Primary user → routed exec:** CRO → SMF17, first-line owners, BRC chair (items past SLA cannot be suppressed).

**1. Data aggregation (requirement)**
- Requirement: remediation SLA and the appetite statement it protects; the rule that items past SLA auto-surface.
- Substrate inputs: issue and action log; CDD refresh backlog; high-risk periodic review backlog; audit findings; remediation programme plan.
- Interaction inputs: none required (closure narrative is UC-GP-B12).

**2. Baseline creation (evidence)**
- Dimensions: backlog type × segment × age band × month.
- Normal: closure rate at least equal to inflow; age distribution inside SLA.
- Seasonality: year-end audit-finding inflows.

**3. Dynamic detection (sufficiency)**
- Inflow above closure for N months; age bands past SLA growing; projected backlog clearance beyond the committed date (least-squares, early warning).

**4. Distillation (attestation)**
- Suppressed: items with an approved extension and a named owner.
- Ranking inputs: risk of the population (high-risk, business-like behaviour on personal accounts); age; regulator commitment.
- Attestation: the owner attests closure evidence; second line samples closure quality.

**5. Surfacing and routing (gap / escalation)**
- CRO and BRC see: remediation ageing line in the exception feed with the projected clearance date.
- Recommended action: propose added capacity or re-sequencing; escalate to the BRC chair.
- Draft artifact: remediation status paper section.
- Human gate and audit: first-line owner commits; BRC accepts the revised date; logged.
- Hero element: **exception feed entry with projected clearance date**.

**Why it beats a self-built dashboard.** Backlog counts exist; the projected clearance date against the commitment, and the rule that past-SLA items cannot be filtered out of the BRC pack, do not.

**Differentiation:** substrate-visible.

**Worked example.** Nationwide was fined £44.08m (12 December 2025) for inadequate ongoing due diligence, risk assessment and transaction monitoring on current accounts, including personal accounts behaving like businesses, with remediation not timely (H-GP-09). Santander UK was fined £107.7m (09 December 2022) with stale CDD and high-risk review backlog among GP's leading indicators (H-GP-05). Illustrative case `[illustrative]`: overdue CDD refreshes 18,400 → 26,900 over two quarters; closures 2,100 a month against inflow 3,500; projected clearance 31 months against a committed 12.

**Regulatory / governance hook.** FCA Final Notices, Nationwide (12 December 2025) and Santander UK (09 December 2022). SUP 15.3 guidance that "delay in identifying or correcting the problem" bears on significance (C-GP-01).

**Feasibility (panel view).**
- Data needed: backlog snapshots with ages.
- Hardest part: consistent age definitions across systems.
- False-positive risk: bulk closures without quality.
- Disagreement: **L4** wants closure quality sampled before counts are trusted. **L1** wants one date. **L3** says the plan is often in a programme tool, not a register. **L2** wants auto-surfacing after N periods set by the firm.

---

### UC-GP-A12 -- Which emerging risks map to which principal risks, and are they moving?
*Provenance: B-GP-02, B-GP-03, B-GP-05, B-GP-06, B-GP-10, Synthesis item 5 · flags: [single]*

- **Archetype:** Position (emerging overlay).
- **Bucket:** A.
- **Signal:** an emerging risk on the top-and-emerging overlay whose proxy indicators in the mapped principal risks have started to move.
- **Cadence / trigger:** quarterly BRC; event trigger when a mapped indicator crosses amber.
- **Primary user → routed exec:** CRO → BRC (horizon scanning).

**1. Data aggregation (requirement)**
- Requirement: an emerging-risk register with each entry mapped to affected principal risks and to proxy indicators.
- Substrate inputs: emerging-risk register; KRI series for mapped indicators; scenario outputs.
- Interaction inputs: none required (the narrative check is UC-GP-B14).

**2. Baseline creation (evidence)**
- Dimensions: emerging risk × principal risk × indicator × quarter.
- Normal: indicator bands from the parent principal risks.
- Seasonality: inherited from parent metrics.

**3. Dynamic detection (sufficiency)**
- Two or more mapped indicators moving in the direction the emerging risk predicts; an emerging risk with no mapped indicator at all (chain break).

**4. Distillation (attestation)**
- Suppressed: emerging risks with no movement; duplicates across principal risks rolled into one overlay entry.
- Ranking inputs: number of principal risks affected; movement; owner's horizon estimate.
- Attestation: second line owns the register; first-line owners confirm mappings.

**5. Surfacing and routing (gap / escalation)**
- BRC sees: the top-and-emerging overlay mapped to principal risks, each with movement and a horizon.
- Recommended action: propose a deep dive or a scenario.
- Draft artifact: BRC horizon-scan note.
- Human gate and audit: BRC chooses deep dives; logged.
- Hero element: **top and emerging risk overlay**.

**Why it beats a self-built dashboard.** Emerging risks are usually a narrative table. Mapping them to principal risks and their indicators lets the board see whether a theme has started to show in the numbers.

**Differentiation:** substrate-visible.

**Worked example.** Metro's *Annual Report and Accounts 2025* (15 April 2026) lists five emerging risks (geopolitical instability; prolonged macro stagnation; digital disruption; AI-enabled threats; climate-related financial risk) and maps them back to principal risks (B-GP-10). Illustrative `[illustrative]`: "AI-enabled threats" maps to financial crime, fraud and operational risk; authorised-push-payment claims up 22% quarter on quarter and account-takeover attempts up 31%; overlay shows "moving, 2 of 3 indicators".

**Regulatory / governance hook.** Firm practice: Nationwide (20 May 2026), Coventry (06 March 2025), Skipton (25 February 2025), Leeds (26 February 2026), Metro (15 April 2026) all use variants of an overlay above principal risks. This is `[practice-not-rule]`.

**Feasibility (panel view).**
- Data needed: emerging-risk register with mappings.
- Hardest part: choosing proxy indicators that are not just the parent metrics.
- False-positive risk: generic indicators moving for unrelated reasons.
- Disagreement: **L1** values this highly as board-native. **L2** warns it should not become a second taxonomy. **L3** finds proxies hard to choose. **L4** has no compliance objection.

---

### UC-GP-A13 -- Which upcoming regulatory obligations have no owner, control or readiness evidence?
*Provenance: A-GP-07 (regulatory row "upcoming obligations without accountable owner/control"), C-GP-03, D-GP-04, Synthesis roadmap note on dual operation · flags: [single], [long-tail -- preserve]*

- **Archetype:** Chain break (mapping, forward-looking).
- **Bucket:** A.
- **Signal:** an obligation with a known go-live date (18 March 2027 incident and third-party reporting; SMCR Phase 2 from H2 2027 subject to legislation) that has no owner, mapped control or readiness evidence inside its lead time.
- **Cadence / trigger:** monthly; event trigger on publication of a policy statement or consultation.
- **Primary user → routed exec:** CRO → SMF16, COO (operational resilience and third parties), company secretary for SMCR.

**1. Data aggregation (requirement)**
- Requirement: the horizon list of obligations with dates and status (final, consultation).
- Substrate inputs: regulatory obligation library; change programme plan; owner registers; third-party register.
- Interaction inputs: none required.

**2. Baseline creation (evidence)**
- Dimensions: obligation × status × months to go-live.
- Normal: owner assigned 12 months before go-live; design complete 6 months before; test evidence 3 months before `[illustrative milestones]`.
- Seasonality: none.

**3. Dynamic detection (sufficiency)**
- Milestone missed; consultation item treated as final, or the reverse.

**4. Distillation (attestation)**
- Suppressed: consultation items are shown as watch items, not gaps.
- Ranking inputs: time to go-live; dependency on third parties.
- Attestation: SMF16 confirms the horizon list.

**5. Surfacing and routing (gap / escalation)**
- CRO sees: a horizon line in the regulatory row, with consultation and final status distinguished.
- Recommended action: propose an owner and plan.
- Draft artifact: readiness note.
- Human gate and audit: SMF16 accepts; logged.
- Hero element: **regulatory horizon line in the exception feed**.

**Why it beats a self-built dashboard.** The regulatory change log and the appetite chain are rarely joined; this check makes an upcoming obligation a chain object before it goes live.

**Differentiation:** substrate-visible.

**Worked example.** FCA rules for operational incidents and material third-party arrangements go live 18 March 2027 (C-GP-03). PRA CP14/26 (23 October 2026) consults on moving almost half of PRA SMFs to notification, including Chairs of Risk and Audit Committees; consultation closes 22 January 2027 (D-GP-04). Illustrative `[illustrative]`: 31 material third-party arrangements, 9 with no named owner for the new reporting, 141 days before go-live.

**Regulatory / governance hook.** FCA *Reporting material third party arrangements* (18 March 2026); PRA PS7/26 (18 March 2026); PRA CP14/26 (23 October 2026); Bank of England/FCA announcement on SMCR simplification (October 2026, 43% reduction in PRA pre-approvals).

**Feasibility (panel view).**
- Data needed: horizon list and change plan.
- Hardest part: keeping the list current.
- False-positive risk: consultation items read as final.
- Disagreement: **L4** strongly supports; **L1** sees it as below board altitude except near go-live; **L2** wants it to stay a horizon line, not a project tracker; **L3** sees it as cheap to build.

---

### UC-GP-A14 -- Are agent-initiated payments staying inside the customer's mandate and the bank's appetite?
*Provenance: I-GP-01, I-GP-02, I-GP-03, I-GP-04, I-GP-06, I-GP-07, Synthesis panel verdict on the agentic wedge · flags: [single], [long-tail -- preserve]*

- **Archetype:** Breach (mandate) and chain break (identity, owner).
- **Bucket:** A.
- **Signal:** agent-initiated payments outside the stored mandate (amount, merchant, purpose, frequency, duration), agent actions with no identity or accountable owner, or detection-to-human-escalation latency above the set limit.
- **Cadence / trigger:** continuous detection by the bank's engines (consumed); daily roll-up; monthly ERC; event trigger on kill-switch use.
- **Primary user → routed exec:** CRO → SMF17, CTO, COO, board (as an emerging-risk metric).

**1. Data aggregation (requirement)**
- Requirement: the agent mandate as machine-readable constraints (I-GP-06); agent identity, delegated authority and accountability lineage (I-GP-03); a board appetite for agent-initiated activity (pre-scale governance, I-GP-02).
- Substrate inputs: payments tagged as agent-initiated; agent registry (identity, version, permissions); mandate store; fraud and AML alerts; kill-switch and escalation logs.
- Interaction inputs: none required (complaint narratives are UC-GP-B15).

**2. Baseline creation (evidence)**
- Dimensions: agent type (internal, permissioned third party, unrecognised) × payment type × month.
- Normal: out-of-mandate rate near zero; escalation latency within limit; unrecognised-agent access attempts in a band.
- Seasonality: none yet; volumes are small.

**3. Dynamic detection (sufficiency)**
- Out-of-mandate payments; actions with no identity; latency over limit (I-GP-04 decision-latency problem); a model version change with no approval (links to UC-GP-A7).

**4. Distillation (attestation)**
- Suppressed: test agents; mandate amendments that the customer approved.
- Ranking inputs: value; customer vulnerability (cohort only); agent type.
- Attestation: SMF17 attests rule design; the CTO attests the agent registry.

**5. Surfacing and routing (gap / escalation)**
- CRO sees: an emerging-risk row "agent-initiated payments" with volume, out-of-mandate count with denominator, and escalation latency.
- Recommended action: propose tightening permissions, or a human review of a cohort.
- Draft artifact: ERC note.
- Human gate and audit: the named human holds the kill and escalation authority; the product never blocks a payment itself.
- Hero element: **agent lineage card (who authorised, under what mandate, which SMF owns it)**.

**Why it beats a self-built dashboard.** GP's eight accountability questions for an agent action (who authorised, mandate, owner, model version, inside limits, which controls fired, appetite drift, reportable) span payments, identity, model and governance data that no single bank dashboard joins.

**Differentiation:** substrate-visible.

**Worked example.** The Bank of England/FCA survey (26 October 2026) found 196 responses; 86% used AI; 80% reported agents deployed; only 2% broad-autonomy; no more than 9% expected agents to initiate, execute or block payments within 12 months (I-GP-02). Illustrative pilot `[illustrative]`: 14,200 agent-initiated payments in a month; 23 outside mandate (0.16%), 6 above the amount cap; median detection-to-human latency 11 minutes against a 5-minute limit.

**Regulatory / governance hook.** HM Treasury, *Financial Services AI Adoption Plan* and *Modernising Payment Services Regulation* (both 14 July 2026); FCA speech *Building the future of finance in the age of AI* (19 October 2026); Bank of England AI Consortium minutes (09 February 2026). The consent and liability position is unsettled (I-GP-06), so the product presents mandate adherence as governance evidence, not a legal liability verdict.

**Feasibility (panel view).**
- Data needed: agent tagging at payment level, which most banks do not yet have.
- Hardest part: tagging and mandate storage.
- False-positive risk: legitimate amended mandates.
- Disagreement: **L1** finds it strategically interesting but not yet a board pain. **L2** says it fits the chain if treated as delegated human action. **L3** says the data barely exists. **L4** warns against leading with agentic AI before UK rules settle. GP's panel verdict: a narrowed wedge, not the whole proposition.

---

### UC-GP-A15 -- Is our APP scam reimbursement exposure moving against appetite, as sender and as receiver?
*Provenance: I-GP-05, A-GP-07 (financial crime lagging indicators) · flags: [single], [long-tail -- preserve]*

- **Archetype:** Position (loss against appetite).
- **Bucket:** A.
- **Signal:** reimbursed APP losses, on the sending side and the receiving side (shared 50:50), rising against the fraud loss appetite; or receiving-side share rising, which points to mule accounts in the firm's own book.
- **Cadence / trigger:** monthly; quarterly BRC.
- **Primary user → routed exec:** CRO → SMF17 and fraud owner, CFO.

**1. Data aggregation (requirement)**
- Requirement: fraud loss appetite; the APP reimbursement rules (07 October 2024; £85,000 maximum; excess up to £100, not for vulnerable customers; five business days subject to stop-the-clock).
- Substrate inputs: APP claim log (sending and receiving roles); reimbursement amounts; receiving-account closure and mule indicators.
- Interaction inputs: none required.

**2. Baseline creation (evidence)**
- Dimensions: role × payment rail (Faster Payments, CHAPS) × channel × month.
- Normal: trailing band of reimbursed losses per 10,000 payments.
- Seasonality: known scam seasonality (for example holiday periods) stored in the rationale `[NEW -- beyond file]`.

**3. Dynamic detection (sufficiency)**
- Receiving-side reimbursements rising faster than sending-side; reimbursement inside five business days falling; trajectory to the loss appetite limit.

**4. Distillation (attestation)**
- Suppressed: one-off large claims already provisioned.
- Ranking inputs: trajectory; receiving-side share.
- Attestation: fraud owner attests the claim log.

**5. Surfacing and routing (gap / escalation)**
- CRO sees: fraud loss headroom gauge split by role.
- Recommended action: propose a mule-account review of the receiving cohort. The card never proposes relaxing financial crime controls to reduce friction cost.
- Draft artifact: ERC note.
- Human gate and audit: SMF17 decides; logged.
- Hero element: **headroom gauge split sender / receiver**.

**Why it beats a self-built dashboard.** Fraud MI is usually sending-side; the receiving-side share is the signal of mule activity in the firm's own customers and is rarely on the board page.

**Differentiation:** substrate-visible.

**Worked example.** PSR reported that 88% (£316 million) of claimed APP losses in the first 18 months were reimbursed (31 March 2026 dashboard, published 30 July 2026) (I-GP-05). Illustrative `[illustrative]`: firm reimbursements £3.2m a quarter, receiving-side share up from 31% to 44% in two quarters; fraud loss appetite £14m a year; projected £14.6m.

**Regulatory / governance hook.** PSR, *APP fraud reimbursement protections* (current 2026) and *APP scams reimbursement dashboard for Q1 2026* (30 July 2026).

**Feasibility (panel view).**
- Data needed: claim log with role.
- Hardest part: little; this is the most buildable long-tail item.
- False-positive risk: changing claim behaviour after policy publicity.
- Disagreement: **L4** warns this must never become a cost lever against financial crime controls. **L1** finds it board-relevant only at size. **L3** finds it easy. **L2** sees it as a standard Level 2 metric under financial crime.

---

### UC-GP-A16 -- How much impact-tolerance headroom do our important business services have left?
*Provenance: A-GP-07 (operational resilience and cyber rows) · flags: [single], [long-tail -- preserve]*

- **Archetype:** Position (headroom against impact tolerance).
- **Bucket:** A.
- **Signal:** remaining impact-tolerance headroom per important business service shrinking, driven by unresolved vulnerabilities and dependency concentration; critical vulnerabilities past SLA rising.
- **Cadence / trigger:** monthly; event trigger on any material incident.
- **Primary user → routed exec:** CRO → COO and CTO, board.

**1. Data aggregation (requirement)**
- Requirement: impact tolerances per important business service.
- Substrate inputs: incident log (duration, customers affected); vulnerability register with SLA; dependency map; scenario test results.
- Interaction inputs: none required.

**2. Baseline creation (evidence)**
- Dimensions: service × dependency × month.
- Normal: maximum observed disruption against tolerance; vulnerability ageing band.
- Seasonality: peak-load periods (payday, year-end).

**3. Dynamic detection (sufficiency)**
- Headroom below amber; vulnerabilities past SLA on a service's critical path; one dependency serving several services.

**4. Distillation (attestation)**
- Suppressed: vulnerabilities on non-critical paths.
- Ranking inputs: services affected; headroom; dependency concentration.
- Attestation: service owner attests; second line challenges scenario results.

**5. Surfacing and routing (gap / escalation)**
- Board sees: impact-tolerance headroom per service.
- Recommended action: propose remediation priority.
- Draft artifact: ERC note; the incident itself routes to UC-GP-A8 (including the 18 March 2027 incident regime).
- Human gate and audit: COO decides; logged.
- Hero element: **headroom gauge per important business service**.

**Why it beats a self-built dashboard.** Incident and vulnerability data are owned by technology; translating them into headroom against a board-set tolerance is not routine.

**Differentiation:** substrate-visible.

**Worked example.** Illustrative `[illustrative]`: the mortgage payments service has a 6-hour tolerance; the worst disruption this year was 4 hours 40 minutes; 9 critical vulnerabilities past SLA sit on its path; one hosting provider serves 3 of 5 services.

**Regulatory / governance hook.** GP gives only the indicator design (A-GP-07) and the 18 March 2027 incident reporting regime (C-GP-03). Operational resilience policy references (impact tolerance rules) are not in the GP file `[NEW -- beyond file]`.

**Feasibility (panel view).**
- Data needed: incident durations and a dependency map.
- Hardest part: the dependency map.
- False-positive risk: vulnerability counts without exploitability context.
- Disagreement: **L1** wants it on the board page; **L2** sees it as one of nine domains, not special; **L3** says the data is held by the CTO; **L4** has no objection, but notes the GP file cites no resilience rule.

---

### UC-GP-A17 -- Which customer cohorts' cash activity departs from their expected profile?
*Provenance: H-GP-07, H-GP-09 · flags: [single], [long-tail -- preserve]*

- **Archetype:** Silent failure (monitoring that does not fire).
- **Bucket:** A.
- **Signal:** a cohort's cash deposits against expected profile rising without a matching rise in alerts, or with alerts unresolved.
- **Cadence / trigger:** monthly.
- **Primary user → routed exec:** CRO → SMF17.

**1. Data aggregation (requirement)**
- Requirement: financial crime appetite statement on cash activity monitoring.
- Substrate inputs: cash deposit volumes by segment and branch cohort; declared turnover at onboarding; alert counts; CDD anomaly log.
- Interaction inputs: none required.

**2. Baseline creation (evidence)**
- Dimensions: segment × branch region × month.
- Normal: ratio of cash deposits to declared turnover; alert rate per £m cash.
- Seasonality: retail trading seasons.

**3. Dynamic detection (sufficiency)**
- Cash-to-profile ratio rising while the alert rate per £m falls (silent failure); personal accounts with business-like turnover (Nationwide shape).

**4. Distillation (attestation)**
- Suppressed: cohorts with an approved business reclassification.
- Ranking inputs: size of divergence; value.
- Attestation: SMF17.

**5. Surfacing and routing (gap / escalation)**
- CRO sees: silent-failure line under the financial crime row.
- Recommended action: propose a thematic review of the cohort.
- Draft artifact: thematic review scope.
- Human gate and audit: SMF17 decides; logged. Cohort-level only.
- Hero element: **silent-failure line with denominator**.

**Why it beats a self-built dashboard.** Monitoring MI reports alerts produced; it does not compare the volume of activity against the alerts it should have produced.

**Differentiation:** substrate-visible.

**Worked example.** NatWest received a £264.8m criminal fine (13 December 2021) for failing to monitor unusually large cash activity (H-GP-07). Illustrative `[illustrative]`: personal current accounts in one region, cash deposits up 64% in a year against declared income, alerts per £m down from 1.9 to 0.7.

**Regulatory / governance hook.** FCA/court outcome, NatWest (13 December 2021); FCA, Nationwide (12 December 2025).

**Feasibility (panel view).**
- Data needed: declared turnover and cash deposits.
- Hardest part: declared turnover quality.
- False-positive risk: genuine income changes.
- Disagreement: **L4** insists on cohort framing and protected-attribute care when slicing by region. **L2** sees it as SMF17 territory, below board altitude. **L1** sees it only via the silent-failure count. **L3** finds it feasible.

---

### UC-GP-A18 -- Is the lending book migrating toward high climate-risk exposure?
*Provenance: A-GP-07 (climate row), B-GP-06 (Leeds treats climate as emerging, not principal), B-GP-10 (Metro emerging risk) · flags: [single], [long-tail -- preserve]*

- **Archetype:** Position (trajectory of exposure mix).
- **Bucket:** A.
- **Signal:** new lending shifting toward collateral with poor EPC ratings or high physical-risk locations.
- **Cadence / trigger:** quarterly.
- **Primary user → routed exec:** CRO → BRC, CFO.

**1. Data aggregation (requirement)**
- Requirement: a climate appetite or emerging-risk statement with measures (the bank's own).
- Substrate inputs: collateral EPC ratings; property location risk scores; completions by segment.
- Interaction inputs: none required.

**2. Baseline creation (evidence)**
- Dimensions: EPC band × location risk band × quarter.
- Normal: book mix band.
- Seasonality: purchase-market seasonality.

**3. Dynamic detection (sufficiency)**
- Share of new lending in poor EPC or high flood-risk bands rising beyond trigger.

**4. Distillation (attestation)**
- Suppressed: movements inside band.
- Ranking inputs: trajectory; size.
- Attestation: credit risk owner.

**5. Surfacing and routing (gap / escalation)**
- BRC sees: climate entry on the emerging overlay with a trajectory.
- Recommended action: propose an appetite statement if none exists.
- Draft artifact: BRC note.
- Human gate and audit: BRC decides; logged.
- Hero element: **emerging overlay entry with trajectory**.

**Why it beats a self-built dashboard.** Climate data sits in a separate ESG or modelling team; linking it to the credit appetite chain is rare.

**Differentiation:** substrate-visible.

**Worked example.** Illustrative `[illustrative]`: completions on EPC E–G collateral rise from 9% to 13% in four quarters.

**Regulatory / governance hook.** GP gives only the indicator design and the firm practice of treating climate as emerging (Leeds, Metro). PRA climate supervisory expectations are not in the GP file `[NEW -- beyond file]`; brand rules require climate to be framed as PRA prudential.

**Feasibility (panel view).**
- Data needed: EPC and location data.
- Hardest part: EPC coverage gaps.
- False-positive risk: data improvements changing apparent mix.
- Disagreement: **L1** low priority for a demo; **L2** fits as an emerging overlay entry; **L3** EPC data is patchy; **L4** keep it prudential, not ESG.

---
# Bucket B -- net-new joins between substrate metrics and governance narrative

> Every Bucket B join is at cohort level (committee, metric, control, product, journey, channel, business area). Narrative is read for named metrics, controls, actions and themes, never to profile an individual customer or employee. Speak-up material is consumed only in aggregated, anonymised form. Correlation-evidence bands: **Strong** / **Moderate** / **Indicative** as defined in the framing. The AI marks every narrative extraction; a named human accepts it before it reaches a board page.

### UC-GP-B1 -- Which persistent ambers has the BRC never actually discussed?
*Provenance: B-GP-11 (escalation should be materiality- and decision-based; a board can legitimately need an amber), A-GP-04 (amber requires corrective action, forecast and named ownership), Synthesis item 8 · flags: [single]. Minutes-mining mechanism is product design; GP cites no case of minutes omitting an amber.*

- **Archetype:** Chain break (escalation) detected through the join.
- **Bucket:** B.
- **Signal:** a metric in amber for two or more consecutive periods with no substantive discussion, decision or action recorded in the minutes of the forum that should own it.
- **Cadence / trigger:** after each ERC, BRC and board meeting, once minutes are approved; quarterly escalation-health summary.
- **Primary user → routed exec:** CRO → BRC chair (governance fix).

**1. Data aggregation (requirement)**
- Substrate inputs: KRI and Level 1/2 metric time series with RAG state; the firm's escalation design (which forum owns which metric at which state); action log.
- Interaction inputs: ERC, BRC and board papers and approved minutes; the pack index (which metrics appeared in which paper).

**2. Baseline creation (evidence)**
- Dimensions: metric × forum × period.
- Normal: for each persistent amber, the firm's own historical pattern of "paper mention → discussion → action" within one cycle; the share of ambers that reached a decision.
- Seasonality: meeting calendars (quarterly BRC, monthly ERC) define the expected cycle; a metric that turned amber after the paper cut-off is not counted as missed.

**3. Dynamic detection (sufficiency)**
- Cross-domain correlation, time-aligned per meeting: metric in amber for N periods (substrate) AND, across those periods' minutes, no discussion, challenge, decision or owner action naming that metric or its principal risk (narrative).
- Variant: the metric appears in the paper but the minutes record "noted" only, with no action, for two meetings in a row.
- Variant: an amber is discussed at ERC with an action but never reaches the BRC although it threatens a strategic objective (B-GP-11).

**4. Distillation (attestation)**
- Suppressed: ambers with an approved recovery plan and date recorded in minutes; ambers explained by a stored seasonal band.
- Ranking inputs: persistence; strategic weight; whether the metric is a restriction proxy.
- Attestation: the company secretary confirms the minutes extract; the CRO accepts the escalation-health finding before the BRC chair sees it.

**5. Surfacing and routing (gap / escalation)**
- BRC chair sees: escalation-health index with a "persistent amber, not discussed" list.
- Correlation-evidence band: Moderate when one forum's minutes are silent; Strong when both ERC and BRC are silent across two or more cycles.
- Recommended action: propose an agenda item or a materiality-based routing change.
- Draft artifact: BRC agenda insert with the metric, trajectory and owner.
- Human gate and audit: BRC chair decides; logged.
- Hero element: **escalation-health index**.

**Why it is impossible without the join.** Metric systems know the amber persisted; minutes systems know what was discussed; neither alone knows that a persistent amber was never governed. A pack index shows the metric was in the paper, not that anyone acted on it.

**Why it beats a self-built dashboard.** Banks do not machine-read their own minutes against their metric store; the board secretariat tracks actions, not silences.

**Differentiation:** requires the join -- does not exist today.

**Worked example.** Illustrative `[illustrative]`: a conduct metric, "vulnerable-customer exceptions per 10,000 contacts", has been amber for three quarters (14.2, 15.8, 16.9 against amber 14 and red 18). The metric appeared in all three BRC papers; the minutes record "the Committee noted the conduct dashboard" each time, with no action or owner. The ERC minutes record one action in Q1 that was never closed. The index reads: "1 persistent amber, 3 cycles, no BRC decision; trajectory reaches red in 2 quarters."

**Regulatory / governance hook.** GP's finding that no rule prescribes "red only to board" and that a board can need an amber if it threatens strategy (B-GP-11, `[practice-not-rule]`); FCA COCON 4.2 reasonable steps (D-GP-02). Metro's junior staff raising concerns before full remediation (H-GP-03) is the closest GP anchor for escalation failure.

**Feasibility (panel view).**
- Data needed: approved minutes in text form; the pack index.
- Hardest part: minutes are summarised and sometimes deliberately terse; "noted" may hide a real discussion.
- False-positive risk: discussion recorded under a different heading or in a closed session.
- Disagreement: **L1** calls this the most uncomfortable and therefore most valuable insight for a BRC chair. **L2** warns minutes are a legal record and the product must not suggest the minutes are wrong, only that no action is recorded. **L3** says minute quality varies widely across firms. **L4** says the finding is evidence of reasonable steps (or their absence) and must be handled with legal privilege in mind.

---

### UC-GP-B2 -- Were staff raising the problem before the metric showed it?
*Provenance: H-GP-03 (Metro: junior staff raised concerns before full remediation; leading indicator "unresolved staff concern ageing"), F-GP-03, C-GP-06 · flags: [single]*

- **Archetype:** Chain break (escalation) plus silent failure.
- **Bucket:** B.
- **Signal:** aggregated staff concerns, escalation notes or second-line challenge records naming a control or feed, ageing unresolved, while that control's metric remains green.
- **Cadence / trigger:** monthly; event trigger when a concern theme reaches N items about one control.
- **Primary user → routed exec:** CRO → SMF17, COO, BRC chair (for unresolved concerns past SLA).

**1. Data aggregation (requirement)**
- Substrate inputs: control status and metrics (for example, monitoring coverage from UC-GP-A4); feed reconciliation results; issue log.
- Interaction inputs: escalation notes; second-line challenge records; aggregated speak-up themes (anonymised, control-level only).

**2. Baseline creation (evidence)**
- Dimensions: control × concern theme × month.
- Normal: concern volume and closure age per control area; the usual lag between a concern and an issue being raised.
- Seasonality: none significant; staff survey cycles raise volume at fixed points.

**3. Dynamic detection (sufficiency)**
- Cross-domain correlation: concerns naming a control or feed are open beyond SLA AND the control's metric shows no exception (the metric says "fine", the people say "not fine").
- Variant: concern closed as "no issue" and, within 90 days, a feed gap or breach is found on the same control.

**4. Distillation (attestation)**
- Suppressed: concerns resolved with evidence; single concerns with no control link.
- Ranking inputs: number of independent concerns; age; criticality of the control.
- Attestation: SMF17 reviews; the speak-up champion confirms aggregation preserves anonymity.

**5. Surfacing and routing (gap / escalation)**
- CRO sees: a "green, but concerns open" flag on the chain-integrity badge.
- Correlation-evidence band: Strong when concerns come from two or more independent channels; Indicative for a single channel.
- Recommended action: propose an independent test of the control.
- Draft artifact: test request to second line.
- Human gate and audit: SMF17 decides; logged.
- Hero element: **chain-integrity badge with a "concerns open" marker**.

**Why it is impossible without the join.** The control metric cannot see a concern; the concern log cannot see that the metric still reads green. Only the pairing shows a metric that people already doubt.

**Why it beats a self-built dashboard.** Speak-up and challenge records sit with compliance or HR and are never mapped to controls on the risk view.

**Differentiation:** requires the join -- does not exist today.

**Worked example.** Metro's monitoring feed gap affected more than 60m transactions worth £51bn; junior staff raised concerns before full remediation (H-GP-03). Illustrative `[illustrative]`: four escalation notes in 5 months mention "new-account transactions not appearing in the monitoring queue", one closed as "system working as designed"; monitoring coverage on the dashboard reads 99.1%. The card reads: "Monitoring coverage green; 4 open concerns about new-account transactions, oldest 148 days."

**Regulatory / governance hook.** FCA, Metro Bank £16.68m (12 November 2024); SUP 15.3 "information reasonably suggesting" a matter may have occurred (C-GP-01); GP's culture indicators "time to close concerns" (F-GP-03).

**Feasibility (panel view).**
- Data needed: escalation notes and challenge records with control tags or text.
- Hardest part: linking free text to a control without exposing the person.
- False-positive risk: concerns that are misunderstandings.
- Disagreement: **L4** insists on anonymised aggregation and on not treating whistleblowing material as a routine data source. **L3** says control tagging needs human confirmation. **L1** values it highly. **L2** wants it as an integrity marker, not a separate metric.

---

### UC-GP-B3 -- When did we first have information "reasonably suggesting" this matter, and how long did the decision take?
*Provenance: C-GP-01 (SUP 15.3 "immediately" once aware or with information reasonably suggesting), C-GP-06 (delay and incomplete escalation increase concern), C-GP-07 (facts known at the time) · flags: [single]*

- **Archetype:** Reportability case (latency).
- **Bucket:** B.
- **Signal:** the first narrative record (escalation note, challenge record, committee paper) that describes the matter predates the reportability decision by more than the firm's tolerance.
- **Cadence / trigger:** event-driven on any reportability case; quarterly latency summary.
- **Primary user → routed exec:** CRO → SMF16 (decision owner), BRC (days-to-notify metric).

**1. Data aggregation (requirement)**
- Substrate inputs: reportability ledger (UC-GP-A8) with decision timestamps; incident log; breach and issue registers.
- Interaction inputs: escalation notes; second-line challenge records; committee papers and minutes; attestation commentary.

**2. Baseline creation (evidence)**
- Dimensions: route × business area × matter type.
- Normal: the firm's own distribution of "first narrative mention → decision" by route.
- Seasonality: none.

**3. Dynamic detection (sufficiency)**
- Cross-domain correlation: for a ledger case, AI proposes candidate earlier narrative records describing the same facts; a human confirms each one; the gap between the earliest confirmed record and the decision is measured.
- Fires when the gap exceeds tolerance on an "immediately" route.

**4. Distillation (attestation)**
- Suppressed: candidate records rejected by the human reviewer (logged, not deleted).
- Ranking inputs: route urgency; gap size.
- Attestation: SMF16 confirms the awareness date used in the decision record.

**5. Surfacing and routing (gap / escalation)**
- CRO sees: days from awareness to decision on the reportability ledger, with the narrative evidence one click down.
- Correlation-evidence band: Strong when two independent records predate the decision; Moderate for one.
- Recommended action: propose an awareness date correction in the decision record, and a process fix.
- Draft artifact: decision-record addendum.
- Human gate and audit: SMF16 decides; product never asserts the legal awareness date.
- Hero element: **reportability ledger with "days from first mention" column**.

**Why it is impossible without the join.** The ledger records the decision date; only the narrative shows when the firm first held information reasonably suggesting the matter.

**Why it beats a self-built dashboard.** No tracker searches a firm's own notes for earlier mentions; this is done manually, if at all, by enforcement lawyers after the event.

**Differentiation:** requires the join -- does not exist today.

**Worked example.** Illustrative `[illustrative]`: a reportability case is opened on 14 October; an ERC paper of 02 September described "duplicate direct-debit collections affecting a small number of customers" and a second-line challenge record of 21 August asked whether the issue was systemic. Gap: 54 days. The ledger shows "awareness possibly 21 August (2 records), decision 15 October".

**Regulatory / governance hook.** FCA Handbook SUP 15.3 (extract 27 March 2026); PRA FR7 (PS7/26, 18 March 2026); GP's statement that under-reporting can itself become a breach of openness and co-operation (C-GP-06).

**Feasibility (panel view).**
- Data needed: searchable narrative records with dates.
- Hardest part: matching facts across differently worded records.
- False-positive risk: a similar but distinct matter.
- Disagreement: **L4** sees this as powerful but legally sensitive; it creates a record that may be disclosable. **L2** wants it as a quality measure, not a blame tool. **L1** wants the latency metric on the BRC page. **L3** finds semantic matching feasible with human confirmation.

---

### UC-GP-B4 -- Is a board-agreed trade-off still inside the bounds the board set, and is any "trade-off" actually a regulatory floor?
*Provenance: G-GP-03, G-GP-04, G-GP-05, Synthesis "metric-tension detection" and requirement "tension/conflict engine", CRO interview question 9 · flags: [single]*

- **Archetype:** Tension collision.
- **Bucket:** B.
- **Signal:** a guardrail pair (growth metric and risk metric) diverging beyond the bounds recorded in the board's decision; or a decision record that treats a regulatory floor as tradeable; or a tension visible in metrics with no decision record at all.
- **Cadence / trigger:** monthly; at each trade-off review date; event trigger on divergence.
- **Primary user → routed exec:** CRO → board and BRC (re-set the trade-off), CEO.

**1. Data aggregation (requirement)**
- Substrate inputs: the paired metrics GP lists: growth (approval or conversion, revenue, acquisition), risk (high-risk acceptance, expected loss, fraud loss, SAR or control yield), friction (false-positive rate, manual review rate, abandonment), capacity (analyst queues, model headroom, capital and liquidity consumption).
- Interaction inputs: the trade-off decision record as minuted: conflicting objectives, metrics affected, quantified downside and upside, the regulatory floor that cannot be traded, decision owner, forum, expiry or review date, monitoring plan (G-GP-04).

**2. Baseline creation (evidence)**
- Dimensions: guardrail pair × product × channel × month.
- Normal: the bounds the board agreed (for example "conversion may rise by up to 4 points provided high-risk acceptance stays below 0.8%").
- Seasonality: campaign periods noted in the decision record.

**3. Dynamic detection (sufficiency)**
- Cross-domain correlation: the metrics diverge beyond the minuted bounds; or the review date passes with no re-decision in the minutes; or the metrics show a tension (one improves while its partner deteriorates for N periods) with no minuted decision at all.
- Floor check: the decision record's "regulatory floor" field is empty, or the pair's risk metric is a restriction or legal requirement. The product rejects the pair as a tension and routes it as a breach (Starling and Monzo shape: accepting non-compliance with a VREQ is not a strategic choice).

**4. Distillation (attestation)**
- Suppressed: divergence within bounds.
- Ranking inputs: distance beyond bounds; floor proximity; days past review date.
- Attestation: the decision owner attests the pair's data; second line confirms the floor classification.

**5. Surfacing and routing (gap / escalation)**
- Board sees: tension register summary with each pair's position against agreed bounds and its review date.
- Correlation-evidence band: Strong when the bounds are quantified in the minutes; Indicative when the minutes record the trade-off only qualitatively.
- Recommended action: propose a re-decision at the next BRC.
- Draft artifact: trade-off paper, populated from the original decision record and the current metrics.
- Human gate and audit: board decides; never presented as a cost or ROI trade against a financial crime floor.
- Hero element: **tension register and guardrail pair**.

**Why it is impossible without the join.** The metric store sees two lines diverge but not the bounds the board agreed or whether a floor was named. The minutes hold the agreement but not the current state. Only the join can say "outside what the board agreed".

**Why it beats a self-built dashboard.** GP found no incumbent publicly demonstrating automatic detection of one metric being optimised at the expense of another (G-GP-05, ServiceNow IRM documentation accessed 27 October 2026; absence-of-evidence conclusion).

**Differentiation:** requires the join -- does not exist today.

**Worked example.** Illustrative `[illustrative]`: in March the board agreed to relax onboarding friction for a savings product, with bounds "conversion up to +5 points; high-risk acceptance below 0.8% of new customers; manual review backlog below 3 days; review in September". By August conversion is +6.2 points, high-risk acceptance 1.1%, backlog 5 days; no September review is minuted. Separately, the decision record lists "pre-CDD transacting" as a tradeable friction, which the floor check rejects. The register shows: "Savings onboarding trade-off: 2 of 3 bounds exceeded; review overdue 27 days; 1 item reclassified as a floor."

**Regulatory / governance hook.** GP's analysis that "we deliberately accepted more credit risk" can be legitimate while "we deliberately accepted non-compliance with a VREQ" is not (G-GP-04), anchored on FCA Starling (02 October 2024) and Monzo (08 July 2025). Leeds (26 February 2026) and Metro (15 April 2026) substantiate the trade-off between growth and risk (G-GP-03).

**Feasibility (panel view).**
- Data needed: structured decision records, or minutes that state bounds.
- Hardest part: most trade-offs are minuted qualitatively, so the first use is creating the record GP specifies.
- False-positive risk: metric moves caused by something other than the decision.
- Disagreement: **L1** sees the tension register as the single strongest "risk as strategic lever" artifact. **L2** wants the floor check as a hard fail. **L3** says extracting quantified bounds from minutes will rarely work; propose a structured form instead. **L4** insists the product never shows financial crime friction as a cost to be optimised. GP's own panel disagrees on "unserved": the CRO lens warns large banks may approximate this in bespoke tools.

---

### UC-GP-B5 -- Can each SMF show a reasonable-steps trail for the breaches in their area?
*Provenance: D-GP-02 (reasonable steps: challenge, action assignment, follow-up, escalation, closure evidence), D-GP-01, COCON 4.2 · flags: [single]*

- **Archetype:** Chain break (owner and escalation).
- **Bucket:** B.
- **Signal:** a metric breach or control failure in an SMF's area where the narrative record shows no challenge, action assignment, follow-up or escalation by that SMF within the expected window.
- **Cadence / trigger:** quarterly; event trigger on red.
- **Primary user → routed exec:** CRO → each SMF (self-view), CEO, BRC chair.

**1. Data aggregation (requirement)**
- Substrate inputs: breach history; SoR mapping (UC-GP-A9); action log.
- Interaction inputs: committee minutes (challenge recorded against the SMF); escalation notes; attestation commentary; second-line challenge records.

**2. Baseline creation (evidence)**
- Dimensions: SMF responsibility × principal risk × quarter.
- Normal: the five reasonable-steps elements recorded within one governance cycle of a red.
- Seasonality: none.

**3. Dynamic detection (sufficiency)**
- Cross-domain correlation: red or persistent amber in a responsibility area (substrate) AND missing trail elements in the narrative (no challenge, no assigned action, no follow-up, no escalation, no closure evidence).

**4. Distillation (attestation)**
- Suppressed: breaches where the trail is complete.
- Ranking inputs: number of missing elements; severity.
- Attestation: the SMF reviews and adds evidence held elsewhere before anything is reported upwards.

**5. Surfacing and routing (gap / escalation)**
- SMF sees: a private trail-completeness view first; the CRO sees a summary count.
- Correlation-evidence band: Moderate (one narrative source per element is typical).
- Recommended action: propose the missing step (for example, a minuted challenge).
- Draft artifact: SMF evidence pack.
- Human gate and audit: SMF confirms; nothing is shown to the board without SMF review.
- Hero element: **reasonable-steps trail strip on the owner panel**.

**Why it is impossible without the join.** The breach is in the metrics; the steps are in the narrative. A register cannot show steps; minutes cannot show which breaches needed them.

**Why it beats a self-built dashboard.** SMFs assemble this by hand only when an investigation starts.

**Differentiation:** requires the join -- does not exist today.

**Worked example.** Illustrative `[illustrative]`: SMF responsibility for financial crime systems has 3 reds in two quarters; trail shows challenge (2 of 3), action assigned (3 of 3), follow-up (1 of 3), escalation to BRC (0 of 3), closure evidence (1 of 3).

**Regulatory / governance hook.** FCA COCON 4.2 (current 2026): failure example includes not taking reasonable steps to allocate responsibilities or implement adequate controls (D-GP-02); HM Treasury SMCR response (22 April 2026).

**Feasibility (panel view).**
- Data needed: minutes and action logs linked to SoRs.
- Hardest part: trust; SMFs may resist a tool that assembles evidence about them.
- False-positive risk: steps taken but not written down.
- Disagreement: **L4** sees strong defensive value. **L1** values it for the BRC chair. **L2** insists it is framed as protection for the SMF, not surveillance. **L3** expects incomplete records at first.

---

### UC-GP-B6 -- Which complaint themes line up with a parameter change no risk owner approved?
*Provenance: D-GP-06 (product sets the rule, technology changes a parameter, operations executes, complaints see the outcome, compliance sees only the rule), F-GP-02, CRO interview question 6 · flags: [single]*

- **Archetype:** Chain break (change and ownership) detected through the join.
- **Bucket:** B.
- **Signal:** a rise in a complaint narrative theme for a journey, time-aligned with a technology or configuration change on that journey that has no risk-owner approval.
- **Cadence / trigger:** weekly; event trigger on a theme spike.
- **Primary user → routed exec:** CRO → journey owner, risk owner, CTO, SMF16 (if a Consumer Duty issue).

**1. Data aggregation (requirement)**
- Substrate inputs: technology change and parameter logs by journey; journey metrics (drop-off, cancellations, overrides); complaint counts.
- Interaction inputs: complaint narratives (themes, aggregated); first-line escalation notes.

**2. Baseline creation (evidence)**
- Dimensions: journey × complaint theme × week.
- Normal: theme share per journey; change frequency per journey.
- Seasonality: product-cycle events (rate changes, renewals).

**3. Dynamic detection (sufficiency)**
- Cross-domain correlation: a theme rises beyond its band within a set window after a change on the same journey AND that change has no risk-owner approval (the ownership gap GP describes).
- The correlation is offered as a candidate cause for human review, not a causal claim.

**4. Distillation (attestation)**
- Suppressed: theme spikes with no change in the window; changes with approval and declared impact.
- Ranking inputs: theme volume; customer detriment theme; vulnerability markers (cohort).
- Attestation: the journey owner reviews; second line challenges.

**5. Surfacing and routing (gap / escalation)**
- CRO sees: a horizontal ownership conflict card, naming journey owner, risk owner, change owner and control owner.
- Correlation-evidence band: Moderate when timing and journey align; Strong when complaint text names the changed behaviour.
- Recommended action: propose a retrospective approval and a customer-impact review; open a draft reportability case if detriment is significant.
- Draft artifact: change-impact review request.
- Human gate and audit: the risk owner decides; logged.
- Hero element: **ownership-conflict card across journey, risk, change and control owners**.

**Why it is impossible without the join.** Complaints show the outcome but not the change; change logs show the change but not the outcome; neither shows that no risk owner approved it.

**Why it beats a self-built dashboard.** Complaint MI and change logs sit in different functions; GP says vertical ownership hides exactly this horizontal failure.

**Differentiation:** requires the join -- does not exist today.

**Worked example.** Illustrative `[illustrative]`: on 09 September a technology team changes an affordability parameter on a remortgage journey; complaints with the theme "offer withdrawn after approval" go from 12 to 71 a week within 3 weeks; the change was approved by technology only. The card reads: "Remortgage journey: complaint theme up 5.9x since a parameter change with no risk-owner approval."

**Regulatory / governance hook.** FCA, *Consumer understanding: good practice and areas for improvement* (13 March 2026); FCA AI good-practice review (19 October 2026), fragmented ownership weakens accountability (D-GP-06, F-GP-02). Journey ownership is `[practice-not-rule]`.

**Feasibility (panel view).**
- Data needed: change logs tagged by journey; complaint themes.
- Hardest part: journey tagging of technical changes.
- False-positive risk: coincident timing.
- Disagreement: **L3** sees journey tagging as the blocker. **L1** finds it compelling. **L2** wants it as a chain break rather than an analytic. **L4** reminds that the conduct outcome may engage SUP 15.3 and Consumer Duty.

---

### UC-GP-B7 -- Does our Consumer Duty board report say what our outcome data and complaint narratives say?
*Provenance: F-GP-01 (PRIN 2A board report; FCA review of 180 firms), F-GP-04 (machine-measured facts plus accountable human judgement), A-GP-07 (conduct row) · flags: [single]*

- **Archetype:** Chain break (assurance of a board statement).
- **Bucket:** B.
- **Signal:** a statement in the draft Consumer Duty board report ("customers are receiving good outcomes in X") contradicted by the outcome metrics or complaint narrative themes for that outcome and cohort.
- **Cadence / trigger:** annual board report cycle; quarterly interim.
- **Primary user → routed exec:** CRO → board (approver of the report), Consumer Duty champion, SMF16.

**1. Data aggregation (requirement)**
- Substrate inputs: outcome metrics (journey friction and drop-off, vulnerable-customer exceptions, upheld complaints, redress, FOS outcomes).
- Interaction inputs: the draft board report; complaint narratives (themes); first-line attestation commentary on outcomes.

**2. Baseline creation (evidence)**
- Dimensions: outcome (products and services, price and value, consumer understanding, consumer support) × cohort (vulnerable and not) × product × year.
- Normal: prior-year outcome bands and theme mix.
- Seasonality: annual.

**3. Dynamic detection (sufficiency)**
- Cross-domain correlation: each assertion in the report is linked to its metric and theme; the product flags assertions with no supporting measure, or with a measure or theme moving the other way.

**4. Distillation (attestation)**
- Suppressed: assertions with supporting evidence.
- Ranking inputs: outcome; vulnerable cohort; size of contradiction.
- Attestation: the report owner accepts or amends; the board approves.

**5. Surfacing and routing (gap / escalation)**
- CRO sees: an evidence-backing check on each paragraph of the draft.
- Correlation-evidence band: Strong when metric and narrative both contradict; Indicative for narrative only.
- Recommended action: propose amended wording or an action.
- Draft artifact: tracked-change suggestions on the report (AI-marked).
- Human gate and audit: board approves the final report.
- Hero element: **assertion-to-evidence check on the board report**.

**Why it is impossible without the join.** A report is narrative and the metrics are tables; testing one against the other is manual today.

**Why it beats a self-built dashboard.** A Consumer Duty dashboard shows metrics but cannot read the board's own statement.

**Differentiation:** requires the join -- does not exist today.

**Worked example.** Illustrative `[illustrative]`: draft report states "customers in financial difficulty receive appropriate support"; forbearance complaints theme up 38% year on year; vulnerable-customer exceptions per 10,000 contacts 16.9 against 14 amber; no measure linked to "appropriate support".

**Regulatory / governance hook.** FCA, *Consumer Duty board reports: good practice and areas for improvement* (11 December 2024), review of 180 firms' first reports; PRIN 2A.

**Feasibility (panel view).**
- Data needed: draft report text and outcome MI.
- Hardest part: linking prose assertions to metrics.
- False-positive risk: nuanced wording read as contradiction.
- Disagreement: **L1** very high value. **L2** wants it as an assurance check, not an editor. **L3** feasible with human linking. **L4** reminds that the board owns the report; AI only suggests.

---

### UC-GP-B8 -- Do speak-up themes and override behaviour tell the same culture story?
*Provenance: F-GP-03 (speak-up volume and substantiation, retaliation allegations, time to close concerns, escalation reversals, repeated override behaviour; rising volume can mean worse culture or better willingness to report; interpretation needs human attestation), FCA non-financial misconduct survey of 1,028 wholesale firms · flags: [single], [long-tail -- preserve]*

- **Archetype:** Position (culture) needing human interpretation.
- **Bucket:** B.
- **Signal:** a business area where aggregated speak-up themes and substrate behaviour indicators (overrides, escalation reversals, conduct-event recurrence) move together.
- **Cadence / trigger:** quarterly.
- **Primary user → routed exec:** CRO → board (culture), CEO, HR director.

**1. Data aggregation (requirement)**
- Substrate inputs: override counts; escalation reversals; conduct-event recurrence; time to close concerns.
- Interaction inputs: aggregated speak-up themes and substantiation rates; employee risk survey commentary.

**2. Baseline creation (evidence)**
- Dimensions: business area × theme × quarter.
- Normal: area's own trailing band.
- Seasonality: survey cycles.

**3. Dynamic detection (sufficiency)**
- Cross-domain correlation: substantiated speak-up themes rising AND overrides or reversals rising in the same area → "concerning"; speak-up rising with overrides flat or falling → "possibly better reporting". The product never scores more reports as worse.

**4. Distillation (attestation)**
- Suppressed: areas below a minimum size (anonymity).
- Ranking inputs: concordance of the two signals.
- Attestation: the culture owner writes the narrative interpretation; the board sees both the data and the human interpretation.

**5. Surfacing and routing (gap / escalation)**
- Board sees: culture card with two signals and a required human interpretation.
- Correlation-evidence band: Indicative at best; the card says so.
- Recommended action: propose a deep dive.
- Draft artifact: interpretation template.
- Human gate and audit: interpretation is mandatory before display.
- Hero element: **culture card with required narrative interpretation**.

**Why it is impossible without the join.** The volume alone is ambiguous (GP's own point); only the pairing with behaviour data separates "worse culture" from "better reporting".

**Why it beats a self-built dashboard.** Culture dashboards count reports and score more as worse.

**Differentiation:** requires the join -- does not exist today.

**Worked example.** Illustrative `[illustrative]`: intermediary lending area; substantiated speak-up concerns 3 → 9 in two quarters; underwriting overrides up 41%; two escalation reversals. Another area: speak-up 4 → 11, overrides down 12%, read as improving willingness to report.

**Regulatory / governance hook.** FCA, *Culture and non-financial misconduct survey -- findings* (25 October 2024), 1,028 wholesale firms (F-GP-03).

**Feasibility (panel view).**
- Data needed: aggregated speak-up themes.
- Hardest part: anonymity in small areas.
- False-positive risk: high; the band is always Indicative.
- Disagreement: **L4** extremely cautious about whistleblowing data. **L1** wants culture on the board page. **L2** says it is a long-tail demo item. **L3** says area sizes in tier 3 firms will be too small.

---

### UC-GP-B9 -- Is the owner attesting "no unexplained movements" while the metric moves?
*Provenance: D-GP-07 (the metric owner should confirm lineage, known limitations, unexplained movements and threshold status; monthly attestation is practice, not rule), F-GP-04 (structured attestation beside data) · flags: [single]*

- **Archetype:** Chain break (attestation).
- **Bucket:** B.
- **Signal:** attestation commentary that is copied unchanged across periods, or that states "no unexplained movements" in a period where the metric moved beyond its band, or that repeats the same caveat without action.
- **Cadence / trigger:** at each attestation cycle (frequency configurable, practice).
- **Primary user → routed exec:** CRO → metric owners, second line.

**1. Data aggregation (requirement)**
- Substrate inputs: metric time series; reconciliation results; threshold status.
- Interaction inputs: attestation commentary and caveats per metric per period.

**2. Baseline creation (evidence)**
- Dimensions: metric × owner × period.
- Normal: commentary that changes when the metric changes; caveats that carry an action.
- Seasonality: inherited from metric bands.

**3. Dynamic detection (sufficiency)**
- Cross-domain correlation: metric movement beyond band AND commentary text identical to the prior period, or asserting no unexplained movement; or the same limitation caveat for three or more periods with no action.

**4. Distillation (attestation)**
- Suppressed: metrics within band with stable commentary.
- Ranking inputs: altitude of the metric; number of periods unchanged.
- Attestation: second line challenges; owner re-attests.

**5. Surfacing and routing (gap / escalation)**
- CRO sees: attestation status on the chain-integrity badge as "attested, challenged" rather than a tick.
- Correlation-evidence band: Moderate.
- Recommended action: propose a challenge to the owner.
- Draft artifact: challenge note.
- Human gate and audit: second line decides; logged.
- Hero element: **chain-integrity badge (attestation check) with "challenged" state**.

**Why it is impossible without the join.** An attestation system holds a signature; a metric system holds the movement; neither tests whether the words match the numbers.

**Why it beats a self-built dashboard.** Attestation is usually a tick box.

**Differentiation:** requires the join -- does not exist today.

**Worked example.** Illustrative `[illustrative]`: liquidity metric "deposit outflow velocity" moves from 2.1% to 3.4% a week; the owner's commentary for the third month running reads "no unexplained movements; data complete".

**Regulatory / governance hook.** GP: monthly data attestation is `[practice-not-rule]` and its outcome benefit is `[single]` (D-GP-07); structured attestation beside data (F-GP-04).

**Feasibility (panel view).**
- Data needed: commentary text.
- Hardest part: little; text comparison is simple.
- False-positive risk: genuinely explained movements explained elsewhere.
- Disagreement: **L2** core IP. **L1** low visibility at board level. **L3** easy. **L4** must be labelled practice.

---

### UC-GP-B10 -- Are we about to publish a figure that still has an unresolved challenge against it?
*Provenance: H-GP-04 (Metro £10.0m disclosure fine: incorrect RWA information published without qualification after management knew a correction was needed; leading indicator "unresolved material data adjustments; disclosure items with outstanding legal/accounting challenge"), B-GP-01 (sanitised external narrative) · flags: [single], [long-tail -- preserve]*

- **Archetype:** Chain break (attestation and disclosure).
- **Bucket:** B.
- **Signal:** a figure in a board paper or external disclosure draft whose underlying metric has an open challenge record, unresolved data adjustment or caveat.
- **Cadence / trigger:** at each disclosure and board pack cut-off.
- **Primary user → routed exec:** CRO → CFO, audit committee chair.

**1. Data aggregation (requirement)**
- Substrate inputs: metric store; data adjustment log; reconciliation status.
- Interaction inputs: disclosure drafts and board papers; second-line, finance and legal challenge records; attestation caveats.

**2. Baseline creation (evidence)**
- Dimensions: figure × source metric × disclosure.
- Normal: every published figure has closed challenges and a reconciled source.
- Seasonality: reporting calendar.

**3. Dynamic detection (sufficiency)**
- Cross-domain correlation: a figure in the draft (narrative) maps to a metric with an open challenge or adjustment (substrate and narrative).

**4. Distillation (attestation)**
- Suppressed: immaterial adjustments under a set threshold.
- Ranking inputs: materiality; external or internal audience.
- Attestation: the CFO and figure owner resolve or qualify.

**5. Surfacing and routing (gap / escalation)**
- CFO sees: "open challenge" flags on the draft.
- Correlation-evidence band: Strong (direct link).
- Recommended action: propose resolution or a qualification.
- Draft artifact: qualification wording.
- Human gate and audit: CFO decides; logged.
- Hero element: **figure-level integrity flag on the draft**.

**Why it is impossible without the join.** The draft is narrative and does not know which challenges are open; the challenge log does not know the figure is about to be published.

**Why it beats a self-built dashboard.** Disclosure checklists are manual.

**Differentiation:** requires the join -- does not exist today.

**Worked example.** Metro's 2022 fine (12 December 2022) shows the failure shape (H-GP-04). Illustrative `[illustrative]`: a board paper shows CET1 headroom 210bp; a finance challenge record opened 3 weeks earlier questions an RWA adjustment worth 35bp; still open at cut-off.

**Regulatory / governance hook.** FCA, Metro Bank £10.0m (12 December 2022).

**Feasibility (panel view).**
- Data needed: challenge logs linked to figures.
- Hardest part: figure-to-metric linkage in documents.
- False-positive risk: low materiality.
- Disagreement: **L1** strong for the audit committee; **L2** sits with the CFO more than the CRO; **L3** document parsing is hard; **L4** strong precedent.

---

### UC-GP-B11 -- Does the change request's stated rationale match what the change actually did?
*Provenance: I-GP-09, H-GP-06, CRO interview question 6 · flags: [single]*

- **Archetype:** Chain break (change), narrative-backed.
- **Bucket:** B.
- **Signal:** a change request whose written rationale ("reduce false positives, no loss of coverage") is contradicted by post-change metrics, or whose second-line challenge was recorded and not answered.
- **Cadence / trigger:** 30, 60 and 90 days after each material change.
- **Primary user → routed exec:** CRO → model risk committee, SMF17.

**1. Data aggregation (requirement)**
- Substrate inputs: change log; post-change alert, conversion and coverage metrics (UC-GP-A7).
- Interaction inputs: change request rationale and declared impact; model risk committee minutes; second-line challenge records on the change.

**2. Baseline creation (evidence)**
- Dimensions: change × metric × post-change window.
- Normal: declared impact range.
- Seasonality: like-for-like periods.

**3. Dynamic detection (sufficiency)**
- Cross-domain correlation: post-change metrics fall outside the declared impact range written in the request; or a challenge record exists with no recorded response before approval.

**4. Distillation (attestation)**
- Suppressed: changes within declared impact.
- Ranking inputs: appetite metric affected; size of deviation.
- Attestation: validator attests.

**5. Surfacing and routing (gap / escalation)**
- CRO sees: change-lineage entry with "declared vs actual".
- Correlation-evidence band: Strong when declared impact is quantified.
- Recommended action: propose a validation review.
- Draft artifact: review request.
- Human gate and audit: model risk committee decides; product never reverts.
- Hero element: **declared-versus-actual change card**.

**Why it is impossible without the join.** The declared impact exists only in narrative; the actual only in metrics.

**Why it beats a self-built dashboard.** Post-implementation reviews are manual and often skipped.

**Differentiation:** requires the join -- does not exist today.

**Worked example.** Illustrative `[illustrative]`: request states "reduce alerts 15%, no SAR impact"; actual alerts −38%, SAR-worthy alerts −10 a month; second-line challenge "has coverage been tested?" unanswered.

**Regulatory / governance hook.** PRA model risk management principles (cited by GP as PS6/23, 17 May 2023, and SS1/23); HSBC £63.9m (17 December 2021).

**Feasibility (panel view).**
- Data needed: structured change requests.
- Hardest part: declared impacts often unquantified.
- False-positive risk: environment changes.
- Disagreement: **L2** strong IP fit. **L3** feasible. **L4** strong. **L1** only via aggregates.

---

### UC-GP-B12 -- Are remediation actions being closed in the log while the metric they were meant to fix has not moved?
*Provenance: H-GP-09 (remediation not timely), D-GP-02 (closure evidence), E-GP-03 (third line: overdue high-risk findings) · flags: [single]*

- **Archetype:** Chain break (action effectiveness).
- **Bucket:** B.
- **Signal:** actions marked closed with closure narrative claiming the issue is fixed, while the linked metric remains outside band.
- **Cadence / trigger:** monthly; at each action closure.
- **Primary user → routed exec:** CRO → first-line owners, Head of Internal Audit.

**1. Data aggregation (requirement)**
- Substrate inputs: action log status; linked metrics.
- Interaction inputs: closure narratives; audit validation notes; committee minutes accepting closure.

**2. Baseline creation (evidence)**
- Dimensions: action × linked metric × months after closure.
- Normal: linked metric returning inside band within the declared recovery time.
- Seasonality: inherited.

**3. Dynamic detection (sufficiency)**
- Cross-domain correlation: action closed with narrative "remediated" AND linked metric not inside band after recovery time.

**4. Distillation (attestation)**
- Suppressed: actions with no linked metric (shown separately as mapping gaps).
- Ranking inputs: severity; repeat closure.
- Attestation: internal audit validates; owner re-opens.

**5. Surfacing and routing (gap / escalation)**
- CRO sees: "closed but not effective" count in the exception feed.
- Correlation-evidence band: Moderate.
- Recommended action: propose re-opening.
- Draft artifact: re-open request.
- Human gate and audit: owner and audit decide.
- Hero element: **exception feed "closed, not effective" entry**.

**Why it is impossible without the join.** The action log says closed; the metric says not fixed; only the narrative shows what the closure claimed.

**Why it beats a self-built dashboard.** Action trackers report closure rates, which improve when actions are closed regardless of effect.

**Differentiation:** requires the join -- does not exist today.

**Worked example.** Illustrative `[illustrative]`: 42 CDD remediation actions closed in Q2 with "backlog addressed"; overdue CDD still 26,900 against a target of 10,000.

**Regulatory / governance hook.** FCA, Nationwide £44.08m (12 December 2025), remediation not timely (H-GP-09).

**Feasibility (panel view).**
- Data needed: action-to-metric links.
- Hardest part: linking actions to metrics.
- False-positive risk: long recovery times.
- Disagreement: **L1** strong; **L2** strong; **L3** link quality; **L4** supports.

---

### UC-GP-B13 -- Are high-risk relationship acceptances being challenged when adverse information arrives?
*Provenance: H-GP-08 (Barclays c.£42m across financial crime cases including WealthTek and Stunt & Co; decision challenge inadequate; leading indicators "high-risk relationship exceptions; unresolved adverse intelligence; transaction pattern escalation") · flags: [single], [long-tail -- preserve]*

- **Archetype:** Chain break (escalation, risk acceptance).
- **Bucket:** B.
- **Signal:** a cohort of high-risk relationships with adverse information or transaction-pattern alerts accumulating while the risk acceptance records show no re-review.
- **Cadence / trigger:** monthly.
- **Primary user → routed exec:** CRO → SMF17.

**1. Data aggregation (requirement)**
- Substrate inputs: high-risk relationship register; adverse media and intelligence hits; transaction alerts.
- Interaction inputs: risk acceptance committee records; escalation notes; second-line challenge records.

**2. Baseline creation (evidence)**
- Dimensions: relationship cohort (segment, risk tier) × month.
- Normal: re-review within N days of adverse information.
- Seasonality: none.

**3. Dynamic detection (sufficiency)**
- Cross-domain correlation: adverse hits or alerts on the cohort rising AND no re-review or challenge recorded within N days.

**4. Distillation (attestation)**
- Suppressed: relationships exited.
- Ranking inputs: count without re-review; days overdue.
- Attestation: SMF17.

**5. Surfacing and routing (gap / escalation)**
- CRO sees: count of high-risk relationships with unreviewed adverse information.
- Correlation-evidence band: Moderate.
- Recommended action: propose re-review of the cohort.
- Draft artifact: re-review list (to SMF17 workspace, not to the board).
- Human gate and audit: SMF17 decides; no customer-level detail on the board page.
- Hero element: **exception feed count, drilling to the SMF17 workspace**.

**Why it is impossible without the join.** Alerts are in monitoring; acceptance decisions are in committee records; only together do they show acceptance not being revisited.

**Why it beats a self-built dashboard.** High-risk registers record acceptance once.

**Differentiation:** requires the join -- does not exist today.

**Worked example.** Barclays was fined c.£42m (16 July 2025) (H-GP-08). Illustrative `[illustrative]`: 63 high-risk corporate relationships; 14 with adverse media hits in 90 days; 3 re-reviewed.

**Regulatory / governance hook.** FCA, Barclays (16 July 2025).

**Feasibility (panel view).**
- Data needed: acceptance records.
- Hardest part: committee records are not structured.
- False-positive risk: irrelevant adverse media.
- Disagreement: **L4** strong, but customer data stays in the SMF17 workspace. **L1** count only. **L2** below board altitude except as a count. **L3** feasible.

---

### UC-GP-B14 -- Which risks are the committees talking about that are not on the register, and the reverse?
*Provenance: B-GP-03 (Coventry: top and emerging risks filtered above principal risks, monitored by board), B-GP-05 (Skipton: forward-looking scenario focus), B-GP-10 (Metro emerging list) · flags: [single], [long-tail -- preserve]*

- **Archetype:** Chain break (mapping) through the join.
- **Bucket:** B.
- **Signal:** a theme discussed repeatedly in committee minutes that has no entry on the emerging-risk register or no mapped indicator; or a register entry never discussed.
- **Cadence / trigger:** quarterly.
- **Primary user → routed exec:** CRO → BRC.

**1. Data aggregation (requirement)**
- Substrate inputs: emerging-risk register; mapped indicators (UC-GP-A12).
- Interaction inputs: board, BRC and ERC minutes and papers.

**2. Baseline creation (evidence)**
- Dimensions: theme × forum × quarter.
- Normal: discussed themes map to register entries.
- Seasonality: none.

**3. Dynamic detection (sufficiency)**
- Cross-domain correlation: theme frequency in minutes above N with no register entry; register entry with zero discussion in four quarters.

**4. Distillation (attestation)**
- Suppressed: one-off mentions.
- Ranking inputs: frequency; forums.
- Attestation: second line confirms themes.

**5. Surfacing and routing (gap / escalation)**
- BRC sees: "discussed, not registered" and "registered, not discussed" lists.
- Correlation-evidence band: Indicative.
- Recommended action: propose register updates.
- Draft artifact: register change proposal.
- Human gate and audit: BRC decides.
- Hero element: **emerging overlay with discussion markers**.

**Why it is impossible without the join.** The register cannot see discussion; minutes cannot see the register.

**Why it beats a self-built dashboard.** Horizon scanning is usually a separate paper.

**Differentiation:** requires the join -- does not exist today.

**Worked example.** Illustrative `[illustrative]`: "third-party AI agents accessing customer accounts" discussed at 3 of 4 BRC meetings; not on the register. "Pension risk" on the register; not discussed in four quarters.

**Regulatory / governance hook.** Firm practice (Coventry 06 March 2025; Skipton 25 February 2025; Metro 15 April 2026), `[practice-not-rule]`. Reuters (22 October 2026) on banks blocking unauthorised agents gives the illustrative theme a real anchor (I-GP-07).

**Feasibility (panel view).**
- Data needed: minutes text.
- Hardest part: theme extraction.
- False-positive risk: high.
- Disagreement: **L1** likes it; **L2** low IP fit; **L3** feasible; **L4** neutral.

---

### UC-GP-B15 -- Are customers telling us an agent acted outside what they authorised?
*Provenance: I-GP-06 (authorised instruction delegated to an agent versus agent action outside the mandate; store mandate as machine-readable constraints and preserve proof), I-GP-05, I-GP-07 · flags: [single], [long-tail -- preserve]*

- **Archetype:** Breach (mandate) through the join.
- **Bucket:** B.
- **Signal:** complaint and dispute narratives with the theme "I did not authorise this" on agent-initiated payments, aligned with mandate-store data for the same cohort.
- **Cadence / trigger:** weekly.
- **Primary user → routed exec:** CRO → SMF17, SMF16 (Consumer Duty), CTO.

**1. Data aggregation (requirement)**
- Substrate inputs: agent-tagged payments; mandate store; out-of-mandate flags (UC-GP-A14).
- Interaction inputs: complaint and dispute narratives (aggregated themes).

**2. Baseline creation (evidence)**
- Dimensions: agent type × theme × week.
- Normal: theme rate per 10,000 agent payments.
- Seasonality: none yet.

**3. Dynamic detection (sufficiency)**
- Cross-domain correlation: "did not authorise" theme rising for an agent type AND (a) the mandate store shows the payment inside mandate (consent dispute: mandate design or customer understanding issue), or (b) outside mandate (control failure).

**4. Distillation (attestation)**
- Suppressed: themes on non-agent payments.
- Ranking inputs: rate; vulnerable cohort share.
- Attestation: SMF17 and SMF16.

**5. Surfacing and routing (gap / escalation)**
- CRO sees: split card "inside mandate but disputed" versus "outside mandate".
- Correlation-evidence band: Moderate.
- Recommended action: propose a mandate-design review or a control review.
- Draft artifact: review request.
- Human gate and audit: humans decide liability; the product does not.
- Hero element: **agent lineage card with dispute split**.

**Why it is impossible without the join.** The mandate store cannot see the customer's belief; complaints cannot see the mandate.

**Why it beats a self-built dashboard.** No dashboard pairs mandate proof with dispute narratives.

**Differentiation:** requires the join -- does not exist today.

**Worked example.** Illustrative `[illustrative]`: 14,200 agent payments; 41 disputes "did not authorise"; 35 inside mandate (customers did not understand the standing mandate), 6 outside.

**Regulatory / governance hook.** HM Treasury, *Modernising Payment Services Regulation* (14 July 2026), on authentication, consent and liability for unauthorised transactions; legal position unsettled (I-GP-06).

**Feasibility (panel view).**
- Data needed: agent tagging and mandate store.
- Hardest part: both barely exist.
- False-positive risk: theme misclassification.
- Disagreement: **L4** strongly against any liability verdict. **L1** early. **L2** fits. **L3** data immature.

---

### UC-GP-B16 -- When a new Final Notice lands, did our read-across actually test the population?
*Provenance: C-GP-06 (read-across is a common supervisory and remediation technique; no standalone rule; record the required read-across population), H panel synthesis ("can we prove that the population actually obeyed"), persona question 9 · flags: [single]*

- **Archetype:** Chain break (read-across).
- **Bucket:** B.
- **Signal:** a read-across review recorded as closed in second-line challenge records or committee minutes ("no similar issue identified") without a population test on the controls that share the failed design or feed.
- **Cadence / trigger:** event-driven on publication of a relevant Final Notice; also on an internal incident.
- **Primary user → routed exec:** CRO → second line, SMF17.

**1. Data aggregation (requirement)**
- Substrate inputs: precedent corpus (real UK Final Notices, posture-tagged); control register with design and feed attributes; population test results (UC-GP-A3, A4, A6).
- Interaction inputs: read-across records; committee minutes closing the review.

**2. Baseline creation (evidence)**
- Dimensions: precedent × control design × feed.
- Normal: every control sharing the failed design has a population test dated after the precedent.
- Seasonality: none.

**3. Dynamic detection (sufficiency)**
- Cross-domain correlation: read-across closed (narrative) AND no population test after the precedent date for a control sharing the design (substrate).

**4. Distillation (attestation)**
- Suppressed: controls with no shared design.
- Ranking inputs: similarity; criticality.
- Attestation: second line.

**5. Surfacing and routing (gap / escalation)**
- CRO sees: read-across prompt "Metro 2024 feed shape: 3 feeds share the design, 1 tested".
- Correlation-evidence band: Strong (direct link).
- Recommended action: propose population tests.
- Draft artifact: read-across scope.
- Human gate and audit: second line decides.
- Hero element: **read-across prompt linked to the precedent corpus**.

**Why it is impossible without the join.** The closure is narrative; the test evidence is substrate; the precedent is external.

**Why it beats a self-built dashboard.** Read-across is a memo today.

**Differentiation:** requires the join -- does not exist today.

**Worked example.** Precedent: Metro Bank £16.68m (12 November 2024), monitoring feed omission. Illustrative `[illustrative]`: the bank's read-across memo of 03 December 2024 concluded "no equivalent gap"; three feeds into monitoring share the same nightly batch design; only one has a reconciliation test after November 2024.

**Regulatory / governance hook.** C-GP-06 (`[practice-not-rule]`), FCA Metro (12 November 2024), Starling (02 October 2024), Monzo (08 July 2025).

**Feasibility (panel view).**
- Data needed: control design attributes.
- Hardest part: design similarity.
- False-positive risk: superficial similarity.
- Disagreement: **L4** strong. **L1** good demo moment. **L2** strong IP. **L3** attributes rarely recorded.

---

### UC-GP-B17 -- Are different committees being shown different figures for the same metric?
*Provenance: B-GP-11 (board, BRC and executive committees each receive different altitudes), A-GP-03 (one lineage, each layer shown its altitude) · flags: [single], [long-tail -- preserve]*

- **Archetype:** Chain break (consistency).
- **Bucket:** B.
- **Signal:** the same metric, same period, appearing with different values or RAG states in different committee papers, or the board paper using a value that differs from the metric store.
- **Cadence / trigger:** at each pack cut-off.
- **Primary user → routed exec:** CRO → BRC chair, company secretary.

**1. Data aggregation (requirement)**
- Substrate inputs: metric store with as-of values.
- Interaction inputs: board, BRC, ERC and specialist committee papers (asset and liability, credit, model risk).

**2. Baseline creation (evidence)**
- Dimensions: metric × period × forum.
- Normal: identical values or a stated reason (different cut-off date).
- Seasonality: none.

**3. Dynamic detection (sufficiency)**
- Cross-domain correlation: value or RAG in paper A ≠ paper B ≠ store, with no stated reason.

**4. Distillation (attestation)**
- Suppressed: differences explained by cut-off.
- Ranking inputs: altitude; RAG difference.
- Attestation: metric owner.

**5. Surfacing and routing (gap / escalation)**
- CRO sees: consistency flag before packs go out.
- Correlation-evidence band: Strong.
- Recommended action: propose alignment.
- Draft artifact: correction note.
- Human gate and audit: owner decides.
- Hero element: **pack consistency check**.

**Why it is impossible without the join.** Papers are narrative documents; only a join with the store finds the inconsistency.

**Why it beats a self-built dashboard.** Packs are assembled from spreadsheets.

**Differentiation:** requires the join -- does not exist today.

**Worked example.** Illustrative `[illustrative]`: the ERC paper shows "LCR internal headroom 34% amber"; the BRC paper shows "38% green" from an earlier cut-off with no date stated.

**Regulatory / governance hook.** B-GP-11 layered escalation (`[practice-not-rule]`); Nationwide committee structure (20 May 2026).

**Feasibility (panel view).**
- Data needed: papers in machine-readable form.
- Hardest part: table extraction from papers.
- False-positive risk: cut-off differences.
- Disagreement: **L1** very high. **L2** fits. **L3** feasible with structured packs. **L4** neutral.

---
# Panel Notes

## The sharpest disagreements (stated, not averaged)

1. **Whether "unserved" is a defensible claim (affects UC-GP-A1, A2, B4 and the whole positioning).** GP's own panel splits here, and this run reproduces the split. L1 (NED) and the first-line half of L3 see strategy-to-control lineage, growth capacity, metric-tension detection and the early-warning graph as clear gaps in what boards are given. L2 (CRO) cautions that large banks may already approximate them through bespoke data warehouses and committee packs, and GP's competitor evidence is thin: ServiceNow IRM is the only incumbent with official sources; MetricStream and SAI360 are `[single]`; Archer, Workiva and IBM OpenPages are `[unverified]`. L4 adds that the tension-detection claim rests on absence of evidence (G-GP-05). The safe claim is GP's: "poorly integrated and operationally expensive in many firms", not "nobody can do this".

2. **How much a board should see of what is below it (affects UC-GP-A2, A9, A10, B1, B17).** L1 wants the board page sparse: strategy, appetite and exceptions, with counts rather than lists. L2 and L3 want drill-through to controls, owners and evidence. GP resolves it as "one click down rather than one level up" (A-GP-03) and "the board page should be sparse; the evidence graph beneath it should be exhaustive" (Synthesis). The remaining disagreement is about ambers. L1 accepts GP's point that a board can need an amber that threatens strategy (B-GP-11). L2 worries that the escalation-health index (UC-GP-B1) will drag ERC-level ambers onto the board page. Unresolved: the materiality rule that decides which ambers rise.

3. **Reading minutes, speak-up and attestation text (affects all of Bucket B, especially B1, B2, B3, B5 and B8).** L1 regards the narrative join as the most valuable and most uncomfortable thing the product could show a BRC chair. L4 warns that minutes are a legal record and that awareness-date reconstruction (UC-GP-B3) creates a disclosable record. L4 also says whistleblowing material must stay aggregated and anonymised, and that small business areas in tier 3 firms break anonymity. L2 insists every narrative finding is framed as protection for the SMF (reasonable steps), not as surveillance. L3 notes that minute quality varies so much that "noted" may hide a real discussion. Also, GP's source cites no enforcement case in which minutes omitted an issue; its only narrative-side anchor is Metro's junior staff concerns (H-GP-03). The minutes mechanism is therefore product design and must be presented that way.

4. **Agentic AI as an entry point (affects UC-GP-A14 and B15).** GP's panel verdict is "yes, but narrowed": govern human and AI-initiated payments, prove who or what was authorised, and test mandate adherence. L1 sees strategic interest but no present board pain, given 2% broad autonomy and at most 9% planning payment execution within 12 months (I-GP-02). L3 says agent tagging and mandate stores barely exist in bank data. L4 warns against leading with agentic financial crime before UK consent and liability rules settle (I-GP-06), and rejects the "30 minutes to under 20 seconds" claim as unsupported (K-GP-07). L2 accepts it as a natural extension of the chain if agent actions are treated as delegated human actions with an accountable owner. Resolution for the demo: an emerging-risk row, not a hero beat.

## Five strongest UI candidates (from this source)

1. **Restriction adherence test** (UC-GP-A3, with B16 read-across): population, test, result and denominator. "Not tested" replaces green. GP's anchor is the most quantified in its file (Starling: more than 54,000 accounts for about 49,000 high-risk customers despite the VREQ; Monzo: more than 34,000). This maps directly to demo beat 3.
2. **Chain-integrity badge with the feed check and "concerns open" marker** (UC-GP-A4, with B2 and B9): integrity overrides status, so a green metric on an unreconciled feed reads "unverified". It carries the Metro anchor (more than 60m transactions, £51bn) and maps directly to demo beat 2.
3. **Strategy strip with the growth-versus-capacity paired gauge** (UC-GP-A1 and A5): headroom with a denominator, a binding constraint and a binding date, next to financial crime control capacity on the same time axis. It carries the Starling and Monzo growth anchors (43,000 to 3.6m; 600,000 to 5.8m+) and maps directly to demo beat 1.
4. **Tension register and guardrail pair, with floor check** (UC-GP-B4): the trade-off bounds as the board agreed them, the current position and the review date. Any "trade-off" that is really a regulatory floor is rejected. This is GP's named under-served differentiator (G-GP-05).
5. **Reportability decision ledger (multi-clock) with "days from first mention"** (UC-GP-A8 and B3): one parent event with child routes (SUP 15.3, FR7, SUP 15.11, REP008, SAR, and the 18 March 2027 regime), each with its own clock, owner and status. AI prepares the case and a named SMF decides.

Runners-up: the leading-indicator tree with warning lead time (A2); the escalation-health index (B1); the assertion-to-evidence check on the Consumer Duty board report (B7).

## Recall note -- GP's distinct gems to preserve at the merge

- **Leading-indicator lead time as a calibration test** (A-GP-04, UC-GP-A2). GP explicitly rejects arbitrary amber widening in favour of lead time, volatility, control response time and the statistical relationship between tiers. Threshold configuration should hold response time, escalation action, owner and the upstream metric affected.
- **Unused capacity as a board question** (A-GP-06; CRO interview question 3). Being well inside appetite may mean leaving profitable growth on the table. `[long-tail -- preserve]` as a framing that turns the headroom gauge both ways.
- **Notifications as one-to-many children of an incident** (C-GP-04). REP008 annual reporting sits alongside the SUP 15.11 SMF clock and SUP 15.3 "immediately". SAR suspicion logic is kept separate from materiality (C-GP-05). The FR7 test "would the PRA reasonably expect notice?" is its own question (C-GP-02). Over-reporting is a governance cost, not an offence (C-GP-06).
- **Decision record contents** (C-GP-06, C-GP-07): facts known at the time, rule basis, materiality analysis, counterargument, decision-maker, time, regulator contact, read-across population, and subsequent facts that could reopen the decision. Decisions are reversible.
- **Trade-off decision record contents** (G-GP-04): conflicting objectives, metrics, quantified downside and upside, the non-tradeable regulatory floor, owner, forum, expiry or review date, and monitoring plan. Also GP's four-way pairing of growth, risk, friction and capacity metrics (G-GP-03), and the "efficient frontier" framing.
- **Owner, challenger and assurer on every metric** (E-GP-02, E-GP-03). Internal audit must not own a metric it audits. There are separate risk, control, data and action owner fields (D-GP-05). SMCR mappings are versioned regulatory metadata (D-GP-04).
- **Horizontal journey ownership with conflict detection** (D-GP-06, UC-GP-B6). The chain runs product rule → technology parameter → operations → complaints → compliance.
- **Culture signals need human interpretation** (F-GP-03, UC-GP-B8). Rising speak-up volume is ambiguous. `[long-tail -- preserve]`.
- **Metro £10.0m disclosure fine (12 December 2022)** as a precedent for an open challenge on a published figure (H-GP-04, UC-GP-B10). It is distinct from the Metro £16.68m financial crime case. `[long-tail -- preserve]`.
- **Barclays c.£42m (16 July 2025, WealthTek and Stunt & Co)** as a precedent for high-risk acceptance not being challenged (H-GP-08, UC-GP-B13). `[long-tail -- preserve]`.
- **Sanctions-list coverage as a zero-tolerance proxy** (H-GP-01 Starling detail, UC-GP-A6). `[long-tail -- preserve]`.
- **APP reimbursement split by sender and receiver** (I-GP-05, UC-GP-A15). Anchors: £85,000 cap; excess up to £100, not for vulnerable customers; five business days; 88% (£316 million) reimbursed in the first 18 months. `[long-tail -- preserve]`.
- **Agent mandate as machine-readable constraints** (amount, merchant, purpose, frequency, duration) and GP's eight accountability questions for an agent action (I-GP-06, Synthesis; UC-GP-A14, B15). JPMorgan's restriction is "not just any outside agent". Citi's agentic-commerce paper contradicts the broad prohibition claim (I-GP-07, I-GP-08, `[conflict]`). `[long-tail -- preserve]`.
- **Regulatory horizon as chain objects**, covering the 18 March 2027 incident and third-party regime and PRA CP14/26 Phase 2 (consultation closes 22 January 2027; 43% fewer PRA pre-approvals; about 7,700 people removed from PRA certification) (C-GP-03, D-GP-04, UC-GP-A13). `[long-tail -- preserve]`.
- **Claims verdicts for the merge's verify list** (K-GP-01 to K-GP-07):
  - no 10–12 metric cap;
  - no six-monthly SMF certification;
  - the 25% building society share needs a denominator (29% mortgages, 23% savings, about 46% Cash ISAs; 43 societies);
  - the JPMorgan and Citi claim is only partly supported;
  - the 12–18 month rebuild claim is unverifiable;
  - the 30-minute-to-20-second latency claim is not supported.
- **Sourcing caveats to carry forward.** GP cites model risk guidance as "PS6/23 (17 May 2023)" alongside SS1/23. Many GP citations are internal tokens (for example `turn9search0`, `turn14view3`) with no traceable URL. Enforcement facts for HSBC, NatWest, Santander and Barclays carry dates but no URLs in GP's table. Firm counts for Principality, Starling and Monzo are `[unverified]` in GP (B-GP-07 to B-GP-09).
