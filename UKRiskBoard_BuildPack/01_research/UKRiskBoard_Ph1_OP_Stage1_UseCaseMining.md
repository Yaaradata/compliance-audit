OP

# UK Risk Board View -- Stage 1 Per-Source Use-Case Mining -- Engine OP (Claude)

**Run:** Yaara Risk & Compliance, UK Board Risk View · primary persona CRO (SMF4) at board altitude · intent: sales demo · governance: compliance plus executive · engines run: GP, OP, GM (PX not run, by user decision).
**Source mined:** OP Stage 0 report only (`source_OP_stage0.md`, finding IDs A-OP-01 to K, plus Synthesis). No other engine report and no merged corpus was read.
**Date:** 27 October 2026.
**Pipeline adaptation (assurance product):** 1 Data aggregation (requirement) → 2 Baseline creation (evidence) → 3 Dynamic detection (sufficiency) → 4 Distillation (attestation) → 5 Surfacing and routing (gap / escalation).
**Panel lenses:** (L1) UK board NED / BRC chair -- buyer resonance; (L2) CRO and second-line framework designer -- product IP and platform fit; (L3) first-line business risk owner plus data and AI architect -- feasibility and runnability; (L4) UK regulatory and enforcement adviser -- compliance and defensibility.
**Flags used:** `[illustrative]` invented figure · `[single]` one source item only · `[long-tail -- preserve]` thin but kept · `[NEW -- beyond file]` not in the OP source · `[practice-not-rule]` firm practice, not regulation · `[unverified]` / `[conflict]` / `[inference]` / `[marketing-grade]` carried from the source.
**Product boundary on every card:** AI drafts and challenges; it never decides reportability, never files or notifies, never re-tunes a threshold or model. Every action has a named human gate and an audit-log entry. Joins are framed at cohort level. Practice is labelled as practice. No cost or ROI trade-off is made against financial crime floors.

---

## Framing

The OP report reads as an enforcement-led case for the board layer. Its central claim is that in every recent UK deposit-taker Final Notice it examined (Starling 27 September 2024, Monzo 07 July 2025, Metro November 2024, Nationwide 12 December 2025, plus Metro PRA 21 December 2021, TSB 20 December 2022, Santander 09 December 2022 and Barclays 16 July 2025), the failure sat above the control layer: growth outran control capacity, MI was inconsistent across forums, ownership was unclear, and nobody tested whether restrictions were being obeyed. The report is unusually disciplined about separating rule from practice. It debunks "10–12 RAS metrics", "six-monthly SMF certification to the regulator" and "building societies are about 25% of the market". It also grounds the reportability clock in SUP 15.3's "reasonably suggests" wording, with Starling's 34-day gap between finding and notifying a VREQ breach (21 July to 24 August 2022) as the anchor. I therefore mined it mainly for **chain-break and restriction shapes** on the substrate side, giving 18 Bucket A cards. The interaction-side joins (14 Bucket B cards) are built on the report's few but sharp narrative anchors:
- Starling's "different committees receiving different information";
- Metro's 2017–2018 staff flags that were not fixed until 2019–2020;
- the "bad news travel time" culture indicator;
- the Consumer Duty finding that firms "presented extensive data without sufficiently explaining" it;
- the Nationwide penalty aggravated by "numerous published FCA notices".

The report is deliberately sceptical about agentic-AI financial crime and calls it a 2027–2028 second module. I have kept those items as `[long-tail -- preserve]` cards rather than dropping them. The read tool flagged the report as `truncated`, but the saved text runs complete through the Synthesis and Caveats sections, with no visible gap.

---

## Bucket A -- Pipeline use cases that beat a self-built dashboard

### UC-OP-A1 -- How much appetite is each growth initiative consuming, and when does it hit amber?

- **Archetype:** Position (headroom and trajectory), with a chain-break sub-check (an initiative that has no RAS link).
- **Bucket:** A (substrate side).
- **Signal:** A strategic initiative's plan run-rate projects a Level 1 metric past amber before the plan year ends, or an initiative is consuming appetite without a linked RAS line.
- **Cadence / trigger:** Quarterly BRC and board; annual RAS refresh with planning and ICAAP; event-driven when the plan is re-forecast.
- **Primary user → routed exec:** CRO (SMF4) → board and BRC chair; CEO and ExCo; CFO (SMF2).

**1. Data aggregation (requirement)**
- *Substrate inputs:*
  - strategy objects from the annual plan, such as initiatives, product launches and lending targets (Nationwide's "new business banking and cards"; Metro's strategic pillars mapped to principal risks, A-OP-07);
  - the RAS lines linked to each initiative (FSB: the RAS "should be linked to the firm's short- and long-term strategic, capital and financial plans", A-OP-01);
  - capacity, appetite (red), trigger (amber) and operating limit for each affected Level 1 metric (A-OP-03);
  - plan volumes by quarter from the financial plan;
  - actual flow from lending and deposit MI;
  - stress-test outputs for capacity (Nationwide: principal risks "explored fully within the annual financial planning and stress testing framework").
- *Interaction inputs:* none required. The plan paper and the board minute approving it are attached as provenance only.

**2. Baseline creation (evidence)**
- *Dimensions:* initiative × principal risk × Level 1 metric × legal entity × product × quarter.
- *What "normal" is:* the plan-implied consumption path for each initiative, built by converting plan volumes into the metric (for example, planned high-LTV completions ÷ projected book). The metric's own trailing 8-quarter volatility sets the tolerance around that path.
- *Seasonality:* lending metrics carry a seasonal profile from prior-year completions, stored in the calibration record rather than hidden in a wider amber band. Seasonal patterns are taken from the firm's own history `[NEW -- beyond file]`.

**3. Dynamic detection (sufficiency)**
The condition is met when any of the following holds:
- a rule-based least-squares projection over the actual run-rate plus the remaining plan crosses amber before the plan end date (labelled "early warning, not a prediction");
- actual consumption exceeds the plan path by more than one standard deviation for two consecutive months;
- an initiative in the plan has no RAS link (a chain break in the cascade graph);
- a RAS line has headroom but its stress-test capacity has not been refreshed since the last plan.

**4. Distillation (attestation)**
- *Suppressed:* initiatives whose projection stays below a firm-set share of appetite (default 70% `[illustrative]`) and whose plan has not changed.
- *Ranking inputs:* months to amber, plan materiality (£ volume), and whether the initiative is in a board-approved strategic pillar.
- *Attestation:* the CFO attests the plan figures, the first-line risk owner attests the actuals, the second line challenges the conversion assumptions, and the CRO signs the headroom narrative.

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* the strategy strip, with each initiative's appetite consumed (set vs actual vs forecast, always with its denominator) and months to amber.
- *Recommended action:* the CRO proposes one of three options for board decision: hold appetite and re-phase the plan; request a capacity increase backed by capital evidence; or link the orphan initiative to a RAS line.
- *Draft artifact:* the "Headroom against strategy" section of the BRC paper.
- *Human gate:* the CRO proposes, the BRC recommends and the board decides. The decision and rationale are logged against the RAS line.
- **Hero element:** strategy strip with headroom gauge.

**Why it beats a self-built dashboard:** The bank's own MI shows each metric against its limit. It does not hold the many-to-many links from initiative to RAS line to metric, and so cannot project a plan path against nested thresholds. The plan sits in the CFO's spreadsheet and the limits sit in GRC. Only a product that owns the cascade graph can show "this initiative uses 2.6 percentage points of the remaining headroom".

**Differentiation:** Substrate-visible. It needs the cascade graph, which the product owns and incumbent GRC tools hold only partially (J-OP-05: strategy link "Limited" or "Partial" across ServiceNow, Archer, MetricStream and IBM OpenPages `[unverified]`).

**Worked example:**
- *Real anchor:* Coventry grew lending 43% to £9.6bn in 2025, at an average LTV of 67%, with 0.38% of loans three or more months in arrears (A-OP-08).
- *Illustrative case:* a tier 2 society with a £22.4bn mortgage book plans £3.2bn of gross lending, with 25% of it above 85% LTV `[illustrative]`.
  - The board appetite for the high-LTV share of the book is 12.0% (red), with amber at 10.5%. The current share is 9.4% `[illustrative]`.
  - On plan, the projection crosses 10.5% in month 8 of the plan year. Headroom is 2.6 percentage points of a 12.0 point appetite.
  - A second initiative, a business current account launch, appears in the plan with no linked RAS line and no financial crime metric. The strip shows it with a chain-break marker.
- *Card title:* "Will the high-LTV growth plan breach amber before year end?" Answer: yes, in month 8 on the current plan.

**Regulatory / governance hook:**
- FSB, *Principles for an Effective Risk Appetite Framework*, 18 November 2013: the RAS must be linked to strategic, capital and financial plans (A-OP-01).
- Nationwide ARA 2025 practice of testing principal risks through planning and stress testing (A-OP-07).
- PRA Fundamental Rules framing for dual-regulated firms (A-OP-11; SS5/16 wording `[unverified]`).
- The amber, red and capacity ordering is `[practice-not-rule]` (A-OP-03).

**Feasibility:**
- *L1 (NED):* strongest buyer resonance in the source. It is the "risk as a strategic lever" story.
- *L2 (CRO):* depends on the cascade graph and on a per-initiative conversion rule that the second line must own.
- *L3 (first line / architect):* plan data lives in spreadsheets; a quarterly structured upload is acceptable, and actuals come from existing MI.
- *L4 (regulatory):* the projection must be labelled as an early warning, and practice thresholds must not be presented as rules.
- *Data needed:* plan by initiative, metric definitions, limits, monthly actuals.
- *Hardest part:* attributing a shared metric (such as the book-level high-LTV share) across several initiatives.
- *False-positive risk:* plan re-phasing creates spurious amber projections. Mitigation: re-baseline when the CFO re-attests the plan.
- *Disagreement:* L1 wants a single "headroom used" number per initiative; L2 insists on a range, with the denominator and stress capacity shown. The CFO and CRO also disagree over who owns the initiative-to-RAS mapping. Unresolved; kept for Stage 2.
- **Provenance:** A-OP-01, A-OP-03, A-OP-07, A-OP-08, Synthesis 1 (items 1 and 4), Requirement 2.

---

### UC-OP-A2 -- Which thresholds give false comfort, and did anything go straight from green to red?

- **Archetype:** Chain break (calibration), plus a position check on Level 3 to Level 1 roll-up.
- **Bucket:** A (substrate side).
- **Signal:** An amber band is narrower than the metric's normal volatility (amber fatigue or false comfort); a metric jumped from green to red without passing amber; or a threshold has no stored calibration rationale.
- **Cadence / trigger:** Monthly ERC; annual RAS refresh; event-driven on any green-to-red jump.
- **Primary user → routed exec:** CRO (SMF4) and the second-line framework designer → BRC chair; first-line metric owners.

**1. Data aggregation (requirement)**
- *Substrate inputs:*
  - the full threshold register for every Level 1, 2 and 3 metric: capacity, red, amber, operating limit and the date each was set (A-OP-03, A-OP-05);
  - the calibration rationale, where one exists;
  - KRI time series at native frequency;
  - the stress-test results that set capacity;
  - the remediation-time history from the issue log;
  - the leading/lagging indicator library seeded from A-OP-09 (for example affordability override rate, deposit outflow velocity, alert age, services near impact tolerance).
- *Interaction inputs:* none required.

**2. Baseline creation (evidence)**
- *Per metric:* rolling volatility (standard deviation of period-on-period change over 8 quarters or 26 weeks), the typical lead time from amber to red in past episodes, and the median time to remediate for that risk category.
- *What "normal" is:* an amber band at least as wide as one period's volatility multiplied by the remediation lead time.
- *Practice:* lower-tier metrics should carry wider amber bands so that they warn earlier (A-OP-05, `[practice-not-rule]`).
- *Seasonality:* stored as an explicit seasonal profile in the calibration record, never absorbed by widening amber (methodology edge case "amber fatigue").

**3. Dynamic detection (sufficiency)**
The condition is met when any of the following holds:
- the amber band is narrower than the metric's normal volatility (the source's own implication, A-OP-05);
- a green-to-red transition occurs with no amber period;
- a threshold has no calibration rationale on file;
- amber flips more than a firm-set number of times in a period and every flip is closed as noise;
- a Level 3 breach does not roll up to its Level 1 parent under the declared roll-up rule. The roll-up rule (worst-of, count-of-breaches or weighted) is an open design question that is declared per metric.

**4. Distillation (attestation)**
- *Suppressed:* metrics whose calibration was reviewed within the last RAS cycle and whose bands pass the volatility test.
- *Ranking inputs:* Level (1 before 2 before 3), how far the band falls short of volatility, and whether a real green-to-red jump has occurred.
- *Attestation:* the metric owner attests the rationale, the second line challenges it, and the CRO approves any recalibration proposal. The AI drafts the proposed band and its rationale, marked as AI and advisory.

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* the threshold cascade view for the affected principal risk (capacity → red → amber → operating limit, with the stored rationale), a volatility ribbon, and a marker on any green-to-red jump.
- *Recommended action:* propose recalibration for the owner and second-line review. Material changes are put to the BRC at the annual RAS refresh.
- *Draft artifact:* a calibration change note showing the old band, the proposed band, the evidence and the effect on historical flags.
- *Human gate:* the product never re-tunes a threshold. It proposes; the owner and CRO approve; the change is logged.
- **Hero element:** threshold cascade with calibration rationale.

**Why it beats a self-built dashboard:** A self-built dashboard shows RAG status against whatever band was typed in. It has no record of why the band was set, does not test the band against the metric's behaviour, and cannot spot a green-to-red jump as a calibration failure rather than a risk event. This is the CRO's question 3 from the source ("How did you calibrate amber, and did anything go straight from green to red?").

**Differentiation:** Substrate-visible. It relies on the calibration records, which the product owns.

**Worked example:**
- *Liquidity:* deposit outflow velocity (a leading liquidity indicator from A-OP-09) has a weekly standard deviation of 1.8 percentage points, but its amber band is only 1.0 point wide `[illustrative]`. Over 26 weeks amber fired 11 times and all 11 flips were closed as noise. On the twelfth occasion the metric moved from 0.9 to 3.4, straight from green to red `[illustrative]`.
- *Credit:* the early-arrears roll-rate amber band is 0.05 percentage points wide against a quarterly volatility of 0.12 points `[illustrative]`.
- *Card title:* "Which amber bands are too narrow to warn us?" Answer: two Level 2 liquidity and credit metrics.

**Regulatory / governance hook:**
- No UK rule prescribes how to set amber and red (A-OP-05, `[practice-not-rule]`).
- The FCA's outcomes monitoring review (27 July 2026) praised board reporting "throughout the year… with… defined tolerance levels" (via CMS, `[inference]`).
- FSB RAF principles on limits sitting within appetite (A-OP-01, A-OP-03).

**Feasibility:**
- *L2:* core product IP. It turns the RAF from a static register into a calibrated object.
- *L3:* needs history at native frequency; tier 3 societies may hold only quarterly points, which weakens the volatility estimate.
- *L4:* proposals must be labelled as practice, and any recalibration must be approved by a human and logged.
- *L1:* low direct resonance, but the board understands "we went from green to red with no warning".
- *Data needed:* threshold register, history, issue log.
- *Hardest part:* agreeing a roll-up rule for non-financial Level 3 to Level 1 metrics (worst-of tends to over-escalate; count-of-breaches tends to under-escalate).
- *False-positive risk:* volatile but harmless metrics will fail the volatility test. Mitigation: allow an owner-attested exemption with its rationale.
- *Disagreement:* L3 (first line) fears the product will push for wider bands that "hide" problems; L2 argues that narrower-than-volatility bands train people to ignore amber. Kept open.
- **Provenance:** A-OP-03, A-OP-05, A-OP-09, Synthesis 1 (item 3), Synthesis 5 (question 3), Requirement 1.

---

### UC-OP-A3 -- Is our "zero tolerance" actually measured? Coverage proxies for zero-appetite statements

- **Archetype:** Silent failure / chain break (a zero-tolerance metric with no proxy).
- **Bucket:** A (substrate side).
- **Signal:** A zero-appetite statement reports "0 breaches" while its coverage or completeness proxy is below 100%, or no proxy exists.
- **Cadence / trigger:** Monthly ERC; event-driven when a screening list or configuration changes.
- **Primary user → routed exec:** CRO (SMF4) → SMF17 (Head of Financial Crime); BRC.

**1. Data aggregation (requirement)**
- *Substrate inputs:*
  - every RAS statement expressed as zero or "no appetite" (Coventry: "The Group has no appetite for any breach"; OSB: "very low appetite" for reputational risk, A-OP-04);
  - the metric attached to each statement;
  - for sanctions, the entry count of the current Consolidated List versus the entry count loaded into the screening configuration, and the screening alert volume over time;
  - for other zero statements, the population denominator of what is supposed to be tested.
- *Interaction inputs:* none.

**2. Baseline creation (evidence)**
- *Expected state:* coverage of 100% of the reference population (list entries, customers, transactions in scope).
- *What "normal" is:* the alert rate per 10,000 screened customers or transactions over the trailing 12 months. A sustained fall to zero is itself abnormal.
- *Seasonality:* list updates are event-driven, so the baseline resets on each list change.

**3. Dynamic detection (sufficiency)**
The condition is met when any of the following holds:
- a zero-tolerance statement has no proxy metric (chain break);
- the coverage proxy falls below the firm-set floor (default 100% for sanctions `[illustrative]`);
- the alert output goes anomalously quiet while the population grows (the silent-failure rule);
- the reference list was updated but the configuration count did not change within a firm-set number of days.

**4. Distillation (attestation)**
- *Suppressed:* zero-tolerance statements with proxies at 100% coverage and normal alert rates.
- *Ranking inputs:* the principal risk (financial crime first), the coverage gap as a percentage of the reference population, and how long the gap has been open.
- *Attestation:* the SMF17 control owner attests to the reconciliation result (list count versus configuration count), not to the bare "0 breaches" figure (D-OP-05 logic).

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* the zero-tolerance metric's status forced to "unverified" rather than green whenever the proxy fails (methodology edge case "green on a broken feed"). Next to it, a denominator tile shows entries screened against entries listed.
- *Recommended action:* propose that SMF17 opens an issue, re-screens the back-book for the gap period, and considers reportability through UC-OP-A9.
- *Draft artifact:* the issue record plus a reportability triage stub.
- *Human gate:* SMF17 accepts or rejects the issue; reportability is decided by a named SMF.
- **Hero element:** ScreeningDenominator (built in v6, not yet wired) inside the chain-integrity badge.

**Why it beats a self-built dashboard:** A dashboard reports "0 sanctions breaches" in green. It cannot tell that the zero comes from screening against a fraction of the list. The source's CRO panel view is explicit: a "zero breaches" statement alone would not have caught Starling's gap. The product enforces a proxy rule for every zero statement as part of the method.

**Differentiation:** Substrate-visible. It requires the product's rule that every zero statement carries a measurable proxy (Requirement 3).

**Worked example:**
- *Real anchor:* from 2017 to January 2023, Starling's sanctions screening covered only "a fraction of the names on the Consolidated List" (A-OP-04, H-OP-01). The board saw no breaches.
- *Illustrative case:* the screening configuration holds 1,240 of 4,100 list entries (30.2% coverage) `[illustrative]`. Sanctions alerts fell from 14 a month to 0 for six months while the customer base grew 22% `[illustrative]`.
- *Result:* the board card reads "Zero sanctions breaches: unverified. Screening covers 1,240 of 4,100 list entries (30%)."

**Regulatory / governance hook:**
- FCA Final Notice, Starling Bank Limited, 27 September 2024 (£28,959,426): partial sanctions list since 2017 (H-OP-01).
- The FCA cited JMLSG guidance and published notices as aggravating factors in Nationwide (H-OP-09).
- Coventry's zero statement is cited as `[practice-not-rule]`.

**Feasibility:**
- *L4:* the highest defensibility value of any card in the source, because it is exactly the Starling failure shape.
- *L3:* list and configuration counts are easy to obtain from the screening vendor's administration export; alert-rate history is available.
- *L1:* a strong "would we have caught it?" demonstration moment.
- *L2:* the proxy rule should be generalised to every zero statement, not only sanctions.
- *Data needed:* list snapshots, configuration export, alert counts, customer counts.
- *Hardest part:* defining proxies for qualitative zero statements (for example "no appetite for reputational harm").
- *False-positive risk:* deliberate risk-based list subsets (for example a fuzzy-match configuration that excludes some list types) show as coverage gaps. Mitigation: record the excluded segments with a rationale that the owner attests.
- *Disagreement:* L3 says some vendors do not expose configuration counts; L4 says the inability to evidence coverage is itself the finding. Kept.
- **Provenance:** A-OP-04, H-OP-01, Requirement 3. `[single]` for the proxy rule as an explicit panel view.

---

### UC-OP-A4 -- Are our regulatory restrictions actually obeyed across the whole population?

- **Archetype:** Breach (restriction population test), with a reportability hand-off.
- **Bucket:** A (substrate side).
- **Signal:** A daily population test finds accounts or customers that a VREQ or s166 clause prohibits, even though the onboarding flag reports no exceptions.
- **Cadence / trigger:** Daily test; monthly ERC; quarterly board; event-driven on any failure.
- **Primary user → routed exec:** CRO (SMF4) → SMF17 and SMF16; the board.

**1. Data aggregation (requirement)**
- *Substrate inputs:*
  - the VREQ and s166 register, with each clause decomposed into an executable population rule (for example "no new accounts for customers rated high-risk");
  - new account and customer tables with risk ratings at the time of opening;
  - exit lists;
  - onboarding decision logs;
  - the restriction owner from the SoR.
- *Interaction inputs:* none for the test itself. Clause wording is taken from the restriction text.

**2. Baseline creation (evidence)**
- *Expected state:* zero prohibited outcomes across the full population.
- *Track record:* the rate of rule-flag firings, kept separately, so that "flag fired" and "population outcome" can be compared.
- *Seasonality:* none. The test is absolute.

**3. Dynamic detection (sufficiency)**
The condition is met when any of the following holds:
- the population test returns one or more accounts that breach a clause;
- a clause has no executable test (chain break, restriction check);
- the test has not run within its required cadence;
- the onboarding flag reports zero exceptions while the population test reports more than zero. This is the methodology's hard fail "restriction adherence measured by flag fired rather than population outcome".

**4. Distillation (attestation)**
- *Suppressed:* nothing on a failure. Restriction breaches cannot be suppressed at board altitude. Passing tests collapse into a single "n clauses tested, n passed" line.
- *Ranking inputs:* clause materiality and the count of breaching accounts.
- *Attestation:* SMF17 attests the test design; the second line independently re-runs a sample; internal audit assures the method without owning it.

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* the restriction adherence test showing, for each clause, the population tested, the breaches found and the last run. The flag-versus-population divergence is shown side by side.
- *Recommended action:* prepare a remediation plan (freeze or exit the breaching accounts under human review), propose read-across to sister clauses, and open a reportability case through UC-OP-A9.
- *Draft artifact:* the breach case pack.
- *Human gate:* SMF17 approves the remediation; a named SMF decides reportability. The AI never notifies.
- **Hero element:** restriction adherence test.

**Why it beats a self-built dashboard:** Banks report restriction compliance by asking whether the onboarding rule fired. Starling had no "formal monitoring programme" for its VREQ (G-OP-01). A population test that runs independently of the control it checks is what catches the gap, and a GRC tool stores the VREQ as a document, not as an executable test.

**Differentiation:** Substrate-visible. The product owns the clause-to-test decomposition and the adherence record.

**Worked example:**
- *Real anchors:*
  - Starling's VREQ was imposed on 17 September 2021. Starling then opened 54,359 accounts for 49,183 high-risk customers in breach of it. After the "lessons learned" review, the second line found 309 more breaching accounts (G-OP-01, C-OP-08).
  - Monzo was under a VREQ from August 2020 to February 2025, with breaching account counts in `[conflict]` (34,000+ versus 26,325) (H-OP-02).
- *Illustrative case:* 412,000 accounts were opened in the quarter `[illustrative]`. The onboarding rule shows zero exceptions. The daily population test, joining new accounts to the risk-rating table at the time of opening, finds 37 accounts opened for customers rated high-risk `[illustrative]`. All 37 came through a partner channel added after the rule was configured.
- *Result:* the card reads "VREQ clause 1: 37 breaching accounts of 412,000 opened. Onboarding flag shows 0."

**Regulatory / governance hook:**
- FCA Final Notice, Starling, 27 September 2024 (VREQ breaches; no single SMF owner; inconsistent MI).
- FCA, Monzo, 07 July 2025 (£21,091,300).
- Escalation ladder: supervisory letter → s166 → VREQ → enforcement (C-OP-08).
- SUP 15.3 notification on discovery (C-OP-01).

**Feasibility:**
- *L1 and L4:* this is the source's anchor enforcement failure and the third proposed demo hero beat.
- *L3:* turning clause wording into a SQL-style population rule requires a person; the AI can draft it, but SMF17 must approve.
- *L2:* the test must be independent of the control's own logic, or it simply repeats the flag.
- *Data needed:* account and customer tables, ratings at the time of opening, the restriction register.
- *Hardest part:* point-in-time risk ratings, because ratings are often overwritten.
- *False-positive risk:* customers re-rated after opening appear as breaches. Mitigation: always test against the rating at the time of opening.
- *Disagreement:* L3 notes that many tier 3 firms have no live VREQ, so demand is narrower; L1 says one Final Notice makes it a board question everywhere. Kept.
- **Provenance:** G-OP-01, H-OP-01, H-OP-02, C-OP-08, Synthesis 1 (item 7), Synthesis 4 (better wedge).

---

### UC-OP-A5 -- Where is growth outrunning control capacity?

- **Archetype:** Position and trajectory (growth-normalised capacity ratio), escalating to a breach.
- **Bucket:** A (substrate side).
- **Signal:** Customer or transaction growth outpaces financial crime and operations control capacity, so per-unit capacity ratios deteriorate toward threshold.
- **Cadence / trigger:** Monthly ERC; quarterly board; event-driven on a growth campaign or acquisition.
- **Primary user → routed exec:** CRO (SMF4) → CEO and ExCo; board; SMF17; COO.

**1. Data aggregation (requirement)**
- *Substrate inputs:*
  - customer count, new accounts and transaction volume (growth denominators);
  - capacity inputs: financial crime analyst FTE, alert volume, alert age, KYC refresh backlog, EDD case queue, screening coverage and restricted onboarding exceptions (A-OP-09 financial crime leading indicators);
  - the plan's growth targets from UC-OP-A1.
- *Interaction inputs:* none.

**2. Baseline creation (evidence)**
- *Ratios:* alerts per analyst FTE, KYC refresh backlog per 10,000 customers, and median alert age, each tracked over the trailing 8 quarters.
- *What "normal" is:* the ratio band in which backlogs did not grow.
- *Seasonality:* campaign-driven onboarding spikes are tagged to the campaign so they do not move the baseline.

**3. Dynamic detection (sufficiency)**
The condition is met when any of the following holds:
- growth rate minus capacity growth rate stays above a firm-set gap for two periods;
- a capacity ratio's least-squares trajectory crosses amber within the next quarter;
- backlog grows while alert volume per FTE also grows (the capacity, not the risk, is the cause);
- the plan in UC-OP-A1 adds growth that has no matching capacity line.

**4. Distillation (attestation)**
- *Suppressed:* ratio moves inside volatility, and spikes tagged to a campaign that clear within the firm's SLA.
- *Ranking inputs:* projected months to amber and the principal risk affected (financial crime first).
- *Attestation:* SMF17 attests the capacity figures, the COO attests the FTE data, and the CRO owns the ratio definitions.

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* a paired view of growth against capacity, showing the gap and its trajectory, with the capacity ratio added as a Level 1 indicator as the source recommends (E-OP-03).
- *Recommended action:* the CRO proposes either adding capacity before the next growth tranche or throttling growth. Lowering the control standard is never offered as an option (no cost or ROI trade-off against financial crime floors).
- *Draft artifact:* a board paper paragraph and a capacity request.
- *Human gate:* the CEO and the board decide.
- **Hero element:** CadenceFeasibility (v6, not yet wired) paired with the strategy strip's growth line, which forms the first proposed demo beat.

**Why it beats a self-built dashboard:** Banks track growth in commercial MI and backlogs in operations MI. No one divides one by the other and holds the result against appetite. The FCA's own language, "did not keep pace with its growth", describes a ratio that firms did not compute.

**Differentiation:** Substrate-visible (a cross-system ratio). It is listed in the source as an apparently unserved differentiator (Synthesis 2).

**Worked example:**
- *Real anchors:*
  - Starling grew "from approximately 43,000 customers in 2017 to 3.6 million in 2023" while "measures to tackle financial crime did not keep pace with its growth" (FCA press release, 02 October 2024). The fine would have been £40,959,426 before the 30% discount.
  - Monzo grew from about 600,000 (2018) to over 5.8m (2022) (E-OP-03).
- *Illustrative case:* a challenger grows customers 38% in 12 months while financial crime analyst FTE rises 6% `[illustrative]`. Median alert age rises from 4 to 19 days, and the KYC refresh backlog per 10,000 customers goes from 14 to 41 `[illustrative]`. The trajectory reaches the red threshold of 30 days' median alert age in 4 months `[illustrative]`.
- *Result:* the card reads "Growth 38%, financial crime capacity 6%: alert age at red in 4 months."

**Regulatory / governance hook:**
- FCA challenger bank review, 22 April 2022: controls must be "commensurate with a bank's expansion" (E-OP-03).
- FCA Final Notices on Starling (27 September 2024) and Monzo (07 July 2025).
- FCA Principle 3 and SYSC for solo-regulated firms (A-OP-10).

**Feasibility:**
- *L1:* very high resonance with challenger boards. It is the first proposed demo beat ("room to grow in credit, but financial crime capacity is not keeping pace").
- *L3:* FTE and backlog data are usually available but sit in different systems.
- *L2:* ratio definitions must be configurable by firm.
- *L4:* the product must never suggest that a lower financial crime standard would allow more growth.
- *Data needed:* customer counts, FTE, queue and backlog data.
- *Hardest part:* normalising for automation gains, since FTE alone understates capacity when tooling improves.
- *False-positive risk:* a one-off migration batch inflates the backlog. Mitigation: tag the event.
- *Disagreement:* L3 says FTE-based ratios penalise firms that automate; L2 wants an effective-capacity measure. Unresolved.
- **Provenance:** E-OP-03, A-OP-09, H-OP-01, H-OP-02, Synthesis 2, Synthesis 4.

---

### UC-OP-A6 -- Can I defend this figure? Silent feed failure and reconciliation-based attestation

- **Archetype:** Silent failure / chain break (feed), which overrides status.
- **Bucket:** A (substrate side).
- **Signal:** The source-to-target reconciliation for a feed behind a board metric shows a gap, has gone stale, or has not been attested, while the metric itself shows green.
- **Cadence / trigger:** Daily reconciliation; monthly attestation; status is overridden immediately at board altitude.
- **Primary user → routed exec:** CRO (SMF4) → COO and CTO; SMF17; CFO for regulatory returns.

**1. Data aggregation (requirement)**
- *Substrate inputs:*
  - the lineage map from each board metric to its feeds;
  - daily source and target record counts and values (for example core banking postings versus records ingested by the transaction monitoring engine);
  - return reconciliation exceptions (such as COREP risk-weight checks);
  - the feed owner from the SoR;
  - attestation records.
- *Interaction inputs:* none, although attestation commentary is used in UC-OP-B4.

**2. Baseline creation (evidence)**
- *Expected state:* a target/source ratio of 100% ± a tolerance set per feed. The historical ratio band sets "normal".
- *Seasonality:* month-end and batch-cycle effects are stored in the feed calibration.

**3. Dynamic detection (sufficiency)**
The condition is met when any of the following holds:
- the ratio falls outside tolerance;
- the gap is concentrated in a new product code, channel or migrated source;
- the reconciliation has not run within its cadence;
- the owner has not attested the latest result (D-OP-05: "attest to a specific reconciliation result");
- the downstream alert rate drops while source volume holds (silent failure).

**4. Distillation (attestation)**
- *Suppressed:* gaps inside tolerance that close within a day.
- *Ranking inputs:* the number of board metrics depending on the feed, the gap size (count and value), and the age of the gap.
- *Attestation:* the feed owner attests to the reconciliation result; the second line samples; segregation of duties applies (an owner cannot attest a test of their own control).

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* every dependent board metric shows "unverified" in place of green. The chain-integrity badge shows feed ✗, the last reconciliation date and the gap size.
- *Recommended action:* propose that the CRO withholds or caveats the figure in the pack, opens an issue with the COO/CTO, and triggers a read-across to feeds of the same design (UC-OP-A10).
- *Draft artifact:* the figure caveat text and the issue record.
- *Human gate:* the CRO decides whether to present the figure.
- **Hero element:** chain-integrity badge (feed), the second proposed demo beat.

**Why it beats a self-built dashboard:** A dashboard displays the value it receives. It has no idea that a fraction of the population never arrived. Metro lacked checks "on an ongoing basis, that data was being correctly processed" (D-OP-05). A board figure that turns itself to "unverified" when its feed breaks is the product's honesty line.

**Differentiation:** Substrate-visible. It relies on the product's lineage and attestation records.

**Worked example:**
- *Real anchors:*
  - Metro (FCA, November 2024, £16,675,200): a data feed missed more than 60m transactions (£51bn) from 2016 to 2020. Staff flagged the gaps in 2017 and 2018, but they were not fixed until 2019–2020 (H-OP-03, D-OP-04).
  - Metro (PRA, 21 December 2021, £5,376,000): wrong COREP risk weights (H-OP-05).
  - Starling added "daily testing and assurance activity" from 17 January 2023 (D-OP-05).
- *Illustrative case:* core banking posts 18.4m transactions in the month; transaction monitoring ingests 17.3m. The 6.0% gap is concentrated in one product code added in a platform migration `[illustrative]`. The board's "transaction monitoring alerts within appetite" metric flips from green to "unverified: 1.1m of 18.4m transactions not monitored (6.0%)".

**Regulatory / governance hook:**
- FCA Final Notice, Metro, November 2024.
- PRA FR2 and FR6 enforcement against Metro, 21 December 2021 (A-OP-11).
- Requirement 6 (feed reconciliations with evidence-based attestation).
- Monthly data attestation is `[practice-not-rule]` (D-OP-05).

**Feasibility:**
- *L3:* the source and target counts exist in most data platforms, but lineage from a board metric to its feeds is the hard build.
- *L1:* the "wall of green" turns honest.
- *L4:* strong "reasonable steps" evidence.
- *L2:* the integrity-overrides-status rule is core product IP.
- *Data needed:* counts, lineage, owners.
- *Hardest part:* lineage coverage. Most firms cannot map a board KRI to its feeds without a project.
- *False-positive risk:* timing differences between batch cycles. Mitigation: per-feed lag tolerance.
- *Disagreement:* L3 (first line) warns that monthly attestation becomes rubber-stamping; L4 says attestations evidence "reasonable steps" (both panel views in D-OP-05). Kept, and continued in UC-OP-B4.
- **Provenance:** H-OP-03, H-OP-05, D-OP-04, D-OP-05, A-OP-11, Synthesis 1 (item 8), Requirement 6. `[single]` on D-OP-05.

---
### UC-OP-A7 -- Who is accountable for this? SMF and SoR binding, with unowned items in red

- **Archetype:** Chain break (owner).
- **Bucket:** A (substrate side).
- **Signal:** A Level 1 metric, policy, restriction or feed has no accountable SMF in a current SoR, or has more than one SMF claiming partial ownership.
- **Cadence / trigger:** Continuous; event-driven on SoR resubmission, SMF departure or reorganisation; quarterly board.
- **Primary user → routed exec:** CRO (SMF4) → CEO (who owns the MRM); BRC chair; SMF16.

**1. Data aggregation (requirement)**
- *Substrate inputs:*
  - SoRs and the Management Responsibilities Map;
  - the prescribed responsibilities register;
  - the risk owner and control owner registers (D-OP-04 definitions: the risk owner keeps the risk within appetite, the control owner owns design and operation, the performer executes);
  - the product's cascade graph of metrics, policies, VREQs and feeds;
  - HR joiner, mover and leaver events for SMFs.
- *Interaction inputs:* none for detection.

**2. Baseline creation (evidence)**
- *Expected state:* every node in the cascade has exactly one accountable SMF, plus a named risk owner and control owner where applicable.
- *What "normal" is:* 100% binding. The trend of unbound nodes is tracked over time.
- *Seasonality:* none. Spikes follow reorganisations.

**3. Dynamic detection (sufficiency)**
The condition is met when any of the following holds:
- a node has no SMF (chain break, owner);
- a node has more than one SMF with overlapping SoR wording (ambiguity);
- an SMF leaves and their nodes are not reassigned within a firm-set number of days (the 12-week rule flexibility is referenced in the SMCR Phase 1 content, D-OP-02);
- a VREQ has no single named SMF (the Starling shape).

**4. Distillation (attestation)**
- *Suppressed:* Level 3 metrics where the owner is inherited from the Level 2 parent under a declared inheritance rule.
- *Ranking inputs:* Level, whether the node is a restriction, and how long it has been unbound.
- *Attestation:* each SMF attests their mapped nodes on a firm-configured cycle, labelled `[practice-not-rule]`. The source is clear that there is no six-monthly SMF certification to the regulator (D-OP-03).

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* the chain-integrity badge (owner) on every headline, and an ownership coverage line on the board view ("214 of 221 nodes bound; 7 unbound, including 1 VREQ clause" `[illustrative]`).
- *Recommended action:* propose an SoR amendment and draft the wording for the CEO and HR to approve.
- *Draft artifact:* a draft SoR change and MRM update note.
- *Human gate:* the CEO and the SMF approve, and HR or legal resubmit.
- **Hero element:** chain-integrity badge (owner), with Ownership promoted to the top level as earlier advisory feedback asked.

**Why it beats a self-built dashboard:** SMCR tools hold the SoRs; GRC holds the risks. Neither holds the link from a specific board metric or VREQ clause to SoR wording. The source's finding that "no single person with sufficient authority and oversight" owned the VREQ (D-OP-01) is a gap in a join that no single system makes.

**Differentiation:** Substrate-visible. It needs native SMCR binding, which J-OP-05 lists as configurable or absent in incumbents `[unverified]`.

**Worked example:**
- *Real anchors:*
  - At Starling, senior managers "had different understandings of whom… had responsibility for the VREQ" (C-OP-09);
  - its engineers "were not informed of the existence of the VREQ" (D-OP-04).
- *Illustrative case:* the product finds 7 of 221 nodes unbound `[illustrative]`. One is the VREQ clause on high-risk onboarding: SMF17's SoR covers "financial crime systems and controls" and the COO's covers "onboarding operations", so both partly claim it and neither owns it.
- *Result:* the card reads "VREQ clause 1 has no single accountable SMF."

**Regulatory / governance hook:**
- SMCR SoRs, MRM and the Duty of Responsibility ("reasonable steps", FSMA s66A/66B; section numbers `[unverified]`) (D-OP-01).
- FCA PS26/6 and PRA PS12/26 (April 2026), with directory changes from 30 July 2026 (D-OP-02).
- PRA SS28/15 (A-OP-11).

**Feasibility:**
- *L4:* strong. "Reasonable steps" defences depend on clear ownership.
- *L3:* SoRs are free-text, so mapping them to nodes needs AI drafting and human confirmation.
- *L1:* the board relates to "who owns this?" immediately.
- *L2:* the ownership inheritance rule must be declared.
- *Data needed:* SoRs, MRM, owner registers.
- *Hardest part:* SoR wording is deliberately broad, so the mapping is a judgement call.
- *False-positive risk:* broad SoRs look like overlap. Mitigation: a human confirms each mapping once, and only changes are re-tested.
- *Disagreement:* L2 wants one SMF per node; L3 points out that real journeys cross functions (horizontal versus vertical ownership, D-OP-04). See UC-OP-B6.
- **Provenance:** D-OP-01, D-OP-02, D-OP-03, D-OP-04, C-OP-09, Requirement 4, Synthesis 1 (item 6).

---

### UC-OP-A8 -- Did a technology or model change quietly move a control? Parameter-change lineage

- **Archetype:** Chain break (change), with a governed-change check under SS1/23.
- **Bucket:** A (substrate side).
- **Signal:** A change to a rule, parameter, model or feed touching a control behind a board metric was deployed with no approval linked to the risk owner, or with no record of the appetite metric it moves.
- **Cadence / trigger:** Event-driven on each deployment; monthly roll-up to the ERC.
- **Primary user → routed exec:** CRO (SMF4) → CTO and COO; risk owner; model risk (second line).

**1. Data aggregation (requirement)**
- *Substrate inputs:*
  - technology change logs (tickets, deployment records);
  - parameter and rule configuration snapshots for monitoring, screening and onboarding engines;
  - the model inventory with tiering (SS1/23: inventory, tiering, board-set model risk appetite, independent validation, change control, I-OP-09);
  - the control-to-system map from the cascade graph;
  - the restriction register.
- *Interaction inputs:* none for detection.

**2. Baseline creation (evidence)**
- *Expected state:* every change touching a mapped control has a proposer, an approver who is the accountable owner, a validator who is a different person, and a linked appetite metric.
- *What "normal" is:* configuration snapshots compared over time. The control's output rate before and after the change gives the impact baseline.
- *Seasonality:* release cycles.

**3. Dynamic detection (sufficiency)**
The condition is met when any of the following holds:
- a configuration differs between snapshots with no linked change approval;
- a change was approved by someone other than the risk owner;
- proposer, approver and validator are not three different people;
- the control's output rate shifts beyond its volatility within a firm-set window after the change;
- a change touches code that a VREQ clause depends on and the restriction owner was not consulted (the Starling engineers shape).

**4. Distillation (attestation)**
- *Suppressed:* changes that touch no mapped control, and cosmetic changes.
- *Ranking inputs:* model tier, the Level of the affected metric, the restriction dependency and the size of the output shift.
- *Attestation:* the risk owner retrospectively approves or rejects; model risk validates.

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* the chain-integrity badge (change ✗) on the affected metric, with a change-lineage drawer showing the before and after configuration, the output-rate shift and the approval chain.
- *Recommended action:* propose rollback review or retrospective approval, and open read-across on systems that share the same rule.
- *Draft artifact:* a change exception record.
- *Human gate:* the risk owner and CTO decide. The product blocks and logs any AI-initiated re-tune.
- **Hero element:** change-lineage drawer on the chain-integrity badge.

**Why it beats a self-built dashboard:** Change logs live in IT service management tools and control results in GRC. Nobody joins a parameter diff to the appetite metric it moves. The source lists "line of sight over technology changes" as an apparently unserved differentiator, and says the risk owner's line of sight must include "technology changes to parameters, rules and data feeds" (D-OP-04).

**Differentiation:** Substrate-visible. It joins change logs with the cascade graph.

**Worked example:**
- *Real anchors:* Starling's engineers "were not informed of the existence of the VREQ" (D-OP-04). Principality adopted SS1/23 model risk in 2024 (I-OP-09, B-OP-01).
- *Illustrative case:* a transaction monitoring threshold for cash deposits is raised from £5,000 to £9,500 in a release `[illustrative]`. The ticket was approved by the platform engineering lead, not the financial crime risk owner. Cash-deposit alerts fall 71% in the next four weeks `[illustrative]`.
- *Result:* the card reads "TM cash-deposit rule changed on 03 September 2026 without risk-owner approval; alerts down 71%."

**Regulatory / governance hook:**
- PRA SS1/23 (published 17 May 2023, effective 17 May 2024): covers "all types of models… including vendor models, regardless of technology"; retraining or changing parameters is a governed change (I-OP-09).
- The product boundary: never re-tune autonomously.
- A reported April 2026 SS1/23 revision is `[single]`.

**Feasibility:**
- *L3:* configuration snapshots are the hard dependency, as many vendor engines expose no diff API.
- *L2:* fits the methodology's change check exactly.
- *L4:* strong under SS1/23 where it applies; for firms outside its formal scope, adoption is `[practice-not-rule]`.
- *L1:* moderate resonance; the board responds to "a rule was changed and nobody told the risk owner".
- *Data needed:* change tickets, configuration snapshots, inventory.
- *Hardest part:* mapping systems to controls.
- *False-positive risk:* emergency fixes approved after deployment. Mitigation: a retrospective approval window.
- *Disagreement:* L3 wants change monitoring limited to Tier 1 models; L4 says the Starling case was a rule, not a model. Kept.
- **Provenance:** D-OP-04, I-OP-09, B-OP-01 (Principality), Requirement 5, Synthesis 2, Synthesis 4.

---

### UC-OP-A9 -- What may be reportable, on which clock, and who is deciding? Multi-clock reportability triage

- **Archetype:** Reportability case.
- **Bucket:** A (substrate side; UC-OP-B7 is the interaction-side twin).
- **Signal:** A logged event (breach, incident, control failure, restriction breach) engages one or more notification tests, and the awareness-to-decision clock is running.
- **Cadence / trigger:** Event-driven; "immediately" clocks; "days to notify" KRI reported monthly.
- **Primary user → routed exec:** SMF16 (decision owner), with SMF4 or SMF17 depending on the matter → CRO; BRC chair on threshold matters.

**1. Data aggregation (requirement)**
- *Substrate inputs:*
  - the issue, incident and breach log, with timestamps;
  - the rule library versioned by in-force date (C-OP-04: Handbook Notice 139 amended SUP 15.3 and inserted SUP 15.18 and 15.19);
  - the notification tests:
    - SUP 15.3.1R limbs (threshold conditions, significant reputational impact, serious consumer detriment, serious financial consequences);
    - SUP 15.3.11R (significant rule, Principle or COCON breach);
    - SUP 15.6 (false or misleading information);
    - PRA FR7 (wording `[unverified]`);
    - the PS26/2 and PS7/26 incident regime from 18 March 2027;
    - Conduct Rule breach notification on formal disciplinary action (C-OP-06);
    - SAR and DAML to the NCA under POCA 2002 (C-OP-07).
- *Interaction inputs:* none for triage. Escalation notes feed the awareness timestamp in UC-OP-B7.

**2. Baseline creation (evidence)**
- *Expected state:* for each event, a decision recorded against every engaged clock, with awareness, decision and notification timestamps.
- *What "normal" is:* the firm's own days-to-decide distribution. Over-reporting is not penalised (C-OP-08).

**3. Dynamic detection (sufficiency)**
The condition is met when any of the following holds:
- an event matches a notification limb and no decision has been recorded within the firm-set SLA, starting from "reasonably suggests" rather than from the end of an investigation (C-OP-01);
- a decision exists for the FCA but not for the PRA (C-OP-03: record them separately);
- facts change after a "not reportable" decision and no re-test was triggered;
- the days-to-notify KRI exceeds its threshold.

**4. Distillation (attestation)**
- *Suppressed:* events that clearly engage no limb, but only after an SMF has confirmed they are "not engaged", so each is still logged.
- *Ranking inputs:* how many clocks are engaged, time elapsed, and whether the matter is a threshold-condition one.
- *Attestation:* the AI drafts a limb-by-limb assessment, marked as AI. SMF16 decides; dissent is recorded; the record is immutable and exportable (C-OP-09). SAR matters go to a separate, access-restricted workflow (C-OP-07), and the board sees only that a SAR question is open, never the content.

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* the reportability ledger, with one row per case: clocks engaged, awareness time, time elapsed, decision owner, status (deciding, decided-reportable, decided-not-reportable, re-test due) and dissent.
- *Recommended action:* "prepare notification draft for SMF16 decision" (never "notify now").
- *Draft artifact:* a notification draft and a decision record template covering each limb.
- *Human gate:* the named SMF decides and the chair is informed on threshold matters.
- **Hero element:** reportability decision ledger (multi-clock), the third proposed demo beat.

**Why it beats a self-built dashboard:** Firms track breaches in a log and decide reportability in email. No tool applies every clock to one event or keeps a re-testable, immutable decision. The source lists "immutable reportability records" as unserved and grounds the clock in SUP 15.3's "reasonably suggests" wording.

**Differentiation:** Substrate-visible. It relies on the decision log and versioned rule library the product owns.

**Worked example:**
- *Real anchor:* Starling found a VREQ breach on 21 July 2022, fixed it within a day, and told the FCA on 24 August 2022, 34 days later. The FCA recorded its "disappointment that Starling did not immediately report" (C-OP-02).
- *Illustrative case:* the restriction test in UC-OP-A4 fails on 14 October 2026 at 09:12 `[illustrative]`. The ledger opens a case engaging SUP 15.3.1R (serious consumer detriment: no; threshold conditions: possible) and SUP 15.3.11R (yes), FR7 for the PRA (yes), and a SAR question for SMF17, routed to the restricted workflow.
- *Result:* SMF16 records "reportable" at 16:40 the same day with a dissent from the COO. Days to decide: 0. The board card shows "1 case decided reportable; 0 overdue".

**Regulatory / governance hook:**
- FCA Principle 11 and SUP 15.3.1R ("immediately it becomes aware, or has information which reasonably suggests").
- SUP 15.3.11R; SUP 15.6; PRA FR7 (C-OP-01, C-OP-03).
- Handbook Notice 139 (C-OP-04, `[single]`).
- PS26/2 and PS7/26 from 18 March 2027 (C-OP-05).
- C-OP-06 timescales (7 business days for SMFs; annual REP008) are `[unverified]` panel knowledge.

**Feasibility:**
- *L4:* the highest-stakes card. It must never appear to decide, and its limb assessments must be verified against current texts (the caveats list SUP 15.11 timelines, FR7 and SS5/16 as panel knowledge).
- *L2:* the decision record is core product IP.
- *L3:* events must be time-stamped at the moment of awareness, which most logs do not do well.
- *L1:* the board wants to know that nothing is sitting undecided.
- *Data needed:* issue log, rule library.
- *Hardest part:* keeping the rule library current by in-force date.
- *False-positive risk:* over-triage burdens SMF16. Mitigation: a "not engaged" quick decision that is still logged.
- *Disagreement:* L4 wants every event triaged; L3 says that will bury SMF16. Resolved in the source's favour of over-reporting not being penalised, though volume is still a risk.
- **Provenance:** C-OP-01 to C-OP-09, Synthesis 1 (item 9), Requirement 7.

---

### UC-OP-A10 -- When one control breaks, where else is the same design? Issue read-across

- **Archetype:** Chain break propagation (read-across).
- **Bucket:** A (substrate side).
- **Signal:** An issue logged against a control or feed has siblings with the same design, rule, data feed or vendor that have not been reviewed.
- **Cadence / trigger:** Event-driven on each issue logged; the read-across log is reviewed monthly.
- **Primary user → routed exec:** CRO (SMF4) and the second line → first-line control owners; SMF17; COO.

**1. Data aggregation (requirement)**
- *Substrate inputs:*
  - the issue log;
  - the control register with design attributes (rule family, data feed, system, vendor, legal entity);
  - feed lineage;
  - the restriction register;
  - historical screening and monitoring populations.
- *Interaction inputs:* none.

**2. Baseline creation (evidence)**
- *Expected state:* every issue carries a read-across record listing its siblings, each marked reviewed, not affected or affected.
- *What "normal" is:* the time from issue to read-across closure. Firm SLA `[illustrative]`.

**3. Dynamic detection (sufficiency)**
The condition is met when any of the following holds:
- an issue is logged and its siblings (same rule family, same feed or same vendor configuration) have no read-across record within the SLA;
- a sibling is later found affected but was marked "not affected";
- a remediation fix is applied to one control but not to its siblings.

**4. Distillation (attestation)**
- *Suppressed:* siblings already tested since the issue date.
- *Ranking inputs:* the number of siblings, the Level of the metrics they feed, and restriction dependency.
- *Attestation:* each sibling's owner attests "affected" or "not affected" with evidence, and the second line challenges.

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* the read-across prompt on the issue card: "1 issue, 6 siblings, 2 reviewed, 4 open" `[illustrative]`.
- *Recommended action:* propose sibling reviews and a historical look-back period.
- *Draft artifact:* the read-across plan.
- *Human gate:* the second line approves the scope.
- **Hero element:** read-across prompt.

**Why it beats a self-built dashboard:** Issue logs are flat lists. They do not know which other controls share a design or feed. The source's implication is explicit: "propose read-across on controls with the same design or data feed".

**Differentiation:** Substrate-visible. It needs control design attributes in the cascade graph.

**Worked example:**
- *Real anchor:* after Starling's "lessons learned" review, the second line found 309 more breaching accounts, and the firm re-screened its sanctions history back to 2017 (C-OP-08).
- *Illustrative case:* a screening gap found in the retail onboarding configuration has siblings in the business banking configuration and the payments screening configuration, which use the same list load job `[illustrative]`. The read-across finds the same gap in business banking.

**Regulatory / governance hook:**
- The escalation ladder (supervisory letter → s166 → VREQ → enforcement) and the FCA's "lessons learned" request to Starling's board (C-OP-08).
- Requirement 10.

**Feasibility:**
- *L2:* strong IP.
- *L3:* design attributes are rarely captured in control registers, so a one-off tagging exercise is needed.
- *L4:* demonstrates "reasonable steps".
- *L1:* moderate resonance.
- *Hardest part:* the sibling taxonomy.
- *False-positive risk:* over-broad sibling sets. Mitigation: the owner can mark a sibling "not affected", with evidence.
- *Disagreement:* minor. L3 asks for a cap on sibling counts per issue.
- **Provenance:** C-OP-08, Requirement 10, Synthesis 2.

---

### UC-OP-A11 -- Which policy statements have nothing measuring them? Policy-to-metric coverage

- **Archetype:** Chain break (mapping).
- **Bucket:** A (substrate side).
- **Signal:** A policy statement or appetite statement (for example "UK residents only") has no metric, test or control mapped to it.
- **Cadence / trigger:** Continuous; event-driven on policy approval; quarterly board.
- **Primary user → routed exec:** CRO (SMF4) → SMF16; policy owners; the BRC.

**1. Data aggregation (requirement)**
- *Substrate inputs:*
  - the policy register, split into atomic statements;
  - the regulatory obligation library;
  - the RAS;
  - the control register;
  - the metric library;
  - the mapping links in the cascade graph.
- *Interaction inputs:* none for detection (policy text is document content, read and atomised by AI and confirmed by the policy owner).

**2. Baseline creation (evidence)**
- *Expected state:* each policy statement maps to at least one metric or test (G-OP-01).
- *What "normal" is:* mapping coverage per policy, tracked over time.

**3. Dynamic detection (sufficiency)**
The condition is met when any of the following holds:
- a statement has no mapping (a Level 1 gap, as the source says);
- a mapped metric has been retired;
- a policy is reissued and its new statements are unmapped;
- an appetite statement exists that no onboarding rule enforces (the Monzo shape).

**4. Distillation (attestation)**
- *Suppressed:* statements tagged "principle only" by the policy owner, with the second line's agreement.
- *Ranking inputs:* the policy's principal risk and whether the statement is an appetite or restriction statement.
- *Attestation:* the policy owner confirms the AI-drafted atomisation and the mappings.

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* a coverage line per principal risk ("Financial crime policy: 46 statements, 41 mapped, 5 unmapped" `[illustrative]`) and a drill to the unmapped statements.
- *Recommended action:* propose a metric or test for each gap.
- *Draft artifact:* a draft metric definition.
- *Human gate:* the policy owner and the second line approve.
- **Hero element:** chain-integrity badge (mapping), with a coverage drill.

**Why it beats a self-built dashboard:** The policy repository and the KRI library are separate qualifier systems (Synthesis 2). The gap is in the link between them, which neither shows.

**Differentiation:** Substrate-visible. It needs the policy-to-metric coverage map (Requirement 8).

**Worked example:**
- *Real anchors:*
  - Monzo's "financial crime risk appetite" rested on a UK-only customer policy that its onboarding did not enforce (A-OP-10). Customers it had exited for financial crime reopened accounts that were rated "No Risk Identified" (G-OP-01).
  - Nationwide allowed business use of personal accounts "without effective mitigating controls" (G-OP-01).
- *Illustrative case:* the statement "We do not offer accounts to non-UK residents" has no metric. The proposed test is the share of new accounts with any non-UK attribute at onboarding (H-OP-02 leading indicator). First run: 0.8% of 210,000 new accounts `[illustrative]`.

**Regulatory / governance hook:**
- FCA Final Notices on Monzo (07 July 2025) and Nationwide (12 December 2025).
- FCA Principle 3 and SYSC for solo-regulated firms (A-OP-10, `[unverified]` `[inference]`).

**Feasibility:**
- *L3:* AI atomisation of policies is feasible, and human confirmation is the bottleneck.
- *L2:* core product IP.
- *L4:* strong.
- *L1:* "we have policies nobody checks" lands with the board.
- *Hardest part:* the granularity of atomic statements.
- *False-positive risk:* aspirational statements flagged as gaps. Mitigation: the "principle only" tag.
- *Disagreement:* L3 fears a coverage target becomes box-ticking; L2 counters with the source's view that unmapped appetite statements are a Level 1 gap.
- **Provenance:** G-OP-01, A-OP-10, H-OP-02, Requirement 8.

---

### UC-OP-A12 -- Which known weaknesses are ageing without reaching the board? Audit and remediation ageing

- **Archetype:** Breach (persistence) with auto-escalation.
- **Bucket:** A (substrate side).
- **Signal:** An audit finding or known control weakness has been open beyond its SLA or has been re-opened, and has not appeared in a board or BRC pack.
- **Cadence / trigger:** Monthly; auto-escalation after N periods.
- **Primary user → routed exec:** CRO (SMF4) → BRC chair; audit committee chair; Head of Internal Audit (SMF5).

**1. Data aggregation (requirement)**
- *Substrate inputs:*
  - audit findings with rating, owner, due date, revision history and repeat flags;
  - issue and action log;
  - CDD past-refresh-date counts and other known-weakness backlogs (H-OP-04 leading indicator);
  - the list of items included in each committee pack (as data).
- *Interaction inputs:* the pack index only. Content analysis is UC-OP-B8.

**2. Baseline creation (evidence)**
- *Expected state:* findings closed by their due date, and high-rated findings presented to the BRC within one cycle.
- *What "normal" is:* the firm's own ageing distribution by rating.

**3. Dynamic detection (sufficiency)**
The condition is met when any of the following holds:
- a high-rated finding is past its due date with no board visibility;
- a due date has been extended more than a firm-set number of times;
- a finding repeats a closed one;
- a known-weakness backlog is flat or growing over successive periods (Nationwide: weaknesses known but not fixed "in a timely manner").

**4. Distillation (attestation)**
- *Suppressed:* low-rated findings within SLA.
- *Ranking inputs:* rating, overdue days, number of extensions, repeat status, and Level 1 link.
- *Attestation:* the owner attests progress with evidence; internal audit validates closure.

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* an exception feed entry, "Unremediated past SLA". This entry cannot be suppressed, under methodology rule B.8.
- *Recommended action:* propose a BRC agenda item and a remediation owner review.
- *Draft artifact:* the BRC paper paragraph.
- *Human gate:* the BRC chair accepts the agenda item.
- **Hero element:** exception feed ("unremediated past SLA" band).

**Why it beats a self-built dashboard:** Audit tracking tools show ageing to the audit committee. They do not show whether the finding ever reached the risk committee or the board, or whether a backlog behind it is shrinking.

**Differentiation:** Substrate-visible. Auto-surfacing past the SLA is a product rule.

**Worked example:**
- *Real anchors:*
  - Starling's November 2018 internal audit report was not adequately conveyed "to either Starling's Board or the Authority" (C-OP-02, E-OP-04).
  - Nationwide's CDD refresh and risk assessment failings ran from 2016 to 2021 and included missed furlough fraud of £26.01m in 8 days (H-OP-04).
- *Illustrative case:* a high-rated finding on CDD refresh has been extended three times over 19 months. The CDD past-refresh backlog stayed between 41,000 and 44,000 customers `[illustrative]`. It has never appeared in a BRC pack.

**Regulatory / governance hook:**
- The UK Corporate Governance Code and IIA practice on the audit committee's direct line to internal audit (E-OP-04, `[unverified]`).
- IIA Three Lines Model (July 2020) (E-OP-01).
- FCA Final Notices on Starling (27 September 2024) and Nationwide (12 December 2025, £44,078,500).

**Feasibility:**
- *L3:* easy. The data exists.
- *L1:* high resonance with the BRC chair.
- *L4:* strong.
- *L2:* fits the "cannot be suppressed" rule.
- *Hardest part:* agreeing N and the SLA by rating.
- *False-positive risk:* low.
- *Disagreement:* the audit committee and BRC may contest ownership of the item. L1 wants it surfaced to both. Kept.
- **Provenance:** C-OP-02, E-OP-01, E-OP-04, H-OP-04, E-OP-02.

---

### UC-OP-A13 -- Which Consumer Duty outcomes are outside tolerance, and for whom?

- **Archetype:** Position and breach, applying appetite mechanics to conduct.
- **Bucket:** A (substrate side; UC-OP-B6 adds the complaint-narrative join).
- **Signal:** A Consumer Duty outcome metric for a journey or customer cohort crosses its tolerance, or a metric has no tolerance, owner, action, due date or success measure.
- **Cadence / trigger:** Monthly; annual Consumer Duty board report.
- **Primary user → routed exec:** CRO (SMF4), with the conduct risk owner → board (the annual report); journey owners; SMF16.

**1. Data aggregation (requirement)**
- *Substrate inputs:*
  - Consumer Duty outcome MI by journey: complaints per 1,000 by journey; vulnerability identification rate; out-of-target sales; FOS uphold rate; redress (A-OP-09 conduct indicators);
  - cohort attributes held at aggregate level (vulnerability flag, channel, product, tenure);
  - journey owner registry;
  - action plans.
- *Interaction inputs:* none here (see B6).

**2. Baseline creation (evidence)**
- *Per outcome × journey × cohort:* a tolerance band and a trailing baseline.
- *Expected state:* outcomes for vulnerable cohorts within a firm-set gap of the whole population.

**3. Dynamic detection (sufficiency)**
The condition is met when any of the following holds:
- an outcome crosses tolerance;
- the gap between a cohort and the whole population widens beyond a firm threshold;
- an outcome metric lacks any of the five elements the source requires (threshold, owner, action, due date, success measure, F-OP-01);
- a journey has no single owner.

**4. Distillation (attestation)**
- *Suppressed:* cohorts below a minimum size, for statistical stability and to avoid identification.
- *Ranking inputs:* severity of harm, cohort vulnerability, and persistence.
- *Attestation:* the journey owner attests with a mandatory commentary and conclusion (F-OP-05).

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* outcome tolerance cards with a cohort split and the five-element completeness strip.
- *Recommended action:* propose a remediation action with an owner, due date and success measure.
- *Draft artifact:* the paragraph for the annual board report.
- *Human gate:* the journey owner and the board.
- **Hero element:** outcome tolerance card with completeness strip.

**Why it beats a self-built dashboard:** The FCA review of 180 first-year reports found "poor data quality or missing thresholds" and "action plans without owners, timescales or success metrics". Firms already have dashboards; what is missing is appetite mechanics and completeness enforcement.

**Differentiation:** Substrate-visible.

**Worked example:**
- *Real anchors:*
  - the FCA's 27 July 2026 review found "limited evidence of how outcomes differ across customer groups" (F-OP-02);
  - in March 2025, "most firms… were unable to show how they effectively monitor" outcomes for vulnerable customers.
- *Illustrative case:* mortgage arrears-support journey complaints run at 4.1 per 1,000 for all customers and 9.6 per 1,000 for customers flagged vulnerable, against a cohort-gap tolerance of 2.0x `[illustrative]`. The journey has no named owner, and the action plan has no success measure.

**Regulatory / governance hook:**
- Consumer Duty, PRIN 2A annual board report.
- FCA good and poor practice on Consumer Duty board reports (updated 24 February 2025) (F-OP-01).
- FCA, *Delivering for vulnerable customers*, 07 March 2025 (F-OP-02).
- TLT on consumer understanding (F-OP-03, `[single]`).

**Feasibility:**
- *L4:* compliance lens. A cohort slice by vulnerability is permissible for insight; any differential action is gated to a human and risk review.
- *L3:* data exists but journey definitions vary.
- *L1:* high relevance for the annual report.
- *L2:* fits appetite mechanics.
- *Hardest part:* journey taxonomy.
- *False-positive risk:* small cohorts. Mitigation: a minimum cohort size.
- *Disagreement:* L1 wants one outcome score; L4 rejects a composite that hides cohort gaps. Kept.
- **Provenance:** F-OP-01, F-OP-02, F-OP-03, F-OP-05, A-OP-09, Synthesis 1 (item 10), Requirement 9.

---

### UC-OP-A14 -- Are we ready for 18 March 2027? Operational incident and third-party classification readiness

- **Archetype:** Reportability case (forward-dated), with a mapping chain break.
- **Bucket:** A (substrate side).
- **Signal:** Incidents and material third-party arrangements logged today would, under the PS26/2 and PS7/26 regime, meet a reporting threshold, but the firm has no classification recorded and no clear standard or enhanced tier.
- **Cadence / trigger:** Monthly to 18 March 2027; event-driven thereafter.
- **Primary user → routed exec:** CRO (SMF4) → COO and CTO; SMF24 if applicable `[NEW -- beyond file]`; BRC.

**1. Data aggregation (requirement)**
- *Substrate inputs:*
  - incident and loss events;
  - the impact-tolerance register for important business services;
  - the third-party register;
  - the PS26/2 and PS7/26 definitions, thresholds, tiers and annual register requirements (C-OP-05; submission clocks `[unverified]`).
- *Interaction inputs:* none.

**2. Baseline creation (evidence)**
- *Expected state:* every incident classified against the new definition, and every third party classified as material or not.
- *What "normal" is:* the shadow-classification rate. A back-test of the last 12 months of incidents gives the expected annual volume of reportable incidents.

**3. Dynamic detection (sufficiency)**
The condition is met when any of the following holds:
- an incident logged now would meet the new threshold but has no shadow classification;
- a third party meets the materiality criteria but is not on the register;
- services near impact tolerance (A-OP-09 operational resilience leading indicator) have no incident classification route.

**4. Distillation (attestation)**
- *Suppressed:* incidents clearly below threshold.
- *Ranking inputs:* proximity to threshold and service criticality.
- *Attestation:* the COO attests the classification method; SMF16 owns the decision once the regime is live.

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* a readiness strip ("Last 12 months: 9 incidents would have been reportable; 4 classified; 17 of 22 material third parties registered" `[illustrative]`), with a countdown to 18 March 2027.
- *Recommended action:* propose a classification backlog plan.
- *Draft artifact:* a readiness paper.
- *Human gate:* the COO and BRC approve.
- **Hero element:** readiness strip feeding the reportability ledger.

**Why it beats a self-built dashboard:** The regime has a fixed date and a new incident definition. Existing incident logs are not classified against it, and a back-test of shadow classifications needs the rule library versioned by in-force date, which the product owns (C-OP-04).

**Differentiation:** Substrate-visible.

**Worked example:**
- *Real anchor:* TSB's IT migration (FCA and PRA, 20 December 2022, £48,650,000; £32.7m redress) for "operational risk management and governance failures, including management of outsourcing risks" (H-OP-06).
- *Illustrative case:* a back-test finds that 9 incidents in the last 12 months would have met the threshold, and 3 relate to one cloud provider not yet classified as a material third party `[illustrative]`.

**Regulatory / governance hook:**
- FCA PS26/2 and PRA PS7/26 (published 18 March 2026; in force 18 March 2027).
- About 90% of FCA firms fall in the standard tier (C-OP-05).
- SUP 15.18 and 15.19 inserted (C-OP-04, `[single]`).

**Feasibility:**
- *L1 and J-OP-04:* a buying trigger with a fixed date.
- *L3:* incident logs usually lack the needed attributes, so a one-off enrichment is required.
- *L4:* clocks are `[unverified]` until confirmed in the texts.
- *L2:* a natural extension of the reportability ledger.
- *Hardest part:* the materiality definition for third parties.
- *False-positive risk:* over-classification during shadow running. Acceptable, because it is pre-regime.
- *Disagreement:* L1 sees it as a door-opener; L2 warns that it pulls the product toward operational resilience tooling, which is crowded. Kept.
- **Provenance:** C-OP-04, C-OP-05, H-OP-06, A-OP-09, J-OP-04.

---

### UC-OP-A15 -- Which emerging risks map onto which principal risks, and over what horizon?

- **Archetype:** Position (emerging overlay), with a chain-break check (an emerging risk with no principal risk or metric).
- **Bucket:** A (substrate side; UC-OP-B11 adds the narrative join).
- **Signal:** An emerging risk on the register is unmapped to any principal risk, has no crystallising horizon, or has crossed into its horizon with no metric attached.
- **Cadence / trigger:** Quarterly BRC; annual.
- **Primary user → routed exec:** CRO (SMF4) → BRC; board.

**1. Data aggregation (requirement)**
- *Substrate inputs:*
  - the emerging risk register;
  - principal risks;
  - the metric library;
  - horizon fields.
- *Disclosure convention from B-OP-01:*
  - Nationwide maps 7 emerging risks to related principal risks;
  - Metro uses a "Crystallising time horizon" column;
  - Coventry elevated change risk "to support enhanced monitoring by the Board";
  - Leeds treats climate as cross-cutting.
- *Interaction inputs:* none here.

**2. Baseline creation (evidence)**
- *Expected state:* each emerging risk is mapped to at least one principal risk and given a horizon. When it enters its horizon, a metric is attached.

**3. Dynamic detection (sufficiency)**
The condition is met when any of the following holds:
- the emerging risk is unmapped;
- it has no horizon;
- it is within its horizon and has no metric;
- it has been promoted to principal (for example change risk at Coventry, January 2025) and has no RAS statement.

**4. Distillation (attestation)**
- *Suppressed:* emerging risks with horizons beyond the planning period and mappings already complete.
- *Ranking inputs:* proximity to horizon and the number of principal risks affected.
- *Attestation:* the CRO.

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* the top and emerging risk overlay, mapped to principal risks with time to crystallise, in the narrative disclosure convention (B-OP-02: keep RAG private; export a narrative).
- *Recommended action:* propose a metric or RAS statement.
- *Draft artifact:* emerging risk paper text.
- *Human gate:* the BRC.
- **Hero element:** top and emerging risk overlay.

**Why it beats a self-built dashboard:** Emerging risk registers are usually narrative lists. Linking them to principal risks, horizons and metrics, and flagging the moment one needs a metric, turns horizon scanning into appetite governance.

**Differentiation:** Substrate-visible.

**Worked example:**
- *Real anchors:* Coventry added change risk as a principal risk from January 2025, alongside Co-operative Bank integration as an emerging risk. Nationwide lists integration as a new emerging risk (B-OP-01; J-OP-03).
- *Illustrative case:* an integration emerging risk enters its 6-month horizon. It is mapped to operational and conduct risk, but has no metric. The proposed metrics are migration defect rate and complaints per 1,000 among migrated customers `[illustrative]`.

**Regulatory / governance hook:**
- Disclosure practice in annual reports and accounts (B-OP-01, `[unverified]` counts).
- FSB RAF (A-OP-01).
- Climate framed as PRA prudential (SS3/19 per the brand rules; not in the OP source; `[NEW -- beyond file]`).

**Feasibility:**
- *L3:* easy.
- *L1:* the board expects it.
- *L2:* fits.
- *L4:* low risk.
- *Hardest part:* agreeing horizons.
- *False-positive risk:* low.
- *Disagreement:* L1 regards it as a qualifier, not a differentiator. Kept as must-show.
- **Provenance:** B-OP-01, B-OP-02, J-OP-03, Synthesis 1 (item 5). `[long-tail -- preserve]` for differentiation value.

---

### UC-OP-A16 -- Conduct Rule breach notification timers linked to HR outcomes

- **Archetype:** Reportability case (narrow clock).
- **Bucket:** A (substrate side).
- **Signal:** A conduct case reaches formal disciplinary action (written warning, suspension, dismissal, or reduction or recovery of pay), which starts a notification timer.
- **Cadence / trigger:** Event-driven, from HR outcome.
- **Primary user → routed exec:** SMF16 → CRO; HR; the board for SMF cases.

**1. Data aggregation (requirement)**
- *Substrate inputs:* the conduct case log, HR disciplinary outcomes, SMF and certified-staff flags, and the configurable timers (7 business days for SMFs and annual REP008 per panel knowledge, `[unverified]`).
- *Interaction inputs:* none.

**2. Baseline creation (evidence)**
- *Expected state:* each formal action has a notification decision within the configured timer.

**3. Dynamic detection (sufficiency)**
The condition is met when any of the following holds:
- an HR outcome matches a formal action type and no decision is logged;
- the timer is near expiry;
- a non-financial misconduct case under PS25/23 (F-OP-04) has no Conduct Rule assessment.

**4. Distillation (attestation)**
- *Suppressed:* informal outcomes.
- *Ranking inputs:* SMF status and time remaining.
- *Attestation:* SMF16 decides; HR attests the outcome.

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* a reportability ledger row with clock type "Conduct Rules".
- *Recommended action:* prepare a notification draft.
- *Human gate:* SMF16.
- **Hero element:** reportability ledger (Conduct Rules clock).

**Why it beats a self-built dashboard:** HR and compliance systems are separate. The trigger is an HR event, which compliance often learns about late.

**Differentiation:** Substrate-visible (HR × compliance join).

**Worked example:**
- *Illustrative case:* a certified employee receives a written warning on 02 October 2026 `[illustrative]`. The ledger opens a Conduct Rules case on the same day. It is counted for annual reporting, and the board sees the count only.
- *Real anchor:* the FCA streamlined SMCR (Clifford Chance, May 2026) (C-OP-06).

**Regulatory / governance hook:** COCON; Conduct Rule breach notifications as summarised by Clifford Chance, May 2026; FCA PS25/23 (F-OP-04). Timers are `[unverified]`.

**Feasibility:**
- *L4:* timers must be verified.
- *L3:* HR data access is sensitive, so a cohort-level count is the default for the board, with case detail kept in a restricted SMF16 view.
- *L1:* low.
- *L2:* fits the multi-clock ledger.
- *Hardest part:* HR integration.
- *False-positive risk:* low.
- *Disagreement:* L3 questions whether this belongs in the board layer at all.
- **Provenance:** C-OP-06, F-OP-04. `[long-tail -- preserve]` `[single]`.

---

### UC-OP-A17 -- Does every agent-initiated payment sit inside its mandate? Agent mandate perimeter (second module)

- **Archetype:** Breach (mandate scope), with a reportability case under unresolved liability.
- **Bucket:** A (substrate side).
- **Signal:** An agent-initiated payment falls outside the recorded mandate scope, or lacks agent identity or a mandate check.
- **Cadence / trigger:** Real-time at the perimeter; monthly roll-up.
- **Primary user → routed exec:** SMF17 → CRO; COO; board via model risk appetite.

**1. Data aggregation (requirement)**
- *Substrate inputs:* payment events flagged as agent-initiated, the mandate records (scope, limits, counterparties, expiry), agent identity attestations, and APP claims data.
- *Interaction inputs:* none.

**2. Baseline creation (evidence)**
- *Expected state:* 100% of agent-initiated payments carry an identity and an in-mandate check.
- *What "normal" is:* the agent payment volume and value distribution per customer cohort.

**3. Dynamic detection (sufficiency)**
The condition is met when any of the following holds:
- a payment exceeds its mandate scope;
- there is no mandate record;
- agent identity is unverified;
- a velocity anomaly appears relative to the mandate.

**4. Distillation (attestation)**
- *Suppressed:* in-mandate payments.
- *Ranking inputs:* value and the gap between the mandate and the payment.
- *Attestation:* SMF17.

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* a mandate-coverage metric and out-of-mandate exceptions, tied to the board-set model risk appetite.
- *Recommended action:* propose a hold-review policy for human approval of outflows (the Bank of America stance).
- *Human gate:* SMF17.
- **Hero element:** mandate-coverage tile.

**Why it beats a self-built dashboard:** No current MI carries a mandate object. The Mills Review (06 July 2026) calls for a framework on "consent mandates, identity, control and liability". The source recommends recording "mandate scope, agent identity and a mandate check for each transaction".

**Differentiation:** Substrate-visible (a new object).

**Worked example:**
- *Real anchors:* 58% of UK merchants believe agents have transacted on their platforms, and 41% are confident in liability frameworks (I-OP-04, `[single]`). JPMorgan, Citi and Bank of America restrict third-party agents (October 2026, I-OP-06).
- *Illustrative case:* 1,900 agent-initiated payments are made in a month, 23 of them outside mandate scope (£41,000) `[illustrative]`.

**Regulatory / governance hook:**
- Mills Review recommendations (06 July 2026), which are not rules.
- FCA statement of 25 March 2026.
- The unresolved authorised-versus-unauthorised liability question (APP regime versus PSRs 2017) (I-OP-04).
- PRA SS1/23 (I-OP-09).
- FSB agentic practices (I-OP-02, `[single]` `[unverified]`).

**Feasibility:**
- *L4:* do not sell compliance with rules that do not exist.
- *L1:* the source's verdict is not a lead product; it is a 2027–2028 second module.
- *L3:* there is little agent traffic to monitor while banks block third-party agents.
- *L2:* data model only.
- *Hardest part:* agent identification.
- *False-positive risk:* high, because agent flags are unreliable.
- *Disagreement:* the source itself is sceptical. L2 wants the data model built now; L1 says not to demo it.
- **Provenance:** I-OP-01, I-OP-02, I-OP-04, I-OP-06, I-OP-07, I-OP-09, Synthesis 4. `[long-tail -- preserve]`.

---

### UC-OP-A18 -- Receiving-PSP APP exposure: is mule detection now a P&L and appetite metric?

- **Archetype:** Position (financial crime and conduct appetite).
- **Bucket:** A (substrate side).
- **Signal:** The firm's receiving-side APP reimbursement share and its mule-account inflow rate trend toward a financial crime appetite threshold.
- **Cadence / trigger:** Monthly.
- **Primary user → routed exec:** SMF17 → CRO; CFO.

**1. Data aggregation (requirement)**
- *Substrate inputs:*
  - APP claims as sending and receiving PSP;
  - reimbursement amounts (up to £85,000 per claim, split 50/50 between sending and receiving PSPs, paid within 5 business days, or 35 if extended);
  - mule-flagged accounts;
  - account-opening cohorts.
- *Interaction inputs:* none.

**2. Baseline creation (evidence)**
- *What "normal" is:* receiving-side claims per 10,000 accounts by opening cohort, compared with a sector reference where one is published.

**3. Dynamic detection (sufficiency)**
The condition is met when any of the following holds:
- receiving-side claims per 10,000 accounts rise beyond volatility;
- they are concentrated in recent opening cohorts, which links this card to UC-OP-A5's capacity ratio.

**4. Distillation (attestation)**
- *Suppressed:* claims under investigation.
- *Ranking inputs:* cohort concentration.
- *Attestation:* SMF17.

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* a financial crime appetite metric showing receiving-side APP exposure.
- *Recommended action:* propose an onboarding control review.
- *Human gate:* SMF17.
- *Boundary:* the metric is shown as a harm and appetite indicator, never as a cost to trade against the floor.
- **Hero element:** headroom gauge on the receiving-side APP metric.

**Why it beats a self-built dashboard:** Reimbursement is tracked by the claims team, onboarding cohorts by growth teams. The link between new-account cohorts and receiving-side liability is not made.

**Differentiation:** Substrate-visible.

**Worked example:**
- *Real anchors:*
  - year one to 30 September 2025: about 88% of APP losses reimbursed, about £173m;
  - 15 months to the end of 2025: 89%, £243m;
  - total APP losses rose 19% to £576.4m in 2025;
  - reimbursement rates ranged from 21% to 94% across PSPs (I-OP-05, `[conflict]`).
- *Illustrative case:* 62% of receiving-side claims come from accounts opened in the last 6 months, which make up 18% of the book `[illustrative]`.

**Regulatory / governance hook:** PSR APP reimbursement from 07 October 2024; PSR PS25/5 (May 2025).

**Feasibility:**
- *L4:* the no cost or ROI trade-off rule applies.
- *L3:* claims data is available.
- *L1:* moderate resonance for challengers.
- *L2:* fits.
- *Hardest part:* attribution to cohorts.
- *False-positive risk:* low.
- *Disagreement:* L4 warns that framing this as "P&L" (the source's word) risks a cost lens; it is surfaced as harm and appetite only.
- **Provenance:** I-OP-04, I-OP-05. `[long-tail -- preserve]`.

---
## Bucket B -- Net-new joins between substrate metrics and governance narrative

*Notes that apply to every Bucket B card:*
- **The join:** substrate metrics (KRIs, thresholds, tests, reconciliations, issues, change logs) × the governance interaction corpus (board, BRC, ERC and sub-committee papers and minutes; escalation notes; attestation commentary; second-line challenge records; complaint narratives; aggregated speak-up cases).
- **Cohort-level framing:** joins are made at the level of a metric, forum, journey, business area or cohort, never at the level of an individual customer or whistle-blower.
- **AI role:** the AI extracts, aligns and drafts. A named human confirms every extracted link before it can drive escalation.
- **Evidence bands:**
  - **Strong:** direct, timestamped, multiple instances.
  - **Moderate:** consistent pattern with some inference.
  - **Indicative:** a single instance or extraction confidence below a firm-set level. Shown only in the drill, never on the board headline.

### UC-OP-B1 -- Is a persistent amber being discussed, or quietly carried? Metric persistence versus minutes

- **Archetype:** Silent failure (escalation suppression).
- **Bucket:** B (join).
- **Signal:** A Level 1 or Level 2 metric has been amber or red for N periods, and the minutes of the forum responsible for it contain no discussion, decision or action on it.
- **Cadence / trigger:** After each committee cycle (monthly ERC; quarterly BRC and board).
- **Primary user → routed exec:** CRO (SMF4) → BRC chair.

**1. Data aggregation (requirement)**
- *Substrate inputs:*
  - metric status history (amber and red periods by metric);
  - the escalation cascade rules (B-OP-03 panel practice: management committees see all KRIs, the ExCo sees Level 2 ambers and reds, the BRC sees all Level 1 plus Level 2 reds, the board sees Level 1 status and breaches);
  - the pack index for each meeting.
- *Interaction inputs:* minutes and papers for the ERC, BRC and board, with extracted mentions of each metric, its decisions and actions, each with a timestamp.

**2. Baseline creation (evidence)**
- *Expected state:* a metric that crosses the visibility threshold for a forum is mentioned, with a recorded conclusion, in that forum's minutes within one cycle.
- *What "normal" is:* the firm's historical mention rate for amber items per forum. Some ambers are legitimately "noted" without debate.

**3. Dynamic detection (sufficiency)**
- *Cross-domain correlation, aligned in time:* for each committee date T, the metric was amber or red at T and for at least N prior periods; but the T minutes contain no mention, or only a "noted" with no decision or action.
- *Persistence rule:* an amber persisting for N periods triggers auto-escalation (methodology edge case "persistent amber that never escalates").

**4. Distillation (attestation)**
- *Suppressed:* metrics with a recorded board decision to tolerate the amber, with an expiry date (a waiver) that has not expired.
- *Ranking inputs:* periods in amber, Level, and the number of forums that skipped it.
- *Attestation:* the committee secretary confirms that the extracted mentions are complete; the CRO confirms the escalation.

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* escalation-health index entries: "Liquidity L2 deposit concentration: amber for 4 quarters; mentioned in 1 of 4 BRC minutes; no recorded decision" `[illustrative]`.
- *Evidence band:* strong when both the status history and absent mentions are confirmed; moderate if extraction confidence is lower.
- *Recommended action:* propose a BRC agenda item, with a choice between a waiver with expiry and a remediation decision.
- *Draft artifact:* the agenda item and decision paper.
- *Human gate:* the BRC chair.
- **Hero element:** escalation-health index.

**Why it is impossible without the join:** Metric status lives in the KRI system; what the committee did about it lives only in the minutes. Neither source alone can show that an item was in amber and nobody discussed it. Only the time-aligned join reveals the gap.

**Why it beats a self-built dashboard:** A dashboard shows the amber. It cannot show that the amber was never discussed.

**Differentiation:** Requires the join. Does not exist today.

**Worked example:**
- *Real anchors:*
  - At Starling, "different committees receiv[ed] different information" (B-OP-03).
  - At Metro, the time from first flag to the board was about two years (F-OP-04): staff flagged data gaps in 2017 and 2018, and they were not fixed until 2019–2020.
- *Illustrative case:* a Level 2 metric, "KYC refresh backlog per 10,000", was amber for 5 consecutive months `[illustrative]`. It was minuted at ERC twice as "noted", and never at the BRC.

**Regulatory / governance hook:**
- FSB RAF on communicating and monitoring appetite (A-OP-01).
- PRA SS5/16 board responsibilities (A-OP-11, `[unverified]`).
- FCA Final Notice, Starling, 27 September 2024 (inconsistent MI).
- The cascade rule is `[practice-not-rule]`.

**Feasibility:**
- *L1:* the BRC chair's single most valuable signal ("is bad news reaching me?").
- *L3:* minutes are often unstructured PDFs; extraction is feasible, but metric naming varies, so an alias table is needed.
- *L4:* the minutes are privileged governance records; access control and retention must be agreed.
- *L2:* fits the escalation-routing rule.
- *Hardest part:* recognising a metric mentioned under a different name.
- *False-positive risk:* items discussed under an umbrella topic. Mitigation: confirm with the secretary.
- *Disagreement:* L1 wants it on the board screen; L3 warns that minutes are drafted to be brief, so absence is not proof. Kept, with evidence bands.
- **Provenance:** B-OP-03, F-OP-04, D-OP-04, H-OP-03, Synthesis 5 (question 4).

---

### UC-OP-B2 -- Are different committees seeing different numbers? Cross-forum MI consistency

- **Archetype:** Chain break (single source of truth).
- **Bucket:** B (join).
- **Signal:** The same metric for the same period appears with different values, definitions, RAG status or commentary in ERC, BRC and board papers.
- **Cadence / trigger:** After each pack cycle.
- **Primary user → routed exec:** CRO (SMF4) → BRC chair; board secretary.

**1. Data aggregation (requirement)**
- *Substrate inputs:* the canonical metric value from the system of record for each period.
- *Interaction inputs:* figures, RAG colours and commentary extracted from each forum's paper, with the paper date and author.

**2. Baseline creation (evidence)**
- *Expected state:* every forum shows the same value and status for the same as-of date.
- *Tolerated variance:* rounding, and documented differences in as-of date.

**3. Dynamic detection (sufficiency)**
- *Cross-domain correlation:* for a given metric and as-of date, the paper value differs from the canonical value, or two papers differ from each other, or the status colour differs, or the commentary characterises the trend differently ("stable" versus a rising series).

**4. Distillation (attestation)**
- *Suppressed:* differences explained by a declared as-of date.
- *Ranking inputs:* Level, size of the difference, and the direction of the difference (more favourable in the higher forum ranks first).
- *Attestation:* the paper author confirms or corrects; the CRO signs off the board version.

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* a pre-meeting consistency check on the pack, listing mismatched figures.
- *Evidence band:* strong, because the values are numeric.
- *Recommended action:* propose correcting the paper before circulation.
- *Draft artifact:* the correction note.
- *Human gate:* the CRO.
- **Hero element:** pack consistency check inside the escalation-health index.

**Why it is impossible without the join:** The source system has one number; the papers are separate documents. Only reading the papers against the canonical metric shows that the board saw a softer figure than the ERC.

**Why it beats a self-built dashboard:** The source's implication is to "run every forum from a single source of truth, and show what each filter suppresses". A dashboard can be that source, but it cannot audit the documents people actually circulate.

**Differentiation:** Requires the join. Does not exist today.

**Worked example:**
- *Real anchor:* Starling, "different committees receiv[ed] different information" (B-OP-03).
- *Illustrative case:* the ERC paper reports a screening coverage of 92% (amber). The BRC paper rounds it to "over 90%, green" with an older as-of date `[illustrative]`.

**Regulatory / governance hook:**
- FCA Final Notice, Starling, 27 September 2024.
- PRA FR6 and the Metro PRA case (21 December 2021) on reporting governance (A-OP-11).
- SUP 15.6 on false or misleading information to the regulator, by read-across `[inference]`.

**Feasibility:**
- *L3:* table extraction from papers is reliable when papers are generated from templates.
- *L1:* high resonance.
- *L4:* strong defensibility.
- *L2:* fits.
- *Hardest part:* aligning as-of dates.
- *False-positive risk:* legitimate re-statements. Mitigation: a declared-restatement flag.
- *Disagreement:* L1 is concerned that it embarrasses paper authors; L4 says that is the point. Kept.
- **Provenance:** B-OP-03, A-OP-11, H-OP-05.

---

### UC-OP-B3 -- Is our MI about lifting the restriction rather than obeying it? Restriction narrative versus population test

- **Archetype:** Tension collision (growth versus restriction).
- **Bucket:** B (join).
- **Signal:** Committee papers and minutes concentrate on removing or reducing a VREQ or s166 restriction while the population adherence test fails, or has no test.
- **Cadence / trigger:** After each committee cycle while a restriction is live.
- **Primary user → routed exec:** CRO (SMF4) → board; SMF17.

**1. Data aggregation (requirement)**
- *Substrate inputs:* restriction adherence test results (UC-OP-A4) and the restriction register.
- *Interaction inputs:* papers and minutes, classified by restriction-related theme (lift, vary or remove; adherence or monitoring; remediation progress).

**2. Baseline creation (evidence)**
- *Expected state:* while a restriction is live, adherence evidence appears in every relevant paper, and lift discussion is supported by adherence evidence.

**3. Dynamic detection (sufficiency)**
- *Cross-domain correlation:* in period T, the share of restriction-related content devoted to "lift or remove" exceeds a threshold, and the population test for that restriction is failing, or untested, in the same period.

**4. Distillation (attestation)**
- *Suppressed:* periods where the population test passes.
- *Ranking inputs:* the ratio of lift content to adherence content, and the number of failing accounts.
- *Attestation:* SMF17 confirms the classification.

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* a restriction card showing "Adherence: 37 breaching accounts. Committee content on lifting the VREQ: 4 papers. On adherence: 0" `[illustrative]`.
- *Evidence band:* moderate, because the theme classification is inferred.
- *Recommended action:* propose adding an adherence evidence section to every restriction paper.
- *Human gate:* the CRO and board.
- **Hero element:** restriction adherence test with a narrative balance strip.

**Why it is impossible without the join:** The failing test is substrate; the MI framing is narrative. Only the join shows the board looking the wrong way.

**Why it beats a self-built dashboard:** A dashboard reports adherence. It cannot show that governance attention was directed elsewhere.

**Differentiation:** Requires the join. Does not exist today.

**Worked example:**
- *Real anchors:*
  - Starling's MI focused on "how the VREQ could be reduced or removed" (G-OP-02). Meanwhile 54,359 accounts were opened in breach (G-OP-01).
  - On Monzo, the FCA said "rapid customer growth must not come at the detriment of compliance".
- *Illustrative case:* four quarterly board papers discuss "path to lifting the VREQ"; none reports a population test `[illustrative]`.

**Regulatory / governance hook:** FCA Final Notices on Starling (27 September 2024) and Monzo (07 July 2025); the escalation ladder (C-OP-08).

**Feasibility:**
- *L4:* strong, because it is the exact Starling narrative.
- *L3:* theme classification is feasible but subjective.
- *L1:* uncomfortable but compelling.
- *L2:* fits.
- *Hardest part:* the classification thresholds.
- *False-positive risk:* a legitimate lift application backed by passing tests. This is suppressed.
- *Disagreement:* L1 thinks the board will resist being measured on attention; L4 insists. Kept.
- **Provenance:** G-OP-02, G-OP-01, H-OP-01, H-OP-02. `[single]` for the MI-framing anchor.

---

### UC-OP-B4 -- Are attestations evidence or rubber stamps? Attestation commentary versus reconciliation results

- **Archetype:** Chain break (attestation quality).
- **Bucket:** B (join).
- **Signal:** An owner's attestation commentary says "no issues" or is copied unchanged from the previous cycle, while the reconciliation or test result it attests shows a gap or a material change.
- **Cadence / trigger:** Each attestation cycle (firm practice).
- **Primary user → routed exec:** CRO (SMF4) and the second line → first-line owners; COO.

**1. Data aggregation (requirement)**
- *Substrate inputs:* the reconciliation results and control test results being attested (D-OP-05: "attest to a specific reconciliation result").
- *Interaction inputs:* attestation commentary text, with author and timestamp; the previous cycles' commentary.

**2. Baseline creation (evidence)**
- *Expected state:* commentary references the specific result, and changes when the result changes.
- *What "normal" is:* text similarity to the previous cycle, judged against how much the result itself moved.

**3. Dynamic detection (sufficiency)**
- *Cross-domain correlation:* the result moved materially, or shows a gap, while the commentary is near-identical to the previous cycle or asserts "no exceptions"; or an attestation was submitted before the reconciliation it attests had run (timestamp order).

**4. Distillation (attestation)**
- *Suppressed:* stable results with stable commentary.
- *Ranking inputs:* the size of the result change, the dependency count of board metrics, and repeated copy-forward.
- *Attestation:* the second line challenges, and the challenge is recorded.

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* the chain-integrity badge (attestation) marked "attested without evidence".
- *Evidence band:* strong when the timestamp order is wrong; moderate on text similarity.
- *Recommended action:* propose re-attestation with the evidence reference.
- *Human gate:* the second line.
- **Hero element:** chain-integrity badge (attestation).

**Why it is impossible without the join:** An attestation workflow records that an attestation happened. Only joining its text and timestamp to the result shows whether it said anything true.

**Why it beats a self-built dashboard:** A completion rate of 100% looks perfect on a dashboard.

**Differentiation:** Requires the join. Does not exist today.

**Worked example:**
- *Real anchors:* Starling added "daily testing and assurance activity" from 17 January 2023 (D-OP-05). Metro lacked checks "on an ongoing basis, that data was being correctly processed".
- *Illustrative case:* a feed owner attests "Reconciled, no exceptions" for the third month running, with identical text, while the reconciliation ratio fell from 99.9% to 94.0% `[illustrative]`. In month 2 the attestation was timestamped 3 hours before the reconciliation job completed.

**Regulatory / governance hook:**
- SMCR "reasonable steps" (D-OP-01, D-OP-05).
- Monthly data attestation is `[practice-not-rule]`.

**Feasibility:**
- *L3:* the first line will resent it, though it helps them evidence reasonable steps (the D-OP-05 panel disagreement).
- *L4:* strong.
- *L2:* fits the rule that owners attest evidence, not values.
- *L1:* moderate.
- *Hardest part:* the similarity threshold.
- *False-positive risk:* legitimately stable short commentary. Mitigation: only flag it when the result moved.
- *Disagreement:* L3 versus L4, exactly as recorded in the source. Kept.
- **Provenance:** D-OP-05, H-OP-03, Requirement 6. `[single]`.

---

### UC-OP-B5 -- Has a board-agreed trade-off started colliding? Tension register versus decision record

- **Archetype:** Tension collision.
- **Bucket:** B (join).
- **Signal:** The board minuted a trade-off (for example, "pursue onboarding growth provided pre-CDD transacting stays below X"), and the paired metrics now diverge beyond the agreed condition.
- **Cadence / trigger:** Monthly metric check; quarterly BRC.
- **Primary user → routed exec:** CRO (SMF4) → board and BRC; CEO.

**1. Data aggregation (requirement)**
- *Substrate inputs:* the paired metrics stored as guardrail pairs: growth metric × control metric; any regulatory floor.
- *Interaction inputs:* the board or BRC minute that agreed the trade-off, with its condition, owner and review date.

**2. Baseline creation (evidence)**
- *Expected state:* both metrics stay inside the minuted condition.
- *What "normal" is:* the joint path the board assumed when it agreed.

**3. Dynamic detection (sufficiency)**
- *Cross-domain correlation:* one metric improves while its partner deteriorates (G-OP-02); the partner crosses the minuted condition; or the review date passes with no re-decision in the minutes.
- *Rejected entries:* a pair that trades against a regulatory floor is rejected at entry, because floors are not tradeable.

**4. Distillation (attestation)**
- *Suppressed:* pairs moving together.
- *Ranking inputs:* how far the minuted condition is exceeded, and how long the review date has passed.
- *Attestation:* the pair owner and the CRO.

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* a tension register summary: "Onboarding conversion up 11 points; pre-CDD transacting share up from 0.4% to 1.9%; minuted ceiling 1.0% (board, 12 March 2026)" `[illustrative]`.
- *Evidence band:* strong, from a direct minute and numeric metrics.
- *Recommended action:* propose re-setting the trade-off.
- *Draft artifact:* the re-decision paper.
- *Human gate:* the board.
- **Hero element:** tension register and guardrail pair.

**Why it is impossible without the join:** The pair's metrics are substrate; the agreed condition exists only in the minutes. Without the minute, there is nothing to collide with.

**Why it beats a self-built dashboard:** The source found no published method or verified vendor feature for conflict detection (G-OP-03), and the J-OP-05 competitor table shows "Tension: No" across the incumbents `[unverified]`.

**Differentiation:** Requires the join. Does not exist today.

**Worked example:**
- *Real anchors:* Starling's MI and the Monzo statement (G-OP-02). Panel view (CRO): "use paired metrics with a trade-off the board has agreed".
- *Illustrative case:* as given in the card above.

**Regulatory / governance hook:**
- FCA on Monzo: "rapid customer growth must not come at the detriment of compliance".
- Product boundary: no tension against a financial crime floor.

**Feasibility:**
- *L2:* signature product IP.
- *L1:* very high resonance (board question 6 in the source).
- *L3:* boards rarely minute a quantitative condition, so the product may have to prompt one.
- *L4:* floors must not appear as tensions.
- *Hardest part:* turning minuted language into a numeric condition. The AI drafts; the board secretary confirms.
- *False-positive risk:* metric noise. Mitigation: volatility bands.
- *Disagreement:* L3 doubts that boards will minute numeric conditions; L2 says the tool should create the habit. Validate with design partners (G-OP-03).
- **Provenance:** G-OP-02, G-OP-03, J-OP-05, Synthesis 2, Synthesis 5 (question 8).

---

### UC-OP-B6 -- Where do complaints cluster on journeys nobody owns? Complaint narratives versus the ownership map

- **Archetype:** Chain break (owner), shown through outcomes.
- **Bucket:** B (join).
- **Signal:** Complaint narratives cluster on a cross-functional journey (horizontal) that has no single owner in the ownership map, while each vertical function's control metrics look fine.
- **Cadence / trigger:** Monthly.
- **Primary user → routed exec:** CRO (SMF4), with the conduct risk owner → CEO (to assign the journey owner); SMF16.

**1. Data aggregation (requirement)**
- *Substrate inputs:* the ownership map (vertical function owners; horizontal journey owners), complaint counts per 1,000 by journey, and FOS outcomes.
- *Interaction inputs:* complaint narratives, classified into journey steps and root-cause themes at cohort level.

**2. Baseline creation (evidence)**
- *What "normal" is:* complaint theme distribution by journey over the trailing 12 months.
- *Expected state:* each high-volume journey has an owner.

**3. Dynamic detection (sufficiency)**
- *Cross-domain correlation:* complaint themes concentrate on handoffs between functions (for example arrears support → collections → hardship), and each function's own control metrics are green, and the journey has no owner (D-OP-04: "When ownership is mis-assigned, complaints cluster on journeys that have no single owner").

**4. Distillation (attestation)**
- *Suppressed:* themes attributable to a single owned function.
- *Ranking inputs:* complaint volume, vulnerability share and FOS uphold rate.
- *Attestation:* the conduct risk owner confirms the theme clustering.

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* a journey card: "Arrears support: 62% of complaints cite handoffs; three functions each green; no journey owner" `[illustrative]`.
- *Evidence band:* moderate.
- *Recommended action:* propose a journey owner, who also becomes the horizontal risk owner (F-OP-03).
- *Draft artifact:* SoR or role wording.
- *Human gate:* the CEO.
- **Hero element:** chain-integrity badge (owner) at journey level.

**Why it is impossible without the join:** Vertical control metrics are all green, and the complaint count alone does not reveal ownership. Only narrative themes mapped to the ownership graph show the handoff gap.

**Why it beats a self-built dashboard:** A dashboard shows complaints per journey, but it cannot see where the handoffs fall between functions.

**Differentiation:** Requires the join. Does not exist today.

**Worked example:**
- *Real anchor:* the FCA's good practice is "unambiguous ownership of the consumer understanding outcome… part of the daily inner workings of the firm" (F-OP-03, `[single]`).
- *Illustrative case:* 1,140 arrears-support complaints in a quarter, 62% citing transfer between teams, and 31% from customers flagged vulnerable `[illustrative]`.

**Regulatory / governance hook:** Consumer Duty (PRIN 2A); FCA vulnerable customers review, 07 March 2025 (F-OP-02); the Consumer Duty board report review (F-OP-01).

**Feasibility:**
- *L4:* cohort-level only. Vulnerability is used for insight, not for differential action without a human and risk review.
- *L3:* complaint narrative classification is mature.
- *L1:* strong.
- *L2:* fits.
- *Hardest part:* the journey taxonomy.
- *False-positive risk:* themes that are noisy at low volumes.
- *Disagreement:* L2 (vertical accountability under SMCR) versus L3 (journeys cross functions). Kept, and linked to UC-OP-A7.
- **Provenance:** D-OP-04, F-OP-01, F-OP-02, F-OP-03. `[single]` for the clustering claim.

---

### UC-OP-B7 -- When did we first have information that "reasonably suggests"? Escalation-note awareness versus the reportability clock

- **Archetype:** Reportability case (clock integrity).
- **Bucket:** B (join).
- **Signal:** Escalation notes, second-line challenge records or committee papers show that awareness of a reportable matter came earlier than the awareness timestamp in the incident or issue log, so the clock started earlier than recorded.
- **Cadence / trigger:** Event-driven, on each reportability case.
- **Primary user → routed exec:** SMF16 → CRO; BRC chair on threshold matters.

**1. Data aggregation (requirement)**
- *Substrate inputs:* the reportability ledger (UC-OP-A9) with its logged awareness timestamps, and the issue and incident log.
- *Interaction inputs:* escalation notes, challenge records and papers mentioning the same matter, matched by entity, control or theme, with dates.

**2. Baseline creation (evidence)**
- *Expected state:* the logged awareness timestamp is no later than the earliest narrative mention that reasonably suggests the matter.

**3. Dynamic detection (sufficiency)**
- *Cross-domain correlation:* the earliest narrative mention (for example "possible onboarding of restricted customers via partner channel") predates the logged awareness by more than a firm-set number of days. SUP 15.3 runs from "reasonably suggests", not from a completed investigation (C-OP-01).

**4. Distillation (attestation)**
- *Suppressed:* mentions confirmed as unrelated.
- *Ranking inputs:* the gap in days and the number of clocks engaged.
- *Attestation:* SMF16 confirms or rejects the earlier awareness date, with rationale.

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* a ledger row annotated "Logged awareness 14 October 2026; earliest narrative indication 22 September 2026 (second-line challenge record)" `[illustrative]`.
- *Evidence band:* moderate to strong.
- *Recommended action:* propose re-testing the decision with the earlier date, and draft the timeline for the decision record.
- *Human gate:* SMF16. The AI never alters the decision.
- **Hero element:** reportability decision ledger, with an awareness timeline.

**Why it is impossible without the join:** The incident log holds one timestamp; the earlier signal sits in narrative records. Only matching them reveals that the clock started earlier than the log says.

**Why it beats a self-built dashboard:** A dashboard trusts the logged timestamp.

**Differentiation:** Requires the join. Does not exist today.

**Worked example:**
- *Real anchor:* Starling found its VREQ breach on 21 July 2022 and told the FCA on 24 August 2022; the FCA recorded its "disappointment that Starling did not immediately report" (C-OP-02).
- *Illustrative case:* as given in the card above, a 22-day earlier indication `[illustrative]`.

**Regulatory / governance hook:** FCA Principle 11; SUP 15.3.1R ("reasonably suggests"); PRA FR7 (`[unverified]` wording); C-OP-09 decision elements (re-test when facts change).

**Feasibility:**
- *L4:* very high value, but legally sensitive: the product must present it as a prompt to re-test, never as a finding of lateness.
- *L3:* entity matching across notes is moderately hard.
- *L1:* high resonance.
- *L2:* fits.
- *Hardest part:* deciding what counts as "reasonably suggests". That is a human judgement.
- *False-positive risk:* vague early mentions. Mitigation: evidence bands.
- *Disagreement:* L4 is concerned that creating this record could itself become discoverable evidence against the firm; L2 says the regulator will reconstruct the timeline anyway. Unresolved; flagged for legal review.
- **Provenance:** C-OP-01, C-OP-02, C-OP-09.

---

### UC-OP-B8 -- How long does bad news take to reach the board? Escalation latency as a culture KRI

- **Archetype:** Position (culture KRI), with a breach on latency threshold.
- **Bucket:** B (join).
- **Signal:** The median time from the first flag of an issue (in a second-line challenge, an escalation note, an aggregated speak-up theme or an audit finding) to its first mention in BRC or board minutes rises above a threshold.
- **Cadence / trigger:** Quarterly.
- **Primary user → routed exec:** CRO (SMF4) → BRC chair; board.

**1. Data aggregation (requirement)**
- *Substrate inputs:* issues with creation dates and audit findings.
- *Interaction inputs:*
  - escalation notes;
  - second-line challenge records;
  - speak-up cases, aggregated to theme and business area only (volumes, anonymity rate, time to close, retaliation reports, per F-OP-04);
  - BRC and board minutes.

**2. Baseline creation (evidence)**
- *What "normal" is:* the firm's trailing latency distribution by risk category.
- *Expected state:* material issues reach the BRC within a firm-set number of cycles.

**3. Dynamic detection (sufficiency)**
- *Cross-domain correlation:* for each material issue, the first flag date (narrative) is compared with the first BRC or board mention (minutes). Latency is above threshold, or rising quarter on quarter, or the issue is still not mentioned after N cycles.

**4. Distillation (attestation)**
- *Suppressed:* issues resolved below materiality before the next BRC.
- *Ranking inputs:* latency, materiality and repeat themes.
- *Attestation:* the CRO; internal audit validates the method.

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* an escalation latency KRI: "Median 4.6 months from first flag to BRC; 3 material items over 12 months" `[illustrative]`.
- *Evidence band:* moderate.
- *Recommended action:* propose a governance review of the escalation route.
- *Human gate:* the BRC chair.
- **Hero element:** escalation-health index (latency).

**Why it is impossible without the join:** The first flag is narrative and the board's awareness is in the minutes. Without both, "bad news travel time" cannot be measured.

**Why it beats a self-built dashboard:** Speak-up dashboards count cases; issue dashboards count issues. Neither measures how long the news took to reach the board.

**Differentiation:** Requires the join. Does not exist today.

**Worked example:**
- *Real anchor:* at Metro, about two years passed from the first flag to the board (F-OP-04). Staff flagged data gaps in 2017 and 2018, which were not fixed until 2019–2020 (D-OP-04).
- *Illustrative case:* as given in the card above.

**Regulatory / governance hook:** FCA PS25/23 (non-financial misconduct) feeding the SMCR changes (F-OP-04, `[unverified]`); the FCA Final Notice on Metro (November 2024).

**Feasibility:**
- *L4:* speak-up data must stay aggregated, and whistle-blower identity must never be reachable.
- *L1:* very high resonance.
- *L3:* first-flag matching is hard.
- *L2:* the source calls this a culture KRI.
- *Hardest part:* matching issues across records.
- *False-positive risk:* first flags that were not material when raised.
- *Disagreement:* L4 says speak-up should be excluded unless volume is high enough to protect anonymity; L1 wants it included. Kept with a minimum-cohort rule.
- **Provenance:** F-OP-04, D-OP-04, H-OP-03, E-OP-04. `[practice-not-rule]`.

---

### UC-OP-B9 -- Did the board challenge the reds, or just receive data? Board challenge quality versus breach status

- **Archetype:** Silent failure (governance).
- **Bucket:** B (join).
- **Signal:** Metrics in red or outside Consumer Duty tolerance were presented, but the minutes record no challenge, question or decision. Or papers present movements with no explanation ("extensive data without sufficiently explaining").
- **Cadence / trigger:** After each BRC and board; annual Consumer Duty report.
- **Primary user → routed exec:** CRO (SMF4) → BRC chair; board chair.

**1. Data aggregation (requirement)**
- *Substrate inputs:* metric status at the meeting date and outcome tolerance breaches.
- *Interaction inputs:* papers (to check whether each movement is explained) and minutes (to classify recorded challenge: question, challenge, action, decision).

**2. Baseline creation (evidence)**
- *Expected state:* every red item has recorded challenge, and every material movement in a paper has an explanatory sentence.
- *Good practice anchor:* outcome MI, cohort analysis and recorded board challenge (F-OP-01).

**3. Dynamic detection (sufficiency)**
- *Cross-domain correlation:* a red or tolerance breach is present at meeting T, and the T minutes show no challenge for that item; or a paper contains a movement beyond volatility with no explanatory text.

**4. Distillation (attestation)**
- *Suppressed:* items with a waiver.
- *Ranking inputs:* red severity and repeated absence of challenge.
- *Attestation:* the company secretary confirms the minute extraction.

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* a challenge-coverage line: "6 reds presented; 2 with recorded challenge" `[illustrative]`, plus "unexplained movements" flags on draft papers before circulation.
- *Evidence band:* moderate.
- *Recommended action:* propose explanatory text (AI-drafted, marked) and add a challenge prompt to the agenda.
- *Human gate:* the paper author and chair.
- **Hero element:** challenge-coverage line within the escalation-health index.

**Why it is impossible without the join:** Status is substrate; challenge is narrative. Only together do they show governance quality.

**Why it beats a self-built dashboard:** Dashboards present data. They cannot show whether the board engaged with it.

**Differentiation:** Requires the join. Does not exist today.

**Worked example:**
- *Real anchors:*
  - the FCA review of 180 Consumer Duty reports found "action plans without owners, timescales or success metrics";
  - in year 2, some firms "presented extensive data without sufficiently explaining" it (F-OP-01).
- *Illustrative case:* as given in the card above.

**Regulatory / governance hook:** Consumer Duty PRIN 2A annual board report; FCA good and poor practice (24 February 2025; year 2 blog 2026); PRA SS5/16 (`[unverified]`).

**Feasibility:**
- *L1:* sensitive. Boards may not want to be scored.
- *L4:* strong, because the FCA explicitly looks for recorded challenge.
- *L3:* minute classification is feasible.
- *L2:* fits.
- *Hardest part:* minutes summarise discussion.
- *False-positive risk:* challenge made but not minuted. Mitigation: the secretary confirms.
- *Disagreement:* L1 versus L4 on whether this should be shown to the board itself or only to the chair. Kept: the chair sees it.
- **Provenance:** F-OP-01, F-OP-05, A-OP-05.

---

### UC-OP-B10 -- What does the new Final Notice mean for us, and did we act on it? Precedent read-across versus our minutes and controls

- **Archetype:** Chain break (read-across), with precedent linkage.
- **Bucket:** B (join).
- **Signal:** A new Final Notice describes a failure shape that matches our controls (same design, feed or restriction type). Either no read-across is recorded in our minutes, or a read-across was minuted but the matching control test was never run.
- **Cadence / trigger:** Event-driven, on each new Final Notice; quarterly review.
- **Primary user → routed exec:** CRO (SMF4) and the second line → BRC; SMF17.

**1. Data aggregation (requirement)**
- *Substrate inputs:* the control register with design attributes, control tests, and the read-across log.
- *Interaction inputs:*
  - the precedent corpus (real UK Final Notices, posture-tagged; the product owns it);
  - our BRC and ERC minutes and papers (to check whether the notice was discussed and actions recorded).

**2. Baseline creation (evidence)**
- *Expected state:* each relevant notice is matched to our controls, discussed at the BRC within a cycle, and followed by tests of the matched controls.

**3. Dynamic detection (sufficiency)**
- *Cross-domain correlation:* the notice's failure shape matches N of our controls (AI-drafted, human-confirmed). Then either (a) no minute mentions it within a cycle, or (b) a minute records an action, but no control test of the matched controls is logged after the minute date.

**4. Distillation (attestation)**
- *Suppressed:* notices with no matching controls (confirmed by the second line).
- *Ranking inputs:* match strength and how similar the firm's segment is to that of the fined firm.
- *Attestation:* the second line confirms the matching.

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* a read-across prompt: "Nationwide, 12 December 2025 (CDD refresh): 3 matching controls; minuted at BRC on 21 January 2026; 1 of 3 tested since" `[illustrative]`.
- *Evidence band:* strong on test logs; moderate on matching.
- *Recommended action:* propose tests.
- *Human gate:* the second line and BRC.
- **Hero element:** precedent corpus panel (v6) with the read-across prompt.

**Why it is impossible without the join:** Precedent text, our minutes and our control tests sit in three separate places. Only joining them shows "we said we would look, and we did not".

**Why it beats a self-built dashboard:** The FCA cited "numerous published FCA notices" as aggravating factors against Nationwide (H-OP-09). The published record raises expectations, and nobody tracks the follow-through.

**Differentiation:** Requires the join. Does not exist today.

**Worked example:**
- *Real anchors:*
  - Nationwide (12 December 2025, £44,078,500), with the aggravation citing JMLSG guidance and published notices;
  - 13 FCA AML fines on banks since 2021, totalling £300,767,526 (H context);
  - Santander UK (09 December 2022, £107,793,300; more than 560,000 business customers; over £298m passed through before the accounts were closed);
  - Barclays (16 July 2025, £42m).
- *Illustrative case:* as given in the card above.

**Regulatory / governance hook:** H-OP-09 (Linklaters, December 2025); K claim 5 ("published practice and notices ratchet expectations up", `[inference]`).

**Feasibility:**
- *L1:* high resonance ("what does this mean for us?" is board question 9).
- *L2:* the v6 precedent corpus already exists.
- *L3:* matching the failure shape is the hard part.
- *L4:* posture-tag every precedent.
- *Hardest part:* the matching taxonomy.
- *False-positive risk:* over-matching. Mitigation: second-line confirmation.
- *Disagreement:* L3 asks who maintains the corpus. Product-owned, per the boundary.
- **Provenance:** H-OP-01 to H-OP-09, C-OP-08, K claim 5, Synthesis 2, Synthesis 5 (question 9).

---

### UC-OP-B11 -- Is the committee talking about a risk we do not measure? Narrative-first emerging risk

- **Archetype:** Chain break (mapping), raised from the narrative side.
- **Bucket:** B (join).
- **Signal:** A theme recurs across committee minutes, escalation notes or complaint narratives (for example "integration", "AI", "third-party outage"), but it has no emerging-risk entry, no principal-risk mapping and no metric.
- **Cadence / trigger:** Quarterly.
- **Primary user → routed exec:** CRO (SMF4) → BRC.

**1. Data aggregation (requirement)**
- *Substrate inputs:* the emerging risk register, the principal risks and the metric library (UC-OP-A15).
- *Interaction inputs:* theme extraction from minutes, papers, escalation notes and complaint narratives.

**2. Baseline creation (evidence)**
- *What "normal" is:* theme frequency over the trailing 4 quarters.

**3. Dynamic detection (sufficiency)**
- *Cross-domain correlation:* the theme frequency rises across at least two narrative sources while no register entry or metric covers the theme.

**4. Distillation (attestation)**
- *Suppressed:* themes already on the register.
- *Ranking inputs:* breadth across sources and the trend.
- *Attestation:* the CRO.

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* an emerging overlay candidate: "'Agentic payments' mentioned in 5 papers and 2 escalation notes this quarter; not on the register" `[illustrative]`.
- *Evidence band:* indicative to moderate.
- *Recommended action:* propose a register entry with a mapping and horizon.
- *Human gate:* the CRO and BRC.
- **Hero element:** top and emerging risk overlay (candidate band).

**Why it is impossible without the join:** The register is what the firm has decided to watch; narrative is what it is actually worried about. Only the gap between them reveals unregistered risk.

**Why it beats a self-built dashboard:** A dashboard only knows registered risks.

**Differentiation:** Requires the join. Does not exist today.

**Worked example:**
- *Real anchors:*
  - Leeds lists AI among emerging risks, and Nationwide lists "emergent technology" (B-OP-01);
  - the FCA will become "ultimately agentic", and an FCA and Bank of England survey shows 86% of firms using AI (19 October 2026, I-OP-01, `[single]`).
- *Illustrative case:* as given in the card above.

**Regulatory / governance hook:** the FSB RAF (A-OP-01); emerging risk disclosure practice (B-OP-01, `[unverified]`).

**Feasibility:**
- *L3:* topic extraction is easy.
- *L1:* moderate resonance.
- *L2:* fits.
- *L4:* low risk.
- *Hardest part:* separating themes from noise.
- *False-positive risk:* high for buzzwords.
- *Disagreement:* L1 calls it nice-to-have.
- **Provenance:** B-OP-01, I-OP-01. `[long-tail -- preserve]`.

---

### UC-OP-B12 -- Was second-line challenge overruled before the breach? Challenge records versus later outcomes

- **Archetype:** Silent failure (challenge effectiveness).
- **Bucket:** B (join).
- **Signal:** A second-line challenge on a metric, control or initiative was recorded and then closed or overruled without action, and the related metric later breached.
- **Cadence / trigger:** Quarterly look-back; event-driven on a breach.
- **Primary user → routed exec:** CRO (SMF4) → BRC chair; Head of Internal Audit (SMF5).

**1. Data aggregation (requirement)**
- *Substrate inputs:* metric breaches and the issue log.
- *Interaction inputs:* second-line challenge records (topic, date, outcome: accepted, partially accepted, overruled), and minutes recording the resolution.

**2. Baseline creation (evidence)**
- *What "normal" is:* challenge acceptance rate by business area, and breach rate following overruled versus accepted challenges.

**3. Dynamic detection (sufficiency)**
- *Cross-domain correlation:* the challenge on topic X was overruled at T0, and a related metric breached at T1 (within a firm-set window); or a business area has an overrule rate far above the firm average.
- *Where challenge is missing altogether:* the source says to show where second-line challenge is missing (E-OP-01).

**4. Distillation (attestation)**
- *Suppressed:* overruled challenges where no related breach followed and the window has expired.
- *Ranking inputs:* breach severity and time from overrule to breach.
- *Attestation:* internal audit validates the method.

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* a challenge-effectiveness line: "Of 14 overruled challenges, 3 preceded a breach within 6 months" `[illustrative]`.
- *Evidence band:* moderate, because the topic link is inferred.
- *Recommended action:* propose a BRC review.
- *Human gate:* the BRC chair.
- **Hero element:** escalation-health index (challenge).

**Why it is impossible without the join:** Challenge outcomes are narrative records; breaches are metrics. Only the time-aligned join shows that a warning was given and set aside.

**Why it beats a self-built dashboard:** A dashboard counts challenges. It cannot show which ones were right.

**Differentiation:** Requires the join. Does not exist today.

**Worked example:**
- *Real anchor:* Starling's Final Notice found all three lines "inadequate in their oversight", and its third line "was unaware of the VREQ until late 2022" (E-OP-01).
- *Illustrative case:* as given in the card above.

**Regulatory / governance hook:** IIA Three Lines Model (July 2020, `[unverified]` text); Starling Final Notice, 27 September 2024; SMCR "reasonable steps".

**Feasibility:**
- *L2:* strong, because it vindicates the second line.
- *L3 (first line):* will push back hard.
- *L1:* high resonance.
- *L4:* sensitive. Never present it as attributing blame to individuals.
- *Hardest part:* the topic link between challenge and breach.
- *False-positive risk:* coincidental breaches.
- *Disagreement:* L3 versus L2 on fairness. Kept at business-area level.
- **Provenance:** E-OP-01, E-OP-02. `[long-tail -- preserve]`.

---

### UC-OP-B13 -- Can each SMF evidence "reasonable steps" for what they own? SoR-mapped red items versus minutes and attestations

- **Archetype:** Chain break (owner engagement).
- **Bucket:** B (join).
- **Signal:** An SMF's mapped metrics, restrictions or issues were in red or breach during a period, and there is no record of that SMF acting on them: no minute, attestation, escalation note or decision.
- **Cadence / trigger:** Quarterly; ahead of annual fitness and propriety reviews (firm practice).
- **Primary user → routed exec:** CRO (SMF4) → each SMF (for their own pack); CEO; BRC chair.

**1. Data aggregation (requirement)**
- *Substrate inputs:* the SoR-to-node bindings (UC-OP-A7) and the status history of mapped nodes.
- *Interaction inputs:* minutes attributing actions to SMFs, attestation records, escalation notes and decision records.

**2. Baseline creation (evidence)**
- *Expected state:* for each red period on a mapped node, there is at least one recorded step by the accountable SMF.

**3. Dynamic detection (sufficiency)**
- *Cross-domain correlation:* the node was red during period P and no narrative record attributes any step to the SMF during P.

**4. Distillation (attestation)**
- *Suppressed:* nodes with delegated actions properly recorded.
- *Ranking inputs:* severity and duration.
- *Attestation:* the SMF reviews and adds evidence. The pack is the SMF's own.

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* a private "reasonable steps" evidence pack for each SMF, showing coverage and gaps. The board sees only aggregate coverage.
- *Evidence band:* strong where the narrative is absent.
- *Recommended action:* the SMF adds evidence or takes action.
- *Draft artifact:* the reasonable-steps evidence pack.
- *Human gate:* the SMF.
- **Hero element:** chain-integrity badge (owner) with an evidence drawer.

**Why it is impossible without the join:** The SoR says who is accountable; the metrics say when something was wrong; only the narrative says whether the accountable person did anything.

**Why it beats a self-built dashboard:** SMCR tools store SoRs, not evidence of steps taken against live metrics.

**Differentiation:** Requires the join. Does not exist today.

**Worked example:**
- *Real anchor:* at Starling there was "no single person with sufficient authority and oversight" for the VREQ (D-OP-01). The six-monthly SMF "reasonable steps" attestations are internal firm practice (D-OP-03).
- *Illustrative case:* SMF17's mapped node "screening coverage" was amber or red for 3 months; one minute and one attestation reference it; there is no decision record `[illustrative]`.

**Regulatory / governance hook:** Duty of Responsibility (FSMA s66A/66B, "reasonable steps", section numbers `[unverified]`); SMCR Phase 1 (April 2026); attestation cycles `[practice-not-rule]`.

**Feasibility:**
- *L4:* very sensitive, because the pack could become evidence. It must be framed as the SMF's own tool.
- *L1:* the board chair wants aggregate coverage.
- *L3:* SMFs may resist.
- *L2:* fits.
- *Hardest part:* attributing actions in minutes.
- *False-positive risk:* delegated actions not recorded.
- *Disagreement:* L4 says create it only with legal sign-off; L2 says "reasonable steps" are evidenced either way. Unresolved; flagged.
- **Provenance:** D-OP-01, D-OP-02, D-OP-03, D-OP-05. `[long-tail -- preserve]`.

---

### UC-OP-B14 -- Does the change approved in committee match what was deployed? Model risk minutes versus the parameter log

- **Archetype:** Chain break (change), from the narrative side.
- **Bucket:** B (join).
- **Signal:** The model risk or change committee minutes approve a parameter or threshold change at value X, and the deployed configuration shows value Y, or a deployment happens before the approval date.
- **Cadence / trigger:** Event-driven, on deployment; monthly.
- **Primary user → routed exec:** CRO (SMF4) → model risk (second line); CTO; risk owner.

**1. Data aggregation (requirement)**
- *Substrate inputs:* configuration snapshots and deployment logs (UC-OP-A8); the model inventory.
- *Interaction inputs:* model risk committee and change advisory minutes, with approved values and dates extracted.

**2. Baseline creation (evidence)**
- *Expected state:* deployed value equals approved value, and the deployment date falls after the approval date.

**3. Dynamic detection (sufficiency)**
- *Cross-domain correlation:* deployed and approved values or dates mismatch, or a deployment has no matching approval minute.

**4. Distillation (attestation)**
- *Suppressed:* exact matches.
- *Ranking inputs:* model tier and the size of the mismatch.
- *Attestation:* the model risk validator.

**5. Surfacing and routing (gap / escalation)**
- *What the exec sees:* the change-lineage drawer, showing "approved 7,500; deployed 9,500" `[illustrative]`.
- *Evidence band:* strong.
- *Recommended action:* propose a rollback review.
- *Human gate:* the risk owner.
- **Hero element:** change-lineage drawer.

**Why it is impossible without the join:** The approval exists only in minutes, and the deployed value only in configuration. Neither alone shows the gap.

**Why it beats a self-built dashboard:** Change tools record tickets, not committee decisions.

**Differentiation:** Requires the join. Does not exist today.

**Worked example:**
- *Real anchor:* PRA SS1/23 change control (17 May 2023, effective 17 May 2024). Principality adopted SS1/23 in 2024 (I-OP-09).
- *Illustrative case:* as given in the card above.

**Regulatory / governance hook:** PRA SS1/23; product boundary (never re-tune).

**Feasibility:**
- *L3:* feasible where minutes record values.
- *L4:* strong.
- *L2:* fits.
- *L1:* low resonance.
- *Hardest part:* minutes rarely record exact values.
- *False-positive risk:* low.
- *Disagreement:* L1 calls it control-level detail that does not belong at board altitude. Kept as a drill only.
- **Provenance:** I-OP-09, D-OP-04. `[long-tail -- preserve]`.

---
## Panel Notes

### Sharpest disagreements (surfaced, not averaged)

1. **Attestation: evidence or rubber stamp?** (UC-OP-A6, UC-OP-B4, UC-OP-B13)
   - *L3 (first-line owner):* monthly and six-monthly attestations become box-ticking, add load, and risk killing adoption ("the product dies if it is seen as a burden", J-OP-04).
   - *L4 (enforcement adviser):* attestations evidence "reasonable steps" (D-OP-05).
   - *L2 (CRO):* the resolution in the source is to attest to a specific reconciliation result, not a bare value.
   - *Unresolved:* whether the join cards that score attestation quality (B4) and SMF steps (B13) help owners or expose them. L4 also warns that a reasonable-steps pack and an earlier-awareness timeline (B7) may themselves become discoverable evidence. **Legal review required before demo.**

2. **How many headline metrics, and who decides?** (UC-OP-A1, UC-OP-A2; A-OP-06)
   - *L1 (NED):* wants about 12.
   - *L2 (CRO):* wants 12–15 with drill-down.
   - *The source:* no FSB, PRA or FCA text sets a number, and 7–10 principal risks imply roughly 10–30 Level 1 metrics `[conflict]`.
   - *Related:* L1 also wants a single "headroom used" number per initiative, while L2 insists on a range with denominator and stress capacity.
   - *Product position:* configurable cap (default 12), labelled practice. The demo default is still to be chosen.

3. **Should the product measure board and committee behaviour?** (UC-OP-B1, UC-OP-B3, UC-OP-B9, UC-OP-B12)
   - *L1 (NED / BRC chair):* the most valuable signal is whether bad news is reaching them.
   - *Also L1:* scoring the board's own challenge or attention (B9, B3) will be resisted.
   - *L3:* minutes are drafted to be brief, so absence of a mention is not proof of absence of discussion.
   - *L4:* the FCA explicitly looks for recorded challenge (F-OP-01).
   - *Working compromise:* evidence bands; secretary confirmation; challenge coverage shown to the chair rather than the full board; second-line challenge effectiveness (B12) shown only at business-area level.

4. **Vertical SMCR accountability versus horizontal journey ownership.** (UC-OP-A7, UC-OP-B6)
   - *L2:* one SMF per node.
   - *L3:* real failures sit on handoffs between functions, and journey owners see outcomes that function owners do not (D-OP-04, F-OP-03).
   - *Unresolved:* whether the cascade graph carries two owner types per node (vertical SMF and horizontal journey owner) or forces one.

*Also noted (fifth, lower-stakes):*
- The agentic-AI module (UC-OP-A17): L2 wants the mandate data model built now; L1 and the source say not to demo it before UK rules exist (Mills Review is recommendations only).
- Receiving-PSP APP exposure (UC-OP-A18): L4 warns that the source's "P&L" framing risks a cost lens on financial crime.

### Five strongest UI candidates

1. **Restriction adherence test with flag-versus-population divergence**, plus the narrative balance strip (UC-OP-A4 + UC-OP-B3). This is the source's anchor failure (Starling's 54,359 accounts; the 309 found later) and the third proposed demo beat. It hands off straight into the reportability ledger.
2. **Chain-integrity badge that overrides status** (feed, owner, attestation, mapping, change) on every headline (UC-OP-A6, A7, A3, A11, A8). "Within appetite" becomes "unverified: 1.1m of 18.4m transactions not monitored (6.0%)" `[illustrative]`. This is the Metro and Starling shape and the second proposed demo beat. It is also the honesty line that every board figure needs.
3. **Strategy strip with headroom gauge and growth-versus-capacity pairing** (UC-OP-A1 + UC-OP-A5). This tells the "risk as a strategic lever" story, anchored in Coventry's +43% lending growth (A-OP-08) and Starling's 43,000 → 3.6m customers. It is the first proposed demo beat.
4. **Reportability decision ledger with an awareness timeline** (UC-OP-A9 + UC-OP-B7). It covers multiple clocks (SUP 15.3, FR7, SAR in a restricted workflow, PS26/2 from 18 March 2027) and anchors on "reasonably suggests" and Starling's 34-day gap. The AI prepares; a named SMF decides; dissent is recorded.
5. **Escalation-health index** (UC-OP-B1, B2, B8, B9, B12). It covers:
   - persistent amber with no minuted decision;
   - cross-forum figure mismatches;
   - bad-news travel time (the Metro case of about two years);
   - challenge coverage.
   This is the BRC chair's view and the purest expression of the join.

*Runner-up:* tension register and guardrail pair (UC-OP-B5). The source found no published method or vendor feature (G-OP-03), and J-OP-05 shows "Tension: No" across incumbents.

### Recall note -- OP-distinctive items to preserve at merge

- **Zero-tolerance proxy rule** (UC-OP-A3): every zero-appetite statement must carry a coverage or completeness proxy. The anchor is Starling's screening against "a fraction of the names on the Consolidated List", 2017 to January 2023. `[single]` as an explicit panel view.
- **Calibration audit**: amber bands narrower than the metric's volatility, and green-to-red jumps treated as calibration failures, not just risk events (UC-OP-A2; A-OP-05; CRO question 3).
- **Restriction narrative imbalance** (UC-OP-B3): MI focused on "how the VREQ could be reduced or removed" while the population test fails (G-OP-02). This is a distinct join.
- **Awareness backdating** (UC-OP-B7): the earliest narrative "reasonably suggests" mention compared with the logged awareness timestamp. Flagged for legal sensitivity.
- **Attestation timestamp order** (UC-OP-B4): an attestation submitted before the reconciliation it attests had run.
- **Approved versus deployed parameter value** (UC-OP-B14) and **change without risk-owner approval** (UC-OP-A8). The Starling engineers anchor ("not informed of the existence of the VREQ") together with SS1/23.
- **SMF "reasonable steps" evidence pack** (UC-OP-B13), as a private pack for each SMF. `[long-tail -- preserve]`.
- **Second-line challenge overruled before a breach** (UC-OP-B12). `[long-tail -- preserve]`.
- **Conduct Rule notification timers linked to HR outcomes** (UC-OP-A16). Timers `[unverified]`. `[long-tail -- preserve]`.
- **PS26/2 and PS7/26 readiness back-test** (UC-OP-A14), with the fixed date 18 March 2027 as a buying trigger. Includes the TSB anchor (20 December 2022, £48,650,000).
- **Receiving-PSP APP exposure as a financial crime appetite metric** (UC-OP-A18), with reimbursement figures `[conflict]` (88%/£173m; 89%/£243m; £576.4m losses; 21–94% range). Never framed as cost.
- **Agent mandate perimeter** (UC-OP-A17), positioned as a 2027–2028 second module, not the lead. Includes the US bank stances (October 2026) and the authorised-versus-unauthorised liability question.
- **Narrative-first emerging risk** (UC-OP-B11). `[long-tail -- preserve]`.
- **OP-specific source facts to carry forward to merge:**
  - Starling: VREQ breach found 21 July 2022, notified 24 August 2022; s166 on 28 May 2021; VREQ on 17 September 2021; 49,183 high-risk customers; fine £28,959,426 (£40,959,426 before discount); daily testing from 17 January 2023; automated daily controls by 31 May 2023.
  - Monzo: £21,091,300; VREQ August 2020 to February 2025; `[conflict]` 34,000+ versus 26,325 accounts.
  - Metro: FCA £16,675,200 (more than 60m transactions, £51bn); PRA £5,376,000 (21 December 2021, COREP); 153 SARs.
  - Nationwide: £44,078,500; £26.01m furlough fraud in 8 days.
  - Santander: £107,793,300 (more than 560,000 customers; over £298m).
  - Barclays: £42m (£3.09m WealthTek; £39.3m Stunt & Co).
  - 13 AML fines since 2021, totalling £300,767,526.
  - Coventry: +43% lending to £9.6bn; LTV 67%; arrears 0.38%.
  - Handbook Notice 139 (SUP 15.18 and 15.19) `[single]`.
- **Claims the OP source debunks** (carry as labels, not rules):
  - the 10–12 metric cap;
  - six-monthly SMF certification to the regulator;
  - "about 25%" market share (savings 23%, mortgages 29%, gross lending 32%, net lending 52%);
  - "JPMorgan and Citi ban agents" (true only for third-party agents);
  - 12–18 months to build a board framework (unverifiable);
  - latency from 30 minutes to under 20 seconds (unverifiable, `[marketing-grade]`).
- **Items tagged `[NEW -- beyond file]` in this catalogue:**
  - the seasonal-profile detail in UC-OP-A1;
  - SMF24 routing in UC-OP-A14;
  - the SS3/19 climate framing in UC-OP-A15 (from the brand rules, not the OP source).
